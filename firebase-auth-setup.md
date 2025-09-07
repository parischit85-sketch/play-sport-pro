# Guida Configurazione Firebase Authentication

## 🔧 Configurazione Richiesta nella Console Firebase

### 1. Abilita Metodi di Autenticazione

Vai su [Console Firebase - Authentication](https://console.firebase.google.com/project/m-padelweb/authentication/providers)

**Abilita questi metodi di accesso:**

#### A. Autenticazione Google

1. Clicca su "Google" nella tab Metodi di accesso
2. Attiva l'interruttore "Abilita"
3. Aggiungi la tua email di supporto
4. Salva

#### B. Autenticazione Email/Password

1. Clicca su "Email/Password" nella tab Metodi di accesso
2. Abilita sia "Email/Password" che "Link email (senza password)"
3. Salva

### 2. Aggiungi Domini Autorizzati

Vai su [Console Firebase - Domini Autorizzati](https://console.firebase.google.com/project/m-padelweb/authentication/settings)

**Aggiungi questi domini:**

- `localhost` (per sviluppo)
- `localhost:5173` (per server dev Vite)
- Il tuo dominio di produzione quando pronto

### 3. Configurazione Progetto Attuale

- ✅ ID Progetto: `m-padelweb`
- ✅ Dominio Auth: `m-padelweb.firebaseapp.com`
- ✅ Chiave API: Configurata in .env.local

## 🧪 Test Autenticazione

### Prova Prima l'Accesso Google

1. Apri http://localhost:5173/
2. Clicca sulla tab "Accedi"
3. Clicca su "Continua con Google"
4. Completa il profilo se richiesto

### Se l'Accesso Google fallisce con errori CORS:

- Assicurati che `localhost:5173` sia nei domini autorizzati
- Prova il metodo redirect (dovrebbe funzionare automaticamente su localhost)

### Per Email/Password:

1. Prima registra un nuovo account (clicca "Registrati")
2. Usa una email valida e password (minimo 6 caratteri)
3. Poi prova ad accedere

## 🐛 Problemi Comuni

**Errore 400 Bad Request su Email/Password:**

- Email/Password non abilitato nella Console Firebase
- L'utente non esiste (bisogna registrarsi prima)
- Formato email non valido o password troppo corta

**Errori CORS/Popup su Accesso Google:**

- localhost non nei domini autorizzati
- Dovrebbe automaticamente usare il metodo redirect come fallback

**Errori permission-denied:**

- Ora risolti - l'app aspetta l'autenticazione prima di accedere a Firestore

## 📋 Passi per Risolvere

1. **Vai alla Console Firebase**: https://console.firebase.google.com/project/m-padelweb/authentication/providers
2. **Abilita Google**: Attiva l'autenticazione Google
3. **Abilita Email/Password**: Attiva l'autenticazione Email/Password
4. **Aggiungi Domini**: Vai su Settings → Authorized domains → Aggiungi `localhost:5173`
5. **Testa**: Prova prima Google, poi Email/Password (registrandoti prima)

Una volta completati questi passaggi, l'autenticazione dovrebbe funzionare senza errori!
