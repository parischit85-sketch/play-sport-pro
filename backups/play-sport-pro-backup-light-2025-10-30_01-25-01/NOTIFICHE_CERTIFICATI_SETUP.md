# 📧 Setup Sistema Notifiche Certificati Medici

## 📋 Panoramica

Il sistema di notifiche certificati include:

1. **Notifiche Automatiche** (Cloud Function Scheduled)
   - Esegue ogni giorno alle 09:00
   - Controlla tutti i certificati in scadenza/scaduti
   - Invia email automatiche a giocatori e admin

2. **Notifiche Manuali** (Cloud Function Callable)
   - Invocabile da admin tramite dashboard
   - Selezione multipla giocatori
   - Invio bulk email/push notifications

---

## 🚀 Deployment Cloud Functions

### 1. Deploy Entrambe le Funzioni

```bash
# Deploy tutte le functions
firebase deploy --only functions

# Oppure deploy singole
firebase deploy --only functions:dailyCertificateCheck
firebase deploy --only functions:sendBulkCertificateNotifications
```

### 2. Verifica Deployment

```bash
# Lista funzioni deployate
firebase functions:list

# Dovresti vedere:
# ✅ dailyCertificateCheck (scheduled)
# ✅ sendBulkCertificateNotifications (https-callable)
```

### 3. ⚠️ CORS Configuration (IMPORTANTE!)

La Cloud Function `sendBulkCertificateNotifications` è configurata con CORS per:
- `http://localhost:5173` - Sviluppo locale (Vite)
- `http://localhost:5174` - Sviluppo alternativo
- `https://play-sport.pro` - Produzione
- `https://m-padelweb.web.app` - Firebase Hosting
- `https://m-padelweb.firebaseapp.com` - Firebase Hosting alternativo

**Se ottieni errore CORS:**
```
Access to fetch at '...' has been blocked by CORS policy
```

**Soluzione**: Verifica che il dominio sia nella lista CORS in `functions/sendBulkNotifications.js`:
```javascript
cors: [
  'http://localhost:5173',
  'https://tuo-dominio.com'  // Aggiungi qui il tuo dominio
]
```

Poi re-deploya:
```bash
firebase deploy --only functions:sendBulkCertificateNotifications
```

---

## 🔧 Configurazione Email Service

### Opzione 1: Gmail + Nodemailer (SVILUPPO/TEST) ✅ Attualmente Attivo

**Pro**: Gratuito, facile setup
**Contro**: Limite 500 email/giorno, meno professionale

#### Setup Gmail:

1. **Crea App Password**
   - Vai su https://myaccount.google.com/apppasswords
   - Seleziona "Mail" come app
   - Copia la password generata (16 caratteri)

2. **Configura Secrets**
   ```bash
   # Email account
   firebase functions:secrets:set EMAIL_USER
   # Quando richiesto, inserisci: tua-email@gmail.com

   # App Password
   firebase functions:secrets:set EMAIL_PASSWORD
   # Quando richiesto, incolla la password da Google
   ```

3. **Verifica Configurazione**
   ```bash
   # Lista secrets configurati
   firebase functions:secrets:access EMAIL_USER
   firebase functions:secrets:access EMAIL_PASSWORD
   ```

4. **Re-Deploy con Secrets**
   ```bash
   firebase deploy --only functions
   ```

### Opzione 2: SendGrid (PRODUZIONE) ⚠️ Non Configurato

**Pro**: Professionale, 100 email/giorno gratis, ottima deliverability
**Contro**: Richiede verifica dominio

#### Setup SendGrid:

1. **Crea Account**
   - Registrati su https://sendgrid.com
   - Piano Free: 100 email/giorno gratis

2. **Ottieni API Key**
   - Dashboard → Settings → API Keys
   - Create API Key
   - Full Access
   - Copia API Key

3. **Configura Secret**
   ```bash
   firebase functions:secrets:set SENDGRID_API_KEY
   # Incolla l'API Key quando richiesto
   ```

