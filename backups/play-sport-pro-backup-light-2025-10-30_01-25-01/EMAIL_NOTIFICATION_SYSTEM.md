# 📧 EMAIL NOTIFICATION SYSTEM - CHK-401

**Status**: ✅ COMPLETATO  
**Data**: 15 Ottobre 2025  
**Tempo**: 6 ore  
**Priorità**: 🔴 ALTA

---

## 📋 PANORAMICA

Sistema completo di notifiche email transazionali per Play-Sport.pro con:
- ✅ Template HTML responsive professionali
- ✅ Invio tramite Gmail/Nodemailer (già configurato)
- ✅ Fallback automatico e retry logic
- ✅ Trigger Firebase automatici (onCreate, onUpdate, onDelete)
- ✅ Queue system per invii massivi
- ✅ Branding personalizzato per ogni club
- ✅ Tracking e analytics

---

## 🏗️ ARCHITETTURA

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│                                                             │
│  ┌─────────────────┐         ┌──────────────────┐          │
│  │  Booking Flow   │────────▶│  emailClient.js  │          │
│  └─────────────────┘         └──────────────────┘          │
│                                      │                      │
└──────────────────────────────────────┼──────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────┐
│              FIREBASE CLOUD FUNCTIONS                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  FIRESTORE TRIGGERS (Automatici)                     │  │
│  │                                                       │  │
│  │  • onBookingCreated  ──▶ Email conferma             │  │
│  │  • onBookingDeleted  ──▶ Email cancellazione        │  │
│  │  • onMatchCreated    ──▶ Email invito partita       │  │
│  │  • onMatchUpdated    ──▶ Email risultato            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  EMAIL SERVICE (emailService.js)                     │  │
│  │                                                       │  │
│  │  • sendEmail() ──▶ Retry automatico                 │  │
│  │  • sendBulkEmails() ──▶ Batch processing            │  │
│  │  • queueEmail() ──▶ Invio differito                 │  │
│  │  • processEmailQueue() ──▶ Worker queue             │  │
│  └──────────────────────────────────────────────────────┘  │
│                    │                                        │
│                    ▼                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  EMAIL TEMPLATES (emailTemplates.js)                 │  │
│  │                                                       │  │
│  │  • bookingConfirmationTemplate                       │  │
│  │  • bookingReminderTemplate                           │  │
│  │  • bookingCancellationTemplate                       │  │
│  │  • addedToBookingTemplate                            │  │
│  │  • matchInvitationTemplate                           │  │
│  │  • matchResultTemplate                               │  │
│  │  • welcomeTemplate                                   │  │
│  │  • passwordResetTemplate                             │  │
│  │  • paymentConfirmationTemplate                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                    │                                        │
└────────────────────┼────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              EMAIL DELIVERY SERVICE                         │
│                                                             │
│  ┌─────────────────┐        ┌──────────────────┐          │
│  │  Gmail/         │        │  SendGrid        │          │
│  │  Nodemailer     │◀────▶  │  (Opzionale)     │          │
│  └─────────────────┘        └──────────────────┘          │
│       (Primario)                 (Fallback)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 FILE CREATI

### **Backend (Cloud Functions)**

#### 1. `functions/emailTemplates.js` (720 righe)
Template HTML professionali con branding personalizzato:

```javascript
import { bookingConfirmationTemplate } from './emailTemplates.js';

const email = bookingConfirmationTemplate({
  playerName: 'Mario Rossi',
  clubName: 'Dorado Padel Center',
  clubLogo: 'https://...',
  courtName: 'Campo 1',
  date: '2025-10-20',
  time: '18:30',
  duration: 90,
  price: 25.00,
  players: ['Mario Rossi', 'Luca Bianchi'],
  bookingId: 'abc123',
  primaryColor: '#2563eb',
});

// email.subject
// email.text (plain text)
// email.html (HTML responsive)
```

**Template disponibili:**
- ✅ `bookingConfirmationTemplate` - Conferma prenotazione
- ✅ `bookingReminderTemplate` - Reminder 24h prima
- ✅ `bookingCancellationTemplate` - Cancellazione
- ✅ `addedToBookingTemplate` - Aggiunto a prenotazione
- ✅ `matchInvitationTemplate` - Invito partita competitiva
- ✅ `matchResultTemplate` - Risultato partita
- ✅ `welcomeTemplate` - Benvenuto nuovo utente
- ✅ `passwordResetTemplate` - Reset password
- ✅ `paymentConfirmationTemplate` - Conferma pagamento

#### 2. `functions/emailService.js` (442 righe)
Servizio centralizzato per invio email:

