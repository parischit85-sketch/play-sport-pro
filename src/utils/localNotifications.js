/**
 * Local Notifications Manager
 * Gestisce notifiche locali per piattaforme che non supportano Web Push (iOS Safari)
 */

// Import analytics tracking
import { trackNotificationEvent } from './analytics';

export class LocalNotificationManager {
  /**
   * Verifica se le notifiche locali sono supportate
   */
  static isSupported() {
    return 'Notification' in window;
  }

  /**
   * Richiede permesso per le notifiche locali
   */
  static async requestPermission() {
    if (!this.isSupported()) {
      console.warn('🔔 Local notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('🔔 Local notification permission:', permission);
      return permission;
    } catch (error) {
      console.error('🔔 Error requesting local notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Mostra una notifica locale immediata
   */
  static async showNotification(title, body, options = {}) {
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      console.warn('🔔 Cannot show local notification: permission denied');
      return false;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: options.icon || '/icon-192x192.png',
        badge: options.badge || '/badge-72x72.png',
        tag: options.tag || 'local-notification',
        data: options.data || {},
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        timestamp: Date.now(),
        ...options,
      });

      // Track notification shown event
      await trackNotificationEvent({
        type: 'delivered',
        channel: 'local',
        userId: options.data?.playerId || 'anonymous',
        clubId: options.data?.clubId,
        notificationType: options.data?.type || 'local',
        platform: 'web',
        success: true,
        metadata: {
          title,
          tag: options.tag,
          hasActions: false, // Local notifications don't support actions
          requireInteraction: options.requireInteraction,
          isScheduled: !!options.scheduledId,
        },
      });

      // Auto-close dopo timeout se specificato
      if (options.autoClose && typeof options.autoClose === 'number') {
        setTimeout(() => {
          notification.close();
        }, options.autoClose);
      }

      console.log('✅ Local notification shown:', title);
      return true;
    } catch (error) {
      console.error('❌ Error showing local notification:', error);
      return false;
    }
  }

  /**
   * Schedule una notifica locale futura
   */
  static async scheduleNotification(title, body, delayMinutes, options = {}) {
    if (!this.isSupported()) {
      console.warn('🔔 Local notifications not supported for scheduling');
      return false;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      console.warn('🔔 Cannot schedule local notification: permission denied');
      return false;
    }

    const delayMs = delayMinutes * 60 * 1000;
    const scheduledTime = new Date(Date.now() + delayMs);

    console.log('⏰ Scheduling local notification:', {
      title,
      delayMinutes,
      scheduledTime: scheduledTime.toLocaleString(),
    });

    // Salva in localStorage per persistenza
    const scheduledNotifications = JSON.parse(
      localStorage.getItem('scheduledLocalNotifications') || '[]'
    );

    const notificationId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    scheduledNotifications.push({
      id: notificationId,
      title,
      body,
      scheduledTime: scheduledTime.toISOString(),
      options: {
        ...options,
        scheduledId: notificationId,
      },
    });

    localStorage.setItem('scheduledLocalNotifications', JSON.stringify(scheduledNotifications));

    // Schedule con setTimeout
    setTimeout(async () => {
      await this.showNotification(title, body, {
        ...options,
        tag: `scheduled-${notificationId}`,
        data: {
          ...options.data,
          scheduledId: notificationId,
          scheduledTime: scheduledTime.toISOString(),
        },
      });

      // Rimuovi dalla lista dopo averla mostrata
      this.removeScheduledNotification(notificationId);
    }, delayMs);

    return notificationId;
  }

  /**
   * Rimuovi una notifica schedulata
   */
  static removeScheduledNotification(notificationId) {
    const scheduledNotifications = JSON.parse(
      localStorage.getItem('scheduledLocalNotifications') || '[]'
    );

    const filtered = scheduledNotifications.filter(n => n.id !== notificationId);
    localStorage.setItem('scheduledLocalNotifications', JSON.stringify(filtered));

    console.log('🗑️ Removed scheduled notification:', notificationId);
  }

  /**
   * Ottieni tutte le notifiche schedulate
   */
  static getScheduledNotifications() {
    return JSON.parse(localStorage.getItem('scheduledLocalNotifications') || '[]');
  }

  /**
   * Cancella tutte le notifiche schedulate
   */
  static clearAllScheduledNotifications() {
    localStorage.removeItem('scheduledLocalNotifications');
    console.log('🗑️ Cleared all scheduled notifications');
  }

  /**
   * Inizializza il sistema di notifiche locali
   * Da chiamare all'avvio dell'app
   */
  static async initialize() {
    console.log('🔔 Initializing Local Notifications Manager');

    // Richiedi permesso all'avvio se siamo su iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && this.isSupported()) {
      // Non richiedere automaticamente permesso, aspetta interazione utente
      console.log('🍎 iOS detected - local notifications available as fallback');
    }

    // Setup event listeners per analytics
    this.setupEventListeners();

    // Ripristina notifiche schedulate dopo reload
    this.restoreScheduledNotifications();

    console.log('✅ Local Notifications Manager initialized');
  }

