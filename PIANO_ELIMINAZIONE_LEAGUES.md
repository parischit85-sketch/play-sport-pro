# 🗑️ Piano Eliminazione Sistema Leagues

## 📅 Data Piano
**5 Gennaio 2025 - 19:45**

---

## 🎯 Obiettivo
Eliminare completamente il sistema **leagues/** obsoleto dal progetto.

---

## ✅ Analisi Completata

### Database
- ✅ `leagues/` collection: **0 documenti** (già vuota)
- ✅ Sistema nuovo attivo: `clubs/{clubId}/users/`, `courts/`, `matches/`, `bookings/`

### Codice - Utilizzo Leagues
1. **LeagueContext.jsx** → **NON usato** da nessun componente ✅
2. **useLeague** hook → **NON usato** da nessun componente ✅
3. **LeagueProvider** → **NON presente** nell'App tree ✅
4. **loadLeague()** → Usato da 5 componenti come **FALLBACK legacy**
5. **Extra.jsx** (backup UI) → **RIMOSSO** dalle routes (riga 30 AppRouter.jsx) ✅

### Componenti che Usano loadLeague()
Tutti e 5 usano **SOLO** `loadLeague('default')` - nessuno usa subcollections:

1. **src/features/clubs/ClubCourts.jsx**
   ```javascript
   const data = await loadLeague('default');
   let clubCourts = data.courts?.filter(court => court.clubId === clubId) || [];
   ```

2. **src/features/clubs/ClubStats.jsx**
   ```javascript
   const data = await loadLeague('default');
   let clubPlayers = data.players?.filter(player => 
     player.clubId === clubId || 
     player.affiliations?.some(aff => aff.clubId === clubId)
   ) || [];
   ```

3. **src/features/clubs/ClubClassifica.jsx**
   ```javascript
   const data = await loadLeague('default');
   let clubPlayers = data.players?.filter(player => player.clubId === clubId) || [];
   let clubMatches = data.matches?.filter(match => match.clubId === clubId) || [];
   ```

4. **src/features/clubs/ClubBooking.jsx**
   ```javascript
   const data = await loadLeague('default');
   let filteredData = {
     ...data,
     courts: data.courts?.filter(court => court.clubId === clubId) || [],
     bookings: data.bookings?.filter(booking => booking.clubId === clubId) || []
   };
   ```

5. **src/features/extra/Extra.jsx**
   - Usato in: `AdminBookingsPage.jsx` (backup settings)
   - **NON più** in routes come page standalone ✅
   - Funzione: Backup/restore manuale

---

## 🚨 Problema Architetturale

### Attuale (SBAGLIATO)
I componenti caricano **TUTTI** i dati da `leagues/default` e filtrano **client-side**:

```javascript
// ❌ INEFFICIENTE - Carica TUTTO il database
const data = await loadLeague('default');  // Carica players, matches, courts, bookings
const clubPlayers = data.players?.filter(p => p.clubId === clubId);  // Filtra client-side
```

**Problemi:**
- ❌ Carica **TUTTI** i dati di **TUTTI** i club
- ❌ Filtro **client-side** (lento, memoria sprecata)
- ❌ Non sfrutta Firestore queries
- ❌ Non scalabile (limite 1MB per documento)
- ❌ `leagues/default` è **vuoto** quindi fallback non funziona più!

### Corretto (NUOVO SISTEMA)
Ogni componente dovrebbe caricare **solo** i dati del club dalle **subcollections**:

```javascript
// ✅ EFFICIENTE - Carica solo dati del club
import { collection, getDocs } from 'firebase/firestore';

const courtsRef = collection(db, `clubs/${clubId}/courts`);
const snapshot = await getDocs(courtsRef);
const courts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

**Vantaggi:**
- ✅ Carica **solo** dati del club specifico
- ✅ Query **server-side** (veloce, sicuro)
- ✅ Sfrutta Firestore indexes
- ✅ Scalabile (ogni club ha il suo spazio)
- ✅ Supporta Firestore rules per sicurezza

---

## 📋 Piano di Eliminazione - 6 Fasi

### FASE 1: Creare Servizi per Subcollections ⏳ TODO

#### File da creare: `src/services/club-data.js`

```javascript
/**
 * Servizi per accedere ai dati del club dalle subcollections
 */
