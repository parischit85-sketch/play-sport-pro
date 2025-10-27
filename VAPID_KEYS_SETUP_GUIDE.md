# 🔑 VAPID Keys Setup Guide - Push Notifications v2.0

**Obiettivo**: Configurare VAPID keys per abilitare Web Push Notifications  
**Tempo Stimato**: 15 minuti  
**Prerequisiti**: Firebase CLI installato, accesso al progetto m-padelweb

---

## 📋 Cosa Sono le VAPID Keys?

**VAPID** (Voluntary Application Server Identification) è uno standard che:
- Identifica univocamente il server che invia push notifications
- Previene spam e abuse delle push notifications
- Richiesto da tutti i browser moderni (Chrome, Firefox, Safari, Edge)

Le VAPID keys consistono in una **coppia di chiavi**:
- **Public Key**: Condivisa con il browser (client-side)
- **Private Key**: Mantenuta segreta sul server (Firebase Functions)

---

## 🚀 Step 1: Generare VAPID Keys

### Opzione A: Usando web-push (Consigliato)

```bash
# 1. Installa web-push globalmente
npm install -g web-push

# 2. Genera le VAPID keys
web-push generate-vapid-keys

# Output:
# =======================================
# 
# Public Key:
# BNxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
# 
# Private Key:
# abcdefghijklmnopqrstuvwxyz1234567890ABCDEFG
# 
# =======================================
```

### Opzione B: Usando Firebase Console

1. Vai a: https://console.firebase.google.com/project/m-padelweb/settings/cloudmessaging
2. Sezione "Web Push certificates"
3. Click "Generate key pair"
4. Copia Public Key e Private Key

### Opzione C: Usando Node.js Script

Crea file `generate-vapid-keys.js`:

```javascript
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('='.repeat(60));
console.log('\n✅ VAPID Keys Generated Successfully!\n');
console.log('='.repeat(60));
console.log('\n📌 Public Key (client-side):');
console.log(vapidKeys.publicKey);
console.log('\n🔒 Private Key (server-side - KEEP SECRET!):');
console.log(vapidKeys.privateKey);
console.log('\n' + '='.repeat(60));
console.log('\n⚠️  IMPORTANT: Store private key securely!');
console.log('    Never commit to git or expose publicly.\n');
```

```bash
# Installa web-push localmente
npm install web-push --save-dev

# Esegui lo script
node generate-vapid-keys.js
```

---

## 🔐 Step 2: Configurare VAPID Keys in Firebase

### A. Configurare in Firebase Functions

```bash
# Sostituisci con le tue keys generate
firebase functions:config:set \
  vapid.public_key="BNxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" \
  vapid.private_key="abcdefghijklmnopqrstuvwxyz1234567890ABCDEFG" \
  --project m-padelweb
```

### B. Verificare Configurazione

```bash
# Verifica che le keys siano state salvate
firebase functions:config:get --project m-padelweb

# Output atteso:
# {
#   "vapid": {
#     "public_key": "BNxXXXXXXX...",
#     "private_key": "abcdefghijk..."
#   }
# }
```

### C. Aggiungere al .env (Frontend)

Crea/aggiorna file `.env` nella root del progetto:

```bash
# Public VAPID Key (safe to expose in frontend)
VITE_VAPID_PUBLIC_KEY=BNxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**⚠️ IMPORTANTE**: 
- La **public key** va in `.env` (esposta al client)
- La **private key** resta SOLO in Firebase Functions config (segreta)

---

## 📝 Step 3: Aggiornare Codice Frontend

### File: `src/utils/push.js`

```javascript
// Get VAPID public key from environment
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

if (!VAPID_PUBLIC_KEY) {
  console.error('❌ VAPID_PUBLIC_KEY not configured in .env');
}

