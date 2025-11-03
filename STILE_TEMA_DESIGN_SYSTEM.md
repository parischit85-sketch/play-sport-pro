# 🎨 GUIDA COMPLETA STILE TEMA - Play Sport Pro

**Creato:** 3 Novembre 2025  
**Versione:** 1.0  
**Status:** ATTIVO - Dark Mode Forzato (tema scuro unico)  

---

## 📋 INDICE

1. [Panoramica Generale](#panoramica-generale)
2. [Architettura Styling](#architettura-styling)
3. [Palette Colori](#palette-colori)
4. [Sistema di Spacing](#sistema-di-spacing)
5. [Tipografia](#tipografia)
6. [Componenti e Pattern](#componenti-e-pattern)
7. [Come Aggiungere Nuove Pagine](#come-aggiungere-nuove-pagine)
8. [Template Esempi](#template-esempi)

---

## 🌍 Panoramica Generale

### Stato Attuale del Tema
- **Modalità**: Dark Mode Forzato
- **Sistema Colori**: Tema scuro unificato (grigio scuro con accenti blu)
- **Framework CSS**: Tailwind CSS v3.4.13
- **Supporto Mobile**: Full (Capacitor/Ionic)
- **Browser**: Tutti moderni con supporto CSS3

### File Principali
```
src/lib/
├── theme.js           ← Token di tema + costanti
├── design-system.js   ← Patterns, spacing, tipografia
└── ...

tailwind.config.js     ← Configurazione Tailwind (colori, animazioni)
index.css             ← Animazioni custom e override globali
```

---

## 🏗️ Architettura Styling

### Come Funziona il Sistema

#### 1. **Theme System** (`src/lib/theme.js`)
```javascript
import { themeTokens } from '@lib/theme.js';

// In un componente:
const T = themeTokens();

// Uso:
<div className={T.pageBg}>           // bg-gray-900
  <div className={T.cardBg}>         // bg-gray-800
    <h1 className={T.text}>          // text-white
      Titolo
    </h1>
  </div>
</div>
```

**Tokens Disponibili:**
- Layout: `pageBg`, `cardBg`, `headerBg`, `border`
- Testo: `text`, `subtext`, `neonText`
- Form: `input`, `inputBg`
- Button: `btnPrimary`, `btnGhost`, `btnGhostSm`
- Status: `accentGood`, `accentBad`, `accentWarning`, `accentInfo`
- Focus: `focusRing`, `primaryRing`
- Spaziatura: `spacingXs`, `spacingSm`, `spacingMd`, `spacingLg`, `spacingXl`
- Bordi: `borderSm`, `borderMd`, `borderLg`, `borderFull`
- Transizioni: `transitionFast`, `transitionNormal`, `transitionSlow`

#### 2. **Design System** (`src/lib/design-system.js`)
Fornisce pattern riutilizzabili e costanti di design:

```javascript
import { 
  DS_SPACING, 
  DS_TYPOGRAPHY, 
  DS_LAYOUT,
  DS_COLORS,
  DS_SHADOWS,
  DS_BORDERS,
  DS_ANIMATIONS,
  createDSClasses
} from '@lib/design-system.js';

// Opzione A: Usare il sistema direttamente
<div className={DS_LAYOUT.flexBetween}>
  <h1 className={DS_TYPOGRAPHY.h1}>
    Titolo
  </h1>
</div>

// Opzione B: Usare helper che combina theme + design system
const T = themeTokens();
const ds = createDSClasses(T);

<div className={ds.card}>
  <h2 className={ds.h2}>Card Title</h2>
</div>
```

---

## 🎨 Palette Colori

### Colori Base (Dark Mode)

| Nome | Tailwind | Hex | Uso |
|------|----------|-----|-----|
| **Background Principale** | `bg-gray-900` | `#0f172a` | Sfondo pagine |
| **Background Card** | `bg-gray-800` | `#1f2937` | Card, contenitori |
| **Background Hover** | `bg-gray-700` | `#374151` | Hover states |
| **Testo Primario** | `text-white` | `#ffffff` | Titoli, body text |
| **Testo Secondario** | `text-gray-300` | `#d1d5db` | Descrizioni, label |
| **Testo Muted** | `text-gray-400` | `#9ca3af` | Placeholder, info |

### Colori Accento (Brand)

| Nome | Tailwind | Hex | Uso |
|------|----------|-----|-----|
| **Primary (Blue)** | `blue-500` | `#3b82f6` | Bottoni, link, highlight |
| **Primary Dark** | `blue-600` | `#2563eb` | Hover buttons |
| **Green Success** | `green-400` | `#4ade80` | Status positivi |
| **Red Error** | `rose-400` | `#f43f5e` | Errori, delete |
| **Yellow Warning** | `amber-400` | `#facc15` | Avvertimenti |

### Bordi

```javascript
border: 'ring-1 ring-gray-600/50'  // Uso standard per tutti i bordi
```

### Esempio di Utilizzo Colori

```jsx
// ✅ GIUSTO
<div className="bg-gray-800 border border-gray-700 text-white">
  Elemento
</div>

<button className="bg-blue-500 hover:bg-blue-600 text-white">
  Azione
</button>

// ❌ SBAGLIATO
<div className="bg-white text-black">  // Light mode - NON USARE
  Elemento
</div>
```

---

## 📏 Sistema di Spacing

Basato su scala 4px, usando Tailwind Padding/Margin/Gap:

```javascript
// Definito in DS_SPACING:
xs: 'p-1'    // 4px
sm: 'p-2'    // 8px
md: 'p-4'    // 16px
lg: 'p-6'    // 24px
xl: 'p-8'    // 32px
xxl: 'p-12'  // 48px

// Gap tra elementi:
gapXs: 'gap-1'    // 4px
gapSm: 'gap-2'    // 8px
gapMd: 'gap-4'    // 16px
gapLg: 'gap-6'    // 24px
gapXl: 'gap-8'    // 32px
```

### Uso negli Elementi

```jsx
// Container principale
<div className="max-w-7xl mx-auto px-4 py-6">

// Card con spacing interno
<div className="p-4">
  <h3 className="text-xl font-semibold mb-3">Titolo</h3>
  <p className="text-gray-400">Descrizione</p>
</div>

// Flex row con gap
<div className="flex items-center gap-2">
  <Icon />
  <span>Label</span>
</div>

// Grid con spacing
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(...)}
</div>
```

---

## 📝 Tipografia

```javascript
// Header Hierarchy
h1: 'text-3xl font-bold'       // 30px, bold
h2: 'text-2xl font-bold'       // 24px, bold
h3: 'text-xl font-semibold'    // 20px, semibold
h4: 'text-lg font-semibold'    // 18px, semibold
h5: 'text-base font-semibold'  // 16px, semibold

// Body Text
bodyLg: 'text-lg'              // 18px
body: 'text-base'              // 16px (default)
bodySm: 'text-sm'              // 14px
bodyXs: 'text-xs'              // 12px

// Special
label: 'text-xs uppercase tracking-wide font-medium'
caption: 'text-xs'

// Font Weights
thin: 'font-thin'              // 100
light: 'font-light'            // 300
normal: 'font-normal'          // 400
medium: 'font-medium'          // 500
semibold: 'font-semibold'      // 600
bold: 'font-bold'              // 700
extrabold: 'font-extrabold'    // 800
```

### Esempi di Utilizzo

```jsx
// ✅ GIUSTO
<h1 className="text-3xl font-bold text-white">
  Titolo Pagina
</h1>

<p className="text-base text-gray-300">
  Descrizione normale
</p>

<span className="text-xs text-gray-400">
  Testo secondario
</span>

// ❌ SBAGLIATO - Colori light mode
<p className="text-black">  // NO
  Descrizione
</p>
```

---

## 🧩 Componenti e Pattern

### Border Radius Standardizzato

```javascript
borderSm: 'rounded-lg'      // 8px (piccoli elementi)
borderMd: 'rounded-xl'      // 12px (card standard)
borderLg: 'rounded-2xl'     // 16px (container)
borderFull: 'rounded-full'  // Pill badge
```

### Shadow System

```javascript
DS_SHADOWS = {
  xs: 'shadow-sm',
  sm: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  card: 'shadow-[0_0_0_1px_rgba(0,0,0,0.02)] shadow-sm',
}
```

### Card Pattern

```jsx
import { themeTokens } from '@lib/theme.js';
import { DS_SPACING, DS_SHADOWS, DS_BORDERS } from '@lib/design-system.js';

function MyCard({ title, children }) {
  const T = themeTokens();
  
  return (
    <div className={`${DS_BORDERS.xxl} ${T.cardBg} ${T.border} ${DS_SPACING.md} ${DS_SHADOWS.card}`}>
      <h3 className="text-xl font-semibold text-white mb-3">
        {title}
      </h3>
      <div className="text-gray-300">
        {children}
      </div>
    </div>
  );
}
```

### Button Variants

```jsx
const T = themeTokens();

// Primary Button
<button className={T.btnPrimary}>
  Azione Primaria
</button>

// Ghost Button
<button className={T.btnGhost}>
  Azione Secondaria
</button>

// Small Ghost Button
<button className={T.btnGhostSm}>
  Small Action
</button>

// Custom Button (extender T.btnPrimary)
<button className={`${T.btnPrimary} w-full`}>
  Full Width Button
</button>
```

### Form Elements

```jsx
const T = themeTokens();

<input
  type="text"
  className={T.input}
  placeholder="Enter text..."
/>

// Con custom styling
<input
  type="email"
  className={`${T.input} text-sm`}
  placeholder="Email"
/>

// Select
<select className={`${T.input} cursor-pointer`}>
  <option>Opzione 1</option>
  <option>Opzione 2</option>
</select>
```

### Status Colors

```jsx
const T = themeTokens();

<span className={T.accentGood}>✓ Successo</span>
<span className={T.accentBad}>✗ Errore</span>
<span className={T.accentWarning}>⚠ Avvertimento</span>
<span className={T.accentInfo}>ℹ Info</span>
```

### Layout Patterns

```javascript
// Flexbox standard
DS_LAYOUT.flexBetween  // flex items-center justify-between
DS_LAYOUT.flexCenter   // flex items-center justify-center
DS_LAYOUT.flexStart    // flex items-center justify-start
DS_LAYOUT.flexEnd      // flex items-center justify-end
DS_LAYOUT.flexCol      // flex flex-col
DS_LAYOUT.flexWrap     // flex flex-wrap

// Grid patterns
DS_LAYOUT.grid2        // 2 colonne
DS_LAYOUT.grid3        // 3 colonne
DS_LAYOUT.grid4        // 4 colonne
DS_LAYOUT.gridAuto     // Responsive auto
```

### Transizioni e Animazioni

```javascript
// Standard transitions
transitionFast: 'transition-all duration-150 ease-in-out'
transitionNormal: 'transition-all duration-200 ease-in-out'
transitionSlow: 'transition-all duration-300 ease-in-out'

// Hover effects
'hover:scale-105 transition-transform duration-200'
'hover:opacity-80 transition-opacity duration-200'
```

### Focus Ring Unificato

```javascript
focusRing: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800'

// Uso:
<input className={`${T.input} ${T.focusRing}`} />
```

---

## 📄 Come Aggiungere Nuove Pagine

### 1. **Struttura Base di una Pagina**

```jsx
// src/pages/NuovaPagina.jsx
import { themeTokens } from '@lib/theme.js';
import { DS_LAYOUT, DS_SPACING } from '@lib/design-system.js';

export default function NuovaPagina() {
  const T = themeTokens();

  return (
    <div className={T.pageBg}>
      {/* Header */}
      <div className={`${T.headerBg} ${DS_SPACING.md} sticky top-0 z-10`}>
        <h1 className={`${T.text} text-2xl font-bold`}>
          Titolo Pagina
        </h1>
      </div>

      {/* Content */}
      <div className={`max-w-7xl mx-auto px-4 py-6`}>
        <section className="mb-6">
          <h2 className={`${T.neonText} text-xl font-semibold mb-4`}>
            Sezione
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cards */}
            <div className={`${T.cardBg} ${T.border} rounded-xl p-4`}>
              <h3 className={`${T.text} font-semibold mb-2`}>
                Card Title
              </h3>
              <p className={T.subtext}>
                Descrizione
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
```

### 2. **Aggiungere una Sezione in Stile**

```jsx
// Sezione con header e lista di card
function MySection({ title, items }) {
  const T = themeTokens();
  const { flexBetween, grid3 } = DS_LAYOUT;

  return (
    <section className="mb-8">
      {/* Section Header */}
      <div className={`${flexBetween} mb-4`}>
        <h2 className={`${T.neonText} text-2xl font-bold`}>
          {title}
        </h2>
        <button className={T.btnGhostSm}>
          Vedi tutti
        </button>
      </div>

      {/* Content Grid */}
      <div className={grid3}>
        {items.map((item) => (
          <div
            key={item.id}
            className={`${T.cardBg} ${T.border} rounded-lg p-4 hover:shadow-lg ${T.transitionNormal}`}
          >
            <h3 className={`${T.text} font-semibold`}>
              {item.title}
            </h3>
            <p className={`${T.subtext} text-sm mt-2`}>
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### 3. **Modal/Dialog Pattern**

```jsx
function MyModal({ isOpen, onClose, title, children }) {
  const T = themeTokens();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${T.cardBg} ${T.border} rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className={`${T.text} text-xl font-bold`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`${T.btnGhostSm} p-1`}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={T.subtext}>
          {children}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 mt-6">
          <button className={T.btnGhost} onClick={onClose}>
            Annulla
          </button>
          <button className={T.btnPrimary}>
            Salva
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 4. **Lista/Tabella Pattern**

```jsx
function MyList({ items }) {
  const T = themeTokens();

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`${T.cardBg} ${T.border} rounded-lg p-4 flex items-center justify-between hover:bg-gray-700 ${T.transitionNormal}`}
        >
          <div className="flex-1">
            <h4 className={`${T.text} font-medium`}>
              {item.name}
            </h4>
            <p className={`${T.subtext} text-sm`}>
              {item.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`${T.accentInfo} font-semibold`}>
              {item.value}
            </span>
            <button className={T.btnGhostSm}>
              Azioni
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 5. **Loading State**

```jsx
function LoadingCard() {
  const T = themeTokens();

  return (
    <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        <div className="h-8 bg-gray-700 rounded w-full mt-4"></div>
      </div>
    </div>
  );
}
```

---

## 📚 Template Esempi

### Template 1: Dashboard

```jsx
import { themeTokens } from '@lib/theme.js';
import { DS_LAYOUT, DS_SPACING } from '@lib/design-system.js';

export default function Dashboard() {
  const T = themeTokens();

  return (
    <div className={T.pageBg}>
      {/* Hero Section */}
      <div className={`${T.headerBg} safe-area-top`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className={`${T.text} text-4xl font-bold`}>
            Dashboard
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
              <p className={T.subtext}>Metrica {i + 1}</p>
              <p className={`${T.text} text-2xl font-bold mt-2`}>
                {Math.random() * 100 | 0}
              </p>
            </div>
          ))}
        </div>

        {/* Main Section */}
        <div className={`${T.cardBg} ${T.border} rounded-lg p-6`}>
          <h2 className={`${T.text} text-xl font-bold mb-4`}>
            Sezione Principale
          </h2>
          <p className={T.subtext}>
            Contenuto della sezione
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Template 2: Lista Dettagliata

```jsx
export default function DetailedList() {
  const T = themeTokens();
  const { flexBetween } = DS_LAYOUT;

  const items = [
    { id: 1, title: 'Item 1', status: 'active' },
    { id: 2, title: 'Item 2', status: 'pending' },
  ];

  return (
    <div className={T.pageBg}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filter Header */}
        <div className={`${flexBetween} mb-6`}>
          <input
            type="text"
            placeholder="Cerca..."
            className={`${T.input} flex-1 mr-4`}
          />
          <button className={T.btnPrimary}>
            Filtra
          </button>
        </div>

        {/* List */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`${flexBetween} ${T.cardBg} ${T.border} rounded-lg p-4`}
            >
              <div>
                <h3 className={`${T.text} font-medium`}>
                  {item.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={
                  item.status === 'active' 
                    ? T.accentGood 
                    : T.accentWarning
                }>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Template 3: Form

```jsx
export default function MyForm() {
  const T = themeTokens();
  const [formData, setFormData] = React.useState({});

  return (
    <div className={T.pageBg}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className={`${T.cardBg} ${T.border} rounded-lg p-6`}>
          <h1 className={`${T.text} text-2xl font-bold mb-6`}>
            Form Title
          </h1>

          <div className="space-y-4">
            {/* Input Group */}
            <div>
              <label className={`block ${T.subtext} text-sm font-medium mb-2`}>
                Label
              </label>
              <input
                type="text"
                className={T.input}
                placeholder="Inserisci valore..."
              />
            </div>

            {/* Select */}
            <div>
              <label className={`block ${T.subtext} text-sm font-medium mb-2`}>
                Seleziona
              </label>
              <select className={`${T.input} cursor-pointer`}>
                <option>Opzione 1</option>
                <option>Opzione 2</option>
              </select>
            </div>

            {/* Textarea */}
            <div>
              <label className={`block ${T.subtext} text-sm font-medium mb-2`}>
                Messaggio
              </label>
              <textarea
                rows="4"
                className={`${T.input} resize-none`}
                placeholder="Scrivi un messaggio..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6">
              <button className={T.btnGhost}>
                Annulla
              </button>
              <button className={T.btnPrimary}>
                Invia
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🚀 Checklist per Nuove Pagine/Sezioni

Quando aggiungi una nuova pagina o sezione, verifica:

- [ ] Importi `themeTokens` da `@lib/theme.js`
- [ ] Usi `T.pageBg` per il background principale
- [ ] Usi `T.cardBg` e `T.border` per i contenitori
- [ ] Usi `T.text` per testo primario e `T.subtext` per secondario
- [ ] Usi `T.btnPrimary` per azioni principali
- [ ] Usi `T.transitionNormal` per transizioni smooth
- [ ] Testi sono sempre `text-white` o varianti grigie (mai nero)
- [ ] Pulsanti hanno hover states
- [ ] Card hanno border e shadow coerenti
- [ ] Responsive è implementato con `grid-cols-1 md:grid-cols-X`
- [ ] Mobile safe areas sono considerati (`safe-area-top`, `safe-area-bottom`)
- [ ] Focus ring è presente su form elements

---

## 🎯 Quick Reference - Copy/Paste

### Card Base
```jsx
<div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
  Contenuto
</div>
```

### Button Primary
```jsx
<button className={T.btnPrimary}>Azione</button>
```

### Input
```jsx
<input className={T.input} placeholder="Testo..." />
```

### Section Title
```jsx
<h2 className={`${T.neonText} text-xl font-semibold`}>Sezione</h2>
```

### Flex Between
```jsx
<div className="flex items-center justify-between">
  Left
  <div>Right</div>
</div>
```

### Grid 3 Columns
```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {items.map(...)}
</div>
```

### Status Badge
```jsx
<span className={T.accentGood}>✓ Successo</span>
<span className={T.accentBad}>✗ Errore</span>
```

---

## 📞 Contatti Rapidi

Quando aggiungo una pagina/sezione e qualcosa non è chiaro:
1. Verifica questo documento
2. Guarda i file: `src/lib/theme.js` e `src/lib/design-system.js`
3. Cerca esempi in componenti existenti (es. `BookingCard`, `TournamentDetails`)
4. Se hai dubbi su colori/spacing, questo documento contiene tutto

---

**Nota:** Questo documento è il tuo "source of truth" per lo stile. Se noti discrepanze tra il codice e il documento, comunica per aggiornare entrambi.
