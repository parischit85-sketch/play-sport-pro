# 🗄️ ANALISI PULIZIA DATABASE FIRESTORE
**Data:** 6 Ottobre 2025  
**Progetto:** Play Sport Pro v1.0.3

---

## 📊 COLLEZIONI FIRESTORE ANALIZZATE

### 🟢 COLLEZIONI ATTIVE (IN USO)

#### 1. `clubs/{clubId}` ✅ PRINCIPALE
**Usato da:**
- `src/services/clubs.js` - CRUD clubs
- `src/services/admin.js` - Admin management
- `src/services/affiliations.js` - Check club existence
- `src/contexts/ClubContext.jsx` - Club data loading

**Subcollections:**
```
clubs/{clubId}/
├── courts/          ✅ ATTIVO - Court management
├── bookings/        ⚠️ MISTO - Vedi sezione duplicati
├── players/         ✅ ATTIVO - Player profiles
├── matches/         ✅ ATTIVO - Match results
├── tournaments/     ✅ ATTIVO - Tournament data
├── lessons/         ✅ ATTIVO - Lesson bookings
├── instructors/     ✅ ATTIVO - Instructor data
├── settings/        ✅ ATTIVO - Club settings
│   └── config       ✅ bookingConfig, lessonConfig
├── statsCache/      ✅ ATTIVO - Cached statistics
└── users/           ⚠️ NUOVO - Vedi sezione migrazione
```

**Status:** ✅ MANTIENI - Struttura principale multi-club

---

#### 2. `affiliations/{affiliationId}` ✅ PRINCIPALE
**Pattern ID:** `{userId}_{clubId}`

**Usato da:**
- `src/services/affiliations.js` - Sistema affiliazioni completo
- `src/services/clubs.js` - getUserClubRoles()
- `src/contexts/AuthContext.jsx` - Load user memberships

**Schema:**
```javascript
{
  userId: "uid",
  clubId: "club-id",
  role: "member" | "instructor" | "admin",
  status: "pending" | "approved" | "rejected" | "suspended",
  requestedAt: Timestamp,
  decidedAt: Timestamp,
  decidedBy: "adminId",
  permissions: {}
}
```

**Status:** ✅ MANTIENI - Collezione root normalizzata (corretto)

---

#### 3. `profiles/{userId}` ⚠️ IN MIGRAZIONE
**Usato da:**
- `src/services/auth.jsx` - getUserProfile()
- `src/services/admin.js` - User listing
- Legacy authentication flow

**Stato:** ⚠️ DA MIGRARE → `users/{userId}`

**Schema attuale:**
```javascript
{
  email, displayName,
  firstName, lastName,
  phone, dateOfBirth,
  preferences: {},
  role: "user" | "admin",
  createdAt, updatedAt
}
```

**Status:** ⚠️ DA DEPRECARE dopo migrazione a `users/`

---

#### 4. `users/{userId}` 🆕 NUOVO SCHEMA
**Usato da:**
- `src/services/club-users.js` - New user service
- `src/services/affiliations.js` - User lookup

**Schema previsto:**
```javascript
{
  email, displayName,
  firstName, lastName,
  phone, dateOfBirth, gender,
  preferences: {
    language, timezone, notifications, theme
  },
  globalRole: "user" | "super_admin",
  isActive: true,
  createdAt, updatedAt, lastLoginAt
}
```

**Status:** 🆕 IMPLEMENTARE - Schema futuro unificato

---

### 🔴 COLLEZIONI DUPLICATE/OBSOLETE

#### 5. `bookings/` (ROOT) ❌ DUPLICATO
**Path:** `/bookings/{bookingId}`

**Problema:** DUPLICAZIONE con `clubs/{clubId}/bookings/`

**Usato da:**
- `src/services/cloud-bookings.js` - Root-level bookings
- `src/services/club-matches.js` - Delete booking reference

