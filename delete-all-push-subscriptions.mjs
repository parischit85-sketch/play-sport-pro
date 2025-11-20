/**
 * Script per cancellare TUTTE le pushSubscriptions
 * Da eseguire via Cloud Shell o localmente con Firebase Admin
 * 
 * Uso:
 * node delete-all-push-subscriptions.mjs
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inizializza Firebase Admin specificando il project ID
const app = initializeApp({
  projectId: 'play-sport-pro'
});
const db = getFirestore(app);

async function deleteAllPushSubscriptions() {
  console.log('🗑️  Inizio cancellazione di TUTTE le pushSubscriptions...\n');

  try {
    const subscriptionsRef = db.collection('pushSubscriptions');
    const snapshot = await subscriptionsRef.get();

    if (snapshot.empty) {
      console.log('✅ Nessuna subscription trovata. Collection già vuota.\n');
      return;
    }

    console.log(`📊 Trovate ${snapshot.size} subscriptions da cancellare\n`);

    // Batch delete (max 500 per batch)
    const batchSize = 500;
    let deleted = 0;

    for (let i = 0; i < snapshot.docs.length; i += batchSize) {
      const batch = db.batch();
      const docsToDelete = snapshot.docs.slice(i, i + batchSize);

      docsToDelete.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      deleted += docsToDelete.length;

      console.log(`✅ Cancellate ${deleted}/${snapshot.size} subscriptions...`);
    }

    console.log('\n🎉 Tutte le pushSubscriptions sono state cancellate!\n');
    console.log('📋 Riepilogo:');
    console.log(`   - Totale cancellate: ${deleted}`);
    console.log(`   - Collection: pushSubscriptions`);
    console.log('\n✅ Gli utenti dovranno registrare nuovamente le loro push subscriptions.');
    console.log('   La prossima volta che aprono l\'app, verranno salvate con firebaseUid.\n');

  } catch (error) {
    console.error('\n❌ Errore durante la cancellazione:', error);
    process.exit(1);
  }
}

// Esegui
deleteAllPushSubscriptions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Errore fatale:', error);
    process.exit(1);
  });
