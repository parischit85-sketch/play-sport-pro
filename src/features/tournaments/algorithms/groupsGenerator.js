/**
 * @fileoverview Groups Generator Algorithm
 * Automatically generate balanced groups based on team rankings
 * Uses serpentine (snake) distribution for optimal balance
 */

import { GROUP_NAMES } from '../utils/tournamentConstants.js';
import { assignTeamToGroup } from '../services/teamsService.js';

/**
 * Generate balanced groups from registered teams
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Array} teams - All registered teams
 * @param {number} numberOfGroups
 * @param {number} teamsPerGroup
 * @returns {Promise<{success: boolean, groups?: Array, error?: string}>}
 */
export async function generateBalancedGroups(clubId, tournamentId, teams, numberOfGroups, teamsPerGroup) {
  try {
    // Validate input
    const minTeams = numberOfGroups * teamsPerGroup;
    if (teams.length < minTeams) {
      return {
        success: false,
        error: `Numero insufficiente di squadre. Richieste: ${minTeams}, Disponibili: ${teams.length}`,
      };
    }

    // Separate teams with and without rankings
    const teamsWithRanking = teams.filter((t) => t.averageRanking !== null).sort((a, b) => a.averageRanking - b.averageRanking); // Lower ranking = better

    const teamsWithoutRanking = teams.filter((t) => t.averageRanking === null);

    // Shuffle teams without ranking
    shuffleArray(teamsWithoutRanking);

    // Combine: ranked teams first, then unranked
    const sortedTeams = [...teamsWithRanking, ...teamsWithoutRanking];

    // Limit to exact number needed
    const selectedTeams = sortedTeams.slice(0, minTeams);

    // Initialize groups
    const groups = [];
    for (let i = 0; i < numberOfGroups; i++) {
      groups.push({
        id: GROUP_NAMES[i],
        name: `Girone ${GROUP_NAMES[i]}`,
        teamIds: [],
        teams: [],
        teamsCount: 0,
        qualifiedCount: 0, // Will be set later
      });
    }

    // Serpentine distribution algorithm
    // Example for 4 groups, 4 teams per group (16 teams total):
    // Round 1: Teams 1,2,3,4 -> Groups A,B,C,D
    // Round 2: Teams 5,6,7,8 -> Groups D,C,B,A (reverse)
    // Round 3: Teams 9,10,11,12 -> Groups A,B,C,D
    // Round 4: Teams 13,14,15,16 -> Groups D,C,B,A (reverse)

    let teamIndex = 0;
    let round = 0;

    while (teamIndex < selectedTeams.length) {
      const isReverseRound = round % 2 === 1;

      for (let g = 0; g < numberOfGroups && teamIndex < selectedTeams.length; g++) {
        const groupIndex = isReverseRound ? numberOfGroups - 1 - g : g;
        const team = selectedTeams[teamIndex];

        groups[groupIndex].teamIds.push(team.id);
        groups[groupIndex].teams.push(team);
        groups[groupIndex].teamsCount++;

        teamIndex++;
      }

      round++;
    }

    // Assign teams to groups in Firestore
    const assignmentPromises = [];

    groups.forEach((group) => {
      group.teams.forEach((team, index) => {
        assignmentPromises.push(assignTeamToGroup(clubId, tournamentId, team.id, group.id, index + 1));
      });
    });

    await Promise.all(assignmentPromises);

    // Remove teams array from groups (just keep IDs for clean return)
    const cleanGroups = groups.map((g) => ({
      id: g.id,
      name: g.name,
      teamIds: g.teamIds,
      teamsCount: g.teamsCount,
      qualifiedCount: 0,
    }));

    return {
      success: true,
      groups: cleanGroups,
    };
  } catch (error) {
    console.error('Error generating groups:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Validate groups configuration
 * @param {number} numberOfGroups
 * @param {number} teamsPerGroup
 * @param {number} totalTeams
 * @returns {{valid: boolean, error?: string}}
 */
export function validateGroupsConfiguration(numberOfGroups, teamsPerGroup, totalTeams) {
  const requiredTeams = numberOfGroups * teamsPerGroup;

  if (totalTeams < requiredTeams) {
    return {
      valid: false,
      error: `Servono almeno ${requiredTeams} squadre per ${numberOfGroups} gironi da ${teamsPerGroup} squadre`,
    };
  }

  if (numberOfGroups < 2 || numberOfGroups > 8) {
    return {
      valid: false,
      error: 'Il numero di gironi deve essere tra 2 e 8',
    };
  }

  if (teamsPerGroup < 3 || teamsPerGroup > 8) {
    return {
      valid: false,
      error: 'Il numero di squadre per girone deve essere tra 3 e 8',
    };
  }

  return { valid: true };
}

/**
 * Preview groups distribution (without saving)
 * @param {Array} teams
 * @param {number} numberOfGroups
 * @param {number} teamsPerGroup
 * @returns {Array} Groups preview
 */
export function previewGroupsDistribution(teams, numberOfGroups, teamsPerGroup) {
  const minTeams = numberOfGroups * teamsPerGroup;
  const teamsWithRanking = teams.filter((t) => t.averageRanking !== null).sort((a, b) => a.averageRanking - b.averageRanking);

  const teamsWithoutRanking = teams.filter((t) => t.averageRanking === null);

  const sortedTeams = [...teamsWithRanking, ...teamsWithoutRanking].slice(0, minTeams);

  const groups = [];
  for (let i = 0; i < numberOfGroups; i++) {
    groups.push({
      id: GROUP_NAMES[i],
      name: `Girone ${GROUP_NAMES[i]}`,
      teams: [],
      averageRanking: 0,
    });
  }

  let teamIndex = 0;
  let round = 0;

  while (teamIndex < sortedTeams.length) {
    const isReverseRound = round % 2 === 1;

    for (let g = 0; g < numberOfGroups && teamIndex < sortedTeams.length; g++) {
      const groupIndex = isReverseRound ? numberOfGroups - 1 - g : g;
      groups[groupIndex].teams.push(sortedTeams[teamIndex]);
      teamIndex++;
    }

    round++;
  }

  // Calculate average ranking per group
  groups.forEach((group) => {
    const rankedTeams = group.teams.filter((t) => t.averageRanking !== null);
    if (rankedTeams.length > 0) {
      const totalRanking = rankedTeams.reduce((sum, t) => sum + t.averageRanking, 0);
      group.averageRanking = totalRanking / rankedTeams.length;
    }
  });

  return groups;
}

/**
 * Calculate group balance score (lower is better - more balanced)
 * @param {Array} groups
 * @returns {number}
 */
export function calculateGroupBalanceScore(groups) {
  const avgRankings = groups.map((g) => g.averageRanking).filter((r) => r > 0);

  if (avgRankings.length === 0) return 0;

  const mean = avgRankings.reduce((sum, r) => sum + r, 0) / avgRankings.length;

  const variance = avgRankings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / avgRankings.length;

  return Math.sqrt(variance); // Standard deviation
}

/**
 * Fisher-Yates shuffle algorithm
 * @param {Array} array
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export default {
  generateBalancedGroups,
  validateGroupsConfiguration,
  previewGroupsDistribution,
  calculateGroupBalanceScore,
};