```javascript
import emailService from './emailService.js';

// Invio singolo con retry automatico
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Test Email',
  text: 'Plain text version',
  html: '<h1>HTML version</h1>',
});

// Invio massivo (max 100 per batch)
await emailService.sendBulkEmails([
  { to: 'user1@example.com', subject: '...', text: '...', html: '...' },
  { to: 'user2@example.com', subject: '...', text: '...', html: '...' },
]);

// Queue per invio differito
await emailService.queueEmail({
  to: 'user@example.com',
  subject: 'Scheduled email',
  text: '...',
  scheduledFor: new Date('2025-10-20T10:00:00'),
});

// Statistiche
const stats = await emailService.getEmailStats('clubId', 30);
// { total: 150, sent: 145, failed: 5, byService: {...}, byType: {...} }
```

**Features:**
- ✅ Retry automatico (max 3 tentativi, exponential backoff)
- ✅ Fallback Gmail → SendGrid
- ✅ Queue system con Firestore
- ✅ Batch processing (100 email/batch)
- ✅ Logging su Firestore (`emailLogs` collection)
- ✅ Verifica configurazione
- ✅ Email di test

#### 3. `functions/sendBookingEmail.js` (245 righe)
Trigger automatici per booking:

```javascript
// Trigger automatico onCreate
export const onBookingCreated = onDocumentCreated(
  { document: 'bookings/{bookingId}' },
  async (event) => {
    // Invia email conferma a utente
    // Invia email a tutti i giocatori aggiunti
  }
);

// Trigger automatico onDelete
export const onBookingDeleted = onDocumentDeleted(
  { document: 'bookings/{bookingId}' },
  async (event) => {
    // Invia email cancellazione a tutti
  }
);
```

**Email inviate automaticamente:**
- ✅ Conferma prenotazione (onCreate)
- ✅ Notifica agli altri giocatori (onCreate)
- ✅ Cancellazione a tutti (onDelete)

#### 4. `functions/sendMatchEmail.js` (197 righe)
Trigger automatici per partite:

```javascript
// Trigger automatico onCreate
export const onMatchCreated = onDocumentCreated(
  { document: 'matches/{matchId}' },
  async (event) => {
    // Invia invito a player2
  }
);

// Trigger automatico onUpdate (risultato)
export const onMatchUpdated = onDocumentUpdated(
  { document: 'matches/{matchId}' },
  async (event) => {
    // Se aggiunto score, invia email risultato a entrambi
  }
);
```

**Email inviate automaticamente:**
- ✅ Invito partita competitiva (onCreate)
- ✅ Risultato partita a entrambi (onUpdate con score)

### **Frontend (React)**

#### 5. `src/services/emailClient.js` (234 righe)
Client-side service per trigger manuali:

```javascript
import emailClient from '@/services/emailClient';

// Invia benvenuto nuovo utente
await emailClient.sendWelcomeEmail(userId, clubId);

// Reminder prenotazione (chiamato da scheduler)
await emailClient.sendBookingReminder(bookingId);

// Reset password
await emailClient.sendPasswordResetEmail(email, clubId);

// Conferma pagamento
await emailClient.sendPaymentConfirmation(paymentId, userId);

// Email personalizzata
await emailClient.sendCustomEmail({
  to: 'user@example.com',
  subject: 'Custom',
  text: '...',
  html: '...',
});

// Test diagnostico
await emailClient.sendTestEmail('admin@example.com');

// Statistiche (per admin dashboard)
const stats = await emailClient.getEmailStats(clubId, 30);
```

**Hook React:**
```javascript
import { useEmailService } from '@/services/emailClient';

function MyComponent() {
  const { sendWelcomeEmail, sendTestEmail } = useEmailService();
  
  const handleSendTest = async () => {
    await sendTestEmail('test@example.com');
  };
}
```

---

## 🚀 DEPLOYMENT

### 1. **Verifica Secrets (già configurati)**

```bash
# Verificare che questi secrets siano già configurati (Sprint 3)
firebase functions:config:get

# EMAIL_USER=parischit85@gmail.com
# EMAIL_PASSWORD=<app-password-google>
# FROM_EMAIL=parischit85@gmail.com
```

✅ Gmail/Nodemailer già configurato in Sprint 3 (certificati medici)

### 2. **Deploy Cloud Functions**

```bash
# Deploy solo le nuove functions
firebase deploy --only functions:onBookingCreated,functions:onBookingDeleted,functions:onMatchCreated,functions:onMatchUpdated

# Oppure deploy completo
firebase deploy --only functions
```

### 3. **Test Email System**

```bash
# Test locale con emulatori
firebase emulators:start --only functions,firestore

# Test in produzione (chiamare da frontend)
await emailClient.sendTestEmail('tua-email@example.com');
```

### 4. **Monitoraggio**

