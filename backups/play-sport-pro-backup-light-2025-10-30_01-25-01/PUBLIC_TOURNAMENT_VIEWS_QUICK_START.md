# 🚀 Quick Start Guide - Viste Pubbliche Tornei

## Setup Rapido (5 minuti)

### Step 1: Abilita Vista Pubblica (Admin Panel)

1. Vai alla pagina del torneo nell'area admin
2. Aggiungi il componente `PublicViewSettings` nella tab "Panoramica" o "Impostazioni"
3. Clicca su **"Abilita"** per attivare la vista pubblica
4. Il sistema genera automaticamente un token sicuro

### Step 2: Condividi i Link

Due link vengono generati automaticamente:

**📱 Vista Smartphone:**
```
https://tuo-dominio.com/public/tournament/CLUB_ID/TOURNAMENT_ID/TOKEN
```

**📺 Vista TV:**
```
https://tuo-dominio.com/public/tournament-tv/CLUB_ID/TOURNAMENT_ID/TOKEN
```

### Step 3: Configura Opzioni

- **Intervallo Auto-Scroll:** 10-60 secondi (default: 15s)
- **QR Code:** Abilita/disabilita nella vista smartphone
- **Token:** Rigenera se necessario per sicurezza

---

## Integrazione nel Panel Admin

### Opzione 1: Nella Tab Overview

```jsx
// In TournamentOverview.jsx
import PublicViewSettings from '../admin/PublicViewSettings.jsx';

function TournamentOverview({ tournament, onUpdate, clubId }) {
  return (
    <div className="space-y-6">
      {/* ... existing content ... */}
      
      {/* Public View Settings */}
      <PublicViewSettings 
        tournament={tournament}
        clubId={clubId}
        onUpdate={onUpdate}
      />
    </div>
  );
}
```

### Opzione 2: Come Tab Separata

```jsx
// In TournamentDetailsPage.jsx
const TABS = [
  // ... existing tabs ...
  { id: 'public', label: 'Vista Pubblica', icon: Eye },
];

// Nel render:
{activeTab === 'public' && (
  <PublicViewSettings 
    tournament={tournament}
    clubId={clubId}
    onUpdate={loadTournament}
  />
)}
```

---

## Esempio Completo: Setup da Zero

```javascript
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@lib/firebase';

async function enablePublicView(clubId, tournamentId) {
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  
  await updateDoc(doc(db, 'clubs', clubId, 'tournaments', tournamentId), {
    'publicView.enabled': true,
    'publicView.token': token,
    'publicView.showQRCode': true,
    'publicView.settings.interval': 15000, // 15 secondi
  });
  
  console.log('✅ Vista pubblica abilitata!');
  console.log('📱 Link mobile:', `${window.location.origin}/public/tournament/${clubId}/${tournamentId}/${token}`);
  console.log('📺 Link TV:', `${window.location.origin}/public/tournament-tv/${clubId}/${tournamentId}/${token}`);
}
```

---

## Test Locale

### 1. Crea Torneo di Test

```javascript
// Nella console Firebase o tramite UI
{
  name: "Torneo Test",
  status: "groups_phase",
  publicView: {
    enabled: true,
    token: "abc123xyz789",
    showQRCode: true,
    settings: {
      interval: 15000
    }
  }
}
```

### 2. Aggiungi Gironi e Partite

```javascript
// Crea almeno 2 gironi con partite di test
// Usa il wizard esistente o aggiungi manualmente
```

### 3. Apri le Viste

```
http://localhost:5173/public/tournament/CLUB_ID/TOURNAMENT_ID/abc123xyz789
http://localhost:5173/public/tournament-tv/CLUB_ID/TOURNAMENT_ID/abc123xyz789
```

---

## Troubleshooting

### ❌ "Accesso Negato"

**Problema:** Token non valido o vista pubblica disabilitata

**Soluzione:**
1. Verifica `tournament.publicView.enabled === true`
2. Controlla che il token nell'URL corrisponda a `tournament.publicView.token`
3. Rigenera il token dall'admin panel

### ❌ "Nessun girone disponibile"

**Problema:** Torneo senza gironi o senza partite

**Soluzione:**
1. Crea almeno un girone
2. Assegna squadre ai gironi
3. Genera o aggiungi partite

### ❌ Classifica non si aggiorna

**Problema:** Listener real-time non connesso

**Soluzione:**
1. Controlla la console per errori Firebase
2. Verifica le Firestore Rules
3. Controlla la connessione internet

### ❌ Auto-scroll non funziona

**Problema:** Intervallo non impostato o gironi mancanti

**Soluzione:**
1. Verifica `tournament.publicView.settings.interval` sia un numero > 0
2. Controlla che ci siano almeno 2 gironi

---

## Firestore Rules (Raccomandato)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public tournament views
    match /clubs/{clubId}/tournaments/{tournamentId} {
      allow read: if 
        resource.data.publicView.enabled == true;
        // Token validation happens in the app
    }
    
    // Allow reading teams and matches for public tournaments
    match /clubs/{clubId}/tournaments/{tournamentId}/teams/{teamId} {
      allow read: if 
        get(/databases/$(database)/documents/clubs/$(clubId)/tournaments/$(tournamentId))
          .data.publicView.enabled == true;
    }
    
    match /clubs/{clubId}/tournaments/{tournamentId}/matches/{matchId} {
      allow read: if 
        get(/databases/$(database)/documents/clubs/$(clubId)/tournaments/$(tournamentId))
          .data.publicView.enabled == true;
    }
  }
}
```

---

## Best Practices

### ✅ Sicurezza

1. **Rigenera token regolarmente** se condiviso pubblicamente
2. **Disabilita vista pubblica** al termine del torneo
3. **Usa HTTPS** in produzione (sempre!)

### ✅ Performance

1. **Limita intervallo auto-scroll** a minimo 10 secondi
2. **Testa su device reali** prima del deploy
3. **Monitora utilizzo Firebase** (letture Firestore)

### ✅ UX

1. **Testa navigazione** su mobile e TV
2. **Verifica leggibilità** a distanza (TV)
3. **Controlla animazioni** su device lenti

---

## Esempi d'Uso

### 🏟️ Torneo al Circolo

1. Admin abilita vista pubblica
2. Genera QR code e lo stampa
3. Posiziona il QR all'ingresso
4. I giocatori scansionano e seguono live da smartphone

### 📺 Evento con Proiezione

1. Admin abilita vista TV
2. Apre il link TV su un browser
3. Connette il PC/tablet alla TV o proiettore
4. La vista si auto-aggiorna e auto-scorre tra i gironi

### 📱 Condivisione Social

1. Admin copia il link mobile
2. Lo condivide su WhatsApp/Telegram del torneo
3. I partecipanti seguono senza fare login
4. Visualizzazione in tempo reale delle classifiche

---

## Roadmap Features

### In Sviluppo

- [ ] Temi colore personalizzabili
- [ ] Logo club personalizzato nell'header
- [ ] Filtri gironi specifici
- [ ] Export PDF classifiche
- [ ] Statistiche visualizzazioni

### Completato

- [x] Vista smartphone responsive
- [x] Vista TV ottimizzata
- [x] Auto-scroll configurabile
- [x] Validazione token
- [x] Real-time updates
- [x] QR code generation
- [x] Progress bar animata

---

## Supporto & Feedback

- **Bug?** Apri un issue su GitHub
- **Feature request?** Contatta il team dev
- **Domande?** Controlla la documentazione completa in `PUBLIC_TOURNAMENT_VIEWS_DOCUMENTATION.md`

---

**Happy Sharing! 🎉**
