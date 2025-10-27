/**
 * Custom React Hook for Optimistic Updates
 * Provides immediate UI feedback with automatic rollback on errors
 */

import { useState, useCallback, useRef } from 'react';
import { optimisticManager, createSnapshot } from '../services/optimisticUpdates.js';

/**
 * Hook for managing optimistic updates with automatic rollback
 * 
 * @param {string} key - Unique key for this optimistic update
 * @param {number} timeout - Max time to wait for server confirmation (ms)
 * @returns {Object} - { execute, rollback, isPending, age }
 * 
 * @example
 * const { execute: submitResult, isPending, rollback } = useOptimisticUpdate('match-result');
 * 
 * const handleSubmit = async (matchData) => {
 *   await execute(
 *     // Current data
 *     standings,
 *     // Optimistic update
 *     calculateOptimisticStandings(standings, matchData),
 *     // Server operation
 *     () => recordMatchResult(clubId, tournamentId, matchData),
 *     // On success callback
 *     (serverData) => setStandings(serverData),
 *     // On error callback
 *     (error) => showError(error)
 *   );
 * };
 */
export function useOptimisticUpdate(key, timeout = 10000) {
  const [isPending, setIsPending] = useState(false);
  const [age, setAge] = useState(null);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  /**
   * Execute an optimistic update
   */
  const execute = useCallback(
    async (currentData, optimisticData, serverOperation, onSuccess, onError) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      try {
        setIsPending(true);
        setAge(0);

        // Start tracking age
        const startTime = Date.now();
        intervalRef.current = setInterval(() => {
          setAge(Date.now() - startTime);
        }, 100);

        // Apply optimistic update
        const updated = optimisticManager.startUpdate(key, currentData, optimisticData);

        // Immediately update UI
        if (onSuccess) {
          onSuccess(updated);
        }

        // Set timeout for rollback if server takes too long
        timeoutRef.current = setTimeout(() => {
          console.warn(`⚠️ [Optimistic] Timeout reached for: ${key}`);
          const rolledBack = optimisticManager.rollbackUpdate(key);
          if (rolledBack && onSuccess) {
            onSuccess(rolledBack);
          }
          if (onError) {
            onError(new Error('Operation timeout - rolled back'));
          }
          setIsPending(false);
          setAge(null);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }, timeout);

        // Execute server operation
        const serverResult = await serverOperation();

        // Clear timeout
        clearTimeout(timeoutRef.current);
        clearInterval(intervalRef.current);

        if (serverResult && serverResult.success !== false) {
          // Confirm update succeeded
          const confirmed = optimisticManager.confirmUpdate(key, serverResult.data || serverResult);
          if (onSuccess) {
            onSuccess(confirmed);
          }
        } else {
          // Rollback on server error
          const rolledBack = optimisticManager.rollbackUpdate(key);
          if (rolledBack && onSuccess) {
            onSuccess(rolledBack);
          }
          if (onError) {
            onError(serverResult?.error || new Error('Server operation failed'));
          }
        }
      } catch (error) {
        // Rollback on exception
        console.error(`❌ [Optimistic] Error in ${key}:`, error);
        clearTimeout(timeoutRef.current);
        clearInterval(intervalRef.current);

        const rolledBack = optimisticManager.rollbackUpdate(key);
        if (rolledBack && onSuccess) {
          onSuccess(rolledBack);
        }
        if (onError) {
          onError(error);
        }
      } finally {
        setIsPending(false);
        setAge(null);
      }
    },
    [key, timeout]
  );

  /**
   * Manually rollback an optimistic update
   */
  const rollback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    const rolledBack = optimisticManager.rollbackUpdate(key);
    setIsPending(false);
    setAge(null);
    return rolledBack;
  }, [key]);

  return {
    execute,
    rollback,
    isPending,
    age, // Time since optimistic update started (ms)
  };
}

/**
 * Hook for simple optimistic state with automatic rollback
 * Simpler API for common use cases
 * 
 * @example
 * const [standings, setStandings, { save, isPending }] = useOptimisticState(initialStandings);
 * 
 * const handleUpdate = async (newData) => {
 *   await save(
 *     newData, // Optimistic data
 *     () => api.saveStandings(newData) // Server operation
 *   );
 * };
 */
export function useOptimisticState(initialValue, key = 'default') {
  const [state, setState] = useState(initialValue);
  const [error, setError] = useState(null);
  const snapshotRef = useRef(initialValue);
  const { execute, isPending, age } = useOptimisticUpdate(key);

  /**
   * Save with optimistic update
   */
  const save = useCallback(
    async (optimisticValue, serverOperation) => {
      snapshotRef.current = createSnapshot(state);

      await execute(
        state,
        optimisticValue,
        serverOperation,
        (data) => {
          setState(data);
          setError(null);
        },
        (err) => {
          setState(snapshotRef.current);
          setError(err);
          console.error('Optimistic update failed:', err);
        }
      );
    },
    [state, execute]
  );

  return [state, setState, { save, isPending, age, error }];
}

/**
 * Hook for tracking multiple optimistic updates
 * Useful for complex UIs with many concurrent operations
 * 
 * @example
 * const tracker = useOptimisticTracker();
 * 
 * tracker.track('match-1', async () => {
 *   const result = await submitMatch(match1);
 *   return result;
 * });
 * 
 * console.log(tracker.pending); // ['match-1']
 * console.log(tracker.getAge('match-1')); // 1234ms
 */
export function useOptimisticTracker() {
  const [pending, setPending] = useState([]);
  const [ages, setAges] = useState({});
  const intervalsRef = useRef({});

  const track = useCallback(async (key, operation) => {
    // Add to pending
    setPending((prev) => [...prev, key]);

    // Start age tracking
    const startTime = Date.now();
    intervalsRef.current[key] = setInterval(() => {
      setAges((prev) => ({ ...prev, [key]: Date.now() - startTime }));
    }, 100);

    try {
      const result = await operation();
      return result;
    } finally {
      // Remove from pending
      setPending((prev) => prev.filter((k) => k !== key));

      // Stop age tracking
      if (intervalsRef.current[key]) {
        clearInterval(intervalsRef.current[key]);
        delete intervalsRef.current[key];
      }
      setAges((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    }
  }, []);

  const getAge = useCallback((key) => ages[key] || null, [ages]);

  const isPending = useCallback((key) => pending.includes(key), [pending]);

  return {
    track,
    pending,
    isPending,
    getAge,
  };
}
