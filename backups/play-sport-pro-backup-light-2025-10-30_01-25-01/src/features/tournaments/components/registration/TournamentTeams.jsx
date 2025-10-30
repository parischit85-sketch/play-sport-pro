/**
 * Tournament Teams - Display and manage registered teams
 */

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Pencil } from 'lucide-react';
import { getTeamsByTournament, deleteTeam, assignTeamToGroup } from '../../services/teamsService';
import { TOURNAMENT_STATUS, GROUP_NAMES } from '../../utils/tournamentConstants';
import { updateTournament } from '../../services/tournamentService';
import TeamRegistrationModal from './TeamRegistrationModal';
import TeamEditModal from './TeamEditModal';

function TournamentTeams({ tournament, onUpdate, clubId }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);
  const [manualGroups, setManualGroups] = useState({}); // teamId -> groupId
  const [savingManual, setSavingManual] = useState(false);

  useEffect(() => {
    loadTeams();
  }, [tournament.id, clubId]);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const data = await getTeamsByTournament(clubId, tournament.id);
      setTeams(data || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa squadra?')) {
      return;
    }

    try {
      await deleteTeam(clubId, tournament.id, teamId);
      loadTeams();
      onUpdate();
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Errore nell\'eliminazione della squadra');
    }
  };

  const handleRegistrationSuccess = () => {
    setShowRegistrationModal(false);
    loadTeams();
    onUpdate();
  };

  
  const canEditTeams = [
    TOURNAMENT_STATUS.REGISTRATION_OPEN,
    TOURNAMENT_STATUS.GROUPS_GENERATION,
    TOURNAMENT_STATUS.GROUPS_PHASE,
  ].includes(tournament.status);

  const handleEditClick = (team) => {
    setTeamToEdit(team);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setTeamToEdit(null);
    loadTeams();
    onUpdate();
  };

  const canRegister = tournament.status === TOURNAMENT_STATUS.REGISTRATION_OPEN;
  const canAssignGroups = tournament.status === TOURNAMENT_STATUS.GROUPS_GENERATION;

  const numberOfGroups = tournament.configuration?.numberOfGroups || tournament.groupsConfig?.numberOfGroups || 4;
  const teamsPerGroup = tournament.configuration?.teamsPerGroup || tournament.groupsConfig?.teamsPerGroup || 4;

  const groupOptions = GROUP_NAMES.slice(0, numberOfGroups);

  const handleManualAssignChange = (teamId, groupId) => {
    setManualGroups((prev) => ({ ...prev, [teamId]: groupId || undefined }));
  };

  const handleSaveManualGroups = async () => {
    // Build groups map
    const groupsMap = new Map(); // groupId -> teamId[]
    for (const gid of groupOptions) groupsMap.set(gid, []);

    teams.forEach((t) => {
      const g = manualGroups[t.id];
      if (g) groupsMap.get(g)?.push(t);
    });

    // Validate assignments
    for (const gid of groupOptions) {
      const arr = groupsMap.get(gid) || [];
      if (arr.length > teamsPerGroup) {
        alert(`Il girone ${gid} ha ${arr.length} squadre (max ${teamsPerGroup}).`);
        return;
      }
    }

    const totalAssigned = Array.from(groupsMap.values()).reduce((s, arr) => s + arr.length, 0);
    if (totalAssigned !== numberOfGroups * teamsPerGroup) {
      if (!window.confirm(`Hai assegnato ${totalAssigned}/${numberOfGroups * teamsPerGroup} squadre. Procedere comunque?`)) {
        return;
      }
    }

    setSavingManual(true);
    try {
      // Persist assignments (groupPosition by index)
      const promises = [];
      for (const gid of groupOptions) {
        const arr = groupsMap.get(gid) || [];
        arr.forEach((team, idx) => {
          promises.push(assignTeamToGroup(clubId, tournament.id, team.id, gid, idx + 1));
        });
      }
      await Promise.all(promises);

      // Prepare groups summary for tournament document
      const groupsSummary = groupOptions.map((gid) => ({
        id: gid,
        name: `Girone ${gid}`,
        teamIds: (groupsMap.get(gid) || []).map((t) => t.id),
        teamsCount: (groupsMap.get(gid) || []).length,
        qualifiedCount: 0,
      }));

      // Update tournament: set groups and advance phase
      const res = await updateTournament(clubId, tournament.id, {
        groups: groupsSummary,
        status: TOURNAMENT_STATUS.GROUPS_PHASE,
        'configuration.generatedAt': new Date().toISOString(),
        phaseHistory: [
          ...(tournament.phaseHistory || []),
          { from: tournament.status, to: TOURNAMENT_STATUS.GROUPS_PHASE, timestamp: new Date().toISOString() },
        ],
      });
      if (!res.success) throw new Error(res.error || 'Errore aggiornamento torneo');

      setManualGroups({});
      await loadTeams();
      onUpdate();
    } catch (err) {
      console.error('Errore salvataggio gironi manuali:', err);
      alert('Errore nel salvataggio dei gironi: ' + (err.message || ''));
    } finally {
      setSavingManual(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {canAssignGroups && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Assegna Gironi Manualmente</h3>
          <p className="text-sm text-gray-400 mb-4">Seleziona il girone per ogni squadra (max {teamsPerGroup} per girone).</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {teams.map((team) => (
              <div key={team.id} className="border border-gray-700 rounded-lg p-3 bg-gray-700/30">
                <div className="font-medium text-white mb-2">{team.teamName}</div>
                <select
                  value={manualGroups[team.id] || ''}
                  onChange={(e) => handleManualAssignChange(team.id, e.target.value || undefined)}
                  className="w-full p-2 rounded border border-gray-600 bg-gray-800 text-gray-100"
                >
                  <option value="">— Seleziona Girone —</option>
                  {groupOptions.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button
            onClick={handleSaveManualGroups}
            disabled={savingManual}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {savingManual ? 'Salvataggio...' : 'Salva Gironi'}
          </button>
        </div>
      )}
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Squadre Registrate ({teams.length})
        </h2>
        {canRegister && (
          <button
            onClick={() => setShowRegistrationModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <UserPlus className="w-4 h-4" />
            Aggiungi Squadra
          </button>
        )}
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <TeamRegistrationModal
          tournament={tournament}
          clubId={clubId}
          onClose={() => setShowRegistrationModal(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}

      {showEditModal && teamToEdit && (
        <TeamEditModal
          tournament={tournament}
          clubId={clubId}
          team={teamToEdit}
          onClose={() => {
            setShowEditModal(false);
            setTeamToEdit(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Teams List */}
      {teams.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Nessuna squadra registrata
          </h3>
          <p className="text-gray-400 mb-4">
            {canRegister 
              ? 'Inizia aggiungendo la prima squadra al torneo'
              : 'Le iscrizioni sono chiuse'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-gray-800 rounded-lg border border-gray-700 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">
                    {team.teamName || team.name || 'Squadra senza nome'}
                  </h3>
                  {team.seed && (
                    <span className="text-sm text-gray-400">
                      Seed #{team.seed}
                    </span>
                  )}
                </div>
                {canEditTeams && (
                  <button
                    onClick={() => handleEditClick(team)}
                    className="p-1 text-primary-600 hover:bg-primary-900/20 rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {team.players?.map((player, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">{idx + 1}</span>
                    </div>
                    <span className="text-gray-300">
                      {player.playerName || player.name || `Giocatore ${idx + 1}`}
                    </span>
                    {(player.ranking !== null && player.ranking !== undefined) && (
                      <span className="ml-auto text-gray-400">
                        Rank: {player.ranking}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {(team.averageRanking !== null && team.averageRanking !== undefined) && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Ranking Medio</span>
                    <span className="font-medium text-white">
                      {team.averageRanking.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}

              {canRegister && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => handleDelete(team.id)}
                    className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                    Elimina squadra
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TournamentTeams;

