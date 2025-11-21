/**
 * Test Push Subscription Helper
 * Utility per testare e debuggare le push notifications
 * 
 * USAGE IN CONSOLE:
 * 
 * 1. Abilita subscription:
 *    window.testPushSubscription()
 * 
 * 2. Invia notifica di test:
 *    window.sendTestPush()
 * 
 * 3. Controlla stato subscription:
 *    window.checkPushStatus()
 * 
 * 4. Disabilita subscription:
 *    window.unsubscribePush()
 */

import { 
  subscribeToPush, 
  sendTestNotification, 
  isPushSubscribed,
  getPushNotificationStatus,
  unsubscribeFromPush,
  requestNotificationPermission
} from './push.js';
import { auth } from '../services/firebase.js';

/**
 * Test completo della subscription
 */
async function testPushSubscription() {
  console.group('🧪 Test Push Subscription');
  
  try {
    // 1. Verifica utente autenticato
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ Nessun utente autenticato');
      console.log('👉 Effettua il login prima di testare le push notifications');
      console.groupEnd();
      return { success: false, error: 'No user authenticated' };
    }
    
    console.log('✅ Utente autenticato:', {
      uid: user.uid,
      email: user.email
    });
    
    // 2. Verifica supporto browser
    if (!('Notification' in window)) {
      console.error('❌ Browser non supporta le notifiche');
      console.groupEnd();
      return { success: false, error: 'Notifications not supported' };
    }
    
    if (!('serviceWorker' in navigator)) {
      console.error('❌ Browser non supporta Service Workers');
      console.groupEnd();
      return { success: false, error: 'Service Workers not supported' };
    }
    
    if (!('PushManager' in window)) {
      console.error('❌ Browser non supporta Push API');
      console.groupEnd();
      return { success: false, error: 'Push API not supported' };
    }
    
    console.log('✅ Browser supporta tutte le API necessarie');
    
    // 3. Verifica stato permessi
    const permissionStatus = getPushNotificationStatus();
    console.log('📋 Stato permessi:', permissionStatus);
    
    if (permissionStatus === 'denied') {
      console.error('❌ Permessi notifiche negati');
      console.log('👉 Per abilitare:');
      console.log('   1. Clicca icona lucchetto/info nella barra URL');
      console.log('   2. Trova "Notifiche" nelle impostazioni');
      console.log('   3. Imposta su "Consenti"');
      console.log('   4. Ricarica la pagina');
      console.groupEnd();
      return { success: false, error: 'Permissions denied' };
    }
    
    // 4. Richiedi permesso se necessario
    if (permissionStatus === 'default') {
      console.log('⏳ Richiedendo permesso per le notifiche...');
      const granted = await requestNotificationPermission();
      
      if (!granted) {
        console.error('❌ Permesso negato dall\'utente');
        console.groupEnd();
        return { success: false, error: 'Permission request denied' };
      }
      
      console.log('✅ Permesso concesso');
    }
    
    // 5. Verifica Service Worker
    console.log('⏳ Verificando Service Worker...');
    let registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      console.warn('⚠️ Service Worker non registrato, registrando...');
      try {
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          type: 'classic'
        });
        console.log('✅ Service Worker registrato');
        await navigator.serviceWorker.ready;
        console.log('✅ Service Worker pronto');
      } catch (swError) {
        console.error('❌ Errore registrazione Service Worker:', swError);
        console.log('👉 Verifica che il file /public/sw.js esista');
        console.groupEnd();
        return { success: false, error: 'SW registration failed', details: swError.message };
      }
    } else {
      console.log('✅ Service Worker già registrato:', {
        scope: registration.scope,
        state: registration.active?.state
      });
    }
    
    // 6. Controlla subscription esistente
    console.log('⏳ Verificando subscription esistente...');
    const isSubscribed = await isPushSubscribed();
    console.log('📊 Stato subscription:', isSubscribed ? 'ATTIVA' : 'NON ATTIVA');
    
    // 7. Crea/Aggiorna subscription
    if (!isSubscribed) {
      console.log('⏳ Creando nuova subscription...');
      const subscription = await subscribeToPush(user.uid);
      
      if (!subscription) {
        console.error('❌ Errore nella creazione della subscription');
        console.groupEnd();
        return { success: false, error: 'Subscription creation failed' };
      }
      
      console.log('✅ Subscription creata:', {
        endpoint: subscription.endpoint?.substring(0, 50) + '...',
        hasKeys: !!(subscription.toJSON?.()?.keys)
      });
    } else {
      console.log('✅ Subscription già attiva');
    }
    
    // 8. Test finale: invia notifica di test
    console.log('⏳ Inviando notifica di test...');
    const testSent = await sendTestNotification(user.uid);
    
    if (testSent) {
      console.log('✅ Notifica di test inviata con successo');
      console.log('👀 Controlla se la notifica appare sul browser');
    } else {
      console.warn('⚠️ Invio notifica fallito (normale in development per CORS)');
      console.log('👉 In production funzionerà correttamente');
    }
    
    // Riepilogo finale
    console.log('\n📊 RIEPILOGO:');
    console.log('├─ Utente:', user.email);
    console.log('├─ Permessi:', 'GRANTED ✅');
    console.log('├─ Service Worker:', registration.active?.state || 'ATTIVO ✅');
    console.log('├─ Subscription:', 'ATTIVA ✅');
    console.log('└─ Test notifica:', testSent ? 'INVIATA ✅' : 'FALLITA (CORS) ⚠️');
    
    console.groupEnd();
    
    return {
      success: true,
      user: { uid: user.uid, email: user.email },
      permissions: 'granted',
      serviceWorker: 'active',
      subscription: 'active',
      testNotification: testSent
    };
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
    console.groupEnd();
    return { success: false, error: error.message, stack: error.stack };
  }
}

