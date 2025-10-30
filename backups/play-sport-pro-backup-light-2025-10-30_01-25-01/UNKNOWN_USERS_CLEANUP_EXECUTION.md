# 🗑️ Unknown Users Cleanup - Guida Esecuzione

**Data:** 17 Ottobre 2025  
**Funzione:** cleanupUnknownUsers (Cloud Function)  
**Users target:** 32 Unknown Users

---

## 🎯 Obiettivo

Eliminare 32 account "Unknown User" dal database in 3 posizioni:
1. **Firestore** `/users/{uid}` → documenti utente
2. **Firebase Authentication** → account auth
3. **Firestore** `/affiliations` → affiliazioni associate

---

## 📋 Pre-Requisiti

✅ **Cloud Function deployed:**
- Nome: `cleanupUnknownUsers`
- Regione: europe-west1
- Status: ✅ Deployed e operativa
- URL: https://cleanupunknownusers-khce34f7qa-ew.a.run.app

✅ **Autenticazione:**
- Requires: Firebase Authentication + admin/superAdmin role
- Access: Via Firebase Console (autenticazione automatica)

✅ **Sicurezza:**
- Callable function (non HTTP)
- Role-based authorization
- Dry-run support (opzionale)

---

## 🚀 Metodo 1: Firebase Console (RACCOMANDATO)

### Passo 1: Aprire Firebase Console
```
URL: https://console.firebase.google.com/project/m-padelweb/functions
```

### Passo 2: Trovare la Funzione
1. Menu laterale → **Functions**
2. Cercare nella lista: **cleanupUnknownUsers**
3. Click sul nome della funzione

### Passo 3: Eseguire la Funzione
1. Tab: **Testing** (in alto)
2. Sezione "Request data": lasciare vuoto `{}` (opzionale: `{ "dryRun": true }`)
3. Click: **Run function** (bottone blu)

### Passo 4: Verificare Output
La funzione restituirà un JSON simile a:
```json
{
  "success": true,
  "message": "✅ Cleanup complete! Deleted 32 Unknown Users.",
  "deleted": 32,
  "errors": 0,
  "remaining": 0,
  "timestamp": "2025-10-17T15:30:00.000Z",
  "triggeredBy": "your-email@example.com",
  "details": [
    {
      "uid": "abc123...",
      "email": "unknown_user_1@example.com",
      "deleted": true,
      "affiliationsDeleted": 2
    }
    // ... 31 altri users
  ]
}
```

### Passo 5: Controllare Logs
1. Tab: **Logs** (in alto)
2. Verificare:
   - "🔍 Found X Unknown Users"
   - "✅ Deleted user abc123"
   - "🗑️ Deleted Y affiliations"
   - "✅ Cleanup complete!"

---

## 🧪 Metodo 2: Dry Run (Test Senza Eliminare)

**Prima di eliminare definitivamente**, puoi fare un test:

### Request Data per Dry Run
```json
{
  "dryRun": true
}
```

### Output Dry Run
```json
{
  "success": true,
  "message": "🧪 DRY RUN - Would delete 32 Unknown Users",
  "wouldDelete": 32,
  "dryRun": true,
  "details": [
    {
      "uid": "abc123",
      "email": "unknown_user_1@example.com",
      "affiliations": 2,
      "wouldBeDeleted": true
    }
    // ... lista completa
  ]
}
```

**Vantaggi Dry Run:**
- Nessuna modifica al database
- Vedi esattamente cosa verrà eliminato
- Puoi verificare i dettagli prima dell'esecuzione reale

---

## 📊 Verifica Post-Cleanup

### 1. Firestore Console
```
URL: https://console.firebase.google.com/project/m-padelweb/firestore
```

**Controlla:**
- Collection `/users` → Cerca "Unknown User"
- Collection `/affiliations` → Verifica userId riferiscono utenti validi

### 2. Authentication Console
```
URL: https://console.firebase.google.com/project/m-padelweb/authentication/users
```

**Controlla:**
- Cerca "unknown_user_" nelle email
- Dovrebbero essere 0 risultati

### 3. Query Firestore Manuale
```javascript
// In Firestore console → Query
db.collection('users')
  .where('firstName', '==', 'Unknown')
  .where('lastName', '==', 'User')
  .get()
  .then(snap => console.log('Remaining:', snap.size)); // Should be 0
```

---

## ⚠️ Cosa Succede Durante l'Esecuzione

### Step 1: Identificazione (2-3 secondi)
```
🔍 Querying Firestore for Unknown Users...
📊 Found 32 Unknown Users to process
```

### Step 2: Eliminazione User by User (10-15 secondi)
```
🗑️ Processing user 1/32: abc123...
  ✅ Deleted from Firestore (/users/abc123)
  ✅ Deleted from Auth (abc123)
  ✅ Deleted 2 affiliations

🗑️ Processing user 2/32: def456...
  ✅ Deleted from Firestore (/users/def456)
  ✅ Deleted from Auth (def456)
  ✅ Deleted 0 affiliations

[... continua per tutti i 32 users ...]
```

### Step 3: Verifica Finale (1-2 secondi)
```
🔍 Verifying cleanup...
✅ Verification complete: 0 Unknown Users remaining
```

