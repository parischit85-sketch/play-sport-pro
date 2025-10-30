# 👥 SISTEMA GESTIONE UTENTI UNIFICATA - PLAYSPORT PRO

## 📋 PANORAMICA

Il sistema di gestione utenti unificata permette al circolo di:
1. ✅ Creare/caricare utenti locali (anagrafica circolo)
2. ✅ Collegare utenti locali → utenti registrati PlaySport
3. ✅ Gestire un'anagrafica unica condivisa
4. ✅ Configurare partecipazione al campionato con ranking
5. ✅ Distinguere ruoli: utente normale / istruttore / partecipante campionato

---

## 🗂️ STRUTTURA DATI

### 1. Utente Base (User Profile)
```javascript
{
  // Identità
  id: 'userId',
  name: 'Mario Rossi',
  firstName: 'Mario',
  lastName: 'Rossi',
  email: 'mario@example.com',
  phone: '+39 123 456 7890',
  
  // Collegamento account PlaySport
  linkedAccountId: 'firebaseUID', // null se non collegato
  linkedAccountEmail: 'account@playsport.com',
  isAccountLinked: true/false,
  
  // Categoria e ruolo
  category: 'member', // member, guest, vip, non-member, instructor
  role: 'player', // player, instructor, admin
  rating: 1500,
  baseRating: 1500,
  
  // ... altri campi wallet, note, etc
}
```

### 2. Dati Istruttore (Instructor Data)
```javascript
{
  instructorData: {
    isInstructor: false,
    color: '#3B82F6',
    specialties: ['padel', 'tennis'],
    // Prezzi lezioni
    priceSingle: 50,
    priceCouple: 70,
    priceThree: 90,
    priceMatchLesson: 80,
    bio: 'Esperienza di 10 anni...',
    certifications: ['FIT Level 1', 'PTR Professional']
  }
}
```

### 3. Dati Campionato (Tournament Data) ⭐ NUOVO
```javascript
{
  tournamentData: {
    isParticipant: true,          // Partecipa al campionato
    initialRanking: 1500,          // Ranking iniziale settato manualmente
    currentRanking: 1520,          // Ranking attuale (calcolato)
    division: 'A',                 // Divisione/categoria
    
    // Statistiche
    totalMatches: 10,
    wins: 6,
    losses: 4,
    winRate: 60.0,
    points: 30,
    
    // Date e stato
    joinedAt: '2025-10-05T10:00:00Z',
    activeSince: '2025-10-05T10:00:00Z',
    isActive: true,               // Può essere disattivato temporaneamente
    notes: 'Giocatore esperto'
  }
}
```

---

## 🔄 FLUSSI OPERATIVI

### A. Creazione Nuovo Utente Locale

```
1. Admin Club va su "Giocatori" → "Aggiungi Giocatore"
2. Compila form con dati base:
   - Nome, Email, Telefono
   - Categoria (Member, Guest, VIP, etc.)
   - Rating iniziale
3. ✅ Utente creato in `clubs/{clubId}/profiles/`
4. Stato: "Utente locale non collegato"
```

### B. Collegamento a Utente Registrato

```
1. Admin apre dettaglio giocatore locale
2. Click "Collega Account" nella tab "Panoramica"
3. Cerca utente registrato per email/nome
4. Seleziona utente da elenco
5. ✅ Collegamento creato:
   - linkedAccountId = firebaseUID
   - linkedAccountEmail = email registrata
   - isAccountLinked = true
6. ✅ Dati sincronizzati tra profilo locale e account registrato
```

### C. Configurazione Partecipazione Campionato

```
1. Admin apre dettaglio giocatore
2. Va su tab "🏆 Campionato"
3. Abilita "Partecipazione al campionato"
4. Imposta:
   - Ranking iniziale (es. 1500)
   - Divisione/categoria (opzionale)
   - Note
5. ✅ Salva configurazione
6. Risultato:
   - Giocatore appare in Classifica
   - Giocatore appare in Statistiche
   - Giocatore selezionabile in "Crea Partita"
```

### D. Configurazione come Istruttore

```
1. Admin apre dettaglio giocatore
2. Va su "Gestione Lezioni" → "Istruttori"
3. Click "Rendi Istruttore" sul giocatore
4. Configura:
   - Colore identificativo
   - Specialità (Padel, Tennis, etc.)
   - Prezzi per tipo di lezione
   - Bio e certificazioni
5. ✅ Salva
6. Risultato:
   - Istruttore disponibile per prenotazione lezioni
   - Può vedere e modificare sue fasce orarie
```

---

## 📊 TIPOLOGIE UTENTI

### 1. Utente Normale (Solo Prenotazioni)
```javascript
{
  role: 'player',
  instructorData: { isInstructor: false },
  tournamentData: { isParticipant: false }
}
```
**Può:**
- ✅ Prenotare campi
- ✅ Prenotare lezioni
- ❌ Non appare in classifica
- ❌ Non può dare lezioni

