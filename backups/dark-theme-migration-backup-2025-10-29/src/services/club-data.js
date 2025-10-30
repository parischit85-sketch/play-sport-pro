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

import { db } from './firebase.js';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';

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

    const courts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
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

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
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
      q = query(matchesRef, orderBy(options.orderByField, options.orderDirection || 'desc'));
    }

    const snapshot = await getDocs(q);

    let matches = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
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

    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
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

    const profiles = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
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
      ...snapshot.data(),
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
      getClubProfiles(clubId),
    ]);

    const duration = Date.now() - startTime;
    console.log(`✅ Dati club ${clubId} caricati in ${duration}ms`);
    console.log(
      `   📊 Totali: ${courts.length} campi, ${users.length} utenti, ${matches.length} match, ${bookings.length} prenotazioni`
    );

    return {
      club,
      courts,
      players: users, // Alias per compatibilità con codice esistente
      users,
      matches,
      bookings,
      profiles,
      bookingConfig: club?.bookingConfig || {}, // Dalla config del club
      lessonConfig: club?.lessonConfig || {}, // Dalla config del club
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
      getClubBookings(clubId),
    ]);

    return {
      courts: courts.length,
      users: users.length,
      players: users.length, // Alias
      matches: matches.length,
      bookings: bookings.length,
    };
  } catch (error) {
    console.error(`❌ Errore caricamento stats club ${clubId}:`, error);
    throw new Error(`Impossibile caricare le statistiche del club: ${error.message}`);
  }
}

/**
 * Carica i match di tutti i tornei di un club dalla subcollection tournaments.
 *
 * Include solo i match dei tornei con status 'completed' o 'in_progress'
 * per le statistiche dei giocatori.
 *
 * Normalizza i match nel formato standard (teamA, teamB, winner, ecc.)
 *
 * @param {string} clubId - ID del club
 * @returns {Promise<Array>} Array di match da tornei con campi normalizzati
 * @throws {Error} Se il clubId non è valido o si verifica un errore Firestore
 *
 * @example
 * const tournamentMatches = await getTournamentMatches('sporting-cat');
 * // Restituisce match da tutti i tornei, con teamA, teamB, winner, sets, games, ecc.
 */
