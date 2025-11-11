/**
 * Script per aggiungere permessi admin al club Sporting Cat
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, arrayUnion } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC8tWs8LsGnrH-jJQSmWp3bwq0k_YMpQZo",
  authDomain: "m-padelweb.firebaseapp.com",
  projectId: "m-padelweb",
  storageBucket: "m-padelweb.firebasestorage.app",
  messagingSenderId: "635830114226",
  appId: "1:635830114226:web:9c6e2f7a94a45c3c8b0e3f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addAdminPermissions() {
  console.log('🔧 Aggiungi permessi admin a Sporting Cat');
  console.log('='.repeat(50));

  const userId = 'FoqdMJ6vCFfshRPlz4CYrCl0fpu1';
  const userEmail = 'sportingcat@gmil.com';
  const clubId = 'sporting-cat';

  console.log(`\nClub: ${clubId}`);
  console.log(`User: ${userEmail}`);
  console.log(`UID: ${userId}\n`);

  try {
    const clubRef = doc(db, 'clubs', clubId);

    console.log('🚀 Aggiorno il club...');
    
    await updateDoc(clubRef, {
      owner: userId,
      admins: arrayUnion(userId),
      adminEmails: arrayUnion(userEmail),
    });

    console.log('✅ Club aggiornato!');
    console.log('\n📋 Campi aggiornati:');
    console.log(`   - owner: ${userId}`);
    console.log(`   - admins: [${userId}]`);
    console.log(`   - adminEmails: [${userEmail}]`);

    console.log('\n🧪 Riprova il test nell\'app ora!');
    console.log('   1. Ricarica la pagina (F5)');
    console.log('   2. Apri la modale email');
    console.log('   3. Clicca "🧪 Test Rapido"');

  } catch (error) {
    console.error('\n❌ Errore:', error.message);
    console.error('\n💡 Se vedi "Missing or insufficient permissions":');
    console.log('   Aggiungi manualmente da Firebase Console:');
    console.log('   https://console.firebase.google.com/project/m-padelweb/firestore/data/clubs/sporting-cat');
  }
}

addAdminPermissions();
