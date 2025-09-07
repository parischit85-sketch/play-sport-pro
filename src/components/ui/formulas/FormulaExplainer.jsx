// =============================================
// FILE: src/components/ui/formulas/FormulaExplainer.jsx
// =============================================
import React from 'react';
import { rpaBracketText } from '@lib/rpa.js';
function setsToString(sets){ return (sets || []).filter((s)=> String(s?.a??'')!=='' || String(s?.b??'')!=='').map((s)=> `${Number(s.a||0)}-${Number(s.b||0)}`).join(', '); }
function computeFromSets(sets){ let setsA=0,setsB=0,gamesA=0,gamesB=0; for(const s of sets||[]){ const a=Number(s?.a||0), b=Number(s?.b||0); if(String(a)===''&&String(b)==='') continue; gamesA+=a; gamesB+=b; if(a>b) setsA++; else if(b>a) setsB++; } let winner=null; if(setsA>setsB) winner='A'; else if(setsB>setsA) winner='B'; return {setsA,setsB,gamesA,gamesB,winner}; }

export function FormulaExplainer({ sumA, sumB, gap, factor, GD, P, winner, sets, teamALabel, teamBLabel }) {
  const rr = computeFromSets(sets || []);
  const baseRaw = (sumA + sumB) / 100;
  const beforeFactor = baseRaw + GD;
  const finalPoints = beforeFactor * factor;
  const winLbl  = winner === 'A' ? 'Team A' : 'Team B';
  const loseLbl = winner === 'A' ? 'Team B' : 'Team A';
  return (
    <div className="text-sm space-y-3 leading-6">
      <div className="space-y-1">
        <div className="font-semibold">Squadre & ranking coppia</div>
        <div>Team A (<b>{teamALabel}</b>) = <b>{Math.round(sumA)}</b></div>
        <div>Team B (<b>{teamBLabel}</b>) = <b>{Math.round(sumB)}</b></div>
      </div>
      <div>Gap (S<sub>opp</sub> − S<sub>you</sub>) = <b>{Math.round(gap)}</b> • Fascia: {rpaBracketText(gap)}</div>
      <ol className="list-decimal pl-5 space-y-1">
        <li><b>Base</b> = (Somma ranking coppie) / 100 = ({Math.round(sumA)} + {Math.round(sumB)}) / 100 = <b>{baseRaw.toFixed(2)}</b></li>
        <li><b>DG</b> (Differenza Game) dal punto di vista della squadra vincente = <b>{GD}</b></li>
        <li><b>Fattore</b> dalla tabella fasce in base al Gap = <b>{factor.toFixed(2)}</b></li>
        <li><b>Punti</b> = (Base + DG) × Fattore = (<b>{baseRaw.toFixed(2)}</b> + <b>{GD}</b>) × <b>{factor.toFixed(2)}</b> = <b>{finalPoints.toFixed(2)}</b></li>
        <li><b>Arrotondamento</b> ⇒ <b>{Math.round(P)}</b></li>
      </ol>
      <div>Assegnazione: <span className="text-emerald-500 font-semibold">{winLbl} +{Math.round(P)}</span>{' '}/{' '}<span className="text-rose-500 font-semibold">{loseLbl} -{Math.round(P)}</span></div>
      <div className="text-neutral-500">Risultato set: {rr.setsA}-{rr.setsB} ({setsToString(sets)})</div>
    </div>
  );
}
