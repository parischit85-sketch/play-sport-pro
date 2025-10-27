# 🔧 FIX CORS - Firebase Storage

## ❌ PROBLEMA

**Errore riscontrato**:
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Causa**: Firebase Storage non ha configurazione CORS per permettere richieste da localhost

**Impatto**: 
- ❌ Impossibile scaricare PDF certificati medici
- ❌ Blocco funzionalità PlayerMedicalTab
- ❌ Gli utenti non possono vedere i loro certificati

---

## ✅ SOLUZIONE - METODO 1: Firebase Console (VELOCE - 2 minuti)

### Step 1: Installa Google Cloud SDK

1. Scarica da: https://cloud.google.com/sdk/docs/install
2. Esegui l'installer
3. Riavvia il terminale

### Step 2: Configura CORS

```powershell
# 1. Autenticati
gcloud auth login

# 2. Imposta progetto
gcloud config set project m-padelweb

# 3. Applica CORS
gsutil cors set cors.json gs://m-padelweb.firebasestorage.app
```

---

## ✅ SOLUZIONE - METODO 2: Firebase Storage Rules (ALTERNATIVA)

### Modifica firebasestorage.rules

Aggiungi header CORS nelle rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
      
      // CORS headers
      allow get: if resource.metadata.cors == true;
    }
  }
}
```

**NOTA**: Questo metodo NON risolve completamente il problema CORS. 
Il METODO 1 è preferibile.

---

## ✅ SOLUZIONE - METODO 3: Proxy Server (WORKAROUND TEMPORANEO)

### Crea endpoint proxy nel backend

```javascript
// Firebase Functions - proxy per download PDF
import { onRequest } from 'firebase-functions/v2/https';
import { getStorage } from 'firebase-admin/storage';

export const downloadCertificate = onRequest(async (req, res) => {
  // Abilita CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET');
  
  const filePath = req.query.path;
  const bucket = getStorage().bucket();
  const file = bucket.file(filePath);
  
  const [buffer] = await file.download();
  res.set('Content-Type', 'application/pdf');
  res.send(buffer);
});
```

---

## 📋 FILE CORS CREATO

**File**: `cors.json`

```json
{
  "origin": ["*"],
  "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
  "maxAgeSeconds": 3600,
  "responseHeader": ["Content-Type", "Content-Disposition"]
}
```

**Configurazione**:
- ✅ Permette richieste da qualsiasi origine (*)
- ✅ Supporta tutti i metodi HTTP necessari
- ✅ Cache CORS per 1 ora
- ✅ Headers permessi per download file

---

## 🔒 CONFIGURAZIONE CORS SICURA (PRODUZIONE)

Per produzione, limita le origins:

```json
{
  "origin": [
    "https://play-sport.pro",
    "https://www.play-sport.pro",
    "http://localhost:5173"
  ],
  "method": ["GET", "HEAD"],
  "maxAgeSeconds": 3600,
  "responseHeader": ["Content-Type", "Content-Disposition"]
}
```

---

## 🧪 TESTING DOPO FIX

### Test 1: Verifica CORS configurato

```bash
gsutil cors get gs://m-padelweb.firebasestorage.app
```

**Output atteso**:
```json
[{"origin": ["*"], "method": ["GET", "HEAD", ...]}]
```

### Test 2: Testa download PDF

1. Vai su: http://localhost:5173/sporting-cat/players
2. Apri un player con certificato
3. Clicca tab "Certificato Medico"
4. Clicca "Scarica PDF"
5. Il download dovrebbe partire senza errori CORS

---

## 📝 COMANDI UTILI

### Verifica configurazione attuale
```bash
gsutil cors get gs://m-padelweb.firebasestorage.app
```

### Rimuovi CORS (reset)
```bash
gsutil cors set /dev/null gs://m-padelweb.firebasestorage.app
```

### Lista file nel bucket
```bash
gsutil ls gs://m-padelweb.firebasestorage.app/clubs/sporting-cat/medical-certificates/
```

---

## ⚠️ NOTE IMPORTANTI

1. **CORS non è firewall**: Protegge solo richieste browser, non API dirette
2. **Storage Rules**: Mantieni comunque regole sicure in firebasestorage.rules
3. **Wildcard (*)**: Accettabile per sviluppo, limitare in produzione
4. **Cache**: Modifiche CORS possono richiedere fino a 1 ora per propagarsi

---

## 🚀 AZIONE IMMEDIATA RICHIESTA

**METODO CONSIGLIATO**: Installa Google Cloud SDK e applica CORS

```powershell
# 1. Scarica SDK: https://cloud.google.com/sdk/docs/install
# 2. Installa
# 3. Riavvia terminale
# 4. Esegui:
gcloud auth login
gcloud config set project m-padelweb
gsutil cors set cors.json gs://m-padelweb.firebasestorage.app
```

**Tempo richiesto**: ~5 minuti  
**Impatto**: Risolve problema CORS definitivamente

---

*Documento creato il: 10 Ottobre 2025*  
*Priorità: ALTA - Blocca funzionalità certificati medici*
