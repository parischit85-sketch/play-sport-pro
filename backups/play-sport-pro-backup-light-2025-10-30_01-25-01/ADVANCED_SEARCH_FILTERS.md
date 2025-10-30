# Advanced Search & Filters - CHK-307 ✅

## Overview

Comprehensive search and filtering system with fuzzy matching, multi-criteria filters, search history, and saved searches. Provides powerful data discovery capabilities across courts, bookings, users, and clubs.

---

## 🎯 Features Implemented

### 1. ✅ Fuzzy Search with Fuse.js
**File:** `src/lib/searchUtils.js` (350+ lines)

**Features:**
- **Fuzzy Matching:** Tolerates typos and spelling variations
- **Multi-Field Search:** Search across multiple fields simultaneously
- **Weighted Scoring:** Prioritize important fields (e.g., name > description)
- **Configurable Threshold:** Adjust match sensitivity (0-1)
- **Match Highlighting:** Show which parts matched the query

**Search Configurations:**

#### Courts
```javascript
{
  name: 0.4,          // Most important
  type: 0.2,
  surface: 0.1,
  description: 0.2,
  clubName: 0.1,
}
```

#### Bookings
```javascript
{
  userName: 0.3,
  courtName: 0.3,
  clubName: 0.2,
  status: 0.1,
  bookingId: 0.1,
}
```

#### Users
```javascript
{
  displayName: 0.4,
  email: 0.3,
  phone: 0.2,
  city: 0.1,
}
```

#### Clubs
```javascript
{
  name: 0.5,
  city: 0.2,
  address: 0.2,
  description: 0.1,
}
```

### 2. ✅ AdvancedSearch Class
**Usage:**
```javascript
import AdvancedSearch from '@lib/searchUtils';

const searcher = new AdvancedSearch(courtsData, 'courts');

// Simple search
const results = searcher.search('tennis');

// Search with filters
const filtered = searcher.search('campo', {
  type: ['tennis', 'padel'],
  price: { min: 10, max: 50 },
  covered: true,
});

// Update data dynamically
searcher.updateData(newCourtsData);
```

### 3. ✅ Search History
**File:** `src/lib/searchUtils.js`

**Features:**
- Automatic saving of searches
- Last 20 searches stored
- De-duplication (no repeated entries)
- Timestamp tracking
- Manual removal of individual items
- Clear all history

**API:**
```javascript
import { searchHistory } from '@lib/searchUtils';

// Add to history
searchHistory.addToHistory('campo tennis', 'courts', 5);

// Get history
const history = searchHistory.getHistory();
// Returns: [{ query, entityType, resultsCount, timestamp }]

// Remove item
searchHistory.removeItem('campo tennis');

// Clear all
searchHistory.clearHistory();
```

### 4. ✅ Saved Searches
**File:** `src/lib/searchUtils.js`

**Features:**
- Save frequently used searches
- Include filters in saved search
- Name-based retrieval
- Update existing saved searches
- Maximum 10 saved searches

**API:**
```javascript
import { savedSearches } from '@lib/searchUtils';

// Save search
savedSearches.save(
  'Campi Tennis Milano',
  'tennis',
  { city: ['Milano'], price: { max: 30 } },
  'courts'
);

// Get all saved
const saved = savedSearches.getSaved();

// Delete saved search
savedSearches.delete('Campi Tennis Milano');

// Update saved search
savedSearches.update('Campi Tennis Milano', {
  filters: { city: ['Milano', 'Roma'] },
});
```

### 5. ✅ AdvancedSearchBar Component
**File:** `src/components/search/AdvancedSearchBar.jsx` (200+ lines)

**Features:**
- **Real-time Autocomplete:** Suggestions as you type (min 2 chars)
- **Keyboard Navigation:** Arrow keys, Enter, Escape
- **Search History:** Shows recent searches when empty
- **Clear Button:** Quick reset
- **Auto-focus:** Optional focus on mount
- **Click Outside:** Close suggestions on blur

**Props:**
```javascript
<AdvancedSearchBar
  onSearch={(query) => handleSearch(query)}
  placeholder="Cerca campi, utenti, prenotazioni..."
  entityType="courts"  // courts, bookings, users, clubs, all
  autoFocus={true}
/>
```

**Keyboard Shortcuts:**
- `↓` Arrow Down - Next suggestion
- `↑` Arrow Up - Previous suggestion
- `Enter` - Execute search (or select suggestion)
- `Escape` - Close suggestions

### 6. ✅ FilterPanel Component
**File:** `src/components/search/FilterPanel.jsx` (320+ lines)

**Features:**
- **Multi-Select Filters:** Check multiple options (type, surface, etc.)
- **Range Filters:** Min/max for price, date ranges
- **Toggle Filters:** Boolean filters (covered, active, etc.)
- **Expandable Sections:** Collapse/expand filter groups
- **Active Filter Badges:** Visual summary of active filters
- **Quick Reset:** Clear all filters with one click
- **Filter Counts:** Show number of results per option

