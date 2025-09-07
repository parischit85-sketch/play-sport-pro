# Setup Firebase per m-padelweb

## Errori Attuali
```
FirebaseError: [code=permission-denied]: Missing or insufficient permissions.
CONFIGURATION_NOT_FOUND
```

## Soluzione: Abilitare Authentication

### 1. Accedi alla Console Firebase
Vai su: https://console.firebase.google.com/project/m-padelweb

### 2. Abilita Authentication
1. Nel menu laterale, clicca **Authentication**
2. Clicca **Get started** se è la prima volta
3. Vai su tab **Sign-in method**

### 3. Configura Providers
**Google Provider** (Obbligatorio):
- Clicca su **Google**
- Abilita il toggle
- Imposta un **Support email** (usa `parischit85@gmail.com`)
- Salva

**Email/Password** (Raccomandato):
- Clicca su **Email/Password**
- Abilita il toggle per **Email/Password**
- Opzionale: Abilita **Email link (passwordless)**
- Salva

### 4. Configura Domini Autorizzati
1. Vai su **Authentication** → **Settings** → **Authorized domains**
2. Aggiungi i domini:
   - `localhost` (per sviluppo)
   - Il tuo dominio Netlify (per produzione)

### 5. Verifica Setup
Dopo aver abilitato l'Authentication:
```bash
npm run dev
```

Gli errori di "CONFIGURATION_NOT_FOUND" dovrebbero sparire.

## Comandi Firebase CLI (Opzionali)

Verifica la configurazione:
```bash
firebase projects:list
firebase use m-padelweb
firebase firestore:indexes
```

Deploy regole (se necessario):
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Troubleshooting

**Se vedi ancora errori dopo setup:**
1. Controlla che l'Authentication sia "enabled" nella console
2. Verifica che i domini siano nella whitelist
3. Ricarica la pagina con cache cleared (Ctrl+F5)
4. Controlla la console browser per errori specifici

**Test di funzionamento:**
- Il pulsante "Login con Google" dovrebbe apparire
- Il login dovrebbe funzionare senza errori 
- I dati dovrebbero salvare/caricare dal cloud
