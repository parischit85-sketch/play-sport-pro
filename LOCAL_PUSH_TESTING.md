# Testing Notifiche Push in Locale

## 🎯 Setup Completo per Testing Locale

Questa guida ti permette di testare le notifiche push in locale con HTTPS e Netlify Functions funzionanti.

---

## 📋 Prerequisiti

1. ✅ Node.js installato
2. ✅ Netlify CLI installato globalmente
3. ✅ File `.env.local` creato con le credenziali

---

## 🔧 Installazione Netlify CLI

Se non l'hai già installato:

```powershell
npm install -g netlify-cli
```

Verifica l'installazione:

```powershell
netlify --version
```

---

## 🚀 Avvio del Server di Sviluppo Locale

### Opzione 1: Con Netlify Dev (CONSIGLIATO)

Netlify Dev crea automaticamente:
- ✅ HTTPS locale con certificato autofirmato
- ✅ Proxy per le Netlify Functions
- ✅ Environment variables da `.env.local`

**Comando:**

```powershell
netlify dev
```

Il sito sarà disponibile su: **https://localhost:8888**

### Opzione 2: Solo Vite Dev (senza Functions)

Se vuoi solo testare il frontend senza le notifiche:

```powershell
npm run dev
```

⚠️ **Attenzione**: Questo NON eseguirà le Netlify Functions, quindi le notifiche push non funzioneranno.

---

## 🔐 Gestione Certificato HTTPS

Quando apri `https://localhost:8888` per la prima volta, vedrai un avviso di sicurezza perché il certificato è autofirmato.

### Chrome/Edge:
1. Clicca su **"Avanzate"** o **"Advanced"**
2. Clicca su **"Procedi su localhost (non sicuro)"**
3. Accetta il certificato

### Firefox:
1. Clicca su **"Avanzate"**
2. Clicca su **"Accetta il rischio e continua"**

---

## 🧪 Testing delle Notifiche

### 1. Avvia il Server

```powershell
netlify dev
```

### 2. Apri il Browser

Vai su: **https://localhost:8888**

### 3. Accedi all'App

- Fai login con il tuo account
- Vai su **Profilo**

### 4. Abilita le Notifiche

- Scorri fino a **"Notifiche Push"**
- Clicca su **"Attiva Notifiche"**
- Accetta il permesso del browser

### 5. Invia una Notifica di Test

- Clicca su **"Invia Notifica di Test"**
- Dovresti ricevere la notifica sul desktop

### 6. Controlla i Log

**Nel terminale dove hai eseguito `netlify dev`**, vedrai i log delle Functions:

```
[save-push-subscription] Saving subscription for userId: ...
[send-push] Sending notification to user: ...
```

**Nella Console del Browser (F12 → Console)**:

```
[saveSubscription] Saving subscription for userId: ...
[saveSubscription] Response status: 200
✅ Sottoscrizione push salvata con successo
```

---

## 📂 Verifica Firestore

Le sottoscrizioni vengono salvate nel **vero database Firestore** (non in un mock locale).

Per verificare:
1. Apri Firebase Console: https://console.firebase.google.com/
2. Vai su **Firestore Database**
3. Cerca la collection **`pushSubscriptions`**
4. Verifica che ci sia il tuo documento con endpoint localhost

---

## 🔄 Hot Reload

Con `netlify dev`:
- ✅ **Frontend**: Hot reload automatico (grazie a Vite)
- ⚠️ **Functions**: Devi **riavviare** `netlify dev` se modifichi le Functions

**Workflow consigliato**:
1. Tieni aperto `netlify dev` in un terminale
2. Modifica il codice frontend → hot reload automatico
3. Se modifichi una Function → Ctrl+C e riavvia `netlify dev`

---

## 🐛 Debugging

### Vedere i Log delle Functions

I log appaiono automaticamente nel terminale dove hai eseguito `netlify dev`.

Per log più dettagliati, aggiungi `console.log()` nelle Functions:

```javascript
exports.handler = async (event, context) => {
  console.log('[DEBUG] Event body:', event.body);
  console.log('[DEBUG] User ID:', JSON.parse(event.body).userId);
  // ...
};
```

### Testare una Function Singola

Puoi invocare una Function direttamente:

```powershell
netlify functions:invoke send-push --payload '{"userId":"test123"}'
```

---

## ⚠️ Limitazioni del Testing Locale

1. **Certificato autofirmato**: Il browser mostrerà sempre un avviso (normale)
2. **Service Worker**: Potrebbe non funzionare al 100% come in produzione
3. **Firebase**: Usa il database di produzione (attenzione!)

---

## 🎯 Testing delle Modifiche Future

Quando vuoi testare modifiche alle notifiche push:

### 1. Modifica Frontend (es. `PushNotificationPanel.jsx`)

```powershell
# Il server è già in esecuzione con `netlify dev`
# Salva il file → hot reload automatico
```

### 2. Modifica Function (es. `send-push.js`)

```powershell
# Ferma il server: Ctrl+C
# Riavvia:
netlify dev
```

### 3. Testa la Notifica

```
1. Vai su https://localhost:8888/profile
2. Clicca "Invia Notifica di Test"
3. Verifica che arrivi la notifica modificata
```

---

## 🔧 Troubleshooting

### Errore: "netlify: comando non trovato"

**Soluzione**:
```powershell
npm install -g netlify-cli
```

### Errore: "VAPID keys not configured"

**Soluzione**: Verifica che il file `.env.local` esista e contenga le chiavi VAPID.

### Le Functions non funzionano

**Soluzione**:
1. Verifica che `netlify.toml` abbia `functions = "netlify/functions"`
2. Riavvia `netlify dev`

### Certificato HTTPS non accettato

**Soluzione**: Clicca su "Avanzate" → "Procedi su localhost"

---

## 📚 Comandi Utili

```powershell
# Avvia server con HTTPS + Functions
netlify dev

# Avvia solo su porta specifica
netlify dev --port 9999

# Vedi lo stato del sito Netlify
netlify status

# Vedi i log delle Functions in produzione
netlify functions:log send-push

# Lista delle Functions
netlify functions:list
```

---

## ✅ Checklist Pre-Testing

Prima di iniziare il testing:

- [ ] `.env.local` creato con tutte le variabili
- [ ] `netlify dev` funziona senza errori
- [ ] Browser aperto su `https://localhost:8888`
- [ ] Certificato HTTPS accettato
- [ ] Login effettuato nell'app
- [ ] Console del browser aperta (F12)
- [ ] Terminale visibile per vedere i log delle Functions

---

## 🎉 Workflow Completo di Testing

```
1. Apri VS Code
2. Apri terminale: `netlify dev`
3. Apri browser: https://localhost:8888
4. Fai login
5. Vai su Profilo
6. Testa le notifiche
7. Modifica il codice
8. (Se modifichi Functions: riavvia netlify dev)
9. Testa di nuovo
10. Quando sei soddisfatto: commit & push
```

---

Ora sei pronto per testare tutte le modifiche future alle notifiche push! 🚀
