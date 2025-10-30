# Tournament Team Registration Fix

## Date: 2025-10-21

## Problem

When trying to register a team for a tournament, the following error occurred:

```
Error registering team: TypeError: Cannot read properties of undefined (reading 'indexOf')
at _ResourcePath.fromString (firebase_firestore.js:3090:13)
at doc (firebase_firestore.js:15904:28)
at registerTeam (teamsService.js:39:27)
```

## Root Cause

The `registerTeam` function in `teamsService.js` expected a **single object parameter** with all team data, but `TeamRegistrationModal.jsx` was calling it with **three separate parameters**:

```javascript
// ❌ INCORRECT (before fix)
const result = await registerTeam(clubId, tournament.id, {
  name: formData.teamName,
  players: teamPlayers,
});
```

## Solution

### 1. Fixed Function Call Signature

Updated `TeamRegistrationModal.jsx` to pass a single object with all required properties:

```javascript
// ✅ CORRECT (after fix)
const result = await registerTeam({
  clubId: clubId,
  tournamentId: tournament.id,
  teamName: formData.teamName,
  players: teamPlayers,
  registeredBy: user?.uid || 'unknown',
});
```

### 2. Fixed Player Data Structure

Changed the player mapping to match the expected structure in `teamsService.js`:

**Before:**
```javascript
.map(p => ({
  id: p.id,
  userId: p.userId || p.id,
  name: p.name || p.userName || 'Unknown',
  rating: p.rating || p.baseRating || p.tournamentData?.currentRanking || 1500,
}));
```

**After:**
```javascript
.map(p => ({
  playerId: p.id || p.userId,
  playerName: p.name || p.userName || 'Unknown',
  ranking: p.rating || p.baseRating || p.tournamentData?.currentRanking || 1500,
  avatarUrl: p.avatar || p.avatarUrl || null,
}));
```

### 3. Added User Authentication

Added `useAuth` hook to get the current user's ID:

```javascript
import { useAuth } from '../../../../contexts/AuthContext';

function TeamRegistrationModal({ tournament, clubId, onClose, onSuccess }) {
  const { user } = useAuth();
  // ...
  registeredBy: user?.uid || 'unknown',
```

## Additional Issue: Missing Firestore Index

### Error

```
Error getting tournaments: FirebaseError: The query requires an index.
```

### Action Required

You need to create a composite index in Firebase Console:

1. Open the Firebase Console: https://console.firebase.google.com
2. Navigate to your project: `m-padelweb`
3. Go to **Firestore Database** → **Indexes**
4. Click on the auto-generated link in the error message OR manually create:

**Index Configuration:**
- **Collection:** `tournaments` (collection group)
- **Fields:**
  1. `status` - Ascending
  2. `createdAt` - Ascending
  3. `__name__` - Ascending

**Or use the direct link from error:**
```
https://console.firebase.google.com/v1/r/project/m-padelweb/firestore/indexes?create_composite=...
```

## Files Modified

### src/features/tournaments/components/registration/TeamRegistrationModal.jsx

**Changes:**
1. Added import: `import { useAuth } from '../../../../contexts/AuthContext';`
2. Added `const { user } = useAuth();` hook
3. Fixed `registerTeam()` call to pass single object parameter
4. Updated player data structure to match service expectations
5. Used `user?.uid` for `registeredBy` field

## Testing Checklist

- [ ] Navigate to Tournaments page
- [ ] Click "Nuovo Torneo"
- [ ] Complete all 5 steps of tournament creation wizard
- [ ] Click "Crea Torneo" on final step
- [ ] Verify tournament is created
- [ ] Click "Iscrivi Squadra" on tournament detail page
- [ ] Select team name
- [ ] Select players (2 for couples, 4 for teams)
- [ ] Click "Registra Squadra"
- [ ] Verify team appears in teams list
- [ ] Verify no console errors

## Expected Behavior

1. **Tournament List:** Loads without index errors (after creating index)
2. **Team Registration Modal:** Opens with player selection
3. **Player Selection:** Shows all club players in dropdown
4. **Submit:** Successfully registers team and closes modal
5. **Teams List:** Shows newly registered team with correct player info
6. **Tournament Stats:** Updates team count automatically

## Technical Notes

### registerTeam Function Signature

```javascript
/**
 * @param {Object} teamData - Team registration data
 * @param {string} teamData.clubId - Club ID
 * @param {string} teamData.tournamentId - Tournament ID
 * @param {string} teamData.teamName - Team name
 * @param {Array} teamData.players - Array of player objects
 * @param {string} teamData.players[].playerId - Player ID
 * @param {string} teamData.players[].playerName - Player name
 * @param {number} teamData.players[].ranking - Player ranking
 * @param {string|null} teamData.players[].avatarUrl - Player avatar URL
 * @param {string} teamData.registeredBy - User ID who registered the team
 * @returns {Promise<{success: boolean, teamId?: string, error?: string}>}
 */
```

### Data Flow

```
TeamRegistrationModal (user input)
  ↓
registerTeam({ clubId, tournamentId, teamName, players, registeredBy })
  ↓
teamsService.registerTeam(teamData)
  ↓
Firestore: /clubs/{clubId}/tournaments/{tournamentId}/teams/{teamId}
  ↓
Updates tournament.registration.currentTeamsCount
  ↓
Returns { success: true, teamId: 'xxx' }
```

## Status

- ✅ Function call signature fixed
- ✅ Player data structure corrected
- ✅ User authentication added
- ⏳ Firestore index needs to be created (manual step in Firebase Console)
- ⏳ Needs user testing

## Next Steps

1. **Create Firestore index** (see instructions above)
2. **Test team registration** with real data
3. **Verify team withdrawal** functionality works
4. **Test tournament full** scenario (max teams reached)
5. **Test duplicate player** validation (player already in another team)
