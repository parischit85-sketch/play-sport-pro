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
    const { userId, forceCleanup = false } = JSON.parse(event.body);

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required field: userId' }),
      };
    }

    console.log(`[cleanup-user-subscriptions] Starting cleanup for user ${userId}, force: ${forceCleanup}`);

    let cleanedCount = 0;
    const now = new Date();

    // Trova tutte le subscriptions per questo user
    const subscriptionsSnap = await db
      .collection('pushSubscriptions')
      .where('userId', '==', userId)
      .get();

    if (subscriptionsSnap.empty) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          cleanedCount: 0,
          message: 'No subscriptions found for user',
        }),
      };
    }

    const batch = db.batch();
    const subscriptions = subscriptionsSnap.docs;

    for (const doc of subscriptions) {
      const data = doc.data();
      let shouldClean = false;

      // Criteri di cleanup
      const reasons = [];

      // 1. Subscription scaduta
      if (data.expiresAt && new Date(data.expiresAt) < now) {
        shouldClean = true;
        reasons.push('expired');
      }

      // 2. Subscription già disattivata da tempo
      if (data.isActive === false && data.deactivatedAt) {
        const deactivatedDate = new Date(data.deactivatedAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (deactivatedDate < thirtyDaysAgo) {
          shouldClean = true;
          reasons.push('old-deactivated');
        }
      }

      // 3. Subscription senza attività recente (se force cleanup)
      if (forceCleanup && data.lastUsedAt) {
        const lastUsed = new Date(data.lastUsedAt);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        if (lastUsed < ninetyDaysAgo) {
          shouldClean = true;
          reasons.push('inactive-90-days');
        }
      }

      // 4. Subscription senza lastUsedAt e vecchia (se force cleanup)
      if (forceCleanup && !data.lastUsedAt && data.createdAt) {
        const created = new Date(data.createdAt);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        if (created < sixMonthsAgo) {
          shouldClean = true;
          reasons.push('old-unused');
        }
      }

      if (shouldClean) {
        console.log(`[cleanup-user-subscriptions] Cleaning subscription ${doc.id}, reasons: ${reasons.join(', ')}`);
        batch.delete(doc.ref);
        cleanedCount++;
      }
    }

    // Commit del batch se ci sono modifiche
    if (cleanedCount > 0) {
      await batch.commit();
      console.log(`[cleanup-user-subscriptions] Successfully cleaned ${cleanedCount} subscriptions`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        cleanedCount,
        totalSubscriptions: subscriptions.length,
        message: `Cleaned ${cleanedCount} obsolete subscriptions`,
      }),
    };

  } catch (error) {
    console.error('[cleanup-user-subscriptions] Error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};