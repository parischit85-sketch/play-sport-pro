/**
 * Backup Service
 * Automated Firestore backup and restore functionality
 * 
 * Features:
 * - Manual backup (download as JSON)
 * - Scheduled auto-backup (Cloud Functions)
 * - Restore from backup file
 * - Version history tracking
 * - Collection selection
 * - Data validation
 * - Progress tracking
 * - Metadata preservation
 */

import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  writeBatch,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { db, analytics } from '@config/firebase';
import { logEvent } from 'firebase/analytics';

// Backup configuration
export const BACKUP_CONFIG = {
  // Collections to backup
  COLLECTIONS: [
    'users',
    'clubs',
    'courts',
    'bookings',
    'notifications',
    'tournaments',
    'matches',
    'settings',
  ],
  
  // Max backup size (MB)
  MAX_SIZE_MB: 100,
  
  // Auto-backup schedule (for Cloud Functions)
  SCHEDULE: {
    daily: 'every 24 hours at 03:00',
    weekly: 'every sunday 03:00',
    monthly: 'every month 1 03:00',
  },
  
  // Retention policy
  RETENTION: {
    daily: 7,    // Keep 7 daily backups
    weekly: 4,   // Keep 4 weekly backups
    monthly: 12, // Keep 12 monthly backups
  },
};

/**
 * BackupService Class
 * Manages all backup and restore operations
 */
class BackupService {
  constructor() {
    this.isBackingUp = false;
    this.isRestoring = false;
    this.progress = {
      current: 0,
      total: 0,
      status: '',
    };
  }

  /**
   * Create manual backup
   * @param {Array} collections - Collections to backup (default: all)
   * @param {Function} onProgress - Progress callback
   * @returns {Object} Backup data
   */
  async createBackup(collections = BACKUP_CONFIG.COLLECTIONS, onProgress = null) {
    if (this.isBackingUp) {
      throw new Error('Backup already in progress');
    }

    this.isBackingUp = true;
    const startTime = Date.now();

    try {
      const backup = {
        metadata: {
          version: '1.0',
          timestamp: new Date().toISOString(),
          collections: collections,
          appVersion: '1.0.0', // From package.json
          source: 'manual',
        },
        data: {},
      };

      this.progress.total = collections.length;
      this.progress.current = 0;

      // Export each collection
      for (const collectionName of collections) {
        this.progress.status = `Exporting ${collectionName}...`;
        this.progress.current++;
        
        if (onProgress) {
          onProgress({
            collection: collectionName,
            progress: Math.round((this.progress.current / this.progress.total) * 100),
          });
        }

        const collectionData = await this.exportCollection(collectionName);
        backup.data[collectionName] = collectionData;
      }

      const duration = Date.now() - startTime;
      backup.metadata.duration = duration;
      backup.metadata.size = this.calculateBackupSize(backup);

      // Save backup metadata to Firestore
      await this.saveBackupMetadata(backup.metadata);

      // Log analytics
      if (analytics) {
        logEvent(analytics, 'backup_created', {
          collections: collections.length,
          size: backup.metadata.size,
          duration,
        });
      }

      return backup;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    } finally {
      this.isBackingUp = false;
      this.progress = { current: 0, total: 0, status: '' };
    }
  }

