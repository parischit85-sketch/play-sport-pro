#!/usr/bin/env node
/**
 * SCRIPT 4: Elimina collezione root /bookings/
 * Da usare SOLO DOPO aver migrato tutti i bookings alle subcollections
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inizializza Firebase
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../serviceAccount.json'), 'utf8')
);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function deleteRootBookings() {
  console.log('\n🗑️ ELIMINAZIONE ROOT BOOKINGS COLLECTION\n');
  console.log('⚠️ Attendere 5 secondi prima di eliminare...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const collectionRef = db.collection('bookings');
  let totalDeleted = 0;
  let hasMore = true;
  
  while (hasMore) {
    const snapshot = await collectionRef.limit(500).get();
    
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
    
    console.log(`🗑️ Eliminati ${totalDeleted} documenti...`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n✅ TOTALE ELIMINATI: ${totalDeleted} bookings dalla root collection\n`);
}

deleteRootBookings().catch(console.error);
