# 🔐 Security Guidelines - Play Sport Pro

## ⚠️ CRITICAL: API Keys & Secrets Management

### ❌ NEVER DO THIS:

```javascript
// ❌ WRONG - Hardcoded API key
const SENDGRID_API_KEY = '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';
```

### ✅ ALWAYS DO THIS:

```javascript
// ✅ CORRECT - Use environment variables
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
```

---

## 🛡️ SendGrid API Key Security

### Incident Report (November 2025)

**Issue**: SendGrid API key was accidentally committed to GitHub in `test-sendgrid-direct.mjs`  
**Impact**: Key was automatically revoked by SendGrid security scanning  
**Resolution**:

1. ✅ Removed hardcoded key from source code
2. ✅ Added test files to `.gitignore`
3. ✅ Created this security documentation
4. 🔄 **ACTION REQUIRED**: Create new API key on SendGrid

---

## 📝 How to Create a New SendGrid API Key

### Step 1: Access SendGrid Dashboard

1. Go to https://app.sendgrid.com/
2. Login with your credentials
3. Navigate to **Settings** → **API Keys**

### Step 2: Create New API Key

1. Click **"Create API Key"**
2. Name it: `play-sport-pro-production`
3. Select permissions:
   - **Full Access** (recommended for production)
   - OR **Restricted Access** → Enable only "Mail Send" permission
4. Click **"Create & View"**
5. **⚠️ COPY THE KEY IMMEDIATELY** - You won't see it again!

### Step 3: Configure in Firebase Functions

```bash
# Set the environment variable in Firebase
firebase functions:config:set sendgrid.api_key="YOUR_NEW_API_KEY_HERE"

# Verify it's set
firebase functions:config:get

# Deploy functions to apply the new config
firebase deploy --only functions
```

### Step 4: Configure Locally (Development)

Create/update `.env` file in project root:

```env
SENDGRID_API_KEY=YOUR_NEW_API_KEY_HERE
```

**⚠️ IMPORTANT**: Never commit `.env` file to Git!

---

## 🔒 Environment Variables Security Checklist

### Files That Should NEVER Be Committed:

- [ ] `.env`
- [ ] `.env.local`
- [ ] `.env.production`
- [ ] `serviceAccountKey.json`
- [ ] `firebase-adminsdk-*.json`
- [ ] Any file containing API keys, passwords, or secrets
- [ ] Test files with hardcoded credentials (`test-*.mjs`)

### Files That CAN Be Committed (Examples Only):

- [x] `.env.example` (with placeholder values)
- [x] `.env.development.example` (with placeholder values)
- [x] Documentation explaining how to set up secrets

---

## 📋 Firebase Functions Environment Variables

### Current Required Variables:

```bash
# Email Service (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Alternative Email (Nodemailer - Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Firebase Admin SDK (automatically injected in Cloud Functions)
# No manual configuration needed
```

### How to Set Firebase Functions Config:

```bash
# Set all email configs at once
firebase functions:config:set \
  sendgrid.api_key="YOUR_SENDGRID_KEY" \
  email.user="your-email@gmail.com" \
  email.password="your-app-password"

# View current config
firebase functions:config:get

# Remove a config value
firebase functions:config:unset sendgrid.api_key
```

### How Code Reads These Values:

```javascript
// In Firebase Functions (Cloud)
const sendgridKey = process.env.SENDGRID_API_KEY;

// Locally (using .env file)
import dotenv from 'dotenv';
dotenv.config();
const sendgridKey = process.env.SENDGRID_API_KEY;
```

---

## 🚨 What to Do If a Key Is Exposed

### Immediate Actions:

1. **Revoke the exposed key immediately** on the service provider's dashboard
2. **Generate a new key** following the provider's process
3. **Update all deployments** with the new key
4. **Remove the exposed key from Git history** (if committed)
5. **Add the file to `.gitignore`** to prevent future exposure

### For SendGrid Specifically:

- SendGrid automatically scans GitHub for exposed keys and revokes them
- You'll receive an email notification (as you did)
- Create a new key following the steps above

### For Firebase Service Account Keys:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click **"Generate New Private Key"**
3. Download the JSON file
4. Store it securely (NEVER commit to Git)
5. Delete the old key from Firebase Console

---

## 🔍 Code Review Checklist Before Commit

Before running `git add` and `git commit`, verify:

- [ ] No hardcoded API keys in code
- [ ] No passwords or secrets in code
- [ ] All sensitive data uses `process.env.*`
- [ ] `.env` file is in `.gitignore`
- [ ] Test files with credentials are in `.gitignore`
- [ ] No `console.log()` statements printing sensitive data

---

## 📚 Additional Resources

- [SendGrid API Key Best Practices](https://docs.sendgrid.com/ui/account-and-settings/api-keys#api-key-permissions)
- [Firebase Functions Environment Configuration](https://firebase.google.com/docs/functions/config-env)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security/getting-started/best-practices-for-preventing-data-leaks-in-your-organization)
- [How to Remove Secrets from Git History](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

---

## 🆘 Emergency Contacts

**SendGrid Support**: https://support.sendgrid.com/  
**Firebase Support**: https://firebase.google.com/support  
**GitHub Security**: security@github.com

---

**Last Updated**: November 12, 2025  
**Maintained By**: Play Sport Pro Development Team
