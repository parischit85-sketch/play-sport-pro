# 📧 Sistema Notifiche Certificati Medici - Cloud Functions

## 🎯 Panoramica

Sistema automatico di notifiche email per certificati medici in scadenza/scaduti.

### Caratteristiche:
- ⏰ Cron job giornaliero alle 09:00 (Europe/Rome)
- 📧 Email automatiche a giocatori e admin club
- 📊 Report dettagliato con statistiche
- 🎨 Template HTML responsive
- 🔄 Aggiornamento contatori reminder

---

## 📅 Schedule Notifiche

Le email vengono inviate quando il certificato:
- **30 giorni** prima della scadenza
- **15 giorni** prima (alert urgente)
- **7 giorni** prima (alert critico)
- **3 giorni** prima (alert critico)
- **Giorno della scadenza**
- **Dopo scadenza**: -1, -7, -30 giorni

---

## 🚀 Deploy Cloud Function

### Prerequisiti:
```bash
# Installa Firebase CLI
npm install -g firebase-tools

# Login a Firebase
firebase login

# Inizializza progetto (se non già fatto)
firebase init functions
```

### Deploy Funzione:
```bash
# Deploy solo la funzione certificati
firebase deploy --only functions:dailyCertificateCheck

# Deploy tutte le functions
firebase deploy --only functions
```

### Test Locale:
```bash
# Avvia emulatori Firebase
firebase emulators:start --only functions

# Triggera manualmente (HTTP endpoint creato dall'emulatore)
# Vedi console output per URL
```

---

## 📧 Configurazione Email Service

### Opzione 1: SendGrid (Consigliata)

1. **Crea account SendGrid**: https://sendgrid.com
2. **Ottieni API Key** da Settings > API Keys
3. **Aggiungi secret a Firebase**:
```bash
firebase functions:secrets:set SENDGRID_API_KEY
```

4. **Installa SDK**:
```bash
cd functions
npm install @sendgrid/mail
```

5. **Modifica `scheduledCertificateReminders.js`**:
```javascript
import sgMail from '@sendgrid/mail';

async function sendEmail({ to, subject, html, text }) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  await sgMail.send({
    to,
    from: 'noreply@playsport.pro', // Verifica dominio su SendGrid
    subject,
    text,
    html,
  });
  
  return true;
}
```

### Opzione 2: Nodemailer (Gmail/SMTP)

```bash
cd functions
npm install nodemailer
```

```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // App password, non password account
  }
});

async function sendEmail({ to, subject, html, text }) {
  await transporter.sendMail({
    from: '"Play-Sport.pro" <noreply@playsport.pro>',
    to,
    subject,
    text,
    html,
  });
  
  return true;
}
```

### Opzione 3: Firebase Extensions - Trigger Email

```bash
# Installa extension ufficiale Firebase
firebase ext:install firebase/firestore-send-email

# Segui wizard di configurazione
```

---

## ⚙️ Configurazione Secrets

```bash
# SendGrid API Key
firebase functions:secrets:set SENDGRID_API_KEY

# Gmail credentials (se usi Nodemailer)
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_PASSWORD

# Lista secrets configurati
firebase functions:secrets:access
```

Poi modifica `functions/scheduledCertificateReminders.js` per accedere ai secrets:

```javascript
export const dailyCertificateCheck = onSchedule(
  {
    schedule: 'every day 09:00',
    timeZone: 'Europe/Rome',
    memory: '256MiB',
    timeoutSeconds: 540,
    secrets: ['SENDGRID_API_KEY'], // <-- Aggiungi qui
  },
  async (event) => {
    // Il secret è ora disponibile in process.env.SENDGRID_API_KEY
  }
);
```

---

## 📊 Monitoraggio

### Logs Cloud Function:
```bash
# Visualizza logs in real-time
firebase functions:log --only dailyCertificateCheck

# Logs ultimi 100 eventi
firebase functions:log --only dailyCertificateCheck --limit 100
```

### Firebase Console:
1. Apri https://console.firebase.google.com
2. Seleziona progetto
3. Functions → dailyCertificateCheck
4. Vedi: esecuzioni, errori, durata, costi

### Metriche chiave da monitorare:
- ✅ **Esecuzioni giornaliere**: Deve essere 1 al giorno
- ✅ **Durata media**: < 60 secondi ideale
- ✅ **Errori**: Deve essere 0%
- ✅ **Email inviate**: Log in output function

---

## 🧪 Testing

### Test Manuale (Emulatori):
```bash
# 1. Avvia emulatori
firebase emulators:start

# 2. Apri Functions Shell
firebase functions:shell

# 3. Esegui function manualmente
dailyCertificateCheck()
```

