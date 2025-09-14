// =============================================
// FILE: src/hooks/useBookingPerformance.js
// =============================================
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@contexts/AuthContext.jsx";

// Global cache per evitare duplicati di chiamate
const bookingCache = new Map();
const pendingRequests = new Map();

/**
 * Hook ottimizzato per le prenotazioni utente con cache globale e deduplicazione
 */
export function useUserBookingsFast(options = {}) {
  const { user } = useAuth();
  const { refreshInterval = 30000, enableBackground = true } = options;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(0);

  const mountedRef = useRef(true);
  const intervalRef = useRef(null);
  const cacheKey = user?.uid ? `bookings-${user.uid}` : null;

  // Load bookings with deduplication
  const loadBookings = useCallback(
    async (force = false) => {
      if (!user?.uid) {
        setBookings([]);
        setLoading(false);
        return [];
      }

      // Check cache first
      if (!force && cacheKey) {
        const cached = bookingCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 60000) {
          // 1 minute cache
          if (mountedRef.current) {
            setBookings(cached.data);
            setLoading(false);
            setLastUpdate(cached.timestamp);
          }
          return cached.data;
        }
      }

      // Check if request is already pending
      if (pendingRequests.has(cacheKey)) {
        try {
          const result = await pendingRequests.get(cacheKey);
          if (mountedRef.current) {
            setBookings(result);
            setLoading(false);
          }
          return result;
        } catch (err) {
          if (mountedRef.current) {
            setError(err);
            setLoading(false);
          }
          throw err;
        }
      }

      // Create new request
      const requestPromise = loadUserBookingsOptimized(user);
      pendingRequests.set(cacheKey, requestPromise);

      try {
        if (mountedRef.current) setLoading(true);

        const result = await requestPromise;
        const timestamp = Date.now();

        // Cache result
        if (cacheKey) {
          bookingCache.set(cacheKey, { data: result, timestamp });
        }

        if (mountedRef.current) {
          setBookings(result);
          setError(null);
          setLastUpdate(timestamp);
        }

        return result;
      } catch (err) {
        console.error("Error loading user bookings:", err);
        if (mountedRef.current) {
          setError(err);
        }
        throw err;
      } finally {
        pendingRequests.delete(cacheKey);
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [user?.uid, cacheKey],
  );

  // Initial load
  useEffect(() => {
    mountedRef.current = true;
    loadBookings();

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadBookings]);

  // Background refresh
  useEffect(() => {
    if (!enableBackground || !user?.uid) return;

    intervalRef.current = setInterval(() => {
      if (mountedRef.current && document.visibilityState === "visible") {
        loadBookings(true);
      }
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadBookings, refreshInterval, enableBackground, user?.uid]);

  // Memoized values
  const activeBookings = useMemo(() => {
    const now = new Date();
    return bookings.filter((booking) => {
      const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
      return bookingDateTime > now;
    });
  }, [bookings]);

  const todayBookings = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return activeBookings.filter((booking) => booking.date === today);
  }, [activeBookings]);

  const refresh = useCallback(() => {
    // Clear cache for immediate refresh
    if (cacheKey) {
      bookingCache.delete(cacheKey);
    }
    return loadBookings(true);
  }, [loadBookings, cacheKey]);

  return {
    bookings: activeBookings,
    allBookings: bookings,
    todayBookings,
    loading,
    error,
    lastUpdate,
    refresh,
    hasBookings: activeBookings.length > 0,
  };
}

/**
 * Caricamento ottimizzato delle prenotazioni utente
 */
async function loadUserBookingsOptimized(user) {
  if (!user?.uid) return [];

  try {
    // Parallel loading delle fonti dati
    const [cloudBookings, localBookings] = await Promise.allSettled([
      loadFromCloud(user.uid),
      loadFromLocal(user),
    ]);

    let allBookings = [];

    // Merge results con priorità al cloud
    if (
      cloudBookings.status === "fulfilled" &&
      cloudBookings.value.length > 0
    ) {
      allBookings = cloudBookings.value;
    }

    if (
      localBookings.status === "fulfilled" &&
      localBookings.value.length > 0
    ) {
      // Se non abbiamo cloud bookings, usa local
      if (allBookings.length === 0) {
        allBookings = localBookings.value;
      } else {
        // Merge senza duplicati
        const bookingIds = new Set(allBookings.map((b) => b.id));
        const uniqueLocal = localBookings.value.filter(
          (b) => !bookingIds.has(b.id),
        );
        allBookings = [...allBookings, ...uniqueLocal];
      }
    }

    // Filter future bookings only
    const now = new Date();
    return allBookings
      .filter((booking) => {
        const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
        return bookingDateTime > now;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}:00`);
        const dateB = new Date(`${b.date}T${b.time}:00`);
        return dateA - dateB;
      });
  } catch (error) {
    console.error("Error in loadUserBookingsOptimized:", error);
    return [];
  }
}

/**
 * Caricamento da cloud con timeout
 */
async function loadFromCloud(userId) {
  try {
    const { loadActiveUserBookings } = await import(
      "@services/cloud-bookings.js"
    );

    // Promise con timeout per evitare attese infinite
    return await Promise.race([
      loadActiveUserBookings(userId),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Cloud timeout")), 5000),
      ),
    ]);
  } catch (error) {
    console.warn("Cloud bookings failed:", error);
    return [];
  }
}

/**
 * Caricamento da localStorage ottimizzato
 */
async function loadFromLocal(user) {
  try {
    const { getUserBookings } = await import("@services/bookings.js");
    return await getUserBookings(user, false); // No force full init per velocità
  } catch (error) {
    console.warn("Local bookings failed:", error);
    return [];
  }
}

/**
 * Hook semplificato per componenti che hanno solo bisogno del conteggio
 */
export function useBookingsCount() {
  const { bookings, loading } = useUserBookingsFast({
    refreshInterval: 60000, // 1 minute per count
    enableBackground: false,
  });

  return {
    count: bookings.length,
    loading,
  };
}

/**
 * Cleanup cache utility
 */
export function clearBookingsCache() {
  bookingCache.clear();
  pendingRequests.clear();
}
