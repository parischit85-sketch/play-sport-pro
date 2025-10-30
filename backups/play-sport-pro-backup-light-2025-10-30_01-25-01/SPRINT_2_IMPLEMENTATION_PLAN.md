# 🚀 Sprint 2 - Core Features Implementation Plan

**Date:** 17 Ottobre 2025  
**Duration:** 3-4 weeks (part-time)  
**Focus:** Push Notifications FCM + PWA + Dark Mode

---

## 📊 Sprint Overview

### Goals
- ✅ Integrate Push Notifications v2.0 with all app features
- ✅ Enhance PWA offline capabilities
- ✅ Complete dark mode in remaining components

### Priorities
1. **#5 - Push Notifications FCM Integration** (4-6h) - HIGH IMPACT
2. **#6 - PWA Optimization** (3-4h) - MEDIUM IMPACT
3. **#8 - Dark Mode Completion** (2-3h) - QUICK WIN

### Total Estimated Time
- **Minimum:** 9 hours
- **Maximum:** 13 hours
- **Target:** 11 hours (distributed over 2-3 weeks)

---

## 🔔 Priority #5: Push Notifications FCM Integration

### Current State
✅ Backend infrastructure complete:
- `services/push-notifications.js` (152 lines) - Core service
- `functions/scheduledCertificateReminders.js` - Certificate expiry reminders
- Firestore `/pushSubscriptions` collection ready
- Service worker with push event handlers

❌ Not integrated with:
- Booking confirmations
- Match notifications
- Certificate expiry alerts (frontend)
- Admin announcements

### Implementation Plan

#### Step 1: Create Integration Service (1 hour)

**File:** `src/services/push-notifications-integration.js`

```javascript
/**
 * Push Notifications Integration
 * Connects push notification service with app features
 */

import { sendPushNotification, subscribeToPush, unsubscribeFromPush } from './push-notifications';
import { db } from '@/firebase-config';
import { collection, getDocs, query, where } from 'firebase/firestore';

/**
 * Send certificate expiry push notification
 * @param {string} userId - User ID
 * @param {number} daysRemaining - Days until certificate expires
 */
export async function sendCertificateExpiryPush(userId, daysRemaining) {
  try {
    const subscription = await getUserPushSubscription(userId);
    
    if (!subscription) {
      console.log('No push subscription for user:', userId);
      return;
    }

    await sendPushNotification(subscription, {
      title: '⚠️ Certificato in Scadenza',
      body: `Il tuo certificato medico scade tra ${daysRemaining} giorni`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'certificate-expiry',
      data: {
        type: 'certificate',
        action: 'view',
        url: '/profile/certificates',
        userId
      },
      actions: [
        { action: 'view', title: 'Visualizza' },
        { action: 'dismiss', title: 'Chiudi' }
      ]
    });

    console.log('✅ Certificate expiry push sent to user:', userId);
  } catch (error) {
    console.error('❌ Error sending certificate expiry push:', error);
  }
}

/**
 * Send booking confirmation push notification
 * @param {string} userId - User ID
 * @param {Object} booking - Booking data
 */
export async function sendBookingConfirmationPush(userId, booking) {
  try {
    const subscription = await getUserPushSubscription(userId);
    
    if (!subscription) return;

    const { courtName, date, startTime, endTime, sport } = booking;
    const formattedDate = new Date(date).toLocaleDateString('it-IT');

    await sendPushNotification(subscription, {
      title: '✅ Prenotazione Confermata',
      body: `${sport} - ${courtName}\n${formattedDate} ore ${startTime}-${endTime}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'booking-confirmation',
      data: {
        type: 'booking',
        action: 'view',
        url: '/bookings',
        bookingId: booking.id,
        userId
      },
      actions: [
        { action: 'view', title: 'Vedi Dettagli' },
        { action: 'dismiss', title: 'OK' }
      ]
    });

    console.log('✅ Booking confirmation push sent to user:', userId);
  } catch (error) {
    console.error('❌ Error sending booking confirmation push:', error);
  }
}

/**
 * Send match notification push
 * @param {string} userId - User ID
 * @param {Object} match - Match data
 */
