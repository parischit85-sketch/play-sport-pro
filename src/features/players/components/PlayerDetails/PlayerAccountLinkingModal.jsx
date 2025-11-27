import React, { useMemo } from 'react';
import Modal from '@components/ui/Modal';
import LoadingButton from '@components/common/LoadingButton';

export default function PlayerAccountLinkingModal({
  isOpen,
  onClose,
  player,
  linkEmail,
  accountSearch,
  accounts,
  searchResults, // New prop
  linkedEmailsSet,
  linkedIdsSet,
  loadingAccounts,
  loadingLink,
  onSearchChange,
  onEmailChange,
  onLinkAccount,
  T,
}) {
  // 1. Calcola i suggerimenti basati sui dati del player
  const suggestions = useMemo(() => {
    if (!accounts || !player) return [];

    const normalize = (str) => (str || '').toLowerCase().trim();
    const normalizePhone = (str) => (str || '').replace(/[\s\-+()]/g, '');

    const playerEmail = normalize(player.email);
    const playerPhone = normalizePhone(player.phone);
    
    // Robust name calculation
    let playerFullName = normalize(`${player.firstName || ''} ${player.lastName || ''}`);
    if (playerFullName.length < 2 && (player.name || player.displayName)) {
      playerFullName = normalize(player.name || player.displayName);
    }
    
    const playerFirstName = normalize(player.firstName || (playerFullName.split(' ')[0]));
    const playerLastName = normalize(player.lastName || (playerFullName.split(' ').slice(1).join(' ')));

    console.log('🔍 [LinkingModal] Calculating suggestions', {
      playerEmail,
      accountsCount: accounts.length,
      linkedEmails: Array.from(linkedEmailsSet),
      linkedIds: Array.from(linkedIdsSet)
    });

    return accounts
      .filter((acc) => {
        const accEmail = normalize(acc.email);
        
        // Debug specific match
        if (playerEmail && accEmail === playerEmail) {
           console.log('🔍 [LinkingModal] Found email match candidate:', {
             email: accEmail,
             uid: acc.uid,
             isLinkedId: linkedIdsSet.has(acc.uid),
             isLinkedEmail: linkedEmailsSet.has(accEmail)
           });
        }

        // Escludi già linkati
        if (linkedIdsSet.has(acc.uid)) return false;
        if (acc.email && linkedEmailsSet.has(accEmail)) return false;

        const accPhone = normalizePhone(acc.phoneNumber || acc.phone); // Support both fields
        const accFirstName = normalize(acc.firstName);
        const accLastName = normalize(acc.lastName);
        const accFullName = normalize(`${acc.firstName} ${acc.lastName}`);
        const accDisplayName = normalize(acc.displayName);

        // Match logic
        const emailMatch = playerEmail && accEmail && playerEmail === accEmail;
        
        // Phone match: check if one ends with the other (handles +39 vs no prefix)
        // But only if length is sufficient (e.g. > 6 digits)
        const phoneMatch = playerPhone && accPhone && 
                           playerPhone.length > 6 && accPhone.length > 6 &&
                           (playerPhone.includes(accPhone) || accPhone.includes(playerPhone));
        
        // Name match: 
        // 1. Exact match (existing)
        // 2. Partial match: if player name parts are contained in account name
        const playerNameParts = playerFullName.split(' ').filter(p => p.length > 2);
        
        // Check if all significant parts of player name are in account name
        const looseNameMatch = playerNameParts.length > 0 && 
                               playerNameParts.every(part => accFullName.includes(part));

        const nameMatch = 
          (playerFullName && (playerFullName === accFullName || playerFullName === accDisplayName)) ||
          (playerFirstName && playerLastName && playerFirstName === accFirstName && playerLastName === accLastName) ||
          looseNameMatch;

        // Partial name match (strong enough for suggestion?)
        // Let's stick to strong matches for suggestions to avoid noise
        
        if (emailMatch) acc._matchReason = 'Email identica';
        else if (phoneMatch) acc._matchReason = 'Telefono identico';
        else if (nameMatch) acc._matchReason = 'Nome corrispondente';

        return emailMatch || phoneMatch || nameMatch;
      })
      .slice(0, 3); // Limit suggestions to top 3
  }, [accounts, player, linkedEmailsSet, linkedIdsSet]);

  // 2. Usa i risultati della ricerca server-side (filtrando quelli già linkati)
  const filteredSearchResults = useMemo(() => {
    if (!searchResults) return [];
    return searchResults.filter((acc) => !linkedIdsSet.has(acc.uid));
  }, [searchResults, linkedIdsSet]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Collega Profilo Utente"
      size="medium"
    >
      <div className="space-y-6">
        <p className={`text-sm ${T.subtext}`}>
          Collega questo giocatore a un account utente reale per permettergli di accedere all'app, 
          vedere le partite e gestire le prenotazioni.
        </p>

        {/* SEZIONE 1: SUGGERIMENTI */}
        {!loadingAccounts && suggestions.length > 0 && !accountSearch && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${T.muted} mb-3 flex items-center gap-2`}>
              <span className="text-yellow-500">✨</span> Suggeriti per te
            </h4>
            <div className="space-y-2">
              {suggestions.map((acc) => (
                <div
                  key={acc.uid}
                  className={`${T.cardBg} border border-yellow-500/30 rounded-lg p-3 flex items-center justify-between hover:bg-yellow-500/10 transition-colors`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${T.text}`}>
                        {acc.firstName || acc.lastName
                          ? `${acc.firstName || ''} ${acc.lastName || ''}`.trim()
                          : acc.displayName || 'Utente senza nome'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                        {acc._matchReason}
                      </span>
                    </div>
                    <div className={`text-xs ${T.muted} mt-0.5`}>
                      {acc.email} {acc.phoneNumber ? `• ${acc.phoneNumber}` : ''}
                    </div>
                  </div>
                  <LoadingButton
                    onClick={() => onLinkAccount(acc)}
                    loading={loadingLink}
                    className="ml-3 px-3 py-1.5 text-sm bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors shadow-sm"
                  >
                    Collega
                  </LoadingButton>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEZIONE 2: RICERCA */}
        <div>
          <h4 className={`text-xs font-bold uppercase tracking-wider ${T.muted} mb-3`}>
            {suggestions.length > 0 && !accountSearch ? 'Oppure cerca manualmente' : 'Cerca utente'}
          </h4>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <input
              type="text"
              value={accountSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cerca per nome, email, telefono o Psp ID..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              autoFocus={suggestions.length === 0}
            />
          </div>

          {/* Risultati Ricerca */}
          {accountSearch && (
            <div className="mt-3">
              {loadingAccounts ? (
                <div className="text-center py-8">
                  <div className={`inline-block animate-spin rounded-full h-6 w-6 border-b-2 ${T.text}`}></div>
                  <p className={`mt-2 text-xs ${T.muted}`}>Ricerca in corso...</p>
                </div>
              ) : filteredSearchResults.length === 0 ? (
                <div className={`text-center py-6 ${T.cardBg} ${T.border} rounded-lg border-dashed`}>
                  <p className={`text-sm ${T.muted}`}>Nessun utente trovato</p>
                </div>
              ) : (
                <div className={`${T.cardBg} ${T.border} rounded-lg max-h-60 overflow-y-auto`}>
                  <ul className="divide-y divide-gray-700">
                    {filteredSearchResults.map((acc) => (
                      <li
                        key={acc.uid}
                        className="p-3 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium truncate ${T.text}`}>
                            {acc.firstName || acc.lastName
                              ? `${acc.firstName || ''} ${acc.lastName || ''}`.trim()
                              : acc.displayName || acc.email}
                            {acc.pspId && (
                              <span className="ml-2 text-xs bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800 font-mono">
                                {acc.pspId}
                              </span>
                            )}
                          </div>
                          <div className={`text-xs truncate ${T.muted}`}>
                            {acc.email}
                          </div>
                        </div>
                        <LoadingButton
                          onClick={() => onLinkAccount(acc)}
                          loading={loadingLink}
                          className="ml-3 px-3 py-1 text-sm bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded hover:bg-blue-600/30 transition-colors"
                        >
                          Collega
                        </LoadingButton>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SEZIONE 3: LINK MANUALE (Fallback) */}
        <div className="pt-4 border-t border-gray-700">
          <details className="group">
            <summary className={`text-xs ${T.muted} cursor-pointer hover:${T.text} flex items-center gap-2 select-none`}>
              <span className="transition-transform group-open:rotate-90">▶</span>
              Non trovi l'utente? Collega via email
            </summary>
            <div className="mt-3 pl-4 animate-in slide-in-from-top-1">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={linkEmail}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="Inserisci email manualmente..."
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
                  className="px-4 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Collega
                </LoadingButton>
              </div>
              <p className="text-[10px] text-orange-400 mt-1">
                ⚠️ Attenzione: collegare solo via email non garantisce l'accesso immediato se l'utente non è ancora registrato.
              </p>
            </div>
          </details>
        </div>
      </div>
    </Modal>
  );
}
