// =============================================
// FILE: src/features/players/components/PlayerBadges.jsx
// Componente badge giocatore (certificato, account, stato)
// =============================================

import React from 'react';

const PlayerBadges = ({ player, certStatus, _compact = false }) => {
  const status = certStatus?.status;
  const days = certStatus?.daysUntilExpiry;

  // Decide label e stile per il badge certificato
  let certLabel = 'Certificato';
  let certClass = 'bg-gray-100 text-gray-700 bg-gray-800/60 text-gray-300';
  if (status === 'expired') {
    certLabel = days != null ? `Scaduto da ${Math.abs(days)}g` : 'Scaduto';
    certClass = 'bg-red-100 text-red-700 bg-red-900/30 text-red-300';
  } else if (status === 'expiring') {
    certLabel = days != null ? `In scadenza ${days}g` : 'In scadenza';
    certClass = 'bg-orange-100 text-orange-700 bg-orange-900/30 text-orange-300';
  } else if (status === 'valid') {
    certLabel = days != null ? `Valido ${days}g` : 'Valido';
    certClass = 'bg-green-100 text-green-700 bg-green-900/30 text-green-300';
  } else if (status === 'missing') {
    certLabel = 'Mancante';
    certClass = 'bg-red-100 text-red-700 bg-red-900/30 text-red-300';
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Badge Certificato Medico – sempre visibile */}
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${certClass}`}
        title={
          status === 'expired'
            ? `Certificato scaduto ${days != null ? Math.abs(days) : ''} giorni fa`
            : status === 'expiring'
              ? `Certificato in scadenza${days != null ? ` tra ${days} giorni` : ''}`
              : status === 'valid'
                ? `Certificato valido${days != null ? ` (${days} giorni rimanenti)` : ''}`
                : 'Certificato non presente'
        }
      >
        {certLabel}
      </span>

      {/* Account collegato */}
      {player.isAccountLinked && (
        <span className="text-green-500" title="Account collegato">
          🔗
        </span>
      )}

      {/* Stato inattivo */}
      {!player.isActive && (
        <span className="text-red-500" title="Inattivo">
          ⏸️
        </span>
      )}
    </div>
  );
};

// 🚀 OTTIMIZZAZIONE: Memoizza per evitare re-render inutili
export default React.memo(PlayerBadges);

