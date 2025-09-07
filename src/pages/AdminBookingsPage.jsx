// =============================================
// FILE: src/pages/AdminBookingsPage.jsx
// =============================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { themeTokens } from '@lib/theme.js';
import { useLeague } from '@contexts/LeagueContext.jsx';
import { useUI } from '@contexts/UIContext.jsx';
import PrenotazioneCampi from '@features/prenota/PrenotazioneCampi.jsx';

export default function AdminBookingsPage() {
  const navigate = useNavigate();
  const { state, setState, derived, playersById, loading } = useLeague();
  const { clubMode } = useUI();
  const T = React.useMemo(() => themeTokens(), []);

  // Show loading state
  if (loading || !state) {
    return (
      <div className={`text-center py-12 ${T.cardBg} ${T.border} rounded-xl m-4`}>
        <div className="text-4xl mb-4">⏳</div>
        <h3 className={`text-lg font-medium mb-2 ${T.text}`}>Caricamento...</h3>
        <p className={`${T.subtext}`}>Caricamento configurazione campi in corso...</p>
      </div>
    );
  }

  if (!clubMode) {
    return (
      <div className={`text-center py-12 ${T.cardBg} ${T.border} rounded-xl m-4`}>
        <div className="text-6xl mb-4">🔒</div>
        <h3 className={`text-xl font-bold mb-2 ${T.text}`}>Modalità Club Richiesta</h3>
        <p className={`${T.subtext} mb-4`}>
          Per accedere alla gestione campi, devi prima sbloccare la modalità club nella sezione Extra.
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
    <PrenotazioneCampi
      T={T}
      state={state}
      setState={setState}
      players={derived.players}
      playersById={playersById}
    />
  );
}
