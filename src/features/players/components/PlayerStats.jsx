// =============================================
// FILE: src/features/players/components/PlayerStats.jsx
// Componente statistiche giocatore (ranking, wallet, attività)
// =============================================

import React from 'react';
import { formatLastActivity } from '@lib/playerUtils.js';

export default function PlayerStats({ player, liveRating, T, layout = 'desktop' }) {
  const bookingsCount = player.bookingHistory?.length || 0;

  if (layout === 'mobile') {
    return (
      <>
        {/* Stats row mobile */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-center">
          <div>
            <div className="font-semibold text-green-600 dark:text-green-400">
              €{(player.wallet?.balance || 0).toFixed(2)}
            </div>
            <div className={`text-xs ${T.subtext}`}>Credito</div>
          </div>
          <div>
            <div className="text-sm font-medium">{formatLastActivity(player.lastActivity)}</div>
            <div className={`text-xs ${T.subtext}`}>Ultima attività</div>
          </div>
        </div>

        {/* Extra info mobile */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
          <div className="text-left">
            <div className={`${T.subtext}`}>Prenotazioni</div>
            <div>📅 {bookingsCount}</div>
          </div>
          <div className="text-left">
            <div className={`${T.subtext}`}>Note / Tag</div>
            <div>
              📝 {player.notes?.length || 0} / 🏷️ {player.tags?.length || 0}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop layout
  return (
    <>
      {/* Ranking attuale */}
      <div className="text-center w-[70px] shrink-0">
        {player.tournamentData?.isParticipant && player.tournamentData?.isActive ? (
          <>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {Number(liveRating).toFixed(0)}
            </div>
            <div className={`text-xs ${T.subtext}`}>Ranking attuale</div>
          </>
        ) : (
          <>
            <div className="text-lg text-gray-300 dark:text-gray-600">-</div>
            <div className={`text-xs ${T.subtext}`}>Non partecipa</div>
          </>
        )}
      </div>

      {/* Wallet */}
      <div className="text-center w-[90px] shrink-0">
        <div className="font-semibold text-green-600 dark:text-green-400">
          €{(player.wallet?.balance || 0).toFixed(2)}
        </div>
        <div className={`text-xs ${T.subtext}`}>Credito</div>
      </div>

      {/* Ultima attività + Prenotazioni */}
      <div className="text-center min-w-[100px]">
        <div className="text-sm font-medium">{formatLastActivity(player.lastActivity)}</div>
        <div className={`text-xs ${T.subtext}`}>Ultima attività</div>
        <div className="text-xs mt-1">📅 {bookingsCount} prenot.</div>
      </div>
    </>
  );
}