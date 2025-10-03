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
} from "firebase/firestore";
import { db } from "./firebase.js";

// Club ID principale
const MAIN_CLUB_ID = 'sporting-cat';

// Funzione helper per ottenere il percorso bookings del club
// AGGIORNATO: usa la collection root-level "bookings" come unified-booking-service
const getBookingsCollection = (clubId = MAIN_CLUB_ID) => {
  return collection(db, 'bookings');  // Root-level collection
};

// Funzione helper per ottenere un documento booking
const getBookingDoc = (bookingId, clubId = MAIN_CLUB_ID) => {
  return doc(db, 'bookings', bookingId);  // Root-level collection
};

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
      where("status", "==", "confirmed"),
      orderBy("date", "asc"),
      orderBy("time", "asc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    // Gestisci errori comuni di configurazione Firebase
    if (error?.code === "permission-denied") {
      console.warn(
        "Firebase: Permessi insufficienti per leggere le prenotazioni. Verifica le regole Firestore e l'autenticazione.",
      );
    } else if (error?.code === "failed-precondition") {
      console.warn("Firebase: Indici mancanti o configurazione incompleta.");
    } else if (error?.code === "unavailable") {
      console.warn(
        "Firebase: Servizio non disponibile. Verifica la connessione.",
      );
    } else {
      console.warn("Errore caricamento prenotazioni pubbliche (cloud):", error);
    }
    throw error;
  }
}

/**
 * Carica prenotazioni di un utente specifico
 */
