
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { readFileSync } from 'fs';

// Carica service account
const serviceAccount = JSON.parse(
  readFileSync('./m-padelweb-firebase-adminsdk-fbsvc-fa9454d91a.json', 'utf8')
);

// Inizializza Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://m-padelweb-default-rtdb.europe-west1.firebasedatabase.app'
});

const db = getFirestore();
const messaging = getMessaging();

const TARGET_USER_ID = 'T64pDpqP9nUsDOk5SDQauIq1p6x2';

async function sendPush() {
  console.log(`🔍 Cercando subscription per User ID: ${TARGET_USER_ID}`);

  const snapshot = await db.collection('pushSubscriptions')
    .where('firebaseUid', '==', TARGET_USER_ID)
    .get();

  if (snapshot.empty) {
    // Try searching by userId field if firebaseUid is not used
    const snapshot2 = await db.collection('pushSubscriptions')
        .where('userId', '==', TARGET_USER_ID)
        .get();
    
    if (snapshot2.empty) {
        console.log('❌ Nessuna subscription trovata.');
        return;
    }
    console.log(`✅ Trovate ${snapshot2.size} subscriptions (campo userId).`);
    await processSubscriptions(snapshot2);
    return;
  }

  console.log(`✅ Trovate ${snapshot.size} subscriptions (campo firebaseUid).`);
  await processSubscriptions(snapshot);
}

async function processSubscriptions(snapshot) {
    for (const doc of snapshot.docs) {
        const data = doc.data();
        console.log(`\n📱 Processing Subscription ID: ${doc.id}`);
        console.log(`   Platform: ${data.platform}`);
        
        if (data.platform === 'android' && data.fcmToken) {
            console.log('   🚀 Invio notifica Android nativa...');
            const message = {
                token: data.fcmToken,
                notification: {
                    title: 'Test Push Play Sport Pro',
                    body: 'Se leggi questo, le notifiche funzionano! 🎾',
                },
                data: {
                    type: 'info',
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                    url: '/notifications'
                },
                android: {
                    priority: 'high',
                    notification: {
                        channelId: 'PushNotifications',
                        priority: 'high',
                        defaultSound: true,
                        visibility: 'public'
                    }
                }
            };

            try {
                const response = await messaging.send(message);
                console.log('   ✅ Notifica inviata con successo:', response);
            } catch (error) {
                console.error('   ❌ Errore invio:', error.message);
                if (error.code === 'messaging/registration-token-not-registered') {
                    console.log('   ⚠️ Token non valido, rimuovo subscription...');
                    await doc.ref.delete();
                }
            }
        } else {
            console.log('   ⚠️ Non è una subscription Android nativa o manca fcmToken.');
        }
    }
}

sendPush()
  .then(() => {
    console.log('\n✅ Script completato');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Errore:', error);
    process.exit(1);
  });
