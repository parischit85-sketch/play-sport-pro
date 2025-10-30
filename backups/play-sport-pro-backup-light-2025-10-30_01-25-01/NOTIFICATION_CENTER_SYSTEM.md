# Notification Center System - CHK-308 ✅

## Overview

Comprehensive in-app notification system with real-time Firebase listeners, category-based filtering, desktop push notifications, and batch operations. Provides a complete notification experience for Play & Sport users.

---

## 🎯 Features Implemented

### 1. ✅ Advanced Notification Service
**File:** `src/services/notificationService.js` (600+ lines)

**Core Features:**
- **Real-time Firebase Listeners:** onSnapshot for live updates
- **CRUD Operations:** Create, read, update, delete notifications
- **Batch Operations:** Mark all read, delete all
- **Desktop Notifications:** Web Notification API integration
- **Notification Sounds:** Priority-based audio alerts
- **Persistent Settings:** LocalStorage configuration
- **Category System:** 4 notification types
- **Priority Levels:** 4 urgency levels
- **Auto-cleanup:** Active listener management

**API Methods:**

```javascript
// Create notification
await notificationService.createNotification(userId, {
  title: '✅ Prenotazione Confermata',
  message: 'Campo tennis prenotato per domani alle 10:00',
  category: NOTIFICATION_CATEGORIES.BOOKING,
  priority: NOTIFICATION_PRIORITY.HIGH,
  actionUrl: '/bookings/123',
  actionLabel: 'Vedi Dettagli',
});

// Subscribe to real-time updates
const unsubscribe = notificationService.subscribeToNotifications(
  userId,
  (notifications) => {
    setNotifications(notifications);
  },
  { category: 'booking', maxCount: 50 }
);

// Mark as read/unread
await notificationService.markAsRead(notificationId);
await notificationService.markAsUnread(notificationId);

// Batch operations
await notificationService.markAllAsRead(userId);
await notificationService.deleteAllNotifications(userId);

// Subscribe to unread count
notificationService.subscribeToUnreadCount(userId, (count) => {
  setUnreadCount(count);
});
```

### 2. ✅ NotificationBadge Component
**File:** `src/components/notifications/NotificationBadge.jsx` (110 lines)

**Features:**
- Real-time unread count badge
- Animated pulse on new notifications
- 3 sizes (sm, md, lg)
- Optional count display (number or dot)
- Click handler for opening notification center
- Accessible with ARIA labels

**Usage:**

```jsx
import NotificationBadge from '@components/notifications/NotificationBadge';

<NotificationBadge
  size="md"
  onClick={() => setNotificationCenterOpen(true)}
  showCount={true}
/>
```

**Sizes:**
- **sm:** 16px icon, 14px badge
- **md:** 20px icon, 16px badge (default)
- **lg:** 24px icon, 20px badge

### 3. ✅ NotificationItem Component
**File:** `src/components/notifications/NotificationItem.jsx` (220 lines)

**Features:**
- Category-based icon and color coding
- Read/unread visual states
- Mark as read/unread toggle
- Delete action
- Optional action button
- Relative timestamp (e.g., "5 minutes ago")
- Animated delete transition
- Dark mode support

**Category Styling:**

| Category | Icon | Color | Border |
|----------|------|-------|--------|
| Booking | Calendar | Blue | Blue |
| System | Bell | Gray | Gray |
| Promo | Gift | Purple | Purple |
| Social | MessageCircle | Green | Green |

### 4. ✅ NotificationCenter Component
**File:** `src/components/notifications/NotificationCenter.jsx` (250 lines)

**Features:**
- **Category Tabs:** All, Booking, System, Promo, Social
- **Real-time Updates:** Auto-refresh via Firebase listeners
- **Batch Actions:**
  - Mark all as read
  - Delete all notifications
- **Loading States:** Spinner while fetching
- **Empty States:** Friendly messages when no notifications
- **Responsive Design:** Slide-in panel from right
- **Backdrop Blur:** Click outside to close
- **Infinite Scroll Ready:** Max 50 notifications per tab

**Props:**

