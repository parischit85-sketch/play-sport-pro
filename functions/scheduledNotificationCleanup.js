/**
 * @fileoverview Scheduled Cloud Function per cleanup automatico notifiche
 * 
 * Esegue operazioni di cleanup giornaliere:
 * - Eventi analytics obsoleti (>90 giorni)
 * - Delivery logs vecchi (>30 giorni) 
 * - Scheduled notifications completate (>7 giorni)
 * - Push subscriptions inattive (>180 giorni)
 * 
 * Schedule: Ogni giorno alle 2 AM (timezone: Europe/Rome)
 * 
 * @author Play Sport Pro Team
 * @version 2.0.0
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
try {
  initializeApp();
} catch (error) {
  // App already initialized
}

const db = getFirestore();

/**
 * Scheduled Function: Cleanup notifiche e dati analytics obsoleti
 * 
 * Esegue ogni giorno alle 2 AM (Europe/Rome timezone)
 * 
 * Operazioni eseguite:
 * 1. Delete eventi analytics > 90 giorni
 * 2. Delete delivery logs > 30 giorni  
 * 3. Delete scheduled notifications completate > 7 giorni
 * 4. Update push subscriptions inattive > 180 giorni
 * 
 * Batch operations per evitare timeout
 */
export const scheduledNotificationCleanup = onSchedule({
  schedule: '0 2 * * *', // Cron: ogni giorno alle 2 AM
  timeZone: 'Europe/Rome',
  retryCount: 3, // Retry fino a 3 volte in caso di fallimento
  memory: '512MiB',
  timeoutSeconds: 540, // 9 minuti max
  region: 'europe-west1'
}, async (event) => {
  const startTime = Date.now();
  const results = {
    analyticsEvents: { deleted: 0, errors: 0 },
    deliveryLogs: { deleted: 0, errors: 0 },
    scheduledNotifications: { deleted: 0, errors: 0 },
    pushSubscriptions: { updated: 0, errors: 0 }
  };

  console.log('🧹 Starting scheduled notification cleanup...', {
    timestamp: new Date().toISOString(),
    timezone: 'Europe/Rome'
  });

  try {
    // =============================================
    // 1. CLEANUP EVENTI ANALYTICS > 90 GIORNI
    // =============================================
    const analyticsRetentionDays = 90;
    const analyticsThreshold = Date.now() - (analyticsRetentionDays * 24 * 60 * 60 * 1000);

    console.log(`📊 Deleting analytics events older than ${analyticsRetentionDays} days...`);
    
    const analyticsQuery = db.collection('notificationEvents')
      .where('timestamp', '<', analyticsThreshold)
      .limit(500); // Batch limit

    let analyticsBatch = db.batch();
    let analyticsCount = 0;
    
    const analyticsSnapshot = await analyticsQuery.get();
    
    analyticsSnapshot.docs.forEach((doc) => {
      analyticsBatch.delete(doc.ref);
      analyticsCount++;
    });

    if (analyticsCount > 0) {
      await analyticsBatch.commit();
      results.analyticsEvents.deleted = analyticsCount;
      console.log(`✅ Deleted ${analyticsCount} old analytics events`);
    }

    // =============================================
    // 2. CLEANUP DELIVERY LOGS > 30 GIORNI
    // =============================================
    const deliveryRetentionDays = 30;
    const deliveryThreshold = Date.now() - (deliveryRetentionDays * 24 * 60 * 60 * 1000);

    console.log(`📦 Deleting delivery logs older than ${deliveryRetentionDays} days...`);
    
    const deliveryQuery = db.collection('notificationDeliveries')
      .where('timestamp', '<', deliveryThreshold)
      .limit(500);

    let deliveryBatch = db.batch();
    let deliveryCount = 0;
    
    const deliverySnapshot = await deliveryQuery.get();
    
    deliverySnapshot.docs.forEach((doc) => {
      deliveryBatch.delete(doc.ref);
      deliveryCount++;
    });

    if (deliveryCount > 0) {
      await deliveryBatch.commit();
      results.deliveryLogs.deleted = deliveryCount;
      console.log(`✅ Deleted ${deliveryCount} old delivery logs`);
    }

    // =============================================
    // 3. CLEANUP SCHEDULED NOTIFICATIONS COMPLETATE > 7 GIORNI
    // =============================================
    const scheduledRetentionDays = 7;
    const scheduledThreshold = Date.now() - (scheduledRetentionDays * 24 * 60 * 60 * 1000);

    console.log(`⏰ Deleting completed scheduled notifications older than ${scheduledRetentionDays} days...`);
    
    const scheduledQuery = db.collection('scheduledNotifications')
      .where('status', '==', 'sent')
      .where('sendAt', '<', scheduledThreshold)
      .limit(500);

    let scheduledBatch = db.batch();
    let scheduledCount = 0;
    
    const scheduledSnapshot = await scheduledQuery.get();
    
    scheduledSnapshot.docs.forEach((doc) => {
      scheduledBatch.delete(doc.ref);
      scheduledCount++;
    });

    if (scheduledCount > 0) {
      await scheduledBatch.commit();
      results.scheduledNotifications.deleted = scheduledCount;
      console.log(`✅ Deleted ${scheduledCount} old scheduled notifications`);
    }

    // =============================================
    // 4. UPDATE PUSH SUBSCRIPTIONS INATTIVE > 180 GIORNI
    // =============================================
    const subscriptionInactiveDays = 180;
    const subscriptionThreshold = Date.now() - (subscriptionInactiveDays * 24 * 60 * 60 * 1000);

    console.log(`🔔 Marking inactive push subscriptions (no activity for ${subscriptionInactiveDays} days)...`);
    
    const subscriptionQuery = db.collection('pushSubscriptions')
      .where('status', '==', 'active')
      .where('lastUsed', '<', subscriptionThreshold)
      .limit(500);

    let subscriptionBatch = db.batch();
    let subscriptionCount = 0;
    
    const subscriptionSnapshot = await subscriptionQuery.get();
    
    subscriptionSnapshot.docs.forEach((doc) => {
      subscriptionBatch.update(doc.ref, {
        status: 'inactive',
        inactivatedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      subscriptionCount++;
    });

    if (subscriptionCount > 0) {
      await subscriptionBatch.commit();
      results.pushSubscriptions.updated = subscriptionCount;
      console.log(`✅ Marked ${subscriptionCount} subscriptions as inactive`);
    }

    // =============================================
    // SUMMARY E METRICS
    // =============================================
    const duration = Date.now() - startTime;
    const totalOperations = 
      results.analyticsEvents.deleted + 
      results.deliveryLogs.deleted + 
      results.scheduledNotifications.deleted + 
      results.pushSubscriptions.updated;

    console.log('✅ Cleanup completed successfully!', {
      duration: `${duration}ms`,
      totalOperations,
      results
    });

    // Log cleanup metrics per monitoring
    await db.collection('_system_metrics').add({
      type: 'notification_cleanup',
      timestamp: FieldValue.serverTimestamp(),
      duration,
      results,
      success: true
    });

    return {
      success: true,
      duration,
      results
    };

  } catch (error) {
    console.error('❌ Cleanup failed:', error);

    // Log error metrics
    await db.collection('_system_metrics').add({
      type: 'notification_cleanup',
      timestamp: FieldValue.serverTimestamp(),
      error: error.message,
      success: false
    });

    throw error; // Re-throw per retry mechanism
  }
});

/**
 * Health Check Function per monitorare lo stato del cleanup
 * 
 * Può essere chiamata manualmente o schedulata per verificare:
 * - Ultima esecuzione del cleanup
 * - Performance metrics
 * - Errori recenti
 */
export const getCleanupStatus = onSchedule({
  schedule: '0 9 * * 1', // Ogni lunedì alle 9 AM
  timeZone: 'Europe/Rome',
  memory: '256MiB',
  region: 'europe-west1'
}, async (event) => {
  console.log('🔍 Checking cleanup status...');

  try {
    // Get last 7 cleanup executions
    const metricsSnapshot = await db.collection('_system_metrics')
      .where('type', '==', 'notification_cleanup')
      .orderBy('timestamp', 'desc')
      .limit(7)
      .get();

    const metrics = metricsSnapshot.docs.map(doc => doc.data());

    const stats = {
      lastExecution: metrics[0]?.timestamp || null,
      successRate: metrics.filter(m => m.success).length / metrics.length,
      avgDuration: metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / metrics.length,
      totalOperations: metrics.reduce((sum, m) => {
        const r = m.results || {};
        return sum + (r.analyticsEvents?.deleted || 0) + 
               (r.deliveryLogs?.deleted || 0) + 
               (r.scheduledNotifications?.deleted || 0) + 
               (r.pushSubscriptions?.updated || 0);
      }, 0),
      recentErrors: metrics.filter(m => !m.success).length
    };

    console.log('📊 Cleanup Status Report:', stats);

    // Alert if success rate < 80%
    if (stats.successRate < 0.8) {
      console.warn('⚠️ WARNING: Cleanup success rate below 80%!', {
        successRate: `${(stats.successRate * 100).toFixed(1)}%`,
        recentErrors: stats.recentErrors
      });
    }

    return stats;

  } catch (error) {
    console.error('❌ Failed to get cleanup status:', error);
    throw error;
  }
});
