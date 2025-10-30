import React, { useEffect, useState } from 'react';
import { computeTournamentChampionshipPoints } from '../../services/championshipPointsService';
import {
  getChampionshipApplyStatus,
  applyTournamentChampionshipPoints,
} from '../../services/championshipApplyService';

export default function TournamentPoints({ clubId, tournament }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ totals: [], meta: {} });
  const [applyInfo, setApplyInfo] = useState({ applied: false, appliedAt: null });
  const [applyLoading, setApplyLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [showDateModal, setShowDateModal] = useState(false);
  const [matchDateTime, setMatchDateTime] = useState('');
  const toggle = (teamId) => setExpanded((prev) => ({ ...prev, [teamId]: !prev[teamId] }));

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await computeTournamentChampionshipPoints(clubId, tournament.id, tournament);
        if (!mounted) return;
        setData(res);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Errore nel calcolo dei punti');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (clubId && tournament?.id) load();
    return () => {
      mounted = false;
    };
  }, [clubId, tournament?.id]);

  useEffect(() => {
    let mounted = true;
    async function loadStatus() {
      if (!clubId || !tournament?.id) return;
      try {
        const res = await getChampionshipApplyStatus(clubId, tournament.id);
        if (!mounted) return;
        if (res.applied) setApplyInfo({ applied: true, appliedAt: res.data?.appliedAt || null });
        else setApplyInfo({ applied: false, appliedAt: null });
      } catch (e) {
        // ignore status errors in UI
      }
    }
    loadStatus();
    return () => {
      mounted = false;
    };
  }, [clubId, tournament?.id]);

  const handleApply = async () => {
    if (!clubId || !tournament?.id) return;
    
    // Inizializza con data/ora corrente
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    
    setMatchDateTime(localDateTime);
    setShowDateModal(true);
  };

  const handleConfirmApply = async () => {
    if (!matchDateTime) {
      setError('Seleziona data e orario');
      return;
    }

    setApplyLoading(true);
    setError(null);
    setShowDateModal(false);
    
    try {
      const selectedDate = new Date(matchDateTime).toISOString();
      
      const res = await applyTournamentChampionshipPoints(clubId, tournament, {
        matchDate: selectedDate,
      });
      
      if (res.success) {
        if (res.alreadyApplied) {
          setApplyInfo({ applied: true, appliedAt: res.appliedAt || null });
        } else {
          setApplyInfo({ applied: true, appliedAt: new Date().toISOString() });
        }
      } else {
        // ✅ FIX #4: Gestione specifica errore validazione temporale
        if (res.temporalValidationFailed) {
          setError(`⚠️ Validazione temporale fallita: ${res.error}`);
        } else {
          setError(res.error || 'Errore durante applicazione punti');
          console.error('❌ Errore applicazione punti torneo:', res.error);
        }
      }
    } catch (e) {
      setError(e?.message || 'Errore durante applicazione punti');
      console.error('❌ Exception applicazione punti torneo:', e);
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-300">Calcolo punti in corso…</div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded border border-red-800 bg-red-900/20 text-red-300 text-sm">
        {error}
      </div>
    );
  }

  const rows = data?.totals || [];
  const cfg = tournament?.configuration?.championshipPoints || {};

  // Helper: map KO round names to Italian labels, emoji, and sort order
  const mapKoRound = (roundRaw) => {
    const r = (roundRaw || '').toString().toLowerCase().trim();
    // Normalize common variants and tolerate separators (space, hyphen, underscore)
    const isFinal =
      /(final(?!i)|\bfinale\b|\bfinals?\b)/.test(r) &&
      !/semi/.test(r) &&
      !/quart/.test(r) &&
      !/ottav/.test(r) &&
      !/sedic/.test(r) &&
      !/(third|3)/.test(r);
    const isThird = /(third|3(?:rd)?\s*place|3\s*posto|finalina|terzo)/.test(r);
    const isSemi = /(semi[-_\s]?finals?|semifinal[ei]?)/.test(r);
    const isQuarter = /(quarter[-_\s]?finals?|quart[i]?\b)/.test(r);
    const isRound16 = /(round[-_\s]of[-_\s]16|ottav[i]?\b|r16)/.test(r);
    const isRound32 = /(round[-_\s]of[-_\s]32|sedicesim[i]?\b|r32)/.test(r);

    if (isFinal) return { label: 'Finale', emoji: '🏆', order: 400 };
    if (isThird) return { label: 'Finale 3° posto', emoji: '🥉', order: 390 };
    if (isSemi) return { label: 'Semifinale', emoji: '🥈', order: 300 };
    if (isQuarter) return { label: 'Quarti di finale', emoji: '🏅', order: 200 };
    if (isRound16) return { label: 'Ottavi di finale', emoji: '🎯', order: 150 };
    if (isRound32) return { label: 'Sedicesimi di finale', emoji: '🔹', order: 100 };
    return { label: roundRaw || 'Eliminazione', emoji: '🎯', order: 999 };
  };

  // Helper: short KO label for compact parentheses (e.g., Ottavi/Quarti/Semifinali/Finale/3° posto)
  const shortKoLabel = (roundRaw) => {
    const { label } = mapKoRound(roundRaw);
    const l = (label || '').toLowerCase();
    if (l.includes('ottavi')) return 'Ottavi';
    if (l.includes('quarti')) return 'Quarti';
    if (l.includes('semi')) return 'Semifinali';
    if (l.includes('3')) return '3° posto';
    if (l.includes('finale')) return 'Finale';
    return label || 'KO';
  };

  // Color mapping for parentheses tag: Girone vs KO rounds
  const roundColorClass = (contribution) => {
    if (!contribution?.isKnockout) return 'text-blue-300';
    const { label } = mapKoRound(contribution.round);
    const l = (label || '').toLowerCase();
    if (l.includes('sedicesimi')) return 'text-indigo-300';
    if (l.includes('ottavi')) return 'text-violet-300';
    if (l.includes('quarti')) return 'text-purple-300';
    if (l.includes('semi')) return 'text-fuchsia-300';
    if (l.includes('3')) return 'text-amber-300';
    if (l.includes('finale')) return 'text-amber-300';
    return 'text-purple-300';
  };

  return (
    <div className="space-y-4">
      {/* Status / Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="rounded-lg border border-gray-800 bg-gray-800 px-4 py-2 text-sm">
          {applyInfo.applied ? (
            <span className="text-emerald-300">
              Punti applicati al campionato
              {applyInfo.appliedAt
                ? ` • ${new Date(applyInfo.appliedAt).toLocaleString('it-IT')}`
                : ''}
            </span>
          ) : (
            <span className="text-amber-300">Bozza non applicata</span>
          )}
        </div>
        {!applyInfo.applied && (
          <button
            onClick={handleApply}
            disabled={applyLoading}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${applyLoading ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'}`}
          >
            {applyLoading ? 'Applicazione…' : 'Applica al Campionato'}
          </button>
        )}
      </div>
      <div className="rounded-xl border border-gray-800 bg-gray-800 p-4">
        <div className="text-sm text-gray-300">
          <div className="font-semibold mb-1">Bozza Punti Campionato</div>
          <div className="text-xs text-gray-400">
            RPA × {cfg?.rpaMultiplier ?? 1} • Piazzamento girone (1°{' '}
            {cfg?.groupPlacementPoints?.[1] ?? 0}, 2° {cfg?.groupPlacementPoints?.[2] ?? 0}) • KO:
            Finale {cfg?.knockoutProgressPoints?.finals ?? 0}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Nota: tutti i valori visualizzati sono per singolo giocatore; i BYE non assegnano punti;
            le sconfitte generano RPA negativi ma non vengono assegnati (mostrati tra parentesi
            nella colonna Assegnato).
          </div>
        </div>
      </div>

      <div className="overflow-auto rounded-xl border border-gray-800 bg-gray-800">
        <table className="min-w-full text-sm table-fixed">
          <thead className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur text-gray-300">
            <tr>
              <th className="px-3 py-2 text-left w-[28%]">Squadra</th>
              <th className="px-3 py-2 text-center w-[14%]">Punti Partite</th>
              <th className="px-3 py-2 text-center w-[14%]">Piazz. Girone</th>
              <th className="px-3 py-2 text-center w-[14%]">Punti Tabellone</th>
              <th className="px-3 py-2 text-center w-[20%]">Punti x Giocatore</th>
              <th className="px-3 py-2 text-right w-[10%]">Dettagli</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Nessun dato disponibile.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <React.Fragment key={r.teamId}>
                <tr
                  key={r.teamId}
                  className="border-t border-gray-700/50 odd:bg-gray-900/30"
                >
                  <td className="px-3 py-2 font-medium text-gray-100">
                    <div>{r.teamName}</div>
                  </td>
                  {/* Punti Partite (RPA) per-player (single value) */}
                  <td className="px-3 py-2 text-center">
                    {(() => {
                      const points = Number(r.rpa) || 0;
                      const positive = points >= 0;
                      return (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            positive
                              ? 'bg-emerald-900/30 text-emerald-300'
                              : 'bg-red-900/30 text-red-300'
                          }`}
                          title="RPA per giocatore"
                        >
                          <span>{points >= 0 ? `+${points.toFixed(0)}` : points.toFixed(0)}</span>
                        </span>
                      );
                    })()}
                  </td>
                  {/* Group placement per-player (single value) */}
                  <td className="px-3 py-2 text-center">
                    {(() => {
                      const points = Number(r.groupPlacement) || 0;
                      const positive = points > 0;
                      const negative = points < 0;
                      const cls = positive
                        ? 'bg-emerald-900/30 text-emerald-300'
                        : negative
                          ? 'bg-red-900/30 text-red-300'
                          : 'bg-gray-700 text-gray-300';
                      return (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${cls}`}
                          title="Bonus girone per giocatore"
                        >
                          <span>{points > 0 ? `+${points.toFixed(0)}` : points.toFixed(0)}</span>
                        </span>
                      );
                    })()}
                  </td>
                  {/* Knockout per-player (single value) */}
                  <td className="px-3 py-2 text-center">
                    {(() => {
                      const points = Number(r.knockout) || 0;
                      const positive = points > 0;
                      const negative = points < 0;
                      const cls = positive
                        ? 'bg-emerald-900/30 text-emerald-300'
                        : negative
                          ? 'bg-red-900/30 text-red-300'
                          : 'bg-gray-700 text-gray-300';
                      return (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${cls}`}
                          title="KO per giocatore"
                        >
                          <span>{points > 0 ? `+${points.toFixed(0)}` : points.toFixed(0)}</span>
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {r.split && r.split.length > 0 ? (
                      (() => {
                        // Show the points for one player (all players get the same amount)
                        const points = Number(r.split[0].points || 0);
                        const positive = points > 0;
                        const negative = points < 0;
                        const cls = positive
                          ? 'bg-emerald-900/30 text-emerald-300'
                          : negative
                            ? 'bg-red-900/30 text-red-300'
                            : 'bg-gray-700 text-gray-300';
                        return (
                          <span
                            className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs ${cls}`}
                            title="Punti per giocatore"
                          >
                            <span>
                              {points > 0 ? `+${points.toFixed(0)}` : points.toFixed(0)} pt
                            </span>
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      className="px-3 py-1 rounded bg-gray-700 text-gray-200 text-xs hover:bg-gray-600"
                      onClick={() => toggle(r.teamId)}
                    >
                      {expanded[r.teamId] ? 'Nascondi' : 'Dettagli'}
                    </button>
                  </td>
                </tr>
                {expanded[r.teamId] && (
                  <tr className="border-t border-gray-700/50">
                    <td colSpan={6} className="px-4 py-3 bg-gray-900/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Array.isArray(r.details?.rpaContributions) &&
                          r.details.rpaContributions.length > 0 && (
                            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                              <div className="text-base font-semibold mb-2">Contributi RPA</div>
                              <div className="space-y-1.5 max-h-64 overflow-auto pr-1">
                                {(() => {
                                  const sorted = [...r.details.rpaContributions]
                                    .map((c) => ({
                                      ...c,
                                      __isKo: !!c?.isKnockout,
                                      __roundInfo: c?.isKnockout ? mapKoRound(c.round) : null,
                                      __ts: c?.date ? new Date(c.date).getTime() : 0,
                                    }))
                                    .sort((a, b) => {
                                      // Group first (non-KO), then KO
                                      if (a.__isKo !== b.__isKo) return a.__isKo ? 1 : -1;
                                      if (!a.__isKo && !b.__isKo) {
                                        // Both group: by date asc
                                        if (a.__ts !== b.__ts) return a.__ts - b.__ts;
                                        return 0;
                                      }
                                      // Both KO: by round order asc, then date asc
                                      const oa = a.__roundInfo?.order ?? 9999;
                                      const ob = b.__roundInfo?.order ?? 9999;
                                      if (oa !== ob) return oa - ob;
                                      if (a.__ts !== b.__ts) return a.__ts - b.__ts;
                                      return 0;
                                    });
                                  return sorted.map((c, idx) => {
                                    const points = Number(c.pts) || 0;
                                    const positive = points >= 0;
                                    const isKoLoss = c?.isKnockout && c?.isLoss === true;
                                    const tag = c?.isKnockout ? shortKoLabel(c?.round) : 'Girone';
                                    return (
                                      <div
                                        key={`${r.teamId}-rpa-${c.matchId || idx}`}
                                        className="flex items-center justify-between text-sm"
                                      >
                                        <div className="text-gray-300 truncate">
                                          vs {c.opponentTeamName}
                                          {c.date ? (
                                            <span className="text-gray-400">
                                              {' '}
                                              • {new Date(c.date).toLocaleDateString('it-IT')}
                                            </span>
                                          ) : null}
                                          <span className={`ml-1 ${roundColorClass(c)}`}>
                                            ({tag})
                                            {isKoLoss && (
                                              <span className="text-orange-400 ml-1">
                                                - Persa
                                              </span>
                                            )}
                                          </span>
                                        </div>
                                        <span
                                          className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                                            positive
                                              ? 'bg-emerald-900/30 text-emerald-300'
                                              : isKoLoss
                                                ? 'bg-orange-900/30 text-orange-300'
                                                : 'bg-red-900/30 text-red-300'
                                          }`}
                                        >
                                          {points >= 0
                                            ? `+${points.toFixed(0)}`
                                            : points.toFixed(0)}
                                        </span>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          )}

                        {r.details?.groupPlacement && (
                            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                              <div className="text-base font-semibold mb-2">Piazzamento Girone</div>
                              <div className="flex items-center justify-between text-sm text-gray-300">
                              <span>Posizione: {r.details.groupPlacement.position || '-'}</span>
                              {(() => {
                                const points = Number(r.details.groupPlacement.points) || 0;
                                const positive = points > 0;
                                const negative = points < 0;
                                const cls = positive
                                  ? 'bg-emerald-900/30 text-emerald-300'
                                  : negative
                                    ? 'bg-red-900/30 text-red-300'
                                    : 'bg-gray-700 text-gray-300';
                                return (
                                  <span
                                    className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${cls}`}
                                  >
                                    {points > 0 ? `+${points.toFixed(0)}` : points.toFixed(0)}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {Array.isArray(r.details?.knockoutContributions) &&
                          r.details.knockoutContributions.length > 0 && (
                            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                              <div className="text-base font-semibold mb-2">
                                Eliminazione Diretta
                              </div>
                              <div className="space-y-1.5 max-h-64 overflow-auto pr-1">
                                {(() => {
                                  const sorted = [...r.details.knockoutContributions]
                                    .map((k) => ({ ...k, __roundInfo: mapKoRound(k.round) }))
                                    .sort((a, b) => a.__roundInfo.order - b.__roundInfo.order);
                                  return sorted.map((k, idx) => {
                                    const points = Number(k.pts) || 0;
                                    const { emoji, label } = k.__roundInfo;
                                    const positive = points > 0;
                                    const negative = points < 0;
                                    const isLoss = k.isLoss === true;
                                    const cls = positive
                                      ? 'bg-emerald-900/30 text-emerald-300'
                                      : negative
                                        ? 'bg-red-900/30 text-red-300'
                                        : isLoss
                                          ? 'bg-orange-900/30 text-orange-300'
                                          : 'bg-gray-700 text-gray-300';
                                    return (
                                      <div
                                        key={`${r.teamId}-ko-${k.matchId || idx}`}
                                        className="flex items-center justify-between text-sm"
                                      >
                                        <div className="text-gray-300 truncate">
                                          {emoji} {label}
                                          {isLoss && (
                                            <span className="text-orange-400 ml-1">
                                              - Persa
                                            </span>
                                          )}
                                        </div>
                                        <span
                                          className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${cls}`}
                                        >
                                          {points > 0 ? `+${points.toFixed(0)}` : points.toFixed(0)}
                                        </span>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal per selezionare data e orario */}
      {showDateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Seleziona Data e Orario Match
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Inserisci la data e l&apos;orario in cui sono state giocate le partite del torneo.
              Questa data verrà usata per tutti i match nei dettagli statistici.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data e Orario
              </label>
              <input
                type="datetime-local"
                value={matchDateTime}
                onChange={(e) => {
                  setMatchDateTime(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg 
                         bg-gray-700 text-white
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDateModal(false)}
                className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleConfirmApply}
                disabled={!matchDateTime || applyLoading}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {applyLoading ? 'Applicazione...' : 'Conferma e Applica'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

