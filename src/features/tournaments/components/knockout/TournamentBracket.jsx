/**
 * Tournament Bracket - Display knockout bracket tree
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Trophy, Crown, Medal, ChevronRight, ChevronDown } from 'lucide-react';
import { useAuth, USER_ROLES } from '../../../../contexts/AuthContext';
import { themeTokens } from '../../../../lib/theme';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../services/firebase';
import { getTeamsByTournament } from '../../services/teamsService';
import MatchResultModal from '../matches/MatchResultModal';
import { recordMatchResult } from '../../services/matchService';
import {
  MATCH_STATUS,
  KNOCKOUT_ROUND,
  KNOCKOUT_ROUND_NAMES,
} from '../../utils/tournamentConstants';

function TournamentBracket({ tournament, clubId, isPublicView = false, isTVView = false }) {
  const { userRole, userClubRoles } = useAuth();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [collapsedByRound, setCollapsedByRound] = useState({});
  const roundRefs = useRef({});

  // Dynamic bracket card heights for TV view
  const [dynamicBracketHeights, setDynamicBracketHeights] = useState({
    first: 60,
    subsequent: [75, 75, 75],
  });

  // ✅ FIX: Check club-specific admin role, not global userRole
  const clubRole = userClubRoles?.[clubId];
  const isAdminClubRole = clubRole === 'admin' || clubRole === 'club_admin';
  const isClubAdmin = userRole === USER_ROLES.SUPER_ADMIN || isAdminClubRole;
  const canEditResults = isClubAdmin;

  // Load teams once
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teamsData = await getTeamsByTournament(clubId, tournament.id);
        const teamsMap = {};
        teamsData.forEach((team) => {
          teamsMap[team.id] = team;
        });
        setTeams(teamsMap);
      } catch (error) {
        console.error('Error loading teams:', error);
      }
    };
    loadTeams();
  }, [clubId, tournament.id]);

  // Real-time listener for matches
  useEffect(() => {
    setLoading(true);
    const matchesQuery = query(
      collection(db, `clubs/${clubId}/tournaments/${tournament.id}/matches`),
      where('type', '==', 'knockout')
    );

    const unsubscribe = onSnapshot(
      matchesQuery,
      (snapshot) => {
        const matchesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMatches(matchesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading matches:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [clubId, tournament.id]);

  // NOTE: Round grouping and ordering must be defined before any effect uses them to avoid TDZ errors

  const toggleRound = (roundName) => {
    setCollapsedByRound((prev) => ({ ...prev, [roundName]: !prev[roundName] }));
  };

  const scrollToRound = (roundName) => {
    const el = roundRefs.current[roundName];
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
    // ensure expanded on mobile
    setCollapsedByRound((prev) => ({ ...prev, [roundName]: false }));
  };

  const handleRecordResult = async (matchId, score, bestOf, sets) => {
    try {
      const result = await recordMatchResult(clubId, tournament.id, {
        matchId,
        score,
        bestOf,
        sets,
        completedAt: new Date(),
      });

      if (result.success) {
        setSelectedMatch(null);
        // Real-time listener will update automatically
      } else {
        alert(result.error || 'Errore nel salvataggio del risultato');
      }
    } catch (error) {
      console.error('Error recording result:', error);
      alert('Errore nel salvataggio del risultato');
    }
  };

  // Helper: map persisted round code/name to display label
  const toDisplayRound = (match) => {
    // Prefer explicit roundName if present
    if (match.roundName && typeof match.roundName === 'string') return match.roundName;
    // Map round code from enum to localized label
    if (match.round && KNOCKOUT_ROUND_NAMES[match.round]) {
      return KNOCKOUT_ROUND_NAMES[match.round];
    }
    return 'Sconosciuto';
  };

  // Group matches by display round label
  const rounds = useMemo(
    () =>
      matches.reduce((acc, match) => {
        const key = toDisplayRound(match);
        if (!acc[key]) acc[key] = [];
        acc[key].push(match);
        return acc;
      }, {}),
    [matches]
  );

  // Define canonical round order using constants, then keep only those present
  const canonicalOrder = useMemo(
    () => [
      KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.ROUND_OF_16],
      KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.QUARTER_FINALS],
      KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.SEMI_FINALS],
      KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS],
      KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.THIRD_PLACE],
    ],
    []
  );
  const orderedRounds = useMemo(
    () =>
      canonicalOrder.filter(
        (label) =>
          rounds[label] &&
          rounds[label].length > 0 &&
          (!isTVView || label !== KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.THIRD_PLACE])
      ),
    [canonicalOrder, rounds, isTVView]
  );

  // Initialize mobile-friendly collapsed state: expand the first round with matches to play
  useEffect(() => {
    if (!matches || matches.length === 0) return;
    const nextRound = orderedRounds.find((roundName) =>
      (rounds[roundName] || []).some((m) => m.status !== MATCH_STATUS.COMPLETED)
    );
    const initial = {};
    orderedRounds.forEach((r) => {
      initial[r] = r !== (nextRound || orderedRounds[0]);
    });
    setCollapsedByRound(initial);
  }, [matches, orderedRounds, rounds]);

  // Calculate dynamic bracket card heights for TV view full-screen display
  useEffect(() => {
    if (!isTVView || orderedRounds.length === 0) return;

    const screenHeight = window.innerHeight;
    const headerHeight = 80; // Top header
    const footerHeight = 0; // No footer in TV view
    const roundHeaderHeight = 45; // Round title height
    const padding = 40; // Top/bottom padding

    const availableHeight =
      screenHeight - headerHeight - footerHeight - roundHeaderHeight - padding;

    // Detect starting round to determine number of matches in first round
    const firstRoundName = orderedRounds[0];
    const firstRoundMatches = rounds[firstRoundName]?.length || 0;

    let firstRoundHeight = 60;
    let subsequentHeights = [75, 75, 75];

    // Case 1: Starts from Ottavi (8 matches in first round)
    // Case 2: Starts from Quarti (4 matches in first round)
    // Case 3: Starts from Semi (2 matches in first round)

    if (firstRoundMatches === 2) {
      // Starts from Semi → Finale
      // 2 matches in Semi, need to fit on screen
      const gapMultiplier = 1.6; // Gap between semi cards
      const totalGapSpace = availableHeight * 0.15; // 15% for gaps
      const cardSpace = availableHeight - totalGapSpace;

      firstRoundHeight = Math.max(90, Math.min(150, cardSpace / (2 * gapMultiplier)));
      subsequentHeights = [Math.max(100, firstRoundHeight * 1.1)]; // Finale slightly bigger

      console.log('📐 TV Bracket Heights (Semi → Finale):', {
        firstRoundHeight,
        subsequentHeights,
        availableHeight,
      });
    } else if (firstRoundMatches === 4) {
      // Starts from Quarti → Semi → Finale
      // 4 matches in Quarti, need to fit on screen
      const gapMultiplier = 1.4; // Gap between quarti cards
      const totalGapSpace = availableHeight * 0.2; // 20% for gaps
      const cardSpace = availableHeight - totalGapSpace;

      firstRoundHeight = Math.max(80, Math.min(120, cardSpace / (4 * gapMultiplier)));
      subsequentHeights = [
        Math.max(80, firstRoundHeight * 1.0), // Semi same size
        Math.max(90, firstRoundHeight * 1.1), // Finale slightly bigger
      ];

      console.log('📐 TV Bracket Heights (Quarti → Semi → Finale):', {
        firstRoundHeight,
        subsequentHeights,
        availableHeight,
      });
    } else if (firstRoundMatches === 8) {
      // Starts from Ottavi → Quarti → Semi → Finale
      // 8 matches in Ottavi, need to fit on screen
      const totalGapSpace = availableHeight * 0.1; // 10% for gaps
      const cardSpace = availableHeight - totalGapSpace;

      firstRoundHeight = Math.max(60, Math.min(90, cardSpace / 8));
      subsequentHeights = [
        Math.max(75, firstRoundHeight * 1.25), // Quarti
        Math.max(75, firstRoundHeight * 1.25), // Semi
        Math.max(75, firstRoundHeight * 1.25), // Finale
      ];

      console.log('📐 TV Bracket Heights (Ottavi → Quarti → Semi → Finale):', {
        firstRoundHeight,
        subsequentHeights,
        availableHeight,
      });
    }

    setDynamicBracketHeights({ first: firstRoundHeight, subsequent: subsequentHeights });
  }, [isTVView, orderedRounds, rounds]);

  // Icone colorate per round
  const getRoundIcon = (roundName) => {
    if (roundName === KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.ROUND_OF_16]) {
      return <Medal className="w-5 h-5 text-yellow-900" />; // marrone
    }
    if (roundName === KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.QUARTER_FINALS]) {
      return <Medal className="w-5 h-5 text-orange-500" />; // bronzo
    }
    if (roundName === KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.SEMI_FINALS]) {
      return <Medal className="w-5 h-5 text-gray-300" />; // argento
    }
    if (roundName === KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS]) {
      return <Trophy className="w-5 h-5 text-yellow-400" />; // dorato
    }
    return null;
  };

  const renderMatch = (match, roundIndex = 0) => {
    const isFinale = toDisplayRound(match) === KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS];
    const team1 = teams[match.team1Id];
    const team2 = teams[match.team2Id];
    const isCompleted = match.status === MATCH_STATUS.COMPLETED;
    // Consenti modifica anche a match completati (il transaction layer protegge i casi invalidi)
    // Solo admin possono modificare i risultati
    const canRecordResult = !!(team1 && team2 && canEditResults);

    // TBD teams (not yet determined from previous round), BYE (admin selected), or Qualif. (auto-qualified)
    const team1Name = team1?.teamName || match.team1Name || 'TBD';
    const team2Name = team2?.teamName || match.team2Name || 'TBD';

    // Check for live score (in progress matches)
    const isInProgress = match.status === MATCH_STATUS.IN_PROGRESS;
    const isLive = isInProgress && match.liveScore;
    const setsToShow = isLive ? match.liveScore.sets : match.sets;
    const hasSets = Array.isArray(setsToShow) && setsToShow.length > 0;

    // Check if this match has a BYE
    const hasBye = team1Name === 'BYE' || team2Name === 'BYE';

    // TV View: Ultra compact match card with sets display
    if (isTVView) {
      // Rilevo da quale round parte il tabellone
      const firstRoundName = orderedRounds[0];
      const firstRoundIsQuarters =
        firstRoundName === KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.QUARTER_FINALS];
      const firstRoundIsSemi = firstRoundName === KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.SEMI_FINALS];

      // Determino font size in base al caso
      let playerFontSize = 'text-[20px]';
      let pillTextSize = 'text-[20px]';
      let pillPadding = 'px-1.5 py-1';

      if (firstRoundIsSemi) {
        // Caso 3: parte da Semi
        // Semi: 24px, Finale: 28px
        playerFontSize = roundIndex === 0 ? 'text-[24px]' : 'text-[28px]';
        pillTextSize = roundIndex === 0 ? 'text-[24px]' : 'text-[28px]';
        pillPadding = 'px-2 py-1';
      } else if (firstRoundIsQuarters) {
        // Caso 2: parte da Quarti
        // Quarti: 22px, Semi: 22px, Finale: 24px
        if (roundIndex === 0 || roundIndex === 1) {
          playerFontSize = 'text-[22px]';
          pillTextSize = 'text-[22px]';
        } else {
          playerFontSize = 'text-[24px]';
          pillTextSize = 'text-[24px]';
        }
        pillPadding = 'px-1.5 py-1';
      } else {
        // Caso 1: parte da Ottavi (default)
        // Ottavi: 13px, Quarti/Semi/Finale: 20px
        const isAdvancedRound = roundIndex >= 1;
        playerFontSize = isAdvancedRound ? 'text-[20px]' : 'text-[13px]';
        pillTextSize = isAdvancedRound ? 'text-[20px]' : 'text-[14px]';
        pillPadding = isAdvancedRound ? 'px-1.5 py-1' : 'px-1 py-0.5';
      }

      const renderTVSetPills = (teamIndex) => {
        if (!hasSets) return null;
        const isWinner =
          (teamIndex === 1 && match.winnerId === team1?.id) ||
          (teamIndex === 2 && match.winnerId === team2?.id);

        return (
          <div className="flex items-center gap-1 ml-2">
            {setsToShow.map((s, i) => {
              const a = Number(s?.team1 ?? 0);
              const b = Number(s?.team2 ?? 0);
              const val = teamIndex === 1 ? a : b;
              const win = teamIndex === 1 ? a > b : b > a;
              return (
                <span
                  key={`tv-pill-${match.id}-${teamIndex}-${i}`}
                  className={`${pillPadding} rounded-md ${pillTextSize} leading-3 font-bold border transition-all ${
                    isLive
                      ? 'bg-orange-900/40 text-orange-300 border-orange-600/50 animate-pulse shadow-sm shadow-orange-500/20'
                      : win
                        ? isWinner
                          ? 'bg-emerald-900/40 text-emerald-200 border-emerald-600/50 shadow-sm shadow-emerald-500/20'
                          : 'bg-red-900/40 text-red-300 border-red-600/50 shadow-sm shadow-red-500/20'
                        : isWinner
                          ? 'bg-gray-700/60 text-emerald-300 border-gray-600/50'
                          : 'bg-gray-700/60 text-red-400 border-gray-600/50'
                  }`}
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
          className={`w-full rounded-lg shadow-lg border-2 backdrop-blur-sm bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 relative ${
            isFinale && isCompleted
              ? 'border-amber-500/70 shadow-2xl shadow-amber-500/40'
              : 'border-gray-600/50'
          }`}
          style={{
            margin: 0,
            padding: '0px',
            overflow: 'visible',
          }}
        >
          {/* Keyframes CSS injection for zoom animation */}
          {isFinale && isCompleted && (
            <style>
              {`
                @keyframes championZoom {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.15); }
                }
              `}
            </style>
          )}
          {/* Confetti/Sparkles effect for finale winner */}
          {isFinale && isCompleted && (
            <>
              {/* Animated glow rings */}
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 rounded-lg blur-xl animate-champion-glow pointer-events-none" />
              <div
                className="absolute -inset-1 bg-gradient-to-r from-amber-400/30 via-yellow-400/30 to-amber-400/30 rounded-lg blur-lg animate-champion-glow pointer-events-none"
                style={{ animationDelay: '0.5s' }}
              />

              {/* Sparkle particles */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping pointer-events-none" />
              <div
                className="absolute -top-2 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-ping pointer-events-none"
                style={{ animationDelay: '0.3s' }}
              />
              <div
                className="absolute -bottom-1 -left-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping pointer-events-none"
                style={{ animationDelay: '0.6s' }}
              />
              <div
                className="absolute -bottom-2 right-1/3 w-2 h-2 bg-amber-400 rounded-full animate-ping pointer-events-none"
                style={{ animationDelay: '0.9s' }}
              />
              <div
                className="absolute top-1/2 -right-2 w-2 h-2 bg-yellow-200 rounded-full animate-ping pointer-events-none"
                style={{ animationDelay: '0.4s' }}
              />
              <div
                className="absolute top-1/3 -left-2 w-2 h-2 bg-amber-300 rounded-full animate-ping pointer-events-none"
                style={{ animationDelay: '0.7s' }}
              />
            </>
          )}

          {/* Team 1 */}
          <div
            className={`flex items-center justify-between px-3 py-1 ${playerFontSize} transition-all duration-300 relative z-10 ${
              isCompleted && match.winnerId === team1?.id
                ? isFinale
                  ? 'bg-gradient-to-r from-amber-900/50 via-yellow-800/40 to-amber-900/50 border-b-2 border-amber-400/70 shadow-amber-500/30 shadow-inner'
                  : 'bg-gradient-to-r from-emerald-900/40 via-emerald-800/30 to-emerald-900/40 border-b-2 border-emerald-500/50 shadow-emerald-500/20 shadow-inner animate-pulse'
                : 'bg-gradient-to-r from-gray-800/60 via-gray-700/60 to-gray-800/60 border-b border-gray-600/30'
            }`}
            style={{
              animation:
                isFinale && isCompleted && match.winnerId === team1?.id
                  ? 'championZoom 1.5s ease-in-out infinite'
                  : 'none',
            }}
          >
            <span
              className={`font-semibold truncate flex items-center gap-1.5 ${
                team1Name === 'BYE'
                  ? 'text-orange-400 font-bold'
                  : isCompleted && match.winnerId === team1?.id
                    ? isFinale
                      ? 'text-amber-100 font-bold drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                      : 'text-emerald-100 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : team1
                      ? 'text-gray-100'
                      : 'text-gray-500 italic'
              }`}
            >
              {team1?.seed && (
                <span className="text-xs opacity-70 bg-gray-700/50 px-1.5 py-0.5 rounded">
                  #{team1.seed}
                </span>
              )}
              {team1Name}
              {isFinale && isCompleted && match.winnerId === team1?.id && (
                <Crown className="inline-block w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-bounce" />
              )}
            </span>
            {(isCompleted || isLive) &&
              (hasSets
                ? renderTVSetPills(1)
                : (isLive ? match.liveScore : match.score) && (
                    <span
                      className={`${pillTextSize} font-bold ml-1 px-2 py-0.5 rounded ${
                        isLive
                          ? 'text-orange-300 bg-orange-900/30 animate-pulse'
                          : match.winnerId === team1?.id
                            ? 'text-emerald-200 bg-emerald-900/30'
                            : 'text-red-300 bg-red-900/20'
                      }`}
                    >
                      {isLive ? match.liveScore.team1 : match.score.team1}
                    </span>
                  ))}
          </div>

          {/* Team 2 */}
          <div
            className={`flex items-center justify-between px-3 py-1 ${playerFontSize} transition-all duration-300 relative z-10 ${
              isCompleted && match.winnerId === team2?.id
                ? isFinale
                  ? 'bg-gradient-to-r from-amber-900/50 via-yellow-800/40 to-amber-900/50 border-t-2 border-amber-400/70 shadow-amber-500/30 shadow-inner'
                  : 'bg-gradient-to-r from-emerald-900/40 via-emerald-800/30 to-emerald-900/40 border-t-2 border-emerald-500/50 shadow-emerald-500/20 shadow-inner animate-pulse'
                : 'bg-gradient-to-r from-gray-800/60 via-gray-700/60 to-gray-800/60'
            }`}
            style={{
              animation:
                isFinale && isCompleted && match.winnerId === team2?.id
                  ? 'championZoom 1.5s ease-in-out infinite'
                  : 'none',
            }}
          >
            <span
              className={`font-semibold truncate flex items-center gap-1.5 ${
                team2Name === 'BYE'
                  ? 'text-orange-400 font-bold'
                  : isCompleted && match.winnerId === team2?.id
                    ? isFinale
                      ? 'text-amber-100 font-bold drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                      : 'text-emerald-100 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : team2
                      ? 'text-gray-100'
                      : 'text-gray-500 italic'
              }`}
            >
              {team2?.seed && (
                <span className="text-xs opacity-70 bg-gray-700/50 px-1.5 py-0.5 rounded">
                  #{team2.seed}
                </span>
              )}
              {team2Name}
              {isFinale && isCompleted && match.winnerId === team2?.id && (
                <Crown className="inline-block w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-bounce" />
              )}
            </span>
            {(isCompleted || isLive) &&
              (hasSets
                ? renderTVSetPills(2)
                : (isLive ? match.liveScore : match.score) && (
                    <span
                      className={`${pillTextSize} font-bold ml-1 px-2 py-0.5 rounded ${
                        isLive
                          ? 'text-orange-300 bg-orange-900/30 animate-pulse'
                          : match.winnerId === team2?.id
                            ? 'text-emerald-200 bg-emerald-900/30'
                            : 'text-red-300 bg-red-900/20'
                      }`}
                    >
                      {isLive ? match.liveScore.team2 : match.score.team2}
                    </span>
                  ))}
          </div>
        </div>
      );
    }

    // Normal View: Full detailed match card
    const renderSetPills = (teamIndex) => {
      if (!hasSets) return null;
      const isWinner =
        (teamIndex === 1 && match.winnerId === team1?.id) ||
        (teamIndex === 2 && match.winnerId === team2?.id);

      return (
        <div className="flex items-center gap-1 ml-2">
          {setsToShow.map((s, i) => {
            const a = Number(s?.team1 ?? 0);
            const b = Number(s?.team2 ?? 0);
            const val = teamIndex === 1 ? a : b;
            const win = teamIndex === 1 ? a > b : b > a;
            return (
              <span
                key={`tb-pill-${match.id}-${teamIndex}-${i}`}
                className={`px-1.5 py-0.5 rounded-md text-[10px] leading-4 font-semibold border transition-all ${
                  isLive
                    ? 'bg-orange-900/40 text-orange-300 border-orange-600/50 animate-pulse shadow-sm shadow-orange-500/20'
                    : win
                      ? isFinale && isWinner
                        ? 'bg-amber-900/40 text-amber-200 border-amber-600/50 shadow-sm shadow-amber-500/20'
                        : isWinner
                          ? 'bg-emerald-900/40 text-emerald-200 border-emerald-600/50 shadow-sm shadow-emerald-500/20'
                          : 'bg-red-900/40 text-red-300 border-red-600/50'
                      : 'bg-gray-700/60 text-gray-300 border-gray-600/50'
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
      <button
        type="button"
        key={match.id}
        disabled={!canRecordResult || isPublicView}
        className={`relative bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 backdrop-blur-sm rounded-xl border-2 shadow-lg p-2 sm:p-3 transition-all w-full lg:min-w-[200px] lg:w-[200px] text-left ${
          isPublicView
            ? 'cursor-default border-gray-600/50'
            : 'hover:border-primary-500 hover:shadow-primary-500/20 cursor-pointer active:scale-[0.98] border-gray-700'
        } ${!canRecordResult && !hasBye && !isPublicView ? 'opacity-60 cursor-not-allowed' : ''} ${
          isFinale && isCompleted && isPublicView
            ? 'border-amber-500/70 shadow-2xl shadow-amber-500/30'
            : ''
        }`}
        onClick={() => !isPublicView && canRecordResult && setSelectedMatch(match)}
      >
        {/* Match Number - only show in admin view */}
        {!isPublicView && (
          <div className="absolute -top-2 -left-2 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-lg border-2 border-gray-800">
            {match.matchNumber || '?'}
          </div>
        )}

        {/* Team 1 */}
        <div
          className={`flex items-center justify-between p-2 sm:p-2.5 rounded-lg transition-all ${
            isCompleted && match.winnerId === team1?.id
              ? isFinale
                ? 'bg-gradient-to-r from-amber-900/50 via-yellow-800/40 to-amber-900/50 border-2 border-amber-500/50 shadow-inner shadow-amber-500/20'
                : 'bg-gradient-to-r from-emerald-900/40 via-emerald-800/30 to-emerald-900/40 border-2 border-emerald-500/50 shadow-inner shadow-emerald-500/20'
              : 'bg-gradient-to-r from-gray-800/70 via-gray-700/70 to-gray-800/70 border border-gray-600/30'
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            {team1?.seed && (
              <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 bg-gray-700/60 text-gray-300 rounded">
                #{team1.seed}
              </span>
            )}
            <span
              className={`text-sm sm:text-base font-semibold truncate ${
                team1Name === 'BYE'
                  ? 'text-orange-400 font-bold'
                  : isCompleted && match.winnerId === team1?.id
                    ? isFinale
                      ? 'text-amber-100 font-bold drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                      : 'text-emerald-100 font-bold drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]'
                    : team1
                      ? 'text-gray-100'
                      : 'text-gray-500 italic'
              }`}
            >
              {team1Name}
              {isFinale && isCompleted && match.winnerId === team1?.id && (
                <Crown className="inline-block ml-1 w-4 h-4 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
              )}
            </span>
          </div>
          {(isCompleted || isLive) &&
            (hasSets
              ? renderSetPills(1)
              : (isLive ? match.liveScore : match.score) && (
                  <span
                    className={`${isPublicView ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-bold ml-2 flex-shrink-0 px-2 py-0.5 rounded ${
                      isLive
                        ? 'text-orange-300 bg-orange-900/30 animate-pulse'
                        : match.winnerId === team1?.id
                          ? isFinale
                            ? 'text-amber-200 bg-amber-900/30'
                            : 'text-emerald-200 bg-emerald-900/30'
                          : 'text-gray-400 bg-gray-800/30'
                    }`}
                  >
                    {isLive ? match.liveScore.team1 : match.score.team1}
                  </span>
                ))}
        </div>

        {/* VS Divider */}
        <div className="flex items-center justify-center py-1 sm:py-1.5">
          <div className="h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent flex-1"></div>
          <span className="px-2 sm:px-2.5 text-[10px] sm:text-xs text-primary-400 font-bold tracking-wider">
            VS
          </span>
          <div className="h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent flex-1"></div>
        </div>

        {/* Team 2 */}
        <div
          className={`flex items-center justify-between p-2 sm:p-2.5 rounded-lg transition-all ${
            isCompleted && match.winnerId === team2?.id
              ? isFinale
                ? 'bg-gradient-to-r from-amber-900/50 via-yellow-800/40 to-amber-900/50 border-2 border-amber-500/50 shadow-inner shadow-amber-500/20'
                : 'bg-gradient-to-r from-emerald-900/40 via-emerald-800/30 to-emerald-900/40 border-2 border-emerald-500/50 shadow-inner shadow-emerald-500/20'
              : 'bg-gradient-to-r from-gray-800/70 via-gray-700/70 to-gray-800/70 border border-gray-600/30'
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            {team2?.seed && (
              <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 bg-gray-700/60 text-gray-300 rounded">
                #{team2.seed}
              </span>
            )}
            <span
              className={`text-sm sm:text-base font-semibold truncate ${
                team2Name === 'BYE'
                  ? 'text-orange-400 font-bold'
                  : isCompleted && match.winnerId === team2?.id
                    ? isFinale
                      ? 'text-amber-100 font-bold drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                      : 'text-emerald-100 font-bold drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]'
                    : team2
                      ? 'text-gray-100'
                      : 'text-gray-500 italic'
              }`}
            >
              {team2Name}
              {isFinale && isCompleted && match.winnerId === team2?.id && (
                <Crown className="inline-block ml-1 w-4 h-4 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
              )}
            </span>
          </div>
          {(isCompleted || isLive) &&
            (hasSets
              ? renderSetPills(2)
              : (isLive ? match.liveScore : match.score) && (
                  <span
                    className={`${isPublicView ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-bold ml-2 flex-shrink-0 px-2 py-0.5 rounded ${
                      isLive
                        ? 'text-orange-300 bg-orange-900/30 animate-pulse'
                        : match.winnerId === team2?.id
                          ? isFinale
                            ? 'text-amber-200 bg-amber-900/30'
                            : 'text-emerald-200 bg-emerald-900/30'
                          : 'text-gray-400 bg-gray-800/30'
                    }`}
                  >
                    {isLive ? match.liveScore.team2 : match.score.team2}
                  </span>
                ))}
        </div>

        {/* Action hint - only show in admin view */}
        {canRecordResult && !isPublicView && (
          <div className="mt-2 text-center">
            <span className="text-xs text-primary-400">Click per inserire risultato</span>
          </div>
        )}
      </button>
    );
  };

  const renderRound = (roundName, roundMatches, roundIndex) => {
    // Ensure consistent ordering within each round: 1..N by matchNumber
    const sortedMatches = [...roundMatches].sort((a, b) => {
      const an = typeof a.matchNumber === 'number' ? a.matchNumber : 9999;
      const bn = typeof b.matchNumber === 'number' ? b.matchNumber : 9999;
      if (an !== bn) return an - bn;
      // fallback: stable by createdAt or id
      const ad = a.createdAt?.toMillis?.() || 0;
      const bd = b.createdAt?.toMillis?.() || 0;
      if (ad !== bd) return ad - bd;
      return String(a.id).localeCompare(String(b.id));
    });
    const isCollapsed = !!collapsedByRound[roundName];

    // TV View: Bracket-style layout with proper positioning
    if (isTVView) {
      // Determine the actual round index relative to displayed rounds
      // This ensures proper centering whether starting from ottavi, quarti, or semi
      const actualRoundIndex = orderedRounds.indexOf(roundName);

      return (
        <div key={roundName} className="flex flex-col justify-start w-full">
          {/* Round Header - Compact & Modern */}
          <div className="bg-gradient-to-r from-indigo-900/50 via-blue-900/50 to-indigo-900/50 rounded-lg px-3 py-2 mb-4 border border-indigo-700/50 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 justify-center">
              {getRoundIcon(roundName)}
              <h3 className="font-bold text-sm text-white tracking-wide">{roundName}</h3>
            </div>
          </div>

          {/* Bracket Layout - Position matches with proper spacing */}
          <div className="flex flex-col relative" style={{ minHeight: '500px' }}>
            {sortedMatches.map((match, matchIndex) => {
              // Calculate vertical position for bracket-style layout
              let topPosition = 0;

              // Rilevo da quale round parte il tabellone
              const firstRoundName = orderedRounds[0];
              const firstRoundIsQuarters =
                firstRoundName === KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.QUARTER_FINALS];
              const firstRoundIsSemi =
                firstRoundName === KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.SEMI_FINALS];

              // Determino le dimensioni delle card in base al caso
              let firstRoundHeight = dynamicBracketHeights.first;
              let subsequentHeights = dynamicBracketHeights.subsequent;

              // Determino l'altezza della card corrente
              let currentHeight = firstRoundHeight;
              if (actualRoundIndex > 0) {
                currentHeight =
                  subsequentHeights[actualRoundIndex - 1] ||
                  subsequentHeights[subsequentHeights.length - 1];
              }

              // Calcolo offset verticale per centrare semi e finale rispetto ai quarti
              let verticalOffset = 0;
              if (firstRoundIsQuarters) {
                // I Quarti rimangono a offset 0 (in alto)
                if (actualRoundIndex === 1) {
                  // Semifinali: devono essere centrate tra i quarti
                  // Semi 1: tra Quarti 1 (0px) e Quarti 2 (112px) = centro a 56px
                  // Semi 2: tra Quarti 3 (224px) e Quarti 4 (336px) = centro a 280px
                  // La formula automatica dà: Semi 1 a 80px, Semi 2 a 320px
                  // Offset necessario: 56 - 80 = -24px
                  verticalOffset = -24;
                } else if (actualRoundIndex === 2) {
                  // Finale: deve essere centrata tra le due semifinali
                  // Semi 1 a 56px, Semi 2 a 296px = centro a 176px
                  // La formula automatica dà la finale a 195px
                  // Offset necessario: 176 - 195 = -19px
                  verticalOffset = -19;
                }
              } else if (firstRoundIsSemi) {
                // Caso 3: Semifinali → Finale
                // Con gap 1.6, le semifinali sono a:
                // Semi 1: top=0px, centro=45px (altezza 90px)
                // Semi 2: top=144px, centro=189px
                // Centro tra i due centri: (45 + 189) / 2 = 117px
                // Ma voglio che il centro della finale (altezza 100px) sia a 117px
                // Quindi top finale = 117 - 50 = 67px
                // La formula automatica dà: 153 - 50 = 103px
                // Offset necessario: 67 - 103 = -36px
                if (actualRoundIndex === 1) {
                  verticalOffset = -36;
                }
              }

              if (actualRoundIndex > 0) {
                // Subsequent rounds: position centered between previous round pairs
                // Use first round height as base for all spacing calculations
                const baseHeight = firstRoundHeight;

                // CASO 2: Per quarti, aumento la spaziatura del 50%
                // CASO 3: Per semi, aumento la spaziatura del 70%
                const spacingMultiplier = firstRoundIsQuarters ? 1.5 : firstRoundIsSemi ? 1.7 : 1.0;
                const spacing = baseHeight * Math.pow(2, actualRoundIndex) * spacingMultiplier;

                // Position at center of spacing, accounting for current card height
                topPosition =
                  matchIndex * spacing + spacing / 2 - currentHeight / 2 + verticalOffset;
              } else {
                // First round: stack matches with optional gap
                // CASO 2: Per quarti al primo round, aggiungo gap del 40% tra le card
                // CASO 3: Per semi al primo round, aggiungo gap del 60% tra le card
                const gapMultiplier = firstRoundIsQuarters ? 1.4 : firstRoundIsSemi ? 1.6 : 1.0;
                topPosition = matchIndex * firstRoundHeight * gapMultiplier + verticalOffset;
              }

              return (
                <div
                  key={match.id}
                  className="absolute"
                  style={{
                    top: `${topPosition}px`,
                    width: '100%',
                    height: `${currentHeight}px`,
                  }}
                >
                  {renderMatch(match, actualRoundIndex)}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Normal View: Original layout with collapse
    return (
      <div
        key={roundName}
        ref={(el) => {
          roundRefs.current[roundName] = el;
        }}
        className="flex flex-col lg:min-w-[240px]"
      >
        {/* Round Header */}
        <button
          type="button"
          onClick={() => toggleRound(roundName)}
          className="w-full bg-gradient-to-r from-primary-900/40 to-blue-900/40 rounded-lg px-3 sm:px-4 py-2 sm:py-3 shadow-md border border-primary-800 text-left"
          aria-expanded={!isCollapsed}
          aria-controls={`round-panel-${roundIndex}`}
        >
          <div className="flex items-center gap-2 justify-between sm:justify-center">
            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-none">
              {getRoundIcon(roundName)}
              <h3 className="font-bold text-sm sm:text-base text-white truncate">{roundName}</h3>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-400 flex-shrink-0">
                {roundMatches.length} {roundMatches.length === 1 ? 'partita' : 'partite'}
              </p>
              <ChevronDown
                className={`w-4 h-4 text-gray-300 transition-transform ${
                  isCollapsed ? '' : 'rotate-180'
                }`}
                aria-hidden="true"
              />
            </div>
          </div>
        </button>

        {/* Matches */}
        <div
          id={`round-panel-${roundIndex}`}
          className={`flex flex-col gap-3 sm:gap-6 mt-3 sm:mt-4 ${isCollapsed ? 'hidden lg:flex' : ''}`}
        >
          {sortedMatches.map((match) => renderMatch(match, roundIndex))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (orderedRounds.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 bg-gray-800 rounded-lg border border-gray-700">
        <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-white mb-2 px-4">
          Tabellone Non Disponibile
        </h3>
        <p className="text-sm sm:text-base text-gray-400 mb-4 px-4">
          Il tabellone eliminazione diretta verrà generato al termine della fase a gironi
        </p>
      </div>
    );
  }

  return (
    <div className={isTVView ? 'h-full flex flex-col' : 'space-y-4 sm:space-y-6'}>
      {/* Mobile: Quick round chips navigator - hide in TV view and public view */}
      {!isTVView && !isPublicView && (
        <div className="lg:hidden -mx-3 px-3">
          <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide">
            {orderedRounds.map((roundName) => (
              <button
                key={`chip-${roundName}`}
                onClick={() => scrollToRound(roundName)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-800 border border-gray-700 text-gray-200 whitespace-nowrap hover:bg-gray-700"
              >
                {roundName}
                <span className="ml-1 text-[10px] text-gray-500">
                  {rounds[roundName]?.length || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bracket Tree */}
      {isTVView ? (
        // TV View: Bracket-style layout - allow vertical growth
        <div className="flex-1 flex items-start justify-center overflow-hidden px-4">
          <div className="flex items-start justify-center gap-8 w-full py-4">
            {orderedRounds.map((roundName, index) => (
              <div key={roundName} className="flex flex-col flex-1 min-w-0">
                {renderRound(roundName, rounds[roundName], index)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Normal View: Mobile collapsible, Desktop horizontal scroll
        <div className="lg:overflow-x-auto lg:pb-4">
          {/* Mobile: Collapsible Rounds Stack */}
          <div className="lg:hidden space-y-6">
            {orderedRounds.map((roundName, idx) => renderRound(roundName, rounds[roundName], idx))}
          </div>

          {/* Desktop: Horizontal Scroll */}
          <div className="hidden lg:inline-flex gap-4 md:gap-8 p-3 md:p-4 min-w-full">
            {orderedRounds.map((roundName, index) => (
              <React.Fragment key={roundName}>
                {renderRound(roundName, rounds[roundName], index)}
                {index < orderedRounds.length - 1 && (
                  <div className="flex items-center justify-center">
                    <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-gray-600" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Champion Display - only in admin view */}
      {!isPublicView &&
        rounds[KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS]] &&
        rounds[KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS]][0] &&
        rounds[KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS]][0].status ===
          MATCH_STATUS.COMPLETED && (
          <div className="bg-gradient-to-br from-yellow-900/30 via-yellow-800/20 to-orange-900/30 rounded-lg p-4 sm:p-6 md:p-8 border-2 border-yellow-700 shadow-xl">
            <div className="text-center">
              <Crown className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-yellow-400 mx-auto mb-3 sm:mb-4 animate-bounce" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                🏆 Campione Torneo
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-300 px-4">
                {teams[rounds[KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS]][0].winnerId]?.teamName ||
                  'Unknown'}
              </p>
              {teams[rounds[KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS]][0].winnerId]?.players && (
                <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-1.5 sm:gap-2 px-4">
                  {teams[
                    rounds[KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS]][0].winnerId
                  ].players.map((player, idx) => (
                    <span
                      key={idx}
                      className="px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-800 text-yellow-100 rounded-full text-xs sm:text-sm"
                    >
                      {player.playerName || player.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      {/* Result Modal - only in admin view */}
      {!isPublicView && selectedMatch && (
        <MatchResultModal
          match={selectedMatch}
          team1={teams[selectedMatch.team1Id]}
          team2={teams[selectedMatch.team2Id]}
          onClose={() => setSelectedMatch(null)}
          onSubmit={handleRecordResult}
          T={themeTokens()}
        />
      )}
    </div>
  );
}

export default TournamentBracket;
