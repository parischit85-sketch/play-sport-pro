/**
 * Tournament Bracket TV - Optimized layout for 16:9 TV displays
 * Inspired by classic bracket design with connecting lines
 * Uses vh/vw units for resolution-independent scaling
 */

import React from 'react';
import { Crown, Trophy } from 'lucide-react';
import { MATCH_STATUS, KNOCKOUT_ROUND_NAMES } from '../../utils/tournamentConstants';

function TournamentBracketTV({ orderedRounds, rounds, teams, renderMatchContent }) {
  if (!orderedRounds || orderedRounds.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 text-[2vw]">Nessun tabellone disponibile</p>
      </div>
    );
  }

  const totalRounds = orderedRounds.length;
  const firstRoundMatchCount = rounds[orderedRounds[0]]?.length || 1;

  // Calculate dimensions in vh/vw for responsiveness
  const BRACKET_HEIGHT_VH = 80; // Total usable height
  const GAP_FACTOR = 0.18;

  // Calculate match card height based on first round
  const calculateMatchHeight = () => {
    const rawHeight = BRACKET_HEIGHT_VH / (firstRoundMatchCount * (1 + GAP_FACTOR));
    if (firstRoundMatchCount >= 8) return Math.min(Math.max(rawHeight, 7), 12);
    if (firstRoundMatchCount >= 4) return Math.min(Math.max(rawHeight, 16), 22);
    if (firstRoundMatchCount >= 2) return Math.min(Math.max(rawHeight, 30), 40);
    return Math.min(rawHeight, 45);
  };

  const baseMatchHeightVh = calculateMatchHeight();
  const matchGapVh = baseMatchHeightVh * GAP_FACTOR;

  // Column width allocation
  const columnWidthVw = totalRounds === 1 ? 40 : totalRounds === 2 ? 35 : totalRounds === 3 ? 25 : 20;
  const gapBetweenColumnsVw = totalRounds === 1 ? 0 : totalRounds === 2 ? 8 : totalRounds === 3 ? 6 : 4;

  // Render a single match card
  const renderMatchCard = (match, roundIndex, matchIndex) => {
    if (!match) return null;

    const team1 = teams[match.team1Id];
    const team2 = teams[match.team2Id];
    const team1Name = team1?.teamName || match.team1Name || 'TBD';
    const team2Name = team2?.teamName || match.team2Name || 'TBD';
    const isCompleted = match.status === MATCH_STATUS.COMPLETED;
    const isFinale = orderedRounds[roundIndex] === KNOCKOUT_ROUND_NAMES.FINALS;

    // Calculate scaled height for later rounds
    const scaledHeight = baseMatchHeightVh * (1 + roundIndex * 0.25);
    const cardHeight = `${Math.min(scaledHeight, 50)}vh`;

    // Font sizes scaled by round
    const nameFontSize = firstRoundMatchCount >= 8
      ? `${1.1 + roundIndex * 0.3}vw`
      : `${1.5 + roundIndex * 0.4}vw`;
    const scoreFontSize = firstRoundMatchCount >= 8
      ? `${1.3 + roundIndex * 0.3}vw`
      : `${1.7 + roundIndex * 0.4}vw`;

    return (
      <div
        className="bg-white rounded-lg shadow-lg border-2 border-gray-300 overflow-hidden"
        style={{
          height: cardHeight,
          minHeight: '8vh',
        }}
      >
        {/* Team 1 */}
        <div
          className={`flex items-center justify-between px-[0.8vw] py-[0.6vh] border-b border-gray-200 ${
            isCompleted && match.winnerId === team1?.id
              ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-l-4 border-l-emerald-500'
              : 'bg-white'
          }`}
          style={{ height: '50%' }}
        >
          <span
            className={`font-semibold truncate ${
              team1Name === 'BYE'
                ? 'text-orange-600'
                : isCompleted && match.winnerId === team1?.id
                  ? 'text-emerald-700'
                  : 'text-gray-900'
            }`}
            style={{ fontSize: nameFontSize }}
          >
            {team1?.seed && <span className="text-gray-500 mr-[0.3vw]">#{team1.seed}</span>}
            {team1Name}
            {isFinale && isCompleted && match.winnerId === team1?.id && (
              <Crown className="inline-block ml-[0.5vw] text-yellow-500" style={{ width: '1.5vw', height: '1.5vw' }} />
            )}
          </span>
          {isCompleted && match.score && (
            <span
              className={`font-bold ml-[0.5vw] ${
                match.winnerId === team1?.id ? 'text-emerald-600' : 'text-gray-400'
              }`}
              style={{ fontSize: scoreFontSize }}
            >
              {match.score.team1}
            </span>
          )}
        </div>

        {/* Team 2 */}
        <div
          className={`flex items-center justify-between px-[0.8vw] py-[0.6vh] ${
            isCompleted && match.winnerId === team2?.id
              ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-l-4 border-l-emerald-500'
              : 'bg-white'
          }`}
          style={{ height: '50%' }}
        >
          <span
            className={`font-semibold truncate ${
              team2Name === 'BYE'
                ? 'text-orange-600'
                : isCompleted && match.winnerId === team2?.id
                  ? 'text-emerald-700'
                  : 'text-gray-900'
            }`}
            style={{ fontSize: nameFontSize }}
          >
            {team2?.seed && <span className="text-gray-500 mr-[0.3vw]">#{team2.seed}</span>}
            {team2Name}
            {isFinale && isCompleted && match.winnerId === team2?.id && (
              <Crown className="inline-block ml-[0.5vw] text-yellow-500" style={{ width: '1.5vw', height: '1.5vw' }} />
            )}
          </span>
          {isCompleted && match.score && (
            <span
              className={`font-bold ml-[0.5vw] ${
                match.winnerId === team2?.id ? 'text-emerald-600' : 'text-gray-400'
              }`}
              style={{ fontSize: scoreFontSize }}
            >
              {match.score.team2}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Render a column (round)
  const renderColumn = (roundName, roundIndex) => {
    const roundMatches = rounds[roundName] || [];
    const sortedMatches = [...roundMatches].sort((a, b) => {
      const an = typeof a.matchNumber === 'number' ? a.matchNumber : 9999;
      const bn = typeof b.matchNumber === 'number' ? b.matchNumber : 9999;
      return an - bn;
    });

    // Calculate spacing for this round
    const spacing = Math.pow(2, roundIndex) * (baseMatchHeightVh + matchGapVh);

    return (
      <div
        key={roundName}
        className="flex flex-col relative"
        style={{
          width: `${columnWidthVw}vw`,
          minHeight: `${BRACKET_HEIGHT_VH}vh`,
        }}
      >
        {/* Round header */}
        <div className="text-center mb-[1.5vh]">
          <div className="inline-flex items-center gap-[0.5vw] px-[1vw] py-[0.8vh] bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg shadow-lg">
            <Trophy className="text-white" style={{ width: '1.5vw', height: '1.5vw' }} />
            <span className="font-bold text-white uppercase tracking-wide" style={{ fontSize: `${totalRounds <= 2 ? '1.3' : '1.1'}vw` }}>
              {roundName}
            </span>
          </div>
        </div>

        {/* Matches positioned vertically */}
        <div className="flex-1 relative">
          {sortedMatches.map((match, matchIndex) => {
            // Calculate vertical position
            const topPosition = roundIndex === 0
              ? matchIndex * (baseMatchHeightVh + matchGapVh)
              : matchIndex * spacing + (spacing / 2) - (baseMatchHeightVh * (1 + roundIndex * 0.25) / 2);

            return (
              <div
                key={match.id}
                className="absolute left-0 right-0"
                style={{
                  top: `${topPosition}vh`,
                }}
              >
                {renderMatchCard(match, roundIndex, matchIndex)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render connecting lines between rounds (SVG overlay)
  const renderConnectingLines = () => {
    // SVG lines to connect matches - simplified version
    // In production, calculate exact positions based on match cards
    return (
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        {/* Lines would be generated here based on match positions */}
        {/* Example: <line x1="..." y1="..." x2="..." y2="..." stroke="#888" strokeWidth="2" /> */}
      </svg>
    );
  };

  return (
    <div
      className="relative flex items-center justify-center px-[2vw] py-[2vh]"
      style={{
        height: `${BRACKET_HEIGHT_VH}vh`,
        background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #7e22ce 100%)',
      }}
    >
      {/* Connecting lines overlay */}
      {renderConnectingLines()}

      {/* Bracket columns */}
      <div
        className="flex items-start justify-center relative z-10"
        style={{
          gap: `${gapBetweenColumnsVw}vw`,
        }}
      >
        {orderedRounds.map((roundName, index) => renderColumn(roundName, index))}
      </div>
    </div>
  );
}

export default TournamentBracketTV;
