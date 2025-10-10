# ⚠️ FIX CONFIGURAZIONE EMAIL - PROBLEMA RILEVATO

## ❌ PROBLEMA ATTUALE

**Configurazione attuale NON FUNZIONANTE:**
```
EMAIL_USER: Gmail account (parischit85@gmail.com)
EMAIL_PASSWORD: Google App Password
FROM_EMAIL: noreplay@play-sport.pro (su Register.it)
```

**Perché non funziona:**
Gmail **NON PUÒ** inviare email usando come mittente un indirizzo email che non è @gmail.com, specialmente se quell'indirizzo è su un altro provider (Register.it).

---

## 🎯 SOLUZIONE A - USA GMAIL COME MITTENTE (Veloce - 2 minuti)

### ✅ Vantaggi:
- ✅ Funziona IMMEDIATAMENTE
- ✅ Zero configurazione aggiuntiva
- ✅ Secrets già configurati
- ✅ Perfetto per TEST e SVILUPPO

### ⚠️ Svantaggi:
- Email arrivano DA: `parischit85@gmail.com`
- Meno professionale per produzione
- Alcuni utenti potrebbero non fidarsi

### 🔧 Setup:

```powershell
# 1. Riconfigura FROM_EMAIL con l'indirizzo Gmail
firebase functions:secrets:set FROM_EMAIL
# Inserisci: parischit85@gmail.com

# 2. Re-deploy la function
firebase deploy --only functions:dailyCertificateCheck

# 3. Testa
# La function invierà email DA e CON parischit85@gmail.com
```

### 📧 Risultato:
```
FROM: parischit85@gmail.com
TO: giocatore@example.com
SUBJECT: [URGENTE] Certificato Medico in Scadenza
```

---

## 🎯 SOLUZIONE B - SMTP REGISTER.IT (Professionale - 10 minuti)

### ✅ Vantaggi:
- ✅ Email DA: `noreplay@play-sport.pro` (professionale)
- ✅ Usa il dominio ufficiale
- ✅ Maggiore credibilità

### ⚠️ Svantaggi:
- Richiede configurazione SMTP Register.it
- Serve accesso al pannello Register.it
- Possibili limiti giornalieri (verifica piano)

### 🔧 Setup:

#### Step 1: Trova credenziali SMTP Register.it

Accedi al pannello Register.it e trova:
- **SMTP Server**: `smtp.register.it` (di solito)
- **SMTP Port**: `587` (TLS) o `465` (SSL)
- **SMTP User**: `noreplay@play-sport.pro`
- **SMTP Password**: (password della casella email)

#### Step 2: Modifica Cloud Function

```javascript
// functions/scheduledCertificateReminders.js
// Aggiorna configurazione Nodemailer

const transporter = nodemailer.createTransport({
  host: 'smtp.register.it',        // ← SMTP Server Register.it
  port: 587,                        // ← Porta TLS
  secure: false,                    // ← false per port 587 (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,   // noreplay@play-sport.pro
    pass: process.env.EMAIL_PASSWORD // Password casella Register.it
  },
  tls: {
    rejectUnauthorized: false       // ← Solo se necessario
  }
});
```

#### Step 3: Riconfigura Secrets

```powershell
# 1. Riconfigura EMAIL_USER con email Register.it
firebase functions:secrets:set EMAIL_USER
# Inserisci: noreplay@play-sport.pro

# 2. Riconfigura EMAIL_PASSWORD con password Register.it
firebase functions:secrets:set EMAIL_PASSWORD
# Inserisci: [password casella Register.it]

# 3. FROM_EMAIL è già corretto (noreplay@play-sport.pro)

# 4. Re-deploy
firebase deploy --only functions:dailyCertificateCheck
```

### 📧 Risultato:
```
FROM: noreplay@play-sport.pro
TO: giocatore@example.com
SUBJECT: [URGENTE] Certificato Medico in Scadenza
```

### ⚠️ IMPORTANTE:
- Verifica i **limiti di invio giornalieri** sul piano Register.it
- Controlla che la casella `noreplay@play-sport.pro` esista e sia attiva
- Alcuni provider SMTP potrebbero bloccare invii automatici

---

## 🎯 SOLUZIONE C - SENDGRID (CONSIGLIATO PRODUZIONE - 15 minuti)

### ✅ Vantaggi:
- ✅ **100 email/giorno GRATIS** per sempre
- ✅ Email DA dominio verificato (play-sport.pro)
- ✅ **Alta deliverability** (meno spam)
- ✅ Analytics dettagliati (open rate, click rate)
- ✅ Template professionali
- ✅ Scalabile (fino a 40.000 email/mese nel free tier dopo verifica)

### ⚠️ Svantaggi:
- Richiede account SendGrid
- Richiede verifica dominio DNS (TXT record)
- Setup iniziale più lungo (ma vale la pena)

### 🔧 Setup:

#### Step 1: Crea Account SendGrid

