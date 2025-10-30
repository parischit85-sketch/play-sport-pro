# Fix: Controllo Ruolo Istruttore per Circolo Specifico

## 📋 Problema

Un utente che è istruttore per il **circolo X** vedeva la dashboard da istruttore anche nel **circolo Y**, dove invece dovrebbe vedere la dashboard normale da utente.

### 🔍 Causa del Problema

Il problema era causato da due diverse implementazioni del controllo istruttore:

1. **`AuthContext.isInstructor(clubId)`** - Controllava solo:
   - `userClubRoles[clubId]` (ruoli globali)
   - `userAffiliations` (affiliazioni)
   - ❌ **NON** controllava se l'utente è nella collection `players` del circolo con `category === 'instructor'`

2. **`ClubContext.isUserInstructor(userId)`** - Controllava correttamente:
   - Collection `players` del **circolo corrente**
   - Verifica `category === 'instructor'`
   - Verifica `instructorData.isInstructor === true`
   - ✅ **Questo è il controllo corretto!**

### ⚠️ Il Problema nei File

Alcuni componenti usavano `AuthContext.isInstructor()` invece di `ClubContext.isUserInstructor()`, causando falsi positivi quando un istruttore del circolo X entrava nel circolo Y.

## ✅ Soluzione

### 1. File Modificati

#### `src/features/clubs/ClubDashboard.jsx`

**PRIMA (parzialmente corretto):**
```jsx
const { club, loading: clubLoading, isUserInstructor } = useClub();
const isInstructor = isUserInstructor(user?.uid);
```

**DOPO (completamente corretto):**
```jsx
const { club, loading: clubLoading, isUserInstructor, players, playersLoaded } = useClub();

// Check if current user is instructor in this club
// IMPORTANTE: verifica solo dopo che i players sono caricati per evitare falsi positivi
const isInstructor = playersLoaded && isUserInstructor(user?.uid);

console.log('🏢 [ClubDashboard] Instructor check:', {
  clubId,
  userId: user?.uid,
  playersLoaded,
  playersCount: players?.length,
  isInstructor,
  userInPlayers: players?.find(p => p.id === user?.uid),
});
```

**Motivo**: Aggiunto controllo `playersLoaded` per evitare falsi positivi prima del caricamento.

---

#### `src/pages/DashboardPage.jsx`

**PRIMA (errato):**
```jsx
const { user, userRole, userAffiliations, isInstructor } = useAuth();
const { players, matches, clubId } = useClub();

// Check if user is instructor in current club
const isUserInstructor = isInstructor(clubId); // ❌ Usa AuthContext
```

**DOPO (corretto):**
```jsx
const { user, userRole, userAffiliations } = useAuth();
const { players, matches, clubId, playersLoaded, isUserInstructor } = useClub();

// Check if user is instructor in current club
// IMPORTANTE: usa isUserInstructor da ClubContext che controlla i players del circolo corrente
// e verifica solo dopo che i players sono caricati per evitare falsi positivi
const isInstructor = playersLoaded && isUserInstructor(user?.uid);

console.log('👨‍🏫 [DashboardPage] Instructor check:', {
  clubId,
  userId: user?.uid,
  playersLoaded,
  isInstructor,
  userInPlayers: players?.find(p => p.id === user?.uid),
});
```

**Cambiamenti**:
- ✅ Rimosso `isInstructor` da `AuthContext`
- ✅ Aggiunto `playersLoaded` e `isUserInstructor` da `ClubContext`
- ✅ Aggiunto controllo `playersLoaded` prima di verificare il ruolo
- ✅ Aggiunto log per debugging

---

#### `src/pages/InstructorDashboardPage.jsx`

**PRIMA (errato):**
```jsx
const { user, isInstructor } = useAuth();
const { clubId } = useClub();

// Check if user is instructor in current club
const isUserInstructor = isInstructor(clubId); // ❌ Usa AuthContext

React.useEffect(() => {
  if (user && clubId && !isUserInstructor) {
    console.log('⚠️ User is not an instructor, redirecting to dashboard');
    navigate('/dashboard');
  }
}, [user, clubId, isUserInstructor, navigate]);

if (!isUserInstructor) {
  // Show access denied
}
```

**DOPO (corretto):**
```jsx
const { user } = useAuth();
const { clubId, playersLoaded, isUserInstructor } = useClub();

// Check if user is instructor in current club
// IMPORTANTE: usa isUserInstructor da ClubContext che controlla i players del circolo corrente
const isInstructor = playersLoaded && isUserInstructor(user?.uid);

console.log('👨‍🏫 [InstructorDashboardPage] Instructor check:', {
  clubId,
  userId: user?.uid,
  playersLoaded,
  isInstructor,
});

React.useEffect(() => {
  if (user && clubId && playersLoaded && !isInstructor) {
    console.log('⚠️ User is not an instructor, redirecting to dashboard');
    navigate('/dashboard');
  }
}, [user, clubId, playersLoaded, isInstructor, navigate]);

if (!playersLoaded || !isInstructor) {
  // Show loading or access denied
}
```

