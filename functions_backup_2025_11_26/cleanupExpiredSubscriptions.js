// =============================================
// FILE: functions/cleanupExpiredSubscriptions.js
// Cloud Function per cleanup automatico subscriptions scadute
// =============================================

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inizializza Admin SDK una sola volta
if (getApps().length === 0) {
  initializeApp();
}
const db = getFirestore();

// =============================================
// CLOUD FUNCTION: cleanupExpiredSubscriptions (scheduled)
// =============================================
export const cleanupExpiredSubscriptions = onSchedule(
  {
    schedule: '0 2 * * *', // Daily at 2 AM
    timeZone: 'Europe/Rome',
    memory: '256MiB',
    timeoutSeconds: 300,
  },
  async (event) => {
    console.log('🧹 [Cleanup] Starting expired subscriptions cleanup');

    const now = new Date().toISOString();
    let cleanedCount = 0;
    let errorCount = 0;

    try {
      // Query per subscriptions scadute
      const expiredQuery = db.collection('pushSubscriptions')
        .where('expiresAt', '<=', now);

      const expiredSnapshot = await expiredQuery.get();

      console.log(`🧹 [Cleanup] Found ${expiredSnapshot.size} expired subscriptions`);

      if (expiredSnapshot.size === 0) {
        console.log('✅ [Cleanup] No expired subscriptions to clean');
        return {
          success: true,
          cleaned: 0,
          message: 'No expired subscriptions found'
        };
      }

      // Elimina subscriptions scadute
      const deletePromises = expiredSnapshot.docs.map(async (doc) => {
        try {
          const data = doc.data();
          console.log(`🗑️ [Cleanup] Deleting expired subscription: ${doc.id} (user: ${data.userId})`);

          await doc.ref.delete();
          cleanedCount++;
        } catch (error) {
          console.error(`❌ [Cleanup] Error deleting subscription ${doc.id}:`, error);
          errorCount++;
        }
      });

      await Promise.all(deletePromises);

      console.log(`✅ [Cleanup] Cleanup completed: ${cleanedCount} cleaned, ${errorCount} errors`);

      return {
        success: true,
        cleaned: cleanedCount,
        errors: errorCount,
        message: `Cleaned ${cleanedCount} expired subscriptions`
      };

    } catch (error) {
      console.error('❌ [Cleanup] Fatal error during cleanup:', error);
      throw error;
    }
  }
);

// =============================================
// CLOUD FUNCTION: cleanupInactiveSubscriptions (scheduled)
// =============================================
export const cleanupInactiveSubscriptions = onSchedule(
  {
    schedule: '0 3 * * 0', // Weekly on Sunday at 3 AM
    timeZone: 'Europe/Rome',
    memory: '256MiB',
    timeoutSeconds: 300,
  },
  async (event) => {
    console.log('🧽 [Cleanup] Starting inactive subscriptions cleanup');

    // 30 giorni di inattività
    const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString();
    let cleanedCount = 0;
    let errorCount = 0;

    try {
      // Query per subscriptions inattive da più di 30 giorni
      const inactiveQuery = db.collection('pushSubscriptions')
        .where('lastUsedAt', '<=', thirtyDaysAgo);

      const inactiveSnapshot = await inactiveQuery.get();

      console.log(`🧽 [Cleanup] Found ${inactiveSnapshot.size} inactive subscriptions`);

      if (inactiveSnapshot.size === 0) {
        console.log('✅ [Cleanup] No inactive subscriptions to clean');
        return {
          success: true,
          cleaned: 0,
          message: 'No inactive subscriptions found'
        };
      }

      // Soft delete: marca come inactive invece di eliminare
      const updatePromises = inactiveSnapshot.docs.map(async (doc) => {
        try {
          const data = doc.data();
          console.log(`📝 [Cleanup] Marking inactive subscription: ${doc.id} (user: ${data.userId})`);

          await doc.ref.update({
            isActive: false,
            deactivatedAt: new Date().toISOString(),
            deactivationReason: 'inactive_30_days'
          });

          cleanedCount++;
        } catch (error) {
          console.error(`❌ [Cleanup] Error marking inactive subscription ${doc.id}:`, error);
          errorCount++;
        }
      });

      await Promise.all(updatePromises);

      console.log(`✅ [Cleanup] Inactive cleanup completed: ${cleanedCount} marked inactive, ${errorCount} errors`);

      return {
        success: true,
        cleaned: cleanedCount,
        errors: errorCount,
        message: `Marked ${cleanedCount} inactive subscriptions`
      };

    } catch (error) {
      console.error('❌ [Cleanup] Fatal error during inactive cleanup:', error);
      throw error;
    }
  }
);