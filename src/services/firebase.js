// =============================================
// FILE: src/services/firebase.js
// =============================================
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // opzionali, se presenti nel .env
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Nota: il debug viene eseguito dopo l'inizializzazione di auth (più sotto)

// Verifica che la configurazione sia presente
const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingConfig = requiredConfig.filter((key) => !firebaseConfig[key]);

if (missingConfig.length > 0) {
  throw new Error(`Missing Firebase configuration: ${missingConfig.join(', ')}`);
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Use auto-detected long polling to avoid QUIC/HTTP3 issues on some networks
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  experimentalForceLongPolling: import.meta.env.VITE_FIRESTORE_FORCE_LONG_POLLING === 'true',
  useFetchStreams: false,
});
const auth = getAuth(app);
const storage = getStorage(app);

// Imposta la lingua dell'interfaccia utente
if (auth.useDeviceLanguage) {
  auth.useDeviceLanguage();
}

// Solo in sviluppo: connetti agli emulatori se necessario
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
  } catch (error) {
    // Firebase emulators already connected or not available
  }
}

// Debug leggero (solo su richiesta): mostra info di progetto e auth con ?authdebug=1
try {
  if (typeof window !== 'undefined') {
    const usp = new URLSearchParams(window.location.search || '');
    if (usp.has('authdebug')) {
      // Non stampare apiKey; mostra solo info utili per verificare il progetto
      const info = {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
        appId: firebaseConfig.appId,
        emulator: import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true',
        isDev: import.meta.env.DEV === true,
        user: auth?.currentUser ? { uid: auth.currentUser.uid } : null,
      };

      console.log('[Firebase][authdebug]', info);
    }
  }
} catch {
  /* no-op */
}

export { app, db, auth, storage };
