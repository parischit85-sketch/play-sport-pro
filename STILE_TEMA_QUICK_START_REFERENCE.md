# 📖 QUICK START GUIDE - Stile Play Sport Pro (1 Pagina)

---

## 📚 9 File di Documentazione Creati

| # | File | Dimensione | Tempo | Scopo |
|---|------|-----------|--------|---------|
| **1** | STILE_TEMA_START.md | - | 0.5 min | Benvenuto |
| **2** | STILE_TEMA_LEGGI_PRIMA.md | 10 KB | **5 min** | **👈 START** |
| **3** | STILE_TEMA_DESIGN_SYSTEM.md | 40 KB | **20 min** | **👈 MAIN** |
| **4** | STILE_TEMA_DESIGN_SYSTEM_AVANZATO.md | 30 KB | 10 min | Componenti |
| **5** | STILE_TEMA_INDEX.md | 15 KB | 5 min | Quick ref |
| **6** | STILE_TEMA_TECNICO.md | 15 KB | 10 min | Technical |
| **7** | STILE_TEMA_ISTRUZIONI.md | 10 KB | 5 min | Meta |
| **8** | STILE_TEMA_RIEPILOGO_COMPLETATO.md | 15 KB | 5 min | Summary |
| **9** | STILE_TEMA_VERIFICA_FINALE.md | 10 KB | 5 min | Check |

---

## 🚀 Tu Stai Qui

```
ORA ← STILE_TEMA_QUICK_START_REFERENCE.md (questo file!)
  ↓
5 min ← STILE_TEMA_LEGGI_PRIMA.md
  ↓
25 min ← STILE_TEMA_DESIGN_SYSTEM.md
  ↓
PRONTO! Crea la tua prima pagina
```

---

## 🎯 3 Cose Essenziali

### 1️⃣ Dark Mode Forzato
```javascript
// ✅ GIUSTO - Dark colors
<div className="bg-gray-900">
<h1 className="text-white">
<button className="bg-blue-500">

// ❌ SBAGLIATO - Light colors
<div className="bg-white">
<h1 className="text-black">
```

### 2️⃣ Usa i Token
```javascript
import { themeTokens } from '@lib/theme.js';
const T = themeTokens();

<div className={T.pageBg}>         // bg-gray-900
  <div className={T.cardBg}>       // bg-gray-800
    <h1 className={T.text}>        // text-white
      Titolo
    </h1>
    <button className={T.btnPrimary}>Azione</button>
  </div>
</div>
```

### 3️⃣ Template Copy/Paste
```jsx
// Struttura base pagina (da STILE_TEMA_DESIGN_SYSTEM.md)
export default function MiaPagella() {
  const T = themeTokens();
  
  return (
    <div className={T.pageBg}>
      <div className={`${T.headerBg} sticky top-0 z-10`}>
        <h1 className={`${T.text} text-2xl font-bold`}>Titolo</h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <section className="mb-6">
          <h2 className={`${T.neonText} text-xl font-semibold mb-4`}>
            Sezione
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
              <h3 className={`${T.text} font-semibold`}>Card</h3>
              <p className={T.subtext}>Descrizione</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
```

---

## 🎨 Colori Rapidi

| Uso | Tailwind | Hex | Codice |
|-----|----------|-----|--------|
| Background Pagina | `bg-gray-900` | `#0f172a` | `T.pageBg` |
| Background Card | `bg-gray-800` | `#1f2937` | `T.cardBg` |
| Background Hover | `bg-gray-700` | `#374151` | `hover:bg-gray-700` |
| Testo Primario | `text-white` | `#ffffff` | `T.text` |
| Testo Secondario | `text-gray-300` | `#d1d5db` | `T.subtext` |
| Testo Muted | `text-gray-400` | `#9ca3af` | Descrizioni |
| Primary Button | `bg-blue-500` | `#3b82f6` | `T.btnPrimary` |
| Success | `text-green-400` | `#4ade80` | `T.accentGood` |
| Error | `text-rose-400` | `#f43f5e` | `T.accentBad` |
| Warning | `text-amber-400` | `#facc15` | `T.accentWarning` |

---

## 📏 Spacing Rapido

```javascript
p-1 = 4px    p-2 = 8px    p-3 = 12px   p-4 = 16px
p-6 = 24px   p-8 = 32px   p-12 = 48px

gap-1 = 4px  gap-2 = 8px  gap-4 = 16px gap-6 = 24px
```

---

## 🔧 Componenti Rapidi

### Button
```jsx
<button className={T.btnPrimary}>Azione</button>
<button className={T.btnGhost}>Secondary</button>
```

