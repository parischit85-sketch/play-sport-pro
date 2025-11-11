# ✅ CHECKLIST IMPLEMENTAZIONE - PUSH NOTIFICATIONS
**Data Creazione**: 11 Novembre 2025  
**Status**: 🔴 DA IMPLEMENTARE  
**Tempo Stimato**: 3-4 settimane  
**Priorità**: CRITICA  

---

## 🔴 PRIORITÀ 1: FIX BLOCCA TUTTO (2-3 giorni)

### Giorno 1: Subscription Saving

**Task 1.1: Implementare `sendSubscriptionToServer()` in hook**
- [ ] File: `src/hooks/usePushNotifications.js`
- [ ] Riga: ~170-210
- [ ] ✅ Test: Subscription deve essere salvata su Firestore dopo accept
- [ ] ✅ Test: localStorage deve avere `push-sub-{userId}`
- [ ] ✅ Test: Errore di rete → retry automatico
- **Tempo**: 2-3 ore
- **Verificare**: Console → Network tab → Richiesta a `save-push-subscription`

**Task 1.2: Aggiungere retry logic esponenziale**
- [ ] File: `src/components/AutoPushSubscription.jsx`
- [ ] Riga: ~55-75
- [ ] ✅ Test: Se network fallisce → riprova dopo 2s, 5s, 10s
- [ ] ✅ Test: Dopo 3 fallimenti → salva in localStorage con timestamp
- [ ] ✅ Test: Toast notification quando fallisce
- **Tempo**: 1 ora
- **Verificare**: DevTools → Network → Throttle to Offline → Vedi retry

**Task 1.3: Ridurre query duplicate in Netlify Function**
- [ ] File: `netlify/functions/save-push-subscription.js`
- [ ] Riga: ~45-75
- [ ] ✅ Elimina secondo check su endpoint
- [ ] ✅ Usa `userId_deviceId` come DOC ID
- [ ] ✅ Test: Una sola query per salvataggio
- **Tempo**: 1 ora
- **Verificare**: Firebase Console → Firestore → pushSubscriptions → check documento ID format

---

**MILESTONE 1: Fine Giorno 1**
```
✅ Subscriptions vengono salvate in Firestore
✅ almeno 1 documento in pushSubscriptions dopo test
✅ Query ridotte da 2 a 1
```

---

### Giorno 2: Database & Infrastructure

**Task 2.1: Creare composite index per pushSubscriptions**
- [ ] File: `firestore.indexes.json` (verificare se già presente)
- [ ] Collection: `pushSubscriptions`
- [ ] Campi: (userId Ascending), (createdAt Descending)
- [ ] ✅ Deploy: `firebase deploy --only firestore:indexes`
- [ ] ✅ Verificare: Firebase Console → Firestore → Indexes → Status deve essere ✅ Enabled
- [ ] ✅ Test: Query in sendBulkNotifications deve funzionare senza errore
- **Tempo**: 30-45 min (incluso attesa deployment)
- **Blockers**: Attesa di ~5 min per deployment

**Task 2.2: Implementare Firestore Security Rules per pushSubscriptions**
- [ ] File: `firestore.rules`
- [ ] ✅ Rule: User può leggere solo le proprie subscriptions
- [ ] ✅ Rule: Cloud Functions può leggere tutte
- [ ] ✅ Test: Try security rules simulator
- **Tempo**: 1 ora
- **Verificare**: 
```javascript
match /pushSubscriptions/{document=**} {
  allow read: if request.auth.uid == resource.data.userId || 
               isAdmin();
  allow write: if false; // Only via Netlify Functions
}
```

**Task 2.3: Verificare che collection riceva dati**
- [ ] Endpoint: Firestore Console
- [ ] ✅ Login all'app
- [ ] ✅ Accept notification permission
- [ ] ✅ Vai a Firestore → pushSubscriptions
- [ ] ✅ Dovrebbe avere >=1 documento
- [ ] ✅ Campo userId deve matchare tuo uid Firebase
- [ ] ✅ Campo endpoint deve iniziare con `https://`
- [ ] ✅ Campo expiresAt deve essere futuro
- **Tempo**: 15 min
- **Verificare**:
  - [ ] Document ID: `{userId}_{deviceId}`
  - [ ] Tutti i campi presenti: userId, endpoint, subscription, createdAt, expiresAt, isActive
  - [ ] subscription.keys: p256dh, auth
  - [ ] isActive: true

