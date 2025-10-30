// =============================================
// FILE: src/features/clubs/ClubStats.jsx
// =============================================
import React, { useState, useEffect, useCallback } from 'react';
import { LoadingSpinner } from '@components/LoadingSpinner.jsx';
import StatisticheGiocatore from '@features/stats/StatisticheGiocatore.jsx';
import { getClubPlayers, getClubMatchesWithTournaments } from '@services/club-data.js';

const ClubStats = ({ clubId, club }) => {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClubData = useCallback(async () => {
    if (!clubId) return;

    setLoading(true);
    setError(null);

    try {
      // Carica dati direttamente dalle subcollections del club
      // Adesso getClubMatchesWithTournaments include sia match regolari che match da tornei
      const [clubPlayers, combinedMatches] = await Promise.all([
        getClubPlayers(clubId),
        getClubMatchesWithTournaments(clubId),
      ]);

      setPlayers(clubPlayers);
      setMatches(combinedMatches);
    } catch (err) {
      console.error('Error loading club data:', err);
      setError('Errore nel caricamento dei dati del club');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    loadClubData();
  }, [loadClubData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Errore nel caricamento
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Statistiche {club?.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Statistiche dettagliate dei giocatori del club
        </p>
      </div>

      <StatisticheGiocatore players={players} matches={matches} T="light" />
    </div>
  );
};

export default ClubStats;
