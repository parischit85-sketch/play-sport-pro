# 🗂️ PHASE 1 - FILE STRUCTURE & ORGANIZATION

```
src/
├── features/
│   └── tournaments/
│       ├── hooks/
│       │   └── useDeviceOrientation.js
│       │       ├── useDeviceOrientation()          [Hook main]
│       │       └── calculateOptimalGridColumns()   [Utility]
│       │
│       └── components/
│           └── public/
│               ├── UnifiedPublicView.jsx           [Main component - entry point]
│               │   ├── Validates token
│               │   ├── Detects device
│               │   ├── Routes to LayoutPortrait / LayoutLandscape
│               │   └── Firestore real-time listener
│               │
│               ├── LayoutPortrait.jsx              [Portrait layout]
│               │   ├── Header (logo + LIVE)
│               │   ├── Classifica (scrollable)
│               │   ├── Partite (scrollable)
│               │   ├── Navigation (swipe + click)
│               │   └── QR page
│               │
│               ├── LayoutLandscape.jsx             [Landscape layout]
│               │   ├── Header (sticky)
│               │   ├── Progress bar
│               │   ├── Pause/Play controls
│               │   ├── Page indicators
│               │   ├── Layout ibrido (stacked/hybrid)
│               │   ├── Classifica + Partite
│               │   └── QR corner
│               │
│               ├── PublicTournamentView.jsx        [LEGACY - kept for backward compat]
│               ├── PublicTournamentViewTV.jsx      [LEGACY - kept for backward compat]
│               ├── TournamentStandings.jsx         [REUSED]
│               └── TournamentMatches.jsx           [REUSED]
│
└── router/
    └── AppRouter.jsx                               [UPDATED]
        └── /public/tournament route → UnifiedPublicView

Documentation/
├── UNIFIED_PUBLIC_VIEW_DESIGN.md                  [Full design doc]
├── UNIFIED_PUBLIC_VIEW_QUICK_REF.md               [Quick reference]
├── PHASE1_IMPLEMENTATION_SUMMARY.md               [This summary]
├── PHASE1_TESTING_CHECKLIST.md                    [Testing guide]
└── (other existing docs)
```

---

## 📝 FILE DEPENDENCIES

```
UnifiedPublicView.jsx
├── imports: react, react-router-dom, firebase/firestore
├── imports: lucide-react, framer-motion
├── imports: useDeviceOrientation hook
├── imports: LayoutPortrait
├── imports: LayoutLandscape
└── requires: Firestore tournament data

LayoutPortrait.jsx
├── imports: react
├── imports: lucide-react, framer-motion
├── imports: TournamentStandings (reused)
├── imports: TournamentMatches (reused)
├── imports: react-qr-code
└── uses: props from UnifiedPublicView

LayoutLandscape.jsx
├── imports: react
├── imports: lucide-react, framer-motion
├── imports: TournamentStandings (reused)
├── imports: TournamentMatches (reused)
├── imports: react-qr-code
└── uses: props from UnifiedPublicView

useDeviceOrientation.js
├── imports: react (useState, useEffect)
└── no external deps

AppRouter.jsx
├── imports: UnifiedPublicView (lazy)
├── old: imports PublicTournamentView (lazy) [KEPT]
├── old: imports PublicTournamentViewTV (lazy) [KEPT]
└── routing: /public/tournament → UnifiedPublicView
```

---

## 🔄 DATA FLOW

### 1. User accesses public link
```
URL: /public/tournament/clubId/tournamentId/token
    ↓
UnifiedPublicView (loads)
    ↓
Firestore query: doc(db, 'clubs', clubId, 'tournaments', tournamentId)
    ↓
Validate token & publicView.enabled
    ↓
If error: Show error page
If valid: Continue
```

### 2. Device detection
```
useDeviceOrientation() hook (in UnifiedPublicView)
    ↓
window.innerWidth vs window.innerHeight
    ↓
Calculate: isPortrait, isMobile, isTablet, isTV, etc.
    ↓
State update → re-render
```

### 3. Conditional rendering
```
deviceInfo.isPortrait?
    ↓ YES: LayoutPortrait
    ↓ NO: LayoutLandscape
```

### 4. Layout rendering
```
PORTRAIT:
    Header → Classifica → Partite → Navigation
    
LANDSCAPE:
    Header (sticky) → Content (ibrido) → QR corner
    
Content = Classifica (left/top) + Partite (right/bottom)
```

### 5. Device rotation handling
```
User rotates device
    ↓
window 'orientationchange' event fires
    ↓
useDeviceOrientation detects change
    ↓
deviceInfo state updates
    ↓
UnifiedPublicView re-renders with new layout
    ↓
Animation (Framer Motion) smooth transition
```

---

## 🔐 SECURITY FLOW

