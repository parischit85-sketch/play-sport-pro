// =============================================
// FILE: src/components/ui/charts/ModernAreaChart.jsx
// =============================================
import React, { useMemo } from 'react';
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
  chartId = 'modern-area',
  color = 'success',
  title = 'Trend ultime 10 partite',
  showGrid = true,
}) {
  const areaColor = UNIFIED_COLORS[color] || UNIFIED_COLORS.success;

  // Prendi solo le ultime 10 entries
  const last10Data = data.slice(-10);

  // Calcola il range dell'asse Y basato sui dati visibili
  const yAxisDomain = useMemo(() => {
    if (last10Data.length === 0) return ['auto', 'auto'];

    let minValue = Infinity;
    let maxValue = -Infinity;

    last10Data.forEach((point) => {
      const value = point[dataKey];
      if (typeof value === 'number') {
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      }
    });

    if (minValue === Infinity) return ['auto', 'auto'];

    // Aggiungi un buffer del 8% sopra e sotto per dare più respiro al grafico
    const range = maxValue - minValue;
    const buffer = range * 0.08;

    return [Math.max(0, Math.floor(minValue - buffer)), Math.ceil(maxValue + buffer)];
  }, [last10Data, dataKey]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold" style={{ color: areaColor }}>
              {dataKey}: {payload[0].value}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Calcola la tendenza
  const trend =
    last10Data.length > 1 ? last10Data[last10Data.length - 1][dataKey] - last10Data[0][dataKey] : 0;
  const trendColor = trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#6b7280';
  const trendIcon = trend > 0 ? '↗' : trend < 0 ? '↘' : '→';

  return (
    <div className="h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={last10Data} margin={{ left: 10, right: 10, top: 20, bottom: 20 }}>
          <defs>
            <linearGradient id={`modernGradient-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={areaColor} stopOpacity={0.4} />
              <stop offset="50%" stopColor={areaColor} stopOpacity={0.2} />
              <stop offset="100%" stopColor={areaColor} stopOpacity={0.05} />
            </linearGradient>
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
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex justify-between items-center mt-3 px-2">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{title}</span>
        <div className="flex items-center gap-2">
          {last10Data.length > 1 && (
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold" style={{ color: trendColor }}>
                {trendIcon} {Math.abs(trend).toFixed(0)}
              </span>
            </div>
          )}
          <span className="text-xs text-gray-500">{last10Data.length} partite</span>
        </div>
      </div>
    </div>
  );
}
