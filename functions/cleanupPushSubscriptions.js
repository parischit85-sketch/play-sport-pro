const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Inizializza Firebase Admin
if (!global.firebaseAdminApp) {
  initializeApp();
  global.firebaseAdminApp = true;
}

const db = getFirestore();

// =============================================
// SCHEDULED FUNCTION: cleanupExpiredPushSubscriptions
// =============================================
exports.cleanupExpiredPushSubscriptions = onSchedule(
  {
    schedule: '0 */6 * * *', // Ogni 6 ore
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 300,
    timeZone: 'Europe/Rome',
  },
  async (event) => {
    console.log('🧹 [Scheduled Cleanup] Starting push subscriptions cleanup');

    try {
      const now = new Date().toISOString();
      let totalProcessed = 0;
      let expiredDeactivated = 0;
      let duplicatesRemoved = 0;

      // 1. Cleanup subscriptions scadute (più vecchie di 7 giorni)
      console.log('🧹 [Cleanup] Finding expired subscriptions...');
      const expiredSubs = await db
        .collection('pushSubscriptions')
        .where('expiresAt', '<', now)
        .where('isActive', '==', true)
        .get();

      console.log(`🧹 [Cleanup] Found ${expiredSubs.size} expired subscriptions`);

      if (!expiredSubs.empty) {
        const batch = db.batch();
        expiredSubs.docs.forEach((doc) => {
          batch.update(doc.ref, {
            isActive: false,
            deactivatedAt: now,
            deactivationReason: 'expired',
          });
        });
        await batch.commit();
        expiredDeactivated = expiredSubs.size;
        console.log(`🧹 [Cleanup] Deactivated ${expiredDeactivated} expired subscriptions`);
      }

      // 2. Rimuovi subscriptions duplicate per user/device
      console.log('🧹 [Cleanup] Finding duplicate subscriptions...');
      const allActiveSubs = await db
        .collection('pushSubscriptions')
        .where('isActive', '==', true)
        .get();

      totalProcessed = allActiveSubs.size;
      const userDevices = new Map();

      // Raggruppa per userId-deviceId
      allActiveSubs.docs.forEach((doc) => {
        const data = doc.data();
        const key = `${data.userId}-${data.deviceId || 'unknown'}`;

        if (!userDevices.has(key)) {
          userDevices.set(key, []);
        }
        userDevices.get(key).push({ id: doc.id, ...data });
      });

      // Per ogni gruppo user-device, mantieni solo la più recente
      const duplicateBatch = db.batch();
      for (const [key, subs] of userDevices) {
        if (subs.length > 1) {
          // Ordina per lastUsedAt (più recente prima)
          subs.sort((a, b) => {
            const aTime = a.lastUsedAt || a.createdAt || '1970-01-01';
            const bTime = b.lastUsedAt || b.createdAt || '1970-01-01';
            return new Date(bTime) - new Date(aTime);
          });

          // Disattiva le duplicate (mantieni solo la prima)
          for (let i = 1; i < subs.length; i++) {
            duplicateBatch.update(db.collection('pushSubscriptions').doc(subs[i].id), {
              isActive: false,
              deactivatedAt: now,
              deactivationReason: 'duplicate-device',
            });
            duplicatesRemoved++;
          }
        }
      }

      if (duplicatesRemoved > 0) {
        await duplicateBatch.commit();
        console.log(`🧹 [Cleanup] Removed ${duplicatesRemoved} duplicate subscriptions`);
      }

      // 3. Cleanup analytics events vecchi (mantieni solo ultimi 30 giorni)
      console.log('🧹 [Cleanup] Cleaning old analytics events...');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const oldAnalytics = await db
        .collection('notificationEvents')
        .where('timestamp', '<', thirtyDaysAgo.toISOString())
        .get();

      if (!oldAnalytics.empty) {
        const analyticsBatch = db.batch();
        oldAnalytics.docs.forEach((doc) => {
          analyticsBatch.delete(doc.ref);
        });
        await analyticsBatch.commit();
        console.log(`🧹 [Cleanup] Removed ${oldAnalytics.size} old analytics events`);
      }

      // Log risultati
      const summary = {
        timestamp: now,
        expiredDeactivated,
        duplicatesRemoved,
        totalProcessed,
        oldAnalyticsRemoved: oldAnalytics.size,
        success: true,
      };

      console.log('🧹 [Scheduled Cleanup] Completed successfully:', summary);

      // Salva log del cleanup
      await db.collection('systemLogs').add({
        type: 'push-subscriptions-cleanup',
        ...summary,
      });

      return summary;

    } catch (error) {
      console.error('🧹 [Scheduled Cleanup] Error:', error);

      // Log errore
      await db.collection('systemLogs').add({
        type: 'push-subscriptions-cleanup-error',
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
      });

      throw error;
    }
  }
);

