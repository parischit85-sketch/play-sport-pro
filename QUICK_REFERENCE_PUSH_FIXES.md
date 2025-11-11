# 🚀 QUICK REFERENCE - PUSH NOTIFICATIONS FIXES
**TL;DR**: Sistema push notifications non funziona. Ecco come fixare in 8 ore.

---

## 🔴 PROBLEMA CRITICO #1

**File**: `src/hooks/usePushNotifications.js`  
**Riga**: ~170-210  
**Problema**: `sendSubscriptionToServer()` è VUOTA

### ❌ ATTUALE (NON FUNZIONA)
```javascript
async function sendSubscriptionToServer(subscription) {
  try {
    // TODO: Implementare API call al backend
    console.log('📤 Sending subscription to server:', {...});
    // await fetch('/api/push/subscribe', {...}); // ← COMMENTATO!
    return true;
  } catch (error) {
    console.error('Failed to send subscription to server:', error);
    return false;
  }
}
```

### ✅ SOLUZIONE (IMPLEMENTARE)
```javascript
async function sendSubscriptionToServer(subscription) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('🔐 Utente non autenticato');
      return false;
    }

    // Estrai keys della subscription
    const p256dh = subscription.getKey('p256dh');
    const auth_key = subscription.getKey('auth');
    
    if (!p256dh || !auth_key) {
      console.error('❌ Chiavi mancanti');
      return false;
    }

    // Converti ArrayBuffer in base64
    const p256dhBase64 = arrayBufferToBase64(p256dh);
    const authBase64 = arrayBufferToBase64(auth_key);

    // Genera device ID
    let deviceId = localStorage.getItem('push-device-id');
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('push-device-id', deviceId);
    }

    const subscriptionData = {
      userId: user.uid,
      subscription: {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: p256dhBase64,
          auth: authBase64,
        }
      },
      endpoint: subscription.endpoint,
      deviceId,
      timestamp: new Date().toISOString(),
    };

    console.log('[sendSubscriptionToServer] Saving:', {
      userId: user.uid,
      endpoint: subscription.endpoint.substring(0, 50) + '...',
    });

    // Chiama Netlify Function
    const response = await fetch('/.netlify/functions/save-push-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscriptionData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Errore:', error);
      return false;
    }

    const result = await response.json();
    console.log('✅ Salvato:', result.id);
    
    // Salva in localStorage per recovery
    localStorage.setItem(`push-sub-${user.uid}`, JSON.stringify({
      subscriptionData,
      savedAt: new Date().toISOString(),
      serverResponse: result.id,
    }));

    return true;
  } catch (error) {
    console.error('❌ Errore in sendSubscriptionToServer:', error);
    return false;
  }
}

// HELPER FUNCTION (aggiungi al file)
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}
```

**Tempo**: 45 minuti  
**Test**: Login → Accept permission → Firestore console → Check document

---

## 🔴 PROBLEMA CRITICO #2

**File**: `netlify/functions/save-push-subscription.js`  
**Riga**: ~45-75  
**Problema**: 2 query separate (spreca quota)

### ❌ ATTUALE (INEFFICIENTE)
```javascript
// Query 1
const existingSubscription = await db
  .collection('pushSubscriptions')
  .where('userId', '==', userId)
  .where('deviceId', '==', finalDeviceId)
  .get();

if (!existingSubscription.empty) {
  // Update
  return;
}

// Query 2 (SPRECHIAMO QUOTA!)
const endpointCheck = await db
  .collection('pushSubscriptions')
  .where('endpoint', '==', endpoint)
  .get();
```

### ✅ SOLUZIONE (SEMPLIFICARE)
```javascript
// Una sola operazione: Usa userId_deviceId come DOC ID
const docId = `${userId}_${deviceId}`;

await db.collection('pushSubscriptions').doc(docId).set(
  {
    userId,
    deviceId: finalDeviceId,
    subscription,
    endpoint,
    timestamp: timestamp || now.toISOString(),
    createdAt: now.toISOString(),
    lastUsedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    isActive: true,
  },
  { merge: true } // Update if exists, create if not
);

return {
  statusCode: 200,
  headers,
  body: JSON.stringify({
    success: true,
    message: 'Sottoscrizione salvata',
    id: docId,
    action: 'saved',
  }),
};
```

**Tempo**: 30 minuti  
**Beneficio**: -50% database queries

---

## 🔴 PROBLEMA CRITICO #3

**File**: Firestore Console  
**Problema**: Manca composite index

### ✅ SOLUZIONE
```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Oppure via console:
# 1. Firebase Console → Databases → pushSubscriptions
# 2. Create Composite Index
# 3. Fields: (userId Ascending), (createdAt Descending)
# 4. Save
# 5. Attendi ~5 min per deployment
```

**Status**: ✅ Enabled = OK, ⏳ Building = In progress, ❌ Error = Fix

**Tempo**: 5-10 minuti (+ attesa deployment)

---

## 🟠 PROBLEMA SIGNIFICATIVO #1

**File**: `src/components/AutoPushSubscription.jsx`  
**Riga**: ~55-75  
**Problema**: No retry logic su fallimento

