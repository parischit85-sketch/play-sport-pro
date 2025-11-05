import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '@services/firebase.js';
import { AlertCircle, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceOrientation } from '../../hooks/useDeviceOrientation.js';
import LayoutPortrait from './LayoutPortrait.jsx';
import LayoutLandscape from './LayoutLandscape.jsx';

/**
 * Unified Public Tournament View
 * Single entry point for all device types
 * Auto-detects orientation and renders appropriate layout
 * Manages device rotation with smooth transitions and state persistence
 * 
 * URL: /public/tournament/:clubId/:tournamentId/:token
 */
function UnifiedPublicView() {
  const { clubId, tournamentId, token } = useParams();
  const navigate = useNavigate();
  const deviceInfo = useDeviceOrientation();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState({});
  
  // Rotation state management
  const [lastOrientation, setLastOrientation] = useState(deviceInfo.orientation);
  const [isRotating, setIsRotating] = useState(false);
  const [viewState, setViewState] = useState({
    portraitPageIndex: 0,
    landscapePageIndex: 0,
    isPausedLandscape: false,
  });

  // Load view state from localStorage
  useEffect(() => {
    const storageKey = `tournament-view-state-${clubId}-${tournamentId}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setViewState(prev => ({ ...prev, ...parsed }));
      }
    } catch (err) {
      console.error('[UnifiedPublicView] Error loading view state:', err);
    }
  }, [clubId, tournamentId]);

  // Save view state to localStorage
  const saveViewState = useCallback((newState) => {
    const storageKey = `tournament-view-state-${clubId}-${tournamentId}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(newState));
    } catch (err) {
      console.error('[UnifiedPublicView] Error saving view state:', err);
    }
  }, [clubId, tournamentId]);

  // Handle device rotation with smooth transition
  useEffect(() => {
    if (deviceInfo.orientation !== lastOrientation) {
      setIsRotating(true);
      setLastOrientation(deviceInfo.orientation);

      // Trigger transition animation
      const timer = setTimeout(() => {
        setIsRotating(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [deviceInfo.orientation, lastOrientation]);

  // Validate token and load tournament with subcollections
  useEffect(() => {
    if (!clubId || !tournamentId || !token) {
      setError('URL non valido');
      setLoading(false);
      return;
    }

    const tournamentRef = doc(db, 'clubs', clubId, 'tournaments', tournamentId);
    const matchesRef = collection(db, 'clubs', clubId, 'tournaments', tournamentId, 'matches');
    const teamsRef = collection(db, 'clubs', clubId, 'tournaments', tournamentId, 'teams');

    // Load tournament document
    const unsubscribeTournament = onSnapshot(
      tournamentRef,
      (docSnapshot) => {
        if (!docSnapshot.exists()) {
          setError('Torneo non trovato');
          setLoading(false);
          return;
        }

        const data = { id: docSnapshot.id, ...docSnapshot.data() };

        if (!data.publicView?.enabled) {
          setError('Vista pubblica non abilitata per questo torneo');
          setLoading(false);
          return;
        }

        if (data.publicView?.token !== token) {
          setError('Token non valido');
          setLoading(false);
          return;
        }

        setTournament(data);

        console.log('[UnifiedPublicView] Tournament loaded:', {
          name: data.name,
          orientation: deviceInfo.orientation,
          screenSize: deviceInfo.screenSize,
        });
      },
      (err) => {
        console.error('[UnifiedPublicView] Error loading tournament:', err);
        setError('Errore nel caricamento del torneo');
        setLoading(false);
      }
    );

    // Load matches subcollection
    const unsubscribeMatches = onSnapshot(
      matchesRef,
      (snapshot) => {
        const matchesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('[UnifiedPublicView] Matches loaded:', matchesData.length);
        setTournament(prev => prev ? { ...prev, matches: matchesData } : null);
      },
      (err) => {
        console.error('[UnifiedPublicView] Error loading matches:', err);
      }
    );

    // Load teams subcollection
    const unsubscribeTeams = onSnapshot(
      teamsRef,
      (snapshot) => {
        const teamsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('[UnifiedPublicView] Teams loaded:', teamsData.length);
        setTournament(prev => prev ? { ...prev, teams: teamsData } : null);
        setLoading(false);
      },
      (err) => {
        console.error('[UnifiedPublicView] Error loading teams:', err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeTournament();
      unsubscribeMatches();
      unsubscribeTeams();
    };
  }, [clubId, tournamentId, token]);

  // Load groups from tournament data
  useEffect(() => {
    if (!tournament) return;

    try {
      const groupIds = new Set();
      
      console.log('[UnifiedPublicView] FULL TOURNAMENT STRUCTURE:', {
        keys: Object.keys(tournament),
        matchesExists: !!tournament.matches,
        teamsExists: !!tournament.teams,
        standingsExists: !!tournament.standings,
      });
      console.log('[UnifiedPublicView] TOURNAMENT FIELD NAMES:', Object.keys(tournament));
      
      // Da matches (solo type === 'group')
      if (tournament.matches) {
        console.log('[UnifiedPublicView] Tournament.matches count:', tournament.matches.length);
        console.log('[UnifiedPublicView] Sample matches:', tournament.matches.slice(0, 5).map(m => ({
          type: m.type,
          groupId: m.groupId,
          id: m.id,
        })));
        tournament.matches.forEach(match => {
          if (match.type === 'group' && match.groupId) groupIds.add(match.groupId);
        });
      }

      // Da teams
      if (tournament.teams) {
        console.log('[UnifiedPublicView] Tournament.teams count:', tournament.teams.length);
        console.log('[UnifiedPublicView] Sample teams:', tournament.teams.slice(0, 5).map(t => ({
          name: t.name,
          groupId: t.groupId,
        })));
        tournament.teams.forEach(team => {
          if (team.groupId) groupIds.add(team.groupId);
        });
      }

      // Da standings (if exists)
      if (tournament.standings) {
        console.log('[UnifiedPublicView] Tournament.standings count:', tournament.standings.length);
        tournament.standings.forEach(s => {
          if (s.groupId) groupIds.add(s.groupId);
        });
      }

      const sortedGroups = Array.from(groupIds).sort();
      console.log('[UnifiedPublicView] Extracted groups:', sortedGroups);
      setGroups(sortedGroups);
    } catch (err) {
      console.error('[UnifiedPublicView] Error loading groups:', err);
    }
  }, [tournament]);

  // Update portrait page index and persist state
  const handlePortraitPageChange = useCallback((newIndex) => {
    setViewState(prev => {
      const updated = { ...prev, portraitPageIndex: newIndex };
      saveViewState(updated);
      return updated;
    });
  }, [saveViewState]);

  // Update landscape page index and persist state
  const handleLandscapePageChange = useCallback((newIndex, isPaused) => {
    setViewState(prev => {
      const updated = {
        ...prev,
        landscapePageIndex: newIndex,
        ...(isPaused !== undefined && { isPausedLandscape: isPaused })
      };
      saveViewState(updated);
      return updated;
    });
  }, [saveViewState]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Caricamento torneo...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-white mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Accesso Negato</h2>
          <p className="text-white/80 mb-6">{error || 'Errore sconosciuto'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-white text-red-900 rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  // Render appropriate layout based on orientation with smooth transition
  const renderLayout = () => {
    if (deviceInfo.isPortrait) {
      return (
        <motion.div
          key="portrait"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          <LayoutPortrait
            tournament={tournament}
            clubId={clubId}
            groups={groups}
            deviceInfo={deviceInfo}
            initialPageIndex={viewState.portraitPageIndex}
            onPageChange={handlePortraitPageChange}
          />
        </motion.div>
      );
    } else {
      return (
        <motion.div
          key="landscape"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          <LayoutLandscape
            tournament={tournament}
            clubId={clubId}
            groups={groups}
            deviceInfo={deviceInfo}
            initialPageIndex={viewState.landscapePageIndex}
            initialPauseState={viewState.isPausedLandscape}
            onPageChange={handleLandscapePageChange}
          />
        </motion.div>
      );
    }
  };

  return (
    <div className={`
      w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
      ${deviceInfo.isPortrait ? 'portrait-layout' : 'landscape-layout'}
      ${deviceInfo.isMobile ? 'mobile' : ''}
      ${deviceInfo.isTablet ? 'tablet' : ''}
      ${deviceInfo.isDesktop ? 'desktop' : ''}
      ${deviceInfo.isTV ? 'tv' : ''}
      transition-all duration-300 ${isRotating ? 'opacity-50' : 'opacity-100'}
    `}>
      <AnimatePresence mode="wait">
        {renderLayout()}
      </AnimatePresence>
    </div>
  );
}

export default UnifiedPublicView;
