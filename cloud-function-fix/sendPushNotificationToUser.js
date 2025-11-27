/**
 * Cloud Function: sendPushNotificationToUser
 *
 * Invia notifica push a un utente specifico.
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
 * Invia notifica push a un singolo utente
 *
 * @param {string} userId - Firebase UID dell'utente
 * @param {Object} payload - Contenuto della notifica
 * @param {string} payload.title - Titolo notifica
 * @param {string} payload.body - Corpo notifica
 * @param {Object} payload.data - Dati custom (opzionale)
 * @returns {Promise<Object>} Risultato invio
 */
exports.sendPushNotificationToUser = async (userId, payload) => {
  console.log('📱 [sendPushNotificationToUser] Starting...', {
    userId,
    title: payload.title?.substring(0, 50),
  });

  try {
    // 1. Ottieni tutte le subscription attive dell'utente
    const subsSnapshot = await db
      .collection('pushSubscriptions')
      .where('firebaseUid', '==', userId)
      .where('active', '==', true)
      .get();

    if (subsSnapshot.empty) {
      console.log('⚠️ [Push] No active subscriptions found for user:', userId);
      return {
        success: false,
        error: 'NO_SUBSCRIPTIONS',
        message: 'Utente non ha subscription push attive',
      };
    }

    console.log(`📊 [Push] Found ${subsSnapshot.size} active subscription(s) for user`);

    // 2. Invia a tutte le subscription dell'utente
    const sendPromises = [];
    const subscriptionIds = [];

    for (const doc of subsSnapshot.docs) {
      const data = doc.data();
      const subId = doc.id;
      subscriptionIds.push(subId);

      console.log('🔍 [Push] Processing subscription:', {
        id: subId,
        type: data.type,
        platform: data.platform,
        hasEndpoint: !!data.endpoint,
        hasFcmToken: !!data.fcmToken,
      });

      // Determina il tipo di subscription
      const isNative = data.type === 'native';
      const isWeb = data.subscription?.endpoint?.startsWith('http');

      try {
        if (isNative && data.fcmToken) {
          // ========================================
          // NATIVE PUSH (Android/iOS) - USA FCM ADMIN SDK
          // ========================================
          console.log('📱 [Push] Sending NATIVE push via FCM Admin SDK');

          const message = {
            token: data.fcmToken,
            notification: {
              title: payload.title,
              body: payload.body,
            },
            data: payload.data || {},
          };

          // Configurazione specifica per Android
          if (data.platform === 'android') {
            message.android = {
              priority: 'high',
              notification: {
                channelId: 'default',
                sound: 'default',
                clickAction: 'FLUTTER_NOTIFICATION_CLICK',
              },
            };
          }

          // Configurazione specifica per iOS
          if (data.platform === 'ios') {
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

          const result = await admin.messaging().send(message);
          console.log('✅ [Push] Native notification sent successfully:', {
            messageId: result,
            platform: data.platform,
          });

          sendPromises.push(Promise.resolve({ success: true, type: 'native', messageId: result }));

        } else if (isWeb && data.subscription) {
          // ========================================
          // WEB PUSH (Browser) - USA WEB-PUSH LIBRARY
          // ========================================
          console.log('🌐 [Push] Sending WEB push via web-push library');

          // Configura VAPID keys (devono essere settate come secrets)
          const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
          const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

          if (!vapidPublicKey || !vapidPrivateKey) {
            throw new Error('VAPID keys not configured in environment');
          }

          webpush.setVapidDetails(
            'mailto:support@play-sport.pro',
            vapidPublicKey,
            vapidPrivateKey
          );

          const webPayload = JSON.stringify({
            title: payload.title,
            body: payload.body,
            data: payload.data || {},
            icon: '/icon-192x192.png',
            badge: '/badge-96x96.png',
          });

          await webpush.sendNotification(data.subscription, webPayload);
          console.log('✅ [Push] Web notification sent successfully');

          sendPromises.push(Promise.resolve({ success: true, type: 'web' }));

        } else {
          // ========================================
          // SUBSCRIPTION INVALIDA
          // ========================================
          console.error('❌ [Push] Invalid subscription format:', {
            id: subId,
            type: data.type,
            hasSubscription: !!data.subscription,
            hasFcmToken: !!data.fcmToken,
          });

          sendPromises.push(
            Promise.reject(new Error('Invalid subscription format'))
          );
        }
      } catch (sendError) {
        console.error('❌ [Push] Error sending to subscription:', {
          id: subId,
          error: sendError.message,
          code: sendError.code,
        });

        // Se errore 404 o 410 (token invalido), marca subscription come inattiva
        if (
          sendError.code === 'messaging/invalid-registration-token' ||
          sendError.code === 'messaging/registration-token-not-registered' ||
          sendError.statusCode === 404 ||
          sendError.statusCode === 410
        ) {
          console.log('🗑️ [Push] Marking subscription as inactive:', subId);
          await db.collection('pushSubscriptions').doc(subId).update({
            active: false,
            lastError: sendError.message,
            lastErrorAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        sendPromises.push(Promise.reject(sendError));
      }
    }

    // 3. Attendi tutti gli invii
    const results = await Promise.allSettled(sendPromises);

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log('📊 [Push] Send summary:', {
      total: results.length,
      successful,
      failed,
      subscriptionIds,
    });

    // 4. Restituisci risultato
    if (successful > 0) {
      return {
        success: true,
        total: results.length,
        successful,
        failed,
        subscriptionIds,
      };
    } else {
      throw new Error('All push notifications failed to send');
    }

  } catch (error) {
    console.error('❌ [Push] Fatal error:', error.message);
    throw error;
  }
};

/**
 * HTTP Cloud Function callable da client
 */
exports.sendPushNotificationToUserHTTP = async (req, res) => {
  try {
    const { userId, payload } = req.body;

    if (!userId || !payload) {
      return res.status(400).json({
        error: 'Missing required fields: userId, payload',
      });
    }

    const result = await exports.sendPushNotificationToUser(userId, payload);
    res.status(200).json(result);

  } catch (error) {
    console.error('❌ [Push HTTP] Error:', error);
    res.status(500).json({
      error: error.message,
    });
  }
};

