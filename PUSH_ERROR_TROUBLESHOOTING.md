# 🔍 Debug Push Notifications - Errore "Received unexpected response code"

**Data**: 2025-10-13  
**Errore**: "Giacomo Paris: Received unexpected response code [push-send-error]"

---

## 🚨 Analisi dell'Errore

### Sintomi

```javascript
// Client Log
provider: 'nodemailer'; // ❌ SBAGLIATO! Dovrebbe essere 'push'
success: false;
sent: 0;
failed: 1;
error: 'Received unexpected response code';
code: 'push-send-error';
```

### Screenshot Error

```
❌ Fallite: 1
Provider: nodemailer
Mittente: noreplay@play-sport.pro
Rispondi-a: info@sportingcat.it

Error:
- Giacomo Paris: Received unexpected response code [push-send-error]
```

---

## 🔍 Cause Possibili

### 1. Cache del Browser ⭐ (Più Probabile)

Il browser ha in cache la vecchia versione della Firebase Functions library che punta ancora al vecchio codice.

**Soluzione**:

```bash
# Hard Refresh
Ctrl + Shift + R
# oppure
Ctrl + F5

# Oppure cancella completamente la cache:
DevTools → Application → Clear Storage → Clear site data
```

### 2. Cloud Function Non Aggiornata

La funzione è stata deployata ma potrebbe essere ancora in propagazione o c'è un problema con le secrets.

**Verifica**:

```bash
# Controlla i logs in tempo reale
firebase functions:log --only sendBulkCertificateNotifications

# Cerca queste righe:
# ✅ "Web Push VAPID configured successfully"
# oppure
# ❌ "Web Push disabled: VAPID keys not found"
```

### 3. Secrets Non Caricate

Le secrets VAPID potrebbero non essere accessibili alla function runtime.

**Verifica nel log**:

```
🔧 [Web Push Config] {
  publicKeyPresent: false,   // ❌ Dovrebbe essere true
  privateKeyPresent: false,  // ❌ Dovrebbe essere true
  enabled: false             // ❌ Dovrebbe essere true
}
```

### 4. Errore HTTP dalla Web Push API

La chiamata a Web Push API potrebbe fallire con un codice HTTP inaspettato (es: 403, 401, 500).

**Causa**: Chiavi VAPID non valide o subscription scaduta

---

## ✅ Soluzione Step-by-Step

### Step 1: Pulisci Cache Browser (IMPORTANTE!)

1. **Apri DevTools** (F12)
2. **Application Tab** → **Clear storage**
3. **Seleziona tutto**:
   - ✅ Local storage
   - ✅ Session storage
   - ✅ IndexedDB
   - ✅ Cache storage
   - ✅ Service Workers
4. Click **"Clear site data"**
5. **Ricarica pagina** (F5)

### Step 2: Unregister Service Worker

1. DevTools → **Application** → **Service Workers**
2. Trova il service worker attivo
3. Click **"Unregister"**
4. **Chiudi e riapri** il browser
5. Ricarica la pagina

### Step 3: Re-sottoscrivi Push Notifications

Vai alla pagina Profile e:

1. Se hai già una sottoscrizione, clicca **"Disabilita Notifiche"**
2. Poi clicca **"Abilita Notifiche"**
3. Accetta i permessi del browser
4. Verifica che vedi: ✅ "Subscription salvata con successo"

### Step 4: Verifica Configurazione Firebase

Apri un nuovo terminale PowerShell e controlla i logs:

```powershell
# Logs in tempo reale
firebase functions:log --only sendBulkCertificateNotifications

# Mentre i logs sono aperti, invia una notifica di test dalla UI
# Dovresti vedere questi logs:
```

**Logs Corretti** (✅):

```
🔧 [Web Push Config] {
  publicKeyPresent: true,
  privateKeyPresent: true,
  enabled: true,
  publicKeyPreview: 'BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM8...'
}
✅ Web Push VAPID configured successfully
📱 [sendPushNotificationToUser] Starting...
🔍 [Push] Querying subscriptions for userId: NhN9YIJFBghjbExhLimFMHcrj2v2
📊 [Push] Subscriptions found: 1
✅ Push notification sent successfully
```

**Logs Errati** (❌):

