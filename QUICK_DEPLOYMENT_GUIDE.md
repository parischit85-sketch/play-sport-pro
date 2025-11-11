# 🚀 Quick Deployment Guide - Native Push Notifications

**Target**: Deployment immediato su production per testing Android

---

## ⚡ Quick Start (5 minuti)

### Step 1: Build Frontend
```bash
npm run build
```

### Step 2: Deploy Cloud Functions
```bash
cd functions
npm install
firebase deploy --only functions:sendBulkCertificateNotifications
cd ..
```

### Step 3: Sync Capacitor Android
```bash
npx cap sync android
```

### Step 4: Build APK
```bash
# Apri Android Studio
npx cap open android

# In Android Studio:
# Build > Build Bundle(s) / APK(s) > Build APK(s)
# Oppure usa Gradle da terminale:
cd android
./gradlew assembleDebug
cd ..
```

**Output APK**: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📱 Install on Android Device

### Via USB (Recommended)
```bash
# 1. Connetti device via USB
# 2. Abilita USB debugging sul device
# 3. Verifica device
adb devices

# 4. Installa APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# 5. Launch app
adb shell am start -n com.playsportpro.app/.MainActivity
```

### Via QR Code / Download Link
1. Upload APK su Firebase App Distribution / Google Drive
2. Share link con tester
3. Download e installa su device

---

## 🧪 Testing Checklist (10 minuti)

### Test 1: Subscription
- [ ] Apri app sul device
- [ ] Login con account test
- [ ] Vai a profilo → Settings
- [ ] Trova "NativePushTestPanel" (o aggiungi al menu)
- [ ] Click "Subscribe to Push"
- [ ] Verifica badge "Authorized" appare

### Test 2: Verify Firestore
- [ ] Apri Firebase Console → Firestore
- [ ] Naviga a `pushSubscriptions`
- [ ] Cerca documento con `userId` del test user
- [ ] Verifica campi:
  ```
  type: "native"
  platform: "android"
  fcmToken: "..."
  isActive: true
  ```

### Test 3: Send Test Notification
**Opzione A - Via App** (Local Notification):
- [ ] Nel NativePushTestPanel click "Test Notification"
- [ ] Verifica notifica appare dopo 2 secondi

**Opzione B - Via Firebase Console** (Cloud Function):
```bash
# Test manuale Cloud Function
firebase functions:shell

# In shell:
sendBulkCertificateNotifications({
  clubId: "YOUR_CLUB_ID",
  playerIds: ["TEST_USER_ID"],
  notificationType: "push"
})
```

**Opzione C - Via Admin Dashboard**:
- [ ] Login come admin
- [ ] Apri Admin Dashboard
- [ ] Vai a "Announcements" o "Notifications"
- [ ] Invia test notification al test user

### Test 4: Background Push
- [ ] Minimizza app (Home button)
- [ ] Invia notifica da Admin Dashboard
- [ ] Verifica notifica appare nel notification tray
- [ ] Click notifica → verifica app apre

### Test 5: App Closed
- [ ] Chiudi completamente app (swipe via)
- [ ] Invia notifica da Admin Dashboard
- [ ] Verifica notifica appare
- [ ] Click notifica → verifica app lancia

---

## 🔍 Troubleshooting Veloce

### "FCM Token null"
```bash
# Check google-services.json presente
ls android/app/google-services.json

# Se mancante, scarica da Firebase Console
# Project Settings > General > Download google-services.json
```

### "Permission denied"
```bash
# Reset app permissions
adb shell pm reset-permissions com.playsportpro.app

# Oppure disinstalla e reinstalla
adb uninstall com.playsportpro.app
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### "No FCM token registration"
```bash
# Check logs Android
adb logcat | grep -i "fcm\|push\|capacitor"

# Cerca errori:
# - "google-services.json missing"
# - "Firebase initialization failed"
# - "Push permissions denied"
```

### "Cloud Function error"
```bash
# Check function logs
firebase functions:log --only sendBulkCertificateNotifications

# Deploy again se necessario
cd functions
firebase deploy --only functions:sendBulkCertificateNotifications
```

---

## 📊 Verify Success

### ✅ Success Criteria
- [ ] APK builds without errors
- [ ] App installs on device
- [ ] User can subscribe to push
- [ ] FCM token saved in Firestore
- [ ] Local notification received
- [ ] Cloud function notification received (foreground)
- [ ] Cloud function notification received (background)
- [ ] Deep linking works on click

### 📈 Check Analytics
Firebase Console → Firestore → `notificationEvents`

Verifica eventi:
```javascript
{
  type: "sent",
  channel: "push",
  platform: "android",
  userId: "test-user-id",
  success: true,
  timestamp: "2025-11-07T..."
}
```

---

## 🎯 Next Actions After Successful Test

### If All Tests Pass ✅
1. **Deploy to Production**
   ```bash
   # Build production APK
   cd android
   ./gradlew assembleRelease
   
   # Sign APK (richiede keystore)
   # Upload to Google Play Store
   ```

2. **Enable for All Users**
   - Update app in store
   - Monitor analytics dashboard
   - Track delivery rate
   - Collect user feedback

3. **Monitor Performance**
   - Cloud Functions execution time
   - Push delivery rate (target >90%)
   - Error rate (target <5%)
   - User engagement metrics

### If Tests Fail ❌
1. **Check Common Issues**
   - Firebase configuration
   - Permissions AndroidManifest.xml
   - Cloud Functions deployment
   - Network connectivity device

2. **Debug Steps**
   ```bash
   # Full logs
   adb logcat -c  # clear logs
   adb logcat | tee debug.log
   
   # Cerca pattern:
   # ERROR, FATAL, exception, failed
   ```

3. **Report Issue**
   - Screenshot dell'errore
   - Device info (model, Android version)
   - Steps to reproduce
   - Logcat output

---

## 🔐 Security Checklist

Prima di production deployment:

- [ ] VAPID keys in Firebase Secret Manager (non hardcoded)
- [ ] Firebase Rules configurate per `pushSubscriptions`
  ```javascript
  match /pushSubscriptions/{subscriptionId} {
    allow read, write: if request.auth != null 
      && request.auth.uid == resource.data.userId;
  }
  ```
- [ ] Cloud Functions auth verificata
- [ ] APK firmato con release keystore
- [ ] ProGuard abilitato per obfuscation
- [ ] Sensitive data non loggata

---

## 📝 Quick Test Script

Crea `test-native-push.sh`:

```bash
#!/bin/bash

echo "🚀 Testing Native Push Notifications..."

# 1. Check device connected
if ! adb devices | grep -q "device$"; then
  echo "❌ No Android device connected"
  exit 1
fi

echo "✅ Device connected"

# 2. Install APK
echo "📱 Installing APK..."
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# 3. Launch app
echo "🚀 Launching app..."
adb shell am start -n com.playsportpro.app/.MainActivity

# 4. Wait for app to start
sleep 3

# 5. Check logs for FCM token
echo "🔍 Checking FCM registration..."
adb logcat -d | grep -i "FCM.*token"

echo "✅ Test script complete. Check logs above for FCM token."
```

Esegui:
```bash
chmod +x test-native-push.sh
./test-native-push.sh
```

---

## 🎓 Learning Resources

- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [FCM for Android](https://firebase.google.com/docs/cloud-messaging/android/client)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [ADB Commands](https://developer.android.com/studio/command-line/adb)

---

**Ready to Deploy?** ✅  
**Estimated Time**: 15 minutes total  
**Prerequisites**: Android device, USB cable, Firebase access
