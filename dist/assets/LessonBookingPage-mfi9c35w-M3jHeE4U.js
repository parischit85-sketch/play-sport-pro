import { j as e, i as fe, u as ge, f as je, k as ke, t as Ne } from './index-mfi9c35w-CsSxx0JE.js';
import { r as m, b as we } from './router-mfi9c35w-8jyiX-w-.js';
import { S as K } from './Section-mfi9c35w-BVpF_AdT.js';
import { B as be } from './Badge-mfi9c35w-BZ5VokVV.js';
import { c as Se } from './design-system-mfi9c35w-B5fzZ68S.js';
import { P as te, c as Ce, a as $e } from './playerTypes-mfi9c35w-CIm-hM8a.js';
import { b as ze, u as Ie } from './useUnifiedBookings-mfi9c35w-C4D5ju_K.js';
import { M as he } from './Modal-mfi9c35w-CcDrB430.js';
import './vendor-mfi9c35w-D3F3s8fL.js';
import './firebase-mfi9c35w-X_I_guKF.js';
import './unified-booking-service-mfi9c35w-Dow-Gq1E.js';
function De({
  T: s,
  ds: u,
  lessonConfig: d,
  updateLessonConfig: N,
  instructors: b,
  players: w,
  setState: n,
  state: t,
  courts: y,
  onClearAllLessons: c,
  lessonBookingsCount: v,
}) {
  const [O, i] = m.useState('config'),
    [S, A] = m.useState(!1),
    [p, l] = m.useState(null),
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
    Q = m.useMemo(() => (w || []).filter((a) => a.category !== te.INSTRUCTOR), [w]),
    H = () => {
      N({ ...d, isEnabled: !d.isEnabled });
    },
    Y = (a) => {
      const k = p
        ? (d.timeSlots || []).map((o) => (o.id === p.id ? { ...o, ...a } : o))
        : [...(d.timeSlots || []), { ...Ce(), ...a, id: fe() }];
      (N({ ...d, timeSlots: k }), A(!1), l(null));
    },
    T = (a) => {
      confirm('Sei sicuro di voler eliminare questa fascia oraria?') &&
        N({ ...d, timeSlots: (d.timeSlots || []).filter((k) => k.id !== a) });
    },
    V = (a) => {
      const k = (w || []).map((o) =>
        o.id === D.id
          ? {
              ...o,
              category: te.INSTRUCTOR,
              instructorData: { ...o.instructorData, isInstructor: !0, ...a },
            }
          : o
      );
      (n((o) => ({ ...o, players: k })), B(!1), W(null));
    },
    M = (a) => {
      if (confirm('Sei sicuro di voler rimuovere questo giocatore come istruttore?')) {
        const k = (w || []).map((o) =>
          o.id === a
            ? {
                ...o,
                category: te.MEMBER,
                instructorData: { ...o.instructorData, isInstructor: !1 },
              }
            : o
        );
        n((o) => ({ ...o, players: k }));
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
                          children: d.isEnabled
                            ? '✅ Il sistema di prenotazione lezioni è attivo e funzionante'
                            : '❌ Il sistema di prenotazione lezioni è disattivato',
                        }),
                      ],
                    }),
                    e.jsx('button', {
                      onClick: H,
                      className: `px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${d.isEnabled ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 border border-red-300 dark:border-red-700' : 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/60 border border-green-300 dark:border-green-700'}`,
                      children: d.isEnabled ? '🛑 Disattiva' : '🚀 Attiva',
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
                          value: d.bookingAdvanceDays,
                          onChange: (a) =>
                            N({ ...d, bookingAdvanceDays: parseInt(a.target.value) || 14 }),
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
                          value: d.cancellationHours,
                          onChange: (a) =>
                            N({ ...d, cancellationHours: parseInt(a.target.value) || 24 }),
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
                  onClick: () => A(!0),
                  className:
                    'px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600',
                  children: '+ Aggiungi Fascia Oraria',
                }),
                ' ',
                (d.timeSlots || []).length === 0
                  ? e.jsx('div', {
                      className: `text-center py-8 ${s.subtext}`,
                      children:
                        'Nessuna fascia oraria configurata. Crea la prima fascia per iniziare.',
                    })
                  : e.jsx('div', {
                      className: 'space-y-3',
                      children: (d.timeSlots || []).map((a) => {
                        const k = C.find((F) => F.value === a.dayOfWeek)?.label || 'Sconosciuto',
                          o = (b || []).filter((F) => a.instructorIds.includes(F.id));
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
                                          children: [k, ' • ', a.startTime, ' - ', a.endTime],
                                        }),
                                        e.jsx(be, {
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
                                        e.jsxs('span', { children: ['Istruttori: ', o.length] }),
                                      ],
                                    }),
                                    o.length > 0 &&
                                      e.jsx('div', {
                                        className: 'mt-2',
                                        children: e.jsx('div', {
                                          className: 'flex flex-wrap gap-1',
                                          children: o.map((F) =>
                                            e.jsxs(
                                              'div',
                                              {
                                                className:
                                                  'flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300',
                                                children: [
                                                  e.jsx('div', {
                                                    className: 'w-3 h-3 rounded-full',
                                                    style: {
                                                      backgroundColor: F.instructorData?.color,
                                                    },
                                                  }),
                                                  F.name,
                                                ],
                                              },
                                              F.id
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
                                        (l(a), A(!0));
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
                      children: ['Istruttori Attivi (', b.length, ')'],
                    }),
                    b.length === 0
                      ? e.jsx('div', {
                          className: `text-center py-6 ${s.subtext}`,
                          children: 'Nessun istruttore configurato',
                        })
                      : e.jsx('div', {
                          className: 'space-y-3',
                          children: b.map((a) =>
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
                                                      (k, o) =>
                                                        e.jsxs(
                                                          'span',
                                                          {
                                                            className:
                                                              'px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs border border-indigo-200 dark:border-indigo-700',
                                                            children: ['⭐ ', k],
                                                          },
                                                          o
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
                                          onClick: () => M(a.id),
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
                                v === 0
                                  ? 'Nessuna prenotazione di lezione presente'
                                  : v === 1
                                    ? '1 prenotazione di lezione presente'
                                    : `${v} prenotazioni di lezione presenti`,
                            }),
                          ],
                        }),
                        e.jsx('div', { className: 'text-3xl', children: '🗑️' }),
                      ],
                    }),
                    v > 0
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
                                  v,
                                  ' prenotazione/i di lezione',
                                  e.jsx('br', {}),
                                  '• I relativi slot prenotati nei campi',
                                  e.jsx('br', {}),
                                  '• Tutti i dati associati dal localStorage',
                                ],
                              }),
                            }),
                            e.jsx('button', {
                              onClick: c,
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
        e.jsx(Me, {
          isOpen: S,
          onClose: () => {
            (A(!1), l(null));
          },
          timeSlot: p,
          instructors: b,
          courts: y,
          weekDays: C,
          onSave: Y,
          T: s,
          ds: u,
        }),
      I &&
        D &&
        e.jsx(Le, {
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
function Me({
  isOpen: s,
  onClose: u,
  timeSlot: d,
  instructors: N,
  courts: b,
  weekDays: w,
  onSave: n,
  T: t,
  ds: y,
}) {
  const [c, v] = m.useState(() => ({
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '10:00',
      instructorIds: [],
      courtIds: [],
      maxBookings: 1,
      isActive: !0,
      ...d,
    })),
    O = (i) => {
      if ((i.preventDefault(), !c.startTime || !c.endTime)) {
        alert('Inserisci orario di inizio e fine');
        return;
      }
      if (c.startTime >= c.endTime) {
        alert("L'orario di fine deve essere dopo quello di inizio");
        return;
      }
      if (c.instructorIds.length === 0) {
        alert('Seleziona almeno un istruttore');
        return;
      }
      if (c.courtIds.length === 0) {
        alert('Seleziona almeno un campo');
        return;
      }
      n(c);
    };
  return e.jsx(he, {
    isOpen: s,
    onClose: u,
    title: d ? 'Modifica Fascia Oraria' : 'Aggiungi Fascia Oraria',
    size: 'medium',
    T: t,
    children: e.jsxs('form', {
      onSubmit: O,
      className: 'space-y-4',
      children: [
        e.jsxs('div', {
          children: [
            e.jsx('label', {
              className: `block ${y.label} mb-2`,
              children: 'Giorno della Settimana *',
            }),
            e.jsx('select', {
              value: c.dayOfWeek,
              onChange: (i) => v({ ...c, dayOfWeek: parseInt(i.target.value) }),
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
                e.jsx('label', { className: `block ${y.label} mb-2`, children: 'Ora Inizio *' }),
                e.jsx('input', {
                  type: 'time',
                  value: c.startTime,
                  onChange: (i) => v({ ...c, startTime: i.target.value }),
                  className: `w-full p-2 ${t.cardBg} ${t.border} ${t.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`,
                }),
              ],
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: `block ${y.label} mb-2`, children: 'Ora Fine *' }),
                e.jsx('input', {
                  type: 'time',
                  value: c.endTime,
                  onChange: (i) => v({ ...c, endTime: i.target.value }),
                  className: `w-full p-2 ${t.cardBg} ${t.border} ${t.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`,
                }),
              ],
            }),
          ],
        }),
        e.jsxs('div', {
          children: [
            e.jsx('label', {
              className: `block ${y.label} mb-2`,
              children: 'Numero Massimo Prenotazioni',
            }),
            e.jsx('input', {
              type: 'number',
              min: '1',
              max: '10',
              value: c.maxBookings,
              onChange: (i) => v({ ...c, maxBookings: parseInt(i.target.value) || 1 }),
              className: `w-full p-2 ${t.cardBg} ${t.border} ${t.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`,
            }),
          ],
        }),
        e.jsxs('div', {
          children: [
            e.jsx('label', {
              className: `block ${y.label} mb-2`,
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
                        checked: c.instructorIds.includes(i.id),
                        onChange: (S) => {
                          const { checked: A } = S.target;
                          v({
                            ...c,
                            instructorIds: A
                              ? [...c.instructorIds, i.id]
                              : c.instructorIds.filter((p) => p !== i.id),
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
            e.jsx('label', { className: `block ${y.label} mb-2`, children: 'Campi Disponibili *' }),
            e.jsx('div', {
              className: `space-y-2 max-h-40 overflow-y-auto border rounded p-2 ${t.border} ${t.cardBg}`,
              children:
                b &&
                b.map((i) =>
                  e.jsxs(
                    'label',
                    {
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx('input', {
                          type: 'checkbox',
                          checked: c.courtIds.includes(i.id),
                          onChange: (S) => {
                            const { checked: A } = S.target;
                            v({
                              ...c,
                              courtIds: A
                                ? [...c.courtIds, i.id]
                                : c.courtIds.filter((p) => p !== i.id),
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
            (!b || b.length === 0) &&
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
              checked: c.isActive,
              onChange: (i) => v({ ...c, isActive: i.target.checked }),
              className: 'rounded',
            }),
            e.jsx('label', {
              htmlFor: 'isActive',
              className: y.label,
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
              children: [d ? 'Aggiorna' : 'Crea', ' Fascia Oraria'],
            }),
          ],
        }),
      ],
    }),
  });
}
function Le({ isOpen: s, onClose: u, player: d, onSave: N, T: b, ds: w }) {
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
      ...d.instructorData,
    })),
    [y, c] = m.useState(''),
    [v, O] = m.useState(''),
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
    A = (l) => {
      (l.preventDefault(), N(n));
    },
    p = () => {
      y.trim() &&
        !n.specialties.includes(y.trim()) &&
        (t({ ...n, specialties: [...n.specialties, y.trim()] }), c(''));
    };
  return e.jsx(he, {
    isOpen: s,
    onClose: u,
    title: `Configura Istruttore: ${d.name}`,
    size: 'extraLarge',
    T: b,
    children: e.jsxs('form', {
      onSubmit: A,
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
                  value: y,
                  onChange: (l) => c(l.target.value),
                  className: `flex-1 ${w.input}`,
                  placeholder: 'Specialità personalizzata...',
                  onKeyPress: (l) => l.key === 'Enter' && (l.preventDefault(), p()),
                }),
                e.jsx('button', {
                  type: 'button',
                  onClick: p,
                  disabled: !y.trim(),
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
function Ae({ T: s, user: u, state: d, setState: N, clubMode: b }) {
  const { user: w } = ge(),
    n = w || u,
    {
      lessonBookings: t,
      loading: y,
      createLessonBooking: c,
      cancelBooking: v,
      clearAllLessons: O,
      refresh: i,
    } = ze(),
    { bookings: S } = Ie(),
    A = Se(s),
    p = d?.lessonConfig || $e(),
    l = d?.players || [],
    [I, B] = m.useState('book'),
    [D, W] = m.useState(1),
    [C, Q] = m.useState(''),
    [H, Y] = m.useState(null),
    [T, V] = m.useState(''),
    [M, a] = m.useState([]),
    [k, o] = m.useState({ type: '', text: '' }),
    F = m.useCallback(async () => {
      if (
        window.confirm(
          '⚠️ ATTENZIONE: Questa azione cancellerà TUTTE le prenotazioni di lezione e i relativi slot nei campi. Continuare?'
        )
      ) {
        console.log('🗑️ Clearing all lesson bookings...');
        try {
          const r = await O();
          (console.log(`✅ Cleared ${r} lesson bookings successfully`),
            o({ type: 'success', text: `Cancellate ${r} prenotazioni di lezione con successo!` }),
            setTimeout(() => o({ type: '', text: '' }), 3e3));
        } catch (r) {
          (console.error('❌ Error clearing lesson bookings:', r),
            o({ type: 'error', text: 'Errore durante la cancellazione delle prenotazioni.' }));
        }
      }
    }, [O]),
    pe = m.useCallback(
      (r) => {
        N((g) => ({ ...g, lessonConfig: r }));
      },
      [N]
    );
  m.useEffect(() => {
    I === 'admin' && !b && B('book');
  }, [I, b]);
  const U = m.useMemo(
      () => l.filter((r) => r.category === te.INSTRUCTOR && r.instructorData?.isInstructor),
      [l]
    ),
    de = m.useCallback(
      (r) => {
        const P = new Date(r).getDay(),
          f = (p.timeSlots || []).filter((h) => h.dayOfWeek === P && h.isActive);
        return f.length === 0
          ? !1
          : f.some((h) => {
              const j = parseInt(h.startTime.split(':')[0]),
                q = parseInt(h.startTime.split(':')[1]),
                se = parseInt(h.endTime.split(':')[0]),
                ie = parseInt(h.endTime.split(':')[1]),
                le = j * 60 + q,
                ae = se * 60 + ie;
              let Z = !1;
              for (let E = le; E < ae; E += 60) {
                if (E + 60 > ae) continue;
                const _ = Math.floor(E / 60),
                  J = E % 60,
                  L = `${_.toString().padStart(2, '0')}:${J.toString().padStart(2, '0')}`,
                  X = U.filter(
                    ($) =>
                      h.instructorIds.includes($.id) &&
                      !S.some((z) => {
                        const x = z.status || 'confirmed';
                        return (
                          z.date === r &&
                          z.time === L &&
                          z.instructorId === $.id &&
                          x === 'confirmed'
                        );
                      })
                  ),
                  ee = (d?.courts || []).filter(($) =>
                    h.courtIds.includes($.id)
                      ? !S.some((x) => {
                          const R = x.status || 'confirmed';
                          if (x.courtId !== $.id || x.date !== r || R !== 'confirmed') return !1;
                          const G = parseInt(L.split(':')[0]) * 60 + parseInt(L.split(':')[1]),
                            ne = G + 60,
                            re =
                              parseInt(x.time.split(':')[0]) * 60 + parseInt(x.time.split(':')[1]),
                            oe = re + (x.duration || 90);
                          return G < oe && re < ne;
                        })
                      : !1
                  );
                X.length > 0 && ee.length > 0 && (Z = !0);
              }
              return Z;
            });
      },
      [p.timeSlots, U, S, d?.courts]
    ),
    ce = m.useMemo(() => {
      const r = [],
        g = new Date(),
        P = new Set();
      (p.timeSlots || []).forEach((f) => {
        f.isActive && P.add(f.dayOfWeek);
      });
      for (let f = 0; f < 7; f++) {
        const h = new Date(g);
        h.setDate(g.getDate() + f);
        const j = h.getDay(),
          q = h.toISOString().split('T')[0];
        P.has(j) &&
          de(q) &&
          r.push({
            date: q,
            dayOfWeek: j,
            display: h.toLocaleDateString('it-IT', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            }),
          });
      }
      return r;
    }, [p.timeSlots, de]),
    me = m.useMemo(() => {
      if (!C) return [];
      const g = new Date(C).getDay(),
        P = (p.timeSlots || []).filter((j) => j.dayOfWeek === g && j.isActive),
        f = new Map();
      P.forEach((j) => {
        const q = parseInt(j.startTime.split(':')[0]),
          se = parseInt(j.startTime.split(':')[1]),
          ie = parseInt(j.endTime.split(':')[0]),
          le = parseInt(j.endTime.split(':')[1]),
          ae = q * 60 + se,
          Z = ie * 60 + le;
        for (let E = ae; E < Z && !(E + 60 > Z); E += 60) {
          const _ = Math.floor(E / 60),
            J = E % 60,
            L = `${_.toString().padStart(2, '0')}:${J.toString().padStart(2, '0')}`,
            X = U.filter(
              ($) =>
                j.instructorIds.includes($.id) &&
                !S.some((z) => {
                  const x = z.status || 'confirmed';
                  return (
                    z.date === C && z.time === L && z.instructorId === $.id && x === 'confirmed'
                  );
                })
            ),
            ee = (d?.courts || []).filter(($) =>
              j.courtIds.includes($.id)
                ? !S.some((x) => {
                    const R = x.status || 'confirmed';
                    if (x.courtId !== $.id || x.date !== C || R !== 'confirmed') return !1;
                    const G = parseInt(L.split(':')[0]) * 60 + parseInt(L.split(':')[1]),
                      ne = G + 60,
                      re = parseInt(x.time.split(':')[0]) * 60 + parseInt(x.time.split(':')[1]),
                      oe = re + (x.duration || 90);
                    return G < oe && re < ne;
                  })
                : !1
            );
          if (X.length > 0 && ee.length > 0)
            if (f.has(L)) {
              const $ = f.get(L),
                z = [...$.availableInstructors];
              X.forEach((R) => {
                z.some((G) => G.id === R.id) || z.push(R);
              });
              const x = [...$.availableCourts];
              (ee.forEach((R) => {
                x.some((G) => G.id === R.id) || x.push(R);
              }),
                f.set(L, { ...$, availableInstructors: z, availableCourts: x }));
            } else
              f.set(L, {
                id: `${C}-${L}`,
                time: L,
                displayTime: `${_.toString().padStart(2, '0')}:${J.toString().padStart(2, '0')} - ${(_ + 1).toString().padStart(2, '0')}:${J.toString().padStart(2, '0')}`,
                availableInstructors: X,
                availableCourts: ee,
                configSlot: j,
              });
        }
      });
      const h = Array.from(f.values());
      return (
        h.length === 0 &&
          P.length > 0 &&
          console.warn(
            '⚠️ No available slots found despite having configured time slots. Check instructor/court availability.'
          ),
        h.sort((j, q) => j.time.localeCompare(q.time))
      );
    }, [C, p.timeSlots, U, S, d?.courts]),
    ye = m.useCallback(async () => {
      if (!C || !H || !T) {
        o({ type: 'error', text: 'Seleziona data, orario e maestro per continuare.' });
        return;
      }
      try {
        o({ type: '', text: '' });
        const r = H.availableCourts[0],
          g = U.find((h) => h.id === T),
          P = {
            instructorId: T,
            instructorName: g?.name,
            lessonType: 'individual',
            courtId: r.id,
            courtName: r.name,
            date: C,
            time: H.time,
            duration: 60,
            price: 0,
            notes: `Lezione con ${g?.name}`,
            players: [n?.displayName || n?.email],
            userPhone: '',
            bookedBy: n?.displayName || n?.email,
            createCourtBooking: !1,
          };
        console.log('Creating unified lesson booking:', P);
        const f = await c(P);
        (console.log('✅ Created unified lesson booking:', f),
          o({ type: 'success', text: 'Lezione prenotata con successo!' }),
          W(1),
          Q(''),
          Y(null),
          V(''),
          a([]),
          await i(),
          setTimeout(() => o({ type: '', text: '' }), 3e3));
      } catch (r) {
        (console.error('Error booking lesson:', r),
          o({ type: 'error', text: 'Errore durante la prenotazione della lezione.' }));
      }
    }, [C, H, T, U, c, n, i]),
    ve = m.useCallback(
      async (r) => {
        if (window.confirm('Sei sicuro di voler cancellare questa lezione?'))
          try {
            (await v(r),
              o({ type: 'success', text: 'Lezione cancellata con successo!' }),
              setTimeout(() => o({ type: '', text: '' }), 3e3));
          } catch (g) {
            (console.error('Error cancelling lesson:', g),
              o({ type: 'error', text: 'Errore durante la cancellazione della lezione.' }));
          }
      },
      [v]
    ),
    ue = () => W((r) => Math.min(r + 1, 3)),
    xe = () => W((r) => Math.max(r - 1, 1));
  return y
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
          k.text &&
            e.jsx('div', {
              className: `p-4 rounded-lg ${k.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : k.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`,
              children: k.text,
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
                    e.jsx(be, {
                      variant: 'primary',
                      size: 'sm',
                      className: 'ml-2',
                      children: t.filter((r) => r.status === 'confirmed').length,
                    }),
                ],
              }),
              b &&
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
                      ce.length === 0
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
                            children: ce.map((r) => {
                              const g = r.date === new Date().toISOString().split('T')[0];
                              return e.jsxs(
                                'button',
                                {
                                  onClick: () => {
                                    (Q(r.date), Y(null), V(''), a([]), ue());
                                  },
                                  className: `p-3 rounded-xl border text-center transition-all duration-200 hover:scale-105 active:scale-95 ${C === r.date ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-lg' : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md'} ${g ? 'ring-2 ring-green-300 dark:ring-green-500 bg-green-50 dark:bg-green-900/30' : ''}`,
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
                                    g &&
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
                      me.length === 0
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
                                children: me.map((r) =>
                                  e.jsxs(
                                    'button',
                                    {
                                      onClick: () => {
                                        (Y(r),
                                          a(r.availableInstructors),
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
                          onClick: xe,
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
                        ],
                      }),
                      e.jsxs('div', {
                        className: 'space-y-4',
                        children: [
                          e.jsxs('h4', {
                            className: 'text-md font-medium text-gray-900 dark:text-white',
                            children: [
                              'Maestr',
                              M.length === 1 ? 'o disponibile' : 'i disponibili',
                              ' (',
                              M.length,
                              ')',
                            ],
                          }),
                          M.length === 1
                            ? e.jsx('div', {
                                className:
                                  'border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700',
                                children: e.jsxs('div', {
                                  className: 'flex items-center gap-3',
                                  children: [
                                    e.jsx('div', {
                                      className:
                                        'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg',
                                      style: { backgroundColor: M[0].instructorData?.color },
                                      children: M[0].name?.charAt(0) || '?',
                                    }),
                                    e.jsxs('div', {
                                      children: [
                                        e.jsx('div', {
                                          className:
                                            'font-medium text-lg text-gray-900 dark:text-white',
                                          children: M[0].name,
                                        }),
                                        M[0].instructorData?.specialties?.length > 0 &&
                                          e.jsx('div', {
                                            className: 'text-sm text-gray-600 dark:text-gray-300',
                                            children: M[0].instructorData.specialties.join(', '),
                                          }),
                                        M[0].instructorData?.hourlyRate > 0 &&
                                          e.jsxs('div', {
                                            className:
                                              'text-sm font-semibold text-blue-600 dark:text-blue-400',
                                            children: ['€', M[0].instructorData.hourlyRate, '/ora'],
                                          }),
                                      ],
                                    }),
                                  ],
                                }),
                              })
                            : e.jsx('div', {
                                className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                                children: M.map((r) =>
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
                          M.length > 1 &&
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
                            onClick: xe,
                            className:
                              'px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors',
                            children: '← Cambia Orario',
                          }),
                          e.jsx('button', {
                            onClick: ye,
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
                          (r, g) =>
                            new Date(r.date + 'T' + r.time) - new Date(g.date + 'T' + g.time)
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
                                          U.find((g) => g.id === r.instructorId)?.name ||
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
                                    onClick: () => ve(r.id),
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
            b &&
            e.jsx(De, {
              T: s,
              ds: A,
              lessonConfig: p,
              updateLessonConfig: pe,
              instructors: U,
              players: l,
              setState: N,
              state: d,
              courts: d?.courts || [],
              onClearAllLessons: F,
              lessonBookingsCount: t?.length || 0,
            }),
        ],
      });
}
function qe() {
  const { user: s } = ge(),
    { state: u, setState: d } = je(),
    { clubMode: N } = ke(),
    b = we.useMemo(() => Ne(), []);
  return e.jsx(Ae, { T: b, user: s, state: u, setState: d, clubMode: N });
}
export { qe as default };
