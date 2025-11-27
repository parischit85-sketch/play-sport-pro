# 🚀 GUIDA DEPLOY CLOUD FUNCTIONS - Push Notifications Fix

**Data**: 26 Novembre 2025  
**Fix**: Supporto completo token FCM nativi (Android/iOS)  
**Status**: ✅ PRONTO PER DEPLOY  

---

## 📋 COSA È STATO FATTO

Ho creato **Cloud Functions completamente nuove** che supportano:

✅ **Push Native Android** - Usa Firebase Admin SDK con FCM  
✅ **Push Native iOS** - Usa Firebase Admin SDK con APNS  
✅ **Push Web** - Usa web-push library per browser  
✅ **Invio Singolo** - A un utente specifico  
✅ **Invio Bulk** - A multipli utenti (batch ottimizzato)  
✅ **Auto-cleanup** - Rimuove subscription inattive dopo 30 giorni  

---

## 📁 FILE CREATI

Tutti i file sono nella cartella `cloud-function-fix/`:

```
cloud-function-fix/
├── index.js                          # Main entry point
├── sendPushNotificationToUser.js     # Invio singolo utente
├── sendBulkNotifications.js          # Invio bulk
└── package.json                      # Dependencies
```

---

## 🔧 STEP 1: PREPARAZIONE AMBIENTE

### 1.1 Verifica Firebase CLI

```powershell
firebase --version
```

Se non installato:
```powershell
npm install -g firebase-tools
firebase login
```

### 1.2 Seleziona Progetto

```powershell
firebase use m-padelweb
```

---

## 🔑 STEP 2: CONFIGURA VAPID KEYS (Per Web Push)

Le VAPID keys servono per le notifiche web (browser). Per Android/iOS non servono ma è meglio configurarle.

### 2.1 Recupera le VAPID Keys Esistenti

Cerca nel tuo progetto i file:
- `.env`
- `.env.production`
- `src/utils/push.js`

Cerca variabili tipo:
```javascript
VAPID_PUBLIC_KEY=BP-Pp9JUfDtmi-pYIHpHPtcbWT_g9_rVHk-SIolLwO4s...
VAPID_PRIVATE_KEY=...
```

### 2.2 Setta le Keys come Secrets Firebase

```powershell
# SOSTITUISCI CON LE TUE KEYS!
firebase functions:secrets:set VAPID_PUBLIC_KEY
# Incolla la public key quando richiesto

firebase functions:secrets:set VAPID_PRIVATE_KEY
# Incolla la private key quando richiesto
```

**IMPORTANTE**: Se non hai le VAPID keys o vuoi rigenerarle:
```powershell
npx web-push generate-vapid-keys
```

---

## 📦 STEP 3: DEPLOY DELLE CLOUD FUNCTIONS

### Opzione A: Deploy da Cartella Esistente `functions/`

**Se hai già una cartella `functions/` nel progetto**:

1. **Copia i nuovi file**:
```powershell
cd "C:\Users\paris\Downloads\play-sport-backup-2025-10-05_23-30-00"

# Backup vecchie functions
if (Test-Path "functions") {
    Copy-Item -Path "functions" -Destination "functions-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')" -Recurse
}

# Copia nuovi file
Copy-Item -Path "cloud-function-fix\*" -Destination "functions\" -Force
```

2. **Installa dipendenze**:
```powershell
cd functions
npm install
```

3. **Deploy**:
```powershell
firebase deploy --only functions
```

---

### Opzione B: Deploy da Nuova Cartella (Se NON hai `functions/`)

1. **Rinomina cartella**:
```powershell
cd "C:\Users\paris\Downloads\play-sport-backup-2025-10-05_23-30-00"
Rename-Item -Path "cloud-function-fix" -NewName "functions"
```

2. **Inizializza Firebase Functions** (se non fatto):
```powershell
firebase init functions
# Scegli:
# - Use an existing project
# - Seleziona "m-padelweb"
# - JavaScript
# - NO a eslint (opzionale)
# - NO a install dependencies (le installiamo manualmente)
```

3. **Installa dipendenze**:
```powershell
cd functions
npm install
```

4. **Deploy**:
```powershell
firebase deploy --only functions
```

---

### Opzione C: Deploy Selettivo (Solo Alcune Functions)

Se vuoi deployare solo specifiche functions:

```powershell
# Solo invio singolo
firebase deploy --only functions:sendPushToUser,functions:sendPushToUserHTTP

# Solo invio bulk
firebase deploy --only functions:sendBulkPush,functions:sendBulkPushHTTP

# Tutto
firebase deploy --only functions
```

---

## ✅ STEP 4: VERIFICA DEPLOY

### 4.1 Controlla Firebase Console

1. Vai su: https://console.firebase.google.com/project/m-padelweb/functions
2. Dovresti vedere:
   - ✅ `sendPushToUser` (europe-west1)
   - ✅ `sendPushToUserHTTP` (europe-west1)
   - ✅ `sendBulkPush` (europe-west1)
   - ✅ `sendBulkPushHTTP` (europe-west1)
   - ✅ `cleanupInactiveSubscriptions` (europe-west1)

### 4.2 Testa con Firebase CLI

```powershell
# Testa invio a singolo utente
firebase functions:shell

# Poi nella shell:
sendPushToUser({ 
  userId: 'TUO_USER_ID_QUI', 
  payload: { 
    title: 'Test', 
    body: 'Notifica di test' 
  } 
})
```

---

## 🧪 STEP 5: TEST DA ADMIN PANEL

### 5.1 Verifica che l'Admin Panel Usi la Nuova Function

