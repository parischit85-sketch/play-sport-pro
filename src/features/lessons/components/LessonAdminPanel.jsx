// =============================================
// FILE: src/features/lessons/components/LessonAdminPanel.jsx
// Pannello amministrazione per la gestione delle lezioni
// =============================================
import React, { useState, useMemo, useEffect } from 'react';
import { useNotifications } from '@contexts/NotificationContext';
import Section from '@ui/Section.jsx';
import Badge from '@ui/Badge.jsx';
import Modal from '@ui/Modal.jsx';
import { uid } from '@lib/ids.js';
import {
  createLessonTimeSlotSchema,
  PLAYER_CATEGORIES,
} from '@features/players/types/playerTypes.js';
import { useClub } from '@contexts/ClubContext.jsx';
import { doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';

export default function LessonAdminPanel({
  T,
  ds,
  lessonConfig,
  updateLessonConfig,
  instructors,
  players,
  courts,
  onClearAllLessons,
  lessonBookingsCount,
}) {
  const { updatePlayer, club } = useClub();
  const { showSuccess, showError, showWarning, showInfo, confirm } = useNotifications();
  const [activeSection, setActiveSection] = useState('config');

  // Debug logging per vedere i dati caricati
  console.log('📚 === LESSON ADMIN PANEL - DATI CARICATI ===');
  console.log('🎯 lessonConfig:', JSON.stringify(lessonConfig, null, 2));
  console.log('👨‍🏫 instructors:', JSON.stringify(instructors, null, 2));
  console.log('🎾 courts:', JSON.stringify(courts, null, 2));

  if (lessonConfig?.timeSlots) {
    console.log('⏰ FASCE ORARIE ESISTENTI:');
    lessonConfig.timeSlots.forEach((slot, index) => {
      console.log(`📋 FASCIA ${index + 1}:`, {
        id: slot.id,
        instructorId: slot.instructorId,
        instructor: slot.instructor,
        courtId: slot.courtId,
        courtIds: slot.courtIds,
        court: slot.court,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: slot.isActive,
        selectedDates: slot.selectedDates,
        allFields: Object.keys(slot),
      });
    });
  }
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState(null);
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [instructorSearch, setInstructorSearch] = useState('');

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

  // Filtered potential instructors based on search
  const filteredPotentialInstructors = useMemo(() => {
    if (!instructorSearch.trim()) {
      return potentialInstructors;
    }

    const searchTerm = instructorSearch.toLowerCase().trim();
    return potentialInstructors.filter(
      (player) =>
        player.name?.toLowerCase().includes(searchTerm) ||
        player.email?.toLowerCase().includes(searchTerm)
    );
  }, [potentialInstructors, instructorSearch]);

  // Utility functions for time slot management
  const isTimeSlotExpired = (slot) => {
    if (!slot.selectedDates || slot.selectedDates.length === 0) return false;
    if (!slot.endTime) return false; // Se non c'è orario di fine, non può essere scaduta

    const latestDate = slot.selectedDates.map((date) => new Date(date)).sort((a, b) => b - a)[0]; // Get the latest date

    const now = new Date();

    // Combina la data più recente con l'orario di fine
    const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
    const endDateTime = new Date(latestDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    // La fascia è scaduta solo se l'orario di fine è già passato
    return endDateTime < now;
  };

  const isTimeSlotExpiredForWeek = (slot) => {
    if (!slot.selectedDates || slot.selectedDates.length === 0) return false;
    if (!slot.endTime) return false;

    const latestDate = slot.selectedDates.map((date) => new Date(date)).sort((a, b) => b - a)[0];

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Combina la data più recente con l'orario di fine
    const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
    const endDateTime = new Date(latestDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    // La fascia è scaduta da più di una settimana se l'orario di fine è passato da più di 7 giorni
    return endDateTime < oneWeekAgo;
  };

  const sortTimeSlotsByDate = (slots) => {
    return [...slots].sort((a, b) => {
      const getEarliestDate = (slot) => {
        if (!slot.selectedDates || slot.selectedDates.length === 0) {
          return new Date('2099-12-31'); // Put slots without dates at the end
        }
        return new Date(Math.min(...slot.selectedDates.map((date) => new Date(date))));
      };

      const dateA = getEarliestDate(a);
      const dateB = getEarliestDate(b);

      return dateA - dateB;
    });
  };

  // Clean expired time slots automatically
  useEffect(() => {
    if (!lessonConfig.timeSlots || lessonConfig.timeSlots.length === 0) return;

    const expiredSlots = lessonConfig.timeSlots.filter(isTimeSlotExpiredForWeek);

    if (expiredSlots.length > 0) {
      console.log(`🗑️ Auto-removing ${expiredSlots.length} expired time slots:`, expiredSlots);

      const cleanedTimeSlots = lessonConfig.timeSlots.filter(
        (slot) => !isTimeSlotExpiredForWeek(slot)
      );

      updateLessonConfig({
        ...lessonConfig,
        timeSlots: cleanedTimeSlots,
      });
    }
  }, [lessonConfig.timeSlots, updateLessonConfig]);

  // Separate and sort time slots
  const { activeTimeSlots, expiredTimeSlots } = useMemo(() => {
    const allSlots = lessonConfig.timeSlots || [];
    // Mostra tutte le fasce insieme (sia admin che istruttori)

    const active = allSlots.filter((slot) => !isTimeSlotExpired(slot));
    const expired = allSlots.filter(
      (slot) => isTimeSlotExpired(slot) && !isTimeSlotExpiredForWeek(slot)
    );

    return {
      activeTimeSlots: sortTimeSlotsByDate(active),
      expiredTimeSlots: sortTimeSlotsByDate(expired),
    };
  }, [lessonConfig.timeSlots]);

  // Handle enabling/disabling lesson system
  const toggleLessonSystem = () => {
    updateLessonConfig({
      ...lessonConfig,
      isEnabled: !lessonConfig.isEnabled,
    });
  };

  // Handle time slot management
  const handleSaveTimeSlot = async (timeSlotData) => {
    console.log('💾 === SALVATAGGIO FASCIA ORARIA ===');
    console.log('🔧 timeSlotData:', timeSlotData);
    console.log('🔧 editingTimeSlot:', editingTimeSlot);

    try {
      // Se stiamo modificando una fascia creata dall'istruttore (source: "instructor")
      // dobbiamo aggiornarla direttamente in Firestore, non nel config admin
      if (editingTimeSlot && editingTimeSlot.source === 'instructor') {
        console.log('🎯 Aggiornamento fascia istruttore in Firestore');

        const slotRef = doc(db, 'clubs', club.id, 'timeSlots', editingTimeSlot.id);

        await updateDoc(slotRef, {
          ...timeSlotData,
          updatedAt: Timestamp.now(),
        });

        console.log('✅ Fascia istruttore aggiornata su Firestore');
        setShowTimeSlotModal(false);
        setEditingTimeSlot(null);
        return;
      }

      // Altrimenti, salva nel config admin come prima
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
    } catch (error) {
      console.error('❌ Errore salvataggio fascia oraria:', error);
      showError('Errore durante il salvataggio della fascia oraria');
    }
  };

  const handleDeleteTimeSlot = async (timeSlotId) => {
    const confirmed = await confirm({
      title: 'Elimina fascia oraria',
      message: 'Sei sicuro di voler eliminare questa fascia oraria?',
      variant: 'danger',
      confirmText: 'Elimina',
      cancelText: 'Annulla',
    });
    if (!confirmed) return;

    try {
      // Trova la fascia da eliminare
      const slotToDelete = (lessonConfig.timeSlots || []).find((slot) => slot.id === timeSlotId);

      // Se è una fascia creata dall'istruttore, eliminala da Firestore
      if (slotToDelete && slotToDelete.source === 'instructor') {
        console.log('🗑️ Eliminazione fascia istruttore da Firestore');

        const slotRef = doc(db, 'clubs', club.id, 'timeSlots', timeSlotId);
        await deleteDoc(slotRef);

        console.log('✅ Fascia istruttore eliminata da Firestore');
        return;
      }

      // Altrimenti, eliminala dal config admin
      updateLessonConfig({
        ...lessonConfig,
        timeSlots: (lessonConfig.timeSlots || []).filter((slot) => slot.id !== timeSlotId),
      });
    } catch (error) {
      console.error('❌ Errore eliminazione fascia oraria:', error);
      showError("Errore durante l'eliminazione della fascia oraria");
    }
  };

  // Handle instructor management
  const handleSaveInstructor = async (instructorData) => {
    if (!editingPlayer) return;

    try {
      // Prepara i dati dell'istruttore aggiornati
      const updatedPlayerData = {
        ...editingPlayer,
        category: instructorData.isInstructor
          ? PLAYER_CATEGORIES.INSTRUCTOR
          : editingPlayer.category,
        instructorData: {
          ...editingPlayer.instructorData,
          ...instructorData,
        },
      };

      // Salva su Firebase tramite ClubContext
      if (!updatePlayer) {
        throw new Error('updatePlayer non disponibile - impossibile salvare su Firebase');
      }

      await updatePlayer(editingPlayer.id, updatedPlayerData);
      console.log('✅ Istruttore aggiornato su Firebase:', updatedPlayerData);

      setShowInstructorModal(false);
      setEditingPlayer(null);
    } catch (error) {
      console.error("❌ Errore durante l'aggiornamento dell'istruttore:", error);
      showError('Errore durante il salvataggio delle modifiche. Riprova.');
    }
  };

  const handleActivateAllInstructors = async () => {
    const inactiveInstructors = (players || []).filter(
      (p) =>
        p.category === PLAYER_CATEGORIES.INSTRUCTOR &&
        (p.instructorData?.isInstructor === false || !p.instructorData?.isInstructor)
    );

    if (inactiveInstructors.length === 0) {
      showInfo('Tutti gli istruttori sono già attivi!');
      return;
    }

    const confirmed = await confirm({
      title: 'Attiva istruttori',
      message: `Vuoi attivare ${inactiveInstructors.length} istruttore/i inattivo/i?`,
      variant: 'info',
      confirmText: 'Attiva',
      cancelText: 'Annulla',
    });
    if (!confirmed) return;

    try {
      // Attiva ogni istruttore su Firebase
      if (!updatePlayer) {
        throw new Error('updatePlayer non disponibile - impossibile salvare su Firebase');
      }

      for (const instructor of inactiveInstructors) {
        const updatedInstructorData = {
          ...instructor,
          instructorData: {
            isInstructor: true,
            color: '#3B82F6',
            specialties: [],
            hourlyRate: 0,
            priceSingle: 0,
            priceCouple: 0,
            priceThree: 0,
            priceMatchLesson: 0,
            bio: '',
            certifications: [],
            ...instructor.instructorData, // Mantieni i dati esistenti se ci sono
          },
        };

        await updatePlayer(instructor.id, updatedInstructorData);
      }
      showSuccess(`${inactiveInstructors.length} istruttore/i attivato/i con successo!`);
    } catch (error) {
      console.error("❌ Errore durante l'attivazione degli istruttori:", error);
      showError("Errore durante l'attivazione degli istruttori. Riprova.");
    }
  };

  const handleRemoveInstructor = async (playerId) => {
    const confirmed = await confirm({
      title: 'Rimuovi istruttore',
      message: 'Sei sicuro di voler rimuovere questo giocatore come istruttore?',
      variant: 'warning',
      confirmText: 'Rimuovi',
      cancelText: 'Annulla',
    });
    if (!confirmed) return;

    try {
      const playerToUpdate = (players || []).find((p) => p.id === playerId);
      if (!playerToUpdate) return;

      const updatedPlayerData = {
        ...playerToUpdate,
        category: PLAYER_CATEGORIES.MEMBER,
        instructorData: {
          ...playerToUpdate.instructorData,
          isInstructor: false,
        },
      };

      // Salva su Firebase tramite ClubContext
      if (!updatePlayer) {
        throw new Error('updatePlayer non disponibile - impossibile salvare su Firebase');
      }

      await updatePlayer(playerId, updatedPlayerData);
      console.log('✅ Istruttore rimosso su Firebase:', updatedPlayerData);
    } catch (error) {
      console.error("❌ Errore durante la rimozione dell'istruttore:", error);
      showError("Errore durante la rimozione dell'istruttore. Riprova.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="border-b border-gray-200 border-gray-600 bg-white bg-gray-800 rounded-t-lg">
        <nav className="flex space-x-8 overflow-x-auto px-6 py-2">
          {[
            {
              id: 'config',
              label: 'Configurazione Generale',
              icon: '⚙️',
              color: 'blue',
            },
            {
              id: 'timeslots',
              label: 'Fasce Orarie',
              icon: '⏰',
              color: 'green',
            },
            {
              id: 'instructors',
              label: 'Gestione Istruttori',
              icon: '👨‍🏫',
              color: 'purple',
            },
            { id: 'cleanup', label: 'Pulizia Dati', icon: '🗑️', color: 'red' },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                activeSection === section.id
                  ? `border-${section.color}-500 text-${section.color}-600 text-${section.color}-400 bg-${section.color}-50 bg-${section.color}-900/20 rounded-t-lg`
                  : 'border-transparent text-gray-500 text-gray-400 hover:text-gray-700 hover:text-gray-300 hover:border-gray-300 hover:border-gray-500 hover:bg-gray-50 hover:bg-gray-700/50 rounded-t-lg'
              }`}
            >
              <span className="text-base">{section.icon}</span>
              <span>{section.label}</span>
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
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 from-gray-800 to-gray-700 rounded-xl border border-gray-200 border-gray-600 shadow-sm">
                <div>
                  <h3
                    className={`${ds.h6} font-semibold mb-2 text-gray-900 text-white flex items-center gap-2`}
                  >
                    🎾 Sistema Lezioni
                  </h3>
                  <p className={`text-sm ${T.subtext} max-w-md`}>
                    {lessonConfig.isEnabled
                      ? '✅ Il sistema di prenotazione lezioni è attivo e funzionante'
                      : '❌ Il sistema di prenotazione lezioni è disattivato'}
                  </p>
                </div>
                <button
                  onClick={toggleLessonSystem}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                    lessonConfig.isEnabled
                      ? 'bg-red-900/40 text-red-300 hover:bg-red-900/60 border border-red-300 border-red-700'
                      : 'bg-green-900/40 text-green-300 hover:bg-green-900/60 border border-green-300 border-green-700'
                  }`}
                >
                  {lessonConfig.isEnabled ? '🛑 Disattiva' : '🚀 Attiva'}
                </button>
              </div>

              {/* Configuration Options */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="p-4 bg-white bg-gray-800 rounded-lg border border-gray-200 border-gray-600 shadow-sm">
                  <label
                    className={`block ${ds.label} mb-3 flex items-center gap-2 text-gray-900 text-white font-medium`}
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
                    className={`w-full p-3 bg-gray-50 bg-gray-700 border border-gray-300 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-white`}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Quanto in anticipo si può prenotare
                  </p>
                </div>

                <div className="p-4 bg-white bg-gray-800 rounded-lg border border-gray-200 border-gray-600 shadow-sm">
                  <label
                    className={`block ${ds.label} mb-3 flex items-center gap-2 text-gray-900 text-white font-medium`}
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
                    className={`w-full p-3 bg-gray-50 bg-gray-700 border border-gray-300 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-white`}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Limite per cancellazioni gratuite
                  </p>
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
                className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600"
              >
                + Aggiungi Fascia Oraria
              </button>{' '}
              {/* Time Slots List */}
              {activeTimeSlots.length === 0 && expiredTimeSlots.length === 0 ? (
                <div className={`text-center py-8 ${T.subtext}`}>
                  Nessuna fascia oraria configurata. Crea la prima fascia per iniziare.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Active Time Slots */}
                  {activeTimeSlots.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 text-gray-100 flex items-center gap-2">
                        ✅ Fasce Orarie Attive ({activeTimeSlots.length})
                      </h3>
                      <div className="space-y-3">
                        {activeTimeSlots.map((slot) => {
                          // Support both old format (dayOfWeek) and new format (selectedDates)
                          let displayTitle = '';
                          let dateInfo = '';

                          if (slot.selectedDates && slot.selectedDates.length > 0) {
                            // New format: specific dates
                            const sortedDates = [...slot.selectedDates].sort();
                            if (sortedDates.length === 1) {
                              displayTitle = new Date(sortedDates[0]).toLocaleDateString('it-IT', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              });
                            } else {
                              displayTitle = `${sortedDates.length} date selezionate`;
                              dateInfo = sortedDates
                                .slice(0, 3)
                                .map((date) => new Date(date).toLocaleDateString('it-IT'))
                                .join(', ');
                              if (sortedDates.length > 3) {
                                dateInfo += ` +${sortedDates.length - 3} altre...`;
                              }
                            }
                          } else if (slot.dayOfWeek) {
                            // Old format: day of week (for backward compatibility)
                            const dayName =
                              weekDays.find((d) => d.value === slot.dayOfWeek)?.label ||
                              'Sconosciuto';
                            displayTitle = dayName;
                            dateInfo = 'Ogni settimana';
                          } else {
                            displayTitle = 'Configurazione non valida';
                          }

                          const availableInstructors = (instructors || []).filter((i) =>
                            slot.instructorIds.includes(i.id)
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
                                      {displayTitle} • {slot.startTime} - {slot.endTime}
                                    </h4>
                                    <Badge
                                      variant={slot.isActive ? 'success' : 'default'}
                                      size="sm"
                                      T={T}
                                    >
                                      {slot.isActive ? 'Attiva' : 'Inattiva'}
                                    </Badge>
                                  </div>

                                  {dateInfo && (
                                    <div className="text-sm text-gray-400 mb-2">
                                      {dateInfo}
                                    </div>
                                  )}

                                  <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <span>Max prenotazioni: {slot.maxBookings}</span>
                                    <span>Istruttori: {availableInstructors.length}</span>
                                    <span>
                                      Campi:{' '}
                                      {(slot.courtIds || []).length > 0
                                        ? (courts || [])
                                            .filter((court) =>
                                              (slot.courtIds || []).includes(court.id)
                                            )
                                            .map((court) => court.name)
                                            .join(', ') ||
                                          `${(slot.courtIds || []).length} selezionati`
                                        : 'Nessuno'}
                                    </span>
                                  </div>

                                  {availableInstructors.length > 0 && (
                                    <div className="mt-2">
                                      <div className="flex flex-wrap gap-1">
                                        {availableInstructors.map((instructor) => (
                                          <div
                                            key={instructor.id}
                                            className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300"
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
                                    className="text-blue-600 text-blue-400 hover:text-blue-700 hover:text-blue-300"
                                  >
                                    Modifica
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTimeSlot(slot.id)}
                                    className="text-red-600 text-red-400 hover:text-red-700 hover:text-red-300"
                                  >
                                    Elimina
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Expired Time Slots */}
                  {expiredTimeSlots.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-400 flex items-center gap-2">
                        ⏰ Fasce Orarie Scadute ({expiredTimeSlots.length})
                        <span className="text-sm text-gray-500 text-gray-500 font-normal">
                          (si cancellano automaticamente dopo 1 settimana)
                        </span>
                      </h3>
                      <div className="bg-gray-50 bg-gray-800/50 rounded-lg p-4 border-2 border-dashed border-gray-300 border-gray-600">
                        <div className="space-y-3">
                          {expiredTimeSlots.map((slot) => {
                            // Support both old format (dayOfWeek) and new format (selectedDates)
                            let displayTitle = '';
                            let dateInfo = '';

                            if (slot.selectedDates && slot.selectedDates.length > 0) {
                              // New format: specific dates
                              const sortedDates = [...slot.selectedDates].sort();
                              if (sortedDates.length === 1) {
                                displayTitle = new Date(sortedDates[0]).toLocaleDateString(
                                  'it-IT',
                                  {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  }
                                );
                              } else {
                                displayTitle = `${sortedDates.length} date selezionate`;
                                dateInfo = sortedDates
                                  .slice(0, 3)
                                  .map((date) => new Date(date).toLocaleDateString('it-IT'))
                                  .join(', ');
                                if (sortedDates.length > 3) {
                                  dateInfo += ` +${sortedDates.length - 3} altre...`;
                                }
                              }
                            } else if (slot.dayOfWeek) {
                              // Old format: day of week (for backward compatibility)
                              const dayName =
                                weekDays.find((d) => d.value === slot.dayOfWeek)?.label ||
                                'Sconosciuto';
                              displayTitle = dayName;
                              dateInfo = 'Ogni settimana';
                            } else {
                              displayTitle = 'Configurazione non valida';
                            }

                            const availableInstructors = (instructors || []).filter((i) =>
                              slot.instructorIds.includes(i.id)
                            );

                            return (
                              <div
                                key={slot.id}
                                className={`${T.cardBg} ${T.border} rounded-lg p-4 opacity-60 relative`}
                              >
                                <div className="absolute top-2 right-2">
                                  <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs font-medium rounded-full">
                                    Scaduta
                                  </span>
                                </div>

                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h4
                                        className={`${ds.h6} font-medium text-gray-400`}
                                      >
                                        {displayTitle}
                                      </h4>
                                      <div
                                        className={`px-2 py-1 rounded text-xs font-medium ${
                                          slot.isActive
                                            ? 'bg-green-900/30 text-green-400'
                                            : 'bg-gray-700 text-gray-500 text-gray-400'
                                        }`}
                                      >
                                        {slot.isActive ? 'Attiva' : 'Disattiva'}
                                      </div>
                                    </div>

                                    {dateInfo && (
                                      <p className="text-sm text-gray-500 text-gray-400 mb-2">
                                        {dateInfo}
                                      </p>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                      <span>
                                        🕐 {slot.startTime} - {slot.endTime}
                                      </span>
                                      <span>📊 Max {slot.maxBookings} prenotazioni</span>
                                      <span>
                                        👨‍🏫{' '}
                                        {availableInstructors.length > 0
                                          ? availableInstructors.map((i) => i.name).join(', ')
                                          : 'Nessun istruttore'}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 ml-4">
                                    <button
                                      onClick={() => handleDeleteTimeSlot(slot.id)}
                                      className="p-2 text-red-600 text-red-400 hover:bg-red-50 hover:bg-red-900/30 rounded-lg transition-colors"
                                      title="Elimina fascia oraria"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`${ds.h6} font-medium`}>
                    Tutti gli Istruttori (
                    {
                      (players || []).filter(
                        (p) =>
                          p.category === PLAYER_CATEGORIES.INSTRUCTOR &&
                          p.instructorData?.isInstructor !== false
                      ).length
                    }{' '}
                    attivi,{' '}
                    {
                      (players || []).filter(
                        (p) =>
                          p.category === PLAYER_CATEGORIES.INSTRUCTOR &&
                          (p.instructorData?.isInstructor === false ||
                            !p.instructorData?.isInstructor)
                      ).length
                    }{' '}
                    disattivati)
                  </h3>

                  {/* Pulsante per attivare tutti gli istruttori inattivi */}
                  {(players || []).filter(
                    (p) =>
                      p.category === PLAYER_CATEGORIES.INSTRUCTOR &&
                      (p.instructorData?.isInstructor === false || !p.instructorData?.isInstructor)
                  ).length > 0 && (
                    <button
                      onClick={handleActivateAllInstructors}
                      className="px-3 py-1.5 text-green-600 text-green-400 hover:text-white hover:bg-green-600 hover:bg-green-500 border border-green-600 border-green-400 rounded-lg transition-all duration-200 font-medium text-sm"
                    >
                      ✅ Attiva Tutti
                    </button>
                  )}
                </div>

                {/* Mostra tutti gli istruttori, sia attivi che disattivati */}
                {(players || []).filter((p) => p.category === PLAYER_CATEGORIES.INSTRUCTOR)
                  .length === 0 ? (
                  <div className={`text-center py-6 ${T.subtext}`}>
                    Nessun istruttore configurato
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(players || [])
                      .filter((p) => p.category === PLAYER_CATEGORIES.INSTRUCTOR)
                      .map((instructor) => {
                        const isActive = instructor.instructorData?.isInstructor !== false;
                        return (
                          <div
                            key={instructor.id}
                            className={`${T.cardBg} ${T.border} rounded-lg p-4 hover:shadow-lg hover:shadow-gray-700/50 transition-all duration-200 ${
                              !isActive ? 'opacity-60 border-dashed' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {!isActive && (
                                  <div className="absolute top-2 right-2 bg-red-100 bg-red-900/40 text-red-600 text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                                    🚫 Disattivato
                                  </div>
                                )}
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${
                                    !isActive ? 'grayscale' : ''
                                  }`}
                                  style={{
                                    backgroundColor: instructor.instructorData?.color,
                                  }}
                                >
                                  {instructor.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <h4
                                    className={`${ds.h6} font-medium ${isActive ? 'text-gray-900 text-white' : 'text-gray-500 text-gray-400'}`}
                                  >
                                    {instructor.name}
                                    {isActive && <span className="ml-2 text-green-500">🟢</span>}
                                  </h4>
                                  <div className="flex flex-col gap-2 text-sm">
                                    {/* Prezzi lezioni con design migliorato */}
                                    <div className="flex flex-wrap gap-1.5">
                                      {instructor.instructorData?.priceSingle > 0 && (
                                        <span className="px-2 py-1 bg-blue-900/40 text-blue-200 rounded-full text-xs font-medium border border-blue-200 border-blue-700">
                                          💼 €{instructor.instructorData.priceSingle}
                                        </span>
                                      )}
                                      {instructor.instructorData?.priceCouple > 0 && (
                                        <span className="px-2 py-1 bg-green-100 bg-green-900/40 text-green-800 text-green-200 rounded-full text-xs font-medium border border-green-200 border-green-700">
                                          👥 €{instructor.instructorData.priceCouple}
                                        </span>
                                      )}
                                      {instructor.instructorData?.priceThree > 0 && (
                                        <span className="px-2 py-1 bg-purple-900/40 text-purple-200 rounded-full text-xs font-medium border border-purple-200 border-purple-700">
                                          👥👤 €{instructor.instructorData.priceThree}
                                        </span>
                                      )}
                                      {instructor.instructorData?.priceMatchLesson > 0 && (
                                        <span className="px-2 py-1 bg-orange-100 bg-orange-900/40 text-orange-800 text-orange-200 rounded-full text-xs font-medium border border-orange-200 border-orange-700">
                                          🏆 €{instructor.instructorData.priceMatchLesson}
                                        </span>
                                      )}
                                      {/* Fallback alla tariffa oraria se non ci sono prezzi specifici */}
                                      {!instructor.instructorData?.priceSingle &&
                                        !instructor.instructorData?.priceCouple &&
                                        !instructor.instructorData?.priceThree &&
                                        !instructor.instructorData?.priceMatchLesson &&
                                        instructor.instructorData?.hourlyRate > 0 && (
                                          <span className="px-2 py-1 bg-gray-100 bg-gray-800 text-gray-800 text-gray-200 rounded-full text-xs font-medium border border-gray-200 border-gray-600">
                                            ⏰ €{instructor.instructorData.hourlyRate}
                                            /ora
                                          </span>
                                        )}
                                    </div>
                                    {/* Specialità con design migliorato */}
                                    {instructor.instructorData?.specialties?.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {instructor.instructorData.specialties.map(
                                          (specialty, idx) => (
                                            <span
                                              key={idx}
                                              className="px-2 py-1 bg-indigo-50 bg-indigo-900/30 text-indigo-700 text-indigo-300 rounded text-xs border border-indigo-200 border-indigo-700"
                                            >
                                              ⭐ {specialty}
                                            </span>
                                          )
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
                                  className="px-3 py-1.5 text-blue-600 text-blue-400 hover:text-white hover:bg-blue-600 hover:bg-blue-500 border border-blue-600 border-blue-400 rounded-lg transition-all duration-200 font-medium text-sm"
                                >
                                  ✏️ Modifica
                                </button>
                                <button
                                  onClick={() => handleRemoveInstructor(instructor.id)}
                                  className="px-3 py-1.5 text-red-600 text-red-400 hover:text-white hover:bg-red-600 hover:bg-red-500 border border-red-600 border-red-400 rounded-lg transition-all duration-200 font-medium text-sm"
                                >
                                  🗑️ Rimuovi
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Add Instructor */}
              <div>
                <h3 className={`${ds.h6} font-medium mb-3`}>Aggiungi Istruttore</h3>

                {/* Search field for instructors */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={instructorSearch}
                      onChange={(e) => setInstructorSearch(e.target.value)}
                      placeholder="🔍 Cerca giocatore per nome o email..."
                      className={`w-full px-4 py-3 pl-10 ${T.input} rounded-lg border ${T.border} focus:ring-2 focus:ring-blue-500 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      🔍
                    </div>
                    {instructorSearch && (
                      <button
                        onClick={() => setInstructorSearch('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:text-gray-300"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {instructorSearch && (
                    <p className={`text-sm ${T.subtext} mt-2`}>
                      {filteredPotentialInstructors.length} risultat
                      {filteredPotentialInstructors.length === 1 ? 'o' : 'i'} trovato/i per "
                      {instructorSearch}"
                    </p>
                  )}
                </div>

                {filteredPotentialInstructors.length === 0 ? (
                  <div className={`text-center py-6 ${T.subtext}`}>
                    {instructorSearch
                      ? `Nessun giocatore trovato per "${instructorSearch}"`
                      : 'Tutti i giocatori sono già istruttori o non ci sono giocatori disponibili'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPotentialInstructors.map((player) => (
                      <div
                        key={player.id}
                        className={`${T.cardBg} ${T.border} rounded-lg p-4 hover:shadow-md hover:shadow-gray-700/50 transition-all duration-200`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 from-gray-600 to-gray-800 flex items-center justify-center text-white font-bold shadow-md">
                              {player.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <h4 className={`${ds.h6} font-medium text-gray-900 text-white`}>
                                {player.name}
                              </h4>
                              <p className={`text-sm ${T.subtext} flex items-center gap-2`}>
                                <span>📧 {player.email}</span>
                                <span>•</span>
                                <span className="px-2 py-0.5 bg-gray-700 rounded text-xs font-medium">
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
                            className="px-4 py-2 bg-green-100 bg-green-900/40 text-green-800 text-green-200 rounded-lg hover:bg-green-200 hover:bg-green-900/60 border border-green-300 border-green-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            ➕ Rendi Istruttore
                          </button>
                        </div>
                      </div>
                    ))}
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
              <div className="bg-yellow-50 bg-yellow-900/20 border border-yellow-200 border-yellow-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800 text-yellow-200 mb-2">
                  <span className="text-xl">⚠️</span>
                  <h3 className="font-semibold">Attenzione</h3>
                </div>
                <p className="text-sm text-yellow-700 text-yellow-300">
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
                    <div className="bg-red-50 bg-red-900/20 border border-red-200 border-red-700 rounded p-3">
                      <p className="text-sm text-red-700 text-red-300">
                        <strong>Cosa verrà eliminato:</strong>
                        <br />• {lessonBookingsCount} prenotazione/i di lezione
                        <br />
                        • I relativi slot prenotati nei campi
                        <br />• Tutti i dati associati dal localStorage
                      </p>
                    </div>

                    <button
                      onClick={onClearAllLessons}
                      className="w-full px-4 py-3 bg-red-700 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
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

              <div className={`${T.cardBg} ${T.border} ${T.borderMd} p-4 rounded-lg`}>
                <h4 className={`${ds.h6} font-medium mb-2`}>Come funziona la pulizia:</h4>
                <ul className={`text-sm space-y-1 ${T.subtext}`}>
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
          showWarning={showWarning}
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

// Simplified Time Slot Management Modal
function TimeSlotModal({
  isOpen,
  onClose,
  timeSlot,
  instructors,
  courts,
  weekDays,
  onSave,
  showWarning,
  T,
  ds,
}) {
  const [formData, setFormData] = useState({
    selectedDate: '', // Data specifica selezionata
    instructorId: '', // Un solo istruttore
    startTime: '14:00',
    endTime: '15:00',
    maxBookings: 5,
    courtIds: [], // Tutti i campi selezionati di default
    isActive: true,
  });

  // Calendar functionality
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Initialize form data
  useEffect(() => {
    if (timeSlot) {
      // For editing existing time slot
      let selectedDate = '';
      if (timeSlot.selectedDates && timeSlot.selectedDates.length > 0) {
        selectedDate = timeSlot.selectedDates[0];
      } else if (timeSlot.dayOfWeek !== undefined) {
        // Create a date for the current week based on dayOfWeek
        const today = new Date();
        const currentDay = today.getDay();
        const diff = timeSlot.dayOfWeek - currentDay;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + diff + (diff < 0 ? 7 : 0)); // Next occurrence of this day
        selectedDate = targetDate.toISOString().split('T')[0];
      }

      setFormData({
        selectedDate,
        instructorId: timeSlot.instructorIds?.[0] || '',
        startTime: timeSlot.startTime || '14:00',
        endTime: timeSlot.endTime || '15:00',
        maxBookings: timeSlot.maxBookings || 5,
        courtIds: timeSlot.courtIds || (courts ? courts.map((c) => c.id) : []),
        isActive: timeSlot.isActive !== undefined ? timeSlot.isActive : true,
      });
    } else {
      // Reset form for new time slot - default all courts selected
      setFormData({
        selectedDate: '',
        instructorId: '',
        startTime: '14:00',
        endTime: '15:00',
        maxBookings: 5,
        courtIds: courts ? courts.map((c) => c.id) : [],
        isActive: true,
      });
    }
  }, [timeSlot, isOpen, courts]);

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
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        dateStr,
        isSelected: formData.selectedDate === dateStr,
        isPast: new Date(dateStr) < new Date().setHours(0, 0, 0, 0),
      });
    }

    return days;
  };

  const selectDate = (dateStr) => {
    setFormData({ ...formData, selectedDate: dateStr });
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

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

  const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.startTime || !formData.endTime) {
      showWarning('Inserisci orario di inizio e fine');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      showWarning("L'orario di fine deve essere dopo quello di inizio");
      return;
    }

    if (!formData.selectedDate) {
      showWarning('Seleziona una data dal calendario');
      return;
    }

    if (!formData.instructorId) {
      showWarning('Seleziona un istruttore');
      return;
    }

    if (formData.courtIds.length === 0) {
      showWarning('Seleziona almeno un campo');
      return;
    }

    // Convert data to match the expected schema
    const selectedDateObj = new Date(formData.selectedDate);
    const timeSlotData = {
      ...formData,
      instructorIds: [formData.instructorId], // Convert single instructor to array
      dayOfWeek: selectedDateObj.getDay(), // Convert date to day of week (0=Sunday, 1=Monday, etc.)
      selectedDates: [formData.selectedDate], // Keep for backward compatibility
    };

    // Remove the single instructorId as we now have instructorIds array
    delete timeSlotData.instructorId;
    delete timeSlotData.selectedDate;

    console.log('🔧 DEBUG TimeSlotModal - Converted data:', timeSlotData);
    onSave(timeSlotData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={timeSlot ? 'Modifica Fascia Oraria' : 'Aggiungi Fascia Oraria'}
      size="extraLarge"
      T={T}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Layout - Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Calendar */}
          <div className="space-y-4">
            {/* Date Calendar Selector */}
            <div>
              <label className={`block ${ds.label} mb-3 text-lg font-semibold`}>
                📅 Seleziona Data *
              </label>
              <div
                className={`border-2 rounded-lg p-4 ${T.border} bg-white bg-gray-900 shadow-sm`}
              >
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 border-gray-700">
                  <button
                    type="button"
                    onClick={() => navigateMonth(-1)}
                    className="p-3 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-gray-900 hover:text-gray-100 font-bold text-lg"
                  >
                    ←
                  </button>
                  <h3 className="text-xl font-bold text-gray-900 text-gray-100 capitalize">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigateMonth(1)}
                    className="p-3 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-gray-900 hover:text-gray-100 font-bold text-lg"
                  >
                    →
                  </button>
                </div>

                {/* Day names header */}
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {dayNames.map((dayName) => (
                    <div
                      key={dayName}
                      className="text-center text-sm font-bold text-gray-300 p-2 bg-gray-50 bg-gray-800 rounded"
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
                        onClick={() => !dayData.isPast && selectDate(dayData.dateStr)}
                        disabled={dayData.isPast}
                        className={`
                          p-3 text-sm rounded-lg border-2 transition-all duration-200 font-semibold min-h-[2.5rem] flex items-center justify-center
                          ${
                            dayData.isPast
                              ? 'text-gray-400 text-gray-600 cursor-not-allowed bg-gray-100 bg-gray-800 border-gray-200 border-gray-700'
                              : 'hover:shadow-md cursor-pointer transform hover:scale-105'
                          }
                          ${
                            dayData.isSelected
                              ? 'bg-blue-600 bg-blue-500 text-white border-blue-600 border-blue-500 shadow-lg shadow-blue-500/30'
                              : dayData.isPast
                                ? ''
                                : 'border-gray-300 border-gray-600 bg-white bg-gray-800 text-gray-900 text-gray-100 hover:bg-blue-50 hover:bg-gray-700 hover:border-blue-300 hover:border-blue-500'
                          }
                        `}
                      >
                        {dayData.day}
                      </button>
                    );
                  })}
                </div>

                {/* Selected date display */}
                {formData.selectedDate && (
                  <div className="mt-4 p-3 bg-blue-50 bg-blue-900/30 rounded-lg border border-blue-200 border-blue-700">
                    <p className="text-sm font-bold text-blue-800 text-blue-200">
                      📅 Data selezionata:{' '}
                      {new Date(formData.selectedDate).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Instructor Selection */}
            <div>
              <label className={`block ${ds.label} mb-3 text-lg font-semibold`}>
                👨‍🏫 Istruttore *
              </label>
              <select
                value={formData.instructorId}
                onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                className={`w-full p-3 ${T.cardBg} ${T.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-blue-400 ${T.text} font-medium`}
                required
              >
                <option value="">Seleziona un istruttore</option>
                {instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-4">
            {/* Time Range */}
            <div>
              <label className={`block ${ds.label} mb-3 text-lg font-semibold`}>⏰ Orario</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${ds.label} mb-2`}>Ora Inizio *</label>
                  <div className="flex items-center gap-2">
                    {/* Ora Inizio */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 whitespace-nowrap">Ora</span>
                      <select
                        value={formData.startTime ? formData.startTime.split(':')[0] : ''}
                        onChange={(e) => {
                          const hour = e.target.value;
                          const currentMinutes = formData.startTime
                            ? formData.startTime.split(':')[1]
                            : '00';
                          setFormData({
                            ...formData,
                            startTime: hour ? `${hour}:${currentMinutes}` : '',
                          });
                        }}
                        className={`w-16 p-2 ${T.cardBg} ${T.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-blue-400 ${T.text} font-medium text-sm`}
                      >
                        <option value="">--</option>
                        {Array.from({ length: 13 }, (_, i) => i + 11).map((hour) => (
                          <option key={hour} value={String(hour).padStart(2, '0')}>
                            {String(hour).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 whitespace-nowrap">Minuti</span>
                      <select
                        value={formData.startTime ? formData.startTime.split(':')[1] : ''}
                        onChange={(e) => {
                          const minutes = e.target.value;
                          const currentHour = formData.startTime
                            ? formData.startTime.split(':')[0]
                            : '';
                          setFormData({
                            ...formData,
                            startTime: currentHour ? `${currentHour}:${minutes}` : '',
                          });
                        }}
                        className={`w-16 p-2 ${T.cardBg} ${T.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-blue-400 ${T.text} font-medium text-sm`}
                      >
                        <option value="">--</option>
                        <option value="00">00</option>
                        <option value="30">30</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={`block ${ds.label} mb-2`}>Ora Fine *</label>
                  <div className="flex items-center gap-2">
                    {/* Ora Fine */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 whitespace-nowrap">Ora</span>
                      <select
                        value={formData.endTime ? formData.endTime.split(':')[0] : ''}
                        onChange={(e) => {
                          const hour = e.target.value;
                          const currentMinutes = formData.endTime
                            ? formData.endTime.split(':')[1]
                            : '00';
                          setFormData({
                            ...formData,
                            endTime: hour ? `${hour}:${currentMinutes}` : '',
                          });
                        }}
                        className={`w-16 p-2 ${T.cardBg} ${T.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-blue-400 ${T.text} font-medium text-sm`}
                      >
                        <option value="">--</option>
                        {Array.from({ length: 13 }, (_, i) => i + 11).map((hour) => (
                          <option key={hour} value={String(hour).padStart(2, '0')}>
                            {String(hour).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 whitespace-nowrap">Minuti</span>
                      <select
                        value={formData.endTime ? formData.endTime.split(':')[1] : ''}
                        onChange={(e) => {
                          const minutes = e.target.value;
                          const currentHour = formData.endTime
                            ? formData.endTime.split(':')[0]
                            : '';
                          setFormData({
                            ...formData,
                            endTime: currentHour ? `${currentHour}:${minutes}` : '',
                          });
                        }}
                        className={`w-16 p-2 ${T.cardBg} ${T.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-blue-400 ${T.text} font-medium text-sm`}
                      >
                        <option value="">--</option>
                        <option value="00">00</option>
                        <option value="30">30</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Max Bookings */}
            <div>
              <label className={`block ${ds.label} mb-2`}>📊 Numero Massimo Prenotazioni</label>
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
                className={`w-full p-3 ${T.cardBg} ${T.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-blue-400 ${T.text} font-medium`}
              />
            </div>

            {/* Active Toggle */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 from-green-900/20 to-emerald-900/20 rounded-lg p-4 border border-green-200 border-green-700">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-blue-600 bg-gray-700 border-gray-300 border-gray-600 focus:ring-blue-500 focus:ring-blue-400 w-5 h-5"
                />
                <label
                  htmlFor="isActive"
                  className="font-semibold text-green-700 text-green-300"
                >
                  ✅ Fascia oraria attiva
                </label>
              </div>
            </div>

            {/* Court Selection */}
            <div>
              <label className={`block ${ds.label} mb-3 text-lg font-semibold`}>
                🏟️ Campi Disponibili *
              </label>
              <div
                className={`space-y-2 border-2 rounded-lg p-3 ${T.border} bg-white bg-gray-900 shadow-sm`}
              >
                {courts &&
                  courts.map((court) => (
                    <label
                      key={court.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 hover:bg-gray-800 cursor-pointer transition-colors"
                    >
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
                        className="rounded text-blue-600 bg-gray-700 border-gray-300 border-gray-600 focus:ring-blue-500 focus:ring-blue-400 w-4 h-4"
                      />
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded border-2 border-white border-gray-700 shadow-sm"
                          style={{
                            backgroundColor: court.surface?.color || '#e5e7eb',
                          }}
                        ></div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 text-gray-100">
                            {court.name || `Campo ${court.id}`}
                          </span>
                          {court.surface?.type && (
                            <span className="text-xs px-2 py-1 bg-gray-700 text-gray-400 rounded mt-1 self-start">
                              {court.surface.type}
                            </span>
                          )}
                        </div>
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
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t border-gray-200 border-gray-600 mt-6">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-3 px-6 ${T.cardBg} ${T.border} rounded-lg hover:bg-gray-50 hover:bg-gray-700 ${T.text} font-semibold transition-colors text-lg`}
          >
            ❌ Annulla
          </button>
          <button
            type="submit"
            className="flex-1 py-3 px-6 bg-blue-700 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors text-lg shadow-lg"
          >
            {timeSlot ? '✏️ Aggiorna' : '➕ Crea'} Fascia Oraria
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
    isInstructor: true, // Default attivo per nuovi istruttori
    ...player.instructorData,
  }));

  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCertification, setNewCertification] = useState('');

  const commonSpecialties = ['Padel', 'Tennis', 'Fitness'];
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
                    ? 'border-gray-800 border-white scale-110 shadow-lg'
                    : 'border-gray-300 border-gray-600 hover:border-gray-500 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color }}
                title={`Seleziona colore ${color}`}
              >
                {formData.color === color && <span className="text-white text-xs">✓</span>}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-12 h-8 rounded border cursor-pointer"
              title="Colore personalizzato"
            />
            <span className="text-sm text-gray-400">
              Colore: {formData.color}
            </span>
          </div>
        </div>

        {/* Attiva/Disattiva Istruttore */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 from-emerald-900/20 to-green-900/20 rounded-lg p-4 border border-emerald-200 border-emerald-700">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.isInstructor}
                onChange={(e) => setFormData({ ...formData, isInstructor: e.target.checked })}
                className="sr-only"
              />
              <div
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                  formData.isInstructor
                    ? 'bg-emerald-600 border-emerald-600 shadow-lg'
                    : 'bg-white bg-gray-700 border-gray-300 border-gray-600 group-hover:border-emerald-400'
                }`}
              >
                {formData.isInstructor && <span className="text-white text-sm font-bold">✓</span>}
              </div>
            </div>
            <div>
              <span
                className={`${ds.label} font-semibold ${formData.isInstructor ? 'text-emerald-700 text-emerald-300' : ''}`}
              >
                🎯 Attiva Istruttore
              </span>
              <p className="text-sm text-gray-400 mt-1">
                {formData.isInstructor
                  ? "L'istruttore è attivo e può ricevere prenotazioni"
                  : "L'istruttore è disattivato e non comparirà nelle prenotazioni"}
              </p>
            </div>
          </label>
        </div>

        {/* Pricing Section */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-white/90 bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 border-gray-700/50">
            <label className={`block ${ds.label} mb-2`}>Tariffe (€/ora)</label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative p-4 bg-white/80 bg-gray-800/80 backdrop-blur-sm rounded-lg border border-blue-200/50 border-blue-700/50 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1">
                  <label className="flex items-center gap-2 text-sm font-bold text-blue-600 text-blue-400 mb-3">
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
                    className="w-full p-3 bg-white/90 bg-gray-900/90 text-gray-900 text-white border-2 border-blue-300/50 border-blue-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg font-semibold placeholder-gray-400 placeholder-gray-500"
                    placeholder="50€"
                  />
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative p-4 bg-white/80 bg-gray-800/80 backdrop-blur-sm rounded-lg border border-green-200/50 border-green-700/50 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-1">
                  <label className="flex items-center gap-2 text-sm font-bold text-green-600 text-green-400 mb-3">
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
                    className="w-full p-3 bg-white/90 bg-gray-900/90 text-gray-900 text-white border-2 border-green-300/50 border-green-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg font-semibold placeholder-gray-400 placeholder-gray-500"
                    placeholder="70€"
                  />
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative p-4 bg-white/80 bg-gray-800/80 backdrop-blur-sm rounded-lg border border-purple-200/50 border-purple-700/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1">
                  <label className="flex items-center gap-2 text-sm font-bold text-purple-600 text-purple-400 mb-3">
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
                    className="w-full p-3 bg-white/90 bg-gray-900/90 text-gray-900 text-white border-2 border-purple-300/50 border-purple-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg font-semibold placeholder-gray-400 placeholder-gray-500"
                    placeholder="90€"
                  />
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative p-4 bg-white/80 bg-gray-800/80 backdrop-blur-sm rounded-lg border border-orange-200/50 border-orange-700/50 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 transform hover:-translate-y-1">
                  <label className="flex items-center gap-2 text-sm font-bold text-orange-600 text-orange-400 mb-3">
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
                    className="w-full p-3 bg-white/90 bg-gray-900/90 text-gray-900 text-white border-2 border-orange-300/50 border-orange-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-lg font-semibold placeholder-gray-400 placeholder-gray-500"
                    placeholder="80€"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 from-blue-900/20 to-indigo-900/20 rounded-lg border border-blue-200/50 border-blue-700/50">
              <div className="flex items-center gap-2 text-xs text-blue-700 text-blue-300">
                <span className="text-base">💡</span>
                <span className="font-medium">Neural Tip:</span>
                <span>Prezzi per ora di lezione. Impostare a 0 per disabilitare la tipologia.</span>
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
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-200 hover:bg-gray-600'
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
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
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
          <label className={`block ${ds.label} mb-2`}>Biografia Istruttore</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            maxLength={500}
            className={`w-full ${ds.textarea} resize-none`}
            placeholder="Descrivi l'esperienza e le competenze dell'istruttore..."
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-400">
              {formData.bio.length}/500 caratteri
            </span>
            {formData.bio.length > 450 && (
              <span className="text-xs text-orange-500">Limite quasi raggiunto</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 border-gray-600">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-gray-700 text-gray-300 border border-gray-300 border-gray-600 rounded hover:bg-gray-200 hover:bg-gray-600 font-medium transition-colors"
          >
            Annulla
          </button>
          <button
            type="submit"
            className="flex-1 py-2 px-4 bg-blue-600 bg-blue-700 text-white rounded hover:bg-blue-700 hover:bg-blue-600 font-medium transition-colors"
          >
            Salva
          </button>
        </div>
      </form>
    </Modal>
  );
}






