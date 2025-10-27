# 🔍 Push Notifications Debug - Analisi Completa

**Data**: 2025-10-13  
**Errore**: "Servizio Push non configurato (VAPID mancante)"

---

## 🎯 Problema Identificato

### Errore nei Logs
```javascript
MedicalCertificatesManager.jsx:327 
✅ [Bulk Notifications] Result: {
  success: false, 
  sent: 0, 
  failed: 1, 
  provider: 'nodemailer',  // ⚠️ ERRORE: sta usando nodemailer invece di push!
  ...
}
```

### Causa Root
Le **chiavi VAPID** sono configurate solo su **Netlify**, ma NON su **Firebase Cloud Functions**.

La funzione `sendBulkCertificateNotifications` è una **Firebase Cloud Function** (gira su Google Cloud), non una Netlify Function. Le variabili d'ambiente di Netlify non sono accessibili da Firebase.

---

## 📊 Architettura Sistema Push Notifications

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│  - Registra Service Worker (/sw.js)                    │
│  - Sottoscrive push (usa VAPID_PUBLIC_KEY)             │
│  - Salva subscription via Netlify Function             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              NETLIFY FUNCTIONS (AWS Lambda)              │
│  ✅ /savePushSubscription - Salva in Firestore         │
│  ✅ /removePushSubscription - Rimuove da Firestore     │
│  ✅ /sendPushNotification - Invia notifica singola     │
│  ✅ /test-env - Diagnostica env vars                   │
│                                                          │
│  ENV VARS (✅ Configurate):                             │
│  - VAPID_PUBLIC_KEY                                     │
│  - VAPID_PRIVATE_KEY                                    │
│  - FIREBASE_PROJECT_ID                                  │
│  - FIREBASE_CLIENT_EMAIL                                │
│  - FIREBASE_PRIVATE_KEY                                 │
└─────────────────────────────────────────────────────────┘
                          │
                          │
┌─────────────────────────────────────────────────────────┐
│         FIREBASE CLOUD FUNCTIONS (Google Cloud)          │
│  ❌ sendBulkCertificateNotifications                    │
│     Problema: VAPID keys non configurate!              │
│                                                          │
│  ENV VARS (❌ Mancanti):                                │
│  - VAPID_PUBLIC_KEY  ← DA CONFIGURARE                  │
│  - VAPID_PRIVATE_KEY ← DA CONFIGURARE                  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  FIRESTORE DATABASE                      │
│  - pushSubscriptions/{id}                               │
│  - clubs/{clubId}/users/{userId}                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Modifiche Applicate

### 1. Service Worker Abilitato in Development
**File**: `src/main.jsx`

Prima:
```javascript
if (!import.meta.env.DEV) {
  // Service Worker solo in produzione
}
```

Dopo:
```javascript
// Service Worker SEMPRE attivo (necessario per push)
window.addEventListener('load', async () => {
  updateService.init();
  hashChecker.init();
});
```

### 2. Debug Dettagliati Aggiunti

**File**: `functions/sendBulkNotifications.clean.js`

Aggiunto:
```javascript
// All'avvio della funzione
console.log('🔧 [Web Push Config]', {
  publicKeyPresent: !!VAPID_PUBLIC_KEY,
  privateKeyPresent: !!VAPID_PRIVATE_KEY,
  enabled: WEB_PUSH_ENABLED,
});

// Durante l'invio push
console.log('📱 [sendPushNotificationToUser]', {
  userId,
  webPushEnabled: WEB_PUSH_ENABLED,
  vapidConfigured: !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY),
});

// Quando mancano le chiavi
console.error('❌ [Push] VAPID keys not configured!', {
  publicKeyPresent: !!VAPID_PUBLIC_KEY,
  privateKeyPresent: !!VAPID_PRIVATE_KEY,
  envVarsList: Object.keys(process.env).filter(k => k.includes('VAPID')),
});
```

**File**: `src/features/admin/components/MedicalCertificatesManager.jsx`

Aggiunto:
```javascript
console.log('🔧 [Debug] Firebase Functions instance:', {
  app: functions.app.name,
  region: 'us-central1',
  customDomain: functions.customDomain
});

console.log('📞 [Debug] Calling function with params:', {
  clubId,
  playerIds: Array.from(selectedPlayers),
  notificationType: type,
});
```

### 3. Variabili d'Ambiente Locali Aggiornate
**File**: `.env.local`

Aggiornate chiavi VAPID:
```bash
VITE_VAPID_PUBLIC_KEY=BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM809QTxc85X9oiHFKLovhxCpTgpAQV8zX6iJwLKy_wmMEQx7HHZUKrXusdM
VAPID_PUBLIC_KEY=BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM809QTxc85X9oiHFKLovhxCpTgpAQV8zX6iJwLKy_wmMEQx7HHZUKrXusdM
VAPID_PRIVATE_KEY=I-rY8mHqxKzGnDo5_EqT7jPpVHxGBpfWvLJhMxCqf7I
```

---

## ✅ Soluzione: Configurare Firebase Secrets

### Metodo Automatico (Consigliato) ⭐

```powershell
# Esegui lo script automatico
.\setup-firebase-functions-secrets.ps1
```

Lo script:
1. ✅ Verifica Firebase CLI
2. ✅ Effettua login se necessario
3. ✅ Configura VAPID_PUBLIC_KEY
4. ✅ Configura VAPID_PRIVATE_KEY
5. ✅ Fa il deploy delle functions
6. ✅ Mostra i logs

### Metodo Manuale

