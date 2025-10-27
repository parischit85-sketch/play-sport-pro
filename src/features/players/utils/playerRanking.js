// Utility to compute a single, consistent ranking value for a player
// Priority: calculated (byId) > rating (byId) > player.calculatedRating > tournament.current > tournament.initial > player.rating

export function getEffectiveRanking(player, playersById) {
  if (!player) return null;
  const byId = playersById?.[player.id] || null;

  const candidates = [
    byId?.calculatedRating,
    byId?.rating,
    player.calculatedRating,
    player.tournamentData?.currentRanking,
    player.tournamentData?.initialRanking,
    player.rating,
  ];

  for (const v of candidates) {
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
  }
  return null;
}

export default {
  getEffectiveRanking,
};
