/**
 * Public Tournament View - TV Display
 * Optimized for large screens with bold colors, large fonts, and QR code page
 * Access: /public/tournament-tv/:clubId/:tournamentId/:token
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '@services/firebase.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, AlertCircle, Medal, Maximize, Minimize } from 'lucide-react';
import QRCode from 'react-qr-code';
import { getTeamsByTournament } from '../../services/teamsService.js';
import { calculateGroupStandings } from '../../services/standingsService.js';
import TournamentBracket from '../knockout/TournamentBracket.jsx';

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
  const [currentTime, setCurrentTime] = useState(new Date());

  const intervalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const matchesScrollRef = useRef(null);
  const matchesScrollIntervalRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const isPausedRef = useRef(false);

  // State for real-time matches
  const [matches, setMatches] = useState([]);

  // Funzione per ottenere il nome personalizzato del girone
  const getGroupDisplayName = (groupId) => {
    return tournament?.groupNames?.[groupId] || `Girone ${groupId.toUpperCase()}`;
  };

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

  // Real-time listener for matches
  useEffect(() => {
    if (!clubId || !tournamentId) return;

    const matchesRef = collection(db, 'clubs', clubId, 'tournaments', tournamentId, 'matches');

    const unsubscribe = onSnapshot(
      matchesRef,
      (snapshot) => {
        const matchesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMatches(matchesData);
      },
      (err) => {
        console.error('Error loading matches:', err);
      }
    );

    return () => unsubscribe();
  }, [clubId, tournamentId]);

  // Load groups and data when tournament or matches changes
  const loadGroupsAndData = useCallback(async () => {
    if (!tournament || matches.length === 0) return;

    try {
      const teams = await getTeamsByTournament(clubId, tournamentId);

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
  }, [tournament, matches, clubId, tournamentId]);

  useEffect(() => {
    loadGroupsAndData();
  }, [loadGroupsAndData]);

  // Update current time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // Create pages based on display settings (memoized to avoid re-creation)
  const pages = useMemo(() => {
    const pagesArray = [];

    // Add group pages if enabled in settings
    const displaySettings = tournament?.publicView?.settings?.displaySettings || {};
    if (displaySettings.groupsMatches !== false) {
      // Default to true if not set
      pagesArray.push(...groups.map((g) => ({ type: 'group', groupId: g })));
    }

    // Add overall standings page if enabled
    if (displaySettings.standings === true) {
      pagesArray.push({ type: 'standings' });
    }

    // Add points page if enabled
    if (displaySettings.points === true) {
      pagesArray.push({ type: 'points' });
    }

    // Always add QR page at the end
    pagesArray.push({ type: 'qr' });

    return pagesArray;
  }, [groups, tournament]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
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
        const nextIndex = (currentPageIndex + 1) % pages.length;
        setCurrentPageIndex(nextIndex);
        setProgress(0);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        // Previous page
        const prevIndex = (currentPageIndex - 1 + pages.length) % pages.length;
        setCurrentPageIndex(prevIndex);
        setProgress(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pages.length, currentPageIndex]);

  // Auto-scroll logic con intervalli separati per pagina
  useEffect(() => {
    if (pages.length === 0) return;

    // Intervalli per tipo di pagina (in secondi)
    const pageIntervals = tournament?.publicView?.settings?.pageIntervals || {
      groups: 15,
      standings: 15,
      points: 15,
      qr: 15,
    };

    // Determina l'intervallo per la pagina corrente
    const currentPage = pages[currentPageIndex];
    let currentInterval = 15000; // Default fallback

    if (currentPage?.type === 'group') {
      currentInterval = (pageIntervals.groups || 15) * 1000;
    } else if (currentPage?.type === 'standings') {
      currentInterval = (pageIntervals.standings || 15) * 1000;
    } else if (currentPage?.type === 'points') {
      currentInterval = (pageIntervals.points || 15) * 1000;
    } else if (currentPage?.type === 'qr') {
      currentInterval = (pageIntervals.qr || 15) * 1000;
    }

    console.log(
      `⏱️ Page ${currentPageIndex} (${currentPage?.type}): interval = ${currentInterval}ms`
    );

    // Progress bar update (every 100ms)
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const increment = (100 / currentInterval) * 100;
        if (prev >= 100) return 0;
        return prev + increment;
      });
    }, 100);

    // Auto-scroll to next page dopo l'intervallo specifico
    intervalRef.current = setInterval(() => {
      setCurrentPageIndex((prev) => (prev + 1) % pages.length);
      setProgress(0);
    }, currentInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [pages, currentPageIndex, tournament]);

  // Auto-scroll orizzontale INFINITO per le partite (carosello continuo senza reset)
  useEffect(() => {
    // Reset refs when page changes
    scrollPositionRef.current = 0;
    isPausedRef.current = false;

    // Clear any existing scroll interval
    if (matchesScrollIntervalRef.current) {
      clearInterval(matchesScrollIntervalRef.current);
      matchesScrollIntervalRef.current = null;
      console.log('🧹 Cleared previous scroll interval');
    }

    // Attendi che il DOM si aggiorni e poi inizia lo scroll
    const startDelay = setTimeout(() => {
      if (!matchesScrollRef.current) {
        console.log('⚠️ matchesScrollRef still not available after delay, page:', currentPageIndex);
        return;
      }

      const container = matchesScrollRef.current;

      // Forza un piccolo ritardo aggiuntivo per permettere al browser di renderizzare
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const scrollWidth = container.scrollWidth;
          const containerWidth = container.clientWidth;
          const isOverflowing = scrollWidth > containerWidth;

          console.log('📏 Scroll check:', {
            scrollWidth,
            containerWidth,
            isOverflowing,
            page: currentPageIndex,
          });

          if (isOverflowing) {
            const scrollStep = 3; // pixel per step
            const scrollDelay = 55; // ms tra gli step

            console.log('🎬 Starting INFINITE horizontal scroll for matches (no reset)', {
              scrollWidth,
              containerWidth,
              scrollStep,
              scrollDelay,
              page: currentPageIndex,
            });

            matchesScrollIntervalRef.current = setInterval(() => {
              if (isPausedRef.current || !container) return;

              scrollPositionRef.current += scrollStep;
              container.scrollLeft = scrollPositionRef.current;

              // Nessun reset - scroll infinito continuo grazie al contenuto duplicato
            }, scrollDelay);

            console.log('✅ Infinite scroll interval created:', matchesScrollIntervalRef.current);
          } else {
            // Reset scroll to start if content doesn't overflow
            console.log('ℹ️ Content does not overflow, no scroll needed');
            container.scrollLeft = 0;
          }
        });
      });
    }, 1600); // Ritardo aumentato a 1.6 secondi per dare più tempo al DOM

    return () => {
      console.log('🧹 Cleanup: page', currentPageIndex);
      clearTimeout(startDelay);
      if (matchesScrollIntervalRef.current) {
        clearInterval(matchesScrollIntervalRef.current);
        matchesScrollIntervalRef.current = null;
      }
    };
  }, [currentPageIndex, groupData]);

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
      <div className="space-y-4">
        {/* Standings */}
        <div>
          <h3 className="text-3xl font-bold text-white mb-3 flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            Classifica - {getGroupDisplayName(groupId)}
          </h3>
          <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="text-center py-2 px-3 text-white font-bold text-xl">#</th>
                  <th className="text-left py-2 px-3 text-white font-bold text-xl">Squadra</th>
                  <th className="text-center py-2 px-2 text-white font-bold text-xl">G</th>
                  <th className="text-center py-2 px-2 text-white font-bold text-xl">V</th>
                  <th className="text-center py-2 px-2 text-white font-bold text-xl">P</th>
                  <th className="text-center py-2 px-2 text-white font-bold text-xl">DG</th>
                  <th className="text-center py-2 px-3 text-white font-bold text-xl">Pts</th>
                  <th className="text-center py-2 px-3 text-white font-bold text-xl">RPA</th>
                </tr>
              </thead>
              <tbody>
                {standings
                  .sort((a, b) => {
                    if (a.points !== b.points) return b.points - a.points;
                    const dgA = a.gamesDifference || 0;
                    const dgB = b.gamesDifference || 0;
                    if (dgA !== dgB) return dgB - dgA;
                    return (b.rpaPoints || 0) - (a.rpaPoints || 0);
                  })
                  .map((standing, index) => {
                    const rank = index + 1;
                    const dg = standing.gamesDifference || 0;
                    const rpa = standing.rpaPoints || 0;

                    return (
                      <tr key={standing.teamId} className="border-b border-gray-700 bg-gray-800">
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-center">
                            {getRankIcon(rank)}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-2xl font-semibold text-white">
                          {standing.teamName}
                        </td>
                        <td className="py-2 px-2 text-center text-xl text-gray-300">
                          {standing.matchesPlayed}
                        </td>
                        <td className="py-2 px-2 text-center text-xl font-bold text-green-400">
                          {standing.matchesWon}
                        </td>
                        <td className="py-2 px-2 text-center text-xl font-bold text-red-400">
                          {standing.matchesLost}
                        </td>
                        <td className="py-2 px-2 text-center text-xl font-bold">
                          <span
                            className={
                              dg > 0 ? 'text-green-400' : dg < 0 ? 'text-red-400' : 'text-gray-400'
                            }
                          >
                            {dg > 0 ? '+' : ''}
                            {dg}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center text-2xl font-bold text-emerald-400">
                          {standing.points}
                        </td>
                        <td className="py-2 px-3 text-center text-xl font-bold">
                          <span
                            className={
                              rpa > 0
                                ? 'text-green-400'
                                : rpa < 0
                                  ? 'text-red-400'
                                  : 'text-gray-400'
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

        {/* Matches - Scroll orizzontale INFINITO (carosello continuo) */}
        <div>
          <h3 className="text-3xl font-bold text-white mb-3">Partite</h3>
          <div
            ref={matchesScrollRef}
            className="flex gap-4 overflow-x-scroll hide-scrollbar pb-2"
            style={{
              scrollBehavior: 'auto', // Auto per il reset seamless
            }}
          >
            {/* PRIMO SET: Partite originali */}
            {matches.map((match) => {
              const team1 = teams[match.team1Id];
              const team2 = teams[match.team2Id];

              if (!team1 || !team2) return null;

              const team1Name = team1?.teamName || team1?.name || '—';
              const team2Name = team2?.teamName || team2?.name || '—';
              const isCompleted = match.status === 'completed';
              const isInProgress = match.status === 'in_progress';

              // Split team names to get individual players (assuming format "Player1 / Player2")
              const team1Players = team1Name.split('/').map((p) => p.trim());
              const team2Players = team2Name.split('/').map((p) => p.trim());

              const hasSets = Array.isArray(match.sets) && match.sets.length > 0;

              const renderSetPills = (teamIndex) => {
                if (!hasSets) return null;
                return (
                  <div className="flex items-center gap-1 mt-0.5">
                    {match.sets.map((s, i) => {
                      const a = Number(s?.team1 ?? 0);
                      const b = Number(s?.team2 ?? 0);
                      const val = teamIndex === 1 ? a : b;
                      const win = teamIndex === 1 ? a > b : b > a;
                      return (
                        <span
                          key={`set-${match.id}-${teamIndex}-${i}`}
                          className={`text-3xl font-bold ${
                            win ? 'text-emerald-400' : 'text-red-400'
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
                  className={`bg-gray-800 rounded-xl p-3 shadow-lg min-h-[126px] min-w-[180px] flex-shrink-0 flex flex-col justify-center border-[2.5px] ${
                    isCompleted
                      ? 'border-fuchsia-500'
                      : isInProgress
                        ? 'border-red-500'
                        : 'border-fuchsia-700/60'
                  }`}
                >
                  {/* Status Badge - Only for IN PROGRESS */}
                  {isInProgress && (
                    <div className="mb-2 flex justify-center">
                      <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse">
                        IN CORSO
                      </span>
                    </div>
                  )}

                  {/* Team 1 */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      {team1Players.map((player, idx) => (
                        <div
                          key={idx}
                          className={`font-medium text-lg ${isCompleted && match.winnerId === team1.id ? 'text-emerald-400' : isCompleted ? 'text-red-400' : 'text-white'}`}
                        >
                          {player}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col items-end ml-3">
                      {isCompleted && (
                        <>
                          {hasSets
                            ? renderSetPills(1)
                            : match.score && (
                                <span
                                  className={`text-4xl font-bold ${match.winnerId === team1.id ? 'text-emerald-400' : 'text-red-400'}`}
                                >
                                  {match.score.team1}
                                </span>
                              )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* VS Divider */}
                  <div className="relative flex items-center my-2">
                    <div
                      className={`flex-grow border-t-2 ${isCompleted ? 'border-fuchsia-500' : 'border-fuchsia-700/60'}`}
                    ></div>
                    <span
                      className={`px-2 text-xs font-bold ${isCompleted ? 'text-fuchsia-500' : 'text-fuchsia-700/80'}`}
                    >
                      VS
                    </span>
                    <div
                      className={`flex-grow border-t-2 ${isCompleted ? 'border-fuchsia-500' : 'border-fuchsia-700/60'}`}
                    ></div>
                  </div>

                  {/* Team 2 */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex-1">
                      {team2Players.map((player, idx) => (
                        <div
                          key={idx}
                          className={`font-medium text-lg ${isCompleted && match.winnerId === team2.id ? 'text-emerald-400' : isCompleted ? 'text-red-400' : 'text-white'}`}
                        >
                          {player}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col items-end ml-3">
                      {isCompleted && (
                        <>
                          {hasSets
                            ? renderSetPills(2)
                            : match.score && (
                                <span
                                  className={`text-4xl font-bold ${match.winnerId === team2.id ? 'text-emerald-400' : 'text-red-400'}`}
                                >
                                  {match.score.team2}
                                </span>
                              )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  {!isCompleted && !isInProgress && (
                    <div className="mt-2 text-center">
                      <span className="text-xs text-amber-500 font-semibold uppercase">
                        In programma
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* SECONDO SET: Partite duplicate per carosello infinito seamless */}
            {matches.length > 0 &&
              matches.map((match) => {
                const team1 = teams[match.team1Id];
                const team2 = teams[match.team2Id];

                if (!team1 || !team2) return null;

                const team1Name = team1?.teamName || team1?.name || '—';
                const team2Name = team2?.teamName || team2?.name || '—';
                const isCompleted = match.status === 'completed';
                const isInProgress = match.status === 'in_progress';

                // Split team names to get individual players (assuming format "Player1 / Player2")
                const team1Players = team1Name.split('/').map((p) => p.trim());
                const team2Players = team2Name.split('/').map((p) => p.trim());

                const hasSets = Array.isArray(match.sets) && match.sets.length > 0;

                const renderSetPills = (teamIndex) => {
                  if (!hasSets) return null;
                  return (
                    <div className="flex items-center gap-1 mt-0.5">
                      {match.sets.map((s, i) => {
                        const a = Number(s?.team1 ?? 0);
                        const b = Number(s?.team2 ?? 0);
                        const val = teamIndex === 1 ? a : b;
                        const win = teamIndex === 1 ? a > b : b > a;
                        return (
                          <span
                            key={`set-clone-${match.id}-${teamIndex}-${i}`}
                            className={`text-3xl font-bold ${
                              win ? 'text-emerald-400' : 'text-red-400'
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
                    key={`clone-${match.id}`}
                    className={`bg-gray-800 rounded-xl p-3 shadow-lg min-h-[126px] min-w-[180px] flex-shrink-0 flex flex-col justify-center border-[2.5px] ${
                      isCompleted
                        ? 'border-fuchsia-500'
                        : isInProgress
                          ? 'border-red-500'
                          : 'border-fuchsia-700/60'
                    }`}
                  >
                    {/* Status Badge - Only for IN PROGRESS */}
                    {isInProgress && (
                      <div className="mb-2 flex justify-center">
                        <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse">
                          IN CORSO
                        </span>
                      </div>
                    )}

                    {/* Team 1 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        {team1Players.map((player, idx) => (
                          <div
                            key={idx}
                            className={`font-medium text-lg ${isCompleted && match.winnerId === team1.id ? 'text-emerald-400' : isCompleted ? 'text-red-400' : 'text-white'}`}
                          >
                            {player}
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col items-end ml-3">
                        {isCompleted && (
                          <>
                            {hasSets
                              ? renderSetPills(1)
                              : match.score && (
                                  <span
                                    className={`text-4xl font-bold ${match.winnerId === team1.id ? 'text-emerald-400' : 'text-red-400'}`}
                                  >
                                    {match.score.team1}
                                  </span>
                                )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* VS Divider */}
                    <div className="relative flex items-center my-2">
                      <div
                        className={`flex-grow border-t-2 ${isCompleted ? 'border-fuchsia-500' : 'border-fuchsia-700/60'}`}
                      ></div>
                      <span
                        className={`px-2 text-xs font-bold ${isCompleted ? 'text-fuchsia-500' : 'text-fuchsia-700/80'}`}
                      >
                        VS
                      </span>
                      <div
                        className={`flex-grow border-t-2 ${isCompleted ? 'border-fuchsia-500' : 'border-fuchsia-700/60'}`}
                      ></div>
                    </div>

                    {/* Team 2 */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex-1">
                        {team2Players.map((player, idx) => (
                          <div
                            key={idx}
                            className={`font-medium text-lg ${isCompleted && match.winnerId === team2.id ? 'text-emerald-400' : isCompleted ? 'text-red-400' : 'text-white'}`}
                          >
                            {player}
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col items-end ml-3">
                        {isCompleted && (
                          <>
                            {hasSets
                              ? renderSetPills(2)
                              : match.score && (
                                  <span
                                    className={`text-4xl font-bold ${match.winnerId === team2.id ? 'text-emerald-400' : 'text-red-400'}`}
                                  >
                                    {match.score.team2}
                                  </span>
                                )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    {!isCompleted && !isInProgress && (
                      <div className="mt-2 text-center">
                        <span className="text-xs text-amber-500 font-semibold uppercase">
                          In programma
                        </span>
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

  const renderBracketPage = () => {
    return (
      <div className="space-y-4">
        <TournamentBracket
          tournament={tournament}
          clubId={clubId}
          isPublicView={true}
          isTVView={true}
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
      <div className="space-y-4">
        {/* Points Ranking */}
        <div>
          <h3 className="text-3xl font-bold text-white mb-3 flex items-center gap-3">
            <Medal className="w-8 h-8" />
            Classifica Punti - {tournament.name}
          </h3>
          <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="text-center py-2 px-3 text-white font-bold text-xl">#</th>
                  <th className="text-left py-2 px-3 text-white font-bold text-xl">Squadra</th>
                  <th className="text-center py-2 px-3 text-white font-bold text-xl">
                    Punti Totali
                  </th>
                  <th className="text-center py-2 px-3 text-white font-bold text-xl">
                    RPA Migliore
                  </th>
                  <th className="text-center py-2 px-3 text-white font-bold text-xl">Gironi</th>
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
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-center">
                            {getRankIcon(rank)}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-2xl font-semibold text-white">
                          {team.teamName}
                        </td>
                        <td className="py-2 px-3 text-center text-2xl font-bold text-emerald-400">
                          {team.totalPoints}
                        </td>
                        <td className="py-2 px-3 text-center text-xl font-bold text-blue-400">
                          {Math.round(team.totalRPA * 10) / 10}
                        </td>
                        <td className="py-2 px-3 text-center text-lg text-gray-300">
                          {team.groups
                            .map((g) => `${g.groupId.toUpperCase()}: ${g.points}`)
                            .join(', ')}
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
      <div className="flex items-center justify-center h-full py-4">
        <div className="flex items-center gap-12 max-w-6xl mx-auto">
          {/* Left side: Info */}
          <div className="flex-1 text-center">
            {/* Logo */}
            <div className="mb-6">
              <img
                src="/play-sport-pro_horizontal.svg"
                alt="Play Sport Pro"
                className="h-24 w-auto mx-auto"
              />
            </div>

            {/* Tournament name */}
            <h2 className="text-4xl font-bold text-white mb-6">{tournament.name}</h2>

            {/* Instructions */}
            <div className="space-y-4">
              <p className="text-3xl text-emerald-400 font-bold">Segui il torneo in tempo reale</p>
              <p className="text-2xl text-gray-300">Scansiona il QR Code con il tuo smartphone</p>
            </div>
          </div>

          {/* Right side: QR Code */}
          <div className="flex-shrink-0">
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <QRCode value={publicUrlMobile} size={300} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="min-h-screen bg-gray-900 flex flex-col">
        {/* Header - NO QR CODE - Ottimizzato per 16:9 */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              {/* Left: Logo */}
              <div className="flex items-center">
                <img
                  src="/play-sport-pro_horizontal.svg"
                  alt="Play Sport Pro"
                  className="h-12 w-auto"
                />
              </div>

              {/* Center: Tournament name */}
              <div className="flex-1 text-center">
                <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
              </div>

              {/* Right side: LIVE Badge + Fullscreen button */}
              <div className="flex items-center gap-3">
                {/* LIVE Badge */}
                <div className="flex items-center gap-3 px-4 py-2 bg-red-500 rounded-full shadow-lg animate-pulse">
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  <span className="text-white font-bold text-xl">
                    {currentTime.toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}{' '}
                    LIVE
                  </span>
                </div>

                {/* Fullscreen button */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                  title={isFullscreen ? 'Esci da schermo intero' : 'Schermo intero'}
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5 text-white" />
                  ) : (
                    <Maximize className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-800">
          <div
            className="h-full bg-emerald-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Main content - Padding ridotto per 16:9 */}
        <div className="container mx-auto px-4 py-3 flex-1 overflow-hidden relative">
          <div className="h-full">
            {pages.length === 0 ? (
              <div className="text-center py-32">
                <Trophy className="w-24 h-24 text-gray-600 mx-auto mb-6" />
                <p className="text-gray-400 text-3xl">Nessun contenuto disponibile</p>
              </div>
            ) : (
              <>
                {/* Page indicators - Più compatti */}
                <div className="flex justify-center gap-2 mb-3">
                  {pages.map((page, index) => (
                    <div
                      key={index}
                      className={`h-3 rounded-full transition-all ${
                        index === currentPageIndex ? 'bg-emerald-500 w-10' : 'bg-gray-700 w-3'
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
        </div>

        {/* Footer - Più compatto */}
        <div className="py-3 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center justify-center gap-2">
            <p className="text-gray-400 text-sm">Powered by</p>
            <img src="/play-sport-pro_horizontal.svg" alt="Play Sport Pro" className="h-6 w-auto" />
          </div>
        </div>
      </div>
    </>
  );
}

export default PublicTournamentViewTV;
