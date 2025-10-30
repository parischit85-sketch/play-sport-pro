#!/usr/bin/env node

/**
 * =============================================
 * BACKUP COMPLETO DATABASE
 * =============================================
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Inizializza Firebase Admin
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../serviceAccount.json'), 'utf8')
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function createBackup(collection, filename) {
  console.log(`📦 Creazione backup: ${filename}...`);
  const snapshot = await collection.get();
  const backup = {};
  snapshot.forEach((doc) => {
    backup[doc.id] = doc.data();
  });

  fs.writeFileSync(path.join(__dirname, 'backups', filename), JSON.stringify(backup, null, 2));
  console.log(`✅ Backup salvato: ${snapshot.size} documenti`);
  return snapshot.size;
}

async function backupSubcollections() {
  console.log('🏛️ Backup sottocollezioni club...');

  const clubsSnapshot = await db.collection('clubs').get();
  let totalSubcollections = 0;

  for (const clubDoc of clubsSnapshot.docs) {
    const clubId = clubDoc.id;
    const clubName = clubDoc.data().name || clubId;

    console.log(`🏢 Backup club: ${clubName} (${clubId})`);

    const subcollections = ['users', 'profiles', 'matches', 'courts'];

    for (const subName of subcollections) {
      try {
        const subSnapshot = await clubDoc.ref.collection(subName).get();
        if (!subSnapshot.empty) {
          const data = {};
          subSnapshot.forEach((doc) => {
            data[doc.id] = doc.data();
          });

          const filename = `clubs-${clubId}-${subName}-backup-${Date.now()}.json`;
          fs.writeFileSync(path.join(__dirname, 'backups', filename), JSON.stringify(data, null, 2));

          console.log(`  ✅ ${subName}: ${subSnapshot.size} documenti`);
          totalSubcollections += subSnapshot.size;
        }
      } catch (error) {
        console.log(`  ⚠️ ${subName}: collezione non trovata`);
      }
    }
  }

  return totalSubcollections;
}

async function main() {
  console.log('🚀 Avvio backup completo database...');

  const timestamp = Date.now();
  const stats = {};

  // Backup collezioni radice
  console.log('📦 Backup collezioni radice...');
  stats.users = await createBackup(db.collection('users'), `users-backup-${timestamp}.json`);
  stats.profiles = await createBackup(db.collection('profiles'), `profiles-backup-${timestamp}.json`);
  stats.affiliations = await createBackup(db.collection('affiliations'), `affiliations-backup-${timestamp}.json`);
  stats.clubs = await createBackup(db.collection('clubs'), `clubs-backup-${timestamp}.json`);
  stats.bookings = await createBackup(db.collection('bookings'), `bookings-backup-${timestamp}.json`);

  // Backup sottocollezioni
  stats.subcollections = await backupSubcollections();

  console.log('🎉 Backup completato!');
  console.log('📊 Statistiche:', stats);

  // Crea riepilogo
  const summary = {
    timestamp: new Date().toISOString(),
    stats,
    totalDocuments: Object.values(stats).reduce((sum, count) => sum + count, 0),
    note: 'Backup completo dopo implementazione Opzione A (single source of truth)'
  };

  const summaryFile = `backup-summary-${timestamp}.json`;
  fs.writeFileSync(path.join(__dirname, 'backups', summaryFile), JSON.stringify(summary, null, 2));
  console.log(`📋 Riepilogo salvato: ${summaryFile}`);
}

main().catch(console.error);