import { db } from '@lib/firebase.js';
import { collection, getDocs, query, where } from 'firebase/firestore';

/**
 * Carica i campi (courts) di un club
 */
export async function getClubCourts(clubId) {
  const courtsRef = collection(db, `clubs/${clubId}/courts`);
  const snapshot = await getDocs(courtsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Carica i giocatori (users) di un club
 */
export async function getClubPlayers(clubId) {
  const usersRef = collection(db, `clubs/${clubId}/users`);
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Carica i match di un club
 */
export async function getClubMatches(clubId) {
  const matchesRef = collection(db, `clubs/${clubId}/matches`);
  const snapshot = await getDocs(matchesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Carica le prenotazioni di un club
 * NOTA: Le bookings ora sono nella root collection con campo clubId
 */
export async function getClubBookings(clubId) {
  const bookingsRef = collection(db, 'bookings');
  const q = query(bookingsRef, where('clubId', '==', clubId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Carica tutti i dati di un club in una chiamata
 */
export async function getClubData(clubId) {
  const [courts, users, matches, bookings] = await Promise.all([
    getClubCourts(clubId),
    getClubPlayers(clubId),
    getClubMatches(clubId),
    getClubBookings(clubId)
  ]);
  
  return {
    courts,
    players: users,  // Alias per compatibilità
    users,
    matches,
    bookings
  };
}
```

---

### FASE 2: Modificare Componenti Club ⏳ TODO

#### 2.1 ClubCourts.jsx
```diff
- import { loadLeague } from '@services/cloud.js';
+ import { getClubCourts, getClubBookings } from '@services/club-data.js';

  const loadClubCourts = async () => {
    if (!clubId) return;
    setLoading(true);
    setError(null);
    
    try {
-     const data = await loadLeague('default');
-     let clubCourts = data.courts?.filter(court => court.clubId === clubId) || [];
-     let clubBookings = data.bookings?.filter(booking => booking.clubId === clubId) || [];
+     const courts = await getClubCourts(clubId);
+     const bookings = await getClubBookings(clubId);
      
-     setCourts(clubCourts);
-     setBookings(clubBookings);
+     setCourts(courts);
+     setBookings(bookings);
    } catch (err) {
      console.error('Error loading club courts:', err);
      setError('Errore nel caricamento dei campi del club');
    } finally {
      setLoading(false);
    }
  };
```

#### 2.2 ClubStats.jsx
```diff
- import { loadLeague } from '@services/cloud.js';
+ import { getClubPlayers, getClubMatches } from '@services/club-data.js';

  const loadClubData = async () => {
    if (!clubId) return;
    setLoading(true);
    setError(null);
    
    try {
-     const data = await loadLeague('default');
-     let clubPlayers = data.players?.filter(p => p.clubId === clubId) || [];
-     let clubMatches = data.matches?.filter(m => m.clubId === clubId) || [];
+     const players = await getClubPlayers(clubId);
+     const matches = await getClubMatches(clubId);
      
-     setPlayers(clubPlayers);
-     setMatches(clubMatches);
+     setPlayers(players);
+     setMatches(matches);
    } catch (err) {
      console.error('Error loading club data:', err);
      setError('Errore nel caricamento dei dati del club');
    } finally {
      setLoading(false);
    }
  };
```

#### 2.3 ClubClassifica.jsx
Stesse modifiche di ClubStats.jsx (usa getClubPlayers + getClubMatches).

#### 2.4 ClubBooking.jsx
```diff
- import { loadLeague } from '@services/cloud.js';
+ import { getClubData } from '@services/club-data.js';

  const loadClubBookingData = async () => {
    if (!clubId) return;
    setLoading(true);
    setError(null);
    
    try {
-     const data = await loadLeague('default');
-     let filteredData = {
-       ...data,
-       courts: data.courts?.filter(court => court.clubId === clubId) || [],
-       bookings: data.bookings?.filter(booking => booking.clubId === clubId) || []
-     };
+     const clubData = await getClubData(clubId);
      
-     setClubData(filteredData);
+     setClubData(clubData);
    } catch (err) {
      console.error('Error loading club booking data:', err);
      setError('Errore nel caricamento del sistema di prenotazioni');
    } finally {
      setLoading(false);
    }
  };
```

---

### FASE 3: Gestire Extra.jsx (Backup Feature) ⏳ TODO

#### Opzione A: Rimuovere Completamente ✅ CONSIGLIATA
Se la feature backup non è più usata:

1. Eliminare `src/features/extra/Extra.jsx`
2. Eliminare `src/pages/ExtraPage.jsx`
3. Rimuovere import in `AdminBookingsPage.jsx`

#### Opzione B: Mantenere Solo per Admin
Se serve ancora backup manuale:

1. Modificare Extra.jsx per usare nuovo sistema
2. Backup/restore da subcollections invece che leagues
3. Mantenere solo per super-admin

**Decisione**: Rimuovere completamente (già rimosso da routes).

---

### FASE 4: Eliminare File Obsoleti ⏳ TODO

```bash
# File da eliminare:
src/contexts/LeagueContext.jsx           # 458 righe - NON usato
src/features/extra/Extra.jsx             # Backup legacy (se confermato)
src/pages/ExtraPage.jsx                  # Già rimosso da routes
src/scripts/migrateAndCleanLegacyCourtArrays.js  # Script migrazione legacy
```

---

### FASE 5: Deprecare cloud.js Functions ⏳ TODO

#### File: `src/services/cloud.js`

```diff
  /**
-  * Carica dati da leagues collection (sistema legacy)
+  * @deprecated Sistema leagues OBSOLETO - usa club-data.js invece
+  * Mantenuto solo per backward compatibility temporanea
   */
  export async function loadLeague(leagueId) {
+   console.warn('⚠️ loadLeague() è DEPRECATO - usa getClubData() da club-data.js');
    
    const snap = await getDoc(doc(db, 'leagues', leagueId));
-   return snap.exists() ? snap.data() : null;
+   return snap.exists() ? snap.data() : {
+     players: [],
+     matches: [],
+     courts: [],
+     bookings: [],
+     bookingConfig: {}
+   };
  }
  
  /**
+  * @deprecated Sistema leagues OBSOLETO
   */
  export async function saveLeague(leagueId, data) {
+   console.warn('⚠️ saveLeague() è DEPRECATO - non salvare più in leagues/');
+   return; // Non fare nulla
-   await setDoc(doc(db, 'leagues', leagueId), data);
  }
  
  /**
+  * @deprecated Sistema leagues OBSOLETO
   */
  export async function listLeagues() {
+   console.warn('⚠️ listLeagues() è DEPRECATO');
+   return [];
-   const querySnapshot = await getDocs(collection(db, 'leagues'));
-   // ... resto codice
  }
  
  /**
+  * @deprecated Sistema leagues OBSOLETO
   */
  export async function subscribeLeague(leagueId, callback) {
+   console.warn('⚠️ subscribeLeague() è DEPRECATO');
+   return () => {}; // No-op unsubscribe
-   return onSnapshot(doc(db, 'leagues', leagueId), callback);
  }
```

---

### FASE 6: Test e Verifica ⏳ TODO

#### 6.1 Test Manuale
- [ ] Aprire ClubCourts.jsx e verificare caricamento campi
- [ ] Aprire ClubStats.jsx e verificare statistiche
- [ ] Aprire ClubClassifica.jsx e verificare classifica
- [ ] Aprire ClubBooking.jsx e verificare prenotazioni
- [ ] Verificare console per warning deprecation
- [ ] Verificare no errori Firestore

#### 6.2 Build Production
```bash
npm run build
```
- [ ] Build completa senza errori
- [ ] No warning su import inesistenti
- [ ] Dimensione bundle ridotta (rimozione codice morto)

#### 6.3 Database Verification
```bash
node scripts/database-cleanup/1-analyze-collections.js
```
- [ ] Confermare `leagues/` = 0 documenti
- [ ] Confermare `clubs/{clubId}/courts/` ha dati
- [ ] Confermare `clubs/{clubId}/matches/` ha dati
- [ ] Confermare `clubs/{clubId}/users/` ha dati
- [ ] Confermare `bookings/` (root) ha dati

---

## 🎯 Checklist Finale

### Fase 1: Servizi ⏳
- [ ] Creare `src/services/club-data.js`
- [ ] Implementare `getClubCourts()`
- [ ] Implementare `getClubPlayers()`
- [ ] Implementare `getClubMatches()`
- [ ] Implementare `getClubBookings()`
- [ ] Implementare `getClubData()` (tutto insieme)

### Fase 2: Componenti ⏳
- [ ] Modificare `ClubCourts.jsx`
- [ ] Modificare `ClubStats.jsx`
- [ ] Modificare `ClubClassifica.jsx`
- [ ] Modificare `ClubBooking.jsx`
- [ ] Rimuovere tutti gli import di `loadLeague`

### Fase 3: Extra ⏳
- [ ] Verificare se Extra.jsx è ancora necessario
- [ ] Rimuovere Extra.jsx o migrare a nuovo sistema

### Fase 4: Eliminazione File ⏳
- [ ] Eliminare `LeagueContext.jsx`
- [ ] Eliminare `Extra.jsx` (se confermato)
- [ ] Eliminare `ExtraPage.jsx`
- [ ] Eliminare script migrazione legacy

### Fase 5: Deprecazione ⏳
- [ ] Aggiungere `@deprecated` a `loadLeague()`
- [ ] Aggiungere `@deprecated` a `saveLeague()`
- [ ] Aggiungere `@deprecated` a `listLeagues()`
- [ ] Aggiungere `@deprecated` a `subscribeLeague()`
- [ ] Aggiungere console.warn() per deprecation

### Fase 6: Test ⏳
- [ ] Test manuale tutte le feature club
- [ ] Build production senza errori
- [ ] Database verification con script
- [ ] Nessun errore in console browser
- [ ] Performance migliorate (caricamento più veloce)

---

## 📊 Impatto Stimato

### File Modificati
- **Nuovi**: 1 file (`club-data.js`)
- **Modificati**: 5 file (4 componenti + `cloud.js`)
- **Eliminati**: 4 file (`LeagueContext.jsx`, `Extra.jsx`, `ExtraPage.jsx`, migrazione script)

### Linee di Codice
- **Rimosse**: ~800 righe (458 LeagueContext + 200 Extra + 100 cloud.js + 50 varie)
- **Aggiunte**: ~150 righe (`club-data.js` + modifiche componenti)
- **Netto**: -650 righe (~650 righe eliminate)

### Performance
- **Prima**: Carica TUTTI i dati di TUTTI i club → Filtra client-side
- **Dopo**: Carica SOLO i dati del club specifico → Query diretta Firestore
- **Stima miglioramento**: 70-90% più veloce (dipende da quanti club/dati)

### Database
- **Prima**: 1 documento `leagues/default` con TUTTI i dati (limite 1MB)
- **Dopo**: Dati distribuiti in subcollections (scalabile, no limiti)
- **Collection da eliminare**: `leagues/` (già vuota, 0 documenti)

---

## 🚀 Prossimi Passi Immediati

### 1. Conferma Piano ✅
Confermare con user che il piano è corretto.

### 2. Eseguire Fase 1 ⏳
Creare `src/services/club-data.js` con tutte le funzioni.

### 3. Eseguire Fase 2 ⏳
Modificare i 4 componenti uno per uno e testare.

### 4. Eseguire Fasi 3-6 ⏳
Completare eliminazione, deprecazione, test.

---

## 📝 Note

### Backward Compatibility
Le funzioni `loadLeague()` etc. saranno **deprecate** ma non eliminate immediatamente:
- Console warning per sviluppatori
- Ritornano dati vuoti invece di errori
- Possono essere eliminate in un secondo momento

### Rollback Plan
Se qualcosa va storto:
1. Revert modifiche componenti (git)
2. Le funzioni cloud.js sono ancora presenti (deprecate ma funzionanti)
3. Database intatto (nessuna modifica a collections esistenti)

### Vantaggi a Lungo Termine
- ✅ Codice più pulito e manutenibile
- ✅ Performance migliorate
- ✅ Scalabilità database
- ✅ Sicurezza (Firestore rules)
- ✅ -650 righe di codice obsoleto

---

## ✅ Status
**PIANO APPROVATO** - Pronto per esecuzione

Confermi di procedere con la Fase 1 (creare `club-data.js`)?
