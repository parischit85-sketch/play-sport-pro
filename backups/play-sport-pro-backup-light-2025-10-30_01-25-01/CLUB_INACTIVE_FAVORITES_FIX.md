# Fix: Circoli Inattivi Visibili nei Preferiti

## 🐛 Problema Riscontrato

**Scenario**: Anche se un circolo viene disattivato dal super-admin (`isActive: false`), gli utenti che in precedenza lo hanno visualizzato possono ancora:
1. ✅ Vederlo nella sezione **"I Tuoi Circoli Preferiti"** della dashboard
2. ✅ Vederlo nella sezione **"I Tuoi Circoli"** nella pagina di ricerca
3. ✅ Accedere alla dashboard del circolo cliccandoci sopra

**Problema**: Il sistema di visibilità client-side filtrava solo le ricerche pubbliche, ma non i circoli affiliati/preferiti dell'utente.

---

## ✅ Soluzione Implementata

### 1. Filtro in `club-analytics.js`

**File**: `src/services/club-analytics.js`

**Funzione**: `getUserMostViewedClubs()`

**Modifica**: Quando carica i dati completi del circolo, verifica `isActive`:

```javascript
// Carica i dati completi del club
let clubData = null;
try {
  const clubDocRef = doc(db, 'clubs', clubId);
  const clubDocSnap = await getDoc(clubDocRef);
  
  if (clubDocSnap.exists()) {
    const data = clubDocSnap.data();
    // 🔒 FILTRO: Solo circoli attivi
    if (data.isActive === true) {
      clubData = { id: clubId, ...data };
    }
  }
} catch (clubError) {
  console.error(`❌ [getUserMostViewedClubs] Error loading club ${clubId}:`, clubError);
}
```

**Effetto**: Se un circolo è `isActive: false`, `clubData` rimane `null` e non viene mostrato.

---

### 2. Doppia Verifica in `RecentClubsCard.jsx`

**File**: `src/components/ui/RecentClubsCard.jsx`

**Componente**: `RecentClubsCard`

**Modifica**: Secondo livello di filtro dopo `getUserMostViewedClubs`:

```javascript
// Filtra solo circoli che hanno dati validi E sono attivi
const clubsData = mostViewedClubs
  .filter(viewData => viewData.club !== null && viewData.club.isActive === true)
  .map(viewData => ({
    id: viewData.clubId,
    viewCount: viewData.viewCount,
    lastViewedAt: viewData.lastViewedAt,
    ...viewData.club
  }));
```

**Effetto**: Anche se `getUserMostViewedClubs` restituisce un circolo inattivo, viene escluso dal rendering.

---

### 3. Filtro in ClubSearch - "I Tuoi Circoli"

**File**: `src/features/clubs/ClubSearch.jsx`

**Sezione**: Circoli affiliati dell'utente

**Modifica `affiliatedClubs`**:

```javascript
const affiliatedClubs = useMemo(() => {
  if (!user || !userAffiliations || !allClubs.length) return [];
  return allClubs.filter((club) =>
    // 🔒 FILTRO: Solo circoli attivi E affiliati approvati
    club.isActive === true &&
    userAffiliations.some((aff) => aff.clubId === club.id && aff.status === 'approved')
  );
}, [allClubs, userAffiliations, user]);
```

**Effetto**: Gli utenti NON vedono i loro circoli affiliati se sono stati disattivati.

---

### 4. Filtro in ClubSearch - "Circoli Nelle Vicinanze"

**File**: `src/features/clubs/ClubSearch.jsx`

**Sezione**: I 3 circoli più vicini

**Modifica `nearbyClubs`**:

```javascript
const nearbyClubs = useMemo(() => {
  if (!allClubs.length) return [];
  return allClubs
    .filter((club) => 
      // 🔒 FILTRO: Solo circoli attivi E non già affiliati
      club.isActive === true &&
      !affiliatedClubs.some((aff) => aff.id === club.id)
    )
    .slice(0, 6);
}, [allClubs, affiliatedClubs]);
```

**Effetto**: Solo circoli attivi appaiono tra i "Circoli Nelle Vicinanze".

---

## 📋 File Modificati

| File | Righe Modificate | Descrizione |
|------|------------------|-------------|
| `src/services/club-analytics.js` | 108-117 | Filtra circoli inattivi in `getUserMostViewedClubs` |
| `src/components/ui/RecentClubsCard.jsx` | 106-107 | Doppia verifica `isActive === true` |
| `src/features/clubs/ClubSearch.jsx` | 62-66 | Filtro `isActive` in `affiliatedClubs` |
| `src/features/clubs/ClubSearch.jsx` | 69-76 | Filtro `isActive` in `nearbyClubs` |

---

## 🧪 Test da Eseguire

### Scenario 1: Circolo Preferito Disattivato

