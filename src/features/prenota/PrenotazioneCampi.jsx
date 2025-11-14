// =============================================
// FILE: src/features/prenota/PrenotazioneCampi.jsx
// =============================================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@contexts/AuthContext.jsx';
import Section from '@ui/Section.jsx';
import Modal from '@ui/Modal.jsx';
import ZoomableGrid from '@ui/ZoomableGrid.jsx';
import MobileBookingView from './MobileBookingView.jsx';
import { euro, euro2 } from '@lib/format.js';
import { sameDay, floorToSlot, addMinutes, overlaps } from '@lib/date.js';
import { computePrice, getRateInfo, isCourtBookableAt } from '@lib/pricing.js';
import { calculateLessonPrice } from '@services/bookings.js';
import { useUnifiedBookings } from '@hooks/useUnifiedBookings.js';
import { PLAYER_CATEGORIES } from '@features/players/types/playerTypes.js';
import { useNotifications } from '@contexts/NotificationContext';
import { sendBookingConfirmationPush } from '@/services/push-notifications-integration';
import { ds } from '@lib/design-system.js';

// Componente calendario personalizzato
function CalendarGrid({ currentDay, onSelectDay, T }) {
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(currentDay.getFullYear(), currentDay.getMonth(), 1)
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();

  // Primo giorno del mese e ultimo giorno
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Giorni da mostrare (inclusi quelli del mese precedente/successivo per riempire la griglia)
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Lunedì della prima settimana

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 41); // 6 settimane complete

  const days = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

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

  const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  const goToPrevMonth = () => {
    setCalendarMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCalendarMonth(new Date(year, month + 1, 1));
  };

  const isToday = (day) => day.getTime() === today.getTime();
  const isSelected = (day) => day.getTime() === currentDay.getTime();
  const isCurrentMonth = (day) => day.getMonth() === month;
  const isPast = (day) => day < today;

  return (
    <div className="w-full">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPrevMonth}
          className={`w-10 h-10 rounded-full hover:bg-gray-700 flex items-center justify-center text-xl font-bold transition-colors`}
        >
          ←
        </button>
        <h4 className={`text-xl font-bold ${T.text}`}>
          {monthNames[month]} {year}
        </h4>
        <button
          type="button"
          onClick={goToNextMonth}
          className={`w-10 h-10 rounded-full hover:bg-gray-700 flex items-center justify-center text-xl font-bold transition-colors`}
        >
          →
        </button>
      </div>

      {/* Giorni della settimana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className={`text-center text-sm font-semibold ${T.subtext} py-2`}>
            {day}
          </div>
        ))}
      </div>

      {/* Griglia giorni */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dayNum = day.getDate();
          const isCurrentMonthDay = isCurrentMonth(day);
          const isTodayDay = isToday(day);
          const isSelectedDay = isSelected(day);
          const isPastDay = isPast(day);

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelectDay(day)}
              disabled={isPastDay}
              className={`
                h-12 w-full rounded-lg text-sm font-medium transition-all duration-200
                ${
                  isSelectedDay
                    ? 'bg-blue-500 text-white shadow-lg bg-emerald-500'
                    : isTodayDay
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 bg-emerald-100 text-emerald-700 border-emerald-300'
                      : isCurrentMonthDay
                        ? 'hover:bg-gray-700 ' + T.text
                        : 'text-gray-400'
                }
                ${isPastDay ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
              `}
            >
              {dayNum}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function PrenotazioneCampi({ state, setState, players, playersById, T, clubId }) {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning, confirm } = useNotifications();

  console.log('🏢 [PrenotazioneCampi] Component loaded with:', {
    clubId,
    hasState: !!state,
    courtsCount: state?.courts?.length || 0,
  });

  // Use unified booking service
  const {
    bookings: allBookings,
    loading: bookingsLoading,
    refresh: refreshBookings,
    createBooking: createUnifiedBooking,
    updateBooking: updateUnifiedBooking,
    deleteBooking: deleteUnifiedBooking,
  } = useUnifiedBookings({
    clubId,
    autoLoadUser: false,
    autoLoadLessons: true,
    enableRealtime: true,
  });

  // Safe access to bookingConfig with fallback
  const cfg = state?.bookingConfig || {
    slotMinutes: 30,
    dayStartHour: 8,
    dayEndHour: 23,
    defaultDurations: [60, 90, 120],
    addons: {},
  };

  const [day, setDay] = useState(() => floorToSlot(new Date(), cfg.slotMinutes));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const courts = Array.isArray(state?.courts) ? state.courts : [];

  // Stato per il filtro dei campi per tipologia
  const [activeCourtFilter, setActiveCourtFilter] = useState('all');

  // Inizializza gli ordini se necessario e ordina i campi per posizione
  const courtsWithOrder = courts.map((court, index) => ({
    ...court,
    order: court.order || index + 1,
  }));

  const sortedCourts = [...courtsWithOrder].sort((a, b) => {
    const orderA = a.order || 999;
    const orderB = b.order || 999;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // Se gli ordini sono uguali, ordina per nome come fallback
    return (a.name || '').localeCompare(b.name || '');
  });

  // Filtra i campi in base al filtro attivo
  const filteredCourts =
    activeCourtFilter === 'all'
      ? sortedCourts
      : sortedCourts.filter((court) => court.courtType === activeCourtFilter);

  // Ottieni tutte le tipologie di campo disponibili
  const availableCourtTypes = [...new Set(courts.map((court) => court.courtType).filter(Boolean))];

  // Conta i campi per ogni tipo
  const courtTypeCounts = availableCourtTypes.reduce((acc, type) => {
    acc[type] = sortedCourts.filter((court) => court.courtType === type).length;
    return acc;
  }, {});

  // Get instructors from players (instead of localStorage)
  const instructors = useMemo(() => {
    const availableInstructors = (state.players || []).filter(
      (player) =>
        player.category === PLAYER_CATEGORIES.INSTRUCTOR && player.instructorData?.isInstructor
    );
    return availableInstructors;
  }, [state.players]);

  // Convert unified bookings to local format
  const bookings = useMemo(() => {
    return (allBookings || [])
      .filter((b) => {
        // CRITICAL FIX: Include both confirmed AND pending bookings
        // Pending bookings should block availability just like confirmed ones
        const validStatuses = ['confirmed', 'pending'];
        return validStatuses.includes(b.status);
      })
      .map((b) => {
        try {
          const startIso = new Date(
            `${b.date}T${String(b.time).padStart(5, '0')}:00`
          ).toISOString();
          return {
            id: b.id,
            courtId: b.courtId,
            start: startIso,
            duration: Number(b.duration) || 60,
            players: [],
            playerNames: Array.isArray(b.players) ? b.players : [],
            guestNames: [],
            price: b.price ?? null,
            note: b.notes || '',
            notes: b.notes || '',
            bookedByName: b.bookedBy || '',
            addons: { lighting: !!b.lighting, heating: !!b.heating },
            status: 'booked',
            instructorId: b.instructorId,
            isLessonBooking: b.isLessonBooking || false,
            color: b.color, // 🎨 FIX: Include color field from original booking
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }, [allBookings]);

  // Default duration for new bookings: prefer 90' if available, otherwise first configured or 90'
  const defaultDuration = useMemo(() => {
    const list = Array.isArray(cfg?.defaultDurations) ? cfg.defaultDurations : [];
    if (list.includes(90)) return 90;
    if (list.length > 0) return list[0];
    return 90;
  }, [cfg]);

  const goToday = () => setDay(floorToSlot(new Date(), cfg.slotMinutes));
  const goOffset = (days) =>
    setDay((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() + days);
      return nd;
    });
  const setDayFromInput = (value) => {
    const [y, m, dd] = value.split('-').map(Number);
    const d = new Date(day);
    d.setFullYear(y);
    d.setMonth(m - 1);
    d.setDate(dd);
    d.setHours(0, 0, 0, 0);
    setDay(d);
  };

  const dayStart = new Date(day);
  dayStart.setHours(cfg.dayStartHour, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(cfg.dayEndHour, 0, 0, 0);

  // Genera time slots considerando tutti i campi e i loro time slots specifici
  const timeSlots = [];
  const allCourtTimeSlots = new Set();

  // Raccoglie tutti i time slots definiti nei campi
  courts.forEach((court) => {
    if (court.timeSlots && court.timeSlots.length > 0) {
      court.timeSlots.forEach((slot) => {
        if (slot.days?.includes(day.getDay())) {
          // Converte orari in minuti per il confronto
          const fromMinutes =
            parseInt(slot.from.split(':')[0]) * 60 + parseInt(slot.from.split(':')[1]);
          const toMinutes = parseInt(slot.to.split(':')[0]) * 60 + parseInt(slot.to.split(':')[1]);

          // Aggiunge tutti gli slot nell'intervallo
          for (let minutes = fromMinutes; minutes < toMinutes; minutes += cfg.slotMinutes) {
            allCourtTimeSlots.add(minutes);
          }
        }
      });
    }
  });

  // Se ci sono time slots per-campo, usali; altrimenti fallback al sistema globale
  if (allCourtTimeSlots.size > 0) {
    const sortedMinutes = Array.from(allCourtTimeSlots).sort((a, b) => a - b);
    sortedMinutes.forEach((minutes) => {
      const slotTime = new Date(day);
      slotTime.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
      timeSlots.push(slotTime);
    });
  } else {
    // Fallback al sistema globale quando nessun campo ha time slots configurati
    for (let t = new Date(dayStart); t < dayEnd; t = addMinutes(t, cfg.slotMinutes)) {
      timeSlots.push(new Date(t));
    }
  }

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Formato compatto per mobile, completo per desktop
  const dayLabelMobile = `${cap(new Intl.DateTimeFormat('it-IT', { weekday: 'short' }).format(day))} ${String(
    day.getDate()
  ).padStart(2, '0')} ${new Intl.DateTimeFormat('it-IT', { month: 'short' }).format(day)}`;

  const dayLabelDesktop = `${cap(new Intl.DateTimeFormat('it-IT', { weekday: 'long' }).format(day))} - ${String(
    day.getDate()
  ).padStart(
    2,
    '0'
  )} ${new Intl.DateTimeFormat('it-IT', { month: 'long' }).format(day)} ${day.getFullYear()}`;

  const dayLabel = dayLabelDesktop; // Default per ora, modifichiamo il display dopo

  const dayBookings = useMemo(() => {
    const filtered = (bookings || [])
      .filter((b) => b && b.status !== 'cancelled')
      .filter((b) => {
        // CRITICAL FIX: Support both date field and start field
        // New bookings have: date (YYYY-MM-DD) + time (HH:MM)
        // Old bookings might have: start (ISO string or timestamp)
        if (b.date) {
          // New format: use date field directly
          const bookingDate = new Date(b.date + 'T00:00:00');
          return sameDay(bookingDate, day);
        } else if (b.start) {
          // Old format: parse start field
          return sameDay(new Date(b.start), day);
        }
        return false;
      })
      .sort((a, b) => new Date(a.start || a.date) - new Date(b.start || b.date));

    console.log('📅 [PrenotazioneCampi] Day bookings filtered:', {
      selectedDate: day.toISOString().split('T')[0],
      totalBookings: bookings?.length || 0,
      afterStatusFilter: bookings?.filter((b) => b && b.status !== 'cancelled').length || 0,
      afterDateFilter: filtered.length,
      firstFewBookings: filtered.slice(0, 3).map((b) => ({
        id: b.id,
        date: b.date,
        time: b.time,
        start: b.start,
        courtId: b.courtId,
        clubId: b.clubId,
      })),
      allBookingDates: [...new Set(bookings?.map((b) => b.date).filter(Boolean))].sort(),
    });

    return filtered;
  }, [bookings, day]);

  const bookingsByCourt = useMemo(() => {
    const map = new Map(filteredCourts.map((c) => [c.id, []]));
    for (const b of dayBookings) {
      const arr = map.get(b.courtId) || [];
      arr.push(b);
      map.set(b.courtId, arr);
    }
    return map;
  }, [dayBookings, filteredCourts]);

  const dayRates = useMemo(() => {
    // Calcola rates considerando tutti i campi per ogni time slot
    return timeSlots.map((t) => {
      const courtRates = courts.map((court) => getRateInfo(t, cfg, court.id, courts).rate);
      // Ritorna il rate minimo, massimo o medio tra i campi
      return courtRates.length > 0 ? Math.min(...courtRates) : 0;
    });
  }, [timeSlots, cfg, courts]);
  const minRate = useMemo(() => Math.min(...dayRates), [dayRates]);
  const maxRate = useMemo(() => Math.max(...dayRates), [dayRates]);
  const greenAlphaForRate = (rate) => {
    if (!isFinite(minRate) || !isFinite(maxRate) || minRate === maxRate) return 0.18;
    const x = (rate - minRate) / (maxRate - minRate);
    return 0.12 + x * 0.22;
  };

  const playersAlpha = useMemo(
    () =>
      [...players].sort((a, b) =>
        (a.name || '').localeCompare(b.name, 'it', { sensitivity: 'base' })
      ),
    [players]
  );
  const playersNameById = (id) => playersById?.[id]?.name || '';
  const findPlayerIdByName = (name) => {
    const n = (name || '').trim().toLowerCase();
    if (!n) return null;
    const found = playersAlpha.find((p) => p.name.trim().toLowerCase() === n);
    return found?.id || null;
  };

  // Verifica se un campo ha una fascia promo attiva per un determinato orario
  const hasPromoSlot = (courtId, datetime) => {
    if (!datetime) return false;
    const info = getRateInfo(datetime, cfg, courtId, courts);
    return info.isPromo || false;
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Debug: Track modalOpen state changes
  useEffect(() => {
    console.log('🔄 modalOpen state changed:', modalOpen);
  }, [modalOpen]);

  // Drag & Drop state (desktop only)
  const [draggedBooking, setDraggedBooking] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);

  // Mobile detection for booking view - using same breakpoint as desktop for consistency
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < 1024);

  // Update isDesktop and isMobileView on resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setIsMobileView(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [form, setForm] = useState({
    courtId: '',
    start: null,
    duration: defaultDuration,
    p1Name: '',
    p2Name: '',
    p3Name: '',
    p4Name: '',
    note: '',
    bookedBy: '',
    useLighting: false,
    useHeating: false,
    color: '#e91e63', // Default color for bookings
    bookingType: 'partita', // 'partita' or 'lezione'
    instructorId: '', // For lesson bookings
    participants: 1, // Numero partecipanti per le lezioni (1-4)
  });

  function openCreate(courtId, start) {
    console.log('🚀 openCreate called', { courtId, start });
    const startRounded = floorToSlot(start, cfg.slotMinutes);
    setEditingId(null);
    setForm({
      courtId,
      start: startRounded,
      duration: defaultDuration,
      p1Name: '',
      p2Name: '',
      p3Name: '',
      p4Name: '',
      note: '',
      bookedBy: '',
      useLighting: false,
      useHeating: false,
      color: '#e91e63', // Default color for new bookings
      bookingType: 'partita', // Default to 'partita'
      instructorId: '', // Empty by default
      participants: 1,
    });
    console.log('📝 Form set, calling setModalOpen(true)');
    setModalOpen(true);
    console.log('✅ setModalOpen(true) called');
  }

  function openEdit(booking) {
    console.log('✏️ openEdit called', booking.id);
    setEditingId(booking.id);
    const start = new Date(booking.start);
    const namesFromIds = (booking.players || []).map(playersNameById);
    let playerNames =
      booking.playerNames && booking.playerNames.length ? booking.playerNames : namesFromIds;

    // Assicuriamoci che l'organizzatore sia incluso nell'elenco dei giocatori
    const organizerName = booking.bookedByName || '';
    if (organizerName && !playerNames.includes(organizerName)) {
      playerNames = [organizerName, ...playerNames].slice(0, 4); // Max 4 giocatori
    }

    let participantsCount = 1; // Default fallback

    if (booking.participants) {
      // Use saved participants count
      participantsCount = booking.participants;
    } else if (booking.instructorId && booking.price) {
      // For lessons without saved participants count, try to infer from price
      const instructor = instructors.find((i) => i.id === booking.instructorId);
      if (instructor && instructor.instructorData) {
        const prices = instructor.instructorData;
        // Try to match the price with instructor's pricing tiers
        if (booking.price === prices.priceMatchLesson || booking.price === prices.priceFour) {
          participantsCount = 4;
        } else if (booking.price === prices.priceThree) {
          participantsCount = 3;
        } else if (booking.price === prices.priceCouple) {
          participantsCount = 2;
        } else if (booking.price === prices.priceSingle) {
          participantsCount = 1;
        } else {
          // If no exact match, try to estimate based on typical pricing
          // Assume base price is for 1 person and calculate from there
          const basePricePerHour = prices.priceSingle || 25;
          const pricePerMinute = basePricePerHour / 60;
          const expectedSinglePrice = pricePerMinute * booking.duration;

          if (booking.price >= expectedSinglePrice * 3.5) {
            participantsCount = 4;
          } else if (booking.price >= expectedSinglePrice * 2.5) {
            participantsCount = 3;
          } else if (booking.price >= expectedSinglePrice * 1.5) {
            participantsCount = 2;
          } else {
            participantsCount = 1;
          }
        }
      } else {
        // Fallback: count actual player names
        const actualPlayerCount = playerNames.filter(Boolean).length;
        participantsCount = actualPlayerCount > 0 ? actualPlayerCount : 1;
      }
    } else if (booking.instructorId) {
      // For lessons without price info, count player names
      const actualPlayerCount = playerNames.filter(Boolean).length;
      participantsCount = actualPlayerCount > 0 && actualPlayerCount <= 4 ? actualPlayerCount : 1;
    } else {
      // For regular matches, use all 4 slots or actual player count
      participantsCount = 4;
    }

    setForm({
      courtId: booking.courtId,
      start,
      duration: booking.duration,
      p1Name: playerNames[0] || '',
      p2Name: playerNames[1] || '',
      p3Name: playerNames[2] || '',
      p4Name: playerNames[3] || '',
      note: booking.note || '',
      bookedBy: organizerName,
      useLighting: !!booking.addons?.lighting,
      useHeating: !!booking.addons?.heating,
      color: booking.color || '#e91e63', // Use existing color or default
      bookingType: booking.instructorId ? 'lezione' : 'partita', // Detect if it's a lesson
      instructorId: booking.instructorId || '', // Use existing instructor or empty
      participants: participantsCount,
    });
    setModalOpen(true);
  }

  function existingOverlap(courtId, start, duration, ignoreId = null) {
    const blockStart = new Date(start);
    const blockEnd = addMinutes(start, duration);
    const list = bookingsByCourt.get(courtId) || [];

    const conflict = list.find((b) => {
      if (ignoreId && b.id === ignoreId) {
        return false;
      }

      const bStart = new Date(b.start);
      const bEnd = addMinutes(new Date(b.start), b.duration);
      const hasOverlap = overlaps(blockStart, blockEnd, bStart, bEnd);

      return hasOverlap;
    });

    return conflict;
  }

  const prevP1Ref = useRef('');
  useEffect(() => {
    const p1 = form.p1Name?.trim() || '';
    const prev = prevP1Ref.current;
    if ((!form.bookedBy?.trim() || form.bookedBy?.trim() === prev) && p1) {
      setForm((f) => ({ ...f, bookedBy: p1 }));
    }
    prevP1Ref.current = p1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.p1Name]);

  // Handle color change when booking type or instructor changes
  useEffect(() => {
    if (form.bookingType === 'lezione' && form.instructorId && instructors.length > 0) {
      const selectedInstructor = instructors.find((inst) => inst.id === form.instructorId);
      if (selectedInstructor?.instructorData?.color) {
        setForm((f) => ({
          ...f,
          color: selectedInstructor.instructorData.color,
        }));
      }
    } else if (form.bookingType === 'partita') {
      setForm((f) => ({ ...f, color: '#e91e63' })); // Default pink color for matches
    }
  }, [form.bookingType, form.instructorId, instructors]);

  async function saveBooking() {
    if (!form.courtId || !form.start) {
      showWarning('Seleziona campo e orario.');
      return;
    }

    // Validate instructor selection for lessons
    if (form.bookingType === 'lezione' && !form.instructorId) {
      showWarning('Seleziona un maestro per le lezioni.');
      return;
    }

    const start = floorToSlot(form.start, cfg.slotMinutes);
    // Verifica fascia per-campo: gli slot fuori fascia non sono prenotabili anche in admin
    if (!isCourtBookableAt(start, form.courtId, courts)) {
      showWarning('Orario fuori dalle fasce prenotabili per questo campo.');
      return;
    }
    const now = new Date();
    if (start < now) {
      showWarning('Non puoi prenotare nel passato.');
      return;
    }
    const ignoreId = editingId || null;
    if (existingOverlap(form.courtId, start, form.duration, ignoreId)) {
      showWarning('Esiste già una prenotazione che si sovrappone su questo campo.');
      return;
    }

    const pNames = [form.p1Name, form.p2Name, form.p3Name, form.p4Name]
      .map((s) => (s || '').trim())
      .filter(Boolean);
    const bookedByName = (form.bookedBy && form.bookedBy.trim()) || pNames[0] || '';

    // Calcolo prezzo dinamico: lezioni vs partite
    let price;
    if (form.bookingType === 'lezione') {
      const courtObj = courts.find((c) => c.id === form.courtId);
      const instructor = instructors.find((i) => i.id === form.instructorId);
      price = calculateLessonPrice({
        duration: form.duration,
        participants: form.participants || 1,
        lighting: !!form.useLighting,
        heating: !!form.useHeating,
        court: courtObj,
        instructor,
      });
    } else {
      price = computePrice(
        start,
        form.duration,
        cfg,
        { lighting: !!form.useLighting, heating: !!form.useHeating },
        form.courtId,
        courts
      );
    }

    // Mappa per API cloud (date/time locali HH:MM)
    const yyyy = String(start.getFullYear()).padStart(4, '0');
    const mm = String(start.getMonth() + 1).padStart(2, '0');
    const dd = String(start.getDate()).padStart(2, '0');
    const hh = String(start.getHours()).padStart(2, '0');
    const mi = String(start.getMinutes()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const timeStr = `${hh}:${mi}`;
    const courtNameFull = courts.find((c) => c.id === form.courtId)?.name || form.courtId;

    try {
      if (!editingId) {
        // Create booking using unified service
        const bookingData = {
          courtId: form.courtId,
          courtName: courtNameFull,
          date: dateStr,
          time: timeStr,
          duration: form.duration,
          lighting: !!form.useLighting,
          heating: !!form.useHeating,
          price,
          players: pNames,
          notes: form.note?.trim() || '',
          type: 'court',
          color: form.color, // Add custom color
          isLessonBooking: form.bookingType === 'lezione',
          participants:
            form.bookingType === 'lezione'
              ? form.participants || pNames.length || 1
              : pNames.length,
          ...(form.bookingType === 'lezione' && form.instructorId
            ? {
                instructorId: form.instructorId,
                instructorName:
                  instructors.find((inst) => inst.id === form.instructorId)?.name || '',
                lessonType: 'individual',
              }
            : {}),
        };

        const created = await createUnifiedBooking(bookingData);

        // CRITICITÀ 4: Show certificate warning if present
        if (created.certificateWarning) {
          const warningColor = 
            created.certificateStatus === 'expired' ? 'error' :
            created.certificateStatus === 'expiring_critical' ? 'warning' :
            'info';
          
          showError(created.certificateWarning, warningColor);
        }

        // If admin specified a different name, update the bookedBy field
        if (bookedByName) {
          await updateUnifiedBooking(created.id, { bookedBy: bookedByName });
        }

        // Send push notification for new booking
        if (user?.uid) {
          try {
            await sendBookingConfirmationPush(user.uid, {
              ...bookingData,
              id: created.id,
              start: start,
            });
          } catch (pushError) {
            console.log('Push notification failed (non-blocking):', pushError);
          }
        }
      } else {
        // Update existing booking using unified service
        const updateData = {
          courtId: form.courtId,
          courtName: courtNameFull,
          date: dateStr,
          time: timeStr,
          duration: form.duration,
          lighting: !!form.useLighting,
          heating: !!form.useHeating,
          price,
          players: pNames,
          notes: form.note?.trim() || '',
          color: form.color, // Add custom color
          isLessonBooking: form.bookingType === 'lezione',
          participants:
            form.bookingType === 'lezione'
              ? form.participants || pNames.length || 1
              : pNames.length,
          ...(bookedByName ? { bookedBy: bookedByName } : {}),
          ...(form.bookingType === 'lezione' && form.instructorId
            ? {
                instructorId: form.instructorId,
                instructorName:
                  instructors.find((inst) => inst.id === form.instructorId)?.name || '',
                lessonType: 'individual',
              }
            : {
                instructorId: null,
                instructorName: null,
                lessonType: null,
              }),
        };

        await updateUnifiedBooking(editingId, updateData, user);
      }
      // La sottoscrizione realtime aggiornerà la griglia
      setModalOpen(false);
    } catch (e) {
      showError('Errore nel salvataggio della prenotazione.');
    }
  }

  async function cancelBooking(id) {
    const confirmed = await confirm({
      title: 'Cancella prenotazione',
      message: 'Sei sicuro di voler cancellare questa prenotazione?',
      variant: 'warning',
      confirmText: 'Cancella',
      cancelText: 'Annulla',
    });

    if (!confirmed) return;

    try {
      await updateUnifiedBooking(id, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
      });
    } catch (e) {
      showError('Errore durante la cancellazione.');
    }
  }

  async function hardDeleteBooking(id) {
    const confirmed = await confirm({
      title: 'Elimina definitivamente',
      message:
        'Sei sicuro di voler eliminare definitivamente questa prenotazione?\n\nQuesta azione non può essere annullata.',
      variant: 'danger',
      confirmText: 'Elimina',
      cancelText: 'Annulla',
    });

    if (!confirmed) return;

    try {
      await deleteUnifiedBooking(id);
      setModalOpen(false);
    } catch (e) {
      showError("Errore durante l'eliminazione.");
    }
  }

  const courtName = (id) => courts.find((c) => c.id === id)?.name || id;
  const initials = (name) =>
    (name || '')
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .join('')
      .slice(0, 3)
      .toUpperCase();

  // =============================================
  // DRAG & DROP FUNCTIONS (Desktop Only)
  // =============================================

  const handleDragStart = (e, booking) => {
    if (!isDesktop) return;
    setDraggedBooking(booking);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', booking.id);

    // Add visual feedback
    e.target.style.opacity = '0.6';
  };

  const handleDragEnd = (e) => {
    if (!isDesktop) return;
    setDraggedBooking(null);
    setDragOverSlot(null);
    e.target.style.opacity = '1';
  };

  const handleDragOver = (e, courtId, time) => {
    if (!isDesktop || !draggedBooking) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Only allow drop on same day
    const draggedDate = new Date(draggedBooking.start).toDateString();
    const targetDate = time.toDateString();

    if (draggedDate !== targetDate) return;

    // Calculate all slots that would be occupied by the booking
    const startTime = floorToSlot(time, cfg.slotMinutes);
    const duration = draggedBooking.duration || 60;
    const endTime = addMinutes(startTime, duration);

    // Check if ALL required slots are available
    const slotsToOccupy = [];
    let hasConflict = false;

    for (
      let currentTime = new Date(startTime);
      currentTime < endTime;
      currentTime = addMinutes(currentTime, cfg.slotMinutes)
    ) {
      // Check if this slot is within court schedule
      if (!isCourtBookableAt(currentTime, courtId, courts)) {
        hasConflict = true;
        break;
      }

      // Check for conflicts with other bookings
      const slotEnd = addMinutes(currentTime, cfg.slotMinutes);
      const slotConflict = bookings.find((b) => {
        if (b.id === draggedBooking.id) return false;
        if (b.courtId !== courtId) return false;

        const bStart = new Date(b.start);
        const bEnd = addMinutes(bStart, b.duration);

        return overlaps(currentTime, slotEnd, bStart, bEnd);
      });

      if (slotConflict) {
        hasConflict = true;
        break;
      }

      slotsToOccupy.push({
        courtId,
        time: currentTime.getTime(),
      });
    }

    // Only set drag over state if no conflicts
    if (!hasConflict) {
      setDragOverSlot({ courtId, slots: slotsToOccupy });
    } else {
      setDragOverSlot(null);
    }
  };

  const handleDragLeave = (e) => {
    if (!isDesktop) return;
    // Only clear if really leaving (not moving to child element)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverSlot(null);
    }
  };

  const handleDrop = async (e, courtId, time) => {
    if (!isDesktop || !draggedBooking) return;

    e.preventDefault();
    setDragOverSlot(null);

    try {
      // Check if the target slot is available and on the same day
      const draggedDate = new Date(draggedBooking.start).toDateString();
      const targetDate = time.toDateString();

      if (draggedDate !== targetDate) {
        showWarning("Puoi spostare le prenotazioni solo all'interno dello stesso giorno.");
        return;
      }

      // Calculate target time slot properly
      const targetTime = floorToSlot(time, cfg.slotMinutes);
      const targetEnd = addMinutes(targetTime, draggedBooking.duration);

      // Check if target court is in schedule for ALL slots that will be occupied
      const slotsToOccupy = [];
      for (
        let checkTime = new Date(targetTime);
        checkTime < targetEnd;
        checkTime = addMinutes(checkTime, cfg.slotMinutes)
      ) {
        slotsToOccupy.push(new Date(checkTime));
      }

      // Verify all slots are within court schedule
      for (const slotTime of slotsToOccupy) {
        if (!isCourtBookableAt(slotTime, courtId, courts)) {
          showWarning(
            'Uno o più slot di destinazione sono fuori dalle fasce prenotabili per questo campo.'
          );
          return;
        }
      }

      // Check for conflicts with OTHER bookings (exclude the one being moved)
      const conflictingBooking = bookings.find((b) => {
        if (b.id === draggedBooking.id) return false; // Ignore the booking we're moving
        if (b.courtId !== courtId) return false;

        const bookingStart = new Date(b.start);
        const bookingEnd = addMinutes(bookingStart, b.duration);

        // Check if any part of the target time range overlaps with this booking
        return overlaps(targetTime, targetEnd, bookingStart, bookingEnd);
      });

      if (conflictingBooking) {
        console.log('🚫 Conflict detected with booking:', conflictingBooking.id);
        showWarning("Lo slot di destinazione è già occupato da un'altra prenotazione.");
        return;
      }

      // Additional validation: check each individual slot for conflicts
      for (const slotTime of slotsToOccupy) {
        const slotEnd = addMinutes(slotTime, cfg.slotMinutes);
        const slotConflict = bookings.find((b) => {
          if (b.id === draggedBooking.id) return false;
          if (b.courtId !== courtId) return false;

          const bStart = new Date(b.start);
          const bEnd = addMinutes(bStart, b.duration);

          return overlaps(slotTime, slotEnd, bStart, bEnd);
        });

        if (slotConflict) {
          showWarning("Lo slot di destinazione è già occupato da un'altra prenotazione.");
          return;
        }
      }

      // Calculate proper date/time strings for cloud format
      const localDate = new Date(targetTime.getTime() - targetTime.getTimezoneOffset() * 60000);
      const dateStr = localDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = localDate.toISOString().split('T')[1].substring(0, 5); // HH:MM

      // Update the booking - use only cloud format (date/time), not legacy start
      await updateUnifiedBooking(draggedBooking.id, {
        courtId: courtId,
        courtName: courtName(courtId),
        date: dateStr,
        time: timeStr,
        updatedAt: new Date().toISOString(),
      });

      // Force refresh of bookings to ensure UI is updated
      if (refreshBookings) {
        setTimeout(() => {
          refreshBookings();
        }, 500);
      }
    } catch (error) {
      console.error('❌ Error moving booking:', error);
      showError('Errore durante lo spostamento della prenotazione.');
    }

    setDraggedBooking(null);
  };

  const SLOT_H = 52; // px

  function renderCell(courtId, t) {
    const list = bookingsByCourt.get(courtId) || [];
    const hit = list.find((b) => {
      const bStart = new Date(b.start);
      const bEnd = addMinutes(bStart, b.duration);
      return overlaps(bStart, bEnd, t, addMinutes(t, cfg.slotMinutes));
    });

    // --- SLOT FUORI FASCIA (non prenotabile) ---
    const inSchedule = isCourtBookableAt(t, courtId, courts);
    if (!hit && !inSchedule) {
      const startLabel = t.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      return (
        <div
          className={`relative w-full rounded-lg ring-1 text-[11px] sm:text-xs font-medium bg-gray-200 opacity-50 cursor-not-allowed border-dashed border-2 border-gray-300 border-gray-700 flex items-center justify-center ${
            isMobileView ? 'h-14' : 'h-9'
          }`}
          title="Fuori fascia oraria per questo campo"
        >
          <span className="absolute inset-0 grid place-items-center text-[11px] opacity-80">
            {startLabel}
          </span>
        </div>
      );
    }

    // --- SLOT LIBERO ---
    if (!hit) {
      const info = getRateInfo(t, cfg, courtId, courts);
      const alpha = greenAlphaForRate(info.rate);
      const isDiscounted = info.source === 'discounted' || info.isPromo;
      const startLabel = t.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const isDragTarget =
        dragOverSlot &&
        dragOverSlot.courtId === courtId &&
        dragOverSlot.slots?.some((slot) => slot.time === t.getTime());

      const isDragIncompatible =
        draggedBooking &&
        draggedBooking.start &&
        new Date(draggedBooking.start).toDateString() === t.toDateString() &&
        courtId !== draggedBooking.courtId;

      return (
        <button
          type="button"
          onClick={() => {
            console.log('🎾 Click slot libero!', { courtId, time: t });
            openCreate(courtId, t);
          }}
          className={`relative w-full rounded-lg ring-1 text-[11px] sm:text-xs font-medium transition-all duration-200 ${
            isMobileView ? 'h-14 text-sm' : 'h-9'
          } ${
            isDragTarget
              ? 'ring-2 ring-blue-500 ring-offset-1 scale-105'
              : isDragIncompatible
                ? 'ring-2 ring-red-300 ring-offset-1 opacity-75'
                : ''
          }`}
          style={{
            background: isDragTarget
              ? 'rgba(59, 130, 246, 0.2)'
              : isDragIncompatible
                ? 'rgba(239, 68, 68, 0.1)'
                : `rgba(16,185,129,${alpha})`,
            borderColor: isDragTarget
              ? 'rgba(59, 130, 246, 0.6)'
              : isDragIncompatible
                ? 'rgba(239, 68, 68, 0.3)'
                : `rgba(16,185,129,0.35)`,
          }}
          title={
            isDragTarget
              ? 'Rilascia qui per spostare la prenotazione'
              : isDragIncompatible
                ? 'Disponibile per nuove prenotazioni (non compatibile con lo spostamento)'
                : info.isPromo
                  ? 'Fascia Promo'
                  : isDiscounted
                    ? 'Fascia scontata'
                    : 'Tariffa standard'
          }
          // Drag & Drop props (desktop only)
          onDragOver={isDesktop ? (e) => handleDragOver(e, courtId, t) : undefined}
          onDragLeave={isDesktop ? handleDragLeave : undefined}
          onDrop={isDesktop ? (e) => handleDrop(e, courtId, t) : undefined}
        >
          {isDiscounted && (
            <span
              className="absolute top-0.5 right-0.5 px-1.5 py-[1px] rounded-full text-[10px] leading-none"
              style={{
                background: 'rgba(16,185,129,0.9)',
                color: '#0b0b0b',
                border: '1px solid rgba(16,185,129,0.6)',
              }}
            >
              ★ Promo
            </span>
          )}
          {/* Orario di inizio sempre visibile su tutti gli slot liberi */}
          <span className="absolute inset-0 grid place-items-center text-[11px] opacity-90">
            {startLabel}
          </span>
        </button>
      );
    }

    // --- SLOT OCCUPATO ---
    const start = new Date(hit.start);
    const end = addMinutes(start, hit.duration);
    const isStart = t.getTime() === start.getTime();
    if (!isStart) return <div className="w-full h-9" />;

    const rowSpan = Math.ceil((end - t) / (cfg.slotMinutes * 60 * 1000));
    const totalHeight = rowSpan * SLOT_H - 6;
    const labelPlayers = (
      hit.playerNames && hit.playerNames.length
        ? hit.playerNames
        : (hit.players || []).map((pid) => playersById?.[pid]?.name || '—')
    )
      .concat(hit.guestNames || [])
      .slice(0, 4);

    // Icone semplici emoji senza sfondo
    const lampIcon = <span className="text-2xl">💡</span>;
    const fireIcon = <span className="text-2xl">🔥</span>;

    // Determine booking color - priority: custom color > instructor color > default
    let slotBgColor = 'rgba(220, 38, 127, 0.35)'; // Default booking color
    let slotBorderColor = 'rgba(220, 38, 127, 0.6)';

    // Check if this is a lesson booking (expanded detection)
    const isLessonBooking =
      hit.isLessonBooking ||
      (hit.notes && hit.notes.includes('Lezione con')) ||
      hit.instructorId ||
      hit.instructorName;

    // First check if booking has custom color
    if (hit.color) {
      const hex = hit.color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      slotBgColor = `rgba(${r}, ${g}, ${b}, 0.35)`;
      slotBorderColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
    } else if (isLessonBooking) {
      // Get instructor color for lesson bookings
      let instructor = null;

      if (hit.instructorId) {
        instructor = instructors.find((i) => i.id === hit.instructorId);
      } else {
        // Extract instructor name from notes like "Lezione con Marco Rossi"
        const match = hit.notes.match(/Lezione con (.+)/);
        if (match) {
          const instructorName = match[1];
          instructor = instructors.find((i) => i.name === instructorName);
        }
      }

      if (instructor && instructor.instructorData?.color) {
        // Convert hex color to rgba for background and border
        const hex = instructor.instructorData.color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        slotBgColor = `rgba(${r}, ${g}, ${b}, 0.35)`;
        slotBorderColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
      }
    }

    return (
      <div className="w-full h-9 relative">
        <button
          type="button"
          onClick={() => {
            console.log('📅 Click prenotazione!', hit);
            openEdit(hit);
          }}
          className={`absolute left-0 right-0 px-2 py-2 ring-1 text-left text-[13px] font-semibold flex flex-col justify-center transition-all duration-200 ${
            isDesktop ? 'cursor-grab hover:shadow-lg' : ''
          }`}
          style={{
            top: 0,
            height: `${totalHeight}px`,
            background: slotBgColor,
            borderColor: slotBorderColor,
            borderRadius: '8px',
            overflow: 'hidden',
          }}
          title={`${courtName(hit.courtId)} — ${start.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })} (${hit.duration}′) • ${isDesktop ? 'Trascina per spostare o clicca per modificare' : 'Clicca per modificare'}`}
          // Drag & Drop props (desktop only)
          draggable={isDesktop}
          onDragStart={isDesktop ? (e) => handleDragStart(e, hit) : undefined}
          onDragEnd={isDesktop ? handleDragEnd : undefined}
          onMouseDown={isDesktop ? (e) => (e.target.style.cursor = 'grabbing') : undefined}
          onMouseUp={isDesktop ? (e) => (e.target.style.cursor = 'grab') : undefined}
        >
          {/* Icone in alto a sinistra */}
          <div className="absolute left-2 top-2 flex flex-row items-center gap-2 z-20">
            {hit.addons?.lighting && lampIcon}
            {hit.addons?.heating && fireIcon}
          </div>

          {/* Badge lezione in alto a destra */}
          {isLessonBooking &&
            (() => {
              // Get instructor info for lesson badge
              let instructor = null;
              let instructorName = '';

              if (hit.instructorId) {
                instructor = instructors.find((i) => i.id === hit.instructorId);
              } else {
                // Extract instructor name from notes like "Lezione con Marco Rossi"
                const match = hit.notes.match(/Lezione con (.+)/);
                if (match) {
                  const instructorName = match[1];
                  instructor = instructors.find((i) => i.name === instructorName);
                }
              }

              if (instructor?.name) {
                // Extract first name (first word of the name)
                const nameParts = instructor.name.trim().split(/\s+/);
                instructorName = nameParts[0];
              }

              return (
                <div className="absolute right-2 top-2 z-30">
                  <span
                    className="text-[13px] px-2 py-1 bg-orange-500 text-white rounded-lg font-bold flex items-center gap-1 shadow-lg border-2 border-white"
                    title={`Lezione${instructor?.name ? ` con ${instructor.name}` : ''}`}
                  >
                    🎾
                    {instructorName && (
                      <span className="text-[11px] font-bold uppercase">{instructorName}</span>
                    )}
                  </span>
                </div>
              );
            })()}
          <div className="flex items-center justify-between gap-2 mb-1 mt-2">
            <div className="min-w-0 flex flex-col">
              <span className="font-bold text-[15px] leading-tight">
                {start.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                -{' '}
                {end.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                • {euro(hit.price)}
              </span>
              <span className="flex items-center gap-2 mt-1">
                <div className="text-[10px] font-medium opacity-80 flex flex-wrap gap-1">
                  {labelPlayers.map((name, i) => (
                    <span
                      key={i}
                      className="bg-gray-800/40 px-1 py-0.5 rounded text-[9px] font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </span>
            </div>
          </div>
          <div className="text-[12px] opacity-80 truncate">
            Prenotato da:{' '}
            <span className="font-semibold">{hit.bookedByName || labelPlayers[0] || '—'}</span>
          </div>
          {isLessonBooking && hit.participants && hit.participants > 1 && (
            <div className="text-[11px] opacity-75 mt-1">👥 {hit.participants} partecipanti</div>
          )}
          {isLessonBooking && hit.price > 0 && (
            <div className="text-[11px] opacity-75 mt-1 font-medium text-green-200">
              💰 {euro(hit.price)}
              {hit.participants > 1 && (
                <span className="text-[10px] ml-1 opacity-60">
                  ({euro(hit.price / hit.participants)}/p)
                </span>
              )}
            </div>
          )}
          {hit.note && <div className="text-[11px] opacity-70 mt-1 truncate">{hit.note}</div>}

          {/* Durata spostata in basso a destra */}
          <div className="absolute bottom-2 right-2 z-20">
            <span className="text-[13px] opacity-80 font-bold bg-black/20 px-2 py-1 rounded">
              {Math.round(hit.duration)}′
            </span>
          </div>
        </button>
      </div>
    );
  }

  const previewPrice = useMemo(() => {
    if (!form.start || !form.courtId) return null;
    if (form.bookingType === 'lezione') {
      const courtObj = courts.find((c) => c.id === form.courtId);
      const instructor = instructors.find((i) => i.id === form.instructorId);
      return calculateLessonPrice({
        duration: form.duration,
        participants: form.participants || 1,
        lighting: form.useLighting,
        heating: form.useHeating,
        court: courtObj,
        instructor,
      });
    }
    return computePrice(
      new Date(form.start),
      form.duration,
      cfg,
      { lighting: form.useLighting, heating: form.useHeating },
      form.courtId,
      courts
    );
  }, [
    form.start,
    form.duration,
    form.courtId,
    form.useLighting,
    form.useHeating,
    form.bookingType,
    form.participants,
    cfg,
    courts,
  ]);
  const perPlayer = useMemo(() => {
    if (previewPrice == null) return null;
    if (form.bookingType === 'lezione') {
      // Prezzo totale già definito dall'istruttore: dividiamo solo per partecipanti per display
      const participants = Math.max(1, Math.min(4, form.participants || 1));
      return previewPrice / participants;
    }
    // Partita normale: usa maxPlayers del campo selezionato
    const selectedCourt = courts.find((c) => c.id === form.courtId);
    const maxPlayers = selectedCourt?.maxPlayers || 4; // Default 4 se non specificato
    return previewPrice / Math.max(1, maxPlayers);
  }, [previewPrice, form.bookingType, form.participants, form.courtId, courts]);

  useEffect(() => {
    // Refresh dashboard every 2 minutes
    const interval = setInterval(
      () => {
        window.location.reload();
      },
      2 * 60 * 1000
    ); // 2 minutes in milliseconds

    // Refresh dashboard when the tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        window.location.reload();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <Section T={T}>
      {/* Show loading state if state is null */}
      {!state ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-lg font-medium mb-2 text-white">Caricamento...</h3>
            <p className="text-gray-400">Caricamento configurazione campi in corso...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header principale con filtri e navigazione affiancati */}
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-3 mb-3 lg:mb-4">
            {/* Filtri per tipologia campo - a sinistra */}
            <div
              className={`flex-1 ${T.cardBg} ${T.border} p-2 lg:p-3 rounded-lg lg:rounded-xl shadow-lg`}
            >
              <div className={`flex items-center gap-2 ${isMobileView ? 'mb-1.5' : 'mb-2'}`}>
                <span className={`${isMobileView ? 'text-xs' : 'text-sm'} font-semibold`}>🏓</span>
                <span className={`${isMobileView ? 'text-xs' : 'text-sm'} font-medium`}>
                  Filtra per tipologia campo
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setActiveCourtFilter('all')}
                  className={`${isMobileView ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} rounded-lg font-medium transition-all duration-200 ${
                    activeCourtFilter === 'all'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : `${T.btnGhost} hover:bg-blue-900/20`
                  }`}
                >
                  Tutti {!isMobileView && `(${sortedCourts.length})`}
                </button>
                {availableCourtTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActiveCourtFilter(type)}
                    className={`${isMobileView ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} rounded-lg font-medium transition-all duration-200 ${
                      activeCourtFilter === type
                        ? 'bg-blue-500 text-white shadow-lg'
                        : `${T.btnGhost} hover:bg-blue-900/20`
                    }`}
                  >
                    {type} {!isMobileView && `(${courtTypeCounts[type]})`}
                  </button>
                ))}
              </div>
              {filteredCourts.length === 0 && activeCourtFilter !== 'all' && (
                <div className="mt-2 text-center py-2 text-gray-400">
                  <div className="text-lg mb-1">🏓</div>
                  <div className="text-sm">
                    Nessun campo di tipo "{activeCourtFilter}" disponibile
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveCourtFilter('all')}
                    className={`${T.btnPrimary} mt-1 px-3 py-1 text-sm`}
                  >
                    Mostra tutti i campi
                  </button>
                </div>
              )}
            </div>

            {/* Header moderno con navigazione integrata - a destra */}
            <div
              className={`flex-1 ${T.cardBg} ${T.border} ${isMobileView ? 'p-2' : 'p-3'} rounded-lg lg:rounded-xl shadow-lg`}
            >
              {/* Navigazione date centrata con frecce grandi */}
              <div className="flex items-center justify-center gap-4 lg:gap-6">
                <button
                  type="button"
                  className={`${isMobileView ? 'w-10 h-10 text-xl' : 'w-12 h-12 text-2xl'} rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg hover:scale-110 transition-all duration-200 flex items-center justify-center`}
                  onClick={() => goOffset(-1)}
                  title="Giorno precedente"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={() => setShowDatePicker(true)}
                  className={`${isMobileView ? 'text-lg' : 'text-2xl sm:text-3xl'} font-bold cursor-pointer hover:scale-105 transition-transform bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent from-emerald-400 to-lime-400 ${isMobileView ? 'px-2 py-1' : 'px-3 sm:px-4 py-2'} rounded-lg hover:bg-gray-800 text-center`}
                  title="Clicca per aprire calendario"
                >
                  {/* Versione mobile: formato compatto */}
                  <span className="block sm:hidden">{dayLabelMobile}</span>
                  {/* Versione desktop: formato completo */}
                  <span className="hidden sm:block">{dayLabelDesktop}</span>
                </button>

                <button
                  type="button"
                  className={`${isMobileView ? 'w-10 h-10 text-xl' : 'w-12 h-12 text-2xl'} rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg hover:scale-110 transition-all duration-200 flex items-center justify-center`}
                  onClick={() => goOffset(1)}
                  title="Giorno successivo"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Header campi sticky - Solo Desktop */}
          {!isMobileView && (
            <div className="sticky top-16 z-10 bg-gray-800/95 backdrop-blur-sm -mx-4 px-4 pb-2">
              <div className="relative w-full" style={{ minHeight: '70px' }}>
                <div className="w-full overflow-x-auto" style={{ touchAction: 'auto' }}>
                  <div
                    style={{
                      transform: 'none',
                      transformOrigin: 'left top',
                      transition: 'transform 0.2s ease-out',
                      minWidth: '100%',
                      minHeight: '100%',
                    }}
                  >
                    <div
                      className="min-w-[720px] grid gap-2"
                      style={{ gridTemplateColumns: `repeat(${filteredCourts.length}, 1fr)` }}
                    >
                      {/* Header campi */}
                      {filteredCourts.map((c, idx) => (
                        <div
                          key={`court-header-${c.id}-${idx}`}
                          className={`px-2 py-3 text-base font-bold text-center rounded-xl shadow-md ${T.cardBg} ${T.border}`}
                        >
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={`w-7 h-7 rounded-full bg-emerald-400 text-white flex items-center justify-center font-bold shadow`}
                            >
                              {c.name[0]}
                            </span>
                            <div className="flex flex-col items-start">
                              <span>{c.name}</span>
                              {form.start && hasPromoSlot(c.id, form.start) && (
                                <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-2 py-0.5 rounded-full font-medium">
                                  🏷️ Promo
                                </span>
                              )}
                              {c.hasHeating && (
                                <span className="text-xs text-orange-400 font-medium">
                                  🔥 Riscaldato
                                </span>
                              )}
                            </div>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Griglia principale - Desktop con zoom, Mobile con timeline verticale */}
          {isMobileView ? (
            <MobileBookingView
              filteredCourts={filteredCourts}
              timeSlots={timeSlots}
              renderCell={renderCell}
              currentDate={day}
              T={T}
            />
          ) : (
            <ZoomableGrid T={T} className="pb-4">
              <div
                className="min-w-[720px] grid gap-2"
                style={{ gridTemplateColumns: `repeat(${filteredCourts.length}, 1fr)` }}
              >
                {/* Celle prenotazione */}
                {timeSlots.map((t, r) => (
                  <React.Fragment key={t.getTime()}>
                    {filteredCourts.map((c, courtIdx) => (
                      <div
                        key={`cell-${c.id}-${t.getTime()}-${courtIdx}`}
                        className={`px-0.5 py-0.5 ${T.cardBg} ${T.border} rounded-lg`}
                      >
                        {renderCell(c.id, t)}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </ZoomableGrid>
          )}

          {/* Modal glassmorphism per prenotazione - FUTURISTIC DESIGN */}
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editingId ? 'Modifica prenotazione' : 'Nuova prenotazione'}
            T={T}
            size="xl"
          >
            {!form.start ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-3xl text-white">📅</span>
                </div>
                <div className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 from-white to-gray-300 bg-clip-text text-transparent mb-2">
                  Seleziona uno slot
                </div>
                <div className="text-gray-400">
                  Clicca su uno slot libero nella griglia per iniziare
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
                <div className="relative bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700/30 p-4 shadow-2xl">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Prima riga: Tipo prenotazione - Maestro - Numero partecipanti */}
                    <div className="sm:col-span-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Tipo prenotazione */}
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 from-white to-gray-300 bg-clip-text text-transparent">
                            <svg
                              className={`w-4 h-4 inline mr-2 ${ds.info}`}
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
                            Tipo prenotazione
                          </label>
                          <select
                            value={form.bookingType}
                            onChange={(e) => {
                              const newType = e.target.value;
                              setForm((f) => ({
                                ...f,
                                bookingType: newType,
                                instructorId: newType === 'partita' ? '' : f.instructorId,
                                participants:
                                  newType === 'lezione' ? f.participants || 1 : f.participants,
                              }));
                            }}
                            className="px-3 py-2 rounded-xl border border-gray-600/30 bg-gray-800/50 backdrop-blur-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium dark-select"
                          >
                            <option value="partita">
                              <svg
                                className={`w-4 h-4 inline mr-2 ${ds.info}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Partita
                            </option>
                            <option value="lezione">
                              <svg
                                className={`w-4 h-4 inline mr-2 ${ds.info}`}
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
                              Lezione
                            </option>
                          </select>
                        </div>

                        {/* Maestro */}
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 from-white to-gray-300 bg-clip-text text-transparent">
                            <svg
                              className={`w-4 h-4 inline mr-2 ${ds.info}`}
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
                            Maestro
                          </label>
                          <select
                            value={form.instructorId}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                instructorId: e.target.value,
                              }))
                            }
                            className="px-3 py-2 rounded-xl border border-gray-600/30 bg-gray-800/50 backdrop-blur-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium disabled:opacity-50 dark-select"
                            required={form.bookingType === 'lezione'}
                            disabled={form.bookingType !== 'lezione'}
                          >
                            <option value="">
                              {form.bookingType === 'lezione'
                                ? '-- Seleziona un maestro --'
                                : '-- Non necessario per partite --'}
                            </option>
                            {instructors.map((instructor) => (
                              <option key={instructor.id} value={instructor.id}>
                                {instructor.name}
                                {instructor.instructorData?.specialties?.length > 0 &&
                                  ` (${instructor.instructorData.specialties.join(', ')})`}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Numero partecipanti */}
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 from-white to-gray-300 bg-clip-text text-transparent">
                            <svg
                              className={`w-4 h-4 inline mr-2 ${ds.info}`}
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
                            Partecipanti
                          </label>
                          <select
                            value={form.participants}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setForm((f) => ({
                                ...f,
                                participants: val,
                                // Se si riduce il numero partecipanti, svuota campi giocatori eccedenti
                                p3Name: val < 3 ? '' : f.p3Name,
                                p4Name: val < 4 ? '' : f.p4Name,
                              }));
                            }}
                            className="px-3 py-2 rounded-xl border border-gray-600/30 bg-gray-800/50 backdrop-blur-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium disabled:opacity-50 dark-select"
                            disabled={form.bookingType !== 'lezione'}
                          >
                            {[1, 2, 3, 4].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                          <div className="text-xs text-gray-400 mt-1">
                            {form.bookingType === 'lezione'
                              ? 'Il prezzo della lezione si adatta automaticamente al numero di partecipanti.'
                              : 'Non necessario per le partite'}
                          </div>
                        </div>
                      </div>

                      {/* Messaggio di errore per maestro mancante */}
                      {form.bookingType === 'lezione' && !form.instructorId && (
                        <div className="sm:col-span-2">
                          <div className="text-sm text-red-400 bg-red-900/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-red-800/30">
                            ⚠️ Seleziona un maestro per le lezioni
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Campo, Inizio e Durata sulla stessa riga */}
                    <div className="sm:col-span-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Campo */}
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 from-white to-gray-300 bg-clip-text text-transparent">
                            <svg
                              className={`w-4 h-4 inline mr-2 ${ds.info}`}
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
                            Campo
                          </label>
                          <select
                            value={form.courtId}
                            onChange={(e) => setForm((f) => ({ ...f, courtId: e.target.value }))}
                            className="px-3 py-2 rounded-xl border border-gray-600/30 bg-gray-800/50 backdrop-blur-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium dark-select"
                          >
                            {filteredCourts.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          {form.courtId && hasPromoSlot(form.courtId, form.start) && (
                            <div className="text-xs bg-gradient-to-r from-yellow-400/80 to-orange-400/80 text-yellow-100 px-2 py-1 rounded-lg font-semibold inline-flex items-center gap-1 w-fit backdrop-blur-sm border border-yellow-300/50 mt-1">
                              🏷️ Promo
                            </div>
                          )}
                        </div>

                        {/* Inizio */}
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 from-white to-gray-300 bg-clip-text text-transparent">
                            <svg
                              className={`w-4 h-4 inline mr-2 ${ds.info}`}
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
                            Inizio
                          </label>
                          <input
                            type="time"
                            value={`${String(new Date(form.start).getHours()).padStart(2, '0')}:${String(new Date(form.start).getMinutes()).padStart(2, '0')}`}
                            onChange={(e) => {
                              const [hh, mm] = e.target.value.split(':').map(Number);
                              const d = new Date(form.start);
                              d.setHours(hh, mm, 0, 0);
                              setForm((f) => ({
                                ...f,
                                start: floorToSlot(d, cfg.slotMinutes),
                              }));
                            }}
                            className="px-3 py-2 rounded-xl border border-gray-600/30 bg-gray-800/50 backdrop-blur-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium"
                          />
                        </div>

                        {/* Durata */}
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 from-white to-gray-300 bg-clip-text text-transparent">
                            <svg
                              className={`w-4 h-4 inline mr-2 ${ds.info}`}
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
                            Durata
                          </label>
                          <select
                            value={form.duration}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                duration: Number(e.target.value),
                              }))
                            }
                            className="px-3 py-2 rounded-xl border border-gray-600/30 bg-gray-800/50 backdrop-blur-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium dark-select"
                          >
                            {(cfg.defaultDurations || [60, 90, 120]).map((m) => (
                              <option key={m} value={m}>
                                {m} min
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Giocatori in grid futuristica - spostato qui */}
                    <div className="sm:col-span-2">
                      <div className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 from-white to-gray-300 bg-clip-text text-transparent mb-2">
                        <svg
                          className={`w-4 h-4 inline mr-2 ${ds.info}`}
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
                        Giocatori
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          ['p1Name', 'Giocatore 1', 1],
                          ['p2Name', 'Giocatore 2', 2],
                          ['p3Name', 'Giocatore 3', 3],
                          ['p4Name', 'Giocatore 4', 4],
                        ]
                          .filter(([_, __, idx]) =>
                            form.bookingType === 'lezione'
                              ? idx <= Math.max(1, Math.min(4, form.participants || 1))
                              : true
                          )
                          .map(([key, label]) => (
                            <div key={key}>
                              <label className="text-xs font-semibold text-gray-400 mb-2 block">
                                {label}
                              </label>
                              <input
                                list="players-list"
                                value={form[key]}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    [key]: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 rounded-xl border border-gray-600/30 bg-gray-800/50 backdrop-blur-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200"
                                placeholder="Nome giocatore"
                              />
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="sm:col-span-1">
                      {/* Addon in layout futuristico - compatto */}
                      <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-2 border border-gray-600/20">
                        <div className="flex items-center gap-1 mb-1">
                          <h3 className="text-xs font-bold bg-gradient-to-r from-gray-800 to-gray-600 from-white to-gray-300 bg-clip-text text-transparent">
                            <svg
                              className={`w-4 h-4 inline mr-2 ${ds.info}`}
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
                            Servizi
                          </h3>
                        </div>
                        <div className="flex flex-col gap-2">
                          {cfg.addons?.lightingEnabled && (
                            <label className="inline-flex items-center gap-2 cursor-pointer bg-blue-900/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-blue-800/30 hover:bg-blue-800/30 transition-all duration-200">
                              <input
                                type="checkbox"
                                checked={form.useLighting}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    useLighting: e.target.checked,
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-800/50 border-blue-300 border-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-blue-300">
                                  <svg
                                    className={`w-4 h-4 inline mr-2 ${ds.info}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                    />
                                  </svg>
                                  Illuminazione
                                </span>
                                <span className="text-xs text-blue-400">
                                  +{euro(cfg.addons.lightingFee || 0)}
                                </span>
                              </div>
                            </label>
                          )}
                          {cfg.addons?.heatingEnabled &&
                            (() => {
                              const selectedCourt = courts.find((c) => c.id === form.courtId);
                              return (
                                selectedCourt?.hasHeating && (
                                  <label className="inline-flex items-center gap-2 cursor-pointer bg-purple-900/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-purple-800/30 hover:bg-purple-800/30 transition-all duration-200">
                                    <input
                                      type="checkbox"
                                      checked={form.useHeating}
                                      onChange={(e) =>
                                        setForm((f) => ({
                                          ...f,
                                          useHeating: e.target.checked,
                                        }))
                                      }
                                      className="w-4 h-4 text-purple-600 bg-gray-800/50 border-purple-300 border-purple-600 rounded focus:ring-purple-500 focus:ring-2"
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-purple-300">
                                        <svg
                                          className={`w-4 h-4 inline mr-2 ${ds.info}`}
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                                          />
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                                          />
                                        </svg>
                                        Riscaldamento
                                      </span>
                                      <span className="text-xs text-purple-400">
                                        +{euro(cfg.addons.heatingFee || 0)}
                                      </span>
                                    </div>
                                  </label>
                                )
                              );
                            })()}
                        </div>

                        {/* Totale separato */}
                        <div className="mt-4 flex justify-end">
                          <div className="bg-gradient-to-r from-blue-700 to-blue-800 backdrop-blur-xl rounded-xl border border-blue-600/50 px-4 py-3 shadow-xl">
                            <div className="text-right">
                              <div className="text-lg font-black text-white">
                                Totale: {previewPrice == null ? '—' : euro(previewPrice)}
                              </div>
                              {previewPrice != null && perPlayer != null && (
                                <div className="text-sm text-blue-100 mt-1 font-semibold">
                                  {form.bookingType === 'lezione'
                                    ? `${euro2(perPlayer)} x ${courts.find((c) => c.id === form.courtId)?.maxPlayers || 4} Partecipanti`
                                    : `${euro2(perPlayer)} x ${courts.find((c) => c.id === form.courtId)?.maxPlayers || 4} Giocatori`}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Prenotato da e note */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 from-white to-gray-300 bg-clip-text text-transparent mb-1 block">
                          <svg
                            className={`w-4 h-4 inline mr-2 ${ds.info}`}
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
                          Prenotazione a nome di
                        </label>
                        <input
                          value={form.bookedBy}
                          onChange={(e) => setForm((f) => ({ ...f, bookedBy: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-gray-600/30 bg-gray-800/50 backdrop-blur-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200"
                          placeholder="Es. Andrea Paris"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 from-white to-gray-300 bg-clip-text text-transparent mb-1 block">
                          <svg
                            className={`w-4 h-4 inline mr-2 ${ds.info}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          Note
                        </label>
                        <input
                          value={form.note}
                          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-gray-600/30 bg-gray-800/50 backdrop-blur-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200"
                          placeholder="Es. Lezioni, torneo, ecc."
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 from-white to-gray-300 bg-clip-text text-transparent mb-1 block">
                          <svg
                            className={`w-4 h-4 inline mr-2 ${ds.info}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                            />
                          </svg>
                          Colore
                          {form.bookingType === 'lezione' && form.instructorId && (
                            <span className="ml-1 text-xs text-blue-400 font-normal">
                              (maestro)
                            </span>
                          )}
                          {form.bookingType === 'partita' && (
                            <span className="ml-1 text-xs text-pink-400 font-normal">
                              (partita)
                            </span>
                          )}
                        </label>
                        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-2 border border-gray-600/20">
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="color"
                              value={form.color}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  color: e.target.value,
                                }))
                              }
                              className="w-8 h-8 rounded-lg border border-gray-600/30 cursor-pointer"
                              title="Seleziona colore personalizzato"
                            />
                            <div
                              className="flex-1 h-8 rounded-lg border flex items-center justify-center text-xs font-medium"
                              style={{
                                backgroundColor: form.color + '40',
                                borderColor: form.color + '80',
                                color: form.color,
                              }}
                            >
                              Anteprima
                            </div>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {[
                              { color: '#e91e63', name: 'Rosa' },
                              { color: '#f44336', name: 'Rosso' },
                              { color: '#00bcd4', name: 'Turchese' },
                              { color: '#2196f3', name: 'Blu' },
                              { color: '#4caf50', name: 'Verde' },
                              { color: '#ff9800', name: 'Arancione' },
                              { color: '#9c27b0', name: 'Viola' },
                              { color: '#607d8b', name: 'Grigio' },
                            ].map((preset) => (
                              <button
                                key={preset.color}
                                type="button"
                                onClick={() =>
                                  setForm((f) => ({
                                    ...f,
                                    color: preset.color,
                                  }))
                                }
                                className={`w-7 h-7 rounded-lg cursor-pointer transition-all duration-200 hover:scale-110 ${
                                  form.color === preset.color
                                    ? 'ring-2 ring-white scale-110'
                                    : 'border border-gray-600/50'
                                }`}
                                style={{ backgroundColor: preset.color }}
                                title={preset.name}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Datalist per autocompletamento */}
                    <datalist id="players-list">
                      {playersAlpha.map((p) => (
                        <option key={p.id} value={p.name} />
                      ))}
                    </datalist>

                    {/* Azioni desktop */}
                    <div className="hidden md:flex gap-3 pt-6">
                      <button
                        type="button"
                        onClick={saveBooking}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                      >
                        {editingId ? '✓ Aggiorna prenotazione' : '✓ Conferma prenotazione'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="px-6 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 text-gray-300 font-semibold rounded-xl hover:bg-gray-600/70 transition-all duration-200"
                      >
                        Annulla
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          onClick={() => hardDeleteBooking(editingId)}
                          className="bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold px-6 py-3 rounded-xl shadow-2xl hover:from-red-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105"
                        >
                          🗑️ Elimina
                        </button>
                      )}
                    </div>

                    {/* Spazio per pulsanti mobili */}
                    <div className="h-16 md:hidden"></div>
                  </div>

                  {/* Pulsanti mobili fluttuanti */}
                  <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-xl border-t border-gray-700/30 p-4 z-50 shadow-2xl">
                    <div className="flex gap-3 max-w-md mx-auto">
                      <button
                        type="button"
                        onClick={saveBooking}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 rounded-xl shadow-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                      >
                        {editingId ? '✓ Aggiorna' : '✓ Conferma'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="flex-1 bg-gray-800/70 backdrop-blur-sm text-gray-300 font-semibold py-4 rounded-xl border border-gray-600/30 hover:bg-gray-600/90 transition-all duration-200"
                      >
                        Annulla
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          onClick={() => hardDeleteBooking(editingId)}
                          className="bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold px-6 py-4 rounded-xl shadow-2xl hover:from-red-600 hover:to-rose-700 transition-all duration-300"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Modal>

          {/* Pulsanti fluttuanti FUORI dal modal - sempre sopra tutto su mobile */}
          {modalOpen && form.start && (
            <>
              <div className="fixed bottom-24 left-4 right-4 z-[99999] flex gap-3 md:hidden bg-gray-800/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-gray-700/30">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
                >
                  ❌ Annulla
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => hardDeleteBooking(editingId)}
                    className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold px-8 py-4 rounded-xl shadow-2xl transition-all duration-200 hover:scale-105 border border-red-300/50"
                  >
                    🗑️ Elimina
                  </button>
                )}
              </div>

              {/* Pulsante elimina fluttuante per mobile (solo in editing) */}
              {editingId && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[99999] md:hidden">
                  <button
                    type="button"
                    onClick={() => cancelBooking(editingId)}
                    className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold px-8 py-4 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 border border-red-300/50"
                  >
                    🗑️ Elimina
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </Section>
  );
}
