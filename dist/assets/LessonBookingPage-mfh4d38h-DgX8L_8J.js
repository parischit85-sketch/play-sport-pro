import { j as e, i as fe, u as ge, f as je, k as Ne, t as ke } from './index-mfh4d38h-CPKWh84w.js';
import { r as u, b as Se } from './router-mfh4d38h-D14HHbEI.js';
import { S as K } from './Section-mfh4d38h-Df1Gzqw4.js';
import { B as be } from './Badge-mfh4d38h-B0617-OG.js';
import { c as $e } from './design-system-mfh4d38h-B5fzZ68S.js';
import { P as se, c as we, a as Ce } from './playerTypes-mfh4d38h-CIm-hM8a.js';
import { b as ze, u as Ie } from './useUnifiedBookings-mfh4d38h-CC_USPZv.js';
import { M as he } from './Modal-mfh4d38h-xCnxAVWo.js';
import './vendor-mfh4d38h-D3F3s8fL.js';
import './firebase-mfh4d38h-X_I_guKF.js';
import './unified-booking-service-mfh4d38h-1xV4n-cy.js';
function De({
  T: i,
  ds: x,
  lessonConfig: c,
  updateLessonConfig: N,
  instructors: r,
  players: I,
  setState: n,
  state: o,
  courts: j,
  onClearAllLessons: d,
  lessonBookingsCount: y,
}) {
  const [A, l] = u.useState('config'),
    [k, L] = u.useState(!1),
    [p, F] = u.useState(null),
    [s, D] = u.useState(!1),
    [B, H] = u.useState(null),
    S = [
      { value: 0, label: 'Domenica' },
      { value: 1, label: 'Lunedì' },
      { value: 2, label: 'Martedì' },
      { value: 3, label: 'Mercoledì' },
      { value: 4, label: 'Giovedì' },
      { value: 5, label: 'Venerdì' },
      { value: 6, label: 'Sabato' },
    ],
    Q = u.useMemo(() => (I || []).filter((a) => a.category !== se.INSTRUCTOR), [I]),
    T = () => {
      N({ ...c, isEnabled: !c.isEnabled });
    },
    Y = (a) => {
      const z = p
        ? (c.timeSlots || []).map((m) => (m.id === p.id ? { ...m, ...a } : m))
        : [...(c.timeSlots || []), { ...we(), ...a, id: fe() }];
      (N({ ...c, timeSlots: z }), L(!1), F(null));
    },
    E = (a) => {
      confirm('Sei sicuro di voler eliminare questa fascia oraria?') &&
        N({ ...c, timeSlots: (c.timeSlots || []).filter((z) => z.id !== a) });
    },
    V = (a) => {
      const z = (I || []).map((m) =>
        m.id === B.id
          ? {
              ...m,
              category: se.INSTRUCTOR,
              instructorData: { ...m.instructorData, isInstructor: !0, ...a },
            }
          : m
      );
      (n((m) => ({ ...m, players: z })), D(!1), H(null));
    },
    C = (a) => {
      if (confirm('Sei sicuro di voler rimuovere questo giocatore come istruttore?')) {
        const z = (I || []).map((m) =>
          m.id === a
            ? {
                ...m,
                category: se.MEMBER,
                instructorData: { ...m.instructorData, isInstructor: !1 },
              }
            : m
        );
        n((m) => ({ ...m, players: z }));
      }
    };
  return e.jsxs('div', {
    className: 'space-y-6',
    children: [
      e.jsx('div', {
        className: 'border-b border-gray-200 dark:border-gray-600',
        children: e.jsx('nav', {
          className: 'flex space-x-8 overflow-x-auto',
          children: [
            { id: 'config', label: 'Configurazione Generale', icon: '⚙️' },
            { id: 'timeslots', label: 'Fasce Orarie', icon: '⏰' },
            { id: 'instructors', label: 'Gestione Istruttori', icon: '👨‍🏫' },
            { id: 'cleanup', label: 'Pulizia Dati', icon: '🗑️' },
          ].map((a) =>
            e.jsxs(
              'button',
              {
                onClick: () => l(a.id),
                className: `py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${A === a.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'}`,
                children: [
                  e.jsx('span', { className: 'text-base mr-1', children: a.icon }),
                  a.label,
                ],
              },
              a.id
            )
          ),
        }),
      }),
      A === 'config' &&
        e.jsx('div', {
          className: 'space-y-6',
          children: e.jsx(K, {
            title: 'Configurazione Sistema Lezioni',
            variant: 'minimal',
            T: i,
            children: e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  className:
                    'flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('h3', {
                          className: `${x.h6} font-medium mb-1`,
                          children: 'Sistema Lezioni',
                        }),
                        e.jsx('p', {
                          className: `text-sm ${i.subtext}`,
                          children: c.isEnabled
                            ? 'Il sistema di prenotazione lezioni è attivo'
                            : 'Il sistema di prenotazione lezioni è disattivato',
                        }),
                      ],
                    }),
                    e.jsx('button', {
                      onClick: T,
                      className: `px-4 py-2 rounded-lg font-medium ${c.isEnabled ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'}`,
                      children: c.isEnabled ? 'Disattiva' : 'Attiva',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'grid gap-4 sm:grid-cols-2',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block ${x.label} mb-2`,
                          children: 'Giorni di Anticipo per Prenotazione',
                        }),
                        e.jsx('input', {
                          type: 'number',
                          min: '1',
                          max: '30',
                          value: c.bookingAdvanceDays,
                          onChange: (a) =>
                            N({ ...c, bookingAdvanceDays: parseInt(a.target.value) || 14 }),
                          className: `w-full p-2 ${i.cardBg} ${i.border} ${i.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`,
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block ${x.label} mb-2`,
                          children: 'Ore Prima per Cancellazione',
                        }),
                        e.jsx('input', {
                          type: 'number',
                          min: '1',
                          max: '72',
                          value: c.cancellationHours,
                          onChange: (a) =>
                            N({ ...c, cancellationHours: parseInt(a.target.value) || 24 }),
                          className: `w-full p-2 ${i.cardBg} ${i.border} ${i.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          }),
        }),
      A === 'timeslots' &&
        e.jsx('div', {
          className: 'space-y-6',
          children: e.jsx(K, {
            title: 'Gestione Fasce Orarie',
            variant: 'minimal',
            T: i,
            children: e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsx('button', {
                  onClick: () => L(!0),
                  className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700',
                  children: '+ Aggiungi Fascia Oraria',
                }),
                (c.timeSlots || []).length === 0
                  ? e.jsx('div', {
                      className: 'text-center py-8 text-gray-500',
                      children:
                        'Nessuna fascia oraria configurata. Crea la prima fascia per iniziare.',
                    })
                  : e.jsx('div', {
                      className: 'space-y-3',
                      children: (c.timeSlots || []).map((a) => {
                        const z = S.find((R) => R.value === a.dayOfWeek)?.label || 'Sconosciuto',
                          m = (r || []).filter((R) => a.instructorIds.includes(R.id));
                        return e.jsx(
                          'div',
                          {
                            className: `${i.cardBg} ${i.border} ${i.borderMd} p-4`,
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
                                          className: `${x.h6} font-medium`,
                                          children: [z, ' • ', a.startTime, ' - ', a.endTime],
                                        }),
                                        e.jsx(be, {
                                          variant: a.isActive ? 'success' : 'default',
                                          size: 'sm',
                                          T: i,
                                          children: a.isActive ? 'Attiva' : 'Inattiva',
                                        }),
                                      ],
                                    }),
                                    e.jsxs('div', {
                                      className: 'flex items-center gap-4 text-sm text-gray-600',
                                      children: [
                                        e.jsxs('span', {
                                          children: ['Max prenotazioni: ', a.maxBookings],
                                        }),
                                        e.jsxs('span', { children: ['Istruttori: ', m.length] }),
                                      ],
                                    }),
                                    m.length > 0 &&
                                      e.jsx('div', {
                                        className: 'mt-2',
                                        children: e.jsx('div', {
                                          className: 'flex flex-wrap gap-1',
                                          children: m.map((R) =>
                                            e.jsxs(
                                              'div',
                                              {
                                                className:
                                                  'flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300',
                                                children: [
                                                  e.jsx('div', {
                                                    className: 'w-3 h-3 rounded-full',
                                                    style: {
                                                      backgroundColor: R.instructorData?.color,
                                                    },
                                                  }),
                                                  R.name,
                                                ],
                                              },
                                              R.id
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
                                        (F(a), L(!0));
                                      },
                                      className: 'text-blue-600 hover:text-blue-700',
                                      children: 'Modifica',
                                    }),
                                    e.jsx('button', {
                                      onClick: () => E(a.id),
                                      className: 'text-red-600 hover:text-red-700',
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
      A === 'instructors' &&
        e.jsx('div', {
          className: 'space-y-6',
          children: e.jsx(K, {
            title: 'Gestione Istruttori',
            variant: 'minimal',
            T: i,
            children: e.jsxs('div', {
              className: 'space-y-6',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsxs('h3', {
                      className: `${x.h6} font-medium mb-3`,
                      children: ['Istruttori Attivi (', r.length, ')'],
                    }),
                    r.length === 0
                      ? e.jsx('div', {
                          className: 'text-center py-6 text-gray-500',
                          children: 'Nessun istruttore configurato',
                        })
                      : e.jsx('div', {
                          className: 'space-y-3',
                          children: r.map((a) =>
                            e.jsx(
                              'div',
                              {
                                className: `${i.cardBg} ${i.border} ${i.borderMd} p-4`,
                                children: e.jsxs('div', {
                                  className: 'flex items-center justify-between',
                                  children: [
                                    e.jsxs('div', {
                                      className: 'flex items-center gap-3',
                                      children: [
                                        e.jsx('div', {
                                          className:
                                            'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold',
                                          style: { backgroundColor: a.instructorData?.color },
                                          children: a.name?.charAt(0) || '?',
                                        }),
                                        e.jsxs('div', {
                                          children: [
                                            e.jsx('h4', {
                                              className: `${x.h6} font-medium`,
                                              children: a.name,
                                            }),
                                            e.jsxs('div', {
                                              className:
                                                'flex flex-col gap-1 text-sm text-gray-600',
                                              children: [
                                                e.jsxs('div', {
                                                  className: 'flex flex-wrap gap-2',
                                                  children: [
                                                    a.instructorData?.priceSingle > 0 &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs',
                                                        children: [
                                                          'Singola: €',
                                                          a.instructorData.priceSingle,
                                                        ],
                                                      }),
                                                    a.instructorData?.priceCouple > 0 &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs',
                                                        children: [
                                                          'Coppia: €',
                                                          a.instructorData.priceCouple,
                                                        ],
                                                      }),
                                                    a.instructorData?.priceThree > 0 &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs',
                                                        children: [
                                                          'Tre: €',
                                                          a.instructorData.priceThree,
                                                        ],
                                                      }),
                                                    a.instructorData?.priceMatchLesson > 0 &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded text-xs',
                                                        children: [
                                                          'Partita: €',
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
                                                          'px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded text-xs',
                                                        children: [
                                                          '€',
                                                          a.instructorData.hourlyRate,
                                                          '/ora',
                                                        ],
                                                      }),
                                                  ],
                                                }),
                                                a.instructorData?.specialties?.length > 0 &&
                                                  e.jsx('span', {
                                                    children:
                                                      a.instructorData.specialties.join(', '),
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
                                            (H(a), D(!0));
                                          },
                                          className: 'text-blue-600 hover:text-blue-700',
                                          children: 'Modifica',
                                        }),
                                        e.jsx('button', {
                                          onClick: () => C(a.id),
                                          className: 'text-red-600 hover:text-red-700',
                                          children: 'Rimuovi',
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
                      className: `${x.h6} font-medium mb-3`,
                      children: 'Aggiungi Istruttore',
                    }),
                    Q.length === 0
                      ? e.jsx('div', {
                          className: 'text-center py-6 text-gray-500',
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
                                  className: `${i.cardBg} ${i.border} ${i.borderMd} p-4`,
                                  children: e.jsxs('div', {
                                    className: 'flex items-center justify-between',
                                    children: [
                                      e.jsxs('div', {
                                        children: [
                                          e.jsx('h4', {
                                            className: `${x.h6} font-medium`,
                                            children: a.name,
                                          }),
                                          e.jsxs('p', {
                                            className: `text-sm ${i.subtext}`,
                                            children: [a.email, ' • ', a.category],
                                          }),
                                        ],
                                      }),
                                      e.jsx('button', {
                                        onClick: () => {
                                          (H(a), D(!0));
                                        },
                                        className:
                                          'px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200',
                                        children: 'Rendi Istruttore',
                                      }),
                                    ],
                                  }),
                                },
                                a.id
                              )
                            ),
                            Q.length > 5 &&
                              e.jsxs('p', {
                                className: `text-sm ${i.subtext} text-center`,
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
      A === 'cleanup' &&
        e.jsx('div', {
          className: 'space-y-6',
          children: e.jsx(K, {
            title: 'Pulizia Dati di Test',
            variant: 'minimal',
            T: i,
            children: e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  className: 'bg-yellow-50 border border-yellow-200 rounded-lg p-4',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-2 text-yellow-800 mb-2',
                      children: [
                        e.jsx('span', { className: 'text-xl', children: '⚠️' }),
                        e.jsx('h3', { className: 'font-semibold', children: 'Attenzione' }),
                      ],
                    }),
                    e.jsx('p', {
                      className: 'text-sm text-yellow-700',
                      children:
                        'Questa sezione permette di cancellare tutte le prenotazioni di lezione di test. Le prenotazioni dei campi associate verranno anche cancellate automaticamente.',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: `${i.cardBg} ${i.border} ${i.borderMd} p-6 rounded-lg`,
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center justify-between mb-4',
                      children: [
                        e.jsxs('div', {
                          children: [
                            e.jsx('h3', {
                              className: `${x.h6} font-medium`,
                              children: 'Prenotazioni Lezioni Presenti',
                            }),
                            e.jsx('p', {
                              className: `text-sm ${i.subtext}`,
                              children:
                                y === 0
                                  ? 'Nessuna prenotazione di lezione presente'
                                  : y === 1
                                    ? '1 prenotazione di lezione presente'
                                    : `${y} prenotazioni di lezione presenti`,
                            }),
                          ],
                        }),
                        e.jsx('div', { className: 'text-3xl', children: '🗑️' }),
                      ],
                    }),
                    y > 0
                      ? e.jsxs('div', {
                          className: 'space-y-3',
                          children: [
                            e.jsx('div', {
                              className: 'bg-red-50 border border-red-200 rounded p-3',
                              children: e.jsxs('p', {
                                className: 'text-sm text-red-700',
                                children: [
                                  e.jsx('strong', { children: 'Cosa verrà eliminato:' }),
                                  e.jsx('br', {}),
                                  '• ',
                                  y,
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
                                'w-full px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors',
                              children: '🗑️ Cancella Tutte le Prenotazioni di Lezione',
                            }),
                          ],
                        })
                      : e.jsxs('div', {
                          className: 'text-center py-6 text-gray-500',
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
                  className: `${i.cardBg} ${i.border} ${i.borderMd} p-4 rounded-lg`,
                  children: [
                    e.jsx('h4', {
                      className: `${x.h6} font-medium mb-2`,
                      children: 'Come funziona la pulizia:',
                    }),
                    e.jsxs('ul', {
                      className: 'text-sm space-y-1 text-gray-600',
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
      k &&
        e.jsx(Me, {
          isOpen: k,
          onClose: () => {
            (L(!1), F(null));
          },
          timeSlot: p,
          instructors: r,
          courts: j,
          weekDays: S,
          onSave: Y,
          T: i,
          ds: x,
        }),
      s &&
        B &&
        e.jsx(Le, {
          isOpen: s,
          onClose: () => {
            (D(!1), H(null));
          },
          player: B,
          onSave: V,
          T: i,
          ds: x,
        }),
    ],
  });
}
function Me({
  isOpen: i,
  onClose: x,
  timeSlot: c,
  instructors: N,
  courts: r,
  weekDays: I,
  onSave: n,
  T: o,
  ds: j,
}) {
  const [d, y] = u.useState(() => ({
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '10:00',
      instructorIds: [],
      courtIds: [],
      maxBookings: 1,
      isActive: !0,
      ...c,
    })),
    A = (l) => {
      if ((l.preventDefault(), !d.startTime || !d.endTime)) {
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
  return e.jsx(he, {
    isOpen: i,
    onClose: x,
    title: c ? 'Modifica Fascia Oraria' : 'Aggiungi Fascia Oraria',
    size: 'medium',
    T: o,
    children: e.jsxs('form', {
      onSubmit: A,
      className: 'space-y-4',
      children: [
        e.jsxs('div', {
          children: [
            e.jsx('label', {
              className: `block ${j.label} mb-2`,
              children: 'Giorno della Settimana *',
            }),
            e.jsx('select', {
              value: d.dayOfWeek,
              onChange: (l) => y({ ...d, dayOfWeek: parseInt(l.target.value) }),
              className: `w-full p-2 ${o.cardBg} ${o.border} ${o.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`,
              children: I.map((l) =>
                e.jsx('option', { value: l.value, children: l.label }, l.value)
              ),
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-2 gap-4',
          children: [
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: `block ${j.label} mb-2`, children: 'Ora Inizio *' }),
                e.jsx('input', {
                  type: 'time',
                  value: d.startTime,
                  onChange: (l) => y({ ...d, startTime: l.target.value }),
                  className: `w-full p-2 ${o.cardBg} ${o.border} ${o.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`,
                }),
              ],
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: `block ${j.label} mb-2`, children: 'Ora Fine *' }),
                e.jsx('input', {
                  type: 'time',
                  value: d.endTime,
                  onChange: (l) => y({ ...d, endTime: l.target.value }),
                  className: `w-full p-2 ${o.cardBg} ${o.border} ${o.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`,
                }),
              ],
            }),
          ],
        }),
        e.jsxs('div', {
          children: [
            e.jsx('label', {
              className: `block ${j.label} mb-2`,
              children: 'Numero Massimo Prenotazioni',
            }),
            e.jsx('input', {
              type: 'number',
              min: '1',
              max: '10',
              value: d.maxBookings,
              onChange: (l) => y({ ...d, maxBookings: parseInt(l.target.value) || 1 }),
              className: `w-full p-2 ${o.cardBg} ${o.border} ${o.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`,
            }),
          ],
        }),
        e.jsxs('div', {
          children: [
            e.jsx('label', {
              className: `block ${j.label} mb-2`,
              children: 'Istruttori Disponibili *',
            }),
            e.jsx('div', {
              className: 'space-y-2 max-h-40 overflow-y-auto border rounded p-2',
              children: N.map((l) =>
                e.jsxs(
                  'label',
                  {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx('input', {
                        type: 'checkbox',
                        checked: d.instructorIds.includes(l.id),
                        onChange: (k) => {
                          const { checked: L } = k.target;
                          y({
                            ...d,
                            instructorIds: L
                              ? [...d.instructorIds, l.id]
                              : d.instructorIds.filter((p) => p !== l.id),
                          });
                        },
                        className: 'rounded',
                      }),
                      e.jsxs('div', {
                        className: 'flex items-center gap-2',
                        children: [
                          e.jsx('div', {
                            className: 'w-4 h-4 rounded-full',
                            style: { backgroundColor: l.instructorData?.color },
                          }),
                          e.jsx('span', { children: l.name }),
                        ],
                      }),
                    ],
                  },
                  l.id
                )
              ),
            }),
          ],
        }),
        e.jsxs('div', {
          children: [
            e.jsx('label', { className: `block ${j.label} mb-2`, children: 'Campi Disponibili *' }),
            e.jsx('div', {
              className: 'space-y-2 max-h-40 overflow-y-auto border rounded p-2',
              children:
                r &&
                r.map((l) =>
                  e.jsxs(
                    'label',
                    {
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx('input', {
                          type: 'checkbox',
                          checked: d.courtIds.includes(l.id),
                          onChange: (k) => {
                            const { checked: L } = k.target;
                            y({
                              ...d,
                              courtIds: L
                                ? [...d.courtIds, l.id]
                                : d.courtIds.filter((p) => p !== l.id),
                            });
                          },
                          className: 'rounded',
                        }),
                        e.jsxs('div', {
                          className: 'flex items-center gap-2',
                          children: [
                            e.jsx('div', {
                              className: 'w-4 h-4 rounded border',
                              style: { backgroundColor: l.surface?.color || '#e5e7eb' },
                            }),
                            e.jsx('span', { children: l.name || `Campo ${l.id}` }),
                            l.surface?.type &&
                              e.jsx('span', {
                                className: `text-xs px-2 py-1 ${o.cardBg} rounded`,
                                children: l.surface.type,
                              }),
                          ],
                        }),
                      ],
                    },
                    l.id
                  )
                ),
            }),
            (!r || r.length === 0) &&
              e.jsx('p', {
                className: 'text-sm text-gray-500 mt-1',
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
              onChange: (l) => y({ ...d, isActive: l.target.checked }),
              className: 'rounded',
            }),
            e.jsx('label', {
              htmlFor: 'isActive',
              className: j.label,
              children: 'Fascia oraria attiva',
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'flex gap-3 pt-4',
          children: [
            e.jsx('button', {
              type: 'button',
              onClick: x,
              className: `flex-1 py-2 px-4 ${o.cardBg} ${o.border} ${o.borderMd} hover:bg-gray-50 dark:hover:bg-gray-700`,
              children: 'Annulla',
            }),
            e.jsxs('button', {
              type: 'submit',
              className:
                'flex-1 py-2 px-4 bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600',
              children: [c ? 'Aggiorna' : 'Crea', ' Fascia Oraria'],
            }),
          ],
        }),
      ],
    }),
  });
}
function Le({ isOpen: i, onClose: x, player: c, onSave: N, T: r, ds: I }) {
  const [n, o] = u.useState(() => ({
      color: '#3B82F6',
      hourlyRate: 0,
      priceSingle: 0,
      priceCouple: 0,
      priceThree: 0,
      priceMatchLesson: 0,
      specialties: [],
      bio: '',
      certifications: [],
      ...c.instructorData,
    })),
    [j, d] = u.useState(''),
    [y, A] = u.useState(''),
    l = ['Padel', 'Tennis', 'Fitness', 'Calcio', 'Basket'],
    k = [
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
    L = (s) => {
      (s.preventDefault(), N(n));
    },
    p = () => {
      j.trim() &&
        !n.specialties.includes(j.trim()) &&
        (o({ ...n, specialties: [...n.specialties, j.trim()] }), d(''));
    },
    F = (s) => {
      o({ ...n, specialties: n.specialties.filter((D) => D !== s) });
    };
  return e.jsx(he, {
    isOpen: i,
    onClose: x,
    title: `Configura Istruttore: ${c.name}`,
    size: 'large',
    T: r,
    children: e.jsxs('form', {
      onSubmit: L,
      className: 'space-y-4',
      children: [
        e.jsxs('div', {
          children: [
            e.jsx('label', { className: `block ${I.label} mb-2`, children: 'Colore Istruttore' }),
            e.jsx('div', {
              className: 'flex gap-2 mb-2',
              children: k.map((s) =>
                e.jsx(
                  'button',
                  {
                    type: 'button',
                    onClick: () => o({ ...n, color: s }),
                    className: `w-8 h-8 rounded-full border-2 ${n.color === s ? 'border-gray-800' : 'border-gray-300'}`,
                    style: { backgroundColor: s },
                  },
                  s
                )
              ),
            }),
            e.jsx('input', {
              type: 'color',
              value: n.color,
              onChange: (s) => o({ ...n, color: s.target.value }),
              className: 'w-full h-10 rounded border',
            }),
          ],
        }),
        e.jsxs('div', {
          children: [
            e.jsx('label', { className: `block ${I.label} mb-3`, children: 'Tariffe Lezioni (€)' }),
            e.jsxs('div', {
              className: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm ${r.subtext} mb-1`,
                      children: 'Lezione Singola',
                    }),
                    e.jsx('input', {
                      type: 'number',
                      min: '0',
                      step: '5',
                      value: n.priceSingle || 0,
                      onChange: (s) => o({ ...n, priceSingle: parseFloat(s.target.value) || 0 }),
                      className: `w-full p-2 ${r.cardBg} ${r.border} ${r.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`,
                      placeholder: 'es. 50',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm ${r.subtext} mb-1`,
                      children: 'Lezione di Coppia',
                    }),
                    e.jsx('input', {
                      type: 'number',
                      min: '0',
                      step: '5',
                      value: n.priceCouple || 0,
                      onChange: (s) => o({ ...n, priceCouple: parseFloat(s.target.value) || 0 }),
                      className: `w-full p-2 ${r.cardBg} ${r.border} ${r.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`,
                      placeholder: 'es. 70',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm ${r.subtext} mb-1`,
                      children: 'Lezione a 3 Persone',
                    }),
                    e.jsx('input', {
                      type: 'number',
                      min: '0',
                      step: '5',
                      value: n.priceThree || 0,
                      onChange: (s) => o({ ...n, priceThree: parseFloat(s.target.value) || 0 }),
                      className: `w-full p-2 ${r.cardBg} ${r.border} ${r.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`,
                      placeholder: 'es. 90',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm ${r.subtext} mb-1`,
                      children: 'Partita Lezione',
                    }),
                    e.jsx('input', {
                      type: 'number',
                      min: '0',
                      step: '5',
                      value: n.priceMatchLesson || 0,
                      onChange: (s) =>
                        o({ ...n, priceMatchLesson: parseFloat(s.target.value) || 0 }),
                      className: `w-full p-2 ${r.cardBg} ${r.border} ${r.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`,
                      placeholder: 'es. 80',
                    }),
                  ],
                }),
              ],
            }),
            e.jsx('p', {
              className: `text-xs ${r.subtext} mt-2`,
              children: 'Prezzi per ora di lezione. Lasciare a 0 per disabilitare una tipologia.',
            }),
          ],
        }),
        e.jsxs('div', {
          children: [
            e.jsx('label', { className: `block ${I.label} mb-2`, children: 'Specialità' }),
            e.jsx('div', {
              className: 'flex flex-wrap gap-2 mb-2',
              children: l.map((s) =>
                e.jsx(
                  'button',
                  {
                    type: 'button',
                    onClick: () => {
                      n.specialties.includes(s) || o({ ...n, specialties: [...n.specialties, s] });
                    },
                    className: `px-3 py-1 text-sm rounded border ${n.specialties.includes(s) ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'}`,
                    children: s,
                  },
                  s
                )
              ),
            }),
            e.jsxs('div', {
              className: 'flex gap-2 mb-2',
              children: [
                e.jsx('input', {
                  type: 'text',
                  value: j,
                  onChange: (s) => d(s.target.value),
                  className: `flex-1 p-2 ${r.cardBg} ${r.border} ${r.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`,
                  placeholder: 'Aggiungi specialità personalizzata',
                  onKeyPress: (s) => s.key === 'Enter' && (s.preventDefault(), p()),
                }),
                e.jsx('button', {
                  type: 'button',
                  onClick: p,
                  className:
                    'px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500',
                  children: 'Aggiungi',
                }),
              ],
            }),
            n.specialties.length > 0 &&
              e.jsx('div', {
                className: 'flex flex-wrap gap-1',
                children: n.specialties.map((s, D) =>
                  e.jsxs(
                    'div',
                    {
                      className:
                        'flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm',
                      children: [
                        e.jsx('span', { children: s }),
                        e.jsx('button', {
                          type: 'button',
                          onClick: () => F(s),
                          className: 'text-blue-600 hover:text-blue-800',
                          children: '×',
                        }),
                      ],
                    },
                    D
                  )
                ),
              }),
          ],
        }),
        e.jsxs('div', {
          children: [
            e.jsx('label', { className: `block ${I.label} mb-2`, children: 'Biografia' }),
            e.jsx('textarea', {
              value: n.bio,
              onChange: (s) => o({ ...n, bio: s.target.value }),
              rows: 3,
              className: `w-full p-2 ${r.cardBg} ${r.border} ${r.borderMd} focus:outline-none focus:ring-2 focus:ring-blue-500`,
              placeholder: "Descrizione dell'istruttore, esperienza, etc...",
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'flex gap-3 pt-4',
          children: [
            e.jsx('button', {
              type: 'button',
              onClick: x,
              className: `flex-1 py-2 px-4 ${r.cardBg} ${r.border} ${r.borderMd} hover:bg-gray-50 dark:hover:bg-gray-700`,
              children: 'Annulla',
            }),
            e.jsx('button', {
              type: 'submit',
              className:
                'flex-1 py-2 px-4 bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600',
              children: 'Salva Istruttore',
            }),
          ],
        }),
      ],
    }),
  });
}
function Be({ T: i, user: x, state: c, setState: N, clubMode: r }) {
  const { user: I } = ge(),
    n = I || x,
    {
      lessonBookings: o,
      loading: j,
      createLessonBooking: d,
      cancelBooking: y,
      clearAllLessons: A,
      refresh: l,
    } = ze(),
    { bookings: k } = Ie(),
    L = $e(i),
    p = c?.lessonConfig || Ce(),
    F = c?.players || [],
    [s, D] = u.useState('book'),
    [B, H] = u.useState(1),
    [S, Q] = u.useState(''),
    [T, Y] = u.useState(null),
    [E, V] = u.useState(''),
    [C, a] = u.useState([]),
    [z, m] = u.useState({ type: '', text: '' }),
    R = u.useCallback(async () => {
      if (
        window.confirm(
          '⚠️ ATTENZIONE: Questa azione cancellerà TUTTE le prenotazioni di lezione e i relativi slot nei campi. Continuare?'
        )
      ) {
        console.log('🗑️ Clearing all lesson bookings...');
        try {
          const t = await A();
          (console.log(`✅ Cleared ${t} lesson bookings successfully`),
            m({ type: 'success', text: `Cancellate ${t} prenotazioni di lezione con successo!` }),
            setTimeout(() => m({ type: '', text: '' }), 3e3));
        } catch (t) {
          (console.error('❌ Error clearing lesson bookings:', t),
            m({ type: 'error', text: 'Errore durante la cancellazione delle prenotazioni.' }));
        }
      }
    }, [A]),
    pe = u.useCallback(
      (t) => {
        N((b) => ({ ...b, lessonConfig: t }));
      },
      [N]
    );
  u.useEffect(() => {
    s === 'admin' && !r && D('book');
  }, [s, r]);
  const U = u.useMemo(
      () => F.filter((t) => t.category === se.INSTRUCTOR && t.instructorData?.isInstructor),
      [F]
    ),
    ce = u.useCallback(
      (t) => {
        const P = new Date(t).getDay(),
          v = (p.timeSlots || []).filter((h) => h.dayOfWeek === P && h.isActive);
        return v.length === 0
          ? !1
          : v.some((h) => {
              const f = parseInt(h.startTime.split(':')[0]),
                q = parseInt(h.startTime.split(':')[1]),
                re = parseInt(h.endTime.split(':')[0]),
                ie = parseInt(h.endTime.split(':')[1]),
                le = f * 60 + q,
                ae = re * 60 + ie;
              let Z = !1;
              for (let O = le; O < ae; O += 60) {
                if (O + 60 > ae) continue;
                const _ = Math.floor(O / 60),
                  J = O % 60,
                  M = `${_.toString().padStart(2, '0')}:${J.toString().padStart(2, '0')}`,
                  X = U.filter(
                    ($) =>
                      h.instructorIds.includes($.id) &&
                      !k.some((w) => {
                        const g = w.status || 'confirmed';
                        return (
                          w.date === t &&
                          w.time === M &&
                          w.instructorId === $.id &&
                          g === 'confirmed'
                        );
                      })
                  ),
                  ee = (c?.courts || []).filter(($) =>
                    h.courtIds.includes($.id)
                      ? !k.some((g) => {
                          const G = g.status || 'confirmed';
                          if (g.courtId !== $.id || g.date !== t || G !== 'confirmed') return !1;
                          const W = parseInt(M.split(':')[0]) * 60 + parseInt(M.split(':')[1]),
                            ne = W + 60,
                            te =
                              parseInt(g.time.split(':')[0]) * 60 + parseInt(g.time.split(':')[1]),
                            oe = te + (g.duration || 90);
                          return W < oe && te < ne;
                        })
                      : !1
                  );
                X.length > 0 && ee.length > 0 && (Z = !0);
              }
              return Z;
            });
      },
      [p.timeSlots, U, k, c?.courts]
    ),
    de = u.useMemo(() => {
      const t = [],
        b = new Date(),
        P = new Set();
      (p.timeSlots || []).forEach((v) => {
        v.isActive && P.add(v.dayOfWeek);
      });
      for (let v = 0; v < 7; v++) {
        const h = new Date(b);
        h.setDate(b.getDate() + v);
        const f = h.getDay(),
          q = h.toISOString().split('T')[0];
        P.has(f) &&
          ce(q) &&
          t.push({
            date: q,
            dayOfWeek: f,
            display: h.toLocaleDateString('it-IT', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            }),
          });
      }
      return t;
    }, [p.timeSlots, ce]),
    me = u.useMemo(() => {
      if (!S) return [];
      const b = new Date(S).getDay(),
        P = (p.timeSlots || []).filter((f) => f.dayOfWeek === b && f.isActive),
        v = new Map();
      P.forEach((f) => {
        const q = parseInt(f.startTime.split(':')[0]),
          re = parseInt(f.startTime.split(':')[1]),
          ie = parseInt(f.endTime.split(':')[0]),
          le = parseInt(f.endTime.split(':')[1]),
          ae = q * 60 + re,
          Z = ie * 60 + le;
        for (let O = ae; O < Z && !(O + 60 > Z); O += 60) {
          const _ = Math.floor(O / 60),
            J = O % 60,
            M = `${_.toString().padStart(2, '0')}:${J.toString().padStart(2, '0')}`,
            X = U.filter(
              ($) =>
                f.instructorIds.includes($.id) &&
                !k.some((w) => {
                  const g = w.status || 'confirmed';
                  return (
                    w.date === S && w.time === M && w.instructorId === $.id && g === 'confirmed'
                  );
                })
            ),
            ee = (c?.courts || []).filter(($) =>
              f.courtIds.includes($.id)
                ? !k.some((g) => {
                    const G = g.status || 'confirmed';
                    if (g.courtId !== $.id || g.date !== S || G !== 'confirmed') return !1;
                    const W = parseInt(M.split(':')[0]) * 60 + parseInt(M.split(':')[1]),
                      ne = W + 60,
                      te = parseInt(g.time.split(':')[0]) * 60 + parseInt(g.time.split(':')[1]),
                      oe = te + (g.duration || 90);
                    return W < oe && te < ne;
                  })
                : !1
            );
          if (X.length > 0 && ee.length > 0)
            if (v.has(M)) {
              const $ = v.get(M),
                w = [...$.availableInstructors];
              X.forEach((G) => {
                w.some((W) => W.id === G.id) || w.push(G);
              });
              const g = [...$.availableCourts];
              (ee.forEach((G) => {
                g.some((W) => W.id === G.id) || g.push(G);
              }),
                v.set(M, { ...$, availableInstructors: w, availableCourts: g }));
            } else
              v.set(M, {
                id: `${S}-${M}`,
                time: M,
                displayTime: `${_.toString().padStart(2, '0')}:${J.toString().padStart(2, '0')} - ${(_ + 1).toString().padStart(2, '0')}:${J.toString().padStart(2, '0')}`,
                availableInstructors: X,
                availableCourts: ee,
                configSlot: f,
              });
        }
      });
      const h = Array.from(v.values());
      return (
        h.length === 0 &&
          P.length > 0 &&
          console.warn(
            '⚠️ No available slots found despite having configured time slots. Check instructor/court availability.'
          ),
        h.sort((f, q) => f.time.localeCompare(q.time))
      );
    }, [S, p.timeSlots, U, k, c?.courts]),
    ye = u.useCallback(async () => {
      if (!S || !T || !E) {
        m({ type: 'error', text: 'Seleziona data, orario e maestro per continuare.' });
        return;
      }
      try {
        m({ type: '', text: '' });
        const t = T.availableCourts[0],
          b = U.find((h) => h.id === E),
          P = {
            instructorId: E,
            instructorName: b?.name,
            lessonType: 'individual',
            courtId: t.id,
            courtName: t.name,
            date: S,
            time: T.time,
            duration: 60,
            price: 0,
            notes: `Lezione con ${b?.name}`,
            players: [n?.displayName || n?.email],
            userPhone: '',
            bookedBy: n?.displayName || n?.email,
            createCourtBooking: !1,
          };
        console.log('Creating unified lesson booking:', P);
        const v = await d(P);
        (console.log('✅ Created unified lesson booking:', v),
          m({ type: 'success', text: 'Lezione prenotata con successo!' }),
          H(1),
          Q(''),
          Y(null),
          V(''),
          a([]),
          await l(),
          setTimeout(() => m({ type: '', text: '' }), 3e3));
      } catch (t) {
        (console.error('Error booking lesson:', t),
          m({ type: 'error', text: 'Errore durante la prenotazione della lezione.' }));
      }
    }, [S, T, E, U, d, n, l]),
    ve = u.useCallback(
      async (t) => {
        if (window.confirm('Sei sicuro di voler cancellare questa lezione?'))
          try {
            (await y(t),
              m({ type: 'success', text: 'Lezione cancellata con successo!' }),
              setTimeout(() => m({ type: '', text: '' }), 3e3));
          } catch (b) {
            (console.error('Error cancelling lesson:', b),
              m({ type: 'error', text: 'Errore durante la cancellazione della lezione.' }));
          }
      },
      [y]
    ),
    ue = () => H((t) => Math.min(t + 1, 3)),
    xe = () => H((t) => Math.max(t - 1, 1));
  return j
    ? e.jsx(K, {
        T: i,
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
        T: i,
        title: 'Prenota Lezione',
        className: 'space-y-6',
        children: [
          z.text &&
            e.jsx('div', {
              className: `p-4 rounded-lg ${z.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : z.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`,
              children: z.text,
            }),
          e.jsxs('div', {
            className: 'flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1',
            children: [
              e.jsx('button', {
                onClick: () => D('book'),
                className: `px-4 py-2 rounded-md text-sm font-medium transition-colors ${s === 'book' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-emerald-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`,
                children: 'Prenota Lezione',
              }),
              e.jsxs('button', {
                onClick: () => D('bookings'),
                className: `px-4 py-2 rounded-md text-sm font-medium transition-colors ${s === 'bookings' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-emerald-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`,
                children: [
                  'Le Mie Lezioni',
                  ' ',
                  o.length > 0 &&
                    e.jsx(be, {
                      variant: 'primary',
                      size: 'sm',
                      className: 'ml-2',
                      children: o.filter((t) => t.status === 'confirmed').length,
                    }),
                ],
              }),
              r &&
                e.jsx('button', {
                  onClick: () => D('admin'),
                  className: `px-4 py-2 rounded-md text-sm font-medium transition-colors ${s === 'admin' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-emerald-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`,
                  children: 'Gestione',
                }),
            ],
          }),
          s === 'book' &&
            e.jsxs('div', {
              className: 'bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600 p-6',
              children: [
                e.jsxs('div', {
                  className: 'mb-6',
                  children: [
                    e.jsx('div', {
                      className: 'flex items-center justify-between text-sm',
                      children: [1, 2, 3].map((t) =>
                        e.jsxs(
                          'div',
                          {
                            className: `flex items-center ${t < 3 ? 'flex-1' : ''}`,
                            children: [
                              e.jsx('div', {
                                className: `w-8 h-8 rounded-full flex items-center justify-center ${B >= t ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`,
                                children: t,
                              }),
                              t < 3 &&
                                e.jsx('div', {
                                  className: `flex-1 h-0.5 mx-2 ${B > t ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'}`,
                                }),
                            ],
                          },
                          t
                        )
                      ),
                    }),
                    e.jsxs('div', {
                      className: 'mt-2 text-sm text-gray-600 dark:text-gray-300',
                      children: [
                        B === 1 && 'Scegli il Giorno',
                        B === 2 && 'Seleziona Orario',
                        B === 3 && 'Scegli Maestro e Conferma',
                      ],
                    }),
                  ],
                }),
                B === 1 &&
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
                      de.length === 0
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
                            children: de.map((t) => {
                              const b = t.date === new Date().toISOString().split('T')[0];
                              return e.jsxs(
                                'button',
                                {
                                  onClick: () => {
                                    (Q(t.date), Y(null), V(''), a([]), ue());
                                  },
                                  className: `p-3 rounded-xl border text-center transition-all duration-200 hover:scale-105 active:scale-95 ${S === t.date ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-lg' : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md'} ${b ? 'ring-2 ring-green-300 dark:ring-green-500 bg-green-50 dark:bg-green-900/30' : ''}`,
                                  children: [
                                    e.jsx('div', {
                                      className: 'text-xs text-gray-500 uppercase mb-1 font-medium',
                                      children: t.display.split(' ')[0],
                                    }),
                                    e.jsx('div', {
                                      className: 'font-bold text-xl mb-1',
                                      children: t.display.split(' ')[1],
                                    }),
                                    e.jsx('div', {
                                      className:
                                        'text-xs text-gray-600 dark:text-gray-300 font-medium',
                                      children: t.display.split(' ')[2],
                                    }),
                                    b &&
                                      e.jsx('div', {
                                        className:
                                          'text-xs text-green-600 font-bold mt-1 bg-green-100 rounded-full px-2 py-0.5',
                                        children: 'OGGI',
                                      }),
                                  ],
                                },
                                t.date
                              );
                            }),
                          }),
                    ],
                  }),
                B === 2 &&
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
                            children: new Date(S).toLocaleDateString('it-IT', {
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
                                children: me.map((t) =>
                                  e.jsxs(
                                    'button',
                                    {
                                      onClick: () => {
                                        (Y(t),
                                          a(t.availableInstructors),
                                          t.availableInstructors.length === 1
                                            ? V(t.availableInstructors[0].id)
                                            : V(''),
                                          ue());
                                      },
                                      className: `p-4 rounded-xl border text-center transition-all duration-200 hover:scale-105 active:scale-95 ${T?.id === t.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-lg' : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md'}`,
                                      children: [
                                        e.jsx('div', {
                                          className:
                                            'font-bold text-lg mb-2 text-gray-800 dark:text-gray-200',
                                          children: t.displayTime,
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
                                                t.availableInstructors.length,
                                                ' maestr',
                                                t.availableInstructors.length === 1 ? 'o' : 'i',
                                              ],
                                            }),
                                          ],
                                        }),
                                      ],
                                    },
                                    t.id
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
                B === 3 &&
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
                                children: new Date(S).toLocaleDateString('it-IT', {
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
                                children: T?.displayTime,
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
                              C.length === 1 ? 'o disponibile' : 'i disponibili',
                              ' (',
                              C.length,
                              ')',
                            ],
                          }),
                          C.length === 1
                            ? e.jsx('div', {
                                className:
                                  'border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700',
                                children: e.jsxs('div', {
                                  className: 'flex items-center gap-3',
                                  children: [
                                    e.jsx('div', {
                                      className:
                                        'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg',
                                      style: { backgroundColor: C[0].instructorData?.color },
                                      children: C[0].name?.charAt(0) || '?',
                                    }),
                                    e.jsxs('div', {
                                      children: [
                                        e.jsx('div', {
                                          className:
                                            'font-medium text-lg text-gray-900 dark:text-white',
                                          children: C[0].name,
                                        }),
                                        C[0].instructorData?.specialties?.length > 0 &&
                                          e.jsx('div', {
                                            className: 'text-sm text-gray-600 dark:text-gray-300',
                                            children: C[0].instructorData.specialties.join(', '),
                                          }),
                                        C[0].instructorData?.hourlyRate > 0 &&
                                          e.jsxs('div', {
                                            className:
                                              'text-sm font-semibold text-blue-600 dark:text-blue-400',
                                            children: ['€', C[0].instructorData.hourlyRate, '/ora'],
                                          }),
                                      ],
                                    }),
                                  ],
                                }),
                              })
                            : e.jsx('div', {
                                className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                                children: C.map((t) =>
                                  e.jsxs(
                                    'button',
                                    {
                                      onClick: () => V(t.id),
                                      className: `p-4 rounded-lg border-2 text-left transition-colors ${E === t.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`,
                                      children: [
                                        e.jsxs('div', {
                                          className: 'flex items-center gap-3 mb-2',
                                          children: [
                                            e.jsx('div', {
                                              className:
                                                'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold',
                                              style: { backgroundColor: t.instructorData?.color },
                                              children: t.name?.charAt(0) || '?',
                                            }),
                                            e.jsx('div', {
                                              className:
                                                'font-medium text-gray-900 dark:text-white',
                                              children: t.name,
                                            }),
                                          ],
                                        }),
                                        t.instructorData?.specialties?.length > 0 &&
                                          e.jsx('div', {
                                            className:
                                              'text-sm text-gray-600 dark:text-gray-300 mb-1',
                                            children: t.instructorData.specialties.join(', '),
                                          }),
                                        t.instructorData?.hourlyRate > 0 &&
                                          e.jsxs('div', {
                                            className: 'text-sm font-semibold text-blue-600',
                                            children: ['€', t.instructorData.hourlyRate, '/ora'],
                                          }),
                                      ],
                                    },
                                    t.id
                                  )
                                ),
                              }),
                          C.length > 1 &&
                            !E &&
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
                            disabled: !E,
                            className: `px-6 py-2 rounded-lg font-medium transition-colors ${E ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`,
                            children: 'Conferma Prenotazione',
                          }),
                        ],
                      }),
                    ],
                  }),
              ],
            }),
          s === 'bookings' &&
            e.jsxs('div', {
              className: 'bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600 p-6',
              children: [
                e.jsx('h3', {
                  className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
                  children: 'Le Mie Lezioni',
                }),
                o.length === 0
                  ? e.jsx('div', {
                      className: 'text-center py-8 text-gray-500 dark:text-gray-400',
                      children: 'Non hai ancora prenotato nessuna lezione.',
                    })
                  : e.jsx('div', {
                      className: 'space-y-4',
                      children: o
                        .filter((t) => t.status === 'confirmed')
                        .sort(
                          (t, b) =>
                            new Date(t.date + 'T' + t.time) - new Date(b.date + 'T' + b.time)
                        )
                        .map((t) =>
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
                                          U.find((b) => b.id === t.instructorId)?.name ||
                                            t.instructorName,
                                        ],
                                      }),
                                      e.jsxs('div', {
                                        className: 'text-sm text-gray-600 dark:text-gray-300',
                                        children: [
                                          '📅',
                                          ' ',
                                          new Date(t.date).toLocaleDateString('it-IT', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                          }),
                                        ],
                                      }),
                                      e.jsxs('div', {
                                        className: 'text-sm text-gray-600 dark:text-gray-300',
                                        children: ['🕐 ', t.time, ' - ', t.duration, ' minuti'],
                                      }),
                                      t.courtName &&
                                        e.jsxs('div', {
                                          className: 'text-sm text-gray-600 dark:text-gray-300',
                                          children: ['🎾 Campo: ', t.courtName],
                                        }),
                                    ],
                                  }),
                                  e.jsx('button', {
                                    onClick: () => ve(t.id),
                                    className:
                                      'px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors',
                                    children: 'Cancella',
                                  }),
                                ],
                              }),
                            },
                            t.id
                          )
                        ),
                    }),
              ],
            }),
          s === 'admin' &&
            r &&
            e.jsx(De, {
              T: i,
              ds: L,
              lessonConfig: p,
              updateLessonConfig: pe,
              instructors: U,
              players: F,
              setState: N,
              state: c,
              courts: c?.courts || [],
              onClearAllLessons: R,
              lessonBookingsCount: o?.length || 0,
            }),
        ],
      });
}
function qe() {
  const { user: i } = ge(),
    { state: x, setState: c } = je(),
    { clubMode: N } = Ne(),
    r = Se.useMemo(() => ke(), []);
  return e.jsx(Be, { T: r, user: i, state: x, setState: c, clubMode: N });
}
export { qe as default };
