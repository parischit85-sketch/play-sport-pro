/**
 * Push Notifications Integration Service
 * Connects push notification infrastructure with app features
 *
 * Features:
 * - Certificate expiry alerts
 * - Booking confirmations
 * - Match notifications
 * - Admin announcements
 */

import { logger } from '@/utils/logger';
import { db } from '@services/firebase.js';
import { collection, getDocs, query, where } from 'firebase/firestore';

/**
 * Send push notification via service worker
 * @param {Object} subscription - Push subscription object
 * @param {Object} options - Notification options
 */
async function sendPushNotification(subscription, options) {
  try {
    // Call our backend endpoint that uses web-push
    const response = await fetch('/api/send-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription,
        notification: options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Push send failed: ${response.statusText}`);
    }

    logger.debug('Push notification sent successfully');
    return true;
  } catch (error) {
    // Only log in production - expected to fail in dev (no backend)
    if (import.meta.env.PROD) {
      logger.error('Error sending push notification:', error);
    }
    return false;
  }
}

/**
 * Send certificate expiry push notification
 * @param {string} userId - User ID
 * @param {number} daysRemaining - Days until certificate expires
 * @returns {Promise<boolean>} Success status
 */
export async function sendCertificateExpiryPush(userId, daysRemaining) {
  try {
    const subscription = await getUserPushSubscription(userId);

    if (!subscription) {
      logger.debug('No push subscription for user:', userId);
      return false;
    }

    let urgencyIcon = '⚠️';
    let urgencyText = 'in scadenza';

    if (daysRemaining <= 1) {
      urgencyIcon = '🔴';
      urgencyText = 'scade DOMANI';
    } else if (daysRemaining <= 3) {
      urgencyIcon = '🟠';
      urgencyText = 'scade a breve';
    }

    const success = await sendPushNotification(subscription, {
      title: `${urgencyIcon} Certificato ${urgencyText}`,
      body: `Il tuo certificato medico scade tra ${daysRemaining} ${daysRemaining === 1 ? 'giorno' : 'giorni'}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'certificate-expiry',
      requireInteraction: daysRemaining <= 1, // Keep visible for critical alerts
      data: {
        type: 'certificate',
        action: 'view',
        url: '/profile/certificates',
        userId,
        daysRemaining,
      },
      actions: [
        { action: 'view', title: '📄 Carica Nuovo', icon: '/icons/upload.png' },
        { action: 'dismiss', title: 'OK', icon: '/icons/check.png' },
      ],
    });

    if (success) {
      logger.debug('Certificate expiry push sent to user:', userId);
    }

    return success;
  } catch (error) {
    logger.error('Error sending certificate expiry push:', error);
    return false;
  }
}

/**
 * Send booking confirmation push notification
 * @param {string} userId - User ID
 * @param {Object} booking - Booking data
 * @returns {Promise<boolean>} Success status
 */
export async function sendBookingConfirmationPush(userId, booking) {
  try {
    const subscription = await getUserPushSubscription(userId);

    if (!subscription) {
      logger.debug('No push subscription for user:', userId);
      return false;
    }

    const { courtName, date, startTime, endTime, sport } = booking;
    const bookingDate = new Date(date);
    const formattedDate = bookingDate.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

    const sportEmoji = {
      Padel: '🎾',
      Tennis: '🎾',
      Calcio: '⚽',
      Calcetto: '⚽',
      Basket: '🏀',
      Pallavolo: '🏐',
    };

    const success = await sendPushNotification(subscription, {
      title: '✅ Prenotazione Confermata',
      body: `${sportEmoji[sport] || '🎯'} ${sport} - ${courtName}\n${formattedDate} ore ${startTime}-${endTime}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: `booking-${booking.id}`,
      data: {
        type: 'booking',
        action: 'view',
        url: '/bookings',
        bookingId: booking.id,
        userId,
      },
      actions: [
        { action: 'view', title: '📅 Vedi Dettagli', icon: '/icons/calendar.png' },
        { action: 'dismiss', title: 'OK', icon: '/icons/check.png' },
      ],
    });

    if (success) {
      logger.debug('Booking confirmation push sent to user:', userId);
    }

    return success;
  } catch (error) {
    logger.error('Error sending booking confirmation push:', error);
    return false;
  }
}

/**
 * Send match notification push
 * @param {string} userId - User ID
 * @param {Object} match - Match data
 * @returns {Promise<boolean>} Success status
 */
export async function sendMatchNotificationPush(userId, match) {
  try {
    const subscription = await getUserPushSubscription(userId);

    if (!subscription) {
      logger.debug('No push subscription for user:', userId);
      return false;
    }

    const { sport, date, startTime, location, players = [] } = match;
    const matchDate = new Date(date);
    const formattedDate = matchDate.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

    const sportEmoji = {
      Padel: '🎾',
      Tennis: '🎾',
      Calcio: '⚽',
      Calcetto: '⚽',
      Basket: '🏀',
      Pallavolo: '🏐',
    };

    const playersText = players.length > 0 ? `\n${players.length} giocatori già iscritti` : '';

    const success = await sendPushNotification(subscription, {
      title: `${sportEmoji[sport] || '🏓'} Nuovo Match Disponibile`,
      body: `${sport} - ${location}\n${formattedDate} ore ${startTime}${playersText}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: `match-${match.id}`,
      requireInteraction: false,
      data: {
        type: 'match',
        action: 'view',
        url: `/matches/${match.id}`,
        matchId: match.id,
        userId,
      },
      actions: [
        { action: 'join', title: '✅ Partecipa', icon: '/icons/join.png' },
        { action: 'view', title: '👀 Dettagli', icon: '/icons/info.png' },
        { action: 'dismiss', title: 'Ignora', icon: '/icons/close.png' },
      ],
    });

    if (success) {
      logger.debug('Match notification push sent to user:', userId);
    }

    return success;
  } catch (error) {
    logger.error('Error sending match notification push:', error);
    return false;
  }
}

