/**
 * Script per trovare il club "Sporting Cat" e preparare i comandi
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function findSportingCat() {
  console.log('🔍 Cerca club "Sporting Cat"');
  console.log('='.repeat(50));

  try {
    const clubsRef = collection(db, 'clubs');
    const snapshot = await getDocs(clubsRef);

    console.log(`\n📊 Totale club nel database: ${snapshot.size}\n`);

    const sportingClubs = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const name = (data.name || '').toLowerCase();
      
      if (name.includes('sporting') || name.includes('cat')) {
        sportingClubs.push({
          id: doc.id,
          name: data.name,
          owner: data.owner,
          admins: data.admins || [],
          adminEmails: data.adminEmails || [],
        });
      }
    });

    if (sportingClubs.length > 0) {
      console.log(`✅ Trovati ${sportingClubs.length} club con "sporting" o "cat":\n`);
      
      sportingClubs.forEach((club, i) => {
        console.log(`${i + 1}. ${club.name}`);
        console.log(`   ID: ${club.id}`);
        console.log(`   Owner: ${club.owner || 'NON IMPOSTATO'}`);
        console.log(`   Admins: ${JSON.stringify(club.admins)}`);
        console.log(`   AdminEmails: ${JSON.stringify(club.adminEmails)}`);
        console.log('');
      });

      // Prepara comandi per Firebase Console
      console.log('=' .repeat(50));
      console.log('📋 ISTRUZIONI PER AGGIUNGERE ADMIN:\n');
      console.log('1. Apri Firebase Console:');
      console.log('   https://console.firebase.google.com/project/m-padelweb/firestore\n');
      
      const userId = 'FoqdMJ6vCFfshRPlz4CYrCl0fpu1';
      const userEmail = 'sportingcat@gmil.com';
      
      sportingClubs.forEach((club, i) => {
        console.log(`${i + 1}. Per il club "${club.name}" (ID: ${club.id}):\n`);
        console.log(`   a) Vai a: clubs/${club.id}`);
        console.log(`   b) Aggiungi/modifica questi campi:`);
        console.log(`      - admins: aggiungi "${userId}" all'array`);
        console.log(`      - adminEmails: aggiungi "${userEmail}" all'array`);
        console.log('');
        console.log(`   c) Oppure copia questo JSON e usa "Edit field":`);
        console.log('      {');
        console.log(`        "admins": ${JSON.stringify([...club.admins, userId].filter((v, i, a) => a.indexOf(v) === i))},`);
        console.log(`        "adminEmails": ${JSON.stringify([...club.adminEmails, userEmail].filter((v, i, a) => a.indexOf(v) === i))}`);
        console.log('      }');
        console.log('');
      });

    } else {
      console.log('❌ Nessun club trovato con "sporting" o "cat"');
      console.log('\n💡 Lista di tutti i club:');
      
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.name} (ID: ${doc.id})`);
      });
    }

  } catch (error) {
    console.error('\n❌ Errore:', error.message);
  }
}

findSportingCat();
