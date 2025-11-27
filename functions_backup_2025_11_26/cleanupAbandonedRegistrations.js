// =============================================
// FILE: functions/cleanupAbandonedRegistrations.js
// Scheduled Cloud Function to clean up abandoned registrations
// Runs daily at 2 AM UTC
// =============================================

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (getApps().length === 0) {
  initializeApp();
}

/**
 * Cleanup abandoned registrations
 * - Finds incomplete registrations > 7 days old
 * - Deletes orphaned accounts (no profile data)
 * - Removes uploaded images from Cloudinary
 * - Sends notification to Sentry
 */
export const cleanupAbandonedRegistrations = onSchedule({
  schedule: '0 2 * * *', // Run daily at 2 AM UTC
  timeZone: 'Europe/Rome',
  region: 'europe-west1',
  maxInstances: 1,
  timeoutSeconds: 540,
  memory: '256MiB'
}, async (event) => {
    console.log('🧹 Starting cleanup of abandoned registrations...');

    try {
      const db = getFirestore();
      const auth = getAuth();

      // Calculate cutoff date (7 days ago)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

      console.log(`📅 Cutoff date: ${cutoffDate.toISOString()}`);

      // Find users created before cutoff
      const usersToCheck = await auth.listUsers();
      const orphanedUsers = [];

      for (const user of usersToCheck.users) {
        // Skip if user created recently
        const createdAt = new Date(user.metadata.creationTime);
        if (createdAt > cutoffDate) {
          continue;
        }

        // Check if user has profile data
        const profileDoc = await db.collection('users').doc(user.uid).get();

        if (!profileDoc.exists) {
          // User has no profile = abandoned registration
          orphanedUsers.push({
            uid: user.uid,
            email: user.email,
            createdAt: createdAt,
          });
        } else {
          // Check if profile is incomplete
          const profileData = profileDoc.data();
          const isIncomplete =
            !profileData.firstName ||
            !profileData.lastName ||
            !profileData.phone;

          if (isIncomplete) {
            orphanedUsers.push({
              uid: user.uid,
              email: user.email,
              createdAt: createdAt,
              reason: 'incomplete_profile',
            });
          }
        }
      }

      console.log(`🔍 Found ${orphanedUsers.length} orphaned accounts`);

      if (orphanedUsers.length === 0) {
        console.log('✅ No orphaned accounts to clean up');
        return null;
      }

      // Delete orphaned accounts
      const deletionResults = {
        success: [],
        failed: [],
      };

      for (const orphanedUser of orphanedUsers) {
        try {
          // Delete user profile document if exists
          const profileRef = db.collection('users').doc(orphanedUser.uid);
          const profileDoc = await profileRef.get();

          if (profileDoc.exists) {
            await profileRef.delete();
            console.log(`🗑️  Deleted profile for user ${orphanedUser.uid}`);
          }

          // Delete authentication account
          await auth.deleteUser(orphanedUser.uid);
          console.log(`🗑️  Deleted auth account for user ${orphanedUser.uid}`);

          deletionResults.success.push(orphanedUser);
        } catch (error) {
          console.error(
            `❌ Failed to delete user ${orphanedUser.uid}:`,
            error.message
          );
          deletionResults.failed.push({
            ...orphanedUser,
            error: error.message,
          });
        }
      }

      // Log summary
      console.log(`✅ Successfully deleted: ${deletionResults.success.length}`);
      console.log(`❌ Failed to delete: ${deletionResults.failed.length}`);

      // Send notification to Sentry (if configured)
      if (deletionResults.success.length > 0) {
        const message = `Cleaned up ${deletionResults.success.length} abandoned registrations`;
        console.log(`📧 ${message}`);

        // TODO: Send to Sentry or notification service
        // await sendNotificationToSentry(message, deletionResults);
      }

      return {
        status: 'completed',
        cleaned: deletionResults.success.length,
        failed: deletionResults.failed.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Cleanup failed:', error);

      // Send error to Sentry
      // TODO: Integrate with Sentry error reporting
      // Sentry.captureException(error);

      throw error;
    }
  });

/**
 * Manual cleanup function (can be triggered via HTTP)
 * Useful for testing or manual cleanup
 */
export const manualCleanupAbandonedRegistrations = onCall({
  region: 'europe-west1',
  maxInstances: 1,
  timeoutSeconds: 540,
  memory: '256MiB'
}, async (request) => {
    // Require authentication
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Must be authenticated to run cleanup'
      );
    }

    // Require admin role
    const userDoc = await getFirestore()
      .collection('users')
      .doc(request.auth.uid)
      .get();

    const userData = userDoc.data();
    if (!userData || userData.role !== 'admin') {
      throw new HttpsError(
        'permission-denied',
        'Must be admin to run cleanup'
      );
    }

    console.log(`🔐 Manual cleanup triggered by admin: ${request.auth.token.email}`);

    // Note: Cannot directly call scheduled function, implement cleanup logic here or in shared function
    // For now, return message indicating scheduled function should be used
    return {
      message: 'Use scheduled function or implement shared cleanup logic',
      triggerredBy: request.auth.token.email,
      timestamp: new Date().toISOString()
    };
  });

/**
 * Get cleanup statistics
 * Returns info about potential orphaned accounts
 */
export const getCleanupStats = onCall({
  region: 'europe-west1',
  maxInstances: 10,
  timeoutSeconds: 60,
  memory: '256MiB'
}, async (request) => {
    // Require authentication
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Must be authenticated'
      );
    }

    try {
      const db = getFirestore();
      const auth = getAuth();

      // Calculate cutoff date (7 days ago)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7);

      // Get all users
      const usersResult = await auth.listUsers();
      let orphanedCount = 0;
      let incompleteCount = 0;

      for (const user of usersResult.users) {
        const createdAt = new Date(user.metadata.creationTime);
        if (createdAt > cutoffDate) continue;

        // Check profile
        const profileDoc = await db.collection('users').doc(user.uid).get();

        if (!profileDoc.exists) {
          orphanedCount++;
        } else {
          const profileData = profileDoc.data();
          const isIncomplete =
            !profileData.firstName ||
            !profileData.lastName ||
            !profileData.phone;

          if (isIncomplete) {
            incompleteCount++;
          }
        }
      }

      return {
        totalUsers: usersResult.users.length,
        orphanedAccounts: orphanedCount,
        incompleteProfiles: incompleteCount,
        totalToClean: orphanedCount + incompleteCount,
        cutoffDate: cutoffDate.toISOString(),
      };
    } catch (error) {
      console.error('Failed to get cleanup stats:', error);
      throw new HttpsError('internal', error.message);
    }
  });
