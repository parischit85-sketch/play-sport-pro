# 🚀 Guida alla Migrazione del Database Prenotazioni

## 📋 Panoramica

Questo script migra tutte le prenotazioni verso una struttura ottimizzata con una singola collection globale `bookings`.

## 🎯 Obiettivi

1. ✅ Consolidare tutte le prenotazioni in `bookings` (collection globale)
2. ✅ Correggere `bookedBy` da nomi → UID
3. ✅ Rimuovere sub-collections legacy dai club
4. ✅ Validare la struttura dati
5. ✅ Applicare gli indici Firestore ottimizzati

## 📊 Struttura Finale

```javascript
bookings/
  {bookingId}/
    // IDENTIFICATORI
    id: string
    clubId: string              // Riconduce al circolo
    bookedBy: string            // UID dell'utente
    userEmail: string           // Email per backup
    
    // CAMPO
    courtId: string
    courtName: string
    date: "YYYY-MM-DD"
    time: "HH:MM"
    duration: number
    
    // TIPO
    type: "lesson" | "match"
    isLessonBooking: boolean
    
    // LEZIONE (opzionale)
    instructorId: string        // Riconduce al maestro
    instructorName: string
    lessonType: "individual" | "group"
    
    // STATO
    status: "confirmed" | "cancelled" | "completed"
    
    // PARTECIPANTI
    participants: string[]      // Array di UID
    players: string[]          // Array di nomi
    
    // COSTI
    price: number
    
    // METADATA
    createdAt: timestamp
    updatedAt: timestamp
    createdBy: string
```

## 🔧 Prerequisiti

1. **Node.js** installato
2. **serviceAccountKey.json** nella root del progetto
3. **Backup del database** (raccomandato!)

```bash
# Crea un backup prima di procedere
firebase firestore:export gs://your-bucket/backups/pre-migration
```

## 📝 Step 1: Esegui lo Script di Migrazione

```bash
# Dalla root del progetto
node migrate-bookings.cjs
```

Lo script eseguirà:
1. 📊 Analisi dello stato attuale
2. 🔄 Migrazione prenotazioni legacy dai club
3. 🔧 Normalizzazione prenotazioni esistenti
4. ✅ Validazione risultati
5. 📄 Generazione report

### Output Atteso

```
🚀 AVVIO MIGRAZIONE DATABASE PRENOTAZIONI
============================================================

📊 STEP 1: Analisi stato attuale

✅ Collection globale 'bookings': 53 documenti

📋 Struttura esempio: {
  hasClubId: true,
  hasBookedBy: true,
  bookedByFormat: 'Nome',    // ← Questo verrà corretto
  hasInstructorId: true,
  hasDate: true,
  hasStatus: true
}

🔍 Club "sporting-cat": 2 prenotazioni legacy

⚠️  Trovate 2 prenotazioni legacy nelle sub-collections dei club

⚠️  Questa operazione modificherà il database!
Premi CTRL+C per annullare o attendi 5 secondi...

🔄 STEP 2: Migrazione prenotazioni legacy

📦 Migrando 2 prenotazioni da "Sporting Cat"...
   🔄 Converting bookedBy: "Giacomo Paris" → UID
   ✅ Migrata: xyz123
   ✅ Migrata: abc456

📊 Risultati migrazione legacy:
   ✅ Migrate: 2
   ⏭️  Skipped: 0

🔧 STEP 3: Normalizzazione prenotazioni esistenti

   🔄 Aggiornando doc123: "Giacomo Paris"
   💾 Batch commit (51 aggiornamenti)

📊 Risultati normalizzazione:
   ✅ Aggiornate: 51
   ❌ Errori: 0

✅ STEP 4: Validazione risultati

📊 Validazione completata:
   ✅ Valide: 55
   ❌ Invalide: 0

📄 STEP 5: Report finale

============================================================
📊 MIGRAZIONE COMPLETATA
============================================================

✅ Prenotazioni migrate: 2
🔧 Prenotazioni normalizzate: 51
✅ Prenotazioni valide: 55
❌ Prenotazioni con problemi: 0

📄 Report salvato in: migration-report.json

Migrazione completata con successo!
```

