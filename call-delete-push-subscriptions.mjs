/**
 * Script per chiamare la Cloud Function deleteAllPushSubscriptions
 * Usa Firebase Functions SDK per chiamare la function deployata
 */

import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Config Firebase (dal tuo progetto)
const firebaseConfig = {
  apiKey: "AIzaSyDzHvNUbcY_l8x7Pzjv5e9mX_LrRz6KqVk",
  authDomain: "m-padelweb.firebaseapp.com",
  projectId: "m-padelweb",
  storageBucket: "m-padelweb.firebasestorage.app",
  messagingSenderId: "518626866858",
  appId: "1:518626866858:web:5ad04b55d08ad9e7cd2d92",
  measurementId: "G-2YJ4YTDX7C"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'us-central1');
const auth = getAuth(app);

// Se vuoi testare in locale, decommentare:
// connectFunctionsEmulator(functions, 'localhost', 5001);

async function executeCleanup() {
  // Autenticazione
  console.log('🔐 Autenticazione in corso...');
  console.log('Inserisci le tue credenziali admin:\n');
  
  // Per sicurezza, chiedi email/password via environment variables
  const email = process.env.FIREBASE_ADMIN_EMAIL || 'parisandrea@gmail.com';
  const password = process.env.FIREBASE_ADMIN_PASSWORD;
  
  if (!password) {
    console.error('❌ Errore: Imposta la variabile FIREBASE_ADMIN_PASSWORD');
    console.log('Esempio: $env:FIREBASE_ADMIN_PASSWORD="tuapassword"; node call-delete-push-subscriptions.mjs');
    process.exit(1);
  }
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Autenticato come:', userCredential.user.email, '\n');
  } catch (authError) {
    console.error('❌ Autenticazione fallita:', authError.message);
    process.exit(1);
  }

  console.log('🚀 Chiamata a deleteAllPushSubscriptions...\n');

  try {
    const deleteAll = httpsCallable(functions, 'deleteAllPushSubscriptions');
    const result = await deleteAll();

    console.log('✅ Successo!\n');
    console.log('📊 Risultato:', JSON.stringify(result.data, null, 2));
    console.log('\n🎉 Tutte le push subscriptions sono state cancellate!');
    console.log('Gli utenti dovranno ri-registrare le notifiche push al prossimo accesso.\n');

  } catch (error) {
    console.error('\n❌ Errore:', error.message);
    if (error.code) {
      console.error('Codice errore:', error.code);
    }
    if (error.details) {
      console.error('Dettagli:', error.details);
    }
    process.exit(1);
  }
}

// Esegui
executeCleanup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Errore fatale:', error);
    process.exit(1);
  });
