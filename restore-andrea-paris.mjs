/**
 * Script per ripristinare il profilo di Andrea Paris
 * 
 * PROBLEMA:
 * - Document ID: FrewudyR6jSesgzYIe5do1iJKJf1
 * - Campo "id" attuale: mwLUarfeMkQqKMmDZ1qPPMyN7mZ2 (SBAGLIATO)
 * - Deve essere: FrewudyR6jSesgzYIe5do1iJKJf1
 * 
 * SOLUZIONE:
 * - Ripristina campo "id" = Document ID
 * - Mantieni userId = mwLUarfeMkQqKMmDZ1qPPMyN7mZ2 (per login/push)
 * 
 * Esegui via Firebase Console o Cloud Functions:
 */

// METODO 1: Via Firestore Console
// https://console.firebase.google.com/project/m-padelweb/firestore
// 
// 1. Vai a: clubs/sporting-cat/users/FrewudyR6jSesgzYIe5do1iJKJf1
// 2. Modifica il campo "id" da "mwLUarfeMkQqKMmDZ1qPPMyN7mZ2" a "FrewudyR6jSesgzYIe5do1iJKJf1"
// 3. Salva

// METODO 2: Via Cloud Function (callable)
export const restoreAndreaParisProfile = async (db) => {
  const clubId = 'sporting-cat';
  const docId = 'FrewudyR6jSesgzYIe5do1iJKJf1';
  const userId = 'mwLUarfeMkQqKMmDZ1qPPMyN7mZ2';

  console.log('🔧 Ripristino profilo Andrea Paris...\n');

  const profileRef = db.collection('clubs').doc(clubId)
    .collection('users').doc(docId);

  const before = await profileRef.get();
  console.log('Prima:', before.data());

  await profileRef.update({
    id: docId,  // RIPRISTINA al Document ID
    userId: userId,  // Mantieni Firebase Auth UID
    // Aggiungi timestamp per tracking
    restoredAt: new Date().toISOString(),
    restoredReason: 'Ripristino id al Document ID per preservare matches/statistiche'
  });

  const after = await profileRef.get();
  console.log('\nDopo:', after.data());
  console.log('\n✅ Profilo ripristinato con successo!');

  return {
    success: true,
    docId,
    before: before.data(),
    after: after.data()
  };
};

// METODO 3: Comando Firestore diretto
console.log(`
🔧 COMANDO PER RIPRISTINARE ANDREA PARIS:

await db.collection('clubs').doc('sporting-cat')
  .collection('users').doc('FrewudyR6jSesgzYIe5do1iJKJf1')
  .update({
    id: 'FrewudyR6jSesgzYIe5do1iJKJf1',
    userId: 'mwLUarfeMkQqKMmDZ1qPPMyN7mZ2',
    restoredAt: new Date().toISOString()
  });

✅ Questo ripristinerà le statistiche e i matches!
`);
