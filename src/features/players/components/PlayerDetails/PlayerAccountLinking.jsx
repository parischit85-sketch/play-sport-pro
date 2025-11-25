// =============================================
// FILE: PlayerAccountLinking.jsx
// Gestione link/unlink account utente al profilo giocatore
// REFACTORED: 2025-10-15 - Refactoring PlayerDetails (Fase 1.1.3)
// FASE 2: 2025-10-16 - Added permissions & RBAC optimization
// =============================================

import React from 'react';
import LoadingButton from '../../../../components/common/LoadingButton';

/**
 * Componente per gestire il collegamento account-player
 * @param {Object} permissions - FASE 2: Permessi utente (canLinkAccount, canUnlinkAccount)
 */
export default function PlayerAccountLinking({
  player,
  loadingUnlink,
  permissions, // ✅ FASE 2: Permissions
  onOpenPicker,
  onUnlinkAccount,
  T,
}) {
  // 🔒 FASE 2: Permissions check - Se non può linkare/unlinkare, ritorna null
  if (!permissions?.canLinkAccount && !permissions?.canUnlinkAccount) {
    return null;
  }

  // 🔄 Normalize linked state (handle both legacy and new field names)
  const isLinked = player.isAccountLinked || player.isLinked;
  const linkedEmail = player.linkedAccountEmail || player.email;

  return (
    <div className="border-t border-gray-700 pt-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Status account collegato */}
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${T.text}`}>Account Collegato:</span>
          {isLinked && linkedEmail ? (
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-lg">🔗</span>
              <span className="text-sm font-medium text-green-400">
                {linkedEmail}
              </span>
            </div>
          ) : (
            <span className={`text-sm ${T.muted}`}>Nessun account collegato</span>
          )}
        </div>

        {/* Azioni collegamento (solo se NON collegato E ha permesso di linkare) */}
        {!isLinked && permissions?.canLinkAccount ? (
          <div className="flex items-center gap-2 justify-end">
            <LoadingButton
              onClick={onOpenPicker}
              className={`px-4 py-2 text-sm bg-blue-900/20 text-blue-400 rounded-lg hover:bg-blue-900/30 transition-colors ${T.text}`}
            >
              🔗 Collega Profilo
            </LoadingButton>
          </div>
        ) : (
          /* Azione scollegamento (se collegato E ha permesso di unlinkare) - VISIBILE ANCHE A DESTRA */
          isLinked && permissions?.canUnlinkAccount && (
            <div className="flex items-center gap-2 justify-end">
              <LoadingButton
                onClick={onUnlinkAccount}
                loading={loadingUnlink}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-md flex items-center gap-2"
              >
                <span>❌</span>
                <span>Scollega Account</span>
              </LoadingButton>
            </div>
          )
        )}
      </div>
    </div>
  );
}
