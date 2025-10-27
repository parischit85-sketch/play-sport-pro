/**
 * @fileoverview Tournament Validation Utilities
 * Input validation, data sanitization, and business rules enforcement
 */

import {
  TOURNAMENT_LIMITS,
  PARTICIPANT_TYPE,
  POINTS_SYSTEM_TYPE,
  VALIDATION_MESSAGES,
  TOURNAMENT_STATUS,
} from './tournamentConstants.js';

/**
 * Validate tournament name
 * @param {string} name
 * @returns {{valid: boolean, error: string | null}}
 */
export function validateTournamentName(name) {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: VALIDATION_MESSAGES.TOURNAMENT_NAME_REQUIRED };
  }
  
  if (name.trim().length < 3) {
    return { valid: false, error: VALIDATION_MESSAGES.TOURNAMENT_NAME_TOO_SHORT };
  }
  
  if (name.trim().length > 100) {
    return { valid: false, error: VALIDATION_MESSAGES.TOURNAMENT_NAME_TOO_LONG };
  }
  
  return { valid: true, error: null };
}

/**
 * Validate groups configuration
 * @param {number} numberOfGroups
 * @param {number} teamsPerGroup
 * @param {number} qualifiedPerGroup
 * @returns {{valid: boolean, error: string | null}}
 */
export function validateGroupsConfig(numberOfGroups, teamsPerGroup, qualifiedPerGroup) {
  if (numberOfGroups < TOURNAMENT_LIMITS.MIN_GROUPS || numberOfGroups > TOURNAMENT_LIMITS.MAX_GROUPS) {
    return { valid: false, error: VALIDATION_MESSAGES.INVALID_GROUPS_COUNT };
  }
  
  if (teamsPerGroup < TOURNAMENT_LIMITS.MIN_TEAMS_PER_GROUP || teamsPerGroup > TOURNAMENT_LIMITS.MAX_TEAMS_PER_GROUP) {
    return { valid: false, error: VALIDATION_MESSAGES.INVALID_TEAMS_PER_GROUP };
  }
  
  if (qualifiedPerGroup > teamsPerGroup || qualifiedPerGroup < TOURNAMENT_LIMITS.MIN_QUALIFIED_PER_GROUP) {
    return { valid: false, error: VALIDATION_MESSAGES.INVALID_QUALIFIED_COUNT };
  }
  
  // Note: we no longer require total qualified to be a power of 2.
  // BYEs will be inserted automatically in knockout creation if needed.
  
  return { valid: true, error: null };
}

/**
 * Validate team registration
 * @param {string} teamName
 * @param {Array} players
 * @param {string} participantType
 * @returns {{valid: boolean, error: string | null}}
 */
export function validateTeamRegistration(teamName, players, participantType) {
  if (!teamName || teamName.trim().length === 0) {
    return { valid: false, error: VALIDATION_MESSAGES.TEAM_NAME_REQUIRED };
  }
  
  const minPlayers = participantType === PARTICIPANT_TYPE.COUPLES 
    ? TOURNAMENT_LIMITS.MIN_PLAYERS_PER_COUPLE 
    : TOURNAMENT_LIMITS.MIN_PLAYERS_PER_TEAM;
    
  const maxPlayers = participantType === PARTICIPANT_TYPE.COUPLES 
    ? TOURNAMENT_LIMITS.MAX_PLAYERS_PER_COUPLE 
    : TOURNAMENT_LIMITS.MAX_PLAYERS_PER_TEAM;
  
  if (!players || players.length < minPlayers || players.length > maxPlayers) {
    return {
      valid: false,
      error: `${VALIDATION_MESSAGES.INVALID_PLAYERS_COUNT} (richiesti: ${minPlayers}-${maxPlayers})`
    };
  }
  
  // Check for duplicate players
  const playerIds = players.map(p => p.playerId);
  const uniquePlayerIds = new Set(playerIds);
  if (playerIds.length !== uniquePlayerIds.size) {
    return { valid: false, error: 'Non puoi inserire lo stesso giocatore più volte' };
  }
  
  // Validate each player has required fields
  for (const player of players) {
    if (!player.playerId || !player.playerName) {
      return { valid: false, error: 'Informazioni giocatore incomplete' };
    }
  }
  
  return { valid: true, error: null };
}

/**
 * Validate match score
 * @param {Object} score
 * @returns {{valid: boolean, error: string | null}}
 */
export function validateMatchScore(score) {
  if (!score || typeof score.team1 !== 'number' || typeof score.team2 !== 'number') {
    return { valid: false, error: VALIDATION_MESSAGES.INVALID_SCORE };
  }
  
  if (score.team1 < 0 || score.team2 < 0) {
    return { valid: false, error: 'Il punteggio non può essere negativo' };
  }
  
  if (score.team1 === score.team2) {
    return { valid: false, error: 'Il punteggio non può essere un pareggio' };
  }
  
  return { valid: true, error: null };
}

/**
 * Validate points system configuration
 * @param {Object} pointsSystem
 * @returns {{valid: boolean, error: string | null}}
 */
export function validatePointsSystem(pointsSystem) {
  if (!pointsSystem || !pointsSystem.type) {
    return { valid: false, error: 'Sistema punti non valido' };
  }
  
  if (pointsSystem.type === POINTS_SYSTEM_TYPE.STANDARD) {
    if (typeof pointsSystem.win !== 'number' || 
        typeof pointsSystem.draw !== 'number' || 
        typeof pointsSystem.loss !== 'number') {
      return { valid: false, error: 'Configurazione punti standard non valida' };
    }
  } else if (pointsSystem.type === POINTS_SYSTEM_TYPE.RANKING_BASED) {
    if (typeof pointsSystem.baseWin !== 'number' || 
        typeof pointsSystem.baseDraw !== 'number' || 
        typeof pointsSystem.baseLoss !== 'number' ||
        !pointsSystem.multipliers) {
      return { valid: false, error: 'Configurazione punti ranking-based non valida' };
    }
  } else {
    return { valid: false, error: 'Tipo sistema punti non riconosciuto' };
  }
  
  return { valid: true, error: null };
}

