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

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    let userIds = body.userIds || [];
    const single = body.userId;
    if (!Array.isArray(userIds) && single) userIds = [single];

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'userIds è richiesto' }) };
    }

    const counts = {};
    for (const uid of userIds) {
      const snap = await db.collection('pushSubscriptions').where('userId', '==', uid).get();
      counts[uid] = snap.size;
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, counts }) };
  } catch (error) {
    console.error('[has-push-subscription] error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
