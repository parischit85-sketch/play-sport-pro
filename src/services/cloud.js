// =============================================
// FILE: src/services/cloud.js
// =============================================
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  getDocs,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Firestore with long-polling fallback to avoid QUIC errors
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  experimentalForceLongPolling: import.meta.env.VITE_FIRESTORE_FORCE_LONG_POLLING === 'true',
  useFetchStreams: false,
});

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

/**
 * @deprecated Sistema leagues/ OBSOLETO - usa getClubData() da club-data.js
 * Questa funzione è mantenuta solo per backward compatibility temporanea.
 * Il sistema è migrato alle subcollections clubs/{clubId}/...
 * 
 * @see src/services/club-data.js
 */
export async function loadLeague(leagueId) {
  console.warn('⚠️ loadLeague() è DEPRECATO - usa getClubData() da @services/club-data.js');
  console.warn('   Migrazione: loadLeague("default") → getClubData(clubId)');
  
  // Admin bypass - return mock data for admin session
  try {
    const adminUser = localStorage.getItem('admin-session');
    if (adminUser) {
      const parsed = JSON.parse(adminUser);
      if (parsed?.isSpecialAdmin) {
        console.log('🔑 Admin bypass: Returning mock league data');
        return {
          name: 'Admin Test League',
          players: [],
          matches: [],
          courts: [],
          bookings: [],
          bookingConfig: {},
          _createdAt: Date.now(),
          _updatedAt: Date.now(),
        };
      }
    }
  } catch (e) {
    // Ignore localStorage errors
  }

  // Return empty data structure instead of null for better compatibility
  const snap = await getDoc(doc(db, 'leagues', leagueId));
  if (snap.exists()) {
    return snap.data();
  }
  
  // Return empty structure to avoid null errors in legacy code
  return {
    players: [],
    matches: [],
    courts: [],
    bookings: [],
    bookingConfig: {},
    profiles: []
  };
}

/**
 * @deprecated Sistema leagues/ OBSOLETO
 * Questa funzione è mantenuta solo per backward compatibility temporanea.
 * Non salva più dati nel database - usa i servizi specifici del club.
 * 
 * @see src/services/club-data.js
 */
export async function listLeagues() {
  console.warn('⚠️ listLeagues() è DEPRECATO - il sistema leagues/ non è più utilizzato');
  
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
        courts: data.courts?.length || 0,
      });
    });
    return leagues.sort((a, b) => (b._updatedAt || 0) - (a._updatedAt || 0));
  } catch (error) {
    console.error('Errore nel recupero della lista backup:', error);
    return [];
  }
}

/**
 * @deprecated Sistema leagues/ OBSOLETO - Non salvare più in leagues/
 * Questa funzione è mantenuta solo per backward compatibility temporanea.
 * Registra un warning e NON salva più dati nel database.
 * 
 * @see src/services/club-data.js per il nuovo sistema
 */
export async function saveLeague(leagueId, data) {
  console.warn('⚠️ saveLeague() è DEPRECATO - NON salva più dati nel database');
  console.warn('   Il sistema è migrato alle subcollections clubs/{clubId}/...');
  console.warn('   Usa i servizi specifici del club per salvare dati');
  
  // Non salvare più nulla - solo log per debug
  console.log('� Tentativo di salvataggio in leagues/ bloccato:', {
    leagueId,
    players: data?.players?.length || 0,
    matches: data?.matches?.length || 0,
    courts: data?.courts?.length || 0,
    bookings: data?.bookings?.length || 0
  });
  
  // Return silently - non lanciare errori per non rompere codice legacy
  return;
}

/**
 * @deprecated Sistema leagues/ OBSOLETO - Nessuna subscription real-time
 * Questa funzione è mantenuta solo per backward compatibility temporanea.
 * Ritorna una funzione no-op unsubscribe.
 * 
 * @see src/services/club-data.js per il nuovo sistema
 */
export function subscribeLeague(leagueId, cb) {
  console.warn('⚠️ subscribeLeague() è DEPRECATO - nessuna subscription real-time attiva');
  console.warn('   Il sistema è migrato alle subcollections clubs/{clubId}/...');
  
  // Return a no-op unsubscribe function
  return () => {
    console.log('🚫 No-op unsubscribe - subscribeLeague deprecato');
  };
}
