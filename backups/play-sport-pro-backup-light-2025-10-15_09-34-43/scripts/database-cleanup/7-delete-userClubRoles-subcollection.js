#!/usr/bin/env node
/**
 * SCRIPT 7: Elimina subcollection userClubRoles (legacy - non usata)
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

async function deleteUserClubRolesSubcollection() {
  console.log('\n🗑️ ELIMINAZIONE SUBCOLLECTION userClubRoles\n');
  console.log('Questa subcollection NON è usata dal codice (legacy).\n');
  console.log('⏳ Attendere 3 secondi...\n');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Trova tutti i club
  const clubsSnapshot = await db.collection('clubs').get();
  
  let totalDeleted = 0;
  
  for (const clubDoc of clubsSnapshot.docs) {
    const clubId = clubDoc.id;
    console.log(`📁 Club: ${clubId}`);
    
    const subcollectionRef = db.collection('clubs').doc(clubId).collection('userClubRoles');
    const snapshot = await subcollectionRef.get();
    
    if (snapshot.empty) {
      console.log('   ✅ Già vuota\n');
      continue;
    }
    
    console.log(`   📦 Trovati ${snapshot.size} documenti`);
    
    // Elimina in batch
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    totalDeleted += snapshot.size;
    console.log(`   ✅ Eliminati ${snapshot.size} documenti\n`);
  }
  
  console.log(`🗑️ TOTALE ELIMINATI: ${totalDeleted} documenti\n`);
  
  // Verifica
  console.log('🔍 VERIFICA:\n');
  for (const clubDoc of clubsSnapshot.docs) {
    const count = (await db.collection('clubs').doc(clubDoc.id).collection('userClubRoles').count().get()).data().count;
    console.log(`${count === 0 ? '✅' : '⚠️'} ${clubDoc.id}/userClubRoles: ${count} documenti`);
  }
  
  console.log('\n✅ CLEANUP COMPLETATO\n');
}

deleteUserClubRolesSubcollection().catch(console.error);