**Codice problematico:**
```javascript
// cloud-bookings.js line 25
function getBookingsCollection(clubId) {
  return collection(db, 'bookings'); // ❌ ROOT invece di club subcollection
}

// club-matches.js line 46
const bookingRef = doc(db, 'bookings', matchId); // ❌ ROOT
```

**Analisi:**
- ❌ Dovrebbe essere `clubs/{clubId}/bookings/`
- ❌ Viola architettura multi-club
- ❌ Crea inconsistenza dati

**AZIONE:** 
1. Migrare dati da `/bookings/` → `clubs/{clubId}/bookings/`
2. Aggiornare `cloud-bookings.js` per usare subcollection
3. Eliminare collezione root `/bookings/`

---

#### 6. `leagues/{leagueId}` ❌ OBSOLETO
**Usato da:**
- `src/services/cloud.js` - Legacy league system

**Problema:** ARCHITETTURA OBSOLETA - Pre multi-club

**Codice:**
```javascript
// cloud.js - LEGACY
async function loadLeague(leagueId) {
  const snap = await getDoc(doc(db, 'leagues', leagueId));
  // ...
}
```

**Stato:** ❌ LEGACY - Sistema leagues deprecato

**AZIONE:**
1. Verificare se `cloud.js` è ancora utilizzato
2. Se NO → Eliminare `leagues/` collection
3. Se SÌ → Migrare logica a multi-club

---

#### 7. `club_affiliations/{affiliationId}` ❌ DUPLICATO
**Usato da:**
- `src/services/admin.js` - Admin affiliations management

**Problema:** DUPLICAZIONE con `affiliations/` (root)

**Codice:**
```javascript
// admin.js line 140
const affiliationsRef = collection(db, 'club_affiliations'); // ❌ DUPLICATO

// Dovrebbe essere:
const affiliationsRef = collection(db, 'affiliations'); // ✅ CORRETTO
```

**AZIONE:**
1. Aggiornare `admin.js` per usare `affiliations/`
2. Migrare dati da `club_affiliations/` → `affiliations/`
3. Eliminare `club_affiliations/`

---

#### 8. `clubs/{clubId}/profiles/{userId}` ❌ OBSOLETO
**Usato da:**
- `src/services/auth.jsx` (legacy)
- `src/services/admin.js` (legacy)
- `src/services/affiliations.js` (migration helper)

**Problema:** DOPPIO SISTEMA PROFILI (club-specific vs global)

**Codice:**
```javascript
// auth.jsx line 548
const ref = collection(db, 'clubs', MAIN_CLUB_ID, 'profiles'); // ❌ LEGACY

// admin.js line 132
const usersRef = collection(db, 'clubs', MAIN_CLUB_ID, 'profiles'); // ❌ LEGACY
```

**AZIONE:**
1. Migrare profili club-specific → `users/` (global)
2. Aggiornare tutti i riferimenti a `profiles/` (root)
3. Eliminare `clubs/{clubId}/profiles/` subcollection

---

#### 9. `userClubRoles/{userId}` ⚠️ SOSTITUITO
**Usato da:**
- `src/services/clubs.js` - getUserClubRoles() (vecchio)
- Bootstrap pages (setup iniziale)

**Problema:** SOSTITUITO da `affiliations/` con campo `role`

**Schema obsoleto:**
```javascript
// userClubRoles/{userId}
{
  userId: "uid",
  roles: {
    "club1": "admin",
    "club2": "instructor"
  }
}
```

**Schema nuovo (affiliations):**
```javascript
// affiliations/{userId_clubId}
{
  userId: "uid",
  clubId: "club1",
  role: "admin", // ✅ Più normalizzato
  status: "approved"
}
```

**Stato attuale:**
- `clubs.js` usa ENTRAMBI i sistemi (fallback)
- Confusione architetturale

**AZIONE:**
1. Completare migrazione a `affiliations/`
2. Rimuovere fallback a `userClubRoles/`
3. Eliminare `userClubRoles/` collection

---

### 🟡 COLLEZIONI AMBIGUE

