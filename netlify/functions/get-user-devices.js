const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Inizializza Firebase Admin
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
    const { userId, currentDeviceId } = JSON.parse(event.body);

    if (!userId || !currentDeviceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: userId, currentDeviceId' }),
      };
    }

    // Ottieni tutte le subscriptions attive per questo user
    const subscriptionsSnap = await db
      .collection('pushSubscriptions')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();

    const devices = [];
    let hasConflicts = false;

    subscriptionsSnap.docs.forEach((doc) => {
      const data = doc.data();
      devices.push({
        id: doc.id,
        deviceId: data.deviceId,
        createdAt: data.createdAt,
        lastUsedAt: data.lastUsedAt,
        endpoint: data.subscription?.endpoint,
      });

      // Conflitto se c'è più di un dispositivo attivo
      if (devices.length > 1) {
        hasConflicts = true;
      }
    });

    // Filtra dispositivi diversi da quello corrente
    const conflictingDevices = devices.filter(device => device.deviceId !== currentDeviceId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        hasConflicts,
        currentDeviceId,
        totalDevices: devices.length,
        conflictingDevices,
        allDevices: devices,
      }),
    };

  } catch (error) {
    console.error('[get-user-devices] Error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};