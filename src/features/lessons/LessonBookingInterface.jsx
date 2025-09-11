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
import { useLessonBookings, useUnifiedBookings } from '@hooks/useUnifiedBookings.js';
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
  
  // Also get all bookings (court + lesson) to check for conflicts
  const { bookings: allBookings } = useUnifiedBookings();
  
  const ds = createDSClasses(T);

  // Lesson system state
  const lessonConfig = state?.lessonConfig || createLessonConfigSchema();
  const players = state?.players || [];

  // UI state
  const [activeTab, setActiveTab] = useState('book');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [availableInstructors, setAvailableInstructors] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Clear all test lesson bookings using unified service
  const handleClearAllLessons = useCallback(async () => {
    if (!window.confirm('⚠️ ATTENZIONE: Questa azione cancellerà TUTTE le prenotazioni di lezione e i relativi slot nei campi. Continuare?')) {
      return;
    }

    console.log('🗑️ Clearing all lesson bookings...');
    
    try {
      const cancelledCount = await clearAllLessons();
      console.log(`✅ Cleared ${cancelledCount} lesson bookings successfully`);
      
      setMessage({ type: 'success', text: `Cancellate ${cancelledCount} prenotazioni di lezione con successo!` });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      console.error('❌ Error clearing lesson bookings:', error);
      setMessage({ type: 'error', text: 'Errore durante la cancellazione delle prenotazioni.' });
    }
  }, [clearAllLessons]);

  // Function to update lesson config
  const updateLessonConfig = useCallback((newConfig) => {
    setState((prev) => ({
      ...prev,
      lessonConfig: newConfig,
    }));
  }, [setState]);

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

  // Helper function to check if a specific date has available slots
  const hasAvailableSlotsForDate = useCallback((dateString) => {
    const dateObj = new Date(dateString);
    const dayOfWeek = dateObj.getDay();
    
    // Get configured time slots for this day of week
    const dayTimeSlots = (lessonConfig.timeSlots || []).filter(
      slot => slot.dayOfWeek === dayOfWeek && slot.isActive
    );
    
    if (dayTimeSlots.length === 0) {
      return false;
    }
    
    // Check if any slot has available instructors and courts
    return dayTimeSlots.some(configSlot => {

      const startHour = parseInt(configSlot.startTime.split(':')[0]);
      const startMinute = parseInt(configSlot.startTime.split(':')[1]);
      const endHour = parseInt(configSlot.endTime.split(':')[0]);
      const endMinute = parseInt(configSlot.endTime.split(':')[1]);
      
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      
      let hasAvailableSlot = false;
      
      // Check each possible hourly slot within the time range
      for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += 60) {
        if (minutes + 60 > endTotalMinutes) continue; // Skip if can't fit a full hour
        
        const slotStartHour = Math.floor(minutes / 60);
        const slotStartMinute = minutes % 60;
        const timeString = `${slotStartHour.toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')}`;
        
        // Check available instructors for this slot
        const availableInstructors = instructors.filter(instructor => 
          configSlot.instructorIds.includes(instructor.id) &&
          !allBookings.some(booking => {
            const bookingStatus = booking.status || 'confirmed';
            return booking.date === dateString && 
                   booking.time === timeString && 
                   booking.instructorId === instructor.id &&
                   bookingStatus === 'confirmed';
          })
        );
        
        // Check available courts for this slot - must check for overlapping bookings
        const availableCourts = (state?.courts || []).filter(court => {
          if (!configSlot.courtIds.includes(court.id)) return false;
          
          // Check if court has any overlapping bookings
          const hasConflict = allBookings.some(booking => {
            const bookingStatus = booking.status || 'confirmed';
            if (booking.courtId !== court.id || booking.date !== dateString || bookingStatus !== 'confirmed') {
              return false;
            }
            
            // Check time overlap
            const slotStart = parseInt(timeString.split(':')[0]) * 60 + parseInt(timeString.split(':')[1]);
            const slotEnd = slotStart + 60; // 1 hour lesson
            
            const bookingStart = parseInt(booking.time.split(':')[0]) * 60 + parseInt(booking.time.split(':')[1]);
            const bookingEnd = bookingStart + (booking.duration || 90);
            
            // Check overlap: slot starts before booking ends AND booking starts before slot ends
            return slotStart < bookingEnd && bookingStart < slotEnd;
          });
          
          return !hasConflict;
        });
        
        // If we have both instructors and courts available, this date is bookable
        if (availableInstructors.length > 0 && availableCourts.length > 0) {
          hasAvailableSlot = true;
        }
      }
      
      return hasAvailableSlot;
    });
  }, [lessonConfig.timeSlots, instructors, allBookings, state?.courts]);

  // Get available dates based on configured time slots
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    
    // Get unique days of week from configured time slots
    const configuredDays = new Set();
    (lessonConfig.timeSlots || []).forEach(slot => {
      if (slot.isActive) {
        configuredDays.add(slot.dayOfWeek);
      }
    });
    
    // Generate dates for next 7 days that match configured days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      const dateString = date.toISOString().split('T')[0];
      
      // Only include dates that have configured days AND available slots
      if (configuredDays.has(dayOfWeek) && hasAvailableSlotsForDate(dateString)) {
        dates.push({
          date: dateString,
          dayOfWeek: dayOfWeek,
          display: date.toLocaleDateString('it-IT', { 
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          })
        });
      }
    }
    
    return dates;
  }, [lessonConfig.timeSlots, hasAvailableSlotsForDate]);

  // Get available time slots for selected date
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) {
      return [];
    }
    
    const dateObj = new Date(selectedDate);
    const dayOfWeek = dateObj.getDay();
    
    // Get configured time slots for this day of week
    const dayTimeSlots = (lessonConfig.timeSlots || []).filter(slot => 
      slot.dayOfWeek === dayOfWeek && slot.isActive
    );
    
    const slotMap = new Map(); // Use Map to aggregate slots by time
    
    dayTimeSlots.forEach(configSlot => {
      // Generate hourly slots within the configured time range
      const startHour = parseInt(configSlot.startTime.split(':')[0]);
      const startMinute = parseInt(configSlot.startTime.split(':')[1]);
      const endHour = parseInt(configSlot.endTime.split(':')[0]);
      const endMinute = parseInt(configSlot.endTime.split(':')[1]);
      
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      
      // Generate 1-hour slots
      for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += 60) {
        if (minutes + 60 > endTotalMinutes) break; // Skip if can't fit a full hour
        
        const slotStartHour = Math.floor(minutes / 60);
        const slotStartMinute = minutes % 60;
        const timeString = `${slotStartHour.toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')}`;
        
        // Check available instructors for this slot
        const slotInstructors = instructors.filter(instructor => 
          configSlot.instructorIds.includes(instructor.id) &&
          !allBookings.some(booking => {
            // Use same logic as validation service
            const bookingStatus = booking.status || 'confirmed';
            return booking.date === selectedDate && 
                   booking.time === timeString && 
                   booking.instructorId === instructor.id &&
                   bookingStatus === 'confirmed';
          })
        );
        
        // Check available courts for this slot - must check for overlapping bookings, not just exact time matches
        const availableCourts = (state?.courts || []).filter(court => {
          if (!configSlot.courtIds.includes(court.id)) return false;
          
          // Check if court has any overlapping bookings
          const hasConflict = allBookings.some(booking => {
            const bookingStatus = booking.status || 'confirmed';
            if (booking.courtId !== court.id || booking.date !== selectedDate || bookingStatus !== 'confirmed') {
              return false;
            }
            
            // Check time overlap
            const slotStart = parseInt(timeString.split(':')[0]) * 60 + parseInt(timeString.split(':')[1]);
            const slotEnd = slotStart + 60; // 1 hour lesson
            
            const bookingStart = parseInt(booking.time.split(':')[0]) * 60 + parseInt(booking.time.split(':')[1]);
            const bookingEnd = bookingStart + (booking.duration || 90);
            
            // Check overlap: slot starts before booking ends AND booking starts before slot ends
            return slotStart < bookingEnd && bookingStart < slotEnd;
          });
          
          return !hasConflict;
        });
        
        // Slot is available if we have at least 1 instructor AND 1 court available
        if (slotInstructors.length > 0 && availableCourts.length > 0) {
          // Check if we already have a slot for this time
          if (slotMap.has(timeString)) {
            const existingSlot = slotMap.get(timeString);
            // Merge instructors and courts, avoiding duplicates
            const mergedInstructors = [...existingSlot.availableInstructors];
            slotInstructors.forEach(instructor => {
              if (!mergedInstructors.some(existing => existing.id === instructor.id)) {
                mergedInstructors.push(instructor);
              }
            });
            
            const mergedCourts = [...existingSlot.availableCourts];
            availableCourts.forEach(court => {
              if (!mergedCourts.some(existing => existing.id === court.id)) {
                mergedCourts.push(court);
              }
            });
            
            // Update existing slot with merged data
            slotMap.set(timeString, {
              ...existingSlot,
              availableInstructors: mergedInstructors,
              availableCourts: mergedCourts
            });
          } else {
            // Create new slot
            slotMap.set(timeString, {
              id: `${selectedDate}-${timeString}`,
              time: timeString,
              displayTime: `${slotStartHour.toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')} - ${(slotStartHour + 1).toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')}`,
              availableInstructors: slotInstructors,
              availableCourts: availableCourts,
              configSlot: configSlot
            });
          }
        }
      }
    });
    
    // Convert map to array and sort
    const slots = Array.from(slotMap.values());
    
    // Debug only if unexpected empty result
    if (slots.length === 0 && dayTimeSlots.length > 0) {
      console.warn('⚠️ No available slots found despite having configured time slots. Check instructor/court availability.');
    }
    
    return slots.sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedDate, lessonConfig.timeSlots, instructors, allBookings, state?.courts]);

  // Handle lesson booking creation
  const handleCreateLessonBooking = useCallback(async () => {
    if (!selectedDate || !selectedTimeSlot || !selectedInstructor) {
      setMessage({ type: 'error', text: 'Seleziona data, orario e maestro per continuare.' });
      return;
    }

    try {
      setMessage({ type: '', text: '' });

      // Find available court for this slot
      const assignedCourt = selectedTimeSlot.availableCourts[0]; // Take first available court
      const selectedInstructorObj = instructors.find(i => i.id === selectedInstructor);

      // Create lesson booking using unified service
      const lessonData = {
        // Lesson specific data
        instructorId: selectedInstructor,
        instructorName: selectedInstructorObj?.name,
        lessonType: 'individual',
        
        // Court booking data
        courtId: assignedCourt.id,
        courtName: assignedCourt.name,
        date: selectedDate,
        time: selectedTimeSlot.time,
        duration: 60,
        
        // Additional data
        price: 0, // Lessons are priced separately
        notes: `Lezione con ${selectedInstructorObj?.name}`,
        players: [actualUser?.displayName || actualUser?.email],
        
        // User data
        userPhone: '',
        bookedBy: actualUser?.displayName || actualUser?.email,
        
        // Don't create separate court booking to avoid conflicts
        createCourtBooking: false
      };

      console.log('Creating unified lesson booking:', lessonData);
      
      // Create both lesson and court bookings through unified service
      const createdLessonBooking = await createLessonBooking(lessonData);
      console.log('✅ Created unified lesson booking:', createdLessonBooking);

      setMessage({ type: 'success', text: 'Lezione prenotata con successo!' });

      // Reset form after successful creation
      setCurrentStep(1);
      setSelectedDate('');
      setSelectedTimeSlot(null);
      setSelectedInstructor('');
      setAvailableInstructors([]);

      // Refresh the lesson bookings data
      await refreshLessons();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      console.error('Error booking lesson:', error);
      setMessage({ type: 'error', text: 'Errore durante la prenotazione della lezione.' });
    }
  }, [selectedDate, selectedTimeSlot, selectedInstructor, instructors, createLessonBooking, actualUser, refreshLessons]);

  // Handle lesson cancellation
  const handleCancelLesson = useCallback(async (lessonId) => {
    if (!window.confirm('Sei sicuro di voler cancellare questa lezione?')) return;

    try {
      await cancelLessonBooking(lessonId);
      setMessage({ type: 'success', text: 'Lezione cancellata con successo!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error cancelling lesson:', error);
      setMessage({ type: 'error', text: 'Errore durante la cancellazione della lezione.' });
    }
  }, [cancelLessonBooking]);

  // Step navigation helpers
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

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
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
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
          Le Mie Lezioni {lessonBookings.length > 0 && (
            <Badge variant="primary" size="sm" className="ml-2">
              {lessonBookings.filter(b => b.status === 'confirmed').length}
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
              {[1, 2, 3].map(step => (
                <div key={step} className={`flex items-center ${step < 3 ? 'flex-1' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {currentStep === 1 && 'Scegli il Giorno'}
              {currentStep === 2 && 'Seleziona Orario'}
              {currentStep === 3 && 'Scegli Maestro e Conferma'}
            </div>
          </div>

          {/* Step 1: Select Date */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Scegli il Giorno</h3>
              <p className="text-sm text-gray-600">
                Prossimi 7 giorni disponibili per le lezioni
              </p>
              
              {availableDates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="mb-2">Nessun giorno disponibile per le lezioni</p>
                  <p className="text-sm">Non ci sono slot prenotabili con maestri disponibili nei prossimi 7 giorni.</p>
                  <p className="text-sm">Contatta l'amministrazione per verificare la disponibilità.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {availableDates.map((dateInfo) => {
                    const isToday = dateInfo.date === new Date().toISOString().split('T')[0];
                    
                    return (
                      <button
                        key={dateInfo.date}
                        onClick={() => {
                          setSelectedDate(dateInfo.date);
                          setSelectedTimeSlot(null); // Reset time slot when date changes
                          setSelectedInstructor('');
                          setAvailableInstructors([]);
                          nextStep();
                        }}
                        className={`p-3 rounded-xl border text-center transition-all duration-200 hover:scale-105 active:scale-95 ${
                          selectedDate === dateInfo.date
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                        } ${isToday ? 'ring-2 ring-green-300 bg-green-50' : ''}`}
                      >
                        <div className="text-xs text-gray-500 uppercase mb-1 font-medium">
                          {dateInfo.display.split(' ')[0]}
                        </div>
                        <div className="font-bold text-xl mb-1">
                          {dateInfo.display.split(' ')[1]}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">
                          {dateInfo.display.split(' ')[2]}
                        </div>
                        {isToday && (
                          <div className="text-xs text-green-600 font-bold mt-1 bg-green-100 rounded-full px-2 py-0.5">
                            OGGI
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Time Slot */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Seleziona Orario</h3>
              <div className="text-sm text-gray-600 mb-4">
                Data selezionata: <span className="font-medium">
                  {new Date(selectedDate).toLocaleDateString('it-IT', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              
              {availableTimeSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">⏰</div>
                  <p className="mb-2">Nessun orario prenotabile per questa data</p>
                  <p className="text-sm">Tutti gli slot sono già occupati o non hanno maestri disponibili.</p>
                  <p className="text-sm">Prova con un altro giorno o contatta l'amministrazione.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Orari disponibili (lezioni di 1 ora):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableTimeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => {
                          setSelectedTimeSlot(slot);
                          setAvailableInstructors(slot.availableInstructors);
                          // Auto-select instructor if only one available
                          if (slot.availableInstructors.length === 1) {
                            setSelectedInstructor(slot.availableInstructors[0].id);
                          } else {
                            setSelectedInstructor('');
                          }
                          nextStep();
                        }}
                        className={`p-4 rounded-xl border text-center transition-all duration-200 hover:scale-105 active:scale-95 ${
                          selectedTimeSlot?.id === slot.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                        }`}
                      >
                        <div className="font-bold text-lg mb-2 text-gray-800">
                          {slot.displayTime}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                          <span className="text-blue-600">👨‍🏫</span>
                          <span>{slot.availableInstructors.length} maestr{slot.availableInstructors.length === 1 ? 'o' : 'i'}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between pt-4">
                <button 
                  onClick={prevStep} 
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                >
                  ← Cambia Giorno
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select Instructor and Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Scegli Maestro e Conferma</h3>
              
              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString('it-IT', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Orario:</span>
                  <span className="font-medium">{selectedTimeSlot?.displayTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Durata:</span>
                  <span className="font-medium">60 minuti</span>
                </div>
              </div>

              {/* Instructor Selection */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">
                  Maestr{availableInstructors.length === 1 ? 'o disponibile' : 'i disponibili'} ({availableInstructors.length})
                </h4>
                
                {availableInstructors.length === 1 ? (
                  // Single instructor - show info card
                  <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: availableInstructors[0].instructorData?.color }}
                      >
                        {availableInstructors[0].name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-medium text-lg">{availableInstructors[0].name}</div>
                        {availableInstructors[0].instructorData?.specialties?.length > 0 && (
                          <div className="text-sm text-gray-600">
                            {availableInstructors[0].instructorData.specialties.join(', ')}
                          </div>
                        )}
                        {availableInstructors[0].instructorData?.hourlyRate > 0 && (
                          <div className="text-sm font-semibold text-blue-600">
                            €{availableInstructors[0].instructorData.hourlyRate}/ora
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Multiple instructors - show selection
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableInstructors.map((instructor) => (
                      <button
                        key={instructor.id}
                        onClick={() => setSelectedInstructor(instructor.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-colors ${
                          selectedInstructor === instructor.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: instructor.instructorData?.color }}
                          >
                            {instructor.name?.charAt(0) || '?'}
                          </div>
                          <div className="font-medium">{instructor.name}</div>
                        </div>
                        {instructor.instructorData?.specialties?.length > 0 && (
                          <div className="text-sm text-gray-600 mb-1">
                            {instructor.instructorData.specialties.join(', ')}
                          </div>
                        )}
                        {instructor.instructorData?.hourlyRate > 0 && (
                          <div className="text-sm font-semibold text-blue-600">
                            €{instructor.instructorData.hourlyRate}/ora
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                {availableInstructors.length > 1 && !selectedInstructor && (
                  <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-3">
                    ⚠️ Seleziona un maestro per procedere con la prenotazione
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <button 
                  onClick={prevStep} 
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                >
                  ← Cambia Orario
                </button>
                <button 
                  onClick={handleCreateLessonBooking}
                  disabled={!selectedInstructor}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    selectedInstructor
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
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
                .filter(booking => booking.status === 'confirmed')
                .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
                .map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="font-medium text-gray-900">
                        Lezione con {instructors.find(i => i.id === booking.instructorId)?.name || booking.instructorName}
                      </div>
                      <div className="text-sm text-gray-600">
                        📅 {new Date(booking.date).toLocaleDateString('it-IT', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-gray-600">
                        🕐 {booking.time} - {booking.duration} minuti
                      </div>
                      {booking.courtName && (
                        <div className="text-sm text-gray-600">
                          🎾 Campo: {booking.courtName}
                        </div>
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
          ds={ds}
          lessonConfig={lessonConfig}
          updateLessonConfig={updateLessonConfig}
          instructors={instructors}
          players={players}
          setState={setState}
          state={state}
          courts={state?.courts || []}
          onClearAllLessons={handleClearAllLessons}
          lessonBookingsCount={lessonBookings?.length || 0}
        />
      )}
    </Section>
  );
}
