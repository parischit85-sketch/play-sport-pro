/**
 * Cloud Function: Record Final Match Result from Public View
 * Allows public users with valid live scoring token to record final match results
 * Replicates the logic of recordMatchResult from matchService.js
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  initializeApp();
}
const db = getFirestore();

// Constants
const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

export const recordFinalResultPublic = onCall(async (request) => {
  const { clubId, tournamentId, matchId, score, sets, liveScoringToken } = request.data;

  // Validate input
  if (!clubId || !tournamentId || !matchId || !liveScoringToken) {
    throw new HttpsError('invalid-argument', 'Missing required parameters');
  }

  if (!score || typeof score.team1 !== 'number' || typeof score.team2 !== 'number') {
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

    const matchData = matchSnap.data();

    // Determine winner
    let winnerId = null;
    if (score.team1 > score.team2) {
      winnerId = matchData.team1Id;
    } else if (score.team2 > score.team1) {
      winnerId = matchData.team2Id;
    }

    // Prepare result data
    const resultData = {
      score: {
        team1: score.team1,
        team2: score.team2,
        sets: sets || null,
      },
      sets: sets || null,
      winnerId,
      status: MATCH_STATUS.COMPLETED,
      completedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      // Clear liveScore when final result is set
      liveScore: null,
    };

    // Pre-fetch standings if needed (BEFORE transaction)
    let standingsRef = null;
    let standingsData = null;
    if (matchData.type === 'group' && matchData.groupId) {
      standingsRef = tournamentRef.collection('standings').doc(matchData.groupId);
      const standingsSnap = await standingsRef.get();
      if (standingsSnap.exists) {
        standingsData = standingsSnap.data();
      }
    }

    // Update match with final result using transaction
    await db.runTransaction(async (transaction) => {
      // Update match
      transaction.update(matchRef, resultData);

      // Update standings if it's a group match
      if (standingsRef && standingsData) {
        const teams = standingsData.teams || [];

        // Update team stats
        teams.forEach((team) => {
          if (team.teamId === matchData.team1Id) {
            team.matchesPlayed = (team.matchesPlayed || 0) + 1;
            if (winnerId === matchData.team1Id) {
              team.matchesWon = (team.matchesWon || 0) + 1;
              team.points = (team.points || 0) + 3;
            } else if (winnerId === matchData.team2Id) {
              team.matchesLost = (team.matchesLost || 0) + 1;
            } else {
              team.matchesDrawn = (team.matchesDrawn || 0) + 1;
              team.points = (team.points || 0) + 1;
            }
            team.setsWon = (team.setsWon || 0) + (score.team1 || 0);
            team.setsLost = (team.setsLost || 0) + (score.team2 || 0);
          } else if (team.teamId === matchData.team2Id) {
            team.matchesPlayed = (team.matchesPlayed || 0) + 1;
            if (winnerId === matchData.team2Id) {
              team.matchesWon = (team.matchesWon || 0) + 1;
              team.points = (team.points || 0) + 3;
            } else if (winnerId === matchData.team1Id) {
              team.matchesLost = (team.matchesLost || 0) + 1;
            } else {
              team.matchesDrawn = (team.matchesDrawn || 0) + 1;
              team.points = (team.points || 0) + 1;
            }
            team.setsWon = (team.setsWon || 0) + (score.team2 || 0);
            team.setsLost = (team.setsLost || 0) + (score.team1 || 0);
          }
        });

        transaction.update(standingsRef, { teams, updatedAt: Timestamp.now() });
      }
    });

    console.log(
      `✅ Final result recorded for match ${matchId} in tournament ${tournamentId} by public user`
    );

    return {
      success: true,
      winnerId,
      message: 'Final result recorded successfully',
    };
  } catch (error) {
    console.error('❌ Error recording final result:', error);

    // Re-throw HttpsErrors
    if (error instanceof HttpsError) {
      throw error;
    }

    // Wrap other errors
    throw new HttpsError('internal', error.message || 'Error recording final result');
  }
});
