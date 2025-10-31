import { db } from '../../../services/firebase.js';
import {
  collection,
  doc,
  writeBatch,
  Timestamp,
  getDocs,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import {
  COLLECTIONS,
  KNOCKOUT_ROUND,
  KNOCKOUT_ROUND_NAMES,
  MATCH_STATUS,
  TOURNAMENT_STATUS,
} from '../utils/tournamentConstants.js';
import { advancePhaseWithTransaction } from './tournamentTransactions.js';
import { getTournament } from './tournamentService.js';
import { getTeamsByTournament } from './teamsService.js';

/**
 * Delete all existing knockout matches for a tournament
 * Helper function to clean up before creating new manual bracket
 * @param {string} clubId
 * @param {string} tournamentId
 * @returns {Promise<void>}
 */
async function deleteExistingKnockoutMatches(clubId, tournamentId) {
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
      console.log('📋 [deleteExistingKnockoutMatches] No knockout matches found');
      return;
    }

    console.log(
      `🗑️ [deleteExistingKnockoutMatches] Deleting ${snapshot.docs.length} knockout matches...`
    );

    // Delete all knockout matches
    const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);

    console.log(
      `✅ [deleteExistingKnockoutMatches] Successfully deleted ${snapshot.docs.length} knockout matches`
    );
  } catch (error) {
    console.error('❌ [deleteExistingKnockoutMatches] Error deleting knockout matches:', error);
    throw error;
  }
}

