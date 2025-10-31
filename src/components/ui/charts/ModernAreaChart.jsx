// =============================================
// FILE: src/components/ui/charts/ModernAreaChart.jsx
// =============================================
import React, { useMemo, useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const UNIFIED_COLORS = {
  primary: '#3b82f6', // blue-500
  success: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  purple: '#8b5cf6', // violet-500
  indigo: '#6366f1', // indigo-500
  cyan: '#06b6d4', // cyan-500
  orange: '#f97316', // orange-500
};

export default function ModernAreaChart({
  data,
  dataKey = 'rating',
  compareDataKey = null,
  comparePlayerName = null,
  chartId = 'modern-area',
  color = 'success',
  title = 'Trend ultime 10 partite',
  showGrid = true,
  multiPlayer = false,
  top5Players = [],
  xKey = 'matchNumber',
  yKey = 'rating',
}) {
  const areaColor = UNIFIED_COLORS[color] || UNIFIED_COLORS.success;
  const compareColor = '#8B5CF6'; // Colore viola per il confronto

  // Prendi solo le ultime 10 entries (o tutti i dati se multiPlayer)
  const chartData = multiPlayer ? data : data.slice(-10);

  // Genera colori per i top 5 players
  const playerColors = (top5Players || []).map((_, index) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    return colors[index % colors.length];
  });

  // Stato per la visibilità dei giocatori nel multiPlayer
  const [visiblePlayers, setVisiblePlayers] = useState(() => {
    // Di default tutti i giocatori sono visibili
    return new Set((top5Players || []).map((player) => player.id));
  });

  // Stato per il popup mobile
  const [showMobilePopup, setShowMobilePopup] = useState(false);

  // Aggiorna lo stato quando cambiano i top5Players
  useEffect(() => {
    if (multiPlayer && top5Players && top5Players.length > 0) {
      setVisiblePlayers(new Set(top5Players.map((player) => player.id)));
    }
  }, [top5Players, multiPlayer]);

  // Funzione per toggle della visibilità di un giocatore
  const togglePlayerVisibility = (playerId) => {
    setVisiblePlayers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  // Funzione per mostrare/nascondere tutti i giocatori
  const toggleAllPlayers = () => {
    const allVisible = (top5Players || []).every((player) => visiblePlayers.has(player.id));
    if (allVisible) {
      // Se tutti sono visibili, nascondi tutti
      setVisiblePlayers(new Set());
    } else {
      // Altrimenti, mostra tutti
      setVisiblePlayers(new Set((top5Players || []).map((player) => player.id)));
    }
  };

  // Calcola gli ultimi 10 dati per la tendenza
  const last10Data = useMemo(() => {
    if (multiPlayer) {
      // Per multiPlayer, prendiamo gli ultimi 10 punti del dataset
      return chartData.slice(-10);
    } else {
      // Logica originale per single player
      return chartData; // chartData è già limitato a 10 elementi per single player
    }
  }, [chartData, multiPlayer]);

  // Calcola il range dell'asse Y basato sui dati visibili
  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0) return ['auto', 'auto'];

    let minValue = Infinity;
    let maxValue = -Infinity;

    if (multiPlayer && top5Players && top5Players.length > 0) {
      // Per multiPlayer, controlla solo i valori dei giocatori visibili
      chartData.forEach((point) => {
        top5Players
          .filter((player) => visiblePlayers.has(player.id))
          .forEach((player) => {
            const dataKey = yKey === 'rating' ? player.name : `${player.name}_${yKey}`;
            const playerValue = point[dataKey];
            if (typeof playerValue === 'number') {
              minValue = Math.min(minValue, playerValue);
              maxValue = Math.max(maxValue, playerValue);
            }
          });
      });
    } else {
      // Logica originale per single player
      chartData.forEach((point) => {
        // Controlla il valore principale
        const value = point[dataKey];
        if (typeof value === 'number') {
          minValue = Math.min(minValue, value);
          maxValue = Math.max(maxValue, value);
        }

        // Controlla il valore di confronto se presente
        if (compareDataKey && typeof point[compareDataKey] === 'number') {
          minValue = Math.min(minValue, point[compareDataKey]);
          maxValue = Math.max(maxValue, point[compareDataKey]);
        }
      });
    }

    if (minValue === Infinity) return ['auto', 'auto'];

    // Aggiungi un buffer del 8% sopra e sotto per dare più respiro al grafico
    const range = maxValue - minValue;
    const buffer = range * 0.08;

    return [Math.max(0, Math.floor(minValue - buffer)), Math.ceil(maxValue + buffer)];
  }, [
    chartData,
    dataKey,
    compareDataKey,
    multiPlayer,
    top5Players,
    yKey,
    multiPlayer ? visiblePlayers : null,
  ]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Estrai la data dal payload se disponibile
      const dataPoint = payload[0]?.payload;
      const displayLabel = dataPoint?.label || `Giorno ${label}`;

      return (
        <div className="bg-white/95 bg-gray-800/95 backdrop-blur-sm border border-gray-200 border-gray-700 rounded-xl shadow-xl p-4">
          <p className="text-sm font-semibold text-gray-900 text-gray-100 mb-2">{displayLabel}</p>
          {multiPlayer
            ? // Tooltip per multiPlayer - mostra solo giocatori visibili
              top5Players
                .filter((player) => visiblePlayers.has(player.id))
                .map((player, filteredIndex) => {
                  const originalIndex = top5Players.findIndex((p) => p.id === player.id);
                  const dataKey = yKey === 'rating' ? player.name : `${player.name}_${yKey}`;
                  const playerValue = dataPoint?.[dataKey];
                  if (playerValue !== undefined) {
                    const suffix = yKey === 'rating' ? ' pt' : '%';
                    const displayValue =
                      yKey === 'rating' ? Math.round(playerValue) : playerValue?.toFixed(1);

                    return (
                      <div key={player.id} className="flex items-center gap-2 mb-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: playerColors[originalIndex] }}
                        ></div>
                        <span className="text-sm text-gray-700 text-gray-300">
                          {player.name}: {displayValue}
                          {suffix}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })
            : // Tooltip originale per single player
              payload.map((entry, index) => {
                // Determina se il valore è un rating (non dovrebbe avere %)
                const isRating =
                  entry.name === 'rating' ||
                  entry.name === 'playerRating' ||
                  entry.name === 'compareRating' ||
                  entry.name === dataKey ||
                  entry.name === compareDataKey;

                // Formatta il valore
                let displayValue = entry.value;
                if (typeof displayValue === 'number') {
                  displayValue = isRating ? Math.round(displayValue) : displayValue.toFixed(1);
                }

                // Determina il nome da mostrare
                let displayName = entry.name;
                if (entry.name === compareDataKey && comparePlayerName) {
                  displayName = comparePlayerName;
                } else if (entry.name === 'playerRating') {
                  displayName = 'Ranking';
                } else if (entry.name === 'compareRating') {
                  displayName = 'Confronto';
                }

                return (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-sm text-gray-700 text-gray-300">
                      {displayName}: {displayValue}
                      {isRating ? ' pt' : ''}
                    </span>
                  </div>
                );
              })}
        </div>
      );
    }
    return null;
  };

  // Calcola la tendenza
  const trend = useMemo(() => {
    if (last10Data.length <= 1) return 0;

    if (multiPlayer && top5Players && top5Players.length > 0) {
      // Per multiPlayer, calcola la tendenza del primo giocatore come riferimento
      const firstPlayer = top5Players[0];
      const playerKey = yKey === 'rating' ? firstPlayer.name : `${firstPlayer.name}_${yKey}`;
      const firstValue = last10Data[0][playerKey];
      const lastValue = last10Data[last10Data.length - 1][playerKey];
      return typeof firstValue === 'number' && typeof lastValue === 'number'
        ? lastValue - firstValue
        : 0;
    } else {
      // Logica originale per single player
      const firstValue = last10Data[0][dataKey];
      const lastValue = last10Data[last10Data.length - 1][dataKey];
      return typeof firstValue === 'number' && typeof lastValue === 'number'
        ? lastValue - firstValue
        : 0;
    }
  }, [last10Data, multiPlayer, top5Players, yKey, dataKey]);

  const trendColor = trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#6b7280';
  const trendIcon = trend > 0 ? '↗' : trend < 0 ? '↘' : '→';

  return (
    <div className="h-64 sm:h-80 mb-8 md:mb-12">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ left: 10, right: 10, top: 20, bottom: 20 }}>
          <defs>
            <linearGradient id={`modernGradient-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={areaColor} stopOpacity={0.4} />
              <stop offset="50%" stopColor={areaColor} stopOpacity={0.2} />
              <stop offset="100%" stopColor={areaColor} stopOpacity={0.05} />
            </linearGradient>
            {compareDataKey && (
              <linearGradient id={`compareGradient-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={compareColor} stopOpacity={0.3} />
                <stop offset="50%" stopColor={compareColor} stopOpacity={0.15} />
                <stop offset="100%" stopColor={compareColor} stopOpacity={0.03} />
              </linearGradient>
            )}
            {multiPlayer &&
              (top5Players || []).map((player, index) => (
                <linearGradient
                  key={player.id}
                  id={`player-${index}-gradient-${chartId}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={playerColors[index]} stopOpacity={0.3} />
                  <stop offset="50%" stopColor={playerColors[index]} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={playerColors[index]} stopOpacity={0.03} />
                </linearGradient>
              ))}
            <filter id={`glow-${chartId}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {showGrid && (
            <CartesianGrid
              strokeDasharray="2 4"
              strokeOpacity={0.15}
              horizontal={true}
              vertical={false}
            />
          )}

          <XAxis
            dataKey={multiPlayer ? xKey : 'label'}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            interval={
              !multiPlayer && chartData.length > 8
                ? Math.ceil(chartData.length / 5) - 1
                : 'preserveStartEnd'
            }
            tickFormatter={(value, index) => {
              // Se stiamo usando il sistema basato sui giorni, mostra solo alcune etichette
              if (multiPlayer && xKey === 'day' && chartData) {
                const dataPoint = chartData[index];
                if (dataPoint?.label) {
                  // Mostra l'etichetta solo ogni 3 giorni per evitare sovrapposizioni
                  return value % 3 === 0 ? dataPoint.label : '';
                }
              }

              // Per le statistiche (single player), abbrevia le etichette lunghe
              if (!multiPlayer && typeof value === 'string') {
                // Se l'etichetta contiene data e ora, estrai solo la data
                if (value.includes(',') && value.length > 10) {
                  // Formato "12/09, 14:30" -> "12/09"
                  return value.split(',')[0];
                }
                // Se è "Start", mantieni come tale
                if (value === 'Start') {
                  return value;
                }
                // Se è troppo lunga, tronca
                if (value.length > 8) {
                  return value.substring(0, 8);
                }
              }

              return value;
            }}
          />

          <YAxis
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            width={50}
            domain={yAxisDomain}
            scale="linear"
          />

          <Tooltip content={<CustomTooltip />} />

          {multiPlayer ? (
            // Render multiple areas for top 5 players
            top5Players
              .filter((player) => visiblePlayers.has(player.id))
              .map((player, index) => {
                // Trova l'indice originale per mantenere i colori consistenti
                const originalIndex = top5Players.findIndex((p) => p.id === player.id);

                // Usa player.name direttamente per i dati del ranking, altrimenti usa il formato completo
                const dataKey = yKey === 'rating' ? player.name : `${player.name}_${yKey}`;

                return (
                  <Area
                    key={player.id}
                    type="monotone"
                    dataKey={dataKey}
                    stroke={playerColors[originalIndex]}
                    strokeWidth={2}
                    fill={`url(#player-${originalIndex}-gradient-${chartId})`}
                    dot={{
                      r: 2,
                      fill: playerColors[originalIndex],
                      stroke: 'white',
                      strokeWidth: 1,
                    }}
                    activeDot={{
                      r: 4,
                      fill: playerColors[originalIndex],
                      stroke: 'white',
                      strokeWidth: 2,
                    }}
                    className="drop-shadow-sm"
                    connectNulls={false}
                  />
                );
              })
          ) : (
            // Original single player area
            <>
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={areaColor}
                strokeWidth={3}
                fill={`url(#modernGradient-${chartId})`}
                dot={{
                  r: 3,
                  fill: areaColor,
                  stroke: 'white',
                  strokeWidth: 2,
                  filter: `url(#glow-${chartId})`,
                }}
                activeDot={{
                  r: 6,
                  fill: areaColor,
                  stroke: 'white',
                  strokeWidth: 3,
                  className: 'drop-shadow-lg animate-pulse',
                }}
                className="drop-shadow-sm"
              />

              {/* Linea di confronto se presente */}
              {compareDataKey && (
                <Area
                  type="monotone"
                  dataKey={compareDataKey}
                  stroke={compareColor}
                  strokeWidth={2}
                  fill={`url(#compareGradient-${chartId})`}
                  dot={{
                    r: 2,
                    fill: compareColor,
                    stroke: 'white',
                    strokeWidth: 1,
                  }}
                  activeDot={{
                    r: 5,
                    fill: compareColor,
                    stroke: 'white',
                    strokeWidth: 2,
                    className: 'drop-shadow-lg',
                  }}
                  className="drop-shadow-sm"
                />
              )}
            </>
          )}
          <Area
            type="monotone"
            dataKey={compareDataKey}
            stroke={compareColor}
            strokeWidth={2}
            strokeDasharray="5 5"
            fill={`url(#compareGradient-${chartId})`}
            dot={{
              r: 2,
              fill: compareColor,
              stroke: 'white',
              strokeWidth: 1,
            }}
            activeDot={{
              r: 5,
              fill: compareColor,
              stroke: 'white',
              strokeWidth: 2,
              className: 'drop-shadow-lg',
            }}
            className="drop-shadow-sm"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex justify-between items-center mt-3 px-2">
        <span className="text-xs font-medium text-gray-600 text-gray-400">{title}</span>
        <div className="flex items-center gap-2">
          {chartData.length > 1 && (
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold" style={{ color: trendColor }}>
                {trendIcon} {Math.abs(trend).toFixed(0)}
              </span>
            </div>
          )}
          <span className="text-xs text-gray-500">{last10Data.length} partite</span>
        </div>
      </div>

      {/* Legenda per il confronto */}
      {compareDataKey && comparePlayerName && !multiPlayer && (
        <div className="flex justify-center gap-4 mt-2 px-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-current" style={{ color: areaColor }}></div>
            <span className="text-xs text-gray-600 text-gray-400">Giocatore principale</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-0.5 border-b-2 border-dashed"
              style={{ borderColor: compareColor }}
            ></div>
            <span className="text-xs text-gray-600 text-gray-400">{comparePlayerName}</span>
          </div>
        </div>
      )}

      {/* Legenda per multiPlayer - Responsive */}
      {multiPlayer && top5Players && top5Players.length > 0 && (
        <div className="mt-4 mb-6 md:mt-8 md:mb-20 px-2">
          {/* Versione Mobile - Pulsante per popup */}
          <div className="block md:hidden">
            <div className="text-center space-y-3">
              <button
                onClick={() => setShowMobilePopup(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-lg"
              >
                <span>🎛️</span>
                <span>Seleziona Giocatori</span>
                <span className="bg-blue-400 text-white text-xs px-2 py-0.5 rounded-full">
                  {visiblePlayers.size}/{top5Players.length}
                </span>
              </button>
              <div>
                <span className="text-xs text-gray-400 text-gray-500">
                  💡 Tocca per personalizzare la visualizzazione
                </span>
              </div>
            </div>
          </div>

          {/* Versione Desktop - Controlli inline */}
          <div className="hidden md:block">
            <div className="flex flex-wrap justify-center gap-3">
              {top5Players.map((player, index) => {
                const isVisible = visiblePlayers.has(player.id);
                return (
                  <button
                    key={player.id}
                    onClick={() => togglePlayerVisibility(player.id)}
                    className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-200 hover:bg-gray-100 hover:bg-gray-700 ${
                      isVisible ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                    }`}
                    title={isVisible ? `Nascondi ${player.name}` : `Mostra ${player.name}`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        isVisible ? 'scale-100' : 'scale-75'
                      }`}
                      style={{
                        backgroundColor: isVisible ? playerColors[index] : '#d1d5db',
                        border: isVisible ? 'none' : `2px solid ${playerColors[index]}`,
                      }}
                    ></div>
                    <span
                      className={`text-xs transition-colors duration-200 ${
                        isVisible ? 'text-gray-600 text-gray-400' : 'text-gray-400 text-gray-500'
                      }`}
                    >
                      {player.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="text-center mt-2 space-y-1">
              <div>
                <button
                  onClick={toggleAllPlayers}
                  className="text-xs text-blue-500 hover:text-blue-700 text-blue-400 hover:text-blue-300 transition-colors duration-200 px-2 py-1 rounded hover:bg-blue-50 hover:bg-blue-900/20"
                >
                  {top5Players.every((player) => visiblePlayers.has(player.id))
                    ? 'Nascondi tutti'
                    : 'Mostra tutti'}
                </button>
              </div>
              <div>
                <span className="text-xs text-gray-400 text-gray-500">
                  💡 Clicca sui nomi per mostrare/nascondere le linee
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup Mobile per selezione giocatori */}
      {showMobilePopup && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50 backdrop-blur-sm pb-8 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMobilePopup(false);
            }
          }}
        >
          <div className="bg-white bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm max-h-[60vh] overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 from-blue-900/20 to-purple-900/20">
              <h3 className="text-lg font-semibold text-gray-900 text-white flex items-center gap-2">
                <span>🎛️</span>
                Seleziona Giocatori
              </h3>
              <button
                onClick={() => setShowMobilePopup(false)}
                className="p-2 hover:bg-gray-100 hover:bg-gray-700 rounded-full transition-colors"
              >
                <span className="text-lg text-gray-500">×</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[50vh]">
              {/* Toggle All Button */}
              <div className="flex justify-center">
                <button
                  onClick={toggleAllPlayers}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  {top5Players.every((player) => visiblePlayers.has(player.id))
                    ? 'Nascondi tutti'
                    : 'Mostra tutti'}
                </button>
              </div>

              {/* Players List */}
              <div className="space-y-3">
                {top5Players.map((player, index) => {
                  const isVisible = visiblePlayers.has(player.id);
                  return (
                    <button
                      key={player.id}
                      onClick={() => togglePlayerVisibility(player.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                        isVisible
                          ? 'border-blue-200 bg-blue-50 border-blue-800 bg-blue-900/20'
                          : 'border-gray-200 bg-gray-50 border-gray-700 bg-gray-700/50'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                          isVisible ? 'scale-100' : 'scale-75'
                        }`}
                        style={{
                          backgroundColor: isVisible ? playerColors[index] : '#d1d5db',
                          border: isVisible ? 'none' : `2px solid ${playerColors[index]}`,
                        }}
                      >
                        {isVisible && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span
                        className={`text-sm font-medium transition-colors duration-200 ${
                          isVisible ? 'text-blue-900 text-blue-100' : 'text-gray-500 text-gray-400'
                        }`}
                      >
                        {player.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Footer Info */}
              <div className="text-center pt-2 border-t border-gray-200 border-gray-700">
                <span className="text-xs text-gray-500 text-gray-400">
                  {visiblePlayers.size} di {top5Players.length} giocatori selezionati
                </span>
              </div>
            </div>

            {/* Close Button */}
            <div className="p-4 border-t border-gray-200 border-gray-700">
              <button
                onClick={() => setShowMobilePopup(false)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 bg-gray-700 hover:bg-gray-600 text-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors duration-200"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
