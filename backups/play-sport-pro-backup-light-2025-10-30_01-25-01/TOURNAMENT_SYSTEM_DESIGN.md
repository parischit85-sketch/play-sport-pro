# 🏆 Sistema Tornei - Design Completo

**Data**: 21 Ottobre 2025  
**Tipo**: Feature completa multi-fase  
**Priorità**: HIGH  
**Complexity**: VERY HIGH

---

## 📊 EXECUTIVE SUMMARY

Sistema completo per organizzazione e gestione tornei sportivi con:
- Creazione tornei configurabili
- Gestione iscrizioni coppie/squadre
- Fase a gironi con bilanciamento automatico basato su ranking
- Fase ad eliminazione diretta (ottavi, quarti, semifinali, finale)
- Sistema punti flessibile (standard o basato su ranking)
- Dashboard visualizzazione live del torneo

---

## 🎯 REQUISITI FUNZIONALI

### 1. **Configurazione Torneo**
- ✅ Nome torneo
- ✅ Data inizio/fine
- ✅ Tipo partecipanti: Coppie o Squadre
- ✅ Numero massimo coppie/squadre
- ✅ Sport/Disciplina
- ✅ Campi disponibili

### 2. **Gestione Iscrizioni**
- ✅ Iscrizione coppie (2 giocatori)
- ✅ Iscrizione squadre (N giocatori)
- ✅ Validazione iscrizioni (non duplicati)
- ✅ Ranking medio coppia/squadra
- ✅ Stato iscrizione (pending, confirmed, cancelled)

### 3. **Configurazione Fase Gironi**
- ✅ Numero gironi (2-8)
- ✅ Squadre per girone (3-8)
- ✅ Formato partite (set, games, punti)
- ✅ Composizione automatica bilanciata
- ✅ Seed basato su ranking

### 4. **Fase Eliminazione Diretta**
- ✅ Numero qualificati per girone (1-4)
- ✅ Bracket generation automatico
- ✅ Ottavi, Quarti, Semifinali, Finale
- ✅ Gestione bye automatici
- ✅ Posizionamento terzo/quarto posto

### 5. **Sistema Punti**
#### Tipo A: Standard
- Vittoria girone: X punti
- Pareggio girone: Y punti
- Sconfitta girone: Z punti
- Qualificazione ottavi: +A punti
- Qualificazione quarti: +B punti
- Qualificazione semifinali: +C punti
- Finale: +D punti
- Vittoria torneo: +E punti

#### Tipo B: Ranking-Based
- Punti base × Moltiplicatore ranking avversario
- Bonus upset (vittoria vs ranking superiore)
- Scaling progressivo per fase

### 6. **Dashboard Torneo**
- ✅ Overview stato torneo
- ✅ Gironi con classifiche
- ✅ Bracket eliminazione diretta
- ✅ Calendario partite
- ✅ Classifica generale torneo
- ✅ Statistiche partecipanti

---

## 🗂️ DATA MODEL

### Collection: `tournaments`

