/**
 * Web Push Notification Service
 * Gestisce la sottoscrizione e l'invio di notifiche push del sistema
 */

import {
  PushServiceError,
  PushSubscriptionError,
  PushSendError,
  logPushError,
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
 * Genera un device ID univoco basato su browser fingerprint avanzato
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
    navigator.cookieEnabled,
    navigator.doNotTrack,
    navigator.maxTouchPoints || 0,
  ];

  // Aggiungi canvas fingerprint se disponibile
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('PlaySportPro-Fingerprint', 2, 2);
    ctx.fillRect(10, 10, 5, 5);
    components.push(canvas.toDataURL().slice(0, 50)); // Solo primi 50 caratteri per performance
  } catch {
    components.push('canvas-not-supported');
  }

  // Aggiungi WebGL fingerprint se disponibile
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      }
    }
  } catch {
    components.push('webgl-not-supported');
  }

  // Aggiungi audio fingerprint se disponibile
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    oscillator.connect(analyser);
    analyser.connect(audioContext.destination);
    oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
    oscillator.start();
    const buffer = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(buffer);
    components.push(buffer.slice(0, 10).join(',')); // Solo primi 10 valori
    oscillator.stop();
  } catch {
    components.push('audio-not-supported');
  }

  // Crea hash dei componenti
  const fingerprint = components.join('|');
  let hash1 = 0;
  let hash2 = 0;

  // Double hash per ridurre collisioni
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash1 = (hash1 << 5) - hash1 + char;
    hash1 = hash1 & hash1; // Convert to 32-bit integer
    hash2 = (hash2 << 7) - hash2 + char;
    hash2 = hash2 & hash2;
  }

  // Combina i due hash per device ID più robusto
  const combinedHash = Math.abs(hash1) ^ Math.abs(hash2);
  return combinedHash.toString();
}

/**
 * Verifica se una subscription esistente è ancora valida
 */
async function validateExistingSubscription(subscription, userId) {
  try {
    // Verifica struttura della subscription
    if (!subscription || !subscription.endpoint) {
      console.log('[validateExistingSubscription] Invalid subscription structure');
      return false;
    }

    // Verifica se la subscription è nel database e attiva
    const deviceId = await generateDeviceId();
    const response = await fetch(`${FUNCTIONS_BASE_URL}/check-subscription-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        deviceId,
        endpoint: subscription.endpoint,
      }),
    });

    if (!response.ok) {
      console.warn('[validateExistingSubscription] Failed to check subscription status');
      return false;
    }

    const status = await response.json();
    return status.isValid && status.isActive;

  } catch (error) {
    console.warn('[validateExistingSubscription] Error validating subscription:', error);
    return false;
  }
}

/**
 * Gestisce conflitti di dispositivi (stesso user, device diverso)
 */
async function handleDeviceConflict(userId, currentDeviceId) {
  try {
    console.log('[handleDeviceConflict] Checking for device conflicts...');

    const response = await fetch(`${FUNCTIONS_BASE_URL}/get-user-devices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        currentDeviceId,
      }),
    });

    if (!response.ok) {
      console.warn('[handleDeviceConflict] Failed to get user devices');
      return;
    }

    const data = await response.json();

    if (data.hasConflicts && data.conflictingDevices.length > 0) {
      console.log(`[handleDeviceConflict] Found ${data.conflictingDevices.length} conflicting devices`);

      // In un'implementazione completa, qui potremmo:
      // 1. Mostrare un dialog all'utente per scegliere quale dispositivo mantenere
      // 2. Disattivare automaticamente dispositivi vecchi
      // 3. Loggare il conflitto per analytics

      // Per ora, loggiamo solo il conflitto
      console.warn('[handleDeviceConflict] Device conflict detected:', data.conflictingDevices);

      // Potremmo disattivare automaticamente dispositivi molto vecchi
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const oldDevices = data.conflictingDevices.filter(device =>
        new Date(device.lastUsedAt || device.createdAt) < thirtyDaysAgo
      );

      if (oldDevices.length > 0) {
        console.log(`[handleDeviceConflict] Auto-deactivating ${oldDevices.length} old devices`);

        await fetch(`${FUNCTIONS_BASE_URL}/deactivate-old-devices`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            deviceIds: oldDevices.map((d) => d.deviceId),
          }),
        });
      }
    }

  } catch (error) {
    console.warn('[handleDeviceConflict] Error handling device conflict:', error);
  }
}