### ❌ ATTUALE (NO RETRY)
```javascript
if (permission === 'default') {
  setTimeout(async () => {
    try {
      const granted = await requestPermission();
      if (granted) {
        // OK
      } else {
        // NEGATO - No retry
      }
      hasAttemptedRef.current = true;
    } catch (error) {
      console.error('Error:', error);
      hasAttemptedRef.current = true; // ← Non ritenta mai più!
    }
  }, 3000);
}
```

### ✅ SOLUZIONE (ADD RETRY)
```javascript
const registerPushSubscription = async (attempt = 1) => {
  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [2000, 5000, 10000];

  try {
    if (permission === 'granted') {
      const result = await subscribeToPush();
      if (result?.endpoint) {
        subscriptionIdRef.current = result.endpoint;
        console.log('✅ Subscription successful');
      }
      hasAttemptedRef.current = true;
      return;
    }

    if (permission === 'default') {
      const granted = await requestPermission();
      if (granted) {
        const result = await subscribeToPush();
        if (result?.endpoint) {
          subscriptionIdRef.current = result.endpoint;
        }
        hasAttemptedRef.current = true;
      } else {
        console.error('❌ Permission denied');
        hasAttemptedRef.current = true;
      }
      return;
    }

  } catch (error) {
    console.error(`❌ Attempt ${attempt}/${MAX_RETRIES} failed:`, error);
    
    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAYS[attempt - 1] || 10000;
      console.log(`⏳ Retrying in ${delay}ms...`);
      
      setTimeout(() => {
        registerPushSubscription(attempt + 1);
      }, delay);
    } else {
      console.error('❌ Max retries exceeded');
      localStorage.setItem('push-registration-failed-at', new Date().toISOString());
      hasAttemptedRef.current = true;
      
      // Toast notification
      if (toast) {
        toast.error('Impossibile attivare le notifiche. Riprova più tardi.');
      }
    }
  }
};
```

**Tempo**: 45 minuti

---

## 📊 VERIFICA STEP BY STEP

### Step 1: Subscription Salvata?
```javascript
// Console browser
fetch('/.netlify/functions/save-push-subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'tuoUserId',
    subscription: await navigator.serviceWorker.ready.then(
      sw => sw.pushManager.getSubscription()
    ).then(sub => sub.toJSON()),
    endpoint: (await navigator.serviceWorker.ready.then(
      sw => sw.pushManager.getSubscription()
    )).endpoint,
  })
}).then(r => r.json()).then(console.log)
```

**Atteso**: `{success: true, id: "userId_deviceId"}`

### Step 2: Firestore Ha Documento?
```javascript
// Firestore Console
db.collection('pushSubscriptions').where('userId', '==', 'tuoUserId').get()
```

**Atteso**: ≥1 documento con schema completo

### Step 3: Invio Notifica Funziona?
```javascript
// Firebase Console → Cloud Functions → sendBulkNotifications
// O via fetch:
fetch('https://us-central1-{project}.cloudfunctions.net/sendBulkNotifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    playerIds: ['tuoUserId'],
    subject: 'Test',
    message: 'Notifica di test',
    channel: 'auto'
  })
})
```

**Atteso**: Notifica nel browser

---

## 🧪 QUICK TESTS

### Test 1: Device Fingerprint
```javascript
// Console
localStorage.getItem('push-device-id')
// Atteso: "device-xxx-yyy"
```

### Test 2: Subscription in Browser
```javascript
// Console
navigator.serviceWorker.ready.then(sw => 
  sw.pushManager.getSubscription()
).then(sub => {
  console.log('Endpoint:', sub.endpoint);
  console.log('Keys:', {
    p256dh: sub.getKey('p256dh'),
    auth: sub.getKey('auth')
  });
})
```

### Test 3: Service Worker Active
```javascript
// Console
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Active:', reg.active);
  console.log('Scope:', reg.scope);
  console.log('State:', reg.active?.state);
})
```

### Test 4: Firestore Rules
```javascript
// Firebase Console → Rules Simulator
// Collection: pushSubscriptions
// Document: test-doc
// Action: read
// Auth: UID=tuoUserID
// Atteso: ✅ Allow
```

---

## 📱 DEPLOYMENT CHECKLIST

Prima di andare LIVE:

- [ ] Unit tests ✅ passanti
- [ ] Integration test ✅ end-to-end funziona
- [ ] Firestore indexes ✅ deployed
- [ ] Error logging ✅ configurato
- [ ] Circuit breaker ✅ implementato
- [ ] TTL cleanup ✅ schedulato
- [ ] Analytics ✅ tracciato
- [ ] Documentation ✅ aggiornata
- [ ] Load test ✅ 1000 notifiche/min
- [ ] Code review ✅ 2 approvazioni

---

## 🆘 QUICK TROUBLESHOOT

| Problema | Causa | Fix |
|----------|-------|-----|
| Subscription non salvata | sendSubscriptionToServer() non implementato | Implementare funzione |
| "requires composite index" error | Index mancante | Deploy firestore indexes |
| Notifica non arrivata | Collection vuota | Verifica step 1-2 sopra |
| Offline non salva | Service Worker non registrato | Verificare /public/sw.js |
| Permission denied permanente | Browser remembered | User manual override in browser settings |
| VAPID keys error | Sanitization errata | Semplifica sanitizeVapidKey() |

---

**Ultimo Update**: 11 Novembre 2025  
**Status**: READY TO IMPLEMENT  
**Tempo Totale**: 6-8 ore per funzionale
