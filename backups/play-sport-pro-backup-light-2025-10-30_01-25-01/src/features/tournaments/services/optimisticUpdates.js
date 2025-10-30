/**
 * Optimistic Updates Service
 * Provides immediate UI feedback while server operations are in progress
 */

/**
 * Calculate optimistic standings update when a match result is submitted
 * This provides instant UI feedback before the server confirms
 */
export function calculateOptimisticStandings(currentStandings, matchResult) {
  if (!currentStandings || !matchResult) return currentStandings;

  const { team1Id, team2Id, score } = matchResult;
  const { team1: score1, team2: score2 } = score;

  // Clone standings to avoid mutating original
  const updatedStandings = currentStandings.map((team) => {
    if (team.teamId !== team1Id && team.teamId !== team2Id) {
      return team;
    }

    const teamCopy = { ...team };

    // Determine result for this team
    let result = 'draw';
    let goalsFor = 0;
    let goalsAgainst = 0;

    if (team.teamId === team1Id) {
      goalsFor = score1;
      goalsAgainst = score2;
      if (score1 > score2) result = 'win';
      else if (score1 < score2) result = 'loss';
    } else {
      goalsFor = score2;
      goalsAgainst = score1;
      if (score2 > score1) result = 'win';
      else if (score2 < score1) result = 'loss';
    }

    // Update stats
    teamCopy.played = (teamCopy.played || 0) + 1;
    teamCopy.goalsFor = (teamCopy.goalsFor || 0) + goalsFor;
    teamCopy.goalsAgainst = (teamCopy.goalsAgainst || 0) + goalsAgainst;
    teamCopy.goalDifference = teamCopy.goalsFor - teamCopy.goalsAgainst;

    if (result === 'win') {
      teamCopy.won = (teamCopy.won || 0) + 1;
      teamCopy.points = (teamCopy.points || 0) + 3;
    } else if (result === 'draw') {
      teamCopy.drawn = (teamCopy.drawn || 0) + 1;
      teamCopy.points = (teamCopy.points || 0) + 1;
    } else {
      teamCopy.lost = (teamCopy.lost || 0) + 1;
    }

    return teamCopy;
  });

  // Re-sort by points, then goal difference, then goals scored
  return updatedStandings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
}

/**
 * Update match status optimistically
 */
export function updateMatchStatusOptimistic(matches, matchId, updates) {
  if (!matches || !matchId) return matches;

  return matches.map((match) => {
    if (match.id !== matchId) return match;

    return {
      ...match,
      ...updates,
      // Mark as optimistically updated
      _optimistic: true,
    };
  });
}

/**
 * Update bracket optimistically when a match completes
 */
export function updateBracketOptimistic(matches, completedMatch, winnerId) {
  if (!matches || !completedMatch) return matches;

  const updatedMatches = [...matches];

  // Find the match and mark as completed
  const matchIndex = updatedMatches.findIndex((m) => m.id === completedMatch.id);
  if (matchIndex !== -1) {
    updatedMatches[matchIndex] = {
      ...completedMatch,
      status: 'completed',
      winnerId,
      _optimistic: true,
    };
  }

  // If this is a knockout match, find next match and set the winner
  if (completedMatch.type === 'knockout' && completedMatch.nextMatchId) {
    const nextMatchIndex = updatedMatches.findIndex((m) => m.id === completedMatch.nextMatchId);
    if (nextMatchIndex !== -1) {
      const nextMatch = updatedMatches[nextMatchIndex];
      const winnerTeam =
        completedMatch.team1Id === winnerId ? completedMatch.team1Name : completedMatch.team2Name;

      // Determine which position in next match
      if (completedMatch.nextMatchPosition === 'team1') {
        updatedMatches[nextMatchIndex] = {
          ...nextMatch,
          team1Id: winnerId,
          team1Name: winnerTeam,
          _optimistic: true,
        };
      } else if (completedMatch.nextMatchPosition === 'team2') {
        updatedMatches[nextMatchIndex] = {
          ...nextMatch,
          team2Id: winnerId,
          team2Name: winnerTeam,
          _optimistic: true,
        };
      }
    }
  }

  return updatedMatches;
}

/**
 * Rollback optimistic updates if server operation fails
 */
export function rollbackOptimisticUpdate(currentData, originalData) {
  console.warn('⚠️ Rolling back optimistic update');
  return originalData;
}

/**
 * Mark data as synced (remove _optimistic flag)
 */
export function markAsSynced(data) {
  if (Array.isArray(data)) {
    return data.map((item) => {
      const { _optimistic, ...rest } = item;
      return rest;
    });
  }

  if (data && typeof data === 'object') {
    const { _optimistic, ...rest } = data;
    return rest;
  }

  return data;
}

/**
 * Check if data has optimistic updates pending
 */
export function hasOptimisticUpdates(data) {
  if (Array.isArray(data)) {
    return data.some((item) => item._optimistic === true);
  }

  return data?._optimistic === true;
}

/**
 * Create a snapshot for rollback
 */
export function createSnapshot(data) {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Optimistic update manager for complex operations
 */
export class OptimisticUpdateManager {
  constructor() {
    this.snapshots = new Map();
    this.pendingUpdates = new Map();
  }

  /**
   * Start an optimistic update
   */
  startUpdate(key, currentData, optimisticData) {
    // Save snapshot for rollback
    this.snapshots.set(key, createSnapshot(currentData));

    // Mark update as pending
    this.pendingUpdates.set(key, {
      startTime: Date.now(),
      data: optimisticData,
    });

    console.log(`🔵 [Optimistic] Started update: ${key}`);
    return optimisticData;
  }

  /**
   * Confirm update succeeded
   */
  confirmUpdate(key, serverData) {
    this.snapshots.delete(key);
    this.pendingUpdates.delete(key);
    console.log(`✅ [Optimistic] Confirmed update: ${key}`);
    return markAsSynced(serverData);
  }

  /**
   * Rollback update if failed
   */
  rollbackUpdate(key) {
    const snapshot = this.snapshots.get(key);
    this.snapshots.delete(key);
    this.pendingUpdates.delete(key);

    if (snapshot) {
      console.warn(`⚠️ [Optimistic] Rolled back update: ${key}`);
      return snapshot;
    }

    console.error(`❌ [Optimistic] No snapshot found for: ${key}`);
    return null;
  }

  /**
   * Get pending update
   */
  getPendingUpdate(key) {
    return this.pendingUpdates.get(key);
  }

  /**
   * Check if update is pending
   */
  isPending(key) {
    return this.pendingUpdates.has(key);
  }

  /**
   * Clear all pending updates
   */
  clear() {
    this.snapshots.clear();
    this.pendingUpdates.clear();
  }

  /**
   * Get pending update age in milliseconds
   */
  getPendingAge(key) {
    const pending = this.pendingUpdates.get(key);
    if (!pending) return null;
    return Date.now() - pending.startTime;
  }
}

/**
 * Global optimistic update manager instance
 */
export const optimisticManager = new OptimisticUpdateManager();
