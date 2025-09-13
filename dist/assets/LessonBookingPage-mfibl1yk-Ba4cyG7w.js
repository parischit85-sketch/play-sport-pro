import { j as e, i as ke, u as be, f as Ne, k as we, t as Se } from './index-mfibl1yk-D2ihnd7m.js';
import { r as m, b as Ce } from './router-mfibl1yk-BvCXkbo6.js';
import { S as K } from './Section-mfibl1yk-Bni894MT.js';
import { B as he } from './Badge-mfibl1yk-dJZTtx7M.js';
import { c as $e } from './design-system-mfibl1yk-B5fzZ68S.js';
import { P as se, c as ze, a as Ie } from './playerTypes-mfibl1yk-CIm-hM8a.js';
import { b as De, u as Me } from './useUnifiedBookings-mfibl1yk-D_or3Kbt.js';
import { M as pe } from './Modal-mfibl1yk-DuoMxXxE.js';
import './vendor-mfibl1yk-D3F3s8fL.js';
import './firebase-mfibl1yk-X_I_guKF.js';
import './unified-booking-service-mfibl1yk-Dyy4hClR.js';
function Le({
  T: s,
  ds: u,
  lessonConfig: o,
  updateLessonConfig: N,
  instructors: h,
  players: w,
  setState: n,
  state: t,
  courts: v,
  onClearAllLessons: d,
  lessonBookingsCount: f,
}) {
  const [O, i] = m.useState('config'),
    [S, L] = m.useState(!1),
    [y, l] = m.useState(null),
    [I, B] = m.useState(!1),
    [D, W] = m.useState(null),
    C = [
      { value: 0, label: 'Domenica' },
      { value: 1, label: 'Lunedì' },
      { value: 2, label: 'Martedì' },
      { value: 3, label: 'Mercoledì' },
      { value: 4, label: 'Giovedì' },
      { value: 5, label: 'Venerdì' },
      { value: 6, label: 'Sabato' },
    ],
    Q = m.useMemo(() => (w || []).filter((a) => a.category !== se.INSTRUCTOR), [w]),
    H = () => {
      N({ ...o, isEnabled: !o.isEnabled });
    },
    Y = (a) => {
      const x = y
        ? (o.timeSlots || []).map((c) => (c.id === y.id ? { ...c, ...a } : c))
        : [...(o.timeSlots || []), { ...ze(), ...a, id: ke() }];
      (N({ ...o, timeSlots: x }), L(!1), l(null));
    },
    T = (a) => {
      confirm('Sei sicuro di voler eliminare questa fascia oraria?') &&
        N({ ...o, timeSlots: (o.timeSlots || []).filter((x) => x.id !== a) });
    },
    V = (a) => {
      const x = (w || []).map((c) =>
        c.id === D.id
          ? {
              ...c,
              category: se.INSTRUCTOR,
              instructorData: { ...c.instructorData, isInstructor: !0, ...a },
            }
          : c
      );
      (n((c) => ({ ...c, players: x })), B(!1), W(null));
    },
    Z = (a) => {
      if (confirm('Sei sicuro di voler rimuovere questo giocatore come istruttore?')) {
        const x = (w || []).map((c) =>
          c.id === a
            ? {
                ...c,
                category: se.MEMBER,
                instructorData: { ...c.instructorData, isInstructor: !1 },
              }
            : c
        );
        n((c) => ({ ...c, players: x }));
      }
    };
  return e.jsxs('div', {
    className: 'space-y-6',
    children: [
      e.jsx('div', {
        className:
          'border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-t-lg',
        children: e.jsx('nav', {
          className: 'flex space-x-8 overflow-x-auto px-6 py-2',
          children: [
            { id: 'config', label: 'Configurazione Generale', icon: '⚙️', color: 'blue' },
            { id: 'timeslots', label: 'Fasce Orarie', icon: '⏰', color: 'green' },
            { id: 'instructors', label: 'Gestione Istruttori', icon: '👨‍🏫', color: 'purple' },
            { id: 'cleanup', label: 'Pulizia Dati', icon: '🗑️', color: 'red' },
          ].map((a) =>
            e.jsxs(
              'button',
              {
                onClick: () => i(a.id),
                className: `py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${O === a.id ? `border-${a.color}-500 text-${a.color}-600 dark:text-${a.color}-400 bg-${a.color}-50 dark:bg-${a.color}-900/20 rounded-t-lg` : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-t-lg'}`,
                children: [
                  e.jsx('span', { className: 'text-base', children: a.icon }),
                  e.jsx('span', { children: a.label }),
                ],
              },
              a.id
            )
          ),
        }),
      }),
      O === 'config' &&
        e.jsx('div', {
          className: 'space-y-6',
          children: e.jsx(K, {
            title: 'Configurazione Sistema Lezioni',
            variant: 'minimal',
            T: s,
            children: e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  className:
                    'flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('h3', {
                          className: `${u.h6} font-semibold mb-2 text-gray-900 dark:text-white flex items-center gap-2`,
                          children: '🎾 Sistema Lezioni',
                        }),
                        e.jsx('p', {
                          className: `text-sm ${s.subtext} max-w-md`,
                          children: o.isEnabled
                            ? '✅ Il sistema di prenotazione lezioni è attivo e funzionante'
                            : '❌ Il sistema di prenotazione lezioni è disattivato',
                        }),
                      ],
                    }),
                    e.jsx('button', {
                      onClick: H,
                      className: `px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${o.isEnabled ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 border border-red-300 dark:border-red-700' : 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/60 border border-green-300 dark:border-green-700'}`,
                      children: o.isEnabled ? '🛑 Disattiva' : '🚀 Attiva',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'grid gap-6 sm:grid-cols-2',
                  children: [
                    e.jsxs('div', {
                      className:
                        'p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm',
                      children: [
                        e.jsx('label', {
                          className: `block ${u.label} mb-3 flex items-center gap-2 text-gray-900 dark:text-white font-medium`,
                          children: '📅 Giorni di Anticipo per Prenotazione',
                        }),
                        e.jsx('input', {
                          type: 'number',
                          min: '1',
                          max: '30',
                          value: o.bookingAdvanceDays,
                          onChange: (a) =>
                            N({ ...o, bookingAdvanceDays: parseInt(a.target.value) || 14 }),
                          className:
                            'w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white',
                        }),
                        e.jsx('p', {
                          className: 'text-xs text-gray-500 dark:text-gray-400 mt-2',
                          children: 'Quanto in anticipo si può prenotare',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className:
                        'p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm',
                      children: [
                        e.jsx('label', {
                          className: `block ${u.label} mb-3 flex items-center gap-2 text-gray-900 dark:text-white font-medium`,
                          children: '⏰ Ore Prima per Cancellazione',
                        }),
                        e.jsx('input', {
                          type: 'number',
                          min: '1',
                          max: '72',
                          value: o.cancellationHours,
                          onChange: (a) =>
                            N({ ...o, cancellationHours: parseInt(a.target.value) || 24 }),
                          className:
                            'w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white',
                        }),
                        e.jsx('p', {
                          className: 'text-xs text-gray-500 dark:text-gray-400 mt-2',
                          children: 'Limite per cancellazioni gratuite',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          }),
        }),
      O === 'timeslots' &&
        e.jsx('div', {
          className: 'space-y-6',
          children: e.jsx(K, {
            title: 'Gestione Fasce Orarie',
            variant: 'minimal',
            T: s,
            children: e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsx('button', {
                  onClick: () => L(!0),
                  className:
                    'px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600',
                  children: '+ Aggiungi Fascia Oraria',
                }),
                ' ',
                (o.timeSlots || []).length === 0
                  ? e.jsx('div', {
                      className: `text-center py-8 ${s.subtext}`,
                      children:
                        'Nessuna fascia oraria configurata. Crea la prima fascia per iniziare.',
                    })
                  : e.jsx('div', {
                      className: 'space-y-3',
                      children: (o.timeSlots || []).map((a) => {
                        const x = C.find((A) => A.value === a.dayOfWeek)?.label || 'Sconosciuto',
                          c = (h || []).filter((A) => a.instructorIds.includes(A.id));
                        return e.jsx(
                          'div',
                          {
                            className: `${s.cardBg} ${s.border} ${s.borderMd} p-4`,
                            children: e.jsxs('div', {
                              className: 'flex items-start justify-between',
                              children: [
                                e.jsxs('div', {
                                  className: 'flex-1',
                                  children: [
                                    e.jsxs('div', {
                                      className: 'flex items-center gap-3 mb-2',
                                      children: [
                                        e.jsxs('h4', {
                                          className: `${u.h6} font-medium`,
                                          children: [x, ' • ', a.startTime, ' - ', a.endTime],
                                        }),
                                        e.jsx(he, {
                                          variant: a.isActive ? 'success' : 'default',
                                          size: 'sm',
                                          T: s,
                                          children: a.isActive ? 'Attiva' : 'Inattiva',
                                        }),
                                      ],
                                    }),
                                    e.jsxs('div', {
                                      className:
                                        'flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400',
                                      children: [
                                        e.jsxs('span', {
                                          children: ['Max prenotazioni: ', a.maxBookings],
                                        }),
                                        e.jsxs('span', { children: ['Istruttori: ', c.length] }),
                                      ],
                                    }),
                                    c.length > 0 &&
                                      e.jsx('div', {
                                        className: 'mt-2',
                                        children: e.jsx('div', {
                                          className: 'flex flex-wrap gap-1',
                                          children: c.map((A) =>
                                            e.jsxs(
                                              'div',
                                              {
                                                className:
                                                  'flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300',
                                                children: [
                                                  e.jsx('div', {
                                                    className: 'w-3 h-3 rounded-full',
                                                    style: {
                                                      backgroundColor: A.instructorData?.color,
                                                    },
                                                  }),
                                                  A.name,
                                                ],
                                              },
                                              A.id
                                            )
                                          ),
                                        }),
                                      }),
                                  ],
                                }),
                                e.jsxs('div', {
                                  className: 'flex gap-2',
                                  children: [
                                    e.jsx('button', {
                                      onClick: () => {
                                        (l(a), L(!0));
                                      },
                                      className:
                                        'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
                                      children: 'Modifica',
                                    }),
                                    e.jsx('button', {
                                      onClick: () => T(a.id),
                                      className:
                                        'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300',
                                      children: 'Elimina',
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          },
                          a.id
                        );
                      }),
                    }),
              ],
            }),
          }),
        }),
      O === 'instructors' &&
        e.jsx('div', {
          className: 'space-y-6',
          children: e.jsx(K, {
            title: 'Gestione Istruttori',
            variant: 'minimal',
            T: s,
            children: e.jsxs('div', {
              className: 'space-y-6',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsxs('h3', {
                      className: `${u.h6} font-medium mb-3`,
                      children: ['Istruttori Attivi (', h.length, ')'],
                    }),
                    h.length === 0
                      ? e.jsx('div', {
                          className: `text-center py-6 ${s.subtext}`,
                          children: 'Nessun istruttore configurato',
                        })
                      : e.jsx('div', {
                          className: 'space-y-3',
                          children: h.map((a) =>
                            e.jsx(
                              'div',
                              {
                                className: `${s.cardBg} ${s.border} rounded-lg p-4 hover:shadow-lg dark:hover:shadow-gray-700/50 transition-all duration-200`,
                                children: e.jsxs('div', {
                                  className: 'flex items-center justify-between',
                                  children: [
                                    e.jsxs('div', {
                                      className: 'flex items-center gap-3',
                                      children: [
                                        e.jsx('div', {
                                          className:
                                            'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md',
                                          style: { backgroundColor: a.instructorData?.color },
                                          children: a.name?.charAt(0) || '?',
                                        }),
                                        e.jsxs('div', {
                                          children: [
                                            e.jsx('h4', {
                                              className: `${u.h6} font-medium text-gray-900 dark:text-white`,
                                              children: a.name,
                                            }),
                                            e.jsxs('div', {
                                              className: 'flex flex-col gap-2 text-sm',
                                              children: [
                                                e.jsxs('div', {
                                                  className: 'flex flex-wrap gap-1.5',
                                                  children: [
                                                    a.instructorData?.priceSingle > 0 &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-700',
                                                        children: [
                                                          '💼 €',
                                                          a.instructorData.priceSingle,
                                                        ],
                                                      }),
                                                    a.instructorData?.priceCouple > 0 &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded-full text-xs font-medium border border-green-200 dark:border-green-700',
                                                        children: [
                                                          '👥 €',
                                                          a.instructorData.priceCouple,
                                                        ],
                                                      }),
                                                    a.instructorData?.priceThree > 0 &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium border border-purple-200 dark:border-purple-700',
                                                        children: [
                                                          '👥👤 €',
                                                          a.instructorData.priceThree,
                                                        ],
                                                      }),
                                                    a.instructorData?.priceMatchLesson > 0 &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 rounded-full text-xs font-medium border border-orange-200 dark:border-orange-700',
                                                        children: [
                                                          '🏆 €',
                                                          a.instructorData.priceMatchLesson,
                                                        ],
                                                      }),
                                                    !a.instructorData?.priceSingle &&
                                                      !a.instructorData?.priceCouple &&
                                                      !a.instructorData?.priceThree &&
                                                      !a.instructorData?.priceMatchLesson &&
                                                      a.instructorData?.hourlyRate > 0 &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-600',
                                                        children: [
                                                          '⏰ €',
                                                          a.instructorData.hourlyRate,
                                                          '/ora',
                                                        ],
                                                      }),
                                                  ],
                                                }),
                                                a.instructorData?.specialties?.length > 0 &&
                                                  e.jsx('div', {
                                                    className: 'flex flex-wrap gap-1',
                                                    children: a.instructorData.specialties.map(
                                                      (x, c) =>
                                                        e.jsxs(
                                                          'span',
                                                          {
                                                            className:
                                                              'px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs border border-indigo-200 dark:border-indigo-700',
                                                            children: ['⭐ ', x],
                                                          },
                                                          c
                                                        )
                                                    ),
                                                  }),
                                              ],
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    e.jsxs('div', {
                                      className: 'flex gap-2',
                                      children: [
                                        e.jsx('button', {
                                          onClick: () => {
                                            (W(a), B(!0));
                                          },
                                          className:
                                            'px-3 py-1.5 text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-500 border border-blue-600 dark:border-blue-400 rounded-lg transition-all duration-200 font-medium text-sm',
                                          children: '✏️ Modifica',
                                        }),
                                        e.jsx('button', {
                                          onClick: () => Z(a.id),
                                          className:
                                            'px-3 py-1.5 text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 dark:hover:bg-red-500 border border-red-600 dark:border-red-400 rounded-lg transition-all duration-200 font-medium text-sm',
                                          children: '🗑️ Rimuovi',
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              },
                              a.id
                            )
                          ),
                        }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('h3', {
                      className: `${u.h6} font-medium mb-3`,
                      children: 'Aggiungi Istruttore',
                    }),
                    Q.length === 0
                      ? e.jsx('div', {
                          className: `text-center py-6 ${s.subtext}`,
                          children:
                            'Tutti i giocatori sono già istruttori o non ci sono giocatori disponibili',
                        })
                      : e.jsxs('div', {
                          className: 'space-y-3',
                          children: [
                            Q.slice(0, 5).map((a) =>
                              e.jsx(
                                'div',
                                {
                                  className: `${s.cardBg} ${s.border} rounded-lg p-4 hover:shadow-md dark:hover:shadow-gray-700/50 transition-all duration-200`,
                                  children: e.jsxs('div', {
                                    className: 'flex items-center justify-between',
                                    children: [
                                      e.jsxs('div', {
                                        className: 'flex items-center gap-3',
                                        children: [
                                          e.jsx('div', {
                                            className:
                                              'w-10 h-10 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center text-white font-bold shadow-md',
                                            children: a.name?.charAt(0) || '?',
                                          }),
                                          e.jsxs('div', {
                                            children: [
                                              e.jsx('h4', {
                                                className: `${u.h6} font-medium text-gray-900 dark:text-white`,
                                                children: a.name,
                                              }),
                                              e.jsxs('p', {
                                                className: `text-sm ${s.subtext} flex items-center gap-2`,
                                                children: [
                                                  e.jsxs('span', { children: ['📧 ', a.email] }),
                                                  e.jsx('span', { children: '•' }),
                                                  e.jsx('span', {
                                                    className:
                                                      'px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium',
                                                    children: a.category,
                                                  }),
                                                ],
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                      e.jsx('button', {
                                        onClick: () => {
                                          (W(a), B(!0));
                                        },
                                        className:
                                          'px-4 py-2 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/60 border border-green-300 dark:border-green-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md',
                                        children: '➕ Rendi Istruttore',
                                      }),
                                    ],
                                  }),
                                },
                                a.id
                              )
                            ),
                            Q.length > 5 &&
                              e.jsxs('p', {
                                className: `text-sm ${s.subtext} text-center`,
                                children: ['... e altri ', Q.length - 5, ' giocatori'],
                              }),
                          ],
                        }),
                  ],
                }),
              ],
            }),
          }),
        }),
      O === 'cleanup' &&
        e.jsx('div', {
          className: 'space-y-6',
          children: e.jsx(K, {
            title: 'Pulizia Dati di Test',
            variant: 'minimal',
            T: s,
            children: e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  className:
                    'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4',
                  children: [
                    e.jsxs('div', {
                      className:
                        'flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2',
                      children: [
                        e.jsx('span', { className: 'text-xl', children: '⚠️' }),
                        e.jsx('h3', { className: 'font-semibold', children: 'Attenzione' }),
                      ],
                    }),
                    e.jsx('p', {
                      className: 'text-sm text-yellow-700 dark:text-yellow-300',
                      children:
                        'Questa sezione permette di cancellare tutte le prenotazioni di lezione di test. Le prenotazioni dei campi associate verranno anche cancellate automaticamente.',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: `${s.cardBg} ${s.border} ${s.borderMd} p-6 rounded-lg`,
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center justify-between mb-4',
                      children: [
                        e.jsxs('div', {
                          children: [
                            e.jsx('h3', {
                              className: `${u.h6} font-medium`,
                              children: 'Prenotazioni Lezioni Presenti',
                            }),
                            e.jsx('p', {
                              className: `text-sm ${s.subtext}`,
                              children:
                                f === 0
                                  ? 'Nessuna prenotazione di lezione presente'
                                  : f === 1
                                    ? '1 prenotazione di lezione presente'
                                    : `${f} prenotazioni di lezione presenti`,
                            }),
                          ],
                        }),
                        e.jsx('div', { className: 'text-3xl', children: '🗑️' }),
                      ],
                    }),
                    f > 0
                      ? e.jsxs('div', {
                          className: 'space-y-3',
                          children: [
                            e.jsx('div', {
                              className:
                                'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-3',
                              children: e.jsxs('p', {
                                className: 'text-sm text-red-700 dark:text-red-300',
                                children: [
                                  e.jsx('strong', { children: 'Cosa verrà eliminato:' }),
                                  e.jsx('br', {}),
                                  '• ',
                                  f,
                                  ' prenotazione/i di lezione',
                                  e.jsx('br', {}),
                                  '• I relativi slot prenotati nei campi',
                                  e.jsx('br', {}),
                                  '• Tutti i dati associati dal localStorage',
                                ],
                              }),
                            }),
                            e.jsx('button', {
                              onClick: d,
                              className:
                                'w-full px-4 py-3 bg-red-600 dark:bg-red-700 text-white font-medium rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors',
                              children: '🗑️ Cancella Tutte le Prenotazioni di Lezione',
                            }),
                          ],
                        })
                      : e.jsxs('div', {
                          className: `text-center py-6 ${s.subtext}`,
                          children: [
                            e.jsx('div', { className: 'text-4xl mb-2', children: '✨' }),
                            e.jsx('p', {
                              children: 'Nessuna prenotazione di lezione da cancellare',
                            }),
                          ],
                        }),
                  ],
                }),
                e.jsxs('div', {
                  className: `${s.cardBg} ${s.border} ${s.borderMd} p-4 rounded-lg`,
                  children: [
                    e.jsx('h4', {
                      className: `${u.h6} font-medium mb-2`,
                      children: 'Come funziona la pulizia:',
                    }),
                    e.jsxs('ul', {
                      className: `text-sm space-y-1 ${s.subtext}`,
                      children: [
                        e.jsx('li', {
                          children: '• Cancella tutte le prenotazioni di lezione dal localStorage',
                        }),
                        e.jsx('li', {
                          children: '• Cancella i corrispondenti slot prenotati nei campi',
                        }),
                        e.jsx('li', {
                          children: '• Aggiorna automaticamente la vista "Gestione Campi"',
                        }),
                        e.jsx('li', {
                          children:
                            '• Non tocca le configurazioni degli istruttori o le fasce orarie',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          }),
        }),
      S &&
        e.jsx(Ae, {
          isOpen: S,
          onClose: () => {
            (L(!1), l(null));
          },
          timeSlot: y,
          instructors: h,
          courts: v,
          weekDays: C,
          onSave: Y,
          T: s,
          ds: u,
        }),
      I &&
        D &&
        e.jsx(Oe, {
          isOpen: I,
          onClose: () => {
            (B(!1), W(null));
          },
          player: D,
          onSave: V,
          T: s,
          ds: u,
        }),
    ],
  });
}
function Ae({
  isOpen: s,
  onClose: u,
  timeSlot: o,
  instructors: N,
  courts: h,
  weekDays: w,
  onSave: n,
  T: t,
  ds: v,
}) {
  const [d, f] = m.useState(() => ({
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '10:00',
      instructorIds: [],
      courtIds: [],
      maxBookings: 1,
      isActive: !0,
      ...o,
    })),
    O = (i) => {
      if ((i.preventDefault(), !d.startTime || !d.endTime)) {
        alert('Inserisci orario di inizio e fine');
        return;
      }
      if (d.startTime >= d.endTime) {
        alert("L'orario di fine deve essere dopo quello di inizio");
        return;
      }
      if (d.instructorIds.length === 0) {
        alert('Seleziona almeno un istruttore');
        return;
      }
      if (d.courtIds.length === 0) {
        alert('Seleziona almeno un campo');
        return;
      }
      n(d);
    };
  return e.jsx(pe, {
    isOpen: s,
    onClose: u,
    title: o ? 'Modifica Fascia Oraria' : 'Aggiungi Fascia Oraria',
    size: 'medium',
    T: t,
    children: e.jsxs('form', {
      onSubmit: O,
      className: 'space-y-4',
      children: [
        e.jsxs('div', {
          children: [
            e.jsx('label', {
              className: `block ${v.label} mb-2`,
              children: 'Giorno della Settimana *',
            }),
            e.jsx('select', {
              value: d.dayOfWeek,
              onChange: (i) => f({ ...d, dayOfWeek: parseInt(i.target.value) }),
              className: `w-full p-2 ${t.cardBg} ${t.border} ${t.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`,
              children: w.map((i) =>
                e.jsx('option', { value: i.value, children: i.label }, i.value)
              ),
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-2 gap-4',
          children: [
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: `block ${v.label} mb-2`, children: 'Ora Inizio *' }),
                e.jsx('input', {
                  type: 'time',
                  value: d.startTime,
                  onChange: (i) => f({ ...d, startTime: i.target.value }),
                  className: `w-full p-2 ${t.cardBg} ${t.border} ${t.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`,
                }),
              ],
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: `block ${v.label} mb-2`, children: 'Ora Fine *' }),
                e.jsx('input', {
                  type: 'time',
                  value: d.endTime,
                  onChange: (i) => f({ ...d, endTime: i.target.value }),
                  className: `w-full p-2 ${t.cardBg} ${t.border} ${t.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`,
                }),
              ],
            }),
          ],
        }),
        e.jsxs('div', {
          children: [
            e.jsx('label', {
              className: `block ${v.label} mb-2`,
              children: 'Numero Massimo Prenotazioni',
            }),
            e.jsx('input', {
              type: 'number',
              min: '1',
              max: '10',
              value: d.maxBookings,
              onChange: (i) => f({ ...d, maxBookings: parseInt(i.target.value) || 1 }),
              className: `w-full p-2 ${t.cardBg} ${t.border} ${t.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`,
            }),
          ],
        }),
        e.jsxs('div', {
          children: [
            e.jsx('label', {
              className: `block ${v.label} mb-2`,
              children: 'Istruttori Disponibili *',
            }),
            e.jsx('div', {
              className: `space-y-2 max-h-40 overflow-y-auto border rounded p-2 ${t.border} ${t.cardBg}`,
              children: N.map((i) =>
                e.jsxs(
                  'label',
                  {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx('input', {
                        type: 'checkbox',
                        checked: d.instructorIds.includes(i.id),
                        onChange: (S) => {
                          const { checked: L } = S.target;
                          f({
                            ...d,
                            instructorIds: L
                              ? [...d.instructorIds, i.id]
                              : d.instructorIds.filter((y) => y !== i.id),
                          });
                        },
                        className: 'rounded',
                      }),
                      e.jsxs('div', {
                        className: 'flex items-center gap-2',
                        children: [
                          e.jsx('div', {
                            className: 'w-4 h-4 rounded-full',
                            style: { backgroundColor: i.instructorData?.color },
                          }),
                          e.jsx('span', { className: t.text, children: i.name }),
                        ],
                      }),
                    ],
                  },
                  i.id
                )
              ),
            }),
          ],
        }),
        e.jsxs('div', {
          children: [
            e.jsx('label', { className: `block ${v.label} mb-2`, children: 'Campi Disponibili *' }),
            e.jsx('div', {
              className: `space-y-2 max-h-40 overflow-y-auto border rounded p-2 ${t.border} ${t.cardBg}`,
              children:
                h &&
                h.map((i) =>
                  e.jsxs(
                    'label',
                    {
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx('input', {
                          type: 'checkbox',
                          checked: d.courtIds.includes(i.id),
                          onChange: (S) => {
                            const { checked: L } = S.target;
                            f({
                              ...d,
                              courtIds: L
                                ? [...d.courtIds, i.id]
                                : d.courtIds.filter((y) => y !== i.id),
                            });
                          },
                          className: 'rounded',
                        }),
                        e.jsxs('div', {
                          className: 'flex items-center gap-2',
                          children: [
                            e.jsx('div', {
                              className: 'w-4 h-4 rounded border',
                              style: { backgroundColor: i.surface?.color || '#e5e7eb' },
                            }),
                            e.jsx('span', {
                              className: t.text,
                              children: i.name || `Campo ${i.id}`,
                            }),
                            i.surface?.type &&
                              e.jsx('span', {
                                className: `text-xs px-2 py-1 ${t.cardBg} ${t.border} rounded`,
                                children: i.surface.type,
                              }),
                          ],
                        }),
                      ],
                    },
                    i.id
                  )
                ),
            }),
            (!h || h.length === 0) &&
              e.jsx('p', {
                className: `text-sm ${t.subtext} mt-1`,
                children: 'Nessun campo configurato. Vai alla sezione Campi per aggiungerne.',
              }),
          ],
        }),
        e.jsxs('div', {
          className: 'flex items-center gap-2',
          children: [
            e.jsx('input', {
              type: 'checkbox',
              id: 'isActive',
              checked: d.isActive,
              onChange: (i) => f({ ...d, isActive: i.target.checked }),
              className: 'rounded',
            }),
            e.jsx('label', {
              htmlFor: 'isActive',
              className: v.label,
              children: 'Fascia oraria attiva',
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'flex gap-3 pt-4',
          children: [
            e.jsx('button', {
              type: 'button',
              onClick: u,
              className: `flex-1 py-2 px-4 ${t.cardBg} ${t.border} ${t.borderMd} hover:bg-gray-50 dark:hover:bg-gray-700`,
              children: 'Annulla',
            }),
            e.jsxs('button', {
              type: 'submit',
              className:
                'flex-1 py-2 px-4 bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600',
              children: [o ? 'Aggiorna' : 'Crea', ' Fascia Oraria'],
            }),
          ],
        }),
      ],
    }),
  });
}
function Oe({ isOpen: s, onClose: u, player: o, onSave: N, T: h, ds: w }) {
  const [n, t] = m.useState(() => ({
      color: '#3B82F6',
      hourlyRate: 0,
      priceSingle: 0,
      priceCouple: 0,
      priceThree: 0,
      priceMatchLesson: 0,
      specialties: [],
      bio: '',
      certifications: [],
      ...o.instructorData,
    })),
    [v, d] = m.useState(''),
    [f, O] = m.useState(''),
    i = ['Padel', 'Tennis', 'Fitness'],
    S = [
      '#3B82F6',
      '#EF4444',
      '#10B981',
      '#F59E0B',
      '#8B5CF6',
      '#EC4899',
      '#06B6D4',
      '#84CC16',
      '#F97316',
      '#6366F1',
    ],
    L = (l) => {
      (l.preventDefault(), N(n));
    },
    y = () => {
      v.trim() &&
        !n.specialties.includes(v.trim()) &&
        (t({ ...n, specialties: [...n.specialties, v.trim()] }), d(''));
    };
  return e.jsx(pe, {
    isOpen: s,
    onClose: u,
    title: `Configura Istruttore: ${o.name}`,
    size: 'extraLarge',
    T: h,
    children: e.jsxs('form', {
      onSubmit: L,
      className: 'space-y-3',
      children: [
        e.jsxs('div', {
          children: [
            e.jsx('label', { className: `block ${w.label} mb-2`, children: 'Colore Istruttore' }),
            e.jsx('div', {
              className: 'flex gap-2 mb-2 flex-wrap',
              children: S.map((l) =>
                e.jsx(
                  'button',
                  {
                    type: 'button',
                    onClick: () => t({ ...n, color: l }),
                    className: `w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${n.color === l ? 'border-gray-800 dark:border-white scale-110 shadow-lg' : 'border-gray-300 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-400'}`,
                    style: { backgroundColor: l },
                    title: `Seleziona colore ${l}`,
                    children:
                      n.color === l &&
                      e.jsx('span', { className: 'text-white text-xs', children: '✓' }),
                  },
                  l
                )
              ),
            }),
            e.jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                e.jsx('input', {
                  type: 'color',
                  value: n.color,
                  onChange: (l) => t({ ...n, color: l.target.value }),
                  className: 'w-12 h-8 rounded border cursor-pointer',
                  title: 'Colore personalizzato',
                }),
                e.jsxs('span', {
                  className: 'text-sm text-gray-600 dark:text-gray-400',
                  children: ['Colore: ', n.color],
                }),
              ],
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'relative group',
          children: [
            e.jsx('div', {
              className:
                'absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity',
            }),
            e.jsxs('div', {
              className:
                'relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-gray-700/50',
              children: [
                e.jsx('label', { className: `block ${w.label} mb-2`, children: 'Tariffe (€/ora)' }),
                e.jsxs('div', {
                  className: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
                  children: [
                    e.jsxs('div', {
                      className: 'relative group',
                      children: [
                        e.jsx('div', {
                          className:
                            'absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity',
                        }),
                        e.jsxs('div', {
                          className:
                            'relative p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-blue-200/50 dark:border-blue-700/50 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1',
                          children: [
                            e.jsxs('label', {
                              className:
                                'flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 mb-3',
                              children: [
                                e.jsx('span', { className: 'text-lg', children: '🎯' }),
                                e.jsx('span', { children: 'Lezione Singola' }),
                              ],
                            }),
                            e.jsx('input', {
                              type: 'number',
                              min: '0',
                              value: n.priceSingle || 0,
                              onChange: (l) =>
                                t({ ...n, priceSingle: parseFloat(l.target.value) || 0 }),
                              className:
                                'w-full p-3 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white border-2 border-blue-300/50 dark:border-blue-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg font-semibold placeholder-gray-400 dark:placeholder-gray-500',
                              placeholder: '50€',
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'relative group',
                      children: [
                        e.jsx('div', {
                          className:
                            'absolute inset-0 bg-gradient-to-r from-green-400 to-teal-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity',
                        }),
                        e.jsxs('div', {
                          className:
                            'relative p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-green-200/50 dark:border-green-700/50 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-1',
                          children: [
                            e.jsxs('label', {
                              className:
                                'flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-400 mb-3',
                              children: [
                                e.jsx('span', { className: 'text-lg', children: '👥' }),
                                e.jsx('span', { children: 'Lezione di Coppia' }),
                              ],
                            }),
                            e.jsx('input', {
                              type: 'number',
                              min: '0',
                              value: n.priceCouple || 0,
                              onChange: (l) =>
                                t({ ...n, priceCouple: parseFloat(l.target.value) || 0 }),
                              className:
                                'w-full p-3 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white border-2 border-green-300/50 dark:border-green-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg font-semibold placeholder-gray-400 dark:placeholder-gray-500',
                              placeholder: '70€',
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'relative group',
                      children: [
                        e.jsx('div', {
                          className:
                            'absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity',
                        }),
                        e.jsxs('div', {
                          className:
                            'relative p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-purple-200/50 dark:border-purple-700/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1',
                          children: [
                            e.jsxs('label', {
                              className:
                                'flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 mb-3',
                              children: [
                                e.jsx('span', { className: 'text-lg', children: '👨‍�‍�' }),
                                e.jsx('span', { children: 'Lezione a 3 Persone' }),
                              ],
                            }),
                            e.jsx('input', {
                              type: 'number',
                              min: '0',
                              value: n.priceThree || 0,
                              onChange: (l) =>
                                t({ ...n, priceThree: parseFloat(l.target.value) || 0 }),
                              className:
                                'w-full p-3 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white border-2 border-purple-300/50 dark:border-purple-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg font-semibold placeholder-gray-400 dark:placeholder-gray-500',
                              placeholder: '90€',
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'relative group',
                      children: [
                        e.jsx('div', {
                          className:
                            'absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity',
                        }),
                        e.jsxs('div', {
                          className:
                            'relative p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-orange-200/50 dark:border-orange-700/50 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 transform hover:-translate-y-1',
                          children: [
                            e.jsxs('label', {
                              className:
                                'flex items-center gap-2 text-sm font-bold text-orange-600 dark:text-orange-400 mb-3',
                              children: [
                                e.jsx('span', { className: 'text-lg', children: '🏆' }),
                                e.jsx('span', { children: 'Partita Lezione' }),
                              ],
                            }),
                            e.jsx('input', {
                              type: 'number',
                              min: '0',
                              value: n.priceMatchLesson || 0,
                              onChange: (l) =>
                                t({ ...n, priceMatchLesson: parseFloat(l.target.value) || 0 }),
                              className:
                                'w-full p-3 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white border-2 border-orange-300/50 dark:border-orange-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-lg font-semibold placeholder-gray-400 dark:placeholder-gray-500',
                              placeholder: '80€',
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx('div', {
                  className:
                    'mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50',
                  children: e.jsxs('div', {
                    className: 'flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300',
                    children: [
                      e.jsx('span', { className: 'text-base', children: '💡' }),
                      e.jsx('span', { className: 'font-medium', children: 'Neural Tip:' }),
                      e.jsx('span', {
                        children:
                          'Prezzi per ora di lezione. Impostare a 0 per disabilitare la tipologia.',
                      }),
                    ],
                  }),
                }),
              ],
            }),
          ],
        }),
        e.jsxs('div', {
          children: [
            e.jsx('label', { className: `block ${w.label} mb-2`, children: 'Specialità' }),
            e.jsx('div', {
              className: 'grid grid-cols-2 gap-2 mb-2',
              children: i.map((l) => {
                const I = n.specialties.includes(l);
                return e.jsx(
                  'button',
                  {
                    type: 'button',
                    onClick: () => {
                      const B = I ? n.specialties.filter((D) => D !== l) : [...n.specialties, l];
                      t({ ...n, specialties: B });
                    },
                    className: `p-2 rounded-lg text-sm font-medium transition-all duration-200 ${I ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`,
                    children: l,
                  },
                  l
                );
              }),
            }),
            e.jsxs('div', {
              className: 'flex gap-2 mb-2',
              children: [
                e.jsx('input', {
                  type: 'text',
                  value: v,
                  onChange: (l) => d(l.target.value),
                  className: `flex-1 ${w.input}`,
                  placeholder: 'Specialità personalizzata...',
                  onKeyPress: (l) => l.key === 'Enter' && (l.preventDefault(), y()),
                }),
                e.jsx('button', {
                  type: 'button',
                  onClick: y,
                  disabled: !v.trim(),
                  className:
                    'px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
                  children: 'Aggiungi',
                }),
              ],
            }),
          ],
        }),
        e.jsxs('div', {
          children: [
            e.jsx('label', {
              className: `block ${w.label} mb-2`,
              children: 'Biografia Istruttore',
            }),
            e.jsx('textarea', {
              value: n.bio,
              onChange: (l) => t({ ...n, bio: l.target.value }),
              rows: 4,
              maxLength: 500,
              className: `w-full ${w.textarea} resize-none`,
              placeholder: "Descrivi l'esperienza e le competenze dell'istruttore...",
            }),
            e.jsxs('div', {
              className: 'flex justify-between items-center mt-1',
              children: [
                e.jsxs('span', {
                  className: 'text-xs text-gray-500 dark:text-gray-400',
                  children: [n.bio.length, '/500 caratteri'],
                }),
                n.bio.length > 450 &&
                  e.jsx('span', {
                    className: 'text-xs text-orange-500',
                    children: 'Limite quasi raggiunto',
                  }),
              ],
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600',
          children: [
            e.jsx('button', {
              type: 'button',
              onClick: u,
              className:
                'flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors',
              children: 'Annulla',
            }),
            e.jsx('button', {
              type: 'submit',
              className:
                'flex-1 py-2 px-4 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 font-medium transition-colors',
              children: 'Salva',
            }),
          ],
        }),
      ],
    }),
  });
}
function Be({ T: s, user: u, state: o, setState: N, clubMode: h }) {
  const { user: w } = be(),
    n = w || u,
    {
      lessonBookings: t,
      loading: v,
      createLessonBooking: d,
      cancelBooking: f,
      clearAllLessons: O,
      refresh: i,
    } = De(),
    { bookings: S } = Me(),
    L = $e(s),
    y = o?.lessonConfig || Ie(),
    l = o?.players || [],
    [I, B] = m.useState('book'),
    [D, W] = m.useState(1),
    [C, Q] = m.useState(''),
    [H, Y] = m.useState(null),
    [T, V] = m.useState(''),
    [Z, a] = m.useState(1),
    [x, c] = m.useState([]),
    [A, E] = m.useState({ type: '', text: '' }),
    ye = m.useCallback(async () => {
      if (
        window.confirm(
          '⚠️ ATTENZIONE: Questa azione cancellerà TUTTE le prenotazioni di lezione e i relativi slot nei campi. Continuare?'
        )
      ) {
        console.log('🗑️ Clearing all lesson bookings...');
        try {
          const r = await O();
          (console.log(`✅ Cleared ${r} lesson bookings successfully`),
            E({ type: 'success', text: `Cancellate ${r} prenotazioni di lezione con successo!` }),
            setTimeout(() => E({ type: '', text: '' }), 3e3));
        } catch (r) {
          (console.error('❌ Error clearing lesson bookings:', r),
            E({ type: 'error', text: 'Errore durante la cancellazione delle prenotazioni.' }));
        }
      }
    }, [O]),
    ve = m.useCallback(
      (r) => {
        N((b) => ({ ...b, lessonConfig: r }));
      },
      [N]
    );
  m.useEffect(() => {
    I === 'admin' && !h && B('book');
  }, [I, h]);
  const U = m.useMemo(
      () => l.filter((r) => r.category === se.INSTRUCTOR && r.instructorData?.isInstructor),
      [l]
    ),
    ce = m.useCallback(
      (r) => {
        const F = new Date(r).getDay(),
          j = (y.timeSlots || []).filter((p) => p.dayOfWeek === F && p.isActive);
        return j.length === 0
          ? !1
          : j.some((p) => {
              const k = parseInt(p.startTime.split(':')[0]),
                q = parseInt(p.startTime.split(':')[1]),
                ie = parseInt(p.endTime.split(':')[0]),
                le = parseInt(p.endTime.split(':')[1]),
                ne = k * 60 + q,
                te = ie * 60 + le;
              let _ = !1;
              for (let P = ne; P < te; P += 60) {
                if (P + 60 > te) continue;
                const J = Math.floor(P / 60),
                  X = P % 60,
                  M = `${J.toString().padStart(2, '0')}:${X.toString().padStart(2, '0')}`,
                  ee = U.filter(
                    ($) =>
                      p.instructorIds.includes($.id) &&
                      !S.some((z) => {
                        const g = z.status || 'confirmed';
                        return (
                          z.date === r &&
                          z.time === M &&
                          z.instructorId === $.id &&
                          g === 'confirmed'
                        );
                      })
                  ),
                  re = (o?.courts || []).filter(($) =>
                    p.courtIds.includes($.id)
                      ? !S.some((g) => {
                          const R = g.status || 'confirmed';
                          if (g.courtId !== $.id || g.date !== r || R !== 'confirmed') return !1;
                          const G = parseInt(M.split(':')[0]) * 60 + parseInt(M.split(':')[1]),
                            oe = G + 60,
                            ae =
                              parseInt(g.time.split(':')[0]) * 60 + parseInt(g.time.split(':')[1]),
                            de = ae + (g.duration || 90);
                          return G < de && ae < oe;
                        })
                      : !1
                  );
                ee.length > 0 && re.length > 0 && (_ = !0);
              }
              return _;
            });
      },
      [y.timeSlots, U, S, o?.courts]
    ),
    me = m.useMemo(() => {
      const r = [],
        b = new Date(),
        F = new Set();
      (y.timeSlots || []).forEach((j) => {
        j.isActive && F.add(j.dayOfWeek);
      });
      for (let j = 0; j < 7; j++) {
        const p = new Date(b);
        p.setDate(b.getDate() + j);
        const k = p.getDay(),
          q = p.toISOString().split('T')[0];
        F.has(k) &&
          ce(q) &&
          r.push({
            date: q,
            dayOfWeek: k,
            display: p.toLocaleDateString('it-IT', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            }),
          });
      }
      return r;
    }, [y.timeSlots, ce]),
    xe = m.useMemo(() => {
      if (!C) return [];
      const b = new Date(C).getDay(),
        F = (y.timeSlots || []).filter((k) => k.dayOfWeek === b && k.isActive),
        j = new Map();
      F.forEach((k) => {
        const q = parseInt(k.startTime.split(':')[0]),
          ie = parseInt(k.startTime.split(':')[1]),
          le = parseInt(k.endTime.split(':')[0]),
          ne = parseInt(k.endTime.split(':')[1]),
          te = q * 60 + ie,
          _ = le * 60 + ne;
        for (let P = te; P < _ && !(P + 60 > _); P += 60) {
          const J = Math.floor(P / 60),
            X = P % 60,
            M = `${J.toString().padStart(2, '0')}:${X.toString().padStart(2, '0')}`,
            ee = U.filter(
              ($) =>
                k.instructorIds.includes($.id) &&
                !S.some((z) => {
                  const g = z.status || 'confirmed';
                  return (
                    z.date === C && z.time === M && z.instructorId === $.id && g === 'confirmed'
                  );
                })
            ),
            re = (o?.courts || []).filter(($) =>
              k.courtIds.includes($.id)
                ? !S.some((g) => {
                    const R = g.status || 'confirmed';
                    if (g.courtId !== $.id || g.date !== C || R !== 'confirmed') return !1;
                    const G = parseInt(M.split(':')[0]) * 60 + parseInt(M.split(':')[1]),
                      oe = G + 60,
                      ae = parseInt(g.time.split(':')[0]) * 60 + parseInt(g.time.split(':')[1]),
                      de = ae + (g.duration || 90);
                    return G < de && ae < oe;
                  })
                : !1
            );
          if (ee.length > 0 && re.length > 0)
            if (j.has(M)) {
              const $ = j.get(M),
                z = [...$.availableInstructors];
              ee.forEach((R) => {
                z.some((G) => G.id === R.id) || z.push(R);
              });
              const g = [...$.availableCourts];
              (re.forEach((R) => {
                g.some((G) => G.id === R.id) || g.push(R);
              }),
                j.set(M, { ...$, availableInstructors: z, availableCourts: g }));
            } else
              j.set(M, {
                id: `${C}-${M}`,
                time: M,
                displayTime: `${J.toString().padStart(2, '0')}:${X.toString().padStart(2, '0')} - ${(J + 1).toString().padStart(2, '0')}:${X.toString().padStart(2, '0')}`,
                availableInstructors: ee,
                availableCourts: re,
                configSlot: k,
              });
        }
      });
      const p = Array.from(j.values());
      return (
        p.length === 0 &&
          F.length > 0 &&
          console.warn(
            '⚠️ No available slots found despite having configured time slots. Check instructor/court availability.'
          ),
        p.sort((k, q) => k.time.localeCompare(q.time))
      );
    }, [C, y.timeSlots, U, S, o?.courts]),
    fe = m.useCallback(async () => {
      if (!C || !H || !T) {
        E({ type: 'error', text: 'Seleziona data, orario e maestro per continuare.' });
        return;
      }
      try {
        E({ type: '', text: '' });
        const r = H.availableCourts[0],
          b = U.find((p) => p.id === T),
          F = {
            instructorId: T,
            instructorName: b?.name,
            lessonType: 'individual',
            courtId: r.id,
            courtName: r.name,
            date: C,
            time: H.time,
            duration: 60,
            numberOfPlayers: Z,
            price: 0,
            notes: `Lezione con ${b?.name}`,
            players: [n?.displayName || n?.email],
            userPhone: '',
            bookedBy: n?.displayName || n?.email,
            createCourtBooking: !1,
          };
        console.log('Creating unified lesson booking:', F);
        const j = await d(F);
        (console.log('✅ Created unified lesson booking:', j),
          E({ type: 'success', text: 'Lezione prenotata con successo!' }),
          W(1),
          Q(''),
          Y(null),
          V(''),
          c([]),
          await i(),
          setTimeout(() => E({ type: '', text: '' }), 3e3));
      } catch (r) {
        (console.error('Error booking lesson:', r),
          E({ type: 'error', text: 'Errore durante la prenotazione della lezione.' }));
      }
    }, [C, H, T, U, d, n, i]),
    je = m.useCallback(
      async (r) => {
        if (window.confirm('Sei sicuro di voler cancellare questa lezione?'))
          try {
            (await f(r),
              E({ type: 'success', text: 'Lezione cancellata con successo!' }),
              setTimeout(() => E({ type: '', text: '' }), 3e3));
          } catch (b) {
            (console.error('Error cancelling lesson:', b),
              E({ type: 'error', text: 'Errore durante la cancellazione della lezione.' }));
          }
      },
      [f]
    ),
    ue = () => W((r) => Math.min(r + 1, 3)),
    ge = () => W((r) => Math.max(r - 1, 1));
  return v
    ? e.jsx(K, {
        T: s,
        title: 'Prenota Lezione',
        className: 'space-y-6',
        children: e.jsxs('div', {
          className: 'flex items-center justify-center py-12',
          children: [
            e.jsx('div', {
              className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600',
            }),
            e.jsx('span', {
              className: 'ml-2 text-gray-600 dark:text-gray-300',
              children: 'Caricamento...',
            }),
          ],
        }),
      })
    : e.jsxs(K, {
        T: s,
        title: 'Prenota Lezione',
        className: 'space-y-6',
        children: [
          A.text &&
            e.jsx('div', {
              className: `p-4 rounded-lg ${A.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : A.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`,
              children: A.text,
            }),
          e.jsxs('div', {
            className: 'flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1',
            children: [
              e.jsx('button', {
                onClick: () => B('book'),
                className: `px-4 py-2 rounded-md text-sm font-medium transition-colors ${I === 'book' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-emerald-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`,
                children: 'Prenota Lezione',
              }),
              e.jsxs('button', {
                onClick: () => B('bookings'),
                className: `px-4 py-2 rounded-md text-sm font-medium transition-colors ${I === 'bookings' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-emerald-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`,
                children: [
                  'Le Mie Lezioni',
                  ' ',
                  t.length > 0 &&
                    e.jsx(he, {
                      variant: 'primary',
                      size: 'sm',
                      className: 'ml-2',
                      children: t.filter((r) => r.status === 'confirmed').length,
                    }),
                ],
              }),
              h &&
                e.jsx('button', {
                  onClick: () => B('admin'),
                  className: `px-4 py-2 rounded-md text-sm font-medium transition-colors ${I === 'admin' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-emerald-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`,
                  children: 'Gestione',
                }),
            ],
          }),
          I === 'book' &&
            e.jsxs('div', {
              className: 'bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600 p-6',
              children: [
                e.jsxs('div', {
                  className: 'mb-6',
                  children: [
                    e.jsx('div', {
                      className: 'flex items-center justify-between text-sm',
                      children: [1, 2, 3].map((r) =>
                        e.jsxs(
                          'div',
                          {
                            className: `flex items-center ${r < 3 ? 'flex-1' : ''}`,
                            children: [
                              e.jsx('div', {
                                className: `w-8 h-8 rounded-full flex items-center justify-center ${D >= r ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`,
                                children: r,
                              }),
                              r < 3 &&
                                e.jsx('div', {
                                  className: `flex-1 h-0.5 mx-2 ${D > r ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'}`,
                                }),
                            ],
                          },
                          r
                        )
                      ),
                    }),
                    e.jsxs('div', {
                      className: 'mt-2 text-sm text-gray-600 dark:text-gray-300',
                      children: [
                        D === 1 && 'Scegli il Giorno',
                        D === 2 && 'Seleziona Orario',
                        D === 3 && 'Scegli Maestro e Conferma',
                      ],
                    }),
                  ],
                }),
                D === 1 &&
                  e.jsxs('div', {
                    className: 'space-y-4',
                    children: [
                      e.jsx('h3', {
                        className: 'text-lg font-semibold text-gray-900 dark:text-white',
                        children: 'Scegli il Giorno',
                      }),
                      e.jsx('p', {
                        className: 'text-sm text-gray-600 dark:text-gray-300',
                        children: 'Prossimi 7 giorni disponibili per le lezioni',
                      }),
                      me.length === 0
                        ? e.jsxs('div', {
                            className: 'text-center py-8 text-gray-500',
                            children: [
                              e.jsx('div', { className: 'text-4xl mb-2', children: '📅' }),
                              e.jsx('p', {
                                className: 'mb-2',
                                children: 'Nessun giorno disponibile per le lezioni',
                              }),
                              e.jsx('p', {
                                className: 'text-sm',
                                children:
                                  'Non ci sono slot prenotabili con maestri disponibili nei prossimi 7 giorni.',
                              }),
                              e.jsx('p', {
                                className: 'text-sm',
                                children:
                                  "Contatta l'amministrazione per verificare la disponibilità.",
                              }),
                            ],
                          })
                        : e.jsx('div', {
                            className:
                              'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3',
                            children: me.map((r) => {
                              const b = r.date === new Date().toISOString().split('T')[0];
                              return e.jsxs(
                                'button',
                                {
                                  onClick: () => {
                                    (Q(r.date), Y(null), V(''), c([]), ue());
                                  },
                                  className: `p-3 rounded-xl border text-center transition-all duration-200 hover:scale-105 active:scale-95 ${C === r.date ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-lg' : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md'} ${b ? 'ring-2 ring-green-300 dark:ring-green-500 bg-green-50 dark:bg-green-900/30' : ''}`,
                                  children: [
                                    e.jsx('div', {
                                      className: 'text-xs text-gray-500 uppercase mb-1 font-medium',
                                      children: r.display.split(' ')[0],
                                    }),
                                    e.jsx('div', {
                                      className: 'font-bold text-xl mb-1',
                                      children: r.display.split(' ')[1],
                                    }),
                                    e.jsx('div', {
                                      className:
                                        'text-xs text-gray-600 dark:text-gray-300 font-medium',
                                      children: r.display.split(' ')[2],
                                    }),
                                    b &&
                                      e.jsx('div', {
                                        className:
                                          'text-xs text-green-600 font-bold mt-1 bg-green-100 rounded-full px-2 py-0.5',
                                        children: 'OGGI',
                                      }),
                                  ],
                                },
                                r.date
                              );
                            }),
                          }),
                    ],
                  }),
                D === 2 &&
                  e.jsxs('div', {
                    className: 'space-y-4',
                    children: [
                      e.jsx('h3', {
                        className: 'text-lg font-semibold text-gray-900 dark:text-white',
                        children: 'Seleziona Orario',
                      }),
                      e.jsxs('div', {
                        className: 'text-sm text-gray-600 dark:text-gray-300 mb-4',
                        children: [
                          'Data selezionata:',
                          ' ',
                          e.jsx('span', {
                            className: 'font-medium',
                            children: new Date(C).toLocaleDateString('it-IT', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }),
                          }),
                        ],
                      }),
                      xe.length === 0
                        ? e.jsxs('div', {
                            className: 'text-center py-8 text-gray-500',
                            children: [
                              e.jsx('div', { className: 'text-4xl mb-2', children: '⏰' }),
                              e.jsx('p', {
                                className: 'mb-2',
                                children: 'Nessun orario prenotabile per questa data',
                              }),
                              e.jsx('p', {
                                className: 'text-sm',
                                children:
                                  'Tutti gli slot sono già occupati o non hanno maestri disponibili.',
                              }),
                              e.jsx('p', {
                                className: 'text-sm',
                                children: "Prova con un altro giorno o contatta l'amministrazione.",
                              }),
                            ],
                          })
                        : e.jsxs('div', {
                            className: 'space-y-4',
                            children: [
                              e.jsx('p', {
                                className: 'text-sm text-gray-600 dark:text-gray-300',
                                children: 'Orari disponibili (lezioni di 1 ora):',
                              }),
                              e.jsx('div', {
                                className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3',
                                children: xe.map((r) =>
                                  e.jsxs(
                                    'button',
                                    {
                                      onClick: () => {
                                        (Y(r),
                                          c(r.availableInstructors),
                                          r.availableInstructors.length === 1
                                            ? V(r.availableInstructors[0].id)
                                            : V(''),
                                          ue());
                                      },
                                      className: `p-4 rounded-xl border text-center transition-all duration-200 hover:scale-105 active:scale-95 ${H?.id === r.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-lg' : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md'}`,
                                      children: [
                                        e.jsx('div', {
                                          className:
                                            'font-bold text-lg mb-2 text-gray-800 dark:text-gray-200',
                                          children: r.displayTime,
                                        }),
                                        e.jsxs('div', {
                                          className:
                                            'text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center gap-1',
                                          children: [
                                            e.jsx('span', {
                                              className: 'text-blue-600',
                                              children: '👨‍🏫',
                                            }),
                                            e.jsxs('span', {
                                              children: [
                                                r.availableInstructors.length,
                                                ' maestr',
                                                r.availableInstructors.length === 1 ? 'o' : 'i',
                                              ],
                                            }),
                                          ],
                                        }),
                                      ],
                                    },
                                    r.id
                                  )
                                ),
                              }),
                            ],
                          }),
                      e.jsx('div', {
                        className: 'flex justify-between pt-4',
                        children: e.jsx('button', {
                          onClick: ge,
                          className:
                            'px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors',
                          children: '← Cambia Giorno',
                        }),
                      }),
                    ],
                  }),
                D === 3 &&
                  e.jsxs('div', {
                    className: 'space-y-6',
                    children: [
                      e.jsx('h3', {
                        className: 'text-lg font-semibold text-gray-900 dark:text-white',
                        children: 'Scegli Maestro e Conferma',
                      }),
                      e.jsxs('div', {
                        className: 'bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3',
                        children: [
                          e.jsxs('div', {
                            className: 'flex justify-between',
                            children: [
                              e.jsx('span', {
                                className: 'text-gray-600 dark:text-gray-300',
                                children: 'Data:',
                              }),
                              e.jsx('span', {
                                className: 'font-medium text-gray-900 dark:text-white',
                                children: new Date(C).toLocaleDateString('it-IT', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                }),
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            className: 'flex justify-between',
                            children: [
                              e.jsx('span', {
                                className: 'text-gray-600 dark:text-gray-300',
                                children: 'Orario:',
                              }),
                              e.jsx('span', {
                                className: 'font-medium text-gray-900 dark:text-white',
                                children: H?.displayTime,
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            className: 'flex justify-between',
                            children: [
                              e.jsx('span', {
                                className: 'text-gray-600 dark:text-gray-300',
                                children: 'Durata:',
                              }),
                              e.jsx('span', {
                                className: 'font-medium text-gray-900 dark:text-white',
                                children: '60 minuti',
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            className: 'flex justify-between',
                            children: [
                              e.jsx('span', {
                                className: 'text-gray-600 dark:text-gray-300',
                                children: 'Giocatori:',
                              }),
                              e.jsx('span', {
                                className: 'font-medium text-gray-900 dark:text-white',
                                children: Z,
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        className: 'space-y-3',
                        children: [
                          e.jsx('h4', {
                            className: 'text-md font-medium text-gray-900 dark:text-white',
                            children: '👥 Numero di Giocatori',
                          }),
                          e.jsx('div', {
                            className: 'grid grid-cols-4 gap-2',
                            children: [1, 2, 3, 4].map((r) =>
                              e.jsxs(
                                'button',
                                {
                                  onClick: () => a(r),
                                  className: `p-3 rounded-lg border-2 transition-all ${Z === r ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`,
                                  children: [
                                    e.jsx('div', { className: 'text-lg font-bold', children: r }),
                                    e.jsx('div', {
                                      className: 'text-xs',
                                      children: r === 1 ? 'giocatore' : 'giocatori',
                                    }),
                                  ],
                                },
                                r
                              )
                            ),
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        className: 'space-y-4',
                        children: [
                          e.jsxs('h4', {
                            className: 'text-md font-medium text-gray-900 dark:text-white',
                            children: [
                              'Maestr',
                              x.length === 1 ? 'o disponibile' : 'i disponibili',
                              ' (',
                              x.length,
                              ')',
                            ],
                          }),
                          x.length === 1
                            ? e.jsx('div', {
                                className:
                                  'border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700',
                                children: e.jsxs('div', {
                                  className: 'flex items-center gap-3',
                                  children: [
                                    e.jsx('div', {
                                      className:
                                        'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg',
                                      style: { backgroundColor: x[0].instructorData?.color },
                                      children: x[0].name?.charAt(0) || '?',
                                    }),
                                    e.jsxs('div', {
                                      children: [
                                        e.jsx('div', {
                                          className:
                                            'font-medium text-lg text-gray-900 dark:text-white',
                                          children: x[0].name,
                                        }),
                                        x[0].instructorData?.specialties?.length > 0 &&
                                          e.jsx('div', {
                                            className: 'text-sm text-gray-600 dark:text-gray-300',
                                            children: x[0].instructorData.specialties.join(', '),
                                          }),
                                        x[0].instructorData?.hourlyRate > 0 &&
                                          e.jsxs('div', {
                                            className:
                                              'text-sm font-semibold text-blue-600 dark:text-blue-400',
                                            children: ['€', x[0].instructorData.hourlyRate, '/ora'],
                                          }),
                                      ],
                                    }),
                                  ],
                                }),
                              })
                            : e.jsx('div', {
                                className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                                children: x.map((r) =>
                                  e.jsxs(
                                    'button',
                                    {
                                      onClick: () => V(r.id),
                                      className: `p-4 rounded-lg border-2 text-left transition-colors ${T === r.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`,
                                      children: [
                                        e.jsxs('div', {
                                          className: 'flex items-center gap-3 mb-2',
                                          children: [
                                            e.jsx('div', {
                                              className:
                                                'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold',
                                              style: { backgroundColor: r.instructorData?.color },
                                              children: r.name?.charAt(0) || '?',
                                            }),
                                            e.jsx('div', {
                                              className:
                                                'font-medium text-gray-900 dark:text-white',
                                              children: r.name,
                                            }),
                                          ],
                                        }),
                                        r.instructorData?.specialties?.length > 0 &&
                                          e.jsx('div', {
                                            className:
                                              'text-sm text-gray-600 dark:text-gray-300 mb-1',
                                            children: r.instructorData.specialties.join(', '),
                                          }),
                                        r.instructorData?.hourlyRate > 0 &&
                                          e.jsxs('div', {
                                            className: 'text-sm font-semibold text-blue-600',
                                            children: ['€', r.instructorData.hourlyRate, '/ora'],
                                          }),
                                      ],
                                    },
                                    r.id
                                  )
                                ),
                              }),
                          x.length > 1 &&
                            !T &&
                            e.jsx('p', {
                              className:
                                'text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-3',
                              children: '⚠️ Seleziona un maestro per procedere con la prenotazione',
                            }),
                        ],
                      }),
                      e.jsxs('div', {
                        className: 'flex justify-between pt-4',
                        children: [
                          e.jsx('button', {
                            onClick: ge,
                            className:
                              'px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors',
                            children: '← Cambia Orario',
                          }),
                          e.jsx('button', {
                            onClick: fe,
                            disabled: !T,
                            className: `px-6 py-2 rounded-lg font-medium transition-colors ${T ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`,
                            children: 'Conferma Prenotazione',
                          }),
                        ],
                      }),
                    ],
                  }),
              ],
            }),
          I === 'bookings' &&
            e.jsxs('div', {
              className: 'bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600 p-6',
              children: [
                e.jsx('h3', {
                  className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
                  children: 'Le Mie Lezioni',
                }),
                t.length === 0
                  ? e.jsx('div', {
                      className: 'text-center py-8 text-gray-500 dark:text-gray-400',
                      children: 'Non hai ancora prenotato nessuna lezione.',
                    })
                  : e.jsx('div', {
                      className: 'space-y-4',
                      children: t
                        .filter((r) => r.status === 'confirmed')
                        .sort(
                          (r, b) =>
                            new Date(r.date + 'T' + r.time) - new Date(b.date + 'T' + b.time)
                        )
                        .map((r) =>
                          e.jsx(
                            'div',
                            {
                              className:
                                'border dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                              children: e.jsxs('div', {
                                className: 'flex justify-between items-start',
                                children: [
                                  e.jsxs('div', {
                                    className: 'space-y-2',
                                    children: [
                                      e.jsxs('div', {
                                        className: 'font-medium text-gray-900 dark:text-white',
                                        children: [
                                          'Lezione con',
                                          ' ',
                                          U.find((b) => b.id === r.instructorId)?.name ||
                                            r.instructorName,
                                        ],
                                      }),
                                      e.jsxs('div', {
                                        className: 'text-sm text-gray-600 dark:text-gray-300',
                                        children: [
                                          '📅',
                                          ' ',
                                          new Date(r.date).toLocaleDateString('it-IT', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                          }),
                                        ],
                                      }),
                                      e.jsxs('div', {
                                        className: 'text-sm text-gray-600 dark:text-gray-300',
                                        children: ['🕐 ', r.time, ' - ', r.duration, ' minuti'],
                                      }),
                                      r.courtName &&
                                        e.jsxs('div', {
                                          className: 'text-sm text-gray-600 dark:text-gray-300',
                                          children: ['🎾 Campo: ', r.courtName],
                                        }),
                                    ],
                                  }),
                                  e.jsx('button', {
                                    onClick: () => je(r.id),
                                    className:
                                      'px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors',
                                    children: 'Cancella',
                                  }),
                                ],
                              }),
                            },
                            r.id
                          )
                        ),
                    }),
              ],
            }),
          I === 'admin' &&
            h &&
            e.jsx(Le, {
              T: s,
              ds: L,
              lessonConfig: y,
              updateLessonConfig: ve,
              instructors: U,
              players: l,
              setState: N,
              state: o,
              courts: o?.courts || [],
              onClearAllLessons: ye,
              lessonBookingsCount: t?.length || 0,
            }),
        ],
      });
}
function Ve() {
  const { user: s } = be(),
    { state: u, setState: o } = Ne(),
    { clubMode: N } = we(),
    h = Ce.useMemo(() => Se(), []);
  return e.jsx(Be, { T: h, user: s, state: u, setState: o, clubMode: N });
}
export { Ve as default };
