# Fix Permissions Policy - Geolocation Bloccata

## Problema Risolto

**Errore Console:**
```
[Violation] Permissions policy violation: Geolocation access has been blocked 
because of a permissions policy applied to the current document.
See https://crbug.com/414348233 for more details.
```

## Causa

Nel file `netlify.toml`, la Permissions-Policy bloccava completamente la geolocalizzazione:

```toml
❌ PRIMA (BLOCCAVA):
Permissions-Policy = "geolocation=(), microphone=(), camera=()"
                      ^^^^^^^^^^^^^^^^
                      parentesi vuote = NESSUNO può usare geolocation
```

## Soluzione

Modificato `netlify.toml` per **consentire geolocalizzazione dal tuo dominio**:

```toml
✅ DOPO (PERMETTE):
Permissions-Policy = "geolocation=(self), microphone=(), camera=()"
                      ^^^^^^^^^^^^^^^^^^
                      (self) = solo il tuo dominio può usare geolocation
```

## Modifiche Applicate

### File: `netlify.toml`

#### 1. **Permissions-Policy: Geolocation Abilitata**
```diff
- Permissions-Policy = "geolocation=(), microphone=(), camera=()"
+ Permissions-Policy = "geolocation=(self), microphone=(), camera=()"
```

**Significato:**
- `geolocation=()` → Nessuno può usare geolocalizzazione (BLOCCATO)
- `geolocation=(self)` → Solo il tuo dominio può usare geolocalizzazione (PERMESSO)
- `microphone=()` → Microfono bloccato (corretto, non lo usi)
- `camera=()` → Camera bloccata (corretto, non la usi)

#### 2. **CSP: Aggiunto nominatim.openstreetmap.org**
```diff
Content-Security-Policy = "... connect-src 'self' ... 
+ https://nominatim.openstreetmap.org ..."
```

Permette le chiamate API a OpenStreetMap Nominatim per il geocoding delle città.

## Come Funziona Permissions-Policy

### Sintassi
```
Permissions-Policy: <feature>=<allowlist>
```

### Valori Allowlist

| Valore | Significato | Esempio |
|--------|-------------|---------|
| `()` | Nessuno può usare la feature | `geolocation=()` → BLOCCATO |
| `(self)` | Solo il tuo dominio | `geolocation=(self)` → play-sport.pro ✅ |
| `*` | Tutti i domini | `geolocation=*` → Anche iframe esterni ⚠️ |
| `(self "https://example.com")` | Tuo dominio + specifici | `geolocation=(self "https://maps.google.com")` |

### Features Comuni

```toml
Permissions-Policy = "
  geolocation=(self),          # Posizione GPS
  microphone=(),               # Microfono
  camera=(),                   # Fotocamera
  payment=(self),              # API Pagamenti
  usb=(),                      # Dispositivi USB
  accelerometer=(self),        # Accelerometro
  gyroscope=(self),            # Giroscopio
  magnetometer=(self),         # Magnetometro
  fullscreen=(self),           # Fullscreen
  picture-in-picture=(self),   # PiP
  autoplay=(self),             # Autoplay media
  encrypted-media=(self)       # DRM
"
```

## Configurazione Consigliata per PWA

### Play Sport Pro (configurazione attuale)

```toml
Permissions-Policy = "geolocation=(self), microphone=(), camera=()"
```

**Rationale:**
- ✅ `geolocation=(self)` → Necessario per "Cerca nelle vicinanze"
- ❌ `microphone=()` → Non usato, bloccato per sicurezza
- ❌ `camera=()` → Non usato (useremo upload file), bloccato per sicurezza

### Se in Futuro Aggiungi Features

```toml
# Con fotocamera per foto profilo/campi:
Permissions-Policy = "geolocation=(self), camera=(self), microphone=()"

# Con videochiamate/lezioni online:
Permissions-Policy = "geolocation=(self), camera=(self), microphone=(self)"

# Solo geolocalizzazione (attuale):
Permissions-Policy = "geolocation=(self), microphone=(), camera=()"
```

