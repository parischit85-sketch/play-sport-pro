import { useState, useEffect } from 'react';
import { getStandings } from '../../services/standingsService.js';
import { subscribeGroupStandings, subscribeAllStandings } from '../../services/tournamentRealtime.js';

const StandingsTable = ({ clubId, tournamentId, groupId = null, showAllGroups = false }) => {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false); // Indica se usa real-time

  useEffect(() => {
    let unsubscribe = null;

    // ✅ USE REAL-TIME: Subscribe to live updates
    if (groupId && !showAllGroups) {
      // Single group subscription
      console.log('🔴 [StandingsTable] Subscribing to group:', groupId);
      setIsLive(true);

      unsubscribe = subscribeGroupStandings(clubId, tournamentId, groupId, (result) => {
        setLoading(false);
        if (result.success) {
          setStandings(result.standings || []);
          setError(null);
        } else {
          setError(result.error);
        }
      });
    } else if (showAllGroups) {
      // All groups subscription
      console.log('🔴 [StandingsTable] Subscribing to all standings');
      setIsLive(true);

      unsubscribe = subscribeAllStandings(clubId, tournamentId, (result) => {
        setLoading(false);
        if (result.success) {
          // Flatten all groups' teams
          const allTeams = result.standings.flatMap((group) => group.teams || []);
          setStandings(allTeams);
          setError(null);
        } else {
          setError(result.error);
        }
      });
    } else {
      // Fallback to one-time fetch if no specific subscription needed
      console.log('📊 [StandingsTable] Loading standings (one-time)');
      setIsLive(false);
      loadStandings();
    }

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        console.log('🔴 [StandingsTable] Unsubscribing from standings');
        unsubscribe();
      }
    };
  }, [clubId, tournamentId, groupId, showAllGroups]);

  const loadStandings = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getStandings(clubId, tournamentId, groupId);

      if (result.success) {
        setStandings(result.standings || []);
      } else {
        setError(result.error || 'Errore durante il caricamento della classifica');
      }
    } catch (err) {
      console.error('Error loading standings:', err);
      setError('Errore imprevisto durante il caricamento');
    } finally {
      setLoading(false);
    }
  };

  // Group standings by group if showing all groups
  const groupedStandings = showAllGroups
    ? standings.reduce((acc, team) => {
        const group = team.groupId || 'Generale';
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(team);
        return acc;
      }, {})
    : { [groupId || 'Generale']: standings };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (standings.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Nessun dato disponibile. I risultati delle partite aggiorneranno automaticamente la classifica.
        </p>
      </div>
    );
  }

  const renderStandingsTable = (teams, groupName) => (
    <div key={groupName} className="mb-6 last:mb-0">
      {showAllGroups && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{groupName}</h3>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pos
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Squadra
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                G
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                V
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                P
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                S+
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                S-
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Diff
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">
                Punti
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {teams.map((team, index) => (
              <tr
                key={team.teamId}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  team.qualified ? 'bg-green-50 dark:bg-green-900/20' : ''
                }`}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`text-sm font-semibold ${
                      index === 0
                        ? 'text-yellow-600 dark:text-yellow-500'
                        : team.qualified
                          ? 'text-green-600 dark:text-green-500'
                          : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {team.position || index + 1}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{team.teamName}</span>
                    {team.qualified && (
                      <span className="ml-2 text-xs text-green-600 dark:text-green-500">✓</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span className="text-sm text-gray-900 dark:text-white">{team.played || 0}</span>
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span className="text-sm text-gray-900 dark:text-white">{team.won || 0}</span>
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span className="text-sm text-gray-900 dark:text-white">{team.lost || 0}</span>
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span className="text-sm text-gray-900 dark:text-white">{team.setsWon || 0}</span>
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span className="text-sm text-gray-900 dark:text-white">{team.setsLost || 0}</span>
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span
                    className={`text-sm font-medium ${
                      (team.setsDifference || 0) > 0
                        ? 'text-green-600 dark:text-green-500'
                        : (team.setsDifference || 0) < 0
                          ? 'text-red-600 dark:text-red-500'
                          : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {(team.setsDifference || 0) > 0 ? '+' : ''}
                    {team.setsDifference || 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{team.points || 0}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend for qualified teams */}
      {teams.some((t) => t.qualified) && (
        <div className="mt-2 flex items-center text-xs text-gray-600 dark:text-gray-400">
          <span className="inline-block w-3 h-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded mr-2"></span>
          <span>Squadra qualificata alla fase successiva</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Classifica</h2>
          {isLive && (
            <div className="flex items-center gap-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-green-700 dark:text-green-300">LIVE</span>
            </div>
          )}
        </div>
        <button
          onClick={loadStandings}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          title="Aggiorna classifica"
          disabled={isLive}
        >
          ↻ {isLive ? 'Auto-aggiornamento' : 'Aggiorna'}
        </button>
      </div>

      {Object.entries(groupedStandings).map(([groupName, teams]) => renderStandingsTable(teams, groupName))}

      {/* Info Footer */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-400">
          <strong>Legenda:</strong> G = Partite Giocate, V = Vinte, P = Perse, S+ = Set Vinti, S- = Set Persi, Diff =
          Differenza Set
        </p>
      </div>
    </div>
  );
};

export default StandingsTable;
