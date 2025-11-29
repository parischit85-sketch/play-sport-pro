// =============================================
// FILE: functions/rankingNotifications.js
// Cloud Functions per notifiche classifiche
// - Riepilogo settimanale posizione
// - Alert quando qualcuno ti supera
// =============================================

/**
 * CONFIGURAZIONE CLOUD FUNCTION
 * 
 * Deploy:
 * firebase deploy --only functions:weeklyRankingDigest,functions:onRankingChange
 * 
 * Test locale:
 * firebase emulators:start --only functions
 * 
 * Cron Schedule: Ogni lunedì alle 10:00 (Europe/Rome)
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import webpush from 'web-push';

// Inizializza Firebase Admin
if (getApps().length === 0) {
  initializeApp();
}
const db = getFirestore();

// Configurazione Web Push (VAPID keys)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BP-Pp9JUfDtmi-pYIHpHPtcbWT_g9_rVHk-SIolLwO4sRIP8bzg7FSi_EAa_tgK4FNXop1ecL8Mt8dMZsA8bg_g';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@play-sport.pro',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Invia notifica push a un utente
 */
async function sendPushToUser(userId, payload) {
  try {
    // Recupera le subscription push dell'utente
    const subscriptionsSnap = await db
      .collection('pushSubscriptions')
      .where('firebaseUid', '==', userId)
      .get();

    if (subscriptionsSnap.empty) {
      console.log(`[sendPushToUser] Nessuna subscription per utente ${userId}`);
      return { success: false, reason: 'no_subscription' };
    }

    const results = [];
    for (const doc of subscriptionsSnap.docs) {
      const subData = doc.data();
      const subscription = subData.subscription;

      if (!subscription?.endpoint) {
        console.warn(`[sendPushToUser] Subscription invalida per ${userId}`);
        continue;
      }

      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
        results.push({ success: true, endpoint: subscription.endpoint });
        console.log(`[sendPushToUser] Notifica inviata a ${userId}`);
      } catch (error) {
        console.error(`[sendPushToUser] Errore invio a ${userId}:`, error.message);
        
        // Se subscription scaduta, rimuovila
        if (error.statusCode === 410 || error.statusCode === 404) {
          await doc.ref.delete();
          console.log(`[sendPushToUser] Subscription rimossa per ${userId}`);
        }
        
        results.push({ success: false, error: error.message });
      }
    }

    return { success: results.some(r => r.success), results };
  } catch (error) {
    console.error('[sendPushToUser] Errore generale:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Calcola la classifica attuale di un club
 */
async function computeClubRanking(clubId) {
  try {
    // Recupera tutti i giocatori del club
    const playersSnap = await db
      .collection('clubs')
      .doc(clubId)
      .collection('players')
      .get();

    if (playersSnap.empty) {
      return [];
    }

    const players = playersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Ordina per rating (decrescente)
    return players
      .filter(p => p.rating !== undefined)
      .sort((a, b) => (b.rating || 1500) - (a.rating || 1500))
      .map((player, index) => ({
        playerId: player.id,
        name: player.name,
        rating: player.rating || 1500,
        position: index + 1,
        wins: player.wins || 0,
        losses: player.losses || 0,
      }));
  } catch (error) {
    console.error(`[computeClubRanking] Errore per club ${clubId}:`, error);
    return [];
  }
}

/**
 * Recupera la posizione precedente dalla history
 */
async function getPreviousPosition(clubId, playerId) {
  try {
    const historySnap = await db
      .collection('clubs')
      .doc(clubId)
      .collection('rankingHistory')
      .doc(playerId)
      .collection('snapshots')
      .orderBy('timestamp', 'desc')
      .limit(2) // Prendiamo 2: attuale e precedente
      .get();

    if (historySnap.size < 2) {
      return null; // Non c'è abbastanza storia
    }

    // Il secondo documento è la posizione precedente
    const previousDoc = historySnap.docs[1];
    return previousDoc.data().position;
  } catch (error) {
    console.error(`[getPreviousPosition] Errore:`, error);
    return null;
  }
}

/**
 * Salva lo snapshot della classifica per storicizzazione
 */
async function saveRankingSnapshot(clubId, ranking) {
  const timestamp = FieldValue.serverTimestamp();
  const weekNumber = getWeekNumber(new Date());
  
  const batch = db.batch();
  
  for (const player of ranking) {
    const snapshotRef = db
      .collection('clubs')
      .doc(clubId)
      .collection('rankingHistory')
      .doc(player.playerId)
      .collection('snapshots')
      .doc(`week_${weekNumber}`);
    
    batch.set(snapshotRef, {
      position: player.position,
      rating: player.rating,
      wins: player.wins,
      losses: player.losses,
      timestamp,
      weekNumber,
    }, { merge: true });
  }
  
  await batch.commit();
  console.log(`[saveRankingSnapshot] Salvato snapshot per club ${clubId}`);
}

/**
 * Calcola il numero della settimana dell'anno
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Trova userId (Firebase Auth UID) da playerId
 */
async function getUserIdFromPlayerId(clubId, playerId) {
  try {
    // Prima cerca nel documento player
    const playerDoc = await db
      .collection('clubs')
      .doc(clubId)
      .collection('players')
      .doc(playerId)
      .get();

    if (playerDoc.exists) {
      const data = playerDoc.data();
      // Potrebbe essere salvato come `userId`, `uid`, o `firebaseUid`
      return data.userId || data.uid || data.firebaseUid || null;
    }

    // Fallback: cerca nei profili utente
    const profilesSnap = await db
      .collection('profiles')
      .where('playerId', '==', playerId)
      .limit(1)
      .get();

    if (!profilesSnap.empty) {
      return profilesSnap.docs[0].id; // L'ID del documento è l'UID Firebase
    }

    return null;
  } catch (error) {
    console.error(`[getUserIdFromPlayerId] Errore:`, error);
    return null;
  }
}

// =============================================
// CLOUD FUNCTIONS
// =============================================

/**
 * Riepilogo settimanale classifica
 * Ogni lunedì alle 10:00, invia una notifica push agli utenti
 * con la loro posizione attuale e la variazione rispetto alla settimana precedente
 */
export const weeklyRankingDigest = onSchedule({
  schedule: '0 10 * * 1', // Ogni lunedì alle 10:00
  timeZone: 'Europe/Rome',
  region: 'europe-west1',
  secrets: ['VAPID_PRIVATE_KEY'],
  memory: '512MiB',
  timeoutSeconds: 300,
}, async (context) => {
  console.log('🏆 [weeklyRankingDigest] Avvio riepilogo settimanale...');

  try {
    // Recupera tutti i club attivi
    const clubsSnap = await db.collection('clubs').get();
    
    let totalNotifications = 0;
    let totalSuccess = 0;

    for (const clubDoc of clubsSnap.docs) {
      const clubId = clubDoc.id;
      const clubData = clubDoc.data();
      const clubName = clubData.name || 'Club';

      console.log(`📊 Elaborazione club: ${clubName} (${clubId})`);

      // Calcola classifica attuale
      const ranking = await computeClubRanking(clubId);
      
      if (ranking.length === 0) {
        console.log(`  ⚠️ Nessun giocatore con rating per ${clubName}`);
        continue;
      }

      // Salva snapshot settimanale
      await saveRankingSnapshot(clubId, ranking);

      // Invia notifiche a tutti i giocatori
      for (const playerRanking of ranking) {
        totalNotifications++;

        // Trova l'userId Firebase
        const userId = await getUserIdFromPlayerId(clubId, playerRanking.playerId);
        
        if (!userId) {
          console.log(`  ⚠️ Nessun userId per player ${playerRanking.name}`);
          continue;
        }

        // Recupera posizione precedente
        const previousPosition = await getPreviousPosition(clubId, playerRanking.playerId);
        
        // Calcola variazione
        let changeText = '';
        let changeEmoji = '➡️';
        if (previousPosition !== null) {
          const diff = previousPosition - playerRanking.position;
          if (diff > 0) {
            changeText = `(+${diff} posizioni)`;
            changeEmoji = '📈';
          } else if (diff < 0) {
            changeText = `(${diff} posizioni)`;
            changeEmoji = '📉';
          } else {
            changeText = '(invariato)';
          }
        }

        // Prepara payload notifica
        const payload = {
          title: `🏆 Riepilogo Settimanale`,
          body: `Sei al ${playerRanking.position}° posto in classifica ${clubName}! ${changeEmoji} ${changeText}`.trim(),
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: `weekly-ranking-${clubId}`,
          data: {
            type: 'weekly_ranking',
            clubId,
            position: playerRanking.position,
            previousPosition,
            rating: playerRanking.rating,
            url: `/club/${clubId}/classifica`,
          },
        };

        const result = await sendPushToUser(userId, payload);
        if (result.success) {
          totalSuccess++;
          console.log(`  ✅ Notifica inviata a ${playerRanking.name}`);
        }
      }
    }

    console.log(`🏁 [weeklyRankingDigest] Completato: ${totalSuccess}/${totalNotifications} notifiche inviate`);
    return { success: true, sent: totalSuccess, total: totalNotifications };
  } catch (error) {
    console.error('❌ [weeklyRankingDigest] Errore:', error);
    throw error;
  }
});

/**
 * Alert superamento posizione
 * Trigger: quando un match viene salvato, verifica se qualcuno ha superato altri in classifica
 */
export const onRankingChange = onDocumentWritten({
  document: 'clubs/{clubId}/matches/{matchId}',
  region: 'europe-west1',
  secrets: ['VAPID_PRIVATE_KEY'],
}, async (event) => {
  const { clubId, matchId } = event.params;
  
  // Ignora eliminazioni
  if (!event.data?.after?.exists) {
    return null;
  }

  const matchData = event.data.after.data();
  
  // Verifica che il match sia concluso
  if (!matchData.winner || !matchData.completed) {
    return null;
  }

  console.log(`🎾 [onRankingChange] Match completato: ${matchId} in club ${clubId}`);

  try {
    // Recupera club info
    const clubDoc = await db.collection('clubs').doc(clubId).get();
    const clubName = clubDoc.data()?.name || 'Club';

    // Recupera classifica precedente (snapshot più recente)
    const previousRanking = new Map();
    const historySnap = await db
      .collection('clubs')
      .doc(clubId)
      .collection('rankingHistory')
      .get();

    // Costruisci mappa delle posizioni precedenti
    for (const doc of historySnap.docs) {
      const playerId = doc.id;
      const snapshotsSnap = await doc.ref
        .collection('snapshots')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();
      
      if (!snapshotsSnap.empty) {
        const lastSnapshot = snapshotsSnap.docs[0].data();
        previousRanking.set(playerId, lastSnapshot.position);
      }
    }

    // Calcola nuova classifica
    const currentRanking = await computeClubRanking(clubId);

    // Trova chi ha superato chi
    const overtakes = [];
    
    for (const current of currentRanking) {
      const previousPos = previousRanking.get(current.playerId);
      
      if (previousPos && current.position < previousPos) {
        // Questo giocatore è salito in classifica
        // Trova chi è stato superato
        for (const other of currentRanking) {
          const otherPrevPos = previousRanking.get(other.playerId);
          
          if (otherPrevPos && 
              otherPrevPos < previousPos && // L'altro era sopra prima
              other.position > current.position) { // Ora è sotto
            overtakes.push({
              overtaker: current,
              overtaken: other,
            });
          }
        }
      }
    }

    // Invia notifiche per ogni superamento
    let notificationsSent = 0;
    
    for (const { overtaker, overtaken } of overtakes) {
      const userId = await getUserIdFromPlayerId(clubId, overtaken.playerId);
      
      if (!userId) continue;

      const payload = {
        title: `⚠️ Sei stato superato!`,
        body: `${overtaker.name} ti ha superato in classifica ${clubName}. Ora sei al ${overtaken.position}° posto.`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: `overtake-${clubId}-${Date.now()}`,
        requireInteraction: true,
        data: {
          type: 'ranking_overtake',
          clubId,
          overtakerId: overtaker.playerId,
          overtakerName: overtaker.name,
          newPosition: overtaken.position,
          url: `/club/${clubId}/classifica`,
        },
      };

      const result = await sendPushToUser(userId, payload);
      if (result.success) {
        notificationsSent++;
        console.log(`  ✅ Notifica superamento inviata a ${overtaken.name}`);
      }
    }

    console.log(`🏁 [onRankingChange] ${notificationsSent} notifiche di superamento inviate`);
    return { overtakes: overtakes.length, notificationsSent };
  } catch (error) {
    console.error('❌ [onRankingChange] Errore:', error);
    return null;
  }
});

/**
 * Test manuale per debug - Chiamabile da admin
 */
export const testRankingNotification = async (userId, clubId, position, previousPosition = null) => {
  const clubDoc = await db.collection('clubs').doc(clubId).get();
  const clubName = clubDoc.data()?.name || 'Club';

  let changeText = '';
  if (previousPosition !== null) {
    const diff = previousPosition - position;
    if (diff > 0) changeText = `(+${diff} posizioni)`;
    else if (diff < 0) changeText = `(${diff} posizioni)`;
  }

  const payload = {
    title: `🏆 Test Riepilogo Settimanale`,
    body: `Sei al ${position}° posto in classifica ${clubName}! ${changeText}`.trim(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'test-ranking',
    data: {
      type: 'weekly_ranking_test',
      clubId,
      position,
    },
  };

  return sendPushToUser(userId, payload);
};
