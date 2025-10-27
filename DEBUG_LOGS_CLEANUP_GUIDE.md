# Debug Logs Cleanup - Manual Process

## Status: ⏳ In Progress (Sprint 1 - Priority #10)

## Overview
Remove development debug logs from production code by replacing `console.log` calls with the new `logger` utility that is environment-aware (only logs in development, sends errors to Sentry in production).

## Progress

### ✅ Completed
1. Created `src/utils/logger.js` (151 lines) with 12 logging methods
2. Identified 70+ debug log occurrences across 6 main files

### ⏳ Pending
Manual replacement in files (estimated 10 minutes):
- `src/features/extra/Extra.jsx` (2 console.log)
- `src/features/instructor/InstructorDashboard.jsx` (16 console.log)
- `src/layouts/AppLayout.jsx` (7 console.log)
- `src/components/ui/NavTabs.jsx` (2 console.log)
- `src/features/admin/AdminClubDashboard.jsx` (1 console.log)
- `src/features/stats/StatisticheGiocatore.jsx` (5 console.log)

## Manual Replacement Guide

### Step 1: Add logger import
At the top of each file, after existing imports:
```jsx
import { logger } from '@/utils/logger';
```

### Step 2: Replace console.log calls

**Pattern replacements:**

```jsx
// BEFORE (Development debug log)
console.log('🔍 [Component] Message:', data);

// AFTER
logger.debug('Message:', data);
```

```jsx
// BEFORE (Warning)
console.warn('⚠️ [Component] Warning:', issue);

// AFTER  
logger.warn('Warning:', issue);
```

```jsx
// BEFORE (Error)
console.error('❌ [Component] Error:', error);

// AFTER
logger.error('Error:', error);
```

**Key Changes:**
- Remove emoji prefixes (🔍, 📚, 🎓, etc.)
- Remove `[ComponentName]` tags
- Keep the message and data parameters
- Use appropriate logger method:
  - `logger.debug()` for debug info (dev only)
  - `logger.warn()` for warnings (always visible)
  - `logger.error()` for errors (always visible + Sentry)

### Step 3: Build to validate
```bash
npm run build
```

## Files to Update (33 occurrences)

### `src/features/extra/Extra.jsx` (2 logs)
- Line 108: `console.log('🏢 [Extra] Courts not changed...')`
- Line 116: `console.log('🏢 [Extra] Club mode - Saving...')`

### `src/features/instructor/InstructorDashboard.jsx` (16 logs)
- Line 56: `console.log('🎓 [InstructorDashboard] Loading data...')`
- Line 72: `console.log('📚 [InstructorDashboard] Instructor lessons...')`
- Line 100: `console.log('📚 [InstructorDashboard] User bookings...')`
- Line 101: `console.log('📚 [InstructorDashboard] Matches from ClubContext...')`
- Line 139: `console.log('🏓 [InstructorDashboard] User matches...')`
- Line 151: `console.log('📚 [InstructorDashboard] Total combined...')`
- Line 153: `console.log('📚 [InstructorDashboard] Sample booking...')`
- Line 163: `console.log('⏰ [InstructorDashboard] Found time slots...')`
- Line 179: `console.log('🔍 [InstructorDashboard] Separating...')`
- Line 180: `console.log('🔍 [InstructorDashboard] Total bookings...')`
- Line 190: `console.log('📚 [InstructorDashboard] Found lessons...')`
- Line 192: `console.log('📚 [InstructorDashboard] Sample lesson dates...')`
- Line 206: `console.log('🏓 [InstructorDashboard] Found matches...')`
- Line 208: `console.log('🏓 [InstructorDashboard] Sample match dates...')`
- Line 288: `console.log('🔍 [InstructorDashboard] Filtering with...')`
- Line 299: `console.log('🔎 [InstructorDashboard] Checking booking...')`

### `src/layouts/AppLayout.jsx` (7 logs)
- Line 83: `console.log('🚫 [AppLayout] Geolocation already denied...')`
- Line 180: `console.log('📍 [AppLayout] Route changed...')`
- Line 361: `console.log('🔄 [AppLayout] handleTabChange called...')`
- Line 372: `console.log('🎯 [AppLayout] Opening BookingTypeModal...')`
- Line 379: `console.log('⚠️ [AppLayout] Already on tab...')`
- Line 386: `console.log('✅ [AppLayout] Navigating to...')`

### `src/components/ui/NavTabs.jsx` (2 logs)
- Line 32: `console.log('🔘 [NavTabs] Tab clicked...')`
- Line 59: `console.log('🔘 [NavTabs] Admin tab clicked...')`

### `src/features/admin/AdminClubDashboard.jsx` (1 log)
- Line 57: `console.log('📚 [AdminDashboard] Loaded instructor slots...')`

### `src/features/stats/StatisticheGiocatore.jsx` (5 logs)
- Line 78: `console.log('📊 [DEBUG] Filtered matches...')`
- Line 100: `console.log('📊 [DEBUG] Computing advanced stats...')`
- Line 103: `console.log('📊 [DEBUG] No player ID...')`
- Line 111: `console.log('📊 [DEBUG] Player matches found...')`
- Line 118: `console.log('📊 [DEBUG] No matches found...')`

## Note

**Excluded from cleanup:**
- `src/main.jsx` - Contains dev-specific mock notification logs with `[DEV]`/`[MOCK]` tags that should remain for development debugging of Push Notifications v2.0 system.

## Timeline
- **Estimated Time**: 10 minutes
- **Sprint**: Sprint 1 - Week 1 (Quick Wins)
- **Priority**: Medium (Priority #10 of 10)
- **Blocker**: None (can be done anytime)

## Next Steps
1. Complete manual replacements following guide above
2. Run `npm run build` to validate
3. Test in development (`npm run dev`) to verify logger.debug() works
4. Test in production to verify console is clean

## Impact
- ✅ Cleaner production console
- ✅ Better performance (no unnecessary logging)
- ✅ Centralized logging with Sentry integration
- ✅ Environment-aware logging (dev vs prod)
- ✅ Professional appearance
