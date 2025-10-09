# 🌍 GPS Auto-Location Strategy (UPDATED)

## 📋 Panoramica

Sistema di geolocalizzazione intelligente con richiesta all'avvio dell'app e visualizzazione distanze contestuale.

## ✨ Logica Implementata

### 1. **GPS Richiesto All'Avvio App** ✅
- ✅ `AppLayout.jsx` richiede GPS **una sola volta** al primo accesso
- ✅ Salvato in localStorage (`geoPermissionAskedV1`)
- ✅ Non si ripete ad ogni navigazione
- ✅ Toast informativo prima del prompt nativo del browser

### 2. **Distanze Mostrate SOLO in "Prenota" Flow** ✅
- ✅ **Prenota** → "Cerca tutti i circoli" → "Cerca vicino a me" → **MOSTRA DISTANZE**
- ❌ **Cerca Circoli** (card/pulsante) → **NON mostra distanze**

### 3. **Comportamento per Flusso**

| Flusso | Componente | Mostra Distanze? |
|--------|-----------|------------------|
| Dashboard → "Cerca Circoli" | `ClubSearch.jsx` | ❌ NO |
| BottomNav → "Prenota" → Modal → "Cerca tutti" → "Cerca vicino a me" | `BookingTypeModal.jsx` | ✅ SÌ |
| BottomNav → "Prenota" → Modal → Lista circoli preferiti | `BookingTypeModal.jsx` | ❌ NO |

---

## 🔧 Modifiche Tecniche

### **File 1**: `src/layouts/AppLayout.jsx` (Lines 33-115)

#### **GPS Request on App Startup**:
```javascript
React.useEffect(() => {
  // Execute only once per device/browser until user resets storage
  const FLAG_KEY = 'geoPermissionAskedV1';
  if (localStorage.getItem(FLAG_KEY)) return;

  // Avoid triggering on routes where a modal might already request location
  const skipPaths = ['/login', '/register'];
  if (skipPaths.includes(location.pathname)) return;

  // Mark flag early to prevent multiple fast mounts
  localStorage.setItem(FLAG_KEY, '1');

  const run = async () => {
    // Check permission state first
    let permissionState = 'prompt';
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const perm = await navigator.permissions.query({ name: 'geolocation' });
        permissionState = perm.state; // granted | denied | prompt
      } catch (_) {}
    }

    // If already granted, prefetch silently
    if (permissionState === 'granted') {
      const result = await getUserLocation({ 
        timeout: 5000, 
        highAccuracy: false, 
        cache: true, 
        cacheTTL: 180000 
      });
      if (!cancelled && result.status === LocationStatus.SUCCESS) {
        console.log('🌍 [AppLayout] Prefetched location. Accuracy:', result.accuracy);
      }
      return;
    }

    // If denied, do nothing
    if (permissionState === 'denied') {
      console.log('🚫 [AppLayout] Geolocation already denied.');
      return;
    }

    // Show informative toast BEFORE native prompt
    window.dispatchEvent(new CustomEvent('notify', {
      detail: {
        type: 'info',
        message: 'Vuoi trovare rapidamente i circoli vicini? Attiva la geolocalizzazione.'
      }
    }));

    // Delay to let user read the toast (1.2s)
    await new Promise(r => setTimeout(r, 1200));
    
    // Request GPS
    const result = await getUserLocation({ 
      timeout: 7000, 
      highAccuracy: false, 
      cache: true, 
      cacheTTL: 180000 
    });

    // Handle result
    switch (result.status) {
      case LocationStatus.SUCCESS:
        window.dispatchEvent(new CustomEvent('notify', { 
          detail: { type: 'success', message: 'Posizione rilevata!' } 
        }));
        break;
      case LocationStatus.PERMISSION_DENIED:
        window.dispatchEvent(new CustomEvent('notify', { 
          detail: { type: 'warning', message: 'Potrai sempre usare la ricerca per città.' } 
        }));
        break;
      // ... other cases
    }
  };

  run();

  return () => { cancelled = true; };
}, [location.pathname]);
```

