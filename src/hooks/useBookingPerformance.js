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
      console.log('📖 [useUserBookingsFast] loadBookings called:', { userId: user?.uid, force, cacheKey });
      
      if (!user?.uid) {
        console.log('❌ [useUserBookingsFast] No user ID, returning empty');
        setBookings([]);
        setLoading(false);
        return [];
      }

      // Check cache first
      if (!force && cacheKey) {
        const cached = bookingCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 60000) {
          // 1 minute cache
          console.log('✅ [useUserBookingsFast] Using cached bookings:', cached.data.length);
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
        console.log('⏳ [useUserBookingsFast] Request already pending, waiting...');
        try {
          const result = await pendingRequests.get(cacheKey);
          console.log('✅ [useUserBookingsFast] Pending request completed:', result.length);
          if (mountedRef.current) {
            setBookings(result);
            setLoading(false);
          }
          return result;
        } catch (err) {
          console.error('❌ [useUserBookingsFast] Pending request failed:', err);
          if (mountedRef.current) {
            setError(err);
            setLoading(false);
          }
          throw err;
        }
      }

      // Create new request
      console.log('🔄 [useUserBookingsFast] Creating new request for bookings');
      const requestPromise = loadUserBookingsOptimized(user);
      pendingRequests.set(cacheKey, requestPromise);

      try {
        if (mountedRef.current) setLoading(true);

        const result = await requestPromise;
        console.log('✅ [useUserBookingsFast] Bookings loaded:', result.length);
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
        console.error("❌ [useUserBookingsFast] Error loading user bookings:", err);
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

  // Memoized values - no additional filtering since loadUserBookingsOptimized already filters
  const activeBookings = bookings;

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
  console.log('🔍 [loadUserBookingsOptimized] Starting for user:', user?.uid);
  
  if (!user?.uid) {
    console.log('❌ [loadUserBookingsOptimized] No user ID');
    return [];
  }

  try {
    // Parallel loading delle fonti dati
    console.log('⏳ [loadUserBookingsOptimized] Loading from cloud and local...');
    const [cloudBookings, localBookings] = await Promise.allSettled([
      loadFromCloud(user.uid, { displayName: user.displayName, email: user.email }),
      loadFromLocal(user),
    ]);

    console.log('📊 [loadUserBookingsOptimized] Results:', {
      cloud: cloudBookings.status === 'fulfilled' ? cloudBookings.value.length : `failed: ${cloudBookings.reason}`,
      local: localBookings.status === 'fulfilled' ? localBookings.value.length : `failed: ${localBookings.reason}`
    });

    let allBookings = [];

    // Merge results con priorità al cloud
    if (
      cloudBookings.status === "fulfilled" &&
      cloudBookings.value.length > 0
    ) {
      console.log('✅ [loadUserBookingsOptimized] Using cloud bookings:', cloudBookings.value.length);
      allBookings = cloudBookings.value;
    }

    if (
      localBookings.status === "fulfilled" &&
      localBookings.value.length > 0
    ) {
      // Se non abbiamo cloud bookings, usa local
      if (allBookings.length === 0) {
        console.log('✅ [loadUserBookingsOptimized] Using local bookings (no cloud):', localBookings.value.length);
        allBookings = localBookings.value;
      } else {
        // Merge senza duplicati
        const bookingIds = new Set(allBookings.map((b) => b.id));
        const uniqueLocal = localBookings.value.filter(
          (b) => !bookingIds.has(b.id),
        );
        console.log('✅ [loadUserBookingsOptimized] Merged cloud + local:', {
          cloud: allBookings.length,
          uniqueLocal: uniqueLocal.length,
          total: allBookings.length + uniqueLocal.length
        });
        allBookings = [...allBookings, ...uniqueLocal];
      }
    }

    // Filter future bookings only (including today's active bookings)
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const futureBookings = allBookings
      .filter((booking) => {
        const bookingDate = new Date(booking.date);
        const isToday = bookingDate.toDateString() === today.toDateString();
        const isFuture = bookingDate > today;
        
        if (isFuture) return true;
        
        // For today, check if the booking time is still active
        if (isToday && booking.time) {
          const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
          return bookingDateTime > now;
        }
        
        return false;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}:00`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}:00`);
        return dateA - dateB;
      });
    
    console.log('🎯 [loadUserBookingsOptimized] Final future bookings:', futureBookings.length);
    return futureBookings;
  } catch (error) {
    console.error("❌ [loadUserBookingsOptimized] Error:", error);
    return [];
  }
}

/**
 * Caricamento da cloud con timeout
 */
async function loadFromCloud(userId, userInfo = {}) {
  console.log('☁️ [loadFromCloud] Starting for user:', userId, 'with info:', userInfo);
  try {
    const { loadActiveUserBookings } = await import(
      "@services/cloud-bookings.js"
    );

    // Promise con timeout per evitare attese infinite
    const result = await Promise.race([
      loadActiveUserBookings(userId, undefined, userInfo),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Cloud timeout")), 5000),
      ),
    ]);
    
    console.log('✅ [loadFromCloud] Success:', result.length);
    return result;
  } catch (error) {
    console.warn("⚠️ [loadFromCloud] Failed:", error.message);
    return [];
  }
}

/**
 * Caricamento da localStorage ottimizzato
 */
async function loadFromLocal(user) {
  console.log('💾 [loadFromLocal] Starting for user:', user?.uid);
  try {
    const { getUserBookings } = await import("@services/bookings.js");
    const result = await getUserBookings(user, false); // No force full init per velocità
    console.log('✅ [loadFromLocal] Success:', result.length);
    return result;
  } catch (error) {
    console.warn("⚠️ [loadFromLocal] Failed:", error.message);
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

/**
 * Invalidate cache for specific user
 */
export function invalidateUserBookingsCache(userId) {
  if (userId) {
    const cacheKey = `bookings-${userId}`;
    bookingCache.delete(cacheKey);
    pendingRequests.delete(cacheKey);
  }
}
