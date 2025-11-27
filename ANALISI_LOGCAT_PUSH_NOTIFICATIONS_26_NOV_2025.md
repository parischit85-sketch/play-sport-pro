# 🔍 ANALISI LOGCAT - Push Notifications Non Funzionanti
**Data Analisi**: 26 Novembre 2025  
**Dispositivo**: Samsung SM-S928B (Android API 35)  
**Status**: 🔴 IN CORSO - Analisi dei problemi  

---

## 📋 PROBLEMI IDENTIFICATI DALL'ANALISI DEL CODICE

### 🔴 PROBLEMA CRITICO #1: Subscription non salvata su Firestore (Android Native)

**File**: `src/services/capacitorPushService.js` (linea 100-170)

**Codice attuale**:
```javascript
export async function registerNativePush(userId) {
  // ...codice esistente...
  
  // Salva token su Firestore
  const subscriptionData = {
    userId,
    firebaseUid: userId,
    deviceId,
    platform,
    type: 'native',
    createdAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  };

  if (platform === 'android') {
    subscriptionData.fcmToken = token.value;
  } else if (platform === 'ios') {
    subscriptionData.apnsToken = token.value;
  }

  const docId = `${userId}_${deviceId}`;
  await setDoc(doc(db, 'pushSubscriptions', docId), subscriptionData);
}
```

**❌ PROBLEMA**: Manca il campo `active` che è quello usato dalla Cloud Function per filtrare le subscription attive!

**Verifica dalla documentazione**:
- File `DEBUG_PUSH_ANDREA_PARIS.md` mostra che la query cerca `active: true`
- File `PUSH_NOTIFICATIONS_FIX_COMPLETO.md` conferma che il campo usato è `active` non `isActive`

**✅ SOLUZIONE**:
```javascript
const subscriptionData = {
  userId,
  firebaseUid: userId,
  deviceId,
  platform,
  type: 'native',
  active: true,        // ← AGGIUNGERE QUESTO
  isActive: true,      // ← Mantenere per compatibilità
  createdAt: new Date().toISOString(),
  lastUsedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
};
```

---

### 🔴 PROBLEMA CRITICO #2: Manca campo `endpoint` per Android

**File**: `src/services/capacitorPushService.js`

**❌ PROBLEMA**: Le subscription Android native NON hanno il campo `endpoint`, ma la Cloud Function potrebbe richiederlo per la validazione.

**Impatto**:
- La Cloud Function in `sendBulkNotifications.clean.js` potrebbe scartare la subscription se manca `endpoint`
- Il backend usa `endpoint` per identificare univocamente una subscription

**✅ SOLUZIONE**: 
Per Android native, creare un endpoint fake ma univoco:
```javascript
if (platform === 'android') {
  subscriptionData.fcmToken = token.value;
  subscriptionData.endpoint = `fcm://android/${token.value.substring(0, 50)}`; // endpoint univoco
} else if (platform === 'ios') {
  subscriptionData.apnsToken = token.value;
  subscriptionData.endpoint = `apns://ios/${token.value.substring(0, 50)}`;
}
```

---

### 🟠 PROBLEMA SIGNIFICATIVO #3: Manca struttura `subscription.keys` per compatibilità

**❌ PROBLEMA**: La Cloud Function si aspetta una struttura con `subscription.keys.p256dh` e `subscription.keys.auth` per le notifiche web, ma per Android native questi non esistono.

**✅ SOLUZIONE**: Aggiungere controllo nella Cloud Function per distinguere tra web e native:
```javascript
// In sendBulkNotifications.clean.js
const isNativeSubscription = data.type === 'native';
const isWebSubscription = data.subscription?.endpoint?.startsWith('http');

if (isNativeSubscription && data.fcmToken) {
  // Usa FCM Admin SDK per inviare a token nativo
  await admin.messaging().send({
    token: data.fcmToken,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data,
  });
} else if (isWebSubscription) {
  // Usa web-push per subscription web
  await webpush.sendNotification(data.subscription, JSON.stringify(payload));
}
```

---

### 🟡 PROBLEMA MINORE #4: Logging insufficiente

**❌ PROBLEMA**: Non ci sono abbastanza log per debuggare quando la registrazione push fallisce.

**✅ SOLUZIONE**: Aggiungere logging dettagliato:
```javascript
console.log('[CapacitorPush] Registration data:', {
  userId,
  deviceId,
  platform,
  docId,
  hasToken: !!token.value,
  tokenPrefix: token.value.substring(0, 20) + '...',
});

