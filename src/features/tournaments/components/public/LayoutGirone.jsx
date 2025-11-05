import React, { useMemo } from 'react';
import TournamentStandings from '../standings/TournamentStandings.jsx';
import TournamentMatches from '../matches/TournamentMatches.jsx';

/**
 * LayoutGirone - Smart layout for tournament groups
 * Automatically selects layout based on team and match count
 * 
 * Cases:
 * 1) 3 teams, 3 matches: Stacked (100% classifica 45%, 1x3 partite 40%)
 * 2) 4 teams, 8 matches: Stacked (100% classifica 45%, 1x8 partite 40%)
 * 3) 5 teams, 10 matches: Hybrid (80% classifica 50%, 1x8 partite 35%, 20% destra 1x2)
 * 4) 6 teams, 15 matches: Hybrid (60% classifica 50%, 1x9 partite 35%, 40% destra 3x2)
 */
function LayoutGirone({
  tournament,
  clubId,
  currentGroup,
}) {
  // Count teams and matches for this group
  const { teamCount, matchCount, layoutCase } = useMemo(() => {
    const teams = tournament.teams?.filter(t => t.groupId === currentGroup) || [];
    const matches = tournament.matches?.filter(m => m.groupId === currentGroup && m.type === 'group') || [];
    
    const tCount = teams.length;
    const mCount = matches.length;
    
    // Determine layout case
    let lCase = 1;
    if (tCount === 4 && mCount >= 6) {
      lCase = 2;
    } else if (tCount === 5 && mCount >= 10) {
      lCase = 3;
    } else if (tCount >= 6 && mCount >= 15) {
      lCase = 4;
    }
    
    return {
      teamCount: tCount,
      matchCount: mCount,
      layoutCase: lCase,
    };
  }, [tournament.teams, tournament.matches, currentGroup]);

  // CASE 1 & 2: Stacked Layout
  if (layoutCase === 1 || layoutCase === 2) {
    return (
      <div className="flex flex-col h-full gap-2 p-4">
        <div className="flex-shrink-0">
          <h2 className="text-xl font-bold mb-2">Girone {currentGroup?.toUpperCase()}</h2>
        </div>
        
        {/* Classifica - 45% */}
        <div style={{ flex: '0 0 45%', minHeight: 0 }} className="overflow-hidden">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10 h-full overflow-auto">
            <h3 className="text-sm font-semibold mb-2 text-emerald-400">Classifica</h3>
            <TournamentStandings
              tournament={tournament}
              clubId={clubId}
              groupFilter={currentGroup}
              isPublicView={true}
            />
          </div>
        </div>

        {/* Partite - 40% */}
        <div style={{ flex: '0 0 40%', minHeight: 0 }} className="overflow-hidden">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10 h-full overflow-auto">
            <h3 className="text-sm font-semibold mb-2 text-emerald-400">Partite</h3>
            <TournamentMatches
              tournament={tournament}
              clubId={clubId}
              groupFilter={currentGroup}
              isPublicView={true}
              fontScale={0.75}
              gridColumns={layoutCase === 1 ? 3 : 4}
            />
          </div>
        </div>
      </div>
    );
  }

  // CASE 3: Hybrid Layout (5 teams, 10 matches)
  // 80% classifica left, 20% partite right (top)
  // 100% partite bottom
  if (layoutCase === 3) {
    // Filtra le partite per il girone corrente
    const groupMatches = tournament.matches?.filter(m => m.groupId === currentGroup && m.type === 'group') || [];
    
    console.log('[LayoutGirone CASO 3] DEBUG:', {
      currentGroup,
      totalMatches: tournament.matches?.length,
      groupMatches: groupMatches.length,
      groupMatchesIds: groupMatches.map(m => m.id)
    });
    
    // Dividi le partite: prime 2 a destra, rimanenti 8 sotto
    const rightMatches = groupMatches.slice(0, 2);
    const bottomMatches = groupMatches.slice(2);

    console.log('[LayoutGirone CASO 3] SPLIT:', {
      rightMatchesCount: rightMatches.length,
      rightMatchesIds: rightMatches.map(m => m.id),
      bottomMatchesCount: bottomMatches.length,
      bottomMatchesIds: bottomMatches.map(m => m.id)
    });

    // Crea oggetti tournament separati per ogni sezione
    const tournamentRight = { ...tournament, matches: rightMatches };
    const tournamentBottom = { ...tournament, matches: bottomMatches };

    console.log('[LayoutGirone CASO 3] Tournament objects created:', {
      tournamentRightKeys: Object.keys(tournamentRight),
      tournamentRightMatchesCount: tournamentRight.matches?.length,
      tournamentBottomKeys: Object.keys(tournamentBottom),
      tournamentBottomMatchesCount: tournamentBottom.matches?.length
    });

    return (
      <div className="flex flex-col h-full gap-2 p-4" style={{ fontSize: 'clamp(0.5rem, 1vw, 1rem)' }}>
        <div className="flex-shrink-0">
          <h2 className="text-xl font-bold mb-2">Girone {currentGroup?.toUpperCase()}</h2>
        </div>

        {/* Top row: Classifica (80%) + Partite right (20%) - 50% */}
        <div className="flex gap-2" style={{ flex: '0 0 50%', minHeight: 0 }}>
          {/* Classifica left - 80% */}
          <div style={{ flex: '0 0 80%', minHeight: 0 }} className="overflow-hidden">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 h-full overflow-hidden flex flex-col">
              <h3 className="text-sm font-semibold mb-2 text-emerald-400 flex-shrink-0">Classifica</h3>
              <div className="flex-1 overflow-hidden">
                <TournamentStandings
                  tournament={tournament}
                  clubId={clubId}
                  groupFilter={currentGroup}
                  isPublicView={true}
                />
              </div>
            </div>
          </div>

          {/* Right matches - 20% - Solo prime 2 partite */}
          <div style={{ flex: '0 0 20%', minHeight: 0 }} className="overflow-hidden">
            <div className="bg-white/5 rounded-lg p-2 border border-white/10 h-full overflow-hidden flex flex-col">
              <h3 className="text-xs font-semibold mb-1 text-emerald-400 flex-shrink-0">Partite</h3>
              <div className="flex-1 overflow-hidden">
                <TournamentMatches
                  tournament={tournamentRight}
                  clubId={clubId}
                  groupFilter={null}
                  isPublicView={true}
                  fontScale={0.35}
                  gridColumns={1}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: More matches - 35% - Rimanenti 8 partite (8 colonne) */}
        <div style={{ flex: '0 0 35%', minHeight: 0 }} className="overflow-hidden">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10 h-full overflow-hidden">
            <TournamentMatches
              tournament={tournamentBottom}
              clubId={clubId}
              groupFilter={null}
              isPublicView={true}
              fontScale={0.4}
              gridColumns={8}
            />
          </div>
        </div>
      </div>
    );
  }

  // CASE 4: Hybrid Layout (6+ teams, 15+ matches)
  // 60% classifica left, 40% partite right (top)
  // 100% partite bottom
  if (layoutCase === 4) {
    // Filtra le partite per il girone corrente
    const groupMatches = tournament.matches?.filter(m => m.groupId === currentGroup && m.type === 'group') || [];
    
    console.log('[LayoutGirone CASO 4] DEBUG:', {
      currentGroup,
      totalMatches: tournament.matches?.length,
      groupMatches: groupMatches.length,
      groupMatchesIds: groupMatches.map(m => m.id)
    });
    
    // Dividi le partite: prime 6 a destra (2 colonne), rimanenti 9 sotto
    const rightMatches = groupMatches.slice(0, 6);
    const bottomMatches = groupMatches.slice(6);

    console.log('[LayoutGirone CASO 4] SPLIT:', {
      rightMatchesCount: rightMatches.length,
      rightMatchesIds: rightMatches.map(m => m.id),
      bottomMatchesCount: bottomMatches.length,
      bottomMatchesIds: bottomMatches.map(m => m.id)
    });

    // Crea oggetti tournament separati per ogni sezione
    const tournamentRight = { ...tournament, matches: rightMatches };
    const tournamentBottom = { ...tournament, matches: bottomMatches };

    console.log('[LayoutGirone CASO 4] Tournament objects created:', {
      tournamentRightMatchesCount: tournamentRight.matches?.length,
      tournamentBottomMatchesCount: tournamentBottom.matches?.length
    });

    return (
      <div className="flex flex-col h-full gap-2 p-4" style={{ fontSize: 'clamp(0.5rem, 1vw, 1rem)' }}>
        <div className="flex-shrink-0">
          <h2 className="text-xl font-bold mb-2">Girone {currentGroup?.toUpperCase()}</h2>
        </div>

        {/* Top row: Classifica (60%) + Partite right (40%) - 50% */}
        <div className="flex gap-2" style={{ flex: '0 0 50%', minHeight: 0 }}>
          {/* Classifica left - 60% */}
          <div style={{ flex: '0 0 60%', minHeight: 0 }} className="overflow-hidden">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 h-full overflow-hidden flex flex-col">
              <h3 className="text-sm font-semibold mb-2 text-emerald-400 flex-shrink-0">Classifica</h3>
              <div className="flex-1 overflow-hidden">
                <TournamentStandings
                  tournament={tournament}
                  clubId={clubId}
                  groupFilter={currentGroup}
                  isPublicView={true}
                />
              </div>
            </div>
          </div>

          {/* Right matches - 40% - Prime 6 partite (3 colonne) */}
          <div style={{ flex: '0 0 40%', minHeight: 0 }} className="overflow-hidden">
            <div className="bg-white/5 rounded-lg p-2 border border-white/10 h-full overflow-hidden flex flex-col">
              <h3 className="text-xs font-semibold mb-1 text-emerald-400 flex-shrink-0">Partite</h3>
              <div className="flex-1 overflow-hidden">
                <TournamentMatches
                  tournament={tournamentRight}
                  clubId={clubId}
                  groupFilter={null}
                  isPublicView={true}
                  fontScale={0.35}
                  gridColumns={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: More matches - 35% - Rimanenti 9 partite (9 colonne) */}
        <div style={{ flex: '0 0 35%', minHeight: 0 }} className="overflow-hidden">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10 h-full overflow-hidden">
            <TournamentMatches
              tournament={tournamentBottom}
              clubId={clubId}
              groupFilter={null}
              isPublicView={true}
              fontScale={0.4}
              gridColumns={9}
            />
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}

export default LayoutGirone;
