// Script diagnostico completo - Verifica subscription e log
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { credential } from 'firebase-admin';
import { readFileSync } from 'fs';

console.log('🔍 DIAGNOSTICA PUSH NOTIFICATIONS\n');
console.log('=''.repeat(80));

try {
  // Carica service account
  const serviceAccountPath = './m-padelweb-firebase-adminsdk-fbsvc-fa9454d91a.json';
  console.log(`📄 Caricamento service account: ${serviceAccountPath}`);

  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

  // Inizializza Firebase Admin
  initializeApp({
    credential: credential.cert(serviceAccount),
    databaseURL: 'https://m-padelweb-default-rtdb.europe-west1.firebasedatabase.app'
  });

  console.log('✅ Firebase Admin inizializzato\n');

  const db = getFirestore();

  // ========================================
  // 1. VERIFICA SUBSCRIPTION RECENTI
  // ========================================
  console.log('📱 1. CONTROLLO SUBSCRIPTION RECENTI');
  console.log('-'.repeat(80));

  const recentSubs = await db.collection('pushSubscriptions')
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();

  if (recentSubs.empty) {
    console.log('❌ NESSUNA SUBSCRIPTION TROVATA!');
    console.log('   → L\'app non ha mai registrato notifiche push\n');
  } else {
    console.log(`✅ Trovate ${recentSubs.size} subscription recenti:\n`);

    recentSubs.forEach((doc, i) => {
      const data = doc.data();
      const createdDate = new Date(data.createdAt);
      const minutesAgo = Math.floor((Date.now() - createdDate.getTime()) / 60000);

      console.log(`   ${i + 1}. ${doc.id}`);
      console.log(`      User: ${data.firebaseUid?.substring(0, 20)}...`);
      console.log(`      Platform: ${data.platform || 'N/A'}`);
      console.log(`      Type: ${data.type || 'N/A'}`);
      console.log(`      Active: ${data.active === true ? '✅ true' : data.active === false ? '❌ false' : '⚠️  undefined'}`);
      console.log(`      IsActive: ${data.isActive === true ? '✅ true' : data.isActive === false ? '❌ false' : '⚠️  undefined'}`);
      console.log(`      Has fcmToken: ${data.fcmToken ? '✅ YES' : '❌ NO'}`);
      console.log(`      Has endpoint: ${data.endpoint ? '✅ YES' : '❌ NO'}`);
      console.log(`      Created: ${minutesAgo} minuti fa`);
      console.log('');
    });
  }

  // ========================================
  // 2. VERIFICA SUBSCRIPTION ANDROID NATIVE
  // ========================================
  console.log('📱 2. CONTROLLO SUBSCRIPTION ANDROID NATIVE');
  console.log('-'.repeat(80));

  const androidSubs = await db.collection('pushSubscriptions')
    .where('type', '==', 'native')
    .where('platform', '==', 'android')
    .orderBy('createdAt', 'desc')
    .limit(5)
    .get();

  if (androidSubs.empty) {
    console.log('❌ NESSUNA SUBSCRIPTION ANDROID NATIVE!');
    console.log('   → L\'app Android non ha mai completato la registrazione push');
    console.log('   → Verifica che l\'app sia stata aperta e che i permessi siano stati accettati\n');
  } else {
    console.log(`✅ Trovate ${androidSubs.size} subscription Android:\n`);

    androidSubs.forEach((doc, i) => {
      const data = doc.data();
      console.log(`   ${i + 1}. ${doc.id}`);
      console.log(`      Active: ${data.active ? '✅' : '❌'} ${data.active}`);
      console.log(`      FCM Token: ${data.fcmToken?.substring(0, 30)}...`);
      console.log(`      Endpoint: ${data.endpoint?.substring(0, 50)}...`);
      console.log('');
    });
  }

  // ========================================
  // 3. VERIFICA SUBSCRIPTION ATTIVE
  // ========================================
  console.log('📱 3. CONTROLLO SUBSCRIPTION ATTIVE (active: true)');
  console.log('-'.repeat(80));

  const activeSubs = await db.collection('pushSubscriptions')
    .where('active', '==', true)
    .orderBy('createdAt', 'desc')
    .limit(5)
    .get();

  if (activeSubs.empty) {
    console.log('❌ NESSUNA SUBSCRIPTION ATTIVA!');
    console.log('   → Il backend NON può inviare notifiche');
    console.log('   → Questo è IL PROBLEMA PRINCIPALE!\n');
    console.log('   SOLUZIONE:');
    console.log('   1. Apri l\'app sul Samsung');
    console.log('   2. Effettua login');
    console.log('   3. Accetta permessi notifiche');
    console.log('   4. Attendi che si crei la subscription con active: true\n');
  } else {
    console.log(`✅ Trovate ${activeSubs.size} subscription attive:\n`);

    activeSubs.forEach((doc, i) => {
      const data = doc.data();
      console.log(`   ${i + 1}. ${doc.id}`);
      console.log(`      Type: ${data.type}`);
      console.log(`      Platform: ${data.platform}`);
      console.log(`      User: ${data.firebaseUid?.substring(0, 20)}...`);
      console.log(`      Has Token: ${data.fcmToken ? '✅' : data.apnsToken ? '✅' : '❌'}`);
      console.log('');
    });
  }

  // ========================================
  // 4. STATISTICHE FINALI
  // ========================================
  console.log('📊 4. STATISTICHE');
  console.log('-'.repeat(80));

  const totalSubs = await db.collection('pushSubscriptions').count().get();
  const activeCount = await db.collection('pushSubscriptions')
    .where('active', '==', true)
    .count()
    .get();
  const nativeCount = await db.collection('pushSubscriptions')
    .where('type', '==', 'native')
    .count()
    .get();

  console.log(`   Totale subscription: ${totalSubs.data().count}`);
  console.log(`   Subscription attive: ${activeCount.data().count}`);
  console.log(`   Subscription native: ${nativeCount.data().count}`);
  console.log('');

  // ========================================
  // 5. DIAGNOSI
  // ========================================
  console.log('🔍 5. DIAGNOSI');
  console.log('='.repeat(80));

  if (totalSubs.data().count === 0) {
    console.log('❌ PROBLEMA: Nessuna subscription mai creata');
    console.log('   CAUSA: L\'app non sta registrando le push notifications');
    console.log('   FIX APPLICATO: Modificato capacitorPushService.js ✅');
    console.log('   AZIONE: Riapri l\'app sul Samsung e accetta permessi\n');
  } else if (activeCount.data().count === 0) {
    console.log('❌ PROBLEMA: Subscription esistono ma nessuna è attiva');
    console.log('   CAUSA: Campo active non impostato a true');
    console.log('   FIX APPLICATO: Modificato capacitorPushService.js ✅');
    console.log('   AZIONE: Riapri l\'app sul Samsung per creare nuova subscription\n');
  } else if (nativeCount.data().count === 0) {
    console.log('⚠️  WARNING: Subscription attive ma nessuna nativa');
    console.log('   CAUSA: Solo web subscription, niente Android native');
    console.log('   AZIONE: Apri l\'app Android e registra push\n');
  } else {
    console.log('✅ SUBSCRIPTION OK: Esistono subscription native attive');
    console.log('   PROBLEMA POTENZIALE: Cloud Function non supporta FCM nativo');
    console.log('   FIX IN CORSO: Deploy Cloud Functions con supporto FCM ⏳\n');
  }

  console.log('='.repeat(80));
  console.log('✅ Diagnostica completata\n');

  process.exit(0);

} catch (error) {
  console.error('❌ ERRORE:', error.message);
  console.error('\nDettagli:', error);
  process.exit(1);
}

