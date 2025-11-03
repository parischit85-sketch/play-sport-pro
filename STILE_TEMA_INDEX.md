# 📖 INDICE DOCUMENTAZIONE STILE - Play Sport Pro

**Data:** 3 Novembre 2025  
**Obiettivo:** Catalogazione rapida della documentazione di styling

---

## 📚 Documenti Principali

### 1. 🎨 [STILE_TEMA_DESIGN_SYSTEM.md](./STILE_TEMA_DESIGN_SYSTEM.md) - **DOCUMENTO BASE**
**Quando leggerlo:** SEMPRE all'inizio  
**Contiene:**
- ✅ Panoramica del tema (Dark Mode Forzato)
- ✅ Architettura di styling (Theme System + Design System)
- ✅ Palette colori completa
- ✅ Sistema di spacing e tipografia
- ✅ Componenti e pattern base
- ✅ **Come aggiungere nuove pagine** (CRITICO)
- ✅ Template copy/paste
- ✅ Checklist pagine

**Uso Rapido:**
```javascript
import { themeTokens } from '@lib/theme.js';
const T = themeTokens();
<div className={T.pageBg}>Pagina</div>
```

---

### 2. 🔧 [STILE_TEMA_DESIGN_SYSTEM_AVANZATO.md](./STILE_TEMA_DESIGN_SYSTEM_AVANZATO.md) - **DOCUMENTO AVANZATO**
**Quando leggerlo:** Per componenti complessi  
**Contiene:**
- ✅ Componenti avanzati (Accordion, Tab, Toast, Table, Search, Rating, Progress)
- ✅ Pattern responsive
- ✅ Animazioni custom
- ✅ Varianti di stato (disabled, loading, error, active)
- ✅ Troubleshooting comuni
- ✅ Checklist per componenti complessi

**Esempi:**
```javascript
// Collapsible
<CollapsibleSection title="...">Content</CollapsibleSection>

// Tab interface
<TabbedContent tabs={...} />

// Toast
<Toast message="..." type="success" />
```

---

## 🎯 Quick Reference

### Cosa Cercare in Questo Documento?

