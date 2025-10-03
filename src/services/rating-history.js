/**
 * Rating History Service
 *
 * Gestisce lo storico dei rating dei giocatori per garantire
 * che i calcoli RPA usino i rating corretti alla data della partita.
 *
 * Schema Firebase:
 * /clubs/{clubId}/playerRatingHistory/{playerId}/ratings/[
 *   { date: "2025-09-20T10:30:00.000Z", rating: 1250, matchId: "abc123" }
 * ]
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase.js';
import { DEFAULT_RATING } from '../lib/ids.js';

/**
 * Salva uno snapshot del rating di un giocatore in una data specifica
 * @param {string} clubId - ID del club
 * @param {string} playerId - ID del giocatore
 * @param {string} date - Data ISO della partita
 * @param {number} rating - Rating del giocatore al momento
 * @param {string} matchId - ID della partita che ha causato questo rating
 */
export async function savePlayerRatingSnapshot(clubId, playerId, date, rating, matchId) {
  try {
    const ratingDoc = doc(db, 'clubs', clubId, 'playerRatingHistory', playerId, 'ratings', date);

    await setDoc(ratingDoc, {
      date,
      rating: Number(rating),
      matchId,
      timestamp: new Date().toISOString(),
    });

    console.log(`💾 Rating snapshot saved: Player ${playerId} = ${rating} on ${date}`);
  } catch (error) {
    console.error('❌ Error saving rating snapshot:', error);
    throw error;
  }
}

/**
 * Trova il rating di un giocatore alla data più vicina (precedente o uguale)
 * alla data della partita
 * @param {string} clubId - ID del club
 * @param {string} playerId - ID del giocatore
 * @param {string} matchDate - Data ISO della partita
 * @returns {Promise<number>} Rating del giocatore alla data
 */
export async function getPlayerRatingAtDate(clubId, playerId, matchDate) {
  try {
    // Query per trovare tutti i rating <= matchDate, ordinati per data DESC
    const ratingsRef = collection(db, 'clubs', clubId, 'playerRatingHistory', playerId, 'ratings');

    const q = query(ratingsRef, where('date', '<=', matchDate), orderBy('date', 'desc'), limit(1));

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const ratingData = snapshot.docs[0].data();
      console.log(
        `📊 Historical rating found: Player ${playerId} = ${ratingData.rating} on ${ratingData.date}`
      );
      return ratingData.rating;
    }

    // Se non ci sono rating storici, usa il rating base di default
    console.log(`⚠️ No historical rating found for player ${playerId}, using DEFAULT_RATING`);
    return DEFAULT_RATING;
  } catch (error) {
    console.error('❌ Error getting historical rating:', error);
    // Fallback al rating di default in caso di errore
    return DEFAULT_RATING;
  }
}

/**
 * Ottiene i rating storici per tutti i giocatori di una partita
 * @param {string} clubId - ID del club
 * @param {Array<string>} playerIds - Array di ID giocatori
 * @param {string} matchDate - Data ISO della partita
 * @returns {Promise<Object>} Mappa playerId -> rating storico
 */
export async function getHistoricalRatings(clubId, playerIds, matchDate) {
  try {
    const historicalRatings = {};

    // Ottieni il rating storico per ogni giocatore in parallelo
    await Promise.all(
      playerIds.map(async (playerId) => {
        if (playerId) {
          historicalRatings[playerId] = await getPlayerRatingAtDate(clubId, playerId, matchDate);
        }
      })
    );

    console.log(
      `📊 Historical ratings retrieved for ${playerIds.length} players on ${matchDate}:`,
      historicalRatings
    );
    return historicalRatings;
  } catch (error) {
    console.error('❌ Error getting historical ratings for multiple players:', error);
    // Fallback: usa rating di default per tutti
    const fallbackRatings = {};
    playerIds.forEach((playerId) => {
      if (playerId) fallbackRatings[playerId] = DEFAULT_RATING;
    });
    return fallbackRatings;
  }
}

/**
 * Salva i rating di tutti i giocatori di una partita PRIMA del calcolo
 * Questo preserva il loro stato pre-match per future reference
 * @param {string} clubId - ID del club
 * @param {Array<string>} playerIds - Array di ID giocatori
 * @param {Object} playersById - Mappa di giocatori con rating attuali
 * @param {string} matchDate - Data ISO della partita
 * @param {string} matchId - ID della partita
 */
export async function savePreMatchRatings(clubId, playerIds, playersById, matchDate, matchId) {
  try {
    await Promise.all(
      playerIds.map(async (playerId) => {
        if (playerId && playersById[playerId]) {
          const currentRating = playersById[playerId].rating ?? DEFAULT_RATING;
          await savePlayerRatingSnapshot(
            clubId,
            playerId,
            matchDate,
            currentRating,
            `pre-${matchId}`
          );
        }
      })
    );

    console.log(`💾 Pre-match ratings saved for match ${matchId} on ${matchDate}`);
  } catch (error) {
    console.error('❌ Error saving pre-match ratings:', error);
    throw error;
  }
}

/**
 * Pulisce i rating storici più vecchi di una data specifica
 * (da usare per manutenzione del database)
 * @param {string} clubId - ID del club
 * @param {string} cutoffDate - Data limite (ISO string)
 */
export async function cleanupOldRatings(clubId, cutoffDate) {
  try {
    // Implementation per cleanup - da implementare se necessario
    console.log(`🧹 Cleanup old ratings before ${cutoffDate} for club ${clubId}`);
  } catch (error) {
    console.error('❌ Error during rating cleanup:', error);
    throw error;
  }
}

/**
 * Migra i rating esistenti creando uno snapshot iniziale per ogni giocatore
 * @param {string} clubId - ID del club
 * @param {Array} players - Array di giocatori con rating attuali
 * @param {string} migrationDate - Data di migrazione (ISO string)
 */
export async function migrateExistingRatings(clubId, players, migrationDate) {
  try {
    console.log(`🔄 Starting rating migration for ${players.length} players...`);

    await Promise.all(
      players.map(async (player) => {
        if (player.id) {
          const currentRating = player.rating ?? DEFAULT_RATING;
          await savePlayerRatingSnapshot(
            clubId,
            player.id,
            migrationDate,
            currentRating,
            'MIGRATION'
          );
        }
      })
    );

    console.log(`✅ Rating migration completed for club ${clubId}`);
  } catch (error) {
    console.error('❌ Error during rating migration:', error);
    throw error;
  }
}
