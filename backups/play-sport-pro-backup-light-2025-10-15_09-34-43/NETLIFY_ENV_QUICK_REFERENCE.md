# Netlify Environment Variables - Quick Reference

## 🚨 Errore 502 - Configurazione Incompleta

Se vedi l'errore:
```
Service account object must contain a string "project_id" property
```

Significa che le **credenziali Firebase** non sono configurate su Netlify.

---

## ✅ Variabili da Configurare (TUTTE obbligatorie)

Vai su: **Netlify Dashboard → Site configuration → Environment variables**

### 1️⃣ VAPID_PUBLIC_KEY
```
BI9gOKRddotrncfkYftX0CRDhzE9BpHxqWULvYBiuJ2g7NctyoUeEaQ6Bw5ptBiViiPTDUpWNdXO_qUBzfplMqM
```

### 2️⃣ VAPID_PRIVATE_KEY
```
WOkYBn4ch0dNb2VfVovVE8KwfH70yUzi603ZlZlG6OI
```

### 3️⃣ FIREBASE_PROJECT_ID
```
m-padelweb
```

### 4️⃣ FIREBASE_CLIENT_EMAIL
```
firebase-adminsdk-i08ys@m-padelweb.iam.gserviceaccount.com
```

### 5️⃣ FIREBASE_PRIVATE_KEY

**⚠️ Questa variabile probabilmente ESISTE GIÀ nel tuo Netlify!**

#### Opzione A: Variabile Esistente (PREFERITA)

1. Vai su **Environment variables** in Netlify
2. Cerca una variabile chiamata:
   - `FIREBASE_PRIVATE_KEY` oppure
   - `VITE_FIREBASE_PRIVATE_KEY` oppure
   - Simile con "firebase" e "private" nel nome

3. **Se esiste**: Sei a posto! ✅ Passa al punto "Redeploy"

4. **Se non esiste**: Continua con Opzione B

#### Opzione B: Ottieni da Firebase Console

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Seleziona progetto **m-padelweb**
3. Clicca su **⚙️ Project Settings**
4. Tab **Service accounts**
5. Clicca **Generate new private key**
6. Si scarica un file JSON
7. Apri il file e copia il valore di `"private_key"`

**Il valore sarà simile a:**
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEF...(molto lungo)...\n-----END PRIVATE KEY-----\n
```

**⚠️ ATTENZIONE:**
- Deve includere `\n` (non andare a capo reali)
- Deve iniziare con `-----BEGIN PRIVATE KEY-----\n`
- Deve finire con `\n-----END PRIVATE KEY-----\n`

---

## 🔄 Dopo la Configurazione

### Step Finali:

1. ✅ Verifica che TUTTE e 5 le variabili siano salvate
2. ✅ Vai su **Deploys** tab
3. ✅ Clicca **Trigger deploy** → **Deploy site**
4. ⏳ Aspetta ~2-3 minuti per il deploy
5. 🧪 Testa le notifiche push

---

## 🧪 Test Post-Deploy

### 1. Vai al sito in produzione
```
https://play-sport-pro-v2-2025.netlify.app
```

### 2. Apri DevTools (F12)

### 3. Vai al Profilo

### 4. Clicca "Attiva Notifiche"

### 5. Verifica nella Console:

**✅ SUCCESSO:**
```
✅ Push subscription successful
```

**❌ ERRORE (se ancora presente):**
```
POST .../.netlify/functions/save-push-subscription 502
```

Se ancora 502, controlla i **Function logs** in Netlify per vedere l'errore specifico.

---

## 📊 Verifica Variabili Configurate

### Checklist:

In Netlify → Environment variables, dovresti vedere:

- [ ] `VAPID_PUBLIC_KEY` (87 caratteri)
- [ ] `VAPID_PRIVATE_KEY` (43 caratteri)
- [ ] `FIREBASE_PROJECT_ID` (valore: `m-padelweb`)
- [ ] `FIREBASE_CLIENT_EMAIL` (contiene `@m-padelweb.iam.gserviceaccount.com`)
- [ ] `FIREBASE_PRIVATE_KEY` (inizia con `-----BEGIN PRIVATE KEY-----`)

**Tutte le variabili devono avere:**
- ✅ Scope: **All scopes** (o almeno "Functions")
- ✅ Valore presente (non vuoto)

---

## 🔍 Debug Functions su Netlify

Se le notifiche ancora non funzionano:

### 1. Vai su Netlify Dashboard

### 2. Tab **Functions**

### 3. Clicca su `save-push-subscription`

### 4. Guarda i **Real-time logs**

### 5. Prova di nuovo "Attiva Notifiche" sul sito

### 6. Controlla l'errore nei logs

**Errori comuni:**

| Errore | Causa | Soluzione |
|--------|-------|-----------|
| `invalid-credential` | FIREBASE_PRIVATE_KEY mancante/errato | Verifica valore variabile |
| `project_id required` | FIREBASE_PROJECT_ID mancante | Aggiungi variabile |
| `VAPID keys not configured` | VAPID keys mancanti | Aggiungi VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY |

---

## 💡 Suggerimenti

### Se hai già un sito Netlify funzionante con Firebase:

1. Vai al **vecchio sito** Netlify
2. Copia le variabili `FIREBASE_*` da lì
3. Incollale nel **nuovo sito**
4. Aggiungi solo le 2 nuove variabili `VAPID_*`

### Automatizza con Netlify CLI (opzionale):

```bash
# Se hai netlify-cli installato
netlify env:set VAPID_PUBLIC_KEY "BI9gOKRddotrncfkYftX0CRDhzE9BpHxqWULvYBiuJ2g7NctyoUeEaQ6Bw5ptBiViiPTDUpWNdXO_qUBzfplMqM"
netlify env:set VAPID_PRIVATE_KEY "WOkYBn4ch0dNb2VfVovVE8KwfH70yUzi603ZlZlG6OI"
netlify env:set FIREBASE_PROJECT_ID "m-padelweb"
# etc...
```

---

## 📞 Supporto

Se continui ad avere problemi:

1. **Controlla** i log delle Functions in Netlify
2. **Copia** l'errore esatto dalla console
3. **Verifica** che tutte le 5 variabili siano configurate correttamente
4. **Prova** a rigenerare le chiavi VAPID se necessario

---

## ✅ Successo!

Quando funziona, dovresti vedere:

1. ✅ Permesso notifiche richiesto dal browser
2. ✅ Badge verde "Attivate" nel pannello
3. ✅ Cliccando "Invia Test" → notifica push ricevuta
4. ✅ In Firestore: collection `pushSubscriptions` creata con il tuo userId

🎉 **Le notifiche push sono attive!**
