// =============================================
// FILE: src/features/players/components/PlayerInfo.jsx
// Componente informazioni base giocatore (nome, email, categoria, tags)
// =============================================

import React from 'react';
import { getPlayerFullName, getCategoryStyle, getCategoryLabel } from '@lib/playerUtils.js';
import PlayerBadges from './PlayerBadges';

const PlayerInfo = ({ player, onView, T, layout = 'desktop', certStatus }) => {
  const tags = player.tags || [];
  const notesCount = player.notes?.length || 0;
  const subscription = player.subscriptions?.[player.subscriptions?.length - 1];

  if (layout === 'mobile') {
    return (
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <button
            onClick={onView}
            className="font-semibold text-lg hover:opacity-80 transition truncate"
          >
            {getPlayerFullName(player)}
          </button>
          <PlayerBadges player={player} certStatus={certStatus} />
        </div>

        <div className="text-sm text-gray-400 mb-2 break-words">
          {player.email || 'Email non disponibile'}
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryStyle(player.category)}`}
          >
            {getCategoryLabel(player.category)}
          </span>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <>
      {/* Avatar e info base */}
      <div className="flex items-center gap-3 flex-[2_2_280px] min-w-[240px]">
        {/* Avatar will be rendered separately */}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={onView}
              className="font-semibold text-lg hover:opacity-80 transition truncate"
            >
              {getPlayerFullName(player)}
            </button>
            <PlayerBadges player={player} certStatus={certStatus} />
          </div>
        </div>
      </div>

      {/* Categoria + Abbonamento */}
      <div className="flex flex-col items-start gap-1 min-w-[120px]">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryStyle(player.category)}`}
        >
          {getCategoryLabel(player.category)}
        </span>
        {subscription ? (
          <span
            className="text-[11px] text-green-300"
            title={`Scadenza: ${subscription.endDate ? new Date(subscription.endDate).toLocaleDateString('it-IT') : 'N/D'}`}
          >
            {subscription.type || 'Abbonamento'}
          </span>
        ) : (
          <span className={`text-[11px] ${T.subtext}`}>Nessun abbonamento</span>
        )}
      </div>
    </>
  );
};

// 🚀 OTTIMIZZAZIONE: Memoizza per evitare re-render inutili
export default React.memo(PlayerInfo);