```
⚠️ Web Push disabled: VAPID keys not found in environment
🔧 [Web Push Config] {
  publicKeyPresent: false,
  privateKeyPresent: false,
  enabled: false
}
```

Se vedi i logs errati, le secrets non sono state caricate correttamente.

---

## 🔧 Fix Definitivo: Re-deploy con Debug

Se dopo Step 1-4 il problema persiste, ri-deploya con debug aggiuntivo:

### 1. Aggiungi Log Extra nel Codice

Modifica `functions/sendBulkNotifications.clean.js`:

```javascript
// All'inizio del file, dopo gli import
console.log('🚀 [Module Load] sendBulkNotifications loaded');
console.log('🔐 [Module Load] Environment vars:', {
  hasVapidPublic: !!process.env.VAPID_PUBLIC_KEY,
  hasVapidPrivate: !!process.env.VAPID_PRIVATE_KEY,
  allKeys: Object.keys(process.env).filter((k) => k.includes('VAPID')),
});
```

### 2. Re-deploy

```bash
firebase deploy --only functions:sendBulkCertificateNotifications
```

### 3. Monitora Logs Durante Test

```bash
# Terminale 1: Logs Firebase
firebase functions:log --only sendBulkCertificateNotifications

# Browser: Invia notifica di test
# Guarda i logs nel terminale
```

---

## 🧪 Test Diagnostico Completo

### Console Browser

Apri la Console e esegui:

```javascript
// 1. Verifica Service Worker
navigator.serviceWorker.ready.then((reg) => {
  console.log('✅ SW Ready:', reg.active.state);
});

// 2. Test sottoscrizione
import('/src/utils/push.js').then(async (push) => {
  try {
    const sub = await push.subscribeToPush();
    console.log('✅ Subscription:', sub);
  } catch (err) {
    console.error('❌ Subscription error:', err);
  }
});

// 3. Test invio diretto
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions(undefined, 'us-central1');
const sendBulk = httpsCallable(functions, 'sendBulkCertificateNotifications');

try {
  const result = await sendBulk({
    clubId: 'sporting-cat',
    playerIds: ['NhN9YIJFBghjbExhLimFMHcrj2v2'], // Giacomo Paris
    notificationType: 'push',
  });

  console.log('✅ Result:', result.data);
} catch (err) {
  console.error('❌ Error:', err);
  console.error('❌ Error details:', {
    code: err.code,
    message: err.message,
    details: err.details,
  });
}
```

---

## 📊 Checklist Troubleshooting

- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Cancellata cache completa (DevTools → Clear storage)
- [ ] Service Worker unregistrato e ri-registrato
- [ ] Re-sottoscrizione push notifications
- [ ] Logs Firebase monitorati in tempo reale
- [ ] Visto log "Web Push VAPID configured successfully"
- [ ] Visto log "Push notification sent successfully"
- [ ] Notifica ricevuta nel browser

---

## 🎯 Risultato Atteso Finale

### Client Console

```javascript
📧 [Bulk Notifications] Starting send... { type: 'push', count: 1 }
🔧 [Debug] Firebase Functions instance: { app: '[DEFAULT]', region: 'us-central1' }
✅ [Bulk Notifications] Result: {
  success: true,
  sent: 1,
  failed: 0,
  provider: 'push',  // ✅ CORRETTO!
  details: [{
    playerId: 'NhN9YIJFBghjbExhLimFMHcrj2v2',
    playerName: 'Giacomo Paris',
    success: true,
    method: 'push'
  }]
}
```

### Firebase Logs

```
✅ Web Push VAPID configured successfully
📱 [sendPushNotificationToUser] Starting...
🔍 [Push] Subscriptions found: 1
✅ Push notification sent successfully
```

### Browser Notification

```
🔔 Certificato medico
Il tuo certificato scade il [data]
[Icona del circolo]
```

---

## 🆘 Se Ancora Non Funziona

Contattami con:

1. Screenshot completo della Console Browser (errori)
2. Output di: `firebase functions:log --only sendBulkCertificateNotifications --lines 30`
3. Screenshot DevTools → Application → Service Workers
4. Screenshot DevTools → Application → Cache Storage

---

**Ultima modifica**: 2025-10-13  
**Status**: In troubleshooting