### 2. Partecipante Campionato
```javascript
{
  role: 'player',
  instructorData: { isInstructor: false },
  tournamentData: { isParticipant: true, initialRanking: 1500 }
}
```
**Può:**
- ✅ Prenotare campi
- ✅ Prenotare lezioni
- ✅ Appare in classifica
- ✅ Visibile in statistiche
- ✅ Selezionabile per creare partite
- ❌ Non può dare lezioni

### 3. Istruttore (Non Partecipa a Campionato)
```javascript
{
  role: 'player',
  instructorData: { isInstructor: true, priceSingle: 50 },
  tournamentData: { isParticipant: false }
}
```
**Può:**
- ✅ Prenotare campi
- ✅ Dare lezioni
- ✅ Gestire sue fasce orarie
- ❌ Non appare in classifica
- ❌ Non può giocare partite ufficiali

### 4. Istruttore Partecipante (Completo)
```javascript
{
  role: 'player',
  instructorData: { isInstructor: true, priceSingle: 50 },
  tournamentData: { isParticipant: true, initialRanking: 1800 }
}
```
**Può:**
- ✅ Prenotare campi
- ✅ Dare lezioni
- ✅ Gestire sue fasce orarie
- ✅ Appare in classifica
- ✅ Giocare partite ufficiali
- ✅ Visibile in tutte le sezioni

---

## 🎯 DOVE APPAIONO GLI UTENTI

### Classifica (Rankings)
**Requisito:** `tournamentData.isParticipant === true && tournamentData.isActive === true`
```javascript
// Filtro classifica
const rankingPlayers = players.filter(p => 
  p.tournamentData?.isParticipant && 
  p.tournamentData?.isActive
);
```

### Statistiche (Stats)
**Requisito:** `tournamentData.isParticipant === true`
```javascript
// Filtro statistiche
const statsPlayers = players.filter(p => 
  p.tournamentData?.isParticipant
);
```

### Crea Partita (Match Creation)
**Requisito:** `tournamentData.isParticipant === true && tournamentData.isActive === true`
```javascript
// Filtro selezione giocatori per partite
const selectablePlayers = players.filter(p => 
  p.tournamentData?.isParticipant && 
  p.tournamentData?.isActive
);
```

### Prenotazione Lezioni (Lesson Booking)
**Requisito:** Sempre tutti gli utenti attivi
```javascript
// Tutti possono prenotare lezioni
const bookingPlayers = players.filter(p => p.isActive);
```

### Lista Istruttori (Instructors)
**Requisito:** `instructorData.isInstructor === true`
```javascript
// Filtro istruttori
const instructors = players.filter(p => 
  p.instructorData?.isInstructor
);
```

---

## 🔧 IMPLEMENTAZIONE TECNICA

### 1. Schema PlayerTypes (✅ COMPLETATO)
File: `src/features/players/types/playerTypes.js`
- ✅ Aggiunto `tournamentData` a `createPlayerSchema()`
- ✅ Definiti campi per ranking, statistiche, divisione

### 2. Componente Tournament Tab (✅ COMPLETATO)
File: `src/features/players/components/PlayerTournamentTab.jsx`
- ✅ Toggle "Abilita partecipazione"
- ✅ Input ranking iniziale
- ✅ Selezione divisione
- ✅ Gestione stato attivo/inattivo
- ✅ Visualizzazione statistiche
- ✅ Note sulla partecipazione

### 3. Integrazione in PlayerDetails (✅ COMPLETATO)
File: `src/features/players/components/PlayerDetails.jsx`
- ✅ Aggiunta tab "🏆 Campionato"
- ✅ Import `PlayerTournamentTab`
- ✅ Rendering condizionale tab

### 4. Filtri nelle Pagine (⏳ DA IMPLEMENTARE)

#### Classifica (Rankings Page)
```javascript
// In src/pages/Rankings.jsx o simile
const tournamentPlayers = useMemo(() => {
  return players.filter(player => 
    player.tournamentData?.isParticipant === true &&
    player.tournamentData?.isActive === true
  ).sort((a, b) => {
    const rankA = a.tournamentData?.currentRanking || a.tournamentData?.initialRanking || 0;
    const rankB = b.tournamentData?.currentRanking || b.tournamentData?.initialRanking || 0;
    return rankB - rankA; // Ordine decrescente
  });
}, [players]);
```

#### Crea Partita (Match Creation)
```javascript
// In componente selezione giocatori
const availablePlayers = useMemo(() => {
  return players.filter(player => 
    player.tournamentData?.isParticipant === true &&
    player.tournamentData?.isActive === true
  );
}, [players]);
```

#### Statistiche (Stats Page)
```javascript
// In stats calculation
const statsPlayers = players.filter(player => 
  player.tournamentData?.isParticipant === true
);
```

