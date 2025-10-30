/**
 * @fileoverview Teams Service
 * Team registration and management operations
 */

import { db } from '../../../services/firebase.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { COLLECTIONS, TEAM_STATUS, VALIDATION_MESSAGES } from '../utils/tournamentConstants.js';
import {
  validateTeamRegistration,
  isRegistrationOpen,
  sanitizeTeamName,
} from '../utils/tournamentValidation.js';
import { updateTournament } from './tournamentService.js';

/**
 * Register a team for a tournament
 * @param {import('../types/tournamentTypes').TeamRegistrationDTO} teamData
 * @returns {Promise<{success: boolean, teamId?: string, error?: string}>}
 */
export async function registerTeam(teamData) {
  try {
    // Get tournament to validate registration
    const tournamentRef = doc(
      db,
      'clubs',
      teamData.clubId,
      COLLECTIONS.TOURNAMENTS,
      teamData.tournamentId
    );
    const tournamentSnap = await getDoc(tournamentRef);

    if (!tournamentSnap.exists()) {
      return { success: false, error: VALIDATION_MESSAGES.TOURNAMENT_NOT_FOUND };
    }

    const tournament = { id: tournamentSnap.id, ...tournamentSnap.data() };

    // Check if registration is open
    if (!isRegistrationOpen(tournament)) {
      return { success: false, error: VALIDATION_MESSAGES.REGISTRATION_CLOSED };
    }

    // Check if tournament is full
    if (tournament.registration.currentTeamsCount >= tournament.configuration.maxTeamsAllowed) {
      return { success: false, error: VALIDATION_MESSAGES.TOURNAMENT_FULL };
    }

    // Validate team data
    const validation = validateTeamRegistration(
      teamData.teamName,
      teamData.players,
      tournament.participantType
    );
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Check for duplicate players already registered
    const existingTeams = await getTeamsByTournament(teamData.clubId, teamData.tournamentId);
    const registeredPlayerIds = new Set();
    existingTeams.forEach((team) => {
      team.players.forEach((player) => {
        registeredPlayerIds.add(player.playerId);
      });
    });

    const hasDuplicates = teamData.players.some((player) =>
      registeredPlayerIds.has(player.playerId)
    );
    if (hasDuplicates) {
      return { success: false, error: VALIDATION_MESSAGES.PLAYER_ALREADY_REGISTERED };
    }

    // Calculate average ranking
    const rankingsAvailable = teamData.players.filter((p) => p.ranking !== null);
    const averageRanking =
      rankingsAvailable.length > 0
        ? rankingsAvailable.reduce((sum, p) => sum + p.ranking, 0) / rankingsAvailable.length
        : null;

    // Create team document
    const team = {
      tournamentId: teamData.tournamentId,
      teamName: sanitizeTeamName(teamData.teamName),
      players: teamData.players.map((p) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        ranking: p.ranking ?? null,
        avatarUrl: p.avatarUrl ?? null,
      })),
      averageRanking,
      groupId: null,
      groupPosition: null,
      registeredAt: Timestamp.now(),
      registeredBy: teamData.registeredBy,
      status: TEAM_STATUS.ACTIVE,
    };

    const teamsRef = collection(
      db,
      'clubs',
      teamData.clubId,
      COLLECTIONS.TOURNAMENTS,
      teamData.tournamentId,
      COLLECTIONS.TEAMS
    );
    const docRef = await addDoc(teamsRef, team);

    // Update tournament registration count
    await updateTournament(teamData.clubId, teamData.tournamentId, {
      'registration.currentTeamsCount': tournament.registration.currentTeamsCount + 1,
      'statistics.totalTeams': tournament.statistics.totalTeams + 1,
      registeredTeams: (tournament.registeredTeams || 0) + 1,
    });

    return { success: true, teamId: docRef.id };
  } catch (error) {
    console.error('Error registering team:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get team by ID
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} teamId
 * @returns {Promise<Object | null>}
 */
export async function getTeam(clubId, tournamentId, teamId) {
  try {
    const teamRef = doc(
      db,
      'clubs',
      clubId,
      COLLECTIONS.TOURNAMENTS,
      tournamentId,
      COLLECTIONS.TEAMS,
      teamId
    );
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
      return null;
    }

    return {
      id: teamSnap.id,
      ...teamSnap.data(),
    };
  } catch (error) {
    console.error('Error getting team:', error);
    return null;
  }
}

/**
 * Get all teams for a tournament
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Object} options
 * @returns {Promise<Array>}
 */
export async function getTeamsByTournament(clubId, tournamentId, options = {}) {
  try {
    const teamsRef = collection(
      db,
      'clubs',
      clubId,
      COLLECTIONS.TOURNAMENTS,
      tournamentId,
      COLLECTIONS.TEAMS
    );

    let q = query(teamsRef);

    // Apply filters
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }

    if (options.groupId) {
      q = query(q, where('groupId', '==', options.groupId));
    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting teams:', error);
    return [];
  }
}

