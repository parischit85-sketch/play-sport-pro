// =============================================
// FILE: src/features/players/components/PlayerCard.jsx
// Card per visualizzare i giocatori nella lista CRM - Versione Rifattorizzata
// =============================================

import React from 'react';
import { DEFAULT_RATING } from '@lib/ids.js';
import { calculateCertificateStatus } from '@services/medicalCertificates.js';
import PlayerAvatar from './PlayerAvatar';
import PlayerBadges from './PlayerBadges';
import PlayerInfo from './PlayerInfo';
import PlayerStats from './PlayerStats';
import PlayerActions from './PlayerActions';

export default function PlayerCard({ player, playersById, onEdit, onDelete, onView, onStats, T }) {
  // 🎯 Usa il rating calcolato dinamicamente (se disponibile)
  const liveRating =
    player.calculatedRating ??
    playersById?.[player.id]?.calculatedRating ??
    playersById?.[player.id]?.rating ??
    player.rating ??
    DEFAULT_RATING;

  // 🏥 Calcola status certificato
  const certStatus = calculateCertificateStatus(player.medicalCertificates?.current?.expiryDate);

  return (
    <div
      className={`${T.cardBg} ${T.border} rounded-lg p-3 hover:shadow-md transition-shadow relative overflow-hidden h-full`}
    >
      {/* Layout Desktop */}
      <div className="hidden lg:flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {/* Avatar */}
          <PlayerAvatar player={player} size="sm" />

          {/* Info base */}
          <PlayerInfo player={player} onView={onView} T={T} layout="desktop" />

          {/* Stats */}
          <PlayerStats player={player} liveRating={liveRating} T={T} layout="desktop" />

          {/* Azioni */}
          <PlayerActions
            onView={onView}
            onEdit={onEdit}
            onStats={onStats}
            onDelete={onDelete}
            T={T}
            layout="desktop"
          />
        </div>

        {/* Riga aggiuntiva per info compatte */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="text-sm text-gray-600 dark:text-gray-400 min-w-[300px] max-w-[600px] truncate">
            {player.email || 'Email non disponibile'}
            {player.phone ? ` • ${player.phone}` : ''}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            📝 {player.notes?.length || 0} note • 🏷️ {player.tags?.length || 0} tag
          </div>
        </div>
      </div>

      {/* Layout Mobile */}
      <div className="lg:hidden">
        <div className="flex items-start gap-2 mb-3">
          {/* Avatar */}
          <PlayerAvatar player={player} size="sm" />

          {/* Info base */}
          <PlayerInfo player={player} onView={onView} T={T} layout="mobile" />

          {/* Badges */}
          <PlayerBadges player={player} certStatus={certStatus} />

          {/* Ranking */}
          <div className="text-right">
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
        </div>

        {/* Stats mobile */}
        <PlayerStats player={player} liveRating={liveRating} T={T} layout="mobile" />

        {/* Azioni mobile */}
        <PlayerActions
          onView={onView}
          onEdit={onEdit}
          onStats={onStats}
          onDelete={onDelete}
          T={T}
          layout="mobile"
        />
      </div>
    </div>
  );
}
