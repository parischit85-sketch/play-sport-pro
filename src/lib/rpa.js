// =============================================
// FILE: src/lib/rpa.js
// =============================================
export const fmtInt = (n) => Math.round(Number(n || 0));
export const fmt2 = (n) => Number(n || 0).toFixed(2);
export function setsToString(sets) {
  return (sets || [])
    .filter((s) => String(s?.a ?? '') !== '' || String(s?.b ?? '') !== '')
    .map((s) => `${Number(s.a || 0)}-${Number(s.b || 0)}`)
    .join(', ');
}
export function computeFromSets(sets) {
  let setsA = 0,
    setsB = 0,
    gamesA = 0,
    gamesB = 0;
  for (const s of sets || []) {
    const a = Number(s?.a || 0),
      b = Number(s?.b || 0);
    if (String(a) === '' && String(b) === '') continue;
    gamesA += a;
    gamesB += b;
    if (a > b) setsA++;
    else if (b > a) setsB++;
  }
  let winner = null;
  if (setsA > setsB) winner = 'A';
  else if (setsB > setsA) winner = 'B';
  return { setsA, setsB, gamesA, gamesB, winner };
}
export function rpaFactor(gap) {
  if (gap <= -2000) return 0.4;
  if (gap <= -1500) return 0.6;
  if (gap <= -900) return 0.75;
  if (gap <= -300) return 0.9;
  if (gap < 300 && gap > -300) return 1.0;
  if (gap <= 900) return 1.1;
  if (gap <= 1500) return 1.25;
  if (gap <= 2000) return 1.4;
  return 1.6;
}
export function rpaBracketText(gap) {
  if (gap <= -2000) return 'gap ≤ −2000 ⇒ 0.40';
  if (gap <= -1500) return '−2000 < gap ≤ −1500 ⇒ 0.60';
  if (gap <= -900) return '−1500 < gap ≤ −900 ⇒ 0.75';
  if (gap <= -300) return '−900 < gap ≤ −300 ⇒ 0.90';
  if (gap < 300 && gap > -300) return '−300 < gap < +300 ⇒ 1.00';
  if (gap <= 900) return '+300 ≤ gap ≤ +900 ⇒ 1.10';
  if (gap <= 1500) return '+900 < gap ≤ +1500 ⇒ 1.25';
  if (gap <= 2000) return '+1500 < gap ≤ +2000 ⇒ 1.40';
  return 'gap ≥ +2000 ⇒ 1.60';
}
export function calcParisDelta({
  ratingA1,
  ratingA2,
  ratingB1,
  ratingB2,
  gamesA,
  gamesB,
  winner,
  sets,
}) {
  const A1 = Number(ratingA1 || 0),
    A2 = Number(ratingA2 || 0);
  const B1 = Number(ratingB1 || 0),
    B2 = Number(ratingB2 || 0);
  const sumA = A1 + A2;
  const sumB = B1 + B2;
  const S_you = winner === 'A' ? sumA : sumB;
  const S_opp = winner === 'A' ? sumB : sumA;
  const base = (sumA + sumB) / 100;
  const gap = S_opp - S_you;
  const factor = rpaFactor(gap);
  const gd = winner === 'A' ? gamesA - gamesB : gamesB - gamesA;
  const P_float = (base + gd) * factor;
  const P = Math.round(P_float);
  const deltaA = winner === 'A' ? P : -P;
  const deltaB = winner === 'B' ? P : -P;
  const setLine = `Risultato set: ${setsToString(sets)}`;
  const formula =
    `Team A=${fmtInt(sumA)}, Team B=${fmtInt(sumB)}, Gap=${fmtInt(gap)}\n` +
    `Fascia: ${rpaBracketText(gap)}\n\n` +
    `Base = (${fmtInt(sumA)} + ${fmtInt(sumB)})/100 = ${fmt2(base)}\n` +
    `DG (Differenza Game) = ${gd}\n\n` +
    `Punti = (Base + DG) × factor = (${fmt2(base)} + ${gd}) × ${factor.toFixed(2)} = ${fmt2(P_float)}\n` +
    `Punti (arrotondato) = ${P}\n` +
    (winner === 'A' ? `Team A +${P}, Team B -${P}` : `Team B +${P}, Team A -${P}`) +
    `\n${setLine}`;
  return { deltaA, deltaB, pts: P, base, factor, gap, sumA, sumB, gd, formula };
}
