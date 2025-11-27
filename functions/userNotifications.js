// =============================================
// FILE: functions/userNotifications.js
// Sistema di notifiche in-app per utenti
// =============================================

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

/**
 * Salva una notifica nell'inbox dell'utente
 * @param {Object} data - { userId, title, body, type, metadata }
 */
async function saveUserNotification(data) {
  const {
    userId,
    title,
    body,
    type = 'info', // 'info' | 'certificate' | 'booking' | 'tournament' | 'warning' | 'success'
    metadata = {},
    icon = null,
    actionUrl = null,
    priority = 'normal', // 'low' | 'normal' | 'high' | 'urgent'
  } = data;

  if (!userId) {
    throw new Error('userId is required');
  }

  try {
    const notificationData = {
      userId,
      title: title || 'Notifica',
      body: body || '',
      type,
      metadata,
      icon,
      actionUrl,
      priority,
      read: false,
      archived: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('userNotifications').add(notificationData);
    logger.info('💾 [UserNotifications] Saved notification:', {
      notificationId: docRef.id,
      userId,
      type,
      title: title.substring(0, 50),
    });

    return docRef.id;
  } catch (error) {
    logger.error('❌ [UserNotifications] Error saving notification:', {
      userId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Recupera le notifiche di un utente
 * Callable function per frontend
 */
const getUserNotifications = onCall(
  {
    region: 'us-central1',
    cors: true,
  },
  async (request) => {
    // 1. Defensive logging at the very start
    console.log('🔔 [getUserNotifications] START request');
    
    const { auth, data } = request;

    // 2. Check auth immediately
    if (!auth) {
      console.warn('⚠️ [getUserNotifications] Unauthenticated request');
      throw new HttpsError('unauthenticated', "Devi effettuare l'accesso");
    }

    const {
      limit = 50,
      unreadOnly = false,
      archived = false,
      type = null,
      startAfter = null, // Pagination cursor (document ID)
    } = data || {};

    const userId = auth.uid;
    console.log(`👤 [getUserNotifications] Fetching for user: ${userId}`, { limit, unreadOnly, archived });

    try {
      let query = db
        .collection('userNotifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc');

      // Filtri
      if (unreadOnly) {
        query = query.where('read', '==', false);
      }

      if (archived !== null) {
        query = query.where('archived', '==', archived);
      }

      if (type) {
        query = query.where('type', '==', type);
      }

      // Pagination
      if (startAfter) {
        console.log(`📄 [getUserNotifications] Pagination startAfter: ${startAfter}`);
        const startDoc = await db.collection('userNotifications').doc(startAfter).get();
        if (startDoc.exists) {
          query = query.startAfter(startDoc);
        } else {
          console.warn(`⚠️ [getUserNotifications] Start document ${startAfter} not found, ignoring pagination`);
        }
      }

      query = query.limit(limit);

      const snapshot = await query.get();
      console.log(`📊 [getUserNotifications] Query executed, found ${snapshot.size} docs`);

      const notifications = [];
      snapshot.forEach((doc) => {
        // Defensive data access
        const d = doc.data();
        notifications.push({
          id: doc.id,
          ...d,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : new Date().toISOString(),
          updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : null,
        });
      });

      // Conta non lette totali
      // Use count() aggregation if available (Node SDK v11+ supports it, but let's stick to safe query)
      // Optimization: Don't fetch all docs just to count if possible, but for now keep logic simple
      const unreadSnapshot = await db
        .collection('userNotifications')
        .where('userId', '==', userId)
        .where('read', '==', false)
        .where('archived', '==', false)
        .count() // Use aggregation query for performance
        .get();
      
      const unreadCount = unreadSnapshot.data().count;

      console.log('📬 [getUserNotifications] Success:', {
        userId,
        count: notifications.length,
        unreadCount,
      });

      return {
        notifications,
        unreadCount,
        hasMore: snapshot.size === limit,
        lastDocId: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null,
      };
    } catch (error) {
      console.error('❌ [getUserNotifications] CRITICAL ERROR:', {
        userId,
        message: error.message,
        stack: error.stack
      });
      // Return empty list instead of throwing 500 to prevent frontend crash loop
      // But still throw HttpsError so frontend knows something went wrong if it wants to handle it
      // Actually, better to return success: false or empty list to keep UI stable
      // For now, throw proper HttpsError but ensure it's caught and logged
      throw new HttpsError('internal', `Errore recupero notifiche: ${error.message}`);
    }
  }
);

/**
 * Marca notifiche come lette
 * Callable function per frontend
 */
const markNotificationsAsRead = onCall(
  {
    region: 'us-central1',
    cors: true,
  },
  async (request) => {
    const { auth, data } = request;

    if (!auth) {
      throw new HttpsError('unauthenticated', "Devi effettuare l'accesso");
    }

    const { notificationIds, markAll = false } = data || {};

    const userId = auth.uid;

    try {
      const batch = db.batch();
      let updatedCount = 0;

      if (markAll) {
        // Marca tutte le notifiche non lette come lette
        const snapshot = await db
          .collection('userNotifications')
          .where('userId', '==', userId)
          .where('read', '==', false)
          .get();

        snapshot.forEach((doc) => {
          batch.update(doc.ref, {
            read: true,
            readAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
          updatedCount++;
        });
      } else if (notificationIds && Array.isArray(notificationIds)) {
        // Marca specifiche notifiche
        for (const notifId of notificationIds) {
          const docRef = db.collection('userNotifications').doc(notifId);
          const doc = await docRef.get();

          if (doc.exists && doc.data().userId === userId) {
            batch.update(docRef, {
              read: true,
              readAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            });
            updatedCount++;
          }
        }
      }

      await batch.commit();

      logger.info('✅ [UserNotifications] Marked as read:', {
        userId,
        updatedCount,
        markAll,
        notificationIds: markAll ? 'all' : notificationIds,
      });

      return { success: true, updatedCount };
    } catch (error) {
      logger.error('❌ [UserNotifications] Error marking as read:', {
        userId,
        error: error.message,
      });
      throw new HttpsError('internal', "Errore durante l'aggiornamento delle notifiche");
    }
  }
);

/**
 * Archivia o cancella notifiche
 * Callable function per frontend
 */
const archiveNotifications = onCall(
  {
    region: 'us-central1',
    cors: true,
  },
  async (request) => {
    const { auth, data } = request;

    if (!auth) {
      throw new HttpsError('unauthenticated', "Devi effettuare l'accesso");
    }

    const { notificationIds, archive = true, deleteNotifications = false } = data || {};
    if (!notificationIds || !Array.isArray(notificationIds)) {
      throw new HttpsError('invalid-argument', 'notificationIds deve essere un array');
    }

    const userId = auth.uid;

    try {
      const batch = db.batch();
      let updatedCount = 0;

      for (const notifId of notificationIds) {
        const docRef = db.collection('userNotifications').doc(notifId);
        const doc = await docRef.get();

        if (doc.exists && doc.data().userId === userId) {
          if (deleteNotifications) {
            batch.delete(docRef);
          } else {
            batch.update(docRef, {
              archived: archive,
              archivedAt: archive ? FieldValue.serverTimestamp() : null,
              updatedAt: FieldValue.serverTimestamp(),
            });
          }
          updatedCount++;
        }
      }

      await batch.commit();

      logger.info('🗂️ [UserNotifications] Archived/deleted notifications:', {
        userId,
        updatedCount,
        action: deleteNotifications ? 'delete' : archive ? 'archive' : 'unarchive',
        notificationIds,
      });

      return { success: true, updatedCount };
    } catch (error) {
      logger.error('❌ [UserNotifications] Error archiving/deleting:', {
        userId,
        error: error.message,
      });
      throw new HttpsError('internal', "Errore durante l'archiviazione delle notifiche");
    }
  }
);

/**
 * Cleanup automatico notifiche vecchie (scheduled function)
 * Esegue ogni giorno alle 3 AM e cancella notifiche lette più vecchie di 90 giorni
 */
const cleanupOldNotifications = onSchedule(
  {
    schedule: 'every day 03:00',
    timeZone: 'Europe/Rome',
    region: 'us-central1',
  },
  async () => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 giorni fa

      const snapshot = await db
        .collection('userNotifications')
        .where('read', '==', true)
        .where('createdAt', '<', Timestamp.fromDate(cutoffDate))
        .limit(500) // Process in batches
        .get();

      if (snapshot.empty) {
        logger.info('🧹 [UserNotifications] No old notifications to cleanup');
        return;
      }

      const batch = db.batch();
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      logger.info('🧹 [UserNotifications] Cleaned up old notifications:', {
        count: snapshot.size,
        cutoffDate: cutoffDate.toISOString(),
      });
    } catch (error) {
      logger.error('❌ [UserNotifications] Cleanup error:', error);
    }
  }
);

export {
  saveUserNotification,
  getUserNotifications,
  markNotificationsAsRead,
  archiveNotifications,
  cleanupOldNotifications,
};
