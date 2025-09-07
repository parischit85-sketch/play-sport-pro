// =============================================
// FILE: src/pages/MatchesPage.jsx
// =============================================
import React, { useState } from 'react';
import { themeTokens } from '@lib/theme.js';
import { useLeague } from '@contexts/LeagueContext.jsx';
import { useUI } from '@contexts/UIContext.jsx';
import CreaPartita from '@features/crea/CreaPartita.jsx';

export default function MatchesPage() {
  const { state, setState, derived, playersById } = useLeague();
  const { clubMode } = useUI();
  const T = React.useMemo(() => themeTokens(), []);
  const [formulaText, setFormulaText] = useState('');

  if (!clubMode) {
    return (
      <div className={`text-center py-12 ${T.cardBg} ${T.border} rounded-xl m-4`}>
        <div className="text-6xl mb-4">🔒</div>
        <h3 className={`text-xl font-bold mb-2 ${T.text}`}>Modalità Club Richiesta</h3>
        <p className={`${T.subtext} mb-4`}>
          Per accedere alla creazione partite, devi prima sbloccare la modalità club nella sezione Extra.
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
    <>
      <CreaPartita
        T={T}
        state={state}
        setState={setState}
        playersById={playersById}
        onShowFormula={setFormulaText}
        derivedMatches={derived.matches}
      />
      
      {/* Formula Modal - TODO: Convert to proper modal */}
      {formulaText && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Formula calcolo punti (RPA) – Spiegazione</h3>
                <button
                  onClick={() => setFormulaText('')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm">{formulaText}</pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
