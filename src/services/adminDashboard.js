// =============================================
// FILE: src/services/adminDashboard.js
// Servizi per caricare dati reali della dashboard admin club
// AGGIORNATO: Utilizza il sistema unificato di prenotazioni
// DEBUG LOGS CLEANED - Updated
// =============================================
import { db } from './firebase.js';
import { collection, getDocs, query, where } from 'firebase/firestore';
import UnifiedBookingService from './unified-booking-service.js';
import { getClubSettings } from './club-settings.js';

/**
 * Carica le prenotazioni per un club specifico usando il sistema unificato
 */
export async function loadClubBookings(clubId) {
  try {
    // Loading unified bookings for club

    // Usa il sistema unificato per caricare le prenotazioni
    const allBookings = await UnifiedBookingService.getPublicBookings({
      forceRefresh: true,
      clubId,
      includeLesson: false, // Escludiamo le lezioni qui, le gestiamo separatamente
    });

    // Raw unified bookings received - debug data removed

    // Raw unified bookings loaded

    // Il sistema unificato già filtra per clubId e status
    const bookings = allBookings.map((booking) => ({
      id: booking.id,
      ...booking,
      // Assicuriamoci che la data sia in formato stringa YYYY-MM-DD
      date: booking.date || new Date().toISOString().split('T')[0],
      // Prezzo di default se non specificato
      price: booking.price || 40,
      // Status di default
      status: booking.status || 'confirmed',
    }));

    // Loaded unified bookings for club

    return bookings;
  } catch (error) {
    console.error('Error loading unified club bookings:', error);

    // Fallback: ritorna array vuoto invece di dati di test
    // Returning empty bookings array due to error
    return [];
  }
}

/**
 * Carica le lezioni per un club specifico usando il sistema unificato
 */
export async function loadClubLessons(clubId) {
  try {
    // Loading unified lessons for club

    // Usa il sistema unificato principale per caricare le lezioni (isLessonBooking: true)
    const allBookings = await UnifiedBookingService.getPublicBookings({
      forceRefresh: true,
      clubId,
      includeLesson: true, // Include le lezioni
    });

    // Raw unified data received for lessons - debug removed

    // Filtra solo le lezioni (isLessonBooking: true)
    const lessons = allBookings
      .filter((booking) => booking.isLessonBooking === true)
      .map((lesson) => ({
        id: lesson.id,
        ...lesson,
        date: lesson.date || new Date().toISOString().split('T')[0],
        price: lesson.price || 50,
        status: lesson.status || 'confirmed',
      }));

    // Processed lessons for club - debug removed

    return lessons;
  } catch (error) {
    console.error('Error loading unified lessons:', error);

    // Fallback: ritorna array vuoto invece di dati di test
    // Returning empty lessons array due to error
    return [];
  }
}

/**
 * Carica i maestri/istruttori per un club specifico
 */
export async function loadClubInstructors(clubId) {
  try {
    if (!clubId) {
      console.warn('clubId mancante in loadClubInstructors');
      return [];
    }
    // Loading instructors for club

    // Proviamo prima la collezione instructors del club
    let instructorsRef = collection(db, 'clubs', clubId, 'instructors');
    let instructorsSnapshot = await getDocs(instructorsRef);

    if (instructorsSnapshot.empty) {
      // Fallback: cerca nei players con role instructor (valore corretto: 'instructor')
      const playersRef = collection(db, 'clubs', clubId, 'players');
      const instructorQuery = query(playersRef, where('category', '==', 'instructor'));
      instructorsSnapshot = await getDocs(instructorQuery);
    }

    const instructors = instructorsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Disponibilità di default per oggi
      availability: doc.data().availability || {
        [new Date().toISOString().split('T')[0]]: ['09:00-18:00'],
      },
    }));

    // Loaded instructors for club
    return instructors;
  } catch (error) {
    console.error('Error loading club instructors:', error);
    return [];
  }
}

/**
 * Carica i campi da tennis per un club specifico
 */