/**
 * Validate tournament status transition
 * @param {string} currentStatus
 * @param {string} newStatus
 * @returns {{valid: boolean, error: string | null}}
 */
export function validateStatusTransition(currentStatus, newStatus) {
  const allowedTransitions = {
    [TOURNAMENT_STATUS.DRAFT]: [
      TOURNAMENT_STATUS.REGISTRATION_OPEN,
      TOURNAMENT_STATUS.CANCELLED
    ],
    [TOURNAMENT_STATUS.REGISTRATION_OPEN]: [
      TOURNAMENT_STATUS.REGISTRATION_CLOSED,
      TOURNAMENT_STATUS.CANCELLED
    ],
    [TOURNAMENT_STATUS.REGISTRATION_CLOSED]: [
      TOURNAMENT_STATUS.GROUPS_GENERATION,
      TOURNAMENT_STATUS.REGISTRATION_OPEN,
      TOURNAMENT_STATUS.CANCELLED
    ],
    [TOURNAMENT_STATUS.GROUPS_GENERATION]: [
      TOURNAMENT_STATUS.GROUPS_PHASE,
      TOURNAMENT_STATUS.CANCELLED
    ],
    [TOURNAMENT_STATUS.GROUPS_PHASE]: [
      TOURNAMENT_STATUS.KNOCKOUT_PHASE,
      TOURNAMENT_STATUS.CANCELLED
    ],
    [TOURNAMENT_STATUS.KNOCKOUT_PHASE]: [
      TOURNAMENT_STATUS.COMPLETED,
      TOURNAMENT_STATUS.CANCELLED
    ],
    [TOURNAMENT_STATUS.COMPLETED]: [],
    [TOURNAMENT_STATUS.CANCELLED]: []
  };
  
  const allowed = allowedTransitions[currentStatus] || [];
  
  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      error: `Transizione non consentita da ${currentStatus} a ${newStatus}`
    };
  }
  
  return { valid: true, error: null };
}

/**
 * Check if tournament can start groups phase
 * @param {Object} tournament
 * @returns {{valid: boolean, error: string | null}}
 */
export function canStartGroupsPhase(tournament) {
  if (!tournament) {
    return { valid: false, error: VALIDATION_MESSAGES.TOURNAMENT_NOT_FOUND };
  }
  
  const minTeams = tournament.configuration.numberOfGroups * tournament.configuration.teamsPerGroup;
  
  if (tournament.registration.currentTeamsCount < minTeams) {
    return {
      valid: false,
      error: `Numero di squadre insufficiente (${tournament.registration.currentTeamsCount}/${minTeams})`
    };
  }
  
  if (tournament.status !== TOURNAMENT_STATUS.REGISTRATION_CLOSED) {
    return { valid: false, error: 'Le iscrizioni devono essere chiuse' };
  }
  
  return { valid: true, error: null };
}

/**
 * Check if tournament can start knockout phase
 * @param {Object} tournament
 * @param {number} completedGroupMatches
 * @param {number} totalGroupMatches
 * @returns {{valid: boolean, error: string | null}}
 */
export function canStartKnockoutPhase(tournament, completedGroupMatches, totalGroupMatches) {
  if (!tournament) {
    return { valid: false, error: VALIDATION_MESSAGES.TOURNAMENT_NOT_FOUND };
  }
  
  if (tournament.status !== TOURNAMENT_STATUS.GROUPS_PHASE) {
    return { valid: false, error: 'La fase a gironi deve essere completata' };
  }
  
  if (completedGroupMatches < totalGroupMatches) {
    return {
      valid: false,
      error: `Partite da completare: ${totalGroupMatches - completedGroupMatches}`
    };
  }
  
  return { valid: true, error: null };
}

/**
 * Utility: Check if number is power of 2
 * @param {number} n
 * @returns {boolean}
 */
function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

/**
 * Sanitize tournament name
 * @param {string} name
 * @returns {string}
 */
export function sanitizeTournamentName(name) {
  return name.trim().replace(/\s+/g, ' ');
}

/**
 * Sanitize team name
 * @param {string} name
 * @returns {string}
 */
export function sanitizeTeamName(name) {
  return name.trim().replace(/\s+/g, ' ');
}

/**
 * Check if registration is open
 * @param {Object} tournament
 * @returns {boolean}
 */
export function isRegistrationOpen(tournament) {
  if (!tournament) return false;
  
  const now = new Date();
  const { registration, status } = tournament;
  
  // Status must be registration_open
  if (status !== TOURNAMENT_STATUS.REGISTRATION_OPEN) {
    return false;
  }
  
  // Check date constraints if set
  if (registration.opensAt && now < new Date(registration.opensAt)) {
    return false;
  }
  
  if (registration.closesAt && now > new Date(registration.closesAt)) {
    return false;
  }
  
  // Check if full
  if (registration.currentTeamsCount >= tournament.configuration.maxTeamsAllowed) {
    return false;
  }
  
  return true;
}

export default {
  validateTournamentName,
  validateGroupsConfig,
  validateTeamRegistration,
  validateMatchScore,
  validatePointsSystem,
  validateStatusTransition,
  canStartGroupsPhase,
  canStartKnockoutPhase,
  sanitizeTournamentName,
  sanitizeTeamName,
  isRegistrationOpen,
};
