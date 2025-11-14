import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Filter, Calendar, Trophy, Flame, Clock, ArrowLeft, Loader } from 'lucide-react';
import { DS_ANIMATIONS } from '../../../../lib/design-system';
import PublicMatchCard from './PublicMatchCard';

/**
 * PublicMatchesOnlyPage - Pagina pubblica dedicata alla visualizzazione partite
 * Layout ottimizzato per tornei in modalità "solo partite"
 */
function PublicMatchesOnlyPage() {
  const { clubId, tournamentId } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Carica dati torneo con listener real-time per le partite
  useEffect(() => {
    let unsubscribe = null;

    const loadTournamentData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { getTournament } = await import('../../services/tournamentService');
        const { getTeamsByTournament } = await import('../../services/teamsService');
        const { db } = await import('../../../../services/firebase');
        const { collection, query, onSnapshot } = await import('firebase/firestore');

        // Carica torneo
        const tournamentData = await getTournament(clubId, tournamentId);
        if (!tournamentData) {
          throw new Error('Torneo non trovato');
        }
        setTournament(tournamentData);

        // Carica squadre
        const teamsData = await getTeamsByTournament(clubId, tournamentId);
        setTeams(teamsData || []);

        // Real-time listener per le partite (per aggiornamenti live score)
        const matchesRef = collection(db, 'clubs', clubId, 'tournaments', tournamentId, 'matches');
        const matchesQuery = query(matchesRef);

        unsubscribe = onSnapshot(
          matchesQuery,
          (snapshot) => {
            const matchesData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setMatches(matchesData);
            setLoading(false);
          },
          (error) => {
            console.error('Error in matches listener:', error);
            setError(error.message || 'Errore nel caricamento delle partite');
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Error loading tournament data:', err);
        setError(err.message || 'Errore nel caricamento dei dati');
        setLoading(false);
      }
    };

    loadTournamentData();

    // Cleanup del listener
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [clubId, tournamentId]);

  // Filtra partite per stato
  const getFilteredMatches = () => {
    switch (activeFilter) {
      case 'completed':
        return matches.filter((m) => m.status === 'completed');
      case 'live':
        return matches.filter((m) => m.status === 'in_progress');
      case 'scheduled':
        return matches.filter((m) => m.status === 'scheduled');
      default:
        return matches;
    }
  };

  const filteredMatches = getFilteredMatches();

  // Statistiche rapide
  const stats = {
    total: matches.length,
    completed: matches.filter((m) => m.status === 'completed').length,
    live: matches.filter((m) => m.status === 'in_progress').length,
    scheduled: matches.filter((m) => m.status === 'scheduled').length,
  };

  // Configurazione filtri
  const filters = [
    { id: 'all', label: 'Tutte', icon: Calendar, count: stats.total },
    {
      id: 'live',
      label: 'Live',
      icon: Flame,
      count: stats.live,
      color: 'text-blue-400',
    },
    {
      id: 'completed',
      label: 'Completate',
      icon: Trophy,
      count: stats.completed,
      color: 'text-emerald-400',
    },
    {
      id: 'scheduled',
      label: 'Programmate',
      icon: Clock,
      count: stats.scheduled,
      color: 'text-gray-400',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Caricamento partite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Errore nel caricamento</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className={`px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg ${DS_ANIMATIONS.fast}`}
          >
            Torna Indietro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Back Button & Title */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 hover:bg-gray-800 rounded-lg ${DS_ANIMATIONS.fast}`}
            >
              <ArrowLeft className="w-6 h-6 text-gray-400" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-white mb-1">
                {tournament?.name || 'Torneo'}
              </h1>
              <p className="text-gray-400">Modalità Solo Partite - Vista Pubblica</p>
            </div>
          </div>

          {/* Filtri */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 text-gray-400 mr-2">
              <Filter className="w-5 h-5" />
              <span className="text-sm font-medium">Filtri:</span>
            </div>
            {filters.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                    ${DS_ANIMATIONS.fast}
                    ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                  <span
                    className={`
                    px-2 py-0.5 rounded-full text-xs font-bold
                    ${isActive ? 'bg-white/20' : 'bg-gray-700'}
                  `}
                  >
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎾</div>
            <h3 className="text-2xl font-bold text-white mb-2">Nessuna partita trovata</h3>
            <p className="text-gray-400">
              {activeFilter === 'all'
                ? 'Non ci sono ancora partite in questo torneo.'
                : `Non ci sono partite ${filters.find((f) => f.id === activeFilter)?.label.toLowerCase()}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredMatches.map((match) => (
              <PublicMatchCard key={match.id} match={match} teams={teams} />
            ))}
          </div>
        )}
      </div>

      {/* Footer con Stats */}
      {matches.length > 0 && (
        <div className="bg-gray-800 border-t border-gray-800 mt-12">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-white mb-2">{stats.total}</div>
                <div className="text-sm text-gray-400">Partite Totali</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-blue-400 mb-2">{stats.live}</div>
                <div className="text-sm text-gray-400">In Corso</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-emerald-400 mb-2">{stats.completed}</div>
                <div className="text-sm text-gray-400">Completate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-gray-400 mb-2">{stats.scheduled}</div>
                <div className="text-sm text-gray-400">Programmate</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicMatchesOnlyPage;
