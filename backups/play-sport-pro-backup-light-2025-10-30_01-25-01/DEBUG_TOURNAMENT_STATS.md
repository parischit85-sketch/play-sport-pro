# 🔍 Debug Logging - Integrazione Statistiche Tornei

## Traccia Completa del Flusso

### **1. Browser Console - Quando Applica Punti**

Quando l'admin preme "Applica Punti" su un torneo, cerca questi log:

```
🎯 [loadTournamentMatchesForStats] Loading matches for tournament <TOURNAMENT_ID>
   ↓ (Carica i match dal torneo)
🎯 [loadTournamentMatchesForStats] Found N matches, M teams
   ↓ (Normalizza i match)
✅ Player <PLAYER_ID>: X matches da salvare in matchDetails
   ↓ (Filtra match per giocatore)
📝 Saving entry for <PLAYER_ID>: matchDetails=X items
   ↓ (Salva l'entry con matchDetails nel database)
```

### **2. Browser Console - Quando Apri Statistiche**

Quando apri il tab "Statistiche Giocatore", cerca questi log:

```
📖 [champEntries useEffect] Subscribing to leaderboard/<PLAYER_ID>/entries
   ↓ (Si iscrive alle entries del leaderboard)
📖 [champEntries] Received N entries
   ↓ (Riceve le entries)
   First entry keys: type, tournamentId, tournamentName, description, points, createdAt, source, matchDetails
   ↓ (Mostra i campi ricevuti)
   First entry matchDetails: X
   ↓ (Mostra quanti match ci sono nel matchDetails)

🏆 [StatisticheGiocatore] champEntries encontrados: N
   ↓ (Combina partite regolari con tornei)
   📋 Entry: tournamentId=<ID>, matchDetails=X
   ✅ Agregando X matches de torneo
   ↓ (Aggiunge i match del torneo)
📊 [StatisticheGiocatore] Total matches: Z (regular: X, torneo: Y)
   ↓ (Conta totale: X regolari + Y tornei = Z)

🎯 [advancedStats] Player <PLAYER_ID>: N matches from total M
   ↓ (Filtra match per giocatore)
```

---

## 📋 Checklist Debug

### Se le Statistiche NON Compaiono

**Step 1: Verifica che Applica Punti Funziona**
- [ ] Apri console quando premi "Applica Punti"
- [ ] Cerca log: `🎯 [loadTournamentMatchesForStats]`
- [ ] Se NON ci sono: Applica Punti non sta caricando i match del torneo
- [ ] Se SÌ: Continua a Step 2

**Step 2: Verifica che matchDetails Viene Salvato**
- [ ] Cerca log: `📝 Saving entry for <PLAYER_ID>: matchDetails=`
- [ ] Se `matchDetails=0`: Nessun match trovato per il giocatore (controlla che il giocatore sia effettivamente nel torneo)
- [ ] Se `matchDetails=X` (X > 0): I match sono stati salvati correttamente, continua a Step 3

**Step 3: Verifica che champEntries Viene Caricato**
- [ ] Apri il tab "Statistiche Giocatore"
- [ ] Apri console
- [ ] Cerca log: `📖 [champEntries] Received N entries`
- [ ] Se `N=0`: Il leaderboard entry non è stato salvato (torna a Step 2)
- [ ] Se `N>0`: Continua a Step 4

**Step 4: Verifica che matchDetails è Presente nell'Entry**
- [ ] Cerca log: `First entry matchDetails: X`
- [ ] Se `X=undefined`: Il campo matchDetails non è stato salvato nel database
- [ ] Se `X=0`: I match non sono stati aggiunti per questo giocatore
- [ ] Se `X>0`: Continua a Step 5

**Step 5: Verifica che allMatchesIncludingTournaments Combina i Dati**
- [ ] Cerca log: `🏆 [StatisticheGiocatore] champEntries encontrados:`
- [ ] Se non ci sono: La funzione useMemo non sta eseguendo
- [ ] Se SÌ: Cerca `📊 [StatisticheGiocatore] Total matches:`
- [ ] Se `regular=0, torneo=0`: Nessuna partita trovata
- [ ] Se `torneo > 0`: Continua a Step 6

**Step 6: Verifica che advancedStats Calcola Correttamente**
- [ ] Cerca log: `🎯 [advancedStats] Player <PLAYER_ID>:`
- [ ] Se non ci sono: advancedStats non sta eseguendo
- [ ] Se `N matches from total M`: M dovrebbe includere sia regular che tournei
- [ ] Se M è corretto: Le statistiche dovrebbero essere visibili UI

---

## 🔧 Analisi Dettagliata per ogni Punto

### Problema: "Applica Punti" non salva i match

**Sintomi**: Log `🎯 [loadTournamentMatchesForStats]` NON appare

**Cause Possibili**:
1. `loadTournamentMatchesForStats()` non viene chiamato
2. Il path delle collezioni è sbagliato
3. Il database non contiene i match del torneo

**Fix**:
- Verifica che `allTournamentMatches` sia caricato
- Controlla il path: `clubs/{clubId}/tournaments/{tournamentId}/matches`
- Verifica che il torneo abbia dei match completati

---

### Problema: "matchDetails è vuoto"

**Sintomi**: Log `matchDetails=0` o `matchDetails=undefined`