Cerca nel codice frontend (probabilmente in `src/features/admin/...`):

```javascript
// Vecchio codice (se esiste)
// const result = await fetch('/.netlify/functions/sendPushNotification', ...)

// NUOVO codice da usare:
const sendPush = firebase.functions().httpsCallable('sendPushToUser');
const result = await sendPush({ 
  userId: targetUserId, 
  payload: {
    title: 'Titolo',
    body: 'Messaggio',
    data: { /* dati custom */ }
  }
});
```

### 5.2 Test Manuale

1. Vai su: https://play-sport.pro/admin/push-notifications
2. Cerca il tuo utente
3. Clicca "Test Push" o "Invia Notifica"
4. **Controlla il dispositivo Samsung** - dovrebbe arrivare!

---

## 📊 STEP 6: MONITORA I LOG

### Real-time Logs

```powershell
firebase functions:log --only sendPushToUser
```

### Firebase Console Logs

Vai su: https://console.firebase.google.com/project/m-padelweb/functions/logs

Cerca per:
- `[sendPushNotificationToUser]`
- `[Bulk]`
- `✅` (success) o `❌` (error)

### Log Attesi (SUCCESS)

```
📱 [sendPushNotificationToUser] Starting... { userId: 'abc123...', title: 'Test' }
📊 [Push] Found 1 active subscription(s) for user
🔍 [Push] Processing subscription: { id: 'abc123_device456', type: 'native', platform: 'android', ... }
📱 [Push] Sending NATIVE push via FCM Admin SDK
✅ [Push] Native notification sent successfully: { messageId: 'projects/...', platform: 'android' }
📊 [Push] Send summary: { total: 1, successful: 1, failed: 0 }
```

### Log Attesi (ERROR - Token Invalido)

```
❌ [Push] Error sending to subscription: { id: '...', error: 'Requested entity was not found', code: 'messaging/registration-token-not-registered' }
🗑️ [Push] Marking subscription as inactive: abc123_device456
```

---

## 🔧 TROUBLESHOOTING

### Errore: "VAPID keys not configured"

**Causa**: VAPID keys non settate come secrets  
**Soluzione**:
```powershell
firebase functions:secrets:set VAPID_PUBLIC_KEY
firebase functions:secrets:set VAPID_PRIVATE_KEY
```

### Errore: "messaging/invalid-registration-token"

**Causa**: Il token FCM è scaduto o invalido  
**Soluzione**: La function marca automaticamente la subscription come `active: false`. L'utente deve riregistrarsi aprendo l'app.

### Errore: "Permission denied"

**Causa**: Utente non ha permessi admin per bulk send  
**Soluzione**: Verifica che l'utente abbia custom claim `admin: true` o `superAdmin: true`

### Notifica non arriva su Android

**Verifica**:
1. Subscription esiste in Firestore con `active: true`? ✅
2. Campo `fcmToken` presente? ✅
3. Campo `type: "native"` presente? ✅
4. Log mostrano "Native notification sent successfully"? ✅

Se tutti OK ma non arriva:
- Controlla impostazioni notifiche app su Android
- Verifica che il canale "default" esista (creato automaticamente)
- Prova a disinstallare/reinstallare app

---

## 🎯 MODIFICA ADMIN PANEL (Se Necessario)

Se l'Admin Panel usa ancora vecchie API, modifica il codice:

### File: `src/features/admin/AdminPushNotificationsPanel.jsx` (o simile)

**PRIMA** (vecchio):
```javascript
const response = await fetch('/.netlify/functions/sendPushNotification', {
  method: 'POST',
  body: JSON.stringify({ userId, payload }),
});
```

**DOPO** (nuovo):
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const sendPushToUser = httpsCallable(functions, 'sendPushToUser');

try {
  const result = await sendPushToUser({ 
    userId, 
    payload: {
      title: 'Titolo Notifica',
      body: 'Messaggio notifica',
      data: { /* dati custom */ }
    }
  });
  
  console.log('✅ Push sent:', result.data);
} catch (error) {
  console.error('❌ Push failed:', error);
}
```

---

## 📋 CHECKLIST FINALE

- [ ] Firebase CLI installato e loggato
- [ ] Progetto selezionato (`firebase use m-padelweb`)
- [ ] VAPID keys configurate come secrets
- [ ] File copiati in cartella `functions/`
- [ ] Dipendenze installate (`npm install`)
- [ ] Deploy completato (`firebase deploy --only functions`)
- [ ] Functions visibili su Firebase Console
- [ ] Subscription Android esiste in Firestore (`active: true`)
- [ ] Test invio da Admin Panel
- [ ] **Notifica ricevuta su dispositivo Samsung** ✅

---

## 🎉 SE TUTTO FUNZIONA

Dovresti vedere sul dispositivo Samsung:
- 📱 **Notifica push ricevuta**
- 🔔 **Suono di notifica**
- 📋 **Titolo e messaggio corretti**

E nei log Firebase:
- ✅ `Native notification sent successfully`
- ✅ `successCount: 1`

---

## 🆘 SE ANCORA NON FUNZIONA

**Dimmi**:
1. Output del comando `firebase deploy --only functions`
2. Screenshot Firebase Console Functions
3. Log Firebase Functions (ultimi 50 righe)
4. Screenshot subscription su Firestore
5. Eventuali errori in console browser (Admin Panel)

E ti aiuto a risolvere! 🚀

---

**File Creato**: 26 Nov 2025 - 01:45 AM  
**Pronto per**: Deploy immediato  
**Testing**: Obbligatorio dopo deploy

