# 🎯 UNIFIED PUBLIC VIEW - DESIGN DOCUMENT

**Data:** 3 Novembre 2025  
**Stato:** READY FOR IMPLEMENTATION  
**Stack:** React 18, Vite, Firebase, Framer Motion, lucide-react

---

## 📋 OVERVIEW

Implementazione di una **vista pubblica unificata** per tornei con:
- ✅ Single link con auto-detection device
- ✅ Responsive layout (portrait → landscape intelligente)
- ✅ Auto-scroll configurabile per girone
- ✅ QR code doppia visualizzazione
- ✅ Scaling dinamico di font e card

---

## 📐 ARCHITETTURA GENERALE

### Route
```javascript
/public/tournament/:clubId/:tournamentId/:token
```

**Single unified link** che rileva:
- Orientamento (portrait vs landscape)
- Dimensioni schermo (mobile, tablet, desktop, TV)
- Comportamento (auto-scroll, navigation, layout)

### Componente Principale
```
UnifiedPublicView.jsx
├── useDeviceOrientation() hook
├── LayoutPortrait.jsx (vertical)
├── LayoutLandscape.jsx (horizontal)
└── Services & Utils
```

---

## 📱 PORTRAIT MODE (Vertical - Smartphone)

### Layout
```
┌─────────────────────────────┐
│ Header                      │
│ Logo | Torneo | LIVE Badge  │
├─────────────────────────────┤
│ Girone A                    │
│ ┌───────────────────────┐   │
│ │ Classifica (6 righe)  │   │
│ └───────────────────────┘   │
├─────────────────────────────┤
│ Partite Girone A            │
│ ┌───────────────────────┐   │
│ │ Match Card 1          │   │
│ │ Match Card 2          │   │
│ │ ...                   │   │
│ │ [Scroll ↓ per più]    │   │
│ └───────────────────────┘   │
├─────────────────────────────┤
│ Navigation                  │
│ ◀ Girone 1/5 ▶             │
│ ● ● ● ○ ○ (swipe-enabled)  │
└─────────────────────────────┘
```

### Comportamento
- **Scroll Verticale:** Scorri partite stesso girone
- **Swipe Orizzontale:** Cambia girone (A → B → C → ... → Tabellone → QR)
- **Navigation Manuale:** Frecce + indicatori cliccabili
- **NO Auto-scroll:** Solo navigazione manuale

### Interazioni
- Touch-enabled: swipe, tap indicatori
- Indicatori cliccabili (direct jump)
- Back button per tornare

---

## 🖥️ LANDSCAPE MODE (Horizontal - Tablet/Desktop/TV)

### Logica di Layout Ibrido

```javascript
// Calcolo densità
const density = (numberOfTeams + numberOfMatches) / 2;

if (density < 4) {
  // CASE A: Poche squadre (3) + poche partite (6)
  layout = 'STACKED'; // Classifica full-width top, Partite full-width bottom
} else {
  // CASE B: Molte squadre (6) + molte partite (15)
  layout = 'HYBRID'; // Classifica left + Partite right/bottom
}
```

### LAYOUT A - STACKED (Poche squadre/partite)
```
┌──────────────────────────────────────────┐
│ Header                                   │
│ Logo | Torneo | LIVE | Progress bar     │
├──────────────────────────────────────────┤
│ Classifica (full-width, top 40%)         │
│ ┌────────────────────────────────────┐   │
│ │ Pos│Team │G│V│P│DG│Pts│RPA        │   │
│ │ 1  │TeamA│1│1│0│+2│ 3 │+1.20      │   │
│ │ 2  │TeamB│1│0│1│-2│ 0 │-1.20      │   │
│ │ 3  │TeamC│1│0│1│-1│ 0 │ 0         │   │
│ └────────────────────────────────────┘   │
├──────────────────────────────────────────┤
│ Partite (full-width, bottom 60%)         │
│ ┌──────────────┬──────────────┐          │
│ │ TeamA 7-5    │ TeamB 5-7    │          │
│ │ TeamC        │ TeamA        │          │
│ └──────────────┴──────────────┘          │
├──────────────────────────────────────────┤
│ Controls (Header Sticky)                 │
│ ⏸ │ ◀ Prev │ [Girone A] [Girone B] ▶ Next│
└──────────────────────────────────────────┘
```

