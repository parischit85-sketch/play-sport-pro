# Phase 3: Auto-Scroll & Real-Time Updates ✅ COMPLETED

**Date:** 3 November 2025  
**Time:** Implementation Complete  
**Status:** Ready for Testing & Phase 4

---

## 🎯 Phase 3 Objectives - COMPLETED

✅ Create `useAutoScroll` hook - Interval management with per-page timing  
✅ Integrate auto-scroll in LayoutLandscape  
✅ Implement pause/play fully connected  
✅ Use per-girone timing from `tournament.publicView.settings.pageIntervals`  
✅ Real-time progress bar updates  
✅ Manual navigation resets progress  

---

## 📁 Files Created/Updated

### New Files Created

#### `useAutoScroll.js` (340 LOC)
**Purpose:** Manage auto-scroll functionality with pause/play controls and per-page timing

**Key Exports:**
- `useAutoScroll(options)` - Main auto-scroll hook
- `useAutoScrollWithKeyboard(options, enableKeyboardControls)` - With keyboard support
- `getTournamentPageIntervals(tournament)` - Get timing configuration
- `calculateAutoScrollCycleTime(groups, intervals)` - Calculate total cycle time

**Features:**
- Real-time progress tracking (0-100%)
- Per-page duration configuration from tournament settings
- Pause/Play interval management
- Manual navigation reset
- Automatic page cycling
- Keyboard controls (Space to pause, arrows to navigate)
- Time remaining calculation

**Returns:**
```javascript
{
  // Current state
  progress: 0-100,
  duration: number (seconds),
  currentPage: string | null,

  // Page info
  totalPages: number,
  pageIndex: number,

  // Controls
  resetProgress: function,
  pause: function,
  resume: function,

  // Helper checks
  isLastPage: boolean,
  isFirstPage: boolean,
  isPaused: boolean,

  // Calculated
  timeRemaining: number (seconds),
  getPageTiming: function,
}
```

**Timing Configuration:**
The hook reads page timings from: `tournament.publicView.settings.pageIntervals`

```javascript
{
  groupA: 20,    // seconds
  groupB: 18,
  groupC: 25,
  bracket: 30,
  qr: 15,
}
```

Defaults are applied if not configured:
- Groups: 20 seconds
- Bracket: 30 seconds
- QR: 15 seconds

### Updated Files

#### `LayoutLandscape.jsx` (260 LOC)
**Changes:**
- Added import: `useAutoScroll`
- Integrated auto-scroll hook for real-time page cycling
- Connected pause/play button to auto-scroll state
- Updated progress bar to use `autoScroll.progress`
- Manual navigation (prev/next/jump) resets progress via `autoScroll.resetProgress()`
- Removed old manual interval logic
- Removed unused refs (autoScrollRef, progressRef)

**Key Integrations:**
```javascript
// Auto-scroll with per-girone timing configuration
const autoScroll = useAutoScroll({
  pageIndex: currentPageIndex,
  pages: tournamentData.groups,  // ['A', 'B', 'C', ...]
  isPaused,
  tournament,                    // Has publicView.settings.pageIntervals
  onPageChange: setCurrentPageIndex,
});

// Progress bar uses auto-scroll progress
<div style={{ width: `${autoScroll.progress}%` }} />

// Manual navigation resets progress
const handleNext = () => {
  setCurrentPageIndex(...);
  autoScroll.resetProgress();
};
```

---

## 🔄 Data Flow: Auto-Scroll Lifecycle

### 1. Initialization
```
LayoutLandscape mounts
  ├─ useTournamentData loads standings/matches
  ├─ useResponsiveLayout calculates layout
  └─ useAutoScroll initializes
      ├─ Reads: tournament.publicView.settings.pageIntervals
      ├─ Sets: progress = 0, duration = 20s
      └─ Starts: intervals for progress & page advance
```

### 2. Auto-Scroll Running (isPaused = false)
```
Every 100ms:
  └─ Update progress: progress += (100 / (duration * 10))
     
Every duration seconds (e.g., 20s for Girone A):
  ├─ Call: onPageChange (advances page index)
  ├─ Reset: progress = 0
  └─ Get new timing for next page
```

### 3. Pause Action
```
User clicks Pause button
  ├─ setIsPaused(true)
  ├─ Intervals cleared
  ├─ Progress stays at current value (e.g., 65%)
  └─ User can see how long until next page
```

