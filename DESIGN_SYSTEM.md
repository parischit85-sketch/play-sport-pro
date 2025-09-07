# Design System Unificato - Paris League

## Panoramica

Il design system unifica tutti gli stili, i componenti e i pattern dell'applicazione per garantire consistenza visiva e facilità di manutenzione.

## Struttura

### 🎨 Theme System (`src/lib/theme.js`)

- **Temi**: Light e Dark mode
- **Tokens unificati**: colori, spacing, border radius, shadows, transizioni
- **Costanti**: valori riutilizzabili per mantenere consistenza

### 🧩 Design System (`src/lib/design-system.js`)

- **Spacing**: sistema basato su 4px (xs=4px, sm=8px, md=16px, lg=24px, xl=32px)
- **Typography**: gerarchia di testi (h1-h5, body, label, caption)
- **Layout**: pattern flex/grid responsivi
- **Colors**: palette brand e status colors
- **Shadows**: sistema di ombre unificato
- **Animations**: transizioni standard

### 🎯 Componenti Unificati

#### StatsCard (`src/components/ui/StatsCard.jsx`)

Card per statistiche con:

- Varianti: default, compact, elevated
- Colori: success, danger, warning, info, primary
- Dimensioni: sm, md, lg, xl
- Trend indicators con icone

#### Badge (`src/components/ui/Badge.jsx`)

Badge per etichette con:

- Varianti colore: default, success, danger, warning, info, primary
- Dimensioni: xs, sm, md, lg
- Supporto icone e rimozione

#### Section (`src/components/ui/Section.jsx`)

Container per sezioni con:

- Varianti: default, elevated, minimal, compact
- Header unificato con titolo neon
- Spacing consistente

## 📊 Chart Colors Unificati

Tutti i chart usano la stessa palette:

```js
const UNIFIED_CHART_COLORS = [
  '#10b981', // emerald-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
];
```

## 🚀 Pattern di Utilizzo

### Card Standard

```jsx
<div className={T.card}>{/* contenuto */}</div>
```

### Card con Hover

```jsx
<div className={T.cardHover}>{/* contenuto */}</div>
```

### Statistica

```jsx
<StatsCard
  label="Partite Vinte"
  value="25"
  subtitle="Su 40 totali"
  color="success"
  trend={5}
  T={T}
/>
```

### Badge

```jsx
<Badge variant="success" size="sm">
  Attivo
</Badge>
```

## 📱 Responsive Design

- **Mobile-first**: design ottimizzato per mobile
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid**: sistema grid flessibile da 1 a 5 colonne
- **Stack patterns**: layout che si adattano su mobile

## 🔧 Manutenzione

- **Centralizzato**: tutti gli stili in `theme.js` e `design-system.js`
- **Tipizzato**: costanti che prevengono errori
- **Modulare**: componenti riutilizzabili
- **Scalabile**: facile aggiungere nuove varianti

## 🎯 Benefici

1. **Consistenza**: stesso look ovunque
2. **Manutenibilità**: modifiche centralizzate
3. **Performance**: classi riutilizzate
4. **Developer Experience**: pattern chiari
5. **Accessibilità**: focus rings e contrasti uniformi
6. **Dark/Light Mode**: supporto nativo

## 📖 Esempi di Migrazione

### Prima (inconsistente)

```jsx
<div className="rounded-lg bg-white p-3 shadow-sm border">
  <div className="text-sm text-gray-600">Label</div>
  <div className="text-2xl font-bold text-green-600">42</div>
</div>
```

### Dopo (design system)

```jsx
<StatsCard label="Label" value="42" color="success" size="md" T={T} />
```

Questo approccio garantisce un design coerente, manutenibile e scalabile per tutto il progetto.
