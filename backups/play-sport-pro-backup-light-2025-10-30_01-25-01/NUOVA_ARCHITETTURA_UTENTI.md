# 🎯 NUOVA ARCHITETTURA UTENTI - PIANO MIGRAZIONE

## Data: 6 Ottobre 2025

## 📋 OBIETTIVO

Eliminare il sistema di **affiliations/** e implementare un sistema più semplice:

1. **Account PlaSport** → `users/` (ROOT) - Utenti registrati sulla piattaforma
2. **Profili Club** → `clubs/{clubId}/users/` - Utenti del club (possono linkare account PlaSport)
3. **NO PIÙ** `affiliations/` collection

---

## 🏗️ ARCHITETTURA TARGET

### 1️⃣ ROOT: users/ (Account Piattaforma PlaSport)
```
users/
  ├── user_abc123
  │   ├── email: "mario@example.com"
  │   ├── displayName: "Mario Rossi"
  │   ├── phone: "+39 123 456 7890"
  │   ├── createdAt: timestamp
  │   └── (dati account piattaforma)
  │
  └── user_xyz789
      └── ...
```

**Scopo**: Account centralizzato sulla piattaforma PlaSport

---

### 2️⃣ SUBCOLLECTION: clubs/{clubId}/users/ (Profili Utenti Club)
```
clubs/sporting-cat/users/
  ├── clubUser_001
  │   ├── firstName: "Mario"
  │   ├── lastName: "Rossi"
  │   ├── email: "mario@club.com"
  │   ├── phone: "+39 123 456 7890"
  │   ├── linkedUserId: "user_abc123" ✅ LINK A ACCOUNT PLAYSPORT
  │   ├── role: "member" | "instructor" | "admin"
  │   ├── status: "active" | "inactive"
  │   ├── rating: 4.5
  │   ├── createdAt: timestamp
  │   └── (dati specifici club)
  │
  ├── clubUser_002
  │   ├── firstName: "Luigi"
  │   ├── lastName: "Verdi"
  │   ├── email: "luigi@club.com"
  │   ├── linkedUserId: null ❌ NESSUN LINK (solo utente club)
  │   ├── role: "member"
  │   └── ...
  │
  └── clubUser_003
      ├── firstName: "Giovanni"
      ├── linkedUserId: "user_xyz789" ✅ LINK A ACCOUNT PLAYSPORT
      └── ...
```

**Scopo**: 
- Profilo utente specifico del club
- **linkedUserId** → Collega al account PlaSport (opzionale)
- Un account PlaSport può essere linkato a profili di più club

---

## 🔄 VANTAGGI

### ✅ Pro
1. **Semplicità**: NO più affiliations/ collection
2. **Flessibilità**: Utenti club possono esistere senza account PlaSport
3. **Multi-Club**: Un account PlaSport può linkare a profili di più club
4. **Autonomia Club**: Ogni club gestisce i propri utenti
5. **Meno Query**: Meno collection da interrogare

### ❌ Contro (risolti)
1. ~~Nessun sistema unificato affiliazioni~~ → linkedUserId lo sostituisce
2. ~~Come gestire richieste affiliazione?~~ → Workflow da club-users/

---

## 📊 STATO ATTUALE vs TARGET

### ATTUALE (DA RIMUOVERE)
```
affiliations/ (ROOT)
  ├── affiliation_001
  │   ├── userId: "user_abc123"
  │   ├── clubId: "sporting-cat"
  │   ├── role: "member"
  │   ├── status: "approved" | "pending" | "rejected"
  │   └── permissions: [...]
```

### TARGET (NUOVO)
```
clubs/sporting-cat/users/
  ├── clubUser_001
  │   ├── linkedUserId: "user_abc123" ✅ Sostituisce affiliation
  │   ├── role: "member"
  │   ├── status: "active"
  │   └── ...
```

---

## 🛠️ PIANO DI MIGRAZIONE

### FASE 1: Analisi
- ✅ Leggere tutte le affiliations/ esistenti (33 docs root + 35 subcollection)
- ✅ Verificare utilizzo in codebase (100+ matches)
- ✅ Identificare file che usano affiliations

### FASE 2: Migrazione Dati
1. **Script di migrazione**: `9-migrate-affiliations-to-club-users.js`
   - Legge tutte le `affiliations/` dove status='approved'
   - Per ogni affiliation:
     ```javascript
     const clubUser = {
       linkedUserId: affiliation.userId,
       role: affiliation.role,
       status: 'active',
       // Copia altri dati dal profile esistente
     }
     // Aggiunge linkedUserId al clubs/{clubId}/users/ esistente
     // O crea nuovo se non esiste
     ```

2. **Backup**: Esporta tutte le affiliations prima di eliminare

### FASE 3: Modifica Codice
File da modificare (priorità alta):

1. **src/services/affiliations.js** → **DEPRECARE/ELIMINARE**
   - Spostare logiche in `club-users.js`

2. **src/contexts/AuthContext.jsx** (già parzialmente migrato)
   - ✅ Usa già `getUserClubMemberships` da `club-users.js`
   - Rimuovere riferimenti a affiliations

3. **src/services/admin.js**
   - Funzioni `getPendingAffiliations`, `getAllAffiliations`
   - Rimpiazzare con query a `clubs/{clubId}/users/` con status filters

4. **src/pages/admin/UsersManagement.jsx**
   - Query affiliations → Query club users con linkedUserId

5. **src/pages/Bootstrap.jsx**
   - Rimuovere creazione affiliation
   - Creare direttamente club user

### FASE 4: Testing
- ✅ Verifica che login funzioni
- ✅ Verifica che club memberships siano caricate
- ✅ Verifica che ruoli funzionino (admin, instructor, member)
- ✅ Test creazione nuovo utente
- ✅ Test linking account esistente

### FASE 5: Cleanup
- Eliminare `affiliations/` root (33 docs)
- Eliminare `clubs/{clubId}/affiliations/` (35 docs)
- Eliminare `src/services/affiliations.js`
- Rimuovere import affiliations da tutti i file

---

## 🔍 FILE IMPATTATI (da grep)

### Alto Impatto (modifiche necessarie)
1. ✅ `src/services/affiliations.js` - **ELIMINARE**
2. ✅ `src/contexts/AuthContext.jsx` - **Già migrato parzialmente**
3. ✅ `src/services/admin.js` - **getPendingAffiliations, getAllAffiliations**
4. ✅ `src/pages/admin/UsersManagement.jsx` - **Query affiliations**
5. ✅ `src/pages/Bootstrap.jsx` - **Crea affiliation**

### Medio Impatto
6. `src/pages/DashboardPage.jsx` - Usa `userAffiliations` da context
7. `src/utils/debugClubAdmin.js` - Debug affiliations
8. `src/router/AppRouter.jsx` - Route già commentata

### Basso Impatto (mock data)
9. `src/services/admin.js` - Mock pending affiliations

---

## 📝 STRUTTURA DATI CLUBS/{clubId}/users/

### Schema Completo
```javascript
{
  // Dati base utente club
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  
  // Link a account PlaSport (OPZIONALE)
  linkedUserId: string | null,  // ← NUOVO CAMPO
  
  // Ruolo nel club
  role: 'member' | 'instructor' | 'admin',
  status: 'active' | 'inactive' | 'pending' | 'suspended',
  
  // Dati specifici club
  rating: number,
  level: string,
  preferredCourt: string,
  notes: string,
  
  // Metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: string,
}
```

---

## 🎯 WORKFLOW NUOVO UTENTE

### Scenario A: Utente si registra su PlaSport
1. Crea account → `users/{userId}`
2. Accede a un club
3. Club crea profilo → `clubs/{clubId}/users/{clubUserId}` con `linkedUserId`

### Scenario B: Club aggiunge utente senza account PlaSport
1. Club crea profilo → `clubs/{clubId}/users/{clubUserId}` con `linkedUserId: null`
2. Utente può registrarsi dopo
3. Club linka account → Aggiorna `linkedUserId`

### Scenario C: Utente PlaSport si linka a club esistente
1. Utente ha già account → `users/{userId}`
2. Utente trova club su PlaSport
3. Richiede accesso → Crea `clubs/{clubId}/users/` con status='pending'
4. Club approva → Aggiorna status='active'

---

## ✅ PROSSIMI STEP

1. **Confermare architettura** con te
2. **Creare script migrazione** affiliations → club users
3. **Modificare AuthContext** per usare solo club-users
4. **Modificare admin services** 
5. **Testing completo**
6. **Eliminare affiliations/**

---

## 📌 NOTE IMPORTANTI

- **linkedUserId** è OPZIONALE → Permette utenti club senza account
- Un account PlaSport può avere **linkedUserId** in più club
- **status** in club users sostituisce **status** in affiliations
- **role** resta uguale: member, instructor, admin
- NO breaking changes per utenti esistenti (migrazione automatica)

---

## 🔒 SICUREZZA FIRESTORE RULES

```javascript
// users/ (ROOT)
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId;
}

// clubs/{clubId}/users/
match /clubs/{clubId}/users/{clubUserId} {
  // Club users possono leggere altri membri club
  allow read: if isClubMember(clubId);
  
  // Solo admin club possono creare/modificare
  allow create, update: if isClubAdmin(clubId);
  
  // Solo admin possono eliminare
  allow delete: if isClubAdmin(clubId);
}

function isClubMember(clubId) {
  return exists(/databases/$(database)/documents/clubs/$(clubId)/users/$(request.auth.uid));
}

function isClubAdmin(clubId) {
  let clubUser = get(/databases/$(database)/documents/clubs/$(clubId)/users/$(request.auth.uid));
  return clubUser.data.role == 'admin' && clubUser.data.status == 'active';
}
```

---

**Creato**: 6 Ottobre 2025  
**Autore**: GitHub Copilot  
**Status**: 📋 PIANO DA APPROVARE