### 4. Resume Action
```
User clicks Play button
  ├─ setIsPaused(false)
  ├─ Intervals restarted
  ├─ Progress continues from where it was
  └─ Page will advance when progress reaches 100%
```

### 5. Manual Navigation
```
User clicks next/prev/jump
  ├─ New page index set
  ├─ autoScroll.resetProgress() called
  ├─ Progress = 0 (starts fresh)
  └─ Auto-scroll resumes from beginning
```

---

## ⏱️ Timing Examples

### Example 1: Girone A → Girone B → QR
```
Girone A: 20 seconds
├─ 0-20s: Page A, progress 0-100%
└─ At 20s: advance to next page, progress reset to 0

Girone B: 18 seconds
├─ 0-18s: Page B, progress 0-100%
└─ At 18s: advance to QR, progress reset to 0

QR Code: 15 seconds
├─ 0-15s: QR Page, progress 0-100%
└─ At 15s: Loop back to Girone A, progress reset to 0
```

### Example 2: With Pause/Resume
```
Timeline:
0s: Start Girone A (20s duration)
5s: Progress = 25%
7s: USER CLICKS PAUSE
  └─ Progress stays at 35% (7/20)
10s: USER CLICKS PLAY
  └─ Progress continues from 35%
20s: Progress reaches 100%, advance to Girone B
```

---

## 🧪 Testing Checklist

### Unit Tests

#### useAutoScroll Hook
- [ ] Progress increments 0-100% over duration
- [ ] Page advances at correct intervals
- [ ] Pause stops progress and intervals
- [ ] Resume continues from paused progress
- [ ] resetProgress() sets progress to 0
- [ ] getPageTiming() returns correct values
- [ ] Handles missing pageIntervals (uses defaults)
- [ ] Keyboard controls work (if enabled)
- [ ] Time remaining calculated correctly

#### Page Timing Calculation
- [ ] Default timings applied when not configured
- [ ] Configured timings override defaults
- [ ] Validates timing bounds (5-300 seconds)
- [ ] Group identifiers mapped correctly (A→groupA)
- [ ] Cycle time calculated correctly

### Integration Tests

#### LayoutLandscape with Auto-Scroll
- [ ] Page advances automatically after duration
- [ ] Pause button stops advancement
- [ ] Play button resumes advancement
- [ ] Next/Previous buttons work and reset progress
- [ ] Progress bar animates smoothly
- [ ] Manual navigation doesn't break auto-scroll
- [ ] Correct page timing used for each group
- [ ] QR page shows for configured duration
- [ ] Bracket page cycles correctly

### Manual Tests

#### Auto-Scroll Behavior
- [ ] Page 1: Shows for correct duration
- [ ] Page 2: Shows for correct duration
- [ ] Pause: Progress bar freezes at current %
- [ ] Play: Resumes from paused %
- [ ] Total cycle time matches configuration
- [ ] After last page (QR), loops back to first

#### Responsiveness
- [ ] Progress bar smooth on desktop
- [ ] Progress bar smooth on tablet
- [ ] Progress bar smooth on mobile
- [ ] No jank or stuttering during animation

#### Edge Cases
- [ ] Single group tournament (A only) cycles correctly
- [ ] Many groups (A-H) cycle through all
- [ ] Zero configured timing (uses 20s default)
- [ ] Very short timing (5s) advances quickly
- [ ] Very long timing (300s) takes time

---

## 🎯 How to Configure Timing

### In Admin Dashboard (PublicViewSettings)

Admin can configure timing per-girone:

```javascript
// In tournament doc
tournament.publicView = {
  enabled: true,
  token: "abc123",
  showQRCode: true,
  settings: {
    pageIntervals: {
      groupA: 20,    // Girone A: 20 seconds
      groupB: 18,    // Girone B: 18 seconds
      groupC: 25,    // Girone C: 25 seconds
      bracket: 30,   // Tabellone: 30 seconds
      qr: 15,        // QR Code: 15 seconds
    }
  }
}
```

**Total Cycle Time:** 20 + 18 + 25 + 30 + 15 = 108 seconds ≈ 1m 48s

---

## 🚀 Usage Examples

