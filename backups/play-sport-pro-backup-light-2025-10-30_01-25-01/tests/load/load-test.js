/**
 * Load Tests - Push Notifications System
 * K6 performance and scalability testing
 * 
 * Run with:
 * k6 run --vus 10 --duration 30s load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const deliveryRate = new Rate('notification_delivery_rate');
const deliveryTime = new Trend('notification_delivery_time');
const cascadeAttempts = new Trend('cascade_attempts');
const totalCost = new Counter('total_notification_cost');
const errorRate = new Rate('notification_error_rate');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up to 10 users
    { duration: '5m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 100 },  // Peak load: 100 users
    { duration: '3m', target: 50 },   // Ramp down to 50
    { duration: '2m', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    // System should maintain >95% delivery rate
    'notification_delivery_rate': ['rate>0.95'],
    
    // P95 latency should be under 3 seconds
    'notification_delivery_time': ['p(95)<3000'],
    
    // Error rate should be under 5%
    'notification_error_rate': ['rate<0.05'],
    
    // HTTP errors should be minimal
    'http_req_failed': ['rate<0.01'],
    
    // Average cascade attempts should be low (ideally 1-2)
    'cascade_attempts': ['avg<2'],
  },
};

// Base URL (update with your environment)
const BASE_URL = __ENV.BASE_URL || 'https://playsportpro.com';
const API_KEY = __ENV.API_KEY || 'test-api-key';

// Test data generators
function generateUserId() {
  return `load-test-user-${Math.floor(Math.random() * 10000)}`;
}

function generateNotification(type) {
  const notifications = {
    CERTIFICATE_EXPIRING: {
      title: '⚠️ Certificato in scadenza',
      body: `Il tuo certificato scade tra ${Math.floor(Math.random() * 30)} giorni`,
      type: 'CERTIFICATE_EXPIRING',
      category: 'critical',
    },
    BOOKING_CONFIRMED: {
      title: '✅ Prenotazione confermata',
      body: 'La tua prenotazione è stata confermata',
      type: 'BOOKING_CONFIRMED',
      category: 'transactional',
    },
    PROMOTIONAL: {
      title: '🔥 Offerta speciale',
      body: 'Sconto 20% per te!',
      type: 'PROMOTIONAL',
      category: 'promotional',
    },
    MESSAGE_RECEIVED: {
      title: '💬 Nuovo messaggio',
      body: 'Hai ricevuto un nuovo messaggio',
      type: 'MESSAGE_RECEIVED',
      category: 'social',
    },
  };

  const types = Object.keys(notifications);
  const selectedType = type || types[Math.floor(Math.random() * types.length)];
  
  return notifications[selectedType];
}

// Main test scenario
export default function () {
  const userId = generateUserId();
  const notification = generateNotification();

  // Test 1: Send notification via cascade
  const sendStart = Date.now();
  const sendResponse = http.post(
    `${BASE_URL}/api/notifications/send`,
    JSON.stringify({
      userId,
      notification,
      options: {
        channels: ['push', 'email', 'sms', 'in-app'],
        respectUserPreferences: true,
      },
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      tags: { name: 'SendNotification' },
    }
  );

  const sendDuration = Date.now() - sendStart;

  // Check send response
  const sendSuccess = check(sendResponse, {
    'send status is 200': (r) => r.status === 200,
    'send has success field': (r) => r.json('success') !== undefined,
    'send completed in <3s': (r) => sendDuration < 3000,
  });

  if (sendSuccess && sendResponse.json('success')) {
    const result = sendResponse.json();
    
    deliveryRate.add(true);
    deliveryTime.add(result.latency || sendDuration);
    cascadeAttempts.add(result.totalAttempts || 1);
    totalCost.add(result.cost || 0);
    errorRate.add(false);
  } else {
    deliveryRate.add(false);
    errorRate.add(true);
  }

  // Test 2: Get analytics metrics (simulate dashboard)
  const metricsResponse = http.get(
    `${BASE_URL}/api/notifications/metrics?period=60`,
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
      tags: { name: 'GetMetrics' },
    }
  );

  check(metricsResponse, {
    'metrics status is 200': (r) => r.status === 200,
    'metrics has deliveryRate': (r) => r.json('summary.deliveryRate') !== undefined,
  });

  // Test 3: Segment building (periodic)
  if (Math.random() < 0.1) { // 10% of requests
    const segmentResponse = http.post(
      `${BASE_URL}/api/notifications/segments/build`,
      JSON.stringify({
        name: `Test Segment ${Date.now()}`,
        filters: {
          certificateExpiringDays: 30,
          bookingCountMin: 5,
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        tags: { name: 'BuildSegment' },
      }
    );

    check(segmentResponse, {
      'segment build status is 200': (r) => r.status === 200,
    });
  }

  // Simulate realistic user behavior
  sleep(Math.random() * 2 + 1); // 1-3 seconds between requests
}

// Test scenario: Spike test
export function spikeTest() {
  const userId = generateUserId();
  const notification = generateNotification('CERTIFICATE_EXPIRING');

  const response = http.post(
    `${BASE_URL}/api/notifications/send`,
    JSON.stringify({ userId, notification }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(response, {
    'spike test status is 200': (r) => r.status === 200,
  });
}

// Test scenario: Stress test (find breaking point)
export function stressTest() {
  const promises = [];
  
  // Send 100 concurrent notifications
  for (let i = 0; i < 100; i++) {
    const userId = generateUserId();
    const notification = generateNotification();

    promises.push(
      http.post(
        `${BASE_URL}/api/notifications/send`,
        JSON.stringify({ userId, notification }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );
  }

  // All should complete within reasonable time
  const responses = Promise.all(promises);
  
  check(responses, {
    'all stress requests completed': (r) => r.length === 100,
  });
}

// Test scenario: Endurance test (sustained load)
export function enduranceTest() {
  const userId = generateUserId();
  const notification = generateNotification();

  const response = http.post(
    `${BASE_URL}/api/notifications/send`,
    JSON.stringify({ userId, notification }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(response, {
    'endurance test status is 200': (r) => r.status === 200,
  });

  sleep(0.5); // Higher frequency
}

// Teardown function
export function teardown(data) {
  console.log('Load test completed');
  console.log(`Total notifications sent: ${data.totalNotifications}`);
  console.log(`Average delivery rate: ${data.avgDeliveryRate}%`);
  console.log(`P95 latency: ${data.p95Latency}ms`);
  console.log(`Total cost: €${data.totalCost}`);
}

// Custom scenarios for different test types
export const scenarios = {
  // Scenario 1: Normal load (baseline)
  normal_load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '5m', target: 20 },  // Ramp to 20 users
      { duration: '10m', target: 20 }, // Stay at 20 users
      { duration: '5m', target: 0 },   // Ramp down
    ],
    gracefulRampDown: '30s',
  },

  // Scenario 2: Peak load (expected maximum)
  peak_load: {
    executor: 'ramping-vus',
    startVUs: 0,
    startTime: '20m', // Start after normal load
    stages: [
      { duration: '2m', target: 100 }, // Quick ramp to 100
      { duration: '5m', target: 100 }, // Sustain
      { duration: '2m', target: 0 },   // Ramp down
    ],
    gracefulRampDown: '30s',
  },

  // Scenario 3: Spike test (sudden traffic)
  spike_test: {
    executor: 'ramping-vus',
    startVUs: 0,
    startTime: '30m',
    stages: [
      { duration: '10s', target: 200 }, // Sudden spike
      { duration: '1m', target: 200 },  // Hold
      { duration: '10s', target: 0 },   // Sudden drop
    ],
  },

  // Scenario 4: Critical notifications (high priority)
  critical_notifications: {
    executor: 'constant-vus',
    vus: 5,
    duration: '20m',
    exec: 'sendCriticalNotification',
  },
};

// Custom function for critical notifications
export function sendCriticalNotification() {
  const userId = generateUserId();
  const notification = generateNotification('CERTIFICATE_EXPIRING');
  notification.priority = 'critical';

  const response = http.post(
    `${BASE_URL}/api/notifications/send`,
    JSON.stringify({ 
      userId, 
      notification,
      options: {
        priority: 'critical',
        requiresInteraction: true,
      },
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'CriticalNotification' },
    }
  );

  check(response, {
    'critical notification delivered': (r) => r.status === 200 && r.json('success'),
    'critical notification fast': (r) => r.timings.duration < 2000, // Under 2s
  });

  sleep(1);
}

// Performance benchmarks
export function performanceBenchmarks() {
  console.log('Running performance benchmarks...');

  // Benchmark 1: Single notification latency
  console.log('\nBenchmark 1: Single notification latency');
  const singleStart = Date.now();
  http.post(`${BASE_URL}/api/notifications/send`, JSON.stringify({
    userId: 'benchmark-user',
    notification: generateNotification(),
  }));
  console.log(`Single notification: ${Date.now() - singleStart}ms`);

  // Benchmark 2: Batch notification throughput
  console.log('\nBenchmark 2: Batch notification throughput (100 notifications)');
  const batchStart = Date.now();
  const batch = [];
  for (let i = 0; i < 100; i++) {
    batch.push({
      userId: `batch-user-${i}`,
      notification: generateNotification(),
    });
  }
  http.post(`${BASE_URL}/api/notifications/send-batch`, JSON.stringify(batch));
  const batchDuration = Date.now() - batchStart;
  console.log(`Batch 100: ${batchDuration}ms (${(100000 / batchDuration).toFixed(0)} notif/s)`);

  // Benchmark 3: Analytics query performance
  console.log('\nBenchmark 3: Analytics query');
  const analyticsStart = Date.now();
  http.get(`${BASE_URL}/api/notifications/metrics?period=1440`); // 24h
  console.log(`Analytics query: ${Date.now() - analyticsStart}ms`);

  // Benchmark 4: Segment building
  console.log('\nBenchmark 4: Segment building');
  const segmentStart = Date.now();
  http.post(`${BASE_URL}/api/notifications/segments/build`, JSON.stringify({
    name: 'Benchmark Segment',
    filters: { certificateExpiringDays: 30 },
  }));
  console.log(`Segment build: ${Date.now() - segmentStart}ms`);
}
