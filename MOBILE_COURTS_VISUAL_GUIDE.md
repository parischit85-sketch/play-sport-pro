# 📱 GUIDA VISUALE - Mobile Courts Manager

## 🎯 Panoramica

Il nuovo **Mobile Courts Manager** è un redesign completo dell'interfaccia di gestione campi, ottimizzato per dispositivi mobile con touch-friendly controls e UX nativa.

---

## 📊 PRIMA vs DOPO

### ❌ PRIMA (Desktop-Only Design)

```
┌─────────────────────────────────────┐
│ 🏟️ Gestione Campi Avanzata          │
│ [Input: Nome campo........] [Aggiungi]│
├─────────────────────────────────────┤
│ Campo 1 - Centrale      [⬆️] [⬇️] [🗑️]│
│ ┌─ Dettagli Campo ─────────────────┐│
│ │ Nome: [__________] Tipo: [Indoor]││
│ │ Max Giocatori: [4]               ││
│ │ □ Riscaldamento                  ││
│ │                                  ││
│ │ Fasce Orarie:                    ││
│ │ ┌────────────────────────────┐  ││
│ │ │ Nome: Mattutina            │  ││
│ │ │ €/ora: 25  Da: 08:00 A: 12:00│││
│ │ │ Giorni: [L][M][M][G][V]    │  ││
│ │ │ Preview: 9.38€ per giocatore│ ││
│ │ └────────────────────────────┘  ││
│ │ [+ Aggiungi Fascia]             ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**Problemi:**
- ❌ Form troppo lungo verticalmente
- ❌ Input piccoli per touch
- ❌ Pulsanti ⬆️⬇️ difficili da cliccare
- ❌ Preview prezzo nascosto in basso
- ❌ Tutto espanso occupa troppo spazio
- ❌ No separazione logica tra config e fasce

---

### ✅ DOPO (Mobile-First Design)

```
┌─────────────────────────────────────┐
│ 🏟️ Gestione Campi                   │
│ Configura campi, fasce e prezzi     │
│                                     │
│ [Input grande...........] [➕]      │
│                                     │
│ 📌 Filtri:                          │
│ ◀ [Tutti (7)] [Indoor (4)] ... ▶   │
├─────────────────────────────────────┤
│                                     │
│ ┌─ Campo 1 - Centrale ─────────┐   │
│ │ 🎾 Campo 1                    │   │
│ │ [Pos.1] [Indoor] [🔥Riscald.] │   │
│ │              [⬆️]             │   │
│ │              [⬇️]             │   │
│ │                               │   │
│ │ [⚙️ Configura Campo]          │   │
│ └───────────────────────────────┘   │
│                                     │
│ ┌─ Campo 2 - Secondario ───────┐   │
│ │ (collapsed)                   │   │
│ └───────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ 📊 Statistiche                      │
│  [7]      [12]       [3]            │
│ Campi    Fasce     Promo            │
└─────────────────────────────────────┘
```

**Quando espanso con TAB:**

```
┌─ Campo 1 - Centrale ─────────────┐
│ 🎾 Campo 1 [Pos.1] [Indoor]      │
│              [⬆️] [⬇️]            │
│                                  │
│ [📝 Chiudi Configurazione]       │
├──────────────────────────────────┤
│ [⚙️ Info Base] [🕐 Fasce (3)]    │
├──────────────────────────────────┤
│                                  │
│ 📝 Nome Campo                    │
│ [Campo 1 - Centrale........]     │
│                                  │
│ 🏓 Tipologia    👥 Max Giocatori │
│ [Indoor ▼]      [4 ▼]           │
│                                  │
│ ┌─ Riscaldamento ──────────────┐│
│ │ [✓] 🔥 Riscaldamento         ││
│ │     Disponibile              ││
│ └──────────────────────────────┘│
│                                  │
│ [🗑️ Elimina Campo]               │
└──────────────────────────────────┘
```

**TAB Fasce Orarie:**

```
┌──────────────────────────────────┐
│ [⚙️ Info Base] [🕐 Fasce (3)] ●  │
├──────────────────────────────────┤
│                                  │
│ [➕ Aggiungi Fascia Oraria]      │
│                                  │
│ ┌─ Mattutina ──────────┐ [PROMO]│
│ │ 🕐 08:00-12:00        │ [✏️]  │
│ │ 💰 9.38€/p            │ [🗑️]  │
│ │ 📅 LMMGV              │        │
│ └──────────────────────┘        │
│                                  │
│ ┌─ Serale ─────────────┐        │
│ │ 🕐 18:00-23:00        │ [✏️]  │
│ │ 💰 12.50€/p           │ [🗑️]  │
│ │ 📅 LMMGVSD            │        │
│ └──────────────────────┘        │
└──────────────────────────────────┘
```

---

## 🎨 BOTTOM SHEET MODAL

**Quando tap su ✏️ o "Aggiungi Fascia":**

```
┌─────────────────────────────────────┐
│                 ───                 │ ← Drag Handle
│                                     │
│ ✏️ Modifica Fascia           [✕]   │
├─────────────────────────────────────┤
│                                     │
│ 📝 Nome Fascia                      │
│ [Mattutina..................]       │
│                                     │
│ 💰 Prezzo (€/ora)                   │
│ [25........................] €      │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ 90min x 4 giocatori             ││
│ │              9.38€              ││
│ │          per giocatore          ││
│ └─────────────────────────────────┘│
│                                     │
│ 🕐 Orario Fascia                    │
│ Da        A                         │
│ [08:00]   [12:00]                   │
│                                     │
│ 📅 Giorni Attivi                    │
│ ┌─┬─┬─┬─┬─┬─┬─┐                    │
│ │D│L│M│M│G│V│S│                    │
│ └─┴─┴─┴─┴─┴─┴─┘                    │
│  ○ ● ● ● ● ● ○                     │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ [✓] 🏷️ Fascia Promozionale      ││
│ │     Evidenzia con badge         ││
│ └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│ [  Annulla  ] [    ✓ Salva    ]    │
└─────────────────────────────────────┘
```

---

## 🎯 CARATTERISTICHE CHIAVE

### 1. **Sticky Header** 📌
```
┌─────────────────────────────────────┐
│ 🏟️ Gestione Campi           ← STICKY
│ [Input...........] [➕]              │
│ ◀ [Filtri scrollabili....] ▶        │
├─────────────────────────────────────┤
│                                     │
│ ... contenuto scrollabile ...       │
│                                     │
└─────────────────────────────────────┘
```

### 2. **Tab System** 📑
```
┌──────────────────────────────────┐
│ [⚙️ Info Base] [🕐 Fasce (3)]    │ ← Tabs
├──────────────────────────────────┤
│     ─────────                    │ ← Active indicator
│                                  │
│   Tab content area...            │
│                                  │
└──────────────────────────────────┘
```

### 3. **Compact Cards** 🎴
```
┌─ Mattutina ──────────────┐ 🏷️PROMO
│ Mattutina                │
│ 🕐 08:00-12:00           │
│ 💰 9.38€/p   📅 LMMGV    │ [✏️]
│                          │ [🗑️]
└──────────────────────────┘
```

### 4. **Day Toggles** 📅
```
┌─┬─┬─┬─┬─┬─┬─┐
│D│L│M│M│G│V│S│
└─┴─┴─┴─┴─┴─┴─┘
 ○ ● ● ● ● ● ○

