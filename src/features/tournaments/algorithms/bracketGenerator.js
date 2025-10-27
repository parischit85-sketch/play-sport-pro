/**
 * @fileoverview Bracket Generator Algorithm
 * Generate knockout bracket with automatic seeding
 */

import { KNOCKOUT_ROUND } from '../utils/tournamentConstants.js';
import { createMatch } from '../services/matchService.js';

/**
 * Generate knockout bracket from qualified teams
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Array} qualifiedTeams - Teams with groupId and groupPosition
 * @param {boolean} includeThirdPlace
 * @returns {Promise<{success: boolean, bracket?: Object, error?: string}>}
 */
export async function generateKnockoutBracket(clubId, tournamentId, qualifiedTeams, includeThirdPlace = true) {
  try {
    const totalTeams = qualifiedTeams.length;

    // Validate power of 2
    if (!isPowerOfTwo(totalTeams)) {
      return {
        success: false,
        error: `Il numero di squadre qualificate (${totalTeams}) deve essere una potenza di 2 (8, 16, 32)`,
      };
    }

    // Seed teams
    const seededTeams = seedTeams(qualifiedTeams);

    // Determine starting round
    let startingRound;
    if (totalTeams === 32) {
      startingRound = KNOCKOUT_ROUND.ROUND_OF_16;
    } else if (totalTeams === 16) {
      startingRound = KNOCKOUT_ROUND.ROUND_OF_16;
    } else if (totalTeams === 8) {
      startingRound = KNOCKOUT_ROUND.QUARTER_FINALS;
    } else if (totalTeams === 4) {
      startingRound = KNOCKOUT_ROUND.SEMI_FINALS;
    } else if (totalTeams === 2) {
      startingRound = KNOCKOUT_ROUND.FINALS;
    } else {
      return {
        success: false,
        error: 'Numero di squadre non supportato',
      };
    }

    // Generate bracket structure
    const bracket = {
      roundOf16: [],
      quarterFinals: [],
      semiFinals: [],
      finals: [],
      thirdPlace: null,
    };

    // Create first round matches
    const firstRoundMatches = [];
    const numFirstRoundMatches = totalTeams / 2;

    for (let i = 0; i < numFirstRoundMatches; i++) {
      const team1 = seededTeams[i * 2];
      const team2 = seededTeams[i * 2 + 1];

      const matchData = {
        type: 'knockout',
        round: startingRound,
        matchNumber: i + 1,
        team1Id: team1.teamId,
        team2Id: team2.teamId,
      };

      const result = await createMatch(clubId, tournamentId, matchData);

      if (result.success) {
        firstRoundMatches.push({
          id: result.matchId,
          ...matchData,
          status: 'scheduled',
        });
      }
    }

    // Store first round in appropriate bracket level
    if (startingRound === KNOCKOUT_ROUND.ROUND_OF_16) {
      bracket.roundOf16 = firstRoundMatches;
    } else if (startingRound === KNOCKOUT_ROUND.QUARTER_FINALS) {
      bracket.quarterFinals = firstRoundMatches;
    } else if (startingRound === KNOCKOUT_ROUND.SEMI_FINALS) {
      bracket.semiFinals = firstRoundMatches;
    } else if (startingRound === KNOCKOUT_ROUND.FINALS) {
      bracket.finals = firstRoundMatches;
    }

    // Generate subsequent rounds (TBD matches)
    await generateSubsequentRounds(clubId, tournamentId, bracket, startingRound, includeThirdPlace);

    return {
      success: true,
      bracket,
    };
  } catch (error) {
    console.error('Error generating knockout bracket:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate subsequent knockout rounds with TBD teams
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Object} bracket
 * @param {string} startingRound
 * @param {boolean} includeThirdPlace
 */
async function generateSubsequentRounds(clubId, tournamentId, bracket, startingRound, includeThirdPlace) {
  // Determine round progression
  const progression = {
    [KNOCKOUT_ROUND.ROUND_OF_16]: KNOCKOUT_ROUND.QUARTER_FINALS,
    [KNOCKOUT_ROUND.QUARTER_FINALS]: KNOCKOUT_ROUND.SEMI_FINALS,
    [KNOCKOUT_ROUND.SEMI_FINALS]: KNOCKOUT_ROUND.FINALS,
  };

  let currentRound = startingRound;
  let previousMatches = bracket[getRoundKey(currentRound)];

  // Generate rounds until finals
  while (currentRound !== KNOCKOUT_ROUND.FINALS) {
    const nextRound = progression[currentRound];
    const nextRoundKey = getRoundKey(nextRound);
    const numNextMatches = previousMatches.length / 2;

    for (let i = 0; i < numNextMatches; i++) {
      const match1 = previousMatches[i * 2];
      const match2 = previousMatches[i * 2 + 1];

      const matchData = {
        type: 'knockout',
        round: nextRound,
        matchNumber: i + 1,
        team1Id: null, // TBD - winner of match1
        team2Id: null, // TBD - winner of match2
      };

      const result = await createMatch(clubId, tournamentId, matchData);

      if (result.success) {
        bracket[nextRoundKey].push({
          id: result.matchId,
          ...matchData,
          status: 'scheduled',
        });

        // Update previous matches to link to next match
        const match1Ref = previousMatches[i * 2];
        const match2Ref = previousMatches[i * 2 + 1];

        match1Ref.nextMatchId = result.matchId;
        match1Ref.nextMatchPosition = 1;

        match2Ref.nextMatchId = result.matchId;
        match2Ref.nextMatchPosition = 2;

        // TODO: Update these in Firestore as well
      }
    }

    currentRound = nextRound;
    previousMatches = bracket[nextRoundKey];
  }

  // Generate third place match if requested
  if (includeThirdPlace && bracket.semiFinals.length === 2) {
    const matchData = {
      type: 'knockout',
      round: KNOCKOUT_ROUND.THIRD_PLACE,
      matchNumber: 1,
      team1Id: null, // TBD - loser of semi 1
      team2Id: null, // TBD - loser of semi 2
    };

    const result = await createMatch(clubId, tournamentId, matchData);

    if (result.success) {
      bracket.thirdPlace = {
        id: result.matchId,
        ...matchData,
        status: 'scheduled',
      };
    }
  }
}

/**
 * Seed teams for knockout bracket
 * Traditional seeding: 1 vs 16, 8 vs 9, 4 vs 13, 5 vs 12, etc.
 * @param {Array} qualifiedTeams
 * @returns {Array} Seeded teams
 */
function seedTeams(qualifiedTeams) {
  // Sort teams: first by group position, then by points/difference
  const sorted = [...qualifiedTeams].sort((a, b) => {
    if (a.groupPosition !== b.groupPosition) {
      return a.groupPosition - b.groupPosition;
    }
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return b.setsDifference - a.setsDifference;
  });

  // For now, simple sequential seeding
  // TODO: Implement traditional bracket seeding (1-16, 8-9, 4-13, etc.)
  return sorted;
}

/**
 * Get bracket round key
 * @param {string} round
 * @returns {string}
 */
function getRoundKey(round) {
  const keyMap = {
    [KNOCKOUT_ROUND.ROUND_OF_16]: 'roundOf16',
    [KNOCKOUT_ROUND.QUARTER_FINALS]: 'quarterFinals',
    [KNOCKOUT_ROUND.SEMI_FINALS]: 'semiFinals',
    [KNOCKOUT_ROUND.FINALS]: 'finals',
    [KNOCKOUT_ROUND.THIRD_PLACE]: 'thirdPlace',
  };

  return keyMap[round] || 'unknown';
}

/**
 * Check if number is power of 2
 * @param {number} n
 * @returns {boolean}
 */
function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

/**
 * Preview bracket structure (without creating matches)
 * @param {Array} qualifiedTeams
 * @returns {Object}
 */
export function previewBracketStructure(qualifiedTeams) {
  const totalTeams = qualifiedTeams.length;

  if (!isPowerOfTwo(totalTeams)) {
    return {
      error: `Numero squadre non valido: ${totalTeams}. Deve essere potenza di 2.`,
    };
  }

  const seeded = seedTeams(qualifiedTeams);

  const preview = {
    totalTeams,
    rounds: [],
  };

  let numMatches = totalTeams / 2;
  let roundNum = 1;
  let teamsInRound = [...seeded];

  while (numMatches >= 1) {
    const roundMatches = [];

    for (let i = 0; i < numMatches; i++) {
      if (teamsInRound.length >= 2) {
        roundMatches.push({
          team1: teamsInRound[i * 2],
          team2: teamsInRound[i * 2 + 1],
        });
      }
    }

    preview.rounds.push({
      roundNumber: roundNum,
      matchesCount: numMatches,
      matches: roundMatches,
    });

    numMatches = Math.floor(numMatches / 2);
    roundNum++;
    teamsInRound = []; // Next round will be TBD
  }

  return preview;
}

export default {
  generateKnockoutBracket,
  previewBracketStructure,
};
