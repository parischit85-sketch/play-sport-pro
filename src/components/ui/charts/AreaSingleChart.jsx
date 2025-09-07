// =============================================
// FILE: src/components/ui/charts/AreaSingleChart.jsx
// =============================================
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Brush } from 'recharts';
const CHART_COLORS = ['#10b981'];
export default function AreaSingleChart({ data, dataKey = 'rating', chartId = 'single' }) {
  return (
    <div className="h-56 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 6, right: 6, top: 8, bottom: 8 }}>
          <defs>
            <linearGradient id={`grad-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.45} />
              <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeOpacity={0.15} />
          <XAxis dataKey="label" minTickGap={24} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} width={48} />
          <Tooltip />
          <Area type="monotone" dataKey={dataKey} stroke={CHART_COLORS[0]} fill={`url(#grad-${chartId})`} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
          <Brush dataKey="label" height={20} travellerWidth={8} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
