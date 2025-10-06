#!/usr/bin/env node
/**
 * SCRIPT 6: Elimina subcollections bookings dai club
 * 
 * Dopo aver modificato le dashboard admin per leggere dalla root collection,
 * eliminiamo le subcollections che non sono più necessarie.
 * 
 * Le dashboard ora usano:
 * query(collection(db, 'bookings'), where('clubId', '==', clubId))
 * invece di:
 * collection(db, 'clubs', clubId, 'bookings')
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../serviceAccount.json'), 'utf8')
);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

/**
 * Elimina subcollection bookings per un club
 */
async function deleteClubBookingsSubcollection(clubId) {
  console.log(`\n📁 Club: ${clubId}`);
  
  const subcollectionRef = db.collection('clubs').doc(clubId).collection('bookings');
  
  // Conta documenti
  const snapshot = await subcollectionRef.get();
  const total = snapshot.size;
  
  if (total === 0) {
    console.log('   ✅ Già vuota - SKIP');
    return { clubId, deleted: 0, skipped: true };
  }
  
  console.log(`   📦 Trovati ${total} documenti da eliminare`);
  
  let deleted = 0;
  let hasMore = true;
  
  while (hasMore) {
    const batch = db.batch();
    const docs = await subcollectionRef.limit(500).get();
    
    if (docs.empty) {
      hasMore = false;
      break;
    }
    
    docs.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    deleted += docs.size;
    console.log(`   🗑️ Eliminati ${deleted}/${total}...`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`   ✅ Completato: ${deleted} documenti eliminati`);
  
  return { clubId, deleted, skipped: false };
}

/**
 * Main
 */
async function main() {
  console.log('\n🗑️ ELIMINAZIONE SUBCOLLECTIONS BOOKINGS\n');
  console.log('Le dashboard admin ora leggono dalla root collection bookings/');
  console.log('Le subcollections non sono più necessarie.\n');
  console.log('⏳ Attendere 5 secondi prima di procedere...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Trova tutti i club
  const clubsSnapshot = await db.collection('clubs').get();
  console.log(`📊 Trovati ${clubsSnapshot.size} club\n`);
  
  const results = [];
  
  for (const clubDoc of clubsSnapshot.docs) {
    try {
      const result = await deleteClubBookingsSubcollection(clubDoc.id);
      results.push(result);
    } catch (error) {
      console.error(`❌ Errore per club ${clubDoc.id}:`, error.message);
      results.push({ clubId: clubDoc.id, deleted: 0, error: error.message });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY\n');
  
  const totalDeleted = results.reduce((sum, r) => sum + (r.deleted || 0), 0);
  const skipped = results.filter(r => r.skipped).length;
  const errors = results.filter(r => r.error).length;
  
  results.forEach(r => {
    const icon = r.error ? '❌' : r.skipped ? '⏭️' : '✅';
    console.log(`${icon} ${r.clubId}: ${r.deleted || 0} eliminati`);
    if (r.error) console.log(`   Error: ${r.error}`);
  });
  
  console.log(`\n🗑️ TOTALE ELIMINATI: ${totalDeleted} documenti`);
  console.log(`⏭️ Club skippati (già vuoti): ${skipped}`);
  console.log(`❌ Errori: ${errors}`);
  
  // Verifica finale
  console.log('\n🔍 VERIFICA FINALE:\n');
  
  for (const clubDoc of clubsSnapshot.docs) {
    const count = (await db.collection('clubs').doc(clubDoc.id).collection('bookings').count().get()).data().count;
    const status = count === 0 ? '✅' : '⚠️';
    console.log(`${status} ${clubDoc.id}/bookings: ${count} documenti`);
  }
  
  console.log('\n✅ CLEANUP COMPLETATO\n');
  console.log('Le dashboard admin ora usano la root collection bookings/');
  console.log('con query filtrate per clubId.\n');
}

main().catch(console.error);