## Test della Configurazione

### 1. **Verifica Header in Produzione**

Dopo il deploy su Netlify, verifica che l'header sia applicato:

```bash
# Linux/Mac
curl -I https://play-sport.pro | grep Permissions-Policy

# Windows PowerShell
(Invoke-WebRequest -Uri https://play-sport.pro -Method Head).Headers.'Permissions-Policy'
```

**Output Atteso:**
```
Permissions-Policy: geolocation=(self), microphone=(), camera=()
```

### 2. **Verifica in Browser DevTools**

1. Apri l'app: `https://play-sport.pro`
2. Apri DevTools (`F12`)
3. Tab **Network**
4. Refresh (`Ctrl+R`)
5. Click sulla prima richiesta (`play-sport.pro`)
6. Tab **Headers**
7. Cerca **Response Headers** → `Permissions-Policy`

**Deve mostrare:**
```
geolocation=(self), microphone=(), camera=()
```

### 3. **Test Geolocalizzazione**

```javascript
// Apri Console in DevTools
navigator.geolocation.getCurrentPosition(
  (pos) => console.log('✅ Geolocation OK:', pos.coords),
  (err) => console.error('❌ Geolocation ERROR:', err)
);
```

**Output Atteso:**
```
✅ Geolocation OK: {latitude: 45.4642, longitude: 9.1900, ...}
```

**Se ancora bloccato:**
```
❌ Geolocation ERROR: GeolocationPositionError {code: 1, message: "User denied"}
```
→ Utente ha negato permesso (non è policy)

## Differenza Permissions-Policy vs Browser Permissions

### Permissions-Policy (Server)
- Impostata dal **server** (Netlify)
- Controlla **quali features sono disponibili** nella pagina
- Se bloccato da policy → `navigator.geolocation` non funziona MAI
- Non può essere bypassata da JavaScript

### Browser Permissions (Client)
- Controllata dall'**utente** nel browser
- L'utente può concedere o negare
- Se policy permette ma utente nega → Prompt appare ma viene rifiutato

**Gerarchia:**
```
1. Permissions-Policy (server) → Deve permettere
   ↓
2. Browser Permissions (utente) → Utente deve concedere
   ↓
3. navigator.geolocation.getCurrentPosition() → Funziona!
```

## Errori Comuni

### ❌ Errore 1: Policy Troppo Restrittiva
```toml
Permissions-Policy = "geolocation=()"
```
**Problema**: Nessuno può usare geolocalizzazione, nemmeno il tuo sito  
**Soluzione**: `geolocation=(self)`

### ❌ Errore 2: Policy Troppo Permissiva
```toml
Permissions-Policy = "geolocation=*"
```
**Problema**: Iframe esterni possono accedere alla geolocalizzazione (rischio sicurezza)  
**Soluzione**: `geolocation=(self)` (solo il tuo dominio)

### ❌ Errore 3: Policy Mancante
```toml
# Nessuna Permissions-Policy
```
**Problema**: Default browser-dependent, comportamento inconsistente  
**Soluzione**: Specifica esplicitamente `geolocation=(self)`

### ❌ Errore 4: Sintassi Errata
```toml
Permissions-Policy = "geolocation=self"  # Senza parentesi
```
**Problema**: Sintassi non valida  
**Soluzione**: `geolocation=(self)` (con parentesi)

## Deploy e Verifica

### Passi per Applicare il Fix

1. **Commit e Push**
   ```bash
   git add netlify.toml
   git commit -m "fix: Abilita geolocation in Permissions-Policy"
   git push origin main
   ```

2. **Deploy Automatico Netlify**
   - Netlify rileva push su `main`
   - Avvia build automatico
   - Deploy in ~2-3 minuti

3. **Verifica Header**
   ```bash
   curl -I https://play-sport.pro | grep Permissions-Policy
   ```

4. **Test Geolocalizzazione**
   - Apri app mobile
   - Vai su "Cerca Circoli"
   - Click "Usa la mia posizione GPS"
   - Concedi permesso quando richiesto
   - ✅ Dovrebbe funzionare!

