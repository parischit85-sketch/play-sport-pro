/**
 * Tournament Bracket - Display knockout bracket tree
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Trophy, Crown, Medal, ChevronRight, ChevronDown } from 'lucide-react';
import { useAuth, USER_ROLES } from '../../../../contexts/AuthContext';
import { themeTokens } from '../../../../lib/theme';
import { getMatches } from '../../services/matchService';
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

  // ✅ FIX: Check club-specific admin role, not global userRole
  const clubRole = userClubRoles?.[clubId];
  const isAdminClubRole = clubRole === 'admin' || clubRole === 'club_admin';
  const isClubAdmin = userRole === USER_ROLES.SUPER_ADMIN || isAdminClubRole;
  const canEditResults = isClubAdmin;

  const loadBracket = useCallback(async () => {
    setLoading(true);
    try {
      const [matchesData, teamsData] = await Promise.all([
        getMatches(clubId, tournament.id, { type: 'knockout' }),
        getTeamsByTournament(clubId, tournament.id),
      ]);

      const teamsMap = {};
      teamsData.forEach((team) => {
        teamsMap[team.id] = team;
      });

      setMatches(matchesData);
      setTeams(teamsMap);
    } catch (error) {
      console.error('Error loading bracket:', error);
    } finally {
      setLoading(false);
    }
  }, [clubId, tournament.id]);

  useEffect(() => {
    loadBracket();
  }, [loadBracket]);

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
        loadBracket();
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

    // TBD teams (not yet determined from previous round), BYE (admin selected), or Qalif. (auto-qualified)
    const team1Name = team1?.teamName || match.team1Name || 'TBD';
    const team2Name = team2?.teamName || match.team2Name || 'TBD';

    const hasSets = Array.isArray(match.sets) && match.sets.length > 0;

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
          <div className="flex items-center gap-0.5 ml-1">
            {match.sets.map((s, i) => {
              const a = Number(s?.team1 ?? 0);
              const b = Number(s?.team2 ?? 0);
              const val = teamIndex === 1 ? a : b;
              const win = teamIndex === 1 ? a > b : b > a;
              return (
                <span
                  key={`tv-pill-${match.id}-${teamIndex}-${i}`}
                  className={`${pillPadding} rounded ${pillTextSize} leading-3 font-bold ${
                    win
                      ? isWinner
                        ? 'bg-emerald-900/30 text-emerald-300'
                        : 'bg-red-900/30 text-red-400'
                      : isWinner
                        ? 'bg-gray-700 text-emerald-300'
                        : 'bg-gray-700 text-red-400'
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
        <div key={match.id} className="bg-gray-700 w-full" style={{ margin: 0, padding: '0px' }}>
          {/* Team 1 */}
          <div
            className={`flex items-center justify-between px-2 py-0.5 ${playerFontSize} ${
              isCompleted && match.winnerId === team1?.id
                ? 'bg-green-900/30 border border-green-700'
                : 'bg-gradient-to-r from-gray-700 to-gray-600'
            }`}
          >
            <span
              className={`font-semibold truncate ${
                team1Name === 'BYE'
                  ? 'text-orange-500 font-bold'
                  : isCompleted && match.winnerId === team1?.id
                    ? 'text-green-200 font-bold'
                    : team1
                      ? 'text-white'
                      : 'text-gray-500 italic'
              }`}
            >
              {team1?.seed ? `#${team1.seed} ` : ''}
              {team1Name}
              {isFinale && isCompleted && match.winnerId === team1?.id && (
                <Crown className="inline-block ml-1 w-5 h-5 text-amber-400 align-middle" />
              )}
            </span>
            {isCompleted &&
              (hasSets
                ? renderTVSetPills(1)
                : match.score && (
                    <span
                      className={`${pillTextSize} font-bold ml-1 ${
                        match.winnerId === team1?.id ? 'text-green-300' : 'text-red-400'
                      }`}
                    >
                      {match.score.team1}
                    </span>
                  ))}
          </div>

          {/* Team 2 */}
          <div
            className={`flex items-center justify-between px-2 py-0.5 ${playerFontSize} ${
              isCompleted && match.winnerId === team2?.id
                ? 'bg-green-900/30 border border-green-700'
                : 'bg-gradient-to-r from-gray-600 to-gray-700'
            }`}
          >
            <span
              className={`font-semibold truncate ${
                team2Name === 'BYE'
                  ? 'text-orange-500 font-bold'
                  : isCompleted && match.winnerId === team2?.id
                    ? 'text-green-200 font-bold'
                    : team2
                      ? 'text-white'
                      : 'text-gray-500 italic'
              }`}
            >
              {team2?.seed ? `#${team2.seed} ` : ''}
              {team2Name}
              {isFinale && isCompleted && match.winnerId === team2?.id && (
                <Crown className="inline-block ml-1 w-5 h-5 text-amber-400 align-middle" />
              )}
            </span>
            {isCompleted &&
              (hasSets
                ? renderTVSetPills(2)
                : match.score && (
                    <span
                      className={`${pillTextSize} font-bold ml-1 ${
                        match.winnerId === team2?.id ? 'text-green-300' : 'text-red-400'
                      }`}
                    >
                      {match.score.team2}
                    </span>
                  ))}
          </div>
        </div>
      );
    }

    // Normal View: Full detailed match card
    const renderSetPills = (teamIndex) => {
      if (!hasSets) return null;
      return (
        <div className="flex items-center gap-1 ml-2">
          {match.sets.map((s, i) => {
            const a = Number(s?.team1 ?? 0);
            const b = Number(s?.team2 ?? 0);
            const val = teamIndex === 1 ? a : b;
            const win = teamIndex === 1 ? a > b : b > a;
            return (
              <span
                key={`tb-pill-${match.id}-${teamIndex}-${i}`}
                className={`px-1.5 py-0.5 rounded text-[10px] leading-4 ${
                  win ? 'bg-emerald-900/30 text-emerald-300' : 'bg-gray-700 text-gray-300'
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
        className={`relative bg-gray-700 rounded-lg border-2 border-gray-700 p-2 sm:p-3 transition-all w-full lg:min-w-[200px] lg:w-[200px] text-left ${
          isPublicView
            ? 'cursor-default'
            : 'hover:border-primary-400 cursor-pointer active:scale-[0.99]'
        } ${!canRecordResult && !hasBye && !isPublicView ? 'opacity-60 cursor-not-allowed' : ''}`}
        onClick={() => !isPublicView && canRecordResult && setSelectedMatch(match)}
      >
        {/* Match Number - only show in admin view */}
        {!isPublicView && (
          <div className="absolute -top-2 -left-2 w-5 h-5 sm:w-6 sm:h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold">
            {match.matchNumber || '?'}
          </div>
        )}

        {/* Team 1 */}
        <div
          className={`flex items-center justify-between p-1.5 sm:p-2 rounded ${
            isCompleted && match.winnerId === team1?.id
              ? 'bg-green-900/30 border border-green-700'
              : 'bg-gradient-to-r from-gray-700 to-gray-600'
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            {team1?.seed && (
              <span className="text-[10px] sm:text-xs font-bold text-gray-400 flex-shrink-0">
                #{team1.seed}
              </span>
            )}
            <span
              className={`text-xs sm:text-sm font-medium truncate ${
                team1Name === 'BYE'
                  ? 'text-orange-500 font-bold'
                  : isCompleted && match.winnerId === team1?.id
                    ? 'text-green-200 font-bold'
                    : team1
                      ? 'text-white'
                      : 'text-gray-500 italic'
              }`}
            >
              {team1Name}
            </span>
          </div>
          {isCompleted &&
            (hasSets
              ? renderSetPills(1)
              : match.score && (
                  <span
                    className={`${isPublicView ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'} font-bold ml-2 flex-shrink-0 ${
                      match.winnerId === team1?.id ? 'text-green-300' : 'text-gray-500'
                    }`}
                  >
                    {match.score.team1}
                  </span>
                ))}
        </div>

        {/* VS Divider */}
        <div className="flex items-center justify-center py-0.5 sm:py-1">
          <div className="h-px bg-fuchsia-500 flex-1"></div>
          <span className="px-1.5 sm:px-2 text-[10px] sm:text-xs text-fuchsia-400 font-bold">
            VS
          </span>
          <div className="h-px bg-fuchsia-500 flex-1"></div>
        </div>

        {/* Team 2 */}
        <div
          className={`flex items-center justify-between p-1.5 sm:p-2 rounded ${
            isCompleted && match.winnerId === team2?.id
              ? 'bg-green-900/30 border border-green-700'
              : 'bg-gradient-to-r from-gray-600 to-gray-700'
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            {team2?.seed && (
              <span className="text-[10px] sm:text-xs font-bold text-gray-400 flex-shrink-0">
                #{team2.seed}
              </span>
            )}
            <span
              className={`text-xs sm:text-sm font-medium truncate ${
                team2Name === 'BYE'
                  ? 'text-orange-500 font-bold'
                  : isCompleted && match.winnerId === team2?.id
                    ? 'text-green-200 font-bold'
                    : team2
                      ? 'text-white'
                      : 'text-gray-500 italic'
              }`}
            >
              {team2Name}
            </span>
          </div>
          {isCompleted &&
            (hasSets
              ? renderSetPills(2)
              : match.score && (
                  <span
                    className={`${isPublicView ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'} font-bold ml-2 flex-shrink-0 ${
                      match.winnerId === team2?.id ? 'text-green-300' : 'text-gray-500'
                    }`}
                  >
                    {match.score.team2}
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
          {/* Round Header - Compact */}
          <div className="bg-gradient-to-r from-primary-900/40 to-blue-900/40 rounded-md px-2 py-1.5 mb-3 border border-primary-800">
            <div className="flex items-center gap-1.5 justify-center">
              {getRoundIcon(roundName)}
              <h3 className="font-bold text-xs text-white truncate">{roundName}</h3>
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
              let firstRoundHeight = 60;
              let subsequentHeights = [75, 75, 75]; // default: Quarti, Semi, Finale dopo Ottavi

              if (firstRoundIsSemi) {
                // Caso 3: Semi → Finale
                firstRoundHeight = 90; // Semi
                subsequentHeights = [100]; // Finale
              } else if (firstRoundIsQuarters) {
                // Caso 2: Quarti → Semi → Finale
                firstRoundHeight = 80; // Quarti
                subsequentHeights = [80, 90]; // Semi, Finale
              }
              // else: Caso 1 (default) Ottavi → Quarti → Semi → Finale
              // firstRoundHeight = 60, subsequentHeights = [75, 75, 75]

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
