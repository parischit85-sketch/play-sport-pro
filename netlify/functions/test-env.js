/**
 * Function di test per verificare le variabili d'ambiente
 */

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const checks = {
      VAPID_PUBLIC_KEY: {
        exists: !!process.env.VAPID_PUBLIC_KEY,
        length: process.env.VAPID_PUBLIC_KEY?.length || 0,
        preview: process.env.VAPID_PUBLIC_KEY?.substring(0, 20) + '...',
      },
      VAPID_PRIVATE_KEY: {
        exists: !!process.env.VAPID_PRIVATE_KEY,
        length: process.env.VAPID_PRIVATE_KEY?.length || 0,
        preview: process.env.VAPID_PRIVATE_KEY?.substring(0, 20) + '...',
      },
      FIREBASE_PROJECT_ID: {
        exists: !!process.env.FIREBASE_PROJECT_ID,
        value: process.env.FIREBASE_PROJECT_ID || 'NOT SET',
      },
      FIREBASE_CLIENT_EMAIL: {
        exists: !!process.env.FIREBASE_CLIENT_EMAIL,
        value: process.env.FIREBASE_CLIENT_EMAIL || 'NOT SET',
      },
      FIREBASE_PRIVATE_KEY: {
        exists: !!process.env.FIREBASE_PRIVATE_KEY,
        length: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
        hasNewlines: process.env.FIREBASE_PRIVATE_KEY?.includes('\\n') || false,
        startsCorrectly: process.env.FIREBASE_PRIVATE_KEY?.startsWith('-----BEGIN') || false,
        preview: process.env.FIREBASE_PRIVATE_KEY?.substring(0, 30) + '...',
      },
    };

    // Test Firebase Admin initialization
    let firebaseTest = { status: 'not_tested', error: null };
    try {
      const admin = require('firebase-admin');
      
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
      }
      
      firebaseTest.status = 'success';
      firebaseTest.appName = admin.app().name;
    } catch (error) {
      firebaseTest.status = 'error';
      firebaseTest.error = error.message;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        environment: 'netlify_functions',
        timestamp: new Date().toISOString(),
        checks,
        firebaseTest,
        allConfigured: Object.values(checks).every(c => c.exists),
      }, null, 2),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message, stack: error.stack }),
    };
  }
};
