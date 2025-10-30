// =============================================
// FILE: src/utils/court-templates.js
// Template Management System for Court Time Slots
// =============================================

/**
 * Template structure for reusable time slot configurations
 * @typedef {Object} CourtTemplate
 * @property {string} id - Unique template identifier
 * @property {string} name - Template display name
 * @property {string} description - Optional description
 * @property {('weekday'|'weekend'|'seasonal'|'custom')} category - Template category
 * @property {Array} timeSlots - Array of time slot configurations
 * @property {number} createdAt - Creation timestamp
 * @property {number} updatedAt - Last update timestamp
 * @property {string} createdBy - User who created template (optional)
 * @property {boolean} isSystem - Whether it's a system preset (non-editable)
 */

// ============================================
// DEFAULT SYSTEM TEMPLATES
// ============================================

export const SYSTEM_TEMPLATES = [
  {
    id: 'template-weekday-standard',
    name: 'Feriale Standard',
    description: 'Lun-Ven, orario continuato 8-23',
    category: 'weekday',
    isSystem: true,
    timeSlots: [
      {
        id: 'slot-1',
        label: 'Mattina',
        days: [1, 2, 3, 4, 5], // Lun-Ven
        from: '08:00',
        to: '12:00',
        eurPerHour: 25,
        isPromo: false,
      },
      {
        id: 'slot-2',
        label: 'Pomeriggio',
        days: [1, 2, 3, 4, 5],
        from: '12:00',
        to: '18:00',
        eurPerHour: 30,
        isPromo: false,
      },
      {
        id: 'slot-3',
        label: 'Sera Premium',
        days: [1, 2, 3, 4, 5],
        from: '18:00',
        to: '23:00',
        eurPerHour: 35,
        isPromo: false,
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'template-weekend-standard',
    name: 'Weekend Standard',
    description: 'Sab-Dom, orario continuato 8-23',
    category: 'weekend',
    isSystem: true,
    timeSlots: [
      {
        id: 'slot-1',
        label: 'Mattina Weekend',
        days: [0, 6], // Dom, Sab
        from: '08:00',
        to: '13:00',
        eurPerHour: 35,
        isPromo: false,
      },
      {
        id: 'slot-2',
        label: 'Pomeriggio Weekend',
        days: [0, 6],
        from: '13:00',
        to: '19:00',
        eurPerHour: 40,
        isPromo: false,
      },
      {
        id: 'slot-3',
        label: 'Sera Weekend',
        days: [0, 6],
        from: '19:00',
        to: '23:00',
        eurPerHour: 38,
        isPromo: false,
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'template-fullweek-uniform',
    name: 'Settimanale Uniforme',
    description: 'Lun-Dom, stesso prezzo per tutti i giorni',
    category: 'custom',
    isSystem: true,
    timeSlots: [
      {
        id: 'slot-1',
        label: 'Tutto il Giorno',
        days: [0, 1, 2, 3, 4, 5, 6],
        from: '08:00',
        to: '23:00',
        eurPerHour: 30,
        isPromo: false,
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'template-summer-extended',
    name: 'Estate Esteso',
    description: 'Orario estivo con apertura anticipata',
    category: 'seasonal',
    isSystem: true,
    timeSlots: [
      {
        id: 'slot-1',
        label: 'Mattina Presto',
        days: [0, 1, 2, 3, 4, 5, 6],
        from: '07:00',
        to: '10:00',
        eurPerHour: 28,
        isPromo: false,
      },
      {
        id: 'slot-2',
        label: 'Giorno',
        days: [0, 1, 2, 3, 4, 5, 6],
        from: '10:00',
        to: '20:00',
        eurPerHour: 32,
        isPromo: false,
      },
      {
        id: 'slot-3',
        label: 'Sera Estate',
        days: [0, 1, 2, 3, 4, 5, 6],
        from: '20:00',
        to: '24:00',
        eurPerHour: 35,
        isPromo: false,
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'template-promo-happy-hour',
    name: 'Happy Hour Promo',
    description: 'Fasce promozionali orario pranzo e tardo pomeriggio',
    category: 'custom',
    isSystem: true,
    timeSlots: [
      {
        id: 'slot-1',
        label: 'Mattina Normale',
        days: [1, 2, 3, 4, 5],
        from: '08:00',
        to: '12:00',
        eurPerHour: 30,
        isPromo: false,
      },
      {
        id: 'slot-2',
        label: 'Pranzo Promo',
        days: [1, 2, 3, 4, 5],
        from: '12:00',
        to: '15:00',
        eurPerHour: 20,
        isPromo: true,
      },
      {
        id: 'slot-3',
        label: 'Pomeriggio Normale',
        days: [1, 2, 3, 4, 5],
        from: '15:00',
        to: '17:00',
        eurPerHour: 30,
        isPromo: false,
      },
      {
        id: 'slot-4',
        label: 'Happy Hour',
        days: [1, 2, 3, 4, 5],
        from: '17:00',
        to: '19:00',
        eurPerHour: 22,
        isPromo: true,
      },
      {
        id: 'slot-5',
        label: 'Sera Premium',
        days: [1, 2, 3, 4, 5],
        from: '19:00',
        to: '23:00',
        eurPerHour: 35,
        isPromo: false,
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// ============================================
// TEMPLATE MANAGER CLASS
// ============================================

export class TemplateManager {
  constructor(storageKey = 'court-templates') {
    this.storageKey = storageKey;
    this.templates = this.loadAllTemplates();
  }

  /**
   * Load all templates from localStorage
   * @returns {Array<CourtTemplate>} Array of all templates
   */
  loadAllTemplates() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const customTemplates = stored ? JSON.parse(stored) : [];

      // Merge system templates with custom templates
      return [...SYSTEM_TEMPLATES, ...customTemplates];
    } catch (error) {
      console.error('Error loading templates:', error);
      return [...SYSTEM_TEMPLATES];
    }
  }

  /**
   * Save custom templates to localStorage
   * @param {Array<CourtTemplate>} customTemplates - Custom templates only
   */
  saveCustomTemplates(customTemplates) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(customTemplates));
    } catch (error) {
      console.error('Error saving templates:', error);
      throw new Error('Impossibile salvare i template');
    }
  }

  /**
   * Get all templates
   * @returns {Array<CourtTemplate>}
   */
  getAll() {
    return this.templates;
  }

  /**
   * Get templates by category
   * @param {string} category - Category to filter by
   * @returns {Array<CourtTemplate>}
   */
  getByCategory(category) {
    return this.templates.filter((t) => t.category === category);
  }

  /**
   * Get template by ID
   * @param {string} id - Template ID
   * @returns {CourtTemplate|null}
   */
  getById(id) {
    return this.templates.find((t) => t.id === id) || null;
  }

  /**
   * Create new template
   * @param {Object} templateData - Template data
   * @returns {CourtTemplate} Created template
   */
  createTemplate(templateData) {
    const newTemplate = {
      id: `template-custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: templateData.name || 'Nuovo Template',
      description: templateData.description || '',
      category: templateData.category || 'custom',
      timeSlots: templateData.timeSlots || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isSystem: false,
    };

    // Add to templates array
    this.templates.push(newTemplate);

    // Save custom templates
    const customTemplates = this.templates.filter((t) => !t.isSystem);
    this.saveCustomTemplates(customTemplates);

    return newTemplate;
  }

  /**
   * Update existing template
   * @param {string} id - Template ID
   * @param {Object} updates - Fields to update
   * @returns {CourtTemplate|null} Updated template
   */
  updateTemplate(id, updates) {
    const index = this.templates.findIndex((t) => t.id === id);

    if (index === -1) {
      throw new Error('Template non trovato');
    }

    const template = this.templates[index];

    // Can't update system templates
    if (template.isSystem) {
      throw new Error('I template di sistema non possono essere modificati');
    }

    // Update template
    this.templates[index] = {
      ...template,
      ...updates,
      id: template.id, // Keep original ID
      isSystem: false, // Keep as custom
      updatedAt: Date.now(),
    };

    // Save custom templates
    const customTemplates = this.templates.filter((t) => !t.isSystem);
    this.saveCustomTemplates(customTemplates);

    return this.templates[index];
  }

  /**
   * Delete template
   * @param {string} id - Template ID
   * @returns {boolean} Success status
   */
  deleteTemplate(id) {
    const template = this.templates.find((t) => t.id === id);

    if (!template) {
      throw new Error('Template non trovato');
    }

    if (template.isSystem) {
      throw new Error('I template di sistema non possono essere eliminati');
    }

    // Remove from templates array
    this.templates = this.templates.filter((t) => t.id !== id);

    // Save custom templates
    const customTemplates = this.templates.filter((t) => !t.isSystem);
    this.saveCustomTemplates(customTemplates);

    return true;
  }

  /**
   * Duplicate template
   * @param {string} id - Template ID to duplicate
   * @param {string} newName - Name for duplicated template
   * @returns {CourtTemplate} Duplicated template
   */
  duplicateTemplate(id, newName) {
    const original = this.getById(id);

    if (!original) {
      throw new Error('Template non trovato');
    }

    const duplicated = {
      ...original,
      id: `template-custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newName || `${original.name} (Copia)`,
      isSystem: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.templates.push(duplicated);

    // Save custom templates
    const customTemplates = this.templates.filter((t) => !t.isSystem);
    this.saveCustomTemplates(customTemplates);

    return duplicated;
  }

  /**
   * Apply template to court(s)
   * @param {string} templateId - Template ID
   * @param {Array} courts - Courts to apply template to
   * @param {Function} onChange - Callback with updated courts
   * @returns {Array} Updated courts
   */
  applyTemplateToCoI(templateId, courts, courtIds) {
    const template = this.getById(templateId);

    if (!template) {
      throw new Error('Template non trovato');
    }

    // Clone time slots with new IDs
    const clonedTimeSlots = template.timeSlots.map((slot) => ({
      ...slot,
      id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));

    // Apply to selected courts
    const updatedCourts = courts.map((court) => {
      if (courtIds.includes(court.id)) {
        return {
          ...court,
          timeSlots: clonedTimeSlots,
        };
      }
      return court;
    });

    return updatedCourts;
  }

  /**
   * Export templates to JSON
   * @param {Array<string>} templateIds - Template IDs to export (optional, exports all if empty)
   * @returns {Object} Export data
   */
  exportTemplates(templateIds = []) {
    const templatesToExport =
      templateIds.length > 0
        ? this.templates.filter((t) => templateIds.includes(t.id))
        : this.templates.filter((t) => !t.isSystem); // Only custom templates by default

    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      templates: templatesToExport,
      count: templatesToExport.length,
    };
  }

  /**
   * Import templates from JSON
   * @param {Object} importData - Import data
   * @param {boolean} merge - Whether to merge or replace
   * @returns {Array<CourtTemplate>} Imported templates
   */
  importTemplates(importData, merge = true) {
    if (!importData || !importData.templates || !Array.isArray(importData.templates)) {
      throw new Error('Formato import non valido');
    }

    const importedTemplates = importData.templates.map((t) => ({
      ...t,
      id: `template-imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isSystem: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    if (merge) {
      // Merge with existing
      this.templates = [...this.templates, ...importedTemplates];
    } else {
      // Replace custom templates
      this.templates = [...SYSTEM_TEMPLATES, ...importedTemplates];
    }

    // Save custom templates
    const customTemplates = this.templates.filter((t) => !t.isSystem);
    this.saveCustomTemplates(customTemplates);

    return importedTemplates;
  }

  /**
   * Get template statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    return {
      total: this.templates.length,
      system: this.templates.filter((t) => t.isSystem).length,
      custom: this.templates.filter((t) => !t.isSystem).length,
      byCategory: {
        weekday: this.templates.filter((t) => t.category === 'weekday').length,
        weekend: this.templates.filter((t) => t.category === 'weekend').length,
        seasonal: this.templates.filter((t) => t.category === 'seasonal').length,
        custom: this.templates.filter((t) => t.category === 'custom').length,
      },
    };
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Create template from court's current time slots
 * @param {Object} court - Court object
 * @param {string} templateName - Name for new template
 * @returns {Object} Template data ready to save
 */
export function createTemplateFromCourt(court, templateName) {
  return {
    name: templateName,
    description: `Template creato da ${court.name}`,
    category: 'custom',
    timeSlots: court.timeSlots.map((slot) => ({
      ...slot,
      id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    })),
  };
}

/**
 * Validate template structure
 * @param {Object} template - Template to validate
 * @returns {Object} { isValid, errors }
 */
export function validateTemplate(template) {
  const errors = [];

  if (!template.name || template.name.trim().length === 0) {
    errors.push('Il nome del template è obbligatorio');
  }

  if (!template.timeSlots || !Array.isArray(template.timeSlots)) {
    errors.push('Le fasce orarie devono essere un array');
  }

  if (template.timeSlots && template.timeSlots.length === 0) {
    errors.push('Il template deve avere almeno una fascia oraria');
  }

  // Validate each time slot
  if (template.timeSlots && Array.isArray(template.timeSlots)) {
    template.timeSlots.forEach((slot, index) => {
      if (!slot.from || !slot.to) {
        errors.push(`Fascia ${index + 1}: orari mancanti`);
      }
      if (!slot.days || slot.days.length === 0) {
        errors.push(`Fascia ${index + 1}: nessun giorno selezionato`);
      }
      if (slot.eurPerHour === undefined || slot.eurPerHour < 0) {
        errors.push(`Fascia ${index + 1}: prezzo non valido`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get category display name
 * @param {string} category - Category code
 * @returns {string} Display name
 */
export function getCategoryDisplayName(category) {
  const names = {
    weekday: '📅 Feriale',
    weekend: '🎉 Weekend',
    seasonal: '🌞 Stagionale',
    custom: '✨ Personalizzato',
  };
  return names[category] || category;
}

/**
 * Get category icon
 * @param {string} category - Category code
 * @returns {string} Icon emoji
 */
export function getCategoryIcon(category) {
  const icons = {
    weekday: '📅',
    weekend: '🎉',
    seasonal: '🌞',
    custom: '✨',
  };
  return icons[category] || '📋';
}

// ============================================
// EXPORT DEFAULT INSTANCE
// ============================================

export default new TemplateManager();