### Timing

- **Locale (dev)**: Immediato (no Permissions-Policy in dev)
- **Netlify**: ~2-3 minuti dopo push
- **CDN Cache**: Potrebbe richiedere 5-10 minuti per propagarsi
- **Browser Cache**: Fare hard refresh (`Ctrl+Shift+R`)

## Content Security Policy (CSP)

Ho anche aggiunto `nominatim.openstreetmap.org` al CSP per permettere il geocoding:

```toml
connect-src 'self' 
  https://*.googleapis.com 
  https://*.firebaseapp.com 
  https://res.cloudinary.com 
  https://www.google-analytics.com 
  https://nominatim.openstreetmap.org   # ← NUOVO
  wss://*.firebaseio.com
```

Questo permette le chiamate `fetch()` all'API Nominatim per convertire città in coordinate.

## Best Practices

### ✅ DO

1. **Usa `(self)` per features del tuo sito**
   ```toml
   Permissions-Policy = "geolocation=(self)"
   ```

2. **Blocca features non usate**
   ```toml
   Permissions-Policy = "microphone=(), camera=()"
   ```

3. **Testa dopo ogni modifica**
   ```bash
   curl -I https://play-sport.pro | grep Permissions-Policy
   ```

4. **Documenta perché ogni feature è permessa/bloccata**
   ```toml
   # geolocation=(self) → Ricerca circoli nelle vicinanze
   # microphone=() → Non usato, bloccato per sicurezza
   ```

### ❌ DON'T

1. **Non usare `*` (tutti i domini)**
   ```toml
   Permissions-Policy = "geolocation=*"  # ❌ PERICOLOSO
   ```

2. **Non omettere Permissions-Policy**
   ```toml
   # Mancanza policy = comportamento inconsistente
   ```

3. **Non assumere che funzioni senza testare**
   ```
   # Sempre testare in produzione dopo deploy
   ```

## Troubleshooting

### Geolocation ancora bloccata dopo fix?

1. **Verifica header in produzione**
   ```bash
   curl -I https://play-sport.pro | grep Permissions-Policy
   # Deve mostrare: geolocation=(self)
   ```

2. **Hard refresh browser**
   ```
   Ctrl + Shift + R (Windows/Linux)
   Cmd + Shift + R (Mac)
   ```

3. **Cancella cache browser**
   ```
   DevTools → Application → Clear storage → Clear site data
   ```

4. **Verifica permessi browser**
   ```
   Icona lucchetto URL → Impostazioni sito → Posizione → Consenti
   ```

5. **Testa in incognito**
   ```
   Ctrl + Shift + N (Chrome)
   Nuova finestra privata senza cache
   ```

6. **Verifica su device mobile**
   ```
   Apri https://play-sport.pro su telefono
   Settings → Site settings → Location → Allow
   ```

## Changelog

### v1.0.0 - Permissions Policy Fix (06/10/2025)

**Problema:**
- ❌ Geolocation bloccata da Permissions-Policy
- ❌ Errore: "Permissions policy violation: Geolocation access has been blocked"

**Soluzione:**
- ✅ Cambiato `geolocation=()` → `geolocation=(self)`
- ✅ Aggiunto `nominatim.openstreetmap.org` al CSP
- ✅ Documentazione completa

**File Modificati:**
- `netlify.toml`: Permissions-Policy + CSP

**Breaking Changes:** Nessuno

**Backwards Compatibility:** 100%

## Risorse

- [MDN: Permissions-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy)
- [W3C: Permissions Policy Spec](https://w3c.github.io/webappsec-permissions-policy/)
- [Chrome Feature Policy](https://developer.chrome.com/docs/privacy-sandbox/permissions-policy/)
- [Can I Use: Permissions Policy](https://caniuse.com/permissions-policy)

---

**Stato**: ✅ RISOLTO  
**Versione**: 1.0.0  
**Data**: 06/10/2025  
**Autore**: GitHub Copilot  
**Priority**: CRITICO (blocca funzionalità core)
