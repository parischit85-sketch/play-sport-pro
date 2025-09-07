// =============================================
// FILE: src/components/ui/formulas/FormulaIntro.jsx
// =============================================
import React from 'react';
export function FormulaIntro({ sumA, sumB, teamALabel, teamBLabel }) {
  const hasSums = sumA != null && sumB != null;
  const base = hasSums ? (sumA + sumB) / 100 : null;
  return (
    <div className="text-sm space-y-3 leading-6">
      <div className="font-semibold">Come si calcolano i punti (RPA)</div>
      {hasSums ? (
        <div className="space-y-1">
          <div>Team A (<b>{teamALabel}</b>) = <b>{Math.round(sumA)}</b></div>
          <div>Team B (<b>{teamBLabel}</b>) = <b>{Math.round(sumB)}</b></div>
          <div><b>Base</b> = ({Math.round(sumA)} + {Math.round(sumB)}) / 100 = <b>{base.toFixed(2)}</b></div>
        </div>
      ) : (
        <div className="text-neutral-500">Seleziona i 2 giocatori di <b>Team A</b> e <b>Team B</b> per avere la <b>Base</b> già calcolata.</div>
      )}
      <ol className="list-decimal pl-5 space-y-1">
        <li>Inserisci i set (best of 3) per determinare vincitore e <b>DG</b>.</li>
        <li>Calcola <b>Gap</b> e quindi il <b>Fattore</b>.</li>
        <li>Punti finali = (<b>Base</b> + <b>DG</b>) × <b>Fattore</b>, arrotondati.</li>
      </ol>
    </div>
  );
}

