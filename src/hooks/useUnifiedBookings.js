// =============================================
// FILE: src/hooks/useUnifiedBookings.js
// HOOK REACT PER IL SERVIZIO UNIFICATO
// =============================================
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@contexts/AuthContext.jsx';
import UnifiedBookingService from '@services/unified-booking-service.js';

const { BOOKING_STATUS } = UnifiedBookingService.CONSTANTS;

/**
 * Main hook for unified booking management
 */
export function useUnifiedBookings(options = {}) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [lessonBookings, setLessonBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    autoLoadUser = true,
    autoLoadLessons = true,
    enableRealtime = true,
    clubId = null,
  } = options;

  // Initialize service
  useEffect(() => {
    UnifiedBookingService.initialize({
      cloudEnabled: true,
      user: user,
      clubId: clubId || null,
    });

    // Migrate old data on first load
    UnifiedBookingService.migrateOldData();
  }, [user, clubId]);

  // Load all bookings
  const loadBookings = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        const allBookings = await UnifiedBookingService.getPublicBookings({
          forceRefresh,
          clubId,
        });

        setBookings(allBookings);

        // Load user-specific bookings if user is available
        if (user && autoLoadUser) {
          const userBookingData = await UnifiedBookingService.getUserBookings(user, { clubId });
          setUserBookings(userBookingData);
        }

        // Load lesson bookings if requested
        if (autoLoadLessons) {
          // CRITICAL FIX: Pass clubId for security rules compliance
          const lessonData = await UnifiedBookingService.getLessonBookings(null, clubId);
          setLessonBookings(lessonData);
        }
      } catch (err) {
        console.error('Error loading bookings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user, autoLoadUser, autoLoadLessons, clubId]
  );

  // Load bookings on mount and user change
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Real-time updates
  useEffect(() => {
    if (!enableRealtime) return;

    const subKey = `public|${clubId || 'all'}`;
    console.log('🔥 [useUnifiedBookings] Setting up realtime listeners for:', subKey);

    const unsubscribeUpdated = UnifiedBookingService.addEventListener('bookingsUpdated', (data) => {
      console.log('📡 [useUnifiedBookings] Received bookingsUpdated event:', {
        dataType: data?.type,
        expectedKey: subKey,
        bookingsCount: data?.bookings?.length,
        exactMatch: data?.type === subKey,
        prefixMatch: data?.type?.startsWith('public|'),
      });
      
      // Match esatto O match per 'all' quando clubId è null
      const matches = data?.type === subKey || 
                     (!clubId && data?.type === 'public|all') ||
                     (clubId && data?.type === `public|${clubId}`);
      
      if (!data?.type || !matches) {
        console.log('⏭️ [useUnifiedBookings] Skipping event - key mismatch');
        return;
      }
      
      console.log('✅ [useUnifiedBookings] Updating bookings state with', data.bookings.length, 'items');
      setBookings(data.bookings);
    });

    const unsubscribeCreated = UnifiedBookingService.addEventListener(
      'bookingCreated',
      (_booking) => {
        console.log('➕ [useUnifiedBookings] Booking created, refreshing...');
        loadBookings(true); // Refresh all data
      }
    );

    const unsubscribeDeleted = UnifiedBookingService.addEventListener(
      'bookingDeleted',
      (_bookingId) => {
        console.log('🗑️ [useUnifiedBookings] Booking deleted, refreshing...');
        loadBookings(true); // Refresh all data
      }
    );

    return () => {
      console.log('🔌 [useUnifiedBookings] Cleaning up realtime listeners for:', subKey);
      unsubscribeUpdated();
      unsubscribeCreated();
      unsubscribeDeleted();
    };
  }, [enableRealtime, loadBookings, clubId]);

  // Booking operations
  const createBooking = useCallback(
    async (bookingData) => {
      try {
        setLoading(true);
        const result = await UnifiedBookingService.createBooking(
          { ...bookingData, clubId: clubId || bookingData.clubId },
          user,
          { clubId }
        );

        // Refresh data
        await loadBookings(true);

        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, loadBookings, clubId]
  );

  const updateBooking = useCallback(
    async (bookingId, updates) => {
      try {
        const result = await UnifiedBookingService.updateBooking(bookingId, updates, user);

        // Update local state optimistically
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...updates } : b)));
        setUserBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...updates } : b)));
        setLessonBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, ...updates } : b))
        );

        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
  );

  const cancelBooking = useCallback(
    async (bookingId) => {
      try {
        const result = await UnifiedBookingService.cancelBooking(bookingId, user);

        // Update local state
        const updatedBooking = {
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
        };
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, ...updatedBooking } : b))
        );
        setUserBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, ...updatedBooking } : b))
        );
        setLessonBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, ...updatedBooking } : b))
        );

        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
  );

  const deleteBooking = useCallback(
    async (bookingId) => {
      try {
        await UnifiedBookingService.deleteBooking(bookingId, user);

        // Remove from local state
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
        setUserBookings((prev) => prev.filter((b) => b.id !== bookingId));
        setLessonBookings((prev) => prev.filter((b) => b.id !== bookingId));
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
  );

  // Computed values
  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status === 'confirmed'),
    [bookings]
  );

  const activeUserBookings = useMemo(
    () => userBookings.filter((b) => b.status === 'confirmed'),
    [userBookings]
  );

  const activeLessonBookings = useMemo(
    () => lessonBookings.filter((b) => b.status === 'confirmed'),
    [lessonBookings]
  );

  const courtBookings = useMemo(() => bookings.filter((b) => !b.isLessonBooking), [bookings]);

  return {
    // Data
    bookings,
    userBookings,
    lessonBookings,
    activeBookings,
    activeUserBookings,
    activeLessonBookings,
    courtBookings,

    // State
    loading,
    error,

    // Operations
    createBooking,
    updateBooking,
    cancelBooking,
    deleteBooking,
    refresh: loadBookings,

    // Utils
    clearError: () => setError(null),
  };
}

