/**
 * Tournament Standings - Display tournament standings/rankings
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, TrendingUp, ChevronDown, ChevronUp, Medal } from 'lucide-react';
import { calculateGroupStandings } from '../../services/standingsService';
import { getTeamsByTournament } from '../../services/teamsService';

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

      console.log('📊 [TournamentStandings] Teams loaded:', teamsData.length, 'teams');
      console.log(
        '📊 [TournamentStandings] Team groupIds:',
        teamsData.map((t) => ({ teamName: t.teamName, groupId: t.groupId }))
      );

      // Mostra classifiche per tornei in fase di girone, knockout o completati
      if (
        !tournament.status ||
        !['groups_generation', 'groups_phase', 'knockout_phase', 'completed'].includes(
          tournament.status
        )
      ) {
        console.log(
          '📊 [TournamentStandings] Tournament status not compatible with standings:',
          tournament.status
        );
        setStandings({});
        setLoading(false);
        return;
      }

      const groupIds = [...new Set(teamsData.map((t) => t.groupId).filter(Boolean))];
      console.log('📊 [TournamentStandings] Unique group IDs found:', groupIds);

      const standingsData = {};
      for (const groupId of groupIds) {
        const groupStandings = await calculateGroupStandings(
          clubId,
          tournament.id,
          groupId,
          tournament.pointsSystem || { win: 3, draw: 1, loss: 0 }
        );
        standingsData[groupId] = groupStandings;
        console.log(
          `📊 [TournamentStandings] Loaded standings for group ${groupId}:`,
          groupStandings.length,
          'teams'
        );
      }

      console.log('📊 [TournamentStandings] Final standings:', standingsData);
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
      if (typeof team.averageRanking === 'number') return team.averageRanking;
      if (Array.isArray(team.players) && team.players.length) {
        const vals = team.players.map((p) => p?.ranking).filter((r) => typeof r === 'number');
        if (vals.length) return vals.reduce((a, b) => a + b, 0) / vals.length;
      }
      return null;
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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                #
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Squadra
              </th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                G
              </th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                V
              </th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                P
              </th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                DG
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Pts
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-orange-600 dark:text-orange-400">
                Pts RPA
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStandings.map((standing, index) => {
              const rank = index + 1;
              const isQualified = rank <= (tournament.teamsPerGroup || 2);

              return (
                <tr
                  key={standing.teamId}
                  className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    isQualified ? 'bg-green-50 dark:bg-green-900/10' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center">{getRankIcon(rank)}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {standing.teamName}
                      </span>
                      {(() => {
                        const avg = getAvgRanking(standing.teamId);
                        return typeof avg === 'number' ? (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            • {Math.round(avg)}
                          </span>
                        ) : null;
                      })()}
                      {isQualified && <TrendingUp className="w-4 h-4 text-green-500" />}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    {standing.matchesPlayed}
                  </td>
                  <td className="py-3 px-2 text-center text-sm font-medium text-green-600 dark:text-green-400">
                    {standing.matchesWon}
                  </td>
                  <td className="py-3 px-2 text-center text-sm font-medium text-red-600 dark:text-red-400">
                    {standing.matchesLost}
                  </td>
                  <td className="py-3 px-2 text-center text-sm">
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
                  <td className="py-3 px-4 text-center">
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {standing.points}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-sm font-semibold ${
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

        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
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
              <strong>DG</strong> = Differenza Game
            </div>
            <div>
              <strong>Pts</strong> = Punti
            </div>
            <div>
              <strong className="text-orange-600 dark:text-orange-400">Pts RPA</strong> = Punti RPA
              (Rating-based)
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 dark:bg-green-900/20 rounded"></div>
              <span>Qualificate alla fase successiva</span>
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
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Nessuna Classifica
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Le classifiche verranno calcolate dopo le prime partite completate
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 hover:from-primary-100 hover:to-blue-100 dark:hover:from-primary-900/30 dark:hover:to-blue-900/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Girone {groupId.toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {groupStandings.length} squadre
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white dark:bg-gray-800">
                    {renderStandingsTable(groupId, groupStandings)}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-primary-100 dark:border-primary-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Statistiche Generali
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {Object.keys(standings).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Gironi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {teams.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Squadre Totali</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {Object.values(standings)
                .flat()
                .reduce((sum, s) => sum + s.matchesPlayed, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Partite Giocate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {Object.values(standings)
                .flat()
                .reduce((sum, s) => sum + s.setsWon, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Set Totali</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TournamentStandings;
