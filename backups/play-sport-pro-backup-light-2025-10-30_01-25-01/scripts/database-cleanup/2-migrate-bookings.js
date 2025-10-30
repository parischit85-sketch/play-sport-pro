#!/usr/bin/env node
/**
 * SCRIPT 2: Migrazione Bookings da Root a Club Subcollections
 * 
 * Questo script migra tutti i booking dalla collezione root /bookings/
 * alle subcollections clubs/{clubId}/bookings/
 * 
 * ⚠️ QUESTO SCRIPT MODIFICA IL DATABASE
 * 
 * Steps:
 * 1. Legge tutti i bookings da /bookings/
 * 2. Per ogni booking, verifica clubId
 * 3. Copia in clubs/{clubId}/bookings/
 * 4. (Opzionale) Elimina da root dopo verifica
 * 
 * Utilizzo:
 * node 2-migrate-bookings.js [--dry-run] [--delete-after]
 * 
 * Flags:
 * --dry-run: Simula migrazione senza scrivere
 * --delete-after: Elimina bookings da root dopo migrazione
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const DELETE_AFTER = args.includes('--delete-after');

// Inizializza Firebase Admin
try {
  const serviceAccount = JSON.parse(
    readFileSync(join(__dirname, '../serviceAccount.json'), 'utf8')
  );
  
  initializeApp({
    credential: cert(serviceAccount)
  });
  
  console.log('✅ Firebase Admin inizializzato');
} catch (error) {
  console.error('❌ Errore inizializzazione Firebase:', error.message);
  process.exit(1);
}

const db = getFirestore();

/**
 * Migra bookings da root a club subcollections
 */
async function migrateBookings() {
  console.log('\n📦 MIGRAZIONE BOOKINGS');
  console.log('='.repeat(60));
  console.log(`Modalità: ${DRY_RUN ? '🔍 DRY RUN (nessuna modifica)' : '✍️ SCRITTURA ATTIVA'}`);
  console.log(`Elimina dopo: ${DELETE_AFTER ? '✅ SÌ' : '❌ NO'}\n`);
  
  if (!DRY_RUN) {
    console.log('⚠️ ATTENZIONE: Questo script modificherà il database!');
    console.log('Premi CTRL+C per annullare, oppure attendi 5 secondi...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  try {
    // 1. Carica tutti i booking dalla root
    console.log('📖 Caricamento bookings da /bookings/...');
    const rootBookingsSnap = await db.collection('bookings').get();
    
    if (rootBookingsSnap.empty) {
      console.log('ℹ️ Nessun booking trovato in /bookings/');
      return;
    }
    
    console.log(`📦 Trovati ${rootBookingsSnap.size} bookings\n`);
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    const errorDetails = [];
    
    // 2. Processa ogni booking
    for (const bookingDoc of rootBookingsSnap.docs) {
      const data = bookingDoc.data();
      const bookingId = bookingDoc.id;
      
      // Verifica clubId
      if (!data.clubId) {
        console.log(`⚠️ [${bookingId}] Nessun clubId - SKIP`);
        errorDetails.push({
          bookingId,
          error: 'Missing clubId',
          data: { ...data }
        });
        skipped++;
        continue;
      }
      
      try {
        // Verifica che il club esista
        const clubRef = db.collection('clubs').doc(data.clubId);
        const clubSnap = await clubRef.get();
        
        if (!clubSnap.exists) {
          console.log(`⚠️ [${bookingId}] Club ${data.clubId} non esiste - SKIP`);
          errorDetails.push({
            bookingId,
            error: 'Club not found',
            clubId: data.clubId
          });
          skipped++;
          continue;
        }
        
        // Verifica se già esiste nella destinazione
        const destRef = clubRef.collection('bookings').doc(bookingId);
        const destSnap = await destRef.get();
        
        if (destSnap.exists) {
          console.log(`ℹ️ [${bookingId}] Già presente in clubs/${data.clubId}/bookings/ - SKIP`);
          skipped++;
          continue;
        }
        
        // Migra il booking
        if (!DRY_RUN) {
          await destRef.set({
            ...data,
            migratedAt: FieldValue.serverTimestamp(),
            migratedFrom: 'root-bookings',
            originalId: bookingId
          });
        }
        
        console.log(`✅ [${bookingId}] → clubs/${data.clubId}/bookings/`);
        migrated++;
        
        // Progress ogni 50 bookings
        if (migrated % 50 === 0) {
          console.log(`   📊 Progress: ${migrated}/${rootBookingsSnap.size} migrati`);
        }
        
      } catch (error) {
        console.error(`❌ [${bookingId}] Errore: ${error.message}`);
        errorDetails.push({
          bookingId,
          error: error.message,
          clubId: data.clubId
        });
        errors++;
      }
    }
    
    // 3. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 RISULTATI MIGRAZIONE\n');
    console.log(`✅ Migrati con successo: ${migrated}`);
    console.log(`⏭️ Skippati: ${skipped}`);
    console.log(`❌ Errori: ${errors}`);
    
    if (errorDetails.length > 0) {
      console.log(`\n⚠️ DETTAGLI ERRORI (${errorDetails.length}):\n`);
      errorDetails.slice(0, 10).forEach((err, i) => {
        console.log(`${i + 1}. Booking: ${err.bookingId}`);
        console.log(`   Errore: ${err.error}`);
        if (err.clubId) console.log(`   Club: ${err.clubId}`);
        console.log('');
      });
      
      if (errorDetails.length > 10) {
        console.log(`... e altri ${errorDetails.length - 10} errori`);
      }
    }
    
    // 4. Verifica migrazione
    console.log('\n🔍 VERIFICA MIGRAZIONE:\n');
    const clubsSnap = await db.collection('clubs').get();
    
    for (const clubDoc of clubsSnap.docs) {
      const bookingsCount = (
        await clubDoc.ref.collection('bookings').count().get()
      ).data().count;
      console.log(`  Club ${clubDoc.id}: ${bookingsCount} bookings`);
    }
    
    // 5. Eliminazione da root (se richiesto)
    if (DELETE_AFTER && !DRY_RUN && migrated > 0) {
      console.log('\n🗑️ ELIMINAZIONE BOOKINGS DA ROOT...\n');
      console.log('⚠️ Questo eliminerà i bookings migrati da /bookings/');
      console.log('Premi CTRL+C per annullare, oppure attendi 10 secondi...\n');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      let deleted = 0;
      for (const bookingDoc of rootBookingsSnap.docs) {
        const data = bookingDoc.data();
        
        // Elimina solo se ha clubId e non ha errori
        if (data.clubId && !errorDetails.find(e => e.bookingId === bookingDoc.id)) {
          await bookingDoc.ref.delete();
          deleted++;
          
          if (deleted % 50 === 0) {
            console.log(`   🗑️ Eliminati: ${deleted}/${migrated}`);
          }
        }
      }
      
      console.log(`\n✅ Eliminati ${deleted} bookings da /bookings/`);
    }
    
    if (DRY_RUN) {
      console.log('\nℹ️ DRY RUN completato - nessuna modifica effettuata');
      console.log('Esegui senza --dry-run per applicare le modifiche');
    }
    
  } catch (error) {
    console.error('\n❌ ERRORE GENERALE:', error);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🚀 MIGRAZIONE BOOKINGS ROOT → CLUB SUBCOLLECTIONS\n');
  
  try {
    await migrateBookings();
    console.log('\n✅ MIGRAZIONE COMPLETATA\n');
  } catch (error) {
    console.error('\n❌ MIGRAZIONE FALLITA:', error);
    process.exit(1);
  }
}

main();
