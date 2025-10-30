// =============================================
// FILE: src/services/notificationService.js
// Servizio notifiche avanzato con Firebase real-time listeners
// CHK-308: Notification Center
// =============================================

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db, analytics } from '@config/firebase';
import { logEvent } from 'firebase/analytics';

// Notification categories
export const NOTIFICATION_CATEGORIES = {
  BOOKING: 'booking',
  SYSTEM: 'system',
  PROMO: 'promo',
  SOCIAL: 'social',
};

// Notification priorities
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

// Default settings
const DEFAULT_SETTINGS = {
  enableSound: true,
  enableDesktop: true,
  enableEmail: false,
  categories: {
    booking: true,
    system: true,
    promo: true,
    social: true,
  },
};

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.registration = null;
    this.activeListeners = new Map();
  }

  // Inizializza il servizio notifiche web
  async initialize() {
    try {
      if (!('Notification' in window)) {
        console.log('Il browser non supporta le notifiche');
        return false;
      }

      await this.requestPermissions();
      this.isInitialized = true;
      console.log('NotificationService (web) inizializzato');
      return true;
    } catch (error) {
      console.error('Errore inizializzazione notifiche:', error);
      return false;
    }
  }

  // Richiede i permessi per le notifiche web
  async requestPermissions() {
    try {
      const permission = await Notification.requestPermission();
      console.log('Permessi notifiche web:', permission);

      return {
        web: permission === 'granted',
        granted: permission === 'granted',
      };
    } catch (error) {
      console.error('Errore richiesta permessi:', error);
      return { web: false, granted: false };
    }
  }

  // Mostra una notifica web
  async showNotification(options) {
    try {
      if (Notification.permission !== 'granted') {
        console.warn('Permessi notifiche non concessi');
        return false;
      }

      const notification = new Notification(options.title || 'Play Sport Pro', {
        body: options.body || '',
        icon: '/play-sport-pro_icon_only.svg',
        badge: '/play-sport-pro_icon_only.svg',
        tag: options.tag || 'default',
        data: options.extra || {},
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        vibrate: options.vibrate || [200, 100, 200],
      });

      notification.onclick = () => {
        console.log('Notifica cliccata:', options.title);
        this.onNotificationClick(options.extra || {});
        notification.close();
      };

      // Auto-close dopo 5 secondi se non specificato diversamente
      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }

      console.log('Notifica web mostrata:', options.title);
      return true;
    } catch (error) {
      console.error('Errore notifica web:', error);
      return false;
    }
  }

  // Callback personalizzabili
  onNotificationClick(data) {
    console.log('Notifica cliccata con data:', data);
    // Qui puoi implementare la navigazione o altre azioni
  }

  // Metodi di utilità per l'app Play Sport Pro

  // Test notifica web
  async testNotification() {
    return await this.showNotification({
      title: '🧪 Test Notifica Web',
      body: 'Questa è una notifica di test per Play Sport Pro',
      extra: { type: 'test' },
    });
  }

  // Notifica per prenotazione confermata
  async notifyBookingConfirmed(bookingDetails) {
    return await this.showNotification({
      title: '✅ Prenotazione Confermata',
      body: `Campo ${bookingDetails.court} prenotato per ${bookingDetails.date} alle ${bookingDetails.time}`,
      tag: 'booking',
      extra: { type: 'booking_confirmed', bookingId: bookingDetails.id },
    });
  }

  // Notifica per risultato partita
  async notifyMatchResult(matchResult) {
    return await this.showNotification({
      title: '🏆 Risultato Partita',
      body: `Vincitore: ${matchResult.winner} - ${matchResult.score}`,
      tag: 'match',
      requireInteraction: true,
      vibrate: [300, 200, 300, 200, 300],
      extra: { type: 'match_result', matchId: matchResult.id },
    });
  }

  // Notifica per promemoria partita
  async notifyMatchReminder(matchDetails, minutesBefore = 30) {
    return await this.showNotification({
      title: '🏆 Partita Imminente',
      body: `La tua partita inizia tra ${minutesBefore} minuti!`,
      tag: 'reminder',
      requireInteraction: true,
      vibrate: [100, 50, 100, 50, 100, 50, 100],
      extra: { type: 'match_reminder', matchId: matchDetails.id },
    });
  }

  // Notifica per nuovo torneo
  async notifyNewTournament(tournamentDetails) {
    return await this.showNotification({
      title: '🏆 Nuovo Torneo Disponibile',
      body: `${tournamentDetails.name} - Iscriviti ora!`,
      tag: 'tournament',
      extra: { type: 'new_tournament', tournamentId: tournamentDetails.id },
    });
  }

  // Verifica se le notifiche sono supportate
  isSupported() {
    return 'Notification' in window;
  }

  // Stato corrente dei permessi
  getPermissionStatus() {
    if (!this.isSupported()) {
      return 'not_supported';
    }
    return Notification.permission;
  }

  // ==========================================
  // ADVANCED FEATURES - CHK-308
  // ==========================================

  /**
   * Get notification settings from localStorage
   */
  getSettings() {
    try {
      const stored = localStorage.getItem('playAndSport_notificationSettings');
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save notification settings
   */
  saveSettings(settings) {
    try {
      localStorage.setItem('playAndSport_notificationSettings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving notification settings:', error);
      return false;
    }
  }

  /**
   * Play notification sound
   */
  playSound(priority = NOTIFICATION_PRIORITY.MEDIUM) {
    const settings = this.getSettings();

    if (!settings.enableSound) {
      return;
    }

    try {
      const audio = new Audio();

      // Different sounds for different priorities
      switch (priority) {
        case NOTIFICATION_PRIORITY.URGENT:
          audio.src = '/sounds/notification-urgent.mp3';
          break;
        case NOTIFICATION_PRIORITY.HIGH:
          audio.src = '/sounds/notification-high.mp3';
          break;
        default:
          audio.src = '/sounds/notification.mp3';
          break;
      }

      audio.volume = 0.5;
      audio.play().catch((err) => {
        console.log('Could not play notification sound:', err);
      });
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  /**
   * Create notification in Firestore
   */
  async createNotification(userId, notificationData) {
    try {
      const notificationsRef = collection(db, 'notifications');

      const notification = {
        userId,
        title: notificationData.title,
        message: notificationData.message,
        category: notificationData.category || NOTIFICATION_CATEGORIES.SYSTEM,
        priority: notificationData.priority || NOTIFICATION_PRIORITY.MEDIUM,
        read: false,
        deleted: false,
        data: notificationData.data || {},
        actionUrl: notificationData.actionUrl || null,
        actionLabel: notificationData.actionLabel || null,
        createdAt: serverTimestamp(),
        readAt: null,
      };

      const docRef = await addDoc(notificationsRef, notification);

      // Log analytics
      if (analytics) {
        logEvent(analytics, 'notification_created', {
          category: notification.category,
          priority: notification.priority,
        });
      }

      // Show desktop notification if enabled
      const settings = this.getSettings();
      if (settings.enableDesktop && settings.categories[notification.category]) {
        this.showNotification({
          title: notification.title,
          body: notification.message,
          tag: docRef.id,
          extra: notification.data,
        });
      }

      // Play sound if enabled
      if (settings.enableSound && settings.categories[notification.category]) {
        this.playSound(notification.priority);
      }

      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);

      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp(),
      });

      if (analytics) {
        logEvent(analytics, 'notification_read', { notificationId });
      }

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark notification as unread
   */
  async markAsUnread(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);

      await updateDoc(notificationRef, {
        read: false,
        readAt: null,
      });

      return true;
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      throw error;
    }
  }

  /**
   * Delete notification (soft delete)
   */
  async deleteNotification(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);

      await updateDoc(notificationRef, {
        deleted: true,
      });

      if (analytics) {
        logEvent(analytics, 'notification_deleted', { notificationId });
      }

      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false),
        where('deleted', '==', false)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return 0;
      }

      const batch = writeBatch(db);

      snapshot.docs.forEach((docSnap) => {
        batch.update(docSnap.ref, {
          read: true,
          readAt: serverTimestamp(),
        });
      });

      await batch.commit();

      if (analytics) {
        logEvent(analytics, 'notifications_mark_all_read', {
          count: snapshot.size,
        });
      }

      return snapshot.size;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  }

  /**
   * Delete all notifications
   */
  async deleteAllNotifications(userId) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('deleted', '==', false)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return 0;
      }

      const batch = writeBatch(db);

      snapshot.docs.forEach((docSnap) => {
        batch.update(docSnap.ref, {
          deleted: true,
        });
      });

      await batch.commit();

      if (analytics) {
        logEvent(analytics, 'notifications_delete_all', {
          count: snapshot.size,
        });
      }

      return snapshot.size;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }

  /**
   * Subscribe to notifications (real-time listener)
   */
  subscribeToNotifications(userId, onUpdate, options = {}) {
    try {
      // Unsubscribe previous listener if exists
      const listenerId = `notifications_${userId}_${options.category || 'all'}`;
      if (this.activeListeners.has(listenerId)) {
        this.activeListeners.get(listenerId)();
        this.activeListeners.delete(listenerId);
      }

      const notificationsRef = collection(db, 'notifications');

      // Build query
      let q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('deleted', '==', false),
        orderBy('createdAt', 'desc')
      );

      // Apply category filter
      if (options.category) {
        q = query(
          notificationsRef,
          where('userId', '==', userId),
          where('deleted', '==', false),
          where('category', '==', options.category),
          orderBy('createdAt', 'desc')
        );
      }

      // Apply limit
      if (options.maxCount) {
        q = query(q, limit(options.maxCount));
      }

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const notifications = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate(),
            readAt: docSnap.data().readAt?.toDate(),
          }));

          onUpdate(notifications);

          // Check for new unread notifications
          const settings = this.getSettings();
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const notification = change.doc.data();

              // Skip if already read or category disabled
              if (notification.read || !settings.categories[notification.category]) {
                return;
              }

              // Show desktop notification
              if (settings.enableDesktop) {
                this.showNotification({
                  title: notification.title,
                  body: notification.message,
                  tag: change.doc.id,
                  extra: notification.data || {},
                });
              }

              // Play sound
              if (settings.enableSound) {
                this.playSound(notification.priority);
              }
            }
          });
        },
        (error) => {
          console.error('Error in notifications listener:', error);
        }
      );

      // Store listener for cleanup
      this.activeListeners.set(listenerId, unsubscribe);

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      return () => {};
    }
  }

  /**
   * Subscribe to unread count (real-time)
   */
  subscribeToUnreadCount(userId, onUpdate) {
    try {
      const listenerId = `unread_count_${userId}`;
      if (this.activeListeners.has(listenerId)) {
        this.activeListeners.get(listenerId)();
        this.activeListeners.delete(listenerId);
      }

      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false),
        where('deleted', '==', false)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          onUpdate(snapshot.size);
        },
        (error) => {
          console.error('Error in unread count listener:', error);
        }
      );

      this.activeListeners.set(listenerId, unsubscribe);

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to unread count:', error);
      return () => {};
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false),
        where('deleted', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Cleanup all active listeners
   */
  cleanupListeners() {
    this.activeListeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.activeListeners.clear();
  }
}

// Singleton instance
const notificationService = new NotificationService();

export default notificationService;
