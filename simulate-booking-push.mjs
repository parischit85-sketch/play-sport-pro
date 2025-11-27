
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

// Mock functions from userNotifications.js and sendPushNotificationToUser.js
async function saveUserNotification(data) {
    console.log('💾 [MOCK] Saving notification:', data);
    return 'mock-notification-id';
}

async function sendPushNotificationToUser(userId, payload) {
    console.log(`📱 [MOCK] Sending push to ${userId}:`, payload);
    
    // Real logic from sendPushNotificationToUser.js to verify it works
    console.log('   🔍 Searching for subscriptions...');
    const subsSnapshot = await db
      .collection('pushSubscriptions')
      .where('firebaseUid', '==', userId)
      .where('active', '==', true)
      .get();

    if (subsSnapshot.empty) {
        console.log('   ⚠️ No active subscriptions found.');
        return;
    }

    console.log(`   ✅ Found ${subsSnapshot.size} subscriptions.`);
    
    for (const doc of subsSnapshot.docs) {
        const data = doc.data();
        console.log(`   Processing sub ${doc.id} (${data.platform})`);
        
        if (data.type === 'native' && data.fcmToken) {
            console.log('   🚀 Sending native push...');
            const message = {
                token: data.fcmToken,
                notification: {
                    title: payload.title,
                    body: payload.body,
                },
                data: payload.data || {},
                android: {
                    priority: 'high',
                    notification: {
                        channelId: 'PushNotifications',
                        sound: 'default',
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                    },
                }
            };
            try {
                const response = await messaging.send(message);
                console.log('   ✅ Sent successfully:', response);
            } catch (e) {
                console.error('   ❌ Send failed:', e.message);
            }
        }
    }
}

async function simulateBookingCreation() {
    const bookingId = 'sPKG25o57JWy82lbwsJQ'; // Use the ID from the previous check
    const userId = 'T64pDpqP9nUsDOk5SDQauIq1p6x2';
    
    console.log(`\n🧪 Simulating onBookingCreated for booking ${bookingId} and user ${userId}`);

    const booking = {
        userId: userId,
        courtName: 'Campo 1',
        date: '2025-11-27',
        time: '20:30',
        clubId: 'sporting-cat'
    };

    try {
        // 1. Salva notifica in-app
        await saveUserNotification({
          userId: booking.userId,
          title: 'Prenotazione Confermata',
          body: `Hai prenotato ${booking.courtName} per il ${booking.date} alle ${booking.time}`,
          type: 'booking',
          metadata: {
            bookingId,
            clubId: booking.clubId,
            date: booking.date,
            time: booking.time
          },
          actionUrl: `/bookings/${bookingId}`
        });

        // 2. Invia Push Notification
        await sendPushNotificationToUser(booking.userId, {
          title: 'Prenotazione Confermata ✅',
          body: `Il campo ${booking.courtName} è tuo! ${booking.date} ore ${booking.time}`,
          data: {
            url: `/bookings/${bookingId}`,
            type: 'booking',
            bookingId
          }
        });
        console.log(`✅ [Booking Created] Push notification sent to ${booking.userId}`);
      } catch (pushError) {
        console.error(`⚠️ [Booking Created] Failed to send push/in-app:`, pushError);
      }
}

simulateBookingCreation()
  .then(() => {
      console.log('\n✅ Simulation complete');
      process.exit(0);
  })
  .catch(err => {
      console.error(err);
      process.exit(1);
  });