○ = Non selezionato (grigio)
● = Selezionato (verde)
```

### 5. **Stats Footer** 📊
```
┌─────────────────────────────────┐
│     [7]      [12]       [3]     │
│   Campi    Fasce     Promo      │
└─────────────────────────────────┘
```

---

## 📐 RESPONSIVE BEHAVIOR

### 📱 Mobile (< 768px)
- Bottom sheet full width
- Tabs stacked orizzontalmente
- Filtri scrollabili con frecce
- Day toggles 7 colonne (lettere singole)
- Input e pulsanti XL

### 📱 Tablet (768px - 1024px)
- Bottom sheet max-width 2xl (672px) centrato
- Tabs mostrano nomi completi
- Più filtri visibili
- Day toggles con nomi completi
- Layout misto

### 💻 Desktop (> 1024px)
- Usa componente originale `AdvancedCourtsManager`
- Layout a colonne
- Tutti i controlli inline
- No bottom sheet (usa modal centrato se necessario)

---

## 🎨 COLOR PALETTE

### Gradient Primary
```css
background: linear-gradient(to right, #3b82f6, #a855f7);
/* Blue 500 → Purple 500 */
```

### Status Colors
- **Success**: `bg-emerald-500` (fasce attive)
- **Warning**: `bg-yellow-400` (badge promo)
- **Danger**: `bg-red-500` (delete)
- **Info**: `bg-blue-100` (badges info)

### Dark Mode
```css
.dark .bg-white → .dark:bg-gray-800
.dark .text-gray-900 → .dark:text-white
.dark .border-gray-200 → .dark:border-gray-700
```

---

## 🔄 USER FLOW DIAGRAM

```
Start
  │
  ├─► Visualizza lista campi (collapsed)
  │
  ├─► Filtra per tipo? ──► Tap filtro ──► Lista si aggiorna
  │                                         │
  ├─► Aggiungi campo? ──► Tap ➕ ──┐        │
  │                                 │        │
  ├─► Espandi campo ──► Tap card   │        │
  │         │                       │        │
  │         ├─► Tab Info Base       │        │
  │         │     └─► Modifica nome,│tipo   │
  │         │                       │        │
  │         └─► Tab Fasce           │        │
  │               │                 │        │
  │               ├─► Tap ➕ ───────┼───────►│
  │               │                 │        │
  │               └─► Tap ✏️ ───────┼───────►│
  │                                 │        │
  │                        Bottom Sheet     │
  │                        ┌─────────┐      │
  │                        │ Compila │      │
  │                        │  Form   │      │
  │                        └────┬────┘      │
  │                             │           │
  │                        Tap Salva        │
  │                             │           │
  │                        Chiude Sheet ────┘
  │                             │
  │                        Lista Aggiornata
  │
End
```

---

## ⚡ PERFORMANCE TIPS

### Lazy Loading (Futuro)
```javascript
const AdvancedCourtsManager_Mobile = lazy(() =>
  import('./AdvancedCourtsManager_Mobile.jsx')
);
```

### Memoization (se liste grandi > 50)
```javascript
const MemoizedCourtCard = React.memo(MobileCourtCard);
```

### Virtual Scrolling (se > 100 campi)
```javascript
import { FixedSizeList } from 'react-window';
```

---

## 🧪 TEST SCENARIOS

### Scenario 1: Aggiungere Campo
1. ✅ Input accetta testo
2. ✅ Pulsante ➕ disabilitato se vuoto
3. ✅ Tap ➕ aggiunge campo
4. ✅ Input si svuota
5. ✅ Campo appare in lista

### Scenario 2: Modificare Fascia
1. ✅ Tap card espande
2. ✅ Tab Fasce mostra lista
3. ✅ Tap ✏️ apre bottom sheet
4. ✅ Form pre-compilato
5. ✅ Modifiche salvano
6. ✅ Bottom sheet chiude
7. ✅ Card aggiornata

### Scenario 3: Riordinare
1. ✅ Tap ⬆️ sposta su
2. ✅ Tap ⬇️ sposta giù
3. ✅ Primo campo: ⬆️ disabled
4. ✅ Ultimo campo: ⬇️ disabled
5. ✅ Ordine persiste

### Scenario 4: Dark Mode
1. ✅ Sfondo si inverte
2. ✅ Testo leggibile
3. ✅ Border visibili
4. ✅ Gradient si adattano

---

## 📝 CHEAT SHEET

### Aggiungere Campo
`Input → Tap ➕ → Campo creato`

### Configurare Campo
`Tap Card → Tap Configura → Tab Info → Compila`

### Aggiungere Fascia
`Tab Fasce → Tap ➕ → Bottom Sheet → Compila → Salva`

### Modificare Fascia
`Tap ✏️ → Bottom Sheet → Modifica → Salva`

### Eliminare Fascia
`Tap 🗑️ → Conferma`

### Riordinare
`Tap ⬆️⬇️ nell'header del campo`

### Filtrare
`Scroll filtri → Tap tipo`

---

**Nota Finale**: Questo redesign è stato creato seguendo le linee guida di Material Design e iOS Human Interface Guidelines per garantire una UX nativa e familiare su entrambe le piattaforme.

📱 **Happy Mobile Managing!** 🎾
