// =============================================
// Cloud Function: cleanupUnknownUsers
// Callable function to delete "Unknown User" orphaned accounts
// Requires authentication and superAdmin role
// =============================================

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (getApps().length === 0) {
  initializeApp();
}

/**
 * Cleanup Unknown Users
 * Deletes all users with firstName='Unknown' AND lastName='User'
 * 
 * Security: Requires authentication and superAdmin custom claim
 * 
 * Usage (from frontend):
 *   const functions = getFunctions();
 *   const cleanup = httpsCallable(functions, 'cleanupUnknownUsers');
 *   const result = await cleanup();
 * 
 * Usage (from Firebase Console):
 *   Functions > cleanupUnknownUsers > Testing > Run function
 */
export const cleanupUnknownUsers = onCall({
  region: 'europe-west1',
  maxInstances: 1,
  timeoutSeconds: 540,
  memory: '256MiB'
}, async (request) => {
  console.log('🚀 UNKNOWN USERS CLEANUP FUNCTION');
  console.log('=========================================================');
  console.log(`Triggered at: ${new Date().toISOString()}`);
  
  // Require authentication
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'Must be authenticated to run cleanup'
    );
  }

  // Check for superAdmin role (or admin role as fallback)
  const isSuperAdmin = request.auth.token.superAdmin === true;
  const isAdmin = request.auth.token.admin === true;
  
  if (!isSuperAdmin && !isAdmin) {
    console.log(`❌ Unauthorized access attempt by: ${request.auth.token.email}`);
    throw new HttpsError(
      'permission-denied',
      'Must have admin privileges to run cleanup. Contact administrator to grant admin role.'
    );
  }

  console.log(`🔐 Authorized by: ${request.auth.token.email} (admin: ${isAdmin}, superAdmin: ${isSuperAdmin})`);

  try {
    const db = getFirestore();
    const auth = getAuth();

    console.log('🧹 Starting cleanup of Unknown Users...');

    // Query Unknown Users
    const usersQuery = db.collection('users')
      .where('firstName', '==', 'Unknown')
      .where('lastName', '==', 'User');

    const snapshot = await usersQuery.get();
    console.log(`📊 Found ${snapshot.size} Unknown Users to delete`);

    if (snapshot.size === 0) {
      console.log('✅ No Unknown Users found. Database is clean!');
      return {
        success: true,
        message: 'No Unknown Users found',
        deleted: 0,
        errors: 0,
        remaining: 0
      };
    }

    let deletedCount = 0;
    let errorCount = 0;
    const errors = [];

    // Delete each user
    for (const doc of snapshot.docs) {
      const userId = doc.id;
      const userData = doc.data();

      try {
        console.log(`🗑️  Processing user ${userId} (${deletedCount + 1}/${snapshot.size})`);

        // 1. Delete Firestore user document
        await doc.ref.delete();
        console.log(`  ✓ Deleted Firestore document`);

        // 2. Delete from Firebase Auth
        try {
          await auth.deleteUser(userId);
          console.log(`  ✓ Deleted from Firebase Auth`);
        } catch (authError) {
          if (authError.code === 'auth/user-not-found') {
            console.log(`  ℹ️ User not found in Auth (already deleted or never existed)`);
          } else {
            throw authError;
          }
        }

        // 3. Delete affiliations
        const affiliationsQuery = db.collection('affiliations')
          .where('userId', '==', userId);
        const affiliationsSnapshot = await affiliationsQuery.get();

        if (affiliationsSnapshot.size > 0) {
          console.log(`  🗑️  Deleting ${affiliationsSnapshot.size} affiliations`);
          const deletePromises = affiliationsSnapshot.docs.map(doc => doc.ref.delete());
          await Promise.all(deletePromises);
          console.log(`  ✓ Deleted ${affiliationsSnapshot.size} affiliations`);
        }

        deletedCount++;
        console.log(`✅ Successfully deleted user ${userId} (${deletedCount}/${snapshot.size})`);

      } catch (error) {
        errorCount++;
        const errorMsg = `Error deleting user ${userId}: ${error.message}`;
        errors.push({
          userId,
          email: userData.email || 'unknown',
          error: error.message
        });
        console.error(`❌ ${errorMsg}`);
      }
    }

    // Verify cleanup
    console.log('🔍 Verifying cleanup...');
    const verifySnapshot = await usersQuery.get();
    const remainingCount = verifySnapshot.size;

    // Final report
    const report = {
      success: errorCount === 0,
      message: errorCount === 0
        ? `✅ Cleanup complete! Deleted ${deletedCount} Unknown Users.`
        : `⚠️ Cleanup completed with errors. Deleted ${deletedCount}, failed ${errorCount}.`,
      deleted: deletedCount,
      errors: errorCount,
      remaining: remainingCount,
      errorDetails: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
      triggeredBy: request.auth.token.email
    };

    console.log('📊 CLEANUP REPORT:');
    console.log(`  ✅ Successfully deleted: ${deletedCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);
    console.log(`  📋 Remaining: ${remainingCount}`);
    console.log('=========================================================');

    if (remainingCount > 0) {
      console.warn(`⚠️ ${remainingCount} Unknown Users still remain. Review errors and retry.`);
    } else {
      console.log('🎉 All Unknown Users successfully removed!');
    }

    return report;

  } catch (error) {
    console.error('❌ Fatal error during cleanup:', error);
    throw new HttpsError('internal', `Cleanup failed: ${error.message}`);
  }
});
