import {
  D as z,
  j as e,
  i as _,
  k as Y,
  f as H,
  m as q,
  u as K,
  t as Q,
} from './index-mfibl1yk-D2ihnd7m.js';
import { r as N, c as Z, b as J } from './router-mfibl1yk-BvCXkbo6.js';
import { S as X } from './Section-mfibl1yk-Bni894MT.js';
import { M as U } from './Modal-mfibl1yk-DuoMxXxE.js';
import { b as T } from './names-mfibl1yk-BW9lV2zG.js';
import { P as w, b as G, d as F, N as B, e as L } from './playerTypes-mfibl1yk-CIm-hM8a.js';
import { s as ee } from './unified-booking-service-mfibl1yk-Dyy4hClR.js';
import './vendor-mfibl1yk-D3F3s8fL.js';
import './firebase-mfibl1yk-X_I_guKF.js';
function te({ player: a, playersById: s, onEdit: r, onDelete: l, onView: i, onStats: u, T: d }) {
  const j = s?.[a.id]?.rating ?? a.rating ?? z,
    f = (t) => {
      switch (t) {
        case w.MEMBER:
          return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
        case w.VIP:
          return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300';
        case w.GUEST:
          return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
        default:
          return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
      }
    },
    p = (t) => {
      switch (t) {
        case w.MEMBER:
          return 'Membro';
        case w.VIP:
          return 'VIP';
        case w.GUEST:
          return 'Ospite';
        case w.NON_MEMBER:
          return 'Non Membro';
        default:
          return 'N/A';
      }
    },
    g = (t) => {
      if (!t) return 'Mai';
      const o = Date.now() - new Date(t).getTime(),
        b = Math.floor(o / (1e3 * 60 * 60 * 24));
      return b === 0
        ? 'Oggi'
        : b === 1
          ? 'Ieri'
          : b < 7
            ? `${b} giorni fa`
            : b < 30
              ? `${Math.floor(b / 7)} settimane fa`
              : `${Math.floor(b / 30)} mesi fa`;
    },
    C = a.subscriptions?.[a.subscriptions?.length - 1],
    k = a.bookingHistory?.length || 0,
    S = a.notes?.length || 0,
    n = a.tags || [];
  return (
    a.createdAt && new Date(a.createdAt).toLocaleDateString('it-IT'),
    e.jsxs('div', {
      className: `${d.cardBg} ${d.border} rounded-xl p-4 lg:p-3 xl:p-3 hover:shadow-md transition-shadow relative overflow-hidden h-full`,
      children: [
        e.jsxs('div', {
          className: 'hidden lg:flex flex-col gap-2',
          children: [
            e.jsxs('div', {
              className: 'flex flex-wrap items-center gap-x-4 gap-y-2',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center gap-3 flex-[2_2_320px] min-w-[280px]',
                  children: [
                    e.jsx('div', {
                      className:
                        'w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg',
                      children: a.name ? a.name.charAt(0).toUpperCase() : '?',
                    }),
                    e.jsxs('div', {
                      className: 'min-w-0 flex-1',
                      children: [
                        e.jsxs('div', {
                          className: 'flex items-center gap-2 mb-1',
                          children: [
                            e.jsx('button', {
                              onClick: i,
                              className:
                                'font-semibold text-lg hover:opacity-80 transition truncate',
                              children:
                                a.name ||
                                `${a.firstName || ''} ${a.lastName || ''}`.trim() ||
                                'Nome non disponibile',
                            }),
                            a.isAccountLinked &&
                              e.jsx('span', {
                                className: 'text-green-500 text-sm',
                                title: 'Account collegato',
                                children: '🔗',
                              }),
                            !a.isActive &&
                              e.jsx('span', {
                                className: 'text-red-500 text-sm',
                                title: 'Inattivo',
                                children: '⏸️',
                              }),
                          ],
                        }),
                        e.jsxs('div', {
                          className:
                            'flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 min-w-0',
                          children: [
                            e.jsx('span', {
                              className: 'truncate max-w-[240px]',
                              children: a.email || 'Email non disponibile',
                            }),
                            a.phone &&
                              e.jsxs(e.Fragment, {
                                children: [
                                  e.jsx('span', { children: '•' }),
                                  e.jsx('span', {
                                    className: 'truncate max-w-[140px]',
                                    children: a.phone,
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
                  className: 'flex flex-col items-start gap-1 min-w-[140px]',
                  children: [
                    e.jsx('span', {
                      className: `px-2 py-1 rounded-full text-xs font-medium ${f(a.category)}`,
                      children: p(a.category),
                    }),
                    C
                      ? e.jsx('span', {
                          className: 'text-[11px] text-green-700 dark:text-green-300',
                          title: `Scadenza: ${C.endDate ? new Date(C.endDate).toLocaleDateString('it-IT') : 'N/D'}`,
                          children: C.type || 'Abbonamento',
                        })
                      : e.jsx('span', {
                          className: `text-[11px] ${d.subtext}`,
                          children: 'Nessun abbonamento',
                        }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'text-center w-[84px] shrink-0',
                  children: [
                    e.jsx('div', {
                      className: 'text-2xl font-bold text-blue-600 dark:text-blue-400',
                      children: Number(j).toFixed(0),
                    }),
                    e.jsx('div', { className: `text-xs ${d.subtext}`, children: 'Rating' }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'text-center w-[110px] shrink-0',
                  children: [
                    e.jsxs('div', {
                      className: 'font-semibold text-green-600 dark:text-green-400',
                      children: ['€', (a.wallet?.balance || 0).toFixed(2)],
                    }),
                    e.jsx('div', { className: `text-xs ${d.subtext}`, children: 'Credito' }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'text-center min-w-[120px]',
                  children: [
                    e.jsx('div', { className: 'text-sm font-medium', children: g(a.lastActivity) }),
                    e.jsx('div', {
                      className: `text-xs ${d.subtext}`,
                      children: 'Ultima attività',
                    }),
                    e.jsxs('div', { className: 'text-xs mt-1', children: ['📅 ', k, ' prenot.'] }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'min-w-[220px] flex-1',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-2 text-xs mb-1',
                      children: [
                        e.jsxs('span', {
                          className: `${S > 0 ? 'text-orange-600 dark:text-orange-400' : d.subtext}`,
                          children: ['📝 ', S, ' note'],
                        }),
                        e.jsxs('span', {
                          className: `${n.length > 0 ? 'text-blue-600 dark:text-blue-400' : d.subtext}`,
                          children: ['🏷️ ', n.length, ' tag'],
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'flex gap-1 flex-wrap',
                      children: [
                        n
                          .slice(0, 3)
                          .map((t, o) =>
                            e.jsx(
                              'span',
                              {
                                className:
                                  'px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-[11px] break-words max-w-[10rem]',
                                children: t,
                              },
                              o
                            )
                          ),
                        n.length > 3 &&
                          e.jsxs('span', {
                            className: `text-[11px] ${d.subtext}`,
                            children: ['+', n.length - 3],
                          }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'flex items-center gap-2 ml-auto',
                  children: [
                    e.jsx('button', {
                      onClick: i,
                      className: `${d.btnSecondary} px-3 py-1 text-sm`,
                      title: 'Visualizza dettagli',
                      children: '👁️',
                    }),
                    e.jsx('button', {
                      onClick: r,
                      className: `${d.btnSecondary} px-3 py-1 text-sm`,
                      title: 'Modifica',
                      children: '✏️',
                    }),
                    e.jsx('button', {
                      onClick: u,
                      className: `${d.btnSecondary} px-3 py-1 text-sm`,
                      title: 'Statistiche',
                      children: '📊',
                    }),
                    e.jsx('button', {
                      onClick: l,
                      className:
                        'px-3 py-1 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors',
                      title: 'Elimina',
                      children: '🗑️',
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'flex flex-wrap items-center gap-x-4 gap-y-2',
              children: [
                e.jsxs('div', {
                  className:
                    'text-sm text-gray-600 dark:text-gray-400 min-w-[300px] max-w-[600px] truncate',
                  children: [a.email || 'Email non disponibile', a.phone ? ` • ${a.phone}` : ''],
                }),
                e.jsxs('div', {
                  className: 'text-xs ${T.subtext}',
                  children: ['📝 ', S, ' note • 🏷️ ', n.length, ' tag'],
                }),
              ],
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'lg:hidden',
          children: [
            e.jsxs('div', {
              className: 'flex items-start gap-3 mb-4',
              children: [
                e.jsx('div', {
                  className:
                    'w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0',
                  children: a.name ? a.name.charAt(0).toUpperCase() : '?',
                }),
                e.jsxs('div', {
                  className: 'min-w-0 flex-1',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-2 mb-1',
                      children: [
                        e.jsx('button', {
                          onClick: i,
                          className: 'font-semibold text-lg hover:opacity-80 transition truncate',
                          children:
                            a.name ||
                            `${a.firstName || ''} ${a.lastName || ''}`.trim() ||
                            'Nome non disponibile',
                        }),
                        a.isAccountLinked &&
                          e.jsx('span', {
                            className: 'text-green-500 text-sm',
                            title: 'Account collegato',
                            children: '🔗',
                          }),
                      ],
                    }),
                    e.jsx('div', {
                      className: 'text-sm text-gray-600 dark:text-gray-400 mb-2 break-words',
                      children: a.email || 'Email non disponibile',
                    }),
                    e.jsx('div', {
                      className: 'flex items-center gap-2 mb-2',
                      children: e.jsx('span', {
                        className: `px-2 py-1 rounded-full text-xs font-medium ${f(a.category)}`,
                        children: p(a.category),
                      }),
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'text-right',
                  children: [
                    e.jsx('div', {
                      className: 'text-xl font-bold text-blue-600 dark:text-blue-400',
                      children: Number(j).toFixed(0),
                    }),
                    e.jsx('div', { className: `text-xs ${d.subtext}`, children: 'Rating' }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'grid grid-cols-2 gap-4 mb-4 text-center',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsxs('div', {
                      className: 'font-semibold text-green-600 dark:text-green-400',
                      children: ['€', (a.wallet?.balance || 0).toFixed(2)],
                    }),
                    e.jsx('div', { className: `text-xs ${d.subtext}`, children: 'Credito' }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('div', { className: 'text-sm font-medium', children: g(a.lastActivity) }),
                    e.jsx('div', {
                      className: `text-xs ${d.subtext}`,
                      children: 'Ultima attività',
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'grid grid-cols-2 gap-4 mb-4 text-xs',
              children: [
                e.jsxs('div', {
                  className: 'text-left',
                  children: [
                    e.jsx('div', { className: `${d.subtext}`, children: 'Prenotazioni' }),
                    e.jsxs('div', { children: ['📅 ', k] }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'text-left',
                  children: [
                    e.jsx('div', { className: `${d.subtext}`, children: 'Note / Tag' }),
                    e.jsxs('div', { children: ['📝 ', S, ' / 🏷️ ', n.length] }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'flex gap-2',
              children: [
                e.jsx('button', {
                  onClick: i,
                  className: `${d.btnSecondary} flex-1 py-2 text-sm`,
                  children: '👁️ Dettagli',
                }),
                e.jsx('button', {
                  onClick: u,
                  className: `${d.btnSecondary} flex-1 py-2 text-sm`,
                  children: '📊 Stats',
                }),
                e.jsx('button', {
                  onClick: r,
                  className: `${d.btnSecondary} px-4 py-2 text-sm`,
                  children: '✏️',
                }),
                e.jsx('button', {
                  onClick: l,
                  className:
                    'px-4 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors',
                  children: '🗑️',
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );
}
function se({ player: a, onSave: s, onCancel: r, T: l }) {
  const [i, u] = N.useState(G()),
    [d, j] = N.useState({}),
    [f, p] = N.useState('basic');
  N.useEffect(() => {
    a && u({ ...G(), ...a });
  }, [a]);
  const g = (n, t) => {
      (u((o) => {
        let b;
        if (n.includes('.')) {
          const [c, x] = n.split('.');
          b = { ...o, [c]: { ...o[c], [x]: t } };
        } else b = { ...o, [n]: t };
        return (
          n === 'category' &&
            t === w.INSTRUCTOR &&
            !b.instructorData?.isInstructor &&
            (b.instructorData = {
              isInstructor: !0,
              color: '#3B82F6',
              specialties: [],
              hourlyRate: 0,
              bio: '',
              certifications: [],
              ...b.instructorData,
            }),
          n === 'category' &&
            t !== w.INSTRUCTOR &&
            o.category === w.INSTRUCTOR &&
            (b.instructorData = { ...b.instructorData, isInstructor: !1 }),
          b
        );
      }),
        d[n] && j((o) => ({ ...o, [n]: void 0 })));
    },
    C = () => {
      const n = {};
      return (
        i.firstName?.trim() || (n.firstName = 'Nome richiesto'),
        i.lastName?.trim() || (n.lastName = 'Cognome richiesto'),
        i.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.email) && (n.email = 'Email non valida'),
        i.phone && !/^[\d\s+\-()]+$/.test(i.phone) && (n.phone = 'Numero di telefono non valido'),
        j(n),
        Object.keys(n).length === 0
      );
    },
    k = (n) => {
      if ((n.preventDefault(), !C())) return;
      const t = {
        ...i,
        name: `${i.firstName} ${i.lastName}`.trim(),
        baseRating: Number(i.baseRating) || z,
        rating: Number(i.rating) || i.baseRating || z,
      };
      s(t);
    },
    S = [
      { id: 'basic', label: '📝 Dati Base', icon: '📝' },
      { id: 'contact', label: '📞 Contatti', icon: '📞' },
      { id: 'sports', label: '🏃 Sport', icon: '🏃' },
      ...(i.category === w.INSTRUCTOR
        ? [{ id: 'instructor', label: '👨‍🏫 Istruttore', icon: '👨‍🏫' }]
        : []),
      { id: 'wallet', label: '💰 Wallet', icon: '💰' },
      { id: 'preferences', label: '⚙️ Preferenze', icon: '⚙️' },
    ];
  return e.jsxs('form', {
    onSubmit: k,
    className: 'space-y-6',
    children: [
      e.jsx('div', {
        className: 'border-b border-gray-200 dark:border-gray-700',
        children: e.jsx('nav', {
          className: 'flex space-x-8 overflow-x-auto',
          children: S.map((n) =>
            e.jsxs(
              'button',
              {
                type: 'button',
                onClick: () => p(n.id),
                className: `py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${f === n.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`,
                children: [
                  e.jsx('span', { className: 'hidden sm:inline', children: n.label }),
                  e.jsx('span', { className: 'sm:hidden text-lg', children: n.icon }),
                ],
              },
              n.id
            )
          ),
        }),
      }),
      e.jsxs('div', {
        className: 'min-h-[400px]',
        children: [
          f === 'basic' &&
            e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  className: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block text-sm font-medium ${l.text} mb-1`,
                          children: 'Nome *',
                        }),
                        e.jsx('input', {
                          type: 'text',
                          value: i.firstName || '',
                          onChange: (n) => g('firstName', n.target.value),
                          className: `${l.input} w-full ${d.firstName ? 'border-red-500' : ''}`,
                          placeholder: 'Nome del giocatore',
                        }),
                        d.firstName &&
                          e.jsx('p', {
                            className: 'text-red-500 text-xs mt-1',
                            children: d.firstName,
                          }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block text-sm font-medium ${l.text} mb-1`,
                          children: 'Cognome *',
                        }),
                        e.jsx('input', {
                          type: 'text',
                          value: i.lastName || '',
                          onChange: (n) => g('lastName', n.target.value),
                          className: `${l.input} w-full ${d.lastName ? 'border-red-500' : ''}`,
                          placeholder: 'Cognome del giocatore',
                        }),
                        d.lastName &&
                          e.jsx('p', {
                            className: 'text-red-500 text-xs mt-1',
                            children: d.lastName,
                          }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm font-medium ${l.text} mb-1`,
                      children: 'Data di Nascita',
                    }),
                    e.jsx('input', {
                      type: 'date',
                      value: i.dateOfBirth || '',
                      onChange: (n) => g('dateOfBirth', n.target.value),
                      className: `${l.input} w-full`,
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm font-medium ${l.text} mb-1`,
                      children: 'Codice Fiscale',
                    }),
                    e.jsx('input', {
                      type: 'text',
                      value: i.fiscalCode || '',
                      onChange: (n) => g('fiscalCode', n.target.value.toUpperCase()),
                      className: `${l.input} w-full`,
                      placeholder: 'RSSMRA80A01H501U',
                      maxLength: 16,
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm font-medium ${l.text} mb-1`,
                      children: 'Categoria',
                    }),
                    e.jsxs('select', {
                      value: i.category || w.NON_MEMBER,
                      onChange: (n) => g('category', n.target.value),
                      className: `${l.input} w-full`,
                      children: [
                        e.jsx('option', { value: w.NON_MEMBER, children: 'Non Membro' }),
                        e.jsx('option', { value: w.MEMBER, children: 'Membro' }),
                        e.jsx('option', { value: w.GUEST, children: 'Ospite' }),
                        e.jsx('option', { value: w.VIP, children: 'VIP' }),
                        e.jsx('option', { value: w.INSTRUCTOR, children: 'Istruttore' }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          f === 'contact' &&
            e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm font-medium ${l.text} mb-1`,
                      children: 'Email',
                    }),
                    e.jsx('input', {
                      type: 'email',
                      value: i.email || '',
                      onChange: (n) => g('email', n.target.value),
                      className: `${l.input} w-full ${d.email ? 'border-red-500' : ''}`,
                      placeholder: 'email@esempio.com',
                    }),
                    d.email &&
                      e.jsx('p', { className: 'text-red-500 text-xs mt-1', children: d.email }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm font-medium ${l.text} mb-1`,
                      children: 'Telefono',
                    }),
                    e.jsx('input', {
                      type: 'tel',
                      value: i.phone || '',
                      onChange: (n) => g('phone', n.target.value),
                      className: `${l.input} w-full ${d.phone ? 'border-red-500' : ''}`,
                      placeholder: '+39 123 456 7890',
                    }),
                    d.phone &&
                      e.jsx('p', { className: 'text-red-500 text-xs mt-1', children: d.phone }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'space-y-3',
                  children: [
                    e.jsx('h4', { className: `font-medium ${l.text}`, children: 'Indirizzo' }),
                    e.jsx('input', {
                      type: 'text',
                      value: i.address?.street || '',
                      onChange: (n) => g('address.street', n.target.value),
                      className: `${l.input} w-full`,
                      placeholder: 'Via, numero civico',
                    }),
                    e.jsxs('div', {
                      className: 'grid grid-cols-2 gap-4',
                      children: [
                        e.jsx('input', {
                          type: 'text',
                          value: i.address?.city || '',
                          onChange: (n) => g('address.city', n.target.value),
                          className: `${l.input} w-full`,
                          placeholder: 'Città',
                        }),
                        e.jsx('input', {
                          type: 'text',
                          value: i.address?.province || '',
                          onChange: (n) => g('address.province', n.target.value),
                          className: `${l.input} w-full`,
                          placeholder: 'Provincia',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'grid grid-cols-2 gap-4',
                      children: [
                        e.jsx('input', {
                          type: 'text',
                          value: i.address?.postalCode || '',
                          onChange: (n) => g('address.postalCode', n.target.value),
                          className: `${l.input} w-full`,
                          placeholder: 'CAP',
                        }),
                        e.jsx('input', {
                          type: 'text',
                          value: i.address?.country || 'Italia',
                          onChange: (n) => g('address.country', n.target.value),
                          className: `${l.input} w-full`,
                          placeholder: 'Paese',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          f === 'sports' &&
            e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  className: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block text-sm font-medium ${l.text} mb-1`,
                          children: 'Rating Base',
                        }),
                        e.jsx('input', {
                          type: 'number',
                          value: i.baseRating || z,
                          onChange: (n) => g('baseRating', Number(n.target.value)),
                          className: `${l.input} w-full`,
                          min: '0',
                          max: '3000',
                          step: '10',
                        }),
                        e.jsxs('p', {
                          className: `text-xs ${l.subtext} mt-1`,
                          children: ['Rating iniziale del giocatore (default: ', z, ')'],
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block text-sm font-medium ${l.text} mb-1`,
                          children: 'Rating Corrente',
                        }),
                        e.jsx('input', {
                          type: 'number',
                          value: i.rating || i.baseRating || z,
                          onChange: (n) => g('rating', Number(n.target.value)),
                          className: `${l.input} w-full`,
                          min: '0',
                          max: '3000',
                          step: '10',
                        }),
                        e.jsx('p', {
                          className: `text-xs ${l.subtext} mt-1`,
                          children: 'Rating attuale (aggiornato automaticamente dai match)',
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsxs('label', {
                      className: `flex items-center gap-2 ${l.text}`,
                      children: [
                        e.jsx('input', {
                          type: 'checkbox',
                          checked: i.isActive !== !1,
                          onChange: (n) => g('isActive', n.target.checked),
                          className: 'rounded',
                        }),
                        'Giocatore attivo',
                      ],
                    }),
                    e.jsx('p', {
                      className: `text-xs ${l.subtext} mt-1`,
                      children: 'I giocatori inattivi non appaiono nelle selezioni per i match',
                    }),
                  ],
                }),
              ],
            }),
          f === 'instructor' &&
            i.category === w.INSTRUCTOR &&
            e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  className: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block text-sm font-medium ${l.text} mb-1`,
                          children: 'Tariffa Oraria (€)',
                        }),
                        e.jsx('input', {
                          type: 'number',
                          value: i.instructorData?.hourlyRate || 0,
                          onChange: (n) => g('instructorData.hourlyRate', Number(n.target.value)),
                          className: `${l.input} w-full`,
                          min: '0',
                          step: '5',
                          placeholder: 'es. 50',
                        }),
                        e.jsx('p', {
                          className: `text-xs ${l.subtext} mt-1`,
                          children: 'Tariffa oraria per le lezioni',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block text-sm font-medium ${l.text} mb-1`,
                          children: 'Colore Identificativo',
                        }),
                        e.jsx('input', {
                          type: 'color',
                          value: i.instructorData?.color || '#3B82F6',
                          onChange: (n) => g('instructorData.color', n.target.value),
                          className: 'w-full h-10 rounded border',
                        }),
                        e.jsx('p', {
                          className: `text-xs ${l.subtext} mt-1`,
                          children: "Colore per identificare l'istruttore nel calendario",
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm font-medium ${l.text} mb-1`,
                      children: 'Biografia',
                    }),
                    e.jsx('textarea', {
                      value: i.instructorData?.bio || '',
                      onChange: (n) => g('instructorData.bio', n.target.value),
                      className: `${l.input} w-full`,
                      rows: 3,
                      placeholder: "Descrizione dell'esperienza e qualifiche dell'istruttore...",
                    }),
                    e.jsx('p', {
                      className: `text-xs ${l.subtext} mt-1`,
                      children: 'Breve descrizione che i clienti vedranno',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm font-medium ${l.text} mb-1`,
                      children: 'Specialità',
                    }),
                    e.jsxs('div', {
                      className: 'space-y-2',
                      children: [
                        e.jsx('div', {
                          className: 'flex flex-wrap gap-2',
                          children: ['Padel', 'Tennis', 'Fitness', 'Calcio', 'Basket'].map((n) =>
                            e.jsx(
                              'button',
                              {
                                type: 'button',
                                onClick: () => {
                                  const t = i.instructorData?.specialties || [];
                                  t.includes(n) || g('instructorData.specialties', [...t, n]);
                                },
                                className: `px-3 py-1 text-sm rounded border ${(i.instructorData?.specialties || []).includes(n) ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`,
                                children: n,
                              },
                              n
                            )
                          ),
                        }),
                        (i.instructorData?.specialties || []).length > 0 &&
                          e.jsx('div', {
                            className: 'flex flex-wrap gap-1',
                            children: (i.instructorData?.specialties || []).map((n, t) =>
                              e.jsxs(
                                'div',
                                {
                                  className:
                                    'flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm',
                                  children: [
                                    e.jsx('span', { children: n }),
                                    e.jsx('button', {
                                      type: 'button',
                                      onClick: () => {
                                        const o = i.instructorData?.specialties || [];
                                        g(
                                          'instructorData.specialties',
                                          o.filter((b) => b !== n)
                                        );
                                      },
                                      className: 'text-blue-600 hover:text-blue-800',
                                      children: '×',
                                    }),
                                  ],
                                },
                                t
                              )
                            ),
                          }),
                      ],
                    }),
                    e.jsx('p', {
                      className: `text-xs ${l.subtext} mt-1`,
                      children: "Specialità sportive dell'istruttore",
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsxs('label', {
                      className: `flex items-center gap-2 ${l.text}`,
                      children: [
                        e.jsx('input', {
                          type: 'checkbox',
                          checked: i.instructorData?.isInstructor !== !1,
                          onChange: (n) => g('instructorData.isInstructor', n.target.checked),
                          className: 'rounded',
                        }),
                        'Istruttore Attivo',
                      ],
                    }),
                    e.jsx('p', {
                      className: `text-xs ${l.subtext} mt-1`,
                      children: "L'istruttore può ricevere prenotazioni lezioni",
                    }),
                  ],
                }),
              ],
            }),
          f === 'wallet' &&
            e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm font-medium ${l.text} mb-1`,
                      children: 'Saldo Corrente (€)',
                    }),
                    e.jsx('input', {
                      type: 'number',
                      value: i.wallet?.balance || 0,
                      onChange: (n) => g('wallet.balance', Number(n.target.value)),
                      className: `${l.input} w-full`,
                      min: '0',
                      step: '0.01',
                      placeholder: '0.00',
                    }),
                    e.jsx('p', {
                      className: `text-xs ${l.subtext} mt-1`,
                      children: 'Credito disponibile per prenotazioni e servizi',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: `${l.cardBg} ${l.border} rounded-lg p-4`,
                  children: [
                    e.jsx('h4', {
                      className: `font-medium ${l.text} mb-2`,
                      children: 'Informazioni Wallet',
                    }),
                    e.jsxs('div', {
                      className: 'space-y-2 text-sm',
                      children: [
                        e.jsxs('div', {
                          className: 'flex justify-between',
                          children: [
                            e.jsx('span', { className: l.subtext, children: 'Transazioni:' }),
                            e.jsx('span', { children: i.wallet?.transactions?.length || 0 }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'flex justify-between',
                          children: [
                            e.jsx('span', {
                              className: l.subtext,
                              children: 'Ultimo aggiornamento:',
                            }),
                            e.jsx('span', {
                              children: i.wallet?.lastUpdate
                                ? new Date(i.wallet.lastUpdate).toLocaleDateString()
                                : 'Mai',
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          f === 'preferences' &&
            e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsx('h4', {
                      className: `font-medium ${l.text} mb-3`,
                      children: 'Preferenze di Comunicazione',
                    }),
                    e.jsxs('div', {
                      className: 'space-y-3',
                      children: [
                        e.jsxs('label', {
                          className: `flex items-center gap-2 ${l.text}`,
                          children: [
                            e.jsx('input', {
                              type: 'checkbox',
                              checked: i.communicationPreferences?.email !== !1,
                              onChange: (n) =>
                                g('communicationPreferences.email', n.target.checked),
                              className: 'rounded',
                            }),
                            'Ricevi email',
                          ],
                        }),
                        e.jsxs('label', {
                          className: `flex items-center gap-2 ${l.text}`,
                          children: [
                            e.jsx('input', {
                              type: 'checkbox',
                              checked: i.communicationPreferences?.sms === !0,
                              onChange: (n) => g('communicationPreferences.sms', n.target.checked),
                              className: 'rounded',
                            }),
                            'Ricevi SMS',
                          ],
                        }),
                        e.jsxs('label', {
                          className: `flex items-center gap-2 ${l.text}`,
                          children: [
                            e.jsx('input', {
                              type: 'checkbox',
                              checked: i.communicationPreferences?.whatsapp === !0,
                              onChange: (n) =>
                                g('communicationPreferences.whatsapp', n.target.checked),
                              className: 'rounded',
                            }),
                            'Ricevi WhatsApp',
                          ],
                        }),
                        e.jsxs('label', {
                          className: `flex items-center gap-2 ${l.text}`,
                          children: [
                            e.jsx('input', {
                              type: 'checkbox',
                              checked: i.communicationPreferences?.notifications !== !1,
                              onChange: (n) =>
                                g('communicationPreferences.notifications', n.target.checked),
                              className: 'rounded',
                            }),
                            'Ricevi notifiche push',
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm font-medium ${l.text} mb-1`,
                      children: 'Tag (separati da virgola)',
                    }),
                    e.jsx('input', {
                      type: 'text',
                      value: i.tags?.join(', ') || '',
                      onChange: (n) =>
                        g(
                          'tags',
                          n.target.value
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean)
                        ),
                      className: `${l.input} w-full`,
                      placeholder: 'principiante, mattiniero, competitivo',
                    }),
                    e.jsx('p', {
                      className: `text-xs ${l.subtext} mt-1`,
                      children: 'I tag aiutano a categorizzare e filtrare i giocatori',
                    }),
                  ],
                }),
              ],
            }),
        ],
      }),
      e.jsxs('div', {
        className: 'flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700',
        children: [
          e.jsx('button', {
            type: 'button',
            onClick: r,
            className: `${l.btnSecondary} px-6 py-2`,
            children: 'Annulla',
          }),
          e.jsxs('button', {
            type: 'submit',
            className: `${l.btnPrimary} px-6 py-2`,
            children: [a ? 'Aggiorna' : 'Crea', ' Giocatore'],
          }),
        ],
      }),
    ],
  });
}
function ae({ player: a, onUpdate: s, T: r }) {
  const [l, i] = N.useState(!1),
    [u, d] = N.useState(null),
    [j, f] = N.useState(F()),
    p = a.notes || [],
    g = () => {
      if (!j.title.trim() || !j.content.trim()) return;
      const t = {
          ...j,
          id: u?.id || _(),
          createdAt: u?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'current-user',
        },
        o = u ? p.map((b) => (b.id === u.id ? t : b)) : [...p, t];
      (s({ notes: o, updatedAt: new Date().toISOString() }), f(F()), i(!1), d(null));
    },
    C = (t) => {
      (f(t), d(t), i(!0));
    },
    k = (t) => {
      if (!confirm('Sei sicuro di voler eliminare questa nota?')) return;
      const o = p.filter((b) => b.id !== t);
      s({ notes: o, updatedAt: new Date().toISOString() });
    },
    S = (t) => {
      switch (t) {
        case B.GENERAL:
          return '📝 Generale';
        case B.BOOKING:
          return '📅 Prenotazione';
        case B.PAYMENT:
          return '💰 Pagamento';
        case B.DISCIPLINARY:
          return '⚠️ Disciplinare';
        case B.MEDICAL:
          return '🏥 Medica';
        default:
          return '📝 Generale';
      }
    },
    n = (t) => {
      switch (t) {
        case B.BOOKING:
          return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
        case B.PAYMENT:
          return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
        case B.DISCIPLINARY:
          return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
        case B.MEDICAL:
          return 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400';
        default:
          return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
      }
    };
  return e.jsxs('div', {
    className: 'space-y-6',
    children: [
      e.jsxs('div', {
        className: 'flex justify-between items-center',
        children: [
          e.jsxs('h3', {
            className: `text-lg font-semibold ${r.text}`,
            children: ['Note Giocatore (', p.length, ')'],
          }),
          e.jsx('button', {
            onClick: () => {
              (f(F()), d(null), i(!0));
            },
            className: `${r.btnPrimary} px-4 py-2`,
            children: '➕ Nuova Nota',
          }),
        ],
      }),
      l &&
        e.jsxs('div', {
          className: `${r.cardBg} ${r.border} rounded-xl p-4`,
          children: [
            e.jsx('h4', {
              className: `font-medium ${r.text} mb-4`,
              children: u ? 'Modifica Nota' : 'Nuova Nota',
            }),
            e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  className: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block text-sm font-medium ${r.text} mb-1`,
                          children: 'Titolo',
                        }),
                        e.jsx('input', {
                          type: 'text',
                          value: j.title,
                          onChange: (t) => f((o) => ({ ...o, title: t.target.value })),
                          className: `${r.input} w-full`,
                          placeholder: 'Titolo della nota',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block text-sm font-medium ${r.text} mb-1`,
                          children: 'Tipo',
                        }),
                        e.jsx('select', {
                          value: j.type,
                          onChange: (t) => f((o) => ({ ...o, type: t.target.value })),
                          className: `${r.input} w-full`,
                          children: Object.values(B).map((t) =>
                            e.jsx('option', { value: t, children: S(t) }, t)
                          ),
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm font-medium ${r.text} mb-1`,
                      children: 'Contenuto',
                    }),
                    e.jsx('textarea', {
                      value: j.content,
                      onChange: (t) => f((o) => ({ ...o, content: t.target.value })),
                      className: `${r.input} w-full`,
                      rows: 4,
                      placeholder: 'Descrizione dettagliata...',
                    }),
                  ],
                }),
                e.jsx('div', {
                  children: e.jsxs('label', {
                    className: `flex items-center gap-2 ${r.text}`,
                    children: [
                      e.jsx('input', {
                        type: 'checkbox',
                        checked: j.isPrivate,
                        onChange: (t) => f((o) => ({ ...o, isPrivate: t.target.checked })),
                        className: 'rounded',
                      }),
                      'Nota privata (visibile solo agli amministratori)',
                    ],
                  }),
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm font-medium ${r.text} mb-1`,
                      children: 'Tag (separati da virgola)',
                    }),
                    e.jsx('input', {
                      type: 'text',
                      value: j.tags?.join(', ') || '',
                      onChange: (t) =>
                        f((o) => ({
                          ...o,
                          tags: t.target.value
                            .split(',')
                            .map((b) => b.trim())
                            .filter(Boolean),
                        })),
                      className: `${r.input} w-full`,
                      placeholder: 'urgente, follow-up, importante',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'flex justify-end gap-3',
                  children: [
                    e.jsx('button', {
                      onClick: () => {
                        (i(!1), d(null), f(F()));
                      },
                      className: `${r.btnSecondary} px-4 py-2`,
                      children: 'Annulla',
                    }),
                    e.jsxs('button', {
                      onClick: g,
                      className: `${r.btnPrimary} px-4 py-2`,
                      children: [u ? 'Aggiorna' : 'Salva', ' Nota'],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      e.jsx('div', {
        className: 'space-y-4',
        children:
          p.length === 0
            ? e.jsxs('div', {
                className: `text-center py-8 ${r.cardBg} ${r.border} rounded-xl`,
                children: [
                  e.jsx('div', { className: 'text-4xl mb-2', children: '📝' }),
                  e.jsx('div', {
                    className: `${r.subtext} mb-4`,
                    children: 'Nessuna nota presente',
                  }),
                  e.jsx('button', {
                    onClick: () => {
                      (f(F()), d(null), i(!0));
                    },
                    className: `${r.btnPrimary} px-6 py-3`,
                    children: 'Aggiungi Prima Nota',
                  }),
                ],
              })
            : p
                .sort((t, o) => new Date(o.createdAt) - new Date(t.createdAt))
                .map((t) =>
                  e.jsxs(
                    'div',
                    {
                      className: `${r.cardBg} ${r.border} rounded-xl p-4`,
                      children: [
                        e.jsxs('div', {
                          className: 'flex justify-between items-start mb-3',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center gap-3',
                              children: [
                                e.jsx('h4', {
                                  className: `font-semibold ${r.text}`,
                                  children: t.title,
                                }),
                                e.jsx('span', {
                                  className: `px-2 py-1 rounded-full text-xs font-medium ${n(t.type)}`,
                                  children: S(t.type),
                                }),
                                t.isPrivate &&
                                  e.jsx('span', {
                                    className:
                                      'px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
                                    children: '🔒 Privata',
                                  }),
                              ],
                            }),
                            e.jsxs('div', {
                              className: 'flex gap-2',
                              children: [
                                e.jsx('button', {
                                  onClick: () => C(t),
                                  className: 'text-blue-500 hover:text-blue-700 text-sm',
                                  title: 'Modifica',
                                  children: '✏️',
                                }),
                                e.jsx('button', {
                                  onClick: () => k(t.id),
                                  className: 'text-red-500 hover:text-red-700 text-sm',
                                  title: 'Elimina',
                                  children: '🗑️',
                                }),
                              ],
                            }),
                          ],
                        }),
                        e.jsx('div', {
                          className: `${r.text} mb-3 whitespace-pre-wrap`,
                          children: t.content,
                        }),
                        e.jsxs('div', {
                          className:
                            'flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center gap-4',
                              children: [
                                e.jsxs('span', {
                                  children: [
                                    '📅 ',
                                    new Date(t.createdAt).toLocaleDateString('it-IT'),
                                  ],
                                }),
                                e.jsxs('span', { children: ['👤 ', t.createdBy || 'Sistema'] }),
                              ],
                            }),
                            t.tags &&
                              t.tags.length > 0 &&
                              e.jsx('div', {
                                className: 'flex flex-wrap gap-1',
                                children: t.tags.map((o, b) =>
                                  e.jsxs(
                                    'span',
                                    {
                                      className:
                                        'px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full',
                                      children: ['#', o],
                                    },
                                    b
                                  )
                                ),
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
  });
}
function le({ player: a, onUpdate: s, T: r }) {
  const [l, i] = N.useState(!1),
    [u, d] = N.useState(L()),
    { addNotification: j } = Y(),
    f = a.wallet || { balance: 0, currency: 'EUR', transactions: [] },
    p = f.transactions || [],
    g = () => {
      if (!u.description || !u.description.trim()) {
        j({
          type: 'warning',
          title: 'Descrizione mancante',
          message: 'Aggiungi una breve descrizione del movimento prima di continuare.',
        });
        return;
      }
      if (!u.amount) return;
      const t = { ...u, id: _(), createdAt: new Date().toISOString(), createdBy: 'current-user' },
        o = u.type === 'credit' ? f.balance + Math.abs(u.amount) : f.balance - Math.abs(u.amount),
        b = {
          ...f,
          balance: Math.max(0, o),
          lastUpdate: new Date().toISOString(),
          transactions: [t, ...p],
        };
      (s({ wallet: b, updatedAt: new Date().toISOString() }), d(L()), i(!1));
    },
    C = (t) => {
      switch (t) {
        case 'credit':
          return '💰';
        case 'debit':
          return '💸';
        case 'refund':
          return '↩️';
        case 'bonus':
          return '🎁';
        default:
          return '💱';
      }
    },
    k = (t) => {
      switch (t) {
        case 'credit':
          return 'Ricarica';
        case 'debit':
          return 'Addebito';
        case 'refund':
          return 'Rimborso';
        case 'bonus':
          return 'Bonus';
        default:
          return 'Transazione';
      }
    },
    S = (t) => {
      switch (t) {
        case 'credit':
          return 'text-green-600 dark:text-green-400';
        case 'debit':
          return 'text-red-600 dark:text-red-400';
        case 'refund':
          return 'text-blue-600 dark:text-blue-400';
        case 'bonus':
          return 'text-purple-600 dark:text-purple-400';
        default:
          return r.text;
      }
    },
    n = (t, o) =>
      `${o === 'credit' || o === 'refund' || o === 'bonus' ? '+' : '-'}€${Math.abs(t).toFixed(2)}`;
  return e.jsxs('div', {
    className: 'space-y-6',
    children: [
      e.jsxs('div', {
        className: `${r.cardBg} ${r.border} rounded-xl p-6 text-center`,
        children: [
          e.jsxs('div', {
            className: 'text-4xl font-bold text-green-600 dark:text-green-400 mb-2',
            children: ['€', f.balance.toFixed(2)],
          }),
          e.jsxs('div', {
            className: `text-sm ${r.subtext} mb-4`,
            children: ['Saldo Disponibile • ', f.currency],
          }),
          e.jsxs('div', {
            className: 'flex justify-center gap-3',
            children: [
              e.jsx('button', {
                onClick: () => {
                  (d({ ...L(), type: 'credit' }), i(!0));
                },
                className: `${r.btnPrimary} px-4 py-2`,
                children: '💰 Ricarica',
              }),
              e.jsx('button', {
                onClick: () => {
                  (d({ ...L(), type: 'debit' }), i(!0));
                },
                className: `${r.btnSecondary} px-4 py-2`,
                children: '💸 Addebito',
              }),
            ],
          }),
        ],
      }),
      l &&
        e.jsxs('div', {
          className: `${r.cardBg} ${r.border} rounded-xl p-4`,
          children: [
            e.jsx('h4', { className: `font-medium ${r.text} mb-4`, children: 'Nuova Transazione' }),
            e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  className: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block text-sm font-medium ${r.text} mb-1`,
                          children: 'Tipo',
                        }),
                        e.jsxs('select', {
                          value: u.type,
                          onChange: (t) => d((o) => ({ ...o, type: t.target.value })),
                          className: `${r.input} w-full`,
                          children: [
                            e.jsx('option', { value: 'credit', children: '💰 Ricarica' }),
                            e.jsx('option', { value: 'debit', children: '💸 Addebito' }),
                            e.jsx('option', { value: 'refund', children: '↩️ Rimborso' }),
                            e.jsx('option', { value: 'bonus', children: '🎁 Bonus' }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block text-sm font-medium ${r.text} mb-1`,
                          children: 'Importo (€)',
                        }),
                        e.jsx('input', {
                          type: 'number',
                          value: u.amount || '',
                          onChange: (t) => d((o) => ({ ...o, amount: Number(t.target.value) })),
                          className: `${r.input} w-full`,
                          min: '0',
                          step: '0.01',
                          placeholder: '0.00',
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm font-medium ${r.text} mb-1`,
                      children: 'Descrizione',
                    }),
                    e.jsx('input', {
                      type: 'text',
                      value: u.description,
                      onChange: (t) => d((o) => ({ ...o, description: t.target.value })),
                      className: `${r.input} w-full`,
                      placeholder: 'Descrizione della transazione...',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm font-medium ${r.text} mb-1`,
                      children: 'Riferimento (opzionale)',
                    }),
                    e.jsx('input', {
                      type: 'text',
                      value: u.reference,
                      onChange: (t) => d((o) => ({ ...o, reference: t.target.value })),
                      className: `${r.input} w-full`,
                      placeholder: 'ID prenotazione, fattura, etc...',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'flex justify-end gap-3',
                  children: [
                    e.jsx('button', {
                      onClick: () => {
                        (i(!1), d(L()));
                      },
                      className: `${r.btnSecondary} px-4 py-2`,
                      children: 'Annulla',
                    }),
                    e.jsx('button', {
                      onClick: g,
                      className: `${r.btnPrimary} px-4 py-2`,
                      children: 'Aggiungi Transazione',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      e.jsxs('div', {
        className: 'grid grid-cols-2 lg:grid-cols-4 gap-4',
        children: [
          e.jsxs('div', {
            className: `${r.cardBg} ${r.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-blue-600 dark:text-blue-400',
                children: p.length,
              }),
              e.jsx('div', { className: `text-xs ${r.subtext}`, children: 'Transazioni' }),
            ],
          }),
          e.jsxs('div', {
            className: `${r.cardBg} ${r.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-green-600 dark:text-green-400',
                children: p.filter(
                  (t) => t.type === 'credit' || t.type === 'refund' || t.type === 'bonus'
                ).length,
              }),
              e.jsx('div', { className: `text-xs ${r.subtext}`, children: 'Entrate' }),
            ],
          }),
          e.jsxs('div', {
            className: `${r.cardBg} ${r.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-red-600 dark:text-red-400',
                children: p.filter((t) => t.type === 'debit').length,
              }),
              e.jsx('div', { className: `text-xs ${r.subtext}`, children: 'Uscite' }),
            ],
          }),
          e.jsxs('div', {
            className: `${r.cardBg} ${r.border} rounded-xl p-4 text-center`,
            children: [
              e.jsxs('div', {
                className: `text-2xl font-bold ${r.text}`,
                children: [
                  '€',
                  p
                    .reduce(
                      (t, o) =>
                        o.type === 'credit' || o.type === 'refund' || o.type === 'bonus'
                          ? t + o.amount
                          : t - o.amount,
                      0
                    )
                    .toFixed(2),
                ],
              }),
              e.jsx('div', { className: `text-xs ${r.subtext}`, children: 'Totale Movimenti' }),
            ],
          }),
        ],
      }),
      e.jsxs('div', {
        children: [
          e.jsxs('h4', {
            className: `font-semibold ${r.text} mb-4`,
            children: ['Storico Transazioni (', p.length, ')'],
          }),
          p.length === 0
            ? e.jsxs('div', {
                className: `text-center py-8 ${r.cardBg} ${r.border} rounded-xl`,
                children: [
                  e.jsx('div', { className: 'text-4xl mb-2', children: '💳' }),
                  e.jsx('div', {
                    className: `${r.subtext} mb-4`,
                    children: 'Nessuna transazione presente',
                  }),
                  e.jsx('button', {
                    onClick: () => {
                      (d({ ...L(), type: 'credit' }), i(!0));
                    },
                    className: `${r.btnPrimary} px-6 py-3`,
                    children: 'Aggiungi Prima Transazione',
                  }),
                ],
              })
            : e.jsx('div', {
                className: 'space-y-3',
                children: p
                  .sort((t, o) => new Date(o.createdAt) - new Date(t.createdAt))
                  .map((t) =>
                    e.jsx(
                      'div',
                      {
                        className: `${r.cardBg} ${r.border} rounded-xl p-4`,
                        children: e.jsxs('div', {
                          className: 'flex justify-between items-start',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center gap-3 flex-1',
                              children: [
                                e.jsx('div', { className: 'text-2xl', children: C(t.type) }),
                                e.jsxs('div', {
                                  className: 'min-w-0 flex-1',
                                  children: [
                                    e.jsxs('div', {
                                      className: 'flex items-center gap-2 mb-1',
                                      children: [
                                        e.jsx('span', {
                                          className: `font-medium ${r.text}`,
                                          children: t.description,
                                        }),
                                        e.jsx('span', {
                                          className: `px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 ${r.subtext}`,
                                          children: k(t.type),
                                        }),
                                      ],
                                    }),
                                    e.jsxs('div', {
                                      className:
                                        'flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400',
                                      children: [
                                        e.jsxs('span', {
                                          children: [
                                            '📅 ',
                                            new Date(t.createdAt).toLocaleDateString('it-IT'),
                                          ],
                                        }),
                                        t.reference &&
                                          e.jsxs('span', { children: ['🔗 ', t.reference] }),
                                        e.jsxs('span', {
                                          children: ['👤 ', t.createdBy || 'Sistema'],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            e.jsx('div', {
                              className: 'text-right',
                              children: e.jsx('div', {
                                className: `text-lg font-bold ${S(t.type)}`,
                                children: n(t.amount, t.type),
                              }),
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
    ],
  });
}
function ie({ player: a, T: s }) {
  const [r, l] = N.useState({ type: 'email', subject: '', message: '', priority: 'normal' }),
    [i, u] = N.useState(''),
    [d, j] = N.useState(!1),
    f = [
      {
        id: 'welcome',
        name: 'Messaggio di Benvenuto',
        subject: 'Benvenuto in Play Sport Pro!',
        content: `Ciao ${a.firstName},

Benvenuto nella famiglia di Play Sport Pro! Siamo felici di averti con noi.

Puoi prenotare i campi direttamente dall'app e tenere traccia del tuo saldo wallet.

Buon gioco!
Il Team Play Sport Pro`,
        type: 'email',
      },
      {
        id: 'booking_reminder',
        name: 'Promemoria Prenotazione',
        subject: 'Promemoria: Prenotazione di domani',
        content: `Ciao ${a.firstName},

Ti ricordiamo la tua prenotazione per domani:

📅 Data: [DATA]
⏰ Orario: [ORARIO]
🏟️ Campo: [CAMPO]
👥 Giocatori: [GIOCATORI]

Ci vediamo in campo!
Il Team Play Sport Pro`,
        type: 'email',
      },
      {
        id: 'payment_reminder',
        name: 'Promemoria Pagamento',
        subject: 'Promemoria: Pagamento prenotazione',
        content: `Ciao ${a.firstName},

Ti ricordiamo che hai una prenotazione non ancora pagata:

📅 Data: [DATA]
⏰ Orario: [ORARIO]
💰 Importo: €[IMPORTO]

Puoi pagare in reception o tramite l'app.

Grazie!
Il Team Play Sport Pro`,
        type: 'email',
      },
      {
        id: 'tournament_invite',
        name: 'Invito Torneo',
        subject: 'Nuovo Torneo: Partecipa ora!',
        content: `Ciao ${a.firstName},

È appena iniziato un nuovo torneo di [SPORT]!

🏆 Nome: [NOME_TORNEO]
📅 Inizio: [DATA_INIZIO]
💰 Premio: [PREMIO]

Iscriviti dall'app per partecipare!

Buona fortuna!
Il Team Play Sport Pro`,
        type: 'email',
      },
      {
        id: 'sms_booking',
        name: 'SMS Prenotazione Confermata',
        content: `🏟️ Prenotazione confermata!
📅 ${new Date().toLocaleDateString()}
⏰ [ORARIO]
Campo: [CAMPO]
Play Sport Pro`,
        type: 'sms',
      },
      {
        id: 'sms_reminder',
        name: 'SMS Promemoria',
        content: '⚡ Promemoria: prenotazione domani alle [ORARIO] - Campo [CAMPO]. Ci vediamo! 🎾',
        type: 'sms',
      },
    ],
    p = [
      {
        id: 'comm1',
        type: 'email',
        subject: 'Benvenuto in Play Sport Pro!',
        sentDate: '2025-09-01T10:00:00',
        status: 'delivered',
        openDate: '2025-09-01T10:30:00',
        template: 'welcome',
      },
      {
        id: 'comm2',
        type: 'sms',
        subject: 'Prenotazione confermata',
        sentDate: '2025-09-05T15:30:00',
        status: 'delivered',
        template: 'sms_booking',
      },
      {
        id: 'comm3',
        type: 'push',
        subject: 'Nuovo torneo disponibile',
        sentDate: '2025-09-07T09:00:00',
        status: 'delivered',
        clickDate: '2025-09-07T09:15:00',
      },
    ],
    g = () => {
      (console.log('Invio messaggio:', r),
        l({ type: 'email', subject: '', message: '', priority: 'normal' }),
        alert(`Messaggio ${r.type} inviato a ${a.firstName}!`));
    },
    C = (t) => {
      (l((o) => ({ ...o, type: t.type, subject: t.subject || '', message: t.content })), j(!1));
    },
    k = (t, o) => {
      if (o === 'failed') return '❌';
      if (o === 'pending') return '⏳';
      switch (t) {
        case 'email':
          return '📧';
        case 'sms':
          return '💬';
        case 'push':
          return '🔔';
        default:
          return '📨';
      }
    },
    S = (t) => {
      switch (t) {
        case 'delivered':
          return 'text-green-600 dark:text-green-400';
        case 'pending':
          return 'text-orange-600 dark:text-orange-400';
        case 'failed':
          return 'text-red-600 dark:text-red-400';
        default:
          return 'text-gray-600 dark:text-gray-400';
      }
    },
    n = {
      totalSent: p.length,
      emails: p.filter((t) => t.type === 'email').length,
      sms: p.filter((t) => t.type === 'sms').length,
      push: p.filter((t) => t.type === 'push').length,
      opened: p.filter((t) => t.openDate || t.clickDate).length,
    };
  return e.jsxs('div', {
    className: 'space-y-6',
    children: [
      e.jsxs('div', {
        className: 'grid grid-cols-2 lg:grid-cols-5 gap-4',
        children: [
          e.jsxs('div', {
            className: `${s.cardBg} ${s.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-blue-600 dark:text-blue-400',
                children: n.totalSent,
              }),
              e.jsx('div', { className: `text-xs ${s.subtext}`, children: 'Totali' }),
            ],
          }),
          e.jsxs('div', {
            className: `${s.cardBg} ${s.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-purple-600 dark:text-purple-400',
                children: n.emails,
              }),
              e.jsx('div', { className: `text-xs ${s.subtext}`, children: '📧 Email' }),
            ],
          }),
          e.jsxs('div', {
            className: `${s.cardBg} ${s.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-green-600 dark:text-green-400',
                children: n.sms,
              }),
              e.jsx('div', { className: `text-xs ${s.subtext}`, children: '💬 SMS' }),
            ],
          }),
          e.jsxs('div', {
            className: `${s.cardBg} ${s.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-orange-600 dark:text-orange-400',
                children: n.push,
              }),
              e.jsx('div', { className: `text-xs ${s.subtext}`, children: '🔔 Push' }),
            ],
          }),
          e.jsxs('div', {
            className: `${s.cardBg} ${s.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-teal-600 dark:text-teal-400',
                children: n.opened,
              }),
              e.jsx('div', { className: `text-xs ${s.subtext}`, children: '👁️ Aperti' }),
            ],
          }),
        ],
      }),
      e.jsxs('div', {
        className: `${s.cardBg} ${s.border} rounded-xl p-6`,
        children: [
          e.jsx('h4', {
            className: `font-semibold ${s.text} mb-4 flex items-center gap-2`,
            children: '✉️ Nuova Comunicazione',
          }),
          e.jsxs('div', {
            className: 'grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4',
            children: [
              e.jsxs('div', {
                children: [
                  e.jsx('label', {
                    className: `block text-sm font-medium ${s.text} mb-2`,
                    children: 'Tipo di messaggio',
                  }),
                  e.jsxs('select', {
                    value: r.type,
                    onChange: (t) => l((o) => ({ ...o, type: t.target.value })),
                    className: `${s.input} w-full`,
                    children: [
                      e.jsx('option', { value: 'email', children: '📧 Email' }),
                      e.jsx('option', { value: 'sms', children: '💬 SMS' }),
                      e.jsx('option', { value: 'push', children: '🔔 Push Notification' }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('label', {
                    className: `block text-sm font-medium ${s.text} mb-2`,
                    children: 'Priorità',
                  }),
                  e.jsxs('select', {
                    value: r.priority,
                    onChange: (t) => l((o) => ({ ...o, priority: t.target.value })),
                    className: `${s.input} w-full`,
                    children: [
                      e.jsx('option', { value: 'low', children: '🟢 Bassa' }),
                      e.jsx('option', { value: 'normal', children: '🟡 Normale' }),
                      e.jsx('option', { value: 'high', children: '🟠 Alta' }),
                      e.jsx('option', { value: 'urgent', children: '🔴 Urgente' }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          r.type === 'email' &&
            e.jsxs('div', {
              className: 'mb-4',
              children: [
                e.jsx('label', {
                  className: `block text-sm font-medium ${s.text} mb-2`,
                  children: 'Oggetto',
                }),
                e.jsx('input', {
                  type: 'text',
                  value: r.subject,
                  onChange: (t) => l((o) => ({ ...o, subject: t.target.value })),
                  placeholder: "Inserisci l'oggetto dell'email",
                  className: `${s.input} w-full`,
                }),
              ],
            }),
          e.jsxs('div', {
            className: 'mb-4',
            children: [
              e.jsxs('div', {
                className: 'flex justify-between items-center mb-2',
                children: [
                  e.jsx('label', {
                    className: `block text-sm font-medium ${s.text}`,
                    children: 'Messaggio',
                  }),
                  e.jsx('button', {
                    onClick: () => j(!0),
                    className: `${s.btnSecondary} text-xs px-3 py-1`,
                    children: '📋 Template',
                  }),
                ],
              }),
              e.jsx('textarea', {
                value: r.message,
                onChange: (t) => l((o) => ({ ...o, message: t.target.value })),
                placeholder: `Scrivi il tuo messaggio ${r.type}...`,
                rows: r.type === 'sms' ? 3 : 6,
                maxLength: r.type === 'sms' ? 160 : void 0,
                className: `${s.input} w-full resize-none`,
              }),
              r.type === 'sms' &&
                e.jsxs('div', {
                  className: `text-right text-xs ${s.subtext} mt-1`,
                  children: [r.message.length, '/160 caratteri'],
                }),
            ],
          }),
          e.jsxs('div', {
            className: `mb-4 p-3 ${s.border} rounded-lg`,
            children: [
              e.jsx('div', {
                className: `text-sm font-medium ${s.text} mb-1`,
                children: 'Destinatario:',
              }),
              e.jsxs('div', {
                className: 'flex items-center gap-2',
                children: [
                  e.jsxs('div', {
                    className:
                      'w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm',
                    children: [a.firstName?.[0], a.lastName?.[0]],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsxs('div', {
                        className: `font-medium ${s.text}`,
                        children: [a.firstName, ' ', a.lastName],
                      }),
                      e.jsxs('div', {
                        className: `text-xs ${s.subtext}`,
                        children: [
                          r.type === 'email' && a.email,
                          r.type === 'sms' && a.phone,
                          r.type === 'push' && 'App mobile',
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs('div', {
            className: 'flex gap-3',
            children: [
              e.jsxs('button', {
                onClick: g,
                disabled: !r.message.trim() || (r.type === 'email' && !r.subject.trim()),
                className: `${s.btnPrimary} flex-1 disabled:opacity-50 disabled:cursor-not-allowed`,
                children: ['🚀 Invia ', r.type.toUpperCase()],
              }),
              e.jsx('button', {
                onClick: () => l({ type: 'email', subject: '', message: '', priority: 'normal' }),
                className: `${s.btnSecondary} px-6`,
                children: '🗑️ Cancella',
              }),
            ],
          }),
        ],
      }),
      e.jsxs('div', {
        children: [
          e.jsxs('h4', {
            className: `font-semibold ${s.text} mb-4`,
            children: ['📋 Storico Comunicazioni (', p.length, ')'],
          }),
          p.length === 0
            ? e.jsxs('div', {
                className: `text-center py-8 ${s.cardBg} ${s.border} rounded-xl`,
                children: [
                  e.jsx('div', { className: 'text-4xl mb-2', children: '📭' }),
                  e.jsx('div', {
                    className: `${s.subtext} mb-4`,
                    children: 'Nessuna comunicazione inviata',
                  }),
                ],
              })
            : e.jsx('div', {
                className: 'space-y-3',
                children: p
                  .sort((t, o) => new Date(o.sentDate) - new Date(t.sentDate))
                  .map((t) =>
                    e.jsx(
                      'div',
                      {
                        className: `${s.cardBg} ${s.border} rounded-xl p-4`,
                        children: e.jsxs('div', {
                          className: 'flex items-start gap-3',
                          children: [
                            e.jsx('div', { className: 'text-2xl', children: k(t.type, t.status) }),
                            e.jsxs('div', {
                              className: 'flex-1 min-w-0',
                              children: [
                                e.jsxs('div', {
                                  className: 'flex items-center gap-2 mb-1',
                                  children: [
                                    e.jsx('span', {
                                      className: `font-medium ${s.text}`,
                                      children: t.subject,
                                    }),
                                    e.jsx('span', {
                                      className: `px-2 py-1 rounded-full text-xs font-medium uppercase ${S(t.status)} bg-gray-100 dark:bg-gray-800`,
                                      children: t.status,
                                    }),
                                  ],
                                }),
                                e.jsxs('div', {
                                  className: `text-sm ${s.subtext}`,
                                  children: [
                                    '📅 Inviato: ',
                                    new Date(t.sentDate).toLocaleDateString('it-IT'),
                                    ' alle',
                                    ' ',
                                    new Date(t.sentDate).toLocaleTimeString('it-IT', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }),
                                  ],
                                }),
                                t.openDate &&
                                  e.jsxs('div', {
                                    className: `text-sm ${s.subtext}`,
                                    children: [
                                      '👁️ Aperto: ',
                                      new Date(t.openDate).toLocaleDateString('it-IT'),
                                      ' alle',
                                      ' ',
                                      new Date(t.openDate).toLocaleTimeString('it-IT', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      }),
                                    ],
                                  }),
                                t.clickDate &&
                                  e.jsxs('div', {
                                    className: `text-sm ${s.subtext}`,
                                    children: [
                                      '👆 Cliccato: ',
                                      new Date(t.clickDate).toLocaleDateString('it-IT'),
                                      ' alle',
                                      ' ',
                                      new Date(t.clickDate).toLocaleTimeString('it-IT', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      }),
                                    ],
                                  }),
                              ],
                            }),
                            e.jsx('div', {
                              className: 'text-right',
                              children: e.jsx('div', {
                                className: `text-xs ${s.subtext} uppercase tracking-wide`,
                                children: t.type,
                              }),
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
      d &&
        e.jsx('div', {
          className:
            'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
          children: e.jsxs('div', {
            className: `${s.modalBg} rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden`,
            children: [
              e.jsx('div', {
                className: 'p-6 border-b border-gray-200 dark:border-gray-700',
                children: e.jsxs('div', {
                  className: 'flex items-center justify-between',
                  children: [
                    e.jsx('h3', {
                      className: `text-xl font-bold ${s.text}`,
                      children: '📋 Template Messaggi',
                    }),
                    e.jsx('button', {
                      onClick: () => j(!1),
                      className: `${s.btnSecondary} px-4 py-2`,
                      children: '✖️',
                    }),
                  ],
                }),
              }),
              e.jsx('div', {
                className: 'p-6 overflow-y-auto',
                children: e.jsx('div', {
                  className: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
                  children: f.map((t) =>
                    e.jsxs(
                      'div',
                      {
                        className: `${s.border} rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors`,
                        onClick: () => C(t),
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center gap-3 mb-3',
                            children: [
                              e.jsx('span', {
                                className: 'text-2xl',
                                children: t.type === 'email' ? '📧' : '💬',
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('div', {
                                    className: `font-medium ${s.text}`,
                                    children: t.name,
                                  }),
                                  e.jsx('div', {
                                    className: `text-xs ${s.subtext} uppercase`,
                                    children: t.type,
                                  }),
                                ],
                              }),
                            ],
                          }),
                          t.subject &&
                            e.jsx('div', {
                              className: `text-sm font-medium ${s.text} mb-2`,
                              children: t.subject,
                            }),
                          e.jsx('div', {
                            className: `text-sm ${s.subtext} line-clamp-3`,
                            children: t.content,
                          }),
                        ],
                      },
                      t.id
                    )
                  ),
                }),
              }),
            ],
          }),
        }),
    ],
  });
}
function ne({ player: a, T: s }) {
  const [r, l] = N.useState('all'),
    [i, u] = N.useState('all'),
    [d, j] = N.useState(!1),
    [f, p] = N.useState(null),
    [g, C] = N.useState([]);
  N.useEffect(() => {
    let c = !1;
    async function x() {
      (j(!0), p(null));
      try {
        const h = a?.linkedAccountId || null,
          v = a?.linkedAccountEmail || a?.email || null,
          D = a?.name || `${a?.firstName || ''} ${a?.lastName || ''}`.trim(),
          I = await ee({ userId: h, email: v, name: D });
        if (c) return;
        C(I || []);
      } catch (h) {
        if (c) return;
        p(h);
      } finally {
        c || j(!1);
      }
    }
    return (
      x(),
      () => {
        c = !0;
      }
    );
  }, [a?.linkedAccountId, a?.linkedAccountEmail, a?.email, a?.name, a?.firstName, a?.lastName]);
  const k = N.useMemo(
      () =>
        (g || []).map((c) => {
          const x = c.date,
            h = c.time || '',
            v = h.includes('-') ? h : `${h}`,
            D = c.courtName || c.court || 'Campo',
            I = c.sport || 'Padel',
            E = c.status || 'confirmed',
            R =
              Array.isArray(c.players) && c.players.length > 0
                ? c.players
                : [c.bookedBy || c.userEmail || ''],
            y = typeof c.price == 'number' ? c.price : Number(c.price || 0) || 0,
            A = !!c.paid || c.paymentStatus === 'paid',
            $ = c.paymentMethod || null;
          return {
            id: c.id,
            date: x,
            time: v,
            court: D,
            sport: I,
            status: E,
            players: R,
            price: y,
            paid: A,
            paymentMethod: $,
          };
        }),
      [g]
    ),
    S = (c) => {
      const x = (c.time || '').split('-')[0].trim(),
        h = x ? `${c.date}T${x}:00` : `${c.date}T00:00:00`,
        v = new Date(h);
      return isNaN(v.getTime()) ? new Date(c.date) : v;
    },
    n = (c) => {
      switch (c) {
        case 'confirmed':
          return '✅ Confermata';
        case 'completed':
          return '🏁 Completata';
        case 'cancelled':
          return '❌ Cancellata';
        case 'no_show':
          return '👻 Assenza';
        default:
          return '❓ Sconosciuto';
      }
    },
    t = (c) => {
      switch (c) {
        case 'confirmed':
          return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
        case 'completed':
          return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
        case 'cancelled':
          return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
        case 'no_show':
          return 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400';
        default:
          return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
      }
    },
    o = k.filter((c) => {
      const x = new Date(),
        h = S(c);
      if (r !== 'all') {
        if (r === 'completed') {
          if (!(h < x && c.status !== 'cancelled')) return !1;
        } else if (r === 'confirmed') {
          if (c.status !== 'confirmed') return !1;
        } else if (r === 'cancelled') {
          if (c.status !== 'cancelled') return !1;
        } else if (r === 'no_show') {
          if (c.status !== 'no_show') return !1;
        } else if (c.status !== r) return !1;
      }
      if (i !== 'all') {
        const v = new Date(c.date);
        switch (i) {
          case 'week': {
            const D = new Date(x.getTime() - 6048e5);
            return v >= D;
          }
          case 'month': {
            const D = new Date(x.getTime() - 2592e6);
            return v >= D;
          }
          case 'year': {
            const D = new Date(x.getTime() - 31536e6);
            return v >= D;
          }
          default:
            return !0;
        }
      }
      return !0;
    }),
    b = {
      total: k.length,
      completed: k.filter((c) => S(c) < new Date() && c.status !== 'cancelled').length,
      upcoming: k.filter((c) => S(c) >= new Date() && c.status !== 'cancelled').length,
      cancelled: k.filter((c) => c.status === 'cancelled').length,
      totalSpent: k.filter((c) => c.paid).reduce((c, x) => c + x.price, 0),
    };
  return e.jsxs('div', {
    className: 'space-y-6',
    children: [
      e.jsxs('div', {
        className: 'grid grid-cols-2 lg:grid-cols-5 gap-4',
        children: [
          e.jsxs('div', {
            className: `${s.cardBg} ${s.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-blue-600 dark:text-blue-400',
                children: b.total,
              }),
              e.jsx('div', { className: `text-xs ${s.subtext}`, children: 'Totale' }),
            ],
          }),
          e.jsxs('div', {
            className: `${s.cardBg} ${s.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-green-600 dark:text-green-400',
                children: b.completed,
              }),
              e.jsx('div', { className: `text-xs ${s.subtext}`, children: 'Completate' }),
            ],
          }),
          e.jsxs('div', {
            className: `${s.cardBg} ${s.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-orange-600 dark:text-orange-400',
                children: b.upcoming,
              }),
              e.jsx('div', { className: `text-xs ${s.subtext}`, children: 'Future' }),
            ],
          }),
          e.jsxs('div', {
            className: `${s.cardBg} ${s.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-red-600 dark:text-red-400',
                children: b.cancelled,
              }),
              e.jsx('div', { className: `text-xs ${s.subtext}`, children: 'Cancellate' }),
            ],
          }),
          e.jsxs('div', {
            className: `${s.cardBg} ${s.border} rounded-xl p-4 text-center`,
            children: [
              e.jsxs('div', {
                className: 'text-2xl font-bold text-purple-600 dark:text-purple-400',
                children: ['€', b.totalSpent.toFixed(2)],
              }),
              e.jsx('div', { className: `text-xs ${s.subtext}`, children: 'Totale Speso' }),
            ],
          }),
        ],
      }),
      e.jsxs('div', {
        className: 'flex flex-col lg:flex-row gap-4',
        children: [
          e.jsxs('div', {
            className: 'flex-1',
            children: [
              e.jsx('label', {
                className: `block text-sm font-medium ${s.text} mb-2`,
                children: 'Filtra per stato',
              }),
              e.jsxs('select', {
                value: r,
                onChange: (c) => l(c.target.value),
                className: `${s.input} w-full`,
                children: [
                  e.jsx('option', { value: 'all', children: 'Tutti gli stati' }),
                  e.jsx('option', { value: 'confirmed', children: 'Confermate' }),
                  e.jsx('option', { value: 'completed', children: 'Completate' }),
                  e.jsx('option', { value: 'cancelled', children: 'Cancellate' }),
                  e.jsx('option', { value: 'no_show', children: 'Assenze' }),
                ],
              }),
            ],
          }),
          e.jsxs('div', {
            className: 'flex-1',
            children: [
              e.jsx('label', {
                className: `block text-sm font-medium ${s.text} mb-2`,
                children: 'Filtra per periodo',
              }),
              e.jsxs('select', {
                value: i,
                onChange: (c) => u(c.target.value),
                className: `${s.input} w-full`,
                children: [
                  e.jsx('option', { value: 'all', children: 'Tutti i periodi' }),
                  e.jsx('option', { value: 'week', children: 'Ultima settimana' }),
                  e.jsx('option', { value: 'month', children: 'Ultimo mese' }),
                  e.jsx('option', { value: 'year', children: 'Ultimo anno' }),
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsxs('div', {
        children: [
          e.jsxs('h4', {
            className: `font-semibold ${s.text} mb-4`,
            children: ['Storico Prenotazioni (', o.length, ')'],
          }),
          d
            ? e.jsxs('div', {
                className: `text-center py-8 ${s.cardBg} ${s.border} rounded-xl`,
                children: [
                  e.jsx('div', { className: 'text-4xl mb-2', children: '⏳' }),
                  e.jsx('div', {
                    className: `${s.subtext}`,
                    children: 'Caricamento prenotazioni…',
                  }),
                ],
              })
            : f
              ? e.jsxs('div', {
                  className: `text-center py-8 ${s.cardBg} ${s.border} rounded-xl`,
                  children: [
                    e.jsx('div', { className: 'text-4xl mb-2', children: '⚠️' }),
                    e.jsx('div', {
                      className: `${s.subtext}`,
                      children: 'Errore nel caricamento delle prenotazioni',
                    }),
                  ],
                })
              : o.length === 0
                ? e.jsxs('div', {
                    className: `text-center py-8 ${s.cardBg} ${s.border} rounded-xl`,
                    children: [
                      e.jsx('div', { className: 'text-4xl mb-2', children: '📅' }),
                      e.jsx('div', {
                        className: `${s.subtext} mb-4`,
                        children:
                          r !== 'all' || i !== 'all'
                            ? 'Nessuna prenotazione corrispondente ai filtri'
                            : 'Nessuna prenotazione presente',
                      }),
                      r !== 'all' || i !== 'all'
                        ? e.jsx('button', {
                            onClick: () => {
                              (l('all'), u('all'));
                            },
                            className: `${s.btnSecondary} px-6 py-3`,
                            children: 'Rimuovi Filtri',
                          })
                        : null,
                    ],
                  })
                : e.jsx('div', {
                    className: 'space-y-3',
                    children: o
                      .sort((c, x) => S(x) - S(c))
                      .map((c) =>
                        e.jsxs(
                          'div',
                          {
                            className: `${s.cardBg} ${s.border} rounded-xl p-4`,
                            children: [
                              e.jsxs('div', {
                                className: 'hidden lg:flex items-center gap-4',
                                children: [
                                  e.jsx('div', {
                                    className:
                                      'w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold',
                                    children: new Date(c.date).getDate(),
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex-1 min-w-0',
                                    children: [
                                      e.jsxs('div', {
                                        className: 'flex items-center gap-3 mb-1',
                                        children: [
                                          e.jsxs('span', {
                                            className: `font-medium ${s.text}`,
                                            children: [c.court, ' - ', c.sport],
                                          }),
                                          e.jsx('span', {
                                            className: `px-2 py-1 rounded-full text-xs font-medium ${t(c.status)}`,
                                            children: n(c.status),
                                          }),
                                          c.paid &&
                                            e.jsx('span', {
                                              className:
                                                'px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
                                              children: '💰 Pagato',
                                            }),
                                        ],
                                      }),
                                      e.jsxs('div', {
                                        className:
                                          'flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400',
                                        children: [
                                          e.jsxs('span', {
                                            children: [
                                              '📅 ',
                                              new Date(c.date).toLocaleDateString('it-IT'),
                                            ],
                                          }),
                                          e.jsxs('span', { children: ['⏰ ', c.time] }),
                                          e.jsxs('span', {
                                            children: ['👥 ', c.players.join(', ')],
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    className: 'text-right',
                                    children: [
                                      e.jsxs('div', {
                                        className:
                                          'text-lg font-bold text-green-600 dark:text-green-400',
                                        children: ['€', c.price.toFixed(2)],
                                      }),
                                      e.jsx('div', {
                                        className: `text-xs ${s.subtext}`,
                                        children: c.paymentMethod ? c.paymentMethod : 'Non pagato',
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                className: 'lg:hidden',
                                children: [
                                  e.jsxs('div', {
                                    className: 'flex justify-between items-start mb-3',
                                    children: [
                                      e.jsxs('div', {
                                        children: [
                                          e.jsxs('div', {
                                            className: `font-medium ${s.text} mb-1`,
                                            children: [c.court, ' - ', c.sport],
                                          }),
                                          e.jsxs('div', {
                                            className: 'text-sm text-gray-500 dark:text-gray-400',
                                            children: [
                                              '📅 ',
                                              new Date(c.date).toLocaleDateString('it-IT'),
                                              ' ⏰ ',
                                              c.time,
                                            ],
                                          }),
                                        ],
                                      }),
                                      e.jsx('div', {
                                        className: 'text-right',
                                        children: e.jsxs('div', {
                                          className:
                                            'text-lg font-bold text-green-600 dark:text-green-400',
                                          children: ['€', c.price.toFixed(2)],
                                        }),
                                      }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex flex-wrap gap-2 mb-3',
                                    children: [
                                      e.jsx('span', {
                                        className: `px-2 py-1 rounded-full text-xs font-medium ${t(c.status)}`,
                                        children: n(c.status),
                                      }),
                                      c.paid &&
                                        e.jsx('span', {
                                          className:
                                            'px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
                                          children: '💰 Pagato',
                                        }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    className: 'text-sm text-gray-500 dark:text-gray-400',
                                    children: ['👥 ', c.players.join(', ')],
                                  }),
                                ],
                              }),
                            ],
                          },
                          c.id
                        )
                      ),
                  }),
        ],
      }),
    ],
  });
}
function re({ player: a, onUpdate: s, onClose: r, T: l }) {
  const [i, u] = N.useState('overview'),
    [d, j] = N.useState(!1),
    [f, p] = N.useState(''),
    [g, C] = N.useState(''),
    [k, S] = N.useState([]),
    [n, t] = N.useState(!1),
    { state: o } = H(),
    b = N.useMemo(
      () =>
        new Set(
          (o?.players || [])
            .filter((m) => m.id !== a.id && (m.isAccountLinked || m.linkedAccountEmail))
            .map((m) => (m.linkedAccountEmail || '').toLowerCase())
            .filter(Boolean)
        ),
      [o?.players, a.id]
    ),
    c = N.useMemo(
      () =>
        new Set(
          (o?.players || [])
            .filter((m) => m.id !== a.id && (m.isAccountLinked || m.linkedAccountId))
            .map((m) => m.linkedAccountId)
            .filter(Boolean)
        ),
      [o?.players, a.id]
    ),
    x = N.useMemo(
      () =>
        (k || []).filter((m) => {
          const M = (m.email || '').toLowerCase(),
            O = m.uid;
          return !M || (O && c.has(O)) ? !1 : !b.has(M);
        }),
      [k, b, c]
    ),
    h = N.useMemo(() => {
      const m = g.trim().toLowerCase();
      return m
        ? x.filter(
            (M) =>
              (M.email || '').toLowerCase().includes(m) ||
              (M.firstName || '').toLowerCase().includes(m) ||
              (M.lastName || '').toLowerCase().includes(m)
          )
        : x;
    }, [x, g]),
    v = async () => {
      try {
        t(!0);
        const m = await q(500);
        (S(m || []), C(''), j(!0));
      } finally {
        t(!1);
      }
    },
    D = (m) => {
      switch (m) {
        case w.MEMBER:
          return 'Membro';
        case w.VIP:
          return 'VIP';
        case w.GUEST:
          return 'Ospite';
        case w.NON_MEMBER:
          return 'Non Membro';
        default:
          return 'N/A';
      }
    },
    I = (m) => {
      switch (m) {
        case w.MEMBER:
          return 'text-green-600 dark:text-green-400';
        case w.VIP:
          return 'text-purple-600 dark:text-purple-400';
        case w.GUEST:
          return 'text-blue-600 dark:text-blue-400';
        default:
          return 'text-gray-600 dark:text-gray-400';
      }
    },
    E = () => {
      f.trim() &&
        (s({
          linkedAccountEmail: f.trim(),
          isAccountLinked: !0,
          updatedAt: new Date().toISOString(),
        }),
        j(!1),
        p(''));
    },
    R = () => {
      confirm("Sei sicuro di voler scollegare l'account da questo giocatore?") &&
        s({
          linkedAccountId: null,
          linkedAccountEmail: null,
          isAccountLinked: !1,
          updatedAt: new Date().toISOString(),
        });
    },
    y = () => {
      s({ isActive: !a.isActive, updatedAt: new Date().toISOString() });
    },
    A = (m) =>
      m
        ? new Date(m).toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'N/A',
    $ = (m) => {
      if (!m) return null;
      const M = new Date(),
        O = new Date(m);
      let W = M.getFullYear() - O.getFullYear();
      const V = M.getMonth() - O.getMonth();
      return ((V < 0 || (V === 0 && M.getDate() < O.getDate())) && W--, W);
    },
    P = [
      { id: 'overview', label: '👤 Panoramica', icon: '👤' },
      { id: 'notes', label: '📝 Note', icon: '📝' },
      { id: 'wallet', label: '💰 Wallet', icon: '💰' },
      { id: 'bookings', label: '📅 Prenotazioni', icon: '📅' },
      { id: 'communications', label: '✉️ Comunicazioni', icon: '✉️' },
    ];
  return e.jsxs('div', {
    className: 'space-y-6',
    children: [
      e.jsxs('div', {
        className: `${l.cardBg} ${l.border} rounded-xl p-6`,
        children: [
          e.jsxs('div', {
            className: 'flex flex-col xl:flex-row xl:items-start gap-8',
            children: [
              e.jsxs('div', {
                className: 'flex items-start gap-4',
                children: [
                  e.jsx('div', {
                    className:
                      'w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl',
                    children: a.name ? a.name.charAt(0).toUpperCase() : '?',
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx('h2', {
                        className: `text-2xl font-bold ${l.text} mb-2`,
                        children:
                          a.name ||
                          `${a.firstName || ''} ${a.lastName || ''}`.trim() ||
                          'Nome non disponibile',
                      }),
                      e.jsxs('div', {
                        className: 'flex items-center gap-3 mb-2',
                        children: [
                          e.jsx('span', {
                            className: `px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 ${I(a.category)}`,
                            children: D(a.category),
                          }),
                          !a.isActive &&
                            e.jsx('span', {
                              className:
                                'px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
                              children: 'Inattivo',
                            }),
                        ],
                      }),
                      e.jsxs('div', {
                        className: 'space-y-1 text-sm text-gray-600 dark:text-gray-400',
                        children: [
                          a.email &&
                            e.jsxs('div', {
                              className: 'flex items-center gap-2',
                              children: [
                                e.jsx('span', { children: '📧' }),
                                e.jsx('span', { children: a.email }),
                              ],
                            }),
                          a.phone &&
                            e.jsxs('div', {
                              className: 'flex items-center gap-2',
                              children: [
                                e.jsx('span', { children: '📱' }),
                                e.jsx('span', { children: a.phone }),
                              ],
                            }),
                          a.dateOfBirth &&
                            e.jsxs('div', {
                              className: 'flex items-center gap-2',
                              children: [
                                e.jsx('span', { children: '🎂' }),
                                e.jsxs('span', {
                                  children: [
                                    new Date(a.dateOfBirth).toLocaleDateString('it-IT'),
                                    $(a.dateOfBirth) && ` (${$(a.dateOfBirth)} anni)`,
                                  ],
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
                className: 'flex-1 xl:text-right',
                children: [
                  e.jsxs('div', {
                    className: 'grid grid-cols-2 md:grid-cols-3 gap-4 mb-4',
                    children: [
                      e.jsxs('div', {
                        className: 'text-center',
                        children: [
                          e.jsx('div', {
                            className: 'text-2xl font-bold text-blue-600 dark:text-blue-400',
                            children: Number(a.rating || z).toFixed(0),
                          }),
                          e.jsx('div', { className: `text-xs ${l.subtext}`, children: 'Rating' }),
                        ],
                      }),
                      e.jsxs('div', {
                        className: 'text-center',
                        children: [
                          e.jsxs('div', {
                            className: 'text-2xl font-bold text-green-600 dark:text-green-400',
                            children: ['€', (a.wallet?.balance || 0).toFixed(2)],
                          }),
                          e.jsx('div', { className: `text-xs ${l.subtext}`, children: 'Credito' }),
                        ],
                      }),
                      e.jsxs('div', {
                        className: 'text-center',
                        children: [
                          e.jsx('div', {
                            className: 'text-2xl font-bold text-orange-600 dark:text-orange-400',
                            children: a.bookingHistory?.length || 0,
                          }),
                          e.jsx('div', {
                            className: `text-xs ${l.subtext}`,
                            children: 'Prenotazioni',
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsx('div', {
                    className: 'flex gap-2 justify-end',
                    children: e.jsx('button', {
                      onClick: y,
                      className: `px-3 py-1 text-sm rounded ${a.isActive ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'}`,
                      children: a.isActive ? '⏸️ Disattiva' : '▶️ Attiva',
                    }),
                  }),
                ],
              }),
            ],
          }),
          e.jsx('div', {
            className: 'mt-6 pt-4 border-t border-gray-200 dark:border-gray-700',
            children: e.jsxs('div', {
              className: 'flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center gap-3',
                  children: [
                    e.jsx('span', {
                      className: `text-sm font-medium ${l.text}`,
                      children: 'Account Collegato:',
                    }),
                    a.isAccountLinked
                      ? e.jsxs('div', {
                          className: 'flex items-center gap-2',
                          children: [
                            e.jsx('span', { className: 'text-green-500', children: '🔗' }),
                            e.jsx('span', {
                              className: 'text-sm text-green-600 dark:text-green-400',
                              children: a.linkedAccountEmail,
                            }),
                            e.jsx('button', {
                              onClick: R,
                              className: 'text-xs text-red-500 hover:text-red-700 ml-2',
                              children: 'Scollega',
                            }),
                          ],
                        })
                      : e.jsx('span', {
                          className: 'text-sm text-gray-500',
                          children: 'Nessun account collegato',
                        }),
                  ],
                }),
                !a.isAccountLinked &&
                  e.jsx('div', {
                    className: 'flex flex-col gap-2 w-full max-w-xl',
                    children: d
                      ? e.jsx('div', {
                          className: 'space-y-2',
                          children:
                            k.length > 0
                              ? e.jsxs('div', {
                                  className: 'space-y-2',
                                  children: [
                                    e.jsxs('div', {
                                      className: 'flex items-center gap-2',
                                      children: [
                                        e.jsx('input', {
                                          type: 'text',
                                          value: g,
                                          onChange: (m) => C(m.target.value),
                                          placeholder: 'Cerca per nome o email…',
                                          className: `${l.input} text-sm flex-1`,
                                        }),
                                        e.jsx('button', {
                                          onClick: () => S([]),
                                          className:
                                            'px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded',
                                          children: 'Chiudi elenco',
                                        }),
                                      ],
                                    }),
                                    e.jsx('div', {
                                      className: `${l.cardBg} ${l.border} rounded-lg max-h-64 overflow-auto`,
                                      children:
                                        h.length === 0
                                          ? e.jsx('div', {
                                              className: `p-3 text-sm ${l.subtext}`,
                                              children: 'Nessun account disponibile',
                                            })
                                          : e.jsx('ul', {
                                              className:
                                                'divide-y divide-gray-200 dark:divide-gray-700',
                                              children: h.map((m) =>
                                                e.jsxs(
                                                  'li',
                                                  {
                                                    className:
                                                      'p-3 flex items-center justify-between',
                                                    children: [
                                                      e.jsxs('div', {
                                                        className: 'min-w-0',
                                                        children: [
                                                          e.jsx('div', {
                                                            className: `${l.text} font-medium truncate`,
                                                            children:
                                                              m.firstName || m.lastName
                                                                ? `${m.firstName || ''} ${m.lastName || ''}`.trim()
                                                                : m.email || 'Senza nome',
                                                          }),
                                                          e.jsx('div', {
                                                            className: `text-xs ${l.subtext} truncate`,
                                                            children: m.email,
                                                          }),
                                                        ],
                                                      }),
                                                      e.jsx('button', {
                                                        onClick: () => {
                                                          const M = m.email || '';
                                                          M &&
                                                            (s({
                                                              linkedAccountId: m.uid,
                                                              linkedAccountEmail: M,
                                                              isAccountLinked: !0,
                                                              updatedAt: new Date().toISOString(),
                                                            }),
                                                            j(!1),
                                                            S([]),
                                                            C(''),
                                                            p(''));
                                                        },
                                                        className:
                                                          'px-3 py-1 text-sm bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded ml-3 flex-shrink-0',
                                                        children: 'Collega',
                                                      }),
                                                    ],
                                                  },
                                                  m.uid
                                                )
                                              ),
                                            }),
                                    }),
                                  ],
                                })
                              : e.jsxs('div', {
                                  className: 'flex items-center gap-2',
                                  children: [
                                    e.jsx('input', {
                                      type: 'email',
                                      value: f,
                                      onChange: (m) => p(m.target.value),
                                      placeholder: 'email@esempio.com',
                                      className: `${l.input} text-sm`,
                                    }),
                                    e.jsx('button', {
                                      onClick: E,
                                      className:
                                        'px-3 py-1 text-sm bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded',
                                      children: 'Collega',
                                    }),
                                    e.jsx('button', {
                                      onClick: () => {
                                        (j(!1), p(''));
                                      },
                                      className:
                                        'px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded',
                                      children: 'Annulla',
                                    }),
                                  ],
                                }),
                        })
                      : e.jsxs('div', {
                          className: 'flex items-center gap-2 justify-end',
                          children: [
                            e.jsx('button', {
                              onClick: v,
                              className: `${l.btnSecondary} px-4 py-2 text-sm`,
                              disabled: n,
                              children: n ? 'Carico…' : '🔎 Cerca account',
                            }),
                            e.jsx('button', {
                              onClick: () => j(!0),
                              className: `${l.btnSecondary} px-4 py-2 text-sm`,
                              children: '🔗 Collega via email',
                            }),
                          ],
                        }),
                  }),
              ],
            }),
          }),
        ],
      }),
      e.jsx('div', {
        className: 'border-b border-gray-200 dark:border-gray-700',
        children: e.jsx('nav', {
          className: 'flex space-x-8 overflow-x-auto',
          children: P.map((m) =>
            e.jsxs(
              'button',
              {
                onClick: () => u(m.id),
                className: `py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${i === m.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`,
                children: [
                  e.jsx('span', { className: 'hidden sm:inline', children: m.label }),
                  e.jsx('span', { className: 'sm:hidden text-lg', children: m.icon }),
                ],
              },
              m.id
            )
          ),
        }),
      }),
      e.jsxs('div', {
        className: 'min-h-[400px]',
        children: [
          i === 'overview' &&
            e.jsxs('div', {
              className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
              children: [
                e.jsxs('div', {
                  className: `${l.cardBg} ${l.border} rounded-xl p-4`,
                  children: [
                    e.jsx('h3', {
                      className: `font-semibold ${l.text} mb-4 flex items-center gap-2`,
                      children: '📋 Dati Anagrafici',
                    }),
                    e.jsxs('div', {
                      className: 'space-y-3 text-sm',
                      children: [
                        e.jsxs('div', {
                          className: 'flex justify-between',
                          children: [
                            e.jsx('span', { className: l.subtext, children: 'Nome completo:' }),
                            e.jsx('span', {
                              className: l.text,
                              children:
                                a.firstName && a.lastName
                                  ? `${a.firstName} ${a.lastName}`
                                  : a.name || 'N/A',
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'flex justify-between',
                          children: [
                            e.jsx('span', { className: l.subtext, children: 'Codice fiscale:' }),
                            e.jsx('span', { className: l.text, children: a.fiscalCode || 'N/A' }),
                          ],
                        }),
                        a.address &&
                          e.jsxs('div', {
                            className: 'flex justify-between',
                            children: [
                              e.jsx('span', { className: l.subtext, children: 'Indirizzo:' }),
                              e.jsx('span', {
                                className: `${l.text} text-right`,
                                children:
                                  [
                                    a.address.street,
                                    a.address.city,
                                    a.address.province,
                                    a.address.postalCode,
                                  ]
                                    .filter(Boolean)
                                    .join(', ') || 'N/A',
                              }),
                            ],
                          }),
                        e.jsxs('div', {
                          className: 'flex justify-between',
                          children: [
                            e.jsx('span', { className: l.subtext, children: 'Registrato il:' }),
                            e.jsx('span', { className: l.text, children: A(a.createdAt) }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'flex justify-between',
                          children: [
                            e.jsx('span', {
                              className: l.subtext,
                              children: 'Ultimo aggiornamento:',
                            }),
                            e.jsx('span', { className: l.text, children: A(a.updatedAt) }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: `${l.cardBg} ${l.border} rounded-xl p-4`,
                  children: [
                    e.jsx('h3', {
                      className: `font-semibold ${l.text} mb-4 flex items-center gap-2`,
                      children: '🏃 Dati Sportivi',
                    }),
                    e.jsxs('div', {
                      className: 'space-y-3 text-sm',
                      children: [
                        e.jsxs('div', {
                          className: 'flex justify-between',
                          children: [
                            e.jsx('span', { className: l.subtext, children: 'Rating base:' }),
                            e.jsx('span', { className: l.text, children: a.baseRating || z }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'flex justify-between',
                          children: [
                            e.jsx('span', { className: l.subtext, children: 'Rating corrente:' }),
                            e.jsx('span', {
                              className: 'text-blue-600 dark:text-blue-400 font-semibold',
                              children: Number(a.rating || z).toFixed(2),
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'flex justify-between',
                          children: [
                            e.jsx('span', { className: l.subtext, children: 'Stato:' }),
                            e.jsx('span', {
                              className: a.isActive
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400',
                              children: a.isActive ? 'Attivo' : 'Inattivo',
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'flex justify-between',
                          children: [
                            e.jsx('span', { className: l.subtext, children: 'Partite giocate:' }),
                            e.jsx('span', {
                              className: l.text,
                              children: a.matchHistory?.length || 0,
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'flex justify-between',
                          children: [
                            e.jsx('span', { className: l.subtext, children: 'Ultima attività:' }),
                            e.jsx('span', { className: l.text, children: A(a.lastActivity) }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: `${l.cardBg} ${l.border} rounded-xl p-4 lg:col-span-2`,
                  children: [
                    e.jsx('h3', {
                      className: `font-semibold ${l.text} mb-4 flex items-center gap-2`,
                      children: '🏷️ Tag e Informazioni Rapide',
                    }),
                    e.jsxs('div', {
                      className: 'space-y-4',
                      children: [
                        e.jsxs('div', {
                          children: [
                            e.jsx('span', {
                              className: `text-sm ${l.subtext} block mb-2`,
                              children: 'Tag:',
                            }),
                            e.jsx('div', {
                              className: 'flex flex-wrap gap-2',
                              children:
                                a.tags && a.tags.length > 0
                                  ? a.tags.map((m, M) =>
                                      e.jsx(
                                        'span',
                                        {
                                          className:
                                            'px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full',
                                          children: m,
                                        },
                                        M
                                      )
                                    )
                                  : e.jsx('span', {
                                      className: `text-sm ${l.subtext}`,
                                      children: 'Nessun tag assegnato',
                                    }),
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          children: [
                            e.jsx('span', {
                              className: `text-sm ${l.subtext} block mb-2`,
                              children: 'Preferenze comunicazione:',
                            }),
                            e.jsxs('div', {
                              className: 'flex flex-wrap gap-4 text-sm',
                              children: [
                                e.jsxs('span', {
                                  className: `flex items-center gap-1 ${a.communicationPreferences?.email ? 'text-green-600 dark:text-green-400' : l.subtext}`,
                                  children: [
                                    '📧 Email: ',
                                    a.communicationPreferences?.email ? 'Sì' : 'No',
                                  ],
                                }),
                                e.jsxs('span', {
                                  className: `flex items-center gap-1 ${a.communicationPreferences?.sms ? 'text-green-600 dark:text-green-400' : l.subtext}`,
                                  children: [
                                    '📱 SMS: ',
                                    a.communicationPreferences?.sms ? 'Sì' : 'No',
                                  ],
                                }),
                                e.jsxs('span', {
                                  className: `flex items-center gap-1 ${a.communicationPreferences?.whatsapp ? 'text-green-600 dark:text-green-400' : l.subtext}`,
                                  children: [
                                    '📞 WhatsApp: ',
                                    a.communicationPreferences?.whatsapp ? 'Sì' : 'No',
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          i === 'notes' && e.jsx(ae, { player: a, onUpdate: s, T: l }),
          i === 'wallet' && e.jsx(le, { player: a, onUpdate: s, T: l }),
          i === 'bookings' && e.jsx(ne, { player: a, T: l }),
          i === 'communications' && e.jsx(ie, { player: a, onUpdate: s, T: l }),
        ],
      }),
    ],
  });
}
function ce({ players: a, T: s, onBulkOperation: r, onRefreshData: l }) {
  const [i, u] = N.useState({
      format: 'csv',
      includePersonalData: !0,
      includeSportsData: !0,
      includeWalletData: !0,
      includeBookingHistory: !1,
      includeNotes: !1,
      dateRange: 'all',
    }),
    [d, j] = N.useState({ type: '', category: '', discount: 0, message: '', selectedPlayers: [] }),
    [f, p] = N.useState(!1),
    [g, C] = N.useState(!1),
    [k, S] = N.useState(!1),
    t = (() => {
      const x = new Date(),
        h = x.getMonth(),
        v = x.getFullYear(),
        D = a.filter(($) => $.category === 'member').length,
        I = a.reduce(($, P) => $ + (P.wallet?.balance || 0), 0),
        E = a.filter(($) => {
          const P = new Date($.createdAt || x);
          return P.getMonth() === h && P.getFullYear() === v;
        }).length,
        R = a.length > 0 ? I / a.length : 0,
        y = a.reduce(($, P) => (($[P.category] = ($[P.category] || 0) + 1), $), {}),
        A = a.reduce(
          ($, P) => (
            (P.sports || []).forEach((m) => {
              $[m] = ($[m] || 0) + 1;
            }),
            $
          ),
          {}
        );
      return {
        totalPlayers: a.length,
        activeMembers: D,
        newPlayersThisMonth: E,
        totalWalletBalance: I,
        avgWalletBalance: R,
        categoryDistribution: y,
        sportsDistribution: A,
      };
    })(),
    o = () => {
      const x = [];
      (i.includePersonalData &&
        x.push('Nome', 'Cognome', 'Email', 'Telefono', 'Data Nascita', 'Categoria'),
        i.includeSportsData &&
          x.push('Sport', 'Livello Padel', 'Livello Tennis', 'Posizione Preferita'),
        i.includeWalletData && x.push('Saldo Wallet', 'Totale Ricariche', 'Ultima Ricarica'));
      let h =
        x.join(',') +
        `
`;
      return (
        a.forEach((v) => {
          const D = [];
          (i.includePersonalData &&
            D.push(
              `"${v.firstName || ''}"`,
              `"${v.lastName || ''}"`,
              `"${v.email || ''}"`,
              `"${v.phone || ''}"`,
              `"${v.dateOfBirth || ''}"`,
              `"${v.category || ''}"`
            ),
            i.includeSportsData &&
              D.push(
                `"${(v.sports || []).join(', ')}"`,
                `"${v.ratings?.padel || ''}"`,
                `"${v.ratings?.tennis || ''}"`,
                `"${v.preferredPosition || ''}"`
              ),
            i.includeWalletData &&
              D.push(
                `"${v.wallet?.balance || 0}"`,
                `"${v.wallet?.totalTopups || 0}"`,
                `"${v.wallet?.lastTopupDate || ''}"`
              ),
            (h +=
              D.join(',') +
              `
`));
        }),
        h
      );
    },
    b = () => {
      const x = o(),
        h = new Blob([x], { type: 'text/csv;charset=utf-8;' }),
        v = document.createElement('a'),
        D = URL.createObjectURL(h);
      (v.setAttribute('href', D),
        v.setAttribute('download', `giocatori_${new Date().toISOString().split('T')[0]}.csv`),
        (v.style.visibility = 'hidden'),
        document.body.appendChild(v),
        v.click(),
        document.body.removeChild(v),
        p(!1));
    },
    c = () => {
      (console.log('Esecuzione bulk action:', d),
        r && r(d),
        j({ type: '', category: '', discount: 0, message: '', selectedPlayers: [] }),
        C(!1),
        alert(`Operazione bulk "${d.type}" eseguita su ${d.selectedPlayers.length} giocatori!`));
    };
  return e.jsxs('div', {
    className: 'space-y-6',
    children: [
      e.jsxs('div', {
        className: 'flex flex-col lg:flex-row gap-4',
        children: [
          e.jsx('button', {
            onClick: () => p(!0),
            className: `${s.btnPrimary} flex items-center gap-2 px-6 py-3`,
            children: '📊 Esporta Dati',
          }),
          e.jsx('button', {
            onClick: () => C(!0),
            className: `${s.btnSecondary} flex items-center gap-2 px-6 py-3`,
            children: '🔄 Operazioni Bulk',
          }),
          e.jsxs('button', {
            onClick: () => S(!k),
            className: `${s.btnSecondary} flex items-center gap-2 px-6 py-3`,
            children: ['📈 Analytics', k ? ' (Nascondi)' : ' (Mostra)'],
          }),
          e.jsx('button', {
            onClick: l,
            className: `${s.btnSecondary} flex items-center gap-2 px-6 py-3`,
            children: '🔄 Aggiorna Dati',
          }),
        ],
      }),
      k &&
        e.jsxs('div', {
          className: `${s.cardBg} ${s.border} rounded-xl p-6`,
          children: [
            e.jsx('h3', {
              className: `text-lg font-bold ${s.text} mb-6 flex items-center gap-2`,
              children: '📈 Analytics CRM',
            }),
            e.jsxs('div', {
              className: 'grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6',
              children: [
                e.jsxs('div', {
                  className: 'text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl',
                  children: [
                    e.jsx('div', {
                      className: 'text-3xl font-bold text-blue-600 dark:text-blue-400',
                      children: t.totalPlayers,
                    }),
                    e.jsx('div', {
                      className: 'text-sm text-blue-700 dark:text-blue-300',
                      children: 'Giocatori Totali',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl',
                  children: [
                    e.jsx('div', {
                      className: 'text-3xl font-bold text-green-600 dark:text-green-400',
                      children: t.activeMembers,
                    }),
                    e.jsx('div', {
                      className: 'text-sm text-green-700 dark:text-green-300',
                      children: 'Membri Attivi',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl',
                  children: [
                    e.jsx('div', {
                      className: 'text-3xl font-bold text-purple-600 dark:text-purple-400',
                      children: t.newPlayersThisMonth,
                    }),
                    e.jsx('div', {
                      className: 'text-sm text-purple-700 dark:text-purple-300',
                      children: 'Nuovi questo Mese',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl',
                  children: [
                    e.jsxs('div', {
                      className: 'text-3xl font-bold text-orange-600 dark:text-orange-400',
                      children: ['€', t.totalWalletBalance.toFixed(0)],
                    }),
                    e.jsx('div', {
                      className: 'text-sm text-orange-700 dark:text-orange-300',
                      children: 'Totale Wallet',
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsx('h4', {
                      className: `font-semibold ${s.text} mb-3`,
                      children: 'Distribuzione per Categoria',
                    }),
                    e.jsx('div', {
                      className: 'space-y-2',
                      children: Object.entries(t.categoryDistribution).map(([x, h]) =>
                        e.jsxs(
                          'div',
                          {
                            className:
                              'flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800',
                            children: [
                              e.jsxs('span', {
                                className: `capitalize ${s.text}`,
                                children: [
                                  x === 'member' && '👑 Membri',
                                  x === 'non_member' && '👤 Non Membri',
                                  x === 'guest' && '🏃 Ospiti',
                                  x === 'vip' && '⭐ VIP',
                                ],
                              }),
                              e.jsxs('span', {
                                className: `font-medium ${s.text}`,
                                children: [h, ' (', ((h / t.totalPlayers) * 100).toFixed(1), '%)'],
                              }),
                            ],
                          },
                          x
                        )
                      ),
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('h4', {
                      className: `font-semibold ${s.text} mb-3`,
                      children: 'Sport più Popolari',
                    }),
                    e.jsx('div', {
                      className: 'space-y-2',
                      children: Object.entries(t.sportsDistribution)
                        .sort(([, x], [, h]) => h - x)
                        .slice(0, 5)
                        .map(([x, h]) =>
                          e.jsxs(
                            'div',
                            {
                              className:
                                'flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800',
                              children: [
                                e.jsxs('span', {
                                  className: `capitalize ${s.text}`,
                                  children: [
                                    x === 'padel' && '🎾 Padel',
                                    x === 'tennis' && '🎾 Tennis',
                                    x === 'calcetto' && '⚽ Calcetto',
                                    x === 'beach_volley' && '🏐 Beach Volley',
                                    x || '❓ Altro',
                                  ],
                                }),
                                e.jsxs('span', {
                                  className: `font-medium ${s.text}`,
                                  children: [h, ' giocatori'],
                                }),
                              ],
                            },
                            x
                          )
                        ),
                    }),
                  ],
                }),
              ],
            }),
            e.jsx('div', {
              className:
                'mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl',
              children: e.jsxs('div', {
                className: 'text-center',
                children: [
                  e.jsxs('div', {
                    className: 'text-2xl font-bold text-purple-600 dark:text-purple-400',
                    children: ['€', t.avgWalletBalance.toFixed(2)],
                  }),
                  e.jsx('div', {
                    className: 'text-sm text-purple-700 dark:text-purple-300',
                    children: 'Saldo Wallet Medio per Giocatore',
                  }),
                ],
              }),
            }),
          ],
        }),
      e.jsxs('div', {
        className: 'grid grid-cols-1 lg:grid-cols-3 gap-4',
        children: [
          e.jsx('div', {
            className: `${s.cardBg} ${s.border} rounded-xl p-4`,
            children: e.jsxs('div', {
              className: 'text-center',
              children: [
                e.jsx('div', { className: 'text-4xl mb-2', children: '📋' }),
                e.jsx('h4', {
                  className: `font-semibold ${s.text} mb-2`,
                  children: 'Esporta Lista',
                }),
                e.jsx('p', {
                  className: `text-sm ${s.subtext} mb-4`,
                  children: 'Scarica i dati dei giocatori in formato CSV o Excel',
                }),
                e.jsx('button', {
                  onClick: () => p(!0),
                  className: `${s.btnPrimary} w-full`,
                  children: 'Esporta Ora',
                }),
              ],
            }),
          }),
          e.jsx('div', {
            className: `${s.cardBg} ${s.border} rounded-xl p-4`,
            children: e.jsxs('div', {
              className: 'text-center',
              children: [
                e.jsx('div', { className: 'text-4xl mb-2', children: '✉️' }),
                e.jsx('h4', {
                  className: `font-semibold ${s.text} mb-2`,
                  children: 'Messaggio di Massa',
                }),
                e.jsx('p', {
                  className: `text-sm ${s.subtext} mb-4`,
                  children: 'Invia comunicazioni a più giocatori contemporaneamente',
                }),
                e.jsx('button', {
                  onClick: () => {
                    (j((x) => ({ ...x, type: 'message' })), C(!0));
                  },
                  className: `${s.btnSecondary} w-full`,
                  children: 'Invia Messaggio',
                }),
              ],
            }),
          }),
          e.jsx('div', {
            className: `${s.cardBg} ${s.border} rounded-xl p-4`,
            children: e.jsxs('div', {
              className: 'text-center',
              children: [
                e.jsx('div', { className: 'text-4xl mb-2', children: '🏷️' }),
                e.jsx('h4', {
                  className: `font-semibold ${s.text} mb-2`,
                  children: 'Gestione Categorie',
                }),
                e.jsx('p', {
                  className: `text-sm ${s.subtext} mb-4`,
                  children: 'Modifica le categorie di più giocatori insieme',
                }),
                e.jsx('button', {
                  onClick: () => {
                    (j((x) => ({ ...x, type: 'category' })), C(!0));
                  },
                  className: `${s.btnSecondary} w-full`,
                  children: 'Modifica Categorie',
                }),
              ],
            }),
          }),
        ],
      }),
      f &&
        e.jsx('div', {
          className:
            'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
          children: e.jsxs('div', {
            className: `${s.modalBg} rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden`,
            children: [
              e.jsx('div', {
                className: 'p-6 border-b border-gray-200 dark:border-gray-700',
                children: e.jsxs('div', {
                  className: 'flex items-center justify-between',
                  children: [
                    e.jsx('h3', {
                      className: `text-xl font-bold ${s.text}`,
                      children: '📊 Esporta Dati Giocatori',
                    }),
                    e.jsx('button', {
                      onClick: () => p(!1),
                      className: `${s.btnSecondary} px-4 py-2`,
                      children: '✖️',
                    }),
                  ],
                }),
              }),
              e.jsx('div', {
                className: 'p-6 overflow-y-auto',
                children: e.jsxs('div', {
                  className: 'space-y-6',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block text-sm font-medium ${s.text} mb-3`,
                          children: 'Formato Esportazione',
                        }),
                        e.jsxs('div', {
                          className: 'grid grid-cols-2 gap-4',
                          children: [
                            e.jsxs('label', {
                              className: 'flex items-center space-x-2',
                              children: [
                                e.jsx('input', {
                                  type: 'radio',
                                  name: 'format',
                                  value: 'csv',
                                  checked: i.format === 'csv',
                                  onChange: (x) => u((h) => ({ ...h, format: x.target.value })),
                                  className: 'text-blue-600',
                                }),
                                e.jsx('span', { className: s.text, children: '📋 CSV' }),
                              ],
                            }),
                            e.jsxs('label', {
                              className: 'flex items-center space-x-2',
                              children: [
                                e.jsx('input', {
                                  type: 'radio',
                                  name: 'format',
                                  value: 'excel',
                                  checked: i.format === 'excel',
                                  onChange: (x) => u((h) => ({ ...h, format: x.target.value })),
                                  className: 'text-blue-600',
                                }),
                                e.jsx('span', { className: s.text, children: '📊 Excel' }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block text-sm font-medium ${s.text} mb-3`,
                          children: 'Dati da Includere',
                        }),
                        e.jsxs('div', {
                          className: 'space-y-3',
                          children: [
                            e.jsxs('label', {
                              className: 'flex items-center space-x-3',
                              children: [
                                e.jsx('input', {
                                  type: 'checkbox',
                                  checked: i.includePersonalData,
                                  onChange: (x) =>
                                    u((h) => ({ ...h, includePersonalData: x.target.checked })),
                                  className: 'text-blue-600',
                                }),
                                e.jsx('span', {
                                  className: s.text,
                                  children: '👤 Dati Personali (Nome, Email, Telefono)',
                                }),
                              ],
                            }),
                            e.jsxs('label', {
                              className: 'flex items-center space-x-3',
                              children: [
                                e.jsx('input', {
                                  type: 'checkbox',
                                  checked: i.includeSportsData,
                                  onChange: (x) =>
                                    u((h) => ({ ...h, includeSportsData: x.target.checked })),
                                  className: 'text-blue-600',
                                }),
                                e.jsx('span', {
                                  className: s.text,
                                  children: '🎾 Dati Sportivi (Sport, Livelli, Posizioni)',
                                }),
                              ],
                            }),
                            e.jsxs('label', {
                              className: 'flex items-center space-x-3',
                              children: [
                                e.jsx('input', {
                                  type: 'checkbox',
                                  checked: i.includeWalletData,
                                  onChange: (x) =>
                                    u((h) => ({ ...h, includeWalletData: x.target.checked })),
                                  className: 'text-blue-600',
                                }),
                                e.jsx('span', {
                                  className: s.text,
                                  children: '💰 Dati Wallet (Saldo, Ricariche)',
                                }),
                              ],
                            }),
                            e.jsxs('label', {
                              className: 'flex items-center space-x-3',
                              children: [
                                e.jsx('input', {
                                  type: 'checkbox',
                                  checked: i.includeBookingHistory,
                                  onChange: (x) =>
                                    u((h) => ({ ...h, includeBookingHistory: x.target.checked })),
                                  className: 'text-blue-600',
                                }),
                                e.jsx('span', {
                                  className: s.text,
                                  children: '📅 Storico Prenotazioni',
                                }),
                              ],
                            }),
                            e.jsxs('label', {
                              className: 'flex items-center space-x-3',
                              children: [
                                e.jsx('input', {
                                  type: 'checkbox',
                                  checked: i.includeNotes,
                                  onChange: (x) =>
                                    u((h) => ({ ...h, includeNotes: x.target.checked })),
                                  className: 'text-blue-600',
                                }),
                                e.jsx('span', {
                                  className: s.text,
                                  children: '📝 Note e Commenti',
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'flex gap-3',
                      children: [
                        e.jsxs('button', {
                          onClick: b,
                          className: `${s.btnPrimary} flex-1`,
                          children: ['📊 Scarica (', i.format.toUpperCase(), ')'],
                        }),
                        e.jsx('button', {
                          onClick: () => p(!1),
                          className: `${s.btnSecondary} px-6`,
                          children: 'Annulla',
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            ],
          }),
        }),
      g &&
        e.jsx('div', {
          className:
            'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
          children: e.jsxs('div', {
            className: `${s.modalBg} rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden`,
            children: [
              e.jsx('div', {
                className: 'p-6 border-b border-gray-200 dark:border-gray-700',
                children: e.jsxs('div', {
                  className: 'flex items-center justify-between',
                  children: [
                    e.jsx('h3', {
                      className: `text-xl font-bold ${s.text}`,
                      children: '🔄 Operazioni Bulk',
                    }),
                    e.jsx('button', {
                      onClick: () => C(!1),
                      className: `${s.btnSecondary} px-4 py-2`,
                      children: '✖️',
                    }),
                  ],
                }),
              }),
              e.jsx('div', {
                className: 'p-6 overflow-y-auto',
                children: e.jsxs('div', {
                  className: 'space-y-6',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block text-sm font-medium ${s.text} mb-3`,
                          children: 'Tipo Operazione',
                        }),
                        e.jsxs('select', {
                          value: d.type,
                          onChange: (x) => j((h) => ({ ...h, type: x.target.value })),
                          className: `${s.input} w-full`,
                          children: [
                            e.jsx('option', { value: '', children: 'Seleziona operazione' }),
                            e.jsx('option', {
                              value: 'category',
                              children: '🏷️ Modifica Categoria',
                            }),
                            e.jsx('option', {
                              value: 'message',
                              children: '✉️ Messaggio di Massa',
                            }),
                            e.jsx('option', { value: 'discount', children: '💰 Applica Sconto' }),
                            e.jsx('option', {
                              value: 'wallet_credit',
                              children: '💳 Ricarica Wallet',
                            }),
                          ],
                        }),
                      ],
                    }),
                    d.type === 'category' &&
                      e.jsxs('div', {
                        children: [
                          e.jsx('label', {
                            className: `block text-sm font-medium ${s.text} mb-2`,
                            children: 'Nuova Categoria',
                          }),
                          e.jsxs('select', {
                            value: d.category,
                            onChange: (x) => j((h) => ({ ...h, category: x.target.value })),
                            className: `${s.input} w-full`,
                            children: [
                              e.jsx('option', { value: '', children: 'Seleziona categoria' }),
                              e.jsx('option', { value: 'member', children: '👑 Membro' }),
                              e.jsx('option', { value: 'non_member', children: '👤 Non Membro' }),
                              e.jsx('option', { value: 'guest', children: '🏃 Ospite' }),
                              e.jsx('option', { value: 'vip', children: '⭐ VIP' }),
                            ],
                          }),
                        ],
                      }),
                    d.type === 'message' &&
                      e.jsxs('div', {
                        children: [
                          e.jsx('label', {
                            className: `block text-sm font-medium ${s.text} mb-2`,
                            children: 'Messaggio',
                          }),
                          e.jsx('textarea', {
                            value: d.message,
                            onChange: (x) => j((h) => ({ ...h, message: x.target.value })),
                            placeholder:
                              'Scrivi il messaggio da inviare a tutti i giocatori selezionati...',
                            rows: 4,
                            className: `${s.input} w-full`,
                          }),
                        ],
                      }),
                    (d.type === 'discount' || d.type === 'wallet_credit') &&
                      e.jsxs('div', {
                        children: [
                          e.jsxs('label', {
                            className: `block text-sm font-medium ${s.text} mb-2`,
                            children: [
                              d.type === 'discount' ? 'Percentuale Sconto' : 'Importo Ricarica',
                              ' ',
                              '(€)',
                            ],
                          }),
                          e.jsx('input', {
                            type: 'number',
                            value: d.discount,
                            onChange: (x) =>
                              j((h) => ({ ...h, discount: parseFloat(x.target.value) || 0 })),
                            placeholder: d.type === 'discount' ? '10' : '20.00',
                            className: `${s.input} w-full`,
                          }),
                        ],
                      }),
                    e.jsxs('div', {
                      className: `p-4 ${s.border} rounded-xl`,
                      children: [
                        e.jsxs('div', {
                          className: `text-sm font-medium ${s.text} mb-2`,
                          children: ['Giocatori Selezionati: ', t.totalPlayers],
                        }),
                        e.jsx('div', {
                          className: `text-xs ${s.subtext}`,
                          children:
                            "Tutti i giocatori verranno inclusi nell'operazione bulk. In futuro aggiungeremo la selezione manuale.",
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'flex gap-3',
                      children: [
                        e.jsx('button', {
                          onClick: c,
                          disabled:
                            !d.type ||
                            (d.type === 'category' && !d.category) ||
                            (d.type === 'message' && !d.message.trim()),
                          className: `${s.btnPrimary} flex-1 disabled:opacity-50 disabled:cursor-not-allowed`,
                          children: '🚀 Esegui Operazione',
                        }),
                        e.jsx('button', {
                          onClick: () => C(!1),
                          className: `${s.btnSecondary} px-6`,
                          children: 'Annulla',
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            ],
          }),
        }),
    ],
  });
}
function de({ state: a, setState: s, onOpenStats: r, playersById: l, T: i }) {
  const { user: u } = K(),
    [d, j] = N.useState(null),
    [f, p] = N.useState(!1),
    [g, C] = N.useState(null),
    [k, S] = N.useState('all'),
    [n, t] = N.useState(''),
    [o, b] = N.useState(!1),
    c = Array.isArray(a?.players) ? a.players : [],
    x = N.useMemo(() => (d && c.find((y) => y.id === d)) || null, [c, d]),
    h = N.useMemo(() => {
      let y = [...c];
      if ((k !== 'all' && (y = y.filter((A) => A.category === k)), n.trim())) {
        const A = n.toLowerCase();
        y = y.filter(
          ($) =>
            $.name?.toLowerCase().includes(A) ||
            $.email?.toLowerCase().includes(A) ||
            $.phone?.includes(A) ||
            $.firstName?.toLowerCase().includes(A) ||
            $.lastName?.toLowerCase().includes(A)
        );
      }
      return y.sort(T);
    }, [c, k, n]),
    v = N.useMemo(() => {
      const y = c.length,
        A = c.filter((m) => m.category === w.MEMBER).length,
        $ = c.filter((m) => m.isActive !== !1).length,
        P = c.filter((m) => m.isAccountLinked).length;
      return { total: y, members: A, active: $, withAccount: P };
    }, [c]),
    D = (y) => {
      const A = {
        ...G(),
        ...y,
        id: _(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (s(($) => {
        const P = Array.isArray($?.players) ? $.players : [];
        return { ...($ || { players: [], matches: [] }), players: [...P, A] };
      }),
        p(!1));
    },
    I = (y, A) => {
      s(($) => {
        const P = Array.isArray($?.players) ? $.players : [];
        return {
          ...($ || { players: [], matches: [] }),
          players: P.map((m) =>
            m.id === y ? { ...m, ...A, updatedAt: new Date().toISOString() } : m
          ),
        };
      });
    },
    E = (y) => {
      confirm(
        'Sei sicuro di voler eliminare questo giocatore? Questa azione non può essere annullata.'
      ) &&
        (s((A) => {
          const $ = Array.isArray(A?.players) ? A.players : [];
          return { ...(A || { players: [], matches: [] }), players: $.filter((P) => P.id !== y) };
        }),
        j(null));
    },
    R = () => {
      if (!u) return;
      const y = {
        firstName: u.firstName || u.displayName?.split(' ')[0] || '',
        lastName: u.lastName || u.displayName?.split(' ')[1] || '',
        name: u.displayName || `${u.firstName} ${u.lastName}`.trim(),
        email: u.email || '',
        linkedAccountId: u.uid,
        linkedAccountEmail: u.email,
        isAccountLinked: !0,
        category: w.MEMBER,
      };
      D(y);
    };
  return e.jsxs(e.Fragment, {
    children: [
      e.jsxs(X, {
        title: 'CRM Giocatori',
        T: i,
        children: [
          e.jsx('div', {
            className: `${i.cardBg} ${i.border} rounded-xl p-4 xl:p-3 mb-6`,
            children: e.jsxs('div', {
              className: 'flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4',
              children: [
                e.jsxs('div', {
                  className: 'grid grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-3 flex-1',
                  children: [
                    e.jsxs('div', {
                      className: 'text-center',
                      children: [
                        e.jsx('div', {
                          className:
                            'text-2xl xl:text-xl font-bold text-blue-600 dark:text-blue-400',
                          children: v.total,
                        }),
                        e.jsx('div', { className: `text-xs ${i.subtext}`, children: 'Totale' }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'text-center',
                      children: [
                        e.jsx('div', {
                          className:
                            'text-2xl xl:text-xl font-bold text-green-600 dark:text-green-400',
                          children: v.members,
                        }),
                        e.jsx('div', { className: `text-xs ${i.subtext}`, children: 'Membri' }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'text-center',
                      children: [
                        e.jsx('div', {
                          className:
                            'text-2xl xl:text-xl font-bold text-orange-600 dark:text-orange-400',
                          children: v.active,
                        }),
                        e.jsx('div', { className: `text-xs ${i.subtext}`, children: 'Attivi' }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'text-center',
                      children: [
                        e.jsx('div', {
                          className:
                            'text-2xl xl:text-xl font-bold text-purple-600 dark:text-purple-400',
                          children: v.withAccount,
                        }),
                        e.jsx('div', {
                          className: `text-xs ${i.subtext}`,
                          children: 'Con Account',
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'flex gap-2 flex-wrap',
                  children: [
                    e.jsx('button', {
                      onClick: () => p(!0),
                      className: `${i.btnPrimary} px-4 py-2 text-sm`,
                      children: '➕ Nuovo Giocatore',
                    }),
                    e.jsx('button', {
                      onClick: R,
                      disabled: !u,
                      className: `${i.btnSecondary} px-4 py-2 text-sm`,
                      children: '👤 Crea da Account',
                    }),
                    e.jsx('button', {
                      onClick: () => b(!0),
                      className: `${i.btnSecondary} px-4 py-2 text-sm`,
                      children: '🛠️ Strumenti',
                    }),
                  ],
                }),
              ],
            }),
          }),
          e.jsxs('div', {
            className: 'flex flex-col lg:flex-row lg:items-center gap-4 mb-6',
            children: [
              e.jsx('div', {
                className: 'flex-1',
                children: e.jsx('input', {
                  type: 'text',
                  placeholder: 'Cerca per nome, email, telefono...',
                  value: n,
                  onChange: (y) => t(y.target.value),
                  className: `${i.input} w-full`,
                }),
              }),
              e.jsx('div', {
                className: 'flex gap-2 shrink-0',
                children: e.jsxs('select', {
                  value: k,
                  onChange: (y) => S(y.target.value),
                  className: `${i.input} min-w-[150px]`,
                  children: [
                    e.jsx('option', { value: 'all', children: 'Tutte le categorie' }),
                    e.jsx('option', { value: w.MEMBER, children: 'Membri' }),
                    e.jsx('option', { value: w.NON_MEMBER, children: 'Non Membri' }),
                    e.jsx('option', { value: w.GUEST, children: 'Ospiti' }),
                    e.jsx('option', { value: w.VIP, children: 'VIP' }),
                  ],
                }),
              }),
            ],
          }),
          e.jsx('div', {
            className: 'space-y-4',
            children:
              h.length === 0
                ? e.jsxs('div', {
                    className: `text-center py-12 ${i.cardBg} ${i.border} rounded-xl`,
                    children: [
                      e.jsx('div', { className: 'text-6xl mb-4', children: '👥' }),
                      e.jsx('h3', {
                        className: `text-xl font-bold mb-2 ${i.text}`,
                        children: 'Nessun giocatore trovato',
                      }),
                      e.jsx('p', {
                        className: `${i.subtext} mb-4`,
                        children:
                          n || k !== 'all'
                            ? 'Prova a modificare i filtri di ricerca'
                            : 'Inizia aggiungendo il primo giocatore al tuo CRM',
                      }),
                      e.jsx('button', {
                        onClick: () => p(!0),
                        className: `${i.btnPrimary} px-6 py-3`,
                        children: '➕ Aggiungi Primo Giocatore',
                      }),
                    ],
                  })
                : e.jsx('div', {
                    className:
                      'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 [@media(min-width:2200px)]:grid-cols-5 items-stretch',
                    children: h.map((y) =>
                      e.jsx(
                        te,
                        {
                          player: y,
                          playersById: l,
                          onEdit: () => {
                            (C(y), p(!0));
                          },
                          onDelete: () => E(y.id),
                          onView: () => j(y.id),
                          onStats: () => r?.(y.id),
                          T: i,
                        },
                        y.id
                      )
                    ),
                  }),
          }),
        ],
      }),
      x &&
        e.jsx(U, {
          isOpen: !0,
          onClose: () => j(null),
          title: `${x.name || 'Giocatore'} - Dettagli`,
          size: 'large',
          children: e.jsx(re, {
            player: x,
            onUpdate: (y) => I(x.id, y),
            onClose: () => j(null),
            T: i,
          }),
        }),
      f &&
        e.jsx(U, {
          isOpen: !0,
          onClose: () => {
            (p(!1), C(null));
          },
          title: g ? 'Modifica Giocatore' : 'Nuovo Giocatore',
          size: 'large',
          children: e.jsx(se, {
            player: g,
            onSave: g
              ? (y) => {
                  (I(g.id, y), p(!1), C(null));
                }
              : D,
            onCancel: () => {
              (p(!1), C(null));
            },
            T: i,
          }),
        }),
      o &&
        e.jsx(U, {
          isOpen: !0,
          onClose: () => b(!1),
          title: 'Strumenti CRM',
          size: 'large',
          children: e.jsx(ce, {
            players: c,
            onClose: () => b(!1),
            onBulkOperation: (y) => {
              console.log('Bulk operation:', y);
            },
            onRefreshData: () => {
              console.log('Refreshing data...');
            },
            T: i,
          }),
        }),
    ],
  });
}
function Ne() {
  const a = Z(),
    { state: s, setState: r, playersById: l } = H(),
    { clubMode: i } = Y(),
    u = J.useMemo(() => Q(), []),
    d = (j) => {
      a(`/stats?player=${j}`);
    };
  return i
    ? e.jsx(de, { T: u, state: s, setState: r, onOpenStats: d, playersById: l })
    : e.jsxs('div', {
        className: `text-center py-12 ${u.cardBg} ${u.border} rounded-xl m-4`,
        children: [
          e.jsx('div', { className: 'text-6xl mb-4', children: '🔒' }),
          e.jsx('h3', {
            className: `text-xl font-bold mb-2 ${u.text}`,
            children: 'Modalità Club Richiesta',
          }),
          e.jsx('p', {
            className: `${u.subtext} mb-4`,
            children:
              'Per accedere al CRM giocatori, devi prima sbloccare la modalità club nella sezione Extra.',
          }),
          e.jsx('button', {
            onClick: () => a('/extra'),
            className: `${u.btnPrimary} px-6 py-3`,
            children: 'Vai a Extra per sbloccare',
          }),
        ],
      });
}
export { Ne as default };
