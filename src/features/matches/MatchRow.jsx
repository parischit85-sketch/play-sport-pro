import React, { useState } from 'react';
import { DEFAULT_RATING } from '@lib/ids.js';
import { surnameOf } from '@lib/names.js';
import { computeFromSets, rpaFactor } from '@lib/rpa.js';

export default function MatchRow({ m, playersById, onShowFormula, onDelete, T }) {
  const [isExpanded, setIsExpanded] = useState(false);

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
    ? new Date(m.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
    : '';
  const deltaVal = Math.round(m.pts ?? 0);
  const deltaCls =
    deltaVal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';

  // Calcoli per la formula
  const rA1 = playersById[m.teamA[0]]?.rating ?? DEFAULT_RATING;
  const rA2 = playersById[m.teamA[1]]?.rating ?? DEFAULT_RATING;
  const rB1 = playersById[m.teamB[0]]?.rating ?? DEFAULT_RATING;
  const rB2 = playersById[m.teamB[1]]?.rating ?? DEFAULT_RATING;
  const sumA = rA1 + rA2;
  const sumB = rB1 + rB2;
  const rrLocal = computeFromSets(m.sets || []);
  const gap = rrLocal.winner === 'A' ? sumB - sumA : sumA - sumB;
  const factor = rpaFactor(gap);
  const GD =
    rrLocal.winner === 'A' ? rrLocal.gamesA - rrLocal.gamesB : rrLocal.gamesB - rrLocal.gamesA;
  const base = (sumA + sumB) / 100;

  return (
    <div
      className={`rounded-xl ${T.cardBg} ${T.border} overflow-hidden transition-all ${isExpanded ? 'ring-2 ring-blue-500/40 dark:ring-blue-400/60' : ''}`}
    >
      {/* Riga compatta cliccabile */}
      <div
        className="p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
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
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${winA ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200'}`}
            >
              {winA ? '✓ Team A' : '✓ Team B'}
            </span>
            {dateStr && <span className="text-xs text-gray-500 dark:text-gray-300">{dateStr}</span>}
          </div>
          <div className="text-sm mb-1">
            <span className={`${aCls} font-medium`}>{A}</span>
            <span className={`mx-2 text-gray-500 dark:text-gray-300`}>vs</span>
            <span className={`${bCls} font-medium`}>{B}</span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-200">
            Sets {m.setsA}-{m.setsB} • Games {m.gamesA}-{m.gamesB}
          </div>
        </div>
        <div className="shrink-0 text-right flex items-center gap-2">
          <div>
            <div className={`text-lg font-bold ${deltaCls}`}>
              {deltaVal >= 0 ? '+' : ''}
              {Math.abs(deltaVal)}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">punti</div>
          </div>
          <div className="text-gray-400 dark:text-gray-300 text-sm">{isExpanded ? '▲' : '▼'}</div>
        </div>
      </div>

      {/* Dettagli espansi */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-500 bg-gray-50 dark:bg-gray-700">
          <div className="p-4 space-y-4">
            {/* Squadre */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div
                className={`p-3 rounded-lg border-2 ${winA ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-900/40' : 'border-gray-300 bg-white dark:border-gray-500 dark:bg-gray-600'}`}
              >
                <div className="font-semibold text-gray-900 dark:text-white mb-1">{AFull}</div>
                <div className="text-xs text-gray-700 dark:text-gray-200">
                  Sets: {m.setsA} • Games: {m.gamesA}
                </div>
              </div>
              <div
                className={`p-3 rounded-lg border-2 ${!winA ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-900/40' : 'border-gray-300 bg-white dark:border-gray-500 dark:bg-gray-600'}`}
              >
                <div className="font-semibold text-gray-900 dark:text-white mb-1">{BFull}</div>
                <div className="text-xs text-gray-700 dark:text-gray-200">
                  Sets: {m.setsB} • Games: {m.gamesB}
                </div>
              </div>
            </div>

            {/* Set dettaglio compatto */}
            {Array.isArray(m.sets) && m.sets.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Set per set:
                </div>
                <div className="flex gap-2">
                  {m.sets.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-2 bg-white dark:bg-gray-600 rounded-lg text-sm border-2 border-gray-200 dark:border-gray-400 text-gray-900 dark:text-white font-medium"
                    >
                      {s.a}-{s.b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Formula compatta */}
            <div className="border-t border-gray-300 dark:border-gray-500 pt-4">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Calcolo punti RPA:
              </div>
              <div className="text-sm space-y-2 text-gray-800 dark:text-gray-100">
                <div className="bg-white dark:bg-gray-600 p-2 rounded border dark:border-gray-500">
                  <strong>Rating:</strong> A={Math.round(sumA)} vs B={Math.round(sumB)} (Gap:{' '}
                  {Math.round(gap)})
                </div>
                <div className="bg-white dark:bg-gray-600 p-2 rounded border dark:border-gray-500">
                  <strong>Calcolo:</strong> Base: {base.toFixed(1)} • DG: {GD} • Factor:{' '}
                  {factor.toFixed(2)}
                </div>
                <div className="bg-white dark:bg-gray-600 p-2 rounded border dark:border-gray-500">
                  <strong>Risultato:</strong>{' '}
                  <span className={`font-bold text-lg ${deltaCls}`}>
                    {deltaVal >= 0 ? '+' : ''}
                    {Math.abs(deltaVal)} punti
                  </span>
                </div>
              </div>
            </div>

            {/* Azioni */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-300 dark:border-gray-500">
              <button
                type="button"
                onClick={() => {
                  onShowFormula(
                    React.createElement(
                      'div',
                      { className: 'text-sm leading-6' },
                      React.createElement(
                        'div',
                        null,
                        `Team A=${Math.round(sumA)}, Team B=${Math.round(sumB)}, Gap=${Math.round(gap)}`
                      ),
                      React.createElement(
                        'div',
                        null,
                        `Base = (${Math.round(sumA)} + ${Math.round(sumB)})/100 = ${base.toFixed(2)}`
                      ),
                      React.createElement('div', null, `DG = ${GD}`),
                      React.createElement(
                        'div',
                        null,
                        `Punti = (Base + DG) × factor = (${base.toFixed(2)} + ${GD}) × ${factor.toFixed(2)} = ${(base + GD) * factor}`
                      ),
                      React.createElement(
                        'div',
                        null,
                        `Punti (arrotondato) = ${m.pts ?? Math.round((base + GD) * factor)}`
                      )
                    )
                  );
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                📊 Formula dettagliata
              </button>

              <button
                type="button"
                className="text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 px-3 py-1 rounded text-sm transition-colors"
                onClick={onDelete}
              >
                🗑️ Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
