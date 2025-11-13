# 📋 STEP 1: Get Firebase Configuration Values

**Goal:** Extract Web SDK configuration from Firebase Console  
**Time:** ~5 minutes  
**Difficulty:** Easy - Just copy/paste

---

## 🎯 What You Need To Do

### 1. Open Firebase Console

Go to: **https://console.firebase.google.com**

### 2. Select Your Project

- Look for **m-padelweb** in the projects list
- Click on it

### 3. Go to Project Settings

Look for the **gear icon (⚙️)** in the top left sidebar:
```
At top-left corner:
├─ Firebase logo
├─ m-padelweb (your project name)
└─ ⚙️ (gear icon) ← CLICK THIS
```

Click on it and select **"Project settings"**

### 4. Find Web App Configuration

In Project Settings, look for the tab: **"Your apps"**

You should see:
```
Web apps
└─ play-sport-web-app (or similar)
```

Click on your web app (or the icon that looks like **`<>`**)

### 5. Copy the Configuration

You'll see a JavaScript code block that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "m-padelweb.firebaseapp.com",
  projectId: "m-padelweb",
  storageBucket: "m-padelweb.appspot.com",
  messagingSenderId: "1004722051733",
  appId: "1:1004722051733:web:...",
  measurementId: "G-..."
};
```

---

## ✅ Values You Need To Copy

From that configuration, copy these **7 values**:

| Variable | Firebase Config Key | Example |
|----------|-------------------|---------|
| `VITE_FIREBASE_API_KEY` | `apiKey` | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` | `m-padelweb.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` | `m-padelweb` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` | `m-padelweb.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` | `1004722051733` |
| `VITE_FIREBASE_APP_ID` | `appId` | `1:1004722051733:web:...` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `measurementId` | `G-...` (optional) |

---

## 🔍 Visual Guide: Where To Find Each Value

### Screenshot Location Map:

```
Firebase Console
└─ m-padelweb (project)
   └─ ⚙️ Project Settings
      └─ Your apps tab
         └─ Web app config
            ├─ apiKey: "AIzaSy..." ← COPY THIS
            ├─ authDomain: "m-padelweb..." ← COPY THIS
            ├─ projectId: "m-padelweb" ← COPY THIS
            ├─ storageBucket: "m-padelweb..." ← COPY THIS
            ├─ messagingSenderId: "1004722051733" ← COPY THIS
            ├─ appId: "1:1004722051733..." ← COPY THIS
            └─ measurementId: "G-..." ← OPTIONAL
```

---

## 📝 Sample Values (For Reference)

Here's what it typically looks like:

```
VITE_FIREBASE_API_KEY=AIzaSyDOCqe6yIsnqMTCrye-uR_-_V2wrAzK5jU
VITE_FIREBASE_AUTH_DOMAIN=m-padelweb.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=m-padelweb
VITE_FIREBASE_STORAGE_BUCKET=m-padelweb.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1004722051733
VITE_FIREBASE_APP_ID=1:1004722051733:web:abc123def456ghi789jkl
VITE_FIREBASE_MEASUREMENT_ID=G-ABCD1234EF
```

---

## 🚀 Next Steps After Copying

Once you have all 7 values:

1. ✅ Tell me the values (or paste them)
2. ✅ I'll create the `.env` file automatically
3. ✅ We'll deploy to production

---

## ⚠️ Important Notes

- ✅ **API Key is OK to share** - It's meant to be public (embedded in frontend)
- ✅ **All these values are safe** - They only work with your Firebase project
- ✅ **Keep them in .env** - Never commit `.env` to git (it's in .gitignore)
- ✅ **They're environment-specific** - Different values for dev/prod if needed

---

## 🆘 Can't Find It?

If you don't see the Web app configuration:

**Option 1: Add a Web App**
```
1. In Project Settings
2. Click "Add app" button
3. Select "Web"
4. Give it a name (e.g., "play-sport-web")
5. Copy the config
```

**Option 2: Look in Different Place**
```
1. Go to: Firebase Console home
2. Click on m-padelweb project card
3. Should see "Realtime Database", "Storage", etc.
4. Look for settings icon and "Project settings"
```

---

## 📊 Checklist

Before moving to Step 2:

- [ ] Opened Firebase Console
- [ ] Selected m-padelweb project
- [ ] Found Project Settings
- [ ] Found Web app configuration
- [ ] Copied all 7 values
- [ ] Have them ready to paste

---

## ✨ You're Ready When:

You have these 7 values ready:

```
✅ VITE_FIREBASE_API_KEY
✅ VITE_FIREBASE_AUTH_DOMAIN
✅ VITE_FIREBASE_PROJECT_ID
✅ VITE_FIREBASE_STORAGE_BUCKET
✅ VITE_FIREBASE_MESSAGING_SENDER_ID
✅ VITE_FIREBASE_APP_ID
✅ VITE_FIREBASE_MEASUREMENT_ID (optional)
```

---

## 🎯 What To Do Next

Once you have the values, you can either:

**Option A: Tell me the values** (preferred)
- Paste all 7 values
- I'll create the .env file for you
- Faster and easier ✅

**Option B: Create .env manually**
- Create file `.env` in project root
- Add all 7 values
- Then tell me when done

---

**⏭️ Next: Reply with your 7 Firebase config values!** 🚀

