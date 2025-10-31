// =============================================
// FILE: src/features/extra/ConflictResolutionPanel.jsx
// Conflict Auto-Resolution System
// =============================================
import React, { useState, useMemo } from 'react';
import { detectTimeSlotOverlaps } from '@utils/court-validation.js';

// ============================================
// CONFLICT RESOLUTION UTILITIES
// ============================================

/**
 * Genera suggerimenti per risolvere un overlap
 */
function generateResolutionSuggestions(overlap, allSlots) {
  const suggestions = [];
  const slot1 = overlap.slot1;
  const slot2 = overlap.slot2;

  // Parse time
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const slot1Start = parseTime(slot1.from);
  const slot1End = parseTime(slot1.to);
  const slot2Start = parseTime(slot2.from);
  const slot2End = parseTime(slot2.to);

  // Suggerimento 1: Merge - Unisci le due fasce
  const mergedStart = Math.min(slot1Start, slot2Start);
  const mergedEnd = Math.max(slot1End, slot2End);
  const avgPrice = Math.round((slot1.eurPerHour + slot2.eurPerHour) / 2);

  suggestions.push({
    id: 'merge',
    type: 'merge',
    title: '🔗 Unisci Fasce',
    description: `Crea una singola fascia ${formatTime(mergedStart)} - ${formatTime(mergedEnd)} (€${avgPrice}/h)`,
    action: {
      type: 'merge',
      deleteSlots: [slot1.id, slot2.id],
      createSlot: {
        label: `${slot1.label} + ${slot2.label}`,
        from: formatTime(mergedStart),
        to: formatTime(mergedEnd),
        days: Array.from(new Set([...(slot1.days || []), ...(slot2.days || [])])),
        eurPerHour: avgPrice,
        isPromo: slot1.isPromo || slot2.isPromo,
      },
    },
    priority: 'high',
  });

  // Suggerimento 2: Shift - Sposta la seconda fascia dopo la prima
  if (slot1End < slot2End) {
    const shiftedStart = slot1End;
    const shiftedEnd = slot2End;

    suggestions.push({
      id: 'shift',
      type: 'shift',
      title: '⏩ Sposta Fascia',
      description: `Sposta "${slot2.label}" a ${formatTime(shiftedStart)} - ${formatTime(shiftedEnd)}`,
      action: {
        type: 'shift',
        slotId: slot2.id,
        newFrom: formatTime(shiftedStart),
        newTo: formatTime(shiftedEnd),
      },
      priority: 'medium',
    });
  }

  // Suggerimento 3: Split - Dividi al punto di overlap
  const overlapStart = Math.max(slot1Start, slot2Start);
  const overlapEnd = Math.min(slot1End, slot2End);

  if (slot1Start < overlapStart && slot1End > overlapEnd) {
    suggestions.push({
      id: 'split1',
      type: 'split',
      title: '✂️ Dividi Prima Fascia',
      description: `Dividi "${slot1.label}" in due: ${formatTime(slot1Start)}-${formatTime(overlapStart)} e ${formatTime(overlapEnd)}-${formatTime(slot1End)}`,
      action: {
        type: 'split',
        slotId: slot1.id,
        splits: [
          {
            label: `${slot1.label} (1)`,
            from: formatTime(slot1Start),
            to: formatTime(overlapStart),
          },
          {
            label: `${slot1.label} (2)`,
            from: formatTime(overlapEnd),
            to: formatTime(slot1End),
          },
        ],
      },
      priority: 'low',
    });
  }

  // Suggerimento 4: Delete - Elimina una delle due fasce
  suggestions.push({
    id: 'delete1',
    type: 'delete',
    title: '🗑️ Elimina Prima Fascia',
    description: `Elimina "${slot1.label}" (${slot1.from}-${slot1.to})`,
    action: {
      type: 'delete',
      slotId: slot1.id,
    },
    priority: 'low',
  });

  suggestions.push({
    id: 'delete2',
    type: 'delete',
    title: '🗑️ Elimina Seconda Fascia',
    description: `Elimina "${slot2.label}" (${slot2.from}-${slot2.to})`,
    action: {
      type: 'delete',
      slotId: slot2.id,
    },
    priority: 'low',
  });

  return suggestions;
}

/**
 * Applica una risoluzione ai time slots
 */
