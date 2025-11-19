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
 * HTTP endpoint per inviare push notification di test
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

        console.log('[sendPushNotificationHttp] Sending test notification...', { firebaseUid });

        // Per ora, ritorniamo successo - l'implementazione completa richiederebbe
        // l'integrazione con web-push o Firebase Cloud Messaging
        // Questo è solo un endpoint di test
        console.log('[sendPushNotificationHttp] Test notification endpoint called', {
          firebaseUid,
          notificationTitle: notification.title,
        });

        res.status(200).json({
          result: {
            success: true,
            message: 'Test notification endpoint - implementation pending',
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
