// =============================================
// FILE: src/components/AutoPushSubscription.jsx
// Componente che registra automaticamente gli utenti alle push notifications
// =============================================
import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePushNotifications } from '../hooks/usePushNotifications';

export function AutoPushSubscription() {
  const { user } = useAuth();
  const { permission, requestPermission, subscribeToPush, isSupported, subscription } =
    usePushNotifications();
  const hasAttemptedRef = useRef(false);
  const subscriptionIdRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Cleanup di timeout quando il componente si smonta
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Non fare nulla se:
    // - Non è supportato
    // - Utente non loggato
    // - Già tentato in questa sessione E già subscribed
    // - Permesso già negato esplicitamente
    if (
      !isSupported ||
      !user ||
      (hasAttemptedRef.current && subscription) ||
      permission === 'denied'
    ) {
      return;
    }

    // Se abbiamo già una subscription attiva con lo stesso endpoint, skip
    if (subscription && subscriptionIdRef.current === subscription.endpoint) {
      // console.log('🔔 [AutoPush] Already subscribed with same endpoint, skipping');
      return;
    }

    // Retry logic con exponential backoff: [2s, 5s, 10s]
    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [2000, 5000, 10000];

    const registerPushSubscription = async (attempt = 1) => {
      try {
        // console.log(`🔔 [AutoPush] Attempt ${attempt}/${MAX_RETRIES} - Checking push notification status...`);

        // Se il permesso è già granted, sottoscrivi direttamente
        if (permission === 'granted') {
          try {
            const result = await subscribeToPush();
            hasAttemptedRef.current = true;
            if (result?.endpoint) {
              subscriptionIdRef.current = result.endpoint;
            }
            return; // Success - exit retry loop
          } catch (error) {
            console.error(`❌ [AutoPush] Attempt ${attempt} - Subscribe failed:`, error);

            // Retry logic
            if (attempt < MAX_RETRIES) {
              const delay = RETRY_DELAYS[attempt - 1] || 10000;
              // console.log(`⏳ [AutoPush] Retrying in ${delay}ms...`);

              retryTimeoutRef.current = setTimeout(() => {
                registerPushSubscription(attempt + 1);
              }, delay);
            } else {
              console.error('❌ [AutoPush] Max retries exceeded for subscription');
              hasAttemptedRef.current = true;
              localStorage.setItem('push-registration-failed-at', new Date().toISOString());
            }
            return;
          }
        }

        // Se è default, chiedi il permesso dopo un delay (non invasivo)
        if (permission === 'default') {
          // console.log(`🔔 [AutoPush] Attempt ${attempt}/${MAX_RETRIES} - Will request permission after delay...`);

          // Aspetta prima di chiedere (più lungo al primo tentativo)
          const initialDelay = attempt === 1 ? 3000 : 2000;

          retryTimeoutRef.current = setTimeout(async () => {
            try {
              // console.log(`🔔 [AutoPush] Attempt ${attempt}/${MAX_RETRIES} - Requesting permission...`);
              const granted = await requestPermission();

              if (granted) {
                hasAttemptedRef.current = true;
                return; // Success
              } else {
                // console.log('ℹ️ [AutoPush] User denied push permission');
                hasAttemptedRef.current = true;
                return; // User explicitly denied - don't retry
              }
            } catch (error) {
              console.error(`❌ [AutoPush] Attempt ${attempt} - Permission request failed:`, error);

              // Retry logic
              if (attempt < MAX_RETRIES) {
                const delay = RETRY_DELAYS[attempt - 1] || 10000;
                // console.log(`⏳ [AutoPush] Retrying in ${delay}ms...`);

                retryTimeoutRef.current = setTimeout(() => {
                  registerPushSubscription(attempt + 1);
                }, delay);
              } else {
                console.error('❌ [AutoPush] Max retries exceeded for permission request');
                hasAttemptedRef.current = true;
                localStorage.setItem('push-registration-failed-at', new Date().toISOString());
              }
            }
          }, initialDelay);
        }
      } catch (error) {
        console.error(`❌ [AutoPush] Registration error (attempt ${attempt}):`, error);
        hasAttemptedRef.current = true;
      }
    };

    // Avvia il primo tentativo
    registerPushSubscription();
  }, [user, permission, isSupported, requestPermission, subscribeToPush, subscription]);

  // Questo componente non renderizza nulla
  return null;
}
