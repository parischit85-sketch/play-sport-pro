/**
 * @fileoverview Match Service
 * Match management, scheduling, and result recording
 */

import { db } from '../../../services/firebase.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { COLLECTIONS, MATCH_STATUS, VALIDATION_MESSAGES } from '../utils/tournamentConstants.js';
import { validateMatchScore } from '../utils/tournamentValidation.js';
import { onMatchCompleted } from './tournamentWorkflow.js';
import { submitMatchResultWithTransaction } from './tournamentTransactions.js';

/**
 * Create a match
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Object} matchData
 * @returns {Promise<{success: boolean, matchId?: string, error?: string}>}
 */
export async function createMatch(clubId, tournamentId, matchData) {
  try {
    const match = {
      tournamentId,
      type: matchData.type, // 'group' or 'knockout'
      groupId: matchData.groupId || null,
      round: matchData.round || null,
      matchNumber: matchData.matchNumber || null,
      team1Id: matchData.team1Id,
      team2Id: matchData.team2Id,
      status: MATCH_STATUS.SCHEDULED,
      score: null,
      winnerId: null,
      nextMatchId: matchData.nextMatchId || null,
      nextMatchPosition: matchData.nextMatchPosition || null,
      scheduledDate: matchData.scheduledDate
        ? Timestamp.fromDate(new Date(matchData.scheduledDate))
        : null,
      completedAt: null,
      courtNumber: matchData.courtNumber || null,
      notes: matchData.notes || null,
      createdAt: Timestamp.now(),
    };

    const matchesRef = collection(
      db,
      'clubs',
      clubId,
      COLLECTIONS.TOURNAMENTS,
      tournamentId,
      COLLECTIONS.MATCHES
    );
    const docRef = await addDoc(matchesRef, match);

    return { success: true, matchId: docRef.id };
  } catch (error) {
    console.error('Error creating match:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get match by ID
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} matchId
 * @returns {Promise<Object | null>}
 */
export async function getMatch(clubId, tournamentId, matchId) {
  try {
    const matchRef = doc(
      db,
      'clubs',
      clubId,
      COLLECTIONS.TOURNAMENTS,
      tournamentId,
      COLLECTIONS.MATCHES,
      matchId
    );
    const matchSnap = await getDoc(matchRef);

    if (!matchSnap.exists()) {
      return null;
    }

    return {
      id: matchSnap.id,
      ...matchSnap.data(),
    };
  } catch (error) {
    console.error('Error getting match:', error);
    return null;
  }
}

/**
 * Get all matches for a tournament
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Object} options
 * @returns {Promise<Array>}
 */
export async function getMatches(clubId, tournamentId, options = {}) {
  try {
    const matchesRef = collection(
      db,
      'clubs',
      clubId,
      COLLECTIONS.TOURNAMENTS,
      tournamentId,
      COLLECTIONS.MATCHES
    );
    let q = query(matchesRef);

    // Apply filters
    if (options.type) {
      q = query(q, where('type', '==', options.type));
    }

    if (options.groupId) {
      q = query(q, where('groupId', '==', options.groupId));
    }

    if (options.round) {
      q = query(q, where('round', '==', options.round));
    }

    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }

    // Apply sorting
    if (options.sortBy) {
      q = query(q, orderBy(options.sortBy, options.sortOrder || 'asc'));
    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting matches:', error);
    return [];
  }
}

/**
 * Get matches by group
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} groupId
 * @returns {Promise<Array>}
 */
export async function getMatchesByGroup(clubId, tournamentId, groupId) {
  return await getMatches(clubId, tournamentId, { type: 'group', groupId });
}

/**
 * Get matches by round
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} round
 * @returns {Promise<Array>}
 */
export async function getMatchesByRound(clubId, tournamentId, round) {
  return await getMatches(clubId, tournamentId, { type: 'knockout', round });
}

/**
 * Record match result
 * Uses transaction to ensure atomic update of match and standings
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {import('../types/tournamentTypes').MatchResultDTO} resultData
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function recordMatchResult(clubId, tournamentId, resultData) {
  try {
    // Validate score
    const validation = validateMatchScore(resultData.score);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Get match to validate it exists
    const match = await getMatch(clubId, tournamentId, resultData.matchId);
    if (!match) {
      return { success: false, error: VALIDATION_MESSAGES.MATCH_NOT_FOUND };
    }

    // ✅ USE TRANSACTION: Submit result atomically
    console.log('💾 Submitting match result with transaction...');
    const transactionResult = await submitMatchResultWithTransaction(
      clubId,
      tournamentId,
      resultData.matchId,
      {
        score: resultData.score,
        bestOf: resultData.bestOf,
        sets: resultData.sets,
        completedAt: resultData.completedAt,
      }
    );

    if (!transactionResult.success) {
      console.error('❌ Transaction failed:', transactionResult.error);
      return { success: false, error: transactionResult.error };
    }

    console.log('✅ Match result submitted successfully');

    // Trigger standings update and phase check (separate operation)
    try {
      await onMatchCompleted(clubId, tournamentId, resultData.matchId);
    } catch (standingsError) {
      console.warn('⚠️ Standings update failed:', standingsError);
      // Result is saved, but standings might be inconsistent
      // This should be handled by a background job or manual recalculation
    }

    return { success: true, winnerId: transactionResult.winnerId };
  } catch (error) {
    console.error('❌ Error recording match result:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update match status
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} matchId
 * @param {string} status
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateMatchStatus(clubId, tournamentId, matchId, status) {
  try {
    const matchRef = doc(
      db,
      'clubs',
      clubId,
      COLLECTIONS.TOURNAMENTS,
      tournamentId,
      COLLECTIONS.MATCHES,
      matchId
    );

    await updateDoc(matchRef, {
      status,
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating match status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Schedule match
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} matchId
 * @param {Date} scheduledDate
 * @param {string} courtNumber
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function scheduleMatch(clubId, tournamentId, matchId, scheduledDate, courtNumber) {
  try {
    const matchRef = doc(
      db,
      'clubs',
      clubId,
      COLLECTIONS.TOURNAMENTS,
      tournamentId,
      COLLECTIONS.MATCHES,
      matchId
    );

    const updateData = {
      scheduledDate: scheduledDate ? Timestamp.fromDate(new Date(scheduledDate)) : null,
      courtNumber: courtNumber || null,
    };

    await updateDoc(matchRef, updateData);

    return { success: true };
  } catch (error) {
    console.error('Error scheduling match:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update match teams (team1Id, team2Id)
 * Constraints:
 *  - Not allowed if match is completed or has a recorded score/sets
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} matchId
 * @param {string} team1Id
 * @param {string} team2Id
 * @param {string} team1Name optional display name to cache
 * @param {string} team2Name optional display name to cache
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateMatchTeams(
  clubId,
  tournamentId,
  matchId,
  { team1Id, team2Id, team1Name, team2Name }
) {
  try {
    if (!team1Id || !team2Id) {
      return { success: false, error: 'Seleziona entrambe le squadre' };
    }
    if (team1Id === team2Id) {
      return { success: false, error: 'Le squadre devono essere diverse' };
    }

    const matchRef = doc(
      db,
      'clubs',
      clubId,
      COLLECTIONS.TOURNAMENTS,
      tournamentId,
      COLLECTIONS.MATCHES,
      matchId
    );
    const snap = await getDoc(matchRef);
    if (!snap.exists()) return { success: false, error: VALIDATION_MESSAGES.MATCH_NOT_FOUND };
    const match = snap.data();

    if (
      match.status === MATCH_STATUS.COMPLETED ||
      match.score ||
      (Array.isArray(match.sets) && match.sets.length)
    ) {
      return {
        success: false,
        error: 'Impossibile modificare le squadre: la partita ha già un risultato',
      };
    }

    await updateDoc(matchRef, {
      team1Id,
      team2Id,
      // keep optional cached names if present in schema
      ...(team1Name ? { team1Name } : {}),
      ...(team2Name ? { team2Name } : {}),
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating match teams:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get team matches (all matches where team participated)
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} teamId
 * @returns {Promise<Array>}
 */
export async function getTeamMatches(clubId, tournamentId, teamId) {
  try {
    const allMatches = await getMatches(clubId, tournamentId);
    return allMatches.filter((m) => m.team1Id === teamId || m.team2Id === teamId);
  } catch (error) {
    console.error('Error getting team matches:', error);
    return [];
  }
}

/**
 * Get head-to-head matches between two teams
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} team1Id
 * @param {string} team2Id
 * @returns {Promise<Array>}
 */
export async function getHeadToHeadMatches(clubId, tournamentId, team1Id, team2Id) {
  try {
    const allMatches = await getMatches(clubId, tournamentId);
    return allMatches.filter(
      (m) =>
        (m.team1Id === team1Id && m.team2Id === team2Id) ||
        (m.team1Id === team2Id && m.team2Id === team1Id)
    );
  } catch (error) {
    console.error('Error getting head-to-head matches:', error);
    return [];
  }
}

// Delete all knockout matches for a tournament
export async function deleteKnockoutMatches(clubId, tournamentId) {
  try {
    const matchesRef = collection(
      db,
      'clubs',
      clubId,
      COLLECTIONS.TOURNAMENTS,
      tournamentId,
      COLLECTIONS.MATCHES
    );
    const q = query(matchesRef, where('type', '==', 'knockout'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('📋 [deleteKnockoutMatches] No knockout matches found to delete');
      return { success: true, deleted: 0 };
    }

    console.log(`🗑️ [deleteKnockoutMatches] Deleting ${snapshot.docs.length} knockout matches`);

    // Delete all knockout matches
    const { deleteDoc } = await import('firebase/firestore');
    const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);

    console.log(`✅ [deleteKnockoutMatches] Deleted ${snapshot.docs.length} knockout matches`);
    return { success: true, deleted: snapshot.docs.length };
  } catch (error) {
    console.error('❌ Error deleting knockout matches:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clear match result - reset match to SCHEDULED status
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} matchId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function clearMatchResult(clubId, tournamentId, matchId) {
  try {
    const matchRef = doc(
      db,
      'clubs',
      clubId,
      COLLECTIONS.TOURNAMENTS,
      tournamentId,
      COLLECTIONS.MATCHES,
      matchId
    );

    // Reset match to scheduled state
    await updateDoc(matchRef, {
      status: MATCH_STATUS.SCHEDULED,
      score: null,
      sets: null,
      winnerId: null,
      completedAt: null,
    });

    console.log('✅ Match result cleared successfully');

    // TODO: Trigger standings recalculation for the group/tournament
    // This should be handled by recalculating all completed matches in the group
    try {
      console.warn('⚠️ Manual standings recalculation required after clearing match result');
      // onMatchResultCleared(clubId, tournamentId, matchId);
    } catch (error) {
      console.warn('⚠️ Could not trigger standings recalculation:', error);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing match result:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a single match
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} matchId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteMatch(clubId, tournamentId, matchId) {
  try {
    const matchRef = doc(
      db,
      'clubs',
      clubId,
      COLLECTIONS.TOURNAMENTS,
      tournamentId,
      COLLECTIONS.MATCHES,
      matchId
    );

    await deleteDoc(matchRef);

    console.log('✅ Match deleted successfully');

    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting match:', error);
    return { success: false, error: error.message };
  }
}

export default {
  createMatch,
  getMatch,
  getMatches,
  getMatchesByGroup,
  getMatchesByRound,
  recordMatchResult,
  clearMatchResult,
  deleteMatch,
  updateMatchStatus,
  scheduleMatch,
  getTeamMatches,
  getHeadToHeadMatches,
  updateMatchTeams,
  deleteKnockoutMatches,
};
