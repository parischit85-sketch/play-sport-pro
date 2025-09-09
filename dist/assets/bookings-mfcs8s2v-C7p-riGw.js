const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/cloud-bookings-mfcs8s2v-TfWv83d2.js',
      'assets/firebase-mfcs8s2v-BteSMG94.js',
      'assets/index-mfcs8s2v-Cf-KQmcH.js',
      'assets/vendor-mfcs8s2v-D3F3s8fL.js',
      'assets/router-mfcs8s2v-DNUHJuYl.js',
      'assets/index-mfcs8x74-BBYtpoEP.css',
    ])
) => i.map((i) => d[i]);
import { j as S, _ } from './index-mfcs8s2v-Cf-KQmcH.js';
import './router-mfcs8s2v-DNUHJuYl.js';
import {
  createCloudBooking as P,
  loadPublicBookings as R,
  getPublicBookings as H,
  updateCloudBooking as D,
} from './cloud-bookings-mfcs8s2v-TfWv83d2.js';
const $ = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    primary: 'bg-emerald-500 text-black font-medium',
  },
  M = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm',
  };
function Q({
  children: t,
  variant: e = 'default',
  size: a = 'sm',
  icon: r,
  removable: s = !1,
  onRemove: n,
  T: o,
}) {
  const u = $[e] || $.default,
    l = M[a] || M.sm,
    m = o?.borderMd || 'rounded-md',
    i = o?.transitionFast || 'transition-all duration-200';
  return S.jsxs('span', {
    className: `
      inline-flex items-center gap-1 
      ${m} 
      ${u} 
      ${l}
      font-medium
      ${i}
    `,
    children: [
      r && S.jsx('span', { className: 'w-3 h-3', children: r }),
      t,
      s &&
        n &&
        S.jsx('button', {
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
function j(t, e, a, r, s, n = null) {
  const o = a,
    u = h(a, r),
    l = p(o),
    m = p(u);
  return !s.some((i) => {
    if (
      i.id === n ||
      i.courtId !== t ||
      i.date !== e ||
      String(i.status).toLowerCase() === 'cancelled' ||
      (i.status && i.status !== 'confirmed' && i.status !== B.CONFIRMED && i.status !== 'booked')
    )
      return !1;
    const d = h(i.time, i.duration),
      c = p(i.time),
      f = p(d),
      g = l < f && m > c;
    return (
      g &&
        console.log('Sovrapposizione rilevata:', {
          existing: `${i.time}-${d} (${c}-${f} min)`,
          new: `${o}-${u} (${l}-${m} min)`,
          courtId: t,
          date: e,
        }),
      g
    );
  });
}
function h(t, e) {
  const [a, r] = t.split(':').map(Number),
    s = a * 60 + r + e,
    n = Math.floor(s / 60),
    o = s % 60;
  return `${n.toString().padStart(2, '0')}:${o.toString().padStart(2, '0')}`;
}
function p(t) {
  const [e, a] = t.split(':').map(Number);
  return e * 60 + a;
}
function U(t, e, a, r, s, n = null) {
  const o = p(a),
    u = h(a, r),
    l = p(u),
    m = (s || []).filter((c) =>
      (n && c.id === n) || c.courtId !== t || c.date !== e ? !1 : c.status !== B.CANCELLED
    );
  if (m.length === 0) return !1;
  let i = null,
    d = null;
  for (const c of m) {
    const f = p(c.time),
      g = p(h(c.time, c.duration));
    (g <= o && (i === null || g > i) && (i = g), f >= l && (d === null || f < d) && (d = f));
  }
  return (i !== null && o - i === 30) || (d !== null && d - l === 30);
}
function G(t, e, a, r, s, n = null) {
  const o = p(a),
    u = h(a, r),
    l = p(u),
    m = (s || []).filter((c) =>
      (n && c.id === n) || c.courtId !== t || c.date !== e ? !1 : c.status !== B.CANCELLED
    );
  if (m.length < 2) return !1;
  let i = null,
    d = null;
  for (const c of m) {
    const f = p(c.time),
      g = p(h(c.time, c.duration));
    (g <= o && (i === null || g > i) && (i = g), f >= l && (d === null || f < d) && (d = f));
  }
  if (i !== null && d !== null) {
    const c = o - i,
      f = d - l;
    return c === 30 || f === 30;
  }
  return !1;
}
function N() {
  return `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
const B = { CONFIRMED: 'confirmed', CANCELLED: 'cancelled' },
  v = 'ml-field-bookings';
let w = !1,
  L = null,
  I = !1;
function T(t, e = null) {
  ((w = t), (L = e));
}
async function b() {
  if (w && L)
    try {
      return await R();
    } catch (t) {
      return (console.warn('Errore caricamento da cloud, fallback a localStorage:', t), y());
    }
  return y();
}
function y() {
  try {
    const t = localStorage.getItem(v);
    return t ? JSON.parse(t) : [];
  } catch {
    return [];
  }
}
function C(t) {
  try {
    return (localStorage.setItem(v, JSON.stringify(t)), !0);
  } catch {
    return !1;
  }
}
async function K(t, e) {
  if (w && e)
    try {
      return { ...(await P(t, e)), _storage: 'cloud' };
    } catch (r) {
      return (
        console.warn('Errore creazione nel cloud, fallback a localStorage:', r),
        { ...k(t, e), _storage: 'local' }
      );
    }
  return { ...k(t, e), _storage: 'local' };
}
function k(t, e) {
  const a = {
      id: N(),
      courtId: t.courtId,
      courtName: t.courtName,
      date: t.date,
      time: t.time,
      duration: t.duration,
      lighting: t.lighting || !1,
      heating: t.heating || !1,
      price: t.price,
      bookedBy: e?.displayName || e?.email || 'Anonimo',
      userEmail: e?.email,
      userPhone: t.userPhone || '',
      players: t.players || [],
      notes: t.notes || '',
      status: B.CONFIRMED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: e?.uid || null,
    },
    r = y();
  return (r.push(a), C(r), a);
}
async function V(t, e, a) {
  if (w && a)
    try {
      return await D(t, e, a);
    } catch (r) {
      return (
        console.warn('Errore aggiornamento nel cloud, fallback a localStorage:', r),
        A(t, e, a)
      );
    }
  return A(t, e, a);
}
function A(t, e, a) {
  const r = y(),
    s = r.findIndex((o) => o.id === t);
  if (s === -1) return null;
  const n = { ...r[s], ...e, updatedAt: new Date().toISOString(), updatedBy: a?.uid || null };
  return ((r[s] = n), C(r), n);
}
async function E() {
  if (w)
    try {
      return await H();
    } catch (t) {
      return (
        t?.code === 'failed-precondition'
          ? I ||
            (console.warn('Cloud bookings richiedono un indice: uso dati locali (fallback).'),
            (I = !0))
          : console.warn('Errore caricamento pubbliche da cloud, fallback a localStorage:', t),
        O()
      );
    }
  return O();
}
function O() {
  return y()
    .filter((e) => e.status === B.CONFIRMED)
    .map((e) => ({
      id: e.id,
      courtId: e.courtId,
      courtName: e.courtName,
      date: e.date,
      time: e.time,
      duration: e.duration,
      status: e.status,
    }));
}
async function z(t) {
  try {
    T(!!t?.uid, t);
    const e = await E();
    if (t && t.uid)
      try {
        const { loadActiveUserBookings: a } = await _(
            async () => {
              const { loadActiveUserBookings: s } = await import(
                './cloud-bookings-mfcs8s2v-TfWv83d2.js'
              );
              return { loadActiveUserBookings: s };
            },
            __vite__mapDeps([0, 1, 2, 3, 4, 5])
          ),
          r = await a(t.uid);
      } catch (a) {
        console.warn('initializeBookingSystem: Cloud user data failed:', a);
      }
    return (await x(), !0);
  } catch (e) {
    return (console.error('initializeBookingSystem: Failed:', e), !1);
  }
}
async function x() {
  try {
    let t = [];
    try {
      t = [...(await E())];
    } catch (e) {
      console.warn('syncAllBookings: Failed to load public bookings:', e);
    }
    try {
      const e = await y(),
        a = new Map();
      (t.forEach((r) => {
        const s = r.id || `${r.date}-${r.time}-${r.courtId}`;
        a.set(s, r);
      }),
        e.forEach((r) => {
          const s = r.id || `${r.date}-${r.time}-${r.courtId}`;
          a.has(s) || a.set(s, r);
        }),
        (t = Array.from(a.values())),
        await C(t));
    } catch (e) {
      console.warn('syncAllBookings: Failed to sync local storage:', e);
    }
    return t;
  } catch (t) {
    return (console.error('syncAllBookings: Complete failure:', t), []);
  }
}
async function J(t, e = !1) {
  if (!t) return [];
  try {
    e ? await z(t) : await x();
    let a = [];
    if (w && t.uid)
      try {
        const { loadActiveUserBookings: n } = await _(
            async () => {
              const { loadActiveUserBookings: u } = await import(
                './cloud-bookings-mfcs8s2v-TfWv83d2.js'
              );
              return { loadActiveUserBookings: u };
            },
            __vite__mapDeps([0, 1, 2, 3, 4, 5])
          ),
          o = await n(t.uid);
        o && o.length > 0 && (a = o);
      } catch (n) {
        console.warn('Cloud user bookings not available:', n);
      }
    try {
      const o = (await b()).filter(
        (u) => u.userEmail === t.email || u.email === t.email || u.userId === t.uid
      );
      if (a.length > 0 && o.length > 0) {
        const u = new Map();
        (a.forEach((l) => {
          u.set(l.id || `${l.date}-${l.time}-${l.courtId}`, l);
        }),
          o.forEach((l) => {
            const m = l.id || `${l.date}-${l.time}-${l.courtId}`;
            u.has(m) || u.set(m, l);
          }),
          (a = Array.from(u.values())));
      } else o.length > 0 && (a = o);
    } catch (n) {
      console.warn('localStorage user bookings not available:', n);
    }
    const r = new Date(),
      s = a.filter((n) => new Date(`${n.date}T${n.time}:00`) > r);
    return (
      s.sort((n, o) => {
        const u = new Date(`${n.date}T${n.time}:00`),
          l = new Date(`${o.date}T${o.time}:00`);
        return u - l;
      }),
      s
    );
  } catch (a) {
    return (console.error('Error loading user bookings:', a), []);
  }
}
const W = Object.freeze(
  Object.defineProperty(
    {
      __proto__: null,
      BOOKING_CONFIG: F,
      BOOKING_STATUS: B,
      createBooking: K,
      generateBookingId: N,
      getPublicBookings: E,
      getUserBookings: J,
      initializeBookingSystem: z,
      isSlotAvailable: j,
      isTimeSlotTrapped: G,
      loadBookings: b,
      setCloudMode: T,
      syncAllBookings: x,
      updateBooking: V,
      wouldCreateHalfHourHole: U,
    },
    Symbol.toStringTag,
    { value: 'Module' }
  )
);
export { Q as B, G as a, F as b, K as c, W as d, j as i, T as s, V as u, U as w };
