#!/usr/bin/env node

/**
 * =====================================================
 * SCRIPT 9: MIGRAZIONE AFFILIATIONS → CLUB USERS
 * =====================================================
 * 
 * Migra il sistema affiliations a linkedUserId in club users
 * 
 * FUNZIONALITÀ:
 * 1. Legge tutte le affiliations/ (root) con status='approved'
 * 2. Per ogni affiliation:
 *    - Trova il club user corrispondente in clubs/{clubId}/users/
 *    - Aggiunge linkedUserId al club user
 *    - Se non esiste club user, lo crea
 * 3. Backup completo prima di modificare
 * 
 * SICUREZZA:
 * - --dry-run: Simula senza modificare
 * - Backup automatico
 * - Verifica esistenza dati
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

// ==================== CONFIGURAZIONE ====================

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

console.log(`
🔄 MIGRAZIONE AFFILIATIONS → CLUB USERS
${'='.repeat(60)}
Modalità: ${DRY_RUN ? '🔍 DRY RUN (simulazione)' : '⚠️  LIVE (modifiche reali)'}
Verbose: ${VERBOSE ? 'ON' : 'OFF'}
${'='.repeat(60)}
`);

// ==================== UTILITIES ====================

function log(message, level = 'info') {
  const prefix = {
    info: 'ℹ️ ',
    success: '✅',
    warning: '⚠️ ',
    error: '❌',
    debug: '🔍',
  };
  console.log(`${prefix[level]} ${message}`);
}

function verboseLog(message) {
  if (VERBOSE) {
    console.log(`   ${message}`);
  }
}

async function createBackup(collection, filename) {
  log(`Creazione backup: ${filename}...`);
  const snapshot = await collection.get();
  const backup = {};
  snapshot.forEach((doc) => {
    backup[doc.id] = doc.data();
  });
  
  const fs = await import('fs/promises');
  await fs.writeFile(
    join(__dirname, `backups/${filename}`),
    JSON.stringify(backup, null, 2)
  );
  
  log(`Backup salvato: ${snapshot.size} documenti`, 'success');
  return backup;
}

// ==================== MIGRAZIONE ====================

async function migrateAffiliations() {
  const stats = {
    totalAffiliations: 0,
    approved: 0,
    migrated: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    details: [],
  };

  try {
    // 1. BACKUP affiliations
    log('📦 Step 1: Backup affiliations...');
    const affiliationsRef = db.collection('affiliations');
    await createBackup(affiliationsRef, `affiliations-backup-${Date.now()}.json`);

    // 2. LEGGI tutte le affiliations
    log('📖 Step 2: Lettura affiliations...');
    const affiliationsSnap = await affiliationsRef.get();
    stats.totalAffiliations = affiliationsSnap.size;
    log(`Trovate ${stats.totalAffiliations} affiliations totali`);

    // 3. FILTRA solo approved
    const approvedAffiliations = [];
    affiliationsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.status === 'approved') {
        approvedAffiliations.push({
          id: doc.id,
          ...data,
        });
      }
    });
    stats.approved = approvedAffiliations.length;
    log(`Trovate ${stats.approved} affiliations approvate da migrare`, 'info');

    // 4. MIGRAZIONE
    log('🔄 Step 3: Migrazione in corso...\n');

    for (const affiliation of approvedAffiliations) {
      const { id, userId, clubId, role } = affiliation;
      
      verboseLog(`Processing: ${id}`);
      verboseLog(`  User: ${userId}`);
      verboseLog(`  Club: ${clubId}`);
      verboseLog(`  Role: ${role}`);

      try {
        // Cerca club user esistente per userId
        const clubUsersRef = db.collection('clubs').doc(clubId).collection('users');
        
        // Cerca per email (più affidabile)
        let clubUserDoc = null;
        
        // Prima prova: cerca per userId diretto (se usato come ID)
        const directRef = clubUsersRef.doc(userId);
        const directSnap = await directRef.get();
        
        if (directSnap.exists) {
          clubUserDoc = directSnap;
          verboseLog(`  ✓ Trovato club user diretto: ${userId}`);
        } else {
          // Seconda prova: cerca nelle root users per trovare email
          const userDoc = await db.collection('users').doc(userId).get();
          
          if (userDoc.exists) {
            const userEmail = userDoc.data().email;
            verboseLog(`  📧 Email utente: ${userEmail}`);
            
            // Cerca club user con questa email
            const emailQuery = await clubUsersRef.where('email', '==', userEmail).get();
            
            if (!emailQuery.empty) {
              clubUserDoc = emailQuery.docs[0];
              verboseLog(`  ✓ Trovato club user tramite email: ${clubUserDoc.id}`);
            }
          }
        }

        if (clubUserDoc && clubUserDoc.exists) {
          // UPDATE: Aggiungi linkedUserId al club user esistente
          const updateData = {
            linkedUserId: userId,
            role: role || 'member',
            status: 'active',
            updatedAt: FieldValue.serverTimestamp(),
            migratedFromAffiliation: true,
            migratedAt: FieldValue.serverTimestamp(),
          };

          if (!DRY_RUN) {
            await clubUserDoc.ref.update(updateData);
          }

          stats.updated++;
          log(`✅ UPDATED: ${clubUserDoc.id} → linkedUserId: ${userId}`, 'success');
          
          stats.details.push({
            action: 'UPDATE',
            affiliationId: id,
            clubUserId: clubUserDoc.id,
            userId,
            clubId,
            role,
          });

        } else {
          // CREATE: Crea nuovo club user con linkedUserId
          // Prendi dati da users/ se esiste
          const userDoc = await db.collection('users').doc(userId).get();
          const userData = userDoc.exists ? userDoc.data() : {};

          const newClubUser = {
            linkedUserId: userId,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            role: role || 'member',
            status: 'active',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            migratedFromAffiliation: true,
            migratedAt: FieldValue.serverTimestamp(),
            source: 'affiliation_migration',
          };

          if (!DRY_RUN) {
            const newDocRef = await clubUsersRef.add(newClubUser);
            verboseLog(`  📝 Creato nuovo club user: ${newDocRef.id}`);
          }

          stats.created++;
          log(`🆕 CREATED: New club user for ${userId}`, 'success');
          
          stats.details.push({
            action: 'CREATE',
            affiliationId: id,
            userId,
            clubId,
            role,
          });
        }

        stats.migrated++;

      } catch (error) {
        stats.errors++;
        log(`ERRORE su affiliation ${id}: ${error.message}`, 'error');
        verboseLog(`  Stack: ${error.stack}`);
        
        stats.details.push({
          action: 'ERROR',
          affiliationId: id,
          userId,
          clubId,
          error: error.message,
        });
      }
    }

  } catch (error) {
    log(`ERRORE FATALE: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }

  return stats;
}

// ==================== VERIFICA POST-MIGRAZIONE ====================

async function verifyMigration() {
  log('\n📊 Verifica post-migrazione...\n');

  const clubs = await db.collection('clubs').get();
  
  for (const clubDoc of clubs.docs) {
    const clubId = clubDoc.id;
    const clubName = clubDoc.data().name;
    
    log(`🏢 Club: ${clubName} (${clubId})`);
    
    const clubUsersSnap = await db.collection('clubs').doc(clubId).collection('users').get();
    
    let linkedCount = 0;
    let notLinkedCount = 0;
    
    clubUsersSnap.forEach((userDoc) => {
      const data = userDoc.data();
      if (data.linkedUserId) {
        linkedCount++;
      } else {
        notLinkedCount++;
      }
    });
    
    log(`   👥 Totale utenti: ${clubUsersSnap.size}`);
    log(`   🔗 Con linkedUserId: ${linkedCount}`);
    log(`   ❌ Senza linkedUserId: ${notLinkedCount}\n`);
  }
}

// ==================== MAIN ====================

async function main() {
  try {
    // Crea cartella backup se non esiste
    const fs = await import('fs/promises');
    try {
      await fs.mkdir(join(__dirname, 'backups'), { recursive: true });
    } catch (e) {
      // Cartella già esiste
    }

    // Esegui migrazione
    const stats = await migrateAffiliations();

    // Report finale
    console.log(`
${'='.repeat(60)}
📊 REPORT FINALE MIGRAZIONE
${'='.repeat(60)}

📦 Affiliations totali:     ${stats.totalAffiliations}
✅ Affiliations approvate:  ${stats.approved}
🔄 Migrate:                 ${stats.migrated}
   └─ 📝 Create:            ${stats.created}
   └─ ♻️  Updated:           ${stats.updated}
⏭️  Skipped:                ${stats.skipped}
❌ Errori:                  ${stats.errors}

${'='.repeat(60)}
`);

    if (stats.errors > 0) {
      log('⚠️  Ci sono stati errori. Controlla i log sopra.', 'warning');
    }

    if (DRY_RUN) {
      log('🔍 NOTA: Questa è stata una simulazione (--dry-run)', 'warning');
      log('   Rimuovi --dry-run per applicare le modifiche', 'info');
    } else {
      log('✅ MIGRAZIONE COMPLETATA!', 'success');
      
      // Verifica
      await verifyMigration();
      
      log('\n📋 PROSSIMI PASSI:', 'info');
      log('   1. Verifica i dati in Firestore console');
      log('   2. Testa login e accesso club');
      log('   3. Se tutto ok, esegui 10-delete-affiliations.js');
    }

    // Salva report dettagliato
    await fs.writeFile(
      join(__dirname, `migration-report-${Date.now()}.json`),
      JSON.stringify(stats, null, 2)
    );

  } catch (error) {
    log('ERRORE FATALE:', 'error');
    console.error(error);
    process.exit(1);
  }
}

// Esegui
main();
