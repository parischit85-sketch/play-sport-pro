/**
 * @fileoverview Championship Points Apply Service
 * Idempotently applies tournament championship points to the club championship leaderboard
 * and writes a single stats entry for each player: "Torneo: <nome>" with the split points.
 */

import { db } from '../../../services/firebase.js';
import { doc, getDoc, runTransaction, collection, getDocs } from 'firebase/firestore';
import { COLLECTIONS } from '../utils/tournamentConstants.js';
import { computeTournamentChampionshipPoints } from './championshipPointsService.js';
import { getMatch } from './matchService.js';

/**
 * Get apply status for a tournament: returns applied document if exists
 * @param {string} clubId
 * @param {string} tournamentId
 * @returns {Promise<{applied: boolean, data?: any}>>}
 */
export async function getChampionshipApplyStatus(clubId, tournamentId) {
  if (!clubId || !tournamentId) return { applied: false };
  // Store applied docs under club-level collection: clubs/{clubId}/applied/{tournamentId}
  const appliedRef = doc(db, 'clubs', clubId, COLLECTIONS.CHAMPIONSHIP_APPLIED, tournamentId);
  const snap = await getDoc(appliedRef);
  if (!snap.exists()) return { applied: false };
  return { applied: true, data: { id: snap.id, ...snap.data() } };
}

/**
 * Get the most recent applied tournament date for temporal validation
 * @param {string} clubId
 * @returns {Promise<{lastDate: string | null, lastTournamentName: string | null}>}
 */
async function getLastAppliedTournamentDate(clubId) {
  try {
    const appliedColl = collection(db, 'clubs', clubId, COLLECTIONS.CHAMPIONSHIP_APPLIED);
    const appliedSnap = await getDocs(appliedColl);

    if (appliedSnap.empty) {
      return { lastDate: null, lastTournamentName: null };
    }

    // Find most recent by appliedAt date
    let mostRecent = null;
    appliedSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (!mostRecent || (data.appliedAt && data.appliedAt > mostRecent.appliedAt)) {
        mostRecent = data;
      }
    });

    return {
      lastDate: mostRecent?.appliedAt || null,
      lastTournamentName: mostRecent?.tournamentName || null,
    };
  } catch (error) {
    console.warn('⚠️ Failed to get last applied tournament date:', error);
    return { lastDate: null, lastTournamentName: null };
  }
}

/**
 * Load all tournament matches with team data
 * Normalizes them to standard format for statistics
 * @private
 */
