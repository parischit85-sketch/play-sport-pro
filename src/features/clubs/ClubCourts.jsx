// =============================================
// FILE: src/features/clubs/ClubCourts.jsx
// =============================================
import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '@components/LoadingSpinner.jsx';
import { loadLeague } from '@services/cloud.js';

const ClubCourts = ({ clubId, club }) => {
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClubCourts();
  }, [clubId]);

  const loadClubCourts = async () => {
    if (!clubId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await loadLeague('default'); // Default league ID

      // Filter courts belonging to this club
      let clubCourts = data.courts?.filter((court) => court.clubId === clubId) || [];

      // Filter current bookings for club courts
      const today = new Date().toISOString().split('T')[0];
      let clubBookings =
        data.bookings?.filter((booking) => booking.clubId === clubId && booking.date >= today) ||
        [];

      // 🔧 FALLBACK: Se non ci sono campi del club, mostra campi non associati
      if (clubCourts.length === 0 && data.courts?.length > 0) {
        clubCourts = data.courts.filter((court) => !court.clubId) || [];
        clubBookings =
          data.bookings?.filter((booking) => !booking.clubId && booking.date >= today) || [];
      }

      setCourts(clubCourts);
      setBookings(clubBookings);
    } catch (err) {
      console.error('Error loading club courts:', err);
      setError('Errore nel caricamento dei campi del club');
    } finally {
      setLoading(false);
    }
  };

  const getCourtStatus = (courtId) => {
    const today = new Date();
    const currentTime = today.getHours() * 60 + today.getMinutes();
    const todayString = today.toISOString().split('T')[0];

    const todayBookings = bookings.filter(
      (booking) => booking.courtId === courtId && booking.date === todayString
    );

    // Check if court is currently booked
    const isCurrentlyBooked = todayBookings.some((booking) => {
      const startTime =
        parseInt(booking.startTime.split(':')[0]) * 60 + parseInt(booking.startTime.split(':')[1]);
      const endTime =
        parseInt(booking.endTime.split(':')[0]) * 60 + parseInt(booking.endTime.split(':')[1]);
      return currentTime >= startTime && currentTime <= endTime;
    });

    return {
      status: isCurrentlyBooked ? 'occupied' : 'available',
      todayBookings: todayBookings.length,
      nextBooking: todayBookings.find((booking) => {
        const startTime =
          parseInt(booking.startTime.split(':')[0]) * 60 +
          parseInt(booking.startTime.split(':')[1]);
        return startTime > currentTime;
      }),
    };
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
          Campi {club?.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Stato e disponibilità dei campi del club</p>
      </div>

      {courts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎾</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nessun campo disponibile
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            I campi del club non sono ancora stati configurati
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courts.map((court) => {
            const courtInfo = getCourtStatus(court.id);

            return (
              <div
                key={court.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {court.name || `Campo ${court.number || court.id}`}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {court.surface || 'Terra rossa'} •{' '}
                      {court.lighting ? 'Con illuminazione' : 'Senza illuminazione'}
                    </p>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      courtInfo.status === 'occupied'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}
                  >
                    {courtInfo.status === 'occupied' ? '🔴 Occupato' : '🟢 Disponibile'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Prenotazioni oggi:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {courtInfo.todayBookings}
                    </span>
                  </div>

                  {courtInfo.nextBooking && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Prossima:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {courtInfo.nextBooking.startTime}
                      </span>
                    </div>
                  )}

                  {court.hourlyRate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Tariffa oraria:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        €{court.hourlyRate}/ora
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                    Prenota Campo
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClubCourts;