**Filter Types:**

#### Multi-Select (Checkbox)
```javascript
{
  title: 'Tipo Campo',
  key: 'type',
  type: 'multiselect',
  options: [
    { value: 'tennis', label: 'Tennis', count: 15 },
    { value: 'padel', label: 'Padel', count: 8 },
  ],
}
```

#### Range (Min/Max)
```javascript
{
  title: 'Prezzo',
  key: 'price',
  type: 'range',
  options: {
    minPlaceholder: '€0',
    maxPlaceholder: '€100',
  },
}
```

#### Toggle (Boolean)
```javascript
{
  title: 'Coperto',
  key: 'covered',
  type: 'toggle',
  options: {
    label: 'Solo campi coperti',
  },
}
```

### 7. ✅ Search Suggestions
**File:** `src/lib/searchUtils.js`

**Features:**
- History-based suggestions
- Common query suggestions
- Prefix matching
- Entity-specific suggestions

**Common Suggestions:**
- **Courts:** "campo tennis", "campo calcio", "campo padel"
- **Bookings:** "prenotazioni oggi", "prenotazioni settimana"
- **Users:** "utenti attivi", "nuovi utenti"
- **Clubs:** "club milano", "club roma"

### 8. ✅ Result Ranking
**File:** `src/lib/searchUtils.js`

**Features:**
- Primary: Search score (Fuse.js)
- Secondary: Favorites boost
- Tertiary: Recent items first

**Usage:**
```javascript
import { rankResults } from '@lib/searchUtils';

const ranked = rankResults(searchResults, {
  prioritizeRecent: true,
  boostFavorites: true,
});
```

### 9. ✅ Match Highlighting
**File:** `src/lib/searchUtils.js`

**Features:**
- Highlights matched text in results
- Yellow background marker
- Dark mode support

**Usage:**
```javascript
import { highlightMatches } from '@lib/searchUtils';

const highlighted = highlightMatches(text, matches);
// Returns: "Campo <mark>tennis</mark> Milano"
```

---

## 📖 Usage Guide

### Basic Search Implementation

**1. Setup Search:**
```javascript
import AdvancedSearch from '@lib/searchUtils';
import { useState, useEffect } from 'react';

function MyComponent() {
  const [searcher, setSearcher] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Initialize searcher with data
    const search = new AdvancedSearch(courtsData, 'courts');
    setSearcher(search);
  }, [courtsData]);

  const handleSearch = (query, filters = {}) => {
    if (!searcher) return;
    const searchResults = searcher.search(query, filters);
    setResults(searchResults);
  };

  return (
    <AdvancedSearchBar onSearch={handleSearch} />
  );
}
```

**2. Add Filters:**
```javascript
import FilterPanel from '@components/search/FilterPanel';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    // Execute search with both query and filters
    const results = searcher.search(searchQuery, filters);
    setResults(results);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // Re-execute search with new filters
    const results = searcher.search(query, newFilters);
    setResults(results);
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-1">
        <FilterPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          entityType="courts"
        />
      </div>
      <div className="col-span-3">
        <AdvancedSearchBar onSearch={handleSearch} />
        <SearchResults results={results} />
      </div>
    </div>
  );
}
```

### Advanced Features

**Save Search:**
```javascript
import { savedSearches } from '@lib/searchUtils';

const handleSaveSearch = () => {
  const success = savedSearches.save(
    'My Favorite Search',
    query,
    filters,
    'courts'
  );
  
  if (success) {
    alert('Search saved!');
  } else {
    alert('Name already exists');
  }
};
```

**Load Saved Search:**
```javascript
const handleLoadSaved = (savedSearch) => {
  setQuery(savedSearch.query);
  setFilters(savedSearch.filters);
  handleSearch(savedSearch.query, savedSearch.filters);
};
```

---

## 🎨 Visual Design

### Search Bar
- **Height:** 48px (py-3)
- **Border:** 2px solid, blue on focus
- **Icons:** Search (left), Clear + Button (right)
- **Suggestions:** White card with shadow, max 8 items

### Filter Panel
- **Max Height:** 500px with scroll
- **Sections:** Expandable with chevron icons
- **Active Filters:** Blue badges at bottom
- **Reset Button:** Red text, hover effect

### Badges
- **Active Filters:** Blue with count
- **Filter Values:** Rounded pills with X button
- **Suggestion Types:** Clock (history) or TrendingUp (common)

---

## 🔧 Technical Implementation

### Fuse.js Configuration
```javascript
{
  threshold: 0.4,           // 0.0 = perfect match, 1.0 = match anything
  includeScore: true,       // Return relevance score
  includeMatches: true,     // Return matched character indices
  minMatchCharLength: 2,    // Min chars to match
  keys: [                   // Fields to search
    { name: 'fieldName', weight: 0.5 },
  ],
}
```

### Performance Optimizations

