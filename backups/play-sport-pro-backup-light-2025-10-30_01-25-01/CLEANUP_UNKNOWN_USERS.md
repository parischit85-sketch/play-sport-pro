# 🗑️ Cleanup Unknown Users - Guida Completa

**Data:** 10 Ottobre 2025  
**Obiettivo:** Eliminare definitivamente i 32 utenti "Unknown User" dal database

---

## 📋 Situazione Attuale

Dopo aver applicato i fix per gestire gli utenti senza `userId`, abbiamo:
- ✅ **66 players totali** visibili nella UI
- ⚠️ **32 players "Unknown User"** senza dati completi
- ✅ **34 players validi** con dati completi

Gli "Unknown User" sono utenti legacy nella collection `clubs/sporting-cat/users` che:
- ❌ Non hanno campo `userId`
- ❌ Non hanno `userName` o `userEmail`
- ❌ Non sono collegati a nessun account Firebase Auth
- ❌ Probabilmente sono residui di migrazioni o test

---

## 🎯 Obiettivo della Pulizia

Eliminare TUTTI i 32 utenti senza `userId` per:
1. ✅ Pulire il database da dati incompleti
2. ✅ Tornare ai 34 players validi
3. ✅ Evitare confusione nella gestione utenti
4. ✅ Migliorare le performance delle query

---

## 🛠️ Metodi di Pulizia Disponibili

### Metodo 1: Script Node.js (Raccomandato per Server)

**Quando usarlo:**
- Hai accesso al server/terminale
- Vuoi un log dettagliato
- Vuoi conferma prima dell'eliminazione

**Procedura:**

1. **Scarica Service Account Key:**
   ```bash
   # Vai a: Firebase Console > Project Settings > Service Accounts
   # Clicca: Generate New Private Key
   # Salva come: serviceAccountKey.json
   ```

2. **Posiziona il file:**
   ```
   play-sport-backup-2025-10-05_23-30-00/
     └── serviceAccountKey.json  ← Qui
     └── cleanup-unknown-users.cjs
   ```

3. **Installa dipendenze (se necessario):**
   ```bash
   npm install firebase-admin
   ```

4. **PRIMA: Esegui in modalità DRY RUN (simulazione):**
   ```bash
   node cleanup-unknown-users.cjs
   ```
   
   Vedrai:
   ```
   🔍 DRY RUN MODE - Nessuna eliminazione effettiva
      Verrebbero eliminati 32 utenti
   ```

5. **POI: Modifica il file per eliminare veramente:**
   ```javascript
   // Apri: cleanup-unknown-users.cjs
   // Cambia questa riga:
   const DRY_RUN = true;  // ← da true a false
   const DRY_RUN = false; // ← così
   ```

6. **Esegui l'eliminazione reale:**
   ```bash
   node cleanup-unknown-users.cjs
   ```
   
   Ti chiederà conferma:
   ```
   ⚠️  ATTENZIONE: Questa operazione è IRREVERSIBILE!
   Confermi l'eliminazione di 32 utenti? (y/n):
   ```
   
   Digita `y` e premi INVIO.

7. **Risultato:**
   ```
   ✅ ELIMINAZIONE COMPLETATA!
      32 utenti rimossi
      34 utenti mantenuti
   ```

---

### Metodo 2: Script Browser (Più Veloce)

**Quando usarlo:**
- Non hai accesso al server
- Vuoi una soluzione rapida
- Hai accesso alla Firebase Console

**Procedura:**

1. **Vai alla Firebase Console:**
   ```
   https://console.firebase.google.com/
   ```

2. **Seleziona il progetto:** `m-padelweb`

3. **Vai a Firestore Database**

4. **Apri Developer Tools:**
   - Windows/Linux: `F12` o `Ctrl+Shift+I`
   - Mac: `Cmd+Option+I`

5. **Vai alla tab "Console"**

6. **Apri il file:** `cleanup-unknown-users-browser.js`

7. **Copia TUTTO il contenuto** (Ctrl+A, Ctrl+C)

8. **Incolla nella Console** e premi INVIO

9. **PRIMA: Verifica l'output (DRY RUN):**
   ```
   🔍 DRY RUN MODE - Nessuna eliminazione effettiva
      Verrebbero eliminati 32 utenti
   
   💡 Per eliminare veramente:
      1. Trova questa riga: const DRY_RUN = true;
      2. Cambia in:        const DRY_RUN = false;
      3. Esegui di nuovo lo script
   ```

