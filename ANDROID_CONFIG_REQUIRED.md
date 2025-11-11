# ⚠️ Android Configuration Required

## Configuration Check Results

**Status**: ❌ **INCOMPLETE** - 4/7 checks passed

### Missing Items

#### 1. google-services.json (CRITICAL)
**Status**: ❌ NOT FOUND  
**Location Expected**: `android/app/google-services.json`

**How to Fix**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **play-sport-pro**
3. Click ⚙️ Settings > Project Settings
4. Scroll to "Your apps" section
5. Find Android app or click "Add app" if not present
6. Download `google-services.json`
7. Place file in: `android/app/google-services.json`

**Package Name**: Should match capacitor.config.ts `appId`

---

#### 2. AndroidManifest.xml Permissions (HIGH)
**Status**: ⚠️ INCOMPLETE

**Missing Permissions**:
- `android.permission.POST_NOTIFICATIONS`
- `com.google.android.c2dm.permission.RECEIVE`

**How to Fix**:

**File**: `android/app/src/main/AndroidManifest.xml`

Add these permissions inside `<manifest>` tag (before `<application>`):

```xml
<!-- Push Notifications Permissions -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />
```

Full example:
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Existing permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- Add these for Push Notifications -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />
    
    <application
        ...
    </application>
</manifest>
```

---

#### 3. NPM Dependencies (MEDIUM)
**Status**: ⚠️ INCOMPLETE

**Missing Package**:
- `@capacitor/device`

**How to Fix**:
```bash
npm install @capacitor/device
```

This package is used by `capacitorPushService.js` for device identification.

---

## Already Configured ✅

1. ✅ **Capacitor PushNotifications Plugin** - Configured in `capacitor.config.ts`
2. ✅ **capacitorPushService.js** - Service layer complete (379 lines)
3. ✅ **unifiedPushService.js** - Cross-platform API (200 lines)
4. ✅ **NativePushTestPanel.jsx** - Testing UI (490 lines)

---

## Quick Fix Commands

```bash
# 1. Install missing dependency
npm install @capacitor/device

# 2. After adding google-services.json and AndroidManifest permissions:
# Verify configuration
node check-android-config.cjs

# 3. If all checks pass, proceed with build
npm run build
npx cap sync android
npx cap open android
```

---

## Detailed Steps

### Step 1: Get google-services.json

#### If Android App Already Exists in Firebase:
1. Firebase Console > Project Settings
2. Find your Android app in "Your apps"
3. Click "google-services.json" download button

#### If Android App NOT in Firebase Yet:
1. Firebase Console > Project Settings
2. Click "Add app" > Android icon
3. Enter package name (from `capacitor.config.ts` `appId`)
   - Example: `com.playsportpro.app`
4. Click "Register app"
5. Download `google-services.json`
6. Place in `android/app/` directory

### Step 2: Update AndroidManifest.xml

**Navigate to**: `android/app/src/main/AndroidManifest.xml`

**Add permissions** (if not present):
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />
```

**Note**: These are REQUIRED for Android 13+ (API 33+) to show push notifications.

### Step 3: Install Dependencies

```bash
npm install @capacitor/device
```

This package provides:
- Device model detection
- Platform identification
- Unique device ID generation

### Step 4: Verify Configuration

```bash
node check-android-config.cjs
```

Expected output when all configured:
```
✅ google-services.json found
✅ AndroidManifest.xml permissions OK
✅ Capacitor PushNotifications plugin configured
✅ capacitorPushService.js exists
✅ unifiedPushService.js exists
✅ NativePushTestPanel.jsx exists
✅ All required npm packages installed

Result: 7/7 checks passed

✅ Configuration READY - You can build the Android APK!
```

---

## After Configuration Complete

Run the automated deployment script:
```bash
.\deploy-native-push.ps1
```

This will:
1. ✅ Verify configuration
2. 🔨 Build frontend
3. ☁️ Deploy Cloud Functions
4. 📱 Sync Capacitor Android
5. 📦 Open Android Studio for APK build

---

## Troubleshooting

### google-services.json Not Found in Firebase Console
**Cause**: Android app not registered in Firebase  
**Solution**: Click "Add app" and follow registration wizard

### Package Name Mismatch
**Cause**: `google-services.json` package name doesn't match `capacitor.config.ts` appId  
**Solution**: 
- Check `capacitor.config.ts`: Look for `appId` field
- Re-download `google-services.json` with matching package name
- Or update `appId` in `capacitor.config.ts` and run `npx cap sync`

### AndroidManifest.xml Not Found
**Cause**: Capacitor Android platform not initialized  
**Solution**:
```bash
npx cap add android
npx cap sync android
```

### Permission Already Exists Error
**Cause**: Permissions might be added by Capacitor automatically  
**Solution**: Check if permissions exist, no need to duplicate

---

## Timeline Estimate

- **google-services.json**: 5 minutes (download from Firebase)
- **AndroidManifest.xml**: 2 minutes (add 2 lines)
- **NPM install**: 1 minute
- **Verification**: 1 minute

**Total**: ~10 minutes

---

## Next Steps After Configuration

1. ✅ Run `node check-android-config.cjs` - Verify 7/7 pass
2. ✅ Run `.\deploy-native-push.ps1` - Automated deployment
3. ✅ Build APK in Android Studio
4. ✅ Install on physical device
5. ✅ Follow `TESTING_CHECKLIST_NATIVE_PUSH.md`

---

## Support

If issues persist:
1. Check `QUICK_DEPLOYMENT_GUIDE.md`
2. Review `FASE_1_NATIVE_PUSH_COMPLETATA.md` (Technical details)
3. Check Firebase Console > Cloud Messaging tab (FCM enabled?)
4. Verify Capacitor version: `npx cap --version` (should be 5.x)

---

**Priority**: 🔴 **HIGH** - Must complete before building APK  
**Estimated Time**: 10 minutes  
**Difficulty**: Easy (mostly downloading files)
