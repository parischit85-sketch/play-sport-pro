/**
 * Web Push Notification Service
 * Gestisce la sottoscrizione e l'invio di notifiche push del sistema
 */

// VAPID public key - generato con web-push generate-vapid-keys
const VAPID_PUBLIC_KEY =
  'BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM809QTxc85X9oiHFKLovhxCpTgpAQV8zX6iJwLKy_wmMEQx7HHZUKrXusdM';

// Base URL per le Netlify Functions
// In sviluppo locale usa le Functions di produzione
export const FUNCTIONS_BASE_URL = import.meta.env.DEV
  ? 'https://play-sport-pro-v2-2025.netlify.app/.netlify/functions'
  : '/.netlify/functions';

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
    console.warn('Questo browser non supporta le notifiche');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Registra il service worker e ottiene la sottoscrizione push
 */
export async function subscribeToPush(userId) {
  try {
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
      registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
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

    console.log('[saveSubscription] Saving subscription for userId:', userId);
    console.log('[saveSubscription] Endpoint:', endpoint);
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
        timestamp: new Date().toISOString(),
      }),
    });

    const responseText = await response.text();
    console.log('[saveSubscription] Response status:', response.status);
    console.log('[saveSubscription] Response body:', responseText);

    if (!response.ok) {
      throw new Error(
        `Errore nel salvataggio della sottoscrizione: ${response.status} - ${responseText}`
      );
    }

    console.log('✅ Sottoscrizione push salvata con successo');
  } catch (error) {
    console.error('❌ Errore nel salvataggio della sottoscrizione:', error);
    throw error;
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
    } catch (e) {
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
