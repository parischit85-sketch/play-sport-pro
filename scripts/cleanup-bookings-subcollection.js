#!/usr/bin/env node

/**
 * Script per eliminare la subcollection clubs/{clubId}/bookings/
 * 
 * ATTENZIONE: Questo script è OPZIONALE e può essere eseguito DOPO
 * aver verificato che tutte le query funzionano correttamente con
 * la root collection bookings/
 * 
 * BACKUP: Assicurati di aver fatto backup prima di eseguire!
 * 
 * Usage:
 *   node scripts/cleanup-bookings-subcollection.js --dry-run   # Simula senza cancellare
 *   node scripts/cleanup-bookings-subcollection.js --execute   # Esegue cancellazione
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isExecute = args.includes('--execute');

if (!isDryRun && !isExecute) {
  console.error('❌ Devi specificare --dry-run o --execute');
  console.log('\nUsage:');
  console.log('  node scripts/cleanup-bookings-subcollection.js --dry-run   # Simula');
  console.log('  node scripts/cleanup-bookings-subcollection.js --execute   # Esegue');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccountPath = join(__dirname, '..', 'serviceAccountKey.json');
let serviceAccount;

try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('❌ Errore caricamento serviceAccountKey.json');
  console.error('   Assicurati che il file esista in:', serviceAccountPath);
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

/**
 * Elimina tutti i documenti di una subcollection
 */
async function deleteSubcollection(clubId, isDryRun = false) {
  const subcollectionRef = db.collection('clubs').doc(clubId).collection('bookings');
  
  const snapshot = await subcollectionRef.get();
  
  if (snapshot.empty) {
    console.log(`  ℹ️  Subcollection vuota per club: ${clubId}`);
    return { deleted: 0, errors: 0 };
  }
  
  console.log(`  📊 Trovati ${snapshot.size} documenti in clubs/${clubId}/bookings/`);
  
  if (isDryRun) {
    console.log(`  🔍 DRY-RUN: Simulazione cancellazione ${snapshot.size} documenti`);
    return { deleted: snapshot.size, errors: 0 };
  }
  
  // Batch delete (max 500 per batch)
  const batches = [];
  let currentBatch = db.batch();
  let count = 0;
  let deleted = 0;
  let errors = 0;
  
  snapshot.docs.forEach((doc) => {
    currentBatch.delete(doc.ref);
    count++;
    
    if (count === 500) {
      batches.push(currentBatch);
      currentBatch = db.batch();
      count = 0;
    }
  });
  
  // Add last batch if not empty
  if (count > 0) {
    batches.push(currentBatch);
  }
  
  // Commit all batches
  for (let i = 0; i < batches.length; i++) {
    try {
      await batches[i].commit();
      deleted += Math.min(500, snapshot.size - (i * 500));
      console.log(`  ✅ Batch ${i + 1}/${batches.length} committed (${deleted}/${snapshot.size})`);
    } catch (error) {
      console.error(`  ❌ Errore batch ${i + 1}:`, error.message);
      errors++;
    }
  }
  
  return { deleted, errors };
}

/**
 * Main function
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🧹 CLEANUP BOOKINGS SUBCOLLECTION');
  console.log('='.repeat(60));
  console.log(`Mode: ${isDryRun ? '🔍 DRY-RUN (simulation)' : '⚠️  EXECUTE (real deletion)'}`);
  console.log('='.repeat(60) + '\n');
  
  if (isExecute) {
    console.log('⚠️  WARNING: Stai per ELIMINARE PERMANENTEMENTE le subcollection!');
    console.log('⚠️  Assicurati di aver fatto BACKUP prima di procedere!\n');
    
    // Wait 5 seconds for user to cancel
    console.log('⏳ Inizio tra 5 secondi... (Ctrl+C per annullare)');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('\n🚀 Inizio eliminazione...\n');
  }
  
  try {
    // Get all clubs
    const clubsSnapshot = await db.collection('clubs').get();
    
    console.log(`📁 Trovati ${clubsSnapshot.size} club\n`);
    
    let totalDeleted = 0;
    let totalErrors = 0;
    
    for (const clubDoc of clubsSnapshot.docs) {
      const clubId = clubDoc.id;
      const clubData = clubDoc.data();
      console.log(`\n🏢 Club: ${clubData.name || clubId}`);
      
      const result = await deleteSubcollection(clubId, isDryRun);
      totalDeleted += result.deleted;
      totalErrors += result.errors;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ COMPLETATO');
    console.log('='.repeat(60));
    console.log(`Documenti ${isDryRun ? 'da eliminare' : 'eliminati'}: ${totalDeleted}`);
    console.log(`Errori: ${totalErrors}`);
    
    if (isDryRun) {
      console.log('\n💡 Per eseguire la cancellazione reale, usa: --execute');
    } else {
      console.log('\n✅ Subcollection bookings eliminate con successo!');
      console.log('✅ Ora tutte le query usano solo la root collection bookings/');
    }
    
  } catch (error) {
    console.error('\n❌ Errore durante l\'esecuzione:', error);
    process.exit(1);
  }
}

// Run
main()
  .then(() => {
    console.log('\n✅ Script completato');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Errore fatale:', error);
    process.exit(1);
  });
