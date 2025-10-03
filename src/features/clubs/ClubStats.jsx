// =============================================
// FILE: src/features/clubs/ClubStats.jsx
// =============================================
import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '@components/LoadingSpinner.jsx';
import StatisticheGiocatore from '@features/stats/StatisticheGiocatore.jsx';
import { loadLeague } from '@services/cloud.js';

const ClubStats = ({ clubId, club }) => {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClubData();
  }, [clubId]);

  const loadClubData = async () => {
    if (!clubId) return;

    setLoading(true);
    setError(null);

    try {
      // Load cloud data and filter by club
      const data = await loadLeague('default'); // Default league ID

      // Filter players affiliated to this club
      let clubPlayers =
        data.players?.filter(
          (player) =>
            player.clubId === clubId ||
            player.affiliations?.some((aff) => aff.clubId === clubId && aff.status === 'approved')
        ) || [];

      // Filter matches that involve club players or are hosted by the club
      let clubMatches =
        data.matches?.filter((match) => {
          const allPlayerIds = [...(match.teamA || []), ...(match.teamB || [])];
          return (
            match.clubId === clubId ||
            allPlayerIds.some((playerId) => clubPlayers.some((p) => p.id === playerId))
          );
        }) || [];

      // 🔧 FALLBACK: Se non ci sono dati del club, mostra tutti i dati non associati
      // (questo permette di vedere i dati durante la migrazione)
      if (clubPlayers.length === 0 && data.players?.length > 0) {
        clubPlayers = data.players.filter((player) => !player.clubId) || [];
        clubMatches = data.matches?.filter((match) => !match.clubId) || [];
      }

      setPlayers(clubPlayers);
      setMatches(clubMatches);
    } catch (err) {
      console.error('Error loading club data:', err);
      setError('Errore nel caricamento dei dati del club');
    } finally {
      setLoading(false);
    }
  };

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
