# 🚀 QUICK START: Real-time Tournament Features

**Last Updated:** 2025-01-15  
**Status:** ✅ PRODUCTION READY

---

## 📖 Overview

The tournament system now supports **real-time updates** - no manual refresh needed! When any admin updates match results, standings and brackets update automatically for all users.

---

## 🎯 What's Live Now

### ✅ Live Standings
- **Component:** `StandingsTable.jsx`
- **Updates When:** Match results are submitted
- **Visual Indicator:** Green pulsing "LIVE" badge
- **Auto-refresh:** Every ~2 seconds when data changes

### ✅ Live Bracket
- **Component:** `BracketView.jsx`
- **Updates When:** Winners advance to next round
- **Visual Indicator:** Green "LIVE" badge + match completion stats
- **Auto-refresh:** Instant when knockout matches complete

---

## 💻 Usage Examples

### Example 1: Simple Subscription

```javascript
import { subscribeGroupStandings } from './services/tournamentRealtime.js';
import { useState, useEffect } from 'react';

function MyStandings({ clubId, tournamentId, groupId }) {
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    // Subscribe to live standings
    const unsubscribe = subscribeGroupStandings(
      clubId, 
      tournamentId, 
      groupId, 
      (result) => {
        if (result.success) {
          setStandings(result.standings);
        }
      }
    );

    // CRITICAL: Cleanup on unmount
    return () => unsubscribe();
  }, [clubId, tournamentId, groupId]);

  return (
    <div>
      {standings.map(team => (
        <div key={team.teamId}>
          {team.name} - {team.points}pts
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Live Knockout Bracket

```javascript
import { subscribeKnockoutBracket } from './services/tournamentRealtime.js';

