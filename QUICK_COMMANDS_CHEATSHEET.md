# 🚀 COMANDI RAPIDI - Native Push Implementation

## 📱 BUILD & DEPLOY

### Frontend Build
```bash
npm run build
```

### Deploy Cloud Functions
```bash
cd functions
firebase deploy --only functions:sendBulkCertificateNotifications
cd ..
```

### Android Build
```bash
# Sync Capacitor
npx cap sync android

# Open Android Studio
npx cap open android

# Build APK (in Android Studio)
# Build > Build Bundle(s) / APK(s) > Build APK(s)

# Or via Gradle
cd android && ./gradlew assembleDebug && cd ..
```

---

## 📲 INSTALL & TEST

### Install on Android Device
```bash
# Check device connected
adb devices

# Install APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Launch app
adb shell am start -n com.playsportpro.app/.MainActivity

# Watch logs
adb logcat | grep -i "fcm\|push\|capacitor"
```

### Uninstall (Fresh Install)
```bash
adb uninstall com.playsportpro.app
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔍 DEBUG & LOGS

### Android Logs
```bash
# Clear logs
adb logcat -c

# Watch all logs
adb logcat

# Filter push-related
adb logcat | grep -i "push"

# Filter FCM
adb logcat | grep -i "fcm"

# Filter errors only
adb logcat *:E

# Save to file
adb logcat > debug.log
```

### Cloud Functions Logs
```bash
# Watch function logs
firebase functions:log --only sendBulkCertificateNotifications

# Stream real-time
firebase functions:log --only sendBulkCertificateNotifications --tail
```

### Firestore Query (Check Subscriptions)
```javascript
// In Firebase Console > Firestore
// Or via Firebase Admin SDK

db.collection('pushSubscriptions')
  .where('userId', '==', 'YOUR_USER_ID')
  .where('type', '==', 'native')
  .get()
```

---

## 🧪 TEST COMMANDS

### Test Cloud Function (Local)
```bash
cd functions
firebase functions:shell

# In shell:
sendBulkCertificateNotifications({
  clubId: "test-club",
  playerIds: ["test-user-id"],
  notificationType: "push"
})
```

### Test Push via Admin Dashboard
1. Login come admin
2. Admin Dashboard > Announcements
3. Scrivi messaggio
4. Click "Invia"

### Test Local Notification (In-App)
1. Open app
2. Profile > Notifications > NativePushTestPanel
3. Click "Test Notification"

---

## 🔧 FIX COMMON ISSUES

### Reset App Permissions
```bash
adb shell pm reset-permissions com.playsportpro.app
```

### Clear App Data
```bash
adb shell pm clear com.playsportpro.app
```

### Restart ADB
```bash
adb kill-server
adb start-server
```

### Fix Gradle Sync
```bash
cd android
./gradlew clean
./gradlew build
cd ..
```

### Reinstall Dependencies
```bash
npm ci
cd functions && npm ci && cd ..
```

---

## 📊 MONITORING

### Check Firestore Stats
```bash
# Via Firebase Console
# Firestore > pushSubscriptions > Query

# Active subscriptions count
type == "native" AND isActive == true

# By platform
platform == "android" AND isActive == true
```

### Check Analytics Events
```bash
# Firestore > notificationEvents

# Sent today
type == "sent" AND timestamp > TODAY

# Failed today
type == "failed" AND timestamp > TODAY

# By platform
platform == "android" AND type == "sent"
```

---

## 🚀 PRODUCTION DEPLOY

### Build Release APK
```bash
cd android
./gradlew assembleRelease
cd ..

# Output: android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### Sign APK
```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore your-keystore.jks \
  android/app/build/outputs/apk/release/app-release-unsigned.apk \
  your-key-alias
```

### Align APK
```bash
zipalign -v 4 \
  android/app/build/outputs/apk/release/app-release-unsigned.apk \
  android/app/build/outputs/apk/release/app-release.apk
```

---

## 📝 QUICK CHECKS

### Verify Files Exist
```bash
# Check google-services.json
ls android/app/google-services.json

# Check service files
ls src/services/capacitorPushService.js
ls src/services/unifiedPushService.js

# Check component
ls src/components/debug/NativePushTestPanel.jsx
```

### Verify No Errors
```bash
# Lint check
npm run lint

# Build check
npm run build

# Functions check
cd functions && npm run lint && cd ..
```

---

## 🔐 SECURITY CHECKS

### Verify VAPID Keys
```bash
# Check Firebase Secret Manager
firebase secrets:access VAPID_PUBLIC_KEY
firebase secrets:access VAPID_PRIVATE_KEY
```

### Check Firestore Rules
```bash
# Via Firebase Console
# Firestore > Rules

# Should have:
match /pushSubscriptions/{subscriptionId} {
  allow read, write: if request.auth != null 
    && request.auth.uid == resource.data.userId;
}
```

---

## 📈 PERFORMANCE

### Measure Build Time
```bash
time npm run build
```

### Measure APK Size
```bash
ls -lh android/app/build/outputs/apk/debug/app-debug.apk
```

### Function Execution Time
```bash
# Check Firebase Console > Functions > sendBulkCertificateNotifications
# Look at "Execution time" metric
```

---

## 🎯 ONE-LINER COMMANDS

### Full Deploy Pipeline
```bash
npm run build && \
cd functions && firebase deploy --only functions:sendBulkCertificateNotifications && cd .. && \
npx cap sync android && \
echo "✅ Deploy complete! Now open Android Studio."
```

### Quick Android Test
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk && \
adb shell am start -n com.playsportpro.app/.MainActivity && \
adb logcat | grep -i "fcm"
```

### Clean Everything
```bash
rm -rf node_modules functions/node_modules dist android/build && \
npm ci && \
cd functions && npm ci && cd .. && \
npm run build
```

---

## 🆘 EMERGENCY ROLLBACK

### Revert Cloud Function
```bash
# Check function history
firebase functions:log --only sendBulkCertificateNotifications --limit 50

# Rollback to previous version
# (Manual via Firebase Console > Functions > Version History)
```

### Disable Push for All Users
```javascript
// Run in Firebase Console > Firestore
// Update all subscriptions
db.collection('pushSubscriptions')
  .where('type', '==', 'native')
  .get()
  .then(snapshot => {
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isActive: false });
    });
    return batch.commit();
  });
```

---

## 📞 SUPPORT

**Issues?** Check documentation:
- `TESTING_CHECKLIST_NATIVE_PUSH.md` - Troubleshooting guide
- `QUICK_DEPLOYMENT_GUIDE.md` - Step-by-step deployment
- `SUMMARY_NATIVE_PUSH_IMPLEMENTATION.md` - Overview

**Still stuck?**
1. Check Firebase Console logs
2. Check Android logcat
3. Verify Firestore data
4. Review documentation

---

**Last Updated**: 7 Novembre 2025  
**Version**: 1.0.0  
**Status**: Ready for Testing ✅
