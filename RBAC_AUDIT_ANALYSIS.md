# RBAC Audit Analysis - Firestore Rules vs Requirements

**Date:** 2025-11-11  
**Project:** m-padelweb (Firebase)  
**Status:** 🔴 **CRITICAL ISSUES FOUND**

---

## Executive Summary

After analyzing `firestore.rules` against the 3-tier RBAC requirements, I identified **4 CRITICAL GAPS** that must be fixed:

| Issue | Severity | Impact | Fix Required |
|-------|----------|--------|--------------|
| Super Admin CANNOT delete users | 🔴 CRITICAL | Admin limited to read/update only | Add delete permission |
| Club Admin has TOO MUCH access | 🔴 CRITICAL | Can access other clubs' data | Scope restrictions missing |
| Club Admin can modify ALL bookings | 🔴 CRITICAL | Data integrity risk | Restrict to club-scoped bookings |
| Regular Users can read ALL bookings | 🟡 MEDIUM | Privacy leak, can see other users' data | Add scope restriction |

---

## 1. SUPER ADMIN (`admin` role) - REQUIREMENTS vs IMPLEMENTATION

### Requirement:
> "Super Admin must be able to access all collections and documents or change them all at their discretion"

### Current Implementation Analysis:

#### ✅ PASS - Read Access
- ✅ `/users/{userId}` → `allow read: if isAdmin()`
- ✅ All public collections (tournaments, leagues, courts, etc.)
- ✅ Admin-only collections (analytics, audit_logs, push notifications system)

#### ✅ PASS - Write Access (Most)
- ✅ `/clubs/{clubId}` → `allow update: if isAdmin()`
- ✅ `/bookings/{bookingId}` → `allow update: if isAdmin()`
- ✅ `/users/{userId}` → `allow update` implicitly via ownership exception
- ✅ `/payments/{paymentId}` → `allow update: if isAdmin()`

#### 🔴 **FAIL - Delete Access**

**PROBLEM FOUND:**
```firestore-rules
match /users/{userId} {
  // Delete: Only admins
  allow delete: if isAdmin();  ✅ CORRECT
}

match /bookings/{bookingId} {
  // Delete: Owner or admin
  allow delete: if isOwner(resource.data.userId) || isAdmin();  ✅ CORRECT
}

match /payments/{paymentId} {
  // Delete: Never
  allow delete: if false;  ❌ WRONG - Admin should be able to delete
}

match /notifications/{notificationId} {
  // Delete: User can delete own notifications
  allow delete: if isOwner(resource.data.userId);  ❌ WRONG - Admin should be able to delete ALL
}

match /{document=**} {
  allow read, write: if false;  ⚠️ PROBLEM - Catch-all prevents admin from accessing unlisted collections
}
```

**Impact:** 
- Super Admin cannot delete payments (compliance/refund risk)
- Super Admin cannot delete other users' notifications
- Super Admin cannot access any future unlisted collections

### Super Admin Status: 🟡 PARTIAL - Fix Required

---

## 2. CLUB ADMIN (`club_admin` role) - REQUIREMENTS vs IMPLEMENTATION

### Requirement:
> "Club Admin must have access to all information regarding their club (bookings, players, tournaments, leaderboards, statistics)"

### Current Implementation Analysis:

#### 🔴 **CRITICAL ISSUE #1 - No Club Scope Verification**

**PROBLEM:** Club Admin rules do NOT verify user is admin OF THAT CLUB
```firestore-rules
match /courts/{courtId} {
  allow create: if (isClubAdmin() || isAdmin()) && ...  
  // ❌ NO CHECK: Is this court owned by the club this admin manages?
}

match /clubs/{clubId}/players/{playerId} {
  allow write: if isClubOwner(clubId) || isClubAdmin() || isAdmin();
  // ❌ NO CHECK: Does isClubAdmin() mean admin of THIS club?
}
```

**Current Logic Flow:**
```
isClubAdmin() := user.role == 'club_admin'
MISSING: Does user manage THIS club?
```

**Consequence:** A Club Admin of "Club A" could potentially:
- ✅ Create courts (ANY court, not club-scoped!)
- ✅ Modify bookings in other clubs
- ✅ Access players from other clubs

