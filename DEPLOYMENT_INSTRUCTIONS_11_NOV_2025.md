# 📦 DEPLOYMENT INSTRUCTIONS - Push Notifications Phase 1

**Last Updated**: 11 Novembre 2025  
**Phase**: 1 of 3 (Ready for Production)  
**Estimated Time**: 20-30 minuti

---

## 🎯 GOAL

Deploy the fixed push notification system with all critical issues resolved.

---

## ✅ PRE-DEPLOYMENT CHECKLIST

- [ ] All linting errors fixed (run `npm run lint`)
- [ ] Build succeeds (run `npm run build`)
- [ ] Unit tests pass (if any)
- [ ] Code review approved (2 reviewers)
- [ ] Firestore composite index deployed
- [ ] Environment variables configured
- [ ] Backup taken of current code

---

## 📋 DEPLOYMENT STEPS

### STEP 1: Fix Line Endings (5 min)

The code has Windows line endings (CRLF) but linter wants Unix (LF). Fix automatically:

```bash
# Option A: Using prettier
npm run prettier -- --write src/components/AutoPushSubscription.jsx
npm run prettier -- --write netlify/functions/save-push-subscription.js
npm run prettier -- --write netlify/functions/send-push.js
npm run prettier -- --write firestore.rules

# Option B: Using git (more reliable)
git add --renormalize .
git commit -m "fix: normalize line endings to LF"
```

**Verify**:
```bash
npm run lint
# Should show 0 errors
```

---

### STEP 2: Deploy Firestore Indexes (10 min + 5 min wait)

This is **CRITICAL** - queries will fail without this index.

```bash
# Deploy only indexes
firebase deploy --only firestore:indexes

# Watch deployment progress
# Takes ~5-10 minutes

# Verify index is built
firebase firestore:indexes
# Should show status: ENABLED for pushSubscriptions index
```

**Expected Output**:
```
Collection ID: pushSubscriptions
Fields: userId (ASCENDING), createdAt (DESCENDING)
Status: ENABLED ✅
```

---

### STEP 3: Deploy Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Verify with Rules Simulator
firebase firestore:rules:test
```

**Expected**: ✅ All tests pass

---

### STEP 4: Netlify Functions Deployment

```bash
# Build Netlify functions
npm run build

# Deploy to Netlify
netlify deploy --prod

# OR use CI/CD (GitHub Actions)
git push origin main
# GitHub Actions will auto-deploy
```

**Verify functions deployed**:
```bash
# Check functions are available
curl -X OPTIONS https://your-domain/.netlify/functions/save-push-subscription

# Expected response: 200 OK with CORS headers
```

---

### STEP 5: Cloud Functions Deployment

```bash
# Deploy Cloud Functions
firebase deploy --only functions

# Watch logs
firebase functions:log
```

**Expected functions**:
- ✅ sendBulkNotifications
- ✅ sendBulkCertificateNotifications
- ✅ Other existing functions

---

### STEP 6: Smoke Tests (10 min)

#### Test 1: Manual Subscription Save
```javascript
// Run in browser console
fetch('/.netlify/functions/save-push-subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'test-user-123',
    subscription: {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test',
      keys: {
        p256dh: 'dGVzdC1rZXktcDI1NmRo',
        auth: 'dGVzdC1hdXRoLWtleQ=='
      }
    },
    endpoint: 'https://fcm.googleapis.com/fcm/send/test'
  })
}).then(r => r.json()).then(console.log)

// Expected: {success: true, id: "test-user-123_device-xxx"}
```

#### Test 2: Verify Firestore Document
```javascript
// Firebase Console → Firestore → pushSubscriptions
// Should see document: test-user-123_device-xxx
```

#### Test 3: Input Validation
```javascript
// Test with invalid userId (too short)
fetch('/.netlify/functions/save-push-subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'short',  // ❌ Invalid
    subscription: { /* ... */ }
  })
}).then(r => r.json()).then(console.log)

