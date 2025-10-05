#!/usr/bin/env node
/**
 * Script per rimuovere fasce instructor duplicate dal lessonConfig
 * Le fasce con source='instructor' devono vivere SOLO in Firestore,
 * non nel lessonConfig.timeSlots
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inizializza Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function cleanupInstructorSlots() {
  try {
    console.log('🧹 === PULIZIA FASCE INSTRUCTOR DAL LESSON CONFIG ===\n');

    // Prendi tutti i club
    const clubsSnapshot = await db.collection('clubs').get();
    console.log(`📊 Club trovati: ${clubsSnapshot.size}\n`);

    for (const clubDoc of clubsSnapshot.docs) {
      const clubId = clubDoc.id;
      const clubData = clubDoc.data();
      const clubName = clubData.name || clubId;

      console.log(`\n🏢 Club: ${clubName} (${clubId})`);

      // Controlla se ha lessonConfig.timeSlots
      if (!clubData.lessonConfig?.timeSlots) {
        console.log('   ⏭️  Nessun lessonConfig.timeSlots, skip');
        continue;
      }

      const timeSlots = clubData.lessonConfig.timeSlots;
      console.log(`   📋 Fasce totali nel config: ${timeSlots.length}`);

      // Filtra via le fasce con source='instructor'
      const instructorSlots = timeSlots.filter(slot => slot.source === 'instructor');
      const cleanSlots = timeSlots.filter(slot => slot.source !== 'instructor');

      if (instructorSlots.length === 0) {
        console.log('   ✅ Nessuna fascia instructor da rimuovere');
        continue;
      }

      console.log(`   🗑️  Fasce instructor da rimuovere: ${instructorSlots.length}`);
      instructorSlots.forEach(slot => {
        console.log(`      - ID: ${slot.id}, Instructor: ${slot.instructorIds?.join(', ') || 'N/A'}`);
      });

      console.log(`   ✅ Fasce admin da mantenere: ${cleanSlots.length}`);

      // Aggiorna il documento
      await clubDoc.ref.update({
        'lessonConfig.timeSlots': cleanSlots,
      });

      console.log(`   💾 Config aggiornato per ${clubName}`);
    }

    console.log('\n✅ === PULIZIA COMPLETATA ===');
    process.exit(0);
  } catch (error) {
    console.error('❌ Errore durante la pulizia:', error);
    process.exit(1);
  }
}

cleanupInstructorSlots();