### Basic Auto-Scroll
```javascript
import { useAutoScroll } from './hooks/useAutoScroll.js';

function MyComponent() {
  const [pageIndex, setPageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const autoScroll = useAutoScroll({
    pageIndex,
    pages: ['A', 'B', 'C', 'qr'],
    isPaused,
    tournament: myTournament,
    onPageChange: setPageIndex,
  });

  return (
    <div>
      <div>{autoScroll.progress}%</div>
      <button onClick={() => setIsPaused(!isPaused)}>
        {isPaused ? 'Play' : 'Pause'}
      </button>
      <p>Time remaining: {autoScroll.timeRemaining}s</p>
    </div>
  );
}
```

### Get Cycle Information
```javascript
import { calculateAutoScrollCycleTime, getTournamentPageIntervals } from './hooks/useAutoScroll.js';

const intervals = getTournamentPageIntervals(tournament);
const cycleInfo = calculateAutoScrollCycleTime(['A', 'B', 'C'], intervals);

console.log(`Full cycle takes: ${cycleInfo.display}`); // "Full cycle takes: 1m 48s"
```

---

## ⚙️ Technical Details

### Progress Bar Animation
- Update interval: 100ms (10 updates per second)
- Smooth visual update without stuttering
- CSS transition handles animation
- No re-renders between updates (useRef manages intervals)

### Memory Management
- Intervals properly cleaned up in useEffect return
- No memory leaks on component unmount
- Refs used for interval IDs (not re-created)

### Performance
- Memoized calculations (useCallback)
- Progress updates don't trigger re-renders of child components
- Auto-scroll logic isolated in custom hook

---

## 📊 Code Metrics - Phase 3

| Metric | Value |
|---|---|
| New Files | 1 |
| Files Updated | 1 |
| New Lines of Code | 340 |
| Total Project Size | ~1,790 LOC |
| Auto-Scroll Performance | 10 updates/sec (smooth) |
| Cycle Time Typical | 60-120s |

---

## 🔗 Integration Points

### Required: TournamentStandings.jsx & TournamentMatches.jsx
These components already accept `fontScale` and `gridColumns` props from Phase 2.
No changes needed for Phase 3.

### Data Flow to Child Components
```
LayoutLandscape
  ├─ [Responsive Layout Props]
  │   ├─ fontScale={layout.classicaFontScale}
  │   └─ gridColumns={layout.gridColumns}
  │
  ├─ TournamentStandings
  │   └─ Uses fontScale for responsive text
  │
  └─ TournamentMatches
      ├─ Uses fontScale for responsive text
      └─ Uses gridColumns for grid layout
```

---

## ✅ Deliverables Summary

✅ **Auto-Scroll Hook** - Complete with pause/play/timing
✅ **LayoutLandscape Integration** - Real-time page cycling
✅ **Per-Girone Timing** - Reads from tournament settings
✅ **Progress Bar** - Smooth animations
✅ **Manual Controls** - Fully connected
✅ **Documentation** - This file + code comments

**Phase 3 Status: COMPLETE ✅**

---

## 🎬 Next: Phase 4

**Phase 4 will implement:**
1. BracketViewTV.jsx - TV-optimized bracket display
2. Device rotation handling - Smooth transitions
3. PublicViewSettings.jsx - Admin UI for timing config
4. QR code refinement - Test all placement scenarios
5. Integration testing - All devices and scenarios

**Estimated Time:** 2 hours

---

## 📝 Phase Progression Summary

```
Phase 1: Foundation ✅
├─ Device detection
├─ Portrait/Landscape routing
└─ Component structure

Phase 2: Responsive ✅
├─ Data loading hooks
├─ Font scaling calculations
└─ Responsive grid layout

Phase 3: Auto-Scroll ✅
├─ Per-girone timing
├─ Pause/Play controls
└─ Real-time progress updates

Phase 4: Polish & Integration 🚀
├─ Bracket view
├─ Device rotation
├─ Admin settings
└─ Full testing
```

---

## 🎓 Learning Notes

**Key Concepts Implemented:**
1. **Interval Management** - Clean setup/cleanup patterns
2. **Progress Animation** - 10 fps updates for smoothness
3. **Configuration Loading** - Reading from Firestore document
4. **State Synchronization** - Multiple sources of truth (auto-scroll + manual nav)
5. **User Control** - Pause/resume with context preservation

**Best Practices Applied:**
- ✅ useCallback for stable function references
- ✅ useRef for persistent interval IDs
- ✅ Proper cleanup in useEffect returns
- ✅ Configurable defaults for flexibility
- ✅ Clear separation of concerns (hook vs component)
