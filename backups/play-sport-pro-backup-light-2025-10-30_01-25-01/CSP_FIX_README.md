# 🔒 Fix Content Security Policy (CSP)

## Problema Risolto

**Sintomo**: In produzione le fasce orarie non si caricano e la console mostra errori CSP.

## Root Cause

La **Content Security Policy** in `netlify.toml` era troppo restrittiva e bloccava:

### ❌ Domini Bloccati

1. **Cloudinary** (`res.cloudinary.com`) - Per le immagini dei loghi club
2. **Google APIs** (`apis.google.com`) - Per l'autenticazione Google
3. **Google Analytics** - Per il tracking

### Errori Console

```
❌ Refused to connect to 'https://res.cloudinary.com/...'
❌ Refused to load script 'https://apis.google.com/js/api.js'
❌ Refused to evaluate string as JavaScript (unsafe-eval)
```

## Fix Applicato

### Prima (❌ Bloccato):

```toml
Content-Security-Policy = "
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
    https://*.googleapis.com
    https://*.firebaseapp.com;
  img-src 'self' data: https:;
  connect-src 'self'
    https://*.googleapis.com
    https://*.firebaseapp.com
    wss://*.firebaseio.com;
"
```

### Dopo (✅ Permesso):

```toml
Content-Security-Policy = "
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
    https://*.googleapis.com
    https://apis.google.com              ← AGGIUNTO
    https://*.firebaseapp.com
    https://www.googletagmanager.com     ← AGGIUNTO
    https://www.google-analytics.com;    ← AGGIUNTO
  img-src 'self' data: https:
    https://res.cloudinary.com;          ← AGGIUNTO
  connect-src 'self'
    https://*.googleapis.com
    https://*.firebaseapp.com
    https://res.cloudinary.com           ← AGGIUNTO
    https://www.google-analytics.com     ← AGGIUNTO
    wss://*.firebaseio.com;
"
```

## Domini Aggiunti

### 1. `https://apis.google.com` 📜

**Dove**: `script-src`  
**Perché**: Necessario per Google Auth API (`api.js`)  
**Usato da**: Firebase Authentication

### 2. `https://res.cloudinary.com` 🖼️

**Dove**: `img-src` + `connect-src`  
**Perché**: Hosting delle immagini dei loghi club  
**Usato da**: Logo rendering nei club

### 3. `https://www.googletagmanager.com` 📊

**Dove**: `script-src`  
**Perché**: Google Tag Manager  
**Usato da**: Analytics e tracking

### 4. `https://www.google-analytics.com` 📈

**Dove**: `script-src` + `connect-src`  
**Perché**: Google Analytics tracking  
**Usato da**: Metriche utilizzo app

## Verifica Fix

### Prima del deploy:

```bash
# Verifica il file netlify.toml
cat netlify.toml | grep "Content-Security-Policy"
```

### Dopo il deploy:

1. Apri DevTools → Network → Headers
2. Verifica che `Content-Security-Policy` header includa i nuovi domini
3. Verifica che non ci siano più errori CSP nella console

### Test Funzionalità:

- ✅ Login Google funziona
- ✅ Loghi club si caricano
- ✅ Fasce orarie visibili
- ✅ Analytics tracking attivo

## Note sulla Sicurezza

### `unsafe-eval` Necessario

Zod (schema validation) usa `new Function()` che richiede `unsafe-eval`.  
**Alternativa**: Compilare gli schemi Zod in build time (future improvement).

### `unsafe-inline` Necessario

React usa inline styles per alcune animazioni.  
**Alternativa**: Migrare a CSS-in-JS con nonce (future improvement).

## Deploy

Dopo il fix:

```bash
git add netlify.toml
git commit -m "fix: Aggiorna CSP per permettere Cloudinary e Google APIs"
git push origin main
```

Netlify farà automaticamente il deploy con i nuovi header! 🚀

## Riferimenti

- [Content Security Policy MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Netlify Headers](https://docs.netlify.com/routing/headers/)
- [Firebase Auth CSP](https://firebase.google.com/docs/auth/web/redirect-best-practices#csp)
