import { v as R, _ as A, u as fe, j as e } from './index-mfh82qsn-DzXPqwq9.js';
import { r as g, c as be, b as pe } from './router-mfh82qsn-Bc5I10Ra.js';
import {
  r as Z,
  p as ee,
  x as $,
  y as _,
  q as re,
  A as ye,
  B as we,
  f as ve,
} from './firebase-mfh82qsn-X_I_guKF.js';
import { M as je } from './Modal-mfh82qsn-CAuX7xtz.js';
import { B as O } from './Badge-mfh82qsn-BKfo2CO2.js';
import './vendor-mfh82qsn-D3F3s8fL.js';
const F = 'bookings';
async function G() {
  try {
    const r = Z(ee(R, F), $('status', '==', 'confirmed'), _('date', 'asc'), _('time', 'asc'));
    return (await re(r)).docs.map((t) => ({ id: t.id, ...t.data() }));
  } catch (r) {
    throw (
      r?.code === 'permission-denied'
        ? console.warn(
            "Firebase: Permessi insufficienti per leggere le prenotazioni. Verifica le regole Firestore e l'autenticazione."
          )
        : r?.code === 'failed-precondition'
          ? console.warn('Firebase: Indici mancanti o configurazione incompleta.')
          : r?.code === 'unavailable'
            ? console.warn('Firebase: Servizio non disponibile. Verifica la connessione.')
            : console.warn('Errore caricamento prenotazioni pubbliche (cloud):', r),
      r
    );
  }
}
async function ke(r) {
  try {
    const a = new Date().toISOString().split('T')[0],
      t = Z(
        ee(R, F),
        $('createdBy', '==', r),
        $('status', '==', 'confirmed'),
        $('date', '>=', a),
        _('date', 'asc'),
        _('time', 'asc')
      );
    return (await re(t)).docs.map((l) => ({ id: l.id, ...l.data() }));
  } catch (a) {
    return (
      a?.code !== 'permission-denied' &&
        a?.code !== 'failed-precondition' &&
        console.warn('Errore caricamento prenotazioni attive:', a),
      []
    );
  }
}
async function ae(r, a, t) {
  try {
    const s = { ...a, updatedAt: ye(), updatedBy: t?.uid || null };
    return (await we(ve(R, F, r), s), { id: r, ...a, updatedAt: new Date().toISOString() });
  } catch (s) {
    throw (
      console.error('Errore aggiornamento prenotazione:', s),
      new Error('Impossibile aggiornare la prenotazione. Riprova più tardi.')
    );
  }
}
async function te() {
  return (await G())
    .filter((a) => a.status === 'confirmed')
    .map((a) => ({
      id: a.id,
      courtId: a.courtId,
      courtName: a.courtName,
      date: a.date,
      time: a.time,
      duration: a.duration,
      status: a.status,
      notes: a.notes,
      instructorId: a.instructorId,
      isLessonBooking: a.isLessonBooking,
      players: a.players,
      bookedBy: a.bookedBy,
      lighting: a.lighting,
      heating: a.heating,
      price: a.price,
      userPhone: a.userPhone,
    }));
}
const q = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        getPublicBookings: te,
        loadActiveUserBookings: ke,
        loadPublicBookings: G,
        updateCloudBooking: ae,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  H = {
    courts: [
      {
        id: 'campo1',
        name: 'Campo 1 - Centrale',
        type: 'terra-rossa',
        price60: 45,
        price90: 65,
        features: ['Terra rossa', 'Illuminazione LED', 'Riscaldamento'],
        hasLighting: !0,
        hasHeating: !0,
        isOutdoor: !1,
        premium: !0,
      },
      {
        id: 'campo2',
        name: 'Campo 2',
        type: 'terra-rossa',
        price60: 40,
        price90: 58,
        features: ['Terra rossa', 'Illuminazione', 'Riscaldamento'],
        hasLighting: !0,
        hasHeating: !0,
        isOutdoor: !1,
        premium: !1,
      },
      {
        id: 'campo3',
        name: 'Campo 3',
        type: 'cemento',
        price60: 35,
        price90: 50,
        features: ['Cemento', 'Illuminazione', 'Riscaldamento'],
        hasLighting: !0,
        hasHeating: !0,
        isOutdoor: !1,
        premium: !1,
      },
      {
        id: 'campo4',
        name: 'Campo 4 - Scoperto',
        type: 'terra-rossa',
        price60: 30,
        price90: 42,
        features: ['Terra rossa', 'Solo diurno'],
        hasLighting: !1,
        hasHeating: !1,
        isOutdoor: !0,
        premium: !1,
      },
      {
        id: 'campo5',
        name: 'Campo 5',
        type: 'cemento',
        price60: 32,
        price90: 46,
        features: ['Cemento', 'Illuminazione'],
        hasLighting: !0,
        hasHeating: !1,
        isOutdoor: !1,
        premium: !1,
      },
      {
        id: 'campo6',
        name: 'Campo 6 - Padel',
        type: 'padel',
        price60: 25,
        price90: 35,
        features: ['Padel', 'Illuminazione', 'Riscaldamento'],
        hasLighting: !0,
        hasHeating: !0,
        isOutdoor: !1,
        premium: !1,
      },
      {
        id: 'campo7',
        name: 'Campo 7 - Calcetto',
        type: 'calcetto',
        price60: 40,
        price90: 55,
        features: ['Calcetto', 'Illuminazione', 'Riscaldamento'],
        hasLighting: !0,
        hasHeating: !0,
        isOutdoor: !1,
        premium: !1,
      },
    ],
  },
  se = { CONFIRMED: 'confirmed' },
  oe = 'ml-field-bookings';
