# Integrazione Statistiche Tornei - Soluzione Finale

## Panoramica

Le statistiche del giocatore ora includono **sia le partite regolari che quelle dei tornei**, ma NON mostrano le partite di torneo nello storico partite. I dati vengono aggregati e salvati quando si applica il pulsante "Applica Punti".

## Architettura della Soluzione

### 1. **Fase 1: Quando Premi "Applica Punti"**

Quando l'admin preme "Applica Punti" su un torneo:

```
championshipApplyService.applyTournamentChampionshipPoints()
├── Carica i match del torneo con `loadTournamentMatchesForStats()`
│   ├── Legge match collection: clubs/{clubId}/tournaments/{tournamentId}/matches
│   ├── Legge teams: clubs/{clubId}/tournaments/{tournamentId}/teams
│   ├── Normalizza match a formato standard (teamA, teamB, winner, sets, etc)
│   └── Filtra solo match con risultati (winnerId o sets)
│
└── Per ogni giocatore nel torneo:
    └── Crea/Aggiorna: clubs/{clubId}/leaderboard/{playerId}/entries/tournament_{tournamentId}
        ├── type: 'tournament_points'
        ├── points: punti del giocatore
        ├── description: "Torneo: Nome Torneo"
        └── 🆕 matchDetails: [
            {
              matchId,
              teamA: [playerIds],
              teamB: [playerIds],
              winner: 'A' | 'B',
              setsA, setsB, gamesA, gamesB,
              sets: [{a, b}, ...],
              date
            },
            ...
          ]
```

### 2. **Fase 2: Lettura Statistiche (StatisticheGiocatore.jsx)**

Quando il giocatore visualizza le statistiche:

```
StatisticheGiocatore.jsx
├── onSnapshot() → legge champEntries da leaderboard/{playerId}/entries
│   └── Per ogni entry, estrae matchDetails (se exists)
│
├── allMatchesIncludingTournaments = useMemo()
│   ├── Prende filteredMatches (partite regolari con time filter)
│   ├── Estrae match da champEntries[].matchDetails
│   └── Combina in un unico array: [...regulars, ...tourneyMatches]
│
└── advancedStats = useMemo() ← usa allMatchesIncludingTournaments
    ├── Filtra per pid (player ID)
    ├── Calcola: wins, losses, rate, streak, efficiency, etc
    └── Questo INCLUDE sia partite regolari che tornei
```

## Struttura Database

### Before: Leaderboard Entry
```javascript
clubs/{clubId}/leaderboard/{playerId}/entries/tournament_{tournamentId}
{
  type: 'tournament_points',
  tournamentId: 'torneo-1',
  tournamentName: 'Nome Torneo',
  description: 'Torneo: Nome Torneo',
  points: 100,
  createdAt: '2025-10-26T...',
  source: 'championship'
}
```

### After: Leaderboard Entry (Con Match Details)
```javascript
clubs/{clubId}/leaderboard/{playerId}/entries/tournament_{tournamentId}
{
  type: 'tournament_points',
  tournamentId: 'torneo-1',
  tournamentName: 'Nome Torneo',
  description: 'Torneo: Nome Torneo',
  points: 100,
  createdAt: '2025-10-26T...',
  source: 'championship',
  // 🆕 NUOVO
  matchDetails: [
    {
      matchId: 'match-123',
      teamA: ['paris-andrea', 'rossi-marco'],
      teamB: ['bianchi-luca', 'verdi-franco'],
      winner: 'A',
      setsA: 2,
      setsB: 0,
      gamesA: 12,
      gamesB: 8,
      sets: [
        { a: 6, b: 4 },
        { a: 6, b: 4 }
      ],
      date: '2025-10-20T14:30:00Z'
    },
    // ... altri match
  ]
}
```

## Flusso Dati

```
┌─────────────────────────────────────────┐
│ Admin Preme "Applica Punti"             │
└────────────────────┬────────────────────┘
                     │
                     ▼
        ┌──────────────────────────┐
        │ championshipApplyService │
        │  .applyTournamentPoints  │
        └────────┬─────────────────┘
                 │
         ┌───────┴────────┐
         │                │
    ┌────▼─────┐    ┌────▼──────┐
    │ Calcola  │    │ Carica    │
    │ Punti    │    │ Match del │
    │ per      │    │ Torneo    │
    │ Giocatore│    │ (Nuovo!)  │
    └────┬─────┘    └────┬──────┘
         │                │
         └────────┬───────┘
                  │
                  ▼
    ┌──────────────────────────────┐
    │ Salva Entry con matchDetails  │
    │ clubs/{clubId}/leaderboard/   │
    │  {playerId}/entries/...       │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ StatisticheGiocatore legge   │
    │ champEntries + matchDetails   │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ Combina partite regolari +    │
    │ partite torneo               │
    │ (allMatchesIncludingTournaments)
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ Calcola Statistiche          │
    │ - Wins/Losses               │
    │ - Win Rate                  │
    │ - Streaks                   │
    │ - Game Efficiency           │
    │ - etc.                       │
    └──────────────────────────────┘
```

## Vantaggi di questa Soluzione

✅ **Pulizia storico partite**: Le partite di torneo NON compaiono nello storico
✅ **Statistiche accurate**: Includono sia partite regolari che tornei
✅ **Idempotenza**: Se premi "Applica Punti" due volte, il secondo è no-op
✅ **Separazione responsabilità**: 
  - Championship: gestisce i punti
  - Statistics: legge i dati aggregati
✅ **Facilmente revocabile**: Se fai "Undo", cancella tutto inclusi matchDetails
✅ **Performance**: Dati aggregati, non interrogazioni live sui tornei

## Implementazione

### File Modificati

1. **`src/features/tournaments/services/championshipApplyService.js`**
   - ✅ Aggiunte import: `getDocs`, `getMatch`
   - ✅ Aggiunta funzione: `loadTournamentMatchesForStats()`
   - ✅ Modificata: `applyTournamentChampionshipPoints()` per caricare e salvare matchDetails

2. **`src/features/stats/StatisticheGiocatore.jsx`**
   - ✅ Aggiunto useMemo: `allMatchesIncludingTournaments`
   - ✅ Estratti matchDetails da champEntries
   - ✅ Usati in advancedStats per calcoli

### Build Status
✅ Build passato senza errori

## Prossimi Step (Opzionali)

1. **Aggiornare revertTournamentChampionshipPoints**: Assicurarsi che anche matchDetails siano rimossi quando si annulla
2. **UI Feedback**: Mostrare nell'admin che i match sono stati aggregati
3. **Export**: Poter esportare statistiche con dettagli tornei
4. **Analytics**: Tracciare percentuale vittorie per torneo

## Testing Checklist

- [ ] Creare un torneo con alcuni match completati
- [ ] Premere "Applica Punti"
- [ ] Verificare che leaderboard/{playerId}/entries/tournament_X abbia matchDetails
- [ ] Aprire tab "Statistiche Giocatore"
- [ ] Verificare che le statistiche includano le partite del torneo
- [ ] Verificare che lo storico partite NON mostri le partite del torneo
- [ ] Annullare "Applica Punti" e verificare che matchDetails siano rimossi