```jsx
<NotificationCenter
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  maxHeight="600px"
/>
```

---

## 📊 Notification Categories

### BOOKING (booking)
**Use Cases:**
- Booking confirmed
- Booking cancelled
- Booking reminder (24h before)
- Payment received
- Match starting soon

**Template Example:**

```javascript
await notificationService.createNotification(userId, {
  title: '✅ Prenotazione Confermata',
  message: `Campo tennis prenotato per ${date} alle ${time}`,
  category: NOTIFICATION_CATEGORIES.BOOKING,
  priority: NOTIFICATION_PRIORITY.HIGH,
  actionUrl: `/bookings/${bookingId}`,
  actionLabel: 'Vedi Dettagli',
  data: { bookingId, courtId },
});
```

### SYSTEM (system)
**Use Cases:**
- System maintenance alerts
- Account updates
- Security notifications
- Feature announcements

**Template Example:**

```javascript
await notificationService.createNotification(userId, {
  title: '🔧 Manutenzione Programmata',
  message: 'Il sistema sarà in manutenzione domenica 10:00-12:00',
  category: NOTIFICATION_CATEGORIES.SYSTEM,
  priority: NOTIFICATION_PRIORITY.URGENT,
});
```

### PROMO (promo)
**Use Cases:**
- Special offers
- Discounts
- New features
- Marketing campaigns

**Template Example:**

```javascript
await notificationService.createNotification(userId, {
  title: '🎉 Offerta Speciale!',
  message: '20% di sconto su tutti i campi questo weekend',
  category: NOTIFICATION_CATEGORIES.PROMO,
  priority: NOTIFICATION_PRIORITY.LOW,
  actionUrl: '/promo/weekend-special',
  actionLabel: 'Scopri di Più',
});
```

### SOCIAL (social)
**Use Cases:**
- New messages
- Friend requests
- Match invitations
- Tournament updates

**Template Example:**

```javascript
await notificationService.createNotification(userId, {
  title: '💬 Nuovo Messaggio',
  message: `Hai ricevuto un messaggio da ${senderName}`,
  category: NOTIFICATION_CATEGORIES.SOCIAL,
  priority: NOTIFICATION_PRIORITY.MEDIUM,
  actionUrl: '/messages',
  actionLabel: 'Leggi Messaggio',
});
```

---

## 🔊 Notification Priorities

### LOW
- **Sound:** Standard notification beep
- **Use Cases:** Promotions, non-urgent updates
- **Desktop:** Standard notification

### MEDIUM (default)
- **Sound:** Standard notification beep
- **Use Cases:** Messages, general updates
- **Desktop:** Standard notification

### HIGH
- **Sound:** Double beep
- **Use Cases:** Booking confirmations, important updates
- **Desktop:** Persistent notification (auto-close 5s)

### URGENT
- **Sound:** Triple beep (louder)
- **Use Cases:** System alerts, match starting now
- **Desktop:** Persistent notification (requires interaction)

---

## ⚙️ User Settings

### Available Settings

```javascript
{
  enableSound: true,        // Play notification sounds
  enableDesktop: true,      // Show desktop notifications
  enableEmail: false,       // Email notifications (future)
  categories: {
    booking: true,          // Receive booking notifications
    system: true,           // Receive system notifications
    promo: true,            // Receive promotional notifications
    social: true,           // Receive social notifications
  },
}
```

### Settings API

```javascript
// Get settings
const settings = notificationService.getSettings();

// Save settings
notificationService.saveSettings({
  enableSound: false,
  enableDesktop: true,
  categories: {
    booking: true,
    system: true,
    promo: false,  // Disable promo notifications
    social: true,
  },
});

// Request desktop permission
const permission = await notificationService.requestPermissions();
```

---

## 🎨 UI Components Integration

### Full Example: Header Integration

