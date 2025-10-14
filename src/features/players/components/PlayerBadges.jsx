// =============================================
// FILE: src/features/players/components/PlayerBadges.jsx
// Componente badge giocatore (certificato, account, stato)
// =============================================

import React from 'react';

export default function PlayerBadges({ player, certStatus, compact = false }) {
  const badgeClass = compact ? 'text-sm' : 'text-sm';

  return (
    <div className="flex items-center gap-1 flex-wrap">
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

      {/* Badge Certificato Medico */}
      {certStatus.isExpired && (
        <span
          className="text-red-600"
          title={`Certificato scaduto ${Math.abs(certStatus.daysUntilExpiry)} giorni fa`}
        >
          ⚠️
        </span>
      )}
      {certStatus.isExpiring && certStatus.daysUntilExpiry <= 15 && !certStatus.isExpired && (
        <span
          className="text-orange-600 animate-pulse"
          title={`Certificato scade tra ${certStatus.daysUntilExpiry} giorni`}
        >
          ⏰
        </span>
      )}
      {certStatus.status === 'missing' && (
        <span className="text-gray-500" title="Nessun certificato medico">
          📄
        </span>
      )}
    </div>
  );
}