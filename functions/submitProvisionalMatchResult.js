/**
 * Cloud Function: Submit Provisional Match Result
 * Allows public users with valid live scoring token to submit provisional match results
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const db = getFirestore();

export const submitProvisionalMatchResult = onCall(async (request) => {
  const { clubId, tournamentId, matchId, provisionalData, liveScoringToken } = request.data;

  // Validate input
  if (!clubId || !tournamentId || !matchId || !provisionalData || !liveScoringToken) {
    throw new HttpsError('invalid-argument', 'Missing required parameters');
  }

  if (
    !provisionalData.score ||
    typeof provisionalData.score.team1 !== 'number' ||
    typeof provisionalData.score.team2 !== 'number'
  ) {
    throw new HttpsError('invalid-argument', 'Invalid score data');
  }

  try {
    // Get tournament to verify token
    const tournamentRef = db
      .collection('clubs')
      .doc(clubId)
      .collection('tournaments')
      .doc(tournamentId);
    const tournamentSnap = await tournamentRef.get();

    if (!tournamentSnap.exists) {
      throw new HttpsError('not-found', 'Tournament not found');
    }

    const tournamentData = tournamentSnap.data();

    // Verify live scoring is enabled and token matches
    if (!tournamentData.publicView?.liveScoringEnabled) {
      throw new HttpsError('permission-denied', 'Live scoring is not enabled for this tournament');
    }

    if (tournamentData.publicView?.liveScoringToken !== liveScoringToken) {
      throw new HttpsError('permission-denied', 'Invalid live scoring token');
    }

    // Get match to verify it exists
    const matchRef = tournamentRef.collection('matches').doc(matchId);
    const matchSnap = await matchRef.get();

    if (!matchSnap.exists) {
      throw new HttpsError('not-found', 'Match not found');
    }

    // Update match with provisional result
    await matchRef.update({
      provisionalScore: provisionalData.score,
      provisionalSets: provisionalData.sets || null,
      provisionalSubmittedBy: provisionalData.submittedBy || 'Anonymous',
      provisionalSubmittedAt: Timestamp.now(),
      provisionalStatus: 'pending', // pending | confirmed | rejected
    });

    console.log(
      `✅ Provisional result submitted for match ${matchId} in tournament ${tournamentId}`
    );

    return {
      success: true,
      message: 'Provisional result submitted successfully',
    };
  } catch (error) {
    console.error('❌ Error submitting provisional result:', error);

    // Re-throw HttpsErrors
    if (error instanceof HttpsError) {
      throw error;
    }

    // Wrap other errors
    throw new HttpsError('internal', error.message || 'Error submitting provisional result');
  }
});