export async function sendMatchNotificationPush(userId, match) {
  try {
    const subscription = await getUserPushSubscription(userId);
    
    if (!subscription) return;

    const { sport, date, startTime, location } = match;
    const formattedDate = new Date(date).toLocaleDateString('it-IT');

    await sendPushNotification(subscription, {
      title: '🏓 Nuovo Match Disponibile',
      body: `${sport} - ${location}\n${formattedDate} ore ${startTime}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'match-notification',
      data: {
        type: 'match',
        action: 'view',
        url: '/matches',
        matchId: match.id,
        userId
      },
      actions: [
        { action: 'join', title: 'Partecipa' },
        { action: 'view', title: 'Dettagli' },
        { action: 'dismiss', title: 'Ignora' }
      ]
    });

    console.log('✅ Match notification push sent to user:', userId);
  } catch (error) {
    console.error('❌ Error sending match notification push:', error);
  }
}

/**
 * Send admin announcement push to all users
 * @param {Object} announcement - Announcement data
 */
export async function sendAdminAnnouncementPush(announcement) {
  try {
    const { title, message, targetAudience = 'all' } = announcement;

    // Get all push subscriptions (or filtered by targetAudience)
    const subscriptionsRef = collection(db, 'pushSubscriptions');
    const q = query(subscriptionsRef);
    const snapshot = await getDocs(q);

    let sentCount = 0;
    const promises = [];

    snapshot.forEach(doc => {
      const subscription = doc.data();
      
      // Send to all or filter by targetAudience
      promises.push(
        sendPushNotification(subscription, {
          title: `📢 ${title}`,
          body: message,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: 'admin-announcement',
          data: {
            type: 'announcement',
            action: 'view',
            url: '/notifications',
            announcementId: announcement.id
          },
          actions: [
            { action: 'view', title: 'Leggi' },
            { action: 'dismiss', title: 'OK' }
          ]
        }).then(() => sentCount++)
      );
    });

    await Promise.allSettled(promises);

    console.log(`✅ Admin announcement sent to ${sentCount} users`);
    return sentCount;
  } catch (error) {
    console.error('❌ Error sending admin announcement:', error);
    return 0;
  }
}

/**
 * Get user's push subscription from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Push subscription or null
 */
async function getUserPushSubscription(userId) {
  try {
    const subscriptionsRef = collection(db, 'pushSubscriptions');
    const q = query(subscriptionsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    // Return most recent subscription
    const subscriptions = snapshot.docs.map(doc => doc.data());
    return subscriptions[0]; // Assuming one subscription per user
  } catch (error) {
    console.error('Error fetching user push subscription:', error);
    return null;
  }
}

/**
 * Enable push notifications for current user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function enablePushNotifications(userId) {
  try {
    const subscription = await subscribeToPush(userId);
    if (subscription) {
      console.log('✅ Push notifications enabled for user:', userId);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error enabling push notifications:', error);
    return false;
  }
}

/**
 * Disable push notifications for current user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function disablePushNotifications(userId) {
  try {
    await unsubscribeFromPush(userId);
    console.log('✅ Push notifications disabled for user:', userId);
    return true;
  } catch (error) {
    console.error('❌ Error disabling push notifications:', error);
    return false;
  }
}
```

#### Step 2: Integrate with Booking Flow (1 hour)

**File:** `src/features/bookings/hooks/useBookingSubmit.js` (or similar)

```javascript
import { sendBookingConfirmationPush } from '@/services/push-notifications-integration';

// After successful booking save
const handleBookingSuccess = async (bookingData) => {
  // Existing code...
  await saveBookingToFirestore(bookingData);

  // NEW: Send push notification
  await sendBookingConfirmationPush(user.uid, bookingData);

  // Show success message...
};
```

**Integration Points:**
- `AdminBookingsPage.jsx` - When admin creates booking
- `BookingModal.jsx` - When user books a court
- `onBookingCreated` Cloud Function - Backend confirmation

#### Step 3: Integrate with Match Flow (1 hour)

**File:** `src/features/matches/MatchCreation.jsx` (or similar)

```javascript
import { sendMatchNotificationPush } from '@/services/push-notifications-integration';

// After match creation
const handleMatchCreated = async (matchData) => {
  // Save match to Firestore
  await saveMatchToFirestore(matchData);

  // NEW: Notify potential participants
  const potentialPlayers = await getPlayersForMatch(matchData);
  
  for (const player of potentialPlayers) {
    await sendMatchNotificationPush(player.uid, matchData);
  }
};
```

**Integration Points:**
- Match creation flow
- Match update/cancellation
- Player join/leave notifications

#### Step 4: Frontend Certificate Alerts (1 hour)

**File:** `src/features/profile/CertificateExpiryAlert.jsx` (NEW)

```javascript
import React, { useEffect, useState } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { sendCertificateExpiryPush } from '@/services/push-notifications-integration';

export default function CertificateExpiryAlert() {
  const { user, profile } = useAuth();
  const [daysRemaining, setDaysRemaining] = useState(null);

  useEffect(() => {
    if (!profile?.certificateExpiry) return;

    const expiry = new Date(profile.certificateExpiry);
    const today = new Date();
    const diff = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));

    setDaysRemaining(diff);

    // Send push notification if expiring soon (7, 3, 1 days)
    if ([7, 3, 1].includes(diff)) {
      sendCertificateExpiryPush(user.uid, diff);
    }
  }, [profile, user]);

  if (!daysRemaining || daysRemaining > 7) return null;

  return (
    <div className="certificate-expiry-alert">
      <h3>⚠️ Certificato in Scadenza</h3>
      <p>Il tuo certificato medico scade tra {daysRemaining} giorni</p>
      <button onClick={() => window.location.href = '/profile/certificates'}>
        Carica Nuovo Certificato
      </button>
    </div>
  );
}
```

#### Step 5: Admin Announcements UI (1-2 hours)

**File:** `src/features/admin/AdminAnnouncements.jsx` (NEW)

```javascript
import React, { useState } from 'react';
import { sendAdminAnnouncementPush } from '@/services/push-notifications-integration';
import { db } from '@/firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function AdminAnnouncements() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title || !message) {
      alert('Inserisci titolo e messaggio');
      return;
    }

    setSending(true);

    try {
      // Save announcement to Firestore
      const announcementRef = await addDoc(collection(db, 'announcements'), {
        title,
        message,
        createdAt: serverTimestamp(),
        sentBy: 'admin' // or get from auth
      });

      // Send push notification to all users
      const sentCount = await sendAdminAnnouncementPush({
        id: announcementRef.id,
        title,
        message
      });

      alert(`✅ Annuncio inviato a ${sentCount} utenti`);
      setTitle('');
      setMessage('');
    } catch (error) {
      console.error('Error sending announcement:', error);
      alert('❌ Errore invio annuncio');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-announcements">
      <h2>📢 Invia Annuncio</h2>
      
      <input
        type="text"
        placeholder="Titolo"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Messaggio"
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={5}
      />

      <button onClick={handleSend} disabled={sending}>
        {sending ? 'Invio...' : 'Invia a Tutti gli Utenti'}
      </button>
    </div>
  );
}
```

### Testing Checklist

- [ ] Certificate expiry push (7, 3, 1 days before)
- [ ] Booking confirmation push (after booking)
- [ ] Match notification push (new match available)
- [ ] Admin announcement push (to all users)
- [ ] Push permission prompt (first time)
- [ ] Push notification click → correct URL
- [ ] Push actions (view, dismiss, join)
- [ ] Push on Android (Chrome, Firefox)
- [ ] Push on iOS (Safari - limited support)
- [ ] Push on Desktop (Chrome, Firefox, Edge)

---

## 📱 Priority #6: PWA Optimization

### Current State
✅ Basic PWA setup:
- `manifest.json` with icons
- Service worker registered
- Install prompt working

❌ Missing:
- Advanced caching strategies
- Offline functionality for bookings
- Background sync
- Offline indicator UI

### Implementation Plan

#### Step 1: Enhanced Service Worker (1 hour)

**File:** `public/service-worker.js`

```javascript
const CACHE_VERSION = 'v2.0.0';
const STATIC_CACHE = `playsport-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `playsport-dynamic-${CACHE_VERSION}`;
const API_CACHE = `playsport-api-${CACHE_VERSION}`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event: cache static assets
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event: clean old caches
self.addEventListener('activate', event => {
  console.log('✅ Service Worker activated');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('playsport-'))
            .filter(name => !name.includes(CACHE_VERSION))
            .map(name => {
              console.log('🗑️ Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event: caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests: Network-first with cache fallback
  if (url.pathname.startsWith('/api/') || url.hostname.includes('firestore')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Static assets: Cache-first with network fallback
  if (request.destination === 'image' || 
      request.destination === 'style' || 
      request.destination === 'script') {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // HTML pages: Network-first with cache fallback
  if (request.destination === 'document') {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
    return;
  }

  // Default: Network-first
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
});

// Network-first strategy
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Network failed, try cache
    const cached = await caches.match(request);
    
    if (cached) {
      return cached;
    }
    
    // No cache, return offline page for HTML
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Cache-first strategy
async function cacheFirstStrategy(request, cacheName) {
  const cached = await caches.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    throw error;
  }
}

// Background sync for offline bookings
self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncPendingBookings());
  }
  
  if (event.tag === 'sync-matches') {
    event.waitUntil(syncPendingMatches());
  }
});

// Sync pending bookings
async function syncPendingBookings() {
  try {
    const db = await openIndexedDB('playsport-offline');
    const bookings = await db.getAll('pending-bookings');
    
    console.log(`📤 Syncing ${bookings.length} pending bookings`);
    
    for (const booking of bookings) {
      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking)
        });
        
        if (response.ok) {
          await db.delete('pending-bookings', booking.id);
          console.log('✅ Synced booking:', booking.id);
        }
      } catch (error) {
        console.error('❌ Failed to sync booking:', booking.id, error);
      }
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Helper: Open IndexedDB
function openIndexedDB(dbName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(wrapDB(request.result));
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pending-bookings')) {
        db.createObjectStore('pending-bookings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pending-matches')) {
        db.createObjectStore('pending-matches', { keyPath: 'id' });
      }
    };
  });
}

