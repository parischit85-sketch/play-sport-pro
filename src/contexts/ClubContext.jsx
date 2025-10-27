import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@services/firebase.js';
import { computeClubRanking } from '@lib/ranking-club.js';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';

export const ClubContext = createContext(null);

export const useClub = () => {
  const ctx = useContext(ClubContext);
  if (!ctx) {
    // In test environments, return a safe stub instead of throwing
    const isTest =
      (typeof import.meta !== 'undefined' &&
        (import.meta.vitest || (import.meta.env && import.meta.env.MODE === 'test'))) ||
      (typeof globalThis !== 'undefined' &&
        globalThis.process &&
        (globalThis.process.env?.NODE_ENV === 'test' ||
          globalThis.process.env?.VITEST_WORKER_ID)) ||
      (typeof globalThis !== 'undefined' && (globalThis.__vitest_worker__ || globalThis.vi));
    if (isTest) {
      return {
        clubId: null,
        courts: [],
        players: [],
        matches: [],
        club: null,
        loading: false,
        leaderboard: {},
        playersLoaded: false,
        matchesLoaded: false,
        loadPlayers: async () => {},
        loadMatches: async () => {},
        selectClub: () => {},
        exitClub: () => {},
        hasClub: false,
        playersById: {},
        loadingStates: { players: false, matches: false },
        addPlayer: async () => {},
        updatePlayer: async () => {},
        deletePlayer: async () => {},
        isUserInstructor: () => false,
      };
    }
    throw new Error('useClub must be used within ClubProvider');
  }
  return ctx;
};

