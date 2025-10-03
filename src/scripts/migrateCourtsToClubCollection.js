// =============================================
// FILE: src/scripts/migrateCourtsToClubCollection.js
// Script per migrare i campi legacy nel percorso globale 'courts' alla nuova collezione per club 'clubs/{clubId}/courts'
// =============================================

import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase.node.js';

/**
 * Migra tutti i campi legacy dal percorso globale 'courts' a 'clubs/{clubId}/courts',
 * e cancella i campi legacy dopo la copia.
 * @param {string} clubId - ID del club
 */
export const migrateCourtsToClubCollection = async (clubId) => {
  try {
    // 1. Carica tutti i campi legacy
    const legacyCourtsRef = collection(db, 'courts');
    const legacyCourtsSnapshot = await getDocs(legacyCourtsRef);
    const legacyCourts = legacyCourtsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    let migratedCount = 0;
    let deletedCount = 0;

    for (const court of legacyCourts) {
      // Migra solo i campi che appartengono al club
      if (court.clubId === clubId) {
        // 2. Copia il campo nella nuova collezione
        const newCourtRef = doc(db, 'clubs', clubId, 'courts', court.id);
        await setDoc(newCourtRef, {
          ...court,
          migratedAt: new Date().toISOString(),
        });
        migratedCount++;

        // 3. Cancella il campo legacy
        const legacyCourtRef = doc(db, 'courts', court.id);
        await deleteDoc(legacyCourtRef);
        deletedCount++;
        console.log(`✅ Campo migrato e cancellato: ${court.name} (${court.id})`);
      }
    }

    console.log(
      `✅ Migrazione completata: ${migratedCount} campi migrati, ${deletedCount} legacy cancellati.`
    );
    return { migratedCount, deletedCount };
  } catch (error) {
    console.error('❌ Errore durante la migrazione dei campi:', error);
    throw error;
  }
};

export default migrateCourtsToClubCollection;
