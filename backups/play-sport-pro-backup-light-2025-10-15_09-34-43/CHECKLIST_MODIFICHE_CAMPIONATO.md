# ✅ CHECKLIST MODIFICHE - SISTEMA PARTECIPAZIONE CAMPIONATO

## 📊 ANALISI SITUAZIONE ATTUALE

### ✅ Già Implementato
- [x] Schema `tournamentData` in `playerTypes.js`
- [x] Componente `PlayerTournamentTab.jsx` per gestione partecipazione
- [x] Tab "🏆 Campionato" integrata in `PlayerDetails.jsx`
- [x] Possibilità di abilitare/disabilitare partecipazione giocatore
- [x] Impostazione ranking iniziale manuale
- [x] Selezione divisione/categoria

### ❌ Da Implementare (PROBLEMA PRINCIPALE)
**Attualmente TUTTI gli utenti/giocatori appaiono in:**
1. **Classifica** (`ClassificaPage.jsx`, `Classifica.jsx`)
2. **Statistiche** (`StatsPage.jsx`, `StatisticheGiocatore.jsx`)
3. **Crea Partite** (`CreaPartita.jsx`)

**Obiettivo:** Solo i giocatori con `tournamentData.isParticipant === true` e `tournamentData.isActive === true` devono apparire in queste sezioni.

---

## 🎯 MODIFICHE DA FARE

### 1. CLASSIFICA - Filtrare solo partecipanti attivi

#### File: `src/pages/ClassificaPage.jsx`

**Linea ~24-28:**
```javascript
// PRIMA (tutti i giocatori)
const rankingData = React.useMemo(() => {
  if (!clubId) return { players: [], matches: [] };
  const srcPlayers = playersLoaded ? players : [];
  const srcMatches = matchesLoaded ? matches : [];
  return computeClubRanking(srcPlayers, srcMatches, clubId);
}, [clubId, players, playersLoaded, matches, matchesLoaded]);
```

**DOPO (solo partecipanti campionato):**
```javascript
const rankingData = React.useMemo(() => {
  if (!clubId) return { players: [], matches: [] };
  const srcPlayers = playersLoaded ? players : [];
  const srcMatches = matchesLoaded ? matches : [];
  
  // 🎯 FILTRO: Solo giocatori che partecipano al campionato
  const tournamentPlayers = srcPlayers.filter(player => 
    player.tournamentData?.isParticipant === true &&
    player.tournamentData?.isActive === true
  );
  
  return computeClubRanking(tournamentPlayers, srcMatches, clubId);
}, [clubId, players, playersLoaded, matches, matchesLoaded]);
```

**Impatto:**
- ✅ La classifica mostrerà solo i partecipanti attivi
- ✅ I giocatori non partecipanti non appariranno nella tabella
- ✅ I grafici di evoluzione ranking mostreranno solo i partecipanti

---

### 2. STATISTICHE - Filtrare solo partecipanti

#### File: `src/pages/StatsPage.jsx`

**Linea ~24-30:**
```javascript
// PRIMA (tutti i giocatori)
const rankingData = React.useMemo(() => {
  if (!clubId) return { players: [], matches: [] };
  const srcPlayers = playersLoaded ? players : [];
  const srcMatches = matchesLoaded ? matches : [];
  return computeClubRanking(srcPlayers, srcMatches, clubId);
}, [clubId, players, playersLoaded, matches, matchesLoaded]);
```

**DOPO (solo partecipanti):**
```javascript
const rankingData = React.useMemo(() => {
  if (!clubId) return { players: [], matches: [] };
  const srcPlayers = playersLoaded ? players : [];
  const srcMatches = matchesLoaded ? matches : [];
  
  // 🎯 FILTRO: Solo giocatori che partecipano al campionato
  const tournamentPlayers = srcPlayers.filter(player => 
    player.tournamentData?.isParticipant === true &&
    player.tournamentData?.isActive === true
  );
  
  return computeClubRanking(tournamentPlayers, srcMatches, clubId);
}, [clubId, players, playersLoaded, matches, matchesLoaded]);
```

**Nota Importante:**
- Il dropdown di selezione giocatore mostrerà solo partecipanti
- Se un giocatore viene disabilitato, non apparirà più nelle statistiche
- Le statistiche si riferiranno solo a partite tra partecipanti

---

### 3. CREA PARTITE - Selezionare solo partecipanti

#### File: `src/features/crea/CreaPartita.jsx`

**Trova dove viene creato `playersAlpha`** (circa linea 50-80):
```javascript
// PRIMA (tutti i giocatori)
const playersAlpha = useMemo(() => {
  return [...currentPlayers].sort(byPlayerFirstAlpha);
}, [currentPlayers]);
```

**DOPO (solo partecipanti):**
```javascript
const playersAlpha = useMemo(() => {
  // 🎯 FILTRO: Solo giocatori che partecipano al campionato e sono attivi
  const tournamentPlayers = currentPlayers.filter(player => 
    player.tournamentData?.isParticipant === true &&
    player.tournamentData?.isActive === true
  );
  
  return [...tournamentPlayers].sort(byPlayerFirstAlpha);
}, [currentPlayers]);
```

