const admin = require('firebase-admin');
const webpush = require('web-push');

// Inizializza Firebase Admin se non già fatto
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Configura VAPID keys per web-push
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.error('❌ VAPID keys non configurate nelle variabili d\'ambiente');
  throw new Error('VAPID keys not configured');
}

webpush.setVapidDetails(
  'mailto:paris.andrea@live.it',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Invia una notifica con retry logic e exponential backoff
 */
async function sendWithRetry(subscription, payload, subscriptionId, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[send-bulk-push] Attempt ${attempt}/${maxRetries} for subscription: ${subscriptionId}`);
      await webpush.sendNotification(subscription, payload);
      return; // Success
    } catch (error) {
      lastError = error;
      console.warn(`[send-bulk-push] Attempt ${attempt} failed for ${subscriptionId}:`, error.message);

      // Non ritentare per errori permanenti
      if (error.statusCode === 410 || error.statusCode === 404 || error.statusCode === 400) {
        throw error;
      }

      // Se non è l'ultimo tentativo, aspetta prima di riprovare
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff, max 10s
        console.log(`[send-bulk-push] Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Tutti i tentativi falliti
  throw lastError;
}

exports.handler = async (event, context) => {
  // Abilita CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Gestisci preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userIds, notification, filters = {} } = JSON.parse(event.body);

    console.log('[send-bulk-push] Request received:', {
      userCount: userIds?.length || 'all',
      hasNotification: !!notification,
      filters: Object.keys(filters)
    });

    if (!notification) {
      console.error('[send-bulk-push] Missing notification data');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Dati notifica mancanti',
          code: 'MISSING_NOTIFICATION',
          resolution: 'Devi fornire i dati della notifica nel campo "notification"'
        }),
      };
    }

    let targetSubscriptions = [];

    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      // Invia a utenti specifici
      console.log('[send-bulk-push] Fetching subscriptions for specific users:', userIds.length);

      for (const userId of userIds) {
        const userSubscriptions = await db
          .collection('pushSubscriptions')
          .where('userId', '==', userId)
          .where('isActive', '==', true)
          .get();

        userSubscriptions.forEach((doc) => {
          targetSubscriptions.push({
            id: doc.id,
            userId: doc.data().userId,
            subscription: doc.data().subscription,
            deviceId: doc.data().deviceId,
          });
        });
      }
    } else {
      // Invia a tutti gli utenti (con filtri)
      console.log('[send-bulk-push] Fetching all active subscriptions with filters');

      let query = db.collection('pushSubscriptions').where('isActive', '==', true);

      // Applica filtri se specificati
      if (filters.clubId) {
        // Nota: Questo richiede che i dati della subscription includano clubId
        // Potrebbe essere necessario modificare la struttura dati
        console.log('[send-bulk-push] Filtering by clubId:', filters.clubId);
      }

      if (filters.deviceType) {
        console.log('[send-bulk-push] Filtering by device type:', filters.deviceType);
      }

      const allSubscriptions = await query.get();

      allSubscriptions.forEach((doc) => {
        const data = doc.data();
        let include = true;

        // Applica filtri manualmente
        if (filters.clubId && data.clubId !== filters.clubId) {
          include = false;
        }

        if (filters.deviceType && data.deviceType !== filters.deviceType) {
          include = false;
        }

        if (include) {
          targetSubscriptions.push({
            id: doc.id,
            userId: data.userId,
            subscription: data.subscription,
            deviceId: data.deviceId,
          });
        }
      });
    }

    console.log('[send-bulk-push] Found target subscriptions:', targetSubscriptions.length);

    if (targetSubscriptions.length === 0) {
      console.warn('[send-bulk-push] No target subscriptions found');
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'Nessuna sottoscrizione trovata per gli utenti specificati',
          code: 'NO_SUBSCRIPTIONS',
          resolution: 'Gli utenti devono prima attivare le notifiche push',
          userCount: userIds?.length || 0,
          filters: filters
        }),
      };
    }

    // Prepara il payload della notifica rich
    const richNotification = {
      // Campi base
      title: notification.title || 'Play-sport.pro',
      body: notification.body || 'Hai una nuova notifica',
      icon: notification.icon || '/icons/icon.svg',
      badge: notification.badge || '/icons/icon.svg',
      tag: notification.tag || 'bulk-notification',
      requireInteraction: notification.requireInteraction || false,
      silent: notification.silent || false,
      timestamp: notification.timestamp || Date.now(),

      // Campi avanzati per notifiche rich
      image: notification.image,
      actions: notification.actions || [
        {
          action: 'open',
          title: 'Apri App',
          icon: '/icons/icon.svg',
        },
        {
          action: 'dismiss',
          title: 'Ignora',
        },
      ],

      // Dati personalizzati
      data: {
        url: notification.url || '/',
        type: notification.type || 'bulk',
        category: notification.category || 'general',
        priority: notification.priority || 'normal',
        bulkId: `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...notification.data,
      },

      // Suoni e vibrazione
      vibrate: notification.vibrate || [200, 100, 200],

      // Lingua e direzione testo
      lang: notification.lang || 'it',
      dir: notification.dir || 'ltr',
    };

    const payload = JSON.stringify(richNotification);
    console.log('[send-bulk-push] Rich bulk notification payload prepared, length:', payload.length);

    // Invia la notifica a tutte le sottoscrizioni target
    const sendPromises = [];
    const invalidSubscriptions = [];
    const failedSubscriptions = [];
    const successfulSends = [];

    // Raggruppa per utente per evitare duplicati
    const subscriptionsByUser = {};
    targetSubscriptions.forEach((sub) => {
      if (!subscriptionsByUser[sub.userId]) {
        subscriptionsByUser[sub.userId] = [];
      }
      subscriptionsByUser[sub.userId].push(sub);
    });

    console.log(`[send-bulk-push] Sending to ${Object.keys(subscriptionsByUser).length} unique users`);

    for (const [userId, userSubs] of Object.entries(subscriptionsByUser)) {
      for (const sub of userSubs) {
        console.log('[send-bulk-push] Sending to subscription:', sub.id, 'for user:', userId);

        const sendPromise = sendWithRetry(sub.subscription, payload, sub.id)
          .then(async () => {
            console.log('[send-bulk-push] Successfully sent to:', sub.id);
            successfulSends.push(sub.id);

            // Aggiorna lastUsedAt per questa sottoscrizione
            try {
              await db.collection('pushSubscriptions').doc(sub.id).update({
                lastUsedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            } catch (updateError) {
              console.warn('[send-bulk-push] Failed to update lastUsedAt for:', sub.id, updateError.message);
            }
          })
          .catch((error) => {
            console.error('[send-bulk-push] Error sending to subscription:', sub.id, error.message);

            // Se la sottoscrizione non è più valida (410 Gone o 404 Not Found)
            if (error.statusCode === 410 || error.statusCode === 404) {
              console.log('[send-bulk-push] Marking subscription as invalid:', sub.id);
              invalidSubscriptions.push(sub.id);
            } else {
              // Altri errori: marca come fallita ma non eliminare
              failedSubscriptions.push({
                id: sub.id,
                userId: sub.userId,
                error: error.message,
                statusCode: error.statusCode
              });
            }
          });

        sendPromises.push(sendPromise);
      }
    }

    // Attendi tutte le richieste
    console.log('[send-bulk-push] Waiting for all sends to complete...');
    await Promise.all(sendPromises);

    // Rimuovi le sottoscrizioni non valide
    if (invalidSubscriptions.length > 0) {
      console.log('[send-bulk-push] Removing invalid subscriptions:', invalidSubscriptions.length);
      const deletePromises = invalidSubscriptions.map((id) =>
        db.collection('pushSubscriptions').doc(id).delete()
      );
      await Promise.all(deletePromises);
      console.log(`[send-bulk-push] Removed ${invalidSubscriptions.length} invalid subscriptions`);
    }

    const result = {
      success: true,
      sent: successfulSends.length,
      removed: invalidSubscriptions.length,
      failed: failedSubscriptions.length,
      totalTargeted: targetSubscriptions.length,
      uniqueUsers: Object.keys(subscriptionsByUser).length,
      failedDetails: failedSubscriptions.length > 0 ? failedSubscriptions : undefined,
      bulkId: richNotification.data.bulkId,
    };

    console.log('[send-bulk-push] Bulk request completed successfully:', result);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('[send-bulk-push] Fatal error:', error);
    console.error('[send-bulk-push] Error stack:', error.stack);

    let errorCode = 'UNKNOWN_ERROR';
    let resolution = 'Contatta il supporto tecnico con i dettagli dell\'errore';

    if (error.message?.includes('VAPID')) {
      errorCode = 'VAPID_CONFIG_ERROR';
      resolution = 'Verifica che le chiavi VAPID siano configurate correttamente nelle variabili d\'ambiente';
    } else if (error.message?.includes('Firebase')) {
      errorCode = 'FIREBASE_ERROR';
      resolution = 'Problema di connessione a Firestore. Verifica le credenziali Firebase';
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        code: errorCode,
        resolution: resolution,
        type: error.constructor.name,
        details: 'Controlla i log della funzione per maggiori informazioni'
      }),
    };
  }
};