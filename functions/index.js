import 'dotenv/config';
import * as functions from 'firebase-functions/v1';
import { sendPushNotificationToUser, sendPushNotificationToUserHTTP } from './sendPushNotificationToUser.js';
import { sendBulkNotifications, sendBulkNotificationsHTTP } from './sendBulkNotifications.js';

// =============================================
// RESTORED FUNCTIONS FROM BACKUP
// =============================================

// Scheduled Functions
export { dailyCertificateCheck } from './scheduledCertificateReminders.js';
export { cleanupExpiredSubscriptions, cleanupInactiveSubscriptions } from './cleanupExpiredSubscriptions.js';
export { scheduledNotificationCleanup, getCleanupStatus } from './scheduledNotificationCleanup.js';
export { pruneInactiveSubscriptions } from './pruneSubscriptions.js';

// Ranking Notifications (Weekly digest + overtake alerts)
export { weeklyRankingDigest, onRankingChange } from './rankingNotifications.js';

// Callable Functions
export { sendBulkCertificateNotifications } from './sendBulkNotifications.clean.js';

// Email Notification Triggers (CHK-401)
export { onBookingCreated, onBookingDeleted, onBookingUpdated } from './sendBookingEmail.js';
export { onMatchCreated, onMatchUpdated } from './sendMatchEmail.js';

// Data Migration Functions (✅ Converted to ES6)
export { migrateProfilesFromSubcollection, verifyProfileMigration } from './migrateProfiles.js';

// Cleanup Functions (✅ Converted to ES6)
export {
  cleanupAbandonedRegistrations,
  manualCleanupAbandonedRegistrations,
  getCleanupStats,
} from './cleanupAbandonedRegistrations.js';

// Unknown Users Cleanup (✅ New - Sprint 1)
export { cleanupUnknownUsers } from './cleanupUnknownUsers.js';

// =============================================
// USER NOTIFICATIONS & ORPHAN PROFILES
// =============================================

export {
  getUserNotifications,
  markNotificationsAsRead,
  archiveNotifications,
  cleanupOldNotifications,
} from './userNotifications.js';

export {
  getOrphanProfiles,
  searchFirebaseUsers,
  linkOrphanProfile,
  restorePlayerProfile,
} from './linkOrphanProfiles.js';

export { logAdminAction } from './logAdminAction.js';
export { deleteAllPushSubscriptions } from './deleteAllPushSubscriptions.js';

// =============================================
// RESTORED LEGACY FUNCTIONS (2025-11-26)
// =============================================

export { cleanOldPushSubscriptions } from './cleanOldPushSubscriptions.js';
export { sendBulkPushNotification } from './sendBulkPushNotification.js';

// HTTP Functions for Push (Legacy - CORS-enabled for custom domains)
export {
  savePushSubscriptionHttp,
  sendPushNotificationHttp,
  removePushSubscriptionHttp,
} from './pushNotificationsHttp.js';

export { sendClubEmail } from './sendClubEmail.js';
export { submitProvisionalMatchResult } from './submitProvisionalMatchResult.js';
export { updateLiveScorePublic } from './updateLiveScorePublic.js';
export { recordFinalResultPublic } from './recordFinalResultPublic.js';

// RBAC: Set User Role (Bootstrap/admin)
// export { setUserRole } from './setUserRole.js';

// =============================================
// NEW PUSH NOTIFICATION FUNCTIONS (V2)
// =============================================

/**
 * Callable function - Invia push a singolo utente
 * Uso: firebase.functions().httpsCallable('sendPushToUser')({ userId, payload })
 */
export const sendPushToUser = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Verifica autenticazione
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { userId, payload } = data;

    if (!userId || !payload) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: userId, payload'
      );
    }

    try {
      const result = await sendPushNotificationToUser(userId, payload);
      return result;
    } catch (error) {
      console.error('Error in sendPushToUser:', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  });

/**
 * HTTP function - Invia push a singolo utente
 * Uso: POST https://REGION-PROJECT_ID.cloudfunctions.net/sendPushToUserHTTP
 */
export const sendPushToUserHTTP = functions
  .region('europe-west1')
  .https.onRequest(sendPushNotificationToUserHTTP);

/**
 * Callable function - Invia push a multipli utenti
 * Uso: firebase.functions().httpsCallable('sendBulkPush')({ userIds, payload })
 */
export const sendBulkPush = functions
  .region('europe-west1')
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB',
  })
  .https.onCall(async (data, context) => {
    // Verifica autenticazione e permessi admin
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    // Verifica se utente è admin (opzionale - personalizza secondo le tue regole)
    const isAdmin = context.auth.token.admin === true ||
                    context.auth.token.role === 'admin' ||
                    context.auth.token.superAdmin === true;

    if (!isAdmin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can send bulk notifications'
      );
    }

    const { userIds, payload } = data;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing or invalid userIds array'
      );
    }

    if (!payload || !payload.title || !payload.body) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required payload fields: title, body'
      );
    }

    try {
      const result = await sendBulkNotifications(userIds, payload);
      return result;
    } catch (error) {
      console.error('Error in sendBulkPush:', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  });

/**
 * HTTP function - Invia push a multipli utenti
 * Uso: POST https://REGION-PROJECT_ID.cloudfunctions.net/sendBulkPushHTTP
 */
export const sendBulkPushHTTP = functions
  .region('europe-west1')
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB',
  })
  .https.onRequest(sendBulkNotificationsHTTP);

console.log('✅ Cloud Functions loaded successfully (Restored + V2)');

