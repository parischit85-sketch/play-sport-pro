// =============================================
// FILE: src/features/extra/AdvancedCourtsManager.jsx
// =============================================
import React, { useState, useMemo } from 'react';
import { euro2 } from '@lib/format.js';
import {
  validateTimeSlot,
  detectTimeSlotOverlaps,
  sanitizeCourt,
  logValidationErrors,
} from '@utils/court-validation.js';
import { 
  TemplateLibraryModal, 
  CreateTemplateModal 
} from './TemplateManager.jsx';
import { 
  ExportCourtsModal, 
  ImportCourtsModal 
} from './ImportExportModal.jsx';
import { BulkTimeSlotsWizard } from './BulkTimeSlotsWizard.jsx'; // CHK-205
import { SmartSuggestionsPanel } from './SmartSuggestionsPanel.jsx'; // CHK-207
import { ConflictResolutionPanel } from './ConflictResolutionPanel.jsx'; // CHK-208
import templateManager from '@utils/court-templates.js';
import { useNotifications } from '@contexts/NotificationContext';

// =============================================
// COMPONENTE: Alert per errori di validazione
// =============================================
function ValidationAlert({ errors, onDismiss, type = 'error' }) {
  if (!errors || errors.length === 0) return null;

  const alertStyles = {
    error: 'bg-red-50 bg-red-900/20 border-red-200 border-red-800 text-red-800 text-red-300',
    warning: 'bg-yellow-50 bg-yellow-900/20 border-yellow-200 border-yellow-800 text-yellow-800 text-yellow-300',
  };

  const icons = {
    error: '❌',
    warning: '⚠️',
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${alertStyles[type]} mb-4 animate-fade-in`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icons[type]}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold mb-2">
            {type === 'error' ? 'Errori di validazione' : 'Attenzione'}
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-700 text-gray-400 hover:text-gray-200"
            aria-label="Chiudi"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================
// COMPONENTE: Indicatore salvataggio
// =============================================
function SaveIndicator({ isSaving, lastSaved, hasUnsavedChanges }) {
  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600 text-blue-400">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
        <span>Salvataggio...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600 text-emerald-400">
        <span>✓</span>
        <span>Salvato {lastSaved}</span>
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className="flex items-center gap-2 text-sm text-yellow-600 text-yellow-400">
        <span>⚠️</span>
        <span>Modifiche non salvate</span>
      </div>
    );
  }

  return null;
}

// ============================================
// COMPONENTE: DeleteCourtModal - Conferma Eliminazione Avanzata
// ============================================
const DeleteCourtModal = ({ isOpen, onClose, onConfirm, court, bookings = [] }) => {
  if (!isOpen || !court) return null;

  // Calcola l'impatto dell'eliminazione
  const relatedBookings = bookings.filter(b => b.courtId === court.id);
  const futureBookings = relatedBookings.filter(b => {
    const bookingDate = new Date(b.date);
    return bookingDate >= new Date();
  });
  
  const uniqueUsers = new Set(relatedBookings.map(b => b.userId)).size;
  const totalRevenue = relatedBookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const futureRevenue = futureBookings.reduce((sum, b) => sum + (b.price || 0), 0);

  const hasImpact = futureBookings.length > 0 || uniqueUsers > 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 border-b ${hasImpact ? 'bg-red-50 bg-red-900/20 border-red-200 border-red-800' : 'bg-gray-50 bg-gray-900 border-gray-200 border-gray-700'}`}>
          <div className="flex items-start gap-3">
            <div className={`text-4xl ${hasImpact ? '⚠️' : '🗑️'}`}>
              {hasImpact ? '⚠️' : '🗑️'}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 text-white">
                Elimina Campo: {court.name}
              </h3>
              <p className={`text-sm mt-1 ${hasImpact ? 'text-red-600 text-red-400' : 'text-gray-600 text-gray-400'}`}>
                {hasImpact 
                  ? 'Attenzione: questa operazione avrà conseguenze'
                  : 'Conferma eliminazione campo'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Impact Summary */}
          {hasImpact ? (
            <div className="space-y-3">
              <div className="bg-amber-50 bg-amber-900/20 border border-amber-200 border-amber-800 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 text-amber-300 mb-2 flex items-center gap-2">
                  📊 Analisi Impatto
                </h4>
                <div className="space-y-2 text-sm">
                  {futureBookings.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700 text-gray-300">Prenotazioni future:</span>
                      <span className="font-bold text-red-600 text-red-400">
                        {futureBookings.length}
                      </span>
                    </div>
                  )}
                  {relatedBookings.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700 text-gray-300">Prenotazioni totali:</span>
                      <span className="font-semibold text-gray-900 text-white">
                        {relatedBookings.length}
                      </span>
                    </div>
                  )}
                  {uniqueUsers > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700 text-gray-300">Clienti coinvolti:</span>
                      <span className="font-semibold text-gray-900 text-white">
                        {uniqueUsers}
                      </span>
                    </div>
                  )}
                  {futureRevenue > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700 text-gray-300">Revenue futura:</span>
                      <span className="font-bold text-red-600 text-red-400">
                        €{futureRevenue.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {totalRevenue > 0 && (
                    <div className="flex justify-between border-t border-amber-200 border-amber-800 pt-2 mt-2">
                      <span className="text-gray-700 text-gray-300">Revenue storica:</span>
                      <span className="font-semibold text-gray-900 text-white">
                        €{totalRevenue.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-red-50 bg-red-900/20 border border-red-200 border-red-800 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 text-red-300 mb-2">
                  ⚠️ Conseguenze
                </h4>
                <ul className="text-sm text-red-800 text-red-300 space-y-1">
                  {futureBookings.length > 0 && (
                    <li>• Le {futureBookings.length} prenotazioni future verranno annullate</li>
                  )}
                  <li>• Le configurazioni e fasce orarie saranno eliminate</li>
                  <li>• I clienti riceveranno notifica dell'annullamento</li>
                  <li>• Questa operazione è irreversibile</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 bg-blue-900/20 border border-blue-200 border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 text-blue-300 mb-2">
                ℹ️ Informazioni Campo
              </h4>
              <div className="text-sm text-blue-800 text-blue-300 space-y-1">
                <p>• Nessuna prenotazione attiva</p>
                <p>• L'eliminazione non avrà impatto sui clienti</p>
                <p>• Fasce orarie: {(court.timeSlots || []).length}</p>
                <p>• Tipo: {court.courtType || court.type || 'Non specificato'}</p>
              </div>
            </div>
          )}

          {/* Court Details */}
          <div className="border border-gray-200 border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 text-white mb-2">
              📋 Dettagli Campo
            </h4>
            <div className="text-sm text-gray-700 text-gray-300 space-y-1">
              <div><strong>Nome:</strong> {court.name}</div>
              <div><strong>Tipo:</strong> {court.courtType || court.type || 'N/A'}</div>
              <div><strong>Fasce orarie:</strong> {(court.timeSlots || []).length}</div>
              {court.hasHeating && <div><strong>Riscaldamento:</strong> Sì</div>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 bg-gray-900 border-t border-gray-200 border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white bg-gray-800 text-gray-700 text-gray-300 rounded-lg border border-gray-300 border-gray-600 hover:bg-gray-100 hover:bg-gray-700 font-medium transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-3 rounded-lg font-bold text-white transition-colors ${
              hasImpact
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {hasImpact ? '⚠️ Elimina Comunque' : '🗑️ Conferma Eliminazione'}
          </button>
        </div>
      </div>
    </div>
  );
};

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
              ? 'bg-emerald-500 text-black text-white ring-emerald-500'
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
  const [validationErrors, setValidationErrors] = React.useState([]);

  // Validazione in tempo reale
  React.useEffect(() => {
    const validation = validateTimeSlot(slot);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
    } else {
      setValidationErrors([]);
    }
  }, [slot]);

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

  // Indicatore visivo errori
  const hasErrors = validationErrors.length > 0;
  const borderClass = hasErrors
    ? 'ring-2 ring-red-500 ring-red-400'
    : 'ring-1 ring-gray-300 ring-gray-600';

  return (
    <div className={`relative rounded-lg p-3 bg-white bg-gray-800 ${borderClass}`}>
      {/* Pulsante rimuovi */}
      <button
        type="button"
        className="absolute top-2 right-2 text-rose-500 text-xs hover:underline z-10"
        onClick={onRemove}
        title="Rimuovi fascia"
      >
        ✕
      </button>

      {/* Errori di validazione */}
      {hasErrors && (
        <div className="mb-3 p-2 bg-red-50 bg-red-900/20 border border-red-200 border-red-800 rounded text-xs">
          <div className="font-semibold text-red-800 text-red-300 mb-1">⚠️ Errori:</div>
          <ul className="list-disc list-inside text-red-700 text-red-400 space-y-0.5">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

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
                <span className="ml-1 text-xs bg-yellow-100 bg-yellow-900 text-yellow-800 text-yellow-300 px-2 py-1 rounded">
                  PROMO
                </span>
              )}
            </label>
          </div>
        </div>

        {/* Preview prezzo */}
        <div className="flex lg:justify-end">
          <div
            className={`flex-shrink-0 p-3 rounded-lg ring-1 bg-emerald-100 bg-emerald-900 ${T.border} text-center`}
          >
            <div className="text-xs font-medium text-emerald-700 text-emerald-300 mb-1">
              90min x {maxPlayers} {maxPlayers === 1 ? 'Giocatore' : 'Giocatori'}
            </div>
            <div className="text-lg font-bold text-emerald-800 text-emerald-200">
              {perPlayer90(slot.eurPerHour)}€
            </div>
            <div className="text-xs text-emerald-600 text-emerald-400">per giocatore</div>
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
  onApplyTemplate, // CHK-201
  onCreateTemplate, // CHK-201
  onDuplicate, // CHK-202
  multiSelectMode, // CHK-204
  isSelected, // CHK-204
  onToggleSelection, // CHK-204
  quickEditMode, // CHK-206
  editingData, // CHK-206
  onQuickEditChange, // CHK-206
  onQuickEditSave, // CHK-206
  onQuickEditCancel, // CHK-206
  hasUnsavedChanges, // CHK-206
  onKeyDown, // CHK-206
  onOpenConflictResolution, // CHK-208
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Rilevamento sovrapposizioni fasce orarie
  const timeSlotOverlaps = useMemo(() => {
    return detectTimeSlotOverlaps(court.timeSlots || []);
  }, [court.timeSlots]);

  const hasOverlaps = timeSlotOverlaps.length > 0;

  const addTimeSlot = () => {
    const newSlot = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
    <div className={`rounded-xl ${T.border} ${T.cardBg} overflow-hidden transition-all ${isSelected ? 'ring-2 ring-orange-500' : ''}`}>
      {/* Header della card - sempre visibile */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 hover:bg-gray-800 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* CHK-204: Multi-Select Checkbox */}
            {multiSelectMode && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleSelection && onToggleSelection();
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
              />
            )}
            
            <span className="text-2xl">🎾</span>
            <div className="flex-1">
              {quickEditMode ? (
                // CHK-206: Quick Edit Mode - Inline Editing
                <div 
                  className="space-y-2" 
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => onKeyDown && onKeyDown(e, courtIndex)}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingData?.name ?? court.name}
                      onChange={(e) => onQuickEditChange && onQuickEditChange(courtIndex, 'name', e.target.value)}
                      className={`${T.input} font-semibold text-lg flex-1 min-w-0`}
                      placeholder="Nome campo"
                    />
                    <select
                      value={editingData?.courtType ?? court.courtType}
                      onChange={(e) => onQuickEditChange && onQuickEditChange(courtIndex, 'courtType', e.target.value)}
                      className={`${T.select} text-sm`}
                    >
                      {courtTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <label className="flex items-center gap-1">
                      <span className={T.subtext}>Max giocatori:</span>
                      <input
                        type="number"
                        min="1"
                        max="22"
                        value={editingData?.maxPlayers ?? court.maxPlayers}
                        onChange={(e) => onQuickEditChange && onQuickEditChange(courtIndex, 'maxPlayers', parseInt(e.target.value) || 1)}
                        className={`${T.input} w-16 text-sm`}
                      />
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingData?.hasHeating ?? court.hasHeating}
                        onChange={(e) => onQuickEditChange && onQuickEditChange(courtIndex, 'hasHeating', e.target.checked)}
                        className="w-4 h-4 text-orange-600 rounded"
                      />
                      <span className={T.subtext}>🔥 Riscaldamento</span>
                    </label>
                    {hasUnsavedChanges && (
                      <span className="text-xs px-2 py-1 bg-yellow-100 bg-yellow-900 text-yellow-800 text-yellow-300 rounded font-medium">
                        • Non salvato
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                // Normal display mode
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
                      <span className="ml-1 text-xs bg-orange-100 bg-orange-900 text-orange-800 text-orange-300 px-2 py-1 rounded">
                        🔥 Riscaldamento
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* CHK-206: Quick Edit Save/Cancel Buttons */}
            {quickEditMode && hasUnsavedChanges && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickEditSave && onQuickEditSave(courtIndex);
                  }}
                  className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium transition-colors"
                  title="Salva (Ctrl+S)"
                >
                  💾 Salva
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickEditCancel && onQuickEditCancel(courtIndex);
                  }}
                  className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
                  title="Annulla (ESC)"
                >
                  ✕
                </button>
              </>
            )}

            {/* Pulsanti di ordinamento */}
            {!quickEditMode && (
              <div className="flex flex-col gap-1 mr-2">
                <button
                  type="button"
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    isFirst
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 hover:bg-blue-50 hover:bg-blue-900'
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
                      : 'text-blue-600 hover:bg-blue-50 hover:bg-blue-900'
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
            )}

            {/* CHK-202: Duplicate Court Button */}
            {!quickEditMode && (
              <button
                type="button"
                className="text-sm px-3 py-1 bg-blue-100 bg-blue-900 text-blue-700 text-blue-300 rounded hover:bg-blue-200 hover:bg-blue-800 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate && onDuplicate();
                }}
                title="Duplica campo"
              >
                📋 Duplica
              </button>
            )}

            {/* CHK-208: Conflict Resolution Button */}
            {hasOverlaps && (
              <button
                type="button"
                className="text-sm px-3 py-1 bg-red-100 bg-red-900 text-red-700 text-red-300 rounded hover:bg-red-200 hover:bg-red-800 transition-colors flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenConflictResolution && onOpenConflictResolution(courtIndex);
                }}
                title={`Risolvi ${timeSlotOverlaps.length} conflitto/i`}
              >
                ⚠️ {timeSlotOverlaps.length}
              </button>
            )}

            <button
              type="button"
              className={`text-sm px-3 py-1 rounded transition-all ${
                isExpanded
                  ? 'bg-emerald-100 bg-emerald-900 text-emerald-800 text-emerald-300'
                  : 'bg-gray-100 bg-gray-700 text-gray-600 text-gray-300 hover:bg-gray-200 hover:bg-gray-600'
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
              className="text-red-500 hover:bg-red-50 hover:bg-red-900 px-2 py-1 rounded text-sm transition-colors"
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
        <div className="border-t border-gray-200 border-gray-700 p-4 bg-gray-50 bg-gray-900">
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

            {/* Toggle Riscaldamento */}
            <div className="mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={court.hasHeating || false}
                  onChange={toggleHeating}
                  className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-orange-600 ring-offset-gray-800 focus:ring-2 border-gray-600"
                />
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <div className="font-medium text-sm">Riscaldamento Disponibile</div>
                    <div className={`text-xs ${T.subtext}`}>
                      Abilita il riscaldamento per questo campo
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Gestione fasce orarie */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <span>🕐</span>
                Fasce Orarie e Prezzi
              </h4>
              <div className="flex gap-2">
                {/* CHK-201: Template Actions */}
                {(court.timeSlots || []).length > 0 && (
                  <button
                    type="button"
                    className="text-sm px-3 py-2 bg-purple-100 bg-purple-900 text-purple-700 text-purple-300 rounded-lg hover:bg-purple-200 hover:bg-purple-800 transition-colors font-medium"
                    onClick={() => onCreateTemplate && onCreateTemplate()}
                    title="Salva queste fasce come template"
                  >
                    💾 Salva come Template
                  </button>
                )}
                <button
                  type="button"
                  className="text-sm px-3 py-2 bg-blue-100 bg-blue-900 text-blue-700 text-blue-300 rounded-lg hover:bg-blue-200 hover:bg-blue-800 transition-colors font-medium"
                  onClick={() => onApplyTemplate && onApplyTemplate()}
                  title="Applica un template a questo campo"
                >
                  📚 Usa Template
                </button>
                <button type="button" className={`${T.btnGhost} text-sm`} onClick={addTimeSlot}>
                  + Aggiungi Fascia
                </button>
              </div>
            </div>

            {/* Warning sovrapposizioni */}
            {hasOverlaps && (
              <ValidationAlert
                type="warning"
                errors={timeSlotOverlaps.map(
                  (overlap) =>
                    `Sovrapposizione tra "${court.timeSlots[overlap.slot1Index]?.label}" (${overlap.timeOverlap.slot1}) e "${court.timeSlots[overlap.slot2Index]?.label}" (${overlap.timeOverlap.slot2}) in ${overlap.days.join(', ')}`
                )}
              />
            )}

            {/* Lista fasce orarie */}
            <div className="space-y-3">
              {(court.timeSlots || []).length === 0 ? (
                <div
                  className={`text-center py-6 border-2 border-dashed border-gray-300 border-gray-600 rounded-lg ${T.subtext}`}
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
  bookings = [], // CHK-207: Bookings data for analytics
}) {
  // Notification System
  const { showSuccess, showError, showWarning, showInfo, confirm } = useNotifications();

  const [newCourtName, setNewCourtName] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // "all" o il tipo specifico
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courtToDelete, setCourtToDelete] = useState(null);
  
  // CHK-201: Template System State
  const [templateLibraryOpen, setTemplateLibraryOpen] = useState(false);
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [selectedCourtForTemplate, setSelectedCourtForTemplate] = useState(null);
  
  // CHK-203: Import/Export State
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedCourtsForExport, setSelectedCourtsForExport] = useState([]);

  // CHK-204: Multi-Select State
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedCourtIndices, setSelectedCourtIndices] = useState([]);

  // CHK-205: Bulk Time Slots Wizard State
  const [bulkSlotsWizardOpen, setBulkSlotsWizardOpen] = useState(false);

  // CHK-206: Quick Edit Mode State
  const [quickEditMode, setQuickEditMode] = useState(false);
  const [editingCourts, setEditingCourts] = useState({}); // { courtIndex: { field: value } }
  const [unsavedChanges, setUnsavedChanges] = useState(new Set());

  // CHK-207: Smart Suggestions State
  const [smartSuggestionsOpen, setSmartSuggestionsOpen] = useState(false);

  // CHK-208: Conflict Resolution State
  const [conflictResolutionOpen, setConflictResolutionOpen] = useState(false);
  const [conflictCourtIndex, setConflictCourtIndex] = useState(null);

  // CHK-005: Safe guards per dati corrotti
  // Sanitizza e valida courts all'ingresso
  const safeCourts = useMemo(() => {
    if (!Array.isArray(courts)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ courts is not an array, using empty array');
      }
      return [];
    }

    // Sanitizza ogni court
    return courts.map((court) => {
      // Verifica che court sia un oggetto
      if (!court || typeof court !== 'object') {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Invalid court object, skipping:', court);
        }
        return null;
      }

      // Sanitizza il court
      return {
        id: court.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: (court.name || 'Campo senza nome').trim(),
        courtType: courtTypes.includes(court.courtType) ? court.courtType : 'Indoor',
        maxPlayers: Math.max(1, Math.min(22, parseInt(court.maxPlayers) || 4)),
        hasHeating: Boolean(court.hasHeating),
        order: parseInt(court.order) || 1,
        timeSlots: Array.isArray(court.timeSlots) ? court.timeSlots : [],
      };
    }).filter(Boolean); // Rimuovi eventuali null
  }, [courts, courtTypes]);

  // Inizializza gli ordini se necessario
  const courtsWithOrder = safeCourts.map((court, index) => ({
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

    // Non generiamo più un ID locale - lasciamo che Firebase lo generi automaticamente
    // quando il campo viene salvato. Usiamo un ID temporaneo per il rendering locale.
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newCourt = {
      id: tempId, // ID temporaneo che sarà sostituito dall'ID Firebase
      name: newCourtName.trim(),
      hasHeating: false,
      timeSlots: [],
      order: nextOrder,
      courtType: 'Indoor', // Default court type
      maxPlayers: 4, // Default 4 giocatori
    };

    try {
      setIsSaving(true);
      setHasUnsavedChanges(true);
      
      // Notifica il parent della modifica - il parent si occuperà del salvataggio Firebase
      onChange([...courts, newCourt]);
      setNewCourtName('');
      
      // Simula salvataggio completato (in realtà avviene nel parent)
      setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
        setHasUnsavedChanges(false);
      }, 500);
    } catch (error) {
      setIsSaving(false);
      if (process.env.NODE_ENV === 'development') {
        console.error("Errore durante l'aggiunta del campo:", error);
      }
      showError(`Errore durante l'aggiunta del campo: ${error.message}`);
    }
  };

  const handleUpdateCourt = async (courtIndex, updates) => {
    const court = courts[courtIndex];
    if (!court) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Court not found at index:', courtIndex);
      }
      return;
    }

    try {
      setIsSaving(true);
      setHasUnsavedChanges(true);
      
      // Notifica il parent della modifica - il parent si occuperà del salvataggio Firebase
      const updatedCourts = courts.map((c, index) =>
        index === courtIndex ? { ...c, ...updates } : c
      );
      onChange(updatedCourts);
      
      // Simula salvataggio completato
      setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
        setHasUnsavedChanges(false);
      }, 500);
    } catch (error) {
      setIsSaving(false);
      if (process.env.NODE_ENV === 'development') {
        console.error("Errore durante l'aggiornamento del campo:", error);
      }
      showError(`Errore durante l'aggiornamento del campo: ${error.message}`);
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
    const court = courts[courtIndex];
    if (!court) return;

    // Apri modal con dati del campo
    setCourtToDelete({ court, index: courtIndex });
    setDeleteModalOpen(true);
  };

  const confirmRemoveCourt = async () => {
    if (!courtToDelete) return;

    const { index: courtIndex } = courtToDelete;

    try {
      // Rimuovi semplicemente il campo dall'array - gli ordini degli altri campi rimangono invariati
      const updatedCourts = courts.filter((_, index) => index !== courtIndex);

      onChange(updatedCourts);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Errore durante la rimozione del campo:', error);
      }
      showError(`Errore durante la rimozione del campo: ${error.message}`);
    }
  };

  // ===========================================
  // CHK-201: Template Management Handlers
  // ===========================================
  
  const handleApplyTemplate = (template) => {
    if (!template) return;

    // Applica il template a tutti i campi selezionati
    // Per ora applichiamo al campo correntemente selezionato
    if (selectedCourtForTemplate !== null) {
      const court = courts[selectedCourtForTemplate];
      if (court) {
        handleUpdateCourt(selectedCourtForTemplate, {
          timeSlots: template.timeSlots
        });
      }
      setSelectedCourtForTemplate(null);
    }
  };

  const handleCreateTemplate = (court, courtIndex) => {
    setSelectedCourtForTemplate(courtIndex);
    setCreateTemplateOpen(true);
  };

  const handleSaveNewTemplate = (newTemplate) => {
    // Template già salvato dal TemplateManager
    // Mostra notifica di successo
    showSuccess(`Template "${newTemplate.name}" creato con successo!`);
  };

  // ===========================================
  // CHK-202: Duplicate Court Handler
  // ===========================================
  
  const handleDuplicateCourt = async (courtIndex) => {
    const sourceCourt = courts[courtIndex];
    if (!sourceCourt) return;

    try {
      setIsSaving(true);
      setHasUnsavedChanges(true);

      // Trova il prossimo ordine disponibile
      const maxOrder =
        courtsWithOrder.length > 0 ? Math.max(...courtsWithOrder.map((c) => c.order || 0)) : 0;
      const nextOrder = maxOrder + 1;

      // Auto-increment del nome
      const baseName = sourceCourt.name.replace(/ - Copia( \d+)?$/, '');
      const existingCopies = courts.filter(c => 
        c.name.startsWith(baseName) && c.name.match(/ - Copia( \d+)?$/)
      );
      const copyNumber = existingCopies.length > 0 ? existingCopies.length + 1 : null;
      const newName = copyNumber 
        ? `${baseName} - Copia ${copyNumber}`
        : `${baseName} - Copia`;

      // ID temporaneo
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Clona il campo con deep copy delle fasce orarie
      const duplicatedCourt = {
        id: tempId,
        name: newName,
        courtType: sourceCourt.courtType,
        maxPlayers: sourceCourt.maxPlayers,
        hasHeating: sourceCourt.hasHeating,
        order: nextOrder,
        timeSlots: (sourceCourt.timeSlots || []).map(slot => ({
          ...slot,
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }))
      };

      // Aggiungi il nuovo campo
      const updatedCourts = [...courts, duplicatedCourt];
      onChange(updatedCourts);

      // Feedback successo
      setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
        setHasUnsavedChanges(false);
        
        // Mostra notifica
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Campo "${sourceCourt.name}" duplicato come "${newName}"`);
        }
      }, 500);

    } catch (error) {
      setIsSaving(false);
      if (process.env.NODE_ENV === 'development') {
        console.error('Errore durante la duplicazione del campo:', error);
      }
      showError(`Errore durante la duplicazione del campo: ${error.message}`);
    }
  };

  // ===========================================
  // CHK-203: Import/Export Handlers
  // ===========================================
  
  const handleExportAll = () => {
    setSelectedCourtsForExport([]);
    setExportModalOpen(true);
  };

  const handleExportSelected = (courtIndices) => {
    setSelectedCourtsForExport(courtIndices);
    setExportModalOpen(true);
  };

  const handleImportCourts = (importedCourts, strategy) => {
    try {
      setIsSaving(true);
      setHasUnsavedChanges(true);

      const updatedCourts = strategy === 'replace'
        ? importedCourts
        : [...courts, ...importedCourts];

      onChange(updatedCourts);

      // Feedback successo
      setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
        setHasUnsavedChanges(false);
        
        showSuccess(`${importedCourts.length} campi importati con successo! (${strategy === 'replace' ? 'Sostituzione' : 'Aggiunta'})`);
      }, 500);

    } catch (error) {
      setIsSaving(false);
      if (process.env.NODE_ENV === 'development') {
        console.error('Errore durante l\'import:', error);
      }
      showError(`Errore durante l'import: ${error.message}`);
    }
  };

  // ===========================================
  // CHK-204: Multi-Select Handlers
  // ===========================================

  const toggleMultiSelectMode = () => {
    setMultiSelectMode(!multiSelectMode);
    if (multiSelectMode) {
      // Exit multi-select: clear selections
      setSelectedCourtIndices([]);
    }
  };

  const toggleCourtSelection = (courtIndex) => {
    setSelectedCourtIndices(prev => {
      if (prev.includes(courtIndex)) {
        return prev.filter(i => i !== courtIndex);
      } else {
        return [...prev, courtIndex];
      }
    });
  };

  const selectAllCourts = () => {
    const allIndices = filteredCourts.map((_, idx) => {
      return courts.findIndex(c => c.id === filteredCourts[idx].id);
    });
    setSelectedCourtIndices(allIndices);
  };

  const deselectAllCourts = () => {
    setSelectedCourtIndices([]);
  };

  const handleBulkDelete = async () => {
    if (selectedCourtIndices.length === 0) return;

    const confirmed = await confirm({
      title: 'Elimina campi selezionati',
      message: `Sei sicuro di voler eliminare ${selectedCourtIndices.length} ${selectedCourtIndices.length === 1 ? 'campo' : 'campi'}?\n\nQuesta operazione è irreversibile.`,
      variant: 'danger',
      confirmText: 'Elimina',
      cancelText: 'Annulla',
    });

    if (!confirmed) return;

    try {
      setIsSaving(true);
      const updatedCourts = courts.filter((_, index) => !selectedCourtIndices.includes(index));
      onChange(updatedCourts);
      
      setSelectedCourtIndices([]);
      setMultiSelectMode(false);

      setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
      }, 500);
    } catch (error) {
      setIsSaving(false);
      showError(`Errore durante l'eliminazione: ${error.message}`);
    }
  };

  const handleBulkExport = () => {
    if (selectedCourtIndices.length === 0) return;
    setSelectedCourtsForExport(selectedCourtIndices);
    setExportModalOpen(true);
  };

  const handleBulkApplyTemplate = () => {
    if (selectedCourtIndices.length === 0) return;
    // Will use first selected court as reference
    setSelectedCourtForTemplate(selectedCourtIndices[0]);
    setTemplateLibraryOpen(true);
  };

  // CHK-205: Handler per applicare fasce generate dal wizard
  const handleApplyBulkTimeSlots = (generatedSlots, targetCourts) => {
    const updatedCourts = courts.map((court, index) => {
      // Check if this court is in the target list
      const isTargetCourt = targetCourts.some((tc) => tc === court || courts.indexOf(tc) === index);
      
      if (isTargetCourt) {
        // Generate new IDs for each slot
        const slotsWithNewIds = generatedSlots.map((slot) => ({
          ...slot,
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }));
        
        return {
          ...court,
          timeSlots: [...court.timeSlots, ...slotsWithNewIds],
        };
      }
      
      return court;
    });

    onChange(updatedCourts);
    setSaveStatus({ show: true, type: 'success', message: `Aggiunte ${generatedSlots.length} fasce a ${targetCourts.length} ${targetCourts.length === 1 ? 'campo' : 'campi'}` });
    setTimeout(() => setSaveStatus({ show: false, type: '', message: '' }), 3000);
  };

  // CHK-206: Quick Edit Mode Handlers
  const toggleQuickEditMode = async () => {
    if (quickEditMode) {
      // Esci da quick edit - chiedi conferma se ci sono modifiche non salvate
      if (unsavedChanges.size > 0) {
        const confirmed = await confirm({
          title: 'Modifiche non salvate',
          message: `Hai ${unsavedChanges.size} modifiche non salvate. Vuoi uscire senza salvare?`,
          variant: 'warning',
          confirmText: 'Esci senza salvare',
          cancelText: 'Continua a modificare',
        });
        
        if (!confirmed) {
          return;
        }
      }
      setEditingCourts({});
      setUnsavedChanges(new Set());
    }
    setQuickEditMode(!quickEditMode);
  };

  const handleQuickEditChange = (courtIndex, field, value) => {
    setEditingCourts(prev => ({
      ...prev,
      [courtIndex]: {
        ...(prev[courtIndex] || {}),
        [field]: value,
      },
    }));
    setUnsavedChanges(prev => new Set(prev).add(courtIndex));
  };

  const saveQuickEdits = (courtIndex = null) => {
    // Se courtIndex è null, salva tutti i campi
    const indicesToSave = courtIndex !== null ? [courtIndex] : Array.from(unsavedChanges);
    
    if (indicesToSave.length === 0) return;

    const updatedCourts = courts.map((court, index) => {
      if (indicesToSave.includes(index) && editingCourts[index]) {
        return {
          ...court,
          ...editingCourts[index],
        };
      }
      return court;
    });

    onChange(updatedCourts);
    
    // Rimuovi gli indici salvati dalle modifiche non salvate
    const newUnsaved = new Set(unsavedChanges);
    indicesToSave.forEach(i => newUnsaved.delete(i));
    setUnsavedChanges(newUnsaved);

    // Pulisci i campi salvati
    if (courtIndex !== null) {
      const newEditing = { ...editingCourts };
      delete newEditing[courtIndex];
      setEditingCourts(newEditing);
    } else {
      setEditingCourts({});
    }

    setSaveStatus({ 
      show: true, 
      type: 'success', 
      message: `${indicesToSave.length} ${indicesToSave.length === 1 ? 'campo salvato' : 'campi salvati'}` 
    });
    setTimeout(() => setSaveStatus({ show: false, type: '', message: '' }), 2000);
  };

  const cancelQuickEdit = (courtIndex) => {
    const newEditing = { ...editingCourts };
    delete newEditing[courtIndex];
    setEditingCourts(newEditing);
    
    const newUnsaved = new Set(unsavedChanges);
    newUnsaved.delete(courtIndex);
    setUnsavedChanges(newUnsaved);
  };

  // CHK-206: Keyboard shortcuts handler
  const handleKeyDown = (e, courtIndex) => {
    if (!quickEditMode) return;
    
    // Ctrl+S o Cmd+S: Salva
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveQuickEdits(courtIndex);
    }
    
    // ESC: Annulla
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelQuickEdit(courtIndex);
    }
  };

  // CHK-207: Handler per applicare suggerimenti
  const handleApplySuggestion = (suggestion) => {
    console.log('Applying suggestion:', suggestion);
    
    switch (suggestion.action) {
      case 'apply-peak-pricing': {
        // Applica pricing maggiorato per peak hours
        const { peakHours, suggestedIncrease } = suggestion.data;
        const updatedCourts = courts.map((court) => ({
          ...court,
          timeSlots: (court.timeSlots || []).map((slot) => {
            const hour = parseInt(slot.from.split(':')[0]);
            if (peakHours.includes(hour)) {
              return {
                ...slot,
                eurPerHour: Math.round(slot.eurPerHour * suggestedIncrease),
                isPromo: false,
              };
            }
            return slot;
          }),
        }));
        onChange(updatedCourts);
        setSaveStatus({ 
          show: true, 
          type: 'success', 
          message: `Prezzi aumentati per ${peakHours.length} fasce orarie di punta` 
        });
        setTimeout(() => setSaveStatus({ show: false, type: '', message: '' }), 3000);
        break;
      }
      
      case 'apply-offpeak-discount': {
        // Applica sconto per off-peak hours
        const { offPeakHours, suggestedDiscount } = suggestion.data;
        const updatedCourts = courts.map((court) => ({
          ...court,
          timeSlots: (court.timeSlots || []).map((slot) => {
            const hour = parseInt(slot.from.split(':')[0]);
            if (offPeakHours.includes(hour)) {
              return {
                ...slot,
                eurPerHour: Math.round(slot.eurPerHour * suggestedDiscount),
                isPromo: true,
              };
            }
            return slot;
          }),
        }));
        onChange(updatedCourts);
        setSaveStatus({ 
          show: true, 
          type: 'success', 
          message: `Sconto applicato a ${offPeakHours.length} fasce orarie off-peak` 
        });
        setTimeout(() => setSaveStatus({ show: false, type: '', message: '' }), 3000);
        break;
      }
      
      case 'view-details':
      case 'optimize-pricing':
      case 'add-court-type':
        // Per questi suggerimenti, mostra solo info
        showInfo(`${suggestion.title}\n\n${suggestion.description}\n\nImplementa manualmente questa ottimizzazione.`, 8000);
        break;
      
      default:
        console.warn('Unknown suggestion action:', suggestion.action);
    }
  };

  // CHK-208: Handler per aprire conflict resolution
  const handleOpenConflictResolution = (courtIndex) => {
    setConflictCourtIndex(courtIndex);
    setConflictResolutionOpen(true);
  };

  // CHK-208: Handler per risolvere conflitti
  const handleResolveConflict = (courtIndex, updates) => {
    if (courtIndex === null || courtIndex === undefined) return;
    
    handleUpdateCourt(courtIndex, updates);
    setSaveStatus({ 
      show: true, 
      type: 'success', 
      message: 'Conflitto risolto con successo!' 
    });
    setTimeout(() => setSaveStatus({ show: false, type: '', message: '' }), 3000);
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            🏟️ Gestione Campi Avanzata
          </h3>
          
          <div className="flex items-center gap-3">
            {/* CHK-204: Multi-Select Toggle */}
            {sortedCourts.length > 0 && (
              <button
                type="button"
                onClick={toggleMultiSelectMode}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  multiSelectMode
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 hover:bg-gray-600 text-gray-700 text-gray-300'
                }`}
                title={multiSelectMode ? 'Esci da selezione multipla' : 'Attiva selezione multipla'}
              >
                {multiSelectMode ? '✕ Annulla' : '☑️ Seleziona'}
              </button>
            )}

            {/* CHK-206: Quick Edit Mode Toggle */}
            {sortedCourts.length > 0 && (
              <button
                type="button"
                onClick={toggleQuickEditMode}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  quickEditMode
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 hover:bg-gray-600 text-gray-700 text-gray-300'
                }`}
                title={quickEditMode ? 'Esci da quick edit' : 'Attiva quick edit mode'}
              >
                {quickEditMode ? '⚡ Quick Edit ON' : '✏️ Quick Edit'}
                {quickEditMode && unsavedChanges.size > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-white/20 bg-gray-800/20 rounded-full text-xs">
                    {unsavedChanges.size}
                  </span>
                )}
              </button>
            )}

            {/* Quick Edit: Save All button (visible only when there are unsaved changes) */}
            {quickEditMode && unsavedChanges.size > 0 && (
              <button
                type="button"
                onClick={() => saveQuickEdits()}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                title="Salva tutte le modifiche (Ctrl+S)"
              >
                💾 Salva Tutto ({unsavedChanges.size})
              </button>
            )}

            {/* CHK-201: Template Actions */}
            <button
              type="button"
              onClick={() => setTemplateLibraryOpen(true)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              title="Apri libreria template"
            >
              📚 Template
            </button>

            {/* CHK-205: Bulk Time Slots Wizard */}
            <button
              type="button"
              onClick={() => setBulkSlotsWizardOpen(true)}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              title="Creazione fasce orarie automatica"
            >
              🪄 Fasce Auto
            </button>

            {/* CHK-207: Smart Suggestions */}
            <button
              type="button"
              onClick={() => setSmartSuggestionsOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              title="Suggerimenti intelligenti basati su analytics"
            >
              🧠 Smart Suggestions
            </button>

            {/* CHK-208: Conflict Auto-Resolution */}
            {sortedCourts.some(court => detectTimeSlotOverlaps(court.timeSlots || []).length > 0) && (
              <button
                type="button"
                onClick={() => {
                  // Trova il primo campo con conflitti
                  const firstConflictIndex = sortedCourts.findIndex(
                    court => detectTimeSlotOverlaps(court.timeSlots || []).length > 0
                  );
                  if (firstConflictIndex !== -1) {
                    handleOpenConflictResolution(firstConflictIndex);
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 animate-pulse"
                title="Risolvi conflitti di fasce orarie"
              >
                ⚠️ Conflitti Rilevati
              </button>
            )}

            {/* CHK-203: Import/Export Actions */}
            <button
              type="button"
              onClick={() => setImportModalOpen(true)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              title="Importa configurazioni"
            >
              📥 Import
            </button>
            <button
              type="button"
              onClick={handleExportAll}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              title="Esporta configurazioni"
            >
              📤 Export
            </button>
            
            {/* CHK-101: Indicatore salvataggio */}
            <SaveIndicator
              isSaving={isSaving}
              lastSaved={lastSaved}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          </div>
        </div>

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
            disabled={!newCourtName.trim() || isSaving}
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
                  : 'bg-gray-100 bg-gray-700 text-gray-700 text-gray-300 hover:bg-gray-200 hover:bg-gray-600'
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
                    : 'bg-gray-100 bg-gray-700 text-gray-700 text-gray-300 hover:bg-gray-200 hover:bg-gray-600'
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

      {/* CHK-204: Bulk Actions Panel */}
      {multiSelectMode && selectedCourtIndices.length > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-orange-50 to-yellow-50 from-orange-900/20 to-yellow-900/20 border-2 border-orange-300 border-orange-700 p-4 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl">☑️</div>
              <div>
                <div className="font-bold text-gray-900 text-white">
                  {selectedCourtIndices.length} {selectedCourtIndices.length === 1 ? 'campo selezionato' : 'campi selezionati'}
                </div>
                <div className="text-sm text-gray-600 text-gray-400">
                  Azioni disponibili per la selezione multipla
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={selectAllCourts}
                className="px-3 py-2 bg-blue-100 bg-blue-900 text-blue-700 text-blue-300 rounded-lg hover:bg-blue-200 hover:bg-blue-800 text-sm font-medium transition-colors"
              >
                ✓ Seleziona Tutti
              </button>
              <button
                onClick={deselectAllCourts}
                className="px-3 py-2 bg-gray-100 bg-gray-700 text-gray-700 text-gray-300 rounded-lg hover:bg-gray-200 hover:bg-gray-600 text-sm font-medium transition-colors"
              >
                ✕ Deseleziona
              </button>
              <button
                onClick={handleBulkApplyTemplate}
                className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                📚 Applica Template
              </button>
              <button
                onClick={() => setBulkSlotsWizardOpen(true)}
                className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                🪄 Fasce Auto
              </button>
              <button
                onClick={handleBulkExport}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                📤 Esporta
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                🗑️ Elimina
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista campi espandibili */}
      <div className="space-y-4">
        {filteredCourts.length === 0 ? (
          <div
            className={`text-center py-12 border-2 border-dashed border-gray-300 border-gray-600 rounded-xl ${T.cardBg}`}
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
                onApplyTemplate={() => {
                  setSelectedCourtForTemplate(originalIndex);
                  setTemplateLibraryOpen(true);
                }}
                onCreateTemplate={() => handleCreateTemplate(court, originalIndex)}
                onDuplicate={() => handleDuplicateCourt(originalIndex)}
                multiSelectMode={multiSelectMode}
                isSelected={selectedCourtIndices.includes(originalIndex)}
                onToggleSelection={() => toggleCourtSelection(originalIndex)}
                quickEditMode={quickEditMode}
                editingData={editingCourts[originalIndex]}
                onQuickEditChange={handleQuickEditChange}
                onQuickEditSave={saveQuickEdits}
                onQuickEditCancel={cancelQuickEdit}
                hasUnsavedChanges={unsavedChanges.has(originalIndex)}
                onKeyDown={handleKeyDown}
                onOpenConflictResolution={handleOpenConflictResolution}
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
              <span className="text-sm text-blue-600 text-blue-400">
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

          <div className={`text-xs ${T.subtext} mt-3 p-3 bg-blue-50 bg-blue-900 rounded-lg`}>
            <div className="font-medium mb-1">💡 Ordinamento Campi</div>
            <div>
              I campi sono ordinati per posizione. Usa i pulsanti ⬆️ ⬇️ accanto a ciascun campo per
              modificare l'ordine di visualizzazione nelle colonne della prenotazione.
              {activeFilter !== 'all' && (
                <div className="mt-1 text-blue-600 text-blue-400">
                  Nota: Le modifiche all'ordine si applicano a tutti i campi, anche quelli non
                  visibili con il filtro attivo.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Court Modal */}
      <DeleteCourtModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCourtToDelete(null);
        }}
        onConfirm={confirmRemoveCourt}
        court={courtToDelete?.court}
        bookings={[]} // TODO: Pass real bookings if available
      />

      {/* CHK-201: Template Library Modal */}
      <TemplateLibraryModal
        isOpen={templateLibraryOpen}
        onClose={() => {
          setTemplateLibraryOpen(false);
          setSelectedCourtForTemplate(null);
        }}
        onApply={handleApplyTemplate}
        T={T}
      />

      {/* CHK-201: Create Template Modal */}
      <CreateTemplateModal
        isOpen={createTemplateOpen}
        onClose={() => {
          setCreateTemplateOpen(false);
          setSelectedCourtForTemplate(null);
        }}
        onSave={handleSaveNewTemplate}
        sourceTimeSlots={
          selectedCourtForTemplate !== null
            ? courts[selectedCourtForTemplate]?.timeSlots || []
            : []
        }
        T={T}
      />

      {/* CHK-203: Export Modal */}
      <ExportCourtsModal
        isOpen={exportModalOpen}
        onClose={() => {
          setExportModalOpen(false);
          setSelectedCourtsForExport([]);
        }}
        courts={courts}
        selectedCourts={selectedCourtsForExport}
        T={T}
      />

      {/* CHK-203: Import Modal */}
      <ImportCourtsModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportCourts}
        existingCourts={courts}
        T={T}
      />

      {/* CHK-205: Bulk Time Slots Wizard */}
      <BulkTimeSlotsWizard
        isOpen={bulkSlotsWizardOpen}
        onClose={() => setBulkSlotsWizardOpen(false)}
        onApply={handleApplyBulkTimeSlots}
        courts={courts}
        selectedCourtIndices={selectedCourtIndices}
        T={T}
      />

      {/* CHK-207: Smart Suggestions Panel */}
      <SmartSuggestionsPanel
        isOpen={smartSuggestionsOpen}
        onClose={() => setSmartSuggestionsOpen(false)}
        courts={courts}
        bookings={bookings || []}
        onApplySuggestion={handleApplySuggestion}
        T={T}
      />

      {/* CHK-208: Conflict Resolution Panel */}
      {conflictCourtIndex !== null && (
        <ConflictResolutionPanel
          isOpen={conflictResolutionOpen}
          onClose={() => {
            setConflictResolutionOpen(false);
            setConflictCourtIndex(null);
          }}
          court={courts[conflictCourtIndex]}
          courtIndex={conflictCourtIndex}
          onResolve={handleResolveConflict}
          T={T}
        />
      )}
    </div>
  );
}

