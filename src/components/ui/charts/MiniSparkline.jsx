// =============================================
// FILE: src/components/ui/charts/MiniSparkline.jsx
// =============================================
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function MiniSparkline({ data, dataKey = 'rating', color = '#10b981', className = '' }) {
  // Prendi solo le ultime 10 entries
  const last10Data = data.slice(-10);
  
  if (last10Data.length < 2) {
    return (
      <div className={`h-8 w-16 flex items-center justify-center ${className}`}>
        <span className="text-xs text-gray-400">N/A</span>
      </div>
    );
  }

  // Calcola la tendenza
  const trend = last10Data[last10Data.length - 1][dataKey] - last10Data[0][dataKey];
  const sparklineColor = trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#6b7280';

  return (
    <div className={`h-8 w-16 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={last10Data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={sparklineColor}
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
