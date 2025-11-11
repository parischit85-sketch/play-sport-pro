/**
 * Test del callable sendClubEmail usando Firebase Admin SDK
 * 
 * PREREQUISITO: Devi avere serviceAccountKey.json nella cartella functions/
 * 
 * USO: node test-sendClubEmail-production.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';

async function testSendClubEmail() {
  console.log('🧪 Test sendClubEmail callable in produzione');
  console.log('=' .repeat(50));

  // Carica service account
  const serviceAccount = JSON.parse(
    readFileSync('./functions/serviceAccountKey.json', 'utf8')
  );

  // Inizializza Admin SDK
  const app = initializeApp({
    credential: cert(serviceAccount),
    projectId: 'm-padelweb',
  });

  // Ottieni il tuo UID (dovrai essere autenticato)
  const auth = getAuth(app);
  
  // ⚠️ SOSTITUISCI CON IL TUO EMAIL
  const yourEmail = 'parischit85@gmail.com';
  
  try {
    const userRecord = await auth.getUserByEmail(yourEmail);
    const customToken = await auth.createCustomToken(userRecord.uid);
    
    console.log('✅ Token creato per utente:', userRecord.uid);
    console.log('📧 Email:', yourEmail);
    console.log('\n🔑 Custom Token:');
    console.log(customToken);
    console.log('\n📋 Usa questo token per chiamare la funzione dalla tua app o tramite HTTP:');
    console.log('\n   POST https://us-central1-m-padelweb.cloudfunctions.net/sendClubEmail');
    console.log('   Headers:');
    console.log('     Authorization: Bearer <ID_TOKEN>');
    console.log('     Content-Type: application/json');
    console.log('\n   Body:');
    console.log(JSON.stringify({
      data: {
        clubId: 'Kp8XqBRkF0yiPOZt0S7t',
        recipients: [yourEmail],
        subject: '🧪 Test email da callable',
        body: 'Questa è una email di test inviata dal callable sendClubEmail.\n\nSe ricevi questa email, il sistema funziona correttamente!',
        isHTML: false,
      }
    }, null, 2));

    console.log('\n💡 Per testare facilmente:');
    console.log('   1. Apri la Firebase Console: https://console.firebase.google.com/project/m-padelweb/functions');
    console.log('   2. Trova "sendClubEmail" nella lista');
    console.log('   3. Clicca sui tre puntini > "Test function"');
    console.log('   4. Incolla il payload dalla sezione Body sopra');
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

testSendClubEmail().catch(console.error);
