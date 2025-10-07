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
// NOTA: Genera le chiavi con: npx web-push generate-vapid-keys
// E aggiungi le variabili d'ambiente in Netlify
webpush.setVapidDetails(
  'mailto:your-email@example.com', // Sostituisci con la tua email
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
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

    if (!userId || !notification) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId e notification sono richiesti' }),
      };
    }

    // Recupera tutte le sottoscrizioni dell'utente
    const subscriptionsSnapshot = await db
      .collection('pushSubscriptions')
      .where('userId', '==', userId)
      .get();

    if (subscriptionsSnapshot.empty) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Nessuna sottoscrizione trovata per questo utente' }),
      };
    }

    // Prepara il payload della notifica
    const payload = JSON.stringify(notification);

    // Invia la notifica a tutte le sottoscrizioni dell'utente
    const sendPromises = [];
    const invalidSubscriptions = [];

    subscriptionsSnapshot.forEach((doc) => {
      const subscriptionData = doc.data();
      const subscription = subscriptionData.subscription;

      const sendPromise = webpush
        .sendNotification(subscription, payload)
        .catch((error) => {
          console.error('Errore nell\'invio push:', error);
          
          // Se la sottoscrizione non è più valida (410 Gone o 404 Not Found)
          if (error.statusCode === 410 || error.statusCode === 404) {
            invalidSubscriptions.push(doc.id);
          }
        });

      sendPromises.push(sendPromise);
    });

    // Attendi tutte le richieste
    await Promise.all(sendPromises);

    // Rimuovi le sottoscrizioni non valide
    if (invalidSubscriptions.length > 0) {
      const deletePromises = invalidSubscriptions.map((id) =>
        db.collection('pushSubscriptions').doc(id).delete()
      );
      await Promise.all(deletePromises);
      console.log(`Rimosse ${invalidSubscriptions.length} sottoscrizioni non valide`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        sent: subscriptionsSnapshot.size - invalidSubscriptions.length,
        removed: invalidSubscriptions.length,
      }),
    };
  } catch (error) {
    console.error('Errore nella funzione send-push:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
