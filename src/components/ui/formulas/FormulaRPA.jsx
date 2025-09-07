// =============================================
// FILE: src/components/ui/formulas/FormulaRPA.jsx
// =============================================
import React from 'react';
import { rpaBracketText, fmtInt, fmt2 } from '@lib/rpa.js';
function computeFromSets(sets){ let setsA=0,setsB=0,gamesA=0,gamesB=0; for(const s of sets||[]){ const a=Number(s?.a||0), b=Number(s?.b||0); if(String(a)===''&&String(b)==='') continue; gamesA+=a; gamesB+=b; if(a>b) setsA++; else if(b>a) setsB++; } let winner=null; if(setsA>setsB) winner='A'; else if(setsB>setsA) winner='B'; return {setsA,setsB,gamesA,gamesB,winner}; }
function setsToString(sets){ return (sets || []).filter((s)=> String(s?.a??'')!=='' || String(s?.b??'')!=='').map((s)=> `${Number(s.a||0)}-${Number(s.b||0)}`).join(', '); }
export function FormulaRPA({ sumA, sumB, gap, base, factor, gd, pts, winner, sets }) {
  const rr = computeFromSets(sets || []);
  const beforeFactor = base + gd; 
  const finalPoints = beforeFactor * factor; 
  const setsStr = setsToString(sets || []);
  
  return (
    <div className="space-y-3 text-sm">
      {/* Step 1: Dati iniziali */}
      <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div>
          <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">RATING SQUADRE</div>
          <div className="text-sm">Team A: {fmtInt(sumA)}</div>
          <div className="text-sm">Team B: {fmtInt(sumB)}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">DIFFERENZA</div>
          <div className="text-sm">Gap: {fmtInt(gap)}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400">Fascia: {rpaBracketText(gap)}</div>
        </div>
      </div>

      {/* Step 2: Calcolo base */}
      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <div className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-2">STEP 1: PUNTEGGIO BASE</div>
        <div className="text-sm font-mono">
          Base = (Team A + Team B) ÷ 100 = ({fmtInt(sumA)} + {fmtInt(sumB)}) ÷ 100 = <span className="font-bold text-yellow-700 dark:text-yellow-300">{fmt2(base)}</span>
        </div>
        <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
          Il punteggio base rappresenta il livello medio della partita
        </div>
      </div>

      {/* Step 3: Differenza games */}
      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">STEP 2: BONUS/MALUS GAMES</div>
        <div className="text-sm">
          DG (Differenza Game) = <span className="font-bold text-purple-700 dark:text-purple-300">{gd}</span>
        </div>
        <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
          {gd > 0 ? 'Bonus per aver vinto più games' : gd < 0 ? 'Malus per aver vinto meno games' : 'Nessun bonus/malus (parità games)'}
        </div>
      </div>

      {/* Step 4: Moltiplicatore */}
      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="text-xs font-semibold text-green-700 dark:text-green-300 mb-2">STEP 3: MOLTIPLICATORE</div>
        <div className="text-sm font-mono">
          Punti = (Base + DG) × Factor = ({fmt2(base)} + {gd}) × {factor.toFixed(2)} = <span className="font-bold text-green-700 dark:text-green-300">{fmt2(finalPoints)}</span>
        </div>
        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
          Factor {factor.toFixed(2)}: {factor > 1 ? 'partita contro avversari più forti' : factor < 1 ? 'partita contro avversari più deboli' : 'partita equilibrata'}
        </div>
      </div>

      {/* Risultato finale */}
      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">RISULTATO FINALE</div>
            <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Punti assegnati: {pts}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Set vinti</div>
            <div className="text-sm font-semibold">{rr.setsA}-{rr.setsB}</div>
            <div className="text-xs text-gray-500">({setsStr})</div>
          </div>
        </div>
      </div>
    </div>
  );
}

