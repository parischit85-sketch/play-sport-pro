const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/UserBookingsCard-mfgpn7fg-DU8wXN47.js',
      'assets/index-mfgpn7fg-C0gX905a.js',
      'assets/vendor-mfgpn7fg-D3F3s8fL.js',
      'assets/router-mfgpn7fg-7pyUyyy2.js',
      'assets/firebase-mfgpn7fg-X_I_guKF.js',
      'assets/index-mfgpnd5c-Ca4cmXhp.css',
      'assets/Modal-mfgpn7fg-DVggMcVY.js',
      'assets/Badge-mfgpn7fg-Cd92P3W8.js',
    ])
) => i.map((i) => d[i]);
import { j as e, e as w, u as y, f as N, t as M, _ as C } from './index-mfgpn7fg-C0gX905a.js';
import { r as g, c as I, b as o } from './router-mfgpn7fg-7pyUyyy2.js';
import './vendor-mfgpn7fg-D3F3s8fL.js';
import './firebase-mfgpn7fg-X_I_guKF.js';
const b = ({ onProfileClick: s, onBackupClick: i }) =>
  e.jsxs('button', {
    onClick: s,
    className:
      'bg-white dark:bg-gray-800 ring-1 ring-black/10 dark:ring-white/10 hover:ring-black/20 dark:hover:ring-white/20 p-5 rounded-2xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group text-center w-full',
    children: [
      e.jsx('div', {
        className:
          'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-600 w-11 h-11 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform mx-auto',
        children: e.jsxs('svg', {
          className: 'w-6 h-6',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
          children: [
            e.jsx('circle', { cx: '12', cy: '7', r: '4', strokeWidth: 1.5 }),
            e.jsx('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', strokeWidth: 1.5 }),
          ],
        }),
      }),
      e.jsx('h3', {
        className: 'font-bold text-base mb-1 text-gray-900 dark:text-white text-center',
        children: 'Profilo',
      }),
      e.jsx('p', {
        className: 'text-xs text-gray-600 dark:text-gray-300 text-center',
        children: 'Gestisci il tuo account',
      }),
    ],
  });