console.log('[CapacitorPush] Saving to Firestore path:', `pushSubscriptions/${docId}`);
```

---

## 🔧 CHECKLIST CORREZIONI DA APPLICARE

### 1. File: `src/services/capacitorPushService.js`

- [ ] Aggiungere campo `active: true` in subscriptionData
- [ ] Aggiungere campo `endpoint` univoco per piattaforma
- [ ] Aggiungere logging dettagliato
- [ ] Aggiungere gestione errori Firestore più robusta

### 2. File: Cloud Function `sendBulkNotifications.clean.js`

- [ ] Aggiungere supporto per invio a token FCM nativi (non solo web-push)
- [ ] Distinguere tra subscription native e web
- [ ] Usare Firebase Admin SDK per Android/iOS native
- [ ] Mantenere web-push solo per browser

### 3. Testing

- [ ] Verificare registrazione su dispositivo Android fisico
- [ ] Controllare documento creato in Firestore
- [ ] Testare invio notifica da Admin Panel
- [ ] Verificare ricezione notifica su dispositivo

---

## 📱 PROSSIMI PASSI

1. **Aspettare build app** - Il processo `npx cap run android` sta buildando
2. **Catturare logcat** - Una volta avviata l'app, catturare i log con:
   ```bash
   adb logcat -c  # Pulisce log esistenti
   adb logcat | Select-String "PushNotifications|FCM|Firebase|CapacitorPush"
   ```
3. **Testare registrazione** - Aprire app e tentare login/registrazione push
4. **Verificare Firestore** - Controllare se documento viene creato in `pushSubscriptions`
5. **Applicare fix** - Se confermati i problemi, applicare le correzioni

---

## 🔍 QUERY FIRESTORE DA ESEGUIRE

Per verificare se le subscription vengono create:

```javascript
// Firebase Console > Firestore
// Collection: pushSubscriptions
// Where: firebaseUid == "USER_ID_QUI"
// Order by: createdAt desc
```

**Campi da verificare**:
- ✅ `active: true` (DEVE esistere)
- ✅ `firebaseUid: "USER_ID"` (DEVE corrispondere)
- ✅ `fcmToken: "..."` (DEVE esistere per Android)
- ✅ `endpoint: "fcm://..."` (CONSIGLIATO per identificazione)
- ✅ `deviceId: "..."` (DEVE essere univoco)
- ✅ `platform: "android"` o `"ios"`
- ✅ `type: "native"`

---

## 📊 STATUS ATTUALE

- ✅ **Fix applicati**: Correzioni al file capacitorPushService.js completate
- ✅ **Build completata**: App ricompilata con successo
- ⏳ **Reinstallazione**: App in deploy su dispositivo Samsung
- 🔍 **Problemi corretti**: 3 su 4 (2 critici, 1 significativo)
- 📝 **Script logcat**: Creato script `capture-push-logs.ps1` per monitoraggio
- 🧪 **Test pronti**: Sì, pronto per test reale

### Correzioni Applicate

#### ✅ Fix #1: Campo `active` aggiunto
```javascript
active: true, // ← Campo richiesto dalla Cloud Function
isActive: true, // ← Mantenuto per compatibilità
```

#### ✅ Fix #2: Campo `endpoint` univoco aggiunto
```javascript
if (platform === 'android') {
  subscriptionData.fcmToken = token.value;
  subscriptionData.endpoint = `fcm://android/${token.value.substring(0, 50)}`;
} else if (platform === 'ios') {
  subscriptionData.apnsToken = token.value;
  subscriptionData.endpoint = `apns://ios/${token.value.substring(0, 50)}`;
}
```

#### ✅ Fix #3: Logging dettagliato aggiunto
```javascript
console.log('[CapacitorPush] Device info:', {
  platform,
  deviceId,
  tokenPrefix: token.value.substring(0, 30) + '...',
});

console.log('[CapacitorPush] Saving subscription to Firestore:', {
  docId,
  path: `pushSubscriptions/${docId}`,
  // ...
});

console.log('[CapacitorPush] ✅ Token saved to Firestore successfully:', {
  docId,
  platform: subscriptionData.platform,
  type: subscriptionData.type,
  active: subscriptionData.active,
  hasEndpoint: !!subscriptionData.endpoint,
});
```

### Prossimi Passi

1. ✅ **Attendere deploy** - App in reinstallazione su dispositivo
2. 🔄 **Catturare logcat** - Eseguire `.\capture-push-logs.ps1`
3. 🔄 **Testare registrazione** - Aprire app e verificare log di registrazione push
4. 🔄 **Verificare Firestore** - Controllare creazione documento in `pushSubscriptions`
5. 🔄 **Testare invio** - Da Admin Panel inviare notifica di test

**Prossimo aggiornamento**: Quando l'app sarà reinstallata e avremo i logcat reali

