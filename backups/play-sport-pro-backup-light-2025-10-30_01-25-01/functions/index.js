// =============================================
// Firebase Cloud Functions - Entry Point
// =============================================

// Scheduled Functions
export { dailyCertificateCheck } from './scheduledCertificateReminders.js';
export { cleanupExpiredSubscriptions, cleanupInactiveSubscriptions } from './cleanupExpiredSubscriptions.js';
export { scheduledNotificationCleanup, getCleanupStatus } from './scheduledNotificationCleanup.js';

// Callable Functions
export { sendBulkCertificateNotifications } from './sendBulkNotifications.clean.js';

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

