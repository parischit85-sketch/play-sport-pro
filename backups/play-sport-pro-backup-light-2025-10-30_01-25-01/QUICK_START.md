# ⚡ QUICK START - Setup Immediato
**Tempo Stimato**: 30-45 minuti  
**Obiettivo**: Ottenere app funzionante in locale  

---

## 🎯 Step 1: Crea File .env (5 minuti)

### 1.1 Copia Template
```bash
# Nella root del progetto
cp .env.production.example .env
```

**Oppure crea manualmente** file `.env` nella root con questo contenuto:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_GA_MEASUREMENT_ID=

# Feature Flags
VITE_AUTH_EMAIL_LINK_ENABLED=false
VITE_FIRESTORE_FORCE_LONG_POLLING=false
VITE_USE_FIREBASE_EMULATOR=false
```

---

## 🔥 Step 2: Ottieni Credenziali Firebase (10-15 minuti)

### 2.1 Accedi a Firebase Console
👉 **https://console.firebase.google.com/**

### 2.2 Crea Nuovo Progetto (se non esiste)

1. Click **"Add project"** / **"Aggiungi progetto"**
2. **Nome progetto**: `playsport-pro` (o altro nome)
3. Click **Continue**
4. Google Analytics: **Abilita** (consigliato) o salta
5. Click **Create project**
6. Attendi completamento (~30 secondi)

### 2.3 Aggiungi App Web

1. Nella dashboard, click icona **"</>** " (Web)
2. **Nickname**: `PlaySport Web App`
3. ✅ **Also set up Firebase Hosting** (opzionale)
4. Click **Register app**

### 2.4 Copia Configurazione

Vedrai uno script simile a questo:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "playsport-pro.firebaseapp.com",
  projectId: "playsport-pro",
  storageBucket: "playsport-pro.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXXXXXX"
};
```

### 2.5 Compila il File .env

Copia i valori nel tuo file `.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=playsport-pro.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=playsport-pro
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_STORAGE_BUCKET=playsport-pro.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

✅ **Salva il file .env**

---

## 🔐 Step 3: Configura Firebase Authentication (5 minuti)

### 3.1 Abilita Email/Password

1. Firebase Console → **Build** → **Authentication**
2. Click **Get started**
3. Tab **Sign-in method**
4. Click **Email/Password**
5. **Enable** primo toggle (Email/Password)
6. Click **Save**

### 3.2 Aggiungi Domini Autorizzati

1. Sempre in Authentication → Tab **Settings**
2. Scroll a **Authorized domains**
3. Verifica che `localhost` sia presente ✅
4. (Per produzione, aggiungerai il tuo dominio qui)

---

## 💾 Step 4: Configura Firestore Database (5 minuti)

### 4.1 Crea Database

1. Firebase Console → **Build** → **Firestore Database**
2. Click **Create database**
3. **Location**: Scegli `europe-west1` (Amsterdam) o tua preferenza
4. **Security rules**: Seleziona **"Start in production mode"**
5. Click **Enable**
6. Attendi creazione (~30 secondi)

### 4.2 Deploy Security Rules

**Opzione A - Firebase CLI (consigliata)**:
```bash
# Installa Firebase CLI (se non hai)
npm install -g firebase-tools

# Login
firebase login

# Inizializza (se non fatto)
firebase init firestore
# Seleziona il progetto creato
# Firestore Rules: firestore.rules
# Firestore Indexes: firestore.indexes.json

# Deploy rules
firebase deploy --only firestore:rules
```

**Opzione B - Manuale**:
1. Firestore → Tab **Rules**
2. Copia contenuto da file `firestore.rules` del progetto
3. Click **Publish**

---

## 📦 Step 5: Configura Storage (5 minuti)

### 5.1 Inizializza Storage

1. Firebase Console → **Build** → **Storage**
2. Click **Get started**
3. **Security rules**: **Start in production mode**
4. **Location**: Stessa del Firestore
5. Click **Done**

### 5.2 Deploy Storage Rules

**CLI**:
```bash
firebase deploy --only storage:rules
```

**Manuale**:
1. Storage → Tab **Rules**
2. Copia contenuto da file `storage.rules` del progetto
3. Click **Publish**

---

## 📊 Step 6: Google Analytics (Opzionale - 5 minuti)

### Opzione A: Usa GA4 di Firebase

Se hai abilitato Google Analytics nella creazione progetto, il Measurement ID è già nel config Firebase (campo `measurementId`). Hai già copiato questo valore in `.env` ✅

### Opzione B: Crea Property GA4 Separata

1. **https://analytics.google.com/**
2. Admin → **Create Property**
3. Nome: `PlaySport Pro`
4. **Create Data Stream** → Web
5. URL: `http://localhost:5173` (per ora)
6. Copia **Measurement ID** (formato G-XXXXXXXXXX)
7. Aggiorna `.env`:
   ```env
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

---

## 🚀 Step 7: Test Locale (2 minuti)

### 7.1 Verifica .env

```bash
# Assicurati che .env esista
ls .env