---

**MILESTONE 2: Fine Giorno 2**
```
✅ Database schema completo e funzionante
✅ Almeno 2-3 documenti in pushSubscriptions
✅ Queries eseguite senza errore "requires composite index"
```

---

### Giorno 3: Testing & Validation

**Task 3.1: Testare invio notifiche**
- [ ] Endpoint: Firebase Console
- [ ] ✅ Vai a `sendBulkCertificateNotifications`
- [ ] ✅ Call function con tuo userId
- [ ] ✅ Dovresti ricevere notifica push sul browser
- [ ] ✅ Se fallisce: check logs nella Firebase Console
- **Tempo**: 1 ora (incluso troubleshooting)
- **Verificare**: 
  - [ ] Notifica appare nel browser
  - [ ] Title e body sono corretti
  - [ ] Click su notifica naviga a URL corretto

**Task 3.2: Testare retry e error handling**
- [ ] Simula network offline: DevTools → Network → Throttle
- [ ] ✅ Click "Enable Notifications"
- [ ] ✅ Dovrebbe tentare 3 volte con delay crescente
- [ ] ✅ Toast "Impossibile attivare notifiche" dopo 3 fallimenti
- [ ] ✅ Riabilita network
- [ ] ✅ Subscription dovrebbe completarsi al prossimo tentativo
- **Tempo**: 30 min

**Task 3.3: Creare test suite unitario**
- [ ] File: `src/__tests__/push-notifications.test.js`
- [ ] ✅ Test: arrayBufferToBase64 conversion
- [ ] ✅ Test: generateDeviceId consistency
- [ ] ✅ Test: sendSubscriptionToServer with mock fetch
- [ ] ✅ Test: Retry logic with exponential backoff
- [ ] ✅ Test: Validation input
- **Tempo**: 2 ore
- **Verificare**: `npm run test -- push-notifications`

---

**MILESTONE 3: Fine Giorno 3**
```
✅ Sistema base funzionante end-to-end
✅ Test suite presente e passante
✅ Pronto per test manuale QA
```

---

## 🟠 PRIORITÀ 2: AFFIDABILITÀ (3-5 giorni)

### Giorno 4: Validation & Error Handling

**Task 4.1: Validazione input in Netlify Function**
- [ ] File: `netlify/functions/save-push-subscription.js`
- [ ] ✅ Aggiungi `validateSubscriptionInput()` function
- [ ] ✅ Valida userId (10+ chars, alphanumeric)
- [ ] ✅ Valida endpoint (HTTPS URL, valida)
- [ ] ✅ Valida subscription.keys (p256dh, auth presence)
- [ ] ✅ Valida size payload (<10KB)
- [ ] ✅ Test: Invalid input deve ritornare 400 con error details
- **Tempo**: 1.5 ore

**Task 4.2: Error catalog strutturato**
- [ ] File: `netlify/functions/save-push-subscription.js`
- [ ] ✅ Crea `ERROR_CATALOG` object
- [ ] ✅ Ogni errore ha: message, code, resolution, docsLink
- [ ] ✅ Client riceve struttura coerente
- **Tempo**: 1 ora

**Task 4.3: Validazione notifiche in send-push.js**
- [ ] File: `netlify/functions/send-push.js`
- [ ] ✅ Aggiungi `validateAndTruncateNotification()` function
- [ ] ✅ Title: max 128 caratteri
- [ ] ✅ Body: max 256 caratteri
- [ ] ✅ Payload totale: <4KB
- [ ] ✅ Test: Notifiche lunghe vengono troncate correttamente
- **Tempo**: 1 ora

---

### Giorno 5: Resilience & Monitoring

**Task 5.1: Circuit Breaker in send-push.js**
- [ ] File: `netlify/functions/send-push.js`
- [ ] ✅ Crea `CircuitBreaker` class (vedi: `src/services/pushService.js` per riferimento)
- [ ] ✅ Implementa 3 stati: CLOSED, OPEN, HALF_OPEN
- [ ] ✅ Trip circuit dopo 50% error rate
- [ ] ✅ Fallback a email quando OPEN
- [ ] ✅ Test: Simula 50% errori, verifica che circuito si apra
- **Tempo**: 2.5 ore

