/**
 * Tournament Matches - Display and manage tournament matches
 */

import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../services/firebase';
import {
  Trophy,
  Calendar,
  Clock,
  CheckCircle,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Trash2,
  Pencil,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';
import { useAuth, USER_ROLES } from '../../../../contexts/AuthContext';
import {
  getMatches,
  recordMatchResult,
  updateMatchStatus,
  clearMatchResult,
  deleteMatch,
  confirmProvisionalResult,
  rejectProvisionalResult,
} from '../../services/matchService';
import { getTeamsByTournament } from '../../services/teamsService';
import { MATCH_STATUS, KNOCKOUT_ROUND_NAMES } from '../../utils/tournamentConstants';
import { computeFromSets, calcParisDelta } from '../../../../lib/rpa.js';
import { themeTokens } from '../../../../lib/theme.js';
import MatchResultModal from './MatchResultModal';
import LiveScoreModal from './LiveScoreModal';
import FormulaModal from '../../../../components/modals/FormulaModal.jsx';
import MatchCreationModal from './MatchCreationModal';
import MatchEditModal from './MatchEditModal';

function TournamentMatches({
  tournament,
  clubId,
  groupFilter = null,
  isPublicView = false,
  onMatchClick,
}) {
  console.log('🎯 [TournamentMatches] Component mounted/rendered', {
    tournamentId: tournament?.id,
    participantType: tournament?.participantType,
    clubId,
    isPublicView,
  });

  const { userRole, userClubRoles } = useAuth();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedMatchForLiveScore, setSelectedMatchForLiveScore] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [filter, setFilter] = useState('all');
  const [formulaModalOpen, setFormulaModalOpen] = useState(false);
  const [formulaMatchData, setFormulaMatchData] = useState(null);
  const [showMatchCreationModal, setShowMatchCreationModal] = useState(false);
  const [showMatchEditModal, setShowMatchEditModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);

  // ✅ FIX: Check club-specific admin role, not global userRole
  const clubRole = userClubRoles?.[clubId];
  const isClubAdmin =
    userRole === USER_ROLES.SUPER_ADMIN || clubRole === 'admin' || clubRole === 'club_admin';
  const canEditResults = isClubAdmin;

  const loadData = async () => {
    setLoading(true);
    try {
      const [matchesData, teamsData] = await Promise.all([
        getMatches(clubId, tournament.id),
        getTeamsByTournament(clubId, tournament.id),
      ]);

      const teamsMap = {};
      teamsData.forEach((team) => {
        teamsMap[team.id] = team;
      });

      setMatches(matchesData);
      setTeams(teamsMap);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or tournament changes
  useEffect(() => {
    if (tournament && clubId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournament?.id, clubId]);

  const handleRecordResult = async (matchId, score, bestOf, sets) => {
    try {
      const result = await recordMatchResult(clubId, tournament.id, {
        matchId,
        score,
        bestOf,
        sets,
        completedAt: new Date(),
      });

      if (result.success) {
        setSelectedMatch(null);
        loadData();
      } else {
        alert(result.error || 'Errore nel salvataggio del risultato');
      }
    } catch (error) {
      console.error('Error recording result:', error);
      alert('Errore nel salvataggio del risultato');
    }
  };

  const handleClearResult = async (matchId) => {
    if (
      !window.confirm(
        'Sei sicuro di voler cancellare il risultato? La partita tornerà allo stato "Programmata".'
      )
    ) {
      return;
    }

    try {
      const result = await clearMatchResult(clubId, tournament.id, matchId);

      if (result.success) {
        loadData();
        alert(
          'Risultato cancellato. Ricorda di ricalcolare manualmente la classifica se necessario.'
        );
      } else {
        alert(result.error || 'Errore nella cancellazione del risultato');
      }
    } catch (error) {
      console.error('Error clearing result:', error);
      alert('Errore nella cancellazione del risultato');
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (
      !window.confirm(
        '⚠️ ATTENZIONE: Stai per eliminare questa partita in modo permanente.\n\nQuesta azione è IRREVERSIBILE e comporterà:\n• Perdita del risultato (se presente)\n• Rimozione dalla classifica\n• Impossibilità di recupero\n\nSei assolutamente sicuro di voler procedere?'
      )
    ) {
      return;
    }

    try {
      const result = await deleteMatch(clubId, tournament.id, matchId);

      if (result.success) {
        loadData();
        alert(
          'Partita eliminata con successo. Ricorda di ricalcolare la classifica se necessario.'
        );
      } else {
        alert(result.error || "Errore nell'eliminazione della partita");
      }
    } catch (error) {
      console.error('Error deleting match:', error);
      alert("Errore nell'eliminazione della partita");
    }
  };

  const handleEditMatch = (match) => {
    setEditingMatch(match);
    setShowMatchEditModal(true);
  };

  const handleMarkAsInProgress = async (matchId) => {
    try {
      // Aggiornamento ottimistico: aggiorna subito l'interfaccia
      setMatches((prevMatches) =>
        prevMatches.map((m) => (m.id === matchId ? { ...m, status: MATCH_STATUS.IN_PROGRESS } : m))
      );

      const result = await updateMatchStatus(
        clubId,
        tournament.id,
        matchId,
        MATCH_STATUS.IN_PROGRESS
      );

      if (result.success) {
        // Ricarica i dati dal server per confermare
        await loadData();
      } else {
        // Se fallisce, ricarica i dati per ripristinare lo stato corretto
        await loadData();
        alert(result.error || "Errore nell'aggiornamento dello stato");
      }
    } catch (error) {
      console.error('Error updating match status:', error);
      // Ricarica i dati per ripristinare lo stato corretto
      await loadData();
      alert("Errore nell'aggiornamento dello stato");
    }
  };

  const handleMarkAsScheduled = async (matchId) => {
    try {
      // Aggiornamento ottimistico: aggiorna subito l'interfaccia
      setMatches((prevMatches) =>
        prevMatches.map((m) => (m.id === matchId ? { ...m, status: MATCH_STATUS.SCHEDULED } : m))
      );

      const result = await updateMatchStatus(
        clubId,
        tournament.id,
        matchId,
        MATCH_STATUS.SCHEDULED
      );

      if (result.success) {
        // Ricarica i dati dal server per confermare
        await loadData();
      } else {
        // Se fallisce, ricarica i dati per ripristinare lo stato corretto
        await loadData();
        alert(result.error || "Errore nell'aggiornamento dello stato");
      }
    } catch (error) {
      console.error('Error updating match status:', error);
      // Ricarica i dati per ripristinare lo stato corretto
      await loadData();
      alert("Errore nell'aggiornamento dello stato");
    }
  };

  const handleConfirmProvisionalResult = async (matchId) => {
    if (!window.confirm('Confermare questo risultato provvisorio e renderlo definitivo?')) {
      return;
    }

    try {
      const result = await confirmProvisionalResult(clubId, tournament.id, matchId);

      if (result.success) {
        alert('Risultato confermato con successo!');
        await loadData(); // Ricarica per aggiornare standings e match status
      } else {
        alert(result.error || 'Errore nella conferma del risultato');
      }
    } catch (error) {
      console.error('Error confirming provisional result:', error);
      alert('Errore nella conferma del risultato');
    }
  };

  const handleRejectProvisionalResult = async (matchId) => {
    if (!window.confirm('Rifiutare questo risultato provvisorio? Verrà eliminato.')) {
      return;
    }

    try {
      const result = await rejectProvisionalResult(clubId, tournament.id, matchId);

      if (result.success) {
        alert('Risultato provvisorio rifiutato');
        await loadData(); // Ricarica per aggiornare lo stato
      } else {
        alert(result.error || 'Errore nel rifiuto del risultato');
      }
    } catch (error) {
      console.error('Error rejecting provisional result:', error);
      alert('Errore nel rifiuto del risultato');
    }
  };

  const handleSubmitLiveScore = async (liveScoreData) => {
    try {
      const matchId = selectedMatchForLiveScore.id;

      // Update match with live score (provisional, no validation)
      const matchRef = doc(db, 'clubs', clubId, 'tournaments', tournament.id, 'matches', matchId);

      await updateDoc(matchRef, {
        liveScore: liveScoreData,
        liveScoreUpdatedAt: new Date(),
      });

      setSelectedMatchForLiveScore(null);
      await loadData();
    } catch (error) {
      console.error('Error submitting live score:', error);
      alert("Errore durante l'aggiornamento del risultato live");
    }
  };

  const handleSubmitFinalFromLive = async (finalResultData) => {
    try {
      const matchId = selectedMatchForLiveScore.id;

      // Prepare data in the format expected by recordMatchResult
      const resultData = {
        matchId: matchId,
        score: finalResultData.score,
        bestOf: selectedMatchForLiveScore.bestOf || 3, // Use match's bestOf or default to 3
        sets: finalResultData.sets,
        completedAt: new Date(),
      };

      // Submit as final result using the existing recordMatchResult function
      const result = await recordMatchResult(clubId, tournament.id, resultData);

      if (result.success) {
        // ✅ Force status to COMPLETED (transaction preserves in_progress status)
        await updateMatchStatus(clubId, tournament.id, matchId, MATCH_STATUS.COMPLETED);

        setSelectedMatchForLiveScore(null);
        await loadData();
      } else {
        alert(result.error || 'Errore durante la conferma del risultato finale');
      }
    } catch (error) {
      console.error('Error submitting final result:', error);
      alert('Errore durante la conferma del risultato finale');
    }
  };

  // Team updates are managed in the Teams tab per requirements

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Define knockout round order for proper sorting
  const knockoutRoundOrder = {
    'Ottavi di Finale': 1,
    'Quarti di Finale': 2,
    Semifinali: 3,
    'Finale 3°/4° Posto': 4,
    Finale: 5,
  };

  const groupedMatches = matches.reduce(
    (acc, match) => {
      if (match.type === 'group') {
        const groupId = match.groupId || 'ungrouped';
        // Se groupFilter è specificato, salta i gironi non richiesti
        if (groupFilter && groupId !== groupFilter) return acc;

        if (!acc.groups[groupId]) {
          acc.groups[groupId] = [];
        }
        acc.groups[groupId].push(match);
      } else {
        const displayRound =
          match.roundName || KNOCKOUT_ROUND_NAMES[match.round] || match.round || 'Sconosciuto';
        if (!acc.knockout[displayRound]) {
          acc.knockout[displayRound] = [];
        }
        acc.knockout[displayRound].push(match);
      }
      return acc;
    },
    { groups: {}, knockout: {} }
  );

  // Sort group keys alphabetically
  const sortedGroupKeys = Object.keys(groupedMatches.groups).sort((a, b) => {
    // Put ungrouped at the end
    if (a === 'ungrouped') return 1;
    if (b === 'ungrouped') return -1;
    return a.localeCompare(b);
  });

  // Sort knockout round keys in proper order
  const sortedKnockoutKeys = Object.keys(groupedMatches.knockout).sort(
    (a, b) => (knockoutRoundOrder[a] || 99) - (knockoutRoundOrder[b] || 99)
  );

  const filterMatch = (match) => {
    if (filter === 'all') return true;
    if (filter === 'scheduled') return match.status === MATCH_STATUS.SCHEDULED;
    if (filter === 'in-progress') return match.status === MATCH_STATUS.IN_PROGRESS;
    if (filter === 'completed') return match.status === MATCH_STATUS.COMPLETED;
    return true;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case MATCH_STATUS.SCHEDULED:
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case MATCH_STATUS.IN_PROGRESS:
        return <PlayCircle className="w-4 h-4 text-orange-500" />;
      case MATCH_STATUS.COMPLETED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case MATCH_STATUS.SCHEDULED:
        return 'Programmata';
      case MATCH_STATUS.IN_PROGRESS:
        return 'In corso';
      case MATCH_STATUS.COMPLETED:
        return 'Completata';
      default:
        return 'Unknown';
    }
  };

  // Utility function for standard points calculation (may be used in future features)
  // eslint-disable-next-line no-unused-vars
  const calculatePoints = (match, pointsSystem) => {
    if (!match.winnerId) return { team1Points: 0, team2Points: 0 };

    const ps = pointsSystem || { win: 3, draw: 1, loss: 0 };
    const team1Won = match.winnerId === match.team1Id;

    return {
      team1Points: team1Won ? ps.win : ps.loss,
      team2Points: team1Won ? ps.loss : ps.win,
    };
  };

  // Utility function for RPA points calculation
  // eslint-disable-next-line no-unused-vars
  const calculateRPAPoints = (match, team1, team2, tournament) => {
    if (!match.winnerId || !team1 || !team2) {
      return { team1RPA: 0, team2RPA: 0 };
    }

    // Get ranking from players
    const pickTwoRatings = (team, fallback = 1500) => {
      const players = Array.isArray(team?.players) ? team.players : [];
      const ratings = players
        .map((p) => (typeof p?.ranking === 'number' ? Number(p.ranking) : fallback))
        .slice(0, 2);
      while (ratings.length < 2) ratings.push(fallback);
      return ratings;
    };

    const toABSets = (sets) => {
      if (!Array.isArray(sets)) return [];
      return sets.map((s) => ({ a: Number(s?.team1 || 0), b: Number(s?.team2 || 0) }));
    };

    const multiplier = Number(tournament?.configuration?.championshipPoints?.rpaMultiplier ?? 1);
    const fallbackRanking = Number(
      tournament?.configuration?.defaultRankingForNonParticipants ?? 1500
    );

    const [rA1, rA2] = pickTwoRatings(team1, fallbackRanking);
    const [rB1, rB2] = pickTwoRatings(team2, fallbackRanking);
    const rr = computeFromSets(toABSets(match.sets || []));

    const winnerIsA = match.winnerId === match.team1Id ? 'A' : 'B';
    const res = calcParisDelta({
      ratingA1: rA1,
      ratingA2: rA2,
      ratingB1: rB1,
      ratingB2: rB2,
      gamesA: rr.gamesA,
      gamesB: rr.gamesB,
      winner: winnerIsA,
      sets: toABSets(match.sets || []),
    });

    const pts = Math.max(0, Number(res?.pts || 0));
    const rpaPoints = pts * multiplier;

    return {
      team1RPA: match.winnerId === match.team1Id ? Math.round(rpaPoints) : -Math.round(rpaPoints),
      team2RPA: match.winnerId === match.team2Id ? Math.round(rpaPoints) : -Math.round(rpaPoints),
    };
  };

  const handleShowRPAFormula = (match, team1, team2) => {
    if (!match.winnerId || !team1 || !team2) return;

    const pickTwoRatings = (team, fallback = 1500) => {
      const players = Array.isArray(team?.players) ? team.players : [];
      const ratings = players
        .map((p) => (typeof p?.ranking === 'number' ? Number(p.ranking) : fallback))
        .slice(0, 2);
      while (ratings.length < 2) ratings.push(fallback);
      return ratings;
    };

    const toABSets = (sets) => {
      if (!Array.isArray(sets)) return [];
      return sets.map((s) => ({ a: Number(s?.team1 || 0), b: Number(s?.team2 || 0) }));
    };

    const multiplier = Number(tournament?.configuration?.championshipPoints?.rpaMultiplier ?? 1);
    const fallbackRanking = Number(
      tournament?.configuration?.defaultRankingForNonParticipants ?? 1500
    );

    const [rA1, rA2] = pickTwoRatings(team1, fallbackRanking);
    const [rB1, rB2] = pickTwoRatings(team2, fallbackRanking);

    // Get top 2 players for display
    const teamA = (Array.isArray(team1?.players) ? team1.players : []).slice(0, 2).map((p) => ({
      id: p?.id || Math.random(),
      name: p?.name || '?',
      rating: p?.ranking || fallbackRanking,
    }));
    const teamB = (Array.isArray(team2?.players) ? team2.players : []).slice(0, 2).map((p) => ({
      id: p?.id || Math.random(),
      name: p?.name || '?',
      rating: p?.ranking || fallbackRanking,
    }));

    const winnerIsA = match.winnerId === match.team1Id ? 'A' : 'B';
    const rr = computeFromSets(toABSets(match.sets || []));

    // Usa calcParisDelta per ottenere i calcoli corretti
    const res = calcParisDelta({
      ratingA1: rA1,
      ratingA2: rA2,
      ratingB1: rB1,
      ratingB2: rB2,
      gamesA: rr.gamesA,
      gamesB: rr.gamesB,
      winner: winnerIsA,
      sets: toABSets(match.sets || []),
    });

    // I valori da res sono già corretti dalla formula
    const ptsBeforeMultiplier = res.pts; // Punti RPA base
    const ptsAfterMultiplier = ptsBeforeMultiplier * multiplier; // Punti finali con moltiplicatore

    const deltaA =
      match.winnerId === match.team1Id
        ? Math.round(ptsAfterMultiplier)
        : -Math.round(ptsAfterMultiplier);
    const deltaB =
      match.winnerId === match.team2Id
        ? Math.round(ptsAfterMultiplier)
        : -Math.round(ptsAfterMultiplier);

    setFormulaMatchData({
      sumA: res.sumA,
      sumB: res.sumB,
      gap: res.gap,
      base: res.base,
      gd: res.gd,
      factor: res.factor,
      pts: res.pts,
      ptsWithMultiplier: ptsAfterMultiplier,
      multiplier,
      winner: winnerIsA,
      gamesA: rr.gamesA,
      gamesB: rr.gamesB,
      sets: toABSets(match.sets || []),
      deltaA,
      deltaB,
      teamA,
      teamB,
    });
    setFormulaModalOpen(true);
  };

  const renderMatch = (match) => {
    const team1 = teams[match.team1Id];
    const team2 = teams[match.team2Id];

    if (!team1 || !team2) return null;

    const isCompleted = match.status === MATCH_STATUS.COMPLETED;

    const team1Name = team1?.teamName || team1?.name || team1?.displayName || '—';
    const team2Name = team2?.teamName || team2?.name || team2?.displayName || '—';

    const getAvgRanking = (team) => {
      if (!team) return null;
      if (typeof team.averageRanking === 'number') return team.averageRanking;
      if (Array.isArray(team.players) && team.players.length) {
        const vals = team.players.map((p) => p?.ranking).filter((r) => typeof r === 'number');
        if (vals.length) return vals.reduce((a, b) => a + b, 0) / vals.length;
      }
      return null;
    };

    const team1Avg = getAvgRanking(team1);
    const team2Avg = getAvgRanking(team2);

    // Check for live score (in progress matches)
    const isInProgress = match.status === MATCH_STATUS.IN_PROGRESS;
    const isLive = isInProgress && match.liveScore;
    const setsToShow = isLive ? match.liveScore.sets : match.sets;
    const hasSets = Array.isArray(setsToShow) && setsToShow.length > 0;

    const renderSetPills = (teamIndex) => {
      if (!hasSets) return null;
      return (
        <div className="flex items-center gap-1">
          {setsToShow.map((s, i) => {
            const a = Number(s?.team1 ?? 0);
            const b = Number(s?.team2 ?? 0);
            const val = teamIndex === 1 ? a : b;
            const win = teamIndex === 1 ? a > b : b > a;
            return (
              <span
                key={`tpill-${match.id}-${teamIndex}-${i}`}
                className={`${
                  isPublicView
                    ? `px-2 py-1 rounded-md ${
                        isLive
                          ? 'text-base sm:text-lg bg-orange-900/40 text-orange-300 border border-orange-600/50 animate-pulse shadow-sm shadow-orange-500/20'
                          : win
                            ? 'text-base sm:text-lg bg-emerald-900/40 text-emerald-200 border border-emerald-600/50 shadow-sm shadow-emerald-500/20'
                            : 'text-base sm:text-lg bg-gray-700/60 text-gray-300 border border-gray-600/50'
                      } font-bold leading-3`
                    : `rounded px-2 py-1 text-lg sm:text-xl font-bold ${
                        isLive
                          ? 'bg-orange-900/40 text-orange-300 animate-pulse border border-orange-600/50'
                          : win
                            ? 'bg-emerald-900/30 text-emerald-300'
                            : 'bg-gray-700 text-gray-300'
                      }`
                }`}
                title={`Set ${i + 1}`}
              >
                {val}
              </span>
            );
          })}
        </div>
      );
    };

    return (
      <div
        key={match.id}
        className={`relative ${
          isPublicView
            ? 'bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 backdrop-blur-sm rounded-xl border-2 shadow-lg border-gray-600/50'
            : 'bg-gray-800 border border-gray-700 hover:border-primary-300'
        } rounded-lg p-3 sm:p-4 transition-all ${!isPublicView && canEditResults ? 'pb-10' : ''} ${
          isPublicView && onMatchClick
            ? 'cursor-pointer hover:shadow-2xl hover:scale-[1.02]'
            : 'cursor-default'
        }`}
        onClick={isPublicView && onMatchClick ? () => onMatchClick(match) : undefined}
        onKeyDown={
          isPublicView && onMatchClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onMatchClick(match);
                }
              }
            : undefined
        }
        role={isPublicView && onMatchClick ? 'button' : undefined}
        tabIndex={isPublicView && onMatchClick ? 0 : undefined}
      >
        {/* Pulsanti modifica ed elimina - angolo in basso a destra */}
        {!isPublicView && canEditResults && (
          <>
            <button
              onClick={() => handleEditMatch(match)}
              disabled={!canEditResults}
              className="absolute bottom-2 right-12 p-1.5 rounded-lg bg-blue-600/20 border border-blue-500/50 text-blue-500 hover:bg-blue-600/30 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors z-10"
              title="Modifica partita"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteMatch(match.id)}
              disabled={!canEditResults}
              className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-red-600/20 border border-red-500/50 text-red-500 hover:bg-red-600/30 hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors z-10"
              title="Elimina partita"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Match header - Mobile optimized */}
        <div className="flex items-center justify-between mb-2 sm:mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {getStatusIcon(match.status)}
            {/* Show status text only if not IN_PROGRESS in public view */}
            {!(isPublicView && match.status === MATCH_STATUS.IN_PROGRESS) && (
              <span
                className={`text-xs sm:text-sm ${
                  isPublicView
                    ? match.status === MATCH_STATUS.IN_PROGRESS
                      ? 'text-red-500 font-bold animate-pulse'
                      : match.status === MATCH_STATUS.SCHEDULED
                        ? 'text-amber-500 font-semibold'
                        : 'text-gray-300'
                    : 'text-gray-400'
                }`}
              >
                {getStatusText(match.status)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Match format badge if available */}
            {match.bestOf && !isPublicView && (
              <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                {match.bestOf === 1 ? '1 set' : '2 su 3'}
              </span>
            )}
            {match.courtNumber && (
              <span
                className={`text-xs sm:text-sm ${isPublicView ? 'text-gray-300' : 'text-gray-400'}`}
              >
                Campo {match.courtNumber}
              </span>
            )}
          </div>
        </div>

        {/* Teams - Mobile optimized */}
        <div className="space-y-2">
          {/* Team 1 */}
          <div
            className={`${
              isPublicView
                ? `flex items-center justify-between p-2 sm:p-2.5 rounded-lg transition-all ${
                    isCompleted && match.winnerId === team1?.id
                      ? 'bg-gradient-to-r from-emerald-900/40 via-emerald-800/30 to-emerald-900/40 border-2 border-emerald-500/50 shadow-inner shadow-emerald-500/20'
                      : 'bg-gradient-to-r from-gray-800/70 via-gray-700/70 to-gray-800/70 border border-gray-600/30'
                  }`
                : 'flex items-center justify-between gap-2'
            }`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {isPublicView ? (
                // Public view: Player names on separate lines like bracket
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  {team1?.players && team1.players.length > 0 ? (
                    team1.players.map((p, idx) => (
                      <div
                        key={idx}
                        className={`text-base sm:text-lg font-bold leading-tight truncate ${
                          isCompleted && match.winnerId === team1?.id
                            ? 'text-emerald-100 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]'
                            : 'text-gray-100'
                        }`}
                      >
                        {p.playerName || p.name || p.displayName || ''}
                      </div>
                    ))
                  ) : (
                    <div
                      className={`text-base sm:text-lg font-bold leading-tight truncate ${
                        isCompleted && match.winnerId === team1?.id
                          ? 'text-emerald-100 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]'
                          : 'text-gray-100'
                      }`}
                    >
                      {team1Name}
                    </div>
                  )}
                </div>
              ) : (
                // Admin view: Names on single line
                <>
                  <span
                    className={`font-medium text-base sm:text-lg truncate ${isCompleted && match.winnerId === team1.id ? 'text-green-400' : 'text-white'}`}
                  >
                    {team1Name}
                  </span>
                  {typeof team1Avg === 'number' && (
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      • {Math.round(team1Avg)}
                    </span>
                  )}
                  {team1.seed && (
                    <span className="text-xs text-gray-400 flex-shrink-0">(#{team1.seed})</span>
                  )}
                </>
              )}
            </div>
            {(isCompleted || isLive) && (
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {hasSets
                  ? renderSetPills(1)
                  : (isLive ? match.liveScore : match.score) && (
                      <span
                        className={`${isPublicView ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl'} font-bold ${
                          isPublicView
                            ? `ml-2 flex-shrink-0 px-2 py-0.5 rounded ${
                                isLive
                                  ? 'text-orange-300 bg-orange-900/30 animate-pulse'
                                  : match.winnerId === team1?.id
                                    ? 'text-emerald-200 bg-emerald-900/30'
                                    : 'text-gray-400 bg-gray-800/30'
                              }`
                            : isLive
                              ? 'text-orange-400 animate-pulse'
                              : match.winnerId === team1.id
                                ? 'text-green-400'
                                : 'text-gray-400'
                        }`}
                      >
                        {isLive ? match.liveScore.team1 : match.score.team1}
                      </span>
                    )}
              </div>
            )}
          </div>

          {/* VS divider */}
          <div className="flex items-center justify-center py-1 sm:py-1.5 gap-2">
            <div
              className={`h-px flex-1 ${isPublicView ? 'bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent' : 'bg-gray-200'}`}
            ></div>
            <span
              className={`${isPublicView ? 'px-2 sm:px-2.5 text-sm sm:text-base text-fuchsia-400 font-bold tracking-wider' : 'text-xs font-medium text-gray-600'}`}
            >
              VS
            </span>
            {isPublicView && isLive && (
              <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse shadow-lg shadow-red-500/50">
                LIVE
              </span>
            )}
            <div
              className={`h-px flex-1 ${isPublicView ? 'bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent' : 'bg-gray-200'}`}
            ></div>
          </div>

          {/* Team 2 */}
          <div
            className={`${
              isPublicView
                ? `flex items-center justify-between p-2 sm:p-2.5 rounded-lg transition-all ${
                    isCompleted && match.winnerId === team2?.id
                      ? 'bg-gradient-to-r from-emerald-900/40 via-emerald-800/30 to-emerald-900/40 border-2 border-emerald-500/50 shadow-inner shadow-emerald-500/20'
                      : 'bg-gradient-to-r from-gray-800/70 via-gray-700/70 to-gray-800/70 border border-gray-600/30'
                  }`
                : 'flex items-center justify-between gap-2'
            }`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {isPublicView ? (
                // Public view: Player names on separate lines like bracket
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  {team2?.players && team2.players.length > 0 ? (
                    team2.players.map((p, idx) => (
                      <div
                        key={idx}
                        className={`text-base sm:text-lg font-bold leading-tight truncate ${
                          isCompleted && match.winnerId === team2?.id
                            ? 'text-emerald-100 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]'
                            : 'text-gray-100'
                        }`}
                      >
                        {p.playerName || p.name || p.displayName || ''}
                      </div>
                    ))
                  ) : (
                    <div
                      className={`text-base sm:text-lg font-bold leading-tight truncate ${
                        isCompleted && match.winnerId === team2?.id
                          ? 'text-emerald-100 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]'
                          : 'text-gray-100'
                      }`}
                    >
                      {team2Name}
                    </div>
                  )}
                </div>
              ) : (
                // Admin view: Names on single line
                <>
                  <span
                    className={`font-medium text-base sm:text-lg truncate ${isCompleted && match.winnerId === team2.id ? 'text-green-400' : 'text-white'}`}
                  >
                    {team2Name}
                  </span>
                  {typeof team2Avg === 'number' && (
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      • {Math.round(team2Avg)}
                    </span>
                  )}
                  {team2.seed && (
                    <span className="text-xs text-gray-400 flex-shrink-0">(#{team2.seed})</span>
                  )}
                </>
              )}
            </div>
            {(isCompleted || isLive) && (
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {hasSets
                  ? renderSetPills(2)
                  : (isLive ? match.liveScore : match.score) && (
                      <span
                        className={`${isPublicView ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl'} font-bold ${
                          isPublicView
                            ? `ml-2 flex-shrink-0 px-2 py-0.5 rounded ${
                                isLive
                                  ? 'text-orange-300 bg-orange-900/30 animate-pulse'
                                  : match.winnerId === team2?.id
                                    ? 'text-emerald-200 bg-emerald-900/30'
                                    : 'text-gray-400 bg-gray-800/30'
                              }`
                            : isLive
                              ? 'text-orange-400 animate-pulse'
                              : match.winnerId === team2.id
                                ? 'text-green-400'
                                : 'text-gray-400'
                        }`}
                      >
                        {isLive ? match.liveScore.team2 : match.score.team2}
                      </span>
                    )}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons - Mobile optimized - Hidden in public view */}
        {!isPublicView && isCompleted && (
          <button
            onClick={() => handleShowRPAFormula(match, team1, team2)}
            className="w-full mt-3 px-3 py-2 rounded-lg bg-blue-900/20 border border-blue-800 text-blue-300 hover:bg-blue-900/30 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
          >
            <Info className="w-4 h-4" />
            Visualizza Formula RPA
          </button>
        )}

        {!isPublicView && canEditResults && (
          <>
            {match.status === MATCH_STATUS.SCHEDULED && (
              <button
                onClick={() => canEditResults && handleMarkAsInProgress(match.id)}
                disabled={!canEditResults}
                className="w-full mt-3 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-4 h-4" />
                Segna In Corso
              </button>
            )}

            {match.status === MATCH_STATUS.IN_PROGRESS && (
              <>
                <button
                  onClick={() => canEditResults && handleMarkAsScheduled(match.id)}
                  disabled={!canEditResults}
                  className="w-full mt-3 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Riporta a Programmato
                </button>

                <button
                  onClick={() => setSelectedMatchForLiveScore(match)}
                  disabled={!canEditResults}
                  className="w-full mt-2 px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  Risultato Live
                </button>
              </>
            )}

            {/* Provisional Result Alert & Actions */}
            {match.provisionalStatus === 'pending' && match.provisionalScore && (
              <div className="mt-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-300 mb-1">
                      Risultato Provvisorio in Attesa
                    </p>
                    <p className="text-xs text-yellow-200/80">
                      {team1Name}: {match.provisionalScore.team1} - {team2Name}:{' '}
                      {match.provisionalScore.team2}
                    </p>
                    {match.provisionalSubmittedBy && (
                      <p className="text-xs text-yellow-200/60 mt-1">
                        Inviato da: {match.provisionalSubmittedBy}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleConfirmProvisionalResult(match.id)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Conferma
                  </button>
                  <button
                    onClick={() => handleRejectProvisionalResult(match.id)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    Rifiuta
                  </button>
                </div>
              </div>
            )}

            {/* Pulsante Inserisci/Modifica Risultato - sempre visibile */}
            <button
              onClick={() => setSelectedMatch(match)}
              disabled={!canEditResults}
              className="w-full mt-3 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isCompleted ? 'Modifica Risultato' : 'Inserisci Risultato'}
            </button>

            {/* Pulsante Cancella Risultato - solo se completata */}
            {isCompleted && (
              <button
                onClick={() => handleClearResult(match.id)}
                disabled={!canEditResults}
                className="w-full mt-2 px-3 sm:px-4 py-2 rounded-lg border border-red-600 text-red-400 hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Cancella Risultato
              </button>
            )}
          </>
        )}

        {/* Scheduled date */}
        {match.scheduledDate && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center gap-2 text-xs text-blue-400">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(match.scheduledDate.seconds * 1000).toLocaleString('it-IT', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  console.log('🔍 [TournamentMatches] Render check:', {
    loading,
    matchesCount: matches.length,
    participantType: tournament.participantType,
    canEditResults,
    showMatchCreationModal,
  });

  if (loading) {
    console.log('🔄 [TournamentMatches] Showing loader');
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    console.log('📭 [TournamentMatches] No matches - showing empty state', {
      participantType: tournament.participantType,
      canEditResults,
      shouldShowButton: tournament.participantType === 'matches_only' && canEditResults,
    });
    return (
      <>
        <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Nessuna Partita</h3>
          <p className="text-gray-400">
            {tournament.participantType === 'matches_only'
              ? 'Inizia a creare partite manualmente'
              : 'Le partite verranno generate dopo la chiusura delle iscrizioni'}
          </p>
          {tournament.participantType === 'matches_only' && canEditResults && (
            <button
              onClick={() => {
                console.log('🔘 [Empty State] Crea Prima Partita clicked');
                setShowMatchCreationModal(true);
              }}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              Crea Prima Partita
            </button>
          )}
        </div>

        {/* Match Creation Modal */}
        {showMatchCreationModal && (
          <>
            {console.log('🔍 Rendering MatchCreationModal in empty state', {
              showMatchCreationModal,
              teams: Object.values(teams),
              teamsCount: Object.values(teams).length,
              editingMatch,
            })}
            <MatchCreationModal
              tournament={tournament}
              clubId={clubId}
              teams={Object.values(teams)}
              onClose={() => {
                setShowMatchCreationModal(false);
                setEditingMatch(null);
              }}
              onSuccess={loadData}
              editingMatch={editingMatch}
            />
          </>
        )}
      </>
    );
  }

  // Check if tournament is matches-only type
  const isMatchesOnly = tournament.participantType === 'matches_only';

  console.log('🔍 [TournamentMatches] Button visibility check:', {
    isMatchesOnly,
    participantType: tournament.participantType,
    canEditResults,
    isPublicView,
    shouldShowButton: canEditResults && !isPublicView,
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Create Match Button - Available for all tournament types */}
      {canEditResults && !isPublicView && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              console.log('🔘 Crea Partita clicked', {
                showMatchCreationModal,
                teamsCount: Object.values(teams).length,
                tournament,
              });
              setShowMatchCreationModal(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Crea Partita
          </button>
        </div>
      )}

      {/* Filters - Mobile Optimized - Hidden in public view */}
      {!isPublicView && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {['all', 'scheduled', 'in-progress', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                filter === f
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {f === 'all'
                ? 'Tutte'
                : f === 'scheduled'
                  ? 'Programmate'
                  : f === 'in-progress'
                    ? 'In Corso'
                    : 'Completate'}
            </button>
          ))}
        </div>
      )}

      {/* Group Matches - Different rendering for public vs admin view */}
      {Object.keys(groupedMatches.groups).length > 0 && (
        <div className="space-y-4">
          {!isPublicView && <h3 className="text-lg font-semibold text-white">Gironi</h3>}
          {isPublicView ? (
            // Public view: Simple list without headers or collapsible sections
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedGroupKeys.map((groupId) => {
                const groupMatches = groupedMatches.groups[groupId];
                const filteredMatches = groupMatches.filter(filterMatch);
                return filteredMatches.map(renderMatch);
              })}
            </div>
          ) : (
            // Admin view: Grouped with headers and collapsible sections
            sortedGroupKeys.map((groupId) => {
              const groupMatches = groupedMatches.groups[groupId];
              const filteredMatches = groupMatches.filter(filterMatch);
              if (filteredMatches.length === 0) return null;

              const isExpanded = expandedGroups[groupId] !== false;

              return (
                <div key={groupId} className="border border-gray-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleGroup(groupId)}
                    className="w-full flex items-center justify-between p-4 bg-gray-700 hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-primary-600" />
                      <span className="font-semibold text-white">
                        {groupId === 'ungrouped' ? 'Senza Girone' : `Girone ${groupId}`}
                      </span>
                      <span className="text-sm text-gray-400">
                        ({filteredMatches.length} partite)
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMatches.map(renderMatch)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Knockout matches - Hidden in public view */}
      {!isPublicView && Object.keys(groupedMatches.knockout).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Eliminazione Diretta</h3>
          {sortedKnockoutKeys.map((round) => {
            const roundMatches = groupedMatches.knockout[round];
            const filteredMatches = roundMatches.filter(filterMatch);
            if (filteredMatches.length === 0) return null;

            return (
              <div key={round} className="space-y-3">
                <h4 className="font-medium text-gray-300">{round}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMatches.map(renderMatch)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Score Modal - for in-progress matches */}
      {selectedMatchForLiveScore && (
        <LiveScoreModal
          match={selectedMatchForLiveScore}
          team1={teams[selectedMatchForLiveScore.team1Id]}
          team2={teams[selectedMatchForLiveScore.team2Id]}
          onClose={() => setSelectedMatchForLiveScore(null)}
          onSubmit={handleSubmitLiveScore}
          onSubmitFinal={handleSubmitFinalFromLive}
        />
      )}

      {selectedMatch && (
        <MatchResultModal
          match={selectedMatch}
          team1={teams[selectedMatch.team1Id]}
          team2={teams[selectedMatch.team2Id]}
          onClose={() => setSelectedMatch(null)}
          onSubmit={handleRecordResult}
          T={themeTokens()}
        />
      )}

      {formulaModalOpen && (
        <FormulaModal
          isOpen={formulaModalOpen}
          onClose={() => {
            setFormulaModalOpen(false);
            setFormulaMatchData(null);
          }}
          matchData={formulaMatchData}
        />
      )}

      {showMatchCreationModal && (
        <>
          {console.log('🔍 Rendering MatchCreationModal', {
            showMatchCreationModal,
            teams: Object.values(teams),
            teamsCount: Object.values(teams).length,
            editingMatch,
          })}
          <MatchCreationModal
            tournament={tournament}
            clubId={clubId}
            teams={Object.values(teams)}
            onClose={() => {
              setShowMatchCreationModal(false);
              setEditingMatch(null);
            }}
            onSuccess={loadData}
            editingMatch={editingMatch}
          />
        </>
      )}

      {showMatchEditModal && editingMatch && (
        <MatchEditModal
          match={editingMatch}
          clubId={clubId}
          tournamentId={tournament.id}
          teams={Object.values(teams)}
          onClose={() => {
            setShowMatchEditModal(false);
            setEditingMatch(null);
          }}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

export default TournamentMatches;
