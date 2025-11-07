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
    const { userId, deviceIds } = JSON.parse(event.body);

    if (!userId || !Array.isArray(deviceIds) || deviceIds.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: userId, deviceIds (array)' }),
      };
    }

    console.log(`[deactivate-old-devices] Deactivating ${deviceIds.length} devices for user ${userId}`);

    // Batch per disattivare dispositivi
    const batch = db.batch();
    let deactivatedCount = 0;

    // Trova e disattiva le subscriptions per questi device IDs
    for (const deviceId of deviceIds) {
      const subscriptionsSnap = await db
        .collection('pushSubscriptions')
        .where('userId', '==', userId)
        .where('deviceId', '==', deviceId)
        .where('isActive', '==', true)
        .get();

      subscriptionsSnap.docs.forEach((doc) => {
        batch.update(doc.ref, {
          isActive: false,
          deactivatedAt: new Date().toISOString(),
          deactivationReason: 'auto-deactivated-old-device',
        });
        deactivatedCount++;
      });
    }

    // Commit del batch
    if (deactivatedCount > 0) {
      await batch.commit();
      console.log(`[deactivate-old-devices] Successfully deactivated ${deactivatedCount} subscriptions`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        deactivatedCount,
        message: `Deactivated ${deactivatedCount} old device subscriptions`,
      }),
    };

  } catch (error) {
    console.error('[deactivate-old-devices] Error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};