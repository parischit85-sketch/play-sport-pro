# 🚀 ROADMAP MIGLIORAMENTI 2025 - Play-Sport.pro

**Data analisi**: 16 Ottobre 2025
**Sistema**: Stabile, Production-ready
**Obiettivo**: Ottimizzazione e nuove features

---

## 🎯 TOP 10 AREE DI MIGLIORAMENTO

### **1. 🔧 Convert Cloud Functions to ES6 Modules** ⭐⭐⭐⭐⭐
**Priority**: CRITICAL
**Effort**: 2 ore
**Impact**: Sblocca 5 funzioni attualmente disabilitate

#### Problema
```js
// functions/index.js - TEMPORANEAMENTE DISABILITATE
// export { migrateProfilesFromSubcollection, verifyProfileMigration } from './migrateProfiles.js';
// export { cleanupAbandonedRegistrations, manualCleanupAbandonedRegistrations, getCleanupStats } from './cleanupAbandonedRegistrations.js';
```

#### Soluzione
- Convertire `migrateProfiles.js` da CommonJS (`exports`) a ES6 (`export`)
- Convertire `cleanupAbandonedRegistrations.js` da CommonJS a ES6
- Testare deploy completo

#### Benefici
✅ 5 Cloud Functions disponibili
✅ Cleanup automatico registrazioni abbandonate
✅ Migrazione profili completabile
✅ Statistiche cleanup disponibili

---

### **2. 📧 Configure Email Service (Gmail/SendGrid)** ⭐⭐⭐⭐⭐
**Priority**: HIGH
**Effort**: 30 minuti
**Impact**: Email notifications funzionanti

#### Stato Attuale
```js
// functions/scheduledCertificateReminders.js
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreplay@play-sport.pro';
// ⚠️ FROM_EMAIL non configurato → email non funzionano
```

#### Opzioni
**A) Gmail (veloce - test/dev)**
```bash
firebase functions:secrets:set FROM_EMAIL
# Inserisci: parischit85@gmail.com
firebase deploy --only functions:dailyCertificateCheck
```

**B) SendGrid (professionale - prod)**
```bash
firebase functions:secrets:set SENDGRID_API_KEY
firebase functions:secrets:set FROM_EMAIL
# FROM_EMAIL: noreplay@play-sport.pro
```

**C) SMTP Register.it (dominio proprio)**
```bash
firebase functions:secrets:set SMTP_HOST
firebase functions:secrets:set SMTP_PORT
firebase functions:secrets:set SMTP_USER
firebase functions:secrets:set SMTP_PASSWORD
```

#### Benefici
✅ Email certificati medici funzionanti
✅ Notifiche booking/match operative
✅ Reminder automatici attivi
✅ Professional branding

---

### **3. 🧹 Remove 32 Unknown Users** ⭐⭐⭐⭐
**Priority**: MEDIUM-HIGH
**Effort**: 15 minuti
**Impact**: Database cleanup, dati puliti

#### Problema
```js
// ClubContext.jsx - 32 utenti senza dati
players.filter(p => p.firstName === 'Unknown' && p.lastName === 'User')
// 32 profili orfani creati da bug risolto
```

#### Soluzione
**Opzione A: UI Manuale**
1. Dashboard Admin → Club Users
2. Filtra "Unknown User"
3. Seleziona tutti → Delete batch

**Opzione B: Script automatico**
```js
// scripts/cleanup-unknown-users.js
const unknownUsers = await db.collection('users')
  .where('firstName', '==', 'Unknown')
  .where('lastName', '==', 'User')
  .get();

for (const doc of unknownUsers.docs) {
  await doc.ref.delete();
  await admin.auth().deleteUser(doc.id);
}
```

#### Benefici
✅ -32 record database
✅ Dashboard più pulita
✅ Query performance migliorata
✅ Analytics accurate

---

### **4. 🗑️ Remove Debug Logs da Production** ⭐⭐⭐
**Priority**: MEDIUM
**Effort**: 10 minuti
**Impact**: Console più pulita, performance

#### File da pulire
```js
// ClubContext.jsx (lines 282-291, 360-369)
console.log('🧹 [ClubContext] Filtered valid players:', validPlayers.length);
console.log('🧹 [ClubContext] Players:', players);

// PlayerMedicalTab.jsx (lines 20-35)
console.log('🔍 [PlayerMedicalTab] Props:', props);

// MedicalCertificatesManager.jsx (line 50)
console.log('📊 [Certificates] Data loaded:', certificatesData);
```

