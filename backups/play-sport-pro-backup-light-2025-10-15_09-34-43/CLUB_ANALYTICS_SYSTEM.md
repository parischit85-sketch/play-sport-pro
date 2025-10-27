# Sistema Analytics Circoli - "I Tuoi Circoli Preferiti"

## ✅ Implementato - Data: 2025-10-06

---

## Panoramica

Sistema di **tracking delle visualizzazioni** dei circoli per mostrare all'utente i suoi **top 3 circoli più visualizzati** nella sezione "I Tuoi Circoli Preferiti" della dashboard.

### Obiettivo

❌ **NON** basato su affiliazioni (eliminate)  
❌ **NON** basato su prenotazioni  
✅ **Basato su analytics**: tracciare ogni visualizzazione di dashboard circolo

---

## Architettura del Sistema

### 1. Database Structure

```
users/{userId}/
  └── clubViews/{clubId}
      ├── clubId: string              // ID del circolo
      ├── clubName: string            // Nome cached (per performance)
      ├── viewCount: number           // Contatore visualizzazioni
      ├── firstViewedAt: timestamp    // Prima visualizzazione
      └── lastViewedAt: timestamp     // Ultima visualizzazione
```

### Caratteristiche
- ✅ **Subcollection**: `users/{userId}/clubViews/{clubId}`
- ✅ **Auto-increment**: `viewCount` incrementato ad ogni visualizzazione
- ✅ **Timestamp tracking**: Prima e ultima visualizzazione
- ✅ **Cache del nome**: Evita lookup continui per il nome
- ✅ **Performance**: Query limitata a top 3 con `orderBy('viewCount', 'desc')`

---

## File Creati/Modificati

### 1. **Nuovo Servizio**: `src/services/club-analytics.js`

**Funzioni esportate:**

#### `trackClubView(userId, clubId, clubName)`
Traccia una visualizzazione del circolo.

```javascript
await trackClubView(user.uid, 'sporting-cat', 'Sporting CAT');
```

**Comportamento:**
- Se documento esiste: incrementa `viewCount`, aggiorna `lastViewedAt`
- Se documento non esiste: crea nuovo con `viewCount: 1`
- ✅ **Non blocca l'app** se il tracking fallisce (try/catch)

---

#### `getUserMostViewedClubs(userId, limitCount = 3)`
Recupera i circoli più visualizzati dall'utente.

```javascript
const topClubs = await getUserMostViewedClubs(user.uid, 3);
// Returns:
// [
//   {
//     clubId: 'sporting-cat',
//     viewCount: 15,
//     lastViewedAt: Timestamp,
//     club: { id, name, logoUrl, ... }, // Dati completi del circolo
//     name: 'Sporting CAT' // Fallback se club non trovato
//   },
//   ...
// ]
```

**Features:**
- Query con `orderBy('viewCount', 'desc')` + `limit(3)`
- Carica dati completi dei circoli da `clubs/` collection
- Fallback al nome cached se club non trovato
- Restituisce array vuoto se nessuna visualizzazione

---

#### `getAllUserClubViews(userId)`
Recupera tutte le visualizzazioni (senza limite).

Utile per:
- Debug
- Statistiche utente
- Export dati

---

#### `resetUserClubViews(userId)`
Reset completo delle visualizzazioni (utility per testing).

---

### 2. **Modificato**: `src/components/ui/RecentClubsCard.jsx`

**Prima (ERRATO):**
```javascript
// Caricava dalle affiliazioni
const memberships = await getUserClubMemberships(user.uid);
```

**Dopo (CORRETTO):**
```javascript
// Carica i top 3 più visualizzati
const mostViewedClubs = await getUserMostViewedClubs(user.uid, 3);
```

**Cambiamenti UI:**
- Titolo: ~~"I Tuoi Circoli"~~ → **"I Tuoi Circoli Preferiti"**
- Badge: "Top 3" (mostra che sono i più visualizzati)
- Icona: Chart bar (📊) invece di building (🏢)
- Messaggio vuoto: "Nessun circolo visitato" invece di "Nessuna affiliazione"

---

### 3. **Modificato**: `src/features/clubs/ClubDashboard.jsx`

**Aggiunto tracking automatico:**

```javascript
// Track club view quando l'utente accede alla dashboard
useEffect(() => {
  if (user && clubId && club) {
    console.log('📊 [ClubDashboard] Tracking club view:', { clubId, clubName: club.name });
    trackClubView(user.uid, clubId, club.name);
  }
}, [user, clubId, club]);
```

**Quando viene tracciato:**
- ✅ Ogni volta che l'utente apre la dashboard di un circolo
- ✅ Solo se user, clubId e club sono disponibili
- ✅ Non blocca il rendering (async)

---

## Flusso Completo

### Scenario 1: Nuovo Utente

