// =============================================
// FILE: src/features/classifica/ShareRankingCard.jsx
// Modal per selezionare e condividere classifiche
// con logo PlaySport e logo/nome circolo
// Stile coerente con il tema dark del sito
// =============================================
import { useRef, useState } from 'react';

// Tipi di classifica disponibili
const RANKING_TYPES = {
  RPA: { id: 'rpa', label: 'Ranking RPA', emoji: '🏆', color: 'from-yellow-400 to-orange-500' },
  COPPIE: { id: 'coppie', label: 'Migliori Coppie', emoji: '👥', color: 'from-amber-400 to-orange-500' },
  EFFICIENZA: { id: 'efficienza', label: 'Efficienza', emoji: '⚡', color: 'from-blue-400 to-cyan-500' },
  STREAK: { id: 'streak', label: 'Streak Vittorie', emoji: '🔥', color: 'from-green-400 to-emerald-500' },
  INGIOCABILI: { id: 'ingiocabili', label: 'Ingiocabili', emoji: '🛡️', color: 'from-purple-400 to-pink-500' },
};

/**
 * Genera un'immagine PNG della card ranking per condivisione social
 */
async function generateCardImage(cardRef) {
  if (!cardRef?.current) return null;
  
  try {
    const { toPng } = await import('html-to-image');
    // Usa sempre il background dark del sito (gray-900)
    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 2,
      backgroundColor: '#111827', // gray-900
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

/**
 * Card singola per una classifica specifica
 * REPLICA ESATTA delle tabelle visualizzate in Classifica.jsx
 * Come un vero screenshot della classifica
 */
function RankingCard({ 
  type, 
  data, 
  clubName, 
  clubLogo, 
  cardRef 
}) {
  const rankingType = RANKING_TYPES[type];
  const maxItems = type === 'RPA' ? 10 : 5;
  
  return (
    <div
      ref={cardRef}
      className="p-5 rounded-2xl relative overflow-hidden bg-gray-800/90 backdrop-blur-xl border border-gray-700/30"
      style={{ width: '100%' }}
    >
      {/* Background gradient come nel sito */}
      <div className={`absolute inset-0 bg-gradient-to-r ${
        type === 'RPA' ? 'from-blue-500/10 to-purple-500/10' :
        type === 'COPPIE' ? 'from-amber-500/10 to-orange-500/10' :
        type === 'EFFICIENZA' ? 'from-blue-500/10 to-cyan-500/10' :
        type === 'STREAK' ? 'from-green-500/10 to-emerald-500/10' :
        'from-purple-500/10 to-pink-500/10'
      } rounded-2xl`}></div>

      {/* Header con loghi */}
      <div className="relative flex items-center justify-between mb-4">
        <img 
          src="/play-sport-pro_horizontal.svg" 
          alt="PlaySport Pro" 
          className="h-5"
          crossOrigin="anonymous"
        />
        <div className="flex items-center gap-2">
          {clubLogo ? (
            <img 
              src={clubLogo} 
              alt={clubName} 
              className="w-7 h-7 rounded-lg object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${rankingType.color} flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">
                {clubName?.charAt(0) || 'C'}
              </span>
            </div>
          )}
          <span className="text-xs font-semibold text-gray-200">
            {clubName || 'Club'}
          </span>
        </div>
      </div>

      {/* Titolo classifica */}
      <div className="relative flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rankingType.color} flex items-center justify-center shadow-lg`}>
          <span className="text-xl">{rankingType.emoji}</span>
        </div>
        <h3 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          {rankingType.label}
        </h3>
      </div>

      {/* TABELLA COMPLETA - Identica alla visualizzazione in app */}
      <div className="relative overflow-hidden rounded-xl bg-gray-700/30 border border-gray-600/20">
        <table className="w-full text-xs">
          {/* Header tabella */}
          <thead>
            <tr className="border-b border-gray-600/30 text-gray-400 text-[10px] uppercase tracking-wide">
              <th className="py-2 px-2 font-semibold text-center w-8">#</th>
              <th className="py-2 px-2 font-semibold text-left">
                {type === 'COPPIE' ? 'Coppia' : 'Giocatore'}
              </th>
              {type === 'RPA' && (
                <>
                  <th className="py-2 px-1 font-semibold text-center">Ranking</th>
                  <th className="py-2 px-1 font-semibold text-center">V</th>
                  <th className="py-2 px-1 font-semibold text-center">S</th>
                  <th className="py-2 px-1 font-semibold text-center">%</th>
                </>
              )}
              {type === 'COPPIE' && (
                <>
                  <th className="py-2 px-1 font-semibold text-center">V</th>
                  <th className="py-2 px-1 font-semibold text-center">S</th>
                  <th className="py-2 px-1 font-semibold text-center">%</th>
                </>
              )}
              {type === 'EFFICIENZA' && (
                <>
                  <th className="py-2 px-1 font-semibold text-center">Eff.</th>
                  <th className="py-2 px-1 font-semibold text-center">V</th>
                  <th className="py-2 px-1 font-semibold text-center">S</th>
                </>
              )}
              {type === 'STREAK' && (
                <>
                  <th className="py-2 px-1 font-semibold text-center">🔥</th>
                  <th className="py-2 px-1 font-semibold text-center">V</th>
                  <th className="py-2 px-1 font-semibold text-center">S</th>
                </>
              )}
              {type === 'INGIOCABILI' && (
                <>
                  <th className="py-2 px-1 font-semibold text-center">%V</th>
                  <th className="py-2 px-1 font-semibold text-center">V</th>
                  <th className="py-2 px-1 font-semibold text-center">S</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, maxItems).map((item, idx) => (
              <tr 
                key={item.id || item.key || idx}
                className={`border-b border-gray-700/20 ${idx === 0 ? 'bg-yellow-500/5' : ''}`}
              >
                {/* Posizione */}
                <td className="py-2 px-2 text-center">
                  {idx === 0 && <span className="text-sm">🥇</span>}
                  {idx === 1 && <span className="text-sm">🥈</span>}
                  {idx === 2 && <span className="text-sm">🥉</span>}
                  {idx > 2 && <span className="text-gray-400 font-semibold">{idx + 1}</span>}
                </td>
                
                {/* Nome giocatore/coppia */}
                <td className="py-2 px-2 text-left">
                  <span className="font-medium text-gray-100 text-[11px]">
                    {type === 'COPPIE' 
                      ? `${item.players?.[0] || ''} & ${item.players?.[1] || ''}`
                      : item.name || 'Giocatore'
                    }
                  </span>
                </td>

                {/* Statistiche specifiche per tipo */}
                {type === 'RPA' && (
                  <>
                    <td className="py-2 px-1 text-center font-bold text-white">
                      {Math.round(item.rating || 0)}
                    </td>
                    <td className="py-2 px-1 text-center text-green-400 font-semibold">
                      {item.wins || 0}
                    </td>
                    <td className="py-2 px-1 text-center text-red-400 font-semibold">
                      {item.losses || 0}
                    </td>
                    <td className="py-2 px-1 text-center text-gray-200 font-bold">
                      {item.winRate?.toFixed(0) || 0}%
                    </td>
                  </>
                )}
                {type === 'COPPIE' && (
                  <>
                    <td className="py-2 px-1 text-center text-green-400 font-semibold">
                      {item.wins || 0}
                    </td>
                    <td className="py-2 px-1 text-center text-red-400 font-semibold">
                      {item.losses || 0}
                    </td>
                    <td className="py-2 px-1 text-center text-amber-300 font-bold">
                      {item.winRate?.toFixed(0) || 0}%
                    </td>
                  </>
                )}
                {type === 'EFFICIENZA' && (
                  <>
                    <td className="py-2 px-1 text-center text-cyan-400 font-bold">
                      {item.efficiency?.toFixed(1) || 0}%
                    </td>
                    <td className="py-2 px-1 text-center text-green-400 font-semibold">
                      {item.wins || 0}
                    </td>
                    <td className="py-2 px-1 text-center text-red-400 font-semibold">
                      {item.losses || 0}
                    </td>
                  </>
                )}
                {type === 'STREAK' && (
                  <>
                    <td className="py-2 px-1 text-center text-green-400 font-bold">
                      {item.bestWinStreak || 0}
                    </td>
                    <td className="py-2 px-1 text-center text-green-400 font-semibold">
                      {item.totalWins || 0}
                    </td>
                    <td className="py-2 px-1 text-center text-red-400 font-semibold">
                      {item.totalLosses || 0}
                    </td>
                  </>
                )}
                {type === 'INGIOCABILI' && (
                  <>
                    <td className="py-2 px-1 text-center text-purple-400 font-bold">
                      {item.winRate?.toFixed(0) || 0}%
                    </td>
                    <td className="py-2 px-1 text-center text-green-400 font-semibold">
                      {item.totalWins || 0}
                    </td>
                    <td className="py-2 px-1 text-center text-red-400 font-semibold">
                      {item.totalLosses || 0}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con info */}
      <div className="relative mt-3 flex items-center justify-between text-[9px] text-gray-500">
        <span>Top {maxItems} • {new Date().toLocaleDateString('it-IT')}</span>
        <span>www.play-sport.pro</span>
      </div>
    </div>
  );
}

/**
 * Modal principale per selezionare e condividere classifiche
 * Stile coerente con il tema dark del sito
 */
export default function ShareRankingCard({
  clubName,
  clubLogo,
  onClose,
  // Dati delle classifiche
  rpaData = [],
  coppieData = [],
  efficienzaData = [],
  streakData = [],
  ingiocabiliData = [],
}) {
  const [selectedTypes, setSelectedTypes] = useState(['RPA']);
  const [currentPreview, setCurrentPreview] = useState('RPA');
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const cardRef = useRef(null);

  // Toggle selezione classifica
  const toggleSelection = (type) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        // Non permettere di deselezionare se è l'unico
        if (prev.length === 1) return prev;
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
    setCurrentPreview(type);
  };

  // Ottieni i dati per un tipo di classifica
  const getDataForType = (type) => {
    switch (type) {
      case 'RPA': return rpaData;
      case 'COPPIE': return coppieData;
      case 'EFFICIENZA': return efficienzaData;
      case 'STREAK': return streakData;
      case 'INGIOCABILI': return ingiocabiliData;
      default: return [];
    }
  };

  // Download immagine
  const downloadImage = (dataUrl, typeName) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `classifica-${typeName}-${clubName?.replace(/\s+/g, '-').toLowerCase() || 'club'}.png`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 100);
  };

  // Genera e condividi tutte le immagini selezionate
  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const files = [];
      
      // Genera immagine per ogni classifica selezionata
      for (const type of selectedTypes) {
        // Aggiorna preview per generare la card corretta
        setCurrentPreview(type);
        // Attendi che React re-render
        await new Promise(r => setTimeout(r, 100));
        
        const dataUrl = await generateCardImage(cardRef);
        if (dataUrl) {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File(
            [blob], 
            `classifica-${RANKING_TYPES[type].id}.png`, 
            { type: 'image/png' }
          );
          files.push({ file, dataUrl, type });
        }
      }

      if (files.length === 0) {
        throw new Error('Nessuna immagine generata');
      }

      // Testo per condivisione
      const shareText = `🏆 Classifiche ${clubName || 'Padel'}!\n` +
        selectedTypes.map(t => `${RANKING_TYPES[t].emoji} ${RANKING_TYPES[t].label}`).join('\n') +
        `\n#Padel #PlaySportPro`;

      // Prova Web Share API con file
      if (files.length === 1 && navigator.canShare && navigator.canShare({ files: [files[0].file] })) {
        await navigator.share({
          files: [files[0].file],
          title: `Classifica ${clubName || 'Padel'}`,
          text: shareText,
        });
        setShareSuccess(true);
      } else if (navigator.share) {
        // Condividi solo testo se non supporta file
        await navigator.share({
          title: `Classifica ${clubName || 'Padel'}`,
          text: shareText,
          url: window.location.href,
        });
        // Download delle immagini
        files.forEach(f => downloadImage(f.dataUrl, RANKING_TYPES[f.type].id));
        setShareSuccess(true);
      } else {
        // Fallback: download di tutte le immagini
        files.forEach(f => downloadImage(f.dataUrl, RANKING_TYPES[f.type].id));
        setShareSuccess(true);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Errore condivisione:', error);
        // Fallback: download
        const dataUrl = await generateCardImage(cardRef);
        if (dataUrl) downloadImage(dataUrl, RANKING_TYPES[currentPreview].id);
        setShareSuccess(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Download diretto
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      for (const type of selectedTypes) {
        setCurrentPreview(type);
        await new Promise(r => setTimeout(r, 100));
        const dataUrl = await generateCardImage(cardRef);
        if (dataUrl) downloadImage(dataUrl, RANKING_TYPES[type].id);
      }
      setShareSuccess(true);
    } catch (error) {
      console.error('Errore download:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto pb-20 md:pb-4">
      {/* Contenitore scrollabile con padding per bottom nav mobile */}
      <div className="min-h-full py-4 px-4 flex items-start md:items-center justify-center">
        {/* Modal con stesso stile dark del sito */}
        <div className="w-full max-w-lg rounded-2xl shadow-2xl bg-gray-800/90 backdrop-blur-xl border border-gray-700/30 my-2">
          {/* Header - sticky */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-700/50 sticky top-0 bg-gray-800/95 backdrop-blur-xl z-10 rounded-t-2xl">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            📤 Condividi Classifiche
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Selezione tipo classifica */}
        <div className="px-4 py-3 border-b border-gray-700/50">
          <p className="text-sm mb-3 text-gray-400">
            Seleziona le classifiche da condividere:
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(RANKING_TYPES).map(([key, config]) => {
              const isSelected = selectedTypes.includes(key);
              const hasData = getDataForType(key).length > 0;
              return (
                <button
                  key={key}
                  onClick={() => hasData && toggleSelection(key)}
                  disabled={!hasData}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                    ${isSelected 
                      ? `bg-gradient-to-r ${config.color} text-white shadow-lg` 
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/30'
                    }
                    ${!hasData ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <span>{config.emoji}</span>
                  <span>{config.label}</span>
                  {isSelected && <span>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview tabs */}
        {selectedTypes.length > 1 && (
          <div className="px-4 py-2 border-b border-gray-700/50">
            <div className="flex gap-1 overflow-x-auto">
              {selectedTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setCurrentPreview(type)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                    ${currentPreview === type
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }
                  `}
                >
                  {RANKING_TYPES[type].emoji} {RANKING_TYPES[type].label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Card Preview */}
        <div className="p-4 bg-gray-900/50">
          <RankingCard
            type={currentPreview}
            data={getDataForType(currentPreview)}
            clubName={clubName}
            clubLogo={clubLogo}
            cardRef={cardRef}
          />
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 pt-2 flex flex-wrap gap-2 bg-gray-900/50">
          <button
            onClick={handleShare}
            disabled={isGenerating || selectedTypes.length === 0}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 
              text-white font-semibold hover:from-blue-600 hover:to-indigo-700 
              disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2
              shadow-lg shadow-blue-500/20"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">⏳</span>
                Generando {selectedTypes.length} {selectedTypes.length === 1 ? 'immagine' : 'immagini'}...
              </>
            ) : (
              <>
                📤 Condividi {selectedTypes.length > 1 ? `(${selectedTypes.length})` : ''}
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            disabled={isGenerating || selectedTypes.length === 0}
            className="py-3 px-4 rounded-xl font-semibold transition-all bg-gray-700/50 text-white hover:bg-gray-600/50 border border-gray-600/30 disabled:opacity-50"
            title="Scarica immagini"
          >
            💾
          </button>
        </div>

        {/* Info selezione multipla */}
        {selectedTypes.length > 1 && (
          <div className="px-4 pb-4 bg-gray-900/50">
            <div className="p-3 rounded-xl text-sm bg-gray-800/50 text-gray-400 border border-gray-700/30">
              ℹ️ Verranno generate {selectedTypes.length} immagini separate, una per ogni classifica selezionata.
            </div>
          </div>
        )}

        {/* Success message */}
        {shareSuccess && (
          <div className="px-4 pb-4 bg-gray-900/50">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-400 text-sm text-center border border-green-500/20">
              ✅ {selectedTypes.length > 1 ? 'Immagini pronte!' : 'Immagine pronta!'} per la condivisione
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