#### 10. `clubs/{clubId}/users/{userId}` 🤔 NUOVO?
**Usato da:**
- `src/services/club-users.js` - addUserToClub(), getUsersInClub()

**Problema:** SOVRAPPOSIZIONE con `affiliations/`?

**Analisi:**
```javascript
// club-users.js crea documenti in:
// 1. clubs/{clubId}/users/{userId}  ← Subcollection
// 2. affiliations/{userId_clubId}   ← Root collection

// Sono la stessa cosa duplicata?
```

**Domanda:** Serve ENTRAMBI?
- `affiliations/` = Membership status
- `clubs/{clubId}/users/` = User data nel club?

**AZIONE:** ⚠️ CHIARIRE - Decidere quale mantenere o merge

---

## 📋 PIANO DI PULIZIA DATABASE

### PRIORITÀ 1 - CRITICI (Duplicazioni)

#### 🔴 Task 1.1: Eliminare `/bookings/` root duplicato
```
1. Verificare tutti i booking sono in clubs/{clubId}/bookings/
2. Migrare eventuali booking orfani
3. Aggiornare cloud-bookings.js:
   - getBookingsCollection() → clubs subcollection
4. Testare funzionalità booking
5. Eliminare collezione /bookings/
```

**Impatto:** MEDIO - Richiede update codice  
**Rischio:** BASSO - Se migrazione corretta

---

#### 🔴 Task 1.2: Consolidare `club_affiliations/` → `affiliations/`
```
1. Verificare dati in entrambe le collezioni
2. Migrare da club_affiliations/ → affiliations/
3. Aggiornare admin.js per usare affiliations/
4. Testare admin panel
5. Eliminare club_affiliations/
```

**Impatto:** BASSO - Solo admin.js  
**Rischio:** BASSO - Logica semplice

---

#### 🔴 Task 1.3: Deprecare `userClubRoles/`
```
1. Verificare tutti i ruoli sono in affiliations/
2. Creare script migrazione ruoli mancanti
3. Rimuovere fallback in clubs.js getUserClubRoles()
4. Testare sistema permessi
5. Eliminare userClubRoles/ dopo 30 giorni
```

**Impatto:** MEDIO - Tocca auth flow  
**Rischio:** MEDIO - Test approfonditi necessari

---

### PRIORITÀ 2 - MIGRAZIONE PROFILI

#### 🟡 Task 2.1: Migrare `profiles/` → `users/`
```
1. Creare schema definitivo users/
2. Script migrazione profiles/ → users/
3. Aggiornare auth.jsx per leggere da users/
4. Aggiornare tutti i servizi
5. Deprecare profiles/ dopo verifica
```

**Impatto:** ALTO - Tocca autenticazione  
**Rischio:** ALTO - Richiede test estensivi

---

#### 🟡 Task 2.2: Eliminare `clubs/{clubId}/profiles/`
```
1. Verificare nessun codice usa questa subcollection
2. Migrare dati residui a users/ (global)
3. Update affiliations.js migration helper
4. Eliminare subcollection profiles/
```

**Impatto:** MEDIO  
**Rischio:** BASSO - Già in disuso

---

### PRIORITÀ 3 - CLEANUP LEGACY

#### 🟢 Task 3.1: Eliminare sistema `leagues/`
```
1. Verificare se cloud.js è ancora utilizzato
2. Se NO → Eliminare leagues/ collection
3. Se SÌ → Valutare migrazione logica
4. Rimuovere file cloud.js se obsoleto
```

**Impatto:** BASSO  
**Rischio:** BASSO - Sistema legacy

---

#### 🟢 Task 3.2: Chiarire `clubs/{clubId}/users/`
```
1. Analizzare uso effettivo
2. Decidere se:
   - Merge con affiliations/
   - Mantenere per dati extra club-specific
   - Eliminare se duplicato
3. Documentare decisione
```

**Impatto:** BASSO  
**Rischio:** BASSO - Funzionalità nuova

---

## 🎯 SCHEMA FINALE ATTESO

