// =============================================
// FILE: src/features/instructor/InstructorScheduleManager.jsx
// =============================================
import React, { useState, useEffect, useMemo } from 'react';
import { useClub } from '@contexts/ClubContext.jsx';
import { useAuth } from '@contexts/AuthContext.jsx';
import { themeTokens } from '@lib/theme.js';
import { format, parseISO, addDays, startOfWeek, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';
import Modal from '@ui/Modal.jsx';

export default function InstructorScheduleManager({ compact = false }) {
  const { clubId, players } = useClub();
  const { user } = useAuth();
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const T = themeTokens();

  // Form state for adding/editing slots
  const [slotForm, setSlotForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    courtIds: [],
    maxParticipants: 1,
    price: 0,
    notes: '',
  });

  // Load time slots for the club
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (!clubId) return;

      try {
        setLoading(true);
        console.log('Loading time slots for club:', clubId);

        // Import the time slots service
        const { getTimeSlots } = await import('@services/time-slots.js');
        const slots = await getTimeSlots(clubId);

        console.log('Loaded time slots:', slots.length);
        setTimeSlots(slots);
      } catch (error) {
        console.error('Error loading time slots:', error);
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };

    loadTimeSlots();
  }, [clubId]);

  // Get instructor's available slots
  const instructorSlots = useMemo(() => {
    if (!user?.uid) return [];

    return timeSlots.filter(
      (slot) => slot.instructorIds?.includes(user.uid) || slot.instructorId === user.uid
    );
  }, [timeSlots, user?.uid]);

  // Get available courts
  const availableCourts = useMemo(() => {
    // This would come from club context or a separate service
    // For now, we'll use a placeholder
    return [
      { id: 'court1', name: 'Campo 1' },
      { id: 'court2', name: 'Campo 2' },
      { id: 'court3', name: 'Campo 3' },
    ];
  }, []);

  // Filter slots by selected date
  const slotsForSelectedDate = useMemo(() => {
    return instructorSlots.filter((slot) => {
      if (!slot.date) return false;
      try {
        const slotDate = parseISO(slot.date);
        return isSameDay(slotDate, selectedDate);
      } catch (error) {
        return false;
      }
    });
  }, [instructorSlots, selectedDate]);

  // Generate next 7 days for date picker
  const dateOptions = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(new Date(), i);
      dates.push({
        date,
        label: i === 0 ? 'Oggi' : i === 1 ? 'Domani' : format(date, 'EEEE d MMM', { locale: it }),
        value: format(date, 'yyyy-MM-dd'),
      });
    }
    return dates;
  }, []);

  // Handle form submission
  const handleSubmitSlot = async (e) => {
    e.preventDefault();

    try {
      const { createTimeSlot, updateTimeSlot } = await import('@services/time-slots.js');

      const slotData = {
        ...slotForm,
        instructorIds: [user.uid],
        clubId,
        available: true,
      };

      if (editingSlot) {
        await updateTimeSlot(editingSlot.id, slotData);
        console.log('Slot updated:', editingSlot.id);
      } else {
        await createTimeSlot(slotData);
        console.log('Slot created');
      }

      // Reset form and close modal
      setSlotForm({
        date: '',
        startTime: '',
        endTime: '',
        courtIds: [],
        maxParticipants: 1,
        price: 0,
        notes: '',
      });
      setShowAddSlotModal(false);
      setEditingSlot(null);

      // Reload slots
      const { getTimeSlots } = await import('@services/time-slots.js');
      const updatedSlots = await getTimeSlots(clubId);
      setTimeSlots(updatedSlots);
    } catch (error) {
      console.error('Error saving slot:', error);
      // TODO: Show error message to user
    }
  };

  // Handle edit slot
  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setSlotForm({
      date: slot.date || '',
      startTime: slot.startTime || '',
      endTime: slot.endTime || '',
      courtIds: slot.courtIds || [],
      maxParticipants: slot.maxParticipants || 1,
      price: slot.price || 0,
      notes: slot.notes || '',
    });
    setShowAddSlotModal(true);
  };

  // Handle delete slot
  const handleDeleteSlot = async (slotId) => {
    if (!confirm('Sei sicuro di voler eliminare questa fascia oraria?')) return;

    try {
      const { deleteTimeSlot } = await import('@services/time-slots.js');
      await deleteTimeSlot(slotId);

      // Reload slots
      const { getTimeSlots } = await import('@services/time-slots.js');
      const updatedSlots = await getTimeSlots(clubId);
      setTimeSlots(updatedSlots);
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
  };

  if (loading) {
    return (
      <div
        className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl ${compact ? 'mb-4' : ''}`}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200/60 dark:bg-gray-600/40 rounded w-48"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200/40 dark:bg-gray-600/30 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl ${compact ? 'mb-4' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
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
          </div>
          Gestisci Orari
        </h3>

        <button
          onClick={() => setShowAddSlotModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          + Aggiungi Orario
        </button>
      </div>

      {/* Date selector */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dateOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedDate(option.date)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isSameDay(option.date, selectedDate)
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Slots list */}
      <div className="space-y-4">
        {slotsForSelectedDate.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-3 opacity-50"
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
            <p className="text-lg font-medium mb-1">Nessun orario disponibile</p>
            <p className="text-sm">Aggiungi le tue fasce orarie per questo giorno</p>
          </div>
        ) : (
          slotsForSelectedDate.map((slot) => (
            <div
              key={slot.id}
              className="bg-gradient-to-r from-gray-50/80 to-gray-100/60 dark:from-gray-700/60 dark:to-gray-800/40 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-600/30 p-4"
            >
              {/* Slot header */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {slot.startTime} - {slot.endTime}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSlot(slot)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Modifica"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Elimina"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Slot details */}
              <div className="space-y-2 text-sm">
                {slot.courtIds && slot.courtIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Campi:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {slot.courtIds.join(', ')}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">Max partecipanti:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {slot.maxParticipants || 1}
                  </span>
                </div>

                {slot.price && slot.price > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Prezzo:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      €{slot.price}
                    </span>
                  </div>
                )}

                {slot.notes && (
                  <div className="mt-3 p-3 bg-blue-50/70 dark:bg-blue-900/20 backdrop-blur-sm rounded-lg border border-blue-200/50 dark:border-blue-700/30">
                    <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                      Note:
                    </div>
                    <div className="text-sm text-blue-800 dark:text-blue-200">{slot.notes}</div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Slot Modal */}
      <Modal
        isOpen={showAddSlotModal}
        onClose={() => {
          setShowAddSlotModal(false);
          setEditingSlot(null);
          setSlotForm({
            date: '',
            startTime: '',
            endTime: '',
            courtIds: [],
            maxParticipants: 1,
            price: 0,
            notes: '',
          });
        }}
        title={editingSlot ? 'Modifica Orario' : 'Aggiungi Orario'}
        size="md"
      >
        <form onSubmit={handleSubmitSlot} className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data
            </label>
            <select
              value={slotForm.date}
              onChange={(e) => setSlotForm((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleziona una data</option>
              {dateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ora inizio
              </label>
              <input
                type="time"
                value={slotForm.startTime}
                onChange={(e) => setSlotForm((prev) => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ora fine
              </label>
              <input
                type="time"
                value={slotForm.endTime}
                onChange={(e) => setSlotForm((prev) => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Courts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Campi disponibili
            </label>
            <div className="space-y-2">
              {availableCourts.map((court) => (
                <label key={court.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={slotForm.courtIds.includes(court.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSlotForm((prev) => ({
                        ...prev,
                        courtIds: checked
                          ? [...prev.courtIds, court.id]
                          : prev.courtIds.filter((id) => id !== court.id),
                      }));
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{court.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Max participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max partecipanti
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={slotForm.maxParticipants}
              onChange={(e) =>
                setSlotForm((prev) => ({ ...prev, maxParticipants: parseInt(e.target.value) || 1 }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prezzo (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={slotForm.price}
              onChange={(e) =>
                setSlotForm((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note (opzionale)
            </label>
            <textarea
              value={slotForm.notes}
              onChange={(e) => setSlotForm((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Note aggiuntive per questa fascia oraria..."
            />
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddSlotModal(false);
                setEditingSlot(null);
                setSlotForm({
                  date: '',
                  startTime: '',
                  endTime: '',
                  courtIds: [],
                  maxParticipants: 1,
                  price: 0,
                  notes: '',
                });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors font-medium"
            >
              {editingSlot ? 'Salva Modifiche' : 'Aggiungi Orario'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