## 📝 Step 2: Applica gli Indici Firestore

```bash
# Deploy degli indici (richiede Firebase CLI)
firebase deploy --only firestore:indexes

# Oppure vai alla console Firebase
# https://console.firebase.google.com/project/YOUR_PROJECT/firestore/indexes
```

Gli indici necessari sono già configurati in `firestore.indexes.json` e includono:

- ✅ `bookedBy + status + date` - Per dashboard utente
- ✅ `clubId + bookedBy + status` - Per club dashboard
- ✅ `clubId + date + status` - Per admin club
- ✅ `instructorId + type + date` - Per dashboard maestri
- ✅ E molti altri...

## 📝 Step 3: Verifica i Risultati

### Console Firebase
Vai su: https://console.firebase.google.com/project/YOUR_PROJECT/firestore/data/bookings

Verifica che:
- ✅ Tutti i documenti hanno `bookedBy` con UID (20+ caratteri alfanumerici)
- ✅ Tutti i documenti hanno `clubId`
- ✅ Documenti con `instructorId` hanno `type: 'lesson'`
- ✅ Campo `_migratedAt` presente

### Nell'App
1. Vai alla dashboard generale → Dovresti vedere TUTTE le tue prenotazioni
2. Entra in un club → Dovresti vedere SOLO le prenotazioni di quel club
3. Le card mostrano i dettagli corretti

## 🔍 Troubleshooting

### Problema: "User not found" durante la migrazione

**Causa**: Un nome in `bookedBy` non corrisponde a nessun utente nel database.

**Soluzione**: 
```javascript
// Aggiungi manualmente la mappatura in migrate-bookings.cjs
// Dopo la riga 28, aggiungi:
userCache.set('Nome Cognome', 'UID_CORRETTO');
```

### Problema: "Missing clubId"

**Causa**: Prenotazione senza riferimento al club.

**Soluzione**: Lo script usa il club di origine come fallback. Verifica manualmente.

### Problema: Indici Firestore non si creano

**Causa**: Errori di sintassi o indici duplicati.

**Soluzione**:
```bash
# Verifica il file
firebase firestore:indexes --project=YOUR_PROJECT

# Forza il deploy
firebase deploy --only firestore:indexes --force
```

## 📊 Report Finale

Lo script genera `migration-report.json` con:

```json
{
  "timestamp": "2025-10-01T14:30:00.000Z",
  "migration": {
    "legacyMigrated": 2,
    "existingNormalized": 51,
    "totalProcessed": 53
  },
  "validation": {
    "valid": 55,
    "invalid": 0,
    "issues": []
  },
  "summary": {
    "status": "SUCCESS",
    "message": "Migrazione completata con successo!"
  }
}
```

## 🔙 Rollback (se necessario)

Se qualcosa va storto:

```bash
# Ripristina dal backup
firebase firestore:import gs://your-bucket/backups/pre-migration

# Oppure elimina i documenti migrati
# (hanno il campo _migratedAt)
```

## ✅ Checklist Post-Migrazione

- [ ] Tutti i `bookedBy` sono UID
- [ ] Dashboard generale mostra tutte le prenotazioni utente
- [ ] Club dashboard mostra solo prenotazioni del club
- [ ] Maestri vedono le loro lezioni
- [ ] Nessun errore nei log della console
- [ ] Performance delle query migliorata
- [ ] Indici Firestore attivi (status: Building → Enabled)

## 🚀 Vantaggi della Nuova Struttura

✅ **Performance**: Query più veloci con indici ottimizzati
✅ **Scalabilità**: Funziona con migliaia di utenti/club
✅ **Manutenzione**: Un solo posto da aggiornare
✅ **Consistenza**: Nessuna duplicazione di dati
✅ **Flessibilità**: Facile aggiungere nuove query

## 📞 Supporto

In caso di problemi:
1. Controlla `migration-report.json`
2. Verifica i log dello script
3. Controlla la console Firebase
4. Ripristina dal backup se necessario

---

**Importante**: Esegui SEMPRE un backup prima della migrazione!