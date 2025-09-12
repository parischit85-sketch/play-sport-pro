import { j as e, D as q, h as le, f as de, t as ie } from './index-mfh4d38h-CPKWh84w.js';
import { r as f, f as oe, b as ce } from './router-mfh4d38h-D14HHbEI.js';
import { S as xe } from './Section-mfh4d38h-Df1Gzqw4.js';
import { S as me } from './ShareButtons-mfh4d38h-BVbkMxAd.js';
import {
  R as ge,
  A as he,
  C as ue,
  X as be,
  Y as pe,
  T as fe,
  c as je,
} from './charts-mfh4d38h-CsjIY6G7.js';
import { M as ve } from './Modal-mfh4d38h-xCnxAVWo.js';
import { b as ke, s as J, I as ye } from './names-mfh4d38h-BW9lV2zG.js';
import './vendor-mfh4d38h-D3F3s8fL.js';
import './firebase-mfh4d38h-X_I_guKF.js';
const Q = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  indigo: '#6366f1',
  cyan: '#06b6d4',
  orange: '#f97316',
};
function Ne({
  data: j,
  dataKey: y = 'rating',
  chartId: w = 'modern-area',
  color: W = 'success',
  title: V = 'Trend ultime 10 partite',
  showGrid: x = !0,
}) {
  const N = Q[W] || Q.success,
    l = j.slice(-10),
    E = f.useMemo(() => {
      if (l.length === 0) return ['auto', 'auto'];
      let P = 1 / 0,
        B = -1 / 0;
      if (
        (l.forEach((_) => {
          const F = _[y];
          typeof F == 'number' && ((P = Math.min(P, F)), (B = Math.max(B, F)));
        }),
        P === 1 / 0)
      )
        return ['auto', 'auto'];
      const O = (B - P) * 0.08;
      return [Math.max(0, Math.floor(P - O)), Math.ceil(B + O)];
    }, [l, y]),
    $ = ({ active: P, payload: B, label: I }) =>
      P && B && B.length
        ? e.jsxs('div', {
            className:
              'bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4',
            children: [
              e.jsx('p', {
                className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2',
                children: I,
              }),
              e.jsx('p', {
                className: 'text-sm text-gray-600 dark:text-gray-400',
                children: e.jsxs('span', {
                  className: 'font-semibold',
                  style: { color: N },
                  children: [y, ': ', B[0].value],
                }),
              }),
            ],
          })
        : null,
    G = l.length > 1 ? l[l.length - 1][y] - l[0][y] : 0,
    L = G > 0 ? '#10b981' : G < 0 ? '#ef4444' : '#6b7280',
    U = G > 0 ? '↗' : G < 0 ? '↘' : '→';
  return e.jsxs('div', {
    className: 'h-64 sm:h-80',
    children: [
      e.jsx(ge, {
        width: '100%',
        height: '100%',
        children: e.jsxs(he, {
          data: l,
          margin: { left: 10, right: 10, top: 20, bottom: 20 },
          children: [
            e.jsxs('defs', {
              children: [
                e.jsxs('linearGradient', {
                  id: `modernGradient-${w}`,
                  x1: '0',
                  y1: '0',
                  x2: '0',
                  y2: '1',
                  children: [
                    e.jsx('stop', { offset: '0%', stopColor: N, stopOpacity: 0.4 }),
                    e.jsx('stop', { offset: '50%', stopColor: N, stopOpacity: 0.2 }),
                    e.jsx('stop', { offset: '100%', stopColor: N, stopOpacity: 0.05 }),
                  ],
                }),
                e.jsxs('filter', {
                  id: `glow-${w}`,
                  children: [
                    e.jsx('feGaussianBlur', { stdDeviation: '3', result: 'coloredBlur' }),
                    e.jsxs('feMerge', {
                      children: [
                        e.jsx('feMergeNode', { in: 'coloredBlur' }),
                        e.jsx('feMergeNode', { in: 'SourceGraphic' }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            x &&
              e.jsx(ue, {
                strokeDasharray: '2 4',
                strokeOpacity: 0.15,
                horizontal: !0,
                vertical: !1,
              }),
            e.jsx(be, {
              dataKey: 'label',
              tick: { fontSize: 11, fill: '#6b7280' },
              axisLine: !1,
              tickLine: !1,
              interval: 'preserveStartEnd',
            }),
            e.jsx(pe, {
              tick: { fontSize: 11, fill: '#6b7280' },
              axisLine: !1,
              tickLine: !1,
              width: 50,
              domain: E,
              scale: 'linear',
            }),
            e.jsx(fe, { content: e.jsx($, {}) }),
            e.jsx(je, {
              type: 'monotone',
              dataKey: y,
              stroke: N,
              strokeWidth: 3,
              fill: `url(#modernGradient-${w})`,
              dot: { r: 3, fill: N, stroke: 'white', strokeWidth: 2, filter: `url(#glow-${w})` },
              activeDot: {
                r: 6,
                fill: N,
                stroke: 'white',
                strokeWidth: 3,
                className: 'drop-shadow-lg animate-pulse',
              },
              className: 'drop-shadow-sm',
            }),
          ],
        }),
      }),
      e.jsxs('div', {
        className: 'flex justify-between items-center mt-3 px-2',
        children: [
          e.jsx('span', {
            className: 'text-xs font-medium text-gray-600 dark:text-gray-400',
            children: V,
          }),
          e.jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              l.length > 1 &&
                e.jsx('div', {
                  className: 'flex items-center gap-1',
                  children: e.jsxs('span', {
                    className: 'text-sm font-bold',
                    style: { color: L },
                    children: [U, ' ', Math.abs(G).toFixed(0)],
                  }),
                }),
              e.jsxs('span', {
                className: 'text-xs text-gray-500',
                children: [l.length, ' partite'],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function we({
  players: j,
  matches: y,
  selectedPlayerId: w,
  onSelectPlayer: W,
  onShowFormula: V,
  T: x,
}) {
  const N = f.useRef(null),
    [l, E] = f.useState(w || j[0]?.id || ''),
    [$, G] = f.useState(''),
    [L, U] = f.useState('all'),
    [P, B] = f.useState(null),
    [I, O] = f.useState(!1),
    [_, F] = f.useState(null);
  f.useEffect(() => {
    w && E(w);
  }, [w]);
  const D = (t) => j.find((r) => r.id === t)?.name || t,
    p = j.find((t) => t.id === l) || null;
  j.find((t) => t.id === $);
  const C = f.useMemo(() => {
      if (L === 'all') return y;
      const t = new Date(),
        r = new Date();
      switch (L) {
        case '1w':
          r.setDate(t.getDate() - 7);
          break;
        case '2w':
          r.setDate(t.getDate() - 14);
          break;
        case '30d':
          r.setDate(t.getDate() - 30);
          break;
        case '3m':
          r.setMonth(t.getMonth() - 3);
          break;
        case '6m':
          r.setMonth(t.getMonth() - 6);
          break;
        default:
          return y;
      }
      return (y || []).filter((o) => new Date(o.date) >= r);
    }, [y, L]),
    Z = f.useMemo(() => [...j].sort((t, r) => r.rating - t.rating), [j]),
    K = p ? Z.findIndex((t) => t.id === p.id) + 1 : null,
    X = (p?.wins || 0) + (p?.losses || 0);
  X && Math.round((p.wins / X) * 100);
  const d = f.useMemo(() => {
      if (!l) return null;
      const t = (C || []).filter((m) => (m.teamA || []).includes(l) || (m.teamB || []).includes(l));
      if (t.length === 0) return null;
      let r = 0,
        o = 0,
        n = 0,
        b = 0,
        g = 0,
        h = 0,
        u = 0,
        v = 0,
        S = 0,
        k = 0,
        a = 0;
      const i = [...t].sort((m, A) => new Date(m.date) - new Date(A.date));
      i.forEach((m) => {
        const A = (m.teamA || []).includes(l),
          T = (A && m.winner === 'A') || (!A && m.winner === 'B'),
          H = A ? m.deltaA || 0 : m.deltaB || 0;
        ((u += H),
          T
            ? (g++,
              n++,
              (b = 0),
              (r = Math.max(r, n)),
              ((A && m.setsA === 2 && m.setsB === 0) || (!A && m.setsB === 2 && m.setsA === 0)) &&
                a++)
            : (h++, b++, (n = 0), (o = Math.max(o, b))),
          ((m.setsA === 2 && m.setsB === 1) || (m.setsA === 1 && m.setsB === 2)) && k++,
          A
            ? ((v += m.gamesA || 0), (S += m.gamesB || 0))
            : ((v += m.gamesB || 0), (S += m.gamesA || 0)));
      });
      let s = 0,
        c = null;
      for (let m = i.length - 1; m >= 0; m--) {
        const A = i[m],
          T = (A.teamA || []).includes(l),
          H = (T && A.winner === 'A') || (!T && A.winner === 'B');
        if (c === null) ((c = H), (s = 1));
        else if (c === H) s++;
        else break;
      }
      const R = u / t.length,
        M = v + S > 0 ? (v / (v + S)) * 100 : 0,
        ae = g > 0 ? (a / g) * 100 : 0,
        ne = k > 0 ? ((g - a) / k) * 100 : 0;
      return {
        wins: g,
        losses: h,
        winRate: g + h > 0 ? (g / (g + h)) * 100 : 0,
        currentStreak: c === null ? 0 : c ? s : -s,
        maxWinStreak: r,
        maxLoseStreak: o,
        avgDelta: Math.round(R * 10) / 10,
        gameEfficiency: Math.round(M * 10) / 10,
        dominanceRate: Math.round(ae * 10) / 10,
        clutchRate: Math.round(ne * 10) / 10,
        totalMatches: t.length,
        closeMatches: k,
        dominantWins: a,
      };
    }, [l, C]),
    Y = f.useMemo(() => [...j].sort(ke), [j]),
    ee = f.useMemo(() => {
      if (!l) return [];
      const t = new Map(
          j.map((n) => [n.id, Number(n.baseRating ?? n.startRating ?? n.rating ?? q)])
        ),
        r = [];
      r.push({ date: null, label: 'Start', rating: Math.round(t.get(l) ?? q) });
      const o = [...(C || [])].sort((n, b) => new Date(n.date) - new Date(b.date));
      for (const n of o) {
        le(n.sets);
        const b = (u, v) => t.set(u, (t.get(u) ?? q) + v),
          g = n.deltaA ?? 0,
          h = n.deltaB ?? 0;
        (b(n.teamA[0], g),
          b(n.teamA[1], g),
          b(n.teamB[0], h),
          b(n.teamB[1], h),
          (n.teamA.includes(l) || n.teamB.includes(l)) &&
            r.push({
              date: new Date(n.date),
              label: new Date(n.date).toLocaleString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }),
              rating: Math.round(t.get(l) ?? q),
            }));
      }
      return r;
    }, [l, j, C]),
    z = f.useMemo(() => {
      if (!l)
        return { mates: [], opps: [], topMates: [], worstMates: [], topOpps: [], worstOpps: [] };
      const t = (C || []).filter((a) => (a.teamA || []).includes(l) || (a.teamB || []).includes(l)),
        r = new Map(),
        o = new Map(),
        n = (a, i, s) => {
          if (!i) return;
          const c = a.get(i) || { wins: 0, losses: 0 };
          (s ? c.wins++ : c.losses++, a.set(i, c));
        };
      for (const a of t) {
        const i = (a.teamA || []).includes(l),
          s = (i && a.winner === 'A') || (!i && a.winner === 'B'),
          c = i ? (a.teamA || []).find((M) => M !== l) : (a.teamB || []).find((M) => M !== l),
          R = i ? a.teamB || [] : a.teamA || [];
        c && n(r, c, s);
        for (const M of R) n(o, M, s);
      }
      const b = (a) =>
          [...a.entries()]
            .map(([i, s]) => {
              const c = s.wins + s.losses,
                R = c ? Math.round((s.wins / c) * 100) : 0;
              return { id: i, name: D(i), wins: s.wins, losses: s.losses, total: c, winPct: R };
            })
            .sort((i, s) => s.total - i.total || s.winPct - i.winPct || ye.compare(i.name, s.name)),
        g = b(r),
        h = b(o),
        u = g.sort((a, i) => i.winPct - a.winPct).slice(0, 5),
        v = g.sort((a, i) => a.winPct - i.winPct).slice(0, 5),
        S = h.sort((a, i) => i.winPct - a.winPct).slice(0, 5),
        k = h.sort((a, i) => a.winPct - i.winPct).slice(0, 5);
      return { mates: g, opps: h, topMates: u, worstMates: v, topOpps: S, worstOpps: k };
    }, [l, C, j]),
    te = () =>
      [
        `Statistiche — ${p ? p.name : ''}`,
        `Ranking: ${p ? Math.round(p.rating) : '-'}`,
        `Record: ${d?.wins || 0}–${d?.losses || 0} (${Math.round(d?.winRate || 0)}%)`,
        `Game Eff.: ${d ? d.gameEfficiency : 0}% • Δ medio: ${d ? d.avgDelta : 0}`,
        '#SportingCat #Padel',
      ].join(`
`),
    re =
      typeof window < 'u'
        ? `${window.location.origin}${window.location.pathname}#stats-${l || ''}`
        : '',
    se = () => {
      const t = _;
      if (!t) return null;
      const r = (t.teamA || []).includes(l),
        o = (r && t.winner === 'A') || (!r && t.winner === 'B'),
        n = r ? (t.deltaA ?? 0) : (t.deltaB ?? 0);
      ((r ? t.teamA : t.teamB).map((u) => D(u)), (r ? t.teamB : t.teamA).map((u) => D(u)));
      const b = Math.round(t.sumA || 0),
        g = Math.round(t.sumB || 0),
        h = Math.round(t.gap || 0);
      return (
        t.factor,
        t.base,
        t.gd,
        e.jsx(ve, {
          open: I,
          onClose: () => {
            (O(!1), F(null));
          },
          title: 'Sistema RPA - Ranking Points Algorithm',
          size: 'lg',
          T: x,
          children: e.jsxs('div', {
            className: 'space-y-6',
            children: [
              e.jsxs('div', {
                className:
                  'bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700',
                children: [
                  e.jsx('h4', {
                    className: 'font-semibold text-blue-900 dark:text-blue-100 mb-2',
                    children: "🎯 Cos'è il Sistema RPA?",
                  }),
                  e.jsxs('p', {
                    className: 'text-blue-800 dark:text-blue-200 text-sm leading-relaxed mb-3',
                    children: [
                      'Il ',
                      e.jsx('strong', { children: 'Ranking Points Algorithm (RPA)' }),
                      " è un sistema di punteggio dinamico che assegna punti in base alla differenza di livello tra le squadre e al risultato della partita. Più forte è l'avversario sconfitto, più punti si guadagnano!",
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'bg-white dark:bg-blue-800/30 p-3 rounded border',
                    children: [
                      e.jsx('div', {
                        className:
                          'text-center text-lg font-bold text-blue-600 dark:text-blue-300 mb-2',
                        children: 'Punti = (Base + DG) × Factor',
                      }),
                      e.jsxs('div', {
                        className: 'text-xs text-blue-700 dark:text-blue-200 space-y-1',
                        children: [
                          e.jsxs('div', {
                            children: [
                              e.jsx('strong', { children: 'Base' }),
                              ' = (Ranking TeamA + Ranking TeamB) ÷ 100',
                            ],
                          }),
                          e.jsxs('div', {
                            children: [
                              e.jsx('strong', { children: 'DG' }),
                              ' = Differenza Game tra vincitori e perdenti',
                            ],
                          }),
                          e.jsxs('div', {
                            children: [
                              e.jsx('strong', { children: 'Factor' }),
                              ' = Moltiplicatore basato sul Gap di ranking',
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('h4', {
                    className: 'font-semibold text-gray-900 dark:text-gray-100 mb-3',
                    children: '⚖️ Scaglioni Factor',
                  }),
                  e.jsxs('div', {
                    className: 'grid grid-cols-3 gap-2 text-xs',
                    children: [
                      e.jsxs('div', {
                        className: 'bg-red-50 dark:bg-red-900/20 p-2 rounded border text-center',
                        children: [
                          e.jsx('div', {
                            className: 'font-mono text-red-600 font-bold',
                            children: '≤-1500',
                          }),
                          e.jsx('div', {
                            className: 'text-red-600 font-semibold',
                            children: '0.6-0.75',
                          }),
                          e.jsx('div', {
                            className: 'text-[10px] text-red-700',
                            children: 'Molto più debole',
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        className:
                          'bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border text-center',
                        children: [
                          e.jsx('div', {
                            className: 'font-mono text-yellow-700 font-bold',
                            children: '-300~+300',
                          }),
                          e.jsx('div', {
                            className: 'text-yellow-700 font-semibold',
                            children: '0.9-1.1',
                          }),
                          e.jsx('div', {
                            className: 'text-[10px] text-yellow-800',
                            children: 'Equilibrato',
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        className:
                          'bg-green-50 dark:bg-green-900/20 p-2 rounded border text-center',
                        children: [
                          e.jsx('div', {
                            className: 'font-mono text-green-600 font-bold',
                            children: '≥+1500',
                          }),
                          e.jsx('div', {
                            className: 'text-green-600 font-semibold',
                            children: '1.25-1.6',
                          }),
                          e.jsx('div', {
                            className: 'text-[10px] text-green-700',
                            children: 'Molto più forte',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                className:
                  'bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700',
                children: [
                  e.jsx('h4', {
                    className: 'font-semibold text-blue-900 dark:text-blue-100 mb-3',
                    children: '� Partita Analizzata',
                  }),
                  e.jsxs('div', {
                    className: 'grid grid-cols-2 gap-4 text-sm',
                    children: [
                      e.jsxs('div', {
                        className: `p-3 rounded-lg ${(o && r) || (!o && !r) ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300' : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-300'}`,
                        children: [
                          e.jsx('div', {
                            className: 'font-semibold text-gray-900 dark:text-gray-100',
                            children: 'Team A',
                          }),
                          e.jsx('div', {
                            className: 'text-xs text-gray-600 dark:text-gray-300 mb-1',
                            children: t.teamA?.map((u) => D(u)).join(' & '),
                          }),
                          e.jsxs('div', {
                            className: 'text-lg font-bold text-blue-600',
                            children: ['Rating: ', b],
                          }),
                          e.jsxs('div', {
                            className: 'text-xs',
                            children: ['Sets: ', t.setsA, ' • Games: ', t.gamesA],
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        className: `p-3 rounded-lg ${(o && !r) || (!o && r) ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300' : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-300'}`,
                        children: [
                          e.jsx('div', {
                            className: 'font-semibold text-gray-900 dark:text-gray-100',
                            children: 'Team B',
                          }),
                          e.jsx('div', {
                            className: 'text-xs text-gray-600 dark:text-gray-300 mb-1',
                            children: t.teamB?.map((u) => D(u)).join(' & '),
                          }),
                          e.jsxs('div', {
                            className: 'text-lg font-bold text-blue-600',
                            children: ['Rating: ', g],
                          }),
                          e.jsxs('div', {
                            className: 'text-xs',
                            children: ['Sets: ', t.setsB, ' • Games: ', t.gamesB],
                          }),
                        ],
                      }),
                    ],
                  }),
                  t.date &&
                    e.jsxs('div', {
                      className: 'text-xs text-gray-500 dark:text-gray-400 mt-2 text-center',
                      children: [
                        '📅',
                        ' ',
                        new Date(t.date).toLocaleDateString('it-IT', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                      ],
                    }),
                ],
              }),
              e.jsxs('div', {
                className:
                  'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-700',
                children: [
                  e.jsxs('h4', {
                    className:
                      'font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2',
                    children: ['🎯 Risultato per ', D(l)],
                  }),
                  e.jsxs('div', {
                    className: 'text-center',
                    children: [
                      e.jsx('div', {
                        className: 'text-sm text-purple-700 dark:text-purple-300 mb-1',
                        children: o ? '🏆 Vittoria!' : '💔 Sconfitta',
                      }),
                      e.jsxs('div', {
                        className: `text-3xl font-bold ${n >= 0 ? 'text-green-600' : 'text-red-600'} mb-2`,
                        children: [n >= 0 ? '+' : '', Math.round(n), ' punti'],
                      }),
                      e.jsx('div', {
                        className:
                          'text-xs text-purple-600 dark:text-purple-400 bg-white dark:bg-purple-900/20 p-2 rounded',
                        children: o
                          ? h > 300
                            ? '🚀 Ottima vittoria contro avversari più forti!'
                            : h < -300
                              ? '⚠️ Vittoria facile, pochi punti guadagnati'
                              : '✅ Vittoria equilibrata, punti standard'
                          : h > 300
                            ? '😓 Sconfitta comprensibile contro avversari forti'
                            : h < -300
                              ? '😱 Brutta sconfitta, molti punti persi!'
                              : '📉 Sconfitta equilibrata, punti standard persi',
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border text-xs',
                children: [
                  e.jsx('h4', {
                    className: 'font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm',
                    children: '💡 Punti Chiave',
                  }),
                  e.jsxs('div', {
                    className: 'grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs',
                    children: [
                      e.jsxs('div', {
                        children: [
                          '• ',
                          e.jsx('strong', { children: 'Battere i forti' }),
                          ': Factor ',
                          '>',
                          ' 1.0 = Più punti',
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          '• ',
                          e.jsx('strong', { children: 'Vittorie nette' }),
                          ': DG alta = Bonus punti',
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          '• ',
                          e.jsx('strong', { children: 'Avversari deboli' }),
                          ': Factor ',
                          '<',
                          ' 1.0 = Meno punti',
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          '• ',
                          e.jsx('strong', { children: 'Perdere' }),
                          ': Stessi punti ma negativi',
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        })
      );
    };
  return e.jsxs(xe, {
    title: '📊 Statistiche Giocatore',
    right: e.jsx(me, {
      size: 'sm',
      title: `Statistiche — ${p ? p.name : ''}`,
      url: re,
      captureRef: N,
      captionBuilder: te,
      T: x,
    }),
    T: x,
    children: [
      e.jsxs('div', {
        ref: N,
        className: 'space-y-8',
        children: [
          e.jsx('div', {
            className:
              'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl',
            children: e.jsxs('div', {
              className: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsxs('div', {
                      className:
                        'text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2',
                      children: [
                        e.jsx('div', {
                          className:
                            'w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full',
                        }),
                        'Giocatore',
                      ],
                    }),
                    e.jsx('select', {
                      value: l,
                      onChange: (t) => {
                        (E(t.target.value), W?.(t.target.value));
                      },
                      className:
                        'w-full px-4 py-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 text-sm',
                      children: Y.map((t) =>
                        e.jsx('option', { value: t.id, children: t.name }, t.id)
                      ),
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsxs('div', {
                      className:
                        'text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2',
                      children: [
                        e.jsx('div', {
                          className:
                            'w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full',
                        }),
                        'Periodo',
                      ],
                    }),
                    e.jsxs('select', {
                      value: L,
                      onChange: (t) => U(t.target.value),
                      className:
                        'w-full px-4 py-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 text-sm',
                      children: [
                        e.jsx('option', { value: '1w', children: '1 settimana' }),
                        e.jsx('option', { value: '2w', children: '2 settimane' }),
                        e.jsx('option', { value: '30d', children: '30 giorni' }),
                        e.jsx('option', { value: '3m', children: '3 mesi' }),
                        e.jsx('option', { value: '6m', children: '6 mesi' }),
                        e.jsx('option', { value: 'all', children: 'Tutto' }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          }),
          e.jsxs('div', {
            className: 'grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4',
            children: [
              e.jsxs('div', {
                className:
                  'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 backdrop-blur-xl rounded-2xl border border-blue-200/30 dark:border-blue-700/30 p-4 sm:p-6 shadow-xl',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2',
                    children: [
                      e.jsx('div', {
                        className:
                          'w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center',
                        children: e.jsx('svg', {
                          className: 'w-3 h-3 sm:w-5 sm:h-5 text-white',
                          fill: 'none',
                          stroke: 'currentColor',
                          viewBox: '0 0 24 24',
                          children: e.jsx('path', {
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeWidth: 2,
                            d: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
                          }),
                        }),
                      }),
                      e.jsx('span', {
                        className:
                          'text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300',
                        children: 'Posizione',
                      }),
                    ],
                  }),
                  e.jsx('div', {
                    className: 'text-xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400',
                    children: K ?? '-',
                  }),
                ],
              }),
              e.jsxs('div', {
                className:
                  'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 backdrop-blur-xl rounded-2xl border border-emerald-200/30 dark:border-emerald-700/30 p-4 sm:p-6 shadow-xl',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2',
                    children: [
                      e.jsx('div', {
                        className:
                          'w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center',
                        children: e.jsx('svg', {
                          className: 'w-3 h-3 sm:w-5 sm:h-5 text-white',
                          fill: 'none',
                          stroke: 'currentColor',
                          viewBox: '0 0 24 24',
                          children: e.jsx('path', {
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeWidth: 2,
                            d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                          }),
                        }),
                      }),
                      e.jsx('span', {
                        className:
                          'text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300',
                        children: 'Ranking',
                      }),
                    ],
                  }),
                  e.jsx('div', {
                    className:
                      'text-xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400',
                    children: p ? Math.round(p.rating) : '-',
                  }),
                ],
              }),
              e.jsxs('div', {
                className:
                  'col-span-2 sm:col-span-1 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 backdrop-blur-xl rounded-2xl border border-purple-200/30 dark:border-purple-700/30 p-4 sm:p-6 shadow-xl',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2',
                    children: [
                      e.jsx('div', {
                        className:
                          'w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center',
                        children: e.jsx('svg', {
                          className: 'w-3 h-3 sm:w-5 sm:h-5 text-white',
                          fill: 'none',
                          stroke: 'currentColor',
                          viewBox: '0 0 24 24',
                          children: e.jsx('path', {
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeWidth: 2,
                            d: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
                          }),
                        }),
                      }),
                      e.jsx('span', {
                        className:
                          'text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300',
                        children: 'Win Rate',
                      }),
                    ],
                  }),
                  e.jsx('div', {
                    className: 'text-xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400',
                    children: `${d ? Math.round(d.winRate) : 0}%`,
                  }),
                  e.jsx('div', {
                    className: 'text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1',
                    children: `${d?.wins || 0}–${d?.losses || 0}`,
                  }),
                ],
              }),
            ],
          }),
          d &&
            e.jsxs('div', {
              className: 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4',
              children: [
                e.jsxs('div', {
                  className:
                    'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 backdrop-blur-xl rounded-2xl border border-orange-200/30 dark:border-orange-700/30 p-4 sm:p-6 shadow-xl',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2',
                      children: [
                        e.jsx('div', {
                          className:
                            'w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center',
                          children: e.jsx('svg', {
                            className: 'w-3 h-3 sm:w-5 sm:h-5 text-white',
                            fill: 'none',
                            stroke: 'currentColor',
                            viewBox: '0 0 24 24',
                            children: e.jsx('path', {
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round',
                              strokeWidth: 2,
                              d: 'M13 10V3L4 14h7v7l9-11h-7z',
                            }),
                          }),
                        }),
                        e.jsx('span', {
                          className:
                            'text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300',
                          children: 'Efficienza Game',
                        }),
                      ],
                    }),
                    e.jsx('div', {
                      className:
                        'text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400',
                      children: `${d.gameEfficiency}%`,
                    }),
                    e.jsx('div', {
                      className: 'text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1',
                      children: '% game vinti',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className:
                    'bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 backdrop-blur-xl rounded-2xl border border-cyan-200/30 dark:border-cyan-700/30 p-4 sm:p-6 shadow-xl',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2',
                      children: [
                        e.jsx('div', {
                          className:
                            'w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center',
                          children: e.jsx('svg', {
                            className: 'w-3 h-3 sm:w-5 sm:h-5 text-white',
                            fill: 'none',
                            stroke: 'currentColor',
                            viewBox: '0 0 24 24',
                            children: e.jsx('path', {
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round',
                              strokeWidth: 2,
                              d: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
                            }),
                          }),
                        }),
                        e.jsx('span', {
                          className:
                            'text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300',
                          children: 'Δ Medio',
                        }),
                      ],
                    }),
                    e.jsx('div', {
                      className: `text-lg sm:text-2xl font-bold ${d.avgDelta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`,
                      children: d.avgDelta > 0 ? `+${d.avgDelta}` : `${d.avgDelta}`,
                    }),
                    e.jsx('div', {
                      className: 'text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1',
                      children: 'punti per partita',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className:
                    'bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 backdrop-blur-xl rounded-2xl border border-rose-200/30 dark:border-rose-700/30 p-4 sm:p-6 shadow-xl',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2',
                      children: [
                        e.jsx('div', {
                          className:
                            'w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg flex items-center justify-center',
                          children: e.jsx('svg', {
                            className: 'w-3 h-3 sm:w-5 sm:h-5 text-white',
                            fill: 'none',
                            stroke: 'currentColor',
                            viewBox: '0 0 24 24',
                            children: e.jsx('path', {
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round',
                              strokeWidth: 2,
                              d: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
                            }),
                          }),
                        }),
                        e.jsx('span', {
                          className:
                            'text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300',
                          children: 'Striscia Record',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: `text-lg sm:text-2xl font-bold ${d.currentStreak > 0 ? 'text-emerald-600 dark:text-emerald-400' : d.currentStreak < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`,
                      children: [d.currentStreak > 0 && '+', d.currentStreak],
                    }),
                    e.jsx('div', {
                      className: 'text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1',
                      children:
                        d.currentStreak > 0
                          ? 'vittorie'
                          : d.currentStreak < 0
                            ? 'sconfitte'
                            : 'nessuna',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className:
                    'bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 backdrop-blur-xl rounded-2xl border border-violet-200/30 dark:border-violet-700/30 p-6 shadow-xl',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-3 mb-2',
                      children: [
                        e.jsx('div', {
                          className:
                            'w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center',
                          children: e.jsx('svg', {
                            className: 'w-5 h-5 text-white',
                            fill: 'none',
                            stroke: 'currentColor',
                            viewBox: '0 0 24 24',
                            children: e.jsx('path', {
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round',
                              strokeWidth: 2,
                              d: 'M13 10V3L4 14h7v7l9-11h-7z',
                            }),
                          }),
                        }),
                        e.jsx('span', {
                          className: 'text-sm font-medium text-gray-600 dark:text-gray-300',
                          children: 'Striscia attiva',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: `text-2xl font-bold ${d.currentStreak > 0 ? 'text-emerald-600 dark:text-emerald-400' : d.currentStreak < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`,
                      children: [d.currentStreak > 0 && '+', d.currentStreak],
                    }),
                    e.jsx('div', {
                      className: 'text-sm text-gray-500 dark:text-gray-400 mt-1',
                      children:
                        d.currentStreak > 0
                          ? 'vittorie consecutive'
                          : d.currentStreak < 0
                            ? 'sconfitte consecutive'
                            : 'nessuna striscia',
                    }),
                  ],
                }),
              ],
            }),
          e.jsxs('div', {
            className:
              'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-6',
                children: [
                  e.jsxs('h3', {
                    className:
                      'text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3',
                    children: [
                      e.jsx('div', {
                        className:
                          'w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center',
                        children: e.jsx('svg', {
                          className: 'w-5 h-5 text-white',
                          fill: 'none',
                          stroke: 'currentColor',
                          viewBox: '0 0 24 24',
                          children: e.jsx('path', {
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeWidth: 2,
                            d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                          }),
                        }),
                      }),
                      'Andamento Ranking',
                    ],
                  }),
                  e.jsx('span', {
                    className:
                      'text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full',
                    children: L === 'all' ? 'Tutte le partite' : 'Periodo selezionato',
                  }),
                ],
              }),
              e.jsx(Ne, {
                data: ee,
                dataKey: 'rating',
                chartId: `player-${l}`,
                color: 'success',
                title: 'Evoluzione del rating',
              }),
            ],
          }),
          e.jsxs('div', {
            className: `rounded-2xl ${x.cardBg} ${x.border} p-3 sm:p-4 mb-6`,
            children: [
              e.jsxs('div', {
                className: 'space-y-3 mb-4',
                children: [
                  e.jsx('div', { className: 'font-medium', children: 'Confronto diretto' }),
                  e.jsxs('select', {
                    value: $,
                    onChange: (t) => G(t.target.value),
                    className: `${x.input} w-full text-sm`,
                    children: [
                      e.jsx('option', { value: '', children: 'Seleziona un giocatore…' }),
                      Y.filter((t) => t.id !== l).map((t) =>
                        e.jsx('option', { value: t.id, children: t.name }, t.id)
                      ),
                    ],
                  }),
                ],
              }),
              $
                ? (() => {
                    const t = j.find((s) => s.id === $),
                      r = (C || []).filter(
                        (s) => (s.teamA || []).includes(t.id) || (s.teamB || []).includes(t.id)
                      );
                    let o = 0,
                      n = 0,
                      b = 0,
                      g = 0,
                      h = 0;
                    const u = [...r].sort((s, c) => new Date(s.date) - new Date(c.date));
                    u.forEach((s) => {
                      const c = (s.teamA || []).includes(t.id),
                        R = (c && s.winner === 'A') || (!c && s.winner === 'B'),
                        M = c ? s.deltaA || 0 : s.deltaB || 0;
                      (R ? o++ : n++,
                        c
                          ? ((g += s.gamesA || 0), (h += s.gamesB || 0))
                          : ((g += s.gamesB || 0), (h += s.gamesA || 0)),
                        (b += M));
                    });
                    let v = null;
                    for (let s = u.length - 1; s >= 0; s--) {
                      const c = u[s],
                        R = (c.teamA || []).includes(t.id),
                        M = (R && c.winner === 'A') || (!R && c.winner === 'B');
                      if (v === null) v = M;
                      else if (v !== M) break;
                    }
                    const S = o + n > 0 ? Math.round((o / (o + n)) * 100) : 0,
                      k = g + h > 0 ? Math.round((g / (g + h)) * 1e3) / 10 : 0,
                      a = o + n > 0 ? Math.round((b / (o + n)) * 10) / 10 : 0,
                      i = [
                        {
                          metric: 'Ranking',
                          player1: p ? Math.round(p.rating) : '-',
                          player2: t ? Math.round(t.rating) : '-',
                          diff: p && t ? Math.round(p.rating - t.rating) : '-',
                        },
                        {
                          metric: 'Win Rate',
                          player1: `${d ? Math.round(d.winRate) : 0}%`,
                          player2: `${S}%`,
                          diff: `${d ? Math.round(d.winRate - S) : 0}%`,
                        },
                        {
                          metric: 'Partite',
                          player1: d ? d.totalMatches : 0,
                          player2: o + n,
                          diff: d ? d.totalMatches - (o + n) : 0,
                        },
                        {
                          metric: 'Eff. game',
                          player1: `${d ? d.gameEfficiency : 0}%`,
                          player2: `${k}%`,
                          diff: `${d ? Math.round((d.gameEfficiency - k) * 10) / 10 : 0}%`,
                        },
                        {
                          metric: 'Δ medio',
                          player1: d ? d.avgDelta : 0,
                          player2: a,
                          diff: d ? Math.round((d.avgDelta - a) * 10) / 10 : 0,
                        },
                      ];
                    return e.jsxs('div', {
                      className: 'space-y-3',
                      children: [
                        e.jsx('div', {
                          className: 'space-y-3 sm:hidden',
                          children: i.map((s, c) =>
                            e.jsxs(
                              'div',
                              {
                                className: `rounded-lg p-3 ${x.cardBg} border ${x.border}`,
                                children: [
                                  e.jsx('div', {
                                    className: 'font-medium text-sm mb-2',
                                    children: s.metric,
                                  }),
                                  e.jsxs('div', {
                                    className: 'grid grid-cols-3 gap-2 text-center text-sm',
                                    children: [
                                      e.jsxs('div', {
                                        children: [
                                          e.jsx('div', {
                                            className: 'font-semibold',
                                            children: s.player1,
                                          }),
                                          e.jsx('div', {
                                            className: 'text-xs text-gray-500 truncate',
                                            children: p?.name,
                                          }),
                                        ],
                                      }),
                                      e.jsxs('div', {
                                        children: [
                                          e.jsx('div', {
                                            className: 'font-semibold',
                                            children: s.player2,
                                          }),
                                          e.jsx('div', {
                                            className: 'text-xs text-gray-500 truncate',
                                            children: t?.name,
                                          }),
                                        ],
                                      }),
                                      e.jsxs('div', {
                                        children: [
                                          e.jsx('div', {
                                            className: 'font-semibold text-blue-600',
                                            children: s.diff,
                                          }),
                                          e.jsx('div', {
                                            className: 'text-xs text-gray-500',
                                            children: 'Diff',
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              },
                              c
                            )
                          ),
                        }),
                        e.jsx('div', {
                          className: 'hidden sm:block overflow-x-auto',
                          children: e.jsxs('table', {
                            className: 'w-full text-sm',
                            children: [
                              e.jsx('thead', {
                                children: e.jsxs('tr', {
                                  className: `border-b ${x.border} ${x.tableHeadText}`,
                                  children: [
                                    e.jsx('th', {
                                      className: 'text-left py-2',
                                      children: 'Metrica',
                                    }),
                                    e.jsx('th', {
                                      className: 'text-center py-2',
                                      children: p?.name || '-',
                                    }),
                                    e.jsx('th', {
                                      className: 'text-center py-2',
                                      children: t?.name || '-',
                                    }),
                                    e.jsx('th', {
                                      className: 'text-center py-2',
                                      children: 'Diff',
                                    }),
                                  ],
                                }),
                              }),
                              e.jsx('tbody', {
                                children: i.map((s, c) =>
                                  e.jsxs(
                                    'tr',
                                    {
                                      className: 'border-b border-black/5',
                                      children: [
                                        e.jsx('td', {
                                          className: 'py-2 font-medium',
                                          children: s.metric,
                                        }),
                                        e.jsx('td', {
                                          className: 'text-center py-2',
                                          children: s.player1,
                                        }),
                                        e.jsx('td', {
                                          className: 'text-center py-2',
                                          children: s.player2,
                                        }),
                                        e.jsx('td', {
                                          className: 'text-center py-2',
                                          children: s.diff,
                                        }),
                                      ],
                                    },
                                    c
                                  )
                                ),
                              }),
                            ],
                          }),
                        }),
                      ],
                    });
                  })()
                : e.jsx('div', {
                    className: `text-sm ${x.subtext}`,
                    children: 'Seleziona un giocatore per confrontare le statistiche',
                  }),
            ],
          }),
          e.jsxs('div', {
            className: 'space-y-6',
            children: [
              e.jsxs('div', {
                className: 'space-y-3',
                children: [
                  e.jsxs('h3', {
                    className: 'font-medium text-base flex items-center gap-2',
                    children: [
                      e.jsx('span', { className: 'text-emerald-600', children: '🏆' }),
                      'Top 5 Compagni',
                    ],
                  }),
                  z.topMates.length > 0
                    ? e.jsx('div', {
                        className: `rounded-xl ${x.cardBg} ${x.border} p-3 sm:p-4`,
                        children: e.jsx('div', {
                          className: 'space-y-3',
                          children: z.topMates.map((t, r) =>
                            e.jsxs(
                              'div',
                              {
                                className: 'flex items-center justify-between',
                                children: [
                                  e.jsxs('div', {
                                    className: 'flex items-center gap-2 sm:gap-3 min-w-0 flex-1',
                                    children: [
                                      e.jsx('div', {
                                        className: `w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${r === 0 ? 'bg-yellow-100 text-yellow-600' : r === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : r === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500'}`,
                                        children: r + 1,
                                      }),
                                      e.jsx('span', {
                                        className: 'font-medium text-sm truncate',
                                        children: t.name,
                                      }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    className: 'text-right shrink-0',
                                    children: [
                                      e.jsxs('div', {
                                        className: 'font-bold text-emerald-600 text-sm',
                                        children: [Math.round(t.winPct), '%'],
                                      }),
                                      e.jsxs('div', {
                                        className: 'text-xs text-gray-500',
                                        children: [t.wins, 'V-', t.losses, 'S'],
                                      }),
                                    ],
                                  }),
                                ],
                              },
                              t.id
                            )
                          ),
                        }),
                      })
                    : e.jsx('div', {
                        className: `text-sm ${x.subtext} text-center py-6`,
                        children: 'Nessun compagno disponibile',
                      }),
                ],
              }),
              e.jsxs('div', {
                className: 'space-y-3',
                children: [
                  e.jsxs('h3', {
                    className: 'font-medium text-base flex items-center gap-2',
                    children: [
                      e.jsx('span', { className: 'text-rose-600', children: '😞' }),
                      'Worst 5 Compagni',
                    ],
                  }),
                  z.worstMates.length > 0
                    ? e.jsx('div', {
                        className: `rounded-xl ${x.cardBg} ${x.border} p-3 sm:p-4`,
                        children: e.jsx('div', {
                          className: 'space-y-3',
                          children: z.worstMates.map((t, r) =>
                            e.jsxs(
                              'div',
                              {
                                className: 'flex items-center justify-between',
                                children: [
                                  e.jsxs('div', {
                                    className: 'flex items-center gap-2 sm:gap-3 min-w-0 flex-1',
                                    children: [
                                      e.jsx('div', {
                                        className: `w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${r === 0 ? 'bg-red-100 text-red-600' : r === 1 ? 'bg-orange-100 text-orange-600' : r === 2 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-50 text-gray-500'}`,
                                        children: r + 1,
                                      }),
                                      e.jsx('span', {
                                        className: 'font-medium text-sm truncate',
                                        children: t.name,
                                      }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    className: 'text-right shrink-0',
                                    children: [
                                      e.jsxs('div', {
                                        className: 'font-bold text-rose-600 text-sm',
                                        children: [Math.round(t.winPct), '%'],
                                      }),
                                      e.jsxs('div', {
                                        className: 'text-xs text-gray-500',
                                        children: [t.wins, 'V-', t.losses, 'S'],
                                      }),
                                    ],
                                  }),
                                ],
                              },
                              t.id
                            )
                          ),
                        }),
                      })
                    : e.jsx('div', {
                        className: `text-sm ${x.subtext} text-center py-6`,
                        children: 'Nessun compagno disponibile',
                      }),
                ],
              }),
              e.jsxs('div', {
                className: 'space-y-3',
                children: [
                  e.jsxs('h3', {
                    className: 'font-medium text-base flex items-center gap-2',
                    children: [
                      e.jsx('span', { className: 'text-emerald-600', children: '🎯' }),
                      'Top 5 Avversari Preferiti',
                    ],
                  }),
                  z.topOpps.length > 0
                    ? e.jsx('div', {
                        className: `rounded-xl ${x.cardBg} ${x.border} p-3 sm:p-4`,
                        children: e.jsx('div', {
                          className: 'space-y-3',
                          children: z.topOpps.map((t, r) =>
                            e.jsxs(
                              'div',
                              {
                                className: 'flex items-center justify-between',
                                children: [
                                  e.jsxs('div', {
                                    className: 'flex items-center gap-2 sm:gap-3 min-w-0 flex-1',
                                    children: [
                                      e.jsx('div', {
                                        className: `w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${r === 0 ? 'bg-yellow-100 text-yellow-600' : r === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : r === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500'}`,
                                        children: r + 1,
                                      }),
                                      e.jsx('span', {
                                        className: 'font-medium text-sm truncate',
                                        children: t.name,
                                      }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    className: 'text-right shrink-0',
                                    children: [
                                      e.jsxs('div', {
                                        className: 'font-bold text-emerald-600 text-sm',
                                        children: [Math.round(t.winPct), '%'],
                                      }),
                                      e.jsxs('div', {
                                        className: 'text-xs text-gray-500',
                                        children: [t.wins, 'V-', t.losses, 'S'],
                                      }),
                                    ],
                                  }),
                                ],
                              },
                              t.id
                            )
                          ),
                        }),
                      })
                    : e.jsx('div', {
                        className: `text-sm ${x.subtext} text-center py-6`,
                        children: 'Nessun avversario disponibile',
                      }),
                ],
              }),
              e.jsxs('div', {
                className: 'space-y-3',
                children: [
                  e.jsxs('h3', {
                    className: 'font-medium text-base flex items-center gap-2',
                    children: [
                      e.jsx('span', { className: 'text-rose-600', children: '💀' }),
                      'Top 5 Bestie Nere',
                    ],
                  }),
                  z.worstOpps.length > 0
                    ? e.jsx('div', {
                        className: `rounded-xl ${x.cardBg} ${x.border} p-3 sm:p-4`,
                        children: e.jsx('div', {
                          className: 'space-y-3',
                          children: z.worstOpps.map((t, r) =>
                            e.jsxs(
                              'div',
                              {
                                className: 'flex items-center justify-between',
                                children: [
                                  e.jsxs('div', {
                                    className: 'flex items-center gap-2 sm:gap-3 min-w-0 flex-1',
                                    children: [
                                      e.jsx('div', {
                                        className: `w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${r === 0 ? 'bg-red-100 text-red-600' : r === 1 ? 'bg-orange-100 text-orange-600' : r === 2 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-50 text-gray-500'}`,
                                        children: r + 1,
                                      }),
                                      e.jsx('span', {
                                        className: 'font-medium text-sm truncate',
                                        children: t.name,
                                      }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    className: 'text-right shrink-0',
                                    children: [
                                      e.jsxs('div', {
                                        className: 'font-bold text-rose-600 text-sm',
                                        children: [Math.round(t.winPct), '%'],
                                      }),
                                      e.jsxs('div', {
                                        className: 'text-xs text-gray-500',
                                        children: [t.wins, 'V-', t.losses, 'S'],
                                      }),
                                    ],
                                  }),
                                ],
                              },
                              t.id
                            )
                          ),
                        }),
                      })
                    : e.jsx('div', {
                        className: `text-sm ${x.subtext} text-center py-6`,
                        children: 'Nessun avversario disponibile',
                      }),
                ],
              }),
            ],
          }),
          e.jsxs('div', {
            className:
              'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-6',
                children: [
                  e.jsxs('h3', {
                    className:
                      'text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3',
                    children: [
                      e.jsx('div', {
                        className:
                          'w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center',
                        children: e.jsx('svg', {
                          className: 'w-5 h-5 text-white',
                          fill: 'none',
                          stroke: 'currentColor',
                          viewBox: '0 0 24 24',
                          children: e.jsx('path', {
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeWidth: 2,
                            d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
                          }),
                        }),
                      }),
                      'Storico Partite ',
                      L !== 'all' ? '(periodo filtrato)' : '',
                    ],
                  }),
                  e.jsxs('div', {
                    className:
                      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-medium',
                    children: [
                      (C || []).filter(
                        (t) => (t.teamA || []).includes(l) || (t.teamB || []).includes(l)
                      ).length,
                      ' ',
                      'partite',
                    ],
                  }),
                ],
              }),
              e.jsx('div', {
                className: 'space-y-4',
                children: (C || [])
                  .filter((t) => (t.teamA || []).includes(l) || (t.teamB || []).includes(l))
                  .slice()
                  .sort((t, r) => new Date(r.date) - new Date(t.date))
                  .map((t) => {
                    const r = (t.teamA || []).includes(l),
                      o = r ? (t.deltaA ?? 0) : (t.deltaB ?? 0),
                      n = (r && t.winner === 'A') || (!r && t.winner === 'B'),
                      b = (r ? t.teamA : t.teamB).map((a) => J(D(a))).join(' & '),
                      g = (r ? t.teamB : t.teamA).map((a) => J(D(a))).join(' & '),
                      h = (r ? t.teamA : t.teamB).map((a) => D(a)).join(' & '),
                      u = (r ? t.teamB : t.teamA).map((a) => D(a)).join(' & '),
                      v = n ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold',
                      S = n ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold',
                      k = P === t.id;
                    return e.jsxs(
                      'div',
                      {
                        className: `relative rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-xl hover:shadow-2xl overflow-hidden transition-all duration-300 ${k ? 'ring-2 ring-blue-500/60 shadow-blue-500/20' : ''}`,
                        children: [
                          e.jsx('div', {
                            className:
                              'absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none',
                          }),
                          e.jsxs('div', {
                            className:
                              'relative p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-gradient-to-r hover:from-white/10 hover:to-transparent transition-all duration-300',
                            role: 'button',
                            tabIndex: 0,
                            onClick: () => B(k ? null : t.id),
                            onKeyDown: (a) => {
                              (a.key === 'Enter' || a.key === ' ') &&
                                (a.preventDefault(), B((i) => (i === t.id ? null : t.id)));
                            },
                            'aria-expanded': k,
                            children: [
                              e.jsxs('div', {
                                className: 'min-w-0 flex-1 space-y-2',
                                children: [
                                  e.jsxs('div', {
                                    className:
                                      'flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3',
                                    children: [
                                      e.jsx('span', {
                                        className: `px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border ${n ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/20 border-rose-400/30 text-rose-700 dark:text-rose-300'}`,
                                        children: n ? '✨ Vittoria' : '❌ Sconfitta',
                                      }),
                                      t.date &&
                                        e.jsx('span', {
                                          className:
                                            'text-xs text-gray-600 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-700/50 px-2 py-1 rounded-lg backdrop-blur-sm',
                                          children: new Date(t.date).toLocaleDateString('it-IT', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: '2-digit',
                                          }),
                                        }),
                                    ],
                                  }),
                                  e.jsx('div', {
                                    className: 'text-sm',
                                    children: e.jsxs('div', {
                                      className:
                                        'flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3',
                                      children: [
                                        e.jsx('div', {
                                          className: `${v} font-semibold bg-gradient-to-r from-current to-current bg-clip-text`,
                                          children: b,
                                        }),
                                        e.jsx('div', {
                                          className:
                                            'hidden sm:block text-gray-400 dark:text-gray-500',
                                          children: 'vs',
                                        }),
                                        e.jsx('div', {
                                          className: `${S} font-semibold bg-gradient-to-r from-current to-current bg-clip-text`,
                                          children: g,
                                        }),
                                      ],
                                    }),
                                  }),
                                  e.jsxs('div', {
                                    className:
                                      'text-xs text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-700/30 px-3 py-1.5 rounded-xl backdrop-blur-sm',
                                    children: [
                                      'Sets ',
                                      r ? t.setsA : t.setsB,
                                      '–',
                                      r ? t.setsB : t.setsA,
                                      ' • Games',
                                      ' ',
                                      r ? t.gamesA : t.gamesB,
                                      '–',
                                      r ? t.gamesB : t.gamesA,
                                    ],
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                className: 'shrink-0 text-right flex items-center gap-3',
                                children: [
                                  e.jsxs('div', {
                                    className:
                                      'bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-800/50 backdrop-blur-sm rounded-2xl px-3 py-2 border border-white/20 dark:border-gray-600/30',
                                    children: [
                                      e.jsxs('div', {
                                        className: `text-lg font-bold bg-gradient-to-r ${o >= 0 ? 'from-emerald-500 to-green-600 text-transparent bg-clip-text' : 'from-rose-500 to-red-600 text-transparent bg-clip-text'}`,
                                        children: [o >= 0 ? '+' : '', Math.round(o)],
                                      }),
                                      e.jsx('div', {
                                        className:
                                          'text-[10px] text-gray-500 dark:text-gray-400 font-medium',
                                        children: 'punti',
                                      }),
                                    ],
                                  }),
                                  e.jsx('button', {
                                    onClick: (a) => {
                                      (a.stopPropagation(), F(t), O(!0));
                                    },
                                    className:
                                      'w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm flex items-center justify-center hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20',
                                    title: 'Spiegazione formula RPA',
                                    children: '?',
                                  }),
                                  e.jsx('div', {
                                    className: `text-gray-400 dark:text-gray-300 text-sm transition-transform duration-300 ${k ? 'rotate-180' : ''}`,
                                    children: '▼',
                                  }),
                                ],
                              }),
                            ],
                          }),
                          k &&
                            e.jsx('div', {
                              className:
                                'border-t border-white/20 dark:border-gray-700/30 bg-gradient-to-b from-gray-50/50 to-gray-100/50 dark:from-gray-800/40 dark:to-gray-900/40 backdrop-blur-sm',
                              children: e.jsxs('div', {
                                className: 'p-4 space-y-4',
                                children: [
                                  e.jsxs('div', {
                                    className:
                                      'space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 text-sm',
                                    children: [
                                      e.jsxs('div', {
                                        className: `p-4 rounded-2xl border backdrop-blur-sm ${n ? 'border-emerald-400/30 bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 dark:from-emerald-900/40 dark:to-emerald-800/30' : 'border-gray-300/30 bg-gradient-to-br from-white/60 to-gray-50/40 dark:from-gray-700/40 dark:to-gray-800/30'}`,
                                        children: [
                                          e.jsxs('div', {
                                            className:
                                              'font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2',
                                            children: [
                                              n &&
                                                e.jsx('span', {
                                                  className: 'text-emerald-500',
                                                  children: '👑',
                                                }),
                                              h,
                                            ],
                                          }),
                                          e.jsxs('div', {
                                            className:
                                              'text-xs text-gray-700 dark:text-gray-300 bg-white/40 dark:bg-gray-800/40 px-3 py-1.5 rounded-lg backdrop-blur-sm',
                                            children: [
                                              'Sets: ',
                                              r ? t.setsA : t.setsB,
                                              ' • Games: ',
                                              r ? t.gamesA : t.gamesB,
                                            ],
                                          }),
                                        ],
                                      }),
                                      e.jsxs('div', {
                                        className: `p-4 rounded-2xl border backdrop-blur-sm ${n ? 'border-gray-300/30 bg-gradient-to-br from-white/60 to-gray-50/40 dark:from-gray-700/40 dark:to-gray-800/30' : 'border-emerald-400/30 bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 dark:from-emerald-900/40 dark:to-emerald-800/30'}`,
                                        children: [
                                          e.jsxs('div', {
                                            className:
                                              'font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2',
                                            children: [
                                              !n &&
                                                e.jsx('span', {
                                                  className: 'text-emerald-500',
                                                  children: '👑',
                                                }),
                                              u,
                                            ],
                                          }),
                                          e.jsxs('div', {
                                            className:
                                              'text-xs text-gray-700 dark:text-gray-300 bg-white/40 dark:bg-gray-800/40 px-3 py-1.5 rounded-lg backdrop-blur-sm',
                                            children: [
                                              'Sets: ',
                                              r ? t.setsB : t.setsA,
                                              ' • Games: ',
                                              r ? t.gamesB : t.gamesA,
                                            ],
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  Array.isArray(t.sets) &&
                                    t.sets.length > 0 &&
                                    e.jsxs('div', {
                                      children: [
                                        e.jsxs('div', {
                                          className:
                                            'text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2',
                                          children: [
                                            e.jsx('span', {
                                              className:
                                                'bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text',
                                              children: '📊',
                                            }),
                                            'Set per set:',
                                          ],
                                        }),
                                        e.jsx('div', {
                                          className: 'flex gap-3 overflow-x-auto pb-2',
                                          children: t.sets.map((a, i) =>
                                            e.jsx(
                                              'div',
                                              {
                                                className:
                                                  'px-4 py-3 bg-gradient-to-br from-white/80 to-gray-50/60 dark:from-gray-700/60 dark:to-gray-800/40 rounded-2xl text-sm border border-white/30 dark:border-gray-600/30 text-gray-900 dark:text-white font-semibold shrink-0 backdrop-blur-sm shadow-lg',
                                                children: e.jsxs('div', {
                                                  className: 'text-center',
                                                  children: [
                                                    e.jsxs('span', {
                                                      className:
                                                        'text-xs text-gray-500 dark:text-gray-400 block mb-1',
                                                      children: ['Set ', i + 1],
                                                    }),
                                                    e.jsxs('span', {
                                                      className: 'text-lg',
                                                      children: [a.a, '–', a.b],
                                                    }),
                                                  ],
                                                }),
                                              },
                                              `${t.id}-set-${i}`
                                            )
                                          ),
                                        }),
                                      ],
                                    }),
                                  e.jsxs('div', {
                                    className:
                                      'border-t border-white/20 dark:border-gray-700/30 pt-4',
                                    children: [
                                      e.jsxs('div', {
                                        className:
                                          'text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2',
                                        children: [
                                          e.jsx('span', {
                                            className:
                                              'bg-gradient-to-r from-violet-500 to-purple-600 text-transparent bg-clip-text',
                                            children: '🧮',
                                          }),
                                          'Calcolo punti RPA:',
                                        ],
                                      }),
                                      e.jsxs('div', {
                                        className:
                                          'text-sm space-y-3 text-gray-800 dark:text-gray-100',
                                        children: [
                                          e.jsxs('div', {
                                            className:
                                              'bg-gradient-to-r from-blue-50/80 to-indigo-50/60 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-2xl border border-blue-200/30 dark:border-blue-700/30 backdrop-blur-sm',
                                            children: [
                                              e.jsx('strong', {
                                                className: 'text-blue-700 dark:text-blue-300',
                                                children: 'Rating:',
                                              }),
                                              ' ',
                                              'A=',
                                              Math.round(t.sumA || 0),
                                              ' vs B=',
                                              Math.round(t.sumB || 0),
                                              ' (Gap: ',
                                              Math.round(t.gap || 0),
                                              ')',
                                            ],
                                          }),
                                          e.jsxs('div', {
                                            className:
                                              'bg-gradient-to-r from-purple-50/80 to-violet-50/60 dark:from-purple-900/20 dark:to-violet-900/20 p-3 rounded-2xl border border-purple-200/30 dark:border-purple-700/30 backdrop-blur-sm',
                                            children: [
                                              e.jsx('strong', {
                                                className: 'text-purple-700 dark:text-purple-300',
                                                children: 'Calcolo:',
                                              }),
                                              ' ',
                                              'Base: ',
                                              (t.base || 0).toFixed(1),
                                              ' • DG: ',
                                              t.gd || 0,
                                              ' • Factor:',
                                              ' ',
                                              (t.factor || 1).toFixed(2),
                                            ],
                                          }),
                                          e.jsxs('div', {
                                            className:
                                              'bg-gradient-to-r from-emerald-50/80 to-green-50/60 dark:from-emerald-900/20 dark:to-green-900/20 p-3 rounded-2xl border border-emerald-200/30 dark:border-emerald-700/30 backdrop-blur-sm',
                                            children: [
                                              e.jsx('strong', {
                                                className: 'text-emerald-700 dark:text-emerald-300',
                                                children: 'Risultato:',
                                              }),
                                              ' ',
                                              e.jsxs('span', {
                                                className: `font-bold text-lg ${o >= 0 ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-transparent bg-clip-text' : 'bg-gradient-to-r from-rose-600 to-red-600 text-transparent bg-clip-text'}`,
                                                children: [
                                                  o >= 0 ? '+' : '',
                                                  Math.round(o),
                                                  ' punti',
                                                ],
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            }),
                        ],
                      },
                      t.id
                    );
                  }),
              }),
            ],
          }),
        ],
      }),
      e.jsx(se, {}),
    ],
  });
}
function Le() {
  const [j, y] = oe(),
    { derived: w } = de(),
    W = ce.useMemo(() => ie(), []),
    [V, x] = f.useState(j.get('player') || ''),
    [N, l] = f.useState(''),
    E = ($) => {
      (x($), y($ ? { player: $ } : {}));
    };
  return e.jsx('div', {
    className:
      'min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900',
    children: e.jsxs(e.Fragment, {
      children: [
        e.jsx(we, {
          T: W,
          players: w.players,
          matches: w.matches,
          selectedPlayerId: V,
          onSelectPlayer: E,
          onShowFormula: l,
        }),
        N &&
          e.jsx('div', {
            className:
              'fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4',
            children: e.jsx('div', {
              className:
                'bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-white/20 dark:border-gray-700/20 shadow-2xl',
              children: e.jsxs('div', {
                className: 'p-8',
                children: [
                  e.jsxs('div', {
                    className: 'flex justify-between items-center mb-6',
                    children: [
                      e.jsxs('h3', {
                        className:
                          'text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3',
                        children: [
                          e.jsx('div', {
                            className:
                              'w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center',
                            children: e.jsx('svg', {
                              className: 'w-5 h-5 text-white',
                              fill: 'none',
                              stroke: 'currentColor',
                              viewBox: '0 0 24 24',
                              children: e.jsx('path', {
                                strokeLinecap: 'round',
                                strokeLinejoin: 'round',
                                strokeWidth: 2,
                                d: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
                              }),
                            }),
                          }),
                          'Formula calcolo punti (RPA)',
                        ],
                      }),
                      e.jsx('button', {
                        onClick: () => l(''),
                        className:
                          'w-10 h-10 bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 rounded-full transition-all duration-200 hover:scale-110 flex items-center justify-center',
                        children: e.jsx('svg', {
                          className: 'w-5 h-5',
                          fill: 'none',
                          stroke: 'currentColor',
                          viewBox: '0 0 24 24',
                          children: e.jsx('path', {
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeWidth: 2,
                            d: 'M6 18L18 6M6 6l12 12',
                          }),
                        }),
                      }),
                    ],
                  }),
                  e.jsx('div', {
                    className:
                      'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-600/50',
                    children: e.jsx('pre', {
                      className:
                        'whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed',
                      children: N,
                    }),
                  }),
                ],
              }),
            }),
          }),
      ],
    }),
  });
}
export { Le as default };
