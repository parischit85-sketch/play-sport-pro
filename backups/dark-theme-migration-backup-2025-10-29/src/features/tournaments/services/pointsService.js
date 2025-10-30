/**
 * @fileoverview Points Calculation Service
 * Handles both standard and ranking-based points systems
 */

import { POINTS_SYSTEM_TYPE } from '../utils/tournamentConstants.js';
import { computeFromSets, calcParisDelta } from '../../../lib/rpa.js';

/**
 * Calculate points for a match result
 * @param {Object} pointsSystem - Tournament points system configuration
 * @param {Object} team1 - Team 1 data with ranking
 * @param {Object} team2 - Team 2 data with ranking
 * @param {Object} score - Match score {team1: number, team2: number}
 * @param {string} winnerId - Winner team ID
 * @returns {{team1Points: number, team2Points: number}}
 */
export function calculateMatchPoints(pointsSystem, team1, team2, score, winnerId) {
  if (pointsSystem.type === POINTS_SYSTEM_TYPE.STANDARD) {
    return calculateStandardPoints(pointsSystem, team1.id, team2.id, score, winnerId);
  } else if (pointsSystem.type === POINTS_SYSTEM_TYPE.RANKING_BASED) {
    return calculateRankingBasedPoints(pointsSystem, team1, team2, score, winnerId);
  }

  // Fallback to standard
  return calculateStandardPoints(pointsSystem, team1.id, team2.id, score, winnerId);
}

/**
 * Calculate standard points (fixed values for win/draw/loss)
 * @param {Object} pointsSystem
 * @param {string} team1Id
 * @param {string} team2Id
 * @param {Object} score
 * @param {string} winnerId
 * @returns {{team1Points: number, team2Points: number}}
 */
function calculateStandardPoints(pointsSystem, team1Id, team2Id, score, winnerId) {
  const { win, draw, loss } = pointsSystem;

  // Check for draw (shouldn't happen in knockout, but handle it)
  if (score.team1 === score.team2) {
    return {
      team1Points: draw,
      team2Points: draw,
    };
  }

  // Determine winner and loser points
  if (winnerId === team1Id) {
    return {
      team1Points: win,
      team2Points: loss,
    };
  } else {
    return {
      team1Points: loss,
      team2Points: win,
    };
  }
}

/**
 * Calculate ranking-based points with upset bonuses
 * @param {Object} pointsSystem
 * @param {Object} team1
 * @param {Object} team2
 * @param {Object} score
 * @param {string} winnerId
 * @returns {{team1Points: number, team2Points: number}}
 */
function calculateRankingBasedPoints(pointsSystem, team1, team2, score, winnerId) {
  const { baseWin, baseDraw, baseLoss, multipliers } = pointsSystem;

  // If either team doesn't have ranking, fall back to base points
  if (!team1.averageRanking || !team2.averageRanking) {
    return calculateStandardPoints(
      { win: baseWin, draw: baseDraw, loss: baseLoss },
      team1.id,
      team2.id,
      score,
      winnerId
    );
  }

  // Check for draw
  if (score.team1 === score.team2) {
    return {
      team1Points: baseDraw,
      team2Points: baseDraw,
    };
  }

  // Calculate ranking difference
  const rankingDifference = Math.abs(team1.averageRanking - team2.averageRanking);

  // Determine if upset occurred (lower ranked team won)
  let isUpset = false;
  let winnerRanking, loserRanking;

  if (winnerId === team1.id) {
    winnerRanking = team1.averageRanking;
    loserRanking = team2.averageRanking;
    // In tennis/padel, LOWER ranking number = BETTER player
    // So if team1 won and has HIGHER ranking number, it's an upset
    isUpset = team1.averageRanking > team2.averageRanking;
  } else {
    winnerRanking = team2.averageRanking;
    loserRanking = team1.averageRanking;
    isUpset = team2.averageRanking > team1.averageRanking;
  }

  // Determine multiplier
  let multiplier = multipliers.expectedWin;

  if (isUpset && rankingDifference >= multipliers.rankingDifferenceThreshold) {
    multiplier = multipliers.upsetBonus;
  }

  // Calculate points
  const winnerPoints = baseWin * multiplier;
  const loserPoints = baseLoss;

  if (winnerId === team1.id) {
    return {
      team1Points: Math.round(winnerPoints * 10) / 10, // Round to 1 decimal
      team2Points: loserPoints,
    };
  } else {
    return {
      team1Points: loserPoints,
      team2Points: Math.round(winnerPoints * 10) / 10,
    };
  }
}

