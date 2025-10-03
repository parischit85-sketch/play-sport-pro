# 🏗️ Documentazione Tecnica Completa - Playsport Pro

## 📚 Indice
1. [Architettura Sistema](#architettura-sistema)
2. [Core Libraries](#core-libraries)
3. [Componenti React](#componenti-react)
4. [Gestione Stato](#gestione-stato)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Performance](#performance)
8. [Sicurezza](#sicurezza)

---

## 🏗️ Architettura Sistema

### **Overview Architetturale**
```
┌─────────────────────────────────────────────────────────────┐
│                     PLAYSPORT PRO                          │
├─────────────────────────────────────────────────────────────┤
│  Frontend Layer (React + Vite)                             │
│  ├── Components (UI/UX)                                    │
│  ├── Hooks (Business Logic)                                │
│  ├── Services (External APIs)                              │
│  └── Utils (Helpers)                                       │
├─────────────────────────────────────────────────────────────┤
│  Core Libraries Layer                                      │
│  ├── 🛡️ Security Library                                  │
│  ├── 📊 Analytics Library                                  │
│  ├── 🚀 Performance Library                               │
│  └── 💾 Database Optimization                             │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure Layer                                      │
│  ├── 🔥 Firebase (Backend)                                │
│  ├── 📱 Capacitor (Mobile)                                │
│  ├── 🔍 Sentry (Monitoring)                               │
│  └── 📈 Google Analytics                                  │
└─────────────────────────────────────────────────────────────┘
```

### **Tecnologie Core**
- **Frontend**: React 18 + Vite 7 + TypeScript
- **Styling**: TailwindCSS + Sass
- **State**: React Query + Context API
- **Routing**: React Router DOM v7
- **Forms**: React Hook Form + Zod
- **Build**: Vite con optimizzazioni avanzate

---

## 📦 Core Libraries

### **🛡️ Security Library (`src/lib/security.js`)**

#### **Input Sanitization**
```javascript
import { sanitizeHTML, sanitizeText } from '@/lib/security';

// Sanitizzazione HTML sicura
const cleanHTML = sanitizeHTML('<script>alert("xss")</script><p>Safe content</p>');
// Risultato: '<p>Safe content</p>'

// Sanitizzazione testo
const cleanText = sanitizeText('<p>Hello World</p>');
// Risultato: 'Hello World'
```

#### **Validation System**
```javascript
import { validateEmail, validatePassword, validatePhoneNumber } from '@/lib/security';

// Validazione email
const emailResult = validateEmail('user@example.com');
// { isValid: true, normalized: 'user@example.com' }

// Validazione password con feedback
const passwordResult = validatePassword('MyPass123!');
// { 
//   isValid: true, 
//   strength: 85, 
//   feedback: ['Strong password'],
//   requirements: { length: true, uppercase: true, numbers: true, symbols: true }
// }
```

#### **Rate Limiting**
```javascript
import { RateLimiter } from '@/lib/security';

const limiter = new RateLimiter(100, 60000); // 100 requests per minute

// Check rate limit
if (limiter.check('user-123')) {
  // Process request
} else {
  // Rate limited
}
```

#### **CSRF Protection**
```javascript
import { CSRFProtection } from '@/lib/security';

const csrf = new CSRFProtection();

// Generate token
const token = csrf.generateToken();

// Validate token
if (csrf.validateToken(token)) {
  // Valid CSRF token
}
```

### **📊 Analytics Library (`src/lib/analytics.js`)**

#### **Event Tracking**
```javascript
import { trackEvent, trackPageView, trackTiming } from '@/lib/analytics';

// Track user interaction
trackEvent('button_click', {
  elementId: 'book-court-btn',
  page: '/courts',
  category: 'engagement'
});

// Track business event
trackEvent('booking_completed', {
  bookingId: 'BK123456',
  value: 50.00,
  currency: 'EUR',
  category: 'conversion'
});

// Track page view
trackPageView('/dashboard', 'Dashboard', {
  userRole: 'premium',
  section: 'main'
});

// Track performance
trackTiming('api_response', 250, 'get_bookings');
```

#### **E-commerce Tracking**
```javascript
import { analytics } from '@/lib/analytics';

// Track purchase
analytics.trackPurchase({
  transactionId: 'TXN123',
  value: 50.00,
  currency: 'EUR',
  items: [{
    itemId: 'court_booking',
    itemName: 'Court Booking',
    price: 50.00,
    quantity: 1
  }]
});

// Track conversion
analytics.trackConversion('booking_completion', {
  value: 50.00,
  currency: 'EUR'
});
```

### **🚀 Performance Library (`src/lib/performance.js`)**

#### **Web Vitals Monitoring**
```javascript
import { performanceMonitor } from '@/lib/performance';

// Initialize monitoring
performanceMonitor.init({
  enableCLS: true,
  enableFID: true,
  enableLCP: true,
  enableFCP: true,
  enableTTFB: true
});

// Get performance report
const report = performanceMonitor.getReport();
```

#### **Service Worker Management**
```javascript
import { serviceWorkerManager } from '@/lib/performance';

// Register service worker
await serviceWorkerManager.register('/sw.js');

// Update cache
await serviceWorkerManager.updateCache();

// Check for updates
if (await serviceWorkerManager.checkForUpdates()) {
  // New version available
}
```

### **💾 Database Optimization (`src/lib/databaseOptimization.js`)**

#### **Smart Caching**
```javascript
import { DatabaseOptimizer } from '@/lib/databaseOptimization';

// Query with caching
const bookings = await DatabaseOptimizer.query('bookings', {
  where: [['status', '==', 'confirmed']],
  orderBy: [['date', 'desc']],
  limit: 50
});

// Cache invalidation
DatabaseOptimizer.invalidateCache('bookings');

// Cache statistics
const stats = DatabaseOptimizer.getCacheStats();
```

#### **Batch Operations**
```javascript
import { DatabaseOptimizer } from '@/lib/databaseOptimization';

// Add operations to batch
DatabaseOptimizer.batchSet('matches', 'match1', matchData);
DatabaseOptimizer.batchUpdate('users', 'user1', userData);
DatabaseOptimizer.batchDelete('bookings', 'booking1');

// Execute batch
await DatabaseOptimizer.flushBatch();
```

#### **Real-time Subscriptions**
```javascript
import { DatabaseOptimizer } from '@/lib/databaseOptimization';

// Subscribe to changes
const unsubscribe = DatabaseOptimizer.subscribe(
  'bookings',
  { where: [['userId', '==', currentUserId]] },
  (data) => {
    // Handle real-time updates
    setBookings(data.data);
  }
);

// Cleanup
unsubscribe();
```

---

## ⚛️ Componenti React

### **Core Components**

#### **ErrorBoundary (`src/components/ErrorBoundary.jsx`)**
```jsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Your routes */}
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
```

#### **PerformanceMonitor (`src/components/PerformanceMonitor.jsx`)**
```jsx
import { PerformanceMonitor } from '@/components/PerformanceMonitor';

function App() {
  return (
    <PerformanceMonitor>
      <Router>
        {/* Your app */}
      </Router>
    </PerformanceMonitor>
  );
}
```

#### **Analytics Provider (`src/components/AnalyticsProvider.jsx`)**
```jsx
import { AnalyticsProvider } from '@/components/AnalyticsProvider';

function App() {
  return (
    <AnalyticsProvider>
      <Router>
        {/* Your app */}
      </Router>
    </AnalyticsProvider>
  );
}
```

### **Business Components**

#### **BookingForm (`src/components/BookingForm.jsx`)**
```jsx
import { BookingForm } from '@/components/BookingForm';

function BookingPage() {
  const handleBookingSubmit = async (bookingData) => {
    try {
      await createBooking(bookingData);
      trackEvent('booking_completed', {
        courtId: bookingData.courtId,
        value: bookingData.price
      });
    } catch (error) {
      trackError(error, { component: 'BookingForm' });
    }
  };

  return (
    <BookingForm
      onSubmit={handleBookingSubmit}
      availableSlots={availableSlots}
      courts={courts}
    />
  );
}
```

#### **MatchCreation (`src/components/MatchCreation.jsx`)**
```jsx
import { MatchCreation } from '@/components/MatchCreation';

function MatchPage() {
  return (
    <MatchCreation
      players={players}
      courts={courts}
      onMatchCreated={(match) => {
        trackEvent('match_created', {
          matchType: match.type,
          courtId: match.courtId
        });
      }}
    />
  );
}
```

### **UI Components**

#### **LoadingSpinner (`src/components/ui/LoadingSpinner.jsx`)**
```jsx
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Usage
<LoadingSpinner size="large" color="primary" />
```

#### **Modal (`src/components/ui/Modal.jsx`)**
```jsx
import { Modal } from '@/components/ui/Modal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Confirm Action"
    >
      <p>Are you sure?</p>
    </Modal>
  );
}
```

---

## 🗃️ Gestione Stato

### **Context Providers**

#### **AuthContext (`src/contexts/AuthContext.jsx`)**
```jsx
import { useAuth } from '@/contexts/AuthContext';

function ProtectedComponent() {
  const { user, login, logout, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <LoginForm onLogin={login} />;

  return <Dashboard user={user} onLogout={logout} />;
}
```

#### **UIContext (`src/contexts/UIContext.jsx`)**
```jsx
import { useUI } from '@/contexts/UIContext';

function Header() {
  const { darkMode, toggleDarkMode, showToast } = useUI();

  return (
    <header className={darkMode ? 'dark' : 'light'}>
      <button onClick={toggleDarkMode}>
        Toggle Theme
      </button>
      <button onClick={() => showToast('Hello!', 'success')}>
        Show Toast
      </button>
    </header>
  );
}
```

### **React Query Setup**

#### **QueryClient Configuration (`src/lib/queryClient.js`)**
```javascript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});
```

#### **Custom Hooks**
```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch bookings
export function useBookings(userId) {
  return useQuery({
    queryKey: ['bookings', userId],
    queryFn: () => DatabaseOptimizer.query('bookings', {
      where: [['userId', '==', userId]]
    }),
    enabled: !!userId,
  });
}

// Create booking mutation
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: (newBooking) => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries(['bookings']);
      
      // Add optimistic update
      queryClient.setQueryData(['bookings', newBooking.userId], (old) => {
        return old ? [...old, newBooking] : [newBooking];
      });

      // Track analytics
      trackEvent('booking_created', {
        bookingId: newBooking.id,
        value: newBooking.price
      });
    },
    onError: (error) => {
      trackError(error, { mutation: 'createBooking' });
    },
  });
}
```

---

## 🗄️ Database Schema

### **Firestore Collections**

#### **Users Collection**
```javascript
// /users/{userId}
{
  id: "user123",
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  role: "player", // "player" | "admin" | "super_admin"
  clubId: "sporting_cat",
  preferences: {
    notifications: true,
    darkMode: false,
    language: "it"
  },
  stats: {
    matchesPlayed: 15,
    matchesWon: 8,
    winRate: 53.3,
    ranking: 1250
  },
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastLoginAt: Timestamp
}
```

#### **Clubs Collection**
```javascript
// /clubs/{clubId}
{
  id: "sporting_cat",
  name: "Sporting Cat",
  address: "Via Roma 123, Milano",
  phone: "+39 02 1234567",
  email: "info@sportingcat.it",
  website: "https://sportingcat.it",
  courts: [
    {
      id: "court1",
      name: "Campo 1",
      type: "tennis",
      surface: "clay",
      hourlyRate: 25.00,
      availability: {
        monday: { start: "08:00", end: "22:00" },
        tuesday: { start: "08:00", end: "22:00" },
        // ...
      }
    }
  ],
  admins: {
    "admin123": true,
    "admin456": true
  },
  settings: {
    bookingAdvanceDays: 7,
    cancellationHours: 24,
    timezone: "Europe/Rome"
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### **Bookings Collection**
```javascript
// /bookings/{bookingId}
{
  id: "booking123",
  userId: "user123",
  clubId: "sporting_cat",
  courtId: "court1",
  date: Timestamp, // Date of booking
  startTime: "14:00",
  endTime: "15:30",
  duration: 90, // minutes
  price: 37.50,
  currency: "EUR",
  status: "confirmed", // "pending" | "confirmed" | "cancelled" | "completed"
  paymentStatus: "paid", // "pending" | "paid" | "refunded"
  paymentMethod: "card",
  notes: "Lesson with instructor",
  metadata: {
    source: "web", // "web" | "mobile" | "admin"
    userAgent: "...",
    ipAddress: "192.168.1.1"
  },
  createdAt: Timestamp,
  updatedAt: Timestamp,
  cancelledAt: Timestamp,
  completedAt: Timestamp
}
```

#### **Matches Collection**
```javascript
// /matches/{matchId}
{
  id: "match123",
  type: "singles", // "singles" | "doubles"
  clubId: "sporting_cat",
  courtId: "court1",
  players: {
    player1: {
      id: "user123",
      name: "John Doe",
      ranking: 1250
    },
    player2: {
      id: "user456", 
      name: "Jane Smith",
      ranking: 1180
    }
  },
  score: {
    sets: [
      { player1: 6, player2: 4 },
      { player1: 3, player2: 6 },
      { player1: 6, player2: 2 }
    ],
    winner: "player1",
    duration: 105 // minutes
  },
  date: Timestamp,
  status: "completed", // "scheduled" | "in_progress" | "completed" | "cancelled"
  visibility: "public", // "public" | "private"
  tags: ["tournament", "final"],
  stats: {
    rallies: 145,
    aces: { player1: 8, player2: 5 },
    doubleFaults: { player1: 2, player2: 4 },
    winnersCount: { player1: 25, player2: 18 }
  },
  rankingDelta: {
    player1: +15,
    player2: -12
  },
  createdAt: Timestamp,
  updatedAt: Timestamp,
  completedAt: Timestamp
}
```

### **Indexes Firestore**

```json
{
  "indexes": [
    {
      "collectionGroup": "bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "bookings", 
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "clubId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION", 
      "fields": [
        { "fieldPath": "clubId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "players.player1.id", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION", 
      "fields": [
        { "fieldPath": "players.player2.id", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## 🔌 API Reference

### **Firebase Services**

#### **Authentication Service (`src/services/auth.js`)**
```javascript
import { authService } from '@/services/auth';

// Login with email/password
const user = await authService.login(email, password);

// Login with Google
const user = await authService.loginWithGoogle();

// Register new user
const user = await authService.register(email, password, displayName);

// Logout
await authService.logout();

// Reset password
await authService.resetPassword(email);

// Update profile
await authService.updateProfile({ displayName, photoURL });
```

#### **Firestore Service (`src/services/firestore.js`)**
```javascript
import { firestoreService } from '@/services/firestore';

// Create document
const doc = await firestoreService.create('bookings', bookingData);

// Get document by ID
const booking = await firestoreService.getById('bookings', bookingId);

// Query documents
const bookings = await firestoreService.query('bookings', {
  where: [['userId', '==', userId]],
  orderBy: [['date', 'desc']],
  limit: 10
});

// Update document
await firestoreService.update('bookings', bookingId, updateData);

// Delete document
await firestoreService.delete('bookings', bookingId);

// Real-time subscription
const unsubscribe = firestoreService.subscribe(
  'bookings',
  { where: [['userId', '==', userId]] },
  (bookings) => setBookings(bookings)
);
```

### **Business Logic APIs**

#### **Booking API (`src/api/bookings.js`)**
```javascript
import { bookingAPI } from '@/api/bookings';

// Create booking
const booking = await bookingAPI.create({
  courtId: 'court1',
  date: '2025-09-21',
  startTime: '14:00',
  endTime: '15:30',
  userId: 'user123'
});

// Get user bookings
const bookings = await bookingAPI.getUserBookings(userId);

// Get court availability
const availability = await bookingAPI.getCourtAvailability(courtId, date);

// Cancel booking
await bookingAPI.cancel(bookingId, reason);

// Check booking conflicts
const conflicts = await bookingAPI.checkConflicts(bookingData);
```

#### **Match API (`src/api/matches.js`)**
```javascript
import { matchAPI } from '@/api/matches';

// Create match
const match = await matchAPI.create({
  player1Id: 'user123',
  player2Id: 'user456',
  courtId: 'court1',
  date: '2025-09-21',
  type: 'singles'
});

// Update match score
await matchAPI.updateScore(matchId, {
  sets: [{ player1: 6, player2: 4 }],
  currentSet: 2
});

// Complete match
await matchAPI.complete(matchId, finalScore);

// Get match history
const matches = await matchAPI.getHistory(userId, { limit: 20 });

// Get ranking
const ranking = await matchAPI.getRanking(clubId);
```

### **External APIs**

#### **Analytics API**
```javascript
import { analyticsAPI } from '@/api/analytics';

// Track custom event
analyticsAPI.trackEvent('user_action', {
  action: 'court_booking',
  value: 50.00
});

// Set user properties
analyticsAPI.setUserProperties({
  user_type: 'premium',
  club_affiliation: 'sporting_cat'
});

// Track conversion
analyticsAPI.trackConversion('booking_completion', {
  value: 50.00,
  currency: 'EUR'
});
```

#### **Error Tracking API**
```javascript
import { errorTracker } from '@/api/errorTracking';

// Track error
errorTracker.captureError(error, {
  component: 'BookingForm',
  action: 'submit',
  userId: user.id
});

// Track message
errorTracker.captureMessage('Custom log message', 'info');

// Add breadcrumb
errorTracker.addBreadcrumb({
  message: 'User clicked submit button',
  category: 'ui.click',
  level: 'info'
});
```

---

## ⚡ Performance

### **Bundle Optimization**

#### **Vite Configuration (`vite.config.js`)**
```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          ui: ['@tanstack/react-query', 'react-router-dom'],
          utils: ['zod', 'react-hook-form']
        }
      }
    },
    chunkSizeWarningLimit: 600,
    sourcemap: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app']
  }
});
```

#### **Code Splitting**
```jsx
import { lazy, Suspense } from 'react';

// Lazy load components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Bookings = lazy(() => import('@/pages/Bookings'));
const Matches = lazy(() => import('@/pages/Matches'));

// Route configuration
const routes = [
  {
    path: '/dashboard',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Dashboard />
      </Suspense>
    )
  }
];
```

### **Caching Strategy**

#### **Service Worker (`public/sw.js`)**
```javascript
const CACHE_VERSION = 'v1.0.1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// Cache static assets
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // ... other static assets
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Cache strategy: Cache First for static, Network First for dynamic
self.addEventListener('fetch', (event) => {
  if (isStaticAsset(event.request.url)) {
    event.respondWith(cacheFirst(event.request));
  } else {
    event.respondWith(networkFirst(event.request));
  }
});
```

### **Performance Monitoring**

#### **Core Web Vitals**
```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics({ name, value, rating }) {
  gtag('event', 'web_vital', {
    event_category: 'performance',
    event_label: name,
    value: Math.round(value),
    rating
  });
}

// Monitor all Core Web Vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## 🛡️ Sicurezza

### **Content Security Policy**
```html
<!-- CSP Header -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
               font-src 'self' https://fonts.gstatic.com; 
               img-src 'self' data: https:; 
               connect-src 'self' https://*.googleapis.com https://sentry.io;">
```

### **Input Validation**
```javascript
import { z } from 'zod';

// Booking validation schema
const bookingSchema = z.object({
  courtId: z.string().min(1, 'Court ID required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  userId: z.string().min(1, 'User ID required')
});

// Validate booking data
function validateBookingData(data) {
  try {
    return bookingSchema.parse(data);
  } catch (error) {
    throw new ValidationError('Invalid booking data', error.issues);
  }
}
```

### **Firebase Security Rules**
```javascript
// Security functions
function isAuthenticated() {
  return request.auth != null;
}

function isOwner(userId) {
  return request.auth.uid == userId;
}

function isClubAdmin(clubId) {
  return isAuthenticated() && 
         get(/databases/$(database)/documents/clubs/$(clubId)).data.admins[request.auth.uid] == true;
}

function validateBookingData(data) {
  return data.keys().hasAll(['courtId', 'date', 'startTime', 'endTime', 'userId']) &&
         data.date is timestamp &&
         data.userId == request.auth.uid;
}
```

---

## 🔧 Development Workflow

### **Scripts NPM**
```json
{
  "scripts": {
    "dev": "vite",
    "dev:host": "vite --host",
    "build": "vite build",
    "build:analyze": "vite build --analyze",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,css,md,json}\"",
    "type-check": "tsc --noEmit"
  }
}
```

### **Git Hooks (Husky)**
```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
npm run type-check
npm test
```

### **Environment Setup**
```bash
# .env.development
VITE_APP_ENVIRONMENT=development
VITE_APP_DEBUG=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false

# .env.production
VITE_APP_ENVIRONMENT=production
VITE_APP_DEBUG=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=true
```

---

## 📋 API Status Codes

### **HTTP Status Codes**
- `200` - OK: Richiesta completata con successo
- `201` - Created: Risorsa creata con successo
- `400` - Bad Request: Dati di input non validi
- `401` - Unauthorized: Autenticazione richiesta
- `403` - Forbidden: Accesso negato
- `404` - Not Found: Risorsa non trovata
- `409` - Conflict: Conflitto con stato corrente
- `422` - Unprocessable Entity: Validazione fallita
- `429` - Too Many Requests: Rate limit superato
- `500` - Internal Server Error: Errore server

### **Custom Error Codes**
```javascript
const ErrorCodes = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'AUTH001',
  AUTH_USER_NOT_FOUND: 'AUTH002',
  AUTH_EMAIL_NOT_VERIFIED: 'AUTH003',
  
  // Booking
  BOOKING_COURT_UNAVAILABLE: 'BOOK001',
  BOOKING_TIME_CONFLICT: 'BOOK002',
  BOOKING_ADVANCE_LIMIT: 'BOOK003',
  
  // Match
  MATCH_INVALID_PLAYERS: 'MATCH001',
  MATCH_ALREADY_EXISTS: 'MATCH002',
  
  // General
  VALIDATION_ERROR: 'VAL001',
  RATE_LIMIT_EXCEEDED: 'RATE001',
  INSUFFICIENT_PERMISSIONS: 'PERM001'
};
```

---

Questa documentazione tecnica fornisce una visione completa dell'architettura e implementazione di Playsport Pro, con esempi pratici per ogni componente del sistema! 🚀