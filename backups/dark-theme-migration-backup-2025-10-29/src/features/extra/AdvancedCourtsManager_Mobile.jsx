// =============================================
// FILE: src/features/extra/AdvancedCourtsManager_Mobile.jsx
// Versione Mobile-First Ottimizzata
// =============================================
import React, { useState, useMemo } from 'react';
import { useNotifications } from '@contexts/NotificationContext';
import { euro2 } from '@lib/format.js';
import {
  validateCourt,
  validateTimeSlot,
  detectTimeSlotOverlaps,
  sanitizeCourt,
} from '@utils/court-validation.js';

// ============================================
// COMPONENTE: ValidationAlert - Mobile Optimized
// ============================================
const ValidationAlert = ({ errors, type = 'error' }) => {
  if (!errors || errors.length === 0) return null;

  const bgColor = type === 'error' ? 'bg-red-500/10' : 'bg-amber-500/10';
  const borderColor = type === 'error' ? 'border-red-500/30' : 'border-amber-500/30';
  const textColor = type === 'error' ? 'text-red-400' : 'text-amber-400';
  const icon = type === 'error' ? '❌' : '⚠️';

  return (
    <div className={`${bgColor} ${borderColor} border-l-4 p-3 rounded mb-3 text-sm`}>
      <div className={`font-semibold ${textColor} mb-1 flex items-center gap-2`}>
        <span className="text-lg">{icon}</span>
        <span>{type === 'error' ? 'Errori di validazione' : 'Attenzione'}</span>
      </div>
      <ul className={`${textColor} list-disc list-inside space-y-1 ml-6`}>
        {errors.map((error, idx) => (
          <li key={idx}>{error}</li>
        ))}
      </ul>
    </div>
  );
};

// ============================================
// COMPONENTE: SaveIndicator - Mobile Compact
// ============================================
const SaveIndicator = ({ isSaving, lastSaved, hasUnsavedChanges }) => {
  const formatRelativeTime = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'ora';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m fa`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h fa`;
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      {isSaving && (
        <div className="flex items-center gap-1.5 text-blue-400">
          <div className="animate-spin">⏳</div>
          <span>Salvo...</span>
        </div>
      )}
      {!isSaving && lastSaved && (
        <div className="text-green-400 flex items-center gap-1">
          <span>✓</span>
          <span>{formatRelativeTime(lastSaved)}</span>
        </div>
      )}
      {hasUnsavedChanges && !isSaving && <div className="text-amber-400">●</div>}
    </div>
  );
};

