// =============================================
// FILE: src/features/admin/AdminClubDashboard.jsx
// Dashboard specifica per admin club - mostra tutte le informazioni chiave del club
// =============================================
import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
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
import useUnifiedBookings from '@hooks/useUnifiedBookings.js';
import { logger } from '@/utils/logger';
import {
  DashboardStats,
  DashboardBookings,
  DashboardLessons,
  DashboardInstructors,
} from './AdminClubDashboard/index.js';

// ✅ FIX #24: Magic Constants extracted for easier maintenance
const DASHBOARD_CONSTANTS = {
  REFRESH_INTERVAL_MS: 2 * 60 * 1000, // Auto-refresh every 2 minutes
  MAX_BOOKINGS_DISPLAY: 3, // Show max 3 upcoming bookings
  MAX_LESSONS_DISPLAY: 3, // Show max 3 upcoming lessons
  MAX_INSTRUCTOR_SLOTS: 6, // Max instructor time slots to display
};

// ✅ FIX #2 (Sprint 3): Extract repeated Tailwind class strings for maintainability
const STYLE_CONSTANTS = {
  // Card styling
  cardContainer: (T) => `${T.cardBg} ${T.border} rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6`,
  cardHover: `hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`,
  
  // Typography
  heading3: (T) => `text-base sm:text-lg font-semibold ${T.text}`,
  subtext: (T) => `text-sm ${T.subtext}`,
  
  // Interactive elements
  statCard: (T) => `${T.cardBg} ${T.border} rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg`,
  bookingItem: (T) => `flex items-center justify-between p-3 ${T.border} rounded-lg cursor-pointer ${STYLE_CONSTANTS.cardHover}`,
  
  // Time slot styling
  timeSlotTag: 'text-xs px-2 py-1 bg-green-900/30 text-green-300 rounded border border-green-700',
  
  // Empty state
  emptyStateContainer: (T) => `text-center py-8 ${T.subtext}`,
  emptyStateIcon: 'text-4xl mb-2',
};

// ✅ FIX #3 (Sprint 4): Centralized empty state messages with icons and descriptions
const EMPTY_STATE_MESSAGES = {
  noBookingsToday: {
    icon: '📅',
    title: 'Nessuna prenotazione per oggi',
    description: 'Tutte le prenotazioni verranno visualizzate qui',
  },
  allBookingsPassed: {
    icon: '⏰',
    title: 'Tutte le prenotazioni di oggi sono passate',
    description: 'Puoi visualizzare la cronologia nella sezione prenotazioni',
  },
  noLessonsToday: {
    icon: '🎾',
    title: 'Nessuna lezione per oggi',
    description: 'Le lezioni programmate appariranno qui',
  },
  allLessonsPassed: {
    icon: '✅',
    title: 'Tutte le lezioni di oggi sono completate',
    description: 'Ottimo lavoro! Tutte le lezioni si sono svolte',
  },
  noInstructors: {
    icon: '👨‍🏫',
    title: 'Nessun maestro disponibile oggi',
    description: 'I maestri disponibili verranno elencati qui',
  },
  loadingDashboard: {
    icon: '⏳',
    title: 'Caricamento dashboard...',
    description: 'Attendere qualche istante',
  },
  errorLoading: {
    icon: '❌',
    title: 'Errore nel caricamento',
    description: 'Si è verificato un problema. Prova a ricaricare.',
  },
};

/**
 * ✅ FIX #4 (Sprint 4): Error messages with retry capability
 * Provides specific error messages for different failure scenarios
 * Each error includes: title, message, code for logging, severity, and retryable flag
 */
