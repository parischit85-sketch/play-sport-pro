/**
 * Unified Push Service
 * API unificata per gestire push notifications su tutte le piattaforme:
 * - Web (Desktop): Web Push API + VAPID
 * - Android (Native): Firebase Cloud Messaging (FCM)
 * - iOS (Native): Apple Push Notification service (APNs)
 * - Windows (PWA): Web Push API
 */

import { Capacitor } from '@capacitor/core';
import capacitorPushService from './capacitorPushService';
import { subscribeToPush, unsubscribeFromPush, isPushSubscribed } from '@utils/push.js';

export class UnifiedPushService {
  constructor() {
    this.platform = Capacitor.getPlatform();
    this.isNative = Capacitor.isNativePlatform();
  }

  /**
   * Sottoscrivi l'utente alle notifiche push
   * Sceglie automaticamente il metodo corretto in base alla piattaforma
   */
  async subscribe(userId) {
    console.log('[UnifiedPush] Subscribing user:', userId);
    console.log('[UnifiedPush] Platform:', this.platform);
    console.log('[UnifiedPush] Is Native:', this.isNative);

    try {
      if (this.isNative) {
        // Mobile Native (Android/iOS)
        console.log('[UnifiedPush] Using Capacitor native push');
        const result = await capacitorPushService.registerNativePush(userId);

        // Setup listeners per gestire notifiche
        capacitorPushService.setupPushListeners({
          onNotificationReceived: (notification) => {
            console.log('[UnifiedPush] Notification received:', notification);
            this._handleNotificationReceived(notification);
          },
          onNotificationActionPerformed: (notification) => {
            console.log('[UnifiedPush] Notification clicked:', notification);
            this._handleNotificationClicked(notification);
          },
        });

        return {
          success: true,
          type: 'native',
          platform: this.platform,
          token: result.token,
          deviceId: result.deviceId,
          subscriptionId: result.subscriptionId,
        };
      } else {
        // Web (Desktop/PWA)
        console.log('[UnifiedPush] Using Web Push API');
        const subscription = await subscribeToPush(userId);

        return {
          success: true,
          type: 'web',
          platform: 'web',
          subscription: subscription,
        };
      }
    } catch (error) {
      console.error('[UnifiedPush] Subscription error:', error);
      throw error;
    }
  }

  /**
   * Annulla la sottoscrizione alle notifiche push
   */
  async unsubscribe(userId) {
    console.log('[UnifiedPush] Unsubscribing user:', userId);

    try {
      if (this.isNative) {
        await capacitorPushService.unregisterNativePush(userId);
      } else {
        await unsubscribeFromPush(userId);
      }

      return { success: true };
    } catch (error) {
      console.error('[UnifiedPush] Unsubscribe error:', error);
      throw error;
    }
  }

  /**
   * Verifica se l'utente è sottoscritto alle notifiche
   */
  async isSubscribed(userId) {
    try {
      if (this.isNative) {
        return await capacitorPushService.hasActiveSubscription(userId);
      } else {
        return await isPushSubscribed();
      }
    } catch (error) {
      console.error('[UnifiedPush] isSubscribed error:', error);
      return false;
    }
  }

  /**
   * Ottieni lo status dei permessi push
   */
  async getPermissionStatus() {
    try {
      if (this.isNative) {
        return await capacitorPushService.getPushPermissionStatus();
      } else {
        // Web Push API
        if (!('Notification' in window)) {
          return 'unsupported';
        }
        return Notification.permission; // 'granted' | 'denied' | 'default'
      }
    } catch (error) {
      console.error('[UnifiedPush] getPermissionStatus error:', error);
      return 'unknown';
    }
  }

  /**
   * Verifica se le push notifications sono supportate
   */
  isSupported() {
    if (this.isNative) {
      return capacitorPushService.isPushSupported();
    } else {
      return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    }
  }

  /**
   * Ottieni informazioni sulla piattaforma e supporto push
   */
  getPlatformInfo() {
    return {
      platform: this.platform,
      isNative: this.isNative,
      isSupported: this.isSupported(),
      pushType: this.isNative ? 'native' : 'web',
    };
  }

  /**
   * Richiedi permessi per notifiche
   * (utile per chiedere permessi prima della sottoscrizione)
   */
  async requestPermissions() {
    try {
      if (this.isNative) {
        return await capacitorPushService.requestPushPermissions();
      } else {
        if (!('Notification' in window)) {
          throw new Error('Notifications not supported');
        }
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    } catch (error) {
      console.error('[UnifiedPush] requestPermissions error:', error);
      throw error;
    }
  }

  /**
   * Schedule una notifica locale (client-side)
   * Solo per piattaforme native
   */
  async scheduleLocalNotification(notification) {
    if (!this.isNative) {
      throw new Error('Local notifications only supported on native platforms');
    }

    return await capacitorPushService.scheduleLocalNotification(notification);
  }

  /**
   * Handler privato per notifiche ricevute
   * @private
   */
  _handleNotificationReceived(notification) {
    // Emit custom event per componenti React
    const event = new CustomEvent('push-notification-received', {
      detail: notification,
    });
    window.dispatchEvent(event);
  }

  /**
   * Handler privato per click su notifiche
   * @private
   */
  _handleNotificationClicked(notification) {
    const deepLink =
      notification.notification?.data?.url || notification.notification?.data?.deepLink;

    if (deepLink) {
      // Emit custom event con deep link per routing
      const event = new CustomEvent('push-notification-clicked', {
        detail: {
          notification,
          deepLink,
        },
      });
      window.dispatchEvent(event);
    }
  }
}

// Export singleton instance
export const unifiedPushService = new UnifiedPushService();

// Export anche la classe per testing
export default unifiedPushService;
