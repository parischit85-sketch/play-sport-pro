# 📧 Configurazione Servizi Email - Guida Completa

## 🎯 Overview

Il sistema supporta **2 servizi email** con fallback automatico:

1. **SendGrid** (Produzione) - Priorità 1
2. **Nodemailer/Gmail** (Test/Backup) - Priorità 2

Se SendGrid non è configurato, il sistema usa automaticamente Nodemailer.

---

## ⚡ Setup Rapido (5 minuti) - Gmail/Nodemailer

### Step 1: Genera App Password Google

1. Vai su **Google Account**: https://myaccount.google.com/security
2. Abilita **Verifica in 2 passaggi** (se non già attivo)
3. Vai su **App Passwords**: https://myaccount.google.com/apppasswords
4. Seleziona:
   - App: **Mail**
   - Dispositivo: **Other** (scrivi "Play-Sport Cloud Function")
5. Clicca **Generate**
6. Copia la password (16 caratteri, tipo: `abcd efgh ijkl mnop`)

### Step 2: Configura Secrets Firebase

Apri terminal nella root del progetto:

```bash
# Email mittente (la tua Gmail)
firebase functions:secrets:set EMAIL_USER
# Quando richiesto, incolla: tua-email@gmail.com

# Password app (quella generata al punto precedente)
firebase functions:secrets:set EMAIL_PASSWORD
# Quando richiesto, incolla: abcdefghijklmnop (senza spazi)

# Email mittente per "From" (opzionale, usa EMAIL_USER se non specificato)
firebase functions:secrets:set FROM_EMAIL
# Quando richiesto, incolla: noreply@playsport.pro
```

### Step 3: Verifica Configurazione

```bash
# Lista secrets configurati
firebase functions:secrets:access EMAIL_USER
firebase functions:secrets:access EMAIL_PASSWORD
```

### Step 4: Deploy

```bash
firebase deploy --only functions:dailyCertificateCheck
```

✅ **FATTO!** Le email verranno inviate dalla tua Gmail.

⚠️ **Limiti Gmail**:
- 500 email/giorno
- Rischio spam se non dominio verificato
- OK per test/sviluppo, non per produzione massiva

---

## 🚀 Setup Professionale (15 minuti) - SendGrid

### Step 1: Crea Account SendGrid

1. Vai su https://sendgrid.com
2. Clicca **Start for free**
3. Registrati (piano Free: 100 email/giorno)
4. Verifica email

### Step 2: Ottieni API Key

1. Login su SendGrid
2. Vai su **Settings** → **API Keys**
3. Clicca **Create API Key**
4. Nome: `Play-Sport Cloud Function`
5. Permessi: **Full Access** (o almeno Mail Send)
6. Clicca **Create & View**
7. **COPIA SUBITO** la API Key (mostra 1 sola volta!)
   - Esempio: `SG.xxxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyy`

### Step 3: Verifica Dominio (Opzionale ma consigliato)

**Perché?** Evita finire in spam, professionalità

1. Vai su **Settings** → **Sender Authentication**
2. Clicca **Authenticate Your Domain**
3. Scegli DNS provider (es. Cloudflare, GoDaddy)
4. Segui wizard:
   - Dominio: `playsport.pro`
   - Aggiungi record DNS:
     ```
     CNAME s1._domainkey → s1.domainkey.u12345.wl.sendgrid.net
     CNAME s2._domainkey → s2.domainkey.u12345.wl.sendgrid.net
     CNAME em1234 → u12345.wl.sendgrid.net
     ```
5. Attendi verifica DNS (10-60 minuti)

### Step 4: Configura Secret Firebase

```bash
firebase functions:secrets:set SENDGRID_API_KEY
# Quando richiesto, incolla la API Key copiata al Step 2
```

### Step 5: Configura Email Mittente

```bash
# Email mittente (deve essere verificata su SendGrid)
firebase functions:secrets:set FROM_EMAIL
# Incolla: noreply@playsport.pro
```

⚠️ **IMPORTANTE**: L'email in FROM_EMAIL deve essere:
- **Single Sender** verificato su SendGrid, OPPURE
- Parte di un **dominio verificato**

**Verifica Single Sender** (se non hai dominio):
1. Settings → Sender Authentication → Verify a Single Sender
2. Compila form con email (es. `info@playsport.pro`)
3. Verifica email ricevuta
4. Usa questa email in FROM_EMAIL

### Step 6: Deploy

```bash
firebase deploy --only functions:dailyCertificateCheck
```

### Step 7: Test Email

Dopo deploy, triggera manualmente la function:

```bash
# Apri console Firebase
# Functions → dailyCertificateCheck → Test function

# Oppure aspetta cron (09:00) e controlla logs
firebase functions:log --only dailyCertificateCheck
```

✅ **FATTO!** Ora usi SendGrid (fino a 100 email/giorno gratis).

---

## 🔄 Configurazione Dual Service (Entrambi)

Puoi configurare **entrambi** per massima affidabilità:

```bash
# SendGrid (priorità 1)
firebase functions:secrets:set SENDGRID_API_KEY

# Gmail (fallback se SendGrid fallisce)
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_PASSWORD

# Email mittente
firebase functions:secrets:set FROM_EMAIL
```

**Comportamento**:
1. Prova inviare con SendGrid
2. Se fallisce → Fallback su Nodemailer/Gmail
3. Se entrambi falliscono → Log errore

---

## 📊 Verifica Configurazione

### Controlla Secrets Attivi

```bash
# Lista tutti i secrets
firebase functions:secrets:access

# Verifica specifico secret
firebase functions:secrets:access SENDGRID_API_KEY
firebase functions:secrets:access EMAIL_USER
```

