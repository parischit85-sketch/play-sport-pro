# 🎯 QUICK START - Database Cleanup

## Setup Rapido (5 minuti)

### 1. Scarica Service Account Key
```bash
# Vai su Firebase Console
# https://console.firebase.google.com/project/YOUR_PROJECT/settings/serviceaccounts
# 
# Clicca "Generate New Private Key"
# Salva il file come: scripts/serviceAccount.json
```

### 2. Installa Dipendenze
```bash
cd scripts/database-cleanup
npm install
```

### 3. Analizza Database
```bash
npm run analyze
```

Questo genera un report dettagliato dello stato corrente del database.

---

## 🚀 Workflow Completo

### Step 1: Backup (OBBLIGATORIO)
```bash
# Da root del progetto
firebase login
firebase use your-project-id
firebase firestore:export gs://your-bucket/backups/pre-cleanup-$(date +%Y%m%d)
```

### Step 2: Analizza
```bash
cd scripts/database-cleanup
npm run analyze
```

Output:
- Console: Report dettagliato
- File: `firestore-analysis-TIMESTAMP.json`

### Step 3: Test Migrazione (Dry Run)
```bash
npm run migrate:bookings:dry
```

Simula la migrazione senza modificare nulla.

### Step 4: Migrazione Effettiva
```bash
# Migra bookings da root a club subcollections
npm run migrate:bookings
```

### Step 5: Verifica App
- Testa la funzionalità booking
- Verifica che tutto funzioni correttamente

### Step 6: Cleanup Finale
```bash
# Elimina collezioni obsolete
npm run cleanup
```

Ti chiederà conferma per ogni collezione.

---

## 📋 Script Disponibili

```bash
npm run analyze                  # Analizza database (read-only)
npm run migrate:bookings:dry     # Test migrazione bookings
npm run migrate:bookings         # Migra bookings
npm run migrate:bookings:delete  # Migra + elimina root bookings
npm run cleanup                  # Pulisci collezioni obsolete
npm run cleanup:force            # Cleanup senza conferme (PERICOLOSO!)
```

---

## ⚠️ Checklist di Sicurezza

Prima di eseguire su PRODUZIONE:

- [ ] ✅ Backup database completo
- [ ] ✅ Script testati su staging/dev
- [ ] ✅ Team notificato
- [ ] ✅ Piano rollback pronto
- [ ] ✅ Monitoring attivo

---

## 🆘 Problemi Comuni

### "Cannot find serviceAccount.json"
```bash
# Scarica da Firebase Console
# Salva in: scripts/serviceAccount.json
```

### "Permission denied"
```bash
# Verifica ruoli service account:
# - Firebase Admin SDK Administrator Service Agent
# - Cloud Datastore Owner
```

### "Module not found"
```bash
cd scripts/database-cleanup
npm install
```

---

## 📞 Supporto

Problemi? Controlla:
1. `README.md` - Documentazione completa
2. `FIRESTORE_CLEANUP_ANALYSIS.md` - Analisi dettagliata
3. Log degli script

---

**⚠️ IMPORTANTE:**  
Esegui SEMPRE backup prima di modificare il database!
