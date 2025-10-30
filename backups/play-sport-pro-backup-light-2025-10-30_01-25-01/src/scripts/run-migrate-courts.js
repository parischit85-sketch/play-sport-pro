// =============================================
// FILE: src/scripts/run-migrate-courts.js
// Script di esecuzione per migrare i campi legacy nel club
// =============================================
import { migrateCourtsToClubCollection } from './migrateCourtsToClubCollection.js';

// Sostituisci con l'ID del tuo club
const clubId = 'sporting-cat';

(async () => {
  try {
    await migrateCourtsToClubCollection(clubId);
    console.log('✅ Migrazione completata!');
  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error);
  }
  process.exit(0);
})();
