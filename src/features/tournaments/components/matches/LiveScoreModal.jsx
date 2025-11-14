/**
 * Live Score Modal - For updating in-progress match scores
 * No validation required - provisional scores only
 */

import React, { useState } from 'react';
import { X, Save, Plus, Trash2, CheckCircle } from 'lucide-react';

function LiveScoreModal({ match, team1, team2, onClose, onSubmit, onSubmitFinal }) {
  // Initialize sets from existing liveScore or create empty set
  const initialSets = match?.liveScore?.sets || [{ team1: '', team2: '' }];
  const [sets, setSets] = useState(initialSets);

  const handleSubmit = (isFinal = false) => {
    // Calculate total scores from sets
    let team1Total = 0;
    let team2Total = 0;

    const validSets = sets
      .filter((set) => set.team1 !== '' || set.team2 !== '') // Keep sets with at least one value
      .map((set) => {
        const t1 = set.team1 === '' ? 0 : parseInt(set.team1) || 0;
        const t2 = set.team2 === '' ? 0 : parseInt(set.team2) || 0;

        // Count set winner
        if (t1 > t2) team1Total++;
        else if (t2 > t1) team2Total++;

        return { team1: t1, team2: t2 };
      });

    if (isFinal) {
      // Submit as final result
      const finalResultData = {
        score: { team1: team1Total, team2: team2Total },
        sets: validSets.length > 0 ? validSets : null,
      };
      onSubmitFinal(finalResultData);
    } else {
      // Submit as live score
      const liveScoreData = {
        team1: team1Total,
        team2: team2Total,
        sets: validSets.length > 0 ? validSets : null,
      };
      onSubmit(liveScoreData);
    }
  };

  const handleClear = () => {
    setSets([{ team1: '', team2: '' }]);
  };

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

  const team1Name = team1?.teamName || team1?.name || team1?.displayName || 'Team 1';
  const team2Name = team2?.teamName || team2?.name || team2?.displayName || 'Team 2';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Risultato Live</h2>
            <p className="text-sm text-gray-400 mt-1">Partita in corso - Punteggio provvisorio</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Info Box */}
          <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-3">
            <p className="text-xs text-orange-300">
              💡 Questo è un punteggio provvisorio per una partita in corso. Puoi aggiornarlo in
              qualsiasi momento senza vincoli.
            </p>
          </div>

          {/* Sets */}
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Cancella
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salva Live
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Conferma Risultato Finale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveScoreModal;
