import { j as e, D as X, h as ce, f as oe, t as xe } from './index-mfcrw3bo-CoIG1RjF.js';
import { r as v, f as me, b as ge } from './router-mfcrw3bo-C59D-9ls.js';
import { S as he } from './Section-mfcrw3bo-DETEukMw.js';
import { S as ue } from './ShareButtons-mfcrw3bo-zOX0ZL5O.js';
import {
  R as pe,
  A as fe,
  C as be,
  X as je,
  Y as ve,
  T as ye,
  c as Ne,
} from './charts-mfcrw3bo-CTPk1mtH.js';
import { M as we } from './Modal-mfcrw3bo-DdYOEGdM.js';
import { b as ke, s as Q, I as Ae } from './names-mfcrw3bo-BW9lV2zG.js';
import './vendor-mfcrw3bo-D3F3s8fL.js';
import './firebase-mfcrw3bo-BteSMG94.js';
const K = {
    default: '',
    success: 'text-emerald-500 dark:text-emerald-400',
    danger: 'text-rose-500 dark:text-rose-400',
    warning: 'text-amber-500 dark:text-amber-400',
    info: 'text-blue-500 dark:text-blue-400',
    primary: 'text-emerald-600 dark:text-emerald-400',
  },
  T = { sm: 'text-xl', md: 'text-2xl', lg: 'text-3xl', xl: 'text-4xl' };
