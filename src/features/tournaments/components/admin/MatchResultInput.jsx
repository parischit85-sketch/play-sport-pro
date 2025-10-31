import { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext.jsx';
import { recordMatchResult } from '../../services/matchService.js';
import { canSubmitMatchResults } from '../../services/tournamentAuth.js';
import { optimisticManager } from '../../services/optimisticUpdates.js';
import { KNOCKOUT_ROUND_NAMES } from '../../utils/tournamentConstants.js';

const MatchResultInput = ({ clubId, tournamentId, match, onResultSubmitted }) => {
  const { user, userRole } = useAuth();
  const [team1Score, setTeam1Score] = useState('');
  const [team2Score, setTeam2Score] = useState('');
  const [completedDate, setCompletedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!team1Score || !team2Score) {
      setError('Inserisci i punteggi di entrambe le squadre');
      return;
    }

    const score1 = parseInt(team1Score, 10);
    const score2 = parseInt(team2Score, 10);

    if (isNaN(score1) || isNaN(score2) || score1 < 0 || score2 < 0) {
      setError('I punteggi devono essere numeri positivi');
      return;
    }

    try {
      setLoading(true);

      // Check authorization
      const authCheck = await canSubmitMatchResults(user.uid, clubId, tournamentId, userRole);
      if (!authCheck.authorized) {
        setError(authCheck.reason || 'Non autorizzato a inserire risultati');
        return;
      }

      const resultData = {
        matchId: match.id,
        score: {
          team1: score1,
          team2: score2,
        },
        completedAt: new Date(completedDate).toISOString(),
      };

      const result = await recordMatchResult(clubId, tournamentId, resultData);

      if (result.success) {
        setSuccess(true);
        setTeam1Score('');
        setTeam2Score('');

        // Notify parent component
        if (onResultSubmitted) {
          onResultSubmitted(match.id, resultData);
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Errore durante il salvataggio del risultato');
      }
    } catch (err) {
      console.error('Error submitting match result:', err);
      setError(err.message || 'Errore imprevisto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow p-4">
      {/* Match Info */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Inserisci Risultato</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300 font-medium">{match.team1Name || 'Squadra 1'}</span>
          <span className="text-gray-400 mx-2">vs</span>
          <span className="text-gray-300 font-medium">{match.team2Name || 'Squadra 2'}</span>
        </div>
        {match.groupName && <p className="text-xs text-gray-400 mt-1">Girone: {match.groupName}</p>}
        {match.round && (
          <p className="text-xs text-gray-400 mt-1">
            Turno: {KNOCKOUT_ROUND_NAMES[match.round] || match.round}
          </p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Score Inputs */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {match.team1Name || 'Squadra 1'}
            </label>
            <input
              type="number"
              min="0"
              value={team1Score}
              onChange={(e) => setTeam1Score(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              disabled={loading}
            />
          </div>

          <div className="text-center">
            <span className="text-2xl font-bold text-gray-500">:</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {match.team2Name || 'Squadra 2'}
            </label>
            <input
              type="number"
              min="0"
              value={team2Score}
              onChange={(e) => setTeam2Score(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              disabled={loading}
            />
          </div>
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Data Completamento</label>
          <input
            type="date"
            value={completedDate}
            onChange={(e) => setCompletedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-900/20 border border-green-800 rounded-lg">
            <p className="text-sm text-green-400">✓ Risultato salvato con successo!</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !team1Score || !team2Score}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Salvataggio...
            </span>
          ) : (
            'Salva Risultato'
          )}
        </button>
      </form>
    </div>
  );
};

export default MatchResultInput;
