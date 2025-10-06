// =============================================
// FILE: src/services/club-data.js
// =============================================

/**
 * Servizi per accedere ai dati del club dalle subcollections Firestore.
 * 
 * Questo servizio sostituisce il vecchio sistema leagues/ che caricava
 * tutti i dati in un unico documento e richiedeva filtri client-side.
 * 
 * Ora ogni club ha i suoi dati in subcollections separate:
 * - clubs/{clubId}/courts/
 * - clubs/{clubId}/users/
 * - clubs/{clubId}/matches/
 * - bookings/ (root collection con campo clubId)
 * 
 * @created 2025-10-06
 */

import { db } from '@lib/firebase.js';
import { 
  collection, 
  getDocs, 
  query, 
  where,
  orderBy,
  doc,
  getDoc
} from 'firebase/firestore';

/**
 * Carica i campi (courts) di un club dalla subcollection.
 * 
 * @param {string} clubId - ID del club
 * @returns {Promise<Array>} Array di campi con struttura { id, name, surface, indoor, ... }
 * @throws {Error} Se il clubId non è valido o si verifica un errore Firestore
 * 
 * @example
 * const courts = await getClubCourts('sporting-cat');
 * console.log(courts); // [{ id: 'court1', name: 'Campo 1', surface: 'clay', ... }]
 */
export async function getClubCourts(clubId) {
  if (!clubId) {
    throw new Error('clubId è richiesto per getClubCourts');
  }

  try {
    const courtsRef = collection(db, `clubs/${clubId}/courts`);
    const snapshot = await getDocs(courtsRef);
    
    const courts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Caricati ${courts.length} campi per club ${clubId}`);
    return courts;
  } catch (error) {
    console.error(`❌ Errore caricamento campi club ${clubId}:`, error);
    throw new Error(`Impossibile caricare i campi del club: ${error.message}`);
  }
}

/**
 * Carica gli utenti/giocatori di un club dalla subcollection users/.
 * 
 * Include tutti gli utenti affiliati al club con i loro ruoli e linkedUserId.
 * 
 * @param {string} clubId - ID del club
 * @returns {Promise<Array>} Array di utenti con struttura { id, userId, linkedUserId, name, role, ... }
 * @throws {Error} Se il clubId non è valido o si verifica un errore Firestore
 * 
 * @example
 * const players = await getClubPlayers('sporting-cat');
 * console.log(players); // [{ id: 'user1', name: 'Mario Rossi', role: 'player', ... }]
 */
export async function getClubPlayers(clubId) {
  if (!clubId) {
    throw new Error('clubId è richiesto per getClubPlayers');
  }

  try {
    const usersRef = collection(db, `clubs/${clubId}/users`);
    const snapshot = await getDocs(usersRef);
    
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Caricati ${users.length} utenti per club ${clubId}`);
    return users;
  } catch (error) {
    console.error(`❌ Errore caricamento utenti club ${clubId}:`, error);
    throw new Error(`Impossibile caricare gli utenti del club: ${error.message}`);
  }
}

/**
 * Carica i match di un club dalla subcollection matches/.
 * 
 * @param {string} clubId - ID del club
 * @param {Object} options - Opzioni query
 * @param {number} options.limit - Limite risultati (default: tutti)
 * @param {string} options.orderByField - Campo per ordinamento (default: 'date')
 * @param {string} options.orderDirection - Direzione ordinamento 'asc' | 'desc' (default: 'desc')
 * @returns {Promise<Array>} Array di match con struttura { id, date, teamA, teamB, score, ... }
 * @throws {Error} Se il clubId non è valido o si verifica un errore Firestore
 * 
 * @example
 * const matches = await getClubMatches('sporting-cat');
 * const recentMatches = await getClubMatches('sporting-cat', { limit: 10 });
 */
