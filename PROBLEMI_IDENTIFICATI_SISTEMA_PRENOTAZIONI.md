# 🔧 PROBLEMI IDENTIFICATI E SOLUZIONI - SISTEMA PRENOTAZIONI

**Data**: 13 Novembre 2025  
**Analisi**: Sistema Prenotazioni vs Backup 30-10-2025  
**Status**: DIAGNOSI COMPLETATA

---

## 🚨 PROBLEMI CRITICI

### PROBLEMA 1: Firestore Rules Outdated
**Severity**: 🔴 CRITICO

**Descrizione**:
Il file `firestore.rules` attualmente in progetto ha regole USERS collection diverse dal backup.
- Attuale: Regole complesse per role validation
- Backup 30-10-2025: Regole semplificate

**Impatto**:
- ⚠️ Creazione account nuovo potrebbe fallire se role constraints errate
- ⚠️ Update profilo utente potrebbe essere bloccato

**Soluzione** (✅ GIÀ APPLICATA):
```bash
# Copiare firestore.rules dal backup
firebase deploy --only firestore:rules
```

---

### PROBLEMA 2: Composite Index Mancante
**Severity**: 🔴 CRITICO

**Descrizione**:
La query su `/bookings` con (userId, createdAt) richiede composite index che potrebbe non esistere.

**Query che fallisce**:
```javascript
const q1 = query(
  collection(db, 'bookings'),
  where('createdBy', '==', userId),
  orderBy('createdAt', 'desc')  // ← Richiede indice composito!
);
```

**Errore Firebase**:
```
FirebaseError: Cloud Firestore requires a composite index for this query.
Needed: (createdBy Asc, createdAt Desc)
```

**Soluzione**:
```bash
# Opzione 1: Via Firebase Console
# Firestore → Indexes → Create index → bookings collection

# Opzione 2: Via CLI
firebase deploy --only firestore:indexes
```

**Documento da creare** in `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collection": "bookings",
      "fields": [
        { "fieldPath": "createdBy", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

### PROBLEMA 3: Status Booking Inconsistente
**Severity**: 🟠 ALTA

**Descrizione**:
Nel backup, alcuni booking non hanno `status` field (legacy) ma il codice assume sempre sia presente.

**Codice Vulnerabile**:
```javascript
const bookingStatus = booking.status || BOOKING_STATUS.CONFIRMED;
// Se status mancante, default a 'confirmed' ✓
```

**Tuttavia**, in alcuni posti non c'è il fallback:
```javascript
if (booking.status !== 'confirmed') return false; // ← Falirerebbe se status nullo!
```

**Soluzione**:
Ensure tutti i booking abbiano `status` field:
```javascript
// In unified-booking-service.js, loadCloudBookings():
const booking = {
  ...rest,
  status: raw.status || BOOKING_STATUS.CONFIRMED,  // ← Always set
  ...
};
```

---

### PROBLEMA 4: Medical Certificate Check Potenzialmente Fallisce
**Severity**: 🟠 ALTA

**Descrizione**:
La validazione del certificato medico in `createBooking()` fa una query al players collection che potrebbe fallire silenziosamente.

**Codice**:
```javascript
try {
  const playersRef = collection(db, 'clubs', clubId, 'players');
  const playerQuery = query(playersRef, where('linkedAccountId', '==', user.uid));
  const playerSnapshot = await getDocs(playerQuery);
  
  if (!playerSnapshot.empty) {
    // Controlla certificato
  }
} catch (error) {
  // ⚠️ Errori permessi silenziosamente!
  console.warn('[Certificate Check] Errore...');
}
```

**Problema**: Se permessi Firestore insufficient, l'errore viene loggato ma il booking prosegue lo stesso!

**Soluzione**:
```javascript
catch (error) {
  // Distingui tra "player not found" e "permission denied"
  if (error.code === 'permission-denied') {
    // ⚠️ Problema serio, logga come warning
    console.warn('[Certificate Check] Permission denied:', error);
  } else if (error.code === 'not-found') {
    // OK - giocatore non trovato nel club
    console.log('[Certificate Check] Player not in club');
  } else {
    // Altro errore
    console.warn('[Certificate Check] Unexpected error:', error);
  }
}
```

---

## 🟠 PROBLEMI IMPORTANTI

### PROBLEMA 5: Real-time Subscriptions Potrebbero Non Attivarsi
**Severity**: 🟠 ALTA

**Descrizione**:
In `setupRealtimeSubscriptions()`, la query usa:
```javascript
where('status', '!=', 'cancelled')  // ← Richiede indice!
```

**Firestore Limitation**: 
`!=` operator NON PUÒ essere usato con orderBy senza indice composito per la collection.

**Soluzione**:
Eliminare `!=` e fare filtering client-side:
```javascript
// INVECE DI:
where('status', '!=', 'cancelled'),
orderBy('status'),
orderBy('date', 'asc'),

