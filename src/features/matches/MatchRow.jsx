import React, { useState } from 'react';
import { DEFAULT_RATING } from '@lib/ids.js';
import { surnameOf } from '@lib/names.js';
import { rpaFactor } from '@lib/rpa.js';

export default function MatchRow({ m, playersById, onShowFormula, onDelete, T }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // DEBUG MIRATO: MatchRow rendering
  // console.log('🎾 MATCHROW RENDER:', {
  //   matchId: m?.id,
  //   hasMatch: !!m,
  //   hasPlayersById: !!playersById,
  //   teamA: m?.teamA,
  //   teamB: m?.teamB,
  //   hasT: !!T,
  //   Tprops: T ? Object.keys(T) : 'NO_T'
  // });

  try {
    if (!m) {
      console.error('🎾 MATCHROW ERROR: No match data');
      return null;
    }

    if (!playersById) {
      console.error('🎾 MATCHROW ERROR: No playersById');
      return (
        <div style={{ padding: '10px', background: 'red', color: 'white' }}>Loading players...</div>
      );
    }

    if (!T) {
      console.error('🎾 MATCHROW ERROR: No T theme object');
      return (
        <div style={{ padding: '10px', background: 'orange', color: 'white' }}>
          Missing theme object
        </div>
      );
    }

    // console.log('🎾 MATCHROW: About to render main component');
  } catch (err) {
    console.error('🎾 MATCHROW ERROR in validation:', err);
    return (
      <div style={{ padding: '10px', background: 'purple', color: 'white' }}>
        Error: {err.message}
      </div>
    );
  }

  try {
    const nameOf = (id) => playersById?.[id]?.name ?? id;
    const A = `${surnameOf(nameOf(m.teamA[0]))} & ${surnameOf(nameOf(m.teamA[1]))}`;
    const B = `${surnameOf(nameOf(m.teamB[0]))} & ${surnameOf(nameOf(m.teamB[1]))}`;
    const AFull = `${nameOf(m.teamA[0])} & ${nameOf(m.teamA[1])}`;
    const BFull = `${nameOf(m.teamB[0])} & ${nameOf(m.teamB[1])}`;

    const winA = m.winner === 'A';
    const aCls = winA
      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
      : 'text-rose-600 dark:text-rose-400 font-semibold';
    const bCls = winA
      ? 'text-rose-600 dark:text-rose-400 font-semibold'
      : 'text-emerald-600 dark:text-emerald-400 font-semibold';

    const dateStr = m.date
      ? new Date(m.date).toLocaleDateString('it-IT', {
          day: '2-digit',
          month: 'short',
        })
      : '';

    // Calcoli per la formula
    // 🎯 Usa i rating e somme già calcolati e salvati nel match, se disponibili
    // Questo garantisce che vengano usati i rating corretti al momento della partita
    
    // Estrai i rating individuali usati per il calcolo
    const ratingA1 = m.preMatchRatings?.ratingA1 ?? playersById[m.teamA[0]]?.rating ?? DEFAULT_RATING;
    const ratingA2 = m.preMatchRatings?.ratingA2 ?? playersById[m.teamA[1]]?.rating ?? DEFAULT_RATING;
    const ratingB1 = m.preMatchRatings?.ratingB1 ?? playersById[m.teamB[0]]?.rating ?? DEFAULT_RATING;
    const ratingB2 = m.preMatchRatings?.ratingB2 ?? playersById[m.teamB[1]]?.rating ?? DEFAULT_RATING;
    
    const sumA = m.sumA ?? (ratingA1 + ratingA2);
    const sumB = m.sumB ?? (ratingB1 + ratingB2);
    
    // Usa gli altri valori già calcolati se disponibili
    const gap = m.gap ?? (m.winner === 'A' ? sumB - sumA : sumA - sumB);
    const factor = m.factor ?? rpaFactor(gap);
    const base = m.base ?? (sumA + sumB) / 100;
    const GD = m.gd ?? (m.winner === 'A' ? m.gamesA - m.gamesB : m.gamesB - m.gamesA);

    return (
      <div
        className={`relative rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-xl hover:shadow-2xl overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-blue-500/60 shadow-blue-500/20' : ''}`}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

        {/* Riga compatta cliccabile */}
        <div
          className="relative p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-gradient-to-r hover:from-white/10 hover:to-transparent transition-all duration-300"
          role="button"
          tabIndex={0}
          onClick={() => setIsExpanded(!isExpanded)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsExpanded((v) => !v);
            }
          }}
          aria-expanded={isExpanded}
        >
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border ${winA ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/20 border-rose-400/30 text-rose-700 dark:text-rose-300'}`}
              >
                {winA ? '✨ Team A vince' : '✨ Team B vince'}
              </span>
              {dateStr && (
                <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-700/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                  {dateStr}
                </span>
              )}
            </div>
            <div className="text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className={`${aCls} font-semibold bg-gradient-to-r from-current to-current bg-clip-text`}>
                  {A}
                </div>
                <div className="hidden sm:block text-gray-400 dark:text-gray-500">vs</div>
                <div className={`${bCls} font-semibold bg-gradient-to-r from-current to-current bg-clip-text`}>
                  {B}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-700/30 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              Sets {m.setsA}–{m.setsB} • Games {m.gamesA}–{m.gamesB}
            </div>
          </div>
          <div className="shrink-0 text-right flex items-center gap-3">
            <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-800/50 backdrop-blur-sm rounded-2xl px-3 py-2 border border-white/20 dark:border-gray-600/30">
              <div className="flex gap-2 items-center text-xs mb-1">
                <span
                  className={`font-bold ${Math.round(m.deltaA ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                >
                  A: {Math.round(m.deltaA ?? 0) >= 0 ? '+' : ''}
                  {Math.round(m.deltaA ?? 0)}
                </span>
                <span className="text-gray-400">|</span>
                <span
                  className={`font-bold ${Math.round(m.deltaB ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                >
                  B: {Math.round(m.deltaB ?? 0) >= 0 ? '+' : ''}
                  {Math.round(m.deltaB ?? 0)}
                </span>
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium text-center">
                punti RPA
              </div>
            </div>
            <div
              className={`text-gray-400 dark:text-gray-300 text-sm transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            >
              ▼
            </div>
          </div>
        </div>

        {/* Dettagli espansi */}
        {isExpanded && (
          <div className="border-t border-white/20 dark:border-gray-700/30 bg-gradient-to-b from-gray-50/50 to-gray-100/50 dark:from-gray-800/40 dark:to-gray-900/40 backdrop-blur-sm">
            <div className="p-4 space-y-4">
              {/* Squadre - Stacked su mobile */}
              <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 text-sm">
                <div
                  className={`p-4 rounded-2xl border backdrop-blur-sm ${winA ? 'border-emerald-400/30 bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 dark:from-emerald-900/40 dark:to-emerald-800/30' : 'border-rose-400/30 bg-gradient-to-br from-rose-50/80 to-rose-100/60 dark:from-rose-900/40 dark:to-rose-800/30'}`}
                >
                  <div className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    {winA && <span className="text-emerald-500">👑</span>}
                    {AFull}
                  </div>
                  <div className="text-xs text-gray-700 dark:text-gray-300 bg-white/40 dark:bg-gray-800/40 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    Sets: {m.setsA} • Games: {m.gamesA}
                  </div>
                </div>
                <div
                  className={`p-4 rounded-2xl border backdrop-blur-sm ${!winA ? 'border-emerald-400/30 bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 dark:from-emerald-900/40 dark:to-emerald-800/30' : 'border-rose-400/30 bg-gradient-to-br from-rose-50/80 to-rose-100/60 dark:from-rose-900/40 dark:to-rose-800/30'}`}
                >
                  <div className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    {!winA && <span className="text-emerald-500">👑</span>}
                    {BFull}
                  </div>
                  <div className="text-xs text-gray-700 dark:text-gray-300 bg-white/40 dark:bg-gray-800/40 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    Sets: {m.setsB} • Games: {m.gamesB}
                  </div>
                </div>
              </div>

              {/* Set dettaglio - Mobile scroll */}
              {Array.isArray(m.sets) && m.sets.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text">
                      📊
                    </span>
                    Set per set:
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {m.sets.map((s, i) => {
                      // Determina chi ha vinto questo set
                      const setWonByA = s.a > s.b;
                      // Se la squadra A ha vinto la partita e anche questo set, è verde
                      // Se la squadra A ha vinto la partita ma ha perso questo set, è rosso
                      const isWinningSet = winA ? setWonByA : !setWonByA;
                      
                      return (
                        <div
                          key={`${m.id}-set-${i}`}
                          className={`px-4 py-3 rounded-2xl text-sm font-semibold shrink-0 backdrop-blur-sm shadow-lg border ${
                            isWinningSet
                              ? 'bg-gradient-to-br from-emerald-100/90 to-emerald-200/70 dark:from-emerald-800/70 dark:to-emerald-900/50 border-emerald-400/40 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-100'
                              : 'bg-gradient-to-br from-rose-100/90 to-rose-200/70 dark:from-rose-800/70 dark:to-rose-900/50 border-rose-400/40 dark:border-rose-500/40 text-rose-900 dark:text-rose-100'
                          }`}
                        >
                          <div className="text-center">
                            <span className="text-xs opacity-70 block mb-1">
                              Set {i + 1}
                            </span>
                            <span className="text-lg">
                              {s.a}–{s.b}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Formula compatta - Mobile collapsible */}
              <div className="border-t border-white/20 dark:border-gray-700/30 pt-4">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-transparent bg-clip-text">
                    🧮
                  </span>
                  Calcolo punti RPA:
                </div>
                <div className="text-sm space-y-3 text-gray-800 dark:text-gray-100">
                  <div className="bg-gradient-to-r from-white/60 to-gray-50/40 dark:from-gray-700/40 dark:to-gray-800/30 backdrop-blur-sm p-3 rounded-xl border border-white/30 dark:border-gray-600/20">
                    <strong className="text-gray-900 dark:text-white">Rating:</strong>{' '}
                    <span className="text-gray-700 dark:text-gray-200">
                      A={Math.round(sumA)} vs B={Math.round(sumB)}{' '}
                      <span className="text-xs text-gray-500 dark:text-gray-400">(Gap: {Math.round(gap)})</span>
                    </span>
                  </div>
                  <div className="bg-gradient-to-r from-white/60 to-gray-50/40 dark:from-gray-700/40 dark:to-gray-800/30 backdrop-blur-sm p-3 rounded-xl border border-white/30 dark:border-gray-600/20">
                    <strong className="text-gray-900 dark:text-white">Calcolo:</strong>{' '}
                    <span className="text-gray-700 dark:text-gray-200">
                      Base: {base.toFixed(1)} • DG: {GD} • Factor: {factor.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50/60 to-green-100/40 dark:from-emerald-900/30 dark:to-green-900/20 backdrop-blur-sm p-3 rounded-xl border border-emerald-300/30 dark:border-emerald-600/20">
                    <strong className="text-gray-900 dark:text-white block mb-2">Risultato:</strong>
                    <div className="flex gap-4 text-sm flex-wrap">
                      <span
                        className={`font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm ${Math.round(m.deltaA ?? 0) >= 0 ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'}`}
                      >
                        Team A: {Math.round(m.deltaA ?? 0) >= 0 ? '+' : ''}
                        {Math.round(m.deltaA ?? 0)}
                      </span>
                      <span
                        className={`font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm ${Math.round(m.deltaB ?? 0) >= 0 ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'}`}
                      >
                        Team B: {Math.round(m.deltaB ?? 0) >= 0 ? '+' : ''}
                        {Math.round(m.deltaB ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Azioni */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-300 dark:border-gray-500">
                <button
                  type="button"
                  onClick={() => {
                    onShowFormula({
                      sumA,
                      sumB,
                      gap,
                      base,
                      gd: GD,
                      factor,
                      pts: m.pts ?? Math.round((base + GD) * factor),
                      winner: m.winner,
                      setsA: m.setsA,
                      setsB: m.setsB,
                      gamesA: m.gamesA,
                      gamesB: m.gamesB,
                      sets: m.sets || [],
                      deltaA: m.deltaA ?? 0,
                      deltaB: m.deltaB ?? 0,
                      teamA: m.teamA?.map((id, index) => ({
                        id,
                        name: playersById[id]?.name || 'Unknown',
                        rating: index === 0 ? ratingA1 : ratingA2
                      })),
                      teamB: m.teamB?.map((id, index) => ({
                        id,
                        name: playersById[id]?.name || 'Unknown',
                        rating: index === 0 ? ratingB1 : ratingB2
                      }))
                    });
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg shadow-md backdrop-blur-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Formula dettagliata
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-rose-300/50 dark:border-rose-700/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  onClick={onDelete}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Elimina
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('[MatchRow] Rendering error:', error);
    return (
      <div style={{ padding: '10px', border: '1px solid red', backgroundColor: '#ffe6e6' }}>
        <p>Error rendering match: {error.message}</p>
        <p>Match ID: {m?.id}</p>
      </div>
    );
  }
}
