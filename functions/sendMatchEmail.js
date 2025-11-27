// =============================================
// FILE: functions/sendMatchEmail.js
// Cloud Function per email partite competitive
// =============================================

import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import emailService from './emailService.js';
import {
  matchInvitationTemplate,
  matchResultTemplate,
} from './emailTemplates.js';

if (getApps().length === 0) {
  initializeApp();
}
const db = getFirestore();

/**
 * Invia email quando viene creato un nuovo match
 */
export const onMatchCreated = onDocumentCreated(
  {
    document: 'matches/{matchId}',
    region: 'europe-west1',
    memory: '256MiB',
  },
  async (event) => {
    const match = event.data.data();
    const matchId = event.params.matchId;

    console.log(`📧 [Match Created] Processing match: ${matchId}`);

    try {
      // Ottieni dati club
      const clubDoc = await db.collection('clubs').doc(match.clubId).get();
      const club = clubDoc.data();

      // Ottieni giocatori
      const player1Doc = await db.collection('users').doc(match.player1Id).get();
      const player2Doc = await db.collection('users').doc(match.player2Id).get();

      const player1 = player1Doc.data();
      const player2 = player2Doc.data();

      // Invia invito a player2
      if (player2?.email && player2.communicationPreferences?.email !== false) {
        const emailData = matchInvitationTemplate({
          playerName: player2.displayName || player2.email,
          clubName: club.name,
          clubLogo: club.logoUrl,
          matchType: match.type || 'Singles',
          opponent: player1.displayName || player1.email,
          date: match.date,
          time: match.time,
          courtName: match.courtName || 'Campo TBD',
          matchId,
          primaryColor: club.primaryColor || '#2563eb',
        });

        await emailService.sendEmail({
          to: player2.email,
          subject: emailData.subject,
          text: emailData.text,
          html: emailData.html,
        });

        console.log(`✅ [Match Created] Invitation sent to ${player2.email}`);
      }

    } catch (error) {
      console.error(`❌ [Match Created] Error:`, error);
    }
  }
);

/**
 * Invia email quando viene aggiornato il risultato di un match
 */
export const onMatchUpdated = onDocumentUpdated(
  {
    document: 'matches/{matchId}',
    region: 'europe-west1',
    memory: '256MiB',
  },
  async (event) => {
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();
    const matchId = event.params.matchId;

    // Controlla se è stato aggiunto un risultato
    if (!beforeData.score && afterData.score && afterData.winnerId) {
      console.log(`📧 [Match Updated] Match completed: ${matchId}`);

      try {
        // Ottieni dati club
        const clubDoc = await db.collection('clubs').doc(afterData.clubId).get();
        const club = clubDoc.data();

        // Ottieni giocatori
        const player1Doc = await db.collection('users').doc(afterData.player1Id).get();
        const player2Doc = await db.collection('users').doc(afterData.player2Id).get();

        const player1 = player1Doc.data();
        const player2 = player2Doc.data();

        // Calcola variazioni ELO (se disponibili)
        const player1EloChange = afterData.player1EloChange || 0;
        const player2EloChange = afterData.player2EloChange || 0;

        // Ottieni nuovo ranking (query dalla collezione ranking o calcolo)
        const player1Ranking = await getUserRanking(afterData.clubId, afterData.player1Id);
        const player2Ranking = await getUserRanking(afterData.clubId, afterData.player2Id);

        const winner = afterData.winnerId === afterData.player1Id ? player1 : player2;

        // Invia email a player1
        if (player1?.email && player1.communicationPreferences?.email !== false) {
          const emailData = matchResultTemplate({
            playerName: player1.displayName || player1.email,
            clubName: club.name,
            clubLogo: club.logoUrl,
            matchType: afterData.type || 'Singles',
            opponent: player2.displayName || player2.email,
            score: afterData.score,
            winner: winner.displayName || winner.email,
            eloChange: player1EloChange,
            newRanking: player1Ranking,
            date: afterData.date,
            primaryColor: club.primaryColor || '#2563eb',
          });

          await emailService.sendEmail({
            to: player1.email,
            subject: emailData.subject,
            text: emailData.text,
            html: emailData.html,
          });

          console.log(`✅ [Match Updated] Result sent to ${player1.email}`);
        }

        // Invia email a player2
        if (player2?.email && player2.communicationPreferences?.email !== false) {
          const emailData = matchResultTemplate({
            playerName: player2.displayName || player2.email,
            clubName: club.name,
            clubLogo: club.logoUrl,
            matchType: afterData.type || 'Singles',
            opponent: player1.displayName || player1.email,
            score: afterData.score,
            winner: winner.displayName || winner.email,
            eloChange: player2EloChange,
            newRanking: player2Ranking,
            date: afterData.date,
            primaryColor: club.primaryColor || '#2563eb',
          });

          await emailService.sendEmail({
            to: player2.email,
            subject: emailData.subject,
            text: emailData.text,
            html: emailData.html,
          });

          console.log(`✅ [Match Updated] Result sent to ${player2.email}`);
        }

      } catch (error) {
        console.error(`❌ [Match Updated] Error:`, error);
      }
    }
  }
);

/**
 * Helper: Ottieni ranking utente nel club
 */
async function getUserRanking(clubId, userId) {
  try {
    const rankingQuery = await db
      .collection('rankings')
      .where('clubId', '==', clubId)
      .orderBy('eloRating', 'desc')
      .get();

    let position = 1;
    for (const doc of rankingQuery.docs) {
      if (doc.data().userId === userId) {
        return position;
      }
      position++;
    }

    return position;
  } catch (error) {
    console.error('Error getting user ranking:', error);
    return 0;
  }
}

export default {
  onMatchCreated,
  onMatchUpdated,
};