// Expected error: {code: 'INVALID_USER_ID', error: 'Invalid userId format'}
```

#### Test 4: Circuit Breaker
```javascript
// Trigger 10+ failures to open circuit breaker
// Check send-push logs in Firebase Console
// Should see: "[CircuitBreaker] web-push OPENED"
```

---

## 🔍 POST-DEPLOYMENT VERIFICATION

### Check 1: Firebase Deployment Status
```bash
firebase deploy:log
```

### Check 2: Firestore Rules
```bash
# Firebase Console → Firestore → Rules
# Should show pushSubscriptions rules
```

### Check 3: Monitoring & Logs

**Firebase Cloud Functions Logs**:
```bash
firebase functions:log --limit 50
```

**Netlify Functions Logs**:
- Dashboard: https://app.netlify.com → Functions → Logs

### Check 4: Database State
```bash
# Check collection exists and has data
firebase firestore:query 'pushSubscriptions' --limit 10
```

**Expected**: 0 documents initially (expected after first user subscribes)

---

## 🧪 TESTING SCENARIOS

### Scenario 1: New User Registration
```
1. User signs up
2. App requests notification permission
3. User accepts
4. Document created in Firestore
5. Verify: userId_deviceId document exists
```

### Scenario 2: Retry Logic
```
1. Manually kill network
2. User tries to enable notifications
3. Should retry after 2s, 5s, 10s
4. Once network back, should succeed
```

### Scenario 3: Circuit Breaker
```
1. Simulate push service down (mock fail 10 times)
2. send-push function should reject with "Circuit breaker open"
3. Wait 60 seconds
4. Should try HALF_OPEN state
5. If succeeds, should return to CLOSED
```

### Scenario 4: Input Validation
```
1. Send invalid userId → Should reject
2. Send invalid endpoint → Should reject
3. Send too-large subscription → Should reject
4. Send valid data → Should accept
```

---

## 🚨 ROLLBACK PLAN

If something goes wrong, revert quickly:

```bash
# Revert Cloud Functions
git revert <commit>
firebase deploy --only functions

# Revert Rules
git revert <commit>
firebase deploy --only firestore:rules

# Revert Netlify Functions
git revert <commit>
netlify deploy --prod

# Revert to previous version
git reset --hard HEAD~1
```

---

## 📊 SUCCESS METRICS

After deployment, verify:

| Metric | Expected | Action if Failed |
|--------|----------|------------------|
| Deploy time | <5 min | Check network/auth |
| Functions deployed | All present | Redeploy functions |
| Rules deployed | 200 OK | Check firebase.json |
| Index enabled | ENABLED | Wait 5+ min or manual create |
| Test subscription saves | ✅ | Check logs for errors |
| Circuit breaker initializes | ✅ | Restart functions |
| No errors in logs | ✅ | Debug specific errors |

---

## 📞 TROUBLESHOOTING

### Issue: "Firestore composite index not found"
**Cause**: Index not deployed  
**Fix**:
```bash
firebase deploy --only firestore:indexes
# Wait 5+ minutes
```

### Issue: "Circuit breaker open" error
**Cause**: Push service failing (normal after errors)  
**Fix**: Wait 60 seconds for auto-recovery, or restart function

### Issue: "Permission denied" on save
**Cause**: Firestore rules not deployed  
**Fix**:
```bash
firebase deploy --only firestore:rules
```

### Issue: Validation always fails
**Cause**: Invalid test data format  
**Fix**: Check QUICK_REFERENCE for valid request format

### Issue: "VAPID keys not configured"
**Cause**: Environment variables missing  
**Fix**: Check `.env.local` and Netlify/Firebase settings

---

## 📈 MONITORING DASHBOARD

Set up monitoring for:

1. **Function Execution**
   - Firebase Console → Cloud Functions → sendBulkNotifications
   - Check: Execution time, Error rate, Memory usage

2. **Push Service Health**
   - Filter logs: `[send-push]`
   - Watch for: Circuit breaker events, error spikes

3. **Database**
   - Monitor: Read/Write quota usage
   - Alert if: >80% quota used

4. **Alerts to Configure**
   - Execution failure rate > 5%
   - Response time > 2 seconds
   - Circuit breaker opens > 2 times/hour
   - Quota usage > 80%

---

## ✅ SIGN OFF CHECKLIST

- [ ] All tests pass
- [ ] Deployment completed successfully
- [ ] No errors in logs
- [ ] Database is healthy
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment
- [ ] Documentation updated
- [ ] Ready for user testing

---

## 🔗 RELATED DOCUMENTS

- `IMPLEMENTATION_SUMMARY_11_NOV_2025.md` - What was changed
- `QUICK_REFERENCE_PUSH_FIXES.md` - Testing guide
- `CHECKLIST_IMPLEMENTAZIONE_PUSH_2025_11_11.md` - Full implementation tracker

---

**Deployed by**: [Your Name]  
**Deployment Date**: [Date]  
**Status**: [PENDING/STAGING/PRODUCTION]  
**Issues**: None yet 🎉

---

🚀 **Ready to deploy!** Follow steps above and you'll be live in 30 minutes.
