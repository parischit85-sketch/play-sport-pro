// =============================================
// FILE: PlayerDetailsHeader.jsx
// Header del modal PlayerDetails con avatar, stats e badges
// Creato: 2025-10-15 - Refactoring PlayerDetails (Fase 1.1.1)
// =============================================

import React from 'react';
import LoadingButton from '@components/common/LoadingButton';

const DEFAULT_RATING = 1500;

/**
 * Header component per PlayerDetails - REDESIGNED
 * Layout moderno a 3 sezioni: Info | Stats | Actions
 */
const PlayerDetailsHeader = React.memo(function PlayerDetailsHeader({
  player,
  playerWithRealRating,
  isEditMode,
  isSaving,
  permissions,
  onToggleEditMode,
  onToggleStatus,
  onCancelEdit,
  onSaveEdit,
  onClose,
  T,
}) {
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'adult':
        return 'Adulto';
      case 'youth':
        return 'Giovane';
      case 'junior':
        return 'Junior';
      case 'senior':
        return 'Senior';
      default:
        return 'Giocatore';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'adult':
        return '👨';
      case 'youth':
        return '👦';
      case 'junior':
        return '🧒';
      case 'senior':
        return '👴';
      default:
        return '👤';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'adult':
        return 'bg-blue-500 dark:bg-blue-600';
      case 'youth':
        return 'bg-green-500 dark:bg-green-600';
      case 'junior':
        return 'bg-yellow-500 dark:bg-yellow-600';
      case 'senior':
        return 'bg-purple-500 dark:bg-purple-600';
      default:
        return 'bg-gray-500 dark:bg-gray-600';
    }
  };

  // Calcolo progressione ranking
  const rankingDelta = player.tournamentData?.isParticipant
    ? (playerWithRealRating?.rating || 0) - (player.tournamentData?.initialRanking || 0)
    : 0;

  return (
    <div className="relative bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 border-b-2 border-gray-200 dark:border-gray-700">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative px-6 py-6">
        {/* PLAYER NAME */}
        <div className="mb-6 relative z-20">
          <h2
            id="player-details-title"
            className="text-3xl font-bold text-gray-900 dark:text-white mb-1"
          >
            {player.firstName || player.lastName
              ? `${player.firstName || ''} ${player.lastName || ''}`.trim()
              : player.name || player.displayName || player.userName || 'Giocatore'}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {player.category && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 ${getCategoryColor(player.category)} text-white text-xs font-semibold rounded-md shadow-sm`}
              >
                {getCategoryIcon(player.category)} {getCategoryLabel(player.category)}
              </span>
            )}
            {player.isActive ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white text-xs font-semibold rounded-md shadow-sm">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                Attivo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-500 text-white text-xs font-semibold rounded-md shadow-sm">
                Inattivo
              </span>
            )}
            {player.tournamentData?.isParticipant && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-xs font-semibold rounded-md shadow-sm">
                🏆 Partecipante Torneo
              </span>
            )}
            {player.email && (
              <span className={`text-sm ${T?.subtext || 'text-gray-500'}`}>📧 {player.email}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* CENTER: Quick Stats - 5 cols */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-3 gap-3 h-full">
              {/* Ranking Card */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <div className="text-xs font-semibold opacity-90 mb-1">🏆 Ranking</div>
                  {player.tournamentData?.isParticipant && player.tournamentData?.isActive ? (
                    <>
                      <div className="text-3xl font-bold mb-1">
                        {Number(playerWithRealRating?.rating || DEFAULT_RATING).toFixed(0)}
                      </div>
                      {rankingDelta !== 0 && (
                        <div
                          className={`text-xs font-semibold flex items-center gap-1 ${rankingDelta > 0 ? 'text-green-300' : 'text-red-300'}`}
                        >
                          <span>{rankingDelta > 0 ? '↗' : '↘'}</span>
                          <span>
                            {rankingDelta > 0 ? '+' : ''}
                            {rankingDelta}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-xl font-bold opacity-50">Non iscritto</div>
                  )}
                </div>
              </div>

              {/* Wallet Card */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <div className="text-xs font-semibold opacity-90 mb-1">💰 Credito</div>
                  <div className="text-3xl font-bold mb-1">
                    €{(player.wallet?.balance || 0).toFixed(2)}
                  </div>
                  <div className="text-xs opacity-75">Disponibile</div>
                </div>
              </div>

              {/* Bookings Card */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <div className="text-xs font-semibold opacity-90 mb-1">📅 Prenotazioni</div>
                  <div className="text-3xl font-bold mb-1">
                    {player.bookingHistory?.length || 0}
                  </div>
                  <div className="text-xs opacity-75">Totali</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Actions - 2 cols */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-2 h-full justify-center">
              {!isEditMode ? (
                <>
                  {/* Edit Button */}
                  {permissions.canEdit && (
                    <button
                      onClick={onToggleEditMode}
                      className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-md flex items-center justify-center gap-2"
                    >
                      <span>✏️</span>
                      <span>Modifica Dati</span>
                    </button>
                  )}

                  {/* Toggle Status */}
                  {permissions.canActivateDeactivate && (
                    <button
                      onClick={onToggleStatus}
                      className={`w-full px-4 py-2.5 font-semibold rounded-lg transition-all hover:scale-105 shadow-md flex items-center justify-center gap-2 ${
                        player.isActive
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      <span>{player.isActive ? '⏸️' : '▶️'}</span>
                      <span>{player.isActive ? 'Disattiva' : 'Attiva'}</span>
                    </button>
                  )}

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-all"
                      title="Esporta dati"
                    >
                      📤
                    </button>
                    <button
                      className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-all"
                      title="Stampa"
                    >
                      🖨️
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Save Button */}
                  <LoadingButton
                    onClick={onSaveEdit}
                    variant="primary"
                    loading={isSaving}
                    className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-md flex items-center justify-center gap-2"
                  >
                    <span>💾</span>
                    <span>Salva Modifiche</span>
                  </LoadingButton>

                  {/* Cancel Button */}
                  <button
                    onClick={onCancelEdit}
                    className="w-full px-4 py-2.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all hover:scale-105 shadow-md flex items-center justify-center gap-2"
                  >
                    <span>❌</span>
                    <span>Annulla</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PlayerDetailsHeader;