**Caratteristiche**:
- ✅ **Una sola volta** per dispositivo (localStorage flag)
- ✅ **Toast informativo** prima del prompt nativo
- ✅ **Prefetch silenzioso** se permesso già concesso
- ✅ **Non blocca UI** - asincrono
- ✅ **Cache 3 minuti** per successive chiamate

---

### **File 2**: `src/features/clubs/ClubSearch.jsx`

#### **REMOVED Auto GPS Request** (Line 39-43):
```javascript
// ❌ REMOVED:
// useEffect(() => {
//   console.log('🌍 [ClubSearch] Auto-requesting GPS location on mount');
//   requestUserLocation();
// }, []);

// ✅ NOW:
// 🌍 GPS already requested by AppLayout on app startup
// No auto-request here - only when user clicks "Cerca Vicino a Me" in Prenota flow
```

#### **REMOVED Distance Calculation in nearbyClubs** (Lines 77-85):
```javascript
const nearbyClubs = useMemo(() => {
  if (!allClubs.length) return [];
  
  const nonAffiliatedClubs = allClubs.filter((club) => 
    club.isActive === true &&
    !affiliatedClubs.some((aff) => aff.id === club.id)
  );

  // ❌ NO distance calculation in "Cerca Circoli" flow
  // Distances shown ONLY in "Prenota" → "Cerca vicino a me" (BookingTypeModal)
  return nonAffiliatedClubs.slice(0, 6);
}, [allClubs, affiliatedClubs]); // ← Removed userLocation dependency
```

#### **REMOVED userLocation from ClubCard** (Lines 242, 278):
```javascript
// ❌ BEFORE:
<ClubCard club={club} userLocation={userLocation} />

// ✅ AFTER:
<ClubCard club={club} />
```

**Applicato in**:
- "I Tuoi Circoli" section
- "Circoli Nelle Vicinanze" section

---

### **File 3**: `src/components/ui/BookingTypeModal.jsx`

#### **Distanze SOLO in "Cerca vicino a me"** (Line 336):
```javascript
<button
  onClick={handleSearchLocation}  // ← Richiede GPS e mostra distanze
  className="..."
>
  Cerca vicino a me
</button>
```

**Flusso**:
```javascript
handleSearchLocation() 
  ↓
getUserLocation() // Richiede GPS (può usare cache da AppLayout)
  ↓
filteredClubs con coordinate
  ↓
ClubCard riceve userLocation → MOSTRA DISTANZE
```

**Lista circoli normali** (NO distanze):
```javascript
{filteredClubs.map((club) => (
  <button onClick={() => handleClubSelection(club.id)}>
    {/* NO userLocation passed - no distance badge */}
  </button>
))}
```

---

## 🎯 Flusso Utente Dettagliato

### **Scenario A: User opens app for first time**

```
1. App loads → AppLayout mounts
   ↓
2. localStorage.getItem('geoPermissionAskedV1') === null
   ↓
3. Check permission state
   ↓
4a. [Already granted] → Prefetch silently ✅
4b. [Prompt] → Show toast → Wait 1.2s → Request GPS
4c. [Denied] → Do nothing (user can input city manually later)
   ↓
5. localStorage.setItem('geoPermissionAskedV1', '1')
   ↓
6. Future app opens → Flag exists → NO re-request ✅
```

### **Scenario B: User clicks "Cerca Circoli"**

```
1. User clicks "Cerca Circoli" card in Dashboard
   ↓
2. Navigate to /clubs/search
   ↓
3. ClubSearch.jsx mounts
   ↓
4. ❌ NO GPS auto-request
   ↓
5. Shows:
   - "I Tuoi Circoli" (affiliated) - NO distances
   - "Circoli Nelle Vicinanze" (first 6) - NO distances
   - "Ricerca Avanzata" collapsible
```

### **Scenario C: User clicks "Prenota" → "Cerca vicino a me"**

```
1. User clicks "Prenota" button (BottomNav or Dashboard card)
   ↓
2. BookingTypeModal opens
   ↓
3. User selects "Cerca tutti i circoli"
   ↓
4. Search bar + "Cerca vicino a me" button appear
   ↓
5. User clicks "Cerca vicino a me"
   ↓
6. handleSearchLocation() called
   ↓
7. getUserLocation() - may use cache from AppLayout ✅
   ↓
8. Clubs sorted by distance
   ↓
9. ClubCard receives userLocation → SHOWS DISTANCE BADGES ✅
```

