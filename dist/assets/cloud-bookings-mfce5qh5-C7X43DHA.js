import {
  q as u,
  v as p,
  r as c,
  w as a,
  x as m,
  y as B,
  m as z,
  z as f,
  A as S,
} from './firebase-mfce5qh5-jcIpuiEY.js';
import { p as n } from './index-mfce5qh5-Bjue6Tcf.js';
import './vendor-mfce5qh5-D3F3s8fL.js';
import './router-mfce5qh5-SMEpEpls.js';
const i = 'bookings';
async function I() {
  try {
    const t = p(c(n, i), a('status', '==', 'confirmed'), m('date', 'asc'), m('time', 'asc'));
    return (await u(t)).docs.map((r) => ({ id: r.id, ...r.data() }));
  } catch (t) {
    throw (
      t?.code === 'permission-denied'
        ? console.warn(
            "Firebase: Permessi insufficienti per leggere le prenotazioni. Verifica le regole Firestore e l'autenticazione."
          )
        : t?.code === 'failed-precondition'
          ? console.warn('Firebase: Indici mancanti o configurazione incompleta.')
          : t?.code === 'unavailable'
            ? console.warn('Firebase: Servizio non disponibile. Verifica la connessione.')
            : console.warn('Errore caricamento prenotazioni pubbliche (cloud):', t),
      t
    );
  }
}
async function T(t) {
  try {
    const e = new Date().toISOString().split('T')[0],
      r = p(
        c(n, i),
        a('createdBy', '==', t),
        a('status', '==', 'confirmed'),
        a('date', '>=', e),
        m('date', 'asc'),
        m('time', 'asc')
      );
    return (await u(r)).docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return (
      e?.code !== 'permission-denied' &&
        e?.code !== 'failed-precondition' &&
        console.warn('Errore caricamento prenotazioni attive:', e),
      []
    );
  }
}
async function q(t) {
  try {
    const e = new Date().toISOString().split('T')[0],
      r = p(
        c(n, i),
        a('createdBy', '==', t),
        a('date', '<', e),
        m('date', 'desc'),
        m('time', 'desc')
      );
    return (await u(r)).docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return (
      e?.code !== 'permission-denied' &&
        e?.code !== 'failed-precondition' &&
        console.warn('Errore caricamento storico prenotazioni:', e),
      []
    );
  }
}
async function C(t, e) {
  try {
    const r = {
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
      status: 'confirmed',
      createdBy: e?.uid || null,
      createdAt: f(),
      updatedAt: f(),
    };
    return {
      id: (await S(c(n, i), r)).id,
      ...r,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (r) {
    throw (
      console.error('Errore creazione prenotazione:', r),
      new Error('Impossibile creare la prenotazione. Riprova più tardi.')
    );
  }
}
async function F(t, e, r) {
  try {
    const o = { ...e, updatedAt: f(), updatedBy: r?.uid || null };
    return (await B(z(n, i, t), o), { id: t, ...e, updatedAt: new Date().toISOString() });
  } catch (o) {
    throw (
      console.error('Errore aggiornamento prenotazione:', o),
      new Error('Impossibile aggiornare la prenotazione. Riprova più tardi.')
    );
  }
}
async function R(t, e) {
  try {
    return (
      await B(z(n, i, t), {
        status: 'cancelled',
        cancelledAt: f(),
        cancelledBy: e?.uid || null,
        updatedAt: f(),
      }),
      !0
    );
  } catch (r) {
    throw (
      console.error('Errore cancellazione prenotazione:', r),
      new Error('Impossibile cancellare la prenotazione. Riprova più tardi.')
    );
  }
}
async function $({ userId: t, email: e, name: r }) {
  try {
    const o = [];
    if (
      (t && o.push(u(p(c(n, i), a('createdBy', '==', t)))),
      e && o.push(u(p(c(n, i), a('userEmail', '==', e)))),
      r &&
        (o.push(u(p(c(n, i), a('bookedBy', '==', r)))),
        o.push(u(p(c(n, i), a('players', 'array-contains', r))))),
      o.length === 0)
    )
      return [];
    const d = await Promise.allSettled(o),
      w = new Map();
    for (const l of d)
      l.status === 'fulfilled' &&
        l.value.docs.forEach((s) => {
          const y = { id: s.id, ...s.data() };
          w.set(s.id, y);
        });
    const h = (l) => {
      const s = l.date || '',
        y = (l.time || '').split('-')[0].trim(),
        E = y ? `${s}T${y}:00` : `${s}T00:00:00`,
        g = new Date(E);
      return isNaN(g.getTime()) ? new Date(s) : g;
    };
    return Array.from(w.values()).sort((l, s) => h(l) - h(s));
  } catch (o) {
    return (console.warn('Errore caricamento prenotazioni per giocatore:', o), []);
  }
}
async function x() {
  return (await I()).map((e) => ({
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
  R as cancelCloudBooking,
  C as createCloudBooking,
  x as getPublicBookings,
  T as loadActiveUserBookings,
  q as loadBookingHistory,
  $ as loadBookingsForPlayer,
  I as loadPublicBookings,
  F as updateCloudBooking,
};
