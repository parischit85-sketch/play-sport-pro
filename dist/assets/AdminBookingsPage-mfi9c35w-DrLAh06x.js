import { j as e, u as We, f as _e, k as Xe, t as Je } from './index-mfi9c35w-CsSxx0JE.js';
import { r as c, b as Ee, c as Ke } from './router-mfi9c35w-8jyiX-w-.js';
import { S as Qe } from './Section-mfi9c35w-BVpF_AdT.js';
import { M as et } from './Modal-mfi9c35w-CcDrB430.js';
import { a as me, e as tt } from './format-mfi9c35w-DAEZv7Mi.js';
import { g as we, c as Te, i as te } from './pricing-mfi9c35w-DMaWA4wL.js';
import { u as rt } from './useUnifiedBookings-mfi9c35w-C4D5ju_K.js';
import { P as at } from './playerTypes-mfi9c35w-CIm-hM8a.js';
import './vendor-mfi9c35w-D3F3s8fL.js';
import './firebase-mfi9c35w-X_I_guKF.js';
import './unified-booking-service-mfi9c35w-Dow-Gq1E.js';
function ot(f, v) {
  return (
    f.getFullYear() === v.getFullYear() &&
    f.getMonth() === v.getMonth() &&
    f.getDate() === v.getDate()
  );
}
function re(f, v = 30) {
  const g = new Date(f);
  g.setSeconds(0, 0);
  const S = g.getMinutes(),
    l = Math.floor(S / v) * v;
  return (g.setMinutes(l), g);
}
function j(f, v) {
  const g = new Date(f);
  return (g.setMinutes(g.getMinutes() + v), g);
}
function ae(f, v, g, S) {
  return f < S && g < v;
}
function st(f = {}) {
  const { minScale: v = 0.5, maxScale: g = 3, initialScale: S = 1 } = f,
    [l, O] = c.useState(S),
    [P, y] = c.useState(S),
    [Y, A] = c.useState(!1),
    J = c.useRef(null),
    n = c.useRef(0),
    D = c.useCallback((u, b) => {
      const U = u.clientX - b.clientX,
        _ = u.clientY - b.clientY;
      return Math.sqrt(U * U + _ * _);
    }, []),
    q = c.useCallback(
      (u) => {
        if (u.touches.length === 2) {
          A(!0);
          const b = D(u.touches[0], u.touches[1]);
          ((n.current = b), u.preventDefault());
        }
      },
      [D]
    ),
    Q = c.useCallback(
      (u) => {
        if (u.touches.length === 2 && Y) {
          const U = D(u.touches[0], u.touches[1]) / n.current,
            _ = Math.min(g, Math.max(v, P * U));
          (O(_), u.preventDefault());
        }
      },
      [Y, P, v, g, D]
    ),
    G = c.useCallback(
      (u) => {
        u.touches.length < 2 && (A(!1), y(l));
      },
      [l]
    ),
    m = c.useCallback(() => {
      const u = Math.min(g, l * 1.2);
      (O(u), y(u));
    }, [l, g]),
    R = c.useCallback(() => {
      const u = Math.max(v, l * 0.8);
      (O(u), y(u));
    }, [l, v]),
    W = c.useCallback(() => {
      (O(S), y(S));
    }, [S]);
  return (
    c.useEffect(() => {
      const u = J.current;
      if (u)
        return (
          u.addEventListener('touchstart', q, { passive: !1 }),
          u.addEventListener('touchmove', Q, { passive: !1 }),
          u.addEventListener('touchend', G, { passive: !1 }),
          () => {
            (u.removeEventListener('touchstart', q),
              u.removeEventListener('touchmove', Q),
              u.removeEventListener('touchend', G));
          }
        );
    }, [q, Q, G]),
    {
      containerRef: J,
      scale: l,
      isZooming: Y,
      zoomIn: m,
      zoomOut: R,
      resetZoom: W,
      transform: `scale(${l})`,
    }
  );
}
function nt({ children: f, className: v = '', T: g }) {
  const {
    containerRef: S,
    scale: l,
    isZooming: O,
    zoomIn: P,
    zoomOut: y,
    resetZoom: Y,
    transform: A,
  } = st({ minScale: 0.3, maxScale: 2.5, initialScale: 0.7 });
  return e.jsxs('div', {
    className: 'relative w-full',
    style: { minHeight: '400px' },
    children: [
      e.jsxs('div', {
        className: 'md:hidden fixed top-20 right-4 z-50 flex flex-col gap-2',
        children: [
          e.jsx('button', {
            onClick: P,
            className: `w-12 h-12 rounded-full bg-blue-500 dark:bg-blue-600 text-white shadow-lg flex items-center justify-center text-xl font-bold ${g.shadow}`,
            'aria-label': 'Zoom In',
            children: '+',
          }),
          e.jsx('button', {
            onClick: y,
            className: `w-12 h-12 rounded-full bg-blue-500 dark:bg-blue-600 text-white shadow-lg flex items-center justify-center text-xl font-bold ${g.shadow}`,
            'aria-label': 'Zoom Out',
            children: '−',
          }),
          e.jsx('button', {
            onClick: Y,
            className: `w-12 h-12 rounded-full bg-gray-500 dark:bg-gray-600 text-white shadow-lg flex items-center justify-center text-sm font-bold ${g.shadow}`,
            'aria-label': 'Reset Zoom',
            children: '⌂',
          }),
        ],
      }),
      e.jsx('div', {
        className: 'md:hidden fixed top-20 left-4 z-50',
        children: e.jsxs('div', {
          className: `px-3 py-2 rounded-lg ${g.cardBg} ${g.border} shadow-lg`,
          children: [
            e.jsxs('div', {
              className: 'text-xs font-medium text-gray-600 dark:text-gray-400',
              children: [Math.round(l * 100), '%'],
            }),
            O &&
              e.jsx('div', {
                className: 'text-xs text-blue-500 dark:text-blue-400',
                children: 'Pinch per zoom',
              }),
          ],
        }),
      }),
      e.jsx('div', {
        ref: S,
        className: `w-full overflow-auto ${v}`,
        style: {
          touchAction: 'manipulation',
          WebkitOverflowScrolling: 'touch',
          minHeight: '400px',
          maxHeight: 'calc(100vh - 200px)',
        },
        children: e.jsx('div', {
          style: {
            transform: A,
            transformOrigin: 'top left',
            transition: O ? 'none' : 'transform 0.2s ease-out',
            minWidth: '100%',
            minHeight: '100%',
          },
          children: f,
        }),
      }),
      e.jsx('div', {
        className: 'md:hidden fixed bottom-4 left-4 right-4 z-40',
        children: e.jsx('div', {
          className: `px-4 py-3 rounded-lg ${g.cardBg} ${g.border} shadow-lg text-center`,
          children: e.jsx('div', {
            className: 'text-sm font-medium text-gray-700 dark:text-gray-300',
            children: '💡 Usa due dita per zoom in/out • Trascina per scorrere',
          }),
        }),
      }),
    ],
  });
}
function it({ currentDay: f, onSelectDay: v, T: g }) {
  const [S, l] = c.useState(new Date(f.getFullYear(), f.getMonth(), 1)),
    O = new Date();
  O.setHours(0, 0, 0, 0);
  const P = S.getFullYear(),
    y = S.getMonth(),
    Y = new Date(P, y, 1),
    A = new Date(Y);
  A.setDate(A.getDate() - Y.getDay() + 1);
  const J = new Date(A);
  J.setDate(J.getDate() + 41);
  const n = [];
  for (let b = new Date(A); b <= J; b.setDate(b.getDate() + 1)) n.push(new Date(b));
  const D = [
      'Gennaio',
      'Febbraio',
      'Marzo',
      'Aprile',
      'Maggio',
      'Giugno',
      'Luglio',
      'Agosto',
      'Settembre',
      'Ottobre',
      'Novembre',
      'Dicembre',
    ],
    q = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
    Q = () => {
      l(new Date(P, y - 1, 1));
    },
    G = () => {
      l(new Date(P, y + 1, 1));
    },
    m = (b) => b.getTime() === O.getTime(),
    R = (b) => b.getTime() === f.getTime(),
    W = (b) => b.getMonth() === y,
    u = (b) => b < O;
  return e.jsxs('div', {
    className: 'w-full',
    children: [
      e.jsxs('div', {
        className: 'flex items-center justify-between mb-4',
        children: [
          e.jsx('button', {
            type: 'button',
            onClick: Q,
            className:
              'w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-xl font-bold transition-colors',
            children: '←',
          }),
          e.jsxs('h4', { className: `text-xl font-bold ${g.text}`, children: [D[y], ' ', P] }),
          e.jsx('button', {
            type: 'button',
            onClick: G,
            className:
              'w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-xl font-bold transition-colors',
            children: '→',
          }),
        ],
      }),
      e.jsx('div', {
        className: 'grid grid-cols-7 gap-1 mb-2',
        children: q.map((b) =>
          e.jsx(
            'div',
            { className: `text-center text-sm font-semibold ${g.subtext} py-2`, children: b },
            b
          )
        ),
      }),
      e.jsx('div', {
        className: 'grid grid-cols-7 gap-1',
        children: n.map((b, U) => {
          const _ = b.getDate(),
            le = W(b),
            V = m(b),
            oe = R(b),
            xe = u(b);
          return e.jsx(
            'button',
            {
              type: 'button',
              onClick: () => v(b),
              disabled: xe,
              className: `
                h-12 w-full rounded-lg text-sm font-medium transition-all duration-200
                ${oe ? 'bg-blue-500 text-white shadow-lg dark:bg-emerald-500' : V ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 dark:bg-emerald-100 dark:text-emerald-700 dark:border-emerald-300' : le ? 'hover:bg-gray-200 dark:hover:bg-gray-700 ' + g.text : 'text-gray-400 dark:text-gray-600'}
                ${xe ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
              `,
              children: _,
            },
            U
          );
        }),
      }),
    ],
  });
}
function lt({ state: f, setState: v, players: g, playersById: S, T: l }) {
  const { user: O } = We(),
    {
      bookings: P,
      refresh: y,
      createBooking: Y,
      updateBooking: A,
      deleteBooking: J,
    } = rt({ autoLoadUser: !1, autoLoadLessons: !0, enableRealtime: !0 }),
    n = f?.bookingConfig || {
      slotMinutes: 30,
      dayStartHour: 8,
      dayEndHour: 23,
      defaultDurations: [60, 90, 120],
      addons: {},
    },
    [D, q] = c.useState(() => re(new Date(), n.slotMinutes)),
    [Q, G] = c.useState(!1),
    m = Array.isArray(f?.courts) ? f.courts : [],
    R = c.useMemo(
      () =>
        (f.players || []).filter(
          (r) => r.category === at.INSTRUCTOR && r.instructorData?.isInstructor
        ),
      [f.players]
    ),
    W = c.useMemo(
      () =>
        (P || [])
          .filter((t) => t.status === 'confirmed')
          .map((t) => {
            try {
              const r = new Date(`${t.date}T${String(t.time).padStart(5, '0')}:00`).toISOString();
              return {
                id: t.id,
                courtId: t.courtId,
                start: r,
                duration: Number(t.duration) || 60,
                players: [],
                playerNames: Array.isArray(t.players) ? t.players : [],
                guestNames: [],
                price: t.price ?? null,
                note: t.notes || '',
                notes: t.notes || '',
                bookedByName: t.bookedBy || '',
                addons: { lighting: !!t.lighting, heating: !!t.heating },
                status: 'booked',
                instructorId: t.instructorId,
                isLessonBooking: t.isLessonBooking || !1,
                color: t.color,
              };
            } catch {
              return null;
            }
          })
          .filter(Boolean),
      [P]
    ),
    u = c.useMemo(() => {
      const t = Array.isArray(n?.defaultDurations) ? n.defaultDurations : [];
      return t.includes(90) ? 90 : t.length > 0 ? t[0] : 90;
    }, [n]),
    b = () => q(re(new Date(), n.slotMinutes)),
    U = (t) =>
      q((r) => {
        const s = new Date(r);
        return (s.setDate(s.getDate() + t), s);
      }),
    _ = new Date(D);
  _.setHours(n.dayStartHour, 0, 0, 0);
  const le = new Date(D);
  le.setHours(n.dayEndHour, 0, 0, 0);
  const V = [],
    oe = new Set();
  if (
    (m.forEach((t) => {
      t.timeSlots &&
        t.timeSlots.length > 0 &&
        t.timeSlots.forEach((r) => {
          if (r.days?.includes(D.getDay())) {
            const s = parseInt(r.from.split(':')[0]) * 60 + parseInt(r.from.split(':')[1]),
              o = parseInt(r.to.split(':')[0]) * 60 + parseInt(r.to.split(':')[1]);
            for (let d = s; d < o; d += n.slotMinutes) oe.add(d);
          }
        });
    }),
    oe.size > 0)
  )
    Array.from(oe)
      .sort((r, s) => r - s)
      .forEach((r) => {
        const s = new Date(D);
        (s.setHours(Math.floor(r / 60), r % 60, 0, 0), V.push(s));
      });
  else for (let t = new Date(_); t < le; t = j(t, n.slotMinutes)) V.push(new Date(t));
  const Be = `${((t) => t.charAt(0).toUpperCase() + t.slice(1))(new Intl.DateTimeFormat('it-IT', { weekday: 'long' }).format(D))} - ${String(D.getDate()).padStart(2, '0')} ${new Intl.DateTimeFormat('it-IT', { month: 'long' }).format(D)} ${D.getFullYear()}`,
    Ne = c.useMemo(
      () =>
        (W || [])
          .filter((t) => t && t.status !== 'cancelled')
          .filter((t) => ot(new Date(t.start), D))
          .sort((t, r) => new Date(t.start) - new Date(r.start)),
      [W, D]
    ),
    se = c.useMemo(() => {
      const t = new Map(m.map((r) => [r.id, []]));
      for (const r of Ne) {
        const s = t.get(r.courtId) || [];
        (s.push(r), t.set(r.courtId, s));
      }
      return t;
    }, [Ne, m]),
    de = c.useMemo(
      () =>
        V.map((t) => {
          const r = m.map((s) => we(t, n, s.id, m).rate);
          return r.length > 0 ? Math.min(...r) : 0;
        }),
      [V, n, m]
    ),
    ce = c.useMemo(() => Math.min(...de), [de]),
    be = c.useMemo(() => Math.max(...de), [de]),
    Le = (t) =>
      !isFinite(ce) || !isFinite(be) || ce === be ? 0.18 : 0.12 + ((t - ce) / (be - ce)) * 0.22,
    Oe = c.useMemo(
      () =>
        [...g].sort((t, r) => (t.name || '').localeCompare(r.name, 'it', { sensitivity: 'base' })),
      [g]
    ),
    Pe = (t) => S?.[t]?.name || '',
    pe = (t, r) => (r && we(r, n, t, m).isPromo) || !1,
    [je, K] = c.useState(!1),
    [H, Se] = c.useState(null),
    [ue, he] = c.useState('overview'),
    [fe, De] = c.useState('all'),
    [I, ye] = c.useState(null),
    [ke, ne] = c.useState(null),
    [L, Ae] = c.useState(() => window.innerWidth >= 1024);
  c.useEffect(() => {
    const t = () => {
      Ae(window.innerWidth >= 1024);
    };
    return (window.addEventListener('resize', t), () => window.removeEventListener('resize', t));
  }, []);
  const [a, T] = c.useState({
    courtId: '',
    start: null,
    duration: u,
    p1Name: '',
    p2Name: '',
    p3Name: '',
    p4Name: '',
    note: '',
    bookedBy: '',
    useLighting: !1,
    useHeating: !1,
    color: '#e91e63',
    bookingType: 'partita',
    instructorId: '',
  });
  function Ie(t, r) {
    const s = re(r, n.slotMinutes);
    (Se(null),
      T({
        courtId: t,
        start: s,
        duration: u,
        p1Name: '',
        p2Name: '',
        p3Name: '',
        p4Name: '',
        note: '',
        bookedBy: '',
        useLighting: !1,
        useHeating: !1,
        color: '#e91e63',
        bookingType: 'partita',
        instructorId: '',
      }),
      K(!0));
  }
  function Ce(t) {
    Se(t.id);
    const r = new Date(t.start),
      s = (t.players || []).map(Pe);
    let o = t.playerNames && t.playerNames.length ? t.playerNames : s;
    const d = t.bookedByName || '';
    (d && !o.includes(d) && (o = [d, ...o].slice(0, 4)),
      T({
        courtId: t.courtId,
        start: r,
        duration: t.duration,
        p1Name: o[0] || '',
        p2Name: o[1] || '',
        p3Name: o[2] || '',
        p4Name: o[3] || '',
        note: t.note || '',
        bookedBy: d,
        useLighting: !!t.addons?.lighting,
        useHeating: !!t.addons?.heating,
        color: t.color || '#e91e63',
        bookingType: t.instructorId ? 'lezione' : 'partita',
        instructorId: t.instructorId || '',
      }),
      K(!0));
  }
  function Re(t, r, s, o = null) {
    const d = new Date(r),
      p = j(r, s),
      E = se.get(t) || [];
    return (
      console.log('🔍 Checking overlap for:', {
        courtId: t,
        blockStart: d.toISOString(),
        blockEnd: p.toISOString(),
        duration: s,
        ignoreId: o,
        existingBookings: E.length,
      }),
      E.find((k) => {
        if (o && k.id === o) return (console.log('⏭️ Ignoring booking:', k.id), !1);
        const $ = new Date(k.start),
          h = j(new Date(k.start), k.duration),
          B = ae(d, p, $, h);
        return (
          B &&
            console.log('🚫 Overlap detected with booking:', {
              bookingId: k.id,
              bookingStart: $.toISOString(),
              bookingEnd: h.toISOString(),
              bookingDuration: k.duration,
            }),
          B
        );
      })
    );
  }
  const $e = c.useRef('');
  (c.useEffect(() => {
    const t = a.p1Name?.trim() || '',
      r = $e.current;
    ((!a.bookedBy?.trim() || a.bookedBy?.trim() === r) && t && T((s) => ({ ...s, bookedBy: t })),
      ($e.current = t));
  }, [a.p1Name]),
    c.useEffect(() => {
      if (a.bookingType === 'lezione' && a.instructorId && R.length > 0) {
        const t = R.find((r) => r.id === a.instructorId);
        t?.instructorData?.color && T((r) => ({ ...r, color: t.instructorData.color }));
      } else a.bookingType === 'partita' && T((t) => ({ ...t, color: '#e91e63' }));
    }, [a.bookingType, a.instructorId, R]));
  async function ze() {
    if (!a.courtId || !a.start) {
      alert('Seleziona campo e orario.');
      return;
    }
    if (a.bookingType === 'lezione' && !a.instructorId) {
      alert('Seleziona un maestro per le lezioni.');
      return;
    }
    const t = re(a.start, n.slotMinutes);
    if (!te(t, a.courtId, m)) {
      alert('Orario fuori dalle fasce prenotabili per questo campo.');
      return;
    }
    if (t < new Date()) {
      alert('Non puoi prenotare nel passato.');
      return;
    }
    const s = H || null;
    if (Re(a.courtId, t, a.duration, s)) {
      alert('Esiste già una prenotazione che si sovrappone su questo campo.');
      return;
    }
    const o = [a.p1Name, a.p2Name, a.p3Name, a.p4Name].map((N) => (N || '').trim()).filter(Boolean),
      d = (a.bookedBy && a.bookedBy.trim()) || o[0] || '',
      p = Te(
        t,
        a.duration,
        n,
        { lighting: !!a.useLighting, heating: !!a.useHeating },
        a.courtId,
        m
      ),
      E = String(t.getFullYear()).padStart(4, '0'),
      C = String(t.getMonth() + 1).padStart(2, '0'),
      k = String(t.getDate()).padStart(2, '0'),
      $ = String(t.getHours()).padStart(2, '0'),
      h = String(t.getMinutes()).padStart(2, '0'),
      B = `${E}-${C}-${k}`,
      x = `${$}:${h}`,
      z = m.find((N) => N.id === a.courtId)?.name || a.courtId;
    try {
      if (H) {
        const N = {
          courtId: a.courtId,
          courtName: z,
          date: B,
          time: x,
          duration: a.duration,
          lighting: !!a.useLighting,
          heating: !!a.useHeating,
          price: p,
          players: o,
          notes: a.note?.trim() || '',
          color: a.color,
          ...(d ? { bookedBy: d } : {}),
          ...(a.bookingType === 'lezione' && a.instructorId
            ? {
                instructorId: a.instructorId,
                instructorName: R.find((F) => F.id === a.instructorId)?.name || '',
                lessonType: 'individual',
              }
            : { instructorId: null, instructorName: null, lessonType: null }),
        };
        await A(H, N, O);
      } else {
        const N = {
            courtId: a.courtId,
            courtName: z,
            date: B,
            time: x,
            duration: a.duration,
            lighting: !!a.useLighting,
            heating: !!a.useHeating,
            price: p,
            players: o,
            notes: a.note?.trim() || '',
            type: 'court',
            color: a.color,
            ...(a.bookingType === 'lezione' && a.instructorId
              ? {
                  instructorId: a.instructorId,
                  instructorName: R.find((i) => i.id === a.instructorId)?.name || '',
                  lessonType: 'individual',
                }
              : {}),
          },
          F = await Y(N);
        d && (await A(F.id, { bookedBy: d }));
      }
      K(!1);
    } catch {
      alert('Errore nel salvataggio della prenotazione.');
    }
  }
  async function He(t) {
    if (confirm('Cancellare la prenotazione?'))
      try {
        await A(t, { status: 'cancelled', cancelledAt: new Date().toISOString() });
      } catch {
        alert('Errore durante la cancellazione.');
      }
  }
  async function ve(t) {
    if (confirm('Eliminare definitivamente la prenotazione?'))
      try {
        (await J(t), K(!1));
      } catch {
        alert("Errore durante l'eliminazione.");
      }
  }
  const Me = (t) => m.find((r) => r.id === t)?.name || t,
    Fe = (t, r) => {
      L &&
        (ye(r),
        (t.dataTransfer.effectAllowed = 'move'),
        t.dataTransfer.setData('text/plain', r.id),
        (t.target.style.opacity = '0.6'));
    },
    Ge = (t) => {
      L && (ye(null), ne(null), (t.target.style.opacity = '1'));
    },
    Ue = (t, r, s) => {
      if (!L || !I) return;
      (t.preventDefault(), (t.dataTransfer.dropEffect = 'move'));
      const o = new Date(I.start).toDateString(),
        d = s.toDateString();
      if (o !== d) return;
      const p = re(s, n.slotMinutes),
        E = I.duration || 60,
        C = j(p, E),
        k = [];
      let $ = !1;
      for (let h = new Date(p); h < C; h = j(h, n.slotMinutes)) {
        if (!te(h, r, m)) {
          $ = !0;
          break;
        }
        const B = j(h, n.slotMinutes);
        if (
          W.find((z) => {
            if (z.id === I.id || z.courtId !== r) return !1;
            const N = new Date(z.start),
              F = j(N, z.duration);
            return ae(h, B, N, F);
          })
        ) {
          $ = !0;
          break;
        }
        k.push({ courtId: r, time: h.getTime() });
      }
      ne($ ? null : { courtId: r, slots: k });
    },
    Ze = (t) => {
      L && (t.currentTarget.contains(t.relatedTarget) || ne(null));
    },
    Ye = async (t, r, s) => {
      if (!(!L || !I)) {
        (t.preventDefault(),
          ne(null),
          console.log('🎯 DROP EVENT:', {
            courtId: r,
            slotTime: s.toISOString(),
            draggedBookingId: I.id,
            draggedBookingDuration: I.duration,
          }));
        try {
          const o = new Date(I.start).toDateString(),
            d = s.toDateString();
          if (o !== d) {
            alert("Puoi spostare le prenotazioni solo all'interno dello stesso giorno.");
            return;
          }
          const p = re(s, n.slotMinutes),
            E = j(p, I.duration);
          console.log('🎯 Drop validation:', {
            targetTime: p.toISOString(),
            targetEnd: E.toISOString(),
            duration: I.duration,
          });
          const C = [];
          for (let x = new Date(p); x < E; x = j(x, n.slotMinutes)) C.push(new Date(x));
          for (const x of C)
            if (!te(x, r, m)) {
              alert(
                'Uno o più slot di destinazione sono fuori dalle fasce prenotabili per questo campo.'
              );
              return;
            }
          const k = W.find((x) => {
            if (x.id === I.id || x.courtId !== r) return !1;
            const z = new Date(x.start),
              N = j(z, x.duration);
            return ae(p, E, z, N);
          });
          if (k) {
            (console.log('🚫 Conflict detected with booking:', k.id),
              alert("Lo slot di destinazione è già occupato da un'altra prenotazione."));
            return;
          }
          for (const x of C) {
            const z = j(x, n.slotMinutes);
            if (
              W.find((F) => {
                if (F.id === I.id || F.courtId !== r) return !1;
                const i = new Date(F.start),
                  w = j(i, F.duration);
                return ae(x, z, i, w);
              })
            ) {
              (console.log('🚫 Slot conflict detected at:', x.toISOString()),
                alert("Lo slot di destinazione è già occupato da un'altra prenotazione."));
              return;
            }
          }
          console.log('✅ Drop validation passed, updating booking...');
          const $ = new Date(p.getTime() - p.getTimezoneOffset() * 6e4),
            h = $.toISOString().split('T')[0],
            B = $.toISOString().split('T')[1].substring(0, 5);
          (console.log('🔄 Updating booking with:', {
            bookingId: I.id,
            newCourtId: r,
            newDateStr: h,
            newTimeStr: B,
            targetTimeLocal: p.toLocaleString('it-IT'),
          }),
            await A(I.id, {
              courtId: r,
              courtName: Me(r),
              date: h,
              time: B,
              updatedAt: new Date().toISOString(),
            }),
            console.log('✅ Booking moved successfully'),
            y &&
              setTimeout(() => {
                (console.log('🔄 Refreshing bookings after drag & drop...'), y());
              }, 500));
        } catch (o) {
          (console.error('❌ Error moving booking:', o),
            alert('Errore durante lo spostamento della prenotazione.'));
        }
        ye(null);
      }
    },
    Ve = 52;
  function qe(t, r) {
    const o = (se.get(t) || []).find((i) => {
        const w = new Date(i.start),
          M = j(new Date(i.start), i.duration);
        return ae(w, M, r, j(r, n.slotMinutes));
      }),
      d = te(r, t, m);
    if (!o && !d) {
      const i = r.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return e.jsx('div', {
        className:
          'relative w-full h-9 rounded-lg ring-1 text-[11px] font-medium bg-gray-200 dark:bg-gray-800 opacity-50 cursor-not-allowed border-dashed border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center',
        title: 'Fuori fascia oraria per questo campo',
        children: e.jsx('span', {
          className: 'absolute inset-0 grid place-items-center text-[11px] opacity-80',
          children: i,
        }),
      });
    }
    if (!o) {
      const i = we(r, n, t, m),
        w = Le(i.rate),
        M = i.source === 'discounted' || i.isPromo,
        Z = r.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        X = ke && ke.courtId === t && ke.slots?.some((ie) => ie.time === r.getTime()),
        ge =
          I && I.start && new Date(I.start).toDateString() === r.toDateString() && t !== I.courtId;
      return e.jsxs('button', {
        type: 'button',
        onClick: () => Ie(t, r),
        className: `relative w-full h-9 rounded-lg ring-1 text-[11px] font-medium transition-all duration-200 ${X ? 'ring-2 ring-blue-500 ring-offset-1 scale-105' : ge ? 'ring-2 ring-red-300 ring-offset-1 opacity-75' : ''}`,
        style: {
          background: X
            ? 'rgba(59, 130, 246, 0.2)'
            : ge
              ? 'rgba(239, 68, 68, 0.1)'
              : `rgba(16,185,129,${w})`,
          borderColor: X
            ? 'rgba(59, 130, 246, 0.6)'
            : ge
              ? 'rgba(239, 68, 68, 0.3)'
              : 'rgba(16,185,129,0.35)',
        },
        title: X
          ? 'Rilascia qui per spostare la prenotazione'
          : ge
            ? 'Disponibile per nuove prenotazioni (non compatibile con lo spostamento)'
            : i.isPromo
              ? 'Fascia Promo'
              : M
                ? 'Fascia scontata'
                : 'Tariffa standard',
        onDragOver: L ? (ie) => Ue(ie, t, r) : void 0,
        onDragLeave: L ? Ze : void 0,
        onDrop: L ? (ie) => Ye(ie, t, r) : void 0,
        children: [
          M &&
            e.jsx('span', {
              className:
                'absolute top-0.5 right-0.5 px-1.5 py-[1px] rounded-full text-[10px] leading-none',
              style: {
                background: 'rgba(16,185,129,0.9)',
                color: '#0b0b0b',
                border: '1px solid rgba(16,185,129,0.6)',
              },
              children: '★ Promo',
            }),
          e.jsx('span', {
            className: 'absolute inset-0 grid place-items-center text-[11px] opacity-90',
            children: Z,
          }),
        ],
      });
    }
    const p = new Date(o.start),
      E = j(p, o.duration);
    if (!(r.getTime() === p.getTime())) return e.jsx('div', { className: 'w-full h-9' });
    const $ = Math.ceil((E - r) / (n.slotMinutes * 60 * 1e3)) * Ve - 6,
      h = (
        o.playerNames && o.playerNames.length
          ? o.playerNames
          : (o.players || []).map((i) => S?.[i]?.name || '—')
      )
        .concat(o.guestNames || [])
        .slice(0, 4),
      B = e.jsx('span', { className: 'text-2xl', children: '💡' }),
      x = e.jsx('span', { className: 'text-2xl', children: '🔥' });
    let z = 'rgba(220, 38, 127, 0.35)',
      N = 'rgba(220, 38, 127, 0.6)';
    const F =
      o.isLessonBooking ||
      (o.notes && o.notes.includes('Lezione con')) ||
      o.instructorId ||
      o.instructorName;
    if (o.color) {
      const i = o.color.replace('#', ''),
        w = parseInt(i.substr(0, 2), 16),
        M = parseInt(i.substr(2, 2), 16),
        Z = parseInt(i.substr(4, 2), 16);
      ((z = `rgba(${w}, ${M}, ${Z}, 0.35)`), (N = `rgba(${w}, ${M}, ${Z}, 0.6)`));
    } else if (F) {
      let i = null;
      if (o.instructorId) i = R.find((w) => w.id === o.instructorId);
      else {
        const w = o.notes.match(/Lezione con (.+)/);
        if (w) {
          const M = w[1];
          i = R.find((Z) => Z.name === M);
        }
      }
      if (i && i.instructorData?.color) {
        const w = i.instructorData.color.replace('#', ''),
          M = parseInt(w.substr(0, 2), 16),
          Z = parseInt(w.substr(2, 2), 16),
          X = parseInt(w.substr(4, 2), 16);
        ((z = `rgba(${M}, ${Z}, ${X}, 0.35)`), (N = `rgba(${M}, ${Z}, ${X}, 0.6)`));
      }
    }
    return e.jsx('div', {
      className: 'w-full h-9 relative',
      children: e.jsxs('button', {
        type: 'button',
        onClick: () => Ce(o),
        className: `absolute left-0 right-0 px-2 py-2 ring-1 text-left text-[13px] font-semibold flex flex-col justify-center transition-all duration-200 ${L ? 'cursor-grab hover:shadow-lg' : ''}`,
        style: {
          top: 0,
          height: `${$}px`,
          background: z,
          borderColor: N,
          borderRadius: '8px',
          overflow: 'hidden',
        },
        title: `${Me(o.courtId)} — ${p.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${o.duration}′) • ${L ? 'Trascina per spostare o clicca per modificare' : 'Clicca per modificare'}`,
        draggable: L,
        onDragStart: L ? (i) => Fe(i, o) : void 0,
        onDragEnd: L ? Ge : void 0,
        onMouseDown: L ? (i) => (i.target.style.cursor = 'grabbing') : void 0,
        onMouseUp: L ? (i) => (i.target.style.cursor = 'grab') : void 0,
        children: [
          e.jsxs('div', {
            className: 'absolute left-2 top-2 flex flex-row items-center gap-2 z-20',
            children: [o.addons?.lighting && B, o.addons?.heating && x],
          }),
          F &&
            (() => {
              let i = null,
                w = '';
              if (o.instructorId) i = R.find((M) => M.id === o.instructorId);
              else {
                const M = o.notes.match(/Lezione con (.+)/);
                if (M) {
                  const Z = M[1];
                  i = R.find((X) => X.name === Z);
                }
              }
              return (
                i?.name && (w = i.name.trim().split(/\s+/)[0]),
                e.jsx('div', {
                  className: 'absolute right-2 top-2 z-30',
                  children: e.jsxs('span', {
                    className:
                      'text-[13px] px-2 py-1 bg-orange-500 text-white rounded-lg font-bold flex items-center gap-1 shadow-lg border-2 border-white',
                    title: `Lezione${i?.name ? ` con ${i.name}` : ''}`,
                    children: [
                      '🎾',
                      w &&
                        e.jsx('span', {
                          className: 'text-[11px] font-bold uppercase',
                          children: w,
                        }),
                    ],
                  }),
                })
              );
            })(),
          e.jsx('div', {
            className: 'flex items-center justify-between gap-2 mb-1 mt-2',
            children: e.jsxs('div', {
              className: 'min-w-0 flex flex-col',
              children: [
                e.jsxs('span', {
                  className: 'font-bold text-[15px] leading-tight',
                  children: [
                    p.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    ' -',
                    ' ',
                    E.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    ' •',
                    ' ',
                    me(o.price),
                  ],
                }),
                e.jsx('span', {
                  className: 'flex items-center gap-2 mt-1',
                  children: e.jsx('div', {
                    className: 'text-[10px] font-medium opacity-80 flex flex-wrap gap-1',
                    children: h.map((i, w) =>
                      e.jsx(
                        'span',
                        {
                          className: 'bg-white/20 px-1 py-0.5 rounded text-[9px] font-medium',
                          children: i,
                        },
                        w
                      )
                    ),
                  }),
                }),
              ],
            }),
          }),
          e.jsxs('div', {
            className: 'text-[12px] opacity-80 truncate',
            children: [
              'Prenotato da:',
              ' ',
              e.jsx('span', {
                className: 'font-semibold',
                children: o.bookedByName || h[0] || '—',
              }),
            ],
          }),
          o.note &&
            e.jsx('div', { className: 'text-[11px] opacity-70 mt-1 truncate', children: o.note }),
          e.jsx('div', {
            className: 'absolute bottom-2 right-2 z-20',
            children: e.jsxs('span', {
              className: 'text-[13px] opacity-80 font-bold bg-black/20 px-2 py-1 rounded',
              children: [Math.round(o.duration), '′'],
            }),
          }),
        ],
      }),
    });
  }
  const ee = c.useMemo(
    () =>
      !a.start || !a.courtId
        ? null
        : Te(
            new Date(a.start),
            a.duration,
            n,
            { lighting: a.useLighting, heating: a.useHeating },
            a.courtId,
            m
          ),
    [a.start, a.duration, a.courtId, a.useLighting, a.useHeating, n, m]
  );
  return (
    c.useMemo(() => (ee == null ? null : ee / 4), [ee]),
    e.jsxs(Qe, {
      title: 'Gestione Campi',
      T: l,
      children: [
        L &&
          e.jsx('div', {
            className:
              'mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg',
            children: e.jsxs('div', {
              className: 'flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300',
              children: [
                e.jsx('span', { className: 'text-lg', children: '🖱️' }),
                e.jsx('span', { className: 'font-medium', children: 'Drag & Drop attivo:' }),
                e.jsx('span', {
                  children:
                    'Trascina le prenotazioni per spostarle su slot liberi dello stesso giorno',
                }),
              ],
            }),
          }),
        f
          ? e.jsxs(e.Fragment, {
              children: [
                e.jsx('div', {
                  className: `flex flex-col items-center gap-6 mb-6 ${l.cardBg} ${l.border} p-6 rounded-xl shadow-lg`,
                  children: e.jsxs('div', {
                    className: 'flex items-center justify-center gap-6',
                    children: [
                      e.jsx('button', {
                        type: 'button',
                        className:
                          'w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-2xl font-bold shadow-lg hover:scale-110 transition-all duration-200 flex items-center justify-center',
                        onClick: () => U(-1),
                        title: 'Giorno precedente',
                        children: '←',
                      }),
                      e.jsx('button', {
                        type: 'button',
                        onClick: () => G(!0),
                        className:
                          'text-3xl font-bold cursor-pointer hover:scale-105 transition-transform bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-lime-400 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800',
                        title: 'Clicca per aprire calendario',
                        children: Be,
                      }),
                      e.jsx('button', {
                        type: 'button',
                        className:
                          'w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-2xl font-bold shadow-lg hover:scale-110 transition-all duration-200 flex items-center justify-center',
                        onClick: () => U(1),
                        title: 'Giorno successivo',
                        children: '→',
                      }),
                    ],
                  }),
                }),
                Q &&
                  e.jsx('div', {
                    className:
                      'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
                    children: e.jsxs('div', {
                      className: `${l.cardBg} ${l.border} rounded-2xl shadow-2xl p-8 max-w-2xl w-full`,
                      children: [
                        e.jsxs('div', {
                          className: 'flex items-center justify-between mb-6',
                          children: [
                            e.jsx('h3', {
                              className: `text-2xl font-bold ${l.text} flex items-center gap-2`,
                              children: '📅 Seleziona data',
                            }),
                            e.jsx('button', {
                              type: 'button',
                              onClick: () => G(!1),
                              className:
                                'w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-2xl font-bold transition-colors',
                              title: 'Chiudi',
                              children: '✕',
                            }),
                          ],
                        }),
                        e.jsx(it, {
                          currentDay: D,
                          onSelectDay: (t) => {
                            (q(t), G(!1));
                          },
                          T: l,
                        }),
                        e.jsxs('div', {
                          className: 'mt-6 grid grid-cols-3 gap-3',
                          children: [
                            e.jsx('button', {
                              type: 'button',
                              onClick: () => {
                                (b(), G(!1));
                              },
                              className: `${l.btnPrimary} py-3 text-sm font-semibold flex items-center justify-center gap-2`,
                              children: '🏠 Oggi',
                            }),
                            e.jsx('button', {
                              type: 'button',
                              onClick: () => {
                                (U(-1), G(!1));
                              },
                              className: `${l.btnGhost} py-3 text-sm font-medium`,
                              children: '← Ieri',
                            }),
                            e.jsx('button', {
                              type: 'button',
                              onClick: () => {
                                (U(1), G(!1));
                              },
                              className: `${l.btnGhost} py-3 text-sm font-medium`,
                              children: 'Domani →',
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                e.jsx('div', {
                  className: 'md:hidden mb-4',
                  children: e.jsxs('div', {
                    className: 'flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1',
                    children: [
                      e.jsx('button', {
                        onClick: () => he('overview'),
                        className: `flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-semibold transition-all ${ue === 'overview' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-emerald-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`,
                        children: '📊 Panoramica',
                      }),
                      e.jsx('button', {
                        onClick: () => he('detail'),
                        className: `flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-semibold transition-all ${ue === 'detail' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-emerald-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`,
                        children: '🔍 Dettaglio',
                      }),
                    ],
                  }),
                }),
                ue === 'overview' &&
                  e.jsx('div', {
                    className: 'md:hidden mb-6',
                    children: e.jsx('div', {
                      className: 'grid grid-cols-2 gap-3',
                      children: m.map((t) => {
                        const r = V.filter((p) => {
                            const E = p,
                              C = j(p, n.slotMinutes),
                              k = te(p, t.id, m),
                              $ = se.get(t.id)?.some((h) => {
                                const B = new Date(h.start),
                                  x = j(new Date(h.start), h.duration);
                                return ae(E, C, B, x);
                              });
                            return k && !$;
                          }).length,
                          s = V.filter((p) => te(p, t.id, m)).length || 0,
                          o = s - r,
                          d = r / s;
                        return e.jsxs(
                          'div',
                          {
                            className: `${l.cardBg} ${l.border} rounded-xl p-4 shadow-md`,
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-center gap-2 mb-3',
                                children: [
                                  e.jsx('span', {
                                    className:
                                      'w-8 h-8 rounded-full bg-blue-400 dark:bg-emerald-400 text-white flex items-center justify-center font-bold text-sm shadow',
                                    children: t.name[0],
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex-1',
                                    children: [
                                      e.jsx('div', {
                                        className: 'font-semibold text-sm',
                                        children: t.name,
                                      }),
                                      t.hasHeating &&
                                        e.jsx('div', {
                                          className: 'text-xs text-orange-500 dark:text-orange-400',
                                          children: '🔥 Riscaldato',
                                        }),
                                    ],
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                className: 'mb-2',
                                children: [
                                  e.jsxs('div', {
                                    className: 'flex justify-between text-xs mb-1',
                                    children: [
                                      e.jsxs('span', {
                                        className: 'text-green-600 dark:text-green-400',
                                        children: ['Liberi: ', r],
                                      }),
                                      e.jsxs('span', {
                                        className: 'text-red-600 dark:text-red-400',
                                        children: ['Occupati: ', o],
                                      }),
                                    ],
                                  }),
                                  e.jsx('div', {
                                    className:
                                      'w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2',
                                    children: e.jsx('div', {
                                      className: `h-2 rounded-full transition-all duration-300 ${d > 0.7 ? 'bg-green-500' : d > 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`,
                                      style: { width: `${d * 100}%` },
                                    }),
                                  }),
                                ],
                              }),
                              e.jsx('button', {
                                onClick: () => {
                                  (De(t.id), he('detail'));
                                },
                                className: `w-full ${l.btnGhost} py-2 text-xs font-semibold`,
                                children: 'Visualizza dettaglio',
                              }),
                            ],
                          },
                          t.id
                        );
                      }),
                    }),
                  }),
                ue === 'detail' &&
                  e.jsxs('div', {
                    className: 'md:hidden mb-6',
                    children: [
                      e.jsx('div', {
                        className: 'mb-4',
                        children: e.jsxs('select', {
                          value: fe,
                          onChange: (t) => De(t.target.value),
                          className: `w-full ${l.input} text-sm`,
                          children: [
                            e.jsx('option', { value: 'all', children: 'Tutti i campi' }),
                            m.map((t) => e.jsx('option', { value: t.id, children: t.name }, t.id)),
                          ],
                        }),
                      }),
                      e.jsx('div', {
                        className: 'space-y-2',
                        children: V.map((t) => {
                          const r = t.toLocaleTimeString('it-IT', {
                              hour: '2-digit',
                              minute: '2-digit',
                            }),
                            o = j(t, n.slotMinutes).toLocaleTimeString('it-IT', {
                              hour: '2-digit',
                              minute: '2-digit',
                            });
                          return e.jsxs(
                            'div',
                            {
                              className: `${l.cardBg} ${l.border} rounded-lg p-3 shadow-sm`,
                              children: [
                                e.jsxs('div', {
                                  className: 'flex items-center justify-between mb-2',
                                  children: [
                                    e.jsxs('div', {
                                      className: 'font-semibold text-base',
                                      children: [r, ' - ', o],
                                    }),
                                    e.jsx('div', {
                                      className: 'text-xs text-gray-500 dark:text-gray-400',
                                      children: t.toLocaleDateString('it-IT', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short',
                                      }),
                                    }),
                                  ],
                                }),
                                e.jsx('div', {
                                  className: 'grid grid-cols-2 gap-2',
                                  children: m
                                    .filter((d) => fe === 'all' || d.id === fe)
                                    .map((d) => {
                                      const p = t,
                                        E = j(t, n.slotMinutes),
                                        C = te(t, d.id, m),
                                        k = se.get(d.id)?.find((x) => {
                                          const z = new Date(x.start),
                                            N = j(new Date(x.start), x.duration);
                                          return ae(p, E, z, N);
                                        }),
                                        $ = !k && C;
                                      $ &&
                                        (t.toISOString().split('T')[0],
                                        t.toISOString().split('T')[1].substring(0, 5),
                                        n.slotMinutes,
                                        Array.from(se.get(d.id) || []).map((x) => ({
                                          courtId: d.id,
                                          date: x.start.split('T')[0],
                                          time: x.start.split('T')[1].substring(0, 5),
                                          duration: x.duration,
                                          status: 'booked',
                                        })));
                                      const h = $,
                                        B = pe(d.id, t);
                                      return e.jsxs(
                                        'button',
                                        {
                                          onClick: () => {
                                            if (C) {
                                              if (h) return Ie(d.id, t);
                                              if (k) return Ce(k);
                                            }
                                          },
                                          className: `p-2 rounded-lg text-sm font-medium transition-all ${h ? `hover:scale-105 ${l.btnGhost} border-2 ${B ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : 'border-green-200 dark:border-green-700'}` : C ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-700 cursor-not-allowed'}`,
                                          children: [
                                            e.jsxs('div', {
                                              className: 'flex items-center gap-1 justify-center',
                                              children: [
                                                e.jsx('span', {
                                                  className: `w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${h ? 'bg-green-500 text-white' : C ? 'bg-red-500 text-white' : 'bg-gray-400 text-white'}`,
                                                  children: d.name[0],
                                                }),
                                                e.jsx('span', { children: d.name }),
                                              ],
                                            }),
                                            B &&
                                              h &&
                                              e.jsx('div', {
                                                className:
                                                  'text-xs text-yellow-600 dark:text-yellow-400 mt-1',
                                                children: '🏷️ Promo',
                                              }),
                                            !C &&
                                              e.jsx('div', {
                                                className:
                                                  'text-xs mt-1 text-gray-500 dark:text-gray-400',
                                                children: 'Fuori fascia',
                                              }),
                                            C &&
                                              !h &&
                                              k &&
                                              e.jsxs('div', {
                                                className: 'text-xs mt-1 truncate',
                                                children: [
                                                  e.jsx('div', {
                                                    className: 'font-medium',
                                                    children: k.bookedByName || 'Occupato',
                                                  }),
                                                  e.jsx('div', {
                                                    className:
                                                      'text-gray-400 dark:text-gray-500 text-[10px]',
                                                    children: '👆 Clicca per dettagli',
                                                  }),
                                                ],
                                              }),
                                          ],
                                        },
                                        d.id
                                      );
                                    }),
                                }),
                              ],
                            },
                            t.getTime()
                          );
                        }),
                      }),
                    ],
                  }),
                e.jsx(nt, {
                  children: e.jsxs('div', {
                    className: 'min-w-[720px] grid gap-2',
                    style: { gridTemplateColumns: `repeat(${m.length}, 1fr)` },
                    children: [
                      m.map((t) =>
                        e.jsx(
                          'div',
                          {
                            className: `px-2 py-3 text-base font-bold text-center rounded-xl shadow-md mb-2 ${l.cardBg} ${l.border}`,
                            children: e.jsxs('span', {
                              className: 'inline-flex items-center gap-2',
                              children: [
                                e.jsx('span', {
                                  className:
                                    'w-7 h-7 rounded-full bg-blue-400 dark:bg-emerald-400 text-white flex items-center justify-center font-bold shadow',
                                  children: t.name[0],
                                }),
                                e.jsxs('div', {
                                  className: 'flex flex-col items-start',
                                  children: [
                                    e.jsx('span', { children: t.name }),
                                    a.start &&
                                      pe(t.id, a.start) &&
                                      e.jsx('span', {
                                        className:
                                          'text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-2 py-0.5 rounded-full font-medium',
                                        children: '🏷️ Promo',
                                      }),
                                    t.hasHeating &&
                                      e.jsx('span', {
                                        className:
                                          'text-xs text-orange-500 dark:text-orange-400 font-medium',
                                        children: '🔥 Riscaldato',
                                      }),
                                  ],
                                }),
                              ],
                            }),
                          },
                          `hdr_${t.id}`
                        )
                      ),
                      V.map((t, r) =>
                        e.jsx(
                          Ee.Fragment,
                          {
                            children: m.map((s) =>
                              e.jsx(
                                'div',
                                {
                                  className: `px-0.5 py-0.5 ${l.cardBg} ${l.border} rounded-lg`,
                                  children: qe(s.id, t),
                                },
                                s.id + '_' + r
                              )
                            ),
                          },
                          t.getTime()
                        )
                      ),
                    ],
                  }),
                }),
                e.jsx(et, {
                  open: je,
                  onClose: () => K(!1),
                  title: H ? 'Modifica prenotazione' : 'Nuova prenotazione',
                  T: l,
                  size: 'xl',
                  children: a.start
                    ? e.jsxs('div', {
                        className: 'relative',
                        children: [
                          e.jsx('div', {
                            className:
                              'absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl',
                          }),
                          e.jsxs('div', {
                            className:
                              'relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-4 shadow-2xl',
                            children: [
                              e.jsxs('div', {
                                className: 'grid sm:grid-cols-2 gap-4',
                                children: [
                                  e.jsxs('div', {
                                    className: 'sm:col-span-2 flex flex-col gap-1',
                                    children: [
                                      e.jsx('label', {
                                        className:
                                          'text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
                                        children: '🎯 Tipo prenotazione',
                                      }),
                                      e.jsxs('select', {
                                        value: a.bookingType,
                                        onChange: (t) => {
                                          const r = t.target.value;
                                          T((s) => ({
                                            ...s,
                                            bookingType: r,
                                            instructorId: r === 'partita' ? '' : s.instructorId,
                                          }));
                                        },
                                        className:
                                          'px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium',
                                        children: [
                                          e.jsx('option', {
                                            value: 'partita',
                                            children: '🏓 Partita',
                                          }),
                                          e.jsx('option', {
                                            value: 'lezione',
                                            children: '👨‍🏫 Lezione',
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  a.bookingType === 'lezione' &&
                                    e.jsxs('div', {
                                      className: 'sm:col-span-2 flex flex-col gap-1',
                                      children: [
                                        e.jsx('label', {
                                          className:
                                            'text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
                                          children: '👨‍🏫 Maestro',
                                        }),
                                        e.jsxs('select', {
                                          value: a.instructorId,
                                          onChange: (t) =>
                                            T((r) => ({ ...r, instructorId: t.target.value })),
                                          className:
                                            'px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium',
                                          required: a.bookingType === 'lezione',
                                          children: [
                                            e.jsx('option', {
                                              value: '',
                                              children: '-- Seleziona un maestro --',
                                            }),
                                            R.map((t) =>
                                              e.jsxs(
                                                'option',
                                                {
                                                  value: t.id,
                                                  children: [
                                                    t.name,
                                                    t.instructorData?.specialties?.length > 0 &&
                                                      ` (${t.instructorData.specialties.join(', ')})`,
                                                  ],
                                                },
                                                t.id
                                              )
                                            ),
                                          ],
                                        }),
                                        a.bookingType === 'lezione' &&
                                          !a.instructorId &&
                                          e.jsx('div', {
                                            className:
                                              'text-sm text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-red-200/50 dark:border-red-800/30',
                                            children: '⚠️ Seleziona un maestro per le lezioni',
                                          }),
                                      ],
                                    }),
                                  e.jsxs('div', {
                                    className: 'flex flex-col gap-1',
                                    children: [
                                      e.jsx('label', {
                                        className:
                                          'text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
                                        children: '🏟️ Campo',
                                      }),
                                      e.jsx('select', {
                                        value: a.courtId,
                                        onChange: (t) =>
                                          T((r) => ({ ...r, courtId: t.target.value })),
                                        className:
                                          'px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium',
                                        children: f.courts.map((t) =>
                                          e.jsx('option', { value: t.id, children: t.name }, t.id)
                                        ),
                                      }),
                                      a.courtId &&
                                        pe(a.courtId, a.start) &&
                                        e.jsx('div', {
                                          className:
                                            'text-sm bg-gradient-to-r from-yellow-400/80 to-orange-400/80 text-yellow-900 dark:text-yellow-100 px-2 py-1 rounded-lg font-semibold inline-flex items-center gap-1 w-fit backdrop-blur-sm border border-yellow-300/50',
                                          children: '🏷️ Fascia Promo',
                                        }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex flex-col gap-1',
                                    children: [
                                      e.jsx('label', {
                                        className:
                                          'text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
                                        children: '⏰ Inizio',
                                      }),
                                      e.jsx('input', {
                                        type: 'time',
                                        value: `${String(new Date(a.start).getHours()).padStart(2, '0')}:${String(new Date(a.start).getMinutes()).padStart(2, '0')}`,
                                        onChange: (t) => {
                                          const [r, s] = t.target.value.split(':').map(Number),
                                            o = new Date(a.start);
                                          (o.setHours(r, s, 0, 0),
                                            T((d) => ({ ...d, start: re(o, n.slotMinutes) })));
                                        },
                                        className:
                                          'px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium',
                                      }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex flex-col gap-2',
                                    children: [
                                      e.jsx('label', {
                                        className:
                                          'text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
                                        children: '⏱️ Durata',
                                      }),
                                      e.jsx('select', {
                                        value: a.duration,
                                        onChange: (t) =>
                                          T((r) => ({ ...r, duration: Number(t.target.value) })),
                                        className:
                                          'px-4 py-3 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium',
                                        children: (n.defaultDurations || [60, 90, 120]).map((t) =>
                                          e.jsxs(
                                            'option',
                                            { value: t, children: [t, ' minuti'] },
                                            t
                                          )
                                        ),
                                      }),
                                    ],
                                  }),
                                  e.jsx('div', {
                                    className: 'sm:col-span-1',
                                    children: e.jsxs('div', {
                                      className:
                                        'bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm rounded-lg p-2 border border-white/20 dark:border-gray-600/20',
                                      children: [
                                        e.jsx('div', {
                                          className: 'flex items-center gap-1 mb-1',
                                          children: e.jsx('h3', {
                                            className:
                                              'text-xs font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
                                            children: '⚡ Servizi',
                                          }),
                                        }),
                                        e.jsxs('div', {
                                          className: 'flex flex-col gap-2',
                                          children: [
                                            n.addons?.lightingEnabled &&
                                              e.jsxs('label', {
                                                className:
                                                  'inline-flex items-center gap-2 cursor-pointer bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-100/50 dark:hover:bg-blue-800/30 transition-all duration-200',
                                                children: [
                                                  e.jsx('input', {
                                                    type: 'checkbox',
                                                    checked: a.useLighting,
                                                    onChange: (t) =>
                                                      T((r) => ({
                                                        ...r,
                                                        useLighting: t.target.checked,
                                                      })),
                                                    className:
                                                      'w-4 h-4 text-blue-600 bg-white/50 border-blue-300 rounded focus:ring-blue-500 focus:ring-2',
                                                  }),
                                                  e.jsxs('div', {
                                                    className: 'flex flex-col',
                                                    children: [
                                                      e.jsx('span', {
                                                        className:
                                                          'text-sm font-semibold text-blue-700 dark:text-blue-300',
                                                        children: '💡 Illuminazione',
                                                      }),
                                                      e.jsxs('span', {
                                                        className:
                                                          'text-xs text-blue-600 dark:text-blue-400',
                                                        children: [
                                                          '+',
                                                          me(n.addons.lightingFee || 0),
                                                        ],
                                                      }),
                                                    ],
                                                  }),
                                                ],
                                              }),
                                            n.addons?.heatingEnabled &&
                                              m.find((r) => r.id === a.courtId)?.hasHeating &&
                                              e.jsxs('label', {
                                                className:
                                                  'inline-flex items-center gap-2 cursor-pointer bg-purple-50/50 dark:bg-purple-900/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-purple-200/50 dark:border-purple-800/30 hover:bg-purple-100/50 dark:hover:bg-purple-800/30 transition-all duration-200',
                                                children: [
                                                  e.jsx('input', {
                                                    type: 'checkbox',
                                                    checked: a.useHeating,
                                                    onChange: (r) =>
                                                      T((s) => ({
                                                        ...s,
                                                        useHeating: r.target.checked,
                                                      })),
                                                    className:
                                                      'w-4 h-4 text-purple-600 bg-white/50 border-purple-300 rounded focus:ring-purple-500 focus:ring-2',
                                                  }),
                                                  e.jsxs('div', {
                                                    className: 'flex flex-col',
                                                    children: [
                                                      e.jsx('span', {
                                                        className:
                                                          'text-sm font-semibold text-purple-700 dark:text-purple-300',
                                                        children: '🔥 Riscaldamento',
                                                      }),
                                                      e.jsxs('span', {
                                                        className:
                                                          'text-xs text-purple-600 dark:text-purple-400',
                                                        children: [
                                                          '+',
                                                          me(n.addons.heatingFee || 0),
                                                        ],
                                                      }),
                                                    ],
                                                  }),
                                                ],
                                              }),
                                          ],
                                        }),
                                        e.jsx('div', {
                                          className: 'mt-4 flex justify-end',
                                          children: e.jsx('div', {
                                            className:
                                              'bg-gradient-to-r from-emerald-500/90 to-blue-500/90 backdrop-blur-xl rounded-xl border border-white/20 px-4 py-3 shadow-xl',
                                            children: e.jsxs('div', {
                                              className: 'text-right',
                                              children: [
                                                e.jsxs('div', {
                                                  className: 'text-lg font-bold text-white',
                                                  children: ['Totale: ', ee == null ? '—' : me(ee)],
                                                }),
                                                ee != null &&
                                                  e.jsxs('div', {
                                                    className: 'text-sm text-emerald-100 mt-1',
                                                    children: ['/ giocatore: ', tt(ee / 4)],
                                                  }),
                                              ],
                                            }),
                                          }),
                                        }),
                                      ],
                                    }),
                                  }),
                                  e.jsxs('div', {
                                    children: [
                                      e.jsx('div', {
                                        className:
                                          'text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2',
                                        children: '👥 Giocatori',
                                      }),
                                      e.jsx('div', {
                                        className: 'grid grid-cols-2 gap-3',
                                        children: [
                                          ['p1Name', 'Giocatore 1'],
                                          ['p2Name', 'Giocatore 2'],
                                          ['p3Name', 'Giocatore 3'],
                                          ['p4Name', 'Giocatore 4'],
                                        ].map(([t, r]) =>
                                          e.jsxs(
                                            'div',
                                            {
                                              children: [
                                                e.jsx('label', {
                                                  className:
                                                    'text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block',
                                                  children: r,
                                                }),
                                                e.jsx('input', {
                                                  list: 'players-list',
                                                  value: a[t],
                                                  onChange: (s) =>
                                                    T((o) => ({ ...o, [t]: s.target.value })),
                                                  className:
                                                    'w-full px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200',
                                                  placeholder: 'Nome giocatore',
                                                }),
                                              ],
                                            },
                                            t
                                          )
                                        ),
                                      }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    className: 'space-y-3',
                                    children: [
                                      e.jsxs('div', {
                                        children: [
                                          e.jsx('label', {
                                            className:
                                              'text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1 block',
                                            children: '📝 Prenotazione a nome di',
                                          }),
                                          e.jsx('input', {
                                            value: a.bookedBy,
                                            onChange: (t) =>
                                              T((r) => ({ ...r, bookedBy: t.target.value })),
                                            className:
                                              'w-full px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200',
                                            placeholder: 'Es. Andrea Paris',
                                          }),
                                        ],
                                      }),
                                      e.jsxs('div', {
                                        children: [
                                          e.jsx('label', {
                                            className:
                                              'text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1 block',
                                            children: '💬 Note',
                                          }),
                                          e.jsx('input', {
                                            value: a.note,
                                            onChange: (t) =>
                                              T((r) => ({ ...r, note: t.target.value })),
                                            className:
                                              'w-full px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200',
                                            placeholder: 'Es. Lezioni, torneo, ecc.',
                                          }),
                                        ],
                                      }),
                                      e.jsxs('div', {
                                        children: [
                                          e.jsxs('label', {
                                            className:
                                              'text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1 block',
                                            children: [
                                              '🎨 Colore prenotazione',
                                              a.bookingType === 'lezione' &&
                                                a.instructorId &&
                                                e.jsx('span', {
                                                  className:
                                                    'ml-2 text-xs text-blue-600 dark:text-blue-400 font-normal',
                                                  children: '(Colore del maestro)',
                                                }),
                                              a.bookingType === 'partita' &&
                                                e.jsx('span', {
                                                  className:
                                                    'ml-2 text-xs text-pink-600 dark:text-pink-400 font-normal',
                                                  children: '(Colore standard partita)',
                                                }),
                                            ],
                                          }),
                                          e.jsxs('div', {
                                            className: 'space-y-4',
                                            children: [
                                              e.jsxs('div', {
                                                className: 'flex items-center gap-3',
                                                children: [
                                                  e.jsx('input', {
                                                    type: 'color',
                                                    value: a.color,
                                                    onChange: (t) =>
                                                      T((r) => ({ ...r, color: t.target.value })),
                                                    className:
                                                      'w-12 h-12 rounded-xl border-2 border-white/30 dark:border-gray-600/30 cursor-pointer shadow-lg',
                                                    title: 'Seleziona il colore della prenotazione',
                                                  }),
                                                  e.jsx('div', {
                                                    className: 'flex-1',
                                                    children: e.jsx('div', {
                                                      className:
                                                        'h-12 rounded-xl border-2 flex items-center px-4 text-sm font-semibold shadow-lg backdrop-blur-sm',
                                                      style: {
                                                        backgroundColor: a.color + '33',
                                                        borderColor: a.color,
                                                        color: a.color,
                                                      },
                                                      children: 'Anteprima colore',
                                                    }),
                                                  }),
                                                ],
                                              }),
                                              e.jsxs('div', {
                                                className:
                                                  'bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm rounded-xl p-3 border border-white/20 dark:border-gray-600/20',
                                                children: [
                                                  e.jsx('span', {
                                                    className:
                                                      'text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2',
                                                    children: 'Colori predefiniti:',
                                                  }),
                                                  e.jsx('div', {
                                                    className: 'flex gap-2 flex-wrap',
                                                    children: [
                                                      { color: '#e91e63', name: 'Rosa (default)' },
                                                      { color: '#f44336', name: 'Rosso' },
                                                      { color: '#00bcd4', name: 'Turchese' },
                                                      { color: '#2196f3', name: 'Blu' },
                                                      { color: '#4caf50', name: 'Verde' },
                                                      { color: '#ff9800', name: 'Arancione' },
                                                      { color: '#9c27b0', name: 'Viola' },
                                                      { color: '#607d8b', name: 'Grigio' },
                                                    ].map((t) =>
                                                      e.jsx(
                                                        'button',
                                                        {
                                                          type: 'button',
                                                          onClick: () =>
                                                            T((r) => ({ ...r, color: t.color })),
                                                          className: `w-10 h-10 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-110 shadow-lg ${a.color === t.color ? 'border-gray-800 dark:border-white scale-110 shadow-xl' : 'border-white/50 dark:border-gray-600/50'}`,
                                                          style: { backgroundColor: t.color },
                                                          title: t.name,
                                                        },
                                                        t.color
                                                      )
                                                    ),
                                                  }),
                                                ],
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  e.jsx('datalist', {
                                    id: 'players-list',
                                    children: Oe.map((t) =>
                                      e.jsx('option', { value: t.name }, t.id)
                                    ),
                                  }),
                                  e.jsxs('div', {
                                    className: 'hidden md:flex gap-3 pt-6',
                                    children: [
                                      e.jsx('button', {
                                        type: 'button',
                                        onClick: ze,
                                        className:
                                          'flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105',
                                        children: H
                                          ? '✓ Aggiorna prenotazione'
                                          : '✓ Conferma prenotazione',
                                      }),
                                      e.jsx('button', {
                                        type: 'button',
                                        onClick: () => K(!1),
                                        className:
                                          'px-6 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all duration-200',
                                        children: 'Annulla',
                                      }),
                                      H &&
                                        e.jsx('button', {
                                          type: 'button',
                                          onClick: () => ve(H),
                                          className:
                                            'bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold px-6 py-3 rounded-xl shadow-2xl hover:from-red-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105',
                                          children: '🗑️ Elimina',
                                        }),
                                    ],
                                  }),
                                  e.jsx('div', { className: 'h-16 md:hidden' }),
                                ],
                              }),
                              e.jsx('div', {
                                className:
                                  'md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-t border-white/20 dark:border-gray-700/30 p-4 z-50 shadow-2xl',
                                children: e.jsxs('div', {
                                  className: 'flex gap-3 max-w-md mx-auto',
                                  children: [
                                    e.jsx('button', {
                                      type: 'button',
                                      onClick: ze,
                                      className:
                                        'flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 rounded-xl shadow-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105',
                                      children: H ? '✓ Aggiorna' : '✓ Conferma',
                                    }),
                                    e.jsx('button', {
                                      type: 'button',
                                      onClick: () => K(!1),
                                      className:
                                        'flex-1 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-700 dark:text-gray-300 font-semibold py-4 rounded-xl border border-white/30 dark:border-gray-600/30 hover:bg-white/90 dark:hover:bg-gray-600/90 transition-all duration-200',
                                      children: 'Annulla',
                                    }),
                                    H &&
                                      e.jsx('button', {
                                        type: 'button',
                                        onClick: () => ve(H),
                                        className:
                                          'bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold px-6 py-4 rounded-xl shadow-2xl hover:from-red-600 hover:to-rose-700 transition-all duration-300',
                                        children: '🗑️',
                                      }),
                                  ],
                                }),
                              }),
                            ],
                          }),
                        ],
                      })
                    : e.jsxs('div', {
                        className: 'text-center py-12',
                        children: [
                          e.jsx('div', {
                            className:
                              'w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl',
                            children: e.jsx('span', {
                              className: 'text-3xl text-white',
                              children: '📅',
                            }),
                          }),
                          e.jsx('div', {
                            className:
                              'text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2',
                            children: 'Seleziona uno slot',
                          }),
                          e.jsx('div', {
                            className: 'text-gray-600 dark:text-gray-400',
                            children: 'Clicca su uno slot libero nella griglia per iniziare',
                          }),
                        ],
                      }),
                }),
                je &&
                  a.start &&
                  e.jsxs(e.Fragment, {
                    children: [
                      e.jsxs('div', {
                        className:
                          'fixed bottom-24 left-4 right-4 z-[99999] flex gap-3 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30',
                        children: [
                          e.jsx('button', {
                            type: 'button',
                            onClick: () => K(!1),
                            className:
                              'flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-105',
                            children: '❌ Annulla',
                          }),
                          H &&
                            e.jsx('button', {
                              type: 'button',
                              onClick: () => ve(H),
                              className:
                                'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold px-8 py-4 rounded-xl shadow-2xl transition-all duration-200 hover:scale-105 border border-red-300/50',
                              children: '🗑️ Elimina',
                            }),
                        ],
                      }),
                      H &&
                        e.jsx('div', {
                          className:
                            'fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[99999] md:hidden',
                          children: e.jsx('button', {
                            type: 'button',
                            onClick: () => He(H),
                            className:
                              'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold px-8 py-4 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 border border-red-300/50',
                            children: '🗑️ Elimina',
                          }),
                        }),
                    ],
                  }),
              ],
            })
          : e.jsx('div', {
              className: 'flex items-center justify-center py-12',
              children: e.jsxs('div', {
                className: 'text-center',
                children: [
                  e.jsx('div', { className: 'text-4xl mb-4', children: '⏳' }),
                  e.jsx('h3', {
                    className: 'text-lg font-medium mb-2 text-gray-900 dark:text-white',
                    children: 'Caricamento...',
                  }),
                  e.jsx('p', {
                    className: 'text-gray-500',
                    children: 'Caricamento configurazione campi in corso...',
                  }),
                ],
              }),
            }),
      ],
    })
  );
}
function kt() {
  const f = Ke(),
    { state: v, setState: g, derived: S, playersById: l, loading: O } = _e(),
    { clubMode: P } = Xe(),
    y = Ee.useMemo(() => Je(), []);
  return O || !v
    ? e.jsxs('div', {
        className: `text-center py-12 ${y.cardBg} ${y.border} rounded-xl m-4`,
        children: [
          e.jsx('div', { className: 'text-4xl mb-4', children: '⏳' }),
          e.jsx('h3', {
            className: `text-lg font-medium mb-2 ${y.text}`,
            children: 'Caricamento...',
          }),
          e.jsx('p', {
            className: `${y.subtext}`,
            children: 'Caricamento configurazione campi in corso...',
          }),
        ],
      })
    : P
      ? e.jsx(lt, { T: y, state: v, setState: g, players: S.players, playersById: l })
      : e.jsxs('div', {
          className: `text-center py-12 ${y.cardBg} ${y.border} rounded-xl m-4`,
          children: [
            e.jsx('div', { className: 'text-6xl mb-4', children: '🔒' }),
            e.jsx('h3', {
              className: `text-xl font-bold mb-2 ${y.text}`,
              children: 'Modalità Club Richiesta',
            }),
            e.jsx('p', {
              className: `${y.subtext} mb-4`,
              children:
                'Per accedere alla gestione campi, devi prima sbloccare la modalità club nella sezione Extra.',
            }),
            e.jsx('button', {
              onClick: () => f('/extra'),
              className: `${y.btnPrimary} px-6 py-3`,
              children: 'Vai a Extra per sbloccare',
            }),
          ],
        });
}
export { kt as default };
