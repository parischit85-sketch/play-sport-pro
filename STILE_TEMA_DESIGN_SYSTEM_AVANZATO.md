# 🎨 GUIDA AVANZATA STILE - Componenti Complessi

**Creato:** 3 Novembre 2025  
**Collegamento:** STILE_TEMA_DESIGN_SYSTEM.md (documento principale)

---

## 📚 Indice

1. [Componenti Avanzati](#componenti-avanzati)
2. [Pattern Responsive](#pattern-responsive)
3. [Animazioni Custom](#animazioni-custom)
4. [Varianti di Stato](#varianti-di-stato)
5. [Problemi Comuni e Soluzioni](#problemi-comuni-e-soluzioni)

---

## 🧩 Componenti Avanzati

### Collapsible/Accordion

```jsx
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { themeTokens } from '@lib/theme.js';

export function CollapsibleSection({ title, children }) {
  const T = themeTokens();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${T.cardBg} ${T.border} rounded-lg overflow-hidden`}>
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-4 hover:bg-gray-700/50 ${T.transitionNormal}`}
      >
        <h3 className={`${T.text} font-semibold`}>{title}</h3>
        <ChevronDown
          className={`w-5 h-5 ${T.subtext} transition-transform duration-300 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div className={`p-4 border-t border-gray-700 ${T.subtext}`}>
          {children}
        </div>
      )}
    </div>
  );
}
```

### Tabbed Interface

```jsx
import { useState } from 'react';
import { themeTokens } from '@lib/theme.js';

export function TabbedContent({ tabs }) {
  const T = themeTokens();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      {/* Tab Headers */}
      <div className={`flex border-b border-gray-700`}>
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-3 font-medium transition-colors relative ${
              activeTab === idx
                ? `${T.neonText}`
                : `${T.subtext} hover:${T.text}`
            }`}
          >
            {tab.label}
            {activeTab === idx && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={`${T.cardBg} rounded-b-lg p-4`}>
        {tabs[activeTab].content}
      </div>
    </div>
  );
}

// Uso:
<TabbedContent
  tabs={[
    { label: 'Tab 1', content: <div>Contenuto 1</div> },
    { label: 'Tab 2', content: <div>Contenuto 2</div> },
  ]}
/>
```

### Toast/Alert Message

```jsx
import { X } from 'lucide-react';
import { themeTokens } from '@lib/theme.js';

export function Toast({ message, type = 'info', onClose }) {
  const T = themeTokens();
  
  const typeStyles = {
    success: `bg-green-900/20 border border-green-600/50 text-green-400`,
    error: `bg-red-900/20 border border-red-600/50 text-red-400`,
    warning: `bg-yellow-900/20 border border-yellow-600/50 text-yellow-400`,
    info: `bg-blue-900/20 border border-blue-600/50 text-blue-400`,
  };

  return (
    <div className={`${typeStyles[type]} rounded-lg p-4 flex items-center justify-between animate-slide-in-right`}>
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className={`${T.btnGhostSm} p-1`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
```

### Data Table

```jsx
import { themeTokens } from '@lib/theme.js';

export function DataTable({ columns, data }) {
  const T = themeTokens();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className={`${T.headerBg} border-b border-gray-700`}>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left font-semibold ${T.tableHeadText}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className={`border-b border-gray-800 hover:bg-gray-700/30 ${T.transitionNormal}`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 ${T.text}`}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Uso:
<DataTable
  columns={[
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' },
  ]}
  data={[
    { name: 'John', email: 'john@example.com', status: 'Active' },
    { name: 'Jane', email: 'jane@example.com', status: 'Pending' },
  ]}
