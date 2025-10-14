// =============================================
// FILE: src/features/players/components/PlayerActions.jsx
// Componente azioni giocatore (view, edit, stats, delete)
// =============================================

import React from 'react';

export default function PlayerActions({ onView, onEdit, onStats, onDelete, T, layout = 'desktop' }) {
  if (layout === 'mobile') {
    return (
      <div className="flex gap-2">
        <button onClick={onView} className={`${T.btnSecondary} flex-1 py-2 text-sm`}>
          👁️ Dettagli
        </button>
        <button onClick={onStats} className={`${T.btnSecondary} flex-1 py-2 text-sm`}>
          📊 Stats
        </button>
        <button onClick={onEdit} className={`${T.btnSecondary} px-4 py-2 text-sm`}>
          ✏️
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          🗑️
        </button>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex items-center gap-2 ml-auto">
      <button
        onClick={onView}
        className={`${T.btnSecondary} px-3 py-1 text-sm`}
        title="Visualizza dettagli"
      >
        👁️
      </button>
      <button
        onClick={onEdit}
        className={`${T.btnSecondary} px-3 py-1 text-sm`}
        title="Modifica"
      >
        ✏️
      </button>
      <button
        onClick={onStats}
        className={`${T.btnSecondary} px-3 py-1 text-sm`}
        title="Statistiche"
      >
        📊
      </button>
      <button
        onClick={onDelete}
        className="px-3 py-1 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        title="Elimina"
      >
        🗑️
      </button>
    </div>
  );
}