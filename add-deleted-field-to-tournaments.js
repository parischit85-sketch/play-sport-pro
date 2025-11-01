/**
 * Migration Script: Add 'deleted' field to existing tournaments
 *
 * This script adds the 'deleted' and 'deletedAt' fields to all existing tournaments
 * that don't have them yet. This is necessary for the trash/restore functionality.
 *
 * Run this script once to migrate existing tournaments:
 * node add-deleted-field-to-tournaments.js
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Load service account key
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function addDeletedFieldToTournaments() {
  console.log('🔄 Starting migration: Adding deleted field to tournaments...\n');

  try {
    // Get all clubs
    const clubsSnapshot = await db.collection('clubs').get();
    console.log(`📁 Found ${clubsSnapshot.size} clubs\n`);

    let totalTournaments = 0;
    let updatedTournaments = 0;
    let skippedTournaments = 0;

    // Process each club
    for (const clubDoc of clubsSnapshot.docs) {
      const clubId = clubDoc.id;
      const clubData = clubDoc.data();
      console.log(`\n🏢 Processing club: ${clubData.name || clubId}`);

      // Get all tournaments for this club
      const tournamentsSnapshot = await db
        .collection('clubs')
        .doc(clubId)
        .collection('tournaments')
        .get();

      console.log(`  📊 Found ${tournamentsSnapshot.size} tournaments`);
      totalTournaments += tournamentsSnapshot.size;

      // Process each tournament
      for (const tournamentDoc of tournamentsSnapshot.docs) {
        const tournamentData = tournamentDoc.data();
        const tournamentId = tournamentDoc.id;

        // Check if tournament already has the deleted field
        if (tournamentData.hasOwnProperty('deleted')) {
          console.log(
            `  ⏩ Skipped: ${tournamentData.name || tournamentId} (already has deleted field)`
          );
          skippedTournaments++;
          continue;
        }

        // Add deleted field (default to false)
        await tournamentDoc.ref.update({
          deleted: false,
          deletedAt: null,
        });

        console.log(`  ✅ Updated: ${tournamentData.name || tournamentId}`);
        updatedTournaments++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Migration completed successfully!');
    console.log('='.repeat(60));
    console.log(`📊 Total tournaments: ${totalTournaments}`);
    console.log(`✅ Updated: ${updatedTournaments}`);
    console.log(`⏩ Skipped: ${skippedTournaments}`);
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
addDeletedFieldToTournaments()
  .then(() => {
    console.log('👍 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
