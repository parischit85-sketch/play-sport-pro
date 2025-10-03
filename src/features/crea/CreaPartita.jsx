import React, { useMemo, useState, useEffect } from "react";
import { createClubMatch, deleteClubMatch } from '@services/club-matches.js';
import { getHistoricalRatings, savePreMatchRatings } from '@services/rating-history.js';
import { updatePlayerRatingsAfterMatch, calculatePlayerDeltas } from '@services/player-rating-update.js';
import { useRatingMigration } from '@utils/rating-migration.js';
import { useClub } from '@contexts/ClubContext.jsx';
import Section from "@ui/Section.jsx";
import { byPlayerFirstAlpha } from "@lib/names.js";
import { DEFAULT_RATING, uid } from "@lib/ids.js";
import { computeFromSets, rpaFactor } from "@lib/rpa.js";
import MatchRow from "@features/matches/MatchRow.jsx";
import { FormulaIntro } from "@ui/formulas/FormulaIntro.jsx";
import { FormulaExplainer } from "@ui/formulas/FormulaExplainer.jsx";
import { useMatchForm } from '../../hooks/useMatchForm';
import {
  FormProgressBar,
  EnhancedPlayerSelect,
  EnhancedSetInput,
  EnhancedSubmitButton,
  MatchSummaryCard,
  ToastNotification
} from '../../components/ui/MatchFormComponents';
import analyticsModule from '../../lib/analytics';

const toLocalInputValue = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  const dt = new Date(d);
  const y = dt.getFullYear(),
    m = pad(dt.getMonth() + 1),
    day = pad(dt.getDate());
  const hh = pad(dt.getHours()),
    mm = pad(dt.getMinutes());
  return `${y}-${m}-${day}T${hh}:${mm}`;
};