```
1. Utente si registra
2. Cerca circoli → trova "Sporting CAT"
3. Clicca "Entra" → navigate(`/club/sporting-cat/dashboard`)
4. ClubDashboard monta → trackClubView('user123', 'sporting-cat', 'Sporting CAT')
5. Database crea: users/user123/clubViews/sporting-cat { viewCount: 1 }
6. RecentClubsCard carica → getUserMostViewedClubs('user123', 3)
7. Dashboard mostra: "I Tuoi Circoli Preferiti" con "Sporting CAT" (1 visualizzazione)
```

### Scenario 2: Utente Ricorrente

```
1. Utente apre app
2. Dashboard mostra "I Tuoi Circoli Preferiti" con top 3:
   - Tennis Club Roma (25 views)
   - Sporting CAT (15 views)
   - Padel Milano (8 views)
3. Utente clicca "Tennis Club Roma"
4. trackClubView → viewCount: 25 → 26
5. Dashboard aggiornata al prossimo refresh
```

### Scenario 3: Primo Utente (Nessuna Visualizzazione)

```
1. Utente nuovo non ha mai visitato circoli
2. RecentClubsCard → getUserMostViewedClubs restituisce []
3. Mostra card vuota con:
   - "Nessun circolo visitato"
   - Button "Cerca Circoli"
```

---

## Query Database

### Write Operation (Track View)

**Nuovo documento:**
```javascript
users/{userId}/clubViews/{clubId}
  SET {
    clubId: 'sporting-cat',
    clubName: 'Sporting CAT',
    viewCount: 1,
    firstViewedAt: serverTimestamp(),
    lastViewedAt: serverTimestamp()
  }
```

**Update documento esistente:**
```javascript
users/{userId}/clubViews/{clubId}
  UPDATE {
    viewCount: increment(1),
    lastViewedAt: serverTimestamp()
  }
```

### Read Operation (Load Top 3)

```javascript
collection('users/{userId}/clubViews')
  .orderBy('viewCount', 'desc')
  .limit(3)
  .get()
```

**Performance:**
- ✅ Index automatico su `viewCount` (Firestore)
- ✅ Limit(3) riduce latency
- ✅ Subcollection: solo dati utente (privacy + speed)

---

## Vantaggi del Sistema

### 1. **Privacy First**
- Ogni utente ha la sua subcollection isolata
- Nessuna query cross-user
- Dati personali non condivisi

### 2. **Performance**
- Query velocissime (limit 3, orderBy index)
- Caching del nome circolo (no extra lookup)
- Tracking asincrono (non blocca UI)

### 3. **Scalabilità**
- Auto-increment con `increment(1)` (atomic)
- Subcollections scalano infinitamente
- Nessun limite pratico

### 4. **User Experience**
- Mostra circoli REALMENTE preferiti (basato su comportamento)
- Non richiede affiliazione
- Non richiede prenotazioni
- **Funziona dal primo accesso**

### 5. **Analytics Ready**
- Dati pronti per statistiche
- Timestamp per trend analysis
- Esportabile per ML/recommendations

---

## Testing

### Test Case 1: Track View
```javascript
// Setup
const userId = 'test-user-123';
const clubId = 'sporting-cat';

// Action
await trackClubView(userId, clubId, 'Sporting CAT');

// Verify
const viewDoc = await getDoc(doc(db, 'users', userId, 'clubViews', clubId));
assert(viewDoc.exists());
assert(viewDoc.data().viewCount === 1);
```

### Test Case 2: Increment View
```javascript
// Setup: già 5 visualizzazioni
await trackClubView(userId, clubId, 'Sporting CAT'); // +1

// Verify
const viewDoc = await getDoc(doc(db, 'users', userId, 'clubViews', clubId));
assert(viewDoc.data().viewCount === 6);
```

### Test Case 3: Top 3 Order
```javascript
// Setup: 3 circoli con views diverse
await trackClubView(userId, 'club-a', 'Club A'); // 1 view
await trackClubView(userId, 'club-b', 'Club B'); // 1 view
await trackClubView(userId, 'club-b', 'Club B'); // 2 views
await trackClubView(userId, 'club-c', 'Club C'); // 1 view
await trackClubView(userId, 'club-c', 'Club C'); // 2 views
await trackClubView(userId, 'club-c', 'Club C'); // 3 views

// Action
const topClubs = await getUserMostViewedClubs(userId, 3);

// Verify
assert(topClubs[0].clubId === 'club-c'); // 3 views
assert(topClubs[1].clubId === 'club-b'); // 2 views
assert(topClubs[2].clubId === 'club-a'); // 1 view
```

### Test Case 4: Empty State
```javascript
// Setup: nuovo utente senza visualizzazioni
const newUserId = 'new-user-456';

// Action
const topClubs = await getUserMostViewedClubs(newUserId, 3);

// Verify
assert(topClubs.length === 0);
// UI mostra "Nessun circolo visitato"
```

---

## Firestore Security Rules

**Aggiungi alla `firestore.rules`:**

