import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext.jsx';
import {
  TournamentWorkflowManager,
  canAdvanceTournament,
} from '../../services/tournamentWorkflow.js';
import { canAdvancePhase, canViewAdminFeatures } from '../../services/tournamentAuth.js';
import { TOURNAMENT_STATUS } from '../../constants/tournamentConstants.js';

const TournamentAdminPanel = ({ clubId, tournament, onUpdate }) => {
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [canAdvance, setCanAdvance] = useState(false);
  const [advanceInfo, setAdvanceInfo] = useState(null);
  const [error, setError] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkAuthorization();
    checkCanAdvance();
  }, [tournament]);

  const checkAuthorization = async () => {
    if (!user?.uid) {
      setAuthorized(false);
      setAuthError('Devi effettuare il login');
      return;
    }

    const authResult = await canViewAdminFeatures(user.uid, clubId, userRole);
    setAuthorized(authResult.authorized);
    if (!authResult.authorized) {
      setAuthError(authResult.reason);
    }
  };

  const checkCanAdvance = async () => {
    try {
      const result = await canAdvanceTournament(clubId, tournament.id);
      setCanAdvance(result.canAdvance);
      setAdvanceInfo(result);
    } catch (err) {
      console.error('Error checking advancement:', err);
    }
  };

  const handleAdvancePhase = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check authorization first
      const authCheck = await canAdvancePhase(user.uid, clubId, tournament.id, userRole);
      if (!authCheck.authorized) {
        setError(authCheck.reason || 'Non autorizzato');
        return;
      }

      const workflow = new TournamentWorkflowManager(clubId, tournament.id);
      await workflow.checkAndAdvancePhase();

      if (onUpdate) {
        await onUpdate();
      }

      await checkCanAdvance();
    } catch (err) {
      console.error('Error advancing phase:', err);
      setError(err.message || 'Errore durante avanzamento fase');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateGroups = async () => {
    try {
      setLoading(true);
      setError(null);

      const workflow = new TournamentWorkflowManager(clubId, tournament.id);
      await workflow.startGroupStage(tournament);

      if (onUpdate) {
        await onUpdate();
      }
    } catch (err) {
      console.error('Error generating groups:', err);
      setError(err.message || 'Errore durante generazione gironi');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBracket = async () => {
    try {
      setLoading(true);
      setError(null);

      const workflow = new TournamentWorkflowManager(clubId, tournament.id);
      await workflow.startKnockoutStage(tournament);

      if (onUpdate) {
        await onUpdate();
      }
    } catch (err) {
      console.error('Error generating bracket:', err);
      setError(err.message || 'Errore durante generazione tabellone');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      [TOURNAMENT_STATUS.DRAFT]: {
        label: 'Bozza',
        color: 'bg-gray-500',
        description: 'Il torneo è in fase di creazione',
      },
      [TOURNAMENT_STATUS.REGISTRATION_OPEN]: {
        label: 'Registrazioni Aperte',
        color: 'bg-blue-500',
        description: 'Le squadre possono registrarsi',
      },
      [TOURNAMENT_STATUS.REGISTRATION_CLOSED]: {
        label: 'Registrazioni Chiuse',
        color: 'bg-yellow-500',
        description: 'Pronto per iniziare la fase a gironi',
      },
      [TOURNAMENT_STATUS.GROUP_STAGE]: {
        label: 'Fase a Gironi',
        color: 'bg-purple-500',
        description: 'Partite di gruppo in corso',
      },
      [TOURNAMENT_STATUS.KNOCKOUT_STAGE]: {
        label: 'Fase Eliminatoria',
        color: 'bg-orange-500',
        description: 'Partite eliminatorie in corso',
      },
      [TOURNAMENT_STATUS.COMPLETED]: {
        label: 'Completato',
        color: 'bg-green-500',
        description: 'Torneo terminato',
      },
    };

    return statusMap[status] || { label: status, color: 'bg-gray-500', description: '' };
  };

  const statusInfo = getStatusInfo(tournament.status);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Pannello Amministrazione Torneo</h2>

      {/* Current Status */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Stato Attuale</h3>
        <div className="flex items-center space-x-3">
          <span
            className={`px-3 py-1 rounded-full text-white text-sm font-medium ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
          <span className="text-sm text-gray-400">{statusInfo.description}</span>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Progresso</h3>
        <div className="space-y-2">
          {Object.values(TOURNAMENT_STATUS).map((status, index) => {
            const currentIndex = Object.values(TOURNAMENT_STATUS).indexOf(tournament.status);
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={status} className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-600 text-gray-400'
                  }`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span
                  className={`text-sm ${isCurrent ? 'font-semibold text-white' : 'text-gray-400'}`}
                >
                  {getStatusInfo(status).label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advancement Info */}
      {advanceInfo && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Informazioni Avanzamento</h3>
          <div className="space-y-1 text-sm text-gray-400">
            {advanceInfo.canAdvance ? (
              <>
                <p className="text-green-400 font-medium">✓ Puoi avanzare alla prossima fase</p>
                <p>Prossima fase: {getStatusInfo(advanceInfo.nextStatus).label}</p>
              </>
            ) : (
              <>
                <p className="text-yellow-400 font-medium">⚠ Non ancora pronto</p>
                <p>{advanceInfo.message || 'Completa tutte le partite prima di avanzare'}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Advance Phase */}
        {canAdvance && tournament.status !== TOURNAMENT_STATUS.COMPLETED && (
          <button
            onClick={handleAdvancePhase}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
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
                Elaborazione...
              </span>
            ) : (
              'Avanza alla Prossima Fase'
            )}
          </button>
        )}

        {/* Manual Actions for Specific Phases */}
        {tournament.status === TOURNAMENT_STATUS.REGISTRATION_CLOSED && (
          <button
            onClick={handleGenerateGroups}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Genera Gironi Manualmente
          </button>
        )}

        {tournament.status === TOURNAMENT_STATUS.GROUP_STAGE && (
          <button
            onClick={handleGenerateBracket}
            disabled={loading || !canAdvance}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Genera Tabellone Eliminatorio
          </button>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
        <h4 className="text-sm font-medium text-blue-300 mb-2">💡 Suggerimento</h4>
        <p className="text-xs text-blue-400">
          {tournament.status === TOURNAMENT_STATUS.REGISTRATION_OPEN &&
            "Quando tutte le squadre sono registrate, clicca 'Avanza alla Prossima Fase' per chiudere le registrazioni."}
          {tournament.status === TOURNAMENT_STATUS.REGISTRATION_CLOSED &&
            'I gironi verranno generati automaticamente quando avanzi alla fase successiva.'}
          {tournament.status === TOURNAMENT_STATUS.GROUP_STAGE &&
            'Inserisci i risultati di tutte le partite dei gironi. Le classifiche si aggiorneranno automaticamente.'}
          {tournament.status === TOURNAMENT_STATUS.KNOCKOUT_STAGE &&
            'Inserisci i risultati delle partite eliminatorie. I vincitori avanzeranno automaticamente.'}
          {tournament.status === TOURNAMENT_STATUS.COMPLETED && 'Il torneo è completato! 🏆'}
        </p>
      </div>
    </div>
  );
};

export default TournamentAdminPanel;
