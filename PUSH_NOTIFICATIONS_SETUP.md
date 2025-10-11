# 🎯 GUIDA RAPIDA: Configurazione Push Notifications

## ⚡ Opzione 1: Script Automatico (RACCOMANDATO)

```powershell
# 1. Installa Netlify CLI (se non l'hai già)
npm install -g netlify-cli

# 2. Login su Netlify
netlify login

# 3. Scarica le credenziali Firebase
#    Firebase Console → Project Settings → Service Accounts → Generate new private key

# 4. Esegui lo script
.\setup-netlify-env.ps1
```

---

## 🖱️ Opzione 2: Configurazione Manuale via Web

### Passo 1: Vai su Netlify Dashboard
1. Apri https://app.netlify.com
2. Seleziona il tuo sito PlaySport
3. Vai su **Site settings** → **Environment variables**

### Passo 2: Aggiungi VAPID Keys

Clicca **Add a variable** e aggiungi:

**Nome:** `VAPID_PUBLIC_KEY`  
**Valore:** `BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM809QTxc85X9oiHFKLovhxCpTgpAQV8zX6iJwLKy_wmMEQx7HHZUKrXusdM`

**Nome:** `VAPID_PRIVATE_KEY`  
**Valore:** `I-rY8mHqxKzGnDo5_EqT7jPpVHxGBpfWvLJhMxCqf7I`

### Passo 3: Scarica Credenziali Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com)
2. Seleziona il progetto PlaySport
3. Vai su **⚙️ Project Settings** → **Service Accounts**
4. Clicca **Generate new private key**
5. Salva il file JSON

### Passo 4: Aggiungi Firebase Credentials

Apri il file JSON scaricato e copia i valori:

**Nome:** `FIREBASE_PROJECT_ID`  
**Valore:** (copia `project_id` dal JSON)

**Nome:** `FIREBASE_CLIENT_EMAIL`  
**Valore:** (copia `client_email` dal JSON)

**Nome:** `FIREBASE_PRIVATE_KEY`  
**Valore:** (copia `private_key` dal JSON)

⚠️ **ATTENZIONE:** Per `FIREBASE_PRIVATE_KEY`:
- Devi **escapare** i caratteri `\n`
- Sostituisci ogni `\n` con `\\n`
- Esempio:
  ```
  DA:  "-----BEGIN PRIVATE KEY-----\nMIIEvgIBA...\n-----END PRIVATE KEY-----\n"
  A:   "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBA...\\n-----END PRIVATE KEY-----\\n"
  ```

### Passo 5: Salva e Redeploy

1. Clicca **Save** per ogni variabile
2. Netlify rifarà automaticamente il deploy
3. Aspetta che il deploy sia completato (1-2 minuti)

---

## ✅ Verifica Configurazione

1. Vai su `/profile` nell'app
2. Scorri fino alla sezione "Diagnostica notifiche push"
3. Clicca **"Diagnostica server push"**
4. Dovresti vedere:
   ```
   ✅ VAPID public key: configurato
   ✅ VAPID private key: configurato
   ✅ Firebase project ID: configurato
   ✅ Firebase client email: configurato
   ✅ Firebase private key: configurato
   ✅ Firebase Admin: success
   ✅ allConfigured: true
   ```

---

## 🧪 Test Notifiche

1. Nella pagina `/profile`, clicca **"Iscriviti alle notifiche"**
2. Autorizza le notifiche quando richiesto dal browser
3. Clicca **"Invia notifica di test"**
4. Dovresti ricevere una notifica push!

---

## ❌ Problemi Comuni

### "Firebase Admin: failed"
**Causa:** FIREBASE_PRIVATE_KEY non correttamente escaped  
**Soluzione:** Assicurati di aver sostituito `\n` con `\\n`

### "allConfigured: false"
**Causa:** Una o più variabili mancanti  
**Soluzione:** Verifica che tutti e 5 i valori siano configurati correttamente

### Notifiche non ricevute
**Causa:** Permessi browser non concessi  
**Soluzione:** Vai nelle impostazioni del browser → Notifiche → Consenti per il tuo sito

### Service Worker non registrato
**Causa:** Browser cache  
**Soluzione:** Apri DevTools → Application → Service Workers → Unregister → Ricarica pagina

---

## 📞 Supporto

Se hai problemi:
1. Controlla la console browser (F12)
2. Verifica i log di Netlify Functions
3. Controlla che tutte le variabili siano configurate correttamente
4. Riprova con uno script automatico se la configurazione manuale fallisce
