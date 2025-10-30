/**
 * Search Utilities - CHK-307
 *
 * Advanced search algorithms and indexing.
 * Features:
 * - Fuzzy matching with Fuse.js
 * - Multi-field search
 * - Search history management
 * - Saved searches
 * - Search result ranking
 */

import Fuse from 'fuse.js';

// Search configuration for different entity types
export const SEARCH_CONFIGS = {
  courts: {
    keys: [
      { name: 'name', weight: 0.4 },
      { name: 'type', weight: 0.2 },
      { name: 'surface', weight: 0.1 },
      { name: 'description', weight: 0.2 },
      { name: 'clubName', weight: 0.1 },
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
  },
  bookings: {
    keys: [
      { name: 'userName', weight: 0.3 },
      { name: 'courtName', weight: 0.3 },
      { name: 'clubName', weight: 0.2 },
      { name: 'status', weight: 0.1 },
      { name: 'bookingId', weight: 0.1 },
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
  },
  users: {
    keys: [
      { name: 'displayName', weight: 0.4 },
      { name: 'email', weight: 0.3 },
      { name: 'phone', weight: 0.2 },
      { name: 'city', weight: 0.1 },
    ],
    threshold: 0.3,
    includeScore: true,
    includeMatches: true,
  },
  clubs: {
    keys: [
      { name: 'name', weight: 0.5 },
      { name: 'city', weight: 0.2 },
      { name: 'address', weight: 0.2 },
      { name: 'description', weight: 0.1 },
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
  },
};

// Fuzzy search with Fuse.js
export class AdvancedSearch {
  constructor(data, entityType = 'courts') {
    this.entityType = entityType;
    this.data = data;
    this.config = SEARCH_CONFIGS[entityType] || SEARCH_CONFIGS.courts;
    this.fuse = new Fuse(data, this.config);
  }

  // Search with query string
  search(query, filters = {}) {
    if (!query || query.trim() === '') {
      return this.applyFilters(this.data, filters);
    }

    const results = this.fuse.search(query);
    const items = results.map((result) => ({
      ...result.item,
      _searchScore: result.score,
      _matches: result.matches,
    }));

    return this.applyFilters(items, filters);
  }

  // Apply additional filters
  applyFilters(items, filters) {
    let filtered = [...items];

    // Generic filter application
    Object.keys(filters).forEach((key) => {
      const filterValue = filters[key];

      if (filterValue === null || filterValue === undefined || filterValue === '') {
        return;
      }

      // Array filters (multi-select)
      if (Array.isArray(filterValue) && filterValue.length > 0) {
        filtered = filtered.filter((item) => {
          const itemValue = item[key];
          return filterValue.includes(itemValue);
        });
      }
      // Range filters (e.g., price, date)
      else if (
        typeof filterValue === 'object' &&
        (filterValue.min !== undefined || filterValue.max !== undefined)
      ) {
        filtered = filtered.filter((item) => {
          const itemValue = item[key];
          const min = filterValue.min !== undefined ? filterValue.min : -Infinity;
          const max = filterValue.max !== undefined ? filterValue.max : Infinity;
          return itemValue >= min && itemValue <= max;
        });
      }
      // Exact match
      else {
        filtered = filtered.filter((item) => item[key] === filterValue);
      }
    });

    return filtered;
  }

  // Update data
  updateData(newData) {
    this.data = newData;
    this.fuse = new Fuse(newData, this.config);
  }
}

// Search history management
const SEARCH_HISTORY_KEY = 'playAndSport_searchHistory';
const MAX_HISTORY_ITEMS = 20;

export const searchHistory = {
  // Get search history
  getHistory: () => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading search history:', error);
      return [];
    }
  },

  // Add search to history
  addToHistory: (query, entityType = 'all', resultsCount = 0) => {
    if (!query || query.trim() === '') return;

    try {
      const history = searchHistory.getHistory();

      // Remove duplicate
      const filtered = history.filter((item) => item.query !== query);

      // Add new item at beginning
      const newHistory = [
        {
          query: query.trim(),
          entityType,
          resultsCount,
          timestamp: new Date().toISOString(),
        },
        ...filtered,
      ].slice(0, MAX_HISTORY_ITEMS);

      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  },

  // Clear history
  clearHistory: () => {
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  },

  // Remove single item
  removeItem: (query) => {
    try {
      const history = searchHistory.getHistory();
      const filtered = history.filter((item) => item.query !== query);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing history item:', error);
    }
  },
};

// Saved searches management
const SAVED_SEARCHES_KEY = 'playAndSport_savedSearches';
const MAX_SAVED_SEARCHES = 10;

export const savedSearches = {
  // Get saved searches
  getSaved: () => {
    try {
      const stored = localStorage.getItem(SAVED_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading saved searches:', error);
      return [];
    }
  },

  // Save search
  save: (name, query, filters = {}, entityType = 'all') => {
    if (!name || !query) return false;

    try {
      const saved = savedSearches.getSaved();

      // Check if name already exists
      const exists = saved.some((item) => item.name === name);
      if (exists) return false;

      // Add new saved search
      const newSaved = [
        {
          name: name.trim(),
          query: query.trim(),
          filters,
          entityType,
          createdAt: new Date().toISOString(),
        },
        ...saved,
      ].slice(0, MAX_SAVED_SEARCHES);

      localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(newSaved));
      return true;
    } catch (error) {
      console.error('Error saving search:', error);
      return false;
    }
  },

  // Delete saved search
  delete: (name) => {
    try {
      const saved = savedSearches.getSaved();
      const filtered = saved.filter((item) => item.name !== name);
      localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting saved search:', error);
      return false;
    }
  },

  // Update saved search
  update: (name, updates) => {
    try {
      const saved = savedSearches.getSaved();
      const updated = saved.map((item) =>
        item.name === name ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      );
      localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error updating saved search:', error);
      return false;
    }
  },
};

// Search suggestions based on history and common queries
export const getSearchSuggestions = (query, entityType = 'all') => {
  const history = searchHistory.getHistory();

  // Filter history by entity type and query prefix
  const filtered = history
    .filter((item) => {
      if (entityType !== 'all' && item.entityType !== entityType) return false;
      return item.query.toLowerCase().startsWith(query.toLowerCase());
    })
    .slice(0, 5);

  // Common suggestions by entity type
  const commonSuggestions = {
    courts: ['campo tennis', 'campo calcio', 'campo padel', 'campo basket'],
    bookings: ['prenotazioni oggi', 'prenotazioni settimana', 'prenotazioni confermate'],
    users: ['utenti attivi', 'nuovi utenti', 'utenti admin'],
    clubs: ['club milano', 'club roma', 'club disponibili'],
  };

  const common = commonSuggestions[entityType] || [];
  const commonFiltered = common.filter((s) => s.toLowerCase().startsWith(query.toLowerCase()));

  // Combine and deduplicate
  const allSuggestions = [...filtered.map((h) => h.query), ...commonFiltered];
  return [...new Set(allSuggestions)].slice(0, 8);
};

// Highlight matches in text
export const highlightMatches = (text, matches = []) => {
  if (!matches || matches.length === 0) return text;

  let highlighted = text;
  const sortedMatches = matches.sort((a, b) => b.indices[0][0] - a.indices[0][0]);

  sortedMatches.forEach((match) => {
    match.indices.forEach(([start, end]) => {
      const before = highlighted.slice(0, start);
      const matchText = highlighted.slice(start, end + 1);
      const after = highlighted.slice(end + 1);
      highlighted = `${before}<mark class="bg-yellow-200 dark:bg-yellow-700 px-1 rounded">${matchText}</mark>${after}`;
    });
  });

  return highlighted;
};

// Search result ranking
export const rankResults = (results, options = {}) => {
  const { prioritizeRecent = false, boostFavorites = false } = options;

  return results.sort((a, b) => {
    // Primary sort by search score (lower is better with Fuse.js)
    const scoreDiff = (a._searchScore || 0) - (b._searchScore || 0);
    if (Math.abs(scoreDiff) > 0.1) return scoreDiff;

    // Secondary: favorites
    if (boostFavorites && a.isFavorite !== b.isFavorite) {
      return a.isFavorite ? -1 : 1;
    }

    // Tertiary: recent items
    if (prioritizeRecent && a.createdAt && b.createdAt) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    return 0;
  });
};

export default AdvancedSearch;
