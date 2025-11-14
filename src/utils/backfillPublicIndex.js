/**
 * Utility per popolare l'indice pubblico dei tornei
 * Da eseguire dalla console browser quando sei loggato come admin
 */

import { db } from '../services/firebase.js';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

export async function backfillPublicTournamentsIndex() {
  console.log('🚀 Inizio backfill indice tornei pubblici...\n');
  
  try {
    console.log('🔍 Cercando tutti i club...');
    
    const clubsRef = collection(db, 'clubs');
    const clubsSnapshot = await getDocs(clubsRef);
    
    console.log(`📋 Trovati ${clubsSnapshot.size} club\n`);
    
    let totalProcessed = 0;
    let totalPublic = 0;
    let totalErrors = 0;
    const results = [];

    for (const clubDoc of clubsSnapshot.docs) {
      const clubId = clubDoc.id;
      const clubData = clubDoc.data();
      const clubName = clubData.name || 'Club Sconosciuto';
      
      console.log(`🏓 Processando club: ${clubName} (${clubId})`);
      
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
            console.log(`  ✅ Torneo pubblico: ${tournamentData.name || 'Senza nome'}`);
            
            try {
              // Crea/aggiorna l'indice pubblico
              const indexDocId = `${clubId}_${tournamentId}`;
              const indexRef = doc(db, 'publicTournaments', indexDocId);
              
              const indexData = {
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
              };
              
              await setDoc(indexRef, indexData, { merge: true });
              
              totalPublic++;
              results.push({
                club: clubName,
                tournament: tournamentData.name,
                id: indexDocId,
                status: 'success'
              });
              
              console.log(`     📝 Indice aggiornato: ${indexDocId}`);
            } catch (writeError) {
              console.error(`     ❌ Errore scrittura:`, writeError.message);
              totalErrors++;
              results.push({
                club: clubName,
                tournament: tournamentData.name,
                error: writeError.message,
                status: 'error'
              });
            }
          }
        }
      } catch (clubError) {
        console.error(`  ❌ Errore club ${clubId}:`, clubError.message);
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
      console.log('\n🎉 Backfill completato!');
      console.log('💡 Ricarica la pagina e "Tornei Live" dovrebbe funzionare');
    } else {
      console.log('\n⚠️  Nessun torneo pubblico trovato');
    }
    
    return {
      success: true,
      processed: totalProcessed,
      indexed: totalPublic,
      errors: totalErrors,
      results
    };
    
  } catch (error) {
    console.error('\n❌ ERRORE:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Rendi disponibile globalmente per la console
if (typeof window !== 'undefined') {
  window.backfillPublicTournamentsIndex = backfillPublicTournamentsIndex;
  console.log('💡 Funzione disponibile: window.backfillPublicTournamentsIndex()');
}