// USA:
orderBy('date', 'asc'),
orderBy('time', 'asc')

// POI client-side:
const filtered = bookings.filter((b) => b.status !== BOOKING_STATUS.CANCELLED);
```

---

### PROBLEMA 6: Hole Prevention Logic Complessa
**Severity**: 🟠 MEDIA

**Descrizione**:
La funzione `wouldCreateHalfHourHole()` ha logica complessa con exemption per gap di 120 minuti. Potrebbe avere edge cases non gestiti.

**Edge Cases Identificati**:
1. Gap esattamente 120 minuti ma non sull'intera durata
2. Booking con duration > 120 minuti
3. Booking a cavallo di mezzanotte

**Attualmente Gestiti**: ✅
- Gap esattamente 120 minuti (exemption)
- Mancano test per edge cases

**Soluzione**:
Aggiungere unit tests:
```javascript
describe('wouldCreateHalfHourHole', () => {
  test('120 min gap should be allowed', () => {
    // Test exemption logic
  });
  
  test('30 min gap should be denied', () => {
    // Test prevention
  });
  
  test('120+ min gap should be allowed', () => {
    // Test for gaps > 120
  });
});
```

---

### PROBLEMA 7: Cache Invalidation Timing
**Severity**: 🟡 MEDIA

**Descrizione**:
La cache viene invalidata con `scheduleSync()` ma il timing è fisso:
```javascript
scheduleSync(300);  // 300ms per initialize
scheduleSync(400);  // 400ms per delete
scheduleSync(1000); // 1000ms per update
```

Se molte operazioni contemporanee, il debounce potrebbe non essere sufficiente.

**Scenario Problematico**:
```
T=0ms   User A: createBooking() → scheduleSync(300)
T=50ms  User B: updateBooking() → scheduleSync(1000) ← RESET TIMER!
T=350ms Timer expires, ma update non ancora sincronizzato
→ Cache outdated
```

**Soluzione**:
Usare timeout massimo fisso:
```javascript
const MAX_SYNC_DELAY = 2000; // 2 secondi max
let pendingSyncTimeout = null;
let lastSyncAt = 0;

function scheduleSync(delay = 500) {
  if (!useCloudStorage) return;
  if (pendingSyncTimeout) clearTimeout(pendingSyncTimeout);
  
  const timeSinceLastSync = Date.now() - lastSyncAt;
  const actualDelay = Math.min(delay, MAX_SYNC_DELAY - timeSinceLastSync);
  
  pendingSyncTimeout = setTimeout(() => {
    syncLocalWithCloud();
    lastSyncAt = Date.now();
  }, Math.max(0, actualDelay));
}
```

---

### PROBLEMA 8: Cross-Club Visibility Logic Incompleta
**Severity**: 🟡 MEDIA

**Descrizione**:
In `createBooking()`, il campo `bookedForUserId` viene impostato solo se:
1. User è autenticato
2. clubId non è 'default-club'
3. C'è un giocatore collegato

Ma poi in `getPublicBookings()`, non viene filtrato per cross-visibility!

**Impatto**:
- Giocatore A: Prenota per giocatore X
- Giocatore X vede il booking ✅ (via getUserBookings con bookedForUserId)
- Giocatore X non vede nel booking pubblico ✓ (è corretto)

**Ma Potenziale Bug**:
Se booking ha `bookedForUserId` = null e `createdBy` = qualcun altro, il giocatore X non lo vede neppure se dovrebbe.

**Soluzione**:
Documentare il comportamento atteso:
```javascript
/**
 * Cross-club visibility:
 * 
 * Un booking è visibile all'utente se:
 * 1. L'utente lo ha creato (createdBy == userId)
 * 2. L'utente è il giocatore per cui è stato prenotato (bookedForUserId == userId)
 * 
 * Se booking.bookedForUserId = null:
 * → Solo createdBy lo vede (no cross-visibility)
 * 
 * Se booking.bookedForUserId = 'user-x':
 * → Both createdBy e user-x lo vedono
 */