### Step 4: Report Finale
```
✅ Cleanup complete!
   Deleted: 32 users
   Errors: 0
   Affiliations deleted: 27 total
   Remaining Unknown Users: 0
```

---

## ❌ Gestione Errori

### Errore: "Insufficient permissions"
**Causa:** Non hai ruolo admin/superAdmin  
**Soluzione:**
1. Firestore console → `/users/{yourUid}`
2. Aggiungi campo: `role: "admin"`
3. Riprova esecuzione

### Errore: "User not found in Auth"
**Comportamento:** La funzione continua (non blocca tutto)  
**Gestione:**
```javascript
// Codice interno della funzione
try {
  await admin.auth().deleteUser(uid);
} catch (error) {
  if (error.code === 'auth/user-not-found') {
    // OK, già eliminato o non esistente
    results.warnings.push({ uid, message: 'User not in Auth' });
  } else {
    // Errore serio, continua con prossimo user
    results.errors.push({ uid, error: error.message });
  }
}
```

### Errore: "Timeout"
**Causa:** Troppi users (>100)  
**Soluzione:** La funzione ha timeout di 540 secondi (9 minuti)  
**Se necessario:** Modificare `timeoutSeconds` in `functions/cleanupUnknownUsers.js`

---

## 🎉 Risultato Atteso

### Database Pulito
- ✅ 0 "Unknown User" in Firestore `/users`
- ✅ 0 account "unknown_user_*" in Authentication
- ✅ 0 affiliazioni orfane in `/affiliations`

### Metriche
- **Users eliminati:** 32
- **Affiliazioni eliminate:** ~27 (stima)
- **Tempo esecuzione:** 15-20 secondi
- **Errori:** 0

### Benefici
1. **Database più pulito:** -32 documenti utente spazzatura
2. **Auth più leggera:** -32 account inutilizzati
3. **Analytics migliori:** Statistiche più accurate (no Unknown Users)
4. **Performance:** Query più veloci (meno documenti)

---

## 📝 Log di Esempio Completo

```
🔍 [cleanupUnknownUsers] Function called by: admin@example.com
🔍 [cleanupUnknownUsers] Querying Firestore for Unknown Users...
📊 [cleanupUnknownUsers] Found 32 Unknown Users

🗑️ [cleanupUnknownUsers] Processing user 1/32: Ks1jP7Vh3BT6fXmQRpKJ2wL8N9M0
  ✅ Deleted Firestore doc: /users/Ks1jP7Vh3BT6fXmQRpKJ2wL8N9M0
  ✅ Deleted Auth user: Ks1jP7Vh3BT6fXmQRpKJ2wL8N9M0
  ✅ Deleted 2 affiliations for user Ks1jP7Vh3BT6fXmQRpKJ2wL8N9M0

[... 30 altri users ...]

🗑️ [cleanupUnknownUsers] Processing user 32/32: Zx9yW8Vn7Um6Tl5Sk4Rj3Qi2Ph1O
  ✅ Deleted Firestore doc: /users/Zx9yW8Vn7Um6Tl5Sk4Rj3Qi2Ph1O
  ✅ Deleted Auth user: Zx9yW8Vn7Um6Tl5Sk4Rj3Qi2Ph1O
  ✅ Deleted 0 affiliations for user Zx9yW8Vn7Um6Tl5Sk4Rj3Qi2Ph1O

🔍 [cleanupUnknownUsers] Verifying cleanup...
✅ [cleanupUnknownUsers] Verification: 0 Unknown Users remaining

✅ [cleanupUnknownUsers] Cleanup complete!
   Deleted: 32 users
   Errors: 0
   Affiliations: 27 deleted
   Time: 18.4 seconds
```

---

## 🔧 Alternative: Script Locale (NON RACCOMANDATO)

Se per qualche motivo non puoi usare Firebase Console:

### Prerequisiti
- `serviceAccountKey.json` scaricato
- Node.js installato
- Firebase Admin SDK installato

### Comando
```bash
node scripts/cleanup-unknown-users.js
```

### Perché NON raccomandato?
- ❌ Richiede credenziali locali (rischio sicurezza)
- ❌ Nessun audit log centralizzato
- ❌ Più complesso (setup Firebase Admin SDK)
- ❌ Non tracciabile in Cloud Functions logs

**Usa sempre Firebase Console quando possibile!**

---

## 📚 Riferimenti

### Cloud Function Source
- File: `functions/cleanupUnknownUsers.js` (168 lines)
- Exports: `cleanupUnknownUsers` (callable function)
- Region: europe-west1
- Timeout: 540s (9 minuti)
- Memory: 256MiB

### Documentazione
- `UNKNOWN_USERS_CLEANUP_OPTIONS.md` - 3 metodi a confronto
- `SPRINT_1_QUICK_WINS_COMPLETE.md` - Sprint 1 report completo
- `functions/index.js` - Export configuration

### Console URLs
- Functions: https://console.firebase.google.com/project/m-padelweb/functions
- Firestore: https://console.firebase.google.com/project/m-padelweb/firestore
- Authentication: https://console.firebase.google.com/project/m-padelweb/authentication

---

**✅ Pronto per esecuzione immediata!**

**Prossimo step:** Apri Firebase Console e clicca "Run function" 🚀
