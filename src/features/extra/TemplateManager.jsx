// =============================================
// FILE: src/features/extra/TemplateManager.jsx
// Template Management UI Component
// =============================================
import React, { useState, useEffect } from 'react';
import { useNotifications } from '@contexts/NotificationContext';
import templateManager, {
  createTemplateFromCourt,
  validateTemplate,
  getCategoryDisplayName,
  getCategoryIcon,
} from '@utils/court-templates.js';

// ============================================
// COMPONENTE: Template Library Modal
// ============================================
export function TemplateLibraryModal({ isOpen, onClose, onApply, T }) {
  const { confirm } = useNotifications();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = () => {
    const allTemplates = templateManager.getAll();
    setTemplates(allTemplates);
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', name: 'Tutti', icon: '📋' },
    { id: 'weekday', name: 'Feriale', icon: '📅' },
    { id: 'weekend', name: 'Weekend', icon: '🎉' },
    { id: 'seasonal', name: 'Stagionale', icon: '🌞' },
    { id: 'custom', name: 'Personalizzato', icon: '✨' },
  ];

  const stats = templateManager.getStatistics();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                📚 Libreria Template
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {stats.total} template disponibili ({stats.system} di sistema, {stats.custom}{' '}
                personalizzati)
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:text-gray-300 text-3xl"
            >
              ×
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Cerca template..."
            className={`${T.input} w-full`}
          />
        </div>

        {/* Category Tabs */}
        <div className="px-6 pt-4 border-b border-gray-200 border-gray-700">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <div className="text-xl font-semibold text-gray-400">Nessun template trovato</div>
              <p className="text-sm text-gray-500 mt-2">
                Prova a cambiare categoria o cerca qualcos'altro
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate?.id === template.id}
                  onSelect={() => setSelectedTemplate(template)}
                  onDelete={async (id) => {
                    const confirmed = await confirm({
                      title: 'Elimina Template',
                      message: 'Eliminare questo template?',
                      variant: 'danger',
                      confirmText: 'Elimina',
                      cancelText: 'Annulla',
                    });
                    if (confirmed) {
                      templateManager.deleteTemplate(id);
                      loadTemplates();
                      if (selectedTemplate?.id === id) {
                        setSelectedTemplate(null);
                      }
                    }
                  }}
                  T={T}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 border-gray-700 bg-gray-50 bg-gray-900">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg border border-gray-300 border-gray-600 hover:bg-gray-100 hover:bg-gray-700 font-medium transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={() => {
                if (selectedTemplate) {
                  onApply(selectedTemplate);
                  onClose();
                }
              }}
              disabled={!selectedTemplate}
              className={`px-6 py-3 rounded-lg font-bold text-white transition-colors ${
                selectedTemplate
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              ✨ Applica Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// ============================================
function TemplateCard({ template, isSelected, onSelect, onDelete, T }) {
  const [showDetails, setShowDetails] = useState(false);

  const categoryInfo = {
    weekday: {
      color: 'blue',
      bg: 'bg-blue-100 bg-blue-900',
      text: 'text-blue-700 text-blue-300',
    },
    weekend: {
      color: 'purple',
      bg: 'bg-purple-100 bg-purple-900',
      text: 'text-purple-700 text-purple-300',
    },
    seasonal: {
      color: 'orange',
      bg: 'bg-orange-100 bg-orange-900',
      text: 'text-orange-700 text-orange-300',
    },
    custom: {
      color: 'green',
      bg: 'bg-green-100 bg-green-900',
      text: 'text-green-700 text-green-300',
    },
  };

  const info = categoryInfo[template.category] || categoryInfo.custom;

  return (
    <div
      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50 bg-blue-900/20 shadow-lg'
          : 'border-gray-700 hover:border-gray-600'
      }`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{getCategoryIcon(template.category)}</span>
            <h3 className="font-bold text-lg text-white">{template.name}</h3>
            {template.isSystem && (
              <span className="text-xs px-2 py-1 bg-gray-700 text-gray-400 rounded-full">
                Sistema
              </span>
            )}
          </div>
          {template.description && <p className="text-sm text-gray-400">{template.description}</p>}
        </div>

        {!template.isSystem && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(template.id);
            }}
            className="text-red-500 hover:text-red-700 p-1"
          >
            🗑️
          </button>
        )}
      </div>

      {/* Category Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs px-3 py-1 rounded-full ${info.bg} ${info.text} font-medium`}>
          {getCategoryDisplayName(template.category)}
        </span>
        <span className="text-xs text-gray-500">
          {template.timeSlots.length} {template.timeSlots.length === 1 ? 'fascia' : 'fasce'}
        </span>
      </div>

      {/* Time Slots Summary */}
      <div className="border-t border-gray-700 pt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className="text-xs text-blue-400 hover:underline mb-2"
        >
          {showDetails ? '▼ Nascondi dettagli' : '▶ Mostra dettagli'}
        </button>

        {showDetails && (
          <div className="space-y-2 mt-2">
            {template.timeSlots.map((slot, idx) => (
              <div key={idx} className="text-xs bg-gray-800 p-2 rounded">
                <div className="font-semibold text-white">
                  {slot.label || `Fascia ${idx + 1}`}
                </div>
                <div className="text-gray-400">
                  ⏰ {slot.from} - {slot.to} | 💰 €{slot.eurPerHour}/h
                  {slot.isPromo && <span className="ml-2 text-orange-600">🎁 Promo</span>}
                </div>
                <div className="text-gray-500 text-xs">📅 {formatDays(slot.days)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="mt-3 flex items-center justify-center text-blue-400 font-semibold text-sm">
          ✓ Selezionato
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE: Create Template Modal
// ============================================
export function CreateTemplateModal({ isOpen, onClose, onSave, sourceTimeSlots = [], T }) {
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    category: 'custom',
    timeSlots: sourceTimeSlots,
  });
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (isOpen && sourceTimeSlots.length > 0) {
      setTemplateData((prev) => ({
        ...prev,
        timeSlots: sourceTimeSlots,
      }));
    }
  }, [isOpen, sourceTimeSlots]);

  const handleSave = () => {
    const validation = validateTemplate(templateData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const newTemplate = templateManager.createTemplate(templateData);
    onSave(newTemplate);
    onClose();

    // Reset form
    setTemplateData({
      name: '',
      description: '',
      category: 'custom',
      timeSlots: [],
    });
    setErrors([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 text-white">
                ✨ Crea Nuovo Template
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Salva le fasce orarie attuali come template riutilizzabile
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
        <div className="p-6 space-y-4">
          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 bg-red-900/20 border border-red-200 border-red-800 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 text-red-300 mb-2">
                ❌ Errori di validazione
              </h4>
              <ul className="text-sm text-red-800 text-red-300 list-disc list-inside">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
              Nome Template *
            </label>
            <input
              type="text"
              value={templateData.name}
              onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
              placeholder="es. Weekend Standard, Feriale Inverno..."
              className={`${T.input} w-full`}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
              Descrizione (opzionale)
            </label>
            <textarea
              value={templateData.description}
              onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
              placeholder="Descrizione breve del template..."
              rows={3}
              className={`${T.input} w-full`}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
              Categoria
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'weekday', name: 'Feriale', icon: '📅' },
                { id: 'weekend', name: 'Weekend', icon: '🎉' },
                { id: 'seasonal', name: 'Stagionale', icon: '🌞' },
                { id: 'custom', name: 'Personalizzato', icon: '✨' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setTemplateData({ ...templateData, category: cat.id })}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    templateData.category === cat.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
              Fasce Orarie Incluse ({templateData.timeSlots.length})
            </label>
            <div className="bg-gray-50 bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto">
              {templateData.timeSlots.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nessuna fascia oraria disponibile
                </p>
              ) : (
                <div className="space-y-2">
                  {templateData.timeSlots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="text-sm bg-white bg-gray-800 p-3 rounded border border-gray-200 border-gray-700"
                    >
                      <div className="font-semibold text-gray-900 text-white">
                        {slot.label || `Fascia ${idx + 1}`}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        ⏰ {slot.from} - {slot.to} | 💰 €{slot.eurPerHour}/h | 📅{' '}
                        {formatDays(slot.days)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 border-gray-700 bg-gray-50 bg-gray-900">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg border border-gray-300 border-gray-600 hover:bg-gray-100 hover:bg-gray-700 font-medium transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
            >
              💾 Salva Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// ============================================

function formatDays(days) {
  if (!days || days.length === 0) return 'Nessun giorno';

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

  if (days.length === 7) return 'Tutti i giorni';
  if (days.length === 5 && days.every((d) => d >= 1 && d <= 5)) return 'Lun-Ven';
  if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Sab-Dom';

  return days.map((d) => dayNames[d]).join(', ');
}

export default TemplateLibraryModal;
