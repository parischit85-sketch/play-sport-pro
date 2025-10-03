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
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase.js';

// =============================================
// TIME SLOTS MANAGEMENT
// =============================================

/**
 * Ottiene tutti i time slots di un istruttore per un club specifico
 * @param {string} clubId - ID del club
 * @param {string} instructorId - ID dell'istruttore
 * @returns {Promise<Array>} Lista dei time slots
 */
export async function getInstructorTimeSlots(clubId, instructorId) {
  try {
    const timeSlotsRef = collection(db, 'clubs', clubId, 'timeSlots');
    const q = query(
      timeSlotsRef,
      where('instructorId', '==', instructorId),
      orderBy('date', 'asc'),
      orderBy('startTime', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const timeSlots = [];

    querySnapshot.forEach((doc) => {
      timeSlots.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return timeSlots;
  } catch (error) {
    console.error('Error loading instructor time slots:', error);
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
        ...doc.data()
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
      courtId: timeSlotData.courtId,
      courtName: timeSlotData.courtName,
      isAvailable: timeSlotData.isAvailable !== undefined ? timeSlotData.isAvailable : true,
      isBooked: false,
      price: timeSlotData.price || 0,
      notes: timeSlotData.notes || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(timeSlotsRef, newTimeSlot);

    return {
      id: docRef.id,
      ...newTimeSlot
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
      updatedAt: serverTimestamp()
    };

    await updateDoc(timeSlotRef, updateData);

    // Ritorna il time slot aggiornato
    const updatedDoc = await getDoc(timeSlotRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
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
      bookedAt: serverTimestamp()
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
      bookedAt: null
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
        ...doc.data()
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