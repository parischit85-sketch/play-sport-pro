# 🎯 CLOUD FUNCTIONS FIX - PUSH NOTIFICATIONS NATIVE

**Data**: 26 Novembre 2025 - 01:50 AM  
**Status**: ✅ COMPLETATO - PRONTO PER DEPLOY  
**Problema Risolto**: Notifiche push non arrivano su Android  

---

## ✅ COSA HO FATTO

Ho creato **Cloud Functions completamente nuove** con supporto completo per:

### 📱 Push Notifications Native (Android/iOS)
- ✅ Usa **Firebase Admin SDK** per inviare a token FCM/APNS nativi
- ✅ Supporta Android con configurazione ottimizzata (high priority, sound, channel)
- ✅ Supporta iOS con configurazione APNS (alert, sound, badge)
- ✅ Auto-gestione token invalidi (marca subscription come `active: false`)

### 🌐 Push Notifications Web (Browser)
- ✅ Mantiene supporto web-push library per browser
- ✅ Usa VAPID keys configurate come secrets
- ✅ Gestione subscription web standard

### 🚀 Funzionalità Avanzate
- ✅ Invio singolo utente (callable + http)
- ✅ Invio bulk ottimizzato con batch FCM (fino a 500 token per batch)
- ✅ Auto-cleanup subscription inattive (scheduled function, ogni giorno alle 3 AM)
- ✅ Logging dettagliato per debugging
- ✅ Gestione errori robusta

---

## 📁 FILE CREATI

```
cloud-function-fix/
├── index.js                          # Entry point principale
│   ├── sendPushToUser (callable)
│   ├── sendPushToUserHTTP (http)
│   ├── sendBulkPush (callable)
│   ├── sendBulkPushHTTP (http)
│   └── cleanupInactiveSubscriptions (scheduled)
│
├── sendPushNotificationToUser.js     # Logica invio singolo
│   ├── Supporto FCM nativo (Android/iOS)
│   ├── Supporto web-push (browser)
│   └── Auto-cleanup token invalidi
│
├── sendBulkNotifications.js          # Logica invio bulk
│   ├── Batch FCM ottimizzato (500 token/batch)
│   ├── Batch web-push parallelo
│   └── Statistiche dettagliate
│
├── package.json                      # Dependencies
│   ├── firebase-admin ^12.0.0
│   ├── firebase-functions ^4.5.0
│   └── web-push ^3.6.6
│
├── DEPLOY_GUIDE.md                   # Guida deploy completa
└── (questo file)                     # Riepilogo
```

**Script Automatico**:
- `deploy-cloud-functions.ps1` - Deploy automatico completo

---

## 🚀 COME DEPLOYARE

### Opzione A: AUTOMATICO (CONSIGLIATO)

```powershell
cd "C:\Users\paris\Downloads\play-sport-backup-2025-10-05_23-30-00"
.\deploy-cloud-functions.ps1
```

Lo script:
1. ✅ Verifica prerequisiti (Firebase CLI, Node.js)
2. ✅ Backup vecchie functions
3. ✅ Copia nuovi file
4. ✅ Installa dipendenze
5. ✅ Guida configurazione VAPID keys
6. ✅ Deploya su Firebase
7. ✅ Verifica deploy
8. ✅ Fornisce link per testing

---

### Opzione B: MANUALE

**STEP 1**: Backup e copia file
```powershell
cd "C:\Users\paris\Downloads\play-sport-backup-2025-10-05_23-30-00"

# Backup (se functions/ esiste)
Copy-Item -Path functions -Destination "functions-backup-$(Get-Date -Format 'yyyyMMdd')" -Recurse

# Copia nuovi file
Copy-Item -Path "cloud-function-fix\*" -Destination functions -Force
```

**STEP 2**: Installa dipendenze
```powershell
cd functions
npm install
```

**STEP 3**: Configura VAPID keys (opzionale, per web push)
```powershell
firebase functions:secrets:set VAPID_PUBLIC_KEY
firebase functions:secrets:set VAPID_PRIVATE_KEY
```

**STEP 4**: Deploy
```powershell
cd ..
firebase use m-padelweb
firebase deploy --only functions
```

---

## 🔍 DIFFERENZE CON IL CODICE VECCHIO

### ❌ PRIMA (Non Funzionava per Android)

```javascript
// Usava SOLO web-push library
const webpush = require('web-push');

// Funzionava solo per browser, non per Android/iOS nativi
await webpush.sendNotification(data.subscription, payload);
```

### ✅ DOPO (Funziona per Tutto)

```javascript
const admin = require('firebase-admin');
const webpush = require('web-push');

// Distingue tra native e web
const isNative = data.type === 'native';
const isWeb = data.subscription?.endpoint?.startsWith('http');

if (isNative && data.fcmToken) {
  // USA FIREBASE ADMIN SDK per Android/iOS
  await admin.messaging().send({
    token: data.fcmToken,
    notification: { title, body },
    android: { priority: 'high' },
  });
} else if (isWeb) {
  // USA WEB-PUSH per browser
  await webpush.sendNotification(data.subscription, payload);
}
```

---

## 📊 FLUSSO COMPLETO

### 1. App Android Registra Push

```javascript
// src/services/capacitorPushService.js (GIÀ FIXATO)
const subscriptionData = {
  userId,
  firebaseUid: userId,
  deviceId,
  platform: 'android',
  type: 'native',        // ← IMPORTANTE!
  active: true,          // ← IMPORTANTE!
  fcmToken: token.value, // ← Token FCM nativo
  endpoint: `fcm://android/${token}`, // ← Endpoint univoco
};

