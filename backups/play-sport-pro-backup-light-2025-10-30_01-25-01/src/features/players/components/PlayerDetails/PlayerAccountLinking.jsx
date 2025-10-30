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
  isLinking,
  linkEmail,
  accountSearch,
  accounts,
  linkedEmailsSet,
  linkedIdsSet,
  loadingAccounts,
  loadingLink,
  loadingUnlink,
  permissions, // ✅ FASE 2: Permissions
  onOpenPicker,
  onClosePicker,
  onSearchChange,
  onEmailChange,
  onLinkAccount,
  onUnlinkAccount,
  T,
}) {
  // 🔒 FASE 2: Permissions check - Se non può linkare/unlinkare, ritorna null
  if (!permissions?.canLinkAccount && !permissions?.canUnlinkAccount) {
    return null;
  }

  // Filtra account già linkati
  const filteredAccounts = React.useMemo(() => {
    if (!accounts) return [];
    
    return accounts.filter((acc) => {
      const email = (acc.email || '').toLowerCase();
      const uid = acc.uid;
      
      // Escludi account già linkati ad altri players
      if (linkedEmailsSet.has(email) || linkedIdsSet.has(uid)) {
        return false;
      }
      
      // Filtra per search
      if (accountSearch && accountSearch.trim()) {
        const search = accountSearch.toLowerCase();
        const fullName = `${acc.firstName || ''} ${acc.lastName || ''}`.toLowerCase();
        return fullName.includes(search) || email.includes(search);
      }
      
      return true;
    });
  }, [accounts, linkedEmailsSet, linkedIdsSet, accountSearch]);

  return (
    <div className="border-t border-gray-200 border-gray-700 pt-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Status account collegato */}
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${T.text}`}>
            Account Collegato:
          </span>
          {player.isAccountLinked && player.linkedAccountEmail ? (
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-lg">🔗</span>
              <span className="text-sm font-medium text-green-600 text-green-400">
                {player.linkedAccountEmail}
              </span>
              {/* 🔒 FASE 2: Bottone Scollega solo se ha permesso */}
              {permissions?.canUnlinkAccount && (
                <LoadingButton
                  onClick={onUnlinkAccount}
                  loading={loadingUnlink}
                  className="ml-2 text-xs px-2 py-1 bg-red-50 bg-red-900/20 text-red-600 text-red-400 rounded hover:bg-red-100 hover:bg-red-900/30 transition-colors"
                >
                  Scollega
                </LoadingButton>
              )}
            </div>
          ) : (
            <span className={`text-sm ${T.muted}`}>
              Nessun account collegato
            </span>
          )}
        </div>

        {/* Azioni collegamento (solo se NON collegato E ha permesso di linkare) */}
        {!player.isAccountLinked && permissions?.canLinkAccount && (
          <div className="flex flex-col gap-3 w-full lg:w-auto">
            {!isLinking ? (
              <div className="flex items-center gap-2 justify-end">
                <LoadingButton
                  onClick={onOpenPicker}
                  loading={loadingAccounts}
                  className={`px-4 py-2 text-sm bg-blue-50 bg-blue-900/20 text-blue-600 text-blue-400 rounded-lg hover:bg-blue-100 hover:bg-blue-900/30 transition-colors ${T.text}`}
                >
                  🔎 Cerca account
                </LoadingButton>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Header ricerca */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={accountSearch}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Cerca per nome o email..."
                    className={`flex-1 px-3 py-2 border ${T.border} rounded-lg ${T.bg} ${T.text} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <button
                    onClick={onClosePicker}
                    className="px-3 py-2 text-sm bg-gray-100 bg-gray-700 text-gray-600 text-gray-300 rounded-lg hover:bg-gray-200 hover:bg-gray-600 transition-colors"
                  >
                    ✕ Chiudi
                  </button>
                </div>

                {/* Lista account disponibili */}
                {loadingAccounts ? (
                  <div className="text-center py-8">
                    <div className={`inline-block animate-spin rounded-full h-8 w-8 border-b-2 ${T.text}`}></div>
                    <p className={`mt-2 text-sm ${T.muted}`}>Caricamento account...</p>
                  </div>
                ) : filteredAccounts.length === 0 ? (
                  <div className={`text-center py-8 ${T.cardBg} ${T.border} rounded-lg`}>
                    <p className={`text-sm ${T.muted}`}>
                      {accountSearch 
                        ? 'Nessun account trovato per questa ricerca'
                        : 'Nessun account disponibile'}
                    </p>
                  </div>
                ) : (
                  <div className={`${T.cardBg} ${T.border} rounded-lg max-h-64 overflow-y-auto`}>
                    <ul className="divide-y divide-gray-200 divide-gray-700">
                      {filteredAccounts.map((acc) => (
                        <li
                          key={acc.uid}
                          className="p-3 flex items-center justify-between hover:bg-gray-50 hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium truncate ${T.text}`}>
                              {acc.firstName || acc.lastName
                                ? `${acc.firstName || ''} ${acc.lastName || ''}`.trim()
                                : acc.email || 'Senza nome'}
                            </div>
                            {acc.email && (
                              <div className={`text-xs truncate ${T.muted}`}>
                                {acc.email}
                              </div>
                            )}
                          </div>
                          <LoadingButton
                            onClick={() => onLinkAccount(acc)}
                            loading={loadingLink}
                            className="ml-3 px-3 py-1 text-sm bg-green-50 bg-green-900/20 text-green-600 text-green-400 rounded hover:bg-green-100 hover:bg-green-900/30 transition-colors flex-shrink-0"
                          >
                            🔗 Collega
                          </LoadingButton>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Link via email manuale (opzionale) */}
                <div className="pt-3 border-t border-gray-200 border-gray-700">
                  <p className={`text-xs ${T.muted} mb-2`}>
                    Oppure collega manualmente via email:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={linkEmail}
                      onChange={(e) => onEmailChange(e.target.value)}
                      placeholder="email@esempio.com"
                      className={`flex-1 px-3 py-2 border ${T.border} rounded-lg ${T.bg} ${T.text} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <LoadingButton
                      onClick={() => {
                        if (linkEmail.trim()) {
                          onLinkAccount({ email: linkEmail, uid: null });
                        }
                      }}
                      loading={loadingLink}
                      disabled={!linkEmail.trim()}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Collega
                    </LoadingButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