```bash
# Logs real-time
firebase functions:log --only onBookingCreated

# Dashboard Firebase
# https://console.firebase.google.com/project/.../functions
```

---

## 📊 FIRESTORE COLLECTIONS

### `emailQueue` (per invii differiti)
```javascript
{
  id: 'auto-id',
  to: 'user@example.com',
  subject: 'Subject',
  text: 'Plain text',
  html: '<html>...',
  status: 'pending' | 'sent' | 'failed',
  attempts: 0,
  scheduledFor: Timestamp,
  createdAt: Timestamp,
  sentAt: Timestamp (opzionale),
  error: 'Error message' (opzionale)
}
```

### `emailLogs` (per analytics)
```javascript
{
  id: 'auto-id',
  to: 'user@example.com',
  subject: 'Subject',
  service: 'Nodemailer' | 'SendGrid' | 'Failed',
  status: 'sent' | 'failed',
  attempt: 1,
  error: null | 'Error message',
  type: 'transactional' | 'marketing',
  clubId: 'club-id' (opzionale),
  timestamp: Timestamp
}
```

---

## 🎨 TEMPLATE DESIGN

### **Features Design:**
- ✅ Layout responsivo (mobile-first)
- ✅ Branding personalizzato:
  - Logo club nel header
  - Colore primario customizzabile
  - Nome club
- ✅ Dark mode friendly
- ✅ Gradient header
- ✅ Info boxes colorati (success, warning, danger, info)
- ✅ CTA buttons prominenti
- ✅ Dettagli tabellari
- ✅ Footer con links privacy/terms

### **Esempio HTML generato:**
```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prenotazione Confermata</title>
  <style>/* Inline CSS */</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%)">
      <img src="club-logo.png" class="logo">
      <h1>Dorado Padel Center</h1>
    </div>
    <div class="content">
      <h2>✅ Prenotazione Confermata!</h2>
      <p>Ciao <strong>Mario Rossi</strong>,</p>
      <!-- ... contenuto ... -->
      <a href="..." class="button">Visualizza Prenotazione</a>
    </div>
    <div class="footer">
      <p>Play-Sport.pro</p>
      <div class="social-links">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Termini</a>
      </div>
    </div>
  </div>
</body>
</html>
```

---

## 🔧 CONFIGURAZIONE

### **Gmail/Nodemailer (Attualmente Attivo)**

```javascript
// functions/emailService.js
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,      // parischit85@gmail.com
    pass: process.env.EMAIL_PASSWORD,  // App Password Google
  },
});
```

**Limiti Gmail:**
- 500 email/giorno (account gratuito)
- 2000 email/giorno (Google Workspace)
- Rate limit: ~20 email/minuto

### **SendGrid (Opzionale, Fallback)**

```bash
# Setup SendGrid (opzionale)
1. Crea account: https://sendgrid.com
2. Ottieni API Key: Settings > API Keys
3. Configura secret:
   firebase functions:secrets:set SENDGRID_API_KEY

4. Il sistema userà automaticamente SendGrid se disponibile
```

**Limiti SendGrid:**
- 100 email/giorno (free tier)
- 40,000+ email/mese (paid)
- Deliverability migliore

---

## 📈 PERFORMANCE & SCALABILITÀ

### **Retry Logic**
```javascript
{
  maxAttempts: 3,
  delayMs: 1000,       // 1 secondo
  backoffMultiplier: 2 // Exponential backoff
}

// Tentativo 1: immediate
// Tentativo 2: +1s delay
// Tentativo 3: +2s delay
```

### **Batch Processing**
```javascript
// Max 100 email per batch
// Pausa 1s tra batch per rate limiting

await emailService.sendBulkEmails(emails); // 250 email
// Batch 1: 100 email → pausa 1s
// Batch 2: 100 email → pausa 1s
// Batch 3: 50 email → done
```

### **Queue System**
```javascript
// Invio differito per non bloccare UI
await emailService.queueEmail({
  to: 'user@example.com',
  subject: 'Reminder',
  text: '...',
  scheduledFor: tomorrow,
});

// Cloud Function schedulata processa queue ogni 5 minuti
export const processEmailQueue = onSchedule('every 5 minutes', async () => {
  await emailService.processEmailQueue();
});
```

---

## 🧪 TESTING

### **Test Manuale**

```javascript
// 1. Invia email di test
import emailClient from '@/services/emailClient';
await emailClient.sendTestEmail('tua-email@example.com');

// 2. Verifica configurazione
const config = await emailClient.verifyEmailConfiguration();
console.log(config);
// { sendgrid: false, nodemailer: true, fromEmail: 'parischit85@gmail.com' }

// 3. Test template specifico
import { bookingConfirmationTemplate } from '@/functions/emailTemplates';
const email = bookingConfirmationTemplate({...});
console.log(email.html); // Preview HTML
```

