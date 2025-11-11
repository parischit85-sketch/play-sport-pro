# 📧 Sistema di Invio Email - Documentazione Tecnica Completa

## 📋 Indice
1. [Panoramica del Sistema](#panoramica-del-sistema)
2. [Architettura Email Verification](#architettura-email-verification)
3. [Architettura Email Transazionali (Certificati)](#architettura-email-transazionali)
4. [Configurazione Firebase Authentication](#configurazione-firebase-authentication)
5. [Configurazione SMTP per Cloud Functions](#configurazione-smtp-per-cloud-functions)
6. [Implementazione Email Verification](#implementazione-email-verification)
7. [Implementazione Email Transazionali](#implementazione-email-transazionali)
8. [Template Riutilizzabile](#template-riutilizzabile)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## 1. Panoramica del Sistema

Play-Sport Pro utilizza **DUE sistemi email distinti**:

### 🔐 Sistema 1: Firebase Authentication Email Verification
- **Provider**: Firebase Authentication (gestito da Google)
- **Scopo**: Verifica email utente durante registrazione
- **Configurazione**: Firebase Console
- **Dominio mittente**: `noreply@m-padelweb.firebaseapp.com` (di default)
- **Personalizzazione**: Possibile via Firebase Console > Authentication > Templates
- **Costo**: Incluso nel piano Firebase (gratuito)
- **Codice**: `src/services/auth.jsx` - funzione `sendVerificationEmail()`

### 📨 Sistema 2: Email Transazionali via Cloud Functions
- **Provider**: SMTP esterno (Register.it, SendGrid, Gmail, etc.)
- **Scopo**: Notifiche personalizzate (certificati, booking, etc.)
- **Configurazione**: Firebase Secrets + Cloud Functions
- **Dominio mittente**: Configurabile (es. `noreply@play-sport.pro`)
- **Personalizzazione**: Completa tramite HTML templates
- **Costo**: Dipende dal provider SMTP
- **Codice**: `functions/sendBulkNotifications.clean.js`

---

## 2. Architettura Email Verification

### 2.1 Flusso Completo

```
┌─────────────────┐
│ RegisterPage.jsx│
│  (Frontend)     │
└────────┬────────┘
         │
         │ 1. createUserWithEmailAndPassword()
         ▼
┌─────────────────┐
│ Firebase Auth   │
│ (Google Cloud)  │
└────────┬────────┘
         │
         │ 2. sendEmailVerification(user, options)
         ▼
┌─────────────────┐
│ Firebase Email  │
│ Service         │
└────────┬────────┘
         │
         │ 3. Invia email da noreply@m-padelweb.firebaseapp.com
         ▼
┌─────────────────┐
│  User Inbox     │
│ (Gmail, etc.)   │
└────────┬────────┘
         │
         │ 4. Click link verifica
         ▼
┌─────────────────┐
│ Firebase Auth   │
│ verifica token  │
└────────┬────────┘
         │
         │ 5. emailVerified = true
         ▼
┌─────────────────┐
│ User Dashboard  │
└─────────────────┘
```

### 2.2 Componenti Coinvolti

#### A. `src/services/auth.jsx`
**File**: `src/services/auth.jsx` (linee 515-530)

```javascript
/**
 * Send email verification to user
 * @param {Object} user - Firebase user object
 * @returns {Promise<void>}
 */
export async function sendVerificationEmail(user) {
  if (!user) throw new Error('User is required');

  console.log('📧 [sendVerificationEmail] Sending verification email to:', user.email);

  try {
    await sendEmailVerification(user, {
      url: window.location.origin + '/dashboard',  // URL di redirect dopo verifica
      handleCodeInApp: false,                       // Non gestire il codice nell'app
    });
    console.log('✅ [sendVerificationEmail] Email sent successfully');
  } catch (error) {
    console.error('❌ [sendVerificationEmail] Error:', error);
    throw error;
  }
}
```

**Parametri Chiave**:
- `url`: URL dove l'utente viene reindirizzato dopo la verifica (es. `/dashboard`)
- `handleCodeInApp`: Se `true`, il link può essere intercettato dall'app mobile

#### B. `src/pages/RegisterPage.jsx`
**File**: `src/pages/RegisterPage.jsx` (linee 244-252)

```javascript
// Step 3: Send email verification
console.log('📧 [DEBUG] Sending verification email...');
try {
  await sendVerificationEmail(userCredential?.user || user);
  console.log('✅ [DEBUG] Verification email sent successfully');
} catch (emailError) {
  console.error('⚠️ [DEBUG] Error sending verification email:', emailError);
  // Non-blocking error - continue with registration
}
```

**Caratteristiche**:
- ✅ **Non-blocking**: Se l'email fallisce, la registrazione continua
- ✅ **Retry**: L'utente può richiedere il reinvio tramite `resendVerificationEmail()`
- ✅ **Logging**: Tutti i passaggi sono tracciati per debugging

#### C. Funzione di Verifica
**File**: `src/services/auth.jsx` (linee 532-551)

```javascript
/**
 * Check if user email is verified
 * Bypassa il controllo se l'utente ha il flag skipEmailVerification
 * @param {Object} user - Firebase user object
 * @returns {boolean}
 */
export function isEmailVerified(user) {
  console.log('🔍 [isEmailVerified] Checking email verification:', {
    email: user?.email,
    emailVerified: user?.emailVerified,
    skipEmailVerification: user?.skipEmailVerification,
  });

  // Se il super admin ha disabilitato la validazione per questo utente
  if (user?.skipEmailVerification === true) {
    console.log('✅ [isEmailVerified] Email verification SKIPPED (admin override)');
    return true;
  }

  const verified = user?.emailVerified === true;
  console.log(
    `${verified ? '✅' : '❌'} [isEmailVerified] Email ${verified ? 'verified' : 'NOT verified'}`
  );
  return verified;
}
```

**Features**:
- ✅ **Admin Override**: Il super admin può bypassare la verifica con flag `skipEmailVerification`
- ✅ **Logging Dettagliato**: Ogni controllo è tracciato

#### D. Reinvio Email
**File**: `src/services/auth.jsx` (linee 556-572)

```javascript
/**
 * Resend verification email
 * @param {Object} user - Firebase user object
 * @returns {Promise<void>}
 */
export async function resendVerificationEmail(user) {
  if (!user) throw new Error('User is required');

  if (user.emailVerified) {
    console.log('ℹ️ Email already verified');
    return;
  }

  return await sendVerificationEmail(user);
}
```

---

## 3. Architettura Email Transazionali

### 3.1 Flusso Completo

```
┌──────────────────────────┐
│ MedicalCertificatesManager│
│       (Frontend)          │
└────────────┬─────────────┘
             │
             │ 1. httpsCallable('sendBulkCertificateNotifications')
             ▼
┌──────────────────────────┐
│  Cloud Function          │
│  (Google Cloud)          │
│  us-central1             │
└────────────┬─────────────┘
             │
             │ 2. getEmailConfig() - Lazy init
             ▼
┌──────────────────────────┐
│  Email Provider          │
│  Detection               │
│  @play-sport.pro?        │
│  Yes: Register.it        │
│  No: Gmail/SendGrid      │
└────────────┬─────────────┘
             │
             │ 3. sendEmailNotification(player, club, status)
             ▼
┌──────────────────────────┐
│  SMTP Server             │
│  (Register.it:587)       │
│  smtp@play-sport.pro     │
└────────────┬─────────────┘
             │
             │ 4. Send HTML email
             ▼
┌──────────────────────────┐
│  User Inbox              │
│  FROM: noreply@play-     │
│        sport.pro         │
│  REPLY-TO: info@         │
│            sportingcat.it│
└──────────────────────────┘
```

### 3.2 Componenti Coinvolti

#### A. `functions/sendBulkNotifications.clean.js` - Email Configuration
**File**: `functions/sendBulkNotifications.clean.js` (linee 26-91)

```javascript
// =============================================
// CONFIGURAZIONE EMAIL (runtime, dopo che i secrets sono caricati)
// =============================================
let emailConfig = null;

function getEmailConfig() {
  if (!emailConfig) {
    const SENDGRID_ENABLED = !!process.env.SENDGRID_API_KEY;
    const NODEMAILER_ENABLED = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
    const EMAIL_USER = process.env.EMAIL_USER || '';
    const FROM_EMAIL = process.env.FROM_EMAIL || EMAIL_USER || 'noreply@play-sport.pro';
    
    // Detect provider: Register.it for @play-sport.pro, Gmail otherwise
    const emailUser = String(EMAIL_USER).toLowerCase();
    const fromEmail = String(FROM_EMAIL).toLowerCase();
    const useRegisterIt = emailUser.endsWith('@play-sport.pro') || fromEmail.endsWith('@play-sport.pro');
    
    console.log('🔧 [Email Config]', {
      sendgridEnabled: SENDGRID_ENABLED,
      nodemailerEnabled: NODEMAILER_ENABLED,
      fromEmail: FROM_EMAIL,
      provider: useRegisterIt ? 'Register.it' : 'Gmail',
    });

    if (SENDGRID_ENABLED) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }

    let transporter = null;
    if (NODEMAILER_ENABLED) {
      if (useRegisterIt) {
        // Register.it SMTP configuration - porta 587 con STARTTLS
        const host = process.env.SMTP_HOST || 'smtp.register.it';
        const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
        const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : false;
        
        transporter = nodemailer.createTransport({
          host,
          port,
          secure, // false for STARTTLS
          requireTLS: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false, // For debugging - remove in production if it works
          },
          connectionTimeout: 30000, // 30 secondi
          greetingTimeout: 15000,
          socketTimeout: 30000,
          logger: true, // Enable debugging
        });
      } else {
        // Gmail configuration
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
      }
    }

    emailConfig = {
      sendgridEnabled: SENDGRID_ENABLED,
      nodemailerEnabled: NODEMAILER_ENABLED,
      fromEmail: FROM_EMAIL,
      transporter,
    };
  }
  return emailConfig;
}
```

**Caratteristiche Chiave**:
- ✅ **Lazy Initialization**: Config caricata solo quando necessaria (dopo che secrets sono disponibili)
- ✅ **Multi-Provider**: Supporta SendGrid, Gmail, Register.it
- ✅ **Auto-Detection**: Rileva automaticamente il provider dal dominio email
- ✅ **Caching**: Config caricata una sola volta per performance

#### B. Email Sending Function
**File**: `functions/sendBulkNotifications.clean.js` (linee 254-325)

```javascript
async function sendEmailNotification(player, club, status) {
  const { email, name } = player;
  if (!email || !email.includes('@')) {
    throw new Error('Email non valida');
  }

  const { daysUntilExpiry, expiryDate } = status || {};
  const isMissing = status?.type === 'missing' || expiryDate == null;
  const isExpired = !isMissing && typeof daysUntilExpiry === 'number' && daysUntilExpiry < 0;
  const isExpiring = !isMissing && typeof daysUntilExpiry === 'number' && daysUntilExpiry >= 0;

  let subject = '';
  let htmlBody = '';

  // Costruzione subject e body basato su status
  if (isMissing) {
    subject = `Certificato Medico Mancante - ${club.name}`;
    htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #d32f2f;">Certificato Medico Mancante</h2>
          <p>Gentile <strong>${name}</strong>,</p>
          <p>Non risulta caricato il tuo certificato medico per il club <strong>${club.name}</strong>.</p>
          <p>Ti invitiamo a caricarlo al più presto tramite l'app o contattando la segreteria.</p>
          <p>Cordiali saluti,<br/><strong>Team ${club.name}</strong></p>
        </body>
      </html>
    `;
  } else if (isExpired) {
    subject = `Certificato Medico Scaduto - ${club.name}`;
    htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #d32f2f;">Certificato Medico Scaduto</h2>
          <p>Gentile <strong>${name}</strong>,</p>
          <p>Il tuo certificato medico è scaduto il <strong>${new Date(expiryDate).toLocaleDateString('it-IT')}</strong>.</p>
          <p>Ti invitiamo a rinnovarlo al più presto per continuare a partecipare alle attività del club <strong>${club.name}</strong>.</p>
          <p>Cordiali saluti,<br/><strong>Team ${club.name}</strong></p>
        </body>
      </html>
    `;
  } else if (isExpiring) {
    subject = `Certificato Medico in Scadenza - ${club.name}`;
    htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #ff9800;">Certificato Medico in Scadenza</h2>
          <p>Gentile <strong>${name}</strong>,</p>
          <p>Il tuo certificato medico scadrà tra <strong>${daysUntilExpiry} giorni</strong> (il <strong>${new Date(expiryDate).toLocaleDateString('it-IT')}</strong>).</p>
          <p>Ti invitiamo a rinnovarlo per tempo per evitare interruzioni nelle attività del club <strong>${club.name}</strong>.</p>
          <p>Cordiali saluti,<br/><strong>Team ${club.name}</strong></p>
        </body>
      </html>
    `;
  }

  const config = getEmailConfig();
  const replyTo = club.contactEmail || club.email || 'info@sportingcat.it';

  // Invio con Nodemailer (priorità su SendGrid)
  if (config.nodemailerEnabled && config.transporter) {
    await config.transporter.sendMail({
      from: `"${club.name}" <${config.fromEmail}>`,
      to: email,
      replyTo,
      subject,
      html: htmlBody,
    });
    return;
  }

  // Fallback SendGrid
  if (config.sendgridEnabled) {
    await sgMail.send({
      from: { email: config.fromEmail, name: club.name },
      to: email,
      replyTo,
      subject,
      html: htmlBody,
    });
    return;
  }

  throw new Error('Nessun provider email configurato');
}
```

---

## 4. Configurazione Firebase Authentication

### 4.1 Firebase Console Setup

**Passaggi**:
1. Vai su [Firebase Console](https://console.firebase.google.com)
2. Seleziona progetto `m-padelweb`
3. **Authentication** > **Templates** > **Email address verification**

**Personalizzazioni Disponibili**:
- **Mittente**: Modifica da `noreply@m-padelweb.firebaseapp.com` a dominio custom
- **Nome Mittente**: Es. "Play-Sport Team"
- **Oggetto**: Personalizza testo
- **Body**: Template HTML personalizzabile con variabili:
  - `%LINK%` - Link di verifica
  - `%EMAIL%` - Email utente
  - `%APP_NAME%` - Nome app

### 4.2 Custom Domain (Opzionale)

Per usare `noreply@play-sport.pro` anche per email Firebase Auth:

**Firebase Console**:
1. **Authentication** > **Templates** > **Customize Email**
2. Clicca **"Customize domain"**
3. Aggiungi dominio `play-sport.pro`
4. Segui istruzioni DNS:
   ```
   Type: TXT
   Name: @
   Value: firebase-verification=xxxxxxx
   ```
5. Attendi verifica (24-48h)

**Vantaggi**:
- ✅ Brand consistency (tutte le email da @play-sport.pro)
- ✅ Maggiore deliverability
- ✅ Professionalità

---

## 5. Configurazione SMTP per Cloud Functions

### 5.1 Firebase Secrets

**Setup Secrets**:

```bash
# EMAIL_USER - Username SMTP
firebase functions:secrets:set EMAIL_USER
# Input: smtp@play-sport.pro (per Register.it) o email@gmail.com (per Gmail)

# EMAIL_PASSWORD - Password SMTP
firebase functions:secrets:set EMAIL_PASSWORD
# Input: Password SMTP (Register.it) o App Password (Gmail)

# FROM_EMAIL - Mittente visibile
firebase functions:secrets:set FROM_EMAIL
# Input: noreply@play-sport.pro
```

### 5.2 Provider: Register.it

**Configurazione Register.it**:

**Documenti Register.it**:
```
Nome utente: smtp@iltuodominio.ext
Password: quella creata nel Pannello di Controllo
Server SMTP: smtp.register.it
Porta: 587 (STARTTLS) o 465 (SSL)
```

**Secrets Firebase**:
```bash
EMAIL_USER=smtp@play-sport.pro
EMAIL_PASSWORD=Pa0011364958_  # Password da pannello Register.it
FROM_EMAIL=noreply@play-sport.pro
SMTP_HOST=smtp.register.it    # Opzionale, default già impostato
SMTP_PORT=587                  # Opzionale, default già impostato
```

**Caratteristiche**:
- ✅ **Dominio Custom**: Email inviate da @play-sport.pro
- ✅ **Pacchetto SMTP**: Necessario acquisto su Register.it
- ✅ **Invii Illimitati**: Dipende dal piano acquistato
- ⚠️ **Firewall**: Possibili timeout da alcuni IP (Google Cloud Functions OK)

### 5.3 Provider: Gmail

**Setup Gmail App Password**:

1. Account Gmail con 2FA attivo
2. [Google Account](https://myaccount.google.com/apppasswords)
3. Crea App Password:
   - Nome: "Play-Sport Firebase"
   - Tipo: Mail
4. Copia password (formato: `xxxx xxxx xxxx xxxx`)

**Secrets Firebase**:
```bash
EMAIL_USER=parischit85@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # App Password (rimuovi spazi)
FROM_EMAIL=parischit85@gmail.com    # Deve coincidere con EMAIL_USER
```

**Caratteristiche**:
- ✅ **Gratuito**: Fino a ~500 email/giorno
- ✅ **Setup Rapido**: 5 minuti
- ⚠️ **Limite Email**: 500/giorno per account Gmail gratuito
- ⚠️ **Brand**: Email inviate da @gmail.com (non professionale)

### 5.4 Provider: SendGrid (Raccomandato per Produzione)

**Setup SendGrid**:

1. [SendGrid Sign Up](https://sendgrid.com/pricing)
2. Piano Free: 100 email/giorno
3. **Settings** > **API Keys** > **Create API Key**
4. Nome: "Play-Sport-Firebase"
5. Permissions: **Full Access**
6. Copia API Key

**Secrets Firebase**:
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@play-sport.pro
```

**Caratteristiche**:
- ✅ **Affidabile**: 99.9% deliverability
- ✅ **Analytics**: Dashboard con statistiche
- ✅ **Scalabile**: Piani fino a milioni di email/mese
- ✅ **Dominio Custom**: Configurazione SPF/DKIM facile
- ⚠️ **Costo**: Gratis fino a 100/giorno, poi a pagamento

### 5.5 Aggiornare Secrets nella Cloud Function

**File**: `functions/sendBulkNotifications.clean.js`

```javascript
exports.sendBulkCertificateNotifications = onCall(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 300,
    secrets: [
      'EMAIL_USER',
      'EMAIL_PASSWORD', 
      'FROM_EMAIL',
      'VAPID_PUBLIC_KEY',
      'VAPID_PRIVATE_KEY',
      // 'SENDGRID_API_KEY',  // Decommentare se si usa SendGrid
    ],
  },
  async (request) => {
    // ... function code
  }
);
```

**Deploy**:
```bash
firebase deploy --only functions:sendBulkCertificateNotifications
```

---

## 6. Implementazione Email Verification

### 6.1 Step-by-Step Implementation

#### Step 1: Import Firebase Auth

```javascript
// src/services/auth.jsx
import { sendEmailVerification } from 'firebase/auth';
```

#### Step 2: Create Wrapper Function

```javascript
/**
 * Send email verification to user
 * @param {Object} user - Firebase user object from auth
 * @returns {Promise<void>}
 */
export async function sendVerificationEmail(user) {
  if (!user) throw new Error('User is required');

  console.log('📧 [sendVerificationEmail] Sending to:', user.email);

  try {
    await sendEmailVerification(user, {
      url: window.location.origin + '/dashboard',  // Redirect URL after verification
      handleCodeInApp: false,
    });
    console.log('✅ [sendVerificationEmail] Email sent successfully');
  } catch (error) {
    console.error('❌ [sendVerificationEmail] Error:', error);
    throw error;
  }
}
```

#### Step 3: Call During Registration

```javascript
// src/pages/RegisterPage.jsx
import { sendVerificationEmail } from '@services/auth.jsx';

async function handleRegister() {
  // 1. Create user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // 2. Update profile
  await updateProfile(userCredential.user, { displayName: fullName });
  
  // 3. Send verification email (non-blocking)
  try {
    await sendVerificationEmail(userCredential.user);
  } catch (error) {
    console.error('Email verification failed:', error);
    // Continue with registration even if email fails
  }
  
  // 4. Redirect to dashboard
  window.location.href = '/dashboard';
}
```

#### Step 4: Check Verification Status

```javascript
// src/services/auth.jsx
export function isEmailVerified(user) {
  // Admin override support
  if (user?.skipEmailVerification === true) {
    return true;
  }
  
  return user?.emailVerified === true;
}
```

#### Step 5: Resend Email

```javascript
// src/components/EmailVerificationBanner.jsx
import { resendVerificationEmail } from '@services/auth.jsx';

function EmailVerificationBanner() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);

  async function handleResend() {
    setSending(true);
    try {
      await resendVerificationEmail(user);
      alert('Email inviata! Controlla la tua casella.');
    } catch (error) {
      alert('Errore: ' + error.message);
    } finally {
      setSending(false);
    }
  }

  if (user?.emailVerified) return null;

  return (
    <div style={{ backgroundColor: '#fff3cd', padding: '1rem' }}>
      <p>Verifica la tua email per accedere a tutte le funzionalità.</p>
      <button onClick={handleResend} disabled={sending}>
        {sending ? 'Invio in corso...' : 'Invia di nuovo'}
      </button>
    </div>
  );
}
```

---

## 7. Implementazione Email Transazionali

### 7.1 Setup Cloud Function

#### Step 1: Create Email Config Function

```javascript
// functions/yourFunction.js
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

let emailConfig = null;

function getEmailConfig() {
  if (!emailConfig) {
    const SENDGRID_ENABLED = !!process.env.SENDGRID_API_KEY;
    const NODEMAILER_ENABLED = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
    const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@play-sport.pro';
    
    // Auto-detect provider based on email domain
    const emailUser = String(process.env.EMAIL_USER || '').toLowerCase();
    const useRegisterIt = emailUser.includes('@play-sport.pro');
    
    let transporter = null;
    if (NODEMAILER_ENABLED) {
      if (useRegisterIt) {
        // Register.it configuration
        transporter = nodemailer.createTransport({
          host: 'smtp.register.it',
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
      } else {
        // Gmail configuration
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
      }
    }
    
    if (SENDGRID_ENABLED) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }

    emailConfig = {
      sendgridEnabled: SENDGRID_ENABLED,
      nodemailerEnabled: NODEMAILER_ENABLED,
      fromEmail: FROM_EMAIL,
      transporter,
    };
  }
  
  return emailConfig;
}
```

#### Step 2: Create Send Email Function

```javascript
async function sendTransactionalEmail({ to, subject, html, replyTo }) {
  const config = getEmailConfig();
  
  // Priority 1: Nodemailer (SMTP)
  if (config.nodemailerEnabled && config.transporter) {
    await config.transporter.sendMail({
      from: `"Play-Sport" <${config.fromEmail}>`,
      to,
      replyTo: replyTo || config.fromEmail,
      subject,
      html,
    });
    return { provider: 'nodemailer', success: true };
  }
  
  // Priority 2: SendGrid
  if (config.sendgridEnabled) {
    await sgMail.send({
      from: { email: config.fromEmail, name: 'Play-Sport' },
      to,
      replyTo: replyTo || config.fromEmail,
      subject,
      html,
    });
    return { provider: 'sendgrid', success: true };
  }
  
  throw new Error('No email provider configured');
}
```

#### Step 3: Create Cloud Function

```javascript
import { onCall } from 'firebase-functions/v2/https';

export const sendNotificationEmail = onCall(
  {
    region: 'us-central1',
    secrets: ['EMAIL_USER', 'EMAIL_PASSWORD', 'FROM_EMAIL'],
  },
  async (request) => {
    const { to, subject, body, html } = request.data;
    
    // Validate auth
    if (!request.auth) {
      throw new Error('Unauthorized');
    }
    
    try {
      const result = await sendTransactionalEmail({
        to,
        subject,
        html: html || `<p>${body}</p>`,
      });
      
      return { success: true, ...result };
    } catch (error) {
      console.error('Email error:', error);
      return { success: false, error: error.message };
    }
  }
);
```

#### Step 4: Call from Frontend

```javascript
// src/features/notifications/sendEmail.js
import { getFunctions, httpsCallable } from 'firebase/functions';

export async function sendNotificationEmail(to, subject, html) {
  const functions = getFunctions();
  const sendEmail = httpsCallable(functions, 'sendNotificationEmail');
  
  try {
    const result = await sendEmail({ to, subject, html });
    console.log('Email sent:', result.data);
    return result.data;
  } catch (error) {
    console.error('Email failed:', error);
    throw error;
  }
}
```

---

## 8. Template Riutilizzabile

### 8.1 Base Email Template

```javascript
// functions/emailTemplates.js

/**
 * Base HTML template for all emails
 * @param {Object} params - Template parameters
 * @param {string} params.title - Email title
 * @param {string} params.body - Email body HTML
 * @param {string} params.footer - Footer text
 * @returns {string} HTML string
 */
export function baseEmailTemplate({ title, body, footer }) {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #1976d2;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      color: #1976d2;
      margin: 0;
      font-size: 24px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #1976d2;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      border-top: 1px solid #ddd;
      padding-top: 20px;
      margin-top: 30px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .alert {
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .alert-warning {
      background-color: #fff3cd;
      border-left: 4px solid #ff9800;
    }
    .alert-danger {
      background-color: #f8d7da;
      border-left: 4px solid #d32f2f;
    }
    .alert-info {
      background-color: #d1ecf1;
      border-left: 4px solid #0288d1;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      ${body}
    </div>
    <div class="footer">
      ${footer || 'Play-Sport Pro | La tua piattaforma di gestione sportiva'}
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Certificate expiry notification template
 */
export function certificateExpiryTemplate({ playerName, clubName, expiryDate, daysRemaining, isExpired }) {
  const alertClass = isExpired ? 'alert-danger' : 'alert-warning';
  const alertTitle = isExpired ? '⚠️ Certificato Scaduto' : '⏰ Certificato in Scadenza';
  
  const body = `
    <p>Gentile <strong>${playerName}</strong>,</p>
    
    <div class="alert ${alertClass}">
      <h3 style="margin-top: 0;">${alertTitle}</h3>
      <p>
        ${isExpired 
          ? `Il tuo certificato medico è scaduto il <strong>${new Date(expiryDate).toLocaleDateString('it-IT')}</strong>.`
          : `Il tuo certificato medico scadrà tra <strong>${daysRemaining} giorni</strong>, il <strong>${new Date(expiryDate).toLocaleDateString('it-IT')}</strong>.`
        }
      </p>
    </div>
    
    <p>
      ${isExpired
        ? 'Ti invitiamo a rinnovarlo al più presto per continuare a partecipare alle attività del club.'
        : 'Ti consigliamo di rinnovarlo per tempo per evitare interruzioni nelle tue attività.'
      }
    </p>
    
    <p>Per maggiori informazioni, contatta la segreteria del club <strong>${clubName}</strong>.</p>
    
    <p>Cordiali saluti,<br/><strong>Team ${clubName}</strong></p>
  `;
  
  return baseEmailTemplate({
    title: alertTitle,
    body,
    footer: `${clubName} | Powered by Play-Sport Pro`,
  });
}

/**
 * Welcome email template
 */
export function welcomeEmailTemplate({ playerName, clubName, verificationUrl }) {
  const body = `
    <p>Ciao <strong>${playerName}</strong>!</p>
    
    <div class="alert alert-info">
      <h3 style="margin-top: 0;">✅ Benvenuto in ${clubName}!</h3>
      <p>La tua registrazione è stata completata con successo.</p>
    </div>
    
    <p>Per attivare il tuo account, conferma il tuo indirizzo email:</p>
    
    <a href="${verificationUrl}" class="button">Verifica Email</a>
    
    <p>Se il pulsante non funziona, copia e incolla questo link nel tuo browser:</p>
    <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
    
    <p>Grazie per esserti unito a noi!</p>
    
    <p>Cordiali saluti,<br/><strong>Team ${clubName}</strong></p>
  `;
  
  return baseEmailTemplate({
    title: `Benvenuto in ${clubName}!`,
    body,
    footer: `${clubName} | Powered by Play-Sport Pro`,
  });
}

/**
 * Booking confirmation template
 */
export function bookingConfirmationTemplate({ 
  playerName, 
  courtName, 
  date, 
  time, 
  clubName,
  bookingId 
}) {
  const body = `
    <p>Gentile <strong>${playerName}</strong>,</p>
    
    <div class="alert alert-info">
      <h3 style="margin-top: 0;">✅ Prenotazione Confermata</h3>
      <p>La tua prenotazione è stata registrata con successo.</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: bold;">Campo:</td>
        <td style="padding: 10px;">${courtName}</td>
      </tr>
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: bold;">Data:</td>
        <td style="padding: 10px;">${new Date(date).toLocaleDateString('it-IT')}</td>
      </tr>
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: bold;">Ora:</td>
        <td style="padding: 10px;">${time}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold;">Codice:</td>
        <td style="padding: 10px;"><code>${bookingId}</code></td>
      </tr>
    </table>
    
    <p>Ci vediamo in campo!</p>
    
    <p>Cordiali saluti,<br/><strong>Team ${clubName}</strong></p>
  `;
  
  return baseEmailTemplate({
    title: 'Prenotazione Confermata',
    body,
    footer: `${clubName} | Powered by Play-Sport Pro`,
  });
}
```

### 8.2 Usage Example

```javascript
// functions/sendBulkNotifications.clean.js
import { certificateExpiryTemplate } from './emailTemplates.js';

async function sendCertificateEmail(player, club, status) {
  const html = certificateExpiryTemplate({
    playerName: player.name,
    clubName: club.name,
    expiryDate: status.expiryDate,
    daysRemaining: status.daysUntilExpiry,
    isExpired: status.daysUntilExpiry < 0,
  });
  
  await sendTransactionalEmail({
    to: player.email,
    subject: `Certificato Medico - ${club.name}`,
    html,
    replyTo: club.contactEmail,
  });
}
```

---

## 9. Best Practices

### 9.1 Email Deliverability

✅ **SPF/DKIM/DMARC**:
```dns
# SPF Record (Register.it example)
TXT @ "v=spf1 include:_spf.register.it ~all"

# DKIM Record (fornito da provider)
TXT default._domainkey "v=DKIM1; k=rsa; p=MIGfMA0GCS..."

# DMARC Record
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:admin@play-sport.pro"
```

✅ **Email Content**:
- Evita parole spam: "gratis", "urgente", "clicca qui"
- Ratio testo/HTML bilanciato (non solo immagini)
- Link brevi e chiari
- Oggetto descrittivo (max 50 caratteri)

✅ **Sender Reputation**:
- Riscalda IP gradualmente (aumenta volumi lentamente)
- Monitor bounce rate (<5%)
- Gestisci unsubscribe correttamente
- Pulisci liste email regolarmente

### 9.2 Security

✅ **Secrets Management**:
```javascript
// ❌ NEVER do this
const password = 'mypassword123';

// ✅ Use Firebase Secrets
const password = process.env.EMAIL_PASSWORD;
```

✅ **Input Validation**:
```javascript
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    throw new Error('Invalid email format');
  }
}
```

✅ **Rate Limiting**:
```javascript
const emailLimiter = new Map();

function checkRateLimit(userId) {
  const now = Date.now();
  const lastSent = emailLimiter.get(userId) || 0;
  
  if (now - lastSent < 60000) { // 1 minuto
    throw new Error('Too many emails. Please wait.');
  }
  
  emailLimiter.set(userId, now);
}
```

### 9.3 Performance

✅ **Lazy Loading**:
```javascript
// ✅ Load config only when needed
let emailConfig = null;

function getEmailConfig() {
  if (!emailConfig) {
    emailConfig = initializeEmailConfig();
  }
  return emailConfig;
}
```

✅ **Batch Processing**:
```javascript
// ❌ Send one by one
for (const user of users) {
  await sendEmail(user);
}

// ✅ Batch with concurrency limit
const limit = pLimit(5); // Max 5 concurrent
await Promise.all(
  users.map(user => limit(() => sendEmail(user)))
);
```

✅ **Caching**:
```javascript
// Cache email templates
const templateCache = new Map();

function getTemplate(name) {
  if (!templateCache.has(name)) {
    templateCache.set(name, loadTemplate(name));
  }
  return templateCache.get(name);
}
```

### 9.4 Error Handling

✅ **Graceful Degradation**:
```javascript
async function sendEmailWithFallback(options) {
  try {
    // Try primary provider
    await sendViaNodemailer(options);
  } catch (error) {
    console.warn('Nodemailer failed, trying SendGrid...', error);
    try {
      await sendViaSendGrid(options);
    } catch (fallbackError) {
      console.error('All email providers failed:', fallbackError);
      throw new Error('Email delivery failed');
    }
  }
}
```

✅ **Retry Logic**:
```javascript
async function sendEmailWithRetry(options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sendEmail(options);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 9.5 Monitoring

✅ **Logging**:
```javascript
console.log('📧 [Email]', {
  to: email,
  subject,
  provider: 'nodemailer',
  timestamp: new Date().toISOString(),
});
```

✅ **Metrics**:
```javascript
// Track email success/failure
const emailMetrics = {
  sent: 0,
  failed: 0,
  bounced: 0,
};

function trackEmailSent(success) {
  if (success) {
    emailMetrics.sent++;
  } else {
    emailMetrics.failed++;
  }
}
```

---

## 10. Troubleshooting

### 10.1 Email Non Ricevuta

**Diagnosi**:
```javascript
// 1. Check logs
firebase functions:log --only sendBulkCertificateNotifications

// 2. Test SMTP connection
node functions/test-smtp.js

// 3. Verify secrets
firebase functions:secrets:access EMAIL_USER
```

**Soluzioni**:
- ✅ Controlla spam/junk folder
- ✅ Verifica SPF/DKIM
- ✅ Test con email diversa (gmail.com, outlook.com)
- ✅ Check provider limits

### 10.2 Connection Timeout

**Errore**:
```
❌ Failed: connect ETIMEDOUT 195.110.124.132:587
```

**Cause**:
- Firewall blocca porta SMTP
- IP blacklistato
- Credenziali errate
- Server SMTP down

**Soluzioni**:
```javascript
// 1. Aumenta timeout
transporter = nodemailer.createTransport({
  host: 'smtp.register.it',
  port: 587,
  connectionTimeout: 30000, // 30 secondi
});

// 2. Prova porta alternativa
port: 465, // SSL invece di STARTTLS

// 3. Usa SendGrid come fallback
if (config.nodemailerEnabled) {
  try {
    await sendViaNodemailer();
  } catch (error) {
    await sendViaSendGrid();
  }
}
```

### 10.3 Invalid Credentials

**Errore**:
```
535-5.7.8 Username and Password not accepted
```

**Soluzioni**:
- ✅ Gmail: Usa App Password (non password normale)
- ✅ Register.it: Usa `smtp@dominio.ext` come username
- ✅ Verifica secrets aggiornati
- ✅ Redeploy funzione dopo cambio secrets

### 10.4 Email in Spam

**Diagnosi**:
```bash
# Check SPF/DKIM
dig TXT play-sport.pro
dig TXT default._domainkey.play-sport.pro
```

**Soluzioni**:
- ✅ Configura SPF: `v=spf1 include:_spf.register.it ~all`
- ✅ Abilita DKIM dal pannello provider
- ✅ Aggiungi DMARC: `v=DMARC1; p=quarantine`
- ✅ Riscalda IP gradualmente
- ✅ Evita contenuti spam

### 10.5 Rate Limiting

**Errore**:
```
421 4.7.0 Too many emails sent
```

**Soluzioni**:
```javascript
// Batch con rate limiting
import pLimit from 'p-limit';

const limit = pLimit(5); // Max 5 concurrent emails

async function sendBulkEmails(users) {
  const results = await Promise.all(
    users.map(user => 
      limit(async () => {
        try {
          await sendEmail(user);
          await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
          return { success: true, email: user.email };
        } catch (error) {
          return { success: false, email: user.email, error };
        }
      })
    )
  );
  
  return results;
}
```

---

## 📚 Riferimenti

### Firebase Documentation
- [Firebase Auth Email Verification](https://firebase.google.com/docs/auth/web/email-link-auth)
- [Firebase Cloud Functions Secrets](https://firebase.google.com/docs/functions/config-env)
- [Firebase Custom Email Templates](https://firebase.google.com/docs/auth/custom-email-handler)

### Provider Documentation
- [Register.it SMTP](https://www.register.it/assistenza/smtp)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid API](https://docs.sendgrid.com/for-developers/sending-email/api-getting-started)

### Libraries
- [Nodemailer Documentation](https://nodemailer.com/about/)
- [SendGrid Node.js](https://github.com/sendgrid/sendgrid-nodejs)

---

## ✅ Checklist Implementazione

### Email Verification (Firebase Auth)
- [ ] Firebase Auth configurato
- [ ] Template personalizzato (opzionale)
- [ ] Funzione `sendVerificationEmail()` implementata
- [ ] Funzione `isEmailVerified()` implementata
- [ ] Funzione `resendVerificationEmail()` implementata
- [ ] Banner verifica email in UI
- [ ] Test su utenti reali

### Email Transazionali (Cloud Functions)
- [ ] Provider SMTP scelto (Register.it/Gmail/SendGrid)
- [ ] Secrets configurati (`EMAIL_USER`, `EMAIL_PASSWORD`, `FROM_EMAIL`)
- [ ] SPF/DKIM configurati (opzionale ma raccomandato)
- [ ] Funzione `getEmailConfig()` implementata
- [ ] Funzione `sendTransactionalEmail()` implementata
- [ ] Template HTML creati
- [ ] Cloud Function deployata
- [ ] Test invio email
- [ ] Monitoring/logging attivo

---

## 🎯 Conclusioni

Questo documento fornisce una **roadmap completa** per implementare sistemi email sia per **verifica account** (Firebase Auth) che per **notifiche transazionali** (Cloud Functions + SMTP).

**Key Takeaways**:

1. **Firebase Auth Email Verification**:
   - ✅ Gestito completamente da Firebase
   - ✅ Zero configurazione SMTP richiesta
   - ✅ Gratuito e affidabile
   - ⚠️ Limitata personalizzazione

2. **Email Transazionali Custom**:
   - ✅ Controllo completo su design e contenuto
   - ✅ Multi-provider support (fallback)
   - ✅ Dominio custom (@play-sport.pro)
   - ⚠️ Richiede configurazione SMTP

3. **Register.it vs Gmail vs SendGrid**:
   - **Register.it**: Dominio custom, professionale, possibili timeout
   - **Gmail**: Gratis, setup rapido, limite 500/giorno, non professionale
   - **SendGrid**: Affidabile, scalabile, analytics, gratis fino a 100/giorno

**Raccomandazione Finale**:
- **Sviluppo/Test**: Gmail (setup rapido)
- **Produzione**: SendGrid (affidabilità) o Register.it (se già acquistato)
- **Verifica Email**: Firebase Auth (sempre)

---

*Documento creato: 2025-11-09*  
*Versione: 1.0*  
*Autore: Senior Developer Assistant*
