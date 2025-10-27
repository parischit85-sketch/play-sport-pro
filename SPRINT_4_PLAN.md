# 🚀 SPRINT 4 - Comunicazioni, Pagamenti e Scalabilità

**Timeline**: 50-60 ore  
**Focus**: Integrare sistemi esterni, completare comunicazioni, preparare per produzione

---

## 📋 TASK PRIORITIZZATE

### **CHK-401: Email Notification System** ⏱️ 6h
**Obiettivo**: Sistema email transazionali completo con template professionali

**Features**:
- ✉️ Template HTML responsive per:
  - Conferma prenotazione
  - Reminder 24h prima
  - Cancellazione prenotazione
  - Nuovo partita aggiunta
  - Scadenza certificato medico (già configurato)
  - Benvenuto nuovo utente
  - Cambio password
  - Fattura pagamento
- 🎨 Brand personalizzato club (logo, colori)
- 📧 Sistema code/unsubscribe
- 📊 Tracking aperture email (opzionale)

**Servizio**: Gmail/Nodemailer (già configurato) + Cloud Functions

**File da creare**:
- `functions/emailTemplates.js` - Template HTML
- `functions/emailService.js` - Servizio invio
- `functions/sendBookingEmail.js` - Function prenotazioni
- `functions/sendMatchEmail.js` - Function partite
- `src/services/emailClient.js` - Client per trigger

**Priority**: 🔴 ALTA (sistema già parzialmente configurato)

---

### **CHK-402: Payment Integration (Stripe)** ⏱️ 8h
**Obiettivo**: Integrazione pagamenti online con Stripe

**Features**:
- 💳 Checkout Stripe per:
  - Pagamento prenotazione in anticipo
  - Abbonamenti mensili/annuali
  - Pacchetti ore (es. 10 ore)
  - Prodotti shop (racchette, palline, etc.)
- 🧾 Sistema fatturazione automatico
- 📊 Dashboard revenue per club admin
- 🔄 Gestione rimborsi
- 📧 Email conferma pagamento

**Servizio**: Stripe Checkout + Stripe Elements

**File da creare**:
- `functions/createPaymentIntent.js` - Function pagamento
- `functions/handleStripeWebhook.js` - Webhook Stripe
- `src/services/paymentService.js` - Client Stripe
- `src/features/payments/CheckoutModal.jsx` - UI checkout
- `src/features/payments/PaymentHistory.jsx` - Storico
- `src/features/admin/RevenueAnalytics.jsx` - Analytics

**Firebase Collections**:
```javascript
payments: {
  id, userId, clubId, amount, currency,
  type: 'booking' | 'subscription' | 'package',
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  stripePaymentIntentId, metadata, createdAt
}

subscriptions: {
  id, userId, clubId, plan, status,
  currentPeriodStart, currentPeriodEnd,
  stripeSubscriptionId
}
```

**Priority**: 🟡 MEDIA (richiede setup Stripe account)

---

### **CHK-403: SMS Notifications (Twilio)** ⏱️ 5h
**Obiettivo**: Notifiche SMS per eventi critici

**Features**:
- 📱 SMS per:
  - Conferma prenotazione
  - Reminder 2h prima
  - Cancellazione prenotazione
  - Codice verifica (2FA opzionale)
- 🌍 Supporto internazionale (+39, +1, etc.)
- 📊 Log invii e costi
- ⚙️ Preferenze utente (disabilita SMS)

**Servizio**: Twilio API

**File da creare**:
- `functions/sendSMS.js` - Function Twilio
- `src/services/smsService.js` - Client SMS
- `src/features/profile/NotificationPreferences.jsx` - Preferenze

**Firebase Collections**:
```javascript
smsNotifications: {
  id, userId, phone, message, status,
  type, cost, twilioMessageId, sentAt
}
```

**Priority**: 🟢 BASSA (optional enhancement)

---

### **CHK-404: Advanced Reporting System** ⏱️ 7h
**Obiettivo**: Report personalizzabili e export dati

**Features**:
- 📊 Report Builder UI:
  - Filtri date range
  - Filtri per campo/utente/tipo
  - Metriche: revenue, occupancy, top players
  - Visualizzazione: tabelle, grafici, timeline
- 📥 Export formats:
  - CSV
  - PDF (con logo club)
  - Excel (XLSX)