```typescript
interface Tournament {
  id: string;
  clubId: string;
  
  // Basic Info
  name: string;
  description?: string;
  sport: 'tennis' | 'padel' | 'pickleball' | 'other';
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'draft' | 'registration_open' | 'registration_closed' | 
          'groups_phase' | 'knockout_phase' | 'completed' | 'cancelled';
  
  // Participants Configuration
  participantType: 'couples' | 'teams';
  maxParticipants: number;
  minParticipants: number;
  currentParticipants: number;
  
  // Groups Phase Configuration
  groupsEnabled: boolean;
  numberOfGroups: number; // 2-8
  teamsPerGroup: number; // 3-8
  groupMatchFormat: {
    bestOf: number; // 1, 3, 5
    setsToWin: number;
    gamesPerSet: number;
    tiebreakAt?: number;
  };
  
  // Knockout Phase Configuration
  knockoutEnabled: boolean;
  qualifiedPerGroup: number; // 1-4
  knockoutMatchFormat: {
    bestOf: number;
    setsToWin: number;
    gamesPerSet: number;
    tiebreakAt?: number;
  };
  thirdPlaceMatch: boolean;
  
  // Points System
  pointsSystem: {
    type: 'standard' | 'ranking_based';
    
    // Standard Points
    groupWin?: number;
    groupDraw?: number;
    groupLoss?: number;
    round16Qualification?: number;
    quarterFinalQualification?: number;
    semiFinalQualification?: number;
    finalQualification?: number;
    tournamentWin?: number;
    
    // Ranking-Based Points
    basePoints?: number;
    rankingMultiplier?: boolean;
    upsetBonus?: number; // % bonus for beating higher ranked
    phaseMultipliers?: {
      groups: number;
      round16: number;
      quarters: number;
      semis: number;
      final: number;
    };
  };
  
  // Generated Data
  groups?: TournamentGroup[];
  knockoutBracket?: KnockoutBracket;
  standings?: TournamentStanding[];
  
  // Metadata
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  courtIds?: string[]; // Campi assegnati
}

interface TournamentGroup {
  id: string; // 'A', 'B', 'C'...
  name: string; // 'Gruppo A'
  teams: TournamentTeam[];
  matches: GroupMatch[];
  standings: GroupStanding[];
}

interface TournamentTeam {
  id: string;
  tournamentId: string;
  
  // Team Info
  name: string; // Generated or custom
  type: 'couple' | 'team';
  
  // Players
  playerIds: string[]; // 2 for couples, N for teams
  players: {
    id: string;
    name: string;
    rating?: number;
  }[];
  
  // Ranking
  averageRating: number;
  seed: number; // Position in ranking
  
  // Assignment
  groupId?: string;
  groupPosition?: number; // Position in group
  
  // Status
  status: 'registered' | 'confirmed' | 'withdrawn';
  registeredAt: Timestamp;
  registeredBy: string;
}

interface GroupMatch {
  id: string;
  groupId: string;
  tournamentId: string;
  
  // Teams
  team1Id: string;
  team2Id: string;
  
  // Schedule
  scheduledDate?: Timestamp;
  courtId?: string;
  
  // Result
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  winner?: string; // team1Id or team2Id
  score?: {
    team1Sets: number;
    team2Sets: number;
    sets: SetScore[];
  };
  
  // Points
  pointsAwarded?: {
    team1: number;
    team2: number;
  };
  
  playedAt?: Timestamp;
}

interface SetScore {
  team1Games: number;
  team2Games: number;
  tiebreak?: {
    team1: number;
    team2: number;
  };
}

interface GroupStanding {
  teamId: string;
  groupId: string;
  
  // Stats
  played: number;
  won: number;
  drawn: number;
  lost: number;
  
  // Sets/Games
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  
  // Points
  points: number;
  
  // Ranking
  position: number;
  qualified: boolean;
}

interface KnockoutBracket {
  rounds: KnockoutRound[];
}

interface KnockoutRound {
  name: 'round_of_16' | 'quarter_finals' | 'semi_finals' | 'final' | 'third_place';
  matches: KnockoutMatch[];
}

interface KnockoutMatch {
  id: string;
  tournamentId: string;
  round: string;
  matchNumber: number;
  
  // Teams (null if bye or not determined yet)
  team1Id?: string;
  team2Id?: string;
  team1Source?: string; // "Group A - 1st" or "Match 1 winner"
  team2Source?: string;
  
  // Schedule
  scheduledDate?: Timestamp;
  courtId?: string;
  
  // Result
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'walkover';
  winner?: string;
  score?: {
    team1Sets: number;
    team2Sets: number;
    sets: SetScore[];
  };
  
  // Next Match
  nextMatchId?: string;
  nextMatchPosition?: 'team1' | 'team2';
  
  playedAt?: Timestamp;
}

interface TournamentStanding {
  teamId: string;
  tournamentId: string;
  
  // Overall Stats
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  
  // Points
  totalPoints: number;
  groupPoints: number;
  knockoutPoints: number;
  bonusPoints: number;
  
  // Best Result
  bestRound: string; // 'groups', 'round_of_16', 'quarters', 'semis', 'final', 'winner'
  
  // Ranking
  finalPosition: number;
}
```

---

## 🏗️ ARCHITETTURA COMPONENTI

