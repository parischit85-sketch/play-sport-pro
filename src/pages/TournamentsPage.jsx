// =============================================
// FILE: src/pages/TournamentsPage.jsx
// =============================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { themeTokens } from '@lib/theme.js';
import { useUI } from '@contexts/UIContext.jsx';
import CreaTornei from '@features/tornei/CreaTornei.jsx';

export default function TournamentsPage() {
  const navigate = useNavigate();
  const { clubMode } = useUI();
  const T = React.useMemo(() => themeTokens(), []);

  if (!clubMode) {
    return (
      <div className={`text-center py-12 ${T.cardBg} ${T.border} rounded-xl m-4`}>
        <div className="text-6xl mb-4">🔒</div>
        <h3 className={`text-xl font-bold mb-2 ${T.text}`}>Modalità Club Richiesta</h3>
        <p className={`${T.subtext} mb-4`}>
          Per accedere alla creazione tornei, devi prima sbloccare la modalità club nella sezione Extra.
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

  return <CreaTornei T={T} />;
}
