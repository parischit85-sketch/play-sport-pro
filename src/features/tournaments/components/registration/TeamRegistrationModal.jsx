/**
 * Team Registration Modal - Modal for adding new teams to tournament
 */

import React, { useState, useEffect, useMemo } from 'react';
import { X, UserPlus, Search, Users } from 'lucide-react';
import { registerTeam, getTeamsByTournament } from '../../services/teamsService';
import { TOURNAMENT_FORMAT, TEAM_STATUS } from '../../utils/tournamentConstants';
import { useAuth } from '../../../../contexts/AuthContext';
import { useClub } from '../../../../contexts/ClubContext';
import { computeClubRanking } from '../../../../lib/ranking-club';
import { themeTokens } from '../../../../lib/theme';

function TeamRegistrationModal({ tournament, clubId, onClose, onSuccess }) {
  const T = themeTokens();
  const { user } = useAuth();
  const { players: contextPlayers, matches, leaderboard } = useClub();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [registeredPlayerIds, setRegisteredPlayerIds] = useState(new Set());

  const [formData, setFormData] = useState({
    teamName: '',
    player1: null,
    player2: null,
    player3: null,
    player4: null,
  });

  const playersPerTeam = tournament.participantType === 'couples' ? 2 : 4;
  const isCouples = tournament.participantType === 'couples';

  // Calculate RPA rankings using the same logic as ClassificaPage
  const playersWithRanking = useMemo(() => {
    if (!contextPlayers || contextPlayers.length === 0 || !matches) {
      return [];
    }

    console.log(
      '🎾 [TeamRegistrationModal] Computing RPA rankings (all club players, not only participants)'
    );
    console.log('🎾 [TeamRegistrationModal] Context players:', contextPlayers.length);
    console.log('🎾 [TeamRegistrationModal] Matches:', matches.length);

    // Compute RPA ranking for all club players
    const rankingData = computeClubRanking(contextPlayers, matches, clubId, {
      leaderboardMap: leaderboard,
    });

    const fallback = tournament?.configuration?.defaultRankingForNonParticipants ?? 1500;

    // Merge: ensure every club player is included and assign default ranking when not participant
    const byId = new Map(rankingData.players.map((p) => [p.id, p]));
    const merged = contextPlayers
      .filter((p) => p.clubId === clubId || p.clubId == null) // defensive, match computeClubRanking behavior
      .map((p) => {
        const ranked = byId.get(p.id) || p;
        const isActiveParticipant =
          p.tournamentData?.isParticipant === true && p.tournamentData?.isActive === true;
        return {
          ...ranked,
          id: p.id,
          name: p.name || p.userName,
          email: p.email,
          avatar: p.avatar || p.avatarUrl,
          rating: isActiveParticipant ? (ranked.rating ?? 1500) : fallback,
        };
      });

    console.log(
      '🎾 [TeamRegistrationModal] Players merged for selection:',
      merged.length,
      'fallback:',
      fallback
    );

    // Sort by name
    return merged.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [
    contextPlayers,
    matches,
    clubId,
    leaderboard,
    tournament?.configuration?.defaultRankingForNonParticipants,
  ]);

  useEffect(() => {
    if (playersWithRanking.length > 0) {
      setPlayers(playersWithRanking);
      setLoading(false);
    }
  }, [playersWithRanking]);

  // Load players already registered in other teams for this tournament
  useEffect(() => {
    let cancelled = false;
    async function loadRegistered() {
      try {
        const teams = await getTeamsByTournament(clubId, tournament.id, {
          status: TEAM_STATUS.ACTIVE,
        });
        const ids = new Set();
        teams.forEach((team) => {
          (team.players || []).forEach((p) => ids.add(p.playerId));
        });
        if (!cancelled) setRegisteredPlayerIds(ids);
      } catch (e) {
        console.warn(
          '⚠️ [TeamRegistrationModal] Failed to load existing teams to filter players:',
          e
        );
        if (!cancelled) setRegisteredPlayerIds(new Set());
      }
    }
    if (clubId && tournament?.id) {
      loadRegistered();
    }
    return () => {
      cancelled = true;
    };
  }, [clubId, tournament?.id]);

  // Generate team name from players' last names (supports compound surnames)
  const generateTeamName = (player1, player2, player3, player4) => {
    console.log('🏷️ [generateTeamName] Input players:', { player1, player2, player3, player4 });

    const selectedPlayers = [player1, player2, player3, player4].filter(Boolean);
    console.log('🏷️ [generateTeamName] Selected players count:', selectedPlayers.length);

    if (selectedPlayers.length === 0) return '';

    // Helper: extract surname, preferring structured lastName, else parse with particles
    const particles = new Set([
      'da',
      'de',
      "d'",
      'di',
      'del',
      'della',
      'delle',
      'dei',
      'degli',
      'la',
      'lo',
      'le',
      'gli',
      'van',
      'von',
      'der',
      'den',
      'dos',
      'das',
      'do',
      'los',
      'las',
    ]);

    const extractSurname = (p) => {
      // If a structured lastName exists on the object, use it
      const structuredLast = (p.lastName || p.surname || p.familyName || '').trim();
      if (structuredLast) return structuredLast;

      const fullName = (p.name || p.userName || '').trim();
      if (!fullName) return '';

      // Split on whitespace, keeping apostrophes and hyphens within tokens
      const tokens = fullName.split(/\s+/).filter(Boolean);
      if (tokens.length === 1) return tokens[0];

      // Start from the last token and prepend particles (e.g., De, Della, Lo, Di)
      let i = tokens.length - 1;
      const parts = [tokens[i]];
      i--;
      while (i >= 0) {
        const t = tokens[i];
        const tLower = t.toLowerCase();
        // Include preceding particles/articles as part of the surname
        if (particles.has(tLower)) {
          parts.unshift(t);
          i--;
          continue;
        }
        // If previous token is an apostrophized particle already attached like "D'" in "D'Angelo"
        // it's usually a single token (last), so nothing to add here.
        break;
      }

      return parts.join(' ');
    };

    const lastNames = selectedPlayers.map((p) => {
      const ln = extractSurname(p);
      console.log(
        '🏷️ [generateTeamName] Player:',
        p.id,
        'Surname parsed:',
        ln,
        'from:',
        p.name || p.userName
      );
      return ln || (p.name || p.userName || '').trim();
    });

    const teamName = lastNames.join(' / ');
    console.log('🏷️ [generateTeamName] Generated team name:', teamName);
    return teamName;
  };

  const handlePlayerSelect = (position, player) => {
    console.log('👆 [handlePlayerSelect] Position:', position, 'Player:', player);

    setFormData((prev) => {
      console.log('👆 [handlePlayerSelect] Previous formData:', prev);

      const updated = {
        ...prev,
        [`player${position}`]: player,
      };

      console.log('👆 [handlePlayerSelect] Updated formData:', updated);

      // Auto-generate team name if it's empty OR if it looks auto-generated (contains only surnames)
      const currentName = prev.teamName.trim();
      // Check if current name matches auto-generated pattern (only letters and " / ")
      const isAutoGeneratedPattern = /^[a-zA-ZÀ-ÿ\s]+(\s\/\s[a-zA-ZÀ-ÿ\s]+)*$/.test(currentName);
      const shouldAutoGenerate = !currentName || isAutoGeneratedPattern;

      console.log('👆 [handlePlayerSelect] Current name:', currentName);
      console.log('👆 [handlePlayerSelect] Is auto-generated pattern:', isAutoGeneratedPattern);
      console.log('👆 [handlePlayerSelect] Should auto-generate:', shouldAutoGenerate);

      if (shouldAutoGenerate) {
        updated.teamName = generateTeamName(
          updated.player1,
          updated.player2,
          updated.player3,
          updated.player4
        );
        console.log('👆 [handlePlayerSelect] New team name:', updated.teamName);
      }

      return updated;
    });
  };

  const isPlayerSelected = (playerId) => {
    return Object.values(formData).some((p) => p && p.id === playerId);
  };

  const filteredPlayers = players.filter((p) => {
    const name = (p.name || p.userName || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    const notInOtherTeams = !registeredPlayerIds.has(p.id);
    return name.includes(search) && notInOtherTeams && !isPlayerSelected(p.id);
  });

  const calculateAverageRating = () => {
    const selectedPlayers = [
      formData.player1,
      formData.player2,
      formData.player3,
      formData.player4,
    ].filter(Boolean);

    console.log('📊 [calculateAverageRating] Selected players for average:', selectedPlayers);

    if (selectedPlayers.length === 0) return 0;

    const totalRating = selectedPlayers.reduce((sum, p) => {
      // Use player.rating which is the RPA ranking from classifica
      const rating = p.rating || 1500;
      const playerName = p.name || p.userName || 'Unknown';
      console.log(
        '📊 [calculateAverageRating] Player:',
        playerName,
        'Rating:',
        rating,
        'Raw p.rating:',
        p.rating
      );
      return sum + rating;
    }, 0);

    const average = (totalRating / selectedPlayers.length).toFixed(1);
    console.log('📊 [calculateAverageRating] Average rating:', average);
    return average;
  };

  const canSubmit = () => {
    if (!formData.teamName.trim()) return false;

    const selectedCount = [
      formData.player1,
      formData.player2,
      formData.player3,
      formData.player4,
    ].filter(Boolean).length;

    return selectedCount === playersPerTeam;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmit()) return;

    setSubmitting(true);
    setError(null);

    try {
      const teamPlayers = [formData.player1, formData.player2, formData.player3, formData.player4]
        .filter(Boolean)
        .map((p) => ({
          playerId: p.id || p.userId,
          playerName: p.name || p.userName || 'Unknown',
          ranking: p.rating || 1500,
          avatarUrl: p.avatar || p.avatarUrl || null,
        }));

      const result = await registerTeam({
        clubId: clubId,
        tournamentId: tournament.id,
        teamName: formData.teamName,
        players: teamPlayers,
        registeredBy: user?.uid || 'unknown',
      });

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Errore nella registrazione');
      }
    } catch (err) {
      console.error('Error submitting team:', err);
      setError('Errore nella registrazione della squadra');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-bold text-white">Registra Squadra</h2>
              <p className="text-sm text-gray-400">
                {isCouples ? 'Coppia (2 giocatori)' : 'Squadra (4 giocatori)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="mb-4 bg-red-900/20 border border-red-800 rounded-lg p-4">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Team Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome {isCouples ? 'Coppia' : 'Squadra'} *
            </label>
            <input
              type="text"
              value={formData.teamName}
              onChange={(e) => setFormData((prev) => ({ ...prev, teamName: e.target.value }))}
              className={`${T.input} w-full text-sm`}
              placeholder={isCouples ? 'es. Rossi/Bianchi' : 'es. Dream Team'}
              required
            />
          </div>

          {/* Player Selection */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-300">
                Seleziona Giocatori ({playersPerTeam} richiesti)
              </h3>
              <span className="text-sm text-gray-400">
                {Object.values(formData).filter(Boolean).length} / {playersPerTeam}
              </span>
            </div>

            {[1, 2, 3, 4].slice(0, playersPerTeam).map((position) => (
              <div key={position} className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">
                  Giocatore {position} *
                </label>

                {formData[`player${position}`] ? (
                  // Selected player card
                  <div className="flex items-center justify-between p-3 bg-primary-900/20 border border-primary-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-800 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-300">
                          {position}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {formData[`player${position}`].name ||
                            formData[`player${position}`].userName}
                        </p>
                        <p className="text-sm text-gray-400">
                          Ranking: {Math.round(formData[`player${position}`].rating || 1500)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePlayerSelect(position, null)}
                      className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  // Player selector
                  <div className="border border-gray-700 rounded-lg overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-gray-700">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-700 border-0 rounded-lg text-sm text-white focus:ring-2 focus:ring-primary-500"
                          placeholder="Cerca giocatore..."
                        />
                      </div>
                    </div>

                    {/* Players list */}
                    <div className="max-h-48 overflow-y-auto">
                      {loading ? (
                        <div className="p-4 text-center text-gray-500">Caricamento...</div>
                      ) : filteredPlayers.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          {searchTerm ? 'Nessun giocatore trovato' : 'Nessun giocatore disponibile'}
                        </div>
                      ) : (
                        filteredPlayers.map((player) => (
                          <button
                            key={player.id}
                            type="button"
                            onClick={() => handlePlayerSelect(position, player)}
                            className="w-full p-3 hover:bg-gray-700 flex items-center justify-between transition-colors text-left"
                          >
                            <div>
                              <p className="font-medium text-white">
                                {player.name || player.userName}
                              </p>
                              {player.email && (
                                <p className="text-xs text-gray-400">
                                  {player.email}
                                </p>
                              )}
                            </div>
                            <span className="text-sm text-gray-400">
                              Ranking: {Math.round(player.rating || 1500)}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Average Rating */}
          {Object.values(formData).filter(Boolean).length > 0 && (
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">
                  Ranking Medio Squadra
                </span>
                <span className="text-lg font-bold text-blue-400">
                  {calculateAverageRating()}
                </span>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit() || submitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            {submitting ? 'Registrazione...' : 'Registra Squadra'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeamRegistrationModal;