/>
```

### Search Input with Dropdown

```jsx
import { Search, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { themeTokens } from '@lib/theme.js';

export function SearchDropdown({ items, onSelect }) {
  const T = themeTokens();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Input */}
      <div className={`flex items-center ${T.input} px-3 py-2`}>
        <Search className="w-4 h-4 mr-2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Cerca..."
          className={`flex-1 bg-transparent outline-none text-white placeholder-gray-400`}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && filtered.length > 0 && (
        <div className={`absolute top-full left-0 right-0 mt-1 ${T.cardBg} ${T.border} rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto`}>
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelect(item);
                setQuery('');
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${T.text}`}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Rating Component

```jsx
import { Star } from 'lucide-react';
import { useState } from 'react';
import { themeTokens } from '@lib/theme.js';

export function RatingComponent({ value = 0, onChange }) {
  const T = themeTokens();
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-6 h-6 ${
              star <= (hoverValue || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
```

### Progress Bar

```jsx
import { themeTokens } from '@lib/theme.js';

export function ProgressBar({ value = 0, max = 100, showLabel = true }) {
  const T = themeTokens();
  const percentage = (value / max) * 100;

  return (
    <div>
      <div className={`w-full bg-gray-700 rounded-full h-2 overflow-hidden`}>
        <div
          className={`bg-blue-500 h-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className={`text-sm ${T.subtext} mt-2`}>
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
}
```

### Badge/Chip Component

```jsx
import { X } from 'lucide-react';
import { themeTokens } from '@lib/theme.js';

export function Badge({ label, variant = 'default', onRemove }) {
  const T = themeTokens();

  const variants = {
    default: `bg-blue-600 text-white`,
    success: `bg-green-600/30 text-green-400 border border-green-600/50`,
    warning: `bg-yellow-600/30 text-yellow-400 border border-yellow-600/50`,
    error: `bg-red-600/30 text-red-400 border border-red-600/50`,
    neutral: `bg-gray-700 text-gray-300`,
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${variants[variant]}`}>
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:opacity-75 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
```

---

## 📱 Pattern Responsive

### Mobile-First Approach

```jsx
// ✅ GIUSTO - Mobile first
export function ResponsiveLayout() {
  const T = themeTokens();

  return (
    <div className={T.pageBg}>
      {/* Mobile: stacked, Desktop: side-by-side */}
      <div className="flex flex-col md:flex-row gap-4">
        <aside className="w-full md:w-64 md:flex-shrink-0">
          {/* Sidebar - hidden on mobile */}
          <div className={`hidden md:block ${T.cardBg} rounded-lg p-4`}>
            Sidebar
          </div>
        </aside>

        <main className="flex-1">
          {/* Main content - full width on mobile */}
          <div className={T.cardBg}>
            Main Content
          </div>
        </main>
      </div>
    </div>
  );
}

// ✅ GIUSTO - Grid responsive
export function ResponsiveGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map(item => (
        <div key={item.id} className="bg-gray-800 rounded-lg p-4">
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

### Safe Area Insets (Mobile)

```jsx
// Per iOS e dispositivi con notch
export function MobileOptimizedPage() {
  return (
    <div className="safe-area-top safe-area-bottom">
      {/* Contenuto */}
    </div>
  );
}

// O con padding esplicito
export function MobileOptimizedLayout() {
  return (
    <div className="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Contenuto */}
    </div>
  );
}
```

### Breakpoint Utilities

```javascript
// Tailwind breakpoints
xs   // 0px (default)
sm   // 640px
md   // 768px
lg   // 1024px
xl   // 1280px
2xl  // 1536px

// Uso nelle classi:
// hidden md:block         ← Nascosto su mobile, visibile da md in su
// block md:hidden         ← Visibile su mobile, nascosto da md in su
// w-full md:w-1/2         ← Full width mobile, metà da md in su
// text-sm md:text-base    ← Testo piccolo mobile, normale da md in su
```

---

## ✨ Animazioni Custom

### Fade In

```jsx
<div className="animate-fade-in">Contenuto</div>

// CSS in index.css:
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in { animation: fade-in 0.5s ease-out; }
```

### Slide Up

```jsx
<div className="animate-slide-up">Modal Content</div>

// CSS:
@keyframes slide-up {
  from { 
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-slide-up { animation: slide-up 0.3s ease-out; }
```

### Scale In

```jsx
<div className="animate-scale-in">Card</div>

// CSS:
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-scale-in { animation: scale-in 0.2s ease-out; }
```

### Pulse Subtle

```jsx
<div className="animate-pulse-subtle">Loading...</div>

// CSS:
@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
.animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }
```

### Skeleton Loading

```jsx
export function SkeletonLoader() {
  return (
    <div className="space-y-4">
      <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
      <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
      <div className="h-8 bg-gray-700 rounded animate-pulse"></div>
    </div>
  );
}
```

---

## 🎭 Varianti di Stato

### Disabled State

```jsx
import { themeTokens } from '@lib/theme.js';

export function ButtonWithStates({ disabled }) {
  const T = themeTokens();

  return (
    <button
      disabled={disabled}
      className={`
        ${T.btnPrimary}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      Azione
    </button>
  );
}
```

### Loading State

```jsx
export function ButtonWithLoading({ isLoading }) {
  const T = themeTokens();

  return (
    <button
      disabled={isLoading}
      className={`${T.btnPrimary} flex items-center gap-2`}
    >
      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      )}
      {isLoading ? 'Caricamento...' : 'Invia'}
    </button>
  );
}
```

### Error State (Input)

```jsx
export function InputWithError({ error }) {
  const T = themeTokens();

  return (
    <div>
      <input
        className={`
          ${T.input}
          ${error ? 'border-red-500 ring-red-500/30' : ''}
        `}
      />
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}
```

### Hover States

```jsx
export function HoverableCard() {
  const T = themeTokens();

  return (
    <div className={`
      ${T.cardBg}
      ${T.border}
      rounded-lg
      p-4
      hover:shadow-lg
      hover:scale-105
      ${T.transitionNormal}
      cursor-pointer
    `}>
      Hover me
    </div>
  );
}
```

### Active/Selected State

```jsx
export function SelectableItem({ isSelected }) {
  const T = themeTokens();

  return (
    <div className={`
      ${T.cardBg}
      rounded-lg
      p-4
      ${isSelected ? `ring-2 ring-blue-500 bg-blue-900/20` : T.border}
      ${T.transitionNormal}
    `}>
      {isSelected && <span className="text-blue-400">✓</span>}
      Item
    </div>
  );
}
```

---

## 🐛 Problemi Comuni e Soluzioni

### Problema: Testo illeggibile
```jsx
// ❌ SBAGLIATO
<p className="text-gray-400">Testo troppo chiaro</p>

// ✅ GIUSTO
<p className={T.subtext}>Testo appropriato</p>
<p className="text-gray-300">Testo con contrasto</p>
```

### Problema: Background non visibile
```jsx
// ❌ SBAGLIATO - No background
<div>Contenuto</div>

// ✅ GIUSTO
<div className={T.cardBg}>Contenuto</div>
```

### Problema: Border inconsistente
```jsx
// ❌ SBAGLIATO - Border fisso
<div className="border border-blue-500">Item</div>

// ✅ GIUSTO - Usa theme
<div className={`${T.cardBg} ${T.border}`}>Item</div>
```

### Problema: Bottone non clickabile su mobile
```jsx
// ❌ SBAGLIATO
<button className="p-1">Tiny button</button>

// ✅ GIUSTO - Min 48px touch target
<button className="p-3">Button</button>
```

### Problema: Modale dietro al navbar
```jsx
// ❌ SBAGLIATO - z-index basso
<div className="z-10">Modal</div>

// ✅ GIUSTO
<div className="z-50 fixed inset-0">Modal</div>
```

### Problema: Overflow su mobile
```jsx
// ❌ SBAGLIATO - Full width fisso
<div className="w-96">Content</div>

// ✅ GIUSTO - Responsive
<div className="w-full max-w-md">Content</div>
```

### Problema: Input font troppo piccolo su iOS
```jsx
// ❌ SBAGLIATO - Trigger zoom
<input className="text-xs" />

// ✅ GIUSTO - Almeno 16px
<input className="text-base" />
```

### Problema: Scroll orizzontale su mobile
```jsx
// ❌ SBAGLIATO
<div className="flex gap-4">
  <div className="w-96">Item 1</div>
  <div className="w-96">Item 2</div>
</div>

// ✅ GIUSTO
<div className="flex gap-4 overflow-x-auto md:overflow-x-visible">
  <div className="w-full md:w-96">Item 1</div>
  <div className="w-full md:w-96">Item 2</div>
</div>
```

---

## 🎯 Checklist per Componenti Complessi

- [ ] Tutti i text hanno colore da theme (`T.text`, `T.subtext`, etc)
- [ ] Bottoni hanno `:hover` e `:active` states
- [ ] Form inputs hanno `:focus` ring
- [ ] Componenti are responsive (`hidden`/`block` basato su breakpoint)
- [ ] Touch targets sono almeno 48px su mobile
- [ ] Animazioni usano `transition-all duration-X ease-in-out`
- [ ] States (loading, error, disabled) sono chiari
- [ ] Modali hanno `z-50` e `fixed`
- [ ] Overflow è gestito (`overflow-auto`, `truncate`, etc)
- [ ] Accessibility: semantica HTML corretta, aria labels dove necessario

---

**Torna a:** [STILE_TEMA_DESIGN_SYSTEM.md](./STILE_TEMA_DESIGN_SYSTEM.md)
