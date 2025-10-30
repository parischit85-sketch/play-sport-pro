/* eslint-disable react/no-unescaped-entities */
import React from 'react';

/**
 * Modal moderno per spiegare il sistema di calcolo RPA (Rating Points Algorithm)
 * Design glassmorphism con sezioni educative - Fasce ordinate per factor crescente
 */
export default function FormulaModal({ isOpen, onClose, matchData }) {
  if (!isOpen || !matchData) return null;

  const {
    sumA = 0,
    sumB = 0,
    gap = 0,
    base = 0,
    gd = 0,
    factor = 0,
    pts = 0,
    ptsWithMultiplier = pts,
    multiplier = 1,
    winner = 'A',
    gamesA = 0,
    gamesB = 0,
    sets = [],
    deltaA = 0,
    deltaB = 0,
    teamA = [],
    teamB = [],
  } = matchData || {};

  const winnerA = winner === 'A';
  const winnerB = winner === 'B';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4 animate-fadeIn">
      <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl md:rounded-3xl max-w-4xl w-full max-h-[90vh] md:max-h-[85vh] overflow-hidden border border-gray-700/30 shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-4 md:p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center border border-white/30 shrink-0">
                <svg
                  className="w-5 h-5 md:w-7 md:h-7 text-white"
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
              <div className="min-w-0">
                <h3 className="text-lg md:text-2xl font-bold text-white drop-shadow-lg truncate">
                  Sistema di Calcolo RPA
                </h3>
                <p className="text-white/90 text-xs md:text-sm mt-0.5 md:mt-1 truncate">
                  Rating Points Algorithm
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 md:w-10 md:h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full transition-all duration-200 hover:scale-110 hover:rotate-90 flex items-center justify-center border border-white/30 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] md:max-h-[calc(85vh-120px)] p-3 md:p-6 space-y-4 md:space-y-6">
          {/* Squadre e Gap */}
          <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 rounded-2xl p-4 md:p-5 border border-blue-700/30 backdrop-blur-sm">
            {/* Desktop: 3 colonne - Mobile: Stack verticale */}
            <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
              {/* Team A */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                  <span className="text-sm text-gray-400 font-semibold">
                    Team A
                  </span>
                  {winnerA && <span className="text-lg">🏆</span>}
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      Math.round(deltaA) >= 0
                        ? 'bg-emerald-900/30 text-emerald-300'
                        : 'bg-rose-900/30 text-rose-300'
                    }`}
                  >
                    {Math.round(deltaA) >= 0 ? '+' : ''}
                    {Math.round(deltaA)}
                  </span>
                </div>
                <div
                  className={`bg-gray-800/40 rounded-xl p-3 backdrop-blur-sm mb-3 ${winnerA ? 'ring-2 ring-emerald-400' : 'ring-2 ring-rose-500'}`}
                >
                  <div
                    className={`text-3xl md:text-2xl font-bold ${winnerA ? 'text-emerald-400' : 'text-rose-400'}`}
                  >
                    {Math.round(sumA)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    rating partita
                  </div>
                </div>
                {/* Team A Players */}
                <div className="space-y-1.5">
                  {teamA.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between bg-blue-900/20 rounded-lg px-3 py-2 text-sm md:text-xs"
                    >
                      <span className="text-gray-300 font-medium truncate">
                        {player.name}
                      </span>
                      <span className="text-blue-400 font-bold ml-2">
                        {player.rating}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* VS e Gap con Set - Centrale tra i team */}
              <div className="text-center flex flex-col justify-center gap-3">
                <div className="hidden md:block text-3xl font-bold text-gray-500">
                  VS
                </div>

                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-3 border border-purple-700/30">
                  <div className="text-xs text-gray-400">Gap</div>
                  <div
                    className={`text-2xl md:text-xl font-bold ${gap > 0 ? 'text-green-400' : gap < 0 ? 'text-red-400' : 'text-gray-400'}`}
                  >
                    {gap > 0 ? '+' : ''}
                    {Math.round(gap)}
                  </div>
                </div>

                {/* Slot Set con punteggi */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {sets.map((set, i) => {
                    const setWonByA = set.a > set.b;
                    const setNumber = i + 1;

                    return (
                      <div
                        key={i}
                        className={`relative rounded-lg px-4 py-2.5 md:px-3 md:py-2 text-sm md:text-xs font-bold shadow-md border-2 ${
                          setWonByA
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-rose-600 text-white border-rose-700'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-[10px] opacity-80 mb-0.5">Set {setNumber}</div>
                          <div className="text-base md:text-sm font-bold">
                            {set.a}–{set.b}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Team B */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                  <span className="text-sm text-gray-400 font-semibold">
                    Team B
                  </span>
                  {winnerB && <span className="text-lg">🏆</span>}
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      Math.round(deltaA) >= 0
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {Math.round(deltaB) >= 0 ? '+' : ''}
                    {Math.round(deltaB)}
                  </span>
                </div>
                <div
                  className={`bg-gray-800/40 rounded-xl p-3 backdrop-blur-sm mb-3 ${winnerA ? 'ring-2 ring-emerald-500' : 'ring-2 ring-rose-400'}`}
                >
                  <div
                    className={`text-3xl md:text-2xl font-bold ${winnerA ? 'text-emerald-600' : 'text-rose-600'}`}
                  >
                    {Math.round(sumB)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">rating partita</div>
                </div>
                {/* Team B Players */}
                <div className="space-y-1.5">
                  {teamB.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between bg-purple-900/20 rounded-lg px-3 py-2 text-sm md:text-xs"
                    >
                      <span className="text-gray-300 font-medium truncate">{player.name}</span>
                      <span className="text-purple-400 font-bold ml-2">{player.rating}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Introduzione - Come funziona */}
          <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 rounded-2xl p-4 md:p-6 border border-blue-700/30 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-lg">💡</span>
              </div>
              <div>
                <h4 className="font-bold text-white text-base md:text-lg mb-2">
                  Come funziona il sistema?
                </h4>
                <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                  Il sistema <strong>RPA (Rating Points Algorithm)</strong> calcola automaticamente
                  i punti guadagnati o persi in una partita basandosi su:
                </p>
                <ul className="mt-3 space-y-2 text-sm md:text-base text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>
                      <strong>Rating dei giocatori:</strong> più forte l'avversario, più punti
                      guadagni vincendo
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>
                      <strong>Differenza di livello:</strong> battere un avversario più forte vale
                      di più
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>
                      <strong>Margine di vittoria:</strong> il punteggio finale influenza i punti
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Risultato Finale */}
          <div className="bg-gradient-to-br from-indigo-800/40 to-purple-800/30 rounded-2xl p-4 md:p-6 border-2 border-indigo-600/40 backdrop-blur-sm shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white font-bold">✓</span>
              </div>
              <h4 className="font-bold text-white text-lg md:text-xl">Risultato Finale</h4>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 md:p-5 backdrop-blur-sm">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-400 mb-2">Formula completa:</div>
                <div className="text-base md:text-lg font-mono bg-gradient-to-r from-purple-900/30 to-indigo-900/30 px-3 md:px-4 py-3 rounded-lg border border-purple-700/30 overflow-x-auto">
                  (<span className="text-emerald-300 font-bold">Base</span> +{' '}
                  <span className="text-orange-300 font-bold">
                    Differenza Game
                  </span>
                  ) × <span className="text-cyan-300 font-bold">Factor</span> ={' '}
                  <span className="text-indigo-300 font-bold">Punti</span>
                </div>
              </div>
              <div className="text-center mb-4">
                <div className="text-sm text-gray-400 mb-2">Calcolo:</div>
                <div className="text-base md:text-lg font-mono bg-gray-800 px-3 md:px-4 py-3 rounded-lg border border-gray-600 overflow-x-auto">
                  (
                  <span className="text-emerald-300 font-bold">
                    {base.toFixed(2)}
                  </span>{' '}
                  + <span className="text-orange-300 font-bold">{gd}</span>) ×{' '}
                  <span className="text-cyan-300 font-bold">
                    {factor.toFixed(2)}
                  </span>{' '}
                  ={' '}
                  <span className="text-indigo-300 font-bold">
                    {((base + gd) * factor).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="border-t-2 border-indigo-700/30 pt-4 mt-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">
                    Punti RPA (base, senza moltiplicatore):
                  </div>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-4">
                    {pts ?? Math.round((base + gd) * factor)}
                  </div>
                  {multiplier !== 1 && (
                    <>
                      <div className="text-sm text-gray-400 mb-2 mt-4">
                        Moltiplicatore torneo:{' '}
                        <span className="font-bold text-blue-400">
                          {multiplier}×
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mb-2">
                        Formula finale:
                      </div>
                      <div className="text-base md:text-lg font-mono bg-blue-900/20 px-3 md:px-4 py-2 rounded-lg inline-block border border-blue-700/30">
                        {pts} × {multiplier} ={' '}
                        <span className="font-bold text-blue-400">
                          {Math.round(ptsWithMultiplier)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mb-2 mt-4">
                        Punti finali assegnati (con moltiplicatore):
                      </div>
                      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text">
                        {Math.round(ptsWithMultiplier)}
                      </div>
                    </>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    punti RPA {multiplier !== 1 ? 'finali' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 1: Punti Base della Partita */}
          <div className="bg-gradient-to-br from-emerald-900/30 to-green-900/20 rounded-2xl p-6 border border-emerald-700/30 backdrop-blur-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="font-bold text-white text-lg">
                Punti Base della Partita
              </h4>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-center mb-3">
                <div className="text-sm text-gray-400 mb-2">Formula:</div>
                <div className="text-base md:text-lg font-mono bg-emerald-900/30 px-3 md:px-4 py-2 rounded-lg inline-block">
                  (Team A + Team B) ÷ 100 ={' '}
                  <span className="font-bold text-emerald-400">
                    Punti Base
                  </span>
                </div>
              </div>
              <div className="text-center mt-4">
                <div className="text-sm text-gray-400 mb-2">Calcolo:</div>
                <div className="text-base md:text-lg font-mono bg-gray-800/40 px-3 md:px-4 py-2 rounded-lg inline-block">
                  ({Math.round(sumA)} + {Math.round(sumB)}) ÷ 100 ={' '}
                  <span className="font-bold text-emerald-400">
                    {base.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-400 italic">
              ⚖️ Partite tra giocatori più forti valgono più punti base
            </p>
          </div>

          {/* Step 2: Game Differential */}
          <div className="bg-gradient-to-br from-orange-900/30 to-amber-900/20 rounded-2xl p-4 md:p-6 border border-orange-700/30 backdrop-blur-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className="font-bold text-white text-base md:text-lg">
                Margine di Vittoria (Game Differential)
              </h4>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-center mb-3">
                <div className="text-sm text-gray-400 mb-2">Formula:</div>
                <div className="text-base md:text-lg font-mono bg-orange-900/30 px-3 md:px-4 py-2 rounded-lg inline-block">
                  {winnerA ? 'Games Team A - Games Team B' : 'Games Team B - Games Team A'} ={' '}
                  <span className="font-bold text-orange-400">GD</span>
                </div>
              </div>
              <div className="text-center mt-4">
                <div className="text-sm text-gray-400 mb-2">Calcolo:</div>
                <div className="text-base md:text-lg font-mono bg-gray-800/40 px-3 md:px-4 py-2 rounded-lg inline-block">
                  {winnerA ? `${gamesA} - ${gamesB}` : `${gamesB} - ${gamesA}`} ={' '}
                  <span className="font-bold text-orange-400">{gd}</span>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-400 italic">
              🎯 Vincere con un margine più ampio assegna più punti
            </p>
          </div>

          {/* Step 3: Factor - ORDINATO DAL PIÙ BASSO AL PIÙ ALTO */}
          <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 rounded-2xl p-6 border border-cyan-700/30 backdrop-blur-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">3</span>
              </div>
              <h4 className="font-bold text-white text-lg">
                Fattore Moltiplicatore
              </h4>
            </div>

            <div className="bg-gray-800/40 rounded-xl p-4 backdrop-blur-sm mb-4">
              <div className="text-center mb-3">
                <div className="text-sm text-gray-400 mb-2">
                  Gap di questa partita:{' '}
                  <span className="font-bold text-cyan-300">
                    {Math.round(gap)}
                  </span>
                </div>
                <div className="text-4xl font-bold text-cyan-400">
                  Factor = {factor.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-700/30">
                <p className="text-sm font-bold text-gray-200 mb-2 flex items-center gap-2">
                  <span className="text-lg">ℹ️</span>
                  Come funziona:
                </p>
                <ul className="text-xs text-gray-300 space-y-1 ml-6">
                  <li>
                    • Il <strong>vincitore</strong> guadagna <strong>Punti Base × Factor</strong>
                  </li>
                  <li>
                    • Il <strong>perdente</strong> perde <strong>gli stessi punti</strong> (sistema
                    a somma zero)
                  </li>
                  <li>
                    • Il Factor dipende dal <strong>gap</strong> (differenza di rating tra le
                    squadre)
                  </li>
                </ul>
              </div>

              <p className="text-sm font-semibold text-gray-200 mb-3">
                📊 Fasce del Factor per il VINCITORE (dal più basso al più alto):
              </p>

              {/* Fasce compatte ordinate per factor crescente */}
              <div className="space-y-1.5">
                {/* Factor 0.40 */}
                <div
                  className={`p-2.5 rounded-lg border transition-all ${gap <= -2000 ? 'bg-red-900/40 border-red-500 shadow-md' : 'bg-gray-800/30 border-gray-600/30'}`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-gray-300 min-w-[130px]">
                      Gap ≤ -2000
                    </span>
                    <span className="text-xl">🔴</span>
                    <span className="font-bold text-red-400 min-w-[40px]">
                      0.40
                    </span>
                    <span className="text-gray-400 text-xs">
                      - Vittoria scontata → pochi punti bonus (protezione da inflazione)
                    </span>
                  </div>
                </div>

                {/* Factor 0.60 */}
                <div
                  className={`p-2.5 rounded-lg border transition-all ${gap <= -1500 && gap > -2000 ? 'bg-orange-900/40 border-orange-500 shadow-md' : 'bg-gray-800/30 border-gray-600/30'}`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-gray-300 min-w-[130px]">
                      Gap -1500 a -2000
                    </span>
                    <span className="text-xl">🟠</span>
                    <span className="font-bold text-orange-400 min-w-[40px]">
                      0.60
                    </span>
                    <span className="text-gray-400 text-xs">
                      - Vittoria molto probabile → factor ridotto
                    </span>
                  </div>
                </div>

                {/* Factor 0.75 */}
                <div
                  className={`p-2.5 rounded-lg border transition-all ${gap <= -900 && gap > -1500 ? 'bg-amber-900/40 border-amber-500 shadow-md' : 'bg-gray-800/30 border-gray-600/30'}`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-gray-300 min-w-[130px]">
                      Gap -900 a -1500
                    </span>
                    <span className="text-xl">🟡</span>
                    <span className="font-bold text-amber-400 min-w-[40px]">
                      0.75
                    </span>
                    <span className="text-gray-400 text-xs">
                      - Vittoria probabile → factor moderatamente ridotto
                    </span>
                  </div>
                </div>

                {/* Factor 0.90 */}
                <div
                  className={`p-2.5 rounded-lg border transition-all ${gap <= -300 && gap > -900 ? 'bg-yellow-900/40 border-yellow-500 shadow-md' : 'bg-gray-800/30 border-gray-600/30'}`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-gray-300 min-w-[130px]">
                      Gap -300 a -900
                    </span>
                    <span className="text-xl">🟢</span>
                    <span className="font-bold text-yellow-400 min-w-[40px]">
                      0.90
                    </span>
                    <span className="text-gray-400 text-xs">
                      - Leggero vantaggio → piccola riduzione del factor
                    </span>
                  </div>
                </div>

                {/* Factor 1.00 - EQUILIBRATO */}
                <div
                  className={`p-2.5 rounded-lg border transition-all ${Math.abs(gap) < 300 ? 'bg-emerald-900/50 border-emerald-500 shadow-lg' : 'bg-gray-800/30 border-gray-600/30'}`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-gray-300 min-w-[130px]">
                      Gap -300 a +300
                    </span>
                    <span className="text-xl">💚</span>
                    <span className="font-bold text-emerald-400 min-w-[40px]">
                      1.00
                    </span>
                    <span className="text-gray-400 text-xs">- EQUILIBRATA</span>
                  </div>
                </div>

                {/* Factor 1.10 */}
                <div
                  className={`p-2.5 rounded-lg border transition-all ${gap >= 300 && gap <= 900 ? 'bg-cyan-900/40 border-cyan-500 shadow-md' : 'bg-gray-800/30 border-gray-600/30'}`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-gray-300 min-w-[130px]">
                      Gap +300 a +900
                    </span>
                    <span className="text-xl">🔵</span>
                    <span className="font-bold text-cyan-400 min-w-[40px]">
                      1.10
                    </span>
                    <span className="text-gray-400 text-xs">
                      - Sfavorito vince
                    </span>
                  </div>
                </div>

                {/* Factor 1.25 */}
                <div
                  className={`p-2.5 rounded-lg border transition-all ${gap > 900 && gap <= 1500 ? 'bg-blue-900/40 border-blue-500 shadow-md' : 'bg-gray-800/30 border-gray-600/30'}`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-gray-300 min-w-[130px]">
                      Gap +900 a +1500
                    </span>
                    <span className="text-xl">🔷</span>
                    <span className="font-bold text-blue-400 min-w-[40px]">
                      1.25
                    </span>
                    <span className="text-gray-400 text-xs">
                      - Sfavorito vince inaspettatamente
                    </span>
                  </div>
                </div>

                {/* Factor 1.40 */}
                <div
                  className={`p-2.5 rounded-lg border transition-all ${gap > 1500 && gap <= 2000 ? 'bg-indigo-900/40 border-indigo-500 shadow-md' : 'bg-gray-800/30 border-gray-600/30'}`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-gray-300 min-w-[130px]">
                      Gap +1500 a +2000
                    </span>
                    <span className="text-xl">🟣</span>
                    <span className="font-bold text-indigo-400 min-w-[40px]">
                      1.40
                    </span>
                    <span className="text-gray-400 text-xs">
                      - Sfavorito vince, partita da ricordare
                    </span>
                  </div>
                </div>

                {/* Factor 1.60 - MASSIMO */}
                <div
                  className={`p-2.5 rounded-lg border transition-all ${gap > 2000 ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500 shadow-lg' : 'bg-gray-800/30 border-gray-600/30'}`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-gray-300 min-w-[130px]">
                      Gap &gt; +2000
                    </span>
                    <span className="text-xl">🌈</span>
                    <span className="font-bold text-purple-400 min-w-[40px]">
                      1.60
                    </span>
                    <span className="text-gray-400 text-xs">
                      - Bonus massimo per impresa storica!
                    </span>
                  </div>
                </div>
              </div>

              {/* Box importante */}
              <div className="mt-4 bg-gradient-to-r from-rose-900/30 to-red-900/30 rounded-xl p-4 border-2 border-rose-700/40">
                <p className="text-sm font-bold text-gray-200 mb-2 flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  Importante - Sistema a Somma Zero:
                </p>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>
                    Il{' '}
                    <strong className="text-rose-300">
                      perdente perde ESATTAMENTE gli stessi punti
                    </strong>{' '}
                    che il vincitore guadagna.
                  </p>
                  <p className="text-xs italic mt-2">
                    📌 Esempio: Se il vincitore guadagna +50 punti, il perdente perde -50 punti. La
                    somma totale dei punti nel ranking rimane sempre zero.
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-cyan-900/20 rounded-lg p-4 border border-cyan-700/20">
                <p className="text-sm font-bold text-gray-200 mb-2">
                  🎯 Riepilogo Logica:
                </p>
                <ul className="text-xs text-gray-300 space-y-1 ml-4">
                  <li>
                    • <strong>Factor &lt; 1.0:</strong> Il favorito vince come previsto → punti
                    ridotti per evitare inflazione
                  </li>
                  <li>
                    • <strong>Factor = 1.0:</strong> Partita equilibrata → scambio standard di punti
                  </li>
                  <li>
                    • <strong>Factor &gt; 1.0:</strong> Lo sfavorito fa l'upset → bonus punti per
                    l'impresa
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Nota informativa */}
          <div className="bg-gradient-to-r from-gray-700/40 to-slate-700/30 rounded-2xl p-5 border border-gray-600/30 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">ℹ️</span>
              </div>
              <div className="text-sm text-gray-400">
                <strong className="text-gray-200">
                  Sistema equo e bilanciato:
                </strong>{' '}
                I vincitori guadagnano esattamente gli stessi punti che i perdenti perdono. La somma
                totale dei punti nel sistema rimane sempre zero (somma zero).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

