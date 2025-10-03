// =============================================
// FILE: src/services/adminDashboard.js
// Servizi per caricare dati reali della dashboard admin club
// AGGIORNATO: Utilizza il sistema unificato di prenotazioni
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
    // Usa il sistema unificato per caricare le prenotazioni
    const allBookings = await UnifiedBookingService.getPublicBookings({ 
      forceRefresh: true, 
      clubId,
      includeLesson: false // Escludiamo le lezioni qui, le gestiamo separatamente
    });
    
    // Il sistema unificato già filtra per clubId e status
    const bookings = allBookings.map(booking => ({
      id: booking.id,
      ...booking,
      // Assicuriamoci che la data sia in formato stringa YYYY-MM-DD
      date: booking.date || new Date().toISOString().split('T')[0],
      // Prezzo di default se non specificato
      price: booking.price || 40,
      // Status di default
      status: booking.status || 'confirmed'
    }));
    
    return bookings;
  } catch (error) {
    console.error('Error loading unified club bookings:', error);
    
    // Fallback: ritorna array vuoto invece di dati di test
    return [];
  }
}

/**
 * Carica le lezioni per un club specifico usando il sistema unificato
 */
export async function loadClubLessons(clubId) {
  try {
    // Usa il sistema unificato principale per caricare le lezioni (isLessonBooking: true)
    const allBookings = await UnifiedBookingService.getPublicBookings({ 
      forceRefresh: true, 
      clubId,
      includeLesson: true // Include le lezioni
    });
    
    // Filtra solo le lezioni (isLessonBooking: true)
    const lessons = allBookings
      .filter(booking => booking.isLessonBooking === true)
      .map(lesson => ({
        id: lesson.id,
        ...lesson,
        date: lesson.date || new Date().toISOString().split('T')[0],
        price: lesson.price || 50,
        status: lesson.status || 'confirmed'
      }));
    
    return lessons;
  } catch (error) {
    console.error('Error loading unified lessons:', error);
    
    // Fallback: ritorna array vuoto invece di dati di test
    return [];
  }
}

/**
 * Carica i maestri/istruttori per un club specifico
 */
export async function loadClubInstructors(clubId) {
  try {
    // Proviamo prima la collezione instructors del club
    let instructorsRef = collection(db, 'clubs', clubId, 'instructors');
    let instructorsSnapshot = await getDocs(instructorsRef);
    
    if (instructorsSnapshot.empty) {
      // Fallback: cerca nei players con role instructor (valore corretto: 'instructor')
      const playersRef = collection(db, 'clubs', clubId, 'players');
      const instructorQuery = query(playersRef, where('category', '==', 'instructor'));
      instructorsSnapshot = await getDocs(instructorQuery);
    }
    
    const instructors = instructorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Disponibilità di default per oggi
      availability: doc.data().availability || {
        [new Date().toISOString().split('T')[0]]: ['09:00-18:00']
      }
    }));
    
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
    const courtsRef = collection(db, 'clubs', clubId, 'courts');
    const courtsSnapshot = await getDocs(courtsRef);
    
    const courts = courtsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return courts;
  } catch (error) {
    console.error('Error loading club courts:', error);
    // Fallback: dati di default per i campi
    return [
      { id: 'campo1', name: 'Campo 1 - Centrale', type: 'terra-rossa' },
      { id: 'campo2', name: 'Campo 2', type: 'terra-rossa' },
      { id: 'campo3', name: 'Campo 3', type: 'terra-rossa' }
    ];
  }
}

/**
 * Calcola i maestri disponibili oggi basandosi sulle fasce orarie configurate
 */
