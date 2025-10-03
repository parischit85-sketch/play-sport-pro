// =============================================
// FILE: src/pages/ClassificaPage.jsx
// =============================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { themeTokens } from '@lib/theme.js';
import { useClub } from '@contexts/ClubContext.jsx';
import { computeClubRanking } from '@lib/ranking-club.js';
import Classifica from '@features/classifica/Classifica.jsx';

export default function ClassificaPage() {
  const navigate = useNavigate();
  const { clubId, players, playersLoaded, loadPlayers, matches, matchesLoaded, loadMatches } =
    useClub();
  const T = React.useMemo(() => themeTokens(), []);

  const handleOpenStats = (playerId) => {
    if (clubId) {
      navigate(`/club/${clubId}/stats?player=${playerId}`);
    } else {
      navigate(`/stats?player=${playerId}`);
    }
  };

  // I dati si caricano automaticamente nel ClubContext quando cambia clubId

  const rankingData = React.useMemo(() => {
    if (!clubId) return { players: [], matches: [] };
    const srcPlayers = playersLoaded ? players : [];
    const srcMatches = matchesLoaded ? matches : [];
    return computeClubRanking(srcPlayers, srcMatches, clubId);
  }, [clubId, players, playersLoaded, matches, matchesLoaded]);

  return (
    <Classifica
      T={T}
      players={rankingData.players}
      matches={rankingData.matches}
      onOpenStats={handleOpenStats}
    />
  );
}