function applyResolution(timeSlots, suggestion) {
  const { action } = suggestion;
  let updatedSlots = [...timeSlots];

  switch (action.type) {
    case 'merge': {
      // Rimuovi le fasce originali
      updatedSlots = updatedSlots.filter((slot) => !action.deleteSlots.includes(slot.id));
      // Aggiungi la nuova fascia merged
      updatedSlots.push({
        id: `merged_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...action.createSlot,
      });
      break;
    }

    case 'shift': {
      // Sposta la fascia
      updatedSlots = updatedSlots.map((slot) => {
        if (slot.id === action.slotId) {
          return {
            ...slot,
            from: action.newFrom,
            to: action.newTo,
          };
        }
        return slot;
      });
      break;
    }

    case 'split': {
      // Trova l'indice della fascia da splittare
      const slotIndex = updatedSlots.findIndex((s) => s.id === action.slotId);
      if (slotIndex !== -1) {
        const originalSlot = updatedSlots[slotIndex];
        // Rimuovi la fascia originale
        updatedSlots.splice(slotIndex, 1);
        // Aggiungi le fasce splittate
        action.splits.forEach((split) => {
          updatedSlots.push({
            id: `split_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            label: split.label,
            from: split.from,
            to: split.to,
            days: originalSlot.days,
            eurPerHour: originalSlot.eurPerHour,
            isPromo: originalSlot.isPromo,
          });
        });
      }
      break;
    }

    case 'delete': {
      // Elimina la fascia
      updatedSlots = updatedSlots.filter((slot) => slot.id !== action.slotId);
      break;
    }

    default:
      console.warn('Unknown resolution action type:', action.type);
  }

  return updatedSlots;
}