**Task 5.2: TTL (Time To Live) su Firestore**
- [ ] ✅ Option A: Firestore TTL Policy (consigliato)
  - [ ] Firebase Console → Databases → TTL Policy
  - [ ] Collection: pushSubscriptions
  - [ ] Field: expiresAt
  - [ ] Salva
  
- [ ] ✅ Option B: Cloud Function schedulata (backup)
  - [ ] File: `functions/cleanupExpiredSubscriptions.js`
  - [ ] Runs: Daily at 02:00 UTC
  - [ ] Elimina docs con expiresAt < now
  - [ ] Deploy: `firebase deploy --only functions:cleanupExpiredSubscriptions`

- [ ] ✅ Test: Crea subscription con expiresAt = yesterday
- [ ] ✅ Verifica che sia eliminato dopo 24 ore (o subito se manual)
- **Tempo**: 1.5 ore

**Task 5.3: Error Strategy Table**
- [ ] File: `functions/sendBulkNotifications.clean.js`
- [ ] ✅ Crea `ERROR_STRATEGY` lookup table
- [ ] ✅ Per ogni HTTP status code: retry decision + action
- [ ] ✅ Testa con diversi error codes
- **Tempo**: 1 ora
- **Strategie**:
```
400 Bad Request        → No retry, delete subscription
401 Unauthorized       → No retry, delete subscription
403 Forbidden          → No retry, delete subscription
404 Not Found          → No retry, delete subscription
410 Gone               → No retry, delete subscription (device removed)
408 Timeout            → Retry
429 Rate Limited       → Retry with longer backoff
500+ Server Errors     → Retry
```

---

**MILESTONE 4: Fine Priorità 2**
```
✅ Sistema robusto con error handling completo
✅ Circuit breaker previene cascading failures
✅ TTL mantiene database pulito
✅ Strategie di retry ben definite
```

---

## 🟡 PRIORITÀ 3: OSSERVABILITÀ (4-5 giorni)

### Giorno 6-7: Analytics & Monitoring

**Task 6.1: Analytics Tracking nel Service Worker**
- [ ] File: `public/sw.js`
- [ ] ✅ Crea `trackNotificationAnalytics()` function
- [ ] ✅ Events da tracciare:
  - [ ] `push` - Notifica ricevuta
  - [ ] `notificationclick` - Notifica cliccata
  - [ ] `notificationclose` - Notifica chiusa
  - [ ] `notificationaction` - Azione specifica cliccata
- [ ] ✅ Salva in Firestore collection: `notificationEvents`
- [ ] ✅ Includi nel `event.waitUntil()` per garantire completamento
- **Tempo**: 2 ore

**Task 6.2: Metrics Collection Class**
- [ ] File: `functions/notificationMetricsCollector.js` (nuovo)
- [ ] ✅ Raccoglie daily statistics:
  - [ ] sent, delivered, failed, bounced
  - [ ] opened, clicked
  - [ ] delivery rate %, open rate %
  - [ ] avg latency
- [ ] ✅ Salva in Firestore: `notificationMetrics/{date}`
- [ ] ✅ Cloud Function schedulata: Daily at 01:00 UTC
- **Tempo**: 2 ore

**Task 6.3: Admin Dashboard per Metrics**
- [ ] File: `src/features/admin/components/PushMetricsDashboard.jsx` (nuovo)
- [ ] ✅ Componenti:
  - [ ] MetricCard (Sent, Delivered, Failed)
  - [ ] Rate Cards (Delivery Rate, Open Rate, Click Rate)
  - [ ] Latency Chart (p50, p95, p99)
  - [ ] Error Distribution Chart
  - [ ] Time Series Graph (sent/delivered/failed over time)
- [ ] ✅ Real-time data da Firestore
- [ ] ✅ Filter by date range
- **Tempo**: 3 ore

**Task 6.4: Alerts & Thresholds**
- [ ] Firestore collection: `alertRules`
- [ ] ✅ Rule: Delivery rate < 90% → Alert
- [ ] ✅ Rule: Error rate > 10% → Alert
- [ ] ✅ Rule: Circuit breaker opened → Alert
- [ ] ✅ Notifica admin via email/toast
- **Tempo**: 1.5 ore

---

### Giorno 8: Documentation & Configurazione

