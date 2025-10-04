# 🔧 Fix Completo Service Worker + CSP

## Problema Risolto ✅

### Root Cause Identificata

Il problema aveva **DUE livelli**:

1. **CSP in `netlify.toml`** ✅ (Già fixato)
2. **Service Worker intercettava richieste esterne** ❌ (Appena fixato)

### Sintomo

```
❌ sw.js:229 Refused to connect to 'https://apis.google.com/...'
❌ sw.js:137 Refused to connect to 'https://res.cloudinary.com/...'
```

## Soluzione Applicata

### Fix 1: CSP Headers (netlify.toml)

Aggiornato il Content Security Policy per permettere domini esterni:

```toml
Content-Security-Policy = "
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
    https://apis.google.com              ← AGGIUNTO
    https://res.cloudinary.com           ← AGGIUNTO
    https://www.googletagmanager.com     ← AGGIUNTO
    ...
"
```

### Fix 2: Service Worker (public/sw.js)

**Problema**: Il SW intercettava TUTTE le richieste fetch, anche quelle a domini esterni, causando conflitti CSP.

**Soluzione**: Aggiunto skip esplicito per domini esterni:

```javascript
// Enhanced fetch handling
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension:')) {
    return;
  }

  const url = new URL(event.request.url);

  // ✅ SKIP domini esterni - lascia che il browser li gestisca
  const externalDomains = [
    'apis.google.com',
    'res.cloudinary.com',
    'www.googletagmanager.com',
    'www.google-analytics.com',
    'accounts.google.com',
  ];

  if (externalDomains.some((domain) => url.hostname.includes(domain))) {
    return; // Browser gestisce direttamente, SW non interviene
  }

  // Continua con strategie di cache per altri domini...
});
```

### Versione Service Worker

Aggiornato `CACHE_VERSION` da `v1.9.0` → `v1.10.0` per forzare il refresh.

## Dettagli Tecnici

### Prima (❌ Bloccato)

```
1. Browser → richiesta a apis.google.com
2. Service Worker intercetta
3. SW prova fetch(request)
4. CSP del SW blocca la richiesta
5. ❌ Errore: "Refused to connect"
```

### Dopo (✅ Funzionante)

```
1. Browser → richiesta a apis.google.com
2. Service Worker rileva dominio esterno
3. SW fa return (skip)
4. Browser gestisce direttamente con suo CSP
5. ✅ Richiesta completata
```

## Domini Esclusi dal SW

| Dominio                    | Motivo             | Usato Per    |
| -------------------------- | ------------------ | ------------ |
| `apis.google.com`          | Google Auth API    | Login Google |
| `res.cloudinary.com`       | CDN immagini       | Loghi club   |
| `www.googletagmanager.com` | Google Tag Manager | Analytics    |
| `www.google-analytics.com` | Google Analytics   | Tracking     |
| `accounts.google.com`      | Google Accounts    | OAuth        |

## Verifica Fix

### Dopo Deploy (2-3 minuti):

1. **Apri DevTools** (F12)
2. **Application → Service Workers**
3. Verifica che compaia `v1.10.0`
4. Se vedi ancora `v1.9.0`, clicca **"Unregister"** e ricarica

### Test Console:

```javascript
// Verifica versione SW attiva
navigator.serviceWorker
  .getRegistration()
  .then((reg) => console.log('SW Version:', reg.active?.scriptURL));
```

### Checklist Funzionalità:

- ✅ No errori CSP in console
- ✅ Login Google funziona
- ✅ Loghi club si caricano
- ✅ Fasce orarie visibili in "Prenota Lezione"
- ✅ Analytics tracking attivo

## Hard Refresh (Se Necessario)

Se vedi ancora la vecchia versione del SW:

### Chrome/Edge:

1. `F12` → Application → Service Workers
2. Clicca **"Unregister"**
3. Chiudi DevTools
4. `Ctrl + Shift + R` (hard reload)

### Firefox:

1. `about:serviceworkers`
2. Trova il SW di playsport
3. Clicca **"Unregister"**
4. `Ctrl + F5` (hard reload)

## Monitoraggio

Dopo il fix, in console dovresti vedere:

```
🔧 [SW] Installing Enhanced Service Worker v1.10.0
✅ [SW] Critical resources cached successfully
🚀 [SW] Activating Enhanced Service Worker v1.10.0
✅ [SW] Service Worker activated with enhanced performance
```

E **NON** dovresti più vedere:

```
❌ sw.js:229 Refused to connect to...
❌ sw.js:137 Fetch API cannot load...
```

## Performance Note

### Domini Esterni NON Cachati

I domini esterni ora **non vengono cachati** dal SW. Questo è **intenzionale** per:

- ✅ Evitare conflitti CSP
- ✅ Usare CDN nativo per performance
- ✅ Ottenere sempre versioni aggiornate
- ✅ Rispettare CORS policies

### Domini Interni CACHATI

I file del tuo dominio continuano ad essere cachati normalmente:

- ✅ `/assets/*` → Cache First
- ✅ `/api/*` → Network First
- ✅ Pages → Stale While Revalidate

## Deploy Status

✅ Fix committato e pushato su GitHub  
⏳ Netlify sta facendo deploy automatico  
⏱️ Tempo stimato: 2-3 minuti

## Prossimi Passi

1. **Aspetta deploy** (controlla Netlify dashboard)
2. **Hard reload** sul sito (`Ctrl + Shift + R`)
3. **Verifica console** (no errori CSP)
4. **Testa "Prenota Lezione"** (vedi fasce orarie)
5. **Conferma funzionamento** 🎉

Se vedi ancora problemi, dimmi cosa appare in console! 🔍
