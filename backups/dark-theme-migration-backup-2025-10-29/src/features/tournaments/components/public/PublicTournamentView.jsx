/**
 * Public Tournament View - Smartphone/Mobile Display
 * Shows tournament standings and matches grouped by groups with auto-scroll pagination
 * Access: /public/tournament/:clubId/:tournamentId/:token
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@services/firebase.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import TournamentStandings from '../standings/TournamentStandings.jsx';
import TournamentMatches from '../matches/TournamentMatches.jsx';
import { getMatches } from '../../services/matchService.js';
import { getTeamsByTournament } from '../../services/teamsService.js';

function PublicTournamentView() {
  const { clubId, tournamentId, token } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Validate token and load tournament
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'clubs', clubId, 'tournaments', tournamentId),
      (docSnapshot) => {
        if (!docSnapshot.exists()) {
          setError('Torneo non trovato');
          setLoading(false);
          return;
        }

        const data = { id: docSnapshot.id, ...docSnapshot.data() };

        // Validate public view settings
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
        setLoading(false);
      },
      (err) => {
        console.error('Error loading tournament:', err);
        setError('Errore nel caricamento del torneo');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [clubId, tournamentId, token]);

  // Load groups when tournament changes
  const loadGroups = useCallback(async () => {
    if (!tournament) return;

    try {
      const [matches, teams] = await Promise.all([
        getMatches(clubId, tournamentId),
        getTeamsByTournament(clubId, tournamentId),
      ]);

      // Combine groupIds from matches (type === 'group') and teams
      const groupIdsFromMatches = matches
        .filter((m) => m.type === 'group' && m.groupId)
        .map((m) => m.groupId);
      const groupIdsFromTeams = teams.filter((t) => t.groupId).map((t) => t.groupId);

      const uniqueGroups = [...new Set([...groupIdsFromMatches, ...groupIdsFromTeams])].sort(
        (a, b) => a.localeCompare(b)
      );

      setGroups(uniqueGroups);
    } catch (err) {
      console.error('Error loading groups:', err);
    }
  }, [tournament, clubId, tournamentId]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Handle swipe gestures
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setShowSwipeHint(false); // Hide hint after first interaction
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // Minimum distance for a swipe

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe left - next group
        setCurrentGroupIndex((prev) => (prev + 1) % groups.length);
      } else {
        // Swipe right - previous group
        setCurrentGroupIndex((prev) => (prev - 1 + groups.length) % groups.length);
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Auto-hide swipe hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Caricamento torneo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-white mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Accesso Negato</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white text-red-900 rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  const currentGroup = groups[currentGroupIndex];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/play-sport-pro_horizontal.svg"
                alt="Play Sport Pro"
                className="h-8 w-auto"
              />
            </div>

            {/* Tournament name - centered */}
            <div className="flex-1 text-center">
              <h1 className="text-lg font-bold text-white leading-tight">{tournament.name}</h1>
            </div>

            {/* LIVE Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full flex-shrink-0">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white font-bold text-xs">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className="container mx-auto px-4 py-8"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {groups.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/80 text-xl">Nessun girone disponibile</p>
          </div>
        ) : (
          <>
            {/* Title */}
            <div className="flex items-center justify-center mb-6">
              <h2 className="text-3xl font-bold text-white">
                Girone {currentGroup?.toUpperCase()}
              </h2>
            </div>

            {/* Group indicators */}
            <div className="flex justify-center gap-2 mb-8">
              {groups.map((group, index) => (
                <div
                  key={group}
                  className={`h-3 rounded-full transition-all ${
                    index === currentGroupIndex ? 'bg-white w-8' : 'bg-white/30 w-3'
                  }`}
                  aria-label={`Girone ${group.toUpperCase()}`}
                ></div>
              ))}
            </div>

            {/* Swipe hint animation */}
            {showSwipeHint && groups.length > 1 && (
              <motion.div
                className="fixed inset-0 pointer-events-none flex items-center justify-between px-8 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Left chevron */}
                <motion.div
                  animate={{
                    x: [0, -10, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <ChevronLeft className="w-12 h-12 text-white/60" strokeWidth={3} />
                </motion.div>

                {/* Right chevron */}
                <motion.div
                  animate={{
                    x: [0, 10, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <ChevronRight className="w-12 h-12 text-white/60" strokeWidth={3} />
                </motion.div>
              </motion.div>
            )}

            {/* Animated group content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentGroup}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                {/* Standings (top) */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-emerald-500" />
                    Classifica
                  </h3>
                  <TournamentStandings
                    tournament={tournament}
                    clubId={clubId}
                    groupFilter={currentGroup}
                    isPublicView={true}
                  />
                </div>

                {/* Matches (bottom) - 6 per row when possible */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Partite</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <TournamentMatches
                      tournament={tournament}
                      clubId={clubId}
                      groupFilter={currentGroup}
                      isPublicView={true}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="py-6 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-center gap-3">
          <p className="text-gray-400 text-sm">Powered by</p>
          <img src="/play-sport-pro_horizontal.svg" alt="Play Sport Pro" className="h-6 w-auto" />
        </div>
      </div>
    </div>
  );
}

export default PublicTournamentView;