### Test con Dati Reali:
```bash
# Deploy in ambiente staging/dev
firebase use dev-project
firebase deploy --only functions:dailyCertificateCheck

# Triggera manualmente da console Firebase
# Functions → dailyCertificateCheck → Test function
```

### Verifica Email Ricevute:
1. Crea giocatore di test con email tua
2. Imposta certificato che scade in 7 giorni
3. Attendi esecuzione cron (09:00) oppure triggera manualmente
4. Controlla inbox

---

## 💰 Costi Stimati

### Firebase Cloud Functions:
- **Invocazioni**: 1 al giorno = ~30/mese = **GRATIS** (fino a 2M invocazioni/mese)
- **Compute time**: ~30s/esecuzione = ~15 minuti/mese = **GRATIS** (fino a 400K GB-sec/mese)
- **Rete**: Trascurabile

### SendGrid:
- **Piano Free**: 100 email/giorno = **GRATIS**
- **Piano Essentials**: $15/mese per 50K email
- **Stima**: 10 club × 20 giocatori × 1 email/settimana = ~200 email/settimana = **Piano Free sufficiente**

### Gmail/Nodemailer:
- **Gmail gratuito**: Limite 500 email/giorno
- **Rischio spam**: Email possono finire in spam senza dominio verificato

**Raccomandazione**: Usa SendGrid con dominio verificato per deliverability ottimale.

---

## 🔧 Troubleshooting

### Problema: Function non si esegue alle 09:00

**Soluzione**:
1. Verifica timezone in Firebase Console (deve essere Europe/Rome)
2. Controlla logs per errori di deployment
3. Re-deploy function: `firebase deploy --only functions:dailyCertificateCheck`

### Problema: Email non vengono inviate

**Causa possibile**: `sendEmail()` è stub (TODO)

**Soluzione**:
1. Implementa servizio email reale (vedi sezione Configurazione Email)
2. Verifica API key/credentials
3. Controlla logs SendGrid/servizio email

### Problema: Timeout Function (>540s)

**Causa**: Troppi club/giocatori da processare

**Soluzione**:
1. Aumenta `timeoutSeconds` a 540 (max)
2. Ottimizza query Firestore (batch, parallelo)
3. Considera split in multiple functions

### Problema: Errori Firestore permissions

**Soluzione**:
```javascript
// Le Cloud Functions usano Firebase Admin SDK con privilegi elevati
// Non servono regole Firestore speciali
// Verifica che initializeApp() sia chiamato
```

---

## 📝 Template Email Personalizzabili

I template email sono in `scheduledCertificateReminders.js`:

- `getUserEmailTemplate()` - Email a giocatori
- `getAdminEmailTemplate()` - Email admin club

Puoi personalizzare:
- Colori
- Testo
- Layout HTML
- Lingua
- Logo/branding

Esempio aggiunta logo:
```html
<img src="https://playsport.pro/logo.png" alt="PlaySport" style="height: 40px;">
```

---

## ✅ Checklist Pre-Production

Prima di andare in produzione:

- [ ] Deploy function su Firebase
- [ ] Configurato servizio email (SendGrid/Nodemailer)
- [ ] API Keys/secrets configurati
- [ ] Testato con dati reali
- [ ] Verificate email ricevute (non in spam)
- [ ] Logs monitorati per errori
- [ ] Dominio email verificato (SendGrid)
- [ ] Template email personalizzati
- [ ] Timezone verificato (Europe/Rome)
- [ ] Admin emails configurati in club documents

---

## 🔮 Future Enhancements

Possibili miglioramenti futuri:

1. **SMS Notifications** (Twilio)
2. **Push Notifications** (FCM)
3. **WhatsApp Notifications** (Twilio/Business API)
4. **Dashboard Analytics** (email sent, open rate)
5. **A/B Testing Templates**
6. **Multi-language Support**
7. **Custom Reminder Schedule** (per club)
8. **Batch Processing** (ottimizzazione performance)

---

## 📚 Risorse

- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Firebase Scheduled Functions](https://firebase.google.com/docs/functions/schedule-functions)
- [SendGrid Node.js](https://github.com/sendgrid/sendgrid-nodejs)
- [Nodemailer Docs](https://nodemailer.com/)
- [Cron Expression Syntax](https://cloud.google.com/scheduler/docs/configuring/cron-job-schedules)

---

**Autore**: Play-Sport.pro Team  
**Versione**: 1.0.0  
**Last Updated**: 2025-10-10