```
src/features/tournaments/
│
├── TournamentsPage.jsx              # Main page route
│
├── components/
│   ├── TournamentList.jsx           # Lista tornei club
│   ├── TournamentCard.jsx           # Card singolo torneo
│   │
│   ├── creation/
│   │   ├── TournamentWizard.jsx     # Wizard multi-step
│   │   ├── BasicInfoStep.jsx        # Step 1: Info base
│   │   ├── ParticipantsStep.jsx     # Step 2: Config partecipanti
│   │   ├── GroupsConfigStep.jsx     # Step 3: Config gironi
│   │   ├── KnockoutConfigStep.jsx   # Step 4: Config eliminazione
│   │   ├── PointsSystemStep.jsx     # Step 5: Sistema punti
│   │   └── ReviewStep.jsx           # Step 6: Review & create
│   │
│   ├── registration/
│   │   ├── RegistrationPanel.jsx    # Pannello iscrizioni
│   │   ├── TeamRegistrationForm.jsx # Form iscrizione team
│   │   ├── RegisteredTeamsList.jsx  # Lista team iscritti
│   │   └── TeamCard.jsx             # Card singolo team
│   │
│   ├── groups/
│   │   ├── GroupsGenerator.jsx      # UI generazione gironi
│   │   ├── GroupsView.jsx           # Vista gironi generati
│   │   ├── GroupCard.jsx            # Card singolo girone
│   │   ├── GroupStandingsTable.jsx  # Classifica girone
│   │   └── GroupMatchesList.jsx     # Partite girone
│   │
│   ├── knockout/
│   │   ├── BracketView.jsx          # Vista bracket completo
│   │   ├── BracketRound.jsx         # Singolo round
│   │   ├── BracketMatch.jsx         # Singola partita bracket
│   │   └── BracketConnector.jsx     # Linee connessione
│   │
│   ├── matches/
│   │   ├── MatchCard.jsx            # Card partita
│   │   ├── MatchScoreInput.jsx      # Input risultato
│   │   └── MatchScheduler.jsx       # Pianificazione partite
│   │
│   ├── standings/
│   │   ├── TournamentStandings.jsx  # Classifica generale
│   │   └── StandingsTable.jsx       # Tabella classifica
│   │
│   └── dashboard/
│       ├── TournamentDashboard.jsx  # Dashboard completa
│       ├── TournamentHeader.jsx     # Header info torneo
│       ├── TournamentStats.jsx      # Statistiche overview
│       ├── TournamentTimeline.jsx   # Timeline eventi
│       └── TournamentActions.jsx    # Azioni admin
│
├── services/
│   ├── tournamentService.js         # CRUD tornei
│   ├── teamsService.js              # Gestione teams
│   ├── groupsService.js             # Logica gironi
│   ├── knockoutService.js           # Logica eliminazione
│   ├── matchService.js              # Gestione partite
│   ├── pointsService.js             # Calcolo punti
│   └── standingsService.js          # Calcolo classifiche
│
├── algorithms/
│   ├── groupsGenerator.js           # Algoritmo composizione gironi
│   ├── bracketGenerator.js          # Algoritmo bracket
│   ├── seedingAlgorithm.js          # Algoritmo seed
│   └── pointsCalculator.js          # Calcolo punti
│
├── hooks/
│   ├── useTournament.js             # Hook principale torneo
│   ├── useTournamentTeams.js        # Hook teams torneo
│   ├── useTournamentMatches.js      # Hook partite
│   └── useTournamentStandings.js    # Hook classifiche
│
├── types/
│   └── tournamentTypes.js           # TypeScript types
│
└── utils/
    ├── tournamentValidation.js      # Validazioni
    ├── tournamentFormatters.js      # Formatters
    └── tournamentConstants.js       # Costanti
```

---

## 🔄 USER FLOWS

### Flow 1: Creazione Torneo