let z = !1,
  le = null,
  Y = !1;
function ne(r, a = null) {
  ((z = r), (le = a));
}
async function ie() {
  if (z && le)
    try {
      return await G();
    } catch (r) {
      return (console.warn('Errore caricamento da cloud, fallback a localStorage:', r), I());
    }
  return I();
}
function I() {
  try {
    const r = localStorage.getItem(oe);
    return r ? JSON.parse(r) : [];
  } catch {
    return [];
  }
}
function de(r) {
  try {
    return (localStorage.setItem(oe, JSON.stringify(r)), !0);
  } catch {
    return !1;
  }
}
async function ce(r, a, t) {
  if (z && t)
    try {
      return await ae(r, a, t);
    } catch (s) {
      return (
        console.warn('Errore aggiornamento nel cloud, fallback a localStorage:', s),
        Q(r, a, t)
      );
    }
  return Q(r, a, t);
}
function Q(r, a, t) {
  const s = I(),
    l = s.findIndex((d) => d.id === r);
  if (l === -1) return null;
  const o = { ...s[l], ...a, updatedAt: new Date().toISOString(), updatedBy: t?.uid || null };
  return ((s[l] = o), de(s), o);
}
async function V() {
  if (z)
    try {
      return await te();
    } catch (r) {
      return (
        r?.code === 'failed-precondition'
          ? Y ||
            (console.warn('Cloud bookings richiedono un indice: uso dati locali (fallback).'),
            (Y = !0))
          : console.warn('Errore caricamento pubbliche da cloud, fallback a localStorage:', r),
        X()
      );
    }
  return X();
}
function X() {
  return I()
    .filter((a) => a.status === se.CONFIRMED)
    .map((a) => ({
      id: a.id,
      courtId: a.courtId,
      courtName: a.courtName,
      date: a.date,
      time: a.time,
      duration: a.duration,
      status: a.status,
      notes: a.notes,
      instructorId: a.instructorId,
      isLessonBooking: a.isLessonBooking,
      players: a.players,
      bookedBy: a.bookedBy,
      lighting: a.lighting,
      heating: a.heating,
      price: a.price,
      userPhone: a.userPhone,
    }));
}
async function ue(r) {
  try {
    ne(!!r?.uid, r);
    const a = await V();
    if (r && r.uid)
      try {
        const { loadActiveUserBookings: t } = await A(
            async () => {
              const { loadActiveUserBookings: l } = await Promise.resolve().then(() => q);
              return { loadActiveUserBookings: l };
            },
            void 0
          ),
          s = await t(r.uid);
      } catch (t) {
        console.warn('initializeBookingSystem: Cloud user data failed:', t);
      }
    return (await K(), !0);
  } catch (a) {
    return (console.error('initializeBookingSystem: Failed:', a), !1);
  }
}
async function K() {
  try {
    let r = [];
    try {
      r = [...(await V())];
    } catch (a) {
      console.warn('syncAllBookings: Failed to load public bookings:', a);
    }
    try {
      const a = await I(),
        t = new Map();
      (r.forEach((s) => {
        const l = s.id || `${s.date}-${s.time}-${s.courtId}`;
        t.set(l, s);
      }),
        a.forEach((s) => {
          const l = s.id || `${s.date}-${s.time}-${s.courtId}`;
          t.has(l) || t.set(l, s);
        }),
        (r = Array.from(t.values())),
        await de(r));
    } catch (a) {
      console.warn('syncAllBookings: Failed to sync local storage:', a);
    }
    return r;
  } catch (r) {
    return (console.error('syncAllBookings: Complete failure:', r), []);
  }
}
async function Ne(r, a = !1) {
  if (!r) return [];
  try {
    a ? await ue(r) : await K();
    let t = [];
    if (z && r.uid)
      try {
        const { loadActiveUserBookings: o } = await A(
            async () => {
              const { loadActiveUserBookings: i } = await Promise.resolve().then(() => q);
              return { loadActiveUserBookings: i };
            },
            void 0
          ),
          d = await o(r.uid);
        d && d.length > 0 && (t = d);
      } catch (o) {
        console.warn('Cloud user bookings not available:', o);
      }
    try {
      const d = (await ie()).filter(
        (i) => i.userEmail === r.email || i.email === r.email || i.userId === r.uid
      );
      if (t.length > 0 && d.length > 0) {
        const i = new Map();
        (t.forEach((c) => {
          i.set(c.id || `${c.date}-${c.time}-${c.courtId}`, c);
        }),
          d.forEach((c) => {
            const f = c.id || `${c.date}-${c.time}-${c.courtId}`;
            i.has(f) || i.set(f, c);
          }),
          (t = Array.from(i.values())));
      } else d.length > 0 && (t = d);
    } catch (o) {
      console.warn('localStorage user bookings not available:', o);
    }
    const s = new Date(),
      l = t.filter((o) => new Date(`${o.date}T${o.time}:00`) > s);
    return (
      l.sort((o, d) => {
        const i = new Date(`${o.date}T${o.time}:00`),
          c = new Date(`${d.date}T${d.time}:00`);
        return i - c;
      }),
      l
    );
  } catch (t) {
    return (console.error('Error loading user bookings:', t), []);
  }
}
const Be = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        BOOKING_CONFIG: H,
        BOOKING_STATUS: se,
        getPublicBookings: V,
        getUserBookings: Ne,
        initializeBookingSystem: ue,
        loadBookings: ie,
        setCloudMode: ne,
        syncAllBookings: K,
        updateBooking: ce,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  U = new Map(),
  T = new Map();
