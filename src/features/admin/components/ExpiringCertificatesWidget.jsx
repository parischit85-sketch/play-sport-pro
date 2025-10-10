// =============================================
// FILE: src/features/admin/components/ExpiringCertificatesWidget.jsx
// Widget certificati medici in scadenza per AdminClubDashboard
// =============================================

import React, { useState, useEffect, useCallback } from 'react';
import { getPlayersWithExpiringCertificates } from '@services/medicalCertificates.js';
import { useNavigate } from 'react-router-dom';

export default function ExpiringCertificatesWidget({ clubId, T }) {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadExpiringCertificates = useCallback(async () => {
    if (!clubId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getPlayersWithExpiringCertificates(clubId, 30);
      setPlayers(data);
    } catch (err) {
      console.error('Error loading expiring certificates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    loadExpiringCertificates();
  }, [loadExpiringCertificates]);

  if (loading) {
    return (
      <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
        <h3 className={`text-lg font-semibold ${T.text} mb-4 flex items-center gap-2`}>
          🏥 Certificati Medici
        </h3>
        <div className="text-center py-8">
          <div className="text-5xl mb-3">❌</div>
          <p className={`${T.subtext} text-sm`}>Errore nel caricamento: {error}</p>
          <button
            onClick={loadExpiringCertificates}
            className={`${T.btnSecondary} mt-3 text-sm`}
          >
            🔄 Riprova
          </button>
        </div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
        <h3 className={`text-lg font-semibold ${T.text} mb-4 flex items-center gap-2`}>
          🏥 Certificati Medici
        </h3>
        <div className="text-center py-8">
          <div className="text-5xl mb-3">✅</div>
          <p className={`${T.subtext}`}>Tutti i certificati sono in regola</p>
        </div>
      </div>
    );
  }

  // Categorizza i giocatori
  const expired = players.filter((p) => p.certificateStatus.isExpired);
  const expiringSoon = players.filter(
    (p) => p.certificateStatus.isExpiring && p.certificateStatus.daysUntilExpiry <= 15
  );
  const expiring = players.filter(
    (p) => p.certificateStatus.isExpiring && p.certificateStatus.daysUntilExpiry > 15
  );
  const missing = players.filter((p) => p.certificateStatus.status === 'missing');

  return (
    <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${T.text} flex items-center gap-2`}>
          🏥 Certificati Medici
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            expired.length > 0
              ? 'bg-red-500 text-white'
              : expiringSoon.length > 0
                ? 'bg-orange-500 text-white'
                : 'bg-yellow-500 text-white'
          }`}
        >
          {players.length} {players.length === 1 ? 'giocatore' : 'giocatori'}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{expired.length}</div>
          <div className="text-xs text-red-600 dark:text-red-400">Scaduti</div>
        </div>
        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {expiringSoon.length}
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400">Urgenti (&lt;15gg)</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {expiring.length}
          </div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400">In scadenza</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {missing.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Mancanti</div>
        </div>
      </div>

      {/* Lista Giocatori - Top 5 più urgenti */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {players.slice(0, 10).map((player) => {
          const { daysUntilExpiry, isExpired, status } = player.certificateStatus;

          return (
            <div
              key={player.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/club/${clubId}/players?selected=${player.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/club/${clubId}/players?selected=${player.id}`);
                }
              }}
              className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${
                isExpired
                  ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border-l-4 border-red-500'
                  : daysUntilExpiry <= 15
                    ? 'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 border-l-4 border-orange-500'
                    : status === 'missing'
                      ? 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-l-4 border-gray-400'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 border-l-4 border-yellow-500'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Info giocatore */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${T.text} truncate`}>{player.name}</p>
                  <p className={`text-xs ${T.subtext} truncate`}>
                    {player.email || player.phone || 'Nessun contatto'}
                  </p>
                </div>

                {/* Status certificato */}
                <div className="text-right shrink-0">
                  {status === 'missing' ? (
                    <>
                      <p className="text-sm font-bold text-gray-600 dark:text-gray-400">Mancante</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Nessun certificato
                      </p>
                    </>
                  ) : isExpired ? (
                    <>
                      <p className="text-sm font-bold text-red-600 dark:text-red-400">
                        Scaduto {Math.abs(daysUntilExpiry)}gg fa
                      </p>
                      <p className="text-xs text-red-500 dark:text-red-400">
                        {player.medicalCertificates?.current?.expiryDate
                          ? new Date(
                              player.medicalCertificates.current.expiryDate
                            ).toLocaleDateString('it-IT')
                          : ''}
                      </p>
                    </>
                  ) : (
                    <>
                      <p
                        className={`text-sm font-bold ${
                          daysUntilExpiry <= 15
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}
                      >
                        {daysUntilExpiry === 0
                          ? 'Scade oggi!'
                          : daysUntilExpiry === 1
                            ? 'Scade domani'
                            : `${daysUntilExpiry} giorni`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {player.medicalCertificates?.current?.expiryDate
                          ? new Date(
                              player.medicalCertificates.current.expiryDate
                            ).toLocaleDateString('it-IT')
                          : ''}
                      </p>
                    </>
                  )}
                </div>

                {/* Icona */}
                <div className="text-2xl shrink-0">
                  {status === 'missing' ? '📄' : isExpired ? '⚠️' : daysUntilExpiry <= 7 ? '🚨' : '⏰'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer con azione */}
      {players.length > 10 && (
        <button
          onClick={() => navigate(`/club/${clubId}/players`)}
          className={`w-full mt-4 ${T.btnSecondary} text-sm`}
        >
          Vedi tutti ({players.length})
        </button>
      )}

      <button
        onClick={() => navigate(`/club/${clubId}/players`)}
        className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        📋 Gestisci Certificati
      </button>
    </div>
  );
}