**1. Debounced Search:**
```javascript
import { debounce } from 'lodash';

const debouncedSearch = debounce((query) => {
  handleSearch(query);
}, 300);
```

**2. Memoized Results:**
```javascript
import { useMemo } from 'react';

const filteredResults = useMemo(() => {
  return searcher.search(query, filters);
}, [query, filters, searcher]);
```

**3. Virtual Scrolling (for large result sets):**
```javascript
// Use react-window or react-virtualized
import { FixedSizeList } from 'react-window';
```

---

## 📊 Analytics Integration

### Track Search Events

**Firebase Analytics:**
```javascript
import { logEvent } from 'firebase/analytics';
import { analytics } from '@config/firebase';

// Search performed
logEvent(analytics, 'search', {
  search_term: query,
  entity_type: entityType,
  results_count: results.length,
});

// Filter applied
logEvent(analytics, 'filter_applied', {
  filter_type: filterKey,
  filter_value: filterValue,
  entity_type: entityType,
});

// Saved search created
logEvent(analytics, 'saved_search_created', {
  search_name: name,
  entity_type: entityType,
});
```

### Metrics to Track
- **Search Query Distribution:** Most common queries
- **Zero Results Queries:** Queries with no results
- **Filter Usage:** Which filters are most used
- **Saved Searches:** How many users save searches
- **Search-to-Action Rate:** % of searches leading to bookings

---

## 🎓 Best Practices

### Search UX

**1. Provide Feedback:**
- Show loading state while searching
- Display "No results" message clearly
- Suggest alternative queries for zero results

**2. Optimize Query Performance:**
- Debounce input (300ms recommended)
- Show suggestions after 2+ characters
- Limit results to 50-100 items

**3. Help Users:**
- Show recent searches when input is empty
- Provide common query suggestions
- Highlight matched text in results

### Filter Design

**1. Progressive Disclosure:**
- Show most important filters first
- Collapse less-used filters by default
- Display active filter count

**2. Clear Visual Feedback:**
- Badge count on filter sections
- Active filter pills at bottom
- Highlight selected options

**3. Quick Reset:**
- "Clear all" button always visible
- Individual filter removal (X button)
- Preserve search query when clearing filters

---

## 🚀 Future Enhancements

### Planned Features

1. **Voice Search:**
   - Web Speech API integration
   - Voice-to-text transcription
   - Multi-language support

2. **Search Analytics Dashboard:**
   - Popular queries heatmap
   - Zero-result queries report
   - Search-to-conversion funnel

3. **Smart Filters:**
   - Auto-suggest filters based on query
   - Dynamic filter options based on results
   - Filter presets for common use cases

4. **Advanced Query Syntax:**
   - Boolean operators (AND, OR, NOT)
   - Field-specific search (name:tennis)
   - Exact phrase matching ("campo tennis")

5. **Spell Correction:**
   - "Did you mean..." suggestions
   - Auto-correct common typos
   - Phonetic matching

6. **Search-as-you-type Results:**
   - Instant results below search bar
   - Preview cards on hover
   - Quick actions (book, favorite, share)

---

## 🐛 Troubleshooting

### Issue: Slow search performance
**Cause:** Large dataset (>1000 items)  
**Solution:** Implement debouncing and limit displayed results

### Issue: No suggestions appearing
**Cause:** Query too short (<2 chars)  
**Solution:** Type at least 2 characters

### Issue: Filters not applying
**Cause:** Filter key mismatch with data fields  
**Solution:** Verify filter keys match data object keys exactly

### Issue: Search history not saving
**Cause:** LocalStorage disabled or full  
**Solution:** Check browser storage settings and quota

---

## ✅ CHK-307 Status: COMPLETE

**Implementation Time:** ~5 hours  
**Lines of Code:** 900+  
**Components:** 3  
**Utility Functions:** 15+

**Files Created:**
- `src/lib/searchUtils.js` (350 lines)
- `src/components/search/AdvancedSearchBar.jsx` (200 lines)
- `src/components/search/FilterPanel.jsx` (320 lines)
- `ADVANCED_SEARCH_FILTERS.md` (this file)

**Dependencies Installed:**
- fuse.js (fuzzy search library)

**Features:**
- ✅ Fuzzy search with Fuse.js
- ✅ Multi-field search (4 entity types)
- ✅ Search history (last 20)
- ✅ Saved searches (max 10)
- ✅ Autocomplete suggestions
- ✅ Keyboard navigation
- ✅ Multi-select filters
- ✅ Range filters (price, date)
- ✅ Toggle filters (boolean)
- ✅ Match highlighting
- ✅ Result ranking
- ✅ Active filter badges
- ✅ Responsive design
- ✅ Dark mode support

**Next Steps:**
1. Integrate search into main pages (courts, bookings, users)
2. Add search analytics tracking
3. Test with production data
4. Gather user feedback on relevance
5. Proceed to CHK-308 (Notification Center)

---

**Developed with ❤️ for Play & Sport**  
**Find Anything, Instantly.**
