import { j as e, g as V, f as D, t as G } from './index-mfgod96n-DwV9PbJ5.js';
import { r as f, b as F, c as O } from './router-mfgod96n-jGu93CuW.js';
import { S as _ } from './Section-mfgod96n-Bh2iDtmF.js';
import {
  R as X,
  L as Y,
  X as H,
  Y as q,
  T as J,
  a as Q,
  b as Z,
} from './charts-mfgod96n-BCQkBXGn.js';
import { S as K } from './ShareButtons-mfgod96n-DZHYjgsV.js';
import './vendor-mfgod96n-D3F3s8fL.js';
import './firebase-mfgod96n-X_I_guKF.js';
function I({ total: o = 0, pos: m = 0, neg: u = 0 }) {
  const k = `Ultime 5: +${Math.round(m)} / -${Math.round(u)} = ${o >= 0 ? '+' : ''}${Math.round(o)}`;
  return o > 0
    ? e.jsx('span', { title: k, className: 'ml-2 text-emerald-500', children: '▲' })
    : o < 0
      ? e.jsx('span', { title: k, className: 'ml-2 text-rose-500', children: '▼' })
      : e.jsx('span', { title: k, className: 'ml-2 text-neutral-400', children: '•' });
}
const z = [
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
  seriesKeys: m = [],
  chartId: u = 'universal-ranking',
  title: k = 'Evoluzione Classifica',
  selectedCount: v = 3,
  playerRankings: W = [],
}) {
  const [y, S] = f.useState(new Set(m.slice(0, 3))),
    [M, $] = f.useState(!1),
    [l, B] = f.useState(typeof window < 'u' ? window.innerWidth < 768 : !1);
  F.useEffect(() => {
    const d = () => {
      B(window.innerWidth < 768);
    };
    if (typeof window < 'u')
      return (window.addEventListener('resize', d), () => window.removeEventListener('resize', d));
  }, []);
  const j = f.useMemo(() => {
      if (o.length === 0) return [];
      const d = l ? 8 : 15;
      return o
        .slice(-d)
        .map((N, t) => ({
          index: t + 1,
          period: l ? `P${t + 1}` : `Partita ${t + 1}`,
          ...m.reduce((s, r) => ((s[r] = N[r] || 0), s), {}),
        }));
    }, [o, m, l]),
    w = (d) => {
      const g = new Set(y);
      (g.has(d) ? g.delete(d) : g.add(d), S(g));
    },
    C = M ? m : m.slice(0, v),
    E = M ? C.filter((d) => y.has(d)) : C,
    U = ({ active: d, payload: g, label: N }) =>
      d && g && g.length > 0
        ? e.jsxs('div', {
            className:
              'bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-xs',
            children: [
              e.jsx('p', {
                className: `font-semibold text-gray-900 dark:text-gray-100 mb-2 ${l ? 'text-sm' : 'text-base'}`,
                children: N,
              }),
              e.jsx('div', {
                className: 'space-y-1',
                children: g.map((t, s) =>
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
                              style: { backgroundColor: t.color },
                            }),
                            e.jsx('span', {
                              className: `text-gray-600 dark:text-gray-400 truncate ${l ? 'text-xs max-w-20' : 'text-sm max-w-28'}`,
                              children: l ? t.dataKey.split(' ')[0] : t.dataKey,
                            }),
                          ],
                        }),
                        e.jsx('span', {
                          className: `font-bold ${l ? 'text-xs' : 'text-sm'}`,
                          style: { color: t.color },
                          children: t.value,
                        }),
                      ],
                    },
                    s
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
        className: `${l ? 'h-64' : 'h-80 md:h-96'}`,
        children: e.jsx(X, {
          width: '100%',
          height: '100%',
          children: e.jsxs(Y, {
            data: j,
            margin: { left: l ? 10 : 20, right: l ? 10 : 20, top: 20, bottom: l ? 10 : 20 },
            children: [
              e.jsx(H, {
                dataKey: 'period',
                tick: { fontSize: l ? 10 : 12, fill: '#6b7280' },
                axisLine: !1,
                tickLine: !1,
                interval: 'preserveStartEnd',
              }),
              e.jsx(q, {
                tick: { fontSize: l ? 10 : 12, fill: '#6b7280' },
                axisLine: !1,
                tickLine: !1,
                width: l ? 35 : 45,
                domain: ['dataMin - 10', 'dataMax + 10'],
              }),
              e.jsx(J, { content: e.jsx(U, {}) }),
              !l &&
                e.jsx(Q, {
                  wrapperStyle: { fontSize: '12px', paddingTop: '15px' },
                  iconType: 'line',
                }),
              E.map((d, g) =>
                e.jsx(
                  Z,
                  {
                    type: 'monotone',
                    dataKey: d,
                    stroke: z[m.indexOf(d)] || `hsl(${g * 45}, 70%, 50%)`,
                    strokeWidth: y.has(d) ? (l ? 3 : 4) : l ? 2 : 3,
                    dot: {
                      fill: z[m.indexOf(d)] || `hsl(${g * 45}, 70%, 50%)`,
                      strokeWidth: 2,
                      r: y.has(d) ? (l ? 4 : 5) : l ? 3 : 4,
                    },
                    activeDot: {
                      r: l ? 6 : 8,
                      strokeWidth: 2,
                      fill: z[m.indexOf(d)] || `hsl(${g * 45}, 70%, 50%)`,
                    },
                    connectNulls: !1,
                  },
                  d
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
                className: `font-medium text-gray-700 dark:text-gray-300 ${l ? 'text-sm' : 'text-base'}`,
                children: 'Giocatori da mostrare:',
              }),
              e.jsx('button', {
                onClick: () => $(!M),
                className: `px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full transition-colors ${l ? 'text-xs' : 'text-sm'}`,
                children: M ? `Top ${v}` : 'Mostra tutti',
              }),
            ],
          }),
          e.jsx('div', {
            className: `grid gap-2 ${l ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`,
            children: C.map((d, g) => {
              const N = y.has(d),
                t = z[m.indexOf(d)] || `hsl(${g * 45}, 70%, 50%)`;
              return e.jsxs(
                'button',
                {
                  onClick: () => w(d),
                  className: `flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${N ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`,
                  children: [
                    e.jsx('div', {
                      className: `w-3 h-3 rounded-full transition-all ${N ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`,
                      style: { backgroundColor: t },
                    }),
                    e.jsxs('div', {
                      className: 'flex-1 min-w-0',
                      children: [
                        e.jsx('div', {
                          className: `font-medium text-gray-900 dark:text-gray-100 truncate ${l ? 'text-xs' : 'text-sm'}`,
                          children: l ? d.split(' ')[0] : d,
                        }),
                        e.jsxs('div', {
                          className: `text-gray-500 ${l ? 'text-xs' : 'text-sm'}`,
                          children: [j[j.length - 1]?.[d] || 0, 'pt'],
                        }),
                      ],
                    }),
                  ],
                },
                d
              );
            }),
          }),
        ],
      }),
      e.jsxs('div', {
        className: `flex justify-between items-center text-gray-500 ${l ? 'text-xs' : 'text-sm'}`,
        children: [
          e.jsxs('span', { children: ['Ultimi ', j.length, ' ', l ? 'periodi' : 'punti dati'] }),
          e.jsxs('span', { children: [E.length, ' giocatori visibili'] }),
        ],
      }),
    ],
  });
}
function te({ players: o, matches: m, onOpenStats: u, T: k }) {
  const v = f.useRef(null),
    [W, y] = f.useState(3),
    [S, M] = f.useState(!1),
    $ = f.useMemo(
      () =>
        [...o]
          .map((t) => ({
            ...t,
            winRate:
              (t.wins || 0) + (t.losses || 0)
                ? ((t.wins || 0) / ((t.wins || 0) + (t.losses || 0))) * 100
                : 0,
          }))
          .sort((t, s) => s.rating - t.rating),
      [o]
    ),
    l = f.useMemo(() => {
      const t = new Map(),
        s = 3;
      for (const r of m) {
        if (
          !Array.isArray(r.teamA) ||
          !Array.isArray(r.teamB) ||
          r.teamA.length !== 2 ||
          r.teamB.length !== 2
        )
          continue;
        const [h, a] = [...r.teamA].sort(),
          [x, c] = [...r.teamB].sort(),
          n = `${h}_${a}`,
          b = `${x}_${c}`;
        if (!t.has(n)) {
          const A = o.find((p) => p.id === h),
            T = o.find((p) => p.id === a);
          t.set(n, {
            key: n,
            players: [A?.name || 'Unknown', T?.name || 'Unknown'],
            wins: 0,
            losses: 0,
            matches: 0,
          });
        }
        if (!t.has(b)) {
          const A = o.find((p) => p.id === x),
            T = o.find((p) => p.id === c);
          t.set(b, {
            key: b,
            players: [A?.name || 'Unknown', T?.name || 'Unknown'],
            wins: 0,
            losses: 0,
            matches: 0,
          });
        }
        const i = t.get(n),
          L = t.get(b);
        (i.matches++, L.matches++);
        let R = r.winner;
        if (!R && Array.isArray(r.sets)) {
          const A = r.sets.reduce((p, P) => p + (P.a > P.b ? 1 : 0), 0),
            T = r.sets.reduce((p, P) => p + (P.b > P.a ? 1 : 0), 0);
          R = A > T ? 'A' : 'B';
        }
        R === 'A' ? (i.wins++, L.losses++) : R === 'B' && (L.wins++, i.losses++);
      }
      return Array.from(t.values())
        .map((r) => ({ ...r, winRate: r.matches > 0 ? (r.wins / r.matches) * 100 : 0 }))
        .filter((r) => r.matches >= s)
        .sort((r, h) => {
          if (h.winRate !== r.winRate) return h.winRate - r.winRate;
          if (h.wins !== r.wins) return h.wins - r.wins;
          if (h.matches !== r.matches) return h.matches - r.matches;
          const a = `${r.players[0]} & ${r.players[1]}`.toLowerCase(),
            x = `${h.players[0]} & ${h.players[1]}`.toLowerCase();
          return a.localeCompare(x);
        });
    }, [o, m]),
    B = f.useMemo(() => {
      const t = new Map();
      return (
        m.forEach((s) => {
          [...s.teamA, ...s.teamB];
          const r = s.sets.reduce((c, n) => c + (n.a > n.b ? 1 : 0), 0),
            h = s.sets.reduce((c, n) => c + (n.b > n.a ? 1 : 0), 0);
          (r > h ? s.teamA : s.teamB, r > h ? s.teamB : s.teamA);
          const a = s.sets.reduce((c, n) => c + n.a, 0),
            x = s.sets.reduce((c, n) => c + n.b, 0);
          (s.teamA.forEach((c) => {
            if (!t.has(c)) {
              const b = o.find((i) => i.id === c);
              t.set(c, {
                id: c,
                name: b?.name || 'Unknown',
                wins: 0,
                losses: 0,
                gamesWon: 0,
                gamesLost: 0,
                matches: 0,
              });
            }
            const n = t.get(c);
            (n.matches++,
              r > h
                ? (n.wins++, (n.gamesWon += a), (n.gamesLost += x))
                : (n.losses++, (n.gamesWon += a), (n.gamesLost += x)));
          }),
            s.teamB.forEach((c) => {
              if (!t.has(c)) {
                const b = o.find((i) => i.id === c);
                t.set(c, {
                  id: c,
                  name: b?.name || 'Unknown',
                  wins: 0,
                  losses: 0,
                  gamesWon: 0,
                  gamesLost: 0,
                  matches: 0,
                });
              }
              const n = t.get(c);
              (n.matches++,
                h > r
                  ? (n.wins++, (n.gamesWon += x), (n.gamesLost += a))
                  : (n.losses++, (n.gamesWon += x), (n.gamesLost += a)));
            }));
        }),
        Array.from(t.values())
          .filter((s) => s.matches >= 3)
          .map((s) => ({
            ...s,
            winRate: (s.wins / s.matches) * 100,
            gameEfficiency: (s.gamesWon / (s.gamesWon + s.gamesLost)) * 100,
            efficiency:
              ((s.wins / s.matches) * 0.7 + (s.gamesWon / (s.gamesWon + s.gamesLost)) * 0.3) * 100,
          }))
          .sort((s, r) => r.efficiency - s.efficiency)
      );
    }, [o, m]),
    j = f.useMemo(() => {
      const t = new Map();
      [...m]
        .sort((a, x) => new Date(a.date) - new Date(x.date))
        .forEach((a) => {
          const x = a.sets.reduce((b, i) => b + (i.a > i.b ? 1 : 0), 0),
            c = a.sets.reduce((b, i) => b + (i.b > i.a ? 1 : 0), 0),
            n = x > c ? a.teamA : a.teamB;
          (x > c ? a.teamB : a.teamA,
            [...a.teamA, ...a.teamB].forEach((b) => {
              if (!t.has(b)) {
                const R = o.find((A) => A.id === b);
                t.set(b, {
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
              const i = t.get(b),
                L = n.includes(b);
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
      const r = Array.from(t.values())
          .filter((a) => a.bestWinStreak > 0)
          .sort((a, x) =>
            x.bestWinStreak !== a.bestWinStreak
              ? x.bestWinStreak - a.bestWinStreak
              : a.streakType === 'win' && x.streakType !== 'win'
                ? -1
                : x.streakType === 'win' && a.streakType !== 'win'
                  ? 1
                  : x.currentStreak - a.currentStreak
          ),
        h = Array.from(t.values())
          .filter((a) => a.totalMatches >= 3)
          .map((a) => ({
            ...a,
            lossRatio: a.totalMatches > 0 ? (a.totalLosses / a.totalMatches) * 100 : 0,
            winRate: a.totalMatches > 0 ? (a.totalWins / a.totalMatches) * 100 : 0,
          }))
          .sort((a, x) =>
            a.lossRatio !== x.lossRatio
              ? a.lossRatio - x.lossRatio
              : x.totalMatches - a.totalMatches
          );
      return { positive: r, ingiocabili: h };
    }, [o, m]),
    w = $.slice(0, W),
    C = w.map((t) => t.id),
    E = w.map((t) => t.name),
    U = w.map((t, s) => ({ name: t.name, position: s + 1 })),
    d = f.useMemo(() => {
      const t = V(o, m, C);
      if (t.length > 0) {
        const s = t[t.length - 1];
        w.forEach((r) => {
          s[r.name] = Math.round(r.rating);
        });
      }
      return t;
    }, [o, m, C, w]),
    g = () =>
      [
        'Classifica Sporting Cat',
        ...w.map((s, r) => `${r + 1}. ${s.name} — ${Math.round(s.rating)} pt`),
        '#SportingCat #Padel',
      ].join(`
`),
    N =
      typeof window < 'u' ? `${window.location.origin}${window.location.pathname}#classifica` : '';
  return e.jsx(_, {
    title: 'Dashboard Classifiche',
    right: e.jsx(K, {
      size: 'sm',
      title: 'Classifica Sporting Cat',
      url: N,
      captureRef: v,
      captionBuilder: g,
      T: k,
    }),
    T: k,
    children: e.jsxs('div', {
      ref: v,
      className: 'space-y-8',
      children: [
        e.jsxs('div', {
          className: 'relative',
          children: [
            e.jsx('div', {
              className:
                'absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl',
            }),
            e.jsxs('div', {
              className:
                'relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-6 shadow-2xl',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center justify-between mb-6',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-3',
                      children: [
                        e.jsx('div', {
                          className:
                            'w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg',
                          children: '🏆',
                        }),
                        e.jsx('h3', {
                          className:
                            'text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
                          children: 'Ranking RPA',
                        }),
                      ],
                    }),
                    e.jsx('button', {
                      onClick: () => M(!S),
                      className: `px-4 py-2 text-sm rounded-xl border backdrop-blur-sm transition-all duration-300 transform hover:scale-105 ${S ? 'bg-blue-500/20 border-blue-300/50 text-blue-700 dark:bg-blue-500/30 dark:border-blue-400/50 dark:text-blue-300 shadow-lg shadow-blue-500/20' : 'bg-white/50 border-gray-200/50 text-gray-700 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-600/70 shadow-lg'}`,
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
                            className:
                              'text-left border-b border-white/20 dark:border-gray-600/30 text-gray-600 dark:text-gray-300',
                            children: [
                              e.jsx('th', { className: 'py-3 pr-3 font-semibold', children: '#' }),
                              e.jsx('th', {
                                className: 'py-3 pr-3 font-semibold',
                                children: 'Giocatore',
                              }),
                              e.jsx('th', {
                                className: 'py-3 pr-3 font-semibold',
                                children: 'Ranking',
                              }),
                              e.jsx('th', {
                                className: 'py-3 pr-3 font-semibold',
                                children: 'Vittorie',
                              }),
                              e.jsx('th', {
                                className: 'py-3 pr-3 font-semibold',
                                children: 'Sconfitte',
                              }),
                              e.jsx('th', {
                                className: 'py-3 pr-3 font-semibold',
                                children: '% Vittorie',
                              }),
                            ],
                          }),
                        }),
                        e.jsx('tbody', {
                          children: (S ? $ : $.slice(0, 10)).map((t, s) =>
                            e.jsxs(
                              'tr',
                              {
                                className:
                                  'border-b border-white/10 dark:border-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-200',
                                children: [
                                  e.jsx('td', {
                                    className:
                                      'py-3 pr-3 font-semibold text-gray-800 dark:text-gray-200',
                                    children: s + 1,
                                  }),
                                  e.jsx('td', {
                                    className: 'py-3 pr-3',
                                    children: e.jsx('button', {
                                      className:
                                        'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 hover:underline',
                                      onClick: () => u(t.id),
                                      children: t.name,
                                    }),
                                  }),
                                  e.jsxs('td', {
                                    className: 'py-3 pr-3 font-bold text-gray-900 dark:text-white',
                                    children: [
                                      t.rating.toFixed(2),
                                      e.jsx(I, {
                                        total: t.trend5Total,
                                        pos: t.trend5Pos,
                                        neg: t.trend5Neg,
                                      }),
                                    ],
                                  }),
                                  e.jsx('td', {
                                    className:
                                      'py-3 pr-3 text-green-600 dark:text-green-400 font-semibold',
                                    children: t.wins || 0,
                                  }),
                                  e.jsx('td', {
                                    className:
                                      'py-3 pr-3 text-red-600 dark:text-red-400 font-semibold',
                                    children: t.losses || 0,
                                  }),
                                  e.jsxs('td', {
                                    className:
                                      'py-3 pr-3 font-bold text-gray-800 dark:text-gray-200',
                                    children: [t.winRate.toFixed(0), '%'],
                                  }),
                                ],
                              },
                              t.id
                            )
                          ),
                        }),
                      ],
                    }),
                    !S &&
                      $.length > 10 &&
                      e.jsx('div', {
                        className: 'mt-4 text-center',
                        children: e.jsxs('button', {
                          onClick: () => M(!0),
                          className:
                            'text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/30 dark:hover:bg-gray-700/30',
                          children: ['... e altri ', $.length - 10, ' giocatori'],
                        }),
                      }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3',
                  children: [
                    e.jsx('div', {
                      className:
                        'font-semibold text-lg bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
                      children: 'Andamento del ranking',
                    }),
                    e.jsxs('div', {
                      className: 'flex items-center gap-3',
                      children: [
                        e.jsx('span', {
                          className: 'text-sm text-gray-600 dark:text-gray-400 font-medium',
                          children: 'Mostra:',
                        }),
                        e.jsxs('select', {
                          value: W,
                          onChange: (t) => y(Number(t.target.value)),
                          className:
                            'text-sm px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200',
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
                  data: d,
                  seriesKeys: E,
                  chartId: 'classifica-universal',
                  title: `Evoluzione del Top ${W}`,
                  selectedCount: W,
                  playerRankings: U,
                }),
              ],
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8',
          children: [
            e.jsxs('div', {
              className: 'relative',
              children: [
                e.jsx('div', {
                  className:
                    'absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-3xl blur-xl',
                }),
                e.jsxs('div', {
                  className:
                    'relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-4 md:p-6 shadow-2xl',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-3 mb-4 md:mb-6',
                      children: [
                        e.jsx('div', {
                          className:
                            'w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg',
                          children: '👥',
                        }),
                        e.jsx('h3', {
                          className:
                            'text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
                          children: 'Migliori Coppie',
                        }),
                      ],
                    }),
                    e.jsx('div', {
                      className:
                        'mb-4 p-3 bg-amber-50/70 dark:bg-amber-900/20 backdrop-blur-sm rounded-xl border border-amber-200/50 dark:border-amber-800/30',
                      children: e.jsxs('div', {
                        className: 'flex items-start gap-2',
                        children: [
                          e.jsx('span', { className: 'text-amber-500 text-sm', children: 'ℹ️' }),
                          e.jsxs('div', {
                            children: [
                              e.jsx('p', {
                                className:
                                  'text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1',
                                children: 'Come funziona:',
                              }),
                              e.jsx('p', {
                                className: 'text-sm text-amber-700 dark:text-amber-300',
                                children: 'Ordinate per % vittorie. Solo coppie con ≥3 partite.',
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                    e.jsx('div', {
                      className: 'block md:hidden space-y-2',
                      children: l
                        .slice(0, 8)
                        .map((t, s) =>
                          e.jsxs(
                            'div',
                            {
                              className:
                                'flex items-center justify-between py-2 px-3 bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-600/20 hover:bg-white/50 dark:hover:bg-gray-600/40 transition-all duration-200',
                              children: [
                                e.jsxs('div', {
                                  className: 'flex items-center gap-2',
                                  children: [
                                    e.jsxs('span', {
                                      className:
                                        'text-sm font-bold text-amber-600 dark:text-amber-400 w-6',
                                      children: ['#', s + 1],
                                    }),
                                    e.jsxs('span', {
                                      className:
                                        'text-sm font-medium text-gray-900 dark:text-gray-100',
                                      children: [
                                        t.players[0].split(' ').pop(),
                                        ' & ',
                                        t.players[1].split(' ').pop(),
                                      ],
                                    }),
                                  ],
                                }),
                                e.jsxs('div', {
                                  className: 'flex items-center gap-2 text-sm',
                                  children: [
                                    e.jsxs('span', {
                                      className: 'text-green-600 dark:text-green-400 font-semibold',
                                      children: [t.wins, 'V'],
                                    }),
                                    e.jsxs('span', {
                                      className: 'text-red-600 dark:text-red-400 font-semibold',
                                      children: [t.losses, 'S'],
                                    }),
                                    e.jsxs('span', {
                                      className: 'font-bold text-amber-700 dark:text-amber-300',
                                      children: [t.winRate.toFixed(0), '%'],
                                    }),
                                  ],
                                }),
                              ],
                            },
                            t.key
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
                              className:
                                'text-left border-b border-white/20 dark:border-gray-600/30 text-gray-600 dark:text-gray-300',
                              children: [
                                e.jsx('th', {
                                  className: 'py-3 pr-3 font-semibold',
                                  children: '#',
                                }),
                                e.jsx('th', {
                                  className: 'py-3 pr-3 font-semibold',
                                  children: 'Coppia',
                                }),
                                e.jsx('th', {
                                  className: 'py-3 pr-3 font-semibold',
                                  children: 'V/S',
                                }),
                                e.jsx('th', {
                                  className: 'py-3 pr-3 font-semibold',
                                  children: '%',
                                }),
                              ],
                            }),
                          }),
                          e.jsx('tbody', {
                            children: l
                              .slice(0, 8)
                              .map((t, s) =>
                                e.jsxs(
                                  'tr',
                                  {
                                    className:
                                      'border-b border-white/10 dark:border-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-200',
                                    children: [
                                      e.jsx('td', {
                                        className:
                                          'py-3 pr-3 font-semibold text-gray-800 dark:text-gray-200',
                                        children: s + 1,
                                      }),
                                      e.jsxs('td', {
                                        className:
                                          'py-3 pr-3 font-medium text-sm text-gray-900 dark:text-gray-100',
                                        children: [t.players[0], ' & ', t.players[1]],
                                      }),
                                      e.jsxs('td', {
                                        className: 'py-3 pr-3 text-sm',
                                        children: [
                                          e.jsx('span', {
                                            className:
                                              'text-green-600 dark:text-green-400 font-semibold',
                                            children: t.wins,
                                          }),
                                          '/',
                                          e.jsx('span', {
                                            className:
                                              'text-red-600 dark:text-red-400 font-semibold',
                                            children: t.losses,
                                          }),
                                        ],
                                      }),
                                      e.jsxs('td', {
                                        className:
                                          'py-3 pr-3 font-bold text-amber-700 dark:text-amber-300',
                                        children: [t.winRate.toFixed(0), '%'],
                                      }),
                                    ],
                                  },
                                  t.key
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
            e.jsxs('div', {
              className: 'relative',
              children: [
                e.jsx('div', {
                  className:
                    'absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-xl',
                }),
                e.jsxs('div', {
                  className:
                    'relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-4 md:p-6 shadow-2xl',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-3 mb-4 md:mb-6',
                      children: [
                        e.jsx('div', {
                          className:
                            'w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg',
                          children: '⚡',
                        }),
                        e.jsx('h3', {
                          className:
                            'text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
                          children: 'Classifica Efficienza',
                        }),
                      ],
                    }),
                    e.jsx('div', {
                      className:
                        'mb-4 p-3 bg-blue-50/70 dark:bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-200/50 dark:border-blue-800/30',
                      children: e.jsxs('div', {
                        className: 'flex items-start gap-2',
                        children: [
                          e.jsx('span', { className: 'text-blue-500 text-sm', children: '⚡' }),
                          e.jsxs('div', {
                            children: [
                              e.jsx('p', {
                                className:
                                  'text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1',
                                children: 'Formula:',
                              }),
                              e.jsx('p', {
                                className: 'text-sm text-blue-700 dark:text-blue-300',
                                children: '% vittorie (70%) + % game vinti (30%).',
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                    e.jsx('div', {
                      className: 'block md:hidden space-y-2',
                      children: B.slice(0, 8).map((t, s) =>
                        e.jsxs(
                          'div',
                          {
                            className:
                              'flex items-center justify-between py-2 px-3 bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-600/20 hover:bg-white/50 dark:hover:bg-gray-600/40 transition-all duration-200',
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-center gap-2',
                                children: [
                                  e.jsxs('span', {
                                    className:
                                      'text-sm font-bold text-blue-600 dark:text-blue-400 w-6',
                                    children: ['#', s + 1],
                                  }),
                                  e.jsx('button', {
                                    className:
                                      'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 hover:underline text-sm',
                                    onClick: () => u(t.id),
                                    children: t.name,
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                className: 'flex items-center gap-2 text-sm',
                                children: [
                                  e.jsxs('span', {
                                    className: 'text-green-600 dark:text-green-400 font-semibold',
                                    children: [t.wins, 'V'],
                                  }),
                                  e.jsxs('span', {
                                    className: 'text-red-600 dark:text-red-400 font-semibold',
                                    children: [t.losses, 'S'],
                                  }),
                                  e.jsxs('span', {
                                    className: 'font-bold text-blue-700 dark:text-blue-300',
                                    children: [t.efficiency.toFixed(1), '%'],
                                  }),
                                ],
                              }),
                            ],
                          },
                          t.id
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
                              className:
                                'text-left border-b border-white/20 dark:border-gray-600/30 text-gray-600 dark:text-gray-300',
                              children: [
                                e.jsx('th', {
                                  className: 'py-3 pr-3 font-semibold',
                                  children: '#',
                                }),
                                e.jsx('th', {
                                  className: 'py-3 pr-3 font-semibold',
                                  children: 'Giocatore',
                                }),
                                e.jsx('th', {
                                  className: 'py-3 pr-3 font-semibold',
                                  children: 'Eff.',
                                }),
                                e.jsx('th', {
                                  className: 'py-3 pr-3 font-semibold',
                                  children: 'V/S',
                                }),
                              ],
                            }),
                          }),
                          e.jsx('tbody', {
                            children: B.slice(0, 8).map((t, s) =>
                              e.jsxs(
                                'tr',
                                {
                                  className:
                                    'border-b border-white/10 dark:border-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-200',
                                  children: [
                                    e.jsx('td', {
                                      className:
                                        'py-3 pr-3 font-semibold text-gray-800 dark:text-gray-200',
                                      children: s + 1,
                                    }),
                                    e.jsx('td', {
                                      className: 'py-3 pr-3',
                                      children: e.jsx('button', {
                                        className:
                                          'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 hover:underline text-sm',
                                        onClick: () => u(t.id),
                                        children: t.name,
                                      }),
                                    }),
                                    e.jsxs('td', {
                                      className:
                                        'py-3 pr-3 font-bold text-blue-600 dark:text-blue-400',
                                      children: [t.efficiency.toFixed(1), '%'],
                                    }),
                                    e.jsxs('td', {
                                      className: 'py-3 pr-3 text-sm',
                                      children: [
                                        e.jsx('span', {
                                          className:
                                            'text-green-600 dark:text-green-400 font-semibold',
                                          children: t.wins,
                                        }),
                                        '/',
                                        e.jsx('span', {
                                          className: 'text-red-600 dark:text-red-400 font-semibold',
                                          children: t.losses,
                                        }),
                                      ],
                                    }),
                                  ],
                                },
                                t.id
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
            e.jsxs('div', {
              className: 'relative',
              children: [
                e.jsx('div', {
                  className:
                    'absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl blur-xl',
                }),
                e.jsxs('div', {
                  className:
                    'relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-4 md:p-6 shadow-2xl',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-3 mb-4 md:mb-6',
                      children: [
                        e.jsx('div', {
                          className:
                            'w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg',
                          children: '🔥',
                        }),
                        e.jsx('h3', {
                          className:
                            'text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
                          children: 'Streak Vittorie',
                        }),
                      ],
                    }),
                    e.jsx('div', {
                      className:
                        'mb-4 p-3 bg-green-50/70 dark:bg-green-900/20 backdrop-blur-sm rounded-xl border border-green-200/50 dark:border-green-800/30',
                      children: e.jsxs('div', {
                        className: 'flex items-start gap-2',
                        children: [
                          e.jsx('span', { className: 'text-green-500 text-sm', children: '🔥' }),
                          e.jsxs('div', {
                            children: [
                              e.jsx('p', {
                                className:
                                  'text-sm font-semibold text-green-800 dark:text-green-200 mb-1',
                                children: 'Streak vittorie:',
                              }),
                              e.jsx('p', {
                                className: 'text-sm text-green-700 dark:text-green-300',
                                children: 'Migliore serie consecutiva. 🔥 = serie attiva.',
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                    e.jsx('div', {
                      className: 'block md:hidden space-y-2',
                      children: j.positive
                        .slice(0, 8)
                        .map((t, s) =>
                          e.jsxs(
                            'div',
                            {
                              className:
                                'flex items-center justify-between py-2 px-3 bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-600/20 hover:bg-white/50 dark:hover:bg-gray-600/40 transition-all duration-200',
                              children: [
                                e.jsxs('div', {
                                  className: 'flex items-center gap-2',
                                  children: [
                                    e.jsxs('span', {
                                      className:
                                        'text-sm font-bold text-green-600 dark:text-green-400 w-6',
                                      children: ['#', s + 1],
                                    }),
                                    e.jsx('button', {
                                      className:
                                        'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 hover:underline text-sm',
                                      onClick: () => u(t.id),
                                      children: t.name,
                                    }),
                                  ],
                                }),
                                e.jsxs('div', {
                                  className: 'flex items-center gap-2 text-sm',
                                  children: [
                                    t.streakType === 'win'
                                      ? e.jsxs('span', {
                                          className:
                                            'text-green-600 dark:text-green-400 font-semibold',
                                          children: ['🔥', t.currentStreak],
                                        })
                                      : e.jsx('span', {
                                          className: 'text-gray-400',
                                          children: '-',
                                        }),
                                    e.jsx('span', {
                                      className: 'font-bold text-green-700 dark:text-green-300',
                                      children: t.bestWinStreak,
                                    }),
                                  ],
                                }),
                              ],
                            },
                            t.id
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
                              className:
                                'text-left border-b border-white/20 dark:border-gray-600/30 text-gray-600 dark:text-gray-300',
                              children: [
                                e.jsx('th', {
                                  className: 'py-3 pr-3 font-semibold',
                                  children: '#',
                                }),
                                e.jsx('th', {
                                  className: 'py-3 pr-3 font-semibold',
                                  children: 'Giocatore',
                                }),
                                e.jsx('th', {
                                  className: 'py-3 pr-3 font-semibold',
                                  children: 'Miglior',
                                }),
                                e.jsx('th', {
                                  className: 'py-3 pr-3 font-semibold',
                                  children: 'Stato',
                                }),
                              ],
                            }),
                          }),
                          e.jsx('tbody', {
                            children: j.positive
                              .slice(0, 8)
                              .map((t, s) =>
                                e.jsxs(
                                  'tr',
                                  {
                                    className:
                                      'border-b border-white/10 dark:border-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-200',
                                    children: [
                                      e.jsx('td', {
                                        className:
                                          'py-3 pr-3 font-semibold text-gray-800 dark:text-gray-200',
                                        children: s + 1,
                                      }),
                                      e.jsx('td', {
                                        className: 'py-3 pr-3',
                                        children: e.jsx('button', {
                                          className:
                                            'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 hover:underline text-sm',
                                          onClick: () => u(t.id),
                                          children: t.name,
                                        }),
                                      }),
                                      e.jsx('td', {
                                        className:
                                          'py-3 pr-3 font-bold text-green-600 dark:text-green-400',
                                        children: t.bestWinStreak,
                                      }),
                                      e.jsx('td', {
                                        className: 'py-3 pr-3',
                                        children:
                                          t.streakType === 'win'
                                            ? e.jsxs('span', {
                                                className:
                                                  'text-sm text-green-600 dark:text-green-400 font-semibold',
                                                children: ['🔥 +', t.currentStreak],
                                              })
                                            : e.jsx('span', {
                                                className: 'text-sm text-gray-500',
                                                children: '-',
                                              }),
                                      }),
                                    ],
                                  },
                                  t.id
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
            e.jsxs('div', {
              className: 'relative',
              children: [
                e.jsx('div', {
                  className:
                    'absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl',
                }),
                e.jsxs('div', {
                  className:
                    'relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-4 md:p-6 shadow-2xl',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-3 mb-4 md:mb-6',
                      children: [
                        e.jsx('div', {
                          className:
                            'w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg',
                          children: '🛡️',
                        }),
                        e.jsx('h3', {
                          className:
                            'text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
                          children: 'Ingiocabili',
                        }),
                      ],
                    }),
                    e.jsx('div', {
                      className:
                        'mb-4 p-3 bg-purple-50/70 dark:bg-purple-900/20 backdrop-blur-sm rounded-xl border border-purple-200/50 dark:border-purple-800/30',
                      children: e.jsxs('div', {
                        className: 'flex items-start gap-2',
                        children: [
                          e.jsx('span', { className: 'text-purple-500 text-sm', children: '🛡️' }),
                          e.jsxs('div', {
                            children: [
                              e.jsx('p', {
                                className:
                                  'text-sm font-semibold text-purple-800 dark:text-purple-200 mb-1',
                                children: 'Ingiocabili:',
                              }),
                              e.jsx('p', {
                                className: 'text-sm text-purple-700 dark:text-purple-300',
                                children:
                                  'Minor % sconfitte. Più basso = più difficile da battere.',
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                    e.jsx('div', {
                      className: 'block md:hidden space-y-2',
                      children: j.ingiocabili
                        .slice(0, 8)
                        .map((t, s) =>
                          e.jsxs(
                            'div',
                            {
                              className:
                                'flex items-center justify-between py-2 px-3 bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-600/20 hover:bg-white/50 dark:hover:bg-gray-600/40 transition-all duration-200',
                              children: [
                                e.jsxs('div', {
                                  className: 'flex items-center gap-2',
                                  children: [
                                    e.jsxs('span', {
                                      className:
                                        'text-sm font-bold text-purple-600 dark:text-purple-400 w-6',
                                      children: ['#', s + 1],
                                    }),
                                    e.jsx('button', {
                                      className:
                                        'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 hover:underline text-sm',
                                      onClick: () => u(t.id),
                                      children: t.name,
                                    }),
                                  ],
                                }),
                                e.jsxs('div', {
                                  className: 'flex items-center gap-2 text-sm',
                                  children: [
                                    e.jsxs('span', {
                                      className: 'text-green-600 dark:text-green-400 font-semibold',
                                      children: [t.totalWins, 'V'],
                                    }),
                                    e.jsxs('span', {
                                      className: 'text-red-600 dark:text-red-400 font-semibold',
                                      children: [t.totalLosses, 'S'],
                                    }),
                                    e.jsxs('span', {
                                      className: 'font-bold text-purple-700 dark:text-purple-300',
                                      children: [t.lossRatio.toFixed(1), '%'],
                                    }),
                                  ],
                                }),
                              ],
                            },
                            t.id
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
                              className:
                                'text-left border-b border-white/20 dark:border-gray-600/30 text-gray-600 dark:text-gray-300',
                              children: [
                                e.jsx('th', {
                                  className: 'py-3 pr-3 font-semibold',
                                  children: '#',
                                }),
                                e.jsx('th', {
                                  className: 'py-3 pr-3 font-semibold',
                                  children: 'Giocatore',
                                }),
                                e.jsx('th', {
                                  className: 'py-3 pr-3 font-semibold',
                                  children: '% Sconf.',
                                }),
                                e.jsx('th', {
                                  className: 'py-3 pr-3 font-semibold',
                                  children: 'V/S',
                                }),
                              ],
                            }),
                          }),
                          e.jsx('tbody', {
                            children: j.ingiocabili
                              .slice(0, 8)
                              .map((t, s) =>
                                e.jsxs(
                                  'tr',
                                  {
                                    className:
                                      'border-b border-white/10 dark:border-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-200',
                                    children: [
                                      e.jsx('td', {
                                        className:
                                          'py-3 pr-3 font-semibold text-gray-800 dark:text-gray-200',
                                        children: s + 1,
                                      }),
                                      e.jsx('td', {
                                        className: 'py-3 pr-3',
                                        children: e.jsx('button', {
                                          className:
                                            'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 hover:underline text-sm',
                                          onClick: () => u(t.id),
                                          children: t.name,
                                        }),
                                      }),
                                      e.jsxs('td', {
                                        className:
                                          'py-3 pr-3 font-bold text-purple-600 dark:text-purple-400',
                                        children: [t.lossRatio.toFixed(1), '%'],
                                      }),
                                      e.jsxs('td', {
                                        className: 'py-3 pr-3 text-sm',
                                        children: [
                                          e.jsx('span', {
                                            className:
                                              'text-green-600 dark:text-green-400 font-semibold',
                                            children: t.totalWins,
                                          }),
                                          '/',
                                          e.jsx('span', {
                                            className:
                                              'text-red-600 dark:text-red-400 font-semibold',
                                            children: t.totalLosses,
                                          }),
                                        ],
                                      }),
                                    ],
                                  },
                                  t.id
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
      ],
    }),
  });
}
function oe() {
  const o = O(),
    { derived: m } = D(),
    u = F.useMemo(() => G(), []),
    k = (v) => {
      o(`/stats?player=${v}`);
    };
  return e.jsx(te, { T: u, players: m.players, matches: m.matches, onOpenStats: k });
}
export { oe as default };
