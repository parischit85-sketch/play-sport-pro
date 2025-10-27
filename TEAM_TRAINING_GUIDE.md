# 📚 Team Training Guide - Push Notifications v2.0

**Target Teams**: DevOps, Support, Product  
**Total Time**: 4.5 hours (DevOps: 2h, Support: 1.5h, Product: 1h)  
**Format**: Interactive workshop + hands-on exercises

---

## 🎯 Training Objectives

### DevOps Team (2 hours)
- Deploy and maintain Push Notifications v2.0
- Monitor system health with Sentry
- Troubleshoot common issues
- Execute rollback procedures
- Manage Firestore indexes and Cloud Functions

### Support Team (1.5 hours)
- Help users with notification issues
- Use admin dashboards to diagnose problems
- Escalate critical issues
- Follow runbook procedures

### Product Team (1 hour)
- Understand new features and capabilities
- Read analytics dashboards
- Plan future enhancements
- Communicate updates to stakeholders

---

# 👨‍💻 DevOps Team Training (2 hours)

## Module 1: System Architecture (30 min)

### 1.1 High-Level Overview

```
User Device → Service Worker → Firebase Cloud Messaging
                                      ↓
                            Push Notification Sent
                                      ↓
                            If Failed → Email Cascade
                                      ↓
                            If Failed → SMS Cascade
```

**Key Components**:
- **Frontend**: React + Vite + Service Worker
- **Backend**: Firebase Cloud Functions (Node.js)
- **Database**: Firestore (NoSQL)
- **Messaging**: Firebase Cloud Messaging (FCM)
- **Monitoring**: Sentry + Firebase Analytics

### 1.2 Data Flow

```javascript
// 1. User subscribes to push
navigator.serviceWorker.register('/firebase-messaging-sw.js');
const token = await getToken(messaging);

// 2. Token saved to Firestore
db.collection('pushSubscriptions').add({
  userId: currentUser.id,
  token: token,
  platform: 'web',
  active: true
});

// 3. Send notification (Cloud Function)
await admin.messaging().send({
  token: userToken,
  notification: { title, body },
  webpush: { fcmOptions: { link } }
});

// 4. If failed, cascade to email
if (pushFailed) {
  await sendEmail(user.email, notification);
}
```

### 1.3 Key Files

| File | Purpose | Location |
|------|---------|----------|
| `firebase-messaging-sw.js` | Service Worker | `public/` |
| `push-service.js` | Push logic | `src/services/` |
| `notification-cascade.js` | Fallback cascade | `src/services/` |
| `circuit-breaker.js` | Reliability pattern | `src/services/` |
| `sendPushNotification` | Cloud Function | `functions/` |

---

## Module 2: Deployment (30 min)

### 2.1 Pre-Deployment Checklist

```bash
# 1. Verify Firestore indexes
firebase firestore:indexes --project m-padelweb

# 2. Check VAPID keys configured
firebase functions:config:get push --project m-padelweb

# 3. Run tests
npm run test
npm run build

# 4. Check Sentry DSN
cat .env | grep SENTRY_DSN
```

### 2.2 Deploy Commands

```bash
# Full deploy (hosting + functions)
firebase deploy --only "functions,hosting" --project m-padelweb

# Deploy only functions
firebase deploy --only functions --project m-padelweb

# Deploy specific function
firebase deploy --only functions:sendPushNotification --project m-padelweb

# Deploy only hosting
firebase deploy --only hosting --project m-padelweb
```

### 2.3 Post-Deployment Verification

```bash
# 1. Check function logs
firebase functions:log --project m-padelweb --limit 50

# 2. Test notification send (manual)
# Go to: https://m-padelweb.web.app
# Open console, request notification permission
# Check for errors

# 3. Verify Sentry receiving events
# Go to: https://sentry.io/organizations/your-org/issues/

# 4. Check analytics
# Go to: Firebase Console → Analytics → Events
```

### 2.4 Rollback Procedure

