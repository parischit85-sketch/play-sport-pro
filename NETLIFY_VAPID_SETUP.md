# Configurazione VAPID su Netlify

## ✅ Completato

1. ✅ Generazione chiavi VAPID
2. ✅ Aggiornamento chiave pubblica in `src/utils/push.js`
3. ✅ Build locale riuscita
4. ✅ Commit e push su GitHub

## 🔧 Da Fare Manualmente su Netlify

### 1. Accedi a Netlify
Vai su: https://app.netlify.com/

### 2. Seleziona il Sito
- Cerca il tuo sito **play-sport-pro**
- Clicca per aprire il dashboard

### 3. Configura Environment Variables
1. Nel menu laterale, vai su **Site configuration** → **Environment variables**
2. Clicca su **Add a variable**
3. Aggiungi queste **5 variabili** (TUTTE necessarie):

#### Variabile 1: VAPID_PUBLIC_KEY
```
Key: VAPID_PUBLIC_KEY
Value: BI9gOKRddotrncfkYftX0CRDhzE9BpHxqWULvYBiuJ2g7NctyoUeEaQ6Bw5ptBiViiPTDUpWNdXO_qUBzfplMqM
Scopes: All (produzione e deploys)
```

#### Variabile 2: VAPID_PRIVATE_KEY
```
Key: VAPID_PRIVATE_KEY
Value: WOkYBn4ch0dNb2VfVovVE8KwfH70yUzi603ZlZlG6OI
Scopes: All (produzione e deploys)
```

#### Variabile 3: FIREBASE_PROJECT_ID
```
Key: FIREBASE_PROJECT_ID
Value: m-padelweb
Scopes: All (produzione e deploys)
```

#### Variabile 4: FIREBASE_CLIENT_EMAIL
```
Key: FIREBASE_CLIENT_EMAIL
Value: firebase-adminsdk-i08ys@m-padelweb.iam.gserviceaccount.com
Scopes: All (produzione e deploys)
```

#### Variabile 5: FIREBASE_PRIVATE_KEY
```
Key: FIREBASE_PRIVATE_KEY
Value: (vedi sotto - chiave lunga)
Scopes: All (produzione e deploys)
```

**⚠️ IMPORTANTE per FIREBASE_PRIVATE_KEY:**

La chiave privata Firebase è già configurata nelle ENV vars esistenti del tuo sito Netlify.

**Come trovarla:**
1. Vai su Site configuration → Environment variables
2. Cerca la variabile chiamata `FIREBASE_PRIVATE_KEY` o `VITE_FIREBASE_PRIVATE_KEY`
3. Copia il valore (inizia con `-----BEGIN PRIVATE KEY-----`)
4. **SE NON ESISTE**, devi ottenerla da Firebase Console:
   - Firebase Console → Project Settings (⚙️)
   - Service accounts tab
   - Generate new private key
   - Apri il file JSON scaricato
   - Copia il valore del campo `"private_key"`

### 4. Redeploy del Sito
Dopo aver aggiunto le variabili:
1. Vai su **Deploys**
2. Clicca su **Trigger deploy** → **Clear cache and deploy site**
3. Attendi il completamento del deploy

## 📋 Verifica Post-Deploy

### 1. Controlla il Build Log
- Nel deploy log, verifica che non ci siano errori
- Controlla che le funzioni Netlify siano state deployate:
  - `send-push`
  - `save-push-subscription`
  - `remove-push-subscription`

### 2. Test delle Notifiche
1. Apri il sito in produzione
2. Vai al tuo **Profilo**
3. Scorri fino alla sezione **"Notifiche Push"**
4. Clicca su **"Attiva Notifiche"**
5. Accetta il permesso del browser
6. Clicca su **"Invia Notifica di Test"**
7. Dovresti ricevere una notifica push sul tuo dispositivo

### 3. Verifica Firestore
- Apri Firebase Console → Firestore Database
- Verifica che sia stata creata la collection **`pushSubscriptions`**
- Controlla che ci sia un documento con il tuo `userId`

## 🔍 Troubleshooting

### Errore: "Service account object must contain a string 'project_id' property"

**Causa**: Mancano le credenziali Firebase nelle variabili d'ambiente Netlify.

**Soluzione**:
1. Verifica che TUTTE e 5 le variabili siano configurate:
   - ✅ `VAPID_PUBLIC_KEY`
   - ✅ `VAPID_PRIVATE_KEY`
   - ✅ `FIREBASE_PROJECT_ID`
   - ✅ `FIREBASE_CLIENT_EMAIL`
   - ✅ `FIREBASE_PRIVATE_KEY`

2. Controlla che i valori siano corretti (no spazi extra, no virgolette)

3. **IMPORTANTE**: `FIREBASE_PRIVATE_KEY` deve includere i caratteri `\n`:
   ```
   -----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n
   ```

4. Dopo aver aggiunto/modificato le variabili, **devi** fare un redeploy

### Errore: "VAPID keys not configured"
- Verifica che le variabili d'ambiente siano state salvate correttamente
- Controlla che il deploy sia stato eseguito DOPO l'aggiunta delle variabili
- Le variabili devono avere esattamente i nomi: `VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY`

### Errore: "Subscription failed"
- Verifica che il browser supporti le notifiche push (Chrome, Firefox, Edge)
- Controlla che HTTPS sia attivo (Netlify lo fa automaticamente)
- Verifica la console browser per errori JavaScript

### Notifica di test non arriva
- Controlla che il permesso sia stato concesso
- Verifica i log della funzione `send-push` in Netlify
- Controlla che il documento in Firestore contenga la subscription

## 📚 Riferimenti

- Documentazione completa: `WEB_PUSH_IMPLEMENTATION.md`
- Checklist setup: `PUSH_SETUP_CHECKLIST.md`
- Web Push API: https://developer.mozilla.org/en-US/docs/Web/API/Push_API

## ⚠️ Note Importanti

1. **Non committare mai le chiavi private** - sono già nel `.gitignore` tramite `.env.local`
2. **Le chiavi VAPID sono sensibili** - trattale come password
3. **Service Worker** - assicurati che `/sw.js` sia accessibile nella root del sito
4. **HTTPS obbligatorio** - le notifiche push funzionano solo su HTTPS (Netlify lo fornisce)

## 🎯 Prossimi Passi (Opzionali)

1. **Personalizza le notifiche**:
   - Modifica `netlify/functions/send-push.js` per cambiare titolo/testo/icona
   
2. **Aggiungi notifiche automatiche**:
   - Es: notifica quando viene confermata una prenotazione
   - Es: reminder 1 ora prima della partita

3. **Statistiche**:
   - Traccia quanti utenti hanno abilitato le notifiche
   - Monitora il tasso di click sulle notifiche
