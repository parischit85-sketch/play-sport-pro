import { v as F, _, u as ye, j as e } from './index-mffptcom-DDEOMtjD.js';
import { r as g, c as we, b as ve } from './router-mffptcom-C1Xlp-63.js';
import {
  r as re,
  p as ae,
  x as T,
  y as $,
  q as te,
  A as je,
  B as ke,
  f as Ne,
} from './firebase-mffptcom-X_I_guKF.js';
import { M as Be } from './Modal-mffptcom-BdCISDND.js';
import { B as z } from './Badge-mffptcom-BQw6PQwf.js';
import './vendor-mffptcom-D3F3s8fL.js';
const G = 'bookings';
async function q() {
  try {
    const r = re(ae(F, G), T('status', '==', 'confirmed'), $('date', 'asc'), $('time', 'asc'));
    return (await te(r)).docs.map((t) => ({ id: t.id, ...t.data() }));
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
async function Ce(r) {
  try {
    const a = new Date().toISOString().split('T')[0],
      t = re(
        ae(F, G),
        T('createdBy', '==', r),
        T('status', '==', 'confirmed'),
        T('date', '>=', a),
        $('date', 'asc'),
        $('time', 'asc')
      );
    return (await te(t)).docs.map((n) => ({ id: n.id, ...n.data() }));
  } catch (a) {
    return (
      a?.code !== 'permission-denied' &&
        a?.code !== 'failed-precondition' &&
        console.warn('Errore caricamento prenotazioni attive:', a),
      []
    );
  }
}
async function se(r, a, t) {
  try {
    const s = { ...a, updatedAt: je(), updatedBy: t?.uid || null };
    return (await ke(Ne(F, G, r), s), { id: r, ...a, updatedAt: new Date().toISOString() });
  } catch (s) {
    throw (
      console.error('Errore aggiornamento prenotazione:', s),
      new Error('Impossibile aggiornare la prenotazione. Riprova più tardi.')
    );
  }
}
async function oe() {
  return (await q())
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
const H = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        getPublicBookings: oe,
        loadActiveUserBookings: Ce,
        loadPublicBookings: q,
        updateCloudBooking: se,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  V = {
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
  le = { CONFIRMED: 'confirmed' },
  ne = 'ml-field-bookings';
let O = !1,
  ie = null,
  W = !1;
function de(r, a = null) {
  ((O = r), (ie = a));
}
async function ce() {
  if (O && ie)
    try {
      return await q();
    } catch (r) {
      return (console.warn('Errore caricamento da cloud, fallback a localStorage:', r), I());
    }
  return I();
}
function I() {
  try {
    const r = localStorage.getItem(ne);
    return r ? JSON.parse(r) : [];
  } catch {
    return [];
  }
}
function ue(r) {
  try {
    return (localStorage.setItem(ne, JSON.stringify(r)), !0);
  } catch {
    return !1;
  }
}
async function me(r, a, t) {
  if (O && t)
    try {
      return await se(r, a, t);
    } catch (s) {
      return (
        console.warn('Errore aggiornamento nel cloud, fallback a localStorage:', s),
        X(r, a, t)
      );
    }
  return X(r, a, t);
}
function X(r, a, t) {
  const s = I(),
    n = s.findIndex((d) => d.id === r);
  if (n === -1) return null;
  const o = { ...s[n], ...a, updatedAt: new Date().toISOString(), updatedBy: t?.uid || null };
  return ((s[n] = o), ue(s), o);
}
async function K() {
  if (O)
    try {
      return await oe();
    } catch (r) {
      return (
        r?.code === 'failed-precondition'
          ? W ||
            (console.warn('Cloud bookings richiedono un indice: uso dati locali (fallback).'),
            (W = !0))
          : console.warn('Errore caricamento pubbliche da cloud, fallback a localStorage:', r),
        ee()
      );
    }
  return ee();
}
function ee() {
  return I()
    .filter((a) => a.status === le.CONFIRMED)
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
async function he(r) {
  try {
    de(!!r?.uid, r);
    const a = await K();
    if (r && r.uid)
      try {
        const { loadActiveUserBookings: t } = await _(
            async () => {
              const { loadActiveUserBookings: n } = await Promise.resolve().then(() => H);
              return { loadActiveUserBookings: n };
            },
            void 0
          ),
          s = await t(r.uid);
      } catch (t) {
        console.warn('initializeBookingSystem: Cloud user data failed:', t);
      }
    return (await J(), !0);
  } catch (a) {
    return (console.error('initializeBookingSystem: Failed:', a), !1);
  }
}
async function J() {
  try {
    let r = [];
    try {
      r = [...(await K())];
    } catch (a) {
      console.warn('syncAllBookings: Failed to load public bookings:', a);
    }
    try {
      const a = await I(),
        t = new Map();
      (r.forEach((s) => {
        const n = s.id || `${s.date}-${s.time}-${s.courtId}`;
        t.set(n, s);
      }),
        a.forEach((s) => {
          const n = s.id || `${s.date}-${s.time}-${s.courtId}`;
          t.has(n) || t.set(n, s);
        }),
        (r = Array.from(t.values())),
        await ue(r));
    } catch (a) {
      console.warn('syncAllBookings: Failed to sync local storage:', a);
    }
    return r;
  } catch (r) {
    return (console.error('syncAllBookings: Complete failure:', r), []);
  }
}
async function De(r, a = !1) {
  if (!r) return [];
  try {
    a ? await he(r) : await J();
    let t = [];
    if (O && r.uid)
      try {
        const { loadActiveUserBookings: o } = await _(
            async () => {
              const { loadActiveUserBookings: i } = await Promise.resolve().then(() => H);
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
      const d = (await ce()).filter(
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
      n = t.filter((o) => new Date(`${o.date}T${o.time}:00`) > s);
    return (
      n.sort((o, d) => {
        const i = new Date(`${o.date}T${o.time}:00`),
          c = new Date(`${d.date}T${d.time}:00`);
        return i - c;
      }),
      n
    );
  } catch (t) {
    return (console.error('Error loading user bookings:', t), []);
  }
}
const Se = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        BOOKING_CONFIG: V,
        BOOKING_STATUS: le,
        getPublicBookings: K,
        getUserBookings: De,
        initializeBookingSystem: he,
        loadBookings: ce,
        setCloudMode: de,
        syncAllBookings: J,
        updateBooking: me,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  U = new Map(),
  A = new Map();
function Pe(r = {}) {
  const { user: a } = ye(),
    { refreshInterval: t = 3e4, enableBackground: s = !0 } = r,
    [n, o] = g.useState([]),
    [d, i] = g.useState(!0),
    [c, f] = g.useState(null),
    [w, h] = g.useState(0),
    p = g.useRef(!0),
    v = g.useRef(null),
    x = a?.uid ? `bookings-${a.uid}` : null,
    B = g.useCallback(
      async (j = !1) => {
        if (!a?.uid) return (o([]), i(!1), []);
        if (!j && x) {
          const u = U.get(x);
          if (u && Date.now() - u.timestamp < 6e4)
            return (p.current && (o(u.data), i(!1), h(u.timestamp)), u.data);
        }
        if (A.has(x))
          try {
            const u = await A.get(x);
            return (p.current && (o(u), i(!1)), u);
          } catch (u) {
            throw (p.current && (f(u), i(!1)), u);
          }
        const k = Ee(a);
        A.set(x, k);
        try {
          p.current && i(!0);
          const u = await k,
            l = Date.now();
          return (x && U.set(x, { data: u, timestamp: l }), p.current && (o(u), f(null), h(l)), u);
        } catch (u) {
          throw (console.error('Error loading user bookings:', u), p.current && f(u), u);
        } finally {
          (A.delete(x), p.current && i(!1));
        }
      },
      [a?.uid, x]
    );
  (g.useEffect(
    () => (
      (p.current = !0),
      B(),
      () => {
        ((p.current = !1), v.current && clearInterval(v.current));
      }
    ),
    [B]
  ),
    g.useEffect(() => {
      if (!(!s || !a?.uid))
        return (
          (v.current = setInterval(() => {
            p.current && document.visibilityState === 'visible' && B(!0);
          }, t)),
          () => {
            v.current && clearInterval(v.current);
          }
        );
    }, [B, t, s, a?.uid]));
  const b = g.useMemo(() => {
      const j = new Date();
      return n.filter((k) => new Date(`${k.date}T${k.time}:00`) > j);
    }, [n]),
    D = g.useMemo(() => {
      const j = new Date().toISOString().split('T')[0];
      return b.filter((k) => k.date === j);
    }, [b]),
    C = g.useCallback(() => (x && U.delete(x), B(!0)), [B, x]);
  return {
    bookings: b,
    allBookings: n,
    todayBookings: D,
    loading: d,
    error: c,
    lastUpdate: w,
    refresh: C,
    hasBookings: b.length > 0,
  };
}
async function Ee(r) {
  if (!r?.uid) return [];
  try {
    const [a, t] = await Promise.allSettled([Ie(r.uid), Oe(r)]);
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
    const n = new Date();
    return s
      .filter((o) => new Date(`${o.date}T${o.time}:00`) > n)
      .sort((o, d) => {
        const i = new Date(`${o.date}T${o.time}:00`),
          c = new Date(`${d.date}T${d.time}:00`);
        return i - c;
      });
  } catch (a) {
    return (console.error('Error in loadUserBookingsOptimized:', a), []);
  }
}
async function Ie(r) {
  try {
    const { loadActiveUserBookings: a } = await _(
      async () => {
        const { loadActiveUserBookings: t } = await Promise.resolve().then(() => H);
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
async function Oe(r) {
  try {
    const { getUserBookings: a } = await _(
      async () => {
        const { getUserBookings: t } = await Promise.resolve().then(() => Se);
        return { getUserBookings: t };
      },
      void 0
    );
    return await a(r, !1);
  } catch (a) {
    return (console.warn('Local bookings failed:', a), []);
  }
}
function ze({
  booking: r,
  isOpen: a,
  onClose: t,
  state: s,
  T: n,
  onShare: o,
  onCancel: d,
  onEdit: i,
  onReview: c,
}) {
  const [f, w] = g.useState(!1),
    [h, p] = g.useState(r?.players || []),
    [v, x] = g.useState('');
  if (!r) return null;
  const b = (s?.courts || V.courts)?.find((m) => m.id === r.courtId),
    D = new Date(r.date),
    C = new Date(`${r.date}T${r.time}:00`),
    j = new Date(),
    k = D.toDateString() === new Date().toDateString(),
    u = D.toDateString() === new Date(Date.now() + 864e5).toDateString(),
    l = C < j,
    N = C > j && C <= new Date(j.getTime() + 1440 * 60 * 1e3),
    xe = (C - j) / (1e3 * 60 * 60) > 30,
    Z = !l,
    M = (m) =>
      m
        ? typeof m == 'string'
          ? m
          : typeof m == 'object'
            ? m.name || m.email || ''
            : String(m)
        : '',
    Y = () => {
      (i && h !== r.players && i({ ...r, players: h }), w(!1));
    },
    fe = () => {
      (p(r.players), w(!1));
    },
    pe = () => {
      f ? Y() : w(!0);
    };
  let S;
  l
    ? (S = 'Passata')
    : k
      ? (S = 'Oggi')
      : u
        ? (S = 'Domani')
        : (S = D.toLocaleDateString('it-IT', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }));
  const R = C - j,
    Q = Math.floor(R / (1e3 * 60 * 60)),
    be = Math.floor((R % (1e3 * 60 * 60)) / (1e3 * 60));
  return e.jsx(Be, {
    open: a,
    onClose: t,
    title: 'Dettaglio Prenotazione',
    T: n,
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
                          children: b?.name || `Campo ${r.courtId}`,
                        }),
                        e.jsxs('div', {
                          className: 'text-white/90 text-sm',
                          children: [S, ' • ', r.time],
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
                l && e.jsx(z, { variant: 'secondary', size: 'xs', T: n, children: 'Completata' }),
                k && !l && e.jsx(z, { variant: 'warning', size: 'xs', T: n, children: 'Oggi' }),
                N && e.jsx(z, { variant: 'success', size: 'xs', T: n, children: 'Prossima' }),
                r.confirmed &&
                  e.jsx(z, { variant: 'primary', size: 'xs', T: n, children: 'Confermata' }),
              ],
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-2 gap-4',
          children: [
            e.jsxs('div', {
              className:
                'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-xl p-4 shadow-lg shadow-gray-100/50 dark:shadow-gray-900/20',
              children: [
                e.jsx('div', {
                  className: 'text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium',
                  children: '📅 DATA E ORARIO',
                }),
                e.jsx('div', {
                  className: 'font-semibold text-sm text-gray-900 dark:text-white',
                  children: S,
                }),
                e.jsxs('div', {
                  className: 'text-sm text-gray-600 dark:text-gray-300',
                  children: [r.time, ' (', r.duration || 60, 'min)'],
                }),
                !l &&
                  R > 0 &&
                  e.jsxs('div', {
                    className: 'text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium',
                    children: [Q > 0 && `${Q}h `, be, 'min rimanenti'],
                  }),
              ],
            }),
            e.jsxs('div', {
              className:
                'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-xl p-4 shadow-lg shadow-gray-100/50 dark:shadow-gray-900/20',
              children: [
                e.jsx('div', {
                  className: 'text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium',
                  children: '🏟️ CAMPO',
                }),
                e.jsx('div', {
                  className: 'font-semibold text-sm text-gray-900 dark:text-white',
                  children: b?.name || `Campo ${r.courtId}`,
                }),
                b?.features &&
                  e.jsx('div', {
                    className: 'text-xs text-gray-600 dark:text-gray-400',
                    children: b.features.join(' • '),
                  }),
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
                          h.slice(1).map((m, y) =>
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
                                        onChange: (P) => {
                                          const E = [...h];
                                          (typeof m == 'object'
                                            ? (E[y + 1] = { ...m, name: P.target.value })
                                            : (E[y + 1] = P.target.value),
                                            p(E));
                                        },
                                        className:
                                          'w-full text-sm font-medium text-gray-900 dark:text-gray-100 bg-transparent border-b-2 border-gray-300 dark:border-gray-500 focus:border-green-500 dark:focus:border-green-400 outline-none pb-1 transition-colors',
                                        placeholder: 'Nome giocatore',
                                      }),
                                      e.jsxs('div', {
                                        className: 'text-xs text-gray-500 dark:text-gray-400',
                                        children: ['Giocatore ', y + 2],
                                      }),
                                    ],
                                  }),
                                  e.jsx('button', {
                                    onClick: () => {
                                      const P = [...h];
                                      (P.splice(y + 1, 1), p(P));
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
                              y
                            )
                          ),
                        h.length < 4 &&
                          e.jsxs('div', {
                            className: 'flex gap-3',
                            children: [
                              e.jsx('input', {
                                type: 'text',
                                value: v,
                                onChange: (m) => x(m.target.value),
                                onKeyDown: (m) => {
                                  if (m.key === 'Enter') {
                                    const y = h
                                      ? [...h]
                                      : [r.userName || r.userEmail || 'Organizzatore'];
                                    v.trim() &&
                                      (y.push({ name: v.trim(), id: Date.now() }), p(y), x(''));
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
                                  v.trim() &&
                                    (m.push({ name: v.trim(), id: Date.now() }), p(m), x(''));
                                },
                                disabled: !v.trim(),
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
                              onClick: Y,
                              className:
                                'flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl text-sm font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105',
                              children: '💾 Salva Modifiche',
                            }),
                            e.jsx('button', {
                              onClick: fe,
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
                          r.players.slice(1).map((m, y) =>
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
                                      children: y + 2,
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
                                        children: ['Giocatore ', y + 2],
                                      }),
                                    ],
                                  }),
                                ],
                              },
                              y
                            )
                          ),
                        (() => {
                          const m = r.players?.length || 1,
                            y = 4 - m;
                          return (
                            y > 0 &&
                            Array.from({ length: y }).map((P, E) =>
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
                                          children: ['Giocatore ', m + E + 1],
                                        }),
                                      ],
                                    }),
                                  ],
                                },
                                `empty-${E}`
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
        e.jsxs('div', {
          className:
            'bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-xl p-4 shadow-lg shadow-green-100/50 dark:shadow-green-900/20',
          children: [
            e.jsx('div', {
              className: 'text-xs text-green-700 dark:text-green-300 mb-2 font-medium',
              children: '💰 PREZZO',
            }),
            e.jsxs('div', {
              className: 'flex justify-between items-center',
              children: [
                e.jsxs('div', {
                  className: 'font-bold text-lg text-green-900 dark:text-green-100',
                  children: ['€', r.price || 'N/A'],
                }),
                r.confirmed
                  ? e.jsxs('span', {
                      className: 'text-green-600 dark:text-green-400 flex items-center gap-1',
                      children: [
                        e.jsx('span', { className: 'w-2 h-2 bg-green-500 rounded-full' }),
                        'Pagato',
                      ],
                    })
                  : e.jsxs('span', {
                      className: 'text-amber-600 dark:text-amber-400 flex items-center gap-1',
                      children: [
                        e.jsx('span', { className: 'w-2 h-2 bg-amber-500 rounded-full' }),
                        'Da confermare',
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
          className:
            'bg-gradient-to-r from-yellow-50/80 to-amber-50/80 dark:from-yellow-900/30 dark:to-amber-900/30 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-xl p-4 shadow-lg shadow-yellow-100/50 dark:shadow-yellow-900/20',
          children: [
            e.jsx('div', {
              className: 'text-xs text-yellow-800 dark:text-yellow-200 font-medium mb-2',
              children: 'ℹ️ PROMEMORIA',
            }),
            e.jsxs('div', {
              className: 'text-xs text-gray-700 dark:text-gray-300 space-y-1',
              children: [
                e.jsx('div', { children: '• Arriva 10 min prima' }),
                e.jsx('div', { children: '• Porta racchette e palline' }),
                b?.phone &&
                  e.jsxs('div', {
                    children: [
                      '• Tel: ',
                      e.jsx('span', { className: 'font-medium', children: b.phone }),
                    ],
                  }),
              ],
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'space-y-3 pb-4 md:pb-0',
          children: [
            !l &&
              Z &&
              e.jsx('button', {
                onClick: pe,
                className:
                  'w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 px-4 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]',
                children: f ? '💾 Salva Modifiche' : '✏️ Modifica Giocatori',
              }),
            !l &&
              !Z &&
              e.jsx('div', {
                className:
                  'w-full bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 text-gray-600 dark:text-gray-300 py-4 px-4 rounded-xl text-sm text-center shadow-sm',
                children: '⏰ Modifiche disponibili fino a 30 ore prima',
              }),
            e.jsx('div', {
              className: 'flex gap-3',
              children: l
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
                      xe
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
  });
}
const ge = ve.memo(({ booking: r, onBookingClick: a, courts: t, user: s }) => {
  const n = t?.find((w) => w.id === r.courtId),
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
      className: `bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30
        hover:bg-white/90 dark:hover:bg-gray-800/90 hover:border-blue-300/60 dark:hover:border-blue-400/60 
        hover:shadow-xl hover:shadow-blue-100/30 dark:hover:shadow-blue-900/20 
        p-4 rounded-2xl cursor-pointer transition-all duration-300 group
        min-w-[240px] h-32 sm:min-w-0 sm:h-auto flex-shrink-0 sm:flex-shrink
        transform hover:scale-[1.02] flex flex-col justify-between
        shadow-lg shadow-gray-100/50 dark:shadow-gray-900/20`,
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
                  children: [n?.name || 'Padel 1', ' • ', r.duration || 60, 'min'],
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
                          r.players.slice(0, 2).map((w, h) =>
                            e.jsxs(
                              'span',
                              {
                                children: [
                                  w.name || w,
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
ge.displayName = 'BookingCard';
function Re({ user: r, state: a, T: t, compact: s }) {
  const [n, o] = g.useState(null),
    [d, i] = g.useState(!1),
    c = we(),
    {
      bookings: f,
      loading: w,
      refresh: h,
      hasBookings: p,
      lastUpdate: v,
    } = Pe({ refreshInterval: 3e4, enableBackground: !0 }),
    x = g.useMemo(() => a?.courts || V.courts, [a?.courts]),
    B = g.useCallback((l) => {
      (o(l), i(!0));
    }, []),
    b = g.useCallback(() => {
      (i(!1), o(null));
    }, []),
    D = g.useCallback(
      async (l) => {
        const N = `Prenotazione Padel 🎾
${l.date} alle ${l.time}
Campo: ${x.find((L) => L.id === l.courtId)?.name || 'Padel 1'}
Giocatori: ${l.players?.join(', ') || 'Da definire'}`;
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
      (l) => {
        confirm('Sei sicuro di voler cancellare questa prenotazione?') &&
          (console.log('Cancellazione prenotazione:', l), b(), h());
      },
      [b, h]
    ),
    j = g.useCallback(
      async (l) => {
        if (l.players && l.id)
          try {
            const N = { ...n, players: l.players };
            (await me(l.id, { players: l.players }),
              o(N),
              h(),
              console.log('Prenotazione aggiornata con successo'));
          } catch (N) {
            (console.error("Errore durante l'aggiornamento:", N),
              alert('Errore durante il salvataggio delle modifiche'));
          }
        else (c(`/admin-bookings?edit=${l.id}`), b());
      },
      [c, b, n, h]
    ),
    k = g.useCallback((l) => {
      (console.log('Lascia recensione per:', l), alert('Funzionalità di recensioni in arrivo!'));
    }, []),
    u = f || [];
  return r
    ? w && (!u.length || v === 0)
      ? e.jsxs('div', {
          className:
            'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 p-6 rounded-2xl shadow-lg shadow-gray-100/50 dark:shadow-gray-900/20',
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
              children: [1, 2, 3].map((l) =>
                e.jsx(
                  'div',
                  {
                    className:
                      'bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm p-4 rounded-xl border border-white/20 dark:border-gray-600/20 animate-pulse',
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
                  l
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
      : !p && !w
        ? e.jsx('div', {
            className:
              'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 p-6 rounded-2xl shadow-lg shadow-gray-100/50 dark:shadow-gray-900/20',
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
              'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 p-6 rounded-2xl shadow-lg shadow-gray-100/50 dark:shadow-gray-900/20',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-4',
                children: [
                  e.jsx('h3', {
                    className: 'font-semibold text-lg text-gray-900 dark:text-white',
                    children: 'Le Tue Prenotazioni',
                  }),
                  w &&
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
                    u.map((l) =>
                      e.jsx(ge, { booking: l, onBookingClick: B, courts: x, user: r }, l.id)
                    ),
                    e.jsxs('div', {
                      onClick: () => c('/booking'),
                      className: `bg-gradient-to-br from-blue-50/80 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/30 \r
              hover:from-blue-100/90 hover:to-blue-200/90 dark:hover:from-blue-800/40 dark:hover:to-blue-700/40\r
              backdrop-blur-sm border-2 border-dashed border-blue-300/60 dark:border-blue-500/40 rounded-2xl cursor-pointer\r
              min-w-[240px] h-32 flex-shrink-0 flex flex-col items-center justify-center\r
              transition-all duration-300 hover:border-blue-400/80 dark:hover:border-blue-400/60 group\r
              hover:shadow-lg hover:shadow-blue-100/30 dark:hover:shadow-blue-900/20 transform hover:scale-[1.02]`,
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
                      u.slice(0, Math.min(6, u.length)).map((l, N) =>
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
                e.jsx(ze, {
                  booking: n,
                  isOpen: d,
                  onClose: b,
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
          'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 p-6 rounded-2xl shadow-lg shadow-gray-100/50 dark:shadow-gray-900/20',
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
export { Re as default };
