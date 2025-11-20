# GitHub Copilot Instructions - Play Sport Pro

**Version:** 1.0.5  
**Last Updated:** November 19, 2025  
**Project:** Multi-club sports management platform (padel/tennis)

---

## 🎯 Project Overview

Play Sport Pro is a **Firebase-based multi-tenant sports management platform** for padel/tennis clubs. The app uses React 18 + Vite with a mobile-first PWA architecture and native Android support via Capacitor.

**Key Architecture Pattern:** Multi-club isolation using Firestore subcollections under `clubs/{clubId}/*`. All club-specific data (courts, bookings, players, matches) lives in subcollections to enforce data isolation.

---

## 🏗️ Critical Architecture Patterns

### Multi-Club Data Isolation

**ALWAYS** scope queries by `clubId` when working with club-specific data:

```javascript
// ✅ CORRECT - scoped to club
const bookingsRef = collection(db, `clubs/${clubId}/bookings`);
const q = query(bookingsRef, where('date', '==', dateString));

// ❌ WRONG - no club scoping (security rules will block)
const bookingsRef = collection(db, 'bookings');
```

**Why:** Firestore security rules enforce club-scoped access. The old single-tenant "leagues" system has been fully migrated to multi-club architecture.

### Context Hierarchy (Top to Bottom)

```
SecurityProvider          // CSRF protection, input sanitization
├─ NotificationProvider   // Toast notifications, alerts
   └─ AuthProvider        // User auth, roles, club memberships
      └─ UIProvider       // Dark mode, modals, global UI state
         └─ ClubProvider  // Club data (only when /club/:clubId routes)
            └─ Your Component
```

**Import pattern:**
- Use `@` path aliases defined in `vite.config.js`
- `@services/` for Firebase operations
- `@features/` for domain-specific components
- `@components/` for reusable UI
- `@utils/` for pure functions
- `@hooks/` for custom React hooks

### Service Worker & PWA

**IMPORTANT:** Service Worker is **ALWAYS ENABLED** in this project (even in dev) for push notifications testing.

```javascript
// Don't unregister SW like typical dev setups
// Push notifications require active SW
// See src/main.jsx for SW initialization
```

---

## 🔥 Firebase Patterns

### Initialization (CRITICAL)

**ONLY** use `src/services/firebase.js` for Firebase initialization:

```javascript
import { db, auth, storage, functions } from '@services/firebase.js';
```

**NEVER** initialize Firebase elsewhere. Legacy `cloud.js` has been removed. See `FIREBASE_INITIALIZATION_FIX.md` for migration details.

### Database Path Aliases

```javascript
// Use these standardized imports
import { getBookingsCollection } from '@services/unified-booking-service.js';
import { getClubSettings } from '@services/club-settings.js';
import { getUserClubMemberships } from '@services/club-users.js';
```

### Security Rules Reality

**Current state:** Production rules are deployed (`firestore.rules`) but **require careful `clubId` scoping**.

Common permission errors:
- `getUserProfile()` / `getUserClubRoles()` have 60s cooldown after `permission-denied` 
- Always check user is affiliated before querying club data
- Admin operations require `isClubAdminOf(clubId)` check

**Deploy rules:** `firebase deploy --only firestore:rules`

---

## 🎨 Code Style & Conventions

### Component Structure

```jsx
// ✅ Preferred pattern
function MyComponent() {
  // 1. Hooks (top)
  const { user } = useAuth();
  const { currentClub } = useClub();
  
  // 2. State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 3. Effects
  useEffect(() => {
    // side effects
  }, []);
  
  // 4. Handlers
  const handleSubmit = async () => { };
  
  // 5. Render
  return <div>...</div>;
}
```

### Error Handling

```javascript
// ✅ Use try-catch with user-friendly messages
try {
  await someOperation();
  showSuccess('Operation completed');
} catch (error) {
  console.error('Debug context:', error);
  showError('User-friendly message');
  // trackError(error, context); // Sentry integration available
}
```

### Console Logging

```javascript
// Development: verbose logging OK
// Production: Only errors (Vite strips console.log in build)

// Use emojis for visual scanning
console.log('✅ Success:', data);
console.warn('⚠️ Warning:', issue);
console.error('❌ Error:', error);
```

---

## 🔐 Authentication & Authorization

### User Roles (from `USER_ROLES` in `AuthContext.jsx`)

```javascript
SUPER_ADMIN   // Platform owner (full access)
CLUB_ADMIN    // Club manager (club-scoped admin)
INSTRUCTOR    // Teacher (limited permissions)
USER          // Player/member (basic access)
```

### Permission Checks

```javascript
// From AuthContext
const { user, userRole, hasRole, isClubAdmin, isAffiliated } = useAuth();

// Check role globally
if (hasRole(USER_ROLES.SUPER_ADMIN)) { }

// Check club-specific admin
if (isClubAdmin(clubId)) { }

// Check if user can access club
if (isAffiliated(clubId)) { }
```

