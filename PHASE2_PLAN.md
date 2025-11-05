# 📋 PHASE 2 PLAN - Landscape & Responsive Implementation

**Estimated Duration:** 2-3 hours  
**Status:** READY TO START  
**Complexity:** MEDIUM

---

## 🎯 PHASE 2 OBJECTIVES

### Primary Goals
1. ✅ Implement responsive layout ibrido (smart density-based switching)
2. ✅ Add dynamic font scaling formulas
3. ✅ Load real data for standings/matches
4. ✅ Calculate optimal grid layout
5. ✅ Fix code quality issues (line endings, unused imports)

### Secondary Goals
1. ✅ Add memoization for performance
2. ✅ Test responsive calculations
3. ✅ Validate layout calculations with real data

---

## 📝 FILES TO CREATE/MODIFY

### NEW FILES (2)

#### 1. `useResponsiveLayout.js` (NEW)
```javascript
/**
 * Hook: Responsive Layout Calculation
 * Calculates optimal layout based on data density
 * Returns: { layout, fontSize, gridColumns, padding }
 */

export const useResponsiveLayout = (numberOfTeams, numberOfMatches, containerWidth) => {
  // Calculate density
  const density = (numberOfTeams + numberOfMatches) / 2;
  
  // Determine layout
  const layout = density < 4 ? 'stacked' : 'hybrid';
  
  // Calculate font sizes
  const classificationFontSize = Math.max(0.7, 1 - (numberOfTeams * 0.05));
  const matchCardFontSize = Math.max(0.55, 1 - (numberOfMatches * 0.03));
  
  // Calculate grid
  const optimalColumns = calculateOptimalGridColumns(numberOfMatches);
  
  // Calculate padding
  const padding = Math.max(4, 16 - (numberOfTeams * 2));
  
  return {
    layout,
    fontSize: {
      classification: classificationFontSize,
      matchCard: matchCardFontSize,
    },
    gridColumns: optimalColumns,
    padding,
  };
};
```

#### 2. `useTournamentData.js` (NEW)
```javascript
/**
 * Hook: Load tournament data (standings, matches, teams)
 * Returns: { standings, matches, teams, loading, error }
 */

export const useTournamentData = (tournament, clubId, groupFilter) => {
  // Load from services:
  // - getMatches(clubId, tournament.id)
  // - getTeamsByTournament(clubId, tournament.id)
  // - calculateGroupStandings(...)
  
  // Filter by groupFilter if specified
  
  // Return combined data
};
```

### MODIFIED FILES (3)

#### 1. `LayoutPortrait.jsx` (MODIFY)
```javascript
// Changes needed:
1. Remove unused imports (AlertCircle)
2. Add useTournamentData hook
3. Fix deviceInfo parameter (prefix with _)
4. Load real data for standings/matches
5. Pass real data to TournamentStandings/TournamentMatches

// ~10 lines changed
```

#### 2. `LayoutLandscape.jsx` (MODIFY)
```javascript
// Changes needed:
1. Import useResponsiveLayout hook
2. Import useTournamentData hook
3. Remove unused deviceInfo parameter
4. Calculate layout based on REAL data density
5. Apply font scaling to classifica/partite
6. Calculate optimal grid columns
7. Pass styled components to children
8. Update calculateLayout() to use real data

// ~30 lines changed
```

#### 3. `UnifiedPublicView.jsx` (MODIFY)
```javascript
// Changes needed:
1. Load tournament data (standings, matches, teams)
2. Pass data to LayoutPortrait/LayoutLandscape
3. Handle data loading states
4. Pass data-loading callbacks

// ~15 lines changed
```

---

## 🔧 IMPLEMENTATION TASKS

### Task 1: Create `useResponsiveLayout.js` Hook
```
Duration: 30 min
Priority: HIGH

Steps:
1. Create file
2. Implement layout calculation logic:
   - Density formula: (teams + matches) / 2
   - Threshold: < 4 = stacked, >= 4 = hybrid
3. Implement font scaling formulas:
   - Classification: max(0.7, 1 - teams*0.05)
   - Matches: max(0.55, 1 - matches*0.03)
4. Implement grid calculation:
   - Use calculateOptimalGridColumns from useDeviceOrientation
5. Implement padding calculation:
   - Base: 16px, reduce by teams*2
6. Add useMemo for optimization
7. Export with TypeScript-style comments
```

