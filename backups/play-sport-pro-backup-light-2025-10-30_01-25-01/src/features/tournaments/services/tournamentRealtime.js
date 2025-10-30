/**
 * @fileoverview Tournament Real-time Updates Service
 * Provides live data subscriptions using Firestore onSnapshot
 */

import { db } from '../../../services/firebase.js';
import { collection, doc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { COLLECTIONS, KNOCKOUT_ROUND_NAMES } from '../utils/tournamentConstants.js';

/**
 * Subscribe to tournament updates
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Function} callback - Called with tournament data on updates
 * @returns {Function} unsubscribe function
 */
export function subscribeTournament(clubId, tournamentId, callback) {
  const tournamentRef = doc(db, 'clubs', clubId, COLLECTIONS.TOURNAMENTS, tournamentId);

  const unsubscribe = onSnapshot(
    tournamentRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({
          success: true,
          tournament: {
            id: snapshot.id,
            ...snapshot.data(),
          },
        });
      } else {
        callback({
          success: false,
          error: 'Torneo non trovato',
        });
      }
    },
    (error) => {
      console.error('Error in tournament subscription:', error);
      callback({
        success: false,
        error: error.message,
      });
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to standings updates for a specific group
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} groupId
 * @param {Function} callback - Called with standings array on updates
 * @returns {Function} unsubscribe function
 */
export function subscribeGroupStandings(clubId, tournamentId, groupId, callback) {
  const standingsRef = doc(
    db,
    'clubs',
    clubId,
    COLLECTIONS.TOURNAMENTS,
    tournamentId,
    COLLECTIONS.STANDINGS,
    groupId
  );

  const unsubscribe = onSnapshot(
    standingsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback({
          success: true,
          standings: data.teams || [],
          lastUpdated: data.lastUpdated,
        });
      } else {
        callback({
          success: true,
          standings: [],
        });
      }
    },
    (error) => {
      console.error('Error in standings subscription:', error);
      callback({
        success: false,
        error: error.message,
      });
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to all standings for a tournament
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Function} callback - Called with all standings on updates
 * @returns {Function} unsubscribe function
 */
export function subscribeAllStandings(clubId, tournamentId, callback) {
  const standingsCollectionRef = collection(
    db,
    'clubs',
    clubId,
    COLLECTIONS.TOURNAMENTS,
    tournamentId,
    COLLECTIONS.STANDINGS
  );

  const unsubscribe = onSnapshot(
    standingsCollectionRef,
    (snapshot) => {
      const allStandings = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        allStandings.push({
          groupId: doc.id,
          teams: data.teams || [],
          lastUpdated: data.lastUpdated,
        });
      });

      callback({
        success: true,
        standings: allStandings,
      });
    },
    (error) => {
      console.error('Error in all standings subscription:', error);
      callback({
        success: false,
        error: error.message,
      });
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to matches updates
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Object} filters - Optional filters (type, groupId, round, status)
 * @param {Function} callback - Called with matches array on updates
 * @returns {Function} unsubscribe function
 */
export function subscribeMatches(clubId, tournamentId, filters = {}, callback) {
  const matchesRef = collection(
    db,
    'clubs',
    clubId,
    COLLECTIONS.TOURNAMENTS,
    tournamentId,
    COLLECTIONS.MATCHES
  );

  let q = query(matchesRef);

  // Apply filters
  if (filters.type) {
    q = query(q, where('type', '==', filters.type));
  }

  if (filters.groupId) {
    q = query(q, where('groupId', '==', filters.groupId));
  }

  if (filters.round) {
    q = query(q, where('round', '==', filters.round));
  }

  if (filters.status) {
    q = query(q, where('status', '==', filters.status));
  }

  // Order by scheduled date if available
  if (filters.orderBy === 'date') {
    q = query(q, orderBy('scheduledDate', 'asc'));
  }

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const matches = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Normalize a display round name if missing
        const roundName = data.roundName || KNOCKOUT_ROUND_NAMES[data.round] || undefined;
        matches.push({
          id: doc.id,
          ...data,
          ...(roundName ? { roundName } : {}),
        });
      });

      callback({
        success: true,
        matches,
        count: matches.length,
      });
    },
    (error) => {
      console.error('Error in matches subscription:', error);
      callback({
        success: false,
        error: error.message,
      });
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to a single match updates
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {string} matchId
 * @param {Function} callback - Called with match data on updates
 * @returns {Function} unsubscribe function
 */
export function subscribeMatch(clubId, tournamentId, matchId, callback) {
  const matchRef = doc(
    db,
    'clubs',
    clubId,
    COLLECTIONS.TOURNAMENTS,
    tournamentId,
    COLLECTIONS.MATCHES,
    matchId
  );

  const unsubscribe = onSnapshot(
    matchRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({
          success: true,
          match: {
            id: snapshot.id,
            ...snapshot.data(),
          },
        });
      } else {
        callback({
          success: false,
          error: 'Partita non trovata',
        });
      }
    },
    (error) => {
      console.error('Error in match subscription:', error);
      callback({
        success: false,
        error: error.message,
      });
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to team registrations
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Function} callback - Called with teams array on updates
 * @returns {Function} unsubscribe function
 */
export function subscribeTeams(clubId, tournamentId, callback) {
  const teamsRef = collection(
    db,
    'clubs',
    clubId,
    COLLECTIONS.TOURNAMENTS,
    tournamentId,
    COLLECTIONS.TEAMS
  );

  const unsubscribe = onSnapshot(
    teamsRef,
    (snapshot) => {
      const teams = [];
      snapshot.forEach((doc) => {
        teams.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      callback({
        success: true,
        teams,
        activeTeams: teams.filter((t) => t.status === 'active').length,
        pendingTeams: teams.filter((t) => t.status === 'pending').length,
      });
    },
    (error) => {
      console.error('Error in teams subscription:', error);
      callback({
        success: false,
        error: error.message,
      });
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to knockout bracket updates
 * @param {string} clubId
 * @param {string} tournamentId
 * @param {Function} callback - Called with knockout matches on updates
 * @returns {Function} unsubscribe function
 */
export function subscribeKnockoutBracket(clubId, tournamentId, callback) {
  return subscribeMatches(
    clubId,
    tournamentId,
    {
      type: 'knockout',
      orderBy: 'date',
    },
    (result) => {
      if (result.success) {
        // Group matches by round for bracket display (Italian labels)
        const matchesByRound = result.matches.reduce((acc, match) => {
          const roundName = match.roundName || KNOCKOUT_ROUND_NAMES[match.round] || 'Sconosciuto';
          if (!acc[roundName]) {
            acc[roundName] = [];
          }
          acc[roundName].push(match);
          return acc;
        }, {});

        callback({
          success: true,
          bracket: matchesByRound,
          matches: result.matches,
          totalMatches: result.count,
          completedMatches: result.matches.filter((m) => m.status === 'completed').length,
        });
      } else {
        callback(result);
      }
    }
  );
}

/**
 * Helper to manage multiple subscriptions
 * @returns {Object} Subscription manager
 */
export function createSubscriptionManager() {
  const subscriptions = new Map();

  return {
    /**
     * Add a subscription
     * @param {string} key - Unique identifier for the subscription
     * @param {Function} unsubscribe - The unsubscribe function
     */
    add(key, unsubscribe) {
      // Unsubscribe existing if present
      if (subscriptions.has(key)) {
        subscriptions.get(key)();
      }
      subscriptions.set(key, unsubscribe);
    },

    /**
     * Remove a specific subscription
     * @param {string} key
     */
    remove(key) {
      if (subscriptions.has(key)) {
        subscriptions.get(key)();
        subscriptions.delete(key);
      }
    },

    /**
     * Unsubscribe from all
     */
    unsubscribeAll() {
      subscriptions.forEach((unsubscribe) => unsubscribe());
      subscriptions.clear();
    },

    /**
     * Get count of active subscriptions
     */
    count() {
      return subscriptions.size;
    },
  };
}

export default {
  subscribeTournament,
  subscribeGroupStandings,
  subscribeAllStandings,
  subscribeMatches,
  subscribeMatch,
  subscribeTeams,
  subscribeKnockoutBracket,
  createSubscriptionManager,
};