```bash
# 1. List previous deployments
firebase hosting:channel:list --project m-padelweb

# 2. Rollback hosting
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID DEST_SITE_ID:live

# 3. Rollback functions (redeploy previous version)
git checkout <previous-commit>
firebase deploy --only functions --project m-padelweb

# 4. Notify team
# Post in #push-notifications-alerts Slack channel
```

---

## Module 3: Monitoring (30 min)

### 3.1 Sentry Dashboard

**URL**: https://sentry.io/organizations/your-org/projects/play-sport-pro/

**Key Metrics to Monitor**:
- Error rate (target: <1%)
- Circuit breaker state (should be CLOSED)
- P95 latency (target: <3000ms)
- Delivery success rate (target: >95%)

**Alert Rules**:
1. **High Error Rate**: >50 errors in 5 min → Email + Slack
2. **Circuit Breaker Open**: Immediate → PagerDuty P1
3. **Cascade Failure**: All channels failed → Slack + Email
4. **Slow Notifications**: P95 >5s in 10 min → Slack
5. **High Failure Count**: >50 failures in 5 min → Email

### 3.2 Firebase Console

**URL**: https://console.firebase.google.com/project/m-padelweb

**Key Sections**:
- **Cloud Messaging** → View FCM usage, quotas
- **Functions** → View function invocations, errors, logs
- **Firestore** → View database queries, index status
- **Analytics** → View user engagement, notification opens

**Common Queries**:
```javascript
// Check recent notification events
db.collection('notificationEvents')
  .where('createdAt', '>', yesterday)
  .orderBy('createdAt', 'desc')
  .limit(100);

// Check failed deliveries
db.collection('notificationDeliveries')
  .where('success', '==', false)
  .where('createdAt', '>', yesterday)
  .orderBy('createdAt', 'desc');

// Check circuit breaker state
db.collection('circuitBreakerState')
  .doc('push-notifications')
  .get();
```

### 3.3 Logs Analysis

```bash
# View function logs in real-time
firebase functions:log --project m-padelweb --follow

# Filter for errors
firebase functions:log --project m-padelweb | grep ERROR

# Filter specific function
firebase functions:log --only sendPushNotification --project m-padelweb

# Download logs for analysis
firebase functions:log --project m-padelweb --limit 1000 > logs.txt
```

---

## Module 4: Troubleshooting (30 min)

### 4.1 Common Issues

#### Issue #1: "Notifications not received"

**Symptoms**: User reports not receiving push notifications

**Diagnosis**:
```javascript
// 1. Check if user has active subscription
db.collection('pushSubscriptions')
  .where('userId', '==', 'USER_ID')
  .where('active', '==', true)
  .get();

// 2. Check recent notification events
db.collection('notificationEvents')
  .where('userId', '==', 'USER_ID')
  .orderBy('createdAt', 'desc')
  .limit(10);

// 3. Check delivery attempts
db.collection('notificationDeliveries')
  .where('userId', '==', 'USER_ID')
  .orderBy('createdAt', 'desc')
  .limit(10);
```

**Solutions**:
- User needs to grant notification permission
- Token might be expired → Ask user to logout/login
- FCM quota exceeded → Check Firebase Console
- Circuit breaker open → Wait for auto-recovery or manual reset

#### Issue #2: "High error rate in Sentry"

**Symptoms**: Sentry alert triggered, >50 errors in 5 min

**Diagnosis**:
1. Go to Sentry → Issues
2. Look at error pattern:
   - Same error for all users? → System issue
   - Specific users? → User-specific issue
   - Specific time? → Deployment issue

**Solutions**:
- If deployment-related → Rollback
- If FCM-related → Check Firebase status page
- If circuit breaker → Wait for auto-recovery
- If quota exceeded → Increase Firebase plan

#### Issue #3: "Circuit Breaker OPEN"

**Symptoms**: PagerDuty alert, notifications failing

**Diagnosis**:
```javascript
// Check circuit breaker state
const state = await db.collection('circuitBreakerState')
  .doc('push-notifications')
  .get();

console.log('State:', state.data().state); // OPEN, HALF_OPEN, CLOSED
console.log('Error Rate:', state.data().errorRate);
console.log('Failure Count:', state.data().failureCount);
console.log('Last Failure:', state.data().lastFailure);
```

