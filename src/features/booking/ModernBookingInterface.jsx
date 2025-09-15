import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Section from "@ui/Section.jsx";
import Badge from "@ui/Badge.jsx";
import { createDSClasses } from "@lib/design-system.js";
import { floorToSlot, addMinutes, sameDay, overlaps } from "@lib/date.js";
import { computePrice, getRateInfo, isCourtBookableAt } from "@lib/pricing.js";
import {
  useUnifiedBookings,
  useUserBookings,
  BOOKING_STATUS,
} from "@hooks/useUnifiedBookings.js";
import UnifiedBookingService, {
  wouldCreateHalfHourHole as checkHoleCreation,
  isTimeSlotTrapped as checkSlotTrapped,
} from "@services/unified-booking-service.js";

function ModernBookingInterface({ user, T, state, setState }) {
  const ds = createDSClasses(T);

  // Use unified booking service with ALL bookings (court + lesson) for availability checks
  const {
    bookings: allBookings,
    loading: bookingsLoading,
    createBooking: createUnifiedBooking,
  } = useUnifiedBookings({
    autoLoadUser: false,
    autoLoadLessons: true,
  });

  const { userBookings, activeUserBookings } = useUserBookings();

  const cfg = state?.bookingConfig || {
    slotMinutes: 30,
    dayStartHour: 8,
    dayEndHour: 23,
    defaultDurations: [60, 90, 120],
    addons: {},
  };
  const courtsFromState = Array.isArray(state?.courts) ? state.courts : [];
  // Durate consentite dalla configurazione (fallback 60/90/120)
  const allowedDurations = useMemo(() => {
    let list = cfg?.defaultDurations;
    if (typeof list === "string") {
      list = list
        .split(",")
        .map((x) => parseInt(String(x).trim(), 10))
        .filter((n) => !Number.isNaN(n));
    }
    if (!Array.isArray(list) || list.length === 0) return [60, 90, 120];
    // Normalizza e ordina
    const set = Array.from(
      new Set(
        list.filter((n) =>
          [30, 45, 60, 75, 90, 105, 120, 150].includes(Number(n)),
        ),
      ),
    )
      .map(Number)
      .sort((a, b) => a - b);
    return set.length ? set : [60, 90, 120];
  }, [cfg?.defaultDurations]);

  // References per lo scroll automatico
  const timeSectionRef = useRef(null);
  const courtSectionRef = useRef(null);

  // Stato interfaccia utente
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [duration, setDuration] = useState(60);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [lighting, setLighting] = useState(false);
  const [heating, setHeating] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [additionalPlayers, setAdditionalPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showErrorAnimation, setShowErrorAnimation] = useState(false);

  // Stato dati prenotazioni
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Mantieni la durata selezionata entro quelle consentite
  useEffect(() => {
    if (!allowedDurations.includes(duration)) {
      setDuration(allowedDurations[0] || 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedDurations.join(",")]);

  // Helper function to check slot availability using unified service data
  const isSlotAvailable = useCallback(
    (courtId, date, time, checkDuration = 60) => {
      if (!courtId || !date || !time) return false;

      const startDateTime = new Date(`${date}T${time}:00`);
      const endDateTime = new Date(
        startDateTime.getTime() + checkDuration * 60000,
      );

      return !allBookings.some((booking) => {
        if (booking.courtId !== courtId) return false;

        // Check if booking is active (confirmed or pending)
        const status = booking.status || BOOKING_STATUS.CONFIRMED; // Default to confirmed
        if (status === BOOKING_STATUS.CANCELLED) return false; // Skip cancelled bookings

        const bookingStart = new Date(
          booking.start || `${booking.date}T${booking.time}:00`,
        );
        const bookingEnd = new Date(
          bookingStart.getTime() + (booking.duration || 60) * 60000,
        );

        return (
          (startDateTime >= bookingStart && startDateTime < bookingEnd) ||
          (endDateTime > bookingStart && endDateTime <= bookingEnd) ||
          (startDateTime <= bookingStart && endDateTime >= bookingEnd)
        );
      });
    },
    [allBookings],
  );

  // Hole prevention rule
  const wouldCreateHalfHourHole = useCallback(
    (courtId, date, time, checkDuration) => {
      if (!courtId || !date || !time || !checkDuration) return false;

      // Convert allBookings to the format expected by unified service
      const existingBookings = allBookings.map((booking) => ({
        courtId: booking.courtId,
        date:
          booking.date || (booking.start ? booking.start.split("T")[0] : ""),
        time:
          booking.time ||
          (booking.start ? booking.start.split("T")[1].substring(0, 5) : ""),
        duration: booking.duration || 60,
        status: booking.status || "confirmed",
      }));

      // Use the imported hole prevention function
      const result = checkHoleCreation(
        courtId,
        date,
        time,
        checkDuration,
        existingBookings,
      );

      // Log only when hole is detected
      if (result) {
        console.log(
          `🚫 [HOLE BLOCKED] ${courtId} at ${time} (${checkDuration}min) would create 30min unusable slot`,
        );
      }

      return result;
    },
    [allBookings],
  );

  // Wrapper for trapped logic - check if slot is in a trapped state
  const isTimeSlotTrapped = useCallback(
    (courtId, date, time, checkDuration) => {
      if (!courtId || !date || !time || !checkDuration) return false;

      // Convert allBookings to the format expected by unified service
      const existingBookings = allBookings.map((booking) => ({
        courtId: booking.courtId,
        date:
          booking.date || (booking.start ? booking.start.split("T")[0] : ""),
        time:
          booking.time ||
          (booking.start ? booking.start.split("T")[1].substring(0, 5) : ""),
        duration: booking.duration || 60,
        status: booking.status || "confirmed",
      }));

      // Use the imported trapped slot logic from unified service
      const result = checkSlotTrapped(
        courtId,
        date,
        time,
        checkDuration,
        existingBookings,
      );

      return result;
    },
    [allBookings],
  );

  // Scroll function for better UX
  const scrollToSection = (ref, delay = 100) => {
    if (ref?.current) {
      setTimeout(() => {
        if (ref.current) {
          ref.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
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
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
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

  // Controlla la disponibilità degli slot temporali
  const checkSlotAvailability = useCallback(
    (courtId, date, time) => {
      return isSlotAvailable(courtId, date, time, duration);
    },
    [duration, isSlotAvailable],
  );

  // Genera i giorni disponibili per la prenotazione
  const availableDays = useMemo(() => {
    const days = [];
    const daysNames = ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      days.push({
        date: dateStr,
        dayName: daysNames[date.getDay()],
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString("it-IT", { month: "short" }),
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
    const today = new Date().toISOString().split("T")[0];

    for (let hour = start; hour < end; hour++) {
      for (let minute = 0; minute < 60; minute += step) {
        const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

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
          const scheduleOk = isCourtBookableAt(
            slotDate,
            court.id,
            courtsFromState,
          );
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
          if (!anyScheduleOk) reason = "out-of-schedule";
          else if (anyOccupied && !anyFreeIgnoringHole) reason = "occupied";
        }

        // Mostra lo slot se non si filtra o se è disponibile
        if (!showOnlyAvailable || isAvailable) {
          slots.push({
            time: timeStr,
            isAvailable,
            availableCourts: 0,
            totalCourts: courtsFromState.length,
            reason,
          });
        }
      }
    }
    return slots;
  }, [
    selectedDate,
    duration,
    allBookings,
    courtsFromState,
    checkSlotAvailability,
    showOnlyAvailable,
    cfg,
  ]);

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
        type: "error",
        text: "Devi effettuare il login per prenotare un campo",
      });
      return;
    }

    if (!selectedDate || !selectedTime || !selectedCourt) {
      setMessage({ type: "error", text: "Seleziona data, orario e campo" });
      return;
    }

    // Controlla la disponibilità usando unified service
    const isAvailable = isSlotAvailable(
      selectedCourt.id,
      selectedDate,
      selectedTime,
      duration,
    );
    if (!isAvailable) {
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
      duration,
    );
    if (wouldCreateHole) {
      setMessage({
        type: "error",
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
          courtsFromState,
        ),
        userPhone: "",
        notes: "",
        players: [
          user.displayName || user.email,
          ...additionalPlayers.map((p) => p.name),
        ],
        type: "court",
      };

      await createUnifiedBooking(bookingData);

      // Update App state for immediate reflection
      if (state && setState) {
        const toAppBooking = {
          id: `booking-${Date.now()}`,
          courtId: bookingData.courtId,
          start: new Date(
            `${bookingData.date}T${bookingData.time}:00`,
          ).toISOString(),
          duration: bookingData.duration,
          players: [],
          playerNames: additionalPlayers.map((p) => p.name),
          guestNames: additionalPlayers.map((p) => p.name),
          price: bookingData.price,
          note: bookingData.notes || "",
          bookedByName: user.displayName || user.email || "",
          addons: {
            lighting: !!bookingData.lighting,
            heating: !!bookingData.heating,
          },
          status: "booked",
          createdAt: Date.now(),
        };

        // Il servizio unificato gestisce automaticamente lo stato
        // setState((s) => ({ ...s, bookings: [...(s.bookings || []), toAppBooking] }));
      }

      // Mostra animazione di successo
      setShowSuccessAnimation(true);
      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 3000);

      // Ripristina il modulo
      setSelectedTime("");
      setSelectedCourt(null);
      setLighting(false);
      setHeating(false);
      setUserPhone("");
      setNotes("");
      setAdditionalPlayers([]);
      setNewPlayerName("");
      setShowBookingModal(false);

      setMessage({
        type: "success",
        text: `Prenotazione confermata! Campo ${selectedCourt?.name} il ${new Date(selectedDate).toLocaleDateString("it-IT")} alle ${selectedTime}`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Errore durante la prenotazione. Riprova.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestisce il click su uno slot orario
  const handleTimeSlotClick = async (timeSlot) => {
    if (!timeSlot.isAvailable) return;

    // Il servizio unificato gestisce automaticamente l'aggiornamento dei dati
    // Non è più necessario aggiornare manualmente le prenotazioni

    // Ricontrolla la disponibilità
    const stillAvailable = courtsFromState.some((court) => {
      const dt = new Date(`${selectedDate}T${timeSlot.time}:00`);
      const scheduleOk = isCourtBookableAt(dt, court.id, courtsFromState);
      const free = isSlotAvailable(
        court.id,
        selectedDate,
        timeSlot.time,
        duration,
        allBookings,
      );
      const hole = wouldCreateHalfHourHole(
        court.id,
        selectedDate,
        timeSlot.time,
        duration,
        allBookings,
      );
      const isTrapped = isTimeSlotTrapped(
        court.id,
        selectedDate,
        timeSlot.time,
        duration,
        allBookings,
      );
      // Deroga per slot intrappolati: è disponibile anche se crea buco
      return scheduleOk && free && (!hole || isTrapped);
    });

    if (!stillAvailable) {
      setMessage({
        type: "error",
        text: "Questo orario è appena stato prenotato. Seleziona un altro slot.",
      });
      return;
    }

    // Imposta l'orario selezionato - lo scroll avverrà nel useEffect
    setSelectedTime(timeSlot.time);

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
        allBookings,
      );
      const isTrapped = isTimeSlotTrapped(
        court.id,
        selectedDate,
        timeSlot.time,
        duration,
        allBookings,
      );
      // Deroga per slot intrappolati: è disponibile anche se crea buco
      return scheduleOk && free && (!hole || isTrapped);
    });

    if (availableCourts.length === 1) {
      setSelectedCourt(availableCourts[0]);
      setShowBookingModal(true);
    }
  };

  // Gestisce l'aggiunta e rimozione di giocatori
  const addPlayer = () => {
    if (newPlayerName.trim() && additionalPlayers.length < 3) {
      setAdditionalPlayers([
        ...additionalPlayers,
        {
          id: Date.now(),
          name: newPlayerName.trim(),
        },
      ]);
      setNewPlayerName("");
    }
  };

  const removePlayer = (playerId) => {
    setAdditionalPlayers(additionalPlayers.filter((p) => p.id !== playerId));
  };

  const totalPrice =
    selectedCourt && selectedDate && selectedTime
      ? computePrice(
          new Date(`${selectedDate}T${selectedTime}:00`),
          duration,
          cfg,
          { lighting, heating },
          selectedCourt.id,
          courtsFromState,
        )
      : 0;

  // Helper: verifica che l'intera durata rientri nella stessa fascia attiva del campo
  const isDurationWithinSchedule = useCallback(
    (startDate, durationMin, courtId) => {
      if (!startDate || !courtId) return false;
      const court = courtsFromState.find((c) => c.id === courtId);
      if (!court?.timeSlots?.length) return false;
      const day = startDate.getDay();
      const startMin = startDate.getHours() * 60 + startDate.getMinutes();
      const toMin = (hhmm = "00:00") => {
        const [h, m] = String(hhmm)
          .split(":")
          .map((n) => +n || 0);
        return h * 60 + m;
      };
      const active = court.timeSlots.find(
        (slot) =>
          Array.isArray(slot.days) &&
          slot.days.includes(day) &&
          startMin >= toMin(slot.from) &&
          startMin < toMin(slot.to),
      );
      if (!active) return false;
      const endMin = startMin + Number(durationMin || 0);
      return endMin <= toMin(active.to);
    },
    [courtsFromState],
  );

  // Helper: verifica se una specifica durata è prenotabile per il campo/ora selezionati
  const isDurationOptionBookable = useCallback(
    (dur) => {
      if (!selectedCourt || !selectedDate || !selectedTime) return false;
      const dt = new Date(`${selectedDate}T${selectedTime}:00`);
      const scheduleOk = isDurationWithinSchedule(dt, dur, selectedCourt.id);
      if (!scheduleOk) return false;
      const free = isSlotAvailable(
        selectedCourt.id,
        selectedDate,
        selectedTime,
        dur,
      );
      if (!free) return false;
      const hole = wouldCreateHalfHourHole(
        selectedCourt.id,
        selectedDate,
        selectedTime,
        dur,
      );
      // Applica deroga per slot intrappolati: se crea buco ma è intrappolato, è comunque prenotabile
      if (hole) {
        const isTrapped = isTimeSlotTrapped(
          selectedCourt.id,
          selectedDate,
          selectedTime,
          dur,
          bookings,
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
    ],
  );

  // Elenco durate effettivamente disponibili in base a regole e fascia
  const effectiveAvailableDurations = useMemo(() => {
    const candidates = [60, 90, 120].filter((d) =>
      allowedDurations.includes(d),
    );
    if (!selectedCourt || !selectedDate || !selectedTime) return candidates; // niente da filtrare finché non selezionati
    return candidates.filter((d) => isDurationOptionBookable(d));
  }, [
    allowedDurations,
    selectedCourt,
    selectedDate,
    selectedTime,
    isDurationOptionBookable,
  ]);

  // Se la durata corrente non è disponibile, auto-seleziona la prima disponibile
  useEffect(() => {
    if (!effectiveAvailableDurations.includes(duration)) {
      if (effectiveAvailableDurations.length)
        setDuration(effectiveAvailableDurations[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveAvailableDurations.join(",")]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header mobile-friendly */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-emerald-600 px-4 py-3 sm:hidden">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Prenota Campo
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Messaggi di stato - Ottimizzati per mobile */}
        {message && (
          <div
            className={`mb-6 p-3 sm:p-4 rounded-lg text-sm ${
              message.type === "error"
                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
                : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Selezione Giorno - Migliorata per mobile */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 dark:border-emerald-600 p-3 sm:p-6 mb-4 sm:mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">
            Seleziona il giorno
          </h2>
          <div className="overflow-x-auto scrollbar-hide">
            <div
              className="flex gap-2 pb-2"
              style={{ minWidth: "max-content" }}
            >
              {availableDays.slice(0, 10).map((day) => (
                <button
                  key={day.date}
                  onClick={() => {
                    setSelectedDate(day.date);
                    setSelectedTime("");
                    setSelectedCourt(null);
                    // Scorri agli orari quando si seleziona un giorno
                    scrollToSection(timeSectionRef, 200);
                  }}
                  className={`flex-shrink-0 p-2 sm:p-3 rounded-lg border-2 text-center transition-all min-w-[60px] sm:min-w-[80px] ${
                    selectedDate === day.date
                      ? "bg-blue-500 text-white border-blue-500 shadow-md"
                      : "bg-emerald-50/70 dark:bg-gray-700/50 border-emerald-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-gray-500 hover:bg-emerald-100 dark:hover:bg-gray-600 active:bg-emerald-100 dark:active:bg-gray-600 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <div className="text-xs font-medium mb-1">{day.dayName}</div>
                  <div className="text-base sm:text-lg font-bold">
                    {day.dayNumber}
                  </div>
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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 dark:border-emerald-600 p-3 sm:p-6 mb-4 sm:mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3">
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                Seleziona l'orario
              </h2>
              <label className="flex items-center gap-2 text-xs sm:text-sm">
                <input
                  type="checkbox"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                  className="rounded text-blue-500"
                />
                <span className="text-gray-600 dark:text-gray-300">
                  Solo orari disponibili
                </span>
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
                      ? "bg-blue-500 text-white border-blue-500 shadow-md"
                      : slot.isAvailable
                        ? "bg-emerald-50/70 dark:bg-gray-700/50 border-emerald-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer active:bg-blue-100 dark:active:bg-blue-900/50 text-gray-900 dark:text-gray-100"
                        : "bg-gray-100 dark:bg-gray-800 border-emerald-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <div className="font-medium text-sm sm:text-base">
                    {slot.time}
                  </div>
                  {!slot.isAvailable && (
                    <div className="text-xs mt-1">
                      {slot.reason === "out-of-schedule"
                        ? "Fuori orario disponibile"
                        : "Occupato"}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {timeSlots.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {showOnlyAvailable
                  ? "Nessun orario disponibile per questo giorno"
                  : "Nessun orario configurato"}
              </div>
            )}
          </div>
        )}

        {/* Selezione Campo - Mobile-first design */}
        {selectedTime && (
          <div
            ref={courtSectionRef}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 dark:border-emerald-600 p-3 sm:p-6 mb-4 sm:mb-6"
          >
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">
              Prenota un campo
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {courtsFromState.map((court) => {
                const slotDate = new Date(`${selectedDate}T${selectedTime}:00`);
                const isWithinSchedule = isCourtBookableAt(
                  slotDate,
                  court.id,
                  courtsFromState,
                );
                const free = checkSlotAvailability(
                  court.id,
                  selectedDate,
                  selectedTime,
                );
                const createsHole =
                  isWithinSchedule &&
                  free &&
                  wouldCreateHalfHourHole(
                    court.id,
                    selectedDate,
                    selectedTime,
                    duration,
                  );

                // Simplified logic: wouldCreateHalfHourHole already handles 120min exemption internally
                const isAvailable = isWithinSchedule && free && !createsHole;
                return (
                  <div
                    key={court.id}
                    onClick={() => {
                      if (isAvailable) {
                        setSelectedCourt(court);
                        setShowBookingModal(true);
                      }
                    }}
                    className={`border-2 rounded-xl p-4 sm:p-5 transition-all duration-300 touch-manipulation ${
                      isAvailable
                        ? "bg-emerald-50/70 dark:bg-gray-700/50 border-emerald-200 dark:border-gray-600 hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 active:bg-blue-100 dark:active:bg-blue-900/20 transform hover:scale-105 hover:-translate-y-1"
                        : "bg-gray-100 dark:bg-gray-800 border-emerald-300 dark:border-gray-700 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div>
                            <h3
                              className={`font-bold text-base sm:text-lg ${
                                isAvailable
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-500 dark:text-gray-400"
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
                            new Date(`${selectedDate}T${selectedTime}:00`),
                          ) && (
                            <div className="mb-3">
                              <Badge variant="success" size="sm" T={T}>
                                🏷️ Offerta Speciale
                              </Badge>
                            </div>
                          )}

                        {isAvailable &&
                          court.features &&
                          court.features.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {court.features.map((feature, index) => (
                                <span
                                  key={index}
                                  className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full border border-blue-200 dark:border-blue-700"
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
                            <div className="bg-gradient-to-r from-emerald-500 to-green-600 dark:from-emerald-600 dark:to-green-700 text-white px-4 py-2 rounded-xl shadow-lg mb-2">
                              <div className="text-2xl sm:text-3xl font-bold">
                                {computePrice(
                                  new Date(`${selectedDate}T${selectedTime}:00`),
                                  90,
                                  cfg,
                                  {},
                                  court.id,
                                  courtsFromState,
                                )}
                                €
                              </div>
                              <div className="text-xs opacity-90">
                                90 minuti
                              </div>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-lg text-xs font-medium">
                              {(
                                computePrice(
                                  new Date(
                                    `${selectedDate}T${selectedTime}:00`,
                                  ),
                                  90,
                                  cfg,
                                  {},
                                  court.id,
                                  courtsFromState,
                                ) / 4
                              ).toFixed(1)}
                              € a persona
                            </div>
                          </>
                        ) : (
                          <div className="text-center bg-gray-200 dark:bg-gray-700 px-4 py-3 rounded-xl">
                            <div className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">
                              Non disponibile
                            </div>
                            <div className="text-xs text-red-500 dark:text-red-400">
                              {!isWithinSchedule
                                ? "Fuori orario"
                                : "Già prenotato"}
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

      {/* Booking Modal - Completamente ridisegnato per mobile */}
      {showBookingModal && selectedCourt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 backdrop-fade">
          {/* Mobile: Full screen bottom sheet */}
          <div className="bg-white dark:bg-gray-800 w-full h-auto max-h-[95vh] sm:max-w-md sm:max-h-[90vh] sm:rounded-lg rounded-t-2xl sm:rounded-t-lg flex flex-col slide-up-mobile sm:animate-none shadow-2xl border-t dark:border-emerald-600">
            {/* Mobile handle bar */}
            <div className="flex justify-center pt-2 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>

            {/* Header fisso */}
            <div className="px-4 py-3 sm:p-6 border-b dark:border-emerald-600 flex-shrink-0 touch-select-none">
              <div className="flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Conferma Prenotazione
                </h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 touch-manipulation tap-highlight-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <span className="text-lg sm:text-base">✕</span>
                </button>
              </div>
            </div>

            {/* Contenuto scrollabile */}
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:p-6">
              {/* Riepilogo con design più accattivante */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-xl mb-6 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {selectedCourt.name}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">📅</span>
                    <span>
                      {new Date(selectedDate).toLocaleDateString("it-IT", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">🕐</span>
                    <span>{selectedTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">⏱️</span>
                    <span>{duration} min</span>
                  </div>
                </div>
              </div>

              {/* Durata - Design più moderno e touch-friendly */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">
                  Durata partita
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[60, 90, 120].map((dur) => {
                    const price = computePrice(
                      new Date(`${selectedDate}T${selectedTime}:00`),
                      dur,
                      cfg,
                      { lighting, heating },
                      selectedCourt.id,
                      courtsFromState,
                    );
                    const pricePerPerson = (price / 4).toFixed(1);
                    const isAllowedDuration = allowedDurations.includes(dur);

                    // Check if this duration would create a hole for the current context
                    const wouldCreateHoleForDuration =
                      selectedCourt && selectedDate && selectedTime
                        ? wouldCreateHalfHourHole(
                            selectedCourt.id,
                            selectedDate,
                            selectedTime,
                            dur,
                          )
                        : false;

                    const isBookableDuration =
                      isAllowedDuration && !wouldCreateHoleForDuration;

                    return (
                      <button
                        key={dur}
                        onClick={() => isBookableDuration && setDuration(dur)}
                        disabled={!isBookableDuration}
                        className={`p-4 rounded-xl border-2 text-center transition-all touch-manipulation ${
                          !isBookableDuration
                            ? "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 cursor-not-allowed"
                            : duration === dur
                              ? "bg-blue-500 text-white border-blue-500 shadow-lg scale-105"
                              : "bg-white dark:bg-gray-700 border-emerald-200 dark:border-emerald-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 active:bg-blue-100 dark:active:bg-blue-900/50 text-gray-900 dark:text-gray-100"
                        }`}
                        title={
                          !isBookableDuration
                            ? "Questa durata creerebbe un buco di 30 minuti non utilizzabile"
                            : ""
                        }
                      >
                        {!isBookableDuration ? (
                          <>
                            <div className="font-bold text-lg">{dur}min</div>
                            <div className="text-sm font-bold mt-1 text-red-700 dark:text-red-400">
                              Non Disponibile
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-bold text-lg">{dur}min</div>
                            <div className="text-lg font-bold mt-1">
                              {price}€
                            </div>
                            <div className="text-xs opacity-75 mt-1">
                              {pricePerPerson}€/persona
                            </div>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Servizi Extra - Design migliorato */}
              {(cfg.addons?.lightingEnabled || cfg.addons?.heatingEnabled) && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">
                    Servizi Extra
                  </label>
                  <div className="space-y-3">
                    {cfg.addons?.lightingEnabled && (
                      <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 touch-manipulation">
                        <input
                          type="checkbox"
                          checked={lighting}
                          onChange={(e) => setLighting(e.target.checked)}
                          className="rounded w-5 h-5 text-blue-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Illuminazione
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            +{cfg.addons?.lightingFee || 0}€
                          </div>
                        </div>
                        <span className="text-2xl">💡</span>
                      </label>
                    )}
                    {cfg.addons?.heatingEnabled &&
                      selectedCourt?.hasHeating && (
                        <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 touch-manipulation">
                          <input
                            type="checkbox"
                            checked={heating}
                            onChange={(e) => setHeating(e.target.checked)}
                            className="rounded w-5 h-5 text-blue-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Riscaldamento
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              +{cfg.addons?.heatingFee || 0}€
                            </div>
                          </div>
                          <span className="text-2xl">🔥</span>
                        </label>
                      )}
                  </div>
                </div>
              )}

              {/* Giocatori - Design completamente rinnovato */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">
                  Giocatori ({1 + additionalPlayers.length}/4)
                </label>

                {/* Organizzatore */}
                <div className="mb-3 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border-l-4 border-blue-500">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">👑</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user?.displayName || user?.email}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Organizzatore
                      </div>
                    </div>
                  </div>
                </div>

                {/* Giocatori aggiuntivi */}
                <div className="space-y-2 mb-4">
                  {additionalPlayers.map((player, index) => (
                    <div
                      key={player.id}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">👤</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {player.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Giocatore {index + 2}
                        </div>
                      </div>
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="w-8 h-8 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center touch-manipulation transition-colors"
                      >
                        <span className="text-sm">✕</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Aggiungi giocatore */}
                {additionalPlayers.length < 3 && (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                      placeholder="Nome nuovo giocatore"
                      className="flex-1 p-3 border-2 border-emerald-200 dark:border-emerald-600 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <button
                      onClick={addPlayer}
                      disabled={!newPlayerName.trim()}
                      className="px-6 py-3 bg-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation hover:bg-blue-600 transition-colors"
                    >
                      Aggiungi
                    </button>
                  </div>
                )}
              </div>

              {/* Prezzo finale - Design premium */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-xl border border-green-200 dark:border-green-700 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Totale partita
                  </span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {totalPrice}€
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Costo per persona
                  </span>
                  <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {(totalPrice / 4).toFixed(1)}€
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-700">
                  <div className="text-xs text-green-700 dark:text-green-300 font-medium">
                    💰 Pagamento in loco
                  </div>
                </div>
              </div>
            </div>

            {/* Spazio per evitare overlap con bottoni fluttuanti su mobile */}
            <div className="p-4 sm:p-6 border-t dark:border-gray-600 bg-white dark:bg-gray-800 flex-shrink-0 lg:hidden">
              <div className="h-24"></div>
            </div>

            {/* Footer per desktop - nascosto su mobile */}
            <div className="p-4 sm:p-6 border-t dark:border-gray-600 bg-white dark:bg-gray-800 flex-shrink-0 hidden lg:block">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-4 px-4 border-2 border-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 touch-manipulation transition-colors"
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
              className="flex-1 backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium text-sm transition-all shadow-lg hover:bg-white/95 dark:hover:bg-gray-800/95"
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
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-black dark:bg-opacity-80 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full text-center border dark:border-gray-600 shadow-2xl transform animate-pulse">
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
                    animationDuration: '2s'
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
                        animation: 'drawCheck 0.8s ease-in-out'
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
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-300 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white animate-fade-in">
                  🎾 Fantastico!
                </h3>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-700">
                  <p className="text-green-800 dark:text-green-200 font-semibold">
                    Prenotazione confermata!
                  </p>
                  <p className="text-green-600 dark:text-green-300 text-sm mt-1">
                    Il tuo campo è stato riservato con successo
                  </p>
                </div>
                
                {/* Campo info recap */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span>📅</span>
                    <span>{new Date(selectedDate).toLocaleDateString('it-IT', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}</span>
                    <span>•</span>
                    <span>🕐 {selectedTime}</span>
                    <span>•</span>
                    <span>🎾 {selectedCourt?.name}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-xs text-gray-400 dark:text-gray-500 animate-fade-in">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                <p className="mt-2">Chiusura automatica in corso...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Animation */}
      {showErrorAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full text-center animate-bounce border dark:border-gray-600">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500 dark:text-red-400 animate-pulse"
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
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Slot già prenotato! ⚠️
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Questo orario è già stato prenotato da qualcun altro. Seleziona un
              altro orario.
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
