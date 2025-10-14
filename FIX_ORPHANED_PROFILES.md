# Fix Orphaned Profiles - Giocatori Non Visibili

## Problema Identificato

Quando si crea un nuovo giocatore senza account collegato, viene creato solo un documento nella collezione `profiles`, ma **non** nella collezione `users`. Questo causa un problema perché il sistema di caricamento dei giocatori:

1. Carica tutti gli utenti da `clubs/{clubId}/users` (es. 34 utenti)
2. Carica tutti i profili da `clubs/{clubId}/profiles` (es. 44 profili)
3. Fa il merge usando **solo** gli utenti come base
4. I profili senza corrispondente entry in `users` **non vengono mostrati**

### Esempio dai Log

```
ClubContext.jsx:192 🔍 [ClubContext] Found club users: 34
ClubContext.jsx:214 ✅ Loaded club profiles: 44
ClubContext.jsx:437 Players loaded: 34 (filtered from 34)
```

Il nuovo giocatore `Antonio Rossi` (ID: `oy38JgJ9Y0SDUpbZrDX6`) è stato creato nel profilo #44 ma non appare perché manca in `users`.

## Soluzioni Implementate

### 1. Fix Prospettico (Nuovi Giocatori)

**File**: `src/contexts/ClubContext.jsx`

Quando si crea un nuovo giocatore, ora viene creato **sia** il profilo che l'entry utente:

```javascript
// Crea il profilo
const profilesRef = collection(db, 'clubs', clubId, 'profiles');
const docRef = await addDoc(profilesRef, profileData);

// 🔧 FIX: Crea anche l'entry nella collezione users
const clubUserData = {
  userId: docRef.id,
  clubId: clubId,
  userEmail: profileData.email || '',
  userName: profileData.name || '',
  userPhone: profileData.phone || '',
  role: 'player',
  status: 'active',
  addedAt: serverTimestamp(),
  addedBy: user?.uid || 'system',
  isLinked: false,
  originalProfileData: profileData,
};

const clubUsersRef = collection(db, 'clubs', clubId, 'users');
await addDoc(clubUsersRef, clubUserData);
```

### 2. Fix Retroattivo (Giocatori Esistenti)

**File**: `src/contexts/ClubContext.jsx`

Aggiunta logica di fallback per mostrare profili "orfani":

```javascript
// Identifica profili senza corrispondente user
const existingUserIds = new Set(clubUsers.map(u => u.userId || u.id));
const orphanedProfiles = Array.from(clubProfiles.entries())
  .filter(([profileId]) => !existingUserIds.has(profileId))
  .map(([profileId, profileData]) => {
    // Crea player object dal profilo orfano
    return { id: profileId, ...profileData };
  });

// Aggiunge i profili orfani alla lista
playersData = [...playersData, ...orphanedProfiles];
```

### 3. Script di Migrazione

**File**: `scripts/fix-orphaned-profiles.js`

Script Node.js per sistemare tutti i profili orfani esistenti nel database.

## Come Usare lo Script di Migrazione

### Migrare Tutti i Club

```powershell
node scripts/fix-orphaned-profiles.js
```

### Migrare un Singolo Club

```powershell
node scripts/fix-orphaned-profiles.js sporting-cat
```

### Output Atteso

```
🚀 [Fix] Starting to fix all clubs...
🏛️ [Fix] Found clubs: 3

🏢 [Fix] Processing club: Sporting Cat (sporting-cat)
🔧 [Fix] Starting to fix orphaned profiles for club: sporting-cat
📋 [Fix] Found profiles: 44
📋 [Fix] Found club users: 34
📋 [Fix] Existing user IDs: 34
🔍 [Fix] Found orphaned profiles: 10
🔧 [Fix] Creating user entry for profile: oy38JgJ9Y0SDUpbZrDX6 Antonio Rossi
✅ [Fix] Created user entry: abc123 for profile: oy38JgJ9Y0SDUpbZrDX6
...

📊 [Fix] FINAL RESULTS:
=====================================
✅ Sporting Cat: Fixed 10/10 orphaned profiles (Total: 44)
✅ Dorado Padel Center: Fixed 0/0 orphaned profiles (Total: 20)
✅ aaaaa: Fixed 5/5 orphaned profiles (Total: 15)
=====================================
```

## Test di Verifica

Dopo aver applicato il fix:

1. **Crea un nuovo giocatore** dalla UI
2. Verifica nei log della console:
   ```
   ✅ [ClubContext] New profile created: xyz123
   ✅ [ClubContext] Club user entry created: abc456
   ```
3. **Ricarica la pagina**
4. Il giocatore dovrebbe apparire immediatamente nella lista

## Struttura Database

### Prima del Fix

```
clubs/
  {clubId}/
    profiles/
      {profileId} → { name, email, rating, ... }
    users/
      ❌ MANCANTE per giocatori non collegati
```

### Dopo il Fix

```
clubs/
  {clubId}/
    profiles/
      {profileId} → { name, email, rating, ... }
    users/
      {userDocId} → { userId: profileId, userName, userEmail, ... }
```

## Note Tecniche

### Perché Due Collezioni?

- **`profiles`**: Dati completi del giocatore (rating, statistiche, certificati, wallet)
- **`users`**: Riferimento veloce per membership e permessi

### ID Mapping

- Per giocatori **con account**: `userId` = Firebase Auth UID
- Per giocatori **senza account**: `userId` = Profile Document ID

### Backward Compatibility

Il fix mantiene compatibilità con:
- Giocatori creati prima del fix (via fallback)
- Sistema legacy di solo `profiles`
- Giocatori con account collegato

## Checklist Deploy

- [ ] Fare backup del database
- [ ] Testare la creazione di un nuovo giocatore
- [ ] Eseguire lo script di migrazione su tutti i club
- [ ] Verificare che tutti i giocatori appaiono nella lista
- [ ] Controllare i log per errori
- [ ] Verificare che i filtri funzionano correttamente
- [ ] Testare la modifica/cancellazione giocatori

## Rollback

In caso di problemi, il fallback automatico garantisce che i profili orfani vengano comunque mostrati anche senza entry in `users`. Non è necessario un rollback della migrazione.

## Impatto

- ✅ Fix non breaking: profili esistenti continuano a funzionare
- ✅ Performance: nessun impatto negativo (aggiunta di un documento)
- ✅ UX: i nuovi giocatori appaiono immediatamente
- ✅ Manutenibilità: struttura database più consistente

---

**Data Fix**: 13 Ottobre 2025  
**Versione**: 1.0.0  
**Autore**: Sistema di migrazione automatico