/**
 * Send admin announcement push to all users
 * @param {Object} announcement - Announcement data
 * @returns {Promise<number>} Number of notifications sent
 */
export async function sendAdminAnnouncementPush(announcement) {
  try {
    const { title, message, targetAudience = 'all', priority = 'normal' } = announcement;

    // Get all push subscriptions
    const subscriptionsRef = collection(db, 'pushSubscriptions');
    let q = query(subscriptionsRef);

    // Filter by target audience if specified
    if (targetAudience !== 'all') {
      q = query(subscriptionsRef, where('userType', '==', targetAudience));
    }

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      logger.warn('No push subscriptions found');
      return 0;
    }

    logger.debug(`Sending announcement to ${snapshot.size} subscriptions`);

    let sentCount = 0;
    const batchSize = 10; // Send in batches to avoid rate limits
    const subscriptions = snapshot.docs.map((doc) => doc.data());

    // Process in batches
    for (let i = 0; i < subscriptions.length; i += batchSize) {
      const batch = subscriptions.slice(i, i + batchSize);

      const promises = batch.map((subscription) => {
        return sendPushNotification(subscription, {
          title: `📢 ${title}`,
          body: message,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: `announcement-${announcement.id}`,
          requireInteraction: priority === 'high',
          data: {
            type: 'announcement',
            action: 'view',
            url: '/notifications',
            announcementId: announcement.id,
          },
          actions: [
            { action: 'view', title: '📖 Leggi', icon: '/icons/read.png' },
            { action: 'dismiss', title: 'OK', icon: '/icons/check.png' },
          ],
        }).then((success) => {
          if (success) sentCount++;
        });
      });

      await Promise.allSettled(promises);

      // Small delay between batches
      if (i + batchSize < subscriptions.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    logger.log(`Admin announcement sent to ${sentCount}/${snapshot.size} users`);
    return sentCount;
  } catch (error) {
    logger.error('Error sending admin announcement:', error);
    return 0;
  }
}

/**
 * Send match reminder push (1 hour before match)
 * @param {string} userId - User ID
 * @param {Object} match - Match data
 * @returns {Promise<boolean>} Success status
 */
export async function sendMatchReminderPush(userId, match) {
  try {
    const subscription = await getUserPushSubscription(userId);

    if (!subscription) {
      return false;
    }

    const { sport, startTime, location } = match;

    const success = await sendPushNotification(subscription, {
      title: '⏰ Promemoria Match',
      body: `Il tuo match di ${sport} inizia tra 1 ora\n📍 ${location} - ${startTime}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: `match-reminder-${match.id}`,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: {
        type: 'match-reminder',
        action: 'view',
        url: `/matches/${match.id}`,
        matchId: match.id,
        userId,
      },
      actions: [
        { action: 'view', title: '🗺️ Indicazioni', icon: '/icons/map.png' },
        { action: 'dismiss', title: 'OK', icon: '/icons/check.png' },
      ],
    });

    if (success) {
      logger.debug('Match reminder push sent to user:', userId);
    }

    return success;
  } catch (error) {
    logger.error('Error sending match reminder push:', error);
    return false;
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
    const subscriptions = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    return subscriptions[0];
  } catch (error) {
    logger.error('Error fetching user push subscription:', error);
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
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      logger.warn('Service Worker not supported');
      return false;
    }

    // Check if Push API is supported
    if (!('PushManager' in window)) {
      logger.warn('Push API not supported');
      return false;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      logger.warn('Notification permission denied');
      return false;
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
    });

    // Save subscription to Firestore
    const subscriptionData = {
      userId,
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.getKey('p256dh'),
        auth: subscription.getKey('auth'),
      },
      createdAt: Date.now(),
      userAgent: navigator.userAgent,
    };

    await fetch('/api/save-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData),
    });

    logger.log('Push notifications enabled successfully');
    return true;
  } catch (error) {
    logger.error('Error enabling push notifications:', error);
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
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Get current subscription
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Unsubscribe
      await subscription.unsubscribe();

      // Remove from Firestore
      await fetch('/api/remove-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, endpoint: subscription.endpoint }),
      });

      logger.log('Push notifications disabled successfully');
    }

    return true;
  } catch (error) {
    logger.error('Error disabling push notifications:', error);
    return false;
  }
}

/**
 * Check if user has push notifications enabled
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Enabled status
 */
export async function isPushNotificationsEnabled(userId) {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    return subscription !== null;
  } catch (error) {
    logger.error('Error checking push notification status:', error);
    return false;
  }
}

/**
 * Convert base64 string to Uint8Array
 * @param {string} base64String - Base64 encoded string
 * @returns {Uint8Array} Decoded array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