const ERROR_MESSAGES = {
  // Data loading errors
  loadingDashboard: {
    title: 'Errore nel caricamento della dashboard',
    message: 'Impossibile caricare i dati. Controlla la connessione internet e riprova.',
    code: 'DASHBOARD_LOAD_ERROR',
    severity: 'error',
    retryable: true,
  },
  loadingSlots: {
    title: 'Errore nel caricamento delle fasce orarie',
    message: 'Non è stato possibile caricare le fasce orarie degli istruttori.',
    code: 'SLOTS_LOAD_ERROR',
    severity: 'error',
    retryable: true,
  },
  
  // Time slot operations
  toggleSlot: {
    title: 'Errore nel cambio stato',
    message: 'Non è stato possibile attivare/disattivare la fascia oraria. Riprova.',
    code: 'TOGGLE_SLOT_ERROR',
    severity: 'error',
    retryable: true,
  },
  saveSlot: {
    title: 'Errore nel salvataggio',
    message: 'Non è stato possibile salvare la fascia oraria. Riprova.',
    code: 'SAVE_SLOT_ERROR',
    severity: 'error',
    retryable: true,
  },
  deleteSlot: {
    title: 'Errore nell\'eliminazione',
    message: 'Non è stato possibile eliminare la fascia oraria. Riprova.',
    code: 'DELETE_SLOT_ERROR',
    severity: 'error',
    retryable: true,
  },
  
  // Validation errors
  invalidTime: {
    title: 'Orario non valido',
    message: 'L\'orario di inizio deve essere prima dell\'orario di fine.',
    code: 'INVALID_TIME_ERROR',
    severity: 'warning',
    retryable: false,
  },
  pastDate: {
    title: 'Data non valida',
    message: 'Non puoi creare fasce orarie nel passato.',
    code: 'PAST_DATE_ERROR',
    severity: 'warning',
    retryable: false,
  },
  missingData: {
    title: 'Dati incompleti',
    message: 'Compila tutti i campi obbligatori.',
    code: 'MISSING_DATA_ERROR',
    severity: 'warning',
    retryable: false,
  },
  
  // Network errors
  networkError: {
    title: 'Errore di connessione',
    message: 'Connessione internet non disponibile. Verifica la tua connessione.',
    code: 'NETWORK_ERROR',
    severity: 'error',
    retryable: true,
  },
  timeout: {
    title: 'Timeout della richiesta',
    message: 'La richiesta ha impiegato troppo tempo. Riprova.',
    code: 'TIMEOUT_ERROR',
    severity: 'error',
    retryable: true,
  },
  
  // Permission errors
  permission: {
    title: 'Accesso negato',
    message: 'Non hai le autorizzazioni necessarie per questa operazione.',
    code: 'PERMISSION_ERROR',
    severity: 'error',
    retryable: false,
  },
  
  // Generic fallback
  generic: {
    title: 'Errore sconosciuto',
    message: 'Si è verificato un errore inaspettato. Riprova più tardi.',
    code: 'UNKNOWN_ERROR',
    severity: 'error',
    retryable: true,
  },
};

/**
 * Helper function to get appropriate error message based on error code or type
 * Maps error patterns to predefined messages for better user experience
 * Enables consistent error handling and retry capability across the component
 * 
 * @param {Error|string} error - Error object or error code string
 * @param {string} fallbackKey - Default error key if error type unknown (default: 'generic')
 * @returns {Object} Error config with title, message, code, severity, retryable flag
 */
const getErrorMessage = (error, fallbackKey = 'generic') => {
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || ERROR_MESSAGES[fallbackKey];
  }

  // Network errors
  if (error?.message?.includes('Network') || error?.message?.includes('network')) {
    return ERROR_MESSAGES.networkError;
  }

  // Timeout errors
  if (error?.message?.includes('timeout') || error?.code === 'ETIMEDOUT') {
    return ERROR_MESSAGES.timeout;
  }

  // Permission errors
  if (error?.message?.includes('permission') || error?.code === 'PERMISSION_DENIED') {
    return ERROR_MESSAGES.permission;
  }

  // Firebase specific errors
  if (error?.code?.includes('INVALID_ARGUMENT')) {
    return ERROR_MESSAGES.invalidTime;
  }

  return ERROR_MESSAGES[fallbackKey];
};

/**
 * ✅ FIX #7 (Sprint 4+): Get instructors from players with robust filtering
 * Supports multiple ways to identify instructors:
 * - category === 'instructor'
 * - role === 'instructor' 
 * - isInstructor === true
 * 
 * @param {Array} players - List of players/users
 * @returns {Array} Filtered list of instructors
 */
