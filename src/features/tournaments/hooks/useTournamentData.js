import { useState, useEffect, useCallback } from 'react';
import { db } from '../../../services/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

/**
 * Hook for loading tournament standings and matches data
 * Provides real-time updates via Firestore listeners
 *
 * @param {string} clubId - Club identifier
 * @param {string} tournamentId - Tournament identifier
 * @returns {Object} Tournament data with loading/error states
 *
 * @example
 * const { standings, matches, loading, error } = useTournamentData(clubId, tournamentId);
 *
 * Data structure returned:
 * {
 *   standings: [
 *     { groupId: 'A', teams: [...] },
 *     { groupId: 'B', teams: [...] },
 *     ...
 *   ],
 *   matches: [
 *     { groupId: 'A', matches: [...] },
 *     { groupId: 'B', matches: [...] },
 *     ...
 *   ],
 *   loading: boolean,
 *   error: string | null,
 *   teamCount: number,
 *   matchCount: number,
 *   groups: Array<string>, // ['A', 'B', 'C', ...]
 *   lastUpdated: Date,
 * }
 */
export const useTournamentData = (clubId, tournamentId) => {
  const [standings, setStandings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load standings data with real-time updates
  useEffect(() => {
    if (!clubId || !tournamentId) {
      setError('Missing clubId or tournamentId');
      setLoading(false);
      return;
    }

    try {
      // Query standings collection
      const standingsRef = collection(db, 'clubs', clubId, 'tournaments', tournamentId, 'standings');
      const standingsQuery = query(standingsRef);

      // Set up real-time listener
      const unsubscribeStandings = onSnapshot(
        standingsQuery,
        (snapshot) => {
          const data = [];
          snapshot.forEach((doc) => {
            data.push({
              id: doc.id,
              ...doc.data(),
            });
          });

          // Sort by groupId (A, B, C, ...)
          data.sort((a, b) => (a.groupId || '').localeCompare(b.groupId || ''));

          setStandings(data);
          setLastUpdated(new Date());
          setError(null);
        },
        (err) => {
          console.error('Error loading standings:', err);
          setError(`Failed to load standings: ${err.message}`);
          setLoading(false);
        }
      );

      return () => unsubscribeStandings();
    } catch (err) {
      console.error('Standings listener error:', err);
      setError(`Standings listener error: ${err.message}`);
      setLoading(false);
    }
  }, [clubId, tournamentId]);

  // Load matches data with real-time updates
  useEffect(() => {
    if (!clubId || !tournamentId) {
      setError('Missing clubId or tournamentId');
      setLoading(false);
      return;
    }

    try {
      // Query matches collection
      const matchesRef = collection(db, 'clubs', clubId, 'tournaments', tournamentId, 'matches');
      const matchesQuery = query(matchesRef);

      // Set up real-time listener
      const unsubscribeMatches = onSnapshot(
        matchesQuery,
        (snapshot) => {
          const data = [];
          snapshot.forEach((doc) => {
            data.push({
              id: doc.id,
              ...doc.data(),
            });
          });

          // Sort by groupId and timestamp
          data.sort((a, b) => {
            const groupCompare = (a.groupId || '').localeCompare(b.groupId || '');
            if (groupCompare !== 0) return groupCompare;
            return (a.startTime || 0) - (b.startTime || 0);
          });

          setMatches(data);
          setLastUpdated(new Date());
          setError(null);
          setLoading(false);
        },
        (err) => {
          console.error('Error loading matches:', err);
          setError(`Failed to load matches: ${err.message}`);
          setLoading(false);
        }
      );

      return () => unsubscribeMatches();
    } catch (err) {
      console.error('Matches listener error:', err);
      setError(`Matches listener error: ${err.message}`);
      setLoading(false);
    }
  }, [clubId, tournamentId]);

  // ============ COMPUTED VALUES ============

  // Get all unique groups
  const groups = [...new Set([
    ...standings.map(s => s.groupId || 'Unknown'),
    ...matches.map(m => m.groupId || 'Unknown'),
  ])].sort();

  // Count total teams (from standings)
  const teamCount = standings.reduce((sum, group) => {
    return sum + (group.teams?.length || 0);
  }, 0);

  // Count total matches
  const matchCount = matches.length;

  // Get standings for specific group
  const getGroupStandings = useCallback((groupId) => {
    const groupData = standings.find(s => s.groupId === groupId);
    return groupData?.teams || [];
  }, [standings]);

  // Get matches for specific group
  const getGroupMatches = useCallback((groupId) => {
    return matches.filter(m => m.groupId === groupId);
  }, [matches]);

  // Get standings and matches for specific group (combined)
  const getGroupData = useCallback((groupId) => {
    return {
      standings: getGroupStandings(groupId),
      matches: getGroupMatches(groupId),
    };
  }, [getGroupStandings, getGroupMatches]);

  // Calculate group statistics
  const getGroupStats = useCallback((groupId) => {
    const groupMatches = getGroupMatches(groupId);
    const groupStandings = getGroupStandings(groupId);

    return {
      groupId,
      teamCount: groupStandings.length,
      matchCount: groupMatches.length,
      totalPoints: groupStandings.reduce((sum, team) => sum + (team.points || 0), 0),
      playedMatches: groupMatches.filter(m => m.status === 'completed').length,
      pendingMatches: groupMatches.filter(m => m.status === 'pending').length,
      liveMatches: groupMatches.filter(m => m.status === 'live').length,
    };
  }, [getGroupMatches, getGroupStandings]);

  // ============ RETURN OBJECT ============

  return {
    // Raw data
    standings,
    matches,

    // Computed
    groups,
    teamCount,
    matchCount,

    // State
    loading,
    error,
    lastUpdated,

    // Helper methods
    getGroupStandings,
    getGroupMatches,
    getGroupData,
    getGroupStats,

    // Data availability
    hasData: standings.length > 0 || matches.length > 0,
    hasError: error !== null,
  };
};

/**
 * Helper hook to get standings for a specific group with caching
 * Use this if you only need one group's data
 *
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} groupId
 * @returns {Object} Group standings data
 */
export const useGroupStandings = (clubId, tournamentId, groupId) => {
  const { standings, loading, error } = useTournamentData(clubId, tournamentId);

  const groupStandings = standings.find(s => s.groupId === groupId) || {
    groupId,
    teams: [],
  };

  return {
    standings: groupStandings.teams || [],
    loading,
    error,
    isEmpty: !groupStandings.teams || groupStandings.teams.length === 0,
  };
};

/**
 * Helper hook to get matches for a specific group with caching
 * Use this if you only need one group's matches
 *
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} groupId
 * @returns {Object} Group matches data
 */
export const useGroupMatches = (clubId, tournamentId, groupId) => {
  const { matches, loading, error } = useTournamentData(clubId, tournamentId);

  const groupMatches = matches.filter(m => m.groupId === groupId);

  return {
    matches: groupMatches,
    loading,
    error,
    isEmpty: groupMatches.length === 0,
    liveCount: groupMatches.filter(m => m.status === 'live').length,
    completedCount: groupMatches.filter(m => m.status === 'completed').length,
  };
};

export default useTournamentData;
