/**
 * Firebase Cloud Functions - Play Sport Pro
 * Main entry point
 *
 * Modificato il: 26 Nov 2025
 * Fix: Supporto completo per push notifications native (Android/iOS) e web
 */

const functions = require('firebase-functions');
const {
  sendPushNotificationToUser,
  sendPushNotificationToUserHTTP
} = require('./sendPushNotificationToUser');
const {
  sendBulkNotifications,
  sendBulkNotificationsHTTP
} = require('./sendBulkNotifications');

// ========================================
// PUSH NOTIFICATIONS - SINGLE USER
// ========================================

/**
 * Callable function - Invia push a singolo utente
 * Uso: firebase.functions().httpsCallable('sendPushToUser')({ userId, payload })
 */
exports.sendPushToUser = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Verifica autenticazione
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { userId, payload } = data;

    if (!userId || !payload) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: userId, payload'
      );
    }

    try {
      const result = await sendPushNotificationToUser(userId, payload);
      return result;
    } catch (error) {
      console.error('Error in sendPushToUser:', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  });

/**
 * HTTP function - Invia push a singolo utente
 * Uso: POST https://REGION-PROJECT_ID.cloudfunctions.net/sendPushToUserHTTP
 */
exports.sendPushToUserHTTP = functions
  .region('europe-west1')
  .https.onRequest(sendPushNotificationToUserHTTP);

// ========================================
// PUSH NOTIFICATIONS - BULK (MULTIPLE USERS)
// ========================================

/**
 * Callable function - Invia push a multipli utenti
 * Uso: firebase.functions().httpsCallable('sendBulkPush')({ userIds, payload })
 */
exports.sendBulkPush = functions
  .region('europe-west1')
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB',
  })
  .https.onCall(async (data, context) => {
    // Verifica autenticazione e permessi admin
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    // Verifica se utente è admin (opzionale - personalizza secondo le tue regole)
    const isAdmin = context.auth.token.admin === true ||
                    context.auth.token.role === 'admin' ||
                    context.auth.token.superAdmin === true;

    if (!isAdmin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can send bulk notifications'
      );
    }

    const { userIds, payload } = data;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing or invalid userIds array'
      );
    }

    if (!payload || !payload.title || !payload.body) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required payload fields: title, body'
      );
    }

    try {
      const result = await sendBulkNotifications(userIds, payload);
      return result;
    } catch (error) {
      console.error('Error in sendBulkPush:', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  });

/**
 * HTTP function - Invia push a multipli utenti
 * Uso: POST https://REGION-PROJECT_ID.cloudfunctions.net/sendBulkPushHTTP
 */
exports.sendBulkPushHTTP = functions
  .region('europe-west1')
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB',
  })
  .https.onRequest(sendBulkNotificationsHTTP);

// ========================================
// SCHEDULED FUNCTIONS (Opzionale)
// ========================================

/**
 * Scheduled function - Pulisce subscription inattive vecchie
 * Esegue ogni giorno alle 03:00 UTC
 */
exports.cleanupInactiveSubscriptions = functions
  .region('europe-west1')
  .pubsub.schedule('0 3 * * *')
  .timeZone('Europe/Rome')
  .onRun(async (context) => {
    const admin = require('firebase-admin');
    const db = admin.firestore();

    console.log('🧹 [Cleanup] Starting inactive subscriptions cleanup...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      // Trova subscription inattive da più di 30 giorni
      const snapshot = await db
        .collection('pushSubscriptions')
        .where('active', '==', false)
        .where('lastErrorAt', '<', thirtyDaysAgo)
        .limit(500)
        .get();

      if (snapshot.empty) {
        console.log('✅ [Cleanup] No inactive subscriptions to clean');
        return null;
      }

      console.log(`🗑️ [Cleanup] Deleting ${snapshot.size} inactive subscriptions`);

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log('✅ [Cleanup] Cleanup completed successfully');
      return { deleted: snapshot.size };

    } catch (error) {
      console.error('❌ [Cleanup] Error:', error);
      throw error;
    }
  });

// ========================================
// EXPORTS
// ========================================

console.log('✅ Cloud Functions loaded successfully');

