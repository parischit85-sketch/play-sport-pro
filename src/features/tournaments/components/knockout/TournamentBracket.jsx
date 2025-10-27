/**
 * Tournament Bracket - Display knockout bracket tree
 */

import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, ChevronRight } from 'lucide-react';
import { useAuth, USER_ROLES } from '../../../../contexts/AuthContext';
import { getMatches } from '../../services/matchService';
import { getTeamsByTournament } from '../../services/teamsService';
import MatchResultModal from '../matches/MatchResultModal';
import { recordMatchResult } from '../../services/matchService';
import {
  MATCH_STATUS,
  KNOCKOUT_ROUND,
  KNOCKOUT_ROUND_NAMES,
} from '../../utils/tournamentConstants';

function TournamentBracket({ tournament, clubId }) {
  const { userRole } = useAuth();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Solo gli admin possono modificare i risultati
  const isClubAdmin = userRole === USER_ROLES.CLUB_ADMIN || userRole === USER_ROLES.SUPER_ADMIN;
  const canEditResults = isClubAdmin;

  useEffect(() => {
    loadBracket();
  }, [tournament.id, clubId]);

  const loadBracket = async () => {
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
  const rounds = matches.reduce((acc, match) => {
    const key = toDisplayRound(match);
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {});

  // Define canonical round order using constants, then keep only those present
  const canonicalOrder = [
    KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.ROUND_OF_16],
    KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.QUARTER_FINALS],
    KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.SEMI_FINALS],
    KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS],
    KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.THIRD_PLACE],
  ];
  const orderedRounds = canonicalOrder.filter((label) => rounds[label] && rounds[label].length > 0);

  const getRoundIcon = (round) => {
    if (round === 'Finale') return <Crown className="w-5 h-5 text-yellow-500" />;
    if (round === 'Semifinali') return <Medal className="w-5 h-5 text-gray-400" />;
    return <Trophy className="w-5 h-5 text-primary-600" />;
  };

  const renderMatch = (match, roundIndex) => {
    const team1 = teams[match.team1Id];
    const team2 = teams[match.team2Id];
    const isCompleted = match.status === MATCH_STATUS.COMPLETED;
    // Consenti modifica anche a match completati (il transaction layer protegge i casi invalidi)
    // Solo admin possono modificare i risultati
    const canRecordResult = !!(team1 && team2 && canEditResults);

    // TBD teams (not yet determined from previous round) or BYE (no team)
    const team1Name = !match.team1Id ? 'BYE' : team1?.teamName || match.team1Name || 'TBD';
    const team2Name = !match.team2Id ? 'BYE' : team2?.teamName || match.team2Name || 'TBD';

    const hasSets = Array.isArray(match.sets) && match.sets.length > 0;

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
                  win
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
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
        className="relative bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-3 hover:border-primary-400 dark:hover:border-primary-600 transition-all min-w-[200px] cursor-pointer"
        onClick={() => canRecordResult && setSelectedMatch(match)}
      >
        {/* Match Number */}
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
          {match.matchNumber || '?'}
        </div>

        {/* Team 1 */}
        <div
          className={`flex items-center justify-between p-2 rounded ${
            isCompleted && match.winnerId === team1?.id
              ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
              : 'bg-gray-50 dark:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {team1?.seed && (
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                #{team1.seed}
              </span>
            )}
            <span
              className={`text-sm font-medium truncate ${
                team1Name === 'BYE'
                  ? 'text-orange-600 dark:text-orange-400 font-bold'
                  : isCompleted && match.winnerId === team1?.id
                    ? 'text-green-800 dark:text-green-200 font-bold'
                    : team1
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-400 dark:text-gray-500 italic'
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
                    className={`text-lg font-bold ml-2 ${
                      match.winnerId === team1?.id
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {match.score.team1}
                  </span>
                ))}
        </div>

        {/* VS Divider */}
        <div className="flex items-center justify-center py-1">
          <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
          <span className="px-2 text-xs text-gray-400 dark:text-gray-500 font-medium">VS</span>
          <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
        </div>

        {/* Team 2 */}
        <div
          className={`flex items-center justify-between p-2 rounded ${
            isCompleted && match.winnerId === team2?.id
              ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
              : 'bg-gray-50 dark:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {team2?.seed && (
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                #{team2.seed}
              </span>
            )}
            <span
              className={`text-sm font-medium truncate ${
                team2Name === 'BYE'
                  ? 'text-orange-600 dark:text-orange-400 font-bold'
                  : isCompleted && match.winnerId === team2?.id
                    ? 'text-green-800 dark:text-green-200 font-bold'
                    : team2
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-400 dark:text-gray-500 italic'
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
                    className={`text-lg font-bold ml-2 ${
                      match.winnerId === team2?.id
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {match.score.team2}
                  </span>
                ))}
        </div>

        {/* Action hint */}
        {canRecordResult && (
          <div className="mt-2 text-center">
            <span className="text-xs text-primary-600 dark:text-primary-400">
              Click per inserire risultato
            </span>
          </div>
        )}
      </div>
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
    return (
      <div key={roundName} className="flex flex-col items-center gap-4 min-w-[240px]">
        {/* Round Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary-100 to-blue-100 dark:from-primary-900/40 dark:to-blue-900/40 rounded-lg px-4 py-3 shadow-md border border-primary-200 dark:border-primary-800">
          <div className="flex items-center gap-2 justify-center">
            {getRoundIcon(roundName)}
            <h3 className="font-bold text-gray-900 dark:text-white">{roundName}</h3>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">
            {roundMatches.length} {roundMatches.length === 1 ? 'partita' : 'partite'}
          </p>
        </div>

        {/* Matches */}
        <div className="flex flex-col gap-6">
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
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Tabellone Non Disponibile
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Il tabellone eliminazione diretta verrà generato al termine della fase a gironi
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bracket Tree */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-flex gap-4 md:gap-8 p-3 md:p-4 min-w-full">
          {orderedRounds.map((roundName, index) => (
            <React.Fragment key={roundName}>
              {renderRound(roundName, rounds[roundName], index)}
              {index < orderedRounds.length - 1 && (
                <div className="flex items-center justify-center">
                  <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-gray-300 dark:text-gray-600" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Champion Display */}
      {rounds[KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS]] &&
        rounds[KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS]][0] &&
        rounds[KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS]][0].status ===
          MATCH_STATUS.COMPLETED && (
          <div className="bg-gradient-to-br from-yellow-100 via-yellow-50 to-orange-100 dark:from-yellow-900/30 dark:via-yellow-800/20 dark:to-orange-900/30 rounded-lg p-8 border-2 border-yellow-300 dark:border-yellow-700 shadow-xl">
            <div className="text-center">
              <Crown className="w-16 h-16 text-yellow-600 dark:text-yellow-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🏆 Campione Torneo
              </h2>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {teams[rounds[KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS]][0].winnerId]?.teamName ||
                  'Unknown'}
              </p>
              {teams[rounds[KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS]][0].winnerId]?.players && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {teams[
                    rounds[KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS]][0].winnerId
                  ].players.map((player, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 rounded-full text-sm"
                    >
                      {player.playerName || player.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      {/* Result Modal */}
      {selectedMatch && (
        <MatchResultModal
          match={selectedMatch}
          team1={teams[selectedMatch.team1Id]}
          team2={teams[selectedMatch.team2Id]}
          onClose={() => setSelectedMatch(null)}
          onSubmit={handleRecordResult}
        />
      )}
    </div>
  );
}

export default TournamentBracket;
