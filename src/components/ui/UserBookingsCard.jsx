// =============================================
// FILE: src/components/ui/UserBookingsCard.jsx
// =============================================
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BOOKING_CONFIG } from '@services/bookings.js';
import { updateBooking, getUserBookings, cancelBooking, initialize as initBookingService } from '@services/unified-booking-service.js';
import { getClub } from '@services/clubs.js';
import { useUserBookingsFast } from '@hooks/useBookingPerformance.js';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useNotifications } from '@contexts/NotificationContext.jsx';
import BookingDetailModal from '@ui/BookingDetailModal.jsx';
import { bookingEvents, BOOKING_EVENTS } from '@utils/bookingEvents.js';

// Memoized booking card component
const BookingCard = React.memo(({ booking, onBookingClick, courts, user, clubDetails }) => {
  const court = courts?.find((c) => c.id === booking.courtId);
  const bookingDate = new Date(booking.date);
  const isToday = bookingDate.toDateString() === new Date().toDateString();
  const isTomorrow = bookingDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

  // Get club details
  const club = clubDetails?.[booking.clubId];
  const clubLogo = club?.logoUrl || booking.clubLogo || '/icons/icon-192x192.png';
  const clubName = club?.name || booking.clubName || 'Sporting Cat';

  // Determina se è una prenotazione di lezione
  const isLessonBooking = booking.isLessonBooking || booking.type === 'lesson';

  const dayName = bookingDate.toLocaleDateString('it-IT', { weekday: 'short' });

  let dateLabel;
  if (isToday) {
    dateLabel = 'Oggi';
  } else if (isTomorrow) {
    dateLabel = 'Domani';
  } else {
    dateLabel = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${bookingDate.getDate()}/${(bookingDate.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  // Colori diversi per lezioni vs partite
  const cardColors = isLessonBooking
    ? {
        background: 'bg-gradient-to-br from-green-900/95 to-emerald-900/95',
        border: 'border-green-500/80',
        hoverBorder: 'hover:border-green-400/90',
        ring: 'ring-green-600/50',
        shadow: 'shadow-green-900/40',
        hoverShadow: 'hover:shadow-green-900/30',
      }
    : {
        background: 'bg-gray-800/95',
        border: 'border-gray-500/80',
        hoverBorder: 'hover:border-blue-400/90',
        ring: 'ring-gray-600/50',
        shadow: 'shadow-gray-900/40',
        hoverShadow: 'hover:shadow-blue-900/30',
      };

  return (
    <div
      onClick={() => onBookingClick(booking)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onBookingClick(booking);
        }
      }}
      role="button"
      tabIndex={0}
      className="relative group min-w-[280px] h-36 sm:min-w-0 sm:h-auto flex-shrink-0 sm:flex-shrink transform hover:scale-[1.02] transition-all duration-300 cursor-pointer"
    >
      {/* Glow Effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${isLessonBooking ? 'from-green-500 to-emerald-500' : 'from-blue-600 to-indigo-600'} rounded-2xl blur opacity-40 group-hover:opacity-80 transition duration-500`}></div>

      {/* Card Content */}
      <div className={`relative h-full flex flex-row p-3 rounded-2xl ${cardColors.background} backdrop-blur-xl border-2 ${cardColors.border} hover:bg-gray-800 ${cardColors.hoverBorder} shadow-xl ${cardColors.shadow} ring-1 ${cardColors.ring}`}>
      {/* Left Side: Players List */}
      <div className="w-1/2 flex flex-col justify-center border-r border-gray-500/50 pr-2 space-y-1.5">
        {/* Players List & Empty Slots */}
        {Array.from({ length: 4 }).map((_, idx) => {
          const player = booking.players && booking.players[idx];
          
          if (player) {
             const hasPhoto = typeof player !== 'string' && player.photoURL;
             const displayName = typeof player === 'string' ? player : (player.name || 'Giocatore');
             const initials = typeof player === 'string' ? player.charAt(0).toUpperCase() : (player.name?.charAt(0).toUpperCase() || 'G');

             return (
               <div key={idx} className="flex items-center gap-2">
                 {hasPhoto ? (
                   <img 
                     src={player.photoURL} 
                     alt={displayName}
                     className="w-6 h-6 rounded-full object-cover border border-white/10 flex-shrink-0"
                     onError={(e) => {
                       e.target.onerror = null;
                       e.target.src = `https://ui-avatars.com/api/?name=${displayName}&background=random&color=fff`;
                     }}
                   />
                 ) : (
                   <div className={`w-6 h-6 rounded-full ${idx === 0 ? (isLessonBooking ? 'bg-green-500' : 'bg-blue-500') : 'bg-gray-600'} flex items-center justify-center text-[10px] font-bold text-white border border-white/10 flex-shrink-0`}>
                     {initials}
                   </div>
                 )}
                 <span className={`text-[10px] ${idx === 0 ? 'text-gray-200' : 'text-gray-400'} truncate font-medium leading-tight`}>
                   {displayName}
                 </span>
               </div>
             );
          } else {
             // Empty slot
             return (
               <div key={idx} className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-gray-800/50 border border-dashed border-gray-500/80 flex items-center justify-center text-[10px] text-gray-500 flex-shrink-0">
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                 </div>
                 <span className="text-[10px] text-gray-500 truncate font-medium leading-tight italic">
                   Libero
                 </span>
               </div>
             );
          }
        })}
        
        {/* More players indicator */}
        {booking.players && booking.players.length > 4 && (
           <div className="text-[9px] text-gray-500 pl-8">
             +{booking.players.length - 4} altri
           </div>
        )}
      </div>

      {/* Right Side: Info */}
      <div className="flex-1 flex flex-col justify-between pl-3 py-0.5 items-end text-right">
        {/* Top: Club Info */}
        <div className="flex items-center gap-2 justify-end">
           <span className="text-xs font-bold text-white truncate">
             {clubName.replace(/club/i, '').trim()}
           </span>
           <div className="w-6 h-6 rounded-full bg-white p-0.5 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
              <img 
                src={clubLogo} 
                alt="Club" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = '/icons/icon-192x192.png';
                }} 
              />
           </div>
        </div>

        {/* Middle: Court & Duration */}
        <div className="flex flex-col items-end justify-center flex-grow">
           <span className="text-xs font-medium text-gray-300 truncate">
             {isLessonBooking
              ? `${booking.lessonType || 'Lezione'}`
              : `${booking.courtName || court?.name || 'Campo'}`}
           </span>
           <span className="text-sm font-bold text-gray-200 mt-0.5">
             {booking.duration || 90} min
           </span>
        </div>

        {/* Bottom: Date & Time */}
        <div className="mt-auto flex flex-col items-end">
           <div className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider mb-0.5">
             {dateLabel}
           </div>
           <div className="flex items-center gap-2">
             {/* Status Dot */}
             <div className={`w-2 h-2 rounded-full ${isToday ? 'bg-green-500' : 'bg-gray-600'}`}></div>
             <span className="text-2xl font-bold text-white leading-none">
               {booking.time.substring(0, 5)}
             </span>
           </div>
        </div>
      </div>
      </div>
    </div>
  );
});

