# Debug Sistema Ranking - Guida

## Panoramica

Ho aggiunto log di debug dettagliati per tracciare come viene calcolato e utilizzato il ranking dei giocatori. I log ti aiuteranno a capire:

1. Come viene calcolato il ranking nella **Classifica** (tab Classifica)
2. Come viene calcolato il ranking nel **ClubContext** (usato ovunque nell'app)
3. Come viene recuperato il ranking quando si **creano nuove partite**
4. Come viene salvato lo **snapshot del ranking** nelle partite

## Dove Controllare i Log

Apri la **Console del Browser** (F12 → Console) e osserva i log mentre:

### 1. Visualizzi la Classifica

**File**: `src/pages/ClassificaPage.jsx`

```
🎯 [ClassificaPage] ========== CALCOLO RANKING ==========
📊 Tournament players: X
📊 Regular matches: Y
📊 Tournament matches: Z
📊 Leaderboard entries: N
🏆 [ClassificaPage] Ranking calcolato:
  1. Nome Giocatore: rating=1650, baseRating=1500
  2. Nome Giocatore: rating=1620, baseRating=1520
  ...
==========================================
```

**Cosa cercare:**

- `rating` = ranking finale che vedi in classifica (include punti torneo)
- `baseRating` = rating base del giocatore (senza punti torneo)
- La differenza tra `rating` e `baseRating` sono i punti torneo

### 2. Caricamento ClubContext

**File**: `src/contexts/ClubContext.jsx`

```
🎯 [ClubContext] ========== CALCOLO calculatedRatings ==========
📊 Tournament players: X
📊 Regular matches: Y
📊 Tournament matches: Z
📊 Leaderboard entries: N
🏆 [ClubContext] Calculated ratings (top 5):
  Nome Giocatore 1: 1650
  Nome Giocatore 2: 1620
  ...
========================================================
```

**Cosa cercare:**

- Questi sono i rating calcolati che vengono usati nell'app
- Dovrebbero essere identici a quelli della Classifica
- Questo è il valore che dovrebbe essere salvato come snapshot

### 3. Generazione Partite - Fase 1: Recupero Ranking

**File**: `src/features/tournaments/services/tournamentService.js`

Quando clicchi su "Genera Partite Gironi":

```
🎯 [getCurrentPlayersRanking] ========== INIZIO ==========
📊 ClubId: xxx
📊 TournamentId: yyy
📊 Tournament players found: X
  - Nome Giocatore 1: baseRating=1500
  - Nome Giocatore 2: baseRating=1520
  ...
📊 Regular matches: Y
📊 Tournament matches: Z
📊 Leaderboard entries: N
📊 Combined matches total: Y+Z
🏆 Ranking calculated, total players: X
🏆 Players ranking snapshot (top 5):
  Nome Giocatore 1: 1650
  Nome Giocatore 2: 1620
  ...
========================================================
```

**Cosa cercare:**

- `baseRating` = rating salvato nel profilo giocatore
- `Players ranking snapshot` = il ranking finale calcolato (con punti torneo)
- **IMPORTANTE**: Questi valori dello snapshot dovrebbero essere usati per le partite

### 4. Generazione Partite - Fase 2: Creazione Matches

**File**: `src/features/tournaments/services/matchGenerator.js`

```
🎯 [generateGroupMatches] ========== INIZIO ==========
📊 Players ranking snapshot size: X
📊 Sample rankings:
  player-id-1: 1650
  player-id-2: 1620
  ...

🎮 Generating matches for group: Girone A
  Teams in group: 4

🎯 [generateRoundRobinMatches] Group: Girone A
📊 Teams: 4
📊 Players ranking available: X
  📊 Team "Squadra 1" players: 2
    - Giocatore A: ranking=1650 (snapshot=1650, stored=1500)
    - Giocatore B: ranking=1620 (snapshot=1620, stored=1520)
  🏆 Team average ranking: 1635
  📊 Team "Squadra 2" players: 2
    - Giocatore C: ranking=1580 (snapshot=1580, stored=1550)
    - Giocatore D: ranking=1590 (snapshot=1590, stored=1560)
  🏆 Team average ranking: 1585
  ✅ Match 1: Squadra 1 vs Squadra 2
     Team1 avg: 1635, Team2 avg: 1585

🏆 [generateRoundRobinMatches] Total matches generated: 12
📋 Sample match data: {
  team1Players: [...],
  team1AverageRanking: 1635,
  team2Players: [...],
  team2AverageRanking: 1585
}
```

**Cosa cercare:**

- `snapshot` = il ranking recuperato dallo snapshot (quello calcolato con punti torneo)
- `stored` = il ranking salvato nel team quando si è registrato
- **IMPORTANTE**: Il sistema dovrebbe usare `snapshot` se disponibile, altrimenti `stored`
- `Team average ranking` = la media calcolata usando i valori snapshot

## Interpretazione dei Risultati

### ✅ Tutto Funziona Correttamente Se:

1. Il `rating` in ClassificaPage corrisponde al `calculatedRating` in ClubContext
2. Il `snapshot` in generateRoundRobinMatches corrisponde al `rating` della Classifica
3. Le partite salvano `team1AverageRanking` e `team2AverageRanking` basati sugli snapshot
4. I valori `snapshot` sono DIVERSI da `stored` (se ci sono punti torneo applicati)

### ❌ C'è un Problema Se:

1. `snapshot` è sempre `undefined` → getCurrentPlayersRanking non funziona
2. `snapshot` === `stored` sempre → non sta recuperando i punti torneo
3. `team1AverageRanking` è `null` → problema nel calcolo della media
4. I log di `getCurrentPlayersRanking` non compaiono → la funzione non viene chiamata

## Test Completo - Passo Passo

1. **Vai alla Classifica**
   - Controlla i log di `[ClassificaPage]`
   - Annota il rating di 2-3 giocatori
2. **Vai a un Torneo**
   - Controlla i log di `[ClubContext]`
   - Verifica che i rating siano gli stessi della Classifica

3. **Clicca su "Genera Partite Gironi"**
   - Controlla i log di `[getCurrentPlayersRanking]`
   - Verifica che i "Players ranking snapshot" corrispondano ai rating della Classifica
4. **Osserva la Creazione delle Partite**
   - Controlla i log di `[generateGroupMatches]` e `[generateRoundRobinMatches]`
   - Verifica che:
     - `snapshot` sia popolato per ogni giocatore
     - `snapshot` corrisponda al rating della Classifica
     - `Team average ranking` sia calcolato correttamente

5. **Controlla le Partite Create** (opzionale)
   - Vai su Firebase Console
   - Guarda una partita appena creata
   - Verifica che abbia i campi:
     - `team1Players` con array di `{playerId, playerName, ranking}`
     - `team1AverageRanking` con un numero
     - `team2Players` con array di `{playerId, playerName, ranking}`
     - `team2AverageRanking` con un numero

## Rimozione dei Log (dopo il debug)

Una volta verificato che tutto funziona, puoi rimuovere i `console.log` da:

- `src/pages/ClassificaPage.jsx` (righe ~96-108)
- `src/contexts/ClubContext.jsx` (righe ~670-695)
- `src/features/tournaments/services/tournamentService.js` (righe ~420-490)
- `src/features/tournaments/services/matchGenerator.js` (righe ~31-50, ~119-145, ~205-231)

## Note Importanti

- I log sono **molto dettagliati** per aiutarti a capire esattamente cosa succede
- Se vedi troppi log, filtra la console per cercare solo `🎯` o `🏆`
- I log mostrano anche gli **ID dei giocatori** per aiutarti a tracciare giocatori specifici