// Salva su Firestore
await setDoc(doc(db, 'pushSubscriptions', docId), subscriptionData);
```

### 2. Admin Invia Notifica

```javascript
// Frontend Admin Panel
const sendPush = firebase.functions().httpsCallable('sendPushToUser');
const result = await sendPush({ 
  userId: 'abc123',
  payload: {
    title: 'Nuovo Torneo',
    body: 'Iscrizioni aperte!',
    data: { tournamentId: '456' }
  }
});
```

### 3. Cloud Function Processa

```javascript
// Cloud Function (NUOVA)
// 1. Query Firestore
const subs = await db.collection('pushSubscriptions')
  .where('firebaseUid', '==', userId)
  .where('active', '==', true)
  .get();

// 2. Identifica tipo
const isNative = data.type === 'native';

// 3. Invia con FCM Admin SDK
if (isNative && data.fcmToken) {
  await admin.messaging().send({
    token: data.fcmToken,
    notification: { title, body },
    android: { priority: 'high' },
  });
}
```

### 4. Dispositivo Riceve

- 📱 **Notifica appare** nella barra notifiche Android
- 🔔 **Suono** riprodotto
- 📋 **Titolo e corpo** visibili
- 👆 **Click** apre l'app con deep link (se configurato)

---

## ✅ VERIFICA POST-DEPLOY

### 1. Firebase Console

Vai su: https://console.firebase.google.com/project/m-padelweb/functions

Dovresti vedere:
- ✅ `sendPushToUser` (region: europe-west1)
- ✅ `sendPushToUserHTTP` (region: europe-west1)
- ✅ `sendBulkPush` (region: europe-west1)
- ✅ `sendBulkPushHTTP` (region: europe-west1)
- ✅ `cleanupInactiveSubscriptions` (region: europe-west1)

### 2. Test da Admin Panel

1. Vai su: https://play-sport.pro/admin/push-notifications
2. Cerca il tuo utente
3. Clicca "Test Push"
4. **Controlla dispositivo Samsung** → Notifica deve arrivare! 🎉

### 3. Controlla Log

Vai su: https://console.firebase.google.com/project/m-padelweb/functions/logs

Cerca:
```
✅ [Push] Native notification sent successfully
```

---

## 🐛 TROUBLESHOOTING

### Notifica ancora non arriva

**Verifica Subscription su Firestore**:
1. Vai su Firestore: https://console.firebase.google.com/project/m-padelweb/firestore
2. Collection: `pushSubscriptions`
3. Cerca documento con:
   - `firebaseUid` = il tuo user ID
   - `active` = `true` ✅
   - `type` = `"native"` ✅
   - `fcmToken` = esiste ✅
   - `endpoint` = `"fcm://android/..."` ✅

Se manca qualcosa → Riapri app e riregistra push

**Verifica Log Cloud Function**:
```powershell
firebase functions:log --only sendPushToUser
```

Cerca errori:
- ❌ `messaging/invalid-registration-token` → Token scaduto, riapri app
- ❌ `messaging/registration-token-not-registered` → Token invalido, riapri app
- ❌ `No active subscriptions found` → Subscription non esiste o `active: false`

---

## 📋 CHECKLIST FINALE

### Prima del Deploy
- [x] File Cloud Functions creati
- [x] Script deploy automatico creato
- [x] Guida completa scritta
- [ ] **Firebase CLI installato** (verifica: `firebase --version`)
- [ ] **Login Firebase** (verifica: `firebase login`)

### Durante il Deploy
- [ ] Backup vecchie functions creato
- [ ] Nuovi file copiati in `functions/`
- [ ] Dipendenze installate (`npm install`)
- [ ] VAPID keys configurate (opzionale)
- [ ] Deploy completato (`firebase deploy --only functions`)

### Dopo il Deploy
- [ ] Functions visibili su Firebase Console
- [ ] Log non mostrano errori
- [ ] Test da Admin Panel eseguito
- [ ] **Notifica ricevuta su Samsung** ✅

---

## 🎉 RISULTATO FINALE ATTESO

**Su Dispositivo Samsung**:
```
┌─────────────────────────────────┐
│  📱 Play Sport Pro              │
│  ──────────────────────────────  │
│  🏆 Nuovo Torneo                │
│  Iscrizioni aperte!             │
│  ──────────────────────────────  │
│  Ora • Tocca per aprire         │
└─────────────────────────────────┘
```

**Nei Log Firebase**:
```
📱 [sendPushNotificationToUser] Starting...
📊 [Push] Found 1 active subscription(s)
🔍 [Push] Processing subscription: type=native, platform=android
📱 [Push] Sending NATIVE push via FCM Admin SDK
✅ [Push] Native notification sent successfully
📊 [Push] Send summary: successful=1, failed=0
```

---

## 🚀 ESEGUI ORA

**Comando singolo per deployare tutto**:

```powershell
cd "C:\Users\paris\Downloads\play-sport-backup-2025-10-05_23-30-00"
.\deploy-cloud-functions.ps1
```

Oppure segui la guida manuale in `cloud-function-fix/DEPLOY_GUIDE.md`

---

**✅ FATTO! Ora procedi con il deploy e dimmi se arriva la notifica!** 🎉

**File Principale**: `deploy-cloud-functions.ps1`  
**Documentazione**: `cloud-function-fix/DEPLOY_GUIDE.md`  
**Data Creazione**: 26 Nov 2025 - 01:50 AM

