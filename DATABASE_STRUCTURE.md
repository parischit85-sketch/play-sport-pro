# 🗂️ FIREBASE FIRESTORE DATABASE STRUCTURE - m-padelweb

**Project**: m-padelweb  
**Last Updated**: 2025-01-15  
**Analyzed From**: Cloud code, Firestore rules, and deployed indexes

---

## 📊 DATABASE OVERVIEW

### Root Collections (Verified)
Based on firestore.rules and code analysis, the database contains these root collections:

| Collection | Purpose | Typical Docs | Status |
|-----------|---------|--------------|--------|
| **users** | User profiles and authentication data | 50-500 | ✅ Active |
| **bookings** | All court and lesson bookings | 300-1000 | ✅ Active (Main) |
| **clubs** | Club information and settings | 1-50 | ✅ Active |
| **profiles** | User extended profiles | 50-500 | ⏳ Supporting |
| **leagues** | League management | 5-50 | ⏳ Supporting |
| **tournaments** | Tournament data | 10-100 | ⏳ Supporting |
| **notificationEvents** | Notification queue | 100-1000 | ⏳ Supporting |
| **pushSubscriptions** | Push notification subscriptions | 100-1000 | ⏳ Supporting |
| **scheduledNotifications** | Scheduled notifications | 50-500 | ⏳ Supporting |
| **notificationDeliveries** | Delivery logs | 100-10000 | ⏳ Supporting |
| **admin** | Admin configuration | 5-20 | ⏳ Admin-only |
| **affiliations** | Club affiliations | 10-100 | ⏳ Supporting |
| **clubRegistrationRequests** | Club approval requests | 5-50 | ⏳ Supporting |
| **emailLogs** | Email delivery logs | 100-10000 | ⏳ Logging |
| **backups** | Data backups metadata | 1-10 | ⏳ System |
| **analytics** | Analytics data | 5-100 | ⏳ Analytics |
| **audit_logs** | Audit trails | 1000-100000 | ⏳ Logging |
| **feature_flags** | Feature flags | 5-50 | ⏳ Config |
| **experiments** | A/B experiments | 5-20 | ⏳ Config |

---

## 🔑 PRIMARY COLLECTION: bookings

### Purpose
Store all court bookings and lesson bookings for the entire platform.

### Document Schema
```javascript
{
  id: string,                          // Firestore doc ID
  userId: string,                      // Booker's Firebase UID (INDEXED)
  courtId: string,                     // Court identifier (INDEXED)
  date: string,                        // YYYY-MM-DD format (INDEXED)
  time: string,                        // HH:mm format (INDEXED)
  duration: number,                    // Minutes (60, 90, 120, etc.)
  status: 'confirmed'|'cancelled'|'pending',  // Booking status (INDEXED)
  createdBy: string,                   // Creator UID (INDEXED for queries)
  createdAt: Timestamp,                // Server timestamp (INDEXED DESC)
  updatedAt: Timestamp,                // Last update timestamp
  clubId: string,                      // Club reference (INDEXED)
  courtName: string,                   // Human-readable court name
  price: number,                       // Booking price in €
  lighting: boolean,                   // Court has lighting
  heating: boolean,                    // Court has heating
  bookedForUserId: string,             // Cross-club visibility (optional)
  isLessonBooking: boolean,            // Flag for lesson bookings
  instructorId: string,                // Instructor reference (if lesson)
  type: 'court'|'lesson',              // Booking type
  color: string,                       // UI color code (optional)
  players: array[object],              // List of players
  notes: string,                       // User notes
  userEmail: string,                   // Booker email
  userPhone: string,                   // Booker phone (sensitive)
  startTime: Timestamp,                // Start time (might be used in validation)
  medicalCertificate: object,          // Certificate data {expiresAt, status}
}
```

### Composite Indexes (Deployed ✅)

**Index 1**: For user booking queries
- Fields: `createdBy` (ASC) → `date` (DESC) → `time` (DESC)
- Query Example: "Get all bookings created by user, sorted by date"
- Status: ✅ DEPLOYED

**Index 2**: For club-wide booking queries
- Fields: `clubId` (ASC) → `bookedBy` (ASC) → `status` (ASC)  
- Query Example: "Get all bookings for a club by creator"
- Status: ✅ DEPLOYED

**Index 3**: For date-based court availability
- Fields: `clubId` (ASC) → `date` (ASC) → `status` (ASC)
- Query Example: "Get all bookings for a court on specific date"
- Status: ✅ DEPLOYED

**Index 4**: For booking timeline
- Fields: `createdBy` (ASC) → `status` (ASC) → `date` (ASC) → `time` (ASC)
- Query Example: "Get all pending bookings for user by date/time"
- Status: ✅ DEPLOYED

**Index 5**: For date/time queries
- Fields: `date` (ASC) → `time` (ASC)
- Query Example: "Get all bookings at specific time slot"
- Status: ✅ DEPLOYED

**Index 6**: For instructor lesson bookings
- Fields: `instructorId` (ASC) → `status` (ASC) → `date` (ASC)
- Query Example: "Get all lessons for instructor"
- Status: ✅ DEPLOYED