async function loadTournamentMatchesForStats(clubId, tournamentId) {
  try {
    const matchesRef = collection(
      db,
      'clubs',
      clubId,
      COLLECTIONS.TOURNAMENTS,
      tournamentId,
      COLLECTIONS.MATCHES
    );
    const teamsRef = collection(
      db,
      'clubs',
      clubId,
      COLLECTIONS.TOURNAMENTS,
      tournamentId,
      'teams'
    );

    const [matchesSnap, teamsSnap] = await Promise.all([getDocs(matchesRef), getDocs(teamsRef)]);

    // Build team map
    const teamsMap = {};
    teamsSnap.docs.forEach((doc) => {
      teamsMap[doc.id] = { id: doc.id, ...doc.data() };
    });

    // Normalize matches
    const matches = matchesSnap.docs
      .map((doc) => {
        const match = { id: doc.id, ...doc.data() };

        // Only include matches with results
        if (!match.winnerId && (!Array.isArray(match.sets) || match.sets.length === 0)) {
          return null;
        }

        const team1 = teamsMap[match.team1Id];
        const team2 = teamsMap[match.team2Id];

        if (!team1 || !team2) return null;

        const teamA = Array.isArray(team1.players)
          ? team1.players.map((p) => p.playerId || p.id || p).filter(Boolean)
          : [];
        const teamB = Array.isArray(team2.players)
          ? team2.players.map((p) => p.playerId || p.id || p).filter(Boolean)
          : [];

        // Normalize sets
        const normalizedSets = Array.isArray(match.sets)
          ? match.sets.map((s) => ({
              a: Number(s?.team1 || 0),
              b: Number(s?.team2 || 0),
            }))
          : [];

        let setsA = 0,
          setsB = 0,
          gamesA = 0,
          gamesB = 0;
        normalizedSets.forEach((s) => {
          if (s.a > s.b) setsA++;
          else if (s.b > s.a) setsB++;
          gamesA += s.a;
          gamesB += s.b;
        });

        // Determine winner
        let winner = null;
        if (match.winnerId) {
          winner = match.winnerId === match.team1Id ? 'A' : 'B';
        } else if (setsA > setsB) {
          winner = 'A';
        } else if (setsB > setsA) {
          winner = 'B';
        }

        if (!winner) return null;

        // Ensure date is in ISO string format for consistent serialization
        let matchDate;
        if (match.completedAt) {
          matchDate =
            typeof match.completedAt === 'string'
              ? match.completedAt
              : match.completedAt?.toDate?.()
                ? match.completedAt.toDate().toISOString()
                : new Date(match.completedAt).toISOString();
        } else if (match.scheduledDate) {
          matchDate =
            typeof match.scheduledDate === 'string'
              ? match.scheduledDate
              : match.scheduledDate?.toDate?.()
                ? match.scheduledDate.toDate().toISOString()
                : new Date(match.scheduledDate).toISOString();
        } else {
          matchDate = new Date().toISOString();
        }

        return {
          matchId: match.id, // Use matchId instead of id to mark as tournament match
          teamA,
          teamB,
          winner,
          setsA,
          setsB,
          gamesA,
          gamesB,
          sets: normalizedSets,
          date: matchDate,
          // 🏆 Explicit marker to exclude from RPA calculations
          isTournamentMatch: true,
          tournamentId: tournamentId,
        };
      })
      .filter(Boolean);

    return matches;
  } catch (error) {
    console.warn(`⚠️ Failed to load tournament matches for stats:`, error);
    return [];
  }
}

/**
 * Apply tournament championship points with an idempotent transaction
 * @param {string} clubId
 * @param {object} tournament - Tournament object including id and name
 * @param {object} [options] - Options including matchDate (ISO string)
 * @returns {Promise<{success: boolean, alreadyApplied?: boolean, appliedAt?: string, error?: string}>}
 */
