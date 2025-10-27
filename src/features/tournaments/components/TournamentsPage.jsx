/**
 * Tournaments Page - Main tournament management interface
 * Entry point for tournament system in club admin dashboard
 * 
 * @param {Object} props - Component props
 * @param {string} props.clubId - Club ID for tournament management
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trophy, Users, Calendar, Filter } from 'lucide-react';
import { getTournaments } from '../services/tournamentService';
import TournamentList from './dashboard/TournamentList';
import TournamentWizard from './creation/TournamentWizard';
import { TOURNAMENT_STATUS } from '../utils/tournamentConstants';

function TournamentsPage({ clubId }) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (clubId) {
      loadTournaments();
    }
  }, [clubId, filterStatus]);

  const loadTournaments = async () => {
    setLoading(true);
    try {
      const options = {};
      
      if (filterStatus !== 'all') {
        options.status = filterStatus;
      }
      
      const data = await getTournaments(clubId, options);
      setTournaments(data);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

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
    active: tournaments.filter(t => [TOURNAMENT_STATUS.REGISTRATION_OPEN, TOURNAMENT_STATUS.GROUPS_PHASE, TOURNAMENT_STATUS.KNOCKOUT_PHASE].includes(t.status)).length,
    completed: tournaments.filter(t => t.status === TOURNAMENT_STATUS.COMPLETED).length,
    draft: tournaments.filter(t => t.status === TOURNAMENT_STATUS.DRAFT).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            Tornei
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestisci i tornei del tuo circolo
          </p>
        </div>
        
        <button
          onClick={handleCreateTournament}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuovo Torneo
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Totale Tornei</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total}</p>
            </div>
            <Trophy className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">In Corso</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.active}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-400 dark:text-blue-300" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completati</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.completed}</p>
            </div>
            <Trophy className="w-8 h-8 text-green-400 dark:text-green-300" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bozze</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-300 mt-1">{stats.draft}</p>
            </div>
            <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Tutti
            </button>
            <button
              onClick={() => setFilterStatus(TOURNAMENT_STATUS.REGISTRATION_OPEN)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === TOURNAMENT_STATUS.REGISTRATION_OPEN
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Iscrizioni Aperte
            </button>
            <button
              onClick={() => setFilterStatus(TOURNAMENT_STATUS.GROUPS_PHASE)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === TOURNAMENT_STATUS.GROUPS_PHASE
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Fase Gironi
            </button>
            <button
              onClick={() => setFilterStatus(TOURNAMENT_STATUS.KNOCKOUT_PHASE)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === TOURNAMENT_STATUS.KNOCKOUT_PHASE
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Fase Eliminazione
            </button>
            <button
              onClick={() => setFilterStatus(TOURNAMENT_STATUS.COMPLETED)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === TOURNAMENT_STATUS.COMPLETED
                  ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Completati
            </button>
          </div>
        </div>
      </div>

      {/* Tournament List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">Caricamento tornei...</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {filterStatus === 'all' ? 'Nessun torneo creato' : 'Nessun torneo trovato'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {filterStatus === 'all'
                ? 'Inizia creando il tuo primo torneo'
                : 'Prova a cambiare i filtri di ricerca'}
            </p>
            {filterStatus === 'all' && (
              <button
                onClick={handleCreateTournament}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Crea Primo Torneo
              </button>
            )}
          </div>
        ) : (
          <TournamentList
            tournaments={tournaments}
            onRefresh={loadTournaments}
          />
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
    </div>
  );
}

export default TournamentsPage;
