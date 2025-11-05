/**
 * @fileoverview Tournament Transaction Service
 * Provides atomic operations with rollback capabilities
 */

import { db } from '../../../services/firebase.js';
import {
  runTransaction,
  doc,
  getDoc,
  updateDoc,
  writeBatch,
  collection,
  getDocs,
  query,
  where,
  deleteField,
} from 'firebase/firestore';
import { COLLECTIONS, TOURNAMENT_STATUS } from '../utils/tournamentConstants.js';

/**
 * Advance tournament phase with transaction
 * Ensures atomic update - either all succeeds or all fails
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} newStatus
 * @param {Object} additionalData - Additional fields to update
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function advancePhaseWithTransaction(
  clubId,
  tournamentId,
  newStatus,
  additionalData = {}
) {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const tournamentRef = doc(db, 'clubs', clubId, COLLECTIONS.TOURNAMENTS, tournamentId);
      const tournamentDoc = await transaction.get(tournamentRef);

      if (!tournamentDoc.exists()) {
        throw new Error('Torneo non trovato');
      }

      const currentTournament = tournamentDoc.data();
      const currentStatus = currentTournament.status;

      // Validate phase transition
      const isValidTransition = validatePhaseTransition(currentStatus, newStatus);
      if (!isValidTransition) {
        throw new Error(`Transizione non valida: ${currentStatus} → ${newStatus}`);
      }

      // Update tournament status and additional data
      const updateData = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        ...additionalData,
        phaseHistory: [
          ...(currentTournament.phaseHistory || []),
          {
            from: currentStatus,
            to: newStatus,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      transaction.update(tournamentRef, updateData);

      return { success: true, previousStatus: currentStatus };
    });

    console.log(`✅ Phase advanced: ${result.previousStatus} → ${newStatus}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Transaction failed:', error);
    return {
      success: false,
      error: error.message || 'Errore durante avanzamento fase',
    };
  }
}

/**
 * Generate groups with transaction
 * Atomically creates groups and updates tournament
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Array} groups
 * @param {Array} matches - Optional: generated matches
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function createGroupsWithTransaction(clubId, tournamentId, groups, matches = []) {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const tournamentRef = doc(db, 'clubs', clubId, COLLECTIONS.TOURNAMENTS, tournamentId);
      const tournamentDoc = await transaction.get(tournamentRef);

      if (!tournamentDoc.exists()) {
        throw new Error('Torneo non trovato');
      }

      // Update tournament with groups
      transaction.update(tournamentRef, {
        groups,
        status: TOURNAMENT_STATUS.GROUPS_PHASE,
        'configuration.generatedAt': new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Note: Matches are created separately with batch write
      // because transaction has limit of 500 operations

      return { success: true, groupsCount: groups.length };
    });

    console.log(`✅ Groups created: ${result.groupsCount} groups`);
    return { success: true };
  } catch (error) {
    console.error('❌ Transaction failed:', error);
    return {
      success: false,
      error: error.message || 'Errore durante creazione gironi',
    };
  }
}

/**
 * Update match result with transaction
 * Ensures atomic update of match and standings
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} matchId
 * @param {Object} resultData
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function submitMatchResultWithTransaction(clubId, tournamentId, matchId, resultData) {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const matchRef = doc(
        db,
        'clubs',
        clubId,
        COLLECTIONS.TOURNAMENTS,
        tournamentId,
        COLLECTIONS.MATCHES,
        matchId
      );
      const matchDoc = await transaction.get(matchRef);

      if (!matchDoc.exists()) {
        throw new Error('Partita non trovata');
      }

      const match = matchDoc.data();

      // Allow editing even if already completed, but protect knockout chains

      // Determine winner
      const winnerId =
        resultData.score.team1 > resultData.score.team2
          ? match.team1Id
          : resultData.score.team2 > resultData.score.team1
            ? match.team2Id
            : null;

      // Prepare potential next match update (READS FIRST, WRITES LATER)
      let nextMatchRef = null;
      let nextMatchUpdate = null;
      if (match.type === 'knockout' && match.nextMatchId && winnerId) {
        nextMatchRef = doc(
          db,
          'clubs',
          clubId,
          COLLECTIONS.TOURNAMENTS,
          tournamentId,
          COLLECTIONS.MATCHES,
          match.nextMatchId
        );

        // READ next match before any write to satisfy Firestore transaction rules
        const nextSnap = await transaction.get(nextMatchRef);
        if (nextSnap.exists()) {
          const nextMatch = nextSnap.data();
          // If next match is already completed, block edit to avoid corrupting the bracket
          if (nextMatch.status === 'completed') {
            throw new Error('Impossibile modificare: la partita successiva è già completata');
          }
        }

        const updateField = match.nextMatchPosition === 1 ? 'team1Id' : 'team2Id';
        const nameField = match.nextMatchPosition === 1 ? 'team1Name' : 'team2Name';
        const winnerName = winnerId === match.team1Id ? match.team1Name : match.team2Name;

        nextMatchUpdate = {
          [updateField]: winnerId,
          [nameField]: winnerName,
          status: 'scheduled', // Match is now ready
          updatedAt: new Date().toISOString(),
        };
      }

      // Now perform WRITES after all reads
      // ✅ PRESERVE STATUS: If match is in_progress, keep it (provisional result)
      // Otherwise, set to completed (final result)
      const newStatus = match.status === 'in_progress' ? 'in_progress' : 'completed';
      
      transaction.update(matchRef, {
        score: resultData.score,
        bestOf: resultData?.bestOf || null,
        sets: Array.isArray(resultData?.sets) ? resultData.sets : null,
        winnerId,
        status: newStatus,
        completedAt: resultData.completedAt,
        updatedAt: new Date().toISOString(),
      });

      if (nextMatchRef && nextMatchUpdate) {
        transaction.update(nextMatchRef, nextMatchUpdate);
      }

      return { success: true, winnerId };
    });

    console.log(`✅ Match result submitted: Winner ${result.winnerId}`);
    return { success: true, winnerId: result.winnerId };
  } catch (error) {
    console.error('❌ Transaction failed:', error);
    return {
      success: false,
      error: error.message || 'Errore durante salvataggio risultato',
    };
  }
}

/**
 * Rollback tournament to previous phase
 * Emergency function to undo phase advancement
 * @param {string} clubId
 * @param {string} tournamentId
 * @returns {Promise<{success: boolean, error?: string, rolledBackTo?: string}>}
 */
