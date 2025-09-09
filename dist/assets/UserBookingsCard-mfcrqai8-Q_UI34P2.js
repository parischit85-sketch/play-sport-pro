const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/cloud-bookings-mfcrqai8-d3aOF8gM.js',
      'assets/firebase-mfcrqai8-BteSMG94.js',
      'assets/index-mfcrqai8-SK5xfcQr.js',
      'assets/vendor-mfcrqai8-D3F3s8fL.js',
      'assets/router-mfcrqai8-B0glbTOM.js',
      'assets/index-mfcrqfp1-BBYtpoEP.css',
      'assets/bookings-mfcrqai8-Kr_Xz312.js',
    ])
) => i.map((i) => d[i]);
import { u as V, _ as L, j as e } from './index-mfcrqai8-SK5xfcQr.js';
import { r as d, c as Z, b as H } from './router-mfcrqai8-B0glbTOM.js';
import { b as T, B as E, u as J } from './bookings-mfcrqai8-Kr_Xz312.js';
import { M as Q } from './Modal-mfcrqai8-D4fdDW46.js';
import './vendor-mfcrqai8-D3F3s8fL.js';
import './firebase-mfcrqai8-BteSMG94.js';
import './cloud-bookings-mfcrqai8-d3aOF8gM.js';
const M = new Map(),
  z = new Map();
