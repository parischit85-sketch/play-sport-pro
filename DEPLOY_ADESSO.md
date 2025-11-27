# ⚡ DEPLOY RAPIDO - ESEGUI QUESTI COMANDI

**Data**: 26 Novembre 2025  
**Tempo richiesto**: 5 minuti  

---

## 🚀 STEP BY STEP - COPIA E INCOLLA QUESTI COMANDI

### 1️⃣ Vai nella directory del progetto

```powershell
cd "C:\Users\paris\Downloads\play-sport-backup-2025-10-05_23-30-00"
```

### 2️⃣ Copia i file delle Cloud Functions

```powershell
# Crea cartella functions (se non esiste)
New-Item -ItemType Directory -Path "functions" -Force

# Copia i nuovi file
Copy-Item -Path "cloud-function-fix\*" -Destination "functions\" -Force

Write-Host "✅ File copiati!" -ForegroundColor Green
```

### 3️⃣ Installa le dipendenze

```powershell
cd functions
npm install
cd ..
```

**Attendi** che npm finisca l'installazione (circa 30-60 secondi).

### 4️⃣ Seleziona il progetto Firebase

```powershell
firebase use m-padelweb
```

### 5️⃣ Deploya le Cloud Functions

```powershell
firebase deploy --only functions
```

**Attendi** il completamento (circa 2-3 minuti).

Dovresti vedere:
```
✔ Deploy complete!
```

---

## ✅ VERIFICA

1. **Firebase Console**:  
   https://console.firebase.google.com/project/m-padelweb/functions
   
   Dovresti vedere 5 functions:
   - sendPushToUser
   - sendPushToUserHTTP
   - sendBulkPush
   - sendBulkPushHTTP
   - cleanupInactiveSubscriptions

2. **Test da Admin Panel**:  
   https://play-sport.pro/admin/push-notifications
   
   - Cerca il tuo utente
   - Clicca "Test Push"
   - **Controlla il Samsung** → Notifica DEVE arrivare!

---

## 🆘 SE ERRORI

### Errore: "Firebase CLI not found"

```powershell
npm install -g firebase-tools
firebase login
```

### Errore: "Project not found"

```powershell
firebase login
firebase projects:list
firebase use m-padelweb
```

### Errore durante deploy

**Copia l'errore completo** e dimmi cosa dice.

---

## 🎯 COMANDI TUTTI IN UNA VOLTA

Se vuoi eseguire tutto insieme:

```powershell
cd "C:\Users\paris\Downloads\play-sport-backup-2025-10-05_23-30-00"
New-Item -ItemType Directory -Path "functions" -Force
Copy-Item -Path "cloud-function-fix\*" -Destination "functions\" -Force
cd functions
npm install
cd ..
firebase use m-padelweb
firebase deploy --only functions
```

---

## 📊 OUTPUT ATTESO

Durante il deploy vedrai:

```
i  deploying functions
i  functions: preparing codebase default for deployment
✔  functions: codebase default ready for deployment
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
✔  functions: required API cloudbuild.googleapis.com is enabled
i  functions: preparing functions directory for uploading...
i  functions: packaged functions (XX KB) for uploading
✔  functions: functions folder uploaded successfully
i  functions: creating Node.js 18 function sendPushToUser(europe-west1)...
i  functions: creating Node.js 18 function sendPushToUserHTTP(europe-west1)...
i  functions: creating Node.js 18 function sendBulkPush(europe-west1)...
i  functions: creating Node.js 18 function sendBulkPushHTTP(europe-west1)...
i  functions: creating Node.js 18 function cleanupInactiveSubscriptions(europe-west1)...
✔  functions[sendPushToUser(europe-west1)] Successful create operation.
✔  functions[sendPushToUserHTTP(europe-west1)] Successful create operation.
✔  functions[sendBulkPush(europe-west1)] Successful create operation.
✔  functions[sendBulkPushHTTP(europe-west1)] Successful create operation.
✔  functions[cleanupInactiveSubscriptions(europe-west1)] Successful create operation.

✔  Deploy complete!
```

---

## ⏱️ TIMELINE

- 00:00 - Inizio deploy
- 00:30 - Upload codice
- 01:00 - Build functions
- 02:00 - Deploy in corso
- 03:00 - ✅ **Deploy completato!**

---

**ESEGUI ORA I COMANDI SOPRA!** ⬆️

Poi testa da Admin Panel e dimmi se la notifica arriva sul Samsung! 📱

