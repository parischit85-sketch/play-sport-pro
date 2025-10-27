/**
 * @fileoverview Match Generation Service
 * Generates round-robin matches for group stage
 */

import { db } from '../../../services/firebase.js';
import { collection, doc, writeBatch, Timestamp } from 'firebase/firestore';
import { COLLECTIONS, MATCH_STATUS } from '../utils/tournamentConstants.js';

/**
 * Generate all round-robin matches for tournament groups
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Array} groups - Array of group objects with teams
 * @param {Object} options - Match generation options
 * @param {Object} options.playersRanking - Map of playerId to current ranking (snapshot at match creation)
 * @returns {Promise<{success: boolean, matches?: Array, error?: string}>}
 */
export async function generateGroupMatches(clubId, tournamentId, groups, options = {}) {
  try {
    console.log('🎮 Generating group matches for', groups.length, 'groups');

    const {
      startDate = new Date(),
      matchDuration = 60, // minutes
      breakBetweenMatches = 15, // minutes
      matchesPerDay = 4,
      playersRanking = {}, // Map of playerId -> current ranking (snapshot)
    } = options;

    console.log('🎯 [generateGroupMatches] ========== INIZIO ==========');
    console.log('📊 Players ranking snapshot size:', Object.keys(playersRanking).length);
    if (Object.keys(playersRanking).length > 0) {
      console.log('📊 Sample rankings:');
      Object.entries(playersRanking)
        .slice(0, 5)
        .forEach(([id, rating]) => {
          console.log(`  ${id}: ${rating}`);
        });
    }

    const allMatches = [];
    const batch = writeBatch(db);
    let currentDate = new Date(startDate);
    let matchCounter = 0;

    // For each group, generate round-robin matches
    for (const group of groups) {
      console.log(`🎮 Generating matches for group: ${group.name}`);
      console.log(`  Teams in group: ${group.teams?.length || 0}`);

      const groupMatches = generateRoundRobinMatches(group, playersRanking);

      // Create Firestore documents for each match
      for (const match of groupMatches) {
        const matchRef = doc(
          collection(
            db,
            'clubs',
            clubId,
            COLLECTIONS.TOURNAMENTS,
            tournamentId,
            COLLECTIONS.MATCHES
          )
        );

        // Calculate scheduled time
        const matchesScheduledToday = matchCounter % matchesPerDay;
        if (matchesScheduledToday === 0 && matchCounter > 0) {
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
          currentDate.setHours(10, 0, 0, 0); // Reset to 10 AM
        }

        const scheduledTime = new Date(currentDate);
        scheduledTime.setMinutes(
          scheduledTime.getMinutes() + matchesScheduledToday * (matchDuration + breakBetweenMatches)
        );

        const matchData = {
          ...match,
          id: matchRef.id,
          tournamentId,
          clubId,
          status: MATCH_STATUS.SCHEDULED,
          scheduledFor: Timestamp.fromDate(scheduledTime),
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
        };

        batch.set(matchRef, matchData);
        allMatches.push({ id: matchRef.id, ...matchData });
        matchCounter++;
      }
    }

    // Commit all matches in a single batch
    console.log('💾 Saving', allMatches.length, 'matches to Firestore...');
    await batch.commit();

    console.log('✅ Group matches generated successfully');
    return {
      success: true,
      matches: allMatches,
      totalMatches: allMatches.length,
    };
  } catch (error) {
    console.error('Error generating group matches:', error);
    return {
      success: false,
      error: error.message || 'Errore durante la generazione delle partite',
    };
  }
}

/**
 * Generate round-robin matches for a single group
 * Uses round-robin algorithm to ensure each team plays every other team once
 * @param {Object} group - Group object with id, name, and teams array
 * @param {Object} playersRanking - Map of playerId to current ranking (snapshot)
 * @returns {Array} Array of match objects
 */
