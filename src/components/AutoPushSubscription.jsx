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

  // 🔧 FIX: Salviamo le funzioni in ref per evitare loop (non sono memoizzate)
  const subscribeToPushRef = useRef(subscribeToPush);
  const requestPermissionRef = useRef(requestPermission);

  // Aggiorna i ref quando cambiano le funzioni
  useEffect(() => {
    subscribeToPushRef.current = subscribeToPush;
    requestPermissionRef.current = requestPermission;
  });

  // Cleanup di timeout quando il componente si smonta
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // 🔄 AUTO-REFRESH: Ri-subscribe ogni 7 giorni per mantenere subscription aggiornata
  useEffect(() => {
    if (!user || !subscription || !isSupported) return;

    const REFRESH_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 giorni
    const refreshTimer = setInterval(async () => {
      console.log('🔄 [AutoPush] Refreshing subscription (7-day auto-renewal)...');
      try {
        await subscribeToPushRef.current();
        console.log('✅ [AutoPush] Subscription refreshed successfully');
      } catch (error) {
        console.error('❌ [AutoPush] Failed to refresh subscription:', error);
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(refreshTimer);
  }, [user, subscription, isSupported]);

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
            const result = await subscribeToPushRef.current();
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
          // AUMENTATO a 8s per permettere a AutoLocationPermission di chiedere prima (Contatti -> Posizione -> Notifiche)
          const initialDelay = attempt === 1 ? 8000 : 2000;

          retryTimeoutRef.current = setTimeout(async () => {
            try {
              // console.log(`🔔 [AutoPush] Attempt ${attempt}/${MAX_RETRIES} - Requesting permission...`);
              const success = await requestPermissionRef.current();

              if (success) {
                hasAttemptedRef.current = true;
                return; // Success
              } else {
                // Se fallisce (permesso negato O errore sottoscrizione), controlla se dobbiamo riprovare
                // Se il permesso è negato esplicitamente, non riprovare
                if (permission === 'denied') {
                   hasAttemptedRef.current = true;
                   return;
                }
                
                // Se il permesso è granted ma la sottoscrizione è fallita (success=false), riprova
                throw new Error('Permission granted but subscription failed');
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
  }, [user, permission, isSupported, subscription]);

  // Questo componente non renderizza nulla
  return null;
}