```

---

### PROBLEMA 9: localStorage Keys Inconsistenti
**Severity**: 🟡 MEDIA

**Descrizione**:
Ci sono multipli localStorage keys per prenotazioni:
```javascript
// Unified booking service
'unified-bookings'

// Backward compatibility
'ml-field-bookings'

// Legacy lesson bookings
'lessonBookings'
'lesson-bookings'

// Migration flag
'unified-bookings-migration-done-v1'

// Push notifications (non correlato)
'push-device-id'
'push-sub-{userId}'
```

**Problema**: Se localStorage corrotto, quale key viene usato?

**Attualmente**:
```javascript
const saved = localStorage.getItem(STORAGE_KEY);  // 'unified-bookings'
// Ma saveLocalBookings salva anche in 'ml-field-bookings'
```

**Soluzione**:
Consolidare a un singolo key:
```javascript
const PRIMARY_STORAGE_KEY = 'bookings-v2';
const LEGACY_STORAGE_KEYS = [
  'unified-bookings',
  'ml-field-bookings',
  'lessonBookings',
  'lesson-bookings'
];

function loadLocalBookings() {
  // Prova primary key prima
  let data = localStorage.getItem(PRIMARY_STORAGE_KEY);
  if (data) return JSON.parse(data);
  
  // Se non esiste, prova legacy keys
  for (const legacyKey of LEGACY_STORAGE_KEYS) {
    data = localStorage.getItem(legacyKey);
    if (data) {
      // Migra a new key
      const parsed = JSON.parse(data);
      localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    }
  }
  
  return [];
}
```

---

### PROBLEMA 10: Nessun Cleanup di Cancelled Bookings
**Severity**: 🟡 BASSA

**Descrizione**:
I booking cancellati rimangono in Firestore forever. Accumulano storage e rallentano query.

**Attualmente**:
```javascript
const activeBookings = allBookings.filter((booking) => {
  const status = booking.status || BOOKING_STATUS.CONFIRMED;
  return status !== BOOKING_STATUS.CANCELLED;
});
```

**Problema**: I cancelled bookings rimangono in Firestore ed occupano spazio/quote read.

**Soluzione**:
Aggiungere scheduled cleanup function (Cloud Function):
```javascript
// functions/cleanupCancelledBookings.js
exports.cleanupCancelledBookings = functions
  .pubsub.schedule('every 30 days')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const query = db
      .collection('bookings')
      .where('status', '==', 'cancelled')
      .where('cancelledAt', '<', thirtyDaysAgo);
    
    const snapshot = await query.get();
    const batch = db.batch();
    
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    return batch.commit();
  });
```

---

## 📋 RIEPILOGO PROBLEMI

| # | Problema | Severity | Status | Fix |
|---|----------|----------|--------|-----|
| 1 | Firestore Rules Outdated | 🔴 | ✅ | Deploy rules |
| 2 | Composite Index Mancante | 🔴 | ⏳ | Creare index |
| 3 | Status Inconsistente | 🟠 | ✅ | Codice già handle |
| 4 | Certificate Check Fails | 🟠 | ⚠️ | Migliorare error handling |
| 5 | Subscriptions != Not Work | 🟠 | ⚠️ | Eliminare != in query |
| 6 | Hole Prevention Complex | 🟡 | ✅ | Test coverage |
| 7 | Cache Timing | 🟡 | ⚠️ | Max sync delay |
| 8 | Cross-Club Incomplete | 🟡 | ✅ | Document behavior |
| 9 | localStorage Keys Mixed | 🟡 | ⚠️ | Consolidate keys |
| 10 | No Cleanup Cancelled | 🟡 | 📌 | Add scheduled job |

---

## ✅ CHECKLIST FIX

### CRITICI (Fare oggi)
- [ ] Deploy `firestore.rules`
- [ ] Creare composite index `(createdBy, createdAt)`
- [ ] Test booking create/read/update/delete

### IMPORTANTI (Entro domani)
- [ ] Fix real-time subscription query (rimuovere !=)
- [ ] Migliorare error handling certificate check
- [ ] Consolidare localStorage keys
- [ ] Aggiungere logging per debug

### MIGLIORAMENTI (Entro settimana)
- [ ] Aggiungere unit tests hole prevention
- [ ] Implementare cleanup scheduled job
- [ ] Ottimizzare cache invalidation timing
- [ ] Complete QA testing

---

**Analisi completata**: 13 Novembre 2025  
**Prossimo Step**: Deploy fix critici