```
Admin Club Dashboard
  ↓
Tab Tornei
  ↓
[+ Nuovo Torneo]
  ↓
┌─────────────────────────────────────┐
│ Step 1: Informazioni Base          │
│ - Nome torneo                       │
│ - Date inizio/fine                  │
│ - Sport/Disciplina                  │
│ - Descrizione                       │
└─────────────────────────────────────┘
  ↓ [Avanti]
┌─────────────────────────────────────┐
│ Step 2: Partecipanti                │
│ - Tipo: Coppie/Squadre              │
│ - Numero min/max                     │
│ - Formato giocatori                  │
└─────────────────────────────────────┘
  ↓ [Avanti]
┌─────────────────────────────────────┐
│ Step 3: Gironi                      │
│ - Abilita fase gironi               │
│ - Numero gironi (2-8)                │
│ - Squadre per girone (3-8)           │
│ - Formato partite                    │
└─────────────────────────────────────┘
  ↓ [Avanti]
┌─────────────────────────────────────┐
│ Step 4: Eliminazione Diretta        │
│ - Abilita fase knockout             │
│ - Qualificati per girone (1-4)       │
│ - Formato partite                    │
│ - Partita 3°/4° posto                │
└─────────────────────────────────────┘
  ↓ [Avanti]
┌─────────────────────────────────────┐
│ Step 5: Sistema Punti               │
│ - Tipo: Standard / Ranking-based    │
│ - Config punti per fase              │
│ - Moltiplicatori/Bonus              │
└─────────────────────────────────────┘
  ↓ [Avanti]
┌─────────────────────────────────────┐
│ Step 6: Review & Crea               │
│ - Riepilogo configurazione          │
│ - Validazione                        │
│ - [Crea Torneo]                     │
└─────────────────────────────────────┘
  ↓
Torneo Creato (status: draft)
  ↓
[Apri Iscrizioni]
  ↓
Status: registration_open
```

### Flow 2: Iscrizione Teams

```
Dashboard Torneo
  ↓
Tab Iscrizioni
  ↓
[+ Iscri vi Team]
  ↓
┌─────────────────────────────────────┐
│ Form Iscrizione                     │
│ - Seleziona Giocatore 1             │
│ - Seleziona Giocatore 2             │
│ - [Calcola Ranking Medio]           │
│ - Nome Team (auto/custom)           │
│ - [Conferma Iscrizione]             │
└─────────────────────────────────────┘
  ↓
Validazione:
- Giocatori già iscritti?
- Torneo pieno?
- Giocatori validi?
  ↓
Team Registrato
  ↓
Lista Teams aggiornata
```

### Flow 3: Generazione Gironi

```
Dashboard Torneo
  ↓
[Chiudi Iscrizioni]
  ↓
Status: registration_closed
  ↓
Tab Gironi
  ↓
[Genera Gironi]
  ↓
┌─────────────────────────────────────┐
│ Algoritmo Composizione              │
│ 1. Ordina teams per ranking         │
│ 2. Assegna seed (1, 2, 3...)        │
│ 3. Distribuzione bilanciata:        │
│    - Top seeds separati             │
│    - Bilanciamento strength         │
│    - Serpentine distribution        │
│ 4. Genera calendario partite        │
│    - Round robin in ogni girone     │
└─────────────────────────────────────┘
  ↓
Gironi Generati
  ↓
Status: groups_phase
  ↓
Vista Gironi con:
- Composizione
- Calendario
- Classifica (vuota)
```

### Flow 4: Gestione Fase Gironi

```
Tab Gironi
  ↓
Per ogni Partita:
  ↓
[Inserisci Risultato]
  ↓
┌─────────────────────────────────────┐
│ Input Score                         │
│ Set 1: 6 - 4                        │
│ Set 2: 3 - 6                        │
│ Set 3: 7 - 5                        │
│ [Conferma Risultato]                │
└─────────────────────────────────────┘
  ↓
Calcolo automatico:
- Punti partita
- Aggiornamento classifica girone
- Calcolo qualificati
  ↓
Classifica Girone aggiornata
  ↓
Quando tutti i gironi completati:
  ↓
[Qualifica Teams]
  ↓
Estrazione qualificati (1-4 per girone)
  ↓
Status: knockout_phase
```

### Flow 5: Fase Eliminazione Diretta

```
Tab Bracket
  ↓
[Genera Bracket]
  ↓
┌─────────────────────────────────────┐
│ Algoritmo Bracket                   │
│ 1. Calcola numero teams qualificati │
│ 2. Determina struttura:             │
│    - 16 teams: Round of 16          │
│    - 8 teams: Quarter Finals        │
│    - 4 teams: Semi Finals           │
│ 3. Seeding:                         │
│    - 1 vs 16, 2 vs 15, etc.         │
│ 4. Gestione bye se necessario       │
│ 5. Connessioni avanzamento          │
└─────────────────────────────────────┘
  ↓
Bracket Generato
  ↓
Per ogni Turno:
  ↓
Per ogni Partita:
  ↓
[Inserisci Risultato]
  ↓
Avanzamento automatico vincitore
  ↓
Calcolo punti fase
  ↓
Aggiornamento classifica generale
  ↓
Fino a Finale
  ↓
[Completa Torneo]
  ↓
Status: completed
  ↓
Classifica Finale
Statistiche Complete
```

