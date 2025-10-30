// =============================================
// FILE: src/hooks/usePermissions.js
// Gestione centralizzata dei permessi PWA
// =============================================
import { useState, useEffect, useCallback, useRef } from 'react';

export function usePermissions() {
  const [permissions, setPermissions] = useState({
    notifications: 'default',
    geolocation: 'default',
    contacts: 'default',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Ref to track if geolocation event listener has been added
  const geoListenerAdded = useRef(false);

  // Rileva le capacità del dispositivo
  const capabilities = {
    hasNotifications: 'Notification' in window && 'serviceWorker' in navigator,
    hasGeolocation: 'geolocation' in navigator,
    hasContacts: 'contacts' in navigator && 'ContactsManager' in window,
    hasPushManager: 'PushManager' in window,
  };

  // Controlla lo stato attuale dei permessi
  const checkPermissions = useCallback(async () => {
    const newPermissions = {
      notifications: 'default',
      geolocation: 'default',
      contacts: 'default',
    };

    // Notifiche
    if (capabilities.hasNotifications) {
      newPermissions.notifications = Notification.permission;
    }

    // Geolocalizzazione
    if (capabilities.hasGeolocation && navigator.permissions && !geoListenerAdded.current) {
      try {
        const geoPermission = await navigator.permissions.query({ name: 'geolocation' });
        newPermissions.geolocation = geoPermission.state;

        // Ascolta cambiamenti - solo una volta
        geoPermission.addEventListener('change', () => {
          setPermissions((prev) => ({
            ...prev,
            geolocation: geoPermission.state,
          }));
        });
        geoListenerAdded.current = true;
      } catch (error) {
        console.warn('⚠️ Unable to query geolocation permission:', error);
      }
    }

    setPermissions(newPermissions);
  }, [capabilities.hasGeolocation, capabilities.hasNotifications]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  // Richiedi permesso notifiche
  const requestNotificationPermission = async () => {
    if (!capabilities.hasNotifications) {
      setErrors((prev) => ({
        ...prev,
        notifications: 'Le notifiche non sono supportate su questo dispositivo',
      }));
      return false;
    }

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, notifications: null }));

    try {
      const permission = await Notification.requestPermission();
      setPermissions((prev) => ({ ...prev, notifications: permission }));

      if (permission === 'granted') {
        console.log('✅ Notification permission granted');

        // Registra il service worker per le push notifications se supportato
        if (capabilities.hasPushManager && 'serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          console.log('✅ Service Worker ready for push notifications', registration);
        }

        return true;
      } else {
        setErrors((prev) => ({
          ...prev,
          notifications: 'Permesso notifiche negato',
        }));
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      setErrors((prev) => ({
        ...prev,
        notifications: 'Errore nella richiesta del permesso',
      }));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Richiedi permesso geolocalizzazione
  const requestGeolocationPermission = () => {
    if (!capabilities.hasGeolocation) {
      setErrors((prev) => ({
        ...prev,
        geolocation: 'La geolocalizzazione non è supportata su questo dispositivo',
      }));
      return Promise.resolve(false);
    }

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, geolocation: null }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ Geolocation permission granted', position);
          setPermissions((prev) => ({ ...prev, geolocation: 'granted' }));
          setIsLoading(false);
          resolve(true);
        },
        (error) => {
          console.error('❌ Geolocation permission denied:', error);
          setPermissions((prev) => ({ ...prev, geolocation: 'denied' }));
          setErrors((prev) => ({
            ...prev,
            geolocation:
              error.code === 1
                ? 'Permesso geolocalizzazione negato'
                : 'Errore nella geolocalizzazione',
          }));
          setIsLoading(false);
          resolve(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // Richiedi permesso contatti (Contact Picker API)
  const requestContactsPermission = async () => {
    if (!capabilities.hasContacts) {
      setErrors((prev) => ({
        ...prev,
        contacts:
          "L'API Contatti non è supportata su questo dispositivo. Disponibile solo su Android Chrome 80+",
      }));
      return false;
    }

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, contacts: null }));

    try {
      // Verifica le proprietà supportate
      const supported = await navigator.contacts.getProperties();
      console.log('📞 Supported contact properties:', supported);

      // Tenta di selezionare un contatto (questo richiede interazione utente)
      const contacts = await navigator.contacts.select(['name', 'tel', 'email'], {
        multiple: false,
      });

      if (contacts && contacts.length > 0) {
        console.log('✅ Contacts permission granted', contacts);
        setPermissions((prev) => ({ ...prev, contacts: 'granted' }));
        setIsLoading(false);
        return true;
      } else {
        setPermissions((prev) => ({ ...prev, contacts: 'denied' }));
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('❌ Contacts permission error:', error);
      setPermissions((prev) => ({ ...prev, contacts: 'denied' }));
      setErrors((prev) => ({
        ...prev,
        contacts: error.name === 'AbortError' ? 'Selezione contatti annullata' : error.message,
      }));
      setIsLoading(false);
      return false;
    }
  };

  // Richiedi tutti i permessi insieme
  const requestAllPermissions = async () => {
    setIsLoading(true);

    const results = {
      notifications: false,
      geolocation: false,
      contacts: false,
    };

    // Richiedi notifiche
    if (capabilities.hasNotifications && permissions.notifications !== 'granted') {
      results.notifications = await requestNotificationPermission();
    } else if (permissions.notifications === 'granted') {
      results.notifications = true;
    }

    // Richiedi geolocalizzazione
    if (capabilities.hasGeolocation && permissions.geolocation !== 'granted') {
      results.geolocation = await requestGeolocationPermission();
    } else if (permissions.geolocation === 'granted') {
      results.geolocation = true;
    }

    // NON richiediamo i contatti automaticamente perché richiede un'azione esplicita dell'utente
    // e serve solo quando l'utente vuole condividere/invitare amici
    // results.contacts = await requestContactsPermission();

    setIsLoading(false);
    return results;
  };

  // Ottieni la posizione corrente
  const getCurrentPosition = () => {
    if (!capabilities.hasGeolocation) {
      return Promise.reject(new Error('Geolocation not supported'));
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minuti
      });
    });
  };

  // Invia una notifica di test
  const sendTestNotification = async (
    title = 'Test Notifica',
    body = 'Questa è una notifica di test'
  ) => {
    if (permissions.notifications !== 'granted') {
      console.warn('⚠️ Notification permission not granted');
      return false;
    }

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/favicon.png',
          vibrate: [200, 100, 200],
          tag: 'test-notification',
          requireInteraction: false,
        });
      } else {
        // Fallback per browser senza service worker
        new Notification(title, {
          body,
          icon: '/icons/icon-192x192.png',
        });
      }
      console.log('✅ Test notification sent');
      return true;
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      return false;
    }
  };

  // Seleziona contatti (richiede interazione utente)
  const pickContacts = async (options = {}) => {
    if (!capabilities.hasContacts) {
      throw new Error('Contacts API not supported');
    }

    try {
      const contacts = await navigator.contacts.select(
        options.properties || ['name', 'tel', 'email'],
        {
          multiple: options.multiple !== false,
        }
      );
      return contacts;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('ℹ️ Contact selection cancelled');
        return [];
      }
      throw error;
    }
  };

  // Controlla se tutti i permessi essenziali sono concessi
  const hasAllEssentialPermissions = () => {
    return permissions.notifications === 'granted' && permissions.geolocation === 'granted';
  };

  // Controlla se almeno un permesso è stato negato
  const hasDeniedPermissions = () => {
    return (
      permissions.notifications === 'denied' ||
      permissions.geolocation === 'denied' ||
      permissions.contacts === 'denied'
    );
  };

  return {
    permissions,
    capabilities,
    isLoading,
    errors,
    requestNotificationPermission,
    requestGeolocationPermission,
    requestContactsPermission,
    requestAllPermissions,
    getCurrentPosition,
    sendTestNotification,
    pickContacts,
    hasAllEssentialPermissions,
    hasDeniedPermissions,
    checkPermissions,
  };
}
