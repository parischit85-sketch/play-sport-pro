/**
 * Web Push Notification Service
 * Gestisce la sottoscrizione e l'invio di notifiche push del sistema
 */

import {
  PushServiceError,
  PushConfigurationError,
  PushSubscriptionError,
  PushSendError,
  logPushError
} from './push-errors.js';

// VAPID public key - generato con web-push generate-vapid-keys
const VAPID_PUBLIC_KEY =
  'BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM809QTxc85X9oiHFKLovhxCpTgpAQV8zX6iJwLKy_wmMEQx7HHZUKrXusdM';

// Base URL per le Netlify Functions
// In sviluppo locale usa le Functions di produzione
export const FUNCTIONS_BASE_URL = import.meta.env.DEV
  ? 'https://play-sport-pro-v2-2025.netlify.app/.netlify/functions'
  : '/.netlify/functions';

/**
 * Genera un device ID univoco basato su browser fingerprint
 */
async function generateDeviceId() {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    !!window.indexedDB,
    navigator.hardwareConcurrency || 'unknown',
    navigator.platform,
  ];

  // Aggiungi canvas fingerprint se disponibile
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Fingerprint', 2, 2);
    components.push(canvas.toDataURL());
  } catch (e) {
    components.push('canvas-not-supported');
  }

  // Crea hash dei componenti
  const fingerprint = components.join('|');
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return 'device-' + Math.abs(hash).toString(36).substring(0, 12);
}

/**
 * Converte una chiave VAPID base64 in Uint8Array
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

/**
 * Richiede il permesso per le notifiche
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    throw new PushSubscriptionError('service-worker-failed', {
      reason: 'browser-not-supported',
      browser: navigator.userAgent
    });
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    throw new PushSubscriptionError('permission-denied', {
      currentPermission: Notification.permission
    });
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    logPushError(error, { context: 'requestNotificationPermission' });
    throw new PushSubscriptionError('permission-denied', {
      originalError: error.message
    });
  }
}

/**
 * Registra il service worker e ottiene la sottoscrizione push
 */
export async function subscribeToPush(userId) {
  try {
    // Controlla se siamo in mock mode
    if (window.__MOCK_PUSH_MODE__) {
      console.log('🎭 [MOCK] Using mock push subscription');
      return await mockSubscribeToPush(userId);
    }

    // Verifica supporto
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications non supportate');
      return null;
    }

    // Richiedi permesso
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Permesso notifiche negato');
      return null;
    }

    // Registra service worker
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      try {
        console.log('📝 Registering Service Worker...');
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          type: 'classic',
        });
        console.log('✅ Service Worker registered successfully');
        await navigator.serviceWorker.ready;
        console.log('✅ Service Worker ready');
      } catch (swError) {
        console.error('❌ Service Worker registration failed:', swError);

        // In development, se SW fallisce, mostra un messaggio utile
        if (import.meta.env.DEV) {
          throw new Error(
            'Service Worker registration failed. ' +
              'In development, you may need to:\n' +
              '1. Clear browser cache (Ctrl+Shift+Del)\n' +
              '2. Disable other Service Workers\n' +
              '3. Check if /public/sw.js exists\n' +
              '4. Try in incognito mode\n\n' +
              `Original error: ${swError.message}`
          );
        }
        throw swError;
      }
    }

    // Controlla se esiste già una sottoscrizione
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Crea nuova sottoscrizione
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // Salva la sottoscrizione sul server
    await saveSubscription(userId, subscription);

    return subscription;
  } catch (error) {
    console.error('Errore nella sottoscrizione push:', error);
    return null;
  }
}

/**
 * Annulla la sottoscrizione push
 */
export async function unsubscribeFromPush(userId) {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return true;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return true;

    // Rimuovi dal server
    await removeSubscription(userId, subscription);

    // Annulla la sottoscrizione
    await subscription.unsubscribe();
    return true;
  } catch (error) {
    console.error("Errore nell'annullamento sottoscrizione:", error);
    return false;
  }
}

/**
 * Salva la sottoscrizione su Firestore
 */
async function saveSubscription(userId, subscription) {
  try {
    const endpoint = subscription.endpoint;
    const subscriptionData = subscription.toJSON();

    // Genera device ID basato su browser fingerprint
    const deviceId = await generateDeviceId();

    console.log('[saveSubscription] Saving subscription for userId:', userId);
    console.log('[saveSubscription] Endpoint:', endpoint);
    console.log('[saveSubscription] Device ID:', deviceId);
    console.log('[saveSubscription] Using Functions URL:', FUNCTIONS_BASE_URL);

    const response = await fetch(`${FUNCTIONS_BASE_URL}/save-push-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        subscription: subscriptionData,
        endpoint,
        deviceId,
        timestamp: new Date().toISOString(),
      }),
    });

    const responseText = await response.text();
    console.log('[saveSubscription] Response status:', response.status);
    console.log('[saveSubscription] Response body:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }

      throw new PushSendError('subscription-save-failed', {
        status: response.status,
        response: errorData,
        userId,
        endpoint: endpoint.substring(0, 50) + '...'
      });
    }

    console.log('✅ Sottoscrizione push salvata con successo');
  } catch (error) {
    // Se è già un PushServiceError, rilancia
    if (error instanceof PushServiceError) {
      throw error;
    }

    // Altrimenti, wrap in PushSendError
    logPushError(error, {
      context: 'saveSubscription',
      userId,
      endpoint: subscription?.endpoint?.substring(0, 50) + '...'
    });
    throw new PushSendError('network-error', {
      originalError: error.message,
      userId
    });
  }
}

/**
 * Rimuove la sottoscrizione da Firestore
 */
async function removeSubscription(userId, subscription) {
  try {
    const endpoint = subscription.endpoint;

    const response = await fetch(`${FUNCTIONS_BASE_URL}/remove-push-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        endpoint,
      }),
    });

    if (!response.ok) {
      throw new Error('Errore nella rimozione della sottoscrizione');
    }

    console.log('Sottoscrizione push rimossa con successo');
  } catch (error) {
    console.error('Errore nella rimozione della sottoscrizione:', error);
    throw error;
  }
}

