# 🚀 Guida Deploy Ambiente Staging
**Data**: 15 Ottobre 2025, 22:22  
**Progetto**: PlaySport Pro  
**Obiettivo**: Configurare ambiente staging per testing pre-produzione  

---

## 📋 Panoramica

L'ambiente **staging** è una replica dell'ambiente di produzione dove testare modifiche prima del deploy finale. Questo documento guida la configurazione completa.

---

## 1. Opzioni Piattaforme Hosting 🌐

### Opzione A: Netlify (Consigliata) ⭐

**Vantaggi**:
- ✅ Deploy automatico da Git
- ✅ Preview deployments per PR
- ✅ CDN globale integrato
- ✅ SSL automatico
- ✅ Form handling
- ✅ Serverless functions
- ✅ Piano gratuito generoso

**Limiti Piano Gratuito**:
- 100 GB bandwidth/mese
- 300 minuti build/mese
- 1000 form submissions/mese

### Opzione B: Vercel

**Vantaggi**:
- ✅ Ottimizzato per React/Vite
- ✅ Deploy automatico
- ✅ Edge network veloce
- ✅ Preview deployments

**Limiti Piano Gratuito**:
- 100 GB bandwidth/mese
- 100 deployments/giorno

### Opzione C: Firebase Hosting

**Vantaggi**:
- ✅ Integrato con Firebase
- ✅ Multi-site hosting
- ✅ Canali preview

**Limiti Piano Gratuito**:
- 10 GB storage
- 360 MB/giorno di trasferimento dati

---

## 2. Setup Netlify (Opzione Consigliata) 🎯

### 2.1 Creazione Account

1. **Registrazione**
   - Vai su https://www.netlify.com/
   - Click **Sign up**
   - Scegli **GitHub** per login (consigliato)
   - Autorizza Netlify ad accedere ai tuoi repository

2. **Verifica Email**
   - Controlla email di conferma
   - Click sul link di verifica

### 2.2 Configurazione Repository

1. **Connetti Repository**
   ```
   Dashboard Netlify → Sites → Add new site → Import an existing project
   ```

2. **Seleziona Git Provider**
   - Click **GitHub**
   - Autorizza accesso (se richiesto)
   - Seleziona organization/account

3. **Scegli Repository**
   - Cerca: `play-sport-pro`
   - Click sul repository

4. **Configurazione Build**
   ```
   Branch to deploy: staging (o main per ora)
   Build command: npm run build
   Publish directory: dist
   ```

5. **Variabili Ambiente**
   - Click **Show advanced**
   - Click **New variable** per ogni variabile:

   ```env
   # Firebase Config
   VITE_FIREBASE_API_KEY=your_staging_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-staging.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-staging
   VITE_FIREBASE_APP_ID=your_staging_app_id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-staging.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_staging_sender_id
   VITE_FIREBASE_MEASUREMENT_ID=G-STAGING123
   
   # Feature Flags
   VITE_AUTH_EMAIL_LINK_ENABLED=false
   
   # Environment
   VITE_ENVIRONMENT=staging
   ```

6. **Deploy**
   - Click **Deploy site**
   - Attendi completamento build (~2-3 min)

### 2.3 Configurazione Dominio

1. **Domain Settings**
   - Vai in **Site settings → Domain management**
   - Vedi dominio autogenerato: `random-name-12345.netlify.app`

2. **Custom Subdomain (Opzionale)**
   - Click **Options → Edit site name**
   - Cambia in: `playsport-staging.netlify.app`
   - Save

3. **Custom Domain (Opzionale)**
   - Click **Add custom domain**
   - Inserisci: `staging.tuodominio.com`
   - Configura DNS secondo istruzioni

### 2.4 Configurazione Build

**File**: `netlify.toml` (crea nella root del progetto)

```toml
# Netlify Build Configuration
[build]
  command = "npm run build"
  publish = "dist"
  
  # Environment variables
  [build.environment]
    NODE_VERSION = "20"

# Redirects e rewrites per SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Headers per sicurezza
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.firebase.googleapis.com https://*.firebaseio.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.firebase.googleapis.com https://*.firebaseio.com https://www.google-analytics.com; frame-src 'self' https://*.firebaseapp.com;"

# Cache statico
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Deploy contexts
[context.production]
  command = "npm run build"
  
[context.staging]
  command = "npm run build"
  
[context.branch-deploy]
  command = "npm run build"

# Plugin (opzionali)
[[plugins]]
  package = "@netlify/plugin-lighthouse"
```

