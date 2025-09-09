import { j as e, u as Oe, f as Ie, t as Re } from './index-mfcpx05w-A0-6VM8D.js';
import { r as o, b as _e } from './router-mfcpx05w-B6EAHESI.js';
import { s as Le, i as K, w as A, B as me, c as Fe } from './bookings-mfcpx05w-CKrSQ_LE.js';
import { i as J, c as z, g as Ge } from './pricing-mfcpx05w-DMaWA4wL.js';
import {
  subscribeToPublicBookings as Ue,
  getPublicBookings as O,
  loadActiveUserBookings as We,
} from './cloud-bookings-mfcpx05w-BNqF8YtB.js';
import './vendor-mfcpx05w-D3F3s8fL.js';
import './firebase-mfcpx05w-BteSMG94.js';
const I = { xs: 'p-1', sm: 'p-2', md: 'p-4', elementMb: 'mb-3' },
  j = {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-bold',
    h3: 'text-xl font-semibold',
    body: 'text-base',
    bodySm: 'text-sm',
    bodyXs: 'text-xs',
    label: 'text-xs uppercase tracking-wide font-medium',
    medium: 'font-medium',
  },
  B = {
    flexBetween: 'flex items-center justify-between',
    flexCenter: 'flex items-center justify-center',
    grid3: 'grid grid-cols-1 md:grid-cols-3',
    grid4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  },
  Z = {
    success: 'text-emerald-500',
    error: 'text-rose-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  },
  De = {
    card: 'shadow-[0_0_0_1px_rgba(0,0,0,0.02)] shadow-sm',
    cardHover: 'shadow-[0_0_0_1px_rgba(0,0,0,0.04)] shadow-md',
  },
  ee = { md: 'rounded-md', xl: 'rounded-xl', xxl: 'rounded-2xl' },
  Qe = { normal: 'transition-all duration-200 ease-in-out' },
  R = {
    card: (s) => `${ee.xxl} ${s.cardBg} ${s.border} ${I.md} ${De.card}`,
    cardHover: (s) => `${ee.xxl} ${s.cardBg} ${s.border} ${I.md} ${De.cardHover} ${Qe.normal}`,
    sectionHeader: (s) => `${B.flexBetween} ${I.elementMb}`,
    sectionTitle: (s) => `${j.h3} ${s.neonText}`,
    btnVariants: {
      primary: (s) => s.btnPrimary,
      ghost: (s) => s.btnGhost,
      ghostSm: (s) => s.btnGhostSm,
    },
    input: (s) => s.input,
    statCard: (s) => `${R.card(s)} text-center`,
    listItem: (s) => `${ee.xl} ${s.cardBg} ${s.border} ${I.sm} ${B.flexBetween}`,
    badge: (s) => `inline-flex items-center ${I.xs} ${ee.md} ${j.bodyXs} ${j.medium}`,
    skeleton: 'animate-pulse bg-gray-200 rounded',
  };
function Ye(s) {
  return {
    card: R.card(s),
    cardHover: R.cardHover(s),
    sectionHeader: R.sectionHeader(s),
    sectionTitle: R.sectionTitle(s),
    flexBetween: B.flexBetween,
    flexCenter: B.flexCenter,
    grid3: B.grid3,
    grid4: B.grid4,
    h1: `${j.h1} ${s.text}`,
    h2: `${j.h2} ${s.text}`,
    h3: `${j.h3} ${s.text}`,
    body: `${j.body} ${s.text}`,
    bodySm: `${j.bodySm} ${s.subtext}`,
    label: `${j.label} ${s.subtext}`,
    btnPrimary: s.btnPrimary,
    btnGhost: s.btnGhost,
    btnGhostSm: s.btnGhostSm,
    input: s.input,
    success: Z.success,
    error: Z.error,
    warning: Z.warning,
    info: Z.info,
  };
}
function qe({ user: s, T: k, state: S, setState: _ }) {
  Ye(k);
  const x = S?.bookingConfig || {
      slotMinutes: 30,
      dayStartHour: 8,
      dayEndHour: 23,
      defaultDurations: [60, 90, 120],
      addons: {},
    },
    u = Array.isArray(S?.courts) ? S.courts : [],
    $ = o.useMemo(() => {
      let t = x?.defaultDurations;
      if (
        (typeof t == 'string' &&
          (t = t
            .split(',')
            .map((a) => parseInt(String(a).trim(), 10))
            .filter((a) => !Number.isNaN(a))),
        !Array.isArray(t) || t.length === 0)
      )
        return [60, 90, 120];
      const n = Array.from(
        new Set(t.filter((a) => [30, 45, 60, 75, 90, 105, 120, 150].includes(Number(a))))
      )
        .map(Number)
        .sort((a, r) => a - r);
      return n.length ? n : [60, 90, 120];
    }, [x?.defaultDurations]),
    xe = o.useRef(null),
    te = o.useRef(null),
    [i, ue] = o.useState(''),
    [l, se] = o.useState(''),
    [c, L] = o.useState(null),
    [h, ae] = o.useState(60),
    [F, Ce] = o.useState(!0),
    [P, he] = o.useState(!1),
    [w, ne] = o.useState(!1),
    [Ve, Ae] = o.useState(''),
    [Xe, Be] = o.useState(''),
    [y, ie] = o.useState([]),
    [G, re] = o.useState(''),
    [be, D] = o.useState(!1),
    [Pe, ge] = o.useState(!1),
    [Me, fe] = o.useState(!1),
    [f, C] = o.useState([]),
    [Ke, U] = o.useState([]),
    [Je, W] = o.useState([]),
    [Q, oe] = o.useState(!1),
    [le, N] = o.useState(null);
  (o.useEffect(() => {
    $.includes(h) || ae($[0] || 60);
  }, [$.join(',')]),
    o.useEffect(() => {
      (Le(!!s?.uid, s),
        (async () => {
          try {
            const n = await O();
            (C(n), s ? await pe() : (U([]), W([])));
          } catch {}
        })());
    }, [s]),
    o.useEffect(() => {
      let t;
      try {
        t = Ue((n) => {
          const a = (n || []).map((r) => ({
            id: r.id,
            courtId: r.courtId,
            courtName: r.courtName,
            date: r.date,
            time: r.time,
            duration: r.duration,
            status: r.status,
          }));
          C(a);
        });
      } catch (n) {
        console.warn('subscribeToPublicBookings non disponibile o fallita:', n);
      }
      return () => {
        typeof t == 'function' && t();
      };
    }, []));
  const pe = async () => {
      if (!s) {
        (U([]), W([]));
        return;
      }
      try {
        if (s.uid) {
          const t = await We(s.uid);
          (W(t), U(t));
        }
      } catch {
        (U([]), W([]));
      }
    },
    ye = (t, n = 100) => {
      t?.current &&
        setTimeout(() => {
          t.current &&
            t.current.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        }, n);
    };
  (o.useEffect(() => {
    if (!i) {
      const t = new Date(),
        n = t.getFullYear(),
        a = String(t.getMonth() + 1).padStart(2, '0'),
        r = String(t.getDate()).padStart(2, '0');
      ue(`${n}-${a}-${r}`);
    }
  }, [i]),
    o.useEffect(() => {
      c && !c.hasHeating && w && ne(!1);
    }, [c, w]),
    o.useEffect(() => {
      l &&
        te.current &&
        setTimeout(() => {
          ye(te, 50);
        }, 100);
    }, [l]));
  const Y = o.useCallback((t, n, a) => K(t, n, a, h, f), [h, f]),
    He = o.useMemo(() => {
      const t = [],
        n = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];
      for (let a = 0; a < 7; a++) {
        const r = new Date();
        r.setDate(r.getDate() + a);
        const m = r.getFullYear(),
          d = String(r.getMonth() + 1).padStart(2, '0'),
          b = String(r.getDate()).padStart(2, '0'),
          g = `${m}-${d}-${b}`;
        t.push({
          date: g,
          dayName: n[r.getDay()],
          dayNumber: r.getDate(),
          monthName: r.toLocaleDateString('it-IT', { month: 'short' }),
          isToday: a === 0,
        });
      }
      return t;
    }, []),
    je = o.useMemo(() => {
      const t = [],
        n = x.dayStartHour || 8,
        a = x.dayEndHour || 23,
        r = x.slotMinutes || 30,
        m = new Date(),
        d = new Date().toISOString().split('T')[0];
      for (let b = n; b < a; b++)
        for (let g = 0; g < 60; g += r) {
          const v = `${String(b).padStart(2, '0')}:${String(g).padStart(2, '0')}`;
          if (i === d && new Date(`${i}T${v}:00`) <= m) continue;
          const p = new Date(`${i}T${v}:00`);
          let H = !1,
            E = !1,
            V = !1,
            de = 0,
            Se = 0;
          for (const X of u) {
            if (!J(p, X.id, u)) continue;
            if (((H = !0), !Y(X.id, i, v))) {
              V = !0;
              continue;
            }
            ((E = !0), de++, A(X.id, i, v, h, f) && Se++);
          }
          const $e = de > 0 && Se === de,
            ce = H && E && !$e;
          let T = null;
          (ce ||
            (H
              ? V && !E
                ? (T = 'occupied')
                : $e
                  ? (T = 'hole')
                  : (T = 'occupied')
              : (T = 'out-of-schedule')),
            (!F || ce) &&
              t.push({
                time: v,
                isAvailable: ce,
                availableCourts: 0,
                totalCourts: u.length,
                reason: T,
              }));
        }
      return t;
    }, [i, h, f, u, Y, F, x]),
    Ee = (t, n) => (n && Ge(n, x, t, u).isPromo) || !1,
    Ne = async () => {
      if (!s) {
        N({ type: 'error', text: 'Devi effettuare il login per prenotare un campo' });
        return;
      }
      if (!i || !l || !c) {
        N({ type: 'error', text: 'Seleziona data, orario e campo' });
        return;
      }
      if (!K(c.id, i, l, h, f)) {
        (fe(!0),
          setTimeout(() => {
            fe(!1);
          }, 3e3));
        const n = await O();
        C(n);
        return;
      }
      if (A(c.id, i, l, h, f)) {
        N({
          type: 'error',
          text: 'Questa scelta crea un buco di 30 minuti. Seleziona alle :00 o :30 adiacente, oppure sposta di 30 minuti.',
        });
        return;
      }
      (oe(!0), N(null));
      try {
        const n = {
            courtId: c.id,
            courtName: c.name,
            date: i,
            time: l,
            duration: h,
            lighting: !!P,
            heating: !!w,
            price: z(new Date(`${i}T${l}:00`), h, x, { lighting: !!P, heating: !!w }, c.id, u),
            userPhone: '',
            notes: '',
            players: [s.displayName || s.email, ...y.map((m) => m.name)],
          },
          a = await Fe(n, s);
        if (!a) {
          (N({
            type: 'error',
            text: 'Errore nel salvare la prenotazione. Potrebbe essere già stata prenotata da qualcun altro.',
          }),
            oe(!1));
          const m = await O();
          C(m);
          return;
        }
        const r = await O();
        if ((C(r), await pe(), S && _)) {
          const m = {
            id: a.id,
            courtId: a.courtId,
            start: new Date(`${a.date}T${a.time}:00`).toISOString(),
            duration: a.duration,
            players: [],
            playerNames: y.map((d) => d.name),
            guestNames: y.map((d) => d.name),
            price: a.price,
            note: a.notes || '',
            bookedByName: a.bookedBy || '',
            addons: { lighting: !!a.lighting, heating: !!a.heating },
            status: 'booked',
            createdAt: Date.now(),
          };
          _((d) => ({ ...d, bookings: [...(d.bookings || []), m] }));
        }
        (ge(!0),
          setTimeout(() => {
            ge(!1);
          }, 3e3),
          se(''),
          L(null),
          he(!1),
          ne(!1),
          Ae(''),
          Be(''),
          ie([]),
          re(''),
          D(!1),
          N({
            type: 'success',
            text: `Prenotazione confermata! Campo ${c?.name} il ${new Date(i).toLocaleDateString('it-IT')} alle ${l}`,
          }));
      } catch {
        N({ type: 'error', text: 'Errore durante la prenotazione. Riprova.' });
      } finally {
        oe(!1);
      }
    },
    Te = async (t) => {
      if (!t.isAvailable) return;
      try {
        const a = await O();
        if (
          (C(a),
          !u.some((m) => {
            const d = new Date(`${i}T${t.time}:00`),
              b = J(d, m.id, u),
              g = K(m.id, i, t.time, h, a),
              v = A(m.id, i, t.time, h, a);
            return b && g && !v;
          }))
        ) {
          N({
            type: 'error',
            text: 'Questo orario è appena stato prenotato. Seleziona un altro slot.',
          });
          return;
        }
      } catch (a) {
        console.warn("Errore nell'aggiornamento delle prenotazioni:", a);
      }
      se(t.time);
      const n = u.filter((a) => {
        const r = new Date(`${i}T${t.time}:00`),
          m = J(r, a.id, u),
          d = Y(a.id, i, t.time),
          b = A(a.id, i, t.time, h, f);
        return m && d && !b;
      });
      n.length === 1 && (L(n[0]), D(!0));
    },
    ve = () => {
      G.trim() && y.length < 3 && (ie([...y, { id: Date.now(), name: G.trim() }]), re(''));
    },
    ze = (t) => {
      ie(y.filter((n) => n.id !== t));
    },
    q = c && i && l ? z(new Date(`${i}T${l}:00`), h, x, { lighting: P, heating: w }, c.id, u) : 0,
    we = o.useCallback(
      (t, n, a) => {
        if (!t || !a) return !1;
        const r = u.find((p) => p.id === a);
        if (!r?.timeSlots?.length) return !1;
        const m = t.getDay(),
          d = t.getHours() * 60 + t.getMinutes(),
          b = (p = '00:00') => {
            const [H, E] = String(p)
              .split(':')
              .map((V) => +V || 0);
            return H * 60 + E;
          },
          g = r.timeSlots.find(
            (p) => Array.isArray(p.days) && p.days.includes(m) && d >= b(p.from) && d < b(p.to)
          );
        return g ? d + Number(n || 0) <= b(g.to) : !1;
      },
      [u]
    ),
    ke = o.useCallback(
      (t) => {
        if (!c || !i || !l) return !1;
        const n = new Date(`${i}T${l}:00`);
        return !(!we(n, t, c.id) || !K(c.id, i, l, t, f) || A(c.id, i, l, t, f));
      },
      [c, i, l, f, we]
    ),
    M = o.useMemo(() => {
      const t = [60, 90, 120].filter((n) => $.includes(n));
      return !c || !i || !l ? t : t.filter((n) => ke(n));
    }, [$, c, i, l, ke]);
  return (
    o.useEffect(() => {
      M.includes(h) || (M.length && ae(M[0]));
    }, [M.join(',')]),
    e.jsxs('div', {
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
            le &&
              e.jsx('div', {
                className: `mb-6 p-3 sm:p-4 rounded-lg text-sm ${le.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`,
                children: le.text,
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
                    children: He.slice(0, 10).map((t) =>
                      e.jsxs(
                        'button',
                        {
                          onClick: () => {
                            (ue(t.date), se(''), L(null), ye(xe, 200));
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
                            e.jsx('div', {
                              className: 'text-xs opacity-75',
                              children: t.monthName,
                            }),
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
                ref: xe,
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
                            checked: F,
                            onChange: (t) => Ce(t.target.checked),
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
                    children: je.map((t) =>
                      e.jsxs(
                        'button',
                        {
                          onClick: () => Te(t),
                          disabled: !t.isAvailable,
                          className: `p-3 sm:p-3 rounded-lg border text-center transition-all relative min-h-[56px] touch-manipulation ${l === t.time ? 'bg-blue-500 text-white border-blue-500 shadow-md' : t.isAvailable ? 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer active:bg-blue-100' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}`,
                          children: [
                            e.jsx('div', {
                              className: 'font-medium text-sm sm:text-base',
                              children: t.time,
                            }),
                            !t.isAvailable &&
                              e.jsx('div', {
                                className: 'text-xs mt-1',
                                children:
                                  t.reason === 'out-of-schedule'
                                    ? 'Fuori orario disponibile'
                                    : t.reason === 'hole'
                                      ? 'Crea buco di 30 minuti'
                                      : 'Occupato',
                              }),
                          ],
                        },
                        t.time
                      )
                    ),
                  }),
                  je.length === 0 &&
                    e.jsx('div', {
                      className: 'text-center py-8 text-gray-500',
                      children: F
                        ? 'Nessun orario disponibile per questo giorno'
                        : 'Nessun orario configurato',
                    }),
                ],
              }),
            l &&
              e.jsxs('div', {
                ref: te,
                className: 'bg-white rounded-lg shadow-sm border p-3 sm:p-6 mb-4 sm:mb-6',
                children: [
                  e.jsx('h2', {
                    className: 'font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base',
                    children: 'Prenota un campo',
                  }),
                  e.jsx('div', {
                    className: 'space-y-3 sm:space-y-4',
                    children: u.map((t) => {
                      const n = new Date(`${i}T${l}:00`),
                        a = J(n, t.id, u),
                        r = Y(t.id, i, l),
                        m = a && r && A(t.id, i, l, h, f),
                        d = a && r && !m;
                      return e.jsx(
                        'div',
                        {
                          onClick: () => {
                            d && (L(t), D(!0));
                          },
                          className: `border rounded-lg p-3 sm:p-4 transition-all touch-manipulation ${d ? 'hover:shadow-md cursor-pointer hover:border-blue-300 active:bg-gray-50' : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-75'}`,
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
                                        className: `font-semibold text-sm sm:text-base ${d ? 'text-gray-900' : 'text-gray-500'}`,
                                        children: t.name,
                                      }),
                                      d &&
                                        t.premium &&
                                        e.jsx(me, {
                                          variant: 'warning',
                                          size: 'xs',
                                          T: k,
                                          children: 'Premium',
                                        }),
                                      d &&
                                        i &&
                                        l &&
                                        Ee(t.id, new Date(`${i}T${l}:00`)) &&
                                        e.jsx(me, {
                                          variant: 'success',
                                          size: 'xs',
                                          T: k,
                                          children: '🏷️ Promo',
                                        }),
                                    ],
                                  }),
                                  d &&
                                    t.features &&
                                    t.features.length > 0 &&
                                    e.jsx('div', {
                                      className: 'flex flex-wrap gap-1 mb-2',
                                      children: t.features.map((b, g) =>
                                        e.jsx(
                                          me,
                                          { variant: 'default', size: 'xs', T: k, children: b },
                                          g
                                        )
                                      ),
                                    }),
                                ],
                              }),
                              e.jsx('div', {
                                className: 'text-right',
                                children: d
                                  ? e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsxs('div', {
                                          className: 'text-xl sm:text-2xl font-bold text-blue-600',
                                          children: [
                                            z(new Date(`${i}T${l}:00`), 90, x, {}, t.id, u),
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
                                              z(new Date(`${i}T${l}:00`), 90, x, {}, t.id, u) / 4
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
                                          children: a
                                            ? r
                                              ? 'Crea buco di 30 minuti'
                                              : 'Già prenotato'
                                            : 'Fuori orario disponibile',
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
        be &&
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
                        onClick: () => D(!1),
                        className:
                          'w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 touch-manipulation tap-highlight-transparent text-gray-500 hover:text-gray-700',
                        children: e.jsx('span', {
                          className: 'text-lg sm:text-base',
                          children: '✕',
                        }),
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
                                e.jsx('span', { children: l }),
                              ],
                            }),
                            e.jsxs('div', {
                              className: 'flex items-center gap-2',
                              children: [
                                e.jsx('span', { className: 'text-blue-500', children: '⏱️' }),
                                e.jsxs('span', { children: [h, ' min'] }),
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
                            const n = z(
                                new Date(`${i}T${l}:00`),
                                t,
                                x,
                                { lighting: P, heating: w },
                                c.id,
                                u
                              ),
                              a = (n / 4).toFixed(1),
                              m = $.includes(t) && M.includes(t);
                            return e.jsxs(
                              'button',
                              {
                                onClick: () => m && ae(t),
                                disabled: !m,
                                className: `p-4 rounded-xl border-2 text-center transition-all touch-manipulation ${m ? (h === t ? 'bg-blue-500 text-white border-blue-500 shadow-lg scale-105' : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100') : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}`,
                                children: [
                                  e.jsxs('div', {
                                    className: 'font-bold text-lg',
                                    children: [t, 'min'],
                                  }),
                                  e.jsxs('div', {
                                    className: 'text-lg font-bold mt-1',
                                    children: [n, '€'],
                                  }),
                                  e.jsxs('div', {
                                    className: 'text-xs opacity-75 mt-1',
                                    children: [a, '€/persona'],
                                  }),
                                ],
                              },
                              t
                            );
                          }),
                        }),
                      ],
                    }),
                    (x.addons?.lightingEnabled || x.addons?.heatingEnabled) &&
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
                              x.addons?.lightingEnabled &&
                                e.jsxs('label', {
                                  className:
                                    'flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 touch-manipulation',
                                  children: [
                                    e.jsx('input', {
                                      type: 'checkbox',
                                      checked: P,
                                      onChange: (t) => he(t.target.checked),
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
                                          children: ['+', x.addons?.lightingFee || 0, '€'],
                                        }),
                                      ],
                                    }),
                                    e.jsx('span', { className: 'text-2xl', children: '💡' }),
                                  ],
                                }),
                              x.addons?.heatingEnabled &&
                                c?.hasHeating &&
                                e.jsxs('label', {
                                  className:
                                    'flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 touch-manipulation',
                                  children: [
                                    e.jsx('input', {
                                      type: 'checkbox',
                                      checked: w,
                                      onChange: (t) => ne(t.target.checked),
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
                                          children: ['+', x.addons?.heatingFee || 0, '€'],
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
                          children: ['Giocatori (', 1 + y.length, '/4)'],
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
                          children: y.map((t, n) =>
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
                                        children: ['Giocatore ', n + 2],
                                      }),
                                    ],
                                  }),
                                  e.jsx('button', {
                                    onClick: () => ze(t.id),
                                    className:
                                      'w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center touch-manipulation transition-colors',
                                    children: e.jsx('span', {
                                      className: 'text-sm',
                                      children: '✕',
                                    }),
                                  }),
                                ],
                              },
                              t.id
                            )
                          ),
                        }),
                        y.length < 3 &&
                          e.jsxs('div', {
                            className: 'flex gap-3',
                            children: [
                              e.jsx('input', {
                                type: 'text',
                                value: G,
                                onChange: (t) => re(t.target.value),
                                onKeyDown: (t) => t.key === 'Enter' && ve(),
                                placeholder: 'Nome nuovo giocatore',
                                className:
                                  'flex-1 p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none',
                              }),
                              e.jsx('button', {
                                onClick: ve,
                                disabled: !G.trim(),
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
                              children: [q, '€'],
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
                              children: [(q / 4).toFixed(1), '€'],
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
                        onClick: () => D(!1),
                        className:
                          'flex-1 py-4 px-4 border-2 border-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 touch-manipulation transition-colors',
                        children: 'Annulla',
                      }),
                      e.jsx('button', {
                        onClick: Ne,
                        disabled: Q || !s,
                        className:
                          'flex-2 py-4 px-6 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transition-colors shadow-lg',
                        children: Q
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
                          : `Conferma - ${q}€`,
                      }),
                    ],
                  }),
                }),
              ],
            }),
          }),
        be &&
          c &&
          i &&
          l &&
          e.jsx('div', {
            className: 'lg:hidden fixed bottom-24 left-4 right-4 z-[99999]',
            children: e.jsxs('div', {
              className: 'flex gap-3',
              children: [
                e.jsx('button', {
                  onClick: () => D(!1),
                  className:
                    'flex-1 backdrop-blur-md bg-white/90 border border-gray-200/50 text-gray-700 py-3 px-4 rounded-xl font-medium text-sm transition-all shadow-lg hover:bg-white/95',
                  children: 'Annulla',
                }),
                e.jsx('button', {
                  onClick: Ne,
                  disabled: Q || !s,
                  className:
                    'flex-1 backdrop-blur-md bg-blue-600/90 text-white py-3 px-4 rounded-xl font-medium text-sm transition-all shadow-lg hover:bg-blue-600/95 disabled:opacity-50 disabled:cursor-not-allowed',
                  children: Q
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
                    : `Conferma ${q}€`,
                }),
              ],
            }),
          }),
        Pe &&
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
        Me &&
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
    })
  );
}
function dt() {
  const { user: s } = Oe(),
    { state: k, setState: S } = Ie(),
    _ = _e.useMemo(() => Re(), []);
  return e.jsx(qe, { T: _, user: s, state: k, setState: S });
}
export { dt as default };