### Test Locale con Emulatori

```bash
# Esporta secrets come variabili ambiente
export SENDGRID_API_KEY="your-key-here"
export EMAIL_USER="your-email@gmail.com"
export EMAIL_PASSWORD="your-app-password"
export FROM_EMAIL="noreply@playsport.pro"

# Avvia emulatori
firebase emulators:start --only functions

# In altra tab, triggera function manualmente
firebase functions:shell
> dailyCertificateCheck()
```

### Verifica Logs Produzione

```bash
# Logs real-time
firebase functions:log --only dailyCertificateCheck

# Cerca errori email
firebase functions:log --only dailyCertificateCheck | grep "Email"
```

**Output attesi**:
```
✅ [SendGrid] Email sent to: player@example.com
✅ [Nodemailer] Email sent to: admin@example.com
⚠️ [Email] No email service configured
❌ [SendGrid] Error: API key invalid
```

---

## 🐛 Troubleshooting

### Problema: "No email service configured"

**Causa**: Nessun secret configurato

**Soluzione**:
```bash
# Configura almeno uno dei due servizi
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_PASSWORD
# OPPURE
firebase functions:secrets:set SENDGRID_API_KEY
```

### Problema: SendGrid error "Unauthorized"

**Causa**: API Key invalida o scaduta

**Soluzione**:
1. Genera nuova API Key su SendGrid
2. Aggiorna secret:
```bash
firebase functions:secrets:set SENDGRID_API_KEY
```
3. Re-deploy:
```bash
firebase deploy --only functions:dailyCertificateCheck
```

### Problema: SendGrid error "Sender verify"

**Causa**: Email mittente non verificata

**Soluzione**:
1. Verifica Single Sender su SendGrid (Settings → Sender Authentication)
2. OPPURE verifica intero dominio
3. Usa email verificata in FROM_EMAIL:
```bash
firebase functions:secrets:set FROM_EMAIL
# Incolla email verificata (es. verified@yourdomain.com)
```

### Problema: Gmail error "Less secure app"

**Causa**: Password account invece di App Password

**Soluzione**:
1. NON usare password Gmail normale
2. Genera App Password: https://myaccount.google.com/apppasswords
3. Usa quella password:
```bash
firebase functions:secrets:set EMAIL_PASSWORD
# Incolla App Password (16 caratteri senza spazi)
```

### Problema: Email finite in spam

**Causa**: Dominio non verificato, reputation bassa

**Soluzione SendGrid**:
1. Verifica dominio su SendGrid
2. Aggiungi record SPF, DKIM, DMARC
3. Usa dominio verificato in FROM_EMAIL

**Soluzione Gmail**:
1. Aggiungi disclaimer in email: "Questa è email automatica..."
2. Chiedi destinatari di aggiungere a whitelist
3. Considera passare a SendGrid con dominio verificato

### Problema: Function timeout (>540s)

**Causa**: Troppi giocatori da processare

**Soluzione**:
```javascript
// In scheduledCertificateReminders.js
// Aumenta timeout (max 540s Gen2)
export const dailyCertificateCheck = onSchedule({
  ...
  timeoutSeconds: 540, // già al massimo
  memory: '512MiB', // aumenta memoria invece
});
```

---

## 💰 Costi

### Gmail/Nodemailer
- **Free**: 500 email/giorno
- **Nessun costo** aggiuntivo
- **Limitazione**: Solo 1 account mittente

### SendGrid
- **Free Tier**: 100 email/giorno GRATIS
- **Essentials**: $15/mese → 50,000 email
- **Pro**: $60/mese → 100,000 email
- **Verifica dominio**: GRATIS

### Stima Play-Sport
- 10 club × 30 giocatori = 300 giocatori
- 1 email/settimana per giocatore = 300 email/settimana
- **~43 email/giorno** → SendGrid Free SUFFICIENTE ✅

---

## 🔐 Sicurezza Best Practices

### ✅ DO:
- Usa Firebase Secrets (NON environment variables)
- Ruota API Keys ogni 6 mesi
- Verifica dominio su SendGrid
- Monitora logs per abusi
- Limita rate email (già implementato)

### ❌ DON'T:
- Mai committare API Keys nel codice
- Mai usare password Gmail normale
- Mai condividere API Keys
- Mai inviare email massive senza rate limiting

---

## 📚 Risorse

- **SendGrid Docs**: https://docs.sendgrid.com/
- **SendGrid Node.js**: https://github.com/sendgrid/sendgrid-nodejs
- **Nodemailer Docs**: https://nodemailer.com/
- **Google App Passwords**: https://myaccount.google.com/apppasswords
- **Firebase Secrets**: https://firebase.google.com/docs/functions/config-env#secret-manager

---

## ✅ Checklist Setup

### Gmail/Nodemailer (Test):
- [ ] Generata App Password Google
- [ ] Configurato `EMAIL_USER` secret
- [ ] Configurato `EMAIL_PASSWORD` secret
- [ ] Configurato `FROM_EMAIL` secret (opzionale)
- [ ] Deployata function
- [ ] Testato invio email
- [ ] Verificata ricezione (non spam)

### SendGrid (Produzione):
- [ ] Creato account SendGrid
- [ ] Ottenuta API Key
- [ ] Configurato `SENDGRID_API_KEY` secret
- [ ] Verificato Single Sender o dominio
- [ ] Configurato `FROM_EMAIL` secret
- [ ] Deployata function
- [ ] Testato invio email
- [ ] Email ricevute (non spam)
- [ ] Monitorato dashboard SendGrid

---

**Autore**: Play-Sport.pro Team  
**Versione**: 1.0.0  
**Last Updated**: 2025-10-10