1. Vai su: https://signup.sendgrid.com/
2. Registrati (GRATIS)
3. Verifica email
4. Accedi alla Dashboard

#### Step 2: Crea API Key

1. Vai su: **Settings** → **API Keys**
2. Clicca **"Create API Key"**
3. Nome: `play-sport-certificates`
4. Permissions: **Full Access** (o **Mail Send** only)
5. Clicca **"Create & View"**
6. **COPIA LA KEY** (appare solo una volta!)

#### Step 3: Verifica Sender Identity

**Opzione A - Single Sender (Veloce):**
1. Vai su: **Settings** → **Sender Authentication** → **Single Sender Verification**
2. Clicca **"Create New Sender"**
3. Compila:
   - From Name: `Play Sport`
   - From Email: `noreplay@play-sport.pro`
   - Reply To: `noreplay@play-sport.pro`
   - Company: `Play Sport`
4. Clicca **"Create"**
5. **Verifica email** che arriva a `noreplay@play-sport.pro`

**Opzione B - Domain Authentication (Professionale):**
1. Vai su: **Settings** → **Sender Authentication** → **Authenticate Your Domain**
2. Inserisci: `play-sport.pro`
3. Copia i **3 CNAME records** mostrati
4. Vai su **Register.it** → **Gestione DNS**
5. Aggiungi i 3 CNAME records
6. Attendi propagazione DNS (10-60 minuti)
7. Torna su SendGrid → **Verify**

#### Step 4: Configura Secrets

```powershell
# 1. Configura SendGrid API Key
firebase functions:secrets:set SENDGRID_API_KEY
# Incolla la API Key copiata

# 2. FROM_EMAIL è già corretto (noreplay@play-sport.pro)

# 3. EMAIL_USER e EMAIL_PASSWORD restano come Gmail (fallback)
```

#### Step 5: Modifica Cloud Function

```javascript
// functions/scheduledCertificateReminders.js
// La function è GIÀ PRONTA per SendGrid!
// Basta aggiungere SENDGRID_API_KEY ai secrets

export const dailyCertificateCheck = onSchedule(
  {
    schedule: 'every day 09:00',
    timeZone: 'Europe/Rome',
    secrets: [
      'SENDGRID_API_KEY',  // ← AGGIUNGI QUESTO
      'EMAIL_USER',
      'EMAIL_PASSWORD',
      'FROM_EMAIL'
    ]
  },
  async (event) => {
    // Il codice usa automaticamente SendGrid se disponibile!
  }
);
```

#### Step 6: Re-deploy

```powershell
firebase deploy --only functions:dailyCertificateCheck
```

### 📧 Risultato:
```
FROM: noreplay@play-sport.pro
TO: giocatore@example.com
SUBJECT: [URGENTE] Certificato Medico in Scadenza

✅ Alta deliverability (meno spam)
✅ Tracciamento aperture e click
✅ Template professionali
```

### 📊 Dashboard SendGrid:
- Numero email inviate
- Tasso apertura
- Tasso click
- Bounce rate
- Spam reports

---

## 🤔 QUALE SCEGLIERE?

### 🧪 Per TEST/SVILUPPO:
→ **SOLUZIONE A** (Gmail)
- Veloce, funziona subito
- Perfetto per testare la logica

### 🏢 Per PRODUZIONE (pochi utenti):
→ **SOLUZIONE B** (Register.it SMTP)
- Professionale
- Se hai già la casella email configurata

### 🚀 Per PRODUZIONE (molti utenti):
→ **SOLUZIONE C** (SendGrid)
- Migliore deliverability
- Scalabile
- Analytics inclusi
- **CONSIGLIATO!**

---

## 📋 RIEPILOGO COMANDI

### Soluzione A - Gmail (Veloce):
```powershell
firebase functions:secrets:set FROM_EMAIL
# Inserisci: parischit85@gmail.com
firebase deploy --only functions:dailyCertificateCheck
```

### Soluzione B - Register.it:
```powershell
# 1. Modifica functions/scheduledCertificateReminders.js (host SMTP)
# 2. Riconfigura secrets:
firebase functions:secrets:set EMAIL_USER
# Inserisci: noreplay@play-sport.pro
firebase functions:secrets:set EMAIL_PASSWORD
# Inserisci: [password Register.it]
firebase deploy --only functions:dailyCertificateCheck
```

### Soluzione C - SendGrid:
```powershell
# 1. Crea account SendGrid + API Key
# 2. Verifica sender identity
# 3. Configura secret:
firebase functions:secrets:set SENDGRID_API_KEY
# Incolla API Key
# 4. Modifica functions/scheduledCertificateReminders.js (aggiungi secret)
firebase deploy --only functions:dailyCertificateCheck
```

---

## ❓ HAI BISOGNO DI AIUTO?

Dimmi quale soluzione preferisci e ti guido passo-passo nella configurazione! 🚀
