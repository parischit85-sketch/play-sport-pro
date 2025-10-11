import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@services/firebase.js';
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

const ClubContext = createContext(null);

export const useClub = () => {
  const ctx = useContext(ClubContext);
  if (!ctx) throw new Error('useClub must be used within ClubProvider');
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

  console.log('🏢 [ClubProvider] Params from route:', {
    allParams: params,
    clubId,
    timestamp: new Date().toISOString(),
  });
  const [playersLoaded, setPlayersLoaded] = useState(false);
  const [matchesLoaded, setMatchesLoaded] = useState(false);

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

      // 🆕 NEW: Load users directly from club's users collection
      const { getClubUsers } = await import('@services/club-users.js');
      const clubUsers = await getClubUsers(clubId);

      console.log('🔍 [ClubContext] Found club users:', clubUsers.length);
      if (clubUsers.length === 0) {
        console.log('⚠️ [ClubContext] No club users found for club:', clubId);
      }

      // 🆕 NEW: Load original club profiles to get additional data (category, instructorData, etc.)
      // ⚠️ IMPORTANTE: Carichiamo profiles SEMPRE, anche se clubUsers è vuoto (backward compatibility)
      let clubProfiles = new Map();
      try {
        const profilesSnapshot = await getDocs(collection(db, 'clubs', clubId, 'profiles'));
        profilesSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          clubProfiles.set(doc.id, data);
          // Debug tournamentData
          if (data.tournamentData) {
            console.log(
              '🏆 [ClubContext] Profile with tournamentData:',
              doc.id,
              data.tournamentData
            );
          }
        });
        console.log('✅ Loaded club profiles:', profilesSnapshot.docs.length);
      } catch (error) {
        console.log('⚠️ Could not load club profiles, continuing without additional data');
      }

      // 🔄 FALLBACK: Se non ci sono users ma ci sono profiles, usa i profiles (backward compatibility)
      if (clubUsers.length === 0 && clubProfiles.size === 0) {
        setPlayers([]);
        setPlayersLoaded(true);
        console.log('No players found for club');
        return;
      }

      // 🔄 LEGACY SUPPORT: Se non ci sono users, crea players solo dai profiles
      let playersData = [];

      if (clubUsers.length === 0 && clubProfiles.size > 0) {
        console.log('🔄 [ClubContext] Using legacy profiles system (no users collection)');

        playersData = Array.from(clubProfiles.entries()).map(([userId, profileData]) => ({
          id: userId,
          name: profileData.name || profileData.displayName || 'Unknown',
          displayName: profileData.name || profileData.displayName || 'Unknown',
          email: profileData.email || '',
          phone: profileData.phone || '',
          rating: profileData.rating || profileData.baseRating || 1500,
          role: profileData.role || 'player',
          isLinked: true, // Profiles have userId as document ID
          clubUserId: null, // No club user document

          // Additional data from profile
          category: profileData.category || 'member',
          instructorData: profileData.instructorData || null,
          tournamentData: profileData.tournamentData
            ? {
                ...profileData.tournamentData,
                currentRanking:
                  profileData.tournamentData.currentRanking || profileData.rating || 1500,
              }
            : null,

          baseRating: profileData.baseRating || profileData.rating || 1500,
          tags: profileData.tags || [],
          subscriptions: profileData.subscriptions || [],
          wallet: profileData.wallet || { balance: 0, currency: 'EUR' },
          notes: profileData.notes || [],
          bookingHistory: profileData.bookingHistory || [],
          matchHistory: profileData.matchHistory || [],
          medicalCertificates: profileData.medicalCertificates || { current: null, history: [] }, // 🔧 FIX: Include certificati medici
          certificateStatus: profileData.certificateStatus || null, // 🔧 FIX: Include status certificato
          isActive: profileData.isActive !== false,

          createdAt: profileData.createdAt || null,
          updatedAt: profileData.updatedAt || null,
          lastActivity: profileData.lastActivity || null,
        }));

        console.log('✅ [ClubContext] Created', playersData.length, 'players from legacy profiles');
      } else {
        // Transform club users to player format with merged profile data
        playersData = clubUsers.map((clubUser) => {
          // 🔍 CRITICAL: userId might be undefined for legacy users
          // In that case, use the club-user document ID as the player ID
          const userId = clubUser.userId || clubUser.id;
          const originalProfile = clubProfiles.get(userId);

          // 🔍 DEBUG: Log certificate data for player 70xe0dha
          if (userId === '70xe0dha') {
            console.log('🔍 [DEBUG] Player 70xe0dha BEFORE mapping:', {
              clubUserId: clubUser.id,
              userId,
              hasProfile: !!originalProfile,
              hasCertificate: !!originalProfile?.medicalCertificates,
              certificateData: originalProfile?.medicalCertificates,
              certificateRaw: originalProfile && 'medicalCertificates' in originalProfile,
              profileKeys: originalProfile ? Object.keys(originalProfile) : 'no profile',
              fullProfile: originalProfile
            });
          }

          // Debug problematic users without userId
          if (!clubUser.userId) {
            console.log('⚠️ [ClubContext] Club user without userId, using doc ID:', {
              docId: clubUser.id,
              userName: clubUser.userName,
              userEmail: clubUser.userEmail,
              role: clubUser.role
            });
          }

          // Debug tournamentData mapping
          if (originalProfile?.tournamentData) {
            console.log(
              '🔄 [ClubContext] Mapping player with tournamentData:',
              userId,
              originalProfile.tournamentData
            );
          }

          // Merge data from club profile if available
          const mergedData = {
            // Base data from club-user
            id: userId,
            name: clubUser.mergedData?.name || clubUser.userName || originalProfile?.name || 'Unknown User',
            displayName: clubUser.mergedData?.name || clubUser.userName || originalProfile?.name || 'Unknown User',
            email: clubUser.userEmail || originalProfile?.email,
            phone: clubUser.userPhone || originalProfile?.phone,
            rating: clubUser.mergedData?.rating || clubUser.originalProfileData?.rating || originalProfile?.rating || 1500,
            role: clubUser.role,
            isLinked: clubUser.isLinked || false,
            clubUserId: clubUser.id, // Keep reference to club user document

            // Additional data from original club profile
            category: originalProfile?.category || 'member',
            instructorData: originalProfile?.instructorData || null,
            tournamentData: originalProfile?.tournamentData
              ? {
                  ...originalProfile.tournamentData,
                  // 🔄 SINCRONIZZAZIONE: se currentRanking non esiste, usa rating
                  currentRanking:
                    originalProfile.tournamentData.currentRanking ||
                    originalProfile?.rating ||
                    1500,
                }
              : null,

            // Preserve other profile data
            baseRating: originalProfile?.baseRating || originalProfile?.rating || 1500,
            tags: originalProfile?.tags || [],
            subscriptions: originalProfile?.subscriptions || [],
            wallet: originalProfile?.wallet || { balance: 0, currency: 'EUR' },
            notes: originalProfile?.notes || [],
            bookingHistory: originalProfile?.bookingHistory || [],
            matchHistory: originalProfile?.matchHistory || [],
            medicalCertificates: originalProfile?.medicalCertificates || { current: null, history: [] }, // 🔧 FIX: Include certificati medici
            certificateStatus: originalProfile?.certificateStatus || null, // 🔧 FIX: Include status certificato
            isActive: originalProfile?.isActive !== false, // Default to true if not specified

            // Metadata
            createdAt: originalProfile?.createdAt || clubUser.addedAt,
            updatedAt: originalProfile?.updatedAt || null,
            lastActivity: originalProfile?.lastActivity || null,
          };

          // 🔍 DEBUG: Log final mapped data for player 70xe0dha
          if (userId === '70xe0dha') {
            console.log('🔍 [DEBUG] Player 70xe0dha AFTER mapping:', {
              id: mergedData.id,
              name: mergedData.name,
              hasCertificate: !!mergedData.medicalCertificates,
              certificateData: mergedData.medicalCertificates,
              certificateStatus: mergedData.certificateStatus,
              allKeys: Object.keys(mergedData)
            });
          }

          return mergedData;
        });
      }

      // 🔍 DEBUG: Analizza i profili caricati per trovare quelli problematici
      console.log('🔍 DEBUGGING PLAYERS DATA:');
      playersData.forEach((player, index) => {
        const name = player.name || '';
        const displayName = player.displayName || '';
        const hasValidName = (name.trim() + displayName.trim()).length > 0;

        if (!hasValidName || !name.trim()) {
          console.log(`❌ PROBLEMATIC PLAYER [${index}]:`, {
            id: player.id,
            name: player.name,
            displayName: player.displayName,
            role: player.role,
            hasValidName,
            keys: Object.keys(player),
          });
        }

        // Debug instructor data
        if (player.category === 'instructor' || player.instructorData?.isInstructor) {
          console.log(`🎯 INSTRUCTOR FOUND [${index}]:`, {
            id: player.id,
            name: player.name,
            category: player.category,
            isInstructor: player.instructorData?.isInstructor,
            specialties: player.instructorData?.specialties,
            hourlyRate: player.instructorData?.hourlyRate,
          });
        }
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
            role: player.role
          });
        }
        
        return true;
      });

      console.log('✅ Players loaded with merged profile data:', filteredPlayers.length);
      console.log(
        '🎯 Instructors found:',
        filteredPlayers.filter((p) => p.category === 'instructor' || p.instructorData?.isInstructor)
          .length
      );

      setPlayers(filteredPlayers);
      setPlayersLoaded(true);
      console.log(
        'Players loaded:',
        filteredPlayers.length,
        '(filtered from',
        playersData.length,
        ')'
      );
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

        // 🆕 NUOVA LOGICA: Carica da entrambe le collezioni

        // 1️⃣ Carica dalle nuove partite (collezione matches)
        let newMatches = [];
        try {
          const newMatchesSnapshot = await getDocs(collection(db, 'clubs', clubId, 'matches'));
          newMatches = newMatchesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log('🆕 New matches found:', newMatches.length);
        } catch (error) {
          console.log('⚠️ No new matches collection for club:', clubId);
        }

        // 2️⃣ Carica dalle vecchie bookings (legacy)
        const allBookingsSnapshot = await getDocs(collection(db, 'bookings'));
        const allClubBookings = allBookingsSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((booking) => booking.clubId === clubId);

        console.log('📊 Total bookings for club:', allClubBookings.length);

        // 3️⃣ Combina entrambe le collezioni
        const allMatches = [...newMatches, ...allClubBookings];
        console.log('🔍 Combined matches from both sources:', {
          newMatches: newMatches.length,
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
          // Per le nuove partite (da matches collection) - le accettiamo tutte
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

  // Memoized computed properties
  const playersById = React.useMemo(() => {
    return Object.fromEntries((players || []).map((p) => [p.id, p]));
  }, [players]);

  const loadingStates = {
    players: !playersLoaded,
    matches: !matchesLoaded,
  };

  // Placeholder functions for player management (to be implemented if needed)
  const addPlayer = useCallback(
    async (playerData) => {
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
          // Create new profile in club's profiles collection (legacy system for non-registered users)
          const { db } = await import('@services/firebase.js');
          const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');

          const profileData = {
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
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          const profilesRef = collection(db, 'clubs', clubId, 'profiles');
          const docRef = await addDoc(profilesRef, profileData);

          console.log('✅ [ClubContext] New profile created:', docRef.id);

          // Reload players to get updated list
          setPlayersLoaded(false);
          await loadPlayers();

          return { id: docRef.id, ...profileData };
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
        const { doc, updateDoc, serverTimestamp, getDoc } = await import('firebase/firestore');

        // First, try to find the player in club users (new system)
        const { getClubUsers } = await import('@services/club-users.js');
        const clubUsers = await getClubUsers(clubId);
        const clubUser = clubUsers.find((u) => u.userId === playerId);

        if (clubUser) {
          // Player is in new club users system
          // Update both the club user document and the profile document

          // Update club user document if needed (role, status, etc.)
          if (updates.role || updates.status) {
            const clubUserRef = doc(db, 'clubs', clubId, 'users', clubUser.id);
            const clubUserUpdates = {};

            if (updates.role) clubUserUpdates.role = updates.role;
            if (updates.status) clubUserUpdates.status = updates.status;
            clubUserUpdates.updatedAt = serverTimestamp();

            await updateDoc(clubUserRef, clubUserUpdates);
            console.log('✅ [ClubContext] Updated club user document');
          }

          // Update profile document for other fields (category, instructorData, rating, etc.)
          const profileRef = doc(db, 'clubs', clubId, 'profiles', playerId);
          const profileSnap = await getDoc(profileRef);

          const profileUpdates = {
            updatedAt: serverTimestamp(),
          };

          // Map updates to profile fields
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
            // 🔄 SINCRONIZZAZIONE: rating = currentRanking del campionato
            if (updates.tournamentData.currentRanking) {
              profileUpdates.rating = updates.tournamentData.currentRanking;
              profileUpdates.baseRating = updates.tournamentData.currentRanking;
            }
            console.log('🏆 [ClubContext] tournamentData to save:', updates.tournamentData);
            console.log(
              '🏆 [ClubContext] tournamentData.initialRanking:',
              updates.tournamentData.initialRanking
            );
            console.log(
              '🏆 [ClubContext] tournamentData.currentRanking:',
              updates.tournamentData.currentRanking
            );
            console.log('🔄 [ClubContext] Synced rating:', profileUpdates.rating);
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

          // 🔥 CRITICAL: Remove undefined values before saving to Firestore
          Object.keys(profileUpdates).forEach(key => {
            if (profileUpdates[key] === undefined) {
              delete profileUpdates[key];
            }
          });

          console.log('💾 [ClubContext] Profile updates to save:', profileUpdates);

          if (profileSnap.exists()) {
            // Update existing profile
            await updateDoc(profileRef, profileUpdates);
            console.log('✅ [ClubContext] Updated existing profile');
          } else {
            // Create profile if it doesn't exist
            const { setDoc } = await import('firebase/firestore');
            const newProfile = {
              ...profileUpdates,
              name: updates.name || clubUser.userName,
              displayName: updates.name || clubUser.userName,
              email: updates.email || clubUser.userEmail,
              phone: updates.phone || clubUser.userPhone,
              rating: updates.rating || 1500,
              baseRating: updates.rating || 1500,
              category: updates.category || 'member',
              instructorData: updates.instructorData || null,
              role: updates.role || 'player',
              isActive: true,
              tags: updates.tags || [],
              subscriptions: [],
              wallet: updates.wallet || { balance: 0, currency: 'EUR', transactions: [] },
              notes: updates.notes || [],
              bookingHistory: [],
              matchHistory: [],
              medicalCertificates: updates.medicalCertificates || { current: null, history: [] },
              certificateStatus: updates.certificateStatus || null,
              createdAt: serverTimestamp(),
            };
            await setDoc(profileRef, newProfile);
            console.log('✅ [ClubContext] Created new profile for club user');
          }
        } else {
          // Player is in old profiles system only
          const profileRef = doc(db, 'clubs', clubId, 'profiles', playerId);
          const profileUpdates = {
            ...updates,
            updatedAt: serverTimestamp(),
          };

          // Special handling for name updates
          if (updates.name) {
            profileUpdates.displayName = updates.name;
          }

          // Special handling for rating updates
          if (updates.rating !== undefined) {
            profileUpdates.baseRating = updates.rating;
          }

          // 🔥 CRITICAL: Remove undefined values before saving to Firestore
          Object.keys(profileUpdates).forEach(key => {
            if (profileUpdates[key] === undefined) {
              delete profileUpdates[key];
            }
          });

          await updateDoc(profileRef, profileUpdates);
          console.log('✅ [ClubContext] Updated profile (old system)');
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
    [clubId, loadPlayers]
  );

  const deletePlayer = useCallback(
    async (playerId) => {
      if (!clubId) {
        throw new Error('Club ID not available');
      }

      if (!playerId) {
        throw new Error('Player ID is required');
      }

      try {
        console.log('🗑️ [ClubContext] Deleting player:', playerId);

        // Delete from clubs/{clubId}/users collection
        const userRef = doc(db, 'clubs', clubId, 'users', playerId);
        await deleteDoc(userRef);

        console.log('✅ [ClubContext] Player deleted from club users');

        // Reload players list
        await loadPlayers();

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
  };

  return <ClubContext.Provider value={value}>{children}</ClubContext.Provider>;
}
