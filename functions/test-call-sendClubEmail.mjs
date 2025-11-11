/**
 * Script di test per sendClubEmail callable
 * 
 * PREREQUISITO: Devi avere un club reale in Firestore dove sei admin
 * 
 * USO:
 * 1. Modifica CLUB_ID con l'ID del tuo club
 * 2. Modifica TEST_RECIPIENT con la tua email
 * 3. Ottieni il token ID: firebase login:ci e copia il token
 * 4. Esegui: FIREBASE_TOKEN=<token> node test-call-sendClubEmail.mjs
 */

async function main() {
  console.log('🧪 Test sendClubEmail callable');
  console.log('================================\n');

  // ⚠️ MODIFICA QUESTI VALORI
  const CLUB_ID = 'Kp8XqBRkF0yiPOZt0S7t'; // Sostituisci con un club ID reale dove sei admin
  const TEST_RECIPIENT = 'parischit85@gmail.com'; // Sostituisci con la tua email

  const payload = {
    clubId: CLUB_ID,
    recipients: [TEST_RECIPIENT],
    subject: '🧪 Test email da callable',
    body: 'Questa è una email di test inviata dal callable sendClubEmail.\n\nSe ricevi questa email, il sistema funziona correttamente!',
    isHTML: false,
  };

  console.log('📋 Payload:', JSON.stringify(payload, null, 2));
  console.log('\n⚠️  IMPORTANTE: Verifica di essere admin del club:', CLUB_ID);
  console.log('📧 Email destinatario:', TEST_RECIPIENT);
  console.log('\n🚀 Per eseguire il test:');
  console.log('   1. Vai su https://console.firebase.google.com/project/m-padelweb/functions');
  console.log('   2. Trova "sendClubEmail" e clicca "Test function"');
  console.log('   3. Copia e incolla questo payload nella console:\n');
  console.log(JSON.stringify(payload, null, 2));
  console.log('\n✅ Oppure usa il Firebase CLI:');
  console.log(`   firebase functions:call sendClubEmail --data='${JSON.stringify(payload)}'`);
}

main().catch((error) => {
  console.error('Callable invocation failed:', error);
  process.exitCode = 1;
});
