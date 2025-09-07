// =============================================
// FILE: src/pages/PlayersPage.jsx
// =============================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { themeTokens } from '@lib/theme.js';
import { useLeague } from '@contexts/LeagueContext.jsx';
import { useUI } from '@contexts/UIContext.jsx';
import Giocatori from '@features/players/Giocatori.jsx';

export default function PlayersPage() {
  const navigate = useNavigate();
  const { state, setState, playersById } = useLeague();
  const { clubMode } = useUI();
  const T = React.useMemo(() => themeTokens(), []);

  const handleOpenStats = (playerId) => {
    navigate(`/stats?player=${playerId}`);
  };

  if (!clubMode) {
    return (
      <div className={`text-center py-12 ${T.cardBg} ${T.border} rounded-xl m-4`}>
        <div className="text-6xl mb-4">🔒</div>
        <h3 className={`text-xl font-bold mb-2 ${T.text}`}>Modalità Club Richiesta</h3>
        <p className={`${T.subtext} mb-4`}>
          Per accedere alla gestione giocatori, devi prima sbloccare la modalità club nella sezione Extra.
        </p>
        <button 
          onClick={() => navigate('/extra')} 
          className={`${T.btnPrimary} px-6 py-3`}
        >
          Vai a Extra per sbloccare
        </button>
      </div>
    );
  }

  return (
    <Giocatori
      T={T}
      state={state}
      setState={setState}
      onOpenStats={handleOpenStats}
      playersById={playersById}
    />
  );
}
