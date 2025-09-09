const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/index-mfcpc59i-PpofX80g.js',
      'assets/vendor-mfcpc59i-D3F3s8fL.js',
      'assets/router-mfcpc59i-D7zFZhMN.js',
      'assets/firebase-mfcpc59i-BteSMG94.js',
      'assets/index-mfcpcauj-BBYtpoEP.css',
    ])
) => i.map((i) => d[i]);
import { j as e, p as z, _ as A } from './index-mfcpc59i-PpofX80g.js';
import { r as k, b as S, c as D } from './router-mfcpc59i-D7zFZhMN.js';
import { S as L } from './Section-mfcpc59i-BMO9MkVE.js';
import { e as F } from './format-mfcpc59i-DAEZv7Mi.js';
function _({ value: a = [], onChange: r, T: o }) {
  const t = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
    x = (d) => {
      const h = a.includes(d);
      r(h ? a.filter((s) => s !== d) : [...a, d].sort((s, i) => s - i));
    };
  return e.jsx('div', {
    className: 'flex flex-wrap gap-1',
    children: t.map((d, h) =>
      e.jsx(
        'button',
        {
          type: 'button',
          onClick: () => x(h),
          className: `px-2 h-6 rounded-md text-xs ring-1 transition-all ${a.includes(h) ? 'bg-emerald-500 text-black ring-emerald-500/60' : `${o.ghostRing} ${o.cardBg}`}`,
          children: d,
        },
        h
      )
    ),
  });
}
function I({ slot: a, onUpdate: r, onRemove: o, T: t }) {
  const x = (s) => String(s).padStart(2, '0'),
    d = (s = '09:00') => {
      const i = /^(\d{1,2}):(\d{2})$/.exec(String(s).trim());
      if (!i) return '09:00';
      const u = Math.min(23, Math.max(0, Number(i[1] || 0))),
        n = Math.min(59, Math.max(0, Number(i[2] || 0)));
      return `${x(u)}:${x(n)}`;
    },
    h = (s) => {
      const i = (Number(s) || 0) * 1.5;
      return F(i / 4);
    };
  return e.jsxs('div', {
    className: `relative rounded-lg p-3 ${t.name === 'dark' ? `${t.cardBg} ${t.border}` : 'bg-emerald-50/50 ring-1 ring-emerald-200'}`,
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
                        onChange: (s) => r({ label: s.target.value }),
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
                        onChange: (s) => r({ eurPerHour: Number(s.target.value) || 0 }),
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
                        onChange: (s) => r({ from: d(s.target.value) }),
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
                        onChange: (s) => r({ to: d(s.target.value) }),
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
                  e.jsx(_, {
                    value: Array.isArray(a.days) ? a.days : [],
                    onChange: (s) => r({ days: s }),
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
                    onChange: (s) => r({ isPromo: s.target.checked }),
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
                            'ml-1 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded',
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
              className: `flex-shrink-0 p-3 rounded-lg ring-1 bg-emerald-100/50 ${t.border} text-center`,
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
function H({ court: a, onUpdate: r, onRemove: o, T: t }) {
  const [x, d] = k.useState(!1),
    h = () => {
      const n = {
        id: Date.now().toString(),
        label: 'Nuova fascia',
        eurPerHour: 25,
        from: '08:00',
        to: '12:00',
        days: [1, 2, 3, 4, 5],
      };
      r({ timeSlots: [...(a.timeSlots || []), n] });
    },
    s = (n, g) => {
      const p = (a.timeSlots || []).map((f, P) => (P === n ? { ...f, ...g } : f));
      r({ timeSlots: p });
    },
    i = (n) => {
      const g = (a.timeSlots || []).filter((p, f) => f !== n);
      r({ timeSlots: g });
    },
    u = () => {
      r({ hasHeating: !a.hasHeating });
    };
  return e.jsxs('div', {
    className: `rounded-xl ${t.border} ${t.cardBg} overflow-hidden transition-all`,
    children: [
      e.jsx('div', {
        className:
          'p-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors',
        onClick: () => d(!x),
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
                              'ml-1 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded',
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
                  className: `text-sm px-3 py-1 rounded transition-all ${x ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`,
                  onClick: (n) => {
                    (n.stopPropagation(), d(!x));
                  },
                  children: x ? '📝 Chiudi' : '⚙️ Configura',
                }),
                e.jsx('button', {
                  type: 'button',
                  className:
                    'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded text-sm transition-colors',
                  onClick: (n) => {
                    (n.stopPropagation(), o());
                  },
                  children: '🗑️',
                }),
              ],
            }),
          ],
        }),
      }),
      x &&
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
                          onChange: (n) => r({ name: n.target.value }),
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
                      : (a.timeSlots || []).map((n, g) =>
                          e.jsx(
                            I,
                            { slot: n, onUpdate: (p) => s(g, p), onRemove: () => i(g), T: t },
                            n.id || g
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
function R({ courts: a = [], onChange: r, T: o }) {
  const [t, x] = k.useState(''),
    d = () => {
      if (!t.trim()) return;
      const i = { id: Date.now().toString(), name: t.trim(), hasHeating: !1, timeSlots: [] };
      (r([...a, i]), x(''));
    },
    h = (i, u) => {
      const n = a.map((g, p) => (p === i ? { ...g, ...u } : g));
      r(n);
    },
    s = (i) => {
      confirm(
        'Rimuovere il campo? Tutte le configurazioni e prenotazioni collegate saranno perse.'
      ) && r(a.filter((u, n) => n !== i));
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
                  onChange: (i) => x(i.target.value),
                  onKeyDown: (i) => i.key === 'Enter' && d(),
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
            : a.map((i, u) =>
                e.jsx(
                  H,
                  { court: i, onUpdate: (n) => h(u, n), onRemove: () => s(u), T: o },
                  i.id || u
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
                      children: a.reduce((i, u) => i + (u.timeSlots || []).length, 0),
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
                        (i, u) => i + (u.timeSlots || []).filter((n) => n.isPromo).length,
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
  setState: r,
  derived: o,
  leagueId: t,
  setLeagueId: x,
  clubMode: d,
  setClubMode: h,
  T: s,
}) {
  const [i, u] = S.useState('');
  D();
  const [n, g] = k.useState(''),
    [p, f] = k.useState(() => {
      try {
        return sessionStorage.getItem('ml-extra-unlocked') === '1';
      } catch {
        return !1;
      }
    }),
    [P, B] = k.useState(''),
    E = (l) => {
      r((m) => ({ ...m, courts: l }));
    },
    C = a?.bookingConfig || z(),
    [b, j] = k.useState(() => ({ ...C }));
  if (
    (k.useEffect(() => {
      j((l) => {
        try {
          const m = JSON.stringify(l),
            y = JSON.stringify(C);
          return m === y ? { ...C } : l;
        } catch {
          return l;
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
  const c = (l) => {
      if ((l?.preventDefault?.(), n === 'Paris2025')) {
        f(!0);
        try {
          sessionStorage.setItem('ml-extra-unlocked', '1');
        } catch {}
      } else alert('Password errata');
    },
    N = () => {
      (f(!1), g(''));
      try {
        sessionStorage.removeItem('ml-extra-unlocked');
      } catch {}
    },
    v = () => {
      let l = b.defaultDurations;
      typeof l == 'string' &&
        (l = l
          .split(',')
          .map((y) => Number(y.trim()))
          .filter((y) => !Number.isNaN(y) && y > 0));
      const m = {
        ...b,
        slotMinutes: Math.max(5, Number(b.slotMinutes) || 30),
        dayStartHour: Math.min(23, Math.max(0, Number(b.dayStartHour) || 8)),
        dayEndHour: Math.min(24, Math.max(1, Number(b.dayEndHour) || 23)),
        defaultDurations: l && l.length ? l : [60, 90, 120],
      };
      (r((y) => ({ ...y, bookingConfig: m })), alert('Parametri salvati!'));
    },
    $ = () => j(z());
  b.pricing || z().pricing;
  const w = b.addons || z().addons;
  return e.jsxs(L, {
    title: 'Extra – Impostazioni',
    T: s,
    children: [
      p
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
      p
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
                      onClick: N,
                      children: '🔒 Blocca Pannello',
                    }),
                  ],
                }),
              }),
              e.jsx(R, { courts: a?.courts || [], onChange: E, T: s }),
              e.jsxs('div', {
                className: `rounded-2xl ${s.cardBg} ${s.border} p-3`,
                onKeyDown: (l) => {
                  l.key === 'Enter' && l.preventDefault();
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
                            value: b.slotMinutes,
                            onChange: (l) =>
                              j((m) => ({ ...m, slotMinutes: Number(l.target.value) })),
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
                            value: b.dayStartHour,
                            onChange: (l) =>
                              j((m) => ({ ...m, dayStartHour: Number(l.target.value) })),
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
                            value: b.dayEndHour,
                            onChange: (l) =>
                              j((m) => ({ ...m, dayEndHour: Number(l.target.value) })),
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
                                checked: !!w.lightingEnabled,
                                onChange: (l) =>
                                  j((m) => ({
                                    ...m,
                                    addons: { ...m.addons, lightingEnabled: l.target.checked },
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
                                value: w.lightingFee || 0,
                                onChange: (l) =>
                                  j((m) => ({
                                    ...m,
                                    addons: {
                                      ...m.addons,
                                      lightingFee: Number(l.target.value) || 0,
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
                                checked: !!w.heatingEnabled,
                                onChange: (l) =>
                                  j((m) => ({
                                    ...m,
                                    addons: { ...m.addons, heatingEnabled: l.target.checked },
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
                                value: w.heatingFee || 0,
                                onChange: (l) =>
                                  j((m) => ({
                                    ...m,
                                    addons: {
                                      ...m.addons,
                                      heatingFee: Number(l.target.value) || 0,
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
                        onClick: v,
                        children: 'Salva parametri',
                      }),
                      e.jsx('button', {
                        type: 'button',
                        className: s.btnGhost,
                        onClick: $,
                        children: 'Ripristina default',
                      }),
                    ],
                  }),
                ],
              }),
              e.jsx(M, { T: s, leagueId: t, setState: r, cloudMsg: i, setCloudMsg: u }),
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
              onSubmit: c,
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
                      value: n,
                      onChange: (l) => g(l.target.value),
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
function M({ T: a, leagueId: r, setState: o, cloudMsg: t, setCloudMsg: x }) {
  const [d, h] = S.useState([]),
    [s, i] = S.useState(''),
    [u, n] = S.useState(!1),
    [g, p] = S.useState(''),
    [f, P] = S.useState(() => {
      try {
        return sessionStorage.getItem('ml-cloud-unlocked') === '1';
      } catch {
        return !1;
      }
    }),
    B = (c) => {
      if ((c?.preventDefault?.(), g === 'ParisAdmin85')) {
        P(!0);
        try {
          sessionStorage.setItem('ml-cloud-unlocked', '1');
        } catch {}
      } else alert('Password cloud errata');
    },
    E = () => {
      (P(!1), p(''));
      try {
        sessionStorage.removeItem('ml-cloud-unlocked');
      } catch {}
    };
  async function C() {
    n(!0);
    try {
      const { listLeagues: c } = await A(
          async () => {
            const { listLeagues: v } = await import('./index-mfcpc59i-PpofX80g.js').then(
              ($) => $.w
            );
            return { listLeagues: v };
          },
          __vite__mapDeps([0, 1, 2, 3, 4])
        ),
        N = await c();
      (h(N), x(`✅ Trovati ${N.length} backup su Firebase`));
    } catch (c) {
      x(`❌ Errore caricamento lista backup: ${c?.message || c}`);
    } finally {
      n(!1);
    }
  }
  async function b() {
    try {
      const { saveLeague: c } = await A(
          async () => {
            const { saveLeague: v } = await import('./index-mfcpc59i-PpofX80g.js').then(($) => $.w);
            return { saveLeague: v };
          },
          __vite__mapDeps([0, 1, 2, 3, 4])
        ),
        N = JSON.parse(localStorage.getItem('ml-persist') || '{}');
      (await c(r, { ...N, _updatedAt: Date.now() }),
        x(`✅ Salvato su cloud: leagues/${r}`),
        d.length > 0 && C());
    } catch (c) {
      x(`❌ Errore salvataggio: ${c?.message || c}`);
    }
  }
  async function j() {
    const c = s || r;
    try {
      const { loadLeague: N } = await A(
          async () => {
            const { loadLeague: $ } = await import('./index-mfcpc59i-PpofX80g.js').then((w) => w.w);
            return { loadLeague: $ };
          },
          __vite__mapDeps([0, 1, 2, 3, 4])
        ),
        v = await N(c);
      v && typeof v == 'object'
        ? (o(v), x(`✅ Caricato dal cloud: leagues/${c}`))
        : x('⚠️ Documento non trovato sul cloud');
    } catch (N) {
      x(`❌ Errore caricamento: ${N?.message || N}`);
    }
  }
  return e.jsx('div', {
    className: `rounded-2xl ${a.cardBg} ${a.border} p-4 mb-6`,
    children: f
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
                      onClick: C,
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
                        onChange: (c) => i(c.target.value),
                        className: `${a.input} w-full`,
                        children: [
                          e.jsxs('option', {
                            value: '',
                            children: ['🔄 Usa League ID corrente (', r, ')'],
                          }),
                          d.map((c) =>
                            e.jsxs(
                              'option',
                              {
                                value: c.id,
                                children: [
                                  '📁 ',
                                  c.id,
                                  ' - ',
                                  c.players,
                                  ' giocatori, ',
                                  c.matches,
                                  ' partite',
                                  c.lastUpdated !== 'N/A' && ` (${c.lastUpdated})`,
                                ],
                              },
                              c.id
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
                      onClick: C,
                      disabled: u,
                      children: ['📋 ', u ? 'Caricando...' : 'Lista Backup'],
                    }),
                    e.jsx('button', {
                      type: 'button',
                      className: `${a.btnPrimary} flex items-center justify-center gap-2`,
                      onClick: b,
                      children: '⬆️ Salva su Cloud',
                    }),
                    e.jsxs('button', {
                      type: 'button',
                      className: `${a.btnGhost} flex items-center justify-center gap-2`,
                      onClick: j,
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
                          children: r,
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('b', { children: 'Backup Selezionato:' }),
                        ' ',
                        e.jsx('code', {
                          className: 'bg-gray-100 dark:bg-gray-800 px-1 rounded',
                          children: s || r,
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
                      onChange: (c) => p(c.target.value),
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
export { W as E };