function wrapDB(db) {
  return {
    getAll: (storeName) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    },
    
    delete: (storeName, key) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    }
  };
}
```

#### Step 2: Offline Indicator UI (30 minutes)

**File:** `src/components/OfflineIndicator.jsx` (NEW)

```javascript
import React, { useEffect, useState } from 'react';
import './OfflineIndicator.css';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="offline-indicator">
      <span className="offline-icon">📡</span>
      <span className="offline-text">Offline - Le modifiche verranno sincronizzate</span>
    </div>
  );
}
```

**File:** `src/components/OfflineIndicator.css` (NEW)

```css
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #ff6b6b;
  color: white;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  z-index: 9999;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.offline-icon {
  font-size: 20px;
}

.offline-text {
  font-size: 14px;
  font-weight: 500;
}
```

#### Step 3: Offline Page (30 minutes)

**File:** `public/offline.html` (NEW)

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - PlaySport</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 20px;
    }
    
    .offline-icon {
      font-size: 80px;
      margin-bottom: 20px;
    }
    
    h1 {
      font-size: 32px;
      margin: 0 0 10px 0;
    }
    
    p {
      font-size: 18px;
      opacity: 0.9;
      margin: 0 0 30px 0;
    }
    
    .button {
      background: white;
      color: #667eea;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .button:hover {
      transform: scale(1.05);
    }
    
    .button:active {
      transform: scale(0.95);
    }
  </style>
</head>
<body>
  <div class="offline-icon">📡</div>
  <h1>Sei Offline</h1>
  <p>Sembra che non ci sia connessione a Internet.<br>Riprova quando sei online.</p>
  <button class="button" onclick="window.location.reload()">
    🔄 Riprova
  </button>
  
  <script>
    // Auto-reload when back online
    window.addEventListener('online', () => {
      window.location.reload();
    });
  </script>
</body>
</html>
```

