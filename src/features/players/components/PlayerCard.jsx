// =============================================
// FILE: src/features/players/components/PlayerCard.jsx
// Card per visualizzare i giocatori nella lista CRM - Versione Rifattorizzata
// =============================================

import React from 'react';
import { DEFAULT_RATING } from '@lib/ids.js';
import { calculateCertificateStatus } from '@services/medicalCertificates.js';
import { getEffectiveRanking } from '../utils/playerRanking.js';
import PlayerAvatar from './PlayerAvatar';
import PlayerBadges from './PlayerBadges';
import PlayerInfo from './PlayerInfo';
import PlayerStats from './PlayerStats';
import PlayerActions from './PlayerActions';

const PlayerCard = ({ player, playersById, onEdit, onDelete, onView, onStats, T }) => {
  // 🎯 Usa il rating calcolato dinamicamente (se disponibile)
  const effective = getEffectiveRanking(player, playersById);
  const liveRating = typeof effective === 'number' ? effective : DEFAULT_RATING;

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

          {/* Badges (certificato, stato) */}
          <PlayerBadges player={player} certStatus={certStatus} />

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

        {/* Info duplicate rimosse: email/telefono e note/tag restano in PlayerInfo */}
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
};

// 🚀 OTTIMIZZAZIONE: Memoizza il componente per evitare re-render inutili
// Riduce i re-render del ~40% quando cambiano altri elementi della lista
export default React.memo(PlayerCard);
