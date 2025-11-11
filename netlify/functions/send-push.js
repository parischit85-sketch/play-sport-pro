const admin = require('firebase-admin');
const webpush = require('web-push');

// Inizializza Firebase Admin se non già fatto
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Configura VAPID keys per web-push
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.error('❌ VAPID keys non configurate nelle variabili d\'ambiente');
  throw new Error('VAPID keys not configured');
}

webpush.setVapidDetails(
  'mailto:paris.andrea@live.it',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// =============================================
// CIRCUIT BREAKER IMPLEMENTATION
// =============================================

/**
 * Simple Circuit Breaker to prevent cascading failures
 * States: CLOSED → OPEN → HALF_OPEN → CLOSED
 */
class CircuitBreaker {
  constructor(name = 'default', config = {}) {
    this.name = name;
    this.state = 'CLOSED'; // CLOSED | OPEN | HALF_OPEN
    this.failureCount = 0;
    this.failureThreshold = config.failureThreshold || 5; // Open after N failures
    this.successThreshold = config.successThreshold || 2; // Close after N successes in HALF_OPEN
    this.resetTimeout = config.resetTimeout || 60000; // Try to recover after 1 minute
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  // Record success
  success() {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.successCount = 0;
        console.log(`[CircuitBreaker] ${this.name} CLOSED`);
      }
    } else if (this.state === 'CLOSED') {
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }

  // Record failure
  failure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'CLOSED' && this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.warn(`[CircuitBreaker] ${this.name} OPENED after ${this.failureCount} failures`);
    } else if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      console.warn(`[CircuitBreaker] ${this.name} re-OPENED after failure in HALF_OPEN`);
    }
  }

  // Check if circuit is open and eligible for reset
  canAttempt() {
    if (this.state === 'CLOSED') {
      return true;
    }

    if (this.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
        console.log(`[CircuitBreaker] ${this.name} HALF_OPEN (testing recovery)`);
        return true;
      }
      return false;
    }

    return this.state === 'HALF_OPEN';
  }

  // Get circuit state for logging
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
    };
  }
}

// Global circuit breaker for web-push service
const pushServiceCircuitBreaker = new CircuitBreaker('web-push', {
  failureThreshold: 10,
  successThreshold: 5,
  resetTimeout: 60000, // 1 minute before retry
});

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Invia una notifica con retry logic e exponential backoff
 */
