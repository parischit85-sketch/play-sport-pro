# 🧪 Testing Checklist - Native Push Notifications

## ✅ Pre-requisiti

### Ambiente di Sviluppo
- [ ] Node.js installato (v18+)
- [ ] Firebase CLI installato (`npm install -g firebase-tools`)
- [ ] Android Studio installato (per Android testing)
- [ ] Xcode installato (per iOS testing, solo macOS)
- [ ] Capacitor CLI installato (`npm install -g @capacitor/cli`)

### Configurazione Firebase
- [ ] Progetto Firebase configurato
- [ ] `google-services.json` presente in `android/app/`
- [ ] `GoogleService-Info.plist` presente in `ios/App/` (per iOS)
- [ ] Firebase Admin SDK inizializzato in Cloud Functions
- [ ] VAPID keys configurate in Firebase Secret Manager

### Build Tools
- [ ] Gradle aggiornato (per Android)
- [ ] CocoaPods installato (per iOS, `sudo gem install cocoapods`)

---

## 🤖 Android Testing

### Step 1: Build & Deploy
```bash
# 1. Build frontend
npm run build

# 2. Sync Capacitor
npx cap sync android

# 3. Apri Android Studio
npx cap open android
```

### Step 2: Configurazione Android
- [ ] Verifica `AndroidManifest.xml` contenga permessi:
  ```xml
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
  <uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />
  ```
- [ ] Verifica `google-services.json` presente in `android/app/`
- [ ] Build APK da Android Studio (Build > Build Bundle(s) / APK(s) > Build APK(s))

### Step 3: Installazione su Device Fisico
**⚠️ IMPORTANTE: Push notifications NON funzionano su emulatori Android**

- [ ] Connetti device Android via USB
- [ ] Abilita Developer Options sul device
- [ ] Abilita USB Debugging
- [ ] Verifica device riconosciuto: `adb devices`
- [ ] Installa APK: `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`

### Step 4: Test Funzionali Android

#### 4.1 Subscription Test
- [ ] Apri app sul device
- [ ] Login con account test
- [ ] Vai a profilo/settings
- [ ] Apri `NativePushTestPanel`
- [ ] Click su "Subscribe to Push"
- [ ] Sistema richiede permesso → Accetta
- [ ] Verifica badge "Authorized" appare
- [ ] Verifica subscription salvata in Firestore:
  ```
  pushSubscriptions/{userId}_{deviceId}
  {
    type: "native",
    platform: "android",
    fcmToken: "...",
    isActive: true
  }
  ```

#### 4.2 Native Push Test (Foreground)
- [ ] App in foreground
- [ ] Click "Test Notification" nel panel
- [ ] Verifica notifica locale appare dopo 2 secondi
- [ ] Check console logs per conferma

#### 4.3 Native Push Test (Background)
- [ ] Minimizza app (Home button)
- [ ] Invia notifica da Admin Dashboard o Firestore Functions
- [ ] Verifica notifica appare nel notification tray
- [ ] Click sulla notifica
- [ ] Verifica app si apre sul deep link corretto

#### 4.4 Native Push Test (App Closed)
- [ ] Chiudi completamente l'app (swipe via)
- [ ] Invia notifica da Admin Dashboard
- [ ] Verifica notifica appare
- [ ] Click sulla notifica
- [ ] Verifica app si apre

#### 4.5 Statistics & Analytics
- [ ] Apri `NativePushTestPanel`
- [ ] Verifica statistiche mostrano:
  - [ ] Sent count aumenta
  - [ ] Delivery rate ~95%+
  - [ ] Platform = "android"
- [ ] Check Firestore `notificationEvents` collection per tracking

---

## 🍎 iOS Testing

### Step 1: Build & Deploy (Solo macOS)
```bash
# 1. Build frontend
npm run build

# 2. Sync Capacitor
npx cap sync ios

# 3. Install CocoaPods dependencies
cd ios/App && pod install && cd ../..

# 4. Apri Xcode
npx cap open ios
```

