/**
 * @fileoverview Tournament Formatting Utilities
 * Display formatting, date/time formatting, and data presentation helpers
 */

import {
  STATUS_NAMES,
  MATCH_STATUS_NAMES,
  KNOCKOUT_ROUND_NAMES,
  GROUP_NAMES,
} from './tournamentConstants.js';

/**
 * Format tournament status for display
 * @param {string} status
 * @returns {string}
 */
export function formatTournamentStatus(status) {
  return STATUS_NAMES[status] || status;
}

/**
 * Format match status for display
 * @param {string} status
 * @returns {string}
 */
export function formatMatchStatus(status) {
  return MATCH_STATUS_NAMES[status] || status;
}

/**
 * Format knockout round for display
 * @param {string} round
 * @returns {string}
 */
export function formatKnockoutRound(round) {
  return KNOCKOUT_ROUND_NAMES[round] || round;
}

/**
 * Format group name for display
 * @param {string} groupId
 * @returns {string}
 */
export function formatGroupName(groupId) {
  return `Girone ${groupId}`;
}

/**
 * Format tournament format for display
 * @param {string} format
 * @returns {string}
 */
export function formatTournamentFormat(format) {
  const formatNames = {
    groups: 'Fase a Gironi',
    knockout: 'Eliminazione Diretta',
    groups_and_knockout: 'Gironi + Eliminazione',
  };
  return formatNames[format] || format;
}

/**
 * Format match score for display
 * @param {Object} score - {team1: number, team2: number}
 * @returns {string}
 */
export function formatMatchScore(score) {
  if (!score) return '-';
  return `${score.team1} - ${score.team2}`;
}

/**
 * Format team names for match display
 * @param {string} team1Name
 * @param {string} team2Name
 * @returns {string}
 */
export function formatMatchup(team1Name, team2Name) {
  return `${team1Name} vs ${team2Name}`;
}

/**
 * Format date for display (Italian format)
 * @param {Date | string | null} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '-';

  const d = date instanceof Date ? date : new Date(date);

  return d.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format date range for display (Italian format)
 * @param {Date | string | null} startDate
 * @param {Date | string | null} endDate
 * @returns {string}
 */
export function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return '-';
  if (!endDate) return formatDate(startDate);
  if (!startDate) return formatDate(endDate);

  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start === end) return start;
  return `${start} - ${end}`;
}

/**
 * Format date and time for display (Italian format)
 * @param {Date | string | null} date
 * @returns {string}
 */
export function formatDateTime(date) {
  if (!date) return '-';

  const d = date instanceof Date ? date : new Date(date);

  return d.toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format time only
 * @param {Date | string | null} date
 * @returns {string}
 */
export function formatTime(date) {
  if (!date) return '-';

  const d = date instanceof Date ? date : new Date(date);

  return d.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (es: "2 giorni fa")
 * @param {Date | string} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  if (!date) return '-';

  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Proprio ora';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minuto' : 'minuti'} fa`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'} fa`;

  return formatDate(d);
}

/**
 * Format player names as comma-separated list
 * @param {Array<{playerName: string}>} players
 * @returns {string}
 */
export function formatPlayersList(players) {
  if (!players || players.length === 0) return '-';
  return players.map((p) => p.playerName).join(', ');
}

/**
 * Format ranking display
 * @param {number | null} ranking
 * @returns {string}
 */
export function formatRanking(ranking) {
  if (ranking === null || ranking === undefined) return 'N/D';
  return `#${ranking}`;
}

/**
 * Format average ranking
 * @param {number | null} avgRanking
 * @returns {string}
 */
export function formatAverageRanking(avgRanking) {
  if (avgRanking === null || avgRanking === undefined) return 'N/D';
  return avgRanking.toFixed(1);
}

/**
 * Format points with decimals if needed
 * @param {number} points
 * @returns {string}
 */
export function formatPoints(points) {
  if (points === null || points === undefined) return '0';
  return Number.isInteger(points) ? points.toString() : points.toFixed(1);
}

/**
 * Format set/game difference with sign
 * @param {number} difference
 * @returns {string}
 */
export function formatDifference(difference) {
  if (difference > 0) return `+${difference}`;
  return difference.toString();
}

/**
 * Format win/loss record
 * @param {number} wins
 * @param {number} draws
 * @param {number} losses
 * @returns {string}
 */
export function formatRecord(wins, draws, losses) {
  if (draws > 0) {
    return `${wins}V-${draws}P-${losses}S`;
  }
  return `${wins}V-${losses}S`;
}

/**
 * Format percentage
 * @param {number} value
 * @param {number} total
 * @returns {string}
 */
export function formatPercentage(value, total) {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
}

/**
 * Format duration in minutes
 * @param {number | null} minutes
 * @returns {string}
 */
export function formatDuration(minutes) {
  if (!minutes) return '-';

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Format ordinal position (1° 2° 3° etc.)
 * @param {number} position
 * @returns {string}
 */
export function formatPosition(position) {
  return `${position}°`;
}

/**
 * Format team composition info
 * @param {string} participantType
 * @param {number} playersCount
 * @returns {string}
 */
export function formatTeamComposition(participantType, playersCount) {
  if (participantType === 'couples') {
    return 'Coppia';
  }
  return `Squadra (${playersCount} giocatori)`;
}

/**
 * Format tournament capacity
 * @param {number} current
 * @param {number} max
 * @returns {string}
 */
export function formatCapacity(current, max) {
  return `${current}/${max}`;
}

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format court number
 * @param {string | null} courtNumber
 * @returns {string}
 */
export function formatCourt(courtNumber) {
  if (!courtNumber) return '-';
  return `Campo ${courtNumber}`;
}

/**
 * Get status badge color class
 * @param {string} status
 * @returns {string}
 */
export function getStatusColorClass(status) {
  const colorMap = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    registration_open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    registration_closed: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    groups_generation: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    groups_phase: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    knockout_phase: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  return colorMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
}

/**
 * Get match status icon
 * @param {string} status
 * @returns {string}
 */
export function getMatchStatusIcon(status) {
  const iconMap = {
    scheduled: 'calendar',
    in_progress: 'play-circle',
    completed: 'check-circle',
    cancelled: 'x-circle',
  };

  return iconMap[status] || 'circle';
}

export default {
  formatTournamentStatus,
  formatMatchStatus,
  formatKnockoutRound,
  formatGroupName,
  formatTournamentFormat,
  formatMatchScore,
  formatMatchup,
  formatDate,
  formatDateRange,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatPlayersList,
  formatRanking,
  formatAverageRanking,
  formatPoints,
  formatDifference,
  formatRecord,
  formatPercentage,
  formatDuration,
  formatPosition,
  formatTeamComposition,
  formatCapacity,
  truncateText,
  formatCourt,
  getStatusColorClass,
  getMatchStatusIcon,
};