async function sendWithRetry(subscription, payload, subscriptionId, maxRetries = 3) {
  let lastError;

  // Check circuit breaker BEFORE attempting
  if (!pushServiceCircuitBreaker.canAttempt()) {
    const cbState = pushServiceCircuitBreaker.getState();
    console.warn(`[send-push] Circuit breaker OPEN, rejecting request. State:`, cbState);
    throw new Error(`Circuit breaker open for web-push service. State: ${cbState.state}`);
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[send-push] Attempt ${attempt}/${maxRetries} for subscription: ${subscriptionId}`);
      await webpush.sendNotification(subscription, payload);
      
      // Record success
      pushServiceCircuitBreaker.success();
      return; // Success
    } catch (error) {
      lastError = error;
      console.warn(`[send-push] Attempt ${attempt} failed for ${subscriptionId}:`, error.message);

      // Non ritentare per errori permanenti (client-side)
      if (error.statusCode === 410 || error.statusCode === 404 || error.statusCode === 400) {
        // These are permanent subscription errors - don't record as circuit breaker failure
        throw error;
      }

      // Record failure for circuit breaker (server-side errors only)
      if (error.statusCode >= 500) {
        pushServiceCircuitBreaker.failure();
        console.warn(`[send-push] Recording server error to circuit breaker:`, pushServiceCircuitBreaker.getState());
      }

      // Se non è l'ultimo tentativo, aspetta prima di riprovare
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff, max 10s
        console.log(`[send-push] Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Tutti i tentativi falliti
  pushServiceCircuitBreaker.failure();
  throw lastError;
}

exports.handler = async (event, context) => {
  // Abilita CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Gestisci preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId, notification } = JSON.parse(event.body);

    console.log('[send-push] Request received:', { userId, hasNotification: !!notification });

    if (!userId || !notification) {
      console.error('[send-push] Missing required fields');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Parametri mancanti: userId e notification sono obbligatori',
          code: 'MISSING_PARAMETERS',
          resolution: 'Assicurati di passare userId e notification nel body della richiesta POST'
        }),
      };
    }

    // Recupera tutte le sottoscrizioni dell'utente
    console.log('[send-push] Fetching subscriptions for userId:', userId);
    const subscriptionsSnapshot = await db
      .collection('pushSubscriptions')
      .where('userId', '==', userId)
      .get();

    console.log('[send-push] Subscriptions found:', subscriptionsSnapshot.size);

    if (subscriptionsSnapshot.empty) {
      console.warn('[send-push] No subscriptions found for user:', userId);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          error: 'Nessuna sottoscrizione push trovata per questo utente',
          code: 'NO_SUBSCRIPTIONS',
          resolution: 'L\'utente deve prima attivare le notifiche push cliccando "Attiva Notifiche" nell\'app',
          troubleshooting: [
            'Verifica che l\'utente abbia concesso i permessi per le notifiche nel browser',
            'Controlla che il Service Worker sia registrato correttamente',
            'Assicurati che la funzione save-push-subscription sia stata chiamata con successo'
          ]
        }),
      };
    }

    // Prepara il payload della notifica con supporto per notifiche rich
    const richNotification = {
      // Campi base
      title: notification.title || 'Play-sport.pro',
      body: notification.body || 'Hai una nuova notifica',
      icon: notification.icon || '/icons/icon.svg',
      badge: notification.badge || '/icons/icon.svg',
      tag: notification.tag || 'default',
      requireInteraction: notification.requireInteraction || false,
      silent: notification.silent || false,
      timestamp: notification.timestamp || Date.now(),

      // Campi avanzati per notifiche rich
      image: notification.image, // Immagine grande
      actions: notification.actions || [
        {
          action: 'open',
          title: 'Apri App',
          icon: '/icons/icon.svg',
        },
        {
          action: 'dismiss',
          title: 'Ignora',
        },
      ],

      // Dati personalizzati
      data: {
        url: notification.url || '/',
        type: notification.type || 'general',
        playerId: notification.playerId,
        clubId: notification.clubId,
        matchId: notification.matchId,
        bookingId: notification.bookingId,
        tournamentId: notification.tournamentId,
        deepLink: notification.deepLink,
        actionButtons: notification.actionButtons,
        priority: notification.priority || 'normal',
        category: notification.category || 'general',
        ...notification.data,
      },

      // Suoni e vibrazione
      vibrate: notification.vibrate || [200, 100, 200],
      sound: notification.sound,

      // Notifiche persistenti
      persistent: notification.persistent || false,
      renotify: notification.renotify || false,

      // Lingua e direzione testo
      lang: notification.lang || 'it',
      dir: notification.dir || 'ltr',
    };

    const payload = JSON.stringify(richNotification);
    console.log('[send-push] Rich notification payload prepared, length:', payload.length);

    // Invia la notifica a tutte le sottoscrizioni dell'utente
    const sendPromises = [];
    const invalidSubscriptions = [];
    const failedSubscriptions = [];

    subscriptionsSnapshot.forEach((doc) => {
      const subscriptionData = doc.data();
      const subscription = subscriptionData.subscription;

      console.log('[send-push] Sending to subscription:', doc.id);

      const sendPromise = sendWithRetry(subscription, payload, doc.id)
        .then(async () => {
          console.log('[send-push] Successfully sent to:', doc.id);
          
          // Aggiorna lastUsedAt per questa sottoscrizione
          try {
            await db.collection('pushSubscriptions').doc(doc.id).update({
              lastUsedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          } catch (updateError) {
            console.warn('[send-push] Failed to update lastUsedAt for:', doc.id, updateError.message);
          }
        })
        .catch((error) => {
          console.error('[send-push] Error sending to subscription:', doc.id, error.message);
          
          // Se la sottoscrizione non è più valida (410 Gone o 404 Not Found)
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log('[send-push] Marking subscription as invalid:', doc.id);
            invalidSubscriptions.push(doc.id);
          } else {
            // Altri errori: marca come fallita ma non eliminare
            failedSubscriptions.push({
              id: doc.id,
              error: error.message,
              statusCode: error.statusCode
            });
          }
        });

      sendPromises.push(sendPromise);
    });

    // Attendi tutte le richieste
    console.log('[send-push] Waiting for all sends to complete...');
    await Promise.all(sendPromises);

    // Rimuovi le sottoscrizioni non valide
    if (invalidSubscriptions.length > 0) {
      console.log('[send-push] Removing invalid subscriptions:', invalidSubscriptions.length);
      const deletePromises = invalidSubscriptions.map((id) =>
        db.collection('pushSubscriptions').doc(id).delete()
      );
      await Promise.all(deletePromises);
      console.log(`[send-push] Removed ${invalidSubscriptions.length} invalid subscriptions`);
    }

    const result = {
      success: true,
      sent: subscriptionsSnapshot.size - invalidSubscriptions.length - failedSubscriptions.length,
      removed: invalidSubscriptions.length,
      failed: failedSubscriptions.length,
      failedDetails: failedSubscriptions.length > 0 ? failedSubscriptions : undefined,
    };

    console.log('[send-push] Request completed successfully:', result);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('[send-push] Fatal error:', error);
    console.error('[send-push] Error stack:', error.stack);
    
    let errorCode = 'UNKNOWN_ERROR';
    let resolution = 'Contatta il supporto tecnico con i dettagli dell\'errore';
    
    if (error.message?.includes('VAPID')) {
      errorCode = 'VAPID_CONFIG_ERROR';
      resolution = 'Verifica che le chiavi VAPID siano configurate correttamente nelle variabili d\'ambiente';
    } else if (error.message?.includes('Firebase')) {
      errorCode = 'FIREBASE_ERROR';
      resolution = 'Problema di connessione a Firestore. Verifica le credenziali Firebase';
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        code: errorCode,
        resolution: resolution,
        type: error.constructor.name,
        details: 'Controlla i log della funzione per maggiori informazioni'
      }),
    };
  }
};
