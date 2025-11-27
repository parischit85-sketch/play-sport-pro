/**
 * Cloud Function per cancellare TUTTE le push subscriptions
 * Da eseguire una tantum per pulizia dopo fix architetturale
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export const deleteAllPushSubscriptions = onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 540, // 9 minuti (max per Cloud Functions)
    memory: '512MiB',
  },
  async (request) => {
    const { auth } = request;

    // Solo admin possono eseguire questa operazione
    if (!auth || !auth.uid) {
      throw new HttpsError('unauthenticated', 'Autenticazione richiesta');
    }

    console.log('🗑️ [deleteAllPushSubscriptions] Starting deletion...');
    console.log('🔐 [deleteAllPushSubscriptions] Executed by:', auth.uid, auth.token?.email);

    try {
      const subscriptionsRef = db.collection('pushSubscriptions');
      const snapshot = await subscriptionsRef.get();

      if (snapshot.empty) {
        console.log(
          '✅ [deleteAllPushSubscriptions] No subscriptions found. Collection already empty.'
        );
        return {
          success: true,
          deleted: 0,
          message: 'Nessuna subscription trovata. Collection già vuota.',
        };
      }

      console.log(`📊 [deleteAllPushSubscriptions] Found ${snapshot.size} subscriptions to delete`);

      // Batch delete (max 500 per batch)
      const batchSize = 500;
      let deleted = 0;
      const totalDocs = snapshot.docs.length;

      for (let i = 0; i < totalDocs; i += batchSize) {
        const batch = db.batch();
        const docsToDelete = snapshot.docs.slice(i, i + batchSize);

        docsToDelete.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        deleted += docsToDelete.length;

        console.log(
          `✅ [deleteAllPushSubscriptions] Deleted ${deleted}/${totalDocs} subscriptions...`
        );
      }

      console.log('🎉 [deleteAllPushSubscriptions] All pushSubscriptions deleted!');
      console.log(`📋 [deleteAllPushSubscriptions] Summary: ${deleted} subscriptions deleted`);

      return {
        success: true,
        deleted,
        total: totalDocs,
        message: `Cancellate con successo ${deleted} push subscriptions. Gli utenti dovranno ri-registrare le notifiche push.`,
      };
    } catch (error) {
      console.error('❌ [deleteAllPushSubscriptions] Error:', error);
      throw new HttpsError('internal', `Errore durante la cancellazione: ${error.message}`);
    }
  }
);