### Club Admin Auto-Redirect

Club admins with **single club membership** are auto-redirected to `/club/{clubId}/admin/dashboard` (see `useClubAdminRedirect` hook).

---

## 📦 Key Services & APIs

### Unified Booking Service (`unified-booking-service.js`)

**THE** source of truth for all bookings (court + lesson bookings unified).

```javascript
import UnifiedBookingService from '@services/unified-booking-service.js';

// Create booking (handles conflicts, hole prevention)
const booking = await UnifiedBookingService.createBooking(clubId, {
  courtId, date, time, duration, userId, type: 'court'
});

// Load bookings for date (cached)
const bookings = await UnifiedBookingService.loadBookings(clubId, dateString);

// Conflict detection built-in
const conflicts = await UnifiedBookingService.checkConflicts(/* ... */);
```

**Features:**
- Automatic conflict detection
- Hole prevention (no gaps in schedules)
- Medical certificate validation
- Cache invalidation on mutations

### Club Settings (`club-settings.js`)

**Per-club configuration** stored at `clubs/{clubId}/settings/config`:

```javascript
import { getClubSettings, updateClubSettings } from '@services/club-settings.js';

const settings = await getClubSettings(clubId);
// Returns: { bookingConfig: {...}, lessonConfig: {...} }

// Schema validated with Zod (safe defaults on invalid data)
```

**Config structure:**
```javascript
bookingConfig: {
  slotMinutes: 30,           // Time slot granularity
  dayStartHour: 8,
  dayEndHour: 23,
  defaultDurations: [60, 90, 120],
  holePrevention: true,      // Prevent schedule gaps
  maxAdvanceDays: 14
}
```

### Push Notifications (`utils/push.js` + `services/unifiedPushService.js`)

**Recently fixed** (Nov 2025) - now 95%+ functional. Uses Service Worker + Netlify Functions.

```javascript
import { subscribeToPush, sendPushNotification } from '@utils/push.js';

// Subscribe user to push
const subscription = await subscribeToPush(userId);

// Send notification (calls Netlify function)
await sendPushNotification(userId, {
  title: 'New Booking',
  body: 'Your court is ready',
  data: { bookingId, clubId }
});
```

**Architecture:** Service Worker handles notifications → Netlify Functions manage subscriptions → Firestore stores in `pushSubscriptions` collection.

---

## 🧪 Testing Conventions

### Test Framework

Vitest + React Testing Library. Current coverage: ~48% (target: 80%+).

```javascript
// Run tests
npm test              // Single run
npm run test:watch    // Watch mode
npm run test:coverage // Coverage report
```

### Example Test Pattern

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