### Task 2: Create `useTournamentData.js` Hook
```
Duration: 45 min
Priority: HIGH

Steps:
1. Create file
2. Implement data loading:
   - getMatches(clubId, tournament.id)
   - getTeamsByTournament(clubId, tournament.id)
   - calculateGroupStandings(...)
3. Implement filtering by groupId
4. Handle loading/error states
5. Cache results with useMemo
6. Return standardized object
7. Add error handling
```

### Task 3: Fix Line Endings Project-Wide
```
Duration: 15 min
Priority: MEDIUM

Steps:
1. Create .editorconfig file:
   [*.js]
   end_of_line = lf
   insert_final_newline = true
2. In VS Code: "Reopen with LF"
3. Resave all Phase 1 files
4. Verify linting errors gone
```

### Task 4: Update LayoutPortrait.jsx
```
Duration: 30 min
Priority: MEDIUM

Steps:
1. Remove unused imports
2. Add useTournamentData hook
3. Rename deviceInfo to _deviceInfo
4. Call useTournamentData in useEffect
5. Pass loading/error states
6. Pass real data to components
7. Test with real tournament data
```

### Task 5: Update LayoutLandscape.jsx
```
Duration: 60 min
Priority: HIGH

Steps:
1. Fix unused imports
2. Import useResponsiveLayout
3. Import useTournamentData
4. Load data for current group
5. Calculate responsive values:
   - layout = ibrido/stacked
   - fontSize values
   - grid columns
6. Apply classes dynamically:
   - Classifica: style={{ fontSize: ... }}
   - Matches: className with grid-cols-{X}
7. Test stacked vs hybrid switching
8. Verify font scaling visual
```

### Task 6: Update UnifiedPublicView.jsx
```
Duration: 30 min
Priority: MEDIUM

Steps:
1. Rename unused states if needed
2. Pass groups to child layouts
3. Pass data loading state
4. Handle edge cases (no groups, no data)
5. Test integration
```

### Task 7: Testing & Validation
```
Duration: 30 min
Priority: HIGH

Steps:
1. Test responsive calculation:
   - 3 teams, 6 matches → stacked
   - 6 teams, 15 matches → hybrid
   - All transitions
2. Test font scaling:
   - Verify readable at all densities
3. Test grid calculation:
   - 6 matches → 2 cols
   - 12 matches → 3-4 cols
   - 15 matches → 3-5 cols
4. Test real data loading
5. Cross-browser testing (chrome, firefox, safari)
6. Cross-device testing (mobile, tablet, desktop)
```

---

## 📐 MATH FORMULAS TO IMPLEMENT

### Layout Density
```javascript
const density = (numberOfTeams + numberOfMatches) / 2;
const layout = density < 4 ? 'stacked' : 'hybrid';

// Examples:
// 3 teams + 6 matches = 4.5 → hybrid
// 3 teams + 3 matches = 3.0 → stacked
// 6 teams + 15 matches = 10.5 → hybrid
```

### Classification Font Size
```javascript
const baseFontSize = 1; // rem
const scaledSize = Math.max(0.7, baseFontSize - (numberOfTeams * 0.05));

// Examples:
// 3 teams → 0.85 rem (85% = +15%)
// 4 teams → 0.80 rem (80%)
// 5 teams → 0.75 rem (75%)
// 6 teams → 0.70 rem (70%)
```

### Match Card Font Size
```javascript
const scaledSize = Math.max(0.55, 1 - (numberOfMatches * 0.03));

// Examples:
// 6 matches → 0.82 rem
// 12 matches → 0.64 rem
// 15 matches → 0.55 rem
```

### Grid Columns
```javascript
function calculateOptimalGridColumns(itemCount) {
  if (itemCount <= 3) return 1;
  if (itemCount <= 6) return 2;
  if (itemCount <= 12) return 3;
  if (itemCount <= 20) return 4;
  return 5;
}

// Examples:
// 6 matches → 2 columns (3 rows)
// 12 matches → 3 columns (4 rows)
// 15 matches → 3 columns (5 rows)
```

