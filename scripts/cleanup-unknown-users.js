// =============================================
// SCRIPT: Cleanup Unknown Users
// Rimuove i 32 utenti "Unknown User" orfani
// =============================================

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();
const auth = getAuth();

async function cleanupUnknownUsers() {
  console.log('🧹 Starting cleanup of Unknown Users...');
  
  let deletedCount = 0;
  let errorCount = 0;
  const errors = [];

  try {
    // Find all Unknown Users
    const unknownUsers = await db.collection('users')
      .where('firstName', '==', 'Unknown')
      .where('lastName', '==', 'User')
      .get();

    console.log(`📊 Found ${unknownUsers.size} Unknown Users to delete`);

    if (unknownUsers.size === 0) {
      console.log('✅ No Unknown Users found. Database is clean!');
      return { success: true, deleted: 0, errors: 0 };
    }

    // Delete each user
    for (const doc of unknownUsers.docs) {
      const userId = doc.id;
      const userData = doc.data();
      
      try {
        console.log(`🗑️  Deleting user: ${userId} (${userData.email || 'no email'})`);

        // 1. Delete Firestore document
        await doc.ref.delete();
        console.log(`   ✓ Deleted Firestore document`);

        // 2. Delete from Firebase Auth (if exists)
        try {
          await auth.deleteUser(userId);
          console.log(`   ✓ Deleted from Authentication`);
        } catch (authError) {
          if (authError.code === 'auth/user-not-found') {
            console.log(`   ⚠️  User not in Auth (already deleted)`);
          } else {
            throw authError;
          }
        }

        // 3. Delete related affiliations
        const affiliations = await db.collection('affiliations')
          .where('userId', '==', userId)
          .get();
        
        for (const affDoc of affiliations.docs) {
          await affDoc.ref.delete();
        }
        console.log(`   ✓ Deleted ${affiliations.size} affiliations`);

        deletedCount++;
        console.log(`✅ Successfully deleted user ${userId} (${deletedCount}/${unknownUsers.size})`);

      } catch (userError) {
        errorCount++;
        const errorMsg = `Failed to delete user ${userId}: ${userError.message}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 CLEANUP COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Successfully deleted: ${deletedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Error details:');
      errors.forEach(err => console.log(`   - ${err}`));
    }

    return {
      success: errorCount === 0,
      deleted: deletedCount,
      errors: errorCount,
      errorDetails: errors
    };

  } catch (error) {
    console.error('❌ Fatal error during cleanup:', error);
    throw error;
  }
}

// Verifica post-cleanup
async function verifyCleanup() {
  const remaining = await db.collection('users')
    .where('firstName', '==', 'Unknown')
    .where('lastName', '==', 'User')
    .get();

  console.log(`\n🔍 Verification: ${remaining.size} Unknown Users remaining`);
  
  if (remaining.size === 0) {
    console.log('✅ Database is clean! No Unknown Users found.');
  } else {
    console.log('⚠️  Warning: Some Unknown Users still exist.');
    remaining.docs.forEach(doc => {
      console.log(`   - ${doc.id}: ${doc.data().email || 'no email'}`);
    });
  }

  return remaining.size;
}

// Main execution
async function main() {
  try {
    console.log('\n🚀 UNKNOWN USERS CLEANUP SCRIPT');
    console.log('='.repeat(60));
    console.log(`Started at: ${new Date().toISOString()}`);
    console.log('='.repeat(60) + '\n');

    const result = await cleanupUnknownUsers();
    const remainingCount = await verifyCleanup();

    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL REPORT');
    console.log('='.repeat(60));
    console.log(`Users deleted: ${result.deleted}`);
    console.log(`Errors: ${result.errors}`);
    console.log(`Remaining Unknown Users: ${remainingCount}`);
    console.log(`Status: ${remainingCount === 0 ? '✅ SUCCESS' : '⚠️  INCOMPLETE'}`);
    console.log('='.repeat(60) + '\n');

    process.exit(remainingCount === 0 ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

// Run
main();
