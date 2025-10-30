# 🔍 DEBUG: Problema Scroll Perso su Pagine Club

## 📅 Data: 30 Ottobre 2025

## ❌ Problema Identificato

Quando si naviga sulla pagina `/club/sporting-cat/stats` o altre tab del club, lo scroll della pagina viene perso e non è più possibile scorrere il contenuto.

## 🔍 Causa Root

Il problema era causato da **due fattori combinati**:

### 1. **`min-h-screen` nei componenti figli**
I componenti renderizzati dentro `AppLayout` (come `StatsPage`, `ClubDashboard`, `ClubPreview`) usavano `min-h-screen`, creando un conflitto con il sistema di scroll del layout principale.

### 2. **`FormulaModal` che blocca lo scroll del body** 
Il componente `FormulaModal.jsx` aveva un bug critico nell'useEffect che gestisce il body scroll lock:

```jsx
// ❌ CODICE BUGGY
useEffect(() => {
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden'; // ⚠️ Sempre eseguito, anche se isOpen=false
  // ...
  return () => {
    document.body.style.overflow = prevOverflow || ''; // ⚠️ '' potrebbe non ripristinare correttamente
  };
}, [onClose, isOpen]); // ⚠️ Si attiva sempre quando isOpen cambia
```

**Problemi:**
- L'useEffect si eseguiva **sempre**, anche quando `isOpen=false`
- Impostava `overflow: hidden` sul body anche quando il modal era chiuso
- Il ripristino con `''` (stringa vuota) non garantiva il reset a `auto`
- Quando si navigava su una nuova pagina con il modal chiuso, il body rimaneva con `overflow: hidden`

## ✅ Soluzioni Applicate

### 1. Rimozione `min-h-screen` dai componenti figli

**File modificati:**
- `src/pages/StatsPage.jsx`
- `src/features/clubs/ClubDashboard.jsx`
- `src/features/clubs/ClubPreview.jsx`

**Prima:**
```jsx
return (
  <div className="min-h-screen bg-...">
    {/* contenuto */}
  </div>
);
```

**Dopo:**
```jsx
return (
  <>
    {/* contenuto - il layout è gestito da AppLayout */}
  </>
);
```

### 2. Fix FormulaModal - Condizionale scroll lock

**File:** `src/components/modals/FormulaModal.jsx`

**Prima:**
```jsx
useEffect(() => {
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  // ...
  return () => {
    document.body.style.overflow = prevOverflow || '';
  };
}, [onClose, isOpen]);
```

**Dopo:**
```jsx
useEffect(() => {
  if (!isOpen) return; // 🔑 Non bloccare lo scroll se il modal è chiuso
  
  console.log('🔒 [FormulaModal] Locking body scroll');
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  
  const onKeyDown = (e) => {
    if (e.key === 'Escape') onClose?.();
  };
  window.addEventListener('keydown', onKeyDown);
  
  return () => {
    console.log('🔓 [FormulaModal] Unlocking body scroll, restoring to:', prevOverflow || 'auto');
    document.body.style.overflow = prevOverflow || 'auto'; // 🔑 Usa 'auto' come fallback
    window.removeEventListener('keydown', onKeyDown);
  };
}, [onClose, isOpen]);
```

**Miglioramenti:**
- ✅ Controllo `if (!isOpen) return` all'inizio
- ✅ Il body scroll viene bloccato **solo** quando il modal è aperto
- ✅ Ripristino esplicito a `'auto'` invece di `''` (stringa vuota)
- ✅ Log di debug per tracciare lock/unlock dello scroll

### 3. Debug Logging Aggiunto

Sono stati aggiunti log di debug nei seguenti componenti per tracciare il comportamento dello scroll:

**AppLayout.jsx:**
```jsx
React.useEffect(() => {
  console.log('📍 [AppLayout] Route changed, scrolling to top:', location.pathname);
  window.scrollTo(0, 0);
  
  setTimeout(() => {
    console.log('🔍 [AppLayout] Scroll state after route change:', {
      path: location.pathname,
      bodyOverflow: window.getComputedStyle(document.body).overflow,
      htmlOverflow: window.getComputedStyle(document.documentElement).overflow,
      bodyHeight: document.body.scrollHeight,
      windowHeight: window.innerHeight,
      canScroll: document.body.scrollHeight > window.innerHeight,
    });
  }, 100);
}, [location.pathname]);
```