**Solutions**:
1. **Automatic Recovery**: Wait 60 seconds, circuit breaker will try HALF_OPEN
2. **Manual Reset** (if needed):
```javascript
await db.collection('circuitBreakerState')
  .doc('push-notifications')
  .update({
    state: 'CLOSED',
    errorRate: 0,
    failureCount: 0,
    lastSuccess: new Date()
  });
```
3. **Investigate Root Cause**: Check Sentry for underlying errors

#### Issue #4: "Firestore index missing"

**Symptoms**: Error in logs: "The query requires an index"

**Solution**:
1. Go to Firebase Console → Firestore → Indexes
2. Click link in error message (auto-creates index)
3. Or manually create from `FIRESTORE_INDEXES_SETUP_GUIDE.md`
4. Wait 5-30 min for index to build

#### Issue #5: "Cloud Function timeout"

**Symptoms**: Function execution >60s, times out

**Diagnosis**:
- Check function logs for slow operations
- Look for infinite loops or hanging promises
- Check external API response times (FCM, email)

**Solutions**:
- Increase function timeout in `functions/index.js`:
```javascript
exports.sendPushNotification = functions
  .region('europe-west1')
  .runWith({ timeoutSeconds: 120 }) // Increase from 60 to 120
  .https.onCall(async (data, context) => {
    // ...
  });
```
- Optimize slow queries
- Add request timeout to external APIs

---

## Hands-On Exercise (30 min)

### Exercise 1: Deploy & Verify (10 min)

```bash
# 1. Build frontend
npm run build

# 2. Deploy to staging
firebase deploy --only hosting --project m-padelweb

# 3. Open browser, test notification
open https://m-padelweb.web.app

# 4. Check Sentry for events
# Go to Sentry dashboard

# 5. View function logs
firebase functions:log --project m-padelweb --limit 20
```

### Exercise 2: Trigger & Fix Error (10 min)

```javascript
// 1. Trigger test error
throw new Error('DevOps training test error');

// 2. Check Sentry
// Should see error within 30 seconds

// 3. Mark as resolved
// Click "Resolve" in Sentry dashboard

// 4. Verify resolution
// Error should disappear from active issues
```

### Exercise 3: Circuit Breaker Simulation (10 min)

```javascript
// 1. Manually open circuit breaker
await db.collection('circuitBreakerState')
  .doc('push-notifications')
  .update({ state: 'OPEN', errorRate: 0.8 });

// 2. Try to send notification
// Should fail immediately (circuit breaker protection)

// 3. Wait 60 seconds
// Circuit breaker auto-transitions to HALF_OPEN

// 4. Send successful notification
// Circuit breaker closes

// 5. Verify state
const state = await db.collection('circuitBreakerState')
  .doc('push-notifications')
  .get();
console.log('Final state:', state.data().state); // Should be CLOSED
```

---

# 🎧 Support Team Training (1.5 hours)

## Module 1: User Issues (30 min)

### 1.1 "I'm not receiving notifications"

**Step 1: Check browser permissions**
```
1. Ask user: "What browser are you using?"
2. Guide user:
   - Chrome: Settings → Privacy → Site Settings → Notifications
   - Firefox: Settings → Privacy → Permissions → Notifications
   - Safari: Preferences → Websites → Notifications
3. Ensure play-sport-pro.com is "Allowed"
```

**Step 2: Check device settings**
```
Mobile:
- Android: Settings → Apps → Chrome → Notifications → Enabled
- iOS: Settings → Safari → Notifications → Enabled

Desktop:
- Windows: Settings → System → Notifications → Enabled
- Mac: System Preferences → Notifications → Chrome → Enabled
```

**Step 3: Check account settings**
```
1. Login to admin portal: https://m-padelweb.web.app/admin
2. Go to: Users → Search user
3. Check: notificationPreferences.push = true
4. If false → Enable it
```

