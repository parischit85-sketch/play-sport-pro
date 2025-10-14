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

    const now = new Date();
    const expiresAt = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 giorni

    // Genera deviceId se non fornito (backward compatibility)
    const finalDeviceId = deviceId || generateDeviceId(subscription);

    console.log('[save-push-subscription] Processing subscription:', {
      userId,
      endpoint: endpoint.substring(0, 50) + '...',
      deviceId: finalDeviceId,
      hasExistingSubscription: false
    });

    // Verifica se esiste già una sottoscrizione per questo userId + deviceId
    const existingSubscription = await db
      .collection('pushSubscriptions')
      .where('userId', '==', userId)
      .where('deviceId', '==', finalDeviceId)
      .get();

    if (!existingSubscription.empty) {
      // Aggiorna la sottoscrizione esistente
      const docId = existingSubscription.docs[0].id;
      await db.collection('pushSubscriptions').doc(docId).update({
        userId,
        deviceId: finalDeviceId,
        subscription,
        endpoint,
        timestamp: timestamp || now.toISOString(),
        lastUsedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        updatedAt: now.toISOString(),
        isActive: true,
      });

      console.log('[save-push-subscription] Updated existing subscription:', docId);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Sottoscrizione aggiornata',
          id: docId,
          action: 'updated',
        }),
      };
    }

    // Verifica se esiste già una sottoscrizione con questo endpoint (cleanup vecchi record)
    const endpointCheck = await db
      .collection('pushSubscriptions')
      .where('endpoint', '==', endpoint)
      .get();

    if (!endpointCheck.empty) {
      // Aggiorna il record esistente invece di crearne uno nuovo
      const docId = endpointCheck.docs[0].id;
      await db.collection('pushSubscriptions').doc(docId).update({
        userId,
        deviceId: finalDeviceId,
        subscription,
        endpoint,
        timestamp: timestamp || now.toISOString(),
        lastUsedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        updatedAt: now.toISOString(),
        isActive: true,
      });

      console.log('[save-push-subscription] Updated subscription by endpoint:', docId);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Sottoscrizione aggiornata (endpoint esistente)',
          id: docId,
          action: 'updated',
        }),
      };
    }

    // Crea una nuova sottoscrizione
    const docRef = await db.collection('pushSubscriptions').add({
      userId,
      deviceId: finalDeviceId,
      subscription,
      endpoint,
      timestamp: timestamp || now.toISOString(),
      createdAt: now.toISOString(),
      lastUsedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isActive: true,
    });

    console.log('[save-push-subscription] Created new subscription:', docRef.id);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Sottoscrizione salvata',
        id: docRef.id,
        action: 'created',
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