| Domanda | Dove Trovare | Link |
|---------|--------------|------|
| **Come creo una nuova pagina?** | STILE_TEMA_DESIGN_SYSTEM.md | [Link](#come-aggiungere-nuove-pagine) |
| **Quali colori uso?** | STILE_TEMA_DESIGN_SYSTEM.md | [Link](#palette-colori) |
| **Quante colonne per il layout?** | STILE_TEMA_DESIGN_SYSTEM.md | [Link](#layout-patterns) |
| **Come faccio un accordion?** | STILE_TEMA_DESIGN_SYSTEM_AVANZATO.md | [Link](#collapseaccordion) |
| **Come gestisco lo stato loading?** | STILE_TEMA_DESIGN_SYSTEM_AVANZATO.md | [Link](#loading-state) |
| **Responsive mobile?** | STILE_TEMA_DESIGN_SYSTEM_AVANZATO.md | [Link](#pattern-responsive) |
| **Un colore non va?** | STILE_TEMA_DESIGN_SYSTEM_AVANZATO.md | [Link](#problemi-comuni-e-soluzioni) |

---

## 📁 File Tecnici di Riferimento

```
src/lib/
├── theme.js                    ← TOKENS (T.pageBg, T.btnPrimary, etc)
├── design-system.js            ← PATTERN (DS_LAYOUT, DS_COLORS, etc)

tailwind.config.js              ← Config colori, animazioni
index.css                       ← Animazioni custom, mobile support
```

### Leggere i File Tecnici se:
- Devi estendere i token
- Devi aggiungere nuove animazioni
- Devi cambiare la configurazione Tailwind

---

## 🚀 Flusso di Lavoro

### Aggiungo una Nuova Pagina

1. **Apri:** STILE_TEMA_DESIGN_SYSTEM.md
2. **Vai a:** Sezione "Come Aggiungere Nuove Pagine"
3. **Copia:** Template più simile al tuo caso
4. **Personalizza** con i tuoi dati
5. **Verifica:** Checklist per Nuove Pagine

### Creo un Componente Complesso

1. **Apri:** STILE_TEMA_DESIGN_SYSTEM_AVANZATO.md
2. **Cerca:** Il tipo di componente (Accordion, Tab, Toast, etc)
3. **Copia:** Il codice dell'esempio
4. **Adatta:** Al tuo caso specifico
5. **Verifica:** Checklist per Componenti Complessi

### Ho un Problema di Stile

1. **Apri:** STILE_TEMA_DESIGN_SYSTEM_AVANZATO.md
2. **Vai a:** "Problemi Comuni e Soluzioni"
3. **Trovi:** Il tuo problema e la soluzione
4. **Se non trovi:** Vedi next point

### Mi Serve Uno Stato Speciale

1. **Apri:** STILE_TEMA_DESIGN_SYSTEM_AVANZATO.md
2. **Vai a:** "Varianti di Stato"
3. **Copia:** Il pattern che serve (disabled, loading, error, etc)

---

## 💾 Come Usare Questa Documentazione

### Opzione A: Copy/Paste Diretta
```
1. Leggi il documento
2. Trova l'esempio più simile
3. COPIA tutto il codice
4. INCOLLA nel tuo file
5. Personalizza
```

### Opzione B: Understand → Implement
```
1. Leggi l'explanation nel documento
2. Capisci come funziona
3. Implementa seguendo il pattern
4. Accerta che rispetta le regole
```

### Opzione C: Learn from Source
```
1. Apri i file tecnici (theme.js, design-system.js)
2. Leggi i commenti
3. Capisci la struttura
4. Estendi dove serve
```

---

## 🎨 Colori Rapidi

### Background
- Pagina: `bg-gray-900`
- Card: `bg-gray-800`
- Hover: `bg-gray-700`

### Testo
- Primario: `text-white`
- Secondario: `text-gray-300`
- Muted: `text-gray-400`

### Accento
- Primary: `blue-500`
- Success: `green-400`
- Error: `rose-400`
- Warning: `amber-400`

---

## 📏 Spacing Rapido

- Piccolo: `p-2` (8px)
- Normale: `p-4` (16px)
- Grande: `p-6` (24px)
- Extra: `p-8` (32px)

---

## 🎭 Componenti Pronti

| Componente | Documento | Nota |
|-----------|-----------|------|
| Button | BASE | Usa `T.btnPrimary` |
| Card | BASE | Usa pattern card |
| Form | BASE | Usa `T.input` |
| Modal | BASE | Template completo |
| Accordion | AVANZATO | Per collapsible |
| Tab | AVANZATO | Per multi-section |
| Toast | AVANZATO | Per notifiche |
| Table | AVANZATO | Per data grid |
| Search | AVANZATO | Con dropdown |
| Rating | AVANZATO | Per feedback |
| Progress | AVANZATO | Per status |
| Badge | AVANZATO | Per chip/tag |

---

## ❓ FAQ Rapide

**D: Dov'è il nero? (text-black, bg-black)**
R: Non c'è! È dark mode forzato. Usa colori grigi scuri.

**D: Posso aggiungere nuovi colori?**
R: Sì, in `tailwind.config.js` e poi usali. Ma prima consulta le palette.

**D: Come supporto il light mode?**
R: Attualmente non supportato. Il progetto è Dark Mode Only.

**D: Che font usiamo?**
R: Sistema font via Tailwind (system-ui, Apple, etc). Vedi `index.css`.

**D: Mobile safe areas?**
R: Usa classi `safe-area-top`, `safe-area-bottom` per iOS.

**D: Come faccio transizioni smooth?**
R: Usa `T.transitionNormal` o `T.transitionFast`.

---

## 🔗 Link Diretti ai Documenti

- [STILE_TEMA_DESIGN_SYSTEM.md](./STILE_TEMA_DESIGN_SYSTEM.md) - Documento base completo
- [STILE_TEMA_DESIGN_SYSTEM_AVANZATO.md](./STILE_TEMA_DESIGN_SYSTEM_AVANZATO.md) - Componenti avanzati

---

## 📌 Ricorda

1. **LEGGI SEMPRE** il documento base prima di iniziare
2. **COPIA il pattern** che più si avvicina al tuo caso
3. **VERIFICA** con le checklist
4. **Se hai dubbi**, controlla i file sorgente (`theme.js`, `design-system.js`)

---

**Ultima Aggiornamento:** 3 Novembre 2025