**Step 4: Escalate to DevOps**
If all above OK, create ticket:
```
Title: User [USER_ID] not receiving push notifications
Priority: P2 (Medium)
Details:
- User ID: [USER_ID]
- Email: [EMAIL]
- Browser: [BROWSER + VERSION]
- Device: [DEVICE + OS]
- Permissions: Granted
- Account settings: Push enabled
- Last notification attempt: [TIMESTAMP]
```

### 1.2 "Notifications are delayed"

**Expected Latency**: 1-3 seconds (normal), up to 30 seconds (acceptable)

**Diagnosis**:
1. Ask: "How long is the delay?" (seconds? minutes? hours?)
2. Check admin dashboard:
   - Go to: Analytics → Notification Latency
   - Filter by user
   - Check P95 latency

**Solutions**:
- < 30s delay → Normal, no action needed
- 30s - 5min delay → Check Sentry for performance issues
- > 5min delay → Escalate to DevOps (P2)
- > 1 hour delay → Critical, escalate immediately (P1)

### 1.3 "I want to disable notifications"

**Guide user**:
```
1. Go to: Profile → Settings → Notifications
2. Toggle OFF: "Push Notifications"
3. Or disable specific types:
   - Booking confirmations
   - Match reminders
   - Payment reminders
   - Team invites
4. Click "Save"
```

**Alternative (browser level)**:
```
1. Browser settings → Notifications
2. Find play-sport-pro.com
3. Select "Block"
```

---

## Module 2: Admin Dashboard (30 min)

### 2.1 Dashboard Overview

**URL**: https://m-padelweb.web.app/admin/notifications

**Key Metrics**:
- **Delivery Rate**: Target >95%
- **Latency P95**: Target <3s
- **Circuit Breaker State**: Should be CLOSED
- **Active Subscriptions**: Total users subscribed
- **Failure Rate**: Target <5%

### 2.2 User Lookup

```
1. Go to: Admin → Users → Search
2. Enter: User ID, email, or phone
3. View:
   - Push subscription status
   - Recent notifications (last 30 days)
   - Delivery success/failure
   - Device tokens
4. Actions:
   - Resend notification
   - Reset push subscription
   - Test notification send
```

### 2.3 Notification History

```
1. Go to: Admin → Notifications → History
2. Filters:
   - Date range
   - User ID
   - Notification type
   - Status (sent, failed, pending)
3. View details:
   - Title, body, timestamp
   - Delivery channel (push, email, sms)
   - Delivery status
   - Error message (if failed)
4. Actions:
   - Retry failed notification
   - View full payload
   - Export to CSV
```

---

## Module 3: Runbook (30 min)

### Runbook #1: High Error Rate Alert

**Trigger**: Sentry alert "High Error Rate"

**Steps**:
1. Check Sentry dashboard for error details
2. If deployment-related (< 1 hour ago):
   - Escalate to DevOps immediately (P1)
   - DevOps will consider rollback
3. If user-specific:
   - Create tickets for affected users (P3)
   - Guide users to refresh browser
4. If FCM-related:
   - Check Firebase status: https://status.firebase.google.com
   - If outage, inform users via email/social media
5. Document in: #push-notifications-alerts channel

### Runbook #2: Circuit Breaker Open

**Trigger**: PagerDuty alert "Circuit Breaker OPEN"

**Steps**:
1. **DO NOT PANIC** - This is a protection mechanism
2. Check Sentry for root cause errors
3. Wait 60 seconds for automatic recovery
4. If still OPEN after 3 minutes:
   - Escalate to DevOps (P1)
   - DO NOT manually reset (DevOps will decide)
5. Inform users:
   - Post in app: "Notification system temporarily degraded"
   - Users will receive emails as fallback
6. Monitor recovery:
   - Check every 5 minutes
   - When CLOSED, confirm with test notification

### Runbook #3: User Reports No Notifications

**Steps**:
1. Verify issue:
   - Ask user to check browser permissions
   - Ask user to check device settings
2. Check admin dashboard:
   - User has active push subscription? (yes/no)
   - Recent notifications sent? (yes/no)
   - Delivery success rate? (>95%/low)
