// =============================================
// FILE: src/pages/MatchesPage.jsx
// =============================================
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { themeTokens } from '@lib/theme.js';
// Removed legacy LeagueContext in favour of ClubContext + per-club loaders
import { useClub } from '@contexts/ClubContext.jsx';
import { computeClubRanking } from '@lib/ranking-club.js';
import { useUI } from '@contexts/UIContext.jsx';
import { useAuth } from '@contexts/AuthContext.jsx';
import CreaPartita from '@features/crea/CreaPartita.jsx';
import FormulaModal from '../components/modals/FormulaModal';

export default function MatchesPage() {
  const {
    clubId,
    loadPlayers,
    players,
    playersLoaded,
    loadMatches,
    matches,
    matchesLoaded,
    leaderboard, // ✅ Serve per computeClubRanking
  } = useClub();
  const { clubMode } = useUI();
  const { userRole, user, isClubAdmin } = useAuth();
  const T = React.useMemo(() => themeTokens(), []);
  const navigate = useNavigate();
  const [formulaData, setFormulaData] = useState(null);

  // Gli admin di club possono sempre accedere, anche senza clubMode attivato
  const canAccessMatches = clubMode || isClubAdmin(clubId);

  // ✅ USA computeClubRanking() IDENTICO a StatsPage per ricalcolare i match con rating storici corretti
  const rankingData = useMemo(() => {
    if (!clubId) return { players: [], matches: [] };
    const srcPlayers = playersLoaded ? players : [];
    const srcMatches = matchesLoaded ? matches : [];

    // � FILTRO CAMPIONATO: Solo giocatori che partecipano attivamente al campionato
    const tournamentPlayers = srcPlayers.filter(
      (player) =>
        player.tournamentData?.isParticipant === true && player.tournamentData?.isActive === true
    );

    // 🎯 computeClubRanking RICALCOLA tutti i match con:
    // - Rating storici (al momento della partita)
    // - sumA, sumB corretti
    // - gap, factor, base corretti
    // - Identico a Tab Statistiche
    return computeClubRanking(tournamentPlayers, srcMatches, clubId, {
      leaderboardMap: leaderboard,
    });
  }, [clubId, players, playersLoaded, matches, matchesLoaded, leaderboard]);

  // ✅ Prepara playersById usando i giocatori con rating calcolati da rankingData
  const playersById = React.useMemo(
    () => Object.fromEntries((rankingData?.players || players).map((p) => [p.id, p])),
    [rankingData, players]
  );

  const stateLike = React.useMemo(() => ({ players }), [players]);
  const derivedLike = React.useMemo(() => ({ matches }), [matches]);

  React.useEffect(() => {
    if (clubId) {
      if (!playersLoaded) loadPlayers();
      if (!matchesLoaded) loadMatches();
    }
  }, [clubId, playersLoaded, matchesLoaded, loadPlayers, loadMatches]);

  if (!canAccessMatches) {
    return (
      <div className={`text-center py-12 ${T.cardBg} ${T.border} rounded-xl m-4`}>
        <div className="text-6xl mb-4">🔒</div>
        <h3 className={`text-xl font-bold mb-2 ${T.text}`}>Modalità Club Richiesta</h3>
        <p className={`${T.subtext} mb-4`}>
          {userRole === 'super_admin' || (user && user.userProfile?.role === 'admin')
            ? 'Per accedere alla creazione partite, devi prima sbloccare la modalità club nella sezione Extra.'
            : 'Per accedere alla creazione partite, è necessario avere privilegi di amministratore del club.'}
        </p>
        {(userRole === 'super_admin' || (user && user.userProfile?.role === 'admin')) && (
          <button onClick={() => navigate('/extra')} className={`${T.btnPrimary} px-6 py-3`}>
            Vai a Extra per sbloccare
          </button>
        )}
      </div>
    );
  }

  // DEBUG MIRATO: Verifica cosa passa a CreaPartita
  // console.log('🎾 MATCHES DEBUG:', {
  //   matchesLength: matches?.length || 0,
  //   derivedMatchesLength: derivedLike.matches?.length || 0,
  //   matchesLoaded,
  //   firstMatch: matches?.[0]?.id,
  //   lastMatch: matches?.[matches?.length - 1]?.id
  // });

  return (
    <>
      <CreaPartita
        T={T}
        clubId={clubId}
        state={stateLike}
        setState={() => {
          /* legacy no-op: add match handled separately */
        }}
        playersById={playersById}
        onShowFormula={setFormulaData}
        derivedMatches={derivedLike.matches}
        rankingData={rankingData}
        onMatchCreated={() => {
          loadMatches(true); // Force reload
        }}
      />

      {/* Formula Modal Moderno */}
      <FormulaModal
        isOpen={!!formulaData}
        onClose={() => setFormulaData(null)}
        matchData={formulaData}
      />
    </>
  );
}
