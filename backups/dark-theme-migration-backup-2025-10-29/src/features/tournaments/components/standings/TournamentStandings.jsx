/**
 * Tournament Standings - Display tournament standings/rankings
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, TrendingUp, Medal } from 'lucide-react';
import { calculateGroupStandings } from '../../services/standingsService';
import { getTeamsByTournament } from '../../services/teamsService';
import { calculateTeamAverageRanking } from '../../utils/teamRanking.js';

function TournamentStandings({ tournament, clubId, groupFilter = null, isPublicView = false }) {
  const [standings, setStandings] = useState({});
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

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

      // Se groupFilter è specificato, carica solo quel girone
      const groupsToLoad = groupFilter ? [groupFilter] : groupIds;

      const standingsData = {};
      for (const groupId of groupsToLoad) {
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
  }, [clubId, tournament.id, tournament.status, tournament.pointsSystem, groupFilter]);

  useEffect(() => {
    loadStandings();
  }, [loadStandings]);

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
      const dgA = a.gamesDifference || 0;
      const dgB = b.gamesDifference || 0;
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

    // Public view - Card design
    if (isPublicView) {
      return (
        <div className="overflow-x-auto">
          <div className="space-y-2">
            {sortedStandings.map((standing, index) => {
              const rank = index + 1;
              const isQualified = rank <= (tournament.teamsPerGroup || 2);
              const dg = standing.gamesDifference || 0;

              return (
                <div
                  key={standing.teamId}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isQualified
                      ? 'bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 border-l-4 border-emerald-500'
                      : 'bg-gray-800/50 hover:bg-gray-800'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 flex items-center justify-center">
                    {rank <= 3 ? (
                      getRankIcon(rank)
                    ) : (
                      <span className="text-sm font-bold text-gray-400">#{rank}</span>
                    )}
                  </div>

                  {/* Team Name */}
                  <div className="flex-1 min-w-0">
                    {standing.teamName.split('/').map((playerName, idx) => (
                      <div key={idx} className="text-sm font-semibold text-white truncate">
                        {playerName.trim()}
                      </div>
                    ))}
                  </div>

                  {/* Stats Grid */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {/* Matches */}
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase">G</div>
                      <div className="text-sm font-medium text-gray-300">
                        {standing.matchesPlayed}
                      </div>
                    </div>

                    {/* Win/Loss */}
                    <div className="flex items-center gap-2">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase">V</div>
                        <div className="text-sm font-bold text-green-400">
                          {standing.matchesWon}
                        </div>
                      </div>
                      <span className="text-gray-600">-</span>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase">P</div>
                        <div className="text-sm font-bold text-red-400">{standing.matchesLost}</div>
                      </div>
                    </div>

                    {/* DG */}
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase">DG</div>
                      <div
                        className={`text-sm font-bold ${
                          dg > 0 ? 'text-green-400' : dg < 0 ? 'text-red-400' : 'text-gray-400'
                        }`}
                      >
                        {dg > 0 ? '+' : ''}
                        {dg}
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-center bg-emerald-900/50 rounded-lg px-3 py-1.5">
                      <div className="text-xs text-emerald-400 uppercase font-semibold">Pts</div>
                      <div className="text-lg font-bold text-white">{standing.points}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
              <div>
                <span className="font-semibold">G</span> = Giocate
              </div>
              <div>
                <span className="font-semibold">V</span> = Vinte
              </div>
              <div>
                <span className="font-semibold">P</span> = Perse
              </div>
              <div>
                <span className="font-semibold">DG</span> = Diff. Game
              </div>
              <div>
                <span className="font-semibold">Pts</span> = Punti
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Admin view - Classic table design
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Group Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Girone {groupId}</h3>
        </div>

        {/* Table */}
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
                            (standing.gamesDifference || 0) > 0
                              ? 'text-green-600 dark:text-green-400'
                              : (standing.gamesDifference || 0) < 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {(standing.gamesDifference || 0) > 0 ? '+' : ''}
                          {standing.gamesDifference || 0}
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
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (Object.keys(standings).length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 bg-gray-800 rounded-lg border border-gray-700 mx-3 sm:mx-0">
        <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-white mb-2 px-4">
          Nessuna Classifica
        </h3>
        <p className="text-sm sm:text-base text-gray-400 px-4">
          Le classifiche verranno calcolate dopo le prime partite completate
        </p>
      </div>
    );
  }

  // For public view: single column layout with space-y
  if (isPublicView) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {Object.entries(standings)
          .sort(([groupIdA], [groupIdB]) => groupIdA.localeCompare(groupIdB))
          .map(([groupId, groupStandings]) => {
            if (!groupStandings || groupStandings.length === 0) return null;

            return <div key={groupId}>{renderStandingsTable(groupId, groupStandings)}</div>;
          })}
      </div>
    );
  }

  // For admin view: 2 groups per row using grid
  const groupEntries = Object.entries(standings)
    .sort(([groupIdA], [groupIdB]) => groupIdA.localeCompare(groupIdB))
    .filter(([, groupStandings]) => groupStandings && groupStandings.length > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {groupEntries.map(([groupId, groupStandings]) => (
        <div key={groupId}>{renderStandingsTable(groupId, groupStandings)}</div>
      ))}
    </div>
  );
}

export default TournamentStandings;