/**
 * Calculate total points for a team based on all their matches
 * @param {Array} matches - All matches involving the team
 * @param {string} teamId - Team ID
 * @param {Object} pointsSystem - Points system configuration
 * @param {Object} teamsMap - Map of team ID to team data (for rankings)
 * @returns {number}
 */
export function calculateTeamTotalPoints(matches, teamId, pointsSystem, teamsMap) {
  let totalPoints = 0;

  matches.forEach((match) => {
    if (match.status !== 'completed') return;

    const isTeam1 = match.team1Id === teamId;
    const team1 = teamsMap[match.team1Id];
    const team2 = teamsMap[match.team2Id];

    if (!team1 || !team2) return;

    const points = calculateMatchPoints(pointsSystem, team1, team2, match.score, match.winnerId);

    totalPoints += isTeam1 ? points.team1Points : points.team2Points;
  });

  return Math.round(totalPoints * 10) / 10; // Round to 1 decimal
}

/**
 * Simulate points for a potential match (for preview/planning)
 * @param {Object} pointsSystem
 * @param {Object} team1
 * @param {Object} team2
 * @param {string} assumedWinnerId
 * @returns {{team1Points: number, team2Points: number, isUpset: boolean}}
 */
export function simulateMatchPoints(pointsSystem, team1, team2, assumedWinnerId) {
  // Simulate score (doesn't matter, just needs winner)
  const score = assumedWinnerId === team1.id ? { team1: 3, team2: 1 } : { team1: 1, team2: 3 };

  const points = calculateMatchPoints(pointsSystem, team1, team2, score, assumedWinnerId);

  // Determine if it would be an upset
  let isUpset = false;
  if (team1.averageRanking && team2.averageRanking) {
    if (assumedWinnerId === team1.id) {
      isUpset = team1.averageRanking > team2.averageRanking;
    } else {
      isUpset = team2.averageRanking > team1.averageRanking;
    }
  }

  return {
    ...points,
    isUpset,
  };
}

/**
 * Get points breakdown for display
 * @param {Object} pointsSystem
 * @param {Object} team1
 * @param {Object} team2
 * @param {Object} score
 * @param {string} winnerId
 * @returns {Object}
 */
export function getPointsBreakdown(pointsSystem, team1, team2, score, winnerId) {
  const points = calculateMatchPoints(pointsSystem, team1, team2, score, winnerId);

  if (pointsSystem.type === POINTS_SYSTEM_TYPE.STANDARD) {
    return {
      team1: {
        points: points.team1Points,
        breakdown: {
          result: winnerId === team1.id ? 'Vittoria' : 'Sconfitta',
          basePoints: points.team1Points,
        },
      },
      team2: {
        points: points.team2Points,
        breakdown: {
          result: winnerId === team2.id ? 'Vittoria' : 'Sconfitta',
          basePoints: points.team2Points,
        },
      },
    };
  } else {
    // Ranking-based breakdown
    const isTeam1Winner = winnerId === team1.id;
    const rankingDiff =
      team1.averageRanking && team2.averageRanking
        ? Math.abs(team1.averageRanking - team2.averageRanking)
        : null;

    const team1IsUpset = isTeam1Winner && team1.averageRanking > team2.averageRanking;
    const team2IsUpset = !isTeam1Winner && team2.averageRanking > team1.averageRanking;

    return {
      team1: {
        points: points.team1Points,
        breakdown: {
          result: isTeam1Winner ? 'Vittoria' : 'Sconfitta',
          basePoints: isTeam1Winner ? pointsSystem.baseWin : pointsSystem.baseLoss,
          multiplier: team1IsUpset
            ? pointsSystem.multipliers.upsetBonus
            : pointsSystem.multipliers.expectedWin,
          isUpset: team1IsUpset,
          rankingDifference: rankingDiff,
        },
      },
      team2: {
        points: points.team2Points,
        breakdown: {
          result: !isTeam1Winner ? 'Vittoria' : 'Sconfitta',
          basePoints: !isTeam1Winner ? pointsSystem.baseWin : pointsSystem.baseLoss,
          multiplier: team2IsUpset
            ? pointsSystem.multipliers.upsetBonus
            : pointsSystem.multipliers.expectedWin,
          isUpset: team2IsUpset,
          rankingDifference: rankingDiff,
        },
      },
    };
  }
}