---

## 📝 ESEMPIO PRATICO

### Scenario: Nuovo Giocatore Completo

```javascript
// 1. Admin crea giocatore locale
const newPlayer = {
  name: 'Luca Bianchi',
  firstName: 'Luca',
  lastName: 'Bianchi',
  email: 'luca.bianchi@example.com',
  phone: '+39 333 1234567',
  category: 'member',
  rating: 1600,
  baseRating: 1600
};

// 2. Admin collega ad account registrato
// (fatto tramite UI - cerca e seleziona)
// Risultato:
{
  ...newPlayer,
  linkedAccountId: 'abc123xyz',
  linkedAccountEmail: 'luca@playsport.com',
  isAccountLinked: true
}

// 3. Admin abilita come istruttore
// (fatto tramite UI - Gestione Lezioni > Istruttori)
// Risultato:
{
  ...player,
  instructorData: {
    isInstructor: true,
    color: '#10B981',
    specialties: ['Padel'],
    priceSingle: 45,
    priceCouple: 65,
    bio: 'Istruttore certificato con 5 anni di esperienza'
  }
}

// 4. Admin abilita per campionato
// (fatto tramite UI - Dettaglio Giocatore > Tab Campionato)
// Risultato:
{
  ...player,
  tournamentData: {
    isParticipant: true,
    initialRanking: 1600,
    currentRanking: 1600,
    division: 'A',
    totalMatches: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    points: 0,
    joinedAt: new Date(),
    activeSince: new Date(),
    isActive: true,
    notes: 'Giocatore esperto livello avanzato'
  }
}

// RISULTATO FINALE:
// ✅ Può dare lezioni (è istruttore)
// ✅ Appare in classifica (partecipa a campionato)
// ✅ Account collegato a PlaySport
// ✅ Può prenotare campi e lezioni
// ✅ Statistiche vengono tracciate
```

---

## ⚙️ CONFIGURAZIONI SPECIALI

### Disattivare Temporaneamente dal Campionato
```javascript
// Nella tab Campionato
tournamentData.isActive = false;
// Risultato:
// - Non appare più in classifica
// - Non selezionabile per nuove partite
// - Mantiene storico e statistiche
// - Può essere riattivato in futuro
```

### Cambiare Ranking Manualmente
```javascript
// Utile per correzioni o nuove valutazioni
tournamentData.initialRanking = 1700; // Nuovo valore
// Nota: currentRanking viene aggiornato dal sistema match
```

### Cambiare Divisione
```javascript
tournamentData.division = 'B'; // Da A a B
// Utile per riorganizzare campionati per livello
```

---

## 🚀 PROSSIMI PASSI

### Immediate (Già Completato)
- ✅ Aggiunto `tournamentData` allo schema
- ✅ Creato componente `PlayerTournamentTab`
- ✅ Integrato tab "Campionato" in PlayerDetails

### Da Implementare
1. **Filtri nelle Pagine**
   - [ ] Rankings: filtrare solo partecipanti attivi
   - [ ] Stats: filtrare solo partecipanti
   - [ ] Match Creation: filtrare solo partecipanti attivi

2. **Aggiornamento Automatico Statistiche**
   - [ ] Dopo ogni partita, aggiornare `tournamentData`:
     - `totalMatches++`
     - `wins++` o `losses++`
     - `winRate = (wins / totalMatches) * 100`
     - `currentRanking` (calcolo ELO o sistema custom)
     - `points` in base a vittorie

3. **Import/Export Utenti**
   - [ ] Import CSV con dati base
   - [ ] Export elenco giocatori con statistiche

4. **Dashboard Admin**
   - [ ] Riepilogo: quanti utenti, quanti collegati, quanti partecipanti
   - [ ] Azioni rapide: abilita campionato in massa, etc.

---

## 📚 FILE MODIFICATI

```
✅ src/features/players/types/playerTypes.js
   - Aggiunto tournamentData schema
   
✅ src/features/players/components/PlayerTournamentTab.jsx
   - Nuovo componente per gestione campionato
   
✅ src/features/players/components/PlayerDetails.jsx
   - Aggiunta tab "Campionato"
   - Import PlayerTournamentTab

✅ GESTIONE_UTENTI_UNIFICATA.md
   - Documentazione completa sistema
```

---

## 🎓 NOTE PER GLI SVILUPPATORI

1. **Retrocompatibilità**: Gli utenti esistenti senza `tournamentData` funzionano normalmente
2. **Default Values**: `isParticipant: false` di default per nuovi utenti
3. **Validazione**: Verificare sempre `tournamentData?.isParticipant` prima di filtrare
4. **Performance**: Usare `useMemo` per filtri pesanti su liste grandi
5. **Sync**: Quando si collega account, sincronizzare rating se necessario

---

🎉 **Sistema Gestione Utenti Unificata Implementato!**