function Me({
  label: b,
  value: y,
  subtitle: w,
  trend: G,
  color: I = 'default',
  size: d = 'lg',
  variant: k = 'default',
  icon: r,
  T: N,
}) {
  const $ = K[I] || K.default,
    F = T[d] || T.lg,
    P = (j) => (j > 0 ? '↗' : j < 0 ? '↘' : '→'),
    V = (j) => (j > 0 ? 'text-emerald-500' : j < 0 ? 'text-rose-500' : 'text-gray-500'),
    D = {
      default: N.card,
      compact: `${N.borderMd} ${N.cardBg} ${N.border} ${N.spacingSm}`,
      elevated: N.cardHover,
    };
  return e.jsxs('div', {
    className: `${D[k]} text-center ${N.transitionNormal}`,
    children: [
      r &&
        e.jsx('div', {
          className: 'flex justify-center mb-2',
          children: e.jsx('div', { className: `w-8 h-8 ${$}`, children: r }),
        }),
      e.jsx('div', {
        className: `text-xs uppercase tracking-wide font-medium ${N.subtext} mb-1`,
        children: b,
      }),
      e.jsxs('div', {
        className: `${F} font-bold leading-tight ${$}`,
        children: [
          y,
          G !== void 0 && e.jsx('span', { className: `text-xs ml-1 ${V(G)}`, children: P(G) }),
        ],
      }),
      w && e.jsx('div', { className: `text-xs ${N.subtext} mt-1`, children: w }),
    ],
  });
}
const ee = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  indigo: '#6366f1',
  cyan: '#06b6d4',
  orange: '#f97316',
};
function $e({
  data: b,
  dataKey: y = 'rating',
  chartId: w = 'modern-area',
  color: G = 'success',
  title: I = 'Trend ultime 10 partite',
  showGrid: d = !0,
}) {
  const k = ee[G] || ee.success,
    r = b.slice(-10),
    N = v.useMemo(() => {
      if (r.length === 0) return ['auto', 'auto'];
      let D = 1 / 0,
        j = -1 / 0;
      if (
        (r.forEach((Y) => {
          const W = Y[y];
          typeof W == 'number' && ((D = Math.min(D, W)), (j = Math.max(j, W)));
        }),
        D === 1 / 0)
      )
        return ['auto', 'auto'];
      const q = (j - D) * 0.08;
      return [Math.max(0, Math.floor(D - q)), Math.ceil(j + q)];
    }, [r, y]),
    $ = ({ active: D, payload: j, label: _ }) =>
      D && j && j.length
        ? e.jsxs('div', {
            className:
              'bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4',
            children: [
              e.jsx('p', {
                className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2',
                children: _,
              }),
              e.jsx('p', {
                className: 'text-sm text-gray-600 dark:text-gray-400',
                children: e.jsxs('span', {
                  className: 'font-semibold',
                  style: { color: k },
                  children: [y, ': ', j[0].value],
                }),
              }),
            ],
          })
        : null,
    F = r.length > 1 ? r[r.length - 1][y] - r[0][y] : 0,
    P = F > 0 ? '#10b981' : F < 0 ? '#ef4444' : '#6b7280',
    V = F > 0 ? '↗' : F < 0 ? '↘' : '→';
  return e.jsxs('div', {
    className: 'h-64 sm:h-80',
    children: [
      e.jsx(pe, {
        width: '100%',
        height: '100%',
        children: e.jsxs(fe, {
          data: r,
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
                    e.jsx('stop', { offset: '0%', stopColor: k, stopOpacity: 0.4 }),
                    e.jsx('stop', { offset: '50%', stopColor: k, stopOpacity: 0.2 }),
                    e.jsx('stop', { offset: '100%', stopColor: k, stopOpacity: 0.05 }),
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
            d &&
              e.jsx(be, {
                strokeDasharray: '2 4',
                strokeOpacity: 0.15,
                horizontal: !0,
                vertical: !1,
              }),
            e.jsx(je, {
              dataKey: 'label',
              tick: { fontSize: 11, fill: '#6b7280' },
              axisLine: !1,
              tickLine: !1,
              interval: 'preserveStartEnd',
            }),
            e.jsx(ve, {
              tick: { fontSize: 11, fill: '#6b7280' },
              axisLine: !1,
              tickLine: !1,
              width: 50,
              domain: N,
              scale: 'linear',
            }),
            e.jsx(ye, { content: e.jsx($, {}) }),
            e.jsx(Ne, {
              type: 'monotone',
              dataKey: y,
              stroke: k,
              strokeWidth: 3,
              fill: `url(#modernGradient-${w})`,
              dot: { r: 3, fill: k, stroke: 'white', strokeWidth: 2, filter: `url(#glow-${w})` },
              activeDot: {
                r: 6,
                fill: k,
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
            children: I,
          }),
          e.jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              r.length > 1 &&
                e.jsx('div', {
                  className: 'flex items-center gap-1',
                  children: e.jsxs('span', {
                    className: 'text-sm font-bold',
                    style: { color: P },
                    children: [V, ' ', Math.abs(F).toFixed(0)],
                  }),
                }),
              e.jsxs('span', {
                className: 'text-xs text-gray-500',
                children: [r.length, ' partite'],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function Se({
  players: b,
  matches: y,
  selectedPlayerId: w,
  onSelectPlayer: G,
  onShowFormula: I,
  T: d,
}) {
  const k = v.useRef(null),
    [r, N] = v.useState(w || b[0]?.id || ''),
    [$, F] = v.useState(''),
    [P, V] = v.useState('all'),
    [D, j] = v.useState(null),
    [_, q] = v.useState(!1),
    [Y, W] = v.useState(null);
  v.useEffect(() => {
    w && N(w);
  }, [w]);
  const C = (t) => b.find((s) => s.id === t)?.name || t,
    f = b.find((t) => t.id === r) || null;
  b.find((t) => t.id === $);
  const O = v.useMemo(() => {
      if (P === 'all') return y;
      const t = new Date(),
        s = new Date();
      switch (P) {
        case '1w':
          s.setDate(t.getDate() - 7);
          break;
        case '2w':
          s.setDate(t.getDate() - 14);
          break;
        case '30d':
          s.setDate(t.getDate() - 30);
          break;
        case '3m':
          s.setMonth(t.getMonth() - 3);
          break;
        case '6m':
          s.setMonth(t.getMonth() - 6);
          break;
        default:
          return y;
      }
      return (y || []).filter((c) => new Date(c.date) >= s);
    }, [y, P]),
    te = v.useMemo(() => [...b].sort((t, s) => s.rating - t.rating), [b]),
    se = f ? te.findIndex((t) => t.id === f.id) + 1 : null,
    Z = (f?.wins || 0) + (f?.losses || 0);
  Z && Math.round((f.wins / Z) * 100);
  const l = v.useMemo(() => {
      if (!r) return null;
      const t = (O || []).filter((m) => (m.teamA || []).includes(r) || (m.teamB || []).includes(r));
      if (t.length === 0) return null;
      let s = 0,
        c = 0,
        i = 0,
        u = 0,
        g = 0,
        h = 0,
        p = 0,
        A = 0,
        R = 0,
        M = 0,
        n = 0;
      const o = [...t].sort((m, B) => new Date(m.date) - new Date(B.date));
      o.forEach((m) => {
        const B = (m.teamA || []).includes(r),
          U = (B && m.winner === 'A') || (!B && m.winner === 'B'),
          H = B ? m.deltaA || 0 : m.deltaB || 0;
        ((p += H),
          U
            ? (g++,
              i++,
              (u = 0),
              (s = Math.max(s, i)),
              ((B && m.setsA === 2 && m.setsB === 0) || (!B && m.setsB === 2 && m.setsA === 0)) &&
                n++)
            : (h++, u++, (i = 0), (c = Math.max(c, u))),
          ((m.setsA === 2 && m.setsB === 1) || (m.setsA === 1 && m.setsB === 2)) && M++,
          B
            ? ((A += m.gamesA || 0), (R += m.gamesB || 0))
            : ((A += m.gamesB || 0), (R += m.gamesA || 0)));
      });
      let a = 0,
        x = null;
      for (let m = o.length - 1; m >= 0; m--) {
        const B = o[m],
          U = (B.teamA || []).includes(r),
          H = (U && B.winner === 'A') || (!U && B.winner === 'B');
        if (x === null) ((x = H), (a = 1));
        else if (x === H) a++;
        else break;
      }
      const E = p / t.length,
        S = A + R > 0 ? (A / (A + R)) * 100 : 0,
        le = g > 0 ? (n / g) * 100 : 0,
        de = M > 0 ? ((g - n) / M) * 100 : 0;
      return {
        wins: g,
        losses: h,
        winRate: g + h > 0 ? (g / (g + h)) * 100 : 0,
        currentStreak: x === null ? 0 : x ? a : -a,
        maxWinStreak: s,
        maxLoseStreak: c,
        avgDelta: Math.round(E * 10) / 10,
        gameEfficiency: Math.round(S * 10) / 10,
        dominanceRate: Math.round(le * 10) / 10,
        clutchRate: Math.round(de * 10) / 10,
        totalMatches: t.length,
        closeMatches: M,
        dominantWins: n,
      };
    }, [r, O]),
    L = ({ label: t, value: s, sub: c, trend: i, color: u = 'default' }) =>
      e.jsx(Me, { label: t, value: s, subtitle: c, trend: i, color: u, size: 'lg', T: d }),
    J = v.useMemo(() => [...b].sort(ke), [b]),
    ae = v.useMemo(() => {
      if (!r) return [];
      const t = new Map(
          b.map((i) => [i.id, Number(i.baseRating ?? i.startRating ?? i.rating ?? X)])
        ),
        s = [];
      s.push({ date: null, label: 'Start', rating: Math.round(t.get(r) ?? X) });
      const c = [...(O || [])].sort((i, u) => new Date(i.date) - new Date(u.date));
      for (const i of c) {
        ce(i.sets);
        const u = (p, A) => t.set(p, (t.get(p) ?? X) + A),
          g = i.deltaA ?? 0,
          h = i.deltaB ?? 0;
        (u(i.teamA[0], g),
          u(i.teamA[1], g),
          u(i.teamB[0], h),
          u(i.teamB[1], h),
          (i.teamA.includes(r) || i.teamB.includes(r)) &&
            s.push({
              date: new Date(i.date),
              label: new Date(i.date).toLocaleString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }),
              rating: Math.round(t.get(r) ?? X),
            }));
      }
      return s;
    }, [r, b, O]),
    z = v.useMemo(() => {
      if (!r)
        return { mates: [], opps: [], topMates: [], worstMates: [], topOpps: [], worstOpps: [] };
      const t = (O || []).filter((n) => (n.teamA || []).includes(r) || (n.teamB || []).includes(r)),
        s = new Map(),
        c = new Map(),
        i = (n, o, a) => {
          if (!o) return;
          const x = n.get(o) || { wins: 0, losses: 0 };
          (a ? x.wins++ : x.losses++, n.set(o, x));
        };
      for (const n of t) {
        const o = (n.teamA || []).includes(r),
          a = (o && n.winner === 'A') || (!o && n.winner === 'B'),
          x = o ? (n.teamA || []).find((S) => S !== r) : (n.teamB || []).find((S) => S !== r),
          E = o ? n.teamB || [] : n.teamA || [];
        x && i(s, x, a);
        for (const S of E) i(c, S, a);
      }
      const u = (n) =>
          [...n.entries()]
            .map(([o, a]) => {
              const x = a.wins + a.losses,
                E = x ? Math.round((a.wins / x) * 100) : 0;
              return { id: o, name: C(o), wins: a.wins, losses: a.losses, total: x, winPct: E };
            })
            .sort((o, a) => a.total - o.total || a.winPct - o.winPct || Ae.compare(o.name, a.name)),
        g = u(s),
        h = u(c),
        p = g.sort((n, o) => o.winPct - n.winPct).slice(0, 5),
        A = g.sort((n, o) => n.winPct - o.winPct).slice(0, 5),
        R = h.sort((n, o) => o.winPct - n.winPct).slice(0, 5),
        M = h.sort((n, o) => n.winPct - o.winPct).slice(0, 5);
      return { mates: g, opps: h, topMates: p, worstMates: A, topOpps: R, worstOpps: M };
    }, [r, O, b]),
    re = () =>
      [
        `Statistiche — ${f ? f.name : ''}`,
        `Ranking: ${f ? Math.round(f.rating) : '-'}`,
        `Record: ${l?.wins || 0}–${l?.losses || 0} (${Math.round(l?.winRate || 0)}%)`,
        `Game Eff.: ${l ? l.gameEfficiency : 0}% • Δ medio: ${l ? l.avgDelta : 0}`,
        '#SportingCat #Padel',
      ].join(`
`),
    ne =
      typeof window < 'u'
        ? `${window.location.origin}${window.location.pathname}#stats-${r || ''}`
        : '',
    ie = () => {
      const t = Y;
      if (!t) return null;
      const s = (t.teamA || []).includes(r),
        c = (s && t.winner === 'A') || (!s && t.winner === 'B'),
        i = s ? (t.deltaA ?? 0) : (t.deltaB ?? 0);
      ((s ? t.teamA : t.teamB).map((p) => C(p)), (s ? t.teamB : t.teamA).map((p) => C(p)));
      const u = Math.round(t.sumA || 0),
        g = Math.round(t.sumB || 0),
        h = Math.round(t.gap || 0);
      return (
        t.factor,
        t.base,
        t.gd,
        e.jsx(we, {
          open: _,
          onClose: () => {
            (q(!1), W(null));
          },
          title: 'Sistema RPA - Ranking Points Algorithm',
          size: 'lg',
          T: d,
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
                        className: `p-3 rounded-lg ${(c && s) || (!c && !s) ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300' : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-300'}`,
                        children: [
                          e.jsx('div', {
                            className: 'font-semibold text-gray-900 dark:text-gray-100',
                            children: 'Team A',
                          }),
                          e.jsx('div', {
                            className: 'text-xs text-gray-600 dark:text-gray-300 mb-1',
                            children: t.teamA?.map((p) => C(p)).join(' & '),
                          }),
                          e.jsxs('div', {
                            className: 'text-lg font-bold text-blue-600',
                            children: ['Rating: ', u],
                          }),
                          e.jsxs('div', {
                            className: 'text-xs',
                            children: ['Sets: ', t.setsA, ' • Games: ', t.gamesA],
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        className: `p-3 rounded-lg ${(c && !s) || (!c && s) ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300' : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-300'}`,
                        children: [
                          e.jsx('div', {
                            className: 'font-semibold text-gray-900 dark:text-gray-100',
                            children: 'Team B',
                          }),
                          e.jsx('div', {
                            className: 'text-xs text-gray-600 dark:text-gray-300 mb-1',
                            children: t.teamB?.map((p) => C(p)).join(' & '),
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
                        '📅 ',
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
                    children: ['🎯 Risultato per ', C(r)],
                  }),
                  e.jsxs('div', {
                    className: 'text-center',
                    children: [
                      e.jsx('div', {
                        className: 'text-sm text-purple-700 dark:text-purple-300 mb-1',
                        children: c ? '🏆 Vittoria!' : '💔 Sconfitta',
                      }),
                      e.jsxs('div', {
                        className: `text-3xl font-bold ${i >= 0 ? 'text-green-600' : 'text-red-600'} mb-2`,
                        children: [i >= 0 ? '+' : '', Math.round(i), ' punti'],
                      }),
                      e.jsx('div', {
                        className:
                          'text-xs text-purple-600 dark:text-purple-400 bg-white dark:bg-purple-900/20 p-2 rounded',
                        children: c
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
  return e.jsxs(he, {
    title: 'Statistiche giocatore',
    right: e.jsx(ue, {
      size: 'sm',
      title: `Statistiche — ${f ? f.name : ''}`,
      url: ne,
      captureRef: k,
      captionBuilder: re,
      T: d,
    }),
    T: d,
    children: [
      e.jsxs('div', {
        ref: k,
        children: [
          e.jsxs('div', {
            className: 'space-y-4 mb-6',
            children: [
              e.jsxs('div', {
                className: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
                children: [
                  e.jsxs('div', {
                    children: [
                      e.jsx('div', {
                        className: `text-xs font-medium ${d.subtext} mb-1`,
                        children: 'Giocatore',
                      }),
                      e.jsx('select', {
                        value: r,
                        onChange: (t) => {
                          (N(t.target.value), G?.(t.target.value));
                        },
                        className: `${d.input} w-full text-sm`,
                        children: J.map((t) =>
                          e.jsx('option', { value: t.id, children: t.name }, t.id)
                        ),
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx('div', {
                        className: `text-xs font-medium ${d.subtext} mb-1`,
                        children: 'Periodo',
                      }),
                      e.jsxs('select', {
                        value: P,
                        onChange: (t) => V(t.target.value),
                        className: `${d.input} w-full text-sm`,
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
              e.jsxs('div', {
                className: 'grid grid-cols-3 gap-2 sm:gap-3',
                children: [
                  e.jsx(L, { label: 'Posizione', value: se ?? '-' }),
                  e.jsx(L, {
                    label: 'Ranking',
                    value: f ? Math.round(f.rating) : '-',
                    color: 'primary',
                  }),
                  e.jsx(L, {
                    label: 'Win Rate',
                    value: `${l ? Math.round(l.winRate) : 0}%`,
                    sub: `${l?.wins || 0}–${l?.losses || 0}`,
                  }),
                ],
              }),
            ],
          }),
          l &&
            e.jsxs('div', {
              className: 'grid grid-cols-2 gap-2 sm:gap-3 mb-6',
              children: [
                e.jsx(L, {
                  label: 'Efficienza game',
                  value: `${l.gameEfficiency}%`,
                  sub: '% game vinti',
                  color: 'primary',
                }),
                e.jsx(L, {
                  label: 'Δ medio',
                  value: l.avgDelta > 0 ? `+${l.avgDelta}` : `${l.avgDelta}`,
                  sub: 'punti per partita',
                  color: l.avgDelta >= 0 ? 'success' : 'danger',
                }),
                e.jsx(L, {
                  label: 'Streak migliori',
                  value: `${l.maxWinStreak}`,
                  sub: 'vittorie consecutive',
                  color: 'success',
                }),
                e.jsx(L, {
                  label: 'Streak attive',
                  value: l.currentStreak > 0 ? `+${l.currentStreak}` : `${l.currentStreak}`,
                  sub:
                    l.currentStreak === 0
                      ? 'equilibrio'
                      : l.currentStreak > 0
                        ? 'vittorie'
                        : 'sconfitte',
                  color:
                    l.currentStreak > 0 ? 'success' : l.currentStreak < 0 ? 'danger' : 'default',
                }),
              ],
            }),
          e.jsxs('div', {
            className: `rounded-2xl ${d.cardBg} ${d.border} p-4 mb-6`,
            children: [
              e.jsxs('div', {
                className: 'font-medium mb-3 flex items-center justify-between',
                children: [
                  e.jsx('span', { children: 'Andamento ranking' }),
                  e.jsx('span', {
                    className: 'text-xs text-gray-500',
                    children: P === 'all' ? 'Tutte le partite' : 'Periodo attivo',
                  }),
                ],
              }),
              e.jsx($e, {
                data: ae,
                dataKey: 'rating',
                chartId: `player-${r}`,
                color: 'success',
                title: 'Evoluzione del rating',
              }),
            ],
          }),
          e.jsxs('div', {
            className: `rounded-2xl ${d.cardBg} ${d.border} p-3 sm:p-4 mb-6`,
            children: [
              e.jsxs('div', {
                className: 'space-y-3 mb-4',
                children: [
                  e.jsx('div', { className: 'font-medium', children: 'Confronto diretto' }),
                  e.jsxs('select', {
                    value: $,
                    onChange: (t) => F(t.target.value),
                    className: `${d.input} w-full text-sm`,
                    children: [
                      e.jsx('option', { value: '', children: 'Seleziona un giocatore…' }),
                      J.filter((t) => t.id !== r).map((t) =>
                        e.jsx('option', { value: t.id, children: t.name }, t.id)
                      ),
                    ],
                  }),
                ],
              }),
              $
                ? (() => {
                    const t = b.find((a) => a.id === $),
                      s = (O || []).filter(
                        (a) => (a.teamA || []).includes(t.id) || (a.teamB || []).includes(t.id)
                      );
                    let c = 0,
                      i = 0,
                      u = 0,
                      g = 0,
                      h = 0;
                    const p = [...s].sort((a, x) => new Date(a.date) - new Date(x.date));
                    p.forEach((a) => {
                      const x = (a.teamA || []).includes(t.id),
                        E = (x && a.winner === 'A') || (!x && a.winner === 'B'),
                        S = x ? a.deltaA || 0 : a.deltaB || 0;
                      (E ? c++ : i++,
                        x
                          ? ((g += a.gamesA || 0), (h += a.gamesB || 0))
                          : ((g += a.gamesB || 0), (h += a.gamesA || 0)),
                        (u += S));
                    });
                    let A = null;
                    for (let a = p.length - 1; a >= 0; a--) {
                      const x = p[a],
                        E = (x.teamA || []).includes(t.id),
                        S = (E && x.winner === 'A') || (!E && x.winner === 'B');
                      if (A === null) A = S;
                      else if (A !== S) break;
                    }
                    const R = c + i > 0 ? Math.round((c / (c + i)) * 100) : 0,
                      M = g + h > 0 ? Math.round((g / (g + h)) * 1e3) / 10 : 0,
                      n = c + i > 0 ? Math.round((u / (c + i)) * 10) / 10 : 0,
                      o = [
                        {
                          metric: 'Ranking',
                          player1: f ? Math.round(f.rating) : '-',
                          player2: t ? Math.round(t.rating) : '-',
                          diff: f && t ? Math.round(f.rating - t.rating) : '-',
                        },
                        {
                          metric: 'Win Rate',
                          player1: `${l ? Math.round(l.winRate) : 0}%`,
                          player2: `${R}%`,
                          diff: `${l ? Math.round(l.winRate - R) : 0}%`,
                        },
                        {
                          metric: 'Partite',
                          player1: l ? l.totalMatches : 0,
                          player2: c + i,
                          diff: l ? l.totalMatches - (c + i) : 0,
                        },
                        {
                          metric: 'Eff. game',
                          player1: `${l ? l.gameEfficiency : 0}%`,
                          player2: `${M}%`,
                          diff: `${l ? Math.round((l.gameEfficiency - M) * 10) / 10 : 0}%`,
                        },
                        {
                          metric: 'Δ medio',
                          player1: l ? l.avgDelta : 0,
                          player2: n,
                          diff: l ? Math.round((l.avgDelta - n) * 10) / 10 : 0,
                        },
                      ];
                    return e.jsxs('div', {
                      className: 'space-y-3',
                      children: [
                        e.jsx('div', {
                          className: 'space-y-3 sm:hidden',
                          children: o.map((a, x) =>
                            e.jsxs(
                              'div',
                              {
                                className: `rounded-lg p-3 ${d.cardBg} border ${d.border}`,
                                children: [
                                  e.jsx('div', {
                                    className: 'font-medium text-sm mb-2',
                                    children: a.metric,
                                  }),
                                  e.jsxs('div', {
                                    className: 'grid grid-cols-3 gap-2 text-center text-sm',
                                    children: [
                                      e.jsxs('div', {
                                        children: [
                                          e.jsx('div', {
                                            className: 'font-semibold',
                                            children: a.player1,
                                          }),
                                          e.jsx('div', {
                                            className: 'text-xs text-gray-500 truncate',
                                            children: f?.name,
                                          }),
                                        ],
                                      }),
                                      e.jsxs('div', {
                                        children: [
                                          e.jsx('div', {
                                            className: 'font-semibold',
                                            children: a.player2,
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
                                            children: a.diff,
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
                              x
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
                                  className: `border-b ${d.border} ${d.tableHeadText}`,
                                  children: [
                                    e.jsx('th', {
                                      className: 'text-left py-2',
                                      children: 'Metrica',
                                    }),
                                    e.jsx('th', {
                                      className: 'text-center py-2',
                                      children: f?.name || '-',
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
                                children: o.map((a, x) =>
                                  e.jsxs(
                                    'tr',
                                    {
                                      className: 'border-b border-black/5',
                                      children: [
                                        e.jsx('td', {
                                          className: 'py-2 font-medium',
                                          children: a.metric,
                                        }),
                                        e.jsx('td', {
                                          className: 'text-center py-2',
                                          children: a.player1,
                                        }),
                                        e.jsx('td', {
                                          className: 'text-center py-2',
                                          children: a.player2,
                                        }),
                                        e.jsx('td', {
                                          className: 'text-center py-2',
                                          children: a.diff,
                                        }),
                                      ],
                                    },
                                    x
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
                    className: `text-sm ${d.subtext}`,
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
                        className: `rounded-xl ${d.cardBg} ${d.border} p-3 sm:p-4`,
                        children: e.jsx('div', {
                          className: 'space-y-3',
                          children: z.topMates.map((t, s) =>
                            e.jsxs(
                              'div',
                              {
                                className: 'flex items-center justify-between',
                                children: [
                                  e.jsxs('div', {
                                    className: 'flex items-center gap-2 sm:gap-3 min-w-0 flex-1',
                                    children: [
                                      e.jsx('div', {
                                        className: `w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${s === 0 ? 'bg-yellow-100 text-yellow-600' : s === 1 ? 'bg-gray-100 text-gray-600' : s === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500'}`,
                                        children: s + 1,
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
                        className: `text-sm ${d.subtext} text-center py-6`,
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
                        className: `rounded-xl ${d.cardBg} ${d.border} p-3 sm:p-4`,
                        children: e.jsx('div', {
                          className: 'space-y-3',
                          children: z.worstMates.map((t, s) =>
                            e.jsxs(
                              'div',
                              {
                                className: 'flex items-center justify-between',
                                children: [
                                  e.jsxs('div', {
                                    className: 'flex items-center gap-2 sm:gap-3 min-w-0 flex-1',
                                    children: [
                                      e.jsx('div', {
                                        className: `w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${s === 0 ? 'bg-red-100 text-red-600' : s === 1 ? 'bg-orange-100 text-orange-600' : s === 2 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-50 text-gray-500'}`,
                                        children: s + 1,
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
                        className: `text-sm ${d.subtext} text-center py-6`,
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
                        className: `rounded-xl ${d.cardBg} ${d.border} p-3 sm:p-4`,
                        children: e.jsx('div', {
                          className: 'space-y-3',
                          children: z.topOpps.map((t, s) =>
                            e.jsxs(
                              'div',
                              {
                                className: 'flex items-center justify-between',
                                children: [
                                  e.jsxs('div', {
                                    className: 'flex items-center gap-2 sm:gap-3 min-w-0 flex-1',
                                    children: [
                                      e.jsx('div', {
                                        className: `w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${s === 0 ? 'bg-yellow-100 text-yellow-600' : s === 1 ? 'bg-gray-100 text-gray-600' : s === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500'}`,
                                        children: s + 1,
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
                        className: `text-sm ${d.subtext} text-center py-6`,
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
                        className: `rounded-xl ${d.cardBg} ${d.border} p-3 sm:p-4`,
                        children: e.jsx('div', {
                          className: 'space-y-3',
                          children: z.worstOpps.map((t, s) =>
                            e.jsxs(
                              'div',
                              {
                                className: 'flex items-center justify-between',
                                children: [
                                  e.jsxs('div', {
                                    className: 'flex items-center gap-2 sm:gap-3 min-w-0 flex-1',
                                    children: [
                                      e.jsx('div', {
                                        className: `w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${s === 0 ? 'bg-red-100 text-red-600' : s === 1 ? 'bg-orange-100 text-orange-600' : s === 2 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-50 text-gray-500'}`,
                                        children: s + 1,
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
                        className: `text-sm ${d.subtext} text-center py-6`,
                        children: 'Nessun avversario disponibile',
                      }),
                ],
              }),
            ],
          }),
          e.jsxs('div', {
            className: 'mt-6 space-y-4',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-2',
                children: [
                  e.jsxs('div', {
                    className: 'font-medium text-sm sm:text-base',
                    children: ['Storico partite ', P !== 'all' ? '(periodo filtrato)' : ''],
                  }),
                  e.jsxs('div', {
                    className: 'text-xs text-gray-500',
                    children: [
                      (O || []).filter(
                        (t) => (t.teamA || []).includes(r) || (t.teamB || []).includes(r)
                      ).length,
                      ' ',
                      'partite',
                    ],
                  }),
                ],
              }),
              e.jsx('div', {
                className: 'space-y-2 sm:space-y-3',
                children: (O || [])
                  .filter((t) => (t.teamA || []).includes(r) || (t.teamB || []).includes(r))
                  .slice()
                  .sort((t, s) => new Date(s.date) - new Date(t.date))
                  .map((t) => {
                    const s = (t.teamA || []).includes(r),
                      c = s ? (t.deltaA ?? 0) : (t.deltaB ?? 0),
                      i = (s && t.winner === 'A') || (!s && t.winner === 'B'),
                      u = (s ? t.teamA : t.teamB).map((n) => Q(C(n))).join(' & '),
                      g = (s ? t.teamB : t.teamA).map((n) => Q(C(n))).join(' & '),
                      h = (s ? t.teamA : t.teamB).map((n) => C(n)).join(' & '),
                      p = (s ? t.teamB : t.teamA).map((n) => C(n)).join(' & '),
                      A = i ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold',
                      R = i ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold',
                      M = D === t.id;
                    return e.jsxs(
                      'div',
                      {
                        className: `rounded-xl ${d.cardBg} ${d.border} overflow-hidden transition-all ${M ? 'ring-2 ring-blue-500/40' : ''}`,
                        children: [
                          e.jsxs('div', {
                            className:
                              'p-3 flex items-center justify-between gap-2 cursor-pointer hover:bg-black/5 transition-colors',
                            role: 'button',
                            tabIndex: 0,
                            onClick: () => j(M ? null : t.id),
                            onKeyDown: (n) => {
                              (n.key === 'Enter' || n.key === ' ') &&
                                (n.preventDefault(), j((o) => (o === t.id ? null : t.id)));
                            },
                            'aria-expanded': M,
                            children: [
                              e.jsxs('div', {
                                className: 'min-w-0 flex-1',
                                children: [
                                  e.jsxs('div', {
                                    className:
                                      'flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1',
                                    children: [
                                      e.jsx('span', {
                                        className: `px-2 py-0.5 rounded-full text-xs font-medium w-fit ${i ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`,
                                        children: i ? '✓ Vittoria' : '✗ Sconfitta',
                                      }),
                                      t.date &&
                                        e.jsx('span', {
                                          className: 'text-xs text-gray-500',
                                          children: new Date(t.date).toLocaleDateString('it-IT', {
                                            day: '2-digit',
                                            month: 'short',
                                          }),
                                        }),
                                    ],
                                  }),
                                  e.jsx('div', {
                                    className: 'text-xs sm:text-sm mb-1',
                                    children: e.jsxs('div', {
                                      className:
                                        'flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2',
                                      children: [
                                        e.jsx('span', {
                                          className: `${A} font-medium`,
                                          children: u,
                                        }),
                                        e.jsx('span', {
                                          className: 'text-gray-500 hidden sm:inline',
                                          children: 'vs',
                                        }),
                                        e.jsx('span', {
                                          className: `${R} font-medium`,
                                          children: g,
                                        }),
                                      ],
                                    }),
                                  }),
                                  e.jsxs('div', {
                                    className: 'text-xs text-gray-600',
                                    children: [
                                      'Sets ',
                                      s ? t.setsA : t.setsB,
                                      '-',
                                      s ? t.setsB : t.setsA,
                                      ' • Games',
                                      ' ',
                                      s ? t.gamesA : t.gamesB,
                                      '-',
                                      s ? t.gamesB : t.gamesA,
                                    ],
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                className: 'shrink-0 text-right flex items-center gap-1 sm:gap-2',
                                children: [
                                  e.jsxs('div', {
                                    children: [
                                      e.jsxs('div', {
                                        className: `text-sm sm:text-lg font-bold ${c >= 0 ? 'text-emerald-600' : 'text-rose-600'}`,
                                        children: [c >= 0 ? '+' : '', Math.round(c)],
                                      }),
                                      e.jsx('div', {
                                        className:
                                          'text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400',
                                        children: 'punti',
                                      }),
                                    ],
                                  }),
                                  e.jsx('button', {
                                    onClick: (n) => {
                                      (n.stopPropagation(), W(t), q(!0));
                                    },
                                    className:
                                      'w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center hover:bg-blue-600 transition-colors',
                                    title: 'Spiegazione formula RPA',
                                    children: '?',
                                  }),
                                  e.jsx('div', {
                                    className:
                                      'text-gray-400 dark:text-gray-300 text-xs sm:text-sm',
                                    children: M ? '▲' : '▼',
                                  }),
                                ],
                              }),
                            ],
                          }),
                          M &&
                            e.jsx('div', {
                              className:
                                'border-t border-gray-200 dark:border-gray-500 bg-gray-50 dark:bg-gray-700',
                              children: e.jsxs('div', {
                                className: 'p-3 sm:p-4 space-y-3 sm:space-y-4',
                                children: [
                                  e.jsxs('div', {
                                    className:
                                      'space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3 text-sm',
                                    children: [
                                      e.jsxs('div', {
                                        className: `p-3 rounded-lg border-2 ${i ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-900/40' : 'border-gray-300 bg-white dark:border-gray-500 dark:bg-gray-600'}`,
                                        children: [
                                          e.jsx('div', {
                                            className:
                                              'font-semibold text-gray-900 dark:text-white mb-1 text-sm',
                                            children: h,
                                          }),
                                          e.jsxs('div', {
                                            className: 'text-xs text-gray-700 dark:text-gray-200',
                                            children: [
                                              'Sets: ',
                                              s ? t.setsA : t.setsB,
                                              ' • Games: ',
                                              s ? t.gamesA : t.gamesB,
                                            ],
                                          }),
                                        ],
                                      }),
                                      e.jsxs('div', {
                                        className: `p-3 rounded-lg border-2 ${i ? 'border-gray-300 bg-white dark:border-gray-500 dark:bg-gray-600' : 'border-emerald-300 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-900/40'}`,
                                        children: [
                                          e.jsx('div', {
                                            className:
                                              'font-semibold text-gray-900 dark:text-white mb-1 text-sm',
                                            children: p,
                                          }),
                                          e.jsxs('div', {
                                            className: 'text-xs text-gray-700 dark:text-gray-200',
                                            children: [
                                              'Sets: ',
                                              s ? t.setsB : t.setsA,
                                              ' • Games: ',
                                              s ? t.gamesB : t.gamesA,
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
                                        e.jsx('div', {
                                          className:
                                            'text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2',
                                          children: 'Set per set:',
                                        }),
                                        e.jsx('div', {
                                          className: 'flex gap-2 overflow-x-auto pb-1',
                                          children: t.sets.map((n, o) =>
                                            e.jsxs(
                                              'span',
                                              {
                                                className:
                                                  'px-3 py-2 bg-white dark:bg-gray-600 rounded-lg text-sm border-2 border-gray-200 dark:border-gray-400 text-gray-900 dark:text-white font-medium shrink-0',
                                                children: [n.a, '-', n.b],
                                              },
                                              `${t.id}-set-${o}`
                                            )
                                          ),
                                        }),
                                      ],
                                    }),
                                  e.jsxs('div', {
                                    className: 'border-t border-gray-300 dark:border-gray-500 pt-3',
                                    children: [
                                      e.jsx('div', {
                                        className:
                                          'text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2',
                                        children: 'Calcolo punti RPA:',
                                      }),
                                      e.jsxs('div', {
                                        className:
                                          'text-xs sm:text-sm space-y-2 text-gray-800 dark:text-gray-100',
                                        children: [
                                          e.jsxs('div', {
                                            className:
                                              'bg-white dark:bg-gray-600 p-2 rounded border dark:border-gray-500',
                                            children: [
                                              e.jsx('strong', { children: 'Rating:' }),
                                              ' A=',
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
                                              'bg-white dark:bg-gray-600 p-2 rounded border dark:border-gray-500',
                                            children: [
                                              e.jsx('strong', { children: 'Calcolo:' }),
                                              ' Base: ',
                                              (t.base || 0).toFixed(1),
                                              ' • DG:',
                                              ' ',
                                              t.gd || 0,
                                              ' • Factor: ',
                                              (t.factor || 1).toFixed(2),
                                            ],
                                          }),
                                          e.jsxs('div', {
                                            className:
                                              'bg-white dark:bg-gray-600 p-2 rounded border dark:border-gray-500',
                                            children: [
                                              e.jsx('strong', { children: 'Risultato:' }),
                                              ' ',
                                              e.jsxs('span', {
                                                className: `font-bold text-base sm:text-lg ${c >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`,
                                                children: [
                                                  c >= 0 ? '+' : '',
                                                  Math.round(c),
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
      e.jsx(ie, {}),
    ],
  });
}
function ze() {
  const [b, y] = me(),
    { derived: w } = oe(),
    G = ge.useMemo(() => xe(), []),
    [I, d] = v.useState(b.get('player') || ''),
    [k, r] = v.useState(''),
    N = ($) => {
      (d($), y($ ? { player: $ } : {}));
    };
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(Se, {
        T: G,
        players: w.players,
        matches: w.matches,
        selectedPlayerId: I,
        onSelectPlayer: N,
        onShowFormula: r,
      }),
      k &&
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
                      onClick: () => r(''),
                      className: 'text-gray-400 hover:text-gray-600',
                      children: '×',
                    }),
                  ],
                }),
                e.jsx('pre', { className: 'whitespace-pre-wrap text-sm', children: k }),
              ],
            }),
          }),
        }),
    ],
  });
}
export { ze as default };
