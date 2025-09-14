// =============================================
// FILE: src/hooks/useOptimizedLoad.js
// =============================================
import { useState, useEffect, useRef } from "react";

/**
 * Hook ottimizzato per il caricamento dei dati con cache e debounce
 */
export function useOptimizedLoad(loadFn, deps = [], options = {}) {
  const {
    debounceMs = 150,
    cacheKey = null,
    ttlMs = 5 * 60 * 1000, // 5 minuti default
    enableCache = true,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);
  const cacheRef = useRef(new Map());
  const lastLoadRef = useRef(0);

  // Cache helper functions
  const getCached = (key) => {
    if (!enableCache || !key) return null;
    const cached = cacheRef.current.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > ttlMs;
    if (isExpired) {
      cacheRef.current.delete(key);
      return null;
    }

    return cached.data;
  };

  const setCache = (key, data) => {
    if (!enableCache || !key) return;
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
    });
  };

  const load = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        setError(null);

        // Check cache first
        if (cacheKey) {
          const cached = getCached(cacheKey);
          if (cached) {
            setData(cached);
            setLoading(false);
            return;
          }
        }

        // Prevent too frequent calls
        const now = Date.now();
        if (now - lastLoadRef.current < debounceMs) {
          return;
        }
        lastLoadRef.current = now;

        setLoading(true);
        const result = await loadFn();

        setData(result);

        // Cache the result
        if (cacheKey && result) {
          setCache(cacheKey, result);
        }
      } catch (err) {
        console.error("useOptimizedLoad error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }, debounceMs);
  };

  useEffect(() => {
    load();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, deps);

  const reload = () => {
    if (cacheKey) {
      cacheRef.current.delete(cacheKey);
    }
    load();
  };

  return { data, loading, error, reload };
}

/**
 * Hook specifico per il caricamento delle prenotazioni utente
 */
export function useUserBookingsLoad(user) {
  const loadBookings = async () => {
    if (!user) return [];

    const { getUserBookings } = await import("@services/bookings.js");
    return getUserBookings(user, true);
  };

  return useOptimizedLoad(
    loadBookings,
    [user?.uid], // Only depend on user ID
    {
      cacheKey: user ? `user-bookings-${user.uid}` : null,
      debounceMs: 200,
      ttlMs: 2 * 60 * 1000, // 2 minutes for bookings
      enableCache: true,
    },
  );
}
