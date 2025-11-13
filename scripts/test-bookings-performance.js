#!/usr/bin/env node

/**
 * Script per testare le performance delle query con root collection
 * 
 * Verifica che le query siano < 300ms come target
 * 
 * Usage:
 *   node scripts/test-bookings-performance.js
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccountPath = join(__dirname, '..', 'serviceAccountKey.json');
let serviceAccount;

try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('❌ Errore caricamento serviceAccountKey.json');
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

/**
 * Misura tempo di esecuzione di una query
 */
async function benchmark(name, queryFn) {
  const startTime = Date.now();
  const result = await queryFn();
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  const status = duration < 300 ? '✅' : duration < 500 ? '⚠️' : '❌';
  
  console.log(`${status} ${name}`);
  console.log(`   Tempo: ${duration}ms`);
  console.log(`   Documenti: ${result.size}`);
  
  return { duration, size: result.size, ok: duration < 300 };
}

/**
 * Main function
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('⚡ TEST PERFORMANCE BOOKINGS QUERIES');
  console.log('='.repeat(60));
  console.log('Target: < 300ms per query\n');
  
  const results = [];
  
  // Get test data
  const clubsSnapshot = await db.collection('clubs').limit(1).get();
  if (clubsSnapshot.empty) {
    console.error('❌ Nessun club trovato nel database');
    process.exit(1);
  }
  const testClubId = clubsSnapshot.docs[0].id;
  
  const usersSnapshot = await db.collection('users').limit(1).get();
  if (usersSnapshot.empty) {
    console.error('❌ Nessun utente trovato nel database');
    process.exit(1);
  }
  const testUserId = usersSnapshot.docs[0].id;
  
  const today = new Date().toISOString().split('T')[0];
  
  console.log(`Test Club ID: ${testClubId}`);
  console.log(`Test User ID: ${testUserId}`);
  console.log(`Today: ${today}\n`);
  
  // TEST 1: User bookings (dashboard utente)
  console.log('📊 TEST 1: User Dashboard - Le mie prenotazioni');
  results.push(await benchmark(
    'Query: userId == X, order by date DESC, limit 20',
    () => db.collection('bookings')
      .where('userId', '==', testUserId)
      .orderBy('date', 'desc')
      .limit(20)
      .get()
  ));
  
  // TEST 2: User active bookings
  console.log('\n📊 TEST 2: User Active Bookings - Prenotazioni future');
  results.push(await benchmark(
    'Query: userId == X, status == confirmed, date >= today',
    () => db.collection('bookings')
      .where('userId', '==', testUserId)
      .where('status', '==', 'confirmed')
      .where('date', '>=', today)
      .orderBy('date', 'asc')
      .get()
  ));
  
  // TEST 3: Club today bookings (dashboard admin)
  console.log('\n📊 TEST 3: Club Admin - Prenotazioni di oggi');
  results.push(await benchmark(
    'Query: clubId == X, date == today',
    () => db.collection('bookings')
      .where('clubId', '==', testClubId)
      .where('date', '==', today)
      .get()
  ));
  
  // TEST 4: Club bookings range (statistiche admin)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);
  
  console.log('\n📊 TEST 4: Club Admin - Prenotazioni mese (30 giorni passati + 7 futuri)');
  results.push(await benchmark(
    'Query: clubId == X, date >= startDate, date <= endDate',
    () => db.collection('bookings')
      .where('clubId', '==', testClubId)
      .where('date', '>=', startDate.toISOString().split('T')[0])
      .where('date', '<=', endDate.toISOString().split('T')[0])
      .orderBy('date', 'asc')
      .get()
  ));
  
  // TEST 5: Club confirmed bookings (statistiche)
  console.log('\n📊 TEST 5: Club Stats - Solo prenotazioni confermate');
  results.push(await benchmark(
    'Query: clubId == X, status == confirmed, date >= today',
    () => db.collection('bookings')
      .where('clubId', '==', testClubId)
      .where('status', '==', 'confirmed')
      .where('date', '>=', today)
      .orderBy('date', 'asc')
      .get()
  ));
  
  // TEST 6: All bookings count (super admin)
  console.log('\n📊 TEST 6: Super Admin - Totale prenotazioni sistema');
  const countStart = Date.now();
  const countSnapshot = await db.collection('bookings').count().get();
  const countDuration = Date.now() - countStart;
  const countStatus = countDuration < 300 ? '✅' : countDuration < 500 ? '⚠️' : '❌';
  console.log(`${countStatus} Query: count(*)`);
  console.log(`   Tempo: ${countDuration}ms`);
  console.log(`   Totale documenti: ${countSnapshot.data().count}`);
  results.push({ duration: countDuration, ok: countDuration < 300 });
  
  // SUMMARY
  console.log('\n' + '='.repeat(60));
  console.log('📈 RISULTATI');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.ok).length;
  const failed = results.length - passed;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  
  console.log(`Test passati: ${passed}/${results.length}`);
  console.log(`Test falliti: ${failed}/${results.length}`);
  console.log(`Tempo medio: ${Math.round(avgDuration)}ms`);
  console.log(`Tempo massimo: ${Math.max(...results.map(r => r.duration))}ms`);
  console.log(`Tempo minimo: ${Math.min(...results.map(r => r.duration))}ms`);
  
  if (failed === 0) {
    console.log('\n✅ TUTTI I TEST PASSATI!');
    console.log('✅ Le query con root collection sono sufficientemente veloci.');
    console.log('✅ Puoi procedere con la rimozione della subcollection.');
  } else {
    console.log('\n⚠️ ALCUNI TEST HANNO SUPERATO IL TARGET');
    console.log('⚠️ Considera ottimizzazioni o verifica gli index.');
  }
  
  console.log('='.repeat(60) + '\n');
}

// Run
main()
  .then(() => {
    console.log('✅ Test completati');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Errore durante i test:', error);
    process.exit(1);
  });