```bash
# 1. Login
firebase login

# 2. Configura secrets
firebase functions:secrets:set VAPID_PUBLIC_KEY
# Incolla: BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM809QTxc85X9oiHFKLovhxCpTgpAQV8zX6iJwLKy_wmMEQx7HHZUKrXusdM

firebase functions:secrets:set VAPID_PRIVATE_KEY
# Incolla: I-rY8mHqxKzGnDo5_EqT7jPpVHxGBpfWvLJhMxCqf7I

# 3. Deploy
firebase deploy --only functions:sendBulkCertificateNotifications

# 4. Verifica logs
firebase functions:log --only sendBulkCertificateNotifications --lines 30
```

---

## 🧪 Test Post-Fix

### 1. Verifica Service Worker

**Console Browser**:
```javascript
navigator.serviceWorker.ready.then(reg => {
  console.log('✅ Service Worker ready:', reg.active.state);
});
```

**DevTools → Application → Service Workers**:
- ✅ Status: activated
- ✅ Source: `/sw.js`

### 2. Test Sottoscrizione Push

**Console Browser**:
```javascript
import('/src/utils/push.js').then(async push => {
  const result = await push.subscribeToPush();
  console.log('Subscription result:', result);
});
```

Dovrebbe ritornare:
```javascript
{
  success: true,
  subscription: { endpoint: "...", keys: {...} }
}
```

### 3. Test Invio Notifica

**UI Admin**:
1. Vai a: `/club/sporting-cat/admin`
2. Tab: **Certificati Medici**
3. Seleziona un giocatore (es: Giacomo Paris)
4. Click: **Invia Notifica Push**

**Risultato Atteso**:
```javascript
✅ [Bulk Notifications] Result: {
  success: true,
  sent: 1,
  failed: 0,
  provider: 'push',  // ✅ Corretto!
  details: [{
    playerId: 'NhN9YIJFBghjbExhLimFMHcrj2v2',
    playerName: 'Giacomo Paris',
    success: true,
    method: 'push'
  }]
}
```

---

## 📜 Logs Attesi Dopo Fix

### Firebase Functions Logs

```bash
firebase functions:log --only sendBulkCertificateNotifications
```

**Prima del fix** (❌):
```
⚠️ Web Push disabled: VAPID keys not found in environment
❌ [Push] VAPID keys not configured!
```

**Dopo il fix** (✅):
```
✅ Web Push VAPID configured successfully
🔧 [Web Push Config] { publicKeyPresent: true, privateKeyPresent: true, enabled: true }
📱 [sendPushNotificationToUser] Starting... { userId: '...', webPushEnabled: true }
🔍 [Push] Subscriptions found: 1
✅ Push notification sent successfully
```

### Browser Console

**Prima del fix** (❌):
```
❌ [Bulk Notifications] Result: { success: false, sent: 0, failed: 1, provider: 'nodemailer' }
Error: Servizio Push non configurato (VAPID mancante) [push-service-unconfigured]
```

**Dopo il fix** (✅):
```
🔧 Service Worker enabled in development mode (for push notifications)
✅ Service Worker ready: activated
📧 [Bulk Notifications] Starting send... { type: 'push', count: 1 }
🔧 [Debug] Firebase Functions instance: { app: '[DEFAULT]', region: 'us-central1' }
✅ [Bulk Notifications] Result: { success: true, sent: 1, failed: 0, provider: 'push' }
```

---

## 📚 Documentazione Creata

1. **FIREBASE_CLOUD_FUNCTIONS_ENV_SETUP.md**
   - Guida completa configurazione Firebase Secrets
   - 3 metodi: CLI, Console Web, File locale
   - Troubleshooting dettagliato

2. **setup-firebase-functions-secrets.ps1**
   - Script PowerShell automatico
   - Configura secrets e fa deploy
   - Verifica configurazione

3. **PUSH_NOTIFICATIONS_TROUBLESHOOTING.md**
   - Debug completo sistema push
   - Errori comuni e soluzioni
   - Checklist verifica

---

## 🎯 Checklist Completa

### Ambiente Locale
- [x] `.env.local` aggiornato con chiavi VAPID
- [x] Service Worker abilitato in development
- [x] Debug logs aggiunti nel codice
- [ ] Dev server riavviato (`npm run dev`)
- [ ] Browser hard refresh (`Ctrl+F5`)

### Firebase Cloud Functions
- [ ] Firebase CLI installato
- [ ] Autenticato su Firebase
- [ ] Secret VAPID_PUBLIC_KEY configurato
- [ ] Secret VAPID_PRIVATE_KEY configurato
- [ ] Functions deployate
- [ ] Logs verificati

### Test Finali
- [ ] Service Worker attivo in DevTools
- [ ] Sottoscrizione push funzionante
- [ ] Notifica di test ricevuta
- [ ] Bulk notifications funzionanti
- [ ] Errori risolti nei logs

---

## 🚀 Prossimi Passi

1. **Esegui setup Firebase**:
   ```powershell
   .\setup-firebase-functions-secrets.ps1
   ```

2. **Riavvia dev server**:
   ```bash
   # Ferma server corrente (Ctrl+C)
   npm run dev
   ```

3. **Hard refresh browser**:
   - Chrome/Edge: `Ctrl + F5`
   - DevTools → Application → Clear storage

4. **Test completo**:
   - Registra Service Worker
   - Sottoscrivi push notifications
   - Invia notifica di test
   - Verifica ricezione

5. **Verifica logs**:
   ```bash
   firebase functions:log --only sendBulkCertificateNotifications
   ```

---

## 📞 Supporto

Se persiste il problema:
1. Controlla che le secrets siano configurate: `firebase functions:secrets:list`
2. Verifica i logs: `firebase functions:log`
3. Controlla Network tab in DevTools
4. Verifica Service Worker in Application tab

---

**Status**: ⏸️ In attesa di configurazione Firebase Secrets  
**Documentazione**: Completa ✅  
**Scripts**: Pronti ✅  
**Debug**: Abilitato ✅
