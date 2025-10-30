/**
 * Script per testare la funzione getPublicTournaments
 */

import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

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

// Simula la funzione getClubs (versione semplificata)
async function getClubs({ activeOnly = false } = {}) {
  try {
    console.log('🔍 getClubs chiamata con activeOnly:', activeOnly);

    let q = collection(db, 'clubs');

    if (activeOnly) {
      // Filtra client-side invece di server-side per evitare composite index
      console.log('📊 Recupero tutti i club e filtro client-side...');
      const snapshot = await getDocs(q);
      const clubs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filtro client-side
      const activeClubs = clubs.filter(club =>
        club.isActive === true &&
        club.status === 'approved' &&
        club.subscription?.isActive === true
      );

      // Ordina per nome client-side
      activeClubs.sort((a, b) => a.name.localeCompare(b.name));

      console.log(`✅ Trovati ${activeClubs.length} club attivi`);
      return activeClubs;
    } else {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  } catch (error) {
    console.error('❌ Errore in getClubs:', error);
    throw error;
  }
}

// Simula la funzione getPublicTournaments
async function getPublicTournaments() {
  try {
    console.log('🏓 getPublicTournaments chiamata');

    // 1. Ottieni i club attivi
    const activeClubs = await getClubs({ activeOnly: true });
    console.log(`📊 Club attivi trovati: ${activeClubs.length}`);

    if (activeClubs.length === 0) {
      console.log('⚠️ Nessun club attivo trovato');
      return [];
    }

    const publicTournaments = [];

    // 2. Per ogni club attivo, cerca tornei con publicView.enabled = true
    for (const club of activeClubs) {
      console.log(`🔍 Controllo tornei per club: ${club.name} (${club.id})`);

      try {
        const tournamentsRef = collection(db, 'clubs', club.id, 'tournaments');
        const q = query(
          tournamentsRef,
          orderBy('updatedAt', 'desc'),
          limit(20) // Get tournaments ordered by updatedAt
        );

        const tournamentsSnapshot = await getDocs(q);

        console.log(`   📋 Trovati ${tournamentsSnapshot.docs.length} tornei`);

        for (const doc of tournamentsSnapshot.docs) {
          const tournament = doc.data();

          // Filtro client-side per evitare indice composito
          if (tournament.publicView?.enabled === true) {
            console.log(`     ✅ ${tournament.name} - PUBBLICO`);
            publicTournaments.push({
              id: doc.id,
              clubId: club.id,
              clubName: club.name,
              ...tournament
            });
          }
        }
      } catch (error) {
        console.error(`❌ Errore nel recupero tornei per club ${club.name}:`, error);
      }
    }

    console.log(`🎯 Risultato finale: ${publicTournaments.length} tornei pubblici`);
    return publicTournaments;

  } catch (error) {
    console.error('❌ Errore in getPublicTournaments:', error);
    throw error;
  }
}

// Testa la funzione
async function testPublicTournaments() {
  try {
    console.log('🧪 TEST: Simulazione chiamata getPublicTournaments\n');

    const tournaments = await getPublicTournaments();

    console.log('\n📊 RISULTATI DEL TEST:');
    console.log(`   Tornei pubblici trovati: ${tournaments.length}`);

    if (tournaments.length > 0) {
      console.log('\n✅ SUCCESSO! Tornei pubblici trovati:');
      tournaments.forEach((tournament, index) => {
        console.log(`   ${index + 1}. ${tournament.name}`);
        console.log(`      Club: ${tournament.clubName}`);
        console.log(`      Token: ${tournament.publicView?.token}`);
        console.log(`      URL: ${tournament.publicView?.url}`);
      });

      console.log('\n🎯 Il pulsante "Tornei Live" dovrebbe ora funzionare!');
    } else {
      console.log('\n❌ NESSUN TORNEO PUBBLICO TROVATO');
      console.log('   Il pulsante "Tornei Live" continuerà a non mostrare nulla.');
    }

  } catch (error) {
    console.error('❌ Errore durante il test:', error);
  }
}

// Esegui il test
testPublicTournaments();