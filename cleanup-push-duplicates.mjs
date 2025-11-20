#!/usr/bin/env node
// =============================================
// Script per rimuovere duplicati da pushSubscriptions
// Mantiene solo la subscription più recente per ogni endpoint unico
// =============================================

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Inizializza Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountKey.json', 'utf8')
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function cleanupDuplicates() {
  console.log('🧹 Starting cleanup of duplicate push subscriptions...\n');

  try {
    // 1. Carica tutte le subscriptions
    const snapshot = await db.collection('pushSubscriptions').get();
    console.log(`📊 Total documents found: ${snapshot.size}`);

    if (snapshot.empty) {
      console.log('✅ No documents to clean up');
      return;
    }

    // 2. Raggruppa per endpoint (chiave unica)
    const subscriptionsByEndpoint = new Map();
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const endpoint = data.endpoint || data.subscription?.endpoint;
      
      if (!endpoint) {
        console.log(`⚠️  Document ${doc.id} has no endpoint, skipping`);
        return;
      }

      if (!subscriptionsByEndpoint.has(endpoint)) {
        subscriptionsByEndpoint.set(endpoint, []);
      }
      
      subscriptionsByEndpoint.get(endpoint).push({
        id: doc.id,
        data,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    console.log(`\n🔍 Found ${subscriptionsByEndpoint.size} unique endpoints`);

    // 3. Trova duplicati e prepara per eliminazione
    let totalDuplicates = 0;
    let totalToDelete = 0;
    const toDelete = [];

    for (const [endpoint, docs] of subscriptionsByEndpoint.entries()) {
      if (docs.length > 1) {
        totalDuplicates++;
        
        // Ordina per data più recente (updatedAt o createdAt)
        docs.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0);
          const dateB = new Date(b.updatedAt || b.createdAt || 0);
          return dateB - dateA; // Più recente prima
        });

        // Il primo è il più recente, mantienilo
        const toKeep = docs[0];
        const duplicates = docs.slice(1);
        
        console.log(`\n📌 Endpoint: ${endpoint.substring(0, 60)}...`);
        console.log(`   ✅ KEEP: ${toKeep.id} (${toKeep.updatedAt || toKeep.createdAt})`);
        
        duplicates.forEach((dup) => {
          console.log(`   ❌ DELETE: ${dup.id} (${dup.updatedAt || dup.createdAt})`);
          toDelete.push(dup.id);
          totalToDelete++;
        });
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total documents: ${snapshot.size}`);
    console.log(`   Unique endpoints: ${subscriptionsByEndpoint.size}`);
    console.log(`   Endpoints with duplicates: ${totalDuplicates}`);
    console.log(`   Documents to delete: ${totalToDelete}`);

    if (toDelete.length === 0) {
      console.log('\n✅ No duplicates found! Collection is clean.');
      return;
    }

    // 4. Chiedi conferma
    console.log(`\n⚠️  About to delete ${toDelete.length} duplicate documents.`);
    console.log('   Press Ctrl+C to cancel or wait 5 seconds to proceed...');
    
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 5. Elimina in batch (max 500 per batch)
    const batchSize = 500;
    let deleted = 0;

    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batch = db.batch();
      const currentBatch = toDelete.slice(i, i + batchSize);

      currentBatch.forEach((docId) => {
        batch.delete(db.collection('pushSubscriptions').doc(docId));
      });

      await batch.commit();
      deleted += currentBatch.length;
      console.log(`   🗑️  Deleted ${deleted}/${toDelete.length} documents...`);
    }

    console.log(`\n✅ Cleanup complete!`);
    console.log(`   Deleted: ${deleted} duplicate documents`);
    console.log(`   Remaining: ${snapshot.size - deleted} unique subscriptions`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Esegui cleanup
cleanupDuplicates()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
