# ❓ Push Notifications v2.0 - Troubleshooting FAQ

**Version**: 2.0.0  
**Last Updated**: 16 Ottobre 2025  
**Audience**: Developers, Support Team, End Users

---

## 📋 Table of Contents

1. [User-Facing Issues](#user-facing-issues)
2. [Developer Issues](#developer-issues)
3. [System Issues](#system-issues)
4. [Performance Issues](#performance-issues)
5. [Integration Issues](#integration-issues)

---

## User-Facing Issues

### ❌ "Non ricevo le notifiche push"

**Cause Comuni**:

1. **Permessi non concessi**
   - **Verifica**: Browser > Impostazioni > Privacy > Notifiche
   - **Soluzione**: 
     ```javascript
     // Check permission status
     console.log('Permission:', Notification.permission);
     // Expected: 'granted'
     
     // Request permission
     const permission = await Notification.requestPermission();
     ```

2. **Service Worker non registrato**
   - **Verifica**:
     ```javascript
     navigator.serviceWorker.getRegistrations().then(regs => {
       console.log('SW registrations:', regs.length);
     });
     ```
   - **Soluzione**:
     ```javascript
     // Re-register service worker
     await navigator.serviceWorker.register('/sw.js');
     ```

3. **Subscription scaduta**
   - **Verifica**: Firestore > `pushSubscriptions` > user document > `status: 'expired'`
   - **Soluzione**:
     ```javascript
     import { subscribeToPushNotifications } from '@/utils/push';
     
     // Re-subscribe
     await subscribeToPushNotifications(userId);
     ```

4. **Browser non supportato**
   - **Browsers supportati**: Chrome 50+, Firefox 44+, Edge 79+, Safari 16+
   - **Verifica**:
     ```javascript
     if ('PushManager' in window) {
       console.log('✅ Push supported');
     } else {
       console.log('❌ Push NOT supported');
     }
     ```

**Step-by-Step Fix (Utente)**:

1. Vai su **Impostazioni Profilo** > **Notifiche**
2. Clicca **"Abilita Notifiche Push"**
3. Quando richiesto, clicca **"Consenti"** nel browser
4. Verifica che appaia messaggio: ✅ "Notifiche abilitate"
5. Testa con **"Invia Notifica Test"**

---

### ⏱️ "Le notifiche arrivano in ritardo"

**Cause**:

1. **Smart Scheduling abilitato**
   - Il sistema ottimizza l'orario di invio
   - **Soluzione**: Per notifiche urgenti, usa `priority: 'critical'`
   ```javascript
   await smartScheduler.schedule({
     userId,
     notification,
     priority: 'critical'  // Bypass scheduling
   });
   ```

2. **Quiet Hours attive**
   - Default: 22:00 - 08:00
   - **Verifica**: Firestore > `users/{userId}` > `preferences.quietHours`
   - **Soluzione**: Disabilita quiet hours per notifiche critiche
   ```javascript
   await smartScheduler.schedule({
     userId,
     notification,
     respectQuietHours: false
   });
   ```

3. **Frequenza capping**
   - Max 10/giorno, 3/ora di default
   - **Verifica**:
     ```javascript
     import { smartScheduler } from '@/services/smartScheduler';
     const canSend = await smartScheduler.checkFrequencyCap(userId);
     console.log('Can send:', canSend);
     ```

4. **Device in background/offline**
   - Le notifiche vengono accodate
   - **Soluzione**: Normalmente si risolvono quando device torna online

---

### 🔕 "Continuo a ricevere notifiche che non voglio"

**Soluzioni**:

1. **Disabilita categorie specifiche**:
   - Vai su **Impostazioni** > **Notifiche**
   - Deseleziona categorie indesiderate:
     - ☐ Promozioni
     - ☐ Aggiornamenti sociali
     - ☑ Messaggi importanti (consigliato)
     - ☑ Prenotazioni (consigliato)

2. **Disabilita completamente**:
   ```javascript
   import { unsubscribeFromPushNotifications } from '@/utils/push';
   
   await unsubscribeFromPushNotifications(userId);
   ```

3. **Pause temporanea (Snooze)**:
   - Impostazioni > Notifiche > **"Pausa per 1 ora"**
   - Riprenderanno automaticamente dopo 1h

---

### 📱 "Le notifiche non hanno azioni/pulsanti"

**Cause**:

1. **Browser non supporta action buttons**:
   - Safari < 16.4 non supporta actions
   - **Soluzione**: Aggiorna browser o usa Chrome/Firefox

2. **Template non include actions**:
   - **Verifica**:
     ```javascript
     const notification = templateRenderer.render('BOOKING_CONFIRMED', vars);
     console.log('Actions:', notification.actions);
     // Expected: [{ action: '...', title: '...' }, ...]
     ```

3. **Service Worker non gestisce notificationclick**:
   - **Verifica**: `public/sw.js` deve avere event listener
   - **Soluzione**: Vedi [Service Worker Setup](#service-worker-setup)

---

## Developer Issues

### 🐛 "Error: VAPID keys not configured"

**Soluzione**:

```bash
# 1. Genera VAPID keys
npx web-push generate-vapid-keys

# Output:
# Public Key: BNx...xyz
# Private Key: 4hR...abc

# 2. Configura in Firebase
firebase functions:config:set \
  vapid.public_key="BNx...xyz" \
  vapid.private_key="4hR...abc"

# 3. Aggiorna .env locale
echo "VITE_VAPID_PUBLIC_KEY=BNx...xyz" >> .env

# 4. Redeploy
firebase deploy --only functions
npm run build
```

---

### 🚫 "Circuit breaker is OPEN"

**Immediate Fix**:

```javascript
import { pushService } from '@/services/pushService';

// Option 1: Manual reset (use cautiously)
pushService.circuitBreaker.reset();

// Option 2: Wait for auto-recovery (60 seconds)
// Circuit breaker transitions: OPEN → HALF_OPEN → CLOSED
```

**Root Cause Investigation**:

```bash
# Check recent errors
firebase functions:log --only sendNotification --limit 50

# Common causes:
# - 401 Unauthorized: VAPID keys invalid/expired
# - 404 Not Found: Subscription deleted by browser
# - 410 Gone: User unsubscribed
# - 500 Server Error: FCM service issue
```

**Prevention**:

```javascript
// Increase failure threshold (default: 50%)
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 60,  // 60% instead of 50%
  timeout: 45000,        // 45s instead of 30s
  resetTimeout: 90000    // 90s instead of 60s
});
```

---

### ⚠️ "Missing Firestore index" error

**Soluzione**:

```bash
# 1. Deploy all indexes
firebase deploy --only firestore:indexes

# 2. Check deployment status
firebase firestore:indexes:list

# 3. Wait for indexes to build (5-30 minutes)
# Firebase Console > Firestore > Indexes > Status

# 4. Verify index used in query
# Firestore Console > Usage > Query statistics
```

**Index Configuration**:

Tutti gli indici sono definiti in `firestore.indexes.js`:

```javascript
// Required indexes (11 total):
// 1. notificationEvents: (userId, timestamp DESC)
// 2. notificationEvents: (event, timestamp DESC)
// 3. notificationEvents: (channel, event, timestamp DESC)
// ... (8 more)
```

**Emergency Workaround** (temporaneo):

```javascript
// Use simple query without composite index
const events = await getDocs(
  query(
    collection(db, 'notificationEvents'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(100)
  )
);
```

---

### 🔴 "Notification not rendering in template"

**Debug Steps**:

```javascript
import { templateRenderer } from '@/services/notificationTemplateSystem';

// 1. Check available templates
const templates = templateRenderer.getAllTemplates();
console.log('Available:', templates.map(t => t.id));

// 2. Verify variables
const template = templateRenderer.getTemplate('CERTIFICATE_EXPIRING');
console.log('Required variables:', template.variables);
// Expected: ['daysLeft', 'expiryDate', 'certificateId']

// 3. Test render
const notification = templateRenderer.render('CERTIFICATE_EXPIRING', {
  daysLeft: 7,
  expiryDate: '2025-10-25',
  certificateId: 'cert-123'
});
console.log('Rendered:', notification);

// 4. Check for missing variables
if (notification.body.includes('{{')) {
  console.error('❌ Missing variables in template!');
}
```

**Common Mistakes**:

```javascript
// ❌ WRONG: Variable name mismatch
templateRenderer.render('CERTIFICATE_EXPIRING', {
  days: 7,  // Should be 'daysLeft'
  date: '2025-10-25'  // Should be 'expiryDate'
});

// ✅ CORRECT: Exact variable names
templateRenderer.render('CERTIFICATE_EXPIRING', {
  daysLeft: 7,
  expiryDate: '2025-10-25',
  certificateId: 'cert-123'
});
```

---

### 📊 "Analytics events not tracking"

**Verifiche**:

```javascript
import { notificationAnalytics } from '@/services/notificationAnalytics';

// 1. Check queue status
console.log('Queued events:', notificationAnalytics.eventQueue.length);

// 2. Manually flush queue
await notificationAnalytics.flushEventQueue();
console.log('Events flushed to Firestore');

// 3. Verify Firestore writes
// Firebase Console > Firestore > notificationEvents
```

**Event Not Firing**:

```javascript
// ❌ WRONG: Missing await
notificationAnalytics.trackSent({ ... });  // Fire-and-forget

// ✅ CORRECT: Await to ensure completion
await notificationAnalytics.trackSent({ ... });

// ✅ ALTERNATIVE: Use queue (async)
notificationAnalytics.trackSent({ ... });
// Events auto-flush every 30 seconds
```

**Firebase Analytics Not Showing**:

```bash
# 1. Verify Firebase Analytics enabled
# Firebase Console > Analytics > Dashboard

# 2. Check debug mode
firebase analytics:debug --view "YOUR_VIEW_ID"

# 3. Test event
import { logEvent } from 'firebase/analytics';
logEvent(analytics, 'test_event', { test: true });

# 4. Check DebugView (Firebase Console)
# Analytics > DebugView (shows events in real-time)
```

---

## System Issues

### 💾 "Firestore quota exceeded"

**Immediate Actions**:

```bash
# 1. Check current usage
firebase projects:list
firebase --project YOUR_PROJECT_ID firestore:usage

# 2. Run emergency cleanup
firebase functions:shell
> triggerCleanupManually({}, { auth: { uid: 'admin-uid' } })

# 3. Temporary workaround: Reduce retention
import { cleanupService } from '@/services/notificationCleanupService';
cleanupService.setRetentionDays({
  events: 30,       // Reduce from 90 to 30 days
  deliveries: 30,   // Reduce from 60 to 30 days
  scheduled: 7      // Reduce from 30 to 7 days
});
await cleanupService.runFullCleanup();
```

**Long-term Solutions**:

1. **Upgrade Firestore plan**:
   - Firebase Console > Usage and billing > Modify plan
   - Spark (Free) → Blaze (Pay as you go)

2. **Optimize queries**:
   ```javascript
   // ❌ WRONG: Query all events
   const events = await getDocs(collection(db, 'notificationEvents'));
   
   // ✅ CORRECT: Limit and filter
   const events = await getDocs(
     query(
       collection(db, 'notificationEvents'),
       where('timestamp', '>', thirtyDaysAgo),
       limit(100)
     )
   );
   ```

3. **Enable automatic cleanup**:
   ```bash
   # Deploy scheduled cleanup function
   firebase deploy --only functions:scheduledNotificationCleanup
   
   # Runs daily at 2 AM
   ```

---

### 🔥 "Cloud Function timeout"

**Error**:
```
Function execution took 540000 ms, finished with status: 'timeout'
```

**Solutions**:

```javascript
// functions/index.js

// 1. Increase timeout (max 540s for HTTP, 540s for background)
exports.sendBulkNotifications = functions
  .runWith({
    timeoutSeconds: 540,    // Max 9 minutes
    memory: '2GB'           // Increase memory
  })
  .https.onCall(async (data, context) => {
    // Your code
  });

// 2. Implement pagination for large batches
async function sendBulkNotifications(userIds) {
  const BATCH_SIZE = 100;
  
  for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
    const batch = userIds.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(userId => sendNotification(userId)));
    
    console.log(`Processed ${i + BATCH_SIZE}/${userIds.length}`);
  }
}

// 3. Use Task Queue for very large jobs
const { CloudTasksClient } = require('@google-cloud/tasks');
const tasksClient = new CloudTasksClient();

// Queue 1000+ notifications
for (const userId of userIds) {
  await tasksClient.createTask({
    parent: queuePath,
    task: {
      httpRequest: {
        httpMethod: 'POST',
        url: 'https://us-central1-PROJECT.cloudfunctions.net/sendNotification',
        body: Buffer.from(JSON.stringify({ userId })).toString('base64')
      }
    }
  });
}
```

---

### 🌐 "CORS error when calling Cloud Function"

**Error**:
```
Access to fetch at 'https://...' from origin 'https://playsportpro.com' 
has been blocked by CORS policy
```

**Soluzione**:

```javascript
// functions/index.js

const cors = require('cors')({ origin: true });

exports.sendNotification = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Your function code
    res.json({ success: true });
  });
});

// Alternative: Use onCall (CORS handled automatically)
exports.sendNotification = functions.https.onCall(async (data, context) => {
  // No CORS config needed
  return { success: true };
});
```

**Frontend**:

```javascript
// ✅ Use Firebase SDK (recommended)
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const sendNotification = httpsCallable(functions, 'sendNotification');

const result = await sendNotification({ userId: 'user-123' });

// ❌ Avoid direct fetch (requires CORS config)
const response = await fetch('https://...cloudfunctions.net/sendNotification');
```

---

## Performance Issues

### 🐌 "Slow query: notificationEvents"

**Symptoms**:
- Query takes >5 seconds
- Console warning: "Consider adding index"

**Optimization**:

```javascript
// ❌ SLOW: No index, large dataset
const events = await getDocs(
  query(
    collection(db, 'notificationEvents'),
    where('userId', '==', userId),
    where('event', '==', 'notification_clicked'),
    orderBy('timestamp', 'desc')
  )
);

// ✅ FAST: Use composite index
// Index: (userId, event, timestamp DESC)
// Already defined in firestore.indexes.js

// ✅ FASTER: Add limit
const events = await getDocs(
  query(
    collection(db, 'notificationEvents'),
    where('userId', '==', userId),
    where('event', '==', 'notification_clicked'),
    orderBy('timestamp', 'desc'),
    limit(50)  // Only fetch what you need
  )
);

// ✅ FASTEST: Cache results
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

let cachedEvents = [];
const unsubscribe = onSnapshot(
  query(
    collection(db, 'notificationEvents'),
    where('userId', '==', userId),
    limit(50)
  ),
  (snapshot) => {
    cachedEvents = snapshot.docs.map(doc => doc.data());
  }
);
```

---

### 📈 "High Firestore costs"

**Analysis**:

```javascript
// Check read/write counts
import { notificationAnalytics } from '@/services/notificationAnalytics';

const stats = await notificationAnalytics.getDashboardMetrics(24 * 60);
console.log('Events tracked (24h):', stats.summary.sent);
// Each event = ~3 writes (notificationEvents, analytics, user stats)
```

**Cost Reduction**:

1. **Batch writes** (combine multiple updates):
   ```javascript
   import { writeBatch } from 'firebase/firestore';
   
   const batch = writeBatch(db);
   batch.set(doc1Ref, data1);
   batch.update(doc2Ref, data2);
   batch.delete(doc3Ref);
   await batch.commit();  // 3 operations counted as 1
   ```

2. **Use local cache**:
   ```javascript
   import { enableIndexedDbPersistence } from 'firebase/firestore';
   
   await enableIndexedDbPersistence(db);
   // Reduces redundant reads from server
   ```

3. **Reduce analytics granularity**:
   ```javascript
   // ❌ Track every event (expensive)
   await trackSent();
   await trackDelivered();
   await trackClicked();
   
   // ✅ Sample 10% of events
   if (Math.random() < 0.1) {
     await trackEvent();
   }
   ```

4. **Cleanup old data**:
   ```bash
   # Enable scheduled cleanup (already configured)
   firebase deploy --only functions:scheduledNotificationCleanup
   ```

**Expected Costs**:
- 10,000 notifications/month: ~€5-10/month
- 100,000 notifications/month: ~€40-60/month

---

## Integration Issues

### 🔌 "Email fallback not working"

**Verifiche**:

```javascript
import { notificationCascade } from '@/services/notificationCascade';

// 1. Check cascade configuration
const result = await notificationCascade.send(userId, notification, {
  channels: ['push', 'email'],  // Ensure email is included
  type: 'PAYMENT_DUE'
});

console.log('Attempts:', result.attempts);
// Expected: [
//   { channel: 'push', success: false, error: '...' },
//   { channel: 'email', success: true }
// ]

// 2. Verify email service configured
// .env file should have:
// VITE_EMAIL_SERVICE_API_KEY=xxx
```

**Common Issues**:

1. **Email provider API key invalid**:
   ```bash
   # Test email API
   curl -X POST https://api.emailprovider.com/send \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -d '{"to":"test@example.com","subject":"Test"}'
   ```

2. **User email missing**:
   ```javascript
   const userDoc = await getDoc(doc(db, 'users', userId));
   console.log('User email:', userDoc.data().email);
   // Must have valid email for fallback
   ```

3. **Email disabled in user preferences**:
   ```javascript
   const prefs = userDoc.data().preferences;
   console.log('Email notifications:', prefs.emailNotifications);
   // Must be true
   ```

---

### 📞 "SMS fallback expensive"

**Problem**: SMS costs €0.05 each, budget exceeded

**Solutions**:

1. **Set max cost threshold**:
   ```javascript
   await notificationCascade.send(userId, notification, {
     channels: ['push', 'email', 'sms'],
     maxCost: 0.01  // Don't exceed €0.01 (skip SMS)
   });
   ```

2. **Disable SMS for non-critical**:
   ```javascript
   const channels = notification.category === 'critical'
     ? ['push', 'email', 'sms']
     : ['push', 'email'];  // No SMS for promotional
   
   await notificationCascade.send(userId, notification, { channels });
   ```

3. **Only SMS for specific types**:
   ```javascript
   import { NOTIFICATION_TYPES } from '@/services/notificationCascade';
   
   const SMS_ENABLED_TYPES = [
     NOTIFICATION_TYPES.PAYMENT_DUE,
     NOTIFICATION_TYPES.CERTIFICATE_EXPIRING
   ];
   
   const channels = SMS_ENABLED_TYPES.includes(type)
     ? ['push', 'email', 'sms']
     : ['push', 'email'];
   ```

---

## Appendix

### Service Worker Setup

**public/sw.js**:

```javascript
// Service Worker for Push Notifications v2.0

self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: data.icon || '/icons/notification-default.png',
    image: data.image,
    badge: '/icons/badge.png',
    vibrate: data.vibrate || [200, 100, 200],
    data: data.data,
    actions: data.actions || [],
    requireInteraction: data.requiresInteraction || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const urlToOpen = event.notification.data.deepLink || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Focus existing window if open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
  
  // Track click event
  fetch('/api/analytics/notification-clicked', {
    method: 'POST',
    body: JSON.stringify({
      notificationId: event.notification.data.notificationId,
      action: event.action
    })
  });
});
```

---

### Useful Commands Cheat Sheet

```bash
# Health check
firebase firestore:get pushSubscriptions --limit 1

# Check logs
firebase functions:log --limit 50

# Deploy specific component
firebase deploy --only hosting
firebase deploy --only functions:scheduledNotificationCleanup
firebase deploy --only firestore:indexes

# Manual cleanup trigger
firebase functions:shell
> triggerCleanupManually({}, { auth: { uid: 'admin-uid' } })

# Export Firestore data
firebase firestore:export gs://your-bucket/backup-$(date +%Y%m%d)

# Check index status
firebase firestore:indexes:list

# Generate VAPID keys
npx web-push generate-vapid-keys

# Test notification (browser console)
new Notification('Test', { body: 'Testing notifications' })

# Check service worker
navigator.serviceWorker.getRegistrations()

# Force SW update
navigator.serviceWorker.getRegistrations().then(regs => 
  regs.forEach(reg => reg.update())
)
```

---

**Version**: 2.0.0  
**Last Updated**: 16 Ottobre 2025  
**Maintained by**: Play Sport Pro Support Team  
**Support**: support@playsportpro.com
