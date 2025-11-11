import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { unifiedPushService } from '@/services/unifiedPushService';

export const useNativeFeatures = () => {
  const [location, setLocation] = useState(null);
  const [isNative] = useState(Capacitor.isNativePlatform());
  const [pushSubscribed, setPushSubscribed] = useState(false);
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
      } catch {
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

  // Push Notifications Setup - REFACTORED con UnifiedPushService
  const setupPushNotifications = async (userId) => {
    if (!userId) {
      console.warn('[useNativeFeatures] setupPushNotifications called without userId');
      return;
    }

    try {
      const subscribed = await unifiedPushService.isSubscribed(userId);
      setPushSubscribed(subscribed);

      if (!subscribed) {
        console.log('[useNativeFeatures] User not subscribed, requesting permissions...');
        const hasPermission = await unifiedPushService.requestPermissions();

        if (hasPermission) {
          const result = await unifiedPushService.subscribe(userId);
          console.log('[useNativeFeatures] Push subscription successful:', result);
          setPushSubscribed(true);
          return result;
        } else {
          console.warn('[useNativeFeatures] Push permissions denied');
          setPushSubscribed(false);
          return null;
        }
      }
    } catch (error) {
      console.error('[useNativeFeatures] Push notification setup error:', error);
      setPushSubscribed(false);
    }
  };

  // Unsubscribe from push notifications
  const unsubscribeFromPush = async (userId) => {
    if (!userId) return;

    try {
      await unifiedPushService.unsubscribe(userId);
      setPushSubscribed(false);
      console.log('[useNativeFeatures] Unsubscribed from push notifications');
    } catch (error) {
      console.error('[useNativeFeatures] Unsubscribe error:', error);
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
    // Non chiamare più automaticamente setupPushNotifications
    // Deve essere chiamato dal componente con userId
  }, [isNative]);

  return {
    location,
    isNative,
    pushSubscribed,
    getCurrentLocation,
    setupPushNotifications,
    unsubscribeFromPush,
    scheduleLocalNotification,
    shareContent,
  };
};
