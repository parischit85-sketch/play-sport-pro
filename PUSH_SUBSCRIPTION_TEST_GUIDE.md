# 🔔 Guida Rapida: Test Push Notifications

**Data:** 20 Novembre 2025  
**Problema:** La notifica non arriva perché l'utente non ha una push subscription attiva

---

## 🎯 Problema Identificato

Dai log della console:
```javascript
🔍 [DEBUG] No push subscription for user: FoqdMJ6vCFfshRPlz4CYrCl0fpu1
```

**Causa:** L'utente `sportingcat@gmil.com` (UID: `FoqdMJ6vCFfshRPlz4CYrCl0fpu1`) non ha mai autorizzato le notifiche push nel browser.

**Errore CORS:** È normale in development - il `localhost:5173` non può chiamare `netlify.app` per policy CORS. In production funziona perché stesso dominio.

---

## ✅ Soluzione: Abilita Push Subscription

### Metodo 1: Utility Console (CONSIGLIATO)

**1. Apri la Console del Browser** (F12 → Console)

**2. Esegui il comando di test:**
```javascript
window.testPushSubscription()
```

**Questo farà automaticamente:**
- ✅ Verifica supporto browser
- ✅ Richiede permesso notifiche
- ✅ Registra Service Worker
- ✅ Crea push subscription
- ✅ Salva subscription su Firestore
- ✅ Invia notifica di test

**Output atteso:**
```
🧪 Test Push Subscription
✅ Utente autenticato: {uid: "...", email: "sportingcat@gmil.com"}
✅ Browser supporta tutte le API necessarie
⏳ Richiedendo permesso per le notifiche...
✅ Permesso concesso
✅ Service Worker già registrato
⏳ Creando nuova subscription...
✅ Subscription creata
⏳ Inviando notifica di test...
✅ Notifica di test inviata con successo
👀 Controlla se la notifica appare sul browser

📊 RIEPILOGO:
├─ Utente: sportingcat@gmil.com
├─ Permessi: GRANTED ✅
├─ Service Worker: ATTIVO ✅
├─ Subscription: ATTIVA ✅
└─ Test notifica: INVIATA ✅
```

### Metodo 2: Interfaccia Utente (TODO)

Al momento non c'è un'interfaccia UI per abilitare le notifiche. Usa il Metodo 1 (console).

**Prossimi step (da implementare):**
- [ ] Aggiungere "Abilita Notifiche" in `ProfileSettings`
- [ ] Badge visivo per stato subscription
- [ ] Pannello admin per gestire subscription utenti

---

## 🧪 Altri Comandi Disponibili

### Controlla Stato (senza modifiche)
```javascript
window.checkPushStatus()
```

**Output:**
```
📊 Push Notification Status
Utente: {uid: "...", email: "sportingcat@gmil.com"}
Supporto browser: {notifications: true, serviceWorker: true, pushManager: true}
Permessi: granted
Subscription attiva: SÌ ✅
Dettagli subscription: {endpoint: "...", expirationTime: "NESSUNA", hasKeys: true}
```

### Invia Notifica di Test Manuale
```javascript
window.sendTestPush()
```

### Disabilita Subscription
```javascript
window.unsubscribePush()
```

---

## 🔍 Verifica in Firestore

**1. Apri Firebase Console:**  
https://console.firebase.google.com/project/m-padelweb/firestore

**2. Vai alla collezione `pushSubscriptions`**

**3. Cerca documento con ID = `FoqdMJ6vCFfshRPlz4CYrCl0fpu1`**

**Struttura documento attesa:**
```javascript
{
  endpoint: "https://fcm.googleapis.com/fcm/send/...",
  expirationTime: null,
  firebaseUid: "FoqdMJ6vCFfshRPlz4CYrCl0fpu1",
  subscriptionData: {
    endpoint: "https://fcm.googleapis.com/fcm/send/...",
    keys: {
      auth: "...",
      p256dh: "..."
    }
  },
  timestamp: Timestamp(...)
}
```

Se **NON** esiste questo documento → subscription non attiva → esegui `window.testPushSubscription()`

---

## 🚀 Test Completo End-to-End

**1. Abilita subscription (prima volta):**
```javascript
window.testPushSubscription()
```

**2. Crea una prenotazione con un giocatore:**
- Vai su `/club/sporting-cat/admin/bookings`
- Clicca su uno slot libero
- Seleziona "Andrea Paris" come Player 1 (UID: `T64pDpqP9nUsDOk5SDQauIq1p6x2`)
- Salva prenotazione

**3. Verifica nei log:**
```javascript
👥 [BookingNotifications] Participants to notify: ['T64pDpqP9nUsDOk5SDQauIq1p6x2']
✅ [BookingNotifications] Booking created notifications sent
```

**4. Controlla se Andrea Paris ha ricevuto la notifica:**

Se Andrea Paris = utente corrente (`sportingcat@gmil.com`), dovresti vedere la notifica nel browser.

**NOTA:** In development, l'errore CORS è normale:
```
POST https://play-sport-pro.netlify.app/.netlify/functions/send-push 
net::ERR_FAILED (CORS policy)
```

**In production:** Funziona correttamente perché stesso dominio.