function generateRoundRobinMatches(group, playersRanking = {}) {
  const matches = [];
  const teams = group.teams || [];
  const numTeams = teams.length;

  console.log('🎯 [generateRoundRobinMatches] Group:', group.name);
  console.log('📊 Teams:', numTeams);
  console.log('📊 Players ranking available:', Object.keys(playersRanking).length);

  if (numTeams < 2) {
    return matches;
  }

  // Helper function to get team average ranking snapshot
  const getTeamAverageRanking = (team) => {
    if (!team || !team.players) return null;

    console.log(`  📊 Team "${team.teamName}" players:`, team.players?.length || 0);

    const rankings = team.players
      .map((p) => {
        const ranking = playersRanking[p.playerId] || p.ranking;
        console.log(
          `    - ${p.playerName}: ranking=${ranking} (snapshot=${playersRanking[p.playerId]}, stored=${p.ranking})`
        );
        return ranking;
      })
      .filter((r) => typeof r === 'number');

    if (rankings.length === 0) return null;
    const avg = rankings.reduce((sum, r) => sum + r, 0) / rankings.length;
    console.log(`  🏆 Team average ranking: ${avg}`);
    return avg;
  };

  // Round-robin algorithm
  // For N teams, we need N-1 rounds (if N is even) or N rounds (if N is odd)
  const rounds = numTeams % 2 === 0 ? numTeams - 1 : numTeams;
  let teamsArray = [...teams];

  // If odd number of teams, add a "bye" placeholder
  if (numTeams % 2 !== 0) {
    teamsArray.push(null); // null represents a bye
  }

  const totalTeams = teamsArray.length;
  let matchNumber = 1;

  for (let round = 0; round < rounds; round++) {
    const roundMatches = [];

    // Generate matches for this round
    for (let i = 0; i < totalTeams / 2; i++) {
      const team1 = teamsArray[i];
      const team2 = teamsArray[totalTeams - 1 - i];

      // Skip if either team is a bye
      if (team1 && team2) {
        // Get ranking snapshot for this match
        const team1Players =
          team1.players?.map((p) => ({
            playerId: p.playerId,
            playerName: p.playerName,
            ranking: playersRanking[p.playerId] || p.ranking || null,
          })) || [];

        const team2Players =
          team2.players?.map((p) => ({
            playerId: p.playerId,
            playerName: p.playerName,
            ranking: playersRanking[p.playerId] || p.ranking || null,
          })) || [];

        const match = {
          type: 'group',
          groupId: group.id,
          groupName: group.name,
          round: round + 1,
          matchNumber: matchNumber++,
          team1Id: team1.teamId,
          team1Name: team1.teamName,
          team1Players: team1Players,
          team1AverageRanking: getTeamAverageRanking(team1),
          team2Id: team2.teamId,
          team2Name: team2.teamName,
          team2Players: team2Players,
          team2AverageRanking: getTeamAverageRanking(team2),
          score: {
            team1: 0,
            team2: 0,
          },
          winnerId: null,
          completedAt: null,
        };

        console.log(`  ✅ Match ${matchNumber - 1}: ${team1.teamName} vs ${team2.teamName}`);
        console.log(
          `     Team1 avg: ${match.team1AverageRanking}, Team2 avg: ${match.team2AverageRanking}`
        );

        roundMatches.push(match);
      }
    }

    matches.push(...roundMatches);

    // Rotate teams for next round (keep first team fixed, rotate others)
    if (totalTeams > 2) {
      const fixed = teamsArray[0];
      const rotatingTeams = teamsArray.slice(1);
      rotatingTeams.unshift(rotatingTeams.pop()); // Rotate right
      teamsArray = [fixed, ...rotatingTeams];
    }
  }

  console.log(`🏆 [generateRoundRobinMatches] Total matches generated: ${matches.length}`);
  if (matches.length > 0) {
    console.log('📋 Sample match data:', {
      team1Players: matches[0].team1Players,
      team1AverageRanking: matches[0].team1AverageRanking,
      team2Players: matches[0].team2Players,
      team2AverageRanking: matches[0].team2AverageRanking,
    });
  }

  return matches;
}

/**
 * Generate knockout bracket matches
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Array} qualifiedTeams - Teams qualified from group stage
 * @param {Object} bracket - Bracket structure from bracketGenerator
 * @param {Object} options - Match generation options
 * @returns {Promise<{success: boolean, matches?: Array, error?: string}>}
 */
export async function generateKnockoutMatches(
  clubId,
  tournamentId,
  qualifiedTeams,
  bracket,
  options = {}
) {
  try {
    console.log('🏆 Generating knockout matches for', qualifiedTeams.length, 'teams');

    const { startDate = new Date() } = options;

    const allMatches = [];
    const batch = writeBatch(db);
    let currentDate = new Date(startDate);

    // Process each round
    const rounds = bracket.rounds || [];
    for (const round of rounds) {
      for (const match of round.matches) {
        const matchRef = doc(
          collection(
            db,
            'clubs',
            clubId,
            COLLECTIONS.TOURNAMENTS,
            tournamentId,
            COLLECTIONS.MATCHES
          )
        );

        // Schedule matches: 1 day between rounds
        const scheduledTime = new Date(currentDate);

        const matchData = {
          id: matchRef.id,
          tournamentId,
          clubId,
          type: 'knockout',
          round: round.round,
          roundName: round.roundName,
          matchNumber: match.matchNumber,
          team1Id: match.team1Id || null,
          team1Name: match.team1Name || 'TBD',
          team2Id: match.team2Id || null,
          team2Name: match.team2Name || 'TBD',
          nextMatchId: match.nextMatchId || null,
          nextMatchPosition: match.nextMatchPosition || null,
          status: MATCH_STATUS.SCHEDULED,
          scheduledFor: Timestamp.fromDate(scheduledTime),
          score: {
            team1: 0,
            team2: 0,
          },
          winnerId: null,
          completedAt: null,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
        };

        batch.set(matchRef, matchData);
        allMatches.push({ id: matchRef.id, ...matchData });
      }

      // Move to next day for next round
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log('💾 Saving', allMatches.length, 'knockout matches to Firestore...');
    await batch.commit();

    console.log('✅ Knockout matches generated successfully');
    return {
      success: true,
      matches: allMatches,
      totalMatches: allMatches.length,
    };
  } catch (error) {
    console.error('Error generating knockout matches:', error);
    return {
      success: false,
      error: error.message || 'Errore durante la generazione delle partite eliminatorie',
    };
  }
}

/**
 * Calculate total number of round-robin matches for N teams
 * Formula: N * (N - 1) / 2
 * @param {number} numTeams
 * @returns {number}
 */
export function calculateTotalRoundRobinMatches(numTeams) {
  if (numTeams < 2) return 0;
  return (numTeams * (numTeams - 1)) / 2;
}

/**
 * Validate match schedule doesn't have conflicts
 * @param {Array} matches
 * @returns {boolean}
 */
export function validateMatchSchedule(matches) {
  // Check for time conflicts (same time, same team)
  const timeSlots = new Map();

  for (const match of matches) {
    if (!match.scheduledFor) continue;

    const time = match.scheduledFor.toMillis();
    const teams = [match.team1Id, match.team2Id].filter(Boolean);

    for (const teamId of teams) {
      const key = `${time}_${teamId}`;
      if (timeSlots.has(key)) {
        console.warn('Conflict detected:', key, match);
        return false;
      }
      timeSlots.set(key, match.id);
    }
  }

  return true;
}