/**
 * Request push notification permission from user
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    throw new Error('Push notifications not supported');
  }

  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Workers not supported');
  }

  // Request permission
  const permission = await Notification.requestPermission();
  
  if (permission !== 'granted') {
    throw new Error('Notification permission denied');
  }

  // Get service worker registration
  const registration = await navigator.serviceWorker.ready;

  // Subscribe to push notifications
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });

  // Save subscription to Firestore
  await saveSubscriptionToFirestore(subscription);

  return subscription;
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

---

## 🔧 Step 4: Aggiornare Cloud Functions

### File: `functions/sendPushNotification.js`

```javascript
const functions = require('firebase-functions');
const webpush = require('web-push');

// Get VAPID keys from Firebase config
const vapidPublicKey = functions.config().vapid.public_key;
const vapidPrivateKey = functions.config().vapid.private_key;

// Configure web-push
webpush.setVapidDetails(
  'mailto:support@playsportpro.com', // Your email
  vapidPublicKey,
  vapidPrivateKey
);

/**
 * Send push notification to user
 */
exports.sendPushNotification = functions.https.onCall(async (data, context) => {
  const { userId, title, body, icon, badge, data: notificationData } = data;

  // Get user's push subscription from Firestore
  const subscriptionDoc = await admin.firestore()
    .collection('pushSubscriptions')
    .doc(userId)
    .get();

  if (!subscriptionDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'No push subscription found');
  }

  const subscription = subscriptionDoc.data().subscription;

  // Prepare payload
  const payload = JSON.stringify({
    title,
    body,
    icon: icon || '/icon-192x192.png',
    badge: badge || '/badge-72x72.png',
    data: notificationData || {}
  });

  try {
    // Send notification
    const result = await webpush.sendNotification(subscription, payload);
    
    console.log('✅ Push notification sent successfully', { userId, result });
    
    return { success: true, result };
  } catch (error) {
    console.error('❌ Failed to send push notification:', error);
    
    // Handle errors (410 = subscription expired)
    if (error.statusCode === 410) {
      // Delete expired subscription
      await subscriptionDoc.ref.delete();
      console.log('🗑️ Deleted expired subscription for user:', userId);
    }
    
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

---

## 🔄 Step 5: Redeploy

### A. Rebuild Frontend

```bash
# Rebuild con nuova .env
npm run build

# Verifica che VAPID key sia presente nel bundle
grep -r "VITE_VAPID" dist/
```

### B. Redeploy Functions

```bash
# Deploy functions con nuova config
firebase deploy --only functions --project m-padelweb

# Output atteso:
# ✔ functions[sendPushNotification]: Successful update operation.
```

### C. Redeploy Hosting

```bash
# Deploy frontend aggiornato
firebase deploy --only hosting --project m-padelweb

# Output atteso:
# ✔ hosting[m-padelweb]: release complete
```

---

## ✅ Step 6: Verificare Setup

### Test 1: Check Environment Variables

```bash
# Frontend - verifica .env
cat .env | grep VAPID

# Functions - verifica config
firebase functions:config:get --project m-padelweb
```

### Test 2: Check Browser Console

Apri https://m-padelweb.web.app e in console:

```javascript
// Verifica che VAPID key sia caricata
console.log('VAPID Public Key:', import.meta.env.VITE_VAPID_PUBLIC_KEY);

// Dovrebbe stampare la tua public key
```

### Test 3: Request Permission

```javascript
// In console browser:
const permission = await Notification.requestPermission();
console.log('Permission:', permission); // "granted"

// Subscribe
const registration = await navigator.serviceWorker.ready;
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
});

console.log('✅ Subscription created:', subscription);
```

### Test 4: Send Test Notification

```javascript
// Da Cloud Functions console o tramite HTTP
const result = await firebase.functions().httpsCallable('sendPushNotification')({
  userId: 'YOUR_USER_ID',
  title: 'Test Push v2.0',
  body: 'VAPID keys configurate correttamente! 🎉',
  icon: '/icon-192x192.png'
});

console.log('Result:', result);
```

Se ricevi la notificazione → ✅ **VAPID SETUP COMPLETE!**

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Genera nuove VAPID keys per ogni progetto/environment
- ✅ Store private key in Firebase Functions config (encrypted)
- ✅ Usa `.gitignore` per escludere `.env` dal version control
- ✅ Ruota le keys periodicamente (ogni 6-12 mesi)
- ✅ Monitora l'uso delle keys con Firebase Analytics

### ❌ DON'T:
- ❌ **MAI** committare private key in git
- ❌ **MAI** esporre private key nel frontend
- ❌ Non condividere keys via email/chat non criptata
- ❌ Non usare le stesse keys per dev/staging/production

---

## 🐛 Troubleshooting

### Problema: "Missing VAPID key"

**Soluzione**:
```bash
# Verifica che .env esista
ls -la .env

# Verifica contenuto
cat .env | grep VAPID

# Se mancante, crea .env con:
echo "VITE_VAPID_PUBLIC_KEY=YOUR_PUBLIC_KEY" > .env

# Rebuild
npm run build
```

### Problema: "Push subscription failed"

**Soluzione**:
```javascript
// In console browser, verifica formato key:
const key = import.meta.env.VITE_VAPID_PUBLIC_KEY;
console.log('Key length:', key.length); // Should be 88 chars
console.log('Starts with B:', key[0] === 'B'); // Should be true
```

### Problema: "410 Gone" error

**Causa**: Subscription expired o revocata dal browser

**Soluzione**:
```javascript
// Cloud Function auto-cleanup (già implementato):
if (error.statusCode === 410) {
  await subscriptionDoc.ref.delete();
  console.log('Deleted expired subscription');
}
```

### Problema: "Invalid VAPID key format"

**Soluzione**:
```bash
# Verifica formato base64
echo "YOUR_PUBLIC_KEY" | base64 -d | wc -c
# Should output: 65 bytes

# Rigenera keys se necessario
web-push generate-vapid-keys
```

---

## 📊 Monitoring

### Check VAPID Key Usage

```javascript
// Firebase Analytics event
analytics.logEvent('push_subscription_created', {
  vapid_key_hash: sha256(vapidPublicKey).substring(0, 8),
  timestamp: Date.now()
});
```

### Dashboard Metrics

Monitor in Firebase Console:
- Total subscriptions created
- Active subscriptions
- Failed subscriptions (410 errors)
- Push notification delivery rate

---

## 📝 Checklist Finale

- [ ] ✅ VAPID keys generate
- [ ] ✅ Keys configurate in Firebase Functions
- [ ] ✅ Public key aggiunta a `.env`
- [ ] ✅ `.env` aggiunto a `.gitignore`
- [ ] ✅ Frontend code aggiornato
- [ ] ✅ Cloud Functions aggiornate
- [ ] ✅ Frontend rebuilded
- [ ] ✅ Functions redeployed
- [ ] ✅ Hosting redeployed
- [ ] ✅ Test notification inviata e ricevuta
- [ ] ✅ Subscription salvata in Firestore
- [ ] ✅ Analytics tracking attivo

---

## 🎯 Quick Start Commands

```bash
# 1. Generate keys
web-push generate-vapid-keys

# 2. Configure in Firebase
firebase functions:config:set \
  vapid.public_key="YOUR_PUBLIC_KEY" \
  vapid.private_key="YOUR_PRIVATE_KEY" \
  --project m-padelweb

# 3. Add to .env
echo "VITE_VAPID_PUBLIC_KEY=YOUR_PUBLIC_KEY" >> .env

# 4. Rebuild & Deploy
npm run build
firebase deploy --only functions,hosting --project m-padelweb

# 5. Test
# Open https://m-padelweb.web.app and test push notifications
```

---

**Setup Time**: ~15 minuti  
**Status**: ⏳ **PENDING - EXECUTE ASAP**  
**Priority**: 🔴 **CRITICAL** (Push notifications non funzionano senza)

---

*Last Updated: 16 Ottobre 2025*  
*Project: Play Sport Pro - Push Notifications v2.0*