```
1. User accesses /public/tournament/:clubId/:tournamentId/:token

2. UnifiedPublicView mounts
    ├── Check: params (clubId, tournamentId, token) exist
    └── If missing: Error "URL non valido"

3. Firestore onSnapshot listener
    ├── Listen: doc(db, 'clubs/{clubId}/tournaments/{tournamentId}')
    ├── On change: Validate publicView.enabled
    ├── On change: Validate token matches
    └── Continuous validation (real-time)

4. If validation fails
    ├── Error: "Vista pubblica non abilitata"
    ├── Error: "Token non valido"
    └── UI: Shows error page with "Torna alla Home"

5. If validation succeeds
    ├── Set tournament state
    ├── Load groups
    └── Render appropriate layout
```

---

## 🎨 UI/UX COMPONENT HIERARCHY

```
UnifiedPublicView (Full Screen)
├── LayoutPortrait (if isPortrait)
│   ├── Header
│   │   ├── Logo
│   │   ├── Tournament name
│   │   └── LIVE Badge
│   ├── Content area (scrollable)
│   │   ├── Classifica (if not QR page)
│   │   ├── Partite (if not QR page)
│   │   └── QR Page (if QR page)
│   └── Navigation bar
│       ├── Prev button
│       ├── Pagination dots
│       └── Next button
│
└── LayoutLandscape (if isLandscape)
    ├── Header (sticky)
    │   ├── Logo + Title + LIVE badge
    │   ├── Controls
    │   │   ├── Pause/Play
    │   │   ├── Pagination dots
    │   │   ├── Prev/Next
    │   │   └── Page label
    │   └── Progress bar
    ├── Content area
    │   ├── STACKED layout (if few teams/matches)
    │   │   ├── Classifica (full-width)
    │   │   └── Partite (full-width)
    │   │
    │   └── HYBRID layout (if many teams/matches)
    │       ├── Left: Classifica (35%)
    │       └── Right: Partite (65%)
    │
    └── QR Corner (if not QR page)
        └── 120x120 QR code (opacity 0.8)
```

---

## 📊 STATE MANAGEMENT

### UnifiedPublicView
```
useState:
  ├── tournament (object | null)
  ├── loading (boolean)
  ├── error (string | null)
  ├── groups (array)
  ├── matches (array)
  └── teams (object)

useDeviceOrientation:
  └── deviceInfo (object)
      ├── orientation: 'portrait' | 'landscape'
      ├── screenSize: 'mobile' | 'tablet' | 'desktop' | 'tv'
      ├── isPortrait (boolean)
      ├── isLandscape (boolean)
      ├── isMobile (boolean)
      ├── isTablet (boolean)
      ├── isDesktop (boolean)
      ├── isTV (boolean)
      ├── width (number)
      └── height (number)
```

### LayoutPortrait
```
useState:
  ├── currentGroupIndex (number)
  ├── showQR (boolean)

useRef:
  ├── touchStartX (ref)
  └── touchEndX (ref)
```

### LayoutLandscape
```
useState:
  ├── currentPageIndex (number)
  ├── isPaused (boolean)
  └── progress (number)

useRef:
  ├── autoScrollRef (interval)
  └── progressRef (interval)
```

---

## 🔄 LIFECYCLE FLOW

### On Mount
```
1. UnifiedPublicView mounts
2. useDeviceOrientation hook initializes
3. window resize listeners added
4. Firestore onSnapshot listener started
5. Token validation executed
6. If valid: tournament state set
7. Conditional layout rendered
```

### On Orientation Change
```
1. window 'orientationchange' event fires
2. useDeviceOrientation detects change
3. deviceInfo state updates
4. UnifiedPublicView re-renders
5. Framer Motion animates transition
6. New layout renders (Portrait or Landscape)
```

### On Unmount
```
1. Firestore unsubscribe called
2. Window event listeners removed
3. Cleanup complete
```

---

## 🧪 TESTABILITY

### Unit Testable
- `useDeviceOrientation()` hook (pure logic)
- `calculateOptimalGridColumns()` utility (pure logic)
- Token validation logic (pure)

### Integration Testable
- Firestore listener
- Layout switching (portrait/landscape)
- Navigation (swipe/click)
- Error handling

### E2E Testable
- Full user flow from URL to rendered layout
- Device rotation scenarios
- Error scenarios

---

## 📈 PERFORMANCE NOTES

### Optimizations in Phase 1
- ✅ Lazy load components (React.lazy)
- ✅ Firestore onSnapshot (real-time, efficient)
- ✅ Framer Motion (GPU-accelerated animations)
- ✅ useRef for touch handling (no re-renders)

### To be added in Phase 2+
- Memoization (useMemo for calculations)
- Debouncing (window resize events)
- Virtualization (if many matches)

### Bundle Impact
- UnifiedPublicView.jsx: ~3KB
- LayoutPortrait.jsx: ~4KB
- LayoutLandscape.jsx: ~5KB
- useDeviceOrientation.js: ~1KB
- Total: ~13KB (gzipped: ~4KB)

---

**Ready for Phase 2 development!** 🚀