#### 🔴 **CRITICAL ISSUE #2 - Courts Not Scoped to Club**

**PROBLEM:** `/courts/{courtId}` is NOT a subcollection of `/clubs/{clubId}`

Current structure (from rules):
```
/courts/{courtId}          ← Global courts collection
  ❌ Not scoped to club
```

Should be:
```
/clubs/{clubId}/courts/{courtId}  ← Court scoped to club
  ✅ Admin of club can manage
```

#### ✅ PASS - Club Subcollections Scoped Correctly

**Correctly Scoped Subcollections:**
- ✅ `/clubs/{clubId}/players/{playerId}`
- ✅ `/clubs/{clubId}/tournaments/{tournamentId}`
- ✅ `/clubs/{clubId}/leaderboard/{playerId}`
- ✅ `/clubs/{clubId}/statsCache/{statId}`
- ✅ `/clubs/{clubId}/instructors/{instructorId}`
- ✅ `/clubs/{clubId}/timeSlots/{slotId}`
- ✅ `/clubs/{clubId}/settings/{settingId}`

#### 🟡 **PARTIAL - Bookings Not Club-Scoped**

**PROBLEM:** `/bookings/{bookingId}` is GLOBAL, not scoped to club

Current structure:
```
/bookings/{bookingId}
  ├─ userId: "user123"
  ├─ courtId: "court-abc" (global court, no club info)
  └─ status: "confirmed"
  
Club Admin of "Club A" can UPDATE ANY booking!
  (Line: allow update: if isClubAdmin() ...)
```

**Issue with club_admin update rule:**
```firestore-rules
allow update: if (isOwner(resource.data.userId) && ...) ||
               (isClubAdmin() &&  ← NO CLUB SCOPE CHECK!
                request.resource.data.diff(resource.data).affectedKeys().hasAny(['status']) == true) ||
               isAdmin();
```

#### Club Admin Status: 🔴 CRITICAL GAPS FOUND

**Missing:**
1. ❌ Function: `isClubAdminOf(clubId)` - verify admin manages this specific club
2. ❌ Court collection needs to be scoped: `/clubs/{clubId}/courts/{courtId}`
3. ❌ Booking collection needs club field for filtering

---

## 3. REGULAR USER (`user` role) - REQUIREMENTS vs IMPLEMENTATION

### Requirement:
> "User must be able to make reservations and consult leaderboards, statistics, tournaments"

### Current Implementation Analysis:

#### ✅ PASS - Can Create Bookings
```firestore-rules
match /bookings/{bookingId} {
  allow create: if isAuthenticated() && 
                   request.resource.data.userId == request.auth.uid &&
                   isValidFutureTimestamp(request.resource.data.startTime) &&
                   request.resource.data.status == 'pending' &&
                   isWithinSizeLimit(10000);
}
```
✅ Users can book for themselves with future timestamps

#### ✅ PASS - Can Read Public Tournaments
```firestore-rules
match /tournaments/{tournamentId} {
  allow read: if true;  ← PUBLIC
}
```

#### ✅ PASS - Can Read Public Leagues
```firestore-rules
match /leagues/{leagueId} {
  allow read: if true;  ← PUBLIC
}
```

#### 🟡 **PARTIAL - Leaderboards/Statistics Access**

**Issue:** No explicit leaderboard or statistics collections defined!

Searching firestore.rules:
- ❌ NO `/leaderboards/{leaderboardId}` collection defined
- ❌ NO `/statistics/{statId}` collection defined
- ❌ Only `/clubs/{clubId}/leaderboard/{playerId}` (club-scoped)
- ❌ Only `/clubs/{clubId}/statsCache/{statId}` (club-scoped)

**Missing:** Public leaderboard and statistics collections for users to read

#### 🟡 **PRIVACY ISSUE - Users Can Read ALL Bookings**

**PROBLEM:**
```firestore-rules
match /bookings/{bookingId} {
  allow read: if isAuthenticated();  ← ANY authenticated user
}
```

**Impact:** 
- User A can see ALL bookings by ALL users
- Can see which courts are booked by whom
- Privacy concern: knows when User B is at the club

