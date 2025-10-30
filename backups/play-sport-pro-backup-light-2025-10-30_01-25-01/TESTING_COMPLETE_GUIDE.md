# 🧪 Push Notifications v2.0 - Testing Complete Guide

**Version**: 2.0.0  
**Last Updated**: 16 Ottobre 2025  
**Status**: Ready for Execution

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [E2E Tests](#e2e-tests)
5. [Load Tests](#load-tests)
6. [Monitoring & Observability](#monitoring--observability)
7. [Test Execution](#test-execution)
8. [CI/CD Integration](#cicd-integration)

---

## Overview

### Testing Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    Testing Pyramid                       │
│                                                          │
│                     ╱╲                                   │
│                    ╱E2╲          15% - E2E Tests        │
│                   ╱────╲                                 │
│                  ╱ Int. ╲        25% - Integration      │
│                 ╱────────╲                               │
│                ╱   Unit   ╲      60% - Unit Tests       │
│               ╱────────────╲                             │
│                                                          │
│  + Load Tests (K6)                                       │
│  + Monitoring (Sentry)                                   │
└─────────────────────────────────────────────────────────┘
```

### Test Coverage Goals

| Component | Target Coverage | Current |
|-----------|----------------|---------|
| **Services** | 80% | TBD |
| **Components** | 70% | TBD |
| **Utils** | 90% | TBD |
| **Overall** | 75% | TBD |

---

## Unit Tests

### Technology Stack

- **Framework**: Vitest
- **Assertions**: Vitest expect API
- **Mocking**: Vitest vi API
- **Coverage**: v8

### Test Files Created

#### 1. `pushService.test.js` (350+ lines)

**Test Suites**:
- ✅ `send()` - 5 tests
- ✅ `CircuitBreaker` - 3 tests
- ✅ `getMetrics()` - 3 tests
- ✅ Error Handling - 4 tests
- ✅ Performance - 2 tests
- ✅ CircuitBreaker (Isolated) - 6 tests

**Total**: 23 unit tests

**Key Tests**:
```javascript
✓ should send notification successfully
✓ should retry on failure with exponential backoff
✓ should fail after max retries
✓ should handle 410 Gone by cleaning up subscription
✓ should open circuit breaker after threshold failures
✓ should calculate delivery rate correctly
✓ should track latency percentiles
✓ should handle network timeout
✓ should handle rate limiting (429)
✓ should handle high throughput
```

#### 2. `notificationCascade.test.js` (450+ lines)

**Test Suites**:
- ✅ `send()` - 6 tests
- ✅ Type-Specific Routing - 3 tests
- ✅ `getStats()` - 3 tests
- ✅ Error Handling - 3 tests
- ✅ Performance - 2 tests
- ✅ Channel Cost Calculation - 4 tests

**Total**: 21 unit tests

**Key Tests**:
```javascript
✓ should send via push as first priority
✓ should fallback to email when push fails
✓ should try all channels in cascade until success
✓ should respect user preferences
✓ should respect maxCost threshold
✓ should include SMS for PAYMENT_DUE
✓ should calculate channel efficiency correctly
✓ should handle concurrent sends
```

### Running Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run with watch mode (development)
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npx vitest run pushService.test.js
```

### Expected Output

```
✓ pushService.test.js (23 tests) 2450ms
  ✓ PushService (17 tests) 2100ms
    ✓ send() (5 tests)
    ✓ CircuitBreaker (3 tests)
    ✓ getMetrics() (3 tests)
    ✓ Error Handling (4 tests)
    ✓ Performance (2 tests)
  ✓ CircuitBreaker (Isolated) (6 tests) 350ms

✓ notificationCascade.test.js (21 tests) 1890ms
  ✓ NotificationCascade (17 tests) 1650ms
    ✓ send() (6 tests)
    ✓ Type-Specific Routing (3 tests)
    ✓ getStats() (3 tests)
    ✓ Error Handling (3 tests)
    ✓ Performance (2 tests)
  ✓ Channel Cost Calculation (4 tests) 240ms

Test Files  2 passed (2)
Tests       44 passed (44)
Duration    4.34s

Coverage:
  Statements   : 82.5%
  Branches     : 78.3%
  Functions    : 85.1%
  Lines        : 83.2%
```

---

## Integration Tests

### Scope

Integration tests verify interaction between:
- Services ↔ Firebase Firestore
- Services ↔ Cloud Functions
- Services ↔ External APIs (Email, SMS)
- Components ↔ Services

### Test Scenarios

#### 1. Push Service → Firestore Integration

```javascript
describe('PushService + Firestore', () => {
  it('should save notification to Firestore', async () => {
    const result = await pushService.send('user-123', notification);
    
    // Verify Firestore document created
    const doc = await getDoc(doc(db, 'notificationEvents', result.notificationId));
    expect(doc.exists()).toBe(true);
    expect(doc.data().userId).toBe('user-123');
  });

  it('should mark subscription as expired on 410 Gone', async () => {
    // Mock 410 error
    // Send notification
    // Verify subscription status updated
  });
});
```

#### 2. NotificationCascade → Email Provider

```javascript
describe('NotificationCascade + Email', () => {
  it('should send email via provider API', async () => {
    // Mock push failure
    // Send notification
    // Verify email API called
    // Verify email delivered
  });
});
```

#### 3. Analytics → Firebase Analytics

```javascript
describe('NotificationAnalytics + Firebase', () => {
  it('should log events to Firebase Analytics', async () => {
    await notificationAnalytics.trackSent({ ... });
    
    // Verify Firebase Analytics event logged
    // Check Firestore event document created
  });
});
```

### Running Integration Tests

```bash
# Start Firebase emulators
firebase emulators:start

# Run integration tests
npm run test:integration

# Run with real Firebase (staging)
FIREBASE_ENV=staging npm run test:integration
```

---

## E2E Tests

### Technology Stack

- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: iOS Safari, Android Chrome

### Test Files Created

#### `notifications.spec.js` (400+ lines)

**Test Suites**:
- ✅ Push Notifications E2E - 15 tests
- ✅ Mobile Notifications E2E - 1 test

**Total**: 16 E2E tests

**Key Scenarios**:
```javascript
✓ should request push notification permission
✓ should receive test notification
✓ should show notification in analytics dashboard
✓ should create user segment
✓ should send notification to segment
✓ should schedule notification
✓ should display notification templates
✓ should test template with variables
✓ should handle notification click
✓ should respect user notification preferences
✓ should show circuit breaker status
✓ should export analytics data
✓ should handle offline mode gracefully
✓ should auto-refresh analytics dashboard
✓ should filter analytics by time range
✓ should work on mobile devices
```

### Running E2E Tests

```bash
# Install Playwright browsers (first time)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# Run specific browser
npx playwright test --project=chromium

# Run mobile tests
npx playwright test --project="Mobile Safari"
```

### Expected Output

```
Running 16 tests using 4 workers

  ✓ [chromium] › notifications.spec.js:11:3 › Push Notifications E2E › should request push notification permission (2.1s)
  ✓ [chromium] › notifications.spec.js:28:3 › Push Notifications E2E › should receive test notification (3.4s)
  ✓ [chromium] › notifications.spec.js:51:3 › Push Notifications E2E › should show notification in analytics dashboard (1.8s)
  ✓ [chromium] › notifications.spec.js:71:3 › Push Notifications E2E › should create user segment (2.5s)
  ✓ [chromium] › notifications.spec.js:95:3 › Push Notifications E2E › should send notification to segment (3.2s)
  ...

  16 passed (45.2s)
```

---

## Load Tests

### Technology Stack

- **Framework**: K6
- **Metrics**: Custom (delivery rate, latency, cost)
- **Scenarios**: Normal, Peak, Spike, Stress

### Test File Created

#### `load-test.js` (400+ lines)

**Test Scenarios**:
- ✅ Normal Load: 20 VUs, 10 minutes
- ✅ Peak Load: 100 VUs, 5 minutes
- ✅ Spike Test: 0→200→0 VUs in 2 minutes
- ✅ Critical Notifications: 5 VUs, 20 minutes continuous

**Custom Metrics**:
- `notification_delivery_rate` (target: >95%)
- `notification_delivery_time` (target: P95 <3000ms)
- `cascade_attempts` (target: avg <2)
- `total_notification_cost` (tracking)
- `notification_error_rate` (target: <5%)

### Running Load Tests

```bash
# Install K6
# Windows: choco install k6
# Mac: brew install k6
# Linux: sudo apt install k6

# Run basic load test
npm run test:load

# Run spike test
npm run test:load:spike

# Run stress test
npm run test:load:stress

# Run with custom parameters
k6 run --vus 50 --duration 5m tests/load/load-test.js

# Run with environment variables
k6 run --env BASE_URL=https://staging.playsportpro.com tests/load/load-test.js
```

### Expected Output

```
     ✓ send status is 200
     ✓ send has success field
     ✓ send completed in <3s

     checks.........................: 98.50% ✓ 2955    ✗ 45
     data_received..................: 15 MB  25 kB/s
     data_sent......................: 8.2 MB 14 kB/s
     http_req_duration..............: avg=1847ms min=245ms med=1520ms max=4230ms p(95)=2980ms p(99)=3240ms
     http_req_failed................: 0.80%  ✓ 24      ✗ 2976
     notification_delivery_rate.....: 95.20% ✓ 2856    ✗ 144
     notification_delivery_time.....: avg=1847ms min=245ms med=1520ms max=4230ms p(95)=2980ms p(99)=3240ms
     cascade_attempts...............: avg=1.45 min=1 med=1 max=4 p(95)=2 p(99)=3
     total_notification_cost........: €142.50
     notification_error_rate........: 4.80%  ✓ 144     ✗ 2856

✓ All thresholds passed
```

### Performance Targets

| Metric | Target | Acceptable | Critical |
|--------|--------|------------|----------|
| **Delivery Rate** | >95% | 90-95% | <90% |
| **P95 Latency** | <3000ms | 3000-5000ms | >5000ms |
| **Error Rate** | <5% | 5-10% | >10% |
| **Throughput** | 1000/min | 500-1000/min | <500/min |
| **Cascade Attempts** | <1.5 avg | 1.5-2.0 | >2.0 |

---

## Monitoring & Observability

### Sentry Integration

**File Created**: `src/monitoring/sentry.js` (200+ lines)

**Features**:
- ✅ Error tracking with context
- ✅ Performance monitoring (transactions)
- ✅ Custom instrumentation for services
- ✅ Alert rules configuration
- ✅ Session replay (10% sample)

**Key Functions**:
```javascript
// Error tracking
trackNotificationError(error, context);
trackCircuitBreakerOpen(metrics);
trackDeliveryFailure(userId, notificationId, error, attempts);
trackCascadeFailure(userId, notificationId, attempts);

// Performance monitoring
const transaction = measureNotificationSend(userId, notificationId);
// ... send notification
transaction.finish(result);

// Instrumentation
instrumentPushService(pushService);
instrumentNotificationCascade(cascade);
```

### Alert Rules

| Alert | Condition | Action |
|-------|-----------|--------|
| **High Error Rate** | >10% in 5min | Email + Slack + PagerDuty |
| **Circuit Breaker Open** | Immediate | PagerDuty |
| **Cascade Failure** | All channels fail | Slack + Email |
| **Slow Notifications** | P95 >5000ms in 10min | Slack |
| **High Failure Count** | >50 errors in 5min | Email + Slack |

### Sentry Setup

```bash
# 1. Install Sentry
npm install @sentry/react @sentry/tracing

# 2. Configure environment variable
echo "VITE_SENTRY_DSN=https://your-dsn@sentry.io/project" >> .env

# 3. Initialize in main.js
import './monitoring/sentry';

# 4. Instrument services
import monitoring from './monitoring/sentry';
monitoring.instrumentPushService(pushService);
monitoring.instrumentNotificationCascade(notificationCascade);
```

---

## Test Execution

### Local Development

```bash
# 1. Run unit tests (fast feedback)
npm run test:watch

# 2. Run integration tests (with emulators)
firebase emulators:start
npm run test:integration

# 3. Run E2E tests (before commit)
npm run test:e2e

# 4. Check coverage
npm run test:coverage
```

### Pre-Deployment

```bash
# Run full test suite
npm run test:all

# Expected duration: ~10 minutes
# - Unit tests: ~5s
# - Integration tests: ~30s
# - E2E tests: ~45s
# - Load tests: ~5min (optional)
```

### Staging Environment

```bash
# 1. Deploy to staging
firebase hosting:channel:deploy staging

# 2. Run smoke tests
npm run test:smoke -- --base-url https://staging.playsportpro.com

# 3. Run load tests
k6 run --env BASE_URL=https://staging.playsportpro.com tests/load/load-test.js

# 4. Monitor for 24 hours
# Check Sentry dashboard
# Check Firebase Analytics
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Push Notifications Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: firebase emulators:exec "npm run test:integration"

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  load-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: grafana/k6-action@v0.3.0
        with:
          filename: tests/load/load-test.js
          flags: --vus 10 --duration 2m
```

---

## Test Metrics & Reporting

### Coverage Report

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html
```

**Expected Coverage**:
- `pushService.js`: 85%
- `notificationCascade.js`: 82%
- `notificationAnalytics.js`: 78%
- `segmentBuilder.js`: 80%
- `smartScheduler.js`: 75%
- `notificationTemplateSystem.js`: 80%
- `notificationCleanupService.js`: 75%

### Test Reports

**Playwright HTML Report**:
```bash
npx playwright show-report
```

**K6 HTML Report**:
```bash
k6 run --out json=test-results.json tests/load/load-test.js
# Upload to Grafana Cloud or K6 Cloud
```

---

## Success Criteria

### Unit Tests ✅
- ✅ 44 tests created
- ✅ All critical paths covered
- ✅ Mocking strategy defined
- ⏳ Execute and validate coverage >80%

### Integration Tests ⏳
- ⏳ Firebase emulator setup
- ⏳ API integration tests
- ⏳ Database interaction tests

### E2E Tests ✅
- ✅ 16 E2E scenarios created
- ✅ User flows covered
- ✅ Mobile testing included
- ⏳ Execute and validate

### Load Tests ✅
- ✅ K6 test suite created
- ✅ Performance targets defined
- ✅ Scalability scenarios
- ⏳ Execute and validate thresholds

### Monitoring ✅
- ✅ Sentry integration configured
- ✅ Alert rules defined
- ✅ Custom instrumentation
- ⏳ Deploy and validate alerts

---

## Next Steps

1. **Execute Unit Tests** (30 min)
   ```bash
   npm run test:unit
   ```

2. **Execute E2E Tests** (1 hour)
   ```bash
   npm run test:e2e
   ```

3. **Execute Load Tests** (30 min)
   ```bash
   npm run test:load
   ```

4. **Setup Sentry** (15 min)
   - Create Sentry project
   - Configure DSN
   - Test error tracking

5. **Integrate in CI/CD** (1 hour)
   - Add GitHub Actions workflow
   - Configure secrets
   - Test pipeline

**Total Estimated Time**: 3-4 hours

---

**Version**: 2.0.0  
**Last Updated**: 16 Ottobre 2025  
**Status**: ✅ Test Suite Complete - Ready for Execution  
**Maintained by**: Play Sport Pro QA Team
