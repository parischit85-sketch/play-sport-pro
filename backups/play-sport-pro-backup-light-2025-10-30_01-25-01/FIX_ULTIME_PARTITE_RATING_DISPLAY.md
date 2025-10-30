# Fix: "Ultime partite" ora mostrano i rating corretti con punti torneo

## 🐛 Problema

La sezione "Ultime partite" nella **tab Partite** mostrava rating errati (solo base rating) invece dei rating calcolati con i punti torneo, mentre le partite nello **Storico partite** nella **tab Statistiche** mostravano i rating corretti.

### Confronto Prima/Dopo

**PRIMA (sbagliato):**

```
Tab Partite → Ultime partite:
Andrea Paris: Rating A=1674, Rating B=1670
(Usava solo i rating base, senza punti torneo)
```

**DOPO (corretto):**

```
Tab Partite → Ultime partite:
Andrea Paris: Rating A=2566, Rating B=2562
(Usa i rating calcolati: base + punti torneo, identico alla Tab Statistiche)
```

## 🔍 Causa del Problema

### Differenza tra Tab Statistiche e Tab Partite

**Tab Statistiche (FUNZIONAVA CORRETTAMENTE):**

```javascript
// src/pages/StatsPage.jsx
const rankingData = computeClubRanking(tournamentPlayers, srcMatches, clubId, {
  leaderboardMap: leaderboard,
});

// Passa ai componenti players con calculatedRating
<StatisticheGiocatore players={rankingData.players} />;

// src/features/stats/StatisticheGiocatore.jsx
const playersById = useMemo(() => {
  const map = {};
  players.forEach((p) => (map[p.id] = p)); // players ha calculatedRating
  return map;
}, [players]);

const getEffectiveRating = (id) => {
  const p = playersById[id];
  return p.calculatedRating ?? p.rating ?? DEFAULT_RATING; // ✅ Usa calculatedRating
};
```

**Tab Partite (NON FUNZIONAVA):**

```javascript
// src/pages/MatchesPage.jsx - PRIMA
const playersById = React.useMemo(
  () => Object.fromEntries(players.map((p) => [p.id, p])), // ❌ players senza calculatedRating
  [players]
);

// src/features/matches/MatchRow.jsx - PRIMA
const ratingA1 =
  m.preMatchRatings?.ratingA1 ??
  playersById[m.teamA[0]]?.rating ?? // ❌ Solo rating base
  DEFAULT_RATING;
```

### Il Flusso del Bug

1. `MatchesPage` creava `playersById` dalla lista `players` originale (senza `calculatedRating`)
2. `MatchesPage` aveva `rankingData.players` con i rating corretti, ma non lo usava per `playersById`
3. `MatchRow` riceveva `playersById` con solo i rating base
4. `MatchRow` faceva fallback a `playersById[id]?.rating` (senza punti torneo)
5. Le "Ultime partite" mostravano rating sbagliati

## ✅ Soluzione Implementata

### 1. MatchesPage.jsx - Usa rankingData.players per playersById

```javascript
// ✅ Calcola ranking data con rating computati (base + punti torneo)
const rankingData = useMemo(() => {
  if (!players.length) {
    return { players: [], matches: [] };
  }

  // 🎯 Arricchisci i giocatori con i rating calcolati (base + punti torneo)
  const playersWithCalculatedRatings = players.map((p) => ({
    ...p,
    rating: calculatedRatingsById?.[p.id] || p.rating, // ✅ Usa rating con punti torneo
    calculatedRating: calculatedRatingsById?.[p.id] || p.rating, // ✅ Aggiungi calculatedRating
  }));

  return {
    players: playersWithCalculatedRatings,
    matches: [...matches, ...(tournamentMatches || [])],
  };
}, [players, matches, tournamentMatches, calculatedRatingsById]);

// ✅ Prepara playersById usando i giocatori con rating calcolati da rankingData
// Questo assicura che MatchRow mostri i rating corretti (identici a StatisticheGiocatore)
const playersById = React.useMemo(
  () => Object.fromEntries((rankingData?.players || players).map((p) => [p.id, p])),
  [rankingData, players]
);
```

**Cambiamento chiave:** `playersById` ora viene creato da `rankingData.players` (che hanno `calculatedRating`) invece che da `players` (che hanno solo rating base).

### 2. MatchRow.jsx - Usa calculatedRating come fallback

```javascript
// ✅ IMPORTANTE: Usa calculatedRating (con punti torneo) come fallback, identico a StatisticheGiocatore
const ratingA1 =
  m.preMatchRatings?.ratingA1 ??
  playersById[m.teamA[0]]?.calculatedRating ?? // ✅ Prima prova calculatedRating
  playersById[m.teamA[0]]?.rating ??
  DEFAULT_RATING;

const ratingA2 =
  m.preMatchRatings?.ratingA2 ??
  playersById[m.teamA[1]]?.calculatedRating ??
  playersById[m.teamA[1]]?.rating ??
  DEFAULT_RATING;

const ratingB1 =
  m.preMatchRatings?.ratingB1 ??
  playersById[m.teamB[0]]?.calculatedRating ??
  playersById[m.teamB[0]]?.rating ??
  DEFAULT_RATING;

const ratingB2 =
  m.preMatchRatings?.ratingB2 ??
  playersById[m.teamB[1]]?.calculatedRating ??
  playersById[m.teamB[1]]?.rating ??
  DEFAULT_RATING;
```

