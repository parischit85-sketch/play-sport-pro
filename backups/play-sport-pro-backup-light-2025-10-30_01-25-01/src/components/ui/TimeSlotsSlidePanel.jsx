// Genera array ore e minuti validi
const hourOptions = Array.from({ length: 18 }, (_, i) => (i + 6).toString().padStart(2, '0'));
const minuteOptions = ['00', '30'];

// Helpers per gestire il cambio selezione
const getHour = (value) => (value ? value.split(':')[0] : '');
const getMinute = (value) => (value ? value.split(':')[1] : '');
const setTime = (prev, field, hour, minute) => ({
  ...prev,
  [field]: `${hour}:${minute}`,
});
// Arrotonda i minuti a 00 o 30
const roundMinutes = (value) => {
  if (!value) return value;
  const [h, m] = value.split(':');
  let minutes = parseInt(m, 10);
  if (minutes < 15) minutes = 0;
  else if (minutes < 45) minutes = 30;
  else minutes = 0;
  return `${h.padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
import React, { useState } from 'react';
import { X, Edit, Copy, Plus, Power, PowerOff, Calendar, Clock, User, MapPin } from 'lucide-react';

function TimeSlotsSlidePanel({
  isOpen,
  onClose,
  timeSlots = [],
  instructors = [],
  courts = [],
  onEditTimeSlot,
  onCreateTimeSlot,
  onDuplicateTimeSlot,
  onToggleTimeSlot,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [editingData, setEditingData] = useState({});

  // Debug logging ottimizzato
  console.log('🔍 TimeSlotsSlidePanel - DATI CORRETTI:', {
    timeSlotsCount: timeSlots?.length || 0,
    instructorsCount: instructors?.length || 0,
    slotsWithInstructorIds: timeSlots?.filter((slot) => slot.instructorIds?.length > 0).length || 0,
    slotsWithCourtIds: timeSlots?.filter((slot) => slot.courtIds?.length > 0).length || 0,
    sampleSlot: timeSlots?.[0]
      ? {
          id: timeSlots[0].id,
          instructorIds: timeSlots[0].instructorIds,
          courtIds: timeSlots[0].courtIds,
        }
      : null,
  });

  // Enhanced instructor information retrieval
  const getInstructorInfo = (slot) => {
    if (!slot || !instructors || instructors.length === 0) {
      return null;
    }

    let instructorId = null;

    if (slot.instructorIds && Array.isArray(slot.instructorIds) && slot.instructorIds.length > 0) {
      instructorId = slot.instructorIds[0];
    } else if (slot.instructorId) {
      instructorId = slot.instructorId;
    } else if (slot.instructor?.id || slot.instructor?.playerId || slot.instructor?.userId) {
      instructorId = slot.instructor.id || slot.instructor.playerId || slot.instructor.userId;
    }

    if (!instructorId) return null;

    const foundInstructor = instructors.find(
      (instructor) =>
        instructor.id === instructorId ||
        instructor.playerId === instructorId ||
        instructor.userId === instructorId
    );

    return foundInstructor || null;
  };

  // Get instructor display name with multiple fallbacks
  const getInstructorDisplayName = (instructor) => {
    if (!instructor) return 'Maestro non assegnato';

    return (
      instructor.displayName ||
      instructor.name ||
      (instructor.firstName && instructor.lastName
        ? `${instructor.firstName} ${instructor.lastName}`
        : null) ||
      instructor.firstName ||
      instructor.lastName ||
      instructor.username ||
      instructor.email ||
      `Maestro ID: ${instructor.id || instructor.playerId || instructor.userId}`
    );
  };

  // Get court names from court IDs (can be multiple courts)
  const getCourtNames = (slot) => {
    if (!slot || !courts || courts.length === 0) {
      return 'Campi non specificati';
    }

    let courtIds = [];

    if (slot.courtIds && Array.isArray(slot.courtIds)) {
      courtIds = slot.courtIds;
    } else if (slot.courtId) {
      courtIds = [slot.courtId];
    } else if (slot.court?.id) {
      courtIds = [slot.court.id];
    }

    if (courtIds.length === 0) return 'Campi non specificati';

    const courtNames = courtIds.map((courtId) => {
      const court = courts.find((c) => c.id === courtId);
      return court ? court.name : `Campo ${courtId}`;
    });

    return courtNames.length > 1 ? courtNames.join(', ') : courtNames[0];
  };

  // Get court names as array for individual display
  const getCourtNamesArray = (slot) => {
    if (!slot || !courts || courts.length === 0) {
      return ['Campi non specificati'];
    }

    let courtIds = [];

    if (slot.courtIds && Array.isArray(slot.courtIds)) {
      courtIds = slot.courtIds;
    } else if (slot.courtId) {
      courtIds = [slot.courtId];
    } else if (slot.court?.id) {
      courtIds = [slot.court.id];
    }

    if (courtIds.length === 0) return ['Campi non specificati'];

    return courtIds.map((courtId) => {
      const court = courts.find((c) => c.id === courtId);
      return court ? court.name : `Campo ${courtId}`;
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time;
  };

  const getDayName = (dayOfWeek) => {
    const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    return days[dayOfWeek] || `Giorno ${dayOfWeek}`;
  };

  // Filter and sort time slots
  const filteredTimeSlots = timeSlots
    .filter((slot) => {
      // Filtro 1: Filtra le fasce orarie passate
      const now = new Date();
      const today = now.getDay(); // 0 = Domenica, 1 = Lunedì, etc.
      const currentTime = now.getHours() * 60 + now.getMinutes(); // minuti dall'inizio giornata
      const currentDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

      // Caso 1: Fascia con date specifiche (selectedDates)
      if (
        slot.selectedDates &&
        Array.isArray(slot.selectedDates) &&
        slot.selectedDates.length > 0
      ) {
        // Controlla se almeno una delle date è oggi o nel futuro
        const hasFutureDate = slot.selectedDates.some((dateStr) => {
          const slotDate = new Date(dateStr);
          const slotDateStr = slotDate.toISOString().split('T')[0];

          // Se la data è nel futuro, la fascia è valida
          if (slotDateStr > currentDateStr) return true;

          // Se la data è oggi, controlla l'orario di fine
          if (slotDateStr === currentDateStr && slot.endTime) {
            const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
            const slotEndTime = endHours * 60 + endMinutes;
            return slotEndTime > currentTime;
          }

          return false;
        });

        if (!hasFutureDate) return false; // Tutte le date sono passate
      }
      // Caso 2: Fascia ricorrente (dayOfWeek) - controlla solo se è per oggi
      else if (slot.dayOfWeek === today && slot.endTime) {
        const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
        const slotEndTime = endHours * 60 + endMinutes;

        // Se la fascia è già terminata oggi, non mostrarla
        if (slotEndTime <= currentTime) {
          return false;
        }
      }

      // Filtro 2: Ricerca testuale
      if (!searchTerm) return true;

      const instructor = getInstructorInfo(slot);
      const instructorName = getInstructorDisplayName(instructor).toLowerCase();
      const courtNames = getCourtNames(slot).toLowerCase();
      const dayName = getDayName(slot.dayOfWeek).toLowerCase();
      const timeRange = `${formatTime(slot.startTime)}-${formatTime(slot.endTime)}`.toLowerCase();

      const searchLower = searchTerm.toLowerCase();

      return (
        instructorName.includes(searchLower) ||
        courtNames.includes(searchLower) ||
        dayName.includes(searchLower) ||
        timeRange.includes(searchLower)
      );
    })
    .sort((a, b) => {
      // Sort by selected dates first (if any)
      if (
        a.selectedDates &&
        a.selectedDates.length > 0 &&
        b.selectedDates &&
        b.selectedDates.length > 0
      ) {
        const dateA = new Date(a.selectedDates[0]);
        const dateB = new Date(b.selectedDates[0]);
        return dateA - dateB;
      }

      // Prioritize slots with selected dates
      if (a.selectedDates && a.selectedDates.length > 0) return -1;
      if (b.selectedDates && b.selectedDates.length > 0) return 1;

      // For recurring slots, sort by day of week proximity to today
      const today = new Date().getDay();

      const getDaysFromToday = (dayOfWeek) => {
        const diff = dayOfWeek - today;
        return diff >= 0 ? diff : diff + 7;
      };

      const daysFromTodayA = getDaysFromToday(a.dayOfWeek);
      const daysFromTodayB = getDaysFromToday(b.dayOfWeek);

      if (daysFromTodayA !== daysFromTodayB) {
        return daysFromTodayA - daysFromTodayB;
      }

      // For same day, sort by time
      const timeA = a.startTime ? a.startTime.replace(':', '') : '0000';
      const timeB = b.startTime ? b.startTime.replace(':', '') : '0000';
      return timeA.localeCompare(timeB);
    });

  const handleEdit = (slot) => {
    console.log('🔧 Edit time slot:', slot.id);
    if (editingSlotId === slot.id) {
      handleSaveEdit(slot);
    } else {
      setEditingSlotId(slot.id);
      setEditingData({
        startTime: slot.startTime || '',
        endTime: slot.endTime || '',
        courtIds: slot.courtIds || [],
      });
    }
  };

  const handleSaveEdit = (slot) => {
    console.log('💾 Save time slot:', slot.id, editingData);
    if (onEditTimeSlot) {
      const updatedSlot = {
        ...slot,
        startTime: editingData.startTime,
        endTime: editingData.endTime,
        courtIds: editingData.courtIds,
      };
      onEditTimeSlot(updatedSlot);
    }
    setEditingSlotId(null);
    setEditingData({});
  };

  const handleCancelEdit = () => {
    setEditingSlotId(null);
    setEditingData({});
  };

  const handleCreate = () => {
    console.log('➕ Create new time slot');
    if (onCreateTimeSlot) {
      onCreateTimeSlot();
    }
  };

  const handleDuplicate = (slot) => {
    console.log('📋 Duplicate time slot:', slot.id);
    if (onDuplicateTimeSlot) {
      onDuplicateTimeSlot(slot);
    }
  };

  const handleToggle = async (slot) => {
    console.log('🔄 Toggle time slot:', slot.id, 'Current status:', slot.isActive);
    if (onToggleTimeSlot) {
      try {
        await onToggleTimeSlot(slot);
      } catch (error) {
        console.error('❌ Error toggling time slot:', error);
      }
    }
  };

  const handleDelete = async (slot) => {
    if (!window.confirm('Vuoi eliminare questa fascia oraria?')) return;
    try {
      if (typeof slot.id === 'undefined') return;
      const updatedSlots = timeSlots.filter((s) => s.id !== slot.id);
      if (onEditTimeSlot) {
        // Passa null per segnalare la cancellazione
        onEditTimeSlot({ ...slot, delete: true });
      }
      if (typeof window.updateLessonConfig === 'function') {
        await window.updateLessonConfig({ ...window.lessonConfig, timeSlots: updatedSlots });
      }
    } catch (error) {
      alert("Errore durante l'eliminazione della fascia oraria");
    }
  };

  const toggleCourtSelection = (courtId) => {
    setEditingData((prev) => {
      const currentIds = prev.courtIds || [];
      const newIds = currentIds.includes(courtId)
        ? currentIds.filter((id) => id !== courtId)
        : [...currentIds, courtId];
      return { ...prev, courtIds: newIds };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop - nascosto su mobile (fullscreen), visibile su desktop */}
      <div className="hidden md:flex flex-1 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Panel - fullscreen su mobile, side panel su desktop */}
      <div className="w-full md:w-[48rem] lg:w-[56rem] bg-white/95 bg-gray-900/95 backdrop-blur-xl shadow-2xl md:border-l border-white/20 border-gray-700/30 flex flex-col">
        {/* Header */}
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200/30 border-gray-700/30 bg-gradient-to-r from-blue-50/80 to-purple-50/80 from-gray-800/80 to-gray-700/80">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 text-white truncate">
                ⏰ Fasce Orarie Maestri
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 text-gray-300 mt-0.5 sm:mt-1">
                {filteredTimeSlots.length} di {timeSlots.length} fasce
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/50 hover:bg-gray-700/50 transition-colors flex-shrink-0"
              title="Chiudi"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-2 sm:p-3 lg:p-4 border-b border-gray-200/30 border-gray-700/30">
          <div className="relative">
            <input
              type="text"
              placeholder="Cerca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 sm:pl-4 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-200 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 bg-gray-800/70 backdrop-blur-sm text-gray-900 text-white placeholder-gray-500 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Create Button */}
        <div className="p-2 sm:p-3 lg:p-4 border-b border-gray-200/30 border-gray-700/30">
          <button
            onClick={handleCreate}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2.5 sm:py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base font-semibold min-h-[48px]"
          >
            <Plus className="h-5 w-5 sm:h-5 sm:w-5" />
            <span className="hidden xs:inline">Crea Nuova Fascia</span>
            <span className="xs:hidden">Nuova Fascia</span>
          </button>
        </div>

        {/* Time Slots List */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
          }}
        >
          {filteredTimeSlots.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-gray-400">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300 text-gray-600" />
              <p>Nessuna fascia oraria trovata</p>
              {searchTerm && (
                <p className="text-sm mt-1">Prova a modificare i criteri di ricerca</p>
              )}
            </div>
          ) : (
            <div className="p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3 pb-6 sm:pb-4">
              {filteredTimeSlots.map((slot) => {
                const instructor = getInstructorInfo(slot);
                const instructorName = getInstructorDisplayName(instructor);

                return (
                  <div
                    key={slot.id}
                    className={`w-full p-2 sm:p-3 lg:p-4 rounded-lg border transition-all duration-200 hover:shadow-lg ${
                      slot.isActive
                        ? 'bg-gradient-to-r from-white/90 to-blue-50/50 from-gray-800/90 to-blue-900/30 border-blue-200/50 border-blue-700/50 hover:border-blue-300/70 hover:border-blue-600/70'
                        : 'bg-gradient-to-r from-gray-100/90 to-gray-200/50 from-gray-700/90 to-gray-800/50 border-gray-300/50 border-gray-600/50 hover:border-gray-400/70 hover:border-gray-500/70'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 sm:mb-3">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 text-blue-400 flex-shrink-0" />
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 text-white">
                          {typeof slot.dayOfWeek !== 'undefined' && slot.dayOfWeek !== null
                            ? getDayName(slot.dayOfWeek)
                            : slot.selectedDates && slot.selectedDates[0]
                              ? getDayName(new Date(slot.selectedDates[0]).getDay())
                              : 'Giorno sconosciuto'}
                        </h3>
                        {slot.selectedDates && slot.selectedDates.length > 0 && (
                          <span className="text-xs sm:text-sm text-blue-600 text-blue-400 font-medium bg-blue-50 bg-blue-900/30 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                            {formatDate(slot.selectedDates[0])}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          {slot.isActive ? (
                            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 bg-green-900/30 text-green-800 text-green-300">
                              <div className="w-1.5 h-1.5 bg-green-500 bg-green-400 rounded-full"></div>
                              Attiva
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 bg-gray-700/50 text-gray-600 text-gray-400">
                              <div className="w-1.5 h-1.5 bg-gray-400 bg-gray-500 rounded-full"></div>
                              Disattiva
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <button
                          onClick={() => handleEdit(slot)}
                          className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md min-w-[44px] ${
                            editingSlotId === slot.id
                              ? 'bg-green-500 hover:bg-green-600 bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-blue-500 hover:bg-blue-600 bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {editingSlotId === slot.id ? (
                            <>
                              <span>💾</span>
                              <span className="hidden sm:inline">Salva</span>
                            </>
                          ) : (
                            <>
                              <Edit className="h-3 w-3" />
                              <span className="hidden sm:inline">Modifica</span>
                            </>
                          )}
                        </button>

                        {editingSlotId === slot.id && (
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center justify-center gap-1 bg-gray-500 hover:bg-gray-600 bg-gray-600 hover:bg-gray-700 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md min-w-[44px]"
                          >
                            <X className="h-3 w-3" />
                            <span className="hidden sm:inline">Annulla</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleToggle(slot)}
                          className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md min-w-[44px] ${
                            slot.isActive
                              ? 'bg-red-500 hover:bg-red-600 bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-green-500 hover:bg-green-600 bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {slot.isActive ? (
                            <>
                              <PowerOff className="h-3 w-3" />
                              <span className="hidden sm:inline">Disattiva</span>
                            </>
                          ) : (
                            <>
                              <Power className="h-3 w-3" />
                              <span className="hidden sm:inline">Attiva</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(slot)}
                          className="flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 bg-red-700 hover:bg-red-800 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md min-w-[44px]"
                        >
                          <X className="h-3 w-3" />
                          <span className="hidden sm:inline">Elimina</span>
                        </button>
                      </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {/* Left Column - Time and Instructor */}
                      <div className="space-y-3">
                        {/* Time Box */}
                        <div className="bg-orange-50/70 bg-orange-900/30 rounded-lg p-2 sm:p-3 lg:p-4 border border-orange-200/50 border-orange-700/50">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600 text-orange-200" />
                            <span className="text-xs font-medium text-orange-700 text-orange-300">
                              Orario
                            </span>
                          </div>
                          {editingSlotId === slot.id ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Start Time */}
                              <div className="flex items-center gap-1">
                                <select
                                  value={getHour(editingData.startTime) || '08'}
                                  onChange={(e) =>
                                    setEditingData((prev) =>
                                      setTime(
                                        prev,
                                        'startTime',
                                        e.target.value,
                                        getMinute(editingData.startTime) || '00'
                                      )
                                    )
                                  }
                                  className="text-sm sm:text-base font-bold bg-white bg-gray-800 border border-orange-300 border-orange-600 rounded px-0.5 sm:px-1 py-0.5 sm:py-1 text-orange-800 text-orange-200 w-12 sm:w-14"
                                >
                                  {hourOptions.map((h) => (
                                    <option key={h} value={h}>
                                      {h}
                                    </option>
                                  ))}
                                </select>
                                :
                                <select
                                  value={getMinute(editingData.startTime) || '00'}
                                  onChange={(e) =>
                                    setEditingData((prev) =>
                                      setTime(
                                        prev,
                                        'startTime',
                                        getHour(editingData.startTime) || '08',
                                        e.target.value
                                      )
                                    )
                                  }
                                  className="text-sm sm:text-base font-bold bg-white bg-gray-800 border border-orange-300 border-orange-600 rounded px-0.5 sm:px-1 py-0.5 sm:py-1 text-orange-800 text-orange-200 w-12 sm:w-14"
                                >
                                  {minuteOptions.map((m) => (
                                    <option key={m} value={m}>
                                      {m}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <span className="text-orange-700 text-orange-300 text-sm sm:text-base font-bold">
                                -
                              </span>
                              {/* End Time */}
                              <div className="flex items-center gap-1">
                                <select
                                  value={getHour(editingData.endTime) || '09'}
                                  onChange={(e) =>
                                    setEditingData((prev) =>
                                      setTime(
                                        prev,
                                        'endTime',
                                        e.target.value,
                                        getMinute(editingData.endTime) || '00'
                                      )
                                    )
                                  }
                                  className="text-sm sm:text-base font-bold bg-white bg-gray-800 border border-orange-300 border-orange-600 rounded px-0.5 sm:px-1 py-0.5 sm:py-1 text-orange-800 text-orange-200 w-12 sm:w-14"
                                >
                                  {hourOptions.map((h) => (
                                    <option key={h} value={h}>
                                      {h}
                                    </option>
                                  ))}
                                </select>
                                :
                                <select
                                  value={getMinute(editingData.endTime) || '00'}
                                  onChange={(e) =>
                                    setEditingData((prev) =>
                                      setTime(
                                        prev,
                                        'endTime',
                                        getHour(editingData.endTime) || '09',
                                        e.target.value
                                      )
                                    )
                                  }
                                  className="text-sm sm:text-base font-bold bg-white bg-gray-800 border border-orange-300 border-orange-600 rounded px-0.5 sm:px-1 py-0.5 sm:py-1 text-orange-800 text-orange-200 w-12 sm:w-14"
                                >
                                  {minuteOptions.map((m) => (
                                    <option key={m} value={m}>
                                      {m}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ) : (
                            <div className="font-bold text-orange-800 text-orange-200 text-sm">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </div>
                          )}
                        </div>

                        {/* Instructor Box */}
                        <div
                          className={`rounded-lg p-2 sm:p-3 lg:p-4 border ${
                            instructor
                              ? 'bg-green-50/70 bg-green-900/30 border-green-200/50 border-green-700/50'
                              : 'bg-red-50/70 bg-red-900/30 border-red-200/50 border-red-700/50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <User
                              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${instructor ? 'text-green-600 text-green-400' : 'text-red-500 text-red-400'}`}
                            />
                            <span
                              className={`text-xs font-medium ${instructor ? 'text-green-700 text-green-300' : 'text-red-700 text-red-300'}`}
                            >
                              Maestro
                            </span>
                          </div>
                          <div
                            className={`font-bold text-sm ${instructor ? 'text-green-800 text-green-200' : 'text-red-800 text-red-200'}`}
                          >
                            {instructorName}
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Courts */}
                      <div className="bg-purple-50/70 bg-purple-900/30 rounded-lg p-2 sm:p-3 lg:p-4 border border-purple-200/50 border-purple-700/50">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 text-purple-400" />
                          <span className="text-xs font-medium text-purple-700 text-purple-300">
                            Campi
                          </span>
                        </div>
                        {editingSlotId === slot.id ? (
                          <div className="space-y-2">
                            {courts.map((court) => (
                              <label
                                key={court.id}
                                className="flex items-center gap-2 cursor-pointer p-1 hover:bg-purple-100/50 hover:bg-purple-800/30 rounded"
                              >
                                <input
                                  type="checkbox"
                                  checked={(editingData.courtIds || []).includes(court.id)}
                                  onChange={() => toggleCourtSelection(court.id)}
                                  className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-xs text-purple-800 text-purple-200">
                                  🎾 {court.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {getCourtNamesArray(slot).map((courtName, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 py-1 px-2 bg-purple-100/50 bg-purple-800/30 rounded text-sm font-medium text-purple-800 text-purple-200"
                              >
                                <span className="text-purple-500 text-purple-400">🎾</span>
                                {courtName}
                              </div>
                            ))}
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
      </div>
    </div>
  );
}

// Named and default exports
export { TimeSlotsSlidePanel };
export default TimeSlotsSlidePanel;

