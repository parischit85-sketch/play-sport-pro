# 📊 Sentry Monitoring Setup Guide - Push Notifications v2.0

**Obiettivo**: Configurare Sentry per error tracking, performance monitoring e alerting  
**Tempo Stimato**: 30 minuti  
**Costo**: Free tier (10,000 errors/month)

---

## 🎯 Perché Sentry?

**Monitoring Completo**:
- ✅ Error tracking in real-time
- ✅ Performance monitoring (latency, throughput)
- ✅ Session replay (vedere cosa fa l'utente quando si verifica un errore)
- ✅ Alert configurabili (email, Slack, PagerDuty)
- ✅ Release tracking (ogni deploy tracciato)
- ✅ User context (quale utente ha avuto l'errore)

**Metriche Specifiche Push Notifications**:
- Circuit breaker state
- Delivery rate
- Notification latency (P50, P95, P99)
- Channel failure rates
- Cascade attempts

---

## 🚀 Step 1: Creare Account Sentry

### A. Sign Up

1. Vai a: https://sentry.io/signup/
2. Scegli:
   - **Free Plan** (10,000 errors/month, 1 project)
   - **Team Plan** (€26/month, 50,000 errors/month, unlimited projects) - Raccomandato
3. Crea account con email/GitHub

### B. Creare Progetto

1. Click "Create Project"
2. Seleziona:
   - **Platform**: React
   - **Project Name**: `play-sport-pro` o `push-notifications-v2`
   - **Team**: Default team
3. Click "Create Project"

### C. Ottenere DSN (Data Source Name)

Dopo la creazione del progetto, ti verrà mostrato il **DSN**:

```
https://abc123def456@o123456.ingest.sentry.io/7891011
```

**IMPORTANTE**: Copia questo DSN, ti servirà dopo!

---

## 🔧 Step 2: Configurare DSN nel Progetto

### Aggiornare .env

Il file `.env` è già predisposto. Sostituisci il placeholder con il tuo DSN:

```bash
# .env
VITE_SENTRY_DSN=https://abc123def456@o123456.ingest.sentry.io/7891011
VITE_APP_VERSION=2.0.0
```

**⚠️ ATTENZIONE**: 
- Il DSN è sensibile ma non critico (può essere esposto nel frontend)
- Comunque, non committare `.env` su git pubblico

---

## ✅ Step 3: Verificare Integrazione

### A. Rebuild Frontend

```bash
npm run build
```

### B. Test Locale

```bash
npm run dev
```

### C. Trigger Test Error

Apri console browser e esegui:

```javascript
// Test error tracking
throw new Error('Sentry test error - Push Notifications v2.0');
```

### D. Verificare in Sentry

1. Vai a: https://sentry.io/organizations/your-org/issues/
2. Dovresti vedere l'errore entro 10-30 secondi
3. Click sull'errore per vedere:
   - Stack trace
   - Browser info
   - User context
   - Breadcrumbs (azioni precedenti)

✅ **Se vedi l'errore, Sentry è configurato correttamente!**

---

## 🔔 Step 4: Configurare Alert Rules

### A. Accedere alle Alerts

1. Vai a: **Settings** → **Alerts** → **Create Alert Rule**
2. Crea le seguenti 5 alert rules:

---

### Alert #1: High Error Rate

**Nome**: `Push Notifications - High Error Rate`

**Conditions**:
```
When the issue count is more than 50
in the last 5 minutes
for issues matching:
  - error.type contains "notification"
  - OR message contains "push"
  - OR message contains "Circuit Breaker"
```

**Actions**:
- Send notification via: **Email** + **Slack** (se configurato)
- Send to: Team lead, DevOps

**Frequency**: Every 5 minutes (until resolved)

---

### Alert #2: Circuit Breaker Open

**Nome**: `Push Notifications - Circuit Breaker OPEN`

**Conditions**:
```
When an event is seen
matching:
  - message contains "Circuit Breaker OPEN"
```

**Actions**:
- Send notification via: **Email** + **Slack** + **PagerDuty** (P1)
- Send to: On-call engineer

**Frequency**: Immediately (critical)

---

### Alert #3: All Channels Failed

**Nome**: `Push Notifications - Cascade Failure`

**Conditions**:
```
When an event is seen
matching:
  - message contains "All notification channels failed"
```

**Actions**:
- Send notification via: **Email** + **Slack**
- Send to: DevOps team

**Frequency**: Every 10 minutes

---

### Alert #4: Slow Notifications

**Nome**: `Push Notifications - Performance Degradation`

**Conditions**:
```
When the p95 of notification.send
is more than 5000ms
in the last 10 minutes
```

**Actions**:
- Send notification via: **Slack**
- Send to: Performance channel

**Frequency**: Every 30 minutes

---

### Alert #5: High Delivery Failure Count

**Nome**: `Push Notifications - High Failure Count`

**Conditions**:
```
When the issue count is more than 50
in the last 5 minutes
for issues matching:
  - message contains "Delivery failure"
  - OR message contains "trackDeliveryFailure"
```

**Actions**:
- Send notification via: **Email**
- Send to: Product team

**Frequency**: Every 15 minutes

---

## 📈 Step 5: Configurare Performance Monitoring

### A. Verificare Transaction Tracking

In Sentry dashboard:
1. Vai a: **Performance** → **Transactions**
2. Dovresti vedere:
   - `notification.send` transactions
   - `cascade` operations
   - Latency metrics (P50, P95, P99)

### B. Settare Performance Thresholds

1. Click su transaction `notification.send`
2. Click "Set Threshold"
3. Configura:
   - **Good**: < 1000ms
   - **Meh**: 1000-3000ms
   - **Poor**: > 3000ms

---

## 🎬 Step 6: Configurare Session Replay

### A. Abilitare Replay

Session Replay è già configurato nel codice:

```javascript
// src/monitoring/sentry.js
new Sentry.Replay({
  maskAllText: false,       // Mostra testo (disabilita se privacy concern)
  blockAllMedia: false,     // Mostra immagini/video
}),

replaysSessionSampleRate: 0.1,  // 10% di tutte le sessioni
replaysOnErrorSampleRate: 1.0,  // 100% delle sessioni con errori
```

### B. Viewing Replays

1. Vai a: **Replays** in Sentry dashboard
2. Click su una sessione per vedere:
   - Video replay dell'utente
   - Console logs
   - Network requests
   - DOM mutations
   - Errors triggered

**Privacy Note**: Se hai concern sulla privacy, imposta `maskAllText: true`

---

## 🧪 Step 7: Test Complete Monitoring

### Test Script

Esegui questo script in browser console (su https://m-padelweb.web.app):

```javascript
// 1. Test error tracking
import { trackNotificationError } from '/src/monitoring/sentry.js';

trackNotificationError(new Error('Test notification error'), {
  userId: 'test-user-123',
  notificationId: 'test-notif-456',
  channel: 'push',
  critical: false
});

// 2. Test circuit breaker alert
import { trackCircuitBreakerOpen } from '/src/monitoring/sentry.js';

trackCircuitBreakerOpen({
  errorRate: 0.65,
  failureCount: 15,
  lastFailure: new Date().toISOString()
});

// 3. Test cascade failure
import { trackCascadeFailure } from '/src/monitoring/sentry.js';

trackCascadeFailure('user-789', 'notif-101', [
  { channel: 'push', error: 'Failed to send' },
  { channel: 'email', error: 'SMTP error' },
  { channel: 'sms', error: 'Rate limited' }
]);

// 4. Test performance issue
import { trackPerformanceIssue } from '/src/monitoring/sentry.js';

trackPerformanceIssue('notification_latency', 5500, 3000);

console.log('✅ All Sentry tests triggered!');
console.log('Check Sentry dashboard in 30 seconds');
```

### Expected Results in Sentry

Dovresti vedere entro 1 minuto:
1. ✅ 1 error: "Test notification error"
2. ✅ 1 message: "Circuit Breaker OPEN" (dovrebbe triggerare alert)
3. ✅ 1 message: "All notification channels failed"
4. ✅ 1 warning: "Performance threshold exceeded: notification_latency"

---

## 📊 Step 8: Dashboard Setup

### A. Creare Custom Dashboard

1. Vai a: **Dashboards** → **Create Dashboard**
2. Nome: `Push Notifications v2.0 - Health`
3. Aggiungi widgets:

#### Widget 1: Error Rate
```
Type: Time Series
Metric: count(errors)
Filter: message contains "notification"
Time Range: Last 24 hours
```

#### Widget 2: Circuit Breaker State
```
Type: Big Number
Metric: count()
Filter: message = "Circuit Breaker OPEN"
Time Range: Last 1 hour
```

#### Widget 3: Notification Latency (P95)
```
Type: Line Chart
Metric: p95(transaction.duration)
Filter: transaction = "notification.send"
Time Range: Last 24 hours
```

#### Widget 4: Delivery Failures
```
Type: Bar Chart
Metric: count(errors)
Group By: error.type
Filter: message contains "Delivery failure"
Time Range: Last 24 hours
```

#### Widget 5: Channel Performance
```
Type: Table
Metrics: 
  - count()
  - p95(duration)
  - error_rate
Group By: channel
Filter: transaction starts with "notification"
```

### B. Condividere Dashboard

1. Click "Share Dashboard"
2. Copia link pubblico (se vuoi condividere con stakeholders)
3. Oppure invita team members a Sentry organization

---

## 🔗 Step 9: Integrations (Opzionale)

### Slack Integration

1. Vai a: **Settings** → **Integrations** → **Slack**
2. Click "Add Workspace"
3. Autorizza Sentry su Slack
4. Configura channel per alerts: `#push-notifications-alerts`

**Configurazione Alert**:
- High errors → `#push-notifications-alerts`
- Performance issues → `#performance-alerts`
- Circuit breaker → `#critical-alerts`

### PagerDuty Integration (Per On-Call)

1. Vai a: **Settings** → **Integrations** → **PagerDuty**
2. Click "Add Integration"
3. Inserisci PagerDuty Integration Key
4. Configura:
   - Circuit Breaker OPEN → P1 (Page immediately)
   - High error rate → P2 (Page if not ack in 15min)

### GitHub Integration (Release Tracking)

1. Vai a: **Settings** → **Integrations** → **GitHub**
2. Click "Install GitHub"
3. Autorizza repository: `play-sport-pro`
4. Configura:
   - ✅ Link commits to errors
   - ✅ Auto-resolve on deploy
   - ✅ Suggest assignees based on commits

---

## 📝 Step 10: Source Maps (Per Stack Traces Leggibili)

### A. Configurare Vite Plugin

Il plugin è già installato. Aggiungi configurazione a `vite.config.js`:

```javascript
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default {
  plugins: [
    // ... altri plugin
    
    sentryVitePlugin({
      org: "your-sentry-org",
      project: "play-sport-pro",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      
      // Source maps upload
      sourcemaps: {
        assets: './dist/**',
        ignore: ['node_modules'],
      },
      
      // Release tracking
      release: {
        name: `push-notifications@${process.env.VITE_APP_VERSION}`,
        deploy: {
          env: process.env.NODE_ENV,
        },
      },
    }),
  ],
};
```

### B. Creare Sentry Auth Token

1. Vai a: **Settings** → **Auth Tokens**
2. Click "Create New Token"
3. Nome: `vite-source-maps`
4. Scopes: `project:releases`, `org:read`
5. Click "Create Token"
6. Copia il token

### C. Aggiungere Token a .env

```bash
# .env.local (NON committare!)
SENTRY_AUTH_TOKEN=sntrys_your_auth_token_here
```

### D. Build con Source Maps

```bash
npm run build
# Source maps verranno uploadati automaticamente a Sentry
```

---

## ✅ Checklist Finale

### Setup Completo
- [ ] ✅ Account Sentry creato
- [ ] ✅ Progetto creato
- [ ] ✅ DSN configurato in `.env`
- [ ] ✅ SDK installato (`@sentry/react`)
- [ ] ✅ Sentry importato in `main.jsx`
- [ ] ✅ Test error inviato e visibile in dashboard

### Alert Rules Configurate
- [ ] ✅ Alert #1: High Error Rate
- [ ] ✅ Alert #2: Circuit Breaker Open
- [ ] ✅ Alert #3: All Channels Failed
- [ ] ✅ Alert #4: Slow Notifications
- [ ] ✅ Alert #5: High Failure Count

### Performance Monitoring
- [ ] ✅ Transaction tracking verificato
- [ ] ✅ Performance thresholds configurati
- [ ] ✅ P95 latency < 3000ms target set

### Dashboard & Integrations
- [ ] ✅ Custom dashboard creato
- [ ] ⏳ Slack integration (opzionale)
- [ ] ⏳ PagerDuty integration (opzionale)
- [ ] ⏳ GitHub integration (opzionale)

### Source Maps
- [ ] ⏳ Vite plugin configurato
- [ ] ⏳ Auth token created
- [ ] ⏳ Build with source maps upload

---

## 📊 Expected Monitoring Metrics

### After 24h of Monitoring

**Error Tracking**:
- Total errors: <100/day (target)
- Error rate: <1% (excellent), <5% (good), >10% (poor)
- Circuit breaker opens: 0 (ideal), <5/day (acceptable)

**Performance**:
- P50 latency: <1000ms
- P95 latency: <3000ms
- P99 latency: <5000ms
- Throughput: 100-1000 notifications/hour

**Reliability**:
- Delivery success rate: >95%
- Cascade to email: <10% (push works most of the time)
- Complete cascade failure: <1%

---

## 🐛 Troubleshooting

### Problema: "DSN not configured"

**Causa**: `.env` non caricato o DSN mancante

**Soluzione**:
```bash
# Verifica .env
cat .env | grep SENTRY

# Se vuoto, aggiungi:
echo "VITE_SENTRY_DSN=your-dsn-here" >> .env

# Rebuild
npm run build
```

### Problema: "Errors not appearing in Sentry"

**Causa**: Network blocked, DSN invalido, o Sentry non inizializzato

**Soluzione**:
```javascript
// In console browser
console.log('Sentry DSN:', import.meta.env.VITE_SENTRY_DSN);

// Se undefined, .env non è caricato
// Se presente, verifica che Sentry sia inizializzato:
import * as Sentry from '@sentry/react';
console.log('Sentry client:', Sentry.getCurrentHub().getClient());
```

### Problema: "Performance data missing"

**Causa**: `tracesSampleRate` troppo basso o transactions non create

**Soluzione**:
```javascript
// Aumenta sample rate per testing (in sentry.js)
tracesSampleRate: 1.0, // 100% durante test, poi riporta a 0.1
```

---

## 💰 Costi Sentry

### Free Plan
- **Errors**: 10,000/month
- **Performance**: 10,000 transactions/month
- **Replays**: 50 replays/month
- **Projects**: 1
- **Team Members**: Unlimited
- **Cost**: **€0/month**

**Adatto per**: Testing, piccoli progetti, MVP

### Team Plan (Raccomandato per Production)
- **Errors**: 50,000/month
- **Performance**: 100,000 transactions/month
- **Replays**: 500 replays/month
- **Projects**: Unlimited
- **Team Members**: Unlimited
- **Cost**: **€26/month**

**Overage**: €0.00045 per extra error

### Business Plan
- **Errors**: 500,000/month
- **Performance**: 1,000,000 transactions/month
- **Replays**: 5,000 replays/month
- **SLA**: 99.9% uptime
- **Support**: Priority
- **Cost**: **€80/month**

**Raccomandazione**: 
- Start con **Free Plan** per testing
- Upgrade a **Team Plan** prima del go-live production
- Monitor usage nel primo mese, adjust se necessario

---

## 🎯 Success Metrics

**Sentry Setup is COMPLETE when**:
- [x] ✅ DSN configured and verified
- [x] ✅ Test error appears in dashboard
- [ ] ⏳ 5 alert rules configured
- [ ] ⏳ Custom dashboard created
- [ ] ⏳ Performance thresholds set
- [ ] ⏳ Team members invited
- [ ] ⏳ Integration with Slack/PagerDuty (optional)

**Current Status**: 2/7 complete (29%) - **READY FOR TESTING**

---

**Setup Time**: ~30 minuti  
**Cost**: €0 (Free tier) o €26/month (Team plan - raccomandato)  
**Priority**: 🟡 **HIGH** (Monitoring essenziale per production)

---

*Last Updated: 16 Ottobre 2025*  
*Project: Play Sport Pro - Push Notifications v2.0*
