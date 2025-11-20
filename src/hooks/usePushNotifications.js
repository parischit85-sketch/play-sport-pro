// =============================================
// FILE: src/hooks/usePushNotifications.js
// Hook per gestione Push Notifications con salvataggio su Firestore
// =============================================
import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';

export function usePushNotifications() {
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verifica supporto notifiche
    const checkSupport = () => {
      const supported =
        'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Richiedi permesso per le notifiche
  const requestPermission = async () => {
    if (!isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        // console.log('✅ Push notification permission granted');
        await subscribeToPush();
        return true;
      } else {
        // console.log('❌ Push notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Push notification permission request failed:', error);
      return false;
    }
  };

  // Sottoscrivi alle push notifications
  const subscribeToPush = async () => {
    // console.log('🔔 [subscribeToPush] Starting...', { isSupported, permission });

    if (!isSupported || permission !== 'granted') {
      console.warn('⚠️ [subscribeToPush] Cannot subscribe:', { isSupported, permission });
      return null;
    }

    try {
      // console.log('🔔 [subscribeToPush] Getting service worker registration...');
      const registration = await navigator.serviceWorker.ready;
      // console.log('✅ [subscribeToPush] Service worker ready');

      // Verifica se esiste già una subscription
      let sub = await registration.pushManager.getSubscription();
      // console.log('🔍 [subscribeToPush] Existing subscription:', sub ? 'FOUND' : 'NOT FOUND');

      if (!sub) {
        // Crea nuova subscription
        // console.log('🔔 [subscribeToPush] Creating new subscription...');
        const vapidPublicKey = getVapidPublicKey();

        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        // console.log('✅ [subscribeToPush] Push subscription created');
      }

      // 🔧 FIX: Aggiorna stato solo se subscription è cambiata (evita loop)
      setSubscription((prev) => {
        if (!prev || prev.endpoint !== sub.endpoint) {
          return sub;
        }
        return prev; // Mantieni riferimento precedente per evitare re-render
      });

      // Invia subscription al server (con debounce: salva solo se necessario)
      await sendSubscriptionToServer(sub);

      return sub;
    } catch (error) {
      console.error('❌ [subscribeToPush] Failed:', error);
      return null;
    }
  };

  // Disattiva le notifiche
  const unsubscribe = async () => {
    if (!subscription) return true;

    try {
      const success = await subscription.unsubscribe();
      if (success) {
        setSubscription(null);
        // console.log('✅ Push subscription cancelled');

        // Rimuovi subscription dal server
        await removeSubscriptionFromServer(subscription);
      }
      return success;
    } catch (error) {
      console.error('Push unsubscribe failed:', error);
      return false;
    }
  };

  // Invia notifica di test locale
  const sendTestNotification = async () => {
    // console.log('🧪 [TEST NOTIFICATION] Function called');
    // console.log('🧪 [TEST] Current permission:', permission);
    // console.log('🧪 [TEST] isSupported:', isSupported);

    if (permission !== 'granted') {
      // console.log('🧪 [TEST] Permission not granted, requesting...');
      await requestPermission();
    }

    if (permission === 'granted') {
      try {
        // console.log('🧪 [TEST] Creating browser Notification...');
        // console.log('🧪 [TEST] ⚠️ THIS BYPASSES FIRESTORE & CLOUD FUNCTION!');
        // console.log('🧪 [TEST] This is just a local browser notification');

        new Notification('🎾 Play-sport.pro Test', {
          body: 'Le notifiche funzionano perfettamente!',
          icon: '/icons/icon.svg',
          badge: '/icons/icon.svg',
          tag: 'test-notification',
          vibrate: [200, 100, 200],
          data: { url: '/dashboard', timestamp: Date.now() },
        });

        // console.log('✅ [TEST] Test notification sent successfully');
        // console.log('🧪 [TEST] NO Cloud Function was called');
        // console.log('🧪 [TEST] NO Firestore query was executed');
        return true;
      } catch (error) {
        console.error('❌ [TEST] Test notification failed:', error);
        return false;
      }
    }
    console.warn('⚠️ [TEST] Permission still not granted');
    return false;
  };

  return {
    permission,
    subscription,
    isSupported,
    requestPermission,
    subscribeToPush, // Export per AutoPushSubscription
    unsubscribe,
    sendTestNotification,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    isPending: permission === 'default',
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Helper: Genera deviceId univoco persistente
function generateDeviceId() {
  let deviceId = localStorage.getItem('pushDeviceId');
  if (!deviceId) {
    // Genera ID basato su timestamp + random
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('pushDeviceId', deviceId);
  }
  return deviceId;
}

// Helper: Converti ArrayBuffer in base64
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// VAPID Public Key (caricata da environment o config)
function getVapidPublicKey() {
  // Chiave VAPID reale per play-sport.pro
  return 'BP-Pp9JUfDtmi-pYIHpHPtcbWT_g9_rVHk-SIolLwO4sRIP8bzg7FSi_EAa_tgK4FNXop1ecL8Mt8dMZsA8bg_g';
}

// Converti VAPID key in Uint8Array
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

// Invia subscription al server (implementazione completa con Netlify Function)
async function sendSubscriptionToServer(subscription) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error('❌ User not authenticated - cannot save push subscription');
    return false;
  }

  // 🔧 FIX: Debounce - non salvare se già fatto di recente (< 5 secondi fa)
  const cacheKey = `psp:push-sub-saved:${user.uid}:${subscription.endpoint.slice(-20)}`;
  const lastSaved = localStorage.getItem(cacheKey);
  const now = Date.now();

  if (lastSaved && now - parseInt(lastSaved, 10) < 5000) {
    // console.log('⏭️ [sendSubscriptionToServer] Skipping - already saved recently');
    return true; // Skip - già salvato di recente
  }

  try {
    // IMPORTANT: Il backend (sendBulkNotifications.clean.js) usa SEMPRE il campo `firebaseUid`
    // per recuperare le sottoscrizioni: .where('firebaseUid','==', firebaseUid)
    // La vecchia implementazione salvava solo `userId`, causando mancato match e mancato invio.
    // Aggiungiamo quindi il campo `firebaseUid` (alias di userId) mantenendo anche `userId`
    // per retro‑compatibilità con eventuali funzioni Netlify più vecchie.
    const subscriptionData = {
      userId: user.uid, // legacy field
      firebaseUid: user.uid, // nuovo field richiesto dal backend push
      type: 'web', // Identifica come web push (non native mobile)
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: arrayBufferToBase64(subscription.getKey('auth')),
      },
      userAgent: navigator.userAgent,
      deviceId: generateDeviceId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(), // Track last update per cleanup duplicates
      expirationTime: subscription.expirationTime,
      // Uniformiamo lo schema ai documenti letti dal backend che considerano `active` o `isActive`
      active: true,
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 giorni (era 7)
      lastUsedAt: null,
    };

    // console.log('📤 Sending subscription to server...', {
    //   userId: user.uid,
    //   endpoint: subscription.endpoint.substring(0, 50) + '...',
    //   deviceId: subscriptionData.deviceId,
    // });

    // In produzione usa Netlify Function, in sviluppo salva direttamente su Firestore
    const isDevelopment =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isDevelopment) {
      // console.log('🔧 [DEV MODE] Saving directly to Firestore...');
      const { getFirestore, doc, setDoc } = await import('firebase/firestore');
      const db = getFirestore();

      // Verifica se esiste già una subscription per questo endpoint
      // IMPORTANTE: Usiamo endpoint come chiave unica (SHA-256 hash per ID documento)
      const endpointHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(subscription.endpoint)
      );
      const docId = Array.from(new Uint8Array(endpointHash))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      // Salva/aggiorna con docId deterministico basato su endpoint
      const docRef = doc(db, 'pushSubscriptions', docId);
      await setDoc(
        docRef,
        {
          ...subscriptionData,
          subscription: {
            endpoint: subscription.endpoint,
            keys: subscription.toJSON()?.keys || {
              p256dh: subscriptionData.keys.p256dh,
              auth: subscriptionData.keys.auth,
            },
          },
          updatedAt: new Date().toISOString(),
          schemaVersion: 2,
        },
        { merge: true }
      ); // 🔧 MERGE: aggiorna campi esistenti senza sovrascrivere tutto
      console.log(
        '✅ [DEV] Push subscription saved/updated with ID:',
        docId.substring(0, 16) + '...'
      );

      // Salva timestamp per debounce
      localStorage.setItem(cacheKey, now.toString());

      return true;
    } else {
      // Produzione: usa Netlify Function
      // console.log('🔗 Calling Netlify Function: /.netlify/functions/save-push-subscription');
      const response = await fetch('/.netlify/functions/save-push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...subscriptionData,
          // Include anche la subscription completa per compatibilità Netlify function
          subscription: subscription.toJSON(),
          schemaVersion: 2,
        }),
      });

      // console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Netlify Function error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      await response.json();
      // console.log('✅ Subscription saved successfully:', result);
      // console.log('🔍 Check Firestore → pushSubscriptions collection for userId:', user.uid);

      // Salva timestamp per debounce
      localStorage.setItem(cacheKey, now.toString());
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to save subscription to server:', error);
    return false;
  }
}