/**
 * Hook for court bookings only
 */
export function useCourtBookings() {
  const { courtBookings, loading, error, createBooking, refresh } = useUnifiedBookings({
    autoLoadUser: false,
    autoLoadLessons: false,
  });

  const createCourtBooking = useCallback(
    async (bookingData) => {
      return createBooking({
        ...bookingData,
        type: 'court',
        isLessonBooking: false,
      });
    },
    [createBooking]
  );

  return {
    bookings: courtBookings,
    loading,
    error,
    createBooking: createCourtBooking,
    refresh,
  };
}

/**
 * Hook for lesson bookings only
 */
export function useLessonBookings(options = {}) {
  const { user } = useAuth(); // Aggiungi il context dell'utente
  const { clubId = null } = options;
  const { lessonBookings, loading, error, createBooking, cancelBooking, refresh } =
    useUnifiedBookings({
      autoLoadUser: true,
      autoLoadLessons: true,
      clubId, // Passa il clubId al servizio unificato
    });

  const createLessonBooking = useCallback(
    async (lessonData) => {
      // First create the lesson booking
      const lessonBooking = await createBooking({
        ...lessonData,
        type: 'lesson',
        isLessonBooking: true,
      });

      // Then create the associated court booking if needed
      if (lessonData.createCourtBooking !== false) {
        const courtBooking = await createBooking({
          ...lessonData,
          type: 'court',
          isLessonBooking: true,
          notes: `Lezione con ${lessonData.instructorName || 'istruttore'}`,
          courtBookingId: lessonBooking.id, // Link them
        });

        // Update lesson booking with court reference
        lessonBooking.courtBookingId = courtBooking.id;
      }

      return lessonBooking;
    },
    [createBooking]
  );

  const clearAllLessons = useCallback(async () => {
    // CRITICAL FIX: Pass clubId for security rules compliance
    const allLessons = await UnifiedBookingService.getLessonBookings(null, clubId);

    for (const lesson of allLessons) {
      try {
        // Delete the lesson booking permanently (pass the user from context)
        await UnifiedBookingService.deleteBooking(lesson.id, user);

        // Delete associated court booking if exists
        if (lesson.courtBookingId) {
          await UnifiedBookingService.deleteBooking(lesson.courtBookingId, user);
        }
      } catch (error) {
        console.warn('Error deleting lesson:', lesson.id, error);
      }
    }

    // Refresh data
    await refresh(true);

    return allLessons.length;
  }, [user, clubId, refresh]);

  return {
    lessonBookings,
    loading,
    error,
    createLessonBooking,
    cancelBooking,
    clearAllLessons,
    refresh,
  };
}

/**
 * Hook for user bookings (both court and lesson)
 */
export function useUserBookings() {
  const { userBookings, activeUserBookings, loading, error, refresh } = useUnifiedBookings({
    autoLoadUser: true,
    autoLoadLessons: false,
  });

  return {
    userBookings,
    activeUserBookings,
    loading,
    error,
    refresh,
  };
}

// Export BOOKING_STATUS for consistency across components
export { BOOKING_STATUS };

export default useUnifiedBookings;