---

## 📊 Example Console Output

### **App Startup (First Time)**:
```javascript
🌍 [AppLayout] Checking geolocation permission state...
📢 [AppLayout] Showing informative toast before GPS prompt
⏱️  [AppLayout] Waiting 1.2s for user to read toast...
🌍 [AppLayout] Requesting GPS location...
✅ [AppLayout] Prefetched location. Accuracy: 47m
💾 [AppLayout] Saved flag: geoPermissionAskedV1 = 1
```

### **"Cerca Circoli" Page**:
```javascript
🔍 [ClubSearch] Component mounted
📋 [ClubSearch] Loading clubs...
✅ [ClubSearch] Loaded 24 clubs
📌 [ClubSearch] Showing "Circoli Nelle Vicinanze" (NO distances)
```

### **"Prenota" → "Cerca vicino a me"**:
```javascript
📍 [BookingTypeModal] "Cerca vicino a me" clicked
🌍 [BookingTypeModal] Requesting GPS location...
✅ [BookingTypeModal] Using cached location from AppLayout
🧮 [BookingTypeModal] Calculating distances...
📊 [BookingTypeModal] Sorted clubs by distance:
   - Sporting Club Milano: 1.2km
   - Tennis Bonacossa: 2.5km
   - Circolo Vela: 3.8km
✅ [BookingTypeModal] Showing clubs with distance badges
```

---

## ✅ Checklist Testing

### **GPS at App Startup**:
- [ ] Prima apertura app → Popup GPS appare automaticamente
- [ ] Toast informativo mostrato prima del popup
- [ ] GPS granted → Console log "Prefetched location"
- [ ] GPS denied → No error, user can input city later
- [ ] Seconda apertura app → NO popup (flag già salvato)
- [ ] Clear localStorage → Popup riappare

### **"Cerca Circoli" Flow**:
- [ ] Click "Cerca Circoli" card/button
- [ ] "I Tuoi Circoli" → NO badge distanza
- [ ] "Circoli Nelle Vicinanze" → NO badge distanza
- [ ] "Ricerca Avanzata" → Ricerca per testo → NO distanza

### **"Prenota" Flow**:
- [ ] Click "Prenota" button
- [ ] Select tipo prenotazione (campo/lezione)
- [ ] Click "Cerca tutti i circoli"
- [ ] Click "Cerca vicino a me"
- [ ] Clubs mostrati con badge distanza (1.2km, 500m, etc.)
- [ ] Ordinamento per distanza crescente

---

## 🚀 Build Status

```bash
✓ built in 50.28s
Exit Code: 0 ✅
```

---

## 📚 File Modificati

1. `src/layouts/AppLayout.jsx` - GPS request at app startup
2. `src/features/clubs/ClubSearch.jsx` - NO distance calculation
3. `src/components/ui/BookingTypeModal.jsx` - Distance ONLY in "cerca vicino a me"

---

## 🎯 Risultato Finale

✅ **GPS all'avvio app**: Richiesto UNA VOLTA, salvato in cache  
❌ **"Cerca Circoli"**: NO distanze mostrate  
✅ **"Prenota" → "Cerca vicino a me"**: Distanze calcolate e mostrate  
✅ **Performance**: Cache GPS (3 min), no richieste multiple  
✅ **UX**: Toast informativo, fallback città manuale  

---

**Data implementazione**: 8 Ottobre 2025  
**Build**: ✅ Successo (50.28s)  
**Strategy**: GPS at startup + Contextual distance display


## ✨ Funzionalità Implementate

### 1. **Richiesta GPS Automatica**
- ✅ All'apertura di "Cerca Circoli" viene richiesta automaticamente la posizione GPS
- ✅ Nessun bisogno di premere "Trova Circoli Vicini"
- ✅ Gestione errori con fallback manuale (inserimento città)

### 2. **Calcolo e Visualizzazione Distanze**
- ✅ I "Circoli Nelle Vicinanze" vengono ordinati per distanza crescente
- ✅ Visualizzazione distanza su ogni card (es: "1.2km" o "500m")
- ✅ Badge "Più vicino" sul circolo più prossimo
- ✅ Calcolo in tempo reale basato su coordinate GPS