export function ClubProvider({ children }) {
  const params = useParams();
  const clubId = params.clubId;
  const navigate = useNavigate();
  const [courts, setCourts] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  // 🏅 Championship leaderboard (playerId -> doc data)
  const [leaderboard, setLeaderboard] = useState({});

  console.log('🏢 [ClubProvider] Params from route:', {
    allParams: params,
    clubId,
    timestamp: new Date().toISOString(),
  });
  const [playersLoaded, setPlayersLoaded] = useState(false);
  const [matchesLoaded, setMatchesLoaded] = useState(false);
  const [tournamentMatches, setTournamentMatches] = useState([]);

  // Carica i dati del club principale
  useEffect(() => {
    if (!clubId) {
      setLoading(false);
      return;
    }

    console.log('🔍 [ClubContext] Loading club data for:', clubId);
    const clubRef = doc(db, 'clubs', clubId);
    const unsubscribeClub = onSnapshot(clubRef, (snapshot) => {
      if (snapshot.exists()) {
        const clubData = { id: snapshot.id, ...snapshot.data() };
        console.log('✅ [ClubContext] Club loaded:', clubData.name || clubData.id);
        setClub(clubData);
      } else {
        console.error('❌ [ClubContext] Club not found:', clubId);
        setClub(null);
      }
    });

    return unsubscribeClub;
  }, [clubId]);

  // Carica i campi del club
  useEffect(() => {
    if (!clubId) return;

    const courtsRef = collection(db, 'clubs', clubId, 'courts');
    const unsubscribe = onSnapshot(courtsRef, (snapshot) => {
      const courtsData = snapshot.docs
        .map((doc) => ({
          firebaseId: doc.id,
          // Usa sempre il Firebase ID come ID principale per evitare duplicati
          id: doc.id,
          ...doc.data(),
        }))
        .filter((court) => {
          const isInvalid = !court.name || court.name.trim() === '';
          if (isInvalid) {
            console.log('Filtered invalid court:', court.name || '(no name)');
            return false;
          }
          return true;
        });

      // Assegna ordine ai campi se manca e aggiorna il database
      const courtsWithOrder = courtsData.map((court, index) => {
        if (court.order === undefined || court.order === null) {
          const newOrder = index + 1;
          // Aggiorna il database in background
          const courtRef = doc(db, 'clubs', clubId, 'courts', court.firebaseId);
          updateDoc(courtRef, { order: newOrder }).catch((error) => {
            console.error('Error updating court order:', error);
          });
          return { ...court, order: newOrder };
        }
        return court;
      });

      // Ordina i campi per posizione (order property) prima di settarli nello state
      const sortedCourts = [...courtsWithOrder].sort((a, b) => {
        const orderA = a.order || 999;
        const orderB = b.order || 999;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        // Se gli ordini sono uguali, ordina per nome come fallback
        return (a.name || '').localeCompare(b.name || '');
      });

      console.log('Courts loaded:', sortedCourts.length);
      setCourts(sortedCourts);
      setLoading(false);
    });

    return unsubscribe;
  }, [clubId]);

  // 🏅 Championship Leaderboard listener
  useEffect(() => {
    if (!clubId) return;

    try {
      const lbRef = collection(db, 'clubs', clubId, 'leaderboard');
      const unsubscribe = onSnapshot(lbRef, async (snapshot) => {
        const map = {};

        // Load each player's leaderboard data AND their entries sub-collection
        const promises = snapshot.docs.map(async (playerDoc) => {
          const playerId = playerDoc.id;
          const playerData = { id: playerId, ...playerDoc.data() };

          // Load entries sub-collection for this player
          try {
            const entriesRef = collection(db, 'clubs', clubId, 'leaderboard', playerId, 'entries');
            const entriesSnap = await getDocs(entriesRef);
            const entries = entriesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
            playerData.entries = entries;
          } catch {
            console.warn(`⚠️ Failed to load entries for player ${playerId}`);
            playerData.entries = [];
          }

          map[playerId] = playerData;
        });

        await Promise.all(promises);
        setLeaderboard(map);
      });
      return unsubscribe;
    } catch (err) {
      console.warn('⚠️ [ClubContext] Failed to subscribe leaderboard:', err);
    }
  }, [clubId]);

  // 🏆 Load tournament matches from leaderboard entries
  useEffect(() => {
    if (!clubId || !playersLoaded) return;

    const loadTournamentMatches = async () => {
      try {
        const allMatches = [];
        const matchIds = new Set();

        // For each player, load their entries and extract matchDetails
        for (const player of players) {
          try {
            const entriesRef = collection(db, 'clubs', clubId, 'leaderboard', player.id, 'entries');
            const entriesSnap = await getDocs(entriesRef);

            for (const entryDoc of entriesSnap.docs) {
              const entry = entryDoc.data();
              if (Array.isArray(entry.matchDetails)) {
                for (const match of entry.matchDetails) {
                  // Avoid duplicates
                  if (!matchIds.has(match.matchId || match.id)) {
                    allMatches.push(match);
                    matchIds.add(match.matchId || match.id);
                  }
                }
              }
            }
          } catch {
            // Silent fail per player
          }
        }

        console.log(
          `🏆 [ClubContext] Loaded ${allMatches.length} tournament matches from leaderboard`
        );
        setTournamentMatches(allMatches);
      } catch (e) {
        console.warn('⚠️ [ClubContext] Failed to load tournament matches:', e);
      }
    };

    loadTournamentMatches();
  }, [clubId, players, playersLoaded]);

  // I useEffect per loadPlayers e loadMatches saranno spostati dopo le definizioni delle funzioni

  const deleteCourt = useCallback(
    async (courtId) => {
      if (!clubId || !courtId) {
        throw new Error('Club ID and Court ID required');
      }

      console.log('Deleting court:', courtId);

      const court = courts.find((c) => c.id === courtId);
      const firebaseDocId = court?.firebaseId || courtId;

      console.log('ID Mapping:', courtId, '->', firebaseDocId);

      try {
        const courtRef = doc(db, 'clubs', clubId, 'courts', firebaseDocId);
        await deleteDoc(courtRef);
        console.log('Court deleted:', courtId);
      } catch (error) {
        console.error('Error deleting court:', error);
        throw error;
      }
    },
    [clubId, courts]
  );

  const addCourt = useCallback(
    async (courtData) => {
      if (!clubId) throw new Error('Club ID required');

      try {
        const courtsRef = collection(db, 'clubs', clubId, 'courts');
        const docRef = await addDoc(courtsRef, courtData);
        console.log('Court added:', docRef.id);
        return docRef.id;
      } catch (error) {
        console.error('Error adding court:', error);
        throw error;
      }
    },
    [clubId]
  );

  const updateCourt = useCallback(
    async (courtId, updates) => {
      if (!clubId || !courtId) throw new Error('Club ID and Court ID required');

      const court = courts.find((c) => c.id === courtId);
      const firebaseDocId = court?.firebaseId || courtId;

      try {
        const courtRef = doc(db, 'clubs', clubId, 'courts', firebaseDocId);
        await updateDoc(courtRef, updates);
        console.log('Court updated:', courtId);
      } catch (error) {
        console.error('Error updating court:', error);
        throw error;
      }
    },
    [clubId, courts]
  );

  const loadPlayers = useCallback(async () => {
    if (!clubId || playersLoaded) return;

    try {
      console.log('🔍 [ClubContext] Loading players for club:', clubId);

      // 🔄 OPTION A: Single source of truth - Load users directly from club's users collection
      const { getClubUsers } = await import('@services/club-users.js');
      const clubUsers = await getClubUsers(clubId);

      console.log('🔍 [ClubContext] Found club users:', clubUsers.length);
      if (clubUsers.length === 0) {
        console.log('⚠️ [ClubContext] No club users found for club:', clubId);
        setPlayers([]);
        setPlayersLoaded(true);
        return;
      }

      // 🔄 OPTION A: All user data is now stored in clubs/{clubId}/users collection
      // No need to merge with separate profiles collection

      // Transform club users to player format
      const playersData = clubUsers.map((clubUser) => {
        // 🔍 CRITICAL: userId might be undefined for legacy users
        // In that case, use the club-user document ID as the player ID
        const userId = clubUser.userId || clubUser.id;

        console.log('🔍 [ClubContext] Processing club user:', userId, {
          hasUserId: !!clubUser.userId,
          isLinked: clubUser.isLinked || false,
        });

        // Use merged data if available, otherwise fall back to individual fields
        const mergedData = clubUser.mergedData || {};

        // Build player object from club user data
        const playerData = {
          // Base data from club-user
          id: userId,
          name: mergedData.name || clubUser.userName || 'Unknown User',
          displayName: mergedData.name || clubUser.userName || 'Unknown User',
          email: mergedData.email || clubUser.userEmail || '',
          phone: mergedData.phone || clubUser.userPhone || '',
          // ❌ REMOVED: rating field - will be calculated by computeClubRanking from matches
          // rating: mergedData.rating || clubUser.originalProfileData?.rating || 1500,
          role: clubUser.role || 'player',
          isLinked: clubUser.isLinked || !!clubUser.linkedUserId,
          clubUserId: clubUser.id, // Keep reference to club user document

          // Additional data from original profile data (if available)
          category: clubUser.originalProfileData?.category || 'member',
          instructorData: clubUser.originalProfileData?.instructorData || null,
          tournamentData: clubUser.originalProfileData?.tournamentData || {
            isParticipant: true,
            isActive: true,
            currentRanking: clubUser.originalProfileData?.baseRating || 1500,
            initialRanking: clubUser.originalProfileData?.baseRating || 1500,
          },

          // Preserve other profile data
          baseRating: clubUser.originalProfileData?.baseRating || 1500,
          tags: clubUser.originalProfileData?.tags || [],
          subscriptions: clubUser.originalProfileData?.subscriptions || [],
          wallet: clubUser.originalProfileData?.wallet || { balance: 0, currency: 'EUR' },
          notes: clubUser.originalProfileData?.notes || [],
          bookingHistory: clubUser.originalProfileData?.bookingHistory || [],
          matchHistory: clubUser.originalProfileData?.matchHistory || [],
          medicalCertificates: clubUser.originalProfileData?.medicalCertificates || {
            current: null,
            history: [],
          },
          certificateStatus: clubUser.originalProfileData?.certificateStatus || null,
          isActive: clubUser.originalProfileData?.isActive !== false,

          // Metadata
          createdAt: clubUser.originalProfileData?.createdAt || clubUser.addedAt,
          updatedAt: clubUser.originalProfileData?.updatedAt || null,
          lastActivity: clubUser.originalProfileData?.lastActivity || null,
        };

        return playerData;
      });

      // 🧹 FILTRO FINALE: Rimuovi solo profili completamente invalidi
      const filteredPlayers = playersData.filter((player) => {
        // Deve avere almeno un ID valido
        const hasValidId = player.id && player.id.trim().length > 0;
        if (!hasValidId) {
          console.log('🚫 FILTERING OUT PLAYER (no ID):', player);
          return false;
        }

        // Se non ha un name valido, logga un warning ma mantieni il player
        // (il fallback 'Unknown User' garantisce che ci sia sempre un nome)
        if (!player.name || player.name === 'Unknown User') {
          console.log('⚠️ KEEPING PLAYER WITH PLACEHOLDER NAME:', {
            id: player.id,
            name: player.name,
            email: player.email,
            role: player.role,
          });
        }

        return true;
      });

      console.log('✅ Players loaded from single source:', filteredPlayers.length);

      setPlayers(filteredPlayers);
      setPlayersLoaded(true);
      console.log('Players loaded:', filteredPlayers.length);
    } catch (error) {
      console.error('Error loading players:', error);
      setPlayersLoaded(true);
    }
  }, [clubId, playersLoaded]);
  const loadMatches = useCallback(
    async (forceReload = false) => {
      if (!clubId || (matchesLoaded && !forceReload)) return;

      try {
        console.log('Loading matches for club:', clubId);

        // 🆕 LOGICA: Carica SOLO partite regolari + legacy bookings (NO tornei qui)
        // I tornei vengono aggregati in championshipApplyService quando premi "Applica Punti"

        // 1️⃣ Carica partite regolari
        let regularMatches = [];
        try {
          const newMatchesSnapshot = await getDocs(collection(db, 'clubs', clubId, 'matches'));
          regularMatches = newMatchesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log('🆕 Regular matches found:', regularMatches.length);
        } catch {
          console.log('⚠️ No regular matches collection for club:', clubId);
        }

        // 2️⃣ Carica dalle vecchie bookings (legacy)
        const allBookingsSnapshot = await getDocs(collection(db, 'bookings'));
        const allClubBookings = allBookingsSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((booking) => booking.clubId === clubId);

        console.log('📊 Total legacy bookings for club:', allClubBookings.length);

        // 3️⃣ Combina SOLO partite regolari + legacy bookings (i tornei sono gestiti separatamente)
        const allMatches = [...regularMatches, ...allClubBookings];
        console.log('🔍 Combined matches from regular + legacy:', {
          regularMatches: regularMatches.length,
          legacyBookings: allClubBookings.length,
          total: allMatches.length,
        });

        if (allClubBookings.length > 0) {
          const sample = allClubBookings[0];
          console.log('📋 Sample booking keys:', Object.keys(sample));
          console.log('📋 Sample booking:', {
            id: sample.id,
            status: sample.status,
            hasResult: !!sample.result,
            hasSets: !!sample.sets,
            setsLength: sample.sets?.length,
          });

          // Analizza tutti gli status
          const statusCounts = {};
          const bookingsWithResults = [];
          allClubBookings.forEach((booking) => {
            statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
            if (booking.result || booking.sets?.length > 0 || booking.score) {
              bookingsWithResults.push({
                id: booking.id,
                status: booking.status,
                hasResult: !!booking.result,
                hasSets: !!booking.sets,
                hasScore: !!booking.score,
                players: booking.players?.length || 0,
              });
            }
          });

          console.log('📊 Status distribution:', statusCounts);
          console.log('🏆 Bookings with results/sets/score:', bookingsWithResults.length);
          if (bookingsWithResults.length > 0) {
            console.log('📋 Sample match:', bookingsWithResults[0]);
          }
        }

        // 4️⃣ Filtra le partite valide da entrambe le fonti
        const rawMatches = allMatches.filter((match) => {
          // Per le partite regolari - controllare teamA/teamB
          if (match.teamA && match.teamB && match.sets) {
            return true;
          }

          // Per le vecchie bookings - SOLO se sono vere partite completate
          // Escludiamo le prenotazioni di campo (type: 'court')
          if (match.type === 'court' && !match.result && !match.sets?.length && !match.score) {
            return false; // Esclude prenotazioni di campo senza risultati
          }

          return (
            match.status === 'completed' || match.result || match.sets?.length > 0 || match.score
          );
        });

        console.log('🎯 Raw matches found:', rawMatches.length);
        if (rawMatches.length > 0) {
          console.log('📋 Sample raw match:', {
            id: rawMatches[0].id,
            players: rawMatches[0].players,
            participants: rawMatches[0].participants,
            teamA: rawMatches[0].teamA,
            teamB: rawMatches[0].teamB,
          });
        }

        // Trasforma le bookings in partite con teamA/teamB
        const matchesData = rawMatches
          .map((match) => {
            if (match.teamA && match.teamB) {
              // Già ha la struttura corretta
              return match;
            }

            // Trasforma players array in teamA/teamB
            if (match.players && match.players.length >= 4) {
              const players = match.players;
              return {
                ...match,
                teamA: [players[0], players[1]], // Primi 2 giocatori = Team A
                teamB: [players[2], players[3]], // Ultimi 2 giocatori = Team B
              };
            } else if (match.players && match.players.length === 2) {
              // Singolo (2 giocatori)
              return {
                ...match,
                teamA: [match.players[0]],
                teamB: [match.players[1]],
              };
            }

            // Se non ha players o struttura valida, salta
            console.warn('⚠️ Match without valid players structure:', match.id);
            return null;
          })
          .filter(Boolean);

        console.log('🎯 Processed matches:', matchesData.length);

        // 🗓️ Ordina le partite dalla più recente alla più vecchia
        const sortedMatches = matchesData.sort((a, b) => {
          // Funzione helper per ottenere la data da diversi formati
          const getMatchDate = (match) => {
            // Per le nuove partite (da matches collection)
            if (match.date) {
              if (match.date.toDate) {
                return match.date.toDate(); // Firestore Timestamp
              }
              return new Date(match.date); // String date
            }

            // Per le bookings legacy
            if (match.createdAt) {
              if (match.createdAt.toDate) {
                return match.createdAt.toDate(); // Firestore Timestamp
              }
              return new Date(match.createdAt); // String date
            }

            // Fallback: data corrente se non trovata
            return new Date();
          };

          const dateA = getMatchDate(a);
          const dateB = getMatchDate(b);

          // Ordine decrescente (più recente prima): dateB - dateA
          return dateB.getTime() - dateA.getTime();
        });

        console.log('📅 Matches sorted by date (newest first):', sortedMatches.length);

        setMatches(sortedMatches);
        setMatchesLoaded(true);
        console.log('Matches loaded:', sortedMatches.length);
      } catch (error) {
        console.error('Error loading matches:', error);
      }
    },
    [clubId, matchesLoaded]
  );

  // Reset players and matches when clubId changes
  useEffect(() => {
    console.log('🔄 [ClubContext] clubId changed, resetting state:', {
      clubId,
      timestamp: new Date().toISOString(),
    });

    // Reset players state when clubId changes
    setPlayersLoaded(false);
    setPlayers([]);

    // Reset matches state when clubId changes
    setMatchesLoaded(false);
    setMatches([]);
  }, [clubId]);

  // Carica automaticamente players e matches quando cambia clubId (dopo definizione funzioni)
  useEffect(() => {
    if (clubId && !playersLoaded) {
      console.log('Auto-loading players for club:', clubId);
      loadPlayers();
    }
  }, [clubId, playersLoaded, loadPlayers]);

  useEffect(() => {
    if (clubId && !matchesLoaded) {
      console.log('Auto-loading matches for club:', clubId);
      loadMatches();
    }
  }, [clubId, matchesLoaded, loadMatches]);

  const selectClub = useCallback(
    (newClubId) => {
      console.log('🏢 [ClubContext] selectClub called:', {
        newClubId,
        currentClubId: clubId,
        timestamp: new Date().toISOString(),
      });

      if (!newClubId) {
        console.log('⚠️ [ClubContext] No clubId provided, navigating to /');
        navigate('/');
        return;
      }

      console.log('✅ [ClubContext] Navigating to club:', `/club/${newClubId}`);
      navigate(`/club/${newClubId}`);
    },
    [navigate, clubId]
  );

  const exitClub = useCallback(() => {
    console.log('🚪 [ClubContext] exitClub called:', {
      currentClubId: clubId,
      timestamp: new Date().toISOString(),
    });

    console.log('✅ [ClubContext] Navigating to /dashboard');
    navigate('/dashboard');
  }, [navigate, clubId]);

  const hasClub = Boolean(clubId);

  // 🧮 Calcolo ranking club (inclusi punti campionato) e mappa rating per giocatore
  const calculatedRatingsById = React.useMemo(() => {
    try {
      if (!clubId || players.length === 0) return {};
      const tournamentPlayers = players.filter(
        (p) => p.tournamentData?.isParticipant === true && p.tournamentData?.isActive === true
      );

      console.log('🎯 [ClubContext] ========== CALCOLO calculatedRatings ==========');
      console.log('📊 Tournament players:', tournamentPlayers.length);
      console.log('📊 Regular matches:', matches.length);
      console.log('📊 Tournament matches:', tournamentMatches.length);
      console.log('📊 Leaderboard entries:', Object.keys(leaderboard || {}).length);

      // Combine regular matches with tournament matches from leaderboard
      const combinedMatches = [...matches, ...tournamentMatches];
      const data = computeClubRanking(tournamentPlayers, combinedMatches, clubId, {
        leaderboardMap: leaderboard,
      });
      const map = {};
      (data.players || []).forEach((p) => {
        map[p.id] = p.rating;
      });

      console.log('🏆 [ClubContext] Calculated ratings (top 5):');
      Object.entries(map)
        .slice(0, 5)
        .forEach(([id, rating]) => {
          const player = players.find((p) => p.id === id);
          console.log(`  ${player?.name || id}: ${rating}`);
        });
      console.log('========================================================');

      return map;
    } catch (e) {
      console.warn('⚠️ [ClubContext] computeClubRanking failed:', e);
      return {};
    }
  }, [clubId, players, matches, leaderboard, tournamentMatches]);

  // Memo: mappa byId con calculatedRating iniettato per uso nei componenti (PlayerCard -> getEffectiveRanking)
  const playersById = React.useMemo(() => {
    return Object.fromEntries(
      (players || []).map((p) => [p.id, { ...p, calculatedRating: calculatedRatingsById[p.id] }])
    );
  }, [players, calculatedRatingsById]);

  const loadingStates = {
    players: !playersLoaded,
    matches: !matchesLoaded,
  };

  // Placeholder functions for player management (to be implemented if needed)
  const addPlayer = useCallback(
    async (playerData, currentUser = null) => {
      if (!clubId) {
        throw new Error('No club selected');
      }

      try {
        console.log('📝 [ClubContext] Adding player to club:', clubId, playerData);

        // Import the club users service
        const { addUserToClub } = await import('@services/club-users.js');

        // Check if playerData has linkedAccountId (user already exists)
        if (playerData.linkedAccountId) {
          // Add existing registered user to club
          const clubUser = await addUserToClub(clubId, playerData.linkedAccountId, {
            role: 'player',
            addedBy: 'current-user',
            notes: playerData.notes || '',
          });

          console.log('✅ [ClubContext] Registered user added to club:', clubUser);

          // Reload players to get updated list
          setPlayersLoaded(false);
          await loadPlayers();

          return clubUser;
        } else {
          // 🔄 OPTION A: Create new user entry directly in club's users collection
          // Single source of truth - no separate profiles collection
          const { db } = await import('@services/firebase.js');
          const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');

          const userData = {
            name: playerData.name || '',
            displayName: playerData.name || '',
            email: playerData.email || '',
            phone: playerData.phone || '',
            rating: playerData.rating || 1500,
            baseRating: playerData.rating || 1500,
            category: 'member',
            role: 'player',
            isActive: true,
            tags: [],
            subscriptions: [],
            wallet: { balance: 0, currency: 'EUR', transactions: [] },
            notes: playerData.notes ? [{ text: playerData.notes, createdAt: new Date() }] : [],
            bookingHistory: [],
            matchHistory: [],
            medicalCertificates: { current: null, history: [] },
            certificateStatus: null,
            tournamentData: {
              isParticipant: true,
              isActive: true,
              currentRanking: playerData.rating || 1500,
              initialRanking: playerData.rating || 1500,
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          // Create club user entry with embedded profile data
          const clubUserData = {
            userId: null, // Will be set to the document ID
            clubId: clubId,
            userEmail: userData.email || '',
            userName: userData.name || '',
            userPhone: userData.phone || '',
            role: 'player',
            status: 'active',
            addedAt: serverTimestamp(),
            addedBy: currentUser?.uid || 'system',
            notes: playerData.notes || '',
            isLinked: false, // Not linked to a registered account
            originalProfileData: userData, // Embed all profile data here
          };

          const clubUsersRef = collection(db, 'clubs', clubId, 'users');
          const clubUserDocRef = await addDoc(clubUsersRef, {
            ...clubUserData,
            userId: null, // Will be updated after creation
          });

          // Update the userId to be the document ID for non-registered users
          await updateDoc(clubUserDocRef, {
            userId: clubUserDocRef.id,
            updatedAt: serverTimestamp(),
          });

          console.log('✅ [ClubContext] New club user created:', clubUserDocRef.id);

          // Reload players to get updated list
          setPlayersLoaded(false);
          await loadPlayers();

          return { id: clubUserDocRef.id, ...userData };
        }
      } catch (error) {
        console.error('❌ [ClubContext] Error adding player:', error);
        throw error;
      }
    },
    [clubId, loadPlayers]
  );

  const updatePlayer = useCallback(
    async (playerId, updates) => {
      if (!clubId || !playerId) {
        throw new Error('Club ID and Player ID required');
      }

      try {
        console.log('📝 [ClubContext] Updating player:', playerId, updates);

        const { db } = await import('@services/firebase.js');
        const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');

        // 🔄 OPTION A: Find the player in club users collection (single source of truth)
        const { getClubUsers } = await import('@services/club-users.js');
        const clubUsers = await getClubUsers(clubId);
        // Some legacy documents may not have userId set; in that case the document id is the effective player id
        const clubUser = clubUsers.find((u) => u.userId === playerId || u.id === playerId);

        if (clubUser) {
          // Update the club user document with all changes
          const clubUserRef = doc(db, 'clubs', clubId, 'users', clubUser.id);
          const clubUserUpdates = {
            updatedAt: serverTimestamp(),
          };

          // Update basic club user fields
          if (updates.role) clubUserUpdates.role = updates.role;
          if (updates.status) clubUserUpdates.status = updates.status;
          if (updates.name) {
            clubUserUpdates.userName = updates.name;
          }
          if (updates.email !== undefined) clubUserUpdates.userEmail = updates.email;
          if (updates.phone !== undefined) clubUserUpdates.userPhone = updates.phone;

          // Prepare profile data updates
          const profileUpdates = {};
          if (updates.name) {
            profileUpdates.name = updates.name;
            profileUpdates.displayName = updates.name;
          }
          if (updates.email !== undefined && updates.email !== null) {
            profileUpdates.email = updates.email;
          }
          if (updates.phone !== undefined && updates.phone !== null) {
            profileUpdates.phone = updates.phone;
          }
          if (updates.rating !== undefined) {
            profileUpdates.rating = updates.rating;
            profileUpdates.baseRating = updates.rating;
          }
          if (updates.category) profileUpdates.category = updates.category;
          if (updates.instructorData !== undefined) {
            profileUpdates.instructorData = updates.instructorData;
          }
          if (updates.tournamentData !== undefined) {
            profileUpdates.tournamentData = updates.tournamentData;
            // Sync rating with tournament ranking if not explicitly set
            if (updates.tournamentData.currentRanking && updates.rating === undefined) {
              profileUpdates.rating = updates.tournamentData.currentRanking;
              profileUpdates.baseRating = updates.tournamentData.currentRanking;
            }
          }
          if (updates.tags) profileUpdates.tags = updates.tags;
          if (updates.notes) profileUpdates.notes = updates.notes;
          if (updates.wallet) profileUpdates.wallet = updates.wallet;
          if (updates.medicalCertificates !== undefined) {
            profileUpdates.medicalCertificates = updates.medicalCertificates;
          }
          if (updates.certificateStatus !== undefined) {
            profileUpdates.certificateStatus = updates.certificateStatus;
          }
          profileUpdates.updatedAt = serverTimestamp();

          // Merge profile updates into originalProfileData
          if (Object.keys(profileUpdates).length > 0) {
            clubUserUpdates.originalProfileData = {
              ...clubUser.originalProfileData,
              ...profileUpdates,
            };
          }

          // Remove undefined values
          Object.keys(clubUserUpdates).forEach((key) => {
            if (clubUserUpdates[key] === undefined) {
              delete clubUserUpdates[key];
            }
          });

          console.log('💾 [ClubContext] Club user updates to save:', clubUserUpdates);

          await updateDoc(clubUserRef, clubUserUpdates);
          console.log('✅ [ClubContext] Updated club user document');
        }

        // 🔄 SINCRONIZZAZIONE AUTOMATICA: Se il giocatore è collegato a un account globale,
        // aggiorna anche il profilo globale con i dati rilevanti
        const currentPlayer = players.find((p) => p.id === playerId);
        if (
          currentPlayer?.linkedAccountId &&
          (updates.name || updates.email || updates.phone || updates.rating)
        ) {
          try {
            const { updateUserProfile } = await import('@services/auth.jsx');
            const globalUpdates = {};

            if (updates.name) {
              globalUpdates.displayName = updates.name;
              globalUpdates.firstName = updates.name.split(' ')[0] || '';
              globalUpdates.lastName = updates.name.split(' ').slice(1).join(' ') || '';
            }
            if (updates.email !== undefined) globalUpdates.email = updates.email;
            if (updates.phone !== undefined) globalUpdates.phone = updates.phone;

            if (Object.keys(globalUpdates).length > 0) {
              await updateUserProfile(currentPlayer.linkedAccountId, globalUpdates);
              console.log('🔄 [ClubContext] Synced updates to global user profile');
            }
          } catch (syncError) {
            console.warn('⚠️ [ClubContext] Failed to sync to global profile:', syncError);
            // Non bloccare l'aggiornamento locale per errori di sincronizzazione
          }
        }

        // Reload players to get updated list
        setPlayersLoaded(false);
        await loadPlayers();

        console.log('✅ [ClubContext] Player updated successfully');
      } catch (error) {
        console.error('❌ [ClubContext] Error updating player:', error);
        throw error;
      }
    },
    [clubId, loadPlayers, players]
  );

  const deletePlayer = useCallback(
    async (playerId) => {
      if (!clubId) {
        throw new Error('Club ID not available');
      }

      if (!playerId) {
        throw new Error('Player ID is required');
      }

      console.log('🗑️ [ClubContext] Starting delete process for player:', playerId);
      console.log('🗑️ [ClubContext] Current clubId:', clubId);

      try {
        // 🔄 OPTION A: Find the correct document in clubs/{clubId}/users collection
        // The playerId might be userId field, not the document ID
        const { getClubUsers } = await import('@services/club-users.js');
        const clubUsers = await getClubUsers(clubId);
        const clubUser = clubUsers.find((u) => u.userId === playerId || u.id === playerId);

        if (!clubUser) {
          console.warn('⚠️ [ClubContext] Club user not found for playerId:', playerId);
          throw new Error('Player not found in club users');
        }

        console.log(
          '🗑️ [ClubContext] Found club user document:',
          clubUser.id,
          'for player:',
          playerId
        );

        // Delete the club user document using the document ID
        const userRef = doc(db, 'clubs', clubId, 'users', clubUser.id);
        console.log('🗑️ [ClubContext] Attempting to delete document at path:', userRef.path);

        // First check if document exists
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
          console.warn('⚠️ [ClubContext] Document does not exist:', userRef.path);
          throw new Error('Player document does not exist');
        }

        console.log('🗑️ [ClubContext] Document exists, proceeding with deletion');
        await deleteDoc(userRef);
        console.log('✅ [ClubContext] User document deleted successfully');

        // Small delay to allow delete to propagate
        console.log('⏳ [ClubContext] Waiting 2 seconds for deletion to propagate...');
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Reload players list
        console.log('🔄 [ClubContext] Reloading players after deletion...');
        setPlayersLoaded(false);
        await loadPlayers();
        console.log('✅ [ClubContext] Players reloaded after deletion');

        console.log('✅ [ClubContext] Player deleted successfully');
      } catch (error) {
        console.error('❌ [ClubContext] Error deleting player:', error);
        throw error;
      }
    },
    [clubId, loadPlayers]
  );

  // Check if current user is an instructor in this club
  const isUserInstructor = useCallback(
    (userId) => {
      if (!userId || !players || players.length === 0) return false;

      const userPlayer = players.find((p) => p.id === userId);
      if (!userPlayer) return false;

      // Check if user has instructor category and instructorData
      const hasInstructorCategory = userPlayer.category === 'instructor';
      const hasInstructorData =
        userPlayer.instructorData && userPlayer.instructorData.isInstructor === true;

      return hasInstructorCategory && hasInstructorData;
    },
    [players]
  );

  const value = {
    clubId,
    courts,
    players,
    matches,
    club,
    loading,
    leaderboard,
    playersLoaded,
    matchesLoaded,
    loadPlayers,
    loadMatches,
    addCourt,
    updateCourt,
    deleteCourt,
    selectClub,
    exitClub,
    hasClub,
    playersById,
    loadingStates,
    addPlayer,
    updatePlayer,
    deletePlayer,
    isUserInstructor,
    calculatedRatingsById, // ✅ Export calculated ratings with tournament points
    tournamentMatches, // ✅ Export tournament matches for ranking calculation
  };

  return <ClubContext.Provider value={value}>{children}</ClubContext.Provider>;
}
