import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function ModernRadarChart({ data, dataKey, chartId, color = 'primary', title }) {
  const colorMap = {
    primary: '#3b82f6',
    success: '#10b981', 
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6'
  };

  const fillColor = colorMap[color] || colorMap.primary;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <PolarGrid stroke="#e5e7eb" strokeOpacity={0.3} />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tickCount={5}
            tick={{ fontSize: 10, fill: '#6b7280' }}
          />
          <Radar
            name="Performance"
            dataKey="value"
            stroke={fillColor}
            fill={fillColor}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