// ============================================
// COMPONENTE: Conflict Resolution Panel
// ============================================
export function ConflictResolutionPanel({ isOpen, onClose, court, courtIndex, onResolve, T }) {
  const [selectedSuggestions, setSelectedSuggestions] = useState({});
  const [undoStack, setUndoStack] = useState([]);

  // Rileva i conflitti
  const conflicts = useMemo(() => {
    if (!court || !court.timeSlots) return [];
    return detectTimeSlotOverlaps(court.timeSlots);
  }, [court]);

  // Genera suggerimenti per ogni conflitto
  const conflictSuggestions = useMemo(() => {
    return conflicts.map((conflict, index) => ({
      conflict,
      conflictIndex: index,
      suggestions: generateResolutionSuggestions(conflict, court.timeSlots || []),
    }));
  }, [conflicts, court.timeSlots]);

  if (!isOpen) return null;

  const handleSelectSuggestion = (conflictIndex, suggestionId) => {
    setSelectedSuggestions((prev) => ({
      ...prev,
      [conflictIndex]: suggestionId,
    }));
  };

  const handleApplySuggestion = (conflictIndex, suggestion) => {
    // Salva stato corrente per undo
    setUndoStack((prev) => [...prev, { courtIndex, timeSlots: court.timeSlots }]);

    // Applica la risoluzione
    const updatedSlots = applyResolution(court.timeSlots || [], suggestion);
    onResolve(courtIndex, { timeSlots: updatedSlots });
  };

  const handleApplyAll = () => {
    // Applica tutte le risoluzioni selezionate
    let updatedSlots = court.timeSlots || [];

    // Salva stato per undo
    setUndoStack((prev) => [...prev, { courtIndex, timeSlots: court.timeSlots }]);

    // Applica in ordine inverso per gestire correttamente gli indici
    const sortedConflicts = [...conflictSuggestions].reverse();

    sortedConflicts.forEach(({ conflictIndex, suggestions }) => {
      const selectedId = selectedSuggestions[conflictIndex];
      if (selectedId) {
        const suggestion = suggestions.find((s) => s.id === selectedId);
        if (suggestion) {
          updatedSlots = applyResolution(updatedSlots, suggestion);
        }
      }
    });

    onResolve(courtIndex, { timeSlots: updatedSlots });
    setSelectedSuggestions({});
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;

    const lastState = undoStack[undoStack.length - 1];
    onResolve(lastState.courtIndex, { timeSlots: lastState.timeSlots });
    setUndoStack((prev) => prev.slice(0, -1));
  };

  const handleAutoResolve = () => {
    // Auto-risoluzione: usa la prima suggestion (merge) per ogni conflitto
    let updatedSlots = court.timeSlots || [];

    // Salva stato per undo
    setUndoStack((prev) => [...prev, { courtIndex, timeSlots: court.timeSlots }]);

    // Applica in ordine inverso
    const sortedConflicts = [...conflictSuggestions].reverse();

    sortedConflicts.forEach(({ suggestions }) => {
      if (suggestions.length > 0) {
        // Usa sempre il primo suggerimento (merge, che è priority high)
        updatedSlots = applyResolution(updatedSlots, suggestions[0]);
      }
    });

    onResolve(courtIndex, { timeSlots: updatedSlots });
    setSelectedSuggestions({});
  };

  const priorityStyles = {
    high: 'border-red-300 border-red-700 bg-red-50 bg-red-900/20',
    medium: 'border-yellow-300 border-yellow-700 bg-yellow-50 bg-yellow-900/20',
    low: 'border-blue-300 border-blue-700 bg-blue-50 bg-blue-900/20',
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 border-gray-700 bg-gradient-to-r from-red-50 to-orange-50 from-red-900/20 to-orange-900/20">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 text-white flex items-center gap-2">
                ⚠️ Risoluzione Conflitti
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {conflicts.length}{' '}
                {conflicts.length === 1 ? 'conflitto rilevato' : 'conflitti rilevati'} in "
                {court?.name}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:text-gray-300 text-3xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {conflicts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-gray-900 text-white mb-2">
                Nessun Conflitto Rilevato
              </h3>
              <p className="text-gray-400">Tutte le fasce orarie sono configurate correttamente.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {conflictSuggestions.map(({ conflict, conflictIndex, suggestions }) => (
                <div
                  key={conflictIndex}
                  className="border-2 border-red-200 border-red-800 rounded-xl p-4 bg-red-50/50 bg-red-900/10"
                >
                  {/* Conflict Info */}
                  <div className="mb-4 pb-4 border-b border-red-200 border-red-800">
                    <h3 className="font-bold text-lg text-red-900 text-red-300 mb-2">
                      🔴 Conflitto #{conflictIndex + 1}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="bg-white bg-gray-800 p-3 rounded-lg border border-gray-200 border-gray-700">
                        <div className="font-semibold text-gray-900 text-white">
                          {conflict.slot1.label}
                        </div>
                        <div className="text-gray-400">
                          ⏰ {conflict.slot1.from} - {conflict.slot1.to}
                        </div>
                        <div className="text-gray-400">💰 €{conflict.slot1.eurPerHour}/h</div>
                      </div>
                      <div className="bg-white bg-gray-800 p-3 rounded-lg border border-gray-200 border-gray-700">
                        <div className="font-semibold text-gray-900 text-white">
                          {conflict.slot2.label}
                        </div>
                        <div className="text-gray-400">
                          ⏰ {conflict.slot2.from} - {conflict.slot2.to}
                        </div>
                        <div className="text-gray-400">💰 €{conflict.slot2.eurPerHour}/h</div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-red-700 text-red-400 font-medium">
                      ⚠️ {conflict.message}
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h4 className="font-semibold text-gray-900 text-white mb-3">
                      💡 Suggerimenti di Risoluzione
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSelectSuggestion(conflictIndex, suggestion.id)}
                          className={`text-left p-3 rounded-lg border-2 transition-all ${
                            selectedSuggestions[conflictIndex] === suggestion.id
                              ? 'ring-2 ring-blue-500 border-blue-500'
                              : priorityStyles[suggestion.priority]
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-white mb-1">
                                {suggestion.title}
                              </div>
                              <div className="text-sm text-gray-400">{suggestion.description}</div>
                            </div>
                            <div className="flex gap-2 ml-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplySuggestion(conflictIndex, suggestion);
                                }}
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
                              >
                                ✓ Applica
                              </button>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {conflicts.length > 0 && (
          <div className="p-4 border-t border-gray-200 border-gray-700 bg-gray-50 bg-gray-900">
            <div className="flex justify-between items-center gap-3">
              <div className="flex gap-2">
                {undoStack.length > 0 && (
                  <button
                    onClick={handleUndo}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    ↶ Annulla ({undoStack.length})
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Chiudi
                </button>
                <button
                  onClick={handleAutoResolve}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  title="Risolvi automaticamente tutti i conflitti con merge"
                >
                  ⚡ Auto-Risolvi Tutto
                </button>
                <button
                  onClick={handleApplyAll}
                  disabled={Object.keys(selectedSuggestions).length === 0}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    Object.keys(selectedSuggestions).length === 0
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  ✓ Applica Selezionati ({Object.keys(selectedSuggestions).length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConflictResolutionPanel;
