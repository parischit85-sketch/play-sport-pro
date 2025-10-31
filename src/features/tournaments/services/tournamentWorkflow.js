/**
 * @fileoverview Tournament Workflow Manager
 * Automated tournament phase transitions and orchestration
 */

import { getTournament, updateTournamentStatus } from './tournamentService.js';
import { getTeamsByTournament } from './teamsService.js';
import { generateBalancedGroups } from '../algorithms/groupsGenerator.js';
import { generateKnockoutBracket } from '../algorithms/bracketGenerator.js';
import { startManualKnockout } from './manualBracketService.js';
import { getMatches, getMatch, getMatchesByRound } from './matchService.js';
import { getQualifiedTeams, updateStandingsAfterMatch } from './standingsService.js';
import { generateGroupMatches, generateKnockoutMatches } from './matchGenerator.js';
import {
  TOURNAMENT_STATUS,
  VALIDATION_MESSAGES,
  KNOCKOUT_ROUND,
  COLLECTIONS,
  MATCH_STATUS,
} from '../utils/tournamentConstants.js';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase.js';
import {
  advancePhaseWithTransaction,
  createGroupsWithTransaction,
  rollbackToPreviousPhase,
} from './tournamentTransactions.js';

/**
 * Tournament Workflow Manager Class
 */
export class TournamentWorkflowManager {
  constructor(clubId, tournamentId) {
    this.clubId = clubId;
    this.tournamentId = tournamentId;
  }

