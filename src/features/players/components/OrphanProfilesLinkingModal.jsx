import React, { useState, useEffect, useMemo } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@services/firebase.js';
import { useClub } from '@contexts/ClubContext.jsx';
import { useDebounce } from '@hooks/useDebounce.js';
import { Search, Link, User, Phone, Mail, AlertCircle, Check, X, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { listAllUserProfiles } from '@services/auth.jsx';

export default function OrphanProfilesLinkingModal({ orphanProfiles, onLink, onClose }) {
  const { clubId } = useClub();
  
  // Helper to get a stable ID for an orphan
  const getOrphanId = (orphan) => orphan.id || orphan.userId || orphan.docId;

  const [selectedOrphanId, setSelectedOrphanId] = useState(
    orphanProfiles[0] ? getOrphanId(orphanProfiles[0]) : null
  );
  
  // State for global matching
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [matchesMap, setMatchesMap] = useState(new Map()); // orphanId -> Match[]

  const [manualSearchQuery, setManualSearchQuery] = useState('');
  const [manualSearchResults, setManualSearchResults] = useState([]);
  const [loadingManualSearch, setLoadingManualSearch] = useState(false);
  
  const debouncedManualSearch = useDebounce(manualSearchQuery, 500);

  const selectedOrphan = useMemo(() => 
    orphanProfiles.find(p => getOrphanId(p) === selectedOrphanId), 
    [orphanProfiles, selectedOrphanId]
  );

  // Sort orphans: Matches first (alphabetical), then others (alphabetical)
  const sortedOrphanProfiles = useMemo(() => {
    return [...orphanProfiles].sort((a, b) => {
      const idA = getOrphanId(a);
      const idB = getOrphanId(b);
      const hasMatchA = matchesMap.has(idA);
      const hasMatchB = matchesMap.has(idB);

      // 1. Matches first
      if (hasMatchA && !hasMatchB) return -1;
      if (!hasMatchA && hasMatchB) return 1;

      // 2. Alphabetical by name
      const nameA = (a.firstName && a.lastName ? `${a.firstName} ${a.lastName}` : (a.name || a.displayName || '')).toLowerCase();
      const nameB = (b.firstName && b.lastName ? `${b.firstName} ${b.lastName}` : (b.name || b.displayName || '')).toLowerCase();
      
      return nameA.localeCompare(nameB);
    });
  }, [orphanProfiles, matchesMap]);

  // Update selection if current orphan is removed
  useEffect(() => {
    if (selectedOrphanId && !orphanProfiles.find(p => getOrphanId(p) === selectedOrphanId)) {
      setSelectedOrphanId(sortedOrphanProfiles[0] ? getOrphanId(sortedOrphanProfiles[0]) : null);
    }
  }, [orphanProfiles, selectedOrphanId, sortedOrphanProfiles]);

  // 1. Load ALL registered users on mount and compute matches
  useEffect(() => {
    const loadAndMatch = async () => {
      setLoadingUsers(true);
      try {
        console.log('🔍 [OrphanLinking] Loading global users for matching...');
        // Fetch a large batch of users (e.g. 1000)
        const users = await listAllUserProfiles(1000);
        console.log('✅ [OrphanLinking] Loaded users:', users.length);

        // Compute matches for ALL orphans
        const newMatchesMap = new Map();
        
        orphanProfiles.forEach(orphan => {
          const orphanId = getOrphanId(orphan);
          const matches = findMatchesForOrphan(orphan, users);
          if (matches.length > 0) {
            newMatchesMap.set(orphanId, matches);
          }
        });

        setMatchesMap(newMatchesMap);
        console.log('✅ [OrphanLinking] Computed matches for orphans:', newMatchesMap.size);

      } catch (error) {
        console.error('❌ [OrphanLinking] Error loading users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadAndMatch();
  }, [orphanProfiles]); // Re-run if orphans list changes (e.g. after linking)

  // Helper: Find matches for a single orphan against a list of users
  const findMatchesForOrphan = (orphan, users) => {
    const searchEmail = (orphan.email || orphan.userEmail || '').trim().toLowerCase();
    const searchPhone = (orphan.phone || orphan.phoneNumber || orphan.userPhone || '').replace(/[\s\-+()]/g, '');
    
    let searchName = `${orphan.firstName || ''} ${orphan.lastName || ''}`.trim();
    if (searchName.length < 2 && (orphan.name || orphan.displayName)) {
      searchName = (orphan.name || orphan.displayName || '').trim();
    }
    const searchNameLower = searchName.toLowerCase();

    const matches = [];

    users.forEach(user => {
      let score = 0;
      const userEmail = (user.email || '').toLowerCase();
      const userPhone = (user.phoneNumber || '').replace(/[\s\-+()]/g, '');
      const userName = (user.displayName || '').toLowerCase();

      // Exact Email Match (Strongest)
      if (searchEmail && userEmail === searchEmail) {
        score += 100;
      }

      // Exact Phone Match (Strong)
      if (searchPhone.length > 5 && userPhone === searchPhone) {
        score += 80;
      }

      // Name Match (Weak but helpful)
      if (searchNameLower.length > 2 && userName.includes(searchNameLower)) {
        score += 20;
      } else if (searchNameLower.length > 2 && userName && searchNameLower.includes(userName)) {
         score += 15; // Reverse inclusion
      }

      if (score > 0) {
        matches.push({ ...user, score });
      }
    });

    return matches.sort((a, b) => b.score - a.score).slice(0, 5); // Top 5 matches
  };

  // Get suggestions for selected orphan from the pre-computed map
  const suggestions = useMemo(() => {
    if (!selectedOrphan) return [];
    return matchesMap.get(getOrphanId(selectedOrphan)) || [];
  }, [selectedOrphan, matchesMap]);

  // Manual search effect
  useEffect(() => {
    const performManualSearch = async () => {
      if (!debouncedManualSearch || debouncedManualSearch.trim().length < 3) {
        setManualSearchResults([]);
        return;
      }

      setLoadingManualSearch(true);
      try {
        const callable = httpsCallable(functions, 'searchFirebaseUsers');
        const result = await callable({ clubId, searchQuery: debouncedManualSearch.trim() });
        setManualSearchResults(result.data.results || []);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoadingManualSearch(false);
      }
    };

    performManualSearch();
  }, [debouncedManualSearch, clubId]);

  const handleLink = (account) => {
    if (onLink && selectedOrphan) {
      onLink(getOrphanId(selectedOrphan), account.uid, account.email);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Link className="w-5 h-5 text-blue-400" />
              Collega Profili Orfani
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Collega i profili importati agli account Firebase reali
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Sidebar: List of Orphans */}
          <div className="w-1/3 border-r border-gray-800 flex flex-col bg-gray-900/30">
            <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Profili da collegare ({orphanProfiles.length})
              </div>
              {loadingUsers && (
                <div className="flex items-center gap-2 text-xs text-blue-400 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Analisi match...
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {sortedOrphanProfiles.map(orphan => {
                const orphanId = getOrphanId(orphan);
                const hasMatches = matchesMap.has(orphanId);
                const matchCount = matchesMap.get(orphanId)?.length || 0;
                const bestMatchScore = matchesMap.get(orphanId)?.[0]?.score || 0;
                
                return (
                  <button
                    key={orphanId}
                    onClick={() => {
                      setSelectedOrphanId(orphanId);
                      setManualSearchQuery('');
                      setManualSearchResults([]);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3 relative ${
                      selectedOrphanId === orphanId 
                        ? 'bg-blue-600/20 border border-blue-500/50 shadow-lg shadow-blue-900/20' 
                        : 'hover:bg-gray-800 border border-transparent'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold relative ${
                      selectedOrphanId === orphanId ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {(orphan.firstName?.[0] || orphan.name?.[0] || '?').toUpperCase()}
                      
                      {/* Match Indicator Badge */}
                      {hasMatches && (
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] border border-gray-900 ${
                          bestMatchScore >= 100 ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {matchCount}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`font-medium truncate ${selectedOrphanId === orphanId ? 'text-blue-100' : 'text-gray-300'}`}>
                          {orphan.firstName && orphan.lastName 
                            ? `${orphan.firstName} ${orphan.lastName}`
                            : (orphan.name || orphan.displayName || 'Nome sconosciuto')}
                        </div>
                        {hasMatches && (
                           <Sparkles className={`w-3 h-3 ${bestMatchScore >= 100 ? 'text-green-400' : 'text-amber-400'}`} />
                        )}
                      </div>
                      {orphan.phone && (
                        <div className={`text-xs truncate flex items-center gap-1 mt-0.5 ${selectedOrphanId === orphanId ? 'text-blue-200/70' : 'text-gray-400'}`}>
                           <Phone className="w-3 h-3" /> {orphan.phone}
                        </div>
                      )}
                      <div className={`text-xs truncate mt-0.5 ${selectedOrphanId === orphanId ? 'text-blue-200/50' : 'text-gray-500'}`}>
                        {orphan.email || 'Nessuna email'}
                      </div>
                    </div>
                    {selectedOrphanId === orphanId && (
                      <ArrowRight className="w-4 h-4 text-blue-400 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Content: Search & Suggestions */}
          <div className="flex-1 flex flex-col bg-gray-900">
            {selectedOrphan ? (
              <div className="flex-1 overflow-y-auto p-6">
                
                {/* Selected Orphan Details Card */}
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 mb-8">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Profilo Selezionato</h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-300" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Nome</div>
                        <div className="font-medium text-white">
                          {selectedOrphan.firstName && selectedOrphan.lastName 
                            ? `${selectedOrphan.firstName} ${selectedOrphan.lastName}`
                            : (selectedOrphan.name || selectedOrphan.displayName || 'Nome sconosciuto')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-gray-300" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Email</div>
                        <div className="font-medium text-white">{selectedOrphan.email || 'Nessuna email'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-gray-300" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Telefono</div>
                        <div className="font-medium text-white">{selectedOrphan.phone || 'Nessun telefono'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suggested Matches Section */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    Suggerimenti Automatici
                  </h3>
                  
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-8 text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      Analisi database utenti in corso...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="grid gap-3">
                      {suggestions.map(account => (
                        <div key={account.uid} className="bg-gray-800/40 hover:bg-gray-800 border border-gray-700/50 hover:border-blue-500/50 rounded-xl p-4 transition-all duration-200 group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {account.displayName?.[0]?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <div className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors">
                                  {account.firstName && account.lastName 
                                    ? `${account.firstName} ${account.lastName}` 
                                    : (account.displayName || 'Utente senza nome')}
                                </div>
                                <div className="flex flex-col text-sm text-gray-400 gap-1 mt-1">
                                  <span className="flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> {account.email || 'Nessuna email'}
                                  </span>
                                  <span className="flex items-center gap-2">
                                    <Phone className="w-3 h-3" /> {account.phoneNumber || 'Nessun telefono'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleLink(account)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
                            >
                              <Link className="w-4 h-4" />
                              Collega
                            </button>
                          </div>
                          {/* Match indicators */}
                          <div className="mt-3 flex gap-2">
                            {account.email?.toLowerCase() === (selectedOrphan.email || '').toLowerCase() && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Email Corrisponde
                              </span>
                            )}
                            {account.phoneNumber?.replace(/[\s\-+()]/g, '') === (selectedOrphan.phone || '').replace(/[\s\-+()]/g, '') && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Telefono Corrisponde
                              </span>
                            )}
                            {account.score < 80 && account.score > 0 && (
                               <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-500/30 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Nome Simile
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-800/30 rounded-xl p-6 text-center border border-dashed border-gray-700">
                      <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400">Nessuna corrispondenza automatica trovata.</p>
                      <p className="text-sm text-gray-500">Prova la ricerca manuale qui sotto.</p>
                    </div>
                  )}
                </div>

                {/* Manual Search Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Ricerca Manuale</h3>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={manualSearchQuery}
                      onChange={(e) => setManualSearchQuery(e.target.value)}
                      placeholder="Cerca per nome, email o telefono..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {loadingManualSearch ? (
                    <div className="flex items-center justify-center py-8 text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      Ricerca in corso...
                    </div>
                  ) : manualSearchResults.length > 0 ? (
                    <div className="grid gap-2">
                      {manualSearchResults.map(account => (
                        <div key={account.uid} className="bg-gray-800/30 hover:bg-gray-800 border border-gray-700/30 hover:border-gray-600 rounded-lg p-3 flex items-center justify-between transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold">
                              {account.displayName?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div className="font-medium text-white">{account.displayName || 'Utente senza nome'}</div>
                              <div className="text-xs text-gray-400">{account.email}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleLink(account)}
                            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Collega
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : manualSearchQuery.length > 2 && (
                    <div className="text-center py-4 text-gray-500">
                      Nessun risultato trovato per "{manualSearchQuery}"
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 flex-col">
                <User className="w-16 h-16 mb-4 opacity-20" />
                <p>Seleziona un profilo dalla lista a sinistra</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