function u({ className: s = '' }) {
  const {
      isInstallable: i,
      isInstalled: d,
      installApp: n,
      browserInfo: r,
      installInstructions: t,
    } = w(),
    [a, x] = g.useState(!1),
    [k, c] = g.useState(!1);
  if (
    (g.useEffect(() => {
      localStorage.getItem('pwa-banner-dismissed') && x(!0);
    }, []),
    d || a || !i)
  )
    return null;
  const f = async () => {
      if (t?.show) {
        c(!0);
        return;
      }
      try {
        (await n()) && x(!0);
      } catch (l) {
        (console.error('Install failed:', l), t?.show && c(!0));
      }
    },
    j = () => {
      (x(!0),
        localStorage.setItem('pwa-banner-dismissed', 'true'),
        setTimeout(
          () => {
            localStorage.removeItem('pwa-banner-dismissed');
          },
          10080 * 60 * 1e3
        ));
    },
    v = () =>
      r?.isIOS
        ? '📱 Installa su iPhone/iPad'
        : r?.isAndroid
          ? '🤖 Installa su Android'
          : r?.isFirefox
            ? '🦊 Installa con Firefox'
            : r?.isMobile
              ? '📱 Installa App Mobile'
              : '💻 Installa App Desktop';
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx('div', {
        className: `bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg ${s}`,
        children: e.jsx('div', {
          className: 'max-w-6xl mx-auto px-4 py-3',
          children: e.jsxs('div', {
            className: 'flex flex-col sm:flex-row items-center justify-between gap-4',
            children: [
              e.jsxs('div', {
                className: 'flex items-center gap-4 flex-1',
                children: [
                  e.jsx('div', {
                    className: 'flex-shrink-0',
                    children: e.jsx('div', {
                      className:
                        'w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm',
                      children: e.jsx('svg', {
                        className: 'w-6 h-6 text-white',
                        fill: 'none',
                        stroke: 'currentColor',
                        viewBox: '0 0 24 24',
                        children: e.jsx('path', {
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                          strokeWidth: 2,
                          d: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10',
                        }),
                      }),
                    }),
                  }),
                  e.jsxs('div', {
                    className: 'text-center sm:text-left',
                    children: [
                      e.jsx('h3', { className: 'font-semibold text-white mb-1', children: v() }),
                      e.jsx('p', {
                        className: 'text-blue-100 text-sm',
                        children: r?.isMobile
                          ? 'Aggiungila alla home screen per accesso rapido'
                          : "Installala sul desktop per un'esperienza app nativa",
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'flex items-center gap-2 flex-shrink-0',
                children: [
                  e.jsxs('button', {
                    onClick: f,
                    className:
                      'bg-white dark:bg-blue-600 text-blue-600 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2',
                    children: [
                      e.jsx('svg', {
                        className: 'w-4 h-4',
                        fill: 'none',
                        stroke: 'currentColor',
                        viewBox: '0 0 24 24',
                        children: e.jsx('path', {
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                          strokeWidth: 2,
                          d: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10',
                        }),
                      }),
                      t?.show ? 'Come installare' : 'Installa ora',
                    ],
                  }),
                  e.jsx('button', {
                    onClick: j,
                    className: 'text-blue-100 hover:text-white p-2 transition-colors',
                    title: 'Nascondi banner',
                    children: e.jsx('svg', {
                      className: 'w-4 h-4',
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
            ],
          }),
        }),
      }),
      k &&
        t?.show &&
        e.jsx('div', {
          className:
            'fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[99999] p-4',
          children: e.jsx('div', {
            className:
              'bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border dark:border-gray-600',
            children: e.jsxs('div', {
              className: 'text-center',
              children: [
                e.jsx('div', {
                  className:
                    'w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4',
                  children: e.jsx('span', { className: 'text-3xl', children: t.icon || '📱' }),
                }),
                e.jsx('h3', {
                  className: 'text-xl font-semibold text-gray-900 dark:text-white mb-2',
                  children: t.title || 'Installa App',
                }),
                e.jsx('p', {
                  className: 'text-gray-600 dark:text-gray-300 mb-6',
                  children: 'Segui questi semplici passaggi:',
                }),
                t.instructions &&
                  e.jsx('div', {
                    className: 'text-left space-y-4 mb-8',
                    children: t.instructions.map((l, m) =>
                      e.jsxs(
                        'div',
                        {
                          className: 'flex items-start gap-3',
                          children: [
                            e.jsx('div', {
                              className:
                                'w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                              children: m + 1,
                            }),
                            e.jsx('p', {
                              className: 'text-sm text-gray-700 dark:text-gray-300 pt-1',
                              children: l,
                            }),
                          ],
                        },
                        m
                      )
                    ),
                  }),
                r &&
                  e.jsx('div', {
                    className: 'bg-gray-50 rounded-lg p-3 mb-6',
                    children: e.jsxs('p', {
                      className: 'text-xs text-gray-600 text-center',
                      children: [
                        'Browser:',
                        ' ',
                        r.isChrome
                          ? 'Chrome'
                          : r.isFirefox
                            ? 'Firefox'
                            : r.isEdge
                              ? 'Edge'
                              : r.isSafari
                                ? 'Safari'
                                : r.isOpera
                                  ? 'Opera'
                                  : r.isSamsung
                                    ? 'Samsung Internet'
                                    : 'Altro',
                        r.isMobile ? ' Mobile' : '',
                      ],
                    }),
                  }),
                e.jsxs('div', {
                  className: 'flex gap-3',
                  children: [
                    e.jsx('button', {
                      onClick: () => c(!1),
                      className:
                        'flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-medium transition-colors',
                      children: 'Ho capito',
                    }),
                    r &&
                      !r.isIOS &&
                      !r.isFirefox &&
                      e.jsx('button', {
                        onClick: async () => {
                          (c(!1), await n());
                        },
                        className:
                          'flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors',
                        children: 'Prova Auto-Install',
                      }),
                  ],
                }),
              ],
            }),
          }),
        }),
    ],
  });
}
const p = o.lazy(() =>
    C(
      () => import('./UserBookingsCard-mfgpn7fg-DU8wXN47.js'),
      __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7])
    )
  ),
  h = o.memo(({ action: s, T: i }) =>
    e.jsxs('button', {
      onClick: s.action,
      className:
        'relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl border border-white/30 dark:border-gray-600/30 hover:border-white/50 dark:hover:border-gray-500/50 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group text-center overflow-hidden',
      children: [
        e.jsx('div', {
          className:
            'absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none',
        }),
        e.jsxs('div', {
          className: 'relative',
          children: [
            e.jsx('div', {
              className: `${s.iconWrap} w-12 h-12 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto rounded-xl shadow-lg`,
              children: s.icon,
            }),
            e.jsx('h3', {
              className: 'font-bold text-base mb-2 text-gray-900 dark:text-white text-center',
              children: s.title,
            }),
            e.jsx('p', {
              className: 'text-xs text-gray-600 dark:text-gray-300 text-center leading-relaxed',
              children: s.description,
            }),
          ],
        }),
      ],
    })
  );
h.displayName = 'QuickAction';
function B() {
  const s = I(),
    { user: i } = y(),
    { state: d, loading: n } = N(),
    r = o.useMemo(() => M(), []),
    t = o.useMemo(
      () => [
        {
          title: 'Prenota Campo',
          description: 'Prenota subito un campo disponibile',
          icon: e.jsxs('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            children: [
              e.jsx('rect', {
                x: '3',
                y: '5',
                width: '18',
                height: '16',
                rx: '2',
                strokeWidth: 1.5,
              }),
              e.jsx('path', { d: 'M8 3v4M16 3v4M3 9h18', strokeWidth: 1.5 }),
              e.jsx('path', { d: 'M12 13v6M9 16h6', strokeWidth: 1.5 }),
            ],
          }),
          action: () => s('/booking'),
          iconWrap:
            'bg-gradient-to-r from-emerald-50/80 to-green-50/60 dark:from-emerald-900/40 dark:to-green-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/30',
        },
        {
          title: 'Classifica',
          description: 'Visualizza ranking RPA',
          icon: e.jsxs('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            children: [
              e.jsx('path', { d: 'M5 6h14v2a5 5 0 01-5 5h-4a5 5 0 01-5-5V6z', strokeWidth: 1.5 }),
              e.jsx('path', { d: 'M8 21h8M10 21v-3a2 2 0 012-2 2 2 0 012 2v3', strokeWidth: 1.5 }),
              e.jsx('path', { d: 'M19 8a3 3 0 003-3V4h-3', strokeWidth: 1.5 }),
              e.jsx('path', { d: 'M5 8a3 3 0 01-3-3V4h3', strokeWidth: 1.5 }),
            ],
          }),
          action: () => s('/classifica'),
          iconWrap:
            'bg-gradient-to-r from-amber-50/80 to-orange-50/60 dark:from-amber-900/40 dark:to-orange-900/30 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/30',
        },
        {
          title: 'Statistiche',
          description: 'Analisi avanzate e grafici',
          icon: e.jsxs('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            children: [
              e.jsx('path', { d: 'M3 20h18', strokeWidth: 1.5 }),
              e.jsx('path', { d: 'M4 14l4-4 4 3 5-6 3 2', strokeWidth: 1.5 }),
              e.jsx('circle', { cx: '8', cy: '10', r: '1', fill: 'currentColor' }),
              e.jsx('circle', { cx: '12', cy: '13', r: '1', fill: 'currentColor' }),
              e.jsx('circle', { cx: '17', cy: '7', r: '1', fill: 'currentColor' }),
            ],
          }),
          action: () => s('/stats'),
          iconWrap:
            'bg-gradient-to-r from-indigo-50/80 to-purple-50/60 dark:from-indigo-900/40 dark:to-purple-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-500/30',
        },
      ],
      [s]
    );
  return n
    ? e.jsxs('div', {
        className:
          'space-y-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 p-4',
        children: [
          e.jsx(u, {}),
          e.jsxs('div', {
            className: 'animate-pulse space-y-6',
            children: [
              e.jsx('div', {
                className:
                  'bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl h-32 border border-white/20 dark:border-gray-700/20 shadow-xl',
              }),
              e.jsx('div', {
                className: 'grid grid-cols-2 gap-4',
                children: [1, 2, 3].map((a) =>
                  e.jsx(
                    'div',
                    {
                      className:
                        'bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl h-24 border border-white/20 dark:border-gray-700/20 shadow-xl',
                    },
                    a
                  )
                ),
              }),
            ],
          }),
        ],
      })
    : e.jsxs('div', {
        className:
          'space-y-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800',
        children: [
          e.jsx(u, {}),
          e.jsxs('div', {
            className: 'hidden lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start lg:p-6',
            children: [
              e.jsx('div', {
                className:
                  'bg-gradient-to-br from-slate-50/95 via-blue-50/90 to-indigo-50/95 dark:from-gray-900/95 dark:via-gray-800/95 dark:to-gray-700/95 backdrop-blur-xl rounded-3xl border-2 border-blue-200/50 dark:border-blue-700/50 p-6 shadow-2xl shadow-blue-100/40 dark:shadow-blue-900/40',
                children: e.jsx(o.Suspense, {
                  fallback: e.jsxs('div', {
                    className:
                      'bg-gradient-to-r from-gray-50/80 to-gray-100/60 dark:from-gray-700/60 dark:to-gray-800/40 rounded-2xl p-6 animate-pulse backdrop-blur-sm border border-white/30 dark:border-gray-600/30',
                    children: [
                      e.jsx('div', {
                        className: 'h-4 bg-gray-200/80 dark:bg-gray-600/60 rounded w-32 mb-4',
                      }),
                      e.jsx('div', {
                        className: 'space-y-3',
                        children: [1, 2].map((a) =>
                          e.jsx(
                            'div',
                            { className: 'h-20 bg-gray-200/60 dark:bg-gray-600/40 rounded-lg' },
                            a
                          )
                        ),
                      }),
                    ],
                  }),
                  children: e.jsx(p, { user: i, state: d, T: r }),
                }),
              }),
              e.jsxs('div', {
                className:
                  'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl',
                children: [
                  e.jsxs('h3', {
                    className:
                      'text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3',
                    children: [
                      e.jsx('div', {
                        className:
                          'w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center',
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
                      'Azioni Rapide',
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'grid grid-cols-2 gap-4',
                    children: [
                      t.map((a) => e.jsx(h, { action: a, T: r }, a.title)),
                      e.jsx(b, {
                        onProfileClick: () => s('/profile'),
                        onBackupClick: () => s('/extra'),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs('div', {
            className: 'lg:hidden space-y-6 p-4',
            children: [
              e.jsx('div', {
                className:
                  'bg-gradient-to-br from-slate-50/95 via-blue-50/90 to-indigo-50/95 dark:from-gray-900/95 dark:via-gray-800/95 dark:to-gray-700/95 backdrop-blur-xl rounded-3xl border-2 border-blue-200/50 dark:border-blue-700/50 p-6 shadow-2xl shadow-blue-100/40 dark:shadow-blue-900/40',
                children: e.jsx(o.Suspense, {
                  fallback: e.jsxs('div', {
                    className:
                      'bg-gradient-to-r from-gray-50/80 to-gray-100/60 dark:from-gray-700/60 dark:to-gray-800/40 rounded-2xl p-4 animate-pulse backdrop-blur-sm border border-white/30 dark:border-gray-600/30',
                    children: [
                      e.jsx('div', {
                        className: 'h-3 bg-gray-200/80 dark:bg-gray-600/60 rounded w-24 mb-3',
                      }),
                      e.jsx('div', {
                        className: 'flex gap-2 overflow-x-auto pb-2',
                        children: [1, 2, 3].map((a) =>
                          e.jsx(
                            'div',
                            {
                              className:
                                'min-w-[200px] h-24 bg-gray-200/60 dark:bg-gray-600/40 rounded-lg flex-shrink-0',
                            },
                            a
                          )
                        ),
                      }),
                    ],
                  }),
                  children: e.jsx(p, { user: i, state: d, T: r, compact: !0 }),
                }),
              }),
              e.jsxs('div', {
                className:
                  'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl',
                children: [
                  e.jsxs('h3', {
                    className:
                      'text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3',
                    children: [
                      e.jsx('div', {
                        className:
                          'w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center',
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
                      'Azioni Rapide',
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'grid grid-cols-2 gap-4',
                    children: [
                      t.map((a) => e.jsx(h, { action: a, T: r }, a.title)),
                      e.jsx(b, {
                        onProfileClick: () => s('/profile'),
                        onBackupClick: () => s('/extra'),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      });
}
export { B as default };