  /**
   * Export single collection
   */
  async exportCollection(collectionName) {
    try {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);

      const documents = {};
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        
        // Convert Firestore Timestamps to ISO strings
        const serializedData = this.serializeData(data);
        
        documents[docSnap.id] = serializedData;
      });

      return {
        count: snapshot.size,
        documents,
      };
    } catch (error) {
      console.error(`Error exporting collection ${collectionName}:`, error);
      return {
        count: 0,
        documents: {},
        error: error.message,
      };
    }
  }

  /**
   * Serialize Firestore data (convert Timestamps, etc.)
   */
  serializeData(data) {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle Timestamp objects
    if (data?.toDate) {
      return data.toDate().toISOString();
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.serializeData(item));
    }

    // Handle objects
    if (typeof data === 'object') {
      const serialized = {};
      for (const [key, value] of Object.entries(data)) {
        serialized[key] = this.serializeData(value);
      }
      return serialized;
    }

    return data;
  }

  /**
   * Deserialize data for restore (convert ISO strings back to Timestamps)
   */
  deserializeData(data) {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle ISO date strings
    if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(data)) {
      return new Date(data);
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.deserializeData(item));
    }

    // Handle objects
    if (typeof data === 'object') {
      const deserialized = {};
      for (const [key, value] of Object.entries(data)) {
        deserialized[key] = this.deserializeData(value);
      }
      return deserialized;
    }

    return data;
  }

  /**
   * Calculate backup size (approximate)
   */
  calculateBackupSize(backup) {
    const jsonString = JSON.stringify(backup);
    const bytes = new Blob([jsonString]).size;
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    return parseFloat(mb);
  }

  /**
   * Save backup metadata to Firestore
   */
  async saveBackupMetadata(metadata) {
    try {
      const backupMetaRef = collection(db, 'backupHistory');
      await setDoc(doc(backupMetaRef), {
        ...metadata,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving backup metadata:', error);
    }
  }

  /**
   * Download backup as JSON file
   */
  downloadBackup(backup, filename = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultFilename = `play-sport-backup-${timestamp}.json`;
    
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);

    // Log analytics
    if (analytics) {
      logEvent(analytics, 'backup_downloaded', {
        filename: link.download,
        size: backup.metadata.size,
      });
    }
  }

  /**
   * Restore from backup file
   */
  async restoreFromBackup(backupData, options = {}) {
    if (this.isRestoring) {
      throw new Error('Restore already in progress');
    }

    this.isRestoring = true;
    const startTime = Date.now();

    try {
      // Validate backup format
      this.validateBackup(backupData);

      const {
        collections = Object.keys(backupData.data),
        overwrite = false,
        onProgress = null,
      } = options;

      this.progress.total = collections.length;
      this.progress.current = 0;

      const results = {
        success: [],
        failed: [],
        skipped: [],
      };

      // Restore each collection
      for (const collectionName of collections) {
        this.progress.status = `Restoring ${collectionName}...`;
        this.progress.current++;
        
        if (onProgress) {
          onProgress({
            collection: collectionName,
            progress: Math.round((this.progress.current / this.progress.total) * 100),
          });
        }

        try {
          if (!backupData.data[collectionName]) {
            results.skipped.push(collectionName);
            continue;
          }

          await this.restoreCollection(
            collectionName,
            backupData.data[collectionName],
            overwrite
          );

          results.success.push(collectionName);
        } catch (error) {
          console.error(`Error restoring ${collectionName}:`, error);
          results.failed.push({
            collection: collectionName,
            error: error.message,
          });
        }
      }

      const duration = Date.now() - startTime;

      // Log analytics
      if (analytics) {
        logEvent(analytics, 'backup_restored', {
          collections: results.success.length,
          duration,
          failed: results.failed.length,
        });
      }

      // Save restore metadata
      await this.saveRestoreMetadata({
        backupTimestamp: backupData.metadata.timestamp,
        restoredAt: new Date().toISOString(),
        collections: results.success,
        duration,
      });

      return results;
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    } finally {
      this.isRestoring = false;
      this.progress = { current: 0, total: 0, status: '' };
    }
  }

  /**
   * Restore single collection
   */
  async restoreCollection(collectionName, collectionData, overwrite = false) {
    const { documents } = collectionData;
    
    if (!documents || Object.keys(documents).length === 0) {
      return;
    }

    // Use batched writes (max 500 per batch)
    const batch = writeBatch(db);
    let operationCount = 0;
    const batches = [];

    for (const [docId, docData] of Object.entries(documents)) {
      const docRef = doc(db, collectionName, docId);
      
      // Deserialize data
      const deserializedData = this.deserializeData(docData);
      
      batch.set(docRef, deserializedData, { merge: !overwrite });
      operationCount++;

      // Commit batch every 500 operations
      if (operationCount >= 500) {
        batches.push(batch.commit());
        operationCount = 0;
      }
    }

    // Commit remaining operations
    if (operationCount > 0) {
      batches.push(batch.commit());
    }

    // Wait for all batches to complete
    await Promise.all(batches);
  }

  /**
   * Validate backup format
   */
  validateBackup(backup) {
    if (!backup) {
      throw new Error('Invalid backup: empty data');
    }

    if (!backup.metadata) {
      throw new Error('Invalid backup: missing metadata');
    }

    if (!backup.data) {
      throw new Error('Invalid backup: missing data');
    }

    if (!backup.metadata.version) {
      throw new Error('Invalid backup: missing version');
    }

    // Check size limit
    const size = this.calculateBackupSize(backup);
    if (size > BACKUP_CONFIG.MAX_SIZE_MB) {
      throw new Error(
        `Backup too large: ${size}MB (max ${BACKUP_CONFIG.MAX_SIZE_MB}MB)`
      );
    }

    return true;
  }

  /**
   * Save restore metadata
   */
  async saveRestoreMetadata(metadata) {
    try {
      const restoreMetaRef = collection(db, 'restoreHistory');
      await setDoc(doc(restoreMetaRef), {
        ...metadata,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving restore metadata:', error);
    }
  }

  /**
   * Get backup history
   */
  async getBackupHistory(limit = 20) {
    try {
      const backupHistoryRef = collection(db, 'backupHistory');
      const q = query(
        backupHistoryRef,
        orderBy('createdAt', 'desc'),
        firestoreLimit(limit)
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
      }));
    } catch (error) {
      console.error('Error getting backup history:', error);
      return [];
    }
  }

  /**
   * Get restore history
   */
  async getRestoreHistory(limit = 20) {
    try {
      const restoreHistoryRef = collection(db, 'restoreHistory');
      const q = query(
        restoreHistoryRef,
        orderBy('createdAt', 'desc'),
        firestoreLimit(limit)
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
      }));
    } catch (error) {
      console.error('Error getting restore history:', error);
      return [];
    }
  }

  /**
   * Get current progress
   */
  getProgress() {
    return {
      ...this.progress,
      percentage: this.progress.total > 0 
        ? Math.round((this.progress.current / this.progress.total) * 100)
        : 0,
    };
  }

  /**
   * Parse uploaded backup file
   */
  async parseBackupFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const backup = JSON.parse(event.target.result);
          this.validateBackup(backup);
          resolve(backup);
        } catch (error) {
          reject(new Error(`Invalid backup file: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read backup file'));
      };

      reader.readAsText(file);
    });
  }
}

// Singleton instance
const backupService = new BackupService();

export default backupService;
