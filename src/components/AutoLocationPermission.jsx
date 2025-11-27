import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { PushNotifications } from '@capacitor/push-notifications';
import { Contacts } from '@capacitor-community/contacts';
import { useAuth } from '../contexts/AuthContext';

const AutoLocationPermission = () => {
  const { user } = useAuth();
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    const requestPermissions = async () => {
      // Esegui solo su piattaforme native e solo se l'utente è loggato
      if (!Capacitor.isNativePlatform() || !user) return;
      
      // Evita richieste multiple nella stessa sessione
      if (hasRequestedRef.current) return;
      hasRequestedRef.current = true;

      console.log('[Permissions] Starting post-login permission sequence...');

      try {
        // 1. Richiedi permessi Contatti
        try {
          const contactsStatus = await Contacts.checkPermissions();
          if (contactsStatus.contacts !== 'granted') {
            console.log('[Permissions] Requesting Contacts permission...');
            await Contacts.requestPermissions();
          }
        } catch (e) {
          console.warn('[Permissions] Contacts permission error:', e);
        }

        // 2. Richiedi permessi Posizione
        try {
          const locationStatus = await Geolocation.checkPermissions();
          if (locationStatus.location !== 'granted') {
            console.log('[Permissions] Requesting Location permission...');
            await Geolocation.requestPermissions();
          }
        } catch (e) {
          console.warn('[Permissions] Location permission error:', e);
        }

        // 3. Richiedi permessi Notifiche
        try {
          const pushStatus = await PushNotifications.checkPermissions();
          if (pushStatus.receive !== 'granted') {
            console.log('[Permissions] Requesting Push permission...');
            await PushNotifications.requestPermissions();
          }
        } catch (e) {
          console.warn('[Permissions] Push permission error:', e);
        }

      } catch (error) {
        console.error('[Permissions] General error in permission sequence:', error);
      }
    };

    if (user) {
      // Piccolo delay per non sovrapporsi all'animazione di login
      const timer = setTimeout(() => {
        requestPermissions();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  return null; // Componente invisibile
};

export default AutoLocationPermission;