export async function loadUserBookings(userId, clubId = MAIN_CLUB_ID) {
  try {
    const q = query(
      getBookingsCollection(clubId),
      where("createdBy", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    if (
      error?.code !== "permission-denied" &&
      error?.code !== "failed-precondition"
    ) {
      console.warn("Errore caricamento prenotazioni utente:", error);
    }
    return [];
  }
}

/**
 * Carica prenotazioni attive di un utente
 */
export async function loadActiveUserBookings(userId, clubId = MAIN_CLUB_ID, userInfo = {}) {
  console.log('🔍 [loadActiveUserBookings] Searching for user:', userId, 'in club:', clubId, 'with info:', userInfo);
  
  try {
    const today = new Date().toISOString().split("T")[0];
    console.log('📅 [loadActiveUserBookings] Today:', today);
    
    // Calcola la data di 7 giorni fa per includere prenotazioni recenti
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString().split('T')[0];
    console.log('📅 [loadActiveUserBookings] Start date (7 days ago):', startDate);

    // Prepara gli identificatori dell'utente per cercare in più campi
    const userIdentifiers = {
      id: userId,
      name: userInfo.displayName || userInfo.name,
      email: userInfo.email
    };
    
    console.log('� [loadActiveUserBookings] User identifiers:', userIdentifiers);

    // Crea multiple query per cercare l'utente in diversi campi
    const queries = [];
    
    // Query per bookedBy (ID)
    if (userId) {
      queries.push(query(
        getBookingsCollection(clubId),
        where("bookedBy", "==", userId)
      ));
    }
    
    // Query per bookedBy (nome)
    if (userIdentifiers.name) {
      queries.push(query(
        getBookingsCollection(clubId),
        where("bookedBy", "==", userIdentifiers.name)
      ));
    }
    
    // Query per userEmail
    if (userIdentifiers.email) {
      queries.push(query(
        getBookingsCollection(clubId),
        where("userEmail", "==", userIdentifiers.email)
      ));
    }
    
    // Query per createdBy (ID)
    if (userId) {
      queries.push(query(
        getBookingsCollection(clubId),
        where("createdBy", "==", userId)
      ));
    }

    // Esegui tutte le query in parallelo
    const queryResults = await Promise.allSettled(queries.map(q => getDocs(q)));
    
    // Unisci tutti i risultati senza duplicati
    const bookingMap = new Map();
    
    queryResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const queryType = index === 0 ? 'bookedBy_id' : 
                         index === 1 ? 'bookedBy_name' : 
                         index === 2 ? 'userEmail' : 'createdBy';
        console.log(`📊 [loadActiveUserBookings] Query ${queryType}: ${result.value.docs.length} results`);
        
        result.value.docs.forEach(doc => {
          const booking = { id: doc.id, ...doc.data() };
          bookingMap.set(doc.id, booking);
        });
      } else {
        console.warn(`⚠️ [loadActiveUserBookings] Query ${index} failed:`, result.reason);
      }
    });
    
    const allBookings = Array.from(bookingMap.values());
    console.log('📊 [loadActiveUserBookings] Total unique bookings found:', allBookings.length);
    
    // Filtra client-side: confirmed + date >= startDate + check if user is in players array
    const bookings = allBookings
      .filter(booking => {
        // Status confirmed
        if (booking.status !== 'confirmed') return false;
        
        // Date >= startDate
        if (booking.date < startDate) return false;
        
        // Check if user is involved in this booking
        const isBookedBy = booking.bookedBy === userId || 
                          booking.bookedBy === userIdentifiers.name ||
                          booking.createdBy === userId;
        const isInPlayers = booking.players && 
                           (booking.players.includes(userIdentifiers.name) || 
                            booking.players.some(p => typeof p === 'object' && p?.id === userId));
        const isUserEmail = booking.userEmail === userIdentifiers.email;
        
        const isUserInvolved = isBookedBy || isInPlayers || isUserEmail;
        
        if (!isUserInvolved) {
          console.log('❌ [loadActiveUserBookings] Filtering out booking not involving user:', {
            id: booking.id,
            bookedBy: booking.bookedBy,
            createdBy: booking.createdBy,
            userEmail: booking.userEmail,
            players: booking.players
          });
        }
        
        return isUserInvolved;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.time || '').localeCompare(b.time || '');
      });
    
    console.log('✅ [loadActiveUserBookings] Final filtered bookings:', bookings.length);
    
    if (bookings.length > 0) {
      console.log('📋 [loadActiveUserBookings] Sample booking:', bookings[0]);
    }
    
    return bookings;
  } catch (error) {
    console.error('❌ [loadActiveUserBookings] Error:', error);
    if (
      error?.code !== "permission-denied" &&
      error?.code !== "failed-precondition"
    ) {
      console.warn("Errore caricamento prenotazioni attive:", error);
    }
    return [];
  }
}
export async function loadBookingHistory(userId, clubId = MAIN_CLUB_ID) {
  try {
    const today = new Date().toISOString().split("T")[0];

    const q = query(
      getBookingsCollection(clubId),
      where("createdBy", "==", userId),
      where("date", "<", today),
      orderBy("date", "desc"),
      orderBy("time", "desc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    if (
      error?.code !== "permission-denied" &&
      error?.code !== "failed-precondition"
    ) {
      console.warn("Errore caricamento storico prenotazioni:", error);
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
      bookedBy: user?.displayName || user?.email || "Anonimo",
      userEmail: user?.email,
      userPhone: bookingData.userPhone || "",
      players: bookingData.players || [],
      notes: bookingData.notes || "",

      // Metadata
      status: "confirmed",
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
    console.error("Errore creazione prenotazione:", error);
    throw new Error("Impossibile creare la prenotazione. Riprova più tardi.");
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
    console.error("Errore aggiornamento prenotazione:", error);
    throw new Error(
      "Impossibile aggiornare la prenotazione. Riprova più tardi.",
    );
  }
}

/**
 * Cancella una prenotazione
 */
export async function cancelCloudBooking(bookingId, user, clubId = MAIN_CLUB_ID) {
  try {
    await updateDoc(getBookingDoc(bookingId, clubId), {
      status: "cancelled",
      cancelledAt: serverTimestamp(),
      cancelledBy: user?.uid || null,
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Errore cancellazione prenotazione:", error);
    throw new Error(
      "Impossibile cancellare la prenotazione. Riprova più tardi.",
    );
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
    console.error("Errore eliminazione prenotazione:", error);
    throw new Error(
      "Impossibile eliminare la prenotazione. Riprova più tardi.",
    );
  }
}

/**
 * Sottoscrivi alle prenotazioni pubbliche in tempo reale
 */
export function subscribeToPublicBookings(callback) {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where("status", "==", "confirmed"),
    orderBy("date", "asc"),
    orderBy("time", "asc"),
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
      console.error("Errore sottoscrizione prenotazioni:", error);
    },
  );
}

/**
 * Sottoscrivi alle prenotazioni di un utente in tempo reale
 */
export function subscribeToUserBookings(userId, callback) {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where("createdBy", "==", userId),
    orderBy("createdAt", "desc"),
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
      console.error("Errore sottoscrizione prenotazioni utente:", error);
    },
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
      queries.push(
        getDocs(
          query(
            collection(db, BOOKINGS_COLLECTION),
            where("createdBy", "==", userId),
          ),
        ),
      );
    }
    if (email) {
      queries.push(
        getDocs(
          query(
            collection(db, BOOKINGS_COLLECTION),
            where("userEmail", "==", email),
          ),
        ),
      );
    }
    if (name) {
      queries.push(
        getDocs(
          query(
            collection(db, BOOKINGS_COLLECTION),
            where("bookedBy", "==", name),
          ),
        ),
      );
      // array-contains richiede che 'players' sia un array di stringhe (nomi)
      queries.push(
        getDocs(
          query(
            collection(db, BOOKINGS_COLLECTION),
            where("players", "array-contains", name),
          ),
        ),
      );
    }

    if (queries.length === 0) return [];

    const results = await Promise.allSettled(queries);
    const merged = new Map();
    for (const r of results) {
      if (r.status === "fulfilled") {
        r.value.docs.forEach((d) => {
          const data = { id: d.id, ...d.data() };
          merged.set(d.id, data);
        });
      }
    }

    // Ordina per data/ora crescente
    const toDate = (b) => {
      const dateStr = b.date || "";
      // time può essere 'HH:MM' o 'HH:MM-HH:MM'
      const t = (b.time || "").split("-")[0].trim();
      // fallback sicuro
      const iso = t ? `${dateStr}T${t}:00` : `${dateStr}T00:00:00`;
      const d = new Date(iso);
      return isNaN(d.getTime()) ? new Date(dateStr) : d;
    };

    const all = Array.from(merged.values()).sort(
      (a, b) => toDate(a) - toDate(b),
    );
    return all;
  } catch (error) {
    console.warn("Errore caricamento prenotazioni per giocatore:", error);
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
    .filter((b) => b.status === "confirmed")
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
    const { isSlotAvailable } = await import("./bookings.js");
    return isSlotAvailable(courtId, date, time, duration, bookings);
  } catch (error) {
    console.error("Errore verifica disponibilità:", error);
    return false;
  }
}
