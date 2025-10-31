/**
 * Team Edit Modal - Edit existing team players and name
 */

import React, { useEffect, useMemo, useState } from 'react';
import { X, Users, Search, Save } from 'lucide-react';
import { editTeamPlayers, getTeamsByTournament } from '../../services/teamsService';
import { TEAM_STATUS } from '../../utils/tournamentConstants';
import { useClub } from '../../../../contexts/ClubContext';
import { computeClubRanking } from '../../../../lib/ranking-club';
import { themeTokens } from '../../../../lib/theme';

export default function TeamEditModal({ tournament, clubId, team, onClose, onSuccess }) {
  const T = themeTokens();
  const { players: contextPlayers, matches, leaderboard } = useClub();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [registeredPlayerIds, setRegisteredPlayerIds] = useState(new Set());

  const playersPerTeam = tournament.participantType === 'couples' ? 2 : 4;

  const [formData, setFormData] = useState({
    teamName: team?.teamName || team?.name || '',
    player1: null,
    player2: null,
    player3: null,
    player4: null,
  });

  // Pre-fill selected players from existing team
  useEffect(() => {
    if (!team) return;
    const existing = Array.isArray(team.players) ? team.players : [];
    setFormData((prev) => ({
      ...prev,
      player1: existing[0]
        ? {
            id: existing[0].playerId,
            name: existing[0].playerName,
            rating: existing[0].ranking ?? 1500,
            avatar: existing[0].avatarUrl || null,
          }
        : null,
      player2: existing[1]
        ? {
            id: existing[1].playerId,
            name: existing[1].playerName,
            rating: existing[1].ranking ?? 1500,
            avatar: existing[1].avatarUrl || null,
          }
        : null,
      player3: existing[2]
        ? {
            id: existing[2].playerId,
            name: existing[2].playerName,
            rating: existing[2].ranking ?? 1500,
            avatar: existing[2].avatarUrl || null,
          }
        : null,
      player4: existing[3]
        ? {
            id: existing[3].playerId,
            name: existing[3].playerName,
            rating: existing[3].ranking ?? 1500,
            avatar: existing[3].avatarUrl || null,
          }
        : null,
    }));
  }, [team]);

  // Build players list with RPA ratings (same approach as registration)
  const playersWithRanking = useMemo(() => {
    if (!contextPlayers || contextPlayers.length === 0 || !matches) return [];
    const rankingData = computeClubRanking(contextPlayers, matches, clubId, {
      leaderboardMap: leaderboard,
    });
    const fallback = tournament?.configuration?.defaultRankingForNonParticipants ?? 1500;
    const byId = new Map(rankingData.players.map((p) => [p.id, p]));
    const merged = contextPlayers
      .filter((p) => p.clubId === clubId || p.clubId == null)
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

  // Load players already registered in other teams (exclude current team's players)
  useEffect(() => {
    let cancelled = false;
    async function loadRegistered() {
      try {
        const teams = await getTeamsByTournament(clubId, tournament.id, {
          status: TEAM_STATUS.ACTIVE,
        });
        const ids = new Set();
        teams.forEach((t) => {
          if (t.id === team.id) return; // skip current team
          (t.players || []).forEach((p) => ids.add(p.playerId));
        });
        if (!cancelled) setRegisteredPlayerIds(ids);
      } catch (e) {
        console.warn('⚠️ [TeamEditModal] Failed to load existing teams to filter players:', e);
        if (!cancelled) setRegisteredPlayerIds(new Set());
      }
    }
    if (clubId && tournament?.id && team?.id) {
      loadRegistered();
    }
    return () => {
      cancelled = true;
    };
  }, [clubId, tournament?.id, team?.id]);

  const isPlayerSelected = (playerId) => {
    return [formData.player1, formData.player2, formData.player3, formData.player4]
      .filter(Boolean)
      .some((p) => (p.id || p.userId) === playerId);
  };

  const filteredPlayers = players.filter((p) => {
    const name = (p.name || p.userName || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    const notInOtherTeams = !registeredPlayerIds.has(p.id);
    return name.includes(search) && notInOtherTeams && !isPlayerSelected(p.id);
  });

  const handlePlayerSelect = (position, player) => {
    setFormData((prev) => ({
      ...prev,
      [`player${position}`]: player,
    }));
  };

  const selectedPlayers = useMemo(() => {
    return [formData.player1, formData.player2, formData.player3, formData.player4].filter(Boolean);
  }, [formData]);

  const canSubmit = () =>
    selectedPlayers.length === playersPerTeam && formData.teamName.trim().length > 0;

  const averageRating = useMemo(() => {
    if (selectedPlayers.length === 0) return 0;
    const total = selectedPlayers.reduce((sum, p) => sum + (p.rating || 1500), 0);
    return (total / selectedPlayers.length).toFixed(1);
  }, [selectedPlayers]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canSubmit()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        teamName: formData.teamName,
        players: selectedPlayers.map((p) => ({
          playerId: p.id || p.userId,
          playerName: p.name || p.userName || 'Unknown',
          ranking: p.rating ?? 1500,
          avatarUrl: p.avatar || p.avatarUrl || null,
        })),
      };
      const res = await editTeamPlayers(clubId, tournament.id, team.id, payload);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Errore nel salvataggio della squadra');
      }
    } catch (err) {
      console.error('Error saving team edit:', err);
      setError('Errore nel salvataggio della squadra');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`${T.modalBackground} rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 text-white">Modifica Squadra</h2>
              <p className="text-sm text-gray-400">Aggiorna giocatori e nome squadra</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="mb-4 bg-red-900/20 border border-red-800 rounded-lg p-4">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Nome Squadra *</label>
            <input
              type="text"
              value={formData.teamName}
              onChange={(e) => setFormData((prev) => ({ ...prev, teamName: e.target.value }))}
              className={`${T.input} w-full text-sm`}
              placeholder="es. Rossi / Bianchi"
              required
            />
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-300">
                Giocatori ({playersPerTeam} richiesti)
              </h3>
              <span className="text-sm text-gray-400">
                {selectedPlayers.length} / {playersPerTeam}
              </span>
            </div>

            {[1, 2, 3, 4].slice(0, playersPerTeam).map((position) => (
              <div key={position} className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">
                  Giocatore {position} *
                </label>
                {formData[`player${position}`] ? (
                  <div className="flex items-center justify-between p-3 bg-primary-900/20 border border-primary-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-800 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-300">{position}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-white">
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
                      className="p-2 text-red-600 hover:bg-red-50 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border border-gray-600 rounded-lg overflow-hidden">
                    <div className="p-2 border-b border-gray-700">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 bg-gray-700 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                          placeholder="Cerca giocatore..."
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {loading ? (
                        <div className="p-4 text-center text-gray-500">Caricamento...</div>
                      ) : filteredPlayers.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          {searchTerm ? 'Nessun giocatore trovato' : 'Nessun giocatore disponibile'}
                        </div>
                      ) : (
                        filteredPlayers.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handlePlayerSelect(position, p)}
                            className="w-full p-3 hover:bg-gray-50 hover:bg-gray-700 flex items-center justify-between transition-colors text-left"
                          >
                            <div>
                              <p className="font-medium text-gray-900 text-white">
                                {p.name || p.userName}
                              </p>
                              {p.email && <p className="text-xs text-gray-400">{p.email}</p>}
                            </div>
                            <span className="text-sm text-gray-400">
                              Ranking: {Math.round(p.rating || 1500)}
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

          {selectedPlayers.length > 0 && (
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Ranking Medio Squadra</span>
                <span className="text-lg font-bold text-blue-400">{averageRating}</span>
              </div>
            </div>
          )}
        </form>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:bg-gray-100 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            disabled={!canSubmit() || saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </div>
      </div>
    </div>
  );
}
