// =============================================
// FILE: src/services/cloud-bookings.js
// =============================================
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase.js';

// Collezioni Firestore
const BOOKINGS_COLLECTION = 'bookings';

// =============================================
// FUNZIONI CLOUD PER PRENOTAZIONI
// =============================================

/**
 * Carica tutte le prenotazioni pubbliche (per controllo disponibilità)
 */
export async function loadPublicBookings() {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('status', '==', 'confirmed'),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    // Gestisci errori comuni di configurazione Firebase
    if (error?.code === 'permission-denied') {
      console.warn('Firebase: Permessi insufficienti per leggere le prenotazioni. Verifica le regole Firestore e l\'autenticazione.');
    } else if (error?.code === 'failed-precondition') {
      console.warn('Firebase: Indici mancanti o configurazione incompleta.');
    } else if (error?.code === 'unavailable') {
      console.warn('Firebase: Servizio non disponibile. Verifica la connessione.');
    } else {
      console.warn('Errore caricamento prenotazioni pubbliche (cloud):', error);
    }
    throw error;
  }
}

/**
 * Carica prenotazioni di un utente specifico
 */
export async function loadUserBookings(userId) {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
  if (error?.code !== 'permission-denied' && error?.code !== 'failed-precondition') {
      console.warn('Errore caricamento prenotazioni utente:', error);
    }
    return [];
  }
}

/**
 * Carica prenotazioni attive di un utente
 */
export async function loadActiveUserBookings(userId) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('createdBy', '==', userId),
      where('status', '==', 'confirmed'),
      where('date', '>=', today),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
  if (error?.code !== 'permission-denied' && error?.code !== 'failed-precondition') {
      console.warn('Errore caricamento prenotazioni attive:', error);
    }
    return [];
  }
}

/**
 * Carica storico prenotazioni di un utente
 */
export async function loadBookingHistory(userId) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('createdBy', '==', userId),
      where('date', '<', today),
      orderBy('date', 'desc'),
      orderBy('time', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
  if (error?.code !== 'permission-denied' && error?.code !== 'failed-precondition') {
      console.warn('Errore caricamento storico prenotazioni:', error);
    }
    return [];
  }
}

/**
 * Crea una nuova prenotazione nel cloud
 */
export async function createCloudBooking(bookingData, user) {
  try {
    const booking = {
      // Dati prenotazione
      courtId: bookingData.courtId,
      courtName: bookingData.courtName,
      date: bookingData.date,
      time: bookingData.time,
      duration: bookingData.duration,
      lighting: bookingData.lighting || false,
      heating: bookingData.heating || false,
      price: bookingData.price,
      
      // Dati utente
      bookedBy: user?.displayName || user?.email || 'Anonimo',
      userEmail: user?.email,
      userPhone: bookingData.userPhone || '',
      players: bookingData.players || [],
      notes: bookingData.notes || '',
      
      // Metadata
      status: 'confirmed',
      createdBy: user?.uid || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), booking);
    
    return {
      id: docRef.id,
      ...booking,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Errore creazione prenotazione:', error);
    throw new Error('Impossibile creare la prenotazione. Riprova più tardi.');
  }
}

/**
 * Aggiorna una prenotazione esistente
 */
export async function updateCloudBooking(bookingId, updates, user) {
  try {
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
      updatedBy: user?.uid || null
    };
    
    await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), updateData);
    
    return {
      id: bookingId,
      ...updates,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Errore aggiornamento prenotazione:', error);
    throw new Error('Impossibile aggiornare la prenotazione. Riprova più tardi.');
  }
}

/**
 * Cancella una prenotazione
 */
export async function cancelCloudBooking(bookingId, user) {
  try {
    await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
      cancelledBy: user?.uid || null,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Errore cancellazione prenotazione:', error);
    throw new Error('Impossibile cancellare la prenotazione. Riprova più tardi.');
  }
}

/**
 * Elimina definitivamente una prenotazione (solo per admin)
 */
export async function deleteCloudBooking(bookingId) {
  try {
    await deleteDoc(doc(db, BOOKINGS_COLLECTION, bookingId));
    return true;
  } catch (error) {
    console.error('Errore eliminazione prenotazione:', error);
    throw new Error('Impossibile eliminare la prenotazione. Riprova più tardi.');
  }
}

/**
 * Sottoscrivi alle prenotazioni pubbliche in tempo reale
 */
export function subscribeToPublicBookings(callback) {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where('status', '==', 'confirmed'),
    orderBy('date', 'asc'),
    orderBy('time', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(bookings);
  }, (error) => {
    console.error('Errore sottoscrizione prenotazioni:', error);
  });
}

/**
 * Sottoscrivi alle prenotazioni di un utente in tempo reale
 */
export function subscribeToUserBookings(userId, callback) {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where('createdBy', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(bookings);
  }, (error) => {
    console.error('Errore sottoscrizione prenotazioni utente:', error);
  });
}

// =============================================
// FUNZIONI DI COMPATIBILITÀ CON L'API LOCALE
// =============================================

/**
 * Wrapper per compatibilità con getPublicBookings locale
 */
export async function getPublicBookings() {
  const bookings = await loadPublicBookings();
  // Filtra solo i campi necessari per compatibilità
  return bookings.map(booking => ({
    id: booking.id,
    courtId: booking.courtId,
    courtName: booking.courtName,
    date: booking.date,
    time: booking.time,
    duration: booking.duration,
    status: booking.status
  }));
}

/**
 * Verifica se uno slot è disponibile (wrapper per isSlotAvailable locale)
 */
export async function checkSlotAvailability(courtId, date, time, duration) {
  try {
    const bookings = await getPublicBookings();
    
    // Importa la logica di verifica dal servizio locale
    const { isSlotAvailable } = await import('./bookings.js');
    return isSlotAvailable(courtId, date, time, duration, bookings);
  } catch (error) {
    console.error('Errore verifica disponibilità:', error);
    return false;
  }
}
