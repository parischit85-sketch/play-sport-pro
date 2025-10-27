/**
 * Tournament Matches - Display and manage tournament matches
 */

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Calendar,
  Clock,
  CheckCircle,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { useAuth, USER_ROLES } from '../../../../contexts/AuthContext';
import { getMatches, recordMatchResult } from '../../services/matchService';
import { getTeamsByTournament } from '../../services/teamsService';
import { MATCH_STATUS, KNOCKOUT_ROUND_NAMES } from '../../utils/tournamentConstants';
import { computeFromSets, calcParisDelta } from '../../../../lib/rpa.js';
import MatchResultModal from './MatchResultModal';
import FormulaModal from '../../../../components/modals/FormulaModal.jsx';

function TournamentMatches({ tournament, clubId }) {
  const { userRole } = useAuth();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [filter, setFilter] = useState('all');
  const [formulaModalOpen, setFormulaModalOpen] = useState(false);
  const [formulaMatchData, setFormulaMatchData] = useState(null);

  // Solo gli admin possono modificare i risultati
  const isClubAdmin = userRole === USER_ROLES.CLUB_ADMIN || userRole === USER_ROLES.SUPER_ADMIN;
  const canEditResults = isClubAdmin;

  const loadData = async () => {
    setLoading(true);
    try {
      const [matchesData, teamsData] = await Promise.all([
        getMatches(clubId, tournament.id),
        getTeamsByTournament(clubId, tournament.id),
      ]);

      const teamsMap = {};
      teamsData.forEach((team) => {
        teamsMap[team.id] = team;
      });

      setMatches(matchesData);
      setTeams(teamsMap);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or tournament changes
  useEffect(() => {
    if (tournament && clubId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournament?.id, clubId]);

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
        loadData();
      } else {
        alert(result.error || 'Errore nel salvataggio del risultato');
      }
    } catch (error) {
      console.error('Error recording result:', error);
      alert('Errore nel salvataggio del risultato');
    }
  };

  // Team updates are managed in the Teams tab per requirements

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Define knockout round order for proper sorting
  const knockoutRoundOrder = {
    'Ottavi di Finale': 1,
    'Quarti di Finale': 2,
    Semifinali: 3,
    'Finale 3°/4° Posto': 4,
    Finale: 5,
  };

  const groupedMatches = matches.reduce(
    (acc, match) => {
      if (match.type === 'group') {
        const groupId = match.groupId || 'ungrouped';
        if (!acc.groups[groupId]) {
          acc.groups[groupId] = [];
        }
        acc.groups[groupId].push(match);
      } else {
        const displayRound =
          match.roundName || KNOCKOUT_ROUND_NAMES[match.round] || match.round || 'Sconosciuto';
        if (!acc.knockout[displayRound]) {
          acc.knockout[displayRound] = [];
        }
        acc.knockout[displayRound].push(match);
      }
      return acc;
    },
    { groups: {}, knockout: {} }
  );

  // Sort group keys alphabetically
  const sortedGroupKeys = Object.keys(groupedMatches.groups).sort((a, b) => {
    // Put ungrouped at the end
    if (a === 'ungrouped') return 1;
    if (b === 'ungrouped') return -1;
    return a.localeCompare(b);
  });

  // Sort knockout round keys in proper order
  const sortedKnockoutKeys = Object.keys(groupedMatches.knockout).sort(
    (a, b) => (knockoutRoundOrder[a] || 99) - (knockoutRoundOrder[b] || 99)
  );

  const filterMatch = (match) => {
    if (filter === 'all') return true;
    if (filter === 'scheduled') return match.status === MATCH_STATUS.SCHEDULED;
    if (filter === 'in-progress') return match.status === MATCH_STATUS.IN_PROGRESS;
    if (filter === 'completed') return match.status === MATCH_STATUS.COMPLETED;
    return true;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case MATCH_STATUS.SCHEDULED:
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case MATCH_STATUS.IN_PROGRESS:
        return <PlayCircle className="w-4 h-4 text-orange-500" />;
      case MATCH_STATUS.COMPLETED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case MATCH_STATUS.SCHEDULED:
        return 'Programmata';
      case MATCH_STATUS.IN_PROGRESS:
        return 'In corso';
      case MATCH_STATUS.COMPLETED:
        return 'Completata';
      default:
        return 'Unknown';
    }
  };

  // Utility function for standard points calculation (may be used in future features)
  // eslint-disable-next-line no-unused-vars
  const calculatePoints = (match, pointsSystem) => {
    if (!match.winnerId) return { team1Points: 0, team2Points: 0 };

    const ps = pointsSystem || { win: 3, draw: 1, loss: 0 };
    const team1Won = match.winnerId === match.team1Id;

    return {
      team1Points: team1Won ? ps.win : ps.loss,
      team2Points: team1Won ? ps.loss : ps.win,
    };
  };

  // Utility function for RPA points calculation
  // eslint-disable-next-line no-unused-vars
  const calculateRPAPoints = (match, team1, team2, tournament) => {
    if (!match.winnerId || !team1 || !team2) {
      return { team1RPA: 0, team2RPA: 0 };
    }

    // Get ranking from players
    const pickTwoRatings = (team, fallback = 1500) => {
      const players = Array.isArray(team?.players) ? team.players : [];
      const ratings = players
        .map((p) => (typeof p?.ranking === 'number' ? Number(p.ranking) : fallback))
        .slice(0, 2);
      while (ratings.length < 2) ratings.push(fallback);
      return ratings;
    };

    const toABSets = (sets) => {
      if (!Array.isArray(sets)) return [];
      return sets.map((s) => ({ a: Number(s?.team1 || 0), b: Number(s?.team2 || 0) }));
    };

    const multiplier = Number(tournament?.configuration?.championshipPoints?.rpaMultiplier ?? 1);
    const fallbackRanking = Number(
      tournament?.configuration?.defaultRankingForNonParticipants ?? 1500
    );

    const [rA1, rA2] = pickTwoRatings(team1, fallbackRanking);
    const [rB1, rB2] = pickTwoRatings(team2, fallbackRanking);
    const rr = computeFromSets(toABSets(match.sets || []));

    const winnerIsA = match.winnerId === match.team1Id ? 'A' : 'B';
    const res = calcParisDelta({
      ratingA1: rA1,
      ratingA2: rA2,
      ratingB1: rB1,
      ratingB2: rB2,
      gamesA: rr.gamesA,
      gamesB: rr.gamesB,
      winner: winnerIsA,
      sets: toABSets(match.sets || []),
    });

    const pts = Math.max(0, Number(res?.pts || 0));
    const rpaPoints = pts * multiplier;

    return {
      team1RPA: match.winnerId === match.team1Id ? Math.round(rpaPoints) : -Math.round(rpaPoints),
      team2RPA: match.winnerId === match.team2Id ? Math.round(rpaPoints) : -Math.round(rpaPoints),
    };
  };

  const handleShowRPAFormula = (match, team1, team2) => {
    if (!match.winnerId || !team1 || !team2) return;

    const pickTwoRatings = (team, fallback = 1500) => {
      const players = Array.isArray(team?.players) ? team.players : [];
      const ratings = players
        .map((p) => (typeof p?.ranking === 'number' ? Number(p.ranking) : fallback))
        .slice(0, 2);
      while (ratings.length < 2) ratings.push(fallback);
      return ratings;
    };

    const toABSets = (sets) => {
      if (!Array.isArray(sets)) return [];
      return sets.map((s) => ({ a: Number(s?.team1 || 0), b: Number(s?.team2 || 0) }));
    };

    const multiplier = Number(tournament?.configuration?.championshipPoints?.rpaMultiplier ?? 1);
    const fallbackRanking = Number(
      tournament?.configuration?.defaultRankingForNonParticipants ?? 1500
    );

    const [rA1, rA2] = pickTwoRatings(team1, fallbackRanking);
    const [rB1, rB2] = pickTwoRatings(team2, fallbackRanking);

    // Get top 2 players for display
    const teamA = (Array.isArray(team1?.players) ? team1.players : []).slice(0, 2).map((p) => ({
      id: p?.id || Math.random(),
      name: p?.name || '?',
      rating: p?.ranking || fallbackRanking,
    }));
    const teamB = (Array.isArray(team2?.players) ? team2.players : []).slice(0, 2).map((p) => ({
      id: p?.id || Math.random(),
      name: p?.name || '?',
      rating: p?.ranking || fallbackRanking,
    }));

    const winnerIsA = match.winnerId === match.team1Id ? 'A' : 'B';
    const rr = computeFromSets(toABSets(match.sets || []));

    // Usa calcParisDelta per ottenere i calcoli corretti
    const res = calcParisDelta({
      ratingA1: rA1,
      ratingA2: rA2,
      ratingB1: rB1,
      ratingB2: rB2,
      gamesA: rr.gamesA,
      gamesB: rr.gamesB,
      winner: winnerIsA,
      sets: toABSets(match.sets || []),
    });

    // I valori da res sono già corretti dalla formula
    const ptsBeforeMultiplier = res.pts; // Punti RPA base
    const ptsAfterMultiplier = ptsBeforeMultiplier * multiplier; // Punti finali con moltiplicatore

    const deltaA =
      match.winnerId === match.team1Id
        ? Math.round(ptsAfterMultiplier)
        : -Math.round(ptsAfterMultiplier);
    const deltaB =
      match.winnerId === match.team2Id
        ? Math.round(ptsAfterMultiplier)
        : -Math.round(ptsAfterMultiplier);

    setFormulaMatchData({
      sumA: res.sumA,
      sumB: res.sumB,
      gap: res.gap,
      base: res.base,
      gd: res.gd,
      factor: res.factor,
      pts: res.pts,
      ptsWithMultiplier: ptsAfterMultiplier,
      multiplier,
      winner: winnerIsA,
      gamesA: rr.gamesA,
      gamesB: rr.gamesB,
      sets: toABSets(match.sets || []),
      deltaA,
      deltaB,
      teamA,
      teamB,
    });
    setFormulaModalOpen(true);
  };

  const renderMatch = (match) => {
    const team1 = teams[match.team1Id];
    const team2 = teams[match.team2Id];

    if (!team1 || !team2) return null;

    const isCompleted = match.status === MATCH_STATUS.COMPLETED;
    const canRecordResult = match.status !== MATCH_STATUS.COMPLETED;

    const team1Name = team1?.teamName || team1?.name || team1?.displayName || '—';
    const team2Name = team2?.teamName || team2?.name || team2?.displayName || '—';

    const getAvgRanking = (team) => {
      if (!team) return null;
      if (typeof team.averageRanking === 'number') return team.averageRanking;
      if (Array.isArray(team.players) && team.players.length) {
        const vals = team.players.map((p) => p?.ranking).filter((r) => typeof r === 'number');
        if (vals.length) return vals.reduce((a, b) => a + b, 0) / vals.length;
      }
      return null;
    };

    const team1Avg = getAvgRanking(team1);
    const team2Avg = getAvgRanking(team2);

    const hasSets = Array.isArray(match.sets) && match.sets.length > 0;

    const renderSetPills = (teamIndex) => {
      if (!hasSets) return null;
      return (
        <div className="flex items-center gap-1">
          {match.sets.map((s, i) => {
            const a = Number(s?.team1 ?? 0);
            const b = Number(s?.team2 ?? 0);
            const val = teamIndex === 1 ? a : b;
            const win = teamIndex === 1 ? a > b : b > a;
            return (
              <span
                key={`tpill-${match.id}-${teamIndex}-${i}`}
                className={`px-1.5 py-0.5 rounded text-xs ${
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
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(match.status)}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {getStatusText(match.status)}
            </span>
          </div>
          {/* Match format badge if available */}
          {match.bestOf && (
            <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {match.bestOf === 1 ? '1 set' : '2 su 3'}
            </span>
          )}
          {match.courtNumber && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Campo {match.courtNumber}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <span
                className={`font-medium ${isCompleted && match.winnerId === team1.id ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}
              >
                {team1Name}
              </span>
              {typeof team1Avg === 'number' && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  • {Math.round(team1Avg)}
                </span>
              )}
              {team1.seed && (
                <span className="text-xs text-gray-500 dark:text-gray-400">(#{team1.seed})</span>
              )}
            </div>
            {isCompleted && (
              <div className="flex items-center gap-3">
                {hasSets
                  ? renderSetPills(1)
                  : match.score && (
                      <span
                        className={`text-2xl font-bold ${match.winnerId === team1.id ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}
                      >
                        {match.score.team1}
                      </span>
                    )}
                <button
                  onClick={() => handleShowRPAFormula(match, team1, team2)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Visualizza formula RPA"
                >
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span className="text-xs text-gray-400 dark:text-gray-600 font-medium">VS</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <span
                className={`font-medium ${isCompleted && match.winnerId === team2.id ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}
              >
                {team2Name}
              </span>
              {typeof team2Avg === 'number' && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  • {Math.round(team2Avg)}
                </span>
              )}
              {team2.seed && (
                <span className="text-xs text-gray-500 dark:text-gray-400">(#{team2.seed})</span>
              )}
            </div>
            {isCompleted && (
              <div className="flex items-center gap-3">
                {hasSets
                  ? renderSetPills(2)
                  : match.score && (
                      <span
                        className={`text-2xl font-bold ${match.winnerId === team2.id ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}
                      >
                        {match.score.team2}
                      </span>
                    )}
                <button
                  onClick={() => handleShowRPAFormula(match, team1, team2)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Visualizza formula RPA"
                >
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lower set summary removed to avoid duplication since per-set pills are shown next to team rows */}

        {canRecordResult && (
          <button
            onClick={() => canEditResults && setSelectedMatch(match)}
            disabled={!canEditResults}
            className="w-full mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Inserisci Risultato
          </button>
        )}

        {isCompleted && (
          <button
            onClick={() => canEditResults && setSelectedMatch(match)}
            disabled={!canEditResults}
            className="w-full mt-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Modifica Risultato
          </button>
        )}

        {match.scheduledDate && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(match.scheduledDate.seconds * 1000).toLocaleString('it-IT', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        )}
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

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nessuna Partita</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Le partite verranno generate dopo la chiusura delle iscrizioni
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        {['all', 'scheduled', 'in-progress', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {f === 'all'
              ? 'Tutte'
              : f === 'scheduled'
                ? 'Programmate'
                : f === 'in-progress'
                  ? 'In Corso'
                  : 'Completate'}
          </button>
        ))}
      </div>

      {Object.keys(groupedMatches.groups).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gironi</h3>
          {sortedGroupKeys.map((groupId) => {
            const groupMatches = groupedMatches.groups[groupId];
            const filteredMatches = groupMatches.filter(filterMatch);
            if (filteredMatches.length === 0) return null;

            const isExpanded = expandedGroups[groupId] !== false;

            return (
              <div
                key={groupId}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleGroup(groupId)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {groupId === 'ungrouped' ? 'Senza Girone' : `Girone ${groupId}`}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({filteredMatches.length} partite)
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMatches.map(renderMatch)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {Object.keys(groupedMatches.knockout).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Eliminazione Diretta
          </h3>
          {sortedKnockoutKeys.map((round) => {
            const roundMatches = groupedMatches.knockout[round];
            const filteredMatches = roundMatches.filter(filterMatch);
            if (filteredMatches.length === 0) return null;

            return (
              <div key={round} className="space-y-3">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">{round}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMatches.map(renderMatch)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedMatch && (
        <MatchResultModal
          match={selectedMatch}
          team1={teams[selectedMatch.team1Id]}
          team2={teams[selectedMatch.team2Id]}
          onClose={() => setSelectedMatch(null)}
          onSubmit={handleRecordResult}
        />
      )}

      {formulaModalOpen && (
        <FormulaModal
          isOpen={formulaModalOpen}
          onClose={() => {
            setFormulaModalOpen(false);
            setFormulaMatchData(null);
          }}
          matchData={formulaMatchData}
        />
      )}
    </div>
  );
}

export default TournamentMatches;
