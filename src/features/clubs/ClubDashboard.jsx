import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
import { LoadingSpinner } from '@components/LoadingSpinner.jsx';
import BookingDetailModal from '@ui/BookingDetailModal.jsx';
import { updateBooking } from '@services/bookings.js';
import { trackClubView } from '@services/club-analytics.js';

// Lazy load InstructorDashboard
const InstructorDashboard = React.lazy(
  () => import('@features/instructor/InstructorDashboard.jsx')
);

const QuickActionCard = ({ title, description, icon, onClick, gradient, iconBg }) => (
  <button
    onClick={onClick}
    className={
      'relative group overflow-hidden rounded-xl md:rounded-2xl p-3 md:p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl ' +
      gradient +
      ' border border-white/20 dark:border-gray-700/30'
    }
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative z-10">
      <div
        className={
          'w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl ' +
          iconBg +
          ' flex items-center justify-center mb-2 md:mb-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300'
        }
      >
        {icon}
      </div>
      <h3 className="text-sm md:text-xl font-bold text-white mb-1 md:mb-2">{title}</h3>
      <p className="text-xs md:text-sm text-white/80 leading-tight">{description}</p>
    </div>
    <div className="hidden md:block absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </button>
);

const ClubDashboard = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { club, loading: clubLoading, isUserInstructor } = useClub();
  const [activeBookings, setActiveBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Check if current user is instructor in this club
  const isInstructor = isUserInstructor(user?.uid);

  // Track club view quando l'utente accede alla dashboard
  useEffect(() => {
    if (user && clubId && club) {
      console.log('📊 [ClubDashboard] Tracking club view:', { clubId, clubName: club.name });
      trackClubView(user.uid, clubId, club.name);
    }
  }, [user, clubId, club]);

  useEffect(() => {
    if (user && clubId) {
      const loadActiveBookings = async () => {
        setLoadingBookings(true);
        try {
          console.log('🔍 [ClubDashboard] Loading bookings for user in club:', {
            userId: user.uid,
            clubId,
          });

          // Usa il sistema di prenotazioni unificate con multi-identificatore
          const { loadActiveUserBookings } = await import('@services/cloud-bookings.js');

          // Carica tutte le prenotazioni dell'utente (senza filtro per club)
          const allUserBookings = await loadActiveUserBookings(user.uid, undefined, {
            displayName: user.displayName,
            email: user.email,
          });

          console.log('📊 [ClubDashboard] All user bookings loaded:', allUserBookings.length);

          // Filtra per prenotazioni future solo (incluso oggi attivo)
          const now = new Date();
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const futureBookings = allUserBookings.filter((booking) => {
            const bookingDate = new Date(booking.date);
            const isToday = bookingDate.toDateString() === today.toDateString();
            const isFuture = bookingDate > today;

            if (isFuture) return true;

            // Per oggi, controlla se l'orario della prenotazione è ancora attivo
            if (isToday && booking.time) {
              const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
              return bookingDateTime > now;
            }

            return false;
          });

          console.log('🎯 [ClubDashboard] Future bookings only:', futureBookings.length);

          // Filtra per questo club specifico
          const clubBookings = futureBookings.filter((booking) => booking.clubId === clubId);

          console.log('✅ [ClubDashboard] Filtered bookings for this club:', clubBookings.length);

          setActiveBookings(clubBookings);
        } catch (error) {
          console.error('❌ [ClubDashboard] Error loading active bookings:', error);
        } finally {
          setLoadingBookings(false);
        }
      };
      loadActiveBookings();
    }
  }, [user, clubId]);

  // Handler per chiudere il modal
  const handleCloseModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedBooking(null);
  }, []);

  // Handler per ricaricare le prenotazioni
  const refreshBookings = useCallback(async () => {
    if (user && clubId) {
      setLoadingBookings(true);
      try {
        console.log('🔄 [ClubDashboard] Refreshing bookings for user in club:', {
          userId: user.uid,
          clubId,
        });

        // Usa il sistema di prenotazioni unificate con multi-identificatore
        const { loadActiveUserBookings } = await import('@services/cloud-bookings.js');

        // Carica tutte le prenotazioni dell'utente
        const allUserBookings = await loadActiveUserBookings(user.uid, undefined, {
          displayName: user.displayName,
          email: user.email,
        });

        // Filtra per prenotazioni future solo (incluso oggi attivo)
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const futureBookings = allUserBookings.filter((booking) => {
          const bookingDate = new Date(booking.date);
          const isToday = bookingDate.toDateString() === today.toDateString();
          const isFuture = bookingDate > today;

          if (isFuture) return true;

          // Per oggi, controlla se l'orario della prenotazione è ancora attivo
          if (isToday && booking.time) {
            const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
            return bookingDateTime > now;
          }

          return false;
        });

        // Filtra per questo club specifico
        const clubBookings = futureBookings.filter((booking) => booking.clubId === clubId);

        console.log('✅ [ClubDashboard] Refreshed bookings for this club:', clubBookings.length);

        setActiveBookings(clubBookings);
      } catch (error) {
        console.error('❌ [ClubDashboard] Error refreshing bookings:', error);
      } finally {
        setLoadingBookings(false);
      }
    }
  }, [user, clubId]);

  // Handler per condivisione
  const handleShare = useCallback(async (booking) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Prenotazione PlaySport',
          text: `Ho prenotato il ${booking.date} alle ${booking.time}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    }
  }, []);

  // Handler per cancellazione
  const handleCancel = useCallback(
    async (booking) => {
      if (!confirm('Sei sicuro di voler cancellare questa prenotazione?')) return;

      try {
        await updateBooking(booking.id, { status: 'cancelled' });
        await refreshBookings();
        handleCloseModal();
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Errore nella cancellazione della prenotazione');
      }
    },
    [refreshBookings, handleCloseModal]
  );

  // Handler per modifica
  const handleEdit = useCallback(
    (booking) => {
      navigate(`/club/${clubId}/booking/${booking.id}/edit`);
      handleCloseModal();
    },
    [navigate, clubId, handleCloseModal]
  );

  // Handler per recensione
  const handleReview = useCallback(
    (booking) => {
      navigate(`/club/${clubId}/bookings/${booking.id}/review`);
      handleCloseModal();
    },
    [navigate, clubId, handleCloseModal]
  );

  if (clubLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Club non trovato
          </h1>
          <button
            onClick={() => navigate('/clubs/search')}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Cerca altri club
          </button>
        </div>
      </div>
    );
  }

  // If user is instructor, show InstructorDashboard
  if (isInstructor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 p-2">
        <React.Suspense
          fallback={
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl animate-pulse">
              <div className="h-8 bg-gray-200/80 dark:bg-gray-600/60 rounded w-64 mb-6"></div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-200/60 dark:bg-gray-600/40 rounded-2xl"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-200/60 dark:bg-gray-600/40 rounded-2xl"></div>
            </div>
          }
        >
          <InstructorDashboard />
        </React.Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 py-4 md:py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div className="hidden lg:block text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{club.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            📍 {club.location?.city}, {club.location?.region}
          </p>
        </div>
        {/* Le Tue Prenotazioni - Stile Compatto con Scroll Orizzontale */}
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-white"
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
            </div>
            Le Tue Prenotazioni
            {loadingBookings && (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse delay-100"></div>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse delay-200"></div>
              </div>
            )}
          </h2>

          {loadingBookings ? (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8">
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl animate-pulse"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
                      </div>
                      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeBookings.length > 0 ? (
            <>
              {/* Scroll orizzontale ultra-compatto - stile Playtomic */}
              <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex gap-2 w-max md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-3 md:w-full">
                  {activeBookings.map((booking) => {
                    const bookingDate = new Date(booking.date);
                    const isToday = bookingDate.toDateString() === new Date().toDateString();
                    const isTomorrow =
                      bookingDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
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

                    const cardColors = isLessonBooking
                      ? {
                          background:
                            'bg-gradient-to-br from-green-50/95 to-emerald-50/95 dark:from-green-900/95 dark:to-emerald-900/95',
                          border: 'border-green-300/80 dark:border-green-500/80',
                          hoverBorder: 'hover:border-green-400/90 dark:hover:border-green-400/90',
                          ring: 'ring-green-300/50 dark:ring-green-600/50',
                          shadow: 'shadow-green-200/60 dark:shadow-green-900/40',
                          hoverShadow: 'hover:shadow-green-200/40 dark:hover:shadow-green-900/30',
                        }
                      : {
                          background: 'bg-white/95 dark:bg-gray-800/95',
                          border: 'border-gray-300/80 dark:border-gray-500/80',
                          hoverBorder: 'hover:border-blue-400/90 dark:hover:border-blue-400/90',
                          ring: 'ring-gray-300/50 dark:ring-gray-600/50',
                          shadow: 'shadow-gray-200/60 dark:shadow-gray-900/40',
                          hoverShadow: 'hover:shadow-blue-200/40 dark:hover:shadow-blue-900/30',
                        };

                    return (
                      <div
                        key={booking.id}
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetailModal(true);
                        }}
                        className={`${cardColors.background} backdrop-blur-xl border-2 ${cardColors.border}
                          hover:bg-white dark:hover:bg-gray-800 ${cardColors.hoverBorder}
                          hover:shadow-2xl ${cardColors.hoverShadow}
                          p-4 rounded-2xl cursor-pointer transition-all duration-300 group
                          min-w-[240px] h-32 md:min-w-0 md:h-auto flex-shrink-0 md:flex-shrink
                          transform hover:scale-[1.02] flex flex-col justify-between
                          shadow-xl ${cardColors.shadow} ring-1 ${cardColors.ring}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-1">
                              {dateLabel}
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1">
                              {booking.time.substring(0, 5)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {isLessonBooking
                                ? `${booking.lessonType || 'Lezione'} • ${booking.duration || 60}min`
                                : `${booking.courtName || 'Campo'} • ${booking.duration || 60}min`}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {isToday && <div className="w-2 h-2 bg-orange-400 rounded-full"></div>}
                            {isLessonBooking && (
                              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-2 h-2 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-gray-600 dark:text-gray-400 truncate mb-1">
                              {isLessonBooking ? (
                                <>
                                  {booking.instructor && (
                                    <span>
                                      Maestro: {booking.instructorName || booking.instructor}
                                    </span>
                                  )}
                                  {booking.lessonType && !booking.instructor && (
                                    <span>
                                      {booking.lessonType === 'individual'
                                        ? 'Individuale'
                                        : 'Gruppo'}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  {booking.players && booking.players.length > 0 ? (
                                    <span>{booking.players.length + 1}/4 giocatori</span>
                                  ) : (
                                    <span>Prenotazione campo</span>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="flex -space-x-0.5">
                              <div
                                className={`w-5 h-5 rounded-full ${isLessonBooking ? 'bg-green-500' : 'bg-blue-500'} flex items-center justify-center text-xs font-bold text-white border border-white`}
                              >
                                <span className="text-[9px]">
                                  {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              {isLessonBooking ? (
                                booking.instructor && (
                                  <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-white border border-white">
                                    <svg
                                      className="w-3 h-3 text-white"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.84l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                    </svg>
                                  </div>
                                )
                              ) : (
                                <>
                                  {(booking.players?.length || 0) > 0 && (
                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold text-white border border-white">
                                      <span className="text-[8px]">+{booking.players.length}</span>
                                    </div>
                                  )}
                                  {(booking.players?.length || 0) + 1 < 4 && (
                                    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 border border-white dark:border-gray-700 flex items-center justify-center">
                                      <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full"></div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {booking.price && (
                              <div className="text-xs font-bold text-green-600 dark:text-green-400">
                                €{booking.price}
                              </div>
                            )}
                            <div className="text-[9px] text-gray-500 dark:text-gray-400">
                              {isLessonBooking
                                ? booking.status === 'confirmed'
                                  ? 'Confermata'
                                  : 'In attesa'
                                : (booking.players?.length || 0) + 1 < 4
                                  ? 'Aperta'
                                  : 'Completa'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div
                    onClick={() => navigate(`/club/${clubId}/booking`)}
                    className="bg-gradient-to-br from-blue-50/95 to-blue-100/95 dark:from-blue-900/50 dark:to-blue-800/50
                      hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/60 dark:hover:to-blue-700/60
                      backdrop-blur-sm border-2 border-dashed border-blue-500/90 dark:border-blue-400/80 rounded-2xl cursor-pointer
                      min-w-[240px] h-32 flex-shrink-0 flex flex-col items-center justify-center
                      transition-all duration-300 hover:border-blue-600 dark:hover:border-blue-300 group
                      hover:shadow-xl hover:shadow-blue-200/40 dark:hover:shadow-blue-900/30 transform hover:scale-[1.02]
                      ring-1 ring-blue-400/60 dark:ring-blue-500/60"
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
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300 text-center">
                      Prenota Campo
                    </span>
                  </div>
                </div>
              </div>
              {activeBookings.length > 0 && (
                <div className="flex justify-center mt-3 md:hidden">
                  <div className="flex gap-1">
                    {activeBookings.slice(0, Math.min(6, activeBookings.length)).map((_, index) => (
                      <div
                        key={index}
                        className="w-1 h-1 rounded-full bg-gray-300/60 dark:bg-gray-600/60"
                      ></div>
                    ))}
                    {activeBookings.length > 6 && (
                      <div className="w-1 h-1 rounded-full bg-green-500"></div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 md:p-8 text-center">
              <div className="text-4xl md:text-6xl mb-3 md:mb-4">📭</div>
              <h3 className="text-base md:text-xl font-bold text-gray-900 dark:text-white mb-2">
                Nessuna prenotazione attiva
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-3 md:mb-4">
                Non hai prenotazioni future in questo club
              </p>
              <button
                onClick={() => navigate(`/club/${clubId}/booking`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium text-sm md:text-base"
              >
                Prenota un Campo
              </button>
            </div>
          )}
        </div>
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            Azioni Rapide
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <QuickActionCard
              title="Prenota Campo"
              description="Prenota un campo da gioco"
              icon={
                <svg
                  className="w-5 h-5 md:w-7 md:h-7 text-white"
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
              }
              onClick={() => navigate(`/club/${clubId}/booking`)}
              gradient="bg-gradient-to-br from-emerald-500 to-green-600"
              iconBg="bg-white/20 backdrop-blur-sm"
            />
            <QuickActionCard
              title="Prenota Lezione"
              description="Prenota una lezione"
              icon={
                <svg
                  className="w-5 h-5 md:w-7 md:h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              }
              onClick={() => navigate(`/club/${clubId}/lessons`)}
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
              iconBg="bg-white/20 backdrop-blur-sm"
            />
            <QuickActionCard
              title="Classifica"
              description="Ranking RPA"
              icon={
                <svg
                  className="w-5 h-5 md:w-7 md:h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
              onClick={() => navigate(`/club/${clubId}/classifica`)}
              gradient="bg-gradient-to-br from-amber-500 to-orange-600"
              iconBg="bg-white/20 backdrop-blur-sm"
            />
            <QuickActionCard
              title="Statistiche"
              description="Grafici avanzati"
              icon={
                <svg
                  className="w-5 h-5 md:w-7 md:h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
              onClick={() => navigate(`/club/${clubId}/stats`)}
              gradient="bg-gradient-to-br from-purple-500 to-pink-600"
              iconBg="bg-white/20 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* Modal per dettaglio prenotazione */}
      {showDetailModal && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          isOpen={showDetailModal}
          onClose={handleCloseModal}
          onShare={handleShare}
          onCancel={handleCancel}
          onEdit={handleEdit}
          onReview={handleReview}
        />
      )}
    </div>
  );
};

export default ClubDashboard;
