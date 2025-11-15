/**
 * Cloud Function: Update Live Score from Public View
 * Allows public users with valid live scoring token to update match live scores and status
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

export const updateLiveScorePublic = onCall(async (request) => {
  const { clubId, tournamentId, matchId, status, liveScore, liveScoringToken } = request.data;

  // Validate input
  if (!clubId || !tournamentId || !matchId || !liveScoringToken) {
    throw new HttpsError('invalid-argument', 'Missing required parameters');
  }

  if (!status || !['scheduled', 'in_progress', 'completed'].includes(status)) {
    throw new HttpsError('invalid-argument', 'Invalid status');
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

    // Prepare update data
    const updateData = {
      status,
      updatedAt: Timestamp.now(),
    };

    // Add liveScore if provided
    if (liveScore) {
      updateData.liveScore = {
        team1: liveScore.team1 || 0,
        team2: liveScore.team2 || 0,
        sets: liveScore.sets || null,
        lastUpdated: Timestamp.now(),
      };
    }

    // Update match
    await matchRef.update(updateData);

    console.log(
      `✅ Live score updated for match ${matchId} in tournament ${tournamentId} by public user`
    );

    return {
      success: true,
      message: 'Live score updated successfully',
    };
  } catch (error) {
    console.error('❌ Error updating live score:', error);

    // Re-throw HttpsErrors
    if (error instanceof HttpsError) {
      throw error;
    }

    // Wrap other errors
    throw new HttpsError('internal', error.message || 'Error updating live score');
  }
});