/**
 * Calculate RPA points for a single match
 * @param {Object} match - Match data with sets and team info
 * @param {Object} team1 - Team 1 data with players
 * @param {Object} team2 - Team 2 data with players
 * @param {Object} tournament - Tournament data with configuration
 * @returns {{team1RPA: number, team2RPA: number}}
 */
function calculateRPAPointsForMatch(match, team1, team2, tournament) {
  if (!match.winnerId || !team1 || !team2) {
    return { team1RPA: 0, team2RPA: 0 };
  }

  // Helper to extract top 2 player ratings
  const pickTwoRatings = (team, fallback = 1500) => {
    const players = Array.isArray(team?.players) ? team.players : [];
    const ratings = players
      .map((p) => (typeof p?.ranking === 'number' ? Number(p.ranking) : fallback))
      .slice(0, 2);
    while (ratings.length < 2) ratings.push(fallback);
    return ratings;
  };

  // Helper to convert sets to AB format
  const toABSets = (sets) => {
    if (!Array.isArray(sets)) return [];
    return sets.map((s) => ({ a: Number(s?.team1 || 0), b: Number(s?.team2 || 0) }));
  };

  const multiplier = Number(tournament?.configuration?.championshipPoints?.rpaMultiplier ?? 1);
  const fallbackRanking = Number(
    tournament?.configuration?.defaultRankingForNonParticipants ?? 1500
  );

  const [rA1, rA2] = pickTwoRatings(team1, fallbackRanking);
  const [rB1, rB2] = pickTwoRatings(team2, fallbackRanking);
  const rr = computeFromSets(toABSets(match.sets || []));

  const winnerIsA = match.winnerId === match.team1Id ? 'A' : 'B';
  const res = calcParisDelta({
    ratingA1: rA1,
    ratingA2: rA2,
    ratingB1: rB1,
    ratingB2: rB2,
    gamesA: rr.gamesA,
    gamesB: rr.gamesB,
    winner: winnerIsA,
    sets: toABSets(match.sets || []),
  });

  const pts = Math.max(0, Number(res?.pts || 0));
  const rpaPoints = pts * multiplier;

  return {
    team1RPA: match.winnerId === match.team1Id ? Math.round(rpaPoints) : -Math.round(rpaPoints),
    team2RPA: match.winnerId === match.team2Id ? Math.round(rpaPoints) : -Math.round(rpaPoints),
  };
}

/**
 * Calculate total RPA points for a team based on all their matches
 * @param {Array} matches - All matches involving the team
 * @param {string} teamId - Team ID
 * @param {Object} teamsMap - Map of team ID to team data (for players/rankings)
 * @param {Object} tournament - Tournament data with configuration
 * @returns {number} - Total RPA points for the team
 */
export function calculateTeamTotalRPAPoints(matches, teamId, teamsMap, tournament) {
  let totalRPAPoints = 0;

  matches.forEach((match) => {
    if (match.status !== 'completed') return;

    const isTeam1 = match.team1Id === teamId;
    const team1 = teamsMap[match.team1Id];
    const team2 = teamsMap[match.team2Id];

    if (!team1 || !team2) return;

    const rpaPoints = calculateRPAPointsForMatch(match, team1, team2, tournament);

    totalRPAPoints += isTeam1 ? rpaPoints.team1RPA : rpaPoints.team2RPA;
  });

  return Math.round(totalRPAPoints * 10) / 10;
}

export default {
  calculateMatchPoints,
  calculateTeamTotalPoints,
  calculateTeamTotalRPAPoints,
  simulateMatchPoints,
  getPointsBreakdown,
};