**Cause Possibili**:
1. Nessun match trovato per il giocatore nel torneo
2. Il giocatore non è nei team del torneo
3. L'estrazione player ID dal team è sbagliata

**Fix**:
- Verifica che il giocatore sia effettivamente iscritto al torneo
- Controlla i team nel database: il giocatore dovrebbe essere in `team.players[].playerId`
- Verifica che il player ID corrisponda

---

### Problema: "champEntries ricevuti ma vuoti"

**Sintomi**: Log `📖 [champEntries] Received 0 entries`

**Cause Possibili**:
1. Non hai ancora premuto "Applica Punti"
2. L'entry non è stato salvato per questo giocatore
3. L'entry è stato salvato ma non in `leaderboard/{playerId}/entries`

**Fix**:
- Assicurati di aver premuto "Applica Punti"
- Verifica in Firestore: `clubs/{clubId}/leaderboard/{playerId}/entries/tournament_{tournamentId}`
- Se non esiste: Torna al problema "Applica Punti non salva i match"

---

### Problema: "allMatchesIncludingTournaments è vuoto"

**Sintomi**: Log `📊 Total matches: 0 (regular: 0, torneo: 0)`

**Cause Possibili**:
1. `filteredMatches` è vuoto (nessuna partita regolare)
2. `champEntries` non contiene `matchDetails`
3. L'estrazione da `entry.matchDetails` fallisce

**Fix**:
- Controlla che `filteredMatches` abbia partite regolari
- Verifica che `entry.matchDetails` sia presente e sia un array
- Aggiungi log: `console.log('entry:', entry);` per ispezionare

---

### Problema: "advancedStats non calcola correttamente"

**Sintomi**: Stats mostra numeri sbagliati

**Cause Possibili**:
1. I match non hanno il campo `winner` corretto
2. Il player ID non corrisponde (case sensitivity?)
3. I match dal torneo non hanno tutti i campi necessari

**Fix**:
- Verifica che il torneo match abbia: `teamA`, `teamB`, `winner`, `sets`, `setsA`, `setsB`, `gamesA`, `gamesB`
- Controlla che il player ID sia esattamente quello cercato
- Aggiungi log nel ciclo: `console.log('Match:', m, 'isA:', isA, 'won:', won);`

---

## 📊 Esperienza Utente Attesa

### Timeline Corretta

```
1. Admin crea torneo con match
2. Admin preme "Applica Punti"
   └─ Console: 🎯 [loadTournamentMatchesForStats]
   └─ Console: 📝 Saving entry
3. Giocatore apre Statistiche
   └─ Console: 📖 [champEntries] Received N entries
   └─ Console: 🏆 [StatisticheGiocatore] champEntries encontrados
   └─ Console: 📊 Total matches: (regular + torneo)
   └─ Console: 🎯 [advancedStats] Player X: N matches
4. Statistiche mostrano win rate che INCLUDE i match del torneo
```

### Se Qualcosa Non Appare

Traccia la timeline:
- [ ] "Applica Punti" è stato premuto? → Check console
- [ ] Entry è stato salvato? → Check Firestore
- [ ] champEntries ricevuti? → Check console
- [ ] matchDetails è presente? → Check console logs
- [ ] allMatchesIncludingTournaments è combinato? → Check console logs
- [ ] advancedStats ha i match corretti? → Check console logs

---

## 🎯 Come Leggere i Log

### Log della forma: `🆔 [Componente] Messaggio`

Esempio: `📖 [champEntries useEffect] Subscribing to leaderboard/paris-andrea/entries`

- `📖` = Emoji indicatore (aiuta a leggere)
- `[champEntries useEffect]` = Dove viene dal
- `Subscribing to leaderboard/...` = Cosa sta succedendo

### Sequenza di Log Attesa

```
📖 [champEntries useEffect] Subscribing to ...
   ↓ (Aspetta snapshot)
📖 [champEntries] Received X entries
   ↓ (Estrae i dati)
   First entry keys: ...
   First entry matchDetails: X
   ↓ (useMemo si esegue)
🏆 [StatisticheGiocatore] champEntries encontrados: X
   ↓ (Itera su ogni entry)
   📋 Entry: tournamentId=..., matchDetails=X
   ↓ (Aggiunge i match)
   ✅ Agregando X matches de torneo
   ↓ (Combina tutto)
📊 [StatisticheGiocatore] Total matches: Y
   ↓ (useMemo advancedStats si esegue)
🎯 [advancedStats] Player X: N matches from total M
```

Se una riga manca = il flusso si è interrotto in quel punto

---

## 💡 Pro Tips

1. **Filtra console per emoji**: Nelle DevTools, usa Ctrl+F e cerca "🎯" o "📖" per trovare i log velocemente

2. **Timeline**: Se non vedi nessun log di "advancedStats", il problema è prima (champEntries, allMatches)

3. **Numeri**: Se il numero di match non è corretto:
   - Regular match: Dovrebbe corrispondere a quello nello storico
   - Torneo match: Dovrebbe corrispondere a quello in matchDetails
   - Totale: Regular + Torneo

4. **Player ID**: Assicurati che sia consistente. Se un log dice "paris-andrea" e un altro dice "Paris Andrea", il filter fallisce

