// =============================================
// FILE: src/features/extra/AdvancedCourtsManager.jsx
// =============================================
import React, { useState } from 'react';
import { euro2 } from '@lib/format.js';

// Componente per i toggle dei giorni
function DayToggles({ value = [], onChange, T }) {
  const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  const toggle = (idx) => {
    const has = value.includes(idx);
    onChange(has ? value.filter((d) => d !== idx) : [...value, idx].sort((a, b) => a - b));
  };
  return (
    <div className="flex flex-wrap gap-1">
      {days.map((d, i) => (
        <button
          type="button"
          key={i}
          onClick={() => toggle(i)}
          className={`px-2 h-6 rounded-md text-xs ring-1 transition-all ${
            value.includes(i)
              ? 'bg-emerald-500 text-black dark:text-white ring-emerald-500'
              : `${T.ghostRing} ${T.cardBg}`
          }`}
        >
          {d}
        </button>
      ))}
    </div>
  );
}

// Componente per gestire una singola fascia oraria
function TimeSlotEditor({ slot, onUpdate, onRemove, T, maxPlayers = 4 }) {
  const pad2 = (n) => String(n).padStart(2, '0');
  const toTime = (s = '09:00') => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(s).trim());
    if (!m) return '09:00';
    const hh = Math.min(23, Math.max(0, Number(m[1] || 0)));
    const mm = Math.min(59, Math.max(0, Number(m[2] || 0)));
    return `${pad2(hh)}:${pad2(mm)}`;
  };

  const perPlayer90 = (eurPerHour) => {
    const total = (Number(eurPerHour) || 0) * 1.5; // 90 minuti
    const players = Math.max(1, Number(maxPlayers) || 4); // Minimo 1 giocatore
    return euro2(total / players);
  };

  return (
    <div className="relative rounded-lg p-3 bg-white dark:bg-gray-800 ring-1 ring-gray-300 dark:ring-gray-600">
      {/* Pulsante rimuovi */}
      <button
        type="button"
        className="absolute top-2 right-2 text-rose-500 text-xs hover:underline z-10"
        onClick={onRemove}
        title="Rimuovi fascia"
      >
        ✕
      </button>

      <div className="grid lg:grid-cols-3 gap-3">
        {/* Info base della fascia */}
        <div className="lg:col-span-2 space-y-3">
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="flex flex-col">
              <label className={`text-xs ${T.subtext} mb-1`}>Nome fascia</label>
              <input
                value={slot.label || ''}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className={T.input}
                placeholder="Es. Mattutina, Serale, Peak"
              />
            </div>
            <div className="flex flex-col">
              <label className={`text-xs ${T.subtext} mb-1`}>€/ora</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={slot.eurPerHour ?? 0}
                onChange={(e) => onUpdate({ eurPerHour: Number(e.target.value) || 0 })}
                className={T.input}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <label className={`text-xs ${T.subtext} mb-1`}>Ora inizio</label>
              <input
                type="time"
                value={toTime(slot.from)}
                onChange={(e) => onUpdate({ from: toTime(e.target.value) })}
                className={T.input}
              />
            </div>
            <div className="flex flex-col">
              <label className={`text-xs ${T.subtext} mb-1`}>Ora fine</label>
              <input
                type="time"
                value={toTime(slot.to)}
                onChange={(e) => onUpdate({ to: toTime(e.target.value) })}
                className={T.input}
              />
            </div>
          </div>

          <div>
            <label className={`text-xs ${T.subtext} mb-2 block`}>Giorni attivi</label>
            <DayToggles
              value={Array.isArray(slot.days) ? slot.days : []}
              onChange={(days) => onUpdate({ days })}
              T={T}
            />
          </div>

          {/* Badge Promo per la fascia */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`promo-${slot.id || 'new'}`}
              checked={!!slot.isPromo}
              onChange={(e) => onUpdate({ isPromo: e.target.checked })}
              className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
            />
            <label
              htmlFor={`promo-${slot.id || 'new'}`}
              className="text-sm flex items-center gap-1"
            >
              🏷️ Fascia Promo
              {slot.isPromo && (
                <span className="ml-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded">
                  PROMO
                </span>
              )}
            </label>
          </div>
        </div>

        {/* Preview prezzo */}
        <div className="flex lg:justify-end">
          <div
            className={`flex-shrink-0 p-3 rounded-lg ring-1 bg-emerald-100 dark:bg-emerald-900 ${T.border} text-center`}
          >
            <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">
              90min x {maxPlayers} {maxPlayers === 1 ? 'Giocatore' : 'Giocatori'}
            </div>
            <div className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
              {perPlayer90(slot.eurPerHour)}€
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">per giocatore</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principale per una singola card campo espandibile
const ExpandableCourtCard = ({
  court,
  courtIndex,
  position,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  T,
  courtTypes = ['Indoor', 'Outdoor', 'Covered'],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const addTimeSlot = () => {
    const newSlot = {
      id: Date.now().toString(),
      label: 'Nuova fascia',
      eurPerHour: 25,
      from: '08:00',
      to: '12:00',
      days: [1, 2, 3, 4, 5], // Lun-Ven
    };

    onUpdate({
      timeSlots: [...(court.timeSlots || []), newSlot],
    });
  };

  const updateTimeSlot = (slotIndex, updates) => {
    const updatedSlots = (court.timeSlots || []).map((slot, index) =>
      index === slotIndex ? { ...slot, ...updates } : slot
    );
    onUpdate({ timeSlots: updatedSlots });
  };

  const removeTimeSlot = (slotIndex) => {
    const updatedSlots = (court.timeSlots || []).filter((_, index) => index !== slotIndex);
    onUpdate({ timeSlots: updatedSlots });
  };

  const toggleHeating = () => {
    onUpdate({ hasHeating: !court.hasHeating });
  };

  return (
    <div className={`rounded-xl ${T.border} ${T.cardBg} overflow-hidden transition-all`}>
      {/* Header della card - sempre visibile */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎾</span>
            <div>
              <div className="font-semibold text-lg flex items-center gap-2">
                {court.name}
                <span className={`text-xs px-2 py-1 rounded ${T.cardBg} ${T.border}`}>
                  Posizione {position}
                </span>
              </div>
              <div className={`text-sm ${T.subtext}`}>
                {(court.timeSlots || []).length} fasce orarie configurate
                {court.hasHeating && (
                  <span className="ml-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300 px-2 py-1 rounded">
                    🔥 Riscaldamento
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Pulsanti di ordinamento */}
            <div className="flex flex-col gap-1 mr-2">
              <button
                type="button"
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  isFirst
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isFirst) onMoveUp();
                }}
                disabled={isFirst}
                title="Sposta su"
              >
                ⬆️
              </button>
              <button
                type="button"
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  isLast
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isLast) onMoveDown();
                }}
                disabled={isLast}
                title="Sposta giù"
              >
                ⬇️
              </button>
            </div>

            <button
              type="button"
              className={`text-sm px-3 py-1 rounded transition-all ${
                isExpanded
                  ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? '📝 Chiudi' : '⚙️ Configura'}
            </button>
            <button
              type="button"
              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900 px-2 py-1 rounded text-sm transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {/* Contenuto espandibile */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
          {/* Configurazioni base del campo */}
          <div className="mb-6">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <span>⚙️</span>
              Configurazioni Campo
            </h4>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={`text-xs ${T.subtext} mb-1 block`}>Nome Campo</label>
                <input
                  value={court.name || ''}
                  onChange={(e) => onUpdate({ name: e.target.value })}
                  className={T.input}
                  placeholder="Es. Campo 1 - Centrale"
                />
              </div>

              <div>
                <label className={`text-xs ${T.subtext} mb-1 block`}>Tipologia Campo</label>
                <select
                  value={court.courtType || 'Indoor'}
                  onChange={(e) => {
                    onUpdate({ courtType: e.target.value });
                  }}
                  className={T.input}
                >
                  {courtTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-xs ${T.subtext} mb-1 block`}>Max Giocatori</label>
                <select
                  value={court.maxPlayers || 4}
                  onChange={(e) => {
                    onUpdate({ maxPlayers: Number(e.target.value) });
                  }}
                  className={T.input}
                  title="Numero massimo di giocatori per questo campo"
                >
                  {Array.from({ length: 22 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'giocatore' : 'giocatori'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Gestione fasce orarie */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <span>🕐</span>
                Fasce Orarie e Prezzi
              </h4>
              <button type="button" className={`${T.btnGhost} text-sm`} onClick={addTimeSlot}>
                + Aggiungi Fascia
              </button>
            </div>

            {/* Lista fasce orarie */}
            <div className="space-y-3">
              {(court.timeSlots || []).length === 0 ? (
                <div
                  className={`text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg ${T.subtext}`}
                >
                  <div className="text-2xl mb-2">🕐</div>
                  <div className="text-sm">Nessuna fascia oraria configurata</div>
                  <div className="text-xs mt-1">
                    Aggiungi almeno una fascia per attivare il campo
                  </div>
                </div>
              ) : (
                (court.timeSlots || []).map((slot, index) => (
                  <TimeSlotEditor
                    key={slot.id || index}
                    slot={slot}
                    onUpdate={(updates) => updateTimeSlot(index, updates)}
                    onRemove={() => removeTimeSlot(index)}
                    T={T}
                    maxPlayers={court.maxPlayers || 4}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente principale per la gestione avanzata dei campi
export default function AdvancedCourtsManager({
  courts = [],
  onChange,
  T,
  courtTypes = ['Indoor', 'Outdoor', 'Covered'],
}) {
  const [newCourtName, setNewCourtName] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // "all" o il tipo specifico

  // Inizializza gli ordini se necessario
  const courtsWithOrder = courts.map((court, index) => ({
    ...court,
    order: court.order || index + 1,
  }));

  // Ordina i campi per posizione, gestendo eventuali buchi negli ordini
  const sortedCourts = [...courtsWithOrder].sort((a, b) => {
    const orderA = a.order || 999;
    const orderB = b.order || 999;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // Se gli ordini sono uguali, ordina per nome come fallback
    return (a.name || '').localeCompare(b.name || '');
  });

  const handleAddCourt = async () => {
    if (!newCourtName.trim()) {
      return;
    }

    // Trova il prossimo ordine disponibile
    const maxOrder =
      courtsWithOrder.length > 0 ? Math.max(...courtsWithOrder.map((c) => c.order || 0)) : 0;
    const nextOrder = maxOrder + 1;

    const newCourt = {
      id: Date.now().toString(),
      name: newCourtName.trim(),
      hasHeating: false,
      timeSlots: [],
      order: nextOrder,
      courtType: 'Indoor', // Default court type
      maxPlayers: 4, // Default 4 giocatori
    };

    try {
      // Notifica il parent della modifica - il parent si occuperà del salvataggio Firebase
      onChange([...courts, newCourt]);
      setNewCourtName('');
    } catch (error) {
      console.error("Errore durante l'aggiunta del campo:", error);
      alert(`Errore durante l'aggiunta del campo: ${error.message}`);
    }
  };

  const handleUpdateCourt = async (courtIndex, updates) => {
    const court = courts[courtIndex];
    if (!court) {
      console.error('Court not found at index:', courtIndex);
      return;
    }

    try {
      // Notifica il parent della modifica - il parent si occuperà del salvataggio Firebase
      const updatedCourts = courts.map((c, index) =>
        index === courtIndex ? { ...c, ...updates } : c
      );
      onChange(updatedCourts);
    } catch (error) {
      console.error("Errore durante l'aggiornamento del campo:", error);
      alert(`Errore durante l'aggiornamento del campo: ${error.message}`);
    }
  };

  const moveCourt = (courtId, direction) => {
    // Trova la posizione del campo nell'array ordinato
    const sortedIndex = sortedCourts.findIndex((c) => c.id === courtId);
    if (sortedIndex === -1) return;

    // Calcola l'indice del campo adiacente nell'array ordinato
    const targetSortedIndex = direction === 'up' ? sortedIndex - 1 : sortedIndex + 1;

    // Verifica che l'indice target sia valido
    if (targetSortedIndex < 0 || targetSortedIndex >= sortedCourts.length) return;

    // Ottieni i due campi da scambiare
    const fromCourt = sortedCourts[sortedIndex];
    const toCourt = sortedCourts[targetSortedIndex];

    if (!fromCourt || !toCourt) return;

    // Scambia gli ordini tra i due campi
    const updatedCourts = courts.map((court) => {
      if (court.id === fromCourt.id) {
        return { ...court, order: toCourt.order || targetSortedIndex + 1 };
      } else if (court.id === toCourt.id) {
        return { ...court, order: fromCourt.order || sortedIndex + 1 };
      }
      return court;
    });

    onChange(updatedCourts);
  };

  const moveCourtUp = (courtId) => {
    moveCourt(courtId, 'up');
  };

  const moveCourtDown = (courtId) => {
    moveCourt(courtId, 'down');
  };

  const handleRemoveCourt = async (courtIndex) => {
    if (
      !confirm(
        'Rimuovere il campo? Tutte le configurazioni e prenotazioni collegate saranno perse.'
      )
    ) {
      return;
    }

    const courtToRemove = courts[courtIndex];

    try {
      // Rimuovi semplicemente il campo dall'array - gli ordini degli altri campi rimangono invariati
      const updatedCourts = courts.filter((_, index) => index !== courtIndex);

      onChange(updatedCourts);
    } catch (error) {
      console.error('Errore durante la rimozione del campo:', error);
      alert(`Errore durante la rimozione del campo ${courtToRemove.name}: ${error.message}`);
    }
  };

  // Filtra i campi in base al filtro attivo
  const filteredCourts =
    activeFilter === 'all'
      ? sortedCourts
      : sortedCourts.filter((court) => court.courtType === activeFilter);

  // Conta i campi per ogni tipo
  const courtTypeCounts = courtTypes.reduce((acc, type) => {
    acc[type] = sortedCourts.filter((court) => court.courtType === type).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header e form aggiunta nuovo campo */}
      <div className={`rounded-xl ${T.border} ${T.cardBg} p-4`}>
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          🏟️ Gestione Campi Avanzata
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              value={newCourtName}
              onChange={(e) => setNewCourtName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCourt()}
              className={`${T.input} w-full`}
              placeholder="Es. Campo 4 - Centrale (Coperto)"
            />
          </div>
          <button
            type="button"
            className={`${T.btnPrimary} w-full sm:w-auto px-6`}
            onClick={handleAddCourt}
            disabled={!newCourtName.trim()}
          >
            ➕ Aggiungi Campo
          </button>
        </div>

        <div className={`text-xs ${T.subtext} mt-2`}>
          I campi saranno espandibili per configurare fasce orarie, prezzi e opzioni specifiche. Usa
          i pulsanti ⬆️ ⬇️ per riordinare i campi e scegliere quale appare prima nelle colonne.
        </div>
      </div>

      {/* Filtri per tipo di campo */}
      {sortedCourts.length > 0 && (
        <div className={`rounded-xl ${T.border} ${T.cardBg} p-4`}>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <span>🏷️</span>
            Filtra per Tipologia
          </h4>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === 'all'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Tutti ({sortedCourts.length})
            </button>

            {courtTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveFilter(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === type
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {type} ({courtTypeCounts[type] || 0})
              </button>
            ))}
          </div>

          {activeFilter !== 'all' && (
            <div className={`text-xs ${T.subtext} mt-2`}>
              Mostrando {filteredCourts.length} campo/i di tipo "{activeFilter}"
            </div>
          )}
        </div>
      )}

      {/* Lista campi espandibili */}
      <div className="space-y-4">
        {filteredCourts.length === 0 ? (
          <div
            className={`text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl ${T.cardBg}`}
          >
            <div className="text-4xl mb-4">{activeFilter === 'all' ? '🏟️' : '🏷️'}</div>
            <h4 className="font-medium text-lg mb-2">
              {activeFilter === 'all'
                ? 'Nessun campo configurato'
                : `Nessun campo di tipo "${activeFilter}"`}
            </h4>
            <p className={`text-sm ${T.subtext} mb-4`}>
              {activeFilter === 'all'
                ? 'Aggiungi il primo campo per iniziare a configurare fasce orarie e prezzi personalizzati'
                : `Non ci sono campi di tipo "${activeFilter}". Prova a cambiare filtro o aggiungi un nuovo campo.`}
            </p>
            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className={`${T.btnSecondary} px-4 py-2`}
              >
                Mostra Tutti i Campi
              </button>
            )}
          </div>
        ) : (
          filteredCourts.map((court, filteredIndex) => {
            // Trova l'indice nell'array originale courts per le operazioni di modifica
            const originalIndex = courts.findIndex((c) => c.id === court.id);
            // Trova l'indice nel sortedCourts (array ordinato completo) per la posizione
            const sortedIndex = sortedCourts.findIndex((c) => c.id === court.id);

            return (
              <ExpandableCourtCard
                key={court.id || filteredIndex}
                court={court}
                courtIndex={sortedIndex}
                position={court.order || sortedIndex + 1}
                onUpdate={(updates) => handleUpdateCourt(originalIndex, updates)}
                onRemove={() => handleRemoveCourt(originalIndex)}
                onMoveUp={() => moveCourtUp(court.id)}
                onMoveDown={() => moveCourtDown(court.id)}
                isFirst={sortedIndex === 0}
                isLast={sortedIndex === sortedCourts.length - 1}
                T={T}
                courtTypes={courtTypes}
              />
            );
          })
        )}
      </div>

      {/* Statistiche riassuntive */}
      {sortedCourts.length > 0 && (
        <div className={`rounded-xl ${T.border} ${T.cardBg} p-4`}>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            📊 Riepilogo Configurazioni
            {activeFilter !== 'all' && (
              <span className="text-sm text-blue-600 dark:text-blue-400">
                (Filtro: {activeFilter})
              </span>
            )}
          </h4>

          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {activeFilter === 'all' ? sortedCourts.length : filteredCourts.length}
              </div>
              <div className={T.subtext}>
                {activeFilter === 'all' ? 'Campi Totali' : `Campi ${activeFilter}`}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {activeFilter === 'all'
                  ? sortedCourts.reduce((sum, court) => sum + (court.timeSlots || []).length, 0)
                  : filteredCourts.reduce((sum, court) => sum + (court.timeSlots || []).length, 0)}
              </div>
              <div className={T.subtext}>Fasce Configurate</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {activeFilter === 'all'
                  ? sortedCourts.reduce(
                      (sum, court) =>
                        sum + (court.timeSlots || []).filter((slot) => slot.isPromo).length,
                      0
                    )
                  : filteredCourts.reduce(
                      (sum, court) =>
                        sum + (court.timeSlots || []).filter((slot) => slot.isPromo).length,
                      0
                    )}
              </div>
              <div className={T.subtext}>Fasce Promo</div>
            </div>
          </div>

          <div className={`text-xs ${T.subtext} mt-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg`}>
            <div className="font-medium mb-1">💡 Ordinamento Campi</div>
            <div>
              I campi sono ordinati per posizione. Usa i pulsanti ⬆️ ⬇️ accanto a ciascun campo per
              modificare l'ordine di visualizzazione nelle colonne della prenotazione.
              {activeFilter !== 'all' && (
                <div className="mt-1 text-blue-600 dark:text-blue-400">
                  Nota: Le modifiche all'ordine si applicano a tutti i campi, anche quelli non
                  visibili con il filtro attivo.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
