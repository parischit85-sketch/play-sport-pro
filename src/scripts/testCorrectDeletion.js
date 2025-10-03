// Script per creare una versione corretta di ClubContext con il mapping degli ID
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase.node.js';

async function testCorrectDeletion() {
  const clubId = 'sporting-cat';
  
  // 1. Carica i campi per vedere il mapping
  const courtsRef = collection(db, 'clubs', clubId, 'courts');
  const courtsSnap = await getDocs(courtsRef);
  
  console.log('\n=== MAPPING ID INTERNO -> FIREBASE DOC ID ===');
  const idMapping = {};
  courtsSnap.forEach(doc => {
    const data = doc.data();
    const internalId = data.id;
    const firebaseId = doc.id;
    idMapping[internalId] = firebaseId;
    console.log(`${internalId} -> ${firebaseId} (${data.name})`);
  });
  
  console.log('\n=== TEST CANCELLAZIONE CORRETTA ===');
  console.log('Per cancellare un campo con ID interno "fik8xkna":');
  console.log(`- ID Firebase corretto: ${idMapping['fik8xkna']}`);
  console.log(`- Path corretto: clubs/${clubId}/courts/${idMapping['fik8xkna']}`);
  
  // Test che dovrebbe funzionare
  console.log('\n=== VERIFICA ESISTENZA DOCUMENTI ===');
  for (const [internalId, firebaseId] of Object.entries(idMapping)) {
    try {
      const docRef = doc(db, 'clubs', clubId, 'courts', firebaseId);
      console.log(`✅ Documento esistente: ${internalId} -> ${firebaseId}`);
    } catch (error) {
      console.log(`❌ Errore accesso: ${internalId} -> ${firebaseId}:`, error.message);
    }
  }
}

(async () => {
  try {
    await testCorrectDeletion();
  } catch (error) {
    console.error('❌ Errore:', error);
  }
  process.exit(0);
})();