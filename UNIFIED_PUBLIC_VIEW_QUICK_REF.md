# 📊 UNIFIED PUBLIC VIEW - QUICK REFERENCE

## COMPARISON TABLE

| Aspetto | Portrait Mode | Landscape Mode |
|---|---|---|
| **Link** | `/public/tournament/:clubId/:tournamentId/:token` | SAME |
| **Orientamento** | Verticale (smartphone) | Orizzontale (tablet/desktop/TV) |
| **Layout Classifica** | Full-width top | Left (35%) O full-width top se poche squadre |
| **Layout Partite** | 1 colonna + scroll | Grid (2-5 colonne) + scroll se necessario |
| **Scroll Verticale** | ✅ Manuale (partite) | ✅ Auto (se partite > 6) |
| **Scroll Orizzontale** | ✅ Swipe (gironi) | ❌ No swipe |
| **Auto-scroll Gironi** | ❌ NO | ✅ YES (20-30s per girone) |
| **Font Scaling** | Responsive (1rem base) | Dynamic calc (0.6-1.1rem) |
| **Card Size** | Piccole (responsive) | Dinamiche (density-based) |
| **QR Code** | Pagina separata | Corner piccolo (120x120) + Pagina |
| **Navigation** | Manual (swipe + frecce) | Auto-scroll + Manual override |
| **Controls** | Indicatori + frecce | Header sticky (Pause/Play + Jump) |
| **Progress Bar** | ❌ NO | ✅ YES (senza timer) |
| **Header** | Compatto (logo + nome) | Sticky (logo + nome + live + progress) |

---

## LAYOUT IBRIDO DECISION TREE

```
numberOfTeams + numberOfMatches < 9?
├─ YES → LAYOUT STACKED (classifica top, partite bottom full-width)
└─ NO → LAYOUT HYBRID (classifica left 35%, partite right 65% + under)
```

---

## AUTO-SCROLL SEQUENCE

```
[Girone A: 20s] → 
[Girone B: 18s] → 
[Girone C: 25s] → 
[Tabellone: 30s] → 
[QR Page: 15s] → 
[Loop back to Girone A]
```

*Timing configurabile per ogni pagina dall'admin*

---

## DEVICE ROTATION FLOW

```
┌─────────────────┐
│ Landscape View  │
│ Auto-scroll ON  │
└────────┬────────┘
         │ [User rotates to portrait]
         ▼
┌─────────────────┐
│ ❌ Stop auto-scroll
│ ✅ Show portrait layout
│ ✅ Reset to Girone A
│ ✅ Manual navigation
└────────┬────────┘
         │ [User rotates back to landscape]
         ▼
┌─────────────────┐
│ ✅ Resume auto-scroll
│ ✅ Start from Girone A
│ ✅ Show landscape layout
└─────────────────┘
```

---

## RESPONSIVE BREAKPOINTS

| Range | Device | Layout | Auto-scroll |
|---|---|---|---|
| < 768px | Mobile | Portrait | ❌ |
| 768-1024px | Tablet | Landscape | ✅ (Smart) |
| > 1024px | Desktop | Landscape | ✅ |
| > 1920px | TV | Landscape | ✅ (Bold) |

---

## FIREBASE DATA STRUCTURE

```javascript
tournament.publicView = {
  enabled: true,
  token: "a1b2c3d4e5f6g7h8",
  showQRCode: true,
  settings: {
    pageIntervals: {
      groupA: 20,      // 20 secondi per Girone A
      groupB: 18,      // 18 secondi per Girone B
      groupC: 25,      // 25 secondi per Girone C
      bracket: 30,     // 30 secondi per Tabellone
      qr: 15,          // 15 secondi per QR page
    }
  }
}
```

---

## SCALING FORMULA

### Classifica Font
```
baseFontSize = 1rem
scaledFontSize = Math.max(0.7, 1 - (numberOfTeams * 0.05))

// 3 squadre → 0.85rem (85% = +15%)
// 6 squadre → 0.70rem (70% = -30%)
```

### Match Cards
```
optimalCardsPerRow = Math.ceil(sqrt(numberOfMatches))
cardFontSize = Math.max(0.6, 1 - (numberOfMatches * 0.03))

// 6 partite → 2x3 grid, font 0.82rem
// 12 partite → 3x4 grid, font 0.64rem
// 15 partite → 3x5 grid, font 0.55rem
```

### QR Code
```
Portrait:   80x80px
Landscape: 120x120px
Opacity: 0.8
Position: bottom-right, padding 16px
```

---

## COMPONENT HIERARCHY

```
UnifiedPublicView (Main Router)
├── useDeviceOrientation()
├── useAutoScroll()
├── useResponsiveLayout()
├── onSnapshot (Firestore real-time)
├── Portrait Mode?
│   └── LayoutPortrait.jsx
│       ├── Header
│       ├── Classifica + Partite (scrollable)
│       ├── Navigation (swipe + manual)
│       └── QR Code (page)
└── Landscape Mode?
    └── LayoutLandscape.jsx
        ├── Header (sticky)
        ├── Classifica (left 35% or top)
        ├── Partite (right 65% or bottom)
        ├── Auto-scroll Controls
        ├── QR Code (corner small + page)
        └── Progress Bar
```

---

## IMPLEMENTATION PHASES

### Phase 1: Foundation (Day 1)
- [ ] Create UnifiedPublicView.jsx
- [ ] Create useDeviceOrientation() hook
- [ ] Create LayoutPortrait.jsx (basic)
- [ ] Update routing

### Phase 2: Landscape & Responsive (Day 2)
- [ ] Create LayoutLandscape.jsx
- [ ] Create useResponsiveLayout() hook
- [ ] Implement layout ibrido logic
- [ ] Font/card scaling

### Phase 3: Auto-scroll (Day 3)
- [ ] Create useAutoScroll() hook
- [ ] Implement pause/play
- [ ] Add progress bar
- [ ] Timing configuration

### Phase 4: Polish (Day 4)
- [ ] QR code integration
- [ ] BracketViewTV.jsx
- [ ] Device rotation handling
- [ ] PublicViewSettings update
- [ ] Testing & refinement

---

**Siamo pronti a codificare! Iniziamo con Phase 1?** 🚀
