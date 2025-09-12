import { j as e, u as Se, f as De, t as $e } from './index-mfh3qkuh-BuI3yHrG.js';
import { r as l, b as Te } from './router-mfh3qkuh-7WMG9iCE.js';
import { B as te } from './Badge-mfh3qkuh-DbXmBg1C.js';
import { c as Ce } from './design-system-mfh3qkuh-B5fzZ68S.js';
import { i as U, c as z, g as Ae } from './pricing-mfh3qkuh-DMaWA4wL.js';
import { u as Pe, a as ze, B as ge } from './useUnifiedBookings-mfh3qkuh-DA63SB-8.js';
import { w as Ee, i as Me } from './unified-booking-service-mfh3qkuh-CB00Ce3w.js';
import './vendor-mfh3qkuh-D3F3s8fL.js';
import './firebase-mfh3qkuh-X_I_guKF.js';
function Be({ user: y, T: v, state: w, setState: G }) {
  Ce(v);
  const { bookings: p, createBooking: be } = Pe({ autoLoadUser: !1, autoLoadLessons: !0 });
  ze();
  const x = w?.bookingConfig || {
      slotMinutes: 30,
      dayStartHour: 8,
      dayEndHour: 23,
      defaultDurations: [60, 90, 120],
      addons: {},
    },
    u = Array.isArray(w?.courts) ? w.courts : [],
    S = l.useMemo(() => {
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
    ae = l.useRef(null),
    Q = l.useRef(null),
    [s, se] = l.useState(''),
    [d, W] = l.useState(''),
    [c, E] = l.useState(null),
    [g, K] = l.useState(60),
    [M, he] = l.useState(!0),
    [T, re] = l.useState(!1),
    [k, q] = l.useState(!1),
    [Oe, fe] = l.useState(''),
    [He, pe] = l.useState(''),
    [j, V] = l.useState([]),
    [B, Y] = l.useState(''),
    [ie, D] = l.useState(!1),
    [ye, ne] = l.useState(!1),
    [je, O] = l.useState(!1),
    [H, le] = l.useState(!1),
    [_, N] = l.useState(null);
  l.useEffect(() => {
    S.includes(g) || K(S[0] || 60);
  }, [S.join(',')]);
  const C = l.useCallback(
      (t, n, a, r = 60) => {
        if (!t || !n || !a) return !1;
        const m = new Date(`${n}T${a}:00`),
          i = new Date(m.getTime() + r * 6e4);
        return !p.some((o) => {
          if (o.courtId !== t || (o.status || ge.CONFIRMED) === ge.CANCELLED) return !1;
          const h = new Date(o.start || `${o.date}T${o.time}:00`),
            f = new Date(h.getTime() + (o.duration || 60) * 6e4);
          return (m >= h && m < f) || (i > h && i <= f) || (m <= h && i >= f);
        });
      },
      [p]
    ),
    $ = l.useCallback(
      (t, n, a, r) => {
        if (!t || !n || !a || !r) return !1;
        const m = p.map((o) => ({
            courtId: o.courtId,
            date: o.date || (o.start ? o.start.split('T')[0] : ''),
            time: o.time || (o.start ? o.start.split('T')[1].substring(0, 5) : ''),
            duration: o.duration || 60,
            status: o.status || 'confirmed',
          })),
          i = Ee(t, n, a, r, m);
        return (
          i &&
            console.log(
              `🚫 [HOLE BLOCKED] ${t} at ${a} (${r}min) would create 30min unusable slot`
            ),
          i
        );
      },
      [p]
    ),
    J = l.useCallback(
      (t, n, a, r) =>
        !t || !n || !a || !r
          ? !1
          : (p.map((i) => ({
              courtId: i.courtId,
              date: i.date || (i.start ? i.start.split('T')[0] : ''),
              time: i.time || (i.start ? i.start.split('T')[1].substring(0, 5) : ''),
              duration: i.duration || 60,
              status: i.status || 'confirmed',
            })),
            Me()),
      [p]
    ),
    de = (t, n = 100) => {
      t?.current &&
        setTimeout(() => {
          t.current &&
            t.current.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        }, n);
    };
  (l.useEffect(() => {
    if (!s) {
      const t = new Date(),
        n = t.getFullYear(),
        a = String(t.getMonth() + 1).padStart(2, '0'),
        r = String(t.getDate()).padStart(2, '0');
      se(`${n}-${a}-${r}`);
    }
  }, [s]),
    l.useEffect(() => {
      c && !c.hasHeating && k && q(!1);
    }, [c, k]),
    l.useEffect(() => {
      d &&
        Q.current &&
        setTimeout(() => {
          de(Q, 50);
        }, 100);
    }, [d]));
  const L = l.useCallback((t, n, a) => C(t, n, a, g), [g, C]),
    ke = l.useMemo(() => {
      const t = [],
        n = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];
      for (let a = 0; a < 7; a++) {
        const r = new Date();
        r.setDate(r.getDate() + a);
        const m = r.getFullYear(),
          i = String(r.getMonth() + 1).padStart(2, '0'),
          o = String(r.getDate()).padStart(2, '0'),
          b = `${m}-${i}-${o}`;
        t.push({
          date: b,
          dayName: n[r.getDay()],
          dayNumber: r.getDate(),
          monthName: r.toLocaleDateString('it-IT', { month: 'short' }),
          isToday: a === 0,
        });
      }
      return t;
    }, []),
    oe = l.useMemo(() => {
      const t = [],
        n = x.dayStartHour || 8,
        a = x.dayEndHour || 23,
        r = x.slotMinutes || 30,
        m = new Date(),
        i = new Date().toISOString().split('T')[0];
      for (let o = n; o < a; o++)
        for (let b = 0; b < 60; b += r) {
          const h = `${String(o).padStart(2, '0')}:${String(b).padStart(2, '0')}`;
          if (s === i && new Date(`${s}T${h}:00`) <= m) continue;
          const f = new Date(`${s}T${h}:00`);
          let A = !1,
            P = !1,
            R = !1;
          for (const ee of u) {
            if (!U(f, ee.id, u)) continue;
            if (((A = !0), !L(ee.id, s, h))) {
              R = !0;
              continue;
            }
            P = !0;
          }
          const X = A && P;
          let Z = null;
          (X || (A ? R && !P && (Z = 'occupied') : (Z = 'out-of-schedule')),
            (!M || X) &&
              t.push({
                time: h,
                isAvailable: X,
                availableCourts: 0,
                totalCourts: u.length,
                reason: Z,
              }));
        }
      return t;
    }, [s, g, p, u, L, M, x]),
    Ne = (t, n) => (n && Ae(n, x, t, u).isPromo) || !1,
    ce = async () => {
      if (!y) {
        N({ type: 'error', text: 'Devi effettuare il login per prenotare un campo' });
        return;
      }
      if (!s || !d || !c) {
        N({ type: 'error', text: 'Seleziona data, orario e campo' });
        return;
      }
      if (!C(c.id, s, d, g)) {
        (O(!0),
          setTimeout(() => {
            O(!1);
          }, 3e3));
        return;
      }
      if ($(c.id, s, d, g)) {
        (N({
          type: 'error',
          text: '❌ Prenotazione non consentita: creerebbe uno slot di 30 minuti non utilizzabile. Scegli un orario diverso.',
        }),
          O(!0),
          setTimeout(() => {
            O(!1);
          }, 3e3));
        return;
      }
      (le(!0), N(null));
      try {
        const a = {
          courtId: c.id,
          courtName: c.name,
          date: s,
          time: d,
          duration: g,
          lighting: !!T,
          heating: !!k,
          price: z(new Date(`${s}T${d}:00`), g, x, { lighting: !!T, heating: !!k }, c.id, u),
          userPhone: '',
          notes: '',
          players: [y.displayName || y.email, ...j.map((r) => r.name)],
          type: 'court',
        };
        if ((await be(a), w && G)) {
          const r = {
            id: `booking-${Date.now()}`,
            courtId: a.courtId,
            start: new Date(`${a.date}T${a.time}:00`).toISOString(),
            duration: a.duration,
            players: [],
            playerNames: j.map((m) => m.name),
            guestNames: j.map((m) => m.name),
            price: a.price,
            note: a.notes || '',
            bookedByName: y.displayName || y.email || '',
            addons: { lighting: !!a.lighting, heating: !!a.heating },
            status: 'booked',
            createdAt: Date.now(),
          };
        }
        (ne(!0),
          setTimeout(() => {
            ne(!1);
          }, 3e3),
          W(''),
          E(null),
          re(!1),
          q(!1),
          fe(''),
          pe(''),
          V([]),
          Y(''),
          D(!1),
          N({
            type: 'success',
            text: `Prenotazione confermata! Campo ${c?.name} il ${new Date(s).toLocaleDateString('it-IT')} alle ${d}`,
          }));
      } catch {
        N({ type: 'error', text: 'Errore durante la prenotazione. Riprova.' });
      } finally {
        le(!1);
      }
    },
    ve = async (t) => {
      if (!t.isAvailable) return;
      if (
        !u.some((r) => {
          const m = new Date(`${s}T${t.time}:00`),
            i = U(m, r.id, u),
            o = C(r.id, s, t.time, g, p),
            b = $(r.id, s, t.time, g, p),
            h = J(r.id, s, t.time, g, p);
          return i && o && (!b || h);
        })
      ) {
        N({
          type: 'error',
          text: 'Questo orario è appena stato prenotato. Seleziona un altro slot.',
        });
        return;
      }
      W(t.time);
      const a = u.filter((r) => {
        const m = new Date(`${s}T${t.time}:00`),
          i = U(m, r.id, u),
          o = L(r.id, s, t.time),
          b = $(r.id, s, t.time, g, p),
          h = J(r.id, s, t.time, g, p);
        return i && o && (!b || h);
      });
      a.length === 1 && (E(a[0]), D(!0));
    },
    me = () => {
      B.trim() && j.length < 3 && (V([...j, { id: Date.now(), name: B.trim() }]), Y(''));
    },
    we = (t) => {
      V(j.filter((n) => n.id !== t));
    },
    I = c && s && d ? z(new Date(`${s}T${d}:00`), g, x, { lighting: T, heating: k }, c.id, u) : 0,
    xe = l.useCallback(
      (t, n, a) => {
        if (!t || !a) return !1;
        const r = u.find((f) => f.id === a);
        if (!r?.timeSlots?.length) return !1;
        const m = t.getDay(),
          i = t.getHours() * 60 + t.getMinutes(),
          o = (f = '00:00') => {
            const [A, P] = String(f)
              .split(':')
              .map((R) => +R || 0);
            return A * 60 + P;
          },
          b = r.timeSlots.find(
            (f) => Array.isArray(f.days) && f.days.includes(m) && i >= o(f.from) && i < o(f.to)
          );
        return b ? i + Number(n || 0) <= o(b.to) : !1;
      },
      [u]
    ),
    ue = l.useCallback(
      (t) => {
        if (!c || !s || !d) return !1;
        const n = new Date(`${s}T${d}:00`);
        return !(
          !xe(n, t, c.id) ||
          !C(c.id, s, d, t) ||
          ($(c.id, s, d, t) && !J(c.id, s, d, t, bookings))
        );
      },
      [c, s, d, p, xe]
    ),
    F = l.useMemo(() => {
      const t = [60, 90, 120].filter((n) => S.includes(n));
      return !c || !s || !d ? t : t.filter((n) => ue(n));
    }, [S, c, s, d, ue]);
  return (
    l.useEffect(() => {
      F.includes(g) || (F.length && K(F[0]));
    }, [F.join(',')]),
    e.jsxs('div', {
      className: 'min-h-screen bg-gray-50 dark:bg-gray-900',
      children: [
        e.jsx('div', {
          className: 'bg-white dark:bg-gray-800 border-b dark:border-gray-600 px-4 py-3 sm:hidden',
          children: e.jsx('h1', {
            className: 'text-lg font-semibold text-gray-900 dark:text-white',
            children: 'Prenota Campo',
          }),
        }),
        e.jsxs('div', {
          className: 'max-w-6xl mx-auto px-4 py-6',
          children: [
            _ &&
              e.jsx('div', {
                className: `mb-6 p-3 sm:p-4 rounded-lg text-sm ${_.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'}`,
                children: _.text,
              }),
            !1,
            e.jsxs('div', {
              className:
                'bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-600 p-3 sm:p-6 mb-4 sm:mb-6',
              children: [
                e.jsx('h2', {
                  className:
                    'font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base',
                  children: 'Seleziona il giorno',
                }),
                e.jsx('div', {
                  className: 'overflow-x-auto scrollbar-hide',
                  children: e.jsx('div', {
                    className: 'flex gap-2 pb-2',
                    style: { minWidth: 'max-content' },
                    children: ke.slice(0, 10).map((t) =>
                      e.jsxs(
                        'button',
                        {
                          onClick: () => {
                            (se(t.date), W(''), E(null), de(ae, 200));
                          },
                          className: `flex-shrink-0 p-2 sm:p-3 rounded-lg border text-center transition-all min-w-[60px] sm:min-w-[80px] ${s === t.date ? 'bg-blue-500 text-white border-blue-500 shadow-md' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 active:bg-gray-100 dark:active:bg-gray-500 text-gray-900 dark:text-gray-100'}`,
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
            s &&
              e.jsxs('div', {
                ref: ae,
                className:
                  'bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-600 p-3 sm:p-6 mb-4 sm:mb-6',
                children: [
                  e.jsxs('div', {
                    className:
                      'flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3',
                    children: [
                      e.jsx('h2', {
                        className:
                          'font-semibold text-gray-900 dark:text-white text-sm sm:text-base',
                        children: "Seleziona l'orario",
                      }),
                      e.jsxs('label', {
                        className: 'flex items-center gap-2 text-xs sm:text-sm',
                        children: [
                          e.jsx('input', {
                            type: 'checkbox',
                            checked: M,
                            onChange: (t) => he(t.target.checked),
                            className: 'rounded text-blue-500',
                          }),
                          e.jsx('span', {
                            className: 'text-gray-600 dark:text-gray-300',
                            children: 'Solo orari disponibili',
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsx('div', {
                    className: 'grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-8 gap-2',
                    children: oe.map((t) =>
                      e.jsxs(
                        'button',
                        {
                          onClick: () => ve(t),
                          disabled: !t.isAvailable,
                          className: `p-3 sm:p-3 rounded-lg border text-center transition-all relative min-h-[56px] touch-manipulation ${d === t.time ? 'bg-blue-500 text-white border-blue-500 shadow-md' : t.isAvailable ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer active:bg-blue-100 dark:active:bg-blue-900/50 text-gray-900 dark:text-gray-100' : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`,
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
                                    : 'Occupato',
                              }),
                          ],
                        },
                        t.time
                      )
                    ),
                  }),
                  oe.length === 0 &&
                    e.jsx('div', {
                      className: 'text-center py-8 text-gray-500',
                      children: M
                        ? 'Nessun orario disponibile per questo giorno'
                        : 'Nessun orario configurato',
                    }),
                ],
              }),
            d &&
              e.jsxs('div', {
                ref: Q,
                className:
                  'bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-600 p-3 sm:p-6 mb-4 sm:mb-6',
                children: [
                  e.jsx('h2', {
                    className:
                      'font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base',
                    children: 'Prenota un campo',
                  }),
                  e.jsx('div', {
                    className: 'space-y-3 sm:space-y-4',
                    children: u.map((t) => {
                      const n = new Date(`${s}T${d}:00`),
                        a = U(n, t.id, u),
                        r = L(t.id, s, d),
                        m = a && r && $(t.id, s, d, g),
                        i = a && r && !m;
                      return e.jsx(
                        'div',
                        {
                          onClick: () => {
                            i && (E(t), D(!0));
                          },
                          className: `border rounded-lg p-3 sm:p-4 transition-all touch-manipulation ${i ? 'hover:shadow-md cursor-pointer hover:border-blue-300 active:bg-gray-50' : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-75'}`,
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
                                        className: `font-semibold text-sm sm:text-base ${i ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`,
                                        children: t.name,
                                      }),
                                      i &&
                                        t.premium &&
                                        e.jsx(te, {
                                          variant: 'warning',
                                          size: 'xs',
                                          T: v,
                                          children: 'Premium',
                                        }),
                                      i &&
                                        s &&
                                        d &&
                                        Ne(t.id, new Date(`${s}T${d}:00`)) &&
                                        e.jsx(te, {
                                          variant: 'success',
                                          size: 'xs',
                                          T: v,
                                          children: '🏷️ Promo',
                                        }),
                                    ],
                                  }),
                                  i &&
                                    t.features &&
                                    t.features.length > 0 &&
                                    e.jsx('div', {
                                      className: 'flex flex-wrap gap-1 mb-2',
                                      children: t.features.map((o, b) =>
                                        e.jsx(
                                          te,
                                          { variant: 'default', size: 'xs', T: v, children: o },
                                          b
                                        )
                                      ),
                                    }),
                                ],
                              }),
                              e.jsx('div', {
                                className: 'text-right',
                                children: i
                                  ? e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsxs('div', {
                                          className: 'text-xl sm:text-2xl font-bold text-blue-600',
                                          children: [
                                            z(new Date(`${s}T${d}:00`), 90, x, {}, t.id, u),
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
                                              z(new Date(`${s}T${d}:00`), 90, x, {}, t.id, u) / 4
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
                                            ? 'Già prenotato'
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
        ie &&
          c &&
          e.jsx('div', {
            className:
              'fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 backdrop-fade',
            children: e.jsxs('div', {
              className:
                'bg-white dark:bg-gray-800 w-full h-auto max-h-[95vh] sm:max-w-md sm:max-h-[90vh] sm:rounded-lg rounded-t-2xl sm:rounded-t-lg flex flex-col slide-up-mobile sm:animate-none shadow-2xl border-t dark:border-gray-600',
              children: [
                e.jsx('div', {
                  className: 'flex justify-center pt-2 pb-1 sm:hidden',
                  children: e.jsx('div', {
                    className: 'w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full',
                  }),
                }),
                e.jsx('div', {
                  className:
                    'px-4 py-3 sm:p-6 border-b dark:border-gray-600 flex-shrink-0 touch-select-none',
                  children: e.jsxs('div', {
                    className: 'flex justify-between items-center',
                    children: [
                      e.jsx('h3', {
                        className: 'text-lg sm:text-xl font-semibold text-gray-900 dark:text-white',
                        children: 'Conferma Prenotazione',
                      }),
                      e.jsx('button', {
                        onClick: () => D(!1),
                        className:
                          'w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 touch-manipulation tap-highlight-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
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
                        'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-xl mb-6 border border-blue-200 dark:border-blue-700',
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
                              className: 'font-semibold text-gray-900 dark:text-white text-lg',
                              children: c.name,
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className:
                            'grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-700 dark:text-gray-300',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center gap-2',
                              children: [
                                e.jsx('span', { className: 'text-blue-500', children: '📅' }),
                                e.jsx('span', {
                                  children: new Date(s).toLocaleDateString('it-IT', {
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
                                e.jsxs('span', { children: [g, ' min'] }),
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
                          className:
                            'block text-sm font-semibold mb-3 text-gray-900 dark:text-white',
                          children: 'Durata partita',
                        }),
                        e.jsx('div', {
                          className: 'grid grid-cols-3 gap-3',
                          children: [60, 90, 120].map((t) => {
                            const n = z(
                                new Date(`${s}T${d}:00`),
                                t,
                                x,
                                { lighting: T, heating: k },
                                c.id,
                                u
                              ),
                              a = (n / 4).toFixed(1),
                              r = S.includes(t),
                              m = c && s && d ? $(c.id, s, d, t) : !1,
                              i = r && !m;
                            return e.jsx(
                              'button',
                              {
                                onClick: () => i && K(t),
                                disabled: !i,
                                className: `p-4 rounded-xl border-2 text-center transition-all touch-manipulation ${i ? (g === t ? 'bg-blue-500 text-white border-blue-500 shadow-lg scale-105' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 active:bg-blue-100 dark:active:bg-blue-900/50 text-gray-900 dark:text-gray-100') : 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 cursor-not-allowed'}`,
                                title: i
                                  ? ''
                                  : 'Questa durata creerebbe un buco di 30 minuti non utilizzabile',
                                children: i
                                  ? e.jsxs(e.Fragment, {
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
                                    })
                                  : e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsxs('div', {
                                          className: 'font-bold text-lg',
                                          children: [t, 'min'],
                                        }),
                                        e.jsx('div', {
                                          className:
                                            'text-sm font-bold mt-1 text-red-700 dark:text-red-400',
                                          children: 'Non Disponibile',
                                        }),
                                      ],
                                    }),
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
                            className:
                              'block text-sm font-semibold mb-3 text-gray-900 dark:text-white',
                            children: 'Servizi Extra',
                          }),
                          e.jsxs('div', {
                            className: 'space-y-3',
                            children: [
                              x.addons?.lightingEnabled &&
                                e.jsxs('label', {
                                  className:
                                    'flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 touch-manipulation',
                                  children: [
                                    e.jsx('input', {
                                      type: 'checkbox',
                                      checked: T,
                                      onChange: (t) => re(t.target.checked),
                                      className: 'rounded w-5 h-5 text-blue-500',
                                    }),
                                    e.jsxs('div', {
                                      className: 'flex-1',
                                      children: [
                                        e.jsx('div', {
                                          className:
                                            'text-sm font-medium text-gray-900 dark:text-gray-100',
                                          children: 'Illuminazione',
                                        }),
                                        e.jsxs('div', {
                                          className: 'text-xs text-gray-600 dark:text-gray-400',
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
                                    'flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 touch-manipulation',
                                  children: [
                                    e.jsx('input', {
                                      type: 'checkbox',
                                      checked: k,
                                      onChange: (t) => q(t.target.checked),
                                      className: 'rounded w-5 h-5 text-blue-500',
                                    }),
                                    e.jsxs('div', {
                                      className: 'flex-1',
                                      children: [
                                        e.jsx('div', {
                                          className:
                                            'text-sm font-medium text-gray-900 dark:text-gray-100',
                                          children: 'Riscaldamento',
                                        }),
                                        e.jsxs('div', {
                                          className: 'text-xs text-gray-600 dark:text-gray-400',
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
                          className:
                            'block text-sm font-semibold mb-3 text-gray-900 dark:text-white',
                          children: ['Giocatori (', 1 + j.length, '/4)'],
                        }),
                        e.jsx('div', {
                          className:
                            'mb-3 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border-l-4 border-blue-500',
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
                                    className:
                                      'text-sm font-semibold text-gray-900 dark:text-white',
                                    children: y?.displayName || y?.email,
                                  }),
                                  e.jsx('div', {
                                    className:
                                      'text-xs text-blue-600 dark:text-blue-400 font-medium',
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
                                className:
                                  'p-3 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center gap-3',
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
                                        className:
                                          'text-sm font-medium text-gray-900 dark:text-gray-100',
                                        children: t.name,
                                      }),
                                      e.jsxs('div', {
                                        className: 'text-xs text-gray-500 dark:text-gray-400',
                                        children: ['Giocatore ', n + 2],
                                      }),
                                    ],
                                  }),
                                  e.jsx('button', {
                                    onClick: () => we(t.id),
                                    className:
                                      'w-8 h-8 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center touch-manipulation transition-colors',
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
                                value: B,
                                onChange: (t) => Y(t.target.value),
                                onKeyDown: (t) => t.key === 'Enter' && me(),
                                placeholder: 'Nome nuovo giocatore',
                                className:
                                  'flex-1 p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400',
                              }),
                              e.jsx('button', {
                                onClick: me,
                                disabled: !B.trim(),
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
                        'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-xl border border-green-200 dark:border-green-700 mb-6',
                      children: [
                        e.jsxs('div', {
                          className: 'flex justify-between items-center mb-2',
                          children: [
                            e.jsx('span', {
                              className: 'font-semibold text-gray-900 dark:text-white',
                              children: 'Totale partita',
                            }),
                            e.jsxs('span', {
                              className: 'text-2xl font-bold text-green-600 dark:text-green-400',
                              children: [I, '€'],
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'flex justify-between items-center',
                          children: [
                            e.jsx('span', {
                              className: 'text-sm text-gray-600 dark:text-gray-300',
                              children: 'Costo per persona',
                            }),
                            e.jsxs('span', {
                              className: 'text-lg font-semibold text-green-600 dark:text-green-400',
                              children: [(I / 4).toFixed(1), '€'],
                            }),
                          ],
                        }),
                        e.jsx('div', {
                          className: 'mt-2 pt-2 border-t border-green-200 dark:border-green-700',
                          children: e.jsx('div', {
                            className: 'text-xs text-green-700 dark:text-green-300 font-medium',
                            children: '💰 Pagamento in loco',
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx('div', {
                  className:
                    'p-4 sm:p-6 border-t dark:border-gray-600 bg-white dark:bg-gray-800 flex-shrink-0 lg:hidden',
                  children: e.jsx('div', { className: 'h-24' }),
                }),
                e.jsx('div', {
                  className:
                    'p-4 sm:p-6 border-t dark:border-gray-600 bg-white dark:bg-gray-800 flex-shrink-0 hidden lg:block',
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
                        onClick: ce,
                        disabled: H || !y,
                        className:
                          'flex-2 py-4 px-6 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transition-colors shadow-lg',
                        children: H
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
                          : `Conferma - ${I}€`,
                      }),
                    ],
                  }),
                }),
              ],
            }),
          }),
        ie &&
          c &&
          s &&
          d &&
          e.jsx('div', {
            className: 'lg:hidden fixed bottom-24 left-4 right-4 z-[99999]',
            children: e.jsxs('div', {
              className: 'flex gap-3',
              children: [
                e.jsx('button', {
                  onClick: () => D(!1),
                  className:
                    'flex-1 backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium text-sm transition-all shadow-lg hover:bg-white/95 dark:hover:bg-gray-800/95',
                  children: 'Annulla',
                }),
                e.jsx('button', {
                  onClick: ce,
                  disabled: H || !y,
                  className:
                    'flex-1 backdrop-blur-md bg-blue-600/90 text-white py-3 px-4 rounded-xl font-medium text-sm transition-all shadow-lg hover:bg-blue-600/95 disabled:opacity-50 disabled:cursor-not-allowed',
                  children: H
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
                    : `Conferma ${I}€`,
                }),
              ],
            }),
          }),
        ye &&
          e.jsx('div', {
            className:
              'fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-[60]',
            children: e.jsxs('div', {
              className:
                'bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full text-center animate-bounce border dark:border-gray-600',
              children: [
                e.jsx('div', {
                  className: 'mb-4',
                  children: e.jsx('div', {
                    className:
                      'mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center',
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
                  className: 'text-xl font-bold text-gray-900 dark:text-white mb-2',
                  children: 'Prenotazione Confermata! 🎾',
                }),
                e.jsx('p', {
                  className: 'text-gray-600 dark:text-gray-300 text-sm',
                  children: 'La tua prenotazione è stata registrata con successo',
                }),
                e.jsx('div', {
                  className: 'mt-4 text-xs text-gray-400 dark:text-gray-500',
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
              className:
                'bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full text-center animate-bounce border dark:border-gray-600',
              children: [
                e.jsx('div', {
                  className: 'mb-4',
                  children: e.jsx('div', {
                    className:
                      'mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center',
                    children: e.jsx('svg', {
                      className: 'w-8 h-8 text-red-500 dark:text-red-400 animate-pulse',
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
                  className: 'text-xl font-bold text-gray-900 dark:text-white mb-2',
                  children: 'Slot già prenotato! ⚠️',
                }),
                e.jsx('p', {
                  className: 'text-gray-600 dark:text-gray-300 text-sm',
                  children:
                    'Questo orario è già stato prenotato da qualcun altro. Seleziona un altro orario.',
                }),
                e.jsx('div', {
                  className: 'mt-4 text-xs text-gray-400 dark:text-gray-500',
                  children: 'Questa finestra si chiuderà automaticamente',
                }),
              ],
            }),
          }),
      ],
    })
  );
}
function Ye() {
  const { user: y } = Se(),
    { state: v, setState: w } = De(),
    G = Te.useMemo(() => $e(), []);
  return e.jsx(Be, { T: G, user: y, state: v, setState: w });
}
export { Ye as default };
