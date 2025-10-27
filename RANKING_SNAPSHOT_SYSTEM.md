# Sistema di Snapshot del Ranking

## Panoramica

Quando si creano nuove partite di torneo, il sistema ora cattura uno **snapshot del ranking corrente** di ogni giocatore al momento della creazione della partita. Questo ranking include:

- **Rating base** del giocatore
- **Punti torneo** accumulati fino a quel momento (dalla leaderboard)

Questo approccio garantisce che il ranking utilizzato per le partite rifletta la situazione al momento della creazione, senza essere modificato retroattivamente da partite successive.

## Implementazione

### 1. Match Generator (`matchGenerator.js`)

La funzione `generateGroupMatches` ora accetta un parametro `playersRanking`:

```javascript
export async function generateGroupMatches(clubId, tournamentId, groups, options = {}) {
  const {
    playersRanking = {}, // Map of playerId -> current ranking (snapshot)
  } = options;

  // Passa il ranking snapshot alla generazione delle partite
  const groupMatches = generateRoundRobinMatches(group, playersRanking);
}
```

### 2. Round Robin Generator

La funzione `generateRoundRobinMatches` salva lo snapshot del ranking per ogni squadra:

```javascript
function generateRoundRobinMatches(group, playersRanking = {}) {
  // Per ogni partita, salva i giocatori con il loro ranking attuale
  const team1Players = team1.players?.map(p => ({
    playerId: p.playerId,
    playerName: p.playerName,
    ranking: playersRanking[p.playerId] || p.ranking || null, // Snapshot
  })) || [];

  // Salva anche la media del ranking della squadra
  team1AverageRanking: getTeamAverageRanking(team1),
}
```

### 3. Tournament Service (`tournamentService.js`)

Nuova funzione per recuperare il ranking corrente:

```javascript
async function getCurrentPlayersRanking(clubId, tournamentId) {
  // 1. Carica tutti i giocatori partecipanti al torneo
  // 2. Carica tutte le partite (regolari + torneo)
  // 3. Carica la leaderboard per i punti torneo
  // 4. Calcola il ranking usando computeClubRanking
  // 5. Restituisce una mappa playerId -> ranking corrente
}
```

La funzione `generateGroupStageMatches` ora recupera e passa il ranking:

```javascript
export async function generateGroupStageMatches(clubId, tournamentId) {
  // Recupera ranking corrente (snapshot)
  const playersRanking = await getCurrentPlayersRanking(clubId, tournamentId);

  const options = {
    playersRanking, // Passa lo snapshot
  };

  await generateGroupMatches(clubId, tournamentId, groupsWithTeams, options);
}
```

## Struttura Dati Partita

Ogni partita salvata ora contiene:

```javascript
{
  type: 'group',
  groupId: 'group-1',
  team1Id: 'team-abc',
  team1Name: 'Squadra A',
  team1Players: [
    {
      playerId: 'player-1',
      playerName: 'Mario Rossi',
      ranking: 1650  // Snapshot del ranking al momento della creazione
    }
  ],
  team1AverageRanking: 1625,  // Media del ranking della squadra
  team2Id: 'team-def',
  team2Name: 'Squadra B',
  team2Players: [
    {
      playerId: 'player-3',
      playerName: 'Luigi Verdi',
      ranking: 1580
    }
  ],
  team2AverageRanking: 1590,
  // ... altri campi
}
```

## Vantaggi

1. **Storico accurato**: Il ranking salvato nella partita rappresenta la situazione reale al momento della creazione
2. **Nessuna modifica retroattiva**: Le partite già create non vengono modificate quando cambiano i punti torneo
3. **Calcoli corretti**: Formula RPA e altri calcoli possono usare il ranking "freezato" al momento della partita
4. **Tracciabilità**: Possiamo vedere l'evoluzione del ranking di un giocatore nel tempo

## Note Importanti

- **Partite esistenti**: Le partite create prima di questa modifica NON hanno lo snapshot del ranking salvato. Useranno il ranking memorizzato nella squadra al momento della registrazione.
- **Fallback**: Se il sistema di snapshot fallisce, verrà usato il ranking della squadra come fallback (comportamento precedente).
- **Performance**: Il calcolo del ranking viene fatto una sola volta prima di generare tutte le partite, quindi l'impatto sulle performance è minimo.

## File Modificati

1. `src/features/tournaments/services/matchGenerator.js`
   - Aggiunto parametro `playersRanking` a `generateGroupMatches`
   - Modificato `generateRoundRobinMatches` per salvare lo snapshot del ranking

2. `src/features/tournaments/services/tournamentService.js`
   - Aggiunta funzione `getCurrentPlayersRanking`
   - Modificato `generateGroupStageMatches` per recuperare e passare il ranking snapshot
   - Aggiunto import di `computeClubRanking`

## Prossimi Passi

- [ ] Applicare lo stesso sistema alle partite knockout (bracket)
- [ ] Aggiungere visualizzazione dello snapshot del ranking nell'interfaccia delle partite
- [ ] Considerare l'aggiunta di un job batch per aggiornare le partite esistenti con lo snapshot (opzionale)
