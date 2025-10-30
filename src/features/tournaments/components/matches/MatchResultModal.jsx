/**
 * Match Result Modal - Input match score and record result
 */

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Trophy, Info } from 'lucide-react';
import { themeTokens } from '../../../../lib/theme';

function MatchResultModal({ match, team1, team2, onClose, onSubmit, T: externalT }) {
  const T = externalT || themeTokens();
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

  // Body scroll lock + ESC to close while modal is mounted
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    
    return () => {
      document.body.style.overflow = prevOverflow || 'auto';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal container - uses padding and min-h-screen to center in viewport */}
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Modal content */}
        <div 
          className={`relative ${T.card} rounded-xl shadow-2xl max-w-2xl w-full my-8`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b ring-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <Trophy className={`w-5 h-5 ${T.accentInfo}`} />
              </div>
              <div>
                <h2 id="modal-title" className={`text-xl font-bold ${T.text}`}>
                  {match?.status === 'completed' ? 'Modifica Risultato' : 'Inserisci Risultato'}
                </h2>
                <div className={`text-sm ${T.subtext} mt-0.5`}>
                  {team1Name} <span className="mx-1">vs</span> {team2Name}
                </div>
              </div>
            </div>
            <button onClick={onClose} className={`${T.btnGhostSm} !p-2`} aria-label="Chiudi modal">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content - scrollable if needed */}
          <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Match format selector */}
          <div className="space-y-2">
            <div className={`block text-sm font-medium ${T.text}`}>Formato partita</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setBestOf(1);
                  setSets([{ team1: 0, team2: 0 }]);
                }}
                className={`flex-1 ${bestOf === 1 ? T.btnPrimary : T.btnGhost}`}
              >
                Set singolo
              </button>
              <button
                type="button"
                onClick={() => {
                  setBestOf(3);
                  setSets([{ team1: 0, team2: 0 }, { team1: 0, team2: 0 }]);
                }}
                className={`flex-1 ${bestOf === 3 ? T.btnPrimary : T.btnGhost}`}
              >
                2 su 3
              </button>
            </div>
            <p className={`text-xs ${T.subtext}`}>
              Scegli se la partita è a set singolo o al meglio di tre set.
            </p>
            <label className={`inline-flex items-center gap-2 text-sm ${T.text} cursor-pointer`}>
              <input
                type="checkbox"
                checked={tennisRules}
                onChange={(e) => setTennisRules(e.target.checked)}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                Regole tennis (6 con 2 di scarto; 7-5/7-6; super TB a 10 nel terzo)
              </span>
            </label>
          </div>

          {/* Per-set inputs */}
          <div className="space-y-4">
            {sets.map((s, idx) => {
              const isTie = s.team1 === s.team2 && (s.team1 !== 0 || s.team2 !== 0);
              const setWinner = s.team1 === s.team2 ? null : (s.team1 > s.team2 ? 1 : 2);
              const invalidTennis = tennisRules ? !validateTennisSet(s, idx, bestOf).valid : false;
              
              return (
                <div 
                  key={idx} 
                  className={`p-4 rounded-lg ${setWinner ? '' : T.border} ${!setWinner ? 'bg-gray-800/50' : ''} ${
                    setWinner === 1
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : setWinner === 2
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`text-sm font-semibold ${T.text}`}>Set {idx + 1}</div>
                    {setWinner && (
                      <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        setWinner === 1 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {setWinner === 1 ? '🏆 ' + team1Name : '🏆 ' + team2Name}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                    {/* Team 1 */}
                    <div className="space-y-2">
                      <label className={`block text-xs font-medium ${setWinner === 1 ? 'text-emerald-400' : T.subtext}`}>
                        {team1Name}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={s.team1}
                        onChange={(e) => updateSetScore(idx, 'team1', e.target.value)}
                        className={`${T.input} w-full text-center font-bold text-lg ${
                          setWinner === 1 ? 'ring-2 ring-emerald-500/20 border-emerald-500/50' : ''
                        }`}
                      />
                    </div>
                    
                    {/* Separator */}
                    <div className="text-2xl font-bold text-gray-500 pb-8">−</div>
                    
                    {/* Team 2 */}
                    <div className="space-y-2">
                      <label className={`block text-xs font-medium ${setWinner === 2 ? 'text-blue-400' : T.subtext}`}>
                        {team2Name}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={s.team2}
                        onChange={(e) => updateSetScore(idx, 'team2', e.target.value)}
                        className={`${T.input} w-full text-center font-bold text-lg ${
                          setWinner === 2 ? 'ring-2 ring-blue-500/20 border-blue-500/50' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Validation messages */}
                  {isTie && (
                    <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-xs font-medium text-red-400">
                        ⚠️ Un set non può finire in parità
                      </p>
                    </div>
                  )}
                  {!isTie && invalidTennis && (
                    <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <p className="text-xs font-medium text-amber-400">
                        ⚠️ Punteggio non valido: minimo 6 con 2 giochi di scarto (7-5/7-6 ammessi). Nel terzo set è ammesso super tie-break a 10.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add/Remove set buttons */}
            {bestOf === 3 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addSet}
                  disabled={sets.length >= 3}
                  className={`flex-1 ${sets.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''} ${T.btnGhost}`}
                >
                  + Aggiungi set
                </button>
                <button
                  type="button"
                  onClick={removeLastSet}
                  disabled={sets.length <= 1}
                  className={`flex-1 ${sets.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''} ${T.btnGhost}`}
                >
                  − Rimuovi ultimo
                </button>
              </div>
            )}
          </div>

          {/* Winner Display */}
          {winner && (
            <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-2 border-emerald-500/30 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-400">
                    Vincitore
                  </p>
                  <p className="text-xl font-bold text-emerald-300 mt-0.5">
                    {winner.name}
                  </p>
                  <p className="text-sm text-emerald-400 mt-1">
                    Set: {derivedSetsWon.team1} − {derivedSetsWon.team2}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Validation Warning */}
          {!validation.valid && derivedSetsWon.team1 > 0 && (
            <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-xl p-4">
              <p className={`text-sm font-medium ${T.accentWarning}`}>
                ⚠️ {validation.reason}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t ring-0">
          <button onClick={onClose} className={T.btnGhost}>Annulla</button>
          <button
            onClick={handleSubmit}
            disabled={!validation.valid || submitting}
            className={`${T.btnPrimary} ${(!validation.valid || submitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {submitting ? 'Salvataggio...' : `Conferma Risultato (${bestOf === 1 ? '1 set' : '2 su 3'})`}
          </button>
        </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default MatchResultModal;