### Input
```jsx
<input className={T.input} placeholder="..." />
<select className={`${T.input} cursor-pointer`}><option>...</option></select>
```

### Card
```jsx
<div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
  Contenuto
</div>
```

### Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {items.map(...)}
</div>
```

### Flex Between
```jsx
<div className="flex items-center justify-between">
  Left
  <div>Right</div>
</div>
```

---

## 📱 Mobile

```javascript
hidden md:block      // Hidden mobile, visible desktop
block md:hidden      // Visible mobile, hidden desktop
w-full md:w-1/2      // Full mobile, half desktop
text-sm md:text-base // Small mobile, normal desktop

// Safe areas iOS
<div className="safe-area-top safe-area-bottom">
```

---

## ⚡ Top Commands

### Creare una pagina
```
1. Leggi: STILE_TEMA_DESIGN_SYSTEM.md - "Come Aggiungere Pagine"
2. Copia il template
3. Personalizza
4. Verifica checklist
```

### Componente complesso
```
1. Cerca in: STILE_TEMA_DESIGN_SYSTEM_AVANZATO.md
2. Copia l'esempio
3. Adatta al tuo caso
```

### Problema di stile
```
1. Vedi: STILE_TEMA_DESIGN_SYSTEM_AVANZATO.md - "Problemi Comuni"
2. Trova il tuo problema
3. Applica la soluzione
```

---

## 🐛 Problemi Comuni (Quick Fixes)

| Problema | Soluzione |
|----------|-----------|
| Testo illeggibile | Usa `T.text` o `T.subtext` (mai `text-gray-500`) |
| Background assente | Aggiungi `${T.cardBg}` |
| Border inconsistente | Usa `${T.border}` |
| Bottone non visibile | Usa `T.btnPrimary` (mai colori custom) |
| Input non stilizzato | Usa `${T.input}` |
| Mobile rotto | Usa `grid-cols-1 md:grid-cols-X` |
| Modale dietro navbar | Aggiungi `z-50 fixed` |
| Testo troppo piccolo iOS | Usa `text-base` min (no `text-xs`) |
| Overflow mobile | Aggiungi `overflow-x-auto md:overflow-x-visible` |

---

## ✅ Checklist Pagina

```
Pagina quasi pronta? Verifica:

[ ] Import: import { themeTokens } from '@lib/theme.js';
[ ] Token: const T = themeTokens();
[ ] BG: <div className={T.pageBg}>
[ ] Card: Usate ${T.cardBg} ${T.border}
[ ] Testo: Usato T.text, T.subtext
[ ] Button: Usato T.btnPrimary
[ ] Responsive: Grid con grid-cols-1 md:grid-cols-X
[ ] Mobile: Testato su mobile
[ ] Hover: Buttons hanno hover effect
[ ] Transizioni: Usate T.transitionNormal
[ ] Checklist finito!
```

---

## 🎓 Learning Path

**Giorno 1 (30 min):**
- [ ] Leggi STILE_TEMA_LEGGI_PRIMA.md (5 min)
- [ ] Leggi STILE_TEMA_DESIGN_SYSTEM.md sezioni 1-3 (15 min)
- [ ] Scorri i template (10 min)

**Giorno 2 (30 min):**
- [ ] Leggi "Come Aggiungere Pagine" (10 min)
- [ ] Crea prima pagina (20 min)

**Giorno 3+ (On-demand):**
- [ ] Consulta documenti quando serve
- [ ] Usa snippets e template

---

## 📞 Domande?

| Domanda | Dove |
|---------|------|
| Come creo una pagina? | STILE_TEMA_DESIGN_SYSTEM.md |
| Quali colori uso? | STILE_TEMA_DESIGN_SYSTEM.md - Palette |
| Come faccio un accordion? | STILE_TEMA_DESIGN_SYSTEM_AVANZATO.md |
| Problema di stile? | STILE_TEMA_DESIGN_SYSTEM_AVANZATO.md - Problemi |
| Fretta? | STILE_TEMA_INDEX.md |
| Tecnico? | STILE_TEMA_TECNICO.md |

---

## 🚀 INIZIO ADESSO

**👉 LEGGI ADESSO:** [STILE_TEMA_LEGGI_PRIMA.md](./STILE_TEMA_LEGGI_PRIMA.md)

**Dopo 5 min leggi:** [STILE_TEMA_DESIGN_SYSTEM.md](./STILE_TEMA_DESIGN_SYSTEM.md)

**Dopo 25 min:** Crea la tua prima pagina!

---

**Let's go! 🚀🎨**

*Documentazione: 3 Novembre 2025*  
*Version: 1.0*  
*Status: ✅ Pronto*
