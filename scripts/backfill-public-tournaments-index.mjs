#!/usr/bin/env node
/**
 * Backfill Script: Public Tournaments Index
 * Popola la collezione publicTournaments con tutti i tornei che hanno publicView.enabled === true
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

// Configurazione Firebase (usa il tuo progetto)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBNL4zGXitGhbavaria_YOUR_KEY",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "play-sport-pro.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "play-sport-pro",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "play-sport-pro.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abc123",
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔧 Inizializzazione Firebase completata');
console.log('📡 Connesso a:', firebaseConfig.projectId);

async function backfillPublicTournamentsIndex() {
  try {
    console.log('\n🔍 Cercando tutti i club...');
    
    const clubsRef = collection(db, 'clubs');
    const clubsSnapshot = await getDocs(clubsRef);
    
    console.log(`📋 Trovati ${clubsSnapshot.size} club`);
    
    let totalProcessed = 0;
    let totalPublic = 0;
    let totalErrors = 0;

    for (const clubDoc of clubsSnapshot.docs) {
      const clubId = clubDoc.id;
      const clubData = clubDoc.data();
      const clubName = clubData.name || 'Club Sconosciuto';
      
      console.log(`\n🏓 Processando club: ${clubName} (${clubId})`);
      
      try {
        const tournamentsRef = collection(db, 'clubs', clubId, 'tournaments');
        const tournamentsSnapshot = await getDocs(tournamentsRef);
        
        console.log(`  📊 Trovati ${tournamentsSnapshot.size} tornei`);
        
        for (const tournamentDoc of tournamentsSnapshot.docs) {
          totalProcessed++;
          const tournamentId = tournamentDoc.id;
          const tournamentData = tournamentDoc.data();
          
          // Verifica se ha la vista pubblica abilitata e un token valido
          if (tournamentData.publicView?.enabled === true && tournamentData.publicView?.token) {
            console.log(`  ✅ Torneo pubblico trovato: ${tournamentData.name || 'Senza nome'}`);
            
            try {
              // Crea/aggiorna l'indice pubblico
              const indexDocId = `${clubId}_${tournamentId}`;
              const indexRef = doc(db, 'publicTournaments', indexDocId);
              
              await setDoc(indexRef, {
                clubId,
                tournamentId,
                clubName,
                name: tournamentData.name || 'Torneo',
                description: tournamentData.description || null,
                status: tournamentData.status || 'draft',
                registeredTeams: tournamentData.registeredTeams || 0,
                token: tournamentData.publicView.token,
                enabled: true,
                updatedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
              }, { merge: true });
              
              totalPublic++;
              console.log(`     📝 Indice aggiornato: ${indexDocId}`);
            } catch (writeError) {
              console.error(`     ❌ Errore scrittura indice:`, writeError.message);
              totalErrors++;
            }
          } else {
            console.log(`  ⏭️  Saltato: ${tournamentData.name || tournamentId} (vista pubblica non abilitata o token mancante)`);
          }
        }
      } catch (clubError) {
        console.error(`  ❌ Errore lettura tornei club ${clubId}:`, clubError.message);
        totalErrors++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RIEPILOGO BACKFILL');
    console.log('='.repeat(60));
    console.log(`✅ Tornei processati: ${totalProcessed}`);
    console.log(`🌐 Tornei pubblici indicizzati: ${totalPublic}`);
    console.log(`❌ Errori: ${totalErrors}`);
    console.log('='.repeat(60));
    
    if (totalPublic > 0) {
      console.log('\n🎉 Backfill completato con successo!');
      console.log('💡 Ora "Tornei Live" dovrebbe mostrare i tornei pubblici senza errori di permesso.');
    } else {
      console.log('\n⚠️  Nessun torneo pubblico trovato.');
      console.log('💡 Assicurati che almeno un torneo abbia publicView.enabled = true e un token valido.');
    }
    
  } catch (error) {
    console.error('\n❌ ERRORE FATALE durante il backfill:', error);
    process.exit(1);
  }
}

// Esegui lo script
console.log('🚀 Avvio backfill indice tornei pubblici...\n');
backfillPublicTournamentsIndex()
  .then(() => {
    console.log('\n✅ Script completato');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script fallito:', error);
    process.exit(1);
  });