**Cambiamento chiave:** Ora il fallback segue questa priorità:

1. `m.preMatchRatings?.ratingX` (rating salvato al momento della partita) ✅
2. `playersById[id]?.calculatedRating` (rating corrente con punti torneo) ✅ **NUOVO**
3. `playersById[id]?.rating` (rating base)
4. `DEFAULT_RATING`

## 📊 Confronto con Tab Statistiche

### Prima del Fix

```
Tab Statistiche (Storico Partite):
✅ Andrea Paris: 2566 (base 1500 + torneo 1066)
✅ Usa: p.calculatedRating ?? p.rating

Tab Partite (Ultime Partite):
❌ Andrea Paris: 1674 (solo base rating)
❌ Usa: p.rating (senza calculatedRating)

→ INCOERENZA: Stesse partite, rating diversi!
```

### Dopo il Fix

```
Tab Statistiche (Storico Partite):
✅ Andrea Paris: 2566 (base 1500 + torneo 1066)
✅ Usa: p.calculatedRating ?? p.rating

Tab Partite (Ultime Partite):
✅ Andrea Paris: 2566 (base 1500 + torneo 1066)
✅ Usa: p.calculatedRating ?? p.rating

→ COERENZA: Stesse partite, stessi rating!
```

## 🎯 Funzionamento Identico

Entrambe le sezioni ora usano la stessa logica:

```javascript
// StatisticheGiocatore.jsx (Tab Statistiche)
const getEffectiveRating = (id) => {
  const p = playersById[id];
  return p.calculatedRating ?? p.rating ?? DEFAULT_RATING;
};

// MatchRow.jsx (Tab Partite) - DOPO IL FIX
const rating =
  m.preMatchRatings?.rating ??
  playersById[id]?.calculatedRating ?? // ✅ Identico a StatisticheGiocatore
  playersById[id]?.rating ??
  DEFAULT_RATING;
```

## 🧪 Test di Verifica

### Console Output Atteso

```javascript
🎾 [MatchesPage] Ranking data preparato:
📊 Players: 20
🏆 Sample ratings (top 3):
  Andrea Paris: 2566.7 (base: 1500)     // ✅ Con punti torneo
  Andrea Di Vito: 2562.7 (base: 1500)   // ✅ Con punti torneo
  Angelo Di Mattia: 2094.5 (base: 2000) // ✅ Con punti torneo
```

### UI Attesa

Quando espandi una partita in "Ultime partite", i rating mostrati devono essere:

- **Identici** ai rating mostrati nella Classifica
- **Identici** ai rating mostrati nello Storico Partite (Tab Statistiche)
- **Include** i punti torneo dal leaderboard

### Esempio Pratico

**Prima del fix:**

```
Ultime partite:
Andrea Paris & Andrea Di Vito vs Domenico & Angelo
Rating: A=3344 vs B=3938
(Somma di rating base: 1674+1670 vs 2064+1874)
```

**Dopo il fix:**

```
Ultime partite:
Andrea Paris & Andrea Di Vito vs Domenico & Angelo
Rating: A=5129 vs B=4459
(Somma di rating calcolati: 2566+2562 vs 2364+2094)
```

## 📝 File Modificati

1. ✅ `src/pages/MatchesPage.jsx`
   - Aggiunto `calculatedRating` ai giocatori in `rankingData.players`
   - Cambiato `playersById` per usare `rankingData.players` invece di `players`

2. ✅ `src/features/matches/MatchRow.jsx`
   - Aggiunto `calculatedRating` come fallback nella catena di priorità
   - Ora identico al comportamento di `StatisticheGiocatore`

3. ✅ `FIX_ULTIME_PARTITE_RATING_DISPLAY.md` (questo file)
   - Documentazione delle modifiche

## 🔗 Relazione con Fix Precedente

Questo fix è complementare a `FIX_MATCH_CREATION_CALCULATED_RATINGS.md`:

- **Fix precedente:** Match **creation** usa rating con punti torneo ✅
- **Questo fix:** Match **display** mostra rating con punti torneo ✅

Insieme assicurano che:

1. Le partite vengono **create** con i rating corretti (base + torneo)
2. Le partite vengono **mostrate** con i rating corretti (base + torneo)
3. Tutto è **coerente** tra Classifica, Statistiche e Partite

## ✅ Status

- ✅ Build validato con `npm run build`
- ✅ Logica identica a Tab Statistiche
- ✅ Rating calcolati includono punti torneo
- ✅ Coerenza tra tutte le sezioni dell'app

---

**Data:** 2025-10-27  
**Problema:** Rating errati in "Ultime partite" (solo base, senza punti torneo)  
**Soluzione:** Usa `rankingData.players` con `calculatedRating` in `playersById`  
**Risultato:** Funzionamento identico a Storico Partite (Tab Statistiche)