// Rimuovi subscription dal server (implementazione completa)
async function removeSubscriptionFromServer(subscription) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.warn('⚠️ User not authenticated - skipping subscription removal');
    return true; // Non è un errore critico
  }

  try {
    const deviceId = generateDeviceId();

    // console.log('🗑️ Removing subscription from server...', {
    //   userId: user.uid,
    //   endpoint: subscription.endpoint.substring(0, 50) + '...',
    //   deviceId,
    // });

    // Chiama Netlify Function per rimuovere da Firestore
    const response = await fetch('/.netlify/functions/remove-push-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.uid,
        endpoint: subscription.endpoint,
        deviceId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    await response.json();
    // console.log('✅ Subscription removed successfully:', result);

    return true;
  } catch (error) {
    console.error('❌ Failed to remove subscription from server:', error);
    return false;
  }
}

// ============================================
// NOTIFICATION TEMPLATES
// ============================================

export const NotificationTemplates = {
  booking: {
    title: '🎾 Prenotazione Confermata',
    body: 'Il tuo campo è prenotato! Controlla i dettagli.',
    tag: 'booking-confirmed',
    requireInteraction: true,
    data: { url: '/booking' },
  },

  reminder: {
    title: '⏰ Promemoria Partita',
    body: 'La tua partita inizia tra 30 minuti!',
    tag: 'match-reminder',
    requireInteraction: true,
    vibrate: [300, 200, 300],
    data: { url: '/matches' },
  },

  tournament: {
    title: '🏆 Torneo Aggiornato',
    body: 'Nuovi risultati disponibili nel torneo.',
    tag: 'tournament-update',
    data: { url: '/tournaments' },
  },

  ranking: {
    title: '📈 Classifica Aggiornata',
    body: 'La classifica è stata aggiornata!',
    tag: 'ranking-update',
    data: { url: '/classifica' },
  },
};