export async function getClubMatches(clubId, options = {}) {
  if (!clubId) {
    throw new Error('clubId è richiesto per getClubMatches');
  }

  try {
    const matchesRef = collection(db, `clubs/${clubId}/matches`);
    
    // Build query with optional ordering
    let q = matchesRef;
    if (options.orderByField) {
      q = query(
        matchesRef, 
        orderBy(options.orderByField, options.orderDirection || 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    
    let matches = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply limit if specified
    if (options.limit) {
      matches = matches.slice(0, options.limit);
    }

    console.log(`✅ Caricati ${matches.length} match per club ${clubId}`);
    return matches;
  } catch (error) {
    console.error(`❌ Errore caricamento match club ${clubId}:`, error);
    throw new Error(`Impossibile caricare i match del club: ${error.message}`);
  }
}

/**
 * Carica le prenotazioni di un club dalla collection root bookings/.
 * 
 * NOTA: Le bookings sono nella collection ROOT (non subcollection) con campo clubId.
 * Questo permette queries cross-club e gestione centralizzata.
 * 
 * @param {string} clubId - ID del club
 * @param {Object} options - Opzioni filtro
 * @param {string} options.fromDate - Data minima (formato ISO string, default: oggi)
 * @param {string} options.toDate - Data massima (formato ISO string, opzionale)
 * @param {string} options.courtId - Filtra per campo specifico (opzionale)
 * @returns {Promise<Array>} Array di prenotazioni con struttura { id, date, time, courtId, userId, ... }
 * @throws {Error} Se il clubId non è valido o si verifica un errore Firestore
 * 
 * @example
 * const bookings = await getClubBookings('sporting-cat');
 * const todayBookings = await getClubBookings('sporting-cat', { fromDate: '2025-10-06' });
 * const court1Bookings = await getClubBookings('sporting-cat', { courtId: 'court1' });
 */
export async function getClubBookings(clubId, options = {}) {
  if (!clubId) {
    throw new Error('clubId è richiesto per getClubBookings');
  }

  try {
    const bookingsRef = collection(db, 'bookings');
    
    // Build query with filters
    const constraints = [where('clubId', '==', clubId)];
    
    // Filter by date range
    const fromDate = options.fromDate || new Date().toISOString().split('T')[0];
    constraints.push(where('date', '>=', fromDate));
    
    if (options.toDate) {
      constraints.push(where('date', '<=', options.toDate));
    }
    
    // Filter by court if specified
    if (options.courtId) {
      constraints.push(where('courtId', '==', options.courtId));
    }
    
    const q = query(bookingsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Caricate ${bookings.length} prenotazioni per club ${clubId}`);
    return bookings;
  } catch (error) {
    console.error(`❌ Errore caricamento prenotazioni club ${clubId}:`, error);
    throw new Error(`Impossibile caricare le prenotazioni del club: ${error.message}`);
  }
}

/**
 * Carica i profili utente di un club dalla subcollection profiles/.
 * 
 * I profiles contengono informazioni aggiuntive come stats, preferenze, ecc.
 * 
 * @param {string} clubId - ID del club
 * @returns {Promise<Array>} Array di profili
 * @throws {Error} Se il clubId non è valido o si verifica un errore Firestore
 */
export async function getClubProfiles(clubId) {
  if (!clubId) {
    throw new Error('clubId è richiesto per getClubProfiles');
  }

  try {
    const profilesRef = collection(db, `clubs/${clubId}/profiles`);
    const snapshot = await getDocs(profilesRef);
    
    const profiles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Caricati ${profiles.length} profili per club ${clubId}`);
    return profiles;
  } catch (error) {
    console.error(`❌ Errore caricamento profili club ${clubId}:`, error);
    throw new Error(`Impossibile caricare i profili del club: ${error.message}`);
  }
}

/**
 * Carica le informazioni del club dalla collection root clubs/.
 * 
 * @param {string} clubId - ID del club
 * @returns {Promise<Object|null>} Dati del club o null se non trovato
 * @throws {Error} Se si verifica un errore Firestore
 * 
 * @example
 * const club = await getClubInfo('sporting-cat');
 * console.log(club); // { id: 'sporting-cat', name: 'Sporting CAT', address: '...', ... }
 */
export async function getClubInfo(clubId) {
  if (!clubId) {
    throw new Error('clubId è richiesto per getClubInfo');
  }

  try {
    const clubRef = doc(db, 'clubs', clubId);
    const snapshot = await getDoc(clubRef);
    
    if (!snapshot.exists()) {
      console.warn(`⚠️ Club ${clubId} non trovato`);
      return null;
    }

    const clubData = {
      id: snapshot.id,
      ...snapshot.data()
    };

    console.log(`✅ Caricato club ${clubId}: ${clubData.name}`);
    return clubData;
  } catch (error) {
    console.error(`❌ Errore caricamento info club ${clubId}:`, error);
    throw new Error(`Impossibile caricare le informazioni del club: ${error.message}`);
  }
}

/**
 * Carica TUTTI i dati di un club in un'unica chiamata parallela.
 * 
 * Questa è la funzione più efficiente per caricare tutto il contesto di un club,
 * utilizzando Promise.all per parallelizzare le query Firestore.
 * 
 * @param {string} clubId - ID del club
 * @param {Object} options - Opzioni per ogni tipo di dato
 * @param {Object} options.matches - Opzioni per getClubMatches (limit, orderBy, ecc.)
 * @param {Object} options.bookings - Opzioni per getClubBookings (fromDate, toDate, ecc.)
 * @returns {Promise<Object>} Oggetto con tutti i dati del club
 * @throws {Error} Se il clubId non è valido o si verifica un errore Firestore
 * 
 * @example
 * const data = await getClubData('sporting-cat');
 * console.log(data);
 * // {
 * //   club: { id: 'sporting-cat', name: 'Sporting CAT', ... },
 * //   courts: [...],
 * //   players: [...],
 * //   users: [...],
 * //   matches: [...],
 * //   bookings: [...],
 * //   profiles: [...]
 * // }
 * 
 * @example Con opzioni
 * const data = await getClubData('sporting-cat', {
 *   matches: { limit: 20, orderByField: 'date' },
 *   bookings: { fromDate: '2025-10-06', toDate: '2025-10-13' }
 * });
 */
export async function getClubData(clubId, options = {}) {
  if (!clubId) {
    throw new Error('clubId è richiesto per getClubData');
  }

  console.log(`📊 Caricamento dati completi per club ${clubId}...`);
  const startTime = Date.now();

  try {
    // Esegui tutte le query in parallelo per massima efficienza
    const [club, courts, users, matches, bookings, profiles] = await Promise.all([
      getClubInfo(clubId),
      getClubCourts(clubId),
      getClubPlayers(clubId),
      getClubMatches(clubId, options.matches || {}),
      getClubBookings(clubId, options.bookings || {}),
      getClubProfiles(clubId)
    ]);

    const duration = Date.now() - startTime;
    console.log(`✅ Dati club ${clubId} caricati in ${duration}ms`);
    console.log(`   📊 Totali: ${courts.length} campi, ${users.length} utenti, ${matches.length} match, ${bookings.length} prenotazioni`);

    return {
      club,
      courts,
      players: users,  // Alias per compatibilità con codice esistente
      users,
      matches,
      bookings,
      profiles,
      bookingConfig: club?.bookingConfig || {},  // Dalla config del club
      lessonConfig: club?.lessonConfig || {}     // Dalla config del club
    };
  } catch (error) {
    console.error(`❌ Errore caricamento dati completi club ${clubId}:`, error);
    throw new Error(`Impossibile caricare i dati del club: ${error.message}`);
  }
}

/**
 * Verifica se un club esiste nel database.
 * 
 * @param {string} clubId - ID del club
 * @returns {Promise<boolean>} true se il club esiste, false altrimenti
 */
export async function clubExists(clubId) {
  if (!clubId) return false;
  
  try {
    const club = await getClubInfo(clubId);
    return club !== null;
  } catch (error) {
    console.error(`❌ Errore verifica esistenza club ${clubId}:`, error);
    return false;
  }
}

/**
 * Statistiche rapide del club (conteggi senza caricare tutti i dati).
 * 
 * Utile per dashboard o overview quando non servono tutti i dati.
 * 
 * @param {string} clubId - ID del club
 * @returns {Promise<Object>} Oggetto con conteggi
 * 
 * @example
 * const stats = await getClubStats('sporting-cat');
 * console.log(stats); // { courts: 7, users: 66, matches: 13, bookings: 42 }
 */
export async function getClubStats(clubId) {
  if (!clubId) {
    throw new Error('clubId è richiesto per getClubStats');
  }

  try {
    const [courts, users, matches, bookings] = await Promise.all([
      getClubCourts(clubId),
      getClubPlayers(clubId),
      getClubMatches(clubId),
      getClubBookings(clubId)
    ]);

    return {
      courts: courts.length,
      users: users.length,
      players: users.length,  // Alias
      matches: matches.length,
      bookings: bookings.length
    };
  } catch (error) {
    console.error(`❌ Errore caricamento stats club ${clubId}:`, error);
    throw new Error(`Impossibile caricare le statistiche del club: ${error.message}`);
  }
}
