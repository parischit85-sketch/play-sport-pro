// =============================================
// FILE: src/features/prenota/DayToggles.jsx
// =============================================
import React from 'react';
const DAY_LABELS_UI = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'];
export default function DayToggles({ value = [], onChange, T }) {
  const toggle = (d) => { const set = new Set(value); if (set.has(d)) set.delete(d); else set.add(d); onChange(Array.from(set).sort((a,b)=>a-b)); };
  return (
    <div className="flex flex-wrap gap-1">
      {DAY_LABELS_UI.map((lbl, idx) => (
        <button key={idx} type="button" onClick={() => toggle(idx)} className={`px-2 py-1 rounded-md text-xs ring-1 ${value.includes(idx) ? 'bg-emerald-400 text-black ring-emerald-400' : T.ghostRing}`} title={lbl}>{lbl}</button>
      ))}
    </div>
  );
}

