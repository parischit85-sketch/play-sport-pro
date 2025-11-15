/**
 * Public Live Scoring Modal
 * Allows updating match status and scores from public live scoring view
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, CheckCircle, Clock, Calendar, Plus, Trash2 } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '@services/firebase.js';
import { doc, onSnapshot } from 'firebase/firestore';

function PublicLiveScoringModal({
  match,
  team1,
  team2,
  clubId,
  tournamentId,
  liveScoringToken,
  onClose,
}) {
  const [status, setStatus] = useState(match?.status || 'scheduled');
  const [sets, setSets] = useState(
    match?.liveScore?.sets || match?.score?.sets || [{ team1: '', team2: '' }]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [waitingForUpdate, setWaitingForUpdate] = useState(false);

  const team1Name = team1?.teamName || team1?.name || team1?.displayName || 'Team 1';
  const team2Name = team2?.teamName || team2?.name || team2?.displayName || 'Team 2';

  // Lock body scroll when modal is open
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

  // Real-time listener to detect when match is updated in Firestore
  useEffect(() => {
    if (!waitingForUpdate || !clubId || !tournamentId || !match?.id) return;

    console.log('🔄 Waiting for match update in Firestore...');
    const matchRef = doc(db, 'clubs', clubId, 'tournaments', tournamentId, 'matches', match.id);

    const unsubscribe = onSnapshot(matchRef, (snapshot) => {
      if (!snapshot.exists()) return;

      console.log('✅ Match updated detected, closing modal');

      // Close modal immediately when update is detected
      setWaitingForUpdate(false);
      onClose();
    });

    // Fallback: close after 3 seconds even if no update detected
    const fallbackTimer = setTimeout(() => {
      console.log('⏱️ Fallback timeout reached, closing modal');
      setWaitingForUpdate(false);
      onClose();
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, [waitingForUpdate, clubId, tournamentId, match?.id, onClose]);

  const handleAddSet = () => {
    setSets([...sets, { team1: '', team2: '' }]);
  };

  const handleRemoveSet = (index) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
    }
  };

  const handleSetChange = (index, team, value) => {
    const newSets = [...sets];
    newSets[index][team] = value;
    setSets(newSets);
  };

  const handleSaveLive = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Calculate total scores from sets (SAME LOGIC AS LiveScoreModal)
      let team1Total = 0;
      let team2Total = 0;

      const validSets = sets
        .filter((set) => set.team1 !== '' || set.team2 !== '')
        .map((set) => {
          const t1 = set.team1 === '' ? 0 : parseInt(set.team1) || 0;
          const t2 = set.team2 === '' ? 0 : parseInt(set.team2) || 0;

          if (t1 > t2) team1Total++;
          else if (t2 > t1) team2Total++;

          return { team1: t1, team2: t2 };
        });

      const liveScoreData = {
        team1: team1Total,
        team2: team2Total,
        sets: validSets.length > 0 ? validSets : null,
      };

      // Call Cloud Function instead of direct updateDoc
      const updateLiveScore = httpsCallable(functions, 'updateLiveScorePublic');
      await updateLiveScore({
        clubId,
        tournamentId,
        matchId: match.id,
        status,
        liveScore: liveScoreData,
        liveScoringToken,
      });

      setSuccess(true);
      setWaitingForUpdate(true);
    } catch (err) {
      console.error('Error saving live score:', err);
      setError(err.message || 'Errore durante il salvataggio del risultato live');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmFinal = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Calculate total scores from sets (SAME LOGIC AS LiveScoreModal)
      let team1Total = 0;
      let team2Total = 0;

      const validSets = sets
        .filter((set) => set.team1 !== '' || set.team2 !== '')
        .map((set) => {
          const t1 = set.team1 === '' ? 0 : parseInt(set.team1) || 0;
          const t2 = set.team2 === '' ? 0 : parseInt(set.team2) || 0;

          if (t1 > t2) team1Total++;
          else if (t2 > t1) team2Total++;

          return { team1: t1, team2: t2 };
        });

      if (validSets.length === 0) {
        setError('Inserisci almeno un set valido');
        setSubmitting(false);
        return;
      }

      if (team1Total === team2Total) {
        setError('Il risultato finale non può essere in parità');
        setSubmitting(false);
        return;
      }

      // Call Cloud Function to record final result
      const recordFinalResult = httpsCallable(functions, 'recordFinalResultPublic');
      await recordFinalResult({
        clubId,
        tournamentId,
        matchId: match.id,
        score: { team1: team1Total, team2: team2Total },
        sets: validSets,
        liveScoringToken,
      });

      setSuccess(true);
      setWaitingForUpdate(true);
    } catch (err) {
      console.error('Error confirming final score:', err);
      setError(err.message || 'Errore durante la conferma del risultato finale');
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        role="button"
        tabIndex={0}
        aria-label="Chiudi modale"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onClose?.();
        }}
      />

      {/* Modal container */}
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        {/* Modal content */}
        <div className="relative bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 my-4 sm:my-8">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-white">Gestisci Partita</h2>
              <p className="text-sm text-gray-400 mt-1">
                {team1Name} vs {team2Name}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mx-6 mt-4 bg-green-900/20 border border-green-800 rounded-lg p-3 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-300 text-sm font-medium">Salvataggio completato!</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 bg-red-900/20 border border-red-800 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Status Selection */}
            <div>
              <span className="block text-sm font-medium text-gray-300 mb-2">Stato Partita</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('scheduled')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    status === 'scheduled'
                      ? 'bg-blue-600 text-white border-2 border-blue-400'
                      : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Programmata
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('in_progress')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    status === 'in_progress'
                      ? 'bg-orange-600 text-white border-2 border-orange-400'
                      : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  In Corso
                </button>
              </div>
            </div>

            {/* Sets Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="block text-sm font-medium text-gray-300">Set</span>
                <button
                  type="button"
                  onClick={handleAddSet}
                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Aggiungi Set
                </button>
              </div>

              {sets.map((set, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    {/* Team 1 Score */}
                    <div className="flex-1">
                      {index === 0 && (
                        <label className="block text-xs text-gray-400 mb-1">{team1Name}</label>
                      )}
                      <input
                        type="number"
                        value={set.team1}
                        onChange={(e) => handleSetChange(index, 'team1', e.target.value)}
                        onFocus={(e) => e.target.select()}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        min="0"
                      />
                    </div>

                    <span className="text-gray-500 text-sm">-</span>

                    {/* Team 2 Score */}
                    <div className="flex-1">
                      {index === 0 && (
                        <label className="block text-xs text-gray-400 mb-1">{team2Name}</label>
                      )}
                      <input
                        type="number"
                        value={set.team2}
                        onChange={(e) => handleSetChange(index, 'team2', e.target.value)}
                        onFocus={(e) => e.target.select()}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Remove Set Button */}
                  {sets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSet(index)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSaveLive}
                disabled={submitting}
                className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {submitting ? 'Salvataggio...' : 'Salva Live Score'}
              </button>
              <button
                type="button"
                onClick={handleConfirmFinal}
                disabled={submitting}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-5 h-5" />
                {submitting ? 'Conferma...' : 'Conferma Risultato Finale'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default PublicLiveScoringModal;