- 📅 Report schedulati (settimanali, mensili)
- 📧 Email automatico report

**File da creare**:
- `src/features/admin/ReportBuilder.jsx` - UI builder
- `src/features/admin/ReportPreview.jsx` - Anteprima
- `src/services/reportService.js` - Generazione report
- `src/lib/pdfExport.js` - Export PDF (jsPDF)
- `src/lib/excelExport.js` - Export Excel (SheetJS)
- `functions/generateScheduledReport.js` - Scheduler

**Libraries**:
```json
{
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.2",
  "xlsx": "^0.18.5"
}
```

**Priority**: 🟡 MEDIA

---

### **CHK-405: In-App Messaging System** ⏱️ 6h
**Obiettivo**: Chat tra utenti e supporto club

**Features**:
- 💬 Chat 1-to-1:
  - Tra players di una partita
  - Player ↔ Club Admin
  - Player ↔ Instructor
- 🔔 Real-time con Firestore onSnapshot
- 📎 Allegati (immagini, file)
- ✅ Read receipts
- 🔕 Mute conversazioni
- 📊 Badge unread count

**File da creare**:
- `src/services/messagingService.js` - CRUD messaggi
- `src/features/messaging/ChatList.jsx` - Lista chat
- `src/features/messaging/ChatWindow.jsx` - Finestra chat
- `src/features/messaging/MessageBubble.jsx` - Singolo messaggio
- `src/components/MessagingFAB.jsx` - Floating button

**Firebase Collections**:
```javascript
conversations: {
  id, participants: [userId1, userId2],
  lastMessage, lastMessageAt, unreadCount: { userId1: 0, userId2: 2 }
}

messages: {
  id, conversationId, senderId, text,
  attachments: [], readBy: [], createdAt
}
```

**Priority**: 🟡 MEDIA

---

### **CHK-406: Social Features & Activity Feed** ⏱️ 5h
**Obiettivo**: Socializzazione e community building

**Features**:
- 🎯 Activity Feed globale club:
  - Nuove prenotazioni
  - Partite completate
  - Nuovi record ranking
  - Tornei annunciati
- 👥 Friend system:
  - Friend requests
  - Accept/Reject
  - Friend list
  - Quick book with friends
- 🏆 Achievement badges:
  - Prima prenotazione
  - 10 partite giocate
  - Vincitore torneo
  - Top ranking

**File da creare**:
- `src/features/social/ActivityFeed.jsx` - Feed principale
- `src/features/social/FriendsList.jsx` - Lista amici
- `src/features/social/FriendRequests.jsx` - Richieste
- `src/services/socialService.js` - Logic social
- `src/services/achievementService.js` - Logic achievements

**Firebase Collections**:
```javascript
friendships: {
  id, userId1, userId2, status: 'pending' | 'accepted', createdAt
}

activities: {
  id, clubId, userId, type, data, createdAt
}

achievements: {
  id, userId, badge, unlockedAt
}
```

**Priority**: 🟢 BASSA (nice-to-have)

---

### **CHK-407: Mobile App Enhancements** ⏱️ 6h
**Obiettivo**: PWA avanzata e preparazione native app

**Features**:
- 📱 PWA miglioramenti:
  - Install prompt custom
  - App shortcuts (quick book, view bookings)
  - Offline queue per bookings
  - Background sync
- 📸 Camera features:
  - QR code scanner per check-in
  - Photo upload certificati
  - Avatar photo
- 🔔 Push notifications avanzate:
  - Notifiche rich con immagini
  - Action buttons (Conferma/Cancella)
  - Grouping per tipo
- 🎨 Splash screen custom
- 📍 Geolocation per find nearby clubs

**File da creare**:
- `src/features/mobile/InstallPrompt.jsx` - PWA install
- `src/features/mobile/QRScanner.jsx` - Scanner QR
- `src/features/mobile/PhotoCapture.jsx` - Camera
- `src/lib/offlineQueue.js` - Queue offline
- `public/manifest.json` - Manifest update

**Priority**: 🔴 ALTA (migliora UX mobile)

---

### **CHK-408: Internationalization (i18n)** ⏱️ 7h
**Obiettivo**: Supporto multi-lingua

**Features**:
- 🌍 Lingue supportate:
  - Italiano (default)
  - Inglese
  - Spagnolo
  - Francese
