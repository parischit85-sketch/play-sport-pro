// =============================================
// FILE: src/hooks/usePushNotifications.js
// =============================================
import { useState, useEffect } from 'react';

export function usePushNotifications() {
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verifica supporto notifiche
    const checkSupport = () => {
      const supported = 'Notification' in window && 
                       'serviceWorker' in navigator && 
                       'PushManager' in window;
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
        console.log('✅ Push notification permission granted');
        await subscribeToPush();
        return true;
      } else {
        console.log('❌ Push notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Push notification permission request failed:', error);
      return false;
    }
  };

  // Sottoscrivi alle push notifications
  const subscribeToPush = async () => {
    if (!isSupported || permission !== 'granted') {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Verifica se esiste già una subscription
      let sub = await registration.pushManager.getSubscription();
      
      if (!sub) {
        // Crea nuova subscription
        const vapidPublicKey = getVapidPublicKey();
        
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
        
        console.log('✅ Push subscription created');
      }
      
      setSubscription(sub);
      
      // Invia subscription al server (da implementare)
      await sendSubscriptionToServer(sub);
      
      return sub;
    } catch (error) {
      console.error('Push subscription failed:', error);
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
        console.log('✅ Push subscription cancelled');
        
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
    if (permission !== 'granted') {
      await requestPermission();
    }

    if (permission === 'granted') {
      try {
        new Notification('🎾 Paris League Test', {
          body: 'Le notifiche funzionano perfettamente!',
          icon: '/icons/icon.svg',
          badge: '/icons/icon.svg',
          tag: 'test-notification',
          vibrate: [200, 100, 200],
          data: { url: '/dashboard', timestamp: Date.now() }
        });
        
        console.log('✅ Test notification sent');
        return true;
      } catch (error) {
        console.error('Test notification failed:', error);
        return false;
      }
    }
    return false;
  };

  return {
    permission,
    subscription,
    isSupported,
    requestPermission,
    unsubscribe,
    sendTestNotification,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    isPending: permission === 'default'
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// VAPID Public Key (sostituire con la propria)
function getVapidPublicKey() {
  // Questo è un esempio - in produzione usare la propria chiave VAPID
  return 'BJKFJTNIbRK6ZOCmNsIGQVVx3fOSw5y8PnPH2yPn4eXe8a4E1YPJ5nBKJFJTNIbRK6ZOCmNsIGQVVx3fOSw5y8PnPH2yPn4eXe8a4E1YPJ5nBK';
}

// Converti VAPID key in Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Invia subscription al server (da implementare)
async function sendSubscriptionToServer(subscription) {
  try {
    // TODO: Implementare API call al backend
    console.log('📤 Sending subscription to server:', {
      endpoint: subscription.endpoint,
      keys: {
        auth: subscription.getKey ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')))) : null,
        p256dh: subscription.getKey ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))) : null
      }
    });
    
    // Esempio API call:
    // await fetch('/api/push/subscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     endpoint: subscription.endpoint,
    //     keys: {
    //       auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')))),
    //       p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh'))))
    //     }
    //   })
    // });
    
    return true;
  } catch (error) {
    console.error('Failed to send subscription to server:', error);
    return false;
  }
}

// Rimuovi subscription dal server
async function removeSubscriptionFromServer(subscription) {
  try {
    // TODO: Implementare API call per rimozione
    console.log('🗑️ Removing subscription from server');
    
    // Esempio API call:
    // await fetch('/api/push/unsubscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ endpoint: subscription.endpoint })
    // });
    
    return true;
  } catch (error) {
    console.error('Failed to remove subscription from server:', error);
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
    data: { url: '/booking' }
  },
  
  reminder: {
    title: '⏰ Promemoria Partita',
    body: 'La tua partita inizia tra 30 minuti!',
    tag: 'match-reminder',
    requireInteraction: true,
    vibrate: [300, 200, 300],
    data: { url: '/matches' }
  },
  
  tournament: {
    title: '🏆 Torneo Aggiornato',
    body: 'Nuovi risultati disponibili nel torneo.',
    tag: 'tournament-update',
    data: { url: '/tournaments' }
  },
  
  ranking: {
    title: '📈 Classifica Aggiornata',
    body: 'La classifica è stata aggiornata!',
    tag: 'ranking-update',
    data: { url: '/classifica' }
  }
};
