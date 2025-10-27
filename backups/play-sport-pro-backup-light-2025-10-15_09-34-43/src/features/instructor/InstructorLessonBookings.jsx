// =============================================
// FILE: src/features/instructor/InstructorLessonBookings.jsx
// =============================================
import React, { useState, useEffect, useMemo } from 'react';
import { useClub } from '@contexts/ClubContext.jsx';
import { useAuth } from '@contexts/AuthContext.jsx';
import { themeTokens } from '@lib/theme.js';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

export default function InstructorLessonBookings({ compact = false }) {
  const { clubId } = useClub();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const T = themeTokens();

  // Load instructor's lesson bookings
  useEffect(() => {
    const loadInstructorBookings = async () => {
      if (!clubId || !user?.uid) return;

      try {
        setLoading(true);
        console.log('Loading lesson bookings for instructor:', user.uid);

        // Import the bookings service
        const { getBookings } = await import('@services/bookings.js');

        // Get all bookings for the club
        const allBookings = await getBookings(clubId);

        // Filter bookings where this user is the instructor
        const instructorBookings = allBookings.filter(
          (booking) =>
            booking.instructorId === user.uid &&
            (booking.isLessonBooking ||
              booking.type === 'lesson' ||
              booking.bookingType === 'lezione')
        );

        console.log('Found instructor bookings:', instructorBookings.length);
        setBookings(instructorBookings);
      } catch (error) {
        console.error('Error loading instructor bookings:', error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    loadInstructorBookings();
  }, [clubId, user?.uid]);

  // Filter and sort bookings
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Apply time filter
    const now = new Date();
    if (filter === 'upcoming') {
      filtered = filtered.filter((booking) => {
        const bookingDate = booking.date ? new Date(booking.date) : new Date();
        return bookingDate >= now;
      });
    } else if (filter === 'past') {
      filtered = filtered.filter((booking) => {
        const bookingDate = booking.date ? new Date(booking.date) : new Date();
        return bookingDate < now;
      });
    }

    // Sort by date (most recent first for upcoming, most recent first for past)
    filtered.sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date();
      const dateB = b.date ? new Date(b.date) : new Date();
      return dateB - dateA; // Most recent first
    });

    return filtered;
  }, [bookings, filter]);

  // Format date for display
  const formatBookingDate = (dateString) => {
    if (!dateString) return 'Data non disponibile';

    try {
      const date = parseISO(dateString);

      if (isToday(date)) {
        return `Oggi, ${format(date, 'HH:mm')}`;
      } else if (isTomorrow(date)) {
        return `Domani, ${format(date, 'HH:mm')}`;
      } else {
        return format(date, 'EEEE d MMMM, HH:mm', { locale: it });
      }
    } catch (error) {
      return 'Data non valida';
    }
  };

  // Get booking status color
  const getStatusColor = (booking) => {
    const now = new Date();
    const bookingDate = booking.date ? new Date(booking.date) : new Date();

    if (booking.status === 'cancelled') {
      return 'text-red-600 dark:text-red-400';
    } else if (isPast(bookingDate) && booking.status === 'confirmed') {
      return 'text-green-600 dark:text-green-400';
    } else if (booking.status === 'confirmed') {
      return 'text-blue-600 dark:text-blue-400';
    } else {
      return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Get status text
  const getStatusText = (booking) => {
    const now = new Date();
    const bookingDate = booking.date ? new Date(booking.date) : new Date();

    if (booking.status === 'cancelled') {
      return 'Annullata';
    } else if (isPast(bookingDate) && booking.status === 'confirmed') {
      return 'Completata';
    } else if (booking.status === 'confirmed') {
      return 'Confermata';
    } else {
      return 'In attesa';
    }
  };

  if (loading) {
    return (
      <div
        className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl ${compact ? 'mb-4' : ''}`}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200/60 dark:bg-gray-600/40 rounded w-48"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200/40 dark:bg-gray-600/30 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl ${compact ? 'mb-4' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11M9 11h6"
              />
            </svg>
          </div>
          Le Mie Lezioni
        </h3>

        {/* Filter buttons */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Tutte', count: bookings.length },
            {
              key: 'upcoming',
              label: 'Prossime',
              count: bookings.filter((b) => new Date(b.date || new Date()) >= new Date()).length,
            },
            {
              key: 'past',
              label: 'Passate',
              count: bookings.filter((b) => new Date(b.date || new Date()) < new Date()).length,
            },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === key
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Bookings list */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-3 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11M9 11h6"
              />
            </svg>
            <p className="text-lg font-medium mb-1">
              {filter === 'all'
                ? 'Nessuna lezione prenotata'
                : filter === 'upcoming'
                  ? 'Nessuna lezione in programma'
                  : 'Nessuna lezione passata'}
            </p>
            <p className="text-sm">
              {filter === 'all'
                ? 'Le tue lezioni appariranno qui quando verranno prenotate'
                : filter === 'upcoming'
                  ? 'Non hai lezioni programmate'
                  : 'Non hai lezioni completate'}
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-gradient-to-r from-gray-50/80 to-gray-100/60 dark:from-gray-700/60 dark:to-gray-800/40 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-600/30 p-4 hover:shadow-lg transition-all duration-200"
            >
              {/* Header with date and status */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatBookingDate(booking.date)}
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking)} bg-current/10`}
                >
                  {getStatusText(booking)}
                </div>
              </div>

              {/* Booking details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {booking.lessonType === 'individual'
                      ? 'Lezione individuale'
                      : booking.lessonType === 'group'
                        ? 'Lezione di gruppo'
                        : 'Lezione'}
                  </span>
                </div>

                {booking.participants && booking.participants.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Partecipanti:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {booking.participants.length}{' '}
                      {booking.participants.length === 1 ? 'persona' : 'persone'}
                    </span>
                  </div>
                )}

                {booking.price && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Prezzo:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      €{booking.price}
                    </span>
                  </div>
                )}

                {booking.notes && (
                  <div className="mt-3 p-3 bg-blue-50/70 dark:bg-blue-900/20 backdrop-blur-sm rounded-lg border border-blue-200/50 dark:border-blue-700/30">
                    <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                      Note:
                    </div>
                    <div className="text-sm text-blue-800 dark:text-blue-200">{booking.notes}</div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
