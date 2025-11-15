import React, { useMemo, useState } from 'react';
import { X, Trophy, ChevronDown, ChevronUp, TrendingUp, Search } from 'lucide-react';

function TeamPickerModal({
  title = 'Seleziona squadra dalle classifiche',
  isOpen,
  onClose,
  onSelect, // (teamId | 'BYE' | '') => void
  standings = [], // flat array: { teamId, teamName, groupId, position, stats }
  selectedTeamIds = new Set(), // teamIds already used in other slots
  allowBye = true,
  teamsPerGroup = 2,
  T = {},
}) {
  // Provide default theme values if T is not passed
  const theme = {
    modalBackground: 'bg-gray-800',
    modalBorder: 'border border-gray-700',
    input: 'bg-gray-700 border border-gray-600 text-white',
    cardBackground: 'bg-gray-800',
    ...T,
  };

  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});

  const grouped = useMemo(() => {
    const map = new Map();
    for (const s of standings) {
      const key = s.groupId ?? '—';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
    }
    return Array.from(map.entries()).sort(([a], [b]) => String(a).localeCompare(String(b)));
  }, [standings]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return grouped;
    return grouped
      .map(([gid, arr]) => [gid, arr.filter((t) => (t.teamName || '').toLowerCase().includes(q))])
      .filter(([, arr]) => arr.length > 0);
  }, [grouped, search]);

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Removed medal icon for position per request; show plain rank number

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex flex-col sm:flex sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-picker-title"
    >
      <div
        className={`w-full h-full sm:h-auto sm:max-w-4xl ${theme.modalBackground} sm:rounded-xl shadow-xl ${theme.modalBorder} flex flex-col`}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700 sticky top-0 bg-gray-800/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary-400" />
            <h3 id="team-picker-title" className="text-base font-semibold text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-700"
            aria-label="Chiudi selezione squadre"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        {/* Scrollable content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca squadra…"
                aria-label="Cerca squadra"
                className={`${theme.input} w-full pl-9 pr-3 py-2`}
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {allowBye && (
              <button
                type="button"
                onClick={() => {
                  onSelect('BYE');
                  onClose?.();
                }}
                className="px-3 py-2 rounded-lg border border-amber-700 bg-amber-900/30 hover:bg-amber-900/40 text-amber-200 text-sm w-full sm:w-auto"
                title="Imposta uno slot libero (BYE)"
              >
                Scegli BYE
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onSelect('');
                onClose?.();
              }}
              className="px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm w-full sm:w-auto"
              title="Svuota slot"
            >
              Svuota
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-10">Nessuna squadra trovata</div>
          ) : (
            <div className="space-y-6">
              {filtered.map(([groupId, groupStandings]) => {
                const isExpanded = expandedGroups[groupId] !== false;
                return (
                  <div key={groupId} className="border border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleGroup(groupId)}
                      aria-expanded={isExpanded}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary-900/20 to-blue-900/20 hover:from-primary-900/30 hover:to-blue-900/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-primary-400" />
                        <div className="text-left">
                          <h3 className="text-lg font-bold text-white">
                            Girone {String(groupId).toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-400">{groupStandings.length} squadre</p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className={`p-4 ${theme.cardBackground} overflow-x-auto`}>
                        <table className="w-full text-sm">
                          <thead className="bg-gray-900">
                            <tr className="border-b border-gray-700">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                                Squadra
                              </th>
                              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-300 hidden md:table-cell">
                                G
                              </th>
                              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-300 hidden md:table-cell">
                                V
                              </th>
                              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-300 hidden md:table-cell">
                                P
                              </th>
                              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-300 hidden lg:table-cell">
                                SW
                              </th>
                              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-300 hidden lg:table-cell">
                                SL
                              </th>
                              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-300 hidden md:table-cell">
                                +/-
                              </th>
                              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-300">
                                DG
                              </th>
                              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">
                                Pts
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupStandings.map((standing, index) => {
                              const isQualified = index + 1 <= (teamsPerGroup || 2);
                              const used = selectedTeamIds.has(standing.teamId);
                              return (
                                <tr
                                  key={standing.teamId}
                                  className={`border-b border-gray-800 hover:bg-gray-700/50 transition-colors ${
                                    isQualified ? 'bg-green-900/10' : ''
                                  }`}
                                >
                                  <td className="py-3 px-4">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-medium text-white whitespace-normal break-words line-clamp-2 leading-snug">
                                          {standing.teamName}
                                        </span>
                                        {isQualified && (
                                          <TrendingUp className="w-4 h-4 text-green-500" />
                                        )}
                                      </div>
                                      <div className="shrink-0">
                                        <button
                                          type="button"
                                          disabled={used}
                                          onClick={() => {
                                            onSelect(standing.teamId);
                                            onClose?.();
                                          }}
                                          className={`px-2 py-1 rounded-md text-[11px] font-medium border focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:ring-offset-0 ${
                                            used
                                              ? 'opacity-50 cursor-not-allowed border-gray-700 text-gray-400'
                                              : 'border-primary-700 text-primary-300 hover:bg-primary-900/30'
                                          }`}
                                        >
                                          Seleziona
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-2 text-center text-sm text-gray-400 hidden md:table-cell">
                                    {standing.matchesPlayed}
                                  </td>
                                  <td className="py-3 px-2 text-center text-sm font-medium text-green-400 hidden md:table-cell">
                                    {standing.matchesWon}
                                  </td>
                                  <td className="py-3 px-2 text-center text-sm font-medium text-red-400 hidden md:table-cell">
                                    {standing.matchesLost}
                                  </td>
                                  <td className="py-3 px-2 text-center text-sm text-gray-400 hidden lg:table-cell">
                                    {standing.setsWon}
                                  </td>
                                  <td className="py-3 px-2 text-center text-sm text-gray-400 hidden lg:table-cell">
                                    {standing.setsLost}
                                  </td>
                                  <td className="py-3 px-2 text-center text-sm hidden md:table-cell">
                                    <span
                                      className={`font-medium ${
                                        (standing.setsDifference || 0) > 0
                                          ? 'text-green-400'
                                          : (standing.setsDifference || 0) < 0
                                            ? 'text-red-400'
                                            : 'text-gray-400'
                                      }`}
                                    >
                                      {(standing.setsDifference || 0) > 0 ? '+' : ''}
                                      {standing.setsDifference || 0}
                                    </span>
                                  </td>
                                  <td className="py-3 px-2 text-center text-sm">
                                    <span
                                      className={`font-medium ${
                                        (standing.gamesDifference || 0) > 0
                                          ? 'text-green-400'
                                          : (standing.gamesDifference || 0) < 0
                                            ? 'text-red-400'
                                            : 'text-gray-400'
                                      }`}
                                    >
                                      {(standing.gamesDifference || 0) > 0 ? '+' : ''}
                                      {standing.gamesDifference || 0}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="text-lg font-bold text-primary-400">
                                      {standing.points}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div className="mt-3 p-2 bg-gray-800 rounded">
                          <div className="flex flex-wrap gap-3 text-[11px] text-gray-400">
                            <div>
                              <strong>G</strong> = Giocate
                            </div>
                            <div>
                              <strong>V</strong> = Vinte
                            </div>
                            <div>
                              <strong>P</strong> = Perse
                            </div>
                            <div>
                              <strong>SW</strong> = Set Vinti
                            </div>
                            <div>
                              <strong>SL</strong> = Set Persi
                            </div>
                            <div>
                              <strong>+/-</strong> = Differenza Set
                            </div>
                            <div>
                              <strong>Pts</strong> = Punti
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-700 flex items-center justify-end sticky bottom-0 bg-gray-800/95 backdrop-blur-sm">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300">
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeamPickerModal;
