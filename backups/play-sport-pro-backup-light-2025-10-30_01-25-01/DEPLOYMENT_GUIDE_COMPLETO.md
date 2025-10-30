# 🚀 Guida Completa al Deployment - Playsport Pro

## 📋 Indice
1. [Panoramica Sistema](#panoramica-sistema)
2. [Preparazione Pre-Deployment](#preparazione-pre-deployment)
3. [Configurazione Ambiente](#configurazione-ambiente)
4. [Deployment Web](#deployment-web)
5. [Deployment Mobile](#deployment-mobile)
6. [Monitoraggio e Performance](#monitoraggio-e-performance)
7. [Sicurezza in Produzione](#sicurezza-in-produzione)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Panoramica Sistema

### **Architettura Applicazione**
```
Playsport Pro
├── 🌐 Web App (React + Vite)
├── 📱 Mobile App (Capacitor + Android)
├── 🔥 Backend (Firebase)
├── 📊 Analytics (Google Analytics 4)
├── 🛡️ Monitoring (Sentry)
└── ⚡ Performance (Web Vitals)
```

### **Stack Tecnologico Completo**
- **Frontend**: React 18.3.1, Vite 7.1.4, TailwindCSS 3.4.13
- **Backend**: Firebase 12.2.1 (Firestore, Auth, Hosting)
- **Mobile**: Capacitor 7.4.3, Android SDK
- **Testing**: Vitest 2.1.1, React Testing Library
- **Monitoring**: Sentry 10.12.0, Google Analytics 4
- **Build**: Vite, TypeScript 5.9.2, ESLint, Prettier

---

## 🔧 Preparazione Pre-Deployment

### **1. Verifica Dipendenze**
```powershell
# Controlla versioni Node.js e npm
node --version  # >= 18.0.0
npm --version   # >= 9.0.0

# Installa dipendenze aggiornate
npm ci
npm audit fix
```

### **2. Test Pre-Deployment**
```powershell
# Esegui tutti i test
npm test

# Verifica build di produzione
npm run build

# Test della build
npm run preview
```

### **3. Controllo Qualità Codice**
```powershell
# Lint del codice
npm run lint

# Formattazione codice
npx prettier --write "src/**/*.{js,jsx,ts,tsx,css,md,json}"

# Verifica TypeScript (se applicabile)
npx tsc --noEmit
```

---

## ⚙️ Configurazione Ambiente

### **Variabili d'Ambiente Produzione**

Crea `.env.production`:
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=playsport-pro.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=playsport-pro
VITE_FIREBASE_STORAGE_BUCKET=playsport-pro.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Analytics & Monitoring
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_SENTRY_ENVIRONMENT=production

# App Configuration
VITE_APP_VERSION=1.0.1
VITE_APP_NAME=Playsport Pro
VITE_APP_ENVIRONMENT=production
VITE_APP_DEBUG=false

# Performance & Security
VITE_ENABLE_SW=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=true
VITE_CSP_ENABLED=true
```

### **Configurazione Firebase**

**firebase.json**:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|map)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

---

## 🌐 Deployment Web

### **1. Preparazione Build**
```powershell
# Clean build
npm run build:clean

# Verifica dimensioni bundle
npx vite-bundle-analyzer dist/assets/*.js
```

### **2. Deployment Firebase Hosting**
```powershell
# Login Firebase
npx firebase login

# Inizializza progetto (solo prima volta)
npx firebase init hosting

# Deploy
npx firebase deploy --only hosting
```

### **3. Deployment Netlify (Alternativo)**
```powershell
# Installa Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### **4. Deployment Vercel (Alternativo)**
```powershell
# Installa Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### **Script di Deploy Automatico**

Crea `scripts/deploy-web.ps1`:
```powershell
#!/usr/bin/env pwsh

Write-Host "🚀 Iniziando deployment web Playsport Pro..." -ForegroundColor Green

# Verifica prerequisiti
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js non trovato. Installare Node.js >= 18.0.0"
    exit 1
}

# Clean e install
Write-Host "📦 Installazione dipendenze..." -ForegroundColor Yellow
npm ci

# Test
Write-Host "🧪 Esecuzione test..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Error "Test falliti. Deployment annullato."
    exit 1
}

# Build
Write-Host "🔨 Build produzione..." -ForegroundColor Yellow
npm run build:clean
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build fallita. Deployment annullato."
    exit 1
}

# Deploy Firebase
Write-Host "🔥 Deploy Firebase Hosting..." -ForegroundColor Yellow
npx firebase deploy --only hosting
if ($LASTEXITCODE -ne 0) {
    Write-Error "Deploy Firebase fallito."
    exit 1
}

Write-Host "✅ Deployment completato con successo!" -ForegroundColor Green
Write-Host "🌐 App disponibile su: https://playsport-pro.web.app" -ForegroundColor Cyan
```

---

## 📱 Deployment Mobile

### **1. Preparazione Android**
```powershell
# Sincronizza Capacitor
npx cap sync android

# Apri Android Studio
npx cap open android
```

### **2. Configurazione Android**

**android/app/build.gradle**:
```gradle
android {
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.playsport.pro"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 101
        versionName "1.0.1"
    }
    
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
    
    signingConfigs {
        release {
            storeFile file('../keystore/playsport-release.keystore')
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
}
```

### **3. Build APK Produzione**

Crea `scripts/build-apk-production.ps1`:
```powershell
#!/usr/bin/env pwsh

Write-Host "📱 Build APK Produzione Playsport Pro..." -ForegroundColor Green

# Verifica ambiente
if (-not $env:KEYSTORE_PASSWORD) {
    Write-Error "KEYSTORE_PASSWORD non configurata"
    exit 1
}

# Build web
Write-Host "🔨 Build web per mobile..." -ForegroundColor Yellow
npm run build

# Sync Capacitor
Write-Host "🔄 Sync Capacitor..." -ForegroundColor Yellow
npx cap sync android

# Build APK
Write-Host "📦 Build APK..." -ForegroundColor Yellow
cd android
./gradlew assembleRelease
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build APK fallita"
    exit 1
}

# Copia APK nella root
Copy-Item "app/build/outputs/apk/release/app-release.apk" "../playsport-pro-v1.0.1.apk"

Write-Host "✅ APK creata: playsport-pro-v1.0.1.apk" -ForegroundColor Green
```

### **4. Deployment Google Play Store**

**Preparazione:**
1. Crea account Google Play Developer
2. Configura app nel Play Console
3. Carica APK/AAB firmato
4. Completa listing store
5. Invia per revisione

---

## 📊 Monitoraggio e Performance

### **1. Configurazione Sentry Produzione**

```javascript
// src/lib/sentry-config.js
import * as Sentry from '@sentry/react';

export const initSentryProduction = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production',
    
    // Performance Monitoring
    tracesSampleRate: 1.0,
    
    // Release tracking
    release: `playsport-pro@${import.meta.env.VITE_APP_VERSION}`,
    
    // Error filtering
    beforeSend(event) {
      // Filtra errori noti in produzione
      if (event.message?.includes('ResizeObserver loop limit exceeded')) {
        return null;
      }
      return event;
    },
    
    // Integrations
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
    ],
  });
};
```

### **2. Analytics Produzione**

```javascript
// src/lib/analytics-production.js
import { gtag } from 'ga-gtag';

export const initAnalyticsProduction = () => {
  // Google Analytics 4
  gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: true,
  });
  
  // Enhanced E-commerce
  gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
    custom_map: {
      custom_parameter_1: 'user_type',
      custom_parameter_2: 'club_affiliation',
    },
  });
};
```

### **3. Performance Monitoring**

Crea `src/lib/performance-monitor.js`:
```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export const initPerformanceMonitoring = () => {
  // Core Web Vitals
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
  
  // Performance Observer
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          trackNavigationTiming(entry);
        }
        if (entry.entryType === 'resource') {
          trackResourceTiming(entry);
        }
      }
    });
    
    observer.observe({ entryTypes: ['navigation', 'resource'] });
  }
};

const sendToAnalytics = ({ name, value, rating }) => {
  gtag('event', 'web_vital', {
    event_category: 'performance',
    event_label: name,
    value: Math.round(value),
    rating,
  });
};
```

---

## 🛡️ Sicurezza in Produzione

### **1. Content Security Policy**

Crea `public/_headers`:
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.google-analytics.com; connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://www.google-analytics.com https://o4504958742372352.ingest.sentry.io
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### **2. Firebase Security Rules**

**firestore.rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users - solo il proprietario può leggere/scrivere
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Clubs - membri autenticati possono leggere
    match /clubs/{clubId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.admins[request.auth.uid] == true ||
         resource.data.owner == request.auth.uid);
    }
    
    // Bookings - validazione completa
    match /bookings/{bookingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
        validateBookingData(request.resource.data);
      allow update: if request.auth != null &&
        (resource.data.userId == request.auth.uid ||
         isClubAdmin(request.auth.uid, resource.data.clubId));
      allow delete: if request.auth != null &&
        (resource.data.userId == request.auth.uid ||
         isClubAdmin(request.auth.uid, resource.data.clubId));
    }
    
    // Matches - validazione avanzata
    match /matches/{matchId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
        validateMatchData(request.resource.data);
      allow update: if request.auth != null &&
        canModifyMatch(request.auth.uid, resource.data);
      allow delete: if request.auth != null &&
        canDeleteMatch(request.auth.uid, resource.data);
    }
  }
  
  // Funzioni di validazione
  function validateBookingData(data) {
    return data.keys().hasAll(['courtId', 'date', 'startTime', 'endTime', 'userId']) &&
           data.date is timestamp &&
           data.startTime is string &&
           data.endTime is string &&
           data.userId == request.auth.uid;
  }
  
  function validateMatchData(data) {
    return data.keys().hasAll(['player1', 'player2', 'date', 'clubId']) &&
           data.date is timestamp &&
           (data.player1 == request.auth.uid || data.player2 == request.auth.uid);
  }
  
  function isClubAdmin(userId, clubId) {
    return get(/databases/$(database)/documents/clubs/$(clubId)).data.admins[userId] == true;
  }
  
  function canModifyMatch(userId, matchData) {
    return matchData.player1 == userId || 
           matchData.player2 == userId ||
           isClubAdmin(userId, matchData.clubId);
  }
  
  function canDeleteMatch(userId, matchData) {
    return matchData.player1 == userId || 
           matchData.player2 == userId ||
           isClubAdmin(userId, matchData.clubId);
  }
}
```

### **3. Environment Security**

Crea `scripts/validate-env.ps1`:
```powershell
#!/usr/bin/env pwsh

Write-Host "🔒 Validazione sicurezza ambiente..." -ForegroundColor Yellow

$required_vars = @(
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_SENTRY_DSN",
    "VITE_GA_MEASUREMENT_ID"
)

$missing_vars = @()

foreach ($var in $required_vars) {
    if (-not (Get-ChildItem Env: | Where-Object Name -eq $var)) {
        $missing_vars += $var
    }
}

if ($missing_vars.Count -gt 0) {
    Write-Error "Variabili d'ambiente mancanti:"
    $missing_vars | ForEach-Object { Write-Host "  ❌ $_" -ForegroundColor Red }
    exit 1
}

Write-Host "✅ Tutte le variabili d'ambiente sono configurate" -ForegroundColor Green

# Verifica formati
$api_key = $env:VITE_FIREBASE_API_KEY
if ($api_key.Length -lt 30) {
    Write-Warning "Firebase API Key sembra troppo corta"
}

$project_id = $env:VITE_FIREBASE_PROJECT_ID
if ($project_id -notmatch "^[a-z0-9-]+$") {
    Write-Warning "Firebase Project ID formato non valido"
}

Write-Host "🔒 Validazione completata" -ForegroundColor Green
```

---

## 🔧 Troubleshooting

### **Problemi Comuni Build**

**1. Errore dipendenze:**
```powershell
# Clear cache e reinstalla
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

**2. Errore TypeScript:**
```powershell
# Verifica configurazione TypeScript
npx tsc --showConfig
npx tsc --noEmit --skipLibCheck
```

**3. Errore Vite build:**
```powershell
# Debug build
npx vite build --debug
npx vite build --mode production --sourcemap
```

### **Problemi Firebase**

**1. Regole Firestore:**
```powershell
# Test regole
npx firebase emulators:start --only firestore
npx firebase firestore:rules:test
```

**2. Autenticazione:**
```powershell
# Verifica configurazione Auth
npx firebase auth:export users.json
npx firebase functions:config:get
```

### **Performance Issues**

**1. Bundle troppo grande:**
```powershell
# Analizza bundle
npx vite-bundle-analyzer
npm run build -- --analyze
```

**2. Slow loading:**
```javascript
// Lazy loading componenti
const LazyComponent = React.lazy(() => import('./Component'));

// Code splitting routes
const routes = [
  {
    path: '/dashboard',
    element: <Suspense fallback={<Loading />}>
      <LazyDashboard />
    </Suspense>
  }
];
```

---

## 📈 Checklist Pre-Produzione

### **🔍 Testing**
- [ ] Tutti i test unitari passano
- [ ] Test di integrazione completati
- [ ] Test cross-browser
- [ ] Test mobile responsive
- [ ] Test performance Web Vitals

### **🔧 Build & Deploy**
- [ ] Build produzione senza errori
- [ ] Variabili ambiente configurate
- [ ] Service Worker funzionante
- [ ] Bundle size ottimizzato (<2MB)
- [ ] Source maps disponibili

### **🛡️ Sicurezza**
- [ ] Content Security Policy attivo
- [ ] Firebase rules aggiornate
- [ ] HTTPS enforced
- [ ] Headers sicurezza configurati
- [ ] Audit sicurezza completato

### **📊 Monitoraggio**
- [ ] Sentry configurato e testato
- [ ] Google Analytics attivo
- [ ] Performance monitoring attivo
- [ ] Error tracking funzionante
- [ ] Dashboard monitoraggio pronto

### **📱 Mobile**
- [ ] APK firmato generato
- [ ] Test su device fisici
- [ ] Icon e splash screen
- [ ] Permissions configurate
- [ ] Store listing preparato

---

## 🚀 Go Live!

Una volta completata questa checklist, l'applicazione Playsport Pro è pronta per la produzione con:

- ✅ **Performance ottimizzate** con Core Web Vitals
- ✅ **Sicurezza enterprise-grade** con CSP e Firebase rules
- ✅ **Monitoraggio completo** con Sentry e Analytics
- ✅ **Testing robusto** con coverage 80%+
- ✅ **Deploy automatizzato** con script CI/CD
- ✅ **Mobile app** pronta per store

**L'applicazione è ora pronta per servire migliaia di utenti con performance, sicurezza e affidabilità di livello enterprise! 🎉**