/**
 * Invia una notifica push di test
 */
export async function sendTestNotification(userId) {
  try {
    // Controlla se siamo in mock mode
    if (window.__MOCK_PUSH_MODE__) {
      console.log('🎭 [MOCK] Using mock send test notification');
      return await mockSendTestNotification(userId);
    }

    const response = await fetch(`${FUNCTIONS_BASE_URL}/send-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        notification: {
          title: 'Notifica di Test',
          body: 'Questa è una notifica push di test!',
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: 'test-notification',
          data: {
            url: '/',
            timestamp: Date.now(),
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Errore nell'invio della notifica di test");
    }

    console.log('Notifica di test inviata con successo');
    return true;
  } catch (error) {
    console.error("Errore nell'invio della notifica di test:", error);
    return false;
  }
}

/**
 * Controlla se l'utente è sottoscritto alle notifiche push
 */
export async function isPushSubscribed() {
  try {
    // Mock mode: sempre "subscribed" se mock è attivo
    if (window.__MOCK_PUSH_MODE__) {
      console.log('🎭 [MOCK] Mock mode active - reporting as subscribed');
      return true;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    console.error('Errore nel controllo sottoscrizione:', error);
    return false;
  }
}

/**
 * Ottiene lo stato delle notifiche push
 */
export function getPushNotificationStatus() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return 'unsupported';
  }

  switch (Notification.permission) {
    case 'granted':
      return 'granted';
    case 'denied':
      return 'denied';
    default:
      return 'default';
  }
}

/**
 * Verifica la configurazione del server push (Netlify Functions)
 * Chiama la function `test-env` per controllare la presenza delle env vars.
 * Ritorna un oggetto { ok: boolean, data?: any, error?: string }
 */
export async function checkPushServerConfig() {
  try {
    const res = await fetch(`${FUNCTIONS_BASE_URL}/test-env`, { method: 'GET' });
    const text = await res.text();

    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      const message = data && data.error ? data.error : `HTTP ${res.status}`;
      return { ok: false, error: message, data };
    }

    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// =============================================
// MOCK FUNCTIONS (per development)
// =============================================

/**
 * Mock subscription per development
 */
async function mockSubscribeToPush(userId) {
  try {
    console.log('🎭 [MOCK] Requesting notification permission...');
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('🎭 [MOCK] Permission denied');
      return null;
    }

    console.log('🎭 [MOCK] Registering mock service worker...');
    // Simula registrazione SW
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('🎭 [MOCK] Creating mock subscription...');
    const mockSubscription = {
      endpoint: 'mock://push-endpoint-' + Date.now(),
      toJSON: () => ({
        endpoint: 'mock://push-endpoint-' + Date.now(),
        keys: {
          p256dh: 'mock-p256dh-key-' + Math.random().toString(36).substr(2, 9),
          auth: 'mock-auth-key-' + Math.random().toString(36).substr(2, 9)
        }
      })
    };

    console.log('🎭 [MOCK] Saving mock subscription...');
    await mockSaveSubscription(userId, mockSubscription);

    console.log('✅ [MOCK] Mock subscription completed');
    return mockSubscription;
  } catch (error) {
    console.error('🎭 [MOCK] Mock subscription failed:', error);
    return null;
  }
}

/**
 * Mock save subscription
 */
async function mockSaveSubscription(userId, subscription) {
  console.log('🎭 [MOCK] Saving subscription to localStorage');

  const subscriptions = JSON.parse(localStorage.getItem('mock-push-subscriptions') || '[]');
  const subscriptionData = {
    userId,
    subscription: subscription.toJSON(),
    endpoint: subscription.endpoint,
    timestamp: new Date().toISOString(),
    mock: true
  };

  // Rimuovi subscription esistente per questo user
  const filtered = subscriptions.filter(sub => sub.userId !== userId);
  filtered.push(subscriptionData);

  localStorage.setItem('mock-push-subscriptions', JSON.stringify(filtered));

  console.log('✅ [MOCK] Subscription saved');
}

/**
 * Mock send test notification
 */
async function mockSendTestNotification(userId) {
  console.log('🎭 [MOCK] Sending test notification');

  const subscriptions = JSON.parse(localStorage.getItem('mock-push-subscriptions') || '[]');
  const userSubscription = subscriptions.find(sub => sub.userId === userId);

  if (!userSubscription) {
    console.warn('🎭 [MOCK] No subscription found for user');
    return false;
  }

  // Simula delay di rete
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Mostra notifica mock
  const notification = new Notification('Notifica di Test (Mock)', {
    body: 'Questa è una notifica push di test simulata!',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'test-notification',
    data: {
      url: '/',
      timestamp: Date.now(),
      mock: true
    }
  });

  // Auto-close dopo 5 secondi
  setTimeout(() => {
    notification.close();
  }, 5000);

  console.log('✅ [MOCK] Test notification sent');
  return true;
}

/**
 * MOCK FUNCTIONS - Solo per development quando SW fallisce
 */
