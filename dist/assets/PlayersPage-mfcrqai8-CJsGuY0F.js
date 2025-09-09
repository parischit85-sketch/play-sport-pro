import {
  D as E,
  j as e,
  i as _,
  k as Y,
  f as H,
  m as q,
  u as K,
  t as Q,
} from './index-mfcrqai8-SK5xfcQr.js';
import { r as j, c as Z, b as J } from './router-mfcrqai8-B0glbTOM.js';
import { S as X } from './Section-mfcrqai8-0tUIBI0p.js';
import { M as G } from './Modal-mfcrqai8-D4fdDW46.js';
import { b as T } from './names-mfcrqai8-BW9lV2zG.js';
import { loadBookingsForPlayer as ee } from './cloud-bookings-mfcrqai8-d3aOF8gM.js';
import './vendor-mfcrqai8-D3F3s8fL.js';
import './firebase-mfcrqai8-BteSMG94.js';
const S = { MEMBER: 'member', NON_MEMBER: 'non-member', GUEST: 'guest', VIP: 'vip' },
  I = {
    GENERAL: 'general',
    BOOKING: 'booking',
    PAYMENT: 'payment',
    DISCIPLINARY: 'disciplinary',
    MEDICAL: 'medical',
  },
  U = () => ({
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
    category: S.NON_MEMBER,
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
  L = () => ({
    id: '',
    amount: 0,
    type: 'credit',
    description: '',
    reference: '',
    createdAt: null,
    createdBy: null,
  }),
  F = () => ({
    id: '',
    type: I.GENERAL,
    title: '',
    content: '',
    isPrivate: !1,
    createdAt: null,
    createdBy: null,
    tags: [],
  });
function te({ player: a, playersById: t, onEdit: i, onDelete: l, onView: n, onStats: u, T: d }) {
  const p = t?.[a.id]?.rating ?? a.rating ?? E,
    v = (s) => {
      switch (s) {
        case S.MEMBER:
          return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
        case S.VIP:
          return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300';
        case S.GUEST:
          return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
        default:
          return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
      }
    },
    g = (s) => {
      switch (s) {
        case S.MEMBER:
          return 'Membro';
        case S.VIP:
          return 'VIP';
        case S.GUEST:
          return 'Ospite';
        case S.NON_MEMBER:
          return 'Non Membro';
        default:
          return 'N/A';
      }
    },
    b = (s) => {
      if (!s) return 'Mai';
      const o = Date.now() - new Date(s).getTime(),
        y = Math.floor(o / (1e3 * 60 * 60 * 24));
      return y === 0
        ? 'Oggi'
        : y === 1
          ? 'Ieri'
          : y < 7
            ? `${y} giorni fa`
            : y < 30
              ? `${Math.floor(y / 7)} settimane fa`
              : `${Math.floor(y / 30)} mesi fa`;
    },
    w = a.subscriptions?.[a.subscriptions?.length - 1],
    k = a.bookingHistory?.length || 0,
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
                              onClick: n,
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
                      className: `px-2 py-1 rounded-full text-xs font-medium ${v(a.category)}`,
                      children: g(a.category),
                    }),
                    w
                      ? e.jsx('span', {
                          className: 'text-[11px] text-green-700 dark:text-green-300',
                          title: `Scadenza: ${w.endDate ? new Date(w.endDate).toLocaleDateString('it-IT') : 'N/D'}`,
                          children: w.type || 'Abbonamento',
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
                      children: Number(p).toFixed(0),
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
                    e.jsx('div', { className: 'text-sm font-medium', children: b(a.lastActivity) }),
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
                        c
                          .slice(0, 3)
                          .map((s, o) =>
                            e.jsx(
                              'span',
                              {
                                className:
                                  'px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-[11px] break-words max-w-[10rem]',
                                children: s,
                              },
                              o
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
                      onClick: n,
                      className: `${d.btnSecondary} px-3 py-1 text-sm`,
                      title: 'Visualizza dettagli',
                      children: '👁️',
                    }),
                    e.jsx('button', {
                      onClick: i,
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
                          onClick: n,
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
                        className: `px-2 py-1 rounded-full text-xs font-medium ${v(a.category)}`,
                        children: g(a.category),
                      }),
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'text-right',
                  children: [
                    e.jsx('div', {
                      className: 'text-xl font-bold text-blue-600 dark:text-blue-400',
                      children: Number(p).toFixed(0),
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
                    e.jsx('div', { className: 'text-sm font-medium', children: b(a.lastActivity) }),
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
                    e.jsxs('div', { children: ['📝 ', C, ' / 🏷️ ', c.length] }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'flex gap-2',
              children: [
                e.jsx('button', {
                  onClick: n,
                  className: `${d.btnSecondary} flex-1 py-2 text-sm`,
                  children: '👁️ Dettagli',
                }),
                e.jsx('button', {
                  onClick: u,
                  className: `${d.btnSecondary} flex-1 py-2 text-sm`,
                  children: '📊 Stats',
                }),
                e.jsx('button', {
                  onClick: i,
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
function se({ player: a, onSave: t, onCancel: i, T: l }) {
  const [n, u] = j.useState(U()),
    [d, p] = j.useState({}),
    [v, g] = j.useState('basic');
  j.useEffect(() => {
    a && u({ ...U(), ...a });
  }, [a]);
  const b = (c, s) => {
      (u((o) => {
        if (c.includes('.')) {
          const [y, r] = c.split('.');
          return { ...o, [y]: { ...o[y], [r]: s } };
        }
        return { ...o, [c]: s };
      }),
        d[c] && p((o) => ({ ...o, [c]: void 0 })));
    },
    w = () => {
      const c = {};
      return (
        n.firstName?.trim() || (c.firstName = 'Nome richiesto'),
        n.lastName?.trim() || (c.lastName = 'Cognome richiesto'),
        n.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n.email) && (c.email = 'Email non valida'),
        n.phone && !/^[\d\s+\-()]+$/.test(n.phone) && (c.phone = 'Numero di telefono non valido'),
        p(c),
        Object.keys(c).length === 0
      );
    },
    k = (c) => {
      if ((c.preventDefault(), !w())) return;
      const s = {
        ...n,
        name: `${n.firstName} ${n.lastName}`.trim(),
        baseRating: Number(n.baseRating) || E,
        rating: Number(n.rating) || n.baseRating || E,
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
    onSubmit: k,
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
                onClick: () => g(c.id),
                className: `py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${v === c.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`,
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
          v === 'basic' &&
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
                          value: n.firstName || '',
                          onChange: (c) => b('firstName', c.target.value),
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
                          value: n.lastName || '',
                          onChange: (c) => b('lastName', c.target.value),
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
                      value: n.dateOfBirth || '',
                      onChange: (c) => b('dateOfBirth', c.target.value),
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
                      value: n.fiscalCode || '',
                      onChange: (c) => b('fiscalCode', c.target.value.toUpperCase()),
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
                      value: n.category || S.NON_MEMBER,
                      onChange: (c) => b('category', c.target.value),
                      className: `${l.input} w-full`,
                      children: [
                        e.jsx('option', { value: S.NON_MEMBER, children: 'Non Membro' }),
                        e.jsx('option', { value: S.MEMBER, children: 'Membro' }),
                        e.jsx('option', { value: S.GUEST, children: 'Ospite' }),
                        e.jsx('option', { value: S.VIP, children: 'VIP' }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          v === 'contact' &&
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
                      value: n.email || '',
                      onChange: (c) => b('email', c.target.value),
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
                      value: n.phone || '',
                      onChange: (c) => b('phone', c.target.value),
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
                      value: n.address?.street || '',
                      onChange: (c) => b('address.street', c.target.value),
                      className: `${l.input} w-full`,
                      placeholder: 'Via, numero civico',
                    }),
                    e.jsxs('div', {
                      className: 'grid grid-cols-2 gap-4',
                      children: [
                        e.jsx('input', {
                          type: 'text',
                          value: n.address?.city || '',
                          onChange: (c) => b('address.city', c.target.value),
                          className: `${l.input} w-full`,
                          placeholder: 'Città',
                        }),
                        e.jsx('input', {
                          type: 'text',
                          value: n.address?.province || '',
                          onChange: (c) => b('address.province', c.target.value),
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
                          value: n.address?.postalCode || '',
                          onChange: (c) => b('address.postalCode', c.target.value),
                          className: `${l.input} w-full`,
                          placeholder: 'CAP',
                        }),
                        e.jsx('input', {
                          type: 'text',
                          value: n.address?.country || 'Italia',
                          onChange: (c) => b('address.country', c.target.value),
                          className: `${l.input} w-full`,
                          placeholder: 'Paese',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          v === 'sports' &&
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
                          value: n.baseRating || E,
                          onChange: (c) => b('baseRating', Number(c.target.value)),
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
                          value: n.rating || n.baseRating || E,
                          onChange: (c) => b('rating', Number(c.target.value)),
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
                          checked: n.isActive !== !1,
                          onChange: (c) => b('isActive', c.target.checked),
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
          v === 'wallet' &&
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
                      value: n.wallet?.balance || 0,
                      onChange: (c) => b('wallet.balance', Number(c.target.value)),
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
                            e.jsx('span', { children: n.wallet?.transactions?.length || 0 }),
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
                              children: n.wallet?.lastUpdate
                                ? new Date(n.wallet.lastUpdate).toLocaleDateString()
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
          v === 'preferences' &&
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
                              checked: n.communicationPreferences?.email !== !1,
                              onChange: (c) =>
                                b('communicationPreferences.email', c.target.checked),
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
                              checked: n.communicationPreferences?.sms === !0,
                              onChange: (c) => b('communicationPreferences.sms', c.target.checked),
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
                              checked: n.communicationPreferences?.whatsapp === !0,
                              onChange: (c) =>
                                b('communicationPreferences.whatsapp', c.target.checked),
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
                              checked: n.communicationPreferences?.notifications !== !1,
                              onChange: (c) =>
                                b('communicationPreferences.notifications', c.target.checked),
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
                      value: n.tags?.join(', ') || '',
                      onChange: (c) =>
                        b(
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
            onClick: i,
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
function ae({ player: a, onUpdate: t, T: i }) {
  const [l, n] = j.useState(!1),
    [u, d] = j.useState(null),
    [p, v] = j.useState(F()),
    g = a.notes || [],
    b = () => {
      if (!p.title.trim() || !p.content.trim()) return;
      const s = {
          ...p,
          id: u?.id || _(),
          createdAt: u?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'current-user',
        },
        o = u ? g.map((y) => (y.id === u.id ? s : y)) : [...g, s];
      (t({ notes: o, updatedAt: new Date().toISOString() }), v(F()), n(!1), d(null));
    },
    w = (s) => {
      (v(s), d(s), n(!0));
    },
    k = (s) => {
      if (!confirm('Sei sicuro di voler eliminare questa nota?')) return;
      const o = g.filter((y) => y.id !== s);
      t({ notes: o, updatedAt: new Date().toISOString() });
    },
    C = (s) => {
      switch (s) {
        case I.GENERAL:
          return '📝 Generale';
        case I.BOOKING:
          return '📅 Prenotazione';
        case I.PAYMENT:
          return '💰 Pagamento';
        case I.DISCIPLINARY:
          return '⚠️ Disciplinare';
        case I.MEDICAL:
          return '🏥 Medica';
        default:
          return '📝 Generale';
      }
    },
    c = (s) => {
      switch (s) {
        case I.BOOKING:
          return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
        case I.PAYMENT:
          return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
        case I.DISCIPLINARY:
          return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
        case I.MEDICAL:
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
            className: `text-lg font-semibold ${i.text}`,
            children: ['Note Giocatore (', g.length, ')'],
          }),
          e.jsx('button', {
            onClick: () => {
              (v(F()), d(null), n(!0));
            },
            className: `${i.btnPrimary} px-4 py-2`,
            children: '➕ Nuova Nota',
          }),
        ],
      }),
      l &&
        e.jsxs('div', {
          className: `${i.cardBg} ${i.border} rounded-xl p-4`,
          children: [
            e.jsx('h4', {
              className: `font-medium ${i.text} mb-4`,
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
                          className: `block text-sm font-medium ${i.text} mb-1`,
                          children: 'Titolo',
                        }),
                        e.jsx('input', {
                          type: 'text',
                          value: p.title,
                          onChange: (s) => v((o) => ({ ...o, title: s.target.value })),
                          className: `${i.input} w-full`,
                          placeholder: 'Titolo della nota',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block text-sm font-medium ${i.text} mb-1`,
                          children: 'Tipo',
                        }),
                        e.jsx('select', {
                          value: p.type,
                          onChange: (s) => v((o) => ({ ...o, type: s.target.value })),
                          className: `${i.input} w-full`,
                          children: Object.values(I).map((s) =>
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
                      className: `block text-sm font-medium ${i.text} mb-1`,
                      children: 'Contenuto',
                    }),
                    e.jsx('textarea', {
                      value: p.content,
                      onChange: (s) => v((o) => ({ ...o, content: s.target.value })),
                      className: `${i.input} w-full`,
                      rows: 4,
                      placeholder: 'Descrizione dettagliata...',
                    }),
                  ],
                }),
                e.jsx('div', {
                  children: e.jsxs('label', {
                    className: `flex items-center gap-2 ${i.text}`,
                    children: [
                      e.jsx('input', {
                        type: 'checkbox',
                        checked: p.isPrivate,
                        onChange: (s) => v((o) => ({ ...o, isPrivate: s.target.checked })),
                        className: 'rounded',
                      }),
                      'Nota privata (visibile solo agli amministratori)',
                    ],
                  }),
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm font-medium ${i.text} mb-1`,
                      children: 'Tag (separati da virgola)',
                    }),
                    e.jsx('input', {
                      type: 'text',
                      value: p.tags?.join(', ') || '',
                      onChange: (s) =>
                        v((o) => ({
                          ...o,
                          tags: s.target.value
                            .split(',')
                            .map((y) => y.trim())
                            .filter(Boolean),
                        })),
                      className: `${i.input} w-full`,
                      placeholder: 'urgente, follow-up, importante',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'flex justify-end gap-3',
                  children: [
                    e.jsx('button', {
                      onClick: () => {
                        (n(!1), d(null), v(F()));
                      },
                      className: `${i.btnSecondary} px-4 py-2`,
                      children: 'Annulla',
                    }),
                    e.jsxs('button', {
                      onClick: b,
                      className: `${i.btnPrimary} px-4 py-2`,
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
          g.length === 0
            ? e.jsxs('div', {
                className: `text-center py-8 ${i.cardBg} ${i.border} rounded-xl`,
                children: [
                  e.jsx('div', { className: 'text-4xl mb-2', children: '📝' }),
                  e.jsx('div', {
                    className: `${i.subtext} mb-4`,
                    children: 'Nessuna nota presente',
                  }),
                  e.jsx('button', {
                    onClick: () => {
                      (v(F()), d(null), n(!0));
                    },
                    className: `${i.btnPrimary} px-6 py-3`,
                    children: 'Aggiungi Prima Nota',
                  }),
                ],
              })
            : g
                .sort((s, o) => new Date(o.createdAt) - new Date(s.createdAt))
                .map((s) =>
                  e.jsxs(
                    'div',
                    {
                      className: `${i.cardBg} ${i.border} rounded-xl p-4`,
                      children: [
                        e.jsxs('div', {
                          className: 'flex justify-between items-start mb-3',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center gap-3',
                              children: [
                                e.jsx('h4', {
                                  className: `font-semibold ${i.text}`,
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
                                  onClick: () => w(s),
                                  className: 'text-blue-500 hover:text-blue-700 text-sm',
                                  title: 'Modifica',
                                  children: '✏️',
                                }),
                                e.jsx('button', {
                                  onClick: () => k(s.id),
                                  className: 'text-red-500 hover:text-red-700 text-sm',
                                  title: 'Elimina',
                                  children: '🗑️',
                                }),
                              ],
                            }),
                          ],
                        }),
                        e.jsx('div', {
                          className: `${i.text} mb-3 whitespace-pre-wrap`,
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
                                children: s.tags.map((o, y) =>
                                  e.jsxs(
                                    'span',
                                    {
                                      className:
                                        'px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full',
                                      children: ['#', o],
                                    },
                                    y
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
function le({ player: a, onUpdate: t, T: i }) {
  const [l, n] = j.useState(!1),
    [u, d] = j.useState(L()),
    { addNotification: p } = Y(),
    v = a.wallet || { balance: 0, currency: 'EUR', transactions: [] },
    g = v.transactions || [],
    b = () => {
      if (!u.description || !u.description.trim()) {
        p({
          type: 'warning',
          title: 'Descrizione mancante',
          message: 'Aggiungi una breve descrizione del movimento prima di continuare.',
        });
        return;
      }
      if (!u.amount) return;
      const s = { ...u, id: _(), createdAt: new Date().toISOString(), createdBy: 'current-user' },
        o = u.type === 'credit' ? v.balance + Math.abs(u.amount) : v.balance - Math.abs(u.amount),
        y = {
          ...v,
          balance: Math.max(0, o),
          lastUpdate: new Date().toISOString(),
          transactions: [s, ...g],
        };
      (t({ wallet: y, updatedAt: new Date().toISOString() }), d(L()), n(!1));
    },
    w = (s) => {
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
    k = (s) => {
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
          return i.text;
      }
    },
    c = (s, o) =>
      `${o === 'credit' || o === 'refund' || o === 'bonus' ? '+' : '-'}€${Math.abs(s).toFixed(2)}`;
  return e.jsxs('div', {
    className: 'space-y-6',
    children: [
      e.jsxs('div', {
        className: `${i.cardBg} ${i.border} rounded-xl p-6 text-center`,
        children: [
          e.jsxs('div', {
            className: 'text-4xl font-bold text-green-600 dark:text-green-400 mb-2',
            children: ['€', v.balance.toFixed(2)],
          }),
          e.jsxs('div', {
            className: `text-sm ${i.subtext} mb-4`,
            children: ['Saldo Disponibile • ', v.currency],
          }),
          e.jsxs('div', {
            className: 'flex justify-center gap-3',
            children: [
              e.jsx('button', {
                onClick: () => {
                  (d({ ...L(), type: 'credit' }), n(!0));
                },
                className: `${i.btnPrimary} px-4 py-2`,
                children: '💰 Ricarica',
              }),
              e.jsx('button', {
                onClick: () => {
                  (d({ ...L(), type: 'debit' }), n(!0));
                },
                className: `${i.btnSecondary} px-4 py-2`,
                children: '💸 Addebito',
              }),
            ],
          }),
        ],
      }),
      l &&
        e.jsxs('div', {
          className: `${i.cardBg} ${i.border} rounded-xl p-4`,
          children: [
            e.jsx('h4', { className: `font-medium ${i.text} mb-4`, children: 'Nuova Transazione' }),
            e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  className: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className: `block text-sm font-medium ${i.text} mb-1`,
                          children: 'Tipo',
                        }),
                        e.jsxs('select', {
                          value: u.type,
                          onChange: (s) => d((o) => ({ ...o, type: s.target.value })),
                          className: `${i.input} w-full`,
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
                          className: `block text-sm font-medium ${i.text} mb-1`,
                          children: 'Importo (€)',
                        }),
                        e.jsx('input', {
                          type: 'number',
                          value: u.amount || '',
                          onChange: (s) => d((o) => ({ ...o, amount: Number(s.target.value) })),
                          className: `${i.input} w-full`,
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
                      className: `block text-sm font-medium ${i.text} mb-1`,
                      children: 'Descrizione',
                    }),
                    e.jsx('input', {
                      type: 'text',
                      value: u.description,
                      onChange: (s) => d((o) => ({ ...o, description: s.target.value })),
                      className: `${i.input} w-full`,
                      placeholder: 'Descrizione della transazione...',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', {
                      className: `block text-sm font-medium ${i.text} mb-1`,
                      children: 'Riferimento (opzionale)',
                    }),
                    e.jsx('input', {
                      type: 'text',
                      value: u.reference,
                      onChange: (s) => d((o) => ({ ...o, reference: s.target.value })),
                      className: `${i.input} w-full`,
                      placeholder: 'ID prenotazione, fattura, etc...',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'flex justify-end gap-3',
                  children: [
                    e.jsx('button', {
                      onClick: () => {
                        (n(!1), d(L()));
                      },
                      className: `${i.btnSecondary} px-4 py-2`,
                      children: 'Annulla',
                    }),
                    e.jsx('button', {
                      onClick: b,
                      className: `${i.btnPrimary} px-4 py-2`,
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
            className: `${i.cardBg} ${i.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-blue-600 dark:text-blue-400',
                children: g.length,
              }),
              e.jsx('div', { className: `text-xs ${i.subtext}`, children: 'Transazioni' }),
            ],
          }),
          e.jsxs('div', {
            className: `${i.cardBg} ${i.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-green-600 dark:text-green-400',
                children: g.filter(
                  (s) => s.type === 'credit' || s.type === 'refund' || s.type === 'bonus'
                ).length,
              }),
              e.jsx('div', { className: `text-xs ${i.subtext}`, children: 'Entrate' }),
            ],
          }),
          e.jsxs('div', {
            className: `${i.cardBg} ${i.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-red-600 dark:text-red-400',
                children: g.filter((s) => s.type === 'debit').length,
              }),
              e.jsx('div', { className: `text-xs ${i.subtext}`, children: 'Uscite' }),
            ],
          }),
          e.jsxs('div', {
            className: `${i.cardBg} ${i.border} rounded-xl p-4 text-center`,
            children: [
              e.jsxs('div', {
                className: `text-2xl font-bold ${i.text}`,
                children: [
                  '€',
                  g
                    .reduce(
                      (s, o) =>
                        o.type === 'credit' || o.type === 'refund' || o.type === 'bonus'
                          ? s + o.amount
                          : s - o.amount,
                      0
                    )
                    .toFixed(2),
                ],
              }),
              e.jsx('div', { className: `text-xs ${i.subtext}`, children: 'Totale Movimenti' }),
            ],
          }),
        ],
      }),
      e.jsxs('div', {
        children: [
          e.jsxs('h4', {
            className: `font-semibold ${i.text} mb-4`,
            children: ['Storico Transazioni (', g.length, ')'],
          }),
          g.length === 0
            ? e.jsxs('div', {
                className: `text-center py-8 ${i.cardBg} ${i.border} rounded-xl`,
                children: [
                  e.jsx('div', { className: 'text-4xl mb-2', children: '💳' }),
                  e.jsx('div', {
                    className: `${i.subtext} mb-4`,
                    children: 'Nessuna transazione presente',
                  }),
                  e.jsx('button', {
                    onClick: () => {
                      (d({ ...L(), type: 'credit' }), n(!0));
                    },
                    className: `${i.btnPrimary} px-6 py-3`,
                    children: 'Aggiungi Prima Transazione',
                  }),
                ],
              })
            : e.jsx('div', {
                className: 'space-y-3',
                children: g
                  .sort((s, o) => new Date(o.createdAt) - new Date(s.createdAt))
                  .map((s) =>
                    e.jsx(
                      'div',
                      {
                        className: `${i.cardBg} ${i.border} rounded-xl p-4`,
                        children: e.jsxs('div', {
                          className: 'flex justify-between items-start',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center gap-3 flex-1',
                              children: [
                                e.jsx('div', { className: 'text-2xl', children: w(s.type) }),
                                e.jsxs('div', {
                                  className: 'min-w-0 flex-1',
                                  children: [
                                    e.jsxs('div', {
                                      className: 'flex items-center gap-2 mb-1',
                                      children: [
                                        e.jsx('span', {
                                          className: `font-medium ${i.text}`,
                                          children: s.description,
                                        }),
                                        e.jsx('span', {
                                          className: `px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 ${i.subtext}`,
                                          children: k(s.type),
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
function ie({ player: a, T: t }) {
  const [i, l] = j.useState({ type: 'email', subject: '', message: '', priority: 'normal' }),
    [n, u] = j.useState(''),
    [d, p] = j.useState(!1),
    v = [
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
    g = [
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
    b = () => {
      (console.log('Invio messaggio:', i),
        l({ type: 'email', subject: '', message: '', priority: 'normal' }),
        alert(`Messaggio ${i.type} inviato a ${a.firstName}!`));
    },
    w = (s) => {
      (l((o) => ({ ...o, type: s.type, subject: s.subject || '', message: s.content })), p(!1));
    },
    k = (s, o) => {
      if (o === 'failed') return '❌';
      if (o === 'pending') return '⏳';
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
      totalSent: g.length,
      emails: g.filter((s) => s.type === 'email').length,
      sms: g.filter((s) => s.type === 'sms').length,
      push: g.filter((s) => s.type === 'push').length,
      opened: g.filter((s) => s.openDate || s.clickDate).length,
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
                    value: i.type,
                    onChange: (s) => l((o) => ({ ...o, type: s.target.value })),
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
                    value: i.priority,
                    onChange: (s) => l((o) => ({ ...o, priority: s.target.value })),
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
          i.type === 'email' &&
            e.jsxs('div', {
              className: 'mb-4',
              children: [
                e.jsx('label', {
                  className: `block text-sm font-medium ${t.text} mb-2`,
                  children: 'Oggetto',
                }),
                e.jsx('input', {
                  type: 'text',
                  value: i.subject,
                  onChange: (s) => l((o) => ({ ...o, subject: s.target.value })),
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
                    onClick: () => p(!0),
                    className: `${t.btnSecondary} text-xs px-3 py-1`,
                    children: '📋 Template',
                  }),
                ],
              }),
              e.jsx('textarea', {
                value: i.message,
                onChange: (s) => l((o) => ({ ...o, message: s.target.value })),
                placeholder: `Scrivi il tuo messaggio ${i.type}...`,
                rows: i.type === 'sms' ? 3 : 6,
                maxLength: i.type === 'sms' ? 160 : void 0,
                className: `${t.input} w-full resize-none`,
              }),
              i.type === 'sms' &&
                e.jsxs('div', {
                  className: `text-right text-xs ${t.subtext} mt-1`,
                  children: [i.message.length, '/160 caratteri'],
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
                          i.type === 'email' && a.email,
                          i.type === 'sms' && a.phone,
                          i.type === 'push' && 'App mobile',
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
                onClick: b,
                disabled: !i.message.trim() || (i.type === 'email' && !i.subject.trim()),
                className: `${t.btnPrimary} flex-1 disabled:opacity-50 disabled:cursor-not-allowed`,
                children: ['🚀 Invia ', i.type.toUpperCase()],
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
            children: ['📋 Storico Comunicazioni (', g.length, ')'],
          }),
          g.length === 0
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
                children: g
                  .sort((s, o) => new Date(o.sentDate) - new Date(s.sentDate))
                  .map((s) =>
                    e.jsx(
                      'div',
                      {
                        className: `${t.cardBg} ${t.border} rounded-xl p-4`,
                        children: e.jsxs('div', {
                          className: 'flex items-start gap-3',
                          children: [
                            e.jsx('div', { className: 'text-2xl', children: k(s.type, s.status) }),
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
                                    ' alle',
                                    ' ',
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
                                      ' alle',
                                      ' ',
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
                                      ' alle',
                                      ' ',
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
                      onClick: () => p(!1),
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
                  children: v.map((s) =>
                    e.jsxs(
                      'div',
                      {
                        className: `${t.border} rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors`,
                        onClick: () => w(s),
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
function ne({ player: a, T: t }) {
  const [i, l] = j.useState('all'),
    [n, u] = j.useState('all'),
    [d, p] = j.useState(!1),
    [v, g] = j.useState(null),
    [b, w] = j.useState([]);
  j.useEffect(() => {
    let r = !1;
    async function x() {
      (p(!0), g(null));
      try {
        const h = a?.linkedAccountId || null,
          N = a?.linkedAccountEmail || a?.email || null,
          P = a?.name || `${a?.firstName || ''} ${a?.lastName || ''}`.trim(),
          B = await ee({ userId: h, email: N, name: P });
        if (r) return;
        w(B || []);
      } catch (h) {
        if (r) return;
        g(h);
      } finally {
        r || p(!1);
      }
    }
    return (
      x(),
      () => {
        r = !0;
      }
    );
  }, [a?.linkedAccountId, a?.linkedAccountEmail, a?.email, a?.name, a?.firstName, a?.lastName]);
  const k = j.useMemo(
      () =>
        (b || []).map((r) => {
          const x = r.date,
            h = r.time || '',
            N = h.includes('-') ? h : `${h}`,
            P = r.courtName || r.court || 'Campo',
            B = r.sport || 'Padel',
            z = r.status || 'confirmed',
            R =
              Array.isArray(r.players) && r.players.length > 0
                ? r.players
                : [r.bookedBy || r.userEmail || ''],
            f = typeof r.price == 'number' ? r.price : Number(r.price || 0) || 0,
            A = !!r.paid || r.paymentStatus === 'paid',
            $ = r.paymentMethod || null;
          return {
            id: r.id,
            date: x,
            time: N,
            court: P,
            sport: B,
            status: z,
            players: R,
            price: f,
            paid: A,
            paymentMethod: $,
          };
        }),
      [b]
    ),
    C = (r) => {
      const x = (r.time || '').split('-')[0].trim(),
        h = x ? `${r.date}T${x}:00` : `${r.date}T00:00:00`,
        N = new Date(h);
      return isNaN(N.getTime()) ? new Date(r.date) : N;
    },
    c = (r) => {
      switch (r) {
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
    s = (r) => {
      switch (r) {
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
    o = k.filter((r) => {
      const x = new Date(),
        h = C(r);
      if (i !== 'all') {
        if (i === 'completed') {
          if (!(h < x && r.status !== 'cancelled')) return !1;
        } else if (i === 'confirmed') {
          if (r.status !== 'confirmed') return !1;
        } else if (i === 'cancelled') {
          if (r.status !== 'cancelled') return !1;
        } else if (i === 'no_show') {
          if (r.status !== 'no_show') return !1;
        } else if (r.status !== i) return !1;
      }
      if (n !== 'all') {
        const N = new Date(r.date);
        switch (n) {
          case 'week': {
            const P = new Date(x.getTime() - 6048e5);
            return N >= P;
          }
          case 'month': {
            const P = new Date(x.getTime() - 2592e6);
            return N >= P;
          }
          case 'year': {
            const P = new Date(x.getTime() - 31536e6);
            return N >= P;
          }
          default:
            return !0;
        }
      }
      return !0;
    }),
    y = {
      total: k.length,
      completed: k.filter((r) => C(r) < new Date() && r.status !== 'cancelled').length,
      upcoming: k.filter((r) => C(r) >= new Date() && r.status !== 'cancelled').length,
      cancelled: k.filter((r) => r.status === 'cancelled').length,
      totalSpent: k.filter((r) => r.paid).reduce((r, x) => r + x.price, 0),
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
                children: y.total,
              }),
              e.jsx('div', { className: `text-xs ${t.subtext}`, children: 'Totale' }),
            ],
          }),
          e.jsxs('div', {
            className: `${t.cardBg} ${t.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-green-600 dark:text-green-400',
                children: y.completed,
              }),
              e.jsx('div', { className: `text-xs ${t.subtext}`, children: 'Completate' }),
            ],
          }),
          e.jsxs('div', {
            className: `${t.cardBg} ${t.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-orange-600 dark:text-orange-400',
                children: y.upcoming,
              }),
              e.jsx('div', { className: `text-xs ${t.subtext}`, children: 'Future' }),
            ],
          }),
          e.jsxs('div', {
            className: `${t.cardBg} ${t.border} rounded-xl p-4 text-center`,
            children: [
              e.jsx('div', {
                className: 'text-2xl font-bold text-red-600 dark:text-red-400',
                children: y.cancelled,
              }),
              e.jsx('div', { className: `text-xs ${t.subtext}`, children: 'Cancellate' }),
            ],
          }),
          e.jsxs('div', {
            className: `${t.cardBg} ${t.border} rounded-xl p-4 text-center`,
            children: [
              e.jsxs('div', {
                className: 'text-2xl font-bold text-purple-600 dark:text-purple-400',
                children: ['€', y.totalSpent.toFixed(2)],
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
                value: i,
                onChange: (r) => l(r.target.value),
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
                value: n,
                onChange: (r) => u(r.target.value),
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
            children: ['Storico Prenotazioni (', o.length, ')'],
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
            : v
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
              : o.length === 0
                ? e.jsxs('div', {
                    className: `text-center py-8 ${t.cardBg} ${t.border} rounded-xl`,
                    children: [
                      e.jsx('div', { className: 'text-4xl mb-2', children: '📅' }),
                      e.jsx('div', {
                        className: `${t.subtext} mb-4`,
                        children:
                          i !== 'all' || n !== 'all'
                            ? 'Nessuna prenotazione corrispondente ai filtri'
                            : 'Nessuna prenotazione presente',
                      }),
                      i !== 'all' || n !== 'all'
                        ? e.jsx('button', {
                            onClick: () => {
                              (l('all'), u('all'));
                            },
                            className: `${t.btnSecondary} px-6 py-3`,
                            children: 'Rimuovi Filtri',
                          })
                        : null,
                    ],
                  })
                : e.jsx('div', {
                    className: 'space-y-3',
                    children: o
                      .sort((r, x) => C(x) - C(r))
                      .map((r) =>
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
                                    children: new Date(r.date).getDate(),
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex-1 min-w-0',
                                    children: [
                                      e.jsxs('div', {
                                        className: 'flex items-center gap-3 mb-1',
                                        children: [
                                          e.jsxs('span', {
                                            className: `font-medium ${t.text}`,
                                            children: [r.court, ' - ', r.sport],
                                          }),
                                          e.jsx('span', {
                                            className: `px-2 py-1 rounded-full text-xs font-medium ${s(r.status)}`,
                                            children: c(r.status),
                                          }),
                                          r.paid &&
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
                                              new Date(r.date).toLocaleDateString('it-IT'),
                                            ],
                                          }),
                                          e.jsxs('span', { children: ['⏰ ', r.time] }),
                                          e.jsxs('span', {
                                            children: ['👥 ', r.players.join(', ')],
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
                                        children: ['€', r.price.toFixed(2)],
                                      }),
                                      e.jsx('div', {
                                        className: `text-xs ${t.subtext}`,
                                        children: r.paymentMethod ? r.paymentMethod : 'Non pagato',
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
                                            children: [r.court, ' - ', r.sport],
                                          }),
                                          e.jsxs('div', {
                                            className: 'text-sm text-gray-500 dark:text-gray-400',
                                            children: [
                                              '📅 ',
                                              new Date(r.date).toLocaleDateString('it-IT'),
                                              ' ⏰ ',
                                              r.time,
                                            ],
                                          }),
                                        ],
                                      }),
                                      e.jsx('div', {
                                        className: 'text-right',
                                        children: e.jsxs('div', {
                                          className:
                                            'text-lg font-bold text-green-600 dark:text-green-400',
                                          children: ['€', r.price.toFixed(2)],
                                        }),
                                      }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex flex-wrap gap-2 mb-3',
                                    children: [
                                      e.jsx('span', {
                                        className: `px-2 py-1 rounded-full text-xs font-medium ${s(r.status)}`,
                                        children: c(r.status),
                                      }),
                                      r.paid &&
                                        e.jsx('span', {
                                          className:
                                            'px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
                                          children: '💰 Pagato',
                                        }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    className: 'text-sm text-gray-500 dark:text-gray-400',
                                    children: ['👥 ', r.players.join(', ')],
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
    ],
  });
}
function re({ player: a, onUpdate: t, onClose: i, T: l }) {
  const [n, u] = j.useState('overview'),
    [d, p] = j.useState(!1),
    [v, g] = j.useState(''),
    [b, w] = j.useState(''),
    [k, C] = j.useState([]),
    [c, s] = j.useState(!1),
    { state: o } = H(),
    y = j.useMemo(
      () =>
        new Set(
          (o?.players || [])
            .filter((m) => m.id !== a.id && (m.isAccountLinked || m.linkedAccountEmail))
            .map((m) => (m.linkedAccountEmail || '').toLowerCase())
            .filter(Boolean)
        ),
      [o?.players, a.id]
    ),
    r = j.useMemo(
      () =>
        new Set(
          (o?.players || [])
            .filter((m) => m.id !== a.id && (m.isAccountLinked || m.linkedAccountId))
            .map((m) => m.linkedAccountId)
            .filter(Boolean)
        ),
      [o?.players, a.id]
    ),
    x = j.useMemo(
      () =>
        (k || []).filter((m) => {
          const M = (m.email || '').toLowerCase(),
            O = m.uid;
          return !M || (O && r.has(O)) ? !1 : !y.has(M);
        }),
      [k, y, r]
    ),
    h = j.useMemo(() => {
      const m = b.trim().toLowerCase();
      return m
        ? x.filter(
            (M) =>
              (M.email || '').toLowerCase().includes(m) ||
              (M.firstName || '').toLowerCase().includes(m) ||
              (M.lastName || '').toLowerCase().includes(m)
          )
        : x;
    }, [x, b]),
    N = async () => {
      try {
        s(!0);
        const m = await q(500);
        (C(m || []), w(''), p(!0));
      } finally {
        s(!1);
      }
    },
    P = (m) => {
      switch (m) {
        case S.MEMBER:
          return 'Membro';
        case S.VIP:
          return 'VIP';
        case S.GUEST:
          return 'Ospite';
        case S.NON_MEMBER:
          return 'Non Membro';
        default:
          return 'N/A';
      }
    },
    B = (m) => {
      switch (m) {
        case S.MEMBER:
          return 'text-green-600 dark:text-green-400';
        case S.VIP:
          return 'text-purple-600 dark:text-purple-400';
        case S.GUEST:
          return 'text-blue-600 dark:text-blue-400';
        default:
          return 'text-gray-600 dark:text-gray-400';
      }
    },
    z = () => {
      v.trim() &&
        (t({
          linkedAccountEmail: v.trim(),
          isAccountLinked: !0,
          updatedAt: new Date().toISOString(),
        }),
        p(!1),
        g(''));
    },
    R = () => {
      confirm("Sei sicuro di voler scollegare l'account da questo giocatore?") &&
        t({
          linkedAccountId: null,
          linkedAccountEmail: null,
          isAccountLinked: !1,
          updatedAt: new Date().toISOString(),
        });
    },
    f = () => {
      t({ isActive: !a.isActive, updatedAt: new Date().toISOString() });
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
    D = [
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
                            className: `px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 ${B(a.category)}`,
                            children: P(a.category),
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
                      onClick: f,
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
                                          value: b,
                                          onChange: (m) => w(m.target.value),
                                          placeholder: 'Cerca per nome o email…',
                                          className: `${l.input} text-sm flex-1`,
                                        }),
                                        e.jsx('button', {
                                          onClick: () => C([]),
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
                                                            (t({
                                                              linkedAccountId: m.uid,
                                                              linkedAccountEmail: M,
                                                              isAccountLinked: !0,
                                                              updatedAt: new Date().toISOString(),
                                                            }),
                                                            p(!1),
                                                            C([]),
                                                            w(''),
                                                            g(''));
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
                                      value: v,
                                      onChange: (m) => g(m.target.value),
                                      placeholder: 'email@esempio.com',
                                      className: `${l.input} text-sm`,
                                    }),
                                    e.jsx('button', {
                                      onClick: z,
                                      className:
                                        'px-3 py-1 text-sm bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded',
                                      children: 'Collega',
                                    }),
                                    e.jsx('button', {
                                      onClick: () => {
                                        (p(!1), g(''));
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
                              onClick: N,
                              className: `${l.btnSecondary} px-4 py-2 text-sm`,
                              disabled: c,
                              children: c ? 'Carico…' : '🔎 Cerca account',
                            }),
                            e.jsx('button', {
                              onClick: () => p(!0),
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
          children: D.map((m) =>
            e.jsxs(
              'button',
              {
                onClick: () => u(m.id),
                className: `py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${n === m.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`,
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
          n === 'overview' &&
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
          n === 'notes' && e.jsx(ae, { player: a, onUpdate: t, T: l }),
          n === 'wallet' && e.jsx(le, { player: a, onUpdate: t, T: l }),
          n === 'bookings' && e.jsx(ne, { player: a, T: l }),
          n === 'communications' && e.jsx(ie, { player: a, onUpdate: t, T: l }),
        ],
      }),
    ],
  });
}
function ce({ players: a, T: t, onBulkOperation: i, onRefreshData: l }) {
  const [n, u] = j.useState({
      format: 'csv',
      includePersonalData: !0,
      includeSportsData: !0,
      includeWalletData: !0,
      includeBookingHistory: !1,
      includeNotes: !1,
      dateRange: 'all',
    }),
    [d, p] = j.useState({ type: '', category: '', discount: 0, message: '', selectedPlayers: [] }),
    [v, g] = j.useState(!1),
    [b, w] = j.useState(!1),
    [k, C] = j.useState(!1),
    s = (() => {
      const x = new Date(),
        h = x.getMonth(),
        N = x.getFullYear(),
        P = a.filter(($) => $.category === 'member').length,
        B = a.reduce(($, D) => $ + (D.wallet?.balance || 0), 0),
        z = a.filter(($) => {
          const D = new Date($.createdAt || x);
          return D.getMonth() === h && D.getFullYear() === N;
        }).length,
        R = a.length > 0 ? B / a.length : 0,
        f = a.reduce(($, D) => (($[D.category] = ($[D.category] || 0) + 1), $), {}),
        A = a.reduce(
          ($, D) => (
            (D.sports || []).forEach((m) => {
              $[m] = ($[m] || 0) + 1;
            }),
            $
          ),
          {}
        );
      return {
        totalPlayers: a.length,
        activeMembers: P,
        newPlayersThisMonth: z,
        totalWalletBalance: B,
        avgWalletBalance: R,
        categoryDistribution: f,
        sportsDistribution: A,
      };
    })(),
    o = () => {
      const x = [];
      (n.includePersonalData &&
        x.push('Nome', 'Cognome', 'Email', 'Telefono', 'Data Nascita', 'Categoria'),
        n.includeSportsData &&
          x.push('Sport', 'Livello Padel', 'Livello Tennis', 'Posizione Preferita'),
        n.includeWalletData && x.push('Saldo Wallet', 'Totale Ricariche', 'Ultima Ricarica'));
      let h =
        x.join(',') +
        `
`;
      return (
        a.forEach((N) => {
          const P = [];
          (n.includePersonalData &&
            P.push(
              `"${N.firstName || ''}"`,
              `"${N.lastName || ''}"`,
              `"${N.email || ''}"`,
              `"${N.phone || ''}"`,
              `"${N.dateOfBirth || ''}"`,
              `"${N.category || ''}"`
            ),
            n.includeSportsData &&
              P.push(
                `"${(N.sports || []).join(', ')}"`,
                `"${N.ratings?.padel || ''}"`,
                `"${N.ratings?.tennis || ''}"`,
                `"${N.preferredPosition || ''}"`
              ),
            n.includeWalletData &&
              P.push(
                `"${N.wallet?.balance || 0}"`,
                `"${N.wallet?.totalTopups || 0}"`,
                `"${N.wallet?.lastTopupDate || ''}"`
              ),
            (h +=
              P.join(',') +
              `
`));
        }),
        h
      );
    },
    y = () => {
      const x = o(),
        h = new Blob([x], { type: 'text/csv;charset=utf-8;' }),
        N = document.createElement('a'),
        P = URL.createObjectURL(h);
      (N.setAttribute('href', P),
        N.setAttribute('download', `giocatori_${new Date().toISOString().split('T')[0]}.csv`),
        (N.style.visibility = 'hidden'),
        document.body.appendChild(N),
        N.click(),
        document.body.removeChild(N),
        g(!1));
    },
    r = () => {
      (console.log('Esecuzione bulk action:', d),
        i && i(d),
        p({ type: '', category: '', discount: 0, message: '', selectedPlayers: [] }),
        w(!1),
        alert(`Operazione bulk "${d.type}" eseguita su ${d.selectedPlayers.length} giocatori!`));
    };
  return e.jsxs('div', {
    className: 'space-y-6',
    children: [
      e.jsxs('div', {
        className: 'flex flex-col lg:flex-row gap-4',
        children: [
          e.jsx('button', {
            onClick: () => g(!0),
            className: `${t.btnPrimary} flex items-center gap-2 px-6 py-3`,
            children: '📊 Esporta Dati',
          }),
          e.jsx('button', {
            onClick: () => w(!0),
            className: `${t.btnSecondary} flex items-center gap-2 px-6 py-3`,
            children: '🔄 Operazioni Bulk',
          }),
          e.jsxs('button', {
            onClick: () => C(!k),
            className: `${t.btnSecondary} flex items-center gap-2 px-6 py-3`,
            children: ['📈 Analytics', k ? ' (Nascondi)' : ' (Mostra)'],
          }),
          e.jsx('button', {
            onClick: l,
            className: `${t.btnSecondary} flex items-center gap-2 px-6 py-3`,
            children: '🔄 Aggiorna Dati',
          }),
        ],
      }),
      k &&
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
                      children: Object.entries(s.categoryDistribution).map(([x, h]) =>
                        e.jsxs(
                          'div',
                          {
                            className:
                              'flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800',
                            children: [
                              e.jsxs('span', {
                                className: `capitalize ${t.text}`,
                                children: [
                                  x === 'member' && '👑 Membri',
                                  x === 'non_member' && '👤 Non Membri',
                                  x === 'guest' && '🏃 Ospiti',
                                  x === 'vip' && '⭐ VIP',
                                ],
                              }),
                              e.jsxs('span', {
                                className: `font-medium ${t.text}`,
                                children: [h, ' (', ((h / s.totalPlayers) * 100).toFixed(1), '%)'],
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
                      className: `font-semibold ${t.text} mb-3`,
                      children: 'Sport più Popolari',
                    }),
                    e.jsx('div', {
                      className: 'space-y-2',
                      children: Object.entries(s.sportsDistribution)
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
                                  className: `capitalize ${t.text}`,
                                  children: [
                                    x === 'padel' && '🎾 Padel',
                                    x === 'tennis' && '🎾 Tennis',
                                    x === 'calcetto' && '⚽ Calcetto',
                                    x === 'beach_volley' && '🏐 Beach Volley',
                                    x || '❓ Altro',
                                  ],
                                }),
                                e.jsxs('span', {
                                  className: `font-medium ${t.text}`,
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
                  onClick: () => g(!0),
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
                    (p((x) => ({ ...x, type: 'message' })), w(!0));
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
                    (p((x) => ({ ...x, type: 'category' })), w(!0));
                  },
                  className: `${t.btnSecondary} w-full`,
                  children: 'Modifica Categorie',
                }),
              ],
            }),
          }),
        ],
      }),
      v &&
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
                      onClick: () => g(!1),
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
                                  checked: n.format === 'csv',
                                  onChange: (x) => u((h) => ({ ...h, format: x.target.value })),
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
                                  checked: n.format === 'excel',
                                  onChange: (x) => u((h) => ({ ...h, format: x.target.value })),
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
                                  checked: n.includePersonalData,
                                  onChange: (x) =>
                                    u((h) => ({ ...h, includePersonalData: x.target.checked })),
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
                                  checked: n.includeSportsData,
                                  onChange: (x) =>
                                    u((h) => ({ ...h, includeSportsData: x.target.checked })),
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
                                  checked: n.includeWalletData,
                                  onChange: (x) =>
                                    u((h) => ({ ...h, includeWalletData: x.target.checked })),
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
                                  checked: n.includeBookingHistory,
                                  onChange: (x) =>
                                    u((h) => ({ ...h, includeBookingHistory: x.target.checked })),
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
                                  checked: n.includeNotes,
                                  onChange: (x) =>
                                    u((h) => ({ ...h, includeNotes: x.target.checked })),
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
                          onClick: y,
                          className: `${t.btnPrimary} flex-1`,
                          children: ['📊 Scarica (', n.format.toUpperCase(), ')'],
                        }),
                        e.jsx('button', {
                          onClick: () => g(!1),
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
      b &&
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
                      onClick: () => w(!1),
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
                          onChange: (x) => p((h) => ({ ...h, type: x.target.value })),
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
                            onChange: (x) => p((h) => ({ ...h, category: x.target.value })),
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
                            onChange: (x) => p((h) => ({ ...h, message: x.target.value })),
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
                              ' ',
                              '(€)',
                            ],
                          }),
                          e.jsx('input', {
                            type: 'number',
                            value: d.discount,
                            onChange: (x) =>
                              p((h) => ({ ...h, discount: parseFloat(x.target.value) || 0 })),
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
                          onClick: r,
                          disabled:
                            !d.type ||
                            (d.type === 'category' && !d.category) ||
                            (d.type === 'message' && !d.message.trim()),
                          className: `${t.btnPrimary} flex-1 disabled:opacity-50 disabled:cursor-not-allowed`,
                          children: '🚀 Esegui Operazione',
                        }),
                        e.jsx('button', {
                          onClick: () => w(!1),
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
function de({ state: a, setState: t, onOpenStats: i, playersById: l, T: n }) {
  const { user: u } = K(),
    [d, p] = j.useState(null),
    [v, g] = j.useState(!1),
    [b, w] = j.useState(null),
    [k, C] = j.useState('all'),
    [c, s] = j.useState(''),
    [o, y] = j.useState(!1),
    r = Array.isArray(a?.players) ? a.players : [],
    x = j.useMemo(() => (d && r.find((f) => f.id === d)) || null, [r, d]),
    h = j.useMemo(() => {
      let f = [...r];
      if ((k !== 'all' && (f = f.filter((A) => A.category === k)), c.trim())) {
        const A = c.toLowerCase();
        f = f.filter(
          ($) =>
            $.name?.toLowerCase().includes(A) ||
            $.email?.toLowerCase().includes(A) ||
            $.phone?.includes(A) ||
            $.firstName?.toLowerCase().includes(A) ||
            $.lastName?.toLowerCase().includes(A)
        );
      }
      return f.sort(T);
    }, [r, k, c]),
    N = j.useMemo(() => {
      const f = r.length,
        A = r.filter((m) => m.category === S.MEMBER).length,
        $ = r.filter((m) => m.isActive !== !1).length,
        D = r.filter((m) => m.isAccountLinked).length;
      return { total: f, members: A, active: $, withAccount: D };
    }, [r]),
    P = (f) => {
      const A = {
        ...U(),
        ...f,
        id: _(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (t(($) => {
        const D = Array.isArray($?.players) ? $.players : [];
        return { ...($ || { players: [], matches: [] }), players: [...D, A] };
      }),
        g(!1));
    },
    B = (f, A) => {
      t(($) => {
        const D = Array.isArray($?.players) ? $.players : [];
        return {
          ...($ || { players: [], matches: [] }),
          players: D.map((m) =>
            m.id === f ? { ...m, ...A, updatedAt: new Date().toISOString() } : m
          ),
        };
      });
    },
    z = (f) => {
      confirm(
        'Sei sicuro di voler eliminare questo giocatore? Questa azione non può essere annullata.'
      ) &&
        (t((A) => {
          const $ = Array.isArray(A?.players) ? A.players : [];
          return { ...(A || { players: [], matches: [] }), players: $.filter((D) => D.id !== f) };
        }),
        p(null));
    },
    R = () => {
      if (!u) return;
      const f = {
        firstName: u.firstName || u.displayName?.split(' ')[0] || '',
        lastName: u.lastName || u.displayName?.split(' ')[1] || '',
        name: u.displayName || `${u.firstName} ${u.lastName}`.trim(),
        email: u.email || '',
        linkedAccountId: u.uid,
        linkedAccountEmail: u.email,
        isAccountLinked: !0,
        category: S.MEMBER,
      };
      P(f);
    };
  return e.jsxs(e.Fragment, {
    children: [
      e.jsxs(X, {
        title: 'CRM Giocatori',
        T: n,
        children: [
          e.jsx('div', {
            className: `${n.cardBg} ${n.border} rounded-xl p-4 xl:p-3 mb-6`,
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
                          children: N.total,
                        }),
                        e.jsx('div', { className: `text-xs ${n.subtext}`, children: 'Totale' }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'text-center',
                      children: [
                        e.jsx('div', {
                          className:
                            'text-2xl xl:text-xl font-bold text-green-600 dark:text-green-400',
                          children: N.members,
                        }),
                        e.jsx('div', { className: `text-xs ${n.subtext}`, children: 'Membri' }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'text-center',
                      children: [
                        e.jsx('div', {
                          className:
                            'text-2xl xl:text-xl font-bold text-orange-600 dark:text-orange-400',
                          children: N.active,
                        }),
                        e.jsx('div', { className: `text-xs ${n.subtext}`, children: 'Attivi' }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'text-center',
                      children: [
                        e.jsx('div', {
                          className:
                            'text-2xl xl:text-xl font-bold text-purple-600 dark:text-purple-400',
                          children: N.withAccount,
                        }),
                        e.jsx('div', {
                          className: `text-xs ${n.subtext}`,
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
                      onClick: () => g(!0),
                      className: `${n.btnPrimary} px-4 py-2 text-sm`,
                      children: '➕ Nuovo Giocatore',
                    }),
                    e.jsx('button', {
                      onClick: R,
                      disabled: !u,
                      className: `${n.btnSecondary} px-4 py-2 text-sm`,
                      children: '👤 Crea da Account',
                    }),
                    e.jsx('button', {
                      onClick: () => y(!0),
                      className: `${n.btnSecondary} px-4 py-2 text-sm`,
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
                  onChange: (f) => s(f.target.value),
                  className: `${n.input} w-full`,
                }),
              }),
              e.jsx('div', {
                className: 'flex gap-2 shrink-0',
                children: e.jsxs('select', {
                  value: k,
                  onChange: (f) => C(f.target.value),
                  className: `${n.input} min-w-[150px]`,
                  children: [
                    e.jsx('option', { value: 'all', children: 'Tutte le categorie' }),
                    e.jsx('option', { value: S.MEMBER, children: 'Membri' }),
                    e.jsx('option', { value: S.NON_MEMBER, children: 'Non Membri' }),
                    e.jsx('option', { value: S.GUEST, children: 'Ospiti' }),
                    e.jsx('option', { value: S.VIP, children: 'VIP' }),
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
                    className: `text-center py-12 ${n.cardBg} ${n.border} rounded-xl`,
                    children: [
                      e.jsx('div', { className: 'text-6xl mb-4', children: '👥' }),
                      e.jsx('h3', {
                        className: `text-xl font-bold mb-2 ${n.text}`,
                        children: 'Nessun giocatore trovato',
                      }),
                      e.jsx('p', {
                        className: `${n.subtext} mb-4`,
                        children:
                          c || k !== 'all'
                            ? 'Prova a modificare i filtri di ricerca'
                            : 'Inizia aggiungendo il primo giocatore al tuo CRM',
                      }),
                      e.jsx('button', {
                        onClick: () => g(!0),
                        className: `${n.btnPrimary} px-6 py-3`,
                        children: '➕ Aggiungi Primo Giocatore',
                      }),
                    ],
                  })
                : e.jsx('div', {
                    className:
                      'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 [@media(min-width:2200px)]:grid-cols-5 items-stretch',
                    children: h.map((f) =>
                      e.jsx(
                        te,
                        {
                          player: f,
                          playersById: l,
                          onEdit: () => {
                            (w(f), g(!0));
                          },
                          onDelete: () => z(f.id),
                          onView: () => p(f.id),
                          onStats: () => i?.(f.id),
                          T: n,
                        },
                        f.id
                      )
                    ),
                  }),
          }),
        ],
      }),
      x &&
        e.jsx(G, {
          isOpen: !0,
          onClose: () => p(null),
          title: `${x.name || 'Giocatore'} - Dettagli`,
          size: 'large',
          children: e.jsx(re, {
            player: x,
            onUpdate: (f) => B(x.id, f),
            onClose: () => p(null),
            T: n,
          }),
        }),
      v &&
        e.jsx(G, {
          isOpen: !0,
          onClose: () => {
            (g(!1), w(null));
          },
          title: b ? 'Modifica Giocatore' : 'Nuovo Giocatore',
          size: 'large',
          children: e.jsx(se, {
            player: b,
            onSave: b
              ? (f) => {
                  (B(b.id, f), g(!1), w(null));
                }
              : P,
            onCancel: () => {
              (g(!1), w(null));
            },
            T: n,
          }),
        }),
      o &&
        e.jsx(G, {
          isOpen: !0,
          onClose: () => y(!1),
          title: 'Strumenti CRM',
          size: 'large',
          children: e.jsx(ce, {
            players: r,
            onClose: () => y(!1),
            onBulkOperation: (f) => {
              console.log('Bulk operation:', f);
            },
            onRefreshData: () => {
              console.log('Refreshing data...');
            },
            T: n,
          }),
        }),
    ],
  });
}
function je() {
  const a = Z(),
    { state: t, setState: i, playersById: l } = H(),
    { clubMode: n } = Y(),
    u = J.useMemo(() => Q(), []),
    d = (p) => {
      a(`/stats?player=${p}`);
    };
  return n
    ? e.jsx(de, { T: u, state: t, setState: i, onOpenStats: d, playersById: l })
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
export { je as default };
