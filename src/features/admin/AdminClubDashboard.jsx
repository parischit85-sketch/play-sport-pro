// =============================================
// FILE: src/features/admin/AdminClubDashboard.jsx
// Dashboard specifica per admin club - mostra tutte le informazioni chiave del club
// =============================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
import { useNotifications } from '@contexts/NotificationContext';
import { themeTokens } from '@lib/theme.js';
import { useClubSettings } from '@hooks/useClubSettings.js';
import TimeSlotsSlidePanel from '@ui/TimeSlotsSlidePanel.jsx';
import ExpiringCertificatesWidget from './components/ExpiringCertificatesWidget.jsx';
import WeatherWidget from './components/WeatherWidget.jsx';
import EmailVerificationFlow from '@components/registration/EmailVerificationFlow.jsx';

// Import dei servizi per ottenere i dati reali
import { loadAdminDashboardData } from '@services/adminDashboard.js';
import UnifiedBookingService from '@services/unified-booking-service.js';
import { logger } from '@/utils/logger';

const AdminClubDashboard = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { user, isClubAdmin } = useAuth();
  const { club, players, courts } = useClub();
  const { showSuccess, showError, showWarning } = useNotifications();
  const T = React.useMemo(() => themeTokens(), []);

  // State per slide-out panel fasce orarie
  const [showTimeSlotsPanel, setShowTimeSlotsPanel] = useState(false);
  const [instructorTimeSlots, setInstructorTimeSlots] = useState([]);

  // Hook per gestire configurazioni club
  const { lessonConfig, updateLessonConfig } = useClubSettings({ clubId });

  // Carica le fasce orarie create dagli istruttori e mergiale con quelle dell'admin
  useEffect(() => {
    const loadInstructorSlots = async () => {
      if (!clubId) return;

      try {
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('@services/firebase.js');

        const timeSlotsRef = collection(db, 'clubs', clubId, 'timeSlots');
        const querySnapshot = await getDocs(timeSlotsRef);

        const slots = [];
        querySnapshot.forEach((doc) => {
          const slotData = doc.data();
          slots.push({
            id: doc.id,
            source: 'instructor',
            ...slotData,
          });
        });

        logger.debug('Loaded instructor slots', slots.length);
        setInstructorTimeSlots(slots);
      } catch (error) {
        logger.error('❌ [AdminDashboard] Error loading instructor slots:', error);
      }
    };

    loadInstructorSlots();
  }, [clubId]);

  // Combina le fasce dell'admin con quelle degli istruttori
  const mergedLessonConfig = React.useMemo(() => {
    const baseConfig = lessonConfig || {};
    const configSlots = baseConfig.timeSlots || [];

    // Converti le fasce degli istruttori nel formato compatibile
    const convertedInstructorSlots = instructorTimeSlots.map((slot) => ({
      id: slot.id,
      dayOfWeek: null,
      selectedDates: slot.selectedDates || (slot.date ? [slot.date] : []),
      startTime: slot.startTime,
      endTime: slot.endTime,
      courtIds: slot.courtIds || [],
      instructorIds: slot.instructorIds || (slot.instructorId ? [slot.instructorId] : []),
      maxBookings: slot.maxParticipants || 5,
      isActive: slot.isActive !== false,
      source: 'instructor',
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt,
    }));

    return {
      ...baseConfig,
      timeSlots: [...configSlots, ...convertedInstructorSlots],
    };
  }, [lessonConfig, instructorTimeSlots]);

  // Stati per i dati della dashboard
  const [dashboardData, setDashboardData] = useState({
    todayBookings: [],
    todayLessons: [],
    availableInstructors: [],
    courts: [],
    stats: {
      todayBookingsCount: 0,
      tomorrowBookingsCount: 0,
      todayLessonsCount: 0,
      tomorrowLessonsCount: 0,
      todayRevenue: 0,
      weeklyBookings: 0,
      memberCount: 0,
      courtUtilization: 0,
    },
    loading: true,
    error: null,
    lastUpdate: null,
  });

  // Nuovi stati per la creazione della fascia oraria
  const [newSlotModalOpen, setNewSlotModalOpen] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotStartTime, setNewSlotStartTime] = useState('08:00');
  const [newSlotEndTime, setNewSlotEndTime] = useState('09:00');
  const [newSlotInstructorId, setNewSlotInstructorId] = useState('');
  const [newSlotCourtIds, setNewSlotCourtIds] = useState([]);
  const [newSlotIsActive, setNewSlotIsActive] = useState(false);

  const handleToggleTimeSlot = async (slot) => {
    try {
      const updatedTimeSlots = (lessonConfig?.timeSlots || []).map((s) =>
        s.id === slot.id ? { ...s, isActive: !slot.isActive } : s
      );
      // Filter out undefined values to prevent Firebase errors
      const cleanTimeSlots = updatedTimeSlots.map((s) => {
        const cleanSlot = {};
        Object.keys(s).forEach((key) => {
          if (s[key] !== undefined) {
            cleanSlot[key] = s[key];
          }
        });
        return cleanSlot;
      });
      const updatedLessonConfig = {
        ...lessonConfig,
        timeSlots: cleanTimeSlots,
      };
      await updateLessonConfig(updatedLessonConfig);
      logger.debug(`🔄 Fascia oraria ${!slot.isActive ? 'attivata' : 'disattivata'}:`, slot.id);
    } catch (error) {
      logger.error('Errore nel toggle della fascia oraria:', error);
      showError('Errore nel cambiamento dello stato della fascia oraria');
    }
  };

  const handleEditTimeSlot = (timeSlot) => {
    try {
      let updatedTimeSlots;
      if (timeSlot.delete) {
        updatedTimeSlots = (lessonConfig?.timeSlots || []).filter(
          (slot) => slot.id !== timeSlot.id
        );
      } else {
        updatedTimeSlots = (lessonConfig?.timeSlots || []).map((slot) =>
          slot.id === timeSlot.id ? { ...slot, ...timeSlot } : slot
        );
      }
      const updatedLessonConfig = {
        ...lessonConfig,
        timeSlots: updatedTimeSlots,
      };
      updateLessonConfig(updatedLessonConfig);
      logger.debug(
        timeSlot.delete ? '🗑️ Fascia oraria eliminata:' : '💾 Fascia oraria aggiornata:',
        timeSlot
      );
    } catch (error) {
      logger.error('Errore nel salvataggio/cancellazione della fascia oraria:', error);
      showError('Errore nel salvataggio/cancellazione della fascia oraria');
    }
  };

  const handleCreateTimeSlot = () => {
    setNewSlotModalOpen(true);
  };

  const handleToggleCourt = (courtId) => {
    setNewSlotCourtIds((prev) =>
      prev.includes(courtId) ? prev.filter((id) => id !== courtId) : [...prev, courtId]
    );
  };

  const handleConfirmCreateTimeSlot = async () => {
    if (!newSlotDate || !newSlotInstructorId || newSlotCourtIds.length === 0) {
      showWarning('Seleziona data, istruttore e almeno un campo');
      return;
    }
    try {
      const newTimeSlot = {
        id: `timeslot_${Date.now()}`,
        isActive: newSlotIsActive,
        selectedDates: [newSlotDate],
        startTime: newSlotStartTime,
        endTime: newSlotEndTime,
        instructorIds: [newSlotInstructorId],
        courtIds: newSlotCourtIds,
      };
      const updatedTimeSlots = [...(lessonConfig?.timeSlots || []), newTimeSlot];
      const updatedLessonConfig = {
        ...lessonConfig,
        timeSlots: updatedTimeSlots,
      };
      await updateLessonConfig(updatedLessonConfig);
      setNewSlotModalOpen(false);
      setNewSlotDate('');
      setNewSlotStartTime('08:00');
      setNewSlotEndTime('09:00');
      setNewSlotInstructorId('');
      setNewSlotCourtIds([]);
      setNewSlotIsActive(false);
      showSuccess('✅ Fascia oraria creata con successo! Puoi ora modificarla e attivarla.');
    } catch (error) {
      logger.error('Errore nella creazione della fascia oraria:', error);
      showError('Errore nella creazione della fascia oraria');
    }
  };

  const handleDuplicateTimeSlot = async (timeSlot) => {
    try {
      // Crea una copia della fascia oraria con un nuovo ID
      const newTimeSlot = {
        ...timeSlot,
        id: `timeslot_${Date.now()}`,
        isActive: false, // Inizialmente disattivata
        selectedDates: [], // Rimuovi le date per permettere la selezione di nuove date
      };

      const updatedTimeSlots = [...(lessonConfig?.timeSlots || []), newTimeSlot];

      const updatedLessonConfig = {
        ...lessonConfig,
        timeSlots: updatedTimeSlots,
      };

      await updateLessonConfig(updatedLessonConfig);

      showSuccess(
        '✅ Fascia oraria duplicata con successo!\n\nLa nuova fascia è stata creata e disattivata.\nPuoi attivarla e configurare le date nella sezione "Lezioni".'
      );

      logger.debug(`📋 Fascia oraria duplicata:`, newTimeSlot);
    } catch (error) {
      logger.error('Errore nella duplicazione della fascia oraria:', error);
      showError('Errore nella duplicazione della fascia oraria');
    }
  };

  // Verifica che l'utente sia admin del club
  useEffect(() => {
    if (!clubId || !user) return;

    const isAdmin = isClubAdmin(clubId);
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
  }, [clubId, user, isClubAdmin, navigate]);

  // Carica i dati della dashboard
  useEffect(() => {
    if (!clubId || !club) return;

    loadDashboardData();

    // Imposta un refresh automatico ogni 2 minuti per mantenere i dati sincronizzati
    const refreshInterval = setInterval(
      () => {
        // Auto-refreshing dashboard data
        loadDashboardData();
      },
      2 * 60 * 1000
    ); // 2 minuti

    // Aggiorna la dashboard quando la tab diventa visibile
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadDashboardData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [clubId, club]);

  const loadDashboardData = async () => {
    try {
      setDashboardData((prev) => ({ ...prev, loading: true, error: null }));

      // Loading real dashboard data for club

      // Inizializza il sistema unificato di prenotazioni
      UnifiedBookingService.initialize({
        cloudEnabled: true, // Usa sempre Firebase per dati consistenti
        user: user,
      });

      // Migra i dati vecchi se necessario
      await UnifiedBookingService.migrateOldData();

      // Usa il nuovo servizio per caricare dati reali da Firebase
      const realData = await loadAdminDashboardData(clubId);

      // Debug dettagliato: dashboard data received - logs removed

      // Aggiorna il conteggio membri dal ClubContext se disponibile
      if (players && players.length > 0) {
        realData.stats.memberCount = players.length;
      }

      // Aggiungi il timestamp dell'ultimo aggiornamento
      realData.lastUpdate = new Date().toLocaleTimeString('it-IT');

      setDashboardData(realData);
      // Real dashboard data loaded successfully
    } catch (error) {
      logger.error('❌ Error loading dashboard data:', error);
      setDashboardData((prev) => ({
        ...prev,
        loading: false,
        error: 'Errore nel caricamento dei dati reali',
      }));
    }
  };

  // Funzione helper per contare le fasce orarie attive e non passate
  const getActiveAvailableTimeSlotsCount = () => {
    if (!mergedLessonConfig?.timeSlots || mergedLessonConfig.timeSlots.length === 0) return 0;

    const now = new Date();
    const today = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const currentDateStr = now.toISOString().split('T')[0];

    return mergedLessonConfig.timeSlots.filter((slot) => {
      // Deve essere attiva
      if (!slot.isActive) return false;

      // Caso 1: Fascia con date specifiche
      if (
        slot.selectedDates &&
        Array.isArray(slot.selectedDates) &&
        slot.selectedDates.length > 0
      ) {
        const hasFutureDate = slot.selectedDates.some((dateStr) => {
          const slotDateStr = new Date(dateStr).toISOString().split('T')[0];

          if (slotDateStr > currentDateStr) return true;

          if (slotDateStr === currentDateStr && slot.endTime) {
            const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
            const slotEndTime = endHours * 60 + endMinutes;
            return slotEndTime > currentTime;
          }

          return false;
        });

        return hasFutureDate;
      }
      // Caso 2: Fascia ricorrente
      else if (slot.dayOfWeek === today && slot.endTime) {
        const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
        const slotEndTime = endHours * 60 + endMinutes;
        return slotEndTime > currentTime;
      }

      // Fasce ricorrenti di altri giorni sono sempre valide
      return true;
    }).length;
  };

  // Componente per le statistiche rapide
  const StatCard = ({ title, value, subtitle, icon, color, onClick }) => (
    <div
      className={`${T.cardBg} ${T.border} rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className={`text-xs sm:text-sm font-medium ${T.subtext} mb-0.5 sm:mb-1 truncate`}>
            {title}
          </div>
          <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${color}`}>{value}</div>
          {subtitle && (
            <div className={`text-xs ${T.subtext} mt-0.5 sm:mt-1 hidden sm:block`}>{subtitle}</div>
          )}
        </div>
        <div className={`text-xl sm:text-2xl lg:text-3xl opacity-70 flex-shrink-0`}>{icon}</div>
      </div>
    </div>
  );

  // Componente per le prenotazioni del giorno
  const TodayBookingsCard = () => {
    // Le prenotazioni di oggi sono già filtrate dal servizio
    const todayBookings = dashboardData?.todayBookings || [];

    // Filtriamo solo le prossime prenotazioni dall'orario attuale
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minuti dall'inizio giornata

    const upcomingBookings = todayBookings
      .filter((booking) => {
        if (!booking.time) return true; // Se non c'è orario, mostra comunque
        // Assumiamo che booking.time sia in formato "HH:MM"
        const [hours, minutes] = booking.time.split(':').map(Number);
        const bookingTime = hours * 60 + minutes;
        return bookingTime >= currentTime;
      })
      .slice(0, 3); // Solo le prossime 3

    return (
      <div className={`${T.cardBg} ${T.border} rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6`}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className={`text-base sm:text-lg font-semibold ${T.text}`}>
            Prossime Prenotazioni Oggi
          </h3>
          <button
            onClick={() =>
              navigate(
                `/club/${clubId}/admin/bookings?date=${new Date().toISOString().split('T')[0]}`
              )
            }
            className={`text-blue-500 hover:text-blue-600 text-xs sm:text-sm font-medium whitespace-nowrap`}
          >
            Gestisci →
          </button>
        </div>

        {todayBookings.length === 0 ? (
          <div className={`text-center py-8 ${T.subtext}`}>
            <div className="text-4xl mb-2">📅</div>
            <div>Nessuna prenotazione per oggi</div>
            <div className="text-xs mt-2 opacity-75">
              {new Date().toLocaleDateString('it-IT', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </div>
          </div>
        ) : upcomingBookings.length === 0 ? (
          <div className={`text-center py-8 ${T.subtext}`}>
            <div className="text-4xl mb-2">⏰</div>
            <div>Tutte le prenotazioni di oggi sono passate</div>
            <div className="text-xs mt-2 opacity-75">
              {todayBookings.length} prenotazione/i completate
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {upcomingBookings.map((booking, index) => (
              <div
                key={booking.id || index}
                className={`flex items-center justify-between p-3 ${T.border} rounded-lg cursor-pointer hover:bg-gray-50 hover:bg-gray-700 transition-colors`}
                onClick={() => navigate(`/club/${clubId}/admin/bookings?edit=${booking.id}`)}
                title="Clicca per modificare la prenotazione"
              >
                <div>
                  <div className={`font-medium ${T.text}`}>
                    Campo {booking.courtName || booking.courtId || booking.court}
                  </div>
                  <div className={`text-sm ${T.subtext}`}>
                    {booking.time} -{' '}
                    {booking.player?.name ||
                      booking.playerName ||
                      booking.players?.[0] ||
                      'Cliente'}
                  </div>
                </div>
                <div
                  className={`text-sm font-medium ${booking.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'} flex items-center gap-2`}
                >
                  €{booking.price || 0}
                  <svg
                    className="w-4 h-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Componente per le lezioni del giorno
  const TodayLessonsCard = () => {
    // Le lezioni di oggi sono già filtrate dal servizio
    const todayLessons = dashboardData?.todayLessons || [];

    // Filtriamo solo le prossime lezioni dall'orario attuale
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minuti dall'inizio giornata

    const upcomingLessons = todayLessons
      .filter((lesson) => {
        if (!lesson.time) return true; // Se non c'è orario, mostra comunque
        // Assumiamo che lesson.time sia in formato "HH:MM"
        const [hours, minutes] = lesson.time.split(':').map(Number);
        const lessonTime = hours * 60 + minutes;
        return lessonTime >= currentTime;
      })
      .slice(0, 3); // Solo le prossime 3

    return (
      <div className={`${T.cardBg} ${T.border} rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6`}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className={`text-base sm:text-lg font-semibold ${T.text}`}>Prossime Lezioni Oggi</h3>
          <button
            onClick={() => navigate(`/club/${clubId}/admin/bookings?filter=lessons`)}
            className={`text-blue-500 hover:text-blue-600 text-xs sm:text-sm font-medium whitespace-nowrap`}
          >
            Gestisci →
          </button>
        </div>

        {todayLessons.length === 0 ? (
          <div className={`text-center py-8 ${T.subtext}`}>
            <div className="text-4xl mb-2">🎾</div>
            <div>Nessuna lezione per oggi</div>
            <div className="text-xs mt-2 opacity-75">
              {new Date().toLocaleDateString('it-IT', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </div>
          </div>
        ) : upcomingLessons.length === 0 ? (
          <div className={`text-center py-8 ${T.subtext}`}>
            <div className="text-4xl mb-2">✅</div>
            <div>Tutte le lezioni di oggi sono completate</div>
            <div className="text-xs mt-2 opacity-75">
              {todayLessons.length} lezione/i completate
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {upcomingLessons.map((lesson, index) => (
              <div
                key={lesson.id || index}
                className={`flex items-center justify-between p-3 ${T.border} rounded-lg cursor-pointer hover:bg-gray-50 hover:bg-gray-700 transition-colors`}
                onClick={() => navigate(`/club/${clubId}/admin/bookings?edit=${lesson.id}`)}
                title="Clicca per modificare la lezione"
              >
                <div>
                  <div className={`font-medium ${T.text}`}>
                    {lesson.bookedBy || lesson.student?.name || lesson.studentName || 'Cliente'} (
                    {lesson.participants || 1} partecipanti) -{' '}
                    {lesson.instructor?.name || lesson.instructorName || 'Maestro'}
                  </div>
                  <div className={`text-sm ${T.subtext}`}>
                    {lesson.time} - {lesson.type || lesson.lessonType || 'Lezione individuale'}
                  </div>
                </div>
                <div className={`text-sm font-medium text-green-600 flex items-center gap-2`}>
                  €{lesson.price || 0}
                  <svg
                    className="w-4 h-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Componente per i maestri disponibili
  const InstructorsCard = () => (
    <div className={`${T.cardBg} ${T.border} rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className={`text-base sm:text-lg font-semibold ${T.text}`}>Maestri Disponibili Oggi</h3>
        <span className={`text-sm ${T.subtext}`}>
          {dashboardData.availableInstructors.length} disponibili
        </span>
      </div>

      {dashboardData.availableInstructors.length === 0 ? (
        <div className={`text-center py-6 ${T.subtext}`}>
          <div className="text-3xl mb-2">👨‍🏫</div>
          <div>Nessun maestro disponibile oggi</div>
        </div>
      ) : (
        <div className="space-y-3">
          {dashboardData.availableInstructors.slice(0, 4).map((instructor, index) => (
            <div
              key={instructor.id || index}
              className={`p-3 rounded-lg border ${T.border} hover:bg-gray-50 hover:bg-gray-700`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {instructor.name?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <div className={`font-medium ${T.text}`}>{instructor.name}</div>
                    <div className={`text-xs ${T.subtext}`}>
                      {instructor.specialization || 'Padel'}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-green-600 font-medium">
                  {instructor.availableSlots?.length || 0} slot
                </div>
              </div>

              {instructor.availableSlots && instructor.availableSlots.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {instructor.availableSlots.slice(0, 6).map((slot, slotIndex) => (
                    <span
                      key={slotIndex}
                      className="text-xs px-2 py-1 bg-green-900/30 text-green-300 rounded border border-green-700"
                    >
                      {slot.time}
                    </span>
                  ))}
                  {instructor.availableSlots.length > 6 && (
                    <span className={`text-xs px-2 py-1 ${T.subtext}`}>
                      +{instructor.availableSlots.length - 6} altri
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (dashboardData.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className={`text-lg ${T.text}`}>Caricamento dashboard...</div>
        </div>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className={`text-lg ${T.text} mb-2`}>Errore nel caricamento</div>
          <div className={`text-sm ${T.subtext} mb-4`}>{dashboardData.error}</div>
          <button onClick={loadDashboardData} className={`${T.btnPrimary} px-6 py-2`}>
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 w-full">
      {/* Email Verification Warning */}
      <EmailVerificationFlow />

      {/* Approval Status Banner */}
      {club?.status === 'pending' && (
        <div className="bg-yellow-50 bg-yellow-900/30 border-2 border-yellow-300 border-yellow-600 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">⏳</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-100 mb-1">In Attesa di Approvazione</h3>
              <p className="text-sm text-yellow-200 mb-3">
                Il circolo "{club?.name}" è registrato e in attesa dell'approvazione da parte del
                nostro team. Una volta approvato, sarà visibile a tutti gli utenti della
                piattaforma.
              </p>
              <p className="text-xs text-yellow-300 opacity-75">
                🔔 Ti notificheremo via email quando il circolo sarà approvato.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="min-w-0">
          <h1 className={`text-xl sm:text-2xl font-bold ${T.text} truncate`}>
            Dashboard Admin - {club?.name}
          </h1>
          <p className={`${T.subtext} mt-1 text-xs sm:text-sm`}>
            <span className="hidden sm:inline">Panoramica delle attività del </span>
            {new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
            {dashboardData.lastUpdate && (
              <span className="ml-2 sm:ml-3 text-xs opacity-75">{dashboardData.lastUpdate}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Pulsante Disponibilità Lezioni */}
          <button
            onClick={() => setShowTimeSlotsPanel(true)}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            title="Gestione rapida disponibilità lezioni"
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="hidden sm:inline">Disponibilità Lezioni</span>
            <span className="sm:hidden">Disponibilità</span>
            {mergedLessonConfig?.timeSlots && mergedLessonConfig.timeSlots.length > 0 && (
              <span className="bg-white/20 text-white text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                {getActiveAvailableTimeSlotsCount()}
              </span>
            )}
          </button>

          {/* Pulsante Aggiorna */}
          <button
            onClick={() => {
              logger.debug('🔄 Manual refresh triggered');
              loadDashboardData();
            }}
            disabled={dashboardData.loading}
            className={`${T.btnSecondary} px-2 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm`}
          >
            <span className={dashboardData.loading ? 'animate-spin' : ''}>🔄</span>
            <span className="hidden sm:inline">
              {dashboardData.loading ? 'Aggiornamento...' : 'Aggiorna'}
            </span>
          </button>
        </div>
      </div>

      {/* Statistiche rapide */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        <StatCard
          title="Prenotazioni Oggi"
          value={dashboardData?.stats?.todayBookingsCount || 0}
          subtitle="confermate"
          icon="📅"
          color="text-blue-400"
          onClick={() =>
            navigate(
              `/club/${clubId}/admin/bookings?date=${new Date().toISOString().split('T')[0]}`
            )
          }
        />
        <StatCard
          title="Prenotazioni Domani"
          value={dashboardData?.stats?.tomorrowBookingsCount || 0}
          subtitle="programmate"
          icon="🎾"
          color="text-purple-400"
          onClick={() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            navigate(`/club/${clubId}/admin/bookings?date=${tomorrow.toISOString().split('T')[0]}`);
          }}
        />
        <StatCard
          title="Lezioni Oggi"
          value={dashboardData?.stats?.todayLessonsCount || 0}
          subtitle="programmate"
          icon="🎓"
          color="text-orange-400"
          onClick={() =>
            navigate(`/club/${clubId}/admin/lessons?date=${new Date().toISOString().split('T')[0]}`)
          }
        />
        <StatCard
          title="Lezioni Domani"
          value={dashboardData.stats.tomorrowLessonsCount || 0}
          subtitle="programmate"
          icon="📚"
          color="text-green-400"
          onClick={() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            navigate(`/club/${clubId}/admin/lessons?date=${tomorrow.toISOString().split('T')[0]}`);
          }}
        />
        <StatCard
          title="Utilizzo Campi"
          value={`${dashboardData?.stats?.courtUtilization || 0}%`}
          subtitle="oggi"
          icon="⚡️"
          color="text-red-400"
          onClick={() =>
            navigate(
              `/club/${clubId}/admin/bookings?date=${new Date().toISOString().split('T')[0]}`
            )
          }
        />
      </div>

      {/* Sezione principale con le attività del giorno */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <TodayBookingsCard />
        <TodayLessonsCard />
        <ExpiringCertificatesWidget clubId={clubId} T={T} />
      </div>

      {/* Sezione maestri, meteo e info circolo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InstructorsCard />

        {/* Meteo Widget */}
        <WeatherWidget club={club} />

        {/* Informazioni Club */}
        <div className={`${T.cardBg} ${T.border} rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6`}>
          <h3 className={`text-base sm:text-lg font-semibold ${T.text} mb-3 sm:mb-4`}>
            Info Circolo
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-gray-400">🏟️</span>
              <span className={`text-sm ${T.text}`}>{courts ? courts.length : 0} Campi</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-400">�</span>
              <span className={`text-sm ${T.text}`}>
                {club?.location?.city || 'Località non specificata'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-400">⭐</span>
              <span className={`text-sm ${T.text}`}>
                {club?.isPremium ? 'Premium' : 'Standard'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Azioni Rapide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => navigate(`/club/${clubId}/admin/bookings`)}
          className={`${T.btnPrimary} flex items-center justify-center space-x-2 py-3`}
        >
          <span>📅</span>
          <span>Gestione Campi</span>
        </button>
        <button
          onClick={() => navigate(`/club/${clubId}/players`)}
          className={`${T.btnSecondary} flex items-center justify-center space-x-2 py-3`}
        >
          <span>�</span>
          <span>Gestione Giocatori</span>
        </button>
        <button
          onClick={() => navigate(`/club/${clubId}/matches/create`)}
          className={`${T.btnSecondary} flex items-center justify-center space-x-2 py-3`}
        >
          <span>🏆</span>
          <span>Crea Partita</span>
        </button>
      </div>

      {/* Slide-out Panel per Fasce Orarie */}
      <TimeSlotsSlidePanel
        isOpen={showTimeSlotsPanel}
        onClose={() => setShowTimeSlotsPanel(false)}
        timeSlots={mergedLessonConfig?.timeSlots || []}
        onToggleTimeSlot={handleToggleTimeSlot}
        onEditTimeSlot={handleEditTimeSlot}
        onCreateTimeSlot={handleCreateTimeSlot}
        onDuplicateTimeSlot={handleDuplicateTimeSlot}
        instructors={players?.filter((p) => p.category === 'instructor') || []}
        courts={courts || []}
        T={T}
      />

      {/* Modal per la creazione della fascia oraria */}
      {newSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white">Crea nuova fascia oraria</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-300">Data</label>
              <input
                type="date"
                value={newSlotDate}
                onChange={(e) => {
                  setNewSlotDate(e.target.value);
                }}
                className="w-full border border-gray-700 rounded-lg px-2 py-1 bg-white bg-gray-800 text-white"
              />
            </div>
            <div className="mb-4 flex gap-2">
              <div className="flex-1">
                <label className="block mb-1 font-medium text-gray-300">Orario Inizio</label>
                <div className="flex gap-2">
                  <select
                    value={newSlotStartTime.split(':')[0]}
                    onChange={(e) =>
                      setNewSlotStartTime(`${e.target.value}:${newSlotStartTime.split(':')[1]}`)
                    }
                    className="border border-gray-700 rounded-lg px-2 py-1 bg-white bg-gray-800 text-white"
                  >
                    {[...Array(24).keys()].map((h) => (
                      <option key={h} value={h.toString().padStart(2, '0')}>
                        {h.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newSlotStartTime.split(':')[1]}
                    onChange={(e) =>
                      setNewSlotStartTime(`${newSlotStartTime.split(':')[0]}:${e.target.value}`)
                    }
                    className="border border-gray-700 rounded-lg px-2 py-1 bg-white bg-gray-800 text-white"
                  >
                    {['00', '30'].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium text-gray-300">Orario Fine</label>
                <div className="flex gap-2">
                  <select
                    value={newSlotEndTime.split(':')[0]}
                    onChange={(e) =>
                      setNewSlotEndTime(`${e.target.value}:${newSlotEndTime.split(':')[1]}`)
                    }
                    className="border border-gray-700 rounded-lg px-2 py-1 bg-white bg-gray-800 text-white"
                  >
                    {[...Array(24).keys()].map((h) => (
                      <option key={h} value={h.toString().padStart(2, '0')}>
                        {h.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newSlotEndTime.split(':')[1]}
                    onChange={(e) =>
                      setNewSlotEndTime(`${newSlotEndTime.split(':')[0]}:${e.target.value}`)
                    }
                    className="border border-gray-700 rounded-lg px-2 py-1 bg-white bg-gray-800 text-white"
                  >
                    {['00', '30'].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-300">Istruttore</label>
              <select
                value={newSlotInstructorId}
                onChange={(e) => setNewSlotInstructorId(e.target.value)}
                className="w-full border border-gray-700 rounded-lg px-2 py-1 bg-white bg-gray-800 text-white"
              >
                <option value="">Seleziona...</option>
                {players
                  ?.filter((p) => p.category === 'instructor')
                  .map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-300">Campi</label>
              <div className="flex flex-wrap gap-2">
                {courts?.map((court) => (
                  <label key={court.id} className="flex items-center gap-1 text-gray-200">
                    <input
                      type="checkbox"
                      checked={newSlotCourtIds.includes(court.id)}
                      onChange={() => handleToggleCourt(court.id)}
                      className="accent-green-600 accent-green-400"
                    />
                    <span>{court.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-300">Attiva</label>
              <input
                type="checkbox"
                checked={newSlotIsActive}
                onChange={(e) => setNewSlotIsActive(e.target.checked)}
                className="accent-blue-600 accent-blue-400"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setNewSlotModalOpen(false)}
                className={`${T.btnSecondary} px-4 py-2 rounded-lg`}
              >
                Annulla
              </button>
              <button
                onClick={handleConfirmCreateTimeSlot}
                className={`${T.btnPrimary} px-4 py-2 rounded-lg`}
              >
                Crea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClubDashboard;
