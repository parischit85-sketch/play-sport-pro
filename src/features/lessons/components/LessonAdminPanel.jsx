// =============================================
// FILE: src/features/lessons/components/LessonAdminPanel.jsx
// Pannello amministrazione per la gestione delle lezioni
// =============================================
import React, { useState, useMemo } from 'react';
import Section from '@ui/Section.jsx';
import Badge from '@ui/Badge.jsx';
import Modal from '@ui/Modal.jsx';
import { uid } from '@lib/ids.js';
import {
  createLessonTimeSlotSchema,
  PLAYER_CATEGORIES,
} from '@features/players/types/playerTypes.js';

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
  const [activeSection, setActiveSection] = useState('config');
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState(null);
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  const weekDays = [
    { value: 0, label: 'Domenica' },
    { value: 1, label: 'Lunedì' },
    { value: 2, label: 'Martedì' },
    { value: 3, label: 'Mercoledì' },
    { value: 4, label: 'Giovedì' },
    { value: 5, label: 'Venerdì' },
    { value: 6, label: 'Sabato' },
  ];

  // Potential instructors (non-instructor players who can become instructors)
  const potentialInstructors = useMemo(() => {
    return (players || []).filter((player) => player.category !== PLAYER_CATEGORIES.INSTRUCTOR);
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
          slot.id === editingTimeSlot.id ? { ...slot, ...timeSlotData } : slot
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
    if (confirm('Sei sicuro di voler eliminare questa fascia oraria?')) {
      updateLessonConfig({
        ...lessonConfig,
        timeSlots: (lessonConfig.timeSlots || []).filter((slot) => slot.id !== timeSlotId),
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
    if (confirm('Sei sicuro di voler rimuovere questo giocatore come istruttore?')) {
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
      <div className="border-b border-gray-200 dark:border-gray-600">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'config', label: 'Configurazione Generale', icon: '⚙️' },
            { id: 'timeslots', label: 'Fasce Orarie', icon: '⏰' },
            { id: 'instructors', label: 'Gestione Istruttori', icon: '👨‍🏫' },
            { id: 'cleanup', label: 'Pulizia Dati', icon: '🗑️' },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeSection === section.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <span className="text-base mr-1">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* General Configuration */}
      {activeSection === 'config' && (
        <div className="space-y-6">
          <Section title="Configurazione Sistema Lezioni" variant="minimal" T={T}>
            <div className="space-y-4">
              {/* Enable/Disable System */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h3 className={`${ds.h6} font-medium mb-1`}>Sistema Lezioni</h3>
                  <p className={`text-sm ${T.subtext}`}>
                    {lessonConfig.isEnabled
                      ? 'Il sistema di prenotazione lezioni è attivo'
                      : 'Il sistema di prenotazione lezioni è disattivato'}
                  </p>
                </div>
                <button
                  onClick={toggleLessonSystem}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    lessonConfig.isEnabled
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                  }`}
                >
                  {lessonConfig.isEnabled ? 'Disattiva' : 'Attiva'}
                </button>
              </div>

              {/* Configuration Options */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={`block ${ds.label} mb-2`}>
                    Giorni di Anticipo per Prenotazione
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
                    className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block ${ds.label} mb-2`}>Ore Prima per Cancellazione</label>
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
                    className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* Time Slots Management */}
      {activeSection === 'timeslots' && (
        <div className="space-y-6">
          <Section title="Gestione Fasce Orarie" variant="minimal" T={T}>
            <div className="space-y-4">
              {/* Add Time Slot Button */}
              <button
                onClick={() => setShowTimeSlotModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Aggiungi Fascia Oraria
              </button>

              {/* Time Slots List */}
              {(lessonConfig.timeSlots || []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nessuna fascia oraria configurata. Crea la prima fascia per iniziare.
                </div>
              ) : (
                <div className="space-y-3">
                  {(lessonConfig.timeSlots || []).map((slot) => {
                    const dayName =
                      weekDays.find((d) => d.value === slot.dayOfWeek)?.label || 'Sconosciuto';
                    const availableInstructors = (instructors || []).filter((i) =>
                      slot.instructorIds.includes(i.id)
                    );

                    return (
                      <div key={slot.id} className={`${T.cardBg} ${T.border} ${T.borderMd} p-4`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className={`${ds.h6} font-medium`}>
                                {dayName} • {slot.startTime} - {slot.endTime}
                              </h4>
                              <Badge
                                variant={slot.isActive ? 'success' : 'default'}
                                size="sm"
                                T={T}
                              >
                                {slot.isActive ? 'Attiva' : 'Inattiva'}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Max prenotazioni: {slot.maxBookings}</span>
                              <span>Istruttori: {availableInstructors.length}</span>
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
                                          backgroundColor: instructor.instructorData?.color,
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
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Modifica
                            </button>
                            <button
                              onClick={() => handleDeleteTimeSlot(slot.id)}
                              className="text-red-600 hover:text-red-700"
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
      {activeSection === 'instructors' && (
        <div className="space-y-6">
          <Section title="Gestione Istruttori" variant="minimal" T={T}>
            <div className="space-y-6">
              {/* Current Instructors */}
              <div>
                <h3 className={`${ds.h6} font-medium mb-3`}>
                  Istruttori Attivi ({instructors.length})
                </h3>

                {instructors.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    Nessun istruttore configurato
                  </div>
                ) : (
                  <div className="space-y-3">
                    {instructors.map((instructor) => (
                      <div
                        key={instructor.id}
                        className={`${T.cardBg} ${T.border} ${T.borderMd} p-4`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: instructor.instructorData?.color }}
                            >
                              {instructor.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <h4 className={`${ds.h6} font-medium`}>{instructor.name}</h4>
                              <div className="flex flex-col gap-1 text-sm text-gray-600">
                                {/* Prezzi lezioni */}
                                <div className="flex flex-wrap gap-2">
                                  {instructor.instructorData?.priceSingle > 0 && (
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                                      Singola: €{instructor.instructorData.priceSingle}
                                    </span>
                                  )}
                                  {instructor.instructorData?.priceCouple > 0 && (
                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs">
                                      Coppia: €{instructor.instructorData.priceCouple}
                                    </span>
                                  )}
                                  {instructor.instructorData?.priceThree > 0 && (
                                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs">
                                      Tre: €{instructor.instructorData.priceThree}
                                    </span>
                                  )}
                                  {instructor.instructorData?.priceMatchLesson > 0 && (
                                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded text-xs">
                                      Partita: €{instructor.instructorData.priceMatchLesson}
                                    </span>
                                  )}
                                  {/* Fallback alla tariffa oraria se non ci sono prezzi specifici */}
                                  {!instructor.instructorData?.priceSingle &&
                                    !instructor.instructorData?.priceCouple &&
                                    !instructor.instructorData?.priceThree &&
                                    !instructor.instructorData?.priceMatchLesson &&
                                    instructor.instructorData?.hourlyRate > 0 && (
                                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded text-xs">
                                        €{instructor.instructorData.hourlyRate}/ora
                                      </span>
                                    )}
                                </div>
                                {/* Specialità */}
                                {instructor.instructorData?.specialties?.length > 0 && (
                                  <span>{instructor.instructorData.specialties.join(', ')}</span>
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
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Modifica
                            </button>
                            <button
                              onClick={() => handleRemoveInstructor(instructor.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Rimuovi
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
                <h3 className={`${ds.h6} font-medium mb-3`}>Aggiungi Istruttore</h3>

                {potentialInstructors.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    Tutti i giocatori sono già istruttori o non ci sono giocatori disponibili
                  </div>
                ) : (
                  <div className="space-y-3">
                    {potentialInstructors.slice(0, 5).map((player) => (
                      <div key={player.id} className={`${T.cardBg} ${T.border} ${T.borderMd} p-4`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`${ds.h6} font-medium`}>{player.name}</h4>
                            <p className={`text-sm ${T.subtext}`}>
                              {player.email} • {player.category}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setEditingPlayer(player);
                              setShowInstructorModal(true);
                            }}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                          >
                            Rendi Istruttore
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
      {activeSection === 'cleanup' && (
        <div className="space-y-6">
          <Section title="Pulizia Dati di Test" variant="minimal" T={T}>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <span className="text-xl">⚠️</span>
                  <h3 className="font-semibold">Attenzione</h3>
                </div>
                <p className="text-sm text-yellow-700">
                  Questa sezione permette di cancellare tutte le prenotazioni di lezione di test. Le
                  prenotazioni dei campi associate verranno anche cancellate automaticamente.
                </p>
              </div>

              <div className={`${T.cardBg} ${T.border} ${T.borderMd} p-6 rounded-lg`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`${ds.h6} font-medium`}>Prenotazioni Lezioni Presenti</h3>
                    <p className={`text-sm ${T.subtext}`}>
                      {lessonBookingsCount === 0
                        ? 'Nessuna prenotazione di lezione presente'
                        : lessonBookingsCount === 1
                          ? '1 prenotazione di lezione presente'
                          : `${lessonBookingsCount} prenotazioni di lezione presenti`}
                    </p>
                  </div>
                  <div className="text-3xl">🗑️</div>
                </div>

                {lessonBookingsCount > 0 ? (
                  <div className="space-y-3">
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-sm text-red-700">
                        <strong>Cosa verrà eliminato:</strong>
                        <br />• {lessonBookingsCount} prenotazione/i di lezione
                        <br />
                        • I relativi slot prenotati nei campi
                        <br />• Tutti i dati associati dal localStorage
                      </p>
                    </div>

                    <button
                      onClick={onClearAllLessons}
                      className="w-full px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      🗑️ Cancella Tutte le Prenotazioni di Lezione
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <div className="text-4xl mb-2">✨</div>
                    <p>Nessuna prenotazione di lezione da cancellare</p>
                  </div>
                )}
              </div>

              <div className={`${T.cardBg} ${T.border} ${T.borderMd} p-4 rounded-lg`}>
                <h4 className={`${ds.h6} font-medium mb-2`}>Come funziona la pulizia:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Cancella tutte le prenotazioni di lezione dal localStorage</li>
                  <li>• Cancella i corrispondenti slot prenotati nei campi</li>
                  <li>• Aggiorna automaticamente la vista "Gestione Campi"</li>
                  <li>• Non tocca le configurazioni degli istruttori o le fasce orarie</li>
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
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    instructorIds: [],
    courtIds: [], // Add court selection
    maxBookings: 1,
    isActive: true,
    ...timeSlot,
  }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.startTime || !formData.endTime) {
      alert('Inserisci orario di inizio e fine');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      alert("L'orario di fine deve essere dopo quello di inizio");
      return;
    }

    if (formData.instructorIds.length === 0) {
      alert('Seleziona almeno un istruttore');
      return;
    }

    if (formData.courtIds.length === 0) {
      alert('Seleziona almeno un campo');
      return;
    }

    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={timeSlot ? 'Modifica Fascia Oraria' : 'Aggiungi Fascia Oraria'}
      size="medium"
      T={T}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Day of Week */}
        <div>
          <label className={`block ${ds.label} mb-2`}>Giorno della Settimana *</label>
          <select
            value={formData.dayOfWeek}
            onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
            className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {weekDays.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block ${ds.label} mb-2`}>Ora Inizio *</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div>
            <label className={`block ${ds.label} mb-2`}>Ora Fine *</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>

        {/* Max Bookings */}
        <div>
          <label className={`block ${ds.label} mb-2`}>Numero Massimo Prenotazioni</label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.maxBookings}
            onChange={(e) =>
              setFormData({ ...formData, maxBookings: parseInt(e.target.value) || 1 })
            }
            className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* Instructor Selection */}
        <div>
          <label className={`block ${ds.label} mb-2`}>Istruttori Disponibili *</label>
          <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
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
                        : formData.instructorIds.filter((id) => id !== instructor.id),
                    });
                  }}
                  className="rounded"
                />
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: instructor.instructorData?.color }}
                  ></div>
                  <span>{instructor.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Court Selection */}
        <div>
          <label className={`block ${ds.label} mb-2`}>Campi Disponibili *</label>
          <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
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
                      style={{ backgroundColor: court.surface?.color || '#e5e7eb' }}
                    ></div>
                    <span>{court.name || `Campo ${court.id}`}</span>
                    {court.surface?.type && (
                      <span className={`text-xs px-2 py-1 ${T.cardBg} rounded`}>
                        {court.surface.type}
                      </span>
                    )}
                  </div>
                </label>
              ))}
          </div>
          {(!courts || courts.length === 0) && (
            <p className="text-sm text-gray-500 mt-1">
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
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
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
            {timeSlot ? 'Aggiorna' : 'Crea'} Fascia Oraria
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Instructor Management Modal
function InstructorModal({ isOpen, onClose, player, onSave, T, ds }) {
  const [formData, setFormData] = useState(() => ({
    color: '#3B82F6',
    hourlyRate: 0, // Mantengo per retrocompatibilità
    priceSingle: 0,
    priceCouple: 0,
    priceThree: 0,
    priceMatchLesson: 0,
    specialties: [],
    bio: '',
    certifications: [],
    ...player.instructorData,
  }));

  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCertification, setNewCertification] = useState('');

  const commonSpecialties = ['Padel', 'Tennis', 'Fitness', 'Calcio', 'Basket'];
  const predefinedColors = [
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#84CC16',
    '#F97316',
    '#6366F1',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty.trim()],
      });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter((s) => s !== specialty),
    });
  };

  const addCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, newCertification.trim()],
      });
      setNewCertification('');
    }
  };

  const removeCertification = (certification) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((c) => c !== certification),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configura Istruttore: ${player.name}`}
      size="large"
      T={T}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Color Selection */}
        <div>
          <label className={`block ${ds.label} mb-2`}>Colore Istruttore</label>
          <div className="flex gap-2 mb-2">
            {predefinedColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-8 h-8 rounded-full border-2 ${
                  formData.color === color ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-full h-10 rounded border"
          />
        </div>

        {/* Pricing Section */}
        <div>
          <label className={`block ${ds.label} mb-3`}>Tariffe Lezioni (€)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm ${T.subtext} mb-1`}>Lezione Singola</label>
              <input
                type="number"
                min="0"
                step="5"
                value={formData.priceSingle || 0}
                onChange={(e) =>
                  setFormData({ ...formData, priceSingle: parseFloat(e.target.value) || 0 })
                }
                className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="es. 50"
              />
            </div>

            <div>
              <label className={`block text-sm ${T.subtext} mb-1`}>Lezione di Coppia</label>
              <input
                type="number"
                min="0"
                step="5"
                value={formData.priceCouple || 0}
                onChange={(e) =>
                  setFormData({ ...formData, priceCouple: parseFloat(e.target.value) || 0 })
                }
                className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="es. 70"
              />
            </div>

            <div>
              <label className={`block text-sm ${T.subtext} mb-1`}>Lezione a 3 Persone</label>
              <input
                type="number"
                min="0"
                step="5"
                value={formData.priceThree || 0}
                onChange={(e) =>
                  setFormData({ ...formData, priceThree: parseFloat(e.target.value) || 0 })
                }
                className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="es. 90"
              />
            </div>

            <div>
              <label className={`block text-sm ${T.subtext} mb-1`}>Partita Lezione</label>
              <input
                type="number"
                min="0"
                step="5"
                value={formData.priceMatchLesson || 0}
                onChange={(e) =>
                  setFormData({ ...formData, priceMatchLesson: parseFloat(e.target.value) || 0 })
                }
                className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="es. 80"
              />
            </div>
          </div>
          <p className={`text-xs ${T.subtext} mt-2`}>
            Prezzi per ora di lezione. Lasciare a 0 per disabilitare una tipologia.
          </p>
        </div>

        {/* Specialties */}
        <div>
          <label className={`block ${ds.label} mb-2`}>Specialità</label>

          {/* Quick Add Common Specialties */}
          <div className="flex flex-wrap gap-2 mb-2">
            {commonSpecialties.map((specialty) => (
              <button
                key={specialty}
                type="button"
                onClick={() => {
                  if (!formData.specialties.includes(specialty)) {
                    setFormData({
                      ...formData,
                      specialties: [...formData.specialties, specialty],
                    });
                  }
                }}
                className={`px-3 py-1 text-sm rounded border ${
                  formData.specialties.includes(specialty)
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>

          {/* Custom Specialty */}
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              className={`flex-1 p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Aggiungi specialità personalizzata"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
            />
            <button
              type="button"
              onClick={addSpecialty}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Aggiungi
            </button>
          </div>

          {/* Current Specialties */}
          {formData.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formData.specialties.map((specialty, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  <span>{specialty}</span>
                  <button
                    type="button"
                    onClick={() => removeSpecialty(specialty)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className={`block ${ds.label} mb-2`}>Biografia</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={3}
            className={`w-full p-2 ${T.cardBg} ${T.border} ${T.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Descrizione dell'istruttore, esperienza, etc..."
          />
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
            Salva Istruttore
          </button>
        </div>
      </form>
    </Modal>
  );
}