```javascript
match /users/{userId}/clubViews/{clubViewId} {
  // Solo l'utente può leggere le sue visualizzazioni
  allow read: if request.auth != null && request.auth.uid == userId;
  
  // Solo l'utente può creare/aggiornare le sue visualizzazioni
  allow create, update: if request.auth != null && request.auth.uid == userId;
  
  // Nessuno può cancellare (utility function protetta)
  allow delete: if false;
}
```

**Note:**
- ✅ Privacy: solo l'utente vede i suoi dati
- ✅ Sicurezza: solo l'utente può tracciare le sue visualizzazioni
- ✅ Protezione: delete bloccato (solo admin via server)

---

## Logging & Debug

### Console Logs Implementati

**trackClubView:**
```
📊 [trackClubView] Tracking view: user=abc123, club=sporting-cat
✅ [trackClubView] Updated view count for club sporting-cat
```

**getUserMostViewedClubs:**
```
🔍 [getUserMostViewedClubs] Getting top 3 clubs for user: abc123
📊 [getUserMostViewedClubs] Club sporting-cat: 15 views
✅ [getUserMostViewedClubs] Found 3 club views
```

**ClubDashboard:**
```
📊 [ClubDashboard] Tracking club view: { clubId: 'sporting-cat', clubName: 'Sporting CAT' }
```

**RecentClubsCard:**
```
📊 [RecentClubsCard] Loading most viewed clubs for user: abc123
📊 [RecentClubsCard] Most viewed clubs: 3
✅ [RecentClubsCard] Loaded most viewed clubs: 3
```

---

## Confronto Sistemi

### ❌ Sistema Affiliazioni (Vecchio)
```
- Basato su clubs/{clubId}/users/
- Mostra solo circoli con status='active'
- Richiede approvazione admin
- Ordine: non basato su preferenze utente
```

### ❌ Sistema Prenotazioni (Precedente)
```
- Basato su bookings collection
- Mostra solo circoli con prenotazioni
- Ordine: per data prenotazione
- Problema: nuovo utente vede lista vuota
```

### ✅ Sistema Analytics (Corrente)
```
- Basato su users/{userId}/clubViews/
- Mostra top 3 più visualizzati
- Ordine: per viewCount (comportamento utente)
- Funziona: dal primo accesso a dashboard
- Non richiede: affiliazione, prenotazione, approvazione
```

---

## Estensioni Future

### 1. **Time-based Weighting**
Dare più peso alle visualizzazioni recenti:

```javascript
// Calcola score basato su viewCount + recency
const score = viewCount + (daysSinceLastView < 7 ? 10 : 0);
```

### 2. **User Preferences**
Salvare preferiti manuali:

```javascript
users/{userId}/preferences/
  └── favoriteClubs: ['club-a', 'club-b']
```

### 3. **Recommendations**
ML-based recommendations basate su:
- Club più visualizzati
- Club degli amici
- Club nelle vicinanze
- Club con servizi simili

### 4. **Statistics Dashboard**
Mostrare all'utente:
- Totale circoli visitati
- Circolo più visitato (all-time)
- Trend visualizzazioni (grafico)
- Suggerimenti personalizzati

---

## Migration Notes

### Da Sistema Affiliazioni

**NON** è necessaria migrazione dati perché:
- ✅ Nuovo sistema parte da zero (fresh start)
- ✅ Si popola automaticamente con l'uso
- ✅ Nessun dato legacy da convertire
- ✅ Affiliazioni eliminate in precedenza

### Comportamento Transitorio

**Primo periodo (giorni 1-7):**
- Molti utenti avranno `clubViews` vuoto
- Card mostrerà "Nessun circolo visitato"
- CTA: "Cerca Circoli"

**Dopo 1 settimana:**
- Maggior parte utenti avrà 1-3 club trackati
- Card popolata con top 3
- Sistema a regime

---

## Conclusione

✅ **Sistema implementato con successo**

**Features:**
- ✅ Tracking automatico visualizzazioni
- ✅ Top 3 circoli più visualizzati
- ✅ Performance ottimizzata (limit 3, orderBy)
- ✅ Privacy-first (subcollections utente)
- ✅ UI aggiornata ("I Tuoi Circoli Preferiti")
- ✅ Logging completo per debug

**File:**
- 🆕 `src/services/club-analytics.js` (200+ righe)
- 🔧 `src/components/ui/RecentClubsCard.jsx` (semplificato, 150 righe)
- 🔧 `src/features/clubs/ClubDashboard.jsx` (aggiunto tracking)

**Database:**
- 🆕 `users/{userId}/clubViews/{clubId}` subcollection

**Prossimi Passi:**
1. ✅ Build & deploy
2. ✅ Test con utenti reali
3. 📊 Monitorare analytics
4. 🔄 Iterare basandosi su feedback

---

**Implementato da**: GitHub Copilot  
**Data**: 2025-10-06  
**Versione**: 1.0.0
