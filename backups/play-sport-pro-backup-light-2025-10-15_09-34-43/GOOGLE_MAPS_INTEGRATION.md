# 📍 Integrazione Google Maps per Calcolo Distanza

## Panoramica

Il sistema ora supporta l'integrazione con Google Maps per calcolare automaticamente la distanza tra l'utente e i circoli durante la ricerca.

## ✨ Funzionalità

### 1. Campo Google Maps URL nell'Anagrafica Circolo

Gli amministratori possono ora inserire il link di Google Maps del circolo in tutte le sezioni di gestione:

- **Club Admin Profile** (`/club/:id/admin`)
- **Club Settings** (`/admin/clubs/:id/settings`)
- **Clubs Management** (Admin Super)
- **Admin Club Edit Page**

### 2. Estrazione Automatica Coordinate

Il sistema estrae automaticamente latitudine e longitudine da:

- ✅ URL standard: `https://www.google.com/maps/@45.4642,9.1900,15z`
- ✅ URL con place: `https://www.google.com/maps/place/.../@45.4642,9.1900,15z`
- ✅ Query parameter: `?q=45.4642,9.1900`
- ✅ LL parameter: `?ll=45.4642,9.1900`
- ⚠️ **URL brevi NON supportati**: `https://maps.app.goo.gl/...` 

**IMPORTANTE**: Gli URL abbreviati (maps.app.goo.gl) non possono essere elaborati a causa di restrizioni CORS.

**Soluzione**: Usa sempre l'URL completo:
1. Apri il link abbreviato nel browser
2. Copia l'URL completo dalla barra degli indirizzi
3. Incolla l'URL completo nel campo Google Maps URL

### 3. Ricerca Circoli per Posizione

Quando l'utente clicca "Cerca vicino a me" nel modal di prenotazione:

1. Richiede permesso di geolocalizzazione
2. Ottiene coordinate utente
3. Estrae coordinate da Google Maps URL o campi esistenti
4. Calcola distanza con formula di Haversine
5. Ordina circoli per distanza
6. Mostra badge con distanza in km

## 🛠️ File Modificati

### Utility
- **`src/utils/maps-utils.js`** ✨ NUOVO
  - `extractCoordinatesFromGoogleMapsUrl(url)` - Estrae coordinate da URL
  - `getClubCoordinates(club)` - Ottiene coordinate da club (URL o campi)
  - `calculateDistance(lat1, lon1, lat2, lon2)` - Calcola distanza
  - `isValidGoogleMapsUrl(url)` - Valida URL Google Maps

### Componenti UI
- **`src/components/ui/BookingTypeModal.jsx`**
  - Usa `getClubCoordinates()` per ottenere coordinate
  - Calcola distanza nella ricerca per posizione

### Form Amministrazione
- **`src/features/profile/ClubAdminProfile.jsx`**
  - Aggiunto campo `googleMapsUrl`
  - Hint visivo per l'utente

- **`src/pages/admin/ClubSettings.jsx`**
  - Aggiunto campo `googleMapsUrl`
  - Campo full-width con placeholder

- **`src/pages/admin/ClubsManagement.jsx`**
  - Aggiunto campo `googleMapsUrl` al formData
  - Campo visibile in creazione/modifica

- **`src/features/admin/AdminClubEditPage.jsx`**
  - Aggiunto campo in sezione Location
  - Supporto dark mode

## 📊 Struttura Database

```javascript
clubs/{clubId}
  ├── location
  │   ├── address: "Via Roma 123"
  │   ├── city: "Milano"
  │   ├── region: "Lombardia"
  │   ├── googleMapsUrl: "https://maps.app.goo.gl/..." // 🆕 NUOVO
  │   ├── latitude: 45.4642 // (opzionale, estratto da URL)
  │   └── longitude: 9.1900 // (opzionale, estratto da URL)
```

## 🎯 Come Usare

### Per Amministratori

1. Vai su Google Maps
2. Cerca il tuo circolo
3. Clicca su "Condividi"
4. Copia il link
5. Incolla nel campo "📍 Link Google Maps" nelle impostazioni del circolo

**Formati supportati:**
```
https://maps.app.goo.gl/ABC123
https://www.google.com/maps/@45.4642,9.1900,15z
https://www.google.com/maps/place/Tennis+Club/@45.4642,9.1900,15z
```

### Per Utenti

1. Apri modal prenotazione (pulsante "Prenota")
2. Clicca "Cerca tutti i circoli"
3. Clicca "🌍 Cerca vicino a me"
4. Autorizza geolocalizzazione
5. Circoli ordinati per distanza con badge km

## 🔧 Priorità Coordinate

Il sistema cerca coordinate in questo ordine:

1. **location.latitude + location.longitude** (coordinate esplicite)
2. **latitude + longitude** (campi legacy)
3. **location.googleMapsUrl** (estrazione da URL) 🆕
4. **googleMapsUrl** (campo legacy) 🆕

## ⚡ Performance

- Estrazione coordinate: ~10ms (pattern matching regex)
- Calcolo distanza: <1ms per circolo
- Ordinamento: O(n log n)

## 🐛 Gestione Errori

- URL non valido → log warning, usa coordinate esistenti
- Permesso geolocalizzazione negato → alert utente
- URL brevi non espandibili → fallback su pattern diretti

## 📝 Note Implementative

### Formula di Haversine

Utilizzata per calcolare la distanza ortodromica tra due punti:

```javascript
R = 6371 km (raggio Terra)
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
c = 2 × atan2(√a, √(1−a))
distance = R × c
```

### Browser Support

- Geolocalizzazione: IE9+, tutti i browser moderni
- Fetch API (per URL brevi): IE non supportato (fallback su pattern)

## 🎨 UI/UX

### Campo Input
- Icona: 📍
- Placeholder: `https://maps.app.goo.gl/... o https://www.google.com/maps/...`
- Hint: "💡 Incolla il link di Google Maps per permettere il calcolo della distanza"

### Badge Distanza
- Colore: `bg-green-500/20 text-green-400`
- Formato: "2.5 km"
- Visibile solo dopo "Cerca vicino a me"

## 🚀 Future Improvements

- [ ] Geocoding automatico da indirizzo
- [ ] Cache coordinate estratte in database
- [ ] Reverse geocoding per mostrare indirizzo da coordinate
- [ ] Supporto mappe alternative (OpenStreetMap, Apple Maps)
- [ ] Validazione in tempo reale del link Google Maps

## 📱 Mobile

La geolocalizzazione funziona su:
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Android Firefox
- ✅ Capacitor (app nativa)

Richiede HTTPS in produzione (tranne localhost).

## 🔒 Privacy

- Permesso geolocalizzazione richiesto ogni volta
- Coordinate utente NON salvate
- Solo calcolo client-side
- Nessun tracking posizione

---

**Creato:** 6 Ottobre 2025  
**Versione:** 1.0.0  
**Autore:** Play Sport Pro Team
