/**
 * Tournament Overview - Main information and actions for a tournament
 */

import React, { useEffect, useState } from 'react';
import { Calendar, Users, Trophy, Play, Pause, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { useAuth, USER_ROLES } from '@contexts/AuthContext.jsx';
import {
  updateTournamentStatus,
  deleteTournament,
  autoGenerateGroups,
  generateGroupStageMatches,
} from '../../services/tournamentService.js';
import { updateStandingsAfterMatch } from '../../services/standingsService.js';
import TournamentEditModal from './TournamentEditModal.jsx';
import { createWorkflowManager } from '../../services/tournamentWorkflow.js';
import KnockoutSetupModal from '../knockout/KnockoutSetupModal.jsx';
import PublicViewSettings from '../admin/PublicViewSettings.jsx';
import { rollbackToPreviousPhase } from '../../services/tournamentTransactions.js';
import {
  TOURNAMENT_STATUS,
  TOURNAMENT_FORMAT,
  DEFAULT_STANDARD_POINTS,
  DEFAULT_RANKING_BASED_POINTS,
} from '../../utils/tournamentConstants.js';
import { formatDate, formatTournamentFormat } from '../../utils/tournamentFormatters.js';
import {
  getChampionshipApplyStatus,
  revertTournamentChampionshipPoints,
} from '../../services/championshipApplyService.js';
import { db } from '@services/firebase.js';
import { collection, getDocs, query, doc, onSnapshot } from 'firebase/firestore';

function TournamentOverview({ tournament, onUpdate, clubId }) {
  const { userRole, userClubRoles } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showManualBracket, setShowManualBracket] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [applyInfo, setApplyInfo] = useState({ applied: false, appliedAt: null });
  const [reverting, setReverting] = useState(false);
  const [actualTeamsCount, setActualTeamsCount] = useState(null);
  const [completedMatches, setCompletedMatches] = useState(tournament?.completedMatches || 0);
  const [totalMatches, setTotalMatches] = useState(tournament?.totalMatches || 0);

  // Se è un utente normale, mostra la tab torneo solo in visualizzazione
  // eslint-disable-next-line no-unused-vars
  const isNormalUser = userRole === USER_ROLES.USER || userRole === USER_ROLES.INSTRUCTOR;
  // Admin is either super_admin globally or club_admin in this specific club
  // Note: club role can be either 'admin' or 'club_admin' depending on the data source
  const isAdmin =
    userRole === USER_ROLES.SUPER_ADMIN ||
    userRole === USER_ROLES.CLUB_ADMIN ||
    (clubId &&
      (userClubRoles?.[clubId] === USER_ROLES.CLUB_ADMIN || userClubRoles?.[clubId] === 'admin'));

  // Debug logs
  useEffect(() => {
    console.log('🔍 [TournamentOverview] Admin check:', {
      userRole,
      userClubRoles,
      clubId,
      'userClubRoles?.[clubId]': userClubRoles?.[clubId],
      isAdmin,
      'USER_ROLES.CLUB_ADMIN': USER_ROLES.CLUB_ADMIN,
      'USER_ROLES.SUPER_ADMIN': USER_ROLES.SUPER_ADMIN,
    });
  }, [userRole, userClubRoles, clubId, isAdmin]);

  // Load actual teams count from subcollection (fallback for missing registeredTeams field)
  useEffect(() => {
    if (!clubId || !tournament?.id) return;

    let mounted = true;

    async function loadTeamsCount() {
      try {
        const teamsRef = collection(db, 'clubs', clubId, 'tournaments', tournament.id, 'teams');
        const q = query(teamsRef);
        const snapshot = await getDocs(q);
        if (mounted) {
          setActualTeamsCount(snapshot.size);
        }
      } catch (e) {
        console.warn('Errore nel caricamento del numero di squadre:', e);
      }
    }

    loadTeamsCount();
    return () => {
      mounted = false;
    };
  }, [clubId, tournament?.id]);

  useEffect(() => {
    let mounted = true;
    async function loadApplyStatus() {
      try {
        if (!clubId || !tournament?.id) return;
        const res = await getChampionshipApplyStatus(clubId, tournament.id);
        if (!mounted) return;
        setApplyInfo({ applied: !!res.applied, appliedAt: res?.data?.appliedAt || null });
      } catch (e) {
        // best-effort: non bloccare la pagina
        console.warn('Impossibile caricare stato applicazione punti:', e);
      }
    }
    loadApplyStatus();
    return () => {
      mounted = false;
    };
  }, [clubId, tournament?.id]);

  // 📊 Monitor tournament completedMatches in real-time
  useEffect(() => {
    if (!clubId || !tournament?.id) return;

    const tournamentRef = doc(db, 'clubs', clubId, 'tournaments', tournament.id);

    const unsubscribe = onSnapshot(
      tournamentRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('📊 [TournamentOverview] Tournament snapshot updated:', {
            completedMatches: data.completedMatches,
            totalMatches: data.totalMatches,
          });
          setCompletedMatches(data.completedMatches || 0);
          setTotalMatches(data.totalMatches || 0);
        }
      },
      (error) => {
        console.warn('⚠️ [TournamentOverview] Error listening to tournament:', error);
      }
    );

    return () => unsubscribe();
  }, [clubId, tournament?.id]);

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Sei sicuro di voler cambiare lo stato in "${newStatus}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await updateTournamentStatus(clubId, tournament.id, newStatus);

      if (result.success) {
        onUpdate();
      } else {
        setError(result.error || 'Errore nel cambio stato');
      }
    } catch (err) {
      setError('Errore nel cambio stato del torneo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Sei sicuro di voler eliminare il torneo "${tournament.name}"?\n\nQuesta azione è irreversibile e eliminerà anche tutte le squadre, partite e classifiche associate.`
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await deleteTournament(clubId, tournament.id);

      if (result.success) {
        window.location.href = `/club/${clubId}/tournaments`;
      } else {
        setError(result.error || "Errore nell'eliminazione");
      }
    } catch (err) {
      setError("Errore nell'eliminazione del torneo");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevertPoints = async () => {
    if (!applyInfo.applied) {
      alert('I punti di questo torneo non risultano applicati.');
      return;
    }
    if (
      !window.confirm(
        'Annullare i punti campionato assegnati da questo torneo? Verranno sottratti dai totali dei giocatori e rimossa la voce in Statistiche.'
      )
    ) {
      return;
    }
    setReverting(true);
    setError(null);
    try {
      const res = await revertTournamentChampionshipPoints(clubId, tournament.id);
      if (res.success) {
        setApplyInfo({ applied: false, appliedAt: null });
        alert('Punti del torneo annullati con successo.');
        onUpdate?.();
      } else {
        setError(res.error || "Errore durante l'annullamento dei punti");
      }
    } catch (e) {
      console.error(e);
      setError("Errore durante l'annullamento dei punti");
    } finally {
      setReverting(false);
    }
  };

  const handleRollback = async () => {
    if (!window.confirm('Tornare alla fase precedente? (le assegnazioni rimarranno salvate)')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await rollbackToPreviousPhase(clubId, tournament.id);
      if (res.success) {
        onUpdate();
      } else {
        setError(res.error || 'Errore durante il rollback della fase');
      }
    } catch (err) {
      console.error(err);
      setError('Errore durante il rollback della fase');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateGroupMatches = async () => {
    if (!window.confirm('Generare tutte le partite della Fase a Gironi?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await generateGroupStageMatches(clubId, tournament.id);
      if (res.success) {
        onUpdate();
      } else {
        setError(res.error || 'Errore durante la generazione delle partite');
      }
    } catch (e) {
      console.error(e);
      setError('Errore durante la generazione delle partite');
    } finally {
      setLoading(false);
    }
  };

  const handleStartKnockout = async () => {
    if (
      !window.confirm(
        'Avviare la fase a eliminazione? Verrà generato automaticamente il tabellone e le partite.'
      )
    )
      return;
    setLoading(true);
    setError(null);
    try {
      const manager = createWorkflowManager(clubId, tournament.id);
      const res = await manager.startKnockoutStage();
      if (res.success) {
        onUpdate();
      } else {
        setError(res.error || "Errore durante l'avvio della fase a eliminazione");
      }
    } catch (e) {
      console.error(e);
      setError("Errore durante l'avvio della fase a eliminazione");
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateStandings = async () => {
    if (!window.confirm('Ricalcolare le classifiche dei gironi?')) return;
    setLoading(true);
    setError(null);
    try {
      let ps = DEFAULT_STANDARD_POINTS;
      if (typeof tournament.pointsSystem === 'string') {
        ps =
          tournament.pointsSystem === 'ranking_based'
            ? DEFAULT_RANKING_BASED_POINTS
            : DEFAULT_STANDARD_POINTS;
      } else if (tournament.pointsSystem && typeof tournament.pointsSystem === 'object') {
        ps = tournament.pointsSystem;
      }
      const res = await updateStandingsAfterMatch(clubId, tournament.id, ps);
      if (res.success) {
        onUpdate?.();
      } else {
        setError(res.error || 'Errore durante il ricalcolo delle classifiche');
      }
    } catch (e) {
      console.error(e);
      setError('Errore durante il ricalcolo delle classifiche');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoGenerateGroups = async () => {
    if (!window.confirm('Generare automaticamente i gironi in base al ranking?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await autoGenerateGroups(clubId, tournament.id);
      if (res.success) {
        onUpdate();
      } else {
        setError(res.error || 'Errore durante la generazione dei gironi');
      }
    } catch (e) {
      console.error(e);
      setError('Errore durante la generazione dei gironi');
    } finally {
      setLoading(false);
    }
  };

  const canOpenRegistration = tournament.status === TOURNAMENT_STATUS.DRAFT;
  const canCloseRegistration = tournament.status === TOURNAMENT_STATUS.REGISTRATION_OPEN;
  const canRollbackFromRegistrationOpen = tournament.status === TOURNAMENT_STATUS.REGISTRATION_OPEN;
  const canStart = tournament.status === TOURNAMENT_STATUS.REGISTRATION_CLOSED;
  const canRollbackFromRegistrationClosed =
    tournament.status === TOURNAMENT_STATUS.REGISTRATION_CLOSED;
  const canGenerateGroups = tournament.status === TOURNAMENT_STATUS.GROUPS_GENERATION;
  const canRollbackFromGroupsGeneration = tournament.status === TOURNAMENT_STATUS.GROUPS_GENERATION;
  const canStartKnockout = tournament.status === TOURNAMENT_STATUS.GROUPS_PHASE;
  const canRollbackFromGroups = tournament.status === TOURNAMENT_STATUS.GROUPS_PHASE;
  const canRollbackFromKnockout = tournament.status === TOURNAMENT_STATUS.KNOCKOUT_PHASE;
  // Il torneo si completa al termine della fase a eliminazione
  const canComplete = tournament.status === TOURNAMENT_STATUS.KNOCKOUT_PHASE;

  // Check if all group stage matches have results
  const allGroupMatchesCompleted = totalMatches > 0 && completedMatches === totalMatches;

  // Filtra le fasi rilevanti in base allo stato del torneo
  const activePhasesSequence = [
    { status: TOURNAMENT_STATUS.DRAFT, name: 'Bozza' },
    { status: TOURNAMENT_STATUS.REGISTRATION_OPEN, name: 'Iscrizioni' },
    { status: TOURNAMENT_STATUS.GROUPS_GENERATION, name: 'Generazione Gironi' },
    { status: TOURNAMENT_STATUS.GROUPS_PHASE, name: 'Fase a Gironi' },
    { status: TOURNAMENT_STATUS.KNOCKOUT_PHASE, name: 'Fase a Eliminazione' },
    { status: TOURNAMENT_STATUS.COMPLETED, name: 'Completato' },
  ];

  // Trova l'indice della fase attuale
  const currentPhaseIndex = activePhasesSequence.findIndex((p) => p.status === tournament.status);

  // Calcola maxTeams se non è disponibile nel documento (tornei creati prima dell'aggiornamento)
  const getMaxTeams = () => {
    if (tournament.maxTeams) return tournament.maxTeams;
    // Fallback: calcola basato su numberOfGroups e teamsPerGroup (sistema rigido)
    const numberOfGroups =
      tournament.configuration?.numberOfGroups || tournament.groupsConfig?.numberOfGroups || 4;
    const teamsPerGroup =
      tournament.configuration?.teamsPerGroup || tournament.groupsConfig?.teamsPerGroup || 4;
    return numberOfGroups * teamsPerGroup; // Sistema rigido: max = min
  };

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Tournament Progress Indicator */}
      {currentPhaseIndex >= 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                {currentPhaseIndex + 1} / {activePhasesSequence.length}{' '}
                {activePhasesSequence[currentPhaseIndex].name}
              </div>
              <div className="flex gap-1">
                {activePhasesSequence.map((phase, index) => (
                  <div
                    key={phase.status}
                    className={`flex-1 h-1.5 rounded-full transition-all ${
                      index < currentPhaseIndex
                        ? 'bg-green-500'
                        : index === currentPhaseIndex
                          ? 'bg-blue-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Squadre</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {actualTeamsCount !== null ? actualTeamsCount : tournament.registeredTeams || 0} /{' '}
                {getMaxTeams()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Partite</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {tournament.totalMatches || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Formato</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {formatTournamentFormat(tournament.format)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <CheckCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completate</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {completedMatches || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tournament Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Informazioni Torneo
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome</label>
              <p className="text-gray-900 dark:text-white">{tournament.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Formato
              </label>
              <p className="text-gray-900 dark:text-white">
                {formatTournamentFormat(tournament.format)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Data Inizio
              </label>
              <p className="text-gray-900 dark:text-white">{formatDate(tournament.startDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Data Fine
              </label>
              <p className="text-gray-900 dark:text-white">{formatDate(tournament.endDate)}</p>
            </div>
          </div>

          {tournament.description && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Descrizione
              </label>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {tournament.description}
              </p>
            </div>
          )}

          {/* Configuration Details */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Configurazione
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {tournament.format === TOURNAMENT_FORMAT.GROUPS && (
                <>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Numero Gironi:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {tournament.groupsConfig?.numberOfGroups || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Squadre per Girone:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {tournament.groupsConfig?.teamsPerGroup || 'N/A'}
                    </span>
                  </div>
                </>
              )}
              <div>
                <span className="text-gray-500 dark:text-gray-400">Sistema Punti:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {tournament.pointsSystem === 'standard'
                    ? 'Standard (3-1-0)'
                    : 'Basato su Ranking'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Public View Settings - Only for admins */}
      {isAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4">
            <PublicViewSettings tournament={tournament} clubId={clubId} onUpdate={onUpdate} />
          </div>
        </div>
      )}

      {/* Actions */}
      {console.log('🎬 [Actions Section] isAdmin:', isAdmin) ||
        (isAdmin && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Azioni</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-3">
                {canOpenRegistration && (
                  <button
                    onClick={() => handleStatusChange(TOURNAMENT_STATUS.REGISTRATION_OPEN)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4" />
                    Apri Iscrizioni
                  </button>
                )}

                {canCloseRegistration && (
                  <button
                    onClick={() => handleStatusChange(TOURNAMENT_STATUS.REGISTRATION_CLOSED)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Pause className="w-4 h-4" />
                    Chiudi Iscrizioni
                  </button>
                )}

                {canStart && (
                  <button
                    // Avvio torneo: dalla chiusura iscrizioni si passa a generazione gironi
                    onClick={() => handleStatusChange(TOURNAMENT_STATUS.GROUPS_GENERATION)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4" />
                    Avvia Torneo
                  </button>
                )}

                {canGenerateGroups && (
                  <>
                    <button
                      onClick={handleAutoGenerateGroups}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-4 h-4" />
                      Genera Gironi (Ranking)
                    </button>
                    <div className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 px-2">
                      oppure
                    </div>
                    <a
                      href="#teams"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Vai nella tab "Squadre" per assegnare manualmente i gironi.');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Assegna Gironi Manualmente
                    </a>
                  </>
                )}

                {canStartKnockout && (
                  <>
                    <button
                      onClick={handleGenerateGroupMatches}
                      disabled={loading || totalMatches > 0}
                      title={
                        totalMatches > 0
                          ? 'Le partite sono già state generate'
                          : 'Genera automaticamente tutte le partite'
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Genera Partite Gironi
                    </button>

                    {allGroupMatchesCompleted && (
                      <>
                        <div className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 px-2">
                          Tutti i risultati inseriti - Genera tabellone:
                        </div>
                        <button
                          onClick={handleStartKnockout}
                          disabled={loading}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Genera automaticamente il tabellone a eliminazione diretta"
                        >
                          Genera Tabellone Automatico
                        </button>
                        <button
                          onClick={() => setShowManualBracket(true)}
                          disabled={loading}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Configura manualmente il tabellone a eliminazione diretta"
                        >
                          Genera Tabellone Manuale
                        </button>
                      </>
                    )}
                    {!allGroupMatchesCompleted && tournament.totalMatches > 0 && (
                      <div className="inline-flex items-center text-sm text-amber-600 dark:text-amber-400 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        ⏳ Inserisci i risultati di tutte le partite ({completedMatches}/
                        {totalMatches}) per sbloccare il tabellone
                      </div>
                    )}
                    {/* Rimosso in fase Gironi: Ricalcola Classifiche / Configura Tabellone Manuale / Inizia Fase a Eliminazione */}
                  </>
                )}

                {/* Ricalcolo disponibile anche in fase KO per aggiornare le classifiche di girone salvate */}
                {tournament.status === TOURNAMENT_STATUS.KNOCKOUT_PHASE && (
                  <button
                    onClick={handleRecalculateStandings}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ricalcola Classifiche
                  </button>
                )}

                {(canRollbackFromRegistrationOpen ||
                  canRollbackFromRegistrationClosed ||
                  canRollbackFromGroupsGeneration ||
                  canRollbackFromGroups ||
                  canRollbackFromKnockout) && (
                  <button
                    onClick={handleRollback}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Torna alla fase precedente"
                  >
                    ↩ Torna Indietro
                  </button>
                )}

                {canComplete && (
                  <button
                    onClick={() => handleStatusChange(TOURNAMENT_STATUS.COMPLETED)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Completa Torneo
                  </button>
                )}

                <button
                  onClick={() => setShowEditModal(true)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Edit className="w-4 h-4" />
                  Modifica
                </button>

                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Elimina Torneo
                </button>

                {/* Pulsante annulla punti campionato */}
                <button
                  onClick={handleRevertPoints}
                  disabled={reverting || loading || !applyInfo.applied}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${applyInfo.applied ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  title={
                    applyInfo.applied
                      ? 'Annulla i punti campionato applicati da questo torneo'
                      : 'Punti non applicati'
                  }
                >
                  Annulla Punti Campionato
                </button>
              </div>
            </div>
          </div>
        ))}
      {showManualBracket && (
        <KnockoutSetupModal
          clubId={clubId}
          tournament={tournament}
          onClose={() => setShowManualBracket(false)}
          onComplete={onUpdate}
        />
      )}
      {showEditModal && (
        <TournamentEditModal
          clubId={clubId}
          tournament={tournament}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            setShowEditModal(false);
            onUpdate?.();
          }}
        />
      )}
    </div>
  );
}

export default TournamentOverview;
