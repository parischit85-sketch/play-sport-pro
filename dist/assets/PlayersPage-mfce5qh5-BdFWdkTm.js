import {
  D as E,
  j as e,
  i as G,
  k as U,
  u as _,
  f as W,
  t as V,
} from './index-mfce5qh5-Bjue6Tcf.js';
import { r as v, c as Y, b as H } from './router-mfce5qh5-SMEpEpls.js';
import { S as q } from './Section-mfce5qh5-BVq7CZw3.js';
import { M as L } from './Modal-mfce5qh5-Dv_rJ4XO.js';
import { b as K } from './names-mfce5qh5-BW9lV2zG.js';
import { loadBookingsForPlayer as Q } from './cloud-bookings-mfce5qh5-C7X43DHA.js';
import './vendor-mfce5qh5-D3F3s8fL.js';
import './firebase-mfce5qh5-jcIpuiEY.js';
const w = { MEMBER: 'member', NON_MEMBER: 'non-member', GUEST: 'guest', VIP: 'vip' },
  B = {
    GENERAL: 'general',
    BOOKING: 'booking',
    PAYMENT: 'payment',
    DISCIPLINARY: 'disciplinary',
    MEDICAL: 'medical',
  },
  F = () => ({
    id: '',
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: null,
    fiscalCode: '',
    address: { street: '', city: '', province: '', postalCode: '', country: 'Italia' },
    baseRating: 1e3,
    rating: 1e3,
    category: w.NON_MEMBER,
    linkedAccountId: null,
    linkedAccountEmail: null,
    isAccountLinked: !1,
    wallet: { balance: 0, currency: 'EUR', lastUpdate: null, transactions: [] },
    subscriptions: [],
    tags: [],
    customFields: {},
    notes: [],
    communications: [],
    bookingHistory: [],
    matchHistory: [],
    createdAt: null,
    updatedAt: null,
    lastActivity: null,
    isActive: !0,
    communicationPreferences: { email: !0, sms: !1, whatsapp: !1, notifications: !0 },
  }),
  z = () => ({
    id: '',
    amount: 0,
    type: 'credit',
    description: '',
    reference: '',
    createdAt: null,
    createdBy: null,
  }),
  O = () => ({
    id: '',
    type: B.GENERAL,
    title: '',
    content: '',
    isPrivate: !1,
    createdAt: null,
    createdBy: null,
    tags: [],
  });
