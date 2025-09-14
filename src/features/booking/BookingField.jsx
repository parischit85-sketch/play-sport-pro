import React, { useState, useEffect, useMemo, useCallback } from "react";
import Section from "@ui/Section.jsx";
import Badge from "@ui/Badge.jsx";
import { createDSClasses } from "@lib/design-system.js";
import { floorToSlot, addMinutes, sameDay, overlaps } from "@lib/date.js";
import { computePrice } from "@lib/pricing.js";
import {
  useUnifiedBookings,
  useUserBookings,
} from "@hooks/useUnifiedBookings.js";
import {
  wouldCreateHalfHourHole,
  isDurationBookable,
  isSlotAvailable as baseIsSlotAvailable,
} from "@services/unified-booking-service.js";

function BookingField({ user, T, state, setState }) {
  console.log(
    `🚀 [BOOKING FIELD] Component loaded - user: ${user?.displayName || "not logged in"}`,
  );
  console.log(
    `🎯 [BOOKING FIELD] Hole prevention rules are ACTIVE for user bookings`,
  );

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

  // Log when bookings change
  useEffect(() => {
    console.log(
      `📊 [BOOKING FIELD] All bookings updated: ${allBookings.length} total`,
    );
    console.log(
      `📋 [BOOKING FIELD] All bookings (including lessons):`,
      allBookings,
    );
    const courtOnly = allBookings.filter((b) => !b.isLessonBooking);
    const lessonOnly = allBookings.filter((b) => b.isLessonBooking);
    console.log(
      `🏟️ [BOOKING FIELD] Court bookings: ${courtOnly.length}, Lesson bookings: ${lessonOnly.length}`,
    );
  }, [allBookings]);

  const { userBookings, activeUserBookings } = useUserBookings();

  const cfg = state?.bookingConfig || {
    slotMinutes: 30,
    dayStartHour: 8,
    dayEndHour: 23,
    defaultDurations: [60, 90, 120],
    addons: {},
  };
  const courts = Array.isArray(state?.courts) ? state.courts : [];

  // UI State
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [duration, setDuration] = useState(() =>
    cfg.defaultDurations?.includes(90) ? 90 : cfg.defaultDurations?.[0] || 60,
  );
  const [lighting, setLighting] = useState(false);
  const [heating, setHeating] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [additionalPlayers, setAdditionalPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [expandedBookings, setExpandedBookings] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [showPastBookings, setShowPastBookings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Helper function to check slot availability with hole prevention
  const isSlotAvailable = useCallback(
    (date, time, courtId, checkDuration = 60) => {
      if (!date || !time || !courtId) return false;

      console.log(
        `🏟️ [BOOKING FIELD] Checking slot availability: ${courtId} on ${date} at ${time} for ${checkDuration}min`,
      );

      // Convert ALL bookings (court + lesson) to the format expected by unified service
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

      console.log(
        `📊 [BOOKING FIELD] Total allBookings: ${allBookings.length}, converted: ${existingBookings.length}`,
      );
      console.log(
        `📋 [BOOKING FIELD] Existing bookings (including lessons):`,
        existingBookings,
      );

      // Use unified service with hole prevention enabled for user bookings
      const result = isDurationBookable(
        courtId,
        date,
        time,
        checkDuration,
        existingBookings,
        true,
      );
      console.log(
        `🎯 [BOOKING FIELD] Slot ${courtId} ${date} ${time} (${checkDuration}min) → ${result ? "✅ AVAILABLE" : "❌ BLOCKED"}`,
      );

      return result;
    },
    [allBookings],
  );

  // Helper function to check if a duration is bookable (checks hole prevention)
  const isDurationAvailable = useCallback(
    (dur) => {
      if (!selectedDate || !selectedTime || !selectedCourt) {
        console.log(
          `⏳ [DURATION CHECK] Skipping duration check for ${dur}min - missing selection`,
        );
        return true;
      }

      console.log(
        `🕐 [DURATION CHECK] Checking duration ${dur}min for ${selectedCourt.id} on ${selectedDate} at ${selectedTime}`,
      );

      // Convert ALL bookings (court + lesson) to the format expected by unified service
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

      // Use unified service with hole prevention enabled for user bookings
      const result = isDurationBookable(
        selectedCourt.id,
        selectedDate,
        selectedTime,
        dur,
        existingBookings,
        true,
      );
      console.log(
        `🎯 [DURATION CHECK] Duration ${dur}min → ${result ? "✅ AVAILABLE" : "❌ BLOCKED"}`,
      );

      return result;
    },
    [selectedDate, selectedTime, selectedCourt, allBookings],
  );

  // Auto-adjust duration if current selection becomes unavailable
  useEffect(() => {
    if (selectedDate && selectedTime && selectedCourt) {
      console.log(
        `🎯 [BOOKING FIELD] Selection changed - Date: ${selectedDate}, Time: ${selectedTime}, Court: ${selectedCourt.id}, Duration: ${duration}min`,
      );

      const isCurrentDurationAvailable = isDurationAvailable(duration);
      if (!isCurrentDurationAvailable) {
        console.log(
          `⚠️ [BOOKING FIELD] Current duration ${duration}min is not available, searching for alternatives...`,
        );

        // Find first available duration
        const availableDurations = (
          cfg.defaultDurations || [60, 90, 120]
        ).filter(isDurationAvailable);
        console.log(
          `🔍 [BOOKING FIELD] Available durations: [${availableDurations.join(", ")}]`,
        );

        if (availableDurations.length > 0) {
          console.log(
            `✅ [BOOKING FIELD] Auto-selecting duration: ${availableDurations[0]}min`,
          );
          setDuration(availableDurations[0]);
        } else {
          console.log(`❌ [BOOKING FIELD] No available durations found!`);
        }
      } else {
        console.log(
          `✅ [BOOKING FIELD] Current duration ${duration}min is available`,
        );
      }
    }
  }, [
    selectedDate,
    selectedTime,
    selectedCourt,
    duration,
    isDurationAvailable,
    cfg.defaultDurations,
  ]);

  // Auto-select today's date
  useEffect(() => {
    if (!selectedDate) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      setSelectedDate(`${year}-${month}-${day}`);
    }
  }, [selectedDate]);

  // Generate available time slots
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || !selectedCourt) return [];

    const slots = [];
    const startHour = cfg.dayStartHour || 8;
    const endHour = cfg.dayEndHour || 23;
    const slotMinutes = cfg.slotMinutes || 30;
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotMinutes) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

        // Skip past times if booking for today
        if (selectedDate === today) {
          const slotDateTime = new Date(`${selectedDate}T${timeString}:00`);
          if (slotDateTime <= now) continue;
        }

        const available = isSlotAvailable(
          selectedDate,
          timeString,
          selectedCourt.id,
          duration,
        );

        slots.push({
          time: timeString,
          available,
        });
      }
    }

    return slots;
  }, [selectedDate, selectedCourt, duration, cfg, isSlotAvailable]);

  // Generate available days
  const availableDays = useMemo(() => {
    const out = [];
    const max = 7;
    for (let i = 0; i < max; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const localDateStr = `${year}-${month}-${day}`;

      out.push({
        date: localDateStr,
        label:
          i === 0
            ? "Oggi"
            : i === 1
              ? "Domani"
              : d.toLocaleDateString("it-IT", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                }),
      });
    }
    return out;
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!user) {
        setMessage({
          type: "error",
          text: "Devi essere autenticato per prenotare.",
        });
        return;
      }

      if (!selectedDate || !selectedTime || !selectedCourt) {
        setMessage({
          type: "error",
          text: "Compila tutti i campi obbligatori.",
        });
        return;
      }

      if (
        !isSlotAvailable(selectedDate, selectedTime, selectedCourt.id, duration)
      ) {
        setMessage({ type: "error", text: "Slot non disponibile." });
        return;
      }

      setIsSubmitting(true);
      setMessage(null);

      try {
        // Calculate price
        const price = computePrice(
          new Date(`${selectedDate}T${selectedTime}:00`),
          duration,
          cfg,
          { lighting, heating },
          selectedCourt.id,
          courts,
        );

        const bookingData = {
          courtId: selectedCourt.id,
          courtName: selectedCourt.name,
          date: selectedDate,
          time: selectedTime,
          duration,
          lighting,
          heating,
          price,
          players: [
            user.displayName || user.email,
            ...additionalPlayers.map((p) => p.name || p),
          ],
          notes: notes.trim(),
          userPhone: userPhone.trim(),
          type: "court",
        };

        await createUnifiedBooking(bookingData);

        setMessage({
          type: "success",
          text: "Prenotazione creata con successo!",
        });

        // Reset form
        setSelectedTime("");
        setSelectedCourt(null);
        setLighting(false);
        setHeating(false);
        setNotes("");
        setAdditionalPlayers([]);
        setNewPlayerName("");

        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        console.error("Error creating booking:", error);
        setMessage({
          type: "error",
          text: "Errore durante la creazione della prenotazione.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      user,
      selectedDate,
      selectedTime,
      selectedCourt,
      duration,
      lighting,
      heating,
      notes,
      additionalPlayers,
      userPhone,
      isSlotAvailable,
      createUnifiedBooking,
      cfg,
      courts,
    ],
  );

  // Handle adding additional players
  const addPlayer = useCallback(() => {
    if (newPlayerName.trim() && additionalPlayers.length < 3) {
      const newPlayer = { id: Date.now(), name: newPlayerName.trim() };
      setAdditionalPlayers((prev) => [...prev, newPlayer]);
      setNewPlayerName("");
    }
  }, [newPlayerName, additionalPlayers]);

  // Handle removing additional players
  const removePlayer = useCallback((playerId) => {
    setAdditionalPlayers((prev) => prev.filter((p) => p.id !== playerId));
  }, []);

  // Calculate total price
  const totalPrice =
    selectedCourt && selectedDate && selectedTime
      ? computePrice(
          new Date(`${selectedDate}T${selectedTime}:00`),
          duration,
          cfg,
          { lighting, heating },
          selectedCourt.id,
          courts,
        )
      : 0;

  // Show booking details modal
  const showBookingDetails = (booking) => {
    const court = courts.find((c) => c.id === booking.courtId);
    const bookingStart = new Date(`${booking.date}T${booking.time}:00`);
    const now = new Date();
    const hoursUntil = Math.round((bookingStart - now) / (1000 * 60 * 60));
    const canCancel = hoursUntil >= 24; // Allow cancellation 24h before

    setSelectedBookingDetails({
      ...booking,
      courtName: court?.name || booking.courtName || "Campo",
      courtFeatures: court?.features || [],
      canCancel,
      hoursUntil,
    });
  };

  // Get past user bookings
  const pastUserBookings = useMemo(() => {
    const now = new Date();
    return userBookings
      .filter((booking) => {
        const bookingStart = new Date(`${booking.date}T${booking.time}:00`);
        return bookingStart < now;
      })
      .sort(
        (a, b) =>
          new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`),
      );
  }, [userBookings]);

  if (bookingsLoading) {
    return (
      <Section T={T} title="Prenota Campo" className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Caricamento...</span>
        </div>
      </Section>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Mode Indicator */}
      {import.meta.env.DEV && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md text-sm">
          🔍 <strong>Debug Mode Attivo</strong> - Regola prevenzione buchi 30min
          attiva. Controlla la console del browser per log dettagliati.
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className={`${ds.h3} mb-4`}>Prenota Campo</h1>

        {/* User bookings section */}
        {user ? (
          <div className={`${T.cardBg} ${T.border} ${T.borderMd} p-4 mb-6`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className={`${ds.h5} flex items-center gap-2`}>
                <span>Prenotazioni Attive</span>
                <Badge variant="default" size="xs" T={T}>
                  {activeUserBookings.length}
                </Badge>
              </h2>

              <div className="flex items-center gap-2">
                {pastUserBookings.length > 0 && (
                  <button
                    onClick={() => setShowPastBookings(true)}
                    className="text-sm px-3 py-1 rounded-md transition-all text-gray-600 hover:text-gray-800 border border-gray-300 hover:bg-gray-50"
                  >
                    Storico ({pastUserBookings.length})
                  </button>
                )}

                {activeUserBookings.length > 3 && (
                  <button
                    onClick={() => setExpandedBookings(!expandedBookings)}
                    className={`text-sm px-3 py-1 rounded-md transition-all ${T.primaryBg} ${T.primaryText}`}
                  >
                    {expandedBookings ? "Mostra meno" : "Mostra tutte"}
                  </button>
                )}
              </div>
            </div>

            {activeUserBookings.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600 text-sm mb-2">
                  Non hai prenotazioni attive
                </p>
                {pastUserBookings.length > 0 && (
                  <button
                    onClick={() => setShowPastBookings(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Visualizza storico prenotazioni ({pastUserBookings.length})
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {(expandedBookings
                  ? activeUserBookings
                  : activeUserBookings.slice(0, 3)
                ).map((booking) => {
                  const court = courts.find((c) => c.id === booking.courtId);

                  return (
                    <div
                      key={booking.id}
                      className={`${T.cardBg} ${T.border} p-3 rounded-md cursor-pointer hover:shadow-md transition-all`}
                      onClick={() => showBookingDetails(booking)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {court?.name || booking.courtName || "Campo"}
                            </span>
                            <Badge variant="primary" size="xs" T={T}>
                              {booking.players?.length || 1} giocatori
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            {new Date(booking.date).toLocaleDateString(
                              "it-IT",
                              {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              },
                            )}{" "}
                            alle {booking.time} • {booking.duration}min •{" "}
                            {booking.price}€
                          </div>
                          {booking.players && booking.players.length > 1 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Con:{" "}
                              {booking.players
                                .filter(
                                  (p) =>
                                    p !== user.email && p !== user.displayName,
                                )
                                .slice(0, 2)
                                .join(", ")}
                              {booking.players.length > 3 && "..."}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div
            className={`${T.cardBg} ${T.border} ${T.borderMd} p-4 mb-6 text-center`}
          >
            <p className="text-gray-600 text-sm mb-3">
              Accedi per vedere le tue prenotazioni e prenotare nuovi campi
            </p>
            <p className="text-xs text-gray-500">
              Le prenotazioni possono essere cancellate fino a 24 ore prima
              dell'orario prenotato
            </p>
          </div>
        )}
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "error"
              ? "bg-red-100 text-red-800 border border-red-200"
              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Day Selection */}
      <Section title="Seleziona Giorno" variant="minimal" T={T}>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {availableDays.map((day) => (
            <button
              key={day.date}
              onClick={() => {
                setSelectedDate(day.date);
                setSelectedTime("");
                setSelectedCourt(null);
              }}
              className={`p-3 rounded-lg border text-center transition-all ${
                selectedDate === day.date
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm font-medium"
                  : `${T.cardBg} ${T.border} hover:bg-gray-50`
              }`}
            >
              <div className="text-sm font-medium">{day.label}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Court Selection */}
      {selectedDate && (
        <Section title="Seleziona Campo" variant="minimal" T={T}>
          <div className="grid gap-3">
            {courts.length === 0 && (
              <div className={`p-4 ${T.cardBg} ${T.border} ${T.borderMd}`}>
                Nessun campo configurato. Aggiungi campi nella configurazione
                della lega.
              </div>
            )}

            {courts.map((court) => {
              const isSelected = selectedCourt?.id === court.id;

              return (
                <div
                  key={court.id}
                  className={`${T.cardBg} ${T.border} ${T.borderMd} transition-all ${
                    isSelected
                      ? `${T.primaryBorder} ring-2 ${T.primaryRing}`
                      : "hover:shadow-md cursor-pointer"
                  }`}
                  onClick={() => setSelectedCourt(court)}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className={`${ds.h5} mb-1 flex items-center gap-2`}>
                          {court.name}
                          {court.premium && (
                            <Badge variant="warning" size="xs" T={T}>
                              Premium
                            </Badge>
                          )}
                          {isSelected && (
                            <Badge variant="primary" size="sm" T={T}>
                              Selezionato
                            </Badge>
                          )}
                        </h3>
                        {Array.isArray(court.features) &&
                          court.features.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {court.features.map((feature, index) => (
                                <Badge
                                  key={index}
                                  variant="default"
                                  size="xs"
                                  T={T}
                                >
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          )}
                      </div>
                      {selectedDate && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-emerald-600">
                            {computePrice(
                              new Date(`${selectedDate}T12:00:00`),
                              60,
                              cfg,
                              { lighting: false, heating: false },
                              court.id,
                              courts,
                            )}
                            €/60min
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Time Selection */}
      {selectedDate && selectedCourt && (
        <Section title="Seleziona Orario" variant="minimal" T={T}>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {availableTimeSlots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => slot.available && setSelectedTime(slot.time)}
                disabled={!slot.available}
                className={`p-2 rounded text-sm transition-colors ${
                  selectedTime === slot.time
                    ? "bg-blue-600 text-white"
                    : slot.available
                      ? "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Booking Configuration */}
      {selectedDate && selectedTime && selectedCourt && (
        <Section title="Configura Prenotazione" variant="minimal" T={T}>
          <div
            className={`${T.cardBg} ${T.border} ${T.borderMd} p-6 space-y-6`}
          >
            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durata (minuti)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(cfg.defaultDurations || [60, 90, 120]).map((dur) => {
                  const price = computePrice(
                    new Date(`${selectedDate}T${selectedTime}:00`),
                    dur,
                    cfg,
                    { lighting, heating },
                    selectedCourt.id,
                    courts,
                  );
                  const isAvailable = isDurationAvailable(dur);
                  return (
                    <button
                      key={dur}
                      onClick={() => isAvailable && setDuration(dur)}
                      disabled={!isAvailable}
                      className={`p-2 rounded-md border text-center transition-all text-sm ${
                        duration === dur
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm font-medium"
                          : isAvailable
                            ? `${T.cardBg} ${T.border} hover:bg-emerald-50`
                            : "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                      }`}
                      title={
                        !isAvailable
                          ? "Non disponibile - creerebbe uno slot di 30min inutilizzabile"
                          : ""
                      }
                    >
                      <div className="font-medium">{dur}min</div>
                      <div className="text-xs text-gray-500">{price}€</div>
                      {!isAvailable && (
                        <div className="text-xs text-red-500 mt-1">
                          Non disponibile
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amenities */}
            {(cfg.addons?.lightingEnabled || cfg.addons?.heatingEnabled) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servizi Extra
                </label>
                <div className="flex flex-wrap gap-2">
                  {cfg.addons?.lightingEnabled && (
                    <label
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-all ${
                        lighting
                          ? `${T.primaryBg}/20 ${T.primaryBorder}`
                          : `${T.cardBg} ${T.border} hover:${T.primaryBg}/10`
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={lighting}
                        onChange={(e) => setLighting(e.target.checked)}
                        className="rounded text-sm"
                      />
                      <span className="text-sm">
                        Luci (+{cfg.addons?.lightingFee || 0}€)
                      </span>
                    </label>
                  )}
                  {cfg.addons?.heatingEnabled && (
                    <label
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-all ${
                        heating
                          ? `${T.primaryBg}/20 ${T.primaryBorder}`
                          : `${T.cardBg} ${T.border} hover:${T.primaryBg}/10`
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={heating}
                        onChange={(e) => setHeating(e.target.checked)}
                        className="rounded text-sm"
                      />
                      <span className="text-sm">
                        Riscaldamento (+{cfg.addons?.heatingFee || 0}€)
                      </span>
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Additional Players */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giocatori ({1 + additionalPlayers.length}/4)
              </label>

              {/* Organizer */}
              <div className="mb-2">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-md ${T.cardBg} ${T.border}`}
                >
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium">
                    {user?.displayName || user?.email || "Tu"}
                  </span>
                  <Badge variant="primary" size="xs" T={T}>
                    Organizzatore
                  </Badge>
                </div>
              </div>

              {/* Additional players */}
              {additionalPlayers.length > 0 && (
                <div className="space-y-1 mb-2">
                  {additionalPlayers.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md ${T.cardBg} ${T.border}`}
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm flex-1">{player.name}</span>
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="text-red-500 hover:text-red-700 text-xs p-1"
                        title="Rimuovi giocatore"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add player */}
              {additionalPlayers.length < 3 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                    placeholder="Nome giocatore"
                    className={`flex-1 p-2 text-sm ${T.cardBg} ${T.border} rounded-md focus:outline-none focus:ring-1 ${T.primaryRing}`}
                  />
                  <button
                    onClick={addPlayer}
                    disabled={!newPlayerName.trim()}
                    className={`px-3 py-2 text-sm rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${T.primaryBg} ${T.primaryText}`}
                  >
                    Aggiungi
                  </button>
                </div>
              )}
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefono
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="333 123 4567"
                  className={`w-full p-2 text-sm ${T.cardBg} ${T.border} rounded-md focus:outline-none focus:ring-1 ${T.primaryRing}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Es: doppio misto"
                  className={`w-full p-2 text-sm ${T.cardBg} ${T.border} rounded-md focus:outline-none focus:ring-1 ${T.primaryRing}`}
                />
              </div>
            </div>

            {/* Price summary and submit */}
            <div className={`border-t ${T.border} pt-4`}>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Data:</span>
                    <span className="ml-1 font-medium">
                      {new Date(selectedDate).toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ora:</span>
                    <span className="ml-1 font-medium">{selectedTime}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Durata:</span>
                    <span className="ml-1 font-medium">{duration}min</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Giocatori:</span>
                    <span className="ml-1 font-medium">
                      {1 + additionalPlayers.length}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-600">
                    {totalPrice}€
                  </div>
                  {(lighting || heating) && (
                    <div className="text-xs text-gray-500">
                      {lighting && "Luci "}
                      {heating && "Riscald."} inclusi
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !user}
                className={`w-full ${T.btnPrimary} text-center py-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
              >
                {isSubmitting
                  ? "Prenotazione in corso..."
                  : user
                    ? `Conferma Prenotazione - ${totalPrice}€`
                    : "Accedi per Prenotare"}
              </button>
            </div>
          </div>
        </Section>
      )}

      {/* Modal storico prenotazioni passate */}
      {showPastBookings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className={`${ds.h4} flex items-center gap-2`}>
                <span>Storico Prenotazioni</span>
                <Badge variant="default" size="sm" T={T}>
                  {pastUserBookings.length}
                </Badge>
              </h3>
              <button
                onClick={() => setShowPastBookings(false)}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {pastUserBookings.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                Non hai prenotazioni passate
              </p>
            ) : (
              <div className="space-y-2">
                {pastUserBookings.map((booking) => {
                  const court = courts.find((c) => c.id === booking.courtId);
                  const bookingDate = new Date(
                    `${booking.date}T${booking.time}:00`,
                  );
                  const isRecent =
                    (new Date() - bookingDate) / (1000 * 60 * 60 * 24) <= 7;

                  return (
                    <div
                      key={booking.id}
                      className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-500 p-3 rounded-md cursor-pointer hover:shadow-md transition-all"
                      onClick={() => showBookingDetails(booking)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {court?.name || booking.courtName || "Campo"}
                            </span>
                            <Badge variant="default" size="xs" T={T}>
                              {booking.players?.length || 1} giocatori
                            </Badge>
                            <Badge variant="default" size="xs" T={T}>
                              Completata
                            </Badge>
                            {isRecent && (
                              <Badge variant="warning" size="xs" T={T}>
                                Recente
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {bookingDate.toLocaleDateString("it-IT", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}{" "}
                            alle {booking.time} • {booking.duration}min •{" "}
                            {booking.price}€
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 px-2 py-1">
                          {Math.ceil(
                            (new Date() - bookingDate) / (1000 * 60 * 60 * 24),
                          )}{" "}
                          giorni fa
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowPastBookings(false)}
                className={`px-4 py-2 rounded-md transition-all ${T.primaryBg} ${T.primaryText}`}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal dettagli prenotazione */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className={`${ds.h4}`}>Dettagli Prenotazione</h3>
              <button
                onClick={() => setSelectedBookingDetails(null)}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Main info */}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-500 p-4 rounded-md">
                <h4 className={`${ds.h6} mb-2`}>
                  {selectedBookingDetails.courtName}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Data:
                    </span>
                    <div className="font-medium">
                      {new Date(selectedBookingDetails.date).toLocaleDateString(
                        "it-IT",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Orario:
                    </span>
                    <div className="font-medium">
                      {selectedBookingDetails.time}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Durata:
                    </span>
                    <div className="font-medium">
                      {selectedBookingDetails.duration} minuti
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Prezzo:
                    </span>
                    <div className="font-medium text-emerald-600">
                      {selectedBookingDetails.price}€
                    </div>
                  </div>
                </div>

                {selectedBookingDetails.hoursUntil > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    Mancano {selectedBookingDetails.hoursUntil} ore
                  </div>
                )}
              </div>

              {/* Players */}
              {selectedBookingDetails.players &&
                selectedBookingDetails.players.length > 0 && (
                  <div>
                    <h5 className={`${ds.h6} mb-2`}>
                      Giocatori ({selectedBookingDetails.players.length})
                    </h5>
                    <div className="space-y-1">
                      {selectedBookingDetails.players.map((player, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-500 rounded-md"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              player === user?.email ||
                              player === user?.displayName
                                ? "bg-emerald-500"
                                : "bg-blue-500"
                            }`}
                          ></div>
                          <span className="text-sm">{player}</span>
                          {(player === user?.email ||
                            player === user?.displayName) && (
                            <Badge variant="primary" size="xs" T={T}>
                              Tu
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Notes */}
              {selectedBookingDetails.notes && (
                <div>
                  <h5 className={`${ds.h6} mb-2`}>Note</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedBookingDetails.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSelectedBookingDetails(null)}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-500 py-2 px-4 rounded-md text-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingField;
