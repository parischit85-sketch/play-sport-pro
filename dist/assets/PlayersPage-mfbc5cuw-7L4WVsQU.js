import { D as l, j as e, i as k, f as C, k as R, t as A } from './index-mfbc5cuw-B5KdbvAg.js';
import { r as b, c as S, b as w } from './router-mfbc5cuw-tw9hraEf.js';
import { S as E } from './Section-mfbc5cuw-CH6um2i6.js';
import { b as F } from './names-mfbc5cuw-BW9lV2zG.js';
import './vendor-mfbc5cuw-D3F3s8fL.js';
import './firebase-mfbc5cuw-jcIpuiEY.js';
function P({ state: n, setState: c, onOpenStats: i, playersById: o, T: t }) {
  const [r, d] = b.useState(''),
    [x, p] = b.useState(''),
    [N, j] = b.useState(String(l)),
    y = Array.isArray(n?.players) ? n.players : [],
    m = b.useMemo(() => [...y].sort(F), [y]),
    v = () => {
      const s = r.trim(),
        a = x.trim();
      if (!s || !a) return;
      const h = `${s} ${a}`.trim(),
        u = Number(N || l) || l;
      (c((g) => {
        const $ = Array.isArray(g?.players) ? g.players : [];
        return {
          ...(g || { players: [], matches: [] }),
          players: [...$, { id: k(), name: h, baseRating: u, rating: u }],
        };
      }),
        d(''),
        p(''),
        j(String(l)));
    },
    f = (s) => {
      confirm('Rimuovere il giocatore?') &&
        c((a) => {
          const h = Array.isArray(a?.players) ? a.players : [];
          return { ...(a || { players: [], matches: [] }), players: h.filter((u) => u.id !== s) };
        });
    };
  return e.jsxs(E, {
    title: 'Giocatori',
    T: t,
    children: [
      e.jsxs('form', {
        onSubmit: (s) => {
          (s.preventDefault(), v());
        },
        className: 'space-y-3 mb-6',
        children: [
          e.jsxs('div', {
            className: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
            children: [
              e.jsxs('div', {
                className: 'flex flex-col',
                children: [
                  e.jsx('label', { className: `text-xs ${t.subtext} mb-1`, children: 'Nome' }),
                  e.jsx('input', {
                    value: r,
                    onChange: (s) => d(s.target.value),
                    placeholder: 'Nome',
                    className: `${t.input} w-full`,
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'flex flex-col',
                children: [
                  e.jsx('label', { className: `text-xs ${t.subtext} mb-1`, children: 'Cognome' }),
                  e.jsx('input', {
                    value: x,
                    onChange: (s) => p(s.target.value),
                    placeholder: 'Cognome',
                    className: `${t.input} w-full`,
                  }),
                ],
              }),
            ],
          }),
          e.jsxs('div', {
            className: 'flex flex-col sm:flex-row gap-3',
            children: [
              e.jsxs('div', {
                className: 'flex flex-col flex-1',
                children: [
                  e.jsx('label', {
                    className: `text-xs ${t.subtext} mb-1`,
                    children: 'Ranking iniziale',
                  }),
                  e.jsx('input', {
                    type: 'number',
                    value: N,
                    onChange: (s) => j(s.target.value),
                    className: `${t.input} w-full`,
                  }),
                ],
              }),
              e.jsx('div', {
                className: 'flex items-end',
                children: e.jsx('button', {
                  type: 'submit',
                  className: `${t.btnPrimary} w-full sm:w-auto px-6`,
                  children: 'Aggiungi Giocatore',
                }),
              }),
            ],
          }),
        ],
      }),
      e.jsx('div', {
        className: 'space-y-3',
        children:
          m.length === 0
            ? e.jsxs('div', {
                className: `text-center py-8 ${t.cardBg} ${t.border} rounded-xl`,
                children: [
                  e.jsx('div', { className: 'text-4xl mb-2', children: '👥' }),
                  e.jsx('div', {
                    className: `text-sm ${t.subtext}`,
                    children: 'Nessun giocatore presente.',
                  }),
                  e.jsx('div', {
                    className: `text-xs ${t.subtext} mt-1`,
                    children: 'Aggiungi il primo giocatore sopra per iniziare',
                  }),
                ],
              })
            : e.jsxs(e.Fragment, {
                children: [
                  e.jsx('div', {
                    className: 'block lg:hidden space-y-3',
                    children: m.map((s) => {
                      const a = o?.[s.id]?.rating ?? s.rating ?? l;
                      return e.jsxs(
                        'div',
                        {
                          className: `rounded-xl ${t.cardBg} ${t.border} p-4`,
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center justify-between mb-3',
                              children: [
                                e.jsx('button', {
                                  type: 'button',
                                  onClick: () => i?.(s.id),
                                  className:
                                    'font-semibold text-lg hover:opacity-80 transition truncate flex-1 text-left',
                                  children: s.name,
                                }),
                                e.jsxs('div', {
                                  className: 'text-right',
                                  children: [
                                    e.jsx('div', {
                                      className: 'font-bold text-blue-600 dark:text-blue-400',
                                      children: Number(a).toFixed(2),
                                    }),
                                    e.jsx('div', {
                                      className: `text-xs ${t.subtext}`,
                                      children: 'Ranking',
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            e.jsxs('div', {
                              className: 'flex gap-2',
                              children: [
                                e.jsx('button', {
                                  type: 'button',
                                  onClick: () => i?.(s.id),
                                  className: `${t.btnSecondary} flex-1 py-2 text-sm`,
                                  children: '📊 Statistiche',
                                }),
                                e.jsx('button', {
                                  type: 'button',
                                  onClick: () => f(s.id),
                                  className:
                                    'px-4 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors',
                                  children: '🗑️',
                                }),
                              ],
                            }),
                          ],
                        },
                        s.id
                      );
                    }),
                  }),
                  e.jsx('div', {
                    className: 'hidden lg:grid lg:grid-cols-2 gap-3',
                    children: m.map((s) => {
                      const a = o?.[s.id]?.rating ?? s.rating ?? l;
                      return e.jsxs(
                        'div',
                        {
                          className: `rounded-xl ${t.cardBg} ${t.border} p-3 flex items-center justify-between`,
                          children: [
                            e.jsxs('div', {
                              className: 'min-w-0 flex-1',
                              children: [
                                e.jsx('button', {
                                  type: 'button',
                                  onClick: () => i?.(s.id),
                                  className:
                                    'font-medium hover:opacity-80 transition truncate block',
                                  children: s.name,
                                }),
                                e.jsxs('div', {
                                  className: `text-xs ${t.subtext}`,
                                  children: ['Ranking: ', Number(a).toFixed(2)],
                                }),
                              ],
                            }),
                            e.jsxs('div', {
                              className: 'flex items-center gap-3 shrink-0',
                              children: [
                                e.jsx('button', {
                                  type: 'button',
                                  onClick: () => i?.(s.id),
                                  className: t.link,
                                  children: 'Statistiche',
                                }),
                                e.jsx('button', {
                                  type: 'button',
                                  onClick: () => f(s.id),
                                  className: 'text-rose-500 hover:opacity-80 text-sm',
                                  children: 'Elimina',
                                }),
                              ],
                            }),
                          ],
                        },
                        s.id
                      );
                    }),
                  }),
                  e.jsx('div', {
                    className:
                      'block lg:hidden mt-6 pt-4 border-t border-gray-200 dark:border-gray-700',
                    children: e.jsxs('div', {
                      className: `text-center text-sm ${t.subtext}`,
                      children: [
                        '📊 Totale giocatori: ',
                        e.jsx('span', { className: 'font-semibold', children: m.length }),
                      ],
                    }),
                  }),
                ],
              }),
      }),
    ],
  });
}
function I() {
  const n = S(),
    { state: c, setState: i, playersById: o } = C(),
    { clubMode: t } = R(),
    r = w.useMemo(() => A(), []),
    d = (x) => {
      n(`/stats?player=${x}`);
    };
  return t
    ? e.jsx(P, { T: r, state: c, setState: i, onOpenStats: d, playersById: o })
    : e.jsxs('div', {
        className: `text-center py-12 ${r.cardBg} ${r.border} rounded-xl m-4`,
        children: [
          e.jsx('div', { className: 'text-6xl mb-4', children: '🔒' }),
          e.jsx('h3', {
            className: `text-xl font-bold mb-2 ${r.text}`,
            children: 'Modalità Club Richiesta',
          }),
          e.jsx('p', {
            className: `${r.subtext} mb-4`,
            children:
              'Per accedere alla gestione giocatori, devi prima sbloccare la modalità club nella sezione Extra.',
          }),
          e.jsx('button', {
            onClick: () => n('/extra'),
            className: `${r.btnPrimary} px-6 py-3`,
            children: 'Vai a Extra per sbloccare',
          }),
        ],
      });
}
export { I as default };