function Ce(r = {}) {
  const { user: a } = fe(),
    { refreshInterval: t = 3e4, enableBackground: s = !0 } = r,
    [l, o] = g.useState([]),
    [d, i] = g.useState(!0),
    [c, f] = g.useState(null),
    [y, h] = g.useState(0),
    b = g.useRef(!0),
    w = g.useRef(null),
    x = a?.uid ? `bookings-${a.uid}` : null,
    B = g.useCallback(
      async (j = !1) => {
        if (!a?.uid) return (o([]), i(!1), []);
        if (!j && x) {
          const u = U.get(x);
          if (u && Date.now() - u.timestamp < 6e4)
            return (b.current && (o(u.data), i(!1), h(u.timestamp)), u.data);
        }
        if (T.has(x))
          try {
            const u = await T.get(x);
            return (b.current && (o(u), i(!1)), u);
          } catch (u) {
            throw (b.current && (f(u), i(!1)), u);
          }
        const k = De(a);
        T.set(x, k);
        try {
          b.current && i(!0);
          const u = await k,
            n = Date.now();
          return (x && U.set(x, { data: u, timestamp: n }), b.current && (o(u), f(null), h(n)), u);
        } catch (u) {
          throw (console.error('Error loading user bookings:', u), b.current && f(u), u);
        } finally {
          (T.delete(x), b.current && i(!1));
        }
      },
      [a?.uid, x]
    );
  (g.useEffect(
    () => (
      (b.current = !0),
      B(),
      () => {
        ((b.current = !1), w.current && clearInterval(w.current));
      }
    ),
    [B]
  ),
    g.useEffect(() => {
      if (!(!s || !a?.uid))
        return (
          (w.current = setInterval(() => {
            b.current && document.visibilityState === 'visible' && B(!0);
          }, t)),
          () => {
            w.current && clearInterval(w.current);
          }
        );
    }, [B, t, s, a?.uid]));
  const v = g.useMemo(() => {
      const j = new Date();
      return l.filter((k) => new Date(`${k.date}T${k.time}:00`) > j);
    }, [l]),
    D = g.useMemo(() => {
      const j = new Date().toISOString().split('T')[0];
      return v.filter((k) => k.date === j);
    }, [v]),
    C = g.useCallback(() => (x && U.delete(x), B(!0)), [B, x]);
  return {
    bookings: v,
    allBookings: l,
    todayBookings: D,
    loading: d,
    error: c,
    lastUpdate: y,
    refresh: C,
    hasBookings: v.length > 0,
  };
}
async function De(r) {
  if (!r?.uid) return [];
  try {
    const [a, t] = await Promise.allSettled([Se(r.uid), Pe(r)]);
    let s = [];
    if (
      (a.status === 'fulfilled' && a.value.length > 0 && (s = a.value),
      t.status === 'fulfilled' && t.value.length > 0)
    )
      if (s.length === 0) s = t.value;
      else {
        const o = new Set(s.map((i) => i.id)),
          d = t.value.filter((i) => !o.has(i.id));
        s = [...s, ...d];
      }
    const l = new Date();
    return s
      .filter((o) => new Date(`${o.date}T${o.time}:00`) > l)
      .sort((o, d) => {
        const i = new Date(`${o.date}T${o.time}:00`),
          c = new Date(`${d.date}T${d.time}:00`);
        return i - c;
      });
  } catch (a) {
    return (console.error('Error in loadUserBookingsOptimized:', a), []);
  }
}
async function Se(r) {
  try {
    const { loadActiveUserBookings: a } = await A(
      async () => {
        const { loadActiveUserBookings: t } = await Promise.resolve().then(() => q);
        return { loadActiveUserBookings: t };
      },
      void 0
    );
    return await Promise.race([
      a(r),
      new Promise((t, s) => setTimeout(() => s(new Error('Cloud timeout')), 5e3)),
    ]);
  } catch (a) {
    return (console.warn('Cloud bookings failed:', a), []);
  }
}
async function Pe(r) {
  try {
    const { getUserBookings: a } = await A(
      async () => {
        const { getUserBookings: t } = await Promise.resolve().then(() => Be);
        return { getUserBookings: t };
      },
      void 0
    );
    return await a(r, !1);
  } catch (a) {
    return (console.warn('Local bookings failed:', a), []);
  }
}
function Ee({
  booking: r,
  isOpen: a,
  onClose: t,
  state: s,
  T: l,
  onShare: o,
  onCancel: d,
  onEdit: i,
  onReview: c,
}) {
  const [f, y] = g.useState(!1),
    [h, b] = g.useState(r?.players || []),
    [w, x] = g.useState('');
  if (!r) return null;
  const v = (s?.courts || H.courts)?.find((m) => m.id === r.courtId),
    D = new Date(r.date),
    C = new Date(`${r.date}T${r.time}:00`),
    j = new Date(),
    k = D.toDateString() === new Date().toDateString(),
    u = D.toDateString() === new Date(Date.now() + 864e5).toDateString(),
    n = C < j,
    N = C > j && C <= new Date(j.getTime() + 1440 * 60 * 1e3),
    he = (C - j) / (1e3 * 60 * 60) > 30,
    J = !n,
    M = (m) =>
      m
        ? typeof m == 'string'
          ? m
          : typeof m == 'object'
            ? m.name || m.email || ''
            : String(m)
        : '',
    W = () => {
      (i && h !== r.players && i({ ...r, players: h }), y(!1));
    },
    ge = () => {
      (b(r.players), y(!1));
    },
    xe = () => {
      f ? W() : y(!0);
    };
  let E;
  return (
    n
      ? (E = 'Passata')
      : k
        ? (E = 'Oggi')
        : u
          ? (E = 'Domani')
          : (E = D.toLocaleDateString('it-IT', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })),
    e.jsx(je, {
      open: a,
      onClose: t,
      title: 'Dettaglio Prenotazione',
      T: l,
      size: 'md',
      children: e.jsxs('div', {
        className: 'space-y-6',
        children: [
          e.jsxs('div', {
            className:
              'bg-gradient-to-br from-blue-500/90 to-blue-600/90 backdrop-blur-xl rounded-2xl p-6 text-white shadow-lg shadow-blue-100/30 dark:shadow-blue-900/20',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-3',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-4',
                    children: [
                      e.jsx('div', {
                        className:
                          'w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg',
                        children: e.jsx('span', { className: 'text-xl', children: '🏟️' }),
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('h2', {
                            className: 'font-bold text-xl',
                            children: v?.name || `Campo ${r.courtId}`,
                          }),
                          e.jsxs('div', {
                            className: 'text-white/90 text-sm',
                            children: [E, ' • ', r.time],
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'text-right',
                    children: [
                      e.jsxs('div', {
                        className: 'text-3xl font-bold',
                        children: ['€', r.price || 'N/A'],
                      }),
                      e.jsxs('div', {
                        className: 'text-white/80 text-sm',
                        children: [r.duration || 60, ' minuti'],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'flex flex-wrap gap-2',
                children: [
                  n && e.jsx(O, { variant: 'secondary', size: 'xs', T: l, children: 'Completata' }),
                  k && !n && e.jsx(O, { variant: 'warning', size: 'xs', T: l, children: 'Oggi' }),
                  N && e.jsx(O, { variant: 'success', size: 'xs', T: l, children: 'Prossima' }),
                  r.confirmed &&
                    e.jsx(O, { variant: 'primary', size: 'xs', T: l, children: 'Confermata' }),
                ],
              }),
            ],
          }),
          e.jsxs('div', {
            className:
              'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-xl p-5 shadow-lg shadow-gray-100/50 dark:shadow-gray-900/20',
            children: [
              e.jsxs('div', {
                className: 'text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium',
                children: ['👥 GIOCATORI (', r.players?.length || 1, '/4)'],
              }),
              e.jsxs('div', {
                className: 'space-y-3',
                children: [
                  e.jsx('div', {
                    className:
                      'p-4 bg-gradient-to-r from-blue-50/80 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/30 backdrop-blur-sm rounded-xl border-l-4 border-blue-500 shadow-sm',
                    children: e.jsxs('div', {
                      className: 'flex items-center gap-3',
                      children: [
                        e.jsx('div', {
                          className:
                            'w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg',
                          children: e.jsx('span', {
                            className: 'text-white text-sm',
                            children: '👑',
                          }),
                        }),
                        e.jsxs('div', {
                          className: 'flex-1',
                          children: [
                            e.jsx('div', {
                              className: 'text-sm font-semibold text-gray-900 dark:text-gray-100',
                              children: (() => {
                                const m = f ? h : r.players;
                                return m && m[0]
                                  ? M(m[0])
                                  : r.userName || r.userEmail || 'Organizzatore';
                              })(),
                            }),
                            e.jsxs('div', {
                              className: 'text-xs text-blue-600 dark:text-blue-400 font-medium',
                              children: [
                                'Organizzatore • Giocatore 1',
                                r.userEmail &&
                                  e.jsx('span', {
                                    className: 'block text-blue-600 dark:text-blue-400 mt-0.5',
                                    children: r.userEmail,
                                  }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                  f
                    ? e.jsxs('div', {
                        className: 'space-y-3',
                        children: [
                          h &&
                            h.length > 1 &&
                            h.slice(1).map((m, p) =>
                              e.jsxs(
                                'div',
                                {
                                  className:
                                    'p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-600/20 flex items-center gap-3 shadow-sm',
                                  children: [
                                    e.jsx('div', {
                                      className:
                                        'w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-lg',
                                      children: e.jsx('span', {
                                        className: 'text-white text-sm',
                                        children: '👤',
                                      }),
                                    }),
                                    e.jsxs('div', {
                                      className: 'flex-1',
                                      children: [
                                        e.jsx('input', {
                                          type: 'text',
                                          value: M(m),
                                          onChange: (S) => {
                                            const P = [...h];
                                            (typeof m == 'object'
                                              ? (P[p + 1] = { ...m, name: S.target.value })
                                              : (P[p + 1] = S.target.value),
                                              b(P));
                                          },
                                          className:
                                            'w-full text-sm font-medium text-gray-900 dark:text-gray-100 bg-transparent border-b-2 border-gray-300 dark:border-gray-500 focus:border-green-500 dark:focus:border-green-400 outline-none pb-1 transition-colors',
                                          placeholder: 'Nome giocatore',
                                        }),
                                        e.jsxs('div', {
                                          className: 'text-xs text-gray-500 dark:text-gray-400',
                                          children: ['Giocatore ', p + 2],
                                        }),
                                      ],
                                    }),
                                    e.jsx('button', {
                                      onClick: () => {
                                        const S = [...h];
                                        (S.splice(p + 1, 1), b(S));
                                      },
                                      className:
                                        'w-9 h-9 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-sm',
                                      children: e.jsx('span', {
                                        className: 'text-sm',
                                        children: '✕',
                                      }),
                                    }),
                                  ],
                                },
                                p
                              )
                            ),
                          h.length < 4 &&
                            e.jsxs('div', {
                              className: 'flex gap-3',
                              children: [
                                e.jsx('input', {
                                  type: 'text',
                                  value: w,
                                  onChange: (m) => x(m.target.value),
                                  onKeyDown: (m) => {
                                    if (m.key === 'Enter') {
                                      const p = h
                                        ? [...h]
                                        : [r.userName || r.userEmail || 'Organizzatore'];
                                      w.trim() &&
                                        (p.push({ name: w.trim(), id: Date.now() }), b(p), x(''));
                                    }
                                  },
                                  placeholder: 'Nome nuovo giocatore',
                                  className:
                                    'flex-1 p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border-2 border-white/30 dark:border-gray-600/30 rounded-xl text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors shadow-sm',
                                }),
                                e.jsx('button', {
                                  onClick: () => {
                                    const m = h
                                      ? [...h]
                                      : [r.userName || r.userEmail || 'Organizzatore'];
                                    w.trim() &&
                                      (m.push({ name: w.trim(), id: Date.now() }), b(m), x(''));
                                  },
                                  disabled: !w.trim(),
                                  className:
                                    'px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105',
                                  children: 'Aggiungi',
                                }),
                              ],
                            }),
                          e.jsxs('div', {
                            className:
                              'flex gap-3 mt-5 pt-4 border-t border-white/20 dark:border-gray-700/20',
                            children: [
                              e.jsx('button', {
                                onClick: W,
                                className:
                                  'flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl text-sm font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105',
                                children: '💾 Salva Modifiche',
                              }),
                              e.jsx('button', {
                                onClick: ge,
                                className:
                                  'flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-4 rounded-xl text-sm font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105',
                                children: '❌ Annulla',
                              }),
                            ],
                          }),
                        ],
                      })
                    : e.jsxs(e.Fragment, {
                        children: [
                          r.players &&
                            r.players.length > 1 &&
                            r.players.slice(1).map((m, p) =>
                              e.jsxs(
                                'div',
                                {
                                  className:
                                    'flex items-center gap-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 dark:border-gray-600/20 shadow-sm',
                                  children: [
                                    e.jsx('div', {
                                      className:
                                        'w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg',
                                      children: e.jsx('span', {
                                        className: 'text-white text-sm font-bold',
                                        children: p + 2,
                                      }),
                                    }),
                                    e.jsxs('div', {
                                      className: 'flex-1',
                                      children: [
                                        e.jsx('div', {
                                          className:
                                            'text-sm font-medium text-gray-900 dark:text-gray-100',
                                          children: M(m),
                                        }),
                                        e.jsxs('div', {
                                          className: 'text-xs text-gray-500 dark:text-gray-400',
                                          children: ['Giocatore ', p + 2],
                                        }),
                                      ],
                                    }),
                                  ],
                                },
                                p
                              )
                            ),
                          (() => {
                            const m = r.players?.length || 1,
                              p = 4 - m;
                            return (
                              p > 0 &&
                              Array.from({ length: p }).map((S, P) =>
                                e.jsxs(
                                  'div',
                                  {
                                    className:
                                      'flex items-center gap-3 bg-gray-100/60 dark:bg-gray-700/40 backdrop-blur-sm rounded-xl px-4 py-3 border-dashed border border-gray-200/60 dark:border-gray-600/40',
                                    children: [
                                      e.jsx('div', {
                                        className:
                                          'w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-500 flex items-center justify-center',
                                        children: e.jsx('span', {
                                          className: 'text-gray-500 dark:text-gray-400 text-sm',
                                          children: '?',
                                        }),
                                      }),
                                      e.jsxs('div', {
                                        className: 'flex-1',
                                        children: [
                                          e.jsx('div', {
                                            className:
                                              'text-sm text-gray-500 dark:text-gray-400 italic',
                                            children: 'Slot libero',
                                          }),
                                          e.jsxs('div', {
                                            className: 'text-xs text-gray-400 dark:text-gray-500',
                                            children: ['Giocatore ', m + P + 1],
                                          }),
                                        ],
                                      }),
                                    ],
                                  },
                                  `empty-${P}`
                                )
                              )
                            );
                          })(),
                        ],
                      }),
                ],
              }),
            ],
          }),
          r.notes &&
            e.jsxs('div', {
              className:
                'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-xl p-4 shadow-lg shadow-blue-100/50 dark:shadow-blue-900/20',
              children: [
                e.jsx('div', {
                  className: 'text-xs text-blue-700 dark:text-blue-300 font-medium mb-2',
                  children: '📝 NOTE',
                }),
                e.jsx('p', {
                  className: 'text-sm text-gray-700 dark:text-gray-300',
                  children: r.notes,
                }),
              ],
            }),
          e.jsxs('div', {
            className: 'space-y-3 pb-4 md:pb-0',
            children: [
              !n &&
                J &&
                e.jsx('button', {
                  onClick: xe,
                  className:
                    'w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 px-4 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]',
                  children: f ? '💾 Salva Modifiche' : '✏️ Modifica Giocatori',
                }),
              !n &&
                !J &&
                e.jsx('div', {
                  className:
                    'w-full bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 text-gray-600 dark:text-gray-300 py-4 px-4 rounded-xl text-sm text-center shadow-sm',
                  children: '⏰ Modifiche disponibili fino a 30 ore prima',
                }),
              e.jsx('div', {
                className: 'flex gap-3',
                children: n
                  ? e.jsx('button', {
                      onClick: () => c && c(r),
                      className:
                        'w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-4 px-4 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]',
                      children: '⭐ Lascia Recensione',
                    })
                  : e.jsxs(e.Fragment, {
                      children: [
                        e.jsx('button', {
                          onClick: () => o && o(r),
                          className:
                            'flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-4 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]',
                          children: '📧 Condividi',
                        }),
                        he
                          ? e.jsx('button', {
                              onClick: () => d && d(r),
                              className:
                                'flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 px-4 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]',
                              children: '🚫 Cancella',
                            })
                          : e.jsx('div', {
                              className:
                                'flex-1 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 text-gray-600 dark:text-gray-300 py-4 px-4 rounded-xl text-sm text-center shadow-sm',
                              children: '⏰ Non cancellabile (meno di 30h)',
                            }),
                      ],
                    }),
              }),
            ],
          }),
        ],
      }),
    })
  );
}
const me = pe.memo(({ booking: r, onBookingClick: a, courts: t, user: s }) => {
  const l = t?.find((y) => y.id === r.courtId),
    o = new Date(r.date),
    d = o.toDateString() === new Date().toDateString(),
    i = o.toDateString() === new Date(Date.now() + 864e5).toDateString(),
    c = o.toLocaleDateString('it-IT', { weekday: 'short' });
  let f;
  return (
    d
      ? (f = 'Oggi')
      : i
        ? (f = 'Domani')
        : (f = `${c.charAt(0).toUpperCase() + c.slice(1)} ${o.getDate()}/${(o.getMonth() + 1).toString().padStart(2, '0')}`),
    e.jsxs('div', {
      onClick: () => a(r),
      className: `bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-2 border-white/60 dark:border-gray-600/60
        hover:bg-white dark:hover:bg-gray-800 hover:border-blue-300/80 dark:hover:border-blue-400/80 
        hover:shadow-2xl hover:shadow-blue-200/40 dark:hover:shadow-blue-900/30 
        p-4 rounded-2xl cursor-pointer transition-all duration-300 group
        min-w-[240px] h-32 sm:min-w-0 sm:h-auto flex-shrink-0 sm:flex-shrink
        transform hover:scale-[1.02] flex flex-col justify-between
        shadow-xl shadow-gray-200/60 dark:shadow-gray-900/40 ring-1 ring-gray-200/30 dark:ring-gray-700/30`,
      children: [
        e.jsxs('div', {
          className: 'flex items-start justify-between',
          children: [
            e.jsxs('div', {
              className: 'flex-1',
              children: [
                e.jsx('div', {
                  className:
                    'text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-1',
                  children: f,
                }),
                e.jsx('div', {
                  className: 'text-lg font-bold text-gray-900 dark:text-white leading-none mb-1',
                  children: r.time.substring(0, 5),
                }),
                e.jsxs('div', {
                  className: 'text-xs text-gray-600 dark:text-gray-400',
                  children: [l?.name || 'Padel 1', ' • ', r.duration || 60, 'min'],
                }),
              ],
            }),
            d && e.jsx('div', { className: 'w-2 h-2 bg-orange-400 rounded-full' }),
          ],
        }),
        e.jsxs('div', {
          className: 'flex items-center justify-between',
          children: [
            e.jsxs('div', {
              className: 'flex-1 min-w-0',
              children: [
                e.jsxs('div', {
                  className: 'text-[10px] text-gray-600 dark:text-gray-400 truncate mb-1',
                  children: [
                    r.bookedBy && e.jsx('span', { className: 'font-medium', children: r.bookedBy }),
                    r.players &&
                      r.players.length > 0 &&
                      e.jsxs('span', {
                        children: [
                          r.bookedBy ? ' + ' : '',
                          r.players.slice(0, 2).map((y, h) =>
                            e.jsxs(
                              'span',
                              {
                                children: [
                                  y.name || y,
                                  h < r.players.slice(0, 2).length - 1 ? ', ' : '',
                                ],
                              },
                              h
                            )
                          ),
                          r.players.length > 2 &&
                            e.jsxs('span', { children: [' +', r.players.length - 2, ' altri'] }),
                        ],
                      }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'flex -space-x-0.5',
                  children: [
                    e.jsx('div', {
                      className:
                        'w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white border border-white',
                      children: e.jsx('span', {
                        className: 'text-[9px]',
                        children: s?.displayName?.charAt(0).toUpperCase() || 'U',
                      }),
                    }),
                    (r.players?.length || 0) > 0 &&
                      e.jsx('div', {
                        className:
                          'w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold text-white border border-white',
                        children: e.jsxs('span', {
                          className: 'text-[8px]',
                          children: ['+', r.players.length],
                        }),
                      }),
                    (r.players?.length || 0) + 1 < 4 &&
                      e.jsx('div', {
                        className:
                          'w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 border border-white dark:border-gray-700 flex items-center justify-center',
                        children: e.jsx('div', {
                          className: 'w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full',
                        }),
                      }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'text-right',
              children: [
                r.price &&
                  e.jsxs('div', {
                    className: 'text-xs font-bold text-green-600 dark:text-green-400',
                    children: ['€', r.price],
                  }),
                e.jsx('div', {
                  className: 'text-[9px] text-gray-500 dark:text-gray-400',
                  children: (r.players?.length || 0) + 1 < 4 ? 'Aperta' : 'Completa',
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );
});
me.displayName = 'BookingCard';
function Ae({ user: r, state: a, T: t, compact: s }) {
  const [l, o] = g.useState(null),
    [d, i] = g.useState(!1),
    c = be(),
    {
      bookings: f,
      loading: y,
      refresh: h,
      hasBookings: b,
      lastUpdate: w,
    } = Ce({ refreshInterval: 3e4, enableBackground: !0 }),
    x = g.useMemo(() => a?.courts || H.courts, [a?.courts]),
    B = g.useCallback((n) => {
      (o(n), i(!0));
    }, []),
    v = g.useCallback(() => {
      (i(!1), o(null));
    }, []),
    D = g.useCallback(
      async (n) => {
        const N = `Prenotazione Padel 🎾
${n.date} alle ${n.time}
Campo: ${x.find((L) => L.id === n.courtId)?.name || 'Padel 1'}
Giocatori: ${n.players?.join(', ') || 'Da definire'}`;
        if (navigator.share)
          try {
            await navigator.share({ title: 'Prenotazione Padel', text: N });
          } catch {
            console.log('Condivisione annullata');
          }
        else
          (navigator.clipboard.writeText(N), alert('Dettagli prenotazione copiati negli appunti!'));
      },
      [x]
    ),
    C = g.useCallback(
      (n) => {
        confirm('Sei sicuro di voler cancellare questa prenotazione?') &&
          (console.log('Cancellazione prenotazione:', n), v(), h());
      },
      [v, h]
    ),
    j = g.useCallback(
      async (n) => {
        if (n.players && n.id)
          try {
            const N = { ...l, players: n.players };
            (await ce(n.id, { players: n.players }),
              o(N),
              h(),
              console.log('Prenotazione aggiornata con successo'));
          } catch (N) {
            (console.error("Errore durante l'aggiornamento:", N),
              alert('Errore durante il salvataggio delle modifiche'));
          }
        else (c(`/admin-bookings?edit=${n.id}`), v());
      },
      [c, v, l, h]
    ),
    k = g.useCallback((n) => {
      (console.log('Lascia recensione per:', n), alert('Funzionalità di recensioni in arrivo!'));
    }, []),
    u = f || [];
  return r
    ? y && (!u.length || w === 0)
      ? e.jsxs('div', {
          className:
            'bg-gradient-to-br from-gray-50/90 via-blue-50/80 to-indigo-50/90 dark:from-gray-900/90 dark:via-gray-800/90 dark:to-gray-700/90 backdrop-blur-xl border-2 border-blue-200/40 dark:border-blue-700/40 p-6 rounded-3xl shadow-xl shadow-blue-100/30 dark:shadow-blue-900/30',
          children: [
            e.jsxs('div', {
              className: 'flex items-center justify-between mb-4',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center gap-3',
                  children: [
                    e.jsx('div', { className: 'text-2xl', children: '📅' }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('div', {
                          className:
                            'h-5 bg-gray-200/60 dark:bg-gray-600/60 rounded-lg w-32 mb-2 animate-pulse',
                        }),
                        e.jsx('div', {
                          className:
                            'h-4 bg-gray-200/60 dark:bg-gray-600/60 rounded-lg w-24 animate-pulse',
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx('div', {
                  className: 'h-6 w-8 bg-gray-200/60 dark:bg-gray-600/60 rounded-lg animate-pulse',
                }),
              ],
            }),
            e.jsx('div', {
              className: 'space-y-3',
              children: [1, 2, 3].map((n) =>
                e.jsx(
                  'div',
                  {
                    className:
                      'bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm p-4 rounded-xl border-2 border-white/40 dark:border-gray-600/40 animate-pulse shadow-lg shadow-gray-200/40 dark:shadow-gray-900/30 ring-1 ring-gray-200/20 dark:ring-gray-700/20',
                    children: e.jsxs('div', {
                      className: 'flex items-center justify-between',
                      children: [
                        e.jsxs('div', {
                          className: 'flex-1',
                          children: [
                            e.jsx('div', {
                              className:
                                'h-4 bg-gray-200/60 dark:bg-gray-600/60 rounded-lg w-20 mb-2',
                            }),
                            e.jsx('div', {
                              className: 'h-3 bg-gray-200/60 dark:bg-gray-600/60 rounded-lg w-32',
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'text-right',
                          children: [
                            e.jsx('div', {
                              className:
                                'h-3 bg-gray-200/60 dark:bg-gray-600/60 rounded-lg w-8 mb-1',
                            }),
                            e.jsx('div', {
                              className: 'h-3 bg-gray-200/60 dark:bg-gray-600/60 rounded-lg w-12',
                            }),
                          ],
                        }),
                      ],
                    }),
                  },
                  n
                )
              ),
            }),
            e.jsx('div', {
              className: 'mt-4 pt-3 border-t border-white/20 dark:border-gray-700/20',
              children: e.jsx('div', {
                className: 'h-10 bg-gray-200/60 dark:bg-gray-600/60 rounded-xl animate-pulse',
              }),
            }),
          ],
        })
      : !b && !y
        ? e.jsx('div', {
            className:
              'bg-gradient-to-br from-gray-50/90 via-blue-50/80 to-indigo-50/90 dark:from-gray-900/90 dark:via-gray-800/90 dark:to-gray-700/90 backdrop-blur-xl border-2 border-blue-200/40 dark:border-blue-700/40 p-6 rounded-3xl shadow-xl shadow-blue-100/30 dark:shadow-blue-900/30',
            children: e.jsxs('div', {
              className: 'text-center',
              children: [
                e.jsx('div', { className: 'text-4xl mb-3', children: '📅' }),
                e.jsx('h3', {
                  className: 'font-semibold mb-2 text-gray-900 dark:text-white',
                  children: 'Nessuna Prenotazione',
                }),
                e.jsx('p', {
                  className: 'text-sm text-gray-600 dark:text-gray-400 mb-4',
                  children: 'Non hai prenotazioni attive',
                }),
                e.jsx('button', {
                  onClick: () => c('/booking'),
                  className:
                    'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl',
                  children: 'Prenota Ora',
                }),
              ],
            }),
          })
        : e.jsxs('div', {
            className:
              'bg-gradient-to-br from-gray-50/90 via-blue-50/80 to-indigo-50/90 dark:from-gray-900/90 dark:via-gray-800/90 dark:to-gray-700/90 backdrop-blur-xl border-2 border-blue-200/40 dark:border-blue-700/40 p-6 rounded-3xl shadow-xl shadow-blue-100/30 dark:shadow-blue-900/30',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-4',
                children: [
                  e.jsxs('h3', {
                    className:
                      'font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2',
                    children: [
                      e.jsx('div', {
                        className:
                          'w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center',
                        children: e.jsxs('svg', {
                          className: 'w-4 h-4 text-white',
                          fill: 'none',
                          stroke: 'currentColor',
                          viewBox: '0 0 24 24',
                          children: [
                            e.jsx('rect', {
                              x: '3',
                              y: '5',
                              width: '18',
                              height: '16',
                              rx: '2',
                              strokeWidth: 1.5,
                            }),
                            e.jsx('path', { d: 'M8 3v4M16 3v4M3 9h18', strokeWidth: 1.5 }),
                          ],
                        }),
                      }),
                      'Le Tue Prenotazioni',
                    ],
                  }),
                  y &&
                    e.jsxs('div', {
                      className: 'flex items-center gap-1',
                      children: [
                        e.jsx('div', {
                          className: 'w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse',
                        }),
                        e.jsx('div', {
                          className: 'w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-100',
                        }),
                        e.jsx('div', {
                          className: 'w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-200',
                        }),
                      ],
                    }),
                ],
              }),
              e.jsx('div', {
                className: 'overflow-x-auto pb-2 -mx-6 px-6 sm:mx-0 sm:px-0',
                children: e.jsxs('div', {
                  className: 'flex gap-2 w-max sm:grid sm:grid-cols-1 sm:gap-3 sm:w-full',
                  children: [
                    u.map((n) =>
                      e.jsx(me, { booking: n, onBookingClick: B, courts: x, user: r }, n.id)
                    ),
                    e.jsxs('div', {
                      onClick: () => c('/booking'),
                      className: `bg-gradient-to-br from-blue-50/95 to-blue-100/95 dark:from-blue-900/50 dark:to-blue-800/50 
              hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/60 dark:hover:to-blue-700/60
              backdrop-blur-sm border-2 border-dashed border-blue-400/80 dark:border-blue-500/60 rounded-2xl cursor-pointer
              min-w-[240px] h-32 flex-shrink-0 flex flex-col items-center justify-center
              transition-all duration-300 hover:border-blue-500 dark:hover:border-blue-400 group
              hover:shadow-xl hover:shadow-blue-200/40 dark:hover:shadow-blue-900/30 transform hover:scale-[1.02]
              ring-1 ring-blue-200/40 dark:ring-blue-700/40`,
                      children: [
                        e.jsx('div', {
                          className:
                            'w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg',
                          children: e.jsx('svg', {
                            className: 'w-5 h-5 text-white',
                            fill: 'currentColor',
                            viewBox: '0 0 20 20',
                            children: e.jsx('path', {
                              fillRule: 'evenodd',
                              d: 'M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z',
                              clipRule: 'evenodd',
                            }),
                          }),
                        }),
                        e.jsx('span', {
                          className:
                            'text-sm font-medium text-blue-700 dark:text-blue-300 text-center',
                          children: 'Prenota Campo',
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              u.length > 0 &&
                e.jsx('div', {
                  className: 'flex justify-center mt-3 sm:hidden',
                  children: e.jsxs('div', {
                    className: 'flex gap-1',
                    children: [
                      u.slice(0, Math.min(6, u.length)).map((n, N) =>
                        e.jsx(
                          'div',
                          {
                            className: 'w-1 h-1 rounded-full bg-gray-300/60 dark:bg-gray-600/60',
                          },
                          N
                        )
                      ),
                      u.length > 6 &&
                        e.jsx('div', { className: 'w-1 h-1 rounded-full bg-blue-500' }),
                    ],
                  }),
                }),
              e.jsx('div', {
                className:
                  'hidden sm:block mt-4 pt-4 border-t border-white/20 dark:border-gray-700/20',
                children: e.jsx('button', {
                  onClick: () => c('/booking'),
                  className:
                    'w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]',
                  children: 'Nuova Prenotazione',
                }),
              }),
              d &&
                e.jsx(Ee, {
                  booking: l,
                  isOpen: d,
                  onClose: v,
                  state: a,
                  T: t,
                  onShare: D,
                  onCancel: C,
                  onEdit: j,
                  onReview: k,
                }),
            ],
          })
    : e.jsx('div', {
        className:
          'bg-gradient-to-br from-gray-50/90 via-blue-50/80 to-indigo-50/90 dark:from-gray-900/90 dark:via-gray-800/90 dark:to-gray-700/90 backdrop-blur-xl border-2 border-blue-200/40 dark:border-blue-700/40 p-6 rounded-3xl shadow-xl shadow-blue-100/30 dark:shadow-blue-900/30',
        children: e.jsxs('div', {
          className: 'text-center',
          children: [
            e.jsx('div', { className: 'text-4xl mb-3', children: '📅' }),
            e.jsx('h3', {
              className: 'font-semibold mb-2 text-gray-900 dark:text-white',
              children: 'Accedi per vedere le prenotazioni',
            }),
            e.jsx('p', {
              className: 'text-sm text-gray-600 dark:text-gray-400 mb-4',
              children: 'Effettua il login per gestire le tue prenotazioni',
            }),
            e.jsx('button', {
              onClick: () => c('/login'),
              className:
                'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl',
              children: 'Accedi',
            }),
          ],
        }),
      });
}
export { Ae as default };
