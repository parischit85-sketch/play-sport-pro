import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Badge from '@ui/Badge.jsx';
import PlayersList from '@ui/booking-modal/PlayersList.jsx';
import { createDSClasses } from '@lib/design-system.js';
import { computePrice, getRateInfo, isCourtBookableAt } from '@lib/pricing.js';
import { getDefaultBookingConfig } from '@data/seed.js';
// Legacy LeagueContext rimosso: bookingConfig ora proviene da club settings
import { useClub } from '@contexts/ClubContext.jsx';
import { useClubSettings } from '@hooks/useClubSettings.js';
import { useUnifiedBookings, BOOKING_STATUS } from '@hooks/useUnifiedBookings.js';
import {
  wouldCreateHalfHourHole as checkHoleCreation,
  isTimeSlotTrapped as checkSlotTrapped,
} from '@services/unified-booking-service.js';
import { trackBooking, trackFunnelStep, ConversionFunnels } from '@lib/analytics.js';

function ModernBookingInterface({ user, T, state, setState, clubId }) {
  const ds = createDSClasses(T);
  const { selectedClub } = useClub(); // selectedClub ora dal ClubContext
  const effectiveClubId = clubId || selectedClub?.id;
  const { courts: clubCourts } = useClub();
  const { bookingConfig } = useClubSettings({ clubId: effectiveClubId });

  // Use unified booking service with ALL bookings (court + lesson) for availability checks
  const { bookings: allBookings, createBooking: createUnifiedBooking } = useUnifiedBookings({
    autoLoadUser: false,
    autoLoadLessons: true,
    clubId: clubId || selectedClub?.id,
  });

  // Configurazione prenotazioni per club (fallback minimale se non pronta)
  const cfg = useMemo(() => {
    const defaults = getDefaultBookingConfig();
    return bookingConfig
      ? {
          ...defaults,
          ...bookingConfig,
          addons: {
            ...defaults.addons,
            ...bookingConfig.addons,
          },
        }
      : defaults;
  }, [bookingConfig]);
  // Courts preferiti dal ClubContext (realtime). Fallback a state.courts legacy se vuoto.
  const courtsFromState = useMemo(() => {
    return clubCourts?.length ? clubCourts : Array.isArray(state?.courts) ? state.courts : [];
  }, [clubCourts, state?.courts]);
  // Durate consentite dalla configurazione (fallback 60/90/120)
  const allowedDurations = useMemo(() => {
    let list = cfg?.defaultDurations;
    if (typeof list === 'string') {
      list = list
        .split(',')
        .map((x) => parseInt(String(x).trim(), 10))
        .filter((n) => !Number.isNaN(n));
    }
    if (!Array.isArray(list) || list.length === 0) return [60, 90, 120];
    // Normalizza e ordina
    const set = Array.from(
      new Set(list.filter((n) => [30, 45, 60, 75, 90, 105, 120, 150].includes(Number(n))))
    )
      .map(Number)
      .sort((a, b) => a - b);
    return set.length ? set : [60, 90, 120];
  }, [cfg?.defaultDurations]);

  // References per lo scroll automatico
  const timeSectionRef = useRef(null);
  const courtSectionRef = useRef(null);

  // Stato interfaccia utente
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [duration, setDuration] = useState(60);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [lighting, setLighting] = useState(false);
  const [heating, setHeating] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [players, setPlayers] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showErrorAnimation, setShowErrorAnimation] = useState(false);
  const [activeCourtFilter, setActiveCourtFilter] = useState('all'); // Filtro per tipologia campo

  // Stato dati prenotazioni
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Initialize players with current user when user is available
  useEffect(() => {
    if (user && players.length === 0) {
      setPlayers([
        {
          id: user.uid || 'me',
          name: user.displayName || user.email,
          email: user.email,
          phone: user.phone,
          uid: user.uid,
          avatar: user.photoURL,
          isGuest: false,
        },
      ]);
    }
  }, [user, players.length]);

  // Mantieni la durata selezionata entro quelle consentite
  useEffect(() => {
    if (!allowedDurations.includes(duration)) {
      setDuration(allowedDurations[0] || 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedDurations.join(',')]);

  // Helper function to check slot availability using unified service data
  const isSlotAvailable = useCallback(
    (courtId, date, time, checkDuration = 60) => {
      if (!courtId || !date || !time) return false;

      const startDateTime = new Date(`${date}T${time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + checkDuration * 60000);

      return !allBookings.some((booking) => {
        if (booking.courtId !== courtId) return false;

        // Check if booking is active (confirmed or pending)
        const status = booking.status || BOOKING_STATUS.CONFIRMED; // Default to confirmed
        if (status === BOOKING_STATUS.CANCELLED) return false; // Skip cancelled bookings

        const bookingStart = new Date(booking.start || `${booking.date}T${booking.time}:00`);
        const bookingEnd = new Date(bookingStart.getTime() + (booking.duration || 60) * 60000);

        return (
          (startDateTime >= bookingStart && startDateTime < bookingEnd) ||
          (endDateTime > bookingStart && endDateTime <= bookingEnd) ||
          (startDateTime <= bookingStart && endDateTime >= bookingEnd)
        );
      });
    },
    [allBookings]
  );

  // Hole prevention rule
  const wouldCreateHalfHourHole = useCallback(
    (courtId, date, time, checkDuration) => {
      if (!courtId || !date || !time || !checkDuration) return false;

      // Convert allBookings to the format expected by unified service
      const existingBookings = allBookings.map((booking) => ({
        courtId: booking.courtId,
        date: booking.date || (booking.start ? booking.start.split('T')[0] : ''),
        time: booking.time || (booking.start ? booking.start.split('T')[1].substring(0, 5) : ''),
        duration: booking.duration || 60,
        status: booking.status || 'confirmed',
      }));

      // Use the imported hole prevention function
      const result = checkHoleCreation(courtId, date, time, checkDuration, existingBookings);

      return result;
    },
    [allBookings]
  );

  // Wrapper for trapped logic - check if slot is in a trapped state
  const isTimeSlotTrapped = useCallback(
    (courtId, date, time, checkDuration) => {
      if (!courtId || !date || !time || !checkDuration) return false;

      // Convert allBookings to the format expected by unified service
      const existingBookings = allBookings.map((booking) => ({
        courtId: booking.courtId,
        date: booking.date || (booking.start ? booking.start.split('T')[0] : ''),
        time: booking.time || (booking.start ? booking.start.split('T')[1].substring(0, 5) : ''),
        duration: booking.duration || 60,
        status: booking.status || 'confirmed',
      }));

      // Use the imported trapped slot logic from unified service
      const result = checkSlotTrapped(courtId, date, time, checkDuration, existingBookings);

      return result;
    },
    [allBookings]
  );

  // Scroll function for better UX
  const scrollToSection = (ref, delay = 100) => {
    if (ref?.current) {
      setTimeout(() => {
        if (ref.current) {
          ref.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
          });
        }
      }, delay); // Delay ridotto per maggiore reattività
    }
  };

  // Seleziona automaticamente la data di oggi
  useEffect(() => {
    if (!selectedDate) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setSelectedDate(`${year}-${month}-${day}`);
    }
  }, [selectedDate]);

  // Reset heating quando si cambia campo e il nuovo non supporta il riscaldamento
  useEffect(() => {
    if (selectedCourt && !selectedCourt.hasHeating && heating) {
      setHeating(false);
    }
  }, [selectedCourt, heating]);

  // Scroll automatico ai campi quando si seleziona un orario
  useEffect(() => {
    if (selectedTime && courtSectionRef.current) {
      // Piccolo delay per assicurarsi che la sezione campi sia renderizzata
      setTimeout(() => {
        scrollToSection(courtSectionRef, 50);
      }, 100);
    }
  }, [selectedTime]);

  // Helper: verifica che l'intera durata rientri nella stessa fascia attiva del campo
  const isDurationWithinSchedule = useCallback(
    (startDate, durationMin, courtId) => {
      if (!startDate || !courtId) return false;
      const court = courtsFromState.find((c) => c.id === courtId);
      if (!court?.timeSlots?.length) return false;
      const day = startDate.getDay();
      const startMin = startDate.getHours() * 60 + startDate.getMinutes();
      const toMin = (hhmm = '00:00') => {
        const [h, m] = String(hhmm)
          .split(':')
          .map((n) => +n || 0);
        return h * 60 + m;
      };
      const active = court.timeSlots.find(
        (slot) =>
          Array.isArray(slot.days) &&
          slot.days.includes(day) &&
          startMin >= toMin(slot.from) &&
          startMin < toMin(slot.to)
      );
      if (!active) return false;
      const endMin = startMin + Number(durationMin || 0);
      return endMin <= toMin(active.to);
    },
    [courtsFromState]
  );

  // Controlla la disponibilità degli slot temporali
  // Controlla se almeno una durata è prenotabile per questo slot
  const checkSlotAvailability = useCallback(
    (courtId, date, time) => {
      // Testa tutte le durate possibili (60, 90, 120)
      const possibleDurations = [60, 90, 120].filter((d) => allowedDurations.includes(d));

      return possibleDurations.some((testDuration) => {
        // Verifica disponibilità base
        if (!isSlotAvailable(courtId, date, time, testDuration)) return false;

        // Verifica se è dentro l'orario del campo
        const dt = new Date(`${date}T${time}:00`);
        if (!isDurationWithinSchedule(dt, testDuration, courtId)) return false;

        // Controllo sovrapposizione esplicito
        const startDateTime = new Date(`${date}T${time}:00`);
        const endDateTime = new Date(startDateTime.getTime() + testDuration * 60000);

        const hasOverlap = allBookings.some((booking) => {
          if (booking.courtId !== courtId) return false;
          const status = booking.status || 'confirmed';
          if (status === 'cancelled') return false;

          const bookingStart = new Date(booking.start || `${booking.date}T${booking.time}:00`);
          const bookingEnd = new Date(bookingStart.getTime() + (booking.duration || 60) * 60000);

          return startDateTime < bookingEnd && endDateTime > bookingStart;
        });

        if (hasOverlap) return false;

        // Controlla se creerebbe un buco e se è intrappolato
        const hole = wouldCreateHalfHourHole(courtId, date, time, testDuration);
        if (hole) {
          const isTrapped = isTimeSlotTrapped(courtId, date, time, testDuration, allBookings);
          if (!isTrapped) return false;
        }

        return true; // Questa durata è prenotabile
      });
    },
    [
      allowedDurations,
      isSlotAvailable,
      isDurationWithinSchedule,
      allBookings,
      wouldCreateHalfHourHole,
      isTimeSlotTrapped,
    ]
  );

  // Genera i giorni disponibili per la prenotazione
  const availableDays = useMemo(() => {
    const days = [];
    const daysNames = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      days.push({
        date: dateStr,
        dayName: daysNames[date.getDay()],
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString('it-IT', { month: 'short' }),
        isToday: i === 0,
      });
    }
    return days;
  }, []);

  // Genera gli slot orari disponibili con griglia responsiva
  const timeSlots = useMemo(() => {
    const slots = [];
    const start = cfg.dayStartHour || 8;
    const end = cfg.dayEndHour || 23;
    const step = cfg.slotMinutes || 30;

    const now = new Date();
    const today = new Date().toISOString().split('T')[0];

    for (let hour = start; hour < end; hour++) {
      for (let minute = 0; minute < 60; minute += step) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

        // Salta gli orari passati se si prenota per oggi
        if (selectedDate === today) {
          const slotDateTime = new Date(`${selectedDate}T${timeStr}:00`);
          if (slotDateTime <= now) {
            continue;
          }
        }

        // Controlli per motivo di indisponibilità
        const slotDate = new Date(`${selectedDate}T${timeStr}:00`);
        let anyScheduleOk = false;
        let anyFreeIgnoringHole = false;
        let anyOccupied = false;
        let availableCourtsCount = 0;

        for (const court of courtsFromState) {
          const scheduleOk = isCourtBookableAt(slotDate, court.id, courtsFromState);
          if (!scheduleOk) continue;
          anyScheduleOk = true;
          const free = checkSlotAvailability(court.id, selectedDate, timeStr);
          if (!free) {
            anyOccupied = true;
            continue;
          }
          anyFreeIgnoringHole = true;
          availableCourtsCount++;
          // 30-minute hole prevention rule disabled - no hole checking
        }

        // Un orario è disponibile se:
        // - Almeno un campo è nel programma operativo E
        // - Almeno un campo è libero
        const isAvailable = anyScheduleOk && anyFreeIgnoringHole;
        let reason = null;
        if (!isAvailable) {
          if (!anyScheduleOk) reason = 'out-of-schedule';
          else if (anyOccupied && !anyFreeIgnoringHole) reason = 'occupied';
        }

        // Mostra lo slot se non si filtra o se è disponibile
        if (!showOnlyAvailable || isAvailable) {
          slots.push({
            time: timeStr,
            isAvailable,
            availableCourts: availableCourtsCount,
            totalCourts: courtsFromState.length,
            reason,
          });
        }
      }
    }
    return slots;
  }, [selectedDate, courtsFromState, checkSlotAvailability, showOnlyAvailable, cfg]);

  // Verifica se un campo ha una fascia promo attiva per un determinato orario
  const hasPromoSlot = (courtId, datetime) => {
    if (!datetime) return false;
    const info = getRateInfo(datetime, cfg, courtId, courtsFromState);
    return info.isPromo || false;
  };

  // Gestisce il processo di prenotazione
  const handleBooking = async () => {
    if (!user) {
      setMessage({
        type: 'error',
        text: 'Devi effettuare il login per prenotare un campo',
      });
      return;
    }

    if (!selectedDate || !selectedTime || !selectedCourt) {
      setMessage({ type: 'error', text: 'Seleziona data, orario e campo' });
      return;
    }

    // Controlla la disponibilità usando unified service
    const isAvailable = isSlotAvailable(selectedCourt.id, selectedDate, selectedTime, duration);
    if (!isAvailable) {
      // Mostra animazione di errore
      setShowErrorAnimation(true);
      setTimeout(() => {
        setShowErrorAnimation(false);
      }, 3000);

      return;
    }

    // Controllo esplicito di sovrapposizione nel modal di conferma
    const startDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    const hasOverlap = allBookings.some((booking) => {
      if (booking.courtId !== selectedCourt.id) return false;

      // Salta prenotazioni cancellate
      const status = booking.status || 'confirmed';
      if (status === 'cancelled') return false;

      // Calcola inizio e fine della prenotazione esistente
      const bookingStart = new Date(booking.start || `${booking.date}T${booking.time}:00`);
      const bookingEnd = new Date(bookingStart.getTime() + (booking.duration || 60) * 60000);

      // Controlla sovrapposizione
      return startDateTime < bookingEnd && endDateTime > bookingStart;
    });

    if (hasOverlap) {
      setMessage({
        type: 'error',
        text: `❌ Prenotazione non consentita: si sovrappone con una prenotazione esistente. Scegli un orario diverso.`,
      });
      // Mostra animazione di errore
      setShowErrorAnimation(true);
      setTimeout(() => {
        setShowErrorAnimation(false);
      }, 3000);
      return;
    }

    // Hole prevention check before creating booking
    const wouldCreateHole = wouldCreateHalfHourHole(
      selectedCourt.id,
      selectedDate,
      selectedTime,
      duration
    );
    if (wouldCreateHole) {
      setMessage({
        type: 'error',
        text: `❌ Prenotazione non consentita: creerebbe uno slot di 30 minuti non utilizzabile. Scegli un orario diverso.`,
      });
      // Mostra animazione di errore
      setShowErrorAnimation(true);
      setTimeout(() => {
        setShowErrorAnimation(false);
      }, 3000);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    // Track booking attempt
    trackBooking.createAttempt(selectedCourt?.type || 'court');
    trackFunnelStep(ConversionFunnels.BOOKING_FLOW.name, 'booking_confirmation');

    try {
      const bookingData = {
        courtId: selectedCourt.id,
        courtName: selectedCourt.name,
        date: selectedDate,
        time: selectedTime,
        duration,
        lighting: !!lighting,
        heating: !!heating,
        price: computePrice(
          new Date(`${selectedDate}T${selectedTime}:00`),
          duration,
          cfg,
          { lighting: !!lighting, heating: !!heating },
          selectedCourt.id,
          courtsFromState
        ),
        userPhone: userPhone,
        notes: notes,
        players: players, // Pass full player objects to preserve UIDs for notifications
        type: 'court',
      };

      await createUnifiedBooking({ ...bookingData, clubId: clubId || selectedClub?.id });

      // Track successful booking
      trackBooking.createSuccess(
        `booking-${Date.now()}`,
        selectedCourt?.type || 'court',
        duration,
        bookingData.price
      );

      // Update App state for immediate reflection
      if (state && setState) {
        // Il servizio unificato gestisce automaticamente lo stato
        // setState((s) => ({ ...s, bookings: [...(s.bookings || []), toAppBooking] }));
      }

      // Mostra animazione di successo
      setShowSuccessAnimation(true);
      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 3000);

      // Ripristina il modulo
      setSelectedTime('');
      setSelectedCourt(null);
      setLighting(false);
      setHeating(false);
      setUserPhone('');
      setNotes('');
      // Reset players to just the user
      setPlayers([
        {
          id: user.uid || 'me',
          name: user.displayName || user.email,
          email: user.email,
          phone: user.phone,
          uid: user.uid,
          avatar: user.photoURL,
          isGuest: false,
        },
      ]);
      setShowBookingModal(false);

      setMessage({
        type: 'success',
        text: `Prenotazione confermata! Campo ${selectedCourt?.name} il ${new Date(selectedDate).toLocaleDateString('it-IT')} alle ${selectedTime}`,
      });
    } catch (error) {
      // Track failed booking
      trackBooking.createFailed(error.message, selectedCourt?.type || 'court');

      setMessage({
        type: 'error',
        text: 'Errore durante la prenotazione. Riprova.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestisce il click su uno slot orario
  const handleTimeSlotClick = async (timeSlot) => {
    console.log('🕐 Click on time slot:', timeSlot.time, 'isAvailable:', timeSlot.isAvailable);
    if (!timeSlot.isAvailable) return;

    // Il servizio unificato gestisce automaticamente l'aggiornamento dei dati
    // Non è più necessario aggiornare manualmente le prenotazioni

    // Ricontrolla la disponibilità
    const stillAvailable = courtsFromState.some((court) => {
      const dt = new Date(`${selectedDate}T${timeSlot.time}:00`);
      const scheduleOk = isCourtBookableAt(dt, court.id, courtsFromState);
      const free = isSlotAvailable(court.id, selectedDate, timeSlot.time, duration, allBookings);
      const hole = wouldCreateHalfHourHole(
        court.id,
        selectedDate,
        timeSlot.time,
        duration,
        allBookings
      );
      const isTrapped = isTimeSlotTrapped(
        court.id,
        selectedDate,
        timeSlot.time,
        duration,
        allBookings
      );
      // Deroga per slot intrappolati: è disponibile anche se crea buco
      return scheduleOk && free && (!hole || isTrapped);
    });

    if (!stillAvailable) {
      setMessage({
        type: 'error',
        text: 'Questo orario è appena stato prenotato. Seleziona un altro slot.',
      });
      return;
    }

    // Imposta l'orario selezionato - lo scroll avverrà nel useEffect
    setSelectedTime(timeSlot.time);

    // Track time selection in booking funnel
    trackFunnelStep(ConversionFunnels.BOOKING_FLOW.name, 'time_selection', {
      selected_time: timeSlot.time,
      selected_date: selectedDate,
    });

    // Se c'è solo un campo disponibile, selezionalo automaticamente
    const availableCourts = courtsFromState.filter((court) => {
      const dt = new Date(`${selectedDate}T${timeSlot.time}:00`);
      const scheduleOk = isCourtBookableAt(dt, court.id, courtsFromState);
      const free = checkSlotAvailability(court.id, selectedDate, timeSlot.time);
      const hole = wouldCreateHalfHourHole(
        court.id,
        selectedDate,
        timeSlot.time,
        duration,
        allBookings
      );
      const isTrapped = isTimeSlotTrapped(
        court.id,
        selectedDate,
        timeSlot.time,
        duration,
        allBookings
      );
      // Deroga per slot intrappolati: è disponibile anche se crea buco
      return scheduleOk && free && (!hole || isTrapped);
    });

    if (availableCourts.length === 1) {
      setSelectedCourt(availableCourts[0]);
      setShowBookingModal(true);
    }
  };

  const totalPrice =
    selectedCourt && selectedDate && selectedTime
      ? computePrice(
          new Date(`${selectedDate}T${selectedTime}:00`),
          duration,
          cfg,
          { lighting, heating },
          selectedCourt.id,
          courtsFromState
        )
      : 0;

  // Helper: verifica se una specifica durata è prenotabile per il campo/ora selezionati
  const isDurationOptionBookable = useCallback(
    (dur) => {
      if (!selectedCourt || !selectedDate || !selectedTime) return false;

      const dt = new Date(`${selectedDate}T${selectedTime}:00`);
      const scheduleOk = isDurationWithinSchedule(dt, dur, selectedCourt.id);
      if (!scheduleOk) return false;

      // Usa isSlotAvailable che già gestisce correttamente le sovrapposizioni
      const free = isSlotAvailable(selectedCourt.id, selectedDate, selectedTime, dur);
      if (!free) return false;

      const hole = wouldCreateHalfHourHole(selectedCourt.id, selectedDate, selectedTime, dur);

      // Applica deroga per slot intrappolati: se crea buco ma è intrappolato, è comunque prenotabile
      if (hole) {
        const isTrapped = isTimeSlotTrapped(
          selectedCourt.id,
          selectedDate,
          selectedTime,
          dur,
          allBookings
        );
        if (!isTrapped) return false; // Se crea buco e NON è intrappolato, non prenotabile
      }
      return true;
    },
    [
      selectedCourt,
      selectedDate,
      selectedTime,
      allBookings,
      isDurationWithinSchedule,
      isSlotAvailable,
      wouldCreateHalfHourHole,
      isTimeSlotTrapped,
    ]
  );

  // Elenco durate effettivamente disponibili in base a regole e fascia
  const effectiveAvailableDurations = useMemo(() => {
    const candidates = [60, 90, 120].filter((d) => allowedDurations.includes(d));
    if (!selectedCourt || !selectedDate || !selectedTime) return candidates; // niente da filtrare finché non selezionati
    return candidates.filter((d) => isDurationOptionBookable(d));
  }, [allowedDurations, selectedCourt, selectedDate, selectedTime, isDurationOptionBookable]);

  // Se la durata corrente non è disponibile, auto-seleziona la prima disponibile
  useEffect(() => {
    if (!effectiveAvailableDurations.includes(duration)) {
      if (effectiveAvailableDurations.length) setDuration(effectiveAvailableDurations[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveAvailableDurations.join(',')]);

  // Logica di filtraggio per tipologia campo
  const availableCourtTypes = useMemo(() => {
    return [...new Set(courtsFromState.map((court) => court.courtType).filter(Boolean))];
  }, [courtsFromState]);

  const courtTypeCounts = useMemo(() => {
    return availableCourtTypes.reduce((acc, type) => {
      acc[type] = courtsFromState.filter((court) => court.courtType === type).length;
      return acc;
    }, {});
  }, [availableCourtTypes, courtsFromState]);

  const filteredCourtsForDisplay = useMemo(() => {
    return activeCourtFilter === 'all'
      ? courtsFromState
      : courtsFromState.filter((court) => court.courtType === activeCourtFilter);
  }, [activeCourtFilter, courtsFromState]);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header mobile-friendly */}
      <div className="bg-gray-800 border-b border-emerald-600 px-4 py-3 sm:hidden">
        <h1 className="text-lg font-semibold text-white">Prenota Campo</h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Messaggi di stato - Ottimizzati per mobile */}
        {message && (
          <div
            className={`mb-6 p-3 sm:p-4 rounded-lg text-sm ${
              message.type === 'error'
                ? 'bg-red-900/30 text-red-200 border border-red-800'
                : 'bg-emerald-900/30 text-emerald-200 border border-emerald-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Selezione Giorno - Migliorata per mobile */}
        <div className="bg-gray-800 rounded-lg shadow-sm border-2 border-gray-600 p-3 sm:p-6 mb-4 sm:mb-6">
          <h2 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">
            Seleziona il giorno
          </h2>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
              {availableDays.slice(0, 10).map((day) => (
                <button
                  key={day.date}
                  onClick={() => {
                    setSelectedDate(day.date);
                    setSelectedTime('');
                    setSelectedCourt(null);

                    // Track date selection in booking funnel
                    trackFunnelStep(ConversionFunnels.BOOKING_FLOW.name, 'court_selection', {
                      selected_date: day.date,
                    });

                    // Scorri agli orari quando si seleziona un giorno
                    scrollToSection(timeSectionRef, 200);
                  }}
                  className={`flex-shrink-0 p-2 sm:p-3 rounded-lg border-2 text-center transition-all min-w-[60px] sm:min-w-[80px] ${
                    selectedDate === day.date
                      ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                      : 'bg-gray-700/60 border-gray-600 hover:border-gray-500 hover:bg-gray-600 active:bg-gray-600 text-gray-100'
                  }`}
                >
                  <div className="text-xs font-medium mb-1">{day.dayName}</div>
                  <div className="text-base sm:text-lg font-bold">{day.dayNumber}</div>
                  <div className="text-xs opacity-75">{day.monthName}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Griglia Orari - Ottimizzata per touch */}
        {selectedDate && (
          <div
            ref={timeSectionRef}
            className="bg-gray-800 rounded-lg shadow-sm border-2 border-gray-600 p-3 sm:p-6 mb-4 sm:mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3">
              <h2 className="font-semibold text-white text-sm sm:text-base">
                Seleziona l&apos;orario
              </h2>
              <label className="flex items-center gap-2 text-xs sm:text-sm">
                <input
                  type="checkbox"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                  className="rounded text-blue-500"
                />
                <span className="text-gray-300">Solo orari disponibili</span>
              </label>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-8 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => handleTimeSlotClick(slot)}
                  disabled={!slot.isAvailable}
                  className={`p-3 sm:p-3 rounded-lg border-2 text-center transition-all relative min-h-[56px] touch-manipulation ${
                    selectedTime === slot.time
                      ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                      : slot.isAvailable
                        ? 'bg-gray-700/60 border-gray-600 hover:border-blue-500 hover:bg-blue-900/30 cursor-pointer active:bg-blue-900/50 text-gray-100'
                        : 'bg-gray-700 border-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <div className="font-medium text-sm sm:text-base">{slot.time}</div>
                  {!slot.isAvailable && (
                    <div className="text-xs mt-1">
                      {slot.reason === 'out-of-schedule' ? 'Fuori orario disponibile' : 'Occupato'}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {timeSlots.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {showOnlyAvailable
                  ? 'Nessun orario disponibile per questo giorno'
                  : 'Nessun orario configurato'}
              </div>
            )}
          </div>
        )}

        {/* Selezione Campo - Mobile-first design */}
        {selectedTime && (
          <div
            ref={courtSectionRef}
            className="bg-gray-800 rounded-lg shadow-sm border-2 border-gray-600 p-3 sm:p-6 mb-4 sm:mb-6"
          >
            {/* Header con titolo e filtri affiancati */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="font-semibold text-white text-sm sm:text-base">Prenota un campo</h2>

              {/* Filtri per tipologia campo - affiancati al titolo */}
              {availableCourtTypes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCourtFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeCourtFilter === 'all'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-200 hover:bg-blue-900/30'
                    }`}
                  >
                    Tutti ({courtsFromState.length})
                  </button>
                  {availableCourtTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActiveCourtFilter(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                        activeCourtFilter === type
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-gray-700 text-gray-200 hover:bg-blue-900/30'
                      }`}
                    >
                      {type} ({courtTypeCounts[type]})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Messaggio quando nessun campo corrisponde al filtro */}
            {filteredCourtsForDisplay.length === 0 && activeCourtFilter !== 'all' && (
              <div className="mb-4 text-center py-4 px-3 bg-gray-700 rounded-lg border border-gray-600">
                <div className="text-sm text-gray-400">
                  Nessun campo di tipo &quot;{activeCourtFilter}&quot; disponibile
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCourtFilter('all')}
                  className="mt-2 text-xs text-blue-400 hover:underline font-medium"
                >
                  Mostra tutti i campi
                </button>
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
              {filteredCourtsForDisplay.map((court) => {
                console.log(
                  '🎾 Rendering court:',
                  court.name,
                  'timeSlots:',
                  court.timeSlots?.length || 0
                );
                const slotDate = new Date(`${selectedDate}T${selectedTime}:00`);
                const isWithinSchedule = isCourtBookableAt(slotDate, court.id, courtsFromState);
                const free = checkSlotAvailability(court.id, selectedDate, selectedTime);
                const hole = wouldCreateHalfHourHole(
                  court.id,
                  selectedDate,
                  selectedTime,
                  duration
                );
                const isTrapped = isTimeSlotTrapped(
                  court.id,
                  selectedDate,
                  selectedTime,
                  duration,
                  allBookings
                );

                // Usa la stessa logica di handleTimeSlotClick per consistenza
                const isAvailable = isWithinSchedule && free && (!hole || isTrapped);
                return (
                  <div
                    key={court.id}
                    role="button"
                    tabIndex={isAvailable ? 0 : -1}
                    onKeyDown={(e) => {
                      if (isAvailable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        setSelectedCourt(court);
                        setShowBookingModal(true);
                        trackFunnelStep(ConversionFunnels.BOOKING_FLOW.name, 'player_selection', {
                          court_id: court.id,
                          court_name: court.name,
                          court_type: court.type,
                        });
                      }
                    }}
                    onClick={() => {
                      console.log(
                        '🏓 Click on court:',
                        court.name,
                        'isAvailable:',
                        isAvailable,
                        'courtId:',
                        court.id
                      );
                      if (isAvailable) {
                        setSelectedCourt(court);
                        setShowBookingModal(true);

                        // Track court selection in booking funnel
                        trackFunnelStep(ConversionFunnels.BOOKING_FLOW.name, 'player_selection', {
                          court_id: court.id,
                          court_name: court.name,
                          court_type: court.type,
                        });
                      } else {
                        console.log('❌ Court not available:', {
                          isWithinSchedule,
                          free,
                          hole,
                          isTrapped,
                        });
                      }
                    }}
                    className={`border-2 rounded-xl p-4 sm:p-5 transition-all duration-300 touch-manipulation ${
                      isAvailable
                        ? 'bg-gray-700/60 border-gray-600 hover:shadow-lg hover:shadow-blue-900/20 cursor-pointer hover:border-blue-500 hover:bg-blue-900/20 active:bg-blue-900/30 transform hover:scale-105 hover:-translate-y-1'
                        : 'bg-gray-700 border-gray-700 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div>
                            <h3
                              className={`font-bold text-base sm:text-lg ${
                                isAvailable ? 'text-white' : 'text-gray-400'
                              }`}
                            >
                              {court.name}
                            </h3>
                            {isAvailable && court.premium && (
                              <Badge variant="warning" size="xs" T={T}>
                                ⭐ Premium
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Badge per promozione */}
                        {isAvailable &&
                          selectedDate &&
                          selectedTime &&
                          hasPromoSlot(
                            court.id,
                            new Date(`${selectedDate}T${selectedTime}:00`)
                          ) && (
                            <div className="mb-3">
                              <Badge variant="success" size="sm" T={T}>
                                🏷️ Offerta Speciale
                              </Badge>
                            </div>
                          )}

                        {isAvailable && court.features && court.features.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {court.features.map((feature, index) => (
                              <span
                                key={index}
                                className="px-2.5 py-1 bg-blue-900/30 text-blue-300 text-xs font-medium rounded-full border border-blue-700"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-right flex flex-col items-end">
                        {isAvailable ? (
                          <>
                            <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white px-4 py-2 rounded-xl shadow-lg mb-2">
                              <div className="text-2xl sm:text-3xl font-bold">
                                {computePrice(
                                  new Date(`${selectedDate}T${selectedTime}:00`),
                                  90,
                                  cfg,
                                  {},
                                  court.id,
                                  courtsFromState
                                )}
                                €
                              </div>
                              <div className="text-xs opacity-90">90 minuti</div>
                            </div>
                            <div className="bg-gray-600 text-gray-300 px-3 py-1 rounded-lg text-xs font-medium">
                              {(
                                computePrice(
                                  new Date(`${selectedDate}T${selectedTime}:00`),
                                  90,
                                  cfg,
                                  {},
                                  court.id,
                                  courtsFromState
                                ) / Math.max(1, court.maxPlayers || 4)
                              )
                                .toFixed(1)
                                .replace('.', ',')}
                              € x {court.maxPlayers || 4} Giocatori
                            </div>
                          </>
                        ) : (
                          <div className="text-center bg-gray-700 px-4 py-3 rounded-xl">
                            <div className="text-lg font-bold text-red-400 mb-1">
                              Non disponibile
                            </div>
                            <div className="text-xs text-red-400">
                              {!isWithinSchedule ? 'Fuori orario' : 'Già prenotato'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal - Premium Redesign */}
      {showBookingModal && selectedCourt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fade-in">
          {/* Mobile: Full screen bottom sheet with glass effect */}
          <div className="bg-slate-900 w-full h-auto max-h-[95vh] sm:max-w-md sm:max-h-[90vh] sm:rounded-2xl rounded-t-3xl flex flex-col slide-up-mobile sm:animate-none shadow-2xl shadow-black/50 border border-white/10 ring-1 ring-white/5">
            {/* Mobile handle bar */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
            </div>

            {/* Header Premium Compact */}
            <div className="px-4 py-2 border-b border-white/5 flex-shrink-0 flex justify-between items-center bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Riepilogo Prenotazione
                </h3>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white touch-manipulation"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Contenuto scrollabile */}
            <div className="flex-1 overflow-y-auto px-5 py-4 sm:p-6 custom-scrollbar">
              {/* Riepilogo Card - BookingHeader Style */}
              <div className="relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 shadow-lg group mb-6">
                {/* Background Glow Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-70" />

                {/* Left Accent Bar */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-blue-600" />

                <div className="p-4 pl-6 flex items-center justify-between relative z-10">
                  {/* Left: Time, Date, Court */}
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-baseline gap-2.5 mb-1">
                      <span className="text-3xl font-bold text-white tracking-tight leading-none">
                        {selectedTime}
                      </span>
                      <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                        {new Date(selectedDate).toLocaleDateString('it-IT', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-300">
                      <h2 className="font-medium text-sm truncate text-gray-200">
                        {selectedCourt.name}
                      </h2>
                      <span className="text-gray-600 text-xs">•</span>
                      <span className="text-xs text-gray-400 font-medium">{duration} min</span>
                    </div>
                  </div>

                  {/* Right: Price */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xl font-bold text-blue-400">
                      €
                      {computePrice(
                        new Date(`${selectedDate}T${selectedTime}:00`),
                        duration,
                        cfg,
                        { lighting, heating },
                        selectedCourt.id,
                        courtsFromState
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Durata - Card Style Selection */}
              <div className="mb-8">
                <div className="text-sm font-bold mb-4 text-white flex items-center gap-2">
                  <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                  Durata partita
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[60, 90, 120].map((dur) => {
                    const price = computePrice(
                      new Date(`${selectedDate}T${selectedTime}:00`),
                      dur,
                      cfg,
                      { lighting, heating },
                      selectedCourt.id,
                      courtsFromState
                    );
                    const maxPlayers = selectedCourt?.maxPlayers || 4;
                    const pricePerPerson = (price / Math.max(1, maxPlayers))
                      .toFixed(1)
                      .replace('.', ',');
                    const isAllowedDuration = allowedDurations.includes(dur);
                    const isBookableDuration = isAllowedDuration && isDurationOptionBookable(dur);
                    const isSelected = duration === dur;

                    return (
                      <button
                        key={dur}
                        onClick={() => isBookableDuration && setDuration(dur)}
                        disabled={!isBookableDuration}
                        className={`relative p-3 rounded-xl border transition-all duration-200 touch-manipulation group overflow-hidden ${
                          !isBookableDuration
                            ? 'bg-slate-800/50 border-slate-700/50 text-slate-500 cursor-not-allowed opacity-60'
                            : isSelected
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/50 ring-2 ring-emerald-500/50 ring-offset-2 ring-offset-slate-900'
                              : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700 hover:border-white/20'
                        }`}
                      >
                        {!isBookableDuration ? (
                          <div className="flex flex-col items-center justify-center h-full py-1">
                            <div className="font-bold text-lg">{dur}&apos;</div>
                            <div className="text-[10px] font-bold mt-1 text-red-400 uppercase tracking-wide">
                              Occupato
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full py-1">
                            <div className="font-bold text-xl mb-0.5">{dur}&apos;</div>
                            <div
                              className={`text-sm font-bold ${isSelected ? 'text-emerald-100' : 'text-emerald-400'}`}
                            >
                              {price}€
                            </div>
                            <div
                              className={`text-[10px] mt-1 ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}
                            >
                              {pricePerPerson}€/p
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Servizi Extra - Modern Toggles */}
              {(cfg.addons?.lightingEnabled || cfg.addons?.heatingEnabled) && (
                <div className="mb-8">
                  <div className="text-sm font-bold mb-4 text-white flex items-center gap-2">
                    <span className="w-1 h-4 bg-yellow-500 rounded-full"></span>
                    Servizi Extra
                  </div>
                  <div className="space-y-3">
                    {cfg.addons?.lightingEnabled && (
                      <label
                        className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                          lighting
                            ? 'bg-yellow-500/10 border-yellow-500/50 shadow-lg shadow-yellow-900/20'
                            : 'bg-slate-800 border-white/5 hover:bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                            lighting ? 'bg-yellow-500 text-white' : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          💡
                        </div>
                        <div className="flex-1">
                          <div
                            className={`font-semibold ${lighting ? 'text-yellow-400' : 'text-white'}`}
                          >
                            Illuminazione
                          </div>
                          <div className="text-xs text-slate-400">
                            Supplemento di +{cfg.addons?.lightingFee || 0}€
                          </div>
                        </div>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={lighting}
                            onChange={(e) => setLighting(e.target.checked)}
                            className="sr-only"
                          />
                          <div
                            className={`w-12 h-7 rounded-full transition-colors ${lighting ? 'bg-yellow-500' : 'bg-slate-600'}`}
                          ></div>
                          <div
                            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${lighting ? 'translate-x-5' : 'translate-x-0'}`}
                          ></div>
                        </div>
                      </label>
                    )}
                    {cfg.addons?.heatingEnabled && selectedCourt?.hasHeating && (
                      <label
                        className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                          heating
                            ? 'bg-orange-500/10 border-orange-500/50 shadow-lg shadow-orange-900/20'
                            : 'bg-slate-800 border-white/5 hover:bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                            heating ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          🔥
                        </div>
                        <div className="flex-1">
                          <div
                            className={`font-semibold ${heating ? 'text-orange-400' : 'text-white'}`}
                          >
                            Riscaldamento
                          </div>
                          <div className="text-xs text-slate-400">
                            Supplemento di +{cfg.addons?.heatingFee || 0}€
                          </div>
                        </div>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={heating}
                            onChange={(e) => setHeating(e.target.checked)}
                            className="sr-only"
                          />
                          <div
                            className={`w-12 h-7 rounded-full transition-colors ${heating ? 'bg-orange-500' : 'bg-slate-600'}`}
                          ></div>
                          <div
                            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${heating ? 'translate-x-5' : 'translate-x-0'}`}
                          ></div>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Giocatori - PlayersList Integration */}
              <div className="mb-8">
                <div className="text-sm font-bold mb-4 text-white flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                  Giocatori
                </div>
                <div className="bg-slate-800/50 rounded-xl border border-white/5 p-1">
                  <PlayersList
                    booking={{
                      userName: user?.displayName || user?.email || 'Organizzatore',
                      players: players,
                    }}
                    isEditingPlayers={true}
                    editedPlayers={players}
                    setEditedPlayers={setPlayers}
                    hideEditControls={true}
                  />
                </div>
              </div>

              {/* Prezzo finale - Premium Gradient */}
              <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 p-5 rounded-2xl border border-emerald-500/30 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-[url('/patterns/grid.svg')] opacity-10"></div>

                <div className="flex justify-between items-end mb-3 relative z-10">
                  <div>
                    <span className="block text-sm text-emerald-200/70 font-medium mb-1">
                      Totale da pagare
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-emerald-400">{totalPrice}</span>
                      <span className="text-xl font-semibold text-emerald-500">€</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-emerald-200/70 mb-1">Quota a persona</span>
                    <span className="text-lg font-semibold text-emerald-300">
                      {(totalPrice / Math.max(1, selectedCourt?.maxPlayers || 4))
                        .toFixed(1)
                        .replace('.', ',')}
                      €
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-emerald-500/20 flex items-center justify-between relative z-10">
                  <div className="text-xs text-emerald-300/80 font-medium flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Pagamento in struttura
                  </div>
                  <div className="text-xs text-emerald-300/80 font-medium">
                    {selectedCourt?.maxPlayers || 4} Giocatori
                  </div>
                </div>
              </div>
            </div>

            {/* Spazio per evitare overlap con bottoni fluttuanti su mobile */}
            <div className="p-4 sm:p-6 border-t border-white/5 bg-slate-900 flex-shrink-0 lg:hidden">
              <div className="h-24"></div>
            </div>

            {/* Footer per desktop - nascosto su mobile */}
            <div className="p-4 sm:p-6 border-t border-white/5 bg-slate-900 flex-shrink-0 hidden lg:block rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-4 px-4 border-2 border-gray-600 rounded-xl text-sm font-semibold text-gray-300 hover:bg-gray-800 touch-manipulation transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleBooking}
                  disabled={isSubmitting || !user}
                  className="flex-2 py-4 px-6 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transition-colors shadow-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Prenotando...
                    </div>
                  ) : (
                    `Conferma - ${totalPrice}€`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating buttons for mobile booking confirmation - shown outside modal */}
      {showBookingModal && selectedCourt && selectedDate && selectedTime && (
        <div className="lg:hidden fixed bottom-24 left-4 right-4 z-[99999]">
          <div className="flex gap-3">
            <button
              onClick={() => setShowBookingModal(false)}
              className="flex-1 backdrop-blur-md bg-gray-800/90 border border-gray-600/50 text-gray-300 py-3 px-4 rounded-xl font-medium text-sm transition-all shadow-lg hover:bg-gray-800/95"
            >
              Annulla
            </button>
            <button
              onClick={handleBooking}
              disabled={isSubmitting || !user}
              className="flex-1 backdrop-blur-md bg-blue-600/90 text-white py-3 px-4 rounded-xl font-medium text-sm transition-all shadow-lg hover:bg-blue-600/95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-1">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Prenotando...</span>
                </div>
              ) : (
                `Conferma ${totalPrice}€`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Animation */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
          <div className="bg-gray-800 rounded-3xl p-8 max-w-sm w-full text-center border border-gray-600 shadow-2xl transform animate-pulse">
            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"
                  style={{
                    left: `${20 + i * 10}%`,
                    top: `${15 + (i % 3) * 25}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '2s',
                  }}
                />
              ))}
            </div>

            {/* Main content */}
            <div className="relative z-10">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl transform animate-bounce">
                  <div className="relative">
                    {/* Check mark with animated draw effect */}
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{
                        strokeDasharray: '24',
                        strokeDashoffset: '0',
                        animation: 'drawCheck 0.8s ease-in-out',
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {/* Sparkle effect */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
                    <div
                      className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-300 rounded-full animate-ping"
                      style={{ animationDelay: '0.3s' }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white animate-fade-in">
                  <svg
                    className={`w-8 h-8 inline mr-2 ${ds.success}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                  </svg>
                  Fantastico!
                </h3>
                <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-4 rounded-xl border border-green-700">
                  <p className="text-green-200 font-semibold">Prenotazione confermata!</p>
                  <p className="text-green-300 text-sm mt-1">
                    Il tuo campo è stato riservato con successo
                  </p>
                </div>

                {/* Campo info recap */}
                <div className="bg-gray-700 p-3 rounded-xl">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                    <span>
                      <svg
                        className={`w-4 h-4 inline mr-1 ${ds.info}`}
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
                      {new Date(selectedDate).toLocaleDateString('it-IT', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <span>
                      {new Date(selectedDate).toLocaleDateString('it-IT', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <span>•</span>
                    <span>
                      <svg
                        className={`w-4 h-4 inline mr-1 ${ds.info}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx={12} cy={12} r={10} />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                      🕐 {selectedTime}
                    </span>
                    <span>•</span>
                    <span>
                      <svg
                        className={`w-4 h-4 inline mr-1 ${ds.success}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx={12} cy={12} r={10} />
                        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                        <path d="M12 17.5c.276 0 .5-.224.5-.5s-.224-.5-.5-.5-.5.224-.5.5.224.5.5.5z" />
                      </svg>
                      {selectedCourt?.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-xs text-gray-500 animate-fade-in">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                  <div
                    className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
                <p className="mt-2">Chiusura automatica in corso...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Animation */}
      {showErrorAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[60]">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-sm w-full text-center animate-bounce border border-gray-600">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-400 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              <svg
                className={`w-6 h-6 inline mr-2 ${ds.warning}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              Slot già prenotato!
            </h3>
            <p className="text-gray-300 text-sm">
              Questo orario è già stato prenotato da qualcun altro. Seleziona un altro orario.
            </p>
            <button
              onClick={() => setShowErrorAnimation(false)}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModernBookingInterface;
