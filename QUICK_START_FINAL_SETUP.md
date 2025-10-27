# 🚀 Quick Start: Complete Push Notifications v2.0 Setup

**Time Required**: 15 minutes  
**Priority**: HIGH (complete monitoring setup)

---

## ⚡ Immediate Actions Required

### 1. Setup Sentry Monitoring (10 minutes) 🔴 CRITICAL

**Why**: Error tracking and alerts not operational yet (DSN placeholder)

**Steps**:

```bash
# 1. Go to Sentry
open https://sentry.io/signup/

# 2. Create account (use GitHub login)
# 3. Create project:
#    - Platform: React
#    - Name: play-sport-pro
#    - Team: Default

# 4. Copy DSN from project settings
# Will look like: https://abc123@o456789.ingest.sentry.io/7891011

# 5. Update .env file
# Replace this line:
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id

# With your real DSN:
VITE_SENTRY_DSN=https://YOUR_REAL_DSN_HERE

# 6. Rebuild and redeploy
npm run build
firebase deploy --only hosting --project m-padelweb

# 7. Test error tracking (in browser console on m-padelweb.web.app):
throw new Error('Sentry test - Push Notifications v2.0');

# 8. Check Sentry dashboard (should see error within 30s)
open https://sentry.io/organizations/your-org/issues/
```

**Result**: ✅ Real-time error tracking operational

---

### 2. Configure Sentry Alert Rules (5 minutes)

Go to: **Sentry Dashboard → Settings → Alerts**

**Alert #1: High Error Rate**
```yaml
Trigger: Issue count > 50 in 5 minutes
Filter: message contains "notification" OR "push" OR "Circuit Breaker"
Action: Email + Slack
Frequency: Every 5 minutes
```

**Alert #2: Circuit Breaker Open** 🚨 P1
```yaml
Trigger: Event seen
Filter: message contains "Circuit Breaker OPEN"
Action: Email + Slack + PagerDuty (P1)
Frequency: Immediately
```

**Alert #3: Cascade Failure**
```yaml
Trigger: Event seen
Filter: message contains "All notification channels failed"
Action: Email + Slack
Frequency: Every 10 minutes
```

**Alert #4: Slow Notifications**
```yaml
Trigger: p95(notification.send) > 5000ms in 10 minutes
Action: Slack
Frequency: Every 30 minutes
```

**Alert #5: High Failure Count**
```yaml
Trigger: Issue count > 50 in 5 minutes
Filter: message contains "Delivery failure"
Action: Email
Frequency: Every 15 minutes
```

**Result**: ✅ Automated alerts configured

---

### 3. Verify Firestore Indexes (2 minutes)

```bash
# Check index status
open https://console.firebase.google.com/project/m-padelweb/firestore/indexes

# Expected: 11 indexes in "Building" or "Enabled" status
# Wait time: 60-180 minutes (builds in background)
```

**Status Check**:
- 🟢 **Enabled**: Ready to use
- 🟡 **Building**: In progress (5-30 min each)
- 🔴 **Error**: Need to recreate

**If any missing**: Follow `FIRESTORE_INDEXES_CREATE_SCRIPT.md` to create manually

**Result**: ✅ Query optimization operational

---

### 4. Enable 10% Rollout (2 minutes) 🎯

**Option A: Firebase Remote Config (Recommended)**

```bash
# 1. Go to Firebase Console
open https://console.firebase.google.com/project/m-padelweb/config

# 2. Create parameter:
#    Key: push_notifications_v2_enabled
#    Default value: 0.1 (10%)
#    Description: Percentage of users with Push v2.0

# 3. Publish changes

# 4. In app code (already implemented):
const remoteConfig = getRemoteConfig();
const enabled = await getValue(remoteConfig, 'push_notifications_v2_enabled');
if (Math.random() < parseFloat(enabled.asString())) {
  // Use Push Notifications v2.0
}
```

**Option B: Feature Flag in Code (Quick Test)**

```javascript
// src/config/features.js
export const FEATURES = {
  pushNotificationsV2: {
    enabled: true,
    rolloutPercent: 0.1, // 10%
  }
};

// Usage:
import { FEATURES } from './config/features';
if (Math.random() < FEATURES.pushNotificationsV2.rolloutPercent) {
  // Enable for this user
}
```

**Result**: ✅ 10% of users using Push v2.0

---

### 5. Monitor for 48 Hours 📊

**Check Every 4 Hours**:

```bash
# 1. Sentry Dashboard
open https://sentry.io/organizations/your-org/projects/play-sport-pro/

# Metrics to watch:
# - Error rate: Should be <1%
# - P95 latency: Should be <3s
# - Circuit breaker opens: Should be 0

# 2. Firebase Console
open https://console.firebase.google.com/project/m-padelweb/functions

# Check:
# - Function invocations (should increase gradually)
# - Error rate (should be <1%)
# - Average execution time (should be <2s)

# 3. Firebase Logs (real-time)
firebase functions:log --project m-padelweb --follow

# Look for:
# ✅ "Push notification sent successfully"
# ⚠️ "Circuit Breaker" messages (should be rare)
# ❌ Errors (investigate immediately)

# 4. User Feedback
# Monitor Slack #support-tickets for:
# - "Not receiving notifications"
# - "Notifications delayed"
# - "Too many notifications"
```

**Success Criteria (48h)**:
- ✅ Delivery rate >90% (target: >95%)
- ✅ No P0/P1 incidents
- ✅ Error rate <5%
- ✅ User complaints <10
- ✅ Circuit breaker never opens

**Result**: ✅ System stable, ready for 50% rollout

---

## 📊 Monitoring Dashboards

### Sentry Dashboard

