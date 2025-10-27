# 📚 Push Notifications System v2.0 - Complete Deployment Guide

**Version**: 2.0.0  
**Date**: 16 Ottobre 2025  
**Author**: Play Sport Pro Team  
**Status**: Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Deployment Steps](#deployment-steps)
6. [Testing](#testing)
7. [Monitoring](#monitoring)
8. [Rollback Plan](#rollback-plan)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

---

## 🎯 Overview

Questa guida copre il deployment completo del Push Notifications System v2.0, inclusi:

- **6 Services**: pushService, notificationCascade, notificationAnalytics, segmentBuilder, smartScheduler, notificationTemplateSystem
- **1 Cleanup Service**: notificationCleanupService
- **1 Cloud Function**: scheduledCleanup
- **1 Dashboard Component**: NotificationAnalyticsDashboard
- **Firestore Indexes**: Performance optimization
- **Monitoring & Alerts**: Real-time system health

---

## ✅ Prerequisites

### Required Tools

```bash
# Node.js (v18+)
node --version  # v18.0.0+

# npm
npm --version   # v9.0.0+

# Firebase CLI
npm install -g firebase-tools
firebase --version  # v12.0.0+

# Git
git --version
```

### Required Accounts & Access

- ✅ Firebase Project access (Admin)
- ✅ Google Cloud Console access
- ✅ Firestore Database enabled
- ✅ Firebase Cloud Functions enabled
- ✅ Firebase Cloud Messaging enabled
- ✅ Firebase Analytics enabled
- ✅ VAPID keys generated (Web Push)

### Environment Variables

Crea file `.env.local`:

```env
# Firebase Config
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# VAPID Public Key (Web Push)
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key

# Feature Flags
VITE_ENABLE_PUSH_V2=false  # Start with false, gradual rollout
VITE_PUSH_V2_ROLLOUT_PERCENTAGE=0  # 0-100
```

---

## 📦 Installation

### Step 1: Install Dependencies

```bash
# Navigate to project root
cd /path/to/play-sport-backup-2025-10-05_23-30-00

# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### Step 2: Verify Installation

```bash
# Build frontend (should succeed)
npm run build

# Test Cloud Functions locally
cd functions
npm test
cd ..
```

---

## ⚙️ Configuration

### 1. Firebase Configuration

#### Enable Required Services

```bash
# Login to Firebase
firebase login

# Select project
firebase use your-project-id

# Enable Cloud Messaging
firebase projects:addfirebase

# Enable Cloud Scheduler (for cleanup job)
gcloud services enable cloudscheduler.googleapis.com
```

#### Generate VAPID Keys

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys

# Output:
# Public Key: BNxxx...
# Private Key: yyy...

# Add to Firebase Secret Manager
firebase functions:secrets:set VAPID_PRIVATE_KEY
# Paste private key when prompted
```

### 2. Firestore Indexes

```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Wait for index creation (can take 5-10 minutes)
# Check status:
firebase firestore:indexes

# Expected output:
# ✅ notificationEvents (userId, timestamp)
# ✅ notificationEvents (event, timestamp)
# ✅ scheduledNotifications (status, sendAt)
# ... (11 indexes total)
```

### 3. Firestore Security Rules

Aggiungi rules per nuove collections in `firestore.rules`:

```javascript
// Push Subscriptions - Only owner can read/write
match /pushSubscriptions/{subscriptionId} {
  allow read, write: if request.auth != null && 
    request.auth.uid == resource.data.userId;
}

// Notification Events - Admins only
match /notificationEvents/{eventId} {
  allow read: if request.auth != null && 
    (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin']);
  allow write: if false; // Only Cloud Functions can write
}

// Scheduled Notifications - Admins only
match /scheduledNotifications/{scheduleId} {
  allow read: if request.auth != null && 
    (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin']);
  allow write: if false; // Only Cloud Functions can write
}

// Segments - Admins only
match /segments/{segmentId} {
  allow read, write: if request.auth != null && 
    (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin']);
}

// Deploy rules
firebase deploy --only firestore:rules
```

### 4. Cloud Functions Configuration

```bash
# Set environment variables for Cloud Functions
firebase functions:config:set \
  sendgrid.api_key="your_sendgrid_key" \
  twilio.account_sid="your_twilio_sid" \
  twilio.auth_token="your_twilio_token" \
  twilio.phone_number="+1234567890"

# Verify config
firebase functions:config:get
```

---

## 🚀 Deployment Steps

### Phase 1: Staging Deployment

#### 1.1 Create Feature Branch

```bash
git checkout -b feature/push-notifications-v2
git add .
git commit -m "feat: Push Notifications System v2.0 - Complete Implementation"
git push origin feature/push-notifications-v2
```

#### 1.2 Deploy to Staging

```bash
# Build for staging
npm run build

# Deploy Cloud Functions to staging
firebase use staging
firebase deploy --only functions:scheduledNotificationCleanup

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy hosting
firebase deploy --only hosting
```

#### 1.3 Smoke Tests

```bash
# Test notification send
curl -X POST https://staging.playsport.pro/api/test-notification \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "template": "BOOKING_CONFIRMED",
    "variables": {
      "fieldName": "Campo 1",
      "date": "2025-10-20",
      "time": "18:00",
      "bookingId": "booking-456"
    }
  }'

# Expected: 200 OK with delivery confirmation

# Test analytics dashboard
# Navigate to: https://staging.playsport.pro/admin/notifications/analytics
# Expected: Dashboard loads with metrics

# Test segment builder
# Navigate to: https://staging.playsport.pro/admin/notifications/segments
# Expected: Segment creation UI functional
```

#### 1.4 Integration Testing (48h)

```bash
# Monitor staging for 48 hours
# - Check delivery rate (target: >95%)
# - Check error rate (target: <5%)
# - Check latency P95 (target: <3s)
# - Verify analytics tracking
# - Test all templates
# - Test segment queries
# - Test smart scheduling
```

### Phase 2: Production Deployment (Gradual Rollout)

#### 2.1 Week 1: 10% Traffic

```bash
# Switch to production
firebase use production

# Deploy Cloud Functions
firebase deploy --only functions:scheduledNotificationCleanup

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy hosting
firebase deploy --only hosting

# Enable feature flag (10%)
firebase functions:config:set push_v2.enabled=true
firebase functions:config:set push_v2.rollout_percentage=10

# In Firebase Remote Config:
# - enhanced_push_enabled: true
# - enhanced_push_rollout: 10

# Restart functions to pick up config
firebase functions:delete scheduledNotificationCleanup --force
firebase deploy --only functions:scheduledNotificationCleanup
```

**Monitoring Week 1**:
- ✅ Daily check of delivery rate
- ✅ Monitor error logs in Cloud Functions
- ✅ Check Firestore costs (should be stable)
- ✅ User feedback collection
- ✅ A/B comparison: v1 vs v2 metrics

**Success Criteria**:
- Delivery rate 10% cohort: ≥95%
- No increase in error rate
- Latency P95: <3s
- Zero critical bugs

#### 2.2 Week 2: 50% Traffic

```bash
# Update rollout percentage
firebase functions:config:set push_v2.rollout_percentage=50

# Update Remote Config: enhanced_push_rollout: 50

# Restart functions
firebase functions:delete scheduledNotificationCleanup --force
firebase deploy --only functions:scheduledNotificationCleanup
```

**Monitoring Week 2**:
- Same as Week 1 with larger sample
- Compare metrics 10% vs 50% cohorts
- Validate cost projections

#### 2.3 Week 3: 100% Traffic

```bash
# Full rollout
firebase functions:config:set push_v2.rollout_percentage=100

# Update Remote Config: enhanced_push_rollout: 100

# Restart functions
firebase functions:delete scheduledNotificationCleanup --force
firebase deploy --only functions:scheduledNotificationCleanup
```

**Post-Rollout Tasks**:
- Remove legacy code (after 1 week validation)
- Update documentation
- Team training on new features
- Celebrate! 🎉

---

## 🧪 Testing

### Unit Tests

```bash
# Frontend tests
npm run test:unit

# Expected output:
# ✅ pushService.test.js - 15 tests passing
# ✅ notificationCascade.test.js - 12 tests passing
# ✅ notificationAnalytics.test.js - 10 tests passing
# ✅ segmentBuilder.test.js - 8 tests passing
# ✅ smartScheduler.test.js - 9 tests passing
# ✅ templateRenderer.test.js - 11 tests passing
```

### Integration Tests

```bash
# Test full notification flow
npm run test:integration

# Test scenarios:
# 1. Send notification → Delivery → Click tracking
# 2. Segmented campaign creation
# 3. A/B test setup and tracking
# 4. Smart scheduling with timezone
# 5. Template rendering with variables
```

### Load Tests (K6)

```bash
# Install K6
brew install k6  # macOS
# or
choco install k6  # Windows

# Run load test
k6 run tests/load/push-notifications-load.js

# Target metrics:
# - 1,000 notifications/minute sustained
# - P95 latency < 3s
# - Error rate < 1%
# - Throughput: 16.7 RPS
```

### E2E Tests (Playwright)

```bash
# Install Playwright
npm install -D @playwright/test

# Run E2E tests
npx playwright test tests/e2e/notifications.spec.js

# Test scenarios:
# 1. Admin creates segment
# 2. Admin creates notification campaign
# 3. User receives notification
# 4. User clicks notification (deep link)
# 5. Analytics tracking validates
# 6. Dashboard displays metrics
```

---

## 📊 Monitoring

### 1. Metrics to Monitor

#### Firebase Console

Navigate to: https://console.firebase.google.com/project/your-project/functions

**Cloud Functions**:
- `scheduledNotificationCleanup` - Invocations, errors, execution time
- Active instances count
- Memory usage

**Firestore**:
- Read/Write operations per second
- Document count growth
- Index usage

**Cloud Messaging**:
- Messages sent
- Delivery rate
- Token refresh rate

#### Custom Dashboard

URL: `https://playsport.pro/admin/notifications/analytics`

**Real-time Metrics**:
- Delivery Rate (target: >95%)
- Error Rate (target: <5%)
- CTR (target: >5%)
- Conversion Rate (target: >3%)
- P95 Latency (target: <3s)

**Alerts**:
- Delivery rate drops below 95%
- Circuit breaker trips (OPEN state)
- Error rate exceeds 5%
- Latency P95 > 5s

### 2. Alerting Setup

#### Slack Integration

```bash
# Add webhook URL to Firebase Functions
firebase functions:config:set slack.webhook_url="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Test alert
curl -X POST https://your-region-your-project.cloudfunctions.net/sendSlackAlert \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "#alerts-push",
    "text": "🚨 Test Alert: Delivery rate below threshold",
    "metrics": {
      "deliveryRate": "92%",
      "errorRate": "8%"
    }
  }'
```

#### PagerDuty Integration

```javascript
// In Cloud Function
const PagerDuty = require('pagerduty');

if (circuitBreaker.state === 'OPEN') {
  await pagerduty.trigger({
    severity: 'critical',
    summary: 'Push Notifications Circuit Breaker OPEN',
    source: 'push-service',
    custom_details: {
      error_rate: metrics.errorRate,
      state: 'OPEN',
      last_failure: new Date()
    }
  });
}
```

### 3. Logging

```bash
# View Cloud Function logs
firebase functions:log --only scheduledNotificationCleanup

# Filter errors only
firebase functions:log --only scheduledNotificationCleanup | grep ERROR

# Real-time streaming
firebase functions:log --follow
```

### 4. Performance Monitoring

```javascript
// Firebase Performance Monitoring già integrato
import { getPerformance, trace } from 'firebase/performance';

const perf = getPerformance();
const notificationTrace = trace(perf, 'notification_send');

notificationTrace.start();
await pushService.send(userId, notification);
notificationTrace.stop();
```

---

## 🔄 Rollback Plan

### Immediate Rollback (< 5 minutes)

```bash
# 1. Disable Push v2 via Remote Config
# Firebase Console → Remote Config → enhanced_push_enabled: false

# 2. Revert feature flag
firebase functions:config:set push_v2.enabled=false

# 3. Redeploy previous version
git checkout main
firebase deploy --only functions,hosting

# 4. Verify rollback
curl https://playsport.pro/health/push
# Expected: Legacy system active
```

### Partial Rollback (Reduce Traffic)

```bash
# Reduce to 10% traffic
firebase functions:config:set push_v2.rollout_percentage=10

# Update Remote Config
# enhanced_push_rollout: 10

# Restart functions
firebase deploy --only functions:scheduledNotificationCleanup
```

### Data Recovery

```bash
# Firestore backups (automatic daily)
# Restore from backup if needed:
gcloud firestore import gs://your-project-firestore-backups/[BACKUP_DATE]

# Verify restore
firebase firestore:indexes
```

---

## 🔧 Troubleshooting

### Common Issues

#### Issue 1: High Error Rate

**Symptoms**: Error rate > 5%, many failed notifications

**Diagnosis**:
```bash
# Check Cloud Function logs
firebase functions:log --only scheduledNotificationCleanup | grep ERROR

# Check circuit breaker state
# Navigate to: /admin/notifications/analytics
# Look for: Circuit Breaker Status
```

**Solutions**:
1. **Temporary**: Reduce rollout percentage to 10%
2. **Check**: VAPID keys validity (expire every 90 days)
3. **Validate**: Firestore indexes created successfully
4. **Verify**: Network connectivity to FCM servers

#### Issue 2: Low Delivery Rate

**Symptoms**: Delivery rate < 95%

**Diagnosis**:
```bash
# Check subscription status
# Firestore → pushSubscriptions collection
# Count status='active' vs status='expired'

# Check cascade fallback stats
const stats = notificationCascade.getStats();
console.log(stats.channelEfficiency);
```

**Solutions**:
1. Run cleanup job manually to remove expired subscriptions
2. Verify email/SMS fallback configured correctly
3. Check user notification permissions
4. Validate deep links resolving correctly

#### Issue 3: High Latency

**Symptoms**: P95 latency > 5s

**Diagnosis**:
```bash
# Check Firestore query performance
# Firebase Console → Firestore → Usage → Query Performance

# Check index usage
firebase firestore:indexes

# Check function cold start times
# Cloud Functions → Metrics → Cold Start Duration
```

**Solutions**:
1. Verify all indexes created
2. Enable min instances for Cloud Functions (reduce cold starts)
3. Batch queries more aggressively (increase batch size)
4. Add caching layer (Redis) for frequent queries

#### Issue 4: Cleanup Job Failing

**Symptoms**: Old data not being deleted

**Diagnosis**:
```bash
# Check cleanup function logs
firebase functions:log --only scheduledNotificationCleanup

# Manually trigger cleanup
firebase functions:shell
# > triggerCleanupManually({}, { auth: { uid: 'admin-uid' } })
```

**Solutions**:
1. Check Firestore permissions (service account needs delete permission)
2. Increase function timeout (default 540s may not be enough)
3. Reduce batch size if hitting memory limits
4. Run cleanup more frequently (daily → twice daily)

---

## 🔧 Maintenance

### Daily Tasks

- ✅ Check dashboard metrics (5 min)
- ✅ Review error logs (10 min)
- ✅ Validate cleanup job ran successfully (2 min)

### Weekly Tasks

- ✅ Review A/B test results
- ✅ Analyze conversion funnel
- ✅ Check Firestore costs vs budget
- ✅ Update notification templates if needed
- ✅ Review segment performance

### Monthly Tasks

- ✅ Full performance audit
- ✅ Update VAPID keys if expiring soon
- ✅ Review and archive old segments
- ✅ Optimize Firestore indexes based on usage
- ✅ Team training on new features
- ✅ Security audit

### Quarterly Tasks

- ✅ Major version updates (Firebase SDK, dependencies)
- ✅ Capacity planning (scale estimates)
- ✅ Cost optimization review
- ✅ Disaster recovery drill
- ✅ Documentation updates

---

## 📞 Support

### Internal Contacts

- **Technical Lead**: development-team@playsport.pro
- **DevOps**: devops@playsport.pro
- **On-call**: +39 XXX XXX XXXX (PagerDuty)

### External Resources

- Firebase Support: https://firebase.google.com/support
- Web Push Specs: https://www.w3.org/TR/push-api/
- FCM Documentation: https://firebase.google.com/docs/cloud-messaging

---

## ✅ Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (unit, integration, E2E)
- [ ] Build successful (no errors)
- [ ] Environment variables configured
- [ ] Firestore indexes created
- [ ] Cloud Functions secrets set (VAPID keys)
- [ ] Staging deployment validated
- [ ] Team training completed
- [ ] Rollback plan documented
- [ ] Monitoring dashboards ready
- [ ] Alert channels configured

### During Deployment

- [ ] Feature flags configured (start 0%)
- [ ] Cloud Functions deployed
- [ ] Firestore rules updated
- [ ] Hosting deployed
- [ ] Smoke tests executed
- [ ] Gradual rollout started (10%)
- [ ] Metrics monitored continuously

### Post-Deployment

- [ ] 24h monitoring (no incidents)
- [ ] Metrics meet success criteria
- [ ] User feedback collected
- [ ] Documentation updated
- [ ] Legacy code archived
- [ ] Retrospective completed
- [ ] Celebrate success! 🎉

---

**Last Updated**: 16 Ottobre 2025  
**Version**: 2.0.0  
**Status**: ✅ Ready for Production