4. **Verifica Dominio (Opzionale ma Raccomandato)**
   - SendGrid → Settings → Sender Authentication
   - Verify Single Sender → Inserisci email mittente
   - Oppure Domain Authentication → Inserisci dominio

5. **Configura Email Mittente**
   ```bash
   firebase functions:secrets:set FROM_EMAIL
   # Esempio: noreply@playsport.pro
   ```

---

## 📊 Monitoraggio e Logs

### Visualizza Logs in Tempo Reale

```bash
# Logs generali
firebase functions:log

# Logs funzione specifica
firebase functions:log --only dailyCertificateCheck
firebase functions:log --only sendBulkCertificateNotifications

# Segui logs in tempo reale
firebase functions:log --only dailyCertificateCheck --follow
```

### Console Firebase

1. Vai su https://console.firebase.google.com
2. Seleziona progetto Play-Sport
3. Functions → Logs
4. Filtra per nome funzione

### Cosa Cercare nei Logs:

#### ✅ Invio Email Riuscito
```
✅ [SendGrid] Email sent to: player@example.com
✅ [Nodemailer] Email sent to: player@example.com
```

#### ❌ Errori Comuni

**Email service non configurato:**
```
⚠️ [Email] No email service configured
```
**Soluzione**: Configura EMAIL_USER/EMAIL_PASSWORD o SENDGRID_API_KEY

**Email invalida:**
```
⚠️ [Email] Invalid recipient: undefined
```
**Soluzione**: Il giocatore non ha email nel database

**SendGrid error 401:**
```
❌ [SendGrid] Error: Unauthorized
```
**Soluzione**: API Key errata, riconfigura SENDGRID_API_KEY

**Gmail "Less secure app":**
```
❌ [Nodemailer] Error: Invalid login
```
**Soluzione**: Usa App Password, non password normale Gmail

---

## 🧪 Test delle Funzioni

### Test Locale con Emulator

```bash
# Avvia emulatori
firebase emulators:start --only functions

# Le functions saranno disponibili su:
# http://localhost:5001/play-sport-XXXXX/us-central1/sendBulkCertificateNotifications
```

### Test Manuale Notifica Singola

1. Apri Dashboard Admin
2. Vai su "Gestione Certificati"
3. Seleziona 1 giocatore con email valida
4. Click "Invia Email"
5. Conferma
6. Controlla console browser per logs
7. Controlla email destinatario

### Test Notifica Automatica (Scheduled)

```bash
# Trigger manuale della scheduled function
firebase functions:shell

# Nella shell:
dailyCertificateCheck()
```

Oppure aspetta le 09:00 del giorno successivo!

---

## 📝 Template Email

### Email Giocatore - Scaduto
```
Subject: ⚠️ Certificato Medico Scaduto - Club XYZ

Il tuo certificato medico è SCADUTO da X giorni.
Non puoi prenotare fino al rinnovo.
```

### Email Giocatore - In Scadenza
```
Subject: ⏰ Certificato Medico in Scadenza - Club XYZ

Il tuo certificato scade tra X giorni.
Ricordati di rinnovarlo per tempo.
```

### Email Giocatore - Urgente
```
Subject: URGENTE - Certificato Medico in Scadenza - Club XYZ

Il tuo certificato scade tra X giorni (X <= 7).
Rinnova SUBITO per continuare a prenotare!
```

### Email Admin - Report
```
Subject: 📋 Report Certificati Medici - Club XYZ (X da controllare)

- Scaduti: X
- Urgenti (<15gg): X
- Totale: X

[Lista giocatori con dettagli]
```

---

## 🔐 Sicurezza

### Verifica Permessi Admin

La Cloud Function `sendBulkCertificateNotifications` verifica:

1. ✅ Utente autenticato
2. ✅ User ID presente in `clubs/{clubId}/admins`
3. ✅ Club esiste
4. ❌ Se fallisce → `permission-denied`

### Protezione Secrets

