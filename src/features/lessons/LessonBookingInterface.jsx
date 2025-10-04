// =============================================
// FILE: src/features/lessons/LessonBookingInterface.jsx
// Interface principale per la prenotazione delle lezioni - VERSIONE UNIFICATA
// =============================================
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Section from '@ui/Section.jsx';
import Badge from '@ui/Badge.jsx';
import Modal from '@ui/Modal.jsx';
import { createDSClasses } from '@lib/design-system.js';
import { uid } from '@lib/ids.js';
import { euro } from '@lib/format.js';
import { calculateLessonPrice } from '@services/bookings.js';
import {
  createLessonBookingSchema,
  createLessonTimeSlotSchema,
  createLessonConfigSchema,
  PLAYER_CATEGORIES,
} from '@features/players/types/playerTypes.js';
import { useLessonBookings, useUnifiedBookings } from '@hooks/useUnifiedBookings.js';
import { useAuth } from '@contexts/AuthContext.jsx';
import LessonAdminPanel from './components/LessonAdminPanel.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
import { useClubSettings } from '@hooks/useClubSettings.js';

export default function LessonBookingInterface({
  T,
  user: propUser,
  state, // legacy (players) - lessonConfig ora da club settings
  setState, // legacy mutation
  clubMode,
  clubId,
}) {
  const { user } = useAuth();
  const actualUser = user || propUser; // Use context user if available, fallback to prop user
  const [searchParams, setSearchParams] = useSearchParams();

  // Use unified lesson booking service
  const {
    lessonBookings,
    loading: lessonLoading,
    createLessonBooking,
    cancelBooking: cancelLessonBooking,
    clearAllLessons,
    refresh: refreshLessons,
  } = useLessonBookings({ clubId: clubId || selectedClub?.id }); // Passa il clubId per salvare su Firebase

  // Also get all bookings (court + lesson) to check for conflicts
  const { bookings: allBookings } = useUnifiedBookings({ clubId });

  // Debug: Log all bookings when they change
  useEffect(() => {
    const todayBookings = allBookings.filter((b) => b.date === '2025-10-02');
    console.log('📦 [LessonBookingInterface] allBookings updated:', {
      count: allBookings.length,
      todayCount: todayBookings.length,
    });

    // Log each today booking individually for clarity
    todayBookings.forEach((booking, index) => {
      console.log(`  📋 Booking ${index + 1}/${todayBookings.length}:`, {
        id: booking.id,
        date: booking.date,
        time: booking.time,
        instructorId: booking.instructorId,
        instructorName: booking.instructorName,
        isLessonBooking: booking.isLessonBooking,
        players: booking.players,
        bookedBy: booking.bookedBy,
        status: booking.status,
        courtName: booking.courtName,
        type: booking.type,
      });
    });
  }, [allBookings]);

  const ds = createDSClasses(T);

  // Lesson system state: config da club settings, players da ClubContext
  const { selectedClub, players: clubPlayers, courts } = useClub();
  const { lessonConfig: clubLessonConfig, updateLessonConfig: updateClubLessonConfig } =
    useClubSettings({ clubId: clubId || selectedClub?.id });
  
  // State per le fasce orarie degli istruttori dalla collezione timeSlots
  const [instructorTimeSlots, setInstructorTimeSlots] = useState([]);
  
  // Combina le fasce dell'admin (lessonConfig) con quelle degli istruttori (timeSlots collection)
  const lessonConfig = useMemo(() => {
    const baseConfig = clubLessonConfig || createLessonConfigSchema();
    const configSlots = baseConfig.timeSlots || [];
    
    // Converti le fasce degli istruttori nel formato compatibile con lessonConfig
    const convertedInstructorSlots = instructorTimeSlots.map(slot => ({
      id: slot.id,
      dayOfWeek: null, // Gli slot degli istruttori usano date specifiche
      selectedDates: slot.date ? [slot.date] : [],
      startTime: slot.startTime,
      endTime: slot.endTime,
      courtIds: slot.courtIds || [],
      instructorIds: slot.instructorIds || [slot.instructorId],
      maxBookings: slot.maxParticipants || 5,
      isActive: slot.isActive !== false,
      source: 'instructor', // Marca la fonte
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt,
    }));
    
    return {
      ...baseConfig,
      timeSlots: [...configSlots, ...convertedInstructorSlots],
    };
  }, [clubLessonConfig, instructorTimeSlots]);
  
  const players = clubPlayers || state?.players || [];

  // Carica le fasce orarie dalla collezione timeSlots (create dagli istruttori) con listener real-time
  useEffect(() => {
    const currentClubId = clubId || selectedClub?.id;
    if (!currentClubId) return;

    let unsubscribe;

    const setupRealtimeListener = async () => {
      try {
        const { collection, onSnapshot } = await import('firebase/firestore');
        const { db } = await import('@services/firebase.js');
        
        const timeSlotsRef = collection(db, 'clubs', currentClubId, 'timeSlots');
        
        // Listener real-time per aggiornamenti automatici
        unsubscribe = onSnapshot(timeSlotsRef, (snapshot) => {
          const slots = [];
          snapshot.forEach((doc) => {
            slots.push({
              id: doc.id,
              source: 'personal',
              ...doc.data(),
            });
          });
          
          console.log('📚 [LessonBooking] Real-time update - instructor time slots:', slots.length);
          setInstructorTimeSlots(slots);
        }, (error) => {
          console.error('❌ [LessonBooking] Error in real-time listener:', error);
        });
      } catch (error) {
        console.error('❌ [LessonBooking] Error setting up real-time listener:', error);
      }
    };

    setupRealtimeListener();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
        console.log('🔌 [LessonBooking] Unsubscribed from timeSlots listener');
      }
    };
  }, [clubId, selectedClub?.id]);

  // Debug courts
  useEffect(() => {
    if (courts && courts.length > 0) {
      console.log(
        '🏟️ Courts available:',
        courts.length,
        courts.map((c) => ({
          id: c.id,
          name: c.name,
        }))
      );
    }
  }, [courts]);

  // Monitor lessonConfig updates
  useEffect(() => {
    if (lessonConfig.timeSlots && lessonConfig.timeSlots.length > 0) {
      console.log('✅ LessonConfig loaded with', lessonConfig.timeSlots.length, 'time slots');
    }
  }, [lessonConfig]);

  // UI state
  const [activeTab, setActiveTab] = useState('book');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedParticipants, setSelectedParticipants] = useState(1);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [availableInstructors, setAvailableInstructors] = useState([]);
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

  // Function to update lesson config
  const updateLessonConfig = useCallback(
    async (newConfig) => {
      try {
        // Salva la configurazione lezioni nel club via Firebase
        await updateClubLessonConfig(newConfig);
        console.log('✅ Configurazione lezioni salvata su Firebase:', newConfig);
      } catch (error) {
        console.error(
          '❌ Errore durante il salvataggio della configurazione lezioni su Firebase:',
          error
        );
        // Non fare fallback locale - mostra errore all'utente
        throw error;
      }
    },
    [updateClubLessonConfig]
  );

  // Reset to book tab if user tries to access admin without club mode
  useEffect(() => {
    if (activeTab === 'admin' && !clubMode) {
      setActiveTab('book');
    }
  }, [activeTab, clubMode]);

  // Get instructors from players
  const instructors = useMemo(() => {
    const instructorList = players.filter(
      (player) =>
        player.category === PLAYER_CATEGORIES.INSTRUCTOR &&
        player.instructorData?.isInstructor !== false // Include anche quelli senza flag esplicito
    );
    console.log(
      '🧑‍🏫 Instructors found:',
      instructorList.length,
      instructorList.map((i) => ({
        id: i.id,
        name: i.displayName,
        category: i.category,
        instructorData: i.instructorData,
      }))
    );
    return instructorList;
  }, [players]);

  // Helper function to check if a specific date has available slots
  const hasAvailableSlotsForDate = useCallback(
    (dateString) => {
      console.log('🔍 [hasAvailableSlotsForDate] Checking date:', dateString, {
        allBookingsCount: allBookings.length,
        instructorsCount: instructors.length,
        timeSlotsCount: lessonConfig.timeSlots?.length || 0,
      });

      // ✅ FIX: Aspetta che lessonConfig sia completamente caricato
      if (!lessonConfig.timeSlots || lessonConfig.timeSlots.length === 0) {
        console.log('❌ No timeSlots available');
        return false;
      }

      const dateObj = new Date(dateString);
      const dayOfWeek = dateObj.getDay();

      console.log('📅 Date analysis:', {
        dateString,
        dayOfWeek,
        dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
          dayOfWeek
        ],
      });

      // Get current date and time for filtering past slots
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTotalMinutes = currentHour * 60 + currentMinute;

      // Get configured time slots for this specific date or day of week
      const dayTimeSlots = (lessonConfig.timeSlots || []).filter((slot) => {
        if (!slot.isActive) {
          console.log('❌ Slot not active');
          return false;
        }

        // Check new format: specific dates
        if (slot.selectedDates && slot.selectedDates.length > 0) {
          const includes = slot.selectedDates.includes(dateString);
          console.log('📅 Date check:', includes ? '✅ MATCH' : '❌ NO MATCH');
          return includes;
        }

        // Check old format: day of week (for backward compatibility)
        if (slot.dayOfWeek) {
          const matches = slot.dayOfWeek === dayOfWeek;
          console.log('📅 Day of week check:', matches ? '✅ MATCH' : '❌ NO MATCH');
          return matches;
        }

        console.log('❌ No date criteria found');
        return false;
      });

      if (dayTimeSlots.length === 0) {
        return false;
      }

      // Check if any slot has available instructors and courts
      return dayTimeSlots.some((configSlot) => {
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

          // Skip past time slots for today
          if (dateString === currentDate) {
            const slotTotalMinutes = slotStartHour * 60 + slotStartMinute;
            if (slotTotalMinutes <= currentTotalMinutes) {
              continue; // Skip this slot as it's in the past
            }
          }

          console.log(
            `🔍 [hasAvailableSlotsForDate] Checking slot ${timeString} for date ${dateString}`,
            {
              configSlotInstructors: configSlot.instructorIds,
              allInstructors: instructors.map((i) => ({ id: i.id, name: i.name })),
            }
          );

          const availableInstructors = instructors.filter((instructor) => {
            const isIncluded = configSlot.instructorIds.includes(instructor.id);
            console.log(`  🔍 Checking instructor ${instructor.name} (${instructor.id}):`, {
              isIncluded,
            });

            if (!isIncluded) return false;

            // Controlla se l'istruttore ha conflitti (con controllo overlap temporale)
            const slotStartMinutes =
              parseInt(timeString.split(':')[0]) * 60 + parseInt(timeString.split(':')[1]);
            const slotEndMinutes = slotStartMinutes + 60; // Slot lezione di 1 ora

            const conflictingBookings = allBookings.filter((booking) => {
              const bookingStatus = booking.status || 'confirmed';
              if (bookingStatus !== 'confirmed') return false;
              if (booking.date !== dateString) return false;

              // Calcola overlap temporale
              const bookingStartMinutes =
                parseInt(booking.time.split(':')[0]) * 60 + parseInt(booking.time.split(':')[1]);
              const bookingEndMinutes = bookingStartMinutes + (booking.duration || 90);

              // Check overlap: slot inizia prima che booking finisca E booking inizia prima che slot finisca
              const hasOverlap =
                slotStartMinutes < bookingEndMinutes && bookingStartMinutes < slotEndMinutes;
              return hasOverlap;
            });

            console.log(
              `    📅 Found ${conflictingBookings.length} bookings at ${timeString} on ${dateString}:`,
              conflictingBookings.map((b) => ({
                id: b.id,
                instructorId: b.instructorId,
                isLessonBooking: b.isLessonBooking,
                players: b.players,
                bookedBy: b.bookedBy,
              }))
            );

            const hasConflict = conflictingBookings.some((booking) => {
              // Controllo diretto: instructorId presente
              if (booking.instructorId === instructor.id) {
                console.log(`    ❌ CONFLICT: Direct instructorId match for ${instructor.name}`);
                return true;
              }

              // Controllo aggiuntivo: lezione senza instructorId ma con nome istruttore nei giocatori
              if (booking.isLessonBooking && !booking.instructorId) {
                const instructorName = instructor.displayName || instructor.name;
                const bookingPlayers = booking.players || [];
                console.log(
                  `    🔍 Checking lesson without instructorId. Looking for "${instructorName}" in players:`,
                  bookingPlayers
                );

                const hasInstructorInPlayers = bookingPlayers.some((player) => {
                  if (!player || typeof player !== 'string') return false;
                  const match = player.toLowerCase().includes(instructorName.toLowerCase());
                  console.log(`      🔍 Player "${player}" includes "${instructorName}"? ${match}`);
                  return match;
                });

                if (hasInstructorInPlayers) {
                  console.log(
                    `    ❌ CONFLICT: Instructor ${instructorName} found in players for lesson without instructorId:`,
                    {
                      time: timeString,
                      date: dateString,
                      players: bookingPlayers,
                      bookingId: booking.id,
                    }
                  );
                  return true;
                }
              }

              // Controllo NUOVO: maestro come giocatore in una partita normale
              if (!booking.isLessonBooking) {
                const instructorName = instructor.displayName || instructor.name;
                const bookingPlayers = booking.players || [];
                console.log(
                  `    🏃 Checking if instructor is playing in match. Looking for "${instructorName}" in players:`,
                  bookingPlayers
                );

                const isPlayingInMatch = bookingPlayers.some((player) => {
                  if (!player || typeof player !== 'string') return false;
                  const match = player.toLowerCase().includes(instructorName.toLowerCase());
                  console.log(`      🔍 Player "${player}" includes "${instructorName}"? ${match}`);
                  return match;
                });

                if (isPlayingInMatch) {
                  console.log(
                    `    ❌ CONFLICT: Instructor ${instructorName} is playing in a match at this time:`,
                    {
                      time: timeString,
                      date: dateString,
                      players: bookingPlayers,
                      courtName: booking.courtName,
                      bookingId: booking.id,
                    }
                  );
                  return true;
                }
              }

              return false;
            });

            console.log(`    ✅ Instructor ${instructor.name} available: ${!hasConflict}`);
            return !hasConflict;
          });

          console.log(
            `  📊 Available instructors for ${timeString}:`,
            availableInstructors.map((i) => i.name)
          );

          // Check available courts for this slot - must check for overlapping bookings

          const availableCourts = (courts || []).filter((court) => {
            if (!configSlot.courtIds.includes(court.id)) return false;

            // Check if court has any overlapping bookings
            const hasConflict = allBookings.some((booking) => {
              const bookingStatus = booking.status || 'confirmed';
              if (
                booking.courtId !== court.id ||
                booking.date !== dateString ||
                bookingStatus !== 'confirmed'
              ) {
                return false;
              }

              // Check time overlap
              const slotStart =
                parseInt(timeString.split(':')[0]) * 60 + parseInt(timeString.split(':')[1]);
              const slotEnd = slotStart + 60; // 1 hour lesson

              const bookingStart =
                parseInt(booking.time.split(':')[0]) * 60 + parseInt(booking.time.split(':')[1]);
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
    },
    [lessonConfig.timeSlots, instructors, allBookings, courts]
  );

  // Get available dates based on configured time slots
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    // Get all specific dates from time slots (new format)
    const specificDates = new Set();
    (lessonConfig.timeSlots || []).forEach((slot) => {
      if (slot.isActive && slot.selectedDates && slot.selectedDates.length > 0) {
        slot.selectedDates.forEach((dateStr) => {
          // Only include future dates or today
          if (dateStr >= todayString) {
            specificDates.add(dateStr);
          }
        });
      }
    });

    // Convert specific dates to the expected format
    Array.from(specificDates)
      .sort()
      .forEach((dateString) => {
        const date = new Date(dateString);
        if (hasAvailableSlotsForDate(dateString)) {
          dates.push({
            date: dateString,
            dayOfWeek: date.getDay(),
            display: date.toLocaleDateString('it-IT', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            }),
          });
        }
      });

    // For backward compatibility: handle old format (dayOfWeek)
    const configuredDays = new Set();
    (lessonConfig.timeSlots || []).forEach((slot) => {
      if (
        slot.isActive &&
        slot.dayOfWeek &&
        (!slot.selectedDates || slot.selectedDates.length === 0)
      ) {
        configuredDays.add(slot.dayOfWeek);
      }
    });

    // Only add dayOfWeek dates if no specific dates are configured
    if (specificDates.size === 0 && configuredDays.size > 0) {
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
              month: 'short',
            }),
          });
        }
      }
    }

    return dates;
  }, [lessonConfig.timeSlots, hasAvailableSlotsForDate]);

  // Get available time slots for selected date
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    // ✅ FIX: Aspetta che lessonConfig sia completamente caricato
    if (!lessonConfig.timeSlots || lessonConfig.timeSlots.length === 0) {
      return [];
    }

    const dateObj = new Date(selectedDate);
    const dayOfWeek = dateObj.getDay();

    // Get current date and time for filtering past slots
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    // Get configured time slots for this specific date or day of week
    const dayTimeSlots = (lessonConfig.timeSlots || []).filter((slot) => {
      if (!slot.isActive) return false;

      // Check new format: specific dates
      if (slot.selectedDates && slot.selectedDates.length > 0) {
        return slot.selectedDates.includes(selectedDate);
      }

      // Check old format: day of week (for backward compatibility)
      if (slot.dayOfWeek) {
        return slot.dayOfWeek === dayOfWeek;
      }

      return false;
    });

    const slotMap = new Map(); // Use Map to aggregate slots by time

    dayTimeSlots.forEach((configSlot) => {
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

        // Skip past time slots for today
        if (selectedDate === currentDate) {
          const slotTotalMinutes = slotStartHour * 60 + slotStartMinute;
          if (slotTotalMinutes <= currentTotalMinutes) {
            continue; // Skip this slot as it's in the past
          }
        }

        // Check available instructors for this slot
        console.log(`🔍 [availableTimeSlots] Checking slot ${timeString}`, {
          configSlotInstructors: configSlot.instructorIds,
          allInstructors: instructors.map((i) => ({ id: i.id, name: i.name })),
        });

        const slotInstructors = instructors.filter((instructor) => {
          const isIncluded = configSlot.instructorIds.includes(instructor.id);
          console.log(`  🔍 Checking instructor ${instructor.name} (${instructor.id}):`, {
            isIncluded,
          });

          if (!isIncluded) return false;

          // Controlla se l'istruttore ha conflitti (con controllo overlap temporale)
          const slotStartMinutes =
            parseInt(timeString.split(':')[0]) * 60 + parseInt(timeString.split(':')[1]);
          const slotEndMinutes = slotStartMinutes + 60; // Slot lezione di 1 ora

          const conflictingBookings = allBookings.filter((booking) => {
            const bookingStatus = booking.status || 'confirmed';
            if (bookingStatus !== 'confirmed') return false;
            if (booking.date !== selectedDate) return false;

            // Calcola overlap temporale
            const bookingStartMinutes =
              parseInt(booking.time.split(':')[0]) * 60 + parseInt(booking.time.split(':')[1]);
            const bookingEndMinutes = bookingStartMinutes + (booking.duration || 90);

            // Check overlap: slot inizia prima che booking finisca E booking inizia prima che slot finisca
            const hasOverlap =
              slotStartMinutes < bookingEndMinutes && bookingStartMinutes < slotEndMinutes;
            return hasOverlap;
          });

          console.log(
            `    📅 Found ${conflictingBookings.length} bookings at ${timeString} on ${selectedDate}:`,
            conflictingBookings.map((b) => ({
              id: b.id,
              instructorId: b.instructorId,
              isLessonBooking: b.isLessonBooking,
              players: b.players,
              bookedBy: b.bookedBy,
            }))
          );

          const hasConflict = conflictingBookings.some((booking) => {
            // Controllo diretto: instructorId presente
            if (booking.instructorId === instructor.id) {
              console.log(`    ❌ CONFLICT: Direct instructorId match for ${instructor.name}`);
              return true;
            }

            // Controllo aggiuntivo: lezione senza instructorId ma con nome istruttore nei giocatori
            if (booking.isLessonBooking && !booking.instructorId) {
              const instructorName = instructor.displayName || instructor.name;
              const bookingPlayers = booking.players || [];
              console.log(
                `    🔍 Checking lesson without instructorId. Looking for "${instructorName}" in players:`,
                bookingPlayers
              );

              const hasInstructorInPlayers = bookingPlayers.some((player) => {
                if (!player || typeof player !== 'string') return false;
                const match = player.toLowerCase().includes(instructorName.toLowerCase());
                console.log(`      🔍 Player "${player}" includes "${instructorName}"? ${match}`);
                return match;
              });

              if (hasInstructorInPlayers) {
                console.log(
                  `    ❌ CONFLICT: Instructor ${instructorName} found in players for lesson without instructorId:`,
                  {
                    time: timeString,
                    date: selectedDate,
                    players: bookingPlayers,
                    bookingId: booking.id,
                  }
                );
                return true;
              }
            }

            // Controllo NUOVO: maestro come giocatore in una partita normale
            if (!booking.isLessonBooking) {
              const instructorName = instructor.displayName || instructor.name;
              const bookingPlayers = booking.players || [];
              console.log(
                `    🏃 Checking if instructor is playing in match. Looking for "${instructorName}" in players:`,
                bookingPlayers
              );

              const isPlayingInMatch = bookingPlayers.some((player) => {
                if (!player || typeof player !== 'string') return false;
                const match = player.toLowerCase().includes(instructorName.toLowerCase());
                console.log(`      🔍 Player "${player}" includes "${instructorName}"? ${match}`);
                return match;
              });

              if (isPlayingInMatch) {
                console.log(
                  `    ❌ CONFLICT: Instructor ${instructorName} is playing in a match at this time:`,
                  {
                    time: timeString,
                    date: selectedDate,
                    players: bookingPlayers,
                    courtName: booking.courtName,
                    bookingId: booking.id,
                  }
                );
                return true;
              }
            }

            return false;
          });

          console.log(`    ✅ Instructor ${instructor.name} available: ${!hasConflict}`);
          return !hasConflict;
        });

        console.log(
          `  📊 Available instructors for ${timeString}:`,
          slotInstructors.map((i) => i.name)
        );

        // Check available courts for this slot - must check for overlapping bookings, not just exact time matches
        const availableCourts = (courts || []).filter((court) => {
          if (!configSlot.courtIds.includes(court.id)) return false;

          // Check if court has any overlapping bookings
          const hasConflict = allBookings.some((booking) => {
            const bookingStatus = booking.status || 'confirmed';
            if (
              booking.courtId !== court.id ||
              booking.date !== selectedDate ||
              bookingStatus !== 'confirmed'
            ) {
              return false;
            }

            // Check time overlap
            const slotStart =
              parseInt(timeString.split(':')[0]) * 60 + parseInt(timeString.split(':')[1]);
            const slotEnd = slotStart + 60; // 1 hour lesson

            const bookingStart =
              parseInt(booking.time.split(':')[0]) * 60 + parseInt(booking.time.split(':')[1]);
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
            slotInstructors.forEach((instructor) => {
              if (!mergedInstructors.some((existing) => existing.id === instructor.id)) {
                mergedInstructors.push(instructor);
              }
            });

            const mergedCourts = [...existingSlot.availableCourts];
            availableCourts.forEach((court) => {
              if (!mergedCourts.some((existing) => existing.id === court.id)) {
                mergedCourts.push(court);
              }
            });

            // Update existing slot with merged data
            slotMap.set(timeString, {
              ...existingSlot,
              availableInstructors: mergedInstructors,
              availableCourts: mergedCourts,
            });
          } else {
            // Create new slot
            slotMap.set(timeString, {
              id: `${selectedDate}-${timeString}`,
              time: timeString,
              displayTime: `${slotStartHour.toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')} - ${(slotStartHour + 1).toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')}`,
              availableInstructors: slotInstructors,
              availableCourts: availableCourts,
              configSlot: configSlot,
            });
          }
        }
      }
    });

    // Convert map to array and sort
    const slots = Array.from(slotMap.values());

    // Debug only if unexpected empty result
    if (slots.length === 0 && dayTimeSlots.length > 0) {
      console.warn(
        '⚠️ No available slots found despite having configured time slots. Check instructor/court availability or if all slots are in the past.'
      );
    }

    return slots.sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedDate, lessonConfig.timeSlots, instructors, allBookings, courts]);

  // Handle lesson booking creation
  const handleCreateLessonBooking = useCallback(async () => {
    if (!selectedDate || !selectedTimeSlot || !selectedInstructor) {
      setMessage({
        type: 'error',
        text: 'Seleziona data, orario e maestro per continuare.',
      });
      return;
    }

    try {
      setMessage({ type: '', text: '' });

      // Find available court for this slot
      const assignedCourt = selectedTimeSlot.availableCourts[0]; // Take first available court
      const selectedInstructorObj = instructors.find((i) => i.id === selectedInstructor);

      // Create lesson booking using unified service
      const lessonData = {
        // Lesson specific data
        instructorId: selectedInstructor,
        instructorName: selectedInstructorObj?.name,
        lessonType: selectedParticipants === 1 ? 'individual' : 'group',
        participants: selectedParticipants,

        // Court booking data
        courtId: assignedCourt.id,
        courtName: assignedCourt.name,
        date: selectedDate,
        time: selectedTimeSlot.time,
        duration: 60,

        // Additional data
        price: calculateLessonPrice({
          duration: 60,
          participants: selectedParticipants,
          lighting: false,
          heating: false,
          court: null,
          instructor: selectedInstructorObj,
        }),
        notes: `Lezione ${selectedParticipants === 1 ? 'individuale' : `di gruppo (${selectedParticipants} persone)`} con ${selectedInstructorObj?.name}`,
        players: [actualUser?.displayName || actualUser?.email],

        // User data
        userPhone: '',
        bookedBy: actualUser?.displayName || actualUser?.email,

        // Don't create separate court booking to avoid conflicts
        createCourtBooking: false,
      };

      console.log('Creating unified lesson booking:', lessonData);

      // Create both lesson and court bookings through unified service
      const createdLessonBooking = await createLessonBooking(lessonData);
      // Lesson booking created successfully

      setMessage({ type: 'success', text: 'Lezione prenotata con successo!' });

      // Reset form after successful creation
      setCurrentStep(1);
      setSelectedDate('');
      setSelectedTimeSlot(null);
      setSelectedParticipants(1);
      setSelectedInstructor('');
      setAvailableInstructors([]);

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
    selectedDate,
    selectedTimeSlot,
    selectedParticipants,
    selectedInstructor,
    instructors,
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
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Handle edit parameter from URL
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && lessonBookings && lessonBookings.length > 0) {
      const lessonToEdit = lessonBookings.find((lesson) => lesson.id === editId);
      if (lessonToEdit) {
        // Switch to admin tab if club mode is enabled and lesson exists
        if (clubMode) {
          setActiveTab('admin');
        }
        // Remove edit parameter from URL after handling
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('edit');
        setSearchParams(newSearchParams, { replace: true });
      }
    }
  }, [searchParams, lessonBookings, clubMode, setSearchParams, setActiveTab]);

  if (lessonLoading) {
    return (
      <Section T={T} title="Prenota Lezione" className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-300">Caricamento...</span>
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
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('book')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'book'
              ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-emerald-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Prenota Lezione
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'bookings'
              ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-emerald-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
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
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Gestione
          </button>
        )}
      </div>

      {/* Booking Form */}
      {activeTab === 'book' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 dark:border-emerald-600 p-6">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep >= step
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        currentStep > step
                          ? 'bg-blue-600 dark:bg-blue-500'
                          : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {currentStep === 1 && 'Scegli il Giorno'}
              {currentStep === 2 && 'Seleziona Orario'}
              {currentStep === 3 && 'Numero Partecipanti'}
              {currentStep === 4 && 'Scegli Maestro e Conferma'}
            </div>
          </div>

          {/* Step 1: Select Date */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Scegli il Giorno
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Prossimi 7 giorni disponibili per le lezioni
              </p>

              {availableDates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="mb-2">Nessun giorno disponibile per le lezioni</p>
                  <p className="text-sm">
                    Non ci sono slot prenotabili con maestri disponibili nei prossimi 7 giorni.
                  </p>
                  <p className="text-sm">
                    Contatta l'amministrazione per verificare la disponibilità.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {availableDates.map((dateInfo) => {
                    const isToday = dateInfo.date === new Date().toISOString().split('T')[0];

                    return (
                      <button
                        key={dateInfo.date}
                        onClick={() => {
                          setSelectedDate(dateInfo.date);
                          setSelectedTimeSlot(null); // Reset time slot when date changes
                          setSelectedParticipants(1); // Reset participants when date changes
                          setSelectedInstructor('');
                          setAvailableInstructors([]);
                          nextStep();
                        }}
                        className={`p-4 sm:p-3 min-h-[80px] sm:min-h-[90px] rounded-xl border-2 text-center transition-all duration-200 hover:scale-105 active:scale-95 ${
                          selectedDate === dateInfo.date
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-lg'
                            : 'bg-emerald-50/70 dark:bg-gray-700/50 border-emerald-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md'
                        } ${isToday ? 'ring-2 ring-green-300 dark:ring-green-500 bg-green-50 dark:bg-green-900/30' : ''}`}
                      >
                        <div className="text-xs text-gray-500 uppercase mb-1 font-medium">
                          {dateInfo.display.split(' ')[0]}
                        </div>
                        <div className="font-bold text-xl sm:text-2xl mb-1">
                          {dateInfo.display.split(' ')[1]}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Seleziona Orario
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Data selezionata:{' '}
                <span className="font-medium">
                  {new Date(selectedDate).toLocaleDateString('it-IT', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {availableTimeSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">⏰</div>
                  <p className="mb-2">Nessun orario prenotabile per questa data</p>
                  <p className="text-sm">
                    Tutti gli slot sono già occupati o non hanno maestri disponibili.
                  </p>
                  <p className="text-sm">Prova con un altro giorno o contatta l'amministrazione.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
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
                        className={`p-4 rounded-xl border-2 text-center transition-all duration-200 hover:scale-105 active:scale-95 ${
                          selectedTimeSlot?.id === slot.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-lg'
                            : 'bg-emerald-50/70 dark:bg-gray-700/50 border-emerald-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md'
                        }`}
                      >
                        <div className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">
                          {slot.displayTime}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center gap-1">
                          <span className="text-blue-600">👨‍🏫</span>
                          <span>
                            {slot.availableInstructors.length} maestr
                            {slot.availableInstructors.length === 1 ? 'o' : 'i'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={prevStep}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  ← Cambia Giorno
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select Number of Participants */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Numero Partecipanti
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Seleziona quante persone parteciperanno alla lezione
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setSelectedParticipants(num);
                      nextStep();
                    }}
                    className={`p-6 rounded-xl border-2 text-center transition-all duration-200 hover:scale-105 active:scale-95 ${
                      selectedParticipants === num
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-lg ring-2 ring-blue-200'
                        : 'bg-emerald-50/70 dark:bg-gray-700/50 border-emerald-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md'
                    }`}
                  >
                    <div className="text-3xl mb-2">
                      {num === 1 ? '👤' : num === 2 ? '👥' : num === 3 ? '👥👤' : '👥👥'}
                    </div>
                    <div className="font-bold text-lg text-gray-800 dark:text-gray-200">{num}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {num === 1 ? 'Individuale' : `${num} Persone`}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={prevStep}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  ← Cambia Orario
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Select Instructor and Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Scegli Maestro e Conferma
              </h3>

              {/* Booking Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Data:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedDate).toLocaleDateString('it-IT', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Orario:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedTimeSlot?.displayTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Durata:</span>
                  <span className="font-medium text-gray-900 dark:text-white">60 minuti</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Partecipanti:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedParticipants} {selectedParticipants === 1 ? 'persona' : 'persone'}
                  </span>
                </div>
              </div>

              {/* Price Preview */}
              {selectedInstructor && (
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700 dark:text-blue-300 font-medium">
                        Prezzo Totale:
                      </span>
                      <span className="text-blue-900 dark:text-blue-100 font-bold text-lg">
                        {euro(
                          calculateLessonPrice({
                            duration: 60,
                            participants: selectedParticipants,
                            lighting: false,
                            heating: false,
                            court: null,
                            instructor: instructors.find((i) => i.id === selectedInstructor),
                          })
                        )}
                      </span>
                    </div>
                    {selectedParticipants > 1 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-blue-600 dark:text-blue-400">Per persona:</span>
                        <span className="text-blue-800 dark:text-blue-200 font-medium">
                          {euro(
                            calculateLessonPrice({
                              duration: 60,
                              participants: selectedParticipants,
                              lighting: false,
                              heating: false,
                              court: null,
                              instructor: instructors.find((i) => i.id === selectedInstructor),
                            }) / selectedParticipants
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Instructor Selection */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">
                  Maestr
                  {availableInstructors.length === 1 ? 'o disponibile' : 'i disponibili'} (
                  {availableInstructors.length})
                </h4>

                {availableInstructors.length === 1 ? (
                  // Single instructor - show info card
                  <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{
                          backgroundColor: availableInstructors[0].instructorData?.color,
                        }}
                      >
                        {availableInstructors[0].name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-medium text-lg text-gray-900 dark:text-white">
                          {availableInstructors[0].name}
                        </div>
                        {availableInstructors[0].instructorData?.specialties?.length > 0 && (
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {availableInstructors[0].instructorData.specialties.join(', ')}
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
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-400 ring-2 ring-emerald-200 dark:ring-emerald-500'
                            : 'bg-emerald-50/70 dark:bg-gray-700/50 border-emerald-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{
                              backgroundColor: instructor.instructorData?.color,
                            }}
                          >
                            {instructor.name?.charAt(0) || '?'}
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {instructor.name}
                          </div>
                        </div>
                        {instructor.instructorData?.specialties?.length > 0 && (
                          <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            {instructor.instructorData.specialties.join(', ')}
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
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  ← Cambia Partecipanti
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 dark:border-emerald-600 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Le Mie Lezioni
          </h3>

          {lessonBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
                    className="border-2 dark:border-emerald-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="font-medium text-gray-900 dark:text-white">
                          Lezione con{' '}
                          {instructors.find((i) => i.id === booking.instructorId)?.name ||
                            booking.instructorName}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          📅{' '}
                          {new Date(booking.date).toLocaleDateString('it-IT', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          🕐 {booking.time} - {booking.duration} minuti
                        </div>
                        {booking.participants && booking.participants > 1 && (
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            👥 {booking.participants} partecipanti
                          </div>
                        )}
                        {booking.price > 0 && (
                          <div className="text-sm font-medium text-green-600 dark:text-green-400">
                            💰 Prezzo: {euro(booking.price)}
                            {booking.participants > 1 && (
                              <span className="text-xs ml-2 text-gray-500">
                                ({euro(booking.price / booking.participants)}
                                /persona)
                              </span>
                            )}
                          </div>
                        )}
                        {booking.courtName && (
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            🎾 Campo: {booking.courtName}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleCancelLesson(booking.id)}
                        className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
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
          courts={courts || []}
          onClearAllLessons={handleClearAllLessons}
          lessonBookingsCount={lessonBookings?.length || 0}
        />
      )}
    </Section>
  );
}
