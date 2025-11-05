import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

/**
 * BracketViewTV Component
 * ========================
 * TV-optimized bracket/knockout stage visualization
 * Displays tournament progression with responsive font scaling
 *
 * Props:
 * - tournament: Tournament object with matches data
 * - clubId: Club identifier
 * - fontScale: Font scaling multiplier (0.55 - 1.8)
 * - isPublicView: Boolean to enable/disable public view styling
 *
 * Features:
 * - Max 16 teams support (semi-final, final bracket)
 * - Responsive team width and spacing
 * - Color-coded match states (pending, in-progress, completed)
 * - Real-time result display
 * - TV-optimized layout
 */

const BracketViewTV = ({ tournament, clubId, fontScale = 1, isPublicView = true }) => {
	// Extract bracket data from matches
	const bracketData = useMemo(() => {
		if (!tournament || !tournament.matches) {
			return { semifinals: [], finals: null };
		}

		const matches = tournament.matches || [];

		// Filter bracket matches (typically labeled as knockout/semi/final)
		const semiMatches = matches.filter(
			(m) => m.type === 'semifinal' || m.stage === 'semifinal'
		);
		const finalMatch = matches.find(
			(m) => m.type === 'final' || m.stage === 'final'
		);

		return {
			semifinals: semiMatches,
			finals: finalMatch,
			totalTeams: semiMatches.length * 2,
		};
	}, [tournament]);

	// Calculate responsive sizing
	const sizing = useMemo(() => {
		const baseTeamHeight = 48;
		const baseTeamWidth = 180;
		const baseSpacing = 32;
		const baseConnectorWidth = 48;

		return {
			teamHeight: Math.max(36, baseTeamHeight * fontScale),
			teamWidth: Math.max(140, baseTeamWidth * fontScale),
			spacing: Math.max(24, baseSpacing * fontScale),
			connectorWidth: Math.max(32, baseConnectorWidth * fontScale),
			fontSize: Math.max(12, 16 * fontScale),
			fontSizeSmall: Math.max(10, 12 * fontScale),
			gapBetweenRounds: Math.max(60, 80 * fontScale),
		};
	}, [fontScale]);

	// Match state styling
	const getMatchStateStyle = (match) => {
		if (!match) return { bg: 'bg-gray-700', border: 'border-gray-600' };

		if (match.completed) {
			return { bg: 'bg-green-900', border: 'border-green-700' };
		}
		if (match.inProgress) {
			return { bg: 'bg-blue-900', border: 'border-blue-700' };
		}
		return { bg: 'bg-gray-700', border: 'border-gray-600' };
	};

	// Render single team card
	const TeamCard = ({ team, isWinner = false }) => {
		if (!team) {
			return (
				<div
					className="bg-gray-800 border border-dashed border-gray-600 rounded flex items-center justify-center text-gray-500"
					style={{
						height: `${sizing.teamHeight}px`,
						width: `${sizing.teamWidth}px`,
						fontSize: `${sizing.fontSizeSmall}px`,
					}}
				>
					TBD
				</div>
			);
		}

		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				className={`
          rounded border-2 px-3 py-2 flex flex-col justify-between
          ${isWinner ? 'bg-amber-900 border-amber-600 shadow-lg shadow-amber-500/50' : 'bg-gray-800 border-gray-600'}
        `}
				style={{
					height: `${sizing.teamHeight}px`,
					width: `${sizing.teamWidth}px`,
				}}
			>
				<div
					className="font-semibold truncate"
					style={{ fontSize: `${sizing.fontSize}px` }}
					title={team.name}
				>
					{team.name}
				</div>
				<div
					className={`text-right font-bold ${isWinner ? 'text-amber-300' : 'text-gray-400'}`}
					style={{ fontSize: `${sizing.fontSize}px` }}
				>
					{team.points || '—'}
				</div>
			</motion.div>
		);
	};

	// Render single match
	const MatchContainer = ({ match, round = 'Semi' }) => {
		if (!match) return null;

		const matchState = getMatchStateStyle(match);
		const team1Winner =
			match.completed && match.winner === match.team1?.id;
		const team2Winner =
			match.completed && match.winner === match.team2?.id;

		return (
			<motion.div
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				className="flex flex-col gap-2"
			>
				<TeamCard team={match.team1} isWinner={team1Winner} />
				<div
					className={`border-t-2 ${matchState.border} mx-2`}
					style={{ borderTopColor: matchState.border.includes('green') ? '#15803d' : '#6b7280' }}
				/>
				<TeamCard team={match.team2} isWinner={team2Winner} />

				{/* Match info */}
				<div
					className={`text-center text-xs py-1 rounded ${matchState.bg}`}
					style={{
						fontSize: `${sizing.fontSizeSmall}px`,
						backgroundColor: matchState.bg.includes('green')
							? '#15803d'
							: matchState.bg.includes('blue')
							? '#1e3a8a'
							: '#374151',
					}}
				>
					<span className="text-gray-300">{round}</span>
					{match.completed && (
						<span className="ml-2 text-green-300">
							✓ Complete
						</span>
					)}
					{match.inProgress && (
						<span className="ml-2 text-blue-300">● Live</span>
					)}
				</div>
			</motion.div>
		);
	};

	// Render connector line
	const ConnectorLine = ({ isWinner = false }) => {
		return (
			<div
				className="flex items-center justify-center"
				style={{ width: `${sizing.connectorWidth}px` }}
			>
				<div
					className={`w-full h-0.5 ${isWinner ? 'bg-amber-600' : 'bg-gray-600'}`}
					style={{
						backgroundImage: isWinner
							? 'linear-gradient(90deg, #b45309, #d97706)'
							: 'linear-gradient(90deg, #4b5563, #6b7280)',
					}}
				/>
				<ChevronRight
					size={sizing.fontSize * 1.5}
					className={isWinner ? 'text-amber-600' : 'text-gray-600'}
					strokeWidth={3}
				/>
			</div>
		);
	};

	// Render semifinals round
	const SemifinalsRound = () => {
		if (!bracketData.semifinals || bracketData.semifinals.length === 0) {
			return (
				<div className="text-center text-gray-500 py-8">
					No semifinal matches available
				</div>
			);
		}

		return (
			<div
				className="flex flex-col gap-4"
				style={{ gap: `${sizing.spacing}px` }}
			>
				{bracketData.semifinals.map((match, idx) => (
					<MatchContainer
						key={`semi-${match.id || idx}`}
						match={match}
						round="Semi"
					/>
				))}
			</div>
		);
	};

	// Render finals round
	const FinalsRound = () => {
		if (!bracketData.finals) {
			return (
				<div className="text-center text-gray-500 py-4">
					No final match available
				</div>
			);
		}

		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 0.3 }}
			>
				<MatchContainer match={bracketData.finals} round="Final" />
			</motion.div>
		);
	};

	// Render winner (if finals completed)
	const WinnerDisplay = () => {
		if (!bracketData.finals || !bracketData.finals.completed) {
			return null;
		}

		const winner = bracketData.finals.team1?.id === bracketData.finals.winner
			? bracketData.finals.team1
			: bracketData.finals.team2;

		if (!winner) return null;

		return (
			<motion.div
				initial={{ opacity: 0, scale: 0 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ type: 'spring', stiffness: 100 }}
				className="mt-8 p-6 rounded-lg bg-gradient-to-r from-amber-900 to-yellow-900 border-2 border-amber-500 text-center shadow-2xl shadow-amber-500/50"
			>
				<div
					className="text-amber-100 mb-2"
					style={{ fontSize: `${sizing.fontSizeSmall}px` }}
				>
					TOURNAMENT WINNER
				</div>
				<div
					className="font-bold text-amber-300"
					style={{ fontSize: `${sizing.fontSize * 1.5}px` }}
				>
					{winner.name}
				</div>
				<div
					className="text-amber-200 mt-2"
					style={{ fontSize: `${sizing.fontSize}px` }}
				>
					{winner.points || '—'} points
				</div>
			</motion.div>
		);
	};

	// Main render
	return (
		<div
			className={`
        bracket-view-tv h-full flex flex-col overflow-auto
        ${isPublicView ? 'bg-gray-900 text-gray-100' : 'bg-gray-800 text-gray-200'}
      `}
			style={{ padding: `${sizing.spacing}px` }}
		>
			{/* Title */}
			<h2
				className="font-bold mb-6 text-center text-amber-400"
				style={{ fontSize: `${sizing.fontSize * 1.8}px` }}
			>
				🏆 Tournament Bracket
			</h2>

			{/* Main bracket container */}
			<div className="flex-1 flex gap-8 items-start justify-center overflow-x-auto pb-4">
				{/* Semifinals */}
				<motion.div
					initial={{ opacity: 0, x: -40 }}
					animate={{ opacity: 1, x: 0 }}
					className="flex flex-col justify-center"
					style={{ gap: `${sizing.gapBetweenRounds}px` }}
				>
					<div
						className="text-gray-400 font-semibold mb-2"
						style={{ fontSize: `${sizing.fontSizeSmall}px` }}
					>
						SEMIFINALS
					</div>
					<SemifinalsRound />
				</motion.div>

				{/* Connector to finals */}
				{bracketData.semifinals.length > 0 && (
					<motion.div
						initial={{ opacity: 0, scaleX: 0 }}
						animate={{ opacity: 1, scaleX: 1 }}
						transition={{ delay: 0.2 }}
						className="flex flex-col justify-center items-center"
						style={{
							height: `${sizing.teamHeight * 3 + sizing.spacing * 2}px`,
						}}
					>
						<ConnectorLine />
					</motion.div>
				)}

				{/* Finals */}
				<motion.div
					initial={{ opacity: 0, x: 40 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.1 }}
					className="flex flex-col justify-center"
				>
					<div
						className="text-gray-400 font-semibold mb-2"
						style={{ fontSize: `${sizing.fontSizeSmall}px` }}
					>
						FINAL
					</div>
					<FinalsRound />
				</motion.div>
			</div>

			{/* Winner display */}
			<WinnerDisplay />

			{/* Footer info */}
			<div
				className="text-center text-gray-500 mt-6"
				style={{ fontSize: `${sizing.fontSizeSmall}px` }}
			>
				{bracketData.totalTeams > 0 ? (
					<p>Bracket showing {bracketData.totalTeams} teams in tournament</p>
				) : (
					<p>Waiting for bracket data...</p>
				)}
			</div>
		</div>
	);
};

export default BracketViewTV;
