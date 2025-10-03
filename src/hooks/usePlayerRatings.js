/**
 * Hook for real-time player ratings lookup
 */

import { useState, useEffect } from 'react';
import { getPlayersCurrentRatings } from '../services/player-rating.js';
import { DEFAULT_RATING } from '@lib/ids.js';

/**
 * Hook to get real-time ratings for selected players
 */
export const usePlayerRatings = (clubId, playerIds) => {
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        // Filter out empty player IDs
        const validPlayerIds = playerIds.filter(id => id && id.trim());
        
        if (!clubId || validPlayerIds.length === 0) {
          setRatings({});
          setLoading(false);
          return;
        }

        console.log('🔄 Fetching ratings for players:', validPlayerIds);
        setLoading(true);
        setError(null);

        const fetchedRatings = await getPlayersCurrentRatings(clubId, validPlayerIds);
        
        console.log('✅ Ratings updated:', fetchedRatings);
        setRatings(fetchedRatings);
      } catch (err) {
        console.error('❌ Error in usePlayerRatings:', err);
        setError(err);
        // Set default ratings on error
        const defaultRatings = {};
        playerIds.forEach(id => {
          if (id) defaultRatings[id] = DEFAULT_RATING;
        });
        setRatings(defaultRatings);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [clubId, playerIds.join(',')]); // Re-run when clubId or player selection changes

  /**
   * Get rating for specific player with fallback
   */
  const getRating = (playerId) => {
    if (!playerId) return null;
    return ratings[playerId] ?? DEFAULT_RATING;
  };

  /**
   * Get all ratings with fallbacks
   */
  const getAllRatings = () => {
    const result = {};
    playerIds.forEach(id => {
      if (id) {
        result[id] = ratings[id] ?? DEFAULT_RATING;
      }
    });
    return result;
  };

  /**
   * Force refresh ratings
   */
  const refreshRatings = async () => {
    const validPlayerIds = playerIds.filter(id => id && id.trim());
    
    if (!clubId || validPlayerIds.length === 0) return;

    try {
      setLoading(true);
      const freshRatings = await getPlayersCurrentRatings(clubId, validPlayerIds);
      setRatings(freshRatings);
    } catch (err) {
      console.error('❌ Error refreshing ratings:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    ratings,
    loading,
    error,
    getRating,
    getAllRatings,
    refreshRatings
  };
};

export default usePlayerRatings;