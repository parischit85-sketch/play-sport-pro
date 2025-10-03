// =============================================
// FILE: src/features/clubs/ClubBooking.jsx
// =============================================
import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '@components/LoadingSpinner.jsx';
import { loadLeague } from '@services/cloud.js';
import ModernBookingInterface from '@features/booking/ModernBookingInterface.jsx';

const ClubBooking = ({ clubId, club }) => {
  const [clubData, setClubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClubBookingData();
  }, [clubId]);

  const loadClubBookingData = async () => {
    if (!clubId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await loadLeague('default'); // Default league ID
      
      // Filter data to only include club-specific items
      let filteredData = {
        ...data,
        courts: data.courts?.filter(court => court.clubId === clubId) || [],
        bookings: data.bookings?.filter(booking => booking.clubId === clubId) || [],
        // Keep all profiles but booking component will handle filtering
        profiles: data.profiles || [],
        players: data.players || []
      };

      // 🔧 FALLBACK: Se non ci sono campi del club, mostra campi non associati
      if (filteredData.courts.length === 0 && data.courts?.length > 0) {
        filteredData.courts = data.courts.filter(court => !court.clubId) || [];
        filteredData.bookings = data.bookings?.filter(booking => !booking.clubId) || [];
      }

      setClubData(filteredData);
    } catch (err) {
      console.error('Error loading club booking data:', err);
      setError('Errore nel caricamento del sistema di prenotazioni');
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
        <button 
          onClick={loadClubBookingData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Riprova
        </button>
      </div>
    );
  }

  if (!clubData?.courts || clubData.courts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎾</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Nessun campo disponibile
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Il club {club?.name} non ha ancora configurato i campi per le prenotazioni
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Prenota Campo - {club?.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Sistema di prenotazione campi per {club?.name}
        </p>
      </div>

      <ModernBookingInterface 
        data={clubData} 
        clubFilter={clubId}
        clubContext={club}
      />
    </div>
  );
};

export default ClubBooking;