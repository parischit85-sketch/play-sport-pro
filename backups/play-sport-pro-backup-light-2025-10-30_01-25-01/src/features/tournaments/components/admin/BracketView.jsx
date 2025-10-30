import { useState, useEffect } from 'react';
import { getMatches } from '../../services/matchService.js';
import { subscribeKnockoutBracket } from '../../services/tournamentRealtime.js';
import { KNOCKOUT_ROUND, KNOCKOUT_ROUND_NAMES } from '../../utils/tournamentConstants.js';

const BracketView = ({ clubId, tournamentId, onMatchClick }) => {
  const [knockoutMatches, setKnockoutMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(true); // Real-time by default
  const [stats, setStats] = useState({ total: 0, completed: 0 });

  useEffect(() => {
    // ✅ USE REAL-TIME: Subscribe to knockout bracket updates
    console.log('🔴 [BracketView] Subscribing to knockout bracket');

    const unsubscribe = subscribeKnockoutBracket(clubId, tournamentId, (result) => {
      setLoading(false);
      if (result.success) {
        setKnockoutMatches(result.matches || []);
        setStats({
          total: result.totalMatches || 0,
          completed: result.completedMatches || 0,
        });
        setError(null);
      } else {
        setError(result.error);
      }
    });

    // Cleanup on unmount
    return () => {
      console.log('🔴 [BracketView] Unsubscribing from knockout bracket');
      unsubscribe();
    };
  }, [clubId, tournamentId]);

  const loadKnockoutMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getMatches(clubId, tournamentId, { type: 'knockout' });

      if (result.success) {
        setKnockoutMatches(result.matches || []);
      } else {
        setError(result.error || 'Errore durante il caricamento delle partite');
      }
    } catch (err) {
      console.error('Error loading knockout matches:', err);
      setError('Errore imprevisto');
    } finally {
      setLoading(false);
    }
  };

  // Group matches by round (Italian labels)
  const matchesByRound = knockoutMatches.reduce((acc, match) => {
    const displayRound = match.roundName || KNOCKOUT_ROUND_NAMES[match.round] || 'Sconosciuto';
    if (!acc[displayRound]) {
      acc[displayRound] = [];
    }
    acc[displayRound].push(match);
    return acc;
  }, {});

  // Define round order (Italian, includes Ottavi if present)
  const roundCodesOrder = [
    KNOCKOUT_ROUND.ROUND_OF_16,
    KNOCKOUT_ROUND.QUARTER_FINALS,
    KNOCKOUT_ROUND.SEMI_FINALS,
    KNOCKOUT_ROUND.THIRD_PLACE,
    KNOCKOUT_ROUND.FINALS,
  ];
  const roundOrderNames = roundCodesOrder.map((c) => KNOCKOUT_ROUND_NAMES[c]);
  const orderedRounds = roundOrderNames
    .filter((roundName) => matchesByRound[roundName])
    .map((roundName) => ({
      name: roundName,
      matches: matchesByRound[roundName],
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
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
      <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (knockoutMatches.length === 0) {
    return (
      <div className="p-8 bg-gray-800 border border-gray-600 rounded-lg text-center">
        <p className="text-gray-400">
          Nessuna partita eliminatoria disponibile. Il tabellone verrà generato al completamento della fase a gironi.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">Tabellone Eliminatorio</h2>
          {/* ✅ LIVE Indicator */}
          {isLive && (
            <div className="flex items-center gap-2 px-2 py-1 bg-green-900/30 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-green-400">LIVE</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Stats Badge */}
          {stats.total > 0 && (
            <span className="text-sm text-gray-400">
              {stats.completed}/{stats.total} completate
            </span>
          )}
          {/* Refresh button - disabled when live */}
          <button
            onClick={loadKnockoutMatches}
            disabled={isLive}
            className={`text-sm ${
              isLive
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-blue-400 hover:underline'
            }`}
            title={isLive ? 'Auto-aggiornamento attivo' : 'Aggiorna tabellone'}
          >
            ↻ {isLive ? 'Auto-aggiornamento' : 'Aggiorna'}
          </button>
        </div>
      </div>

      {/* Bracket Grid - Horizontal Layout */}
      <div className="overflow-x-auto">
        <div className="flex space-x-8 min-w-max pb-4">
          {orderedRounds.map((round, roundIndex) => (
            <div key={round.name} className="flex flex-col space-y-4" style={{ minWidth: '280px' }}>
              {/* Round Header */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-white">{round.name}</h3>
                <p className="text-sm text-gray-400">
                  {round.matches.filter((m) => m.status === 'completed').length}/{round.matches.length} completate
                </p>
              </div>

              {/* Matches in this round */}
              <div
                className="flex flex-col justify-around flex-1 space-y-4"
                style={{
                  paddingTop: roundIndex > 0 ? `${Math.pow(2, roundIndex - 1) * 2}rem` : '0',
                }}
              >
                {round.matches.map((match) => (
                  <div
                    key={match.id}
                    onClick={() => onMatchClick && onMatchClick(match)}
                    className={`bg-gray-700 border-2 rounded-lg p-4 transition-all ${
                      match.status === 'completed'
                        ? 'border-green-600'
                        : match.status === 'scheduled'
                          ? 'border-blue-600'
                          : 'border-gray-600'
                    } ${onMatchClick ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''}`}
                  >
                    {/* Team 1 */}
                    <div
                      className={`flex items-center justify-between py-2 px-3 rounded mb-1 ${
                        match.winnerId === match.team1Id
                          ? 'bg-green-900/30 font-bold'
                          : 'bg-gray-600'
                      }`}
                    >
                      <span className="text-sm text-white truncate">
                        {match.team1Name || 'TBD'}
                        {match.winnerId === match.team1Id && ' 🏆'}
                      </span>
                      {match.status === 'completed' && (
                        Array.isArray(match.sets) && match.sets.length > 0 ? (
                          <div className="flex items-center gap-1 ml-2">
                            {match.sets.map((s, i) => {
                              const a = Number(s?.team1 ?? 0);
                              const b = Number(s?.team2 ?? 0);
                              const win = a > b;
                              return (
                                <span
                                  key={`bv-t1-${match.id}-${i}`}
                                  className={`px-1.5 py-0.5 rounded text-[10px] leading-4 ${
                                    win
                                      ? 'bg-emerald-900/30 text-emerald-300'
                                      : 'bg-gray-700 text-gray-300'
                                  }`}
                                  title={`Set ${i + 1}`}
                                >
                                  {a}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="ml-2 text-sm font-bold text-white">
                            {match.score?.team1 || 0}
                          </span>
                        )
                      )}
                    </div>

                    {/* Team 2 */}
                    <div
                      className={`flex items-center justify-between py-2 px-3 rounded ${
                        match.winnerId === match.team2Id
                          ? 'bg-green-900/30 font-bold'
                          : 'bg-gray-600'
                      }`}
                    >
                      <span className="text-sm text-white truncate">
                        {match.team2Name || 'TBD'}
                        {match.winnerId === match.team2Id && ' 🏆'}
                      </span>
                      {match.status === 'completed' && (
                        Array.isArray(match.sets) && match.sets.length > 0 ? (
                          <div className="flex items-center gap-1 ml-2">
                            {match.sets.map((s, i) => {
                              const a = Number(s?.team1 ?? 0);
                              const b = Number(s?.team2 ?? 0);
                              const win = b > a;
                              return (
                                <span
                                  key={`bv-t2-${match.id}-${i}`}
                                  className={`px-1.5 py-0.5 rounded text-[10px] leading-4 ${
                                    win
                                      ? 'bg-emerald-900/30 text-emerald-300'
                                      : 'bg-gray-700 text-gray-300'
                                  }`}
                                  title={`Set ${i + 1}`}
                                >
                                  {b}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="ml-2 text-sm font-bold text-white">
                            {match.score?.team2 || 0}
                          </span>
                        )
                      )}
                    </div>

                    {/* Match Status */}
                    <div className="mt-2 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          match.status === 'completed'
                            ? 'bg-green-900/30 text-green-400'
                            : match.status === 'scheduled'
                              ? 'bg-blue-900/30 text-blue-400'
                              : 'bg-gray-100 text-gray-800/30'
                        }`}
                      >
                        {match.status === 'completed'
                          ? 'Completata'
                          : match.status === 'scheduled'
                            ? 'Programmata'
                            : 'In attesa'}
                      </span>
                    </div>

                    {/* Match Number */}
                    <div className="mt-1 text-center">
                      <span className="text-xs text-gray-400">
                        Match #{match.matchNumber || match.id.slice(-4)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-green-500 rounded mr-2"></div>
            <span>Completata</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-blue-500 rounded mr-2"></div>
            <span>Programmata</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-gray-600 rounded mr-2"></div>
            <span>In attesa</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-900/30 rounded mr-2"></div>
            <span>Vincitore 🏆</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
        <p className="text-xs text-blue-400">
          💡 <strong>Suggerimento:</strong> Clicca su una partita per inserire il risultato o visualizzare i dettagli.
        </p>
      </div>
    </div>
  );
};

export default BracketView;

