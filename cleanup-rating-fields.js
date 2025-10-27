/**
 * CLEANUP SCRIPT: Remove wrong 'rating' field from players
 * 
 * Problem: Players have a 'rating' field stored in database (3000, 2000, etc.)
 * that is NOT the RPA ranking from matches. This causes wrong values to display.
 * 
 * Solution: Remove the 'rating' field from all players in clubs/{clubId}/users
 * so the system will only use the RPA ranking calculated from matches.
 * 
 * Usage: node cleanup-rating-fields.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteField } from 'firebase/firestore';

// Firebase config (same as your project)
const firebaseConfig = {
  apiKey: "AIzaSyBLviD8xL-3hQfUKxmNd4EQRH4CrNnwuCs",
  authDomain: "play-sport-pro-9d38c.firebaseapp.com",
  projectId: "play-sport-pro-9d38c",
  storageBucket: "play-sport-pro-9d38c.firebasestorage.app",
  messagingSenderId: "649414089422",
  appId: "1:649414089422:web:12aff59bca3eb17c12f481",
  measurementId: "G-03VEVJGDV6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupRatingFields() {
  console.log('🧹 Starting cleanup of wrong rating fields...\n');

  try {
    // Get all clubs
    const clubsSnapshot = await getDocs(collection(db, 'clubs'));
    console.log(`📊 Found ${clubsSnapshot.size} clubs\n`);

    let totalPlayers = 0;
    let playersWithRating = 0;
    let playersUpdated = 0;

    for (const clubDoc of clubsSnapshot.docs) {
      const clubId = clubDoc.id;
      const clubName = clubDoc.data().name || clubId;
      
      console.log(`\n🏛️  Processing club: ${clubName} (${clubId})`);

      // Get all users in this club
      const usersSnapshot = await getDocs(collection(db, `clubs/${clubId}/users`));
      console.log(`   📋 Found ${usersSnapshot.size} users`);

      totalPlayers += usersSnapshot.size;

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();

        // Check if user has 'rating' field
        if (userData.rating !== undefined) {
          playersWithRating++;
          
          const playerName = userData.name || userData.userName || userId;
          const currentRating = userData.rating;
          const tournamentRanking = userData.tournamentData?.currentRanking || 'N/A';
          const baseRating = userData.baseRating || 'N/A';

          console.log(`   ⚠️  Player: ${playerName}`);
          console.log(`      - Current 'rating': ${currentRating} ❌ (will be removed)`);
          console.log(`      - Tournament ranking: ${tournamentRanking}`);
          console.log(`      - Base rating: ${baseRating}`);

          // Remove the 'rating' field
          const userRef = doc(db, `clubs/${clubId}/users/${userId}`);
          await updateDoc(userRef, {
            rating: deleteField()
          });

          playersUpdated++;
          console.log(`      ✅ Removed 'rating' field\n`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total players processed: ${totalPlayers}`);
    console.log(`Players with 'rating' field: ${playersWithRating}`);
    console.log(`Players updated: ${playersUpdated}`);
    console.log('='.repeat(60));
    console.log('\n✅ Cleanup completed successfully!');
    console.log('\n📌 Next steps:');
    console.log('   1. Refresh your browser');
    console.log('   2. The system will now use only RPA ranking from matches');
    console.log('   3. Rankings will be calculated dynamically\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run cleanup
cleanupRatingFields();
