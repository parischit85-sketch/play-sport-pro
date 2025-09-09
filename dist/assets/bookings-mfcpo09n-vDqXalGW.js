const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/cloud-bookings-mfcpo09n-XKyj7U0-.js',
      'assets/firebase-mfcpo09n-BteSMG94.js',
      'assets/index-mfcpo09n-Drnu4aiH.js',
      'assets/vendor-mfcpo09n-D3F3s8fL.js',
      'assets/router-mfcpo09n-HwcQM0Ja.js',
      'assets/index-mfcpo7om-BBYtpoEP.css',
    ])
) => i.map((i) => d[i]);
import { j as C, _ } from './index-mfcpo09n-Drnu4aiH.js';
import './router-mfcpo09n-HwcQM0Ja.js';
import {
  createCloudBooking as P,
  loadPublicBookings as R,
  getPublicBookings as H,
  updateCloudBooking as D,
} from './cloud-bookings-mfcpo09n-XKyj7U0-.js';
const $ = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    primary: 'bg-emerald-500 text-black font-medium',
  },
  I = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm',
  };
function q({
  children: e,
  variant: t = 'default',
  size: a = 'sm',
  icon: r,
  removable: s = !1,
  onRemove: n,
  T: o,
}) {
  const c = $[t] || $.default,
    i = I[a] || I.sm,
    d = o?.borderMd || 'rounded-md',
    l = o?.transitionFast || 'transition-all duration-200';
  return C.jsxs('span', {
    className: `
      inline-flex items-center gap-1 
      ${d} 
      ${c} 
      ${i}
      font-medium
      ${l}
    `,
    children: [
      r && C.jsx('span', { className: 'w-3 h-3', children: r }),
      e,
      s &&
        n &&
        C.jsx('button', {
          onClick: n,
          className:
            'ml-1 hover:bg-black/10 rounded-full w-3 h-3 flex items-center justify-center text-xs',
          children: '×',
        }),
    ],
  });
}
const F = {
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
};
function j(e, t, a, r, s, n = null) {
  const o = a,
    c = w(a, r),
    i = f(o),
    d = f(c);
  return !s.some((l) => {
    if (
      l.id === n ||
      l.courtId !== e ||
      l.date !== t ||
      String(l.status).toLowerCase() === 'cancelled' ||
      (l.status && l.status !== 'confirmed' && l.status !== B.CONFIRMED && l.status !== 'booked')
    )
      return !1;
    const m = w(l.time, l.duration),
      u = f(l.time),
      p = f(m),
      g = i < p && d > u;
    return (
      g &&
        console.log('Sovrapposizione rilevata:', {
          existing: `${l.time}-${m} (${u}-${p} min)`,
          new: `${o}-${c} (${i}-${d} min)`,
          courtId: e,
          date: t,
        }),
      g
    );
  });
}
function w(e, t) {
  const [a, r] = e.split(':').map(Number),
    s = a * 60 + r + t,
    n = Math.floor(s / 60),
    o = s % 60;
  return `${n.toString().padStart(2, '0')}:${o.toString().padStart(2, '0')}`;
}
function f(e) {
  const [t, a] = e.split(':').map(Number);
  return t * 60 + a;
}
function U(e, t, a, r, s, n = null) {
  const o = f(a),
    c = w(a, r),
    i = f(c),
    d = (s || []).filter((u) =>
      (n && u.id === n) || u.courtId !== e || u.date !== t ? !1 : u.status !== B.CANCELLED
    );
  if (d.length === 0) return !1;
  let l = null,
    m = null;
  for (const u of d) {
    const p = f(u.time),
      g = f(w(u.time, u.duration));
    (g <= o && (l === null || g > l) && (l = g), p >= i && (m === null || p < m) && (m = p));
  }
  return (l !== null && o - l === 30) || (m !== null && m - i === 30);
}
function N() {
  return `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
const B = { CONFIRMED: 'confirmed', CANCELLED: 'cancelled' },
  b = 'ml-field-bookings';
let y = !1,
  v = null,
  k = !1;
function L(e, t = null) {
  ((y = e), (v = t));
}
async function T() {
  if (y && v)
    try {
      return await R();
    } catch (e) {
      return (console.warn('Errore caricamento da cloud, fallback a localStorage:', e), h());
    }
  return h();
}
function h() {
  try {
    const e = localStorage.getItem(b);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function S(e) {
  try {
    return (localStorage.setItem(b, JSON.stringify(e)), !0);
  } catch {
    return !1;
  }
}
async function G(e, t) {
  if (y && t)
    try {
      return { ...(await P(e, t)), _storage: 'cloud' };
    } catch (r) {
      return (
        console.warn('Errore creazione nel cloud, fallback a localStorage:', r),
        { ...M(e, t), _storage: 'local' }
      );
    }
  return { ...M(e, t), _storage: 'local' };
}
function M(e, t) {
  const a = {
      id: N(),
      courtId: e.courtId,
      courtName: e.courtName,
      date: e.date,
      time: e.time,
      duration: e.duration,
      lighting: e.lighting || !1,
      heating: e.heating || !1,
      price: e.price,
      bookedBy: t?.displayName || t?.email || 'Anonimo',
      userEmail: t?.email,
      userPhone: e.userPhone || '',
      players: e.players || [],
      notes: e.notes || '',
      status: B.CONFIRMED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: t?.uid || null,
    },
    r = h();
  return (r.push(a), S(r), a);
}
async function K(e, t, a) {
  if (y && a)
    try {
      return await D(e, t, a);
    } catch (r) {
      return (
        console.warn('Errore aggiornamento nel cloud, fallback a localStorage:', r),
        A(e, t, a)
      );
    }
  return A(e, t, a);
}
function A(e, t, a) {
  const r = h(),
    s = r.findIndex((o) => o.id === e);
  if (s === -1) return null;
  const n = { ...r[s], ...t, updatedAt: new Date().toISOString(), updatedBy: a?.uid || null };
  return ((r[s] = n), S(r), n);
}
async function E() {
  if (y)
    try {
      return await H();
    } catch (e) {
      return (
        e?.code === 'failed-precondition'
          ? k ||
            (console.warn('Cloud bookings richiedono un indice: uso dati locali (fallback).'),
            (k = !0))
          : console.warn('Errore caricamento pubbliche da cloud, fallback a localStorage:', e),
        O()
      );
    }
  return O();
}
function O() {
  return h()
    .filter((t) => t.status === B.CONFIRMED)
    .map((t) => ({
      id: t.id,
      courtId: t.courtId,
      courtName: t.courtName,
      date: t.date,
      time: t.time,
      duration: t.duration,
      status: t.status,
    }));
}
async function z(e) {
  try {
    L(!!e?.uid, e);
    const t = await E();
    if (e && e.uid)
      try {
        const { loadActiveUserBookings: a } = await _(
            async () => {
              const { loadActiveUserBookings: s } = await import(
                './cloud-bookings-mfcpo09n-XKyj7U0-.js'
              );
              return { loadActiveUserBookings: s };
            },
            __vite__mapDeps([0, 1, 2, 3, 4, 5])
          ),
          r = await a(e.uid);
      } catch (a) {
        console.warn('initializeBookingSystem: Cloud user data failed:', a);
      }
    return (await x(), !0);
  } catch (t) {
    return (console.error('initializeBookingSystem: Failed:', t), !1);
  }
}
async function x() {
  try {
    let e = [];
    try {
      e = [...(await E())];
    } catch (t) {
      console.warn('syncAllBookings: Failed to load public bookings:', t);
    }
    try {
      const t = await h(),
        a = new Map();
      (e.forEach((r) => {
        const s = r.id || `${r.date}-${r.time}-${r.courtId}`;
        a.set(s, r);
      }),
        t.forEach((r) => {
          const s = r.id || `${r.date}-${r.time}-${r.courtId}`;
          a.has(s) || a.set(s, r);
        }),
        (e = Array.from(a.values())),
        await S(e));
    } catch (t) {
      console.warn('syncAllBookings: Failed to sync local storage:', t);
    }
    return e;
  } catch (e) {
    return (console.error('syncAllBookings: Complete failure:', e), []);
  }
}
async function V(e, t = !1) {
  if (!e) return [];
  try {
    t ? await z(e) : await x();
    let a = [];
    if (y && e.uid)
      try {
        const { loadActiveUserBookings: n } = await _(
            async () => {
              const { loadActiveUserBookings: c } = await import(
                './cloud-bookings-mfcpo09n-XKyj7U0-.js'
              );
              return { loadActiveUserBookings: c };
            },
            __vite__mapDeps([0, 1, 2, 3, 4, 5])
          ),
          o = await n(e.uid);
        o && o.length > 0 && (a = o);
      } catch (n) {
        console.warn('Cloud user bookings not available:', n);
      }
    try {
      const o = (await T()).filter(
        (c) => c.userEmail === e.email || c.email === e.email || c.userId === e.uid
      );
      if (a.length > 0 && o.length > 0) {
        const c = new Map();
        (a.forEach((i) => {
          c.set(i.id || `${i.date}-${i.time}-${i.courtId}`, i);
        }),
          o.forEach((i) => {
            const d = i.id || `${i.date}-${i.time}-${i.courtId}`;
            c.has(d) || c.set(d, i);
          }),
          (a = Array.from(c.values())));
      } else o.length > 0 && (a = o);
    } catch (n) {
      console.warn('localStorage user bookings not available:', n);
    }
    const r = new Date(),
      s = a.filter((n) => new Date(`${n.date}T${n.time}:00`) > r);
    return (
      s.sort((n, o) => {
        const c = new Date(`${n.date}T${n.time}:00`),
          i = new Date(`${o.date}T${o.time}:00`);
        return c - i;
      }),
      s
    );
  } catch (a) {
    return (console.error('Error loading user bookings:', a), []);
  }
}
const Q = Object.freeze(
  Object.defineProperty(
    {
      __proto__: null,
      BOOKING_CONFIG: F,
      BOOKING_STATUS: B,
      createBooking: G,
      generateBookingId: N,
      getPublicBookings: E,
      getUserBookings: V,
      initializeBookingSystem: z,
      isSlotAvailable: j,
      loadBookings: T,
      setCloudMode: L,
      syncAllBookings: x,
      updateBooking: K,
      wouldCreateHalfHourHole: U,
    },
    Symbol.toStringTag,
    { value: 'Module' }
  )
);
export { q as B, F as a, Q as b, G as c, j as i, L as s, K as u, U as w };
