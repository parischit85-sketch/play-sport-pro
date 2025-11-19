// =============================================
// FILE: functions/cleanOldPushSubscriptions.js
// Scheduled Cloud Function per pulizia automatica subscriptions vecchie/inattive
// =============================================
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';

// Inizializza Firestore (usa l'istanza admin già inizializzata)
const db = getFirestore();

/**
 * Scheduled Function (esegue ogni domenica alle 3:00 AM)
 * Pulisce automaticamente:
 * - Subscriptions scadute (expiresAt < now)
 * - Subscriptions duplicate (mantiene solo la più recente per utente)
 * - Subscriptions inattive da > 90 giorni
 */
export const cleanOldPushSubscriptions = onSchedule(
  {
    schedule: 'every sunday 03:00', // Cron syntax: ogni domenica alle 3:00 AM
    timeZone: 'Europe/Rome',
    memory: '256MiB',
    timeoutSeconds: 540, // 9 minuti max
    region: 'europe-west1', // Cambia se il tuo progetto usa altra region
  },
  async (event) => {
    console.log('🧹 [Cleanup] Starting push subscriptions cleanup...');

    const now = new Date();
    const nowISO = now.toISOString();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();

    try {
      // ============================================
      // 1. Elimina subscriptions SCADUTE
      // ============================================
      const expiredQuery = await db
        .collection('pushSubscriptions')
        .where('expiresAt', '<', nowISO)
        .get();

      if (!expiredQuery.empty) {
        console.log(`🗑️ [Cleanup] Found ${expiredQuery.size} expired subscriptions`);
        const batch = db.batch();
        expiredQuery.docs.forEach((doc) => {
          console.log(`   - Deleting expired: ${doc.id} (expired: ${doc.data().expiresAt})`);
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`✅ [Cleanup] Deleted ${expiredQuery.size} expired subscriptions`);
      } else {
        console.log('✅ [Cleanup] No expired subscriptions found');
      }

      // ============================================
      // 2. Elimina subscriptions INATTIVE (> 90 giorni senza uso)
      // ============================================
      const inactiveQuery = await db
        .collection('pushSubscriptions')
        .where('lastUsedAt', '<', ninetyDaysAgo)
        .get();

      if (!inactiveQuery.empty) {
        console.log(`🗑️ [Cleanup] Found ${inactiveQuery.size} inactive subscriptions (>90 days)`);
        const batch2 = db.batch();
        inactiveQuery.docs.forEach((doc) => {
          console.log(
            `   - Deleting inactive: ${doc.id} (last used: ${doc.data().lastUsedAt || 'never'})`
          );
          batch2.delete(doc.ref);
        });
        await batch2.commit();
        console.log(`✅ [Cleanup] Deleted ${inactiveQuery.size} inactive subscriptions`);
      } else {
        console.log('✅ [Cleanup] No inactive subscriptions found');
      }

      // ============================================
      // 3. Elimina DUPLICATI (mantieni solo la più recente per utente)
      // ============================================
      const allSubscriptions = await db.collection('pushSubscriptions').get();

      if (allSubscriptions.empty) {
        console.log('✅ [Cleanup] No subscriptions to check for duplicates');
        return;
      }

      console.log(`🔍 [Cleanup] Checking ${allSubscriptions.size} subscriptions for duplicates...`);

      // Raggruppa per firebaseUid
      const userGroups = {};
      allSubscriptions.docs.forEach((doc) => {
        const data = doc.data();
        const uid = data.firebaseUid || data.userId; // Fallback a userId se firebaseUid manca
        if (!uid) {
          console.warn(`⚠️ [Cleanup] Subscription ${doc.id} has no firebaseUid/userId, skipping`);
          return;
        }

        if (!userGroups[uid]) {
          userGroups[uid] = [];
        }
        userGroups[uid].push({
          id: doc.id,
          ref: doc.ref,
          data,
          timestamp: new Date(data.updatedAt || data.createdAt || 0).getTime(),
        });
      });

      // Per ogni utente con duplicati, elimina quelli vecchi
      let duplicatesDeleted = 0;
      const deleteBatch = db.batch();

      Object.entries(userGroups).forEach(([uid, subs]) => {
        if (subs.length > 1) {
          console.log(`🧹 [Cleanup] User ${uid} has ${subs.length} subscriptions, cleaning...`);

          // Ordina per timestamp (più recente prima)
          subs.sort((a, b) => b.timestamp - a.timestamp);

          // Mantieni solo la prima (più recente), elimina le altre
          const toDelete = subs.slice(1);
          toDelete.forEach((sub) => {
            console.log(
              `   - Deleting duplicate: ${sub.id} (created: ${sub.data.createdAt || 'unknown'})`
            );
            deleteBatch.delete(sub.ref);
            duplicatesDeleted++;
          });

          console.log(`   ✅ Kept newest: ${subs[0].id} (created: ${subs[0].data.createdAt})`);
        }
      });

      if (duplicatesDeleted > 0) {
        await deleteBatch.commit();
        console.log(`✅ [Cleanup] Deleted ${duplicatesDeleted} duplicate subscriptions`);
      } else {
        console.log('✅ [Cleanup] No duplicate subscriptions found');
      }

      // ============================================
      // SUMMARY
      // ============================================
      const totalDeleted = expiredQuery.size + inactiveQuery.size + duplicatesDeleted;
      console.log('🎉 [Cleanup] Cleanup completed successfully!', {
        expired: expiredQuery.size,
        inactive: inactiveQuery.size,
        duplicates: duplicatesDeleted,
        totalDeleted,
        timestamp: nowISO,
      });

      return {
        success: true,
        deleted: totalDeleted,
        breakdown: {
          expired: expiredQuery.size,
          inactive: inactiveQuery.size,
          duplicates: duplicatesDeleted,
        },
      };
    } catch (error) {
      console.error('❌ [Cleanup] Error during cleanup:', error);
      throw error;
    }
  }
);