// ============================================
// COMPONENTE: Bottom Sheet Modal per editing fasce orarie
// ============================================
function TimeSlotBottomSheet({ isOpen, onClose, slot, onSave, T, maxPlayers = 4 }) {
  const [editedSlot, setEditedSlot] = useState(slot || {});

  const pad2 = (n) => String(n).padStart(2, '0');
  const toTime = (s = '09:00') => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(s).trim());
    if (!m) return '09:00';
    const hh = Math.min(23, Math.max(0, Number(m[1] || 0)));
    const mm = Math.min(59, Math.max(0, Number(m[2] || 0)));
    return `${pad2(hh)}:${pad2(mm)}`;
  };

  const perPlayer90 = (eurPerHour) => {
    const total = (Number(eurPerHour) || 0) * 1.5;
    const players = Math.max(1, Number(maxPlayers) || 4);
    return euro2(total / players);
  };

  const handleSave = () => {
    onSave(editedSlot);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Bottom Sheet */}
      <div className="relative w-full sm:max-w-2xl bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-bold">
            {slot?.id ? '✏️ Modifica Fascia' : '➕ Nuova Fascia'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl w-10 h-10 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-6">
            {/* Nome Fascia */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${T.subtext}`}>
                📝 Nome Fascia
              </label>
              <input
                value={editedSlot.label || ''}
                onChange={(e) => setEditedSlot({ ...editedSlot, label: e.target.value })}
                className={`${T.input} w-full text-lg`}
                placeholder="Es. Mattutina, Peak, Serale"
              />
            </div>

            {/* Prezzo */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${T.subtext}`}>
                💰 Prezzo (€/ora)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={editedSlot.eurPerHour ?? 0}
                  onChange={(e) =>
                    setEditedSlot({ ...editedSlot, eurPerHour: Number(e.target.value) || 0 })
                  }
                  className={`${T.input} w-full text-2xl font-bold pr-12`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  €
                </span>
              </div>

              {/* Preview Prezzo per giocatore */}
              <div className="mt-3 p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border-2 border-emerald-200 dark:border-emerald-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-emerald-700 dark:text-emerald-300">
                    90min x {maxPlayers} {maxPlayers === 1 ? 'giocatore' : 'giocatori'}
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {perPlayer90(editedSlot.eurPerHour)}€
                  </div>
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 text-right mt-1">
                  per giocatore
                </div>
              </div>
            </div>

            {/* Orari */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${T.subtext}`}>
                🕐 Orario Fascia
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Da</label>
                  <input
                    type="time"
                    value={toTime(editedSlot.from)}
                    onChange={(e) => setEditedSlot({ ...editedSlot, from: toTime(e.target.value) })}
                    className={`${T.input} w-full text-lg`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">A</label>
                  <input
                    type="time"
                    value={toTime(editedSlot.to)}
                    onChange={(e) => setEditedSlot({ ...editedSlot, to: toTime(e.target.value) })}
                    className={`${T.input} w-full text-lg`}
                  />
                </div>
              </div>
            </div>

            {/* Giorni Attivi */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${T.subtext}`}>
                📅 Giorni Attivi
              </label>
              <DayTogglesLarge
                value={Array.isArray(editedSlot.days) ? editedSlot.days : []}
                onChange={(days) => setEditedSlot({ ...editedSlot, days })}
                T={T}
              />
            </div>

            {/* Badge Promo */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-700">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!editedSlot.isPromo}
                  onChange={(e) => setEditedSlot({ ...editedSlot, isPromo: e.target.checked })}
                  className="w-6 h-6 text-yellow-600 rounded-lg focus:ring-yellow-500"
                />
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    🏷️ Fascia Promozionale
                    {editedSlot.isPromo && (
                      <span className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full font-bold">
                        PROMO
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Evidenzia questa fascia con un badge speciale
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 px-6 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              ✓ Salva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: Day Toggles Large (Mobile-Friendly)
// ============================================
function DayTogglesLarge({ value = [], onChange, T }) {
  const days = [
    { short: 'D', full: 'Dom', index: 0 },
    { short: 'L', full: 'Lun', index: 1 },
    { short: 'M', full: 'Mar', index: 2 },
    { short: 'M', full: 'Mer', index: 3 },
    { short: 'G', full: 'Gio', index: 4 },
    { short: 'V', full: 'Ven', index: 5 },
    { short: 'S', full: 'Sab', index: 6 },
  ];

  const toggle = (idx) => {
    const has = value.includes(idx);
    onChange(has ? value.filter((d) => d !== idx) : [...value, idx].sort((a, b) => a - b));
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d) => (
        <button
          type="button"
          key={d.index}
          onClick={() => toggle(d.index)}
          className={`aspect-square rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center ${
            value.includes(d.index)
              ? 'bg-emerald-500 text-white shadow-lg scale-105'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
          }`}
        >
          <span className="text-base sm:hidden">{d.short}</span>
          <span className="text-xs hidden sm:block">{d.full}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================
// COMPONENTE: Compact Time Slot Card
// ============================================
function CompactTimeSlotCard({ slot, onEdit, onRemove, T, maxPlayers }) {
  const perPlayer90 = (eurPerHour) => {
    const total = (Number(eurPerHour) || 0) * 1.5;
    const players = Math.max(1, Number(maxPlayers) || 4);
    return euro2(total / players);
  };

  const days = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];
  const activeDays = (slot.days || []).map((i) => days[i]).join('');

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-2 border-gray-200 dark:border-gray-700">
      {/* Badge Promo */}
      {slot.isPromo && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          🏷️ PROMO
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Info principale */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-lg mb-1 truncate">{slot.label || 'Fascia senza nome'}</div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>
              🕐 {slot.from} - {slot.to}
            </span>
            <span>•</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {perPlayer90(slot.eurPerHour)}€/p
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1">
            {activeDays ? (
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                📅 {activeDays}
              </span>
            ) : (
              <span className="text-xs text-gray-400">Nessun giorno attivo</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onEdit}
            className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            title="Modifica"
          >
            ✏️
          </button>
          <button
            onClick={onRemove}
            className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            title="Elimina"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: Court Card Mobile-Optimized con Tab System
// ============================================
const MobileCourtCard = ({
  court,
  position,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  confirm,
  T,
  courtTypes = ['Indoor', 'Outdoor', 'Covered'],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'slots'
  const [editingSlot, setEditingSlot] = useState(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  // Rilevazione sovrapposizioni
  const timeSlotOverlaps = useMemo(() => {
    return detectTimeSlotOverlaps(court.timeSlots || []);
  }, [court.timeSlots]);

  const addTimeSlot = () => {
    const newSlot = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: 'Nuova fascia',
      eurPerHour: 25,
      from: '08:00',
      to: '12:00',
      days: [1, 2, 3, 4, 5],
    };
    setEditingSlot(newSlot);
    setShowBottomSheet(true);
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setShowBottomSheet(true);
  };

  const handleSaveSlot = (updatedSlot) => {
    const existingIndex = (court.timeSlots || []).findIndex((s) => s.id === updatedSlot.id);

    if (existingIndex >= 0) {
      // Update existing
      const updatedSlots = (court.timeSlots || []).map((slot, index) =>
        index === existingIndex ? updatedSlot : slot
      );
      onUpdate({ timeSlots: updatedSlots });
    } else {
      // Add new
      onUpdate({ timeSlots: [...(court.timeSlots || []), updatedSlot] });
    }
  };

  const handleRemoveSlot = async (slotIndex) => {
    const confirmed = await confirm({
      title: 'Elimina Fascia Oraria',
      message: 'Eliminare questa fascia oraria?',
      variant: 'danger',
      confirmText: 'Elimina',
      cancelText: 'Annulla',
    });
    if (!confirmed) return;
    const updatedSlots = (court.timeSlots || []).filter((_, index) => index !== slotIndex);
    onUpdate({ timeSlots: updatedSlots });
  };

  return (
    <>
      <div className={`rounded-2xl ${T.border} ${T.cardBg} overflow-hidden shadow-lg`}>
        {/* Header - Sempre visibile */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-3xl">🎾</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xl truncate">{court.name}</div>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span
                    className={`text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium`}
                  >
                    Pos. {position}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300`}
                  >
                    {court.courtType}
                  </span>
                  {court.hasHeating && (
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
                      🔥 Riscald.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                className={`p-2 rounded-lg text-xl transition-all ${
                  isFirst
                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isFirst) onMoveUp();
                }}
                disabled={isFirst}
              >
                ⬆️
              </button>
              <button
                type="button"
                className={`p-2 rounded-lg text-xl transition-all ${
                  isLast
                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isLast) onMoveDown();
                }}
                disabled={isLast}
              >
                ⬇️
              </button>
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              isExpanded
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {isExpanded ? '📝 Chiudi Configurazione' : '⚙️ Configura Campo'}
          </button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t-2 border-gray-200 dark:border-gray-700">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-4 px-4 font-semibold transition-all ${
                  activeTab === 'info'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>⚙️</span>
                  <span className="hidden sm:inline">Info Base</span>
                  <span className="sm:hidden">Info</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('slots')}
                className={`flex-1 py-4 px-4 font-semibold transition-all ${
                  activeTab === 'slots'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>🕐</span>
                  <span className="hidden sm:inline">Fasce Orarie</span>
                  <span className="sm:hidden">Fasce</span>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full ml-1">
                    {(court.timeSlots || []).length}
                  </span>
                </div>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {/* TAB: Info Base */}
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${T.subtext}`}>
                      📝 Nome Campo
                    </label>
                    <input
                      value={court.name || ''}
                      onChange={(e) => onUpdate({ name: e.target.value })}
                      className={`${T.input} w-full text-lg`}
                      placeholder="Es. Campo 1 - Centrale"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${T.subtext}`}>
                        🏓 Tipologia
                      </label>
                      <select
                        value={court.courtType || 'Indoor'}
                        onChange={(e) => onUpdate({ courtType: e.target.value })}
                        className={`${T.input} w-full`}
                      >
                        {courtTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${T.subtext}`}>
                        👥 Max Giocatori
                      </label>
                      <select
                        value={court.maxPlayers || 4}
                        onChange={(e) => onUpdate({ maxPlayers: Number(e.target.value) })}
                        className={`${T.input} w-full`}
                      >
                        {Array.from({ length: 22 }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Toggle Riscaldamento */}
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-700">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={court.hasHeating || false}
                        onChange={(e) => onUpdate({ hasHeating: e.target.checked })}
                        className="w-6 h-6 text-orange-600 rounded-lg focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          🔥 Riscaldamento Disponibile
                        </div>
                        <div className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                          Abilita il riscaldamento per questo campo
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Pulsante Elimina Campo */}
                  <button
                    onClick={onRemove}
                    className="w-full py-4 bg-red-500 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-red-600 transition-colors"
                  >
                    🗑️ Elimina Campo
                  </button>
                </div>
              )}

              {/* TAB: Fasce Orarie */}
              {activeTab === 'slots' && (
                <div className="space-y-4">
                  {/* Overlap Warning */}
                  {timeSlotOverlaps.length > 0 && (
                    <ValidationAlert
                      type="warning"
                      errors={timeSlotOverlaps.map((overlap) => overlap.message)}
                    />
                  )}

                  {/* Add Button */}
                  <button
                    onClick={addTimeSlot}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all"
                  >
                    ➕ Aggiungi Fascia Oraria
                  </button>

                  {/* Time Slots List */}
                  {(court.timeSlots || []).length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                      <div className="text-4xl mb-3">🕐</div>
                      <div className="font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Nessuna fascia oraria
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-500">
                        Aggiungi almeno una fascia per attivare il campo
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(court.timeSlots || []).map((slot, index) => (
                        <CompactTimeSlotCard
                          key={slot.id || index}
                          slot={slot}
                          onEdit={() => handleEditSlot(slot)}
                          onRemove={() => handleRemoveSlot(index)}
                          T={T}
                          maxPlayers={court.maxPlayers || 4}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sheet Modal */}
      <TimeSlotBottomSheet
        isOpen={showBottomSheet}
        onClose={() => {
          setShowBottomSheet(false);
          setEditingSlot(null);
        }}
        slot={editingSlot}
        onSave={handleSaveSlot}
        T={T}
        maxPlayers={court.maxPlayers || 4}
      />
    </>
  );
};

// ============================================
// COMPONENTE PRINCIPALE: Mobile Courts Manager
// ============================================
export default function AdvancedCourtsManager_Mobile({
  courts = [],
  onChange,
  T,
  courtTypes = ['Indoor', 'Outdoor', 'Covered'],
}) {
  const { showWarning, confirm } = useNotifications();
  const [newCourtName, setNewCourtName] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Safe guards per dati corrotti
  const safeCourts = useMemo(() => {
    if (!Array.isArray(courts)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Courts is not an array, returning empty array');
      }
      return [];
    }

    return courts.map((court) => {
      try {
        return sanitizeCourt(court);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Error sanitizing court:', court, error);
        }
        return {
          id: `error-${Date.now()}-${Math.random()}`,
          name: 'Campo con errori (da ricontrollare)',
          courtType: 'Indoor',
          timeSlots: [],
          hasHeating: false,
          maxPlayers: 4,
        };
      }
    });
  }, [courts]);

  const courtsWithOrder = safeCourts.map((court, index) => ({
    ...court,
    order: court.order || index + 1,
  }));

  const sortedCourts = [...courtsWithOrder].sort((a, b) => {
    const orderA = a.order || 999;
    const orderB = b.order || 999;
    if (orderA !== orderB) return orderA - orderB;
    return (a.name || '').localeCompare(b.name || '');
  });

  const filteredCourts =
    activeFilter === 'all'
      ? sortedCourts
      : sortedCourts.filter((court) => court.courtType === activeFilter);

  const courtTypeCounts = courtTypes.reduce((acc, type) => {
    acc[type] = sortedCourts.filter((court) => court.courtType === type).length;
    return acc;
  }, {});

  const handleAddCourt = () => {
    if (!newCourtName.trim()) return;

    setIsSaving(true);
    setHasUnsavedChanges(false);

    try {
      const maxOrder =
        courtsWithOrder.length > 0 ? Math.max(...courtsWithOrder.map((c) => c.order || 0)) : 0;
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newCourt = {
        id: tempId,
        name: newCourtName.trim(),
        hasHeating: false,
        timeSlots: [],
        order: maxOrder + 1,
        courtType: 'Indoor',
        maxPlayers: 4,
      };

      // Validazione
      const validation = validateCourt(newCourt);
      if (!validation.isValid) {
        showWarning('Errori nel campo:\n' + validation.errors.join('\n'));
        setIsSaving(false);
        return;
      }

      onChange([...courts, newCourt]);
      setNewCourtName('');
      setLastSaved(Date.now());
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error adding court:', error);
      }
      setHasUnsavedChanges(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCourt = (courtIndex, updates) => {
    setIsSaving(true);
    setHasUnsavedChanges(false);

    try {
      const updatedCourts = courts.map((c, index) =>
        index === courtIndex ? { ...c, ...updates } : c
      );

      // Validazione del campo aggiornato
      const updatedCourt = updatedCourts[courtIndex];
      const validation = validateCourt(updatedCourt);

      if (!validation.isValid) {
        showWarning('Errori nel campo:\n' + validation.errors.join('\n'));
        setIsSaving(false);
        setHasUnsavedChanges(true);
        return;
      }

      onChange(updatedCourts);
      setLastSaved(Date.now());
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating court:', error);
      }
      setHasUnsavedChanges(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveCourt = async (courtIndex) => {
    const confirmed = await confirm({
      title: 'Rimuovi Campo',
      message: 'Rimuovere il campo? Tutte le configurazioni saranno perse.',
      variant: 'danger',
      confirmText: 'Rimuovi',
      cancelText: 'Annulla',
    });
    if (!confirmed) return;
    const updatedCourts = courts.filter((_, index) => index !== courtIndex);
    onChange(updatedCourts);
  };

  const moveCourt = (courtId, direction) => {
    const sortedIndex = sortedCourts.findIndex((c) => c.id === courtId);
    if (sortedIndex === -1) return;

    const targetSortedIndex = direction === 'up' ? sortedIndex - 1 : sortedIndex + 1;
    if (targetSortedIndex < 0 || targetSortedIndex >= sortedCourts.length) return;

    const fromCourt = sortedCourts[sortedIndex];
    const toCourt = sortedCourts[targetSortedIndex];

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

  return (
    <div className="space-y-4">
      {/* Header Sticky */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 pb-4 pt-2">
        {/* Title with Save Indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-2xl flex items-center gap-2">🏟️ Gestione Campi</h3>
            <SaveIndicator
              isSaving={isSaving}
              lastSaved={lastSaved}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configura campi, fasce orarie e prezzi
          </p>
        </div>

        {/* Add New Court */}
        <div className={`rounded-2xl ${T.border} ${T.cardBg} p-4 shadow-lg`}>
          <div className="flex gap-3">
            <input
              value={newCourtName}
              onChange={(e) => setNewCourtName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCourt()}
              className={`${T.input} flex-1 text-lg`}
              placeholder="Nome nuovo campo..."
            />
            <button
              onClick={handleAddCourt}
              disabled={!newCourtName.trim()}
              className={`px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              ➕
            </button>
          </div>
        </div>

        {/* Filters */}
        {sortedCourts.length > 0 && (
          <div className="mt-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  activeFilter === 'all'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Tutti ({sortedCourts.length})
              </button>
              {courtTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                    activeFilter === type
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {type} ({courtTypeCounts[type] || 0})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Courts List */}
      <div className="space-y-4 pb-20">
        {filteredCourts.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl">
            <div className="text-6xl mb-4">🏟️</div>
            <h4 className="font-bold text-xl mb-2">
              {activeFilter === 'all' ? 'Nessun campo' : `Nessun campo ${activeFilter}`}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {activeFilter === 'all'
                ? 'Aggiungi il primo campo per iniziare'
                : `Cambia filtro o aggiungi un nuovo campo`}
            </p>
            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold"
              >
                Mostra Tutti
              </button>
            )}
          </div>
        ) : (
          filteredCourts.map((court) => {
            const originalIndex = courts.findIndex((c) => c.id === court.id);
            const sortedIndex = sortedCourts.findIndex((c) => c.id === court.id);

            return (
              <MobileCourtCard
                key={court.id}
                court={court}
                position={court.order || sortedIndex + 1}
                onUpdate={(updates) => handleUpdateCourt(originalIndex, updates)}
                onRemove={() => handleRemoveCourt(originalIndex)}
                onMoveUp={() => moveCourt(court.id, 'up')}
                onMoveDown={() => moveCourt(court.id, 'down')}
                isFirst={sortedIndex === 0}
                isLast={sortedIndex === sortedCourts.length - 1}
                confirm={confirm}
                T={T}
                courtTypes={courtTypes}
              />
            );
          })
        )}
      </div>

      {/* Stats Footer */}
      {sortedCourts.length > 0 && (
        <div className={`rounded-2xl ${T.border} ${T.cardBg} p-6 shadow-lg`}>
          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">📊 Statistiche</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {filteredCourts.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Campi</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {filteredCourts.reduce((sum, c) => sum + (c.timeSlots || []).length, 0)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Fasce</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {filteredCourts.reduce(
                  (sum, c) => sum + (c.timeSlots || []).filter((s) => s.isPromo).length,
                  0
                )}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Promo</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
