// =============================================
// FILE: src/services/cloud.js
// =============================================
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

export async function loadLeague(leagueId) {
  const snap = await getDoc(doc(db, 'leagues', leagueId));
  return snap.exists() ? snap.data() : null;
}

export async function listLeagues() {
  try {
    const querySnapshot = await getDocs(collection(db, 'leagues'));
    const leagues = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      leagues.push({
        id: doc.id,
        name: data.name || doc.id,
        players: data.players?.length || 0,
        matches: data.matches?.length || 0,
        lastUpdated: data._updatedAt ? new Date(data._updatedAt).toLocaleString() : 'N/A',
        courts: data.courts?.length || 0
      });
    });
    return leagues.sort((a, b) => (b._updatedAt || 0) - (a._updatedAt || 0));
  } catch (error) {
    console.error('Errore nel recupero della lista backup:', error);
    return [];
  }
}

export async function saveLeague(leagueId, data) {
  // 🛡️ PROTEZIONE ANTI-SOVRASCRITTURA
  // Permetti ripristino manuale se ha flag _restored
  if (data._restored) {
    console.log('🔥 Ripristino manuale autorizzato - bypassando protezioni');
  } else if (data.players && data.players.length < 5) {
    console.warn('🚨 PROTEZIONE ATTIVA: Rifiutato salvataggio di dati con pochi giocatori (possibili seed data)');
    console.warn('Dati non salvati:', { players: data.players?.length, matches: data.matches?.length });
    return;
  }

  // Backup automatico prima di salvare
  try {
    const existing = await loadLeague(leagueId);
    if (existing && existing.players && existing.players.length > (data.players?.length || 0)) {
      const backupKey = `firebase-backup-${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify({
        timestamp: new Date().toISOString(),
        data: existing,
        reason: 'Auto-backup before potential data loss'
      }));
      console.log('🔒 Backup automatico creato prima del salvataggio:', backupKey);
    }
  } catch (e) {
    console.warn('Impossibile creare backup automatico:', e);
  }

  // merge per non sovrascrivere tutto
  await setDoc(doc(db, 'leagues', leagueId), data, { merge: true });
  console.log('✅ Dati salvati nel cloud:', { players: data.players?.length, matches: data.matches?.length });
}

export function subscribeLeague(leagueId, cb) {
  // ritorna l'unsubscribe usato già dal tuo App.jsx
  return onSnapshot(doc(db, 'leagues', leagueId), (snap) => {
    if (snap.exists()) cb(snap.data());
  });
}
