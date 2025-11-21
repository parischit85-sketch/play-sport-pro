// =============================================
// FILE: functions/pushNotificationsHttp.js
// HTTP Functions con CORS per Push Notifications
// Versione HTTP per compatibilità con tutti i domini
// =============================================

import { onRequest } from 'firebase-functions/v2/https';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import cors from 'cors';
import crypto from 'crypto';
import webpush from 'web-push';
import { saveUserNotification } from './userNotifications.js';

// Inizializza Admin SDK
if (getApps().length === 0) {
  initializeApp();
}
const db = getFirestore();

// CORS configuration - permetti tutti i domini Firebase e custom
const corsHandler = cors({
  origin: [
    'http://localhost:5173',
    'https://m-padelweb.web.app',
    'https://m-padelweb.firebaseapp.com',
    'https://play-sport.pro',
    'https://www.play-sport.pro',
  ],
  credentials: true,
});

/**
 * HTTP endpoint per salvare push subscription
 */
export const savePushSubscriptionHttp = onRequest(
  {
    region: 'us-central1',
    timeoutSeconds: 60,
  },
  async (req, res) => {
    // Handle CORS
    corsHandler(req, res, async () => {
      try {
        // Solo POST
        if (req.method !== 'POST') {
          res.status(405).json({ error: 'Method not allowed' });
          return;
        }

        const { firebaseUid, subscription, endpoint, deviceId } = req.body.data || req.body;

        if (!firebaseUid || !subscription || !endpoint) {
          res.status(400).json({
            error: 'Parametri obbligatori mancanti: firebaseUid, subscription, endpoint',
          });
          return;
        }

        console.log('[savePushSubscriptionHttp] Saving subscription...', {
          firebaseUid,
          endpoint: endpoint.substring(0, 50) + '...',
          deviceId,
        });

        // 1. Genera ID subscription univoco basato su hash dell'endpoint (deterministico)
        // Questo permette di aggiornare la stessa subscription se l'endpoint è uguale
        const endpointHash = crypto
          .createHash('sha256')
          .update(endpoint)
          .digest('hex')
          .substring(0, 32);
        const subscriptionId = `${firebaseUid}_${endpointHash}`;

        // 2. Salva/aggiorna la subscription
        // NOTA: Non eliminiamo le altre subscriptions dello stesso utente!
        // L'utente può avere più dispositivi (PC, telefono, tablet) e riceverà
        // notifiche su tutti i dispositivi attivi.
        const newSubData = {
          firebaseUid,
          subscription,
          endpoint,
          deviceId: deviceId || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          active: true,
          isActive: true,
        };

        await db
          .collection('pushSubscriptions')
          .doc(subscriptionId)
          .set(newSubData, { merge: true });

        console.log('[savePushSubscriptionHttp] Subscription saved successfully', {
          subscriptionId,
        });

        res.status(200).json({
          result: {
            success: true,
            id: subscriptionId,
          },
        });
      } catch (error) {
        console.error('[savePushSubscriptionHttp] Error:', error);
        res.status(500).json({
          error: {
            message: error.message || 'Internal server error',
          },
        });
      }
    });
  }
);

/**
 * HTTP endpoint per rimuovere push subscription
 */
export const removePushSubscriptionHttp = onRequest(
  {
    region: 'us-central1',
    timeoutSeconds: 30,
  },
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== 'POST') {
          res.status(405).json({ error: 'Method not allowed' });
          return;
        }

        const { firebaseUid, endpoint } = req.body.data || req.body;

        if (!firebaseUid || !endpoint) {
          res.status(400).json({
            error: 'Parametri obbligatori mancanti: firebaseUid, endpoint',
          });
          return;
        }

        console.log('[removePushSubscriptionHttp] Removing subscription...', {
          firebaseUid,
          endpoint: endpoint.substring(0, 50) + '...',
        });

        // Query per trovare la subscription
        const querySnapshot = await db
          .collection('pushSubscriptions')
          .where('firebaseUid', '==', firebaseUid)
          .where('endpoint', '==', endpoint)
          .limit(1)
          .get();

        if (querySnapshot.empty) {
          console.warn('[removePushSubscriptionHttp] Subscription not found');
          res.status(200).json({
            result: {
              success: true,
              deleted: false,
              reason: 'not-found',
            },
          });
          return;
        }

        // Elimina la subscription
        await querySnapshot.docs[0].ref.delete();

        console.log('[removePushSubscriptionHttp] Subscription removed successfully');

        res.status(200).json({
          result: {
            success: true,
            deleted: true,
          },
        });
      } catch (error) {
        console.error('[removePushSubscriptionHttp] Error:', error);
        res.status(500).json({
          error: {
            message: error.message || 'Internal server error',
          },
        });
      }
    });
  }
);

/**
 * HTTP endpoint per inviare push notification
 */