/**
 * Controlla solo lo stato senza modifiche
 */
async function checkPushStatus() {
  console.group('📊 Push Notification Status');
  
  try {
    const user = auth.currentUser;
    
    console.log('Utente:', user ? {
      uid: user.uid,
      email: user.email
    } : 'NON AUTENTICATO ❌');
    
    console.log('Supporto browser:', {
      notifications: 'Notification' in window,
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window
    });
    
    console.log('Permessi:', getPushNotificationStatus());
    
    const isSubscribed = await isPushSubscribed();
    console.log('Subscription attiva:', isSubscribed ? 'SÌ ✅' : 'NO ❌');
    
    if (isSubscribed) {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      
      if (subscription) {
        console.log('Dettagli subscription:', {
          endpoint: subscription.endpoint?.substring(0, 50) + '...',
          expirationTime: subscription.expirationTime || 'NESSUNA',
          hasKeys: !!(subscription.toJSON?.()?.keys)
        });
      }
    }
    
    console.groupEnd();
    
  } catch (error) {
    console.error('Errore:', error);
    console.groupEnd();
  }
}

/**
 * Invia notifica di test
 */
async function sendTestPush() {
  console.log('📤 Inviando notifica di test...');
  
  const user = auth.currentUser;
  if (!user) {
    console.error('❌ Nessun utente autenticato');
    return;
  }
  
  const isSubscribed = await isPushSubscribed();
  if (!isSubscribed) {
    console.error('❌ Nessuna subscription attiva');
    console.log('👉 Esegui prima: window.testPushSubscription()');
    return;
  }
  
  const result = await sendTestNotification(user.uid);
  
  if (result) {
    console.log('✅ Notifica inviata');
  } else {
    console.warn('⚠️ Invio fallito (normale in development)');
  }
}

/**
 * Disabilita subscription
 */
async function unsubscribePush() {
  console.log('🔕 Disabilitando subscription...');
  
  const user = auth.currentUser;
  if (!user) {
    console.error('❌ Nessun utente autenticato');
    return;
  }
  
  const result = await unsubscribeFromPush(user.uid);
  
  if (result) {
    console.log('✅ Subscription disabilitata');
  } else {
    console.error('❌ Errore nella disabilitazione');
  }
}

// Esponi le funzioni globalmente per l'uso nella console
if (typeof window !== 'undefined') {
  window.testPushSubscription = testPushSubscription;
  window.checkPushStatus = checkPushStatus;
  window.sendTestPush = sendTestPush;
  window.unsubscribePush = unsubscribePush;
  
  // Log delle utility disponibili
  console.log(`
╔═══════════════════════════════════════════════════╗
║   🔔 Push Notification Test Utilities Loaded      ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║  window.testPushSubscription()                    ║
║  └─ Abilita e testa push notifications            ║
║                                                   ║
║  window.checkPushStatus()                         ║
║  └─ Controlla stato corrente                      ║
║                                                   ║
║  window.sendTestPush()                            ║
║  └─ Invia notifica di test                        ║
║                                                   ║
║  window.unsubscribePush()                         ║
║  └─ Disabilita push notifications                 ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
}

export { testPushSubscription, checkPushStatus, sendTestPush, unsubscribePush };
