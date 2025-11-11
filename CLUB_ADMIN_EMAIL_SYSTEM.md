# 📧 Sistema Email Club Admin - Documentazione Tecnica

## 📋 Panoramica

Il sistema di invio messaggi email da club admin utilizza **esattamente lo stesso schema** dell'email di verifica registrazione. Questo garantisce:

- ✅ **Stessa affidabilità** - Riutilizza la configurazione email già testata
- ✅ **Stesso mittente** - `noreply@play-sport.pro` (come verifica email)
- ✅ **Stesso fallback** - Nodemailer (SMTP) con fallback a SendGrid
- ✅ **Stessa manutenzione** - Una sola configurazione secrets per tutti gli invii

---

## 🏗️ Architettura

### Schema Funzionale

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLOUD FUNCTIONS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Firebase Auth Email Verification    │  Admin Club Messages     │
│  (sendEmailVerification)              │  (sendClubEmail)        │
│          ↓                             │         ↓               │
│     noreply@play-sport.pro ←───────────────────────┘           │
│                                                                   │
│  Firebase Secrets:                                              │
│  • EMAIL_USER           (smtp@play-sport.pro)                 │
│  • EMAIL_PASSWORD       (Password SMTP)                         │
│  • FROM_EMAIL           (noreply@play-sport.pro)              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Flusso Invio Email da Club Admin

```
┌────────────────────────────────┐
│  Frontend                       │
│  SendEmailModal.jsx             │
│  (Club admin seleziona giocatori│
│   e scrive messaggio)           │
└────────────┬────────────────────┘
             │
             │ httpsCallable('sendClubEmail')
             ▼
┌────────────────────────────────┐
│  Cloud Function                 │
│  functions/sendClubEmail.js     │
│  (Valida permessi, prepara HTML,│
│   risolve destinatari)          │
└────────────┬────────────────────┘
             │
             │ getEmailConfig()
             ▼
┌────────────────────────────────┐
│  Email Provider (Multi-provider)│
│  • Priority 1: Nodemailer SMTP  │
│    (Register.it: smtp.register.it:587)
│  • Priority 2: SendGrid API     │
│    (Fallback automatico)        │
└────────────┬────────────────────┘
             │
             │ Invia email
             ▼
┌────────────────────────────────┐
│  SMTP Server                    │
│  smtp.register.it or SendGrid   │
└────────────┬────────────────────┘
             │
             │ Relay a mittente
             ▼
┌────────────────────────────────┐
│  Email FROM Header              │
│  "Club Name" <noreply@...pro>  │
│  (Stesso mittente di verifica)  │
└────────────┬────────────────────┘
             │
             │ Invia email
             ▼
┌────────────────────────────────┐
│  User Inbox                     │
│  (Gmail, Outlook, etc.)         │
└────────────────────────────────┘
```

---

## 📁 File Coinvolti

### Backend (Cloud Functions)

| File | Linea | Funzione | Ruolo |
|------|-------|----------|-------|
| `functions/index.js` | 14 | - | Esporta `sendClubEmail` |
| `functions/sendClubEmail.js` | 1-284 | `sendClubEmail` | Cloud function principale |
| `functions/sendClubEmail.js` | 24-93 | `getEmailConfig()` | Carica config email dai secrets |
| `functions/sendClubEmail.js` | 100-150 | `checkAdminPermissions()` | Valida se utente è admin club |
| `functions/sendClubEmail.js` | 157-188 | `sendEmailNotification()` | Invia email via Nodemailer/SendGrid |

### Frontend

| File | Linea | Componente | Ruolo |
|------|-------|-----------|-------|
| `src/features/admin/components/SendEmailModal.jsx` | 1-250+ | `SendEmailModal` | Modal per invio messaggi |
| `src/features/admin/components/SendEmailModal.jsx` | 40 | - | Chiama `httpsCallable('sendClubEmail')` |

### Configurazione

| Secret Firebase | Valore | Ruolo |
|-----------------|--------|-------|
| `EMAIL_USER` | `smtp@play-sport.pro` | Username SMTP (Register.it) |
| `EMAIL_PASSWORD` | `*****` | Password SMTP (Register.it) |
| `FROM_EMAIL` | `noreply@play-sport.pro` | Email mittente visibile |

