// =============================================
// FILE: src/components/ui/charts/MobileRankingChart.jsx
// =============================================
import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const PODIUM_COLORS = [
  '#ffd700', // Oro - primo posto
  '#c0c0c0', // Argento - secondo posto  
  '#cd7f32', // Bronzo - terzo posto
  '#3b82f6', // Blu - quarto
  '#10b981', // Verde - quinto
  '#8b5cf6', // Viola - sesto
  '#f59e0b', // Arancione - settimo
  '#ef4444', // Rosso - ottavo
  '#06b6d4', // Ciano - nono
  '#84cc16'  // Lima - decimo
];

export default function MobileRankingChart({ 
  data, 
  seriesKeys = [], 
  chartId = 'universal-ranking',
  title = 'Evoluzione Classifica',
  selectedCount = 3,
  playerRankings = []
}) {

  const [selectedPlayers, setSelectedPlayers] = useState(new Set(seriesKeys.slice(0, 3)));
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  // Detect window resize per layout responsive
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Prepara i dati per il grafico con logica responsive
  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    
    // Su mobile limita i punti, su desktop mostra di più
    const maxPoints = isMobile ? 8 : 15;
    const lastPoints = data.slice(-maxPoints);
    
    return lastPoints.map((point, index) => ({
      index: index + 1,
      period: isMobile ? `P${index + 1}` : `Partita ${index + 1}`,
      ...seriesKeys.reduce((acc, key) => {
        acc[key] = point[key] || 0;
        return acc;
      }, {})
    }));
  }, [data, seriesKeys, isMobile]);

  // Gestisci selezione player per mobile
  const togglePlayer = (playerName) => {
    const newSelection = new Set(selectedPlayers);
    if (newSelection.has(playerName)) {
      newSelection.delete(playerName);
    } else {
      newSelection.add(playerName);
    }
    setSelectedPlayers(newSelection);
  };

  const visiblePlayers = showAll ? seriesKeys : seriesKeys.slice(0, selectedCount);
  const activeLines = showAll ? visiblePlayers.filter(key => selectedPlayers.has(key)) : visiblePlayers;

  // Tooltip responsive ottimizzato
  const ResponsiveTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-xs">
          <p className={`font-semibold text-gray-900 dark:text-gray-100 mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
            {label}
          </p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className={`text-gray-600 dark:text-gray-400 truncate ${isMobile ? 'text-xs max-w-20' : 'text-sm max-w-28'}`}>
                    {isMobile ? entry.dataKey.split(' ')[0] : entry.dataKey}
                  </span>
                </div>
                <span className={`font-bold ${isMobile ? 'text-xs' : 'text-sm'}`} style={{ color: entry.color }}>
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Chart responsive ottimizzato */}
      <div className={`${isMobile ? 'h-64' : 'h-80 md:h-96'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={chartData}
            margin={{ 
              left: isMobile ? 10 : 20, 
              right: isMobile ? 10 : 20, 
              top: 20, 
              bottom: isMobile ? 10 : 20 
            }}
          >
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: isMobile ? 10 : 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            
            <YAxis 
              tick={{ fontSize: isMobile ? 10 : 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              width={isMobile ? 35 : 45}
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            
            <Tooltip content={<ResponsiveTooltip />} />
            
            {/* Legend responsive - Solo su schermi medi/grandi */}
            {!isMobile && (
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }}
                iconType="line"
              />
            )}
            
            {/* Linee per giocatori attivi */}
            {activeLines.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={PODIUM_COLORS[seriesKeys.indexOf(key)] || `hsl(${index * 45}, 70%, 50%)`}
                strokeWidth={selectedPlayers.has(key) ? (isMobile ? 3 : 4) : (isMobile ? 2 : 3)}
                dot={{ 
                  fill: PODIUM_COLORS[seriesKeys.indexOf(key)] || `hsl(${index * 45}, 70%, 50%)`,
                  strokeWidth: 2,
                  r: selectedPlayers.has(key) ? (isMobile ? 4 : 5) : (isMobile ? 3 : 4)
                }}
                activeDot={{ 
                  r: isMobile ? 6 : 8, 
                  strokeWidth: 2,
                  fill: PODIUM_COLORS[seriesKeys.indexOf(key)] || `hsl(${index * 45}, 70%, 50%)`
                }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Player selector responsive */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className={`font-medium text-gray-700 dark:text-gray-300 ${isMobile ? 'text-sm' : 'text-base'}`}>
            Giocatori da mostrare:
          </h4>
          <button
            onClick={() => setShowAll(!showAll)}
            className={`px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full transition-colors ${isMobile ? 'text-xs' : 'text-sm'}`}
          >
            {showAll ? `Top ${selectedCount}` : 'Mostra tutti'}
          </button>
        </div>
        
        <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
          {visiblePlayers.map((playerName, index) => {
            const isSelected = selectedPlayers.has(playerName);
            const color = PODIUM_COLORS[seriesKeys.indexOf(playerName)] || `hsl(${index * 45}, 70%, 50%)`;
            
            return (
              <button
                key={playerName}
                onClick={() => togglePlayer(playerName)}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                  isSelected 
                    ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <div 
                  className={`w-3 h-3 rounded-full transition-all ${isSelected ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`}
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-gray-900 dark:text-gray-100 truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {isMobile ? playerName.split(' ')[0] : playerName}
                  </div>
                  <div className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {chartData[chartData.length - 1]?.[playerName] || 0}pt
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info footer responsive */}
      <div className={`flex justify-between items-center text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
        <span>Ultimi {chartData.length} {isMobile ? 'periodi' : 'punti dati'}</span>
        <span>{activeLines.length} giocatori visibili</span>
      </div>
    </div>
  );
}