10. **POI: Modifica il codice nella console:**
    ```javascript
    // Scorri su fino a trovare:
    const DRY_RUN = true;
    
    // Cambia in:
    const DRY_RUN = false;
    ```

11. **Incolla di nuovo e premi INVIO**

12. **Conferma nel popup:**
    ```
    ⚠️ ATTENZIONE!
    Stai per eliminare 32 utenti dal club sporting-cat.
    Questa operazione è IRREVERSIBILE!
    
    Confermi l'eliminazione?
    ```
    
    Clicca **OK** per confermare.

13. **Risultato:**
    ```
    ✅ ELIMINAZIONE COMPLETATA!
       32 utenti rimossi
       34 utenti mantenuti
    ```

---

## 🔍 Verifica Post-Cleanup

### 1. Controlla Firestore Database

Vai a: `Firestore Database > clubs > sporting-cat > users`

**Prima della pulizia:**
```
📊 66 documenti
  ✅ 34 con userId definito
  ❌ 32 senza userId (Unknown User)
```

**Dopo la pulizia:**
```
📊 34 documenti
  ✅ 34 con userId definito
  ❌ 0 senza userId
```

### 2. Controlla l'App

1. Ricarica la pagina: `http://localhost:5173/club/sporting-cat/players`

2. Controlla la console:
   ```javascript
   // PRIMA:
   Players loaded: 66 (filtered from 66)
   ⚠️ KEEPING PLAYER WITH PLACEHOLDER NAME: ... (32 volte)
   
   // DOPO:
   Players loaded: 34 (filtered from 34)
   // Nessun warning "Unknown User"
   ```

3. Verifica nella lista:
   - ❌ Nessun player "Unknown User"
   - ✅ Solo players con nomi validi

---

## 📊 Output Atteso

### Script Node.js

```
🗑️  CLEANUP SCRIPT: Elimina Unknown Users
======================================================================
Club ID: sporting-cat
Modalità: LIVE (eliminazione reale)

🔍 ANALISI CLUB: sporting-cat
======================================================================

📊 Totale utenti attivi: 66

✅ Utenti da MANTENERE: 34
❌ Utenti da ELIMINARE: 32

🗑️  UTENTI CHE VERRANNO ELIMINATI:
----------------------------------------------------------------------
1. ID: 19Ko2YMKOAz30EV1PbNW
   Nome: N/A
   Email: N/A
   Ruolo: member

2. ID: 4UyCnJVYosi86EiAOnDv
   Nome: N/A
   Email: N/A
   Ruolo: member

... (altri 30 utenti)

⚠️  ATTENZIONE: Questa operazione è IRREVERSIBILE!

Confermi l'eliminazione di 32 utenti? (y/n): y

🗑️  Inizio eliminazione...
   ✅ Eliminati 32/32 utenti

✅ Eliminazione completata: 32 utenti rimossi

📊 RIEPILOGO FINALE:
======================================================================
✅ Utenti mantenuti: 34
❌ Utenti eliminati: 32
📋 Totale finale: 34

✅ Pulizia completata con successo!
   32 utenti eliminati
   34 utenti mantenuti
```

### Script Browser

```
🗑️  CLEANUP: Elimina Unknown Users
======================================================================
Club ID: sporting-cat
Modalità: 🔥 LIVE (eliminazione reale)

🔍 Caricamento utenti...
📊 Totale utenti attivi: 66

✅ Utenti da MANTENERE: 34
❌ Utenti da ELIMINARE: 32

🗑️  UTENTI CHE VERRANNO ELIMINATI:
┌─────────┬──────────────────────────┬──────────┬──────────┬────────┐
│ (index) │           ID             │   Nome   │  Email   │ Ruolo  │
├─────────┼──────────────────────────┼──────────┼──────────┼────────┤
│    0    │ '19Ko2YMKOAz30EV1PbNW...'│  'N/A'   │  'N/A'   │'member'│
│    1    │ '4UyCnJVYosi86EiAOnDv...'│  'N/A'   │  'N/A'   │'member'│
│   ...   │          ...             │   ...    │   ...    │  ...   │
└─────────┴──────────────────────────┴──────────┴──────────┴────────┘

[Popup conferma]

🗑️  Inizio eliminazione...
   ✅ Eliminati 32/32 utenti

✅ ELIMINAZIONE COMPLETATA!
   32 utenti rimossi
   34 utenti mantenuti

📊 RIEPILOGO:
======================================================================
✅ Mantenuti: 34
❌ Eliminati: 32
📋 Totale:    34
```

