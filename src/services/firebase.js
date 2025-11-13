// =============================================
// FILE: src/services/firebase.js
// =============================================
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

const isTest =
  (typeof globalThis !== 'undefined' &&
    globalThis.process &&
    globalThis.process.env &&
    globalThis.process.env.NODE_ENV === 'test') ||
  (typeof globalThis !== 'undefined' && (globalThis.__vitest_worker__ || globalThis.vi));
const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || (isTest ? 'test-key' : undefined),
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || (isTest ? 'test-auth' : undefined),
  projectId: env.VITE_FIREBASE_PROJECT_ID || (isTest ? 'test-project' : undefined),
  appId: env.VITE_FIREBASE_APP_ID || (isTest ? 'test-app' : undefined),
  databaseURL: env.VITE_FIREBASE_DATABASE_URL || (isTest ? 'http://localhost:9000' : undefined),
  // opzionali, se presenti nel .env
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || (isTest ? 'test-bucket' : undefined),
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || (isTest ? 'test-sender' : undefined),
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || (isTest ? 'G-TEST' : undefined),
};

// Nota: il debug viene eseguito dopo l'inizializzazione di auth (più sotto)

// Verifica che la configurazione sia presente
const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingConfig = requiredConfig.filter((key) => !firebaseConfig[key]);

if (!isTest && missingConfig.length > 0) {
  throw new Error(`Missing Firebase configuration: ${missingConfig.join(', ')}`);
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Use auto-detected long polling to avoid QUIC/HTTP3 issues on some networks
// Keep it simple and compatible with test mocks
let db;
try {
  // Use specific Firestore database if specified in env (e.g., for restored backups)
  const databaseId = env.VITE_FIRESTORE_DATABASE_ID;
  
  if (databaseId && databaseId !== '(default)') {
    // Initialize with specific database ID for restored backups
    db = initializeFirestore(app, { databaseId });
  } else {
    // Use default database
    db = getFirestore(app);
  }
} catch (error) {
  // If already initialized or in test mode, try to get existing instance
  try {
    db = getFirestore(app);
  } catch {
    // In isolated test mocks, provide a harmless stub
    db = {};
  }
}
const auth = getAuth(app);
const storage = getStorage(app);

// Initialize Realtime Database
let rtdb;
try {
  rtdb = getDatabase(app);
} catch {
  // In isolated test mocks, provide a harmless stub
  rtdb = {};
}

// Imposta la lingua dell'interfaccia utente
if (auth.useDeviceLanguage) {
  auth.useDeviceLanguage();
}

// Solo in sviluppo: connetti agli emulatori se necessario (guard import.meta)
const isDev = !!(typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV);
const useEmu =
  typeof import.meta !== 'undefined' &&
  import.meta.env &&
  import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
if (isDev && useEmu) {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    connectDatabaseEmulator(rtdb, '127.0.0.1', 9000);
  } catch {
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
        emulator: useEmu,
        isDev,
        user: auth?.currentUser ? { uid: auth.currentUser.uid } : null,
      };

      console.log('[Firebase][authdebug]', info);
    }
  }
} catch {
  /* no-op */
}

export { app, db, auth, storage, rtdb };
