/**
 * @fileoverview Tournament System Type Definitions
 * Complete TypeScript-style JSDoc types for tournament management
 * 
 * Collections Structure:
 * - /clubs/{clubId}/tournaments/{tournamentId}
 * - /clubs/{clubId}/tournaments/{tournamentId}/teams/{teamId}
 * - /clubs/{clubId}/tournaments/{tournamentId}/matches/{matchId}
 * - /clubs/{clubId}/tournaments/{tournamentId}/standings/{standingId}
 */

/**
 * @typedef {'draft' | 'registration_open' | 'registration_closed' | 'groups_generation' | 'groups_phase' | 'knockout_phase' | 'completed' | 'cancelled'} TournamentStatus
 */

/**
 * @typedef {'couples' | 'teams'} ParticipantType
 */

/**
 * @typedef {'standard' | 'ranking_based'} PointsSystemType
 */

/**
 * @typedef {'round_of_16' | 'quarter_finals' | 'semi_finals' | 'finals'} KnockoutRound
 */

/**
 * @typedef {'scheduled' | 'in_progress' | 'completed' | 'cancelled'} MatchStatus
 */

/**
 * @typedef {Object} StandardPointsConfig
 * @property {'standard'} type
 * @property {number} win - Points for winning (default: 3)
 * @property {number} draw - Points for draw (default: 1)
 * @property {number} loss - Points for loss (default: 0)
 */

/**
 * @typedef {Object} RankingBasedPointsConfig
 * @property {'ranking_based'} type
 * @property {number} baseWin - Base points for winning (default: 3)
 * @property {number} baseDraw - Base points for draw (default: 1)
 * @property {number} baseLoss - Base points for loss (default: 0)
 * @property {Object} multipliers
 * @property {number} multipliers.upsetBonus - Bonus multiplier for beating higher ranked opponent (default: 1.5)
 * @property {number} multipliers.expectedWin - Multiplier for beating lower ranked opponent (default: 1.0)
 * @property {number} multipliers.rankingDifferenceThreshold - Minimum ranking difference to trigger upset bonus (default: 10)
 */

/**
 * @typedef {StandardPointsConfig | RankingBasedPointsConfig} PointsSystemConfig
 */

/**
 * @typedef {Object} TournamentPlayer
 * @property {string} playerId - Reference to players collection
 * @property {string} playerName - Cached player name
 * @property {number | null} ranking - Player ranking (null if not available)
 * @property {string | null} avatarUrl - Player avatar URL
 */

/**
 * @typedef {Object} TournamentTeam
 * @property {string} id - Auto-generated team ID
 * @property {string} tournamentId - Parent tournament reference
 * @property {string} teamName - Custom team name or auto-generated
 * @property {TournamentPlayer[]} players - Array of players (2 for couples, 2-6 for teams)
 * @property {number | null} averageRanking - Calculated average ranking of team
 * @property {string | null} groupId - Assigned group (null until groups generated)
 * @property {number | null} groupPosition - Position within group (null until groups generated)
 * @property {Date} registeredAt - Registration timestamp
 * @property {string} registeredBy - User ID who registered the team
 * @property {'active' | 'withdrawn'} status - Team status
 */

/**
 * @typedef {Object} TournamentGroup
 * @property {string} id - Group identifier (A, B, C, etc.)
 * @property {string} name - Display name (Girone A, Girone B, etc.)
 * @property {string[]} teamIds - Array of team IDs in this group
 * @property {number} teamsCount - Number of teams in group
 * @property {number} qualifiedCount - Number of teams that qualify for knockout
 */

/**
 * @typedef {Object} MatchScore
 * @property {number} team1 - Score for team 1
 * @property {number} team2 - Score for team 2
 */

/**
 * @typedef {Object} GroupMatch
 * @property {string} id - Auto-generated match ID
 * @property {string} tournamentId - Parent tournament reference
 * @property {'group'} type - Match type
 * @property {string} groupId - Group identifier
 * @property {number} round - Round number within group phase
 * @property {string} team1Id - First team ID
 * @property {string} team2Id - Second team ID
 * @property {MatchStatus} status - Match status
 * @property {MatchScore | null} score - Match score (null if not completed)
 * @property {string | null} winnerId - Winner team ID (null for draw or not completed)
 * @property {Date | null} scheduledDate - Scheduled match date
 * @property {Date | null} completedAt - Completion timestamp
 * @property {string | null} courtNumber - Assigned court
 * @property {string | null} notes - Additional notes
 */

/**
 * @typedef {Object} KnockoutMatch
 * @property {string} id - Auto-generated match ID
 * @property {string} tournamentId - Parent tournament reference
 * @property {'knockout'} type - Match type
 * @property {KnockoutRound} round - Knockout round
 * @property {number} matchNumber - Match number within round (1, 2, 3, 4, etc.)
 * @property {string | null} team1Id - First team ID (null if TBD)
 * @property {string | null} team2Id - Second team ID (null if TBD)
 * @property {MatchStatus} status - Match status
 * @property {MatchScore | null} score - Match score
 * @property {string | null} winnerId - Winner team ID
 * @property {string | null} nextMatchId - Next match ID if winner advances
 * @property {number | null} nextMatchPosition - Position in next match (1 or 2)
 * @property {Date | null} scheduledDate - Scheduled match date
 * @property {Date | null} completedAt - Completion timestamp
 * @property {string | null} courtNumber - Assigned court
 * @property {string | null} notes - Additional notes
 */

