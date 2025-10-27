# Test Registrazione con Debug Esteso

## Server Locale Attivo
🚀 **URL:** http://localhost:5173/

## Debug Aggiunto

Ho aggiunto logging dettagliato in 3 punti:

### 1. RegisterPage.jsx
- ✅ Log dei dati del form prima del salvataggio
- ✅ Log dell'ID utente
- ✅ Log del profileData completo (JSON)
- ✅ Log di ogni step del processo
- ✅ Log dei dati recuperati da Firestore dopo il salvataggio
- ✅ Verifica di ogni campo (firstName, lastName, phone, email, etc.)

### 2. auth.jsx - updateUserProfile()
- ✅ Log quando la funzione viene chiamata
- ✅ Log dei parametri ricevuti (uid, updates)
- ✅ Log quando completa con successo

### 3. users.js - updateUser()
- ✅ Log dei parametri ricevuti
- ✅ Check se l'utente esiste
- ✅ Log dei dati da scrivere su Firestore
- ✅ Log dopo la scrittura completata
- ✅ Log dei dati recuperati dopo l'update

## Come Testare

### Passo 1: Apri la Console del Browser
1. Vai su http://localhost:5173/
2. Premi **F12** per aprire DevTools
3. Vai nella tab **Console**
4. Assicurati di vedere tutti i log (non filtrare nulla)

### Passo 2: Registrati con Nuovi Dati
1. Clicca su **Registrati** (o vai su /register)
2. Compila il form con:
   - **Email:** test@example.com (o qualsiasi email valida non usata prima)
   - **Password:** test123 (minimo 6 caratteri)
   - **Conferma Password:** test123
   - **Nome:** Mario
   - **Cognome:** Rossi
   - **Telefono:** +393331234567
   - **Codice Fiscale:** (opzionale)
   - **Data di Nascita:** (opzionale)
   - **Indirizzo:** (opzionale)
3. Accetta i termini e condizioni
4. Clicca **Registrati**

### Passo 3: Monitora la Console
Dovresti vedere questa sequenza di log:

```
🔍 [DEBUG] Starting profile save process...
🔍 [DEBUG] User ID: <uid>
🔍 [DEBUG] Profile data to save: { email, firstName, lastName, phone, ... }
🔍 [AUTH] updateUserProfile called with: { uid, updates: {...} }
🔍 [USERS] updateUser called: { uid, updates: {...} }
🔍 [USERS] User exists check: true/false
🔍 [USERS] Writing to Firestore: {...}
✅ [USERS] Firestore write completed
🔍 [USERS] Retrieved updated user: {...}
✅ [AUTH] updateUserProfile completed successfully
✅ [DEBUG] Profile saved successfully to Firestore
🔍 [DEBUG] Setting display name: Mario Rossi
✅ [DEBUG] Display name set successfully
🔄 [DEBUG] Reloading user data after profile save...
✅ [DEBUG] User data reloaded successfully
🔍 [DEBUG] Fetching profile to verify save...
🔍 [DEBUG] Profile fetched from Firestore: {...}
🔍 [DEBUG] Profile verification: {
  hasFirstName: true/false,
  hasLastName: true/false,
  hasPhone: true/false,
  hasEmail: true/false,
  firstName: "Mario",
  lastName: "Rossi",
  phone: "+393331234567",
  ...
}
✅ Registration completed successfully
🔄 Redirecting to dashboard with full page reload...
```

### Passo 4: Copia i Log
1. **Copia TUTTI i log dalla console** (tasto destro → Copy all messages o seleziona e copia)
2. Incollali qui per analizzarli insieme

### Passo 5: Verifica il Profilo
Dopo il redirect alla dashboard:
1. Vai alla sezione **Profilo**
2. Verifica quali campi sono compilati:
   - ✅ Email
   - ❓ Nome
   - ❓ Cognome
   - ❓ Telefono

## Cosa Cercare

### Caso 1: updateUser NON viene chiamato
Se vedi:
```
🔍 [AUTH] updateUserProfile called with: {...}
```
Ma NON vedi:
```
🔍 [USERS] updateUser called: {...}
```
→ **Problema:** L'import dinamico fallisce silenziosamente

### Caso 2: User does not exist
Se vedi:
```
🔍 [USERS] User exists check: false
❌ Cannot update user: user <uid> does not exist
```
→ **Problema:** L'utente non è stato creato prima di chiamare updateUser

### Caso 3: Dati salvati ma non recuperati
Se vedi:
```
✅ [USERS] Firestore write completed
🔍 [USERS] Retrieved updated user: { email: "...", displayName: "..." }
```
Ma i campi firstName, lastName, phone sono undefined
→ **Problema:** I dati vengono salvati ma non recuperati correttamente

### Caso 4: Redirect troppo veloce
Se il redirect avviene prima di vedere:
```
🔍 [DEBUG] Profile verification: {...}
```
→ **Problema:** Il delay di 800ms non è sufficiente

## Informazioni Aggiuntive

### Firebase Rules
Verifica le regole Firestore in Firebase Console:
- https://console.firebase.google.com/project/m-padelweb/firestore/rules

Le regole devono permettere:
```javascript
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### Struttura Dati Attesa
Il documento `users/{uid}` deve contenere:
```javascript
{
  email: "test@example.com",
  firstName: "Mario",
  lastName: "Rossi",
  phone: "+393331234567",
  fiscalCode: "...",
  birthDate: "...",
  address: "...",
  provider: "password",
  registrationCompleted: true,
  termsAcceptedAt: "2025-10-17T...",
  displayName: "Mario Rossi",
  globalRole: "user",
  status: "active",
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Problemi Noti

### Se vedi errore 403 Forbidden
Devi configurare gli HTTP referrers:
1. Vai su https://console.cloud.google.com/apis/credentials?project=m-padelweb
2. Clicca "Browser key (auto created by Firebase)"
3. Aggiungi:
   - `localhost:*`
   - `127.0.0.1:*`
   - `m-padelweb.web.app/*`
   - `m-padelweb.firebaseapp.com/*`
4. Salva e aspetta 2-3 minuti

---

## Pronto per il Test! 🚀

1. Apri http://localhost:5173/
2. Apri Console (F12)
3. Registrati
4. Copia tutti i log
5. Condividili per analisi