  /**
   * Check current phase and advance if conditions are met
   * @returns {Promise<{success: boolean, newStatus?: string, message?: string, error?: string}>}
   */
  async checkAndAdvancePhase() {
    try {
      const tournament = await getTournament(this.clubId, this.tournamentId);
      if (!tournament) {
        return { success: false, error: VALIDATION_MESSAGES.TOURNAMENT_NOT_FOUND };
      }

      switch (tournament.status) {
        case TOURNAMENT_STATUS.DRAFT:
          return await this.checkDraftPhase(tournament);

        case TOURNAMENT_STATUS.REGISTRATION_OPEN:
          return await this.checkRegistrationPhase(tournament);

        case TOURNAMENT_STATUS.REGISTRATION_CLOSED:
          return await this.startGroupStage(tournament);

        case TOURNAMENT_STATUS.GROUPS_PHASE:
          return await this.checkGroupStageComplete(tournament);

        case TOURNAMENT_STATUS.KNOCKOUT_PHASE:
          return await this.checkKnockoutStageComplete(tournament);

        case TOURNAMENT_STATUS.COMPLETED:
          return { success: true, message: 'Torneo già completato' };

        default:
          return { success: false, error: 'Stato torneo non riconosciuto' };
      }
    } catch (error) {
      console.error('Error in checkAndAdvancePhase:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if draft tournament can open registration
   */
  async checkDraftPhase(tournament) {
    return {
      success: true,
      message: 'Torneo in bozza. Apri le registrazioni per iniziare.',
      canAdvance: true,
      nextAction: 'openRegistration',
    };
  }

  /**
   * Check registration phase
   */
  async checkRegistrationPhase(tournament) {
    const teams = await getTeamsByTournament(this.clubId, this.tournamentId);
    const activeTeams = teams.filter((t) => t.status === 'active');
    const minTeams = tournament.configuration.minTeamsRequired;

    if (activeTeams.length < minTeams) {
      return {
        success: true,
        message: `Registrazioni aperte. Servono almeno ${minTeams} squadre (attualmente: ${activeTeams.length})`,
        canAdvance: false,
      };
    }

    return {
      success: true,
      message: `Numero squadre sufficiente (${activeTeams.length}/${minTeams}). Puoi chiudere le registrazioni.`,
      canAdvance: true,
      nextAction: 'closeRegistration',
    };
  }

  /**
   * Start group stage after registration closes
   * Uses transaction to ensure atomic operation
   */
  async startGroupStage(tournament) {
    try {
      console.log('🏁 Starting group stage for tournament:', this.tournamentId);

      // Get registered teams
      const teams = await getTeamsByTournament(this.clubId, this.tournamentId);
      const activeTeams = teams.filter((t) => t.status === 'active');

      // Validate min teams
      if (activeTeams.length < tournament.configuration.minTeamsRequired) {
        return {
          success: false,
          error: `Numero insufficiente di squadre. Minimo richiesto: ${tournament.configuration.minTeamsRequired}`,
        };
      }

      // Generate balanced groups
      console.log('📊 Generating balanced groups...');
      const groupsResult = await generateBalancedGroups(
        this.clubId,
        this.tournamentId,
        activeTeams,
        tournament.configuration.numberOfGroups,
        tournament.configuration.teamsPerGroup
      );

      if (!groupsResult.success) {
        return { success: false, error: groupsResult.error };
      }

      // ✅ USE TRANSACTION: Create groups atomically
      console.log('💾 Saving groups with transaction...');
      const transactionResult = await createGroupsWithTransaction(
        this.clubId,
        this.tournamentId,
        groupsResult.groups
      );

      if (!transactionResult.success) {
        console.error('❌ Transaction failed - rolling back...');
        return { success: false, error: transactionResult.error };
      }

      // Generate all group stage matches (separate batch - too many operations for single transaction)
      console.log('🎮 Generating group stage matches...');
      const matchesResult = await generateGroupMatches(
        this.clubId,
        this.tournamentId,
        groupsResult.groups,
        {
          startDate: tournament.startDate || new Date(),
          matchDuration: tournament.configuration.matchDuration || 60,
          breakBetweenMatches: tournament.configuration.breakBetweenMatches || 15,
          matchesPerDay: tournament.configuration.matchesPerDay || 4,
        }
      );

      if (!matchesResult.success) {
        console.warn('⚠️ Failed to generate matches:', matchesResult.error);
        console.warn('⚠️ Tournament advanced to GROUPS_PHASE but matches need manual creation');
        // Continue anyway - matches can be created manually
      } else {
        console.log(`✅ Generated ${matchesResult.totalMatches} group matches`);
      }

      return {
        success: true,
        newStatus: TOURNAMENT_STATUS.GROUPS_PHASE,
        message: 'Fase a gironi avviata con successo',
        groups: groupsResult.groups,
        matchesGenerated: matchesResult.success,
      };
    } catch (error) {
      console.error('❌ Error starting group stage:', error);

      // Attempt rollback
      console.log('🔄 Attempting rollback...');
      const rollbackResult = await rollbackToPreviousPhase(this.clubId, this.tournamentId);

      if (rollbackResult.success) {
        return {
          success: false,
          error: `${error.message} - Rollback completato: tornato a ${rollbackResult.rolledBackTo}`,
        };
      } else {
        return {
          success: false,
          error: `${error.message} - ATTENZIONE: Rollback fallito. Controlla manualmente lo stato del torneo.`,
        };
      }
    }
  }

  /**
   * Check if group stage is complete
   */
  async checkGroupStageComplete(tournament) {
    try {
      // Get all group matches
      const matches = await getMatches(this.clubId, this.tournamentId, { type: 'group' });
      const totalGroupMatches = matches.length;
      const completedMatches = matches.filter((m) => m.status === 'completed').length;

      if (totalGroupMatches === 0) {
        return {
          success: true,
          message: 'Nessuna partita creata. Crea le partite dei gironi per continuare.',
          canAdvance: false,
          progress: { completed: 0, total: 0 },
        };
      }

      if (completedMatches < totalGroupMatches) {
        return {
          success: true,
          message: `Fase a gironi in corso. Partite completate: ${completedMatches}/${totalGroupMatches}`,
          canAdvance: false,
          progress: { completed: completedMatches, total: totalGroupMatches },
        };
      }

      // All group matches completed, advance to knockout
      return {
        success: true,
        message: 'Fase a gironi completata! Puoi avanzare alla fase a eliminazione diretta.',
        canAdvance: true,
        nextAction: 'startKnockoutStage',
        progress: { completed: completedMatches, total: totalGroupMatches },
      };
    } catch (error) {
      console.error('Error checking group stage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start knockout stage
   * Uses transaction to ensure atomic bracket creation
   */
  async startKnockoutStage() {
    try {
      console.log('🏆 Starting knockout stage for tournament:', this.tournamentId);

      const tournament = await getTournament(this.clubId, this.tournamentId);
      if (!tournament) {
        return { success: false, error: VALIDATION_MESSAGES.TOURNAMENT_NOT_FOUND };
      }

      // Validate that all group matches have results before starting knockout
      console.log('✓ Validating group matches completion...');
      const allGroupMatches = await getMatches(this.clubId, this.tournamentId, { type: 'group' });
      const incompleteMatches = allGroupMatches.filter((m) => m.status !== MATCH_STATUS.COMPLETED);

      if (incompleteMatches.length > 0) {
        return {
          success: false,
          error: `Non puoi generare il tabellone: ci sono ancora ${incompleteMatches.length} partite dei gironi da completare`,
        };
      }

      console.log('✅ All group matches completed');

      // Get qualified teams from group standings
      console.log('📋 Getting qualified teams...');
      const qualifiedTeams = await getQualifiedTeams(
        this.clubId,
        this.tournamentId,
        tournament.configuration.qualifiedPerGroup
      );

      if (qualifiedTeams.length === 0) {
        return {
          success: false,
          error:
            'Nessuna squadra qualificata trovata. Assicurati che le classifiche siano state calcolate.',
        };
      }

      console.log(`✅ Found ${qualifiedTeams.length} qualified teams`);

      // Determine if number of qualified teams is a power of two
      const isPowerOfTwo = (n) => n > 0 && (n & (n - 1)) === 0;
      if (!isPowerOfTwo(qualifiedTeams.length)) {
        // Use manual bracket service with BYE slots auto-filled to next power of two
        console.log(
          '🧮 Non-power-of-two teams detected. Using BYE slots via manual bracket setup...'
        );

        // Compute next power of two and starting round
        const nextPow2 = 1 << Math.ceil(Math.log2(Math.max(2, qualifiedTeams.length)));
        const byes = nextPow2 - qualifiedTeams.length;

        const roundMap = {
          2: KNOCKOUT_ROUND.FINALS,
          4: KNOCKOUT_ROUND.SEMI_FINALS,
          8: KNOCKOUT_ROUND.QUARTER_FINALS,
          16: KNOCKOUT_ROUND.ROUND_OF_16,
        };
        const startingRound = roundMap[nextPow2] || KNOCKOUT_ROUND.QUARTER_FINALS;

        // Simple seeding: keep current order, pad with nulls (BYE)
        const slots = qualifiedTeams.map((t) => t.teamId);
        while (slots.length < nextPow2) slots.push(null); // BYE

        const manualResult = await startManualKnockout(this.clubId, this.tournamentId, {
          startingRound,
          includeThirdPlace: !!tournament.configuration.includeThirdPlaceMatch,
          slots,
        });

        if (!manualResult.success) {
          return {
            success: false,
            error: manualResult.error || 'Errore nella creazione del tabellone con BYE',
          };
        }

        return {
          success: true,
          newStatus: TOURNAMENT_STATUS.KNOCKOUT_PHASE,
          message: `Fase a eliminazione diretta avviata con BYE (${byes} BYE inseriti per raggiungere ${nextPow2} squadre)`,
          bracket: { startingRound, byes, slotsCount: nextPow2 },
          matchesGenerated: true,
        };
      } else {
        // Power-of-two teams: keep standard auto generation path
        console.log('🎯 Generating knockout bracket...');
        const bracketResult = await generateKnockoutBracket(
          this.clubId,
          this.tournamentId,
          qualifiedTeams,
          tournament.configuration.includeThirdPlaceMatch
        );

        if (!bracketResult.success) {
          return { success: false, error: bracketResult.error };
        }

        // ✅ USE TRANSACTION: Advance to knockout phase atomically
        console.log('💾 Advancing to knockout stage with transaction...');
        const transactionResult = await advancePhaseWithTransaction(
          this.clubId,
          this.tournamentId,
          TOURNAMENT_STATUS.KNOCKOUT_PHASE,
          {
            knockoutBracket: bracketResult.bracket,
            'configuration.bracketGeneratedAt': new Date().toISOString(),
          }
        );

        if (!transactionResult.success) {
          console.error('❌ Transaction failed - rolling back...');
          return { success: false, error: transactionResult.error };
        }

        // Generate knockout matches (separate batch)
        console.log('🏆 Generating knockout matches...');
        const matchesResult = await generateKnockoutMatches(
          this.clubId,
          this.tournamentId,
          qualifiedTeams,
          bracketResult.bracket,
          {
            startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Start 1 day after groups
          }
        );

        if (!matchesResult.success) {
          console.warn('⚠️ Failed to generate knockout matches:', matchesResult.error);
          console.warn('⚠️ Tournament advanced to KNOCKOUT_PHASE but matches need manual creation');
          // Continue anyway - matches can be created manually
        } else {
          console.log(`✅ Generated ${matchesResult.totalMatches} knockout matches`);
        }

        return {
          success: true,
          newStatus: TOURNAMENT_STATUS.KNOCKOUT_PHASE,
          message: 'Fase a eliminazione diretta avviata con successo',
          bracket: bracketResult.bracket,
          matchesGenerated: matchesResult.success,
        };
      }
    } catch (error) {
      console.error('❌ Error starting knockout stage:', error);

      // Attempt rollback
      console.log('🔄 Attempting rollback...');
      const rollbackResult = await rollbackToPreviousPhase(this.clubId, this.tournamentId);

      if (rollbackResult.success) {
        return {
          success: false,
          error: `${error.message} - Rollback completato: tornato a ${rollbackResult.rolledBackTo}`,
        };
      } else {
        return {
          success: false,
          error: `${error.message} - ATTENZIONE: Rollback fallito. Controlla manualmente lo stato del torneo.`,
        };
      }
    }
  }

  /**
   * Check if knockout stage is complete
   */
  async checkKnockoutStageComplete(tournament) {
    try {
      // Get all knockout matches
      const matches = await getMatches(this.clubId, this.tournamentId, { type: 'knockout' });
      const totalKnockoutMatches = matches.length;
      const completedMatches = matches.filter((m) => m.status === 'completed').length;

      if (totalKnockoutMatches === 0) {
        return {
          success: true,
          message: 'Nessuna partita a eliminazione diretta creata.',
          canAdvance: false,
        };
      }

      // Check if finals is completed
      const finalsMatch = matches.find((m) => m.round === 'finals');
      if (!finalsMatch) {
        return {
          success: true,
          message: 'Partita finale non trovata.',
          canAdvance: false,
        };
      }

      if (finalsMatch.status !== 'completed') {
        return {
          success: true,
          message: `Fase a eliminazione diretta in corso. Partite completate: ${completedMatches}/${totalKnockoutMatches}`,
          canAdvance: false,
          progress: { completed: completedMatches, total: totalKnockoutMatches },
        };
      }

      // Finals completed, check third place if applicable
      if (tournament.configuration.includeThirdPlaceMatch) {
        const thirdPlaceMatch = matches.find((m) => m.round === 'third_place');
        if (thirdPlaceMatch && thirdPlaceMatch.status !== 'completed') {
          return {
            success: true,
            message: 'Finale completata. In attesa della finale per il terzo posto.',
            canAdvance: false,
            progress: { completed: completedMatches, total: totalKnockoutMatches },
          };
        }
      }

      // Tournament complete!
      return {
        success: true,
        message: 'Torneo completato! Tutti i match sono stati giocati.',
        canAdvance: true,
        nextAction: 'completeTournament',
        winnerId: finalsMatch.winnerId,
      };
    } catch (error) {
      console.error('Error checking knockout stage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Complete tournament
   */
  async completeTournament() {
    try {
      console.log('🎉 Completing tournament:', this.tournamentId);

      await updateTournamentStatus(this.clubId, this.tournamentId, TOURNAMENT_STATUS.COMPLETED);

      return {
        success: true,
        newStatus: TOURNAMENT_STATUS.COMPLETED,
        message: 'Torneo completato con successo! 🏆',
      };
    } catch (error) {
      console.error('Error completing tournament:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Assign third-place match participants after semifinals are completed
   * Logic: loser of Semifinal 1 -> team1, loser of Semifinal 2 -> team2
   */
  async assignThirdPlaceParticipants(matchId) {
    try {
      const match = await getMatch(this.clubId, this.tournamentId, matchId);
      if (!match || match.type !== 'knockout' || match.round !== KNOCKOUT_ROUND.SEMI_FINALS) {
        return { success: false }; // Not applicable
      }

      // Find (first) third place match
      const thirdMatches = await getMatchesByRound(
        this.clubId,
        this.tournamentId,
        KNOCKOUT_ROUND.THIRD_PLACE
      );
      if (!Array.isArray(thirdMatches) || thirdMatches.length === 0) {
        return { success: false }; // Not configured
      }

      const third = thirdMatches[0];
      if (third.status === MATCH_STATUS.COMPLETED) {
        return { success: false, error: 'Third place match already completed' };
      }

      // Determine loser of the semifinal
      const team1 = match.team1Id || null;
      const team2 = match.team2Id || null;
      if (!team1 || !team2 || !match.winnerId) {
        return { success: false }; // Not enough data
      }

      const loserId = match.winnerId === team1 ? team2 : team1;
      const loserName =
        match.winnerId === team1 ? match.team2Name || null : match.team1Name || null;

      // Map Semifinal #1 -> third.team1, Semifinal #2 -> third.team2
      const isFirstSemi = (match.matchNumber || 1) === 1;
      const updateField = isFirstSemi ? 'team1Id' : 'team2Id';
      const nameField = isFirstSemi ? 'team1Name' : 'team2Name';

      const thirdRef = doc(
        db,
        'clubs',
        this.clubId,
        COLLECTIONS.TOURNAMENTS,
        this.tournamentId,
        COLLECTIONS.MATCHES,
        third.id
      );
      await updateDoc(thirdRef, {
        [updateField]: loserId,
        [nameField]: loserName,
        // When both teams are set, mark as scheduled (already default), leave status as-is otherwise
        updatedAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error assigning third place participants:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Manual phase advancement (admin action)
   */
  async advancePhase() {
    const checkResult = await this.checkAndAdvancePhase();

    if (!checkResult.success) {
      return checkResult;
    }

    if (!checkResult.canAdvance) {
      return {
        success: false,
        error: checkResult.message || 'Impossibile avanzare alla fase successiva',
      };
    }

    // Execute next action
    switch (checkResult.nextAction) {
      case 'openRegistration':
        return await updateTournamentStatus(
          this.clubId,
          this.tournamentId,
          TOURNAMENT_STATUS.REGISTRATION_OPEN
        );

      case 'closeRegistration':
        const closeResult = await updateTournamentStatus(
          this.clubId,
          this.tournamentId,
          TOURNAMENT_STATUS.REGISTRATION_CLOSED
        );
        if (closeResult.success) {
          // Immediately start group stage
          return await this.startGroupStage(await getTournament(this.clubId, this.tournamentId));
        }
        return closeResult;

      case 'startKnockoutStage':
        return await this.startKnockoutStage();

      case 'completeTournament':
        return await this.completeTournament();

      default:
        return { success: false, error: 'Azione successiva non riconosciuta' };
    }
  }
}

/**
 * Helper function to create workflow manager instance
 */
export function createWorkflowManager(clubId, tournamentId) {
  return new TournamentWorkflowManager(clubId, tournamentId);
}

/**
 * Quick check if tournament can advance
 */
export async function canAdvanceTournament(clubId, tournamentId) {
  const manager = new TournamentWorkflowManager(clubId, tournamentId);
  const result = await manager.checkAndAdvancePhase();
  return result.canAdvance === true;
}

/**
 * Auto-update standings after match completion
 */
export async function onMatchCompleted(clubId, tournamentId, matchId) {
  try {
    console.log('📊 Match completed, updating standings...', matchId);

    const tournament = await getTournament(clubId, tournamentId);
    if (!tournament) {
      console.error('Tournament not found');
      return { success: false };
    }

    // Update standings
    const result = await updateStandingsAfterMatch(clubId, tournamentId, tournament.pointsSystem);

    if (result.success) {
      console.log('✅ Standings updated successfully');

      // Check if phase can advance
      const manager = new TournamentWorkflowManager(clubId, tournamentId);
      const phaseCheck = await manager.checkAndAdvancePhase();

      if (phaseCheck.canAdvance) {
        console.log(`💡 Tournament can advance: ${phaseCheck.message}`);
      }

      // If semifinal completed and third place exists, assign loser into third place match
      try {
        const completedMatch = await getMatch(clubId, tournamentId, matchId);
        if (
          completedMatch?.type === 'knockout' &&
          completedMatch?.round === KNOCKOUT_ROUND.SEMI_FINALS
        ) {
          await manager.assignThirdPlaceParticipants(matchId);
        }
      } catch (e) {
        console.warn('⚠️ Third place assignment skipped:', e?.message || e);
      }
    }

    return result;
  } catch (error) {
    console.error('Error in onMatchCompleted:', error);
    return { success: false, error: error.message };
  }
}

export default {
  TournamentWorkflowManager,
  createWorkflowManager,
  canAdvanceTournament,
  onMatchCompleted,
};