export async function applyTournamentChampionshipPoints(clubId, tournament, options = {}) {
  try {
    if (!clubId || !tournament?.id) throw new Error('Dati torneo mancanti');

    // ✅ FIX #4: Temporal validation - check if tournament date is after last applied
    const { lastDate, lastTournamentName } = await getLastAppliedTournamentDate(clubId);

    if (lastDate && options.matchDate) {
      const tournamentDate = new Date(options.matchDate);
      const lastAppliedDate = new Date(lastDate);

      if (tournamentDate < lastAppliedDate) {
        const errorMsg = `Non puoi applicare un torneo con data ${tournamentDate.toLocaleDateString('it-IT')} precedente all'ultimo torneo applicato "${lastTournamentName}" (${lastAppliedDate.toLocaleDateString('it-IT')})`;
        return {
          success: false,
          error: errorMsg,
          temporalValidationFailed: true,
        };
      }
    }

    // Recompute draft to avoid client tampering
    const draft = await computeTournamentChampionshipPoints(clubId, tournament.id, tournament);

    // 🆕 Load tournament matches for stats inclusion
    const allTournamentMatches = await loadTournamentMatchesForStats(clubId, tournament.id);

    // Use provided date or current date
    const matchDate = options.matchDate || new Date().toISOString();

    // Applied audit doc: clubs/{clubId}/applied/{tournamentId}
    const appliedRef = doc(db, 'clubs', clubId, COLLECTIONS.CHAMPIONSHIP_APPLIED, tournament.id);

    const result = await runTransaction(db, async (tx) => {
      // Idempotency check
      const appliedSnap = await tx.get(appliedRef);
      if (appliedSnap.exists()) {
        return { success: true, alreadyApplied: true, appliedAt: appliedSnap.data()?.appliedAt };
      }

      // Leaderboard per player under: clubs/{clubId}/leaderboard
      const leaderboardColl = collection(db, 'clubs', clubId, COLLECTIONS.CHAMPIONSHIP_LEADERBOARD);

      // Aggregate per-player splits across all teams
      // Note: s.points in row.split are already per-player points, use them directly
      const perPlayer = new Map(); // playerId -> total points to add
      for (const row of draft.totals || []) {
        for (const s of row.split || []) {
          const prev = perPlayer.get(s.playerId) || 0;
          perPlayer.set(s.playerId, prev + Number(s.points || 0));
        }
      }

      // Build all refs first
      const leaderboardRefs = new Map(); // playerId -> ref
      const statsEntryRefs = new Map(); // playerId -> ref (stored under leaderboard/{playerId}/entries)
      for (const playerId of perPlayer.keys()) {
        if (!playerId) continue;
        leaderboardRefs.set(playerId, doc(leaderboardColl, playerId));
        // Stats entries stored under leaderboard/{playerId}/entries for stable addressing by playerId
        statsEntryRefs.set(
          playerId,
          doc(
            db,
            'clubs',
            clubId,
            COLLECTIONS.CHAMPIONSHIP_LEADERBOARD,
            playerId,
            'entries',
            `tournament_${tournament.id}`
          )
        );
      }

      // READS: get all docs before any writes
      const leaderboardSnapshots = new Map(); // playerId -> data or null
      for (const [playerId, ref] of leaderboardRefs.entries()) {
        const snap = await tx.get(ref);
        leaderboardSnapshots.set(playerId, snap.exists() ? snap.data() : null);
      }
      const statsSnapshots = new Map(); // playerId -> exists boolean
      for (const [playerId, ref] of statsEntryRefs.entries()) {
        const snap = await tx.get(ref);
        statsSnapshots.set(playerId, snap.exists());
      }

      // WRITES: perform updates after all reads are complete
      for (const [playerId, addPoints] of perPlayer.entries()) {
        if (!playerId) continue;
        const leaderboardRef = leaderboardRefs.get(playerId);
        const cur = leaderboardSnapshots.get(playerId) || { totalPoints: 0, entriesCount: 0 };
        const newTotal = Number(cur.totalPoints || 0) + Number(addPoints || 0);
        const newEntries = Number(cur.entriesCount || 0) + 1;
        tx.set(
          leaderboardRef,
          {
            totalPoints: Math.round(newTotal * 10) / 10,
            entriesCount: newEntries,
            lastTournamentId: tournament.id,
            lastTournamentName: tournament.name || 'Torneo',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        // 🆕 Filter matches where this player participated
        const playerMatches = allTournamentMatches
          .filter(
            (m) =>
              (Array.isArray(m.teamA) && m.teamA.includes(playerId)) ||
              (Array.isArray(m.teamB) && m.teamB.includes(playerId))
          )
          .map((m) => {
            return {
              ...m,
              // ✅ FIX: Preserve original match date instead of overriding
              // Use matchDate only as fallback if original date is missing
              date: m.date || matchDate,
            };
          });

        // Stats entry under player document (idempotent per tournament)
        const statsEntryRef = statsEntryRefs.get(playerId);
        const statsExists = statsSnapshots.get(playerId);
        if (!statsExists) {
          const entryData = {
            type: 'tournament_points',
            tournamentId: tournament.id,
            tournamentName: tournament.name || 'Torneo',
            description: `Torneo: ${tournament.name || ''}`.trim(),
            points: Math.round(Number(addPoints || 0) * 10) / 10,
            createdAt: new Date().toISOString(),
            source: 'championship',
            // 🆕 Include match details for statistics calculation
            matchDetails: playerMatches,
          };

          tx.set(statsEntryRef, entryData);
        }
      }

      // Write applied audit doc
      tx.set(appliedRef, {
        appliedAt: new Date().toISOString(),
        tournamentId: tournament.id,
        tournamentName: tournament.name || 'Torneo',
        config: tournament?.configuration?.championshipPoints || null,
        totals: draft.totals || [],
        meta: draft.meta || {},
        version: 1,
      });

      return { success: true, alreadyApplied: false };
    });

    return result;
  } catch (error) {
    console.error('❌ applyTournamentChampionshipPoints failed:', error);
    return { success: false, error: error.message || 'Errore applicazione punti' };
  }
}

/**
 * Revert (undo) previously applied championship points for a tournament
 * - Reads the audit doc clubs/{clubId}/applied/{tournamentId}
 * - Subtracts the same points from each player's leaderboard total
 * - Deletes the per-player stats entry under leaderboard/{playerId}/entries/tournament_{id}
 * - Deletes the applied audit doc
 *
 * Idempotent: if no audit doc exists, it's a no-op
 * @param {string} clubId
 * @param {string} tournamentId
 * @returns {Promise<{success: boolean, alreadyReverted?: boolean, error?: string}>}
 */
export async function revertTournamentChampionshipPoints(clubId, tournamentId) {
  try {
    if (!clubId || !tournamentId) throw new Error('Parametri mancanti');

    const appliedRef = doc(db, 'clubs', clubId, COLLECTIONS.CHAMPIONSHIP_APPLIED, tournamentId);

    const result = await runTransaction(db, async (tx) => {
      const appliedSnap = await tx.get(appliedRef);
      if (!appliedSnap.exists()) {
        return { success: true, alreadyReverted: true };
      }

      const applied = appliedSnap.data() || {};
      const totals = Array.isArray(applied.totals) ? applied.totals : [];

      // Build per-player points to subtract
      const perPlayer = new Map(); // playerId -> points to subtract
      for (const row of totals) {
        for (const s of row?.split || []) {
          if (!s?.playerId) continue;
          const prev = perPlayer.get(s.playerId) || 0;
          perPlayer.set(s.playerId, prev + Number(s.points || 0));
        }
      }

      if (perPlayer.size === 0) {
        // Nothing to revert, just remove audit doc
        tx.delete(appliedRef);
        return { success: true, alreadyReverted: false };
      }

      const leaderboardColl = collection(db, 'clubs', clubId, COLLECTIONS.CHAMPIONSHIP_LEADERBOARD);

      // Build refs
      const leaderboardRefs = new Map();
      const statsEntryRefs = new Map();
      for (const playerId of perPlayer.keys()) {
        leaderboardRefs.set(playerId, doc(leaderboardColl, playerId));
        statsEntryRefs.set(
          playerId,
          doc(
            db,
            'clubs',
            clubId,
            COLLECTIONS.CHAMPIONSHIP_LEADERBOARD,
            playerId,
            'entries',
            `tournament_${tournamentId}`
          )
        );
      }

      // Reads
      const leaderboardSnapshots = new Map();
      const statsSnapshots = new Map();
      for (const [playerId, ref] of leaderboardRefs.entries()) {
        const snap = await tx.get(ref);
        leaderboardSnapshots.set(playerId, snap.exists() ? snap.data() : null);
      }
      for (const [playerId, ref] of statsEntryRefs.entries()) {
        const snap = await tx.get(ref);
        statsSnapshots.set(playerId, snap.exists());
      }

      // Writes
      for (const [playerId, subtractPoints] of perPlayer.entries()) {
        const leaderboardRef = leaderboardRefs.get(playerId);
        const cur = leaderboardSnapshots.get(playerId) || { totalPoints: 0, entriesCount: 0 };
        const hadEntry = !!statsSnapshots.get(playerId);
        const newTotal = Math.max(0, Number(cur.totalPoints || 0) - Number(subtractPoints || 0));
        const newEntries = Math.max(0, Number(cur.entriesCount || 0) - (hadEntry ? 1 : 0));
        tx.set(
          leaderboardRef,
          {
            totalPoints: Math.round(newTotal * 10) / 10,
            entriesCount: newEntries,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        if (hadEntry) {
          tx.delete(statsEntryRefs.get(playerId));
        }
      }

      // Remove audit doc last
      tx.delete(appliedRef);

      return { success: true, alreadyReverted: false };
    });

    return result;
  } catch (error) {
    console.error('❌ revertTournamentChampionshipPoints failed:', error);
    return { success: false, error: error.message || 'Errore annullamento punti' };
  }
}

export default {
  getChampionshipApplyStatus,
  applyTournamentChampionshipPoints,
  revertTournamentChampionshipPoints,
};