---

## 🧮 ALGORITMI CHIAVE

### Algoritmo 1: Composizione Gironi Bilanciata

```javascript
function generateBalancedGroups(teams, numberOfGroups) {
  // 1. Ordina teams per ranking (decrescente)
  const sortedTeams = teams.sort((a, b) => b.averageRating - a.averageRating);
  
  // 2. Assegna seed
  sortedTeams.forEach((team, index) => {
    team.seed = index + 1;
  });
  
  // 3. Inizializza gironi vuoti
  const groups = Array(numberOfGroups).fill(null).map((_, i) => ({
    id: String.fromCharCode(65 + i), // A, B, C...
    name: `Gruppo ${String.fromCharCode(65 + i)}`,
    teams: [],
    averageRating: 0
  }));
  
  // 4. Distribuzione serpentine
  // Round 1: 1→A, 2→B, 3→C, 4→D
  // Round 2: 8→D, 7→C, 6→B, 5→A (reverse)
  // Round 3: 9→A, 10→B, 11→C, 12→D
  // etc.
  
  let groupIndex = 0;
  let direction = 1; // 1 = forward, -1 = reverse
  
  sortedTeams.forEach((team, index) => {
    groups[groupIndex].teams.push(team);
    team.groupId = groups[groupIndex].id;
    
    // Next group
    groupIndex += direction;
    
    // Change direction at boundaries
    if (groupIndex >= numberOfGroups) {
      groupIndex = numberOfGroups - 1;
      direction = -1;
    } else if (groupIndex < 0) {
      groupIndex = 0;
      direction = 1;
    }
  });
  
  // 5. Calcola rating medio gironi
  groups.forEach(group => {
    const totalRating = group.teams.reduce((sum, team) => sum + team.averageRating, 0);
    group.averageRating = totalRating / group.teams.length;
  });
  
  // 6. Ordina teams in ogni girone per seed
  groups.forEach(group => {
    group.teams.sort((a, b) => a.seed - b.seed);
  });
  
  return groups;
}
```

### Algoritmo 2: Generazione Bracket Eliminazione Diretta

```javascript
function generateKnockoutBracket(qualifiedTeams, format) {
  const totalTeams = qualifiedTeams.length;
  
  // Determina struttura bracket
  const rounds = [];
  let teamsInRound = totalTeams;
  
  while (teamsInRound > 1) {
    const roundName = getRoundName(teamsInRound);
    rounds.push({
      name: roundName,
      matches: [],
      teamsCount: teamsInRound
    });
    teamsInRound = Math.floor(teamsInRound / 2);
  }
  
  // Genera primo round
  const firstRound = rounds[0];
  const matchesCount = totalTeams / 2;
  
  // Seeding classico: 1 vs n, 2 vs n-1, etc.
  for (let i = 0; i < matchesCount; i++) {
    const team1 = qualifiedTeams[i];
    const team2 = qualifiedTeams[totalTeams - 1 - i];
    
    firstRound.matches.push({
      id: `${firstRound.name}_${i + 1}`,
      matchNumber: i + 1,
      round: firstRound.name,
      team1Id: team1?.id,
      team2Id: team2?.id,
      team1Source: team1 ? `${team1.groupId} - ${team1.groupPosition}°` : 'BYE',
      team2Source: team2 ? `${team2.groupId} - ${team2.groupPosition}°` : 'BYE',
      status: 'pending'
    });
  }
  
  // Genera rounds successivi (placeholder)
  for (let r = 1; r < rounds.length; r++) {
    const round = rounds[r];
    const previousRound = rounds[r - 1];
    const matchesCount = round.teamsCount / 2;
    
    for (let i = 0; i < matchesCount; i++) {
      const prevMatch1 = previousRound.matches[i * 2];
      const prevMatch2 = previousRound.matches[i * 2 + 1];
      
      round.matches.push({
        id: `${round.name}_${i + 1}`,
        matchNumber: i + 1,
        round: round.name,
        team1Id: null, // Da determinare
        team2Id: null,
        team1Source: `Vincitore ${prevMatch1.id}`,
        team2Source: `Vincitore ${prevMatch2.id}`,
        status: 'pending',
        dependsOn: [prevMatch1.id, prevMatch2.id]
      });
    }
  }
  
  return { rounds };
}

function getRoundName(teamsCount) {
  switch(teamsCount) {
    case 32: return 'round_of_32';
    case 16: return 'round_of_16';
    case 8: return 'quarter_finals';
    case 4: return 'semi_finals';
    case 2: return 'final';
    default: return `round_of_${teamsCount}`;
  }
}
```

