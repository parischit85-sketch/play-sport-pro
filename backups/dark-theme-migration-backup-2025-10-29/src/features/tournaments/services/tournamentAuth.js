/**
 * @fileoverview Tournament Authorization Service
 * Centralized authorization checks for tournament operations
 */

import { USER_ROLES } from '../../contexts/AuthContext.jsx';
import { getTournament } from './tournamentService.js';
import { isUserClubAdmin, userHasPermission } from '../../../services/affiliations.js';
import { db } from '../../../services/firebase.js';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Permission constants for tournaments
 */
export const TOURNAMENT_PERMISSIONS = {
  CREATE: 'tournaments:create',
  UPDATE: 'tournaments:update',
  DELETE: 'tournaments:delete',
  MANAGE_PHASES: 'tournaments:manage_phases',
  MANAGE_TEAMS: 'tournaments:manage_teams',
  MANAGE_MATCHES: 'tournaments:manage_matches',
  VIEW_ADMIN: 'tournaments:view_admin',
  SUBMIT_RESULTS: 'tournaments:submit_results',
};

/**
 * Helper function to check if user is admin directly from club profile
 * This is more reliable than using affiliations
 */
async function isUserAdminInClub(userId, clubId) {
  try {
    // Check user profile in club
    const profileRef = doc(db, 'clubs', clubId, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return false;
    }

    const profileData = profileSnap.data();

    // Check if user is admin
    const isAdmin =
      profileData.role === 'club_admin' ||
      profileData.role === 'admin' ||
      profileData.isClubAdmin === true;

    return isAdmin;
  } catch (error) {
    console.error('❌ [isUserAdminInClub] Error:', error);
    return false;
  }
}

/**
 * Check if user can create tournaments in club
 * @param {string} userId
 * @param {string} clubId
 * @param {string} userRole - From AuthContext
 * @returns {Promise<{authorized: boolean, reason?: string}>}
 */
export async function canCreateTournament(userId, clubId, userRole) {
  try {
    // Super admin can always create
    if (userRole === USER_ROLES.SUPER_ADMIN) {
      return { authorized: true };
    }

    // Check if user is club admin
    const isAdmin = await isUserClubAdmin(userId, clubId);
    if (!isAdmin) {
      return {
        authorized: false,
        reason: 'Solo gli amministratori del circolo possono creare tornei',
      };
    }

    // Check specific permission
    const hasPermission = await userHasPermission(userId, clubId, TOURNAMENT_PERMISSIONS.CREATE);
    if (!hasPermission) {
      return {
        authorized: false,
        reason: 'Non hai il permesso di creare tornei in questo circolo',
      };
    }

    return { authorized: true };
  } catch (error) {
    console.error('Error checking create tournament permission:', error);
    return { authorized: false, reason: 'Errore durante la verifica dei permessi' };
  }
}

/**
 * Check if user can manage tournament (update, delete, manage phases)
 * @param {string} userId
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} userRole
 * @param {string} action - One of TOURNAMENT_PERMISSIONS
 * @returns {Promise<{authorized: boolean, reason?: string}>}
 */
export async function canManageTournament(userId, clubId, tournamentId, userRole, action) {
  try {
    // Super admin can always manage
    if (userRole === USER_ROLES.SUPER_ADMIN) {
      return { authorized: true };
    }

    // Verify tournament exists and belongs to club
    const tournament = await getTournament(clubId, tournamentId);
    if (!tournament) {
      return { authorized: false, reason: 'Torneo non trovato' };
    }

    if (tournament.clubId !== clubId) {
      return { authorized: false, reason: 'Torneo non appartiene a questo circolo' };
    }

    // Check if user is club admin
    const isAdmin = await isUserClubAdmin(userId, clubId);
    if (!isAdmin) {
      return {
        authorized: false,
        reason: 'Solo gli amministratori del circolo possono gestire tornei',
      };
    }

    // Check specific permission
    const hasPermission = await userHasPermission(userId, clubId, action);
    if (!hasPermission) {
      return {
        authorized: false,
        reason: `Non hai il permesso di ${getActionDescription(action)}`,
      };
    }

    return { authorized: true };
  } catch (error) {
    console.error('Error checking manage tournament permission:', error);
    return { authorized: false, reason: 'Errore durante la verifica dei permessi' };
  }
}

/**
 * Check if user can advance tournament phase
 * @param {string} userId
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} userRole
 * @returns {Promise<{authorized: boolean, reason?: string}>}
 */
export async function canAdvancePhase(userId, clubId, tournamentId, userRole) {
  return canManageTournament(
    userId,
    clubId,
    tournamentId,
    userRole,
    TOURNAMENT_PERMISSIONS.MANAGE_PHASES
  );
}

/**
 * Check if user can submit match results
 * @param {string} userId
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} userRole - Optional, will check club admin status directly
 * @returns {Promise<{authorized: boolean, reason?: string}>}
 */
