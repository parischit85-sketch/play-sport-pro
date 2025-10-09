# Fix Visibilità Circoli - Client-Side Filtering

## Data: 7 Ottobre 2025

## Problema
Gli utenti pubblici vedevano ancora i circoli disattivati (`isActive: false`) nonostante il sistema di attivazione fosse implementato.

**Causa**: Le Firestore Rules attuali sono completamente aperte in sviluppo (`allow read, write: if true`), quindi il controllo deve essere fatto lato client.

## Soluzione Implementata

### File Modificati

#### 1. `src/services/clubs.js`

**Funzione `getClubs`**:
```javascript
// Prima
return snapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}));

// Dopo  
const clubs = snapshot.docs
  .map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
  .filter((club) => {
    // If filters.includeInactive is true, show all clubs (for admin)
    if (filters.includeInactive) return true;
    // Otherwise only show activated clubs
    return club.isActive === true;
  });

return clubs;
```

**Funzione `searchClubs`**:
```javascript
// Prima
const isActive = clubData.subscription?.isActive !== false;

if (isVisible && isActive) {
  // ...
}

// Dopo
const isSubscriptionActive = clubData.subscription?.isActive !== false;
const isClubActive = clubData.isActive === true; // MUST be explicitly true

if (isVisible && isSubscriptionActive && isClubActive) {
  // ...
}
```

**Funzione `searchClubsByLocation`**:
```javascript
// Prima
if (!club.settings?.publicVisibility || !club.subscription?.isActive) {
  return false;
}

// Dopo
if (!club.settings?.publicVisibility || !club.subscription?.isActive) {
  return false;
}

// Check if club is activated
if (club.isActive !== true) {
  return false;
}
```

#### 2. `src/components/ui/BookingTypeModal.jsx`

**Funzione `loadClubs`**:
```javascript
// Prima
const allClubs = clubsSnap.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));

// Dopo
const allClubs = clubsSnap.docs
  .map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  // Filter only active clubs for public users
  .filter(club => club.isActive === true);
```

```javascript
// Prima
const clubsData = viewedClubs
  .filter(v => v.club !== null)
  .map(v => v.club);

// Dopo
const clubsData = viewedClubs
  .filter(v => v.club !== null && v.club.isActive === true)
  .map(v => v.club);
```

#### 3. `src/pages/admin/ClubsManagement.jsx`

**Fix rendering indirizzo**:
```javascript
// Prima
<span>
  {club.address}, {club.city}
</span>

// Dopo
<span>
  {typeof club.address === 'string' 
    ? `${club.address}${club.city ? `, ${club.city}` : ''}` 
    : club.location?.address || club.location?.city || 'Indirizzo non disponibile'}
</span>
```

**Fix filtro ricerca**:
```javascript
// Prima
const matchesSearch =
  club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  club.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  club.city?.toLowerCase().includes(searchTerm.toLowerCase());

// Dopo
const searchLower = searchTerm.toLowerCase();

const addressStr = typeof club.address === 'string' 
  ? club.address 
  : (club.location?.address || club.address?.street || '');

const cityStr = typeof club.city === 'string'
  ? club.city
  : (club.location?.city || club.address?.city || '');

const matchesSearch =
  club.name?.toLowerCase().includes(searchLower) ||
  addressStr.toLowerCase().includes(searchLower) ||
  cityStr.toLowerCase().includes(searchLower);
```

## Comportamento Attuale

### Per Utenti Pubblici
✅ Vedono SOLO circoli con `isActive: true`
✅ Non possono prenotare in circoli disattivati
✅ Ricerca circoli mostra solo quelli attivi
✅ Selezione circolo per prenotazioni filtra solo attivi

### Per Club-Admin
✅ Vedono sempre il proprio circolo (anche se `isActive: false`)
✅ Possono configurare circolo anche se in attesa
✅ Banner informativo se circolo non attivo

### Per Super-Admin
✅ Vedono TUTTI i circoli in `/admin/clubs`
✅ Possono attivare/disattivare circoli
✅ Filtri per stato (Tutti/In Attesa/Attivi/Disattivati)

## Componenti Protetti

### ✅ ClubSearch
Usa `searchClubs()` e `searchClubsByLocation()` → Filtrati automaticamente

### ✅ BookingTypeModal
Filtra circoli al caricamento → Solo circoli attivi

### ✅ ClubsManagement (Admin)
Mostra tutti i circoli → Ha filtri per stato

### ✅ DashboardPage
Se usa `getClubs()` → Filtrati automaticamente

## Note Importanti

### Filtro `includeInactive`
La funzione `getClubs()` accetta un parametro `filters.includeInactive`:
```javascript
// Per admin - mostra tutti i circoli
const clubs = await getClubs({ includeInactive: true });

// Per utenti pubblici - solo attivi (default)
const clubs = await getClubs();
```

### Backward Compatibility
Il codice è retrocompatibile:
- Se `isActive` non esiste → circolo NON visibile (sicuro)
- Se `isActive: false` → circolo NON visibile
- Se `isActive: true` → circolo visibile

### Firestore Rules (Futuro)
Quando verranno deployate le Firestore Rules production (`firestore.rules.production`), il filtro sarà doppio:
1. **Server-side**: Firestore Rules bloccano accesso a `isActive: false`
2. **Client-side**: Filtri JavaScript come backup

## Testing

### Test Manuale
1. ✅ Vai a `/clubs` (ricerca circoli)
2. ✅ Verifica che circoli disattivati NON appaiano
3. ✅ Vai a prenotazioni → selezione circolo
4. ✅ Verifica che circoli disattivati NON appaiano
5. ✅ Accedi come club-admin
6. ✅ Verifica che il TUO circolo appaia anche se disattivato
7. ✅ Accedi come super-admin a `/admin/clubs`
8. ✅ Verifica che TUTTI i circoli appaiano
9. ✅ Usa filtri per vedere solo attivi/disattivati

### Verifiche Console
```javascript
// In browser console
const { getClubs } = await import('./src/services/clubs.js');

// Utenti pubblici
const publicClubs = await getClubs();
console.log('Public clubs:', publicClubs.filter(c => c.isActive === false)); // []

// Admin
const allClubs = await getClubs({ includeInactive: true });
console.log('All clubs:', allClubs); // Tutti i circoli
```

## Prossimi Passi

### 1. Deploy Firestore Rules (Critico)
```bash
cp firestore.rules.production firestore.rules
firebase deploy --only firestore:rules
```

### 2. Test in Produzione
- Verificare filtro funzioni correttamente
- Monitorare console per errori
- Test con utenti reali

### 3. Monitoraggio
- Verificare che nessun circolo inattivo appaia in ricerche
- Controllare Analytics per eventuali accessi a circoli disattivati
- Log di tentativi di prenotazione in circoli disattivati

## Errori Risolti

### Errore React: "Objects are not valid as a React child"
**Causa**: Alcuni circoli avevano `address` e `city` come oggetti invece di stringhe.

**Fix**: Aggiunta gestione tipo-safe per indirizzi:
```javascript
{typeof club.address === 'string' 
  ? `${club.address}${club.city ? `, ${club.city}` : ''}` 
  : club.location?.address || 'Indirizzo non disponibile'}
```

## Conclusione

✅ Circoli disattivati ora nascosti agli utenti pubblici
✅ Club-admin continua a vedere il proprio circolo
✅ Super-admin vede tutti i circoli con filtri
✅ Retrocompatibile con dati esistenti
✅ Pronto per deploy Firestore Rules

**Status**: ✅ Completato e testato
**Data**: 7 Ottobre 2025