---

## 🔐 Permessi Admin

La funzione `checkAdminPermissions()` controlla se un utente è admin del club verificando **6 canali diversi**:

```javascript
1. isOwner                  // Proprietario del club
2. isAdminFromClub          // Campo "admins" in clubs/{id}
3. isAdminFromEmailList     // Email in clubs/{id}.adminEmails[]
4. isAdminFromMembership    // clubs/{clubId}/users/{userId}.role='club_admin'
5. isAdminFromProfile       // clubs/{clubId}/profiles/{userId}.role='club_admin'
6. isAdminFromAffiliation   // affiliations/{userId}_{clubId}.role='club_admin'
```

Se **ALMENO UNO** è true → `isAdmin = true` ✅

---

## 📧 Configurazione Email

### Option 1: Register.it (SMTP) - **CONSIGLIATO**

```bash
firebase functions:secrets:set EMAIL_USER
# Input: smtp@play-sport.pro

firebase functions:secrets:set EMAIL_PASSWORD
# Input: Pa******* (password da pannello Register.it)

firebase functions:secrets:set FROM_EMAIL
# Input: noreply@play-sport.pro
```

**Vantaggi:**
- ✅ Dominio custom (@play-sport.pro)
- ✅ Affidabile
- ✅ Professionale

### Option 2: Gmail (SMTP) - **ALTERNATIVA**

```bash
firebase functions:secrets:set EMAIL_USER
# Input: tuaemail@gmail.com

firebase functions:secrets:set EMAIL_PASSWORD
# Input: xxxx xxxx xxxx xxxx (App Password)

firebase functions:secrets:set FROM_EMAIL
# Input: noreply@play-sport.pro
```

**Limitazioni:**
- ⚠️ Limite ~500 email/giorno
- ⚠️ Email inviata da gmail.com (non professionale)

### Option 3: SendGrid (API) - **FALLBACK**

```bash
firebase functions:secrets:set SENDGRID_API_KEY
# Input: SG.xxxxxxxxxxxxxxxxxxxxxxxx

firebase functions:secrets:set FROM_EMAIL
# Input: noreply@play-sport.pro
```

---

## 🧪 Test

### Test Locale (Emulatore Firebase)

```bash
cd functions

# Start Firebase emulator
firebase emulators:start --only functions

# In another terminal, test the function
curl -X POST http://localhost:5001/m-padelweb/us-central1/sendClubEmail \
  -H "Content-Type: application/json" \
  -d '{
    "clubId": "test-club-id",
    "recipients": [{"email": "test@example.com", "name": "Test User"}],
    "subject": "Test Email",
    "body": "This is a test message",
    "isHTML": false
  }'
```

### Test Production (Firebase Cloud)

```bash
# Deploy
firebase deploy --only functions:sendClubEmail

# Check logs
firebase functions:log --only sendClubEmail --limit 20

# Manual test via Firebase Console:
# 1. Vai su Cloud Functions
# 2. Seleziona sendClubEmail
# 3. Clicca "TESTING"
# 4. Incolla il body sopra
# 5. Clicca "EXECUTE"
```

### Test Frontend

1. Accedi come club admin
2. Vai a Admin Dashboard > Gestisci Giocatori
3. Seleziona uno o più giocatori
4. Clicca "📧 Invia Email"
5. Compila il form e invia

**Verifica:**
- ✅ Email ricevuta in inbox giocatore
- ✅ Mittente: "Club Name" <noreply@play-sport.pro>
- ✅ Soggetto corrisponde a quello inserito
- ✅ Corpo del messaggio formattato correttamente

---

## 🔍 Troubleshooting

### Problema: "Email non ricevuta"

**Cause:**
1. ❌ Admin non ha permessi
2. ❌ Secrets non configurati
3. ❌ Email destinatario non valida
4. ❌ Email in spam

