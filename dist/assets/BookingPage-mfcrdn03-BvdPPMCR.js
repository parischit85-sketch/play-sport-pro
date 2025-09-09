import { j as e, u as Ie, f as Re, t as _e } from './index-mfcrdn03-CQREZ_17.js';
import { r as o, b as Le } from './router-mfcrdn03-BlkFKb6t.js';
import { s as Fe, i as K, w as A, a as J, B as Z, c as Ge } from './bookings-mfcrdn03-kvCa5IxN.js';
import { i as ee, c as E, g as Ue } from './pricing-mfcrdn03-DMaWA4wL.js';
import {
  subscribeToPublicBookings as We,
  getPublicBookings as O,
  loadActiveUserBookings as Qe,
} from './cloud-bookings-mfcrdn03-ExLV7BU8.js';
import './vendor-mfcrdn03-D3F3s8fL.js';
import './firebase-mfcrdn03-BteSMG94.js';
const I = { xs: 'p-1', sm: 'p-2', md: 'p-4', elementMb: 'mb-3' },
  v = {
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
  te = {
    success: 'text-emerald-500',
    error: 'text-rose-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  },
  Ce = {
    card: 'shadow-[0_0_0_1px_rgba(0,0,0,0.02)] shadow-sm',
    cardHover: 'shadow-[0_0_0_1px_rgba(0,0,0,0.04)] shadow-md',
  },
  se = { md: 'rounded-md', xl: 'rounded-xl', xxl: 'rounded-2xl' },
  Ye = { normal: 'transition-all duration-200 ease-in-out' },
  R = {
    card: (s) => `${se.xxl} ${s.cardBg} ${s.border} ${I.md} ${Ce.card}`,
    cardHover: (s) => `${se.xxl} ${s.cardBg} ${s.border} ${I.md} ${Ce.cardHover} ${Ye.normal}`,
    sectionHeader: (s) => `${B.flexBetween} ${I.elementMb}`,
    sectionTitle: (s) => `${v.h3} ${s.neonText}`,
    btnVariants: {
      primary: (s) => s.btnPrimary,
      ghost: (s) => s.btnGhost,
      ghostSm: (s) => s.btnGhostSm,
    },
    input: (s) => s.input,
    statCard: (s) => `${R.card(s)} text-center`,
    listItem: (s) => `${se.xl} ${s.cardBg} ${s.border} ${I.sm} ${B.flexBetween}`,
    badge: (s) => `inline-flex items-center ${I.xs} ${se.md} ${v.bodyXs} ${v.medium}`,
    skeleton: 'animate-pulse bg-gray-200 rounded',
  };
function qe(s) {
  return {
    card: R.card(s),
    cardHover: R.cardHover(s),
    sectionHeader: R.sectionHeader(s),
    sectionTitle: R.sectionTitle(s),
    flexBetween: B.flexBetween,
    flexCenter: B.flexCenter,
    grid3: B.grid3,
    grid4: B.grid4,
    h1: `${v.h1} ${s.text}`,
    h2: `${v.h2} ${s.text}`,
    h3: `${v.h3} ${s.text}`,
    body: `${v.body} ${s.text}`,
    bodySm: `${v.bodySm} ${s.subtext}`,
    label: `${v.label} ${s.subtext}`,
    btnPrimary: s.btnPrimary,
    btnGhost: s.btnGhost,
    btnGhostSm: s.btnGhostSm,
    input: s.input,
    success: te.success,
    error: te.error,
    warning: te.warning,
    info: te.info,
  };
}
function Ve({ user: s, T: w, state: S, setState: _ }) {
  qe(w);
  const h = S?.bookingConfig || {
      slotMinutes: 30,
      dayStartHour: 8,
      dayEndHour: 23,
      defaultDurations: [60, 90, 120],
      addons: {},
    },
    b = Array.isArray(S?.courts) ? S.courts : [],
    $ = o.useMemo(() => {
      let t = h?.defaultDurations;
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
    }, [h?.defaultDurations]),
    ue = o.useRef(null),
    ae = o.useRef(null),
    [i, he] = o.useState(''),
    [d, ie] = o.useState(''),
    [m, L] = o.useState(null),
    [x, ne] = o.useState(60),
    [F, Ae] = o.useState(!0),
    [P, be] = o.useState(!1),
    [k, re] = o.useState(!1),
    [Xe, Be] = o.useState(''),
    [Ke, Pe] = o.useState(''),
    [j, oe] = o.useState([]),
    [G, le] = o.useState(''),
    [ge, D] = o.useState(!1),
    [Te, fe] = o.useState(!1),
    [He, pe] = o.useState(!1),
    [f, C] = o.useState([]),
    [Je, U] = o.useState([]),
    [Ze, W] = o.useState([]),
    [Q, de] = o.useState(!1),
    [ce, N] = o.useState(null);
  (o.useEffect(() => {
    $.includes(x) || ne($[0] || 60);
  }, [$.join(',')]),
    o.useEffect(() => {
      (Fe(!!s?.uid, s),
        (async () => {
          try {
            const n = await O();
            (C(n), s ? await ye() : (U([]), W([])));
          } catch {}
        })());
    }, [s]),
    o.useEffect(() => {
      let t;
      try {
        t = We((n) => {
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
  const ye = async () => {
      if (!s) {
        (U([]), W([]));
        return;
      }
      try {
        if (s.uid) {
          const t = await Qe(s.uid);
          (W(t), U(t));
        }
      } catch {
        (U([]), W([]));
      }
    },
    je = (t, n = 100) => {
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
      he(`${n}-${a}-${r}`);
    }
  }, [i]),
    o.useEffect(() => {
      m && !m.hasHeating && k && re(!1);
    }, [m, k]),
    o.useEffect(() => {
      d &&
        ae.current &&
        setTimeout(() => {
          je(ae, 50);
        }, 100);
    }, [d]));
  const Y = o.useCallback((t, n, a) => K(t, n, a, x, f), [x, f]),
    Me = o.useMemo(() => {
      const t = [],
        n = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];
      for (let a = 0; a < 7; a++) {
        const r = new Date();
        r.setDate(r.getDate() + a);
        const l = r.getFullYear(),
          g = String(r.getMonth() + 1).padStart(2, '0'),
          c = String(r.getDate()).padStart(2, '0'),
          u = `${l}-${g}-${c}`;
        t.push({
          date: u,
          dayName: n[r.getDay()],
          dayNumber: r.getDate(),
          monthName: r.toLocaleDateString('it-IT', { month: 'short' }),
          isToday: a === 0,
        });
      }
      return t;
    }, []),
    Ne = o.useMemo(() => {
      const t = [],
        n = h.dayStartHour || 8,
        a = h.dayEndHour || 23,
        r = h.slotMinutes || 30,
        l = new Date(),
        g = new Date().toISOString().split('T')[0];
      for (let c = n; c < a; c++)
        for (let u = 0; u < 60; u += r) {
          const y = `${String(c).padStart(2, '0')}:${String(u).padStart(2, '0')}`;
          if (i === g && new Date(`${i}T${y}:00`) <= l) continue;
          const p = new Date(`${i}T${y}:00`);
          let H = !1,
            M = !1,
            V = !1,
            me = 0,
            $e = 0;
          for (const X of b) {
            if (!ee(p, X.id, b)) continue;
            if (((H = !0), !Y(X.id, i, y))) {
              V = !0;
              continue;
            }
            ((M = !0), me++, A(X.id, i, y, x, f) && $e++);
          }
          const De = me > 0 && $e === me,
            xe = H && M && !De;
          let z = null;
          (xe ||
            (H
              ? V && !M
                ? (z = 'occupied')
                : De
                  ? (z = 'hole')
                  : (z = 'occupied')
              : (z = 'out-of-schedule')),
            (!F || xe) &&
              t.push({
                time: y,
                isAvailable: xe,
                availableCourts: 0,
                totalCourts: b.length,
                reason: z,
              }));
        }
      return t;
    }, [i, x, f, b, Y, F, h]),
    ze = (t, n) => (n && Ue(n, h, t, b).isPromo) || !1,
    ve = async () => {
      if (!s) {
        N({ type: 'error', text: 'Devi effettuare il login per prenotare un campo' });
        return;
      }
      if (!i || !d || !m) {
        N({ type: 'error', text: 'Seleziona data, orario e campo' });
        return;
      }
      if (!K(m.id, i, d, x, f)) {
        (pe(!0),
          setTimeout(() => {
            pe(!1);
          }, 3e3));
        const r = await O();
        C(r);
        return;
      }
      const n = A(m.id, i, d, x, f),
        a = J(m.id, i, d, x, f);
      if (n && !a) {
        N({
          type: 'error',
          text: 'Questa scelta crea un buco di 30 minuti. Seleziona alle :00 o :30 adiacente, oppure sposta di 30 minuti.',
        });
        return;
      }
      (n &&
        a &&
        N({
          type: 'info',
          text: 'Deroga applicata: Orario intrappolato tra prenotazioni - permessa creazione buco.',
        }),
        de(!0),
        N(null));
      try {
        const r = {
            courtId: m.id,
            courtName: m.name,
            date: i,
            time: d,
            duration: x,
            lighting: !!P,
            heating: !!k,
            price: E(new Date(`${i}T${d}:00`), x, h, { lighting: !!P, heating: !!k }, m.id, b),
            userPhone: '',
            notes: '',
            players: [s.displayName || s.email, ...j.map((c) => c.name)],
          },
          l = await Ge(r, s);
        if (!l) {
          (N({
            type: 'error',
            text: 'Errore nel salvare la prenotazione. Potrebbe essere già stata prenotata da qualcun altro.',
          }),
            de(!1));
          const c = await O();
          C(c);
          return;
        }
        const g = await O();
        if ((C(g), await ye(), S && _)) {
          const c = {
            id: l.id,
            courtId: l.courtId,
            start: new Date(`${l.date}T${l.time}:00`).toISOString(),
            duration: l.duration,
            players: [],
            playerNames: j.map((u) => u.name),
            guestNames: j.map((u) => u.name),
            price: l.price,
            note: l.notes || '',
            bookedByName: l.bookedBy || '',
            addons: { lighting: !!l.lighting, heating: !!l.heating },
            status: 'booked',
            createdAt: Date.now(),
          };
          _((u) => ({ ...u, bookings: [...(u.bookings || []), c] }));
        }
        (fe(!0),
          setTimeout(() => {
            fe(!1);
          }, 3e3),
          ie(''),
          L(null),
          be(!1),
          re(!1),
          Be(''),
          Pe(''),
          oe([]),
          le(''),
          D(!1),
          N({
            type: 'success',
            text: `Prenotazione confermata! Campo ${m?.name} il ${new Date(i).toLocaleDateString('it-IT')} alle ${d}`,
          }));
      } catch {
        N({ type: 'error', text: 'Errore durante la prenotazione. Riprova.' });
      } finally {
        de(!1);
      }
    },
    Ee = async (t) => {
      if (!t.isAvailable) return;
      try {
        const a = await O();
        if (
          (C(a),
          !b.some((l) => {
            const g = new Date(`${i}T${t.time}:00`),
              c = ee(g, l.id, b),
              u = K(l.id, i, t.time, x, a),
              y = A(l.id, i, t.time, x, a),
              p = J(l.id, i, t.time, x, a);
            return c && u && (!y || p);
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
      ie(t.time);
      const n = b.filter((a) => {
        const r = new Date(`${i}T${t.time}:00`),
          l = ee(r, a.id, b),
          g = Y(a.id, i, t.time),
          c = A(a.id, i, t.time, x, f),
          u = J(a.id, i, t.time, x, f);
        return l && g && (!c || u);
      });
      n.length === 1 && (L(n[0]), D(!0));
    },
    we = () => {
      G.trim() && j.length < 3 && (oe([...j, { id: Date.now(), name: G.trim() }]), le(''));
    },
    Oe = (t) => {
      oe(j.filter((n) => n.id !== t));
    },
    q = m && i && d ? E(new Date(`${i}T${d}:00`), x, h, { lighting: P, heating: k }, m.id, b) : 0,
    ke = o.useCallback(
      (t, n, a) => {
        if (!t || !a) return !1;
        const r = b.find((p) => p.id === a);
        if (!r?.timeSlots?.length) return !1;
        const l = t.getDay(),
          g = t.getHours() * 60 + t.getMinutes(),
          c = (p = '00:00') => {
            const [H, M] = String(p)
              .split(':')
              .map((V) => +V || 0);
            return H * 60 + M;
          },
          u = r.timeSlots.find(
            (p) => Array.isArray(p.days) && p.days.includes(l) && g >= c(p.from) && g < c(p.to)
          );
        return u ? g + Number(n || 0) <= c(u.to) : !1;
      },
      [b]
    ),
    Se = o.useCallback(
      (t) => {
        if (!m || !i || !d) return !1;
        const n = new Date(`${i}T${d}:00`);
        return !(!ke(n, t, m.id) || !K(m.id, i, d, t, f) || A(m.id, i, d, t, f));
      },
      [m, i, d, f, ke]
    ),
    T = o.useMemo(() => {
      const t = [60, 90, 120].filter((n) => $.includes(n));
      return !m || !i || !d ? t : t.filter((n) => Se(n));
    }, [$, m, i, d, Se]);
  return (
    o.useEffect(() => {
      T.includes(x) || (T.length && ne(T[0]));
    }, [T.join(',')]),
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
            ce &&
              e.jsx('div', {
                className: `mb-6 p-3 sm:p-4 rounded-lg text-sm ${ce.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`,
                children: ce.text,
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
                    children: Me.slice(0, 10).map((t) =>
                      e.jsxs(
                        'button',
                        {
                          onClick: () => {
                            (he(t.date), ie(''), L(null), je(ue, 200));
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
                ref: ue,
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
                            onChange: (t) => Ae(t.target.checked),
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
                    children: Ne.map((t) =>
                      e.jsxs(
                        'button',
                        {
                          onClick: () => Ee(t),
                          disabled: !t.isAvailable,
                          className: `p-3 sm:p-3 rounded-lg border text-center transition-all relative min-h-[56px] touch-manipulation ${d === t.time ? 'bg-blue-500 text-white border-blue-500 shadow-md' : t.isAvailable ? 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer active:bg-blue-100' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}`,
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
                  Ne.length === 0 &&
                    e.jsx('div', {
                      className: 'text-center py-8 text-gray-500',
                      children: F
                        ? 'Nessun orario disponibile per questo giorno'
                        : 'Nessun orario configurato',
                    }),
                ],
              }),
            d &&
              e.jsxs('div', {
                ref: ae,
                className: 'bg-white rounded-lg shadow-sm border p-3 sm:p-6 mb-4 sm:mb-6',
                children: [
                  e.jsx('h2', {
                    className: 'font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base',
                    children: 'Prenota un campo',
                  }),
                  e.jsx('div', {
                    className: 'space-y-3 sm:space-y-4',
                    children: b.map((t) => {
                      const n = new Date(`${i}T${d}:00`),
                        a = ee(n, t.id, b),
                        r = Y(t.id, i, d),
                        l = a && r && A(t.id, i, d, x, f),
                        g = J(t.id, i, d, x, f),
                        c = a && r && (!l || g);
                      return e.jsx(
                        'div',
                        {
                          onClick: () => {
                            c && (L(t), D(!0));
                          },
                          className: `border rounded-lg p-3 sm:p-4 transition-all touch-manipulation ${c ? 'hover:shadow-md cursor-pointer hover:border-blue-300 active:bg-gray-50' : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-75'}`,
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
                                        className: `font-semibold text-sm sm:text-base ${c ? 'text-gray-900' : 'text-gray-500'}`,
                                        children: t.name,
                                      }),
                                      c &&
                                        t.premium &&
                                        e.jsx(Z, {
                                          variant: 'warning',
                                          size: 'xs',
                                          T: w,
                                          children: 'Premium',
                                        }),
                                      c &&
                                        g &&
                                        l &&
                                        e.jsx(Z, {
                                          variant: 'info',
                                          size: 'xs',
                                          T: w,
                                          children: '⚠️ Intrappolato',
                                        }),
                                      c &&
                                        i &&
                                        d &&
                                        ze(t.id, new Date(`${i}T${d}:00`)) &&
                                        e.jsx(Z, {
                                          variant: 'success',
                                          size: 'xs',
                                          T: w,
                                          children: '🏷️ Promo',
                                        }),
                                    ],
                                  }),
                                  c &&
                                    t.features &&
                                    t.features.length > 0 &&
                                    e.jsx('div', {
                                      className: 'flex flex-wrap gap-1 mb-2',
                                      children: t.features.map((u, y) =>
                                        e.jsx(
                                          Z,
                                          { variant: 'default', size: 'xs', T: w, children: u },
                                          y
                                        )
                                      ),
                                    }),
                                ],
                              }),
                              e.jsx('div', {
                                className: 'text-right',
                                children: c
                                  ? e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsxs('div', {
                                          className: 'text-xl sm:text-2xl font-bold text-blue-600',
                                          children: [
                                            E(new Date(`${i}T${d}:00`), 90, h, {}, t.id, b),
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
                                              E(new Date(`${i}T${d}:00`), 90, h, {}, t.id, b) / 4
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
        ge &&
          m &&
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
                              children: m.name,
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
                                e.jsx('span', { children: d }),
                              ],
                            }),
                            e.jsxs('div', {
                              className: 'flex items-center gap-2',
                              children: [
                                e.jsx('span', { className: 'text-blue-500', children: '⏱️' }),
                                e.jsxs('span', { children: [x, ' min'] }),
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
                            const n = E(
                                new Date(`${i}T${d}:00`),
                                t,
                                h,
                                { lighting: P, heating: k },
                                m.id,
                                b
                              ),
                              a = (n / 4).toFixed(1),
                              l = $.includes(t) && T.includes(t);
                            return e.jsxs(
                              'button',
                              {
                                onClick: () => l && ne(t),
                                disabled: !l,
                                className: `p-4 rounded-xl border-2 text-center transition-all touch-manipulation ${l ? (x === t ? 'bg-blue-500 text-white border-blue-500 shadow-lg scale-105' : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100') : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}`,
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
                    (h.addons?.lightingEnabled || h.addons?.heatingEnabled) &&
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
                              h.addons?.lightingEnabled &&
                                e.jsxs('label', {
                                  className:
                                    'flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 touch-manipulation',
                                  children: [
                                    e.jsx('input', {
                                      type: 'checkbox',
                                      checked: P,
                                      onChange: (t) => be(t.target.checked),
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
                                          children: ['+', h.addons?.lightingFee || 0, '€'],
                                        }),
                                      ],
                                    }),
                                    e.jsx('span', { className: 'text-2xl', children: '💡' }),
                                  ],
                                }),
                              h.addons?.heatingEnabled &&
                                m?.hasHeating &&
                                e.jsxs('label', {
                                  className:
                                    'flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 touch-manipulation',
                                  children: [
                                    e.jsx('input', {
                                      type: 'checkbox',
                                      checked: k,
                                      onChange: (t) => re(t.target.checked),
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
                                          children: ['+', h.addons?.heatingFee || 0, '€'],
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
                          children: ['Giocatori (', 1 + j.length, '/4)'],
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
                          children: j.map((t, n) =>
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
                                    onClick: () => Oe(t.id),
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
                        j.length < 3 &&
                          e.jsxs('div', {
                            className: 'flex gap-3',
                            children: [
                              e.jsx('input', {
                                type: 'text',
                                value: G,
                                onChange: (t) => le(t.target.value),
                                onKeyDown: (t) => t.key === 'Enter' && we(),
                                placeholder: 'Nome nuovo giocatore',
                                className:
                                  'flex-1 p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none',
                              }),
                              e.jsx('button', {
                                onClick: we,
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
                        onClick: ve,
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
        ge &&
          m &&
          i &&
          d &&
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
                  onClick: ve,
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
        Te &&
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
        He &&
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
function ct() {
  const { user: s } = Ie(),
    { state: w, setState: S } = Re(),
    _ = Le.useMemo(() => _e(), []);
  return e.jsx(Ve, { T: _, user: s, state: w, setState: S });
}
export { ct as default };