function Z({ player: a, playersById: t, onEdit: n, onDelete: l, onView: r, onStats: m, T: d }) {
  const g = t?.[a.id]?.rating ?? a.rating ?? E,
    j = (s) => {
      switch (s) {
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
    h = (s) => {
      switch (s) {
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
    p = (s) => {
      if (!s) return 'Mai';
      const x = Date.now() - new Date(s).getTime(),
        f = Math.floor(x / (1e3 * 60 * 60 * 24));
      return f === 0
        ? 'Oggi'
        : f === 1
          ? 'Ieri'
          : f < 7
            ? `${f} giorni fa`
            : f < 30
              ? `${Math.floor(f / 7)} settimane fa`
              : `${Math.floor(f / 30)} mesi fa`;
    },
    k = a.subscriptions?.[a.subscriptions?.length - 1],
    $ = a.bookingHistory?.length || 0,
    C = a.notes?.length || 0,
    c = a.tags || [];
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
                              onClick: r,
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
                      className: `px-2 py-1 rounded-full text-xs font-medium ${j(a.category)}`,
                      children: h(a.category),
                    }),
                    k
                      ? e.jsx('span', {
                          className: 'text-[11px] text-green-700 dark:text-green-300',
                          title: `Scadenza: ${k.endDate ? new Date(k.endDate).toLocaleDateString('it-IT') : 'N/D'}`,
                          children: k.type || 'Abbonamento',
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
                      children: Number(g).toFixed(0),
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
                    e.jsx('div', { className: 'text-sm font-medium', children: p(a.lastActivity) }),
                    e.jsx('div', {
                      className: `text-xs ${d.subtext}`,
                      children: 'Ultima attività',
                    }),
                    e.jsxs('div', { className: 'text-xs mt-1', children: ['📅 ', $, ' prenot.'] }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'min-w-[220px] flex-1',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-2 text-xs mb-1',
                      children: [
                        e.jsxs('span', {
                          className: `${C > 0 ? 'text-orange-600 dark:text-orange-400' : d.subtext}`,
                          children: ['📝 ', C, ' note'],
                        }),
                        e.jsxs('span', {
                          className: `${c.length > 0 ? 'text-blue-600 dark:text-blue-400' : d.subtext}`,
                          children: ['🏷️ ', c.length, ' tag'],
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'flex gap-1 flex-wrap',
                      children: [
                        c.slice(0, 3).map((s, x) =>
                          e.jsx(
                            'span',
                            {
                              className:
                                'px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-[11px] break-words max-w-[10rem]',
                              children: s,
                            },
                            x
                          )
                        ),
                        c.length > 3 &&
                          e.jsxs('span', {
                            className: `text-[11px] ${d.subtext}`,
                            children: ['+', c.length - 3],
                          }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'flex items-center gap-2 ml-auto',
                  children: [
                    e.jsx('button', {
                      onClick: r,
                      className: `${d.btnSecondary} px-3 py-1 text-sm`,
                      title: 'Visualizza dettagli',
                      children: '👁️',
                    }),
                    e.jsx('button', {
                      onClick: n,
                      className: `${d.btnSecondary} px-3 py-1 text-sm`,
                      title: 'Modifica',
                      children: '✏️',
                    }),
                    e.jsx('button', {
                      onClick: m,
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
                  children: ['📝 ', C, ' note • 🏷️ ', c.length, ' tag'],
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
                          onClick: r,
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
                        className: `px-2 py-1 rounded-full text-xs font-medium ${j(a.category)}`,
                        children: h(a.category),
                      }),
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'text-right',
                  children: [
                    e.jsx('div', {
                      className: 'text-xl font-bold text-blue-600 dark:text-blue-400',
                      children: Number(g).toFixed(0),
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
                    e.jsx('div', { className: 'text-sm font-medium', children: p(a.lastActivity) }),
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
                    e.jsxs('div', { children: ['📅 ', $] }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'text-left',
                  children: [
                    e.jsx('div', { className: `${d.subtext}`, children: 'Note / Tag' }),
                    e.jsxs('div', { children: ['📝 ', C, ' / 🏷️ ', c.length] }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'flex gap-2',
              children: [
                e.jsx('button', {
                  onClick: r,
                  className: `${d.btnSecondary} flex-1 py-2 text-sm`,
                  children: '👁️ Dettagli',
                }),
                e.jsx('button', {
                  onClick: m,
                  className: `${d.btnSecondary} flex-1 py-2 text-sm`,
                  children: '📊 Stats',
                }),
                e.jsx('button', {
                  onClick: n,
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
function J({ player: a, onSave: t, onCancel: n, T: l }) {
  const [r, m] = v.useState(F()),
    [d, g] = v.useState({}),
    [j, h] = v.useState('basic');
  v.useEffect(() => {
    a && m({ ...F(), ...a });
  }, [a]);
  const p = (c, s) => {
      (m((x) => {
        if (c.includes('.')) {
          const [f, i] = c.split('.');
          return { ...x, [f]: { ...x[f], [i]: s } };
        }
        return { ...x, [c]: s };
      }),
        d[c] && g((x) => ({ ...x, [c]: void 0 })));
    },
    k = () => {
      const c = {};
      return (
        r.firstName?.trim() || (c.firstName = 'Nome richiesto'),
        r.lastName?.trim() || (c.lastName = 'Cognome richiesto'),
        r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email) && (c.email = 'Email non valida'),
        r.phone &&
          !/^[\d\s\+\-\(\)]+$/.test(r.phone) &&
          (c.phone = 'Numero di telefono non valido'),
        g(c),
        Object.keys(c).length === 0
      );
    },
    $ = (c) => {
      if ((c.preventDefault(), !k())) return;
      const s = {
        ...r,
        name: `${r.firstName} ${r.lastName}`.trim(),
        baseRating: Number(r.baseRating) || E,
        rating: Number(r.rating) || r.baseRating || E,
      };
      t(s);
    },
    C = [
      { id: 'basic', label: '📝 Dati Base', icon: '📝' },
      { id: 'contact', label: '📞 Contatti', icon: '📞' },
      { id: 'sports', label: '🏃 Sport', icon: '🏃' },
      { id: 'wallet', label: '💰 Wallet', icon: '💰' },
      { id: 'preferences', label: '⚙️ Preferenze', icon: '⚙️' },
    ];
  return e.jsxs('form', {
    onSubmit: $,
    className: 'space-y-6',
    children: [
      e.jsx('div', {
        className: 'border-b border-gray-200 dark:border-gray-700',
        children: e.jsx('nav', {
          className: 'flex space-x-8 overflow-x-auto',
          children: C.map((c) =>
            e.jsxs(
              'button',
              {
                type: 'button',
                onClick: () => h(c.id),
                className: `py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${j === c.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`,
                children: [
                  e.jsx('span', { className: 'hidden sm:inline', children: c.label }),
                  e.jsx('span', { className: 'sm:hidden text-lg', children: c.icon }),
                ],
              },
              c.id
            )
          ),
        }),
      }),
      e.jsxs('div', {
        className: 'min-h-[400px]',
        children: [
          j === 'basic' &&
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
                          value: r.firstName || '',
                          onChange: (c) => p('firstName', c.target.value),
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
                          value: r.lastName || '',
                          onChange: (c) => p('lastName', c.target.value),
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
                      value: r.dateOfBirth || '',
                      onChange: (c) => p('dateOfBirth', c.target.value),
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
                      value: r.fiscalCode || '',
                      onChange: (c) => p('fiscalCode', c.target.value.toUpperCase()),
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
                      value: r.category || w.NON_MEMBER,
                      onChange: (c) => p('category', c.target.value),
                      className: `${l.input} w-full`,
                      children: [
                        e.jsx('option', { value: w.NON_MEMBER, children: 'Non Membro' }),
                        e.jsx('option', { value: w.MEMBER, children: 'Membro' }),
                        e.jsx('option', { value: w.GUEST, children: 'Ospite' }),
                        e.jsx('option', { value: w.VIP, children: 'VIP' }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          j === 'contact' &&
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
                      value: r.email || '',
                      onChange: (c) => p('email', c.target.value),
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
                      value: r.phone || '',
                      onChange: (c) => p('phone', c.target.value),
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
                      value: r.address?.street || '',
                      onChange: (c) => p('address.street', c.target.value),
                      className: `${l.input} w-full`,
                      placeholder: 'Via, numero civico',
                    }),
                    e.jsxs('div', {
                      className: 'grid grid-cols-2 gap-4',
                      children: [
                        e.jsx('input', {
                          type: 'text',
                          value: r.address?.city || '',
                          onChange: (c) => p('address.city', c.target.value),
                          className: `${l.input} w-full`,
                          placeholder: 'Città',
                        }),
                        e.jsx('input', {
                          type: 'text',
                          value: r.address?.province || '',
                          onChange: (c) => p('address.province', c.target.value),
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
                          value: r.address?.postalCode || '',
                          onChange: (c) => p('address.postalCode', c.target.value),
                          className: `${l.input} w-full`,
                          placeholder: 'CAP',
                        }),
                        e.jsx('input', {
                          type: 'text',
                          value: r.address?.country || 'Italia',
                          onChange: (c) => p('address.country', c.target.value),
                          className: `${l.input} w-full`,
                          placeholder: 'Paese',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          j === 'sports' &&
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
                          value: r.baseRating || E,
                          onChange: (c) => p('baseRating', Number(c.target.value)),
                          className: `${l.input} w-full`,
                          min: '0',
                          max: '3000',
                          step: '10',
                        }),
                        e.jsxs('p', {
                          className: `text-xs ${l.subtext} mt-1`,
                          children: ['Rating iniziale del giocatore (default: ', E, ')'],
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
                          value: r.rating || r.baseRating || E,
                          onChange: (c) => p('rating', Number(c.target.value)),
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
                          checked: r.isActive !== !1,
                          onChange: (c) => p('isActive', c.target.checked),
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
          j === 'wallet' &&
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
                      value: r.wallet?.balance || 0,
                      onChange: (c) => p('wallet.balance', Number(c.target.value)),
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
                            e.jsx('span', { children: r.wallet?.transactions?.length || 0 }),
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
                              children: r.wallet?.lastUpdate
                                ? new Date(r.wallet.lastUpdate).toLocaleDateString()
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
          j === 'preferences' &&
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
                              checked: r.communicationPreferences?.email !== !1,
                              onChange: (c) =>
                                p('communicationPreferences.email', c.target.checked),
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
                              checked: r.communicationPreferences?.sms === !0,
                              onChange: (c) => p('communicationPreferences.sms', c.target.checked),
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
                              checked: r.communicationPreferences?.whatsapp === !0,
                              onChange: (c) =>
                                p('communicationPreferences.whatsapp', c.target.checked),
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
                              checked: r.communicationPreferences?.notifications !== !1,
                              onChange: (c) =>
                                p('communicationPreferences.notifications', c.target.checked),
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
                      value: r.tags?.join(', ') || '',
                      onChange: (c) =>
                        p(
                          'tags',
                          c.target.value
                            .split(',')
                            .map((s) => s.trim())
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
            onClick: n,
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
function X({ player: a, onUpdate: t, T: n }) {
  const [l, r] = v.useState(!1),
    [m, d] = v.useState(null),
    [g, j] = v.useState(O()),
    h = a.notes || [],
    p = () => {
      if (!g.title.trim() || !g.content.trim()) return;
      const s = {
          ...g,
          id: m?.id || G(),
          createdAt: m?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'current-user',
        },
        x = m ? h.map((f) => (f.id === m.id ? s : f)) : [...h, s];
      (t({ notes: x, updatedAt: new Date().toISOString() }), j(O()), r(!1), d(null));
    },
    k = (s) => {
      (j(s), d(s), r(!0));
    },
    $ = (s) => {
      if (!confirm('Sei sicuro di voler eliminare questa nota?')) return;
      const x = h.filter((f) => f.id !== s);
      t({ notes: x, updatedAt: new Date().toISOString() });
    },
    C = (s) => {
      switch (s) {
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
    c = (s) => {
      switch (s) {
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
            className: `text-lg font-semibold ${n.text}`,
            children: ['Note Giocatore (', h.length, ')'],
          }),
          e.jsx('button', {
            onClick: () => {
              (j(O()), d(null), r(!0));
            },
            className: `${n.btnPrimary} px-4 py-2`,
            children: '➕ Nuova Nota',
          }),
        ],
      }),
      l &&
        e.jsxs('div', {
          className: `${n.cardBg} ${n.border} rounded-xl p-4`,
          children: [
            e.jsx('h4', {
              className: `font-medium ${n.text} mb-4`,
              children: m ? 'Modifica Nota' : 'Nuova Nota',
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
                          className: `block text-sm font-medium ${n.text} mb-1`,
                          children: 'Titolo',
                        }),
                        e.jsx('input', {
                          type: 'text',
                          value: g.title,
                          onChange: (s) => j((x) => ({ ...x, title: s.target.value })),
                          className: `${n.input} w-full`,
                          placeholder: 'Titolo della nota',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block text-sm font-medium ${n.text} mb-1`,
                          children: 'Tipo',
                        }),
                        e.jsx('select', {
                          value: g.type,
                          onChange: (s) => j((x) => ({ ...x, type: s.target.value })),
                          className: `${n.input} w-full`,
                          children: Object.values(B).map((s) =>
                            e.jsx('option', { value: s, children: C(s) }, s)
                          ),
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm font-medium ${n.text} mb-1`,
                      children: 'Contenuto',
                    }),
                    e.jsx('textarea', {
                      value: g.content,
                      onChange: (s) => j((x) => ({ ...x, content: s.target.value })),
                      className: `${n.input} w-full`,
                      rows: 4,
                      placeholder: 'Descrizione dettagliata...',
                    }),
                  ],
                }),
                e.jsx('div', {
                  children: e.jsxs('label', {
                    className: `flex items-center gap-2 ${n.text}`,
                    children: [
                      e.jsx('input', {
                        type: 'checkbox',
                        checked: g.isPrivate,
                        onChange: (s) => j((x) => ({ ...x, isPrivate: s.target.checked })),
                        className: 'rounded',
                      }),
                      'Nota privata (visibile solo agli amministratori)',
                    ],
                  }),
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm font-medium ${n.text} mb-1`,
                      children: 'Tag (separati da virgola)',
                    }),
                    e.jsx('input', {
                      type: 'text',
                      value: g.tags?.join(', ') || '',
                      onChange: (s) =>
                        j((x) => ({
                          ...x,
                          tags: s.target.value
                            .split(',')
                            .map((f) => f.trim())
                            .filter(Boolean),
                        })),
                      className: `${n.input} w-full`,
                      placeholder: 'urgente, follow-up, importante',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'flex justify-end gap-3',
                  children: [
                    e.jsx('button', {
                      onClick: () => {
                        (r(!1), d(null), j(O()));
                      },
                      className: `${n.btnSecondary} px-4 py-2`,
                      children: 'Annulla',
                    }),
                    e.jsxs('button', {
                      onClick: p,
                      className: `${n.btnPrimary} px-4 py-2`,
                      children: [m ? 'Aggiorna' : 'Salva', ' Nota'],
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
          h.length === 0
            ? e.jsxs('div', {
                className: `text-center py-8 ${n.cardBg} ${n.border} rounded-xl`,
                children: [
                  e.jsx('div', { className: 'text-4xl mb-2', children: '📝' }),
                  e.jsx('div', {
                    className: `${n.subtext} mb-4`,
                    children: 'Nessuna nota presente',
                  }),
                  e.jsx('button', {
                    onClick: () => {
                      (j(O()), d(null), r(!0));
                    },
                    className: `${n.btnPrimary} px-6 py-3`,
                    children: 'Aggiungi Prima Nota',
                  }),
                ],
              })
            : h
                .sort((s, x) => new Date(x.createdAt) - new Date(s.createdAt))
                .map((s) =>
                  e.jsxs(
                    'div',
                    {
                      className: `${n.cardBg} ${n.border} rounded-xl p-4`,
                      children: [
                        e.jsxs('div', {
                          className: 'flex justify-between items-start mb-3',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center gap-3',
                              children: [
                                e.jsx('h4', {
                                  className: `font-semibold ${n.text}`,
                                  children: s.title,
                                }),
                                e.jsx('span', {
                                  className: `px-2 py-1 rounded-full text-xs font-medium ${c(s.type)}`,
                                  children: C(s.type),
                                }),
                                s.isPrivate &&
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
                                  onClick: () => k(s),
                                  className: 'text-blue-500 hover:text-blue-700 text-sm',
                                  title: 'Modifica',
                                  children: '✏️',
                                }),
                                e.jsx('button', {
                                  onClick: () => $(s.id),
                                  className: 'text-red-500 hover:text-red-700 text-sm',
                                  title: 'Elimina',
                                  children: '🗑️',
                                }),
                              ],
                            }),
                          ],
                        }),
                        e.jsx('div', {
                          className: `${n.text} mb-3 whitespace-pre-wrap`,
                          children: s.content,
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
                                    new Date(s.createdAt).toLocaleDateString('it-IT'),
                                  ],
                                }),
                                e.jsxs('span', { children: ['👤 ', s.createdBy || 'Sistema'] }),
                              ],
                            }),
                            s.tags &&
                              s.tags.length > 0 &&
                              e.jsx('div', {
                                className: 'flex flex-wrap gap-1',
                                children: s.tags.map((x, f) =>
                                  e.jsxs(
                                    'span',
                                    {
                                      className:
                                        'px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full',
                                      children: ['#', x],
                                    },
                                    f
                                  )
                                ),
                              }),
                          ],
                        }),
                      ],
                    },
                    s.id
                  )
                ),
      }),
    ],
  });
}
function T({ player: a, onUpdate: t, T: n }) {
  const [l, r] = v.useState(!1),
    [m, d] = v.useState(z()),
    { addNotification: g } = U(),
    j = a.wallet || { balance: 0, currency: 'EUR', transactions: [] },
    h = j.transactions || [],
    p = () => {
      if (!m.description || !m.description.trim()) {
        g({
          type: 'warning',
          title: 'Descrizione mancante',
          message: 'Aggiungi una breve descrizione del movimento prima di continuare.',
        });
        return;
      }
      if (!m.amount) return;
      const s = { ...m, id: G(), createdAt: new Date().toISOString(), createdBy: 'current-user' },
        x = m.type === 'credit' ? j.balance + Math.abs(m.amount) : j.balance - Math.abs(m.amount),
        f = {
          ...j,
          balance: Math.max(0, x),
          lastUpdate: new Date().toISOString(),
          transactions: [s, ...h],
        };
      (t({ wallet: f, updatedAt: new Date().toISOString() }), d(z()), r(!1));
    },
    k = (s) => {
      switch (s) {
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
    $ = (s) => {
      switch (s) {
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
    C = (s) => {
      switch (s) {
        case 'credit':
          return 'text-green-600 dark:text-green-400';
        case 'debit':
          return 'text-red-600 dark:text-red-400';
        case 'refund':
          return 'text-blue-600 dark:text-blue-400';
        case 'bonus':
          return 'text-purple-600 dark:text-purple-400';
        default:
          return n.text;
      }
    },
    c = (s, x) =>
      `${x === 'credit' || x === 'refund' || x === 'bonus' ? '+' : '-'}€${Math.abs(s).toFixed(2)}`;
  return e.jsxs('div', {
    className: 'space-y-6',
    children: [
      e.jsxs('div', {
        className: `${n.cardBg} ${n.border} rounded-xl p-6 text-center`,
        children: [
          e.jsxs('div', {
            className: 'text-4xl font-bold text-green-600 dark:text-green-400 mb-2',
            children: ['€', j.balance.toFixed(2)],
          }),
          e.jsxs('div', {
            className: `text-sm ${n.subtext} mb-4`,
            children: ['Saldo Disponibile • ', j.currency],
          }),
          e.jsxs('div', {
            className: 'flex justify-center gap-3',
            children: [
              e.jsx('button', {
                onClick: () => {
                  (d({ ...z(), type: 'credit' }), r(!0));
                },
                className: `${n.btnPrimary} px-4 py-2`,
                children: '💰 Ricarica',
              }),
              e.jsx('button', {
                onClick: () => {
                  (d({ ...z(), type: 'debit' }), r(!0));
                },
                className: `${n.btnSecondary} px-4 py-2`,
                children: '💸 Addebito',
              }),
            ],
          }),
        ],
      }),
      l &&
        e.jsxs('div', {
          className: `${n.cardBg} ${n.border} rounded-xl p-4`,
          children: [
            e.jsx('h4', { className: `font-medium ${n.text} mb-4`, children: 'Nuova Transazione' }),
            e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  className: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block text-sm font-medium ${n.text} mb-1`,
                          children: 'Tipo',
                        }),
                        e.jsxs('select', {
                          value: m.type,
                          onChange: (s) => d((x) => ({ ...x, type: s.target.value })),
                          className: `${n.input} w-full`,
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
                          className: `block text-sm font-medium ${n.text} mb-1`,
                          children: 'Importo (€)',
                        }),
                        e.jsx('input', {
                          type: 'number',
                          value: m.amount || '',
                          onChange: (s) => d((x) => ({ ...x, amount: Number(s.target.value) })),
                          className: `${n.input} w-full`,
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
                      className: `block text-sm font-medium ${n.text} mb-1`,
                      children: 'Descrizione',
                    }),
                    e.jsx('input', {
                      type: 'text',
                      value: m.description,
                      onChange: (s) => d((x) => ({ ...x, description: s.target.value })),
                      className: `${n.input} w-full`,
                      placeholder: 'Descrizione della transazione...',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm font-medium ${n.text} mb-1`,
                      children: 'Riferimento (opzionale)',
                    }),
                    e.jsx('input', {
                      type: 'text',
                      value: m.reference,
                      onChange: (s) => d((x) => ({ ...x, reference: s.target.value })),
                      className: `${n.input} w-full`,
                      placeholder: 'ID prenotazione, fattura, etc...',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'flex justify-end gap-3',
                  children: [
                    e.jsx('button', {
                      onClick: () => {
                        (r(!1), d(z()));
                      },
                      className: `${n.btnSecondary} px-4 py-2`,
                      children: 'Annulla',
                    }),
                    e.jsx('button', {
                      onClick: p,
                      className: `${n.btnPrimary} px-4 py-2`,
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
            className: `${n.cardBg} ${n.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-blue-600 dark:text-blue-400',
                children: h.length,
              }),
              e.jsx('div', { className: `text-xs ${n.subtext}`, children: 'Transazioni' }),
            ],
          }),
          e.jsxs('div', {
            className: `${n.cardBg} ${n.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-green-600 dark:text-green-400',
                children: h.filter(
                  (s) => s.type === 'credit' || s.type === 'refund' || s.type === 'bonus'
                ).length,
              }),
              e.jsx('div', { className: `text-xs ${n.subtext}`, children: 'Entrate' }),
            ],
          }),
          e.jsxs('div', {
            className: `${n.cardBg} ${n.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-red-600 dark:text-red-400',
                children: h.filter((s) => s.type === 'debit').length,
              }),
              e.jsx('div', { className: `text-xs ${n.subtext}`, children: 'Uscite' }),
            ],
          }),
          e.jsxs('div', {
            className: `${n.cardBg} ${n.border} rounded-xl p-4 text-center`,
            children: [
              e.jsxs('div', {
                className: `text-2xl font-bold ${n.text}`,
                children: [
                  '€',
                  h
                    .reduce(
                      (s, x) =>
                        x.type === 'credit' || x.type === 'refund' || x.type === 'bonus'
                          ? s + x.amount
                          : s - x.amount,
                      0
                    )
                    .toFixed(2),
                ],
              }),
              e.jsx('div', { className: `text-xs ${n.subtext}`, children: 'Totale Movimenti' }),
            ],
          }),
        ],
      }),
      e.jsxs('div', {
        children: [
          e.jsxs('h4', {
            className: `font-semibold ${n.text} mb-4`,
            children: ['Storico Transazioni (', h.length, ')'],
          }),
          h.length === 0
            ? e.jsxs('div', {
                className: `text-center py-8 ${n.cardBg} ${n.border} rounded-xl`,
                children: [
                  e.jsx('div', { className: 'text-4xl mb-2', children: '💳' }),
                  e.jsx('div', {
                    className: `${n.subtext} mb-4`,
                    children: 'Nessuna transazione presente',
                  }),
                  e.jsx('button', {
                    onClick: () => {
                      (d({ ...z(), type: 'credit' }), r(!0));
                    },
                    className: `${n.btnPrimary} px-6 py-3`,
                    children: 'Aggiungi Prima Transazione',
                  }),
                ],
              })
            : e.jsx('div', {
                className: 'space-y-3',
                children: h
                  .sort((s, x) => new Date(x.createdAt) - new Date(s.createdAt))
                  .map((s) =>
                    e.jsx(
                      'div',
                      {
                        className: `${n.cardBg} ${n.border} rounded-xl p-4`,
                        children: e.jsxs('div', {
                          className: 'flex justify-between items-start',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center gap-3 flex-1',
                              children: [
                                e.jsx('div', { className: 'text-2xl', children: k(s.type) }),
                                e.jsxs('div', {
                                  className: 'min-w-0 flex-1',
                                  children: [
                                    e.jsxs('div', {
                                      className: 'flex items-center gap-2 mb-1',
                                      children: [
                                        e.jsx('span', {
                                          className: `font-medium ${n.text}`,
                                          children: s.description,
                                        }),
                                        e.jsx('span', {
                                          className: `px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 ${n.subtext}`,
                                          children: $(s.type),
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
                                            new Date(s.createdAt).toLocaleDateString('it-IT'),
                                          ],
                                        }),
                                        s.reference &&
                                          e.jsxs('span', { children: ['🔗 ', s.reference] }),
                                        e.jsxs('span', {
                                          children: ['👤 ', s.createdBy || 'Sistema'],
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
                                className: `text-lg font-bold ${C(s.type)}`,
                                children: c(s.amount, s.type),
                              }),
                            }),
                          ],
                        }),
                      },
                      s.id
                    )
                  ),
              }),
        ],
      }),
    ],
  });
}
function ee({ player: a, T: t }) {
  const [n, l] = v.useState({ type: 'email', subject: '', message: '', priority: 'normal' }),
    [r, m] = v.useState(''),
    [d, g] = v.useState(!1),
    j = [
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
    h = [
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
    p = () => {
      (console.log('Invio messaggio:', n),
        l({ type: 'email', subject: '', message: '', priority: 'normal' }),
        alert(`Messaggio ${n.type} inviato a ${a.firstName}!`));
    },
    k = (s) => {
      (l((x) => ({ ...x, type: s.type, subject: s.subject || '', message: s.content })), g(!1));
    },
    $ = (s, x) => {
      if (x === 'failed') return '❌';
      if (x === 'pending') return '⏳';
      switch (s) {
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
    C = (s) => {
      switch (s) {
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
    c = {
      totalSent: h.length,
      emails: h.filter((s) => s.type === 'email').length,
      sms: h.filter((s) => s.type === 'sms').length,
      push: h.filter((s) => s.type === 'push').length,
      opened: h.filter((s) => s.openDate || s.clickDate).length,
    };
  return e.jsxs('div', {
    className: 'space-y-6',
    children: [
      e.jsxs('div', {
        className: 'grid grid-cols-2 lg:grid-cols-5 gap-4',
        children: [
          e.jsxs('div', {
            className: `${t.cardBg} ${t.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-blue-600 dark:text-blue-400',
                children: c.totalSent,
              }),
              e.jsx('div', { className: `text-xs ${t.subtext}`, children: 'Totali' }),
            ],
          }),
          e.jsxs('div', {
            className: `${t.cardBg} ${t.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-purple-600 dark:text-purple-400',
                children: c.emails,
              }),
              e.jsx('div', { className: `text-xs ${t.subtext}`, children: '📧 Email' }),
            ],
          }),
          e.jsxs('div', {
            className: `${t.cardBg} ${t.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-green-600 dark:text-green-400',
                children: c.sms,
              }),
              e.jsx('div', { className: `text-xs ${t.subtext}`, children: '💬 SMS' }),
            ],
          }),
          e.jsxs('div', {
            className: `${t.cardBg} ${t.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-orange-600 dark:text-orange-400',
                children: c.push,
              }),
              e.jsx('div', { className: `text-xs ${t.subtext}`, children: '🔔 Push' }),
            ],
          }),
          e.jsxs('div', {
            className: `${t.cardBg} ${t.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-teal-600 dark:text-teal-400',
                children: c.opened,
              }),
              e.jsx('div', { className: `text-xs ${t.subtext}`, children: '👁️ Aperti' }),
            ],
          }),
        ],
      }),
      e.jsxs('div', {
        className: `${t.cardBg} ${t.border} rounded-xl p-6`,
        children: [
          e.jsx('h4', {
            className: `font-semibold ${t.text} mb-4 flex items-center gap-2`,
            children: '✉️ Nuova Comunicazione',
          }),
          e.jsxs('div', {
            className: 'grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4',
            children: [
              e.jsxs('div', {
                children: [
                  e.jsx('label', {
                    className: `block text-sm font-medium ${t.text} mb-2`,
                    children: 'Tipo di messaggio',
                  }),
                  e.jsxs('select', {
                    value: n.type,
                    onChange: (s) => l((x) => ({ ...x, type: s.target.value })),
                    className: `${t.input} w-full`,
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
                    className: `block text-sm font-medium ${t.text} mb-2`,
                    children: 'Priorità',
                  }),
                  e.jsxs('select', {
                    value: n.priority,
                    onChange: (s) => l((x) => ({ ...x, priority: s.target.value })),
                    className: `${t.input} w-full`,
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
          n.type === 'email' &&
            e.jsxs('div', {
              className: 'mb-4',
              children: [
                e.jsx('label', {
                  className: `block text-sm font-medium ${t.text} mb-2`,
                  children: 'Oggetto',
                }),
                e.jsx('input', {
                  type: 'text',
                  value: n.subject,
                  onChange: (s) => l((x) => ({ ...x, subject: s.target.value })),
                  placeholder: "Inserisci l'oggetto dell'email",
                  className: `${t.input} w-full`,
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
                    className: `block text-sm font-medium ${t.text}`,
                    children: 'Messaggio',
                  }),
                  e.jsx('button', {
                    onClick: () => g(!0),
                    className: `${t.btnSecondary} text-xs px-3 py-1`,
                    children: '📋 Template',
                  }),
                ],
              }),
              e.jsx('textarea', {
                value: n.message,
                onChange: (s) => l((x) => ({ ...x, message: s.target.value })),
                placeholder: `Scrivi il tuo messaggio ${n.type}...`,
                rows: n.type === 'sms' ? 3 : 6,
                maxLength: n.type === 'sms' ? 160 : void 0,
                className: `${t.input} w-full resize-none`,
              }),
              n.type === 'sms' &&
                e.jsxs('div', {
                  className: `text-right text-xs ${t.subtext} mt-1`,
                  children: [n.message.length, '/160 caratteri'],
                }),
            ],
          }),
          e.jsxs('div', {
            className: `mb-4 p-3 ${t.border} rounded-lg`,
            children: [
              e.jsx('div', {
                className: `text-sm font-medium ${t.text} mb-1`,
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
                        className: `font-medium ${t.text}`,
                        children: [a.firstName, ' ', a.lastName],
                      }),
                      e.jsxs('div', {
                        className: `text-xs ${t.subtext}`,
                        children: [
                          n.type === 'email' && a.email,
                          n.type === 'sms' && a.phone,
                          n.type === 'push' && 'App mobile',
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
                onClick: p,
                disabled: !n.message.trim() || (n.type === 'email' && !n.subject.trim()),
                className: `${t.btnPrimary} flex-1 disabled:opacity-50 disabled:cursor-not-allowed`,
                children: ['🚀 Invia ', n.type.toUpperCase()],
              }),
              e.jsx('button', {
                onClick: () => l({ type: 'email', subject: '', message: '', priority: 'normal' }),
                className: `${t.btnSecondary} px-6`,
                children: '🗑️ Cancella',
              }),
            ],
          }),
        ],
      }),
      e.jsxs('div', {
        children: [
          e.jsxs('h4', {
            className: `font-semibold ${t.text} mb-4`,
            children: ['📋 Storico Comunicazioni (', h.length, ')'],
          }),
          h.length === 0
            ? e.jsxs('div', {
                className: `text-center py-8 ${t.cardBg} ${t.border} rounded-xl`,
                children: [
                  e.jsx('div', { className: 'text-4xl mb-2', children: '📭' }),
                  e.jsx('div', {
                    className: `${t.subtext} mb-4`,
                    children: 'Nessuna comunicazione inviata',
                  }),
                ],
              })
            : e.jsx('div', {
                className: 'space-y-3',
                children: h
                  .sort((s, x) => new Date(x.sentDate) - new Date(s.sentDate))
                  .map((s) =>
                    e.jsx(
                      'div',
                      {
                        className: `${t.cardBg} ${t.border} rounded-xl p-4`,
                        children: e.jsxs('div', {
                          className: 'flex items-start gap-3',
                          children: [
                            e.jsx('div', { className: 'text-2xl', children: $(s.type, s.status) }),
                            e.jsxs('div', {
                              className: 'flex-1 min-w-0',
                              children: [
                                e.jsxs('div', {
                                  className: 'flex items-center gap-2 mb-1',
                                  children: [
                                    e.jsx('span', {
                                      className: `font-medium ${t.text}`,
                                      children: s.subject,
                                    }),
                                    e.jsx('span', {
                                      className: `px-2 py-1 rounded-full text-xs font-medium uppercase ${C(s.status)} bg-gray-100 dark:bg-gray-800`,
                                      children: s.status,
                                    }),
                                  ],
                                }),
                                e.jsxs('div', {
                                  className: `text-sm ${t.subtext}`,
                                  children: [
                                    '📅 Inviato: ',
                                    new Date(s.sentDate).toLocaleDateString('it-IT'),
                                    ' alle ',
                                    new Date(s.sentDate).toLocaleTimeString('it-IT', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }),
                                  ],
                                }),
                                s.openDate &&
                                  e.jsxs('div', {
                                    className: `text-sm ${t.subtext}`,
                                    children: [
                                      '👁️ Aperto: ',
                                      new Date(s.openDate).toLocaleDateString('it-IT'),
                                      ' alle ',
                                      new Date(s.openDate).toLocaleTimeString('it-IT', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      }),
                                    ],
                                  }),
                                s.clickDate &&
                                  e.jsxs('div', {
                                    className: `text-sm ${t.subtext}`,
                                    children: [
                                      '👆 Cliccato: ',
                                      new Date(s.clickDate).toLocaleDateString('it-IT'),
                                      ' alle ',
                                      new Date(s.clickDate).toLocaleTimeString('it-IT', {
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
                                className: `text-xs ${t.subtext} uppercase tracking-wide`,
                                children: s.type,
                              }),
                            }),
                          ],
                        }),
                      },
                      s.id
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
            className: `${t.modalBg} rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden`,
            children: [
              e.jsx('div', {
                className: 'p-6 border-b border-gray-200 dark:border-gray-700',
                children: e.jsxs('div', {
                  className: 'flex items-center justify-between',
                  children: [
                    e.jsx('h3', {
                      className: `text-xl font-bold ${t.text}`,
                      children: '📋 Template Messaggi',
                    }),
                    e.jsx('button', {
                      onClick: () => g(!1),
                      className: `${t.btnSecondary} px-4 py-2`,
                      children: '✖️',
                    }),
                  ],
                }),
              }),
              e.jsx('div', {
                className: 'p-6 overflow-y-auto',
                children: e.jsx('div', {
                  className: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
                  children: j.map((s) =>
                    e.jsxs(
                      'div',
                      {
                        className: `${t.border} rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors`,
                        onClick: () => k(s),
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center gap-3 mb-3',
                            children: [
                              e.jsx('span', {
                                className: 'text-2xl',
                                children: s.type === 'email' ? '📧' : '💬',
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('div', {
                                    className: `font-medium ${t.text}`,
                                    children: s.name,
                                  }),
                                  e.jsx('div', {
                                    className: `text-xs ${t.subtext} uppercase`,
                                    children: s.type,
                                  }),
                                ],
                              }),
                            ],
                          }),
                          s.subject &&
                            e.jsx('div', {
                              className: `text-sm font-medium ${t.text} mb-2`,
                              children: s.subject,
                            }),
                          e.jsx('div', {
                            className: `text-sm ${t.subtext} line-clamp-3`,
                            children: s.content,
                          }),
                        ],
                      },
                      s.id
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
function te({ player: a, T: t }) {
  const [n, l] = v.useState('all'),
    [r, m] = v.useState('all'),
    [d, g] = v.useState(!1),
    [j, h] = v.useState(null),
    [p, k] = v.useState([]);
  v.useEffect(() => {
    let i = !1;
    async function o() {
      (g(!0), h(null));
      try {
        const u = a?.linkedAccountId || null,
          b = a?.linkedAccountEmail || a?.email || null,
          A = a?.name || `${a?.firstName || ''} ${a?.lastName || ''}`.trim(),
          M = await Q({ userId: u, email: b, name: A });
        if (i) return;
        k(M || []);
      } catch (u) {
        if (i) return;
        h(u);
      } finally {
        i || g(!1);
      }
    }
    return (
      o(),
      () => {
        i = !0;
      }
    );
  }, [a?.linkedAccountId, a?.linkedAccountEmail, a?.email, a?.name, a?.firstName, a?.lastName]);
  const $ = v.useMemo(
      () =>
        (p || []).map((i) => {
          const o = i.date,
            u = i.time || '',
            b = u.includes('-') ? u : `${u}`,
            A = i.courtName || i.court || 'Campo',
            M = i.sport || 'Padel',
            I = i.status || 'confirmed',
            R =
              Array.isArray(i.players) && i.players.length > 0
                ? i.players
                : [i.bookedBy || i.userEmail || ''],
            N = typeof i.price == 'number' ? i.price : Number(i.price || 0) || 0,
            S = !!i.paid || i.paymentStatus === 'paid',
            y = i.paymentMethod || null;
          return {
            id: i.id,
            date: o,
            time: b,
            court: A,
            sport: M,
            status: I,
            players: R,
            price: N,
            paid: S,
            paymentMethod: y,
          };
        }),
      [p]
    ),
    C = (i) => {
      const o = (i.time || '').split('-')[0].trim(),
        u = o ? `${i.date}T${o}:00` : `${i.date}T00:00:00`,
        b = new Date(u);
      return isNaN(b.getTime()) ? new Date(i.date) : b;
    },
    c = (i) => {
      switch (i) {
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
    s = (i) => {
      switch (i) {
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
    x = $.filter((i) => {
      const o = new Date(),
        u = C(i);
      if (n !== 'all') {
        if (n === 'completed') {
          if (!(u < o && i.status !== 'cancelled')) return !1;
        } else if (n === 'confirmed') {
          if (i.status !== 'confirmed') return !1;
        } else if (n === 'cancelled') {
          if (i.status !== 'cancelled') return !1;
        } else if (n === 'no_show') {
          if (i.status !== 'no_show') return !1;
        } else if (i.status !== n) return !1;
      }
      if (r !== 'all') {
        const b = new Date(i.date);
        switch (r) {
          case 'week':
            const A = new Date(o.getTime() - 6048e5);
            return b >= A;
          case 'month':
            const M = new Date(o.getTime() - 720 * 60 * 60 * 1e3);
            return b >= M;
          case 'year':
            const I = new Date(o.getTime() - 365 * 24 * 60 * 60 * 1e3);
            return b >= I;
          default:
            return !0;
        }
      }
      return !0;
    }),
    f = {
      total: $.length,
      completed: $.filter((i) => C(i) < new Date() && i.status !== 'cancelled').length,
      upcoming: $.filter((i) => C(i) >= new Date() && i.status !== 'cancelled').length,
      cancelled: $.filter((i) => i.status === 'cancelled').length,
      totalSpent: $.filter((i) => i.paid).reduce((i, o) => i + o.price, 0),
    };
  return e.jsxs('div', {
    className: 'space-y-6',
    children: [
      e.jsxs('div', {
        className: 'grid grid-cols-2 lg:grid-cols-5 gap-4',
        children: [
          e.jsxs('div', {
            className: `${t.cardBg} ${t.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-blue-600 dark:text-blue-400',
                children: f.total,
              }),
              e.jsx('div', { className: `text-xs ${t.subtext}`, children: 'Totale' }),
            ],
          }),
          e.jsxs('div', {
            className: `${t.cardBg} ${t.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-green-600 dark:text-green-400',
                children: f.completed,
              }),
              e.jsx('div', { className: `text-xs ${t.subtext}`, children: 'Completate' }),
            ],
          }),
          e.jsxs('div', {
            className: `${t.cardBg} ${t.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-orange-600 dark:text-orange-400',
                children: f.upcoming,
              }),
              e.jsx('div', { className: `text-xs ${t.subtext}`, children: 'Future' }),
            ],
          }),
          e.jsxs('div', {
            className: `${t.cardBg} ${t.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-red-600 dark:text-red-400',
                children: f.cancelled,
              }),
              e.jsx('div', { className: `text-xs ${t.subtext}`, children: 'Cancellate' }),
            ],
          }),
          e.jsxs('div', {
            className: `${t.cardBg} ${t.border} rounded-xl p-4 text-center`,
            children: [
              e.jsxs('div', {
                className: 'text-2xl font-bold text-purple-600 dark:text-purple-400',
                children: ['€', f.totalSpent.toFixed(2)],
              }),
              e.jsx('div', { className: `text-xs ${t.subtext}`, children: 'Totale Speso' }),
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
                className: `block text-sm font-medium ${t.text} mb-2`,
                children: 'Filtra per stato',
              }),
              e.jsxs('select', {
                value: n,
                onChange: (i) => l(i.target.value),
                className: `${t.input} w-full`,
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
                className: `block text-sm font-medium ${t.text} mb-2`,
                children: 'Filtra per periodo',
              }),
              e.jsxs('select', {
                value: r,
                onChange: (i) => m(i.target.value),
                className: `${t.input} w-full`,
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
            className: `font-semibold ${t.text} mb-4`,
            children: ['Storico Prenotazioni (', x.length, ')'],
          }),
          d
            ? e.jsxs('div', {
                className: `text-center py-8 ${t.cardBg} ${t.border} rounded-xl`,
                children: [
                  e.jsx('div', { className: 'text-4xl mb-2', children: '⏳' }),
                  e.jsx('div', {
                    className: `${t.subtext}`,
                    children: 'Caricamento prenotazioni…',
                  }),
                ],
              })
            : j
              ? e.jsxs('div', {
                  className: `text-center py-8 ${t.cardBg} ${t.border} rounded-xl`,
                  children: [
                    e.jsx('div', { className: 'text-4xl mb-2', children: '⚠️' }),
                    e.jsx('div', {
                      className: `${t.subtext}`,
                      children: 'Errore nel caricamento delle prenotazioni',
                    }),
                  ],
                })
              : x.length === 0
                ? e.jsxs('div', {
                    className: `text-center py-8 ${t.cardBg} ${t.border} rounded-xl`,
                    children: [
                      e.jsx('div', { className: 'text-4xl mb-2', children: '📅' }),
                      e.jsx('div', {
                        className: `${t.subtext} mb-4`,
                        children:
                          n !== 'all' || r !== 'all'
                            ? 'Nessuna prenotazione corrispondente ai filtri'
                            : 'Nessuna prenotazione presente',
                      }),
                      n !== 'all' || r !== 'all'
                        ? e.jsx('button', {
                            onClick: () => {
                              (l('all'), m('all'));
                            },
                            className: `${t.btnSecondary} px-6 py-3`,
                            children: 'Rimuovi Filtri',
                          })
                        : null,
                    ],
                  })
                : e.jsx('div', {
                    className: 'space-y-3',
                    children: x
                      .sort((i, o) => C(o) - C(i))
                      .map((i) =>
                        e.jsxs(
                          'div',
                          {
                            className: `${t.cardBg} ${t.border} rounded-xl p-4`,
                            children: [
                              e.jsxs('div', {
                                className: 'hidden lg:flex items-center gap-4',
                                children: [
                                  e.jsx('div', {
                                    className:
                                      'w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold',
                                    children: new Date(i.date).getDate(),
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex-1 min-w-0',
                                    children: [
                                      e.jsxs('div', {
                                        className: 'flex items-center gap-3 mb-1',
                                        children: [
                                          e.jsxs('span', {
                                            className: `font-medium ${t.text}`,
                                            children: [i.court, ' - ', i.sport],
                                          }),
                                          e.jsx('span', {
                                            className: `px-2 py-1 rounded-full text-xs font-medium ${s(i.status)}`,
                                            children: c(i.status),
                                          }),
                                          i.paid &&
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
                                              new Date(i.date).toLocaleDateString('it-IT'),
                                            ],
                                          }),
                                          e.jsxs('span', { children: ['⏰ ', i.time] }),
                                          e.jsxs('span', {
                                            children: ['👥 ', i.players.join(', ')],
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
                                        children: ['€', i.price.toFixed(2)],
                                      }),
                                      e.jsx('div', {
                                        className: `text-xs ${t.subtext}`,
                                        children: i.paymentMethod ? i.paymentMethod : 'Non pagato',
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
                                            className: `font-medium ${t.text} mb-1`,
                                            children: [i.court, ' - ', i.sport],
                                          }),
                                          e.jsxs('div', {
                                            className: 'text-sm text-gray-500 dark:text-gray-400',
                                            children: [
                                              '📅 ',
                                              new Date(i.date).toLocaleDateString('it-IT'),
                                              ' ⏰ ',
                                              i.time,
                                            ],
                                          }),
                                        ],
                                      }),
                                      e.jsx('div', {
                                        className: 'text-right',
                                        children: e.jsxs('div', {
                                          className:
                                            'text-lg font-bold text-green-600 dark:text-green-400',
                                          children: ['€', i.price.toFixed(2)],
                                        }),
                                      }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex flex-wrap gap-2 mb-3',
                                    children: [
                                      e.jsx('span', {
                                        className: `px-2 py-1 rounded-full text-xs font-medium ${s(i.status)}`,
                                        children: c(i.status),
                                      }),
                                      i.paid &&
                                        e.jsx('span', {
                                          className:
                                            'px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
                                          children: '💰 Pagato',
                                        }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    className: 'text-sm text-gray-500 dark:text-gray-400',
                                    children: ['👥 ', i.players.join(', ')],
                                  }),
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
    ],
  });
}
function se({ player: a, onUpdate: t, onClose: n, T: l }) {
  const [r, m] = v.useState('overview'),
    [d, g] = v.useState(!1),
    [j, h] = v.useState(''),
    p = (i) => {
      switch (i) {
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
    k = (i) => {
      switch (i) {
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
    $ = () => {
      j.trim() &&
        (t({
          linkedAccountEmail: j.trim(),
          isAccountLinked: !0,
          updatedAt: new Date().toISOString(),
        }),
        g(!1),
        h(''));
    },
    C = () => {
      confirm("Sei sicuro di voler scollegare l'account da questo giocatore?") &&
        t({
          linkedAccountId: null,
          linkedAccountEmail: null,
          isAccountLinked: !1,
          updatedAt: new Date().toISOString(),
        });
    },
    c = () => {
      t({ isActive: !a.isActive, updatedAt: new Date().toISOString() });
    },
    s = (i) =>
      i
        ? new Date(i).toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'N/A',
    x = (i) => {
      if (!i) return null;
      const o = new Date(),
        u = new Date(i);
      let b = o.getFullYear() - u.getFullYear();
      const A = o.getMonth() - u.getMonth();
      return ((A < 0 || (A === 0 && o.getDate() < u.getDate())) && b--, b);
    },
    f = [
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
                            className: `px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 ${k(a.category)}`,
                            children: p(a.category),
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
                                    x(a.dateOfBirth) && ` (${x(a.dateOfBirth)} anni)`,
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
                            children: Number(a.rating || E).toFixed(0),
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
                      onClick: c,
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
                              onClick: C,
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
                    className: 'flex items-center gap-2',
                    children: d
                      ? e.jsxs('div', {
                          className: 'flex items-center gap-2',
                          children: [
                            e.jsx('input', {
                              type: 'email',
                              value: j,
                              onChange: (i) => h(i.target.value),
                              placeholder: 'email@esempio.com',
                              className: `${l.input} text-sm`,
                              autoFocus: !0,
                            }),
                            e.jsx('button', {
                              onClick: $,
                              className:
                                'px-3 py-1 text-sm bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded',
                              children: 'Collega',
                            }),
                            e.jsx('button', {
                              onClick: () => {
                                (g(!1), h(''));
                              },
                              className:
                                'px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded',
                              children: 'Annulla',
                            }),
                          ],
                        })
                      : e.jsx('button', {
                          onClick: () => g(!0),
                          className: `${l.btnSecondary} px-4 py-2 text-sm`,
                          children: '🔗 Collega Account',
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
          children: f.map((i) =>
            e.jsxs(
              'button',
              {
                onClick: () => m(i.id),
                className: `py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${r === i.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`,
                children: [
                  e.jsx('span', { className: 'hidden sm:inline', children: i.label }),
                  e.jsx('span', { className: 'sm:hidden text-lg', children: i.icon }),
                ],
              },
              i.id
            )
          ),
        }),
      }),
      e.jsxs('div', {
        className: 'min-h-[400px]',
        children: [
          r === 'overview' &&
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
                            e.jsx('span', { className: l.text, children: s(a.createdAt) }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'flex justify-between',
                          children: [
                            e.jsx('span', {
                              className: l.subtext,
                              children: 'Ultimo aggiornamento:',
                            }),
                            e.jsx('span', { className: l.text, children: s(a.updatedAt) }),
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
                            e.jsx('span', { className: l.text, children: a.baseRating || E }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'flex justify-between',
                          children: [
                            e.jsx('span', { className: l.subtext, children: 'Rating corrente:' }),
                            e.jsx('span', {
                              className: 'text-blue-600 dark:text-blue-400 font-semibold',
                              children: Number(a.rating || E).toFixed(2),
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
                            e.jsx('span', { className: l.text, children: s(a.lastActivity) }),
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
                                  ? a.tags.map((i, o) =>
                                      e.jsx(
                                        'span',
                                        {
                                          className:
                                            'px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full',
                                          children: i,
                                        },
                                        o
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
          r === 'notes' && e.jsx(X, { player: a, onUpdate: t, T: l }),
          r === 'wallet' && e.jsx(T, { player: a, onUpdate: t, T: l }),
          r === 'bookings' && e.jsx(te, { player: a, T: l }),
          r === 'communications' && e.jsx(ee, { player: a, onUpdate: t, T: l }),
        ],
      }),
    ],
  });
}
function ae({ players: a, T: t, onBulkOperation: n, onRefreshData: l }) {
  const [r, m] = v.useState({
      format: 'csv',
      includePersonalData: !0,
      includeSportsData: !0,
      includeWalletData: !0,
      includeBookingHistory: !1,
      includeNotes: !1,
      dateRange: 'all',
    }),
    [d, g] = v.useState({ type: '', category: '', discount: 0, message: '', selectedPlayers: [] }),
    [j, h] = v.useState(!1),
    [p, k] = v.useState(!1),
    [$, C] = v.useState(!1),
    s = (() => {
      const o = new Date(),
        u = o.getMonth(),
        b = o.getFullYear(),
        A = a.filter((y) => y.category === 'member').length,
        M = a.reduce((y, P) => y + (P.wallet?.balance || 0), 0),
        I = a.filter((y) => {
          const P = new Date(y.createdAt || o);
          return P.getMonth() === u && P.getFullYear() === b;
        }).length,
        R = a.length > 0 ? M / a.length : 0,
        N = a.reduce((y, P) => ((y[P.category] = (y[P.category] || 0) + 1), y), {}),
        S = a.reduce(
          (y, P) => (
            (P.sports || []).forEach((D) => {
              y[D] = (y[D] || 0) + 1;
            }),
            y
          ),
          {}
        );
      return {
        totalPlayers: a.length,
        activeMembers: A,
        newPlayersThisMonth: I,
        totalWalletBalance: M,
        avgWalletBalance: R,
        categoryDistribution: N,
        sportsDistribution: S,
      };
    })(),
    x = () => {
      const o = [];
      (r.includePersonalData &&
        o.push('Nome', 'Cognome', 'Email', 'Telefono', 'Data Nascita', 'Categoria'),
        r.includeSportsData &&
          o.push('Sport', 'Livello Padel', 'Livello Tennis', 'Posizione Preferita'),
        r.includeWalletData && o.push('Saldo Wallet', 'Totale Ricariche', 'Ultima Ricarica'));
      let u =
        o.join(',') +
        `
`;
      return (
        a.forEach((b) => {
          const A = [];
          (r.includePersonalData &&
            A.push(
              `"${b.firstName || ''}"`,
              `"${b.lastName || ''}"`,
              `"${b.email || ''}"`,
              `"${b.phone || ''}"`,
              `"${b.dateOfBirth || ''}"`,
              `"${b.category || ''}"`
            ),
            r.includeSportsData &&
              A.push(
                `"${(b.sports || []).join(', ')}"`,
                `"${b.ratings?.padel || ''}"`,
                `"${b.ratings?.tennis || ''}"`,
                `"${b.preferredPosition || ''}"`
              ),
            r.includeWalletData &&
              A.push(
                `"${b.wallet?.balance || 0}"`,
                `"${b.wallet?.totalTopups || 0}"`,
                `"${b.wallet?.lastTopupDate || ''}"`
              ),
            (u +=
              A.join(',') +
              `
`));
        }),
        u
      );
    },
    f = () => {
      const o = x(),
        u = new Blob([o], { type: 'text/csv;charset=utf-8;' }),
        b = document.createElement('a'),
        A = URL.createObjectURL(u);
      (b.setAttribute('href', A),
        b.setAttribute('download', `giocatori_${new Date().toISOString().split('T')[0]}.csv`),
        (b.style.visibility = 'hidden'),
        document.body.appendChild(b),
        b.click(),
        document.body.removeChild(b),
        h(!1));
    },
    i = () => {
      (console.log('Esecuzione bulk action:', d),
        n && n(d),
        g({ type: '', category: '', discount: 0, message: '', selectedPlayers: [] }),
        k(!1),
        alert(`Operazione bulk "${d.type}" eseguita su ${d.selectedPlayers.length} giocatori!`));
    };
  return e.jsxs('div', {
    className: 'space-y-6',
    children: [
      e.jsxs('div', {
        className: 'flex flex-col lg:flex-row gap-4',
        children: [
          e.jsx('button', {
            onClick: () => h(!0),
            className: `${t.btnPrimary} flex items-center gap-2 px-6 py-3`,
            children: '📊 Esporta Dati',
          }),
          e.jsx('button', {
            onClick: () => k(!0),
            className: `${t.btnSecondary} flex items-center gap-2 px-6 py-3`,
            children: '🔄 Operazioni Bulk',
          }),
          e.jsxs('button', {
            onClick: () => C(!$),
            className: `${t.btnSecondary} flex items-center gap-2 px-6 py-3`,
            children: ['📈 Analytics', $ ? ' (Nascondi)' : ' (Mostra)'],
          }),
          e.jsx('button', {
            onClick: l,
            className: `${t.btnSecondary} flex items-center gap-2 px-6 py-3`,
            children: '🔄 Aggiorna Dati',
          }),
        ],
      }),
      $ &&
        e.jsxs('div', {
          className: `${t.cardBg} ${t.border} rounded-xl p-6`,
          children: [
            e.jsx('h3', {
              className: `text-lg font-bold ${t.text} mb-6 flex items-center gap-2`,
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
                      children: s.totalPlayers,
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
                      children: s.activeMembers,
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
                      children: s.newPlayersThisMonth,
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
                      children: ['€', s.totalWalletBalance.toFixed(0)],
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
                      className: `font-semibold ${t.text} mb-3`,
                      children: 'Distribuzione per Categoria',
                    }),
                    e.jsx('div', {
                      className: 'space-y-2',
                      children: Object.entries(s.categoryDistribution).map(([o, u]) =>
                        e.jsxs(
                          'div',
                          {
                            className:
                              'flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800',
                            children: [
                              e.jsxs('span', {
                                className: `capitalize ${t.text}`,
                                children: [
                                  o === 'member' && '👑 Membri',
                                  o === 'non_member' && '👤 Non Membri',
                                  o === 'guest' && '🏃 Ospiti',
                                  o === 'vip' && '⭐ VIP',
                                ],
                              }),
                              e.jsxs('span', {
                                className: `font-medium ${t.text}`,
                                children: [u, ' (', ((u / s.totalPlayers) * 100).toFixed(1), '%)'],
                              }),
                            ],
                          },
                          o
                        )
                      ),
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('h4', {
                      className: `font-semibold ${t.text} mb-3`,
                      children: 'Sport più Popolari',
                    }),
                    e.jsx('div', {
                      className: 'space-y-2',
                      children: Object.entries(s.sportsDistribution)
                        .sort(([, o], [, u]) => u - o)
                        .slice(0, 5)
                        .map(([o, u]) =>
                          e.jsxs(
                            'div',
                            {
                              className:
                                'flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800',
                              children: [
                                e.jsxs('span', {
                                  className: `capitalize ${t.text}`,
                                  children: [
                                    o === 'padel' && '🎾 Padel',
                                    o === 'tennis' && '🎾 Tennis',
                                    o === 'calcetto' && '⚽ Calcetto',
                                    o === 'beach_volley' && '🏐 Beach Volley',
                                    o || '❓ Altro',
                                  ],
                                }),
                                e.jsxs('span', {
                                  className: `font-medium ${t.text}`,
                                  children: [u, ' giocatori'],
                                }),
                              ],
                            },
                            o
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
                    children: ['€', s.avgWalletBalance.toFixed(2)],
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
            className: `${t.cardBg} ${t.border} rounded-xl p-4`,
            children: e.jsxs('div', {
              className: 'text-center',
              children: [
                e.jsx('div', { className: 'text-4xl mb-2', children: '📋' }),
                e.jsx('h4', {
                  className: `font-semibold ${t.text} mb-2`,
                  children: 'Esporta Lista',
                }),
                e.jsx('p', {
                  className: `text-sm ${t.subtext} mb-4`,
                  children: 'Scarica i dati dei giocatori in formato CSV o Excel',
                }),
                e.jsx('button', {
                  onClick: () => h(!0),
                  className: `${t.btnPrimary} w-full`,
                  children: 'Esporta Ora',
                }),
              ],
            }),
          }),
          e.jsx('div', {
            className: `${t.cardBg} ${t.border} rounded-xl p-4`,
            children: e.jsxs('div', {
              className: 'text-center',
              children: [
                e.jsx('div', { className: 'text-4xl mb-2', children: '✉️' }),
                e.jsx('h4', {
                  className: `font-semibold ${t.text} mb-2`,
                  children: 'Messaggio di Massa',
                }),
                e.jsx('p', {
                  className: `text-sm ${t.subtext} mb-4`,
                  children: 'Invia comunicazioni a più giocatori contemporaneamente',
                }),
                e.jsx('button', {
                  onClick: () => {
                    (g((o) => ({ ...o, type: 'message' })), k(!0));
                  },
                  className: `${t.btnSecondary} w-full`,
                  children: 'Invia Messaggio',
                }),
              ],
            }),
          }),
          e.jsx('div', {
            className: `${t.cardBg} ${t.border} rounded-xl p-4`,
            children: e.jsxs('div', {
              className: 'text-center',
              children: [
                e.jsx('div', { className: 'text-4xl mb-2', children: '🏷️' }),
                e.jsx('h4', {
                  className: `font-semibold ${t.text} mb-2`,
                  children: 'Gestione Categorie',
                }),
                e.jsx('p', {
                  className: `text-sm ${t.subtext} mb-4`,
                  children: 'Modifica le categorie di più giocatori insieme',
                }),
                e.jsx('button', {
                  onClick: () => {
                    (g((o) => ({ ...o, type: 'category' })), k(!0));
                  },
                  className: `${t.btnSecondary} w-full`,
                  children: 'Modifica Categorie',
                }),
              ],
            }),
          }),
        ],
      }),
      j &&
        e.jsx('div', {
          className:
            'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
          children: e.jsxs('div', {
            className: `${t.modalBg} rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden`,
            children: [
              e.jsx('div', {
                className: 'p-6 border-b border-gray-200 dark:border-gray-700',
                children: e.jsxs('div', {
                  className: 'flex items-center justify-between',
                  children: [
                    e.jsx('h3', {
                      className: `text-xl font-bold ${t.text}`,
                      children: '📊 Esporta Dati Giocatori',
                    }),
                    e.jsx('button', {
                      onClick: () => h(!1),
                      className: `${t.btnSecondary} px-4 py-2`,
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
                          className: `block text-sm font-medium ${t.text} mb-3`,
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
                                  checked: r.format === 'csv',
                                  onChange: (o) => m((u) => ({ ...u, format: o.target.value })),
                                  className: 'text-blue-600',
                                }),
                                e.jsx('span', { className: t.text, children: '📋 CSV' }),
                              ],
                            }),
                            e.jsxs('label', {
                              className: 'flex items-center space-x-2',
                              children: [
                                e.jsx('input', {
                                  type: 'radio',
                                  name: 'format',
                                  value: 'excel',
                                  checked: r.format === 'excel',
                                  onChange: (o) => m((u) => ({ ...u, format: o.target.value })),
                                  className: 'text-blue-600',
                                }),
                                e.jsx('span', { className: t.text, children: '📊 Excel' }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block text-sm font-medium ${t.text} mb-3`,
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
                                  checked: r.includePersonalData,
                                  onChange: (o) =>
                                    m((u) => ({ ...u, includePersonalData: o.target.checked })),
                                  className: 'text-blue-600',
                                }),
                                e.jsx('span', {
                                  className: t.text,
                                  children: '👤 Dati Personali (Nome, Email, Telefono)',
                                }),
                              ],
                            }),
                            e.jsxs('label', {
                              className: 'flex items-center space-x-3',
                              children: [
                                e.jsx('input', {
                                  type: 'checkbox',
                                  checked: r.includeSportsData,
                                  onChange: (o) =>
                                    m((u) => ({ ...u, includeSportsData: o.target.checked })),
                                  className: 'text-blue-600',
                                }),
                                e.jsx('span', {
                                  className: t.text,
                                  children: '🎾 Dati Sportivi (Sport, Livelli, Posizioni)',
                                }),
                              ],
                            }),
                            e.jsxs('label', {
                              className: 'flex items-center space-x-3',
                              children: [
                                e.jsx('input', {
                                  type: 'checkbox',
                                  checked: r.includeWalletData,
                                  onChange: (o) =>
                                    m((u) => ({ ...u, includeWalletData: o.target.checked })),
                                  className: 'text-blue-600',
                                }),
                                e.jsx('span', {
                                  className: t.text,
                                  children: '💰 Dati Wallet (Saldo, Ricariche)',
                                }),
                              ],
                            }),
                            e.jsxs('label', {
                              className: 'flex items-center space-x-3',
                              children: [
                                e.jsx('input', {
                                  type: 'checkbox',
                                  checked: r.includeBookingHistory,
                                  onChange: (o) =>
                                    m((u) => ({ ...u, includeBookingHistory: o.target.checked })),
                                  className: 'text-blue-600',
                                }),
                                e.jsx('span', {
                                  className: t.text,
                                  children: '📅 Storico Prenotazioni',
                                }),
                              ],
                            }),
                            e.jsxs('label', {
                              className: 'flex items-center space-x-3',
                              children: [
                                e.jsx('input', {
                                  type: 'checkbox',
                                  checked: r.includeNotes,
                                  onChange: (o) =>
                                    m((u) => ({ ...u, includeNotes: o.target.checked })),
                                  className: 'text-blue-600',
                                }),
                                e.jsx('span', {
                                  className: t.text,
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
                          onClick: f,
                          className: `${t.btnPrimary} flex-1`,
                          children: ['📊 Scarica (', r.format.toUpperCase(), ')'],
                        }),
                        e.jsx('button', {
                          onClick: () => h(!1),
                          className: `${t.btnSecondary} px-6`,
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
      p &&
        e.jsx('div', {
          className:
            'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
          children: e.jsxs('div', {
            className: `${t.modalBg} rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden`,
            children: [
              e.jsx('div', {
                className: 'p-6 border-b border-gray-200 dark:border-gray-700',
                children: e.jsxs('div', {
                  className: 'flex items-center justify-between',
                  children: [
                    e.jsx('h3', {
                      className: `text-xl font-bold ${t.text}`,
                      children: '🔄 Operazioni Bulk',
                    }),
                    e.jsx('button', {
                      onClick: () => k(!1),
                      className: `${t.btnSecondary} px-4 py-2`,
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
                          className: `block text-sm font-medium ${t.text} mb-3`,
                          children: 'Tipo Operazione',
                        }),
                        e.jsxs('select', {
                          value: d.type,
                          onChange: (o) => g((u) => ({ ...u, type: o.target.value })),
                          className: `${t.input} w-full`,
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
                            className: `block text-sm font-medium ${t.text} mb-2`,
                            children: 'Nuova Categoria',
                          }),
                          e.jsxs('select', {
                            value: d.category,
                            onChange: (o) => g((u) => ({ ...u, category: o.target.value })),
                            className: `${t.input} w-full`,
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
                            className: `block text-sm font-medium ${t.text} mb-2`,
                            children: 'Messaggio',
                          }),
                          e.jsx('textarea', {
                            value: d.message,
                            onChange: (o) => g((u) => ({ ...u, message: o.target.value })),
                            placeholder:
                              'Scrivi il messaggio da inviare a tutti i giocatori selezionati...',
                            rows: 4,
                            className: `${t.input} w-full`,
                          }),
                        ],
                      }),
                    (d.type === 'discount' || d.type === 'wallet_credit') &&
                      e.jsxs('div', {
                        children: [
                          e.jsxs('label', {
                            className: `block text-sm font-medium ${t.text} mb-2`,
                            children: [
                              d.type === 'discount' ? 'Percentuale Sconto' : 'Importo Ricarica',
                              ' (€)',
                            ],
                          }),
                          e.jsx('input', {
                            type: 'number',
                            value: d.discount,
                            onChange: (o) =>
                              g((u) => ({ ...u, discount: parseFloat(o.target.value) || 0 })),
                            placeholder: d.type === 'discount' ? '10' : '20.00',
                            className: `${t.input} w-full`,
                          }),
                        ],
                      }),
                    e.jsxs('div', {
                      className: `p-4 ${t.border} rounded-xl`,
                      children: [
                        e.jsxs('div', {
                          className: `text-sm font-medium ${t.text} mb-2`,
                          children: ['Giocatori Selezionati: ', s.totalPlayers],
                        }),
                        e.jsx('div', {
                          className: `text-xs ${t.subtext}`,
                          children:
                            "Tutti i giocatori verranno inclusi nell'operazione bulk. In futuro aggiungeremo la selezione manuale.",
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'flex gap-3',
                      children: [
                        e.jsx('button', {
                          onClick: i,
                          disabled:
                            !d.type ||
                            (d.type === 'category' && !d.category) ||
                            (d.type === 'message' && !d.message.trim()),
                          className: `${t.btnPrimary} flex-1 disabled:opacity-50 disabled:cursor-not-allowed`,
                          children: '🚀 Esegui Operazione',
                        }),
                        e.jsx('button', {
                          onClick: () => k(!1),
                          className: `${t.btnSecondary} px-6`,
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
function le({ state: a, setState: t, onOpenStats: n, playersById: l, T: r }) {
  const { user: m } = _(),
    [d, g] = v.useState(null),
    [j, h] = v.useState(!1),
    [p, k] = v.useState(null),
    [$, C] = v.useState('all'),
    [c, s] = v.useState(''),
    [x, f] = v.useState(!1),
    i = Array.isArray(a?.players) ? a.players : [],
    o = v.useMemo(() => (d && i.find((N) => N.id === d)) || null, [i, d]),
    u = v.useMemo(() => {
      let N = [...i];
      if (($ !== 'all' && (N = N.filter((S) => S.category === $)), c.trim())) {
        const S = c.toLowerCase();
        N = N.filter(
          (y) =>
            y.name?.toLowerCase().includes(S) ||
            y.email?.toLowerCase().includes(S) ||
            y.phone?.includes(S) ||
            y.firstName?.toLowerCase().includes(S) ||
            y.lastName?.toLowerCase().includes(S)
        );
      }
      return N.sort(K);
    }, [i, $, c]),
    b = v.useMemo(() => {
      const N = i.length,
        S = i.filter((D) => D.category === w.MEMBER).length,
        y = i.filter((D) => D.isActive !== !1).length,
        P = i.filter((D) => D.isAccountLinked).length;
      return { total: N, members: S, active: y, withAccount: P };
    }, [i]),
    A = (N) => {
      const S = {
        ...F(),
        ...N,
        id: G(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (t((y) => {
        const P = Array.isArray(y?.players) ? y.players : [];
        return { ...(y || { players: [], matches: [] }), players: [...P, S] };
      }),
        h(!1));
    },
    M = (N, S) => {
      t((y) => {
        const P = Array.isArray(y?.players) ? y.players : [];
        return {
          ...(y || { players: [], matches: [] }),
          players: P.map((D) =>
            D.id === N ? { ...D, ...S, updatedAt: new Date().toISOString() } : D
          ),
        };
      });
    },
    I = (N) => {
      confirm(
        'Sei sicuro di voler eliminare questo giocatore? Questa azione non può essere annullata.'
      ) &&
        (t((S) => {
          const y = Array.isArray(S?.players) ? S.players : [];
          return { ...(S || { players: [], matches: [] }), players: y.filter((P) => P.id !== N) };
        }),
        g(null));
    },
    R = () => {
      if (!m) return;
      const N = {
        firstName: m.firstName || m.displayName?.split(' ')[0] || '',
        lastName: m.lastName || m.displayName?.split(' ')[1] || '',
        name: m.displayName || `${m.firstName} ${m.lastName}`.trim(),
        email: m.email || '',
        linkedAccountId: m.uid,
        linkedAccountEmail: m.email,
        isAccountLinked: !0,
        category: w.MEMBER,
      };
      A(N);
    };
  return e.jsxs(e.Fragment, {
    children: [
      e.jsxs(q, {
        title: 'CRM Giocatori',
        T: r,
        children: [
          e.jsx('div', {
            className: `${r.cardBg} ${r.border} rounded-xl p-4 xl:p-3 mb-6`,
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
                          children: b.total,
                        }),
                        e.jsx('div', { className: `text-xs ${r.subtext}`, children: 'Totale' }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'text-center',
                      children: [
                        e.jsx('div', {
                          className:
                            'text-2xl xl:text-xl font-bold text-green-600 dark:text-green-400',
                          children: b.members,
                        }),
                        e.jsx('div', { className: `text-xs ${r.subtext}`, children: 'Membri' }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'text-center',
                      children: [
                        e.jsx('div', {
                          className:
                            'text-2xl xl:text-xl font-bold text-orange-600 dark:text-orange-400',
                          children: b.active,
                        }),
                        e.jsx('div', { className: `text-xs ${r.subtext}`, children: 'Attivi' }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'text-center',
                      children: [
                        e.jsx('div', {
                          className:
                            'text-2xl xl:text-xl font-bold text-purple-600 dark:text-purple-400',
                          children: b.withAccount,
                        }),
                        e.jsx('div', {
                          className: `text-xs ${r.subtext}`,
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
                      onClick: () => h(!0),
                      className: `${r.btnPrimary} px-4 py-2 text-sm`,
                      children: '➕ Nuovo Giocatore',
                    }),
                    e.jsx('button', {
                      onClick: R,
                      disabled: !m,
                      className: `${r.btnSecondary} px-4 py-2 text-sm`,
                      children: '👤 Crea da Account',
                    }),
                    e.jsx('button', {
                      onClick: () => f(!0),
                      className: `${r.btnSecondary} px-4 py-2 text-sm`,
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
                  value: c,
                  onChange: (N) => s(N.target.value),
                  className: `${r.input} w-full`,
                }),
              }),
              e.jsx('div', {
                className: 'flex gap-2 shrink-0',
                children: e.jsxs('select', {
                  value: $,
                  onChange: (N) => C(N.target.value),
                  className: `${r.input} min-w-[150px]`,
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
              u.length === 0
                ? e.jsxs('div', {
                    className: `text-center py-12 ${r.cardBg} ${r.border} rounded-xl`,
                    children: [
                      e.jsx('div', { className: 'text-6xl mb-4', children: '👥' }),
                      e.jsx('h3', {
                        className: `text-xl font-bold mb-2 ${r.text}`,
                        children: 'Nessun giocatore trovato',
                      }),
                      e.jsx('p', {
                        className: `${r.subtext} mb-4`,
                        children:
                          c || $ !== 'all'
                            ? 'Prova a modificare i filtri di ricerca'
                            : 'Inizia aggiungendo il primo giocatore al tuo CRM',
                      }),
                      e.jsx('button', {
                        onClick: () => h(!0),
                        className: `${r.btnPrimary} px-6 py-3`,
                        children: '➕ Aggiungi Primo Giocatore',
                      }),
                    ],
                  })
                : e.jsx('div', {
                    className:
                      'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 [@media(min-width:2200px)]:grid-cols-5 items-stretch',
                    children: u.map((N) =>
                      e.jsx(
                        Z,
                        {
                          player: N,
                          playersById: l,
                          onEdit: () => {
                            (k(N), h(!0));
                          },
                          onDelete: () => I(N.id),
                          onView: () => g(N.id),
                          onStats: () => n?.(N.id),
                          T: r,
                        },
                        N.id
                      )
                    ),
                  }),
          }),
        ],
      }),
      o &&
        e.jsx(L, {
          isOpen: !0,
          onClose: () => g(null),
          title: `${o.name || 'Giocatore'} - Dettagli`,
          size: 'large',
          children: e.jsx(se, {
            player: o,
            onUpdate: (N) => M(o.id, N),
            onClose: () => g(null),
            T: r,
          }),
        }),
      j &&
        e.jsx(L, {
          isOpen: !0,
          onClose: () => {
            (h(!1), k(null));
          },
          title: p ? 'Modifica Giocatore' : 'Nuovo Giocatore',
          size: 'large',
          children: e.jsx(J, {
            player: p,
            onSave: p
              ? (N) => {
                  (M(p.id, N), h(!1), k(null));
                }
              : A,
            onCancel: () => {
              (h(!1), k(null));
            },
            T: r,
          }),
        }),
      x &&
        e.jsx(L, {
          isOpen: !0,
          onClose: () => f(!1),
          title: 'Strumenti CRM',
          size: 'large',
          children: e.jsx(ae, {
            players: i,
            onClose: () => f(!1),
            onBulkOperation: (N) => {
              console.log('Bulk operation:', N);
            },
            onRefreshData: () => {
              console.log('Refreshing data...');
            },
            T: r,
          }),
        }),
    ],
  });
}
function ue() {
  const a = Y(),
    { state: t, setState: n, playersById: l } = W(),
    { clubMode: r } = U(),
    m = H.useMemo(() => V(), []),
    d = (g) => {
      a(`/stats?player=${g}`);
    };
  return r
    ? e.jsx(le, { T: m, state: t, setState: n, onOpenStats: d, playersById: l })
    : e.jsxs('div', {
        className: `text-center py-12 ${m.cardBg} ${m.border} rounded-xl m-4`,
        children: [
          e.jsx('div', { className: 'text-6xl mb-4', children: '🔒' }),
          e.jsx('h3', {
            className: `text-xl font-bold mb-2 ${m.text}`,
            children: 'Modalità Club Richiesta',
          }),
          e.jsx('p', {
            className: `${m.subtext} mb-4`,
            children:
              'Per accedere al CRM giocatori, devi prima sbloccare la modalità club nella sezione Extra.',
          }),
          e.jsx('button', {
            onClick: () => a('/extra'),
            className: `${m.btnPrimary} px-6 py-3`,
            children: 'Vai a Extra per sbloccare',
          }),
        ],
      });
}
export { ue as default };