**URL**: https://sentry.io/organizations/your-org/projects/play-sport-pro/

**Key Widgets**:
1. **Error Rate** (time series)
2. **Circuit Breaker Opens** (big number)
3. **P95 Latency** (line chart)
4. **Delivery Failures** (bar chart by channel)
5. **Channel Performance** (table)

### Firebase Console

**URL**: https://console.firebase.google.com/project/m-padelweb/

**Key Sections**:
- **Functions** → Invocations, errors, execution time
- **Firestore** → Query performance, index usage
- **Cloud Messaging** → FCM quota, delivery stats
- **Analytics** → User engagement, notification opens

---

## 🚨 Troubleshooting Quick Reference

### Issue: "Notifications not being sent"

**Check**:
1. Firestore indexes built? → `firebase firestore:indexes`
2. VAPID keys configured? → Check function logs for "Web Push Config"
3. Circuit breaker open? → Check Sentry for "Circuit Breaker OPEN"
4. FCM quota exceeded? → Firebase Console → Cloud Messaging

**Fix**:
```bash
# If circuit breaker open, manually close:
# Firebase Console → Firestore → circuitBreakerState → push-notifications
# Update: state = "CLOSED", errorRate = 0
```

### Issue: "High error rate in Sentry"

**Check**:
1. Recent deployment? → Consider rollback
2. FCM service down? → Check https://status.firebase.google.com
3. Specific error pattern? → Investigate in Sentry

**Fix**:
```bash
# Rollback hosting
firebase hosting:channel:list --project m-padelweb
# Note the previous channel ID, then:
firebase hosting:clone SOURCE_CHANNEL_ID m-padelweb:live

# Rollback functions
git log --oneline -10  # Find previous commit
git checkout <previous-commit>
firebase deploy --only functions --project m-padelweb
```

### Issue: "Slow notifications (P95 > 5s)"

**Check**:
1. Firestore queries slow? → Check indexes
2. FCM API slow? → Check Firebase status
3. Too many cascade attempts? → Check cascade rate

**Fix**:
```javascript
// Optimize: Reduce cascade channels temporarily
// src/services/notification-cascade.js
const CHANNELS = [
  'push',  // Try push only
  // 'email',  // Disable email cascade
  // 'sms',    // Disable SMS cascade
];
```

---

## 📋 Checklist: Ready for 50% Rollout?

Use after 48h of 10% rollout:

- [ ] ✅ Delivery rate >90%
- [ ] ✅ P95 latency <5s
- [ ] ✅ Error rate <5%
- [ ] ✅ Circuit breaker never opened
- [ ] ✅ User complaints <10
- [ ] ✅ No P0 incidents
- [ ] ✅ <2 P1 incidents (all resolved)
- [ ] ✅ DevOps team trained (2h)
- [ ] ✅ Support team trained (1.5h)
- [ ] ✅ Product team trained (1h)
- [ ] ✅ Go/No-Go meeting completed
- [ ] ✅ Stakeholders informed

**If ALL checked**: 🟢 **GO** to 50% rollout  
**If ANY unchecked**: 🟡 **WAIT** - Fix issues first

---

## 🎯 Success Metrics

### Week 1 (10% Rollout)
```
Target: >90% delivery rate
Actual: ___% (fill after 48h)
Status: [ ] PASS / [ ] FAIL

Notes:
_________________________________
_________________________________
```

### Week 2 (50% Rollout)
```
Target: >93% delivery rate
Actual: ___% (fill after 72h)
Status: [ ] PASS / [ ] FAIL

Notes:
_________________________________
_________________________________
```

### Week 3 (100% Rollout)
```
Target: >95% delivery rate
Actual: ___% (fill after 7 days)
Status: [ ] PASS / [ ] FAIL

Notes:
_________________________________
_________________________________
```

---

## 🆘 Emergency Contacts

### On-Call Schedule

**9am-5pm**: DevOps Lead (Primary)  
**5pm-1am**: DevOps Engineer #1 (Backup)  
**1am-9am**: DevOps Engineer #2 (Night)

### Escalation

**Level 1** (P3): Support Team → Runbook  
**Level 2** (P2): DevOps Engineer → Investigate  
**Level 3** (P1): DevOps Lead → Critical fix  
**Level 4** (P0): CTO → Rollback decision

### Communication

**Incidents**: #push-notifications-alerts (Slack)  
**Updates**: #engineering-updates (Slack)  
**Stakeholders**: Email digest (daily)

---

## 📚 Documentation Links

- [VAPID Setup Guide](./VAPID_KEYS_SETUP_GUIDE.md) - Key generation
- [Sentry Setup Guide](./SENTRY_SETUP_GUIDE.md) - Monitoring config
- [Firestore Indexes Guide](./FIRESTORE_INDEXES_SETUP_GUIDE.md) - Index creation
- [Team Training Guide](./TEAM_TRAINING_GUIDE.md) - 4.5h curriculum
- [Go/No-Go Decision](./GO_NO_GO_DECISION.md) - Decision analysis
- [Week 1 Complete Report](./WEEK_1_DEPLOYMENT_COMPLETE.md) - Full summary

---

## 🎉 You're Almost Done!

**Completed** ✅:
- Infrastructure deployed
- Documentation written
- System tested
- Go/No-Go approved

**Remaining** ⏳:
1. Setup Sentry (10 min)
2. Configure alerts (5 min)
3. Enable 10% rollout (2 min)
4. Monitor 48h
5. Scale to 50% → 100%

**Total Time to Production**: ~15 minutes + 48h monitoring

**Let's ship it!** 🚀

---

*Last Updated: 16 October 2025*  
*Status: Ready for Final Setup*  
*Next: Sentry → Rollout → Monitor*