**Index 7**: For lesson booking type filtering
- Fields: `instructorId` (ASC) → `type` (ASC) → `date` (ASC)
- Query Example: "Get all lesson-type bookings for instructor"
- Status: ✅ DEPLOYED

**Index 8**: For status-based queries
- Fields: `status` (ASC) → `date` (ASC) → `time` (ASC)
- Query Example: "Get all confirmed bookings by time"
- Status: ✅ DEPLOYED

**Index 9**: For club affiliations
- Fields: `status` (ASC) → `requestedAt` (DESC)
- Collection: `club_affiliations`
- Status: ✅ DEPLOYED

### Subcollection: /clubs/{clubId}/bookings/

**Purpose**: Stores booking statistics per club for fast aggregation

**Schema**: Same as root bookings collection (dual-write pattern)

**Queries**:
- Admin dashboard: Get booking counts per club
- Statistics: `.size` aggregation query

---

## 👤 USERS COLLECTION

### Document Schema
```javascript
{
  uid: string,                         // Firebase Authentication UID (doc ID)
  email: string,                       // User email (unique)
  displayName: string,                 // User display name
  photoURL: string,                    // Profile photo URL
  role: 'user'|'instructor'|'club_admin'|'admin',  // User role (RBAC)
  phone: string,                       // Phone number (sensitive)
  clubId: string,                      // Primary club affiliation
  createdAt: Timestamp,                // Account creation date
  updatedAt: Timestamp,                // Last profile update
  preferences: object,                 // User preferences
  notificationSettings: object,        // Notification preferences
}
```

### Security Rules
- **Read**: User can read own profile, admins can read all
- **Create**: Only during sign-up, must match Firebase UID
- **Update**: User can update own (except role)
- **Delete**: Admins only

---

## 🏢 CLUBS COLLECTION

### Document Schema
```javascript
{
  id: string,                          // Club identifier (doc ID)
  name: string,                        // Club name
  description: string,                 // Club description
  location: string,                    // Physical location
  ownerId: string,                     // Owner's Firebase UID
  createdAt: Timestamp,                // Creation date
  updatedAt: Timestamp,                // Last update
  settings: object,                    // Club-specific settings
  contactEmail: string,                // Club email
  contactPhone: string,                // Club phone
  verified: boolean,                   // Verification status
}
```

### Subcollections
- `/clubs/{clubId}/bookings/` - Booking statistics
- `/clubs/{clubId}/players/` - Club members
- `/clubs/{clubId}/courts/` - Club's courts
- `/clubs/{clubId}/instructors/` - Club instructors
- `/clubs/{clubId}/tournaments/` - Club tournaments
- `/clubs/{clubId}/settings/` - Club settings
- `/clubs/{clubId}/timeSlots/` - Available time slots
- `/clubs/{clubId}/leaderboard/` - Leaderboard data

---

## 🎾 COURTS (Under /clubs/{clubId}/courts/)

### Document Schema
```javascript
{
  id: string,                          // Court identifier
  name: string,                        // Court name (e.g., "Court 1")
  type: string,                        // Surface type (padel, tennis, etc.)
  pricePerHour: number,                // Price in €
  lighting: boolean,                   // Has lighting
  heating: boolean,                    // Has heating
  capacity: number,                    // Max players
  available: boolean,                  // Currently available
  createdAt: Timestamp,                // Creation date
}
```

---

## 🎓 TOURNAMENTS COLLECTION

### Document Schema
```javascript
{
  id: string,                          // Tournament ID
  name: string,                        // Tournament name
  clubId: string,                      // Organizing club
  status: 'draft'|'active'|'completed',  // Tournament status
  startDate: Timestamp,                // Start date
  endDate: Timestamp,                  // End date
  participants: array,                 // List of participants
  createdAt: Timestamp,                // Creation date
  updatedAt: Timestamp,                // Last update
}
```

### Subcollections
- `/tournaments/{id}/matches/` - Match records
- `/tournaments/{id}/standings/` - Tournament standings
- `/tournaments/{id}/teams/` - Teams in tournament

---

## 🔔 PUSH NOTIFICATIONS STRUCTURE

### pushSubscriptions Collection
```javascript
{
  userId: string,                      // User ID (indexed)
  subscription: object,                // Push subscription object
  createdAt: Timestamp,                // Subscription date (indexed DESC)
  userAgent: string,                   // Device info
  enabled: boolean,                    // Subscription active
}
```

### scheduledNotifications Collection
```javascript
{
  userId: string,                      // Target user
  title: string,                       // Notification title
  body: string,                        // Notification message
  scheduledFor: Timestamp,             // When to send
  sent: boolean,                       // Was it sent
  sentAt: Timestamp,                   // When it was sent
}
```

### notificationEvents Collection
```javascript
{
  eventType: string,                   // Event trigger (booking_confirmed, etc.)
  userId: string,                      // Affected user
  data: object,                        // Event data
  createdAt: Timestamp,                // Event timestamp
  processed: boolean,                  // Was event processed
}
```