**Impatto:**
- ✅ I dropdown di selezione giocatori mostreranno solo partecipanti attivi
- ✅ Non si potranno creare partite con giocatori non partecipanti
- ✅ Le partite ufficiali saranno solo tra giocatori del campionato

---

### 4. COMPONENTE CLASSIFICA - Validazione Extra (Opzionale ma Consigliato)

#### File: `src/features/classifica/Classifica.jsx`

**Cerca il calcolo di `rows`** (circa linea 100-200):
```javascript
const rows = useMemo(() => {
  const ret = [];
  for (const p of players) {
    // ... calcoli statistiche
    ret.push({
      id: p.id,
      name: p.name,
      rating: p.rating,
      // ...
    });
  }
  return ret.sort((a, b) => b.rating - a.rating);
}, [players, matches]);
```

**AGGIUNGERE validazione doppia sicurezza (già filtrato in ClassificaPage, ma per sicurezza):**
```javascript
const rows = useMemo(() => {
  const ret = [];
  for (const p of players) {
    // 🎯 Doppia validazione: assicurati che sia partecipante
    if (p.tournamentData?.isParticipant !== true || p.tournamentData?.isActive !== true) {
      continue; // Salta giocatori non partecipanti
    }
    
    // ... resto del codice invariato
    ret.push({
      id: p.id,
      name: p.name,
      rating: p.rating,
      // ...
    });
  }
  return ret.sort((a, b) => b.rating - a.rating);
}, [players, matches]);
```

---

### 5. STATISTICHE GIOCATORE - Validazione Selezione (Opzionale)

#### File: `src/features/stats/StatisticheGiocatore.jsx`

**Nel dropdown di selezione giocatore** (circa linea 700-800):
```javascript
// Cercare dove viene renderizzato il select dei giocatori
<select
  value={selectedPlayerId}
  onChange={(e) => onSelectPlayer(e.target.value)}
  className={`...`}
>
  <option value="">Seleziona un giocatore</option>
  {playersAlpha.map((p) => (
    <option key={p.id} value={p.id}>
      {p.name}
    </option>
  ))}
</select>
```

**MODIFICARE playersAlpha se necessario:**
```javascript
// Se playersAlpha non è già filtrato, filtrarlo qui
const tournamentPlayersAlpha = useMemo(() => {
  return playersAlpha.filter(player => 
    player.tournamentData?.isParticipant === true &&
    player.tournamentData?.isActive === true
  );
}, [playersAlpha]);

// Poi usare tournamentPlayersAlpha nel select
```

---

## 🔍 FILE DA MODIFICARE - RIEPILOGO

```
✅ OBBLIGATORI (Risolvono il problema):

1. src/pages/ClassificaPage.jsx
   - Linea ~24-28: Aggiungere filtro tournamentPlayers
   
2. src/pages/StatsPage.jsx
   - Linea ~24-30: Aggiungere filtro tournamentPlayers
   
3. src/features/crea/CreaPartita.jsx
   - Linea ~50-80: Filtrare playersAlpha per partecipanti

⚠️ CONSIGLIATI (Sicurezza extra):

4. src/features/classifica/Classifica.jsx
   - Aggiungere validazione nel calcolo rows
   
5. src/features/stats/StatisticheGiocatore.jsx
   - Filtrare playersAlpha se non già filtrato dal parent
```

---

## 🧪 COME TESTARE

### Test 1: Giocatore NON Partecipante
1. Vai su **Giocatori** → Seleziona un giocatore
2. Tab **Campionato** → **NON** abilitare "Partecipazione al campionato"
3. Salva
4. ✅ Vai su **Classifica** → Il giocatore NON deve apparire
5. ✅ Vai su **Statistiche** → Il giocatore NON deve apparire nel dropdown
6. ✅ Vai su **Crea Partita** → Il giocatore NON deve apparire nei dropdown

### Test 2: Giocatore Partecipante Attivo
1. Vai su **Giocatori** → Seleziona un giocatore
2. Tab **Campionato** → Abilita "Partecipazione al campionato"
3. Imposta ranking iniziale (es. 1500)
4. Assicurati che "Partecipazione attiva" sia abilitata
5. Salva
6. ✅ Vai su **Classifica** → Il giocatore DEVE apparire
7. ✅ Vai su **Statistiche** → Il giocatore DEVE apparire nel dropdown
8. ✅ Vai su **Crea Partita** → Il giocatore DEVE apparire nei dropdown

### Test 3: Giocatore Partecipante ma Disattivato
1. Vai su **Giocatori** → Seleziona un giocatore partecipante
2. Tab **Campionato** → Disabilita "Partecipazione attiva"
3. Salva
4. ✅ Vai su **Classifica** → Il giocatore NON deve apparire (temporaneamente disattivo)
5. ✅ Vai su **Statistiche** → Il giocatore NON deve apparire
6. ✅ Vai su **Crea Partita** → Il giocatore NON deve apparire

