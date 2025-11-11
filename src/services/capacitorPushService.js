/**
 * Capacitor Push Notifications Service
 * Gestisce le notifiche push native per Android e iOS
 *
 * @module capacitorPushService
 */

import { Capacitor } from '@capacitor/core';
import { db } from '@services/firebase.js';
import { doc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Lazy import dei plugin Capacitor (evita errori in web context)
let PushNotifications = null;
let LocalNotifications = null;

/**
 * Inizializza i plugin Capacitor solo su piattaforme native
 */
async function initializePlugins() {
  if (!Capacitor.isNativePlatform()) {
    console.log('[CapacitorPush] Not a native platform, skipping plugin initialization');
    return false;
  }

  try {
    if (!PushNotifications) {
      const pushModule = await import('@capacitor/push-notifications');
      PushNotifications = pushModule.PushNotifications;
    }

    if (!LocalNotifications) {
      const localModule = await import('@capacitor/local-notifications');
      LocalNotifications = localModule.LocalNotifications;
    }

    return true;
  } catch (error) {
    console.error('[CapacitorPush] Failed to load plugins:', error);
    return false;
  }
}

/**
 * Genera un device ID univoco basato su platform + UUID
 */
async function generateDeviceId() {
  const platform = Capacitor.getPlatform();

  // Usa Device plugin se disponibile per ID univoco
  try {
    const { Device } = await import('@capacitor/device');
    const info = await Device.getId();
    return `${platform}-${info.identifier || info.uuid}`;
  } catch {
    // Fallback: genera ID random (meno affidabile)
    console.warn('[CapacitorPush] Device plugin not available, using random ID');
    return `${platform}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Richiede permessi per notifiche push native
 * @returns {Promise<boolean>} true se permesso concesso
 */
export async function requestPushPermissions() {
  const pluginsReady = await initializePlugins();
  if (!pluginsReady) {
    throw new Error('Native platform required for push notifications');
  }

  try {
    console.log('[CapacitorPush] Requesting push permissions...');
    const permission = await PushNotifications.requestPermissions();

    console.log('[CapacitorPush] Permission result:', permission);

    if (permission.receive === 'granted') {
      console.log('[CapacitorPush] ✅ Push permissions granted');
      return true;
    } else {
      console.warn('[CapacitorPush] ⚠️ Push permissions denied:', permission.receive);
      return false;
    }
  } catch (error) {
    console.error('[CapacitorPush] Error requesting permissions:', error);
    throw error;
  }
}

/**
 * Registra il device per ricevere notifiche push native
 * @param {string} userId - ID dell'utente Firebase
 * @returns {Promise<Object>} Oggetto con token e deviceId
 */
export async function registerNativePush(userId) {
  const pluginsReady = await initializePlugins();
  if (!pluginsReady) {
    throw new Error('Native platform required for push notifications');
  }

  console.log('[CapacitorPush] Starting native push registration for user:', userId);

  // 1. Richiedi permessi
  const hasPermission = await requestPushPermissions();
  if (!hasPermission) {
    throw new Error('Push notification permissions denied');
  }

  // 2. Registra il device
  console.log('[CapacitorPush] Registering device for push...');
  await PushNotifications.register();

  // 3. Ottieni il token (promessa che si risolve quando il token arriva)
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Push registration timeout - token not received'));
    }, 30000); // 30 secondi timeout

    // Listener per successo registrazione
    PushNotifications.addListener('registration', async (token) => {
      clearTimeout(timeout);

      try {
        console.log('[CapacitorPush] ✅ Registration successful!');
        console.log('[CapacitorPush] Token:', token.value);

        const platform = Capacitor.getPlatform();
        const deviceId = await generateDeviceId();

        // 4. Salva token su Firestore
        const subscriptionData = {
          userId,
          deviceId,
          platform, // 'android' | 'ios'
          type: 'native',
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 giorni
          isActive: true,
        };

        // Token specifico per piattaforma
        if (platform === 'android') {
          subscriptionData.fcmToken = token.value;
        } else if (platform === 'ios') {
          subscriptionData.apnsToken = token.value;
        }

        // Salva in Firestore (usa userId_deviceId come doc ID per unicità)
        const docId = `${userId}_${deviceId}`;
        await setDoc(doc(db, 'pushSubscriptions', docId), subscriptionData);

        console.log('[CapacitorPush] ✅ Token saved to Firestore:', docId);

        resolve({
          token: token.value,
          deviceId,
          platform,
          subscriptionId: docId,
        });
      } catch (error) {
        console.error('[CapacitorPush] Error saving token:', error);
        reject(error);
      }
    });

    // Listener per errori registrazione
    PushNotifications.addListener('registrationError', (error) => {
      clearTimeout(timeout);
      console.error('[CapacitorPush] ❌ Registration error:', error);
      reject(new Error(`Registration failed: ${error.error}`));
    });
  });
}

/**
 * Rimuove la registrazione push per il device corrente
 * @param {string} userId - ID dell'utente Firebase
 */
export async function unregisterNativePush(userId) {
  const pluginsReady = await initializePlugins();
  if (!pluginsReady) {
    console.log('[CapacitorPush] Not a native platform, nothing to unregister');
    return;
  }

  try {
    const deviceId = await generateDeviceId();
    const docId = `${userId}_${deviceId}`;

    // 1. Rimuovi da Firestore
    await deleteDoc(doc(db, 'pushSubscriptions', docId));
    console.log('[CapacitorPush] ✅ Subscription removed from Firestore:', docId);

    // 2. Unregister dal device (opzionale - il token rimane valido ma non sarà più usato)
    // await PushNotifications.unregister(); // Commentato: manteniamo il token per re-registrazione futura
  } catch (error) {
    console.error('[CapacitorPush] Error unregistering:', error);
    throw error;
  }
}

/**
 * Setup dei listener per gestire notifiche ricevute e interazioni
 * @param {Object} callbacks - Callback functions per vari eventi
 */
export function setupPushListeners(callbacks = {}) {
  const { onNotificationReceived = () => {}, onNotificationActionPerformed = () => {} } = callbacks;

  if (!Capacitor.isNativePlatform()) {
    console.log('[CapacitorPush] Not a native platform, skipping listener setup');
    return;
  }

  initializePlugins().then((pluginsReady) => {
    if (!pluginsReady) return;

    // Listener: Notifica ricevuta mentre app è in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[CapacitorPush] 📬 Push notification received (foreground):', notification);

      // Traccia analytics
      trackNotificationEvent('delivered', notification);

      // Callback personalizzato
      onNotificationReceived(notification);
    });

    // Listener: Click su notifica (app in background o chiusa)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('[CapacitorPush] 👆 Push notification action performed:', notification);

      // Traccia analytics
      trackNotificationEvent('clicked', notification);

      // Callback personalizzato
      onNotificationActionPerformed(notification);

      // Deep linking automatico se presente
      const deepLink =
        notification.notification?.data?.url || notification.notification?.data?.deepLink;
      if (deepLink && window.location) {
        console.log('[CapacitorPush] Navigating to deep link:', deepLink);
        // Navigazione gestita dal callback (può usare React Router)
      }
    });

    console.log('[CapacitorPush] ✅ Push listeners setup complete');
  });
}

/**
 * Verifica se le notifiche push native sono supportate
 * @returns {boolean}
 */
export function isPushSupported() {
  return Capacitor.isNativePlatform();
}

/**
 * Ottieni lo stato corrente dei permessi push
 * @returns {Promise<string>} 'granted' | 'denied' | 'prompt'
 */
export async function getPushPermissionStatus() {
  const pluginsReady = await initializePlugins();
  if (!pluginsReady) {
    return 'unsupported';
  }

  try {
    const permission = await PushNotifications.checkPermissions();
    return permission.receive;
  } catch (error) {
    console.error('[CapacitorPush] Error checking permissions:', error);
    return 'unknown';
  }
}

/**
 * Ottieni tutte le subscriptions native per un utente
 * @param {string} userId - ID dell'utente Firebase
 * @returns {Promise<Array>} Array di subscriptions
 */
export async function getUserNativeSubscriptions(userId) {
  try {
    const q = query(
      collection(db, 'pushSubscriptions'),
      where('userId', '==', userId),
      where('type', '==', 'native'),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('[CapacitorPush] Error fetching subscriptions:', error);
    return [];
  }
}

/**
 * Traccia evento notifica per analytics
 * @private
 */
async function trackNotificationEvent(eventType, notification) {
  try {
    const event = {
      type: eventType,
      channel: 'native-push',
      platform: Capacitor.getPlatform(),
      timestamp: new Date().toISOString(),
      notificationId: notification.id || notification.notification?.id,
      notificationType: notification.data?.type || 'general',
      metadata: {
        title: notification.title || notification.notification?.title,
        body: notification.body || notification.notification?.body,
        data: notification.data || notification.notification?.data,
      },
    };

    // Salva in Firestore per analytics
    await setDoc(doc(collection(db, 'notificationEvents')), event);
    console.log('[CapacitorPush] 📊 Analytics event tracked:', eventType);
  } catch (error) {
    console.warn('[CapacitorPush] Failed to track analytics event:', error);
    // Non bloccare il flusso principale per errori di tracking
  }
}

/**
 * Invia una notifica locale (non richiede backend)
 * Utile per promemoria client-side
 * @param {Object} notification - Configurazione notifica
 */
export async function scheduleLocalNotification(notification) {
  const pluginsReady = await initializePlugins();
  if (!pluginsReady) {
    console.log('[CapacitorPush] Local notifications not supported on this platform');
    return;
  }

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notification.id || Date.now(),
          title: notification.title,
          body: notification.body,
          schedule: notification.schedule || { at: new Date(Date.now() + 5000) }, // Default: 5 secondi
          sound: notification.sound,
          attachments: notification.attachments,
          actionTypeId: notification.actionTypeId || '',
          extra: notification.data || {},
        },
      ],
    });

    console.log('[CapacitorPush] ✅ Local notification scheduled');
  } catch (error) {
    console.error('[CapacitorPush] Error scheduling local notification:', error);
    throw error;
  }
}

// Export default service object
export default {
  registerNativePush,
  unregisterNativePush,
  requestPushPermissions,
  setupPushListeners,
  isPushSupported,
  getPushPermissionStatus,
  getUserNativeSubscriptions,
  scheduleLocalNotification,
};
