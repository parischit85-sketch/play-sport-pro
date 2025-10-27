/* eslint-disable import/no-unresolved */
import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';

export const useNativeFeatures = () => {
  const [location, setLocation] = useState(null);
  const [isNative] = useState(Capacitor.isNativePlatform());
  // Lazy refs for Capacitor plugins to avoid unresolved imports in web context
  const pluginsRef = useRef({
    Geolocation: null,
    PushNotifications: null,
    LocalNotifications: null,
    Share: null,
  });

  // Lazy-load plugins only on native
  useEffect(() => {
    if (!isNative) return;
    (async () => {
      try {
        const [{ Geolocation }, { PushNotifications }, { LocalNotifications }, { Share }] =
          await Promise.all([
            import('@capacitor/geolocation'),
            import('@capacitor/push-notifications'),
            import('@capacitor/local-notifications'),
            import('@capacitor/share'),
          ]);
        pluginsRef.current = {
          Geolocation,
          PushNotifications,
          LocalNotifications,
          Share,
        };
      } catch (e) {
        // Silently ignore if plugins are not available in current runtime
        pluginsRef.current = {
          Geolocation: null,
          PushNotifications: null,
          LocalNotifications: null,
          Share: null,
        };
      }
    })();
  }, [isNative]);

  // GPS Location
  const getCurrentLocation = async () => {
    if (!isNative) {
      // Fallback per web
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => console.error('GPS Error:', error)
        );
      }
      return;
    }

    try {
      const { Geolocation } = pluginsRef.current;
      if (!Geolocation) return;
      const coordinates = await Geolocation.getCurrentPosition();
      setLocation({
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
      });
    } catch (error) {
      console.error('Native GPS Error:', error);
    }
  };

  // Push Notifications Setup
  const setupPushNotifications = async () => {
    if (!isNative) return;

    try {
      const { PushNotifications } = pluginsRef.current;
      if (!PushNotifications) return;
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive === 'granted') {
        await PushNotifications.register();

        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token: ' + token.value);
          // Salva il token per invii futuri
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error('Error on registration: ' + JSON.stringify(error));
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received: ' + JSON.stringify(notification));
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push action performed: ' + JSON.stringify(notification));
        });
      }
    } catch (error) {
      console.error('Push notification setup error:', error);
    }
  };

  // Local Notifications
  const scheduleLocalNotification = async (title, body, scheduleAt) => {
    if (!isNative) {
      // Fallback per web
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      }
      return;
    }

    try {
      const { LocalNotifications } = pluginsRef.current;
      if (!LocalNotifications) return;
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Math.floor(Math.random() * 1000),
            schedule: { at: new Date(scheduleAt) },
            sound: null,
            attachments: null,
            actionTypeId: '',
            extra: null,
          },
        ],
      });
    } catch (error) {
      console.error('Local notification error:', error);
    }
  };

  // Native Share
  const shareContent = async (title, text, url) => {
    if (!isNative) {
      // Fallback per Web Share API
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        alert('Link copiato negli appunti!');
      }
      return;
    }

    try {
      const { Share } = pluginsRef.current;
      if (!Share) return;
      await Share.share({ title, text, url });
    } catch (error) {
      console.error('Native share error:', error);
    }
  };

  useEffect(() => {
    if (isNative) {
      setupPushNotifications();
    }
  }, [isNative]);

  return {
    location,
    isNative,
    getCurrentLocation,
    scheduleLocalNotification,
    shareContent,
  };
};
