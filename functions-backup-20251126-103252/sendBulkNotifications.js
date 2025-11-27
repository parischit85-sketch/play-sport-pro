/**
 * Cloud Function: sendBulkNotifications
 *
 * Invia notifiche push a multipli utenti.
 * SUPPORTA SIA WEB PUSH CHE NATIVE (Android/iOS)
 *
 * Modificato il: 26 Nov 2025
 * Fix: Aggiunto supporto per token FCM nativi Android/iOS
 */

const admin = require('firebase-admin');
const webpush = require('web-push');

// Inizializza Firebase Admin (se non già fatto)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Invia notifica push a multipli utenti
 *
 * @param {Array<string>} userIds - Array di Firebase UIDs
 * @param {Object} payload - Contenuto della notifica
 * @returns {Promise<Object>} Risultati invio
 */
exports.sendBulkNotifications = async (userIds, payload) => {
  console.log('📱 [sendBulkNotifications] Starting...', {
    totalUsers: userIds.length,
    title: payload.title?.substring(0, 50),
  });

  const results = {
    total: userIds.length,
    successful: 0,
    failed: 0,
    errors: [],
    details: [],
  };

  // Configura VAPID keys per web-push
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

  if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(
      'mailto:support@play-sport.pro',
      vapidPublicKey,
      vapidPrivateKey
    );
  }

  // Processa utenti in batch di 100
  const BATCH_SIZE = 100;
  for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
    const batch = userIds.slice(i, i + BATCH_SIZE);

    // Ottieni tutte le subscription per questo batch
    const subsSnapshot = await db
      .collection('pushSubscriptions')
      .where('firebaseUid', 'in', batch)
      .where('active', '==', true)
      .get();

    console.log(`📊 [Bulk] Batch ${Math.floor(i/BATCH_SIZE) + 1}: Found ${subsSnapshot.size} active subscriptions`);

    // Raggruppa per tipo (native vs web)
    const nativeTokens = [];
    const webSubscriptions = [];
    const subscriptionMap = new Map(); // Per tracking

    subsSnapshot.forEach((doc) => {
      const data = doc.data();
      const subId = doc.id;

      subscriptionMap.set(subId, {
        userId: data.firebaseUid,
        type: data.type,
        platform: data.platform,
      });

      if (data.type === 'native' && data.fcmToken) {
        nativeTokens.push({
          token: data.fcmToken,
          platform: data.platform,
          subscriptionId: subId,
        });
      } else if (data.subscription?.endpoint?.startsWith('http')) {
        webSubscriptions.push({
          subscription: data.subscription,
          subscriptionId: subId,
        });
      }
    });

    // ========================================
    // INVIO NATIVE PUSH (Android/iOS) - FCM BATCH
    // ========================================
    if (nativeTokens.length > 0) {
      console.log(`📱 [Bulk] Sending ${nativeTokens.length} NATIVE notifications via FCM`);

      // FCM supporta batch di max 500 token
      const FCM_BATCH_SIZE = 500;
      for (let j = 0; j < nativeTokens.length; j += FCM_BATCH_SIZE) {
        const tokenBatch = nativeTokens.slice(j, j + FCM_BATCH_SIZE);

        // Prepara messaggi
        const messages = tokenBatch.map(({ token, platform }) => {
          const message = {
            token,
            notification: {
              title: payload.title,
              body: payload.body,
            },
            data: payload.data || {},
          };

          // Config Android
          if (platform === 'android') {
            message.android = {
              priority: 'high',
              notification: {
                channelId: 'default',
                sound: 'default',
                clickAction: 'FLUTTER_NOTIFICATION_CLICK',
              },
            };
          }

          // Config iOS
          if (platform === 'ios') {
            message.apns = {
              payload: {
                aps: {
                  alert: {
                    title: payload.title,
                    body: payload.body,
                  },
                  sound: 'default',
                  badge: 1,
                },
              },
            };
          }

          return message;
        });

        try {
          // Usa sendEach per batch (più efficiente di sendAll)
          const response = await admin.messaging().sendEach(messages);

          console.log(`✅ [Bulk Native] Batch sent:`, {
            successCount: response.successCount,
            failureCount: response.failureCount,
          });

          results.successful += response.successCount;
          results.failed += response.failureCount;

          // Gestisci token falliti
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              const { token, subscriptionId } = tokenBatch[idx];
              const error = resp.error;

              console.error('❌ [Bulk Native] Failed token:', {
                subscriptionId,
                error: error.code,
                message: error.message,
              });

              results.errors.push({
                subscriptionId,
                error: error.message,
                code: error.code,
              });

              // Marca subscription come inattiva se token invalido
              if (
                error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered'
              ) {
                db.collection('pushSubscriptions').doc(subscriptionId).update({
                  active: false,
                  lastError: error.message,
                  lastErrorAt: admin.firestore.FieldValue.serverTimestamp(),
                }).catch(err => console.error('Error updating subscription:', err));
              }
            }
          });

        } catch (error) {
          console.error('❌ [Bulk Native] Batch error:', error);
          results.failed += tokenBatch.length;
          results.errors.push({
            batch: j,
            error: error.message,
          });
        }
      }
    }

    // ========================================
    // INVIO WEB PUSH (Browser)
    // ========================================
    if (webSubscriptions.length > 0) {
      console.log(`🌐 [Bulk] Sending ${webSubscriptions.length} WEB notifications`);

      const webPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        icon: '/icon-192x192.png',
        badge: '/badge-96x96.png',
      });

      const webPromises = webSubscriptions.map(async ({ subscription, subscriptionId }) => {
        try {
          await webpush.sendNotification(subscription, webPayload);
          console.log('✅ [Bulk Web] Notification sent:', subscriptionId);
          results.successful++;
        } catch (error) {
          console.error('❌ [Bulk Web] Failed:', {
            subscriptionId,
            error: error.message,
            statusCode: error.statusCode,
          });

          results.failed++;
          results.errors.push({
            subscriptionId,
            error: error.message,
            statusCode: error.statusCode,
          });

          // Marca subscription come inattiva se endpoint invalido
          if (error.statusCode === 404 || error.statusCode === 410) {
            await db.collection('pushSubscriptions').doc(subscriptionId).update({
              active: false,
              lastError: error.message,
              lastErrorAt: admin.firestore.FieldValue.serverTimestamp(),
            }).catch(err => console.error('Error updating subscription:', err));
          }
        }
      });

      await Promise.allSettled(webPromises);
    }
  }

  console.log('📊 [Bulk] Final summary:', {
    total: results.total,
    successful: results.successful,
    failed: results.failed,
    errorCount: results.errors.length,
  });

  return results;
};

/**
 * HTTP Cloud Function callable da client
 */
exports.sendBulkNotificationsHTTP = async (req, res) => {
  try {
    const { userIds, payload } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        error: 'Missing or invalid userIds array',
      });
    }

    if (!payload || !payload.title || !payload.body) {
      return res.status(400).json({
        error: 'Missing required payload fields: title, body',
      });
    }

    const result = await exports.sendBulkNotifications(userIds, payload);
    res.status(200).json(result);

  } catch (error) {
    console.error('❌ [Bulk HTTP] Error:', error);
    res.status(500).json({
      error: error.message,
    });
  }
};

