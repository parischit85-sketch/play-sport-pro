const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Inizializza Firebase Admin solo se non già inizializzato
if (!global.firebaseAdminApp) {
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'play-sport-pro',
  });
  global.firebaseAdminApp = true;
}

const db = getFirestore();

exports.handler = async (event, context) => {
  // Solo POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse del body
    const analyticsEvent = JSON.parse(event.body);

    // Validazione minima
    if (!analyticsEvent.type || !analyticsEvent.timestamp) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid analytics event data' }),
      };
    }

    // Aggiungi metadata del server
    const enrichedEvent = {
      ...analyticsEvent,
      serverTimestamp: new Date().toISOString(),
      userAgent: event.headers['user-agent'] || 'unknown',
      ip: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
      source: 'service-worker',
    };

    // Salva su Firestore
    await db.collection('notificationEvents').add(enrichedEvent);

    console.log('[Analytics API] Event tracked:', enrichedEvent.type, 'for user:', enrichedEvent.userId);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };

  } catch (error) {
    console.error('[Analytics API] Error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
    };
  }
};