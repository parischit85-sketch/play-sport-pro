// =============================================
// FILE: src/hooks/useOptimizedBookings.js
// REACT HOOK FOR OPTIMIZED BOOKING OPERATIONS
// =============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { optimizedBookingService } from '../services/optimizedBookingService.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export const useOptimizedBookings = (options = {}) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [performance, setPerformance] = useState({});
  const subscriptionRef = useRef(null);

  const {
    autoLoad = true,
    realTimeUpdates = false,
    includeHistory = false,
    includeCancelled = false,
    limit = 50,
    preloadData = true,
  } = options;

  // Load user bookings with performance tracking
  const loadBookings = useCallback(async (userId = null) => {
    if (!userId && !user?.uid) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await optimizedBookingService.getUserBookings(
        userId || user.uid,
        { includeHistory, includeCancelled, limit }
      );

      setBookings(result.bookings);
      setPerformance(result.performance);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, includeHistory, includeCancelled, limit]);

  // Create booking with optimizations
  const createBooking = useCallback(async (bookingData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await optimizedBookingService.createBooking({
        ...bookingData,
        createdBy: user?.uid,
        userEmail: user?.email,
      });

      // Optimistically update local state
      setBookings(prev => [result, ...prev]);

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update booking
  const updateBooking = useCallback(async (bookingId, updates) => {
    setLoading(true);
    setError(null);

    try {
      const result = await optimizedBookingService.updateBooking(bookingId, updates);

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, ...updates }
            : booking
        )
      );

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId, reason) => {
    setLoading(true);
    setError(null);

    try {
      const result = await optimizedBookingService.cancelBooking(bookingId, reason);

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled', cancelledAt: new Date() }
            : booking
        )
      );

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search bookings
  const searchBookings = useCallback(async (searchParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await optimizedBookingService.searchBookings(searchParams);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check availability
  const checkAvailability = useCallback(async (date, time, courtType, duration) => {
    try {
      return await optimizedBookingService.checkAvailability(date, time, courtType, duration);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    if (!realTimeUpdates || !user?.uid) return;

    subscriptionRef.current = optimizedBookingService.subscribeToUserBookings(
      user.uid,
      (result) => {
        setBookings(result.bookings);
        setPerformance(prev => ({
          ...prev,
          fromCache: result.fromCache,
          isRealTime: true,
        }));
      },
      {
        limit,
        onError: (err) => setError(err.message),
      }
    );

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, [realTimeUpdates, user?.uid, limit]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && !realTimeUpdates) {
      loadBookings();
    }
  }, [autoLoad, realTimeUpdates, loadBookings]);

  // Preload data for better performance
  useEffect(() => {
    if (preloadData && user?.uid) {
      optimizedBookingService.preloadFrequentData(user.uid);
    }
  }, [preloadData, user?.uid]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
      }
    };
  }, []);

  return {
    bookings,
    loading,
    error,
    performance,
    actions: {
      loadBookings,
      createBooking,
      updateBooking,
      cancelBooking,
      searchBookings,
      checkAvailability,
      refresh: () => loadBookings(),
      clearError: () => setError(null),
    },
  };
};

export const useActiveBookings = (options = {}) => {
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const subscriptionRef = useRef(null);

  const {
    realTimeUpdates = true,
    courtType = null,
    date = null,
    limit = 100,
  } = options;

  const loadActiveBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await optimizedBookingService.getActiveBookings({
        limit,
        courtType,
        date,
      });

      setActiveBookings(result.data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load active bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [limit, courtType, date]);

  // Set up real-time subscription for active bookings
  useEffect(() => {
    if (!realTimeUpdates) {
      loadActiveBookings();
      return;
    }

    subscriptionRef.current = optimizedBookingService.subscribeToActiveBookings(
      (result) => {
        setActiveBookings(result.data);
      },
      {
        limit,
        onError: (err) => setError(err.message),
      }
    );

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, [realTimeUpdates, limit, loadActiveBookings]);

  return {
    activeBookings,
    loading,
    error,
    refresh: loadActiveBookings,
    clearError: () => setError(null),
  };
};

export const useBookingHistory = (userId, options = {}) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const { limit = 20 } = options;

  const loadHistory = useCallback(async (pageNum = 0, append = false) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await optimizedBookingService.getBookingHistory(userId, {
        limit,
        page: pageNum,
      });

      if (append) {
        setHistory(prev => [...prev, ...result.data]);
      } else {
        setHistory(result.data);
      }

      setHasMore(result.data.length === limit);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load booking history:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadHistory(page + 1, true);
    }
  }, [loading, hasMore, page, loadHistory]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    loading,
    error,
    hasMore,
    loadMore,
    refresh: () => loadHistory(),
    clearError: () => setError(null),
  };
};

export const useBookingPerformance = () => {
  const [metrics, setMetrics] = useState({});
  const [suggestions, setSuggestions] = useState({});

  const updateMetrics = useCallback(() => {
    setMetrics(optimizedBookingService.getPerformanceMetrics());
    setSuggestions(optimizedBookingService.getOptimizationSuggestions());
  }, []);

  useEffect(() => {
    updateMetrics();
    const interval = setInterval(updateMetrics, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [updateMetrics]);

  return {
    metrics,
    suggestions,
    actions: {
      clearCaches: () => optimizedBookingService.clearAllCaches(),
      invalidateUserCache: (userId) => optimizedBookingService.invalidateUserCache(userId),
      enableOfflineMode: () => optimizedBookingService.enableOfflineMode(),
      enableOnlineMode: () => optimizedBookingService.enableOnlineMode(),
      refresh: updateMetrics,
    },
  };
};