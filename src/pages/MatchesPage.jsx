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

export default function MatchesPage() {
  const { clubId, loadPlayers, players, playersLoaded, loadMatches, matches, matchesLoaded } =
    useClub();
  const { clubMode } = useUI();
  const { userRole, user, isClubAdmin } = useAuth();
  const T = React.useMemo(() => themeTokens(), []);

  // Gli admin di club possono sempre accedere, anche senza clubMode attivato
  const canAccessMatches = clubMode || isClubAdmin(clubId);
  const [formulaText, setFormulaText] = useState('');
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
        onShowFormula={setFormulaText}
        derivedMatches={derivedLike.matches}
        rankingData={rankingData}
        onMatchCreated={() => {
          loadMatches(true); // Force reload
        }}
      />

      {/* Formula Modal - TODO: Convert to proper modal */}
      {formulaText && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto border dark:border-gray-600">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Formula calcolo punti (RPA) – Spiegazione
                </h3>
                <button
                  onClick={() => setFormulaText('')}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                {formulaText}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