```jsx
import { useState } from 'react';
import NotificationBadge from '@components/notifications/NotificationBadge';
import NotificationCenter from '@components/notifications/NotificationCenter';

function AppHeader() {
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between p-4">
        <h1>Play & Sport</h1>
        
        {/* Notification Badge */}
        <NotificationBadge
          size="md"
          onClick={() => setNotificationCenterOpen(true)}
          showCount={true}
        />
      </header>

      {/* Notification Center Panel */}
      <NotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
      />
    </>
  );
}
```

### Keyboard Shortcut Integration

```jsx
useEffect(() => {
  const handleKeyPress = (e) => {
    // Open notification center with Cmd/Ctrl + Shift + N
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'n') {
      e.preventDefault();
      setNotificationCenterOpen(true);
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

---

## 🔥 Firebase Firestore Schema

### Notifications Collection

```javascript
// Collection: notifications
{
  id: 'auto-generated',
  
  // Core fields
  userId: 'user-id-123',
  title: 'Notification Title',
  message: 'Notification message content',
  
  // Classification
  category: 'booking',  // booking | system | promo | social
  priority: 'high',     // low | medium | high | urgent
  
  // Status
  read: false,
  deleted: false,
  
  // Optional data
  data: {
    bookingId: '123',
    courtId: '456',
    customField: 'value',
  },
  
  // Optional action
  actionUrl: '/bookings/123',
  actionLabel: 'Vedi Dettagli',
  
  // Timestamps
  createdAt: Timestamp,
  readAt: Timestamp | null,
}
```

### Firestore Indexes Required

```bash
# Composite index 1: User + Status + Timestamp
notifications
  - userId (Ascending)
  - deleted (Ascending)
  - createdAt (Descending)

# Composite index 2: User + Status + Category + Timestamp
notifications
  - userId (Ascending)
  - deleted (Ascending)
  - category (Ascending)
  - createdAt (Descending)

# Composite index 3: User + Read Status
notifications
  - userId (Ascending)
  - read (Ascending)
  - deleted (Ascending)
```

### Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notifications/{notificationId} {
      // User can only read their own notifications
      allow read: if request.auth != null 
                  && resource.data.userId == request.auth.uid;
      
      // Only admins can create notifications
      allow create: if request.auth != null 
                    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // User can update their own notifications (mark read/delete)
      allow update: if request.auth != null 
                    && resource.data.userId == request.auth.uid
                    && request.resource.data.userId == resource.data.userId; // Cannot change userId
      
      // No direct deletes (use soft delete)
      allow delete: if false;
    }
  }
}
```

---

## 📈 Analytics Integration

### Tracked Events

```javascript
// Notification created
logEvent(analytics, 'notification_created', {
  category: 'booking',
  priority: 'high',
});

// Notification read
logEvent(analytics, 'notification_read', {
  notificationId: '123',
});

// Notification deleted
logEvent(analytics, 'notification_deleted', {
  notificationId: '123',
});

// Mark all as read
logEvent(analytics, 'notifications_mark_all_read', {
  count: 15,
});

// Delete all notifications
logEvent(analytics, 'notifications_delete_all', {
  count: 20,
});

// Desktop permission requested
logEvent(analytics, 'notification_permission_requested', {
  result: 'granted',
});
```

---

## 🚀 Best Practices

### Creating Notifications

**✅ DO:**
- Use clear, concise titles (max 50 chars)
- Provide actionable messages
- Include action buttons when possible
- Use appropriate categories
- Set correct priority levels
- Include relevant data in `data` field

**❌ DON'T:**
- Send duplicate notifications
- Use generic titles like "Notification"
- Spam users with low-priority notifications
- Include sensitive data in messages
- Send notifications without user consent

### Performance Optimization

**Limit Subscriptions:**
```javascript
// ✅ Good: Subscribe once in parent component
useEffect(() => {
  const unsubscribe = notificationService.subscribeToNotifications(
    userId,
    setNotifications,
    { maxCount: 50 }
  );
  return () => unsubscribe();
}, [userId]);

// ❌ Bad: Multiple subscriptions in child components
```

**Cleanup Listeners:**
```javascript
// Always cleanup on unmount
useEffect(() => {
  const unsubscribe = notificationService.subscribeToUnreadCount(
    userId,
    setUnreadCount
  );
  
  return () => {
    unsubscribe(); // ✅ Cleanup
  };
}, [userId]);
```

