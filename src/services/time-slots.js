// =============================================
// FILE: src/services/time-slots.js
// Servizio per la gestione dei time slots degli istruttori
// =============================================

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase.js';

// =============================================
// TIME SLOTS MANAGEMENT
// =============================================

/**
 * Ottiene tutti i time slots di un istruttore per un club specifico
 * Include sia i time slots personali che quelli dalle lezioni config
 * @param {string} clubId - ID del club
 * @param {string} instructorId - ID dell'istruttore
 * @returns {Promise<Array>} Lista dei time slots
 */
export async function getInstructorTimeSlots(clubId, instructorId) {
  try {
    console.log('🔍 [getInstructorTimeSlots] Loading for:', { clubId, instructorId });

    const allTimeSlots = [];

    // 1. Carica i time slots personali dalla collezione timeSlots
    try {
      const timeSlotsRef = collection(db, 'clubs', clubId, 'timeSlots');
      const q = query(timeSlotsRef, where('instructorId', '==', instructorId));

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allTimeSlots.push({
          id: doc.id,
          source: 'personal',
          ...doc.data(),
        });
      });
      console.log('✅ [getInstructorTimeSlots] Personal slots:', allTimeSlots.length);
    } catch (error) {
      console.log('⚠️ [getInstructorTimeSlots] No personal slots collection:', error.message);
    }

    // 2. Carica i time slots dalle lezioni config
    try {
      const lessonConfigRef = doc(db, 'clubs', clubId, 'settings', 'config');
      const lessonConfigDoc = await getDoc(lessonConfigRef);

      if (lessonConfigDoc.exists()) {
        const settingsData = lessonConfigDoc.data();
        const lessonConfig = settingsData.lessonConfig || {};
        const configTimeSlots = lessonConfig.timeSlots || [];

        console.log(
          '📚 [getInstructorTimeSlots] Lesson config slots found:',
          configTimeSlots.length
        );

        // Filtra gli slot dove l'istruttore è assegnato
        const instructorSlots = configTimeSlots.filter((slot) => {
          return slot.instructorIds && slot.instructorIds.includes(instructorId);
        });

        console.log(
          '🎯 [getInstructorTimeSlots] Slots for this instructor:',
          instructorSlots.length
        );

        // Trasforma gli slot in formato consistente
        instructorSlots.forEach((slot) => {
          allTimeSlots.push({
            id: slot.id,
            source: 'lessonConfig',
            instructorId: instructorId,
            instructorIds: slot.instructorIds,
            dayOfWeek: slot.dayOfWeek,
            selectedDates: slot.selectedDates || [],
            startTime: slot.startTime,
            endTime: slot.endTime,
            courtIds: slot.courtIds || [],
            maxBookings: slot.maxBookings || 5,
            isActive: slot.isActive !== false,
            createdAt: slot.createdAt,
            updatedAt: slot.updatedAt,
          });
        });
      } else {
        console.log('⚠️ [getInstructorTimeSlots] No lesson config found');
      }
    } catch (error) {
      console.log('⚠️ [getInstructorTimeSlots] Error loading lesson config:', error.message);
    }

    console.log('✅ [getInstructorTimeSlots] Total slots:', allTimeSlots.length);
    return allTimeSlots;
  } catch (error) {
    console.error('❌ [getInstructorTimeSlots] Error loading instructor time slots:', error);
    return [];
  }
}

/**
 * Carica TUTTI i time slots dalla collezione timeSlots (per tutti gli istruttori)
 * Usato dal sistema di prenotazione lezioni per mostrare tutte le fasce disponibili
 * Filtra automaticamente le fasce disattivate e quelle passate
 * @param {string} clubId - ID del club
 * @returns {Promise<Array>} Lista di tutti i time slots attivi e futuri
 */
export async function getAllInstructorTimeSlots(clubId) {
  try {
    console.log('🔍 [getAllInstructorTimeSlots] Loading all slots for club:', clubId);

    const timeSlotsRef = collection(db, 'clubs', clubId, 'timeSlots');
    const querySnapshot = await getDocs(timeSlotsRef);

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const allSlots = [];
    querySnapshot.forEach((doc) => {
      const slotData = doc.data();

      // Filtra: solo slot futuri (se hanno una data)
      // Include sia attivi che disattivati per visualizzazione admin
      if (slotData.date && slotData.date < today) {
        console.log('⏭️ Skipping past slot:', doc.id, slotData.date);
        return;
      }

      // Per slot con selectedDates, filtra solo se tutte le date sono passate
      if (slotData.selectedDates && Array.isArray(slotData.selectedDates)) {
        const hasValidDate = slotData.selectedDates.some((d) => d >= today);
        if (!hasValidDate) {
          console.log('⏭️ Skipping slot with all past dates:', doc.id);
          return;
        }
      }

      allSlots.push({
        id: doc.id,
        source: 'personal',
        ...slotData,
      });
    });

    console.log('✅ [getAllInstructorTimeSlots] Loaded active slots:', allSlots.length);
    return allSlots;
  } catch (error) {
    console.error('❌ [getAllInstructorTimeSlots] Error:', error);
    return [];
  }
}