- 🔄 Switch lingua in settings
- 📅 Formati date/ora localizzati
- 💰 Formati valuta localizzati
- 📧 Email template tradotti

**Library**: `react-i18next`

**File da creare**:
- `src/i18n/config.js` - Setup i18next
- `src/locales/it.json` - Traduzioni italiano
- `src/locales/en.json` - Traduzioni inglese
- `src/locales/es.json` - Traduzioni spagnolo
- `src/locales/fr.json` - Traduzioni francese
- `src/components/LanguageSwitcher.jsx` - UI switch
- Update tutti i componenti con `useTranslation()`

**Priority**: 🟡 MEDIA (espansione internazionale)

---

### **CHK-409: Advanced Security & Rate Limiting** ⏱️ 5h
**Obiettivo**: Hardening sicurezza e protezione abuse

**Features**:
- 🛡️ Rate limiting:
  - Max 100 req/min per user
  - Max 10 bookings/day per user
  - Max 5 login attempts
  - CAPTCHA su azioni sensibili
- 🔐 Security enhancements:
  - Input validation con Zod
  - SQL/NoSQL injection prevention
  - CORS policy strict
  - CSP headers
  - HTTPS redirect
- 📊 Audit log dettagliato:
  - Login attempts
  - Failed operations
  - Admin actions
  - Data exports
- 🚨 Intrusion detection:
  - Alert su comportamenti anomali
  - IP blacklist
  - Suspicious activity reports

**File da creare**:
- `functions/rateLimiter.js` - Middleware rate limit
- `src/lib/validation.js` - Schema Zod
- `src/services/auditService.js` - Audit logging
- `functions/securityMonitor.js` - Function monitor
- `firebase.json` - Headers config

**Libraries**:
```json
{
  "zod": "^3.22.4",
  "express-rate-limit": "^7.1.5",
  "helmet": "^7.1.0"
}
```

**Priority**: 🔴 ALTA (production readiness)

---

### **CHK-410: Database Optimization & Indexes** ⏱️ 5h
**Obiettivo**: Performance database e query optimization

**Features**:
- 🚀 Firestore composite indexes:
  - Bookings: clubId + date + time
  - Players: clubId + isActive + ranking
  - Matches: clubId + date + status
  - Notifications: userId + read + createdAt
- 📊 Query optimization:
  - Pagination con cursors
  - Limit results default (50)
  - Cache query results (5min TTL)
  - Denormalize dati critici
- 🧹 Data cleanup jobs:
  - Delete old notifications (>90 days)
  - Archive old bookings (>1 year)
  - Clean orphaned data
  - Compress large documents
- 📈 Performance monitoring:
  - Query execution time
  - Document read count
  - Cache hit rate
  - Slow query alerts

**File da creare**:
- `firestore.indexes.json` - Indexes config
- `functions/dataCleanup.js` - Scheduled cleanup
- `src/services/queryOptimizer.js` - Query helper
- `src/lib/pagination.js` - Cursor pagination
- Update existing services con ottimizzazioni

**Priority**: 🔴 ALTA (performance critica)

---

## 📊 RIEPILOGO SPRINT 4

| Task | Ore | Priority | Categoria |
|------|-----|----------|-----------|
| CHK-401: Email System | 6h | 🔴 ALTA | Comunicazioni |
| CHK-402: Payment (Stripe) | 8h | 🟡 MEDIA | Monetizzazione |
| CHK-403: SMS (Twilio) | 5h | 🟢 BASSA | Comunicazioni |
| CHK-404: Advanced Reports | 7h | 🟡 MEDIA | Analytics |
| CHK-405: Messaging | 6h | 🟡 MEDIA | Social |
| CHK-406: Social Features | 5h | 🟢 BASSA | Social |
| CHK-407: Mobile PWA | 6h | 🔴 ALTA | Mobile |
| CHK-408: i18n | 7h | 🟡 MEDIA | Scalabilità |
| CHK-409: Security | 5h | 🔴 ALTA | Sicurezza |
| CHK-410: DB Optimization | 5h | 🔴 ALTA | Performance |
| **TOTALE** | **60h** | | |

---

## 🎯 ORDINE ESECUZIONE CONSIGLIATO

### Fase 1: Comunicazioni (11h)
1. CHK-401: Email System (già parzialmente configurato)
2. CHK-403: SMS Notifications (opzionale)

