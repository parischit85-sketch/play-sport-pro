# 🧪 TESTING GUIDE - Push Notifications

## ⚡ QUICK START TESTING (15 minuti)

Ecco come testare che il sistema push notifications funziona correttamente.

---

## 🔍 TEST 1: Verifica Firestore (1 min)

### Cosa fare:

1. Apri Firebase Console
2. Vai a: Firestore → Collections
3. Cerca la collection: **`pushSubscriptions`**
4. Verifica che esiste (vuota per ora)

### Expected Result:

✅ Collection `pushSubscriptions` exists and is empty

---

## 🧪 TEST 2: Test API Manually (2 min)

### Cosa fare:

Apri il browser e vai sulla app: `https://your-app-url.com`

Apri la Developer Console (F12 o Cmd+Option+I)

Copia-incolla questo comando:

```javascript
fetch('/.netlify/functions/save-push-subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'test-user-' + Date.now(),
    subscription: {
      endpoint: 'https://fcm.googleapis.com/fcm/send/' + Math.random(),
      keys: {
        p256dh: 'dGVzdC1rZXktcDI1NmRo',
        auth: 'dGVzdC1hdXRoLWtleQ==',
      },
    },
    endpoint: 'https://fcm.googleapis.com/fcm/send/' + Math.random(),
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

Premi ENTER

### Expected Result:

```json
{
  "success": true,
  "id": "test-user-XXXXX_device-XXX",
  "message": "Subscription saved"
}
```

---

## 📱 TEST 3: Real User Test (5 min)

### Setup:

1. **Logout** se sei già loggato
2. **Login** con un account reale
3. Attendi che l'app carichi completamente

### Cosa cercare:

- Dovresti vedere un banner o bottone: **"Enable Notifications"**
- Se NON lo vedi, controlla che il service worker è registrato:

```javascript
navigator.serviceWorker
  .getRegistration()
  .then((r) => console.log(r ? 'SW registered' : 'SW NOT registered'));
```

### Se il bottone c'è:

1. **Click** il bottone "Enable Notifications"
2. **Browser chiede**: "Vuoi permettere notifiche?"
3. **Click**: "Allow"
4. ✅ Dovresti vedere un messaggio di success

### Verifica in Firestore:

1. Apri Firebase Console
2. Firestore → Collections → **`pushSubscriptions`**
3. Dovresti vedere un **nuovo documento**!
4. Documento avrà chiave: `{userId}_{deviceId}`

### Expected Result:

✅ Documento salvato in Firestore
✅ User riceve conferma sulla app

---

## 🔄 TEST 4: Retry Logic (3 min)

### Cosa testare:

Verifica che il retry logic funziona quando il network è instabile

### Simulare Network Error:

1. Apri DevTools (F12)
2. Vai a **Network** tab
3. Seleziona **Throttling** dropdown
4. Scegli: **"Offline"** o **"Slow 3G"**

### Ora:

1. Fa logout/login oppure forza refresh (Ctrl+F5)
2. Click "Enable Notifications"

### Expected Result:

✅ App **continua a tentare** (non fallisce immediatamente)
✅ Se network ritorna online, subscription viene salvato
✅ Check console per: "Retry attempt X/3"

---

## ⚡ TEST 5: Circuit Breaker (2 min)

### Cosa testare:

Verifica che se il server è down, non fa cascading failures

### Simula errore:

Il backend espone uno stato di circuit breaker nei logs

Apri Firebase Console → Cloud Functions → Logs

Cerca: `CircuitBreaker` in send-push function

### Expected Result:

✅ Se molti errori: CircuitBreaker si apre (OPEN state)
✅ Requests vengono rifiutati (fast-fail)
✅ Dopo 60 secondi: tenta di recuperare (HALF_OPEN)
✅ Se server online: ritorna a CLOSED

---

## 🔐 TEST 6: Security Validation (2 min)

### Cosa testare:

Verifica che input validation funziona

### Test con dati invalidi:

```javascript
// Test 1: userId mancante
fetch('/.netlify/functions/save-push-subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscription: {
      /* ... */
    },
  }),
})
  .then((r) => r.json())
  .then(console.log);

