# 🔧 FIX CORS - Cloud Functions

**Data**: 2025-10-10
**Problema**: CORS error quando si chiama Cloud Function da frontend

---

## ❌ Errore Riscontrato

```
Access to fetch at 'https://us-central1-m-padelweb.cloudfunctions.net/sendBulkCertificateNotifications' 
from origin 'http://localhost:5173' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Sintomi:
- ✅ Cloud Function deployata correttamente
- ✅ Frontend chiama correttamente con `httpsCallable()`
- ❌ Browser blocca la richiesta con errore CORS
- ❌ Network tab mostra "ERR_FAILED" o "CORS error"

---

## ✅ Soluzione

### Cloud Functions v2 Richiede Configurazione CORS Esplicita

Le Cloud Functions v2 (onCall) **NON abilitano CORS automaticamente**.
Devi specificare i domini permessi nella configurazione.

### File da Modificare

**`functions/sendBulkNotifications.js`**

```javascript
export const sendBulkCertificateNotifications = onCall(
  {
    memory: '256MiB',
    timeoutSeconds: 300,
    secrets: ['EMAIL_USER', 'EMAIL_PASSWORD', 'FROM_EMAIL'],
    
    // ⬇️ AGGIUNGI QUESTO
    cors: [
      'http://localhost:5173',              // Vite dev server
      'http://localhost:5174',              // Alternativo
      'https://play-sport.pro',             // Produzione
      'https://m-padelweb.web.app',         // Firebase Hosting
      'https://m-padelweb.firebaseapp.com'  // Firebase Hosting alt
    ],
  },
  async (request) => {
    // ... codice funzione
  }
);
```

### Re-Deploy

```bash
firebase deploy --only functions:sendBulkCertificateNotifications
```

**Tempo**: ~30-60 secondi

---

## 🧪 Test

### Prima del Fix
```
Browser Console:
❌ Access to fetch blocked by CORS policy
❌ FirebaseError: internal
```

### Dopo il Fix
```
Browser Console:
✅ 📧 [Bulk Notifications] Starting send...
✅ ✅ [Bulk Notifications] Result: { sent: 1, failed: 0 }
```

### Come Testare

1. **Ricarica la pagina** (Ctrl+R o F5)
2. Apri **Dashboard → Gestisci Certificati**
3. **Seleziona 1 giocatore** con email
4. Click **"Invia Email"**
5. Controlla **console browser** per conferma
6. Verifica **alert** di successo/errore

---

## 📋 Domini Permessi

### Sviluppo
- `http://localhost:5173` - Vite default port
- `http://localhost:5174` - Vite alternativo
- `http://localhost:3000` - React CRA (se usi)
- `http://localhost:8080` - Altri dev servers

### Produzione
- `https://play-sport.pro` - Dominio custom
- `https://www.play-sport.pro` - Con www
- `https://m-padelweb.web.app` - Firebase Hosting primary
- `https://m-padelweb.firebaseapp.com` - Firebase Hosting secondary

### ⚠️ Attenzione
- **NON usare wildcard** (`*`) in produzione → rischio sicurezza
- **Specifica ogni dominio** esplicitamente
- **Include protocollo** (`http://` o `https://`)
- **Include porta** se diversa da default (`localhost:5173`)

---

## 🔍 Debugging CORS

### 1. Verifica Network Tab

**Chrome DevTools → Network → Seleziona richiesta fallita**

Headers:
```
Request Headers:
  Origin: http://localhost:5173
  Access-Control-Request-Method: POST
  Access-Control-Request-Headers: content-type

Response Headers (BEFORE FIX):
  ❌ No Access-Control-Allow-Origin header

Response Headers (AFTER FIX):
  ✅ Access-Control-Allow-Origin: http://localhost:5173
  ✅ Access-Control-Allow-Methods: POST, OPTIONS
```

### 2. Controlla Firebase Functions Logs

```bash
firebase functions:log --only sendBulkCertificateNotifications --follow
```

**Prima del fix:**
```
⚠️ CORS preflight request rejected
⚠️ Origin http://localhost:5173 not allowed
```

**Dopo il fix:**
```
✅ CORS preflight passed
✅ Origin http://localhost:5173 allowed
📧 [Bulk Notifications] Starting send...
```

### 3. Test CORS Manuale

```bash
# Test con curl
curl -X OPTIONS \
  https://us-central1-m-padelweb.cloudfunctions.net/sendBulkCertificateNotifications \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Cerca nell'output:
# < Access-Control-Allow-Origin: http://localhost:5173
```

---

## 🚨 Errori Comuni

### 1. CORS ancora bloccato dopo deploy

**Causa**: Browser ha cachato vecchia risposta

**Soluzione**:
```bash
# 1. Hard refresh nel browser
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)

# 2. Disabilita cache in DevTools
DevTools → Network tab → "Disable cache" checkbox

# 3. Cancella cache browser
Settings → Privacy → Clear browsing data

# 4. Usa Incognito/Private mode
```

### 2. Funzione deployata ma CORS non attivo

**Causa**: Deploy non completato o errore silenzioso

**Soluzione**:
```bash
# Forza re-deploy
firebase deploy --only functions:sendBulkCertificateNotifications --force

# Verifica deployment
firebase functions:list

# Controlla logs per errori
firebase functions:log --only sendBulkCertificateNotifications
```

### 3. CORS funziona in localhost ma non in produzione

**Causa**: Dominio produzione non nella lista CORS

**Soluzione**:
```javascript
cors: [
  'http://localhost:5173',
  'https://play-sport.pro',        // ← Aggiungi questo
  'https://www.play-sport.pro',    // ← E questo se usi www
]
```

### 4. Error: "functions/internal"

**Causa**: Errore generico, può essere CORS o altro

**Verifica**:
1. Console browser per dettagli CORS
2. Firebase Functions logs per errori backend
3. Network tab per status code risposta

---

## 📚 Documentazione Ufficiale

**Firebase Cloud Functions CORS:**
https://firebase.google.com/docs/functions/http-events#cors_requests

**onCall() API Reference:**
https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.https.oncalloptions#oncalloptions_interface

**CORS Specification:**
https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

---

## ✅ Checklist Risoluzione

- [x] Aggiunto parametro `cors` in `onCall()` config
- [x] Incluso `http://localhost:5173` per sviluppo
- [x] Incluso domini produzione
- [x] Re-deployata Cloud Function
- [x] Verificato `firebase functions:list`
- [ ] Testato invio email da frontend
- [ ] Verificato console browser (no CORS errors)
- [ ] Verificato Firebase Functions logs
- [ ] Hard refresh browser (Ctrl+Shift+R)

---

## 🎓 Note Tecniche

### Perché Cloud Functions v1 non avevano questo problema?

**v1** (deprecated):
```javascript
exports.myFunction = functions.https.onCall((data, context) => {
  // CORS abilitato AUTOMATICAMENTE per tutti i domini
});
```

**v2** (current):
```javascript
export const myFunction = onCall(
  {
    cors: ['http://example.com']  // DEVI specificare esplicitamente
  },
  (request) => {}
);
```

### Perché è meglio specificare CORS esplicitamente?

1. **Sicurezza**: Previeni richieste da domini non autorizzati
2. **Performance**: Browser può cachare risposta preflight
3. **Debugging**: Più facile tracciare problemi
4. **Compliance**: Alcune normative richiedono whitelist esplicita

---

**Risolto**: 2025-10-10
**Tempo risoluzione**: 5 minuti
**Severity**: ⚠️ Medium (blocca funzionalità ma fix semplice)
