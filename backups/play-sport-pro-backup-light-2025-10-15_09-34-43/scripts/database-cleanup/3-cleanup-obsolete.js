#!/usr/bin/env node
/**
 * SCRIPT 3: Cleanup Collezioni Obsolete
 * 
 * Questo script elimina collezioni obsolete dal database:
 * - leagues/ (legacy system)
 * - club_affiliations/ (duplicato di affiliations/)
 * - userClubRoles/ (sostituito da affiliations/)
 * 
 * ⚠️ QUESTO SCRIPT ELIMINA DATI
 * 
 * Utilizzo:
 * node 3-cleanup-obsolete.js [--force]
 * 
 * Flags:
 * --force: Salta conferme interattive (PERICOLOSO!)
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse arguments
const args = process.argv.slice(2);
const FORCE = args.includes('--force');

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
 * Conferma interattiva
 */
async function confirmDeletion(collectionName, docCount, reason) {
  if (FORCE) {
    console.log(`⚡ FORCE MODE: Skipping confirmation for ${collectionName}`);
    return true;
  }
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`⚠️ CONFERMA ELIMINAZIONE`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Collezione: ${collectionName}`);
    console.log(`Documenti: ${docCount}`);
    console.log(`Motivo: ${reason}`);
    console.log('');
    
    rl.question('Digitare "DELETE" per confermare (o altro per skip): ', (answer) => {
      rl.close();
      resolve(answer === 'DELETE');
    });
  });
}

/**
 * Elimina collezione in batch
 */
async function deleteCollection(collectionPath, batchSize = 500) {
  const collectionRef = db.collection(collectionPath);
  
  let totalDeleted = 0;
  let hasMore = true;
  
  while (hasMore) {
    const snapshot = await collectionRef.limit(batchSize).get();
    
    if (snapshot.empty) {
      hasMore = false;
      break;
    }
    
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    totalDeleted += snapshot.size;
    
    console.log(`   🗑️ Eliminati ${totalDeleted} documenti...`);
    
    // Piccolo delay per non sovraccaricare Firestore
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return totalDeleted;
}

/**
 * Verifica dipendenze prima di eliminare
 */
async function checkDependencies(collectionName) {
  const warnings = [];
  
  if (collectionName === 'userClubRoles') {
    // Verifica che tutti i ruoli siano in affiliations
    const rolesSnap = await db.collection('userClubRoles').limit(5).get();
    const affiliationsSnap = await db.collection('affiliations').limit(1).get();
    
    if (!affiliationsSnap.empty && !rolesSnap.empty) {
      console.log('   ℹ️ Controllando migrazione ruoli...');
      
      for (const roleDoc of rolesSnap.docs) {
        const userId = roleDoc.id;
        const roles = roleDoc.data().roles || {};
        
        for (const clubId of Object.keys(roles)) {
          const affId = `${userId}_${clubId}`;
          const affDoc = await db.collection('affiliations').doc(affId).get();
          
          if (!affDoc.exists) {
            warnings.push(
              `Ruolo ${userId} per club ${clubId} NON trovato in affiliations`
            );
          }
        }
      }
    }
  }
  
  return warnings;
}

/**
 * Cleanup collezioni obsolete
 */
async function cleanupObsoleteCollections() {
  console.log('\n🗑️ CLEANUP COLLEZIONI OBSOLETE');
  console.log('='.repeat(60));
  
  if (!FORCE) {
    console.log('\n⚠️ ATTENZIONE: Questo script eliminerà dati dal database!');
    console.log('Premi CTRL+C per annullare, oppure attendi 5 secondi...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  const collectionsToCleanup = [
    {
      name: 'leagues',
      reason: 'Sistema legacy (pre multi-club)',
      severity: 'LOW'
    },
    {
      name: 'club_affiliations',
      reason: 'Duplicato di affiliations/',
      severity: 'MEDIUM'
    },
    {
      name: 'userClubRoles',
      reason: 'Sostituito da affiliations/ con campo role',
      severity: 'MEDIUM'
    }
  ];
  
  const results = [];
  
  for (const collection of collectionsToCleanup) {
    console.log(`\n📁 COLLEZIONE: ${collection.name}`);
    console.log(`   Motivo: ${collection.reason}`);
    console.log(`   Severity: ${collection.severity}`);
    
    try {
      // 1. Conta documenti
      const count = (await db.collection(collection.name).count().get()).data().count;
      console.log(`   Documenti: ${count}`);
      
      if (count === 0) {
        console.log(`   ✅ Già vuota - SKIP`);
        results.push({
          collection: collection.name,
          action: 'SKIP',
          reason: 'Already empty',
          deleted: 0
        });
        continue;
      }
      
      // 2. Verifica dipendenze
      console.log(`   🔍 Verifica dipendenze...`);
      const warnings = await checkDependencies(collection.name);
      
      if (warnings.length > 0) {
        console.log(`\n   ⚠️ WARNING (${warnings.length}):`);
        warnings.slice(0, 5).forEach(w => console.log(`      - ${w}`));
        if (warnings.length > 5) {
          console.log(`      ... e altri ${warnings.length - 5} warnings`);
        }
      }
      
      // 3. Conferma eliminazione
      const confirmed = await confirmDeletion(collection.name, count, collection.reason);
      
      if (!confirmed) {
        console.log(`   ⏭️ Eliminazione skippata dall'utente`);
        results.push({
          collection: collection.name,
          action: 'SKIPPED',
          reason: 'User cancelled',
          deleted: 0
        });
        continue;
      }
      
      // 4. Elimina collezione
      console.log(`   🗑️ Eliminazione in corso...`);
      const deleted = await deleteCollection(collection.name);
      
      console.log(`   ✅ Eliminati ${deleted} documenti`);
      
      results.push({
        collection: collection.name,
        action: 'DELETED',
        deleted
      });
      
    } catch (error) {
      console.error(`   ❌ Errore: ${error.message}`);
      results.push({
        collection: collection.name,
        action: 'ERROR',
        error: error.message,
        deleted: 0
      });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY CLEANUP\n');
  
  results.forEach(r => {
    const icon = r.action === 'DELETED' ? '✅' : 
                 r.action === 'ERROR' ? '❌' : 
                 r.action === 'SKIP' ? '⏭️' : '⚠️';
    
    console.log(`${icon} ${r.collection}`);
    console.log(`   Action: ${r.action}`);
    if (r.deleted > 0) console.log(`   Deleted: ${r.deleted} documenti`);
    if (r.reason) console.log(`   Reason: ${r.reason}`);
    if (r.error) console.log(`   Error: ${r.error}`);
    console.log('');
  });
  
  const totalDeleted = results.reduce((sum, r) => sum + (r.deleted || 0), 0);
  console.log(`\n🗑️ TOTALE DOCUMENTI ELIMINATI: ${totalDeleted}`);
  
  return results;
}