/**
 * @typedef {GroupMatch | KnockoutMatch} Match
 */

/**
 * @typedef {Object} KnockoutBracket
 * @property {KnockoutMatch[]} roundOf16 - Round of 16 matches (8 matches)
 * @property {KnockoutMatch[]} quarterFinals - Quarter finals (4 matches)
 * @property {KnockoutMatch[]} semiFinals - Semi finals (2 matches)
 * @property {KnockoutMatch[]} finals - Finals (1 match)
 * @property {KnockoutMatch | null} thirdPlace - Third place match (optional)
 */

/**
 * @typedef {Object} TeamStanding
 * @property {string} teamId - Team ID
 * @property {string} teamName - Cached team name
 * @property {string | null} groupId - Group identifier (null for overall standings)
 * @property {number} position - Current position
 * @property {number} points - Total points
 * @property {number} matchesPlayed - Matches played
 * @property {number} matchesWon - Matches won
 * @property {number} matchesDrawn - Matches drawn
 * @property {number} matchesLost - Matches lost
 * @property {number} setsWon - Total sets won
 * @property {number} setsLost - Total sets lost
 * @property {number} setsDifference - Set difference (won - lost)
 * @property {number} gamesWon - Total games won
 * @property {number} gamesLost - Total games lost
 * @property {number} gamesDifference - Game difference (won - lost)
 * @property {boolean} qualified - Whether team qualified for knockout phase
 * @property {Date} lastUpdated - Last update timestamp
 */

/**
 * @typedef {Object} TournamentStatistics
 * @property {number} totalTeams - Total registered teams
 * @property {number} totalMatches - Total matches (groups + knockout)
 * @property {number} completedMatches - Completed matches
 * @property {number} pendingMatches - Pending matches
 * @property {number} totalSets - Total sets played
 * @property {number} totalGames - Total games played
 * @property {number | null} averageMatchDuration - Average match duration in minutes
 * @property {Date | null} firstMatchDate - Date of first match
 * @property {Date | null} lastMatchDate - Date of last match
 */

/**
 * @typedef {Object} Tournament
 * @property {string} id - Auto-generated tournament ID
 * @property {string} clubId - Owner club ID
 * @property {string} name - Tournament name
 * @property {string | null} description - Tournament description
 * @property {TournamentStatus} status - Current tournament status
 * @property {ParticipantType} participantType - Type of participants
 * 
 * @property {Object} configuration
 * @property {number} configuration.numberOfGroups - Number of groups (2-8)
 * @property {number} configuration.teamsPerGroup - Teams per group (4-8)
 * @property {number} configuration.qualifiedPerGroup - Teams qualifying from each group (1-4)
 * @property {boolean} configuration.includeThirdPlaceMatch - Whether to include 3rd place match
 * @property {boolean} configuration.automaticGroupsGeneration - Auto-generate balanced groups
 * @property {number} configuration.minTeamsRequired - Minimum teams to start tournament
 * @property {number} configuration.maxTeamsAllowed - Maximum teams allowed
 * 
 * @property {PointsSystemConfig} pointsSystem - Points system configuration
 * 
 * @property {Object} registration
 * @property {Date | null} registration.opensAt - Registration opening date
 * @property {Date | null} registration.closesAt - Registration closing date
 * @property {number} registration.currentTeamsCount - Current registered teams
 * @property {boolean} registration.isOpen - Whether registration is currently open
 * 
 * @property {TournamentGroup[] | null} groups - Groups configuration (null until generated)
 * @property {KnockoutBracket | null} knockoutBracket - Knockout bracket (null until generated)
 * @property {TournamentStatistics} statistics - Tournament statistics
 * 
 * @property {Date} createdAt - Creation timestamp
 * @property {string} createdBy - Creator user ID
 * @property {Date} updatedAt - Last update timestamp
 * @property {string | null} completedAt - Completion timestamp
 */

/**
 * @typedef {Object} TournamentCreationDTO
 * @property {string} clubId
 * @property {string} name
 * @property {string | null} description
 * @property {ParticipantType} participantType
 * @property {number} numberOfGroups
 * @property {number} teamsPerGroup
 * @property {number} qualifiedPerGroup
 * @property {boolean} includeThirdPlaceMatch
 * @property {PointsSystemConfig} pointsSystem
 * @property {Date | null} registrationOpensAt
 * @property {Date | null} registrationClosesAt
 */

/**
 * @typedef {Object} TeamRegistrationDTO
 * @property {string} tournamentId
 * @property {string} teamName
 * @property {TournamentPlayer[]} players
 * @property {string} registeredBy
 */

/**
 * @typedef {Object} MatchResultDTO
 * @property {string} matchId
 * @property {MatchScore} score
 * @property {string} winnerId
 * @property {Date} completedAt
 */

// Export empty object to make this a module
export {};