### Test 4: Istruttore che Partecipa al Campionato
1. Crea un istruttore tramite **Gestione Lezioni** → **Istruttori**
2. Vai su **Giocatori** → Seleziona l'istruttore
3. Tab **Campionato** → Abilita partecipazione
4. Salva
5. ✅ L'istruttore DEVE apparire in Classifica/Stats/Crea Partita
6. ✅ Può continuare a dare lezioni (indipendente dalla partecipazione)

---

## 📝 NOTE IMPORTANTI

### Retrocompatibilità
- Giocatori esistenti senza `tournamentData` saranno considerati **NON partecipanti**
- Default: `tournamentData.isParticipant = false`
- Nessun dato verrà perso, solo nascosto dalle tab campionato

### Logica di Filtraggio
```javascript
// Condizione per essere VISIBILE in Classifica/Stats/Crea Partita:
player.tournamentData?.isParticipant === true 
  && 
player.tournamentData?.isActive === true

// Condizione per essere NASCOSTO:
!player.tournamentData                          // Non ha tournamentData
  || 
player.tournamentData.isParticipant !== true    // Non partecipa
  ||
player.tournamentData.isActive !== true         // Disattivato temporaneamente
```

### Performance
- Filtrare array di giocatori ha impatto minimo (< 100 giocatori)
- Usare `useMemo` per evitare ricalcoli inutili
- I match non vengono filtrati, solo i giocatori

### Migrazione Dati Esistenti
**Scenario 1: Tutti i giocatori attuali devono partecipare**
```javascript
// Script da eseguire una tantum (se necessario)
players.forEach(player => {
  if (!player.tournamentData) {
    updatePlayer(player.id, {
      tournamentData: {
        isParticipant: true,
        initialRanking: player.rating || 1500,
        currentRanking: player.rating || 1500,
        isActive: true,
        // ... resto default
      }
    });
  }
});
```

**Scenario 2: Solo alcuni giocatori partecipano (manualmente)**
- Andare su ogni giocatore
- Abilitare manualmente dalla tab Campionato
- Impostare ranking iniziale

---

## 🚀 PIANO DI IMPLEMENTAZIONE

### Fase 1: Modifiche Core (15 minuti)
1. ✅ Modifica `ClassificaPage.jsx` - Filtro partecipanti
2. ✅ Modifica `StatsPage.jsx` - Filtro partecipanti
3. ✅ Modifica `CreaPartita.jsx` - Filtro selezione giocatori

### Fase 2: Test Funzionali (10 minuti)
1. ✅ Test giocatore NON partecipante
2. ✅ Test giocatore partecipante attivo
3. ✅ Test giocatore partecipante disattivato
4. ✅ Test istruttore partecipante

### Fase 3: Validazioni Extra (Opzionale, 5 minuti)
1. ✅ Aggiungi doppia validazione in `Classifica.jsx`
2. ✅ Aggiungi filtro in `StatisticheGiocatore.jsx`

### Fase 4: Migrazione Dati (Se Necessario)
1. ⚠️ Decidi strategia: tutti partecipano o selezione manuale
2. ⚠️ Esegui script di migrazione o configura manualmente

---

## 🎓 CODICE DI ESEMPIO - FILTRO RIUTILIZZABILE

**Utility Function (opzionale, per riusabilità):**

```javascript
// In src/lib/tournament-utils.js (nuovo file)

/**
 * Filtra giocatori che partecipano attivamente al campionato
 * @param {Array} players - Array di giocatori
 * @returns {Array} - Array filtrato solo partecipanti attivi
 */
export function filterTournamentPlayers(players) {
  return (players || []).filter(player => 
    player.tournamentData?.isParticipant === true &&
    player.tournamentData?.isActive === true
  );
}

/**
 * Verifica se un giocatore partecipa al campionato
 * @param {Object} player - Oggetto giocatore
 * @returns {boolean}
 */
export function isTournamentPlayer(player) {
  return player?.tournamentData?.isParticipant === true &&
         player?.tournamentData?.isActive === true;
}
```

**Uso:**
```javascript
import { filterTournamentPlayers } from '@lib/tournament-utils.js';

// In ClassificaPage.jsx
const tournamentPlayers = filterTournamentPlayers(srcPlayers);

// In CreaPartita.jsx
const playersAlpha = useMemo(() => {
  return [...filterTournamentPlayers(currentPlayers)].sort(byPlayerFirstAlpha);
}, [currentPlayers]);
```

---

## ✅ CHECKLIST FINALE

Prima di considerare completo:

- [ ] **ClassificaPage.jsx** - Filtro implementato
- [ ] **StatsPage.jsx** - Filtro implementato
- [ ] **CreaPartita.jsx** - Filtro implementato
- [ ] Test: Giocatore NON partecipante non appare
- [ ] Test: Giocatore partecipante attivo appare
- [ ] Test: Giocatore disattivato non appare
- [ ] Test: Istruttore partecipante funziona correttamente
- [ ] Documentazione aggiornata
- [ ] Commit e push modifiche

---

🎯 **PRONTO PER IMPLEMENTARE!**

Procediamo con le modifiche?
