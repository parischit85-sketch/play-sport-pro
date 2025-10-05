/**
 * SCRIPT DA ESEGUIRE NELLA CONSOLE DEL BROWSER
 * 
 * Questo script rimuove le fasce instructor duplicate dal lessonConfig.
 * Le fasce con source='instructor' devono vivere SOLO in Firestore,
 * non nel lessonConfig.timeSlots
 * 
 * ISTRUZIONI:
 * 1. Apri http://localhost:5173 (o il sito di produzione)
 * 2. Login come admin club
 * 3. Apri DevTools (F12)
 * 4. Vai nella tab Console
 * 5. Copia e incolla TUTTO questo script
 * 6. Premi Invio
 */

(async function cleanupInstructorSlots() {
  console.log('🧹 === PULIZIA FASCE INSTRUCTOR DAL LESSON CONFIG ===\n');

  try {
    // Importa Firebase
    const { db } = await import('./src/lib/firebase.js');
    const { doc, getDoc, updateDoc } = await import('firebase/firestore');

    // ID del club da pulire
    const clubId = 'sporting-cat'; // Cambia se necessario

    console.log(`🏢 Pulendo club: ${clubId}\n`);

    // Leggi il documento del club
    const clubRef = doc(db, 'clubs', clubId);
    const clubSnap = await getDoc(clubRef);

    if (!clubSnap.exists()) {
      console.error('❌ Club non trovato!');
      return;
    }

    const clubData = clubSnap.data();
    console.log(`✅ Club trovato: ${clubData.name || clubId}`);

    // Controlla se ha lessonConfig.timeSlots
    if (!clubData.lessonConfig?.timeSlots) {
      console.log('⏭️  Nessun lessonConfig.timeSlots, niente da fare');
      return;
    }

    const timeSlots = clubData.lessonConfig.timeSlots;
    console.log(`📋 Fasce totali nel config: ${timeSlots.length}`);

    // Filtra via le fasce con source='instructor'
    const instructorSlots = timeSlots.filter(slot => slot.source === 'instructor');
    const cleanSlots = timeSlots.filter(slot => slot.source !== 'instructor');

    if (instructorSlots.length === 0) {
      console.log('✅ Nessuna fascia instructor da rimuovere. Tutto OK!');
      return;
    }

    console.log(`\n🗑️  Fasce instructor da rimuovere: ${instructorSlots.length}`);
    instructorSlots.forEach((slot, i) => {
      console.log(`   ${i + 1}. ID: ${slot.id}`);
      console.log(`      Instructors: ${slot.instructorIds?.join(', ') || 'N/A'}`);
      console.log(`      Time: ${slot.startTime} - ${slot.endTime}`);
      console.log(`      Active: ${slot.isActive ? '✅' : '❌'}`);
    });

    console.log(`\n✅ Fasce admin da mantenere: ${cleanSlots.length}`);

    // Chiedi conferma
    const confirmed = confirm(
      `Vuoi rimuovere ${instructorSlots.length} fascia/e instructor dal lessonConfig?\n\n` +
      `Queste fasce rimarranno disponibili in Firestore (clubs/${clubId}/timeSlots)\n` +
      `ma non saranno più duplicate nel lessonConfig.`
    );

    if (!confirmed) {
      console.log('❌ Operazione annullata dall\'utente');
      return;
    }

    // Aggiorna il documento
    console.log('\n💾 Aggiornamento in corso...');
    await updateDoc(clubRef, {
      'lessonConfig.timeSlots': cleanSlots,
    });

    console.log('✅ === PULIZIA COMPLETATA CON SUCCESSO ===');
    console.log(`\n📊 Riepilogo:`);
    console.log(`   - Fasce rimosse: ${instructorSlots.length}`);
    console.log(`   - Fasce mantenute: ${cleanSlots.length}`);
    console.log(`\n🔄 Ricarica la pagina per vedere le modifiche`);

  } catch (error) {
    console.error('❌ Errore durante la pulizia:', error);
    console.error(error.stack);
  }
})();