Dopo la pulizia, il database dovrebbe avere questa struttura pulita:

```
✅ users/{userId}                    # Profili utente globali
✅ clubs/{clubId}                    # Dati club
   ├── courts/                       # Campi
   ├── bookings/                     # Prenotazioni (NO ROOT!)
   ├── players/                      # Giocatori
   ├── matches/                      # Partite
   ├── tournaments/                  # Tornei
   ├── lessons/                      # Lezioni
   ├── instructors/                  # Istruttori
   ├── settings/config               # Configurazioni
   └── statsCache/                   # Cache stats
✅ affiliations/{userId_clubId}      # User ↔ Club (normalizzato)

❌ ELIMINATE:
   ❌ bookings/ (root)               # → clubs/{clubId}/bookings/
   ❌ leagues/                       # Legacy
   ❌ club_affiliations/             # → affiliations/
   ❌ userClubRoles/                 # → affiliations/ con role
   ❌ profiles/ (root)               # → users/
   ❌ clubs/{clubId}/profiles/       # → users/
```

---

## 🛠️ SCRIPT DI MIGRAZIONE

### Script 1: Analisi Collezioni Esistenti
```javascript
// scripts/analyze-firestore-collections.js
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

async function analyzeCollections() {
  const collections = await db.listCollections();
  
  console.log('📊 COLLEZIONI ROOT TROVATE:');
  for (const col of collections) {
    const count = (await col.count().get()).data().count;
    console.log(`  - ${col.id}: ${count} documenti`);
  }
  
  // Analizza subcollections per ogni club
  const clubsSnap = await db.collection('clubs').get();
  
  console.log('\n📊 SUBCOLLECTIONS PER CLUB:');
  for (const clubDoc of clubsSnap.docs) {
    console.log(`\nClub: ${clubDoc.id}`);
    const subcols = await clubDoc.ref.listCollections();
    for (const subcol of subcols) {
      const count = (await subcol.count().get()).data().count;
      console.log(`  - ${subcol.id}: ${count} documenti`);
    }
  }
}

analyzeCollections().catch(console.error);
```

---

### Script 2: Migrazione Bookings Root → Club Subcollection
```javascript
// scripts/migrate-bookings-to-clubs.js
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

async function migrateBookings() {
  // 1. Carica tutti i booking dalla root
  const rootBookingsSnap = await db.collection('bookings').get();
  
  console.log(`📦 Trovati ${rootBookingsSnap.size} bookings in root`);
  
  let migrated = 0;
  let errors = 0;
  
  for (const bookingDoc of rootBookingsSnap.docs) {
    const data = bookingDoc.data();
    
    // 2. Verifica clubId presente
    if (!data.clubId) {
      console.warn(`⚠️ Booking ${bookingDoc.id} senza clubId - SKIP`);
      errors++;
      continue;
    }
    
    try {
      // 3. Copia in clubs/{clubId}/bookings/
      const clubBookingRef = db
        .collection('clubs')
        .doc(data.clubId)
        .collection('bookings')
        .doc(bookingDoc.id);
      
      await clubBookingRef.set({
        ...data,
        migratedAt: FieldValue.serverTimestamp(),
        migratedFrom: 'root-bookings'
      });
      
      migrated++;
      
      if (migrated % 100 === 0) {
        console.log(`✅ Migrati ${migrated}/${rootBookingsSnap.size}`);
      }
      
    } catch (error) {
      console.error(`❌ Errore migrazione booking ${bookingDoc.id}:`, error);
      errors++;
    }
  }
  
  console.log(`\n📊 RISULTATI:`);
  console.log(`  ✅ Migrati: ${migrated}`);
  console.log(`  ❌ Errori: ${errors}`);
  
  // 4. Verifica migrazione
  console.log('\n🔍 VERIFICA MIGRAZIONE:');
  const clubsSnap = await db.collection('clubs').get();
  for (const clubDoc of clubsSnap.docs) {
    const bookingsCount = (
      await clubDoc.ref.collection('bookings').count().get()
    ).data().count;
    console.log(`  Club ${clubDoc.id}: ${bookingsCount} bookings`);
  }
}

migrateBookings().catch(console.error);
```

