const admin = require('firebase-admin');

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
    const { userId, subscription, endpoint, timestamp, deviceId } = JSON.parse(event.body);

    if (!userId || !subscription || !endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Parametri obbligatori mancanti: userId, subscription ed endpoint sono richiesti',
          code: 'MISSING_PARAMETERS',
          resolution: 'Assicurati di passare tutti i parametri richiesti nel body della richiesta POST'
        }),
      };
    }

    // INPUT VALIDATION - Prevent abuse and malformed data
    const validation = validateSubscriptionData({ userId, subscription, endpoint, timestamp });
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: validation.error,
          code: validation.code,
          resolution: validation.resolution,
        }),
      };
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 giorni

    // Genera deviceId se non fornito (backward compatibility)
    const finalDeviceId = deviceId || generateDeviceId(subscription);

    // OPTIMIZATION: Use composite key (userId_deviceId) for efficient storage
    // This eliminates the need for queries - direct document ID access
    const compositeDocId = `${userId}_${finalDeviceId}`;

    console.log('[save-push-subscription] Processing subscription:', {
      userId,
      endpoint: endpoint.substring(0, 50) + '...',
      deviceId: finalDeviceId,
      docId: compositeDocId,
      timestamp: now.toISOString(),
    });

    // SINGLE OPERATION: set() with merge=true
    // - If document exists: update fields (merge mode)
    // - If document doesn't exist: create new document
    // This eliminates expensive queries and saves Firestore quota
    await db.collection('pushSubscriptions').doc(compositeDocId).set(
      {
        userId,
        deviceId: finalDeviceId,
        subscription,
        endpoint,
        timestamp: timestamp || now.toISOString(),
        lastUsedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isActive: true,
        createdAt: now.toISOString(), // Only set on create, not on update
      },
      { merge: true } // Preserves createdAt on updates
    );

    console.log('[save-push-subscription] Subscription saved/updated:', compositeDocId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Sottoscrizione salvata',
        id: compositeDocId,
        action: 'saved',
      }),
    };
  } catch (error) {
    console.error('Errore nella funzione save-push-subscription:', error);
    
    let errorCode = 'UNKNOWN_ERROR';
    let resolution = 'Contatta il supporto tecnico con i dettagli dell\'errore';
    
    if (error.message?.includes('permission-denied')) {
      errorCode = 'FIRESTORE_PERMISSION_DENIED';
      resolution = 'Verifica che le regole Firestore permettano la scrittura sulla collezione pushSubscriptions';
    } else if (error.message?.includes('quota')) {
      errorCode = 'FIRESTORE_QUOTA_EXCEEDED';
      resolution = 'Quota Firestore esaurita. Contatta l\'amministratore del progetto';
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        code: errorCode,
        resolution: resolution
      }),
    };
  }
};

/**
 * Genera un device ID basato sulla subscription (per backward compatibility)
 */
function generateDeviceId(subscription) {
  // Usa endpoint come base per generare un ID deterministico
  const endpoint = subscription.endpoint || '';
  const p256dh = subscription.keys?.p256dh || '';

  // Simple hash function per creare un ID consistente
  let hash = 0;
  const str = endpoint + p256dh;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return 'device-' + Math.abs(hash).toString(36);
}

/**
 * Valida i dati della subscription per prevenire abusi e dati malformati
 */
function validateSubscriptionData(data) {
  const { userId, subscription, endpoint, timestamp } = data;

  // 1. Validate userId format (Firebase UID format)
  if (typeof userId !== 'string' || userId.length < 10 || userId.length > 128) {
    return {
      valid: false,
      error: 'Invalid userId format',
      code: 'INVALID_USER_ID',
      resolution: 'userId deve essere una stringa di 10-128 caratteri (Firebase UID)',
    };
  }

  // 2. Validate endpoint is a valid HTTPS URL
  try {
    const url = new URL(endpoint);
    if (url.protocol !== 'https:') {
      throw new Error('Must be HTTPS');
    }
    // Check common push service providers
    const validHosts = [
      'fcm.googleapis.com',
      'updates.push.services.mozilla.com',
      'updates.push.services.mozilla.com',
      'web.push.apple.com',
    ];
    const isKnownProvider = validHosts.some(host => url.hostname.includes(host));
    if (!isKnownProvider && !url.hostname.includes('push')) {
      // Allow other endpoints but log for monitoring
      console.warn('Unknown push service provider:', url.hostname);
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid endpoint URL. Must be valid HTTPS URL',
      code: 'INVALID_ENDPOINT',
      resolution: 'endpoint deve essere un URL HTTPS valido da un push service provider',
    };
  }

  // 3. Validate subscription structure
  if (!subscription || typeof subscription !== 'object') {
    return {
      valid: false,
      error: 'subscription deve essere un oggetto',
      code: 'INVALID_SUBSCRIPTION_FORMAT',
      resolution: 'subscription deve contenere endpoint e keys.p256dh e keys.auth',
    };
  }

  if (!subscription.endpoint || typeof subscription.endpoint !== 'string') {
    return {
      valid: false,
      error: 'subscription.endpoint mancante o non valido',
      code: 'MISSING_SUBSCRIPTION_ENDPOINT',
      resolution: 'subscription.endpoint è obbligatorio e deve essere una stringa',
    };
  }

  if (!subscription.keys || typeof subscription.keys !== 'object') {
    return {
      valid: false,
      error: 'subscription.keys mancante o non valido',
      code: 'MISSING_SUBSCRIPTION_KEYS',
      resolution: 'subscription.keys è obbligatorio e deve contenere p256dh e auth',
    };
  }

  if (!subscription.keys.p256dh || typeof subscription.keys.p256dh !== 'string') {
    return {
      valid: false,
      error: 'subscription.keys.p256dh mancante o non valido',
      code: 'MISSING_P256DH_KEY',
      resolution: 'p256dh è una chiave di crittografia obbligatoria',
    };
  }

  if (!subscription.keys.auth || typeof subscription.keys.auth !== 'string') {
    return {
      valid: false,
      error: 'subscription.keys.auth mancante o non valido',
      code: 'MISSING_AUTH_KEY',
      resolution: 'auth è una chiave di autenticazione obbligatoria',
    };
  }

  // 4. Validate subscription object size (< 4KB web push limit)
  const subscriptionSize = JSON.stringify(subscription).length;
  if (subscriptionSize > 4000) {
    return {
      valid: false,
      error: `subscription troppo grande: ${subscriptionSize} bytes (max 4000)`,
      code: 'SUBSCRIPTION_TOO_LARGE',
      resolution: 'La subscription è troppo grande per il web push (max 4KB)',
    };
  }

  // 5. Validate timestamp if provided (must be ISO string)
  if (timestamp) {
    try {
      new Date(timestamp).toISOString();
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid timestamp format. Must be ISO 8601 string',
        code: 'INVALID_TIMESTAMP',
        resolution: 'timestamp deve essere in formato ISO 8601 (es: 2025-11-11T10:00:00Z)',
      };
    }
  }

  // All validations passed
  return { valid: true };
}
