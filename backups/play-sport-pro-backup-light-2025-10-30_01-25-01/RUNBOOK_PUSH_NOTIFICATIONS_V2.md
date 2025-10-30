# 🚨 Push Notifications v2.0 - Runbook Operativo

**Version**: 2.0.0  
**Last Updated**: 16 Ottobre 2025  
**Audience**: DevOps, SRE, On-Call Engineers

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Emergency Contacts](#emergency-contacts)
3. [Common Incidents](#common-incidents)
4. [Runbook Procedures](#runbook-procedures)
5. [Health Check Commands](#health-check-commands)
6. [Rollback Procedures](#rollback-procedures)
7. [Escalation Matrix](#escalation-matrix)

---

## Overview

### System Architecture

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  PushService    │◄──► CircuitBreaker
└────────┬────────┘
         │
         ▼
┌──────────────────┐
│ NotificationCas- │◄──► Email/SMS Providers
│    cade          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Firestore      │
│   - pushSubscr.. │
│   - notif Events │
│   - scheduled..  │
└──────────────────┘
```

### Key Metrics

| Metric | Normal | Warning | Critical |
|--------|--------|---------|----------|
| Delivery Rate | >95% | 90-95% | <90% |
| Error Rate | <5% | 5-10% | >10% |
| P95 Latency | <3s | 3-5s | >5s |
| Circuit Breaker | CLOSED | HALF_OPEN | OPEN |
| Queue Depth | <100 | 100-500 | >500 |

---

## Emergency Contacts

### On-Call Rotation

| Role | Primary | Secondary |
|------|---------|-----------|
| **DevOps Lead** | +39 XXX XXX XXXX | +39 YYY YYY YYYY |
| **Backend Dev** | +39 ZZZ ZZZ ZZZZ | +39 AAA AAA AAAA |
| **Frontend Dev** | +39 BBB BBB BBBB | +39 CCC CCC CCCC |

### External Services

| Service | Support | Contact |
|---------|---------|---------|
| **Firebase** | Premier Support | support.google.com/firebase |
| **Netlify** | Pro Support | support.netlify.com |
| **Email Provider** | 24/7 | support@provider.com |
| **SMS Provider** | 24/7 | support@sms-provider.com |

### Communication Channels

- **Slack**: `#push-notifications-alerts`
- **PagerDuty**: `push-notifications-oncall`
- **Status Page**: `status.playsportpro.com`

---

## Common Incidents

### 🔴 INCIDENT #1: High Error Rate (>10%)

**Symptoms**:
- Dashboard shows error rate >10%
- Multiple users reporting "Notification not received"
- Circuit breaker state: OPEN

**Impact**: HIGH - Notifications not delivering

**Immediate Actions**:

1. **Check Circuit Breaker State**:
```javascript
// In browser console
import { pushService } from '@/services/pushService';
const metrics = pushService.getMetrics();
console.log('Circuit Breaker:', metrics.circuitBreaker);
```

2. **Check Firestore Connection**:
```bash
# Firebase CLI
firebase firestore:get pushSubscriptions --limit 1
```

3. **Check Service Worker**:
```javascript
// Browser console
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('SW Registrations:', regs.length);
  regs.forEach(reg => console.log('SW State:', reg.active?.state));
});
```

**Root Cause Analysis**:

| Cause | Check | Fix |
|-------|-------|-----|
| VAPID keys expired/invalid | Firebase Console > Cloud Messaging | Regenerate VAPID keys |
| Service Worker outdated | Check sw.js version | Force update: `reg.update()` |
| Firestore quota exceeded | Firebase Console > Usage | Upgrade plan or optimize queries |
| Network issues | Check Firestore status page | Wait for resolution |

**Resolution Steps**:

```bash
# 1. Check VAPID configuration
firebase functions:config:get vapid

# 2. Verify service worker
curl https://playsportpro.com/sw.js | head -20

# 3. Check Firestore indexes
firebase firestore:indexes:list

# 4. If VAPID issue, update and redeploy
firebase functions:config:set vapid.public_key="NEW_KEY" vapid.private_key="NEW_SECRET"
firebase deploy --only functions

# 5. Force service worker update for all users
# (Add version bump to sw.js and redeploy)
npm run build
firebase deploy --only hosting
```

**Post-Incident**:
- Document root cause in `#incidents` channel
- Update monitoring thresholds if needed
- Create postmortem within 24h

---

### 🟠 INCIDENT #2: Circuit Breaker OPEN

**Symptoms**:
- All notifications failing
- Circuit breaker state: OPEN
- Error: "Circuit breaker is OPEN"

**Impact**: CRITICAL - Complete service outage

**Immediate Actions**:

1. **Force Close Circuit Breaker** (Emergency):
```javascript
// Admin panel or browser console
import { pushService } from '@/services/pushService';
pushService.circuitBreaker.reset();
console.log('Circuit breaker manually reset');
```

2. **Investigate Underlying Cause**:
```bash
# Check recent errors
firebase functions:log --only sendNotification --limit 50

# Check Firestore errors
# Firebase Console > Firestore > Usage > Errors
```

**Common Causes**:

1. **VAPID Key Issues**: 
   - Symptom: 401 Unauthorized errors
   - Fix: Regenerate VAPID keys

2. **Service Worker Not Registered**:
   - Symptom: "No registration found"
   - Fix: Verify sw.js accessible and force update

3. **Push Service Degradation**:
   - Symptom: Timeout errors
   - Fix: Wait for FCM/browser service recovery

**Resolution**:

```bash
# Option 1: Wait for auto-recovery (60 seconds)
# Circuit breaker will transition OPEN → HALF_OPEN → CLOSED

# Option 2: Manual intervention
# 1. Fix underlying issue (VAPID, SW, etc)
# 2. Reset circuit breaker via admin panel
# 3. Monitor for 5 minutes
```

**Verification**:
```javascript
// Should show CLOSED state
const metrics = pushService.getMetrics();
console.log('State:', metrics.circuitBreaker.state);
console.log('Success rate:', metrics.deliveryRate);
```

---

### 🟡 INCIDENT #3: Slow Delivery (<90% in 5s)

**Symptoms**:
- P95 latency >5 seconds
- Users report delayed notifications
- Queue depth increasing

**Impact**: MEDIUM - Degraded performance

**Investigation**:

```javascript
// Check latency metrics
const metrics = pushService.getMetrics();
console.log('Latency P95:', metrics.latency.p95);
console.log('Latency P99:', metrics.latency.p99);

// Check analytics for bottlenecks
import { notificationAnalytics } from '@/services/notificationAnalytics';
const channelPerf = await notificationAnalytics.getChannelPerformance(
  new Date(Date.now() - 60*60*1000), // Last hour
  new Date()
);
console.table(channelPerf);
```

**Common Causes**:

1. **Firestore Query Slow**:
   - Check: Missing indexes
   - Fix: Deploy indexes from `firestore.indexes.js`

2. **Retry Storms**:
   - Check: High retry count in metrics
   - Fix: Increase exponential backoff base time

3. **External Service Latency**:
   - Check: Email/SMS provider status
   - Fix: Temporarily disable cascade for non-critical

**Optimization Steps**:

```bash
# 1. Deploy Firestore indexes
firebase deploy --only firestore:indexes

# 2. Check index build status
firebase firestore:indexes:list

# 3. Reduce retry attempts temporarily
# Edit src/services/pushService.js:
# MAX_RETRIES = 2 (instead of 3)

# 4. Increase circuit breaker threshold
# FAILURE_THRESHOLD = 60 (instead of 50)

# 5. Redeploy
npm run build
firebase deploy --only hosting
```

---

### 🟢 INCIDENT #4: High Cascade Fallback Rate

**Symptoms**:
- >30% notifications falling back to email/SMS
- Increased costs (SMS = €0.05 each)
- Push channel success <70%

**Impact**: LOW - Service working but costly

**Analysis**:

```javascript
import { notificationCascade } from '@/services/notificationCascade';
const stats = notificationCascade.getStats();
console.log('Total cost:', stats.totalCost);
console.log('Channel efficiency:', stats.channelEfficiency);
```

**Root Causes**:

1. **Expired Push Subscriptions**:
   - Many users with `status='expired'`
   - Fix: Run cleanup service

2. **Users Not Granting Permission**:
   - Permission prompt declined
   - Fix: Improve UX for permission request

3. **Service Worker Issues**:
   - SW not updating properly
   - Fix: Force SW update

**Resolution**:

```bash
# 1. Run cleanup to remove expired subscriptions
firebase functions:shell
> triggerCleanupManually({}, { auth: { uid: 'admin-uid' } })

# 2. Check cleanup results
# Firebase Console > Firestore > pushSubscriptions
# Filter: status = 'expired'

# 3. Improve permission prompt UX
# Update src/components/PushPermissionPrompt.jsx

# 4. Monitor for 24 hours
```

**Cost Optimization**:
- Set `maxCost` in cascade options
- Disable SMS for non-critical notifications
- Re-engage users to enable push

---

## Health Check Commands

### Quick Health Check (2 minutes)

```bash
#!/bin/bash
# health-check.sh

echo "=== Push Notifications Health Check ==="

# 1. Service Worker Status
echo "\n1. Service Worker:"
curl -I https://playsportpro.com/sw.js | grep "200 OK"

# 2. Firestore Connectivity
echo "\n2. Firestore:"
firebase firestore:get pushSubscriptions --limit 1

# 3. Cloud Functions Status
echo "\n3. Cloud Functions:"
firebase functions:log --limit 1

# 4. Recent Notifications
echo "\n4. Recent Activity:"
firebase firestore:query notificationEvents --limit 5 --order-by timestamp desc

echo "\n=== Health Check Complete ==="
```

### Deep Health Check (10 minutes)

```javascript
// deep-health-check.js
import { pushService } from '@/services/pushService';
import { notificationAnalytics } from '@/services/notificationAnalytics';
import { cleanupService } from '@/services/notificationCleanupService';

async function deepHealthCheck() {
  console.log('=== Deep Health Check ===\n');

  // 1. Push Service Metrics
  const metrics = pushService.getMetrics();
  console.log('Push Service:');
  console.log(`  Delivery Rate: ${metrics.deliveryRate}`);
  console.log(`  Error Rate: ${metrics.errorRate}`);
  console.log(`  Circuit Breaker: ${metrics.circuitBreaker.state}`);
  console.log(`  P95 Latency: ${metrics.latency.p95}ms\n`);

  // 2. Analytics Summary
  const dashboard = await notificationAnalytics.getDashboardMetrics(60);
  console.log('Analytics (Last Hour):');
  console.log(`  Sent: ${dashboard.summary.sent}`);
  console.log(`  Delivered: ${dashboard.summary.delivered}`);
  console.log(`  CTR: ${dashboard.summary.ctr}\n`);

  // 3. Cleanup Stats
  const cleanupStats = cleanupService.getStats();
  console.log('Cleanup Stats (Total):');
  console.log(`  Total Cleaned: ${cleanupStats.totalCleaned}`);
  console.log(`  Subscriptions Deleted: ${cleanupStats.subscriptionsDeleted}\n`);

  // 4. Health Score
  const healthScore = calculateHealthScore(metrics, dashboard);
  console.log(`\nOverall Health Score: ${healthScore}/100`);
  
  if (healthScore >= 90) console.log('Status: ✅ HEALTHY');
  else if (healthScore >= 70) console.log('Status: ⚠️ DEGRADED');
  else console.log('Status: 🔴 CRITICAL');
}

function calculateHealthScore(metrics, dashboard) {
  let score = 100;
  
  // Delivery rate (40 points)
  const deliveryRate = parseFloat(metrics.deliveryRate);
  if (deliveryRate < 95) score -= (95 - deliveryRate) * 4;
  
  // Error rate (30 points)
  const errorRate = parseFloat(metrics.errorRate);
  if (errorRate > 5) score -= (errorRate - 5) * 3;
  
  // Circuit breaker (20 points)
  if (metrics.circuitBreaker.state === 'OPEN') score -= 20;
  else if (metrics.circuitBreaker.state === 'HALF_OPEN') score -= 10;
  
  // Latency (10 points)
  if (metrics.latency.p95 > 5000) score -= 10;
  else if (metrics.latency.p95 > 3000) score -= 5;
  
  return Math.max(0, score);
}

deepHealthCheck();
```

---

## Rollback Procedures

### Emergency Rollback (<5 minutes)

**When**: Critical outage, >50% error rate, data loss risk

```bash
#!/bin/bash
# emergency-rollback.sh

echo "🚨 EMERGENCY ROLLBACK INITIATED"

# 1. Revert hosting to previous version
firebase hosting:clone SOURCE_SITE_ID:SOURCE_VERSION_ID SITE_ID
echo "✅ Hosting reverted"

# 2. Revert Cloud Functions
firebase functions:delete scheduledNotificationCleanup --force
echo "✅ Cloud Functions reverted"

# 3. Notify team
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -d '{"text":"🚨 Push Notifications: Emergency rollback completed"}'

echo "✅ Rollback complete - Monitor for 10 minutes"
```

### Partial Rollback (Feature Flag)

**When**: Specific feature causing issues

```javascript
// Firebase Remote Config
import { getRemoteConfig, getValue } from 'firebase/remote-config';

const remoteConfig = getRemoteConfig();

// Disable specific features
await remoteConfig.setConfigSettings({
  'push_notifications_v2_enabled': false,
  'notification_cascade_enabled': false,
  'smart_scheduling_enabled': false,
  'template_system_enabled': false
});

console.log('Feature flags updated - refresh apps');
```

### Data Recovery

**When**: Accidental data deletion, corrupt data

```bash
# 1. Stop cleanup service
firebase functions:delete scheduledNotificationCleanup

# 2. Restore from backup (if available)
# Firebase Console > Firestore > Import/Export
firebase firestore:export gs://your-bucket/backups/2025-10-16

# 3. Verify data integrity
firebase firestore:query pushSubscriptions --limit 10
firebase firestore:query notificationEvents --limit 10

# 4. Re-enable cleanup (after verification)
firebase deploy --only functions:scheduledNotificationCleanup
```

---

## Escalation Matrix

### Severity Levels

| Severity | Definition | Response Time | Example |
|----------|------------|---------------|---------|
| **P0 - Critical** | Complete outage, data loss | 15 minutes | Circuit breaker OPEN, all notifications failing |
| **P1 - High** | Major degradation | 1 hour | Error rate >20%, delivery rate <80% |
| **P2 - Medium** | Minor degradation | 4 hours | Latency >5s, cascade fallback >40% |
| **P3 - Low** | Minor issue, no impact | 1 business day | UI glitch, analytics delay |

### Escalation Path

```
P0/P1 Incident
      │
      ▼
┌─────────────┐
│  On-Call    │◄── PagerDuty alert
│  Engineer   │
└──────┬──────┘
       │ (15 min - no resolution)
       ▼
┌─────────────┐
│  DevOps     │◄── Manual escalation
│  Lead       │
└──────┬──────┘
       │ (30 min - no resolution)
       ▼
┌─────────────┐
│  CTO        │◄── Critical escalation
└─────────────┘
```

### Incident Declaration

**Declare Incident When**:
- Error rate >15% for >10 minutes
- Circuit breaker OPEN for >5 minutes
- Complete service outage
- Data loss detected
- Security breach suspected

**Declaration Process**:

1. **Create Incident**:
   ```bash
   # PagerDuty
   pd incident:create \
     --service push-notifications \
     --title "High Error Rate - Push Notifications" \
     --urgency high
   ```

2. **Notify Team**:
   - Post in `#incidents` Slack channel
   - Update status page
   - Email stakeholders (if P0)

3. **War Room**:
   - Create Zoom/Meet room
   - Assign incident commander
   - Start incident log

4. **Resolution**:
   - Implement fix
   - Verify metrics normalized
   - Maintain monitoring for 1 hour
   - Close incident
   - Schedule postmortem

---

## Monitoring Dashboards

### Grafana Dashboards

**Push Notifications Overview**:
- URL: `https://grafana.playsportpro.com/d/push-notif-overview`
- Panels:
  - Delivery Rate (24h trend)
  - Error Rate (1h resolution)
  - P95/P99 Latency
  - Circuit Breaker State
  - Channel Distribution (pie chart)
  - Cost per Channel (bar chart)

**Alert Rules**:
- Delivery rate <90% for 5 minutes → Slack + PagerDuty
- Error rate >10% for 5 minutes → Slack + PagerDuty
- Circuit breaker OPEN → Immediate PagerDuty
- P95 latency >5s for 10 minutes → Slack
- Daily cost >€50 → Email

### Firebase Console

**Key Metrics**:
- Cloud Functions > scheduledNotificationCleanup > Metrics
- Firestore > Usage > Reads/Writes/Deletes
- Cloud Messaging > Quota usage

---

## Postmortem Template

**Incident**: [Title]  
**Date**: [YYYY-MM-DD]  
**Duration**: [Start - End]  
**Severity**: P0/P1/P2/P3  
**Incident Commander**: [Name]

### Summary
[1-2 sentence summary]

### Impact
- Users affected: [number]
- Notifications failed: [number]
- Revenue impact: €[amount]
- SLA breach: Yes/No

### Timeline (UTC)
- HH:MM - Incident detected
- HH:MM - Incident declared
- HH:MM - Root cause identified
- HH:MM - Fix deployed
- HH:MM - Incident resolved

### Root Cause
[Detailed explanation]

### Resolution
[What was done to fix]

### Action Items
- [ ] [Action 1] - Owner: [Name] - Due: [Date]
- [ ] [Action 2] - Owner: [Name] - Due: [Date]

### Lessons Learned
**What went well**:
- [Item 1]

**What could be improved**:
- [Item 1]

---

**Version**: 2.0.0  
**Last Updated**: 16 Ottobre 2025  
**Maintained by**: Play Sport Pro DevOps Team  
**On-Call Schedule**: [PagerDuty Link]