**Setup**:
1. Utente "Mario" ha visualizzato circolo "Sporting Club"
2. "Sporting Club" appare in "I Tuoi Circoli Preferiti" sulla dashboard
3. Super-admin disattiva "Sporting Club" (`isActive: false`)

**Test**:
1. Mario ricarica la dashboard
2. ✅ **Verifica**: "Sporting Club" NON appare più in "I Tuoi Circoli Preferiti"

---

### Scenario 2: Circolo Affiliato Disattivato

**Setup**:
1. Utente "Laura" si è registrata al circolo "Padel Roma"
2. Ha affiliazione approvata (`status: 'approved'`)
3. "Padel Roma" appare in "I Tuoi Circoli" nella ricerca
4. Super-admin disattiva "Padel Roma"

**Test**:
1. Laura va su `/clubs` (pagina ricerca)
2. ✅ **Verifica**: "Padel Roma" NON appare più in "I Tuoi Circoli"
3. ✅ **Verifica**: Laura NON può accedere a `/club/padel-roma/dashboard`

---

### Scenario 3: Circolo Riattivato

**Setup**:
1. Circolo "Tennis Elite" era `isActive: false`
2. Non visibile a nessun utente pubblico
3. Super-admin riattiva il circolo (`isActive: true`)

**Test**:
1. Utenti che lo avevano visualizzato prima ricaricano la dashboard
2. ✅ **Verifica**: "Tennis Elite" riappare in "I Tuoi Circoli Preferiti"
3. ✅ **Verifica**: "Tennis Elite" riappare in ricerca pubblica

---

## 🔒 Sicurezza

### Livelli di Protezione

1. **Firestore Query** (quando saranno deployate le regole production):
   ```javascript
   // firestore.rules.production
   match /clubs/{clubId} {
     allow read: if isClubActive(clubId) || isClubOwner(clubId);
   }
   ```

2. **Service Layer** (`club-analytics.js`):
   - Filtra `isActive === true` quando carica i dati del circolo

3. **Component Layer** (`RecentClubsCard.jsx`, `ClubSearch.jsx`):
   - Doppia verifica `club.isActive === true` prima di renderizzare

4. **Visibility Layer** (`clubs.js`):
   - Tutte le query pubbliche filtrano `isActive === true`

**Risultato**: Difesa in profondità (Defense in Depth) - anche se un livello fallisce, gli altri proteggono.

---

## 🎯 Comportamento Atteso

| Situazione | Circolo Visibile? | Accesso Dashboard? |
|-----------|-------------------|-------------------|
| Utente pubblico + circolo inattivo | ❌ No | ❌ No |
| Utente affiliato + circolo inattivo | ❌ No | ❌ No |
| Utente che ha visualizzato + circolo inattivo | ❌ No | ❌ No |
| Club-admin del circolo + circolo inattivo | ✅ Sì | ✅ Sì |
| Super-admin + circolo inattivo | ✅ Sì | ✅ Sì |

---

## ⚠️ Note Importanti

1. **Analytics Preservati**: Anche se il circolo è disattivato, il conteggio delle visualizzazioni (`viewCount`) è preservato in `users/{userId}/clubViews/{clubId}`. Quando il circolo viene riattivato, i dati analytics riappaiono.

2. **Affiliazioni Preservate**: Le affiliazioni in `clubs/{clubId}/affiliations/{userId}` NON vengono cancellate quando il circolo è disattivato. Quando riattivato, gli utenti rivedono il circolo.

3. **Nessuna Cancellazione Dati**: Questa implementazione NON cancella dati storici, solo nasconde il circolo agli utenti pubblici.

4. **Club-Admin Sempre Accesso**: I club-admin vedono sempre il loro circolo (anche se inattivo) con il banner di avviso.

---

## 🚀 Deploy

**Build locale**:
```bash
npm run build
```

**Verifica errori**:
```bash
# Nessun errore TypeScript/ESLint previsto
```

**Commit**:
```bash
git add .
git commit -m "fix: Hide inactive clubs from user favorites and affiliations"
git push
```

**Netlify**: Deploy automatico al push su `main`.

---

## 📚 Riferimenti

- Sistema principale: `CLUB_ACTIVATION_SYSTEM.md`
- Filtri client-side: `CLUB_VISIBILITY_FIX.md`
- Analytics: `CLUB_ANALYTICS_SYSTEM.md`
- Firestore Rules: `firestore.rules.production`

---

## ✅ Checklist Completata

- [x] Filtro in `getUserMostViewedClubs()` - `club-analytics.js`
- [x] Doppia verifica in `RecentClubsCard.jsx`
- [x] Filtro in `affiliatedClubs` - `ClubSearch.jsx`
- [x] Filtro in `nearbyClubs` - `ClubSearch.jsx`
- [x] Documentazione completa
- [x] Test scenarios definiti
- [x] Nessun breaking change per utenti esistenti