export const sendPushNotificationHttp = onRequest(
  {
    region: 'us-central1',
    timeoutSeconds: 60,
    secrets: ['VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY'],
  },
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== 'POST') {
          res.status(405).json({ error: 'Method not allowed' });
          return;
        }

        const { firebaseUid, notification } = req.body.data || req.body;

        if (!firebaseUid) {
          res.status(400).json({
            error: 'firebaseUid è richiesto',
          });
          return;
        }

        if (!notification || typeof notification !== 'object') {
          res.status(400).json({
            error: 'notification object è richiesto',
          });
          return;
        }

        console.log('[sendPushNotificationHttp] Sending notification...', {
          firebaseUid,
          title: notification.title,
        });

        // Save in-app notification (once per user)
        try {
          await saveUserNotification({
            userId: firebaseUid,
            title: notification.title,
            body: notification.body,
            type: notification.data?.category || 'info',
            metadata: notification.data || {},
            icon: notification.icon,
            actionUrl: notification.data?.url || notification.click_action,
            priority: notification.data?.priority || 'normal',
          });
          console.log('[sendPushNotificationHttp] In-app notification saved');
        } catch (saveError) {
          console.error('[sendPushNotificationHttp] Failed to save in-app notification:', saveError);
          // Don't fail the request if saving fails, just log it
        }

        // Get VAPID keys from environment (secrets are injected as env vars)
        const vapidPublicKey = (process.env.VAPID_PUBLIC_KEY || '').trim();
        const vapidPrivateKey = (process.env.VAPID_PRIVATE_KEY || '').trim();

        if (!vapidPublicKey || !vapidPrivateKey) {
          throw new Error('VAPID keys not configured');
        }

        webpush.setVapidDetails('mailto:paris.andrea@live.it', vapidPublicKey, vapidPrivateKey);

        // Query subscriptions per userId
        const subsSnap = await db
          .collection('pushSubscriptions')
          .where('firebaseUid', '==', firebaseUid)
          .get();

        console.log('[sendPushNotificationHttp] Subscriptions found:', subsSnap.size);

        if (subsSnap.empty) {
          res.status(404).json({
            error: 'Nessuna sottoscrizione push trovata per questo utente',
          });
          return;
        }

        // Filtra subscriptions valide
        const now = new Date().toISOString();
        const validDocs = subsSnap.docs.filter((doc) => {
          const data = doc.data();
          const isActive = data.isActive === true || data.active === true;
          const notExpired = !data.expiresAt || data.expiresAt > now;
          return isActive && notExpired;
        });

        console.log('[sendPushNotificationHttp] Valid subscriptions:', validDocs.length);

        if (validDocs.length === 0) {
          res.status(404).json({
            error: 'Nessuna sottoscrizione attiva trovata',
          });
          return;
        }

        const payload = JSON.stringify(notification);
        const invalidDocs = [];

        // Invia a tutte le subscriptions valide
        const results = await Promise.allSettled(
          validDocs.map(async (doc) => {
            const data = doc.data();
            const sub = {
              endpoint: data.endpoint || data.subscription?.endpoint,
              keys: data.keys || data.subscription?.keys,
            };

            console.log('[sendPushNotificationHttp] Sending to:', {
              docId: doc.id,
              endpoint: sub.endpoint?.substring(0, 50) + '...',
            });

            try {
              await webpush.sendNotification(sub, payload);
              console.log('[sendPushNotificationHttp] ✅ Sent successfully');

              // Aggiorna lastUsedAt
              await doc.ref.update({
                lastUsedAt: new Date().toISOString(),
              });
            } catch (err) {
              console.error('[sendPushNotificationHttp] ❌ Send failed:', err.message);

              // Segna per eliminazione se non valida
              const statusCode = err?.statusCode || err?.status;
              if (statusCode === 404 || statusCode === 410) {
                console.log('[sendPushNotificationHttp] Marking invalid:', doc.id);
                invalidDocs.push(doc.id);
              }
              throw err;
            }
          })
        );

        // Pulisci subscriptions invalide
        if (invalidDocs.length > 0) {
          await Promise.all(
            invalidDocs.map((id) => db.collection('pushSubscriptions').doc(id).delete())
          );
        }

        const successCount = results.filter((r) => r.status === 'fulfilled').length;
        const failureCount = results.filter((r) => r.status === 'rejected').length;

        console.log('[sendPushNotificationHttp] Results:', {
          total: results.length,
          success: successCount,
          failed: failureCount,
        });

        res.status(200).json({
          result: {
            success: successCount > 0,
            sent: successCount,
            failed: failureCount,
            removed: invalidDocs.length,
          },
        });
      } catch (error) {
        console.error('[sendPushNotificationHttp] Error:', error);
        res.status(500).json({
          error: {
            message: error.message || 'Internal server error',
          },
        });
      }
    });
  }
);
