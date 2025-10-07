const admin = require('firebase-admin');

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
    const { userId, endpoint } = JSON.parse(event.body);

    if (!userId || !endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId e endpoint sono richiesti' }),
      };
    }

    // Trova e rimuovi la sottoscrizione
    const subscriptionSnapshot = await db
      .collection('pushSubscriptions')
      .where('userId', '==', userId)
      .where('endpoint', '==', endpoint)
      .get();

    if (subscriptionSnapshot.empty) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Sottoscrizione non trovata' }),
      };
    }

    // Rimuovi tutte le sottoscrizioni corrispondenti
    const deletePromises = subscriptionSnapshot.docs.map((doc) =>
      db.collection('pushSubscriptions').doc(doc.id).delete()
    );

    await Promise.all(deletePromises);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Sottoscrizione rimossa',
        removed: deletePromises.length,
      }),
    };
  } catch (error) {
    console.error('Errore nella funzione remove-push-subscription:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