/**
 * Ottiene i time slots disponibili per una data specifica
 * @param {string} clubId - ID del club
 * @param {string} date - Data nel formato YYYY-MM-DD
 * @returns {Promise<Array>} Lista dei time slots disponibili
 */
export async function getAvailableTimeSlots(clubId, date) {
  try {
    const timeSlotsRef = collection(db, 'clubs', clubId, 'timeSlots');
    const q = query(
      timeSlotsRef,
      where('date', '==', date),
      where('isAvailable', '==', true),
      orderBy('startTime', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const timeSlots = [];

    querySnapshot.forEach((doc) => {
      timeSlots.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return timeSlots;
  } catch (error) {
    console.error('Error loading available time slots:', error);
    return [];
  }
}

/**
 * Crea un nuovo time slot per un istruttore
 * @param {string} clubId - ID del club
 * @param {Object} timeSlotData - Dati del time slot
 * @returns {Promise<Object>} Time slot creato
 */
export async function createTimeSlot(clubId, timeSlotData) {
  try {
    const timeSlotsRef = collection(db, 'clubs', clubId, 'timeSlots');

    const newTimeSlot = {
      instructorId: timeSlotData.instructorId,
      date: timeSlotData.date,
      startTime: timeSlotData.startTime,
      endTime: timeSlotData.endTime,
      courtId: timeSlotData.courtId || null,
      courtIds: timeSlotData.courtIds || [],
      courtName: timeSlotData.courtName || '',
      isAvailable: timeSlotData.isAvailable !== undefined ? timeSlotData.isAvailable : true,
      isActive: timeSlotData.active !== undefined ? timeSlotData.active : true,
      isBooked: false,
      price: timeSlotData.price || 0,
      notes: timeSlotData.notes || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(timeSlotsRef, newTimeSlot);

    return {
      id: docRef.id,
      ...newTimeSlot,
    };
  } catch (error) {
    console.error('Error creating time slot:', error);
    throw error;
  }
}

/**
 * Aggiorna un time slot esistente
 * @param {string} clubId - ID del club
 * @param {string} timeSlotId - ID del time slot
 * @param {Object} updates - Aggiornamenti da applicare
 * @returns {Promise<Object>} Time slot aggiornato
 */
export async function updateTimeSlot(clubId, timeSlotId, updates) {
  try {
    const timeSlotRef = doc(db, 'clubs', clubId, 'timeSlots', timeSlotId);

    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(timeSlotRef, updateData);

    // Ritorna il time slot aggiornato
    const updatedDoc = await getDoc(timeSlotRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };
  } catch (error) {
    console.error('Error updating time slot:', error);
    throw error;
  }
}

/**
 * Elimina un time slot
 * @param {string} clubId - ID del club
 * @param {string} timeSlotId - ID del time slot
 * @returns {Promise<boolean>} True se eliminato con successo
 */
export async function deleteTimeSlot(clubId, timeSlotId) {
  try {
    const timeSlotRef = doc(db, 'clubs', clubId, 'timeSlots', timeSlotId);
    await deleteDoc(timeSlotRef);
    return true;
  } catch (error) {
    console.error('Error deleting time slot:', error);
    throw error;
  }
}

/**
 * Prenota un time slot (lo marca come non disponibile)
 * @param {string} clubId - ID del club
 * @param {string} timeSlotId - ID del time slot
 * @param {string} bookingId - ID della prenotazione
 * @returns {Promise<Object>} Time slot aggiornato
 */
export async function bookTimeSlot(clubId, timeSlotId, bookingId) {
  try {
    return await updateTimeSlot(clubId, timeSlotId, {
      isAvailable: false,
      isBooked: true,
      bookingId: bookingId,
      bookedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error booking time slot:', error);
    throw error;
  }
}

/**
 * Cancella la prenotazione di un time slot (lo rende nuovamente disponibile)
 * @param {string} clubId - ID del club
 * @param {string} timeSlotId - ID del time slot
 * @returns {Promise<Object>} Time slot aggiornato
 */
export async function cancelTimeSlotBooking(clubId, timeSlotId) {
  try {
    return await updateTimeSlot(clubId, timeSlotId, {
      isAvailable: true,
      isBooked: false,
      bookingId: null,
      bookedAt: null,
    });
  } catch (error) {
    console.error('Error canceling time slot booking:', error);
    throw error;
  }
}

/**
 * Ottiene i time slots per una data e campo specifici
 * @param {string} clubId - ID del club
 * @param {string} date - Data nel formato YYYY-MM-DD
 * @param {string} courtId - ID del campo
 * @returns {Promise<Array>} Lista dei time slots
 */
export async function getTimeSlotsByDateAndCourt(clubId, date, courtId) {
  try {
    const timeSlotsRef = collection(db, 'clubs', clubId, 'timeSlots');
    const q = query(
      timeSlotsRef,
      where('date', '==', date),
      where('courtId', '==', courtId),
      orderBy('startTime', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const timeSlots = [];

    querySnapshot.forEach((doc) => {
      timeSlots.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return timeSlots;
  } catch (error) {
    console.error('Error loading time slots by date and court:', error);
    return [];
  }
}

/**
 * Verifica se un time slot è disponibile per la prenotazione
 * @param {string} clubId - ID del club
 * @param {string} timeSlotId - ID del time slot
 * @returns {Promise<boolean>} True se disponibile
 */
export async function isTimeSlotAvailable(clubId, timeSlotId) {
  try {
    const timeSlotRef = doc(db, 'clubs', clubId, 'timeSlots', timeSlotId);
    const timeSlotDoc = await getDoc(timeSlotRef);

    if (!timeSlotDoc.exists()) {
      return false;
    }

    const timeSlot = timeSlotDoc.data();
    return timeSlot.isAvailable && !timeSlot.isBooked;
  } catch (error) {
    console.error('Error checking time slot availability:', error);
    return false;
  }
}

/**
 * Aggiorna un time slot in lessonConfig
 * @param {string} clubId - ID del club
 * @param {string} timeSlotId - ID del time slot
 * @param {Object} updates - Aggiornamenti da applicare
 * @returns {Promise<Object>} Time slot aggiornato
 */
export async function updateLessonConfigSlot(clubId, timeSlotId, updates) {
  try {
    const configRef = doc(db, 'clubs', clubId, 'settings', 'config');
    const configDoc = await getDoc(configRef);

    if (!configDoc.exists()) {
      throw new Error('Lesson config not found');
    }

    const settingsData = configDoc.data();
    const lessonConfig = settingsData.lessonConfig || {};
    const timeSlots = lessonConfig.timeSlots || [];

    // Trova e aggiorna lo slot
    const slotIndex = timeSlots.findIndex((slot) => slot.id === timeSlotId);
    if (slotIndex === -1) {
      throw new Error('Time slot not found in lesson config');
    }

    timeSlots[slotIndex] = {
      ...timeSlots[slotIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Salva le modifiche
    await updateDoc(configRef, {
      'lessonConfig.timeSlots': timeSlots,
    });

    return timeSlots[slotIndex];
  } catch (error) {
    console.error('Error updating lesson config slot:', error);
    throw error;
  }
}

/**
 * Elimina un time slot da lessonConfig
 * @param {string} clubId - ID del club
 * @param {string} timeSlotId - ID del time slot
 * @returns {Promise<boolean>} True se eliminato con successo
 */
export async function deleteLessonConfigSlot(clubId, timeSlotId) {
  try {
    const configRef = doc(db, 'clubs', clubId, 'settings', 'config');
    const configDoc = await getDoc(configRef);

    if (!configDoc.exists()) {
      throw new Error('Lesson config not found');
    }

    const settingsData = configDoc.data();
    const lessonConfig = settingsData.lessonConfig || {};
    const timeSlots = lessonConfig.timeSlots || [];

    // Rimuovi lo slot
    const filteredSlots = timeSlots.filter((slot) => slot.id !== timeSlotId);

    if (filteredSlots.length === timeSlots.length) {
      throw new Error('Time slot not found in lesson config');
    }

    // Salva le modifiche
    await updateDoc(configRef, {
      'lessonConfig.timeSlots': filteredSlots,
    });

    return true;
  } catch (error) {
    console.error('Error deleting lesson config slot:', error);
    throw error;
  }
}