**Cambiamenti**:
- ✅ Rimosso `isInstructor` da `AuthContext`
- ✅ Aggiunto `playersLoaded` e `isUserInstructor` da `ClubContext`
- ✅ Aggiunto controllo `playersLoaded` nel `useEffect` e nella condizione finale
- ✅ Aggiunto log per debugging

## 📊 Differenze tra le Due Funzioni

### `AuthContext.isInstructor(clubId)`
```javascript
// Controlla solo ruoli globali e affiliazioni
const isInstructor = (clubId = currentClub) => {
  return hasRole(USER_ROLES.INSTRUCTOR, clubId);
};

const hasRole = (role, clubId = currentClub) => {
  if (userRole === USER_ROLES.SUPER_ADMIN) return true;
  if (userRole === role) return true;
  if (clubId && userClubRoles[clubId] === role) return true;
  // ❌ Non controlla la collection players del circolo
  return false;
};
```

**Problemi**:
- ❌ Non controlla i `players` del circolo corrente
- ❌ Può dare falsi positivi se l'utente ha ruoli globali
- ❌ Non verifica `instructorData.isInstructor`

### `ClubContext.isUserInstructor(userId)`
```javascript
// Controlla i players del circolo corrente
const isUserInstructor = (userId) => {
  if (!userId || !players || players.length === 0) return false;

  const userPlayer = players.find((p) => p.id === userId);
  if (!userPlayer) return false;

  // Check if user has instructor category and instructorData
  const hasInstructorCategory = userPlayer.category === 'instructor';
  const hasInstructorData =
    userPlayer.instructorData && userPlayer.instructorData.isInstructor === true;

  return hasInstructorCategory && hasInstructorData;
};
```

**Vantaggi**:
- ✅ Controlla **solo** i players del **circolo corrente**
- ✅ Verifica `category === 'instructor'`
- ✅ Verifica `instructorData.isInstructor === true`
- ✅ Se l'utente non è nei players del circolo → ritorna `false`

## 🔄 Comportamento Finale

### Scenario 1: Istruttore nel Circolo X entra nel Circolo X
```
User: mario@email.com
Circolo X players: 
  - { id: 'mario-uid', category: 'instructor', instructorData: { isInstructor: true } }
  
↓

playersLoaded = true
isUserInstructor('mario-uid') = true
isInstructor = true

✅ Mostra InstructorDashboard
```

### Scenario 2: Istruttore del Circolo X entra nel Circolo Y
```
User: mario@email.com
Circolo Y players: 
  - { id: 'luigi-uid', category: 'instructor', ... }
  - { id: 'mario-uid', category: 'member', instructorData: undefined }
  
↓

playersLoaded = true
isUserInstructor('mario-uid') = false (non è instructor in questo circolo)
isInstructor = false

✅ Mostra Dashboard Normale
```

### Scenario 3: Utente Normale entra in un Circolo
```
User: luigi@email.com
Circolo X players: 
  - { id: 'mario-uid', category: 'instructor', ... }
  - { id: 'luigi-uid', category: 'member', instructorData: undefined }
  
↓

playersLoaded = true
isUserInstructor('luigi-uid') = false
isInstructor = false

✅ Mostra Dashboard Normale
```

## ✅ Validazione

- [x] Build Vite completato senza errori
- [x] `ClubDashboard.jsx` ora controlla `playersLoaded`
- [x] `DashboardPage.jsx` usa `ClubContext.isUserInstructor` invece di `AuthContext.isInstructor`
- [x] `InstructorDashboardPage.jsx` usa `ClubContext.isUserInstructor` invece di `AuthContext.isInstructor`
- [x] Aggiunti log di debugging in tutti i componenti modificati
- [x] Controllo sempre eseguito **dopo** il caricamento dei players

## 📝 Note Tecniche

### Perché `playersLoaded` è Importante

Se non controlliamo `playersLoaded`, potrebbe succedere che:
1. Il componente renderizza prima che i players siano caricati
2. `isUserInstructor` ritorna `false` (array vuoto)
3. L'utente vede la dashboard normale per un istante
4. Poi i players si caricano e dovrebbe cambiare a InstructorDashboard
5. Ma il componente potrebbe non re-renderizzare correttamente

**Soluzione**: Controllare sempre `playersLoaded && isUserInstructor(userId)`

### Log di Debugging

I log aggiunti aiutano a verificare:
- Se i players sono caricati
- Quanti players ci sono nel circolo
- Se l'utente è tra i players
- Il risultato finale del controllo istruttore

## 🎯 Best Practice

**Regola d'oro**: Per verificare se un utente è istruttore **di un circolo specifico**, usa **sempre** `ClubContext.isUserInstructor()` e **mai** `AuthContext.isInstructor()`.

**Quando usare ciascuna funzione**:

- ✅ `ClubContext.isUserInstructor(userId)` - Verifica se un utente è istruttore **del circolo corrente**
- ✅ `AuthContext.isClubAdmin(clubId)` - Verifica se un utente è admin di un circolo specifico
- ✅ `AuthContext.hasRole(role, clubId)` - Verifica ruoli globali o di sistema

---

**Data**: 2025-10-08  
**Stato**: ✅ Completato  
**Build**: ✅ Successful  
**Fix**: ✅ Controllo istruttore ora specifico per circolo
