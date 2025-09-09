import {
  D as g,
  h as W,
  j as e,
  r as ee,
  n as ne,
  i as le,
  f as ie,
  k as de,
  t as ce,
} from './index-mfcr7y8l-vzxctmKg.js';
import { r as $, b as D } from './router-mfcr7y8l-COlwQr_J.js';
import { S as Z } from './Section-mfcr7y8l-B1zoYEzP.js';
import { s as H, b as oe } from './names-mfcr7y8l-BW9lV2zG.js';
import './vendor-mfcr7y8l-D3F3s8fL.js';
import './firebase-mfcr7y8l-BteSMG94.js';
function xe({ m: a, playersById: t, onShowFormula: r, onDelete: d, T: i }) {
  const [s, x] = $.useState(!1),
    n = (j) => t?.[j]?.name ?? j,
    l = `${H(n(a.teamA[0]))} & ${H(n(a.teamA[1]))}`,
    G = `${H(n(a.teamB[0]))} & ${H(n(a.teamB[1]))}`,
    m = `${n(a.teamA[0])} & ${n(a.teamA[1])}`,
    k = `${n(a.teamB[0])} & ${n(a.teamB[1])}`,
    c = a.winner === 'A',
    E = c
      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
      : 'text-rose-600 dark:text-rose-400 font-semibold',
    h = c
      ? 'text-rose-600 dark:text-rose-400 font-semibold'
      : 'text-emerald-600 dark:text-emerald-400 font-semibold',
    S = a.date
      ? new Date(a.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
      : '',
    b = Math.round(a.pts ?? 0),
    P = b >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
    O = t[a.teamA[0]]?.rating ?? g,
    U = t[a.teamA[1]]?.rating ?? g,
    f = t[a.teamB[0]]?.rating ?? g,
    V = t[a.teamB[1]]?.rating ?? g,
    v = O + U,
    N = f + V,
    y = W(a.sets || []),
    M = y.winner === 'A' ? N - v : v - N,
    F = ee(M),
    A = y.winner === 'A' ? y.gamesA - y.gamesB : y.gamesB - y.gamesA,
    C = (v + N) / 100;
  return e.jsxs('div', {
    className: `rounded-xl ${i.cardBg} ${i.border} overflow-hidden transition-all ${s ? 'ring-2 ring-blue-500/40 dark:ring-blue-400/60' : ''}`,
    children: [
      e.jsxs('div', {
        className:
          'p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors',
        role: 'button',
        tabIndex: 0,
        onClick: () => x(!s),
        onKeyDown: (j) => {
          (j.key === 'Enter' || j.key === ' ') && (j.preventDefault(), x((q) => !q));
        },
        'aria-expanded': s,
        children: [
          e.jsxs('div', {
            className: 'min-w-0 flex-1',
            children: [
              e.jsxs('div', {
                className: 'flex items-center gap-2 mb-1',
                children: [
                  e.jsx('span', {
                    className: `px-2 py-0.5 rounded-full text-xs font-medium ${c ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200'}`,
                    children: c ? '✓ Team A' : '✓ Team B',
                  }),
                  S &&
                    e.jsx('span', {
                      className: 'text-xs text-gray-500 dark:text-gray-300',
                      children: S,
                    }),
                ],
              }),
              e.jsxs('div', {
                className: 'text-sm mb-1',
                children: [
                  e.jsx('span', { className: `${E} font-medium`, children: l }),
                  e.jsx('span', {
                    className: 'mx-2 text-gray-500 dark:text-gray-300',
                    children: 'vs',
                  }),
                  e.jsx('span', { className: `${h} font-medium`, children: G }),
                ],
              }),
              e.jsxs('div', {
                className: 'text-xs text-gray-600 dark:text-gray-200',
                children: ['Sets ', a.setsA, '-', a.setsB, ' • Games ', a.gamesA, '-', a.gamesB],
              }),
            ],
          }),
          e.jsxs('div', {
            className: 'shrink-0 text-right flex items-center gap-2',
            children: [
              e.jsxs('div', {
                children: [
                  e.jsxs('div', {
                    className: `text-lg font-bold ${P}`,
                    children: [b >= 0 ? '+' : '', Math.abs(b)],
                  }),
                  e.jsx('div', {
                    className: 'text-[10px] text-gray-500 dark:text-gray-400',
                    children: 'punti',
                  }),
                ],
              }),
              e.jsx('div', {
                className: 'text-gray-400 dark:text-gray-300 text-sm',
                children: s ? '▲' : '▼',
              }),
            ],
          }),
        ],
      }),
      s &&
        e.jsx('div', {
          className: 'border-t border-gray-200 dark:border-gray-500 bg-gray-50 dark:bg-gray-700',
          children: e.jsxs('div', {
            className: 'p-4 space-y-4',
            children: [
              e.jsxs('div', {
                className: 'grid grid-cols-2 gap-3 text-sm',
                children: [
                  e.jsxs('div', {
                    className: `p-3 rounded-lg border-2 ${c ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-900/40' : 'border-gray-300 bg-white dark:border-gray-500 dark:bg-gray-600'}`,
                    children: [
                      e.jsx('div', {
                        className: 'font-semibold text-gray-900 dark:text-white mb-1',
                        children: m,
                      }),
                      e.jsxs('div', {
                        className: 'text-xs text-gray-700 dark:text-gray-200',
                        children: ['Sets: ', a.setsA, ' • Games: ', a.gamesA],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: `p-3 rounded-lg border-2 ${c ? 'border-gray-300 bg-white dark:border-gray-500 dark:bg-gray-600' : 'border-emerald-300 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-900/40'}`,
                    children: [
                      e.jsx('div', {
                        className: 'font-semibold text-gray-900 dark:text-white mb-1',
                        children: k,
                      }),
                      e.jsxs('div', {
                        className: 'text-xs text-gray-700 dark:text-gray-200',
                        children: ['Sets: ', a.setsB, ' • Games: ', a.gamesB],
                      }),
                    ],
                  }),
                ],
              }),
              Array.isArray(a.sets) &&
                a.sets.length > 0 &&
                e.jsxs('div', {
                  children: [
                    e.jsx('div', {
                      className: 'text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2',
                      children: 'Set per set:',
                    }),
                    e.jsx('div', {
                      className: 'flex gap-2',
                      children: a.sets.map((j, q) =>
                        e.jsxs(
                          'span',
                          {
                            className:
                              'px-3 py-2 bg-white dark:bg-gray-600 rounded-lg text-sm border-2 border-gray-200 dark:border-gray-400 text-gray-900 dark:text-white font-medium',
                            children: [j.a, '-', j.b],
                          },
                          q
                        )
                      ),
                    }),
                  ],
                }),
              e.jsxs('div', {
                className: 'border-t border-gray-300 dark:border-gray-500 pt-4',
                children: [
                  e.jsx('div', {
                    className: 'text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3',
                    children: 'Calcolo punti RPA:',
                  }),
                  e.jsxs('div', {
                    className: 'text-sm space-y-2 text-gray-800 dark:text-gray-100',
                    children: [
                      e.jsxs('div', {
                        className:
                          'bg-white dark:bg-gray-600 p-2 rounded border dark:border-gray-500',
                        children: [
                          e.jsx('strong', { children: 'Rating:' }),
                          ' A=',
                          Math.round(v),
                          ' vs B=',
                          Math.round(N),
                          ' (Gap:',
                          ' ',
                          Math.round(M),
                          ')',
                        ],
                      }),
                      e.jsxs('div', {
                        className:
                          'bg-white dark:bg-gray-600 p-2 rounded border dark:border-gray-500',
                        children: [
                          e.jsx('strong', { children: 'Calcolo:' }),
                          ' Base: ',
                          C.toFixed(1),
                          ' • DG: ',
                          A,
                          ' • Factor:',
                          ' ',
                          F.toFixed(2),
                        ],
                      }),
                      e.jsxs('div', {
                        className:
                          'bg-white dark:bg-gray-600 p-2 rounded border dark:border-gray-500',
                        children: [
                          e.jsx('strong', { children: 'Risultato:' }),
                          ' ',
                          e.jsxs('span', {
                            className: `font-bold text-lg ${P}`,
                            children: [b >= 0 ? '+' : '', Math.abs(b), ' punti'],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                className:
                  'flex justify-between items-center pt-2 border-t border-gray-300 dark:border-gray-500',
                children: [
                  e.jsx('button', {
                    type: 'button',
                    onClick: () => {
                      r(
                        D.createElement(
                          'div',
                          { className: 'text-sm leading-6' },
                          D.createElement(
                            'div',
                            null,
                            `Team A=${Math.round(v)}, Team B=${Math.round(N)}, Gap=${Math.round(M)}`
                          ),
                          D.createElement(
                            'div',
                            null,
                            `Base = (${Math.round(v)} + ${Math.round(N)})/100 = ${C.toFixed(2)}`
                          ),
                          D.createElement('div', null, `DG = ${A}`),
                          D.createElement(
                            'div',
                            null,
                            `Punti = (Base + DG) × factor = (${C.toFixed(2)} + ${A}) × ${F.toFixed(2)} = ${(C + A) * F}`
                          ),
                          D.createElement(
                            'div',
                            null,
                            `Punti (arrotondato) = ${a.pts ?? Math.round((C + A) * F)}`
                          )
                        )
                      );
                    },
                    className: 'text-blue-600 dark:text-blue-400 hover:underline text-sm',
                    children: '📊 Formula dettagliata',
                  }),
                  e.jsx('button', {
                    type: 'button',
                    className:
                      'text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 px-3 py-1 rounded text-sm transition-colors',
                    onClick: d,
                    children: '🗑️ Elimina',
                  }),
                ],
              }),
            ],
          }),
        }),
    ],
  });
}
function me({ sumA: a, sumB: t, teamALabel: r, teamBLabel: d }) {
  const i = a != null && t != null,
    s = i ? (a + t) / 100 : null;
  return e.jsxs('div', {
    className: 'text-sm space-y-3 leading-6',
    children: [
      e.jsx('div', { className: 'font-semibold', children: 'Come si calcolano i punti (RPA)' }),
      i
        ? e.jsxs('div', {
            className: 'space-y-1',
            children: [
              e.jsxs('div', {
                children: [
                  'Team A (',
                  e.jsx('b', { children: r }),
                  ') = ',
                  e.jsx('b', { children: Math.round(a) }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  'Team B (',
                  e.jsx('b', { children: d }),
                  ') = ',
                  e.jsx('b', { children: Math.round(t) }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('b', { children: 'Base' }),
                  ' = (',
                  Math.round(a),
                  ' + ',
                  Math.round(t),
                  ') / 100 = ',
                  e.jsx('b', { children: s.toFixed(2) }),
                ],
              }),
            ],
          })
        : e.jsxs('div', {
            className: 'text-neutral-500',
            children: [
              'Seleziona i 2 giocatori di ',
              e.jsx('b', { children: 'Team A' }),
              ' e ',
              e.jsx('b', { children: 'Team B' }),
              ' per avere la ',
              e.jsx('b', { children: 'Base' }),
              ' già calcolata.',
            ],
          }),
      e.jsxs('ol', {
        className: 'list-decimal pl-5 space-y-1',
        children: [
          e.jsxs('li', {
            children: [
              'Inserisci i set (best of 3) per determinare vincitore e ',
              e.jsx('b', { children: 'DG' }),
              '.',
            ],
          }),
          e.jsxs('li', {
            children: [
              'Calcola ',
              e.jsx('b', { children: 'Gap' }),
              ' e quindi il ',
              e.jsx('b', { children: 'Fattore' }),
              '.',
            ],
          }),
          e.jsxs('li', {
            children: [
              'Punti finali = (',
              e.jsx('b', { children: 'Base' }),
              ' + ',
              e.jsx('b', { children: 'DG' }),
              ') × ',
              e.jsx('b', { children: 'Fattore' }),
              ', arrotondati.',
            ],
          }),
        ],
      }),
    ],
  });
}
function he(a) {
  return (a || [])
    .filter((t) => String(t?.a ?? '') !== '' || String(t?.b ?? '') !== '')
    .map((t) => `${Number(t.a || 0)}-${Number(t.b || 0)}`)
    .join(', ');
}
function ue(a) {
  let t = 0,
    r = 0,
    d = 0,
    i = 0;
  for (const x of a || []) {
    const n = Number(x?.a || 0),
      l = Number(x?.b || 0);
    (String(n) === '' && String(l) === '') || ((d += n), (i += l), n > l ? t++ : l > n && r++);
  }
  let s = null;
  return (
    t > r ? (s = 'A') : r > t && (s = 'B'),
    { setsA: t, setsB: r, gamesA: d, gamesB: i, winner: s }
  );
}
function be({
  sumA: a,
  sumB: t,
  gap: r,
  factor: d,
  GD: i,
  P: s,
  winner: x,
  sets: n,
  teamALabel: l,
  teamBLabel: G,
}) {
  const m = ue(n || []),
    k = (a + t) / 100,
    E = (k + i) * d,
    h = x === 'A' ? 'Team A' : 'Team B',
    S = x === 'A' ? 'Team B' : 'Team A';
  return e.jsxs('div', {
    className: 'text-sm space-y-3 leading-6',
    children: [
      e.jsxs('div', {
        className: 'space-y-1',
        children: [
          e.jsx('div', { className: 'font-semibold', children: 'Squadre & ranking coppia' }),
          e.jsxs('div', {
            children: [
              'Team A (',
              e.jsx('b', { children: l }),
              ') = ',
              e.jsx('b', { children: Math.round(a) }),
            ],
          }),
          e.jsxs('div', {
            children: [
              'Team B (',
              e.jsx('b', { children: G }),
              ') = ',
              e.jsx('b', { children: Math.round(t) }),
            ],
          }),
        ],
      }),
      e.jsxs('div', {
        children: [
          'Gap (S',
          e.jsx('sub', { children: 'opp' }),
          ' − S',
          e.jsx('sub', { children: 'you' }),
          ') = ',
          e.jsx('b', { children: Math.round(r) }),
          ' • Fascia: ',
          ne(r),
        ],
      }),
      e.jsxs('ol', {
        className: 'list-decimal pl-5 space-y-1',
        children: [
          e.jsxs('li', {
            children: [
              e.jsx('b', { children: 'Base' }),
              ' = (Somma ranking coppie) / 100 = (',
              Math.round(a),
              ' + ',
              Math.round(t),
              ') / 100 = ',
              e.jsx('b', { children: k.toFixed(2) }),
            ],
          }),
          e.jsxs('li', {
            children: [
              e.jsx('b', { children: 'DG' }),
              ' (Differenza Game) dal punto di vista della squadra vincente = ',
              e.jsx('b', { children: i }),
            ],
          }),
          e.jsxs('li', {
            children: [
              e.jsx('b', { children: 'Fattore' }),
              ' dalla tabella fasce in base al Gap = ',
              e.jsx('b', { children: d.toFixed(2) }),
            ],
          }),
          e.jsxs('li', {
            children: [
              e.jsx('b', { children: 'Punti' }),
              ' = (Base + DG) × Fattore = (',
              e.jsx('b', { children: k.toFixed(2) }),
              ' + ',
              e.jsx('b', { children: i }),
              ') × ',
              e.jsx('b', { children: d.toFixed(2) }),
              ' = ',
              e.jsx('b', { children: E.toFixed(2) }),
            ],
          }),
          e.jsxs('li', {
            children: [
              e.jsx('b', { children: 'Arrotondamento' }),
              ' ⇒ ',
              e.jsx('b', { children: Math.round(s) }),
            ],
          }),
        ],
      }),
      e.jsxs('div', {
        children: [
          'Assegnazione: ',
          e.jsxs('span', {
            className: 'text-emerald-500 font-semibold',
            children: [h, ' +', Math.round(s)],
          }),
          ' ',
          '/',
          ' ',
          e.jsxs('span', {
            className: 'text-rose-500 font-semibold',
            children: [S, ' -', Math.round(s)],
          }),
        ],
      }),
      e.jsxs('div', {
        className: 'text-neutral-500',
        children: ['Risultato set: ', m.setsA, '-', m.setsB, ' (', he(n), ')'],
      }),
    ],
  });
}
const I = (a) => {
  const t = (l) => String(l).padStart(2, '0'),
    r = new Date(a),
    d = r.getFullYear(),
    i = t(r.getMonth() + 1),
    s = t(r.getDate()),
    x = t(r.getHours()),
    n = t(r.getMinutes());
  return `${d}-${i}-${s}T${x}:${n}`;
};
function K({ players: a, value: t, onChange: r, disabledIds: d, T: i }) {
  return e.jsxs('select', {
    value: t,
    onChange: (s) => r(s.target.value),
    className: `${i.input} pr-8 w-full`,
    children: [
      e.jsx('option', { value: '', children: '—' }),
      a.map((s) =>
        e.jsx('option', { value: s.id, disabled: d?.has(s.id), children: s.name }, s.id)
      ),
    ],
  });
}
function ge({ state: a, setState: t, playersById: r, onShowFormula: d, derivedMatches: i, T: s }) {
  const x = a.players,
    n = $.useMemo(() => [...x].sort(oe), [x]),
    [l, G] = $.useState(''),
    [m, k] = $.useState(''),
    [c, E] = $.useState(''),
    [h, S] = $.useState(''),
    [b, P] = $.useState([
      { a: '', b: '' },
      { a: '', b: '' },
      { a: '', b: '' },
    ]),
    [O, U] = $.useState(I(new Date())),
    f = W(b),
    V = l && m && c && h && f.winner,
    v = l ? (r[l]?.rating ?? g) : null,
    N = m ? (r[m]?.rating ?? g) : null,
    y = c ? (r[c]?.rating ?? g) : null,
    M = h ? (r[h]?.rating ?? g) : null,
    F = v != null && N != null ? v + N : null,
    A = y != null && M != null ? y + M : null,
    C = F != null ? `${Math.round(F)} (${Math.round(v)} + ${Math.round(N)})` : '—',
    j = A != null ? `${Math.round(A)} (${Math.round(y)} + ${Math.round(M)})` : '—',
    q = () => {
      const o = r[l]?.name || '—',
        p = r[m]?.name || '—',
        u = r[c]?.name || '—',
        w = r[h]?.name || '—',
        R = l ? (r[l]?.rating ?? g) : null,
        Y = m ? (r[m]?.rating ?? g) : null,
        _ = c ? (r[c]?.rating ?? g) : null,
        J = h ? (r[h]?.rating ?? g) : null,
        L = R != null && Y != null ? R + Y : null,
        z = _ != null && J != null ? _ + J : null,
        B = W(b || []);
      if (!B.winner || L == null || z == null) {
        d(e.jsx(me, { sumA: L, sumB: z, teamALabel: `${o} + ${p}`, teamBLabel: `${u} + ${w}` }));
        return;
      }
      const Q = B.winner === 'A' ? z - L : L - z,
        T = ee(Q),
        X = B.winner === 'A' ? B.gamesA - B.gamesB : B.gamesB - B.gamesA,
        te = (L + z) / 100,
        re = Math.round((te + X) * T);
      d(
        e.jsx(be, {
          sumA: L,
          sumB: z,
          gap: Q,
          factor: T,
          GD: X,
          P: re,
          winner: B.winner,
          sets: b,
          teamALabel: `${o} + ${p}`,
          teamBLabel: `${u} + ${w}`,
        })
      );
    },
    se = () => {
      if (!V)
        return alert(
          'Seleziona 4 giocatori e inserisci i set (best of 3). Il risultato non può finire 1-1.'
        );
      const o = (b || []).map((u) => ({ a: +(u?.a || 0), b: +(u?.b || 0) })),
        p = new Date(O || Date.now()).toISOString();
      (t((u) => ({
        ...u,
        matches: [...u.matches, { id: le(), date: p, teamA: [l, m], teamB: [c, h], sets: o }],
      })),
        G(''),
        k(''),
        E(''),
        S(''),
        P([
          { a: '', b: '' },
          { a: '', b: '' },
          { a: '', b: '' },
        ]),
        U(I(new Date())));
    },
    ae = (o) => {
      confirm('Cancellare la partita?') &&
        t((p) => ({ ...p, matches: p.matches.filter((u) => u.id !== o) }));
    };
  return e.jsxs(e.Fragment, {
    children: [
      e.jsxs(Z, {
        title: 'Crea Partita',
        T: s,
        children: [
          e.jsxs('div', {
            className: 'space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6',
            children: [
              e.jsxs('div', {
                className: `rounded-xl ${s.cardBg} ${s.border} p-4`,
                children: [
                  e.jsxs('div', {
                    className: 'font-medium flex flex-col sm:flex-row sm:items-center gap-2 mb-3',
                    children: [
                      e.jsxs('span', {
                        className: 'flex items-center gap-2',
                        children: ['🅰️ ', e.jsx('span', { children: 'Team A' })],
                      }),
                      e.jsxs('span', {
                        className: `text-xs ${s.subtext} bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full`,
                        children: ['Ranking: ', e.jsx('b', { children: C })],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'space-y-2',
                    children: [
                      e.jsx(K, {
                        T: s,
                        players: n,
                        value: l,
                        onChange: G,
                        disabledIds: new Set([m, c, h].filter(Boolean)),
                      }),
                      e.jsx(K, {
                        T: s,
                        players: n,
                        value: m,
                        onChange: k,
                        disabledIds: new Set([l, c, h].filter(Boolean)),
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                className: `rounded-xl ${s.cardBg} ${s.border} p-4`,
                children: [
                  e.jsxs('div', {
                    className: 'font-medium flex flex-col sm:flex-row sm:items-center gap-2 mb-3',
                    children: [
                      e.jsxs('span', {
                        className: 'flex items-center gap-2',
                        children: ['🅱️ ', e.jsx('span', { children: 'Team B' })],
                      }),
                      e.jsxs('span', {
                        className: `text-xs ${s.subtext} bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full`,
                        children: ['Ranking: ', e.jsx('b', { children: j })],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'space-y-2',
                    children: [
                      e.jsx(K, {
                        T: s,
                        players: n,
                        value: c,
                        onChange: E,
                        disabledIds: new Set([l, m, h].filter(Boolean)),
                      }),
                      e.jsx(K, {
                        T: s,
                        players: n,
                        value: h,
                        onChange: S,
                        disabledIds: new Set([l, m, c].filter(Boolean)),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs('div', {
            className: 'mt-6 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6',
            children: [
              e.jsxs('div', {
                className: `rounded-xl ${s.cardBg} ${s.border} p-4`,
                children: [
                  e.jsx('div', {
                    className: 'font-medium mb-3 flex items-center gap-2',
                    children: '📅 Data e ora',
                  }),
                  e.jsx('input', {
                    type: 'datetime-local',
                    value: O,
                    onChange: (o) => U(o.target.value),
                    className: `${s.input} w-full`,
                  }),
                ],
              }),
              e.jsxs('div', {
                className: `rounded-xl ${s.cardBg} ${s.border} p-4`,
                children: [
                  e.jsx('div', {
                    className: 'font-medium mb-3 flex items-center gap-2',
                    children: '🏆 Risultato (best of 3)',
                  }),
                  e.jsx('div', {
                    className: 'space-y-3',
                    children: [0, 1, 2].map((o) =>
                      e.jsxs(
                        'div',
                        {
                          className: 'flex items-center gap-3',
                          children: [
                            e.jsxs('span', {
                              className: 'text-sm font-medium w-12',
                              children: ['Set ', o + 1, ':'],
                            }),
                            e.jsxs('div', {
                              className: 'flex items-center gap-2 flex-1',
                              children: [
                                e.jsx('input', {
                                  type: 'number',
                                  min: '0',
                                  placeholder: 'A',
                                  className: `${s.input} w-16 text-center`,
                                  value: b[o].a,
                                  onChange: (p) =>
                                    P((u) =>
                                      u.map((w, R) => (R === o ? { ...w, a: p.target.value } : w))
                                    ),
                                }),
                                e.jsx('span', { className: 'text-gray-400', children: '-' }),
                                e.jsx('input', {
                                  type: 'number',
                                  min: '0',
                                  placeholder: 'B',
                                  className: `${s.input} w-16 text-center`,
                                  value: b[o].b,
                                  onChange: (p) =>
                                    P((u) =>
                                      u.map((w, R) => (R === o ? { ...w, b: p.target.value } : w))
                                    ),
                                }),
                              ],
                            }),
                          ],
                        },
                        o
                      )
                    ),
                  }),
                  e.jsx('div', {
                    className: `mt-3 text-xs ${s.subtext} bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg`,
                    children: '💡 Se dopo 2 set è 1–1, inserisci il 3° set per decidere.',
                  }),
                ],
              }),
            ],
          }),
          e.jsx('div', {
            className: `mt-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 ${s.border}`,
            children: e.jsx('div', {
              className: 'flex flex-col sm:flex-row sm:items-center justify-between gap-3',
              children: e.jsxs('div', {
                className: 'text-sm',
                children: [
                  e.jsx('div', { className: 'font-medium mb-1', children: 'Riepilogo partita:' }),
                  e.jsxs('div', {
                    className: s.subtext,
                    children: [
                      'Sets: ',
                      e.jsxs('span', { className: 'font-mono', children: [f.setsA, '-', f.setsB] }),
                      ' | Games: ',
                      e.jsxs('span', {
                        className: 'font-mono',
                        children: [f.gamesA, '-', f.gamesB],
                      }),
                      f.winner &&
                        e.jsxs('span', {
                          className: `ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${f.winner === 'A' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`,
                          children: ['🏆 Vince Team ', f.winner],
                        }),
                    ],
                  }),
                ],
              }),
            }),
          }),
          e.jsxs('div', {
            className: 'mt-6 flex flex-col sm:flex-row gap-3',
            children: [
              e.jsx('button', {
                type: 'button',
                onClick: se,
                disabled: !V,
                className: `${s.btnPrimary} flex-1 sm:flex-none ${V ? '' : 'opacity-50 cursor-not-allowed'}`,
                children: '💾 Salva partita',
              }),
              e.jsx('button', {
                type: 'button',
                onClick: q,
                className: `${s.btnGhost} flex-1 sm:flex-none`,
                children: '🧮 Mostra formula punti',
              }),
            ],
          }),
        ],
      }),
      e.jsx(Z, {
        title: 'Ultime partite',
        T: s,
        children: e.jsx('div', {
          className: 'space-y-3',
          children:
            (i || []).length === 0
              ? e.jsxs('div', {
                  className: `text-center py-8 ${s.cardBg} ${s.border} rounded-xl`,
                  children: [
                    e.jsx('div', { className: 'text-4xl mb-2', children: '🎾' }),
                    e.jsx('div', {
                      className: `text-sm ${s.subtext}`,
                      children: 'Nessuna partita ancora giocata',
                    }),
                    e.jsx('div', {
                      className: `text-xs ${s.subtext} mt-1`,
                      children: 'Crea la prima partita sopra per iniziare',
                    }),
                  ],
                })
              : (i || [])
                  .slice(-20)
                  .reverse()
                  .map((o) =>
                    e.jsx(
                      xe,
                      { m: o, playersById: r, onShowFormula: d, onDelete: () => ae(o.id), T: s },
                      o.id
                    )
                  ),
        }),
      }),
    ],
  });
}
function $e() {
  const { state: a, setState: t, derived: r, playersById: d } = ie(),
    { clubMode: i } = de(),
    s = D.useMemo(() => ce(), []),
    [x, n] = $.useState('');
  return i
    ? e.jsxs(e.Fragment, {
        children: [
          e.jsx(ge, {
            T: s,
            state: a,
            setState: t,
            playersById: d,
            onShowFormula: n,
            derivedMatches: r.matches,
          }),
          x &&
            e.jsx('div', {
              className:
                'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
              children: e.jsx('div', {
                className: 'bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto',
                children: e.jsxs('div', {
                  className: 'p-6',
                  children: [
                    e.jsxs('div', {
                      className: 'flex justify-between items-center mb-4',
                      children: [
                        e.jsx('h3', {
                          className: 'text-lg font-semibold',
                          children: 'Formula calcolo punti (RPA) – Spiegazione',
                        }),
                        e.jsx('button', {
                          onClick: () => n(''),
                          className: 'text-gray-400 hover:text-gray-600',
                          children: '×',
                        }),
                      ],
                    }),
                    e.jsx('pre', { className: 'whitespace-pre-wrap text-sm', children: x }),
                  ],
                }),
              }),
            }),
        ],
      })
    : e.jsxs('div', {
        className: `text-center py-12 ${s.cardBg} ${s.border} rounded-xl m-4`,
        children: [
          e.jsx('div', { className: 'text-6xl mb-4', children: '🔒' }),
          e.jsx('h3', {
            className: `text-xl font-bold mb-2 ${s.text}`,
            children: 'Modalità Club Richiesta',
          }),
          e.jsx('p', {
            className: `${s.subtext} mb-4`,
            children:
              'Per accedere alla creazione partite, devi prima sbloccare la modalità club nella sezione Extra.',
          }),
          e.jsx('button', {
            onClick: () => navigate('/extra'),
            className: `${s.btnPrimary} px-6 py-3`,
            children: 'Vai a Extra per sbloccare',
          }),
        ],
      });
}
export { $e as default };