// Provide an explicit display name for better debugging and to satisfy lint rules
BookingCard.displayName = 'BookingCard';

export default function UserBookingsCard({ user, state, T, compact: _compact, onBookNow }) {
  console.log('📅 [UserBookingsCard] Mounting with user:', user?.uid || 'no user');

  // Ensure booking service is initialized with cloud storage enabled
  useEffect(() => {
    initBookingService({ cloudEnabled: true });
  }, []);

  const { showSuccess, showError, confirm } = useNotifications();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [lessonBookings, setLessonBookings] = useState([]);
  const [lessonLoading, setLessonLoading] = useState(false);
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const mountedRef = useRef(true);
  const [clubDetails, setClubDetails] = useState({});

  // Use high-performance booking hook per le prenotazioni dei campi
  const {
    bookings: courtBookings,
    loading: courtLoading,
    refresh: refreshCourts,
  } = useUserBookingsFast({
    refreshInterval: 30000, // 30 seconds
    enableBackground: true,
  });

  // Carica le prenotazioni delle lezioni
  const loadLessonBookings = useCallback(async () => {
    if (!authUser || !mountedRef.current) return;

    setLessonLoading(true);
    try {
      const lessons = await getUserBookings(authUser, { lessonOnly: false });
      if (mountedRef.current) {
        setLessonBookings(lessons || []);
      }
    } catch (error) {
      console.error('❌ [UserBookingsCard] Error loading lesson bookings:', error);
      if (mountedRef.current) {
        setLessonBookings([]);
      }
    } finally {
      if (mountedRef.current) {
        setLessonLoading(false);
      }
    }
  }, [authUser]);

  // Load lesson bookings on mount and when authUser changes
  useEffect(() => {
    loadLessonBookings();
  }, [loadLessonBookings]);

  // Funzione di refresh combinata
  const refresh = useCallback(async () => {
    // Refresh courts
    refreshCourts();

    // Refresh lessons
    await loadLessonBookings();
  }, [refreshCourts, loadLessonBookings]);

  // Listen for booking service events to auto-refresh data
  useEffect(() => {
    const handleBookingUpdate = (_data) => {
      if (mountedRef.current && _data?.id) {
        console.log('🔄 [UserBookingsCard] Booking updated, refreshing data:', _data.id);
        // Refresh both court and lesson bookings
        refreshCourts();
        if (authUser) {
          loadLessonBookings();
        }
      }
    };

    const handleBookingCreate = (_booking) => {
      if (mountedRef.current) {
        console.log('➕ [UserBookingsCard] New booking created, refreshing data');
        refreshCourts();
        if (authUser) {
          loadLessonBookings();
        }
      }
    };

    const handleBookingDelete = (data) => {
      if (mountedRef.current && data?.id) {
        console.log('🗑️ [UserBookingsCard] Booking deleted, refreshing data:', data.id);
        refreshCourts();
        if (authUser) {
          loadLessonBookings();
        }
      }
    };

    const handleBookingRefresh = () => {
      if (mountedRef.current) {
        console.log('🔄 [UserBookingsCard] Manual refresh triggered');
        refreshCourts();
        if (authUser) {
          loadLessonBookings();
        }
      }
    };

    // Subscribe to booking events using centralized event emitter
    bookingEvents.on(BOOKING_EVENTS.BOOKING_UPDATED, handleBookingUpdate);
    bookingEvents.on(BOOKING_EVENTS.BOOKING_CREATED, handleBookingCreate);
    bookingEvents.on(BOOKING_EVENTS.BOOKING_DELETED, handleBookingDelete);
    bookingEvents.on(BOOKING_EVENTS.BOOKINGS_REFRESH, handleBookingRefresh);

    return () => {
      bookingEvents.off(BOOKING_EVENTS.BOOKING_UPDATED, handleBookingUpdate);
      bookingEvents.off(BOOKING_EVENTS.BOOKING_CREATED, handleBookingCreate);
      bookingEvents.off(BOOKING_EVENTS.BOOKING_DELETED, handleBookingDelete);
      bookingEvents.off(BOOKING_EVENTS.BOOKINGS_REFRESH, handleBookingRefresh);
    };
  }, [authUser, loadLessonBookings, refreshCourts]);

  // Memoize courts lookup for performance
  const courts = useMemo(() => state?.courts || BOOKING_CONFIG.courts, [state?.courts]);

  // Memoized handlers
  const handleBookingClick = useCallback((booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedBooking(null);
  }, []);

  const handleShare = useCallback(
    async (booking) => {
      const isLesson = booking.isLessonBooking || booking.type === 'lesson';
      const shareText = isLesson
        ? `Prenotazione Lezione 🎾\n${booking.date} alle ${booking.time}\nTipo: ${booking.lessonType || 'Lezione'}\n${booking.instructor ? `Maestro: ${booking.instructor}` : ''}`
        : `Prenotazione Padel 🎾\n${booking.date} alle ${booking.time}\nCampo: ${courts.find((c) => c.id === booking.courtId)?.name || 'Padel 1'}\nGiocatori: ${booking.players?.join(', ') || 'Da definire'}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: isLesson ? 'Prenotazione Lezione' : 'Prenotazione Padel',
            text: shareText,
          });
        } catch {
          console.log('Condivisione annullata');
        }
      } else {
        // Fallback per browser che non supportano Web Share API
        navigator.clipboard.writeText(shareText);
        alert('Dettagli prenotazione copiati negli appunti!');
      }
    },
    [courts]
  );

  const handleCancel = useCallback(
    async (booking) => {
      console.log('🗑️ [UserBookingsCard] Requesting cancellation for:', booking);
      
      const confirmed = await confirm({
        title: 'Cancella Prenotazione',
        message: 'Sei sicuro di voler cancellare questa prenotazione?',
        confirmText: 'Sì, cancella',
        cancelText: 'Annulla',
        variant: 'danger'
      });

      console.log('🗑️ [UserBookingsCard] Confirmation result:', confirmed);

      if (confirmed) {
        try {
          console.log('🗑️ [UserBookingsCard] Calling cancelBooking service...');
          console.log('   > Booking ID:', booking.id);
          console.log('   > User ID:', authUser?.uid);
          
          await cancelBooking(booking.id, authUser);
          
          console.log('✅ [UserBookingsCard] Cancellation successful');
          showSuccess('Prenotazione cancellata con successo');
          handleCloseModal();
          refresh();
        } catch (error) {
          console.error('❌ [UserBookingsCard] Cancellation error:', error);
          showError('Errore durante la cancellazione: ' + (error.message || 'Errore sconosciuto'));
        }
      }
    },
    [handleCloseModal, refresh, authUser, confirm, showSuccess, showError]
  );

  const handleEdit = useCallback(
    async (booking) => {
      // Se il booking ha solo cambiamenti ai giocatori, aggiorna direttamente
      if (booking.players && booking.id) {
        try {
          // Aggiorna solo i giocatori della prenotazione
          const updatedBooking = {
            ...selectedBooking,
            players: booking.players,
          };

          await updateBooking(booking.id, { players: booking.players }, authUser);

          // Aggiorna lo stato locale
          setSelectedBooking(updatedBooking);

          // Chiudi il modal prima del refresh per evitare conflitti
          handleCloseModal();

          // Piccolo delay per assicurarsi che il modal sia chiuso prima del refresh
          setTimeout(() => {
            refresh();
          }, 100);

          console.log('Prenotazione aggiornata con successo');
        } catch (error) {
          console.error("Errore durante l'aggiornamento:", error);
          alert('Errore durante il salvataggio delle modifiche');
        }
      } else {
        // Naviga alla pagina di gestione campi per modifiche più complesse
        navigate(`/admin-bookings?edit=${booking.id}`);
        handleCloseModal();
      }
    },
    [navigate, handleCloseModal, selectedBooking, refresh, authUser]
  );

  const handleReview = useCallback((booking) => {
    // TODO: Implementare sistema di recensioni
    console.log('Lascia recensione per:', booking);
    alert('Funzionalità di recensioni in arrivo!');
  }, []);

  // Combina le prenotazioni dei campi e delle lezioni - rimuovi duplicati
  const allBookings = useMemo(() => {
    const combined = [...(courtBookings || []), ...(lessonBookings || [])];
    console.log('📊 [UserBookingsCard] Merging bookings:', {
      court: courtBookings?.length || 0,
      lesson: lessonBookings?.length || 0,
      total: combined.length
    });

    // Remove duplicates based on ID, preferring the most recently updated booking
    const uniqueBookings = new Map();

    combined.forEach((booking) => {
      if (!booking?.id) return; // Skip invalid bookings

      const existingBooking = uniqueBookings.get(booking.id);
      const isLessonBooking =
        booking.instructorId || booking.isLessonBooking || booking.type === 'lesson';

      if (!existingBooking) {
        // First time seeing this booking
        uniqueBookings.set(booking.id, { ...booking, isLessonBooking });
      } else {
        // Booking already exists, prefer the one with more recent updatedAt
        const existingUpdatedAt = new Date(
          existingBooking.updatedAt || existingBooking.createdAt || 0
        );
        const currentUpdatedAt = new Date(booking.updatedAt || booking.createdAt || 0);

        if (currentUpdatedAt > existingUpdatedAt) {
          // Current booking is more recent, use it
          uniqueBookings.set(booking.id, { ...booking, isLessonBooking });
        } else if (isLessonBooking && !existingBooking.isLessonBooking) {
          // Prefer lesson booking if existing is not a lesson
          uniqueBookings.set(booking.id, { ...booking, isLessonBooking });
        }
        // Otherwise keep the existing one
      }
    });

    const result = Array.from(uniqueBookings.values());
    console.log('📊 [UserBookingsCard] Unique bookings after merge:', result.length);

    // Ordina per data e ora
    return result.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
  }, [courtBookings, lessonBookings]);

  const isLoading = courtLoading || lessonLoading;
  const hasBookings = allBookings.length > 0;

  // Filtra solo prenotazioni future
  const displayBookings = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

    console.log('🔍 [UserBookingsCard] Filtering bookings:', {
      total: allBookings.length,
      todayStr,
      currentTimeMinutes
    });

    const filtered = allBookings.filter((booking) => {
      // Se la data è futura, mostrala
      if (booking.date > todayStr) return true;

      // Se la data è oggi, controlla l'orario
      if (booking.date === todayStr) {
        if (!booking.time) return true; // Se non c'è orario, mostrala

        const [hours, minutes] = booking.time.split(':').map(Number);
        const bookingTimeMinutes = hours * 60 + minutes;
        const bookingDuration = booking.duration || 90;
        const bookingEndMinutes = bookingTimeMinutes + bookingDuration;

        // Mostra solo se la prenotazione non è ancora finita
        return bookingEndMinutes > currentTimeMinutes;
      }

      // Se la data è passata, non mostrarla
      return false;
    });

    console.log('✅ [UserBookingsCard] Filtered bookings to display:', filtered.length);
    return filtered;
  }, [allBookings]);

  // Fetch club details for bookings
  useEffect(() => {
    const fetchClubDetails = async () => {
      if (!displayBookings.length) return;

      const uniqueClubIds = [...new Set(displayBookings.map(b => b.clubId).filter(Boolean))];
      // Add default club if needed
      if (uniqueClubIds.length === 0) uniqueClubIds.push('sporting-cat');

      const newDetails = { ...clubDetails };
      let hasChanges = false;

      for (const clubId of uniqueClubIds) {
        if (!newDetails[clubId]) {
          try {
            const club = await getClub(clubId);
            newDetails[clubId] = club;
            hasChanges = true;
          } catch (error) {
            console.error(`Error fetching club details for ${clubId}:`, error);
            // Fallback for default club
            if (clubId === 'sporting-cat') {
               newDetails[clubId] = { name: 'Sporting Cat', logoUrl: '/icons/icon-192x192.png' };
               hasChanges = true;
            }
          }
        }
      }

      if (hasChanges && mountedRef.current) {
        setClubDetails(newDetails);
      }
    };

    fetchClubDetails();
  }, [displayBookings]);

  // Early return per performance - no loading skeleton if we have cached data
  if (!user) {
    return (
      <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-700/90 backdrop-blur-xl border-2 border-blue-700/40 p-6 rounded-3xl shadow-xl shadow-blue-900/30">
        <div className="text-center">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="font-semibold mb-2 text-white">
            Accedi per vedere le prenotazioni
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Effettua il login per gestire le tue prenotazioni
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Accedi
          </button>
        </div>
      </div>
    );
  }

  // Show loading only when actually loading and no bookings
  if (isLoading && displayBookings.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-700/90 backdrop-blur-xl border-2 border-blue-700/40 p-6 rounded-3xl shadow-xl shadow-blue-900/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📅</div>
            <div>
              <div className="h-5 bg-gray-600/60 rounded-lg w-32 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-600/60 rounded-lg w-24 animate-pulse"></div>
            </div>
          </div>
          <div className="h-6 w-8 bg-gray-600/60 rounded-lg animate-pulse"></div>
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-700/90 backdrop-blur-sm p-4 rounded-xl border-2 border-gray-600/40 animate-pulse shadow-lg shadow-gray-900/30 ring-1 ring-gray-700/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-600/60 rounded-lg w-20 mb-2"></div>
                  <div className="h-3 bg-gray-600/60 rounded-lg w-32"></div>
                </div>
                <div className="text-right">
                  <div className="h-3 bg-gray-600/60 rounded-lg w-8 mb-1"></div>
                  <div className="h-3 bg-gray-600/60 rounded-lg w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-700/20">
          <div className="h-10 bg-gray-600/60 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!hasBookings && !isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-700/90 backdrop-blur-xl border-2 border-blue-700/40 p-6 rounded-3xl shadow-xl shadow-blue-900/30">
        <div className="text-center">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="font-semibold mb-2 text-white">Nessuna Prenotazione</h3>
          <p className="text-sm text-gray-400 mb-4">Non hai prenotazioni attive</p>
          <button
            onClick={onBookNow || (() => navigate('/booking'))}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Prenota Ora
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header con indicatore di aggiornamento */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" strokeWidth={1.5} />
              <path d="M8 3v4M16 3v4M3 9h18" strokeWidth={1.5} />
            </svg>
          </div>
          Le Tue Prenotazioni
        </h3>
        {isLoading && (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-100"></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-200"></div>
          </div>
        )}
      </div>

      {/* Scroll orizzontale ultra-compatto - stile Playtomic */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 w-max sm:grid sm:grid-cols-1 sm:gap-3 sm:w-full">
          {displayBookings.map((booking, index) => {
            // Crea una key unica combinando il tipo di prenotazione, l'ID e l'indice
            const bookingType =
              booking.isLessonBooking || booking.type === 'lesson' ? 'lesson' : 'court';
            const uniqueKey = `${bookingType}-${booking.id}-${index}-${booking.date}-${booking.time}`;

            return (
              <BookingCard
                key={uniqueKey}
                booking={booking}
                onBookingClick={handleBookingClick}
                courts={courts}
                user={user}
                clubDetails={clubDetails}
              />
            );
          })}

          {/* Card "Prenota nuovo" ultra-compatta */}
          <div
            onClick={onBookNow || (() => navigate('/booking'))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                (onBookNow || (() => navigate('/booking')))();
              }
            }}
            role="button"
            tabIndex={0}
            className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 
              hover:from-blue-800/60 hover:to-blue-700/60
              backdrop-blur-sm border-2 border-dashed border-blue-400/80 rounded-2xl cursor-pointer
              min-w-[240px] h-32 flex-shrink-0 flex flex-col items-center justify-center
              transition-all duration-300 hover:border-blue-300 group
              hover:shadow-xl hover:shadow-blue-900/30 transform hover:scale-[1.02]
              ring-1 ring-blue-500/60"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-blue-300 text-center">
              Prenota Campo
            </span>
          </div>
        </div>
      </div>

      {/* Indicatori scroll minimalisti */}
      {displayBookings.length > 0 && (
        <div className="flex justify-center mt-3 sm:hidden">
          <div className="flex gap-1">
            {displayBookings.slice(0, Math.min(6, displayBookings.length)).map((_, index) => (
              <div key={index} className="w-1 h-1 rounded-full bg-gray-600/60"></div>
            ))}
            {displayBookings.length > 6 && <div className="w-1 h-1 rounded-full bg-blue-500"></div>}
          </div>
        </div>
      )}

      {/* Tasto Nuova Prenotazione solo su desktop */}
      <div className="hidden sm:block mt-4 pt-4 border-t border-gray-700/20">
        <button
          onClick={() => navigate('/booking')}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          Nuova Prenotazione
        </button>
      </div>

      {/* Modal per dettaglio prenotazione */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        state={state}
        T={T}
        onShare={handleShare}
        onCancel={handleCancel}
        onEdit={handleEdit}
        onReview={handleReview}
      />
    </>
  );
}