**Committare il file**:
```bash
git add netlify.toml
git commit -m "Add Netlify configuration"
git push origin main
```

---

## 3. Setup Firebase Progetto Staging 🔥

### 3.1 Creazione Progetto Staging

1. **Firebase Console**
   - Vai su https://console.firebase.google.com/
   - Click **Add project**

2. **Configurazione Progetto**
   ```
   Nome progetto: PlaySport Pro - Staging
   (verrà generato ID: playsport-pro-staging)
   
   ✅ Enable Google Analytics (opzionale per staging)
   ```

3. **Billing**
   - Seleziona **Blaze plan** (pay-as-you-go)
   - Imposta budget alert: €10/mese

### 3.2 Configurazione Authentication

1. **Abilita Provider**
   - Build → Authentication → Get started
   - Sign-in methods → Email/Password → Enable
   - Sign-in methods → Google (se usato) → Enable

2. **Domini Autorizzati**
   - Authentication → Settings → Authorized domains
   - Add domain: `playsport-staging.netlify.app`
   - Add domain: `localhost` (per sviluppo)

### 3.3 Configurazione Firestore

1. **Crea Database**
   - Build → Firestore Database → Create database
   - Location: `europe-west1` (Amsterdam)
   - Start in **production mode**

2. **Deploy Security Rules**
   ```bash
   # Assicurati che firebase CLI sia installato
   npm install -g firebase-tools
   
   # Login
   firebase login
   
   # Inizializza progetto (se non già fatto)
   firebase init
   # Seleziona: Firestore, Storage
   # Seleziona: Use existing project → playsport-pro-staging
   
   # Deploy rules
   firebase deploy --only firestore:rules --project playsport-pro-staging
   firebase deploy --only storage:rules --project playsport-pro-staging
   ```

3. **Importa Dati Test (Opzionale)**
   ```bash
   # Esporta da produzione (se esiste)
   firebase firestore:export ./firestore-export --project playsport-pro-prod
   
   # Importa in staging
   firebase firestore:import ./firestore-export --project playsport-pro-staging
   ```

### 3.4 Configurazione Storage

1. **Inizializza Storage**
   - Build → Storage → Get started
   - Location: `europe-west1` (come Firestore)
   - Start in **production mode**

2. **Deploy Rules**
   - Già fatto con comando precedente
   - Verifica in console che rules siano applicate

### 3.5 Ottenere Credenziali

1. **Web App Config**
   - Project settings (⚙️) → Your apps → Web app → Add app
   - Nickname: `PlaySport Staging Web`
   - ✅ Also set up Firebase Hosting (opzionale)
   - Register app

2. **Copia Configurazione**
   ```javascript
   // Firebase SDK snippet - copia questi valori in Netlify
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "playsport-pro-staging.firebaseapp.com",
     projectId: "playsport-pro-staging",
     storageBucket: "playsport-pro-staging.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123",
     measurementId: "G-STAGING123"
   };
   ```

3. **Aggiorna Netlify Environment Variables**
   - Netlify Dashboard → Site settings → Environment variables
   - Aggiorna con valori staging

---

## 4. Google Analytics Staging 📊

### 4.1 Opzione A: Property Separata (Consigliata)

**Crea GA4 Property Staging**:

1. **Google Analytics Console**
   - Admin → Create Property
   - Nome: `PlaySport Pro - Staging`

2. **Configura Stream**
   - Data Streams → Add stream → Web
   - URL: `https://playsport-staging.netlify.app`
   - Nome stream: `Staging Web`

3. **Copia Measurement ID**
   - Formato: `G-STAGING123`
   - Aggiorna `VITE_GA_MEASUREMENT_ID` in Netlify

**Vantaggi**:
- ✅ Dati test separati da produzione
- ✅ Nessun inquinamento dati analytics
- ✅ Testing configurazioni GA4 senza rischi

### 4.2 Opzione B: Stesso Property con Filtro

**Usa stesso GA4 con data stream separato**:

1. **Aggiungi Stream**
   - Proprietà esistente → Data Streams → Add stream
   - URL staging

2. **Filtra in Reports**
   - Usa custom dimension `environment: staging`

**Svantaggi**:
- ⚠️ Dati staging mescolati con produzione
- ⚠️ Richiede filtri manuali

---

## 5. Configurazione CI/CD Pipeline 🔄

### 5.1 Branch Strategy

**Strategia Consigliata**:

```
main (production) ────────────────────────>
     \                                     
      staging ───────────────────────────>
            \
             feature/* ────>
```

**Workflow**:
1. Sviluppo in `feature/*` branch
2. Merge in `staging` → auto-deploy su staging
3. Test in staging
4. Merge in `main` → auto-deploy su production

### 5.2 GitHub Actions (Opzionale)

**File**: `.github/workflows/staging-deploy.yml`

```yaml
name: Deploy to Staging

on:
  push:
    branches: [staging]
  pull_request:
    branches: [staging]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Run build
        run: npm run build
        
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/staging'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_STAGING_SITE_ID }}
        with:
          args: deploy --prod
```

**Setup Secrets**:
```
GitHub Repository → Settings → Secrets and variables → Actions

New secret:
- NETLIFY_AUTH_TOKEN: (da Netlify User settings → Applications)
- NETLIFY_STAGING_SITE_ID: (da Netlify Site settings → Site details)
```

---

## 6. Testing in Staging 🧪

### 6.1 Smoke Tests

**Checklist Pre-Deploy**:
```bash
# 1. Verifica build locale
npm run build
npm run preview

# 2. Test funzionalità critiche
- [ ] Homepage carica
- [ ] Login funziona
- [ ] Dashboard accessibile
- [ ] Prenotazione funziona
- [ ] Nessun errore console

# 3. Deploy su staging
git push origin staging

# 4. Verifica staging
- [ ] URL staging raggiungibile
- [ ] Firebase connesso (no errori auth)
- [ ] GA4 traccia eventi
- [ ] Nessun errore console
```

### 6.2 Test Automatici

**File**: `tests/e2e/staging.test.js` (opzionale, per Playwright/Cypress)

```javascript
// Esempio Playwright
import { test, expect } from '@playwright/test';

const STAGING_URL = 'https://playsport-staging.netlify.app';

test('staging homepage loads', async ({ page }) => {
  await page.goto(STAGING_URL);
  await expect(page).toHaveTitle(/PlaySport/);
});

test('login form exists', async ({ page }) => {
  await page.goto(`${STAGING_URL}/login`);
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});
```

### 6.3 Performance Testing

**Lighthouse CI** (già configurato in netlify.toml):

```bash
# Manualmente
npx lighthouse https://playsport-staging.netlify.app \
  --output html \
  --output-path ./lighthouse-report.html
```

**Target Metriche**:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

---

## 7. Monitoraggio Staging 📈

### 7.1 Netlify Analytics

**Percorso**: Site → Analytics

**Metriche Disponibili**:
- Page views
- Unique visitors
- Bandwidth used
- Top pages
- Not found pages

**Costo**: $9/mese (opzionale)

### 7.2 Firebase Performance Monitoring

**Setup**:
```bash
npm install firebase

# In src/main.jsx o App.jsx
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);
```

**Metriche**:
- Page load time
- Network requests
- Custom traces

### 7.3 Error Tracking

**Opzione: Sentry (Consigliata)**

```bash
npm install @sentry/react @sentry/tracing

# src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "staging",
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**Piano Gratuito**:
- 5K errors/mese
- 50K transactions/mese
- 1 user

---

## 8. Rollback Strategy 🔄

### 8.1 Netlify Rollback

**Via Dashboard**:
1. Site → Deploys
2. Trova deploy precedente funzionante
3. Click **...** → **Publish deploy**
4. Conferma

**Via CLI**:
```bash
# Installa Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Link site
netlify link

# Rollback
netlify deploy --prod --build
```

### 8.2 Firebase Rollback

**Firestore Rules**:
```bash
# Vedi versioni precedenti
firebase firestore:rules --project playsport-pro-staging

