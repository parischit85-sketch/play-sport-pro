/**
 * Tournament Details Page - Complete tournament management interface
 * Provides tabs for Overview, Teams, Matches, Standings, and Bracket
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, USER_ROLES } from '../../../contexts/AuthContext';
import {
  ArrowLeft,
  Trophy,
  Users,
  Calendar,
  BarChart,
  Network,
  Settings,
  CheckCircle,
} from 'lucide-react';
import { getTournamentById } from '../services/tournamentService';
import { getChampionshipApplyStatus } from '../services/championshipApplyService';
import { TOURNAMENT_STATUS } from '../utils/tournamentConstants';
import { formatTournamentStatus, formatDateRange } from '../utils/tournamentFormatters';

// Tab components (will create these next)
import TournamentOverview from './dashboard/TournamentOverview';
import TournamentTeams from './registration/TournamentTeams';
import TournamentMatches from './matches/TournamentMatches';
import TournamentStandings from './standings/TournamentStandings';
import TournamentBracket from './knockout/TournamentBracket';
import TournamentPoints from './points/TournamentPoints';

const TABS = [
  { id: 'overview', label: 'Panoramica', icon: Trophy },
  { id: 'teams', label: 'Squadre', icon: Users },
  { id: 'standings', label: 'Gironi', icon: BarChart },
  { id: 'matches', label: 'Partite', icon: Calendar },
  { id: 'bracket', label: 'Tabellone', icon: Network },
  { id: 'points', label: 'Punti', icon: CheckCircle },
];

function TournamentDetailsPage({ clubId }) {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { userRole, userClubRoles } = useAuth();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  const [pointsApplied, setPointsApplied] = useState(false);
  const [animateIn, setAnimateIn] = useState(true);

  // Determina se l'utente è un club admin
  // Note: club role can be either 'admin' or 'club_admin' depending on the data source
  const isClubAdmin =
    userRole === USER_ROLES.CLUB_ADMIN ||
    userRole === USER_ROLES.SUPER_ADMIN ||
    (clubId &&
      (userClubRoles?.[clubId] === USER_ROLES.CLUB_ADMIN || userClubRoles?.[clubId] === 'admin'));

  // Filtra le tab in base al ruolo dell'utente e allo stato dei punti
  // Per non-admin: mostra punti solo se sono stati applicati
  let visibleTabs = TABS;
  if (!isClubAdmin && !pointsApplied) {
    visibleTabs = TABS.filter((tab) => tab.id !== 'points');
  }

  const loadTournament = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTournamentById(clubId, tournamentId);
      if (data) {
        setTournament(data);
        // Controlla se i punti sono stati applicati
        try {
          const applyStatus = await getChampionshipApplyStatus(clubId, tournamentId);
          setPointsApplied(!!applyStatus.applied);
        } catch (e) {
          console.warn('Impossibile caricare lo stato dei punti:', e);
          setPointsApplied(false);
        }
      } else {
        setError('Torneo non trovato');
      }
    } catch (err) {
      console.error('Error loading tournament:', err);
      setError('Errore nel caricamento del torneo');
    } finally {
      setLoading(false);
    }
  }, [clubId, tournamentId]);

  useEffect(() => {
    loadTournament();
  }, [loadTournament]);

  // Simple slide-in animation on tab change (mobile focus)
  useEffect(() => {
    setAnimateIn(false);
    const id = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(id);
  }, [activeTab]);

  // No side arrows: horizontal tab bar is used across breakpoints

  const handleBack = () => {
    navigate(`/club/${clubId}/tournaments`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Caricamento torneo...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {error || 'Torneo non trovato'}
          </h3>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Torna ai Tornei
          </button>
        </div>
      </div>
    );
  }

  const statusColor =
    {
      [TOURNAMENT_STATUS.DRAFT]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      [TOURNAMENT_STATUS.REGISTRATION_OPEN]:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      [TOURNAMENT_STATUS.REGISTRATION_CLOSED]:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      [TOURNAMENT_STATUS.GROUPS_GENERATION]:
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      [TOURNAMENT_STATUS.GROUPS_PHASE]:
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      [TOURNAMENT_STATUS.KNOCKOUT_PHASE]:
        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      [TOURNAMENT_STATUS.COMPLETED]:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      [TOURNAMENT_STATUS.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }[tournament.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Mobile Optimized */}
      <div className="sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="px-3 sm:px-4 py-2 sm:py-3">
          {/* Back button and title */}
          <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={handleBack}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                title="Torna ai tornei"
                aria-label="Torna ai tornei"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {tournament.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                  {formatDateRange(tournament.startDate, tournament.endDate)}
                </p>
              </div>
            </div>

            {/* Status badge and settings */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <span
                className={`hidden sm:inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
              >
                {formatTournamentStatus(tournament.status)}
              </span>
              {/* Mobile: status as dot */}
              <div
                className={`sm:hidden w-2 h-2 rounded-full ${statusColor.includes('green') ? 'bg-green-500' : statusColor.includes('blue') ? 'bg-blue-500' : statusColor.includes('yellow') ? 'bg-yellow-500' : statusColor.includes('purple') ? 'bg-purple-500' : 'bg-gray-500'}`}
                title={formatTournamentStatus(tournament.status)}
              />
              <button
                onClick={() => setActiveTab('overview')}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Impostazioni"
                aria-label="Impostazioni torneo"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Tabs - Orizzontali su mobile e desktop */}
          <nav className="-mx-3 sm:mx-0">
            <div className="flex gap-1 overflow-x-auto border-t border-gray-200 dark:border-gray-800 pt-2 px-3 sm:px-0 pb-1 scrollbar-hide snap-x snap-mandatory scroll-smooth">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap snap-center flex-shrink-0
                      ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm sm:text-base">{tab.label}</span>
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Content area */}
      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* Main content (animated on mobile) */}
        <div
          className={`transition-all duration-300 ease-out transform ${
            animateIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          }`}
        >
          {activeTab === 'overview' && (
            <TournamentOverview tournament={tournament} onUpdate={loadTournament} clubId={clubId} />
          )}

          {activeTab === 'teams' && (
            <TournamentTeams tournament={tournament} onUpdate={loadTournament} clubId={clubId} />
          )}

          {activeTab === 'matches' && (
            <TournamentMatches tournament={tournament} onUpdate={loadTournament} clubId={clubId} />
          )}

          {activeTab === 'standings' && (
            <TournamentStandings tournament={tournament} clubId={clubId} />
          )}

          {activeTab === 'bracket' && <TournamentBracket tournament={tournament} clubId={clubId} />}

          {activeTab === 'points' && <TournamentPoints clubId={clubId} tournament={tournament} />}
        </div>
      </div>
    </div>
  );
}

export default TournamentDetailsPage;
