import {
  r as l,
  x as u,
  y as i,
  p as d,
  w as S,
  q as m,
  z as f,
  A as I,
  B,
  m as w,
  C as A,
} from './firebase-mfcrw3bo-BteSMG94.js';
import { q as a } from './index-mfcrw3bo-CoIG1RjF.js';
import './vendor-mfcrw3bo-D3F3s8fL.js';
import './router-mfcrw3bo-C59D-9ls.js';
const n = 'bookings';
async function v() {
  try {
    const r = l(d(a, n), i('status', '==', 'confirmed'), u('date', 'asc'), u('time', 'asc'));
    return (await m(r)).docs.map((t) => ({ id: t.id, ...t.data() }));
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
async function C(r) {
  try {
    const e = new Date().toISOString().split('T')[0],
      t = l(
        d(a, n),
        i('createdBy', '==', r),
        i('status', '==', 'confirmed'),
        i('date', '>=', e),
        u('date', 'asc'),
        u('time', 'asc')
      );
    return (await m(t)).docs.map((s) => ({ id: s.id, ...s.data() }));
  } catch (e) {
    return (
      e?.code !== 'permission-denied' &&
        e?.code !== 'failed-precondition' &&
        console.warn('Errore caricamento prenotazioni attive:', e),
      []
    );
  }
}
async function b(r) {
  try {
    const e = new Date().toISOString().split('T')[0],
      t = l(
        d(a, n),
        i('createdBy', '==', r),
        i('date', '<', e),
        u('date', 'desc'),
        u('time', 'desc')
      );
    return (await m(t)).docs.map((s) => ({ id: s.id, ...s.data() }));
  } catch (e) {
    return (
      e?.code !== 'permission-denied' &&
        e?.code !== 'failed-precondition' &&
        console.warn('Errore caricamento storico prenotazioni:', e),
      []
    );
  }
}
async function R(r, e) {
  try {
    const t = {
      courtId: r.courtId,
      courtName: r.courtName,
      date: r.date,
      time: r.time,
      duration: r.duration,
      lighting: r.lighting || !1,
      heating: r.heating || !1,
      price: r.price,
      bookedBy: e?.displayName || e?.email || 'Anonimo',
      userEmail: e?.email,
      userPhone: r.userPhone || '',
      players: r.players || [],
      notes: r.notes || '',
      status: 'confirmed',
      createdBy: e?.uid || null,
      createdAt: f(),
      updatedAt: f(),
    };
    return {
      id: (await I(d(a, n), t)).id,
      ...t,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (t) {
    throw (
      console.error('Errore creazione prenotazione:', t),
      new Error('Impossibile creare la prenotazione. Riprova più tardi.')
    );
  }
}
async function F(r, e, t) {
  try {
    const o = { ...e, updatedAt: f(), updatedBy: t?.uid || null };
    return (await B(w(a, n, r), o), { id: r, ...e, updatedAt: new Date().toISOString() });
  } catch (o) {
    throw (
      console.error('Errore aggiornamento prenotazione:', o),
      new Error('Impossibile aggiornare la prenotazione. Riprova più tardi.')
    );
  }
}
async function D(r, e) {
  try {
    return (
      await B(w(a, n, r), {
        status: 'cancelled',
        cancelledAt: f(),
        cancelledBy: e?.uid || null,
        updatedAt: f(),
      }),
      !0
    );
  } catch (t) {
    throw (
      console.error('Errore cancellazione prenotazione:', t),
      new Error('Impossibile cancellare la prenotazione. Riprova più tardi.')
    );
  }
}
async function $(r) {
  try {
    return (await A(w(a, n, r)), !0);
  } catch (e) {
    throw (
      console.error('Errore eliminazione prenotazione:', e),
      new Error('Impossibile eliminare la prenotazione. Riprova più tardi.')
    );
  }
}
function x(r) {
  const e = l(d(a, n), i('status', '==', 'confirmed'), u('date', 'asc'), u('time', 'asc'));
  return S(
    e,
    (t) => {
      const o = t.docs.map((s) => ({ id: s.id, ...s.data() }));
      r(o);
    },
    (t) => {
      console.error('Errore sottoscrizione prenotazioni:', t);
    }
  );
}
async function L({ userId: r, email: e, name: t }) {
  try {
    const o = [];
    if (
      (r && o.push(m(l(d(a, n), i('createdBy', '==', r)))),
      e && o.push(m(l(d(a, n), i('userEmail', '==', e)))),
      t &&
        (o.push(m(l(d(a, n), i('bookedBy', '==', t)))),
        o.push(m(l(d(a, n), i('players', 'array-contains', t))))),
      o.length === 0)
    )
      return [];
    const s = await Promise.allSettled(o),
      h = new Map();
    for (const p of s)
      p.status === 'fulfilled' &&
        p.value.docs.forEach((c) => {
          const y = { id: c.id, ...c.data() };
          h.set(c.id, y);
        });
    const g = (p) => {
      const c = p.date || '',
        y = (p.time || '').split('-')[0].trim(),
        E = y ? `${c}T${y}:00` : `${c}T00:00:00`,
        z = new Date(E);
      return isNaN(z.getTime()) ? new Date(c) : z;
    };
    return Array.from(h.values()).sort((p, c) => g(p) - g(c));
  } catch (o) {
    return (console.warn('Errore caricamento prenotazioni per giocatore:', o), []);
  }
}
async function V() {
  return (await v())
    .filter((e) => e.status === 'confirmed')
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
export {
  D as cancelCloudBooking,
  R as createCloudBooking,
  $ as deleteCloudBooking,
  V as getPublicBookings,
  C as loadActiveUserBookings,
  b as loadBookingHistory,
  L as loadBookingsForPlayer,
  v as loadPublicBookings,
  x as subscribeToPublicBookings,
  F as updateCloudBooking,
};
