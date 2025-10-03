// Script per cercare dati "court" in tutte le collezioni principali di Firestore
import { collection, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase.node.js';

const mainCollections = [
  'courts',
  'legacyCourts',
  'oldCourts',
  'clubs',
  'settings',
  'leagues',
  'bookings',
  'matches',
  'tournaments',
  'lessons',
  'statsCache',
];

(async () => {
  try {
    for (const colName of mainCollections) {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) continue;
      console.log(`\n--- Collezione: ${colName} ---`);
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        // Cerca array o oggetti con chiave "court" o "courts"
        for (const key of Object.keys(data)) {
          if (/court/i.test(key)) {
            console.log(`Doc: ${docSnap.id} | Campo: ${key} | Valore:`, data[key]);
          }
        }
        // Cerca array di courts dentro club
        if (colName === 'clubs') {
          // Prova a leggere subcollection courts
          try {
            const courtsSubRef = collection(db, 'clubs', docSnap.id, 'courts');
            const courtsSubSnap = await getDocs(courtsSubRef);
            if (!courtsSubSnap.empty) {
              console.log(`Doc: ${docSnap.id} | Subcollection courts:`);
              courtsSubSnap.forEach(subDoc => {
                console.log(`  - ${subDoc.id}:`, subDoc.data());
              });
            }
          } catch (e) {}
        }
      }
    }
    console.log('\n--- Ricerca completata ---');
  } catch (error) {
    console.error('❌ Errore durante la ricerca:', error);
  }
  process.exit(0);
})();