// =============================================
// SCHEDULED FUNCTION: validatePushSubscriptions
// =============================================
exports.validatePushSubscriptions = onSchedule(
  {
    schedule: '0 2 * * *', // Ogni giorno alle 2:00
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 600,
    timeZone: 'Europe/Rome',
  },
  async (event) => {
    console.log('🔍 [Validation] Starting push subscriptions validation');

    try {
      const now = new Date().toISOString();
      let totalValidated = 0;
      let invalidFound = 0;
      let reactivated = 0;

      // Ottieni tutte le subscriptions attive
      const activeSubs = await db
        .collection('pushSubscriptions')
        .where('isActive', '==', true)
        .get();

      totalValidated = activeSubs.size;
      console.log(`🔍 [Validation] Validating ${totalValidated} active subscriptions`);

      // Per ogni subscription, verifica se è ancora valida
      // Nota: Questa è una validazione semplificata. In produzione,
      // si potrebbe implementare un vero test di invio per verificare
      // se l'endpoint è ancora raggiungibile.

      const validationBatch = db.batch();
      const webpush = require('web-push');

      // Configura VAPID (se disponibili)
      const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
      const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

      if (vapidPublicKey && vapidPrivateKey) {
        webpush.setVapidDetails(
          'mailto:test@example.com',
          vapidPublicKey,
          vapidPrivateKey
        );
      }

      for (const doc of activeSubs.docs) {
        const data = doc.data();
        const subscription = data.subscription;

        try {
          // Test semplice: verifica se la subscription ha tutti i campi necessari
          if (!subscription || !subscription.endpoint || !subscription.keys) {
            console.warn(`🔍 [Validation] Invalid subscription structure for ${data.userId}`);
            validationBatch.update(doc.ref, {
              isActive: false,
              deactivatedAt: now,
              deactivationReason: 'invalid-structure',
            });
            invalidFound++;
            continue;
          }

          // Verifica se l'endpoint sembra valido (basic check)
          const endpoint = subscription.endpoint;
          if (!endpoint.startsWith('https://') && !endpoint.startsWith('http://')) {
            console.warn(`🔍 [Validation] Invalid endpoint for ${data.userId}: ${endpoint}`);
            validationBatch.update(doc.ref, {
              isActive: false,
              deactivatedAt: now,
              deactivationReason: 'invalid-endpoint',
            });
            invalidFound++;
            continue;
          }

          // Se la subscription non è stata usata negli ultimi 30 giorni,
          // contrassegnala come potenzialmente inattiva
          const lastUsed = data.lastUsedAt || data.createdAt;
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          if (new Date(lastUsed) < thirtyDaysAgo) {
            console.log(`🔍 [Validation] Marking as potentially inactive: ${data.userId}`);
            validationBatch.update(doc.ref, {
              potentiallyInactive: true,
              lastValidationAt: now,
            });
          } else {
            // Aggiorna lastValidationAt per subscriptions attive
            validationBatch.update(doc.ref, {
              lastValidationAt: now,
              potentiallyInactive: false,
            });
          }

        } catch (error) {
          console.error(`🔍 [Validation] Error validating subscription for ${data.userId}:`, error);
          validationBatch.update(doc.ref, {
            isActive: false,
            deactivatedAt: now,
            deactivationReason: 'validation-error',
            validationError: error.message,
          });
          invalidFound++;
        }
      }

      if (invalidFound > 0 || reactivated > 0) {
        await validationBatch.commit();
      }

      const summary = {
        timestamp: now,
        totalValidated,
        invalidFound,
        reactivated,
        success: true,
      };

      console.log('🔍 [Validation] Completed successfully:', summary);

      // Salva log della validazione
      await db.collection('systemLogs').add({
        type: 'push-subscriptions-validation',
        ...summary,
      });

      return summary;

    } catch (error) {
      console.error('🔍 [Validation] Error:', error);

      await db.collection('systemLogs').add({
        type: 'push-subscriptions-validation-error',
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
      });

      throw error;
    }
  }
);