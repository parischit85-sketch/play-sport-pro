import {
  q as N,
  r as y,
  p as E,
  x as k,
  y as L,
  f as J,
  h as Q,
  z as Z,
  A as w,
  B as tt,
  o as et,
  C as ot,
  w as nt,
} from './firebase-mfgp9duf-X_I_guKF.js';
import { v as p } from './index-mfgp9duf-gdVB5EnT.js';
const I = 'unified-bookings',
  m = { BOOKINGS: 'bookings' },
  u = { CONFIRMED: 'confirmed', CANCELLED: 'cancelled', PENDING: 'pending' },
  $ = { COURT: 'court', LESSON: 'lesson' };
let B = !1,
  h = new Map(),
  x = new Map();
const D = 'unified-bookings-migration-done-v1';
let R = !1,
  T = !1,
  M = null;
const A = new Map();
function v(t, e) {
  (A.get(t) || []).forEach((s) => s(e));
}
function st(t, e) {
  return (
    A.has(t) || A.set(t, []),
    A.get(t).push(e),
    () => {
      const o = A.get(t) || [],
        s = o.indexOf(e);
      s > -1 && o.splice(s, 1);
    }
  );
}
function it(t = {}) {
  R ||
    ((R = !0),
    (B = t.cloudEnabled || !1),
    t.user,
    B &&
      (rt(),
      localStorage.getItem(D)
        ? F(300)
        : ((T = !0),
          V()
            .catch((e) => console.warn('Migration failed:', e))
            .finally(() => {
              (localStorage.setItem(D, '1'), (T = !1), F(300));
            }))),
    (R = !0));
}
function rt() {
  if (!x.has('public'))
    try {
      const t = y(
          E(p, m.BOOKINGS),
          k('status', '!=', 'cancelled'),
          L('status'),
          L('date', 'asc'),
          L('time', 'asc')
        ),
        e = nt(t, (o) => {
          const s = o.docs.map((i) => {
            const n = i.data() || {},
              a = n.id && n.id !== i.id ? n.id : void 0,
              { id: r, ...l } = n;
            return {
              ...l,
              id: i.id,
              legacyId: a,
              createdAt: n.createdAt?.toDate?.()?.toISOString() || n.createdAt,
              updatedAt: n.updatedAt?.toDate?.()?.toISOString() || n.updatedAt,
            };
          });
          (h.set('public', s), v('bookingsUpdated', { type: 'public', bookings: s }));
        });
      x.set('public', e);
    } catch {}
}
async function at(t, e, o = {}) {
  t.time && (t.time = X(t.time));
  const s = await G({ forceRefresh: !0 });
  (console.log('🔍 Validating booking against', s.length, 'existing bookings'),
    console.log('📋 New booking data:', {
      type: t.type,
      courtId: t.courtId,
      date: t.date,
      time: t.time,
      duration: t.duration,
      color: t.color,
    }));
  const i = Y(t, s);
  if (i.length > 0) {
    const r = new Error(`Validazione fallita: ${i.join(', ')}`);
    throw ((r.validationErrors = i), r);
  }
  const n = {
    id: o.id || mt(),
    type: t.type || $.COURT,
    courtId: t.courtId,
    courtName: t.courtName,
    date: t.date,
    time: t.time,
    duration: t.duration || 60,
    lighting: t.lighting || !1,
    heating: t.heating || !1,
    price: t.price || 0,
    bookedBy: e?.displayName || e?.email || 'Anonimo',
    userEmail: e?.email,
    userPhone: t.userPhone || '',
    players: t.players || [],
    notes: t.notes || '',
    color: t.color || null,
    instructorId: t.instructorId,
    instructorName: t.instructorName,
    lessonType: t.lessonType,
    isLessonBooking: t.isLessonBooking || !1,
    courtBookingId: t.courtBookingId,
    status: u.CONFIRMED,
    createdBy: e?.uid || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  console.log('🎨 Final booking object:', { id: n.id, color: n.color, allFields: Object.keys(n) });
  let a;
  if (B && e)
    try {
      a = await ut(n);
    } catch {
      a = K(n);
    }
  else a = K(n);
  return (v('bookingCreated', a), a);
}
async function z(t, e, o) {
  e.time && (e.time = X(e.time));
  const s = { ...e, updatedAt: new Date().toISOString(), updatedBy: o?.uid || null };
  let i;
  if (B && o)
    try {
      i = await ft(t, s);
    } catch (n) {
      (n.code === 'not-found' ||
        n.message.includes('No document to update') ||
        n.message.includes('Document does not exist'),
        (i = H(t, s)));
    }
  else i = H(t, s);
  return (i && v('bookingUpdated', { id: t, booking: i }), i);
}
async function ct(t, e) {
  return z(
    t,
    { status: u.CANCELLED, cancelledAt: new Date().toISOString(), cancelledBy: e?.uid || null },
    e
  );
}
async function lt(t, e) {
  if (B && e)
    try {
      (await gt(t), F(400));
    } catch {
      P(t);
    }
  else P(t);
  v('bookingDeleted', { id: t });
}
async function G(t = {}) {
  const { forceRefresh: e = !1, includeLesson: o = !0 } = t;
  if (!e && h.has('public')) {
    let n = h.get('public');
    return (o || (n = n.filter((a) => !a.isLessonBooking)), n);
  }
  let s = [];
  if (B)
    try {
      s = await q();
    } catch {
      s = C();
    }
  else s = C();
  return (
    (s = s.filter((n) => n.status !== u.CANCELLED)),
    o || (s = s.filter((n) => !n.isLessonBooking)),
    h.set('public', s),
    s.slice(0, 3).forEach((n) => {
      n.color &&
        console.log('💰 CACHE SET - Color preserved:', {
          id: n.id,
          color: n.color,
          hasColor: !!n.color,
          allKeys: Object.keys(n),
        });
    }),
    s
  );
}
async function _(t, e = {}) {
  if (!t) return [];
  const { includeHistory: o = !1, includeCancelled: s = !1, lessonOnly: i = !1 } = e;
  let a = (await G({ forceRefresh: !0 })).filter(
    (r) => r.userEmail === t.email || r.createdBy === t.uid
  );
  if (
    (i && (a = a.filter((r) => r.isLessonBooking)),
    s || (a = a.filter((r) => r.status !== u.CANCELLED)),
    !o)
  ) {
    const r = new Date().toISOString().split('T')[0];
    a = a.filter((l) => l.date >= r);
  }
  return a.sort((r, l) =>
    r.date !== l.date ? r.date.localeCompare(l.date) : r.time.localeCompare(l.time)
  );
}
async function dt(t = null) {
  return t ? _(t, { lessonOnly: !0 }) : (await G()).filter((o) => o.isLessonBooking);
}
async function ut(t) {
  const { id: e, ...o } = t,
    s = W({ ...o, legacyId: e, createdAt: w(), updatedAt: w() }),
    i = await ot(E(p, m.BOOKINGS), s);
  return {
    ...o,
    id: i.id,
    legacyId: e,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
async function ft(t, e) {
  const o = J(p, m.BOOKINGS, t);
  try {
    const n = W({ ...e, updatedAt: w() });
    await tt(o, n);
  } catch (n) {
    if (n.code === 'not-found') {
      const r = C().find((l) => l.id === t);
      if (r) await et(o, { ...r, ...e, createdAt: r.createdAt || w(), updatedAt: w() });
      else throw n;
    } else throw n;
  }
  const i = C().find((n) => n.id === t);
  return i ? { ...i, ...e } : null;
}
async function gt(t) {
  const e = J(p, m.BOOKINGS, t);
  try {
    if (!(await Q(e)).exists()) return;
  } catch {}
  await Z(e);
}
async function q() {
  const t = y(E(p, m.BOOKINGS), L('date', 'asc'), L('time', 'asc'));
  return (await N(t)).docs
    .map((i) => {
      const n = i.data() || {},
        a = n.id && n.id !== i.id ? n.id : n.legacyId,
        { id: r, ...l } = n;
      return {
        ...l,
        id: i.id,
        legacyId: a,
        createdAt: n.createdAt?.toDate?.()?.toISOString() || n.createdAt,
        updatedAt: n.updatedAt?.toDate?.()?.toISOString() || n.updatedAt,
      };
    })
    .filter((i) => (i.status || u.CONFIRMED) !== u.CANCELLED);
}
function K(t) {
  const e = C();
  return (e.push(t), U(e), t);
}
function H(t, e) {
  const o = C(),
    s = o.findIndex((n) => n.id === t);
  if (s === -1) return null;
  const i = { ...o[s], ...e };
  return ((o[s] = i), U(o), i);
}
function P(t) {
  const e = localStorage.getItem(I),
    s = (e ? JSON.parse(e) : []).filter((i) => i.id !== t);
  (localStorage.setItem(I, JSON.stringify(s)),
    localStorage.setItem('ml-field-bookings', JSON.stringify(s)),
    h.clear());
}
function C() {
  try {
    const t = localStorage.getItem(I);
    return (t ? JSON.parse(t) : []).filter((s) => {
      const n = (s.status || u.CONFIRMED) !== u.CANCELLED;
      return n;
    });
  } catch (t) {
    return (console.error('Error loading bookings from localStorage:', t), []);
  }
}
async function j() {
  if (!(!B || T))
    try {
      const e = (await q()).filter((o) => (o.status || u.CONFIRMED) !== u.CANCELLED);
      localStorage.setItem(I, JSON.stringify(e));
    } catch {}
}
function F(t = 500) {
  B &&
    (M && clearTimeout(M),
    (M = setTimeout(() => {
      j();
    }, t)));
}
function U(t) {
  try {
    const e = t.filter((o) => (o.status || u.CONFIRMED) !== u.CANCELLED);
    (localStorage.setItem(I, JSON.stringify(e)),
      localStorage.setItem('ml-field-bookings', JSON.stringify(e)),
      h.clear());
  } catch (e) {
    console.error('Error saving bookings to localStorage:', e);
  }
}
async function V() {
  if (localStorage.getItem(D)) return;
  const t = [];
  try {
    const e = localStorage.getItem('ml-field-bookings');
    if (e) {
      const o = JSON.parse(e);
      t.push(...o.map((s) => ({ ...s, type: $.COURT })));
    }
  } catch {}
  try {
    const e = localStorage.getItem('lessonBookings') || localStorage.getItem('lesson-bookings');
    if (e) {
      const o = JSON.parse(e);
      t.push(...o.map((s) => ({ ...s, type: $.LESSON, isLessonBooking: !0 })));
    }
  } catch {}
  if (t.length > 0) {
    const e = t.reduce((o, s) => {
      const i = s.status || u.CONFIRMED;
      return (!o.some((n) => n.id === s.id) && i !== u.CANCELLED && o.push(s), o);
    }, []);
    (U(e), localStorage.removeItem('lessonBookings'), localStorage.removeItem('lesson-bookings'));
  }
}
function pt() {
  (localStorage.removeItem(I),
    localStorage.removeItem('ml-field-bookings'),
    localStorage.removeItem('lessonBookings'),
    localStorage.removeItem('lesson-bookings'),
    h.clear(),
    v('dataCleared'));
}
function mt() {
  return `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
function W(t) {
  const e = {};
  for (const [o, s] of Object.entries(t)) s != null && (e[o] = s);
  return e;
}
const St = { BOOKING_STATUS: u, BOOKING_TYPES: $ };
function Y(t, e = []) {
  const o = [];
  (t.courtId || o.push('Campo richiesto'),
    t.date || o.push('Data richiesta'),
    t.time || o.push('Ora richiesta'),
    (!t.duration || t.duration < 30) && o.push('Durata minima 30 minuti'));
  const s = e.filter((i) => {
    const n = i.id === t.id,
      a = i.courtId === t.courtId,
      r = i.date === t.date,
      d = (i.status || u.CONFIRMED) === u.CONFIRMED,
      c = Bt(i.time, i.duration, t.time, t.duration);
    return !n && a && r && d && c;
  });
  return (
    console.log('🚨 CONFLICTS FOUND:', s.length, s),
    s.length > 0 &&
      (t.type === 'lesson'
        ? (o.push("Orario già occupato da un'altra prenotazione"),
          console.log('🚫 Lesson conflicts with existing bookings:', s))
        : (o.push('Orario già occupato'), console.log('🚫 Court conflict found:', s))),
    console.log('✅ VALIDATION RESULT:', o),
    o
  );
}
function Bt(t, e, o, s) {
  const i = g(t),
    n = i + e,
    a = g(o),
    r = a + s;
  return i < r && a < n;
}
function g(t) {
  const [e, o] = t.split(':').map(Number);
  return e * 60 + o;
}
function X(t) {
  if (!t) return t;
  const e = String(t)
    .trim()
    .match(/^(\d{1,2}):(\d{2})/);
  if (!e) return t;
  const o = String(Math.min(23, parseInt(e[1], 10))).padStart(2, '0'),
    s = String(Math.min(59, parseInt(e[2], 10))).padStart(2, '0');
  return `${o}:${s}`;
}
function ht(t, e, o, s, i) {
  return !1;
}
function yt(t, e, o, s, i) {
  (console.log(`🔍 [HOLE DEBUG] Checking ${t} on ${e} at ${o} for ${s}min`),
    console.log('🔍 [HOLE DEBUG] Existing bookings count:', i.length));
  const n = g(o),
    a = n + s,
    r = i
      .filter((c) => c.courtId === t && c.date === e && (c.status || u.CONFIRMED) !== u.CANCELLED)
      .sort((c, f) => g(c.time) - g(f.time));
  console.log(
    `🔍 [HOLE DEBUG] Court ${t} bookings for ${e}:`,
    r.map((c) => `${c.time}(${c.duration}min)`)
  );
  const l = r.find((c) => g(c.time) > a);
  if (l) {
    const c = g(l.time),
      f = c - a;
    if (
      (console.log(
        `🔍 [HOLE DEBUG] Gap AFTER: ${f}min (${o} ends at ${Math.floor(a / 60)}:${String(a % 60).padStart(2, '0')}, next booking at ${l.time})`
      ),
      f > 0 && f <= 30)
    ) {
      console.log(`⚠️ [HOLE DEBUG] Found problematic gap AFTER: ${f}min`);
      const S = r.filter((O) => g(O.time) + O.duration <= n).pop();
      if (S) {
        const O = g(S.time) + S.duration;
        if (c - O === 120)
          return (
            console.log(`✅ [120MIN EXEMPTION] ${t} ${o}: 120min trapped slot allows ${f}min hole`),
            !1
          );
      }
      return (
        console.log(`🚫 [HOLE BLOCKED] ${t} ${o}: Would create ${f}min hole AFTER booking`),
        !0
      );
    }
  }
  const d = r.filter((c) => g(c.time) + c.duration <= n).pop();
  if (d) {
    const c = g(d.time) + d.duration,
      f = n - c;
    if (
      (console.log(
        `🔍 [HOLE DEBUG] Gap BEFORE: ${f}min (previous ends at ${Math.floor(c / 60)}:${String(c % 60).padStart(2, '0')}, our booking starts at ${o})`
      ),
      f > 0 && f <= 30)
    ) {
      console.log(`⚠️ [HOLE DEBUG] Found problematic gap BEFORE: ${f}min`);
      const S = r.find((O) => g(O.time) >= a);
      return S && g(S.time) - c === 120
        ? (console.log(`✅ [120MIN EXEMPTION] ${t} ${o}: 120min trapped slot allows ${f}min hole`),
          !1)
        : (console.log(`🚫 [HOLE BLOCKED] ${t} ${o}: Would create ${f}min hole BEFORE booking`),
          !0);
    }
  }
  return !1;
}
const It = {
  initialize: it,
  createBooking: at,
  updateBooking: z,
  cancelBooking: ct,
  deleteBooking: lt,
  getPublicBookings: G,
  getUserBookings: _,
  getLessonBookings: dt,
  migrateOldData: V,
  clearAllData: pt,
  addEventListener: st,
  validateBooking: Y,
  syncLocalWithCloud: j,
  CONSTANTS: St,
};
async function Ct({ userId: t, email: e, name: o }) {
  if (!t && !e && !o) return [];
  if (!isCloudEnabled)
    return loadFromLocalStorage().filter((i) => {
      if (!i) return !1;
      if ((t && i.createdBy === t) || (e && i.userEmail === e)) return !0;
      if (o) {
        if (i.bookedBy === o) return !0;
        if (Array.isArray(i.players))
          return i.players.some((n) => (typeof n == 'string' ? n : n?.name) === o);
      }
      return !1;
    });
  try {
    const s = [];
    (t && s.push(N(y(E(p, m.BOOKINGS), k('createdBy', '==', t)))),
      e && s.push(N(y(E(p, m.BOOKINGS), k('userEmail', '==', e)))),
      o &&
        (s.push(N(y(E(p, m.BOOKINGS), k('bookedBy', '==', o)))),
        s.push(N(y(E(p, m.BOOKINGS), k('players', 'array-contains', o))))));
    const i = await Promise.allSettled(s),
      n = new Map();
    for (const r of i)
      r.status === 'fulfilled' &&
        r.value.docs.forEach((l) => {
          const d = l.data() || {},
            c = d.id && d.id !== l.id ? d.id : d.legacyId,
            { id: f, ...S } = d;
          n.set(l.id, {
            ...S,
            id: l.id,
            legacyId: c,
            createdAt: d.createdAt?.toDate?.()?.toISOString() || d.createdAt,
            updatedAt: d.updatedAt?.toDate?.()?.toISOString() || d.updatedAt,
          });
        });
    const a = Array.from(n.values());
    return (
      a.sort((r, l) => {
        const d = (r.date || '').localeCompare(l.date || '');
        return d !== 0 ? d : (r.time || '').localeCompare(l.time || '');
      }),
      a
    );
  } catch (s) {
    return (console.warn('Error searching bookings for player:', s), []);
  }
}
export { It as U, ht as i, Ct as s, yt as w };
