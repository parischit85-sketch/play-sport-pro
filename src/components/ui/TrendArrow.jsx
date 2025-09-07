// =============================================
// FILE: src/components/ui/TrendArrow.jsx
// =============================================
import React from 'react';
export function TrendArrow({ total = 0, pos = 0, neg = 0 }) {
  const title = `Ultime 5: +${Math.round(pos)} / -${Math.round(neg)} = ${total >= 0 ? '+' : ''}${Math.round(total)}`;
  if (total > 0) return <span title={title} className="ml-2 text-emerald-500">▲</span>;
  if (total < 0) return <span title={title} className="ml-2 text-rose-500">▼</span>;
  return <span title={title} className="ml-2 text-neutral-400">•</span>;
}