3. Decision tree:
   - No subscription → Guide user to enable notifications
   - Subscription but no recent notifications → Escalate (P3)
   - Subscription + notifications sent but not received → Test send
4. Test notification:
   - Admin → Users → [User] → "Send Test Notification"
   - If received → Issue resolved, user might have missed it
   - If not received → Escalate to DevOps (P2)

---

# 📊 Product Team Training (1 hour)

## Module 1: Features & Capabilities (20 min)

### 1.1 What's New in v2.0

**Core Features**:
1. **Web Push Notifications**: Users get notifications even when browser closed
2. **Multi-Channel Cascade**: If push fails → email → SMS
3. **Circuit Breaker**: Auto-protection against system overload
4. **Notification Scheduling**: Send at specific times
5. **Preference Management**: Users control what they receive

**User Benefits**:
- ✅ Never miss important updates (bookings, matches, payments)
- ✅ Real-time alerts (match starting in 15 min)
- ✅ Reduced email clutter (push-first, email as fallback)
- ✅ Control over notification types

### 1.2 Supported Notification Types

| Type | Priority | Channels | Use Case |
|------|----------|----------|----------|
| `booking_confirmed` | Normal | Push → Email | After successful booking |
| `match_starting` | High | Push → SMS | 15 min before match |
| `payment_reminder` | Normal | Push → Email | 24h before due date |
| `team_invite` | High | Push → Email | Someone invites you |
| `certificate_expiring` | Normal | Push → Email | 7 days before expiry |
| `court_available` | High | Push only | Favorite court opens |

### 1.3 User Preferences

Users can customize:
- **Global toggle**: Enable/disable all push notifications
- **Per-type toggle**: Enable specific types only
- **Quiet hours**: No notifications 22:00-08:00
- **Frequency**: Immediate, digest (daily), or off

---

## Module 2: Analytics (20 min)

### 2.1 Key Metrics

**URL**: https://m-padelweb.web.app/admin/analytics

**Delivery Metrics**:
- **Total Sent**: Number of notifications sent (all channels)
- **Delivery Rate**: % successfully delivered (target: >95%)
- **Open Rate**: % of notifications clicked (target: >20%)
- **Conversion Rate**: % of notifications leading to action (target: >10%)

**Performance Metrics**:
- **P50 Latency**: Median delivery time (target: <1s)
- **P95 Latency**: 95th percentile (target: <3s)
- **P99 Latency**: 99th percentile (target: <5s)

**Channel Usage**:
- **Push**: % delivered via push (target: >80%)
- **Email**: % cascade to email (target: <15%)
- **SMS**: % cascade to SMS (target: <5%)

### 2.2 Dashboard Widgets

**Widget: Delivery Rate Over Time**
- Line chart, last 30 days
- Shows daily delivery success %
- Alert if drops below 95%

**Widget: Notification Volume**
- Bar chart, by type
- Shows which notifications are most used
- Helps prioritize improvements

**Widget: User Engagement**
- Funnel: Sent → Delivered → Opened → Converted
- Identifies drop-off points
- Guides UX improvements

### 2.3 Custom Reports

Create reports for:
- **Campaign performance**: Specific notification campaigns
- **User segments**: Active vs inactive users
- **Time analysis**: Best times to send notifications
- **Device breakdown**: iOS vs Android vs Web

---

## Module 3: Roadmap Planning (20 min)

### 3.1 Current Capabilities

**Production Ready**:
- ✅ Web push notifications (Chrome, Firefox, Edge)
- ✅ Email cascade fallback
- ✅ Notification scheduling
- ✅ User preferences
- ✅ Analytics dashboard
- ✅ Circuit breaker protection

**In Development**:
- ⏳ SMS cascade (backend ready, awaiting Twilio approval)
- ⏳ Mobile app push (iOS + Android)
- ⏳ Rich notifications (images, actions)

### 3.2 Future Enhancements (Q1 2026)

