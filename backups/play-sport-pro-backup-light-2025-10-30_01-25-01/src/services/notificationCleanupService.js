/**
 * @fileoverview NotificationCleanupService - Cleanup automatico subscriptions e dati obsoleti
 *
 * Features:
 * - Cleanup subscriptions scadute (410 Gone)
 * - Cleanup eventi vecchi (> 90 giorni)
 * - Cleanup scheduled notifications fallite/obsolete
 * - Batch operations per performance
 * - Scheduled cron jobs
 * - Statistiche cleanup
 *
 * @author Play Sport Pro Team
 * @version 2.0.0
 * @since Phase 5
 */

import { db } from '@/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  writeBatch,
  Timestamp,
  limit,
  orderBy,
} from 'firebase/firestore';

/**
 * NotificationCleanupService - Gestione cleanup automatico
 */
class NotificationCleanupService {
  constructor() {
    this.batchSize = 500; // Max 500 docs per batch (Firestore limit)
    this.retentionDays = {
      events: 90, // Eventi analytics: 90 giorni
      scheduled: 30, // Notifiche scheduled: 30 giorni
      deliveries: 60, // Delivery logs: 60 giorni
      expiredSubscriptions: 7, // Subscriptions scadute: 7 giorni buffer
    };

    this.stats = {
      subscriptionsDeleted: 0,
      eventsDeleted: 0,
      scheduledDeleted: 0,
      deliveriesDeleted: 0,
      totalCleaned: 0,
    };
  }

  /**
   * Run full cleanup (tutti i job)
   */
  async runFullCleanup() {
    console.log('🧹 Starting full cleanup...');
    const startTime = Date.now();

    try {
      // 1. Cleanup expired subscriptions
      await this.cleanupExpiredSubscriptions();

      // 2. Cleanup old events
      await this.cleanupOldEvents();

      // 3. Cleanup old scheduled notifications
      await this.cleanupOldScheduledNotifications();

      // 4. Cleanup old delivery logs
      await this.cleanupOldDeliveryLogs();

      // 5. Cleanup orphaned data
      await this.cleanupOrphanedData();

      const duration = Date.now() - startTime;

      console.log(`✅ Full cleanup completed in ${duration}ms`);
      console.log('📊 Cleanup Stats:', this.stats);

      return {
        success: true,
        duration,
        stats: { ...this.stats },
      };
    } catch (error) {
      console.error('❌ Full cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Cleanup expired push subscriptions
   */
  async cleanupExpiredSubscriptions() {
    console.log('🧹 Cleaning up expired subscriptions...');

    try {
      const subscriptionsRef = collection(db, 'pushSubscriptions');

      // Query subscriptions marcate come expired
      const q = query(subscriptionsRef, where('status', '==', 'expired'), limit(this.batchSize));

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('✅ No expired subscriptions to clean');
        return 0;
      }

      // Batch delete
      let deletedCount = 0;
      const batchOperations = [];
      let currentBatch = writeBatch(db);
      let operationCount = 0;

      snapshot.docs.forEach((docSnapshot) => {
        currentBatch.delete(docSnapshot.ref);
        operationCount++;
        deletedCount++;

        // Firestore batch limit: 500 operations
        if (operationCount >= 500) {
          batchOperations.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          operationCount = 0;
        }
      });

      // Commit remaining batch
      if (operationCount > 0) {
        batchOperations.push(currentBatch.commit());
      }

      await Promise.all(batchOperations);

      this.stats.subscriptionsDeleted = deletedCount;
      this.stats.totalCleaned += deletedCount;

      console.log(`✅ Deleted ${deletedCount} expired subscriptions`);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired subscriptions:', error);
      throw error;
    }
  }

  /**
   * Cleanup old notification events (> retention period)
   */
  async cleanupOldEvents() {
    console.log('🧹 Cleaning up old events...');

    try {
      const eventsRef = collection(db, 'notificationEvents');
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays.events);

      const q = query(
        eventsRef,
        where('timestamp', '<', Timestamp.fromDate(cutoffDate)),
        orderBy('timestamp'),
        limit(this.batchSize)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('✅ No old events to clean');
        return 0;
      }

      // Batch delete
      let deletedCount = 0;
      const batchOperations = [];
      let currentBatch = writeBatch(db);
      let operationCount = 0;

      snapshot.docs.forEach((docSnapshot) => {
        currentBatch.delete(docSnapshot.ref);
        operationCount++;
        deletedCount++;

        if (operationCount >= 500) {
          batchOperations.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          operationCount = 0;
        }
      });

      if (operationCount > 0) {
        batchOperations.push(currentBatch.commit());
      }

      await Promise.all(batchOperations);

      this.stats.eventsDeleted = deletedCount;
      this.stats.totalCleaned += deletedCount;

      console.log(`✅ Deleted ${deletedCount} old events (> ${this.retentionDays.events} days)`);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old events:', error);
      throw error;
    }
  }

  /**
   * Cleanup old scheduled notifications
   */
  async cleanupOldScheduledNotifications() {
    console.log('🧹 Cleaning up old scheduled notifications...');

    try {
      const scheduledRef = collection(db, 'scheduledNotifications');
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays.scheduled);

      // Query notifiche sent/failed/cancelled vecchie
      const q = query(
        scheduledRef,
        where('status', 'in', ['sent', 'failed', 'cancelled']),
        where('scheduledAt', '<', Timestamp.fromDate(cutoffDate)),
        limit(this.batchSize)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('✅ No old scheduled notifications to clean');
        return 0;
      }

      // Batch delete
      let deletedCount = 0;
      const batchOperations = [];
      let currentBatch = writeBatch(db);
      let operationCount = 0;

      snapshot.docs.forEach((docSnapshot) => {
        currentBatch.delete(docSnapshot.ref);
        operationCount++;
        deletedCount++;

        if (operationCount >= 500) {
          batchOperations.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          operationCount = 0;
        }
      });

      if (operationCount > 0) {
        batchOperations.push(currentBatch.commit());
      }

      await Promise.all(batchOperations);

      this.stats.scheduledDeleted = deletedCount;
      this.stats.totalCleaned += deletedCount;

      console.log(
        `✅ Deleted ${deletedCount} old scheduled notifications (> ${this.retentionDays.scheduled} days)`
      );
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old scheduled notifications:', error);
      throw error;
    }
  }

