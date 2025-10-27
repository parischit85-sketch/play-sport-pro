/**
 * @fileoverview Standings Service
 * Calculate and manage tournament standings/rankings
 */

import { db } from '../../../services/firebase.js';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { COLLECTIONS } from '../utils/tournamentConstants.js';
import { getMatches, getMatchesByGroup } from './matchService.js';
import { getTeamsByTournament, getTeam } from './teamsService.js';
import { calculateTeamTotalPoints, calculateTeamTotalRPAPoints } from './pointsService.js';
import { getTournament } from './tournamentService.js';

/**
 * Calculate standings for a group
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} groupId
 * @param {Object} pointsSystem
 * @returns {Promise<Array>}
 */
export async function calculateGroupStandings(clubId, tournamentId, groupId, pointsSystem) {
  try {
    // Get all teams in group
    const allTeams = await getTeamsByTournament(clubId, tournamentId);
    const groupTeams = allTeams.filter((t) => t.groupId === groupId && t.status === 'active');

    // Get all group matches
    const matches = await getMatchesByGroup(clubId, tournamentId, groupId);
    const completedMatches = matches.filter((m) => m.status === 'completed');

    // Create teams map for rankings
    const teamsMap = {};
    groupTeams.forEach((team) => {
      teamsMap[team.id] = team;
    });

    // Get tournament data for RPA calculations
    const tournament = await getTournament(clubId, tournamentId);
    
    // Ensure tournament has proper configuration
    const tournamentConfig = tournament || {};
    if (!tournamentConfig.configuration) {
      tournamentConfig.configuration = {};
    }
    if (!tournamentConfig.configuration.championshipPoints) {
      tournamentConfig.configuration.championshipPoints = { rpaMultiplier: 1 };
    }

    // Calculate standings for each team
    const standings = groupTeams.map((team) => {
      const teamMatches = completedMatches.filter((m) => m.team1Id === team.id || m.team2Id === team.id);

      const stats = {
        teamId: team.id,
        teamName: team.teamName,
        groupId,
        matchesPlayed: teamMatches.length,
        matchesWon: 0,
        matchesDrawn: 0,
        matchesLost: 0,
        setsWon: 0,
        setsLost: 0,
        gamesWon: 0,
        gamesLost: 0,
      };

      // Calculate match results and scores
      teamMatches.forEach((match) => {
        const isTeam1 = match.team1Id === team.id;
        const teamScore = isTeam1 ? match.score.team1 : match.score.team2;
        const opponentScore = isTeam1 ? match.score.team2 : match.score.team1;

        // Count wins/losses
        if (match.winnerId === team.id) {
          stats.matchesWon++;
        } else if (match.score.team1 === match.score.team2) {
          stats.matchesDrawn++;
        } else {
          stats.matchesLost++;
        }

        // Accumulate sets/games
        stats.setsWon += teamScore;
        stats.setsLost += opponentScore;

        // If per-set games are available, accumulate games won/lost
        if (Array.isArray(match.sets)) {
          match.sets.forEach((s) => {
            if (isTeam1) {
              stats.gamesWon += Number(s.team1 || 0);
              stats.gamesLost += Number(s.team2 || 0);
            } else {
              stats.gamesWon += Number(s.team2 || 0);
              stats.gamesLost += Number(s.team1 || 0);
            }
          });
        }
      });

      // Calculate points using points service
      const points = calculateTeamTotalPoints(teamMatches, team.id, pointsSystem, teamsMap);
      
      // Calculate RPA points
      const rpaPoints = calculateTeamTotalRPAPoints(teamMatches, team.id, teamsMap, tournamentConfig);

      return {
        ...stats,
        points,
        rpaPoints,
        setsDifference: stats.setsWon - stats.setsLost,
        gamesDifference: stats.gamesWon - stats.gamesLost,
        lastUpdated: new Date(),
      };
    });

    // Sort standings
    standings.sort((a, b) => {
      // 1. Points (descending)
      if (b.points !== a.points) return b.points - a.points;

      // 2. Head-to-head result (if same points)
      const headToHead = compareHeadToHead(a, b, completedMatches);
      if (headToHead !== 0) return headToHead;

      // 3. Set difference (descending)
      if (b.setsDifference !== a.setsDifference) return b.setsDifference - a.setsDifference;

      // 4. Sets won (descending)
      if (b.setsWon !== a.setsWon) return b.setsWon - a.setsWon;

      // 5. Game difference (descending)
      if (b.gamesDifference !== a.gamesDifference) return b.gamesDifference - a.gamesDifference;

      // 6. Games won (descending)
      return b.gamesWon - a.gamesWon;
    });

    // Assign positions
    standings.forEach((standing, index) => {
      standing.position = index + 1;
      standing.qualified = false; // Will be set later
    });

    return standings;
  } catch (error) {
    console.error('Error calculating group standings:', error);
    return [];
  }
}