### Step 2: Configurazione iOS (BLOCCANTE)
**⚠️ PREREQUISITI MANCANTI:**
- [ ] **Apple Developer Account** ($99/anno) - NON ANCORA ACQUISTATO
- [ ] **APNs Certificate** - NON ANCORA GENERATO
- [ ] **Bundle ID configurato** - NON ANCORA FATTO
- [ ] **Push Notifications capability abilitata** - NON ANCORA FATTO
- [ ] **Background Modes > Remote notifications** - NON ANCORA FATTO

**STATO ATTUALE**: ❌ iOS testing bloccato fino a configurazione APNs

### Step 3: Test iOS (Quando APNs Configurato)
- [ ] Connetti device iOS fisico (simulatore non supporta push reali)
- [ ] Seleziona device come target in Xcode
- [ ] Verifica signing configurato correttamente
- [ ] Run app (⌘+R)
- [ ] Ripeti test funzionali come Android (4.1-4.5)

---

## 💻 Desktop Web Testing

### Chrome/Edge/Firefox
- [ ] Apri app su `https://play-sport-pro.netlify.app`
- [ ] Login con account test
- [ ] Vai a profilo → Notifiche
- [ ] Abilita notifiche (Web Push VAPID)
- [ ] Verifica subscription salvata in Firestore:
  ```
  pushSubscriptions/{userId}_{deviceId}
  {
    type: "web",
    subscription: { endpoint: "...", keys: {...} }
  }
  ```
- [ ] Invia test notification da Admin Dashboard
- [ ] Verifica notifica desktop appare
- [ ] Click su notifica → verifica deep link funziona

---

## 🔧 Cloud Functions Testing

### Deploy Function
```bash
cd functions
npm install
firebase deploy --only functions:sendBulkCertificateNotifications
```

### Test Manuale via Firebase Console
1. [ ] Apri Firebase Console → Functions
2. [ ] Seleziona `sendBulkCertificateNotifications`
3. [ ] Click "Test Function"
4. [ ] Payload:
   ```json
   {
     "clubId": "test-club-id",
     "playerIds": ["test-user-id"],
     "notificationType": "push"
   }
   ```
5. [ ] Verifica risposta:
   ```json
   {
     "success": true,
     "sent": 1,
     "failed": 0,
     "details": [
       {
         "playerId": "test-user-id",
         "success": true,
         "method": "native-push"
       }
     ]
   }
   ```

### Test Automatico via Script
```javascript
// test-push-function.js
const { getFunctions, httpsCallable } = require('firebase/functions');
const functions = getFunctions();
const sendNotifications = httpsCallable(functions, 'sendBulkCertificateNotifications');

sendNotifications({
  clubId: 'YOUR_CLUB_ID',
  playerIds: ['USER_ID_1', 'USER_ID_2'],
  notificationType: 'push'
}).then(result => {
  console.log('Success:', result.data);
}).catch(error => {
  console.error('Error:', error);
});
```

---

## 📊 Test Matrix

| Platform | Push Type | Foreground | Background | App Closed | Deep Link |
|----------|-----------|------------|------------|------------|-----------|
| Android (Physical) | FCM | ⏳ TODO | ⏳ TODO | ⏳ TODO | ⏳ TODO |
| Android (Emulator) | ❌ N/A | ❌ N/A | ❌ N/A | ❌ N/A | ❌ N/A |
| iOS (Physical) | APNs | ⏳ BLOCKED | ⏳ BLOCKED | ⏳ BLOCKED | ⏳ BLOCKED |
| iOS (Simulator) | ❌ N/A | ❌ N/A | ❌ N/A | ❌ N/A | ❌ N/A |
| Desktop Chrome | Web Push | ⏳ TODO | ⏳ TODO | ⏳ TODO | ⏳ TODO |
| Desktop Firefox | Web Push | ⏳ TODO | ⏳ TODO | ⏳ TODO | ⏳ TODO |
| Desktop Edge | Web Push | ⏳ TODO | ⏳ TODO | ⏳ TODO | ⏳ TODO |
| Desktop Safari | ❌ N/A | ❌ N/A | ❌ N/A | ❌ N/A | ❌ N/A |

