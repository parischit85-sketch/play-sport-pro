# 📖 Push Notifications System v2.0 - API Reference

**Version**: 2.0.0  
**Last Updated**: 16 Ottobre 2025  
**Status**: Production Ready

---

## Table of Contents

1. [PushService API](#pushservice-api)
2. [NotificationCascade API](#notificationcascade-api)
3. [NotificationAnalytics API](#notificationanalytics-api)
4. [SegmentBuilder API](#segmentbuilder-api)
5. [SmartScheduler API](#smartscheduler-api)
6. [NotificationTemplateSystem API](#notificationtemplatesystem-api)
7. [CleanupService API](#cleanupservice-api)

---

## PushService API

**File**: `src/services/pushService.js`

### Methods

#### `send(userId, notification, options)`

Send push notification con retry automatico e circuit breaker.

**Parameters**:
- `userId` (string): ID utente destinatario
- `notification` (Object): Notifica da inviare
  - `title` (string): Titolo notifica
  - `body` (string): Corpo messaggio
  - `icon` (string, optional): URL icon
  - `image` (string, optional): URL image
  - `data` (Object, optional): Custom data
- `options` (Object, optional): Opzioni aggiuntive
  - `priority` (string): 'low' | 'normal' | 'high' | 'critical'
  - `requiresInteraction` (boolean): Require user action
  - `silent` (boolean): Silent notification

**Returns**: `Promise<Object>`
```javascript
{
  success: true,
  notificationId: 'notif-123',
  latency: 1847, // milliseconds
  attempts: 1,
  channel: 'push'
}
```

**Example**:
```javascript
import { pushService } from '@/services/pushService';

const result = await pushService.send('user-123', {
  title: '⚠️ Certificato in scadenza',
  body: 'Il tuo certificato scade tra 7 giorni',
  icon: '/icons/certificate-warning.png',
  data: {
    url: '/certificates/renew?id=cert-456',
    certificateId: 'cert-456'
  }
}, {
  priority: 'high',
  requiresInteraction: true
});

console.log(`Delivered in ${result.latency}ms`);
```

#### `getMetrics()`

Ottieni performance metrics del servizio.

**Returns**: `Object`
```javascript
{
  sent: 1250,
  delivered: 1189,
  failed: 61,
  retried: 23,
  expired: 12,
  deliveryRate: '95.12%',
  errorRate: '4.88%',
  latency: {
    min: 245,
    avg: 1847,
    p50: 1520,
    p95: 2980,
    p99: 3240
  },
  circuitBreaker: {
    state: 'CLOSED', // CLOSED | OPEN | HALF_OPEN
    errorRate: 4.2,
    failures: 61,
    successes: 1189
  }
}
```

**Example**:
```javascript
const metrics = pushService.getMetrics();

if (metrics.deliveryRate < 95) {
  console.warn('⚠️ Delivery rate below threshold!');
  // Trigger alert
}
```

---

## NotificationCascade API

**File**: `src/services/notificationCascade.js`

### Methods

#### `send(userId, notification, options)`

Invia notifica con fallback automatico multi-canale.

**Parameters**:
- `userId` (string): ID utente
- `notification` (Object): Notifica (stesso formato di PushService)
- `options` (Object): Opzioni cascade
  - `channels` (Array<string>): Priority order ['push', 'email', 'sms', 'in-app']
  - `type` (string): Notification type (per type-specific routing)
  - `respectUserPreferences` (boolean, default: true)
  - `maxCost` (number): Max cost threshold in EUR

**Returns**: `Promise<Object>`
```javascript
{
  success: true,
  channel: 'email',  // Channel che ha avuto successo
  attempts: [
    { channel: 'push', success: false, error: '410 Gone' },
    { channel: 'email', success: true, latency: 2340 }
  ],
  cost: 0.0001,  // EUR
  latency: 2340,
  totalAttempts: 2
}
```

**Example**:
```javascript
import { notificationCascade, NOTIFICATION_TYPES } from '@/services/notificationCascade';

const result = await notificationCascade.send('user-123', {
  title: '💳 Pagamento in scadenza',
  body: 'Quota associativa: €50. Scadenza: 20 Ottobre',
  data: {
    url: '/payments/pay?id=pay-789',
    paymentId: 'pay-789'
  }
}, {
  channels: ['push', 'email', 'sms'],
  type: NOTIFICATION_TYPES.PAYMENT_DUE,
  maxCost: 0.10  // Max €0.10 per notification
});

console.log(`Delivered via ${result.channel} for €${result.cost}`);
```

#### `getStats()`

Ottieni statistiche cascade.

**Returns**: `Object`
```javascript
{
  total: 1250,
  succeeded: 1227,
  failed: 23,
  successRate: '98.16%',
  totalCost: 15.67,  // EUR
  averageCost: 0.0128,
  channelEfficiency: [
    {
      channel: 'push',
      successRate: '92.3%',
      cost: 0,
      attempts: 1250
    },
    {
      channel: 'email',
      successRate: '87.1%',
      cost: 0.24,
      attempts: 97
    },
    // ...
  ]
}
```

---

## NotificationAnalytics API

**File**: `src/services/notificationAnalytics.js`

### Methods

#### `trackSent(params)`

Track notifica inviata.

**Parameters**:
```javascript
{
  notificationId: 'notif-123',
  userId: 'user-123',
  type: 'CERTIFICATE_EXPIRING',
  category: 'critical',  // NOTIFICATION_CATEGORIES
  channel: 'push',
  segmentId: 'segment-456',  // optional
  campaignId: 'campaign-789',  // optional
  abTestId: 'test-001',  // optional
  abVariant: 'VARIANT_A'  // optional
}
```

**Example**:
```javascript
import { notificationAnalytics, NOTIFICATION_CATEGORIES } from '@/services/notificationAnalytics';

await notificationAnalytics.trackSent({
  notificationId: result.notificationId,
  userId: 'user-123',
  type: 'CERTIFICATE_EXPIRING',
  category: NOTIFICATION_CATEGORIES.CRITICAL,
  channel: 'push'
});
```

#### `trackClicked(params)`

Track notifica cliccata.

**Parameters**:
```javascript
{
  notificationId: 'notif-123',
  userId: 'user-123',
  actionId: 'renew_now',  // optional
  deepLink: '/certificates/renew',  // optional
  timeToClick: 45000  // milliseconds, optional
}
```

#### `trackConversion(params)`

Track conversione.

**Parameters**:
```javascript
{
  notificationId: 'notif-123',
  userId: 'user-123',
  conversionType: 'CONVERSION_BOOKING_CREATED',
  conversionValue: 50.00,  // EUR
  conversionData: { bookingId: 'booking-456' },
  timeToConversion: 120000  // milliseconds
}
```

#### `getFunnelAnalytics(type, startDate, endDate)`

Ottieni funnel analytics per tipo notifica.

**Returns**: `Promise<Object>`
```javascript
{
  type: 'CERTIFICATE_EXPIRING',
  period: { start: Date, end: Date },
  funnel: {
    sent: 1000,
    delivered: 950,
    clicked: 475,
    converted: 143
  },
  rates: {
    deliveryRate: '95.00%',
    ctr: '50.00%',
    conversionRate: '30.11%'
  },
  uniqueNotifications: 1000
}
```

#### `getChannelPerformance(startDate, endDate)`

Comparazione performance canali.

**Returns**: `Promise<Array>`
```javascript
[
  {
    channel: 'push',
    sent: 950,
    delivered: 877,
    clicked: 438,
    deliveryRate: '92.32%',
    ctr: '49.94%',
    avgLatency: '1847ms',
    p95Latency: '2980ms',
    totalCost: '€0.0000',
    avgCost: '€0.000000'
  },
  // ... altri canali
]
```

#### `getDashboardMetrics(lastMinutes)`

Real-time dashboard metrics.

**Parameters**:
- `lastMinutes` (number): Ultimi N minuti (default: 60)

**Returns**: `Promise<Object>`
```javascript
{
  period: 'Last 60 minutes',
  summary: {
    sent: 125,
    delivered: 119,
    clicked: 60,
    converted: 18,
    deliveryRate: '95.20%',
    ctr: '50.42%',
    conversionRate: '30.00%'
  },
  byChannel: {
    push: { sent: 100, delivered: 92, failed: 8 },
    email: { sent: 25, delivered: 22, failed: 3 }
  },
  byCategory: {
    critical: 45,
    transactional: 30,
    promotional: 50
  },
  recentEvents: [
    { event: 'notification_sent', userId: 'user-123', timestamp: Date },
    // ... ultimi 10 eventi
  ]
}
```

---

## SegmentBuilder API

**File**: `src/services/segmentBuilder.js`

### Fluent API Methods

#### `name(name)` / `description(desc)`

Set segment metadata.

#### `whereLastBookingWithin(days)`

Filter users con booking recente.

#### `whereBookingCount(operator, count)`

Filter per numero bookings.

**Example**:
```javascript
import SegmentBuilder from '@/services/segmentBuilder';

const vipUsers = await new SegmentBuilder()
  .name('VIP Users')
  .description('High-value users with 10+ bookings')
  .whereLastBookingWithin(30)
  .whereBookingCount('>=', 10)
  .whereCertificateStatus('active')
  .whereOptedIn('promotions')
  .execute();

console.log(`Segment size: ${vipUsers.length} users`);
// Returns: [{ userId: 'user-123', bookingCount: 15, ... }, ...]
```

#### `whereCertificateExpiring(days)`

Filter certificati in scadenza.

#### `whereLastActivityWithin(days)` / `whereInactiveFor(days)`

Filter per attività recente o inattività.

#### `whereAge(minAge, maxAge)` / `whereGender(gender)` / `whereCity(city)`

Demographic filters.

#### `whereOptedIn(notificationType)`

Filter per user preferences.

#### `save(segmentId)` / `load(segmentId)`

Persist/load segment da Firestore.

**Example**:
```javascript
// Save segment
const segment = await new SegmentBuilder()
  .name('Certificate Expiring Soon')
  .whereCertificateExpiring(7)
  .save('cert-expiring-7d');

// Load segment later
const loadedSegment = await SegmentBuilder.load('cert-expiring-7d');
const users = await loadedSegment.execute();
```

---

## SmartScheduler API

**File**: `src/services/smartScheduler.js`

### Methods

#### `schedule(params)`

Schedule notifica con ottimizzazione intelligente.

**Parameters**:
```javascript
{
  userId: 'user-123',
  notification: { title: '...', body: '...' },
  notificationType: 'PROMOTIONAL',  // Default: 'INFORMATIONAL'
  priority: 'normal',  // low | normal | high | critical
  respectQuietHours: true,
  optimizeForEngagement: true
}
```

**Returns**: `Promise<Object>`
```javascript
{
  scheduled: true,
  scheduleId: 'schedule-456',
  sendAt: Date,  // Optimal send time
  timezone: 'Europe/Rome',
  delayMinutes: 120  // Minutes until send
}
```

**Example**:
```javascript
import { smartScheduler } from '@/services/smartScheduler';

const schedule = await smartScheduler.schedule({
  userId: 'user-123',
  notification: {
    title: '🔥 Flash Sale: 20% sconto!',
    body: 'Solo oggi - non perdere!',
    data: { url: '/promos/flash-sale' }
  },
  notificationType: 'PROMOTIONAL',
  optimizeForEngagement: true
});

console.log(`Scheduled for ${schedule.sendAt.toLocaleString()}`);
// Scheduled for: 20/10/2025, 12:00:00 (lunch time optimal)
```

#### `batchScheduleByTimezone(userIds, notification, options)`

Batch scheduling per timezone groups.

**Example**:
```javascript
const userIds = ['user-1', 'user-2', 'user-3', ...];

const result = await smartScheduler.batchScheduleByTimezone(
  userIds,
  notification,
  {
    notificationType: 'PROMOTIONAL',
    respectQuietHours: true
  }
);

console.log(`Scheduled ${result.totalUsers} users across ${result.timezoneGroups.length} timezones`);
// Output: Scheduled 500 users across 3 timezones
```

#### `setFrequencyCap(config)`

Set custom frequency limits.

**Example**:
```javascript
smartScheduler.setFrequencyCap({
  maxPerDay: 5,
  maxPerHour: 2
});
```

---

## NotificationTemplateSystem API

**File**: `src/services/notificationTemplateSystem.js`

### Methods

#### `render(templateId, variables, language)`

Render template con variabili.

**Parameters**:
- `templateId` (string): ID template (e.g., 'CERTIFICATE_EXPIRING')
- `variables` (Object): Variabili da sostituire
- `language` (string, optional): Lingua (default: 'it')

**Returns**: `Object` - Notifica renderizzata

**Example**:
```javascript
import { templateRenderer } from '@/services/notificationTemplateSystem';

const notification = templateRenderer.render('CERTIFICATE_EXPIRING', {
  daysLeft: 7,
  expiryDate: '2025-10-25',
  certificateId: 'cert-123'
});

// Returns:
{
  templateId: 'CERTIFICATE_EXPIRING',
  title: '⚠️ Certificato in scadenza',
  body: 'Il tuo certificato medico scade tra 7 giorni. Rinnovalo ora!',
  icon: '/icons/certificate-warning.png',
  image: '/images/notifications/certificate-expiring.jpg',
  actions: [
    { action: 'renew', title: 'Rinnova Ora', icon: '/icons/renew.png' },
    { action: 'remind_later', title: 'Ricordamelo', icon: '/icons/reminder.png' }
  ],
  data: {
    deepLink: '/certificates/renew?id=cert-123',
    templateId: 'CERTIFICATE_EXPIRING',
    daysLeft: 7,
    expiryDate: '2025-10-25',
    certificateId: 'cert-123'
  },
  priority: 'high',
  requiresInteraction: true,
  vibrate: [200, 100, 200],
  sound: 'notification-important.mp3'
}
```

#### `getAllTemplates()` / `getTemplatesByCategory(category)`

Get available templates.

**Example**:
```javascript
const allTemplates = templateRenderer.getAllTemplates();
console.log(`Available templates: ${allTemplates.length}`);

const criticalTemplates = templateRenderer.getTemplatesByCategory('critical');
// Returns: [CERTIFICATE_EXPIRING, PAYMENT_DUE]
```

#### `createCustomTemplate(templateId, config)`

Create custom template.

**Example**:
```javascript
templateRenderer.createCustomTemplate('CUSTOM_PROMO', {
  name: 'Custom Promo',
  category: 'promotional',
  title: '🎉 {{promoTitle}}',
  body: '{{promoDescription}}',
  icon: '/icons/promo.png',
  actions: [
    { action: 'claim', title: 'Richiedi Ora' }
  ],
  variables: ['promoTitle', 'promoDescription'],
  metadata: {
    priority: 'normal'
  }
});
```

#### `createABVariants(baseTemplateId, variants)`

Create A/B test variants.

**Example**:
```javascript
const variants = templateRenderer.createABVariants('PROMO_FLASH', [
  {
    title: '🔥 Flash Sale: 20% sconto!',
    body: 'Solo oggi - non perdere!'
  },
  {
    title: '💥 Offerta Lampo: -20%',
    body: 'Affrettati! Scade a mezzanotte.'
  }
]);

// Creates:
// - PROMO_FLASH_VARIANT_1
// - PROMO_FLASH_VARIANT_2
```

---

## CleanupService API

**File**: `src/services/notificationCleanupService.js`

### Methods

#### `runFullCleanup()`

Esegue cleanup completo di tutti i dati obsoleti.

**Returns**: `Promise<Object>`
```javascript
{
  success: true,
  duration: 45000,  // milliseconds
  stats: {
    subscriptionsDeleted: 127,
    eventsDeleted: 3456,
    scheduledDeleted: 89,
    deliveriesDeleted: 2341,
    totalCleaned: 6013
  }
}
```

**Example**:
```javascript
import { cleanupService } from '@/services/notificationCleanupService';

const result = await cleanupService.runFullCleanup();
console.log(`Cleaned ${result.stats.totalCleaned} records in ${result.duration}ms`);
```

#### `setRetentionDays(config)`

Set custom retention periods.

**Example**:
```javascript
cleanupService.setRetentionDays({
  events: 60,        // Keep events for 60 days (default: 90)
  scheduled: 15,     // Keep scheduled for 15 days (default: 30)
  deliveries: 45     // Keep deliveries for 45 days (default: 60)
});
```

#### `getStats()`

Get cleanup statistics.

**Returns**: `Object`
```javascript
{
  subscriptionsDeleted: 127,
  eventsDeleted: 3456,
  scheduledDeleted: 89,
  deliveriesDeleted: 2341,
  totalCleaned: 6013,
  retentionPolicies: {
    events: 90,
    scheduled: 30,
    deliveries: 60,
    expiredSubscriptions: 7
  }
}
```

---

## Complete Usage Example

Combinazione di tutti i servizi:

```javascript
import SegmentBuilder from '@/services/segmentBuilder';
import { smartScheduler } from '@/services/smartScheduler';
import { templateRenderer } from '@/services/notificationTemplateSystem';
import { notificationCascade } from '@/services/notificationCascade';
import { notificationAnalytics } from '@/services/notificationAnalytics';

// 1. Build segment
const expiringSoon = await new SegmentBuilder()
  .name('Certificate Expiring in 7 Days')
  .whereCertificateExpiring(7)
  .whereOptedIn('certificates')
  .execute();

console.log(`Target audience: ${expiringSoon.length} users`);

// 2. Create notification from template
const notification = templateRenderer.render('CERTIFICATE_EXPIRING', {
  daysLeft: 7,
  expiryDate: '2025-10-25'
});

// 3. Schedule notifications per timezone
for (const user of expiringSoon) {
  // Schedule optimal time per user
  const schedule = await smartScheduler.schedule({
    userId: user.userId,
    notification,
    notificationType: 'CRITICAL',
    priority: 'high',
    optimizeForEngagement: true
  });

  // Track scheduled event
  await notificationAnalytics.trackSent({
    notificationId: schedule.scheduleId,
    userId: user.userId,
    type: 'CERTIFICATE_EXPIRING',
    category: 'critical',
    channel: 'scheduled'
  });

  console.log(`Scheduled for ${user.userId} at ${schedule.sendAt}`);
}

// 4. Later: When scheduled time arrives, send via cascade
const result = await notificationCascade.send(userId, notification, {
  channels: ['push', 'email'],
  type: 'CERTIFICATE_EXPIRING'
});

// 5. Track delivery
await notificationAnalytics.trackDelivered({
  notificationId: result.notificationId,
  userId,
  channel: result.channel,
  latency: result.latency,
  cost: result.cost
});

console.log(`Campaign complete: ${expiringSoon.length} notifications sent`);
```

---

**Version**: 2.0.0  
**Last Updated**: 16 Ottobre 2025  
**Maintained by**: Play Sport Pro Team
