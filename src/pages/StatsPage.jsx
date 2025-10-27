// =============================================
// FILE: src/pages/StatsPage.jsx
// FUTURISTIC DESIGN - Modern glassmorphism UI
// =============================================
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { themeTokens } from '@lib/theme.js';
import { useClub } from '@contexts/ClubContext.jsx';
import { computeClubRanking } from '@lib/ranking-club.js';
import StatisticheGiocatore from '@features/stats/StatisticheGiocatore.jsx';
import FormulaModal from '../components/modals/FormulaModal';

export default function StatsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    players,
    matches,
    clubId,
    playersLoaded,
    loadPlayers,
    matchesLoaded,
    loadMatches,
    leaderboard,
  } = useClub();
  const T = React.useMemo(() => themeTokens(), []);

  const [selectedPlayerId, setSelectedPlayerId] = useState(searchParams.get('player') || '');
  const [formulaData, setFormulaData] = useState(null);

  // I dati si caricano automaticamente nel ClubContext quando cambia clubId

  // 🎯 AGGIUNTO: Usa computeClubRanking per avere rating calcolati dinamicamente
  // identici a quelli della Classifica
  const rankingData = React.useMemo(() => {
    if (!clubId) return { players: [], matches: [] };
    const srcPlayers = playersLoaded ? players : [];
    const srcMatches = matchesLoaded ? matches : [];

    // 🏆 FILTRO CAMPIONATO: Solo giocatori che partecipano attivamente al campionato
    const tournamentPlayers = srcPlayers.filter(
      (player) =>
        player.tournamentData?.isParticipant === true && player.tournamentData?.isActive === true
    );

    return computeClubRanking(tournamentPlayers, srcMatches, clubId, {
      leaderboardMap: leaderboard,
    });
  }, [clubId, players, playersLoaded, matches, matchesLoaded, leaderboard]);

  const handleSelectPlayer = (playerId) => {
    setSelectedPlayerId(playerId);
    if (playerId) {
      setSearchParams({ player: playerId });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900">
      <>
        <StatisticheGiocatore
          T={T}
          players={rankingData.players}
          matches={rankingData.matches}
          selectedPlayerId={selectedPlayerId}
          onSelectPlayer={handleSelectPlayer}
          onShowFormula={setFormulaData}
        />

        {/* Formula Modal Moderno */}
        <FormulaModal
          isOpen={!!formulaData}
          onClose={() => setFormulaData(null)}
          matchData={formulaData}
        />
      </>
    </div>
  );
}