### Algoritmo 3: Calcolo Punti Ranking-Based

```javascript
function calculateRankingBasedPoints(match, tournament) {
  const { team1, team2, winner } = match;
  const { pointsSystem } = tournament;
  const { basePoints, rankingMultiplier, upsetBonus, phaseMultipliers } = pointsSystem;
  
  const loser = winner === team1.id ? team2 : team1;
  const winnerTeam = winner === team1.id ? team1 : team2;
  
  // Base points
  let points = basePoints;
  
  // Ranking multiplier
  if (rankingMultiplier) {
    // Punti proporzionali al ranking avversario
    const rankingDiff = loser.averageRating / winnerTeam.averageRating;
    points *= Math.max(0.5, Math.min(2.0, rankingDiff));
  }
  
  // Upset bonus (battere un avversario più forte)
  if (winnerTeam.averageRating < loser.averageRating) {
    const upsetFactor = (loser.averageRating - winnerTeam.averageRating) / 100;
    points += (points * upsetBonus * upsetFactor);
  }
  
  // Phase multiplier
  const phase = match.round || 'groups';
  const multiplier = phaseMultipliers[phase] || 1;
  points *= multiplier;
  
  return Math.round(points);
}
```

---

## 🎨 UI/UX DESIGN

### Dashboard Torneo - Layout

```
┌─────────────────────────────────────────────────────────────┐
│ 🏆 Torneo Estate 2025                    [⚙️ Impostazioni]  │
│ 📅 15-30 Giugno • 🎾 Padel • 👥 16 Coppie                   │
│ Status: ⏳ Fase Gironi                                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─── Stats ────────────────────────────────────────┐        │
│ │ 16 Teams  │ 4 Gironi  │ 48 Partite  │ 75% Completo│        │
│ └──────────────────────────────────────────────────┘        │
│                                                               │
│ ┌─── Tabs ─────────────────────────────────────────┐        │
│ │ [Panoramica] [Iscrizioni] [Gironi] [Bracket]     │        │
│ │ [Partite] [Classifiche] [Statistiche]             │        │
│ └──────────────────────────────────────────────────┘        │
│                                                               │
│ Content Area (Tab-specific)                                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Tab Gironi - Layout

```
┌── Gruppo A ──────────────────┐ ┌── Gruppo B ──────────────────┐
│ 1. Rossi/Bianchi    (2.3) ✓ │ │ 1. Verdi/Gialli     (2.4) ✓ │
│ 2. Neri/Blu         (2.1) ✓ │ │ 2. Rosa/Viola       (2.2) ✓ │
│ 3. Grigi/Marroni    (1.9)   │ │ 3. Arancio/Azzurro  (2.0)   │
│ 4. Oro/Argento      (1.7)   │ │ 4. Verde/Bianco     (1.8)   │
│                               │ │                               │
│ ┌─ Classifica ─────────────┐ │ │ ┌─ Classifica ─────────────┐ │
│ │ Pos Team        P  V  S  │ │ │ │ Pos Team        P  V  S  │ │
│ │ 1.  Rossi/B.    6  3  0  │ │ │ │ 1.  Verdi/G.    6  3  0  │ │
│ │ 2.  Neri/Blu    4  2  1 ✓│ │ │ │ 2.  Rosa/Vio.   4  2  1 ✓│ │
│ │ 3.  Grigi/M.    2  1  2  │ │ │ │ 3.  Arancio/A.  2  1  2  │ │
│ │ 4.  Oro/Arg.    0  0  3  │ │ │ │ 4.  Verde/B.    0  0  3  │ │
│ └──────────────────────────┘ │ │ └──────────────────────────┘ │
│                               │ │                               │
│ ┌─ Prossima Partita ───────┐ │ │ ┌─ Prossima Partita ───────┐ │
│ │ Grigi/M. vs Oro/Arg.     │ │ │ │ Arancio/A. vs Verde/B.   │ │
│ │ 📅 24 Giu • 18:00 • C1   │ │ │ │ 📅 24 Giu • 19:00 • C2   │ │
│ │ [📝 Inserisci Risultato] │ │ │ │ [📝 Inserisci Risultato] │ │
│ └──────────────────────────┘ │ │ └──────────────────────────┘ │
└──────────────────────────────┘ └──────────────────────────────┘
```

### Tab Bracket - Layout

```
                OTTAVI          QUARTI         SEMIFINALI      FINALE
                
