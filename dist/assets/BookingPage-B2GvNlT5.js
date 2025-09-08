import { j as e, u as ke, f as $e, t as De } from './index-oP5O6b6Q.js';
import { r as n, b as Ae } from './router-CwEi7VLz.js';
import { s as Be, i as K, B as J, g as w, c as Ce } from './bookings-BfW19wQf.js';
import { c as A, g as Pe } from './pricing-CpqSxGe3.js';
import { loadActiveUserBookings as Ee } from './cloud-bookings-CWOpYfom.js';
import './vendor-D3F3s8fL.js';
import './firebase-jcIpuiEY.js';
const B = { xs: 'p-1', sm: 'p-2', md: 'p-4', elementMb: 'mb-3' },
  p = {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-bold',
    h3: 'text-xl font-semibold',
    body: 'text-base',
    bodySm: 'text-sm',
    bodyXs: 'text-xs',
    label: 'text-xs uppercase tracking-wide font-medium',
    medium: 'font-medium',
  },
  S = {
    flexBetween: 'flex items-center justify-between',
    flexCenter: 'flex items-center justify-center',
    grid3: 'grid grid-cols-1 md:grid-cols-3',
    grid4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  },
  L = {
    success: 'text-emerald-500',
    error: 'text-rose-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  },
  he = {
    card: 'shadow-[0_0_0_1px_rgba(0,0,0,0.02)] shadow-sm',
    cardHover: 'shadow-[0_0_0_1px_rgba(0,0,0,0.04)] shadow-md',
  },
  G = { md: 'rounded-md', xl: 'rounded-xl', xxl: 'rounded-2xl' },
  Ie = { normal: 'transition-all duration-200 ease-in-out' },
  C = {
    card: (s) => `${G.xxl} ${s.cardBg} ${s.border} ${B.md} ${he.card}`,
    cardHover: (s) => `${G.xxl} ${s.cardBg} ${s.border} ${B.md} ${he.cardHover} ${Ie.normal}`,
    sectionHeader: (s) => `${S.flexBetween} ${B.elementMb}`,
    sectionTitle: (s) => `${p.h3} ${s.neonText}`,
    btnVariants: {
      primary: (s) => s.btnPrimary,
      ghost: (s) => s.btnGhost,
      ghostSm: (s) => s.btnGhostSm,
    },
    input: (s) => s.input,
    statCard: (s) => `${C.card(s)} text-center`,
    listItem: (s) => `${G.xl} ${s.cardBg} ${s.border} ${B.sm} ${S.flexBetween}`,
    badge: (s) => `inline-flex items-center ${B.xs} ${G.md} ${p.bodyXs} ${p.medium}`,
    skeleton: 'animate-pulse bg-gray-200 rounded',
  };
function ze(s) {
  return {
    card: C.card(s),
    cardHover: C.cardHover(s),
    sectionHeader: C.sectionHeader(s),
    sectionTitle: C.sectionTitle(s),
    flexBetween: S.flexBetween,
    flexCenter: S.flexCenter,
    grid3: S.grid3,
    grid4: S.grid4,
    h1: `${p.h1} ${s.text}`,
    h2: `${p.h2} ${s.text}`,
    h3: `${p.h3} ${s.text}`,
    body: `${p.body} ${s.text}`,
    bodySm: `${p.bodySm} ${s.subtext}`,
    label: `${p.label} ${s.subtext}`,
    btnPrimary: s.btnPrimary,
    btnGhost: s.btnGhost,
    btnGhostSm: s.btnGhostSm,
    input: s.input,
    success: L.success,
    error: L.error,
    warning: L.warning,
    info: L.info,
  };
}
function Me({ user: s, T: y, state: g, setState: P }) {
  ze(y);
  const d = g?.bookingConfig || {
      slotMinutes: 30,
      dayStartHour: 8,
      dayEndHour: 23,
      defaultDurations: [60, 90, 120],
      addons: {},
    },
    h = Array.isArray(g?.courts) ? g.courts : [],
    Z = n.useRef(null),
    F = n.useRef(null),
    [i, ee] = n.useState(''),
    [o, U] = n.useState(''),
    [c, E] = n.useState(null),
    [u, ue] = n.useState(60),
    [I, ge] = n.useState(!0),
    [k, te] = n.useState(!1),
    [f, Y] = n.useState(!1),
    [Te, be] = n.useState(''),
    [He, pe] = n.useState(''),
    [b, Q] = n.useState([]),
    [z, W] = n.useState(''),
    [se, N] = n.useState(!1),
    [fe, ae] = n.useState(!1),
    [je, re] = n.useState(!1),
    [M, v] = n.useState([]),
    [_e, T] = n.useState([]),
    [Oe, H] = n.useState([]),
    [_, q] = n.useState(!1),
    [V, j] = n.useState(null);
  n.useEffect(() => {
    (Be(!!s?.uid, s),
      (async () => {
        try {
          const a = await w();
          (v(a), s ? await ne() : (T([]), H([])));
        } catch {}
      })());
  }, [s]);
  const ne = async () => {
    if (!s) {
      (T([]), H([]));
      return;
    }
    try {
      if (s.uid) {
        const t = await Ee(s.uid);
        (H(t), T(t));
      }
    } catch {
      (T([]), H([]));
    }
  };
  n.useEffect(() => {
    let t = !1;
    return (
      (async () => {
        try {
          const r = await w(),
            l = ye(g?.bookings || []),
            m = new Map();
          for (const x of [...r, ...l]) m.set(x.id, x);
          t || v(Array.from(m.values()));
        } catch {}
      })(),
      () => {
        t = !0;
      }
    );
  }, [g?.bookings, g?._rev]);
  const ye = (t) =>
      Array.isArray(t)
        ? t.map((a) => {
            const r = new Date(a.start),
              l = r.toISOString().split('T')[0],
              m = String(r.getHours()).padStart(2, '0'),
              x = String(r.getMinutes()).padStart(2, '0');
            return {
              id: a.id || `${a.courtId}-${a.start}`,
              courtId: a.courtId,
              courtName: '',
              date: l,
              time: `${m}:${x}`,
              duration: a.duration || 60,
              status: a.status || 'booked',
            };
          })
        : [],
    ie = (t, a = 100) => {
      t?.current &&
        setTimeout(() => {
          t.current &&
            t.current.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        }, a);
    };
  (n.useEffect(() => {
    if (!i) {
      const t = new Date(),
        a = t.getFullYear(),
        r = String(t.getMonth() + 1).padStart(2, '0'),
        l = String(t.getDate()).padStart(2, '0');
      ee(`${a}-${r}-${l}`);
    }
  }, [i]),
    n.useEffect(() => {
      c && !c.hasHeating && f && Y(!1);
    }, [c, f]),
    n.useEffect(() => {
      o &&
        F.current &&
        setTimeout(() => {
          ie(F, 50);
        }, 100);
    }, [o]));
  const O = n.useCallback((t, a, r) => K(t, a, r, u, M), [u, M]),
    Ne = n.useMemo(() => {
      const t = [],
        a = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];
      for (let r = 0; r < 7; r++) {
        const l = new Date();
        l.setDate(l.getDate() + r);
        const m = l.getFullYear(),
          x = String(l.getMonth() + 1).padStart(2, '0'),
          $ = String(l.getDate()).padStart(2, '0'),
          D = `${m}-${x}-${$}`;
        t.push({
          date: D,
          dayName: a[l.getDay()],
          dayNumber: l.getDate(),
          monthName: l.toLocaleDateString('it-IT', { month: 'short' }),
          isToday: r === 0,
        });
      }
      return t;
    }, []),
    le = n.useMemo(() => {
      const t = [],
        a = d.dayStartHour || 8,
        r = d.dayEndHour || 23,
        l = d.slotMinutes || 30,
        m = new Date(),
        x = new Date().toISOString().split('T')[0];
      for (let $ = a; $ < r; $++)
        for (let D = 0; D < 60; D += l) {
          const X = `${String($).padStart(2, '0')}:${String(D).padStart(2, '0')}`;
          if (i === x && new Date(`${i}T${X}:00`) <= m) continue;
          const ce = h.filter((xe) => O(xe.id, i, X)),
            me = ce.length > 0;
          (!I || me) &&
            t.push({ time: X, isAvailable: me, availableCourts: ce.length, totalCourts: h.length });
        }
      return t;
    }, [i, u, M, h, O, I, d]),
    ve = (t, a) => (a && Pe(a, d, t, h).isPromo) || !1,
    oe = async () => {
      if (!s) {
        j({ type: 'error', text: 'Devi effettuare il login per prenotare un campo' });
        return;
      }
      if (!i || !o || !c) {
        j({ type: 'error', text: 'Seleziona data, orario e campo' });
        return;
      }
      if (!K(c.id, i, o, u, M)) {
        (re(!0),
          setTimeout(() => {
            re(!1);
          }, 3e3));
        const a = await w();
        v(a);
        return;
      }
      (q(!0), j(null));
      try {
        const a = {
            courtId: c.id,
            courtName: c.name,
            date: i,
            time: o,
            duration: u,
            lighting: !!k,
            heating: !!f,
            price: A(new Date(`${i}T${o}:00`), u, d, { lighting: !!k, heating: !!f }, c.id, h),
            userPhone: '',
            notes: '',
            players: [s.displayName || s.email, ...b.map((m) => m.name)],
          },
          r = await Ce(a, s);
        if (!r) {
          (j({
            type: 'error',
            text: 'Errore nel salvare la prenotazione. Potrebbe essere già stata prenotata da qualcun altro.',
          }),
            q(!1));
          const m = await w();
          v(m);
          return;
        }
        const l = await w();
        if ((v(l), await ne(), g && P)) {
          const m = {
            id: r.id,
            courtId: r.courtId,
            start: new Date(`${r.date}T${r.time}:00`).toISOString(),
            duration: r.duration,
            players: [],
            playerNames: b.map((x) => x.name),
            guestNames: b.map((x) => x.name),
            price: r.price,
            note: r.notes || '',
            bookedByName: r.bookedBy || '',
            addons: { lighting: !!r.lighting, heating: !!r.heating },
            status: 'booked',
            createdAt: Date.now(),
          };
          P((x) => ({ ...x, bookings: [...(x.bookings || []), m] }));
        }
        (ae(!0),
          setTimeout(() => {
            ae(!1);
          }, 3e3),
          U(''),
          E(null),
          te(!1),
          Y(!1),
          be(''),
          pe(''),
          Q([]),
          W(''),
          N(!1),
          j({
            type: 'success',
            text: `Prenotazione confermata! Campo ${c?.name} il ${new Date(i).toLocaleDateString('it-IT')} alle ${o}`,
          }));
      } catch {
        j({ type: 'error', text: 'Errore durante la prenotazione. Riprova.' });
      } finally {
        q(!1);
      }
    },
    we = async (t) => {
      if (!t.isAvailable) return;
      try {
        const r = await w();
        if ((v(r), !h.some((m) => K(m.id, i, t.time, u, r)))) {
          j({
            type: 'error',
            text: 'Questo orario è appena stato prenotato. Seleziona un altro slot.',
          });
          return;
        }
      } catch (r) {
        console.warn("Errore nell'aggiornamento delle prenotazioni:", r);
      }
      U(t.time);
      const a = h.filter((r) => O(r.id, i, t.time));
      a.length === 1 && (E(a[0]), N(!0));
    },
    de = () => {
      z.trim() && b.length < 3 && (Q([...b, { id: Date.now(), name: z.trim() }]), W(''));
    },
    Se = (t) => {
      Q(b.filter((a) => a.id !== t));
    },
    R = c && i && o ? A(new Date(`${i}T${o}:00`), u, d, { lighting: k, heating: f }, c.id, h) : 0;
  return e.jsxs('div', {
    className: 'min-h-screen bg-gray-50',
    children: [
      e.jsx('div', {
        className: 'bg-white border-b px-4 py-3 sm:hidden',
        children: e.jsx('h1', {
          className: 'text-lg font-semibold text-gray-900',
          children: 'Prenota Campo',
        }),
      }),
      e.jsxs('div', {
        className: 'max-w-6xl mx-auto px-4 py-6',
        children: [
          V &&
            e.jsx('div', {
              className: `mb-6 p-3 sm:p-4 rounded-lg text-sm ${V.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`,
              children: V.text,
            }),
          e.jsxs('div', {
            className: 'bg-white rounded-lg shadow-sm border p-3 sm:p-6 mb-4 sm:mb-6',
            children: [
              e.jsx('h2', {
                className: 'font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base',
                children: 'Seleziona il giorno',
              }),
              e.jsx('div', {
                className: 'overflow-x-auto scrollbar-hide',
                children: e.jsx('div', {
                  className: 'flex gap-2 pb-2',
                  style: { minWidth: 'max-content' },
                  children: Ne.slice(0, 10).map((t) =>
                    e.jsxs(
                      'button',
                      {
                        onClick: () => {
                          (ee(t.date), U(''), E(null), ie(Z, 200));
                        },
                        className: `flex-shrink-0 p-2 sm:p-3 rounded-lg border text-center transition-all min-w-[60px] sm:min-w-[80px] ${i === t.date ? 'bg-blue-500 text-white border-blue-500 shadow-md' : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100'}`,
                        children: [
                          e.jsx('div', {
                            className: 'text-xs font-medium mb-1',
                            children: t.dayName,
                          }),
                          e.jsx('div', {
                            className: 'text-base sm:text-lg font-bold',
                            children: t.dayNumber,
                          }),
                          e.jsx('div', { className: 'text-xs opacity-75', children: t.monthName }),
                        ],
                      },
                      t.date
                    )
                  ),
                }),
              }),
            ],
          }),
          i &&
            e.jsxs('div', {
              ref: Z,
              className: 'bg-white rounded-lg shadow-sm border p-3 sm:p-6 mb-4 sm:mb-6',
              children: [
                e.jsxs('div', {
                  className:
                    'flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3',
                  children: [
                    e.jsx('h2', {
                      className: 'font-semibold text-gray-900 text-sm sm:text-base',
                      children: "Seleziona l'orario",
                    }),
                    e.jsxs('label', {
                      className: 'flex items-center gap-2 text-xs sm:text-sm',
                      children: [
                        e.jsx('input', {
                          type: 'checkbox',
                          checked: I,
                          onChange: (t) => ge(t.target.checked),
                          className: 'rounded text-blue-500',
                        }),
                        e.jsx('span', {
                          className: 'text-gray-600',
                          children: 'Solo orari disponibili',
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx('div', {
                  className: 'grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-8 gap-2',
                  children: le.map((t) =>
                    e.jsxs(
                      'button',
                      {
                        onClick: () => we(t),
                        disabled: !t.isAvailable,
                        className: `p-3 sm:p-3 rounded-lg border text-center transition-all relative min-h-[56px] touch-manipulation ${o === t.time ? 'bg-blue-500 text-white border-blue-500 shadow-md' : t.isAvailable ? 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer active:bg-blue-100' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}`,
                        children: [
                          e.jsx('div', {
                            className: 'font-medium text-sm sm:text-base',
                            children: t.time,
                          }),
                          !t.isAvailable &&
                            e.jsx('div', { className: 'text-xs mt-1', children: 'Occupato' }),
                        ],
                      },
                      t.time
                    )
                  ),
                }),
                le.length === 0 &&
                  e.jsx('div', {
                    className: 'text-center py-8 text-gray-500',
                    children: I
                      ? 'Nessun orario disponibile per questo giorno'
                      : 'Nessun orario configurato',
                  }),
              ],
            }),
          o &&
            e.jsxs('div', {
              ref: F,
              className: 'bg-white rounded-lg shadow-sm border p-3 sm:p-6 mb-4 sm:mb-6',
              children: [
                e.jsx('h2', {
                  className: 'font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base',
                  children: 'Prenota un campo',
                }),
                e.jsx('div', {
                  className: 'space-y-3 sm:space-y-4',
                  children: h.map((t) => {
                    const a = O(t.id, i, o);
                    return e.jsx(
                      'div',
                      {
                        onClick: () => {
                          a && (E(t), N(!0));
                        },
                        className: `border rounded-lg p-3 sm:p-4 transition-all touch-manipulation ${a ? 'hover:shadow-md cursor-pointer hover:border-blue-300 active:bg-gray-50' : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-75'}`,
                        children: e.jsxs('div', {
                          className: 'flex justify-between items-start',
                          children: [
                            e.jsxs('div', {
                              className: 'flex-1',
                              children: [
                                e.jsxs('div', {
                                  className: 'flex items-center gap-2 mb-2',
                                  children: [
                                    e.jsx('h3', {
                                      className: `font-semibold text-sm sm:text-base ${a ? 'text-gray-900' : 'text-gray-500'}`,
                                      children: t.name,
                                    }),
                                    a &&
                                      t.premium &&
                                      e.jsx(J, {
                                        variant: 'warning',
                                        size: 'xs',
                                        T: y,
                                        children: 'Premium',
                                      }),
                                    a &&
                                      i &&
                                      o &&
                                      ve(t.id, new Date(`${i}T${o}:00`)) &&
                                      e.jsx(J, {
                                        variant: 'success',
                                        size: 'xs',
                                        T: y,
                                        children: '🏷️ Promo',
                                      }),
                                  ],
                                }),
                                a &&
                                  t.features &&
                                  t.features.length > 0 &&
                                  e.jsx('div', {
                                    className: 'flex flex-wrap gap-1 mb-2',
                                    children: t.features.map((r, l) =>
                                      e.jsx(
                                        J,
                                        { variant: 'default', size: 'xs', T: y, children: r },
                                        l
                                      )
                                    ),
                                  }),
                              ],
                            }),
                            e.jsx('div', {
                              className: 'text-right',
                              children: a
                                ? e.jsxs(e.Fragment, {
                                    children: [
                                      e.jsxs('div', {
                                        className: 'text-xl sm:text-2xl font-bold text-blue-600',
                                        children: [
                                          A(new Date(`${i}T${o}:00`), 90, d, {}, t.id, h),
                                          '€',
                                        ],
                                      }),
                                      e.jsx('div', {
                                        className: 'text-xs sm:text-sm text-gray-500',
                                        children: '90 minuti',
                                      }),
                                      e.jsxs('div', {
                                        className: 'text-xs text-gray-400 mt-1',
                                        children: [
                                          (
                                            A(new Date(`${i}T${o}:00`), 90, d, {}, t.id, h) / 4
                                          ).toFixed(1),
                                          '€ a persona',
                                        ],
                                      }),
                                    ],
                                  })
                                : e.jsxs('div', {
                                    className: 'text-center',
                                    children: [
                                      e.jsx('div', {
                                        className: 'text-lg font-bold text-red-500 mb-1',
                                        children: 'Non disponibile',
                                      }),
                                      e.jsx('div', {
                                        className: 'text-xs text-red-400',
                                        children: 'Già prenotato',
                                      }),
                                    ],
                                  }),
                            }),
                          ],
                        }),
                      },
                      t.id
                    );
                  }),
                }),
              ],
            }),
        ],
      }),
      se &&
        c &&
        e.jsx('div', {
          className:
            'fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 backdrop-fade',
          children: e.jsxs('div', {
            className:
              'bg-white w-full h-auto max-h-[95vh] sm:max-w-md sm:max-h-[90vh] sm:rounded-lg rounded-t-2xl sm:rounded-t-lg flex flex-col slide-up-mobile sm:animate-none shadow-2xl',
            children: [
              e.jsx('div', {
                className: 'flex justify-center pt-2 pb-1 sm:hidden',
                children: e.jsx('div', { className: 'w-10 h-1 bg-gray-300 rounded-full' }),
              }),
              e.jsx('div', {
                className: 'px-4 py-3 sm:p-6 border-b flex-shrink-0 touch-select-none',
                children: e.jsxs('div', {
                  className: 'flex justify-between items-center',
                  children: [
                    e.jsx('h3', {
                      className: 'text-lg sm:text-xl font-semibold text-gray-900',
                      children: 'Conferma Prenotazione',
                    }),
                    e.jsx('button', {
                      onClick: () => N(!1),
                      className:
                        'w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 touch-manipulation tap-highlight-transparent text-gray-500 hover:text-gray-700',
                      children: e.jsx('span', { className: 'text-lg sm:text-base', children: '✕' }),
                    }),
                  ],
                }),
              }),
              e.jsxs('div', {
                className: 'flex-1 overflow-y-auto px-4 py-4 sm:p-6',
                children: [
                  e.jsxs('div', {
                    className:
                      'bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl mb-6 border border-blue-200',
                    children: [
                      e.jsxs('div', {
                        className: 'flex items-center gap-3 mb-3',
                        children: [
                          e.jsx('div', {
                            className:
                              'w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center',
                            children: e.jsx('span', {
                              className: 'text-white text-sm',
                              children: '🎾',
                            }),
                          }),
                          e.jsx('h4', {
                            className: 'font-semibold text-gray-900 text-lg',
                            children: c.name,
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        className: 'grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-700',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx('span', { className: 'text-blue-500', children: '📅' }),
                              e.jsx('span', {
                                children: new Date(i).toLocaleDateString('it-IT', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                }),
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx('span', { className: 'text-blue-500', children: '🕐' }),
                              e.jsx('span', { children: o }),
                            ],
                          }),
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx('span', { className: 'text-blue-500', children: '⏱️' }),
                              e.jsxs('span', { children: [u, ' min'] }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'mb-6',
                    children: [
                      e.jsx('label', {
                        className: 'block text-sm font-semibold mb-3 text-gray-900',
                        children: 'Durata partita',
                      }),
                      e.jsx('div', {
                        className: 'grid grid-cols-3 gap-3',
                        children: [60, 90, 120].map((t) => {
                          const a = A(
                              new Date(`${i}T${o}:00`),
                              t,
                              d,
                              { lighting: k, heating: f },
                              c.id,
                              h
                            ),
                            r = (a / 4).toFixed(1);
                          return e.jsxs(
                            'button',
                            {
                              onClick: () => ue(t),
                              className: `p-4 rounded-xl border-2 text-center transition-all touch-manipulation ${u === t ? 'bg-blue-500 text-white border-blue-500 shadow-lg scale-105' : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100'}`,
                              children: [
                                e.jsxs('div', {
                                  className: 'font-bold text-lg',
                                  children: [t, 'min'],
                                }),
                                e.jsxs('div', {
                                  className: 'text-lg font-bold mt-1',
                                  children: [a, '€'],
                                }),
                                e.jsxs('div', {
                                  className: 'text-xs opacity-75 mt-1',
                                  children: [r, '€/persona'],
                                }),
                              ],
                            },
                            t
                          );
                        }),
                      }),
                    ],
                  }),
                  (d.addons?.lightingEnabled || d.addons?.heatingEnabled) &&
                    e.jsxs('div', {
                      className: 'mb-6',
                      children: [
                        e.jsx('label', {
                          className: 'block text-sm font-semibold mb-3 text-gray-900',
                          children: 'Servizi Extra',
                        }),
                        e.jsxs('div', {
                          className: 'space-y-3',
                          children: [
                            d.addons?.lightingEnabled &&
                              e.jsxs('label', {
                                className:
                                  'flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 touch-manipulation',
                                children: [
                                  e.jsx('input', {
                                    type: 'checkbox',
                                    checked: k,
                                    onChange: (t) => te(t.target.checked),
                                    className: 'rounded w-5 h-5 text-blue-500',
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex-1',
                                    children: [
                                      e.jsx('div', {
                                        className: 'text-sm font-medium text-gray-900',
                                        children: 'Illuminazione',
                                      }),
                                      e.jsxs('div', {
                                        className: 'text-xs text-gray-600',
                                        children: ['+', d.addons?.lightingFee || 0, '€'],
                                      }),
                                    ],
                                  }),
                                  e.jsx('span', { className: 'text-2xl', children: '💡' }),
                                ],
                              }),
                            d.addons?.heatingEnabled &&
                              c?.hasHeating &&
                              e.jsxs('label', {
                                className:
                                  'flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 touch-manipulation',
                                children: [
                                  e.jsx('input', {
                                    type: 'checkbox',
                                    checked: f,
                                    onChange: (t) => Y(t.target.checked),
                                    className: 'rounded w-5 h-5 text-blue-500',
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex-1',
                                    children: [
                                      e.jsx('div', {
                                        className: 'text-sm font-medium text-gray-900',
                                        children: 'Riscaldamento',
                                      }),
                                      e.jsxs('div', {
                                        className: 'text-xs text-gray-600',
                                        children: ['+', d.addons?.heatingFee || 0, '€'],
                                      }),
                                    ],
                                  }),
                                  e.jsx('span', { className: 'text-2xl', children: '🔥' }),
                                ],
                              }),
                          ],
                        }),
                      ],
                    }),
                  e.jsxs('div', {
                    className: 'mb-6',
                    children: [
                      e.jsxs('label', {
                        className: 'block text-sm font-semibold mb-3 text-gray-900',
                        children: ['Giocatori (', 1 + b.length, '/4)'],
                      }),
                      e.jsx('div', {
                        className: 'mb-3 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500',
                        children: e.jsxs('div', {
                          className: 'flex items-center gap-3',
                          children: [
                            e.jsx('div', {
                              className:
                                'w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center',
                              children: e.jsx('span', {
                                className: 'text-white text-sm',
                                children: '👑',
                              }),
                            }),
                            e.jsxs('div', {
                              className: 'flex-1',
                              children: [
                                e.jsx('div', {
                                  className: 'text-sm font-semibold text-gray-900',
                                  children: s?.displayName || s?.email,
                                }),
                                e.jsx('div', {
                                  className: 'text-xs text-blue-600 font-medium',
                                  children: 'Organizzatore',
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                      e.jsx('div', {
                        className: 'space-y-2 mb-4',
                        children: b.map((t, a) =>
                          e.jsxs(
                            'div',
                            {
                              className: 'p-3 bg-gray-50 rounded-xl flex items-center gap-3',
                              children: [
                                e.jsx('div', {
                                  className:
                                    'w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center',
                                  children: e.jsx('span', {
                                    className: 'text-white text-sm',
                                    children: '👤',
                                  }),
                                }),
                                e.jsxs('div', {
                                  className: 'flex-1',
                                  children: [
                                    e.jsx('div', {
                                      className: 'text-sm font-medium text-gray-900',
                                      children: t.name,
                                    }),
                                    e.jsxs('div', {
                                      className: 'text-xs text-gray-500',
                                      children: ['Giocatore ', a + 2],
                                    }),
                                  ],
                                }),
                                e.jsx('button', {
                                  onClick: () => Se(t.id),
                                  className:
                                    'w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center touch-manipulation transition-colors',
                                  children: e.jsx('span', { className: 'text-sm', children: '✕' }),
                                }),
                              ],
                            },
                            t.id
                          )
                        ),
                      }),
                      b.length < 3 &&
                        e.jsxs('div', {
                          className: 'flex gap-3',
                          children: [
                            e.jsx('input', {
                              type: 'text',
                              value: z,
                              onChange: (t) => W(t.target.value),
                              onKeyDown: (t) => t.key === 'Enter' && de(),
                              placeholder: 'Nome nuovo giocatore',
                              className:
                                'flex-1 p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none',
                            }),
                            e.jsx('button', {
                              onClick: de,
                              disabled: !z.trim(),
                              className:
                                'px-6 py-3 bg-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation hover:bg-blue-600 transition-colors',
                              children: 'Aggiungi',
                            }),
                          ],
                        }),
                    ],
                  }),
                  e.jsxs('div', {
                    className:
                      'bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200 mb-6',
                    children: [
                      e.jsxs('div', {
                        className: 'flex justify-between items-center mb-2',
                        children: [
                          e.jsx('span', {
                            className: 'font-semibold text-gray-900',
                            children: 'Totale partita',
                          }),
                          e.jsxs('span', {
                            className: 'text-2xl font-bold text-green-600',
                            children: [R, '€'],
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        className: 'flex justify-between items-center',
                        children: [
                          e.jsx('span', {
                            className: 'text-sm text-gray-600',
                            children: 'Costo per persona',
                          }),
                          e.jsxs('span', {
                            className: 'text-lg font-semibold text-green-600',
                            children: [(R / 4).toFixed(1), '€'],
                          }),
                        ],
                      }),
                      e.jsx('div', {
                        className: 'mt-2 pt-2 border-t border-green-200',
                        children: e.jsx('div', {
                          className: 'text-xs text-green-700 font-medium',
                          children: '💰 Pagamento in loco',
                        }),
                      }),
                    ],
                  }),
                ],
              }),
              e.jsx('div', {
                className: 'p-4 sm:p-6 border-t bg-white flex-shrink-0 lg:hidden',
                children: e.jsx('div', { className: 'h-24' }),
              }),
              e.jsx('div', {
                className: 'p-4 sm:p-6 border-t bg-white flex-shrink-0 hidden lg:block',
                children: e.jsxs('div', {
                  className: 'flex gap-3',
                  children: [
                    e.jsx('button', {
                      onClick: () => N(!1),
                      className:
                        'flex-1 py-4 px-4 border-2 border-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 touch-manipulation transition-colors',
                      children: 'Annulla',
                    }),
                    e.jsx('button', {
                      onClick: oe,
                      disabled: _ || !s,
                      className:
                        'flex-2 py-4 px-6 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transition-colors shadow-lg',
                      children: _
                        ? e.jsxs('div', {
                            className: 'flex items-center justify-center gap-2',
                            children: [
                              e.jsx('div', {
                                className:
                                  'w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin',
                              }),
                              'Prenotando...',
                            ],
                          })
                        : `Conferma - ${R}€`,
                    }),
                  ],
                }),
              }),
            ],
          }),
        }),
      se &&
        c &&
        i &&
        o &&
        e.jsx('div', {
          className: 'lg:hidden fixed bottom-24 left-4 right-4 z-[99999]',
          children: e.jsxs('div', {
            className: 'flex gap-3',
            children: [
              e.jsx('button', {
                onClick: () => N(!1),
                className:
                  'flex-1 backdrop-blur-md bg-white/90 border border-gray-200/50 text-gray-700 py-3 px-4 rounded-xl font-medium text-sm transition-all shadow-lg hover:bg-white/95',
                children: 'Annulla',
              }),
              e.jsx('button', {
                onClick: oe,
                disabled: _ || !s,
                className:
                  'flex-1 backdrop-blur-md bg-blue-600/90 text-white py-3 px-4 rounded-xl font-medium text-sm transition-all shadow-lg hover:bg-blue-600/95 disabled:opacity-50 disabled:cursor-not-allowed',
                children: _
                  ? e.jsxs('div', {
                      className: 'flex items-center justify-center gap-1',
                      children: [
                        e.jsx('div', {
                          className:
                            'w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin',
                        }),
                        e.jsx('span', { children: 'Prenotando...' }),
                      ],
                    })
                  : `Conferma ${R}€`,
              }),
            ],
          }),
        }),
      fe &&
        e.jsx('div', {
          className:
            'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]',
          children: e.jsxs('div', {
            className: 'bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-bounce',
            children: [
              e.jsx('div', {
                className: 'mb-4',
                children: e.jsx('div', {
                  className:
                    'mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center',
                  children: e.jsx('svg', {
                    className: 'w-8 h-8 text-green-500 animate-pulse',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24',
                    children: e.jsx('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeWidth: 2,
                      d: 'M5 13l4 4L19 7',
                    }),
                  }),
                }),
              }),
              e.jsx('h3', {
                className: 'text-xl font-bold text-gray-900 mb-2',
                children: 'Prenotazione Confermata! 🎾',
              }),
              e.jsx('p', {
                className: 'text-gray-600 text-sm',
                children: 'La tua prenotazione è stata registrata con successo',
              }),
              e.jsx('div', {
                className: 'mt-4 text-xs text-gray-400',
                children: 'Questa finestra si chiuderà automaticamente',
              }),
            ],
          }),
        }),
      je &&
        e.jsx('div', {
          className:
            'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]',
          children: e.jsxs('div', {
            className: 'bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-bounce',
            children: [
              e.jsx('div', {
                className: 'mb-4',
                children: e.jsx('div', {
                  className:
                    'mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center',
                  children: e.jsx('svg', {
                    className: 'w-8 h-8 text-red-500 animate-pulse',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24',
                    children: e.jsx('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeWidth: 2,
                      d: 'M6 18L18 6M6 6l12 12',
                    }),
                  }),
                }),
              }),
              e.jsx('h3', {
                className: 'text-xl font-bold text-gray-900 mb-2',
                children: 'Slot già prenotato! ⚠️',
              }),
              e.jsx('p', {
                className: 'text-gray-600 text-sm',
                children:
                  'Questo orario è già stato prenotato da qualcun altro. Seleziona un altro orario.',
              }),
              e.jsx('div', {
                className: 'mt-4 text-xs text-gray-400',
                children: 'Questa finestra si chiuderà automaticamente',
              }),
            ],
          }),
        }),
    ],
  });
}
function We() {
  const { user: s } = ke(),
    { state: y, setState: g } = $e(),
    P = Ae.useMemo(() => De(), []);
  return e.jsx(Me, { T: P, user: s, state: y, setState: g });
}
export { We as default };