describe('MyComponent', () => {
  it('should render correctly', async () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

**Note:** Some tests use `vi.doMock` incorrectly (legacy). Prefer `vi.mock` at module level. See `src/tests/rating-history.test.js` FIXME comments.

---

## 🚀 Build & Deployment

### Development

```powershell
npm run dev           # Start dev server (localhost:5173)
npm run dev:host      # Accessible on LAN
npm run dev:clean     # Clear Vite cache & restart
```

**Dev utilities:**
- `?enableSW` - Enable Service Worker in dev
- `?mockPush` - Mock push notifications
- `window.backfillPublicTournamentsIndex()` - Dev utility for data migration

### Production Build

```powershell
npm run build         # Vite build (outputs to /dist)
npm run preview       # Preview production build locally
```

**Build optimizations:**
- Code splitting enabled
- TailwindCSS purging
- Terser minification (strips console.log)
- Service Worker version auto-bumped (see `scripts/bump-sw-version.cjs`)

### Firebase Deployment

```powershell
# Deploy everything
firebase deploy

# Deploy specific targets
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only functions

# Common workflow
npm run build
firebase deploy --only hosting
```

**Important:** Always deploy Firestore indexes before security rules: `firebase deploy --only firestore:indexes`

### Android Build

```powershell
npx cap sync android        # Sync web assets to Android
npx cap open android        # Open Android Studio
# Then build APK in Android Studio
```

---

## 🐛 Common Issues & Solutions

### "Permission Denied" Errors

**Symptoms:** `getUserProfile()` or `getUserClubRoles()` fail repeatedly

**Cause:** Firestore security rules block access OR document doesn't exist

**Fix:**
1. Ensure user profile exists at `profiles/{uid}`
2. Deploy latest rules: `firebase deploy --only firestore:rules`
3. Hard refresh browser (clear auth cache)
4. Code has 60s cooldown after `permission-denied` to prevent spam

### "Requires Composite Index" Error

**Symptoms:** Firestore query fails with index error

**Fix:**
```powershell
firebase deploy --only firestore:indexes
# Wait 5-10 minutes for index build
firebase firestore:indexes  # Check status
```

### React Duplicate Instance (HMR Issues)

**Symptoms:** "Invalid hook call" or multiple React instances

**Cause:** Vite HMR with Firebase modules

**Fix:** Check `vite.config.js` → `resolve.dedupe` includes React + Firebase. Clear cache: `npm run dev:clean`

### Service Worker Not Updating

**Symptoms:** Old code persists after deployment

**Fix:**
1. `scripts/bump-sw-version.cjs` auto-runs on build
2. Check `public/sw.js` version number incremented
3. Force refresh: Ctrl+Shift+R (Chrome) or unregister SW manually

### LocalStorage Namespacing

**Pattern:** Keys prefixed with `psp:v1[:clubId]:<key>` (see `src/utils/storage.js`)

**Why:** Prevents cross-club data leakage and supports invalidation

---

## 📝 Documentation Quick Reference

**Architecture:**
- `ANALISI_COMPLETA_PROGETTO_2025.md` - Full system analysis
- `MULTI_CLUB_MIGRATION.md` - Multi-tenant migration guide
- `00_DATABASE_COMPLETE_REFERENCE.md` - Database schema

**Features:**
- `00_README_REGISTRATION_IMPROVEMENTS.md` - User registration flow
- `BOOKING_AUTO_REFRESH_SYSTEM.md` - Booking real-time updates
- `PUSH_NOTIFICATIONS_FIX_COMPLETO.md` - Push notifications architecture

**Deployment:**
- `QUICK_START_DEPLOY_11_NOV_2025.md` - Quick deploy checklist
- `DEPLOYMENT_GUIDE_COMPLETO.md` - Comprehensive deploy guide
- `ADMIN_PORTAL_README.md` - Admin features documentation

**Troubleshooting:**
- `ANALISI_CRITICITA_SALVATAGGIO_BOOKINGS.md` - Booking save issues
- `FIRESTORE_RULES_TROUBLESHOOTING.md` - Security rules debugging
- `PUSH_ERROR_TROUBLESHOOTING.md` - Push notification debugging

---

## ✨ Best Practices for AI Agents

### When Creating New Features

1. **Check club context:** Does this feature need `clubId` scoping?
2. **Use existing services:** Don't duplicate Firebase queries - reuse services
3. **Handle loading states:** Show spinners/skeletons while loading
4. **Error boundaries:** Wrap risky components in `<ErrorBoundary>`
5. **Mobile-first:** Test on small screens (320px+)
6. **Dark mode:** Use Tailwind's `dark:` variants (see `UIContext`)

### When Modifying Bookings

**ALWAYS:**
- Use `UnifiedBookingService` (never direct Firestore writes)
- Invalidate cache after mutations
- Check conflicts before creating
- Include medical certificate validation
- Fire analytics events (`trackEvent` from `@lib/analytics.js`)

### When Working with Clubs

**Required checks:**
```javascript
// 1. User must be affiliated
if (!isAffiliated(clubId)) {
  showError('You must join this club first');
  return;
}

// 2. Admin operations need permission
if (!isClubAdmin(clubId)) {
  showError('Admin access required');
  return;
}

// 3. Always pass clubId to services
const data = await loadClubData(clubId); // ✅
const data = await loadClubData();       // ❌
```

### When Adding Dependencies

**Avoid heavy libraries** - bundle size matters for PWA performance:
- Current bundle: ~1MB (optimized)
- Target: Keep under 1.5MB
- Check: `npm run build` shows chunk sizes

**Prefer:**
- `date-fns` over Moment.js (lighter)
- Tailwind utilities over CSS frameworks
- Native APIs over polyfills (when supported)

### Code Review Checklist

Before marking work complete:

- [ ] `npm run lint` passes
- [ ] `npm test` passes (or new tests added)
- [ ] No `console.log` in production code
- [ ] Mobile responsive (test on phone)
- [ ] Dark mode tested
- [ ] Error handling implemented
- [ ] Loading states shown
- [ ] Analytics tracked (if user action)
- [ ] Documentation updated (if architecture change)

---

## 🎓 Learning Resources

**Start here:**
1. Read `00_START_HERE.md` - Unified Public View implementation example
2. Read `ANALISI_COMPLETA_PROGETTO_2025.md` - System overview
3. Study `src/services/unified-booking-service.js` - Service pattern
4. Review `src/contexts/AuthContext.jsx` - Context pattern

**Common workflows:**
- Adding a new page: Copy pattern from `src/pages/DashboardPage.jsx`
- Adding a service: Copy pattern from `src/services/club-settings.js`
- Adding a hook: Copy pattern from `src/hooks/useClubSettings.js`
- Adding a component: Copy pattern from `src/components/ui/Button.jsx`

**Questions?** Check 30+ markdown files in root directory - comprehensive docs exist for most subsystems.

---

**Remember:** This is a production app serving real users. Prioritize data integrity, security, and user experience over speed of implementation.
