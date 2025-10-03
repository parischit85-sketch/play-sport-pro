import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@services/firebase.js';
import { doc, getDoc, collection, addDoc, updateDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';

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
    timestamp: new Date().toISOString()
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
      const courtsData = snapshot.docs.map(doc => ({
        firebaseId: doc.id,
        id: doc.data().id || doc.id,
        ...doc.data()
      })).filter(court => {
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
          updateDoc(courtRef, { order: newOrder }).catch(error => {
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

  const deleteCourt = useCallback(async (courtId) => {
    if (!clubId || !courtId) {
      throw new Error('Club ID and Court ID required');
    }

    console.log('Deleting court:', courtId);
    
    const court = courts.find(c => c.id === courtId);
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
  }, [clubId, courts]);

  const addCourt = useCallback(async (courtData) => {
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
  }, [clubId]);

  const updateCourt = useCallback(async (courtId, updates) => {
    if (!clubId || !courtId) throw new Error('Club ID and Court ID required');
    
    const court = courts.find(c => c.id === courtId);
    const firebaseDocId = court?.firebaseId || courtId;
    
    try {
      const courtRef = doc(db, 'clubs', clubId, 'courts', firebaseDocId);
      await updateDoc(courtRef, updates);
      console.log('Court updated:', courtId);
    } catch (error) {
      console.error('Error updating court:', error);
      throw error;
    }
  }, [clubId, courts]);

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
      
      if (clubUsers.length === 0) {
        setPlayers([]);
        setPlayersLoaded(true);
        console.log('No players found for club');
        return;
      }
      
      // 🆕 NEW: Load original club profiles to get additional data (category, instructorData, etc.)
      let clubProfiles = new Map();
      try {
        const profilesSnapshot = await getDocs(collection(db, 'clubs', clubId, 'profiles'));
        profilesSnapshot.docs.forEach(doc => {
          clubProfiles.set(doc.id, doc.data());
        });
        console.log('✅ Loaded club profiles:', profilesSnapshot.docs.length);
      } catch (error) {
        console.log('⚠️ Could not load club profiles, continuing without additional data');
      }
      
      // Transform club users to player format with merged profile data
      const playersData = clubUsers.map(clubUser => {
        const userId = clubUser.userId;
        const originalProfile = clubProfiles.get(userId);
        
        // Merge data from club profile if available
        const mergedData = {
          // Base data from club-user
          id: userId,
          name: clubUser.mergedData?.name || clubUser.userName,
          displayName: clubUser.mergedData?.name || clubUser.userName,
          email: clubUser.userEmail,
          phone: clubUser.userPhone,
          rating: clubUser.mergedData?.rating || clubUser.originalProfileData?.rating || 1500,
          role: clubUser.role,
          isLinked: clubUser.isLinked || false,
          clubUserId: clubUser.id, // Keep reference to club user document
          
          // Additional data from original club profile
          category: originalProfile?.category || 'member',
          instructorData: originalProfile?.instructorData || null,
          
          // Preserve other profile data
          baseRating: originalProfile?.baseRating || originalProfile?.rating || 1500,
          tags: originalProfile?.tags || [],
          subscriptions: originalProfile?.subscriptions || [],
          wallet: originalProfile?.wallet || { balance: 0, currency: 'EUR' },
          notes: originalProfile?.notes || [],
          bookingHistory: originalProfile?.bookingHistory || [],
          matchHistory: originalProfile?.matchHistory || [],
          isActive: originalProfile?.isActive !== false, // Default to true if not specified
          
          // Metadata
          createdAt: originalProfile?.createdAt || clubUser.addedAt,
          updatedAt: originalProfile?.updatedAt || null,
          lastActivity: originalProfile?.lastActivity || null,
        };
        
        return mergedData;
      });
      
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
            keys: Object.keys(player)
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
            hourlyRate: player.instructorData?.hourlyRate
          });
        }
      });
      
      // 🧹 FILTRO FINALE: Rimuovi profili con name undefined o vuoto
      const filteredPlayers = playersData.filter(player => {
        // Deve avere un name valido (non undefined, non vuoto)
        const hasValidName = player.name && player.name.trim().length > 0;
        if (!hasValidName) {
          console.log('🚫 FILTERING OUT PLAYER:', player.id, 'name:', player.name);
          return false;
        }
        return true;
      });
      
      console.log('✅ Players loaded with merged profile data:', filteredPlayers.length);
      console.log('🎯 Instructors found:', filteredPlayers.filter(p => p.category === 'instructor' || p.instructorData?.isInstructor).length);
      
      setPlayers(filteredPlayers);
      setPlayersLoaded(true);
      console.log('Players loaded:', filteredPlayers.length, '(filtered from', playersData.length, ')');
    } catch (error) {
      console.error('Error loading players:', error);
      setPlayersLoaded(true);
    }
  }, [clubId, playersLoaded]);

  const loadMatches = useCallback(async (forceReload = false) => {
    if (!clubId || (matchesLoaded && !forceReload)) return;
    
    try {
      console.log('Loading matches for club:', clubId);
      
      // 🆕 NUOVA LOGICA: Carica da entrambe le collezioni
      
      // 1️⃣ Carica dalle nuove partite (collezione matches)
      let newMatches = [];
      try {
        const newMatchesSnapshot = await getDocs(collection(db, 'clubs', clubId, 'matches'));
        newMatches = newMatchesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('🆕 New matches found:', newMatches.length);
      } catch (error) {
        console.log('⚠️ No new matches collection for club:', clubId);
      }
      
      // 2️⃣ Carica dalle vecchie bookings (legacy)
      const allBookingsSnapshot = await getDocs(collection(db, 'bookings'));
      const allClubBookings = allBookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(booking => booking.clubId === clubId);
      
      console.log('📊 Total bookings for club:', allClubBookings.length);
      
      // 3️⃣ Combina entrambe le collezioni
      const allMatches = [...newMatches, ...allClubBookings];
      console.log('🔍 Combined matches from both sources:', { 
        newMatches: newMatches.length, 
        legacyBookings: allClubBookings.length, 
        total: allMatches.length 
      });
      
      if (allClubBookings.length > 0) {
        const sample = allClubBookings[0];
        console.log('📋 Sample booking keys:', Object.keys(sample));
        console.log('📋 Sample booking:', { 
          id: sample.id, 
          status: sample.status, 
          hasResult: !!sample.result,
          hasSets: !!sample.sets,
          setsLength: sample.sets?.length 
        });
        
        // Analizza tutti gli status
        const statusCounts = {};
        const bookingsWithResults = [];
        allClubBookings.forEach(booking => {
          statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
          if (booking.result || booking.sets?.length > 0 || booking.score) {
            bookingsWithResults.push({
              id: booking.id,
              status: booking.status,
              hasResult: !!booking.result,
              hasSets: !!booking.sets,
              hasScore: !!booking.score,
              players: booking.players?.length || 0
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
      const rawMatches = allMatches.filter(match => {
        // Per le nuove partite (da matches collection) - le accettiamo tutte
        if (match.teamA && match.teamB && match.sets) {
          return true;
        }
        
        // Per le vecchie bookings - SOLO se sono vere partite completate
        // Escludiamo le prenotazioni di campo (type: 'court')
        if (match.type === 'court' && !match.result && !match.sets?.length && !match.score) {
          return false; // Esclude prenotazioni di campo senza risultati
        }
        
        return match.status === 'completed' || 
               match.result || 
               match.sets?.length > 0 || 
               match.score;
      });
      
      console.log('🎯 Raw matches found:', rawMatches.length);
      if (rawMatches.length > 0) {
        console.log('📋 Sample raw match:', {
          id: rawMatches[0].id,
          players: rawMatches[0].players,
          participants: rawMatches[0].participants,
          teamA: rawMatches[0].teamA,
          teamB: rawMatches[0].teamB
        });
      }
      
      // Trasforma le bookings in partite con teamA/teamB
      const matchesData = rawMatches.map(match => {
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
            teamB: [players[2], players[3]]  // Ultimi 2 giocatori = Team B
          };
        } else if (match.players && match.players.length === 2) {
          // Singolo (2 giocatori)
          return {
            ...match,
            teamA: [match.players[0]], 
            teamB: [match.players[1]]
          };
        }
        
        // Se non ha players o struttura valida, salta
        console.warn('⚠️ Match without valid players structure:', match.id);
        return null;
      }).filter(Boolean);
      
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
  }, [clubId, matchesLoaded]);

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

  const selectClub = useCallback((newClubId) => {
    console.log('🏢 [ClubContext] selectClub called:', {
      newClubId,
      currentClubId: clubId,
      timestamp: new Date().toISOString()
    });
    
    if (!newClubId) {
      console.log('⚠️ [ClubContext] No clubId provided, navigating to /');
      navigate('/');
      return;
    }
    
    console.log('✅ [ClubContext] Navigating to club:', `/club/${newClubId}`);
    navigate(`/club/${newClubId}`);
  }, [navigate, clubId]);

  const exitClub = useCallback(() => {
    console.log('🚪 [ClubContext] exitClub called:', {
      currentClubId: clubId,
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ [ClubContext] Navigating to /dashboard');
    navigate('/dashboard');
  }, [navigate, clubId]);

  const hasClub = Boolean(clubId);

  // Memoized computed properties
  const playersById = React.useMemo(() => {
    return Object.fromEntries((players || []).map(p => [p.id, p]));
  }, [players]);

  const loadingStates = {
    players: !playersLoaded,
    matches: !matchesLoaded
  };

  // Placeholder functions for player management (to be implemented if needed)
  const addPlayer = useCallback(async (playerData) => {
    // TODO: Implement player addition
    console.warn('addPlayer not implemented yet');
  }, []);

  const updatePlayer = useCallback(async (playerId, updates) => {
    // TODO: Implement player update
    console.warn('updatePlayer not implemented yet');
  }, []);

  const deletePlayer = useCallback(async (playerId) => {
    // TODO: Implement player deletion
    console.warn('deletePlayer not implemented yet');
  }, []);

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
  };

  return (
    <ClubContext.Provider value={value}>
      {children}
    </ClubContext.Provider>
  );
}