---

## ⚠️ Avvertenze Importanti

### 1. Backup Preventivo

Prima di eseguire lo script, fai un backup:

**Metodo A: Export Firestore**
```bash
firebase firestore:export gs://m-padelweb.appspot.com/backups/before-cleanup
```

**Metodo B: Screenshot**
- Apri Firestore: `clubs/sporting-cat/users`
- Fai screenshot della lista completa

### 2. Operazione Irreversibile

⚠️ **NON C'È MODO DI ANNULLARE** l'eliminazione!

Una volta eseguita, i 32 utenti saranno **PERMANENTEMENTE** cancellati.

### 3. Verifica il Club ID

Assicurati che `CLUB_ID = 'sporting-cat'` sia corretto nel codice.

Se hai più club, esegui lo script per ogni club separatamente.

### 4. Non Interrompere

Durante l'eliminazione:
- ❌ Non chiudere la finestra
- ❌ Non interrompere lo script
- ❌ Non spegnere il computer

L'operazione dovrebbe richiedere < 5 secondi per 32 utenti.

---

## 🐛 Troubleshooting

### Errore: "Firebase non disponibile"

**Soluzione:** Sei nella console sbagliata. Assicurati di essere in:
```
https://console.firebase.google.com/project/m-padelweb/firestore
```

### Errore: "Permission denied"

**Soluzione:** 
1. Verifica di essere autenticato come owner del progetto
2. Controlla le Firestore Rules (dovrebbero permettere admin)

### Errore: "Service account key not found"

**Soluzione:** Scarica il service account key:
1. Firebase Console > Project Settings > Service Accounts
2. Generate New Private Key
3. Salva come `serviceAccountKey.json`

### Lo script non elimina nulla (DRY_RUN)

**Soluzione:** Cambia `const DRY_RUN = true;` in `const DRY_RUN = false;`

---

## 📝 Dopo la Pulizia

### 1. Commit delle Modifiche

I fix applicati vanno committati:

```bash
git add src/contexts/ClubContext.jsx
git add CLUB_USERS_UNDEFINED_USERID_FIX.md
git add cleanup-unknown-users.cjs
git add cleanup-unknown-users-browser.js
git add CLEANUP_UNKNOWN_USERS.md

git commit -m "fix: handle users without userId and cleanup script"
git push origin main
```

### 2. Aggiorna la Documentazione

Annota nel changelog:
- Data pulizia: 10 Ottobre 2025
- Utenti eliminati: 32
- Motivo: Unknown Users senza userId

### 3. Monitora l'App

Per i prossimi giorni, verifica:
- ✅ Nessun errore nella console
- ✅ Tutti i players caricano correttamente
- ✅ Le modifiche ai players funzionano
- ✅ Nessun problema con i certificati medici

---

## 🎯 Checklist Completa

- [ ] **Backup creato**
- [ ] **Script DRY RUN eseguito con successo**
- [ ] **Output verificato (32 utenti identificati)**
- [ ] **DRY_RUN cambiato a false**
- [ ] **Confermata l'eliminazione**
- [ ] **32 utenti eliminati**
- [ ] **Firestore verificato (solo 34 users rimasti)**
- [ ] **App ricaricata e verificata**
- [ ] **Console pulita (no warnings)**
- [ ] **Modifiche committate**
- [ ] **Documentazione aggiornata**

---

## 📚 File Correlati

- ✅ `cleanup-unknown-users.cjs` - Script Node.js
- ✅ `cleanup-unknown-users-browser.js` - Script Browser
- ✅ `CLEANUP_UNKNOWN_USERS.md` - Questa documentazione
- ✅ `CLUB_USERS_UNDEFINED_USERID_FIX.md` - Fix originale
- ✅ `src/contexts/ClubContext.jsx` - Fix nel codice

---

## 🆘 Supporto

Se incontri problemi:

1. **Non procedere** con l'eliminazione
2. Esegui solo in **DRY RUN mode**
3. Controlla l'output per errori
4. Verifica le permission Firestore
5. Consulta il troubleshooting sopra

---

**Buona pulizia! 🗑️**
