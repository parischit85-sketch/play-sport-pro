/**
 * Public Tournament View - TV Display
 * Optimized for large screens with bold colors, large fonts, and QR code page
 * Access: /public/tournament-tv/:clubId/:tournamentId/:token
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@services/firebase.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, AlertCircle, Medal, Maximize, Minimize } from 'lucide-react';
import QRCode from 'react-qr-code';
import { getMatches } from '../../services/matchService.js';
import { getTeamsByTournament } from '../../services/teamsService.js';
import { calculateGroupStandings } from '../../services/standingsService.js';

function PublicTournamentViewTV() {
  const { clubId, tournamentId, token } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [groupData, setGroupData] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  const intervalRef = useRef(null);
  const progressIntervalRef = useRef(null);

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

        const groupMatches = matches.filter(
          (m) => m.type === 'group' && m.groupId === groupId
        );

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

  // Create pages: groups + QR page
  const pages = [
    ...groups.map((g) => ({ type: 'group', groupId: g })),
    { type: 'qr' }, // QR page
  ];

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard navigation for arrow keys
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (pages.length === 0) return;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        // Next page
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
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        // Previous page
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pages.length, tournament]);

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
          <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-emerald-500 mx-auto mb-6"></div>
          <p className="text-white text-3xl font-bold">Caricamento torneo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 max-w-2xl w-full text-center">
          <AlertCircle className="w-24 h-24 text-white mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-4">Accesso Negato</h2>
          <p className="text-white/80 text-xl mb-8">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-white text-red-900 rounded-xl font-bold text-xl hover:bg-white/90 transition-colors"
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
        return <Medal className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Medal className="w-8 h-8 text-orange-600" />;
      default:
        return <span className="text-2xl text-gray-400">#{rank}</span>;
    }
  };

  const renderGroupPage = (groupId) => {
    const data = groupData[groupId];
    if (!data) return null;

    const { standings, matches, teams } = data;

    return (
      <div className="space-y-6">
        {/* Standings */}
        <div>
          <h3 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
            <Trophy className="w-10 h-10" />
            Classifica - Girone {groupId.toUpperCase()}
          </h3>
          <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="text-center py-3 px-4 text-white font-bold text-2xl">#</th>
                  <th className="text-left py-3 px-4 text-white font-bold text-2xl">Squadra</th>
                  <th className="text-center py-3 px-3 text-white font-bold text-2xl">G</th>
                  <th className="text-center py-3 px-3 text-white font-bold text-2xl">V</th>
                  <th className="text-center py-3 px-3 text-white font-bold text-2xl">P</th>
                  <th className="text-center py-3 px-3 text-white font-bold text-2xl">DG</th>
                  <th className="text-center py-3 px-4 text-white font-bold text-2xl">Pts</th>
                  <th className="text-center py-3 px-4 text-white font-bold text-2xl">RPA</th>
                </tr>
              </thead>
              <tbody>
                {standings
                  .sort((a, b) => {
                    if (a.points !== b.points) return b.points - a.points;
                    const dgA = a.matchesWon - a.matchesLost;
                    const dgB = b.matchesWon - b.matchesLost;
                    if (dgA !== dgB) return dgB - dgA;
                    return (b.rpaPoints || 0) - (a.rpaPoints || 0);
                  })
                  .map((standing, index) => {
                    const rank = index + 1;
                    const dg = standing.matchesWon - standing.matchesLost;
                    const rpa = standing.rpaPoints || 0;

                    return (
                      <tr
                        key={standing.teamId}
                        className="border-b border-gray-700 bg-gray-800"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center">{getRankIcon(rank)}</div>
                        </td>
                        <td className="py-3 px-4 text-3xl font-semibold text-white">
                          {standing.teamName}
                        </td>
                        <td className="py-3 px-3 text-center text-2xl text-gray-300">
                          {standing.matchesPlayed}
                        </td>
                        <td className="py-3 px-3 text-center text-2xl font-bold text-green-400">
                          {standing.matchesWon}
                        </td>
                        <td className="py-3 px-3 text-center text-2xl font-bold text-red-400">
                          {standing.matchesLost}
                        </td>
                        <td className="py-3 px-3 text-center text-2xl font-bold">
                          <span
                            className={
                              dg > 0
                                ? 'text-green-400'
                                : dg < 0
                                  ? 'text-red-400'
                                  : 'text-gray-400'
                            }
                          >
                            {dg > 0 ? '+' : ''}
                            {dg}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-3xl font-bold text-emerald-400">
                          {standing.points}
                        </td>
                        <td className="py-3 px-4 text-center text-2xl font-bold">
                          <span
                            className={
                              rpa > 0 ? 'text-green-400' : rpa < 0 ? 'text-red-400' : 'text-gray-400'
                            }
                          >
                            {rpa > 0 ? '+' : ''}
                            {Math.round(rpa * 10) / 10}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Matches - 6 per row */}
        <div>
          <h3 className="text-4xl font-bold text-white mb-4">Partite</h3>
          <div className="grid grid-cols-6 gap-3">
            {matches.map((match) => {
              const team1 = teams[match.team1Id];
              const team2 = teams[match.team2Id];

              if (!team1 || !team2) return null;

              const team1Name = team1?.teamName || team1?.name || '—';
              const team2Name = team2?.teamName || team2?.name || '—';
              const isCompleted = match.status === 'completed';

              // Split team names to get individual players (assuming format "Player1 / Player2")
              const team1Players = team1Name.split('/').map((p) => p.trim());
              const team2Players = team2Name.split('/').map((p) => p.trim());

              const hasSets = Array.isArray(match.sets) && match.sets.length > 0;

              const renderSetPills = (teamIndex) => {
                if (!hasSets) return null;
                return (
                  <div className="flex items-center gap-1 mt-1">
                    {match.sets.map((s, i) => {
                      const a = Number(s?.team1 ?? 0);
                      const b = Number(s?.team2 ?? 0);
                      const val = teamIndex === 1 ? a : b;
                      const win = teamIndex === 1 ? a > b : b > a;
                      return (
                        <span
                          key={`set-${match.id}-${teamIndex}-${i}`}
                          className={`text-4xl font-bold ${
                            win
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}
                          title={`Set ${i + 1}`}
                        >
                          {val}
                        </span>
                      );
                    })}
                  </div>
                );
              };

              return (
                <div
                  key={match.id}
                  className="bg-gray-800 rounded-xl p-5 shadow-lg min-h-[180px] flex flex-col justify-center border-[3px] border-fuchsia-500"
                >
                  {/* Team 1 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      {team1Players.map((player, idx) => (
                        <div
                          key={idx}
                          className={`font-medium text-2xl ${isCompleted && match.winnerId === team1.id ? 'text-emerald-400' : isCompleted ? 'text-red-400' : 'text-white'}`}
                        >
                          {player}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col items-end ml-4">
                      {isCompleted && (
                        <>
                          {hasSets ? (
                            renderSetPills(1)
                          ) : (
                            match.score && (
                              <span
                                className={`text-5xl font-bold ${match.winnerId === team1.id ? 'text-emerald-400' : 'text-red-400'}`}
                              >
                                {match.score.team1}
                              </span>
                            )
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* VS Divider */}
                  <div className="relative flex items-center my-4">
                    <div className="flex-grow border-t-2 border-fuchsia-500"></div>
                    <span className="px-3 text-sm font-bold text-fuchsia-500">VS</span>
                    <div className="flex-grow border-t-2 border-fuchsia-500"></div>
                  </div>

                  {/* Team 2 */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex-1">
                      {team2Players.map((player, idx) => (
                        <div
                          key={idx}
                          className={`font-medium text-2xl ${isCompleted && match.winnerId === team2.id ? 'text-emerald-400' : isCompleted ? 'text-red-400' : 'text-white'}`}
                        >
                          {player}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col items-end ml-4">
                      {isCompleted && (
                        <>
                          {hasSets ? (
                            renderSetPills(2)
                          ) : (
                            match.score && (
                              <span
                                className={`text-5xl font-bold ${match.winnerId === team2.id ? 'text-emerald-400' : 'text-red-400'}`}
                              >
                                {match.score.team2}
                              </span>
                            )
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  {!isCompleted && (
                    <div className="mt-2 text-center">
                      <span className="text-xs text-gray-400 uppercase">In programma</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderQRPage = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/play-sport-pro_horizontal.svg" 
            alt="Play Sport Pro" 
            className="h-24 w-auto"
          />
        </div>

        {/* Tournament name */}
        <p className="text-3xl text-gray-300 mb-12">{tournament.name}</p>

        {/* QR Code */}
        <div className="bg-white rounded-3xl p-12 shadow-2xl">
          <QRCode value={publicUrlMobile} size={320} />
        </div>

        {/* Instructions */}
        <p className="text-3xl text-gray-300 font-semibold mt-12">
          Scansiona per aprire sul tuo smartphone
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header - NO QR CODE */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center">
              <img 
                src="/play-sport-pro_horizontal.svg" 
                alt="Play Sport Pro" 
                className="h-16 w-auto"
              />
            </div>

            {/* Center: Tournament name */}
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold text-white">{tournament.name}</h1>
            </div>

            {/* Right side: LIVE Badge + Fullscreen button */}
            <div className="flex items-center gap-4">
              {/* LIVE Badge */}
              <div className="flex items-center gap-4 px-6 py-3 bg-red-500 rounded-full shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="text-white font-bold text-2xl">LIVE</span>
              </div>

              {/* Fullscreen button */}
              <button
                onClick={toggleFullscreen}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                title={isFullscreen ? 'Esci da schermo intero' : 'Schermo intero'}
              >
                {isFullscreen ? (
                  <Minimize className="w-6 h-6 text-white" />
                ) : (
                  <Maximize className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-800">
        <div
          className="h-full bg-emerald-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6 flex-1">
        {pages.length === 0 ? (
          <div className="text-center py-32">
            <Trophy className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <p className="text-gray-400 text-3xl">Nessun contenuto disponibile</p>
          </div>
        ) : (
          <>
            {/* Page indicators */}
            <div className="flex justify-center gap-3 mb-6">
              {pages.map((page, index) => (
                <div
                  key={index}
                  className={`h-4 rounded-full transition-all ${
                    index === currentPageIndex
                      ? 'bg-emerald-500 w-12'
                      : 'bg-gray-700 w-4'
                  }`}
                ></div>
              ))}
            </div>

            {/* Animated page content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPageIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                {currentPage?.type === 'group'
                  ? renderGroupPage(currentPage.groupId)
                  : renderQRPage()}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="py-6 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-center gap-3">
          <p className="text-gray-400 text-lg">Powered by</p>
          <img 
            src="/play-sport-pro_horizontal.svg" 
            alt="Play Sport Pro" 
            className="h-8 w-auto"
          />
        </div>
      </div>
    </div>
  );
}

export default PublicTournamentViewTV;
