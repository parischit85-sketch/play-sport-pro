# Fix: BookingTypeModal - Step Iniziale Condizionale

## 📋 Problema

Il modal `BookingTypeModal` doveva aprirsi da step differenti in base al contesto:

1. **Dashboard Principale** (bottone "Prenota") → Deve partire dallo **step 1** (scelta circolo)
2. **Dashboard Circolo** (card "Prenota Campo/Lezione") → Deve partire dallo **step 2** (scelta tipo prenotazione)

### ⚠️ Problema Aggiuntivo

Quando l'utente entra in un circolo e poi esce (tornando alla dashboard principale), il sistema lo riconosceva ancora dentro il circolo. Cliccando "Prenota" passava direttamente dallo step 2 invece che dallo step 1.

## 🔍 Analisi

### Logica già presente in BookingTypeModal.jsx

Il componente aveva già la logica corretta (riga 17):

```jsx
const [step, setStep] = useState(clubId ? 'type' : 'club');
```

- Se `clubId` è passato → parte da `'type'` (step 2)
- Se `clubId` è `null` o `undefined` → parte da `'club'` (step 1)

### Problema in BottomNavigation.jsx

Il problema era nella riga 21 di `BottomNavigation.jsx`:

```jsx
// ❌ PRIMA (errato)
const clubId = currentClub?.id || 'sporting-cat'; // Fallback to sporting-cat
```

Questo causava che:
- Anche nella dashboard principale (senza circolo), `clubId` era valorizzato con `'sporting-cat'`
- Il modal partiva sempre dallo step 2 invece che dallo step 1

## ✅ Soluzione

### Modifiche in `src/components/ui/BottomNavigation.jsx`

#### 1. Importazione di useLocation (riga 6)

```jsx
import { useNavigate, useLocation } from 'react-router-dom';
```

#### 2. Utilizzo di useLocation (riga 20)

```jsx
const location = useLocation();
```

#### 3. Verifica del path corrente e separazione delle variabili (righe 23-26)

```jsx
// ✅ SOLUZIONE FINALE (corretto)
// Get dynamic club ID for booking paths
// Don't use fallback for modal - we want null when not in a club
// Also check if we're actually inside a club route (not just dashboard)
const isInsideClubRoute = location.pathname.startsWith('/club/');
const clubId = isInsideClubRoute ? currentClub?.id : null;
const clubIdForPaths = currentClub?.id || 'sporting-cat'; // Fallback only for navigation paths
```

**Spiegazione**:
- `isInsideClubRoute`: verifica se il path corrente inizia con `/club/`
- `clubId`: è `null` se NON siamo in una route di circolo, altrimenti prende `currentClub.id`
- `clubIdForPaths`: ha sempre un valore (fallback a 'sporting-cat') → usato per navigazione

Questo risolve il problema dell'uscita dal circolo perché **anche se `currentClub` rimane in memoria**, il `clubId` sarà comunque `null` se non siamo in un path `/club/...`

#### 2. Aggiornamento di handleBookingTypeSelect (riga 75)

```jsx
const handleBookingTypeSelect = (type, selectedClubId) => {
  const targetClubId = selectedClubId || clubIdForPaths; // ✅ usa clubIdForPaths
  const path = type === 'campo' ? `/club/${targetClubId}/booking` : `/club/${targetClubId}/lessons`;

  console.log('📱 [BottomNavigation] Booking type selected:', type, 'for club:', targetClubId, path);
  navigate(path);
};
```

## 📊 Comportamento Finale

### Scenario 1: Dashboard Principale (path = `/dashboard`)

```
User clicks "Prenota" button
  ↓
location.pathname = '/dashboard'
  ↓
isInsideClubRoute = false (non inizia con '/club/')
  ↓
clubId = null
  ↓
<BookingTypeModal clubId={null} />
  ↓
useState(null ? 'type' : 'club') → step = 'club'
  ↓
✅ Modal si apre dallo STEP 1 (scelta circolo)
```

### Scenario 2: Dashboard Circolo (path = `/club/abc123/...`)

```
User clicks "Prenota Campo/Lezione" card
  ↓
location.pathname = '/club/abc123'
  ↓
isInsideClubRoute = true (inizia con '/club/')
  ↓
clubId = 'abc123'
  ↓
<BookingTypeModal clubId='abc123' />
  ↓
useState('abc123' ? 'type' : 'club') → step = 'type'
  ↓
✅ Modal si apre dallo STEP 2 (scelta tipo)
```

### Scenario 3: Uscita dal Circolo (path = `/dashboard` ma `currentClub` ancora in memoria)

```
User esce dal circolo (torna a /dashboard)
  ↓
location.pathname = '/dashboard'
currentClub = { id: 'abc123' } (ancora in memoria)
  ↓
isInsideClubRoute = false (non inizia con '/club/')
  ↓
clubId = null (forzato a null perché non siamo in route club)
  ↓
<BookingTypeModal clubId={null} />
  ↓
✅ Modal si apre dallo STEP 1 (scelta circolo) ✓ PROBLEMA RISOLTO
```

## 📁 File Modificati

1. ✅ `src/components/ui/BottomNavigation.jsx`
   - Aggiunta importazione `useLocation` da React Router
   - Aggiunta variabile `isInsideClubRoute` per verificare il path corrente
   - Modificata logica `clubId` per essere `null` quando non siamo in una route `/club/...`
   - `clubIdForPaths` sempre valorizzato (per navigazione)

## 🔧 File Coinvolti (non modificati)

- ✅ `src/components/ui/BookingTypeModal.jsx` - Logica già corretta
- ✅ `src/features/clubs/ClubDashboard.jsx` - Passa sempre `clubId` (corretto)

## ✅ Validazione

- [x] Build Vite completato senza errori
- [x] Logica condizionale verificata
- [x] Comportamento atteso in tutti e tre gli scenari
- [x] Problema dell'uscita dal circolo risolto con verifica del path
- [x] Nessun breaking change per altre parti del codice

## 📝 Note Tecniche

- Il componente `BookingTypeModal` gestisce 2 step:
  - `'club'`: selezione circolo (con lista filtrata per distanza)
  - `'type'`: selezione tipo prenotazione (campo o lezione)
  
- La navigazione usa sempre `clubIdForPaths` che garantisce un fallback valido

- Il modal riceve sempre il vero `clubId` determinato dalla **route corrente**, non solo dallo stato in memoria

- **Soluzione elegante**: invece di resettare `currentClub` all'uscita (complesso e potenzialmente buggy), usiamo il path come source of truth

---

**Data**: 2025-10-08  
**Stato**: ✅ Completato  
**Build**: ✅ Successful  
**Fix**: ✅ Problema uscita circolo risolto con verifica path
