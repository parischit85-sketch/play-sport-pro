// src/cloud.js

import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

// Config from Vite env (so we can switch projects without code changes)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Inizializza una sola volta
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------- API usate da App.jsx ----------
export async function loadLeague(leagueId) {
  try {
    const ref = doc(db, 'leagues', leagueId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    // Gestisci errori specifici di Firebase
    if (e?.code === 'permission-denied') {
      console.warn('Firebase: Permessi insufficienti per leggere la lega. Verifica autenticazione e regole Firestore.');
    } else if (e?.code === 'unavailable') {
      console.warn('Firebase: Servizio non disponibile.');
    } else {
      console.warn('loadLeague error:', e);
    }
    return null;
  }
}

export async function saveLeague(leagueId, state) {
  try {
    const ref = doc(db, 'leagues', leagueId);
    await setDoc(ref, state, { merge: true });
  } catch (e) {
    console.warn('saveLeague error:', e);
  }
}

export function subscribeLeague(leagueId, callback) {
  // 🔔 realtime: chiama callback con lo stato (o null se il doc non esiste)
  const ref = doc(db, 'leagues', leagueId);
  return onSnapshot(
    ref,
    (snap) => callback(snap.exists() ? snap.data() : null),
    (err) => {
      if (err?.code === 'permission-denied') {
        console.warn('Firebase: Permessi insufficienti per sottoscrivere la lega. Fallback a modalità offline.');
      } else {
        console.warn('subscribeLeague error:', err);
      }
      // In caso di errore, passa null per fallback graceful
      callback(null);
    }
  );
}

// ---------- diagnostica usata in Extra ----------
export async function testWritePing() {
  try {
    await setDoc(doc(db, 'diagnostics', 'ping'), { t: Date.now() }, { merge: true });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}

export async function testReadPing() {
  try {
    const snap = await getDoc(doc(db, 'diagnostics', 'ping'));
    return { ok: snap.exists(), data: snap.data() || null };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}
