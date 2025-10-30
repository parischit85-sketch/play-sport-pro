// =============================================
// FILE: src/features/instructor/InstructorDashboard.jsx
// Dashboard completa per istruttori con tutte le prenotazioni e gestione orari
// =============================================
import React, { useState, useEffect, useMemo } from 'react';
import { useClub } from '@contexts/ClubContext.jsx';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useNotifications } from '@contexts/NotificationContext';
import { themeTokens } from '@lib/theme.js';
import {
  format,
  parseISO,
  addDays,
  isToday,
  isTomorrow,
  isPast,
  isFuture,
  startOfDay,
} from 'date-fns';
import { it } from 'date-fns/locale';
import Modal from '@ui/Modal.jsx';
import { logger } from '@/utils/logger';

export default function InstructorDashboard() {
  const { clubId, club, courts, matches } = useClub();
  const { user } = useAuth();
  const { showSuccess, showError, showWarning, confirm } = useNotifications();
  const [allBookings, setAllBookings] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons', 'matches', 'schedule'
  const [filterDate, setFilterDate] = useState('today'); // 'today', 'upcoming', 'past', 'all' - default to today
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const T = themeTokens();

  // Form state for adding/editing slots
  const [slotForm, setSlotForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    courtIds: [],
    maxParticipants: 1,
    price: 0,
    notes: '',
  });

  // Load all bookings and time slots
  useEffect(() => {
    const loadData = async () => {
      if (!clubId || !user?.uid) return;

      try {
        setLoading(true);
        logger.debug('Loading data for instructor', user.uid);

        // Load ALL club bookings to find lessons where this user is the instructor
        // (lessons have instructorId but user is NOT bookedBy - the student is bookedBy)
        const { loadPublicBookings } = await import('@services/cloud-bookings.js');
        const allClubBookings = await loadPublicBookings(clubId);

        // Filter lessons where this user is the instructor
        const instructorLessons = allClubBookings.filter((b) => {
          const isLesson = b.isLessonBooking || b.type === 'lesson' || b.bookingType === 'lezione';
          const isInstructor = b.instructorId === user.uid;
          return isLesson && isInstructor;
        });

        logger.debug('Instructor lessons found', instructorLessons.length);

        // Load user's bookings for matches (where user is a player/participant)
        const { loadActiveUserBookings } = await import('@services/cloud-bookings.js');
        const { getDoc, doc } = await import('firebase/firestore');
        const { db } = await import('@services/firebase.js');

        // Get user profile for email and name
        let userProfile = null;
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            userProfile = userDoc.data();
          }
        } catch (error) {
          logger.warn('⚠️ [InstructorDashboard] Could not load user profile:', error);
        }

        const userInfo = {
          displayName:
            userProfile?.firstName && userProfile?.lastName
              ? `${userProfile.firstName} ${userProfile.lastName}`
              : user.displayName,
          email: user.email || userProfile?.email,
        };

        // Load bookings where user is a player
        const userBookings = await loadActiveUserBookings(user.uid, clubId, userInfo);

        logger.debug('User bookings (as player)', userBookings.length);
        logger.debug('Matches from ClubContext', matches?.length || 0);

        // Filter matches to include only those where the user is involved
        const userMatches = (matches || []).filter((match) => {
          // Check if user is the one who booked
          if (match.bookedBy === user.uid) return true;

          // Check if user is in players array
          if (match.players && Array.isArray(match.players)) {
            const isInPlayers = match.players.some((player) => {
              if (typeof player === 'string') return false; // Can't match string names without user name
              return player?.id === user.uid || player?.uid === user.uid;
            });
            if (isInPlayers) return true;
          }

          // Check if user is in participants array
          if (match.participants && Array.isArray(match.participants)) {
            const isInParticipants = match.participants.some(
              (p) => p?.id === user.uid || p?.uid === user.uid
            );
            if (isInParticipants) return true;
          }

          // Check teamA and teamB
          if (match.teamA && Array.isArray(match.teamA)) {
            const isInTeamA = match.teamA.some((p) => p?.id === user.uid || p?.uid === user.uid);
            if (isInTeamA) return true;
          }

          if (match.teamB && Array.isArray(match.teamB)) {
            const isInTeamB = match.teamB.some((p) => p?.id === user.uid || p?.uid === user.uid);
            if (isInTeamB) return true;
          }

          return false;
        });

        logger.debug('User matches found', userMatches.length);

        // Combine all bookings:
        // 1. Lessons where this user is the instructor
        // 2. Bookings where user is a player (from userBookings)
        // 3. Matches from matches collection where user is involved
        const allBookingsData = [...instructorLessons, ...userBookings, ...userMatches];

        logger.debug('Total combined bookings', allBookingsData.length);
        if (allBookingsData.length > 0) {
          logger.debug('Sample booking', allBookingsData[0]);
        }

        // Don't filter here - let the useMemo do the filtering
        // This allows more flexible filtering logic
        setAllBookings(allBookingsData);

        // Load time slots
        const { getInstructorTimeSlots } = await import('@services/time-slots.js');
        const slots = await getInstructorTimeSlots(clubId, user.uid);
        logger.debug('Found time slots', slots.length);
        setTimeSlots(slots);
      } catch (error) {
        logger.error('❌ [InstructorDashboard] Error loading data:', error);
        setAllBookings([]);
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clubId, user?.uid, matches]); // Re-run when matches change

  // Filter bookings by type (lessons vs matches)
  const { lessonBookings, matchBookings } = useMemo(() => {
    logger.debug('Separating lessons and matches');
    logger.debug('Total bookings', allBookings.length);

    // Lessons: already filtered - only those where user is instructor
    const lessons = allBookings.filter((b) => {
      const isLesson = b.isLessonBooking || b.type === 'lesson' || b.bookingType === 'lezione';
      return isLesson;
    });

    logger.debug('Found lessons', lessons.length);
    if (lessons.length > 0) {
      logger.debug(
        'Sample lesson dates',
        lessons.slice(0, 3).map((l) => ({
          id: l.id?.substring(0, 8),
          date: l.date,
          time: l.time,
          instructorId: l.instructorId,
        }))
      );
    }

    // Matches: everything that is NOT a lesson
    const matches = allBookings.filter((b) => {
      const isLesson = b.isLessonBooking || b.type === 'lesson' || b.bookingType === 'lezione';
      return !isLesson;
    });

    logger.debug('Found matches', matches.length);
    if (matches.length > 0) {
      logger.debug(
        'Sample match dates',
        matches.slice(0, 3).map((m) => ({
          id: m.id?.substring(0, 8),
          date: m.date,
          time: m.time,
        }))
      );
    }

    return { lessonBookings: lessons, matchBookings: matches };
  }, [allBookings]);

  // Count future lessons only (for badge display)
  const futureLessonsCount = useMemo(() => {
    const now = new Date();
    return lessonBookings.filter((b) => {
      const date = b.date ? parseISO(b.date) : null;
      return date && (isFuture(date) || isToday(date));
    }).length;
  }, [lessonBookings]);

  // Count future + today matches only (for badge display)
  const futureMatchesCount = useMemo(() => {
    const now = new Date();
    return matchBookings.filter((b) => {
      const date = b.date ? parseISO(b.date) : null;
      return date && (isFuture(date) || isToday(date));
    }).length;
  }, [matchBookings]);

  // Count active time slots only (for badge display)
  const activeTimeSlotsCount = useMemo(() => {
    const now = new Date();
    return timeSlots.filter((slot) => {
      if (slot.selectedDates && slot.selectedDates.length > 0) {
        return slot.selectedDates.some((dateStr) => {
          const slotDate = new Date(dateStr);
          return slotDate >= startOfDay(now);
        });
      }
      if (slot.date) {
        const slotDate = parseISO(slot.date);
        return slotDate >= startOfDay(now);
      }
      return true;
    }).length;
  }, [timeSlots]);

  // Count bookings by filter (for filter badges)
  const filterCounts = useMemo(() => {
    const bookings = activeTab === 'lessons' ? lessonBookings : matchBookings;
    const now = new Date();

    const todayCount = bookings.filter((b) => {
      const date = b.date ? parseISO(b.date) : null;
      return date && isToday(date);
    }).length;

    const upcomingCount = bookings.filter((b) => {
      const date = b.date ? parseISO(b.date) : null;
      return date && isFuture(date); // Solo future, non oggi
    }).length;

    const pastCount = bookings.filter((b) => {
      const date = b.date ? parseISO(b.date) : null;
      return date && isPast(date) && !isToday(date);
    }).length;

    return {
      all: bookings.length,
      today: todayCount,
      upcoming: upcomingCount,
      past: pastCount,
    };
  }, [activeTab, lessonBookings, matchBookings]);

  // Apply date filter
  const filteredBookings = useMemo(() => {
    const bookings = activeTab === 'lessons' ? lessonBookings : matchBookings;
    const now = new Date();
    const todayStart = startOfDay(now);

    logger.debug('Filtering with', {
      filterDate,
      totalBookings: bookings.length,
      today: format(now, 'yyyy-MM-dd'),
    });

    switch (filterDate) {
      case 'today':
        const todayBookings = bookings.filter((b) => {
          // Log first 2 bookings to debug
          if (bookings.indexOf(b) < 2) {
            logger.debug('Checking booking', {
              id: b.id?.substring(0, 8),
              rawDate: b.date,
              dateType: typeof b.date,
              hasDate: !!b.date,
              allDateFields: {
                date: b.date,
                matchDate: b.matchDate,
                startDate: b.startDate,
              },
            });
          }

          const date = b.date ? parseISO(b.date) : null;
          const isDateToday = date && isToday(date);
          if (isDateToday) {
            logger.debug('✅ Today booking:', {
              id: b.id?.substring(0, 8),
              date: b.date,
              parsedDate: date ? format(date, 'yyyy-MM-dd') : null,
            });
          }
          return isDateToday;
        });
        logger.debug('📅 Today bookings found:', todayBookings.length);
        return todayBookings;

      case 'upcoming':
        const upcomingBookings = bookings.filter((b) => {
          const date = b.date ? parseISO(b.date) : null;
          const isDateUpcoming = date && isFuture(date); // Solo future, non oggi
          if (isDateUpcoming) {
            logger.debug('✅ Upcoming booking:', {
              id: b.id?.substring(0, 8),
              date: b.date,
              parsedDate: date ? format(date, 'yyyy-MM-dd') : null,
            });
          }
          return isDateUpcoming;
        });
        logger.debug('📅 Upcoming bookings found:', upcomingBookings.length);
        return upcomingBookings;

      case 'past':
        return bookings.filter((b) => {
          const date = b.date ? parseISO(b.date) : null;
          return date && isPast(date) && !isToday(date);
        });
      default:
        return bookings;
    }
  }, [activeTab, lessonBookings, matchBookings, filterDate]);

  // Format date for display
  const formatBookingDate = (dateString) => {
    if (!dateString) return 'Data non disponibile';
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return 'Oggi';
      if (isTomorrow(date)) return 'Domani';
      return format(date, 'EEEE d MMMM', { locale: it });
    } catch {
      return 'Data non valida';
    }
  };

  // Get booking status color
  const getStatusColor = (booking) => {
    if (booking.status === 'cancelled')
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (booking.status === 'confirmed') {
      const date = booking.date ? parseISO(booking.date) : null;
      if (date && isPast(date))
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400';
  };

  // Get status text
  const getStatusText = (booking) => {
    if (booking.status === 'cancelled') return 'Annullata';
    if (booking.status === 'confirmed') {
      const date = booking.date ? parseISO(booking.date) : null;
      if (date && isPast(date) && !isToday(date)) return 'Completata';
      return 'Confermata';
    }
    return 'In attesa';
  };

  // Handle slot form submission
  const handleSubmitSlot = async (e) => {
    e.preventDefault();
    try {
      const { createTimeSlot, updateTimeSlot } = await import('@services/time-slots.js');

      const slotData = {
        ...slotForm,
        instructorId: user.uid,
        instructorIds: [user.uid],
        available: true,
      };

      if (editingSlot) {
        await updateTimeSlot(clubId, editingSlot.id, slotData);
        logger.debug('✅ Slot updated:', editingSlot.id);
      } else {
        await createTimeSlot(clubId, slotData);
        logger.debug('✅ Slot created');
      }

      // Reset and reload
      setSlotForm({
        date: '',
        startTime: '',
        endTime: '',
        courtIds: [],
        maxParticipants: 1,
        price: 0,
        notes: '',
      });
      setShowAddSlotModal(false);
      setEditingSlot(null);

      const { getInstructorTimeSlots } = await import('@services/time-slots.js');
      const updatedSlots = await getInstructorTimeSlots(clubId, user.uid);
      setTimeSlots(updatedSlots);
    } catch (error) {
      logger.error('❌ Error saving slot:', error);
      showError('Errore nel salvare la fascia oraria. Riprova.');
    }
  };

  // Handle edit slot
  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setSlotForm({
      date: slot.date || '',
      startTime: slot.startTime || '',
      endTime: slot.endTime || '',
      courtIds: slot.courtIds || [],
      maxParticipants: slot.maxParticipants || 1,
      price: slot.price || 0,
      notes: slot.notes || '',
    });
    setShowAddSlotModal(true);
  };

  // Handle delete slot
  const handleDeleteSlot = async (slot) => {
    const confirmed = await confirm({
      title: 'Elimina fascia oraria',
      message: 'Sei sicuro di voler eliminare questa fascia oraria?',
      variant: 'danger',
      confirmText: 'Elimina',
      cancelText: 'Annulla',
    });

    if (!confirmed) return;

    try {
      // Usa la funzione corretta in base alla sorgente dello slot
      if (slot.source === 'lessonConfig') {
        const { deleteLessonConfigSlot } = await import('@services/time-slots.js');
        await deleteLessonConfigSlot(clubId, slot.id);
      } else {
        const { deleteTimeSlot } = await import('@services/time-slots.js');
        await deleteTimeSlot(clubId, slot.id);
      }

      const { getInstructorTimeSlots } = await import('@services/time-slots.js');
      const updatedSlots = await getInstructorTimeSlots(clubId, user.uid);
      setTimeSlots(updatedSlots);
    } catch (error) {
      logger.error('❌ Error deleting slot:', error);
      showError("Errore nell'eliminare la fascia oraria. Riprova.");
    }
  };

  // Handle toggle slot active status
  const handleToggleSlot = async (slot) => {
    const newStatus = slot.isActive === false ? true : false;
    const action = newStatus ? 'attivare' : 'disattivare';

    const confirmed = await confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} fascia oraria`,
      message: `Sei sicuro di voler ${action} questa fascia oraria?`,
      variant: 'warning',
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      cancelText: 'Annulla',
    });
    if (!confirmed) return;

    try {
      // Usa la funzione corretta in base alla sorgente dello slot
      if (slot.source === 'lessonConfig') {
        const { updateLessonConfigSlot } = await import('@services/time-slots.js');
        await updateLessonConfigSlot(clubId, slot.id, { isActive: newStatus });
      } else {
        const { updateTimeSlot } = await import('@services/time-slots.js');
        await updateTimeSlot(clubId, slot.id, { isActive: newStatus });
      }

      const { getInstructorTimeSlots } = await import('@services/time-slots.js');
      const updatedSlots = await getInstructorTimeSlots(clubId, user.uid);
      setTimeSlots(updatedSlots);
    } catch (error) {
      logger.error('❌ Error toggling slot:', error);
      showError(`Errore nel ${action} la fascia oraria. Riprova.`);
    }
  };

  // Stats for dashboard
  const stats = useMemo(() => {
    const now = new Date();

    // Today lessons (where user is instructor)
    const todayLessons = lessonBookings.filter((b) => {
      const date = b.date ? parseISO(b.date) : null;
      return date && isToday(date);
    }).length;

    // Today matches (where user is player)
    const todayMatches = matchBookings.filter((b) => {
      const date = b.date ? parseISO(b.date) : null;
      return date && isToday(date);
    }).length;

    // Upcoming lessons (where user is instructor)
    const upcomingLessons = lessonBookings.filter((b) => {
      const date = b.date ? parseISO(b.date) : null;
      return date && isFuture(date);
    }).length;

    // Upcoming matches (where user is player)
    const upcomingMatches = matchBookings.filter((b) => {
      const date = b.date ? parseISO(b.date) : null;
      return date && isFuture(date);
    }).length;

    return {
      todayLessons,
      todayMatches,
      upcomingLessons,
      upcomingMatches,
      totalSlots: activeTimeSlotsCount,
      activeSlots: timeSlots.filter((s) => s.available).length,
    };
  }, [lessonBookings, matchBookings, activeTimeSlotsCount, timeSlots]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 p-4">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-12 bg-white/60 dark:bg-gray-800/60 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white/60 dark:bg-gray-800/60 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-96 bg-white/60 dark:bg-gray-800/60 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900 p-3 sm:p-4 lg:p-6 pb-20 sm:pb-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Compatto */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10"></div>

          <div className="relative p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-md">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Dashboard Istruttore
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  {club?.name || 'Caricamento...'}
                </p>
              </div>
            </div>

            {/* Stats Grid Ottimizzato */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mt-4 sm:mt-6">
              <StatCard
                title="Lezioni Oggi"
                value={stats.todayLessons}
                icon="📚"
                color="from-indigo-500 to-blue-600"
              />
              <StatCard
                title="Partite Oggi"
                value={stats.todayMatches}
                icon="🎾"
                color="from-emerald-500 to-teal-600"
              />
              <StatCard
                title="Prossime Lezioni"
                value={stats.upcomingLessons}
                icon="📅"
                color="from-purple-500 to-pink-600"
              />
              <StatCard
                title="Prossime Partite"
                value={stats.upcomingMatches}
                icon="🏆"
                color="from-amber-500 to-orange-600"
              />
              <StatCard
                title="Fasce Attive"
                value={stats.totalSlots}
                icon="⏰"
                color="from-violet-500 to-purple-600"
              />
              <StatCard
                title="Slot Disponibili"
                value={stats.activeSlots}
                icon="✅"
                color="from-teal-500 to-cyan-600"
              />
            </div>
          </div>
        </div>

        {/* Main Content - Design Rinnovato */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800 overflow-hidden">
          {/* Tabs - In Unica Riga con Scroll Orizzontale */}
          <div className="border-b border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-800/30 px-3 sm:px-4 py-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {[
                { key: 'lessons', label: 'Lezioni', count: futureLessonsCount },
                { key: 'matches', label: 'Partite', count: futureMatchesCount },
                { key: 'schedule', label: 'Orari', count: activeTimeSlotsCount },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    activeTab === key
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    {label}
                    {count > 0 && (
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
                          activeTab === key
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 lg:p-6">
            {/* Filters (for lessons and matches tabs) - Ottimizzati */}
            {activeTab !== 'schedule' && (
              <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                {[
                  { key: 'today', label: 'Oggi' },
                  { key: 'upcoming', label: 'Prossime' },
                  { key: 'past', label: 'Passate' },
                  { key: 'all', label: 'Tutte' },
                ].map(({ key, label }) => {
                  const isActiveFilter = key === 'today' || key === 'upcoming';

                  return (
                    <button
                      key={key}
                      onClick={() => setFilterDate(key)}
                      className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                        filterDate === key
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {label}
                        {filterCounts[key] > 0 && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
                              filterDate === key
                                ? 'bg-white/20 text-white'
                                : isActiveFilter
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                  : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {filterCounts[key]}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {activeTab === 'schedule' ? (
              <div className="space-y-4 md:space-y-6">
                {/* Add Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSlotForm({
                        date: '',
                        startTime: '14:00',
                        endTime: '15:00',
                        courtIds: Array.isArray(club?.courts) ? club.courts.map((c) => c.id) : [],
                        maxParticipants: 5,
                        price: 0,
                        notes: '',
                      });
                      setEditingSlot(null);
                      setShowAddSlotModal(true);
                    }}
                    className="px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="hidden sm:inline">Nuova Fascia</span>
                    <span className="sm:hidden">Nuova</span>
                  </button>
                </div>

                {/* Time Slots List */}
                <TimeSlotsList
                  timeSlots={timeSlots}
                  onEdit={handleEditSlot}
                  onDelete={handleDeleteSlot}
                  onToggle={handleToggleSlot}
                />
              </div>
            ) : (
              <BookingsList
                bookings={filteredBookings}
                type={activeTab}
                onSelectBooking={(booking) => {
                  setSelectedBooking(booking);
                  setShowBookingModal(true);
                }}
                formatBookingDate={formatBookingDate}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            )}
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {showBookingModal && selectedBooking && (
        <Modal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedBooking(null);
          }}
          title={activeTab === 'lessons' ? 'Dettagli Lezione' : 'Dettagli Partita'}
          size="lg"
        >
          <BookingDetail booking={selectedBooking} type={activeTab} />
        </Modal>
      )}

      {/* Add/Edit Slot Modal */}
      {showAddSlotModal && (
        <SlotFormModal
          isOpen={showAddSlotModal}
          onClose={() => {
            setShowAddSlotModal(false);
            setEditingSlot(null);
            setSlotForm({
              date: '',
              startTime: '14:00',
              endTime: '15:00',
              courtIds: [],
              maxParticipants: 5,
              price: 0,
              notes: '',
            });
          }}
          slotForm={slotForm}
          setSlotForm={setSlotForm}
          onSubmit={handleSubmitSlot}
          editing={!!editingSlot}
          clubCourts={courts || []}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }) {
  return (
    <div className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-4 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
      {/* Gradient Overlay on Hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.08] transition-opacity duration-200`}
      ></div>

      <div className="relative">
        {/* Icon & Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl sm:text-2xl">{icon}</span>
        </div>

        {/* Value */}
        <div
          className={`text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-0.5 sm:mb-1`}
        >
          {value}
        </div>

        {/* Title */}
        <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium leading-tight">
          {title}
        </div>
      </div>
    </div>
  );
}