function MyBracket({ clubId, tournamentId }) {
  const [bracket, setBracket] = useState({});
  const [stats, setStats] = useState({ total: 0, completed: 0 });

  useEffect(() => {
    const unsubscribe = subscribeKnockoutBracket(
      clubId,
      tournamentId,
      (result) => {
        if (result.success) {
          setBracket(result.bracket); // { 'Quarter Finals': [...], 'Semi Finals': [...] }
          setStats({
            total: result.totalMatches,
            completed: result.completedMatches
          });
        }
      }
    );

    return () => unsubscribe();
  }, [clubId, tournamentId]);

  return (
    <div>
      <p>Matches: {stats.completed}/{stats.total} complete</p>
      {Object.entries(bracket).map(([roundName, matches]) => (
        <div key={roundName}>
          <h3>{roundName}</h3>
          {matches.map(match => <MatchCard key={match.id} match={match} />)}
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Multiple Subscriptions

```javascript
import { createSubscriptionManager, subscribeTournament, subscribeMatches } from './services/tournamentRealtime.js';

function TournamentDashboard({ clubId, tournamentId }) {
  useEffect(() => {
    const manager = createSubscriptionManager();

    // Subscribe to tournament status
    manager.add(subscribeTournament(clubId, tournamentId, (result) => {
      setTournamentStatus(result.tournament.status);
    }));

    // Subscribe to all matches
    manager.add(subscribeMatches(clubId, tournamentId, {}, (result) => {
      setMatches(result.matches);
    }));

    // Cleanup ALL subscriptions at once
    return () => manager.unsubscribeAll();
  }, [clubId, tournamentId]);

  return <div>Dashboard...</div>;
}
```

---

## 🔧 Available Functions

### Core Subscriptions

| Function | Purpose | Returns |
|----------|---------|---------|
| `subscribeTournament()` | Live tournament status/settings | Tournament document |
| `subscribeGroupStandings()` | Live standings for one group | Array of teams |
| `subscribeAllStandings()` | Live standings for all groups | Array of groups with teams |
| `subscribeKnockoutBracket()` | Live bracket grouped by round | Bracket object + stats |
| `subscribeMatches()` | Live matches with filters | Array of matches |
| `subscribeMatch()` | Single match updates | Match document |
| `subscribeTeams()` | Live team registrations | Array of teams |

### Utility

| Function | Purpose |
|----------|---------|
| `createSubscriptionManager()` | Manage multiple subscriptions |

---

## 📝 Callback Format

All subscription functions use the same callback format:

```javascript
{
  success: boolean,        // true if data retrieved successfully
  data: any,              // The actual data (standings, matches, etc.)
  error?: string,         // Error message if success = false
  
  // Additional fields for specific subscriptions:
  count?: number,         // Number of items (for arrays)
  totalMatches?: number,  // For knockout bracket
  completedMatches?: number // For knockout bracket
}
```

**Example:**
```javascript
subscribeGroupStandings(clubId, tournamentId, groupId, (result) => {
  if (result.success) {
    console.log('Standings:', result.standings);
    console.log('Total teams:', result.totalTeams);
  } else {
    console.error('Error:', result.error);
  }
});
```

---

## 🎨 UI Components

### LIVE Indicator (Copy-Paste Ready)

```javascript
{isLive && (
  <div className="flex items-center gap-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
    </span>
    <span className="text-xs font-medium text-green-700 dark:text-green-400">LIVE</span>
  </div>
)}
```

### Disabled Refresh Button

```javascript
<button
  onClick={handleRefresh}
  disabled={isLive}
  className={`text-sm ${
    isLive
      ? 'text-gray-400 cursor-not-allowed'
      : 'text-blue-600 hover:underline'
  }`}
  title={isLive ? 'Auto-aggiornamento attivo' : 'Aggiorna'}
>
  ↻ {isLive ? 'Auto-aggiornamento' : 'Aggiorna'}
</button>
```

### Match Stats Badge

```javascript
{stats.total > 0 && (
  <span className="text-sm text-gray-500 dark:text-gray-400">
    {stats.completed}/{stats.total} completate
  </span>
)}
```

---

## ⚠️ Important Rules

### 1. Always Cleanup Subscriptions

**❌ BAD:**
```javascript
useEffect(() => {
  subscribeStandings(clubId, tournamentId, groupId, callback);
  // Missing cleanup = MEMORY LEAK!
}, [deps]);
```

**✅ GOOD:**
```javascript
useEffect(() => {
  const unsubscribe = subscribeStandings(clubId, tournamentId, groupId, callback);
  return () => unsubscribe(); // Cleanup on unmount
}, [deps]);
```

### 2. Handle Errors

**❌ BAD:**
```javascript
subscribeStandings(clubId, tournamentId, groupId, (result) => {
  setStandings(result.standings); // Crashes if error!
});
```

**✅ GOOD:**
```javascript
subscribeStandings(clubId, tournamentId, groupId, (result) => {
  if (result.success) {
    setStandings(result.standings);
  } else {
    setError(result.error);
    console.error('Subscription error:', result.error);
  }
});
```

### 3. Use Correct Dependencies

**❌ BAD:**
```javascript
useEffect(() => {
  const unsubscribe = subscribe(...);
  return () => unsubscribe();
}, []); // Missing clubId, tournamentId!
```

**✅ GOOD:**
```javascript
useEffect(() => {
  const unsubscribe = subscribe(clubId, tournamentId, ...);
  return () => unsubscribe();
}, [clubId, tournamentId]); // Recreate subscription when these change
```

---

## 🔍 Debugging

### Console Logging

All subscriptions log with 🔴 emoji for easy filtering:

```
🔴 Subscribing to standings: group-a
🔴 [BracketView] Subscribing to knockout bracket
🔴 Unsubscribing from standings
```

**Filter in DevTools:**
```
🔴
```

### Common Issues

**Issue:** Subscription never fires callback  
**Solution:** Check that clubId, tournamentId are valid and data exists in Firestore

**Issue:** Memory leaks / "Memory footprint growing"  
**Solution:** Ensure unsubscribe() is called in cleanup function

**Issue:** Stale data / Not updating  
**Solution:** Verify Firestore rules allow read access for authenticated users

**Issue:** "Missing index" error  
**Solution:** Create composite indexes (see `TOURNAMENT_P3_REALTIME_UPDATES.md` → Deployment Checklist)

---

## 🚀 Quick Test

Want to verify real-time is working?

1. **Open two browser tabs** with the same tournament
2. **Submit a match result** in tab 1
3. **Watch tab 2 update automatically** (no refresh!)
4. **Look for LIVE badge** on both tabs
5. **Check console** for 🔴 subscription logs

---

## 📚 More Information

- **Full Documentation:** `TOURNAMENT_P3_REALTIME_UPDATES.md`
- **Session Summary:** `SESSION_SUMMARY_P3_REALTIME_UPDATES.md`
- **Service Code:** `src/features/tournaments/services/tournamentRealtime.js`

---

## ✨ Tips & Tricks

### Conditional Subscriptions

Only subscribe when needed:

```javascript
useEffect(() => {
  // Don't subscribe if tournament is in draft
  if (!tournament || tournament.status === 'DRAFT') {
    return;
  }

  const unsubscribe = subscribe(...);
  return () => unsubscribe();
}, [tournament?.status]);
```

### Loading States

Show loading while waiting for first data:

```javascript
const [loading, setLoading] = useState(true);

useEffect(() => {
  const unsubscribe = subscribe(..., (result) => {
    setLoading(false); // First data received
    setData(result.data);
  });

  return () => unsubscribe();
}, [deps]);

if (loading) return <Spinner />;
```

### Optimistic Updates

Update UI immediately, sync with server:

```javascript
const handleSubmit = async (matchResult) => {
  // 1. Update UI immediately
  setStandings(prev => calculateNewStandings(prev, matchResult));
  
  // 2. Save to server
  try {
    await submitMatchResult(matchResult);
    // Real-time subscription will sync correct data
  } catch (error) {
    // 3. Rollback on error
    setStandings(originalStandings);
    alert('Failed to save');
  }
};
```

---

**Happy Coding! 🎉**

*Real-time updates are now live - your tournaments just got a whole lot more responsive!*
