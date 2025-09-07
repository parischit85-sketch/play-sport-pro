// =============================================
// FILE: src/services/firebase-backup.js  
// =============================================
import { db } from './cloud.js';
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, orderBy, limit } from 'firebase/firestore';

// Backup automatico Firebase
export async function createFirebaseBackup() {
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '2.1.0',
      type: 'automatic',
      data: {}
    };

    // Backup di tutte le leghe
    const leaguesSnapshot = await getDocs(collection(db, 'leagues'));
    leaguesSnapshot.forEach(doc => {
      backupData.data[doc.id] = doc.data();
    });

    // Salva il backup nella collection "backups"
    const backupId = `auto-backup-${Date.now()}`;
    await setDoc(doc(db, 'backups', backupId), backupData);
    
    console.log('🔥✅ Backup Firebase creato:', backupId);
    return { success: true, backupId, data: backupData };
    
  } catch (error) {
    console.error('❌ Errore backup Firebase:', error);
    return { success: false, error: error.message };
  }
}

// Ripristina da backup Firebase
export async function restoreFromFirebaseBackup(backupId) {
  try {
    const backupDoc = await getDoc(doc(db, 'backups', backupId));
    
    if (!backupDoc.exists()) {
      throw new Error('Backup non trovato');
    }
    
    const backup = backupDoc.data();
    
    // Ripristina ogni lega
    for (const [leagueId, leagueData] of Object.entries(backup.data)) {
      await setDoc(doc(db, 'leagues', leagueId), {
        ...leagueData,
        _restored: true,
        _restoredAt: new Date().toISOString(),
        _restoredFrom: backupId
      });
    }
    
    console.log('🔥✅ Ripristino Firebase completato');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Errore ripristino Firebase:', error);
    return { success: false, error: error.message };
  }
}

// Lista backup disponibili
export async function getFirebaseBackups() {
  try {
    const q = query(
      collection(db, 'backups'), 
      orderBy('timestamp', 'desc'), 
      limit(10)
    );
    const snapshot = await getDocs(q);
    
    const backups = [];
    snapshot.forEach(doc => {
      backups.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, backups };
    
  } catch (error) {
    console.error('❌ Errore lista backup:', error);
    return { success: false, error: error.message };
  }
}

// Cleanup backup vecchi (mantieni solo ultimi 30)
export async function cleanupOldBackups() {
  try {
    const allBackups = await getDocs(
      query(collection(db, 'backups'), orderBy('timestamp', 'desc'))
    );
    
    const toDelete = [];
    allBackups.docs.slice(30).forEach(doc => {
      toDelete.push(doc.ref);
    });
    
    // Elimina backup vecchi
    await Promise.all(toDelete.map(ref => deleteDoc(ref)));
    
    console.log(`🧹 Eliminati ${toDelete.length} backup vecchi`);
    return { success: true, deleted: toDelete.length };
    
  } catch (error) {
    console.error('❌ Errore cleanup:', error);
    return { success: false, error: error.message };
  }
}

// Avvia backup automatico ogni X ore
let backupInterval = null;

export function startAutomaticFirebaseBackup(intervalHours = 24) {
  // Ferma intervallo precedente
  if (backupInterval) {
    clearInterval(backupInterval);
  }
  
  // Backup immediato
  createFirebaseBackup();
  
  // Backup periodico
  backupInterval = setInterval(async () => {
    const result = await createFirebaseBackup();
    if (result.success) {
      // Cleanup backup vecchi ogni 10 backup
      if (Math.random() < 0.1) {
        await cleanupOldBackups();
      }
    }
  }, intervalHours * 60 * 60 * 1000);
  
  console.log(`🔄 Backup automatico Firebase avviato (ogni ${intervalHours}h)`);
  return backupInterval;
}

export function stopAutomaticFirebaseBackup() {
  if (backupInterval) {
    clearInterval(backupInterval);
    backupInterval = null;
    console.log('⏹️ Backup automatico Firebase fermato');
  }
}
