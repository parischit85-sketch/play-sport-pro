// =============================================
// Cloud Function: migrateProfilesFromSubcollection
// Migrates user profiles from /clubs/{clubId}/profiles subcollection
// to /affiliations collection (Single Source of Truth)
// =============================================

import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  initializeApp();
}

/**
 * HTTP Cloud Function to migrate profiles from subcollections to affiliations
 * 
 * Usage:
 *   POST https://us-central1-m-padelweb.cloudfunctions.net/migrateProfilesFromSubcollection
 *   Body: { "dryRun": true }  // Set to false to actually execute migration
 * 
 * Security: Add authentication check before deploying to production
 */
export const migrateProfilesFromSubcollection = onRequest({
  region: 'europe-west1',
  maxInstances: 1,
  timeoutSeconds: 540,
  memory: '256MiB'
}, async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed. Use POST.' });
      return;
    }

    const db = getFirestore();
    const dryRun = req.body.dryRun !== false; // Default to dry run

    const results = {
      dryRun,
      clubsProcessed: 0,
      profilesFound: 0,
      affiliationsCreated: 0,
      affiliationsAlreadyExist: 0,
      profilesDeleted: 0,
      errors: [],
    };

    try {
      // Get all clubs
      const clubsSnapshot = await db.collection('clubs').get();
      console.log(`Found ${clubsSnapshot.size} clubs to process`);

      for (const clubDoc of clubsSnapshot.docs) {
        const clubId = clubDoc.id;
        const clubName = clubDoc.data().name || 'Unknown';

        try {
          // Get profiles subcollection
          const profilesSnapshot = await db
            .collection('clubs')
            .doc(clubId)
            .collection('profiles')
            .get();

          console.log(`Club ${clubName} (${clubId}): ${profilesSnapshot.size} profiles found`);
          results.clubsProcessed++;
          results.profilesFound += profilesSnapshot.size;

          for (const profileDoc of profilesSnapshot.docs) {
            const profileData = profileDoc.data();
            const userId = profileDoc.id;
            const affiliationId = `${userId}_${clubId}`;

            try {
              // Check if affiliation already exists
              const affiliationDoc = await db
                .collection('affiliations')
                .doc(affiliationId)
                .get();

              if (affiliationDoc.exists) {
                console.log(`Affiliation ${affiliationId} already exists, skipping`);
                results.affiliationsAlreadyExist++;
                
                // Delete profile even if affiliation exists (cleanup)
                if (!dryRun) {
                  await profileDoc.ref.delete();
                  results.profilesDeleted++;
                }
                
                continue;
              }

              // Create affiliation from profile data
              const newAffiliation = {
                userId: userId,
                clubId: clubId,
                role: profileData.role || 'player',
                status: profileData.status || 'approved',
                isClubAdmin: profileData.isClubAdmin || false,

                // Permission flags based on role
                canManageBookings: profileData.isClubAdmin || false,
                canManageCourts: profileData.isClubAdmin || false,
                canManageInstructors: profileData.isClubAdmin || false,
                canViewReports: profileData.isClubAdmin || false,
                canManageMembers: profileData.isClubAdmin || false,
                canManageSettings: profileData.isClubAdmin || false,

                // Preserve timestamps
                requestedAt: profileData.createdAt || FieldValue.serverTimestamp(),
                approvedAt: profileData.createdAt || FieldValue.serverTimestamp(),
                joinedAt: profileData.createdAt || FieldValue.serverTimestamp(),
                _createdAt: profileData.createdAt || FieldValue.serverTimestamp(),
                _updatedAt: FieldValue.serverTimestamp(),
              };

              if (!dryRun) {
                // Create affiliation
                await db.collection('affiliations').doc(affiliationId).set(newAffiliation);
                results.affiliationsCreated++;

                // Delete profile from subcollection
                await profileDoc.ref.delete();
                results.profilesDeleted++;

                console.log(`✅ Migrated ${userId} from club ${clubId}`);
              } else {
                console.log(`[DRY RUN] Would migrate ${userId} from club ${clubId}`);
                results.affiliationsCreated++; // Count for dry run
              }
            } catch (profileError) {
              const errorMsg = `Error processing profile ${userId} in club ${clubId}: ${profileError.message}`;
              console.error(errorMsg);
              results.errors.push(errorMsg);
            }
          }
        } catch (clubError) {
          const errorMsg = `Error processing club ${clubId}: ${clubError.message}`;
          console.error(errorMsg);
          results.errors.push(errorMsg);
        }
      }

      // Final report
      const report = {
        success: true,
        ...results,
        summary: dryRun
          ? `DRY RUN completed. Would have migrated ${results.affiliationsCreated} profiles.`
          : `Migration completed. Created ${results.affiliationsCreated} affiliations, deleted ${results.profilesDeleted} profiles.`,
      };

      console.log('Migration Report:', report);
      res.status(200).json(report);
    } catch (error) {
      console.error('Migration failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        results,
      });
    }
  });

/**
 * Verify migration was successful
 * 
 * Usage:
 *   GET https://us-central1-m-padelweb.cloudfunctions.net/verifyProfileMigration
 */
export const verifyProfileMigration = onRequest({
  region: 'europe-west1',
  maxInstances: 1,
  timeoutSeconds: 60,
  memory: '256MiB'
}, async (req, res) => {
    const db = getFirestore();

    try {
      const report = {
        clubsWithProfiles: 0,
        totalProfilesRemaining: 0,
        totalAffiliations: 0,
        clubs: [],
      };

      // Check all clubs for remaining profiles
      const clubsSnapshot = await db.collection('clubs').get();

      for (const clubDoc of clubsSnapshot.docs) {
        const clubId = clubDoc.id;
        const clubName = clubDoc.data().name || 'Unknown';

        const profilesSnapshot = await db
          .collection('clubs')
          .doc(clubId)
          .collection('profiles')
          .get();

        if (profilesSnapshot.size > 0) {
          report.clubsWithProfiles++;
          report.totalProfilesRemaining += profilesSnapshot.size;
          report.clubs.push({
            clubId,
            clubName,
            profilesRemaining: profilesSnapshot.size,
          });
        }
      }

      // Count total affiliations
      const affiliationsSnapshot = await db.collection('affiliations').get();
      report.totalAffiliations = affiliationsSnapshot.size;

      // Verdict
      report.migrationComplete = report.totalProfilesRemaining === 0;
      report.message = report.migrationComplete
        ? '✅ Migration complete! No profiles remaining in subcollections.'
        : `⚠️  ${report.totalProfilesRemaining} profiles still in subcollections across ${report.clubsWithProfiles} clubs.`;

      res.status(200).json(report);
    } catch (error) {
      console.error('Verification failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
