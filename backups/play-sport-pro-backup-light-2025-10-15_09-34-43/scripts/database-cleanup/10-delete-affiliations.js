#!/usr/bin/env node

/**
 * =====================================================
 * SCRIPT 10: ELIMINAZIONE AFFILIATIONS
 * =====================================================
 * 
 * Elimina le collection affiliations/ dopo la migrazione
 * 
 * SICUREZZA:
 * - Richiede conferma manuale
 * - Backup automatico
 * - Verifica migrazione completata
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inizializza Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../serviceAccount.json'), 'utf8')
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// ==================== UTILITIES ====================

function log(message, level = 'info') {
  const prefix = {
    info: 'ℹ️ ',
    success: '✅',
    warning: '⚠️ ',
    error: '❌',
  };
  console.log(`${prefix[level]} ${message}`);
}

function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

// ==================== VERIFICA MIGRAZIONE ====================

async function verifyMigrationCompleted() {
  log('🔍 Verifica che la migrazione sia completata...\n');

  const clubs = await db.collection('clubs').get();
  let allLinked = true;
  let totalUsers = 0;
  let linkedUsers = 0;

  for (const clubDoc of clubs.docs) {
    const clubId = clubDoc.id;
    const clubUsersSnap = await db.collection('clubs').doc(clubId).collection('users').get();
    
    clubUsersSnap.forEach((userDoc) => {
      totalUsers++;
      const data = userDoc.data();
      if (data.linkedUserId) {
        linkedUsers++;
      }
    });
  }

  log(`👥 Totale utenti club: ${totalUsers}`);
  log(`🔗 Utenti con linkedUserId: ${linkedUsers}`);
  log(`❌ Utenti senza link: ${totalUsers - linkedUsers}\n`);

  if (linkedUsers === 0) {
    log('⚠️  ATTENZIONE: Nessun utente ha linkedUserId!', 'warning');
    log('   La migrazione potrebbe non essere stata eseguita.', 'warning');
    return false;
  }

  log('✅ Migrazione sembra completata', 'success');
  return true;
}

// ==================== BACKUP ====================

async function createBackup() {
  log('📦 Creazione backup finale affiliations...');
  
  const affiliationsRef = db.collection('affiliations');
  const snapshot = await affiliationsRef.get();
  
  const backup = {
    timestamp: new Date().toISOString(),
    count: snapshot.size,
    data: {},
  };
  
  snapshot.forEach((doc) => {
    backup.data[doc.id] = doc.data();
  });
  
  const fs = await import('fs/promises');
  const filename = `affiliations-final-backup-${Date.now()}.json`;
  await fs.writeFile(
    join(__dirname, `backups/${filename}`),
    JSON.stringify(backup, null, 2)
  );
  
  log(`✅ Backup salvato: ${filename} (${snapshot.size} documenti)`, 'success');
  return backup;
}

// ==================== ELIMINAZIONE ====================

async function deleteAffiliations() {
  const stats = {
    rootDeleted: 0,
    subcollectionDeleted: 0,
    errors: 0,
  };

  try {
    // 1. Elimina ROOT affiliations/
    log('\n🗑️  Step 1: Eliminazione ROOT affiliations/...');
    const rootRef = db.collection('affiliations');
    const rootSnap = await rootRef.get();
    
    log(`📦 Trovati ${rootSnap.size} documenti in ROOT affiliations/`);
    
    for (const doc of rootSnap.docs) {
      try {
        await doc.ref.delete();
        stats.rootDeleted++;
      } catch (error) {
        log(`❌ Errore eliminando ${doc.id}: ${error.message}`, 'error');
        stats.errors++;
      }
    }
    
    log(`✅ Eliminati ${stats.rootDeleted} documenti da ROOT`, 'success');

    // 2. Elimina SUBCOLLECTIONS clubs/{clubId}/affiliations/
    log('\n🗑️  Step 2: Eliminazione SUBCOLLECTIONS affiliations...');
    const clubs = await db.collection('clubs').get();
    
    for (const clubDoc of clubs.docs) {
      const clubId = clubDoc.id;
      const subRef = db.collection('clubs').doc(clubId).collection('affiliations');
      const subSnap = await subRef.get();
      
      if (!subSnap.empty) {
        log(`📦 Club ${clubId}: ${subSnap.size} documenti`);
        
        for (const doc of subSnap.docs) {
          try {
            await doc.ref.delete();
            stats.subcollectionDeleted++;
          } catch (error) {
            log(`❌ Errore eliminando ${doc.id}: ${error.message}`, 'error');
            stats.errors++;
          }
        }
      }
    }
    
    log(`✅ Eliminati ${stats.subcollectionDeleted} documenti da SUBCOLLECTIONS`, 'success');

  } catch (error) {
    log(`❌ ERRORE FATALE: ${error.message}`, 'error');
    console.error(error);
    throw error;
  }

  return stats;
}

// ==================== VERIFICA FINALE ====================

async function verifyDeletion() {
  log('\n🔍 Verifica finale...');

  // Verifica ROOT
  const rootSnap = await db.collection('affiliations').get();
  log(`📊 ROOT affiliations/: ${rootSnap.size} documenti`);

  // Verifica SUBCOLLECTIONS
  const clubs = await db.collection('clubs').get();
  let totalSub = 0;
  
  for (const clubDoc of clubs.docs) {
    const subSnap = await db.collection('clubs').doc(clubDoc.id).collection('affiliations').get();
    totalSub += subSnap.size;
  }
  
  log(`📊 SUBCOLLECTIONS affiliations/: ${totalSub} documenti`);

  if (rootSnap.size === 0 && totalSub === 0) {
    log('✅ Tutte le affiliations eliminate!', 'success');
    return true;
  } else {
    log('⚠️  Alcune affiliations ancora presenti', 'warning');
    return false;
  }
}

// ==================== MAIN ====================

async function main() {
  // Check for --confirm flag
  const autoConfirm = process.argv.includes('--confirm');

  console.log(`
${'='.repeat(60)}
🗑️  ELIMINAZIONE AFFILIATIONS
${'='.repeat(60)}

⚠️  ATTENZIONE: Questo script eliminerà DEFINITIVAMENTE:
   - Collezione ROOT: affiliations/
   - Subcollections: clubs/{clubId}/affiliations/

Prima di procedere, verifica:
✅ Migrazione completata (script 9)
✅ Utenti club hanno linkedUserId
✅ Sistema funziona senza affiliations

${'='.repeat(60)}
`);

  try {
    // 1. Verifica migrazione
    const migrationOk = await verifyMigrationCompleted();
    
    if (!migrationOk) {
      log('\n⚠️  La migrazione non sembra completata.', 'warning');
      if (!autoConfirm) {
        const continueAnyway = await askConfirmation('Vuoi continuare comunque? (yes/no): ');
        if (!continueAnyway) {
          log('❌ Operazione annullata', 'error');
          process.exit(0);
        }
      } else {
        log('⚠️  Continuo comunque (--confirm flag)', 'warning');
      }
    }

    // 2. Richiedi conferma
    log('\n⚠️  PUNTO DI NON RITORNO\n');
    
    if (!autoConfirm) {
      const confirmed = await askConfirmation('Sei SICURO di voler eliminare le affiliations? (yes/no): ');
      
      if (!confirmed) {
        log('❌ Operazione annullata', 'error');
        process.exit(0);
      }
    } else {
      log('✅ Confermato automaticamente via --confirm flag', 'success');
    }

    // 3. Backup finale
    await createBackup();

    // 4. Eliminazione
    log('\n🗑️  Inizio eliminazione...\n');
    const stats = await deleteAffiliations();

    // 5. Verifica finale
    await verifyDeletion();

    // 6. Report finale
    console.log(`
${'='.repeat(60)}
📊 REPORT FINALE
${'='.repeat(60)}

🗑️  ROOT eliminati:          ${stats.rootDeleted}
🗑️  SUBCOLLECTIONS eliminati: ${stats.subcollectionDeleted}
📦 TOTALE eliminati:         ${stats.rootDeleted + stats.subcollectionDeleted}
❌ Errori:                   ${stats.errors}

${'='.repeat(60)}
`);

    if (stats.errors > 0) {
      log('⚠️  Ci sono stati errori. Controlla i log.', 'warning');
    } else {
      log('🎉 ELIMINAZIONE COMPLETATA CON SUCCESSO!', 'success');
      log('\n📋 PROSSIMI PASSI:', 'info');
      log('   1. Testa il sistema completamente');
      log('   2. Elimina src/services/affiliations.js');
      log('   3. Rimuovi import affiliations dal codice');
      log('   4. Aggiorna documentazione');
    }

  } catch (error) {
    log('❌ ERRORE FATALE:', 'error');
    console.error(error);
    process.exit(1);
  }
}

// Esegui
main();