### 3. **Ordinamento Intelligente**
- ✅ Primi 3 circoli mostrati sono i più vicini all'utente
- ✅ Se GPS non disponibile, mostra comunque i primi 6 circoli
- ✅ Logging dettagliato per debug delle distanze

---

## 🔧 Modifiche Tecniche

### **File**: `src/features/clubs/ClubSearch.jsx`

#### 1. **Import aggiunti**:
```javascript
import { calculateDistance } from '@services/clubs.js';
import { getClubCoordinates } from '../../utils/maps-utils.js';
```

#### 2. **Auto-request GPS on mount** (Lines 39-43):
```javascript
// 🌍 Auto-request GPS location on component mount
useEffect(() => {
  console.log('🌍 [ClubSearch] Auto-requesting GPS location on mount');
  requestUserLocation();
}, []); // Empty deps - only on mount
```

**Comportamento**:
- Si attiva **SOLO al primo mount** del componente
- Chiama `requestUserLocation()` che usa il servizio centralizzato `getUserLocation()`
- Timeout: 7 secondi, cache: 3 minuti

#### 3. **Calcolo distanze in `nearbyClubs` useMemo** (Lines 77-110):
```javascript
const nearbyClubs = useMemo(() => {
  if (!allClubs.length) return [];
  
  const nonAffiliatedClubs = allClubs.filter((club) => 
    club.isActive === true &&
    !affiliatedClubs.some((aff) => aff.id === club.id)
  );

  // Se abbiamo la posizione dell'utente, calcola distanze e ordina
  if (userLocation) {
    const clubsWithDistance = nonAffiliatedClubs
      .map((club) => {
        const coords = getClubCoordinates(club);
        if (!coords) return { ...club, distance: Infinity };
        
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          coords.lat,
          coords.lng
        );
        
        return { ...club, distance };
      })
      .sort((a, b) => a.distance - b.distance); // Ordina per distanza crescente
    
    console.log('🌍 [ClubSearch] Nearby clubs sorted by distance:', {
      userLocation,
      clubsCount: clubsWithDistance.length,
      first3: clubsWithDistance.slice(0, 3).map(c => ({ 
        name: c.name, 
        distance: c.distance 
      }))
    });
    
    return clubsWithDistance.slice(0, 6);
  }
  
  // Senza posizione, ritorna i primi 6
  return nonAffiliatedClubs.slice(0, 6);
}, [allClubs, affiliatedClubs, userLocation]);
```

**Logica**:
1. **Filtra** circoli attivi non affiliati
2. **Se GPS disponibile**:
   - Calcola distanza per ogni circolo usando `calculateDistance()`
   - Estrae coordinate con `getClubCoordinates(club)` (da Google Maps link)
   - **Ordina** per distanza crescente
   - Prende i primi 6
3. **Se GPS non disponibile**: Ritorna primi 6 senza ordinamento

---

## 🎯 Flusso Utente

### **Scenario: Utente apre "Cerca Circoli"**

```
1. User clicks "Cerca Circoli" dal Dashboard
   ↓
2. ClubSearch component mounts
   ↓
3. 🌍 Auto-request GPS (useEffect con deps=[])
   ↓
4. Browser chiede permesso GPS
   ↓
5a. [SUCCESSO] → userLocation salvato
    ↓
    nearbyClubs ricalcolato con distanze
    ↓
    Circoli ordinati per vicinanza
    ↓
    Badge distanza visibili (es: "1.2km")
    ↓
    "Più vicino" sul primo circolo
   
5b. [ERRORE] → Mostra input città manuale
    ↓
    User inserisce "Milano"
    ↓
    Geocoding → Coordinate
    ↓
    Ripete step 5a con coordinate città
```

---

## 📊 Esempio Output Console

```javascript
🌍 [ClubSearch] Auto-requesting GPS location on mount

🌍 [ClubSearch] Nearby clubs sorted by distance: {
  userLocation: { lat: 45.4642, lng: 9.1900 }, // Milano
  clubsCount: 15,
  first3: [
    { name: "Sporting Club Milano", distance: 1.2 },
    { name: "Tennis Club Bonacossa", distance: 2.5 },
    { name: "Circolo della Vela", distance: 3.8 }
  ]
}
```