---

### Script 3: Cleanup Collezioni Obsolete
```javascript
// scripts/cleanup-obsolete-collections.js
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import readline from 'readline';

const db = getFirestore();

async function confirmDeletion(collectionName) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(
      `⚠️ ELIMINARE collezione '${collectionName}'? (yes/no): `,
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });
}

async function deleteCollection(collectionPath, batchSize = 100) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.limit(batchSize);
  
  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(db, query, resolve) {
  const snapshot = await query.get();
  
  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }
  
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

async function cleanup() {
  const collectionsToDelete = [
    'leagues',              // Legacy system
    'club_affiliations',    // Duplicato di affiliations
    'userClubRoles'         // Sostituito da affiliations
  ];
  
  console.log('🗑️ CLEANUP COLLEZIONI OBSOLETE\n');
  
  for (const collName of collectionsToDelete) {
    const count = (await db.collection(collName).count().get()).data().count;
    
    console.log(`\n📁 Collezione: ${collName}`);
    console.log(`   Documenti: ${count}`);
    
    if (count === 0) {
      console.log('   ✅ Già vuota - SKIP');
      continue;
    }
    
    const confirmed = await confirmDeletion(collName);
    
    if (confirmed) {
      console.log(`   🗑️ Eliminazione in corso...`);
      await deleteCollection(collName);
      console.log(`   ✅ Eliminata!`);
    } else {
      console.log(`   ⏭️ Skippata`);
    }
  }
  
  console.log('\n✅ CLEANUP COMPLETATO');
}

cleanup().catch(console.error);
```

---

## ⚠️ ATTENZIONI PRIMA DI PROCEDERE

### 1. BACKUP COMPLETO
```bash
# Esporta tutto il database prima di qualsiasi operazione
firebase firestore:export gs://your-bucket/backups/$(date +%Y%m%d)
```

### 2. AMBIENTE DI TEST
- Testare TUTTI gli script su database di sviluppo/staging
- NON eseguire direttamente su produzione

### 3. PIANO ROLLBACK
- Mantenere backup per almeno 30 giorni
- Avere script di rollback pronti
- Testare rollback su staging

### 4. MONITORING
- Monitorare errori durante migrazione
- Verificare funzionalità app dopo ogni step
- Alert per anomalie database

---

## 📝 CHECKLIST ESECUZIONE

### Pre-Migrazione
- [ ] Backup completo database
- [ ] Script testati su staging
- [ ] Piano rollback documentato
- [ ] Team notificato

### Esecuzione
- [ ] Script 1: Analisi collezioni
- [ ] Script 2: Migrazione bookings
- [ ] Verifica bookings migrati
- [ ] Update codice cloud-bookings.js
- [ ] Deploy codice aggiornato
- [ ] Test booking flow
- [ ] Script 3: Cleanup collezioni obsolete

### Post-Migrazione
- [ ] Verifica funzionalità app
- [ ] Monitoring errori 24h
- [ ] Performance check
- [ ] Documentazione aggiornata

---

## 🎯 RISULTATO ATTESO

Dopo il cleanup:

**Database pulito:**
- ✅ Nessuna duplicazione collezioni
- ✅ Schema chiaro e normalizzato
- ✅ Struttura multi-club coerente
- ✅ Migliore performance query
- ✅ Riduzione costi Firestore

**Codebase pulito:**
- ✅ Nessun riferimento a collezioni obsolete
- ✅ Logica di accesso dati unificata
- ✅ Facile manutenzione futura
- ✅ Onboarding developer semplificato

---

**PROSSIMI PASSI:**
1. Eseguire Script 1 (Analisi) per vedere lo stato attuale
2. Decidere ordine di esecuzione task
3. Preparare ambiente staging per test
4. Procedere con migrazione controllata

Vuoi che procediamo con lo Script 1 di analisi? 🔍
