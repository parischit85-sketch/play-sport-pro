/**
 * Match Result Modal - Input match score and record result
 */

import React, { useEffect, useMemo, useState } from 'react';
import { X, Trophy, Info } from 'lucide-react';

function MatchResultModal({ match, team1, team2, onClose, onSubmit }) {
  // bestOf: 1 => set singolo, 3 => 2 su 3
  const [bestOf, setBestOf] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  // Per-set scores: array di { team1: number, team2: number }
  const [sets, setSets] = useState([{ team1: 0, team2: 0 }]);
  // Abilita regole tennis (6 con 2 di scarto, 7-5/7-6; super tie-break a 10 nel terzo)
  const [tennisRules, setTennisRules] = useState(true);
  // Team editing removed per requirements; handled in Teams tab

  // Safe team names
  const team1Name = team1?.teamName || team1?.name || team1?.displayName || '—';
  const team2Name = team2?.teamName || team2?.name || team2?.displayName || '—';

  // Prefill from existing match when editing
  useEffect(() => {
    if (!match) return;
    const existingSets = Array.isArray(match.sets) ? match.sets : null;
    const initialBest = match.bestOf || (existingSets ? (existingSets.length === 1 ? 1 : 3) : 1);
    setBestOf(initialBest);
    if (existingSets && existingSets.length > 0) {
      setSets(existingSets);
    } else {
      setSets(initialBest === 1 ? [{ team1: 0, team2: 0 }] : [{ team1: 0, team2: 0 }, { team1: 0, team2: 0 }]);
    }
    // no-op for team editing state
  }, [match]);

  // Numero di set necessari per vincere (info)
  // const setsToWin = useMemo(() => (bestOf === 1 ? 1 : 2), [bestOf]);

  const updateSetScore = (index, teamKey, value) => {
    const val = Math.max(0, Number.isNaN(Number(value)) ? 0 : Number(value));
    setSets((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [teamKey]: val };
      return next;
    });
  };

  const addSet = () => {
    setSets((prev) => (prev.length < 3 ? [...prev, { team1: 0, team2: 0 }] : prev));
  };

  const removeLastSet = () => {
    setSets((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  // Calcola set vinti per squadra
  const derivedSetsWon = useMemo(() => {
    let t1 = 0;
    let t2 = 0;
    for (const s of sets) {
      if (s.team1 == null || s.team2 == null) continue;
      if (s.team1 === s.team2) continue; // pari non conta (non valido)
      if (s.team1 > s.team2) t1 += 1; else t2 += 1;
    }
    return { team1: t1, team2: t2 };
  }, [sets]);

  const handleSubmit = async () => {
    // Validazione base set per set
    const filledSets = sets.filter((s) => s.team1 !== undefined && s.team2 !== undefined);
    if (filledSets.length === 0) {
      alert('Inserisci almeno un set');
      return;
    }

    // Nessun set può finire in parità
    if (filledSets.some((s) => s.team1 === s.team2)) {
      alert('Un set non può finire in parità');
      return;
    }

    // Validazione specifica regole tennis (opzionale)
    if (tennisRules) {
      for (let i = 0; i < filledSets.length; i++) {
        const val = validateTennisSet(filledSets[i], i, bestOf);
        if (!val.valid) {
          alert('Punteggio set non valido secondo le regole tennis');
          return;
        }
      }
    }

    // Deriva il punteggio a set vinti
    const score = { team1: derivedSetsWon.team1, team2: derivedSetsWon.team2 };

    // Validazioni specifiche per formato
    if (bestOf === 1) {
      // Deve esserci esattamente 1 set giocato e una squadra vincente
      const valid = filledSets.length === 1 && ((score.team1 === 1 && score.team2 === 0) || (score.team1 === 0 && score.team2 === 1));
      if (!valid) {
        alert('Per il set singolo inserisci un solo set e il risultato deve essere 1-0 o 0-1');
        return;
      }
    } else if (bestOf === 3) {
      // Deve vincere chi arriva per primo a 2 set (2-0 oppure 2-1)
      const valid =
        (score.team1 === 2 && (score.team2 === 0 || score.team2 === 1) && filledSets.length >= 2 && filledSets.length <= 3) ||
        (score.team2 === 2 && (score.team1 === 0 || score.team1 === 1) && filledSets.length >= 2 && filledSets.length <= 3);
      if (!valid) {
        alert('Per 2 su 3 il risultato deve essere 2-0, 0-2, 2-1 o 1-2');
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit(match.id, score, bestOf, filledSets);
    } finally {
      setSubmitting(false);
    }
  };

  const winner =
    derivedSetsWon.team1 > derivedSetsWon.team2
      ? team1
      : derivedSetsWon.team2 > derivedSetsWon.team1
      ? team2
      : null;

  // Calcola validità globale per abilitare/disabilitare submit
  const validation = useMemo(() => {
    const filledSets = sets.filter((s) => s.team1 !== undefined && s.team2 !== undefined);
    const hasTieSet = filledSets.some((s) => s.team1 === s.team2 && (s.team1 !== 0 || s.team2 !== 0));
    if (hasTieSet) return { valid: false, reason: 'Un set è in parità' };

    // Tennis rules per-set
    if (tennisRules) {
      for (let i = 0; i < filledSets.length; i++) {
        const res = validateTennisSet(filledSets[i], i, bestOf);
        if (!res.valid) {
          return { valid: false, reason: 'Punteggio set non valido secondo le regole tennis' };
        }
      }
    }

    // BestOf specifico
    if (bestOf === 1) {
      const ok = filledSets.length === 1 && ((derivedSetsWon.team1 === 1 && derivedSetsWon.team2 === 0) || (derivedSetsWon.team2 === 1 && derivedSetsWon.team1 === 0));
      return ok ? { valid: true } : { valid: false, reason: 'Inserisci esattamente 1 set con un vincitore (1-0 o 0-1)' };
    }
    if (bestOf === 3) {
      const ok = filledSets.length >= 2 && filledSets.length <= 3 && (derivedSetsWon.team1 === 2 || derivedSetsWon.team2 === 2);
      return ok ? { valid: true } : { valid: false, reason: 'Inserisci 2 o 3 set; vince chi arriva a 2 set' };
    }
    return { valid: false, reason: 'Formato non valido' };
  }, [sets, bestOf, tennisRules, derivedSetsWon.team1, derivedSetsWon.team2]);

  function validateTennisSet(s, index, bestOfVal) {
    const a = Number(s.team1 || 0);
    const b = Number(s.team2 || 0);
    const max = Math.max(a, b);
    const min = Math.min(a, b);
    if (a === b) return { valid: false };

    // Terzo set nel 2 su 3: ammesso super tie-break a 10
    const isThirdSet = bestOfVal === 3 && index === 2;
    if (isThirdSet) {
      // valida come super TB (>=10 con 2 di scarto) oppure come set normale
      if (max >= 10 && max - min >= 2) return { valid: true };
      // fallback a regole set normali
    }

    // Set normali: minimo 6 con 2 di scarto; 7-5 e 7-6 ammessi; >7 non ammesso
    if (max < 6) return { valid: false };
    if (max === 6) {
      return { valid: min <= 4 };
    }
    if (max === 7) {
      return { valid: min === 5 || min === 6 };
    }
    // > 7 non valido per set normali
    return { valid: false };
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <Trophy className="w-6 h-6 text-primary-600 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {match?.status === 'completed' ? 'Modifica Risultato' : 'Inserisci Risultato'}
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                {team1Name} <span className="mx-1 text-gray-400">vs</span> {team2Name}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          </div>
        </div>
        

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Match format selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Formato partita
            </label>
            <div className="inline-flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setBestOf(1);
                  setSets([{ team1: 0, team2: 0 }]);
                }}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  bestOf === 1
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                Set singolo
              </button>
              <button
                type="button"
                onClick={() => {
                  setBestOf(3);
                  setSets([{ team1: 0, team2: 0 }, { team1: 0, team2: 0 }]);
                }}
                className={`px-3 py-1.5 text-sm transition-colors border-l border-gray-200 dark:border-gray-700 ${
                  bestOf === 3
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                2 su 3
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Scegli se la partita è a set singolo o al meglio di tre set.
            </p>
            <label className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={tennisRules}
                onChange={(e) => setTennisRules(e.target.checked)}
              />
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3" />
                Regole tennis (6 con 2 di scarto; 7-5/7-6; super TB a 10 nel terzo)
              </span>
            </label>
          </div>

          {/* Per-set inputs */}
          <div className="space-y-3">
            {sets.map((s, idx) => {
              const isTie = s.team1 === s.team2 && (s.team1 !== 0 || s.team2 !== 0);
              const setWinner = s.team1 === s.team2 ? null : (s.team1 > s.team2 ? 1 : 2);
              const invalidTennis = tennisRules ? !validateTennisSet(s, idx, bestOf).valid : false;
              return (
                <div key={idx} className={`p-3 rounded-lg border ${
                  setWinner === 1
                    ? 'border-green-200 dark:border-green-800 bg-green-50/40 dark:bg-green-900/10'
                    : setWinner === 2
                    ? 'border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-900/10'
                    : 'border-gray-200 dark:border-gray-700'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Set {idx + 1}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <label className={`text-sm w-28 truncate ${setWinner === 1 ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`} title={team1Name}>{team1Name}</label>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={s.team1}
                        onChange={(e) => updateSetScore(idx, 'team1', e.target.value)}
                        className={`w-16 text-center px-2 py-1 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                          setWinner === 1 ? 'border-green-300 dark:border-green-700' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                    </div>
                    <div className="text-xs text-gray-400">-</div>
                    <div className="flex items-center gap-2 flex-1">
                      <label className={`text-sm w-28 truncate ${setWinner === 2 ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`} title={team2Name}>{team2Name}</label>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={s.team2}
                        onChange={(e) => updateSetScore(idx, 'team2', e.target.value)}
                        className={`w-16 text-center px-2 py-1 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                          setWinner === 2 ? 'border-blue-300 dark:border-blue-700' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                    </div>
                  </div>
                  {isTie && (
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                      Un set non può finire in parità.
                    </div>
                  )}
                  {!isTie && invalidTennis && (
                    <div className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                      Punteggi set non validi: minimo 6 con 2 giochi di scarto (7-5/7-6 ammessi). Nel terzo set è ammesso super tie-break a 10.
                    </div>
                  )}
                </div>
              );
            })}

            {bestOf === 3 && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={addSet}
                  disabled={sets.length >= 3}
                  className="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  + Aggiungi set
                </button>
                <button
                  type="button"
                  onClick={removeLastSet}
                  disabled={sets.length <= 1}
                  className="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  − Rimuovi ultimo
                </button>
              </div>
            )}
          </div>

          {/* Winner Display */}
          {winner && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Vincitore
                  </p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">
                    {winner.name}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                    Set: {derivedSetsWon.team1} - {derivedSetsWon.team2}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Validation Messages */}
          {derivedSetsWon.team1 === derivedSetsWon.team2 && (derivedSetsWon.team1 > 0 || derivedSetsWon.team2 > 0) && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Non può esserci parità
              </p>
            </div>
          )}
          {/* Quick presets: opzionale (omesso per semplicità con per-set) */}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            disabled={!validation.valid || submitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Salvataggio...' : `Conferma Risultato (${bestOf === 1 ? '1 set' : '2 su 3'})`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MatchResultModal;