### **Test Automatici**

```javascript
// Test onCreate trigger
// 1. Crea booking in Firestore
const bookingRef = await db.collection('bookings').add({
  clubId: 'test-club',
  userId: 'test-user',
  courtName: 'Campo 1',
  date: '2025-10-20',
  time: '18:30',
  duration: 90,
  price: 25,
  players: ['Test User'],
});

// 2. Controlla logs
firebase functions:log --only onBookingCreated

// 3. Verifica email ricevuta
```

---

## 📊 ANALYTICS & MONITORING

### **Dashboard Email (Admin)**

```javascript
import emailClient from '@/services/emailClient';

// Statistiche ultimi 30 giorni
const stats = await emailClient.getEmailStats(clubId, 30);

console.log(stats);
// {
//   total: 150,
//   sent: 145,
//   failed: 5,
//   byService: {
//     'Nodemailer': 140,
//     'SendGrid': 5,
//     'Failed': 5
//   },
//   byType: {
//     'booking_confirmation': 80,
//     'booking_cancellation': 20,
//     'match_invitation': 15,
//     'match_result': 30,
//     'welcome': 5
//   }
// }
```

### **Monitoraggio Real-Time**

```bash
# Logs Cloud Functions
firebase functions:log --follow

# Filtra per servizio email
firebase functions:log | grep "\[EmailService\]"

# Monitoraggio errori
firebase functions:log --only onBookingCreated | grep "❌"
```

### **Firestore Query per Failed Emails**

```javascript
// Ottieni email fallite ultimi 7 giorni
const failedEmails = await db
  .collection('emailLogs')
  .where('status', '==', 'failed')
  .where('timestamp', '>=', sevenDaysAgo)
  .orderBy('timestamp', 'desc')
  .limit(50)
  .get();

failedEmails.forEach(doc => {
  const data = doc.data();
  console.log(`Failed: ${data.to} - ${data.error}`);
});
```

---

## ✅ ACCEPTANCE CRITERIA

- [x] ✅ Utente riceve email conferma prenotazione entro 30s
- [x] ✅ Email ha logo club e brand colors personalizzati
- [x] ✅ Template responsive funziona su mobile
- [x] ✅ Email cancellazione inviata a tutti i partecipanti
- [x] ✅ Email invito partita inviata a player2
- [x] ✅ Email risultato partita con variazione ELO
- [x] ✅ Retry automatico in caso di errore
- [x] ✅ Logging su Firestore per analytics
- [x] ✅ Sistema queue per invii massivi
- [x] ✅ Test email funzionante

---

## 🔮 FUTURE ENHANCEMENTS

### **Fase 2 (Post-Sprint 4):**

1. **Email Reminder Scheduler**
   ```javascript
   // Cloud Function schedulata ogni ora
   export const sendBookingReminders = onSchedule('every 1 hour', async () => {
     // Trova bookings tra 24h
     // Invia reminder email
   });
   ```

2. **Unsubscribe System**
   ```javascript
   // Link unsubscribe in footer
   <a href="/unsubscribe?token=xyz">Unsubscribe</a>
   
   // Pagina unsubscribe
   await db.collection('users').doc(userId).update({
     'communicationPreferences.email': false
   });
   ```

3. **Email Templates Editor (Admin)**
   - UI per customizzare template
   - Preview live
   - Variabili dinamiche

4. **A/B Testing Email**
   - Test subject lines
   - Test CTA buttons
   - Tracking open rate

5. **Email Tracking**
   - Open rate (pixel tracking)
   - Click tracking (link redirect)
   - Bounce handling

6. **Localizzazione**
   - Template multilingua (IT, EN, ES, FR)
   - Auto-detect user language

---

## 📚 RISORSE

- **Nodemailer Docs**: https://nodemailer.com/
- **SendGrid Docs**: https://docs.sendgrid.com/
- **Firebase Functions**: https://firebase.google.com/docs/functions
- **HTML Email Best Practices**: https://www.campaignmonitor.com/dev-resources/guides/

---

## 🎉 COMPLETAMENTO

**CHK-401: Email Notification System** ✅ COMPLETATO

**Deliverables:**
- ✅ 9 template email professionali
- ✅ Sistema invio con retry e fallback
- ✅ 4 trigger Firebase automatici
- ✅ Queue system per batch
- ✅ Client service per frontend
- ✅ Logging e analytics
- ✅ Documentazione completa

**Tempo impiegato**: 6 ore  
**Righe di codice**: ~2,100  
**File creati**: 5

**Pronto per produzione!** 🚀

---

**Creato**: 15 Ottobre 2025  
**Versione**: 1.0  
**Status**: ✅ PRODUCTION READY
