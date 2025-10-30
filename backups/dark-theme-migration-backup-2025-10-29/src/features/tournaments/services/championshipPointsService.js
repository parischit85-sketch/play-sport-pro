/**
 * @fileoverview Championship Points Draft Computation Service
 * Computes draft points per team for a tournament based on:
 *  - RPA points from completed matches × multiplier (winners +, losers −)
 *  - Group placement bonus (from saved standings)
 *  - Knockout progression bonus (per win per round)
 *
 * Notes:
 *  - BYE advancements are excluded because we only count completed matches with actual results
 *  - Points splitting to players is equal split among the two primary members of the team
 */

import { getMatches } from './matchService.js';
import { getTeamsByTournament } from './teamsService.js';
import { calculateGroupStandings } from './standingsService.js';
import { computeFromSets, calcParisDelta } from '../../../lib/rpa.js';
import { KNOCKOUT_ROUND, MATCH_STATUS } from '../utils/tournamentConstants.js';

function pickTwoRatings(team, fallbackRating = 1500) {
  const players = Array.isArray(team?.players) ? team.players : [];
  const ratings = players
    .map((p) => (typeof p?.ranking === 'number' ? Number(p.ranking) : fallbackRating))
    .slice(0, 2);
  while (ratings.length < 2) ratings.push(fallbackRating);
  return ratings; // [r1, r2]
}

function toABSets(sets) {
  // Convert sets from {team1, team2} to {a,b}
  if (!Array.isArray(sets)) return [];
  return sets.map((s) => ({ a: Number(s?.team1 || 0), b: Number(s?.team2 || 0) }));
}

/**
 * Compute draft championship points for a tournament
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {object} tournament - tournament object (to read configuration)
 * @returns {Promise<{ totals: Array, meta: object }>}
 */
