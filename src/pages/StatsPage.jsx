// =============================================
// FILE: src/pages/StatsPage.jsx
// =============================================
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { themeTokens } from '@lib/theme.js';
import { useLeague } from '@contexts/LeagueContext.jsx';
import StatisticheGiocatore from '@features/stats/StatisticheGiocatore.jsx';

export default function StatsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { derived } = useLeague();
  const T = React.useMemo(() => themeTokens(), []);

  const [selectedPlayerId, setSelectedPlayerId] = useState(
    searchParams.get('player') || ''
  );
  const [formulaText, setFormulaText] = useState('');

  const handleSelectPlayer = (playerId) => {
    setSelectedPlayerId(playerId);
    if (playerId) {
      setSearchParams({ player: playerId });
    } else {
      setSearchParams({});
    }
  };

  return (
    <>
      <StatisticheGiocatore
        T={T}
        players={derived.players}
        matches={derived.matches}
        selectedPlayerId={selectedPlayerId}
        onSelectPlayer={handleSelectPlayer}
        onShowFormula={setFormulaText}
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
