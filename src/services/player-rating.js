/**
 * Service for real-time player rating lookup
 */

import { db } from './firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import { DEFAULT_RATING } from '@lib/ids.js';

/**
 * Get current rating for a specific player
 */
export const getPlayerCurrentRating = async (clubId, playerId) => {
  try {
    if (!clubId || !playerId) {
      console.warn('⚠️ getPlayerCurrentRating: Missing clubId or playerId');
      return DEFAULT_RATING;
    }

    const playerRef = doc(db, `clubs/${clubId}/players/${playerId}`);
    const playerSnap = await getDoc(playerRef);

    if (playerSnap.exists()) {
      const playerData = playerSnap.data();
      const rating = playerData.rating ?? DEFAULT_RATING;

      console.log(`🎾 Player ${playerId} current rating:`, rating);
      return rating;
    } else {
      console.warn(`⚠️ Player ${playerId} not found in club ${clubId}`);
      return DEFAULT_RATING;
    }
  } catch (error) {
    console.error('❌ Error fetching player rating:', error);
    return DEFAULT_RATING;
  }
};

/**
 * Get current ratings for multiple players
 */
export const getPlayersCurrentRatings = async (clubId, playerIds) => {
  try {
    if (!clubId || !Array.isArray(playerIds)) {
      console.warn('⚠️ getPlayersCurrentRatings: Invalid parameters');
      return {};
    }

    // Filter out empty/null player IDs
    const validPlayerIds = playerIds.filter((id) => id && id.trim());

    if (validPlayerIds.length === 0) {
      return {};
    }

    console.log(`🔍 Fetching ratings for ${validPlayerIds.length} players in club ${clubId}`);

    // Fetch all players in parallel
    const ratingPromises = validPlayerIds.map(async (playerId) => {
      const rating = await getPlayerCurrentRating(clubId, playerId);
      return { playerId, rating };
    });

    const results = await Promise.all(ratingPromises);

    // Convert to object map
    const ratingsMap = {};
    results.forEach(({ playerId, rating }) => {
      ratingsMap[playerId] = rating;
    });

    console.log('✅ Player ratings fetched:', ratingsMap);
    return ratingsMap;
  } catch (error) {
    console.error('❌ Error fetching players ratings:', error);
    return {};
  }
};

/**
 * Cache for recently fetched ratings to avoid redundant queries
 */
const ratingCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

/**
 * Get player rating with caching
 */
export const getPlayerRatingCached = async (clubId, playerId) => {
  const cacheKey = `${clubId}:${playerId}`;
  const cached = ratingCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`💾 Using cached rating for ${playerId}:`, cached.rating);
    return cached.rating;
  }

  const rating = await getPlayerCurrentRating(clubId, playerId);

  // Cache the result
  ratingCache.set(cacheKey, {
    rating,
    timestamp: Date.now(),
  });

  return rating;
};

/**
 * Clear rating cache (useful when ratings are updated)
 */
export const clearRatingCache = () => {
  ratingCache.clear();
  console.log('🗑️ Rating cache cleared');
};

export default {
  getPlayerCurrentRating,
  getPlayersCurrentRatings,
  getPlayerRatingCached,
  clearRatingCache,
};
