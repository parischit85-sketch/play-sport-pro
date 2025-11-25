// =============================================
// FILE: src/features/players/components/PlayerStats.jsx
// Componente statistiche giocatore (ranking, wallet, attività)
// =============================================

import React from 'react';
import { useClub } from '@contexts/ClubContext.jsx';
import { formatLastActivity } from '@lib/playerUtils.js';

const PlayerStats = ({ player, liveRating, T, layout = 'desktop' }) => {
  const { leaderboard } = useClub();
  const lb = leaderboard?.[player.id];
  const champPoints = typeof lb?.totalPoints === 'number' ? lb.totalPoints : null;
  const champEntries = typeof lb?.entriesCount === 'number' ? lb.entriesCount : null;
  const bookingsCount = player.bookingHistory?.length || 0;
  const balance = player.wallet?.balance || 0;

  if (layout === 'mobile') {
    return (
      <>
        {/* Stats row mobile */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-center">
          <div>
            <div className="text-sm font-medium">{formatLastActivity(player.lastActivity)}</div>
            <div className={`text-xs ${T.subtext}`}>Ultima attività</div>
          </div>
        </div>
        {/* Extra info mobile rimossa per evitare duplicazioni (note/tag) */}
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
            <div className="text-xl font-bold text-purple-400">
              {Number(liveRating).toFixed(0)}
            </div>
            <div className={`text-xs ${T.subtext}`}>Ranking attuale</div>
          </>
        ) : (
          <>
            <div className="text-lg text-gray-600">-</div>
            <div className={`text-xs ${T.subtext}`}>Non partecipa</div>
          </>
        )}
      </div>
    </>
  );
};

// 🚀 OTTIMIZZAZIONE: Memoizza per evitare re-render inutili
export default React.memo(PlayerStats);