#### Soluzione
- Wrap tutti i log in `if (import.meta.env.DEV)`
- Oppure creare utility logger:
```js
// utils/logger.js
export const logger = {
  log: (...args) => import.meta.env.DEV && console.log(...args),
  error: (...args) => console.error(...args), // sempre attivo
  warn: (...args) => import.meta.env.DEV && console.warn(...args),
};
```

#### Benefici
✅ Console production pulita
✅ -5KB bundle size
✅ Meno overhead logging
✅ Professional UX

---

### **5. 🔔 Push Notifications con FCM** ⭐⭐⭐⭐
**Priority**: MEDIUM
**Effort**: 4-6 ore
**Impact**: Real-time notifications native

#### Stato Attuale
Sistema Push Notifications v2.0 deployed ma non completamente integrato

#### Features da implementare
1. **Certificate expiry push** (oltre a email)
2. **Booking confirmations** real-time
3. **Match updates** live
4. **Payment notifications**
5. **Admin alerts** (nuove registrazioni, etc)

#### Tech Stack
- Firebase Cloud Messaging (FCM)
- Service Worker già configurato
- VAPID keys già presenti
- Backend già pronto

#### Implementazione
```js
// services/push-notifications.js
export async function sendCertificateExpiryPush(userId, daysRemaining) {
  const subscription = await getPushSubscription(userId);
  
  await fetch('/api/send-push', {
    method: 'POST',
    body: JSON.stringify({
      subscription,
      notification: {
        title: '⚠️ Certificato in Scadenza',
        body: `Il tuo certificato scade tra ${daysRemaining} giorni`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'certificate-expiry',
        data: { type: 'certificate', action: 'view' }
      }
    })
  });
}
```

#### Benefici
✅ Engagement +40%
✅ Retention migliorato
✅ UX native app-like
✅ Notifiche real-time

---

### **6. 📱 PWA Optimization & Offline Mode** ⭐⭐⭐⭐
**Priority**: MEDIUM
**Effort**: 3-4 ore
**Impact**: App installabile, funziona offline

#### Miglioramenti PWA
1. **Offline booking view** (cached data)
2. **Service worker caching strategy**
3. **Background sync** per booking
4. **Install prompt** ottimizzato
5. **App shortcuts** per quick actions

#### Implementazione
```js
// public/service-worker.js - Cache Strategy
const CACHE_NAME = 'playsport-v1';
const URLS_TO_CACHE = [
  '/',
  '/dashboard',
  '/bookings',
  '/manifest.json',
  '/icons/icon-192x192.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

// Network-first strategy for API calls
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  }
});
```

#### App Shortcuts (manifest.json)
```json
{
  "shortcuts": [
    {
      "name": "Prenota Campo",
      "short_name": "Prenota",
      "url": "/bookings?action=new",
      "icons": [{ "src": "/icons/booking-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "I Miei Booking",
      "short_name": "Booking",
      "url": "/dashboard/bookings",
      "icons": [{ "src": "/icons/list-96x96.png", "sizes": "96x96" }]
    }
  ]
}
```

#### Benefici
✅ Install rate +30%
✅ Funziona offline (modalità limitata)
✅ Faster load times (cached)
✅ Native app experience

---

### **7. 🎨 Dark Mode Completamento** ⭐⭐⭐
**Priority**: LOW-MEDIUM
**Effort**: 2-3 ore
**Impact**: UX moderno, accessibility

#### Stato Attuale
- Dark mode implementato ma non completo
- Alcuni componenti non supportano dark mode
- Transizioni non smooth

#### Componenti da aggiornare
```bash
# Componenti senza dark mode support
src/components/booking/ClubSelectionForBooking.jsx
src/features/clubs/ClubPreview.jsx
src/features/admin/AdminClubDashboard.jsx
src/components/ui/BookingDetailModal.jsx
```

