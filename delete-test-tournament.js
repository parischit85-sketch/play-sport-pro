/**
 * Script per eliminare il torneo demo
 */

import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';

// Carica le variabili d'ambiente dal file .env
config();

// Configurazione Firebase
const firebaseConfig = {
  apiKey: globalThis.process?.env?.VITE_FIREBASE_API_KEY,
  authDomain: globalThis.process?.env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: globalThis.process?.env?.VITE_FIREBASE_PROJECT_ID,
  appId: globalThis.process?.env?.VITE_FIREBASE_APP_ID,
  storageBucket: globalThis.process?.env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: globalThis.process?.env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: globalThis.process?.env?.VITE_FIREBASE_MEASUREMENT_ID,
};

// Verifica configurazione
const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingConfig = requiredConfig.filter(key => !firebaseConfig[key]);

if (missingConfig.length > 0) {
  throw new Error(`Missing Firebase configuration: ${missingConfig.join(', ')}`);
}

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteTestTournament() {
  try {
    const clubId = 'cLUtbWq5YLw5fQrUEj4B';
    const tournamentId = 'test-tournament-public-view';

    console.log(`🗑️  Eliminazione torneo demo: test-tournament-public-view`);
    console.log(`   Club: Dorado Padel Center (${clubId})`);

    const tournamentRef = doc(db, 'clubs', clubId, 'tournaments', tournamentId);
    await deleteDoc(tournamentRef);

    console.log(`✅ Torneo demo eliminato con successo!`);

  } catch (error) {
    console.error('❌ Errore durante l\'eliminazione del torneo:', error);
  }
}

// Esegui l'eliminazione
deleteTestTournament();