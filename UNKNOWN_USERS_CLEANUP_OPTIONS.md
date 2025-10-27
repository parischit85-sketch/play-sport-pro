# Unknown Users Cleanup - Alternative Approach

## Problem
The cleanup script requires Firebase Admin SDK credentials (serviceAccountKey.json) which is not present locally and should not be committed to the repository for security reasons.

## Solution Options

### Option A: Run via Cloud Functions (RECOMMENDED)
Create a callable Cloud Function that can be triggered manually from Firebase Console or CLI.

**Advantages:**
- No local credentials needed
- Runs with proper security context
- Can be audited via Cloud Functions logs
- Safer approach for production database operations

**Implementation:**
```javascript
// functions/index.js
import { onCall } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export const cleanupUnknownUsers = onCall({ 
  maxInstances: 1,
  timeoutSeconds: 300, // 5 minutes max
  memory: '256MiB'
}, async (request) => {
  // Only allow super admins
  if (!request.auth || request.auth.token.superAdmin !== true) {
    throw new Error('Unauthorized: requires superAdmin role');
  }

  const db = getFirestore();
  const auth = getAuth();
  
  console.log('Starting Unknown Users cleanup...');
  
  let deletedCount = 0;
  let errorCount = 0;
  const errors = [];

  try {
    // Query Unknown Users
    const usersQuery = query(
      collection(db, 'users'),
      where('firstName', '==', 'Unknown'),
      where('lastName', '==', 'User')
    );
    
    const snapshot = await getDocs(usersQuery);
    console.log(`Found ${snapshot.size} Unknown Users to delete`);

    // Delete each user
    for (const doc of snapshot.docs) {
      const userId = doc.id;
      
      try {
        // 1. Delete Firestore user document
        await doc.ref.delete();
        
        // 2. Delete from Firebase Auth
        try {
          await auth.deleteUser(userId);
        } catch (authError) {
          if (authError.code !== 'auth/user-not-found') {
            throw authError;
          }
        }
        
        // 3. Delete affiliations
        const affiliationsQuery = query(
          collection(db, 'affiliations'),
          where('userId', '==', userId)
        );
        const affiliationsSnapshot = await getDocs(affiliationsQuery);
        
        const deletePromises = affiliationsSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);
        
        deletedCount++;
        console.log(`✅ Deleted user ${userId} (${deletedCount}/${snapshot.size})`);
        
      } catch (error) {
        errorCount++;
        errors.push({ userId, error: error.message });
        console.error(`❌ Error deleting user ${userId}:`, error);
      }
    }

    // Verify cleanup
    const verifySnapshot = await getDocs(usersQuery);
    const remainingCount = verifySnapshot.size;

    const result = {
      success: errorCount === 0,
      deletedCount,
      errorCount,
      remainingCount,
      errors
    };

    console.log('Cleanup complete:', result);
    return result;
    
  } catch (error) {
    console.error('Fatal error:', error);
    throw new Error(`Cleanup failed: ${error.message}`);
  }
});
```

**Deploy:**
```bash
firebase deploy --only functions:cleanupUnknownUsers
```

**Run:**
```bash
# Via Firebase CLI (requires superAdmin custom claim)
firebase functions:call cleanupUnknownUsers

# OR via Firebase Console:
# Functions > cleanupUnknownUsers > Testing > Run function
```

### Option B: Use Firebase Console (MANUAL)
Manually delete the 32 Unknown Users via Firebase Console.

**Steps:**
1. Go to https://console.firebase.google.com/project/play-sport-pro/firestore
2. Navigate to `users` collection
3. Filter by:
   - `firstName == "Unknown"`
   - `lastName == "User"`
4. For each user (32 total):
   - Copy the user ID
   - Delete the Firestore document
   - Go to Authentication > Users
   - Find user by ID and delete
   - Go to `affiliations` collection
   - Filter by `userId == [copied ID]`
   - Delete all matching affiliations

**Time estimate:** ~30 minutes (manual)

### Option C: Firebase Admin Credentials (NOT RECOMMENDED)
Download service account key from Firebase Console.

**⚠️ Security Warning:** Never commit serviceAccountKey.json to git!

**Steps:**
1. Firebase Console > Project Settings > Service Accounts
2. Generate new private key
3. Save as `serviceAccountKey.json` in project root
4. Add to `.gitignore`:
   ```
   serviceAccountKey.json
   ```
5. Run script:
   ```bash
   node scripts/cleanup-unknown-users.js
   ```
6. **DELETE the key file after use**

## Recommendation

Use **Option A (Cloud Function)** for the following reasons:
- ✅ Most secure (no local credentials)
- ✅ Auditable via Cloud Functions logs
- ✅ Can be retried if needed
- ✅ Proper authentication/authorization
- ✅ Works from any environment

## Implementation Status

- [ ] Create `cleanupUnknownUsers` Cloud Function
- [ ] Deploy function
- [ ] Add superAdmin custom claim to your user
- [ ] Test function via Firebase Console
- [ ] Run cleanup
- [ ] Verify results in Firestore

## Expected Result

After successful cleanup:
- ✅ 32 Unknown User documents deleted from Firestore `/users`
- ✅ 32 user accounts deleted from Firebase Authentication
- ✅ All associated affiliations deleted from `/affiliations`
- ✅ Zero remaining Unknown Users in database
- ✅ Cleaner admin dashboard
- ✅ More accurate analytics

## Next Steps

Let me know if you want me to:
1. Create the Cloud Function for cleanup (Option A - RECOMMENDED)
2. Guide you through manual cleanup (Option B)
3. Or proceed with Cloud Functions ES6 conversion while you handle cleanup manually
