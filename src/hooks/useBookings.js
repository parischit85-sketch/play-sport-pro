// =============================================
// FILE: src/hooks/useBookings.js
// =============================================
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useLeague } from '@contexts/LeagueContext.jsx';
import { createBooking, getPublicBookings, getUserBookings, cancelBooking } from '@services/cloud-bookings.js';

export function useBookings() {
  const { user } = useAuth();
  const { state, setState } = useLeague();
  
  const [publicBookings, setPublicBookings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load public bookings
  const loadPublicBookings = useCallback(async () => {
    try {
      setLoading(true);
      const bookings = await getPublicBookings();
      setPublicBookings(bookings);
      setError(null);
    } catch (err) {
      console.error('Error loading public bookings:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user bookings
  const loadUserBookings = useCallback(async () => {
    if (!user) {
      setUserBookings([]);
      return;
    }

    try {
      setLoading(true);
      const bookings = await getUserBookings(user.uid);
      setUserBookings(bookings);
      setError(null);
    } catch (err) {
      console.error('Error loading user bookings:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create booking
  const createBookingMutation = useCallback(async (bookingData) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      setLoading(true);
      const newBooking = await createBooking(bookingData, user);
      
      // Update local state optimistically
      if (state && setState) {
        const toAppBooking = {
          id: newBooking.id,
          courtId: newBooking.courtId,
          start: new Date(`${newBooking.date}T${newBooking.time}:00`).toISOString(),
          duration: newBooking.duration,
          players: [],
          playerNames: [user.displayName || user.email],
          guestNames: [],
          price: newBooking.price,
          note: newBooking.notes || '',
          bookedByName: user.displayName || user.email,
          addons: { lighting: newBooking.lighting, heating: newBooking.heating },
          status: 'booked',
          createdAt: Date.now(),
        };

        setState(s => ({
          ...s,
          bookings: [...(s.bookings || []), toAppBooking]
        }));
      }

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
  }, [user, state, setState, loadPublicBookings, loadUserBookings]);

  // Cancel booking
  const cancelBookingMutation = useCallback(async (bookingId) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      setLoading(true);
      await cancelBooking(bookingId, user.uid);
      
      // Update local state optimistically
      if (state && setState) {
        setState(s => ({
          ...s,
          bookings: s.bookings?.filter(b => b.id !== bookingId) || []
        }));
      }

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
  }, [user, state, setState, loadPublicBookings, loadUserBookings]);

  // Load initial data
  useEffect(() => {
    loadPublicBookings();
  }, [loadPublicBookings]);

  useEffect(() => {
    loadUserBookings();
  }, [loadUserBookings]);

  // Derived data
  const activeUserBookings = userBookings.filter(booking => {
    const bookingDate = new Date(`${booking.date}T${booking.time}:00`);
    return bookingDate > new Date();
  });

  const pastUserBookings = userBookings.filter(booking => {
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
    refreshBookings: () => Promise.all([loadPublicBookings(), loadUserBookings()]),
  };
}
