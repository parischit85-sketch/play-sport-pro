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
    const { userId, subscription, endpoint, timestamp } = JSON.parse(event.body);

    if (!userId || !subscription || !endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId, subscription e endpoint sono richiesti' }),
      };
    }

    // Verifica se esiste già una sottoscrizione con questo endpoint
    const existingSubscription = await db
      .collection('pushSubscriptions')
      .where('endpoint', '==', endpoint)
      .get();

    if (!existingSubscription.empty) {
      // Aggiorna la sottoscrizione esistente
      const docId = existingSubscription.docs[0].id;
      await db.collection('pushSubscriptions').doc(docId).update({
        userId,
        subscription,
        timestamp: timestamp || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Sottoscrizione aggiornata',
          id: docId,
        }),
      };
    }

    // Crea una nuova sottoscrizione
    const docRef = await db.collection('pushSubscriptions').add({
      userId,
      subscription,
      endpoint,
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Sottoscrizione salvata',
        id: docRef.id,
      }),
    };
  } catch (error) {
    console.error('Errore nella funzione save-push-subscription:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
