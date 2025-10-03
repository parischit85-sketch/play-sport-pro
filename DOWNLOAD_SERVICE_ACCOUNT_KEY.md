# 📥 Come Scaricare serviceAccountKey.json

Per eseguire lo script di migrazione, hai bisogno del file `serviceAccountKey.json` dalla Firebase Console.

## 🔐 Passaggi per Scaricare la Chiave

### 1. Vai alla Firebase Console
Apri: https://console.firebase.google.com/project/m-padelweb/settings/serviceaccounts/adminsdk

### 2. Seleziona il Progetto
- Assicurati di essere nel progetto: **m-padelweb**

### 3. Vai alla Sezione Service Accounts
- Nella console, vai su **⚙️ Settings** (Icona ingranaggio in alto a sinistra)
- Clicca su **Service accounts**

### 4. Genera Nuova Chiave Privata
- Nella sezione "Firebase Admin SDK", troverai:
  - Language: Node.js (dovrebbe essere già selezionato)
  - Un bottone: **"Generate new private key"**
  
- Clicca su **"Generate new private key"**
- Conferma cliccando **"Generate key"** nel popup

### 5. Salva il File
- Il browser scaricherà un file JSON con un nome tipo: `m-padelweb-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`
- **RINOMINALO** in: `serviceAccountKey.json`
- **SPOSTALO** nella root del progetto: 
  ```
  c:\Users\paris\Downloads\playsport-complete-backup-2025-09-17_23-57-07\serviceAccountKey.json
  ```

## ⚠️ Importante - Sicurezza

**NON condividere mai questo file!** Contiene credenziali admin per il tuo database Firebase.

Il file è già incluso in `.gitignore`, quindi non verrà committato per errore.

## ✅ Verifica

Dopo aver scaricato e rinominato il file, verifica che esista:

```powershell
Test-Path "c:\Users\paris\Downloads\playsport-complete-backup-2025-09-17_23-57-07\serviceAccountKey.json"
```

Dovrebbe restituire: `True`

## 🚀 Dopo il Download

Una volta che il file è al posto giusto, riesegui lo script:

```bash
node migrate-bookings.cjs
```

---

**Link Diretto**: https://console.firebase.google.com/project/m-padelweb/settings/serviceaccounts/adminsdk