#### Sistema Theme Centralizzato
```js
// contexts/ThemeContext.jsx
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 
           (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

#### Benefici
✅ Modern UX
✅ Accessibility migliorato
✅ Battery saving (OLED screens)
✅ User preference rispettata

---

### **8. 📊 Analytics Dashboard per Admin** ⭐⭐⭐
**Priority**: MEDIUM
**Effort**: 6-8 ore
**Impact**: Business insights, decision making

#### Features
1. **Revenue Dashboard**
   - Booking revenue per day/week/month
   - Court utilization rate
   - Peak hours heatmap
   - Revenue forecasting

2. **User Analytics**
   - Active users trend
   - Registration conversion rate
   - Churn rate
   - User segmentation

3. **Booking Analytics**
   - Booking patterns (ora/giorno/campo)
   - Cancellation rate
   - Average booking duration
   - Popular court types

4. **Certificate Analytics**
   - Expiry dashboard
   - Renewal rate
   - Compliance percentage

#### Tech Stack
```js
// services/analytics.js
import { db } from './firebase';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export async function getBookingRevenue(clubId, startDate, endDate) {
  const bookings = await db.collection('bookings')
    .where('clubId', '==', clubId)
    .where('date', '>=', startDate)
    .where('date', '<=', endDate)
    .where('status', '==', 'confirmed')
    .get();

  return bookings.docs.reduce((total, doc) => {
    return total + (doc.data().price || 0);
  }, 0);
}

export async function getCourtUtilization(clubId, date) {
  // Calculate % of available slots booked
  const courts = await getCourts(clubId);
  const bookings = await getDayBookings(clubId, date);
  
  const totalSlots = courts.length * 24; // 24 ore
  const bookedSlots = bookings.length;
  
  return (bookedSlots / totalSlots) * 100;
}
```

#### UI Component
```jsx
// features/admin/AnalyticsDashboard.jsx
<div className="analytics-dashboard">
  <RevenueChart data={revenueData} />
  <UtilizationHeatmap data={utilizationData} />
  <UserTrends data={userStats} />
  <CertificateCompliance data={certStats} />
</div>
```

#### Benefici
✅ Data-driven decisions
✅ Revenue optimization
✅ Resource allocation
✅ Forecast accuracy

---

### **9. 🔒 Security Hardening** ⭐⭐⭐⭐
**Priority**: HIGH
**Effort**: 4-5 ore
**Impact**: Security compliance, trust

#### Areas to improve
1. **Rate Limiting API calls**
2. **CSRF Protection**
3. **Input Sanitization** (già fatto per password)
4. **SQL Injection prevention** (Firestore queries)
5. **XSS Protection** (sanitize user input)
6. **Security Headers**

#### 1. Rate Limiting
```js
// middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts
  skipSuccessfulRequests: true
});
```

#### 2. Input Sanitization
```js
// utils/sanitize.js
import DOMPurify from 'dompurify';

export function sanitizeInput(input) {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [] 
    });
  }
  return input;
}

export function sanitizeObject(obj) {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
```

#### 3. Security Headers (vite.config.js)
```js
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'security-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('X-Frame-Options', 'DENY');
          res.setHeader('X-XSS-Protection', '1; mode=block');
          res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
          res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
          next();
        });
      }
    }
  ]
});
```

#### Benefici
✅ GDPR compliance
✅ Security audit pass
✅ User trust aumentato
✅ Attack surface ridotta

---

### **10. 🧪 Testing Framework Setup** ⭐⭐⭐
**Priority**: MEDIUM
**Effort**: 8-10 ore (setup iniziale)
**Impact**: Code quality, confidence

#### Stack già installato
```json
// package.json
{
  "devDependencies": {
    "vitest": "^2.1.1",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.4",
    "msw": "^2.0.0"
  }
}
```

#### Test Categories
1. **Unit Tests** - Utilities, validators, helpers
2. **Component Tests** - UI components
3. **Integration Tests** - User flows
4. **E2E Tests** - Complete workflows

#### Example Tests
```js
// tests/unit/validators/passwordValidator.test.js
import { describe, it, expect } from 'vitest';
import { calculatePasswordStrength, checkPasswordRequirements } from '@/utils/validators/passwordValidator';

describe('Password Validator', () => {
  it('should return 0 for empty password', () => {
    expect(calculatePasswordStrength('')).toBe(0);
  });

  it('should return 100 for strong password', () => {
    const strength = calculatePasswordStrength('MyP@ssw0rd123!');
    expect(strength).toBe(100);
  });

  it('should check all requirements', () => {
    const reqs = checkPasswordRequirements('Test123!');
    expect(reqs.hasMinLength).toBe(true);
    expect(reqs.hasUppercase).toBe(true);
    expect(reqs.hasLowercase).toBe(true);
    expect(reqs.hasNumber).toBe(true);
    expect(reqs.hasSpecialChar).toBe(true);
  });
});

