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
import { Trophy, AlertCircle, ChevronLeft, ChevronRight, Medal } from 'lucide-react';
import TournamentStandings from '../standings/TournamentStandings.jsx';
import TournamentMatches from '../matches/TournamentMatches.jsx';
import TournamentBracket from '../knockout/TournamentBracket.jsx';
import { getMatches } from '../../services/matchService.js';
import { getTeamsByTournament } from '../../services/teamsService.js';
import { calculateGroupStandings } from '../../services/standingsService.js';
import QRCode from 'react-qr-code';

function PublicTournamentView() {
  const { clubId, tournamentId, token } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auto-redirect TV devices to TV view
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isTVDevice =
      userAgent.includes('tv') ||
      userAgent.includes('googletv') ||
      userAgent.includes('androidtv') ||
      userAgent.includes('smarttv') ||
      userAgent.includes('appletv') ||
      userAgent.includes('hbbtv') ||
      userAgent.includes('roku') ||
      userAgent.includes('viera') ||
      userAgent.includes('opera tv') ||
      userAgent.includes('netcast') ||
      userAgent.includes('philips') ||
      userAgent.includes('web0s');

    if (isTVDevice) {
      console.log('🖥️ TV device detected, redirecting to TV view...');
      navigate(`/public/tournament-tv/${clubId}/${tournamentId}/${token}`, { replace: true });
    }
  }, [clubId, tournamentId, token, navigate]);
  const [groups, setGroups] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [groupData, setGroupData] = useState({});
  const [progress, setProgress] = useState(0);

  const intervalRef = useRef(null);
  const progressIntervalRef = useRef(null);

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

  // Load groups and data when tournament changes
  const loadGroupsAndData = useCallback(async () => {
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

      // Load standings and matches for each group
      const data = {};
      for (const groupId of uniqueGroups) {
        const standings = await calculateGroupStandings(
          clubId,
          tournamentId,
          groupId,
          tournament.pointsSystem || { win: 3, draw: 1, loss: 0 }
        );

        const groupMatches = matches.filter((m) => m.type === 'group' && m.groupId === groupId);

        // Map team data
        const teamsMap = {};
        teams.forEach((t) => {
          teamsMap[t.id] = t;
        });

        data[groupId] = {
          standings,
          matches: groupMatches,
          teams: teamsMap,
        };
      }

      setGroupData(data);
    } catch (err) {
      console.error('Error loading groups:', err);
    }
  }, [tournament, clubId, tournamentId]);

  useEffect(() => {
    loadGroupsAndData();
  }, [loadGroupsAndData]);

  // Create pages based on display settings
  const pages = [];

  // Add group pages if enabled in settings
  const displaySettings = tournament?.publicView?.settings?.displaySettings || {};
  if (displaySettings.groupsMatches !== false) {
    // Default to true if not set
    pages.push(...groups.map((g) => ({ type: 'group', groupId: g })));
  }

  // Add overall standings page if enabled
  if (displaySettings.standings === true) {
    pages.push({ type: 'overall-standings' });
  }

  // Add points page if enabled
  if (displaySettings.points === true) {
    pages.push({ type: 'points' });
  }

  // Always add QR page at the end
  pages.push({ type: 'qr' });

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
        // Swipe left - next page
        setCurrentPageIndex((prev) => (prev + 1) % pages.length);
        setProgress(0);
        // Reset auto-scroll timer
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        const interval = tournament?.publicView?.settings?.interval || 15000;
        progressIntervalRef.current = setInterval(() => {
          setProgress((prev) => {
            const increment = (100 / interval) * 100;
            if (prev >= 100) return 0;
            return prev + increment;
          });
        }, 100);
        intervalRef.current = setInterval(() => {
          setCurrentPageIndex((prev) => (prev + 1) % pages.length);
          setProgress(0);
        }, interval);
      } else {
        // Swipe right - previous page
        setCurrentPageIndex((prev) => (prev - 1 + pages.length) % pages.length);
        setProgress(0);
        // Reset auto-scroll timer
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        const interval = tournament?.publicView?.settings?.interval || 15000;
        progressIntervalRef.current = setInterval(() => {
          setProgress((prev) => {
            const increment = (100 / interval) * 100;
            if (prev >= 100) return 0;
            return prev + increment;
          });
        }, 100);
        intervalRef.current = setInterval(() => {
          setCurrentPageIndex((prev) => (prev + 1) % pages.length);
          setProgress(0);
        }, interval);
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

  // Auto-scroll logic
  useEffect(() => {
    if (pages.length === 0) return;

    const interval = tournament?.publicView?.settings?.interval || 15000; // Default 15s

    // Progress bar update (every 100ms)
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const increment = (100 / interval) * 100;
        if (prev >= 100) return 0;
        return prev + increment;
      });
    }, 100);

    // Auto-scroll to next page
    intervalRef.current = setInterval(() => {
      setCurrentPageIndex((prev) => (prev + 1) % pages.length);
      setProgress(0);
    }, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [pages.length, tournament]);

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

  const currentPage = pages[currentPageIndex];
  const publicUrlMobile = `${window.location.origin}/public/tournament/${clubId}/${tournamentId}/${token}`;

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Medal className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="text-lg text-gray-400">#{rank}</span>;
    }
  };

  const renderGroupPage = (groupId) => {
    const data = groupData[groupId];
    if (!data) return null;

    return (
      <div className="space-y-6">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Girone {groupId.toUpperCase()}</h2>
        </div>

        {/* Standings */}
        <div>
          <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-500" />
            Classifica
          </h3>
          <TournamentStandings
            tournament={tournament}
            clubId={clubId}
            groupFilter={groupId}
            isPublicView={true}
          />
        </div>

        {/* Matches */}
        <div>
          <h3 className="text-xl font-bold text-white mb-3">Partite</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <TournamentMatches
              tournament={tournament}
              clubId={clubId}
              groupFilter={groupId}
              isPublicView={true}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderBracketPage = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Tabellone Finale</h2>
        </div>
        <TournamentBracket
          tournament={tournament}
          clubId={clubId}
          isPublicView={true}
          isTVView={false}
        />
      </div>
    );
  };

  const renderPointsPage = () => {
    // Create points ranking based on overall performance
    const pointsRanking = [];
    const teamsMap = {};

    // Collect all teams and their data
    Object.values(groupData).forEach((group) => {
      if (group.teams) {
        Object.assign(teamsMap, group.teams);
      }
    });

    // Calculate points for each team across all groups
    Object.values(groupData).forEach((group) => {
      if (group.standings) {
        group.standings.forEach((standing) => {
          const existingTeam = pointsRanking.find((p) => p.teamId === standing.teamId);
          if (existingTeam) {
            existingTeam.totalPoints += standing.points || 0;
            existingTeam.totalRPA = Math.max(existingTeam.totalRPA, standing.rpaPoints || 0);
            existingTeam.groups.push({
              groupId: Object.keys(groupData).find((key) => groupData[key] === group),
              points: standing.points || 0,
              rpa: standing.rpaPoints || 0,
            });
          } else {
            pointsRanking.push({
              teamId: standing.teamId,
              teamName: standing.teamName,
              totalPoints: standing.points || 0,
              totalRPA: standing.rpaPoints || 0,
              groups: [
                {
                  groupId: Object.keys(groupData).find((key) => groupData[key] === group),
                  points: standing.points || 0,
                  rpa: standing.rpaPoints || 0,
                },
              ],
            });
          }
        });
      }
    });

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Classifica Punti - {tournament.name}</h2>
        </div>

        {/* Points Ranking */}
        <div>
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="text-center py-2 px-2 text-white font-bold text-sm">#</th>
                  <th className="text-left py-2 px-2 text-white font-bold text-sm">Squadra</th>
                  <th className="text-center py-2 px-2 text-white font-bold text-sm">Punti</th>
                  <th className="text-center py-2 px-2 text-white font-bold text-sm">RPA</th>
                </tr>
              </thead>
              <tbody>
                {pointsRanking
                  .sort((a, b) => {
                    if (a.totalPoints !== b.totalPoints) return b.totalPoints - a.totalPoints;
                    return b.totalRPA - a.totalRPA;
                  })
                  .map((team, index) => {
                    const rank = index + 1;

                    return (
                      <tr key={team.teamId} className="border-b border-gray-700 bg-gray-800">
                        <td className="py-2 px-2">
                          <div className="flex items-center justify-center">
                            {getRankIcon(rank)}
                          </div>
                        </td>
                        <td className="py-2 px-2 text-lg font-semibold text-white">
                          {team.teamName}
                        </td>
                        <td className="py-2 px-2 text-center text-lg font-bold text-emerald-400">
                          {team.totalPoints}
                        </td>
                        <td className="py-2 px-2 text-center text-sm font-bold text-blue-400">
                          {Math.round(team.totalRPA * 10) / 10}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderQRPage = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">{tournament.name}</h2>
          <p className="text-emerald-400 font-semibold">Segui il torneo in tempo reale</p>
          <p className="text-gray-300 text-sm">Scansiona il QR Code</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <QRCode value={publicUrlMobile} size={200} />
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-xs">Powered by Play Sport Pro</p>
        </div>
      </div>
    );
  };

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

      {/* Progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-emerald-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Main content */}
      <div
        className="container mx-auto px-4 py-8"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {pages.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/80 text-xl">Nessun contenuto disponibile</p>
          </div>
        ) : (
          <>
            {/* Page indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {pages.map((page, index) => (
                <div
                  key={index}
                  className={`h-3 rounded-full transition-all ${
                    index === currentPageIndex ? 'bg-emerald-500 w-8' : 'bg-white/30 w-3'
                  }`}
                ></div>
              ))}
            </div>

            {/* Swipe hint animation */}
            {showSwipeHint && pages.length > 1 && (
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

            {/* Animated page content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPageIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                {currentPage?.type === 'group'
                  ? renderGroupPage(currentPage.groupId)
                  : currentPage?.type === 'overall-standings'
                    ? renderBracketPage()
                    : currentPage?.type === 'points'
                      ? renderPointsPage()
                      : renderQRPage()}
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
