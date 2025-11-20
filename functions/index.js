// =============================================
// Firebase Cloud Functions - Entry Point
// =============================================

// Scheduled Functions
export { dailyCertificateCheck } from './scheduledCertificateReminders.js';
export {
  cleanupExpiredSubscriptions,
  cleanupInactiveSubscriptions,
} from './cleanupExpiredSubscriptions.js';
export { scheduledNotificationCleanup, getCleanupStatus } from './scheduledNotificationCleanup.js';
export { cleanOldPushSubscriptions } from './cleanOldPushSubscriptions.js';

// Callable Functions
export { sendBulkCertificateNotifications } from './sendBulkNotifications.clean.js';
export { sendBulkPushNotification } from './sendBulkPushNotification.js';
export { getPushStatusForPlayers, sendTestPush } from './sendBulkNotifications.clean.js';
export {
  savePushSubscription,
  sendPushNotification,
  removePushSubscription,
} from './sendBulkNotifications.clean.js';

// HTTP Functions for Push (CORS-enabled for custom domains)
export {
  savePushSubscriptionHttp,
  sendPushNotificationHttp,
  removePushSubscriptionHttp,
} from './pushNotificationsHttp.js';
export { sendClubEmail } from './sendClubEmail.js';
export { submitProvisionalMatchResult } from './submitProvisionalMatchResult.js';
export { updateLiveScorePublic } from './updateLiveScorePublic.js';
export { recordFinalResultPublic } from './recordFinalResultPublic.js';

// Email Notification Triggers (CHK-401)
export { onBookingCreated, onBookingDeleted } from './sendBookingEmail.js';
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

// Admin Audit Logging (✅ New)
export { logAdminAction } from './logAdminAction.js';

// RBAC: Set User Role (✅ Bootstrap/admin) - DISABLED: missing BOOTSTRAP_ADMIN_TOKEN secret
// export { setUserRole } from './setUserRole.js';

// Link Orphan Profiles (✅ Admin tool)
export { searchFirebaseUsers, linkOrphanProfile, getOrphanProfiles } from './linkOrphanProfiles.js';

// Push Subscriptions Cleanup (⚠️ One-time migration)
export { deleteAllPushSubscriptions } from './deleteAllPushSubscriptions.js';

// User Notifications System (✅ In-app notifications)
export {
  getUserNotifications,
  markNotificationsAsRead,
  archiveNotifications,
  cleanupOldNotifications,
} from './userNotifications.js';