/**
 * Calculate overall tournament standings (all teams)
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Object} pointsSystem
 * @returns {Promise<Array>}
 */
export async function calculateOverallStandings(clubId, tournamentId, pointsSystem) {
  try {
    // Get all teams
    const teams = await getTeamsByTournament(clubId, tournamentId);
    const activeTeams = teams.filter((t) => t.status === 'active');

    // Get all matches
    const matches = await getMatches(clubId, tournamentId, { type: 'group' });
    const completedMatches = matches.filter((m) => m.status === 'completed');

    // Create teams map
    const teamsMap = {};
    activeTeams.forEach((team) => {
      teamsMap[team.id] = team;
    });

    // Calculate standings
    const standings = activeTeams.map((team) => {
      const teamMatches = completedMatches.filter((m) => m.team1Id === team.id || m.team2Id === team.id);

      const stats = {
        teamId: team.id,
        teamName: team.teamName,
        groupId: team.groupId,
        matchesPlayed: teamMatches.length,
        matchesWon: 0,
        matchesDrawn: 0,
        matchesLost: 0,
        setsWon: 0,
        setsLost: 0,
        gamesWon: 0,
        gamesLost: 0,
      };

      teamMatches.forEach((match) => {
        const isTeam1 = match.team1Id === team.id;
        const teamScore = isTeam1 ? match.score.team1 : match.score.team2;
        const opponentScore = isTeam1 ? match.score.team2 : match.score.team1;

        if (match.winnerId === team.id) {
          stats.matchesWon++;
        } else if (match.score.team1 === match.score.team2) {
          stats.matchesDrawn++;
        } else {
          stats.matchesLost++;
        }

        stats.setsWon += teamScore;
        stats.setsLost += opponentScore;

        if (Array.isArray(match.sets)) {
          match.sets.forEach((s) => {
            if (isTeam1) {
              stats.gamesWon += Number(s.team1 || 0);
              stats.gamesLost += Number(s.team2 || 0);
            } else {
              stats.gamesWon += Number(s.team2 || 0);
              stats.gamesLost += Number(s.team1 || 0);
            }
          });
        }
      });

      const points = calculateTeamTotalPoints(teamMatches, team.id, pointsSystem, teamsMap);

      return {
        ...stats,
        points,
        setsDifference: stats.setsWon - stats.setsLost,
        gamesDifference: stats.gamesWon - stats.gamesLost,
        lastUpdated: new Date(),
      };
    });

    // Sort
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.setsDifference !== a.setsDifference) return b.setsDifference - a.setsDifference;
      if (b.setsWon !== a.setsWon) return b.setsWon - a.setsWon;
      if (b.gamesDifference !== a.gamesDifference) return b.gamesDifference - a.gamesDifference;
      return b.gamesWon - a.gamesWon;
    });

    standings.forEach((standing, index) => {
      standing.position = index + 1;
      standing.qualified = false;
    });

    return standings;
  } catch (error) {
    console.error('Error calculating overall standings:', error);
    return [];
  }
}

/**
 * Calculate and return per-group standings flattened into a single array.
 * Each team's position is relative to its group (position starts at 1 for each group).
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Object} pointsSystem
 * @returns {Promise<Array>}
 */
export async function calculateAllGroupsStandings(clubId, tournamentId, pointsSystem) {
  try {
    const teams = await getTeamsByTournament(clubId, tournamentId);
    const groupIds = [...new Set(teams.map((t) => t.groupId).filter(Boolean))];

    const all = [];
    for (const groupId of groupIds) {
      const groupStandings = await calculateGroupStandings(
        clubId,
        tournamentId,
        groupId,
        pointsSystem
      );
      // push preserving position as group-local ranking
      for (const row of groupStandings) {
        all.push(row);
      }
    }
    return all;
  } catch (error) {
    console.error('Error calculating all groups standings:', error);
    return [];
  }
}

/**
 * Save standings to Firestore
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Array} standings
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function saveStandings(clubId, tournamentId, standings) {
  try {
    const standingsRef = collection(db, 'clubs', clubId, COLLECTIONS.TOURNAMENTS, tournamentId, COLLECTIONS.STANDINGS);

    // Delete existing standings
    const existingDocs = await getDocs(standingsRef);
    const deletePromises = existingDocs.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Save new standings
    const savePromises = standings.map((standing) => {
      const docRef = doc(standingsRef, standing.teamId);
      return setDoc(docRef, {
        ...standing,
        lastUpdated: Timestamp.now(),
      });
    });

    await Promise.all(savePromises);

    return { success: true };
  } catch (error) {
    console.error('Error saving standings:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get saved standings from Firestore
 * @param {string} clubId
 * @param {string} tournamentId
 * @returns {Promise<Array>}
 */
