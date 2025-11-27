/**
 * Capacitor Push Notifications Service
 * Gestisce le notifiche push native per Android e iOS
 *
 * @module capacitorPushService
 */

import { Capacitor } from '@capacitor/core';
import { db } from '@services/firebase.js';
import { doc, setDoc, deleteDoc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';

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

  // 2. Ottieni il token (promessa che si risolve quando il token arriva)
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Push registration timeout - token not received'));
    }, 30000); // 30 secondi timeout

    try {
      // Rimuovi listener precedenti per evitare duplicati
      await PushNotifications.removeAllListeners();

      // Listener per successo registrazione - DEFINITI PRIMA DI REGISTER()
      await PushNotifications.addListener('registration', async (token) => {
        clearTimeout(timeout);

        try {
          console.log('[CapacitorPush] ✅ Registration successful!');
          console.log('[CapacitorPush] Token:', token.value);

          const platform = Capacitor.getPlatform();
          const deviceId = await generateDeviceId();

          console.log('[CapacitorPush] Device info:', {
            platform,
            deviceId,
            tokenPrefix: token.value.substring(0, 30) + '...',
          });

          // 4. Salva token su Firestore
          const subscriptionData = {
            userId,
            firebaseUid: userId, // Aggiunto per compatibilità con backend
            deviceId,
            platform, // 'android' | 'ios'
            type: 'native',
            active: true, // ← CAMPO RICHIESTO dalla Cloud Function per filtrare subscription attive
            isActive: true, // ← Mantenuto per compatibilità
            createdAt: new Date().toISOString(),
            lastUsedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 giorni
          };

          // Token specifico per piattaforma + endpoint univoco
          if (platform === 'android') {
            subscriptionData.fcmToken = token.value;
            // Crea endpoint univoco per compatibilità con sistema web-push
            subscriptionData.endpoint = `fcm://android/${token.value.substring(0, 50)}`;
          } else if (platform === 'ios') {
            subscriptionData.apnsToken = token.value;
            subscriptionData.endpoint = `apns://ios/${token.value.substring(0, 50)}`;
          }

          // Salva in Firestore (usa userId_deviceId come doc ID per unicità)
          const docId = `${userId}_${deviceId}`;

          console.log('[CapacitorPush] Saving subscription to Firestore:', {
            docId,
            path: `pushSubscriptions/${docId}`,
            data: {
              ...subscriptionData,
              fcmToken: subscriptionData.fcmToken ? `${subscriptionData.fcmToken.substring(0, 20)}...` : undefined,
              apnsToken: subscriptionData.apnsToken ? `${subscriptionData.apnsToken.substring(0, 20)}...` : undefined,
            }
          });

          await setDoc(doc(db, 'pushSubscriptions', docId), subscriptionData);

          console.log('[CapacitorPush] ✅ Token saved to Firestore successfully:', {
            docId,
            platform: subscriptionData.platform,
            type: subscriptionData.type,
            active: subscriptionData.active,
            hasEndpoint: !!subscriptionData.endpoint,
          });

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
      await PushNotifications.addListener('registrationError', (error) => {
        clearTimeout(timeout);
        console.error('[CapacitorPush] ❌ Registration error:', error);
        reject(new Error(`Registration failed: ${error.error}`));
      });

      // 3. Registra il device (DOPO aver settato i listener)
      console.log('[CapacitorPush] Registering device for push...');
      await PushNotifications.register();

    } catch (err) {
      console.error('[CapacitorPush] Setup failed:', err);
      reject(err);
    }
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
 * Verifica se esiste una subscription attiva per il device corrente
 * @param {string} userId - ID dell'utente Firebase
 * @returns {Promise<boolean>} true se esiste subscription
 */
export async function hasActiveSubscription(userId) {
  const pluginsReady = await initializePlugins();
  if (!pluginsReady) return false;

  try {
    const deviceId = await generateDeviceId();
    const docId = `${userId}_${deviceId}`;
    const docRef = doc(db, 'pushSubscriptions', docId);
    const docSnap = await getDoc(docRef);
    
    return docSnap.exists() && docSnap.data().active === true;
  } catch (error) {
    console.error('[CapacitorPush] Error checking subscription:', error);
    return false;
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
  hasActiveSubscription,
};
