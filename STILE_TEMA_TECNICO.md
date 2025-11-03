# 🔧 RIFERIMENTO TECNICO - File Sorgente Stile

**Creato:** 3 Novembre 2025  
**Scopo:** Mappatura veloce dei file di configurazione styling

---

## 📁 Struttura File

```
src/lib/
├── theme.js              ← TOKENS principale
├── design-system.js      ← Pattern e costanti
└── ...

tailwind.config.js        ← Configurazione Tailwind (root)
index.css                 ← Animazioni e stili globali
postcss.config.js         ← PostCSS setup
```

---

## 📋 Cosa C'è in Ogni File

### `src/lib/theme.js` - IMPORT E USO

```javascript
import { themeTokens } from '@lib/theme.js';

// Nella componente:
const T = themeTokens();

// Usi i token:
<div className={T.pageBg}>           // bg-gray-900
  <div className={T.cardBg}>         // bg-gray-800
    <h1 className={T.text}>          // text-white
    <button className={T.btnPrimary}>// Bottone blu
```

**Token Principali Disponibili:**
```javascript
T.pageBg              // 'bg-gray-900' - Sfondo pagine
T.cardBg              // 'bg-gray-800' - Background card
T.headerBg            // 'bg-gray-800 border-b border-gray-600/50'
T.border              // 'ring-1 ring-gray-600/50'

T.text                // 'text-white'
T.subtext             // 'text-gray-300'
T.neonText            // 'text-blue-400'

T.input               // Input completo con stile
T.btnPrimary          // Bottone blu primario
T.btnGhost            // Bottone secondary con border
T.btnGhostSm          // Bottone small

T.accentGood          // 'text-green-400' - success
T.accentBad           // 'text-rose-400' - error
T.accentWarning       // 'text-amber-400'
T.accentInfo          // 'text-blue-400'

T.transitionFast      // duration-150
T.transitionNormal    // duration-200
T.transitionSlow      // duration-300

T.focusRing           // Focus ring completo
T.primaryRing         // 'ring-blue-500'
```

---

### `src/lib/design-system.js` - IMPORT E USO

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

// Uso diretto dei moduli:
<div className={DS_LAYOUT.flexBetween}>
  <h1 className={DS_TYPOGRAPHY.h1}>Titolo</h1>
</div>

// O uso helper che combina con theme:
const T = themeTokens();
const ds = createDSClasses(T);
<div className={ds.card}>Content</div>
```

**Cosa Esporta:**

#### `DS_SPACING`
```javascript
xs: 'p-1'      // 4px
sm: 'p-2'      // 8px
md: 'p-4'      // 16px
lg: 'p-6'      // 24px
xl: 'p-8'      // 32px
xxl: 'p-12'    // 48px

gapXs: 'gap-1'
gapSm: 'gap-2'
gapMd: 'gap-4'
// ...
```

#### `DS_TYPOGRAPHY`
```javascript
h1: 'text-3xl font-bold'
h2: 'text-2xl font-bold'
h3: 'text-xl font-semibold'
// ...
body: 'text-base'
bodySm: 'text-sm'
label: 'text-xs uppercase tracking-wide font-medium'
```

#### `DS_LAYOUT`
```javascript
flexBetween: 'flex items-center justify-between'
flexCenter: 'flex items-center justify-center'
grid3: 'grid grid-cols-1 md:grid-cols-3'
grid4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
container: 'max-w-7xl mx-auto px-4'
```

#### `DS_COLORS`
```javascript
primary: { 50: '#f0fdf4', 100: '#dcfce7', ... }
success: 'text-emerald-500 dark:text-green-400'
error: 'text-rose-500 dark:text-rose-400'
bg: { primary, secondary, tertiary, muted }
text: { primary, secondary, muted, inverse, accent }
```

#### `DS_SHADOWS`
```javascript
sm: 'shadow-sm'
md: 'shadow-md'
card: 'shadow-[0_0_0_1px_rgba(0,0,0,0.02)] shadow-sm'
```

#### `DS_BORDERS`
```javascript
lg: 'rounded-lg'
xl: 'rounded-xl'
full: 'rounded-full'
```

#### `DS_ANIMATIONS`
```javascript
fast: 'transition-all duration-150 ease-in-out'
normal: 'transition-all duration-200 ease-in-out'
focusRing: 'focus:outline-none focus:ring-2 focus:ring-blue-500 ...'
```

#### `createDSClasses(T)`
```javascript
// Helper che combina theme con design system
const ds = createDSClasses(T);

ds.card           // Card pattern
ds.h1, ds.h2      // Typography con colore
ds.btnPrimary     // Button
ds.input          // Input
ds.flexBetween    // Layout
// ...
```

---

### `tailwind.config.js` - CONFIGURAZIONE

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        emerald: { ... }  // Extended emerald palette
      },
      boxShadow: {
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), ...',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        // ...
      },
    },
  },
  plugins: [],
};
```

**Cosa Personalizzare:**
- Colori emerald estesi
- Animazioni custom
- Shadow dark mode
- Breakpoint (se serve)

---

### `index.css` - STILI GLOBALI

