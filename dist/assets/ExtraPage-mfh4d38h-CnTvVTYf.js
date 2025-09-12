const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/index-mfh4d38h-CPKWh84w.js',
      'assets/vendor-mfh4d38h-D3F3s8fL.js',
      'assets/router-mfh4d38h-D14HHbEI.js',
      'assets/firebase-mfh4d38h-X_I_guKF.js',
      'assets/index-mfh4dd21-BbNF3oHO.css',
    ])
) => i.map((i) => d[i]);
import { j as e, q as z, _ as A, f as D, k as I, t as _ } from './index-mfh4d38h-CPKWh84w.js';
import { r as $, b as w, c as F } from './router-mfh4d38h-D14HHbEI.js';
import { S as L } from './Section-mfh4d38h-Df1Gzqw4.js';
import { e as R } from './format-mfh4d38h-DAEZv7Mi.js';
import './vendor-mfh4d38h-D3F3s8fL.js';
import './firebase-mfh4d38h-X_I_guKF.js';
function H({ value: a = [], onChange: i, T: o }) {
  const t = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
    m = (d) => {
      const h = a.includes(d);
      i(h ? a.filter((s) => s !== d) : [...a, d].sort((s, n) => s - n));
    };
  return e.jsx('div', {
    className: 'flex flex-wrap gap-1',
    children: t.map((d, h) =>
      e.jsx(
        'button',
        {
          type: 'button',
          onClick: () => m(h),
          className: `px-2 h-6 rounded-md text-xs ring-1 transition-all ${a.includes(h) ? 'bg-emerald-500 text-black dark:text-white ring-emerald-500/60' : `${o.ghostRing} ${o.cardBg}`}`,
          children: d,
        },
        h
      )
    ),
  });
}
function M({ slot: a, onUpdate: i, onRemove: o, T: t }) {
  const m = (s) => String(s).padStart(2, '0'),
    d = (s = '09:00') => {
      const n = /^(\d{1,2}):(\d{2})$/.exec(String(s).trim());
      if (!n) return '09:00';
      const u = Math.min(23, Math.max(0, Number(n[1] || 0))),
        c = Math.min(59, Math.max(0, Number(n[2] || 0)));
      return `${m(u)}:${m(c)}`;
    },
    h = (s) => {
      const n = (Number(s) || 0) * 1.5;
      return R(n / 4);
    };
  return e.jsxs('div', {
    className: `relative rounded-lg p-3 ${t.name === 'dark' ? `${t.cardBg} ${t.border}` : 'bg-emerald-50/50 dark:bg-emerald-900/20 ring-1 ring-emerald-200 dark:ring-emerald-700'}`,
    children: [
      e.jsx('button', {
        type: 'button',
        className: 'absolute top-2 right-2 text-rose-500 text-xs hover:underline z-10',
        onClick: o,
        title: 'Rimuovi fascia',
        children: '✕',
      }),
      e.jsxs('div', {
        className: 'grid lg:grid-cols-3 gap-3',
        children: [
          e.jsxs('div', {
            className: 'lg:col-span-2 space-y-3',
            children: [
              e.jsxs('div', {
                className: 'grid sm:grid-cols-2 gap-2',
                children: [
                  e.jsxs('div', {
                    className: 'flex flex-col',
                    children: [
                      e.jsx('label', {
                        className: `text-xs ${t.subtext} mb-1`,
                        children: 'Nome fascia',
                      }),
                      e.jsx('input', {
                        value: a.label || '',
                        onChange: (s) => i({ label: s.target.value }),
                        className: t.input,
                        placeholder: 'Es. Mattutina, Serale, Peak',
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'flex flex-col',
                    children: [
                      e.jsx('label', { className: `text-xs ${t.subtext} mb-1`, children: '€/ora' }),
                      e.jsx('input', {
                        type: 'number',
                        min: '0',
                        step: '0.5',
                        value: a.eurPerHour ?? 0,
                        onChange: (s) => i({ eurPerHour: Number(s.target.value) || 0 }),
                        className: t.input,
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'grid grid-cols-2 gap-2',
                children: [
                  e.jsxs('div', {
                    className: 'flex flex-col',
                    children: [
                      e.jsx('label', {
                        className: `text-xs ${t.subtext} mb-1`,
                        children: 'Ora inizio',
                      }),
                      e.jsx('input', {
                        type: 'time',
                        value: d(a.from),
                        onChange: (s) => i({ from: d(s.target.value) }),
                        className: t.input,
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'flex flex-col',
                    children: [
                      e.jsx('label', {
                        className: `text-xs ${t.subtext} mb-1`,
                        children: 'Ora fine',
                      }),
                      e.jsx('input', {
                        type: 'time',
                        value: d(a.to),
                        onChange: (s) => i({ to: d(s.target.value) }),
                        className: t.input,
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('label', {
                    className: `text-xs ${t.subtext} mb-2 block`,
                    children: 'Giorni attivi',
                  }),
                  e.jsx(H, {
                    value: Array.isArray(a.days) ? a.days : [],
                    onChange: (s) => i({ days: s }),
                    T: t,
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'flex items-center gap-2',
                children: [
                  e.jsx('input', {
                    type: 'checkbox',
                    id: `promo-${a.id || 'new'}`,
                    checked: !!a.isPromo,
                    onChange: (s) => i({ isPromo: s.target.checked }),
                    className: 'w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500',
                  }),
                  e.jsxs('label', {
                    htmlFor: `promo-${a.id || 'new'}`,
                    className: 'text-sm flex items-center gap-1',
                    children: [
                      '🏷️ Fascia Promo',
                      a.isPromo &&
                        e.jsx('span', {
                          className:
                            'ml-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-1.5 py-0.5 rounded',
                          children: 'PROMO',
                        }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsx('div', {
            className: 'flex lg:justify-end',
            children: e.jsxs('div', {
              className: `flex-shrink-0 p-3 rounded-lg ring-1 bg-emerald-100/50 dark:bg-emerald-900/30 ${t.border} text-center`,
              children: [
                e.jsx('div', {
                  className: 'text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1',
                  children: '90min/4 persone',
                }),
                e.jsxs('div', {
                  className: 'text-lg font-bold text-emerald-800 dark:text-emerald-200',
                  children: [h(a.eurPerHour), '€'],
                }),
                e.jsx('div', {
                  className: 'text-xs text-emerald-600 dark:text-emerald-400',
                  children: 'per persona',
                }),
              ],
            }),
          }),
        ],
      }),
    ],
  });
}
function O({ court: a, onUpdate: i, onRemove: o, T: t }) {
  const [m, d] = $.useState(!1),
    h = () => {
      const c = {
        id: Date.now().toString(),
        label: 'Nuova fascia',
        eurPerHour: 25,
        from: '08:00',
        to: '12:00',
        days: [1, 2, 3, 4, 5],
      };
      i({ timeSlots: [...(a.timeSlots || []), c] });
    },
    s = (c, g) => {
      const b = (a.timeSlots || []).map((v, P) => (P === c ? { ...v, ...g } : v));
      i({ timeSlots: b });
    },
    n = (c) => {
      const g = (a.timeSlots || []).filter((b, v) => v !== c);
      i({ timeSlots: g });
    },
    u = () => {
      i({ hasHeating: !a.hasHeating });
    };
  return e.jsxs('div', {
    className: `rounded-xl ${t.border} ${t.cardBg} overflow-hidden transition-all`,
    children: [
      e.jsx('div', {
        className:
          'p-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors',
        onClick: () => d(!m),
        children: e.jsxs('div', {
          className: 'flex items-center justify-between',
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                e.jsx('span', { className: 'text-2xl', children: '🎾' }),
                e.jsxs('div', {
                  children: [
                    e.jsx('div', { className: 'font-semibold text-lg', children: a.name }),
                    e.jsxs('div', {
                      className: `text-sm ${t.subtext}`,
                      children: [
                        (a.timeSlots || []).length,
                        ' fasce orarie configurate',
                        a.hasHeating &&
                          e.jsx('span', {
                            className:
                              'ml-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-0.5 rounded',
                            children: '🔥 Riscaldamento',
                          }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'flex items-center gap-2',
              children: [
                e.jsx('button', {
                  type: 'button',
                  className: `text-sm px-3 py-1 rounded transition-all ${m ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`,
                  onClick: (c) => {
                    (c.stopPropagation(), d(!m));
                  },
                  children: m ? '📝 Chiudi' : '⚙️ Configura',
                }),
                e.jsx('button', {
                  type: 'button',
                  className:
                    'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded text-sm transition-colors',
                  onClick: (c) => {
                    (c.stopPropagation(), o());
                  },
                  children: '🗑️',
                }),
              ],
            }),
          ],
        }),
      }),
      m &&
        e.jsxs('div', {
          className:
            'border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50/30 dark:bg-gray-800/30',
          children: [
            e.jsxs('div', {
              className: 'mb-6',
              children: [
                e.jsxs('h4', {
                  className: 'font-medium mb-3 flex items-center gap-2',
                  children: [e.jsx('span', { children: '⚙️' }), 'Configurazioni Campo'],
                }),
                e.jsxs('div', {
                  className: 'grid sm:grid-cols-2 gap-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `text-xs ${t.subtext} mb-1 block`,
                          children: 'Nome Campo',
                        }),
                        e.jsx('input', {
                          value: a.name || '',
                          onChange: (c) => i({ name: c.target.value }),
                          className: t.input,
                          placeholder: 'Es. Campo 1 - Centrale',
                        }),
                      ],
                    }),
                    e.jsx('div', {
                      className: 'flex items-center gap-3',
                      children: e.jsxs('label', {
                        className: 'flex items-center gap-2 cursor-pointer',
                        children: [
                          e.jsx('input', {
                            type: 'checkbox',
                            checked: !!a.hasHeating,
                            onChange: u,
                            className: 'accent-orange-500',
                          }),
                          e.jsx('span', { className: 'text-sm', children: '🔥 Riscaldamento' }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              children: [
                e.jsxs('div', {
                  className: 'flex items-center justify-between mb-3',
                  children: [
                    e.jsxs('h4', {
                      className: 'font-medium flex items-center gap-2',
                      children: [e.jsx('span', { children: '🕐' }), 'Fasce Orarie e Prezzi'],
                    }),
                    e.jsx('button', {
                      type: 'button',
                      className: `${t.btnGhost} text-sm`,
                      onClick: h,
                      children: '+ Aggiungi Fascia',
                    }),
                  ],
                }),
                e.jsx('div', {
                  className: 'space-y-3',
                  children:
                    (a.timeSlots || []).length === 0
                      ? e.jsxs('div', {
                          className: `text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg ${t.subtext}`,
                          children: [
                            e.jsx('div', { className: 'text-2xl mb-2', children: '🕐' }),
                            e.jsx('div', {
                              className: 'text-sm',
                              children: 'Nessuna fascia oraria configurata',
                            }),
                            e.jsx('div', {
                              className: 'text-xs mt-1',
                              children: 'Aggiungi almeno una fascia per attivare il campo',
                            }),
                          ],
                        })
                      : (a.timeSlots || []).map((c, g) =>
                          e.jsx(
                            M,
                            { slot: c, onUpdate: (b) => s(g, b), onRemove: () => n(g), T: t },
                            c.id || g
                          )
                        ),
                }),
              ],
            }),
          ],
        }),
    ],
  });
}
function G({ courts: a = [], onChange: i, T: o }) {
  const [t, m] = $.useState(''),
    d = () => {
      if (!t.trim()) return;
      const n = { id: Date.now().toString(), name: t.trim(), hasHeating: !1, timeSlots: [] };
      (i([...a, n]), m(''));
    },
    h = (n, u) => {
      const c = a.map((g, b) => (b === n ? { ...g, ...u } : g));
      i(c);
    },
    s = (n) => {
      confirm(
        'Rimuovere il campo? Tutte le configurazioni e prenotazioni collegate saranno perse.'
      ) && i(a.filter((u, c) => c !== n));
    };
  return e.jsxs('div', {
    className: 'space-y-6',
    children: [
      e.jsxs('div', {
        className: `rounded-xl ${o.border} ${o.cardBg} p-4`,
        children: [
          e.jsx('h3', {
            className: 'font-semibold text-lg mb-4 flex items-center gap-2',
            children: '🏟️ Gestione Campi Avanzata',
          }),
          e.jsxs('div', {
            className: 'flex flex-col sm:flex-row gap-3',
            children: [
              e.jsx('div', {
                className: 'flex-1',
                children: e.jsx('input', {
                  value: t,
                  onChange: (n) => m(n.target.value),
                  onKeyDown: (n) => n.key === 'Enter' && d(),
                  className: `${o.input} w-full`,
                  placeholder: 'Es. Campo 4 - Centrale (Coperto)',
                }),
              }),
              e.jsx('button', {
                type: 'button',
                className: `${o.btnPrimary} w-full sm:w-auto px-6`,
                onClick: d,
                disabled: !t.trim(),
                children: '➕ Aggiungi Campo',
              }),
            ],
          }),
          e.jsx('div', {
            className: `text-xs ${o.subtext} mt-2`,
            children:
              'I campi saranno espandibili per configurare fasce orarie, prezzi e opzioni specifiche',
          }),
        ],
      }),
      e.jsx('div', {
        className: 'space-y-4',
        children:
          a.length === 0
            ? e.jsxs('div', {
                className: `text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl ${o.cardBg}`,
                children: [
                  e.jsx('div', { className: 'text-4xl mb-4', children: '🏟️' }),
                  e.jsx('h4', {
                    className: 'font-medium text-lg mb-2',
                    children: 'Nessun campo configurato',
                  }),
                  e.jsx('p', {
                    className: `text-sm ${o.subtext} mb-4`,
                    children:
                      'Aggiungi il primo campo per iniziare a configurare fasce orarie e prezzi personalizzati',
                  }),
                ],
              })
            : a.map((n, u) =>
                e.jsx(
                  O,
                  { court: n, onUpdate: (c) => h(u, c), onRemove: () => s(u), T: o },
                  n.id || u
                )
              ),
      }),
      a.length > 0 &&
        e.jsxs('div', {
          className: `rounded-xl ${o.border} ${o.cardBg} p-4`,
          children: [
            e.jsx('h4', {
              className: 'font-medium mb-3 flex items-center gap-2',
              children: '📊 Riepilogo Configurazioni',
            }),
            e.jsxs('div', {
              className: 'grid sm:grid-cols-3 gap-4 text-sm',
              children: [
                e.jsxs('div', {
                  className: 'text-center',
                  children: [
                    e.jsx('div', {
                      className: 'text-2xl font-bold text-emerald-600',
                      children: a.length,
                    }),
                    e.jsx('div', { className: o.subtext, children: 'Campi Totali' }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'text-center',
                  children: [
                    e.jsx('div', {
                      className: 'text-2xl font-bold text-blue-600',
                      children: a.reduce((n, u) => n + (u.timeSlots || []).length, 0),
                    }),
                    e.jsx('div', { className: o.subtext, children: 'Fasce Configurate' }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'text-center',
                  children: [
                    e.jsx('div', {
                      className: 'text-2xl font-bold text-yellow-600',
                      children: a.reduce(
                        (n, u) => n + (u.timeSlots || []).filter((c) => c.isPromo).length,
                        0
                      ),
                    }),
                    e.jsx('div', { className: o.subtext, children: 'Fasce Promo' }),
                  ],
                }),
              ],
            }),
          ],
        }),
    ],
  });
}
function W({
  state: a,
  setState: i,
  derived: o,
  leagueId: t,
  setLeagueId: m,
  clubMode: d,
  setClubMode: h,
  T: s,
}) {
  const [n, u] = w.useState('');
  F();
  const [c, g] = $.useState(''),
    [b, v] = $.useState(() => {
      try {
        return sessionStorage.getItem('ml-extra-unlocked') === '1';
      } catch {
        return !1;
      }
    }),
    [P, B] = $.useState(''),
    E = (r) => {
      i((x) => ({ ...x, courts: r }));
    },
    k = a?.bookingConfig || z(),
    [j, f] = $.useState(() => ({ ...k }));
  if (
    ($.useEffect(() => {
      f((r) => {
        try {
          const x = JSON.stringify(r),
            y = JSON.stringify(k);
          return x === y ? { ...k } : r;
        } catch {
          return r;
        }
      });
    }, [a?.bookingConfig]),
    !a)
  )
    return e.jsx(L, {
      title: 'Extra – Impostazioni',
      T: s,
      children: e.jsxs('div', {
        className: 'text-center py-8',
        children: [
          e.jsx('div', { className: 'text-2xl mb-2', children: '⏳' }),
          e.jsx('div', { className: `text-sm ${s.subtext}`, children: 'Caricamento in corso...' }),
        ],
      }),
    });
  const l = (r) => {
      if ((r?.preventDefault?.(), c === 'Paris2025')) {
        v(!0);
        try {
          sessionStorage.setItem('ml-extra-unlocked', '1');
        } catch {}
      } else alert('Password errata');
    },
    p = () => {
      (v(!1), g(''));
      try {
        sessionStorage.removeItem('ml-extra-unlocked');
      } catch {}
    },
    N = () => {
      let r = j.defaultDurations;
      typeof r == 'string' &&
        (r = r
          .split(',')
          .map((y) => Number(y.trim()))
          .filter((y) => !Number.isNaN(y) && y > 0));
      const x = {
        ...j,
        slotMinutes: Math.max(5, Number(j.slotMinutes) || 30),
        dayStartHour: Math.min(23, Math.max(0, Number(j.dayStartHour) || 8)),
        dayEndHour: Math.min(24, Math.max(1, Number(j.dayEndHour) || 23)),
        defaultDurations: r && r.length ? r : [60, 90, 120],
      };
      (i((y) => ({ ...y, bookingConfig: x })), alert('Parametri salvati!'));
    },
    C = () => f(z());
  j.pricing || z().pricing;
  const S = j.addons || z().addons;
  return e.jsxs(L, {
    title: 'Extra – Impostazioni',
    T: s,
    children: [
      b
        ? e.jsx('div', {
            className: `rounded-2xl ${s.cardBg} ${s.border} p-4 mb-6`,
            children: e.jsxs('div', {
              className: 'flex flex-col gap-4',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center gap-3',
                  children: [
                    e.jsx('span', { className: 'text-2xl', children: '🎛️' }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('div', {
                          className: 'font-semibold text-lg',
                          children: 'Modalità Circolo',
                        }),
                        e.jsx('div', {
                          className: `text-sm ${s.subtext}`,
                          children: d
                            ? '✅ Attiva — le tab amministrative sono visibili'
                            : '❌ Disattiva — solo Classifica e Statistiche sono visibili',
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx('div', {
                  className: 'flex flex-col sm:flex-row gap-3',
                  children: d
                    ? e.jsx('button', {
                        type: 'button',
                        className: `${s.btnGhost} flex-1 sm:flex-none`,
                        onClick: () => h(!1),
                        children: '🔒 Disattiva Modalità Circolo',
                      })
                    : e.jsx('button', {
                        type: 'button',
                        className: `${s.btnPrimary} flex-1 sm:flex-none`,
                        onClick: () => h(!0),
                        children: '🚀 Attiva Modalità Circolo',
                      }),
                }),
              ],
            }),
          })
        : e.jsx('div', {
            className: `rounded-2xl ${s.cardBg} ${s.border} p-4 mb-6`,
            children: e.jsxs('div', {
              className: 'text-center',
              children: [
                e.jsx('div', { className: 'text-4xl mb-2', children: '🔐' }),
                e.jsx('div', { className: 'font-semibold mb-2', children: 'Modalità Circolo' }),
                e.jsx('div', {
                  className: `text-sm ${s.subtext}`,
                  children:
                    'Sblocca il pannello per gestire la Modalità Circolo e altre impostazioni avanzate.',
                }),
              ],
            }),
          }),
      b
        ? e.jsxs(e.Fragment, {
            children: [
              e.jsx('div', {
                className: `rounded-2xl ${s.cardBg} ${s.border} p-4 mb-6`,
                children: e.jsxs('div', {
                  className: 'flex flex-col sm:flex-row sm:items-center justify-between gap-4',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-3',
                      children: [
                        e.jsx('span', { className: 'text-2xl', children: '✅' }),
                        e.jsxs('div', {
                          children: [
                            e.jsx('div', {
                              className: 'font-semibold',
                              children: 'Pannello Sbloccato',
                            }),
                            e.jsx('div', {
                              className: `text-sm ${s.subtext}`,
                              children: 'Accesso completo alle impostazioni',
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsx('button', {
                      type: 'button',
                      className: `${s.btnGhost} w-full sm:w-auto`,
                      onClick: p,
                      children: '🔒 Blocca Pannello',
                    }),
                  ],
                }),
              }),
              e.jsx(G, { courts: a?.courts || [], onChange: E, T: s }),
              e.jsxs('div', {
                className: `rounded-2xl ${s.cardBg} ${s.border} p-3`,
                onKeyDown: (r) => {
                  r.key === 'Enter' && r.preventDefault();
                },
                children: [
                  e.jsx('div', {
                    className: 'font-medium mb-2',
                    children: 'Prenotazioni — Parametri',
                  }),
                  e.jsxs('div', {
                    className: 'grid sm:grid-cols-3 gap-3 mb-4',
                    children: [
                      e.jsxs('div', {
                        className: 'flex flex-col',
                        children: [
                          e.jsx('label', {
                            className: `text-xs ${s.subtext}`,
                            children: 'Minuti slot',
                          }),
                          e.jsx('input', {
                            type: 'number',
                            value: j.slotMinutes,
                            onChange: (r) =>
                              f((x) => ({ ...x, slotMinutes: Number(r.target.value) })),
                            className: s.input,
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        className: 'flex flex-col',
                        children: [
                          e.jsx('label', {
                            className: `text-xs ${s.subtext}`,
                            children: 'Apertura (ora)',
                          }),
                          e.jsx('input', {
                            type: 'number',
                            value: j.dayStartHour,
                            onChange: (r) =>
                              f((x) => ({ ...x, dayStartHour: Number(r.target.value) })),
                            className: s.input,
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        className: 'flex flex-col',
                        children: [
                          e.jsx('label', {
                            className: `text-xs ${s.subtext}`,
                            children: 'Chiusura (ora)',
                          }),
                          e.jsx('input', {
                            type: 'number',
                            value: j.dayEndHour,
                            onChange: (r) =>
                              f((x) => ({ ...x, dayEndHour: Number(r.target.value) })),
                            className: s.input,
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'mt-4 rounded-xl p-3 border border-white/10',
                    children: [
                      e.jsx('div', {
                        className: 'font-medium mb-2',
                        children: 'Opzioni per prenotazione (costo fisso)',
                      }),
                      e.jsxs('div', {
                        className: 'grid sm:grid-cols-2 gap-3',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx('input', {
                                id: 'cfg-lighting-enabled',
                                type: 'checkbox',
                                checked: !!S.lightingEnabled,
                                onChange: (r) =>
                                  f((x) => ({
                                    ...x,
                                    addons: { ...x.addons, lightingEnabled: r.target.checked },
                                  })),
                              }),
                              e.jsx('label', {
                                htmlFor: 'cfg-lighting-enabled',
                                className: 'cursor-pointer',
                                children: 'Abilita Illuminazione',
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx('span', {
                                className: `text-xs ${s.subtext}`,
                                children: 'Costo Illuminazione',
                              }),
                              e.jsx('input', {
                                type: 'number',
                                className: `${s.input} w-28`,
                                value: S.lightingFee || 0,
                                onChange: (r) =>
                                  f((x) => ({
                                    ...x,
                                    addons: {
                                      ...x.addons,
                                      lightingFee: Number(r.target.value) || 0,
                                    },
                                  })),
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx('input', {
                                id: 'cfg-heating-enabled',
                                type: 'checkbox',
                                checked: !!S.heatingEnabled,
                                onChange: (r) =>
                                  f((x) => ({
                                    ...x,
                                    addons: { ...x.addons, heatingEnabled: r.target.checked },
                                  })),
                              }),
                              e.jsx('label', {
                                htmlFor: 'cfg-heating-enabled',
                                className: 'cursor-pointer',
                                children: 'Abilita Riscaldamento',
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx('span', {
                                className: `text-xs ${s.subtext}`,
                                children: 'Costo Riscaldamento',
                              }),
                              e.jsx('input', {
                                type: 'number',
                                className: `${s.input} w-28`,
                                value: S.heatingFee || 0,
                                onChange: (r) =>
                                  f((x) => ({
                                    ...x,
                                    addons: {
                                      ...x.addons,
                                      heatingFee: Number(r.target.value) || 0,
                                    },
                                  })),
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        className: `text-xs ${s.subtext} mt-2`,
                        children: [
                          'Nota: l’',
                          e.jsx('b', { children: 'Illuminazione' }),
                          ' e il ',
                          e.jsx('b', { children: 'Riscaldamento' }),
                          ' sono opzioni per prenotazione (prezzo fisso, non a tempo).',
                        ],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'mt-3 flex gap-2',
                    children: [
                      e.jsx('button', {
                        type: 'button',
                        className: s.btnPrimary,
                        onClick: N,
                        children: 'Salva parametri',
                      }),
                      e.jsx('button', {
                        type: 'button',
                        className: s.btnGhost,
                        onClick: C,
                        children: 'Ripristina default',
                      }),
                    ],
                  }),
                ],
              }),
              e.jsx(V, { T: s, leagueId: t, setState: i, cloudMsg: n, setCloudMsg: u }),
              e.jsxs('div', {
                className: `text-xs ${s.subtext} mt-3`,
                children: [
                  'I dati sono salvati ',
                  e.jsx('b', { children: 'in locale' }),
                  ' (localStorage) e, se configurato,',
                  ' ',
                  e.jsx('b', { children: 'anche su Firestore' }),
                  ' nel documento ',
                  e.jsxs('code', { children: ['leagues/', t] }),
                  '.',
                ],
              }),
            ],
          })
        : e.jsx('div', {
            className: `rounded-2xl ${s.cardBg} ${s.border} p-4 mb-6`,
            children: e.jsxs('form', {
              onSubmit: l,
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `text-sm font-medium ${s.text} mb-2 block`,
                      children: '🔑 Password Amministratore',
                    }),
                    e.jsx('input', {
                      type: 'password',
                      value: c,
                      onChange: (r) => g(r.target.value),
                      placeholder: 'Inserisci password',
                      className: `${s.input} w-full`,
                    }),
                    e.jsx('div', {
                      className: `text-xs ${s.subtext} mt-1`,
                      children: "Contatta l'amministratore per la password",
                    }),
                  ],
                }),
                e.jsx('div', {
                  className: 'flex flex-col sm:flex-row gap-3',
                  children: e.jsx('button', {
                    type: 'submit',
                    className: `${s.btnPrimary} flex-1`,
                    children: '🔓 Sblocca Pannello',
                  }),
                }),
              ],
            }),
          }),
    ],
  });
}
function V({ T: a, leagueId: i, setState: o, cloudMsg: t, setCloudMsg: m }) {
  const [d, h] = w.useState([]),
    [s, n] = w.useState(''),
    [u, c] = w.useState(!1),
    [g, b] = w.useState(''),
    [v, P] = w.useState(() => {
      try {
        return sessionStorage.getItem('ml-cloud-unlocked') === '1';
      } catch {
        return !1;
      }
    }),
    B = (l) => {
      if ((l?.preventDefault?.(), g === 'ParisAdmin85')) {
        P(!0);
        try {
          sessionStorage.setItem('ml-cloud-unlocked', '1');
        } catch {}
      } else alert('Password cloud errata');
    },
    E = () => {
      (P(!1), b(''));
      try {
        sessionStorage.removeItem('ml-cloud-unlocked');
      } catch {}
    };
  async function k() {
    c(!0);
    try {
      const { listLeagues: l } = await A(
          async () => {
            const { listLeagues: N } = await import('./index-mfh4d38h-CPKWh84w.js').then(
              (C) => C.x
            );
            return { listLeagues: N };
          },
          __vite__mapDeps([0, 1, 2, 3, 4])
        ),
        p = await l();
      (h(p), m(`✅ Trovati ${p.length} backup su Firebase`));
    } catch (l) {
      m(`❌ Errore caricamento lista backup: ${l?.message || l}`);
    } finally {
      c(!1);
    }
  }
  async function j() {
    try {
      const { saveLeague: l } = await A(
          async () => {
            const { saveLeague: N } = await import('./index-mfh4d38h-CPKWh84w.js').then((C) => C.x);
            return { saveLeague: N };
          },
          __vite__mapDeps([0, 1, 2, 3, 4])
        ),
        p = JSON.parse(localStorage.getItem('ml-persist') || '{}');
      (await l(i, { ...p, _updatedAt: Date.now() }),
        m(`✅ Salvato su cloud: leagues/${i}`),
        d.length > 0 && k());
    } catch (l) {
      m(`❌ Errore salvataggio: ${l?.message || l}`);
    }
  }
  async function f() {
    const l = s || i;
    try {
      const { loadLeague: p } = await A(
          async () => {
            const { loadLeague: C } = await import('./index-mfh4d38h-CPKWh84w.js').then((S) => S.x);
            return { loadLeague: C };
          },
          __vite__mapDeps([0, 1, 2, 3, 4])
        ),
        N = await p(l);
      N && typeof N == 'object'
        ? (o(N), m(`✅ Caricato dal cloud: leagues/${l}`))
        : m('⚠️ Documento non trovato sul cloud');
    } catch (p) {
      m(`❌ Errore caricamento: ${p?.message || p}`);
    }
  }
  return e.jsx('div', {
    className: `rounded-2xl ${a.cardBg} ${a.border} p-4 mb-6`,
    children: v
      ? e.jsxs(e.Fragment, {
          children: [
            e.jsxs('div', {
              className: 'font-semibold mb-4 flex items-center justify-between',
              children: [
                e.jsx('span', {
                  className: 'flex items-center gap-2',
                  children: '☁️ Backup Cloud (Firebase)',
                }),
                e.jsxs('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx('button', {
                      type: 'button',
                      className: `${a.btnGhost} text-xs`,
                      onClick: k,
                      disabled: u,
                      children: u ? '⏳ Caricando...' : '🔄 Aggiorna Lista',
                    }),
                    e.jsx('button', {
                      type: 'button',
                      className: `${a.btnGhost} text-xs`,
                      onClick: E,
                      children: '🔒 Blocca',
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'space-y-4',
              children: [
                t &&
                  e.jsx('div', {
                    className: `p-3 rounded-xl text-sm ${t.includes('❌') ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' : t.includes('⚠️') ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200' : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'}`,
                    children: t,
                  }),
                d.length > 0 &&
                  e.jsxs('div', {
                    className: 'space-y-2',
                    children: [
                      e.jsx('label', {
                        className: `text-sm font-medium ${a.text}`,
                        children: '📋 Seleziona Backup da Caricare:',
                      }),
                      e.jsxs('select', {
                        value: s,
                        onChange: (l) => n(l.target.value),
                        className: `${a.input} w-full`,
                        children: [
                          e.jsxs('option', {
                            value: '',
                            children: ['🔄 Usa League ID corrente (', i, ')'],
                          }),
                          d.map((l) =>
                            e.jsxs(
                              'option',
                              {
                                value: l.id,
                                children: [
                                  '📁 ',
                                  l.id,
                                  ' - ',
                                  l.players,
                                  ' giocatori, ',
                                  l.matches,
                                  ' partite',
                                  l.lastUpdated !== 'N/A' && ` (${l.lastUpdated})`,
                                ],
                              },
                              l.id
                            )
                          ),
                        ],
                      }),
                    ],
                  }),
                e.jsxs('div', {
                  className: 'grid sm:grid-cols-3 gap-3',
                  children: [
                    e.jsxs('button', {
                      type: 'button',
                      className: `${a.btnSecondary} flex items-center justify-center gap-2`,
                      onClick: k,
                      disabled: u,
                      children: ['📋 ', u ? 'Caricando...' : 'Lista Backup'],
                    }),
                    e.jsx('button', {
                      type: 'button',
                      className: `${a.btnPrimary} flex items-center justify-center gap-2`,
                      onClick: j,
                      children: '⬆️ Salva su Cloud',
                    }),
                    e.jsxs('button', {
                      type: 'button',
                      className: `${a.btnGhost} flex items-center justify-center gap-2`,
                      onClick: f,
                      children: ['⬇️ Carica ', s ? 'Selezionato' : 'Corrente'],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: `text-xs ${a.subtext} space-y-1`,
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('b', { children: 'League ID Corrente:' }),
                        ' ',
                        e.jsx('code', {
                          className: 'bg-gray-100 dark:bg-gray-800 px-1 rounded',
                          children: i,
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('b', { children: 'Backup Selezionato:' }),
                        ' ',
                        e.jsx('code', {
                          className: 'bg-gray-100 dark:bg-gray-800 px-1 rounded',
                          children: s || i,
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('b', { children: 'Firebase Project:' }),
                        ' ',
                        e.jsx('code', {
                          className: 'bg-gray-100 dark:bg-gray-800 px-1 rounded',
                          children: 'm-padelweb',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: `${a.card} ${a.space} space-y-4`,
              children: [
                e.jsx('h3', {
                  className: `text-lg font-bold ${a.text} flex items-center gap-2`,
                  children: '📱 Test Funzionalità Native',
                }),
                e.jsx('div', {
                  className: 'p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20',
                  children: e.jsxs('div', {
                    className: 'text-sm text-gray-600 dark:text-gray-300 space-y-2',
                    children: [
                      e.jsxs('p', {
                        children: [e.jsx('b', { children: 'Piattaforma:' }), ' Web Browser'],
                      }),
                      e.jsxs('p', {
                        children: [e.jsx('b', { children: 'Ambiente:' }), ' 🌐 Applicazione Web'],
                      }),
                      e.jsxs('p', {
                        children: [e.jsx('b', { children: 'Tipo:' }), ' Progressive Web App (PWA)'],
                      }),
                    ],
                  }),
                }),
                e.jsxs('div', {
                  className: 'space-y-3',
                  children: [
                    e.jsx('button', {
                      onClick: () => navigate('/native-test'),
                      className: `${a.btnPrimary} w-full flex items-center justify-center gap-2`,
                      children: '🧪 Apri Pagina Test Native',
                    }),
                    e.jsxs('div', {
                      className: `text-xs ${a.subtext} space-y-1`,
                      children: [
                        e.jsx('p', {
                          children: e.jsx('b', { children: 'Funzionalità Testabili:' }),
                        }),
                        e.jsxs('ul', {
                          className: 'list-disc list-inside ml-4 space-y-1',
                          children: [
                            e.jsx('li', { children: '📍 GPS e Geolocalizzazione' }),
                            e.jsx('li', { children: '🔔 Notifiche Push e Locali' }),
                            e.jsx('li', { children: '📤 Condivisione Nativa' }),
                            e.jsx('li', { children: '📱 Informazioni Piattaforma' }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: `${a.card} ${a.space} space-y-4`,
              children: [
                e.jsx('h3', {
                  className: `text-lg font-bold ${a.text} flex items-center gap-2`,
                  children: '🔄 Controllo Aggiornamenti',
                }),
                e.jsx('div', {
                  className: 'p-4 rounded-lg bg-green-50 dark:bg-green-900/20',
                  children: e.jsxs('div', {
                    className: 'text-sm text-gray-600 dark:text-gray-300 space-y-2',
                    children: [
                      e.jsxs('p', {
                        children: [
                          e.jsx('b', { children: 'Versione App:' }),
                          ' v1.7.0 (2025-09-12)',
                        ],
                      }),
                      e.jsxs('p', {
                        children: [
                          e.jsx('b', { children: 'Cache Status:' }),
                          ' Gestione automatica attiva',
                        ],
                      }),
                      e.jsxs('p', {
                        children: [
                          e.jsx('b', { children: 'Service Worker:' }),
                          ' Cache busting abilitato',
                        ],
                      }),
                    ],
                  }),
                }),
                e.jsxs('div', {
                  className: 'space-y-3',
                  children: [
                    e.jsx('button', {
                      onClick: async () => {
                        try {
                          const { default: l } = await A(
                            async () => {
                              const { default: p } = await import(
                                './index-mfh4d38h-CPKWh84w.js'
                              ).then((N) => N.y);
                              return { default: p };
                            },
                            __vite__mapDeps([0, 1, 2, 3, 4])
                          );
                          await l.forceUpdate();
                        } catch (l) {
                          alert("Errore durante l'aggiornamento: " + l.message);
                        }
                      },
                      className: `${a.btnSecondary} w-full flex items-center justify-center gap-2`,
                      children: '🔄 Forza Aggiornamento App',
                    }),
                    e.jsx('button', {
                      onClick: async () => {
                        try {
                          if ('caches' in window) {
                            const l = await caches.keys();
                            (await Promise.all(l.map((p) => caches.delete(p))),
                              alert(
                                '✅ Cache PWA cancellata! Ricarica per scaricare la versione più recente.'
                              ));
                          } else alert('Cache API non supportata in questo browser');
                        } catch (l) {
                          alert('Errore durante la cancellazione cache: ' + l.message);
                        }
                      },
                      className: `${a.btnDanger} w-full flex items-center justify-center gap-2`,
                      children: '🗑️ Cancella Cache PWA',
                    }),
                    e.jsxs('div', {
                      className:
                        'text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded',
                      children: [
                        e.jsx('p', {
                          children: e.jsx('b', { children: 'Per problemi di cache mobile:' }),
                        }),
                        e.jsx('p', {
                          children: '1. Usa "Forza Aggiornamento App" per aggiornamento automatico',
                        }),
                        e.jsx('p', {
                          children: '2. Se non funziona, usa "Cancella Cache PWA" e ricarica',
                        }),
                        e.jsx('p', {
                          children: '3. Su iOS: Impostazioni → Safari → Cancella Cronologia',
                        }),
                        e.jsx('p', {
                          children:
                            '4. Su Android: Browser → Impostazioni → Storage → Cancella Dati',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      : e.jsxs(e.Fragment, {
          children: [
            e.jsx('div', {
              className: 'font-semibold mb-4 flex items-center gap-2',
              children: '🔒 Backup Cloud (Firebase) - Accesso Limitato',
            }),
            e.jsxs('div', {
              className: 'text-center',
              children: [
                e.jsx('div', { className: 'text-4xl mb-2', children: '🔐' }),
                e.jsx('div', {
                  className: 'font-semibold mb-2',
                  children: 'Pannello Cloud Protetto',
                }),
                e.jsx('div', {
                  className: `text-sm ${a.subtext} mb-4`,
                  children: 'Inserisci la password amministratore per accedere ai backup Firebase',
                }),
              ],
            }),
            e.jsxs('form', {
              onSubmit: B,
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `text-sm font-medium ${a.text} mb-2 block`,
                      children: '🔑 Password Cloud',
                    }),
                    e.jsx('input', {
                      type: 'password',
                      value: g,
                      onChange: (l) => b(l.target.value),
                      placeholder: 'Password amministratore cloud',
                      className: `${a.input} w-full`,
                    }),
                  ],
                }),
                e.jsx('div', {
                  className: 'flex gap-3',
                  children: e.jsx('button', {
                    type: 'submit',
                    className: `${a.btnPrimary} flex-1`,
                    children: '🔓 Sblocca Cloud',
                  }),
                }),
              ],
            }),
          ],
        }),
  });
}
function Y() {
  const { state: a, setState: i, derived: o, leagueId: t, setLeagueId: m } = D(),
    { clubMode: d, setClubMode: h } = I(),
    s = w.useMemo(() => _(), []);
  return e.jsx(W, {
    T: s,
    state: a,
    setState: i,
    derived: o,
    leagueId: t,
    setLeagueId: m,
    clubMode: d,
    setClubMode: h,
  });
}
export { Y as default };
