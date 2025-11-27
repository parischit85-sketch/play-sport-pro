import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import serviceAccount from './service-account.json' assert { type: 'json' };

// Inizializza l'app con le credenziali del service account
// NOTA: L'utente deve scaricare il service-account.json dalla console Firebase
// e posizionarlo nella cartella functions/
initializeApp({
  credential: cert(serviceAccount)
});

const token = "fa97d5DGTFunnSD_77ZuoW:APA91bH_PnunPdt3s0yaniJ8Zwz8sv6VW532rkPDYf37K_IsO_NMYg74ImSC1Me5krgF-yP9HIU-Y-eDSrvmeuZUDdLdiAjWqSmg-UgIGDLbCx1rcdJoWs8";

const message = {
  token: token,
  notification: {
    title: "Test Manuale",
    body: "Se leggi questo, il backend funziona!"
  },
  android: {
    priority: "high",
    notification: {
      channelId: "PushNotifications", // Canale standard di Capacitor
      clickAction: "FLUTTER_NOTIFICATION_CLICK",
    }
  },
  data: {
    test: "true"
  }
};

console.log("Tentativo invio a token:", token.substring(0, 20) + "...");

getMessaging().send(message)
  .then((response) => {
    console.log('✅ Successo! Message ID:', response);
  })
  .catch((error) => {
    console.error('❌ Errore invio:', error);
    if (error.code === 'messaging/registration-token-not-registered') {
      console.error('👉 Il token non è valido o appartiene a un altro progetto Firebase.');
    }
  });