#### Step 4: Test PWA Features (1 hour)

**Test Checklist:**
- [ ] Install PWA on mobile (Android/iOS)
- [ ] Install PWA on desktop (Chrome/Edge)
- [ ] Offline mode: load cached pages
- [ ] Offline indicator appears when offline
- [ ] Background sync works when back online
- [ ] Service worker updates correctly
- [ ] Cache size reasonable (<10MB)

---

## 🌙 Priority #8: Dark Mode Completion

### Current State
✅ Dark mode implemented in ~85% of components:
- Main layout
- Navigation
- Most dashboard components

❌ Missing dark mode in:
- ClubSelectionForBooking.jsx
- ClubPreview.jsx
- BookingDetailModal.jsx
- CertificateUpload.jsx
- ~10 other minor components

### Implementation Plan

#### Step 1: Audit Remaining Components (30 minutes)

Run grep search to find components without dark mode classes:

```bash
# Find components without dark: classes
grep -r "className=" src/ | grep -v "dark:" | grep ".jsx"
```

Create checklist of components needing dark mode.

#### Step 2: Add Dark Mode Classes (1 hour)

**Pattern to follow:**

```javascript
// BEFORE
<div className="bg-white text-gray-900 border-gray-200">
  <h2 className="text-lg font-bold text-gray-800">Title</h2>
  <p className="text-gray-600">Description</p>
</div>

// AFTER
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Title</h2>
  <p className="text-gray-600 dark:text-gray-300">Description</p>
</div>
```