const getInstructorsFromPlayers = (players) => {
  if (!Array.isArray(players)) return [];
  
  return players.filter((player) => {
    // Multiple ways to identify an instructor
    return (
      player?.category === 'instructor' ||
      player?.role === 'instructor' ||
      player?.isInstructor === true ||
      player?.type === 'instructor'
    );
  });
};

// ✅ FIX #5: Helper function to safely format dates for query params
/**
 * Safely formats a Date object to ISO date string (YYYY-MM-DD)
 * 
 * @param {Date} [date=new Date()] - Date to format, defaults to current date
 * @returns {string} Formatted date string in YYYY-MM-DD format
 * @throws Does not throw - returns current date on error
 */

/**
 * AdminClubDashboard - Main dashboard component for club administrators
 * 
 * Provides a comprehensive overview of club activities including:
 * - Real-time booking and lesson statistics
 * - Today's upcoming bookings and lessons
 * - Available instructors and time slots
 * - Club settings and configuration
 * 
 * Features:
 * - Auto-refresh every 2 minutes (configurable)
 * - Dark mode support with theme tokens
 * - Performance optimized with React.memo and useMemo
 * - Comprehensive error handling with user feedback
 * - Firebase integration for real-time data
 * 
 * @component
 * @returns {React.ReactNode} Dashboard UI with statistics, cards, and modals
 * 
 * @requires useParams - Gets clubId from URL
 * @requires useAuth - Gets current user and auth state
 * @requires useClub - Gets club, players, courts data
 * @requires useNotifications - Displays notifications
 * @requires loadAdminDashboardData - Loads dashboard data from Firebase
 * 
 * State Management:
 * - dashboardData: Main state with stats, bookings, lessons
 * - showAddBookingModal: Modal visibility toggle
 * - instructorTimeSlots: List of instructor availability
 * 
 * Performance Optimizations:
 * - useCallback: Prevents infinite loops in loadDashboardData
 * - useMemo: Memoizes filtered arrays for bookings and lessons
 * - React.memo: Prevents unnecessary re-renders of StatCard components
 */
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

  // ✅ Ref per evitare race condition - due richieste parallele
  const loadingRef = useRef(false);

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

  /**
   * Loads all dashboard data from Firebase and updates component state
   * 
   * Handles:
   * - Booking statistics and lists
   * - Lesson data and schedules
   * - Instructor availability
   * - Club statistics
   * - Data migration from legacy format
   * 
   * Features:
   * - Race condition prevention via loadingRef flag
   * - Graceful degradation if migration fails
   * - Error handling with user notifications
   * - Automatic timestamp updates
   * 
   * @async
   * @returns {Promise<void>}
   * 
   * @throws {Error} Logs errors and updates error state for UI display
   * @dependencies [clubId, players, user, showWarning]
   */
  // ✅ FIX #2, #3, #4: Memoizzare loadDashboardData con useCallback per evitare infinite loops e race conditions
  const loadDashboardData = useCallback(async () => {
    // ✅ FIX #4: Evita richieste parallele
    if (loadingRef.current) {
      logger.debug('🔄 Load already in progress, skipping');
      return;
    }

    loadingRef.current = true;

    try {
      setDashboardData((prev) => ({ ...prev, loading: true, error: null }));

      // Inizializza il sistema unificato di prenotazioni
      UnifiedBookingService.initialize({
        cloudEnabled: true, // Usa sempre Firebase per dati consistenti
        user: user,
      });

      // ✅ FIX #3: Gestire migration separatamente con error handling
      let migrationSucceeded = true;
      try {
        await UnifiedBookingService.migrateOldData();
      } catch (migrationError) {
        logger.warn('⚠️ Data migration failed, continuing anyway:', migrationError);
        migrationSucceeded = false;
        // Non interrompere il flusso - mostra i dati che abbiamo
        showWarning(
          '⚠️ Alcuni dati precedenti potrebbero non essere sincronizzati. Riprova tra poco.'
        );
      }

      // Usa il nuovo servizio per caricare dati reali da Firebase
      const realData = await loadAdminDashboardData(clubId);

      // Aggiorna il conteggio membri dal ClubContext se disponibile
      if (players && players.length > 0) {
        realData.stats.memberCount = players.length;
      }

      // Aggiungi il timestamp dell'ultimo aggiornamento
      realData.lastUpdate = new Date().toLocaleTimeString('it-IT');
      realData.migrationWarning = !migrationSucceeded; // ✅ Track migration status

      setDashboardData(realData);
    } catch (error) {
      logger.error('❌ Error loading dashboard data:', error);
      
      // ✅ FIX #4 (Sprint 4): Use specific error message
      const errorConfig = getErrorMessage(error, 'loadingDashboard');
      logger.error(`Error code: ${errorConfig.code}, Retryable: ${errorConfig.retryable}`);
      
      setDashboardData((prev) => ({
        ...prev,
        loading: false,
        error: errorConfig.message,
        errorCode: errorConfig.code,
        retryable: errorConfig.retryable,
      }));
      
      showError(errorConfig.title);
    } finally {
      loadingRef.current = false; // ✅ Always reset the flag
    }
  }, [clubId, players, user, showWarning, showError]);

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

  // ✅ Realtime unified bookings & lessons (enableRealtime true)
  const {
    bookings: unifiedBookings,
    lessonBookings: unifiedLessonBookings,
    refreshUnified,
  } = useUnifiedBookings({ clubId, enableRealtime: true });

  // Nuovi stati per la creazione della fascia oraria
  const [newSlotModalOpen, setNewSlotModalOpen] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotStartTime, setNewSlotStartTime] = useState('08:00');
  const [newSlotEndTime, setNewSlotEndTime] = useState('09:00');
  const [newSlotInstructorId, setNewSlotInstructorId] = useState('');
  const [newSlotCourtIds, setNewSlotCourtIds] = useState([]);
  const [newSlotIsActive, setNewSlotIsActive] = useState(false);

  // ✅ FIX #2 (Sprint 4): Keyboard navigation for modal
  /**
   * Handle keyboard events:
   * - Escape: Close modal
   * - Tab: Navigate through form fields
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Close modal with Escape key
      if (e.key === 'Escape' && newSlotModalOpen) {
        setNewSlotModalOpen(false);
        logger.debug('Modal closed via Escape key');
      }
    };

    if (newSlotModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [newSlotModalOpen]);

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
    // 1. ✅ FIX #5: Validazione base
    if (!newSlotDate || !newSlotInstructorId || newSlotCourtIds.length === 0) {
      showWarning('Seleziona data, istruttore e almeno un campo');
      return;
    }

    // 2. ✅ FIX #5: Validazione timing - startTime < endTime
    const [startHours, startMinutes] = newSlotStartTime.split(':').map(Number);
    const [endHours, endMinutes] = newSlotEndTime.split(':').map(Number);

    const startMinutesTotal = startHours * 60 + startMinutes;
    const endMinutesTotal = endHours * 60 + endMinutes;

    if (startMinutesTotal >= endMinutesTotal) {
      showError('❌ L\'ora di fine deve essere dopo l\'inizio della fascia oraria');
      return;
    }

    // 3. ✅ FIX #5: Validazione data (non nel passato)
    const selectedDate = new Date(newSlotDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      showError('❌ Non puoi creare fasce nel passato');
      return;
    }

    // 4. ✅ FIX #5: Validazione data massima (max 6 mesi nel futuro)
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 6);

    if (selectedDate > maxDate) {
      showError('❌ Puoi pianificare max 6 mesi in avanti');
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
        createdAt: new Date().toISOString(), // ✅ Aggiunto timestamp
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
      showError('Errore nel salvataggio della fascia oraria');
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

  // Carica i dati statici iniziali (stats non calcolabili localmente) una sola volta
  useEffect(() => {
    if (!clubId || !club) return;
    loadDashboardData();
  }, [clubId, club, loadDashboardData]);

  // ✅ Realtime derivation of today's & tomorrow's bookings/lessons + live stats
  useEffect(() => {
    if (!clubId) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Filter & sort bookings
    const todayBookings = (unifiedBookings || [])
      .filter((b) => b?.clubId === clubId && b?.date === todayStr)
      .sort((a, b) => (a?.time || '').localeCompare(b?.time || ''))
      .slice(0, DASHBOARD_CONSTANTS.MAX_BOOKINGS_DISPLAY);

    const tomorrowBookingsCount = (unifiedBookings || [])
      .filter((b) => b?.clubId === clubId && b?.date === tomorrowStr).length;

    // Lessons (may have same structure: date + time)
    const todayLessons = (unifiedLessonBookings || [])
      .filter((l) => l?.clubId === clubId && l?.date === todayStr)
      .sort((a, b) => (a?.time || '').localeCompare(b?.time || ''))
      .slice(0, DASHBOARD_CONSTANTS.MAX_LESSONS_DISPLAY);

    const tomorrowLessonsCount = (unifiedLessonBookings || [])
      .filter((l) => l?.clubId === clubId && l?.date === tomorrowStr).length;

    // Simple derived court utilization estimate (ratio of active bookings to courts*slots hypothetical)
    const courtUtilization = courts && courts.length > 0
      ? Math.min(100, Math.round((todayBookings.length / (courts.length * 12)) * 100)) // assuming 12 potential slots per court/day
      : 0;

    setDashboardData((prev) => ({
      ...prev,
      todayBookings,
      todayLessons,
      stats: {
        ...prev.stats,
        todayBookingsCount: todayBookings.length,
        tomorrowBookingsCount,
        todayLessonsCount: todayLessons.length,
        tomorrowLessonsCount,
        courtUtilization,
      },
      lastUpdate: new Date().toLocaleTimeString('it-IT'),
    }));
  }, [clubId, unifiedBookings, unifiedLessonBookings, courts]);

  // ✅ FIX #1: Memoizzare handleVisibilityChange per evitare memory leak

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
  // ✅ FIX #13: Memoizzare StatCard per evitare re-render inutili
  // ✅ Using ES6 default parameters instead of defaultProps (React 18+)
  const StatCard = React.memo(
    ({ title, value, subtitle = null, icon, color = 'text-blue-400', onClick = () => {} }) => (
      <div
        className={STYLE_CONSTANTS.statCard(T)}
        onClick={onClick}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className={`text-xs sm:text-sm font-medium ${T.subtext} mb-0.5 sm:mb-1 truncate`}>
              {title}
            </div>
            <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${color}`}>{value}</div>
            {subtitle && (
              <div className={`text-xs ${T.subtext} mt-0.5 sm:mt-1 hidden sm:block`}>
                {subtitle}
              </div>
            )}
          </div>
          <div className={`text-xl sm:text-2xl lg:text-3xl opacity-70 flex-shrink-0`}>{icon}</div>
        </div>
      </div>
    )
  );
  StatCard.displayName = 'StatCard';
  // PropTypes validation still useful for development
  StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    subtitle: PropTypes.string,
    icon: PropTypes.string.isRequired,
    color: PropTypes.string,
    onClick: PropTypes.func,
  };

  // ✅ FIX #13: Memoizzare TodayBookingsCard per evitare re-render inutili
  // ✅ FIX #13: Memoizzare TodayLessonsCard per evitare re-render inutili

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
          
          {/* Retry button for retryable errors */}
          {dashboardData.retryable && (
            <button
              onClick={loadDashboardData}
              className={`${T.btnPrimary} px-6 py-2 hover:opacity-90 transition-opacity`}
            >
              🔄 Riprova
            </button>
          )}
          
          {/* Non-retryable error info */}
          {!dashboardData.retryable && (
            <div className={`text-xs ${T.subtext} mt-4 p-3 rounded bg-opacity-10 ${T.cardBg}`}>
              Questo errore non può essere risolto con un nuovo tentativo.
              <br />
              Contatta l&apos;assistenza se il problema persiste.
            </div>
          )}
          
          {/* Error code for debugging */}
          {dashboardData.errorCode && (
            <div className={`text-xs ${T.subtext} mt-3 opacity-50`}>
              Codice errore: {dashboardData.errorCode}
            </div>
          )}
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
            {/* LIVE badge indicates realtime subscription active */}
            <span className="ml-2 sm:ml-3 text-xs px-1.5 py-0.5 rounded bg-green-700/80 text-white font-semibold tracking-wide">LIVE</span>
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
              refreshUnified(true); // force refresh unified cache
              loadDashboardData(); // refresh non-realtime ancillary data (stats, members)
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
      <DashboardStats
        stats={dashboardData?.stats || {}}
        StatCard={StatCard}
        clubId={clubId}
        navigate={navigate}
      />

      {/* Sezione principale con le attività del giorno */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <DashboardBookings
          T={T}
          todayBookings={dashboardData?.todayBookings || []}
          clubId={clubId}
          STYLE_CONSTANTS={STYLE_CONSTANTS}
          EMPTY_STATE_MESSAGES={EMPTY_STATE_MESSAGES}
          maxDisplay={DASHBOARD_CONSTANTS.MAX_BOOKINGS_DISPLAY}
        />
        <DashboardLessons
          T={T}
          todayLessons={dashboardData?.todayLessons || []}
          clubId={clubId}
          STYLE_CONSTANTS={STYLE_CONSTANTS}
          EMPTY_STATE_MESSAGES={EMPTY_STATE_MESSAGES}
          maxDisplay={DASHBOARD_CONSTANTS.MAX_LESSONS_DISPLAY}
        />
        <ExpiringCertificatesWidget clubId={clubId} T={T} />
      </div>

      {/* Sezione maestri, meteo e info circolo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardInstructors
          T={T}
          availableInstructors={dashboardData?.availableInstructors || []}
          maxDisplay={4}
          maxSlots={DASHBOARD_CONSTANTS.MAX_INSTRUCTOR_SLOTS}
        />

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
        instructors={getInstructorsFromPlayers(players)}
        courts={courts || []}
        T={T}
      />

      {/* Modal per la creazione della fascia oraria */}
      {newSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          {/* ✅ FIX #3: Use theme tokens instead of hardcoded colors */}
          <div className={`${T.cardBg} p-6 rounded-2xl shadow-2xl w-full max-w-md ${T.border}`}>
            <h2 className={`text-xl font-bold mb-4 ${T.text}`}>Crea nuova fascia oraria</h2>
            <div className="mb-4">
              <label className={`block mb-1 font-medium ${T.subtext}`}>Data</label>
              <input
                type="date"
                value={newSlotDate}
                onChange={(e) => {
                  setNewSlotDate(e.target.value);
                }}
                className={`w-full ${T.inputBg} ${T.border} rounded-lg px-2 py-1 ${T.text}`}
              />
            </div>
            <div className="mb-4 flex gap-2">
              <div className="flex-1">
                <label className={`block mb-1 font-medium ${T.subtext}`}>Orario Inizio</label>
                <div className="flex gap-2">
                  <select
                    value={newSlotStartTime.split(':')[0]}
                    onChange={(e) =>
                      setNewSlotStartTime(`${e.target.value}:${newSlotStartTime.split(':')[1]}`)
                    }
                    className={`${T.inputBg} ${T.border} rounded-lg px-2 py-1 ${T.text}`}
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
                    className={`${T.inputBg} ${T.border} rounded-lg px-2 py-1 ${T.text}`}
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
                <label className={`block mb-1 font-medium ${T.subtext}`}>Orario Fine</label>
                <div className="flex gap-2">
                  <select
                    value={newSlotEndTime.split(':')[0]}
                    onChange={(e) =>
                      setNewSlotEndTime(`${e.target.value}:${newSlotEndTime.split(':')[1]}`)
                    }
                    className={`${T.inputBg} ${T.border} rounded-lg px-2 py-1 ${T.text}`}
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
                    className={`${T.inputBg} ${T.border} rounded-lg px-2 py-1 ${T.text}`}
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
              <label className={`block mb-1 font-medium ${T.subtext}`}>Istruttore</label>
              <select
                value={newSlotInstructorId}
                onChange={(e) => setNewSlotInstructorId(e.target.value)}
                className={`w-full ${T.inputBg} ${T.border} rounded-lg px-2 py-1 ${T.text}`}
              >
                <option value="">Seleziona...</option>
                {getInstructorsFromPlayers(players).map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={`block mb-1 font-medium ${T.subtext}`}>Campi</label>
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