export async function getStandings(clubId, tournamentId) {
  try {
    const standingsRef = collection(db, 'clubs', clubId, COLLECTIONS.TOURNAMENTS, tournamentId, COLLECTIONS.STANDINGS);

    const snapshot = await getDocs(standingsRef);

    const standings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by position
    standings.sort((a, b) => a.position - b.position);

    return standings;
  } catch (error) {
    console.error('Error getting standings:', error);
    return [];
  }
}

/**
 * Get qualified teams from group standings
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {number} qualifiedPerGroup
 * @returns {Promise<Array>} Array of qualified team objects with group and position
 */
export async function getQualifiedTeams(clubId, tournamentId, qualifiedPerGroup) {
  try {
    const standings = await getStandings(clubId, tournamentId);

    // Group standings by groupId
    const standingsByGroup = {};
    standings.forEach((standing) => {
      if (!standingsByGroup[standing.groupId]) {
        standingsByGroup[standing.groupId] = [];
      }
      standingsByGroup[standing.groupId].push(standing);
    });

    // Get top N from each group
    const qualified = [];

    Object.entries(standingsByGroup).forEach(([groupId, groupStandings]) => {
      // Sort by position
      groupStandings.sort((a, b) => a.position - b.position);

      // Take top qualifiedPerGroup
      const topTeams = groupStandings.slice(0, qualifiedPerGroup);

      topTeams.forEach((standing) => {
        qualified.push({
          teamId: standing.teamId,
          groupId: standing.groupId,
          groupPosition: standing.position,
          points: standing.points,
          setsDifference: standing.setsDifference,
        });
      });
    });

    return qualified;
  } catch (error) {
    console.error('Error getting qualified teams:', error);
    return [];
  }
}

/**
 * Update standings after a match is completed
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Object} pointsSystem
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateStandingsAfterMatch(clubId, tournamentId, pointsSystem) {
  try {
    // Recalculate per-group standings and flatten
    const standings = await calculateAllGroupsStandings(clubId, tournamentId, pointsSystem);

    // Save to Firestore
    const standingsResult = await saveStandings(clubId, tournamentId, standings);

    // 📊 Update tournament completedMatches counter
    try {
      const allMatches = await getMatches(clubId, tournamentId);
      const completedMatches = allMatches.filter((m) => m.status === 'completed').length;
      const totalMatches = allMatches.length;

      console.log(
        `📊 [updateStandingsAfterMatch] Updating match counters: ${completedMatches}/${totalMatches}`
      );

      const tournamentRef = doc(db, 'clubs', clubId, COLLECTIONS.TOURNAMENTS, tournamentId);
      await updateDoc(tournamentRef, {
        completedMatches,
        totalMatches,
        lastUpdated: Timestamp.now(),
      });

      console.log(`✅ [updateStandingsAfterMatch] Match counters updated successfully`);
    } catch (counterError) {
      console.warn('⚠️ [updateStandingsAfterMatch] Failed to update match counters:', counterError);
      // Não falhar toda a operação por causa disso
    }

    return standingsResult;
  } catch (error) {
    console.error('Error updating standings:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Compare head-to-head result between two teams
 * Used as tiebreaker when teams have same points
 * @param {Object} teamA - Standing object for team A
 * @param {Object} teamB - Standing object for team B
 * @param {Array} matches - All completed matches in the group
 * @returns {number} - Positive if A wins, negative if B wins, 0 if draw/no match
 */
function compareHeadToHead(teamA, teamB, matches) {
  // Find direct match between these two teams
  const directMatch = matches.find(
    (m) =>
      (m.team1Id === teamA.teamId && m.team2Id === teamB.teamId) ||
      (m.team1Id === teamB.teamId && m.team2Id === teamA.teamId)
  );

  if (!directMatch || !directMatch.winnerId) {
    return 0; // No match played or draw
  }

  // Team A won the direct match
  if (directMatch.winnerId === teamA.teamId) {
    return -1; // A should be ranked higher (sort descending)
  }

  // Team B won the direct match
  if (directMatch.winnerId === teamB.teamId) {
    return 1; // B should be ranked higher
  }

  // If we reach here (shouldn't), compare set difference in direct match
  if (directMatch.team1Id === teamA.teamId) {
    const setDiff = (directMatch.score?.team1 || 0) - (directMatch.score?.team2 || 0);
    return -setDiff; // Negative because sort is descending
  } else {
    const setDiff = (directMatch.score?.team2 || 0) - (directMatch.score?.team1 || 0);
    return -setDiff;
  }
}

export default {
  calculateGroupStandings,
  calculateOverallStandings,
  calculateAllGroupsStandings,
  saveStandings,
  getStandings,
  getQualifiedTeams,
  updateStandingsAfterMatch,
};