**Components to update:**
1. ClubSelectionForBooking.jsx
2. ClubPreview.jsx
3. BookingDetailModal.jsx
4. CertificateUpload.jsx
5. StatisticheGiocatore.jsx (partially done)
6. PaymentModal.jsx
7. InstructorSettings.jsx
8. MatchDetails.jsx

#### Step 3: Test Theme Switching (30 minutes)

**Test Checklist:**
- [ ] Theme persists across page reloads
- [ ] System preference detected correctly
- [ ] All components visible in dark mode
- [ ] Transitions smooth (no flashing)
- [ ] Icons/images visible in both themes
- [ ] Forms readable in dark mode
- [ ] Modals/overlays correct dark styling

---

## ✅ Success Criteria

### Sprint 2 Completion Checklist

**Push Notifications:**
- [ ] Certificate expiry pushes working
- [ ] Booking confirmation pushes working
- [ ] Match notification pushes working
- [ ] Admin announcements working
- [ ] Push tested on Android/iOS/Desktop

**PWA:**
- [ ] Enhanced service worker deployed
- [ ] Offline indicator visible when offline
- [ ] Offline page loads correctly
- [ ] Background sync tested
- [ ] PWA installable on all platforms

**Dark Mode:**
- [ ] All components have dark mode classes
- [ ] Theme toggle working
- [ ] No visual bugs in dark mode
- [ ] Theme persists correctly

---

## 📊 Metrics & KPIs

### Push Notifications
- **Delivery Rate:** >95% notifications delivered
- **Click-Through Rate:** >30% users click notification
- **Opt-in Rate:** >60% users enable push

### PWA
- **Install Rate:** >20% users install PWA
- **Offline Sessions:** <5% failed requests
- **Cache Hit Rate:** >80% for static assets

### Dark Mode
- **Adoption Rate:** >40% users use dark mode
- **Theme Preference:** System auto-detection working
- **Visual Quality:** 0 reported dark mode bugs

---

## 🚀 Deployment Plan

### Week 1: Push Notifications
- Day 1-2: Create integration service
- Day 3-4: Integrate with booking/match flows
- Day 5: Testing & bug fixes
- Day 6: Deploy to production

### Week 2: PWA Optimization
- Day 1-2: Enhanced service worker
- Day 3: Offline UI components
- Day 4-5: Testing (offline mode, sync)
- Day 6: Deploy to production

### Week 3: Dark Mode
- Day 1: Component audit
- Day 2-3: Add dark mode classes
- Day 4-5: Testing & polish
- Day 6: Deploy to production

---

**Ready to start Sprint 2! 🚀**