function W(s = {}) {
  const { user: r } = V(),
    { refreshInterval: a = 3e4, enableBackground: u = !0 } = s,
    [f, c] = d.useState([]),
    [h, o] = d.useState(!0),
    [p, y] = d.useState(null),
    [j, i] = d.useState(0),
    m = d.useRef(!0),
    b = d.useRef(null),
    x = r?.uid ? `bookings-${r.uid}` : null,
    D = d.useCallback(
      async (N = !1) => {
        if (!r?.uid) return (c([]), o(!1), []);
        if (!N && x) {
          const l = M.get(x);
          if (l && Date.now() - l.timestamp < 6e4)
            return (m.current && (c(l.data), o(!1), i(l.timestamp)), l.data);
        }
        if (z.has(x))
          try {
            const l = await z.get(x);
            return (m.current && (c(l), o(!1)), l);
          } catch (l) {
            throw (m.current && (y(l), o(!1)), l);
          }
        const w = X(r);
        z.set(x, w);
        try {
          m.current && o(!0);
          const l = await w,
            t = Date.now();
          return (x && M.set(x, { data: l, timestamp: t }), m.current && (c(l), y(null), i(t)), l);
        } catch (l) {
          throw (console.error('Error loading user bookings:', l), m.current && y(l), l);
        } finally {
          (z.delete(x), m.current && o(!1));
        }
      },
      [r?.uid, x]
    );
  (d.useEffect(
    () => (
      (m.current = !0),
      D(),
      () => {
        ((m.current = !1), b.current && clearInterval(b.current));
      }
    ),
    [D]
  ),
    d.useEffect(() => {
      if (!(!u || !r?.uid))
        return (
          (b.current = setInterval(() => {
            m.current && document.visibilityState === 'visible' && D(!0);
          }, a)),
          () => {
            b.current && clearInterval(b.current);
          }
        );
    }, [D, a, u, r?.uid]));
  const g = d.useMemo(() => {
      const N = new Date();
      return f.filter((w) => new Date(`${w.date}T${w.time}:00`) > N);
    }, [f]),
    P = d.useMemo(() => {
      const N = new Date().toISOString().split('T')[0];
      return g.filter((w) => w.date === N);
    }, [g]),
    B = d.useCallback(() => (x && M.delete(x), D(!0)), [D, x]);
  return {
    bookings: g,
    allBookings: f,
    todayBookings: P,
    loading: h,
    error: p,
    lastUpdate: j,
    refresh: B,
    hasBookings: g.length > 0,
  };
}
async function X(s) {
  if (!s?.uid) return [];
  try {
    const [r, a] = await Promise.allSettled([Y(s.uid), ee(s)]);
    let u = [];
    if (
      (r.status === 'fulfilled' && r.value.length > 0 && (u = r.value),
      a.status === 'fulfilled' && a.value.length > 0)
    )
      if (u.length === 0) u = a.value;
      else {
        const c = new Set(u.map((o) => o.id)),
          h = a.value.filter((o) => !c.has(o.id));
        u = [...u, ...h];
      }
    const f = new Date();
    return u
      .filter((c) => new Date(`${c.date}T${c.time}:00`) > f)
      .sort((c, h) => {
        const o = new Date(`${c.date}T${c.time}:00`),
          p = new Date(`${h.date}T${h.time}:00`);
        return o - p;
      });
  } catch (r) {
    return (console.error('Error in loadUserBookingsOptimized:', r), []);
  }
}
async function Y(s) {
  try {
    const { loadActiveUserBookings: r } = await L(
      async () => {
        const { loadActiveUserBookings: a } = await import('./cloud-bookings-mfcrqai8-d3aOF8gM.js');
        return { loadActiveUserBookings: a };
      },
      __vite__mapDeps([0, 1, 2, 3, 4, 5])
    );
    return await Promise.race([
      r(s),
      new Promise((a, u) => setTimeout(() => u(new Error('Cloud timeout')), 5e3)),
    ]);
  } catch (r) {
    return (console.warn('Cloud bookings failed:', r), []);
  }
}
async function ee(s) {
  try {
    const { getUserBookings: r } = await L(
      async () => {
        const { getUserBookings: a } = await import('./bookings-mfcrqai8-Kr_Xz312.js').then(
          (u) => u.d
        );
        return { getUserBookings: a };
      },
      __vite__mapDeps([6, 2, 3, 4, 1, 5, 0])
    );
    return await r(s, !1);
  } catch (r) {
    return (console.warn('Local bookings failed:', r), []);
  }
}
function se({
  booking: s,
  isOpen: r,
  onClose: a,
  state: u,
  T: f,
  onShare: c,
  onCancel: h,
  onEdit: o,
  onReview: p,
}) {
  const [y, j] = d.useState(!1),
    [i, m] = d.useState(s?.players || []),
    [b, x] = d.useState('');
  if (!s) return null;
  const g = (u?.courts || T.courts)?.find((n) => n.id === s.courtId),
    P = new Date(s.date),
    B = new Date(`${s.date}T${s.time}:00`),
    N = new Date(),
    w = P.toDateString() === new Date().toDateString(),
    l = P.toDateString() === new Date(Date.now() + 864e5).toDateString(),
    t = B < N,
    C = B > N && B <= new Date(N.getTime() + 1440 * 60 * 1e3),
    G = (B - N) / (1e3 * 60 * 60) > 30,
    U = !t,
    A = (n) =>
      n
        ? typeof n == 'string'
          ? n
          : typeof n == 'object'
            ? n.name || n.email || ''
            : String(n)
        : '',
    R = () => {
      (o && i !== s.players && o({ ...s, players: i }), j(!1));
    },
    F = () => {
      (m(s.players), j(!1));
    },
    q = () => {
      y ? R() : j(!0);
    };
  let k;
  t
    ? (k = 'Passata')
    : w
      ? (k = 'Oggi')
      : l
        ? (k = 'Domani')
        : (k = P.toLocaleDateString('it-IT', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }));
  const I = B - N,
    _ = Math.floor(I / (1e3 * 60 * 60)),
    K = Math.floor((I % (1e3 * 60 * 60)) / (1e3 * 60));
  return e.jsx(Q, {
    open: r,
    onClose: a,
    title: 'Dettaglio Prenotazione',
    T: f,
    size: 'md',
    children: e.jsxs('div', {
      className: 'space-y-4',
      children: [
        e.jsxs('div', {
          className: 'bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white',
          children: [
            e.jsxs('div', {
              className: 'flex items-center justify-between mb-2',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center gap-3',
                  children: [
                    e.jsx('div', {
                      className:
                        'w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center',
                      children: e.jsx('span', { className: 'text-lg', children: '🏟️' }),
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('h2', {
                          className: 'font-bold text-lg',
                          children: g?.name || `Campo ${s.courtId}`,
                        }),
                        e.jsxs('div', {
                          className: 'text-white/80 text-sm',
                          children: [k, ' • ', s.time],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'text-right',
                  children: [
                    e.jsxs('div', {
                      className: 'text-2xl font-bold',
                      children: ['€', s.price || 'N/A'],
                    }),
                    e.jsxs('div', {
                      className: 'text-white/80 text-xs',
                      children: [s.duration || 60, 'min'],
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'flex flex-wrap gap-1',
              children: [
                t && e.jsx(E, { variant: 'secondary', size: 'xs', T: f, children: 'Completata' }),
                w && !t && e.jsx(E, { variant: 'warning', size: 'xs', T: f, children: 'Oggi' }),
                C && e.jsx(E, { variant: 'success', size: 'xs', T: f, children: 'Prossima' }),
                s.confirmed &&
                  e.jsx(E, { variant: 'primary', size: 'xs', T: f, children: 'Confermata' }),
              ],
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-2 gap-3',
          children: [
            e.jsxs('div', {
              className: 'bg-gray-50 rounded-lg p-3',
              children: [
                e.jsx('div', {
                  className: 'text-xs text-gray-500 mb-1',
                  children: '📅 DATA E ORARIO',
                }),
                e.jsx('div', { className: 'font-medium text-sm', children: k }),
                e.jsxs('div', {
                  className: 'text-sm text-gray-600',
                  children: [s.time, ' (', s.duration || 60, 'min)'],
                }),
                !t &&
                  I > 0 &&
                  e.jsxs('div', {
                    className: 'text-xs text-blue-600 mt-1',
                    children: [_ > 0 && `${_}h `, K, 'min rimanenti'],
                  }),
              ],
            }),
            e.jsxs('div', {
              className: 'bg-gray-50 rounded-lg p-3',
              children: [
                e.jsx('div', { className: 'text-xs text-gray-500 mb-1', children: '🏟️ CAMPO' }),
                e.jsx('div', {
                  className: 'font-medium text-sm',
                  children: g?.name || `Campo ${s.courtId}`,
                }),
                g?.features &&
                  e.jsx('div', {
                    className: 'text-xs text-gray-600',
                    children: g.features.join(' • '),
                  }),
              ],
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'bg-gray-50 rounded-lg p-4',
          children: [
            e.jsxs('div', {
              className: 'text-xs text-gray-500 mb-3',
              children: ['👥 GIOCATORI (', s.players?.length || 1, '/4)'],
            }),
            e.jsxs('div', {
              className: 'space-y-2',
              children: [
                e.jsx('div', {
                  className: 'p-3 bg-blue-50 rounded-xl border-l-4 border-blue-500',
                  children: e.jsxs('div', {
                    className: 'flex items-center gap-3',
                    children: [
                      e.jsx('div', {
                        className:
                          'w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center',
                        children: e.jsx('span', {
                          className: 'text-white text-sm',
                          children: '👑',
                        }),
                      }),
                      e.jsxs('div', {
                        className: 'flex-1',
                        children: [
                          e.jsx('div', {
                            className: 'text-sm font-semibold text-gray-900',
                            children: (() => {
                              const n = y ? i : s.players;
                              return n && n[0]
                                ? A(n[0])
                                : s.userName || s.userEmail || 'Organizzatore';
                            })(),
                          }),
                          e.jsxs('div', {
                            className: 'text-xs text-blue-600 font-medium',
                            children: [
                              'Organizzatore • Giocatore 1',
                              s.userEmail &&
                                e.jsx('span', {
                                  className: 'block text-blue-600 mt-0.5',
                                  children: s.userEmail,
                                }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
                y
                  ? e.jsxs('div', {
                      className: 'space-y-2',
                      children: [
                        i &&
                          i.length > 1 &&
                          i.slice(1).map((n, v) =>
                            e.jsxs(
                              'div',
                              {
                                className: 'p-3 bg-gray-50 rounded-xl flex items-center gap-3',
                                children: [
                                  e.jsx('div', {
                                    className:
                                      'w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center',
                                    children: e.jsx('span', {
                                      className: 'text-white text-sm',
                                      children: '👤',
                                    }),
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex-1',
                                    children: [
                                      e.jsx('input', {
                                        type: 'text',
                                        value: A(n),
                                        onChange: ($) => {
                                          const S = [...i];
                                          (typeof n == 'object'
                                            ? (S[v + 1] = { ...n, name: $.target.value })
                                            : (S[v + 1] = $.target.value),
                                            m(S));
                                        },
                                        className:
                                          'w-full text-sm font-medium text-gray-900 bg-transparent border-b border-gray-300 focus:border-green-500 outline-none pb-1',
                                        placeholder: 'Nome giocatore',
                                      }),
                                      e.jsxs('div', {
                                        className: 'text-xs text-gray-500',
                                        children: ['Giocatore ', v + 2],
                                      }),
                                    ],
                                  }),
                                  e.jsx('button', {
                                    onClick: () => {
                                      const $ = [...i];
                                      ($.splice(v + 1, 1), m($));
                                    },
                                    className:
                                      'w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors',
                                    children: e.jsx('span', {
                                      className: 'text-sm',
                                      children: '✕',
                                    }),
                                  }),
                                ],
                              },
                              v
                            )
                          ),
                        i.length < 4 &&
                          e.jsxs('div', {
                            className: 'flex gap-3',
                            children: [
                              e.jsx('input', {
                                type: 'text',
                                value: b,
                                onChange: (n) => x(n.target.value),
                                onKeyDown: (n) => {
                                  if (n.key === 'Enter') {
                                    const v = i
                                      ? [...i]
                                      : [s.userName || s.userEmail || 'Organizzatore'];
                                    b.trim() &&
                                      (v.push({ name: b.trim(), id: Date.now() }), m(v), x(''));
                                  }
                                },
                                placeholder: 'Nome nuovo giocatore',
                                className:
                                  'flex-1 p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none',
                              }),
                              e.jsx('button', {
                                onClick: () => {
                                  const n = i
                                    ? [...i]
                                    : [s.userName || s.userEmail || 'Organizzatore'];
                                  b.trim() &&
                                    (n.push({ name: b.trim(), id: Date.now() }), m(n), x(''));
                                },
                                disabled: !b.trim(),
                                className:
                                  'px-6 py-3 bg-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors',
                                children: 'Aggiungi',
                              }),
                            ],
                          }),
                        e.jsxs('div', {
                          className: 'flex gap-3 mt-4 pt-3 border-t border-gray-200',
                          children: [
                            e.jsx('button', {
                              onClick: R,
                              className:
                                'flex-1 bg-green-600 text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors',
                              children: '💾 Salva Modifiche',
                            }),
                            e.jsx('button', {
                              onClick: F,
                              className:
                                'flex-1 bg-gray-500 text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-gray-600 transition-colors',
                              children: '❌ Annulla',
                            }),
                          ],
                        }),
                      ],
                    })
                  : e.jsxs(e.Fragment, {
                      children: [
                        s.players &&
                          s.players.length > 1 &&
                          s.players
                            .slice(1)
                            .map((n, v) =>
                              e.jsxs(
                                'div',
                                {
                                  className:
                                    'flex items-center gap-2 bg-white rounded px-2 py-1 border',
                                  children: [
                                    e.jsx('div', {
                                      className:
                                        'w-6 h-6 rounded-full bg-green-500 flex items-center justify-center',
                                      children: e.jsx('span', {
                                        className: 'text-white text-xs font-bold',
                                        children: v + 2,
                                      }),
                                    }),
                                    e.jsxs('div', {
                                      className: 'flex-1',
                                      children: [
                                        e.jsx('div', {
                                          className: 'text-sm font-medium text-gray-900',
                                          children: A(n),
                                        }),
                                        e.jsxs('div', {
                                          className: 'text-xs text-gray-500',
                                          children: ['Giocatore ', v + 2],
                                        }),
                                      ],
                                    }),
                                  ],
                                },
                                v
                              )
                            ),
                        (() => {
                          const n = s.players?.length || 1,
                            v = 4 - n;
                          return (
                            v > 0 &&
                            Array.from({ length: v }).map(($, S) =>
                              e.jsxs(
                                'div',
                                {
                                  className:
                                    'flex items-center gap-2 bg-gray-100 rounded px-2 py-1 border-dashed border',
                                  children: [
                                    e.jsx('div', {
                                      className:
                                        'w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center',
                                      children: e.jsx('span', {
                                        className: 'text-gray-500 text-xs',
                                        children: '?',
                                      }),
                                    }),
                                    e.jsxs('div', {
                                      className: 'flex-1',
                                      children: [
                                        e.jsx('div', {
                                          className: 'text-sm text-gray-500 italic',
                                          children: 'Slot libero',
                                        }),
                                        e.jsxs('div', {
                                          className: 'text-xs text-gray-400',
                                          children: ['Giocatore ', n + S + 1],
                                        }),
                                      ],
                                    }),
                                  ],
                                },
                                `empty-${S}`
                              )
                            )
                          );
                        })(),
                      ],
                    }),
              ],
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'bg-green-50 rounded-lg p-3',
          children: [
            e.jsx('div', { className: 'text-xs text-green-700 mb-1', children: '💰 PREZZO' }),
            e.jsxs('div', {
              className: 'flex justify-between items-center',
              children: [
                e.jsxs('div', {
                  className: 'font-bold text-green-900',
                  children: ['€', s.price || 'N/A'],
                }),
                s.confirmed
                  ? e.jsx('span', { className: 'text-green-600', children: '✅ Pagato' })
                  : e.jsx('span', { className: 'text-gray-600', children: '💳 Da confermare' }),
              ],
            }),
          ],
        }),
        s.notes &&
          e.jsxs('div', {
            className: 'bg-blue-50 rounded-lg p-3',
            children: [
              e.jsx('div', {
                className: 'text-xs text-blue-700 font-medium mb-1',
                children: '📝 NOTE',
              }),
              e.jsx('p', { className: 'text-sm text-gray-700', children: s.notes }),
            ],
          }),
        e.jsxs('div', {
          className: 'bg-yellow-50 rounded-lg p-3',
          children: [
            e.jsx('div', {
              className: 'text-xs text-yellow-800 font-medium mb-1',
              children: 'ℹ️ PROMEMORIA',
            }),
            e.jsxs('div', {
              className: 'text-xs text-gray-700 space-y-0.5',
              children: [
                e.jsx('div', { children: '• Arriva 10 min prima' }),
                e.jsx('div', { children: '• Porta racchette e palline' }),
                g?.phone &&
                  e.jsxs('div', {
                    children: [
                      '• Tel: ',
                      e.jsx('span', { className: 'font-medium', children: g.phone }),
                    ],
                  }),
              ],
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'space-y-2 pb-4 md:pb-0',
          children: [
            !t &&
              U &&
              e.jsx('button', {
                onClick: q,
                className:
                  'w-full bg-green-600 hover:bg-green-700 text-white py-3 px-3 rounded-lg text-sm font-medium transition-colors',
                children: y ? '💾 Salva Modifiche' : '✏️ Modifica Giocatori',
              }),
            !t &&
              !U &&
              e.jsx('div', {
                className:
                  'w-full bg-gray-100 text-gray-600 py-3 px-3 rounded-lg text-sm text-center',
                children: '⏰ Modifiche disponibili fino a 30 ore prima',
              }),
            e.jsx('div', {
              className: 'flex gap-2',
              children: t
                ? e.jsx('button', {
                    onClick: () => p && p(s),
                    className:
                      'w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-3 rounded-lg text-sm font-medium transition-colors',
                    children: '⭐ Lascia Recensione',
                  })
                : e.jsxs(e.Fragment, {
                    children: [
                      e.jsx('button', {
                        onClick: () => c && c(s),
                        className:
                          'flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-3 rounded-lg text-sm font-medium transition-colors',
                        children: '📧 Condividi',
                      }),
                      G
                        ? e.jsx('button', {
                            onClick: () => h && h(s),
                            className:
                              'flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-3 rounded-lg text-sm font-medium transition-colors',
                            children: '🚫 Cancella',
                          })
                        : e.jsx('div', {
                            className:
                              'flex-1 bg-gray-300 text-gray-600 py-3 px-3 rounded-lg text-sm text-center',
                            children: '⏰ Non cancellabile (meno di 30h)',
                          }),
                    ],
                  }),
            }),
          ],
        }),
      ],
    }),
  });
}
const te = H.memo(({ booking: s, onBookingClick: r, courts: a, user: u, T: f }) => {
  const c = a?.find((i) => i.id === s.courtId),
    h = new Date(s.date),
    o = h.toDateString() === new Date().toDateString(),
    p = h.toDateString() === new Date(Date.now() + 864e5).toDateString(),
    y = h.toLocaleDateString('it-IT', { weekday: 'short' });
  let j;
  return (
    o
      ? (j = 'Oggi')
      : p
        ? (j = 'Domani')
        : (j = `${y.charAt(0).toUpperCase() + y.slice(1)} ${h.getDate()}/${(h.getMonth() + 1).toString().padStart(2, '0')}`),
    e.jsxs('div', {
      onClick: () => r(s),
      className: `bg-white dark:bg-gray-800 hover:shadow-md p-3 rounded-lg border cursor-pointer transition-all group
        min-w-[220px] h-28 sm:min-w-0 sm:h-auto flex-shrink-0 sm:flex-shrink
        hover:border-blue-300 dark:hover:border-blue-600 transform hover:scale-102 flex flex-col justify-between`,
      children: [
        e.jsxs('div', {
          className: 'flex items-start justify-between',
          children: [
            e.jsxs('div', {
              className: 'flex-1',
              children: [
                e.jsx('div', {
                  className: 'text-xs font-medium text-gray-500 uppercase tracking-tight mb-1',
                  children: j,
                }),
                e.jsx('div', {
                  className: 'text-lg font-bold text-gray-900 dark:text-white leading-none mb-1',
                  children: s.time.substring(0, 5),
                }),
                e.jsxs('div', {
                  className: 'text-xs text-gray-600 dark:text-gray-400',
                  children: [c?.name || 'Padel 1', ' • ', s.duration || 60, 'min'],
                }),
              ],
            }),
            o && e.jsx('div', { className: 'w-2 h-2 bg-orange-400 rounded-full' }),
          ],
        }),
        e.jsxs('div', {
          className: 'flex items-center justify-between',
          children: [
            e.jsxs('div', {
              className: 'flex-1 min-w-0',
              children: [
                e.jsxs('div', {
                  className: 'text-[10px] text-gray-600 dark:text-gray-400 truncate mb-1',
                  children: [
                    s.bookedBy && e.jsx('span', { className: 'font-medium', children: s.bookedBy }),
                    s.players &&
                      s.players.length > 0 &&
                      e.jsxs('span', {
                        children: [
                          s.bookedBy ? ' + ' : '',
                          s.players
                            .slice(0, 2)
                            .map((i, m) =>
                              e.jsxs(
                                'span',
                                {
                                  children: [
                                    i.name || i,
                                    m < s.players.slice(0, 2).length - 1 ? ', ' : '',
                                  ],
                                },
                                m
                              )
                            ),
                          s.players.length > 2 &&
                            e.jsxs('span', { children: [' +', s.players.length - 2, ' altri'] }),
                        ],
                      }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'flex -space-x-0.5',
                  children: [
                    e.jsx('div', {
                      className:
                        'w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white border border-white',
                      children: e.jsx('span', {
                        className: 'text-[9px]',
                        children: u?.displayName?.charAt(0).toUpperCase() || 'U',
                      }),
                    }),
                    (s.players?.length || 0) > 0 &&
                      e.jsx('div', {
                        className:
                          'w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold text-white border border-white',
                        children: e.jsxs('span', {
                          className: 'text-[8px]',
                          children: ['+', s.players.length],
                        }),
                      }),
                    (s.players?.length || 0) + 1 < 4 &&
                      e.jsx('div', {
                        className:
                          'w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 border border-white flex items-center justify-center',
                        children: e.jsx('div', {
                          className: 'w-1.5 h-1.5 bg-gray-400 rounded-full',
                        }),
                      }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'text-right',
              children: [
                s.price &&
                  e.jsxs('div', {
                    className: 'text-xs font-bold text-green-600 dark:text-green-400',
                    children: ['€', s.price],
                  }),
                e.jsx('div', {
                  className: 'text-[9px] text-gray-500',
                  children: (s.players?.length || 0) + 1 < 4 ? 'Aperta' : 'Completa',
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );
});
function oe({ user: s, state: r, T: a, compact: u = !1 }) {
  const [f, c] = d.useState(null),
    [h, o] = d.useState(!1),
    p = Z(),
    {
      bookings: y,
      loading: j,
      refresh: i,
      hasBookings: m,
      lastUpdate: b,
    } = W({ refreshInterval: 3e4, enableBackground: !0 }),
    x = d.useMemo(() => r?.courts || T.courts, [r?.courts]),
    D = d.useCallback((t) => {
      (c(t), o(!0));
    }, []),
    g = d.useCallback(() => {
      (o(!1), c(null));
    }, []),
    P = d.useCallback(
      async (t) => {
        const C = `Prenotazione Padel 🎾
${t.date} alle ${t.time}
Campo: ${x.find((O) => O.id === t.courtId)?.name || 'Padel 1'}
Giocatori: ${t.players?.join(', ') || 'Da definire'}`;
        if (navigator.share)
          try {
            await navigator.share({ title: 'Prenotazione Padel', text: C });
          } catch {
            console.log('Condivisione annullata');
          }
        else
          (navigator.clipboard.writeText(C), alert('Dettagli prenotazione copiati negli appunti!'));
      },
      [x]
    ),
    B = d.useCallback(
      (t) => {
        confirm('Sei sicuro di voler cancellare questa prenotazione?') &&
          (console.log('Cancellazione prenotazione:', t), g(), i());
      },
      [g, i]
    ),
    N = d.useCallback(
      async (t) => {
        if (t.players && t.id)
          try {
            const C = { ...f, players: t.players };
            (await J(t.id, { players: t.players }),
              c(C),
              i(),
              console.log('Prenotazione aggiornata con successo'));
          } catch (C) {
            (console.error("Errore durante l'aggiornamento:", C),
              alert('Errore durante il salvataggio delle modifiche'));
          }
        else (p(`/admin-bookings?edit=${t.id}`), g());
      },
      [p, g, f, i]
    ),
    w = d.useCallback((t) => {
      (console.log('Lascia recensione per:', t), alert('Funzionalità di recensioni in arrivo!'));
    }, []),
    l = y || [];
  return s
    ? j && (!l.length || b === 0)
      ? e.jsxs('div', {
          className: `${a.cardBg} ${a.border} p-6 rounded-xl`,
          children: [
            e.jsxs('div', {
              className: 'flex items-center justify-between mb-4',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center gap-3',
                  children: [
                    e.jsx('div', { className: 'text-2xl', children: '📅' }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('div', {
                          className: 'h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse',
                        }),
                        e.jsx('div', { className: 'h-4 bg-gray-200 rounded w-24 animate-pulse' }),
                      ],
                    }),
                  ],
                }),
                e.jsx('div', { className: 'h-6 w-8 bg-gray-200 rounded animate-pulse' }),
              ],
            }),
            e.jsx('div', {
              className: 'space-y-3',
              children: [1, 2, 3].map((t) =>
                e.jsx(
                  'div',
                  {
                    className: 'bg-gray-50 p-4 rounded-lg border animate-pulse',
                    children: e.jsxs('div', {
                      className: 'flex items-center justify-between',
                      children: [
                        e.jsxs('div', {
                          className: 'flex-1',
                          children: [
                            e.jsx('div', { className: 'h-4 bg-gray-200 rounded w-20 mb-2' }),
                            e.jsx('div', { className: 'h-3 bg-gray-200 rounded w-32' }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'text-right',
                          children: [
                            e.jsx('div', { className: 'h-3 bg-gray-200 rounded w-8 mb-1' }),
                            e.jsx('div', { className: 'h-3 bg-gray-200 rounded w-12' }),
                          ],
                        }),
                      ],
                    }),
                  },
                  t
                )
              ),
            }),
            e.jsx('div', {
              className: 'mt-4 pt-3 border-t border-gray-200',
              children: e.jsx('div', { className: 'h-10 bg-gray-200 rounded-lg animate-pulse' }),
            }),
          ],
        })
      : !m && !j
        ? e.jsx('div', {
            className: `${a.cardBg} ${a.border} p-6 rounded-xl`,
            children: e.jsxs('div', {
              className: 'text-center',
              children: [
                e.jsx('div', { className: 'text-4xl mb-3', children: '📅' }),
                e.jsx('h3', {
                  className: `font-semibold mb-2 ${a.text}`,
                  children: 'Nessuna Prenotazione',
                }),
                e.jsx('p', {
                  className: `text-sm ${a.subtext} mb-4`,
                  children: 'Non hai prenotazioni attive',
                }),
                e.jsx('button', {
                  onClick: () => p('/booking'),
                  className:
                    'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors',
                  children: 'Prenota Ora',
                }),
              ],
            }),
          })
        : e.jsxs('div', {
            className: `${a.cardBg} ${a.border} p-6 rounded-xl`,
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-2',
                children: [
                  e.jsx('h3', {
                    className: `font-semibold text-sm ${a.text}`,
                    children: 'Le Tue Prenotazioni',
                  }),
                  j &&
                    e.jsxs('div', {
                      className: 'flex items-center gap-1',
                      children: [
                        e.jsx('div', {
                          className: 'w-1 h-1 bg-blue-500 rounded-full animate-pulse',
                        }),
                        e.jsx('div', {
                          className: 'w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-100',
                        }),
                        e.jsx('div', {
                          className: 'w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-200',
                        }),
                      ],
                    }),
                ],
              }),
              e.jsx('div', {
                className: 'overflow-x-auto pb-2 -mx-6 px-6 sm:mx-0 sm:px-0',
                children: e.jsxs('div', {
                  className: 'flex gap-2 w-max sm:grid sm:grid-cols-1 sm:gap-3 sm:w-full',
                  children: [
                    l.map((t) =>
                      e.jsx(te, { booking: t, onBookingClick: D, courts: x, user: s, T: a }, t.id)
                    ),
                    e.jsxs('div', {
                      onClick: () => p('/booking'),
                      className: `bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 
              hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30
              border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg cursor-pointer
              min-w-[220px] h-28 flex-shrink-0 flex flex-col items-center justify-center
              transition-all hover:border-blue-400 dark:hover:border-blue-500 group`,
                      children: [
                        e.jsx('div', {
                          className:
                            'w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform',
                          children: e.jsx('svg', {
                            className: 'w-4 h-4 text-white',
                            fill: 'currentColor',
                            viewBox: '0 0 20 20',
                            children: e.jsx('path', {
                              fillRule: 'evenodd',
                              d: 'M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z',
                              clipRule: 'evenodd',
                            }),
                          }),
                        }),
                        e.jsx('span', {
                          className:
                            'text-xs font-medium text-blue-700 dark:text-blue-300 text-center',
                          children: 'Prenota Campo',
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              l.length > 0 &&
                e.jsx('div', {
                  className: 'flex justify-center mt-2 sm:hidden',
                  children: e.jsxs('div', {
                    className: 'flex gap-0.5',
                    children: [
                      l
                        .slice(0, Math.min(6, l.length))
                        .map((t, C) =>
                          e.jsx('div', { className: 'w-0.5 h-0.5 rounded-full bg-gray-300' }, C)
                        ),
                      l.length > 6 &&
                        e.jsx('div', { className: 'w-0.5 h-0.5 rounded-full bg-blue-500' }),
                    ],
                  }),
                }),
              e.jsx('div', {
                className: 'hidden sm:block mt-4 pt-3 border-t border-gray-200',
                children: e.jsx('button', {
                  onClick: () => p('/booking'),
                  className:
                    'w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors text-sm font-medium',
                  children: 'Nuova Prenotazione',
                }),
              }),
              h &&
                e.jsx(se, {
                  booking: f,
                  isOpen: h,
                  onClose: g,
                  state: r,
                  T: a,
                  onShare: P,
                  onCancel: B,
                  onEdit: N,
                  onReview: w,
                }),
            ],
          })
    : e.jsx('div', {
        className: `${a.cardBg} ${a.border} p-6 rounded-xl`,
        children: e.jsxs('div', {
          className: 'text-center',
          children: [
            e.jsx('div', { className: 'text-4xl mb-3', children: '📅' }),
            e.jsx('h3', {
              className: `font-semibold mb-2 ${a.text}`,
              children: 'Accedi per vedere le prenotazioni',
            }),
            e.jsx('p', {
              className: `text-sm ${a.subtext} mb-4`,
              children: 'Effettua il login per gestire le tue prenotazioni',
            }),
            e.jsx('button', {
              onClick: () => p('/login'),
              className:
                'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors',
              children: 'Accedi',
            }),
          ],
        }),
      });
}
export { oe as default };