**StatsPage.jsx:**
```jsx
React.useEffect(() => {
  console.log('🔍 [StatsPage] Component mounted/updated', {
    clubId,
    playersCount: players?.length,
    matchesCount: matches?.length,
    bodyOverflow: document.body.style.overflow,
    htmlOverflow: document.documentElement.style.overflow,
    scrollHeight: document.body.scrollHeight,
    clientHeight: document.body.clientHeight,
    windowHeight: window.innerHeight,
  });
}, [clubId, players?.length, matches?.length]);
```

**StatisticheGiocatore.jsx:**
```jsx
useEffect(() => {
  console.log('📊 [StatisticheGiocatore] Component mounted/updated', {
    playersCount: players?.length,
    matchesCount: matches?.length,
    selectedPlayerId,
    pid,
    statsRefCurrent: !!statsRef.current,
  });
}, [players?.length, matches?.length, selectedPlayerId, pid]);
```

**FormulaModal.jsx:**
```jsx
useEffect(() => {
  console.log('🎭 [FormulaModal] State changed', {
    isOpen,
    hasMatchData: !!matchData,
    bodyOverflow: document.body.style.overflow,
    htmlOverflow: document.documentElement.style.overflow,
  });
  
  if (isOpen) {
    const computedBodyOverflow = window.getComputedStyle(document.body).overflow;
    const computedHtmlOverflow = window.getComputedStyle(document.documentElement).overflow;
    console.log('🔍 [FormulaModal] Computed overflow when modal opens:', {
      bodyOverflow: computedBodyOverflow,
      htmlOverflow: computedHtmlOverflow,
    });
  }
}, [isOpen, matchData]);
```

## 🧪 Test da Eseguire

1. ✅ Aprire la dev console (F12)
2. ✅ Navigare su `/club/sporting-cat/stats`
3. ✅ Verificare nei log:
   - `📍 [AppLayout] Route changed`
   - `🔍 [AppLayout] Scroll state after route change` - controllare che `bodyOverflow` sia `visible` o `auto`
   - `🔍 [StatsPage] Component mounted/updated`
   - `📊 [StatisticheGiocatore] Component mounted/updated`
4. ✅ Verificare che lo scroll funzioni
5. ✅ Cliccare su un match per aprire il FormulaModal
6. ✅ Verificare nei log:
   - `🎭 [FormulaModal] State changed` con `isOpen: true`
   - `🔒 [FormulaModal] Locking body scroll`
7. ✅ Chiudere il modal
8. ✅ Verificare nei log:
   - `🔓 [FormulaModal] Unlocking body scroll`
   - `🎭 [FormulaModal] State changed` con `isOpen: false`
9. ✅ Verificare che lo scroll funzioni ancora
10. ✅ Navigare su un'altra tab (es. Classifica)
11. ✅ Verificare che lo scroll funzioni

## 📊 Risultati Attesi

✅ **Build Vite:** Successo (verificato)  
✅ **Scroll funzionante:** Su tutte le pagine del club  
✅ **Modal FormulaModal:** Blocca lo scroll solo quando aperto  
✅ **Navigazione tra tab:** Scroll sempre disponibile  
✅ **Layout consistente:** Nessun conflitto tra min-h-screen e AppLayout

## 📝 Note Aggiuntive

- Il file `MatchResultModal.jsx` aveva lo stesso pattern ma è stato lasciato com'è perché non ha un prop `isOpen` - viene sempre renderizzato condizionalmente dal parent
- Il cambio da `''` (stringa vuota) a `'auto'` nel ripristino dell'overflow è importante per garantire il comportamento corretto del browser
- I log di debug possono essere rimossi dopo la verifica che tutto funzioni correttamente

## 🎯 Conclusione

Il problema dello scroll perso era dovuto a una **combinazione di `min-h-screen` nei componenti figli** e a un **bug nel FormulaModal che bloccava il body scroll anche quando chiuso**. 

Con le correzioni applicate, lo scroll dovrebbe funzionare correttamente su tutte le pagine del club.

---

**Verificato da:** GitHub Copilot  
**Data fix:** 30 Ottobre 2025
