/**
 * @fileoverview Tournament Service
 * Main CRUD operations for tournaments
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
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import {
  TOURNAMENT_STATUS,
  DEFAULT_TOURNAMENT_CONFIG,
  COLLECTIONS,
} from '../utils/tournamentConstants.js';
import { getTeamsByTournament } from './teamsService.js';
import { generateBalancedGroups } from '../algorithms/groupsGenerator.js';
import { getTeamsByGroup } from './teamsService.js';
import { generateGroupMatches } from './matchGenerator.js';
import {
  validateTournamentName,
  validateGroupsConfig,
  validatePointsSystem,
  validateStatusTransition,
  sanitizeTournamentName,
} from '../utils/tournamentValidation.js';
import { revertTournamentChampionshipPoints } from './championshipApplyService.js';

/**
 * Create a new tournament
 * @param {import('../types/tournamentTypes').TournamentCreationDTO} tournamentData
 * @param {string} userId
 * @returns {Promise<{success: boolean, tournamentId?: string, error?: string}>}
 */
export async function createTournament(tournamentData, userId) {
  try {
    // Validate tournament name
    const nameValidation = validateTournamentName(tournamentData.name);
    if (!nameValidation.valid) {
      return { success: false, error: nameValidation.error };
    }

    // Validate groups configuration
    const groupsValidation = validateGroupsConfig(
      tournamentData.numberOfGroups,
      tournamentData.teamsPerGroup,
      tournamentData.qualifiedPerGroup
    );
    if (!groupsValidation.valid) {
      return { success: false, error: groupsValidation.error };
    }

    // Validate points system
    const pointsValidation = validatePointsSystem(tournamentData.pointsSystem);
    if (!pointsValidation.valid) {
      return { success: false, error: pointsValidation.error };
    }

    // Calculate min/max teams - sistema rigido
    const minTeams = tournamentData.numberOfGroups * tournamentData.teamsPerGroup;
    const maxTeams = minTeams; // Sistema rigido: max = min

    // Create tournament document
    const tournament = {
      clubId: tournamentData.clubId,
      name: sanitizeTournamentName(tournamentData.name),
      description: tournamentData.description || null,
      status: TOURNAMENT_STATUS.DRAFT,
      participantType: tournamentData.participantType,
      
      configuration: {
        numberOfGroups: tournamentData.numberOfGroups,
        teamsPerGroup: tournamentData.teamsPerGroup,
        qualifiedPerGroup: tournamentData.qualifiedPerGroup,
        includeThirdPlaceMatch: tournamentData.includeThirdPlaceMatch ?? true,
        automaticGroupsGeneration: true,
        minTeamsRequired: minTeams,
        maxTeamsAllowed: maxTeams,
        defaultRankingForNonParticipants:
          typeof tournamentData.defaultRankingForNonParticipants === 'number'
            ? tournamentData.defaultRankingForNonParticipants
            : 1500,
        // Persist championship points configuration if provided
        championshipPoints: {
          rpaMultiplier: Number(tournamentData?.championshipPoints?.rpaMultiplier ?? 1),
          groupPlacementPoints: {
            1: Number(tournamentData?.championshipPoints?.groupPlacementPoints?.[1] ?? 100),
            2: Number(tournamentData?.championshipPoints?.groupPlacementPoints?.[2] ?? 60),
            3: Number(tournamentData?.championshipPoints?.groupPlacementPoints?.[3] ?? 40),
            4: Number(tournamentData?.championshipPoints?.groupPlacementPoints?.[4] ?? 20),
          },
          knockoutProgressPoints: {
            round_of_16: Number(tournamentData?.championshipPoints?.knockoutProgressPoints?.round_of_16 ?? 10),
            quarter_finals: Number(tournamentData?.championshipPoints?.knockoutProgressPoints?.quarter_finals ?? 20),
            semi_finals: Number(tournamentData?.championshipPoints?.knockoutProgressPoints?.semi_finals ?? 40),
            finals: Number(tournamentData?.championshipPoints?.knockoutProgressPoints?.finals ?? 80),
            third_place: Number(tournamentData?.championshipPoints?.knockoutProgressPoints?.third_place ?? 15),
          },
        },
      },
      
      pointsSystem: tournamentData.pointsSystem,
      
      registration: {
        opensAt: tournamentData.registrationOpensAt ? Timestamp.fromDate(new Date(tournamentData.registrationOpensAt)) : null,
        closesAt: tournamentData.registrationClosesAt ? Timestamp.fromDate(new Date(tournamentData.registrationClosesAt)) : null,
        currentTeamsCount: 0,
        isOpen: false,
      },
      
      groups: null,
      knockoutBracket: null,

      registeredTeams: 0,
      maxTeams: maxTeams,
      
      statistics: {
        totalTeams: 0,
        totalMatches: 0,
        completedMatches: 0,
        pendingMatches: 0,
        totalSets: 0,
        totalGames: 0,
        averageMatchDuration: null,
        firstMatchDate: null,
        lastMatchDate: null,
      },
      
      createdAt: Timestamp.now(),
      createdBy: userId,
      updatedAt: Timestamp.now(),
      completedAt: null,
    };

    const tournamentsRef = collection(db, 'clubs', tournamentData.clubId, COLLECTIONS.TOURNAMENTS);
    const docRef = await addDoc(tournamentsRef, tournament);

    return { success: true, tournamentId: docRef.id };
  } catch (error) {
    console.error('Error creating tournament:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get tournament by ID
 * @param {string} clubId
 * @param {string} tournamentId
 * @returns {Promise<Object | null>}
 */
export async function getTournament(clubId, tournamentId) {
  try {
    const tournamentRef = doc(db, 'clubs', clubId, COLLECTIONS.TOURNAMENTS, tournamentId);
    const tournamentSnap = await getDoc(tournamentRef);
    
    if (!tournamentSnap.exists()) {
      return null;
    }
    
    return {
      id: tournamentSnap.id,
      ...tournamentSnap.data(),
    };
  } catch (error) {
    console.error('Error getting tournament:', error);
    return null;
  }
}

// Alias export for getTournament
export const getTournamentById = getTournament;

/**
 * Get all tournaments for a club
 * @param {string} clubId
 * @param {Object} options - Query options
 * @returns {Promise<Array>}
 */
export async function getTournaments(clubId, options = {}) {
  try {
    const tournamentsRef = collection(db, 'clubs', clubId, COLLECTIONS.TOURNAMENTS);
    let q = query(tournamentsRef);
    
    // Apply filters
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }
    
    // Apply sorting
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';
    q = query(q, orderBy(sortBy, sortOrder));
    
    // Apply limit
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting tournaments:', error);
    return [];
  }
}

/**
 * Update tournament
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Object} updates
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateTournament(clubId, tournamentId, updates) {
  try {
    const tournamentRef = doc(db, 'clubs', clubId, COLLECTIONS.TOURNAMENTS, tournamentId);
    
    // Add updated timestamp
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    await updateDoc(tournamentRef, updateData);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating tournament:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update tournament status
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} newStatus
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateTournamentStatus(clubId, tournamentId, newStatus) {
  try {
    // Get current tournament
    const tournament = await getTournament(clubId, tournamentId);
    if (!tournament) {
      return { success: false, error: 'Torneo non trovato' };
    }
    
    // Validate status transition
    const validation = validateStatusTransition(tournament.status, newStatus);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Update status
    const previousStatus = tournament.status;
    const updates = { 
      status: newStatus,
      phaseHistory: [
        ...(tournament.phaseHistory || []),
        { from: previousStatus, to: newStatus, timestamp: Timestamp.now() },
      ],
    };
    
    // Handle special status transitions
    if (newStatus === TOURNAMENT_STATUS.REGISTRATION_OPEN) {
      updates['registration.isOpen'] = true;
    }
    
    if (newStatus === TOURNAMENT_STATUS.REGISTRATION_CLOSED) {
      updates['registration.isOpen'] = false;
    }
    
    if (newStatus === TOURNAMENT_STATUS.COMPLETED) {
      updates.completedAt = Timestamp.now();
    }
    
    return await updateTournament(clubId, tournamentId, updates);
  } catch (error) {
    console.error('Error updating tournament status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Auto-generate groups based on team rankings and advance to GROUPS_PHASE
 * - Fetches tournament and registered teams
 * - Generates balanced groups using serpentine distribution
 * - Assigns teams to groups (handled by groups generator)
 * - Updates tournament document with groups and new status
 * @param {string} clubId
 * @param {string} tournamentId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function autoGenerateGroups(clubId, tournamentId) {
  try {
    const tournament = await getTournament(clubId, tournamentId);
    if (!tournament) {
      return { success: false, error: 'Torneo non trovato' };
    }

    const numberOfGroups = tournament.configuration?.numberOfGroups || tournament.groupsConfig?.numberOfGroups;
    const teamsPerGroup = tournament.configuration?.teamsPerGroup || tournament.groupsConfig?.teamsPerGroup;

    if (!numberOfGroups || !teamsPerGroup) {
      return { success: false, error: 'Configurazione gironi non valida (numero gironi o squadre per girone mancante)' };
    }

    // Clean up old data before generating new groups
    // Delete all existing group stage matches
    try {
      const matchesColl = collection(db, 'clubs', clubId, COLLECTIONS.TOURNAMENTS, tournamentId, COLLECTIONS.MATCHES);
      const qGroups = query(matchesColl, where('type', '==', 'group'));
      const snap = await getDocs(qGroups);

      if (!snap.empty) {
        const { writeBatch } = await import('firebase/firestore');
        let batch = writeBatch(db);
        let ops = 0;

        for (const docSnap of snap.docs) {
          batch.delete(docSnap.ref);
          ops++;
          if (ops >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            ops = 0;
          }
        }
        if (ops > 0) {
          await batch.commit();
        }
      }

      // Delete all standings
      const standingsColl = collection(db, 'clubs', clubId, COLLECTIONS.TOURNAMENTS, tournamentId, 'standings');
      const snapStandings = await getDocs(standingsColl);

      if (!snapStandings.empty) {
        const { writeBatch } = await import('firebase/firestore');
        let batch = writeBatch(db);
        let ops = 0;

        for (const docSnap of snapStandings.docs) {
          batch.delete(docSnap.ref);
          ops++;
          if (ops >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            ops = 0;
          }
        }
        if (ops > 0) {
          await batch.commit();
        }
      }
    } catch (cleanupError) {
      console.warn('⚠️ Warning during cleanup of old data:', cleanupError);
      // Don't fail the operation if cleanup has issues
    }

    const teams = await getTeamsByTournament(clubId, tournamentId);
    const activeTeams = (teams || []).filter((t) => t.status === 'active');

    const result = await generateBalancedGroups(
      clubId,
      tournamentId,
      activeTeams,
      numberOfGroups,
      teamsPerGroup
    );

    if (!result.success) {
      return { success: false, error: result.error || 'Errore nella generazione dei gironi' };
    }

    const updates = {
      groups: result.groups,
      status: TOURNAMENT_STATUS.GROUPS_PHASE,
      'configuration.generatedAt': new Date().toISOString(),
      phaseHistory: [
        ...(tournament.phaseHistory || []),
        { from: tournament.status, to: TOURNAMENT_STATUS.GROUPS_PHASE, timestamp: Timestamp.now() },
      ],
    };

    const updateRes = await updateTournament(clubId, tournamentId, updates);
    if (!updateRes.success) {
      return updateRes;
    }

    return { success: true };
  } catch (error) {
    console.error('Error auto-generating groups:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate group-stage matches based on current tournament groups
 * @param {string} clubId
 * @param {string} tournamentId
 * @returns {Promise<{success: boolean, totalMatches?: number, error?: string}>}
 */
export async function generateGroupStageMatches(clubId, tournamentId) {
  try {
    const tournament = await getTournament(clubId, tournamentId);
    if (!tournament) return { success: false, error: 'Torneo non trovato' };

    const groupsSummary = tournament.groups || [];
    if (!groupsSummary.length) return { success: false, error: 'Nessun girone trovato' };

    // Build groups with team objects required by matchGenerator
    const groupsWithTeams = [];
    for (const g of groupsSummary) {
      const teamDocs = await getTeamsByGroup(clubId, tournamentId, g.id);
      const teams = (teamDocs || []).map((t) => ({
        teamId: t.id,
        teamName: t.teamName || t.name || 'Senza Nome',
      }));
      groupsWithTeams.push({ id: g.id, name: g.name || `Girone ${g.id}`, teams });
    }

    const options = {
      startDate: tournament.startDate ? new Date(tournament.startDate) : new Date(),
      matchDuration: tournament.configuration?.matchDuration || 60,
      breakBetweenMatches: tournament.configuration?.breakBetweenMatches || 15,
      matchesPerDay: tournament.configuration?.matchesPerDay || 4,
    };

    const res = await generateGroupMatches(clubId, tournamentId, groupsWithTeams, options);
    if (!res.success) return { success: false, error: res.error };

    // Update stats (best-effort)
    await updateTournament(clubId, tournamentId, {
      totalMatches: (tournament.totalMatches || 0) + (res.totalMatches || 0),
      'statistics.totalMatches': (tournament.statistics?.totalMatches || 0) + (res.totalMatches || 0),
      updatedAt: Timestamp.now(),
    });

    return { success: true, totalMatches: res.totalMatches || 0 };
  } catch (error) {
    console.error('Error generating group-stage matches:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete tournament
 * @param {string} clubId
 * @param {string} tournamentId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteTournament(clubId, tournamentId) {
  try {
    // 1) Revert championship points if they were applied for this tournament
    try {
      await revertTournamentChampionshipPoints(clubId, tournamentId);
    } catch (revertErr) {
      console.warn('⚠️ Failed to revert championship points during deletion:', revertErr);
      // Continue best-effort; the tournament will be deleted regardless
    }

    // 2) Best-effort delete subcollections (matches, teams, standings)
    const deleteSubcollection = async (subcolName) => {
      try {
        const collRef = collection(
          db,
          'clubs',
          clubId,
          COLLECTIONS.TOURNAMENTS,
          tournamentId,
          subcolName
        );
        const snap = await getDocs(collRef);
        const ops = snap.docs.map((d) => deleteDoc(d.ref));
        await Promise.allSettled(ops);
      } catch (e) {
        console.warn(`⚠️ Failed to delete subcollection ${subcolName}:`, e);
      }
    };

    await deleteSubcollection(COLLECTIONS.MATCHES);
    await deleteSubcollection(COLLECTIONS.TEAMS);
    await deleteSubcollection(COLLECTIONS.STANDINGS);

    // 3) Finally delete the tournament document
    const tournamentRef = doc(db, 'clubs', clubId, COLLECTIONS.TOURNAMENTS, tournamentId);
    await deleteDoc(tournamentRef);

    return { success: true };
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Open tournament registration
 * @param {string} clubId
 * @param {string} tournamentId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function openRegistration(clubId, tournamentId) {
  return await updateTournamentStatus(clubId, tournamentId, TOURNAMENT_STATUS.REGISTRATION_OPEN);
}

/**
 * Close tournament registration
 * @param {string} clubId
 * @param {string} tournamentId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function closeRegistration(clubId, tournamentId) {
  return await updateTournamentStatus(clubId, tournamentId, TOURNAMENT_STATUS.REGISTRATION_CLOSED);
}

/**
 * Cancel tournament
 * @param {string} clubId
 * @param {string} tournamentId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function cancelTournament(clubId, tournamentId) {
  return await updateTournamentStatus(clubId, tournamentId, TOURNAMENT_STATUS.CANCELLED);
}

/**
 * Update tournament statistics
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Object} statisticsUpdate
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateStatistics(clubId, tournamentId, statisticsUpdate) {
  try {
    const tournament = await getTournament(clubId, tournamentId);
    if (!tournament) {
      return { success: false, error: 'Torneo non trovato' };
    }
    
    const updates = {
      statistics: {
        ...tournament.statistics,
        ...statisticsUpdate,
      },
    };
    
    return await updateTournament(clubId, tournamentId, updates);
  } catch (error) {
    console.error('Error updating statistics:', error);
    return { success: false, error: error.message };
  }
}

export default {
  createTournament,
  getTournament,
  getTournamentById: getTournament, // Alias for getTournament
  getTournaments,
  updateTournament,
  updateTournamentStatus,
  autoGenerateGroups,
  generateGroupStageMatches,
  deleteTournament,
  openRegistration,
  closeRegistration,
  cancelTournament,
  updateStatistics,
};
