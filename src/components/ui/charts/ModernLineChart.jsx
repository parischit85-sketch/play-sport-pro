// =============================================
// FILE: src/components/ui/charts/ModernLineChart.jsx
// =============================================
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MODERN_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  indigo: '#6366f1'
};

export default function ModernLineChart({ data, dataKey = 'rating', chartId = 'modern', color = 'primary', showGrid = true }) {
  const lineColor = MODERN_COLORS[color] || MODERN_COLORS.primary;
  
  // Prendi solo le ultime 10 entries
  const last10Data = data.slice(-10);
  
  // Calcola il range dell'asse Y basato sui dati visibili
  const yAxisDomain = useMemo(() => {
    if (last10Data.length === 0) return ['auto', 'auto'];
    
    let minValue = Infinity;
    let maxValue = -Infinity;
    
    last10Data.forEach(point => {
      const value = point[dataKey];
      if (typeof value === 'number') {
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      }
    });
    
    if (minValue === Infinity) return ['auto', 'auto'];
    
    // Aggiungi un buffer del 8% sopra e sotto
    const range = maxValue - minValue;
    const buffer = range * 0.08;
    
    return [
      Math.max(0, Math.floor(minValue - buffer)), 
      Math.ceil(maxValue + buffer)
    ];
  }, [last10Data, dataKey]);
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold" style={{ color: lineColor }}>
              {dataKey}: {payload[0].value}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomDot = ({ cx, cy, payload, index }) => {
    if (index === last10Data.length - 1) {
      // Evidenzia l'ultimo punto
      return (
        <circle 
          cx={cx} 
          cy={cy} 
          r={5} 
          fill={lineColor} 
          stroke="white" 
          strokeWidth={2}
          className="drop-shadow-md"
        />
      );
    }
    return null;
  };

  return (
    <div className="h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={last10Data} 
          margin={{ left: 10, right: 10, top: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id={`gradient-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.1} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              strokeOpacity={0.2}
              horizontal={true}
              vertical={false}
            />
          )}
          
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
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
          
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={lineColor}
            strokeWidth={3}
            dot={<CustomDot />}
            activeDot={{ 
              r: 6, 
              fill: lineColor,
              stroke: 'white',
              strokeWidth: 2,
              className: 'drop-shadow-lg'
            }}
            className="drop-shadow-sm"
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="flex justify-between items-center mt-2 px-2">
        <span className="text-xs text-gray-500">Ultime 10 partite</span>
        <span className="text-xs text-gray-500">
          {last10Data.length > 0 && `${last10Data[0].label} → ${last10Data[last10Data.length - 1].label}`}
        </span>
      </div>
    </div>
  );
}
