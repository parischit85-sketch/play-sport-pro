// =============================================
// FILE: src/components/ui/charts/AreaMultiChart.jsx
// =============================================
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Brush,
} from 'recharts';

// Colori unificati del design system
const UNIFIED_CHART_COLORS = [
  '#10b981', // emerald-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
];

export default function AreaMultiChart({ data, seriesKeys = [], chartId = 'multi' }) {
  return (
    <div className="h-56 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 6, right: 6, top: 8, bottom: 8 }}>
          <defs>
            {seriesKeys.map((k, i) => (
              <linearGradient key={k} id={`grad-${chartId}-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={UNIFIED_CHART_COLORS[i % UNIFIED_CHART_COLORS.length]}
                  stopOpacity={0.45}
                />
                <stop
                  offset="100%"
                  stopColor={UNIFIED_CHART_COLORS[i % UNIFIED_CHART_COLORS.length]}
                  stopOpacity={0.05}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeOpacity={0.15} />
          <XAxis dataKey="label" minTickGap={24} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} width={48} />
          <Tooltip />
          <Legend />
          {seriesKeys.map((k, i) => (
            <Area
              key={k}
              type="monotone"
              dataKey={k}
              stroke={UNIFIED_CHART_COLORS[i % UNIFIED_CHART_COLORS.length]}
              fill={`url(#grad-${chartId}-${i})`}
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />
          ))}
          <Brush dataKey="label" height={20} travellerWidth={8} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
