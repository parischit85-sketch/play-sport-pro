/**
 * Tournament Standings - Display tournament standings/rankings
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, TrendingUp, ChevronDown, ChevronUp, Medal } from 'lucide-react';
import { calculateGroupStandings } from '../../services/standingsService';
import { getTeamsByTournament } from '../../services/teamsService';
import { calculateTeamAverageRanking } from '../../utils/teamRanking.js';

function TournamentStandings({ tournament, clubId }) {
  const [standings, setStandings] = useState({});
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});

  const loadStandings = useCallback(async () => {
    setLoading(true);
    try {
      const teamsData = await getTeamsByTournament(clubId, tournament.id);
      setTeams(teamsData);

      // Mostra classifiche per tornei in fase di girone, knockout o completati
      if (
        !tournament.status ||
        !['groups_generation', 'groups_phase', 'knockout_phase', 'completed'].includes(
          tournament.status
        )
      ) {
        setStandings({});
        setLoading(false);
        return;
      }

      const groupIds = [...new Set(teamsData.map((t) => t.groupId).filter(Boolean))];

      const standingsData = {};
      for (const groupId of groupIds) {
        const groupStandings = await calculateGroupStandings(
          clubId,
          tournament.id,
          groupId,
          tournament.pointsSystem || { win: 3, draw: 1, loss: 0 }
        );
        standingsData[groupId] = groupStandings;
      }

      setStandings(standingsData);
    } catch (error) {
      console.error('Error loading standings:', error);
    } finally {
      setLoading(false);
    }
  }, [clubId, tournament.id, tournament.status, tournament.pointsSystem]);

  useEffect(() => {
    loadStandings();
  }, [loadStandings]);

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Medal className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-sm text-gray-500 dark:text-gray-400">#{rank}</span>;
    }
  };

  const renderStandingsTable = (groupId, groupStandings) => {
    // Mappa per ottenere il ranking medio da teams
    const teamsMap = {};
    teams.forEach((t) => {
      teamsMap[t.id] = t;
    });
    const getAvgRanking = (teamId) => {
      const team = teamsMap[teamId];
      if (!team) return null;
      // Use centralized utility function
      return calculateTeamAverageRanking(team, null) || null;
    };

    // Ordina le squadre per: Punti (descending), DG (descending), Punti RPA (descending), Ranking (descending)
    const sortedStandings = [...groupStandings].sort((a, b) => {
      // 1. Ordina per punti (descending)
      if (a.points !== b.points) {
        return b.points - a.points;
      }
      // 2. Ordina per differenza game (descending)
      const dgA = a.matchesWon - a.matchesLost;
      const dgB = b.matchesWon - b.matchesLost;
      if (dgA !== dgB) {
        return dgB - dgA;
      }
      // 3. Ordina per punti RPA (descending)
      const rpaA = a.rpaPoints ?? 0;
      const rpaB = b.rpaPoints ?? 0;
      if (rpaA !== rpaB) {
        return rpaB - rpaA;
      }
      // 4. Ordina per ranking medio (descending - ranking più alto è migliore)
      const rankingA = getAvgRanking(a.teamId) ?? 0;
      const rankingB = getAvgRanking(b.teamId) ?? 0;
      return rankingB - rankingA;
    });

    return (
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <div className="inline-block min-w-full align-middle px-3 sm:px-0">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-900 text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                  #
                </th>
                <th className="sticky left-8 sm:left-12 z-10 bg-gray-50 dark:bg-gray-900 text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[120px] sm:min-w-0">
                  Squadra
                </th>
                <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                  G
                </th>
                <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                  V
                </th>
                <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                  P
                </th>
                <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                  DG
                </th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Pts
                </th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                  <span className="hidden sm:inline">Pts RPA</span>
                  <span className="sm:hidden">RPA</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-800">
              {sortedStandings.map((standing, index) => {
                const rank = index + 1;
                const isQualified = rank <= (tournament.teamsPerGroup || 2);

                return (
                  <tr
                    key={standing.teamId}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      isQualified ? 'bg-green-50/50 dark:bg-green-900/10' : ''
                    }`}
                  >
                    <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 py-2 sm:py-3 px-2 sm:px-4">
                      <div className="flex items-center justify-center">{getRankIcon(rank)}</div>
                    </td>
                    <td className="sticky left-8 sm:left-12 z-10 bg-white dark:bg-gray-800 py-2 sm:py-3 px-2 sm:px-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white truncate max-w-[100px] sm:max-w-none">
                          {standing.teamName}
                        </span>
                        {(() => {
                          const avg = getAvgRanking(standing.teamId);
                          return typeof avg === 'number' ? (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                              • {Math.round(avg)}
                            </span>
                          ) : null;
                        })()}
                        {isQualified && (
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {standing.matchesPlayed}
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2 text-center text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">
                      {standing.matchesWon}
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2 text-center text-xs sm:text-sm font-medium text-red-600 dark:text-red-400">
                      {standing.matchesLost}
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2 text-center text-xs sm:text-sm">
                      <span
                        className={`font-medium ${
                          standing.matchesWon - standing.matchesLost > 0
                            ? 'text-green-600 dark:text-green-400'
                            : standing.matchesWon - standing.matchesLost < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {standing.matchesWon - standing.matchesLost > 0 ? '+' : ''}
                        {standing.matchesWon - standing.matchesLost}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                      <span className="text-base sm:text-lg font-bold text-primary-600 dark:text-primary-400">
                        {standing.points}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                      <span
                        className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${
                          standing.rpaPoints !== undefined && standing.rpaPoints !== null
                            ? standing.rpaPoints > 0
                              ? 'text-green-600 dark:text-green-400'
                              : standing.rpaPoints < 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-500 dark:text-gray-400'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {standing.rpaPoints !== undefined && standing.rpaPoints !== null
                          ? standing.rpaPoints > 0
                            ? `+${Math.round(standing.rpaPoints * 10) / 10}`
                            : Math.round(standing.rpaPoints * 10) / 10
                          : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend - Mobile Optimized */}
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div>
              <strong>G</strong> = Giocate
            </div>
            <div>
              <strong>V</strong> = Vinte
            </div>
            <div>
              <strong>P</strong> = Perse
            </div>
            <div>
              <strong>DG</strong> = Diff. Game
            </div>
            <div>
              <strong>Pts</strong> = Punti
            </div>
            <div className="col-span-2 sm:col-span-1">
              <strong className="text-orange-600 dark:text-orange-400">RPA</strong> = Punti Rating
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 dark:bg-green-900/20 rounded flex-shrink-0"></div>
              <span>Qualificate</span>
            </div>
          </div>
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

  if (Object.keys(standings).length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mx-3 sm:mx-0">
        <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2 px-4">
          Nessuna Classifica
        </h3>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 px-4">
          Le classifiche verranno calcolate dopo le prime partite completate
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile: Stack vertically, Desktop: Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {Object.entries(standings)
          .sort(([groupIdA], [groupIdB]) => groupIdA.localeCompare(groupIdB))
          .map(([groupId, groupStandings]) => {
            if (!groupStandings || groupStandings.length === 0) return null;

            const isExpanded = expandedGroups[groupId] !== false;

            return (
              <div
                key={groupId}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleGroup(groupId)}
                  className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 hover:from-primary-100 hover:to-blue-100 dark:hover:from-primary-900/30 dark:hover:to-blue-900/30 transition-colors active:scale-[0.99]"
                  aria-expanded={isExpanded}
                  aria-controls={`group-${groupId}-content`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                    <div className="text-left">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                        Girone {groupId.toUpperCase()}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {groupStandings.length} squadre
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div
                    id={`group-${groupId}-content`}
                    className="p-2 sm:p-4 bg-white dark:bg-gray-800"
                  >
                    {renderStandingsTable(groupId, groupStandings)}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Statistics - Mobile Optimized */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg p-4 sm:p-6 border border-primary-100 dark:border-primary-800">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Statistiche Generali
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-2 sm:p-0">
            <div className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
              {Object.keys(standings).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Gironi</div>
          </div>
          <div className="text-center p-2 sm:p-0">
            <div className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
              {teams.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <span className="hidden sm:inline">Squadre Totali</span>
              <span className="sm:hidden">Squadre</span>
            </div>
          </div>
          <div className="text-center p-2 sm:p-0">
            <div className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
              {Object.values(standings)
                .flat()
                .reduce((sum, s) => sum + s.matchesPlayed, 0)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <span className="hidden sm:inline">Partite Giocate</span>
              <span className="sm:hidden">Partite</span>
            </div>
          </div>
          <div className="text-center p-2 sm:p-0">
            <div className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
              {Object.values(standings)
                .flat()
                .reduce((sum, s) => sum + s.setsWon, 0)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <span className="hidden sm:inline">Set Totali</span>
              <span className="sm:hidden">Set</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TournamentStandings;