---

## ⚙️ Troubleshooting

### ❌ "Permessi notifiche negati"

**Soluzione:**
1. Clicca sull'icona lucchetto/info nella barra URL
2. Trova "Notifiche" nelle impostazioni sito
3. Imposta su "Consenti"
4. Ricarica pagina
5. Riesegui `window.testPushSubscription()`

### ❌ "Service Worker registration failed"

**Cause comuni:**
- File `/public/sw.js` non trovato
- Altri Service Worker interferiscono
- Cache browser corrotta

**Soluzione:**
```javascript
// Disregistra tutti i SW
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});

// Pulisci cache (Ctrl+Shift+Del)
// Ricarica pagina (Ctrl+Shift+R)
// Riesegui window.testPushSubscription()
```

### ❌ "Subscription creation failed"

**Causa:** VAPID keys mancanti o incorrette

**Verifica:** `src/utils/push.js` linea 13
```javascript
const VAPID_PUBLIC_KEY = 'BP-Pp9JUfDtmi-pYIHpHPtcbWT_g9_rVHk-SIolLwO4sRIP8bzg7FSi_EAa_tgK4FNXop1ecL8Mt8dMZsA8bg_g';
```

### ❌ "No push subscription" anche dopo test

**Verifica Firestore:**
1. Controlla `pushSubscriptions/{uid}` esista
2. Controlla `endpoint` non sia vuoto
3. Controlla `subscriptionData.keys` esistano

**Se manca:** Problemi con Firebase Functions. Controlla:
```bash
firebase deploy --only functions:savePushSubscriptionHttp
```

---

## 📊 Monitoraggio Subscription (Admin)

**Trova tutti gli utenti con subscription attiva:**

```javascript
// Firestore Console → Query
collection: pushSubscriptions
orderBy: timestamp DESC
```

**Trova subscription scadute:**

```javascript
// Cerca subscription con expirationTime passato
// (Implementare funzione di cleanup)
```

---

## 📝 File Modificati

**Nuovi file creati:**
1. `src/utils/test-push-subscription.js` - Utility di test
2. `PUSH_SUBSCRIPTION_TEST_GUIDE.md` - Questa guida

**File modificati:**
1. `src/main.jsx` - Import utility in development
   - Linea 508-520: Carica test utilities

---

## 🎯 Prossimi Passi (TODO)

### UI per Push Notifications

**1. Componente `PushNotificationSettings.jsx`:**
```jsx
// Location: src/components/settings/PushNotificationSettings.jsx
import { subscribeToPush, isPushSubscribed } from '@utils/push.js';

function PushNotificationSettings() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // UI con toggle ON/OFF
  // Badge stato: "Abilitate ✅" / "Disabilitate ❌"
  // Pulsante "Invia Test"
}
```

**2. Integrare in `ProfilePage.jsx`:**
```jsx
<Section title="Notifiche Push">
  <PushNotificationSettings />
</Section>
```

**3. Admin Panel - Subscription Monitor:**
```jsx
// Location: src/pages/admin/PushSubscriptionsPage.jsx
// Mostra tutti gli utenti con subscription attiva
// Permetti invio notifiche bulk
// Gestisci cleanup subscription obsolete
```

### Backend Improvements

**1. Cloud Function: `cleanupExpiredSubscriptions`**
```javascript
// Scheduled function (cron daily)
// Rimuove subscription scadute o invalide
```

**2. Cloud Function: `validateSubscription`**
```javascript
// Verifica se subscription è ancora valida
// Test ping push service
```

**3. Analytics:**
```javascript
// Track subscription rate
// Track notification delivery rate
// Track notification click rate
```

---

## 📚 Riferimenti

**Documentazione:**
- `PUSH_NOTIFICATIONS_FIX_COMPLETO.md` - Fix architettura completa
- `API_REFERENCE_PUSH_V2.md` - API reference
- `src/utils/push.js` - Implementazione completa

**Service Worker:**
- `public/sw.js` - Push notification handler

**Firebase Functions:**
- `functions/src/push-notifications/savePushSubscription.js`
- `functions/src/push-notifications/sendPushNotification.js`
- `netlify/functions/send-push.js` - Netlify proxy function

**Database:**
- Collection: `pushSubscriptions/{firebaseUid}`
- Security rules: `firestore.rules` linee 350-370

---

## ✅ Checklist Deployment

Prima di deployare in production:

- [ ] `window.testPushSubscription()` funziona in development
- [ ] Subscription salvata in Firestore
- [ ] Notifica di test ricevuta (normale CORS error in dev)
- [ ] Deploy Firebase Functions:
  ```bash
  firebase deploy --only functions:savePushSubscriptionHttp
  firebase deploy --only functions:sendPushNotificationHttp
  ```
- [ ] Deploy Netlify Functions (auto-deploy con push a Git)
- [ ] Verifica VAPID keys in Firebase Functions Secrets
- [ ] Test in production con utente reale
- [ ] Monitora Firestore logs per errori

---

**Ultimo aggiornamento:** 20 Novembre 2025, 23:45  
**Autore:** GitHub Copilot (Claude Sonnet 4.5)  
**Issue:** Push notification non arrivano - mancanza subscription