### LAYOUT B - HYBRID (Molte squadre/partite)
```
┌──────────────────────────────────────────┐
│ Header                                   │
│ Logo | Torneo | LIVE | Progress bar      │
├──────────────────┬───────────────────────┤
│ Classifica       │ Partite               │
│ (LEFT 35%)       │ (RIGHT 65%)           │
│ ┌──────────────┐ │ ┌───────────────────┐│
│ │ Pos│Team│Pts│ │ │ Match 1│Match 2    ││
│ │ 1  │A   │15 │ │ │ Match 3│Match 4    ││
│ │ 2  │B   │12 │ │ │ Match 5│Match 6    ││
│ │ 3  │C   │ 9 │ │ │ [Scroll▼ se >6]   ││
│ │ 4  │D   │ 6 │ │ │ Match 7│Match 8    ││
│ │ 5  │E   │ 3 │ │ │ ...               ││
│ │ 6  │F   │ 0 │ │ │                   ││
│ └──────────────┘ │ └───────────────────┘│
├──────────────────┴───────────────────────┤
│ Partite (continuazione se spazio)        │
│ Grid 3 colonne (match sotto classifica)  │
│ [Match 9] [Match 10] [Match 11]          │
├──────────────────────────────────────────┤
│ Controls (Header Sticky)                 │
│ ⏸ │ ◀ Prev │ [Girone A] [Girone B] ▶ Next│
└──────────────────────────────────────────┘
```

### Scaling Dinamico

#### Classifica
```javascript
// Font scaling per classifica
const classificationFontSize = Math.max(0.75, 1 - (numberOfTeams * 0.05));
// 3 squadre → font: 0.85rem (110% normale)
// 6 squadre → font: 0.70rem (70% normale)

// Padding scaling
const cellPadding = Math.max(4, 16 - (numberOfTeams * 2));
```

#### Match Cards
```javascript
// Card sizing
const cardsPerRow = calculateOptimalGrid(numberOfMatches, containerWidth);
// 6 partite  → 2x3 grid, card grandi
// 12 partite → 3x4 grid, card medie
// 15 partite → 3x5 grid, card piccole

// Font scaling
const cardFontSize = Math.max(0.6, 1 - (numberOfMatches * 0.03));
```

#### QR Code Corner
```javascript
// QR code piccolo in corner (portrait + landscape)
// Dimensioni: 80x80px portrait, 120x120px landscape
// Posizione: bottom-right con padding 16px
// Opacità: 0.8 (non invasivo)
```

### Comportamento Auto-Scroll

#### Sequenza di Pagine
```javascript
// Cicla tutte le pagine abilitate dall'admin
pages = [
  { type: 'group', id: 'A', duration: 20 },    // Impostabile
  { type: 'group', id: 'B', duration: 18 },    // Impostabile
  { type: 'group', id: 'C', duration: 25 },    // Impostabile
  { type: 'bracket', duration: 30 },           // Impostabile
  { type: 'qr', duration: 15 },                // Impostabile (pagina dedicata)
];

// Cicla infinitamente, configurabile per singola pagina
```

#### Timing Configurabile
```javascript
// In tournament.publicView.settings.pageIntervals
pageIntervals: {
  'groupA': 20,      // Girone A: 20 secondi
  'groupB': 18,      // Girone B: 18 secondi
  'groupC': 25,      // Girone C: 25 secondi
  'bracket': 30,     // Tabellone: 30 secondi
  'qr': 15,          // QR code: 15 secondi
}

// Admin configura da PublicViewSettings
```

#### Controlli
- **Pause/Play:** Interrompi/riavvia auto-scroll
- **◀ Prev / Next ▶:** Cambio manuale girone
- **Indicatori:** Click per salto diretto
- **Progress Bar:** Mostra countdown (senza timer numerico)

### Header Landscape
```
┌──────────────────────────────────────────┐
│ 🏆 Logo │ Tournament Name │ 🔴 LIVE      │
│ ⏸ Pause │ ◀ Prev │ ● ● ● ● ▶ Next      │
├──────────────────────────────────────────┤
│ ▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░ Progress      │
└──────────────────────────────────────────┘
```

---

## 🖼️ QR CODE - DOPPIA VISUALIZZAZIONE

### Portrait
- **Pagina Separata:** Parte del ciclo di navigazione manuale
- Swipe orizzontale per arrivarci: ... → Girone C → QR → Tabellone → ...

### Landscape
- **Corner Piccolo:** Bottom-right, 120x120px, opacità 0.8
- **Pagina Separata:** Nel ciclo auto-scroll (15 secondi di visibilità)

---

## 🎮 NAVIGAZIONE

### Portrait
```
Verticale:   ↓↑ Scroll (partite stesso girone)
Orizzontale: ← → Swipe / Click frecce (cambia girone)
Indicatori:  ● ○ ○ Click per jump diretto
```

### Landscape
```
Auto-scroll:  ▶ Avanza pagina ogni X secondi
Manuale:      ◀ Prev / Next ▶ (skip auto-scroll)
Pause/Play:   ⏸ Pausa auto-scroll
Indicatori:   ● ○ ○ Click per jump diretto
```

---

## 🔄 DEVICE ROTATION

### Scenario: Utente in landscape con auto-scroll, ruota a portrait

**Comportamento:**
1. Rileva cambio orientamento
2. Interrompe auto-scroll
3. Reset a pagina 1 (Girone A)
4. Passa a layout portrait (manuale)
5. Se utente ruota di nuovo a landscape → riprende auto-scroll da Girone A

