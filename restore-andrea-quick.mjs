/**
 * Script immediato per ripristinare Andrea Paris
 * Aggiunge il campo "id" mancante
 */

import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Config Firebase (dal tuo progetto)
const firebaseConfig = {
  apiKey: "AIzaSyD9h0v3Os86V4pAe7W4DdIEwGnfz6lPMpo",
  authDomain: "m-padelweb.firebaseapp.com",
  projectId: "m-padelweb",
  storageBucket: "m-padelweb.firebasestorage.app",
  messagingSenderId: "488096818855",
  appId: "1:488096818855:web:7cdbf10d4e7d7e71e46a00",
  measurementId: "G-87LT60RBV1"
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'us-central1');
const auth = getAuth(app);

// Login come admin
const adminEmail = 'parischit85@gmail.com';
const adminPassword = process.argv[2] || '';

if (!adminPassword) {
  console.error('\n❌ Password richiesta!');
  console.log('Uso: node restore-andrea-quick.mjs YOUR_PASSWORD\n');
  process.exit(1);
}

async function restoreAndreaParis() {
  try {
    console.log('\n🔐 Login come admin...');
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log('✅ Login effettuato\n');

    console.log('🔧 Ripristino profilo Andrea Paris...');
    
    const restorePlayerProfile = httpsCallable(functions, 'restorePlayerProfile');
    const result = await restorePlayerProfile({
      clubId: 'sporting-cat',
      playerId: '93OJwY9VL7FhZdd92Zoe',  // Document ID
      userId: 'mwLUarfeMkQqKMmDZ1qPPMyN7mZ2'  // Firebase Auth UID
    });

    console.log('\n✅ SUCCESSO!\n');
    console.log('Prima:', result.data.before);
    console.log('\nDopo:', result.data.after);
    console.log('\n🎉 Andrea Paris ripristinato! Le statistiche dovrebbero tornare visibili.\n');

  } catch (error) {
    console.error('\n❌ Errore:', error.message);
    if (error.code) console.error('Codice:', error.code);
    process.exit(1);
  }
}

restoreAndreaParis();