// tests/component/PasswordStrengthMeter.test.jsx
import { render, screen } from '@testing-library/react';
import PasswordStrengthMeter from '@/components/registration/PasswordStrengthMeter';

describe('PasswordStrengthMeter', () => {
  it('renders weak password indicator', () => {
    render(<PasswordStrengthMeter password="123" />);
    expect(screen.getByText(/debole/i)).toBeInTheDocument();
  });

  it('renders strong password indicator', () => {
    render(<PasswordStrengthMeter password="MyP@ssw0rd123!" />);
    expect(screen.getByText(/forte/i)).toBeInTheDocument();
  });
});
```

#### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

#### Benefici
✅ Regression prevention
✅ Code confidence
✅ Documentation (tests as specs)
✅ Refactoring safety
✅ CI/CD automation

---

## 📅 IMPLEMENTATION TIMELINE

### **Sprint 1 (Week 1-2)** - Critical Fixes
- ✅ Convert Cloud Functions to ES6
- ✅ Configure Email Service
- ✅ Remove Unknown Users
- ✅ Remove Debug Logs

**Deliverable**: Sistema completamente operativo senza workaround

---

### **Sprint 2 (Week 3-4)** - Core Features
- ✅ Push Notifications con FCM
- ✅ PWA Optimization
- ✅ Dark Mode Completion

**Deliverable**: App installabile con notifiche real-time

---

### **Sprint 3 (Week 5-6)** - Analytics & Security
- ✅ Analytics Dashboard
- ✅ Security Hardening

**Deliverable**: Sistema sicuro con insights business

---

### **Sprint 4 (Week 7-8)** - Quality & Testing
- ✅ Testing Framework
- ✅ Documentation completa
- ✅ Performance audit

**Deliverable**: Code quality production-grade

---

## 🎯 BONUS FEATURES (Optional)

### **11. Multi-language Support (i18n)**
- English, Italian, Spanish
- Dynamic translation loading
- User preference persistence

### **12. Payment Integration**
- Stripe/PayPal integration
- Subscription management
- Invoice generation

### **13. Social Features**
- Player rating system
- Match history sharing
- Tournament brackets
- Leaderboards

### **14. Advanced Booking**
- Recurring bookings
- Group bookings
- Waitlist management
- Dynamic pricing

### **15. Mobile App (React Native)**
- Native iOS/Android app
- Shared codebase with web
- App Store deployment

---

## 📊 METRICS & KPIs

### Performance
- Lighthouse Score: 95+ (currently ~85)
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Bundle Size: <500KB (currently ~1.3MB)

### Business
- User Registration: +20%
- Booking Conversion: +15%
- Email Open Rate: 40%+
- Push Notification CTR: 10%+

### Quality
- Test Coverage: 80%+
- Bug Rate: <1 per week
- Security Score: A+ (Mozilla Observatory)
- Accessibility Score: 100 (WCAG AA)

---

## 🚀 PRIORITÀ CONSIGLIATE

**Questa settimana (Must-have)**:
1. ✅ Convert Cloud Functions to ES6
2. ✅ Configure Email Service
3. ✅ Remove Unknown Users

**Questo mese (Should-have)**:
4. ✅ Push Notifications
5. ✅ PWA Optimization
6. ✅ Security Hardening

**Prossimi 3 mesi (Nice-to-have)**:
7. ✅ Analytics Dashboard
8. ✅ Dark Mode Completion
9. ✅ Testing Framework
10. ✅ Remove Debug Logs

---

**Creato**: 16 Ottobre 2025
**Versione**: 1.0
**Status**: Draft → Ready for Review
**Owner**: Development Team

---

## 📝 NOTES

Questo roadmap è basato su:
- ✅ Analisi codebase completa
- ✅ TODO/FIXME/BUG comments
- ✅ Documentation review
- ✅ Best practices industry
- ✅ User feedback patterns
- ✅ Technical debt assessment

**Next Review**: Fine mese (review progress + adjust priorities)