# Non c'è rollback automatico, re-deploy vecchia versione
git checkout <commit-hash> -- firestore.rules
firebase deploy --only firestore:rules --project playsport-pro-staging
```

**Cloud Functions**:
```bash
# Vedi versioni
firebase functions:list --project playsport-pro-staging

# Non c'è rollback, re-deploy
```

---

## 9. Checklist Deploy Staging ✅

### Pre-Deploy
- [ ] Branch `staging` creato
- [ ] Netlify account creato
- [ ] Repository connesso a Netlify
- [ ] Firebase progetto staging creato
- [ ] Environment variables configurate
- [ ] `netlify.toml` committato
- [ ] Security rules deployate
- [ ] GA4 property staging creata

### Deploy
- [ ] Push su branch `staging`
- [ ] Build Netlify completato
- [ ] Site URL accessibile
- [ ] Firebase connesso correttamente
- [ ] No errori console browser

### Post-Deploy
- [ ] Smoke tests passano
- [ ] Login funziona
- [ ] Prenotazioni funzionano
- [ ] GA4 traccia eventi
- [ ] Performance OK (Lighthouse > 90)
- [ ] Security headers presenti
- [ ] SSL attivo

### Monitoraggio
- [ ] Netlify Analytics configurato (opzionale)
- [ ] Firebase Performance configurato
- [ ] Error tracking configurato (Sentry)
- [ ] Alert configurati

---

## 10. Differenze Staging vs Produzione 🔀

| Aspetto | Staging | Produzione |
|---------|---------|------------|
| URL | playsport-staging.netlify.app | tuodominio.com |
| Firebase Project | playsport-pro-staging | playsport-pro-prod |
| GA4 Property | Staging separata | Production |
| Error Logging | Verbose | Errors only |
| Debug Mode | Abilitato | Disabilitato |
| Test Data | Dati fake | Dati reali |
| Billing | Low limits | Production limits |
| Monitoring | Basic | Comprehensive |
| Uptime SLA | Best effort | 99.9% |

---

## 11. Costi Stimati 💰

### Netlify
- **Piano Gratuito**: €0/mese
  - Sufficiente per staging
  - Bandwidth: 100 GB/mese

### Firebase Staging
- **Blaze Plan (pay-as-you-go)**:
  - Firestore: ~€0-5/mese (basso traffico)
  - Storage: ~€0-2/mese
  - Authentication: Gratis fino 10K utenti
  - **Totale**: ~€0-10/mese

### Google Analytics
- **Gratuito** per property staging

### Sentry (Opzionale)
- **Piano Developer**: Gratuito
  - 5K errors/mese

**Totale Mensile Stimato**: €0-15/mese

---

## 12. Troubleshooting 🔧

### Problema: Build Fallisce

**Errore**: `npm run build failed`

**Soluzione**:
```bash
# Verifica locale
npm ci
npm run build

# Controlla logs Netlify
Site → Deploys → [Failed deploy] → Deploy log

# Problemi comuni:
- Dipendenze mancanti: npm install
- Environment variables: verifica in Netlify
- Node version: imposta in netlify.toml
```

### Problema: Firebase Non Connette

**Errore**: `Firebase: Error (auth/invalid-api-key)`

**Soluzione**:
1. Verifica environment variables in Netlify
2. Controlla che API key sia corretta
3. Verifica domini autorizzati in Firebase Console

### Problema: 404 su Routes

**Errore**: Pagine React restituiscono 404

**Soluzione**:
Assicurati che `netlify.toml` contenga:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 📞 Supporto

**Documentazione**:
- [Netlify Docs](https://docs.netlify.com/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy)

**Community**:
- Netlify Community Forum
- Firebase Discord
- Stack Overflow

---

## ✅ Conclusione

Seguendo questa guida avrai:
- ✅ Ambiente staging completo e funzionante
- ✅ Deploy automatico da Git
- ✅ Firebase progetto separato per test
- ✅ Monitoraggio e analytics
- ✅ Rollback strategy pronta

**Tempo Stimato Setup**: 2-3 ore  
**Difficoltà**: Media  

**Prossimo Step**: Deploy su staging e eseguire testing completo! 🚀

---

**Guida creata**: 15 Ottobre 2025, 22:22  
**Tool**: GitHub Copilot AI Assistant  