### User Experience

**Respect User Settings:**
```javascript
const settings = notificationService.getSettings();

if (settings.categories.booking) {
  // Only create if user wants booking notifications
  await notificationService.createNotification(userId, {...});
}
```

**Provide Opt-out:**
```jsx
<label>
  <input
    type="checkbox"
    checked={settings.categories.promo}
    onChange={(e) => {
      saveSettings({
        ...settings,
        categories: {
          ...settings.categories,
          promo: e.target.checked,
        },
      });
    }}
  />
  Ricevi offerte e promozioni
</label>
```

---

## 🔧 Cloud Functions Integration

### Scheduled Notifications (Future Enhancement)

```javascript
// Cloud Function: Send booking reminders 24h before
exports.sendBookingReminders = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get bookings for tomorrow
    const bookingsSnapshot = await db.collection('bookings')
      .where('date', '==', tomorrow.toISOString().split('T')[0])
      .where('notificationSent', '==', false)
      .get();
    
    // Send notifications
    for (const bookingDoc of bookingsSnapshot.docs) {
      const booking = bookingDoc.data();
      
      await db.collection('notifications').add({
        userId: booking.userId,
        title: '⏰ Promemoria Prenotazione',
        message: `Domani hai una prenotazione per ${booking.courtName} alle ${booking.time}`,
        category: 'booking',
        priority: 'high',
        actionUrl: `/bookings/${bookingDoc.id}`,
        actionLabel: 'Vedi Dettagli',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
        deleted: false,
      });
      
      // Mark as sent
      await bookingDoc.ref.update({ notificationSent: true });
    }
  });
```

---

## 🐛 Troubleshooting

### Issue: Notifications not appearing in real-time
**Cause:** Firebase listener not active  
**Solution:** Verify subscription in useEffect with proper cleanup

### Issue: Desktop notifications not showing
**Cause:** Permission not granted  
**Solution:** Request permission with `requestPermissions()`

### Issue: Sounds not playing
**Cause:** User settings or browser autoplay policy  
**Solution:** Check `enableSound` setting and require user interaction

### Issue: Duplicate notifications
**Cause:** Multiple active listeners  
**Solution:** Use listener cleanup in notificationService

---

## ✅ CHK-308 Status: COMPLETE

**Implementation Time:** ~4 hours  
**Lines of Code:** 1100+  
**Components:** 3 (Badge, Item, Center)  
**Service Methods:** 15+

**Files Created:**
- `src/services/notificationService.js` (600 lines - enhanced)
- `src/components/notifications/NotificationBadge.jsx` (110 lines)
- `src/components/notifications/NotificationItem.jsx` (220 lines)
- `src/components/notifications/NotificationCenter.jsx` (250 lines)
- `NOTIFICATION_CENTER_SYSTEM.md` (this file)

**Features:**
- ✅ Real-time Firebase listeners (onSnapshot)
- ✅ 4 notification categories (booking, system, promo, social)
- ✅ 4 priority levels (low, medium, high, urgent)
- ✅ Desktop push notifications (Web Notification API)
- ✅ Notification sounds (priority-based)
- ✅ Mark as read/unread (individual & batch)
- ✅ Delete notifications (soft delete, individual & batch)
- ✅ Unread count badge (real-time)
- ✅ Category tabs with filters
- ✅ Persistent settings (localStorage)
- ✅ Action buttons (optional)
- ✅ Relative timestamps (date-fns)
- ✅ Loading & empty states
- ✅ Dark mode support
- ✅ Analytics integration
- ✅ Responsive design

**Next Steps:**
1. Add Firestore indexes (see schema section)
2. Update firestore.rules (see security section)
3. Integrate into main layout (header/navbar)
4. Create settings page for notification preferences
5. Implement Cloud Functions for automated notifications
6. Proceed to CHK-309 (Backup & Recovery System)

---

**Developed with ❤️ for Play & Sport**  
**Stay Connected, Never Miss an Update.**