export async function loadClubCourts(clubId) {
  try {
    if (!clubId) {
      console.warn('clubId mancante in loadClubCourts');
      return [];
    }
    // Loading courts for club

    const courtsRef = collection(db, 'clubs', clubId, 'courts');
    const courtsSnapshot = await getDocs(courtsRef);

    const courts = courtsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Loaded courts for club
    return courts;
  } catch (error) {
    console.error('Error loading club courts:', error);
    // Fallback: dati di default per i campi
    return [
      { id: 'campo1', name: 'Campo 1 - Centrale', type: 'terra-rossa' },
      { id: 'campo2', name: 'Campo 2', type: 'terra-rossa' },
      { id: 'campo3', name: 'Campo 3', type: 'terra-rossa' },
    ];
  }
}

/**
 * Calcola i maestri disponibili oggi basandosi sulle fasce orarie configurate
 */
function calculateInstructorsAvailableToday(instructors, lessonConfig, bookings, lessons, today) {
  if (!lessonConfig?.timeSlots || lessonConfig.timeSlots.length === 0 || instructors.length === 0) {
    console.log('⚠️ No timeSlots or instructors:', {
      hasTimeSlots: !!lessonConfig?.timeSlots,
      timeSlotsCount: lessonConfig?.timeSlots?.length || 0,
      instructorsCount: instructors.length,
    });
    return [];
  }

  console.log('🔍 Calculating available instructors:', {
    today,
    timeSlotsCount: lessonConfig.timeSlots.length,
    instructorsCount: instructors.length,
    activeTimeSlots: lessonConfig.timeSlots.filter((s) => s.isActive).length,
  });

  const currentTime = new Date();
  const currentTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const instructorSlots = new Map();

  // Unifica tutte le prenotazioni (bookings + lessons) per il controllo conflitti
  const allTodayBookings = [
    ...bookings.filter((b) => b.date === today && b.status === 'confirmed'),
    ...lessons.filter((l) => l.date === today && l.status === 'confirmed'),
  ];

  console.log('🔍 [calculateInstructorsAvailableToday] All today bookings:', {
    count: allTodayBookings.length,
    bookings: allTodayBookings.map((b) => ({
      id: b.id,
      time: b.time,
      date: b.date,
      instructorId: b.instructorId,
      isLessonBooking: b.isLessonBooking,
      players: b.players,
      bookedBy: b.bookedBy,
    })),
  });

  // Verifica se ci sono lezioni senza instructorId (prenotazioni manuali incomplete)
  const lessonsWithoutInstructor = allTodayBookings.filter(
    (b) => b.isLessonBooking === true && !b.instructorId
  );
  if (lessonsWithoutInstructor.length > 0) {
    console.warn(
      '⚠️ Found lessons without instructorId (manual bookings):',
      lessonsWithoutInstructor.map((l) => ({
        id: l.id,
        time: l.time,
        players: l.players,
        date: l.date,
      }))
    );
  }

  // Analizza ogni fascia oraria configurata
  lessonConfig.timeSlots.forEach((configSlot) => {
    if (!configSlot.isActive) return;

    // Controlla se questa fascia è valida per oggi
    let isValidForToday = false;

    // Caso 1: Fascia con date specifiche (selectedDates)
    if (
      configSlot.selectedDates &&
      Array.isArray(configSlot.selectedDates) &&
      configSlot.selectedDates.length > 0
    ) {
      isValidForToday = configSlot.selectedDates.some((selectedDate) => selectedDate === today);
    }
    // Caso 2: Fascia ricorrente (dayOfWeek)
    else if (configSlot.dayOfWeek !== undefined && configSlot.dayOfWeek !== null) {
      const todayDayOfWeek = new Date(today).getDay(); // 0 = Domenica, 1 = Lunedì, etc.
      isValidForToday = configSlot.dayOfWeek === todayDayOfWeek;
    }

    if (!isValidForToday) return;

    // Genera slot orari per questa configurazione
    const [startHour, startMinute] = configSlot.startTime.split(':').map(Number);
    const [endHour, endMinute] = configSlot.endTime.split(':').map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += 60) {
      if (minutes + 60 > endTotalMinutes) continue;

      const slotStartHour = Math.floor(minutes / 60);
      const slotStartMinute = minutes % 60;
      const timeString = `${slotStartHour.toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')}`;

      // Salta slot orari già passati per oggi
      const slotTotalMinutes = slotStartHour * 60 + slotStartMinute;
      if (slotTotalMinutes <= currentTotalMinutes) {
        continue;
      }

      // Controlla ogni istruttore assegnato a questa fascia
      const instructorIds = configSlot.instructorIds || [];
      if (instructorIds.length === 0) {
        // Se non ci sono istruttori assegnati, salta questo slot
        return;
      }

      instructorIds.forEach((instructorId) => {
        const instructor = instructors.find((i) => i.id === instructorId);
        if (!instructor) return;

        console.log(
          `🔍 [calculateInstructorsAvailableToday] Checking instructor ${instructor.name} (${instructorId}) for slot ${timeString}`
        );

        // Controlla se l'istruttore ha conflitti (prenotazioni o lezioni) con overlap temporale
        const slotStartMinutes =
          parseInt(timeString.split(':')[0]) * 60 + parseInt(timeString.split(':')[1]);
        const slotEndMinutes = slotStartMinutes + 60; // Slot lezione di 1 ora

        const conflictingBookings = allTodayBookings.filter((b) => {
          const bookingStartMinutes =
            parseInt(b.time.split(':')[0]) * 60 + parseInt(b.time.split(':')[1]);
          const bookingEndMinutes = bookingStartMinutes + (b.duration || 90);

          // Check overlap: slot inizia prima che booking finisca E booking inizia prima che slot finisca
          const hasOverlap =
            slotStartMinutes < bookingEndMinutes && bookingStartMinutes < slotEndMinutes;
          return hasOverlap;
        });
        console.log(
          `  📅 Found ${conflictingBookings.length} bookings at ${timeString}:`,
          conflictingBookings.map((b) => ({
            id: b.id,
            instructorId: b.instructorId,
            isLessonBooking: b.isLessonBooking,
            players: b.players,
          }))
        );

        const hasConflict = conflictingBookings.some((booking) => {
          // Controllo diretto: instructorId presente nella prenotazione
          if (booking.instructorId === instructorId) {
            console.log(`  ❌ CONFLICT: Direct instructorId match for ${instructor.name}`);
            return true;
          }

          // Controllo aggiuntivo: lezione senza instructorId ma con nome istruttore nei giocatori
          // (prenotazione manuale per lezione dove l'admin ha dimenticato di impostare instructorId)
          if (booking.isLessonBooking && !booking.instructorId) {
            const instructorName = instructor.displayName || instructor.name;
            const bookingPlayers = booking.players || [];
            console.log(
              `  🔍 Checking lesson without instructorId. Looking for "${instructorName}" in players:`,
              bookingPlayers
            );

            const hasInstructorInPlayers = bookingPlayers.some((player) => {
              if (!player || typeof player !== 'string') return false;
              const match = player.toLowerCase().includes(instructorName.toLowerCase());
              console.log(`    🔍 Player "${player}" includes "${instructorName}"? ${match}`);
              return match;
            });

            if (hasInstructorInPlayers) {
              console.log(
                `  ❌ CONFLICT: Instructor ${instructorName} found in players for lesson without instructorId:`,
                {
                  time: timeString,
                  instructor: instructorName,
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
              `  🏃 Checking if instructor is playing in match. Looking for "${instructorName}" in players:`,
              bookingPlayers
            );

            const isPlayingInMatch = bookingPlayers.some((player) => {
              if (!player || typeof player !== 'string') return false;
              const match = player.toLowerCase().includes(instructorName.toLowerCase());
              console.log(`    🔍 Player "${player}" includes "${instructorName}"? ${match}`);
              return match;
            });

            if (isPlayingInMatch) {
              console.log(
                `  ❌ CONFLICT: Instructor ${instructorName} is playing in a match at this time:`,
                {
                  time: timeString,
                  instructor: instructorName,
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

        console.log(
          `  ✅ Instructor ${instructor.name} available at ${timeString}: ${!hasConflict}`
        );

        if (!hasConflict) {
          if (!instructorSlots.has(instructorId)) {
            // Usa le specialties dall'instructorData se disponibili, altrimenti fallback a Padel
            const specialties = instructor.instructorData?.specialties || [];
            const primarySpecialty = specialties.length > 0 ? specialties[0] : 'padel';
            const displaySpecialty =
              primarySpecialty.charAt(0).toUpperCase() + primarySpecialty.slice(1).toLowerCase();

            instructorSlots.set(instructorId, {
              id: instructor.id,
              name: instructor.displayName || instructor.name,
              specialization: instructor.specialization || displaySpecialty,
              availableSlots: [],
            });
          }
          instructorSlots.get(instructorId).availableSlots.push({
            time: timeString,
            displayTime: `${slotStartHour.toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')} - ${(slotStartHour + 1).toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')}`,
          });
        }
      });
    }
  });

  // Converti la mappa in array e mantieni solo istruttori con slot disponibili
  const result = Array.from(instructorSlots.values())
    .filter((item) => item.availableSlots.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  console.log('✅ Available instructors calculated:', {
    totalInstructors: result.length,
    instructorsWithSlots: result.map((i) => ({
      name: i.name,
      slotsCount: i.availableSlots.length,
      slots: i.availableSlots.map((s) => s.time),
    })),
  });

  return result;
}

/**
 * Funzione principale per caricare tutti i dati della dashboard admin
 */
export async function loadAdminDashboardData(clubId) {
  try {
    if (!clubId) {
      throw new Error('clubId mancante in loadAdminDashboardData');
    }
    console.log('🔍 [loadAdminDashboardData] Starting data load for club:', clubId);

    // Carica tutti i dati in parallelo con try-catch individuali
    const bookingsPromise = loadClubBookings(clubId)
      .then((r) => {
        console.log('✅ [loadAdminDashboardData] Bookings loaded:', r.length);
        return r;
      })
      .catch((e) => {
        console.error('❌ [loadAdminDashboardData] Bookings FAILED:', e.code, e.message);
        throw e;
      });

    const lessonsPromise = loadClubLessons(clubId)
      .then((r) => {
        console.log('✅ [loadAdminDashboardData] Lessons loaded:', r.length);
        return r;
      })
      .catch((e) => {
        console.error('❌ [loadAdminDashboardData] Lessons FAILED:', e.code, e.message);
        throw e;
      });

    const instructorsPromise = loadClubInstructors(clubId)
      .then((r) => {
        console.log('✅ [loadAdminDashboardData] Instructors loaded:', r.length);
        return r;
      })
      .catch((e) => {
        console.error('❌ [loadAdminDashboardData] Instructors FAILED:', e.code, e.message);
        throw e;
      });

    const courtsPromise = loadClubCourts(clubId)
      .then((r) => {
        console.log('✅ [loadAdminDashboardData] Courts loaded:', r.length);
        return r;
      })
      .catch((e) => {
        console.error('❌ [loadAdminDashboardData] Courts FAILED:', e.code, e.message);
        throw e;
      });

    const clubSettingsPromise = getClubSettings(clubId)
      .then((r) => {
        console.log('✅ [loadAdminDashboardData] Club settings loaded');
        return r;
      })
      .catch((e) => {
        console.error('❌ [loadAdminDashboardData] Club settings FAILED:', e.code, e.message);
        throw e;
      });

    const [bookings, lessons, instructors, courts, clubSettings] = await Promise.all([
      bookingsPromise,
      lessonsPromise,
      instructorsPromise,
      courtsPromise,
      clubSettingsPromise,
    ]);

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Debug: Today date
    // Debug: Total bookings loaded
    // Debug: Total lessons loaded

    // Debug: removed sample bookings
    if (bookings.length > 0) {
      // Sample bookings debug removed

      // Debug: mostra tutte le date uniche nelle prenotazioni
      // const uniqueDates = [
      //   ...new Set(
      //     bookings.map((b) => {
      //       if (typeof b.date === 'string') {
      //         return b.date.split('T')[0];
      //       } else if (b.date && b.date.toDate) {
      //         return b.date.toDate().toISOString().split('T')[0];
      //       } else if (b.date instanceof Date) {
      //         return b.date.toISOString().split('T')[0];
      //       }
      //       return 'invalid-date';
      //     })
      //   ),
      // ].sort();

      // All booking dates found - debug removed
      // Looking for today - debug removed

      // Debug: mostra specificamente le prenotazioni per oggi (prima del filtro)
      const todayBookingsDebug = bookings.filter((b) => {
        let bookingDate;
        if (typeof b.date === 'string') {
          bookingDate = b.date.split('T')[0];
        } else if (b.date && b.date.toDate) {
          bookingDate = b.date.toDate().toISOString().split('T')[0];
        } else if (b.date instanceof Date) {
          bookingDate = b.date.toISOString().split('T')[0];
        }
        return bookingDate === today;
      });

      console.log(`🔍 Raw bookings for today (${today}):`, todayBookingsDebug.length);
      if (todayBookingsDebug.length > 0) {
        console.log(
          `🔍 Today bookings sample:`,
          todayBookingsDebug.map((b) => ({
            id: b.id.substring(0, 8),
            date: b.date,
            time: b.time,
            type: b.type || b.bookingType,
            status: b.status,
            isLessonBooking: b.isLessonBooking,
          }))
        );
      }
    }

    // Filtra dati per oggi (supporta diversi formati data)
    const todayBookings = bookings.filter((booking) => {
      if (!booking.date) {
        // console.log(`🚫 Booking without date:`, booking.id);
        return false;
      }

      // Converti la data del booking in formato YYYY-MM-DD
      let bookingDate;
      if (typeof booking.date === 'string') {
        // Se è già una stringa, prendi solo la parte della data
        bookingDate = booking.date.split('T')[0];
      } else if (booking.date.toDate) {
        // Se è un Timestamp di Firebase
        bookingDate = booking.date.toDate().toISOString().split('T')[0];
      } else if (booking.date instanceof Date) {
        // Se è un oggetto Date
        bookingDate = booking.date.toISOString().split('T')[0];
      } else {
        // console.log(`🚫 Unknown date format for booking:`, booking.id, booking.date);
        return false;
      }

      const isToday = bookingDate === today;
      const isNotCancelled = booking.status !== 'cancelled';

      if (isToday) {
        // console.log(`✅ Found today booking:`, {
        //   id: booking.id,
        //   date: booking.date,
        //   bookingDate,
        //   status: booking.status,
        //   isNotCancelled
        // });
      }

      return isToday && isNotCancelled;
    });
    const todayLessons = lessons.filter((lesson) => {
      if (!lesson.date) return false;

      // Converti la data della lezione in formato YYYY-MM-DD
      let lessonDate;
      if (typeof lesson.date === 'string') {
        lessonDate = lesson.date.split('T')[0];
      } else if (lesson.date.toDate) {
        lessonDate = lesson.date.toDate().toISOString().split('T')[0];
      } else if (lesson.date instanceof Date) {
        lessonDate = lesson.date.toISOString().split('T')[0];
      } else {
        return false;
      }

      return lessonDate === today && lesson.status === 'confirmed';
    });

    // console.log(`📅 Today bookings: ${todayBookings.length}`);
    // console.log(`📚 Today lessons: ${todayLessons.length}`);

    // Non mostrare prenotazioni fallback se non ci sono prenotazioni per oggi
    let displayTodayBookings = todayBookings; // Mostra SOLO le prenotazioni di oggi
    let totalTodayCount = todayBookings.length + todayLessons.length; // ✅ Totale per utilizzo campi (prenotazioni + lezioni)

    if (todayBookings.length === 0 && todayLessons.length === 0) {
      // console.log(`📅 No bookings or lessons found for today (${today})`);
    }
    // console.log(`📊 Today total count for court utilization: ${totalTodayCount} (${todayBookings.length} bookings + ${todayLessons.length} lessons)`);

    // Calcola prenotazioni per domani (supporta diversi formati data)
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const tomorrowBookings = bookings.filter((booking) => {
      if (!booking.date) return false;

      // Converti la data del booking in formato YYYY-MM-DD
      let bookingDate;
      if (typeof booking.date === 'string') {
        // Se è già una stringa, prendi solo la parte della data
        bookingDate = booking.date.split('T')[0];
      } else if (booking.date.toDate) {
        // Se è un Timestamp di Firebase
        bookingDate = booking.date.toDate().toISOString().split('T')[0];
      } else if (booking.date instanceof Date) {
        // Se è un oggetto Date
        bookingDate = booking.date.toISOString().split('T')[0];
      } else {
        return false;
      }

      return bookingDate === tomorrow && booking.status !== 'cancelled';
    });

    // Calcola lezioni per domani (supporta diversi formati data)
    const tomorrowLessons = lessons.filter((lesson) => {
      if (!lesson.date) return false;

      // Converti la data della lezione in formato YYYY-MM-DD
      let lessonDate;
      if (typeof lesson.date === 'string') {
        lessonDate = lesson.date.split('T')[0];
      } else if (lesson.date.toDate) {
        lessonDate = lesson.date.toDate().toISOString().split('T')[0];
      } else if (lesson.date instanceof Date) {
        lessonDate = lesson.date.toISOString().split('T')[0];
      } else {
        return false;
      }

      return lessonDate === tomorrow && lesson.status === 'confirmed';
    });

    // console.log(`📅 Tomorrow (${tomorrow}) bookings: ${tomorrowBookings.length}`);
    // console.log(`📚 Tomorrow lessons: ${tomorrowLessons.length}`);

    // Maestri disponibili oggi basato sulle fasce orarie configurate
    const availableInstructors = calculateInstructorsAvailableToday(
      instructors,
      clubSettings?.lessonConfig,
      bookings,
      lessons,
      today
    );

    // Calcola statistiche
    const weeklyBookings = bookings.filter(
      (booking) => booking.date >= weekAgo && booking.status !== 'cancelled'
    );

    const todayRevenue =
      displayTodayBookings.reduce((sum, booking) => {
        return sum + (booking.price || 0);
      }, 0) +
      todayLessons.reduce((sum, lesson) => {
        return sum + (lesson.price || 0);
      }, 0);

    // Utilizzo campi basato su prenotazioni + lezioni di oggi
    const courtUtilization =
      courts.length > 0
        ? (totalTodayCount / (courts.length * 10)) * 100 // 10 slot per campo al giorno (include prenotazioni + lezioni)
        : 0;

    const dashboardData = {
      todayBookings: displayTodayBookings, // Usa le prenotazioni di display
      todayLessons,
      availableInstructors,
      courts,
      stats: {
        todayBookingsCount: todayBookings.length, // ✅ SOLO prenotazioni campo oggi
        tomorrowBookingsCount: tomorrowBookings.length, // ✅ SOLO prenotazioni campo domani
        todayLessonsCount: todayLessons.length, // ✅ SOLO lezioni oggi
        tomorrowLessonsCount: tomorrowLessons.length, // ✅ SOLO lezioni domani
        todayRevenue: Math.round(todayRevenue),
        weeklyBookings: weeklyBookings.length,
        memberCount: 0, // Sarà aggiornato dal ClubContext
        courtUtilization: Math.round(courtUtilization),
      },
      loading: false,
      error: null,
    };

    // console.log(`✅ [ADMIN-DASHBOARD] Final dashboard data for club ${clubId}:`, {
    //   clubId,
    //   timestamp: new Date().toLocaleTimeString(),
    //   bookings: {
    //     total: bookings.length,
    //     todayActual: actualTodayCount,
    //     todayDisplay: displayTodayBookings.length,
    //     tomorrow: tomorrowBookings.length
    //   },
    //   lessons: {
    //     total: lessons.length,
    //     today: todayLessons.length,
    //     tomorrow: tomorrowLessons.length
    //   },
    //   resources: {
    //     instructors: instructors.length,
    //     courts: courts.length
    //   },
    //   finalStats: dashboardData.stats,
    //   todayBookingsDetailed: displayTodayBookings.map(b => ({
    //     id: b.id,
    //     date: b.date,
    //     time: b.time,
    //     clubId: b.clubId,
    //     status: b.status
    //   }))
    // });

    return dashboardData;
  } catch (error) {
    console.error('Error loading admin dashboard data:', error);
    throw error;
  }
}
