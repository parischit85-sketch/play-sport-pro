// =============================================
// FILE: src/pages/MatchesPage.jsx
// =============================================
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { themeTokens } from '@lib/theme.js';
// Removed legacy LeagueContext in favour of ClubContext + per-club loaders
import { useClub } from '@contexts/ClubContext.jsx';
import { createClubMatch, deleteClubMatch } from '@services/club-matches.js';
import { useUI } from '@contexts/UIContext.jsx';
import { useAuth } from '@contexts/AuthContext.jsx';
import { computeClubRanking } from '@lib/ranking-club.js';
import CreaPartita from '@features/crea/CreaPartita.jsx';
import FormulaModal from '../components/modals/FormulaModal';

export default function MatchesPage() {
  const { clubId, loadPlayers, players, playersLoaded, loadMatches, matches, matchesLoaded } =
    useClub();
  const { clubMode } = useUI();
  const { userRole, user, isClubAdmin } = useAuth();
  const T = React.useMemo(() => themeTokens(), []);

  // Gli admin di club possono sempre accedere, anche senza clubMode attivato
  const canAccessMatches = clubMode || isClubAdmin(clubId);
  const [formulaData, setFormulaData] = useState(null);
  const navigate = useNavigate();

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

  // Prepara playersById derivato lato client
  const playersById = React.useMemo(
    () => Object.fromEntries(players.map((p) => [p.id, p])),
    [players]
  );

  React.useEffect(() => {
    if (clubId) {
      if (!playersLoaded) loadPlayers();
      if (!matchesLoaded) loadMatches();
    }
  }, [clubId, playersLoaded, matchesLoaded, loadPlayers, loadMatches]);

  // Calcola ranking data con rating computati come in StatsPage
  const rankingData = useMemo(() => {
    if (!players.length || !matches.length) {
      return { players: [], matches: [] };
    }
    return computeClubRanking(players, matches, clubId);
  }, [players, matches, clubId]);

  const stateLike = React.useMemo(() => ({ players }), [players]);
  const derivedLike = React.useMemo(() => ({ matches }), [matches]);

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