**Task 7.1: VAPID Keys Documentation**
- [ ] File: `docs/VAPID_SETUP_GUIDE.md` (nuovo)
- [ ] ✅ Step-by-step: Generare VAPID keys
- [ ] ✅ Step-by-step: Configurare su Netlify
- [ ] ✅ Step-by-step: Configurare su Firebase
- [ ] ✅ Validazione at runtime
- **Tempo**: 1 ora

**Task 7.2: Feature Flag per Push Notifications**
- [ ] File: `firestore.rules` (aggiorna)
- [ ] Firestore collection: `feature_flags`
- [ ] ✅ Documento: `push-notifications-enabled`
  - [ ] enabled: true/false
  - [ ] rolloutPercentage: 0-100
  - [ ] targetedUsers: array
  - [ ] excludedUsers: array
- [ ] ✅ Funzione: `isPushEnabled(userId)` nelle Cloud Functions
- [ ] ✅ Check feature flag prima di inviare notifiche
- **Tempo**: 1.5 ore

**Task 7.3: Sanitazione VAPID Keys**
- [ ] File: `functions/sendBulkNotifications.clean.js`
- [ ] ✅ Semplifica `sanitizeVapidKey()` function
- [ ] ✅ Solo trim + newline removal
- [ ] ✅ Non modificare base64 characters
- [ ] ✅ Test con VAPID keys reali
- **Tempo**: 45 min

---

**MILESTONE 5: Fine Priorità 3**
```
✅ Osservabilità completa su sistema push
✅ Dashboard mostra real-time metrics
✅ Alerts notificano admin di problemi
✅ Tutti i cambiamenti tracciati
```

---

## 🟢 PRIORITÀ 4: UX & PERFORMANCE (Settimana 2)

### Task 8.1: A/B Testing Permission Request

- [ ] Firebase Remote Config
- [ ] ✅ Variante A: Request dopo 3 secondi
- [ ] ✅ Variante B: Request dopo 5 secondi
- [ ] ✅ Variante C: Request dopo 10 secondi (control)
- [ ] ✅ Track: Accept rate per variante
- [ ] ✅ Track: Time to accept per variante
- **Tempo**: 2 ore
- **Metriche**:
  - [ ] 50+ utenti per variante prima di concludere
  - [ ] Min 7 giorni per test

### Task 8.2: Permission Denied Retry

- [ ] File: `src/hooks/usePushNotifications.js`
- [ ] ✅ Se permission denied: riprova ogni 24 ore
- [ ] ✅ Toast gentle: "Abilita notifiche per ricevere gli aggiornamenti"
- [ ] ✅ Link to browser settings
- **Tempo**: 1 ora

### Task 8.3: Batch Send Optimization

- [ ] File: `functions/sendBulkNotifications.clean.js`
- [ ] ✅ Invece di inviare serialmente: batch di 10
- [ ] ✅ Promise.all() per parallelizzare
- [ ] ✅ Mantieni limite rate pushing service
- **Tempo**: 1.5 ore

### Task 8.4: Performance Tuning

- [ ] ✅ Lazy load notification data
- [ ] ✅ Cache subscription list (1 ora TTL)
- [ ] ✅ Async processing in Netlify Functions (non bloccare response)
- **Tempo**: 2 ore

---

## 📊 TRACKING PROGRESS

Copia questa tabella in un foglio condiviso:

| Task | Status | Start | End | Notes |
|------|--------|-------|-----|-------|
| 1.1 - sendSubscriptionToServer() | ⏳ | 2025-11-11 | TBD | Implementare completo con retry |
| 1.2 - Retry Logic | ⏳ | 2025-11-11 | TBD | Exponential backoff [2,5,10]s |
| 1.3 - Query Dedup | ⏳ | 2025-11-11 | TBD | Riduce da 2 a 1 query |
| 2.1 - Composite Index | ⏳ | 2025-11-12 | TBD | Deploy e verificare ✅ |
| 2.2 - Security Rules | ⏳ | 2025-11-12 | TBD | Collection rules setup |
| 2.3 - Collection Verify | ⏳ | 2025-11-12 | TBD | Almeno 2-3 doc per test |
| 3.1 - E2E Testing | ⏳ | 2025-11-13 | TBD | Invio notifica manuale |
| 3.2 - Retry Testing | ⏳ | 2025-11-13 | TBD | Simulate offline scenario |
| 3.3 - Unit Tests | ⏳ | 2025-11-13 | TBD | Test coverage >80% |
| 4.1 - Input Validation | ⏳ | 2025-11-14 | TBD | Tutti i campi validati |
| 4.2 - Error Catalog | ⏳ | 2025-11-14 | TBD | Struttura errori coerente |
| 4.3 - Notification Validation | ⏳ | 2025-11-14 | TBD | Truncate e size check |
| 5.1 - Circuit Breaker | ⏳ | 2025-11-15 | TBD | Implementazione completa |
| 5.2 - TTL/Cleanup | ⏳ | 2025-11-15 | TBD | Auto-delete expired subs |
| 5.3 - Error Strategy | ⏳ | 2025-11-15 | TBD | Lookup table per ogni code |
| 6.1 - Analytics | ⏳ | 2025-11-18 | TBD | Track events nel SW |
| 6.2 - Metrics Collector | ⏳ | 2025-11-18 | TBD | Daily aggregation |
| 6.3 - Admin Dashboard | ⏳ | 2025-11-19 | TBD | Real-time charts e metrics |
| 6.4 - Alerts | ⏳ | 2025-11-19 | TBD | Threshold-based alerts |
| 7.1 - VAPID Docs | ⏳ | 2025-11-20 | TBD | Setup guide |
| 7.2 - Feature Flags | ⏳ | 2025-11-20 | TBD | Rollout control |
| 7.3 - Sanitize VAPID | ⏳ | 2025-11-20 | TBD | Semplificare logica |
| 8.1 - A/B Test | ⏳ | 2025-11-21 | TBD | Remote Config variants |
| 8.2 - Permission Retry | ⏳ | 2025-11-21 | TBD | 24-hour retry |
| 8.3 - Batch Send | ⏳ | 2025-11-21 | TBD | Parallelizza invii |
| 8.4 - Performance | ⏳ | 2025-11-22 | TBD | Lazy load + cache |

---

## 🧪 TESTING COMMANDS

```bash
# Unit tests
npm run test -- push-notifications

# Build + deploy functions
firebase deploy --only functions

# Deploy Firestore
firebase deploy --only firestore:indexes,firestore:rules

# Deploy Netlify Functions
netlify deploy --prod

# Manual testing checklist
# 1. Open DevTools → Application → Service Workers
# 2. Check if SW is registered and active
# 3. Check IndexedDB (cache)
# 4. Check localStorage (push-device-id, push-sub-*)
# 5. Firestore Console → pushSubscriptions → check docs
# 6. Send test notification
# 7. Check notification appears
# 8. Click notification → verify navigation
```

---

## 🚀 DEPLOYMENT ORDER

1. **Fase 1: Backend Infrastructure**
   ```bash
   firebase deploy --only firestore:indexes,firestore:rules
   # Attendi: Index creation (5-10 min)
   ```

2. **Fase 2: Cloud Functions**
   ```bash
   firebase deploy --only functions
   # Attendi: Function deployment
   ```

3. **Fase 3: Netlify Functions**
   ```bash
   netlify deploy --prod
   ```

4. **Fase 4: Frontend**
   ```bash
   npm run build
   npm run deploy
   # Oppure: netlify deploy --prod
   ```

5. **Fase 5: Monitoring**
   - [ ] Firestore Console → Check metrics collection
   - [ ] Cloud Functions → Check logs
   - [ ] Dashboard → Verifica stats reali-time

---

## ✅ SIGN-OFF CRITERIA

Prima di considerare il sistema "LIVE":

- [ ] ≥3 giorni di test con ≥50 utenti
- [ ] Delivery rate > 95% per ≥48 ore
- [ ] Error rate < 5%
- [ ] Circuit breaker mai aperto
- [ ] Test suite: 100% pass
- [ ] Code review: 2 approvazioni
- [ ] Load test: 1000 notifiche/min senza errori
- [ ] Documentazione: Completa e aggiornata
- [ ] Admin dashboard: Operational
- [ ] Alerts: Configurati e testati

---

**Versione**: 1.0  
**Last Updated**: 11 Novembre 2025  
**Owner**: Senior Development Team  
**Status**: 🔴 NOT STARTED
