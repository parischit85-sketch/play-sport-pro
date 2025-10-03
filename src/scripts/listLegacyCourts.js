// Script per elencare tutti i campi legacy nella collezione globale 'courts'
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase.node.js';

(async () => {
  try {
    const legacyCourtsRef = collection(db, 'courts');
    const legacyCourtsSnapshot = await getDocs(legacyCourtsRef);
    const legacyCourts = legacyCourtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`\n--- Campi legacy trovati nella collezione globale 'courts': ---`);
    legacyCourts.forEach(court => {
      console.log(`ID: ${court.id} | Nome: ${court.name || '(senza nome)'} | clubId: ${court.clubId || '(n.d.)'}`);
    });
    console.log(`\nTotale: ${legacyCourts.length}`);
  } catch (error) {
    console.error('❌ Errore durante la lettura dei campi legacy:', error);
  }
  process.exit(0);
})();
