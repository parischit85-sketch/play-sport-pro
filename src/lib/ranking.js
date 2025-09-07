// =============================================
// FILE: src/lib/ranking.js
// =============================================
import { computeFromSets, calcParisDelta } from './rpa.js';
import { DEFAULT_RATING } from './ids.js';
export function recompute(players, matches) {
const map = new Map(players.map((p) => { const start = Number(p.baseRating ?? p.startRating ?? p.rating ?? DEFAULT_RATING); return [p.id, { ...p, rating: start, wins: 0, losses: 0, lastDelta: 0, trend5Total: 0, trend5Pos: 0, trend5Neg: 0 }]; }));
const hist = new Map(players.map((p) => [p.id, []]));
const enriched = [];
const byDate = [...(matches || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
for (const m of byDate) {
const a1 = map.get(m.teamA[0]), a2 = map.get(m.teamA[1]);
const b1 = map.get(m.teamB[0]), b2 = map.get(m.teamB[1]);
const rr = computeFromSets(m.sets);
const res = calcParisDelta({ ratingA1: a1?.rating ?? DEFAULT_RATING, ratingA2: a2?.rating ?? DEFAULT_RATING, ratingB1: b1?.rating ?? DEFAULT_RATING, ratingB2: b2?.rating ?? DEFAULT_RATING, gamesA: rr.gamesA, gamesB: rr.gamesB, winner: rr.winner, sets: m.sets });
const rec = { ...m, ...rr, ...res };
enriched.push(rec);
const pushH = (id, d) => { if (!id) return; const arr = hist.get(id) || []; arr.push(d); hist.set(id, arr); };
pushH(a1?.id, res.deltaA); pushH(a2?.id, res.deltaA); pushH(b1?.id, res.deltaB); pushH(b2?.id, res.deltaB);
if (a1) a1.lastDelta = res.deltaA; if (a2) a2.lastDelta = res.deltaA; if (b1) b1.lastDelta = res.deltaB; if (b2) b2.lastDelta = res.deltaB;
if (rr.winner === 'A') { if (a1) a1.rating += res.deltaA; if (a2) a2.rating += res.deltaA; if (b1) b1.rating += res.deltaB; if (b2) b2.rating += res.deltaB; if (a1) a1.wins++; if (a2) a2.wins++; if (b1) b1.losses++; if (b2) b2.losses++; }
else if (rr.winner === 'B') { if (a1) a1.rating += res.deltaA; if (a2) a2.rating += res.deltaA; if (b1) b1.rating += res.deltaB; if (b2) b2.rating += res.deltaB; if (b1) b1.wins++; if (b2) b2.wins++; if (a1) a1.losses++; if (a2) a2.losses++; }
}
for (const p of map.values()) { const arr = hist.get(p.id) || []; const last5 = arr.slice(-5); let pos = 0, neg = 0, total = 0; for (const v of last5) { total += v; if (v >= 0) pos += v; else neg += -v; } p.trend5Total = total; p.trend5Pos = pos; p.trend5Neg = neg; }
return { players: Array.from(map.values()), matches: enriched };
}
export function buildPodiumTimeline(players, matches, targetIds) {
const idToName = new Map(players.map((p) => [p.id, p.name]));

// Prendi solo le ultime 15 partite ordinate per data per avere più contesto
const byDate = [...(matches || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
const lastMatches = byDate.slice(-15);

// Usa il rating attuale PRECISO dei giocatori come punto finale di riferimento
const currentRatings = new Map(players.map((p) => [p.id, Number(p.rating ?? DEFAULT_RATING)]));

// Calcola a ritroso per ottenere i rating all'inizio delle ultime partite
const startRatings = new Map(currentRatings);

// Ricostruisce i rating per ogni match delle ultime partite dal più recente al più vecchio
const reversedMatches = [...lastMatches].reverse();
for (const m of reversedMatches) {
  const rr = computeFromSets(m.sets);
  const res = calcParisDelta({ 
    ratingA1: startRatings.get(m.teamA[0]) ?? DEFAULT_RATING, 
    ratingA2: startRatings.get(m.teamA[1]) ?? DEFAULT_RATING, 
    ratingB1: startRatings.get(m.teamB[0]) ?? DEFAULT_RATING, 
    ratingB2: startRatings.get(m.teamB[1]) ?? DEFAULT_RATING, 
    gamesA: rr.gamesA, 
    gamesB: rr.gamesB, 
    winner: rr.winner, 
    sets: m.sets 
  });
  // Sottrai i delta per tornare indietro nel tempo
  const subtract = (id, d) => startRatings.set(id, (startRatings.get(id) ?? DEFAULT_RATING) - d);
  subtract(m.teamA[0], res.deltaA); 
  subtract(m.teamA[1], res.deltaA); 
  subtract(m.teamB[0], res.deltaB); 
  subtract(m.teamB[1], res.deltaB);
}

// Ora ricostruisce la timeline in avanti
const timeline = new Map(startRatings);
const pts = [];

// Punto di partenza (prima delle ultime partite)
const start = { label: 'Inizio periodo' };
for (const id of targetIds) {
  start[idToName.get(id) || id] = Math.round(timeline.get(id) ?? DEFAULT_RATING);
}
pts.push(start);

// Calcola in avanti per ogni match
for (const m of lastMatches) {
  const rr = computeFromSets(m.sets);
  const res = calcParisDelta({ 
    ratingA1: timeline.get(m.teamA[0]) ?? DEFAULT_RATING, 
    ratingA2: timeline.get(m.teamA[1]) ?? DEFAULT_RATING, 
    ratingB1: timeline.get(m.teamB[0]) ?? DEFAULT_RATING, 
    ratingB2: timeline.get(m.teamB[1]) ?? DEFAULT_RATING, 
    gamesA: rr.gamesA, 
    gamesB: rr.gamesB, 
    winner: rr.winner, 
    sets: m.sets 
  });
  const add = (id, d) => timeline.set(id, (timeline.get(id) ?? DEFAULT_RATING) + d);
  add(m.teamA[0], res.deltaA); 
  add(m.teamA[1], res.deltaA); 
  add(m.teamB[0], res.deltaB); 
  add(m.teamB[1], res.deltaB);
  
  const point = { 
    label: new Date(m.date).toLocaleString('it-IT', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    }) 
  };
  for (const id of targetIds) {
    point[idToName.get(id) || id] = Math.round(timeline.get(id) ?? DEFAULT_RATING);
  }
  pts.push(point);
}

// AGGIUNTO: Punto finale con rating attuali PRECISI dalla classifica
const final = { label: 'Attuale' };
for (const id of targetIds) {
  // Usa il rating ESATTO dalla classifica, non quello calcolato nel grafico
  final[idToName.get(id) || id] = Math.round(currentRatings.get(id) ?? DEFAULT_RATING);
}
pts.push(final);

return pts;
}