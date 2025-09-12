import {
  o as k,
  k as b,
  p as N,
  j as e,
  s as w,
  d as C,
  l as M,
  t as z,
  f as D,
} from './index-mfh82qsn-DzXPqwq9.js';
import { c as S, r as i, b as H } from './router-mfh82qsn-Bc5I10Ra.js';
import { S as m } from './Section-mfh82qsn-Cz7s2yQ_.js';
import './vendor-mfh82qsn-D3F3s8fL.js';
import './firebase-mfh82qsn-X_I_guKF.js';
function L({ T: o }) {
  const a = k.currentUser,
    n = S(),
    { darkMode: d, toggleTheme: c } = b(),
    [l, s] = i.useState({
      firstName: '',
      lastName: '',
      phone: '',
      fiscalCode: '',
      birthDate: '',
      address: '',
    }),
    [x, h] = i.useState(!0),
    [u, g] = i.useState(!1);
  i.useEffect(() => {
    let r = !0;
    return (
      (async () => {
        if (a) {
          const t = await N(a.uid);
          r &&
            s((j) => ({
              ...j,
              firstName: t.firstName || '',
              lastName: t.lastName || '',
              phone: t.phone || '',
              fiscalCode: t.fiscalCode || '',
              birthDate: t.birthDate || '',
              address: t.address || '',
            }));
        }
        h(!1);
      })(),
      () => {
        r = !1;
      }
    );
  }, [a]);
  const f = async () => {
      try {
        (g(!0), await w(a.uid, l));
        const r = [l.firstName, l.lastName].filter(Boolean).join(' ');
        (r && (await C(a, r)), alert('Profilo salvato!'));
      } catch (r) {
        alert('Errore salvataggio: ' + (r?.message || r));
      } finally {
        g(!1);
      }
    },
    p = async () => {
      if (window.confirm('Sei sicuro di voler uscire?'))
        try {
          await M();
        } catch (r) {
          alert('Errore durante il logout: ' + (r?.message || r));
        }
    },
    v = (r) => {
      switch (r) {
        case 'google.com':
          return e.jsxs('svg', {
            className: 'w-5 h-5',
            viewBox: '0 0 24 24',
            children: [
              e.jsx('path', {
                fill: 'currentColor',
                d: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z',
              }),
              e.jsx('path', {
                fill: 'currentColor',
                d: 'M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z',
              }),
              e.jsx('path', {
                fill: 'currentColor',
                d: 'M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z',
              }),
              e.jsx('path', {
                fill: 'currentColor',
                d: 'M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z',
              }),
            ],
          });
        case 'facebook.com':
          return e.jsx('svg', {
            className: 'w-5 h-5',
            viewBox: '0 0 24 24',
            fill: 'currentColor',
            children: e.jsx('path', {
              d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
            }),
          });
        default:
          return e.jsx('svg', {
            className: 'w-5 h-5',
            viewBox: '0 0 24 24',
            fill: 'currentColor',
            children: e.jsx('path', {
              d: 'M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9C7.9 1 7 1.9 7 3V21C7 22.1 7.9 23 9 23H15C16.1 23 17 22.1 17 21V19L21 15V9H21ZM15 3V7H19L15 3ZM9 19V21H15V19H9Z',
            }),
          });
      }
    },
    y = (r) => {
      switch (r) {
        case 'google.com':
          return 'Google';
        case 'facebook.com':
          return 'Facebook';
        default:
          return 'Email';
      }
    };
  return a
    ? e.jsxs('div', {
        className: 'space-y-8',
        children: [
          e.jsx(m, {
            title: 'Profilo Utente 👤',
            T: o,
            children: e.jsxs('div', {
              className:
                'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 space-y-6 shadow-2xl',
              children: [
                e.jsxs('div', {
                  className:
                    'flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30',
                  children: [
                    a.photoURL
                      ? e.jsx('img', {
                          src: a.photoURL,
                          alt: 'Avatar',
                          className:
                            'w-20 h-20 rounded-full object-cover ring-4 ring-blue-500/30 shadow-2xl',
                        })
                      : e.jsx('div', {
                          className:
                            'w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 ring-4 ring-blue-500/30 flex items-center justify-center text-2xl font-bold text-white shadow-2xl',
                          children: (a.displayName || a.email || 'U').charAt(0).toUpperCase(),
                        }),
                    e.jsxs('div', {
                      className: 'flex-1 min-w-0',
                      children: [
                        e.jsx('h3', {
                          className:
                            'text-2xl font-bold text-gray-900 dark:text-white truncate mb-1',
                          children: a.displayName || 'Utente',
                        }),
                        e.jsx('p', {
                          className: 'text-blue-600 dark:text-blue-400 text-lg truncate mb-2',
                          children: a.email,
                        }),
                        e.jsxs('div', {
                          className: 'flex items-center gap-3',
                          children: [
                            a.providerData[0] && v(a.providerData[0].providerId),
                            e.jsxs('span', {
                              className: 'text-sm font-medium text-gray-600 dark:text-gray-300',
                              children: [
                                'Accesso tramite',
                                ' ',
                                a.providerData[0] ? y(a.providerData[0].providerId) : 'Email',
                              ],
                            }),
                            e.jsxs('div', {
                              className:
                                'flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full',
                              children: [
                                e.jsx('div', {
                                  className: 'w-2 h-2 bg-emerald-500 rounded-full animate-pulse',
                                }),
                                e.jsx('span', {
                                  className:
                                    'text-xs font-medium text-emerald-700 dark:text-emerald-400',
                                  children: 'Online',
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className:
                    'flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 backdrop-blur-sm',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-3',
                      children: [
                        e.jsx('div', {
                          className: 'w-4 h-4 bg-emerald-500 rounded-full shadow-lg',
                        }),
                        e.jsx('span', {
                          className: 'text-lg font-bold text-emerald-700 dark:text-emerald-400',
                          children: 'Account Attivo',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className:
                        'flex items-center gap-2 bg-emerald-100 dark:bg-emerald-800/50 px-3 py-1 rounded-full',
                      children: [
                        e.jsx('svg', {
                          className: 'w-4 h-4 text-emerald-600 dark:text-emerald-400',
                          fill: 'currentColor',
                          viewBox: '0 0 20 20',
                          children: e.jsx('path', {
                            fillRule: 'evenodd',
                            d: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
                            clipRule: 'evenodd',
                          }),
                        }),
                        e.jsx('span', {
                          className: 'text-sm font-medium text-emerald-700 dark:text-emerald-400',
                          children: 'Email verificata',
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className:
                    'grid grid-cols-2 gap-6 pt-6 border-t border-white/20 dark:border-gray-600/20',
                  children: [
                    e.jsxs('div', {
                      className:
                        'text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border border-blue-200/30 dark:border-blue-700/30',
                      children: [
                        e.jsx('div', {
                          className: 'text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1',
                          children: a.metadata.creationTime
                            ? new Date(a.metadata.creationTime).toLocaleDateString('it-IT')
                            : 'N/A',
                        }),
                        e.jsx('div', {
                          className: 'text-sm font-medium text-gray-600 dark:text-gray-300',
                          children: 'Registrato il',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className:
                        'text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl border border-purple-200/30 dark:border-purple-700/30',
                      children: [
                        e.jsx('div', {
                          className: 'text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1',
                          children: a.metadata.lastSignInTime
                            ? new Date(a.metadata.lastSignInTime).toLocaleDateString('it-IT')
                            : 'N/A',
                        }),
                        e.jsx('div', {
                          className: 'text-sm font-medium text-gray-600 dark:text-gray-300',
                          children: 'Ultimo accesso',
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx('div', {
                  className:
                    'bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/30 dark:border-gray-600/30',
                  children: e.jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      e.jsxs('div', {
                        className: 'flex items-center gap-3',
                        children: [
                          e.jsx('div', {
                            className:
                              'w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg',
                            children: d
                              ? e.jsx('svg', {
                                  className: 'w-5 h-5 text-white',
                                  fill: 'currentColor',
                                  viewBox: '0 0 20 20',
                                  children: e.jsx('path', {
                                    d: 'M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z',
                                  }),
                                })
                              : e.jsx('svg', {
                                  className: 'w-5 h-5 text-white',
                                  fill: 'currentColor',
                                  viewBox: '0 0 20 20',
                                  children: e.jsx('path', {
                                    fillRule: 'evenodd',
                                    d: 'M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z',
                                    clipRule: 'evenodd',
                                  }),
                                }),
                          }),
                          e.jsxs('div', {
                            children: [
                              e.jsx('h4', {
                                className: 'font-semibold text-gray-900 dark:text-white',
                                children: "Tema dell'App",
                              }),
                              e.jsx('p', {
                                className: 'text-sm text-gray-600 dark:text-gray-400',
                                children: d ? 'Modalità scura attiva' : 'Modalità chiara attiva',
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsx('button', {
                        onClick: c,
                        className: `relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${d ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-200 dark:bg-gray-600'}`,
                        role: 'switch',
                        'aria-checked': d,
                        'aria-label': 'Cambia tema',
                        children: e.jsx('span', {
                          className: `inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${d ? 'translate-x-7' : 'translate-x-1'}`,
                        }),
                      }),
                    ],
                  }),
                }),
                e.jsx('div', {
                  className: 'pt-6 border-t border-white/20 dark:border-gray-600/20',
                  children: e.jsxs('button', {
                    type: 'button',
                    onClick: () => n('/extra'),
                    className:
                      'w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 backdrop-blur-xl',
                    children: [
                      e.jsx('svg', {
                        className: 'w-5 h-5',
                        fill: 'none',
                        stroke: 'currentColor',
                        viewBox: '0 0 24 24',
                        children: e.jsx('path', {
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                          strokeWidth: 2,
                          d: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
                        }),
                      }),
                      'Funzioni Extra',
                    ],
                  }),
                }),
                e.jsx('div', {
                  className: 'pt-6 border-t border-white/20 dark:border-gray-600/20',
                  children: e.jsxs('button', {
                    type: 'button',
                    onClick: p,
                    className:
                      'w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 backdrop-blur-xl',
                    children: [
                      e.jsx('svg', {
                        className: 'w-5 h-5',
                        fill: 'none',
                        stroke: 'currentColor',
                        viewBox: '0 0 24 24',
                        children: e.jsx('path', {
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                          strokeWidth: 2,
                          d: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
                        }),
                      }),
                      "Esci dall'account",
                    ],
                  }),
                }),
              ],
            }),
          }),
          e.jsx(m, {
            title: 'Gestione Dati 📝',
            T: o,
            children: e.jsx('div', {
              className:
                'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl',
              children: x
                ? e.jsx('div', {
                    className: 'flex items-center justify-center py-8',
                    children: e.jsx('div', {
                      className: 'text-sm',
                      children: 'Caricamento profilo...',
                    }),
                  })
                : e.jsxs('div', {
                    className: 'space-y-6',
                    children: [
                      e.jsxs('div', {
                        className: 'grid sm:grid-cols-2 gap-4',
                        children: [
                          e.jsxs('div', {
                            className: 'flex flex-col space-y-2',
                            children: [
                              e.jsx('label', {
                                className: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
                                children: 'Nome *',
                              }),
                              e.jsx('input', {
                                className:
                                  'px-4 py-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200',
                                value: l.firstName,
                                onChange: (r) => s((t) => ({ ...t, firstName: r.target.value })),
                                placeholder: 'Inserisci il tuo nome',
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            className: 'flex flex-col space-y-2',
                            children: [
                              e.jsx('label', {
                                className: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
                                children: 'Cognome',
                              }),
                              e.jsx('input', {
                                className:
                                  'px-4 py-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200',
                                value: l.lastName,
                                onChange: (r) => s((t) => ({ ...t, lastName: r.target.value })),
                                placeholder: 'Inserisci il tuo cognome',
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            className: 'flex flex-col space-y-2',
                            children: [
                              e.jsx('label', {
                                className: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
                                children: 'Telefono *',
                              }),
                              e.jsx('input', {
                                className:
                                  'px-4 py-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200',
                                value: l.phone,
                                onChange: (r) => s((t) => ({ ...t, phone: r.target.value })),
                                placeholder: '+39 123 456 7890',
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            className: 'flex flex-col space-y-2',
                            children: [
                              e.jsx('label', {
                                className: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
                                children: 'Codice Fiscale',
                              }),
                              e.jsx('input', {
                                className:
                                  'px-4 py-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200',
                                value: l.fiscalCode,
                                onChange: (r) => s((t) => ({ ...t, fiscalCode: r.target.value })),
                                placeholder: 'RSSMRA80A01H501U',
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            className: 'flex flex-col space-y-2',
                            children: [
                              e.jsx('label', {
                                className: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
                                children: 'Data di nascita',
                              }),
                              e.jsx('input', {
                                type: 'date',
                                className:
                                  'px-4 py-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200',
                                value: l.birthDate,
                                onChange: (r) => s((t) => ({ ...t, birthDate: r.target.value })),
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            className: 'flex flex-col space-y-2',
                            children: [
                              e.jsx('label', {
                                className: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
                                children: 'Email',
                              }),
                              e.jsx('input', {
                                type: 'email',
                                className:
                                  'px-4 py-3 bg-gray-100/60 dark:bg-gray-600/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed',
                                value: a.email || '',
                                disabled: !0,
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            className: 'flex flex-col sm:col-span-2 space-y-2',
                            children: [
                              e.jsx('label', {
                                className: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
                                children: 'Indirizzo',
                              }),
                              e.jsx('input', {
                                className:
                                  'px-4 py-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200',
                                value: l.address,
                                onChange: (r) => s((t) => ({ ...t, address: r.target.value })),
                                placeholder: 'Via, Città, CAP',
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsx('div', {
                        className:
                          'flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/20 dark:border-gray-600/20',
                        children: e.jsx('button', {
                          type: 'button',
                          className:
                            'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed',
                          onClick: f,
                          disabled: u,
                          children: u
                            ? e.jsxs('span', {
                                className: 'flex items-center gap-2',
                                children: [
                                  e.jsx('div', {
                                    className:
                                      'w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin',
                                  }),
                                  'Salvando...',
                                ],
                              })
                            : 'Salva Modifiche',
                        }),
                      }),
                      e.jsx('p', {
                        className: 'text-sm text-gray-500 dark:text-gray-400 italic',
                        children: '* Campi obbligatori',
                      }),
                    ],
                  }),
            }),
          }),
        ],
      })
    : e.jsx(m, {
        title: 'Profilo',
        T: o,
        children: e.jsx('div', {
          className: `rounded-2xl ${o.cardBg} ${o.border} p-4`,
          children: e.jsx('div', {
            className: 'text-sm',
            children: 'Devi effettuare l’accesso per gestire il profilo (vai nella tab “Accesso”).',
          }),
        }),
      });
}
function E() {
  const o = H.useMemo(() => z(), []),
    { state: a, setState: n, derived: d, leagueId: c, setLeagueId: l } = D(),
    { clubMode: s, setClubMode: x } = b();
  return e.jsx(L, {
    T: o,
    state: a,
    setState: n,
    derived: d,
    leagueId: c,
    setLeagueId: l,
    clubMode: s,
    setClubMode: x,
  });
}
export { E as default };
