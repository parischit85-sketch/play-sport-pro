// =============================================
// FILE: src/features/prenota/PrenotazioneCampi.jsx
// =============================================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@contexts/AuthContext.jsx";
import Section from "@ui/Section.jsx";
import Modal from "@ui/Modal.jsx";
import ZoomableGrid from "@ui/ZoomableGrid.jsx";
import { euro, euro2 } from "@lib/format.js";
import { sameDay, floorToSlot, addMinutes, overlaps } from "@lib/date.js";
import { computePrice, getRateInfo, isCourtBookableAt } from "@lib/pricing.js";
import { calculateLessonPrice } from "@services/bookings.js";
import { useUnifiedBookings } from "@hooks/useUnifiedBookings.js";
import { PLAYER_CATEGORIES } from "@features/players/types/playerTypes.js";

// Componente calendario personalizzato
function CalendarGrid({ currentDay, onSelectDay, T }) {
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(currentDay.getFullYear(), currentDay.getMonth(), 1),
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
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];

  const weekDays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

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
          className={`w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-xl font-bold transition-colors`}
        >
          ←
        </button>
        <h4 className={`text-xl font-bold ${T.text}`}>
          {monthNames[month]} {year}
        </h4>
        <button
          type="button"
          onClick={goToNextMonth}
          className={`w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-xl font-bold transition-colors`}
        >
          →
        </button>
      </div>

      {/* Giorni della settimana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className={`text-center text-sm font-semibold ${T.subtext} py-2`}
          >
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
                    ? "bg-blue-500 text-white shadow-lg dark:bg-emerald-500"
                    : isTodayDay
                      ? "bg-blue-100 text-blue-700 border-2 border-blue-300 dark:bg-emerald-100 dark:text-emerald-700 dark:border-emerald-300"
                      : isCurrentMonthDay
                        ? "hover:bg-gray-200 dark:hover:bg-gray-700 " + T.text
                        : "text-gray-400 dark:text-gray-600"
                }
                ${isPastDay ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
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

export default function PrenotazioneCampi({
  state,
  setState,
  players,
  playersById,
  T,
}) {
  const { user } = useAuth();

  // Use unified booking service
  const {
    bookings: allBookings,
    loading: bookingsLoading,
    refresh: refreshBookings,
    createBooking: createUnifiedBooking,
    updateBooking: updateUnifiedBooking,
    deleteBooking: deleteUnifiedBooking,
  } = useUnifiedBookings({
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

  const [day, setDay] = useState(() =>
    floorToSlot(new Date(), cfg.slotMinutes),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const courts = Array.isArray(state?.courts) ? state.courts : [];
  // Get instructors from players (instead of localStorage)
  const instructors = useMemo(() => {
    const availableInstructors = (state.players || []).filter(
      (player) =>
        player.category === PLAYER_CATEGORIES.INSTRUCTOR &&
        player.instructorData?.isInstructor,
    );
    return availableInstructors;
  }, [state.players]);

  // Convert unified bookings to local format
  const bookings = useMemo(() => {
    return (allBookings || [])
      .filter((b) => b.status === "confirmed")
      .map((b) => {
        try {
          const startIso = new Date(
            `${b.date}T${String(b.time).padStart(5, "0")}:00`,
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
            note: b.notes || "",
            notes: b.notes || "",
            bookedByName: b.bookedBy || "",
            addons: { lighting: !!b.lighting, heating: !!b.heating },
            status: "booked",
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
    const list = Array.isArray(cfg?.defaultDurations)
      ? cfg.defaultDurations
      : [];
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
    const [y, m, dd] = value.split("-").map(Number);
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
            parseInt(slot.from.split(":")[0]) * 60 +
            parseInt(slot.from.split(":")[1]);
          const toMinutes =
            parseInt(slot.to.split(":")[0]) * 60 +
            parseInt(slot.to.split(":")[1]);

          // Aggiunge tutti gli slot nell'intervallo
          for (
            let minutes = fromMinutes;
            minutes < toMinutes;
            minutes += cfg.slotMinutes
          ) {
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
    for (
      let t = new Date(dayStart);
      t < dayEnd;
      t = addMinutes(t, cfg.slotMinutes)
    ) {
      timeSlots.push(new Date(t));
    }
  }

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const dayLabel = `${cap(new Intl.DateTimeFormat("it-IT", { weekday: "long" }).format(day))} - ${String(
    day.getDate(),
  ).padStart(
    2,
    "0",
  )} ${new Intl.DateTimeFormat("it-IT", { month: "long" }).format(day)} ${day.getFullYear()}`;

  const dayBookings = useMemo(
    () =>
      (bookings || [])
        .filter((b) => b && b.status !== "cancelled")
        .filter((b) => sameDay(new Date(b.start), day))
        .sort((a, b) => new Date(a.start) - new Date(b.start)),
    [bookings, day],
  );

  const bookingsByCourt = useMemo(() => {
    const map = new Map(courts.map((c) => [c.id, []]));
    for (const b of dayBookings) {
      const arr = map.get(b.courtId) || [];
      arr.push(b);
      map.set(b.courtId, arr);
    }
    return map;
  }, [dayBookings, courts]);

  const dayRates = useMemo(() => {
    // Calcola rates considerando tutti i campi per ogni time slot
    return timeSlots.map((t) => {
      const courtRates = courts.map(
        (court) => getRateInfo(t, cfg, court.id, courts).rate,
      );
      // Ritorna il rate minimo, massimo o medio tra i campi
      return courtRates.length > 0 ? Math.min(...courtRates) : 0;
    });
  }, [timeSlots, cfg, courts]);
  const minRate = useMemo(() => Math.min(...dayRates), [dayRates]);
  const maxRate = useMemo(() => Math.max(...dayRates), [dayRates]);
  const greenAlphaForRate = (rate) => {
    if (!isFinite(minRate) || !isFinite(maxRate) || minRate === maxRate)
      return 0.18;
    const x = (rate - minRate) / (maxRate - minRate);
    return 0.12 + x * 0.22;
  };

  const playersAlpha = useMemo(
    () =>
      [...players].sort((a, b) =>
        (a.name || "").localeCompare(b.name, "it", { sensitivity: "base" }),
      ),
    [players],
  );
  const playersNameById = (id) => playersById?.[id]?.name || "";
  const findPlayerIdByName = (name) => {
    const n = (name || "").trim().toLowerCase();
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



  // Drag & Drop state (desktop only)
  const [draggedBooking, setDraggedBooking] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);

  // Update isDesktop on resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [form, setForm] = useState({
    courtId: "",
    start: null,
    duration: defaultDuration,
    p1Name: "",
    p2Name: "",
    p3Name: "",
    p4Name: "",
    note: "",
    bookedBy: "",
    useLighting: false,
    useHeating: false,
    color: "#e91e63", // Default color for bookings
    bookingType: "partita", // 'partita' or 'lezione'
    instructorId: "", // For lesson bookings
    participants: 1, // Numero partecipanti per le lezioni (1-4)
  });

  function openCreate(courtId, start) {
    const startRounded = floorToSlot(start, cfg.slotMinutes);
    setEditingId(null);
    setForm({
      courtId,
      start: startRounded,
      duration: defaultDuration,
      p1Name: "",
      p2Name: "",
      p3Name: "",
      p4Name: "",
      note: "",
      bookedBy: "",
      useLighting: false,
      useHeating: false,
      color: "#e91e63", // Default color for new bookings
      bookingType: "partita", // Default to 'partita'
      instructorId: "", // Empty by default
      participants: 1,
    });
    setModalOpen(true);
  }

  function openEdit(booking) {
    console.log("🔍 Opening edit for booking:", {
      id: booking.id,
      participants: booking.participants,
      price: booking.price,
      instructorId: booking.instructorId,
      hasParticipants: "participants" in booking,
    });
    setEditingId(booking.id);
    const start = new Date(booking.start);
    const namesFromIds = (booking.players || []).map(playersNameById);
    let playerNames =
      booking.playerNames && booking.playerNames.length
        ? booking.playerNames
        : namesFromIds;

    // Assicuriamoci che l'organizzatore sia incluso nell'elenco dei giocatori
    const organizerName = booking.bookedByName || "";
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
        if (
          booking.price === prices.priceMatchLesson ||
          booking.price === prices.priceFour
        ) {
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
      participantsCount =
        actualPlayerCount > 0 && actualPlayerCount <= 4 ? actualPlayerCount : 1;
    } else {
      // For regular matches, use all 4 slots or actual player count
      participantsCount = 4;
    }

    console.log(
      "💡 Inferred participants:",
      participantsCount,
      "from price:",
      booking.price,
      "instructor:",
      booking.instructorId,
    );

    setForm({
      courtId: booking.courtId,
      start,
      duration: booking.duration,
      p1Name: playerNames[0] || "",
      p2Name: playerNames[1] || "",
      p3Name: playerNames[2] || "",
      p4Name: playerNames[3] || "",
      note: booking.note || "",
      bookedBy: organizerName,
      useLighting: !!booking.addons?.lighting,
      useHeating: !!booking.addons?.heating,
      color: booking.color || "#e91e63", // Use existing color or default
      bookingType: booking.instructorId ? "lezione" : "partita", // Detect if it's a lesson
      instructorId: booking.instructorId || "", // Use existing instructor or empty
      participants: participantsCount,
    });
    setModalOpen(true);
  }

  function existingOverlap(courtId, start, duration, ignoreId = null) {
    const blockStart = new Date(start);
    const blockEnd = addMinutes(start, duration);
    const list = bookingsByCourt.get(courtId) || [];

    console.log("🔍 Checking overlap for:", {
      courtId,
      blockStart: blockStart.toISOString(),
      blockEnd: blockEnd.toISOString(),
      duration,
      ignoreId,
      existingBookings: list.length,
    });

    const conflict = list.find((b) => {
      if (ignoreId && b.id === ignoreId) {
        console.log("⏭️ Ignoring booking:", b.id);
        return false;
      }

      const bStart = new Date(b.start);
      const bEnd = addMinutes(new Date(b.start), b.duration);
      const hasOverlap = overlaps(blockStart, blockEnd, bStart, bEnd);

      if (hasOverlap) {
        console.log("🚫 Overlap detected with booking:", {
          bookingId: b.id,
          bookingStart: bStart.toISOString(),
          bookingEnd: bEnd.toISOString(),
          bookingDuration: b.duration,
        });
      }

      return hasOverlap;
    });

    return conflict;
  }

  const prevP1Ref = useRef("");
  useEffect(() => {
    const p1 = form.p1Name?.trim() || "";
    const prev = prevP1Ref.current;
    if ((!form.bookedBy?.trim() || form.bookedBy?.trim() === prev) && p1) {
      setForm((f) => ({ ...f, bookedBy: p1 }));
    }
    prevP1Ref.current = p1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.p1Name]);

  // Handle color change when booking type or instructor changes
  useEffect(() => {
    if (
      form.bookingType === "lezione" &&
      form.instructorId &&
      instructors.length > 0
    ) {
      const selectedInstructor = instructors.find(
        (inst) => inst.id === form.instructorId,
      );
      if (selectedInstructor?.instructorData?.color) {
        setForm((f) => ({
          ...f,
          color: selectedInstructor.instructorData.color,
        }));
      }
    } else if (form.bookingType === "partita") {
      setForm((f) => ({ ...f, color: "#e91e63" })); // Default pink color for matches
    }
  }, [form.bookingType, form.instructorId, instructors]);

  async function saveBooking() {
    if (!form.courtId || !form.start) {
      alert("Seleziona campo e orario.");
      return;
    }

    // Validate instructor selection for lessons
    if (form.bookingType === "lezione" && !form.instructorId) {
      alert("Seleziona un maestro per le lezioni.");
      return;
    }

    const start = floorToSlot(form.start, cfg.slotMinutes);
    // Verifica fascia per-campo: gli slot fuori fascia non sono prenotabili anche in admin
    if (!isCourtBookableAt(start, form.courtId, courts)) {
      alert("Orario fuori dalle fasce prenotabili per questo campo.");
      return;
    }
    const now = new Date();
    if (start < now) {
      alert("Non puoi prenotare nel passato.");
      return;
    }
    const ignoreId = editingId || null;
    if (existingOverlap(form.courtId, start, form.duration, ignoreId)) {
      alert("Esiste già una prenotazione che si sovrappone su questo campo.");
      return;
    }

    const pNames = [form.p1Name, form.p2Name, form.p3Name, form.p4Name]
      .map((s) => (s || "").trim())
      .filter(Boolean);
    const bookedByName =
      (form.bookedBy && form.bookedBy.trim()) || pNames[0] || "";

    // Calcolo prezzo dinamico: lezioni vs partite
    let price;
    if (form.bookingType === "lezione") {
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
        courts,
      );
    }

    // Mappa per API cloud (date/time locali HH:MM)
    const yyyy = String(start.getFullYear()).padStart(4, "0");
    const mm = String(start.getMonth() + 1).padStart(2, "0");
    const dd = String(start.getDate()).padStart(2, "0");
    const hh = String(start.getHours()).padStart(2, "0");
    const mi = String(start.getMinutes()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const timeStr = `${hh}:${mi}`;
    const courtNameFull =
      courts.find((c) => c.id === form.courtId)?.name || form.courtId;

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
          notes: form.note?.trim() || "",
          type: "court",
          color: form.color, // Add custom color
          isLessonBooking: form.bookingType === "lezione",
          participants:
            form.bookingType === "lezione"
              ? form.participants || pNames.length || 1
              : pNames.length,
          ...(form.bookingType === "lezione" && form.instructorId
            ? {
                instructorId: form.instructorId,
                instructorName:
                  instructors.find((inst) => inst.id === form.instructorId)
                    ?.name || "",
                lessonType: "individual",
              }
            : {}),
        };

        const created = await createUnifiedBooking(bookingData);

        // If admin specified a different name, update the bookedBy field
        if (bookedByName) {
          await updateUnifiedBooking(created.id, { bookedBy: bookedByName });
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
          notes: form.note?.trim() || "",
          color: form.color, // Add custom color
          isLessonBooking: form.bookingType === "lezione",
          participants:
            form.bookingType === "lezione"
              ? form.participants || pNames.length || 1
              : pNames.length,
          ...(bookedByName ? { bookedBy: bookedByName } : {}),
          ...(form.bookingType === "lezione" && form.instructorId
            ? {
                instructorId: form.instructorId,
                instructorName:
                  instructors.find((inst) => inst.id === form.instructorId)
                    ?.name || "",
                lessonType: "individual",
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
      alert("Errore nel salvataggio della prenotazione.");
    }
  }

  async function cancelBooking(id) {
    if (!confirm("Cancellare la prenotazione?")) return;
    try {
      await updateUnifiedBooking(id, {
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
      });
    } catch (e) {
      alert("Errore durante la cancellazione.");
    }
  }

  async function hardDeleteBooking(id) {
    if (!confirm("Eliminare definitivamente la prenotazione?")) return;
    try {
      await deleteUnifiedBooking(id);
      setModalOpen(false);
    } catch (e) {
      alert("Errore durante l'eliminazione.");
    }
  }

  const courtName = (id) => courts.find((c) => c.id === id)?.name || id;
  const initials = (name) =>
    (name || "")
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .join("")
      .slice(0, 3)
      .toUpperCase();

  // =============================================
  // DRAG & DROP FUNCTIONS (Desktop Only)
  // =============================================

  const handleDragStart = (e, booking) => {
    if (!isDesktop) return;
    setDraggedBooking(booking);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", booking.id);

    // Add visual feedback
    e.target.style.opacity = "0.6";
  };

  const handleDragEnd = (e) => {
    if (!isDesktop) return;
    setDraggedBooking(null);
    setDragOverSlot(null);
    e.target.style.opacity = "1";
  };

  const handleDragOver = (e, courtId, time) => {
    if (!isDesktop || !draggedBooking) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

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

    console.log("🎯 DROP EVENT:", {
      courtId: courtId,
      slotTime: time.toISOString(),
      draggedBookingId: draggedBooking.id,
      draggedBookingDuration: draggedBooking.duration,
    });

    try {
      // Check if the target slot is available and on the same day
      const draggedDate = new Date(draggedBooking.start).toDateString();
      const targetDate = time.toDateString();

      if (draggedDate !== targetDate) {
        alert(
          "Puoi spostare le prenotazioni solo all'interno dello stesso giorno.",
        );
        return;
      }

      // Calculate target time slot properly
      const targetTime = floorToSlot(time, cfg.slotMinutes);
      const targetEnd = addMinutes(targetTime, draggedBooking.duration);

      console.log("🎯 Drop validation:", {
        targetTime: targetTime.toISOString(),
        targetEnd: targetEnd.toISOString(),
        duration: draggedBooking.duration,
      });

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
          alert(
            "Uno o più slot di destinazione sono fuori dalle fasce prenotabili per questo campo.",
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
        console.log(
          "🚫 Conflict detected with booking:",
          conflictingBooking.id,
        );
        alert(
          "Lo slot di destinazione è già occupato da un'altra prenotazione.",
        );
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
          console.log("🚫 Slot conflict detected at:", slotTime.toISOString());
          alert(
            "Lo slot di destinazione è già occupato da un'altra prenotazione.",
          );
          return;
        }
      }

      console.log("✅ Drop validation passed, updating booking...");

      // Calculate proper date/time strings for cloud format
      const localDate = new Date(
        targetTime.getTime() - targetTime.getTimezoneOffset() * 60000,
      );
      const dateStr = localDate.toISOString().split("T")[0]; // YYYY-MM-DD
      const timeStr = localDate.toISOString().split("T")[1].substring(0, 5); // HH:MM

      console.log("🔄 Updating booking with:", {
        bookingId: draggedBooking.id,
        newCourtId: courtId,
        newDateStr: dateStr,
        newTimeStr: timeStr,
        targetTimeLocal: targetTime.toLocaleString("it-IT"),
      });

      // Update the booking - use only cloud format (date/time), not legacy start
      await updateUnifiedBooking(draggedBooking.id, {
        courtId: courtId,
        courtName: courtName(courtId),
        date: dateStr,
        time: timeStr,
        updatedAt: new Date().toISOString(),
      });

      console.log("✅ Booking moved successfully");

      // Force refresh of bookings to ensure UI is updated
      if (refreshBookings) {
        setTimeout(() => {
          console.log("🔄 Refreshing bookings after drag & drop...");
          refreshBookings();
        }, 500);
      }
    } catch (error) {
      console.error("❌ Error moving booking:", error);
      alert("Errore durante lo spostamento della prenotazione.");
    }

    setDraggedBooking(null);
  };

  const SLOT_H = 52; // px

  function renderCell(courtId, t) {
    const list = bookingsByCourt.get(courtId) || [];
    const hit = list.find((b) => {
      const bStart = new Date(b.start);
      const bEnd = addMinutes(new Date(b.start), b.duration);
      return overlaps(bStart, bEnd, t, addMinutes(t, cfg.slotMinutes));
    });

    // --- SLOT FUORI FASCIA (non prenotabile) ---
    const inSchedule = isCourtBookableAt(t, courtId, courts);
    if (!hit && !inSchedule) {
      const startLabel = t.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return (
        <div
          className="relative w-full h-9 rounded-lg ring-1 text-[11px] font-medium bg-gray-200 dark:bg-gray-800 opacity-50 cursor-not-allowed border-dashed border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center"
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
      const isDiscounted = info.source === "discounted" || info.isPromo;
      const startLabel = t.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
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
          onClick={() => openCreate(courtId, t)}
          className={`relative w-full h-9 rounded-lg ring-1 text-[11px] font-medium transition-all duration-200 ${
            isDragTarget
              ? "ring-2 ring-blue-500 ring-offset-1 scale-105"
              : isDragIncompatible
                ? "ring-2 ring-red-300 ring-offset-1 opacity-75"
                : ""
          }`}
          style={{
            background: isDragTarget
              ? "rgba(59, 130, 246, 0.2)"
              : isDragIncompatible
                ? "rgba(239, 68, 68, 0.1)"
                : `rgba(16,185,129,${alpha})`,
            borderColor: isDragTarget
              ? "rgba(59, 130, 246, 0.6)"
              : isDragIncompatible
                ? "rgba(239, 68, 68, 0.3)"
                : `rgba(16,185,129,0.35)`,
          }}
          title={
            isDragTarget
              ? "Rilascia qui per spostare la prenotazione"
              : isDragIncompatible
                ? "Disponibile per nuove prenotazioni (non compatibile con lo spostamento)"
                : info.isPromo
                  ? "Fascia Promo"
                  : isDiscounted
                    ? "Fascia scontata"
                    : "Tariffa standard"
          }
          // Drag & Drop props (desktop only)
          onDragOver={
            isDesktop ? (e) => handleDragOver(e, courtId, t) : undefined
          }
          onDragLeave={isDesktop ? handleDragLeave : undefined}
          onDrop={isDesktop ? (e) => handleDrop(e, courtId, t) : undefined}
        >
          {isDiscounted && (
            <span
              className="absolute top-0.5 right-0.5 px-1.5 py-[1px] rounded-full text-[10px] leading-none"
              style={{
                background: "rgba(16,185,129,0.9)",
                color: "#0b0b0b",
                border: "1px solid rgba(16,185,129,0.6)",
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
        : (hit.players || []).map((pid) => playersById?.[pid]?.name || "—")
    )
      .concat(hit.guestNames || [])
      .slice(0, 4);

    // Icone semplici emoji senza sfondo
    const lampIcon = <span className="text-2xl">💡</span>;
    const fireIcon = <span className="text-2xl">🔥</span>;

    // Determine booking color - priority: custom color > instructor color > default
    let slotBgColor = "rgba(220, 38, 127, 0.35)"; // Default booking color
    let slotBorderColor = "rgba(220, 38, 127, 0.6)";

    // Check if this is a lesson booking (expanded detection)
    const isLessonBooking =
      hit.isLessonBooking ||
      (hit.notes && hit.notes.includes("Lezione con")) ||
      hit.instructorId ||
      hit.instructorName;

    // First check if booking has custom color
    if (hit.color) {
      const hex = hit.color.replace("#", "");
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
        const hex = instructor.instructorData.color.replace("#", "");
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
          onClick={() => openEdit(hit)}
          className={`absolute left-0 right-0 px-2 py-2 ring-1 text-left text-[13px] font-semibold flex flex-col justify-center transition-all duration-200 ${
            isDesktop ? "cursor-grab hover:shadow-lg" : ""
          }`}
          style={{
            top: 0,
            height: `${totalHeight}px`,
            background: slotBgColor,
            borderColor: slotBorderColor,
            borderRadius: "8px",
            overflow: "hidden",
          }}
          title={`${courtName(hit.courtId)} — ${start.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })} (${hit.duration}′) • ${isDesktop ? "Trascina per spostare o clicca per modificare" : "Clicca per modificare"}`}
          // Drag & Drop props (desktop only)
          draggable={isDesktop}
          onDragStart={isDesktop ? (e) => handleDragStart(e, hit) : undefined}
          onDragEnd={isDesktop ? handleDragEnd : undefined}
          onMouseDown={
            isDesktop ? (e) => (e.target.style.cursor = "grabbing") : undefined
          }
          onMouseUp={
            isDesktop ? (e) => (e.target.style.cursor = "grab") : undefined
          }
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
              let instructorName = "";

              if (hit.instructorId) {
                instructor = instructors.find((i) => i.id === hit.instructorId);
              } else {
                // Extract instructor name from notes like "Lezione con Marco Rossi"
                const match = hit.notes.match(/Lezione con (.+)/);
                if (match) {
                  const instructorName = match[1];
                  instructor = instructors.find(
                    (i) => i.name === instructorName,
                  );
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
                    title={`Lezione${instructor?.name ? ` con ${instructor.name}` : ""}`}
                  >
                    🎾
                    {instructorName && (
                      <span className="text-[11px] font-bold uppercase">
                        {instructorName}
                      </span>
                    )}
                  </span>
                </div>
              );
            })()}
          <div className="flex items-center justify-between gap-2 mb-1 mt-2">
            <div className="min-w-0 flex flex-col">
              <span className="font-bold text-[15px] leading-tight">
                {start.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {end.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                • {euro(hit.price)}
              </span>
              <span className="flex items-center gap-2 mt-1">
                <div className="text-[10px] font-medium opacity-80 flex flex-wrap gap-1">
                  {labelPlayers.map((name, i) => (
                    <span
                      key={i}
                      className="bg-white/20 dark:bg-gray-800/40 px-1 py-0.5 rounded text-[9px] font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </span>
            </div>
          </div>
          <div className="text-[12px] opacity-80 truncate">
            Prenotato da:{" "}
            <span className="font-semibold">
              {hit.bookedByName || labelPlayers[0] || "—"}
            </span>
          </div>
          {isLessonBooking && hit.participants && hit.participants > 1 && (
            <div className="text-[11px] opacity-75 mt-1">
              👥 {hit.participants} partecipanti
            </div>
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
          {hit.note && (
            <div className="text-[11px] opacity-70 mt-1 truncate">
              {hit.note}
            </div>
          )}

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
    if (form.bookingType === "lezione") {
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
      courts,
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
    if (form.bookingType === "lezione") {
      // Prezzo totale già definito dall'istruttore: dividiamo solo per partecipanti per display
      const participants = Math.max(1, Math.min(4, form.participants || 1));
      return previewPrice / participants;
    }
    // Partita normale: assumiamo suddivisione su 4 giocatori
    return previewPrice / 4;
  }, [previewPrice, form.bookingType, form.participants]);

  return (
    <Section title="Gestione Campi" T={T}>
      {/* Drag & Drop Info Banner (Desktop Only) */}
      {isDesktop && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <span className="text-lg">🖱️</span>
            <span className="font-medium">Drag & Drop attivo:</span>
            <span>
              Trascina le prenotazioni per spostarle su slot liberi dello stesso
              giorno
            </span>
          </div>
        </div>
      )}

      {/* Show loading state if state is null */}
      {!state ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
              Caricamento...
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Caricamento configurazione campi in corso...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Header moderno con navigazione integrata */}
          <div
            className={`flex flex-col items-center gap-6 mb-6 ${T.cardBg} ${T.border} p-6 rounded-xl shadow-lg`}
          >
            {/* Navigazione date centrata con frecce grandi */}
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                className={`w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-2xl font-bold shadow-lg hover:scale-110 transition-all duration-200 flex items-center justify-center`}
                onClick={() => goOffset(-1)}
                title="Giorno precedente"
              >
                ←
              </button>

              <button
                type="button"
                onClick={() => setShowDatePicker(true)}
                className={`text-3xl font-bold cursor-pointer hover:scale-105 transition-transform bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-lime-400 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800`}
                title="Clicca per aprire calendario"
              >
                {dayLabel}
              </button>

              <button
                type="button"
                className={`w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-2xl font-bold shadow-lg hover:scale-110 transition-all duration-200 flex items-center justify-center`}
                onClick={() => goOffset(1)}
                title="Giorno successivo"
              >
                →
              </button>
            </div>
          </div>

          {/* Calendario popup con griglia giorni */}
          {showDatePicker && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div
                className={`${T.cardBg} ${T.border} rounded-2xl shadow-2xl p-8 max-w-2xl w-full`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className={`text-2xl font-bold ${T.text} flex items-center gap-2`}
                  >
                    📅 Seleziona data
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(false)}
                    className={`w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-2xl font-bold transition-colors`}
                    title="Chiudi"
                  >
                    ✕
                  </button>
                </div>

                {/* Calendario visuale */}
                <CalendarGrid
                  currentDay={day}
                  onSelectDay={(selectedDay) => {
                    setDay(selectedDay);
                    setShowDatePicker(false);
                  }}
                  T={T}
                />

                {/* Pulsanti rapidi */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      goToday();
                      setShowDatePicker(false);
                    }}
                    className={`${T.btnPrimary} py-3 text-sm font-semibold flex items-center justify-center gap-2`}
                  >
                    🏠 Oggi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      goOffset(-1);
                      setShowDatePicker(false);
                    }}
                    className={`${T.btnGhost} py-3 text-sm font-medium`}
                  >
                    ← Ieri
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      goOffset(1);
                      setShowDatePicker(false);
                    }}
                    className={`${T.btnGhost} py-3 text-sm font-medium`}
                  >
                    Domani →
                  </button>
                </div>
              </div>
            </div>
          )}





          {/* Griglia principale - sempre visibile anche su mobile con zoom */}
          <ZoomableGrid T={T} className="pb-4">
            <div
              className="min-w-[720px] grid gap-2"
              style={{ gridTemplateColumns: `repeat(${courts.length}, 1fr)` }}
            >
              {/* Header campi */}
              {courts.map((c) => (
                <div
                  key={`hdr_${c.id}`}
                  className={`px-2 py-3 text-base font-bold text-center rounded-xl shadow-md mb-2 ${T.cardBg} ${T.border}`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-full bg-blue-400 dark:bg-emerald-400 text-white flex items-center justify-center font-bold shadow`}
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
                        <span className="text-xs text-orange-500 dark:text-orange-400 font-medium">
                          🔥 Riscaldato
                        </span>
                      )}
                    </div>
                  </span>
                </div>
              ))}

              {/* Celle prenotazione */}
              {timeSlots.map((t, r) => (
                <React.Fragment key={t.getTime()}>
                  {courts.map((c) => (
                    <div
                      key={c.id + "_" + r}
                      className={`px-0.5 py-0.5 ${T.cardBg} ${T.border} rounded-lg`}
                    >
                      {renderCell(c.id, t)}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </ZoomableGrid>

          {/* Modal glassmorphism per prenotazione - FUTURISTIC DESIGN */}
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editingId ? "Modifica prenotazione" : "Nuova prenotazione"}
            T={T}
            size="xl"
          >
            {!form.start ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-3xl text-white">📅</span>
                </div>
                <div className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                  Seleziona uno slot
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Clicca su uno slot libero nella griglia per iniziare
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-4 shadow-2xl">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Prima riga: Tipo prenotazione - Maestro - Numero partecipanti */}
                    <div className="sm:col-span-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Tipo prenotazione */}
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            🎯 Tipo prenotazione
                          </label>
                          <select
                            value={form.bookingType}
                            onChange={(e) => {
                              const newType = e.target.value;
                              setForm((f) => ({
                                ...f,
                                bookingType: newType,
                                instructorId:
                                  newType === "partita" ? "" : f.instructorId,
                                participants:
                                  newType === "lezione"
                                    ? f.participants || 1
                                    : f.participants,
                              }));
                            }}
                            className="px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium dark-select"
                          >
                            <option value="partita">🏓 Partita</option>
                            <option value="lezione">👨‍🏫 Lezione</option>
                          </select>
                        </div>

                        {/* Maestro */}
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            👨‍🏫 Maestro
                          </label>
                          <select
                            value={form.instructorId}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                instructorId: e.target.value,
                              }))
                            }
                            className="px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium disabled:opacity-50 dark-select"
                            required={form.bookingType === "lezione"}
                            disabled={form.bookingType !== "lezione"}
                          >
                            <option value="">
                              {form.bookingType === "lezione" 
                                ? "-- Seleziona un maestro --"
                                : "-- Non necessario per partite --"}
                            </option>
                            {instructors.map((instructor) => (
                              <option key={instructor.id} value={instructor.id}>
                                {instructor.name}
                                {instructor.instructorData?.specialties?.length >
                                  0 &&
                                  ` (${instructor.instructorData.specialties.join(", ")})`}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Numero partecipanti */}
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            👥 Partecipanti
                          </label>
                          <select
                            value={form.participants}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setForm((f) => ({
                                ...f,
                                participants: val,
                                // Se si riduce il numero partecipanti, svuota campi giocatori eccedenti
                                p3Name: val < 3 ? "" : f.p3Name,
                                p4Name: val < 4 ? "" : f.p4Name,
                              }));
                            }}
                            className="px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium disabled:opacity-50 dark-select"
                            disabled={form.bookingType !== "lezione"}
                          >
                            {[1, 2, 3, 4].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {form.bookingType === "lezione" 
                              ? "Il prezzo della lezione si adatta automaticamente al numero di partecipanti."
                              : "Non necessario per le partite"}
                          </div>
                        </div>
                      </div>

                      {/* Messaggio di errore per maestro mancante */}
                      {form.bookingType === "lezione" && !form.instructorId && (
                        <div className="sm:col-span-2">
                          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-red-200/50 dark:border-red-800/30">
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
                          <label className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            🏟️ Campo
                          </label>
                          <select
                            value={form.courtId}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, courtId: e.target.value }))
                            }
                            className="px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium dark-select"
                          >
                            {state.courts.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          {form.courtId &&
                            hasPromoSlot(form.courtId, form.start) && (
                              <div className="text-xs bg-gradient-to-r from-yellow-400/80 to-orange-400/80 text-yellow-900 dark:text-yellow-100 px-2 py-1 rounded-lg font-semibold inline-flex items-center gap-1 w-fit backdrop-blur-sm border border-yellow-300/50 mt-1">
                                🏷️ Promo
                              </div>
                            )}
                        </div>

                        {/* Inizio */}
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            ⏰ Inizio
                          </label>
                          <input
                            type="time"
                            value={`${String(new Date(form.start).getHours()).padStart(2, "0")}:${String(new Date(form.start).getMinutes()).padStart(2, "0")}`}
                            onChange={(e) => {
                              const [hh, mm] = e.target.value
                                .split(":")
                                .map(Number);
                              const d = new Date(form.start);
                              d.setHours(hh, mm, 0, 0);
                              setForm((f) => ({
                                ...f,
                                start: floorToSlot(d, cfg.slotMinutes),
                              }));
                            }}
                            className="px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium"
                          />
                        </div>

                        {/* Durata */}
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            ⏱️ Durata
                          </label>
                          <select
                            value={form.duration}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                duration: Number(e.target.value),
                              }))
                            }
                            className="px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium dark-select"
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
                      <div className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                        👥 Giocatori
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          ["p1Name", "Giocatore 1", 1],
                          ["p2Name", "Giocatore 2", 2],
                          ["p3Name", "Giocatore 3", 3],
                          ["p4Name", "Giocatore 4", 4],
                        ]
                          .filter(([_, __, idx]) =>
                            form.bookingType === "lezione"
                              ? idx <=
                                Math.max(1, Math.min(4, form.participants || 1))
                              : true,
                          )
                          .map(([key, label]) => (
                            <div key={key}>
                              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block">
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
                                className="w-full px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200"
                                placeholder="Nome giocatore"
                              />
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="sm:col-span-1">
                      {/* Addon in layout futuristico - compatto */}
                      <div className="bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm rounded-lg p-2 border border-white/20 dark:border-gray-600/20">
                        <div className="flex items-center gap-1 mb-1">
                          <h3 className="text-xs font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            ⚡ Servizi
                          </h3>
                        </div>
                        <div className="flex flex-col gap-2">
                          {cfg.addons?.lightingEnabled && (
                            <label className="inline-flex items-center gap-2 cursor-pointer bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-100/50 dark:hover:bg-blue-800/30 transition-all duration-200">
                              <input
                                type="checkbox"
                                checked={form.useLighting}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    useLighting: e.target.checked,
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-white/50 dark:bg-gray-700/50 border-blue-300 dark:border-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                  💡 Illuminazione
                                </span>
                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                  +{euro(cfg.addons.lightingFee || 0)}
                                </span>
                              </div>
                            </label>
                          )}
                          {cfg.addons?.heatingEnabled &&
                            (() => {
                              const selectedCourt = courts.find(
                                (c) => c.id === form.courtId,
                              );
                              return (
                                selectedCourt?.hasHeating && (
                                  <label className="inline-flex items-center gap-2 cursor-pointer bg-purple-50/50 dark:bg-purple-900/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-purple-200/50 dark:border-purple-800/30 hover:bg-purple-100/50 dark:hover:bg-purple-800/30 transition-all duration-200">
                                    <input
                                      type="checkbox"
                                      checked={form.useHeating}
                                      onChange={(e) =>
                                        setForm((f) => ({
                                          ...f,
                                          useHeating: e.target.checked,
                                        }))
                                      }
                                      className="w-4 h-4 text-purple-600 bg-white/50 dark:bg-gray-700/50 border-purple-300 dark:border-purple-600 rounded focus:ring-purple-500 focus:ring-2"
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                                        🔥 Riscaldamento
                                      </span>
                                      <span className="text-xs text-purple-600 dark:text-purple-400">
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
                                Totale:{" "}
                                {previewPrice == null
                                  ? "—"
                                  : euro(previewPrice)}
                              </div>
                              {previewPrice != null && perPlayer != null && (
                                <div className="text-sm text-blue-100 mt-1 font-semibold">
                                  {form.bookingType === "lezione"
                                    ? `/ partecipante: ${euro2(perPlayer)}`
                                    : `/ giocatore: ${euro2(perPlayer)}`}
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
                        <label className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1 block">
                          📝 Prenotazione a nome di
                        </label>
                        <input
                          value={form.bookedBy}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, bookedBy: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200"
                          placeholder="Es. Andrea Paris"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1 block">
                          💬 Note
                        </label>
                        <input
                          value={form.note}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, note: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200"
                          placeholder="Es. Lezioni, torneo, ecc."
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1 block">
                          🎨 Colore
                          {form.bookingType === "lezione" &&
                            form.instructorId && (
                              <span className="ml-1 text-xs text-blue-600 dark:text-blue-400 font-normal">
                                (maestro)
                              </span>
                            )}
                          {form.bookingType === "partita" && (
                            <span className="ml-1 text-xs text-pink-600 dark:text-pink-400 font-normal">
                              (partita)
                            </span>
                          )}
                        </label>
                        <div className="bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm rounded-lg p-2 border border-white/20 dark:border-gray-600/20">
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
                              className="w-8 h-8 rounded-lg border border-white/30 dark:border-gray-600/30 cursor-pointer"
                              title="Seleziona colore personalizzato"
                            />
                            <div
                              className="flex-1 h-8 rounded-lg border flex items-center justify-center text-xs font-medium"
                              style={{
                                backgroundColor: form.color + "40",
                                borderColor: form.color + "80",
                                color: form.color,
                              }}
                            >
                              Anteprima
                            </div>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {[
                              { color: "#e91e63", name: "Rosa" },
                              { color: "#f44336", name: "Rosso" },
                              { color: "#00bcd4", name: "Turchese" },
                              { color: "#2196f3", name: "Blu" },
                              { color: "#4caf50", name: "Verde" },
                              { color: "#ff9800", name: "Arancione" },
                              { color: "#9c27b0", name: "Viola" },
                              { color: "#607d8b", name: "Grigio" },
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
                                    ? "ring-2 ring-gray-800 dark:ring-white scale-110"
                                    : "border border-white/50 dark:border-gray-600/50"
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
                        {editingId
                          ? "✓ Aggiorna prenotazione"
                          : "✓ Conferma prenotazione"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="px-6 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all duration-200"
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
                  <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-t border-white/20 dark:border-gray-700/30 p-4 z-50 shadow-2xl">
                    <div className="flex gap-3 max-w-md mx-auto">
                      <button
                        type="button"
                        onClick={saveBooking}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 rounded-xl shadow-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                      >
                        {editingId ? "✓ Aggiorna" : "✓ Conferma"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="flex-1 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-700 dark:text-gray-300 font-semibold py-4 rounded-xl border border-white/30 dark:border-gray-600/30 hover:bg-white/90 dark:hover:bg-gray-600/90 transition-all duration-200"
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
              <div className="fixed bottom-24 left-4 right-4 z-[99999] flex gap-3 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30">
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
