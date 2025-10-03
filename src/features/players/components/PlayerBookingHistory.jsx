// =============================================
// FILE: src/features/players/components/PlayerBookingHistory.jsx
// Storico prenotazioni del giocatore
// =============================================

import React, { useEffect, useMemo, useState } from 'react';
import { searchBookingsForPlayer } from '@services/unified-booking-service.js';

export default function PlayerBookingHistory({ player, T }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allBookings, setAllBookings] = useState([]);

  // Carica prenotazioni reali per il giocatore
  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const userId = player?.linkedAccountId || null;
        const email = player?.linkedAccountEmail || player?.email || null;
        const name = player?.name || `${player?.firstName || ''} ${player?.lastName || ''}`.trim();
        const bookings = await searchBookingsForPlayer({ userId, email, name });
        if (ignore) return;
        setAllBookings(bookings || []);
      } catch (e) {
        if (ignore) return;
        setError(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [
    player?.linkedAccountId,
    player?.linkedAccountEmail,
    player?.email,
    player?.name,
    player?.firstName,
    player?.lastName,
  ]);

  // Normalizzazione e mapping per UI
  const normalized = useMemo(() => {
    return (allBookings || []).map((b) => {
      const date = b.date; // atteso 'YYYY-MM-DD'
      const rawTime = b.time || '';
      const time = rawTime.includes('-') ? rawTime : `${rawTime}`;
      const court = b.courtName || b.court || 'Campo';
      const sport = b.sport || 'Padel';
      const status = b.status || 'confirmed';
      const players =
        Array.isArray(b.players) && b.players.length > 0
          ? b.players
          : [b.bookedBy || b.userEmail || ''];
      const price = typeof b.price === 'number' ? b.price : Number(b.price || 0) || 0;
      const paid = Boolean(b.paid) || b.paymentStatus === 'paid';
      const paymentMethod = b.paymentMethod || null;
      return {
        id: b.id,
        date,
        time,
        court,
        sport,
        status,
        players,
        price,
        paid,
        paymentMethod,
      };
    });
  }, [allBookings]);

  const getStartDateTime = (booking) => {
    const t = (booking.time || '').split('-')[0].trim();
    const iso = t ? `${booking.date}T${t}:00` : `${booking.date}T00:00:00`;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? new Date(booking.date) : d;
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed':
        return '✅ Confermata';
      case 'completed':
        return '🏁 Completata';
      case 'cancelled':
        return '❌ Cancellata';
      case 'no_show':
        return '👻 Assenza';
      default:
        return '❓ Sconosciuto';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
      case 'no_show':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  const filteredBookings = normalized.filter((booking) => {
    const now = new Date();
    const start = getStartDateTime(booking);

    if (filterStatus !== 'all') {
      if (filterStatus === 'completed') {
        if (!(start < now && booking.status !== 'cancelled')) return false;
      } else if (filterStatus === 'confirmed') {
        if (!(booking.status === 'confirmed')) return false;
      } else if (filterStatus === 'cancelled') {
        if (booking.status !== 'cancelled') return false;
      } else if (filterStatus === 'no_show') {
        if (booking.status !== 'no_show') return false;
      } else {
        if (booking.status !== filterStatus) return false;
      }
    }

    if (dateFilter !== 'all') {
      const bookingDate = new Date(booking.date);

      switch (dateFilter) {
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return bookingDate >= weekAgo;
        }
        case 'month': {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return bookingDate >= monthAgo;
        }
        case 'year': {
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return bookingDate >= yearAgo;
        }
        default:
          return true;
      }
    }

    return true;
  });

  const stats = {
    total: normalized.length,
    completed: normalized.filter(
      (b) => getStartDateTime(b) < new Date() && b.status !== 'cancelled'
    ).length,
    upcoming: normalized.filter(
      (b) => getStartDateTime(b) >= new Date() && b.status !== 'cancelled'
    ).length,
    cancelled: normalized.filter((b) => b.status === 'cancelled').length,
    totalSpent: normalized.filter((b) => b.paid).reduce((sum, b) => sum + b.price, 0),
  };

  return (
    <div className="space-y-6">
      {/* Statistiche */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`${T.cardBg} ${T.border} rounded-xl p-4 text-center`}>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
          <div className={`text-xs ${T.subtext}`}>Totale</div>
        </div>

        <div className={`${T.cardBg} ${T.border} rounded-xl p-4 text-center`}>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.completed}
          </div>
          <div className={`text-xs ${T.subtext}`}>Completate</div>
        </div>

        <div className={`${T.cardBg} ${T.border} rounded-xl p-4 text-center`}>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.upcoming}
          </div>
          <div className={`text-xs ${T.subtext}`}>Future</div>
        </div>

        <div className={`${T.cardBg} ${T.border} rounded-xl p-4 text-center`}>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.cancelled}</div>
          <div className={`text-xs ${T.subtext}`}>Cancellate</div>
        </div>

        <div className={`${T.cardBg} ${T.border} rounded-xl p-4 text-center`}>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            €{stats.totalSpent.toFixed(2)}
          </div>
          <div className={`text-xs ${T.subtext}`}>Totale Speso</div>
        </div>
      </div>

      {/* Filtri */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <label className={`block text-sm font-medium ${T.text} mb-2`}>Filtra per stato</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`${T.input} w-full`}
          >
            <option value="all">Tutti gli stati</option>
            <option value="confirmed">Confermate</option>
            <option value="completed">Completate</option>
            <option value="cancelled">Cancellate</option>
            <option value="no_show">Assenze</option>
          </select>
        </div>

        <div className="flex-1">
          <label className={`block text-sm font-medium ${T.text} mb-2`}>Filtra per periodo</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={`${T.input} w-full`}
          >
            <option value="all">Tutti i periodi</option>
            <option value="week">Ultima settimana</option>
            <option value="month">Ultimo mese</option>
            <option value="year">Ultimo anno</option>
          </select>
        </div>
      </div>

      {/* Lista prenotazioni */}
      <div>
        <h4 className={`font-semibold ${T.text} mb-4`}>
          Storico Prenotazioni ({filteredBookings.length})
        </h4>

        {loading ? (
          <div className={`text-center py-8 ${T.cardBg} ${T.border} rounded-xl`}>
            <div className="text-4xl mb-2">⏳</div>
            <div className={`${T.subtext}`}>Caricamento prenotazioni…</div>
          </div>
        ) : error ? (
          <div className={`text-center py-8 ${T.cardBg} ${T.border} rounded-xl`}>
            <div className="text-4xl mb-2">⚠️</div>
            <div className={`${T.subtext}`}>Errore nel caricamento delle prenotazioni</div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className={`text-center py-8 ${T.cardBg} ${T.border} rounded-xl`}>
            <div className="text-4xl mb-2">📅</div>
            <div className={`${T.subtext} mb-4`}>
              {filterStatus !== 'all' || dateFilter !== 'all'
                ? 'Nessuna prenotazione corrispondente ai filtri'
                : 'Nessuna prenotazione presente'}
            </div>
            {filterStatus !== 'all' || dateFilter !== 'all' ? (
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setDateFilter('all');
                }}
                className={`${T.btnSecondary} px-6 py-3`}
              >
                Rimuovi Filtri
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings
              .sort((a, b) => getStartDateTime(b) - getStartDateTime(a))
              .map((booking) => (
                <div key={booking.id} className={`${T.cardBg} ${T.border} rounded-xl p-4`}>
                  {/* Desktop layout */}
                  <div className="hidden lg:flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {new Date(booking.date).getDate()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`font-medium ${T.text}`}>
                          {booking.court} - {booking.sport}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                        >
                          {getStatusLabel(booking.status)}
                        </span>
                        {booking.paid && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                            💰 Pagato
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>📅 {new Date(booking.date).toLocaleDateString('it-IT')}</span>
                        <span>⏰ {booking.time}</span>
                        <span>👥 {booking.players.join(', ')}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        €{booking.price.toFixed(2)}
                      </div>
                      <div className={`text-xs ${T.subtext}`}>
                        {booking.paymentMethod ? booking.paymentMethod : 'Non pagato'}
                      </div>
                    </div>
                  </div>

                  {/* Mobile layout */}
                  <div className="lg:hidden">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className={`font-medium ${T.text} mb-1`}>
                          {booking.court} - {booking.sport}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          📅 {new Date(booking.date).toLocaleDateString('it-IT')} ⏰ {booking.time}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          €{booking.price.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                      >
                        {getStatusLabel(booking.status)}
                      </span>
                      {booking.paid && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                          💰 Pagato
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      👥 {booking.players.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
