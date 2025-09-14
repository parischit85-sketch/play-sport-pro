// =============================================
// FILE: src/features/lessons/components/LessonAdminPanel.jsx
// Pannello amministrazione per la gestione delle lezioni
// =============================================
import React, { useState, useMemo } from "react";
import Section from "@ui/Section.jsx";
import Badge from "@ui/Badge.jsx";
import Modal from "@ui/Modal.jsx";
import { uid } from "@lib/ids.js";
import {
  createLessonTimeSlotSchema,
  PLAYER_CATEGORIES,
} from "@features/players/types/playerTypes.js";

export default function LessonAdminPanel({
  T,
  ds,
  lessonConfig,
  updateLessonConfig,
  instructors,
  players,
  setState,
  state,
  courts,
  onClearAllLessons,
  lessonBookingsCount,
}) {
  const [activeSection, setActiveSection] = useState("config");
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState(null);
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  const weekDays = [
    { value: 0, label: "Domenica" },
    { value: 1, label: "Lunedì" },
    { value: 2, label: "Martedì" },
    { value: 3, label: "Mercoledì" },
    { value: 4, label: "Giovedì" },
    { value: 5, label: "Venerdì" },
    { value: 6, label: "Sabato" },
  ];

  // Potential instructors (non-instructor players who can become instructors)
  const potentialInstructors = useMemo(() => {
    return (players || []).filter(
      (player) => player.category !== PLAYER_CATEGORIES.INSTRUCTOR,
    );
  }, [players]);

  // Handle enabling/disabling lesson system
  const toggleLessonSystem = () => {
    updateLessonConfig({
      ...lessonConfig,
      isEnabled: !lessonConfig.isEnabled,
    });
  };

  // Handle time slot management
  const handleSaveTimeSlot = (timeSlotData) => {
    const updatedTimeSlots = editingTimeSlot
      ? (lessonConfig.timeSlots || []).map((slot) =>
          slot.id === editingTimeSlot.id ? { ...slot, ...timeSlotData } : slot,
        )
      : [
          ...(lessonConfig.timeSlots || []),
          { ...createLessonTimeSlotSchema(), ...timeSlotData, id: uid() },
        ];

    updateLessonConfig({
      ...lessonConfig,
      timeSlots: updatedTimeSlots,
    });

    setShowTimeSlotModal(false);
    setEditingTimeSlot(null);
  };

  const handleDeleteTimeSlot = (timeSlotId) => {
    if (confirm("Sei sicuro di voler eliminare questa fascia oraria?")) {
      updateLessonConfig({
        ...lessonConfig,
        timeSlots: (lessonConfig.timeSlots || []).filter(
          (slot) => slot.id !== timeSlotId,
        ),
      });
    }
  };

  // Handle instructor management
  const handleSaveInstructor = (instructorData) => {
    const updatedPlayers = (players || []).map((player) => {
      if (player.id === editingPlayer.id) {
        return {
          ...player,
          category: PLAYER_CATEGORIES.INSTRUCTOR,
          instructorData: {
            ...player.instructorData,
            isInstructor: true,
            ...instructorData,
          },
        };
      }
      return player;
    });

    setState((prev) => ({
      ...prev,
      players: updatedPlayers,
    }));

    setShowInstructorModal(false);
    setEditingPlayer(null);
  };

  const handleRemoveInstructor = (playerId) => {
    if (
      confirm("Sei sicuro di voler rimuovere questo giocatore come istruttore?")
    ) {
      const updatedPlayers = (players || []).map((player) => {
        if (player.id === playerId) {
          return {
            ...player,
            category: PLAYER_CATEGORIES.MEMBER,
            instructorData: {
              ...player.instructorData,
              isInstructor: false,
            },
          };
        }
        return player;
      });

      setState((prev) => ({
        ...prev,
        players: updatedPlayers,
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-t-lg">
        <nav className="flex space-x-8 overflow-x-auto px-6 py-2">
          {[
            {
              id: "config",
              label: "Configurazione Generale",
              icon: "⚙️",
              color: "blue",
            },
            {
              id: "timeslots",
              label: "Fasce Orarie",
              icon: "⏰",
              color: "green",
            },
            {
              id: "instructors",
              label: "Gestione Istruttori",
              icon: "👨‍🏫",
              color: "purple",
            },
            { id: "cleanup", label: "Pulizia Dati", icon: "🗑️", color: "red" },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                activeSection === section.id
                  ? `border-${section.color}-500 text-${section.color}-600 dark:text-${section.color}-400 bg-${section.color}-50 dark:bg-${section.color}-900/20 rounded-t-lg`
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-t-lg"
              }`}
            >
              <span className="text-base">{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* General Configuration */}
      {activeSection === "config" && (
        <div className="space-y-6">
          <Section
            title="Configurazione Sistema Lezioni"
            variant="minimal"
            T={T}
          >
            <div className="space-y-4">
              {/* Enable/Disable System */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                <div>
                  <h3
                    className={`${ds.h6} font-semibold mb-2 text-gray-900 dark:text-white flex items-center gap-2`}
                  >
                    🎾 Sistema Lezioni
                  </h3>
                  <p className={`text-sm ${T.subtext} max-w-md`}>
                    {lessonConfig.isEnabled
                      ? "✅ Il sistema di prenotazione lezioni è attivo e funzionante"
                      : "❌ Il sistema di prenotazione lezioni è disattivato"}
                  </p>
                </div>
                <button
                  onClick={toggleLessonSystem}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                    lessonConfig.isEnabled
                      ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 border border-red-300 dark:border-red-700"
                      : "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/60 border border-green-300 dark:border-green-700"
                  }`}
                >
                  {lessonConfig.isEnabled ? "🛑 Disattiva" : "🚀 Attiva"}
                </button>
              </div>

              {/* Configuration Options */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                  <label
                    className={`block ${ds.label} mb-3 flex items-center gap-2 text-gray-900 dark:text-white font-medium`}
                  >
                    📅 Giorni di Anticipo per Prenotazione
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={lessonConfig.bookingAdvanceDays}
                    onChange={(e) =>
                      updateLessonConfig({
                        ...lessonConfig,
                        bookingAdvanceDays: parseInt(e.target.value) || 14,
                      })
                    }
                    className={`w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white`}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Quanto in anticipo si può prenotare
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                  <label
                    className={`block ${ds.label} mb-3 flex items-center gap-2 text-gray-900 dark:text-white font-medium`}
                  >
                    ⏰ Ore Prima per Cancellazione
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={lessonConfig.cancellationHours}
                    onChange={(e) =>
                      updateLessonConfig({
                        ...lessonConfig,
                        cancellationHours: parseInt(e.target.value) || 24,
                      })
                    }
                    className={`w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white`}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Limite per cancellazioni gratuite
                  </p>
                </div>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* Time Slots Management */}
      {activeSection === "timeslots" && (
        <div className="space-y-6">
          <Section title="Gestione Fasce Orarie" variant="minimal" T={T}>
            <div className="space-y-4">
              {/* Add Time Slot Button */}
              <button
                onClick={() => setShowTimeSlotModal(true)}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                + Aggiungi Fascia Oraria
              </button>{" "}
              {/* Time Slots List */}
              {(lessonConfig.timeSlots || []).length === 0 ? (
                <div className={`text-center py-8 ${T.subtext}`}>
                  Nessuna fascia oraria configurata. Crea la prima fascia per
                  iniziare.
                </div>
              ) : (
                <div className="space-y-3">
                  {(lessonConfig.timeSlots || []).map((slot) => {
                    // Support both old format (dayOfWeek) and new format (selectedDates)
                    let displayTitle = "";
                    let dateInfo = "";

                    if (slot.selectedDates && slot.selectedDates.length > 0) {
                      // New format: specific dates
                      const sortedDates = [...slot.selectedDates].sort();
                      if (sortedDates.length === 1) {
                        displayTitle = new Date(
                          sortedDates[0],
                        ).toLocaleDateString("it-IT", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        });
                      } else {
                        displayTitle = `${sortedDates.length} date selezionate`;
                        dateInfo = sortedDates
                          .slice(0, 3)
                          .map((date) =>
                            new Date(date).toLocaleDateString("it-IT"),
                          )
                          .join(", ");
                        if (sortedDates.length > 3) {
                          dateInfo += ` +${sortedDates.length - 3} altre...`;
                        }
                      }
                    } else if (slot.dayOfWeek) {
                      // Old format: day of week (for backward compatibility)
                      const dayName =
                        weekDays.find((d) => d.value === slot.dayOfWeek)
                          ?.label || "Sconosciuto";
                      displayTitle = dayName;
                      dateInfo = "Ogni settimana";
                    } else {
                      displayTitle = "Configurazione non valida";
                    }

                    const availableInstructors = (instructors || []).filter(
                      (i) => slot.instructorIds.includes(i.id),
                    );

                    return (
                      <div
                        key={slot.id}
                        className={`${T.cardBg} ${T.border} ${T.borderMd} p-4`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className={`${ds.h6} font-medium`}>
                                {displayTitle} • {slot.startTime} -{" "}
                                {slot.endTime}
                              </h4>
                              <Badge
                                variant={slot.isActive ? "success" : "default"}
                                size="sm"
                                T={T}
                              >
                                {slot.isActive ? "Attiva" : "Inattiva"}
                              </Badge>
                            </div>

                            {dateInfo && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {dateInfo}
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>Max prenotazioni: {slot.maxBookings}</span>
                              <span>
                                Istruttori: {availableInstructors.length}
                              </span>
                            </div>

                            {availableInstructors.length > 0 && (
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-1">
                                  {availableInstructors.map((instructor) => (
                                    <div
                                      key={instructor.id}
                                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300"
                                    >
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                          backgroundColor:
                                            instructor.instructorData?.color,
                                        }}
                                      ></div>
                                      {instructor.name}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingTimeSlot(slot);
                                setShowTimeSlotModal(true);
                              }}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                              Modifica
                            </button>
                            <button
                              onClick={() => handleDeleteTimeSlot(slot.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              Elimina
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Section>
        </div>
      )}

      {/* Instructors Management */}
      {activeSection === "instructors" && (
        <div className="space-y-6">
          <Section title="Gestione Istruttori" variant="minimal" T={T}>
            <div className="space-y-6">
              {/* Current Instructors */}
              <div>
                <h3 className={`${ds.h6} font-medium mb-3`}>
                  Istruttori Attivi ({instructors.length})
                </h3>

                {instructors.length === 0 ? (
                  <div className={`text-center py-6 ${T.subtext}`}>
                    Nessun istruttore configurato
                  </div>
                ) : (
                  <div className="space-y-3">
                    {instructors.map((instructor) => (
                      <div
                        key={instructor.id}
                        className={`${T.cardBg} ${T.border} rounded-lg p-4 hover:shadow-lg dark:hover:shadow-gray-700/50 transition-all duration-200`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                              style={{
                                backgroundColor:
                                  instructor.instructorData?.color,
                              }}
                            >
                              {instructor.name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <h4
                                className={`${ds.h6} font-medium text-gray-900 dark:text-white`}
                              >
                                {instructor.name}
                              </h4>
                              <div className="flex flex-col gap-2 text-sm">
                                {/* Prezzi lezioni con design migliorato */}
                                <div className="flex flex-wrap gap-1.5">
                                  {instructor.instructorData?.priceSingle >
                                    0 && (
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-700">
                                      💼 €
                                      {instructor.instructorData.priceSingle}
                                    </span>
                                  )}
                                  {instructor.instructorData?.priceCouple >
                                    0 && (
                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded-full text-xs font-medium border border-green-200 dark:border-green-700">
                                      👥 €
                                      {instructor.instructorData.priceCouple}
                                    </span>
                                  )}
                                  {instructor.instructorData?.priceThree >
                                    0 && (
                                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium border border-purple-200 dark:border-purple-700">
                                      👥👤 €
                                      {instructor.instructorData.priceThree}
                                    </span>
                                  )}
                                  {instructor.instructorData?.priceMatchLesson >
                                    0 && (
                                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 rounded-full text-xs font-medium border border-orange-200 dark:border-orange-700">
                                      🏆 €
                                      {
                                        instructor.instructorData
                                          .priceMatchLesson
                                      }
                                    </span>
                                  )}
                                  {/* Fallback alla tariffa oraria se non ci sono prezzi specifici */}
                                  {!instructor.instructorData?.priceSingle &&
                                    !instructor.instructorData?.priceCouple &&
                                    !instructor.instructorData?.priceThree &&
                                    !instructor.instructorData
                                      ?.priceMatchLesson &&
                                    instructor.instructorData?.hourlyRate >
                                      0 && (
                                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-600">
                                        ⏰ €
                                        {instructor.instructorData.hourlyRate}
                                        /ora
                                      </span>
                                    )}
                                </div>
                                {/* Specialità con design migliorato */}
                                {instructor.instructorData?.specialties
                                  ?.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {instructor.instructorData.specialties.map(
                                      (specialty, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs border border-indigo-200 dark:border-indigo-700"
                                        >
                                          ⭐ {specialty}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingPlayer(instructor);
                                setShowInstructorModal(true);
                              }}
                              className="px-3 py-1.5 text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-500 border border-blue-600 dark:border-blue-400 rounded-lg transition-all duration-200 font-medium text-sm"
                            >
                              ✏️ Modifica
                            </button>
                            <button
                              onClick={() =>
                                handleRemoveInstructor(instructor.id)
                              }
                              className="px-3 py-1.5 text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 dark:hover:bg-red-500 border border-red-600 dark:border-red-400 rounded-lg transition-all duration-200 font-medium text-sm"
                            >
                              🗑️ Rimuovi
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Instructor */}
              <div>
                <h3 className={`${ds.h6} font-medium mb-3`}>
                  Aggiungi Istruttore
                </h3>

                {potentialInstructors.length === 0 ? (
                  <div className={`text-center py-6 ${T.subtext}`}>
                    Tutti i giocatori sono già istruttori o non ci sono
                    giocatori disponibili
                  </div>
                ) : (
                  <div className="space-y-3">
                    {potentialInstructors.slice(0, 5).map((player) => (
                      <div
                        key={player.id}
                        className={`${T.cardBg} ${T.border} rounded-lg p-4 hover:shadow-md dark:hover:shadow-gray-700/50 transition-all duration-200`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center text-white font-bold shadow-md">
                              {player.name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <h4
                                className={`${ds.h6} font-medium text-gray-900 dark:text-white`}
                              >
                                {player.name}
                              </h4>
                              <p
                                className={`text-sm ${T.subtext} flex items-center gap-2`}
                              >
                                <span>📧 {player.email}</span>
                                <span>•</span>
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">
                                  {player.category}
                                </span>
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setEditingPlayer(player);
                              setShowInstructorModal(true);
                            }}
                            className="px-4 py-2 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/60 border border-green-300 dark:border-green-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            ➕ Rendi Istruttore
                          </button>
                        </div>
                      </div>
                    ))}

                    {potentialInstructors.length > 5 && (
                      <p className={`text-sm ${T.subtext} text-center`}>
                        ... e altri {potentialInstructors.length - 5} giocatori
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* Data Cleanup Section */}
      {activeSection === "cleanup" && (
        <div className="space-y-6">
          <Section title="Pulizia Dati di Test" variant="minimal" T={T}>
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2">
                  <span className="text-xl">⚠️</span>
                  <h3 className="font-semibold">Attenzione</h3>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Questa sezione permette di cancellare tutte le prenotazioni di
                  lezione di test. Le prenotazioni dei campi associate verranno
                  anche cancellate automaticamente.
                </p>
              </div>

              <div
                className={`${T.cardBg} ${T.border} ${T.borderMd} p-6 rounded-lg`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`${ds.h6} font-medium`}>
                      Prenotazioni Lezioni Presenti
                    </h3>
                    <p className={`text-sm ${T.subtext}`}>
                      {lessonBookingsCount === 0
                        ? "Nessuna prenotazione di lezione presente"
                        : lessonBookingsCount === 1
                          ? "1 prenotazione di lezione presente"
                          : `${lessonBookingsCount} prenotazioni di lezione presenti`}
                    </p>
                  </div>
                  <div className="text-3xl">🗑️</div>
                </div>

                {lessonBookingsCount > 0 ? (
                  <div className="space-y-3">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-3">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        <strong>Cosa verrà eliminato:</strong>
                        <br />• {lessonBookingsCount} prenotazione/i di lezione
                        <br />
                        • I relativi slot prenotati nei campi
                        <br />• Tutti i dati associati dal localStorage
                      </p>
                    </div>

                    <button
                      onClick={onClearAllLessons}
                      className="w-full px-4 py-3 bg-red-600 dark:bg-red-700 text-white font-medium rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                    >
                      🗑️ Cancella Tutte le Prenotazioni di Lezione
                    </button>
                  </div>
                ) : (
                  <div className={`text-center py-6 ${T.subtext}`}>
                    <div className="text-4xl mb-2">✨</div>
                    <p>Nessuna prenotazione di lezione da cancellare</p>
                  </div>
                )}
              </div>

              <div
                className={`${T.cardBg} ${T.border} ${T.borderMd} p-4 rounded-lg`}
              >
                <h4 className={`${ds.h6} font-medium mb-2`}>
                  Come funziona la pulizia:
                </h4>
                <ul className={`text-sm space-y-1 ${T.subtext}`}>
                  <li>
                    • Cancella tutte le prenotazioni di lezione dal localStorage
                  </li>
                  <li>• Cancella i corrispondenti slot prenotati nei campi</li>
                  <li>• Aggiorna automaticamente la vista "Gestione Campi"</li>
                  <li>
                    • Non tocca le configurazioni degli istruttori o le fasce
                    orarie
                  </li>
                </ul>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* Time Slot Modal */}
      {showTimeSlotModal && (
        <TimeSlotModal
          isOpen={showTimeSlotModal}
          onClose={() => {
            setShowTimeSlotModal(false);
            setEditingTimeSlot(null);
          }}
          timeSlot={editingTimeSlot}
          instructors={instructors}
          courts={courts}
          weekDays={weekDays}
          onSave={handleSaveTimeSlot}
          T={T}
          ds={ds}
        />
      )}

      {/* Instructor Modal */}
      {showInstructorModal && editingPlayer && (
        <InstructorModal
          isOpen={showInstructorModal}
          onClose={() => {
            setShowInstructorModal(false);
            setEditingPlayer(null);
          }}
          player={editingPlayer}
          onSave={handleSaveInstructor}
          T={T}
          ds={ds}
        />
      )}
    </div>
  );
}

// Time Slot Management Modal
function TimeSlotModal({
  isOpen,
  onClose,
  timeSlot,
  instructors,
  courts,
  weekDays,
  onSave,
  T,
  ds,
}) {
  const [formData, setFormData] = useState(() => ({
    selectedDates: [], // Array of selected date strings in YYYY-MM-DD format
    startTime: "09:00",
    endTime: "10:00",
    instructorIds: [],
    courtIds: [], // Add court selection
    maxBookings: 1,
    isActive: true,
    // Convert old dayOfWeek format if editing existing slot
    ...(timeSlot && timeSlot.dayOfWeek
      ? {
          selectedDates: [], // Will need manual conversion for existing slots
          ...timeSlot,
        }
      : timeSlot),
  }));

  // Calendar functionality
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({
        day,
        dateStr,
        isSelected: formData.selectedDates.includes(dateStr),
        isPast: new Date(dateStr) < new Date().setHours(0, 0, 0, 0),
      });
    }

    return days;
  };

  const toggleDateSelection = (dateStr) => {
    const isSelected = formData.selectedDates.includes(dateStr);
    const newSelectedDates = isSelected
      ? formData.selectedDates.filter((d) => d !== dateStr)
      : [...formData.selectedDates, dateStr].sort();

    setFormData({ ...formData, selectedDates: newSelectedDates });
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

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

  const dayNames = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.startTime || !formData.endTime) {
      alert("Inserisci orario di inizio e fine");
      return;
    }

    if (formData.startTime >= formData.endTime) {
      alert("L'orario di fine deve essere dopo quello di inizio");
      return;
    }

    if (formData.selectedDates.length === 0) {
      alert("Seleziona almeno una data dal calendario");
      return;
    }

    if (formData.instructorIds.length === 0) {
      alert("Seleziona almeno un istruttore");
      return;
    }

    if (formData.courtIds.length === 0) {
      alert("Seleziona almeno un campo");
      return;
    }

    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={timeSlot ? "Modifica Fascia Oraria" : "Aggiungi Fascia Oraria"}
      size="medium"
      T={T}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Calendar Selector */}
        <div>
          <label className={`block ${ds.label} mb-2`}>Seleziona Date *</label>
          <div className={`border rounded-lg p-4 ${T.border} ${T.cardBg}`}>
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                ←
              </button>
              <h3 className={`${ds.h6} font-medium`}>
                {monthNames[currentMonth.getMonth()]}{" "}
                {currentMonth.getFullYear()}
              </h3>
              <button
                type="button"
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                →
              </button>
            </div>

            {/* Day names header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((dayName) => (
                <div
                  key={dayName}
                  className="text-center text-sm font-medium text-gray-500 p-2"
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map((dayData, index) => {
                if (!dayData) {
                  return <div key={index} className="p-2"></div>;
                }

                return (
                  <button
                    key={dayData.dateStr}
                    type="button"
                    onClick={() =>
                      !dayData.isPast && toggleDateSelection(dayData.dateStr)
                    }
                    disabled={dayData.isPast}
                    className={`
                      p-2 text-sm rounded border transition-colors
                      ${
                        dayData.isPast
                          ? "text-gray-400 cursor-not-allowed"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      }
                      ${
                        dayData.isSelected
                          ? "bg-blue-500 text-white border-blue-500"
                          : "border-gray-200 dark:border-gray-600"
                      }
                    `}
                  >
                    {dayData.day}
                  </button>
                );
              })}
            </div>

            {/* Selected dates summary */}
            {formData.selectedDates.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                  Date selezionate ({formData.selectedDates.length}):
                </p>
                <div className="flex flex-wrap gap-1">
                  {formData.selectedDates.map((dateStr) => (
                    <span
                      key={dateStr}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 text-xs rounded"
                    >
                      {new Date(dateStr).toLocaleDateString("it-IT")}
                      <button
                        type="button"
                        onClick={() => toggleDateSelection(dateStr)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block ${ds.label} mb-2`}>Ora Inizio *</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div>
            <label className={`block ${ds.label} mb-2`}>Ora Fine *</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>

        {/* Max Bookings */}
        <div>
          <label className={`block ${ds.label} mb-2`}>
            Numero Massimo Prenotazioni
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.maxBookings}
            onChange={(e) =>
              setFormData({
                ...formData,
                maxBookings: parseInt(e.target.value) || 1,
              })
            }
            className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* Instructor Selection */}
        <div>
          <label className={`block ${ds.label} mb-2`}>
            Istruttori Disponibili *
          </label>
          <div
            className={`space-y-2 max-h-40 overflow-y-auto border rounded p-2 ${T.border} ${T.cardBg}`}
          >
            {instructors.map((instructor) => (
              <label key={instructor.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.instructorIds.includes(instructor.id)}
                  onChange={(e) => {
                    const { checked } = e.target;
                    setFormData({
                      ...formData,
                      instructorIds: checked
                        ? [...formData.instructorIds, instructor.id]
                        : formData.instructorIds.filter(
                            (id) => id !== instructor.id,
                          ),
                    });
                  }}
                  className="rounded"
                />
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: instructor.instructorData?.color,
                    }}
                  ></div>
                  <span className={T.text}>{instructor.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Court Selection */}
        <div>
          <label className={`block ${ds.label} mb-2`}>
            Campi Disponibili *
          </label>
          <div
            className={`space-y-2 max-h-40 overflow-y-auto border rounded p-2 ${T.border} ${T.cardBg}`}
          >
            {courts &&
              courts.map((court) => (
                <label key={court.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.courtIds.includes(court.id)}
                    onChange={(e) => {
                      const { checked } = e.target;
                      setFormData({
                        ...formData,
                        courtIds: checked
                          ? [...formData.courtIds, court.id]
                          : formData.courtIds.filter((id) => id !== court.id),
                      });
                    }}
                    className="rounded"
                  />
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{
                        backgroundColor: court.surface?.color || "#e5e7eb",
                      }}
                    ></div>
                    <span className={T.text}>
                      {court.name || `Campo ${court.id}`}
                    </span>
                    {court.surface?.type && (
                      <span
                        className={`text-xs px-2 py-1 ${T.cardBg} ${T.border} rounded`}
                      >
                        {court.surface.type}
                      </span>
                    )}
                  </div>
                </label>
              ))}
          </div>
          {(!courts || courts.length === 0) && (
            <p className={`text-sm ${T.subtext} mt-1`}>
              Nessun campo configurato. Vai alla sezione Campi per aggiungerne.
            </p>
          )}
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="rounded"
          />
          <label htmlFor="isActive" className={ds.label}>
            Fascia oraria attiva
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-2 px-4 ${T.cardBg} ${T.border} ${T.borderMd} hover:bg-gray-50 dark:hover:bg-gray-700`}
          >
            Annulla
          </button>
          <button
            type="submit"
            className="flex-1 py-2 px-4 bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            {timeSlot ? "Aggiorna" : "Crea"} Fascia Oraria
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Instructor Management Modal
function InstructorModal({ isOpen, onClose, player, onSave, T, ds }) {
  const [formData, setFormData] = useState(() => ({
    color: "#3B82F6",
    hourlyRate: 0, // Mantengo per retrocompatibilità
    priceSingle: 0,
    priceCouple: 0,
    priceThree: 0,
    priceMatchLesson: 0,
    specialties: [],
    bio: "",
    certifications: [],
    ...player.instructorData,
  }));

  const [newSpecialty, setNewSpecialty] = useState("");
  const [newCertification, setNewCertification] = useState("");

  const commonSpecialties = ["Padel", "Tennis", "Fitness"];
  const predefinedColors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#6366F1",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const addSpecialty = () => {
    if (
      newSpecialty.trim() &&
      !formData.specialties.includes(newSpecialty.trim())
    ) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty.trim()],
      });
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialty) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter((s) => s !== specialty),
    });
  };

  const addCertification = () => {
    if (
      newCertification.trim() &&
      !formData.certifications.includes(newCertification.trim())
    ) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, newCertification.trim()],
      });
      setNewCertification("");
    }
  };

  const removeCertification = (certification) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter(
        (c) => c !== certification,
      ),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configura Istruttore: ${player.name}`}
      size="extraLarge"
      T={T}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Color Selection */}
        <div>
          <label className={`block ${ds.label} mb-2`}>Colore Istruttore</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {predefinedColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                  formData.color === color
                    ? "border-gray-800 dark:border-white scale-110 shadow-lg"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-400"
                }`}
                style={{ backgroundColor: color }}
                title={`Seleziona colore ${color}`}
              >
                {formData.color === color && (
                  <span className="text-white text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
              className="w-12 h-8 rounded border cursor-pointer"
              title="Colore personalizzato"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Colore: {formData.color}
            </span>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
            <label className={`block ${ds.label} mb-2`}>Tariffe (€/ora)</label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-blue-200/50 dark:border-blue-700/50 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1">
                  <label className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 mb-3">
                    <span className="text-lg">🎯</span>
                    <span>Lezione Singola</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.priceSingle || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceSingle: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white border-2 border-blue-300/50 dark:border-blue-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg font-semibold placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="50€"
                  />
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-green-200/50 dark:border-green-700/50 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-1">
                  <label className="flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-400 mb-3">
                    <span className="text-lg">👥</span>
                    <span>Lezione di Coppia</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.priceCouple || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceCouple: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white border-2 border-green-300/50 dark:border-green-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg font-semibold placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="70€"
                  />
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-purple-200/50 dark:border-purple-700/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1">
                  <label className="flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 mb-3">
                    <span className="text-lg">👨‍�‍�</span>
                    <span>Lezione a 3 Persone</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.priceThree || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceThree: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white border-2 border-purple-300/50 dark:border-purple-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg font-semibold placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="90€"
                  />
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-orange-200/50 dark:border-orange-700/50 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 transform hover:-translate-y-1">
                  <label className="flex items-center gap-2 text-sm font-bold text-orange-600 dark:text-orange-400 mb-3">
                    <span className="text-lg">🏆</span>
                    <span>Partita Lezione</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.priceMatchLesson || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceMatchLesson: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white border-2 border-orange-300/50 dark:border-orange-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-lg font-semibold placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="80€"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                <span className="text-base">💡</span>
                <span className="font-medium">Neural Tip:</span>
                <span>
                  Prezzi per ora di lezione. Impostare a 0 per disabilitare la
                  tipologia.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div>
          <label className={`block ${ds.label} mb-2`}>Specialità</label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {commonSpecialties.map((specialty) => {
              const isSelected = formData.specialties.includes(specialty);
              return (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => {
                    const newSpecialties = isSelected
                      ? formData.specialties.filter((s) => s !== specialty)
                      : [...formData.specialties, specialty];
                    setFormData({ ...formData, specialties: newSpecialties });
                  }}
                  className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {specialty}
                </button>
              );
            })}
          </div>

          {/* Custom Specialty */}
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              className={`flex-1 ${ds.input}`}
              placeholder="Specialità personalizzata..."
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSpecialty())
              }
            />
            <button
              type="button"
              onClick={addSpecialty}
              disabled={!newSpecialty.trim()}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Aggiungi
            </button>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className={`block ${ds.label} mb-2`}>
            Biografia Istruttore
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            maxLength={500}
            className={`w-full ${ds.textarea} resize-none`}
            placeholder="Descrivi l'esperienza e le competenze dell'istruttore..."
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formData.bio.length}/500 caratteri
            </span>
            {formData.bio.length > 450 && (
              <span className="text-xs text-orange-500">
                Limite quasi raggiunto
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
          >
            Annulla
          </button>
          <button
            type="submit"
            className="flex-1 py-2 px-4 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 font-medium transition-colors"
          >
            Salva
          </button>
        </div>
      </form>
    </Modal>
  );
}
