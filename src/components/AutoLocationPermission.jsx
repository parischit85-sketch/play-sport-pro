import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { PushNotifications } from '@capacitor/push-notifications';
import { Contacts } from '@capacitor-community/contacts';

const AutoLocationPermission = () => {
  useEffect(() => {
    const requestPermissions = async () => {
      if (!Capacitor.isNativePlatform()) return;

      try {
        // 1. Richiedi permessi Posizione
        const locationStatus = await Geolocation.checkPermissions();
        if (locationStatus.location !== 'granted') {
          await Geolocation.requestPermissions();
        }

        // 2. Richiedi permessi Notifiche
        const pushStatus = await PushNotifications.checkPermissions();
        if (pushStatus.receive !== 'granted') {
          await PushNotifications.requestPermissions();
        }

        // 3. Richiedi permessi Contatti
        const contactsStatus = await Contacts.checkPermissions();
        if (contactsStatus.contacts !== 'granted') {
            await Contacts.requestPermissions();
        }

      } catch (error) {
        console.error('Errore nella richiesta dei permessi:', error);
      }
    };

    requestPermissions();
  }, []);

  return null; // Componente invisibile
};

export default AutoLocationPermission;