```bash
# Lista secrets (NON mostra valori)
firebase functions:secrets:list

# Accedi a secret specifico (richiede autenticazione)
firebase functions:secrets:access EMAIL_USER

# Elimina secret
firebase functions:secrets:destroy EMAIL_PASSWORD
```

---

## 📈 Statistiche e Metriche

### Dati Tracciati nella Cloud Function

```javascript
{
  totalClubs: 10,
  totalPlayers: 234,
  emailsSent: 45,
  errors: 2,
  duration: 12.34 // secondi
}
```

### Dati Salvati su Player Document

```javascript
{
  medicalCertificates: {
    lastReminderSent: "2025-10-10T09:00:00Z",
    remindersSent: 5,  // Automatiche
    lastManualReminderSent: "2025-10-10T14:30:00Z",
    manualRemindersSent: 2,  // Manuali da admin
    lastReminderSentBy: "adminUserId"
  }
}
```

---

## 🐛 Troubleshooting

### Problema: Notifiche non arrivano

1. **Verifica Email Service Configurato**
   ```bash
   firebase functions:config:get
   ```

2. **Controlla Logs**
   ```bash
   firebase functions:log --only sendBulkCertificateNotifications
   ```

3. **Verifica Email Destinatario**
   - Player ha email valida?
   - Email non in spam?
   - Preferenze comunicazione abilitate?

### Problema: Permission Denied

1. **Verifica Autenticazione**
   - Utente loggato?
   - Token Firebase valido?

2. **Verifica Permessi Admin**
   ```javascript
   // Firestore: clubs/{clubId}
   {
     admins: ["userId1", "userId2"]  // ← Il tuo userId deve essere qui
   }
   ```

### Problema: Timeout Functions

Se hai molti giocatori (>100):

1. **Aumenta Timeout**
   ```javascript
   // In sendBulkNotifications.js
   {
     timeoutSeconds: 540  // 9 minuti max
   }
   ```

2. **Batch Processing**
   ```javascript
   // Processa a gruppi di 50
   for (let i = 0; i < playerIds.length; i += 50) {
     const batch = playerIds.slice(i, i + 50);
     await processBatch(batch);
   }
   ```

---

## 🔄 Aggiornamenti Futuri

### Push Notifications (TODO)

```javascript
// In sendBulkNotifications.js
if (notificationType === 'push') {
  const { getMessaging } = await import('firebase-admin/messaging');
  const messaging = getMessaging();
  
  await messaging.send({
    token: player.fcmToken,
    notification: {
      title: '🏥 Certificato in Scadenza',
      body: `Il tuo certificato scade tra ${daysRemaining} giorni`
    },
    data: {
      type: 'certificate-reminder',
      playerId: player.id,
      clubId: clubId
    }
  });
}
```

### Template Email Personalizzabili

```javascript
// Firestore: clubs/{clubId}/settings/emailTemplates
{
  certificateExpiring: {
    subject: "Custom subject with {{playerName}}",
    html: "<div>Custom HTML with {{daysRemaining}}</div>"
  }
}
```

---

## 📞 Supporto

**Documentazione Firebase Functions:**
- https://firebase.google.com/docs/functions

**SendGrid Docs:**
- https://docs.sendgrid.com

**Nodemailer Docs:**
- https://nodemailer.com

**Test Email Service:**
- https://www.mail-tester.com (verifica spam score)

---

## ✅ Checklist Pre-Produzione

- [ ] Email service configurato (Gmail o SendGrid)
- [ ] Secrets impostati correttamente
- [ ] Functions deployate con successo
- [ ] Test invio email singola ✅
- [ ] Test invio bulk (5+ giocatori) 
- [ ] Verifica email non in spam
- [ ] Scheduled function testata
- [ ] Logs monitorati per 1 settimana
- [ ] Template email approvati
- [ ] Dominio verificato (se SendGrid)
- [ ] Admin informati su nuovo sistema

---

**Ultima modifica**: 2025-10-10
**Versione**: 1.0.0
**Status**: ✅ Sistema configurato e pronto all'uso