/**
 * Effettua cleanup manuale delle subscriptions obsolete
 */
export async function cleanupObsoleteSubscriptions(userId) {
  try {
    console.log('[cleanupObsoleteSubscriptions] Starting manual cleanup...');

    const response = await fetch(`${FUNCTIONS_BASE_URL}/cleanup-user-subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        forceCleanup: true,
      }),
    });

    if (!response.ok) {
      console.warn('[cleanupObsoleteSubscriptions] Cleanup request failed');
      return false;
    }

    const result = await response.json();
    console.log('[cleanupObsoleteSubscriptions] Cleanup completed:', result);

    return result.cleanedCount > 0;

  } catch (error) {
    console.warn('[cleanupObsoleteSubscriptions] Error during cleanup:', error);
    return false;
  }
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
      browser: navigator.userAgent,
    });
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    throw new PushSubscriptionError('permission-denied', {
      currentPermission: Notification.permission,
    });
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    logPushError(error, { context: 'requestNotificationPermission' });
    throw new PushSubscriptionError('permission-denied', {
      originalError: error.message,
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

    if (subscription) {
      // Verifica se la subscription esistente è ancora valida
      const isValid = await validateExistingSubscription(subscription, userId);
      if (!isValid) {
        console.log('[subscribeToPush] Existing subscription is invalid, unsubscribing...');
        await subscription.unsubscribe();
        subscription = null;
      }
    }

    if (!subscription) {
      // Crea nuova sottoscrizione
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // Gestisci conflitti di dispositivi
    const deviceId = await generateDeviceId();
    await handleDeviceConflict(userId, deviceId);

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
        endpoint: endpoint.substring(0, 50) + '...',
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
      endpoint: subscription?.endpoint?.substring(0, 50) + '...',
    });
    throw new PushSendError('network-error', {
      originalError: error.message,
      userId,
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
          icon: '/icons/icon.svg',
          badge: '/icons/icon.svg',
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
 * Invia notifiche push bulk a più utenti
 */
export async function sendBulkPushNotification(userIds, notificationData) {
  try {
    // Controlla se siamo in mock mode
    if (window.__MOCK_PUSH_MODE__) {
      console.log('🎭 [MOCK] Using mock send bulk notification');
      return await mockSendBulkPushNotification(userIds, notificationData);
    }

    const response = await fetch(`${FUNCTIONS_BASE_URL}/send-bulk-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userIds,
        notification: notificationData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error("Errore nell'invio delle notifiche bulk: " + (errorData.error || response.statusText));
    }

    const result = await response.json();
    console.log('✅ Notifiche push bulk inviate con successo:', result);
    return result;
  } catch (error) {
    console.error("❌ Errore nell'invio delle notifiche push bulk:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Crea una notifica push per una prenotazione
 */
export function createBookingNotification(bookingData) {
  return {
    title: 'Nuova Prenotazione',
    body: `Prenotazione confermata per ${bookingData.courtName} il ${bookingData.date}`,
    icon: '/icons/icon.svg',
    badge: '/icons/icon.svg',
    image: bookingData.courtImage,
    tag: `booking-${bookingData.id}`,
    requireInteraction: true,
    category: 'booking',
    priority: 'high',
    actions: [
      { action: 'view-booking', title: 'Vedi Prenotazione', icon: '/icons/icon.svg' },
      { action: 'open', title: 'Apri App', icon: '/icons/icon.svg' },
    ],
    data: {
      url: `/bookings/${bookingData.id}`,
      type: 'booking-confirmation',
      bookingId: bookingData.id,
      clubId: bookingData.clubId,
      courtName: bookingData.courtName,
      date: bookingData.date,
      time: bookingData.time,
    },
  };
}

/**
 * Crea una notifica push per un match
 */
export function createMatchNotification(matchData) {
  return {
    title: 'Aggiornamento Partita',
    body: `${matchData.team1} vs ${matchData.team2} - ${matchData.status}`,
    icon: '/icons/icon.svg',
    badge: '/icons/icon.svg',
    image: matchData.matchImage,
    tag: `match-${matchData.id}`,
    requireInteraction: matchData.urgent || false,
    category: 'match',
    priority: matchData.urgent ? 'high' : 'normal',
    actions: [
      { action: 'view-match', title: 'Vedi Partita', icon: '/icons/icon.svg' },
      { action: 'open', title: 'Apri App', icon: '/icons/icon.svg' },
    ],
    data: {
      url: `/matches/${matchData.id}`,
      type: 'match-update',
      matchId: matchData.id,
      tournamentId: matchData.tournamentId,
      team1: matchData.team1,
      team2: matchData.team2,
      status: matchData.status,
      urgent: matchData.urgent,
    },
  };
}

/**
 * Crea una notifica push per un certificato
 */
export function createCertificateNotification(certificateData) {
  return {
    title: 'Certificato Disponibile',
    body: `Il certificato di ${certificateData.playerName} è pronto per il download`,
    icon: '/icons/icon.svg',
    badge: '/icons/icon.svg',
    image: certificateData.certificateImage,
    tag: `certificate-${certificateData.playerId}`,
    requireInteraction: true,
    category: 'certificate',
    priority: 'normal',
    actions: [
      { action: 'view-certificate', title: 'Vedi Certificato', icon: '/icons/icon.svg' },
      { action: 'download-certificate', title: 'Scarica PDF', icon: '/icons/icon.svg' },
      { action: 'open', title: 'Apri App', icon: '/icons/icon.svg' },
    ],
    data: {
      url: `/players/${certificateData.playerId}/certificate`,
      type: 'certificate-ready',
      playerId: certificateData.playerId,
      playerName: certificateData.playerName,
      certificateType: certificateData.type,
      issueDate: certificateData.issueDate,
    },
  };
}

/**
 * Crea una notifica push per un torneo
 */
export function createTournamentNotification(tournamentData) {
  return {
    title: 'Aggiornamento Torneo',
    body: `${tournamentData.name}: ${tournamentData.message}`,
    icon: '/icons/icon.svg',
    badge: '/icons/icon.svg',
    image: tournamentData.tournamentImage,
    tag: `tournament-${tournamentData.id}`,
    requireInteraction: tournamentData.important || false,
    category: 'tournament',
    priority: tournamentData.important ? 'high' : 'normal',
    actions: [
      { action: 'view-tournament', title: 'Vedi Torneo', icon: '/icons/icon.svg' },
      { action: 'open', title: 'Apri App', icon: '/icons/icon.svg' },
    ],
    data: {
      url: `/tournaments/${tournamentData.id}`,
      type: 'tournament-update',
      tournamentId: tournamentData.id,
      tournamentName: tournamentData.name,
      message: tournamentData.message,
      important: tournamentData.important,
    },
  };
}

/**
 * Crea una notifica push generale personalizzabile
 */
export function createCustomNotification(options) {
  return {
    title: options.title || 'Notifica',
    body: options.body || 'Hai una nuova notifica',
    icon: options.icon || '/icons/icon.svg',
    badge: options.badge || '/icons/icon.svg',
    image: options.image,
    tag: options.tag || 'custom',
    requireInteraction: options.requireInteraction || false,
    silent: options.silent || false,
    category: options.category || 'general',
    priority: options.priority || 'normal',
    actions: options.actions || [
      { action: 'open', title: 'Apri App', icon: '/icons/icon.svg' },
      { action: 'dismiss', title: 'Ignora' },
    ],
    vibrate: options.vibrate || [200, 100, 200],
    data: {
      url: options.url || '/',
      type: options.type || 'custom',
      ...options.data,
    },
  };
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
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log('🎭 [MOCK] Creating mock subscription...');
    const mockSubscription = {
      endpoint: 'mock://push-endpoint-' + Date.now(),
      toJSON: () => ({
        endpoint: 'mock://push-endpoint-' + Date.now(),
        keys: {
          p256dh: 'mock-p256dh-key-' + Math.random().toString(36).substr(2, 9),
          auth: 'mock-auth-key-' + Math.random().toString(36).substr(2, 9),
        },
      }),
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
    mock: true,
  };

  // Rimuovi subscription esistente per questo user
  const filtered = subscriptions.filter((sub) => sub.userId !== userId);
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
  const userSubscription = subscriptions.find((sub) => sub.userId === userId);

  if (!userSubscription) {
    console.warn('🎭 [MOCK] No subscription found for user');
    return false;
  }

  // Simula delay di rete
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Mostra notifica mock
  const notification = new Notification('Notifica di Test (Mock)', {
    body: 'Questa è una notifica push di test simulata!',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'test-notification',
    data: {
      url: '/',
      timestamp: Date.now(),
      mock: true,
    },
  });

  // Auto-close dopo 5 secondi
  setTimeout(() => {
    notification.close();
  }, 5000);

  console.log('✅ [MOCK] Test notification sent');
  return true;
}

/**
 * Mock send bulk push notification
 */
async function mockSendBulkPushNotification(userIds, notificationData) {
  console.log('🎭 [MOCK] Sending bulk notification to users:', userIds?.length || 'all');

  const subscriptions = JSON.parse(localStorage.getItem('mock-push-subscriptions') || '[]');
  let targetSubscriptions = [];

  if (userIds && userIds.length > 0) {
    targetSubscriptions = subscriptions.filter((sub) => userIds.includes(sub.userId));
  } else {
    targetSubscriptions = subscriptions;
  }

  if (targetSubscriptions.length === 0) {
    console.warn('🎭 [MOCK] No target subscriptions found');
    return { success: false, error: 'No subscriptions found', sent: 0 };
  }

  // Simula delay di rete più lungo per bulk
  await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000));

  let sentCount = 0;
  const uniqueUsers = new Set();

  // Mostra notifiche mock per ogni utente
  for (const sub of targetSubscriptions) {
    uniqueUsers.add(sub.userId);

    const notification = new Notification(
      `${notificationData.title || 'Notifica Bulk (Mock)'} - ${sub.userId}`,
      {
        body: notificationData.body || 'Questa è una notifica push bulk simulata!',
        icon: notificationData.icon || '/icon-192x192.png',
        badge: notificationData.badge || '/badge-72x72.png',
        image: notificationData.image,
        tag: notificationData.tag || 'bulk-notification',
        requireInteraction: notificationData.requireInteraction || false,
        data: {
          ...notificationData.data,
          mock: true,
          userId: sub.userId,
          timestamp: Date.now(),
        },
      }
    );

    // Auto-close dopo 6 secondi per notifiche bulk
    setTimeout(() => {
      notification.close();
    }, 6000);

    sentCount++;
  }

  console.log("✅ [MOCK] Bulk notification sent to " + sentCount + " subscriptions (" + uniqueUsers.size + " users)");
  return {
    success: true,
    sent: sentCount,
    uniqueUsers: uniqueUsers.size,
    mock: true,
    bulkId: "mock-bulk-" + Date.now(),
  };
}

/**
 * MOCK FUNCTIONS - Solo per development quando SW fallisce
 */