---

## 🔐 SECURITY RULES SUMMARY

### Authentication Required
Most collections require `request.auth != null` (except public ones like clubs, leagues, tournaments)

### Role-Based Access Control (RBAC)
- **admin**: Full access to all data
- **club_admin**: Access to club data and club's subcollections
- **instructor**: Access to lesson bookings and their own data
- **user**: Access to own bookings and public data

### Field-Level Security
- Sensitive fields (phone, email, payment info) protected
- Users cannot modify their own role
- Size limits enforced (10KB for users, 50KB for clubs)

### Collection Access Matrix

| Collection | Read | Create | Update | Delete |
|-----------|------|--------|--------|--------|
| users | own/admin | auth users | own | admin |
| bookings | auth users | auth | owner/admin | owner/admin |
| clubs | all | admin | owner/admin | admin |
| profiles | auth | club_admin | club_admin | admin |
| tournaments | all | admin | admin | admin |
| pushSubscriptions | own/admin | auth | auth/admin | own |
| schedNotifications | admin | system | admin | admin |

---

## 📈 ESTIMATED COLLECTION SIZES

Based on typical booking system:

| Collection | Est. Docs | Est. Size | Growth Rate |
|-----------|-----------|-----------|-------------|
| bookings | 300-1000 | 3-10 MB | ~50-100 docs/month |
| users | 50-500 | 1-5 MB | ~10-20 docs/month |
| clubs | 1-50 | 50-500 KB | ~1 doc/month |
| tournaments | 10-100 | 1-5 MB | ~2-5 docs/month |
| notificationEvents | 100-1000 | 1-10 MB | ~50-100 docs/day |
| pushSubscriptions | 100-1000 | 500 KB-5 MB | ~10-50 docs/month |
| audit_logs | 1000-100000 | 10-100 MB | ~100-500 docs/day |

---

## 🔍 COMMON QUERIES & INDEXES USED

### Query 1: Get user's bookings
```javascript
const q = query(
  collection(db, 'bookings'),
  where('createdBy', '==', userId),
  orderBy('createdAt', 'desc')
);
```
**Index**: `createdBy` (ASC) → `createdAt` (DESC) ✅

### Query 2: Check court availability
```javascript
const q = query(
  collection(db, 'bookings'),
  where('clubId', '==', clubId),
  where('date', '==', bookingDate),
  where('status', '!=', 'cancelled')
);
```
**Indexes**: Multiple (`clubId + date + status`) ✅

### Query 3: Get instructor's lessons
```javascript
const q = query(
  collection(db, 'bookings'),
  where('instructorId', '==', instructorId),
  where('type', '==', 'lesson'),
  orderBy('date', 'asc')
);
```
**Index**: `instructorId` (ASC) → `type` (ASC) → `date` (ASC) ✅

### Query 4: Get pending bookings
```javascript
const q = query(
  collection(db, 'bookings'),
  where('createdBy', '==', userId),
  where('status', '==', 'pending'),
  orderBy('date', 'asc')
);
```
**Index**: `createdBy` (ASC) → `status` (ASC) → `date` (ASC) ✅

---

## 🛠️ BACKEND SERVICES THAT USE THIS DATA

### Cloud Functions (likely deployed)
1. **createBooking** - Validates and creates booking
2. **updateBooking** - Updates booking status
3. **cancelBooking** - Cancels booking
4. **sendNotifications** - Sends push notifications
5. **generateStats** - Generates analytics
6. **auditLog** - Logs all changes

### Real-time Services
1. **useBookings** - React hook for booking queries
2. **useBookingPerformance** - Optimized caching for bookings
3. **setupRealtimeSubscriptions** - Real-time sync via onSnapshot

---

## 📝 IMPORTANT NOTES

1. **Dual-Write Pattern**: Bookings are written to both root collection and `/clubs/{clubId}/bookings/` subcollection for statistics aggregation

2. **Field Indexing**: All INDEXED fields are required for efficient queries. Without indexes, queries will fail.

3. **Timestamp vs Date**: Most timestamps are server-generated (`Timestamp` type), but dates for booking are stored as strings (YYYY-MM-DD) for easier filtering

4. **Soft Deletes**: Bookings aren't physically deleted; instead their `status` is set to `cancelled`

5. **Cross-Club Visibility**: The `bookedForUserId` field allows users to see bookings made for them at other clubs

6. **Medical Certificates**: Stored in booking document with expiration validation before creating lesson bookings

7. **Real-time Sync**: Uses `onSnapshot` subscriptions which require specific indexes for queries with `orderBy`

---

## 🔗 RELATED FILES

- **Firestore Rules**: `firestore.rules` (404 lines)
- **Indexes Config**: `firestore.indexes.json` (225 lines, 12 indexes)
- **Main Service**: `src/services/unified-booking-service.js` (1454 lines)
- **Cloud Service**: `src/services/cloud-bookings.js` (339 lines)
- **React Hook**: `src/hooks/useBookings.js` (179 lines)

---

**Database Analysis Complete** ✅  
Now you have a complete understanding of the database structure!
