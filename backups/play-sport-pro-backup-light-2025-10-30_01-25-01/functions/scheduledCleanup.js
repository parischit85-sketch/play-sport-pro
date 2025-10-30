/**
 * @fileoverview Cloud Function per cleanup schedulato
 * 
 * Deploy con:
 * firebase deploy --only functions:scheduledNotificationCleanup
 * 
 * Schedule: Ogni giorno alle 2:00 AM
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin (se non già fatto)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Scheduled Cloud Function - Cleanup giornaliero
 * Runs every day at 2:00 AM UTC
 */
exports.scheduledNotificationCleanup = functions
  .runWith({
    timeoutSeconds: 540, // 9 minuti (max)
    memory: '1GB'
  })
  .pubsub
  .schedule('0 2 * * *') // Cron: Every day at 2 AM
  .timeZone('Europe/Rome')
  .onRun(async (context) => {
    console.log('🧹 Starting scheduled notification cleanup...');
    const startTime = Date.now();

    const stats = {
      subscriptionsDeleted: 0,
      eventsDeleted: 0,
      scheduledDeleted: 0,
      deliveriesDeleted: 0,
      totalCleaned: 0
    };

    try {
      // 1. Cleanup expired subscriptions
      const expiredSubs = await cleanupExpiredSubscriptions();
      stats.subscriptionsDeleted = expiredSubs;
      stats.totalCleaned += expiredSubs;

      // 2. Cleanup old events (> 90 days)
      const oldEvents = await cleanupOldEvents(90);
      stats.eventsDeleted = oldEvents;
      stats.totalCleaned += oldEvents;

      // 3. Cleanup old scheduled notifications (> 30 days)
      const oldScheduled = await cleanupOldScheduledNotifications(30);
      stats.scheduledDeleted = oldScheduled;
      stats.totalCleaned += oldScheduled;

      // 4. Cleanup old delivery logs (> 60 days)
      const oldDeliveries = await cleanupOldDeliveryLogs(60);
      stats.deliveriesDeleted = oldDeliveries;
      stats.totalCleaned += oldDeliveries;

      const duration = Date.now() - startTime;

      console.log(`✅ Cleanup completed in ${duration}ms`);
      console.log('📊 Stats:', stats);

      return {
        success: true,
        duration,
        stats
      };

    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      throw new functions.https.HttpsError('internal', 'Cleanup failed', error);
    }
  });

/**
 * Cleanup expired subscriptions
 */
async function cleanupExpiredSubscriptions() {
  const subscriptionsRef = db.collection('pushSubscriptions');
  const snapshot = await subscriptionsRef
    .where('status', '==', 'expired')
    .limit(500)
    .get();

  if (snapshot.empty) {
    console.log('✅ No expired subscriptions');
    return 0;
  }

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`✅ Deleted ${snapshot.size} expired subscriptions`);
  return snapshot.size;
}

/**
 * Cleanup old events
 */
async function cleanupOldEvents(retentionDays) {
  const eventsRef = db.collection('notificationEvents');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const snapshot = await eventsRef
    .where('timestamp', '<', admin.firestore.Timestamp.fromDate(cutoffDate))
    .orderBy('timestamp')
    .limit(500)
    .get();

  if (snapshot.empty) {
    console.log('✅ No old events');
    return 0;
  }

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`✅ Deleted ${snapshot.size} old events (> ${retentionDays} days)`);
  return snapshot.size;
}

/**
 * Cleanup old scheduled notifications
 */
async function cleanupOldScheduledNotifications(retentionDays) {
  const scheduledRef = db.collection('scheduledNotifications');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const snapshot = await scheduledRef
    .where('status', 'in', ['sent', 'failed', 'cancelled'])
    .where('scheduledAt', '<', admin.firestore.Timestamp.fromDate(cutoffDate))
    .limit(500)
    .get();

  if (snapshot.empty) {
    console.log('✅ No old scheduled notifications');
    return 0;
  }

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`✅ Deleted ${snapshot.size} old scheduled notifications (> ${retentionDays} days)`);
  return snapshot.size;
}

/**
 * Cleanup old delivery logs
 */
async function cleanupOldDeliveryLogs(retentionDays) {
  const deliveriesRef = db.collection('notificationDeliveries');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const snapshot = await deliveriesRef
    .where('timestamp', '<', admin.firestore.Timestamp.fromDate(cutoffDate))
    .orderBy('timestamp')
    .limit(500)
    .get();

  if (snapshot.empty) {
    console.log('✅ No old delivery logs');
    return 0;
  }

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`✅ Deleted ${snapshot.size} old delivery logs (> ${retentionDays} days)`);
  return snapshot.size;
}

/**
 * Manual trigger endpoint (per testing)
 */
exports.triggerCleanupManually = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB'
  })
  .https
  .onCall(async (data, context) => {
    // Require authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated to trigger cleanup'
      );
    }

    // Require admin role
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const userData = userDoc.data();
    
    if (userData?.role !== 'admin' && userData?.role !== 'super_admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Must be admin to trigger cleanup'
      );
    }

    console.log(`🧹 Manual cleanup triggered by ${context.auth.uid}`);

    // Run cleanup (same logic as scheduled)
    const stats = {
      subscriptionsDeleted: 0,
      eventsDeleted: 0,
      scheduledDeleted: 0,
      deliveriesDeleted: 0,
      totalCleaned: 0
    };

    try {
      stats.subscriptionsDeleted = await cleanupExpiredSubscriptions();
      stats.eventsDeleted = await cleanupOldEvents(90);
      stats.scheduledDeleted = await cleanupOldScheduledNotifications(30);
      stats.deliveriesDeleted = await cleanupOldDeliveryLogs(60);
      stats.totalCleaned = Object.values(stats).reduce((sum, val) => sum + val, 0);

      console.log('✅ Manual cleanup completed:', stats);

      return {
        success: true,
        stats
      };

    } catch (error) {
      console.error('❌ Manual cleanup failed:', error);
      throw new functions.https.HttpsError('internal', 'Cleanup failed', error);
    }
  });