function calculateInstructorsAvailableToday(instructors, lessonConfig, bookings, lessons, today) {
  if (!lessonConfig?.timeSlots || lessonConfig.timeSlots.length === 0 || instructors.length === 0) {
    return [];
  }

  const currentTime = new Date();
  const currentTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  const instructorSlots = new Map();
  
  // Unifica tutte le prenotazioni (bookings + lessons) per il controllo conflitti
  const allTodayBookings = [
    ...bookings.filter(b => b.date === today && b.status === 'confirmed'),
    ...lessons.filter(l => l.date === today && l.status === 'confirmed')
  ];

  // Analizza ogni fascia oraria configurata
  lessonConfig.timeSlots.forEach((configSlot) => {
    if (!configSlot.isActive) return;

    // Controlla se oggi è incluso nelle date selezionate della fascia
    const includesDate = configSlot.selectedDates.some(
      selectedDate => selectedDate === today
    );
    
    if (!includesDate) return;

    // Genera slot orari per questa configurazione
    const [startHour, startMinute] = configSlot.startTime.split(":").map(Number);
    const [endHour, endMinute] = configSlot.endTime.split(":").map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += 60) {
      if (minutes + 60 > endTotalMinutes) continue;

      const slotStartHour = Math.floor(minutes / 60);
      const slotStartMinute = minutes % 60;
      const timeString = `${slotStartHour.toString().padStart(2, "0")}:${slotStartMinute.toString().padStart(2, "0")}`;
      
      // Salta slot orari già passati per oggi
      const slotTotalMinutes = slotStartHour * 60 + slotStartMinute;
      if (slotTotalMinutes <= currentTotalMinutes) {
        continue;
      }

      // Controlla ogni istruttore assegnato a questa fascia
      configSlot.instructorIds.forEach(instructorId => {
        const instructor = instructors.find(i => i.id === instructorId);
        if (!instructor) return;

        // Controlla se l'istruttore ha conflitti (prenotazioni o lezioni)
        const hasConflict = allTodayBookings.some((booking) => {
          return (
            booking.time === timeString &&
            booking.instructorId === instructorId
          );
        });

        if (!hasConflict) {
          if (!instructorSlots.has(instructorId)) {
            // Usa le specialties dall'instructorData se disponibili, altrimenti fallback a Padel
            const specialties = instructor.instructorData?.specialties || [];
            const primarySpecialty = specialties.length > 0 ? specialties[0] : 'padel';
            const displaySpecialty = primarySpecialty.charAt(0).toUpperCase() + primarySpecialty.slice(1).toLowerCase();
            
            instructorSlots.set(instructorId, {
              id: instructor.id,
              name: instructor.displayName || instructor.name,
              specialization: instructor.specialization || displaySpecialty,
              availableSlots: []
            });
          }
          instructorSlots.get(instructorId).availableSlots.push({
            time: timeString,
            displayTime: `${slotStartHour.toString().padStart(2, "0")}:${slotStartMinute.toString().padStart(2, "0")} - ${(slotStartHour + 1).toString().padStart(2, "0")}:${slotStartMinute.toString().padStart(2, "0")}`
          });
        }
      });
    }
  });

  // Converti la mappa in array e mantieni solo istruttori con slot disponibili
  return Array.from(instructorSlots.values())
    .filter(item => item.availableSlots.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Funzione principale per caricare tutti i dati della dashboard admin
 */
export async function loadAdminDashboardData(clubId) {
  try {
    // Carica tutti i dati in parallelo
    const [bookings, lessons, instructors, courts, clubSettings] = await Promise.all([
      loadClubBookings(clubId),
      loadClubLessons(clubId),
      loadClubInstructors(clubId),
      loadClubCourts(clubId),
      getClubSettings(clubId)
    ]);
    
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Filtra dati per oggi (supporta diversi formati data)
    const todayBookings = bookings.filter(booking => {
      if (!booking.date) {
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
        return false;
      }
      
      const isToday = bookingDate === today;
      const isNotCancelled = booking.status !== 'cancelled';
      
      return isToday && isNotCancelled;
    });
    
    const todayLessons = lessons.filter(lesson => {
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
    
    // Non mostrare prenotazioni fallback se non ci sono prenotazioni per oggi
    let displayTodayBookings = todayBookings; // Mostra SOLO le prenotazioni di oggi
    let actualTodayCount = todayBookings.length + todayLessons.length; // ✅ Include anche le lezioni nell'utilizzo campi
    
    // Calcola prenotazioni per domani (supporta diversi formati data)
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const tomorrowBookings = bookings.filter(booking => {
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
    const tomorrowLessons = lessons.filter(lesson => {
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
    
    // Maestri disponibili oggi basato sulle fasce orarie configurate
    const availableInstructors = calculateInstructorsAvailableToday(
      instructors, 
      clubSettings?.lessonConfig, 
      bookings, 
      lessons, 
      today
    );
    
    // Calcola statistiche
    const weeklyBookings = bookings.filter(booking => 
      booking.date >= weekAgo && booking.status !== 'cancelled'
    );
    
    const todayRevenue = displayTodayBookings.reduce((sum, booking) => {
      return sum + (booking.price || 0);
    }, 0) + todayLessons.reduce((sum, lesson) => {
      return sum + (lesson.price || 0);
    }, 0);
    
    // Utilizzo campi basato su prenotazioni + lezioni di oggi
    const courtUtilization = courts.length > 0 
      ? (actualTodayCount / (courts.length * 10)) * 100 // 10 slot per campo al giorno (include prenotazioni + lezioni)
      : 0;
    
    const dashboardData = {
      todayBookings: displayTodayBookings, // Usa le prenotazioni di display
      todayLessons,
      availableInstructors,
      courts,
      stats: {
        todayBookingsCount: actualTodayCount, // Usa il conteggio REALE per oggi (può essere 0)
        tomorrowBookingsCount: tomorrowBookings.length, // Nuovo: conteggio prenotazioni domani
        todayLessonsCount: todayLessons.length, // Nuovo: conteggio lezioni oggi
        tomorrowLessonsCount: tomorrowLessons.length, // Nuovo: conteggio lezioni domani
        todayRevenue: Math.round(todayRevenue),
        weeklyBookings: weeklyBookings.length,
        memberCount: 0, // Sarà aggiornato dal ClubContext
        courtUtilization: Math.round(courtUtilization)
      },
      loading: false,
      error: null
    };
    
    return dashboardData;
    
  } catch (error) {
    console.error('Error loading admin dashboard data:', error);
    throw error;
  }
}