export async function getTournamentMatches(clubId) {
  if (!clubId) {
    throw new Error('clubId è richiesto per getTournamentMatches');
  }

  try {
    // 1. Carica tutti i tornei del club
    const tournamentsRef = collection(db, `clubs/${clubId}/tournaments`);
    const tournamentsSnap = await getDocs(tournamentsRef);

    if (tournamentsSnap.empty) {
      console.log(`ℹ️ Nessun torneo trovato per club ${clubId}`);
      return [];
    }

    console.log(`📋 Trovati ${tournamentsSnap.docs.length} tornei per club ${clubId}`);

    // 2. Per ogni torneo, carica i suoi match E i suoi team (per espandere i giocatori)
    const tournamentMatches = [];
    const promises = [];

    tournamentsSnap.docs.forEach((tDoc) => {
      const tournament = { id: tDoc.id, ...tDoc.data() };
      console.log(
        `🏆 Torneo "${tournament.name}" (${tournament.id}): status="${tournament.status}"`
      );

      // Carica match e team del torneo solo se ha uno status idoneo
      if (tournament.status === 'completed' || tournament.status === 'in_progress') {
        console.log(`✅ Torneo "${tournament.name}" ha status valido, caricamento match...`);
        const matchesRef = collection(db, `clubs/${clubId}/tournaments/${tournament.id}/matches`);
        const teamsRef = collection(db, `clubs/${clubId}/tournaments/${tournament.id}/teams`);

        // Carica match e team in parallelo per questo torneo
        promises.push(
          Promise.all([getDocs(matchesRef), getDocs(teamsRef)]).then(([matchesSnap, teamsSnap]) => {
            console.log(
              `  📊 Torneo "${tournament.name}": trovati ${matchesSnap.docs.length} match e ${teamsSnap.docs.length} team`
            );

            // Crea mappa dei team per quick lookup
            const teamsMap = {};
            teamsSnap.docs.forEach((tDoc) => {
              teamsMap[tDoc.id] = { id: tDoc.id, ...tDoc.data() };
            });

            // Processa i match e li normalizza
            const matches = matchesSnap.docs
              .map((mDoc) => {
                const match = { id: mDoc.id, ...mDoc.data() };

                // Controlla se il match ha risultati (sets o score)
                const hasResults = Array.isArray(match.sets) && match.sets.length > 0;
                const hasWinner = !!match.winnerId;

                // Filtra match che hanno risultati (sets o winner)
                // Includi anche completate o in_progress con risultati
                if (!hasResults && !hasWinner) {
                  console.log(
                    `    ⏭️ Match ${match.id} ignorato: nessun risultato (status="${match.status}", sets=${match.sets?.length || 0}, winnerId=${match.winnerId})`
                  );
                  return null;
                }

                // Recupera i team
                const team1 = teamsMap[match.team1Id];
                const team2 = teamsMap[match.team2Id];

                if (!team1 || !team2) {
                  console.warn(`⚠️ Team non trovato per match ${match.id}`);
                  return null;
                }

                // Estrai i giocatori dai team
                const team1Players = Array.isArray(team1.players)
                  ? team1.players.map((p) => p.playerId || p.id || p).filter(Boolean)
                  : [];
                const team2Players = Array.isArray(team2.players)
                  ? team2.players.map((p) => p.playerId || p.id || p).filter(Boolean)
                  : [];

                console.log(
                  `    🎯 Match ${match.id}: team1=${team1.teamName}[${team1Players.join(
                    ','
                  )}] vs team2=${team2.teamName}[${team2Players.join(',')}] (sets=${match.sets?.length || 0}, winner=${match.winnerId})`
                );

                // Trasforma i sets dal formato torneo al formato standard
                const normalizedSets = Array.isArray(match.sets)
                  ? match.sets.map((s) => ({
                      a: Number(s?.team1 || 0),
                      b: Number(s?.team2 || 0),
                    }))
                  : [];

                // Calcola i set e game totali
                let setsA = 0,
                  setsB = 0,
                  gamesA = 0,
                  gamesB = 0;
                normalizedSets.forEach((s) => {
                  if (s.a > s.b) setsA++;
                  else if (s.b > s.a) setsB++;
                  gamesA += s.a;
                  gamesB += s.b;
                });

                // Determina il vincitore
                let winner = null;
                if (match.winnerId) {
                  winner = match.winnerId === match.team1Id ? 'A' : 'B';
                } else if (setsA > setsB) {
                  winner = 'A';
                } else if (setsB > setsA) {
                  winner = 'B';
                }

                if (!winner) {
                  console.warn(`⚠️ Match ${match.id}: impossibile determinare il vincitore`);
                  return null;
                }

                // Normalize date to ISO string format (consistent with regular matches)
                let matchDate;
                if (match.completedAt) {
                  matchDate =
                    typeof match.completedAt === 'string'
                      ? match.completedAt
                      : match.completedAt?.toDate?.()
                        ? match.completedAt.toDate().toISOString()
                        : new Date(match.completedAt).toISOString();
                } else if (match.scheduledDate) {
                  matchDate =
                    typeof match.scheduledDate === 'string'
                      ? match.scheduledDate
                      : match.scheduledDate?.toDate?.()
                        ? match.scheduledDate.toDate().toISOString()
                        : new Date(match.scheduledDate).toISOString();
                } else {
                  matchDate = new Date().toISOString();
                }

                // Restituisci il match normalizzato nel formato standard
                return {
                  id: match.id,
                  date: matchDate, // ✅ Now always an ISO string
                  teamA: team1Players,
                  teamB: team2Players,
                  winner,
                  setsA,
                  setsB,
                  gamesA,
                  gamesB,
                  deltaA: 0, // Le partite di torneo non hanno deltaA/B nel DB
                  deltaB: 0,
                  sets: normalizedSets,
                  // Metadata dal torneo
                  tournamentId: tournament.id,
                  tournamentName: tournament.name,
                  tournamentMatch: true,
                  isTournamentMatch: true, // 🏆 Explicit marker for RPA exclusion
                  // Campi originali per compatibilità
                  ...match,
                };
              })
              .filter(Boolean); // Rimuovi i null

            tournamentMatches.push(...matches);
          })
        );
      }
    });

    await Promise.all(promises);

    console.log(`✅ Caricati ${tournamentMatches.length} match da tornei per club ${clubId}`);
    return tournamentMatches;
  } catch (error) {
    console.error(`❌ Errore caricamento match tornei club ${clubId}:`, error);
    // Restituisci array vuoto invece di errore per non interrompere il flusso
    return [];
  }
}

/**
 * Carica sia i match regolari che i match dei tornei di un club.
 *
 * Utile per statistiche che devono includere sia le partite normali che quelle di torneo.
 *
 * @param {string} clubId - ID del club
 * @param {Object} options - Opzioni per getClubMatches
 * @returns {Promise<Array>} Array combinato di match regolari e tournament match
 *
 * @example
 * const allMatches = await getClubMatchesWithTournaments('sporting-cat');
 * // Include sia match normali che match da tornei
 */
export async function getClubMatchesWithTournaments(clubId, options = {}) {
  if (!clubId) {
    throw new Error('clubId è richiesto per getClubMatchesWithTournaments');
  }

  try {
    // Carica sia i match regolari che quelli dei tornei in parallelo
    const [clubMatches, tourneyMatches] = await Promise.all([
      getClubMatches(clubId, options),
      getTournamentMatches(clubId),
    ]);

    // Combina gli array
    const allMatches = [...clubMatches, ...tourneyMatches];

    console.log(
      `✅ Caricati ${clubMatches.length} match regolari + ${tourneyMatches.length} match tornei = ${allMatches.length} totali`
    );

    return allMatches;
  } catch (error) {
    console.error(`❌ Errore caricamento match combinati per ${clubId}:`, error);
    throw new Error(`Impossibile caricare i match: ${error.message}`);
  }
}
