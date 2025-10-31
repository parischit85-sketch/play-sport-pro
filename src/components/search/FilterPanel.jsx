/**
 * FilterPanel Component - CHK-307
 *
 * Advanced multi-criteria filtering panel.
 * Features:
 * - Multi-select filters
 * - Range filters (price, date)
 * - Toggle filters (boolean)
 * - Save filter presets
 * - Clear all filters
 * - Active filter badges
 */

import React, { useState } from 'react';
import { Filter, X, Save, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

const FilterPanel = ({
  filters = {},
  onFiltersChange,
  availableFilters = {},
  entityType = 'courts',
}) => {
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    price: true,
    date: true,
    status: true,
  });

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Update filter
  const updateFilter = (key, value) => {
    const newFilters = { ...filters };

    if (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }

    onFiltersChange(newFilters);
  };

  // Toggle multi-select value
  const toggleMultiSelect = (key, value) => {
    const current = filters[key] || [];
    const newValue = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    updateFilter(key, newValue.length > 0 ? newValue : null);
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({});
  };

  // Count active filters
  const activeFiltersCount = Object.keys(filters).length;

  // Render filter section
  const renderFilterSection = (title, key, options, type = 'multiselect') => {
    const isExpanded = expandedSections[key];

    return (
      <div className="border-b border-gray-200 border-gray-700 last:border-b-0">
        <button
          onClick={() => toggleSection(key)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 hover:bg-gray-700 transition-colors"
        >
          <span className="font-semibold text-gray-900 text-white">
            {title}
            {filters[key] && (
              <span className="ml-2 px-2 py-0.5 bg-blue-900 text-blue-200 text-xs rounded-full">
                {Array.isArray(filters[key]) ? filters[key].length : '1'}
              </span>
            )}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {isExpanded && (
          <div className="px-4 py-3 space-y-2">
            {type === 'multiselect' &&
              options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 hover:bg-gray-700 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={(filters[key] || []).includes(option.value)}
                    onChange={() => toggleMultiSelect(key, option.value)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 text-gray-300 flex-1">{option.label}</span>
                  {option.count !== undefined && (
                    <span className="text-xs text-gray-500 text-gray-400">({option.count})</span>
                  )}
                </label>
              ))}

            {type === 'range' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 text-gray-400 mb-1 block">Min</label>
                  <input
                    type="number"
                    value={filters[key]?.min || ''}
                    onChange={(e) =>
                      updateFilter(key, {
                        ...filters[key],
                        min: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder={options.minPlaceholder || '0'}
                    className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg bg-white bg-gray-800 text-gray-900 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 text-gray-400 mb-1 block">Max</label>
                  <input
                    type="number"
                    value={filters[key]?.max || ''}
                    onChange={(e) =>
                      updateFilter(key, {
                        ...filters[key],
                        max: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder={options.maxPlaceholder || '1000'}
                    className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg bg-white bg-gray-800 text-gray-900 text-white"
                  />
                </div>
              </div>
            )}

            {type === 'toggle' && (
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700 text-gray-300">{options.label}</span>
                <input
                  type="checkbox"
                  checked={filters[key] || false}
                  onChange={(e) => updateFilter(key, e.target.checked || null)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </label>
            )}
          </div>
        )}
      </div>
    );
  };

  // Filter configurations by entity type
  const filterConfigs = {
    courts: [
      {
        title: 'Tipo Campo',
        key: 'type',
        type: 'multiselect',
        options: availableFilters.types || [
          { value: 'tennis', label: 'Tennis', count: 0 },
          { value: 'calcio', label: 'Calcio', count: 0 },
          { value: 'padel', label: 'Padel', count: 0 },
          { value: 'basket', label: 'Basket', count: 0 },
        ],
      },
      {
        title: 'Superficie',
        key: 'surface',
        type: 'multiselect',
        options: availableFilters.surfaces || [
          { value: 'terra', label: 'Terra battuta', count: 0 },
          { value: 'erba', label: 'Erba', count: 0 },
          { value: 'cemento', label: 'Cemento', count: 0 },
          { value: 'sintetico', label: 'Sintetico', count: 0 },
        ],
      },
      {
        title: 'Prezzo',
        key: 'price',
        type: 'range',
        options: {
          minPlaceholder: '€0',
          maxPlaceholder: '€100',
        },
      },
      {
        title: 'Coperto',
        key: 'covered',
        type: 'toggle',
        options: {
          label: 'Solo campi coperti',
        },
      },
    ],
    bookings: [
      {
        title: 'Stato',
        key: 'status',
        type: 'multiselect',
        options: availableFilters.statuses || [
          { value: 'confirmed', label: 'Confermato', count: 0 },
          { value: 'pending', label: 'In attesa', count: 0 },
          { value: 'cancelled', label: 'Cancellato', count: 0 },
          { value: 'completed', label: 'Completato', count: 0 },
        ],
      },
      {
        title: 'Prezzo',
        key: 'price',
        type: 'range',
        options: {
          minPlaceholder: '€0',
          maxPlaceholder: '€200',
        },
      },
    ],
    users: [
      {
        title: 'Ruolo',
        key: 'role',
        type: 'multiselect',
        options: availableFilters.roles || [
          { value: 'user', label: 'Utente', count: 0 },
          { value: 'club_admin', label: 'Admin Club', count: 0 },
          { value: 'instructor', label: 'Istruttore', count: 0 },
          { value: 'admin', label: 'Admin', count: 0 },
        ],
      },
      {
        title: 'Stato Account',
        key: 'active',
        type: 'toggle',
        options: {
          label: 'Solo account attivi',
        },
      },
    ],
  };

  const currentFilters = filterConfigs[entityType] || filterConfigs.courts;

  return (
    <div className="bg-white bg-gray-800 rounded-xl shadow-lg border border-gray-200 border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 bg-gray-900 border-b border-gray-200 border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600 text-gray-400" />
          <h3 className="font-bold text-gray-900 text-white">Filtri</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-medium">
              {activeFiltersCount}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 text-red-400 hover:bg-red-50 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="max-h-[500px] overflow-y-auto">
        {currentFilters.map((config) =>
          renderFilterSection(config.title, config.key, config.options, config.type)
        )}
      </div>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="px-4 py-3 bg-blue-50 bg-blue-900/20 border-t border-blue-200 border-blue-800">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => (
              <div
                key={key}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-sm"
              >
                <span className="font-medium capitalize">{key}:</span>
                <span>
                  {Array.isArray(value)
                    ? value.join(', ')
                    : typeof value === 'object'
                      ? `${value.min || '?'} - ${value.max || '?'}`
                      : value.toString()}
                </span>
                <button
                  onClick={() => updateFilter(key, null)}
                  className="hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