**Legenda:**
- ✅ Passed
- ❌ Failed / Not Supported
- ⏳ TODO / Pending
- 🔄 In Progress
- ⚠️ Partial / With Issues

---

## 🐛 Troubleshooting

### Android: "FCM token null"
**Sintomi**: Token FCM non salvato in Firestore
**Soluzioni**:
1. Verifica `google-services.json` presente
2. Check logs Android Studio per errori Firebase
3. Verifica connessione internet device
4. Riavvia app e riprova subscription

### Android: "Permission denied"
**Sintomi**: Permesso notifiche negato
**Soluzioni**:
1. Disinstalla app
2. Reinstalla
3. Accetta permesso quando richiesto
4. Se già negato: Settings > Apps > Play Sport > Notifications > Enable

### Android: "Notification not received in background"
**Sintomi**: Notifica arriva in foreground ma non in background
**Soluzioni**:
1. Verifica Cloud Function invia correttamente a FCM (check logs)
2. Verifica `AndroidManifest.xml` ha `POST_NOTIFICATIONS` permission
3. Verifica Battery Saver non sta bloccando app
4. Settings > Apps > Play Sport > Battery > Unrestricted

### iOS: "APNs token registration failed"
**Sintomi**: Errore durante subscription iOS
**Soluzioni**:
1. ⚠️ APNs NON CONFIGURATO - questo è normale
2. Acquista Apple Developer Account
3. Genera APNs certificate
4. Carica in Firebase Console
5. Riprova subscription

### Web: "Service Worker registration failed"
**Sintomi**: Web Push non funziona in development
**Soluzioni**:
1. ⚠️ Service Worker disabilitato in dev mode (by design)
2. Testa su staging/production: `netlify deploy`
3. Oppure configura local HTTPS: `ngrok http 5173`

### Cloud Function: "VAPID keys invalid"
**Sintomi**: Errore "public key must be a url safe base 64"
**Soluzioni**:
1. Verifica VAPID keys in Firebase Secret Manager
2. Check no spazi/newlines nelle chiavi
3. Verifica formato base64 URL-safe (no `+` o `/`, usa `-` e `_`)

---

## ✅ Success Criteria

### Minimum Viable (MVP)
- [ ] Android native push funziona (foreground + background + closed)
- [ ] Desktop web push funziona
- [ ] Admin può inviare notifiche a tutti gli utenti
- [ ] Subscriptions salvate correttamente in Firestore
- [ ] Analytics tracking funziona

### Complete Success
- [ ] Tutte le piattaforme supportate funzionano
- [ ] iOS APNs configurato e testato
- [ ] Delivery rate >90%
- [ ] CTR tracciato correttamente
- [ ] Deep linking funziona su tutte le piattaforme
- [ ] Zero crash durante subscription/notification

---

## 📝 Test Report Template

```markdown
# Push Notifications Test Report

**Date**: YYYY-MM-DD
**Tester**: [Nome]
**Build Version**: [Version Number]
**Devices Tested**: [List devices]

## Android Results
- Device: [Model, OS Version]
- FCM Token: ✅/❌
- Foreground: ✅/❌
- Background: ✅/❌
- App Closed: ✅/❌
- Deep Link: ✅/❌
- Notes: [Any issues]

## iOS Results
- Status: ⚠️ APNs not configured

## Desktop Results
- Browser: [Chrome/Firefox/Edge]
- Web Push: ✅/❌
- Notes: [Any issues]

## Cloud Functions
- Deployment: ✅/❌
- Invio notifiche: ✅/❌
- Analytics: ✅/❌

## Issues Found
1. [Issue description]
2. [Issue description]

## Recommendations
- [Action items]
```

---

**Next Action**: Testing su Android device fisico prioritario 🚀