### Fase 2: Sicurezza & Performance (10h)
3. CHK-409: Security & Rate Limiting
4. CHK-410: Database Optimization

### Fase 3: Mobile & UX (6h)
5. CHK-407: Mobile PWA Enhancements

### Fase 4: Monetizzazione (8h)
6. CHK-402: Payment Integration

### Fase 5: Analytics & Reporting (7h)
7. CHK-404: Advanced Reports

### Fase 6: Social & i18n (18h)
8. CHK-405: In-App Messaging
9. CHK-408: Internationalization
10. CHK-406: Social Features

---

## 🔧 SETUP RICHIESTO

### Servizi Esterni da Configurare
- ✅ **Gmail/Nodemailer**: Già configurato (Sprint 3)
- ⏳ **Stripe**: Account + API keys
- ⏳ **Twilio**: Account + Phone number + API keys
- ⏳ **Google reCAPTCHA**: Site key + Secret key

### Firebase Extensions Consigliate
- `firestore-send-email` (alternative a custom function)
- `storage-resize-images` (resize avatar/certificate images)
- `firestore-bigquery-export` (analytics avanzate)

### Environment Variables Aggiuntive
```env
# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Twilio
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+39xxx

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=6Lxxx
RECAPTCHA_SECRET_KEY=6Lxxx
```

---

## 📚 LIBRARIES DA INSTALLARE

```bash
# Payment
npm install @stripe/stripe-js @stripe/react-stripe-js stripe

# PDF/Excel Export
npm install jspdf jspdf-autotable xlsx

# i18n
npm install react-i18next i18next i18next-browser-languagedetector

# Security
npm install zod helmet express-rate-limit

# SMS
npm install twilio

# reCAPTCHA
npm install react-google-recaptcha
```

---

## ✅ ACCEPTANCE CRITERIA

### CHK-401: Email System
- [ ] Utente riceve email conferma prenotazione entro 30s
- [ ] Email ha logo club e brand colors
- [ ] Link unsubscribe funzionante
- [ ] Template responsive su mobile

### CHK-402: Payment
- [ ] Checkout Stripe si apre correttamente
- [ ] Pagamento completato aggiorna Firestore
- [ ] Fattura PDF generata e inviata via email
- [ ] Dashboard revenue mostra dati corretti

### CHK-407: Mobile PWA
- [ ] Install prompt appare su mobile dopo 2 visite
- [ ] QR scanner apre camera e legge codici
- [ ] Offline queue salva booking e sincronizza online
- [ ] Push notification ha action buttons

### CHK-409: Security
- [ ] Rate limiter blocca dopo 100 req/min
- [ ] Input validation previene XSS
- [ ] Audit log registra tutte le azioni admin
- [ ] Alert su 5 failed login attempts

### CHK-410: DB Optimization
- [ ] Query bookings < 200ms
- [ ] Pagination funziona con >1000 documenti
- [ ] Cleanup job rimuove notifiche vecchie
- [ ] Indexes creati in Firebase Console

---

## 🎉 DELIVERABLES FINALI

- ✅ **10 features** produzione-ready
- ✅ **Email transazionali** complete
- ✅ **Payment gateway** Stripe integrato
- ✅ **PWA avanzata** con offline support
- ✅ **Security hardening** enterprise-grade
- ✅ **Database ottimizzato** per scale
- ✅ **Report system** con export PDF/Excel
- ✅ **i18n** 4 lingue supportate
- ✅ **Messaging** in-app funzionante
- ✅ **Social features** community-building

---

## 🚀 POST-SPRINT 4

Dopo Sprint 4, il prodotto sarà **production-ready** con:
- 💰 Monetizzazione (Stripe)
- 📧 Comunicazioni professionali (Email + SMS)
- 🔒 Sicurezza enterprise
- 🌍 Scalabilità internazionale
- 📊 Analytics avanzate
- 📱 Mobile experience premium

**Next Steps**:
- Sprint 5: Advanced Tournament System
- Sprint 6: AI/ML Features (smart scheduling, player matching)
- Sprint 7: Marketplace & Shop
- Sprint 8: Native iOS/Android apps

---

**Creato**: 10 Ottobre 2025  
**Versione**: 1.0  
**Status**: ⏳ IN ATTESA APPROVAZIONE
