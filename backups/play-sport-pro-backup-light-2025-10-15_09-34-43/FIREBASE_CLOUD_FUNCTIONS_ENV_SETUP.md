# 🔥 Firebase Cloud Functions - Environment Variables Setup

## 🚨 Problema Identificato

Le notifiche push **non funzionano** perché le chiavi VAPID sono configurate solo su **Netlify**, ma non su **Firebase Cloud Functions**.

### Errore Attuale
```
❌ Servizio Push non configurato (VAPID mancante) [push-service-unconfigured]
```

### Causa
La funzione `sendBulkCertificateNotifications` è una **Firebase Cloud Function** che gira su **Google Cloud Platform**, non su Netlify. Le variabili d'ambiente configurate su Netlify **NON** sono accessibili dalle Firebase Functions.

---

## ✅ Soluzione: Configurare Environment Variables su Firebase

Ci sono **3 metodi** per configurare le variabili:

---

### Metodo 1: Firebase CLI (Consigliato) ⭐

#### Prerequisiti
```bash
# Installa Firebase CLI se non l'hai già
npm install -g firebase-tools

# Login
firebase login

# Verifica progetto
firebase projects:list
```

#### Configurazione VAPID Keys

```bash
# Naviga nella cartella del progetto
cd C:\Users\paris\Downloads\play-sport-backup-2025-10-05_23-30-00

# Configura le chiavi VAPID
firebase functions:secrets:set VAPID_PUBLIC_KEY
# Incolla quando richiesto: BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM809QTxc85X9oiHFKLovhxCpTgpAQV8zX6iJwLKy_wmMEQx7HHZUKrXusdM

firebase functions:secrets:set VAPID_PRIVATE_KEY
# Incolla quando richiesto: I-rY8mHqxKzGnDo5_EqT7jPpVHxGBpfWvLJhMxCqf7I
```

#### Verifica Configurazione
```bash
# Lista tutte le secrets configurate
firebase functions:secrets:access VAPID_PUBLIC_KEY
firebase functions:secrets:access VAPID_PRIVATE_KEY
```

#### Deploy Funzione Aggiornata
```bash
# Deploy solo la funzione specifica
firebase deploy --only functions:sendBulkCertificateNotifications

# Oppure deploy tutte le functions
firebase deploy --only functions
```

---

### Metodo 2: Google Cloud Console (Web UI)

#### Step 1: Apri Google Cloud Console
1. Vai su: https://console.cloud.google.com
2. Seleziona progetto: **m-padelweb**
3. Menu → **Cloud Functions**

#### Step 2: Configura Secret Manager
1. Nel menu laterale: **Security** → **Secret Manager**
2. Click **+ CREATE SECRET**

**Secret 1: VAPID_PUBLIC_KEY**
```
Name: VAPID_PUBLIC_KEY
Secret value: BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM809QTxc85X9oiHFKLovhxCpTgpAQV8zX6iJwLKy_wmMEQx7HHZUKrXusdM
```

**Secret 2: VAPID_PRIVATE_KEY**
```
Name: VAPID_PRIVATE_KEY
Secret value: I-rY8mHqxKzGnDo5_EqT7jPpVHxGBpfWvLJhMxCqf7I
```

#### Step 3: Associa Secrets alla Cloud Function
1. Vai su **Cloud Functions** → `sendBulkCertificateNotifications`
2. Click **EDIT**
3. Sezione **Runtime, build, connections and security settings**
4. Tab **Security and Image Repo**
5. **Secrets** → **REFERENCE A SECRET**
6. Aggiungi entrambe le secrets create

#### Step 4: Deploy
- Click **DEPLOY** per applicare le modifiche

---

### Metodo 3: File .secret.local (Solo Development)

⚠️ **NON consigliato per produzione**

Crea file `.secret.local` nella cartella `functions/`:

```bash
# functions/.secret.local
VAPID_PUBLIC_KEY=BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM809QTxc85X9oiHFKLovhxCpTgpAQV8zX6iJwLKy_wmMEQx7HHZUKrXusdM
VAPID_PRIVATE_KEY=I-rY8mHqxKzGnDo5_EqT7jPpVHxGBpfWvLJhMxCqf7I
```

Poi testa localmente:
```bash
firebase emulators:start --only functions
```

---

## 📝 Configurazione Completa nel functions/index.js

Verifica che il file `functions/index.js` includa le secrets:

```javascript
export const sendBulkCertificateNotifications = onCall(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 300,
    secrets: ['VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY'], // ✅ Aggiungi qui
  },
  async (request) => {
    // ... codice funzione
  }
);
```

---

## 🧪 Test della Configurazione

### 1. Verifica Logs Firebase

Dopo il deploy, controlla i logs:

```bash
firebase functions:log --only sendBulkCertificateNotifications
```

Dovresti vedere:
```
✅ Web Push VAPID configured successfully
```

### 2. Test da Console Browser

Apri la Console del browser e testa:

```javascript
// Importa Firebase
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions(undefined, 'us-central1');
const sendBulk = httpsCallable(functions, 'sendBulkCertificateNotifications');

// Test con un giocatore
const result = await sendBulk({
  clubId: 'sporting-cat',
  playerIds: ['NhN9YIJFBghjbExhLimFMHcrj2v2'], // Giacomo Paris
  notificationType: 'push'
});

console.log('Result:', result.data);
```

### 3. Verifica da UI Admin

1. Vai alla dashboard admin del club
2. Sezione **Certificati Medici**
3. Seleziona un giocatore
4. Click **"Invia Notifica Push"**
5. Verifica che arrivi la notifica

---

## 🔍 Debug e Troubleshooting

### Errore: "Secret not found"

**Causa**: Le secrets non sono state configurate o non sono accessibili dalla function

**Soluzione**:
```bash
# Verifica che le secrets esistano
gcloud secrets list --project=m-padelweb

# Verifica permessi
gcloud projects get-iam-policy m-padelweb
```

### Errore: "Permission denied"

**Causa**: Il service account della Cloud Function non ha permessi per accedere alle secrets

**Soluzione**:
```bash
# Ottieni service account
gcloud projects get-iam-policy m-padelweb | grep serviceAccount

# Aggiungi ruolo Secret Manager
gcloud projects add-iam-policy-binding m-padelweb \
  --member="serviceAccount:[SERVICE_ACCOUNT_EMAIL]" \
  --role="roles/secretmanager.secretAccessor"
```

### Verificare Environment Variables Caricati

Aggiungi questo debug temporaneo nella function:

```javascript
// All'inizio della funzione sendBulkCertificateNotifications
console.log('🔧 Environment Check:', {
  hasVapidPublic: !!process.env.VAPID_PUBLIC_KEY,
  hasVapidPrivate: !!process.env.VAPID_PRIVATE_KEY,
  allEnvVars: Object.keys(process.env).filter(k => k.includes('VAPID')),
});
```

---

## 📊 Checklist Completa

- [ ] Firebase CLI installato e autenticato
- [ ] Secrets VAPID_PUBLIC_KEY creato
- [ ] Secrets VAPID_PRIVATE_KEY creato
- [ ] Secrets referenziati in `functions/index.js`
- [ ] Cloud Function deployata con `firebase deploy --only functions`
- [ ] Logs verificati: `firebase functions:log`
- [ ] Test manuale da UI completato
- [ ] Notifica push ricevuta con successo

---

## 🚀 Deploy Rapido (Tutto in Una Volta)

```bash
# 1. Login Firebase
firebase login

# 2. Configura secrets
firebase functions:secrets:set VAPID_PUBLIC_KEY
# Incolla: BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM809QTxc85X9oiHFKLovhxCpTgpAQV8zX6iJwLKy_wmMEQx7HHZUKrXusdM

firebase functions:secrets:set VAPID_PRIVATE_KEY
# Incolla: I-rY8mHqxKzGnDo5_EqT7jPpVHxGBpfWvLJhMxCqf7I

# 3. Deploy functions
firebase deploy --only functions:sendBulkCertificateNotifications

# 4. Verifica logs
firebase functions:log --only sendBulkCertificateNotifications --lines 50

# 5. Test
# Vai su https://play-sport-pro-v2-2025.netlify.app/club/sporting-cat/admin
# e invia una notifica push di test
```

---

## 🎯 Prossimi Passi

1. **Esegui il setup** usando il Metodo 1 (Firebase CLI)
2. **Deploy la funzione** aggiornata
3. **Riavvia il dev server locale** (`npm run dev`)
4. **Testa le notifiche push** dalla dashboard admin
5. **Verifica i logs** per confermare che tutto funzioni

---

## ℹ️ Note Importanti

### Differenza Netlify vs Firebase Functions

| Feature | Netlify Functions | Firebase Cloud Functions |
|---------|------------------|--------------------------|
| **Provider** | Netlify | Google Cloud Platform |
| **Runtime** | AWS Lambda | Google Cloud Run |
| **Env Vars** | Netlify UI/CLI | Firebase Secrets Manager |
| **Accesso** | `process.env.VAR` | `process.env.VAR` (con secrets config) |
| **Deploy** | `netlify deploy` | `firebase deploy --only functions` |

### Quando Usare Cosa?

- **Netlify Functions**: Per endpoint HTTP pubblici, webhooks, API REST
- **Firebase Functions**: Per operazioni che richiedono accesso al database Firebase, autenticazione, scheduled tasks

Nel nostro caso:
- ✅ **Netlify**: Endpoint pubblici per salvare/rimuovere push subscriptions
- ✅ **Firebase**: Invio bulk notifiche certificati (richiede accesso Firestore)

---

## 📞 Supporto

Se hai problemi:
1. Controlla i logs: `firebase functions:log`
2. Verifica la configurazione nel file `functions/index.js`
3. Testa le secrets: `firebase functions:secrets:access VAPID_PUBLIC_KEY`
4. Consulta la documentazione: https://firebase.google.com/docs/functions/config-env

---

**Ultimo aggiornamento**: 2025-10-13