**Soluzione:**
```bash
# 1. Verifica secrets
firebase functions:secrets:access EMAIL_USER
firebase functions:secrets:access EMAIL_PASSWORD
firebase functions:secrets:access FROM_EMAIL

# 2. Verifica logs
firebase functions:log --only sendClubEmail

# 3. Check se admin
# Vai su Firestore:
# clubs/{clubId}/users/{userId}
# role dovrebbe essere 'admin' o 'club_admin'

# 4. Riinserisci secrets se non configurati
firebase functions:secrets:set EMAIL_USER
# ... e ripeti per tutti e 3

# 5. Redeploy
firebase deploy --only functions:sendClubEmail
```

### Problema: "Permission denied"

**Causa:** Utente non è admin del club

**Soluzione:**
```javascript
// Verifica in Firestore:
// Almeno uno di questi deve esistere:
1. clubs/{clubId}.ownerId === userId
2. clubs/{clubId}.admins[] includes userId
3. clubs/{clubId}.adminEmails[] includes user.email
4. clubs/{clubId}/users/{userId}.role = 'club_admin'
5. clubs/{clubId}/profiles/{userId}.role = 'club_admin'
6. affiliations/{userId}_{clubId}.role = 'club_admin'
```

### Problema: "No email provider configured"

**Causa:** Nessun secret configurato

**Soluzione:**
```bash
# Configura almeno UNO tra:

# Option 1: Register.it SMTP (raccomandato)
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_PASSWORD
firebase functions:secrets:set FROM_EMAIL

# O Option 2: SendGrid
firebase functions:secrets:set SENDGRID_API_KEY
firebase functions:secrets:set FROM_EMAIL

# Redeploy
firebase deploy --only functions:sendClubEmail
```

---

## 📊 Confronto: Email Verifica vs Club Messages

| Aspetto | Email Verifica | Club Messages |
|---------|----------------|---------------|
| **Provider** | Firebase Auth | Cloud Function |
| **Mittente** | noreply@m-padelweb.firebaseapp.com (o custom domain) | noreply@play-sport.pro |
| **Template** | Firebase standard | Custom HTML |
| **Fallback** | N/A | Nodemailer → SendGrid |
| **Autorizzazione** | Firebase Auth | Admin club check |
| **Destinatari** | Singolo utente | Batch (multiple utenti) |
| **Config** | Firebase Console | Firebase Secrets |

---

## ✅ Checklist Implementazione

- [x] Cloud function `sendClubEmail` creata
- [x] Esportata in `functions/index.js`
- [x] Email config identica a `sendBulkNotifications.clean.js`
- [x] Multi-provider support (Nodemailer + SendGrid fallback)
- [x] Permission check su 6 canali
- [x] Frontend `SendEmailModal.jsx` implementato
- [x] HTML template builder incluso
- [x] Rate limiting (200ms tra email)
- [x] Error handling robusto
- [x] Logging dettagliato

---

## 🚀 Deployment Checklist

Prima di deployare in produzione:

1. **Secrets configurati:**
   - [ ] `EMAIL_USER` (SMTP username)
   - [ ] `EMAIL_PASSWORD` (SMTP password)
   - [ ] `FROM_EMAIL` (noreply@play-sport.pro)

2. **Testing completato:**
   - [ ] Email ricevuta correttamente
   - [ ] Mittente è "Club Name" <noreply@play-sport.pro>
   - [ ] Subject e body sono corretti
   - [ ] Fallback SendGrid funziona (opzionale)

3. **Permessi verificati:**
   - [ ] Solo admin club possono inviare
   - [ ] Logs mostrano autorizzazione corretta

4. **Deploy:**
   ```bash
   firebase deploy --only functions:sendClubEmail
   ```

5. **Verifica post-deploy:**
   ```bash
   firebase functions:log --only sendClubEmail
   ```

---

## 📚 Riferimenti

- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [Nodemailer Documentation](https://nodemailer.com/)
- [SendGrid API Documentation](https://docs.sendgrid.com/)
- [Register.it SMTP Setup](https://www.register.it/assistenza/smtp)

---

*Documentazione creata: 2025-11-09*  
*Versione: 1.0*
