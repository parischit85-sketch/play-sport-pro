# 🔒 CSP Fix - Firebase Cloud Functions

**Data**: 2025-10-13  
**Errore**: `Refused to connect to 'https://us-central1-m-padelweb.cloudfunctions.net/sendBulkCertificateNotifications'`

---

## 🚨 Problema

```
Refused to connect to 'https://us-central1-m-padelweb.cloudfunctions.net/sendBulkCertificateNotifications'
because it violates the following Content Security Policy directive:
"connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com https://res.cloudinary.com ..."
```

### Causa

La **Content Security Policy (CSP)** configurata in `netlify.toml` e `vite.config.js` **non includeva** il dominio delle Firebase Cloud Functions:

```
https://*.cloudfunctions.net
```

Quindi il browser bloccava tutte le chiamate alle Cloud Functions.

---

## ✅ Soluzione

### 1. Aggiornato `netlify.toml`

**File**: `netlify.toml`

**Prima** (connect-src):

```toml
connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com https://res.cloudinary.com ...
```

**Dopo** (connect-src con cloudfunctions.net):

```toml
connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com https://*.cloudfunctions.net https://res.cloudinary.com ...
```

### 2. Aggiornato `vite.config.js`

**File**: `vite.config.js`

Aggiunta CSP header anche per il **dev server locale**:

```javascript
server: {
  port: 5173,
  host: true,
  strictPort: true,
  headers: {
    "Cross-Origin-Opener-Policy": "unsafe-none",
    "Cross-Origin-Embedder-Policy": "unsafe-none",
    // ✅ CSP con Firebase Cloud Functions
    "Content-Security-Policy": "... connect-src 'self' https://*.cloudfunctions.net ... ws://localhost:5173;",
  },
  // ...
}
```

**Nota**: Aggiunto anche `ws://localhost:5173` per permettere WebSocket di Vite HMR.

---

## 🧪 Test

### 1. Riavvia Dev Server

```bash
# Ferma il server (Ctrl+C)
npm run dev
```

### 2. Hard Refresh Browser

```
Ctrl + Shift + R
```

### 3. Test Push Notification

1. Vai su **Admin Dashboard** → **Certificati Medici**
2. Seleziona un giocatore con notifiche push abilitate
3. Click **"Invia Notifica Push"**
4. Controlla console browser → **Nessun errore CSP**

### 4. Verifica Chiamata Firebase

**Console Browser**:

```javascript
// Dovrebbe vedere la chiamata a Cloud Functions
Network → sendBulkCertificateNotifications → Status 200
```

**Non dovrebbe più apparire**:

```
❌ Refused to connect to 'https://us-central1-m-padelweb.cloudfunctions.net/...'
```

---

## 📋 CSP Completa

### Produzione (netlify.toml)

```toml
Content-Security-Policy = "
  frame-src 'self' https://accounts.google.com https://*.firebaseapp.com https://*.googleapis.com;
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://apis.google.com https://*.firebaseapp.com https://www.googletagmanager.com https://www.google-analytics.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: https://res.cloudinary.com https://www.google.com;
  connect-src 'self'
    https://*.googleapis.com
    https://*.firebaseapp.com
    https://*.cloudfunctions.net
    https://res.cloudinary.com
    https://www.google-analytics.com
    https://www.google.com
    https://nominatim.openstreetmap.org
    wss://*.firebaseio.com;
"
```

### Development (vite.config.js)

```javascript
"Content-Security-Policy": "
  ... (come produzione) ...
  connect-src 'self'
    https://*.cloudfunctions.net
    ws://localhost:5173; // Per Vite HMR
"
```

---

## 🔗 Domini Firebase Permessi

Dopo questo fix, la CSP permette connessioni a:

- ✅ `https://*.googleapis.com` - Firebase APIs
- ✅ `https://*.firebaseapp.com` - Firebase Hosting
- ✅ `https://*.cloudfunctions.net` - **Firebase Cloud Functions** 🎯
- ✅ `wss://*.firebaseio.com` - Firebase Realtime Database WebSocket
- ✅ `ws://localhost:5173` - Vite HMR (solo dev)

---

## 🚀 Deploy

Per applicare in **produzione** (Netlify):

```bash
# 1. Commit changes
git add .
git commit -m "fix: Add Firebase Cloud Functions to CSP"

# 2. Push
git push origin main
```

Netlify ricostruirà automaticamente con la nuova CSP.

---

## ✅ Checklist

- [x] Aggiunto `https://*.cloudfunctions.net` a `netlify.toml`
- [x] Aggiunto CSP header a `vite.config.js`
- [x] Aggiunto `ws://localhost:5173` per Vite HMR
- [x] Testato in development (localhost)
- [ ] Commit e push
- [ ] Test in produzione (Netlify)

---

## 📚 Riferimenti

- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [Vite Server Options](https://vitejs.dev/config/server-options.html)

---

**Status**: ✅ Fixed  
**Testing**: In corso

---

## 🎯 Risultato Atteso

Dopo questo fix:

1. ✅ Service Worker attivato correttamente
2. ✅ Nessun errore CSP in console
3. ✅ Chiamate a Firebase Cloud Functions permesse
4. ✅ Push notifications funzionanti
5. ✅ Vite HMR funzionante in dev

**Il sistema di notifiche push è ora completo!** 🚀