export async function canSubmitMatchResults(userId, clubId, tournamentId, userRole) {
  try {
    // Super admin can always submit results (from global Auth context)
    if (userRole === USER_ROLES.SUPER_ADMIN) {
      return { authorized: true };
    }

    // Verify tournament exists and belongs to club
    const tournament = await getTournament(clubId, tournamentId);
    if (!tournament) {
      return { authorized: false, reason: 'Torneo non trovato' };
    }

    if (tournament.clubId !== clubId) {
      return { authorized: false, reason: 'Torneo non appartiene a questo circolo' };
    }

    // ✅ FIX: Use direct club profile check instead of affiliations
    const isAdmin = await isUserAdminInClub(userId, clubId);

    if (!isAdmin) {
      return {
        authorized: false,
        reason: 'Solo gli amministratori del circolo possono inserire risultati',
      };
    }

    return { authorized: true };
  } catch (error) {
    console.error('❌ [canSubmitMatchResults] Error checking submit results permission:', error);
    return { authorized: false, reason: 'Errore durante la verifica dei permessi' };
  }
}

/**
 * Check if user can delete tournament
 * @param {string} userId
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} userRole
 * @returns {Promise<{authorized: boolean, reason?: string}>}
 */
export async function canDeleteTournament(userId, clubId, tournamentId, userRole) {
  return canManageTournament(userId, clubId, tournamentId, userRole, TOURNAMENT_PERMISSIONS.DELETE);
}

/**
 * Check if user can view admin features
 * @param {string} userId
 * @param {string} clubId
 * @param {string} userRole
 * @returns {Promise<{authorized: boolean, reason?: string}>}
 */
export async function canViewAdminFeatures(userId, clubId, userRole) {
  try {
    // Super admin can always view
    if (userRole === USER_ROLES.SUPER_ADMIN) {
      return { authorized: true };
    }

    // Check if user is club admin
    const isAdmin = await isUserClubAdmin(userId, clubId);
    if (!isAdmin) {
      return { authorized: false, reason: 'Accesso riservato agli amministratori' };
    }

    return { authorized: true };
  } catch (error) {
    console.error('Error checking admin view permission:', error);
    return { authorized: false, reason: 'Errore durante la verifica dei permessi' };
  }
}

/**
 * Get human-readable description for action
 * @param {string} action
 * @returns {string}
 */
function getActionDescription(action) {
  const descriptions = {
    [TOURNAMENT_PERMISSIONS.CREATE]: 'creare tornei',
    [TOURNAMENT_PERMISSIONS.UPDATE]: 'modificare tornei',
    [TOURNAMENT_PERMISSIONS.DELETE]: 'eliminare tornei',
    [TOURNAMENT_PERMISSIONS.MANAGE_PHASES]: 'gestire le fasi del torneo',
    [TOURNAMENT_PERMISSIONS.MANAGE_TEAMS]: 'gestire le squadre',
    [TOURNAMENT_PERMISSIONS.MANAGE_MATCHES]: 'gestire le partite',
    [TOURNAMENT_PERMISSIONS.VIEW_ADMIN]: 'visualizzare le funzioni admin',
    [TOURNAMENT_PERMISSIONS.SUBMIT_RESULTS]: 'inserire risultati',
  };

  return descriptions[action] || 'eseguire questa azione';
}

/**
 * Wrapper for authorization check with error throwing
 * Use this in components/services that should throw on unauthorized access
 * @param {Function} authCheckFn - Authorization check function
 * @param {...any} args - Arguments to pass to auth check function
 * @throws {Error} If not authorized
 */
export async function requireAuthorization(authCheckFn, ...args) {
  const result = await authCheckFn(...args);

  if (!result.authorized) {
    throw new Error(result.reason || 'Non autorizzato');
  }

  return true;
}

/**
 * Get all tournament permissions for a user in a club
 * @param {string} userId
 * @param {string} clubId
 * @param {string} userRole
 * @returns {Promise<Array<string>>}
 */
export async function getUserTournamentPermissions(userId, clubId, userRole) {
  try {
    if (userRole === USER_ROLES.SUPER_ADMIN) {
      return Object.values(TOURNAMENT_PERMISSIONS);
    }

    const isAdmin = await isUserClubAdmin(userId, clubId);
    if (!isAdmin) {
      return []; // Regular users have no tournament admin permissions
    }

    // Club admins get all tournament permissions
    return Object.values(TOURNAMENT_PERMISSIONS);
  } catch (error) {
    console.error('Error getting user tournament permissions:', error);
    return [];
  }
}

export default {
  TOURNAMENT_PERMISSIONS,
  canCreateTournament,
  canManageTournament,
  canAdvancePhase,
  canSubmitMatchResults,
  canDeleteTournament,
  canViewAdminFeatures,
  requireAuthorization,
  getUserTournamentPermissions,
};