**Contiene:**
```css
/* Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom animations */
@keyframes slide-in-right { ... }
@keyframes fade-in { ... }
@keyframes slideUp { ... }

/* Mobile support */
.safe-area-top { padding-top: max(env(safe-area-inset-top), 0px); }
.safe-area-bottom { padding-bottom: max(env(safe-area-inset-bottom), 0px); }

/* Scrollbar customize */
::-webkit-scrollbar { width: 8px; }

/* iOS/Mobile fixes */
button, a, [role="button"] { -webkit-tap-highlight-color: transparent; }

/* Dark select fixes */
select { color-scheme: dark; }
select option { background-color: rgb(55, 65, 81); color: rgb(229, 231, 235); }

/* Custom classes */
.animate-shake { animation: shake 0.6s ...; }
.no-scrollbar { scrollbar-width: none; }
```

**Quando Personalizzare:**
- Aggiungi nuove animazioni custom
- Fixa browser-specific issues
- Aggiungi utilità globali

---

### `postcss.config.js` - CSS PROCESSING

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Di solito non toccare**, ma importante sapere che:
- Tailwind viene processato qui
- Vendor prefixes aggiunti automaticamente

---

## 🔄 Flusso di Importazione

```
Componente React
   ↓
import { themeTokens } from '@lib/theme.js'
   ↓
const T = themeTokens()
   ↓
<div className={T.pageBg}>
   ↓
Tailwind CSS (tailwind.config.js)
   ↓
index.css (animazioni global)
   ↓
CSS finale nel browser
```

---

## 🎨 Estensione del Sistema

### Aggiungere un Nuovo Token

**In `src/lib/theme.js`:**
```javascript
export function themeTokens() {
  return {
    // ... existing tokens
    myCustomToken: 'bg-purple-600 hover:bg-purple-700 transition-colors',
  };
}
```

**Uso:**
```javascript
const T = themeTokens();
<div className={T.myCustomToken}>Custom</div>
```

### Aggiungere una Nuova Costante

**In `src/lib/design-system.js`:**
```javascript
export const DS_CUSTOM = {
  myPattern: 'flex items-center gap-4 p-3 rounded-lg',
};
```

**Uso:**
```javascript
import { DS_CUSTOM } from '@lib/design-system.js';
<div className={DS_CUSTOM.myPattern}>Content</div>
```

### Aggiungere una Nuova Animazione

**In `tailwind.config.js`:**
```javascript
animation: {
  'bounce-slow': 'bounceSlow 2s ease-in-out infinite',
},
keyframes: {
  bounceSlow: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-10px)' },
  },
}
```

**Uso:**
```jsx
<div className="animate-bounce-slow">Bouncing</div>
```

---

## 🔍 Debugging

### Verificare Token Disponibili

```javascript
import { themeTokens } from '@lib/theme.js';

const T = themeTokens();
console.log(T);  // Vedi tutti i token disponibili
```

### Verificare Design System

```javascript
import { DS_LAYOUT, DS_COLORS, DS_TYPOGRAPHY } from '@lib/design-system.js';

console.log(DS_LAYOUT);     // Layout patterns
console.log(DS_COLORS);     // Color palette
console.log(DS_TYPOGRAPHY); // Typography
```

---

## 📝 File Correlati da Non Dimenticare

```
vite.config.js         ← Build config, importa tailwind
postcss.config.js      ← CSS processing
tsconfig.json          ← TypeScript config (se usi TS)
package.json           ← Dependencies: tailwindcss, lucide-react, etc
```

---

## 🚀 Quando Personalizzare Questi File

| File | Quando Modificare | Cosa Evitare |
|------|-------------------|-------------|
| `theme.js` | Aggiungi nuovi token | Modificare token esistenti |
| `design-system.js` | Aggiungi pattern | Modificare pattern esistenti |
| `tailwind.config.js` | Nuove animazioni, colori | Modificare breakpoint predefiniti |
| `index.css` | Animazioni custom globali | Hardcode stili, usare inline CSS |
| `postcss.config.js` | Di solito non toccare | - |

---

## 💾 Export/Import Patterns

### Da theme.js
```javascript
import { themeTokens } from '@lib/theme.js';
```

### Da design-system.js
```javascript
import {
  DS_SPACING,
  DS_TYPOGRAPHY,
  DS_LAYOUT,
  DS_COLORS,
  DS_SHADOWS,
  DS_BORDERS,
  DS_ANIMATIONS,
  DS_PATTERNS,
  createDSClasses
} from '@lib/design-system.js';
```

### Uso Combined
```javascript
import { themeTokens } from '@lib/theme.js';
import { createDSClasses } from '@lib/design-system.js';

const T = themeTokens();
const ds = createDSClasses(T);

// Usa entrambi
<div className={`${ds.card} ${T.transitionNormal}`}>
  Contenuto
</div>
```

---

## 📚 Correlazione con Documenti

| File | Documentazione |
|------|-----------------|
| `theme.js` | [STILE_TEMA_DESIGN_SYSTEM.md](./STILE_TEMA_DESIGN_SYSTEM.md) - Theme System |
| `design-system.js` | [STILE_TEMA_DESIGN_SYSTEM.md](./STILE_TEMA_DESIGN_SYSTEM.md) - Design System |
| `tailwind.config.js` | [STILE_TEMA_INDEX.md](./STILE_TEMA_INDEX.md) - Palette Colori |
| `index.css` | [STILE_TEMA_DESIGN_SYSTEM_AVANZATO.md](./STILE_TEMA_DESIGN_SYSTEM_AVANZATO.md) - Animazioni |

---

**Fine Riferimento Tecnico. Torna a [STILE_TEMA_DESIGN_SYSTEM.md](./STILE_TEMA_DESIGN_SYSTEM.md) per usare il sistema!**