function PlayerSelect({ players, value, onChange, disabledIds, T }) {
  // Filtra solo i giocatori con nome valido o displayName
  const validPlayers = players.filter(p => {
    const name = (p.name || "").trim();
    const displayName = (p.displayName || "").trim();
    
    // Escludi profili admin (anche con role undefined ma isClubAdmin true)
    if (p.role === 'admin' || p.isClubAdmin === true) return false;
    
    // Escludi profili senza name (solo displayName non è sufficiente per i giocatori)
    if (!p.name || p.name === undefined || name.length === 0) return false;
    
    return true;
  });
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${T.input} pr-8 w-full`}
    >
      <option value="">—</option>
      {validPlayers.map((p) => (
        <option key={p.id} value={p.id} disabled={disabledIds?.has(p.id)}>
          {p.name || p.displayName}
        </option>
      ))}
    </select>
  );
}

export default function CreaPartita({
  state, // { players } minimal per retrofit multi-club
  setState, // legacy setState (fallback se manca clubId)
  playersById,
  onShowFormula,
  derivedMatches, // matches già filtrate per club (derivate)
  rankingData, // dati ranking computati per usare rating corretti
  T,
  clubId: propClubId,
  onMatchCreated, // callback opzionale per refresh esterno
  onMatchDeleted,
}) {
  const { selectedClub, matches: contextMatches, loadPlayers, loadMatches } = useClub();
  const clubId = propClubId || selectedClub?.id;
  
  // 🔄 NUOVO: Hook per migrazione automatica rating storici
  const { runMigrationIfNeeded } = useRatingMigration();
  
  // Use derivedMatches if available, otherwise fallback to context
  const actualMatches = derivedMatches && derivedMatches.length > 0 
    ? derivedMatches 
    : (contextMatches || []);

  // Definizione di players PRIMA del suo utilizzo
  const players = state.players;

  // Auto-migration al mount del componente
  useEffect(() => {
    if (clubId && players?.length > 0) {
      runMigrationIfNeeded().catch(error => {
        console.warn('⚠️ Migration check failed:', error);
      });
    }
  }, [clubId, players?.length, runMigrationIfNeeded]);

  // DEBUG MIRATO: Cosa usa CreaPartita
  // console.log('🎾 CREAPARTITA DEBUG:', {
  //   derivedCount: derivedMatches?.length || 0,
  //   contextCount: contextMatches?.length || 0,
  //   actualCount: actualMatches.length,
  //   usingDerived: derivedMatches && derivedMatches.length > 0,
  //   firstActual: actualMatches[0]?.id,
  //   lastActual: actualMatches[actualMatches.length - 1]?.id
  // });
  const playersAlpha = useMemo(
    () => [...players].sort(byPlayerFirstAlpha),
    [players],
  );

  // Enhanced form management with our custom hook
  const {
    formData,
    validation,
    isSubmitting,
    toast,
    playersById: formPlayersById,
    updatePlayer,
    updateSet,
    updateDate,
    handleSubmit,
    resetForm,
    getDisabledPlayerIds,
    showToast,
    hideToast,
    canSubmit,
    progress,
    summary
  } = useMatchForm(playersAlpha, async (formData, result) => {
    // This is the actual submission logic
    await addMatchWithValidation(formData, result);
  });

  // Legacy state compatibility for existing code
  const a1 = formData.a1;
  const a2 = formData.a2;
  const b1 = formData.b1;
  const b2 = formData.b2;
  const sets = formData.sets;
  const when = formData.data || toLocalInputValue(new Date());

  // Usa i rating computati dai props invece del sistema live Firebase
  const selectedPlayerIds = [a1, a2, b1, b2].filter(Boolean);
  const playersMap = useMemo(() => {
    const map = new Map();
    if (rankingData?.players) {
      rankingData.players.forEach(p => map.set(p.id, p));
    }
    return map;
  }, [rankingData]);

  const getRating = (playerId) => {
    const player = playersMap.get(playerId);
    return player ? player.rating : DEFAULT_RATING;
  };

  const rr = computeFromSets(sets);
  const ready = validation.canSubmit;

  // 🔍 DEBUG: Validation state
  console.log('🎯 FORM VALIDATION STATE:', {
    canSubmit: validation.canSubmit,
    isValid: validation.isValid,
    isSubmitting,
    playersSelected: validation.summary?.playersSelected || 0,
    hasWinner: validation.summary?.hasWinner || false,
    setsCompleted: validation.summary?.setsCompleted || 0
  });
  
  // 🔍 DEBUG: Show specific errors if any
  if (!validation.isValid) {
    console.log('❌ VALIDATION ERRORS:', validation.errors);
  }

  // 🎯 NUOVO: Ranking coppie live da database
  const rA1 = a1 ? getRating(a1) : null;
  const rA2 = a2 ? getRating(a2) : null;
  const rB1 = b1 ? getRating(b1) : null;
  const rB2 = b2 ? getRating(b2) : null;
  
  // Debug dei rating live
  if (selectedPlayerIds.length > 0) {
    console.log('🎾 Live ratings:', {
      a1: a1 ? `${a1}: ${rA1}` : 'none',
      a2: a2 ? `${a2}: ${rA2}` : 'none',
      b1: b1 ? `${b1}: ${rB1}` : 'none',
      b2: b2 ? `${b2}: ${rB2}` : 'none'
    });
  }

  const sumA = rA1 != null && rA2 != null ? rA1 + rA2 : null;
  const sumB = rB1 != null && rB2 != null ? rB1 + rB2 : null;
  
  // Testi per le coppie con rating computati
  const pairAText = sumA != null
      ? `${Math.round(sumA)} (${Math.round(rA1)} + ${Math.round(rA2)})`
      : "—";
      
  const pairBText = sumB != null
      ? `${Math.round(sumB)} (${Math.round(rB1)} + ${Math.round(rB2)})`
      : "—";

  // Enhanced match submission with validation and historical ratings
  const addMatchWithValidation = async (formData, result) => {
    console.log('🚀 SAVING MATCH - Start addMatchWithValidation', { formData, result });
    
    const { a1, a2, b1, b2, sets, data } = formData;
    
    const normSets = (sets || []).map((s) => ({ a: +(s?.a || 0), b: +(s?.b || 0) }));
    const date = new Date(data || Date.now()).toISOString();
    
    // 🎯 TEMPORANEO: Debug mode - usa rating attuali per ora
    let deltaA = 0, deltaB = 0;
    let rA1 = null, rA2 = null, rB1 = null, rB2 = null;
    
    // MODALITÀ DEBUG: Usa rating attuali temporaneamente
    const useHistoricalRatings = false; // Cambia a true quando pronti
    
    if (useHistoricalRatings) {
      try {
        // Ottieni i rating storici alla data della partita
        const playerIds = [a1, a2, b1, b2].filter(Boolean);
        const historicalRatings = await getHistoricalRatings(clubId, playerIds, date);
        
        // Usa i rating storici per il calcolo RPA
        rA1 = a1 ? (historicalRatings[a1] ?? DEFAULT_RATING) : null;
        rA2 = a2 ? (historicalRatings[a2] ?? DEFAULT_RATING) : null; 
        rB1 = b1 ? (historicalRatings[b1] ?? DEFAULT_RATING) : null;
        rB2 = b2 ? (historicalRatings[b2] ?? DEFAULT_RATING) : null;
        
        console.log('🎾 HISTORICAL RATINGS USED:', {
          date,
          a1: { id: a1, historical: rA1, current: playersById[a1]?.rating },
          a2: { id: a2, historical: rA2, current: playersById[a2]?.rating },
          b1: { id: b1, historical: rB1, current: playersById[b1]?.rating },
          b2: { id: b2, historical: rB2, current: playersById[b2]?.rating }
        });
        
      } catch (error) {
        console.error('❌ Error getting historical ratings, fallback to current:', error);
        // Fallback ai rating attuali se c'è un errore
        rA1 = a1 ? (playersById[a1]?.rating ?? DEFAULT_RATING) : null;
        rA2 = a2 ? (playersById[a2]?.rating ?? DEFAULT_RATING) : null;
        rB1 = b1 ? (playersById[b1]?.rating ?? DEFAULT_RATING) : null;
        rB2 = b2 ? (playersById[b2]?.rating ?? DEFAULT_RATING) : null;
      }
    } else {
      // MODALITÀ DEBUG: Usa rating attuali
      console.log('🔧 DEBUG MODE: Using current ratings instead of historical');
      rA1 = a1 ? (playersById[a1]?.rating ?? DEFAULT_RATING) : null;
      rA2 = a2 ? (playersById[a2]?.rating ?? DEFAULT_RATING) : null;
      rB1 = b1 ? (playersById[b1]?.rating ?? DEFAULT_RATING) : null;
      rB2 = b2 ? (playersById[b2]?.rating ?? DEFAULT_RATING) : null;
    }
    
    const sumA = rA1 != null && rA2 != null ? rA1 + rA2 : null;
    const sumB = rB1 != null && rB2 != null ? rB1 + rB2 : null;
    
    if (rA1 != null && rA2 != null && rB1 != null && rB2 != null) {
      const gap = result.winner === "A" ? sumB - sumA : sumA - sumB;
      const factor = rpaFactor(gap);
      const GD = result.winner === "A" ? result.gamesA - result.gamesB : result.gamesB - result.gamesA;
      const base = (sumA + sumB) / 100;
      const P = Math.round((base + GD) * factor);
      
      if (result.winner === "A") {
        deltaA = P;
        deltaB = -P;
      } else {
        deltaA = -P;
        deltaB = P;
      }
    }
    
    const matchPayload = { 
      date, 
      teamA: [a1, a2], 
      teamB: [b1, b2], 
      sets: normSets,
      winner: result.winner,
      setsA: result.setsA,
      setsB: result.setsB,
      gamesA: result.gamesA,
      gamesB: result.gamesB,
      deltaA: deltaA,
      deltaB: deltaB
    };
    
    // Track match creation analytics
    analyticsModule.trackEvent('match', 'create_attempt', {
      clubId,
      winner: result.winner,
      setsPlayed: result.setsA + result.setsB,
      gamesPlayed: result.gamesA + result.gamesB
    });
    
    if (clubId) {
      // 💾 TEMPORANEO DISABILITATO: Salva i rating attuali prima di creare la partita
      // Questo preserva lo stato pre-match per future reference
      const savePreMatchRatings = false; // Abilita quando il sistema storico è pronto
      
      if (savePreMatchRatings) {
        try {
          const playerIds = [a1, a2, b1, b2].filter(Boolean);
          await savePreMatchRatings(clubId, playerIds, playersById, date, uid());
          console.log('💾 Pre-match ratings saved successfully');
        } catch (error) {
          console.warn('⚠️ Failed to save pre-match ratings, continuing with match creation:', error);
          // Non blocchiamo la creazione della partita se il salvataggio fallisce
        }
      }
      
      console.log('🚀 About to call createClubMatch', { clubId, matchPayload });
      const createdMatch = await createClubMatch(clubId, matchPayload);
      console.log('✅ Match created successfully:', createdMatch);
      
      // 🎾 NEW: Update player ratings in Firebase after match creation
      try {
        const playerDeltas = calculatePlayerDeltas(matchPayload);
        const result = await updatePlayerRatingsAfterMatch(clubId, playerDeltas, createdMatch.id);
        console.log('🎯 Player ratings updated successfully:', result.updates);
        
        // 🔄 Refresh both players and matches data in ClubContext
        try {
          await loadPlayers(true); // Force reload players with updated ratings
          console.log('🔄 Players data refreshed after rating update');
        } catch (refreshError) {
          console.warn('⚠️ Failed to refresh players data:', refreshError);
        }
        
        try {
          await loadMatches(true); // Force reload matches to show new match
          console.log('🔄 Matches data refreshed after match creation');
        } catch (refreshError) {
          console.warn('⚠️ Failed to refresh matches data:', refreshError);
        }
        
      } catch (error) {
        console.error('❌ Error updating player ratings:', error);
        // Don't throw - match is already created, rating update is secondary
      }
      
      // Track successful creation
      analyticsModule.trackEvent('match', 'create_success', {
        clubId,
        matchId: createdMatch.id,
        winner: result.winner
      });
      
      // Immediate callback for refresh
      if (onMatchCreated) {
        onMatchCreated(matchPayload);
      }
    } else if (setState) {
      // Fallback legacy local state
      setState((s) => ({
        ...s,
        matches: [...s.matches, { id: uid(), ...matchPayload }],
      }));
    } else {
      throw new Error('Né clubId né setState disponibili per creare la partita');
    }
  };

  const showPreviewFormula = () => {
    const nameA1 = playersById[a1]?.name || "—";
    const nameA2 = playersById[a2]?.name || "—";
    const nameB1 = playersById[b1]?.name || "—";
    const nameB2 = playersById[b2]?.name || "—";

    // Usa i rating computati invece di quelli da playersById
    const sA1 = a1 ? getRating(a1) : null;
    const sA2 = a2 ? getRating(a2) : null;
    const sB1 = b1 ? getRating(b1) : null;
    const sB2 = b2 ? getRating(b2) : null;

    const sumA = sA1 != null && sA2 != null ? sA1 + sA2 : null;
    const sumB = sB1 != null && sB2 != null ? sB1 + sB2 : null;

    const rrLocal = computeFromSets(sets || []);

    if (!rrLocal.winner || sumA == null || sumB == null) {
      onShowFormula(
        <FormulaIntro
          sumA={sumA}
          sumB={sumB}
          teamALabel={`${nameA1} + ${nameA2}`}
          teamBLabel={`${nameB1} + ${nameB2}`}
        />,
      );
      return;
    }

    const gap = rrLocal.winner === "A" ? sumB - sumA : sumA - sumB;
    const factor = rpaFactor(gap);
    const GD =
      rrLocal.winner === "A"
        ? rrLocal.gamesA - rrLocal.gamesB
        : rrLocal.gamesB - rrLocal.gamesA;
    const base = (sumA + sumB) / 100;
    const P = Math.round((base + GD) * factor);

    onShowFormula(
      <FormulaExplainer
        sumA={sumA}
        sumB={sumB}
        gap={gap}
        factor={factor}
        GD={GD}
        P={P}
        winner={rrLocal.winner}
        sets={sets}
        teamALabel={`${nameA1} + ${nameA2}`}
        teamBLabel={`${nameB1} + ${nameB2}`}
      />,
    );
  };

  // Legacy addMatch function for backward compatibility
  const addMatch = async () => {
    if (!ready) {
      showToast("Seleziona 4 giocatori e inserisci i set (best of 3). Il risultato non può finire 1-1.", 'error');
      return;
    }
    
    try {
      await handleSubmit();
    } catch (error) {
      console.error('Error in legacy addMatch:', error);
      showToast('Errore durante la creazione della partita.', 'error');
    }
  };

  const delMatch = async (id) => {
    if (!confirm("Cancellare la partita?")) return;
    try {
      if (clubId) {
        await deleteClubMatch(clubId, id);
        onMatchDeleted && onMatchDeleted(id);
        
        // 🔄 Refresh the matches list after deletion
        try {
          await loadMatches(true);
          console.log('🔄 Matches list refreshed after deletion');
        } catch (refreshError) {
          console.warn('⚠️ Failed to refresh matches after deletion:', refreshError);
        }
        
        analyticsModule.trackEvent('match', 'delete_success', {
          clubId,
          matchId: id
        });
      } else if (setState) {
        setState((s) => ({ ...s, matches: s.matches.filter((m) => m.id !== id) }));
      }
    } catch (e) {
      console.error('Errore cancellazione partita:', e);
      alert('Errore durante la cancellazione della partita.');
    }
  };

  return (
    <>
      {/* Toast Notifications */}
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={toast.duration}
        />
      )}

      <Section title="Crea Partita" T={T}>
        {/* Progress Bar */}
        <FormProgressBar 
          progress={progress} 
          message={validation.progressMessage}
          className="mb-6"
        />

        {/* Team selection - enhanced with validation */}
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
          <div className={`rounded-xl ${T.cardBg} ${T.border} p-4`}>
            <div className="font-medium flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
              <span className="flex items-center gap-2">
                🅰️ <span>Team A</span>
              </span>
              <span
                className={`text-xs ${T.subtext} bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full`}
              >
                Ranking: <b>{pairAText}</b>
              </span>
            </div>
            <div className="space-y-3">
              <EnhancedPlayerSelect
                T={T}
                players={playersAlpha}
                value={a1}
                onChange={(value) => updatePlayer('a1', value)}
                disabledIds={getDisabledPlayerIds('a1')}
                validation={validation}
                fieldName="a1"
                placeholder="Giocatore A1"
              />
              <EnhancedPlayerSelect
                T={T}
                players={playersAlpha}
                value={a2}
                onChange={(value) => updatePlayer('a2', value)}
                disabledIds={getDisabledPlayerIds('a2')}
                validation={validation}
                fieldName="a2"
                placeholder="Giocatore A2"
              />
            </div>
          </div>

          <div className={`rounded-xl ${T.cardBg} ${T.border} p-4`}>
            <div className="font-medium flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
              <span className="flex items-center gap-2">
                🅱️ <span>Team B</span>
              </span>
              <span
                className={`text-xs ${T.subtext} bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full`}
              >
                Ranking: <b>{pairBText}</b>
              </span>
            </div>
            <div className="space-y-3">
              <EnhancedPlayerSelect
                T={T}
                players={playersAlpha}
                value={b1}
                onChange={(value) => updatePlayer('b1', value)}
                disabledIds={getDisabledPlayerIds('b1')}
                validation={validation}
                fieldName="b1"
                placeholder="Giocatore B1"
              />
              <EnhancedPlayerSelect
                T={T}
                players={playersAlpha}
                value={b2}
                onChange={(value) => updatePlayer('b2', value)}
                disabledIds={getDisabledPlayerIds('b2')}
                validation={validation}
                fieldName="b2"
                placeholder="Giocatore B2"
              />
            </div>
          </div>
        </div>

        {/* Date and Result section - enhanced */}
        <div className="mt-6 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
          <div className={`rounded-xl ${T.cardBg} ${T.border} p-4`}>
            <div className="font-medium mb-3 flex items-center gap-2">
              📅 Data e ora
            </div>
            <input
              type="datetime-local"
              value={when}
              onChange={(e) => updateDate(e.target.value)}
              className={`${T.input} w-full`}
            />
          </div>

          <div className={`rounded-xl ${T.cardBg} ${T.border} p-4`}>
            <div className="font-medium mb-3 flex items-center gap-2">
              🏆 Risultato (best of 3)
            </div>

            {/* Enhanced set inputs with validation */}
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <EnhancedSetInput
                  key={i}
                  setIndex={i}
                  setData={sets[i]}
                  onChange={updateSet}
                  validation={validation}
                  T={T}
                />
              ))}
            </div>

            <div
              className={`mt-3 text-xs ${T.subtext} bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg`}
            >
              💡 Se dopo 2 set è 1–1, inserisci il 3° set per decidere.
            </div>
          </div>
        </div>

        {/* Enhanced Match Summary */}
        <MatchSummaryCard
          validation={validation}
          playersById={playersById}
          formData={formData}
          T={T}
          className="mt-6"
        />

        {/* Enhanced action buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <EnhancedSubmitButton
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={isSubmitting}
            validation={validation}
            T={T}
            className="flex-1 sm:flex-none"
          />
          <button
            type="button"
            onClick={showPreviewFormula}
            className={`${T.btnGhost} flex-1 sm:flex-none`}
          >
            🧮 Mostra formula punti
          </button>
          <button
            type="button"
            onClick={resetForm}
            className={`${T.btnSecondary} flex-1 sm:flex-none`}
          >
            🔄 Reset
          </button>
        </div>
      </Section>

      <Section title="Ultime partite" T={T}>
        {/* DEBUG MIRATO: Cosa renderizza */}
        {/* console.log('🎾 RENDER DEBUG:', {
          actualMatchesLength: actualMatches.length,
          isEmpty: (!actualMatches || actualMatches.length === 0),
          slicedLength: actualMatches.slice(-20).length,
          reversedLength: actualMatches.slice(-20).reverse().length
        }) */}
        <div className="space-y-3">
          {(!actualMatches || actualMatches.length === 0) ? (
            <div
              className={`text-center py-8 ${T.cardBg} ${T.border} rounded-xl`}
            >
              <div className="text-4xl mb-2">🎾</div>
              <div className={`text-sm ${T.subtext}`}>
                Nessuna partita ancora giocata
              </div>
              <div className={`text-xs ${T.subtext} mt-1`}>
                Crea la prima partita sopra per iniziare
              </div>
            </div>
          ) : (
            (actualMatches || [])
              .slice(0, 20) // Take first 20 matches (already sorted newest first)
              .map((m, index) => {
                // console.log(`🎾 MATCHROW DEBUG ${index}:`, {
                //   id: m.id,
                //   teamA: m.teamA,
                //   teamB: m.teamB,
                //   date: m.date,
                //   hasPlayersById: !!playersById,
                //   playersCount: Object.keys(playersById || {}).length
                // });
                return (
                  <MatchRow
                    key={m.id}
                    m={m}
                    playersById={playersById}
                    onShowFormula={onShowFormula}
                    onDelete={() => delMatch(m.id)}
                    T={T}
                  />
                );
              })
          )}
        </div>
      </Section>
    </>
  );
}
