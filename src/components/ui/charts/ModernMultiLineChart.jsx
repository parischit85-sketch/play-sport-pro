// =============================================
// FILE: src/components/ui/charts/ModernMultiLineChart.jsx
// =============================================
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

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

export default function ModernMultiLineChart({ 
  data, 
  seriesKeys = [], 
  chartId = 'modern-multi',
  title = 'Classifica - Ultime 10 partite',
  selectedCount = 3,
  playerRankings = []
}) {
  
  // Prendi solo le ultime 10 entries
  const last10Data = data.slice(-10);
  
  // Calcola il range dell'asse Y basato sui dati visibili
  const yAxisDomain = useMemo(() => {
    if (last10Data.length === 0 || seriesKeys.length === 0) return ['auto', 'auto'];
    
    let minValue = Infinity;
    let maxValue = -Infinity;
    
    last10Data.forEach(point => {
      seriesKeys.forEach(key => {
        const value = point[key];
        if (typeof value === 'number') {
          minValue = Math.min(minValue, value);
          maxValue = Math.max(maxValue, value);
        }
      });
    });
    
    if (minValue === Infinity) return ['auto', 'auto'];
    
    // Aggiungi un buffer del 5% sopra e sotto
    const range = maxValue - minValue;
    const buffer = range * 0.05;
    
    return [
      Math.max(0, Math.floor(minValue - buffer)), 
      Math.ceil(maxValue + buffer)
    ];
  }, [last10Data, seriesKeys]);
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isMobile = window.innerWidth < 768;
      return (
        <div className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl ${isMobile ? 'p-2 min-w-36' : 'p-4 min-w-48'}`}>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-900 dark:text-gray-100 ${isMobile ? 'mb-1' : 'mb-3'}`}>{label}</p>
          <div className={isMobile ? 'space-y-1' : 'space-y-2'}>
            {payload
              .sort((a, b) => b.value - a.value) // Ordina per valore decrescente
              .map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div 
                      className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'} rounded-full`} 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700 dark:text-gray-300 ${isMobile ? 'truncate max-w-16' : ''}`}>
                      {isMobile ? entry.dataKey.split(' ')[0] : entry.dataKey}
                    </span>
                  </div>
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold`} style={{ color: entry.color }}>
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

  const CustomLegend = ({ payload }) => {
    // Ordina i giocatori secondo la loro posizione in classifica
    const sortedPayload = [...payload].sort((a, b) => {
      const playerA = playerRankings.find(p => p.name === a.value);
      const playerB = playerRankings.find(p => p.name === b.value);
      const positionA = playerA ? playerA.position : 999;
      const positionB = playerB ? playerB.position : 999;
      return positionA - positionB;
    });

    return (
      <div className="flex justify-center gap-2 md:gap-3 mt-3 md:mt-4 flex-wrap">
        {sortedPayload.map((entry, index) => {
          // Trova la posizione in classifica per questo giocatore
          const playerRanking = playerRankings.find(p => p.name === entry.value);
          const position = playerRanking ? playerRanking.position : index + 1;
          
          return (
            <div key={entry.value} className="flex items-center gap-1.5 md:gap-2">
              <div 
                className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white shadow-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-20 md:max-w-none">
                {entry.value}
              </span>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1 md:px-1.5 py-0.5 rounded">
                {position}°
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-64 md:h-72 lg:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={last10Data} 
          margin={{ 
            left: 5, 
            right: 5, 
            top: 10, 
            bottom: window.innerWidth < 768 ? 40 : 60 
          }}
        >
          <defs>
            {seriesKeys.map((key, index) => (
              <filter key={key} id={`glow-${chartId}-${index}`}>
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            ))}
          </defs>
          
          <CartesianGrid 
            strokeDasharray="2 4" 
            strokeOpacity={0.15}
            horizontal={true}
            vertical={false}
          />
          
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: window.innerWidth < 768 ? 9 : 10, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            angle={window.innerWidth < 768 ? -45 : 0}
            textAnchor={window.innerWidth < 768 ? 'end' : 'middle'}
            height={window.innerWidth < 768 ? 50 : 30}
          />
          
          <YAxis 
            tick={{ fontSize: window.innerWidth < 768 ? 9 : 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            width={window.innerWidth < 768 ? 35 : 50}
            domain={yAxisDomain}
            scale="linear"
          />
          
          <Tooltip content={<CustomTooltip />} />
          {/* Nascondi legenda su schermi molto piccoli per risparmiare spazio */}
          {window.innerWidth >= 640 && <Legend content={<CustomLegend />} />}
          
          {seriesKeys.map((key, index) => (
            <Line 
              key={key}
              type="monotone" 
              dataKey={key} 
              stroke={PODIUM_COLORS[index] || `hsl(${index * 36}, 70%, 50%)`}
              strokeWidth={window.innerWidth < 768 ? (index < 3 ? 3 : 2) : (index < 3 ? 4 : index < 5 ? 3 : 2)}
              dot={{ 
                r: window.innerWidth < 768 ? (index < 3 ? 3 : 2) : (index < 3 ? 4 : index < 5 ? 3 : 2), 
                fill: PODIUM_COLORS[index] || `hsl(${index * 36}, 70%, 50%)`,
                stroke: 'white',
                strokeWidth: window.innerWidth < 768 ? 1 : 2
              }}
              activeDot={{ 
                r: window.innerWidth < 768 ? (index < 3 ? 5 : 4) : (index < 3 ? 7 : index < 5 ? 6 : 5), 
                fill: PODIUM_COLORS[index] || `hsl(${index * 36}, 70%, 50%)`,
                stroke: 'white',
                strokeWidth: window.innerWidth < 768 ? 2 : 3,
                filter: `url(#glow-${chartId}-${index})`,
                className: 'drop-shadow-lg'
              }}
              className={index < 3 ? 'drop-shadow-md' : index < 5 ? 'drop-shadow-sm' : ''}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      
      <div className="flex justify-between items-center mt-2 md:mt-3 px-1 md:px-2">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{title}</span>
        <span className="text-xs text-gray-500">
          {last10Data.length} periodi
        </span>
      </div>
      
      {/* Legenda compatta per schermi molto piccoli */}
      {window.innerWidth < 640 && (
        <div className="mt-2 px-1">
          <div className="flex flex-wrap gap-1">
            {seriesKeys.slice(0, 3).map((key, index) => {
              const playerRanking = playerRankings.find(p => p.name === key);
              const position = playerRanking ? playerRanking.position : index + 1;
              return (
                <div key={key} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: PODIUM_COLORS[index] }}
                  />
                  <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-12">
                    {key.split(' ')[0]}
                  </span>
                  <span className="text-gray-500">({position}°)</span>
                </div>
              );
            })}
            {seriesKeys.length > 3 && (
              <span className="text-xs text-gray-400">+{seriesKeys.length - 3}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