  /**
   * Setup event listeners per tracciare interazioni con notifiche locali
   */
  static setupEventListeners() {
    if (!this.isSupported()) return;

    // Nota: Le Notification API native non hanno event listener diretti per click/close
    // Il tracking avviene principalmente nel service worker per le push notifications
    // e programmaticamente per le notifiche locali

    console.log('📊 Local notification analytics listeners setup');
  }

  /**
   * Ripristina notifiche schedulate dopo reload della pagina
   */
  static restoreScheduledNotifications() {
    const scheduled = this.getScheduledNotifications();

    scheduled.forEach(notification => {
      const scheduledTime = new Date(notification.scheduledTime);
      const now = new Date();
      const delayMs = scheduledTime.getTime() - now.getTime();

      if (delayMs > 0) {
        // Ri-schedule se non è ancora scaduta
        setTimeout(async () => {
          await this.showNotification(notification.title, notification.body, notification.options);
          this.removeScheduledNotification(notification.id);
        }, delayMs);

        console.log('🔄 Restored scheduled notification:', notification.title);
      } else {
        // Rimuovi se già scaduta
        this.removeScheduledNotification(notification.id);
      }
    });
  }

  /**
   * Utility per creare notifiche di promemoria certificato
   */
  static async scheduleCertificateReminder(certificateData, daysLeft) {
    const title = daysLeft === 0 ? '⚠️ Certificato Scaduto' : `⏰ Certificato in Scadenza`;
    const body = daysLeft === 0
      ? `Il tuo certificato è scaduto. Rinnovalo immediatamente.`
      : `Il tuo certificato scade tra ${daysLeft} giorni. Ricordati di rinnovarlo.`;

    return await this.scheduleNotification(title, body, 0, { // Immediata
      tag: `certificate-${certificateData.id}`,
      data: {
        type: 'certificate-reminder',
        certificateId: certificateData.id,
        daysLeft,
        expiryDate: certificateData.expiryDate,
      },
      requireInteraction: true,
      autoClose: 10000, // 10 secondi
    });
  }

  /**
   * Utility per creare notifiche di promemoria prenotazione
   */
  static async scheduleBookingReminder(bookingData, hoursLeft) {
    const title = '🎾 Prenotazione Imminente';
    const body = `La tua prenotazione per ${bookingData.courtName} inizia tra ${hoursLeft} ore.`;

    return await this.scheduleNotification(title, body, 0, { // Immediata
      tag: `booking-${bookingData.id}`,
      data: {
        type: 'booking-reminder',
        bookingId: bookingData.id,
        hoursLeft,
        startTime: bookingData.startTime,
      },
      requireInteraction: true,
      autoClose: 8000, // 8 secondi
    });
  }
}

// Inizializza automaticamente quando il modulo viene importato
if (typeof window !== 'undefined') {
  // Aspetta che il DOM sia pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      LocalNotificationManager.initialize();
    });
  } else {
    LocalNotificationManager.initialize();
  }
}