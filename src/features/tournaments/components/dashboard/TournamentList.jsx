/**
 * Tournament List - Display tournaments in a list/grid format
 */

import React from 'react';
import { Trophy, Users, Calendar, ChevronRight } from 'lucide-react';
import {
  formatDate,
  formatTournamentStatus,
  getStatusColorClass,
} from '../../utils/tournamentFormatters';
import { useNavigate } from 'react-router-dom';
import { useClub } from '../../../../contexts/ClubContext';

function TournamentList({ tournaments, onRefresh: _onRefresh }) {
  const navigate = useNavigate();
  const { clubId } = useClub();

  const handleTournamentClick = (tournamentId) => {
    navigate(`/club/${clubId}/tournaments/${tournamentId}`);
  };

  return (
    <div className="divide-y divide-gray-700">
      {tournaments.map((tournament) => (
        <div
          key={tournament.id}
          className="p-6 hover:bg-gray-800 cursor-pointer transition-colors"
          role="button"
          tabIndex={0}
          onClick={() => handleTournamentClick(tournament.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleTournamentClick(tournament.id);
            }
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Tournament Name & Status */}
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-100">{tournament.name}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColorClass(tournament.status)}`}
                >
                  {formatTournamentStatus(tournament.status)}
                </span>
                {tournament.championshipPointsApplied && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-900/50 text-orange-300 border border-orange-700/50">
                    Punti Assegnati
                  </span>
                )}
              </div>

              {/* Description */}
              {tournament.description && (
                <p className="text-sm text-gray-300 mb-3">{tournament.description}</p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-4 h-4" />
                  <span>
                    {tournament.registration.currentTeamsCount} squadre
                    {tournament.participantType === 'couples' ? ' (coppie)' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <Trophy className="w-4 h-4" />
                  <span>{tournament.configuration.numberOfGroups} gironi</span>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>Creato il {formatDate(tournament.createdAt)}</span>
                </div>

                {tournament.statistics.completedMatches > 0 && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <span className="font-medium">
                      {tournament.statistics.completedMatches}/{tournament.statistics.totalMatches}{' '}
                      partite
                    </span>
                  </div>
                )}
              </div>

              {/* Registration Dates */}
              {tournament.registration.opensAt && (
                <div className="mt-3 text-sm text-gray-400">
                  Iscrizioni: {formatDate(tournament.registration.opensAt)}
                  {tournament.registration.closesAt && (
                    <> - {formatDate(tournament.registration.closesAt)}</>
                  )}
                </div>
              )}
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-gray-500 ml-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default TournamentList;