# Verifica contenuto (deve avere tutti i valori)
cat .env
```

**Checklist**:
- [ ] File `.env` esiste nella root
- [ ] Tutti i campi `VITE_FIREBASE_*` compilati
- [ ] Nessun valore "your_*" o placeholder
- [ ] Measurement ID formato G-XXXXXXXXXX

### 7.2 Avvia Dev Server

```bash
npm run dev
```

**Output Atteso**:
```
VITE v7.1.9  ready in 694 ms
➜  Local:   http://localhost:5173/
```

### 7.3 Apri Browser

1. Vai a **http://localhost:5173/**
2. Apri **Developer Tools** (F12)
3. Tab **Console**

**Verifica**:
- ✅ Nessun errore "Missing Firebase configuration"
- ✅ Nessun errore rosso
- ✅ Vedi messaggio "✅ GA4 initialized: G-XXXXXXXXXX" (se console log attivo)
- ✅ App carica correttamente

### 7.4 Test Login

1. Click **Sign Up** / **Registrati**
2. Inserisci email e password
3. Click **Create Account**

**Se funziona**: ✅ **Setup Completo!**

**Se errori**: Vedi sezione Troubleshooting sotto

---

## 🐛 Troubleshooting

### Errore: "Missing Firebase configuration"

**Causa**: File `.env` non trovato o variabili non caricate

**Soluzione**:
```bash
# Verifica .env esiste
ls -la | grep .env

# Riavvia dev server (importante!)
# CTRL+C per fermare
npm run dev
```

### Errore: "Firebase: Error (auth/invalid-api-key)"

**Causa**: API Key errata o non valida

**Soluzione**:
1. Torna a Firebase Console
2. Project Settings → Your apps
3. Verifica API Key
4. Ricopia in `.env`
5. Riavvia dev server

### Errore: "auth/operation-not-allowed"

**Causa**: Email/Password provider non abilitato

**Soluzione**:
1. Firebase Console → Authentication → Sign-in method
2. Abilita Email/Password
3. Riprova login

### Errore: "Firestore: Missing or insufficient permissions"

**Causa**: Security Rules non deployate o troppo restrittive

**Soluzione**:
```bash
# Deploy rules
firebase deploy --only firestore:rules

# Oppure temporaneamente (SOLO SVILUPPO):
# Firebase Console → Firestore → Rules
# Cambia:
allow read, write: if false;
# in:
allow read, write: if request.auth != null;
```

### App carica ma nessun log GA4

**Causa**: Normale, i log sono disabilitati in produzione

**Per vedere log**:
Apri `src/lib/analytics.js` e cerca `console.log` commentati, oppure usa GA4 DebugView.

---

## ✅ Checklist Completamento

### Configurazione Firebase
- [ ] Progetto Firebase creato
- [ ] App web registrata
- [ ] Credenziali copiate in `.env`
- [ ] Authentication abilitata (Email/Password)
- [ ] Firestore database creato
- [ ] Storage inizializzato
- [ ] Security rules deployate

### File Locali
- [ ] File `.env` creato
- [ ] Tutte le variabili compilate
- [ ] `.env` NON committato in Git (verifica con `git status`)

### Testing
- [ ] `npm run dev` funziona
- [ ] App apre in browser
- [ ] Nessun errore console
- [ ] Sign up funziona
- [ ] Login funziona

---

## 🎯 Next Steps

Dopo setup locale funzionante:

### 1. Deploy Staging (Opzionale)
**Guida**: `GUIDA_DEPLOY_STAGING.md`
- Setup Netlify
- Configurare environment variables su Netlify
- Deploy automatico da Git

### 2. QA Testing
**Guida**: `CHECKLIST_QA_MANUALE.md`
- Test tutte le funzionalità
- Cross-browser testing
- Performance testing

### 3. Deploy Production
**Guida**: `DEPLOYMENT_CHECKLIST.md`
- Configura dominio custom
- Setup SSL
- Monitor post-deploy

---

## 📞 Supporto

**Guide Disponibili**:
- Setup completo: `GUIDA_VERIFICA_FIREBASE.md`
- Deploy staging: `GUIDA_DEPLOY_STAGING.md`
- Checklist deploy: `DEPLOYMENT_CHECKLIST.md`
- Testing: `CHECKLIST_QA_MANUALE.md`

**Risorse**:
- Firebase Console: https://console.firebase.google.com/
- Firebase Docs: https://firebase.google.com/docs
- Google Analytics: https://analytics.google.com/

---

## ⏱️ Tempo Totale

| Step | Tempo | Descrizione |
|------|-------|-------------|
| 1 | 5 min | Crea .env file |
| 2 | 10-15 min | Setup Firebase project |
| 3 | 5 min | Abilita Authentication |
| 4 | 5 min | Setup Firestore |
| 5 | 5 min | Setup Storage |
| 6 | 5 min | Google Analytics (opt) |
| 7 | 2 min | Test locale |
| **Totale** | **30-45 min** | Setup completo |

---

## 🎉 Congratulazioni!

Dopo questi step hai:
- ✅ Firebase configurato
- ✅ App funzionante in locale
- ✅ Authentication attivo
- ✅ Database pronto
- ✅ Analytics tracking

**Sei pronto per sviluppare e testare!** 🚀

---

**Quick Start Guide**  
**Version**: 1.0  
**Last Updated**: 15 Ottobre 2025  
**For**: PlaySport Pro v1.0.4  
