/**
 * @fileoverview Tournament System Constants
 * All constants, enums, and default configurations
 */

// Tournament Status
export const TOURNAMENT_STATUS = {
  DRAFT: 'draft',
  REGISTRATION_OPEN: 'registration_open',
  REGISTRATION_CLOSED: 'registration_closed',
  GROUPS_GENERATION: 'groups_generation',
  GROUPS_PHASE: 'groups_phase',
  KNOCKOUT_PHASE: 'knockout_phase',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Tournament Format Types
export const TOURNAMENT_FORMAT = {
  GROUPS: 'groups',
  KNOCKOUT: 'knockout',
  GROUPS_AND_KNOCKOUT: 'groups_and_knockout',
  MATCHES_ONLY: 'matches_only',
};

// Participant Types
export const PARTICIPANT_TYPE = {
  COUPLES: 'couples',
  TEAMS: 'teams',
  MATCHES_ONLY: 'matches_only',
};

// Points System Types
export const POINTS_SYSTEM_TYPE = {
  STANDARD: 'standard',
  RANKING_BASED: 'ranking_based',
  TIE_BREAK: 'tie_break',
};

// Knockout Rounds
export const KNOCKOUT_ROUND = {
  ROUND_OF_16: 'round_of_16',
  QUARTER_FINALS: 'quarter_finals',
  SEMI_FINALS: 'semi_finals',
  FINALS: 'finals',
  THIRD_PLACE: 'third_place',
};

// Match Status
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Team Status
export const TEAM_STATUS = {
  ACTIVE: 'active',
  WITHDRAWN: 'withdrawn',
};

// Default Points Configuration
export const DEFAULT_STANDARD_POINTS = {
  type: POINTS_SYSTEM_TYPE.STANDARD,
  win: 3,
  draw: 1,
  loss: 0,
};

export const DEFAULT_RANKING_BASED_POINTS = {
  type: POINTS_SYSTEM_TYPE.RANKING_BASED,
  baseWin: 3,
  baseDraw: 1,
  baseLoss: 0,
  multipliers: {
    upsetBonus: 1.5,
    expectedWin: 1.0,
    rankingDifferenceThreshold: 10,
  },
};

export const DEFAULT_TIE_BREAK_POINTS = {
  type: POINTS_SYSTEM_TYPE.TIE_BREAK,
  win: 3,
  draw: 1,
  loss: 0,
  tieBreakWin: 2,
  tieBreakLoss: 1,
};

// Tournament Configuration Limits
export const TOURNAMENT_LIMITS = {
  MIN_GROUPS: 2,
  MAX_GROUPS: 8,
  MIN_TEAMS_PER_GROUP: 3,
  MAX_TEAMS_PER_GROUP: 8,
  MIN_QUALIFIED_PER_GROUP: 1,
  MAX_QUALIFIED_PER_GROUP: 4,
  MIN_PLAYERS_PER_COUPLE: 2,
  MAX_PLAYERS_PER_COUPLE: 2,
  MIN_PLAYERS_PER_TEAM: 2,
  MAX_PLAYERS_PER_TEAM: 6,
};

// Group Names (Italian)
export const GROUP_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// Knockout Round Names (Italian)
export const KNOCKOUT_ROUND_NAMES = {
  [KNOCKOUT_ROUND.ROUND_OF_16]: 'Ottavi di Finale',
  [KNOCKOUT_ROUND.QUARTER_FINALS]: 'Quarti di Finale',
  [KNOCKOUT_ROUND.SEMI_FINALS]: 'Semifinali',
  [KNOCKOUT_ROUND.FINALS]: 'Finale',
  [KNOCKOUT_ROUND.THIRD_PLACE]: 'Finale 3°/4° Posto',
};

// Status Display Names (Italian)
export const STATUS_NAMES = {
  [TOURNAMENT_STATUS.DRAFT]: 'Bozza',
  [TOURNAMENT_STATUS.REGISTRATION_OPEN]: 'Iscrizioni Aperte',
  [TOURNAMENT_STATUS.REGISTRATION_CLOSED]: 'Iscrizioni Chiuse',
  [TOURNAMENT_STATUS.GROUPS_GENERATION]: 'Generazione Gironi',
  [TOURNAMENT_STATUS.GROUPS_PHASE]: 'Fase a Gironi',
  [TOURNAMENT_STATUS.KNOCKOUT_PHASE]: 'Fase a Eliminazione',
  [TOURNAMENT_STATUS.COMPLETED]: 'Completato',
  [TOURNAMENT_STATUS.CANCELLED]: 'Annullato',
};

// Match Status Display Names (Italian)
export const MATCH_STATUS_NAMES = {
  [MATCH_STATUS.SCHEDULED]: 'Programmato',
  [MATCH_STATUS.IN_PROGRESS]: 'In Corso',
  [MATCH_STATUS.COMPLETED]: 'Completato',
  [MATCH_STATUS.CANCELLED]: 'Annullato',
};

// Status Colors for UI
export const STATUS_COLORS = {
  [TOURNAMENT_STATUS.DRAFT]: 'gray',
  [TOURNAMENT_STATUS.REGISTRATION_OPEN]: 'green',
  [TOURNAMENT_STATUS.REGISTRATION_CLOSED]: 'orange',
  [TOURNAMENT_STATUS.GROUPS_GENERATION]: 'blue',
  [TOURNAMENT_STATUS.GROUPS_PHASE]: 'blue',
  [TOURNAMENT_STATUS.KNOCKOUT_PHASE]: 'purple',
  [TOURNAMENT_STATUS.COMPLETED]: 'green',
  [TOURNAMENT_STATUS.CANCELLED]: 'red',
};

// Firestore Collection Paths
export const COLLECTIONS = {
  TOURNAMENTS: 'tournaments',
  TEAMS: 'teams',
  MATCHES: 'matches',
  STANDINGS: 'standings',
  // Championship collections
  CHAMPIONSHIP: 'championship',
  CHAMPIONSHIP_LEADERBOARD: 'leaderboard',
  CHAMPIONSHIP_APPLIED: 'applied',
};

// Default Tournament Configuration
export const DEFAULT_TOURNAMENT_CONFIG = {
  numberOfGroups: 4,
  teamsPerGroup: 4,
  qualifiedPerGroup: 2,
  includeThirdPlaceMatch: true,
  automaticGroupsGeneration: true,
  minTeamsRequired: 8,
  maxTeamsAllowed: 32,
  // Configurazione punti per il campionato (draft)
  championshipPoints: {
    rpaMultiplier: 1,
    // Punti per piazzamento girone: posizione -> punti
    groupPlacementPoints: {
      1: 100,
      2: 60,
      3: 40,
      4: 20,
    },
    // Punti per avanzamento in eliminazione diretta (per vittoria nel round)
    knockoutProgressPoints: {
      // Nota: usare le chiavi del KNOCKOUT_ROUND
      [KNOCKOUT_ROUND.ROUND_OF_16]: 10,
      [KNOCKOUT_ROUND.QUARTER_FINALS]: 20,
      [KNOCKOUT_ROUND.SEMI_FINALS]: 40,
      [KNOCKOUT_ROUND.FINALS]: 80,
      [KNOCKOUT_ROUND.THIRD_PLACE]: 15,
    },
  },
};

// Validation Messages (Italian)
export const VALIDATION_MESSAGES = {
  TOURNAMENT_NAME_REQUIRED: 'Il nome del torneo è obbligatorio',
  TOURNAMENT_NAME_TOO_SHORT: 'Il nome deve essere di almeno 3 caratteri',
  TOURNAMENT_NAME_TOO_LONG: 'Il nome deve essere massimo 100 caratteri',
  INVALID_GROUPS_COUNT: `Il numero di gironi deve essere tra ${TOURNAMENT_LIMITS.MIN_GROUPS} e ${TOURNAMENT_LIMITS.MAX_GROUPS}`,
  INVALID_TEAMS_PER_GROUP: `Il numero di squadre per girone deve essere tra ${TOURNAMENT_LIMITS.MIN_TEAMS_PER_GROUP} e ${TOURNAMENT_LIMITS.MAX_TEAMS_PER_GROUP}`,
  INVALID_QUALIFIED_COUNT:
    'Il numero di qualificati non può superare il numero di squadre per girone',
  TEAM_NAME_REQUIRED: 'Il nome della squadra è obbligatorio',
  INVALID_PLAYERS_COUNT: 'Numero di giocatori non valido',
  PLAYER_ALREADY_REGISTERED: 'Uno o più giocatori sono già registrati in questo torneo',
  REGISTRATION_CLOSED: 'Le iscrizioni sono chiuse',
  TOURNAMENT_FULL: 'Il torneo ha raggiunto il numero massimo di partecipanti',
  INVALID_SCORE: 'Punteggio non valido',
  MATCH_NOT_FOUND: 'Partita non trovata',
  TEAM_NOT_FOUND: 'Squadra non trovata',
  TOURNAMENT_NOT_FOUND: 'Torneo non trovato',
};

// Sort Options for Standings
export const STANDINGS_SORT_CRITERIA = {
  POINTS: 'points',
  SET_DIFFERENCE: 'setsDifference',
  GAME_DIFFERENCE: 'gamesDifference',
  HEAD_TO_HEAD: 'headToHead',
};

// Export all as default for convenience
export default {
  TOURNAMENT_STATUS,
  TOURNAMENT_FORMAT,
  PARTICIPANT_TYPE,
  POINTS_SYSTEM_TYPE,
  KNOCKOUT_ROUND,
  MATCH_STATUS,
  TEAM_STATUS,
  DEFAULT_STANDARD_POINTS,
  DEFAULT_RANKING_BASED_POINTS,
  DEFAULT_TIE_BREAK_POINTS,
  TOURNAMENT_LIMITS,
  GROUP_NAMES,
  KNOCKOUT_ROUND_NAMES,
  STATUS_NAMES,
  MATCH_STATUS_NAMES,
  STATUS_COLORS,
  COLLECTIONS,
  DEFAULT_TOURNAMENT_CONFIG,
  VALIDATION_MESSAGES,
  STANDINGS_SORT_CRITERIA,
};
