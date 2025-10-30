// =============================================
// FILE: src/services/club-analytics.js
// Servizio per tracciare le visualizzazioni dei circoli
// =============================================

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
  query,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase.js';

/**
 * Track club view (visualizzazione circolo)
 * Incrementa il counter di visualizzazioni per un utente specifico
 *
 * @param {string} userId - ID dell'utente
 * @param {string} clubId - ID del circolo visualizzato
 * @param {string} clubName - Nome del circolo (per cache)
 * @returns {Promise<void>}
 */
export async function trackClubView(userId, clubId, clubName = null) {
  if (!userId || !clubId) {
    console.warn('⚠️ [trackClubView] userId or clubId missing');
    return;
  }

  try {
    // Documento: users/{userId}/clubViews/{clubId}
    const viewDocRef = doc(db, 'users', userId, 'clubViews', clubId);

    // Prova a leggere il documento esistente
    const viewDocSnap = await getDoc(viewDocRef);

    if (viewDocSnap.exists()) {
      // Documento esiste: incrementa viewCount e aggiorna lastViewedAt
      await updateDoc(viewDocRef, {
        viewCount: increment(1),
        lastViewedAt: serverTimestamp(),
      });
    } else {
      // Documento non esiste: crealo
      await setDoc(viewDocRef, {
        clubId,
        clubName: clubName || clubId,
        viewCount: 1,
        firstViewedAt: serverTimestamp(),
        lastViewedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('❌ [trackClubView] Error tracking club view:', error);
    // Non bloccare l'app se il tracking fallisce
  }
}

/**
 * Get user's most viewed clubs
 * Recupera i circoli più visualizzati dall'utente
 *
 * @param {string} userId - ID dell'utente
 * @param {number} limitCount - Numero massimo di circoli da recuperare (default: 3)
 * @returns {Promise<Array>} Array di circoli ordinati per viewCount
 */
export async function getUserMostViewedClubs(userId, limitCount = 3) {
  if (!userId) {
    console.warn('⚠️ [getUserMostViewedClubs] userId missing');
    return [];
  }

  try {
    const clubViewsRef = collection(db, 'users', userId, 'clubViews');

    // Query ordinata per viewCount decrescente, limitata a limitCount
    const q = query(clubViewsRef, orderBy('viewCount', 'desc'), limit(limitCount));

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    const clubViews = [];

    for (const docSnap of snapshot.docs) {
      const viewData = docSnap.data();
      const clubId = docSnap.id;

      // Carica i dati completi del club
      let clubData = null;
      try {
        const clubDocRef = doc(db, 'clubs', clubId);
        const clubDocSnap = await getDoc(clubDocRef);

        if (clubDocSnap.exists()) {
          const data = clubDocSnap.data();
          // 🔒 FILTRO: Solo circoli attivi
          if (data.isActive === true) {
            clubData = { id: clubId, ...data };
          }
        }
      } catch (clubError) {
        console.error(`❌ [getUserMostViewedClubs] Error loading club ${clubId}:`, clubError);
      }

      clubViews.push({
        clubId,
        viewCount: viewData.viewCount,
        lastViewedAt: viewData.lastViewedAt,
        firstViewedAt: viewData.firstViewedAt,
        club: clubData, // Dati completi del circolo (può essere null se non trovato)
        // Fallback al nome cachato se club non trovato
        name: clubData?.name || viewData.clubName || clubId,
      });
    }

    return clubViews;
  } catch (error) {
    console.error('❌ [getUserMostViewedClubs] Error getting most viewed clubs:', error);
    return [];
  }
}

/**
 * Get all club views for a user (senza limite)
 * Utile per statistiche e debug
 *
 * @param {string} userId - ID dell'utente
 * @returns {Promise<Array>} Array di tutte le visualizzazioni
 */
export async function getAllUserClubViews(userId) {
  if (!userId) {
    console.warn('⚠️ [getAllUserClubViews] userId missing');
    return [];
  }

  try {
    const clubViewsRef = collection(db, 'users', userId, 'clubViews');
    const q = query(clubViewsRef, orderBy('viewCount', 'desc'));
    const snapshot = await getDocs(q);

    const clubViews = snapshot.docs.map((doc) => ({
      clubId: doc.id,
      ...doc.data(),
    }));

    return clubViews;
  } catch (error) {
    console.error('❌ [getAllUserClubViews] Error getting all club views:', error);
    return [];
  }
}

/**
 * Reset club views for a user (utility per testing)
 *
 * @param {string} userId - ID dell'utente
 * @returns {Promise<void>}
 */
export async function resetUserClubViews(userId) {
  if (!userId) {
    console.warn('⚠️ [resetUserClubViews] userId missing');
    return;
  }

  try {
    const clubViewsRef = collection(db, 'users', userId, 'clubViews');
    const snapshot = await getDocs(clubViewsRef);

    const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('❌ [resetUserClubViews] Error resetting club views:', error);
  }
}
