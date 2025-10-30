// =============================================
// FILE: src/features/lessons/LessonBookingInterface.jsx
// Interface principale per la prenotazione delle lezioni - VERSIONE UNIFICATA
// =============================================
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Section from '@ui/Section.jsx';
import Badge from '@ui/Badge.jsx';
import Modal from '@ui/Modal.jsx';
import { createDSClasses } from '@lib/design-system.js';
import { uid } from '@lib/ids.js';
import {
  createLessonBookingSchema,
  createLessonTimeSlotSchema,
  createLessonConfigSchema,
  PLAYER_CATEGORIES,
} from '@features/players/types/playerTypes.js';
import { useLessonBookings } from '@hooks/useUnifiedBookings.js';
import { useAuth } from '@contexts/AuthContext.jsx';
import LessonAdminPanel from './components/LessonAdminPanel.jsx';

export default function LessonBookingInterface({ T, user: propUser, state, setState, clubMode }) {
  const { user } = useAuth();
  const actualUser = user || propUser; // Use context user if available, fallback to prop user

  // Use unified lesson booking service
  const {
    lessonBookings,
    loading: lessonLoading,
    createLessonBooking,
    cancelBooking: cancelLessonBooking,
    clearAllLessons,
    refresh: refreshLessons,
  } = useLessonBookings();

  const ds = createDSClasses(T);

  // Lesson system state
  const lessonConfig = state?.lessonConfig || createLessonConfigSchema();
  const players = state?.players || [];

  // UI state
  const [activeTab, setActiveTab] = useState('book');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Clear all test lesson bookings using unified service
  const handleClearAllLessons = useCallback(async () => {
    if (
      !window.confirm(
        '⚠️ ATTENZIONE: Questa azione cancellerà TUTTE le prenotazioni di lezione e i relativi slot nei campi. Continuare?'
      )
    ) {
      return;
    }

    console.log('🗑️ Clearing all lesson bookings...');

    try {
      const cancelledCount = await clearAllLessons();
      console.log(`✅ Cleared ${cancelledCount} lesson bookings successfully`);

      setMessage({
        type: 'success',
        text: `Cancellate ${cancelledCount} prenotazioni di lezione con successo!`,
      });

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('❌ Error clearing lesson bookings:', error);
      setMessage({
        type: 'error',
        text: 'Errore durante la cancellazione delle prenotazioni.',
      });
    }
  }, [clearAllLessons]);

  // Reset to book tab if user tries to access admin without club mode
  useEffect(() => {
    if (activeTab === 'admin' && !clubMode) {
      setActiveTab('book');
    }
  }, [activeTab, clubMode]);

  // Get instructors from players
  const instructors = useMemo(() => {
    return players.filter(
      (player) =>
        player.category === PLAYER_CATEGORIES.INSTRUCTOR && player.instructorData?.isInstructor
    );
  }, [players]);

  // Generate available dates (next 30 days)
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  // Generate time slots for selected date
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || !selectedInstructor) return [];

    const slots = [];
    for (let hour = 8; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const startTime = `${selectedDate}T${timeString}:00`;

        // Check if this slot is already booked
        const isBooked = lessonBookings.some(
          (booking) =>
            booking.date === selectedDate &&
            booking.time === timeString &&
            booking.instructorId === selectedInstructor &&
            booking.status === 'confirmed'
        );

        if (!isBooked) {
          slots.push({
            id: `${selectedDate}-${timeString}`,
            startTime: timeString,
            displayTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            available: true,
          });
        }
      }
    }
    return slots;
  }, [selectedDate, selectedInstructor, lessonBookings]);

  // Find available court for booking
  const findAvailableCourt = useCallback(
    (date, time) => {
      const courts = state?.courts || [];
      if (courts.length === 0) return null;

      // For now, just return the first court
      // In the future, we could add logic to check court availability
      return courts[0];
    },
    [state?.courts]
  );

  // Handle lesson booking creation
  const handleCreateLessonBooking = useCallback(async () => {
    if (!selectedInstructor || !selectedDate || !selectedTime) {
      setMessage({
        type: 'error',
        text: 'Seleziona istruttore, data e ora per continuare.',
      });
      return;
    }

    try {
      setMessage({ type: '', text: '' });

      // Find available court
      const assignedCourt = findAvailableCourt(selectedDate, selectedTime.startTime);
      if (!assignedCourt) {
        setMessage({
          type: 'error',
          text: 'Nessun campo disponibile per questo orario.',
        });
        return;
      }

      // Create lesson booking using unified service
      const lessonData = {
        // Lesson specific data
        instructorId: selectedInstructor,
        instructorName: instructors.find((i) => i.id === selectedInstructor)?.name,
        lessonType: 'individual',

        // Court booking data
        courtId: assignedCourt.id,
        courtName: assignedCourt.name,
        date: selectedDate,
        time: selectedTime.startTime,
        duration: 60,

        // Additional data
        price: 0, // Lessons are priced separately
        notes: `Lezione con ${instructors.find((i) => i.id === selectedInstructor)?.name}`,
        players: [actualUser?.displayName || actualUser?.email],

        // User data
        userPhone: '',
        bookedBy: actualUser?.displayName || actualUser?.email,
      };

      console.log('Creating unified lesson booking:', lessonData);

      // Create both lesson and court bookings through unified service
      const createdLessonBooking = await createLessonBooking(lessonData);
      console.log('✅ Created unified lesson booking:', createdLessonBooking);

      setMessage({ type: 'success', text: 'Lezione prenotata con successo!' });

      // Reset form after successful creation
      setCurrentStep(1);
      setSelectedInstructor('');
      setSelectedDate('');
      setSelectedTime(null);

      // Refresh the lesson bookings data
      await refreshLessons();

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error booking lesson:', error);
      setMessage({
        type: 'error',
        text: 'Errore durante la prenotazione della lezione.',
      });
    }
  }, [
    selectedInstructor,
    selectedDate,
    selectedTime,
    instructors,
    findAvailableCourt,
    createLessonBooking,
    actualUser,
    refreshLessons,
  ]);

  // Handle lesson cancellation
  const handleCancelLesson = useCallback(
    async (lessonId) => {
      if (!window.confirm('Sei sicuro di voler cancellare questa lezione?')) return;

      try {
        await cancelLessonBooking(lessonId);
        setMessage({
          type: 'success',
          text: 'Lezione cancellata con successo!',
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        console.error('Error cancelling lesson:', error);
        setMessage({
          type: 'error',
          text: 'Errore durante la cancellazione della lezione.',
        });
      }
    },
    [cancelLessonBooking]
  );

  // Step navigation helpers
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  if (lessonLoading) {
    return (
      <Section T={T} title="Prenota Lezione" className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Caricamento...</span>
        </div>
      </Section>
    );
  }

  return (
    <Section T={T} title="Prenota Lezione" className="space-y-6">
      {/* Message Display */}
      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : message.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('book')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'book'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Prenota Lezione
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'bookings'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Le Mie Lezioni{' '}
          {lessonBookings.length > 0 && (
            <Badge variant="primary" size="sm" className="ml-2">
              {lessonBookings.filter((b) => b.status === 'confirmed').length}
            </Badge>
          )}
        </button>

        {clubMode && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'admin'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Gestione
          </button>
        )}
      </div>

      {/* Booking Form */}
      {activeTab === 'book' && (
        <div className="bg-white rounded-lg border p-6">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className={`flex items-center ${step < 5 ? 'flex-1' : ''}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 5 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {currentStep === 1 && 'Seleziona Istruttore'}
              {currentStep === 2 && 'Scegli Data'}
              {currentStep === 3 && 'Seleziona Orario'}
              {currentStep === 4 && 'Conferma Prenotazione'}
              {currentStep === 5 && 'Completato'}
            </div>
          </div>

          {/* Step 1: Select Instructor */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Seleziona Istruttore</h3>
              {instructors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nessun istruttore disponibile. Contatta l'amministrazione per configurare gli
                  istruttori.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {instructors.map((instructor) => (
                    <button
                      key={instructor.id}
                      onClick={() => {
                        setSelectedInstructor(instructor.id);
                        nextStep();
                      }}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        selectedInstructor === instructor.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{instructor.name}</div>
                      {instructor.instructorData?.specialties && (
                        <div className="text-sm text-gray-600 mt-1">
                          {instructor.instructorData.specialties.join(', ')}
                        </div>
                      )}
                      {instructor.instructorData?.pricePerHour && (
                        <div className="text-sm font-semibold text-blue-600 mt-2">
                          €{instructor.instructorData.pricePerHour}/ora
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Date */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Scegli Data</h3>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {availableDates.slice(0, 14).map((date) => {
                  const dateObj = new Date(date);
                  const dayName = dateObj.toLocaleDateString('it-IT', {
                    weekday: 'short',
                  });
                  const dayNum = dateObj.getDate();
                  const monthName = dateObj.toLocaleDateString('it-IT', {
                    month: 'short',
                  });

                  return (
                    <button
                      key={date}
                      onClick={() => {
                        setSelectedDate(date);
                        nextStep();
                      }}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        selectedDate === date
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xs text-gray-500 uppercase">{dayName}</div>
                      <div className="font-semibold">{dayNum}</div>
                      <div className="text-xs text-gray-500">{monthName}</div>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between pt-4">
                <button onClick={prevStep} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  ← Indietro
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select Time */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Seleziona Orario</h3>
              <div className="text-sm text-gray-600 mb-4">
                Data selezionata:{' '}
                {new Date(selectedDate).toLocaleDateString('it-IT', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>

              {availableTimeSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nessun orario disponibile per questa data.
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {availableTimeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => {
                        setSelectedTime(slot);
                        nextStep();
                      }}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        selectedTime?.id === slot.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {slot.displayTime}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button onClick={prevStep} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  ← Indietro
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Conferma Prenotazione</h3>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Istruttore:</span>
                  <span className="font-medium">
                    {instructors.find((i) => i.id === selectedInstructor)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString('it-IT', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Orario:</span>
                  <span className="font-medium">{selectedTime?.displayTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Durata:</span>
                  <span className="font-medium">60 minuti</span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={prevStep} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  ← Indietro
                </button>
                <button
                  onClick={handleCreateLessonBooking}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Conferma Prenotazione
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Bookings List */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Le Mie Lezioni</h3>

          {lessonBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Non hai ancora prenotato nessuna lezione.
            </div>
          ) : (
            <div className="space-y-4">
              {lessonBookings
                .filter((booking) => booking.status === 'confirmed')
                .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
                .map((booking) => (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="font-medium text-gray-900">
                          Lezione con{' '}
                          {instructors.find((i) => i.id === booking.instructorId)?.name ||
                            booking.instructorName}
                        </div>
                        <div className="text-sm text-gray-600">
                          📅{' '}
                          {new Date(booking.date).toLocaleDateString('it-IT', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-sm text-gray-600">
                          🕐 {booking.time} - {booking.duration} minuti
                        </div>
                        {booking.courtName && (
                          <div className="text-sm text-gray-600">🎾 Campo: {booking.courtName}</div>
                        )}
                      </div>
                      <button
                        onClick={() => handleCancelLesson(booking.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        Cancella
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Admin Panel */}
      {activeTab === 'admin' && clubMode && (
        <LessonAdminPanel
          T={T}
          lessonBookings={lessonBookings}
          lessonConfig={lessonConfig}
          instructors={instructors}
          onClearAllLessons={handleClearAllLessons}
        />
      )}
    </Section>
  );
}