### Cell Padding
```javascript
const basePadding = 16; // px
const scaledPadding = Math.max(4, basePadding - (numberOfTeams * 2));

// Examples:
// 3 teams → 10px padding
// 4 teams → 8px padding
// 5 teams → 6px padding
// 6 teams → 4px padding
```

---

## 🧪 VALIDATION SCENARIOS

### Scenario 1: Few Teams & Matches
```
Teams: 3, Matches: 6
Density: 4.5 → STACKED layout
Classification font: 0.85 rem
Match card font: 0.82 rem
Grid columns: 2 (3 matches per row)
Padding: 10px
Visual: Spacious, readable
```

### Scenario 2: Many Teams & Matches
```
Teams: 6, Matches: 15
Density: 10.5 → HYBRID layout
Classification font: 0.70 rem
Match card font: 0.55 rem
Grid columns: 3 (5 matches per row)
Padding: 4px
Visual: Compact, still readable
Classifica: 35% width, Partite: 65% width
```

### Scenario 3: Single Team & Few Matches
```
Teams: 1, Matches: 3
Density: 2.0 → STACKED layout
Classification font: 0.95 rem
Match card font: 0.91 rem
Grid columns: 1 (3 matches per column)
Padding: 16px
Visual: Very spacious
```

### Scenario 4: Many Teams, Few Matches
```
Teams: 6, Matches: 3
Density: 4.5 → HYBRID layout
Classification font: 0.70 rem
Match card font: 0.91 rem
Grid columns: 1 (3 matches vertical)
Padding: 4px
Visual: Left side tight, right side spacious
```

---

## 📊 TESTING CHECKLIST

### Unit Tests
```
✅ calculateOptimalGridColumns(itemCount)
✅ density calculation
✅ font size scaling
✅ padding calculation
✅ layout decision logic
```

### Integration Tests
```
✅ useResponsiveLayout hook
✅ useTournamentData hook
✅ LayoutLandscape with real data
✅ LayoutPortrait with real data
```

### Visual Tests
```
✅ Portrait mode responsive (manual)
✅ Landscape stacked layout (manual)
✅ Landscape hybrid layout (manual)
✅ Font sizes readable (manual)
✅ Grid alignment (manual)
✅ Touch interactions work (manual)
```

### Device Tests
```
✅ iPhone SE (375x667)
✅ iPhone 12 (390x844)
✅ iPad (768x1024)
✅ iPad Pro (1024x1366)
✅ Desktop (1920x1080)
✅ TV (1920x1440)
```

---

## 🚀 PHASE 2 SUCCESS CRITERIA

✅ **Responsive Layout**
- Density-based switching (stacked vs hybrid)
- Proper widths (35/65 split for hybrid)
- No layout jumping

✅ **Font Scaling**
- Classification: 0.7-1 rem range
- Matches: 0.55-1 rem range
- All text readable at all densities

✅ **Grid Calculation**
- 1-5 columns optimal
- No overflow
- Cards properly sized

✅ **Data Loading**
- Real standings data
- Real matches data
- Proper filtering by group

✅ **Code Quality**
- No linting errors
- No unused imports
- Proper error handling

✅ **Performance**
- No layout thrashing
- Smooth animations
- Efficient data loading

---

## 📅 ESTIMATED TIMELINE

| Task | Duration |
|------|----------|
| Task 1: useResponsiveLayout | 30 min |
| Task 2: useTournamentData | 45 min |
| Task 3: Line endings fix | 15 min |
| Task 4: LayoutPortrait update | 30 min |
| Task 5: LayoutLandscape update | 60 min |
| Task 6: UnifiedPublicView update | 30 min |
| Task 7: Testing & validation | 30 min |
| **TOTAL** | **~3.5 hours** |

---

## 🎯 READY TO START PHASE 2?

All planning complete. Ready to implement when you say go! 🚀

Next steps:
1. [ ] Review Phase 2 plan
2. [ ] Confirm objectives
3. [ ] Start implementation
4. [ ] Run tests
5. [ ] Move to Phase 3
