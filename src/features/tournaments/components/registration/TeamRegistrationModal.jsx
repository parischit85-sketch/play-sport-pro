/**
 * Team Registration Modal - Modal for adding new teams to tournament
 */

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, Search, Users, Plus } from 'lucide-react';
import { registerTeam, getTeamsByTournament } from '../../services/teamsService';
import { TEAM_STATUS } from '../../utils/tournamentConstants';
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
  
  // Stato per gestire giocatori custom (non nel sistema)
  const [customPlayers, setCustomPlayers] = useState([]);
  const [showAddPlayerForm, setShowAddPlayerForm] = useState(null); // null o numero posizione
  const [newPlayerData, setNewPlayerData] = useState({ name: '', rating: 1500 });

  // Numero di giocatori per squadra - usa il valore dal torneo, con fallback
  const playersPerTeam = tournament.playersPerTeam || 
    (tournament.participantType === 'couples' ? 2 : 4);
  const isCouples = tournament.participantType === 'couples';

  // Genera formData dinamicamente in base al numero di giocatori
  const [formData, setFormData] = useState(() => {
    const initialData = { teamName: '' };
    for (let i = 1; i <= 8; i++) {
      initialData[`player${i}`] = null;
    }
    return initialData;
  });

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

  // Unisci giocatori del club con giocatori custom
  const allAvailablePlayers = useMemo(() => {
    return [...players, ...customPlayers].sort((a, b) => 
      (a.name || '').localeCompare(b.name || '')
    );
  }, [players, customPlayers]);

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

  // Funzione per aggiungere un giocatore custom
  const handleAddCustomPlayer = (position) => {
    if (!newPlayerData.name.trim()) return;

    const customPlayer = {
      id: `custom-${Date.now()}`, // ID temporaneo univoco
      name: newPlayerData.name.trim(),
      userName: newPlayerData.name.trim(),
      rating: parseInt(newPlayerData.rating) || 1500,
      email: null,
      avatar: null,
      isCustom: true, // Flag per identificare giocatori custom
    };

    // Aggiungi alla lista dei custom players
    setCustomPlayers((prev) => [...prev, customPlayer]);

    // Seleziona automaticamente il giocatore appena creato
    handlePlayerSelect(position, customPlayer);

    // Reset form e chiudi
    setNewPlayerData({ name: '', rating: 1500 });
    setShowAddPlayerForm(null);
  };

  const filteredPlayers = allAvailablePlayers.filter((p) => {
    const name = (p.name || p.userName || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    const notInOtherTeams = !registeredPlayerIds.has(p.id);
    return name.includes(search) && notInOtherTeams && !isPlayerSelected(p.id);
  });

  const calculateAverageRating = () => {
    // Raccogli dinamicamente i giocatori selezionati
    const selectedPlayers = [];
    for (let i = 1; i <= playersPerTeam; i++) {
      if (formData[`player${i}`]) {
        selectedPlayers.push(formData[`player${i}`]);
      }
    }

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

    // Conta dinamicamente i giocatori selezionati
    let selectedCount = 0;
    for (let i = 1; i <= playersPerTeam; i++) {
      if (formData[`player${i}`]) {
        selectedCount++;
      }
    }

    return selectedCount === playersPerTeam;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmit()) return;

    setSubmitting(true);
    setError(null);

    try {
      // Raccogli dinamicamente i giocatori in base a playersPerTeam
      const teamPlayers = [];
      for (let i = 1; i <= playersPerTeam; i++) {
        const player = formData[`player${i}`];
        if (player) {
          teamPlayers.push({
            playerId: player.isCustom ? null : (player.id || player.userId), // null per custom players
            playerName: player.name || player.userName || 'Unknown',
            ranking: player.rating || 1500,
            avatarUrl: player.avatar || player.avatarUrl || null,
            isCustom: player.isCustom || false, // Flag per identificare giocatori custom
          });
        }
      }

      const result = await registerTeam({
        clubId: clubId,
        tournamentId: tournament.id,
        teamName: formData.teamName,
        players: teamPlayers,
        registeredBy: user?.uid || 'unknown',
      });

      if (result.success) {
        // ⚠️ Mostra alert se ci sono giocatori duplicati, ma procede comunque
        if (result.warning) {
          alert(`⚠️ ATTENZIONE:\n\n${result.warning}\n\nLa squadra è stata comunque registrata con successo.`);
        }
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

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-2 sm:p-4">
      <div className={`${T.modalBackground} ${T.border} rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className={`${T.headerBg} flex items-center justify-between p-4 sm:p-6 flex-shrink-0`}>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white truncate">Registra Squadra</h2>
              <p className="text-xs sm:text-sm text-gray-400">
                {isCouples ? `Coppia (${playersPerTeam} giocatori)` : `Squadra (${playersPerTeam} giocatori)`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center ring-1 ring-gray-600/50 p-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6">
          {error && (
            <div className="mb-4 bg-red-900/20 border border-red-800 rounded-lg p-3 sm:p-4">
              <p className="text-sm sm:text-base text-red-200">{error}</p>
            </div>
          )}

          {/* Team Name */}
          <div className="mb-4 sm:mb-6">
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
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-300">
                Seleziona Giocatori ({playersPerTeam} richiesti)
              </h3>
              <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0 ml-2">
                {Object.values(formData).filter(Boolean).length} / {playersPerTeam}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {Array.from({ length: playersPerTeam }, (_, i) => i + 1).map((position) => (
                <div key={position} className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-400">
                    Giocatore {position} *
                  </label>

                  {formData[`player${position}`] ? (
                    // Selected player card
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-blue-300">{position}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-medium text-white truncate">
                            {formData[`player${position}`].name ||
                              formData[`player${position}`].userName}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400">
                            Ranking: {Math.round(formData[`player${position}`].rating || 1500)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePlayerSelect(position, null)}
                        className="p-1.5 sm:p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    // Player selector
                    <div className="border border-gray-700 rounded-lg overflow-hidden">
                      {/* Search */}
                      <div className="p-2 border-b border-gray-700 bg-gray-750">
                        <div className="relative">
                          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`${T.input} w-full pl-8 sm:pl-10 text-xs sm:text-sm`}
                            placeholder="Cerca..."
                          />
                        </div>
                      </div>

                      {/* Players list */}
                      <div className="max-h-40 sm:max-h-48 overflow-y-auto">
                        {loading ? (
                          <div className="p-3 sm:p-4 text-center text-sm text-gray-400">Caricamento...</div>
                        ) : (
                          <>
                            {/* Bottone per aggiungere nuovo giocatore */}
                            {showAddPlayerForm === position ? (
                              <div className="p-2 sm:p-3 bg-gray-750 border-b border-gray-700">
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    placeholder="Nome giocatore"
                                    value={newPlayerData.name}
                                    onChange={(e) => setNewPlayerData((prev) => ({ ...prev, name: e.target.value }))}
                                    className={`${T.input} w-full text-sm`}
                                    autoFocus
                                  />
                                  <input
                                    type="number"
                                    placeholder="Ranking (default: 1500)"
                                    value={newPlayerData.rating}
                                    onChange={(e) => setNewPlayerData((prev) => ({ ...prev, rating: e.target.value }))}
                                    className={`${T.input} w-full text-sm`}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleAddCustomPlayer(position)}
                                      className={`${T.btnPrimary} flex-1 text-sm font-medium`}
                                    >
                                      Aggiungi
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setShowAddPlayerForm(null);
                                        setNewPlayerData({ name: '', rating: 1500 });
                                      }}
                                      className={`${T.btnGhost} text-sm`}
                                    >
                                      Annulla
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setShowAddPlayerForm(position)}
                                className="w-full p-2 sm:p-3 bg-blue-900/20 hover:bg-blue-900/30 border-b border-gray-700 flex items-center justify-center gap-2 transition-colors text-blue-400 hover:text-blue-300"
                              >
                                <Plus className="w-4 h-4" />
                                <span className="text-sm font-medium">Aggiungi Nuovo Giocatore</span>
                              </button>
                            )}

                            {/* Lista giocatori esistenti */}
                            {filteredPlayers.length === 0 && !showAddPlayerForm ? (
                              <div className="p-3 sm:p-4 text-center text-xs sm:text-sm text-gray-400">
                                {searchTerm ? 'Nessun giocatore trovato' : 'Nessun giocatore disponibile'}
                              </div>
                            ) : (
                              filteredPlayers.map((player) => (
                                <button
                                  key={player.id}
                                  type="button"
                                  onClick={() => handlePlayerSelect(position, player)}
                                  className="w-full p-2 sm:p-3 hover:bg-gray-700 flex items-center justify-between transition-colors text-left group"
                                >
                                  <div className="min-w-0 flex-1 mr-2">
                                    <p className="text-sm sm:text-base font-medium text-white truncate group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                      {player.name || player.userName}
                                      {player.isCustom && (
                                        <span className="text-xs px-1.5 py-0.5 bg-blue-600/20 text-blue-400 rounded">
                                          Nuovo
                                        </span>
                                      )}
                                    </p>
                                    {player.email && (
                                      <p className="text-xs text-gray-400 truncate hidden sm:block">{player.email}</p>
                                    )}
                                  </div>
                                  <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                                    {Math.round(player.rating || 1500)}
                                  </span>
                                </button>
                              ))
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Average Rating */}
          {Object.values(formData).filter(Boolean).length > 0 && (
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-gray-300">Ranking Medio Squadra</span>
                <span className="text-base sm:text-lg font-bold text-blue-400">{calculateAverageRating()}</span>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-700 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className={`${T.btnGhost} text-sm sm:text-base`}
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit() || submitting}
            className={`${T.btnPrimary} disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 text-sm sm:text-base`}
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">{submitting ? 'Registrazione...' : 'Registra Squadra'}</span>
            <span className="sm:hidden">{submitting ? 'Registra...' : 'Registra'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default TeamRegistrationModal;