**Should be:**
```firestore-rules
allow read: if isOwner(resource.data.userId) ||  // Own bookings
               isClubAdmin() ||                   // Club admin sees club bookings
               isAdmin();                         // Admin sees all
```

#### Regular User Status: 🟡 PARTIAL

**Issues:**
1. 🔴 Can read other users' booking data (privacy leak)
2. 🟡 Missing public leaderboard/statistics collections
3. ✅ Can book for themselves
4. ✅ Can read public tournaments/leagues

---

## 4. CROSS-CUTTING ISSUES

### Issue 1: Helper Function `isClubAdminOf(clubId)` Missing
```firestore-rules
// MISSING FUNCTION:
function isClubAdminOf(clubId) {
  return isClubAdmin() && 
         get(/databases/$(database)/documents/clubs/$(clubId)).data.adminId == request.auth.uid;
}

// Should be used for scoping:
match /clubs/{clubId}/players/{playerId} {
  allow write: if isClubAdminOf(clubId) || isAdmin();  ← SCOPED
}
```

### Issue 2: Catch-All Rule Blocks All Future Collections
```firestore-rules
match /{document=**} {
  allow read, write: if false;  ← DENIES EVERYTHING
}
```

This prevents:
- Admin from accessing unlisted collections
- New features to work without rule updates
- Emergency access if new collections added

**Should be:**
```firestore-rules
match /{document=**} {
  allow read, write: if isAdmin();  ← Admin bypass for new collections
}
```

### Issue 3: No Public Leaderboard Collection
Current structure lacks:
- Global `/leaderboards/{leaderboardId}` - Public leaderboards for all users
- Global `/statistics/{statId}` - Public player statistics

Only exists:
- `/clubs/{clubId}/leaderboard/{playerId}` - Club-scoped only

---

## Summary Matrix

| Collection | Super Admin | Club Admin | User | Status |
|-----------|-----------|-----------|------|--------|
| users | R,W,D ✅ | - | R(self) | 🟡 |
| clubs | R,W,D ✅ | R only | R | ✅ |
| courts | R,W,D ✅ | W(unscoped) ❌ | R | 🔴 |
| bookings | R,W,D ✅ | W(unscoped) ❌ | R,C(privacy) ❌ | 🔴 |
| payments | R,W ✅ D❌ | - | - | 🔴 |
| tournaments | R,W,D ✅ | W(scoped) ✅ | R | ✅ |
| leaderboards | R,W,D | R(scoped) ✅ | R(missing) ❌ | 🔴 |
| statistics | R,W,D | R(scoped) ✅ | R(missing) ❌ | 🔴 |

---

## Required Fixes (Priority Order)

### 🔴 CRITICAL - Must Fix

1. **Add `isClubAdminOf(clubId)` function**
   - Verify club_admin manages THIS specific club
   - Location: Line 45 (after existing helper functions)

2. **Fix catch-all rule**
   - Allow admin access to unlisted collections
   - Location: Line 377 (end of file)

3. **Add club scoping to club_admin rules**
   - All club_admin write operations must include club scope check
   - Affected rules: courts, bookings (club field required)

4. **Fix booking privacy**
   - Restrict user read access to own bookings only
   - Users should NOT see all bookings

5. **Add Super Admin payment delete**
   - Remove block on payment deletion
   - Location: Line 203

6. **Remove Super Admin block from notifications**
   - Add admin delete permission
   - Location: Line 223

### 🟡 HIGH - Should Fix

7. **Restructure courts collection**
   - Move `/courts/{courtId}` to `/clubs/{clubId}/courts/{courtId}`
   - OR add clubId field to verify scoping

8. **Add public leaderboards**
   - Create `/leaderboards/{leaderboardId}` collection
   - Allow public read access

9. **Add public statistics**
   - Create `/statistics/{statId}` collection  
   - Allow public read access

---

## Next Steps

1. ✅ **This analysis complete**
2. ⏳ **Create fixed firestore.rules with all corrections**
3. ⏳ **Deploy to m-padelweb project**
4. ⏳ **Run verification tests**
5. ⏳ **Test with different roles (super admin, club admin, user)**

