/**
 * Tournaments Page - Main tournament management interface
 * Entry point for tournament system in club admin dashboard
 *
 * @param {Object} props - Component props
 * @param {string} props.clubId - Club ID for tournament management
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trophy, Users, Calendar, Filter, Trash2 } from 'lucide-react';
import { getTournaments } from '../services/tournamentService';
import TournamentList from './dashboard/TournamentList';
import TournamentWizard from './creation/TournamentWizard';
import TournamentTrash from './dashboard/TournamentTrash';
import { TOURNAMENT_STATUS } from '../utils/tournamentConstants';

function TournamentsPage({ clubId, isAdmin = false }) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [filterStatus, setFilterStatus] = useState('active');

  const loadTournaments = async () => {
    setLoading(true);
    try {
      const options = {};

      // Per 'completati' e 'bozze' usiamo il filtro lato query, per 'in corso' filtriamo client-side
      if (filterStatus === TOURNAMENT_STATUS.COMPLETED) {
        options.status = TOURNAMENT_STATUS.COMPLETED;
      } else if (isAdmin && filterStatus === TOURNAMENT_STATUS.DRAFT) {
        options.status = TOURNAMENT_STATUS.DRAFT;
      }

      const data = await getTournaments(clubId, options);

      // Filtra client-side per 'in corso'
      const activeStatuses = [
        TOURNAMENT_STATUS.REGISTRATION_OPEN,
        TOURNAMENT_STATUS.REGISTRATION_CLOSED,
        TOURNAMENT_STATUS.GROUPS_GENERATION,
        TOURNAMENT_STATUS.GROUPS_PHASE,
        TOURNAMENT_STATUS.KNOCKOUT_PHASE,
      ];

      const visible =
        filterStatus === 'active' ? data.filter((t) => activeStatuses.includes(t.status)) : data;

      setTournaments(visible);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) {
      loadTournaments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId, filterStatus]);

  const handleCreateTournament = () => {
    setShowWizard(true);
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
    loadTournaments();
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
  };

  const stats = {
    total: tournaments.length,
    active: tournaments.filter((t) =>
      [
        TOURNAMENT_STATUS.REGISTRATION_OPEN,
        TOURNAMENT_STATUS.REGISTRATION_CLOSED,
        TOURNAMENT_STATUS.GROUPS_GENERATION,
        TOURNAMENT_STATUS.GROUPS_PHASE,
        TOURNAMENT_STATUS.KNOCKOUT_PHASE,
      ].includes(t.status)
    ).length,
    completed: tournaments.filter((t) => t.status === TOURNAMENT_STATUS.COMPLETED).length,
    draft: tournaments.filter((t) => t.status === TOURNAMENT_STATUS.DRAFT).length,
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 flex items-center gap-2">
            <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-primary-400" />
            Tornei
          </h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">
            Gestisci i tornei del tuo circolo
          </p>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowTrash(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Cestino
            </button>
            <button
              onClick={handleCreateTournament}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuovo Torneo
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Totale Tornei</p>
              <p className="text-xl md:text-2xl font-bold text-gray-100 mt-1">{stats.total}</p>
            </div>
            <Trophy className="w-7 h-7 md:w-8 md:h-8 text-gray-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">In Corso</p>
              <p className="text-xl md:text-2xl font-bold text-blue-400 mt-1">{stats.active}</p>
            </div>
            <Calendar className="w-7 h-7 md:w-8 md:h-8 text-blue-300" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Completati</p>
              <p className="text-xl md:text-2xl font-bold text-green-400 mt-1">{stats.completed}</p>
            </div>
            <Trophy className="w-7 h-7 md:w-8 md:h-8 text-green-300" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Bozze</p>
              <p className="text-xl md:text-2xl font-bold text-gray-300 mt-1">{stats.draft}</p>
            </div>
            <Users className="w-7 h-7 md:w-8 md:h-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-700">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2 text-gray-300">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm">Filtri</span>
          </div>
          <div className="flex gap-2 overflow-x-auto -mx-2 px-2">
            <button
              aria-label="Filtra in corso"
              onClick={() => setFilterStatus('active')}
              className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'active'
                  ? 'bg-blue-900/30 text-blue-300'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              In Corso
            </button>
            <button
              aria-label="Filtra completati"
              onClick={() => setFilterStatus(TOURNAMENT_STATUS.COMPLETED)}
              className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === TOURNAMENT_STATUS.COMPLETED
                  ? 'bg-green-900/30 text-green-300'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Completati
            </button>
            {isAdmin && (
              <button
                aria-label="Filtra bozze"
                onClick={() => setFilterStatus(TOURNAMENT_STATUS.DRAFT)}
                className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === TOURNAMENT_STATUS.DRAFT
                    ? 'bg-gray-700 text-gray-200'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Bozze
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tournament List */}
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
        {loading ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-400 mt-4">Caricamento tornei...</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Trophy className="w-14 h-14 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-100 mb-2">
              {filterStatus === 'all' ? 'Nessun torneo creato' : 'Nessun torneo trovato'}
            </h3>
            <p className="text-sm sm:text-base text-gray-400 mb-6">
              {filterStatus === 'all'
                ? 'Inizia creando il tuo primo torneo'
                : 'Prova a cambiare i filtri di ricerca'}
            </p>
            {isAdmin && filterStatus === 'all' && (
              <button
                onClick={handleCreateTournament}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Crea Primo Torneo
              </button>
            )}
          </div>
        ) : (
          <TournamentList tournaments={tournaments} onRefresh={loadTournaments} />
        )}
      </div>

      {/* Tournament Wizard Modal */}
      {showWizard && (
        <TournamentWizard
          clubId={clubId}
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
        />
      )}

      {/* Tournament Trash Modal */}
      {showTrash && <TournamentTrash clubId={clubId} onClose={() => setShowTrash(false)} />}
    </div>
  );
}

export default TournamentsPage;
