import { describe, it, expect } from 'vitest';
import { computeClubRanking } from '../ranking-club.js';

// We need a lightweight mock for base ranking algo used in ranking.js if it applies complex logic.
// For now we assume ranking.js recompute returns players with same order as input enriched with score.
// If ranking.js has more complex behavior, extend fixtures accordingly.

describe('computeClubRanking', () => {
  const players = [
    { id: 'p1', clubId: 'clubA', rating: 1200 },
    { id: 'p2', clubId: 'clubA', rating: 1180 },
    { id: 'p3', clubId: 'clubB', rating: 1210 },
    { id: 'legacy1', rating: 1100 }, // legacy no club
  ];
  const matches = [
    { id: 'm1', clubId: 'clubA', teamA: ['p1'], teamB: ['p2'] },
    { id: 'm2', clubId: 'clubB', teamA: ['p3'], teamB: ['p1'] }, // cross club should only count for clubB if player belongs?
    { id: 'm3', teamA: ['legacy1'], teamB: ['p1'] }, // legacy match no clubId
  ];

  it('returns empty if clubId missing', () => {
    const res = computeClubRanking(players, matches, null);
    expect(res.players).toEqual([]);
    expect(res.matches).toEqual([]);
  });

  it('filters players and matches for a specific club', () => {
    const res = computeClubRanking(players, matches, 'clubA');
    // Should exclude p3 (clubB) and legacy1 (no club) because clubA is not legacy id
    expect(res.players.every(p => p.clubId === 'clubA')).toBe(true);
  });

  it('includes legacy players when club is default-club (legacy mode)', () => {
    const res = computeClubRanking(players, matches, 'default-club');
    const ids = res.players.map(p => p.id);
    expect(ids).toContain('legacy1');
  });

  it('ensures matches only with club players appear', () => {
    const res = computeClubRanking(players, matches, 'clubB');
    // m2 has p3 (clubB) so allowed; m1 is clubA; m3 legacy but should not include because no clubB players in both sides
    const matchIds = res.matches.map(m => m.id);
    expect(matchIds).toContain('m2');
    expect(matchIds).not.toContain('m1');
  });
});
