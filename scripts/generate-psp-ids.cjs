
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json'); // Assicurati di avere questo file

// Inizializza Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Caratteri per il codice (esclusi 0, O, I, 1 per evitare confusione)
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generatePspId() {
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
}

async function backfillPspIds() {
  console.log('🚀 Inizio generazione Psp ID per utenti esistenti...');
  
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  
  if (snapshot.empty) {
    console.log('❌ Nessun utente trovato.');
    return;
  }

  console.log(`📊 Trovati ${snapshot.size} utenti totali.`);

  const batchSize = 500;
  let batch = db.batch();
  let operationCounter = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  // Set per tenere traccia degli ID generati in questa run per evitare collisioni locali
  const generatedIds = new Set();

  // Prima, carichiamo tutti gli ID esistenti per evitare collisioni con quelli già nel DB
  const existingIdsSnapshot = await usersRef.where('pspId', '!=', null).get();
  existingIdsSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.pspId) generatedIds.add(data.pspId);
  });
  
  console.log(`ℹ️ ${generatedIds.size} Psp ID già esistenti nel database.`);

  for (const doc of snapshot.docs) {
    const userData = doc.data();

    // Se ha già un pspId, saltiamo
    if (userData.pspId) {
      skippedCount++;
      continue;
    }

    // Genera un ID unico
    let newPspId;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 100) {
      newPspId = generatePspId();
      if (!generatedIds.has(newPspId)) {
        isUnique = true;
        generatedIds.add(newPspId);
      }
      attempts++;
    }

    if (!isUnique) {
      console.error(`❌ Impossibile generare ID unico per utente ${doc.id} dopo 100 tentativi.`);
      continue;
    }

    // Aggiungi all'aggiornamento
    batch.update(doc.ref, { 
      pspId: newPspId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    operationCounter++;
    updatedCount++;

    // Esegui il batch se pieno
    if (operationCounter >= batchSize) {
      await batch.commit();
      console.log(`💾 Salvato batch di ${operationCounter} utenti...`);
      batch = db.batch();
      operationCounter = 0;
    }
  }

  // Commit finale per i rimanenti
  if (operationCounter > 0) {
    await batch.commit();
    console.log(`💾 Salvato batch finale di ${operationCounter} utenti.`);
  }

  console.log('✅ Operazione completata!');
  console.log(`- Utenti aggiornati: ${updatedCount}`);
  console.log(`- Utenti saltati (già avevano ID): ${skippedCount}`);
}

backfillPspIds().catch(console.error);
