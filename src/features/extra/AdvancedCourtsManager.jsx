// =============================================
// FILE: src/features/extra/AdvancedCourtsManager.jsx
// =============================================
import React, { useState } from 'react';
import { euro2 } from '@lib/format.js';

// Componente per i toggle dei giorni
function DayToggles({ value = [], onChange, T }) {
  const days = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'];
  const toggle = (idx) => {
    const has = value.includes(idx);
    onChange(has ? value.filter(d => d !== idx) : [...value, idx].sort((a,b)=>a-b));
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
              ? 'bg-emerald-500 text-black ring-emerald-500/60'
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
function TimeSlotEditor({ slot, onUpdate, onRemove, T }) {
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
    return euro2(total / 4);
  };

  return (
    <div className={`relative rounded-lg p-3 ${
      T.name === 'dark'
        ? `${T.cardBg} ${T.border}`
        : 'bg-emerald-50/50 ring-1 ring-emerald-200'
    }`}>
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
            <label htmlFor={`promo-${slot.id || 'new'}`} className="text-sm flex items-center gap-1">
              🏷️ Fascia Promo
              {slot.isPromo && <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">PROMO</span>}
            </label>
          </div>
        </div>

        {/* Preview prezzo */}
        <div className="flex lg:justify-end">
          <div className={`flex-shrink-0 p-3 rounded-lg ring-1 bg-emerald-100/50 ${T.border} text-center`}>
            <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">
              90min/4 persone
            </div>
            <div className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
              {perPlayer90(slot.eurPerHour)}€
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">
              per persona
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principale per una singola card campo espandibile
function ExpandableCourtCard({ court, onUpdate, onRemove, T }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const addTimeSlot = () => {
    const newSlot = {
      id: Date.now().toString(),
      label: 'Nuova fascia',
      eurPerHour: 25,
      from: '08:00',
      to: '12:00',
      days: [1,2,3,4,5] // Lun-Ven
    };
    
    onUpdate({
      timeSlots: [...(court.timeSlots || []), newSlot]
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
        className="p-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎾</span>
            <div>
              <div className="font-semibold text-lg">{court.name}</div>
              <div className={`text-sm ${T.subtext}`}>
                {(court.timeSlots || []).length} fasce orarie configurate
                {court.hasHeating && <span className="ml-1 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">🔥 Riscaldamento</span>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`text-sm px-3 py-1 rounded transition-all ${
                isExpanded 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded text-sm transition-colors"
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
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50/30 dark:bg-gray-800/30">
          {/* Configurazioni base del campo */}
          <div className="mb-6">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <span>⚙️</span>
              Configurazioni Campo
            </h4>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={`text-xs ${T.subtext} mb-1 block`}>Nome Campo</label>
                <input
                  value={court.name || ''}
                  onChange={(e) => onUpdate({ name: e.target.value })}
                  className={T.input}
                  placeholder="Es. Campo 1 - Centrale"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!court.hasHeating}
                    onChange={toggleHeating}
                    className="accent-orange-500"
                  />
                  <span className="text-sm">🔥 Riscaldamento</span>
                </label>
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
              <button
                type="button"
                className={`${T.btnGhost} text-sm`}
                onClick={addTimeSlot}
              >
                + Aggiungi Fascia
              </button>
            </div>

            {/* Lista fasce orarie */}
            <div className="space-y-3">
              {(court.timeSlots || []).length === 0 ? (
                <div className={`text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg ${T.subtext}`}>
                  <div className="text-2xl mb-2">🕐</div>
                  <div className="text-sm">Nessuna fascia oraria configurata</div>
                  <div className="text-xs mt-1">Aggiungi almeno una fascia per attivare il campo</div>
                </div>
              ) : (
                (court.timeSlots || []).map((slot, index) => (
                  <TimeSlotEditor
                    key={slot.id || index}
                    slot={slot}
                    onUpdate={(updates) => updateTimeSlot(index, updates)}
                    onRemove={() => removeTimeSlot(index)}
                    T={T}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente principale per la gestione avanzata dei campi
export default function AdvancedCourtsManager({ courts = [], onChange, T }) {
  const [newCourtName, setNewCourtName] = useState('');

  const addCourt = () => {
    if (!newCourtName.trim()) return;
    
    const newCourt = {
      id: Date.now().toString(),
      name: newCourtName.trim(),
      hasHeating: false,
      timeSlots: []
    };
    
    onChange([...courts, newCourt]);
    setNewCourtName('');
  };

  const updateCourt = (courtIndex, updates) => {
    const updatedCourts = courts.map((court, index) =>
      index === courtIndex ? { ...court, ...updates } : court
    );
    onChange(updatedCourts);
  };

  const removeCourt = (courtIndex) => {
    if (!confirm('Rimuovere il campo? Tutte le configurazioni e prenotazioni collegate saranno perse.')) return;
    onChange(courts.filter((_, index) => index !== courtIndex));
  };

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
              onKeyDown={(e) => e.key === 'Enter' && addCourt()}
              className={`${T.input} w-full`}
              placeholder="Es. Campo 4 - Centrale (Coperto)"
            />
          </div>
          <button 
            type="button" 
            className={`${T.btnPrimary} w-full sm:w-auto px-6`} 
            onClick={addCourt}
            disabled={!newCourtName.trim()}
          >
            ➕ Aggiungi Campo
          </button>
        </div>
        
        <div className={`text-xs ${T.subtext} mt-2`}>
          I campi saranno espandibili per configurare fasce orarie, prezzi e opzioni specifiche
        </div>
      </div>

      {/* Lista campi espandibili */}
      <div className="space-y-4">
        {courts.length === 0 ? (
          <div className={`text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl ${T.cardBg}`}>
            <div className="text-4xl mb-4">🏟️</div>
            <h4 className="font-medium text-lg mb-2">Nessun campo configurato</h4>
            <p className={`text-sm ${T.subtext} mb-4`}>
              Aggiungi il primo campo per iniziare a configurare fasce orarie e prezzi personalizzati
            </p>
          </div>
        ) : (
          courts.map((court, index) => (
            <ExpandableCourtCard
              key={court.id || index}
              court={court}
              onUpdate={(updates) => updateCourt(index, updates)}
              onRemove={() => removeCourt(index)}
              T={T}
            />
          ))
        )}
      </div>

      {/* Statistiche riassuntive */}
      {courts.length > 0 && (
        <div className={`rounded-xl ${T.border} ${T.cardBg} p-4`}>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            📊 Riepilogo Configurazioni
          </h4>
          
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {courts.length}
              </div>
              <div className={T.subtext}>Campi Totali</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {courts.reduce((sum, court) => sum + (court.timeSlots || []).length, 0)}
              </div>
              <div className={T.subtext}>Fasce Configurate</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {courts.reduce((sum, court) => sum + (court.timeSlots || []).filter(slot => slot.isPromo).length, 0)}
              </div>
              <div className={T.subtext}>Fasce Promo</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
