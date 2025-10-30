# Championship Points - Chronological Application Fix

## Problem Statement

Tournament championship points were NOT being applied chronologically in the ranking timeline. They needed to be treated as synthetic RPA deltas that affect subsequent match calculations, not as a final bonus.

### Scenario (Correct behavior):
```
6 ottobre:     Partita (rating 1500 → 1520, delta +20)
20 ottobre:    Torneo (+893 punti, come se fosse un delta RPA)
25 ottobre:    Nuova partita (deve partire da 1520 + 893 = 2413)
```

## Root Cause

The previous implementation was:
1. Loading tournament matches from `combinedMatches` array
2. When encountering a tournament match, extracting championship points from `leaderboardMap[playerId].entries`
3. Applying those points and moving on

**Problem:** This approach didn't truly integrate points chronologically - the championship points were treated separately from the regular match timeline instead of being sorted by date with all other events.

## Solution Implemented

Modified `src/lib/ranking.js` to:

### 1. Create Synthetic Championship Point Events
```javascript
const championshipEvents = [];
for (const [playerId, playerData] of Object.entries(leaderboardMap)) {
  if (playerData?.entries && Array.isArray(playerData.entries)) {
    for (const entry of playerData.entries) {
      if (entry.tournamentId && entry.points && entry.createdAt) {
        let eventDate = entry.createdAt;
        
        // Get tournament date from matchDetails
        if (Array.isArray(entry.matchDetails) && entry.matchDetails.length > 0) {
          eventDate = entry.matchDetails[0].date || entry.createdAt;
        }
        
        championshipEvents.push({
          type: 'championship_points',
          playerId,
          tournamentId: entry.tournamentId,
          points: Number(entry.points),
          date: eventDate,
          entry: entry,
        });
      }
    }
  }
}
```

### 2. Combine Events and Sort Chronologically
```javascript
const allEvents = [...matches.map((m) => ({ ...m, type: 'match' })), ...championshipEvents];
const byDate = [...allEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
```

### 3. Process Events in Timeline Order
When processing each event:
- **Championship point events** (`type === 'championship_points'`):
  - Add points directly to player rating
  - Add to history array (for trend calculation)
  - Mark tournament as processed (prevents duplicate processing)

- **Tournament matches** (`isTournamentMatch === true`):
  - Count wins/losses ONLY
  - DO NOT calculate RPA delta (because points already applied via synthetic event)
  - Skip enrichment

- **Regular matches**:
  - Calculate full RPA delta
  - Update rating with delta
  - Add to enriched array
  - Track wins/losses

## Timeline Processing Flow

Example for Player A:

```
Initial rating: 1500 (from DEFAULT_RATING)

Timeline events sorted by date:
1. [2025-10-06] Regular Match → Calculate RPA delta (+20) → Rating: 1520
2. [2025-10-20] Championship Points Event → Add +893 → Rating: 2413
3. [2025-10-25] Regular Match → Calculate RPA delta (from rating 2413) → Rating updated

Final rating: Based on starting from 1520 → +893 → then subsequent match deltas
```

## Data Structure

### LeaderboardMap Entry (from ClubContext)
```javascript
leaderboardMap = {
  playerId: {
    id: string,
    entries: [
      {
        id: 'tournament_<tournamentId>',
        type: 'tournament_points',
        tournamentId: string,
        tournamentName: string,
        points: number,
        createdAt: ISO string,
        matchDetails: [
          {
            matchId: string,
            date: ISO string,  // Tournament date
            teamA: Array,
            teamB: Array,
            winner: 'A' | 'B',
            isTournamentMatch: true,
            // ... other match properties
          }
        ]
      }
    ]
  }
}
```

## Key Changes Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Point Application** | Extracted from leaderboardMap when match encountered | Treated as synthetic events sorted chronologically |
| **Timeline** | Points applied after match processing | Points applied at exact tournament date in timeline |
| **Tournament Matches** | Used for both wins/losses AND RPA delta | Used ONLY for wins/losses |
| **Subsequent Matches** | Started from base rating, then added points | Started from rating AFTER points were applied |
| **Chronological Order** | Partially - matches sorted, but points handled separately | Fully - all events sorted together by date |

## Verification Console Output

When processing, you should see:

```
🔍 [RPA DEBUG] Total events to process: 13 (matches: 10 + championships: 3)
🔍 [RPA DEBUG] First 5 events after sorting by date:
  1. [MATCH] Date: 2025-10-01T10:00:00.000Z | Type: regular | ID: match123
  2. [CHAMPIONSHIP] Date: 2025-10-10T15:30:00.000Z | Player: playerId1 | Points: 893 | Tournament: tournamentId
  3. [MATCH] Date: 2025-10-15T10:00:00.000Z | Type: tournament | ID: match456
  4. [CHAMPIONSHIP] Date: 2025-10-20T14:00:00.000Z | Player: playerId2 | Points: 456 | Tournament: tournamentId2
  5. [MATCH] Date: 2025-10-25T10:00:00.000Z | Type: regular | ID: match789

🏆 [RPA] Championship points for playerId1 at 2025-10-10T15:30:00.000Z: +893 (1520 → 2413)
🏆 [RPA] Championship points for playerId2 at 2025-10-20T14:00:00.000Z: +456 (1200 → 1656)
```

## Impact on Other Systems

### ClassificaPage
- No changes needed - receives leaderboard data as before
- Rankings now correctly reflect chronological point application

### Tournament Details/Stats
- Tournament matches still tracked for win/loss records
- Separate championship point events don't interfere with match history
- Timeline calculations now accurate

### RPA Calculations
- Championship points don't affect RPA calculation (they're separate events)
- Tournament matches don't have RPA impact (correct)
- Regular matches calculate RPA normally (correct)

## Files Modified

- `src/lib/ranking.js`: Core algorithm rewrite to handle synthetic championship events

## Testing Checklist

- ✅ Build passes with no errors
- ✅ Championship points are created as synthetic events
- ✅ Events sorted chronologically with all matches
- ✅ Tournament matches only count wins/losses
- ✅ Regular matches process normally
- ✅ Ratings reflect points applied at correct date
- ⚠️ Navigate to Classifica page and verify ranking shows correct points