export async function rollbackToPreviousPhase(clubId, tournamentId) {
  try {
    const tournamentRef = doc(db, 'clubs', clubId, COLLECTIONS.TOURNAMENTS, tournamentId);
    const tournamentDoc = await getDoc(tournamentRef);

    if (!tournamentDoc.exists()) {
      return { success: false, error: 'Torneo non trovato' };
    }

    const tournament = tournamentDoc.data();
    const phaseHistory = tournament.phaseHistory || [];

    if (phaseHistory.length === 0) {
      return { success: false, error: 'Nessuna cronologia disponibile per il rollback' };
    }

    // Get last phase transition
    const lastTransition = phaseHistory[phaseHistory.length - 1];
    const previousStatus = lastTransition.from;

    // If rolling back from GROUPS_GENERATION → REGISTRATION_CLOSED or GROUPS_PHASE → REGISTRATION_CLOSED
    if (
      (lastTransition.to === TOURNAMENT_STATUS.GROUPS_GENERATION ||
        lastTransition.to === TOURNAMENT_STATUS.GROUPS_PHASE) &&
      previousStatus === TOURNAMENT_STATUS.REGISTRATION_CLOSED
    ) {
      // Delete all group stage matches for this tournament in batches
      const matchesColl = collection(
        db,
        'clubs',
        clubId,
        COLLECTIONS.TOURNAMENTS,
        tournamentId,
        COLLECTIONS.MATCHES
      );
      const qGroups = query(matchesColl, where('type', '==', 'group'));
      const snap = await getDocs(qGroups);

      if (!snap.empty) {
        let batch = writeBatch(db);
        let ops = 0;

        for (const docSnap of snap.docs) {
          batch.delete(docSnap.ref);
          ops++;
          if (ops >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            ops = 0;
          }
        }
        if (ops > 0) {
          await batch.commit();
        }
      }

      // Delete all standings for this tournament in batches
      const standingsColl = collection(
        db,
        'clubs',
        clubId,
        COLLECTIONS.TOURNAMENTS,
        tournamentId,
        'standings'
      );
      const snapStandings = await getDocs(standingsColl);

      if (!snapStandings.empty) {
        let batch = writeBatch(db);
        let ops = 0;

        for (const docSnap of snapStandings.docs) {
          batch.delete(docSnap.ref);
          ops++;
          if (ops >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            ops = 0;
          }
        }
        if (ops > 0) {
          await batch.commit();
        }
      }

      // Reset groupId and groupPosition for all teams
      const teamsColl = collection(
        db,
        'clubs',
        clubId,
        COLLECTIONS.TOURNAMENTS,
        tournamentId,
        COLLECTIONS.TEAMS
      );
      const snapTeams = await getDocs(teamsColl);

      if (!snapTeams.empty) {
        let batch = writeBatch(db);
        let ops = 0;

        for (const docSnap of snapTeams.docs) {
          batch.update(docSnap.ref, {
            groupId: null,
            groupPosition: null,
          });
          ops++;
          if (ops >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            ops = 0;
          }
        }
        if (ops > 0) {
          await batch.commit();
        }
      }

      // Remove groups configuration and reset match counts
      await updateDoc(tournamentRef, {
        groups: deleteField(),
        totalMatches: 0,
        completedMatches: 0,
        updatedAt: new Date().toISOString(),
      });
    } else if (
      lastTransition.to === TOURNAMENT_STATUS.GROUPS_PHASE &&
      previousStatus === TOURNAMENT_STATUS.REGISTRATION_CLOSED
    ) {
      // Legacy: If rolling back only from GROUPS_PHASE → REGISTRATION_CLOSED (without GROUPS_GENERATION)
      // Delete all group stage matches for this tournament in batches
      const matchesColl = collection(
        db,
        'clubs',
        clubId,
        COLLECTIONS.TOURNAMENTS,
        tournamentId,
        COLLECTIONS.MATCHES
      );
      const qGroups = query(matchesColl, where('type', '==', 'group'));
      const snap = await getDocs(qGroups);

      if (!snap.empty) {
        let batch = writeBatch(db);
        let ops = 0;

        for (const docSnap of snap.docs) {
          batch.delete(docSnap.ref);
          ops++;
          if (ops >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            ops = 0;
          }
        }
        if (ops > 0) {
          await batch.commit();
        }
      }

      // Delete all standings for this tournament in batches
      const standingsColl = collection(
        db,
        'clubs',
        clubId,
        COLLECTIONS.TOURNAMENTS,
        tournamentId,
        'standings'
      );
      const snapStandings = await getDocs(standingsColl);

      if (!snapStandings.empty) {
        let batch = writeBatch(db);
        let ops = 0;

        for (const docSnap of snapStandings.docs) {
          batch.delete(docSnap.ref);
          ops++;
          if (ops >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            ops = 0;
          }
        }
        if (ops > 0) {
          await batch.commit();
        }
      }

      // Reset groupId and groupPosition for all teams
      const teamsColl = collection(
        db,
        'clubs',
        clubId,
        COLLECTIONS.TOURNAMENTS,
        tournamentId,
        COLLECTIONS.TEAMS
      );
      const snapTeams = await getDocs(teamsColl);

      if (!snapTeams.empty) {
        let batch = writeBatch(db);
        let ops = 0;

        for (const docSnap of snapTeams.docs) {
          batch.update(docSnap.ref, {
            groupId: null,
            groupPosition: null,
          });
          ops++;
          if (ops >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            ops = 0;
          }
        }
        if (ops > 0) {
          await batch.commit();
        }
      }

      // Remove groups configuration and reset match counts
      await updateDoc(tournamentRef, {
        groups: deleteField(),
        totalMatches: 0,
        completedMatches: 0,
        updatedAt: new Date().toISOString(),
      });
    }

    // If rolling back from KNOCKOUT phase, purge knockout data (matches + bracket config)
    if (lastTransition.to === TOURNAMENT_STATUS.KNOCKOUT_PHASE) {
      // Delete all knockout matches for this tournament in batches
      const matchesColl = collection(
        db,
        'clubs',
        clubId,
        COLLECTIONS.TOURNAMENTS,
        tournamentId,
        COLLECTIONS.MATCHES
      );
      const qKnockout = query(matchesColl, where('type', '==', 'knockout'));
      const snap = await getDocs(qKnockout);

      if (!snap.empty) {
        let batch = writeBatch(db);
        let ops = 0;

        for (const docSnap of snap.docs) {
          batch.delete(docSnap.ref);
          ops++;
          if (ops >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            ops = 0;
          }
        }
        if (ops > 0) {
          await batch.commit();
        }
      }

      // Remove bracket-related configuration fields
      await updateDoc(tournamentRef, {
        knockoutBracket: deleteField(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Rollback to previous status
    await updateDoc(tournamentRef, {
      status: previousStatus,
      updatedAt: new Date().toISOString(),
      phaseHistory: phaseHistory.slice(0, -1), // Remove last entry
      rollbackInfo: {
        rolledBackFrom: lastTransition.to,
        rolledBackTo: previousStatus,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`✅ Rollback successful: ${lastTransition.to} → ${previousStatus}`);
    return {
      success: true,
      rolledBackTo: previousStatus,
      message: `Torneo riportato allo stato: ${previousStatus}`,
    };
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    return {
      success: false,
      error: error.message || 'Errore durante il rollback',
    };
  }
}

/**
 * Validate phase transition is allowed
 * @param {string} currentPhase
 * @param {string} newPhase
 * @returns {boolean}
 */
function validatePhaseTransition(currentPhase, newPhase) {
  const validTransitions = {
    [TOURNAMENT_STATUS.DRAFT]: [TOURNAMENT_STATUS.REGISTRATION_OPEN],
    [TOURNAMENT_STATUS.REGISTRATION_OPEN]: [
      TOURNAMENT_STATUS.REGISTRATION_CLOSED,
      TOURNAMENT_STATUS.DRAFT,
    ],
    [TOURNAMENT_STATUS.REGISTRATION_CLOSED]: [
      TOURNAMENT_STATUS.GROUPS_PHASE,
      TOURNAMENT_STATUS.REGISTRATION_OPEN,
    ],
    [TOURNAMENT_STATUS.GROUPS_PHASE]: [TOURNAMENT_STATUS.KNOCKOUT_PHASE],
    [TOURNAMENT_STATUS.KNOCKOUT_PHASE]: [TOURNAMENT_STATUS.COMPLETED],
    [TOURNAMENT_STATUS.COMPLETED]: [], // No transitions from completed
  };

  return validTransitions[currentPhase]?.includes(newPhase) || false;
}

/**
 * Batch delete tournament and all related data
 * @param {string} clubId
 * @param {string} tournamentId
 * @returns {Promise<{success: boolean, error?: string, deletedCount?: number}>}
 */
export async function deleteTournamentWithBatch(clubId, tournamentId) {
  try {
    // This is a complex operation that needs multiple batches
    // Firestore batch limit is 500 operations

    const batch = writeBatch(db);
    let operationCount = 0;

    // Delete tournament document
    const tournamentRef = doc(db, 'clubs', clubId, COLLECTIONS.TOURNAMENTS, tournamentId);
    batch.delete(tournamentRef);
    operationCount++;

    // Note: Matches and other subcollections need to be deleted separately
    // due to Firestore's lack of cascade delete

    await batch.commit();

    console.log(`✅ Tournament deleted: ${operationCount} documents`);
    return {
      success: true,
      deletedCount: operationCount,
      message: 'Torneo eliminato. Nota: partite e standings devono essere eliminate manualmente.',
    };
  } catch (error) {
    console.error('❌ Delete failed:', error);
    return {
      success: false,
      error: error.message || 'Errore durante eliminazione torneo',
    };
  }
}

export default {
  advancePhaseWithTransaction,
  createGroupsWithTransaction,
  submitMatchResultWithTransaction,
  rollbackToPreviousPhase,
  deleteTournamentWithBatch,
};
