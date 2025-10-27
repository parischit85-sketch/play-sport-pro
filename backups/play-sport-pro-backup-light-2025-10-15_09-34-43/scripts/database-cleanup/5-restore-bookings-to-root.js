#!/usr/bin/env node
/**
 * SCRIPT URGENTE: Ripristina bookings dalla subcollection alla root
 * ERRORE: Abbiamo eliminato i bookings dalla root, ma il sistema usa quella!
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

async function restoreBookingsToRoot() {
  console.log('\n🚨 RIPRISTINO URGENTE BOOKINGS\n');
  console.log('Copiando da clubs/sporting-cat/bookings/ → bookings/\n');
  
  // 1. Leggi tutti i bookings dalla subcollection
  const subcollectionRef = db.collection('clubs').doc('sporting-cat').collection('bookings');
  const snapshot = await subcollectionRef.get();
  
  console.log(`📦 Trovati ${snapshot.size} bookings in subcollection\n`);
  
  // 2. Copia nella root collection mantenendo gli stessi ID
  let copied = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const doc of snapshot.docs) {
    try {
      const data = doc.data();
      const rootRef = db.collection('bookings').doc(doc.id);
      
      // Controlla se esiste già
      const exists = await rootRef.get();
      if (exists.exists) {
        console.log(`⏭️ [${doc.id}] Già esistente - SKIP`);
        skipped++;
        continue;
      }
      
      // Copia il documento
      await rootRef.set(data);
      console.log(`✅ [${doc.id}] Copiato`);
      copied++;
      
    } catch (error) {
      console.error(`❌ [${doc.id}] Errore: ${error.message}`);
      errors++;
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 RISULTATI:');
  console.log(`✅ Copiati: ${copied}`);
  console.log(`⏭️ Già esistenti: ${skipped}`);
  console.log(`❌ Errori: ${errors}`);
  console.log(`📦 Totale root bookings: ${copied + skipped}`);
  console.log(`${'='.repeat(60)}\n`);
  
  // 3. Verifica finale
  const rootSnapshot = await db.collection('bookings').count().get();
  console.log(`✅ VERIFICA: bookings/ contiene ${rootSnapshot.data().count} documenti\n`);
}

restoreBookingsToRoot().catch(console.error);
