import React, { useMemo, useState } from 'react';
import { X, Trophy, ChevronDown, ChevronUp, Medal, TrendingUp, Search, CheckCircle2 } from 'lucide-react';

function TeamPickerModal({
  title = 'Seleziona squadra dalle classifiche',
  isOpen,
  onClose,
  onSelect, // (teamId | 'BYE' | '') => void
  standings = [], // flat array: { teamId, teamName, groupId, position, stats }
  selectedTeamIds = new Set(), // teamIds already used in other slots
  allowBye = true,
  teamsPerGroup = 2,
}) {
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

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Medal className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-sm text-gray-500 dark:text-gray-400">#{rank}</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca squadra…"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
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
                className="px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-sm"
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
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm"
              title="Svuota slot"
            >
              Svuota
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">Nessuna squadra trovata</div>
          ) : (
            <div className="space-y-6">
              {filtered.map(([groupId, groupStandings]) => {
                const isExpanded = expandedGroups[groupId] !== false;
                return (
                  <div key={groupId} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleGroup(groupId)}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 hover:from-primary-100 hover:to-blue-100 dark:hover:from-primary-900/30 dark:hover:to-blue-900/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        <div className="text-left">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Girone {String(groupId).toUpperCase()}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{groupStandings.length} squadre</p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-white dark:bg-gray-800 overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">#</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Squadra</th>
                              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">G</th>
                              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">V</th>
                              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">P</th>
                              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">SW</th>
                              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">SL</th>
                              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">+/-</th>
                              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Pts</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupStandings.map((standing, index) => {
                              const rank = index + 1;
                              const isQualified = rank <= (teamsPerGroup || 2);
                              const used = selectedTeamIds.has(standing.teamId);
                              return (
                                <tr
                                  key={standing.teamId}
                                  className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                    isQualified ? 'bg-green-50 dark:bg-green-900/10' : ''
                                  }`}
                                >
                                  <td className="py-3 px-4">
                                    <div className="flex items-center justify-center">{getRankIcon(rank)}</div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-medium text-gray-900 dark:text-white truncate">{standing.teamName}</span>
                                        {isQualified && <TrendingUp className="w-4 h-4 text-green-500" />}
                                        {used && (
                                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                                            <CheckCircle2 className="w-3 h-3" /> In tabellone
                                          </span>
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
                                          className={`px-3 py-1.5 rounded-md text-xs border ${
                                            used
                                              ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 text-gray-400'
                                              : 'border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                                          }`}
                                        >
                                          Seleziona
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-2 text-center text-sm text-gray-600 dark:text-gray-400">{standing.matchesPlayed}</td>
                                  <td className="py-3 px-2 text-center text-sm font-medium text-green-600 dark:text-green-400">{standing.matchesWon}</td>
                                  <td className="py-3 px-2 text-center text-sm font-medium text-red-600 dark:text-red-400">{standing.matchesLost}</td>
                                  <td className="py-3 px-2 text-center text-sm text-gray-600 dark:text-gray-400">{standing.setsWon}</td>
                                  <td className="py-3 px-2 text-center text-sm text-gray-600 dark:text-gray-400">{standing.setsLost}</td>
                                  <td className="py-3 px-2 text-center text-sm">
                                    <span
                                      className={`font-medium ${
                                        (standing.setsDifference || 0) > 0
                                          ? 'text-green-600 dark:text-green-400'
                                          : (standing.setsDifference || 0) < 0
                                          ? 'text-red-600 dark:text-red-400'
                                          : 'text-gray-500 dark:text-gray-400'
                                      }`}
                                    >
                                      {(standing.setsDifference || 0) > 0 ? '+' : ''}
                                      {standing.setsDifference || 0}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{standing.points}</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex flex-wrap gap-3 text-[11px] text-gray-600 dark:text-gray-400">
                            <div><strong>G</strong> = Giocate</div>
                            <div><strong>V</strong> = Vinte</div>
                            <div><strong>P</strong> = Perse</div>
                            <div><strong>SW</strong> = Set Vinti</div>
                            <div><strong>SL</strong> = Set Persi</div>
                            <div><strong>+/-</strong> = Differenza Set</div>
                            <div><strong>Pts</strong> = Punti</div>
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

        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Chiudi</button>
        </div>
      </div>
    </div>
  );
}

export default TeamPickerModal;
