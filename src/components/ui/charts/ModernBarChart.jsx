// =============================================
// FILE: src/components/ui/charts/ModernBarChart.jsx
// =============================================
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MODERN_COLORS = {
  wins: '#10b981',
  losses: '#ef4444',
  draws: '#f59e0b',
  points: '#3b82f6'
};

export default function ModernBarChart({ data, dataKeys = ['wins', 'losses'], chartId = 'modern-bar', title = 'Ultime 10 partite' }) {
  
  // Prendi solo le ultime 10 entries
  const last10Data = data.slice(-10);
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold" style={{ color: entry.color }}>
                {entry.dataKey}: {entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={last10Data} 
          margin={{ left: 10, right: 10, top: 20, bottom: 20 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            strokeOpacity={0.2}
            horizontal={true}
            vertical={false}
          />
          
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
            width={40}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {dataKeys.map((key, index) => (
            <Bar 
              key={key}
              dataKey={key} 
              fill={MODERN_COLORS[key] || `hsl(${index * 60}, 70%, 50%)`}
              radius={[2, 2, 0, 0]}
              className="drop-shadow-sm"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      
      <div className="flex justify-between items-center mt-2 px-2">
        <span className="text-xs text-gray-500">{title}</span>
        <div className="flex gap-3">
          {dataKeys.map((key) => (
            <div key={key} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: MODERN_COLORS[key] || '#6b7280' }}
              />
              <span className="text-xs text-gray-500 capitalize">{key}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
