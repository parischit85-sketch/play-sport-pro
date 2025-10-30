/**
 * Script per attivare un club impostando subscription.isActive = true
 */

import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

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

async function activateClub(clubId, clubName) {
  try {
    console.log(`🔄 Attivazione club: ${clubName} (${clubId})`);

    const clubRef = doc(db, 'clubs', clubId);

    // Attiva l'abbonamento del club
    await updateDoc(clubRef, {
      'subscription.isActive': true,
      'subscription.updatedAt': new Date()
    });

    console.log(`✅ Club ${clubName} attivato con successo!`);
    console.log(`   Ora subscription.isActive = true`);

  } catch (error) {
    console.error(`❌ Errore durante l'attivazione del club ${clubName}:`, error);
  }
}

// Attiva il club Dorado Padel Center (che è già approved e isActive = true)
activateClub('cLUtbWq5YLw5fQrUEj4B', 'Dorado Padel Center');