// =============================================
// FILE: src/features/stats/SharePlayerStats.jsx
// Component for generating shareable player stats card image
// =============================================
import { useState, useRef } from 'react';
import { useClub } from '@contexts/ClubContext.jsx';

/**
 * Genera un'immagine PNG della card per condivisione
 */
async function generateCardImage(cardRef) {
  if (!cardRef?.current) return null;
  
  try {
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 2,
      backgroundColor: '#111827',
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
      },
    });
    return dataUrl;
  } catch (error) {
    console.error('Errore generazione immagine:', error);
    return null;
  }
}

export default function SharePlayerStats({
  player,
  position,
  advancedStats,
  partnerAndOppStats,
  recentItems = [],
  players = [],
  getEffectiveRating,
  isOpen,
  onClose
}) {
  const { club } = useClub();
  const cardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  if (!isOpen || !player) return null;

  const rating = Math.round(getEffectiveRating(player.id));
  const wins = advancedStats?.wins || 0;
  const losses = advancedStats?.losses || 0;
  const winRate = advancedStats ? Math.round(advancedStats.winRate) : 0;
  const gameEfficiency = advancedStats?.gameEfficiency || 0;
  const avgDelta = advancedStats?.avgDelta || 0;
  const maxWinStreak = advancedStats?.maxWinStreak || 0;
  const currentStreak = advancedStats?.currentStreak || 0;
  const totalMatches = advancedStats?.totalMatches || 0;

  // Get last 2 items for this player (matches + tournament entries)
  const lastTwoItems = recentItems.slice(0, 2);

  const generateImage = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const dataUrl = await generateCardImage(cardRef);
      if (dataUrl) {
        setGeneratedImage(dataUrl);
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!generatedImage) {
      await generateImage();
      return;
    }

    try {
      const blob = await (await fetch(generatedImage)).blob();
      const file = new File([blob], `stats-${player.name.replace(/\s+/g, '-')}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Statistiche di ${player.name}`,
          text: `🏆 ${player.name} - Ranking ${rating} | ${wins}V-${losses}S (${winRate}%)`,
          files: [file],
        });
      } else {
        // Fallback: download
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `stats-${player.name.replace(/\s+/g, '-')}.png`;
        link.click();
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `stats-${player.name.replace(/\s+/g, '-')}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white">Condividi Statistiche</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Card Preview */}
        <div className="p-4">
          {!generatedImage ? (
            <div
              ref={cardRef}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl overflow-hidden"
              style={{ width: '100%', minHeight: '500px' }}
            >
              {/* Header with logos */}
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* PlaySport Logo - più grande */}
                    <img 
                      src="/play-sport-pro_horizontal.svg" 
                      alt="PlaySport" 
                      className="h-8"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {club?.logoUrl ? (
                      <img 
                        src={club.logoUrl} 
                        alt={club.name} 
                        className="h-8 w-8 rounded-lg object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {club?.name?.charAt(0) || 'C'}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-semibold text-gray-200">{club?.name || 'Club'}</span>
                  </div>
                </div>
              </div>

              {/* Player Name & Position */}
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{player.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Posizione</span>
                      <span className="text-lg font-bold text-blue-400">#{position || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Stats Grid */}
              <div className="grid grid-cols-3 gap-2 px-4 py-2">
                {/* Ranking */}
                <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-xl p-3 text-center border border-emerald-500/30">
                  <div className="text-xs text-emerald-300 mb-1">Ranking</div>
                  <div className="text-2xl font-bold text-emerald-400">{rating}</div>
                </div>
                
                {/* Win Rate */}
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-xl p-3 text-center border border-purple-500/30">
                  <div className="text-xs text-purple-300 mb-1">Win Rate</div>
                  <div className="text-2xl font-bold text-purple-400">{winRate}%</div>
                </div>
                
                {/* Partite */}
                <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-xl p-3 text-center border border-blue-500/30">
                  <div className="text-xs text-blue-300 mb-1">Partite</div>
                  <div className="text-2xl font-bold text-blue-400">{totalMatches}</div>
                </div>
              </div>

              {/* Record V/S */}
              <div className="px-4 py-2">
                <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
                  <div className="flex justify-center items-center gap-6">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-1">Vittorie</div>
                      <div className="text-2xl font-bold text-green-400">{wins}</div>
                    </div>
                    <div className="text-2xl text-gray-600">—</div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-1">Sconfitte</div>
                      <div className="text-2xl font-bold text-red-400">{losses}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Stats */}
              <div className="grid grid-cols-2 gap-2 px-4 py-2">
                <div className="bg-gray-800/30 rounded-lg p-2 border border-gray-700/50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Efficienza Game</span>
                    <span className="text-sm font-bold text-orange-400">{gameEfficiency}%</span>
                  </div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-2 border border-gray-700/50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Δ Medio</span>
                    <span className={`text-sm font-bold ${avgDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {avgDelta >= 0 ? '+' : ''}{avgDelta}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-2 border border-gray-700/50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Striscia Record</span>
                    <span className="text-sm font-bold text-amber-400">🔥 {maxWinStreak}</span>
                  </div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-2 border border-gray-700/50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Striscia Attiva</span>
                    <span className={`text-sm font-bold ${currentStreak > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                      {currentStreak > 0 ? `🔥 ${currentStreak}` : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ultimi 2 Risultati - Stesso formato di Storico Partite (match + tornei) */}
              {lastTwoItems.length > 0 && (
                <div className="px-4 py-2">
                  <div className="text-xs text-gray-400 font-medium mb-2">📊 Ultimi Risultati</div>
                  <div className="space-y-2">
                    {lastTwoItems.map((item, idx) => {
                      // Tipo torneo (punti campionato)
                      if (item.type === 'champ') {
                        const e = item.e;
                        const when = item.date
                          ? item.date.toLocaleDateString('it-IT', {
                              day: '2-digit',
                              month: 'short',
                            })
                          : '';
                        return (
                          <div
                            key={`entry-${e.id || idx}`}
                            className="rounded-xl p-3 bg-amber-900/20 border border-amber-700/40"
                          >
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                                  <span>🏆</span>
                                  <span className="truncate">{e.tournamentName || 'Punti torneo'}</span>
                                </div>
                                {when && (
                                  <div className="text-[10px] text-amber-300/70 mt-1">{when}</div>
                                )}
                              </div>
                              <div className="shrink-0 text-right">
                                <div className="text-sm font-bold text-amber-300">
                                  +{Math.round(e.points || 0)}
                                </div>
                                <div className="text-[10px] text-amber-300/70">punti</div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      
                      // Tipo match normale
                      const match = item.m;
                      const isA = (match.teamA || []).includes(player.id);
                      const won = (isA && match.winner === 'A') || (!isA && match.winner === 'B');
                      const delta = isA ? (match.deltaA || 0) : (match.deltaB || 0);
                      
                      // Get surnames for teams
                      const getSurname = (name) => (name || '').split(' ').pop();
                      const selfTeam = (isA ? match.teamA : match.teamB)
                        .map(id => getSurname(players.find(p => p.id === id)?.name))
                        .join(' & ');
                      const oppTeam = (isA ? match.teamB : match.teamA)
                        .map(id => getSurname(players.find(p => p.id === id)?.name))
                        .join(' & ');
                      
                      const matchDate = item.date ? item.date.toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: 'short',
                      }) : '';
                      
                      return (
                        <div 
                          key={match.id || idx}
                          className={`rounded-xl p-3 border ${won ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}
                        >
                          {/* Result badge and date */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              won 
                                ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-300' 
                                : 'bg-rose-500/20 border border-rose-400/30 text-rose-300'
                            }`}>
                              {won ? '✨ Vittoria' : '❌ Sconfitta'}
                            </span>
                            {matchDate && (
                              <span className="text-[10px] text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded">
                                {matchDate}
                              </span>
                            )}
                          </div>
                          
                          {/* Teams */}
                          <div className="flex items-center justify-between">
                            <div className="text-xs">
                              <span className={won ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                                {selfTeam}
                              </span>
                              <span className="text-gray-500 mx-1">vs</span>
                              <span className={won ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                                {oppTeam}
                              </span>
                            </div>
                            
                            {/* Score and delta */}
                            <div className="text-right">
                              <div className={`text-sm font-bold ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {delta >= 0 ? '+' : ''}{Math.round(delta)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Sets and Games */}
                          <div className="text-[10px] text-gray-400 mt-1">
                            Sets {isA ? match.setsA : match.setsB}–{isA ? match.setsB : match.setsA} • Games {isA ? match.gamesA : match.gamesB}–{isA ? match.gamesB : match.gamesA}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-4 py-3 mt-2 border-t border-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">www.play-sport.pro</span>
                  <span className="text-xs text-gray-500">
                    {new Date().toLocaleDateString('it-IT')}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <img 
              src={generatedImage} 
              alt="Player Stats" 
              className="w-full rounded-xl"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-700">
          {!generatedImage ? (
            <button
              onClick={generateImage}
              disabled={isGenerating}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
            >
              {isGenerating ? 'Generazione...' : '📸 Genera Immagine'}
            </button>
          ) : (
            <>
              <button
                onClick={() => setGeneratedImage(null)}
                className="px-4 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all"
              >
                ↩️ Indietro
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all"
              >
                💾 Scarica
              </button>
              <button
                onClick={handleShare}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all"
              >
                📤 Condividi
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
