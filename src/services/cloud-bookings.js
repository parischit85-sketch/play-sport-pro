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
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase.js';

// Club ID principale
const MAIN_CLUB_ID = 'sporting-cat';

// ...existing code...
// Funzione helper per ottenere il percorso bookings del club
// AGGIORNATO: usa la collection root-level "bookings" come unified-booking-service
const getBookingsCollection = (_clubId = MAIN_CLUB_ID) => {
  return collection(db, 'bookings'); // Root-level collection
};

// Funzione helper per ottenere un documento booking
const getBookingDoc = (bookingId, _clubId = MAIN_CLUB_ID) => {
  return doc(db, 'bookings', bookingId); // Root-level collection
};
// ...existing code...

// =============================================
// FUNZIONI CLOUD PER PRENOTAZIONI
// =============================================

/**
 * Carica tutte le prenotazioni pubbliche (per controllo disponibilità)
 */
export async function loadPublicBookings(clubId = MAIN_CLUB_ID) {
  try {
    const q = query(
      getBookingsCollection(clubId),
      where('status', '==', 'confirmed'),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    // Gestisci errori comuni di configurazione Firebase
    if (error?.code === 'permission-denied') {
      console.warn(
        "Firebase: Permessi insufficienti per leggere le prenotazioni. Verifica le regole Firestore e l'autenticazione."
      );
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
export async function loadUserBookings(userId, clubId = MAIN_CLUB_ID) {
  try {
    // FIX: Query by userId (which matches security rules isOwner check)
    // Removed clubId filter to allow viewing bookings across all clubs if clubId is null
    // Removed createdBy check in favor of userId which is the owner field
    const q = query(
      getBookingsCollection(clubId),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      orderBy('time', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
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
export async function loadActiveUserBookings(userId, clubId = MAIN_CLUB_ID, _userInfo = {}) {
  console.log('☁️ [loadActiveUserBookings] Starting for user:', userId);
  try {
    // Calcola la data di 7 giorni fa per includere prenotazioni recenti
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString().split('T')[0];

    const bookingsRef = getBookingsCollection(clubId);
    
    // FIX: Use single query on 'userId' field which is what security rules check (isOwner)
    // We remove the complex parallel queries because they fail security rules if they don't filter by userId
    // We remove clubId filter to avoid issues when clubId is null/undefined in Dashboard
    
    const q = query(
      bookingsRef,
      where('userId', '==', userId),
      where('status', 'in', ['confirmed', 'pending']),
      where('date', '>=', startDate),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );

    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log(`✅ [loadActiveUserBookings] Found ${bookings.length} bookings for user ${userId}`);
    return bookings;
  } catch (error) {
    console.error('❌ [loadActiveUserBookings] Error:', error);
    if (error?.code === 'permission-denied') {
      console.error(
        '🔒 Permission denied. Ensure firestore.rules allows reading bookings where userId == auth.uid'
      );
    }
    return [];
  }
}
export async function loadBookingHistory(userId, clubId = MAIN_CLUB_ID) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // FIX: Query by userId only
    const q = query(
      getBookingsCollection(clubId),
      where('userId', '==', userId),
      where('date', '<', today),
      orderBy('date', 'desc'),
      orderBy('time', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
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
export async function createCloudBooking(bookingData, user, clubId = MAIN_CLUB_ID) {
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
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(getBookingsCollection(clubId), booking);

    return {
      id: docRef.id,
      ...booking,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Errore creazione prenotazione:', error);
    throw new Error('Impossibile creare la prenotazione. Riprova più tardi.');
  }
}

/**
 * Aggiorna una prenotazione esistente
 */
export async function updateCloudBooking(bookingId, updates, user, clubId = MAIN_CLUB_ID) {
  try {
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
      updatedBy: user?.uid || null,
    };

    await updateDoc(getBookingDoc(bookingId, clubId), updateData);

    return {
      id: bookingId,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Errore aggiornamento prenotazione:', error);
    throw new Error('Impossibile aggiornare la prenotazione. Riprova più tardi.');
  }
}

/**
 * Cancella una prenotazione
 */
export async function cancelCloudBooking(bookingId, user, clubId = MAIN_CLUB_ID) {
  try {
    await updateDoc(getBookingDoc(bookingId, clubId), {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
      cancelledBy: user?.uid || null,
      updatedAt: serverTimestamp(),
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
    await deleteDoc(doc(db, 'bookings', bookingId));
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
    collection(db, 'bookings'),
    where('status', '==', 'confirmed'),
    orderBy('date', 'asc'),
    orderBy('time', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const bookings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(bookings);
    },
    (error) => {
      console.error('Errore sottoscrizione prenotazioni:', error);
    }
  );
}

/**
 * Sottoscrivi alle prenotazioni di un utente in tempo reale
 */
export function subscribeToUserBookings(userId, callback) {
  const q = query(
    collection(db, 'bookings'),
    where('createdBy', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const bookings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(bookings);
    },
    (error) => {
      console.error('Errore sottoscrizione prenotazioni utente:', error);
    }
  );
}

/**
 * Sottoscrivi alle prenotazioni attive di un utente in tempo reale
 */
export function subscribeToActiveUserBookings(userId, callback) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const startDate = sevenDaysAgo.toISOString().split('T')[0];

  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', userId),
    where('status', 'in', ['confirmed', 'pending']),
    where('date', '>=', startDate),
    orderBy('date', 'asc'),
    orderBy('time', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const bookings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(bookings);
    },
    (error) => {
      console.error('Errore sottoscrizione prenotazioni attive utente:', error);
      // Fallback silenzioso o gestione errore
    }
  );
}

// =============================================
// CARICAMENTO PRENOTAZIONI PER GIOCATORE (CRM)
// =============================================
/**
 * Carica tutte le prenotazioni associate a un giocatore CRM, usando più identificatori.
 * - userId: createdBy
 * - email: userEmail
 * - name: bookedBy o players array-contains
 * Restituisce un array unificato senza duplicati.
 */
export async function loadBookingsForPlayer({ userId, email, name }) {
  try {
    const queries = [];
    if (userId) {
      queries.push(getDocs(query(collection(db, 'bookings'), where('createdBy', '==', userId))));
    }
    if (email) {
      queries.push(getDocs(query(collection(db, 'bookings'), where('userEmail', '==', email))));
    }
    if (name) {
      queries.push(getDocs(query(collection(db, 'bookings'), where('bookedBy', '==', name))));
      // array-contains richiede che 'players' sia un array di stringhe (nomi)
      queries.push(
        getDocs(query(collection(db, 'bookings'), where('players', 'array-contains', name)))
      );
    }

    if (queries.length === 0) return [];

    const results = await Promise.allSettled(queries);
    const merged = new Map();
    for (const r of results) {
      if (r.status === 'fulfilled') {
        r.value.docs.forEach((d) => {
          const data = { id: d.id, ...d.data() };
          merged.set(d.id, data);
        });
      }
    }

    // Ordina per data/ora crescente
    const toDate = (b) => {
      const dateStr = b.date || '';
      // time può essere 'HH:MM' o 'HH:MM-HH:MM'
      const t = (b.time || '').split('-')[0].trim();
      // fallback sicuro
      const iso = t ? `${dateStr}T${t}:00` : `${dateStr}T00:00:00`;
      const d = new Date(iso);
      return isNaN(d.getTime()) ? new Date(dateStr) : d;
    };

    const all = Array.from(merged.values()).sort((a, b) => toDate(a) - toDate(b));
    return all;
  } catch (error) {
    console.warn('Errore caricamento prenotazioni per giocatore:', error);
    return [];
  }
}

// =============================================
// FUNZIONI DI COMPATIBILITÀ CON L'API LOCALE
// =============================================

/**
 * Wrapper per compatibilità con getPublicBookings locale
 */
export async function getPublicBookings() {
  const bookings = await loadPublicBookings();
  // Include all necessary fields for lesson bookings and color coding
  return bookings
    .filter((b) => b.status === 'confirmed')
    .map((booking) => ({
      id: booking.id,
      courtId: booking.courtId,
      courtName: booking.courtName,
      date: booking.date,
      time: booking.time,
      duration: booking.duration,
      status: booking.status,
      // Include lesson-specific fields
      notes: booking.notes,
      instructorId: booking.instructorId,
      isLessonBooking: booking.isLessonBooking,
      // Include other fields that might be needed
      players: booking.players,
      bookedBy: booking.bookedBy,
      lighting: booking.lighting,
      heating: booking.heating,
      price: booking.price,
      userPhone: booking.userPhone,
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