/**
 * Update team
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} teamId
 * @param {Object} updates
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateTeam(clubId, tournamentId, teamId, updates) {
  try {
    const teamRef = doc(
      db,
      'clubs',
      clubId,
      COLLECTIONS.TOURNAMENTS,
      tournamentId,
      COLLECTIONS.TEAMS,
      teamId
    );

    await updateDoc(teamRef, updates);

    return { success: true };
  } catch (error) {
    console.error('Error updating team:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Edit team players and name, recomputing averageRanking and validating duplicates
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} teamId
 * @param {{ teamName: string, players: Array<{playerId:string, playerName:string, ranking:number|null, avatarUrl?:string|null}> }} payload
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function editTeamPlayers(clubId, tournamentId, teamId, payload) {
  try {
    // Basic validation
    if (!payload || !Array.isArray(payload.players) || payload.players.length === 0) {
      return { success: false, error: VALIDATION_MESSAGES.INVALID_PLAYERS_COUNT };
    }

    // Load tournament for participantType rules (optional)
    const tournamentRef = doc(db, 'clubs', clubId, COLLECTIONS.TOURNAMENTS, tournamentId);
    const tournamentSnap = await getDoc(tournamentRef);
    if (!tournamentSnap.exists()) {
      return { success: false, error: VALIDATION_MESSAGES.TOURNAMENT_NOT_FOUND };
    }
    const tournament = tournamentSnap.data();

    // Validate player count based on participant type (default couples=2, else 4)
    const playersPerTeam = tournament.participantType === 'couples' ? 2 : 4;
    if (payload.players.length !== playersPerTeam) {
      return { success: false, error: VALIDATION_MESSAGES.INVALID_PLAYERS_COUNT };
    }

    // Prevent duplicates across teams in the same tournament (excluding current team)
    const existingTeams = await getTeamsByTournament(clubId, tournamentId);
    const registeredPlayerIds = new Set();
    existingTeams.forEach((team) => {
      if (team.id === teamId) return;
      (team.players || []).forEach((p) => registeredPlayerIds.add(p.playerId));
    });
    const hasDuplicates = payload.players.some((p) => registeredPlayerIds.has(p.playerId));
    if (hasDuplicates) {
      return { success: false, error: VALIDATION_MESSAGES.PLAYER_ALREADY_REGISTERED };
    }

    // Compute average ranking
    const rankings = payload.players.map((p) => p.ranking).filter((r) => typeof r === 'number');
    const averageRanking =
      rankings.length > 0 ? rankings.reduce((sum, r) => sum + r, 0) / rankings.length : null;

    // Normalize players structure and update
    const updates = {
      teamName: sanitizeTeamName(payload.teamName || ''),
      players: payload.players.map((p) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        ranking: p.ranking ?? null,
        avatarUrl: p.avatarUrl ?? null,
      })),
      averageRanking,
      updatedAt: Timestamp.now(),
    };

    return await updateTeam(clubId, tournamentId, teamId, updates);
  } catch (error) {
    console.error('Error editing team players:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Withdraw team from tournament
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} teamId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function withdrawTeam(clubId, tournamentId, teamId) {
  try {
    const result = await updateTeam(clubId, tournamentId, teamId, {
      status: TEAM_STATUS.WITHDRAWN,
    });

    if (result.success) {
      // Update tournament count
      const tournamentRef = doc(db, 'clubs', clubId, COLLECTIONS.TOURNAMENTS, tournamentId);
      const tournamentSnap = await getDoc(tournamentRef);

      if (tournamentSnap.exists()) {
        const tournament = tournamentSnap.data();
        await updateTournament(clubId, tournamentId, {
          'registration.currentTeamsCount': Math.max(
            0,
            tournament.registration.currentTeamsCount - 1
          ),
        });
      }
    }

    return result;
  } catch (error) {
    console.error('Error withdrawing team:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete team (only if tournament not started)
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} teamId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteTeam(clubId, tournamentId, teamId) {
  try {
    const teamRef = doc(
      db,
      'clubs',
      clubId,
      COLLECTIONS.TOURNAMENTS,
      tournamentId,
      COLLECTIONS.TEAMS,
      teamId
    );
    await deleteDoc(teamRef);

    // Update tournament count
    const tournamentRef = doc(db, 'clubs', clubId, COLLECTIONS.TOURNAMENTS, tournamentId);
    const tournamentSnap = await getDoc(tournamentRef);

    if (tournamentSnap.exists()) {
      const tournament = tournamentSnap.data();
      await updateTournament(clubId, tournamentId, {
        'registration.currentTeamsCount': Math.max(
          0,
          tournament.registration.currentTeamsCount - 1
        ),
        'statistics.totalTeams': Math.max(0, tournament.statistics.totalTeams - 1),
        registeredTeams: Math.max(0, (tournament.registeredTeams || 0) - 1),
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting team:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Assign team to group
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} teamId
 * @param {string} groupId
 * @param {number} position
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function assignTeamToGroup(clubId, tournamentId, teamId, groupId, position) {
  return await updateTeam(clubId, tournamentId, teamId, {
    groupId,
    groupPosition: position,
  });
}

/**
 * Get teams by group
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} groupId
 * @returns {Promise<Array>}
 */
export async function getTeamsByGroup(clubId, tournamentId, groupId) {
  return await getTeamsByTournament(clubId, tournamentId, { groupId });
}

export default {
  registerTeam,
  getTeam,
  getTeamsByTournament,
  getTeamsByGroup,
  updateTeam,
  withdrawTeam,
  deleteTeam,
  assignTeamToGroup,
  editTeamPlayers,
};
