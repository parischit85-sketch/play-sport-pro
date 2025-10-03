// =============================================
// FILE: src/pages/StatsPage.jsx
// FUTURISTIC DESIGN - Modern glassmorphism UI
// =============================================
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { themeTokens } from "@lib/theme.js";
import { useClub } from '@contexts/ClubContext.jsx';
import { computeClubRanking } from "@lib/ranking-club.js";
import StatisticheGiocatore from "@features/stats/StatisticheGiocatore.jsx";

export default function StatsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { players, matches, clubId, playersLoaded, loadPlayers, matchesLoaded, loadMatches } = useClub();
  const T = React.useMemo(() => themeTokens(), []);

  const [selectedPlayerId, setSelectedPlayerId] = useState(
    searchParams.get("player") || "",
  );
  const [formulaText, setFormulaText] = useState("");

  // I dati si caricano automaticamente nel ClubContext quando cambia clubId

  // 🎯 AGGIUNTO: Usa computeClubRanking per avere rating calcolati dinamicamente
  // identici a quelli della Classifica
  const rankingData = React.useMemo(() => {
    if (!clubId) return { players: [], matches: [] };
    const srcPlayers = playersLoaded ? players : [];
    const srcMatches = matchesLoaded ? matches : [];
    return computeClubRanking(srcPlayers, srcMatches, clubId);
  }, [clubId, players, playersLoaded, matches, matchesLoaded]);

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
          onShowFormula={setFormulaText}
        />

        {/* Formula Modal - Futuristic Design */}
        {formulaText && (
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-white/20 dark:border-gray-700/20 shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    Formula calcolo punti (RPA)
                  </h3>
                  <button
                    onClick={() => setFormulaText("")}
                    className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 rounded-full transition-all duration-200 hover:scale-110 flex items-center justify-center"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-600/50">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed">
                    {formulaText}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
}
