/**
 * Script per trovare i club dell'utente loggato
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

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

async function findUserClubs() {
  console.log('🔍 Trova club dell\'utente');
  console.log('='.repeat(50));

  const userId = 'FoqdMJ6vCFfshRPlz4CYrCl0fpu1';
  const userEmail = 'sportingcat@gmil.com';

  console.log(`\nUtente: ${userEmail}`);
  console.log(`UID: ${userId}\n`);

  try {
    // 1. Cerca in affiliations
    console.log('📋 Cerca in affiliations...');
    const affiliationsRef = collection(db, 'affiliations');
    const q1 = query(affiliationsRef, where('userId', '==', userId));
    const snap1 = await getDocs(q1);

    if (!snap1.empty) {
      console.log(`✅ Trovate ${snap1.size} affiliations:`);
      snap1.forEach(doc => {
        const data = doc.data();
        console.log(`   - Club: ${data.clubId} | Role: ${data.role} | Status: ${data.status}`);
      });
    } else {
      console.log('   ⚠️ Nessuna affiliation trovata');
    }

    // 2. Cerca club dove è owner
    console.log('\n📋 Cerca club dove è owner...');
    const clubsRef = collection(db, 'clubs');
    const q2 = query(clubsRef, where('owner', '==', userId));
    const snap2 = await getDocs(q2);

    if (!snap2.empty) {
      console.log(`✅ Trovati ${snap2.size} club dove è owner:`);
      snap2.forEach(doc => {
        const data = doc.data();
        console.log(`   - ID: ${doc.id} | Nome: ${data.name}`);
      });
    } else {
      console.log('   ⚠️ Nessun club trovato come owner');
    }

    // 3. Cerca club dove è in admins array
    console.log('\n📋 Cerca club dove è in admins...');
    const q3 = query(clubsRef, where('admins', 'array-contains', userId));
    const snap3 = await getDocs(q3);

    if (!snap3.empty) {
      console.log(`✅ Trovati ${snap3.size} club dove è in admins:`);
      snap3.forEach(doc => {
        const data = doc.data();
        console.log(`   - ID: ${doc.id} | Nome: ${data.name}`);
      });
    } else {
      console.log('   ⚠️ Nessun club trovato in admins');
    }

    // 4. Cerca club dove è in adminEmails
    console.log('\n📋 Cerca club dove è in adminEmails...');
    const q4 = query(clubsRef, where('adminEmails', 'array-contains', userEmail));
    const snap4 = await getDocs(q4);

    if (!snap4.empty) {
      console.log(`✅ Trovati ${snap4.size} club dove è in adminEmails:`);
      snap4.forEach(doc => {
        const data = doc.data();
        console.log(`   - ID: ${doc.id} | Nome: ${data.name}`);
      });
    } else {
      console.log('   ⚠️ Nessun club trovato in adminEmails');
    }

    console.log('\n' + '='.repeat(50));
    console.log('💡 Usa uno degli ID trovati per il test');

  } catch (error) {
    console.error('\n❌ Errore:', error.message);
  }
}

findUserClubs();
