// =============================================
// FILE: src/hooks/useCalculatedPlayerRatings.js
// Hook per calcolare i rating reali dei giocatori basati sulle partite
// =============================================

import { useMemo } from 'react';
import { computeClubRanking } from '@lib/ranking-club.js';
import { DEFAULT_RATING } from '@lib/ids.js';

/**
 * Hook per calcolare i rating reali dei giocatori con ottimizzazione delle performance
 * @param {Array} players - Lista dei giocatori
 * @param {Array} matches - Lista delle partite
 * @param {string} clubId - ID del club
 * @returns {Object} Oggetto con playersWithRatings e playersByIdWithRatings
 */
export const useCalculatedPlayerRatings = (players, matches, clubId) => {
  const playersWithRealRating = useMemo(() => {
    if (!clubId || !players || !matches) return players;

    // Filtra i giocatori del torneo
    const tournamentPlayers = players.filter(
      (p) => p.tournamentData?.isParticipant === true && p.tournamentData?.isActive === true
    );

    if (tournamentPlayers.length === 0) return players;

    try {
      // Calcola i ranking reali
      const rankingData = computeClubRanking(tournamentPlayers, matches, clubId);
      const rankingMap = new Map(rankingData.players.map((p) => [p.id, p.rating]));

      // Applica i rating calcolati ai giocatori
      return players.map((p) => ({
        ...p,
        calculatedRating: rankingMap.get(p.id) || p.rating || DEFAULT_RATING,
      }));
    } catch (error) {
      console.warn('Error calculating player ratings:', error);
      return players;
    }
  }, [clubId, players, matches]);

  // Crea playersById con i rating calcolati
  const playersByIdWithRating = useMemo(() => {
    const map = {};
    playersWithRealRating.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [playersWithRealRating]);

  return {
    playersWithRatings: playersWithRealRating,
    playersByIdWithRatings: playersByIdWithRating,
  };
};