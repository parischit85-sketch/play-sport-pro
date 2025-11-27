import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  initializeApp();
}
const db = getFirestore();

/**
 * Scheduled function - Pulisce subscription inattive vecchie (Hard Delete)
 * Ripristinata dal backup V2 (era chiamata cleanupInactiveSubscriptions)
 * Esegue ogni giorno alle 03:30 UTC (dopo il soft delete delle 03:00)
 */
export const pruneInactiveSubscriptions = onSchedule(
  {
    schedule: '30 3 * * *',
    timeZone: 'Europe/Rome',
    memory: '256MiB',
    timeoutSeconds: 300,
  },
  async (event) => {
    console.log('🧹 [Prune] Starting hard cleanup of inactive subscriptions...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      // Trova subscription inattive da più di 30 giorni (che hanno un errore registrato)
      const snapshot = await db
        .collection('pushSubscriptions')
        .where('active', '==', false)
        .where('lastErrorAt', '<', thirtyDaysAgo)
        .limit(500)
        .get();

      if (snapshot.empty) {
        console.log('✅ [Prune] No old inactive subscriptions to delete');
        return;
      }

      console.log(`🗑️ [Prune] Deleting ${snapshot.size} old inactive subscriptions`);

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log('✅ [Prune] Cleanup completed successfully');

    } catch (error) {
      console.error('❌ [Prune] Error:', error);
    }
  }
);
