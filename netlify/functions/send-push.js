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
    const { userId, notification } = JSON.parse(event.body);

    console.log('[send-push] Request received:', { userId, hasNotification: !!notification });

    if (!userId || !notification) {
      console.error('[send-push] Missing required fields');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId e notification sono richiesti' }),
      };
    }

    // Recupera tutte le sottoscrizioni dell'utente
    console.log('[send-push] Fetching subscriptions for userId:', userId);
    const subscriptionsSnapshot = await db
      .collection('pushSubscriptions')
      .where('userId', '==', userId)
      .get();

    console.log('[send-push] Subscriptions found:', subscriptionsSnapshot.size);

    if (subscriptionsSnapshot.empty) {
      console.warn('[send-push] No subscriptions found for user:', userId);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          error: 'Nessuna sottoscrizione trovata per questo utente',
          hint: 'Assicurati di aver cliccato "Attiva Notifiche" prima di inviare il test'
        }),
      };
    }

    // Prepara il payload della notifica
    const payload = JSON.stringify(notification);
    console.log('[send-push] Payload prepared, length:', payload.length);

    // Invia la notifica a tutte le sottoscrizioni dell'utente
    const sendPromises = [];
    const invalidSubscriptions = [];

    subscriptionsSnapshot.forEach((doc) => {
      const subscriptionData = doc.data();
      const subscription = subscriptionData.subscription;

      console.log('[send-push] Sending to subscription:', doc.id);

      const sendPromise = webpush
        .sendNotification(subscription, payload)
        .then(() => {
          console.log('[send-push] Successfully sent to:', doc.id);
        })
        .catch((error) => {
          console.error('[send-push] Error sending to subscription:', doc.id, error.message);
          
          // Se la sottoscrizione non è più valida (410 Gone o 404 Not Found)
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log('[send-push] Marking subscription as invalid:', doc.id);
            invalidSubscriptions.push(doc.id);
          }
        });

      sendPromises.push(sendPromise);
    });

    // Attendi tutte le richieste
    console.log('[send-push] Waiting for all sends to complete...');
    await Promise.all(sendPromises);

    // Rimuovi le sottoscrizioni non valide
    if (invalidSubscriptions.length > 0) {
      console.log('[send-push] Removing invalid subscriptions:', invalidSubscriptions.length);
      const deletePromises = invalidSubscriptions.map((id) =>
        db.collection('pushSubscriptions').doc(id).delete()
      );
      await Promise.all(deletePromises);
      console.log(`[send-push] Removed ${invalidSubscriptions.length} invalid subscriptions`);
    }

    const result = {
      success: true,
      sent: subscriptionsSnapshot.size - invalidSubscriptions.length,
      removed: invalidSubscriptions.length,
    };

    console.log('[send-push] Request completed successfully:', result);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('[send-push] Fatal error:', error);
    console.error('[send-push] Error stack:', error.stack);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        type: error.constructor.name,
        details: 'Check function logs for more information'
      }),
    };
  }
};
