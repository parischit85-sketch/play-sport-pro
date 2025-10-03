// =============================================
// FILE: src/hooks/useBookings.js
// =============================================
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@contexts/AuthContext.jsx';
import {
  createBooking,
  getPublicBookings,
  getUserBookings,
  cancelBooking,
} from '@services/cloud-bookings.js';

// Per evitare conflitti con il nuovo hook performante, questo rimane per compatibilità
// ma con ottimizzazioni per ridurre le chiamate multiple
const requestCache = new Map();

export function useBookings() {
  const { user } = useAuth();

  const [publicBookings, setPublicBookings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load public bookings with simple cache
  const loadPublicBookings = useCallback(async () => {
    const cacheKey = 'public-bookings';
    const cached = requestCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < 30000) {
      // 30s cache
      setPublicBookings(cached.data);
      return cached.data;
    }

    try {
      setLoading(true);
      const bookings = await getPublicBookings();
      requestCache.set(cacheKey, { data: bookings, timestamp: Date.now() });
      setPublicBookings(bookings);
      setError(null);
      return bookings;
    } catch (err) {
      console.error('Error loading public bookings:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user bookings with cache and deduplication
  const loadUserBookings = useCallback(async () => {
    if (!user) {
      setUserBookings([]);
      return;
    }

    const cacheKey = `user-bookings-${user.uid}`;
    const cached = requestCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < 30000) {
      // 30s cache
      setUserBookings(cached.data);
      return cached.data;
    }

    try {
      setLoading(true);
      const bookings = await getUserBookings(user.uid);
      requestCache.set(cacheKey, { data: bookings, timestamp: Date.now() });
      setUserBookings(bookings);
      setError(null);
      return bookings;
    } catch (err) {
      console.error('Error loading user bookings:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create booking
  const createBookingMutation = useCallback(
    async (bookingData) => {
      if (!user) throw new Error('User must be authenticated');

      try {
        setLoading(true);
        const newBooking = await createBooking(bookingData, user);

        // Rimosso aggiornamento ottimistico legacy (multi-club usa unified bookings)

        // Refresh data
        await Promise.all([loadPublicBookings(), loadUserBookings()]);

        setError(null);
        return newBooking;
      } catch (err) {
        console.error('Error creating booking:', err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, loadPublicBookings, loadUserBookings]
  );

  // Cancel booking
  const cancelBookingMutation = useCallback(
    async (bookingId) => {
      if (!user) throw new Error('User must be authenticated');

      try {
        setLoading(true);
        await cancelBooking(bookingId, user.uid);

        // Rimosso aggiornamento ottimistico legacy

        // Refresh data
        await Promise.all([loadPublicBookings(), loadUserBookings()]);

        setError(null);
      } catch (err) {
        console.error('Error canceling booking:', err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, loadPublicBookings, loadUserBookings]
  );

  // Load initial data con throttling
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPublicBookings();
    }, 100); // Small delay to avoid mount storms

    return () => clearTimeout(timer);
  }, [loadPublicBookings]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUserBookings();
    }, 200); // Slight delay after public bookings

    return () => clearTimeout(timer);
  }, [loadUserBookings]);

  // Derived data
  const activeUserBookings = userBookings.filter((booking) => {
    const bookingDate = new Date(`${booking.date}T${booking.time}:00`);
    return bookingDate > new Date();
  });

  const pastUserBookings = userBookings.filter((booking) => {
    const bookingDate = new Date(`${booking.date}T${booking.time}:00`);
    return bookingDate <= new Date();
  });

  return {
    publicBookings,
    userBookings,
    activeUserBookings,
    pastUserBookings,
    loading,
    error,
    createBooking: createBookingMutation,
    cancelBooking: cancelBookingMutation,
    refreshBookings: () => {
      // Clear cache for fresh data
      requestCache.clear();
      return Promise.all([loadPublicBookings(), loadUserBookings()]);
    },
  };
}
