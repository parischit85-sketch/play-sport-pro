const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/UserBookingsCard-mfcrqai8-Q_UI34P2.js',
      'assets/index-mfcrqai8-SK5xfcQr.js',
      'assets/vendor-mfcrqai8-D3F3s8fL.js',
      'assets/router-mfcrqai8-B0glbTOM.js',
      'assets/firebase-mfcrqai8-BteSMG94.js',
      'assets/index-mfcrqfp1-BBYtpoEP.css',
      'assets/bookings-mfcrqai8-Kr_Xz312.js',
      'assets/cloud-bookings-mfcrqai8-d3aOF8gM.js',
      'assets/Modal-mfcrqai8-D4fdDW46.js',
    ])
) => i.map((i) => d[i]);
import { j as e, e as N, u as w, f as y, t as M, _ as C } from './index-mfcrqai8-SK5xfcQr.js';
import { r as h, c as I, b as l } from './router-mfcrqai8-B0glbTOM.js';
import './vendor-mfcrqai8-D3F3s8fL.js';
import './firebase-mfcrqai8-BteSMG94.js';
const u = ({ onProfileClick: t, onBackupClick: a }) =>
  e.jsxs('button', {
    onClick: t,
    className:
      'bg-white ring-1 ring-black/10 hover:ring-black/20 p-5 rounded-2xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group text-center w-full',
    children: [
      e.jsx('div', {
        className:
          'bg-slate-50 text-slate-700 ring-1 ring-slate-200 w-11 h-11 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform mx-auto',
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
function g({ className: t = '' }) {
  const {
      isInstallable: a,
      isInstalled: o,
      installApp: c,
      browserInfo: s,
      installInstructions: r,
    } = N(),
    [i, x] = h.useState(!1),
    [f, d] = h.useState(!1);
  if (
    (h.useEffect(() => {
      localStorage.getItem('pwa-banner-dismissed') && x(!0);
    }, []),
    o || i || !a)
  )
    return null;
  const b = async () => {
      if (r?.show) {
        d(!0);
        return;
      }
      try {
        (await c()) && x(!0);
      } catch (n) {
        (console.error('Install failed:', n), r?.show && d(!0));
      }
    },
    v = () => {
      (x(!0),
        localStorage.setItem('pwa-banner-dismissed', 'true'),
        setTimeout(
          () => {
            localStorage.removeItem('pwa-banner-dismissed');
          },
          10080 * 60 * 1e3
        ));
    },
    k = () =>
      s?.isIOS
        ? '📱 Installa su iPhone/iPad'
        : s?.isAndroid
          ? '🤖 Installa su Android'
          : s?.isFirefox
            ? '🦊 Installa con Firefox'
            : s?.isMobile
              ? '📱 Installa App Mobile'
              : '💻 Installa App Desktop';
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx('div', {
        className: `bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg ${t}`,
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
                      e.jsx('h3', { className: 'font-semibold text-white mb-1', children: k() }),
                      e.jsx('p', {
                        className: 'text-blue-100 text-sm',
                        children: s?.isMobile
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
                    onClick: b,
                    className:
                      'bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2',
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
                      r?.show ? 'Come installare' : 'Installa ora',
                    ],
                  }),
                  e.jsx('button', {
                    onClick: v,
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
      f &&
        r?.show &&
        e.jsx('div', {
          className: 'fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4',
          children: e.jsx('div', {
            className: 'bg-white rounded-xl p-6 max-w-md w-full mx-4',
            children: e.jsxs('div', {
              className: 'text-center',
              children: [
                e.jsx('div', {
                  className:
                    'w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4',
                  children: e.jsx('span', { className: 'text-3xl', children: r.icon || '📱' }),
                }),
                e.jsx('h3', {
                  className: 'text-xl font-semibold text-gray-900 mb-2',
                  children: r.title || 'Installa App',
                }),
                e.jsx('p', {
                  className: 'text-gray-600 mb-6',
                  children: 'Segui questi semplici passaggi:',
                }),
                r.instructions &&
                  e.jsx('div', {
                    className: 'text-left space-y-4 mb-8',
                    children: r.instructions.map((n, m) =>
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
                            e.jsx('p', { className: 'text-sm text-gray-700 pt-1', children: n }),
                          ],
                        },
                        m
                      )
                    ),
                  }),
                s &&
                  e.jsx('div', {
                    className: 'bg-gray-50 rounded-lg p-3 mb-6',
                    children: e.jsxs('p', {
                      className: 'text-xs text-gray-600 text-center',
                      children: [
                        'Browser: ',
                        s.isChrome
                          ? 'Chrome'
                          : s.isFirefox
                            ? 'Firefox'
                            : s.isEdge
                              ? 'Edge'
                              : s.isSafari
                                ? 'Safari'
                                : s.isOpera
                                  ? 'Opera'
                                  : s.isSamsung
                                    ? 'Samsung Internet'
                                    : 'Altro',
                        s.isMobile ? ' Mobile' : '',
                      ],
                    }),
                  }),
                e.jsxs('div', {
                  className: 'flex gap-3',
                  children: [
                    e.jsx('button', {
                      onClick: () => d(!1),
                      className:
                        'flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors',
                      children: 'Ho capito',
                    }),
                    s &&
                      !s.isIOS &&
                      !s.isFirefox &&
                      e.jsx('button', {
                        onClick: async () => {
                          (d(!1), await c());
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
const p = l.lazy(() =>
    C(
      () => import('./UserBookingsCard-mfcrqai8-Q_UI34P2.js'),
      __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7, 8])
    )
  ),
  j = l.memo(({ action: t, T: a }) =>
    e.jsxs('button', {
      onClick: t.action,
      className:
        'bg-white ring-1 ring-black/10 hover:ring-black/20 p-5 rounded-2xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group text-center',
      children: [
        e.jsx('div', {
          className: `${t.iconWrap} w-11 h-11 ${a.borderLg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform mx-auto`,
          children: t.icon,
        }),
        e.jsx('h3', {
          className: 'font-bold text-base mb-1 text-gray-900 dark:text-white text-center',
          children: t.title,
        }),
        e.jsx('p', {
          className: 'text-xs text-gray-600 dark:text-gray-300 text-center',
          children: t.description,
        }),
      ],
    })
  );
function B() {
  const t = I(),
    { user: a } = w(),
    { state: o, loading: c } = y(),
    s = l.useMemo(() => M(), []),
    r = l.useMemo(
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
          action: () => t('/booking'),
          iconWrap: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
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
          action: () => t('/classifica'),
          iconWrap: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
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
          action: () => t('/stats'),
          iconWrap: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200',
        },
      ],
      [t]
    );
  return c
    ? e.jsxs('div', {
        className: 'space-y-1',
        children: [
          e.jsx(g, {}),
          e.jsxs('div', {
            className: 'animate-pulse space-y-4',
            children: [
              e.jsx('div', { className: 'bg-gray-200 rounded-xl h-32' }),
              e.jsx('div', {
                className: 'grid grid-cols-2 gap-4',
                children: [1, 2, 3].map((i) =>
                  e.jsx('div', { className: 'bg-gray-200 rounded-2xl h-24' }, i)
                ),
              }),
            ],
          }),
        ],
      })
    : e.jsxs('div', {
        className: 'space-y-1',
        children: [
          e.jsx(g, {}),
          e.jsxs('div', {
            className: 'hidden lg:grid lg:grid-cols-2 lg:gap-4 lg:items-start',
            children: [
              e.jsx('div', {
                children: e.jsx(l.Suspense, {
                  fallback: e.jsxs('div', {
                    className: 'bg-gray-100 rounded-xl p-6 animate-pulse',
                    children: [
                      e.jsx('div', { className: 'h-4 bg-gray-200 rounded w-32 mb-4' }),
                      e.jsx('div', {
                        className: 'space-y-3',
                        children: [1, 2].map((i) =>
                          e.jsx('div', { className: 'h-20 bg-gray-200 rounded-lg' }, i)
                        ),
                      }),
                    ],
                  }),
                  children: e.jsx(p, { user: a, state: o, T: s }),
                }),
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('h3', {
                    className: 'text-lg font-semibold mb-2 text-gray-900 dark:text-white',
                    children: 'Azioni Rapide',
                  }),
                  e.jsxs('div', {
                    className: 'grid grid-cols-2 gap-4',
                    children: [
                      r.map((i) => e.jsx(j, { action: i, T: s }, i.title)),
                      e.jsx(u, {
                        onProfileClick: () => t('/profile'),
                        onBackupClick: () => t('/extra'),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs('div', {
            className: 'lg:hidden space-y-2',
            children: [
              e.jsx('div', {
                children: e.jsx(l.Suspense, {
                  fallback: e.jsxs('div', {
                    className: 'bg-gray-100 rounded-xl p-4 animate-pulse',
                    children: [
                      e.jsx('div', { className: 'h-3 bg-gray-200 rounded w-24 mb-3' }),
                      e.jsx('div', {
                        className: 'flex gap-2 overflow-x-auto pb-2',
                        children: [1, 2, 3].map((i) =>
                          e.jsx(
                            'div',
                            {
                              className: 'min-w-[200px] h-24 bg-gray-200 rounded-lg flex-shrink-0',
                            },
                            i
                          )
                        ),
                      }),
                    ],
                  }),
                  children: e.jsx(p, { user: a, state: o, T: s, compact: !0 }),
                }),
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('h3', {
                    className: 'text-lg font-semibold mb-4 text-gray-900 dark:text-white',
                    children: 'Azioni Rapide',
                  }),
                  e.jsxs('div', {
                    className: 'grid grid-cols-2 gap-4',
                    children: [
                      r.map((i) => e.jsx(j, { action: i, T: s }, i.title)),
                      e.jsx(u, {
                        onProfileClick: () => t('/profile'),
                        onBackupClick: () => t('/extra'),
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
