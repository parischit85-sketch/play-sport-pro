# 🗄️ Database Cleanup Scripts

Scripts per analizzare e pulire il database Firestore del progetto Play Sport Pro.

## 📋 Prerequisiti

1. **Service Account Key**
   ```bash
   # Scarica la chiave dal Firebase Console
   # Project Settings → Service Accounts → Generate New Private Key
   # Salva come: scripts/serviceAccount.json
   ```

2. **Node.js 18+**
   ```bash
   node --version  # Deve essere >= 18
   ```

3. **Dipendenze**
   ```bash
   cd scripts/database-cleanup
   npm install firebase-admin
   ```

## 🔍 Script Disponibili

### 1. Analisi Collezioni (READ-ONLY)
```bash
node 1-analyze-collections.js
```

**Cosa fa:**
- ✅ Analizza tutte le collezioni root
- ✅ Analizza subcollections per ogni club
- ✅ Identifica duplicazioni
- ✅ Genera report JSON

**Output:**
- Console report dettagliato
- File `firestore-analysis-TIMESTAMP.json`

**Sicurezza:** ✅ SAFE - Solo lettura

---

### 2. Migrazione Bookings (WRITE)
```bash
# Dry run (simula senza modificare)
node 2-migrate-bookings.js --dry-run

# Migrazione effettiva
node 2-migrate-bookings.js

# Migrazione + eliminazione bookings root
node 2-migrate-bookings.js --delete-after
```

**Cosa fa:**
- Legge bookings da `/bookings/` (root)
- Verifica `clubId` per ogni booking
- Copia in `clubs/{clubId}/bookings/`
- (Opzionale) Elimina da root dopo verifica

**Flags:**
- `--dry-run`: Simula senza modificare
- `--delete-after`: Elimina bookings da root dopo migrazione

**Sicurezza:** ⚠️ WRITE - Modifica database

---

### 3. Cleanup Collezioni Obsolete (WRITE)
```bash
node 3-cleanup-obsolete.js
```

**Cosa fa:**
- Elimina collezione `leagues/` (legacy)
- Elimina collezione `club_affiliations/` (duplicato)
- Elimina collezione `userClubRoles/` (obsoleto)

**Sicurezza:** ⚠️ WRITE - Modifica database  
**Richiede:** Conferma interattiva per ogni collezione

---

## 📝 Workflow Raccomandato

### Step 1: Backup Database
```bash
# Esegui backup completo prima di qualsiasi modifica
firebase firestore:export gs://your-bucket/backups/$(date +%Y%m%d)
```

### Step 2: Analisi
```bash
# Esegui analisi per capire stato corrente
node 1-analyze-collections.js

# Leggi il report
cat firestore-analysis-*.json | jq
```

### Step 3: Test su Staging
```bash
# Cambia il service account per puntare a staging
# Poi esegui:
node 2-migrate-bookings.js --dry-run
```

### Step 4: Migrazione Produzione
```bash
# Migrazione bookings (senza eliminazione)
node 2-migrate-bookings.js

# Verifica che tutto funzioni nell'app

# Se OK, elimina bookings root
node 2-migrate-bookings.js --delete-after
```

### Step 5: Cleanup Collezioni Obsolete
```bash
# Elimina collezioni non più utilizzate
node 3-cleanup-obsolete.js
```

### Step 6: Verifica Finale
```bash
# Re-analizza database per verificare pulizia
node 1-analyze-collections.js
```

---

## ⚠️ Attenzioni Importanti

### 🔴 PRIMA DI ESEGUIRE SU PRODUZIONE:

1. **Backup Completo**
   - Esegui backup Firestore completo
   - Mantieni backup per almeno 30 giorni

2. **Test su Staging**
   - Testa TUTTI gli script su database di test
   - Verifica funzionalità app dopo ogni step

3. **Monitoring**
   - Monitora errori durante esecuzione
   - Alert per anomalie database

4. **Piano Rollback**
   - Avere procedura di rollback documentata
   - Testare rollback su staging

### 🟡 Durante l'Esecuzione:

1. **Progressivo**
   - Esegui uno script alla volta
   - Verifica risultati prima di procedere

2. **Logging**
   - Salva output console
   - Conserva file report JSON

3. **Verifiche**
   - Testa app dopo ogni migrazione
   - Verifica query critiche

### 🟢 Dopo l'Esecuzione:

1. **Verifica Funzionalità**
   - Test completo flussi app
   - Verifica statistiche e classifiche

2. **Performance**
   - Monitora performance query
   - Verifica costi Firestore

3. **Documentazione**
   - Aggiorna documenti architettura
   - Documenta modifiche effettuate

---

## 🎯 Risultato Atteso

Dopo il cleanup completo:

```
✅ Database struttura pulita:
   ├── users/
   ├── clubs/
   │   └── {clubId}/
   │       ├── courts/
   │       ├── bookings/      ← Tutti qui, niente in root
   │       ├── players/
   │       ├── matches/
   │       ├── tournaments/
   │       ├── lessons/
   │       ├── instructors/
   │       ├── settings/config
   │       └── statsCache/
   ├── affiliations/          ← Unica collezione affiliazioni
   └── profiles/              ← Da migrare a users/

❌ Collezioni eliminate:
   ❌ bookings/ (root)
   ❌ leagues/
   ❌ club_affiliations/
   ❌ userClubRoles/
```

---

## 🆘 Troubleshooting

### Errore: "Cannot find module 'firebase-admin'"
```bash
cd scripts/database-cleanup
npm install firebase-admin
```

### Errore: "serviceAccount.json not found"
```bash
# Scarica chiave da Firebase Console
# Salva in: scripts/serviceAccount.json
```

### Errore: "Permission denied"
```bash
# Verifica che il service account abbia ruolo:
# - Firebase Admin SDK Administrator Service Agent
# - Cloud Datastore Owner
```

### Migrazione bookings fallita
```bash
# Verifica clubId presente in tutti i bookings
node 1-analyze-collections.js

# Controlla output per bookings senza clubId
# Aggiungi clubId manualmente se necessario
```

---

## 📞 Supporto

Per problemi o domande:
1. Controlla log di esecuzione
2. Verifica report JSON generato
3. Consulta `FIRESTORE_CLEANUP_ANALYSIS.md`

---

**⚠️ IMPORTANTE:**  
Questi script modificano il database. Eseguire SEMPRE backup prima di procedere.
