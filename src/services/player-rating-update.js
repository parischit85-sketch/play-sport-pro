// FILE: src/services/player-rating-update.js
// Service for updating player ratings in Firebase after matches

import { db } from '@services/firebase.js';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { clearRatingCache } from './player-rating.js';

/**
 * Updates player ratings in Firebase after a match
 * @param {string} clubId - Club ID
 * @param {Array} players - Array of player objects with id, deltaA, deltaB
 * @param {string} matchId - Match ID for reference
 */
export async function updatePlayerRatingsAfterMatch(clubId, players, matchId) {
  if (!clubId || !players || players.length === 0) {
    throw new Error('Missing required parameters for rating update');
  }

  console.log('🎾 UPDATING PLAYER RATINGS:', { clubId, players, matchId });

  const updates = [];

  for (const player of players) {
    if (!player.id || player.delta === undefined || player.delta === null) {
      console.warn('Skipping player with invalid data:', player);
      continue;
    }

    try {
      // Reference to player document in club
      const playerRef = doc(db, 'clubs', clubId, 'players', player.id);
      
      // Get current player data
      const playerSnap = await getDoc(playerRef);
      
      if (!playerSnap.exists()) {
        console.warn(`Player ${player.id} not found in club ${clubId}, skipping rating update`);
        continue;
      }

      const playerData = playerSnap.data();
      const currentRating = playerData.rating || playerData.baseRating || 1000;
      const newRating = Math.max(0, currentRating + player.delta); // Ensure rating doesn't go below 0

      // Update player rating and stats
      const updateData = {
        rating: newRating,
        baseRating: newRating, // Keep baseRating in sync
        'stats.rpaPoints': newRating,
        lastMatchId: matchId,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(playerRef, updateData);

      console.log(`✅ Updated rating for ${player.id}: ${currentRating} → ${newRating} (${player.delta >= 0 ? '+' : ''}${player.delta})`);
      
      updates.push({
        playerId: player.id,
        oldRating: currentRating,
        newRating: newRating,
        delta: player.delta
      });

    } catch (error) {
      console.error(`❌ Error updating rating for player ${player.id}:`, error);
      // Don't throw, continue with other players
    }
  }

  // Clear rating cache so next queries get fresh data
  clearRatingCache();

  // Optional: Return a helper to refresh ClubContext data
  const refreshClubData = () => {
    // This can be used by calling code to trigger ClubContext refresh
    return { shouldRefreshPlayers: true };
  };

  console.log('🎯 RATING UPDATES COMPLETED:', updates);
  return { updates, refreshClubData };
}

/**
 * Calculate player deltas from match result
 * @param {Object} match - Match data with teamA, teamB, deltaA, deltaB
 * @returns {Array} Array of player objects with id and delta
 */
export function calculatePlayerDeltas(match) {
  const players = [];
  
  // Team A players get deltaA
  if (match.teamA && Array.isArray(match.teamA)) {
    match.teamA.forEach(playerId => {
      if (playerId) {
        players.push({
          id: playerId,
          delta: match.deltaA || 0
        });
      }
    });
  }

  // Team B players get deltaB  
  if (match.teamB && Array.isArray(match.teamB)) {
    match.teamB.forEach(playerId => {
      if (playerId) {
        players.push({
          id: playerId,
          delta: match.deltaB || 0
        });
      }
    });
  }

  return players;
}

export default {
  updatePlayerRatingsAfterMatch,
  calculatePlayerDeltas
};