// Bookings List Component
function BookingsList({
  bookings,
  type,
  onSelectBooking,
  formatBookingDate,
  getStatusColor,
  getStatusText,
}) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          Nessuna {type === 'lessons' ? 'lezione' : 'partita'} trovata
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Le tue {type === 'lessons' ? 'lezioni' : 'partite'} appariranno qui
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      {bookings.map((booking) => (
        <button
          key={booking.id}
          onClick={() => onSelectBooking(booking)}
          className="group w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-indigo-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatBookingDate(booking.date)} {booking.time && `• ${booking.time}`}
              </div>
              {booking.courtName && (
                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {booking.courtName}
                </div>
              )}
            </div>
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(booking)}`}
            >
              {getStatusText(booking)}
            </div>
          </div>

          <div className="space-y-2">
            {type === 'lessons' && (
              <>
                {booking.lessonType && (
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Tipo:{' '}
                    <span className="font-medium">
                      {booking.lessonType === 'individual' ? 'Individuale' : 'Gruppo'}
                    </span>
                  </div>
                )}
                {booking.participants && (
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Partecipanti: <span className="font-medium">{booking.participants.length}</span>
                  </div>
                )}
              </>
            )}
            {type === 'matches' && (
              <>
                {booking.matchType && (
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Tipo: <span className="font-medium">{booking.matchType}</span>
                  </div>
                )}
                {booking.participants &&
                  Array.isArray(booking.participants) &&
                  booking.participants.length > 0 && (
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Giocatori:{' '}
                      <span className="font-medium">
                        {booking.participants.map((p) => p.name || p.displayName).join(', ')}
                      </span>
                    </div>
                  )}
              </>
            )}
            {booking.price && (
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                €{booking.price}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

// Time Slots List Component
function TimeSlotsList({ timeSlots, onEdit, onDelete, onToggle }) {
  const { club } = useClub();
  const { user } = useAuth();
  const T = themeTokens();

  // Separate active and expired time slots
  const now = new Date();
  const activeTimeSlots = useMemo(() => {
    const active = timeSlots.filter((slot) => {
      if (slot.selectedDates && slot.selectedDates.length > 0) {
        return slot.selectedDates.some((dateStr) => {
          const slotDate = new Date(dateStr);
          return slotDate >= startOfDay(now);
        });
      }
      if (slot.date) {
        const slotDate = parseISO(slot.date);
        return slotDate >= startOfDay(now);
      }
      return true;
    });

    // Ordina dalla data più vicina alla più lontana
    return active.sort((a, b) => {
      let dateA, dateB;

      // Ottieni la data più vicina per lo slot A
      if (a.selectedDates && a.selectedDates.length > 0) {
        const futureDates = a.selectedDates
          .map((d) => new Date(d))
          .filter((d) => d >= startOfDay(now))
          .sort((x, y) => x - y);
        dateA = futureDates[0] || new Date(a.selectedDates[0]);
      } else if (a.date) {
        dateA = parseISO(a.date);
      } else {
        dateA = new Date(0); // Data molto lontana nel passato se non c'è data
      }

      // Ottieni la data più vicina per lo slot B
      if (b.selectedDates && b.selectedDates.length > 0) {
        const futureDates = b.selectedDates
          .map((d) => new Date(d))
          .filter((d) => d >= startOfDay(now))
          .sort((x, y) => x - y);
        dateB = futureDates[0] || new Date(b.selectedDates[0]);
      } else if (b.date) {
        dateB = parseISO(b.date);
      } else {
        dateB = new Date(0);
      }

      return dateA - dateB; // Ordina crescente (più vicina prima)
    });
  }, [timeSlots, now]);

  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-purple-500 dark:text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Nessuna fascia oraria configurata
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Aggiungi le tue fasce orarie per gestire le lezioni
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Clicca su "Crea Nuova Fascia" per iniziare
        </div>
      </div>
    );
  }

  const SlotCard = ({ slot, isExpired = false, onToggle }) => {
    let displayTitle = '';
    let dateInfo = '';

    if (slot.selectedDates && slot.selectedDates.length > 0) {
      const sortedDates = [...slot.selectedDates].sort();
      if (sortedDates.length === 1) {
        const date = new Date(sortedDates[0]);
        displayTitle = format(date, 'EEEE', { locale: it });
        dateInfo = format(date, 'dd/MM', { locale: it });
      } else {
        displayTitle = `${sortedDates.length} date`;
        dateInfo = sortedDates
          .slice(0, 2)
          .map((d) => format(new Date(d), 'dd/MM'))
          .join(', ');
        if (sortedDates.length > 2) dateInfo += '...';
      }
    } else if (slot.date) {
      const date = new Date(slot.date);
      displayTitle = format(date, 'EEEE', { locale: it });
      dateInfo = format(date, 'dd/MM', { locale: it });
    } else {
      displayTitle = 'Data non specificata';
    }

    return (
      <div
        className={`group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${isExpired ? 'opacity-60' : 'hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-600'} transition-all duration-300`}
      >
        {/* Decorative gradient bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isExpired ? 'from-gray-400 to-gray-500' : 'from-indigo-500 via-purple-500 to-pink-500'}`}
        ></div>

        <div className="p-4 sm:p-6">
          {/* Header with Date and Status */}
          <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${isExpired ? 'from-gray-400 to-gray-500' : 'from-indigo-500 to-purple-600'} rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 capitalize truncate">
                  {displayTitle}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{dateInfo}</p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              {/* Active/Expired Badge */}
              {!isExpired && slot.isActive !== false && (
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-bold rounded-full flex items-center gap-1 sm:gap-1.5">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="hidden sm:inline">Attiva</span>
                  <span className="sm:hidden">✓</span>
                </span>
              )}
              {isExpired && (
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs sm:text-sm font-bold rounded-full">
                  <span className="hidden sm:inline">Scaduta</span>
                  <span className="sm:hidden">✕</span>
                </span>
              )}

              {/* Disabled Badge */}
              {!isExpired && slot.isActive === false && (
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-bold rounded-full flex items-center gap-1 sm:gap-1.5">
                  <svg
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                  <span className="hidden sm:inline">Disattivata</span>
                  <span className="sm:hidden">Off</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
          {/* Orario */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-3 sm:p-4 border border-orange-200 dark:border-orange-700/30">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs sm:text-sm font-semibold text-orange-900 dark:text-orange-200">
                Orario
              </span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-orange-900 dark:text-orange-100">
              {slot.startTime} - {slot.endTime}
            </p>
          </div>

          {/* Maestro */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 sm:p-4 border border-green-200 dark:border-green-700/30">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-xs sm:text-sm font-semibold text-green-900 dark:text-green-200">
                Maestro
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-green-900 dark:text-green-100 truncate">
              {user?.displayName || 'Tu'}
            </p>
          </div>

          {/* Campi */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-3 sm:p-4 border border-purple-200 dark:border-purple-700/30 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="text-xs sm:text-sm font-semibold text-purple-900 dark:text-purple-200">
                Campi Selezionati
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {slot.courtIds && Array.isArray(slot.courtIds) && slot.courtIds.length > 0 ? (
                Array.isArray(club?.courts) ? (
                  club.courts
                    .filter((court) => slot.courtIds.includes(court.id))
                    .map((court) => (
                      <span
                        key={court.id}
                        className="px-2 py-0.5 sm:py-1 bg-purple-200 dark:bg-purple-800/50 text-purple-900 dark:text-purple-100 text-xs font-semibold rounded"
                      >
                        {court.name}
                      </span>
                    ))
                ) : (
                  <span className="text-xs sm:text-sm font-medium text-purple-900 dark:text-purple-100">
                    {slot.courtIds.length} {slot.courtIds.length === 1 ? 'campo' : 'campi'}
                  </span>
                )
              ) : (
                <span className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">
                  Nessun campo selezionato
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {(slot.maxBookings || slot.maxParticipants || slot.price > 0) && (
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {(slot.maxBookings || slot.maxParticipants) && (
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="whitespace-nowrap">
                  Max {slot.maxBookings || slot.maxParticipants}
                </span>
              </div>
            )}
            {slot.price > 0 && (
              <div className="flex items-center gap-1.5 font-semibold text-green-600 dark:text-green-400">
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                €{slot.price}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {slot.notes && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/30">
            <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100 break-words">
              {slot.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onEdit(slot)}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Modifica
          </button>
          {!isExpired && (
            <button
              onClick={() => onToggle(slot)}
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 ${
                slot.isActive === false
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-orange-500 hover:bg-orange-600'
              } text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base`}
            >
              {slot.isActive === false ? (
                <>
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Attiva</span>
                  <span className="sm:hidden">ON</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                  <span className="hidden sm:inline">Disattiva</span>
                  <span className="sm:hidden">Off</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={() => onDelete(slot)}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span className="hidden sm:inline">Elimina</span>
            <span className="sm:hidden">Del</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Active Time Slots */}
      {activeTimeSlots.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
              <span className="hidden sm:inline">Fasce Orarie</span>
              <span className="sm:hidden">Fasce</span>
            </h3>
            <span className="px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs sm:text-sm font-bold rounded-full">
              {activeTimeSlots.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {activeTimeSlots.map((slot) => (
              <SlotCard key={slot.id} slot={slot} onToggle={onToggle} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Nessuna fascia oraria attiva</p>
        </div>
      )}
    </div>
  );
}

// Booking Detail Component
function BookingDetail({ booking, type }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Data</div>
          <div className="font-medium text-gray-900 dark:text-white">
            {booking.date && format(parseISO(booking.date), 'd MMMM yyyy', { locale: it })}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ora</div>
          <div className="font-medium text-gray-900 dark:text-white">{booking.time || 'N/A'}</div>
        </div>
        {booking.courtName && (
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Campo</div>
            <div className="font-medium text-gray-900 dark:text-white">{booking.courtName}</div>
          </div>
        )}
        {booking.duration && (
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Durata</div>
            <div className="font-medium text-gray-900 dark:text-white">{booking.duration} min</div>
          </div>
        )}
      </div>

      {booking.participants && booking.participants.length > 0 && (
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Partecipanti</div>
          <div className="space-y-2">
            {booking.participants.map((participant, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {(participant.name || participant.displayName || 'U')[0].toUpperCase()}
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {participant.name || participant.displayName || 'Utente'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {booking.price && (
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Prezzo</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            €{booking.price}
          </div>
        </div>
      )}

      {booking.notes && (
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Note</div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-gray-900 dark:text-white">
            {booking.notes}
          </div>
        </div>
      )}
    </div>
  );
}

// Slot Form Modal Component
function SlotFormModal({ isOpen, onClose, slotForm, setSlotForm, onSubmit, editing, clubCourts }) {
  const T = themeTokens();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Calendar functionality
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < (startDay === 0 ? 6 : startDay - 1); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        dateStr,
        isSelected: slotForm.date === dateStr,
        isPast: new Date(dateStr) < new Date().setHours(0, 0, 0, 0),
      });
    }

    return days;
  };

  const selectDate = (dateStr) => {
    setSlotForm((prev) => ({ ...prev, date: dateStr }));
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const monthNames = [
    'Gennaio',
    'Febbraio',
    'Marzo',
    'Aprile',
    'Maggio',
    'Giugno',
    'Luglio',
    'Agosto',
    'Settembre',
    'Ottobre',
    'Novembre',
    'Dicembre',
  ];

  const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!slotForm.startTime || !slotForm.endTime) {
      showWarning('Inserisci orario di inizio e fine');
      return;
    }

    if (slotForm.startTime >= slotForm.endTime) {
      showWarning("L'orario di fine deve essere dopo quello di inizio");
      return;
    }

    if (!slotForm.date) {
      showWarning('Seleziona una data dal calendario');
      return;
    }

    if (!slotForm.courtIds || slotForm.courtIds.length === 0) {
      showWarning('Seleziona almeno un campo');
      return;
    }

    onSubmit(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? 'Modifica Fascia Oraria' : 'Crea nuova fascia oraria'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Data
          </label>
          <input
            type="date"
            value={slotForm.date}
            onChange={(e) => setSlotForm((prev) => ({ ...prev, date: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full p-3 ${T.cardBg} ${T.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${T.text} text-base`}
            required
          />
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Orario Inizio
            </label>
            <select
              value={slotForm.startTime}
              onChange={(e) => setSlotForm((prev) => ({ ...prev, startTime: e.target.value }))}
              className={`w-full p-3 ${T.cardBg} ${T.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${T.text} text-base`}
              required
            >
              <option value="">Seleziona...</option>
              {Array.from({ length: 48 }, (_, i) => {
                const hour = Math.floor(i / 2) + 6;
                const minutes = (i % 2) * 30;
                if (hour >= 24) return null;
                const time = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                return (
                  <option key={time} value={time}>
                    {time}
                  </option>
                );
              }).filter(Boolean)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Orario Fine
            </label>
            <select
              value={slotForm.endTime}
              onChange={(e) => setSlotForm((prev) => ({ ...prev, endTime: e.target.value }))}
              className={`w-full p-3 ${T.cardBg} ${T.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${T.text} text-base`}
              required
            >
              <option value="">Seleziona...</option>
              {Array.from({ length: 48 }, (_, i) => {
                const hour = Math.floor(i / 2) + 6;
                const minutes = (i % 2) * 30;
                if (hour >= 24) return null;
                const time = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                return (
                  <option key={time} value={time}>
                    {time}
                  </option>
                );
              }).filter(Boolean)}
            </select>
          </div>
        </div>

        {/* Istruttore (Hidden - always current user, just display) */}
        <div className={`p-3 rounded-lg ${T.cardBg} border-l-4 border-green-500`}>
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Istruttore</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Tu</p>
            </div>
          </div>
        </div>

        {/* Court Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Campi
          </label>
          <div
            className={`space-y-2 border rounded-lg p-3 ${T.border} ${T.cardBg} max-h-48 overflow-y-auto`}
          >
            {clubCourts && clubCourts.length > 0 ? (
              clubCourts.map((court) => (
                <label
                  key={court.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={slotForm.courtIds?.includes(court.id) || false}
                    onChange={(e) => {
                      const { checked } = e.target;
                      setSlotForm((prev) => ({
                        ...prev,
                        courtIds: checked
                          ? [...(prev.courtIds || []), court.id]
                          : (prev.courtIds || []).filter((id) => id !== court.id),
                      }));
                    }}
                    className="rounded text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 w-5 h-5"
                  />
                  <span className="font-medium text-gray-900 dark:text-gray-100 text-base">
                    {court.name || `Campo ${court.id}`}
                  </span>
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                Nessun campo disponibile
              </p>
            )}
          </div>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg border ${T.border}">
          <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Attiva</label>
          <input
            type="checkbox"
            checked={slotForm.active !== false}
            onChange={(e) => setSlotForm((prev) => ({ ...prev, active: e.target.checked }))}
            className="rounded text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 w-6 h-6"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-3 px-4 ${T.cardBg} ${T.border} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${T.text} font-semibold transition-colors text-base`}
          >
            Annulla
          </button>
          <button
            type="submit"
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors font-semibold text-base shadow-lg"
          >
            Crea
          </button>
        </div>
      </form>
    </Modal>
  );
}