export async function computeTournamentChampionshipPoints(clubId, tournamentId, tournament) {
  const config = tournament?.configuration?.championshipPoints || {};
  const multiplier = Number(config?.rpaMultiplier ?? 1);
  const groupPlacementPoints = config?.groupPlacementPoints || {};
  const koPoints = config?.knockoutProgressPoints || {};
  const fallbackRanking = Number(
    tournament?.configuration?.defaultRankingForNonParticipants ?? 1500
  );

  const [teams, matches] = await Promise.all([
    getTeamsByTournament(clubId, tournamentId),
    getMatches(clubId, tournamentId),
  ]);

  const teamsMap = new Map((teams || []).map((t) => [t.id, t]));

  // Build per-group standings to get correct group-local positions.
  const groupIds = Array.from(new Set((teams || []).map((t) => t.groupId).filter(Boolean)));
  const perGroupStandings = await Promise.all(
    groupIds.map((gid) =>
      calculateGroupStandings(
        clubId,
        tournamentId,
        gid,
        tournament?.pointsSystem || { win: 3, draw: 1, loss: 0 }
      ).then((rows) => ({ groupId: gid, rows }))
    )
  );
  const standingsMap = new Map(); // teamId -> { position, groupId }
  for (const g of perGroupStandings) {
    for (const row of g.rows || []) {
      standingsMap.set(row.teamId, { position: row.position, groupId: g.groupId });
    }
  }

  const rows = new Map(); // teamId -> row
  for (const team of teams || []) {
    rows.set(team.id, {
      teamId: team.id,
      teamName: team.teamName || 'Senza nome',
      players: team.players || [],
      rpa: 0,
      groupPlacement: 0,
      knockout: 0,
      total: 0,
      split: [], // per-player split
      details: {
        rpaContributions: [], // { matchId, date, opponentTeamId, opponentTeamName, pts }
        groupPlacement: null, // { position, points }
        knockoutContributions: [], // { matchId, round, pts }
      },
    });
  }

  // 1) RPA-based points from completed matches (apply to both teams)
  for (const m of matches || []) {
    if (m?.status !== MATCH_STATUS.COMPLETED) continue;
    if (!m?.team1Id || !m?.team2Id) continue; // skip BYE/null
    if (!m?.winnerId) continue;

    const t1 = teamsMap.get(m.team1Id);
    const t2 = teamsMap.get(m.team2Id);
    if (!t1 || !t2) continue;

    const [rA1, rA2] = pickTwoRatings(t1, fallbackRanking);
    const [rB1, rB2] = pickTwoRatings(t2, fallbackRanking);
    const rr = computeFromSets(toABSets(m.sets || []));

    // Determine winner side relative to calc input
    const winnerIsA = m.winnerId === m.team1Id ? 'A' : 'B';
    const res = calcParisDelta({
      ratingA1: rA1,
      ratingA2: rA2,
      ratingB1: rB1,
      ratingB2: rB2,
      gamesA: rr.gamesA,
      gamesB: rr.gamesB,
      winner: winnerIsA,
      sets: toABSets(m.sets || []),
    });

    const pts = Math.max(0, Number(res?.pts || 0));

    const winnerId = m.winnerId;
    const loserId = winnerId === m.team1Id ? m.team2Id : m.team1Id;

    // Winner: +pts
    const winnerRow = rows.get(winnerId);
    if (winnerRow) {
      winnerRow.rpa += pts * multiplier;
      const opp = teamsMap.get(loserId);
      winnerRow.details.rpaContributions.push({
        matchId: m.id || undefined,
        date: m.date || null,
        opponentTeamId: loserId || null,
        opponentTeamName: opp?.teamName || '—',
        type: m.type || null,
        round: m.round || null,
        isKnockout: m.type === 'knockout',
        isLoss: false,
        pts: Math.round(pts * multiplier * 10) / 10,
      });
    }

    // Loser: −pts (only in group phase; in knockout phase, loser gets 0)
    const loserRow = rows.get(loserId);
    if (loserRow) {
      // Only apply negative points if NOT knockout phase
      if (m.type !== 'knockout') {
        loserRow.rpa += -pts * multiplier;
      }
      const opp = teamsMap.get(winnerId);
      loserRow.details.rpaContributions.push({
        matchId: m.id || undefined,
        date: m.date || null,
        opponentTeamId: winnerId || null,
        opponentTeamName: opp?.teamName || '—',
        type: m.type || null,
        round: m.round || null,
        isKnockout: m.type === 'knockout',
        isLoss: m.type === 'knockout' ? true : false,
        pts: m.type === 'knockout' ? 0 : Math.round(-pts * multiplier * 10) / 10,
      });
    }
  }

  // 2) Group placement bonus
  for (const [teamId, row] of rows) {
    const s = standingsMap.get(teamId);
    if (!s) continue;
    const pos = Number(s.position || 0);
    const gp = Number(groupPlacementPoints?.[pos] || 0);
    row.groupPlacement += gp;
    row.details.groupPlacement = { position: pos, points: gp };
  }

  // 3) Knockout progression bonus (per win in a KO round, loser gets 0)
  for (const m of matches || []) {
    if (m?.status !== MATCH_STATUS.COMPLETED) continue;
    if (m?.type !== 'knockout') continue;
    if (!m?.round) continue;
    if (!m?.winnerId) continue;

    const perWin = Number(koPoints?.[m.round] || 0);

    // Winner gets +pts
    const winnerRow = rows.get(m.winnerId);
    if (winnerRow) {
      winnerRow.knockout += perWin;
      winnerRow.details.knockoutContributions.push({
        matchId: m.id || undefined,
        round: m.round,
        pts: perWin,
        isLoss: false,
      });
    }

    // Loser gets 0 (display only)
    const loserId = m.winnerId === m.team1Id ? m.team2Id : m.team1Id;
    const loserRow = rows.get(loserId);
    if (loserRow) {
      loserRow.details.knockoutContributions.push({
        matchId: m.id || undefined,
        round: m.round,
        pts: 0,
        isLoss: true,
      });
    }
  }

  // Totals and split (equal among two players)
  for (const row of rows.values()) {
    row.rpa = Math.round(row.rpa * 10) / 10;
    row.groupPlacement = Math.round(row.groupPlacement * 10) / 10;
    row.knockout = Math.round(row.knockout * 10) / 10;
    row.total = Math.round((row.rpa + row.groupPlacement + row.knockout) * 10) / 10;

    // Assigned totals cannot be negative for players: clamp to 0, but keep raw for display
    row.totalAssigned = row.total > 0 ? row.total : 0;

    const players = Array.isArray(row.players) ? row.players : [];
    const two = players.slice(0, 2);

    // Each player gets the FULL team points (not divided)
    // Both players in the team deserve the complete points
    const assignedPoints = row.total > 0 ? row.total : 0;
    const rawPoints = row.total;

    row.split = two.map((p) => ({
      playerId: p.playerId,
      playerName: p.playerName,
      points: Math.round(assignedPoints * 10) / 10, // FULL points for each player
      rawPoints: Math.round(rawPoints * 10) / 10, // can be negative, for UI display
    }));
  }

  return {
    totals: Array.from(rows.values()).sort(
      (a, b) => (b.totalAssigned ?? b.total) - (a.totalAssigned ?? a.total)
    ),
    meta: {
      computedAt: new Date().toISOString(),
      rpaMultiplier: multiplier,
    },
  };
}

export default {
  computeTournamentChampionshipPoints,
};
