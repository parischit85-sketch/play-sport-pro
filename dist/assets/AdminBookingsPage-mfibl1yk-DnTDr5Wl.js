import { j as e, u as Ve, f as We, k as _e, t as Xe } from './index-mfibl1yk-D2ihnd7m.js';
import { r as l, b as ze, c as Je } from './router-mfibl1yk-BvCXkbo6.js';
import { S as Ke } from './Section-mfibl1yk-Bni894MT.js';
import { M as Qe } from './Modal-mfibl1yk-DuoMxXxE.js';
import { a as ge, e as et } from './format-mfibl1yk-DAEZv7Mi.js';
import { g as ke, c as Me, a as tt, i as se } from './pricing-mfibl1yk-BdjzWTQe.js';
import { u as rt } from './useUnifiedBookings-mfibl1yk-D_or3Kbt.js';
import { P as ot } from './playerTypes-mfibl1yk-CIm-hM8a.js';
import './vendor-mfibl1yk-D3F3s8fL.js';
import './firebase-mfibl1yk-X_I_guKF.js';
import './unified-booking-service-mfibl1yk-Dyy4hClR.js';
function at(p, k) {
  return (
    p.getFullYear() === k.getFullYear() &&
    p.getMonth() === k.getMonth() &&
    p.getDate() === k.getDate()
  );
}
function ee(p, k = 30) {
  const g = new Date(p);
  g.setSeconds(0, 0);
  const j = g.getMinutes(),
    d = Math.floor(j / k) * k;
  return (g.setMinutes(d), g);
}
function T(p, k) {
  const g = new Date(p);
  return (g.setMinutes(g.getMinutes() + k), g);
}
function te(p, k, g, j) {
  return p < j && g < k;
}
function nt(p = {}) {
  const { minScale: k = 0.5, maxScale: g = 3, initialScale: j = 1 } = p,
    [d, L] = l.useState(j),
    [P, h] = l.useState(j),
    [Y, A] = l.useState(!1),
    X = l.useRef(null),
    s = l.useRef(0),
    S = l.useCallback((u, x) => {
      const U = u.clientX - x.clientX,
        W = u.clientY - x.clientY;
      return Math.sqrt(U * U + W * W);
    }, []),
    q = l.useCallback(
      (u) => {
        if (u.touches.length === 2) {
          A(!0);
          const x = S(u.touches[0], u.touches[1]);
          ((s.current = x), u.preventDefault());
        }
      },
      [S]
    ),
    Q = l.useCallback(
      (u) => {
        if (u.touches.length === 2 && Y) {
          const U = S(u.touches[0], u.touches[1]) / s.current,
            W = Math.min(g, Math.max(k, P * U));
          (L(W), u.preventDefault());
        }
      },
      [Y, P, k, g, S]
    ),
    G = l.useCallback(
      (u) => {
        u.touches.length < 2 && (A(!1), h(d));
      },
      [d]
    ),
    m = l.useCallback(() => {
      const u = Math.min(g, d * 1.2);
      (L(u), h(u));
    }, [d, g]),
    H = l.useCallback(() => {
      const u = Math.max(k, d * 0.8);
      (L(u), h(u));
    }, [d, k]),
    V = l.useCallback(() => {
      (L(j), h(j));
    }, [j]);
  return (
    l.useEffect(() => {
      const u = X.current;
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
      containerRef: X,
      scale: d,
      isZooming: Y,
      zoomIn: m,
      zoomOut: H,
      resetZoom: V,
      transform: `scale(${d})`,
    }
  );
}
function st({ children: p, className: k = '', T: g }) {
  const {
    containerRef: j,
    scale: d,
    isZooming: L,
    zoomIn: P,
    zoomOut: h,
    resetZoom: Y,
    transform: A,
  } = nt({ minScale: 0.3, maxScale: 2.5, initialScale: 0.7 });
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
            onClick: h,
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
              children: [Math.round(d * 100), '%'],
            }),
            L &&
              e.jsx('div', {
                className: 'text-xs text-blue-500 dark:text-blue-400',
                children: 'Pinch per zoom',
              }),
          ],
        }),
      }),
      e.jsx('div', {
        ref: j,
        className: `w-full overflow-auto ${k}`,
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
            transition: L ? 'none' : 'transform 0.2s ease-out',
            minWidth: '100%',
            minHeight: '100%',
          },
          children: p,
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
function it({ currentDay: p, onSelectDay: k, T: g }) {
  const [j, d] = l.useState(new Date(p.getFullYear(), p.getMonth(), 1)),
    L = new Date();
  L.setHours(0, 0, 0, 0);
  const P = j.getFullYear(),
    h = j.getMonth(),
    Y = new Date(P, h, 1),
    A = new Date(Y);
  A.setDate(A.getDate() - Y.getDay() + 1);
  const X = new Date(A);
  X.setDate(X.getDate() + 41);
  const s = [];
  for (let x = new Date(A); x <= X; x.setDate(x.getDate() + 1)) s.push(new Date(x));
  const S = [
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
      d(new Date(P, h - 1, 1));
    },
    G = () => {
      d(new Date(P, h + 1, 1));
    },
    m = (x) => x.getTime() === L.getTime(),
    H = (x) => x.getTime() === p.getTime(),
    V = (x) => x.getMonth() === h,
    u = (x) => x < L;
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
          e.jsxs('h4', { className: `text-xl font-bold ${g.text}`, children: [S[h], ' ', P] }),
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
        children: q.map((x) =>
          e.jsx(
            'div',
            { className: `text-center text-sm font-semibold ${g.subtext} py-2`, children: x },
            x
          )
        ),
      }),
      e.jsx('div', {
        className: 'grid grid-cols-7 gap-1',
        children: s.map((x, U) => {
          const W = x.getDate(),
            ie = V(x),
            J = m(x),
            re = H(x),
            me = u(x);
          return e.jsx(
            'button',
            {
              type: 'button',
              onClick: () => k(x),
              disabled: me,
              className: `
                h-12 w-full rounded-lg text-sm font-medium transition-all duration-200
                ${re ? 'bg-blue-500 text-white shadow-lg dark:bg-emerald-500' : J ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 dark:bg-emerald-100 dark:text-emerald-700 dark:border-emerald-300' : ie ? 'hover:bg-gray-200 dark:hover:bg-gray-700 ' + g.text : 'text-gray-400 dark:text-gray-600'}
                ${me ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
              `,
              children: W,
            },
            U
          );
        }),
      }),
    ],
  });
}
function lt({ state: p, setState: k, players: g, playersById: j, T: d }) {
  const { user: L } = Ve(),
    {
      bookings: P,
      refresh: h,
      createBooking: Y,
      updateBooking: A,
      deleteBooking: X,
    } = rt({ autoLoadUser: !1, autoLoadLessons: !0, enableRealtime: !0 }),
    s = p?.bookingConfig || {
      slotMinutes: 30,
      dayStartHour: 8,
      dayEndHour: 23,
      defaultDurations: [60, 90, 120],
      addons: {},
    },
    [S, q] = l.useState(() => ee(new Date(), s.slotMinutes)),
    [Q, G] = l.useState(!1),
    m = Array.isArray(p?.courts) ? p.courts : [],
    H = l.useMemo(
      () =>
        (p.players || []).filter(
          (r) => r.category === ot.INSTRUCTOR && r.instructorData?.isInstructor
        ),
      [p.players]
    ),
    V = l.useMemo(
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
    u = l.useMemo(() => {
      const t = Array.isArray(s?.defaultDurations) ? s.defaultDurations : [];
      return t.includes(90) ? 90 : t.length > 0 ? t[0] : 90;
    }, [s]),
    x = () => q(ee(new Date(), s.slotMinutes)),
    U = (t) =>
      q((r) => {
        const n = new Date(r);
        return (n.setDate(n.getDate() + t), n);
      }),
    W = new Date(S);
  W.setHours(s.dayStartHour, 0, 0, 0);
  const ie = new Date(S);
  ie.setHours(s.dayEndHour, 0, 0, 0);
  const J = [],
    re = new Set();
  if (
    (m.forEach((t) => {
      t.timeSlots &&
        t.timeSlots.length > 0 &&
        t.timeSlots.forEach((r) => {
          if (r.days?.includes(S.getDay())) {
            const n = parseInt(r.from.split(':')[0]) * 60 + parseInt(r.from.split(':')[1]),
              a = parseInt(r.to.split(':')[0]) * 60 + parseInt(r.to.split(':')[1]);
            for (let c = n; c < a; c += s.slotMinutes) re.add(c);
          }
        });
    }),
    re.size > 0)
  )
    Array.from(re)
      .sort((r, n) => r - n)
      .forEach((r) => {
        const n = new Date(S);
        (n.setHours(Math.floor(r / 60), r % 60, 0, 0), J.push(n));
      });
  else for (let t = new Date(W); t < ie; t = T(t, s.slotMinutes)) J.push(new Date(t));
  const Te = `${((t) => t.charAt(0).toUpperCase() + t.slice(1))(new Intl.DateTimeFormat('it-IT', { weekday: 'long' }).format(S))} - ${String(S.getDate()).padStart(2, '0')} ${new Intl.DateTimeFormat('it-IT', { month: 'long' }).format(S)} ${S.getFullYear()}`,
    ve = l.useMemo(
      () =>
        (V || [])
          .filter((t) => t && t.status !== 'cancelled')
          .filter((t) => at(new Date(t.start), S))
          .sort((t, r) => new Date(t.start) - new Date(r.start)),
      [V, S]
    ),
    le = l.useMemo(() => {
      const t = new Map(m.map((r) => [r.id, []]));
      for (const r of ve) {
        const n = t.get(r.courtId) || [];
        (n.push(r), t.set(r.courtId, n));
      }
      return t;
    }, [ve, m]),
    de = l.useMemo(
      () =>
        J.map((t) => {
          const r = m.map((n) => ke(t, s, n.id, m).rate);
          return r.length > 0 ? Math.min(...r) : 0;
        }),
      [J, s, m]
    ),
    ce = l.useMemo(() => Math.min(...de), [de]),
    xe = l.useMemo(() => Math.max(...de), [de]),
    $e = (t) =>
      !isFinite(ce) || !isFinite(xe) || ce === xe ? 0.18 : 0.12 + ((t - ce) / (xe - ce)) * 0.22,
    Be = l.useMemo(
      () =>
        [...g].sort((t, r) => (t.name || '').localeCompare(r.name, 'it', { sensitivity: 'base' })),
      [g]
    ),
    Ee = (t) => j?.[t]?.name || '',
    be = (t, r) => (r && ke(r, s, t, m).isPromo) || !1,
    [we, K] = l.useState(!1),
    [R, Ne] = l.useState(null),
    [pe, Le] = l.useState('all'),
    [D, he] = l.useState(null),
    [fe, oe] = l.useState(null),
    [$, Oe] = l.useState(() => window.innerWidth >= 1024),
    [Pe, dt] = l.useState('detail');
  l.useEffect(() => {
    const t = () => {
      Oe(window.innerWidth >= 1024);
    };
    return (window.addEventListener('resize', t), () => window.removeEventListener('resize', t));
  }, []);
  const [o, I] = l.useState({
    courtId: '',
    start: null,
    duration: u,
    numberOfPlayers: 4,
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
  function je(t, r) {
    const n = ee(r, s.slotMinutes);
    (Ne(null),
      I({
        courtId: t,
        start: n,
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
  function Se(t) {
    Ne(t.id);
    const r = new Date(t.start),
      n = (t.players || []).map(Ee);
    let a = t.playerNames && t.playerNames.length ? t.playerNames : n;
    const c = t.bookedByName || '';
    c && !a.includes(c) && (a = [c, ...a].slice(0, 4));
    const f = a.filter((C) => C && C.trim()).length || 1;
    (I({
      courtId: t.courtId,
      start: r,
      duration: t.duration,
      numberOfPlayers: t.numberOfPlayers || f,
      p1Name: a[0] || '',
      p2Name: a[1] || '',
      p3Name: a[2] || '',
      p4Name: a[3] || '',
      note: t.note || '',
      bookedBy: c,
      useLighting: !!t.addons?.lighting,
      useHeating: !!t.addons?.heating,
      color: t.color || '#e91e63',
      bookingType: t.instructorId ? 'lezione' : 'partita',
      instructorId: t.instructorId || '',
    }),
      K(!0));
  }
  function Ae(t, r, n, a = null) {
    const c = new Date(r),
      f = T(r, n),
      C = le.get(t) || [];
    return (
      console.log('🔍 Checking overlap for:', {
        courtId: t,
        blockStart: c.toISOString(),
        blockEnd: f.toISOString(),
        duration: n,
        ignoreId: a,
        existingBookings: C.length,
      }),
      C.find((w) => {
        if (a && w.id === a) return (console.log('⏭️ Ignoring booking:', w.id), !1);
        const E = new Date(w.start),
          y = T(new Date(w.start), w.duration),
          O = te(c, f, E, y);
        return (
          O &&
            console.log('🚫 Overlap detected with booking:', {
              bookingId: w.id,
              bookingStart: E.toISOString(),
              bookingEnd: y.toISOString(),
              bookingDuration: w.duration,
            }),
          O
        );
      })
    );
  }
  const De = l.useRef('');
  (l.useEffect(() => {
    const t = o.p1Name?.trim() || '',
      r = De.current;
    ((!o.bookedBy?.trim() || o.bookedBy?.trim() === r) && t && I((n) => ({ ...n, bookedBy: t })),
      (De.current = t));
  }, [o.p1Name]),
    l.useEffect(() => {
      if (o.bookingType === 'lezione' && o.instructorId && H.length > 0) {
        const t = H.find((r) => r.id === o.instructorId);
        t?.instructorData?.color && I((r) => ({ ...r, color: t.instructorData.color }));
      } else o.bookingType === 'partita' && I((t) => ({ ...t, color: '#e91e63' }));
    }, [o.bookingType, o.instructorId, H]));
  async function Ie() {
    if (!o.courtId || !o.start) {
      alert('Seleziona campo e orario.');
      return;
    }
    if (o.bookingType === 'lezione' && !o.instructorId) {
      alert('Seleziona un maestro per le lezioni.');
      return;
    }
    const t = ee(o.start, s.slotMinutes);
    if (!se(t, o.courtId, m)) {
      alert('Orario fuori dalle fasce prenotabili per questo campo.');
      return;
    }
    if (t < new Date()) {
      alert('Non puoi prenotare nel passato.');
      return;
    }
    const n = R || null;
    if (Ae(o.courtId, t, o.duration, n)) {
      alert('Esiste già una prenotazione che si sovrappone su questo campo.');
      return;
    }
    const a = [o.p1Name, o.p2Name, o.p3Name, o.p4Name].map((N) => (N || '').trim()).filter(Boolean),
      c = (o.bookedBy && o.bookedBy.trim()) || a[0] || '',
      f = Me(
        t,
        o.duration,
        s,
        { lighting: !!o.useLighting, heating: !!o.useHeating },
        o.courtId,
        m
      ),
      C = String(t.getFullYear()).padStart(4, '0'),
      B = String(t.getMonth() + 1).padStart(2, '0'),
      w = String(t.getDate()).padStart(2, '0'),
      E = String(t.getHours()).padStart(2, '0'),
      y = String(t.getMinutes()).padStart(2, '0'),
      O = `${C}-${B}-${w}`,
      b = `${E}:${y}`,
      M = m.find((N) => N.id === o.courtId)?.name || o.courtId;
    try {
      if (R) {
        const N = {
          courtId: o.courtId,
          courtName: M,
          date: O,
          time: b,
          duration: o.duration,
          numberOfPlayers: o.numberOfPlayers,
          lighting: !!o.useLighting,
          heating: !!o.useHeating,
          price: f,
          players: a,
          notes: o.note?.trim() || '',
          color: o.color,
          ...(c ? { bookedBy: c } : {}),
          ...(o.bookingType === 'lezione' && o.instructorId
            ? {
                instructorId: o.instructorId,
                instructorName: H.find((F) => F.id === o.instructorId)?.name || '',
                lessonType: 'individual',
              }
            : { instructorId: null, instructorName: null, lessonType: null }),
        };
        await A(R, N, L);
      } else {
        const N = {
            courtId: o.courtId,
            courtName: M,
            date: O,
            time: b,
            duration: o.duration,
            numberOfPlayers: o.numberOfPlayers,
            lighting: !!o.useLighting,
            heating: !!o.useHeating,
            price: f,
            players: a,
            notes: o.note?.trim() || '',
            type: 'court',
            color: o.color,
            ...(o.bookingType === 'lezione' && o.instructorId
              ? {
                  instructorId: o.instructorId,
                  instructorName: H.find((i) => i.id === o.instructorId)?.name || '',
                  lessonType: 'individual',
                }
              : {}),
          },
          F = await Y(N);
        c && (await A(F.id, { bookedBy: c }));
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
  async function ye(t) {
    if (confirm('Eliminare definitivamente la prenotazione?'))
      try {
        (await X(t), K(!1));
      } catch {
        alert("Errore durante l'eliminazione.");
      }
  }
  const Ce = (t) => m.find((r) => r.id === t)?.name || t,
    Re = (t, r) => {
      $ &&
        (he(r),
        (t.dataTransfer.effectAllowed = 'move'),
        t.dataTransfer.setData('text/plain', r.id),
        (t.target.style.opacity = '0.6'));
    },
    Fe = (t) => {
      $ && (he(null), oe(null), (t.target.style.opacity = '1'));
    },
    Ge = (t, r, n) => {
      if (!$ || !D) return;
      (t.preventDefault(), (t.dataTransfer.dropEffect = 'move'));
      const a = new Date(D.start).toDateString(),
        c = n.toDateString();
      if (a !== c) return;
      const f = ee(n, s.slotMinutes),
        C = D.duration || 60,
        B = T(f, C),
        w = [];
      let E = !1;
      for (let y = new Date(f); y < B; y = T(y, s.slotMinutes)) {
        if (!se(y, r, m)) {
          E = !0;
          break;
        }
        const O = T(y, s.slotMinutes);
        if (
          V.find((M) => {
            if (M.id === D.id || M.courtId !== r) return !1;
            const N = new Date(M.start),
              F = T(N, M.duration);
            return te(y, O, N, F);
          })
        ) {
          E = !0;
          break;
        }
        w.push({ courtId: r, time: y.getTime() });
      }
      oe(E ? null : { courtId: r, slots: w });
    },
    Ue = (t) => {
      $ && (t.currentTarget.contains(t.relatedTarget) || oe(null));
    },
    Ze = async (t, r, n) => {
      if (!(!$ || !D)) {
        (t.preventDefault(),
          oe(null),
          console.log('🎯 DROP EVENT:', {
            courtId: r,
            slotTime: n.toISOString(),
            draggedBookingId: D.id,
            draggedBookingDuration: D.duration,
          }));
        try {
          const a = new Date(D.start).toDateString(),
            c = n.toDateString();
          if (a !== c) {
            alert("Puoi spostare le prenotazioni solo all'interno dello stesso giorno.");
            return;
          }
          const f = ee(n, s.slotMinutes),
            C = T(f, D.duration);
          console.log('🎯 Drop validation:', {
            targetTime: f.toISOString(),
            targetEnd: C.toISOString(),
            duration: D.duration,
          });
          const B = [];
          for (let b = new Date(f); b < C; b = T(b, s.slotMinutes)) B.push(new Date(b));
          for (const b of B)
            if (!se(b, r, m)) {
              alert(
                'Uno o più slot di destinazione sono fuori dalle fasce prenotabili per questo campo.'
              );
              return;
            }
          const w = V.find((b) => {
            if (b.id === D.id || b.courtId !== r) return !1;
            const M = new Date(b.start),
              N = T(M, b.duration);
            return te(f, C, M, N);
          });
          if (w) {
            (console.log('🚫 Conflict detected with booking:', w.id),
              alert("Lo slot di destinazione è già occupato da un'altra prenotazione."));
            return;
          }
          for (const b of B) {
            const M = T(b, s.slotMinutes);
            if (
              V.find((F) => {
                if (F.id === D.id || F.courtId !== r) return !1;
                const i = new Date(F.start),
                  v = T(i, F.duration);
                return te(b, M, i, v);
              })
            ) {
              (console.log('🚫 Slot conflict detected at:', b.toISOString()),
                alert("Lo slot di destinazione è già occupato da un'altra prenotazione."));
              return;
            }
          }
          console.log('✅ Drop validation passed, updating booking...');
          const E = new Date(f.getTime() - f.getTimezoneOffset() * 6e4),
            y = E.toISOString().split('T')[0],
            O = E.toISOString().split('T')[1].substring(0, 5);
          (console.log('🔄 Updating booking with:', {
            bookingId: D.id,
            newCourtId: r,
            newDateStr: y,
            newTimeStr: O,
            targetTimeLocal: f.toLocaleString('it-IT'),
          }),
            await A(D.id, {
              courtId: r,
              courtName: Ce(r),
              date: y,
              time: O,
              updatedAt: new Date().toISOString(),
            }),
            console.log('✅ Booking moved successfully'),
            h &&
              setTimeout(() => {
                (console.log('🔄 Refreshing bookings after drag & drop...'), h());
              }, 500));
        } catch (a) {
          (console.error('❌ Error moving booking:', a),
            alert('Errore durante lo spostamento della prenotazione.'));
        }
        he(null);
      }
    },
    Ye = 52;
  function qe(t, r) {
    const a = (le.get(t) || []).find((i) => {
        const v = new Date(i.start),
          z = T(new Date(i.start), i.duration);
        return te(v, z, r, T(r, s.slotMinutes));
      }),
      c = se(r, t, m);
    if (!a && !c) {
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
    if (!a) {
      const i = ke(r, s, t, m),
        v = $e(i.rate),
        z = i.source === 'discounted' || i.isPromo,
        Z = r.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        _ = fe && fe.courtId === t && fe.slots?.some((ne) => ne.time === r.getTime()),
        ue =
          D && D.start && new Date(D.start).toDateString() === r.toDateString() && t !== D.courtId;
      return e.jsxs('button', {
        type: 'button',
        onClick: () => je(t, r),
        className: `relative w-full h-9 rounded-lg ring-1 text-[11px] font-medium transition-all duration-200 ${_ ? 'ring-2 ring-blue-500 ring-offset-1 scale-105' : ue ? 'ring-2 ring-red-300 ring-offset-1 opacity-75' : ''}`,
        style: {
          background: _
            ? 'rgba(59, 130, 246, 0.2)'
            : ue
              ? 'rgba(239, 68, 68, 0.1)'
              : `rgba(16,185,129,${v})`,
          borderColor: _
            ? 'rgba(59, 130, 246, 0.6)'
            : ue
              ? 'rgba(239, 68, 68, 0.3)'
              : 'rgba(16,185,129,0.35)',
        },
        title: _
          ? 'Rilascia qui per spostare la prenotazione'
          : ue
            ? 'Disponibile per nuove prenotazioni (non compatibile con lo spostamento)'
            : i.isPromo
              ? 'Fascia Promo'
              : z
                ? 'Fascia scontata'
                : 'Tariffa standard',
        onDragOver: $ ? (ne) => Ge(ne, t, r) : void 0,
        onDragLeave: $ ? Ue : void 0,
        onDrop: $ ? (ne) => Ze(ne, t, r) : void 0,
        children: [
          z &&
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
    const f = new Date(a.start),
      C = T(f, a.duration);
    if (!(r.getTime() === f.getTime())) return e.jsx('div', { className: 'w-full h-9' });
    const E = Math.ceil((C - r) / (s.slotMinutes * 60 * 1e3)) * Ye - 6,
      y = (
        a.playerNames && a.playerNames.length
          ? a.playerNames
          : (a.players || []).map((i) => j?.[i]?.name || '—')
      )
        .concat(a.guestNames || [])
        .slice(0, 4),
      O = e.jsx('span', { className: 'text-2xl', children: '💡' }),
      b = e.jsx('span', { className: 'text-2xl', children: '🔥' });
    let M = 'rgba(220, 38, 127, 0.35)',
      N = 'rgba(220, 38, 127, 0.6)';
    const F =
      a.isLessonBooking ||
      (a.notes && a.notes.includes('Lezione con')) ||
      a.instructorId ||
      a.instructorName;
    if (a.color) {
      const i = a.color.replace('#', ''),
        v = parseInt(i.substr(0, 2), 16),
        z = parseInt(i.substr(2, 2), 16),
        Z = parseInt(i.substr(4, 2), 16);
      ((M = `rgba(${v}, ${z}, ${Z}, 0.35)`), (N = `rgba(${v}, ${z}, ${Z}, 0.6)`));
    } else if (F) {
      let i = null;
      if (a.instructorId) i = H.find((v) => v.id === a.instructorId);
      else {
        const v = a.notes.match(/Lezione con (.+)/);
        if (v) {
          const z = v[1];
          i = H.find((Z) => Z.name === z);
        }
      }
      if (i && i.instructorData?.color) {
        const v = i.instructorData.color.replace('#', ''),
          z = parseInt(v.substr(0, 2), 16),
          Z = parseInt(v.substr(2, 2), 16),
          _ = parseInt(v.substr(4, 2), 16);
        ((M = `rgba(${z}, ${Z}, ${_}, 0.35)`), (N = `rgba(${z}, ${Z}, ${_}, 0.6)`));
      }
    }
    return e.jsx('div', {
      className: 'w-full h-9 relative',
      children: e.jsxs('button', {
        type: 'button',
        onClick: () => Se(a),
        className: `absolute left-0 right-0 px-2 py-2 ring-1 text-left text-[13px] font-semibold flex flex-col justify-center transition-all duration-200 ${$ ? 'cursor-grab hover:shadow-lg' : ''}`,
        style: {
          top: 0,
          height: `${E}px`,
          background: M,
          borderColor: N,
          borderRadius: '8px',
          overflow: 'hidden',
        },
        title: `${Ce(a.courtId)} — ${f.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${a.duration}′) • ${$ ? 'Trascina per spostare o clicca per modificare' : 'Clicca per modificare'}`,
        draggable: $,
        onDragStart: $ ? (i) => Re(i, a) : void 0,
        onDragEnd: $ ? Fe : void 0,
        onMouseDown: $ ? (i) => (i.target.style.cursor = 'grabbing') : void 0,
        onMouseUp: $ ? (i) => (i.target.style.cursor = 'grab') : void 0,
        children: [
          e.jsxs('div', {
            className: 'absolute left-2 top-2 flex flex-row items-center gap-2 z-20',
            children: [a.addons?.lighting && O, a.addons?.heating && b],
          }),
          F &&
            (() => {
              let i = null,
                v = '';
              if (a.instructorId) i = H.find((z) => z.id === a.instructorId);
              else {
                const z = a.notes.match(/Lezione con (.+)/);
                if (z) {
                  const Z = z[1];
                  i = H.find((_) => _.name === Z);
                }
              }
              return (
                i?.name && (v = i.name.trim().split(/\s+/)[0]),
                e.jsx('div', {
                  className: 'absolute right-2 top-2 z-30',
                  children: e.jsxs('span', {
                    className:
                      'text-[13px] px-2 py-1 bg-orange-500 text-white rounded-lg font-bold flex items-center gap-1 shadow-lg border-2 border-white',
                    title: `Lezione${i?.name ? ` con ${i.name}` : ''}`,
                    children: [
                      '🎾',
                      v &&
                        e.jsx('span', {
                          className: 'text-[11px] font-bold uppercase',
                          children: v,
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
                    f.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    ' -',
                    ' ',
                    C.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    ' •',
                    ' ',
                    ge(a.price),
                  ],
                }),
                e.jsx('span', {
                  className: 'flex items-center gap-2 mt-1',
                  children: e.jsx('div', {
                    className: 'text-[10px] font-medium opacity-80 flex flex-wrap gap-1',
                    children: y.map((i, v) =>
                      e.jsx(
                        'span',
                        {
                          className: 'bg-white/20 px-1 py-0.5 rounded text-[9px] font-medium',
                          children: i,
                        },
                        v
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
                children: a.bookedByName || y[0] || '—',
              }),
            ],
          }),
          a.note &&
            e.jsx('div', { className: 'text-[11px] opacity-70 mt-1 truncate', children: a.note }),
          e.jsx('div', {
            className: 'absolute bottom-2 right-2 z-20',
            children: e.jsxs('span', {
              className: 'text-[13px] opacity-80 font-bold bg-black/20 px-2 py-1 rounded',
              children: [Math.round(a.duration), '′'],
            }),
          }),
        ],
      }),
    });
  }
  const ae = l.useMemo(
    () =>
      !o.start || !o.courtId
        ? null
        : Me(
            new Date(o.start),
            o.duration,
            s,
            { lighting: o.useLighting, heating: o.useHeating },
            o.courtId,
            m
          ),
    [o.start, o.duration, o.courtId, o.useLighting, o.useHeating, o.numberOfPlayers, s, m]
  );
  return (
    l.useMemo(
      () =>
        ae == null
          ? null
          : tt(
              new Date(o.start),
              o.duration,
              s,
              { lighting: o.useLighting, heating: o.useHeating },
              o.courtId,
              m,
              o.numberOfPlayers
            ),
      [o.start, o.duration, o.courtId, o.useLighting, o.useHeating, o.numberOfPlayers, s, m]
    ),
    e.jsxs(Ke, {
      title: 'Gestione Campi',
      T: d,
      children: [
        $ &&
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
        p
          ? e.jsxs(e.Fragment, {
              children: [
                e.jsx('div', {
                  className: `flex flex-col items-center gap-6 mb-6 ${d.cardBg} ${d.border} p-6 rounded-xl shadow-lg`,
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
                        children: Te,
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
                      className: `${d.cardBg} ${d.border} rounded-2xl shadow-2xl p-8 max-w-2xl w-full`,
                      children: [
                        e.jsxs('div', {
                          className: 'flex items-center justify-between mb-6',
                          children: [
                            e.jsx('h3', {
                              className: `text-2xl font-bold ${d.text} flex items-center gap-2`,
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
                          currentDay: S,
                          onSelectDay: (t) => {
                            (q(t), G(!1));
                          },
                          T: d,
                        }),
                        e.jsxs('div', {
                          className: 'mt-6 grid grid-cols-3 gap-3',
                          children: [
                            e.jsx('button', {
                              type: 'button',
                              onClick: () => {
                                (x(), G(!1));
                              },
                              className: `${d.btnPrimary} py-3 text-sm font-semibold flex items-center justify-center gap-2`,
                              children: '🏠 Oggi',
                            }),
                            e.jsx('button', {
                              type: 'button',
                              onClick: () => {
                                (U(-1), G(!1));
                              },
                              className: `${d.btnGhost} py-3 text-sm font-medium`,
                              children: '← Ieri',
                            }),
                            e.jsx('button', {
                              type: 'button',
                              onClick: () => {
                                (U(1), G(!1));
                              },
                              className: `${d.btnGhost} py-3 text-sm font-medium`,
                              children: 'Domani →',
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                Pe === 'detail' &&
                  e.jsxs('div', {
                    className: 'md:hidden mb-6',
                    children: [
                      e.jsx('div', {
                        className: 'mb-4',
                        children: e.jsxs('select', {
                          value: pe,
                          onChange: (t) => Le(t.target.value),
                          className: `w-full ${d.input} text-sm`,
                          children: [
                            e.jsx('option', { value: 'all', children: 'Tutti i campi' }),
                            m.map((t) => e.jsx('option', { value: t.id, children: t.name }, t.id)),
                          ],
                        }),
                      }),
                      e.jsx('div', {
                        className: 'space-y-2',
                        children: J.map((t) => {
                          const r = t.toLocaleTimeString('it-IT', {
                              hour: '2-digit',
                              minute: '2-digit',
                            }),
                            a = T(t, s.slotMinutes).toLocaleTimeString('it-IT', {
                              hour: '2-digit',
                              minute: '2-digit',
                            });
                          return e.jsxs(
                            'div',
                            {
                              className: `${d.cardBg} ${d.border} rounded-lg p-3 shadow-sm`,
                              children: [
                                e.jsxs('div', {
                                  className: 'flex items-center justify-between mb-2',
                                  children: [
                                    e.jsxs('div', {
                                      className: 'font-semibold text-base',
                                      children: [r, ' - ', a],
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
                                    .filter((c) => pe === 'all' || c.id === pe)
                                    .map((c) => {
                                      const f = t,
                                        C = T(t, s.slotMinutes),
                                        B = se(t, c.id, m),
                                        w = le.get(c.id)?.find((b) => {
                                          const M = new Date(b.start),
                                            N = T(new Date(b.start), b.duration);
                                          return te(f, C, M, N);
                                        }),
                                        E = !w && B;
                                      E &&
                                        (t.toISOString().split('T')[0],
                                        t.toISOString().split('T')[1].substring(0, 5),
                                        s.slotMinutes,
                                        Array.from(le.get(c.id) || []).map((b) => ({
                                          courtId: c.id,
                                          date: b.start.split('T')[0],
                                          time: b.start.split('T')[1].substring(0, 5),
                                          duration: b.duration,
                                          status: 'booked',
                                        })));
                                      const y = E,
                                        O = be(c.id, t);
                                      return e.jsxs(
                                        'button',
                                        {
                                          onClick: () => {
                                            if (B) {
                                              if (y) return je(c.id, t);
                                              if (w) return Se(w);
                                            }
                                          },
                                          className: `p-2 rounded-lg text-sm font-medium transition-all ${y ? `hover:scale-105 ${d.btnGhost} border-2 ${O ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : 'border-green-200 dark:border-green-700'}` : B ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-700 cursor-not-allowed'}`,
                                          children: [
                                            e.jsxs('div', {
                                              className: 'flex items-center gap-1 justify-center',
                                              children: [
                                                e.jsx('span', {
                                                  className: `w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${y ? 'bg-green-500 text-white' : B ? 'bg-red-500 text-white' : 'bg-gray-400 text-white'}`,
                                                  children: c.name[0],
                                                }),
                                                e.jsx('span', { children: c.name }),
                                              ],
                                            }),
                                            O &&
                                              y &&
                                              e.jsx('div', {
                                                className:
                                                  'text-xs text-yellow-600 dark:text-yellow-400 mt-1',
                                                children: '🏷️ Promo',
                                              }),
                                            !B &&
                                              e.jsx('div', {
                                                className:
                                                  'text-xs mt-1 text-gray-500 dark:text-gray-400',
                                                children: 'Fuori fascia',
                                              }),
                                            B &&
                                              !y &&
                                              w &&
                                              e.jsxs('div', {
                                                className: 'text-xs mt-1 truncate',
                                                children: [
                                                  e.jsx('div', {
                                                    className: 'font-medium',
                                                    children: w.bookedByName || 'Occupato',
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
                                        c.id
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
                e.jsx(st, {
                  children: e.jsxs('div', {
                    className: 'min-w-[720px] grid gap-2',
                    style: { gridTemplateColumns: `repeat(${m.length}, 1fr)` },
                    children: [
                      m.map((t) =>
                        e.jsx(
                          'div',
                          {
                            className: `px-2 py-3 text-base font-bold text-center rounded-xl shadow-md mb-2 ${d.cardBg} ${d.border}`,
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
                                    o.start &&
                                      be(t.id, o.start) &&
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
                      J.map((t, r) =>
                        e.jsx(
                          ze.Fragment,
                          {
                            children: m.map((n) =>
                              e.jsx(
                                'div',
                                {
                                  className: `px-0.5 py-0.5 ${d.cardBg} ${d.border} rounded-lg`,
                                  children: qe(n.id, t),
                                },
                                n.id + '_' + r
                              )
                            ),
                          },
                          t.getTime()
                        )
                      ),
                    ],
                  }),
                }),
                e.jsx(Qe, {
                  open: we,
                  onClose: () => K(!1),
                  title: R ? 'Modifica prenotazione' : 'Nuova prenotazione',
                  T: d,
                  size: 'xl',
                  children: o.start
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
                                        value: o.bookingType,
                                        onChange: (t) => {
                                          const r = t.target.value;
                                          I((n) => ({
                                            ...n,
                                            bookingType: r,
                                            instructorId: r === 'partita' ? '' : n.instructorId,
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
                                  o.bookingType === 'lezione' &&
                                    e.jsxs('div', {
                                      className: 'sm:col-span-2 flex flex-col gap-1',
                                      children: [
                                        e.jsx('label', {
                                          className:
                                            'text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
                                          children: '👨‍🏫 Maestro',
                                        }),
                                        e.jsxs('select', {
                                          value: o.instructorId,
                                          onChange: (t) =>
                                            I((r) => ({ ...r, instructorId: t.target.value })),
                                          className:
                                            'px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium',
                                          required: o.bookingType === 'lezione',
                                          children: [
                                            e.jsx('option', {
                                              value: '',
                                              children: '-- Seleziona un maestro --',
                                            }),
                                            H.map((t) =>
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
                                        o.bookingType === 'lezione' &&
                                          !o.instructorId &&
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
                                        value: o.courtId,
                                        onChange: (t) =>
                                          I((r) => ({ ...r, courtId: t.target.value })),
                                        className:
                                          'px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium',
                                        children: p.courts.map((t) =>
                                          e.jsx('option', { value: t.id, children: t.name }, t.id)
                                        ),
                                      }),
                                      o.courtId &&
                                        be(o.courtId, o.start) &&
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
                                        value: `${String(new Date(o.start).getHours()).padStart(2, '0')}:${String(new Date(o.start).getMinutes()).padStart(2, '0')}`,
                                        onChange: (t) => {
                                          const [r, n] = t.target.value.split(':').map(Number),
                                            a = new Date(o.start);
                                          (a.setHours(r, n, 0, 0),
                                            I((c) => ({ ...c, start: ee(a, s.slotMinutes) })));
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
                                        children: '👥 Numero Giocatori',
                                      }),
                                      e.jsxs('select', {
                                        value: o.numberOfPlayers,
                                        onChange: (t) =>
                                          I((r) => ({
                                            ...r,
                                            numberOfPlayers: Number(t.target.value),
                                          })),
                                        className:
                                          'px-4 py-3 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium',
                                        children: [
                                          e.jsx('option', { value: 1, children: '1 giocatore' }),
                                          e.jsx('option', { value: 2, children: '2 giocatori' }),
                                          e.jsx('option', { value: 3, children: '3 giocatori' }),
                                          e.jsx('option', { value: 4, children: '4 giocatori' }),
                                        ],
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
                                        value: o.duration,
                                        onChange: (t) =>
                                          I((r) => ({ ...r, duration: Number(t.target.value) })),
                                        className:
                                          'px-4 py-3 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium',
                                        children: (s.defaultDurations || [60, 90, 120]).map((t) =>
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
                                            s.addons?.lightingEnabled &&
                                              e.jsxs('label', {
                                                className:
                                                  'inline-flex items-center gap-2 cursor-pointer bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-100/50 dark:hover:bg-blue-800/30 transition-all duration-200',
                                                children: [
                                                  e.jsx('input', {
                                                    type: 'checkbox',
                                                    checked: o.useLighting,
                                                    onChange: (t) =>
                                                      I((r) => ({
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
                                                          ge(s.addons.lightingFee || 0),
                                                        ],
                                                      }),
                                                    ],
                                                  }),
                                                ],
                                              }),
                                            s.addons?.heatingEnabled &&
                                              m.find((r) => r.id === o.courtId)?.hasHeating &&
                                              e.jsxs('label', {
                                                className:
                                                  'inline-flex items-center gap-2 cursor-pointer bg-purple-50/50 dark:bg-purple-900/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-purple-200/50 dark:border-purple-800/30 hover:bg-purple-100/50 dark:hover:bg-purple-800/30 transition-all duration-200',
                                                children: [
                                                  e.jsx('input', {
                                                    type: 'checkbox',
                                                    checked: o.useHeating,
                                                    onChange: (r) =>
                                                      I((n) => ({
                                                        ...n,
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
                                                          ge(s.addons.heatingFee || 0),
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
                                                  children: ['Totale: ', ae == null ? '—' : ge(ae)],
                                                }),
                                                ae != null &&
                                                  e.jsxs('div', {
                                                    className: 'text-sm text-emerald-100 mt-1',
                                                    children: ['/ giocatore: ', et(ae / 4)],
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
                                                  value: o[t],
                                                  onChange: (n) =>
                                                    I((a) => ({ ...a, [t]: n.target.value })),
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
                                            value: o.bookedBy,
                                            onChange: (t) =>
                                              I((r) => ({ ...r, bookedBy: t.target.value })),
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
                                            value: o.note,
                                            onChange: (t) =>
                                              I((r) => ({ ...r, note: t.target.value })),
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
                                              o.bookingType === 'lezione' &&
                                                o.instructorId &&
                                                e.jsx('span', {
                                                  className:
                                                    'ml-2 text-xs text-blue-600 dark:text-blue-400 font-normal',
                                                  children: '(Colore del maestro)',
                                                }),
                                              o.bookingType === 'partita' &&
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
                                                    value: o.color,
                                                    onChange: (t) =>
                                                      I((r) => ({ ...r, color: t.target.value })),
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
                                                        backgroundColor: o.color + '33',
                                                        borderColor: o.color,
                                                        color: o.color,
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
                                                            I((r) => ({ ...r, color: t.color })),
                                                          className: `w-10 h-10 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-110 shadow-lg ${o.color === t.color ? 'border-gray-800 dark:border-white scale-110 shadow-xl' : 'border-white/50 dark:border-gray-600/50'}`,
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
                                    children: Be.map((t) =>
                                      e.jsx('option', { value: t.name }, t.id)
                                    ),
                                  }),
                                  e.jsxs('div', {
                                    className: 'hidden md:flex gap-3 pt-6',
                                    children: [
                                      e.jsx('button', {
                                        type: 'button',
                                        onClick: Ie,
                                        className:
                                          'flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105',
                                        children: R
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
                                      R &&
                                        e.jsx('button', {
                                          type: 'button',
                                          onClick: () => ye(R),
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
                                      onClick: Ie,
                                      className:
                                        'flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 rounded-xl shadow-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105',
                                      children: R ? '✓ Aggiorna' : '✓ Conferma',
                                    }),
                                    e.jsx('button', {
                                      type: 'button',
                                      onClick: () => K(!1),
                                      className:
                                        'flex-1 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-700 dark:text-gray-300 font-semibold py-4 rounded-xl border border-white/30 dark:border-gray-600/30 hover:bg-white/90 dark:hover:bg-gray-600/90 transition-all duration-200',
                                      children: 'Annulla',
                                    }),
                                    R &&
                                      e.jsx('button', {
                                        type: 'button',
                                        onClick: () => ye(R),
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
                we &&
                  o.start &&
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
                          R &&
                            e.jsx('button', {
                              type: 'button',
                              onClick: () => ye(R),
                              className:
                                'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold px-8 py-4 rounded-xl shadow-2xl transition-all duration-200 hover:scale-105 border border-red-300/50',
                              children: '🗑️ Elimina',
                            }),
                        ],
                      }),
                      R &&
                        e.jsx('div', {
                          className:
                            'fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[99999] md:hidden',
                          children: e.jsx('button', {
                            type: 'button',
                            onClick: () => He(R),
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
function vt() {
  const p = Je(),
    { state: k, setState: g, derived: j, playersById: d, loading: L } = We(),
    { clubMode: P } = _e(),
    h = ze.useMemo(() => Xe(), []);
  return L || !k
    ? e.jsxs('div', {
        className: `text-center py-12 ${h.cardBg} ${h.border} rounded-xl m-4`,
        children: [
          e.jsx('div', { className: 'text-4xl mb-4', children: '⏳' }),
          e.jsx('h3', {
            className: `text-lg font-medium mb-2 ${h.text}`,
            children: 'Caricamento...',
          }),
          e.jsx('p', {
            className: `${h.subtext}`,
            children: 'Caricamento configurazione campi in corso...',
          }),
        ],
      })
    : P
      ? e.jsx(lt, { T: h, state: k, setState: g, players: j.players, playersById: d })
      : e.jsxs('div', {
          className: `text-center py-12 ${h.cardBg} ${h.border} rounded-xl m-4`,
          children: [
            e.jsx('div', { className: 'text-6xl mb-4', children: '🔒' }),
            e.jsx('h3', {
              className: `text-xl font-bold mb-2 ${h.text}`,
              children: 'Modalità Club Richiesta',
            }),
            e.jsx('p', {
              className: `${h.subtext} mb-4`,
              children:
                'Per accedere alla gestione campi, devi prima sbloccare la modalità club nella sezione Extra.',
            }),
            e.jsx('button', {
              onClick: () => p('/extra'),
              className: `${h.btnPrimary} px-6 py-3`,
              children: 'Vai a Extra per sbloccare',
            }),
          ],
        });
}
export { vt as default };