**High Priority**:
1. **Rich Notifications**: Images, buttons, actions
2. **Notification Grouping**: "You have 5 new bookings" (not 5 separate)
3. **Smart Scheduling**: ML-based optimal send times
4. **A/B Testing**: Test notification copy, timing, channels

**Medium Priority**:
5. **Notification Templates**: Pre-designed templates for common types
6. **User Segmentation**: Target specific user groups
7. **Advanced Analytics**: Cohort analysis, retention impact
8. **Multi-Language**: Localized notifications

**Low Priority**:
9. **Voice Notifications**: Alexa/Google Home integration
10. **Wearable Support**: Apple Watch, Android Wear

### 3.3 Cost Analysis

**Current Costs** (per month):
- Firebase Cloud Messaging: €0 (20M messages free)
- Firebase Functions: €15 (2M invocations)
- Firestore: €10 (500K reads, 100K writes)
- Sentry: €26 (Team plan)
- **Total**: €51/month

**Projected Costs** (10x scale):
- FCM: €0 (still under free tier)
- Functions: €80 (20M invocations)
- Firestore: €60 (5M reads, 1M writes)
- Sentry: €80 (Business plan)
- **Total**: €220/month

**ROI Calculation**:
- Email costs saved: €0.05 per email × 100K emails = €5,000/month
- SMS costs saved: €0.10 per SMS × 10K SMS = €1,000/month
- **Net Savings**: €5,780/month
- **ROI**: 2,627% (incredible!)

---

## Hands-On Exercise (Product) (20 min)

### Exercise 1: Create Notification Campaign (10 min)

```
1. Go to: Admin → Campaigns → Create New
2. Configure:
   - Name: "Weekend Booking Reminder"
   - Type: booking_reminder
   - Target: Users with no bookings this weekend
   - Schedule: Friday 18:00
   - Message: "Don't miss out! Book your weekend padel match now 🎾"
   - Channels: Push → Email
3. Preview notification
4. Schedule campaign
5. Monitor results:
   - Sent: [COUNT]
   - Opened: [COUNT] ([%])
   - Bookings made: [COUNT] ([%])
```

### Exercise 2: Analyze Performance (10 min)

```
1. Go to: Admin → Analytics → Overview
2. Review last 30 days:
   - Delivery rate: [%]
   - Open rate: [%]
   - Conversion rate: [%]
3. Identify best-performing notification type
4. Identify worst-performing notification type
5. Propose improvements:
   - Better timing?
   - Better copy?
   - Different channel?
6. Document findings for next sprint planning
```

---

## 📝 Training Completion Checklist

### DevOps Team
- [ ] Can deploy frontend and functions
- [ ] Can monitor Sentry dashboard
- [ ] Can troubleshoot common issues
- [ ] Can execute rollback procedure
- [ ] Has access to Firebase Console
- [ ] Has access to Sentry
- [ ] Completed hands-on exercises

### Support Team
- [ ] Can guide users on enabling notifications
- [ ] Can use admin dashboard to lookup users
- [ ] Can follow runbook procedures
- [ ] Knows when to escalate to DevOps
- [ ] Has access to admin portal
- [ ] Has access to support documentation

### Product Team
- [ ] Understands new features and capabilities
- [ ] Can read analytics dashboards
- [ ] Can create notification campaigns
- [ ] Understands cost implications
- [ ] Can propose future enhancements
- [ ] Has access to analytics portal

---

## 🎓 Certification

**Training Complete**: Each team member should be able to:
1. Explain Push Notifications v2.0 to stakeholders
2. Execute their role-specific tasks independently
3. Know when to escalate issues
4. Contribute to continuous improvement

**Next Steps**:
1. Schedule follow-up Q&A session (1 week post-training)
2. Create internal wiki with FAQ
3. Plan monthly review meetings
4. Gather feedback for training improvements

---

**Training Duration**: 4.5 hours total  
**Format**: Hybrid (2h instructor-led, 2.5h hands-on)  
**Materials**: This guide + video recordings + sandbox environment

---

*Last Updated: 16 Ottobre 2025*  
*Project: Play Sport Pro - Push Notifications v2.0*