// Expected: Error code "INVALID_USER_ID"
```

```javascript
// Test 2: Subscription size too large
fetch('/.netlify/functions/save-push-subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'test',
    subscription: {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test',
      keys: {
        p256dh: 'x'.repeat(10000), // Troppo grande!
        auth: 'y'.repeat(10000),
      },
    },
  }),
})
  .then((r) => r.json())
  .then(console.log);

// Expected: Error code "SUBSCRIPTION_TOO_LARGE"
```

### Expected Results:

✅ Invalid requests rejected
✅ Clear error messages
✅ No data saved to Firestore

---

## 📊 TEST 7: Monitor Production (Ongoing)

### Firestore Console Monitoring:

1. Apri: Firebase Console → Firestore → Collections
2. Clicca: **`pushSubscriptions`**
3. Guarda i documenti che arrivano quando users login

### Expected Pattern:

```
User logs in
  ↓
App requests notification permission
  ↓
User clicks "Allow"
  ↓
New document appears in pushSubscriptions
  ↓
Document ID: userId_deviceId
  ↓
Document has: endpoint, keys (p256dh, auth), timestamp
```

### Quota Monitoring:

1. Firebase Console → Storage
2. Guarda: **Firestore Quota Usage**
3. Dovrebbe essere stabile o in calo (dato che ottimizzato)

---

## ✅ SUCCESS CRITERIA

Sistema è **OK** quando:

- [ ] ✅ Firestore collection `pushSubscriptions` exists
- [ ] ✅ Test API manuale ritorna success
- [ ] ✅ Real user test: subscription salvato in Firestore
- [ ] ✅ Retry logic funziona (vedi retry logs)
- [ ] ✅ Circuit breaker previene cascading failures
- [ ] ✅ Input validation rigetta dati invalidi
- [ ] ✅ Multiple users può salvare subscriptions
- [ ] ✅ Nessun error nei logs di Cloud Functions
- [ ] ✅ Nessun error nei logs di Netlify Functions
- [ ] ✅ Firebase quota usage è stabile

---

## 🐛 TROUBLESHOOTING

### Problem: "Enable Notifications" button non appare

**Solution:**

```javascript
// Check service worker
navigator.serviceWorker.getRegistration();
// Should return: ServiceWorkerRegistration object

// If null, service worker not registered - check public/sw.js
```

### Problem: Subscription save returns 404

**Solution:**

```bash
# Verify Netlify functions are deployed
netlify functions:list

# Should show: save-push-subscription ✅

# If not, redeploy:
netlify deploy --prod
```

### Problem: Firestore document not appearing

**Solution:**

1. Check security rules: `firebase deploy --only firestore:rules`
2. Check that userId is valid Firebase UID format
3. Check Cloud Function logs for errors

### Problem: Circuit breaker stuck in OPEN state

**Solution:**

```bash
# Check send-push function logs
firebase functions:log

# Look for: CircuitBreaker state transitions
# Should eventually go: OPEN → HALF_OPEN → CLOSED
```

---

## 🎯 FINAL TEST CHECKLIST

Before declaring system LIVE:

- [ ] All 6 core tests passed
- [ ] No errors in logs
- [ ] Firestore quota stable
- [ ] Multiple users tested
- [ ] Retry logic verified
- [ ] Circuit breaker verified
- [ ] Input validation verified
- [ ] Security rules verified

---

## 📞 NEED HELP?

**Error Messages?**
→ Check `IMPLEMENTATION_SUMMARY_11_NOV_2025.md` for error codes

**Questions?**
→ Read `DEPLOYMENT_INSTRUCTIONS_11_NOV_2025.md` for more info

**Technical Details?**
→ See `ANALISI_SCRUPOLOSA_PUSH_NOTIFICATIONS_2025_11_11.md`

---

**Happy testing! 🧪**

Expected time: ~15 minutes for full test suite
Expected result: ✅ All tests pass, system LIVE!