  /**
   * Cleanup old delivery logs
   */
  async cleanupOldDeliveryLogs() {
    console.log('🧹 Cleaning up old delivery logs...');

    try {
      const deliveriesRef = collection(db, 'notificationDeliveries');
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays.deliveries);

      const q = query(
        deliveriesRef,
        where('timestamp', '<', Timestamp.fromDate(cutoffDate)),
        orderBy('timestamp'),
        limit(this.batchSize)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('✅ No old delivery logs to clean');
        return 0;
      }

      // Batch delete
      let deletedCount = 0;
      const batchOperations = [];
      let currentBatch = writeBatch(db);
      let operationCount = 0;

      snapshot.docs.forEach((docSnapshot) => {
        currentBatch.delete(docSnapshot.ref);
        operationCount++;
        deletedCount++;

        if (operationCount >= 500) {
          batchOperations.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          operationCount = 0;
        }
      });

      if (operationCount > 0) {
        batchOperations.push(currentBatch.commit());
      }

      await Promise.all(batchOperations);

      this.stats.deliveriesDeleted = deletedCount;
      this.stats.totalCleaned += deletedCount;

      console.log(
        `✅ Deleted ${deletedCount} old delivery logs (> ${this.retentionDays.deliveries} days)`
      );
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old delivery logs:', error);
      throw error;
    }
  }

  /**
   * Cleanup orphaned data (subscriptions senza user, etc.)
   */
  async cleanupOrphanedData() {
    console.log('🧹 Cleaning up orphaned data...');

    try {
      const subscriptionsRef = collection(db, 'pushSubscriptions');
      const usersRef = collection(db, 'users');

      // Get all subscriptions
      const subscriptionsSnapshot = await getDocs(query(subscriptionsRef, limit(1000)));

      if (subscriptionsSnapshot.empty) {
        console.log('✅ No subscriptions to check');
        return 0;
      }

      let deletedCount = 0;
      const batchOperations = [];
      let currentBatch = writeBatch(db);
      let operationCount = 0;

      // Check each subscription for orphaned status
      for (const subDoc of subscriptionsSnapshot.docs) {
        const subscription = subDoc.data();

        // Check if user exists
        const userDoc = await getDocs(
          query(usersRef, where('__name__', '==', subscription.userId), limit(1))
        );

        if (userDoc.empty) {
          // User doesn't exist - orphaned subscription
          currentBatch.delete(subDoc.ref);
          operationCount++;
          deletedCount++;

          if (operationCount >= 500) {
            batchOperations.push(currentBatch.commit());
            currentBatch = writeBatch(db);
            operationCount = 0;
          }
        }
      }

      if (operationCount > 0) {
        batchOperations.push(currentBatch.commit());
      }

      await Promise.all(batchOperations);

      this.stats.totalCleaned += deletedCount;

      console.log(`✅ Deleted ${deletedCount} orphaned subscriptions`);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up orphaned data:', error);
      // Non-critical, continua
      return 0;
    }
  }

  /**
   * Set custom retention periods
   */
  setRetentionDays(config) {
    if (config.events) this.retentionDays.events = config.events;
    if (config.scheduled) this.retentionDays.scheduled = config.scheduled;
    if (config.deliveries) this.retentionDays.deliveries = config.deliveries;
    if (config.expiredSubscriptions)
      this.retentionDays.expiredSubscriptions = config.expiredSubscriptions;
  }

  /**
   * Get cleanup statistics
   */
  getStats() {
    return {
      ...this.stats,
      retentionPolicies: { ...this.retentionDays },
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      subscriptionsDeleted: 0,
      eventsDeleted: 0,
      scheduledDeleted: 0,
      deliveriesDeleted: 0,
      totalCleaned: 0,
    };
  }

  /**
   * Schedule cleanup cron job (da chiamare in Cloud Function)
   */
  async scheduleCleanupJob(schedule = '0 2 * * *') {
    // Questo metodo è un placeholder
    // In produzione, usare Firebase Cloud Scheduler o Netlify Scheduled Functions
    console.log(`📅 Cleanup job scheduled: ${schedule} (cron format)`);
    console.log('Example: 0 2 * * * = Every day at 2:00 AM');

    return {
      scheduled: true,
      schedule,
      nextRun: this._getNextCronRun(schedule),
    };
  }

  /**
   * Calculate next cron run time
   * @private
   */
  _getNextCronRun(cronExpression) {
    // Simplified - in production usa library come node-cron
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0);
    return tomorrow;
  }
}

// Singleton instance
export const cleanupService = new NotificationCleanupService();

export default NotificationCleanupService;
