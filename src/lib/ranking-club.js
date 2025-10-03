// =============================================
// FILE: src/lib/ranking-club.js
// Scoped club ranking utilities (multi-club)
// =============================================
import { recompute as baseRecompute } from './ranking.js';

/**
 * computeClubRanking
 * Accepts full raw arrays (possibly mixed clubIds) and returns ranking only for a specific club.
 * Legacy-safe: if clubId is 'default-club' include docs missing clubId.
 */
export function computeClubRanking(players = [], matches = [], clubId, options = {}) {
  if (!clubId) {
    console.warn('[computeClubRanking] called without clubId - returning empty');
    return { players: [], matches: [] };
  }
  const legacy = clubId === 'default-club' || clubId === 'sporting-cat';
  const filteredPlayers = players.filter(p => p.clubId === clubId || (legacy && !p.clubId));
  const playerIds = new Set(filteredPlayers.map(p => p.id));
  const filteredMatches = matches.filter(m => {
    const sameClub = m.clubId === clubId || (legacy && !m.clubId);
    if (!sameClub) return false;
    // ensure at least one player belongs to club filtered set (defensive)
    return m.teamA?.some(id => playerIds.has(id)) || m.teamB?.some(id => playerIds.has(id));
  });
  return baseRecompute(filteredPlayers, filteredMatches);
}