**Transizione:** Framer Motion smooth transition tra layout

---

## 🔐 SICUREZZA & VALIDAZIONE

### Token Validation
```javascript
// Validazione all'ingresso
if (!tournament.publicView?.enabled) {
  // Error: Vista pubblica disabilitata
}
if (tournament.publicView?.token !== token) {
  // Error: Token non valido
}
```

### Real-time Listener
```javascript
// Firestore onSnapshot per aggiornamenti live
onSnapshot(doc(db, 'clubs', clubId, 'tournaments', tournamentId), (doc) => {
  // Validazione continua token
  // Aggiornamento dati in tempo reale
});
```

---

## 📊 STRUTTURA DATI FIREBASE

### Tournament Document
```javascript
tournament: {
  id: string,
  name: string,
  clubId: string,
  publicView: {
    enabled: boolean,
    token: string,
    showQRCode: boolean,
    settings: {
      interval: number,  // Global fallback (deprecato)
      pageIntervals: {
        groupA: 20,      // Per singolo girone
        groupB: 18,
        groupC: 25,
        bracket: 30,
        qr: 15,
      },
      displaySettings: {
        groupsMatches: boolean,
        standings: boolean,
        bracket: boolean,
        qr: boolean,
      }
    }
  }
}
```

---

## 🗂️ STRUTTURA FILE

```
src/features/tournaments/components/
├── public/
│   ├── UnifiedPublicView.jsx          (NEW - Main component)
│   ├── LayoutPortrait.jsx              (NEW - Portrait layout)
│   ├── LayoutLandscape.jsx             (NEW - Landscape layout)
│   ├── BracketViewTV.jsx               (NEW - Bracket TV-optimized)
│   ├── PublicTournamentView.jsx        (DEPRECATO)
│   └── PublicTournamentViewTV.jsx      (DEPRECATO)
├── admin/
│   └── PublicViewSettings.jsx          (UPDATE - Add pageIntervals config)
└── services/
    ├── useDeviceOrientation.js         (NEW - Hook)
    ├── useAutoScroll.js                (NEW - Hook)
    └── useResponsiveLayout.js          (NEW - Hook)
```

---

## 🎨 RESPONSIVE BREAKPOINTS

```javascript
const breakpoints = {
  portrait: window.innerWidth < window.innerHeight,
  mobile: Math.max(window.innerWidth, window.innerHeight) < 768,
  tablet: Math.max(window.innerWidth, window.innerHeight) >= 768 && < 1024,
  desktop: Math.max(window.innerWidth, window.innerHeight) >= 1024,
  tv: Math.max(window.innerWidth, window.innerHeight) >= 1920,
};
```

---

## ✅ CHECKLIST IMPLEMENTAZIONE

- [ ] Creare `UnifiedPublicView.jsx` component principale
- [ ] Creare `LayoutPortrait.jsx` con navigazione manuale
- [ ] Creare `LayoutLandscape.jsx` con layout ibrido
- [ ] Implementare `useDeviceOrientation()` hook
- [ ] Implementare `useAutoScroll()` hook
- [ ] Implementare `useResponsiveLayout()` hook
- [ ] Creare `BracketViewTV.jsx` (TV-optimized bracket)
- [ ] Integrare QR code (corner + pagina)
- [ ] Update `PublicViewSettings.jsx` con `pageIntervals`
- [ ] Routing: aggiornare `AppRouter.jsx`
- [ ] Testare portrait/landscape responsività
- [ ] Testare auto-scroll e pause/play
- [ ] Testare device rotation
- [ ] Testing cross-device (mobile, tablet, desktop, TV)

---

## 🚀 FASE IMPLEMENTAZIONE

### Phase 1: Foundation
1. `UnifiedPublicView.jsx` + routing
2. `useDeviceOrientation()` hook
3. Layout base portrait

### Phase 2: Landscape & Layout Ibrido
1. `LayoutLandscape.jsx`
2. `useResponsiveLayout()` hook
3. Scaling dinamico

### Phase 3: Auto-scroll
1. `useAutoScroll()` hook
2. Timer management
3. Pause/Play controls

### Phase 4: Polish & Integrations
1. QR code integration
2. BracketViewTV.jsx
3. PublicViewSettings update
4. Testing & refinement

---

## 🎯 SUCCESS CRITERIA

- ✅ Single link funzionante con auto-detect
- ✅ Portrait mode fluido con swipe navigation
- ✅ Landscape mode con layout ibrido responsive
- ✅ Auto-scroll configurabile per girone
- ✅ QR code in entrambe le visualizzazioni
- ✅ Device rotation handling smooth
- ✅ Font/card scaling automatico e intelligente
- ✅ Performance ottimale (<60fps)
- ✅ Compatible con mobile, tablet, desktop, TV

---

**STATUS: READY FOR DEVELOPMENT** 🟢

Procediamo con Phase 1?
