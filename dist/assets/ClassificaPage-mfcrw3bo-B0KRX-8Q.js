import { j as e, g as D, f as G, t as T } from './index-mfcrw3bo-CoIG1RjF.js';
import { r as j, b as V, c as H } from './router-mfcrw3bo-C59D-9ls.js';
import { S as O } from './Section-mfcrw3bo-DETEukMw.js';
import {
  R as _,
  L as X,
  X as Y,
  Y as q,
  T as J,
  a as Q,
  b as Z,
} from './charts-mfcrw3bo-CTPk1mtH.js';
import { S as K } from './ShareButtons-mfcrw3bo-zOX0ZL5O.js';
import './vendor-mfcrw3bo-D3F3s8fL.js';
import './firebase-mfcrw3bo-BteSMG94.js';
function I({ total: o = 0, pos: h = 0, neg: f = 0 }) {
  const n = `Ultime 5: +${Math.round(h)} / -${Math.round(f)} = ${o >= 0 ? '+' : ''}${Math.round(o)}`;
  return o > 0
    ? e.jsx('span', { title: n, className: 'ml-2 text-emerald-500', children: '▲' })
    : o < 0
      ? e.jsx('span', { title: n, className: 'ml-2 text-rose-500', children: '▼' })
      : e.jsx('span', { title: n, className: 'ml-2 text-neutral-400', children: '•' });
}
const U = [
  '#ffd700',
  '#c0c0c0',
  '#cd7f32',
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#84cc16',
];
function ee({
  data: o,
  seriesKeys: h = [],
  chartId: f = 'universal-ranking',
  title: n = 'Evoluzione Classifica',
  selectedCount: v = 3,
  playerRankings: W = [],
}) {
  const [y, S] = j.useState(new Set(h.slice(0, 3))),
    [$, M] = j.useState(!1),
    [d, E] = j.useState(typeof window < 'u' ? window.innerWidth < 768 : !1);
  V.useEffect(() => {
    const c = () => {
      E(window.innerWidth < 768);
    };
    if (typeof window < 'u')
      return (window.addEventListener('resize', c), () => window.removeEventListener('resize', c));
  }, []);
  const N = j.useMemo(() => {
      if (o.length === 0) return [];
      const c = d ? 8 : 15;
      return o
        .slice(-c)
        .map((w, s) => ({
          index: s + 1,
          period: d ? `P${s + 1}` : `Partita ${s + 1}`,
          ...h.reduce((t, a) => ((t[a] = w[a] || 0), t), {}),
        }));
    }, [o, h, d]),
    k = (c) => {
      const g = new Set(y);
      (g.has(c) ? g.delete(c) : g.add(c), S(g));
    },
    C = $ ? h : h.slice(0, v),
    z = $ ? C.filter((c) => y.has(c)) : C,
    F = ({ active: c, payload: g, label: w }) =>
      c && g && g.length > 0
        ? e.jsxs('div', {
            className:
              'bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-xs',
            children: [
              e.jsx('p', {
                className: `font-semibold text-gray-900 dark:text-gray-100 mb-2 ${d ? 'text-sm' : 'text-base'}`,
                children: w,
              }),
              e.jsx('div', {
                className: 'space-y-1',
                children: g.map((s, t) =>
                  e.jsxs(
                    'div',
                    {
                      className: 'flex items-center justify-between',
                      children: [
                        e.jsxs('div', {
                          className: 'flex items-center gap-2',
                          children: [
                            e.jsx('div', {
                              className: 'w-3 h-3 rounded-full',
                              style: { backgroundColor: s.color },
                            }),
                            e.jsx('span', {
                              className: `text-gray-600 dark:text-gray-400 truncate ${d ? 'text-xs max-w-20' : 'text-sm max-w-28'}`,
                              children: d ? s.dataKey.split(' ')[0] : s.dataKey,
                            }),
                          ],
                        }),
                        e.jsx('span', {
                          className: `font-bold ${d ? 'text-xs' : 'text-sm'}`,
                          style: { color: s.color },
                          children: s.value,
                        }),
                      ],
                    },
                    t
                  )
                ),
              }),
            ],
          })
        : null;
  return e.jsxs('div', {
    className: 'space-y-4',
    children: [
      e.jsx('div', {
        className: `${d ? 'h-64' : 'h-80 md:h-96'}`,
        children: e.jsx(_, {
          width: '100%',
          height: '100%',
          children: e.jsxs(X, {
            data: N,
            margin: { left: d ? 10 : 20, right: d ? 10 : 20, top: 20, bottom: d ? 10 : 20 },
            children: [
              e.jsx(Y, {
                dataKey: 'period',
                tick: { fontSize: d ? 10 : 12, fill: '#6b7280' },
                axisLine: !1,
                tickLine: !1,
                interval: 'preserveStartEnd',
              }),
              e.jsx(q, {
                tick: { fontSize: d ? 10 : 12, fill: '#6b7280' },
                axisLine: !1,
                tickLine: !1,
                width: d ? 35 : 45,
                domain: ['dataMin - 10', 'dataMax + 10'],
              }),
              e.jsx(J, { content: e.jsx(F, {}) }),
              !d &&
                e.jsx(Q, {
                  wrapperStyle: { fontSize: '12px', paddingTop: '15px' },
                  iconType: 'line',
                }),
              z.map((c, g) =>
                e.jsx(
                  Z,
                  {
                    type: 'monotone',
                    dataKey: c,
                    stroke: U[h.indexOf(c)] || `hsl(${g * 45}, 70%, 50%)`,
                    strokeWidth: y.has(c) ? (d ? 3 : 4) : d ? 2 : 3,
                    dot: {
                      fill: U[h.indexOf(c)] || `hsl(${g * 45}, 70%, 50%)`,
                      strokeWidth: 2,
                      r: y.has(c) ? (d ? 4 : 5) : d ? 3 : 4,
                    },
                    activeDot: {
                      r: d ? 6 : 8,
                      strokeWidth: 2,
                      fill: U[h.indexOf(c)] || `hsl(${g * 45}, 70%, 50%)`,
                    },
                    connectNulls: !1,
                  },
                  c
                )
              ),
            ],
          }),
        }),
      }),
      e.jsxs('div', {
        className: 'space-y-3',
        children: [
          e.jsxs('div', {
            className: 'flex items-center justify-between',
            children: [
              e.jsx('h4', {
                className: `font-medium text-gray-700 dark:text-gray-300 ${d ? 'text-sm' : 'text-base'}`,
                children: 'Giocatori da mostrare:',
              }),
              e.jsx('button', {
                onClick: () => M(!$),
                className: `px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full transition-colors ${d ? 'text-xs' : 'text-sm'}`,
                children: $ ? `Top ${v}` : 'Mostra tutti',
              }),
            ],
          }),
          e.jsx('div', {
            className: `grid gap-2 ${d ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`,
            children: C.map((c, g) => {
              const w = y.has(c),
                s = U[h.indexOf(c)] || `hsl(${g * 45}, 70%, 50%)`;
              return e.jsxs(
                'button',
                {
                  onClick: () => k(c),
                  className: `flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${w ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`,
                  children: [
                    e.jsx('div', {
                      className: `w-3 h-3 rounded-full transition-all ${w ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`,
                      style: { backgroundColor: s },
                    }),
                    e.jsxs('div', {
                      className: 'flex-1 min-w-0',
                      children: [
                        e.jsx('div', {
                          className: `font-medium text-gray-900 dark:text-gray-100 truncate ${d ? 'text-xs' : 'text-sm'}`,
                          children: d ? c.split(' ')[0] : c,
                        }),
                        e.jsxs('div', {
                          className: `text-gray-500 ${d ? 'text-xs' : 'text-sm'}`,
                          children: [N[N.length - 1]?.[c] || 0, 'pt'],
                        }),
                      ],
                    }),
                  ],
                },
                c
              );
            }),
          }),
        ],
      }),
      e.jsxs('div', {
        className: `flex justify-between items-center text-gray-500 ${d ? 'text-xs' : 'text-sm'}`,
        children: [
          e.jsxs('span', { children: ['Ultimi ', N.length, ' ', d ? 'periodi' : 'punti dati'] }),
          e.jsxs('span', { children: [z.length, ' giocatori visibili'] }),
        ],
      }),
    ],
  });
}
function se({ players: o, matches: h, onOpenStats: f, T: n }) {
  const v = j.useRef(null),
    [W, y] = j.useState(3),
    [S, $] = j.useState(!1),
    M = j.useMemo(
      () =>
        [...o]
          .map((s) => ({
            ...s,
            winRate:
              (s.wins || 0) + (s.losses || 0)
                ? ((s.wins || 0) / ((s.wins || 0) + (s.losses || 0))) * 100
                : 0,
          }))
          .sort((s, t) => t.rating - s.rating),
      [o]
    ),
    d = j.useMemo(() => {
      const s = new Map(),
        t = 3;
      for (const a of h) {
        if (
          !Array.isArray(a.teamA) ||
          !Array.isArray(a.teamB) ||
          a.teamA.length !== 2 ||
          a.teamB.length !== 2
        )
          continue;
        const [p, r] = [...a.teamA].sort(),
          [m, x] = [...a.teamB].sort(),
          l = `${p}_${r}`,
          b = `${m}_${x}`;
        if (!s.has(l)) {
          const A = o.find((u) => u.id === p),
            B = o.find((u) => u.id === r);
          s.set(l, {
            key: l,
            players: [A?.name || 'Unknown', B?.name || 'Unknown'],
            wins: 0,
            losses: 0,
            matches: 0,
          });
        }
        if (!s.has(b)) {
          const A = o.find((u) => u.id === m),
            B = o.find((u) => u.id === x);
          s.set(b, {
            key: b,
            players: [A?.name || 'Unknown', B?.name || 'Unknown'],
            wins: 0,
            losses: 0,
            matches: 0,
          });
        }
        const i = s.get(l),
          L = s.get(b);
        (i.matches++, L.matches++);
        let R = a.winner;
        if (!R && Array.isArray(a.sets)) {
          const A = a.sets.reduce((u, P) => u + (P.a > P.b ? 1 : 0), 0),
            B = a.sets.reduce((u, P) => u + (P.b > P.a ? 1 : 0), 0);
          R = A > B ? 'A' : 'B';
        }
        R === 'A' ? (i.wins++, L.losses++) : R === 'B' && (L.wins++, i.losses++);
      }
      return Array.from(s.values())
        .map((a) => ({ ...a, winRate: a.matches > 0 ? (a.wins / a.matches) * 100 : 0 }))
        .filter((a) => a.matches >= t)
        .sort((a, p) => {
          if (p.winRate !== a.winRate) return p.winRate - a.winRate;
          if (p.wins !== a.wins) return p.wins - a.wins;
          if (p.matches !== a.matches) return p.matches - a.matches;
          const r = `${a.players[0]} & ${a.players[1]}`.toLowerCase(),
            m = `${p.players[0]} & ${p.players[1]}`.toLowerCase();
          return r.localeCompare(m);
        });
    }, [o, h]),
    E = j.useMemo(() => {
      const s = new Map();
      return (
        h.forEach((t) => {
          [...t.teamA, ...t.teamB];
          const a = t.sets.reduce((x, l) => x + (l.a > l.b ? 1 : 0), 0),
            p = t.sets.reduce((x, l) => x + (l.b > l.a ? 1 : 0), 0);
          (a > p ? t.teamA : t.teamB, a > p ? t.teamB : t.teamA);
          const r = t.sets.reduce((x, l) => x + l.a, 0),
            m = t.sets.reduce((x, l) => x + l.b, 0);
          (t.teamA.forEach((x) => {
            if (!s.has(x)) {
              const b = o.find((i) => i.id === x);
              s.set(x, {
                id: x,
                name: b?.name || 'Unknown',
                wins: 0,
                losses: 0,
                gamesWon: 0,
                gamesLost: 0,
                matches: 0,
              });
            }
            const l = s.get(x);
            (l.matches++,
              a > p
                ? (l.wins++, (l.gamesWon += r), (l.gamesLost += m))
                : (l.losses++, (l.gamesWon += r), (l.gamesLost += m)));
          }),
            t.teamB.forEach((x) => {
              if (!s.has(x)) {
                const b = o.find((i) => i.id === x);
                s.set(x, {
                  id: x,
                  name: b?.name || 'Unknown',
                  wins: 0,
                  losses: 0,
                  gamesWon: 0,
                  gamesLost: 0,
                  matches: 0,
                });
              }
              const l = s.get(x);
              (l.matches++,
                p > a
                  ? (l.wins++, (l.gamesWon += m), (l.gamesLost += r))
                  : (l.losses++, (l.gamesWon += m), (l.gamesLost += r)));
            }));
        }),
        Array.from(s.values())
          .filter((t) => t.matches >= 3)
          .map((t) => ({
            ...t,
            winRate: (t.wins / t.matches) * 100,
            gameEfficiency: (t.gamesWon / (t.gamesWon + t.gamesLost)) * 100,
            efficiency:
              ((t.wins / t.matches) * 0.7 + (t.gamesWon / (t.gamesWon + t.gamesLost)) * 0.3) * 100,
          }))
          .sort((t, a) => a.efficiency - t.efficiency)
      );
    }, [o, h]),
    N = j.useMemo(() => {
      const s = new Map();
      [...h]
        .sort((r, m) => new Date(r.date) - new Date(m.date))
        .forEach((r) => {
          const m = r.sets.reduce((b, i) => b + (i.a > i.b ? 1 : 0), 0),
            x = r.sets.reduce((b, i) => b + (i.b > i.a ? 1 : 0), 0),
            l = m > x ? r.teamA : r.teamB;
          (m > x ? r.teamB : r.teamA,
            [...r.teamA, ...r.teamB].forEach((b) => {
              if (!s.has(b)) {
                const R = o.find((A) => A.id === b);
                s.set(b, {
                  id: b,
                  name: R?.name || 'Unknown',
                  currentStreak: 0,
                  bestWinStreak: 0,
                  worstLossStreak: 0,
                  streakType: 'none',
                  isActive: !0,
                  totalWins: 0,
                  totalLosses: 0,
                  totalMatches: 0,
                });
              }
              const i = s.get(b),
                L = l.includes(b);
              (i.totalMatches++,
                L
                  ? (i.totalWins++,
                    i.streakType === 'win'
                      ? i.currentStreak++
                      : ((i.currentStreak = 1), (i.streakType = 'win')),
                    i.currentStreak > i.bestWinStreak && (i.bestWinStreak = i.currentStreak))
                  : (i.totalLosses++,
                    i.streakType === 'loss'
                      ? i.currentStreak++
                      : ((i.currentStreak = 1), (i.streakType = 'loss')),
                    i.currentStreak > i.worstLossStreak && (i.worstLossStreak = i.currentStreak)));
            }));
        });
      const a = Array.from(s.values())
          .filter((r) => r.bestWinStreak > 0)
          .sort((r, m) =>
            m.bestWinStreak !== r.bestWinStreak
              ? m.bestWinStreak - r.bestWinStreak
              : r.streakType === 'win' && m.streakType !== 'win'
                ? -1
                : m.streakType === 'win' && r.streakType !== 'win'
                  ? 1
                  : m.currentStreak - r.currentStreak
          ),
        p = Array.from(s.values())
          .filter((r) => r.totalMatches >= 3)
          .map((r) => ({
            ...r,
            lossRatio: r.totalMatches > 0 ? (r.totalLosses / r.totalMatches) * 100 : 0,
            winRate: r.totalMatches > 0 ? (r.totalWins / r.totalMatches) * 100 : 0,
          }))
          .sort((r, m) =>
            r.lossRatio !== m.lossRatio
              ? r.lossRatio - m.lossRatio
              : m.totalMatches - r.totalMatches
          );
      return { positive: a, ingiocabili: p };
    }, [o, h]),
    k = M.slice(0, W),
    C = k.map((s) => s.id),
    z = k.map((s) => s.name),
    F = k.map((s, t) => ({ name: s.name, position: t + 1 })),
    c = j.useMemo(() => {
      const s = D(o, h, C);
      if (s.length > 0) {
        const t = s[s.length - 1];
        k.forEach((a) => {
          t[a.name] = Math.round(a.rating);
        });
      }
      return s;
    }, [o, h, C, k]),
    g = () =>
      [
        'Classifica Sporting Cat',
        ...k.map((t, a) => `${a + 1}. ${t.name} — ${Math.round(t.rating)} pt`),
        '#SportingCat #Padel',
      ].join(`
`),
    w =
      typeof window < 'u' ? `${window.location.origin}${window.location.pathname}#classifica` : '';
  return e.jsx(O, {
    title: 'Dashboard Classifiche',
    right: e.jsx(K, {
      size: 'sm',
      title: 'Classifica Sporting Cat',
      url: w,
      captureRef: v,
      captionBuilder: g,
      T: n,
    }),
    T: n,
    children: e.jsxs('div', {
      ref: v,
      className: 'space-y-8',
      children: [
        e.jsxs('div', {
          className: `rounded-2xl ${n.cardBg} ${n.border} p-6`,
          children: [
            e.jsxs('div', {
              className: 'flex items-center justify-between mb-6',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center gap-3',
                  children: [
                    e.jsx('span', { className: 'text-2xl', children: '🏆' }),
                    e.jsx('h3', { className: 'text-lg font-semibold', children: 'Ranking RPA' }),
                  ],
                }),
                e.jsx('button', {
                  onClick: () => $(!S),
                  className: `px-3 py-1 text-sm rounded-lg border transition-colors ${S ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' : 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`,
                  children: S ? '📊 Mostra Top 10' : '📋 Mostra Tutti',
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'overflow-x-auto mb-6',
              children: [
                e.jsxs('table', {
                  className: 'min-w-full text-sm',
                  children: [
                    e.jsx('thead', {
                      children: e.jsxs('tr', {
                        className: `text-left border-b ${n.border} ${n.tableHeadText}`,
                        children: [
                          e.jsx('th', { className: 'py-2 pr-3', children: '#' }),
                          e.jsx('th', { className: 'py-2 pr-3', children: 'Giocatore' }),
                          e.jsx('th', { className: 'py-2 pr-3', children: 'Ranking' }),
                          e.jsx('th', { className: 'py-2 pr-3', children: 'Vittorie' }),
                          e.jsx('th', { className: 'py-2 pr-3', children: 'Sconfitte' }),
                          e.jsx('th', { className: 'py-2 pr-3', children: '% Vittorie' }),
                        ],
                      }),
                    }),
                    e.jsx('tbody', {
                      children: (S ? M : M.slice(0, 10)).map((s, t) =>
                        e.jsxs(
                          'tr',
                          {
                            className:
                              'border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5',
                            children: [
                              e.jsx('td', { className: 'py-2 pr-3', children: t + 1 }),
                              e.jsx('td', {
                                className: 'py-2 pr-3',
                                children: e.jsx('button', {
                                  className: n.link,
                                  onClick: () => f(s.id),
                                  children: s.name,
                                }),
                              }),
                              e.jsxs('td', {
                                className: 'py-2 pr-3 font-semibold',
                                children: [
                                  s.rating.toFixed(2),
                                  e.jsx(I, {
                                    total: s.trend5Total,
                                    pos: s.trend5Pos,
                                    neg: s.trend5Neg,
                                  }),
                                ],
                              }),
                              e.jsx('td', { className: 'py-2 pr-3', children: s.wins || 0 }),
                              e.jsx('td', { className: 'py-2 pr-3', children: s.losses || 0 }),
                              e.jsxs('td', {
                                className: 'py-2 pr-3',
                                children: [s.winRate.toFixed(0), '%'],
                              }),
                            ],
                          },
                          s.id
                        )
                      ),
                    }),
                  ],
                }),
                !S &&
                  M.length > 10 &&
                  e.jsx('div', {
                    className: 'mt-3 text-center',
                    children: e.jsxs('button', {
                      onClick: () => $(!0),
                      className:
                        'text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors',
                      children: ['... e altri ', M.length - 10, ' giocatori'],
                    }),
                  }),
              ],
            }),
            e.jsxs('div', {
              className:
                'flex flex-col md:flex-row md:items-center justify-between mb-3 md:mb-4 gap-2 md:gap-0',
              children: [
                e.jsx('div', {
                  className: 'font-medium text-sm md:text-base',
                  children: 'Andamento del ranking',
                }),
                e.jsxs('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx('span', { className: 'text-xs text-gray-500', children: 'Mostra:' }),
                    e.jsxs('select', {
                      value: W,
                      onChange: (s) => y(Number(s.target.value)),
                      className: `text-xs px-2 py-1 rounded-md border ${n.input}`,
                      children: [
                        e.jsx('option', { value: 3, children: 'Top 3' }),
                        e.jsx('option', { value: 5, children: 'Top 5' }),
                        e.jsx('option', { value: 10, children: 'Top 10' }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            e.jsx(ee, {
              data: c,
              seriesKeys: z,
              chartId: 'classifica-universal',
              title: `Evoluzione del Top ${W}`,
              selectedCount: W,
              playerRankings: F,
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8',
          children: [
            e.jsxs('div', {
              className: `rounded-2xl ${n.cardBg} ${n.border} p-4 md:p-6`,
              children: [
                e.jsxs('div', {
                  className: 'flex items-center gap-3 mb-4 md:mb-6',
                  children: [
                    e.jsx('span', { className: 'text-2xl', children: '👥' }),
                    e.jsx('h3', {
                      className: 'text-lg font-semibold',
                      children: 'Migliori Coppie',
                    }),
                  ],
                }),
                e.jsx('div', {
                  className:
                    'mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800',
                  children: e.jsxs('div', {
                    className: 'flex items-start gap-2',
                    children: [
                      e.jsx('span', { className: 'text-amber-500 text-xs', children: 'ℹ️' }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('p', {
                            className:
                              'text-xs font-medium text-amber-800 dark:text-amber-200 mb-1',
                            children: 'Come funziona:',
                          }),
                          e.jsx('p', {
                            className: 'text-xs text-amber-700 dark:text-amber-300',
                            children: 'Ordinate per % vittorie. Solo coppie con ≥3 partite.',
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
                e.jsx('div', {
                  className: 'block md:hidden space-y-1',
                  children: d
                    .slice(0, 8)
                    .map((s, t) =>
                      e.jsxs(
                        'div',
                        {
                          className:
                            'flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-800 last:border-b-0',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center gap-2',
                              children: [
                                e.jsxs('span', {
                                  className:
                                    'text-xs font-bold text-amber-600 dark:text-amber-400 w-6',
                                  children: ['#', t + 1],
                                }),
                                e.jsxs('span', {
                                  className: 'text-sm font-medium text-gray-900 dark:text-gray-100',
                                  children: [
                                    s.players[0].split(' ').pop(),
                                    ' & ',
                                    s.players[1].split(' ').pop(),
                                  ],
                                }),
                              ],
                            }),
                            e.jsxs('div', {
                              className: 'flex items-center gap-2 text-xs',
                              children: [
                                e.jsxs('span', {
                                  className: 'text-green-600 dark:text-green-400',
                                  children: [s.wins, 'V'],
                                }),
                                e.jsxs('span', {
                                  className: 'text-red-600 dark:text-red-400',
                                  children: [s.losses, 'S'],
                                }),
                                e.jsxs('span', {
                                  className: 'font-bold text-amber-700 dark:text-amber-300 text-sm',
                                  children: [s.winRate.toFixed(0), '%'],
                                }),
                              ],
                            }),
                          ],
                        },
                        s.key
                      )
                    ),
                }),
                e.jsx('div', {
                  className: 'hidden md:block overflow-x-auto',
                  children: e.jsxs('table', {
                    className: 'min-w-full text-sm',
                    children: [
                      e.jsx('thead', {
                        children: e.jsxs('tr', {
                          className: `text-left border-b ${n.border} ${n.tableHeadText}`,
                          children: [
                            e.jsx('th', { className: 'py-2 pr-3', children: '#' }),
                            e.jsx('th', { className: 'py-2 pr-3', children: 'Coppia' }),
                            e.jsx('th', { className: 'py-2 pr-3', children: 'V/S' }),
                            e.jsx('th', { className: 'py-2 pr-3', children: '%' }),
                          ],
                        }),
                      }),
                      e.jsx('tbody', {
                        children: d
                          .slice(0, 8)
                          .map((s, t) =>
                            e.jsxs(
                              'tr',
                              {
                                className:
                                  'border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5',
                                children: [
                                  e.jsx('td', { className: 'py-2 pr-3', children: t + 1 }),
                                  e.jsxs('td', {
                                    className: 'py-2 pr-3 font-medium text-xs',
                                    children: [s.players[0], ' & ', s.players[1]],
                                  }),
                                  e.jsxs('td', {
                                    className: 'py-2 pr-3 text-xs',
                                    children: [
                                      e.jsx('span', {
                                        className: 'text-green-600 dark:text-green-400',
                                        children: s.wins,
                                      }),
                                      '/',
                                      e.jsx('span', {
                                        className: 'text-red-600 dark:text-red-400',
                                        children: s.losses,
                                      }),
                                    ],
                                  }),
                                  e.jsxs('td', {
                                    className: 'py-2 pr-3 font-semibold',
                                    children: [s.winRate.toFixed(0), '%'],
                                  }),
                                ],
                              },
                              s.key
                            )
                          ),
                      }),
                    ],
                  }),
                }),
              ],
            }),
            e.jsxs('div', {
              className: `rounded-2xl ${n.cardBg} ${n.border} p-4 md:p-6`,
              children: [
                e.jsxs('div', {
                  className: 'flex items-center gap-3 mb-4 md:mb-6',
                  children: [
                    e.jsx('span', { className: 'text-2xl', children: '⚡' }),
                    e.jsx('h3', {
                      className: 'text-lg font-semibold',
                      children: 'Classifica Efficienza',
                    }),
                  ],
                }),
                e.jsx('div', {
                  className:
                    'mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800',
                  children: e.jsxs('div', {
                    className: 'flex items-start gap-2',
                    children: [
                      e.jsx('span', { className: 'text-blue-500 text-xs', children: '⚡' }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('p', {
                            className: 'text-xs font-medium text-blue-800 dark:text-blue-200 mb-1',
                            children: 'Formula:',
                          }),
                          e.jsx('p', {
                            className: 'text-xs text-blue-700 dark:text-blue-300',
                            children: '% vittorie (70%) + % game vinti (30%).',
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
                e.jsx('div', {
                  className: 'block md:hidden space-y-1',
                  children: E.slice(0, 8).map((s, t) =>
                    e.jsxs(
                      'div',
                      {
                        className:
                          'flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-800 last:border-b-0',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsxs('span', {
                                className: 'text-xs font-bold text-blue-600 dark:text-blue-400 w-6',
                                children: ['#', t + 1],
                              }),
                              e.jsx('button', {
                                className:
                                  n.link + ' text-sm font-medium text-gray-900 dark:text-gray-100',
                                onClick: () => f(s.id),
                                children: s.name,
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            className: 'flex items-center gap-2 text-xs',
                            children: [
                              e.jsxs('span', {
                                className: 'text-green-600 dark:text-green-400',
                                children: [s.wins, 'V'],
                              }),
                              e.jsxs('span', {
                                className: 'text-red-600 dark:text-red-400',
                                children: [s.losses, 'S'],
                              }),
                              e.jsxs('span', {
                                className: 'font-bold text-blue-700 dark:text-blue-300 text-sm',
                                children: [s.efficiency.toFixed(1), '%'],
                              }),
                            ],
                          }),
                        ],
                      },
                      s.id
                    )
                  ),
                }),
                e.jsx('div', {
                  className: 'hidden md:block overflow-x-auto',
                  children: e.jsxs('table', {
                    className: 'min-w-full text-sm',
                    children: [
                      e.jsx('thead', {
                        children: e.jsxs('tr', {
                          className: `text-left border-b ${n.border} ${n.tableHeadText}`,
                          children: [
                            e.jsx('th', { className: 'py-2 pr-3', children: '#' }),
                            e.jsx('th', { className: 'py-2 pr-3', children: 'Giocatore' }),
                            e.jsx('th', { className: 'py-2 pr-3', children: 'Eff.' }),
                            e.jsx('th', { className: 'py-2 pr-3', children: 'V/S' }),
                          ],
                        }),
                      }),
                      e.jsx('tbody', {
                        children: E.slice(0, 8).map((s, t) =>
                          e.jsxs(
                            'tr',
                            {
                              className:
                                'border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5',
                              children: [
                                e.jsx('td', { className: 'py-2 pr-3', children: t + 1 }),
                                e.jsx('td', {
                                  className: 'py-2 pr-3',
                                  children: e.jsx('button', {
                                    className: n.link + ' text-xs',
                                    onClick: () => f(s.id),
                                    children: s.name,
                                  }),
                                }),
                                e.jsxs('td', {
                                  className: 'py-2 pr-3 font-bold text-blue-600 dark:text-blue-400',
                                  children: [s.efficiency.toFixed(1), '%'],
                                }),
                                e.jsxs('td', {
                                  className: 'py-2 pr-3 text-xs',
                                  children: [
                                    e.jsx('span', {
                                      className: 'text-green-600 dark:text-green-400',
                                      children: s.wins,
                                    }),
                                    '/',
                                    e.jsx('span', {
                                      className: 'text-red-600 dark:text-red-400',
                                      children: s.losses,
                                    }),
                                  ],
                                }),
                              ],
                            },
                            s.id
                          )
                        ),
                      }),
                    ],
                  }),
                }),
              ],
            }),
            e.jsxs('div', {
              className: `rounded-2xl ${n.cardBg} ${n.border} p-4 md:p-6`,
              children: [
                e.jsxs('div', {
                  className: 'flex items-center gap-3 mb-4 md:mb-6',
                  children: [
                    e.jsx('span', { className: 'text-2xl', children: '🔥' }),
                    e.jsx('h3', {
                      className: 'text-lg font-semibold',
                      children: 'Streak Vittorie',
                    }),
                  ],
                }),
                e.jsx('div', {
                  className:
                    'mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800',
                  children: e.jsxs('div', {
                    className: 'flex items-start gap-2',
                    children: [
                      e.jsx('span', { className: 'text-green-500 text-xs', children: '🔥' }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('p', {
                            className:
                              'text-xs font-medium text-green-800 dark:text-green-200 mb-1',
                            children: 'Streak vittorie:',
                          }),
                          e.jsx('p', {
                            className: 'text-xs text-green-700 dark:text-green-300',
                            children: 'Migliore serie consecutiva. 🔥 = serie attiva.',
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
                e.jsx('div', {
                  className: 'block md:hidden space-y-1',
                  children: N.positive
                    .slice(0, 8)
                    .map((s, t) =>
                      e.jsxs(
                        'div',
                        {
                          className:
                            'flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-800 last:border-b-0',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center gap-2',
                              children: [
                                e.jsxs('span', {
                                  className:
                                    'text-xs font-bold text-green-600 dark:text-green-400 w-6',
                                  children: ['#', t + 1],
                                }),
                                e.jsx('button', {
                                  className:
                                    n.link +
                                    ' text-sm font-medium text-gray-900 dark:text-gray-100',
                                  onClick: () => f(s.id),
                                  children: s.name,
                                }),
                              ],
                            }),
                            e.jsxs('div', {
                              className: 'flex items-center gap-2 text-xs',
                              children: [
                                s.streakType === 'win'
                                  ? e.jsxs('span', {
                                      className: 'text-green-600 dark:text-green-400',
                                      children: ['🔥', s.currentStreak],
                                    })
                                  : e.jsx('span', { className: 'text-gray-400', children: '-' }),
                                e.jsx('span', {
                                  className: 'font-bold text-green-700 dark:text-green-300 text-sm',
                                  children: s.bestWinStreak,
                                }),
                              ],
                            }),
                          ],
                        },
                        s.id
                      )
                    ),
                }),
                e.jsx('div', {
                  className: 'hidden md:block overflow-x-auto',
                  children: e.jsxs('table', {
                    className: 'min-w-full text-sm',
                    children: [
                      e.jsx('thead', {
                        children: e.jsxs('tr', {
                          className: `text-left border-b ${n.border} ${n.tableHeadText}`,
                          children: [
                            e.jsx('th', { className: 'py-2 pr-3', children: '#' }),
                            e.jsx('th', { className: 'py-2 pr-3', children: 'Giocatore' }),
                            e.jsx('th', { className: 'py-2 pr-3', children: 'Miglior' }),
                            e.jsx('th', { className: 'py-2 pr-3', children: 'Stato' }),
                          ],
                        }),
                      }),
                      e.jsx('tbody', {
                        children: N.positive
                          .slice(0, 8)
                          .map((s, t) =>
                            e.jsxs(
                              'tr',
                              {
                                className:
                                  'border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5',
                                children: [
                                  e.jsx('td', { className: 'py-2 pr-3', children: t + 1 }),
                                  e.jsx('td', {
                                    className: 'py-2 pr-3',
                                    children: e.jsx('button', {
                                      className: n.link + ' text-xs',
                                      onClick: () => f(s.id),
                                      children: s.name,
                                    }),
                                  }),
                                  e.jsx('td', {
                                    className:
                                      'py-2 pr-3 font-bold text-green-600 dark:text-green-400',
                                    children: s.bestWinStreak,
                                  }),
                                  e.jsx('td', {
                                    className: 'py-2 pr-3',
                                    children:
                                      s.streakType === 'win'
                                        ? e.jsxs('span', {
                                            className:
                                              'text-xs text-green-600 dark:text-green-400 font-semibold',
                                            children: ['🔥 +', s.currentStreak],
                                          })
                                        : e.jsx('span', {
                                            className: 'text-xs text-gray-500',
                                            children: '-',
                                          }),
                                  }),
                                ],
                              },
                              s.id
                            )
                          ),
                      }),
                    ],
                  }),
                }),
              ],
            }),
            e.jsxs('div', {
              className: `rounded-2xl ${n.cardBg} ${n.border} p-4 md:p-6`,
              children: [
                e.jsxs('div', {
                  className: 'flex items-center gap-3 mb-4 md:mb-6',
                  children: [
                    e.jsx('span', { className: 'text-2xl', children: '🛡️' }),
                    e.jsx('h3', { className: 'text-lg font-semibold', children: 'Ingiocabili' }),
                  ],
                }),
                e.jsx('div', {
                  className:
                    'mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800',
                  children: e.jsxs('div', {
                    className: 'flex items-start gap-2',
                    children: [
                      e.jsx('span', { className: 'text-purple-500 text-xs', children: '🛡️' }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('p', {
                            className:
                              'text-xs font-medium text-purple-800 dark:text-purple-200 mb-1',
                            children: 'Ingiocabili:',
                          }),
                          e.jsx('p', {
                            className: 'text-xs text-purple-700 dark:text-purple-300',
                            children: 'Minor % sconfitte. Più basso = più difficile da battere.',
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
                e.jsx('div', {
                  className: 'block md:hidden space-y-1',
                  children: N.ingiocabili
                    .slice(0, 8)
                    .map((s, t) =>
                      e.jsxs(
                        'div',
                        {
                          className:
                            'flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-800 last:border-b-0',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center gap-2',
                              children: [
                                e.jsxs('span', {
                                  className:
                                    'text-xs font-bold text-purple-600 dark:text-purple-400 w-6',
                                  children: ['#', t + 1],
                                }),
                                e.jsx('button', {
                                  className:
                                    n.link +
                                    ' text-sm font-medium text-gray-900 dark:text-gray-100',
                                  onClick: () => f(s.id),
                                  children: s.name,
                                }),
                              ],
                            }),
                            e.jsxs('div', {
                              className: 'flex items-center gap-2 text-xs',
                              children: [
                                e.jsxs('span', {
                                  className: 'text-green-600 dark:text-green-400',
                                  children: [s.totalWins, 'V'],
                                }),
                                e.jsxs('span', {
                                  className: 'text-red-600 dark:text-red-400',
                                  children: [s.totalLosses, 'S'],
                                }),
                                e.jsxs('span', {
                                  className:
                                    'font-bold text-purple-700 dark:text-purple-300 text-sm',
                                  children: [s.lossRatio.toFixed(1), '%'],
                                }),
                              ],
                            }),
                          ],
                        },
                        s.id
                      )
                    ),
                }),
                e.jsx('div', {
                  className: 'hidden md:block overflow-x-auto',
                  children: e.jsxs('table', {
                    className: 'min-w-full text-sm',
                    children: [
                      e.jsx('thead', {
                        children: e.jsxs('tr', {
                          className: `text-left border-b ${n.border} ${n.tableHeadText}`,
                          children: [
                            e.jsx('th', { className: 'py-2 pr-3', children: '#' }),
                            e.jsx('th', { className: 'py-2 pr-3', children: 'Giocatore' }),
                            e.jsx('th', { className: 'py-2 pr-3', children: '% Sconf.' }),
                            e.jsx('th', { className: 'py-2 pr-3', children: 'V/S' }),
                          ],
                        }),
                      }),
                      e.jsx('tbody', {
                        children: N.ingiocabili
                          .slice(0, 8)
                          .map((s, t) =>
                            e.jsxs(
                              'tr',
                              {
                                className:
                                  'border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5',
                                children: [
                                  e.jsx('td', { className: 'py-2 pr-3', children: t + 1 }),
                                  e.jsx('td', {
                                    className: 'py-2 pr-3',
                                    children: e.jsx('button', {
                                      className: n.link + ' text-xs',
                                      onClick: () => f(s.id),
                                      children: s.name,
                                    }),
                                  }),
                                  e.jsxs('td', {
                                    className:
                                      'py-2 pr-3 font-bold text-purple-600 dark:text-purple-400',
                                    children: [s.lossRatio.toFixed(1), '%'],
                                  }),
                                  e.jsxs('td', {
                                    className: 'py-2 pr-3 text-xs',
                                    children: [
                                      e.jsx('span', {
                                        className: 'text-green-600 dark:text-green-400',
                                        children: s.totalWins,
                                      }),
                                      '/',
                                      e.jsx('span', {
                                        className: 'text-red-600 dark:text-red-400',
                                        children: s.totalLosses,
                                      }),
                                    ],
                                  }),
                                ],
                              },
                              s.id
                            )
                          ),
                      }),
                    ],
                  }),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
function ce() {
  const o = H(),
    { derived: h } = G(),
    f = V.useMemo(() => T(), []),
    n = (v) => {
      o(`/stats?player=${v}`);
    };
  return e.jsx(se, { T: f, players: h.players, matches: h.matches, onOpenStats: n });
}
export { ce as default };
