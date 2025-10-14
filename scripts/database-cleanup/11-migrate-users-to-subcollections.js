#!/usr/bin/env node

/**
 * =====================================================
 * SCRIPT 11: MIGRAZIONE UTENTI → SUBCOLLECTIONS
 * =====================================================
 *
 * Migra tutti i dati utente dalle collezioni root alle subcollections dei club
 *
 * COLLEZIONI ROOT DA MIGRARE:
 * - /users/ → clubs/{clubId}/users/
 * - /profiles/ → clubs/{clubId}/profiles/
 * - /affiliations/ → linkedUserId in clubs/{clubId}/users/
 *
 * STRATEGIA:
 * 1. Analizza dati attuali in root collections
 * 2. Per ogni utente/affiliazione, determina il club di appartenenza
 * 3. Migra i dati nelle subcollections appropriate
 * 4. Verifica integrità post-migrazione
 *
 * SICUREZZA:
 * - --dry-run: Simula senza modificare
 * - Backup completo di tutte le collezioni coinvolte
 * - Rollback possibile se qualcosa va storto
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
🔄 MIGRAZIONE UTENTI → SUBCOLLECTIONS
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

// ==================== ANALISI DATI ATTUALI ====================

async function analyzeCurrentData() {
  log('📊 Analisi dati attuali...\n');

  const analysis = {
    rootUsers: 0,
    rootProfiles: 0,
    rootAffiliations: 0,
    clubUsers: 0,
    clubProfiles: 0,
    clubs: [],
  };

  // Conta documenti root
  analysis.rootUsers = (await db.collection('users').count().get()).data().count;
  analysis.rootProfiles = (await db.collection('profiles').count().get()).data().count;
  analysis.rootAffiliations = (await db.collection('affiliations').count().get()).data().count;

  log(`📦 Root collections:`);
  log(`   /users/: ${analysis.rootUsers} documenti`);
  log(`   /profiles/: ${analysis.rootProfiles} documenti`);
  log(`   /affiliations/: ${analysis.rootAffiliations} documenti`);

  // Analizza club esistenti
  const clubsSnap = await db.collection('clubs').get();
  for (const clubDoc of clubsSnap.docs) {
    const clubId = clubDoc.id;
    const clubName = clubDoc.data().name || 'N/A';

    const clubUsers = (await clubDoc.ref.collection('users').count().get()).data().count;
    const clubProfiles = (await clubDoc.ref.collection('profiles').count().get()).data().count;

    analysis.clubs.push({
      id: clubId,
      name: clubName,
      users: clubUsers,
      profiles: clubProfiles,
    });

    analysis.clubUsers += clubUsers;
    analysis.clubProfiles += clubProfiles;
  }

  log(`🏢 Club esistenti: ${analysis.clubs.length}`);
  analysis.clubs.forEach(club => {
    log(`   ${club.name} (${club.id}): ${club.users} users, ${club.profiles} profiles`);
  });

  log(`📊 Totale subcollections:`);
  log(`   Club users: ${analysis.clubUsers}`);
  log(`   Club profiles: ${analysis.clubProfiles}`);

  return analysis;
}

// ==================== DETERMINAZIONE CLUB DI APPARTENENZA ====================

async function determineClubMembership() {
  log('\n🔍 Determinazione club di appartenenza...\n');

  const memberships = {
    byUserId: new Map(), // userId -> clubId
    byEmail: new Map(),  // email -> clubId
    orphaned: [],        // utenti senza club
  };

  // 1. Da affiliations approvate
  const affiliationsSnap = await db.collection('affiliations').where('status', '==', 'approved').get();

  affiliationsSnap.forEach(doc => {
    const { userId, clubId, userEmail } = doc.data();
    memberships.byUserId.set(userId, clubId);
    if (userEmail) {
      memberships.byEmail.set(userEmail, clubId);
    }
    verboseLog(`Affiliation: ${userId} → ${clubId}`);
  });

  log(`✅ Affiliations: ${affiliationsSnap.size} memberships determinate`);

  // 2. Da club-users esistenti (legacy)
  const clubsSnap = await db.collection('clubs').get();
  for (const clubDoc of clubsSnap.docs) {
    const clubUsersSnap = await clubDoc.ref.collection('club-users').get();
    clubUsersSnap.forEach(doc => {
      const data = doc.data();
      const userId = data.userId || doc.id;
      memberships.byUserId.set(userId, clubDoc.id);
      if (data.userEmail) {
        memberships.byEmail.set(data.userEmail, clubDoc.id);
      }
      verboseLog(`Club-user: ${userId} → ${clubDoc.id}`);
    });
  }

  // 3. Identifica utenti orfani
  const usersSnap = await db.collection('users').get();
  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    const userEmail = userDoc.data().email;

    if (!memberships.byUserId.has(userId) && (!userEmail || !memberships.byEmail.has(userEmail))) {
      memberships.orphaned.push({
        userId,
        email: userEmail,
        data: userDoc.data(),
      });
    }
  }

  log(`⚠️ Utenti orfani: ${memberships.orphaned.length}`);

  return memberships;
}

// ==================== MIGRAZIONE DATI ====================

async function migrateUsers(memberships) {
  log('\n🔄 Inizio migrazione utenti...\n');

  const stats = {
    migrated: 0,
    skipped: 0,
    errors: 0,
    details: [],
  };

  // 1. Migra affiliations approvate
  const affiliationsSnap = await db.collection('affiliations').where('status', '==', 'approved').get();

  for (const affiliationDoc of affiliationsSnap.docs) {
    const affiliationData = affiliationDoc.data();
    const { userId, clubId, role, userEmail, userName } = affiliationData;

    try {
      verboseLog(`Migrating affiliation: ${userId} → club ${clubId}`);

      // Verifica se club user già esiste
      const clubUsersRef = db.collection('clubs').doc(clubId).collection('users');
      const existingQuery = await clubUsersRef.where('linkedUserId', '==', userId).get();

      if (!existingQuery.empty) {
        log(`⏭️ Skipped: Club user già esistente per ${userId}`, 'warning');
        stats.skipped++;
        continue;
      }

      // Crea nuovo club user
      const clubUserData = {
        linkedUserId: userId,
        email: userEmail || '',
        userName: userName || '',
        role: role || 'member',
        status: 'active',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        migratedFromAffiliation: true,
        migratedAt: FieldValue.serverTimestamp(),
        source: 'affiliation_migration',
      };

      if (!DRY_RUN) {
        await clubUsersRef.add(clubUserData);
      }

      stats.migrated++;
      log(`✅ Migrated affiliation: ${userId} → ${clubId}`, 'success');

      stats.details.push({
        type: 'AFFILIATION',
        userId,
        clubId,
        action: 'MIGRATED',
      });

    } catch (error) {
      stats.errors++;
      log(`❌ Error migrating affiliation ${userId}: ${error.message}`, 'error');
      stats.details.push({
        type: 'AFFILIATION',
        userId,
        clubId,
        action: 'ERROR',
        error: error.message,
      });
    }
  }

  // 2. Migra profili orfani (da profiles/)
  const profilesSnap = await db.collection('profiles').get();

  for (const profileDoc of profilesSnap.docs) {
    const profileId = profileDoc.id;
    const profileData = profileDoc.data();

    try {
      // Determina club di appartenenza
      let clubId = null;

      // Prima cerca per userId
      if (memberships.byUserId.has(profileId)) {
        clubId = memberships.byUserId.get(profileId);
      }
      // Poi per email
      else if (profileData.email && memberships.byEmail.has(profileData.email)) {
        clubId = memberships.byEmail.get(profileData.email);
      }

      if (!clubId) {
        // Profilo orfano - skip per ora
        log(`⏭️ Skipped orphan profile: ${profileId}`, 'warning');
        stats.skipped++;
        continue;
      }

      verboseLog(`Migrating profile: ${profileId} → club ${clubId}`);

      // Verifica se profilo già esiste nel club
      const clubProfilesRef = db.collection('clubs').doc(clubId).collection('profiles');
      const existingProfile = await clubProfilesRef.doc(profileId).get();

      if (existingProfile.exists) {
        log(`⏭️ Skipped: Profile già esistente ${profileId} in club ${clubId}`, 'warning');
        stats.skipped++;
        continue;
      }

      // Migra il profilo
      const migratedProfile = {
        ...profileData,
        migratedAt: FieldValue.serverTimestamp(),
        migratedFrom: 'root_profiles',
      };

      if (!DRY_RUN) {
        await clubProfilesRef.doc(profileId).set(migratedProfile);
      }

      stats.migrated++;
      log(`✅ Migrated profile: ${profileId} → ${clubId}`, 'success');

      stats.details.push({
        type: 'PROFILE',
        profileId,
        clubId,
        action: 'MIGRATED',
      });

    } catch (error) {
      stats.errors++;
      log(`❌ Error migrating profile ${profileId}: ${error.message}`, 'error');
      stats.details.push({
        type: 'PROFILE',
        profileId,
        action: 'ERROR',
        error: error.message,
      });
    }
  }

  return stats;
}

// ==================== VERIFICA POST-MIGRAZIONE ====================

async function verifyMigration() {
  log('\n📊 Verifica post-migrazione...\n');

  const verification = {
    rootCollections: {},
    subcollections: {},
    consistency: true,
  };

  // Verifica collezioni root (dovrebbero essere ancora lì)
  verification.rootCollections.users = (await db.collection('users').count().get()).data().count;
  verification.rootCollections.profiles = (await db.collection('profiles').count().get()).data().count;
  verification.rootCollections.affiliations = (await db.collection('affiliations').count().get()).data().count;

  log('📦 Root collections after migration:');
  log(`   /users/: ${verification.rootCollections.users}`);
  log(`   /profiles/: ${verification.rootCollections.profiles}`);
  log(`   /affiliations/: ${verification.rootCollections.affiliations}`);

  // Verifica subcollections
  const clubsSnap = await db.collection('clubs').get();
  let totalClubUsers = 0;
  let totalClubProfiles = 0;

  for (const clubDoc of clubsSnap.docs) {
    const clubUsers = (await clubDoc.ref.collection('users').count().get()).data().count;
    const clubProfiles = (await clubDoc.ref.collection('profiles').count().get()).data().count;

    totalClubUsers += clubUsers;
    totalClubProfiles += clubProfiles;

    log(`🏢 ${clubDoc.data().name} (${clubDoc.id}):`);
    log(`   users: ${clubUsers}, profiles: ${clubProfiles}`);
  }

  verification.subcollections.users = totalClubUsers;
  verification.subcollections.profiles = totalClubProfiles;

  log(`\n📊 Totali:`);
  log(`   Club users: ${totalClubUsers}`);
  log(`   Club profiles: ${totalClubProfiles}`);

  return verification;
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

    // 1. BACKUP di tutte le collezioni coinvolte
    log('📦 Step 1: Backup collezioni...');
    await createBackup(db.collection('users'), `users-backup-${Date.now()}.json`);
    await createBackup(db.collection('profiles'), `profiles-backup-${Date.now()}.json`);
    await createBackup(db.collection('affiliations'), `affiliations-backup-${Date.now()}.json`);

    // 2. Analisi dati attuali
    log('📊 Step 2: Analisi dati attuali...');
    const analysis = await analyzeCurrentData();

    // 3. Determinazione memberships
    log('🔍 Step 3: Determinazione club memberships...');
    const memberships = await determineClubMembership();

    // 4. Esegui migrazione
    log('🔄 Step 4: Esecuzione migrazione...');
    const stats = await migrateUsers(memberships);

    // 5. Verifica
    log('📊 Step 5: Verifica post-migrazione...');
    const verification = await verifyMigration();

    // Report finale
    console.log(`
${'='.repeat(60)}
📊 REPORT FINALE MIGRAZIONE UTENTI
${'='.repeat(60)}

📦 Dati analizzati:
   Root users:      ${analysis.rootUsers}
   Root profiles:   ${analysis.rootProfiles}
   Root affiliations: ${analysis.rootAffiliations}
   Club esistenti:  ${analysis.clubs.length}

🔄 Migrazione:
   Migrated:        ${stats.migrated}
   Skipped:         ${stats.skipped}
   Errors:          ${stats.errors}

📊 Post-migrazione:
   Root users:      ${verification.rootCollections.users}
   Root profiles:   ${verification.rootCollections.profiles}
   Club users:      ${verification.subcollections.users}
   Club profiles:   ${verification.subcollections.profiles}

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

      log('\n📋 PROSSIMI PASSI:', 'info');
      log('   1. Verifica i dati migrati in Firestore console');
      log('   2. Aggiorna il codice per usare solo subcollections');
      log('   3. Testa l\'applicazione');
      log('   4. Se tutto ok, procedi con pulizia root collections');
    }

    // Salva report dettagliato
    const report = {
      timestamp: new Date().toISOString(),
      analysis,
      memberships: {
        byUserId: Object.fromEntries(memberships.byUserId),
        byEmail: Object.fromEntries(memberships.byEmail),
        orphanedCount: memberships.orphaned.length,
      },
      stats,
      verification,
    };

    await fs.writeFile(
      join(__dirname, `user-migration-report-${Date.now()}.json`),
      JSON.stringify(report, null, 2)
    );

  } catch (error) {
    log('ERRORE FATALE:', 'error');
    console.error(error);
    process.exit(1);
  }
}

// Esegui
main();