/**
 * Start manual knockout stage by creating matches from user-selected slots
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {{ startingRound: string, includeThirdPlace: boolean, slots: Array<string|null> }} config
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function startManualKnockout(clubId, tournamentId, config) {
  try {
    const { startingRound, includeThirdPlace, slots } = config;

    const tournament = await getTournament(clubId, tournamentId);
    if (!tournament) return { success: false, error: 'Torneo non trovato' };

    // 🗑️ Delete any existing knockout matches before creating new manual bracket
    await deleteExistingKnockoutMatches(clubId, tournamentId);

    // Validate round slots
    const expected = roundTeamCount(startingRound);
    if (slots.length !== expected) {
      return {
        success: false,
        error: `Numero slot non valido: attesi ${expected}, ricevuti ${slots.length}`,
      };
    }

    // Map teamId to basic info for caching names
    const teams = await getTeamsByTournament(clubId, tournamentId);
    const teamMap = new Map(teams.map((t) => [t.id, t]));

    // 1) Advance tournament phase and save bracket summary (atomic)
    const bracketSummary = {
      startingRound,
      includeThirdPlace,
      slots,
      createdAt: new Date().toISOString(),
    };

    const tx = await advancePhaseWithTransaction(
      clubId,
      tournamentId,
      TOURNAMENT_STATUS.KNOCKOUT_PHASE,
      { knockoutBracket: bracketSummary }
    );

    if (!tx.success) {
      return { success: false, error: tx.error || 'Errore avanzando alla fase a eliminazione' };
    }

    // 2) Create matches for all rounds with preallocated IDs and next links
    const batch = writeBatch(db);

    // Determine rounds sequence from starting round to finals
    const roundsSeq = buildRoundsSequence(startingRound, includeThirdPlace);

    // Prepare structure to store match refs and info
    const roundMatches = [];

    // Create doc refs for all matches in all rounds so we can reference next IDs
    for (let r = 0; r < roundsSeq.length; r++) {
      const roundDef = roundsSeq[r];
      const matchesInRound = [];
      const numMatches = roundDef.matches;
      const matchesColl = collection(
        db,
        'clubs',
        clubId,
        COLLECTIONS.TOURNAMENTS,
        tournamentId,
        COLLECTIONS.MATCHES
      );

      for (let i = 0; i < numMatches; i++) {
        const matchRef = doc(matchesColl); // preallocate ID
        matchesInRound.push({ ref: matchRef, matchNumber: i + 1 });
      }
      roundMatches.push(matchesInRound);
    }

    // Helper to get next match link info
    const getNextLink = (roundIndex, pairIndex) => {
      if (roundIndex >= roundMatches.length - 1)
        return { nextMatchId: null, nextMatchPosition: null };
      const nextRound = roundMatches[roundIndex + 1];
      const nextIndex = Math.floor(pairIndex / 2);
      const position = pairIndex % 2 === 0 ? 1 : 2;
      return { nextMatchId: nextRound[nextIndex].ref.id, nextMatchPosition: position };
    };

    // Fill first round with user selections (pair slots 0-1, 2-3, ...)
    const firstRoundIdx = 0;
    const firstRound = roundMatches[firstRoundIdx];

    for (let i = 0; i < firstRound.length; i++) {
      const idx1 = i * 2;
      const idx2 = i * 2 + 1;
      // Handle slots: 'BYE' = explicit BYE from admin, '' or null = qualif, teamId = team
      const slot1 = slots[idx1];
      const slot2 = slots[idx2];

      const team1Id = slot1 === 'BYE' || slot1 === '' || slot1 == null ? null : slot1;
      const team2Id = slot2 === 'BYE' || slot2 === '' || slot2 == null ? null : slot2;
      const team1 = team1Id ? teamMap.get(team1Id) : null;
      const team2 = team2Id ? teamMap.get(team2Id) : null;

      // Determine team names: 'BYE' if admin selected BYE, 'Qualif.' if auto-qualified
      const team1Name = team1?.teamName || (slot1 === 'BYE' ? 'BYE' : 'Qualif.');
      const team2Name = team2?.teamName || (slot2 === 'BYE' ? 'BYE' : 'Qualif.');

      const { nextMatchId, nextMatchPosition } = getNextLink(firstRoundIdx, i);

      const matchDoc = {
        id: firstRound[i].ref.id,
        tournamentId,
        clubId,
        type: 'knockout',
        round: roundsSeq[firstRoundIdx].code,
        roundName: roundsSeq[firstRoundIdx].label,
        matchNumber: i + 1,
        team1Id: team1Id,
        team1Name: team1Name,
        team2Id: team2Id,
        team2Name: team2Name,
        nextMatchId,
        nextMatchPosition,
        status: team1Id && team2Id ? MATCH_STATUS.SCHEDULED : MATCH_STATUS.COMPLETED,
        scheduledFor: Timestamp.fromDate(new Date()),
        score: team1Id && team2Id ? { team1: 0, team2: 0 } : null,
        winnerId: null,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      // If BYE present (one side null), auto-advance winner
      if (!team1Id || !team2Id) {
        const winner = team1Id || team2Id || null;
        matchDoc.winnerId = winner;
        // Propagate to next match if exists
        if (winner && nextMatchId && nextMatchPosition) {
          const nextRoundRef = doc(
            db,
            'clubs',
            clubId,
            COLLECTIONS.TOURNAMENTS,
            tournamentId,
            COLLECTIONS.MATCHES,
            nextMatchId
          );
          const updateField = nextMatchPosition === 1 ? 'team1Id' : 'team2Id';
          const nameField = nextMatchPosition === 1 ? 'team1Name' : 'team2Name';
          batch.set(
            nextRoundRef,
            {
              id: nextRoundRef.id,
              tournamentId,
              clubId,
              type: 'knockout',
              round: roundsSeq[firstRoundIdx + 1]?.code || null,
              roundName: roundsSeq[firstRoundIdx + 1]?.label || null,
              matchNumber: Math.floor(i / 2) + 1,
              [updateField]: winner,
              [nameField]: teamMap.get(winner)?.teamName || 'Qualif.',
              status: MATCH_STATUS.SCHEDULED,
              createdAt: Timestamp.fromDate(new Date()),
              updatedAt: Timestamp.fromDate(new Date()),
            },
            { merge: true }
          );
        }
      }

      batch.set(firstRound[i].ref, matchDoc);
    }

    // Create empty matches for subsequent rounds
    for (let r = 1; r < roundMatches.length; r++) {
      const curr = roundMatches[r];
      for (let i = 0; i < curr.length; i++) {
        const { nextMatchId, nextMatchPosition } = getNextLink(r, i);
        const docRef = curr[i].ref;
        // IMPORTANT: do NOT set team1Id/team2Id here; preserve any pre-filled values (e.g., from BYE auto-advance)
        const matchDoc = {
          id: docRef.id,
          tournamentId,
          clubId,
          type: 'knockout',
          round: roundsSeq[r].code,
          roundName: roundsSeq[r].label,
          matchNumber: i + 1,
          team1Name: 'Qualif.',
          team2Name: 'Qualif.',
          nextMatchId,
          nextMatchPosition,
          status: MATCH_STATUS.SCHEDULED,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
        };
        batch.set(docRef, matchDoc, { merge: true });
      }
    }

    // Optional third place: create after semifinals (or appropriate round)
    if (includeThirdPlace) {
      // Find semifinals round index if exists in sequence
      const semiIdx = roundsSeq.findIndex((r) => r.code === KNOCKOUT_ROUND.SEMI_FINALS);
      if (semiIdx !== -1) {
        const coll = collection(
          db,
          'clubs',
          clubId,
          COLLECTIONS.TOURNAMENTS,
          tournamentId,
          COLLECTIONS.MATCHES
        );
        const thirdRef = doc(coll);
        batch.set(thirdRef, {
          id: thirdRef.id,
          tournamentId,
          clubId,
          type: 'knockout',
          round: KNOCKOUT_ROUND.THIRD_PLACE,
          roundName: KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.THIRD_PLACE],
          matchNumber: 1,
          team1Id: null,
          team1Name: 'Qualif.',
          team2Id: null,
          team2Name: 'Qualif.',
          status: MATCH_STATUS.SCHEDULED,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
        });
      }
    }

    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error('Error starting manual knockout:', error);
    return { success: false, error: error.message };
  }
}

function roundTeamCount(startingRound) {
  switch (startingRound) {
    case KNOCKOUT_ROUND.ROUND_OF_16:
      return 16;
    case KNOCKOUT_ROUND.QUARTER_FINALS:
      return 8;
    case KNOCKOUT_ROUND.SEMI_FINALS:
      return 4;
    case KNOCKOUT_ROUND.FINALS:
      return 2;
    default:
      return 8;
  }
}

function buildRoundsSequence(startingRound, _includeThirdPlace) {
  const seq = [];
  if (startingRound === KNOCKOUT_ROUND.ROUND_OF_16) {
    seq.push({
      code: KNOCKOUT_ROUND.ROUND_OF_16,
      label: KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.ROUND_OF_16],
      matches: 8,
    });
    seq.push({
      code: KNOCKOUT_ROUND.QUARTER_FINALS,
      label: KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.QUARTER_FINALS],
      matches: 4,
    });
    seq.push({
      code: KNOCKOUT_ROUND.SEMI_FINALS,
      label: KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.SEMI_FINALS],
      matches: 2,
    });
    seq.push({
      code: KNOCKOUT_ROUND.FINALS,
      label: KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS],
      matches: 1,
    });
  } else if (startingRound === KNOCKOUT_ROUND.QUARTER_FINALS) {
    seq.push({
      code: KNOCKOUT_ROUND.QUARTER_FINALS,
      label: KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.QUARTER_FINALS],
      matches: 4,
    });
    seq.push({
      code: KNOCKOUT_ROUND.SEMI_FINALS,
      label: KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.SEMI_FINALS],
      matches: 2,
    });
    seq.push({
      code: KNOCKOUT_ROUND.FINALS,
      label: KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS],
      matches: 1,
    });
  } else if (startingRound === KNOCKOUT_ROUND.SEMI_FINALS) {
    seq.push({
      code: KNOCKOUT_ROUND.SEMI_FINALS,
      label: KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.SEMI_FINALS],
      matches: 2,
    });
    seq.push({
      code: KNOCKOUT_ROUND.FINALS,
      label: KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS],
      matches: 1,
    });
  } else if (startingRound === KNOCKOUT_ROUND.FINALS) {
    seq.push({
      code: KNOCKOUT_ROUND.FINALS,
      label: KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS],
      matches: 1,
    });
  }
  return seq;
}

export default {
  startManualKnockout,
};