---

## 🎨 UI/UX

### **Card "Circoli Nelle Vicinanze"**:
```jsx
<div className="grid gap-3 md:grid-cols-3">
  {nearbyClubs.slice(0, 3).map((club, index) => (
    <div key={club.id} className="relative">
      <ClubCard 
        club={club} 
        userLocation={userLocation} // ← Passa posizione per calcolo distanza
        compact={true} 
      />
      {index === 0 && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white ...">
          Più vicino
        </div>
      )}
    </div>
  ))}
</div>
```

### **Badge Distanza** (in `ClubCard.jsx`):
```jsx
{distance !== null && (
  <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 ...">
    {distance < 1 
      ? `${Math.round(distance * 1000)}m`  // 500m
      : `${distance.toFixed(1)}km`          // 1.2km
    }
  </div>
)}
```

---

## 🔒 Gestione Errori GPS

### **Stati possibili** (da `location-service.js`):

| Status | Comportamento |
|--------|---------------|
| `SUCCESS` | ✅ Salva coordinate, nasconde input manuale |
| `PERMISSION_DENIED` | ⚠️ Mostra "Permesso negato. Inserisci la tua città:" |
| `TIMEOUT` | ⏱️ Mostra "Timeout. Inserisci la tua città:" |
| `POSITION_UNAVAILABLE` | 📍 Mostra "Posizione non disponibile..." |
| `INSECURE_CONTEXT` | 🔒 Mostra "HTTPS richiesto..." |
| `BLOCKED_BY_POLICY` | 🚫 Mostra "Bloccata dalla Permissions-Policy..." |

**Fallback**: Input manuale città → Geocoding → Coordinate → Ricerca circoli

---

## ✅ Checklist Testing

- [ ] Aprire "Cerca Circoli"
- [ ] Verificare richiesta GPS automatica (popup browser)
- [ ] Confermare permesso GPS
- [ ] Verificare ordinamento circoli per distanza
- [ ] Controllare badge distanza su ogni card
- [ ] Verificare badge "Più vicino" sul primo circolo
- [ ] Testare negazione permesso → input città manuale
- [ ] Inserire "Milano" manualmente → verificare distanze

---

## 📝 Note Implementative

### **Performance**:
- ✅ `useMemo` per evitare ricalcoli inutili
- ✅ Cache GPS: 3 minuti (evita richieste multiple)
- ✅ Timeout GPS: 7 secondi (user experience veloce)

### **Dependency Management**:
```javascript
}, [allClubs, affiliatedClubs, userLocation]);
//                              ↑
//  Ricalcola quando GPS cambia
```

### **Logging**:
```javascript
console.log('🌍 [ClubSearch] Nearby clubs sorted by distance:', {
  userLocation,
  clubsCount: clubsWithDistance.length,
  first3: clubsWithDistance.slice(0, 3).map(c => ({ 
    name: c.name, 
    distance: c.distance 
  }))
});
```

---

## 🚀 Build Status

```bash
✓ built in 34.52s
Exit Code: 0 ✅
```

---

## 📚 File Correlati

- `src/features/clubs/ClubSearch.jsx` - Componente principale
- `src/features/clubs/ClubCard.jsx` - Visualizzazione card con distanza
- `src/services/clubs.js` - `calculateDistance()` Haversine formula
- `src/utils/maps-utils.js` - `getClubCoordinates()` estrazione coordinate
- `src/utils/location-service.js` - `getUserLocation()` servizio centralizzato

---

## 🎯 Risultato Finale

✅ **Apertura "Cerca Circoli"**: GPS richiesto automaticamente  
✅ **Circoli Nelle Vicinanze**: Ordinati per distanza crescente  
✅ **Distanze visualizzate**: Badge su ogni card (1.2km, 500m, ecc.)  
✅ **Badge "Più vicino"**: Sul circolo più prossimo all'utente  
✅ **Fallback città**: Input manuale se GPS non disponibile  

---

**Data implementazione**: 8 Ottobre 2025  
**Build**: ✅ Successo (34.52s)