1. Rossi/B.  ┐
             ├──> Rossi/B.  ┐
8. Verde/B.  ┘              │
                            ├──> Rossi/B.  ┐
4. Rosa/V.   ┐              │              │
             ├──> Rosa/V.   ┘              │
5. Neri/B.   ┘                             ├──> Rossi/B.  ┐
                                           │              │
3. Verdi/G.  ┐                             │              │
             ├──> Verdi/G.  ┐              │              │
6. Arancio/A.┘              │              │              │
                            ├──> Verdi/G.  ┘              ├──> 🏆
2. Gialli/R. ┐              │                             │
             ├──> Gialli/R. ┘                             │
7. Grigi/M.  ┘                                            │
                                                          │
                                           [Mirror]       ┘

[⬇️ Aggiorna Risultati]  [📅 Pianifica Partite]  [📊 Statistiche]
```

---

## 📝 PLAN D'AZIONE DETTAGLIATO

### FASE 1: Foundation (2-3 ore)
1. ✅ Creare struttura cartelle
2. ✅ Definire types TypeScript completi
3. ✅ Setup costanti e utilities
4. ✅ Creare schema Firestore collections

### FASE 2: Services Layer (3-4 ore)
5. ✅ Tournament CRUD service
6. ✅ Teams registration service
7. ✅ Groups generation service
8. ✅ Knockout bracket service
9. ✅ Match management service
10. ✅ Points calculation service

### FASE 3: Algoritmi Core (2-3 ore)
11. ✅ Algoritmo composizione gironi
12. ✅ Algoritmo generazione bracket
13. ✅ Algoritmo seeding
14. ✅ Algoritmo calcolo punti

### FASE 4: UI Components Base (3-4 ore)
15. ✅ TournamentsPage main layout
16. ✅ TournamentList + TournamentCard
17. ✅ TournamentWizard multi-step
18. ✅ Tutti gli step wizard (1-6)

### FASE 5: Registration System (2-3 ore)
19. ✅ RegistrationPanel
20. ✅ TeamRegistrationForm
21. ✅ RegisteredTeamsList
22. ✅ Validazione e gestione errori

### FASE 6: Groups System (3-4 ore)
23. ✅ GroupsGenerator UI
24. ✅ GroupsView display
25. ✅ GroupCard component
26. ✅ GroupStandingsTable
27. ✅ GroupMatchesList
28. ✅ Match score input

### FASE 7: Knockout System (3-4 ore)
29. ✅ BracketView component
30. ✅ BracketRound display
31. ✅ BracketMatch component
32. ✅ Bracket connectors SVG
33. ✅ Advancement logic

### FASE 8: Dashboard & Integration (2-3 ore)
34. ✅ TournamentDashboard complete
35. ✅ TournamentStandings
36. ✅ Statistics views
37. ✅ Timeline events
38. ✅ Admin actions panel

### FASE 9: Testing & Refinement (2-3 ore)
39. ✅ Test complete flow
40. ✅ Bug fixes
41. ✅ Performance optimization
42. ✅ Mobile responsive
43. ✅ Documentazione

---

## 🚀 INIZIO IMPLEMENTAZIONE

Procedo con l'implementazione completa seguendo il piano.

**Tempo stimato totale: 20-25 ore**  
**Modalità: Continua senza fermarsi**

Inizio dalla FASE 1...
