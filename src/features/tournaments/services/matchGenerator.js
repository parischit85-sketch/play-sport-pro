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
    } = options;

    const allMatches = [];
    const batch = writeBatch(db);
    let currentDate = new Date(startDate);
    let matchCounter = 0;

    // For each group, generate round-robin matches
    for (const group of groups) {
      const groupMatches = generateRoundRobinMatches(group);

      // Create Firestore documents for each match
      for (const match of groupMatches) {
        const matchRef = doc(collection(db, 'clubs', clubId, COLLECTIONS.TOURNAMENTS, tournamentId, COLLECTIONS.MATCHES));

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
 * @returns {Array} Array of match objects
 */
function generateRoundRobinMatches(group) {
  const matches = [];
  const teams = group.teams || [];
  const numTeams = teams.length;

  if (numTeams < 2) {
    return matches;
  }

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
        roundMatches.push({
          type: 'group',
          groupId: group.id,
          groupName: group.name,
          round: round + 1,
          matchNumber: matchNumber++,
          team1Id: team1.teamId,
          team1Name: team1.teamName,
          team2Id: team2.teamId,
          team2Name: team2.teamName,
          score: {
            team1: 0,
            team2: 0,
          },
          winnerId: null,
          completedAt: null,
        });
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
export async function generateKnockoutMatches(clubId, tournamentId, qualifiedTeams, bracket, options = {}) {
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
        const matchRef = doc(collection(db, 'clubs', clubId, COLLECTIONS.TOURNAMENTS, tournamentId, COLLECTIONS.MATCHES));

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
