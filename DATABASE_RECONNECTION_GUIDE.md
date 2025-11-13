# 🔗 DATABASE RECONNECTION GUIDE

**Date:** 2025-11-13  
**Goal:** Connect restored Firestore database to your application  
**Status:** Ready for implementation

---

## 📋 Prerequisites Check

Before starting, verify you have:

✅ **Restored Database:** m-padelweb (default) - READY  
✅ **Firestore Rules:** CHK-311 deployed - READY  
✅ **Application Code:** Build successful - READY  
✅ **Firebase Config:** firebase.json exists - CHECK BELOW  

---

## 🔍 Step 1: Verify Firebase Configuration

### Check Current Firebase Config

```bash
# Check firebase.json
cat firebase.json
```

It should show:
```json
{
  "projects": {
    "default": "m-padelweb"
  }
}
```

### Check .firebaserc

```bash
# Check .firebaserc
cat .firebaserc
```

It should show:
```json
{
  "projects": {
    "default": "m-padelweb"
  }
}
```

---

## 🔐 Step 2: Verify Firebase Authentication

```bash
# Check if you're logged in
firebase login:list
```

Should show:
```
parischit85@gmail.com (current)
```

If not logged in:
```bash
firebase login
```

---

## 🎯 Step 3: Connect Application to Database

### Option A: Via Environment Variable (Recommended)

**File:** `src/services/firebase.js`

Ensure it has this configuration:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSy...",           // Your API key
  authDomain: "m-padelweb.firebaseapp.com",
  projectId: "m-padelweb",       // ← KEY: Match your Firebase project
  storageBucket: "m-padelweb.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, app };
```

### Option B: Via Firebase Emulator (For Local Development)

If you want to test locally before deploying:

```bash
# Start emulator
firebase emulators:start --import=. --export-on-exit

# In another terminal, run your app
npm run dev
```

---

## 🧪 Step 4: Test Database Connection

### Test 1: Read Data from Application

```javascript
// In your component or service
import { db } from './services/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function testConnection() {
  try {
    const bookingsRef = collection(db, 'bookings');
    const snapshot = await getDocs(bookingsRef);
    console.log(`✅ Connected! Found ${snapshot.size} bookings`);
    return true;
  } catch (error) {
    console.error(`❌ Error:`, error);
    return false;
  }
}

testConnection();
```

### Test 2: Verify Permissions via CLI

```bash
# Test if you can read bookings
firebase firestore documents list --collection=bookings --project m-padelweb --limit=5
```

Expected output:
```
bookingId1
bookingId2
bookingId3
...
```

### Test 3: Check Rules Are Applied

```bash
# Verify rules are deployed
firebase deploy --only firestore:rules --dry-run --project m-padelweb
```

Should show:
```
✅ firestore: rules file firestore.rules will be released
```

---

## 📊 Step 5: Verify Data Availability

### Check Collections Exist

```bash
# List all collections
firebase firestore documents list --collection-ids --project m-padelweb
```

Expected:
```
bookings
clubs
users
courts
tournaments
leaderboards
statistics
profiles
...
```

### Check Sample Data

```bash
# Check a specific collection
firebase firestore documents list --collection=clubs --limit=5 --project m-padelweb
```

---

## 🎯 Step 6: Deploy to Firebase Hosting

Once everything is verified locally, deploy:

```bash
# Deploy everything
firebase deploy --project m-padelweb

# Or deploy specific services
firebase deploy --only firestore:rules,firestore:indexes,hosting --project m-padelweb
```

---

## ✅ Step 7: Verification Checklist

After deployment, verify:

| Check | Command | Expected |
|-------|---------|----------|
| Rules deployed | `firebase firestore:indexes` | 12 indexes |
| Database accessible | `firebase firestore documents list --collection=bookings` | Documents listed |
| Auth working | App login screen | Can login |
| Real-time working | Create booking in app | Updates in real-time |
| Permissions working | Login as different roles | Different access levels |

---

## 🔧 Troubleshooting

### Issue: "Permission denied" errors

**Cause:** Rules not deployed or user role wrong  
**Fix:**
```bash
# Re-deploy rules
firebase deploy --only firestore:rules --project m-padelweb

# Check user roles in console
firebase firestore documents get users/{uid} --project m-padelweb
```

### Issue: "Collection not found"

**Cause:** Data not restored properly  
**Fix:**
```bash
# Check restore status
gcloud firestore operations describe [OPERATION_ID] --project m-padelweb

# List what collections exist
firebase firestore documents list --collection-ids --project m-padelweb
```

### Issue: "CORS error" or connection fails

**Cause:** Wrong Firebase config in app  
**Fix:**
```javascript
// Verify projectId matches
// In src/services/firebase.js:
console.log('Project ID:', firebaseConfig.projectId); // Should be 'm-padelweb'
```

### Issue: "Indexes not found"

**Cause:** Indexes not deployed  
**Fix:**
```bash
# Deploy indexes
firebase deploy --only firestore:indexes --project m-padelweb
```

---

## 🚀 Full Reconnection Command Sequence

Run these commands in order:

```bash
# 1. Navigate to project directory
cd /path/to/play-sport-project

# 2. Verify Firebase login
firebase login:list

# 3. Set project
firebase use m-padelweb

# 4. Verify config
cat firebase.json

# 5. Deploy firestore rules
firebase deploy --only firestore:rules

# 6. Deploy firestore indexes
firebase deploy --only firestore:indexes

# 7. Verify connection locally (optional)
npm run build

# 8. Full production deploy
firebase deploy

# 9. Verify deployment
firebase deploy --only firestore:rules --dry-run
```

---

## 📝 Expected Success Output

After all steps, you should see:

```
✅ Firestore database connected
✅ Rules deployed and active
✅ 12 composite indexes active
✅ Data accessible from application
✅ Real-time subscriptions working
✅ User authentication working
✅ Role-based permissions enforced
✅ Application ready for users
```

---

## 🎯 What This Accomplishes

✅ **Application connects to restored Firestore database**  
✅ **Security rules (CHK-311) enforced on all operations**  
✅ **Composite indexes optimize all queries**  
✅ **Real-time subscriptions working**  
✅ **User authentication active**  
✅ **Role-based permissions applied**  
✅ **Data available to application users**  
✅ **Production deployment complete**

---

## 🎉 You'll Know It's Working When:

1. ✅ App loads without Firebase errors
2. ✅ Users can login with their credentials
3. ✅ Bookings appear when user creates them
4. ✅ Users see only their own bookings (privacy working)
5. ✅ Club admins see their club's data
6. ✅ Super admin can access everything
7. ✅ Real-time updates appear instantly
8. ✅ No "Permission denied" errors in console

---

**Next:** Let me know when you're ready to start these steps, or if you have questions! 🚀

