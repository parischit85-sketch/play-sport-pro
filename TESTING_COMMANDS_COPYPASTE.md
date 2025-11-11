# 🚀 TESTING COMMANDS - Ready to Copy-Paste

## TEST 1: Check Firestore Collection (Browser Console)

```javascript
// Verifica che collection esiste
db.collection('pushSubscriptions')
  .limit(1)
  .get()
  .then((snap) =>
    console.log('Collection exists:', snap.size === 0 ? 'empty' : snap.size + ' docs')
  );
```

---

## TEST 2: Save Test Subscription (Browser Console)

```javascript
fetch('/.netlify/functions/save-push-subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'test-user-' + Date.now(),
    subscription: {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-' + Math.random(),
      keys: {
        p256dh: 'dGVzdC1rZXktcDI1NmRo',
        auth: 'dGVzdC1hdXRoLWtleQ==',
      },
    },
    endpoint: 'https://fcm.googleapis.com/fcm/send/test-' + Math.random(),
  }),
})
  .then((r) => r.json())
  .then((result) => {
    console.log('✅ SUCCESS:', result);
    if (result.success) {
      console.log('Subscription ID:', result.id);
    }
  })
  .catch((err) => console.error('❌ ERROR:', err));
```

### Expected Output:

```
✅ SUCCESS: {
  success: true,
  id: "test-user-1731337400000_device-abc123",
  message: "Subscription saved"
}
```

---

## TEST 3: Check Service Worker Registration (Browser Console)

```javascript
navigator.serviceWorker.getRegistration().then((reg) => {
  if (reg) {
    console.log('✅ Service Worker REGISTERED');
    console.log('Scope:', reg.scope);
  } else {
    console.log('❌ Service Worker NOT registered');
  }
});
```

### Expected Output:

```
✅ Service Worker REGISTERED
Scope: https://your-app-url.com/
```

---

## TEST 4: Test Invalid Input (Should Fail) (Browser Console)

```javascript
// Test 1: Missing userId
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
```

### Expected Output:

```
{
  success: false,
  error: "INVALID_USER_ID",
  message: "userId is required and must be a valid Firebase UID"
}
```

---

## TEST 5: Test Size Validation (Should Fail) (Browser Console)

```javascript
// Test: Subscription too large
fetch('/.netlify/functions/save-push-subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'test-user-123',
    subscription: {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test',
      keys: {
        p256dh: 'x'.repeat(15000), // WAY too large
        auth: 'y'.repeat(15000),
      },
    },
    endpoint: 'https://fcm.googleapis.com/fcm/send/test',
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

### Expected Output:

```
{
  success: false,
  error: "SUBSCRIPTION_TOO_LARGE",
  message: "Subscription object exceeds 4KB limit"
}
```

---

## TEST 6: Check Firestore Security Rules (Browser Console)

```javascript
// Try to read pushSubscriptions directly (should fail)
db.collection('pushSubscriptions')
  .doc('test-doc')
  .get()
  .then((doc) => console.log('❌ SECURITY ISSUE: Could read direct access'))
  .catch((err) => console.log('✅ CORRECT: Direct access denied -', err.code));
```

### Expected Output:

```
✅ CORRECT: Direct access denied - permission-denied
```

---

## TEST 7: Real User Workflow Test (Manual)

### Step 1: Logout

```javascript
// In browser console (if auth context available)
localStorage.clear();
location.reload();
```

### Step 2: Login with real account

- Email: your-test-email@example.com
- Password: \*\*\*\*

### Step 3: Look for notification banner

- Should see: "Enable Notifications" button or link

### Step 4: Click Enable

- Browser will prompt: "Allow notifications?"
- Click: "Allow"

### Step 5: Verify in Firestore

```javascript
// After allowing notifications, run:
db.collection('pushSubscriptions')
  .where('userId', '==', 'PASTE_YOUR_USER_ID_HERE')
  .get()
  .then((snap) => {
    console.log('Documents found:', snap.size);
    snap.forEach((doc) => console.log('Doc:', doc.id, doc.data()));
  });
```

### Expected Result:

```
Documents found: 1
Doc: your-user-id_device-xyz {
  endpoint: "https://fcm.googleapis.com/fcm/send/...",
  keys: { p256dh: "...", auth: "..." },
  userId: "your-user-id",
  createdAt: Timestamp,
  subscriptionHash: "..."
}
```

---

## TEST 8: Monitor Cloud Function Logs (Terminal)

```bash
# Watch Cloud Function logs
firebase functions:log

# In another terminal, trigger some subscriptions
# You should see logs like:
# > [sendPush] Sending to 5 subscribers
# > [saveSubscription] New subscription from user: abc123
# > [CircuitBreaker] State: CLOSED (operational)
```

---

## TEST 9: Check Netlify Function Status (Terminal)

```bash
# List all Netlify functions
netlify functions:list

# Should show:
# save-push-subscription ✅
# send-push ✅
# get-user-devices ✅
# deactivate-old-devices ✅
# send-bulk-push ✅
```

---

## TEST 10: Monitor Firestore Quota (Console)

### In Firebase Console:

1. Go to: **Firestore → Usage**
2. Check:
   - Read operations: Should be stable or trending down
   - Write operations: Should correspond to user subscriptions
   - Stored data: Should be small (subscriptions are tiny)

### Expected:

```
Monthly cost for push notifications: ~$0.01 - $0.10 (very cheap!)
```

---

## ✅ FULL TEST CHECKLIST - Copy to Running Log

```
TEST 1: Firestore Collection  ☐ PASS  ☐ FAIL
TEST 2: Save Subscription     ☐ PASS  ☐ FAIL
TEST 3: Service Worker        ☐ PASS  ☐ FAIL
TEST 4: Invalid Input         ☐ PASS  ☐ FAIL
TEST 5: Size Validation       ☐ PASS  ☐ FAIL
TEST 6: Security Rules        ☐ PASS  ☐ FAIL
TEST 7: Real User Workflow    ☐ PASS  ☐ FAIL
TEST 8: Cloud Function Logs   ☐ PASS  ☐ FAIL
TEST 9: Netlify Functions     ☐ PASS  ☐ FAIL
TEST 10: Firestore Quota      ☐ PASS  ☐ FAIL

OVERALL RESULT: ☐ ALL PASS ✅  ☐ SOME FAIL ❌
```

---

## 🆘 IF TESTS FAIL

1. **Check logs:**

   ```bash
   firebase functions:log
   netlify functions:log
   ```

2. **Check Firestore rules:**

   ```bash
   firebase deploy --only firestore:rules --debug
   ```

3. **Check indices:**

   ```bash
   firebase firestore:indexes
   ```

4. **Clear cache and retry:**
   ```bash
   npm run build
   firebase deploy --only functions
   netlify deploy --prod
   ```

---

**Total Testing Time: ~20 minutes**

**Ready? Let's test!** 🧪
