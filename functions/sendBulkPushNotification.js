// =============================================
// FILE: functions/sendBulkPushNotification.js
// Cloud Function per invio notifiche push generiche a utenti
// =============================================

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { saveUserNotification } from './userNotifications.js';

// Import sendPushNotificationToUser from sendBulkNotifications
// (We'll reference it via a shared helper or duplicate the logic)

// Inizializza Admin SDK
if (getApps().length === 0) {
  initializeApp();
}
const db = getFirestore();

/**
 * Invia notifiche push bulk a utenti
 * @param {string} title - Titolo notifica
 * @param {string} body - Corpo notifica
 * @param {string} targetType - 'all' | 'club'
 * @param {string|null} targetClubId - ID club (se targetType='club')
 * @param {string|null} url - URL azione
 */
export const sendBulkPushNotification = onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 540,
    memory: '512MiB',
    secrets: ['VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY'],
  },
  async (request) => {
    const { data, auth } = request;

    // Verifica autenticazione
    if (!auth || !auth.uid) {
      throw new HttpsError('unauthenticated', 'Autenticazione richiesta');
    }

    // TODO: Verifica che l'utente sia admin
    // Per ora accettiamo qualsiasi utente autenticato

    const { title, body, targetType = 'all', targetClubId = null, url = null } = data || {};

    if (!title || !body) {
      throw new HttpsError('invalid-argument', 'title e body sono richiesti');
    }

    if (targetType === 'club' && !targetClubId) {
      throw new HttpsError('invalid-argument', 'targetClubId richiesto per targetType=club');
    }

    logger.info('📣 [sendBulkPushNotification] Starting...', {
      title,
      bodyPreview: body.substring(0, 50),
      targetType,
      targetClubId,
      url,
      sentBy: auth.uid,
    });

    try {
      // Step 1: Recupera utenti target
      let targetUsers = [];

      if (targetType === 'all') {
        // Tutti gli utenti registrati
        const profilesSnap = await db.collection('profiles').get();
        targetUsers = profilesSnap.docs
          .map((doc) => ({
            firebaseUid: doc.id,
            ...doc.data(),
          }))
          .filter((u) => u.firebaseUid); // Solo utenti con firebaseUid valido
      } else if (targetType === 'club') {
        // Utenti affiliati al club
        const affiliationsSnap = await db
          .collection('affiliations')
          .where('clubId', '==', targetClubId)
          .where('status', '==', 'approved')
          .get();

        const userIds = [...new Set(affiliationsSnap.docs.map((doc) => doc.data().userId))];

        // Recupera profili utenti
        if (userIds.length > 0) {
          // Batch get (max 10 per batch in Firestore)
          const batches = [];
          for (let i = 0; i < userIds.length; i += 10) {
            const batch = userIds.slice(i, i + 10);
            const profilesPromises = batch.map((uid) => db.collection('profiles').doc(uid).get());
            batches.push(Promise.all(profilesPromises));
          }

          const batchResults = await Promise.all(batches);
          const profileDocs = batchResults.flat();

          targetUsers = profileDocs
            .filter((doc) => doc.exists)
            .map((doc) => ({
              firebaseUid: doc.id,
              ...doc.data(),
            }));
        }
      }

      logger.info(`📊 [sendBulkPushNotification] Target users: ${targetUsers.length}`);

      if (targetUsers.length === 0) {
        return {
          success: true,
          recipientsCount: 0,
          successCount: 0,
          failureCount: 0,
          message: 'Nessun utente trovato per i criteri specificati',
        };
      }

      // Step 2: Invia push + salva in-app notification per ogni utente
      const results = await Promise.allSettled(
        targetUsers.map(async (user) => {
          try {
            // Salva in-app notification SEMPRE (anche se push fallisce)
            await saveUserNotification({
              userId: user.firebaseUid,
              title,
              body,
              type: 'info',
              icon: '🔔',
              actionUrl: url,
              priority: 'normal',
              metadata: {
                targetType,
                targetClubId,
                sentAt: new Date().toISOString(),
                sentBy: auth.uid,
              },
            });

            // Tenta invio push (potrebbe fallire se utente non ha subscription)
            try {
              // Importiamo dinamicamente per evitare dipendenze circolari
              const { sendPushNotificationToUser } = await import(
                './sendBulkNotifications.clean.js'
              );

              await sendPushNotificationToUser(
                user.firebaseUid,
                {
                  title,
                  body,
                  icon: '🔔',
                  badge: '/icons/badge-96x96.png',
                  tag: 'bulk-notification',
                  data: { url: url || '/' },
                },
                { firebaseUid: user.firebaseUid }
              );

              logger.info(`✅ [sendBulkPushNotification] Sent to user: ${user.firebaseUid}`);
            } catch (pushErr) {
              // Push fallito ma in-app notification salvata - OK
              logger.warn(`⚠️ [sendBulkPushNotification] Push failed for ${user.firebaseUid}:`, {
                error: pushErr.message,
                reason: 'In-app notification saved anyway',
              });
            }

            return { success: true, userId: user.firebaseUid };
          } catch (err) {
            logger.error(`❌ [sendBulkPushNotification] Error for user ${user.firebaseUid}:`, {
              error: err.message,
            });
            throw err;
          }
        })
      );

      // Step 3: Conta successi/fallimenti
      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      const failureCount = results.filter((r) => r.status === 'rejected').length;

      logger.info('✅ [sendBulkPushNotification] Completed', {
        total: targetUsers.length,
        successCount,
        failureCount,
      });

      return {
        success: true,
        recipientsCount: targetUsers.length,
        successCount,
        failureCount,
        message: `Notifiche inviate: ${successCount} successi, ${failureCount} fallimenti`,
      };
    } catch (error) {
      logger.error('❌ [sendBulkPushNotification] Fatal error:', {
        error: error.message,
        stack: error.stack,
      });
      throw new HttpsError('internal', error.message || 'Errore durante invio notifiche');
    }
  }
);
