// =============================================
// FILE: src/features/clubs/ClubClassifica.jsx
// =============================================
import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '@components/LoadingSpinner.jsx';
import Classifica from '@features/classifica/Classifica.jsx';
import { getClubPlayers, getClubMatches } from '@services/club-data.js';

const ClubClassifica = ({ clubId, club }) => {
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
      // Carica dati direttamente dalle subcollections del club
      const [clubPlayers, clubMatches] = await Promise.all([
        getClubPlayers(clubId),
        getClubMatches(clubId)
      ]);

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
          Classifica {club?.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Classifiche e statistiche dei giocatori del club
        </p>
      </div>

      <Classifica players={players} matches={matches} onOpenStats={() => {}} T="light" />
    </div>
  );
};

export default ClubClassifica;
