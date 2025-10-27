# Test Push Notifications - Guida Locale vs Produzione

## ⚠️ Errore 404 in Sviluppo Locale

L'errore che vedi è **NORMALE** in development:

```
POST http://localhost:5173/.netlify/functions/save-push-subscription 404 (Not Found)
```

**Perché?** Le Netlify Functions NON girano automaticamente su `localhost:5173` (Vite dev server).

---

## 🎯 Soluzioni per Testing

### Opzione 1: Test in Produzione ✅ CONSIGLIATA

**Questa è la via più semplice e veloce:**

1. **Aspetta il deploy su Netlify** (dovrebbe essere già in corso)
2. **Configura le variabili d'ambiente** (vedi `NETLIFY_VAPID_SETUP.md`)
3. **Testa sul sito live** (es: `https://play-sport-pro.netlify.app`)

**Vantaggi:**
- Zero configurazione locale
- Test ambiente reale
- HTTPS automatico (richiesto per push notifications)
- Funzioni già deployate

**Step:**
```
1. Vai su https://app.netlify.com
2. Site Configuration → Environment Variables
3. Aggiungi VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY
4. Trigger deploy
5. Apri il sito → Profilo → Testa le notifiche
```

---

### Opzione 2: Test Locale con Netlify Dev 🛠️

**Solo se vuoi sviluppare ulteriormente le funzioni:**

#### 1. Installa Netlify CLI

```powershell
npm install -g netlify-cli
```

#### 2. Configura variabili d'ambiente locali

Crea/modifica `.env` nella root del progetto:

```env
VAPID_PUBLIC_KEY=BI9gOKRddotrncfkYftX0CRDhzE9BpHxqWULvYBiuJ2g7NctyoUeEaQ6Bw5ptBiViiPTDUpWNdXO_qUBzfplMqM
VAPID_PRIVATE_KEY=WOkYBn4ch0dNb2VfVovVE8KwfH70yUzi603ZlZlG6OI
```

#### 3. Avvia Netlify Dev

**INVECE** di `npm run dev`, usa:

```powershell
netlify dev
```

Questo avvierà:
- ✅ Vite dev server
- ✅ Netlify Functions su `http://localhost:8888/.netlify/functions/`
- ✅ Proxy automatico tra Vite e Functions

#### 4. Apri il Browser

```
http://localhost:8888
```

**NON** `localhost:5173` - usa la porta 8888 di Netlify Dev!

---

## 🔍 Come Verificare che Funzioni

### In Produzione:

1. **Apri DevTools** (F12)
2. **Console tab**
3. Vai a **Profilo** → Scorri alla sezione "Notifiche Push"
4. Clicca **"Attiva Notifiche"**
5. **Dovresti vedere:**
   ```
   ✅ Push subscription successful
   ```
   **SENZA** errori 404

6. Clicca **"Invia Notifica di Test"**
7. **Dovresti ricevere:** una notifica push del sistema

### In Locale (con Netlify Dev):

Stessi step, ma su `http://localhost:8888`

---

## 🐛 Troubleshooting

### Errore: "404 Not Found" per le funzioni

**In development (vite):**
- ✅ NORMALE - le funzioni non girano
- 🔧 Soluzione: Usa `netlify dev` invece di `npm run dev`

**In produzione:**
- ❌ PROBLEMA - controlla il deploy
- 🔍 Verifica: Netlify Dashboard → Functions → Dovresti vedere 3 funzioni deployate

### Errore: "VAPID keys not configured"

- Verifica variabili d'ambiente in Netlify
- Redeploy dopo averle aggiunte
- Nome esatto: `VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY`

### Permesso negato

- Browser deve supportare push (Chrome, Firefox, Edge)
- HTTPS obbligatorio (Netlify lo fornisce automaticamente)
- Controlla impostazioni notifiche browser

### Notifica non arriva

1. **Controlla console browser** per errori
2. **Verifica Firestore:**
   - Vai su Firebase Console
   - Firestore Database
   - Cerca collection `pushSubscriptions`
   - Verifica che ci sia un documento con il tuo `userId`
3. **Controlla log Netlify Functions:**
   - Netlify Dashboard → Functions → `send-push`
   - Vedi log in real-time

---

## 📊 Cosa Fa il Sistema

### Flow Completo:

```
1. Utente clicca "Attiva Notifiche"
   ↓
2. Browser richiede permesso
   ↓
3. Se accettato: Service Worker crea subscription
   ↓
4. Client chiama: /.netlify/functions/save-push-subscription
   ↓
5. Funzione salva in Firestore (collection: pushSubscriptions)
   ↓
6. ✅ Utente sottoscritto

--- TEST ---

7. Utente clicca "Invia Test"
   ↓
8. Client chiama: /.netlify/functions/send-push
   ↓
9. Funzione legge subscription da Firestore
   ↓
10. Funzione invia push via web-push library
   ↓
11. 🔔 Notifica arriva al dispositivo
```

---

## 🎯 Raccomandazione

### Per Testing Rapido:

**USA PRODUZIONE** - è più veloce e realistico:

1. ⏳ Aspetta deploy Netlify (2-3 minuti)
2. ⚙️ Configura ENV vars (2 minuti)
3. 🔄 Redeploy (2 minuti)
4. ✅ Testa sul sito live (1 minuto)

**Totale: ~7 minuti** vs setup Netlify Dev locale

### Per Sviluppo Continuo:

**USA NETLIFY DEV** - se devi modificare le funzioni:

1. Installa `netlify-cli`
2. Configura `.env` locale
3. Usa `netlify dev` invece di `npm run dev`
4. Sviluppa e testa in real-time

---

## 📝 Note Importanti

1. **HTTPS obbligatorio** - le push notification funzionano SOLO su HTTPS
   - ✅ Netlify fornisce HTTPS automaticamente
   - ⚠️ `localhost:5173` non ha HTTPS (usa `netlify dev`)

2. **Service Worker** - deve essere registrato
   - ✅ Il tuo SW è già configurato in `public/sw.js`
   - ✅ Vedi log: "Service Worker activated"

3. **Browser Support** - solo Chrome, Firefox, Edge
   - ❌ Safari iOS NON supporta Web Push (per ora)
   - ✅ Safari macOS supporta (da Safari 16+)

4. **Firestore Rules** - assicurati che permettano write/read
   - Le subscription sono salvate in `pushSubscriptions` collection
   - Serve permesso write per l'utente autenticato

---

## 🚀 Next Steps

**Procedi così:**

1. ✅ Ignora l'errore 404 in development locale
2. 📋 Segui la guida in `NETLIFY_VAPID_SETUP.md`
3. 🧪 Testa in produzione dopo il deploy
4. 🎉 Se funziona, festeggia! 🎊

**Se vuoi sviluppare ulteriormente:**

5. 🔧 Installa `netlify-cli`
6. 🏃 Usa `netlify dev` per testing locale