/**
 * Verifica finale database
 */
async function verifyCleanup() {
  console.log('\n🔍 VERIFICA FINALE\n');
  
  const collections = ['leagues', 'club_affiliations', 'userClubRoles'];
  
  for (const collName of collections) {
    try {
      const count = (await db.collection(collName).count().get()).data().count;
      const status = count === 0 ? '✅' : '⚠️';
      console.log(`${status} ${collName}: ${count} documenti`);
    } catch (error) {
      console.log(`❌ ${collName}: Errore verifica - ${error.message}`);
    }
  }
  
  // Verifica affiliations
  console.log('\n📊 Verifica affiliations:');
  const affCount = (await db.collection('affiliations').count().get()).data().count;
  console.log(`✅ affiliations: ${affCount} documenti`);
  
  // Sample affiliations per verificare struttura
  const affSnap = await db.collection('affiliations').limit(3).get();
  if (!affSnap.empty) {
    console.log('\n📄 Sample affiliations:');
    affSnap.docs.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${doc.id}`);
      console.log(`     userId: ${data.userId}`);
      console.log(`     clubId: ${data.clubId}`);
      console.log(`     role: ${data.role}`);
      console.log(`     status: ${data.status}`);
    });
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🧹 CLEANUP COLLEZIONI OBSOLETE FIRESTORE');
  console.log('='.repeat(60));
  
  if (FORCE) {
    console.log('⚡ FORCE MODE ATTIVO - Nessuna conferma richiesta');
  }
  
  try {
    const results = await cleanupObsoleteCollections();
    await verifyCleanup();
    
    console.log('\n✅ CLEANUP COMPLETATO\n');
    
    // Exit code basato su risultati
    const hasErrors = results.some(r => r.action === 'ERROR');
    process.exit(hasErrors ? 1 : 0);
    
  } catch (error) {
    console.error('\n❌ CLEANUP FALLITO:', error);
    process.exit(1);
  }
}

main();
