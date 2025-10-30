/**
 * @fileoverview Team Ranking Utilities
 * Centralized functions for calculating team average rankings
 */

/**
 * Calculate the average ranking of a team
 * @param {Object} team - Team object with players array
 * @param {number} [fallbackRating=1500] - Default rating for players without ranking
 * @returns {number} Average ranking of the team
 */
export function calculateTeamAverageRanking(team, fallbackRating = 1500) {
  if (!team) return fallbackRating;

  const players = Array.isArray(team.players) ? team.players : [];

  if (players.length === 0) return fallbackRating;

  // Extract rankings, using fallback for missing values
  const ratings = players
    .map((p) => {
      // Handle different player object structures
      const ranking = p?.ranking ?? p?.rating ?? p?.calculatedRating;
      return typeof ranking === 'number' ? Number(ranking) : fallbackRating;
    })
    .slice(0, 2); // Only first 2 players for doubles

  // Ensure we have exactly 2 ratings (pad with fallback if needed)
  while (ratings.length < 2) {
    ratings.push(fallbackRating);
  }

  // Calculate average
  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

  return Math.round(average); // Return rounded value for consistency
}

/**
 * Calculate the average ranking from a list of player IDs
 * @param {string[]} playerIds - Array of player IDs
 * @param {Object} playersMap - Map of playerId -> player object
 * @param {number} [fallbackRating=1500] - Default rating for players without ranking
 * @returns {number} Average ranking
 */
export function calculateAverageRankingFromIds(playerIds, playersMap, fallbackRating = 1500) {
  if (!Array.isArray(playerIds) || playerIds.length === 0) return fallbackRating;

  const ratings = playerIds
    .slice(0, 2) // Only first 2 players
    .map((playerId) => {
      const player = playersMap?.[playerId];
      if (!player) return fallbackRating;

      const ranking = player.ranking ?? player.rating ?? player.calculatedRating;
      return typeof ranking === 'number' ? Number(ranking) : fallbackRating;
    });

  // Ensure we have exactly 2 ratings
  while (ratings.length < 2) {
    ratings.push(fallbackRating);
  }

  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

  return Math.round(average);
}

/**
 * Get team ranking with detailed logging for debugging
 * @param {Object} team - Team object
 * @param {number} [fallbackRating=1500] - Default rating
 * @param {boolean} [debug=false] - Enable debug logging
 * @returns {number} Average ranking
 */
export function getTeamRankingWithDebug(team, fallbackRating = 1500, debug = false) {
  const result = calculateTeamAverageRanking(team, fallbackRating);

  if (debug) {
    // Debug logging removed for production
  }

  return result;
}

export default {
  calculateTeamAverageRanking,
  calculateAverageRankingFromIds,
  getTeamRankingWithDebug,
};
