# 🔍 ANALISI CRITICITÀ SALVATAGGIO PRENOTAZIONI

**Data**: 13 Novembre 2025  
**Analista**: Senior Developer Review  
**Scope**: Booking Creation Flow - User vs Club Admin  

---

## 📋 EXECUTIVE SUMMARY

Ho analizzato il flusso completo di salvataggio prenotazioni sia da **utenti normali** che da **club admin**. Sono state rilevate **7 criticità** di cui:
- 🔴 **2 CRITICHE** (possibile perdita dati/inconsistenza)
- 🟡 **3 MEDIE** (UX degradata/possibili errori)
- 🟢 **2 BASSE** (ottimizzazioni consigliate)

**Problema principale**: Sistema ibrido con **dual-write non implementato** → statistiche admin errate e inconsistenza dati.

---

## 🎯 FLUSSO ATTUALE SALVATAGGIO PRENOTAZIONI

### 1. UTENTE NORMALE (User Role)

```javascript
// File: src/hooks/useBookings.js (linea 84)
// Chiamato da: src/features/prenota/PrenotazioneCampi.jsx

const createBookingMutation = useCallback(
  async (bookingData) => {
    // 1️⃣ VALIDAZIONE USER
    if (!user) throw new Error('User must be authenticated');

    try {
      setLoading(true);
      
      // 2️⃣ CHIAMATA SERVIZIO UNIFICATO
      const newBooking = await createBooking(bookingData, user);
      //                        ↓
      //         unified-booking-service.js
      
      // 3️⃣ REFRESH UI
      await Promise.all([
        loadPublicBookings(),
        loadUserBookings()
      ]);

      return newBooking;
    } catch (err) {
      console.error('Error creating booking:', err);
      throw err;
    }
  },
  [user, loadPublicBookings, loadUserBookings]
);
```

#### Flow dettagliato utente normale:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "Prenota" in PrenotazioneCampi.jsx          │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. useBookings.createBookingMutation()                      │
│    - Check: user authenticated ✅                           │
│    - Prepare bookingData: {                                 │
│        clubId: 'sporting-cat',                              │
│        courtId: 'campo-1',                                  │
│        date: '2025-11-13',                                  │
│        time: '10:00',                                       │
│        duration: 60,                                        │
│        userId: user.uid,                                    │
│        ...                                                  │
│      }                                                      │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. unified-booking-service.createBooking()                  │
│    Linea 177-340                                            │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. VALIDAZIONI PRE-SCRITTURA                                │
│    ✅ Check certificato medico (se utente ha player linked)│
│    ✅ Check cross-club visibility (bookedForUserId)        │
│    ✅ Validate slot availability (no conflicts/holes)      │
│    ✅ Validate booking data (required fields)              │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. PREPARE BOOKING OBJECT                                   │
│    {                                                        │
│      id: generateBookingId(),  // ⚠️ CLIENT-GENERATED      │
│      type: 'court',                                        │
│      courtId, courtName, date, time, duration,             │
│      bookedBy: user.displayName,                           │
│      userEmail: user.email,                                │
│      userId: user.uid,                                     │
│      createdBy: user.uid,                                  │
│      clubId: 'sporting-cat',                               │
│      status: 'pending',  // ⚠️ SEMPRE PENDING             │
│      createdAt: new Date().toISOString(),                  │
│      startTime: timestamp,                                 │
│      bookedForUserId: ... (cross-club),                    │
│      ...                                                   │
│    }                                                       │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. CLOUD STORAGE?                                           │
│    if (useCloudStorage && user) {                          │
│      → createCloudBooking()                                │
│    } else {                                                │
│      → createLocalBooking() // localStorage                │
│    }                                                       │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. createCloudBooking() - Linea 593                        │
│                                                             │
│    const { id: clientGeneratedId, ...rest } = booking;     │
│    const cleanedData = cleanBookingData({                  │
│      ...rest,                                              │
│      legacyId: clientGeneratedId, // ⚠️ Salva old ID      │
│      createdAt: serverTimestamp(), // ⚠️ Overwrite        │
│      updatedAt: serverTimestamp()                          │
│    });                                                     │
│                                                            │
│    // 🔴 CRITICAL: SINGLE WRITE                           │
│    const docRef = await addDoc(                            │
│      collection(db, 'bookings'),  // ROOT ONLY            │
│      cleanedData                                           │
│    );                                                      │
│                                                            │
│    // ❌ MISSING: Write to subcollection                  │
│    // if (booking.clubId) {                               │
│    //   await setDoc(                                     │
│    //     doc(db, 'clubs', booking.clubId,               │
│    //          'bookings', docRef.id),                    │
│    //     cleanedData                                     │
│    //   );                                                │
│    // }                                                   │
│                                                            │
│    return {                                                │
│      ...rest,                                              │
│      id: docRef.id,  // ⚠️ Firestore auto-generated      │
│      legacyId: clientGeneratedId                          │
│    };                                                     │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. EVENTS & CACHE                                           │
│    - emitBookingCreated(result)                            │
│    - invalidateUserBookingsCache(user.uid)                 │
│    - Return booking to UI                                  │
└─────────────────────────────────────────────────────────────┘
```

### 2. CLUB ADMIN (Club Admin Role)

```javascript
// File: src/pages/AdminBookingsPage.jsx
// Component: PrenotazioneCampi (stesso del user normale!)

// ⚠️ IMPORTANTE: Club Admin usa STESSO FLUSSO dell'utente normale
// NON esiste un flusso separato per admin bookings

const AdminBookingsPage = () => {
  const { clubId } = useParams();
  const { isClubAdmin } = useAuth();
  
  // Check permissions
  const canAccessBookings = clubMode || isClubAdmin(clubId);
  
  if (!canAccessBookings) {
    return <AccessDenied />;
  }
  
  // 🎯 RENDER STESSO COMPONENTE
  return (
    <PrenotazioneCampi
      clubMode={true}
      clubId={clubId}
      user={user}
      T={T}
    />
  );
};
```

#### Flow dettagliato club admin:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Club Admin accede /club/{clubId}/admin/bookings         │
│    - Verifica: isClubAdmin(clubId) ✅                      │
│    - clubMode: true                                         │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Render PrenotazioneCampi con props:                     │
│    - clubMode: true                                         │
│    - clubId: 'sporting-cat' (from URL)                     │
│    - user: admin user object                               │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Admin seleziona slot e clicca "Prenota"                 │
│    ⚠️ STESSO FORM dell'utente normale                      │
│    ⚠️ NESSUNA indicazione visiva "admin booking"           │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. useBookings.createBookingMutation()                      │
│    ⚠️ IDENTICO al flusso utente normale                    │
│    ⚠️ NO special handling per admin                        │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. unified-booking-service.createBooking()                  │
│    ⚠️ STESSO CODICE, stessi check, stesse validazioni      │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. createCloudBooking()                                     │
│    🔴 CRITICAL: Write SOLO a bookings/ (root)              │
│    ❌ NO write a clubs/{clubId}/bookings/                  │
│                                                             │
│    const docRef = await addDoc(                            │
│      collection(db, 'bookings'),                           │
│      {                                                     │
│        ...bookingData,                                     │
│        createdBy: admin.uid,  // UID ADMIN                │
│        userId: admin.uid,     // UID ADMIN                │
│        status: 'pending',     // ⚠️ SEMPRE PENDING         │
│        // ❌ NO campo per distinguere "admin created"     │
│      }                                                     │
│    );                                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔴 CRITICITÀ RILEVATE

### 🔴 CRITICITÀ 1: DUAL-WRITE NON IMPLEMENTATO

**Severità**: ⭐⭐⭐⭐⭐ CRITICA  
**Impatto**: Statistiche admin errate, inconsistenza dati

#### Descrizione

```javascript
// PROBLEMA: createCloudBooking() scrive SOLO in root collection
// File: src/services/unified-booking-service.js linea 605

async function createCloudBooking(booking) {
  const docRef = await addDoc(
    collection(db, 'bookings'),  // ✅ ROOT collection
    cleanedData
  );
  
  // ❌ MISSING: Subcollection write
  // Dovrebbe essere:
  // if (booking.clubId) {
  //   await setDoc(
  //     doc(db, 'clubs', booking.clubId, 'bookings', docRef.id),
  //     cleanedData
  //   );
  // }
  
  return { id: docRef.id, ...rest };
}
```

#### Impatto

1. **Admin Dashboard mostra dati errati**
   ```javascript
   // File: src/pages/admin/ClubsManagement.jsx linea 66
   const bookingsSnap = await getDocs(
     collection(db, 'clubs', clubDoc.id, 'bookings')
   );
   clubData.stats = {
     bookings: bookingsSnap.size  // ⚠️ CONTA SOLO SUBCOLLECTION
   };
   
   // Risultato: 342 bookings (dovrebbero essere 343)
   ```

2. **Desync crescente nel tempo**
   - Ogni nuova prenotazione → scritto solo in root
   - Subcollection rimane statica
   - Gap aumenta: -1, -2, -3...

3. **Query inconsistenti**
   - Query su root: 343 documenti ✅
   - Query su subcollection: 342 documenti ❌
   - Admin vede statistiche sbagliate

#### Soluzione

```javascript
// PATCH IMMEDIATO: src/services/unified-booking-service.js

async function createCloudBooking(booking) {
  const { id: clientGeneratedId, ...rest } = booking;
  
  const cleanedData = cleanBookingData({
    ...rest,
    legacyId: clientGeneratedId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 1. Write to ROOT collection
  const docRef = await addDoc(
    collection(db, 'bookings'),
    cleanedData
  );

  // 2. ✅ ADD: Dual-write to subcollection
  if (booking.clubId && booking.clubId !== 'default-club') {
    try {
      await setDoc(
        doc(db, 'clubs', booking.clubId, 'bookings', docRef.id),
        cleanedData
      );
      console.log('✅ Dual-write to subcollection completed');
    } catch (error) {
      console.error('⚠️ Subcollection write failed:', error);
      // Non bloccare operazione se fallisce subcollection
    }
  }

  return {
    ...rest,
    id: docRef.id,
    legacyId: clientGeneratedId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ✅ Implementare anche per UPDATE e DELETE
async function updateCloudBooking(bookingId, updates) {
  const docRef = doc(db, 'bookings', bookingId);
  
  const cleanedUpdates = cleanBookingData({
    ...updates,
    updatedAt: serverTimestamp(),
  });

  // Update root
  await updateDoc(docRef, cleanedUpdates);

  // ✅ ADD: Update subcollection
  const bookingSnap = await getDoc(docRef);
  if (bookingSnap.exists()) {
    const booking = bookingSnap.data();
    if (booking.clubId && booking.clubId !== 'default-club') {
      try {
        await updateDoc(
          doc(db, 'clubs', booking.clubId, 'bookings', bookingId),
          cleanedUpdates
        );
      } catch (error) {
        console.error('⚠️ Subcollection update failed:', error);
      }
    }
  }
  
  // ... rest of function
}

async function deleteCloudBooking(bookingId) {
  const docRef = doc(db, 'bookings', bookingId);
  const snap = await getDoc(docRef);
  
  if (snap.exists()) {
    const booking = snap.data();
    
    // Delete from root
    await deleteDoc(docRef);
    
    // ✅ ADD: Delete from subcollection
    if (booking.clubId && booking.clubId !== 'default-club') {
      try {
        await deleteDoc(
          doc(db, 'clubs', booking.clubId, 'bookings', bookingId)
        );
      } catch (error) {
        console.error('⚠️ Subcollection delete failed:', error);
      }
    }
  }
}
```

#### Script di Sync per Dati Esistenti

```javascript
// File: scripts/sync-bookings-to-subcollections.js

import { db } from '../src/services/firebase.js';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  query,
  where,
} from 'firebase/firestore';

async function syncBookingsToSubcollections() {
  console.log('🔄 Starting bookings sync to subcollections...');
  
  // 1. Get all bookings from root
  const bookingsRef = collection(db, 'bookings');
  const snapshot = await getDocs(bookingsRef);
  
  console.log(`📊 Found ${snapshot.size} bookings in root collection`);
  
  let synced = 0;
  let errors = 0;
  
  // 2. Group by clubId
  const bookingsByClub = new Map();
  
  snapshot.docs.forEach(doc => {
    const booking = doc.data();
    const clubId = booking.clubId;
    
    if (!clubId || clubId === 'default-club') {
      console.log(`⏭️  Skipping booking ${doc.id} (no club)`);
      return;
    }
    
    if (!bookingsByClub.has(clubId)) {
      bookingsByClub.set(clubId, []);
    }
    
    bookingsByClub.get(clubId).push({
      id: doc.id,
      data: booking
    });
  });
  
  console.log(`📁 Found ${bookingsByClub.size} clubs with bookings`);
  
  // 3. Write to subcollections
  for (const [clubId, bookings] of bookingsByClub) {
    console.log(`\n🏢 Processing club: ${clubId} (${bookings.length} bookings)`);
    
    for (const booking of bookings) {
      try {
        // Check if already exists in subcollection
        const subRef = doc(db, 'clubs', clubId, 'bookings', booking.id);
        
        // Write/overwrite to subcollection
        await setDoc(subRef, booking.data);
        
        synced++;
        console.log(`  ✅ Synced booking ${booking.id}`);
      } catch (error) {
        errors++;
        console.error(`  ❌ Error syncing booking ${booking.id}:`, error);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Sync completed!`);
  console.log(`   Total bookings: ${snapshot.size}`);
  console.log(`   Synced: ${synced}`);
  console.log(`   Errors: ${errors}`);
  console.log('='.repeat(60));
}

// Run
syncBookingsToSubcollections().catch(console.error);
```

---

### 🔴 CRITICITÀ 2: NESSUNA DISTINZIONE ADMIN BOOKINGS

**Severità**: ⭐⭐⭐⭐ ALTA  
**Impatto**: Impossibile distinguere prenotazioni admin da utente

#### Descrizione

```javascript
// PROBLEMA: Admin e User usano STESSO FLUSSO
// NO metadata per distinguere chi ha creato la prenotazione

// Prenotazione Utente:
{
  createdBy: 'user-uid-123',
  userId: 'user-uid-123',
  status: 'pending',
  // ❌ Nessun campo "createdByRole"
}

// Prenotazione Admin (per un cliente):
{
  createdBy: 'admin-uid-456',  // UID ADMIN
  userId: 'admin-uid-456',     // UID ADMIN (⚠️ SBAGLIATO)
  status: 'pending',           // ⚠️ PENDING anche se admin
  // ❌ Nessun campo "bookedForUserId" (se admin prenota per qualcuno)
  // ❌ Nessun campo "createdByAdmin: true"
  // ❌ Nessun campo "adminNotes"
}
```

#### Problemi

1. **Impossibile tracciare chi ha fatto la prenotazione**
   - Prenotazione admin → mostra UID admin in `createdBy`
   - Se admin prenota per cliente → cliente non collegato
   - Audit trail incompleto

2. **Status sempre 'pending' anche per admin**
   - Admin dovrebbe poter creare prenotazioni già `confirmed`
   - Attualmente: admin crea → status pending → deve approvare manualmente

3. **NO campo note admin**
   - Admin potrebbe voler aggiungere note interne
   - Es: "Prenotazione telefonica", "Cliente VIP", etc.

#### Soluzione

```javascript
// PATCH: src/services/unified-booking-service.js

export async function createBooking(bookingData, user, options = {}) {
  // ... existing code ...
  
  // ✅ ADD: Detect if admin is creating booking
  const isAdminCreating = options.isAdminBooking || 
                          user?.role === 'club_admin' ||
                          user?.role === 'super_admin';
  
  // ✅ ADD: Support admin booking for another user
  const targetUserId = options.bookedForUserId || user?.uid;
  
  const booking = {
    id: options.id || generateBookingId(),
    type: bookingData.type || BOOKING_TYPES.COURT,
    
    // ... existing fields ...
    
    // User details
    userId: targetUserId,  // ✅ Target user (not necessarily creator)
    createdBy: user?.uid,  // ✅ Creator (might be admin)
    bookedBy: bookingData.bookedByName || user?.displayName,
    
    // ✅ ADD: Admin metadata
    isAdminCreated: isAdminCreating,
    createdByRole: user?.role || 'user',
    adminNotes: options.adminNotes || null,
    
    // ✅ FIX: Admin può creare prenotazioni confirmed
    status: isAdminCreating && options.autoConfirm 
      ? BOOKING_STATUS.CONFIRMED 
      : BOOKING_STATUS.PENDING,
    
    // ✅ ADD: If admin booking for someone else
    ...(isAdminCreating && targetUserId !== user?.uid && {
      bookedForUserId: targetUserId,
      isProxyBooking: true,
      proxyBookedBy: user?.uid,
      proxyBookedByName: user?.displayName
    }),
    
    // ... rest of booking object ...
  };
  
  // ... rest of function ...
}

// ✅ NEW: Admin-specific booking function
export async function createAdminBooking(bookingData, adminUser, targetUser) {
  return createBooking(bookingData, adminUser, {
    isAdminBooking: true,
    autoConfirm: true,  // Admin bookings auto-confirmed
    bookedForUserId: targetUser?.uid,
    adminNotes: bookingData.adminNotes,
  });
}
```

#### UI Changes Required

```jsx
// File: src/features/prenota/PrenotazioneCampi.jsx

const PrenotazioneCampi = ({ clubMode, clubId, user }) => {
  const { isClubAdmin } = useAuth();
  
  // ✅ ADD: Admin booking form
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  
  const handleBooking = async (bookingData) => {
    if (isClubAdmin(clubId) && isAdminMode) {
      // Admin creating booking for another user
      const result = await createAdminBooking(
        {
          ...bookingData,
          adminNotes,
        },
        user,  // admin user
        selectedUser  // target user
      );
    } else {
      // Normal user booking
      const result = await createBooking(bookingData, user);
    }
  };
  
  return (
    <div>
      {/* ✅ ADD: Admin mode toggle */}
      {isClubAdmin(clubId) && (
        <div className="mb-4">
          <label>
            <input
              type="checkbox"
              checked={isAdminMode}
              onChange={(e) => setIsAdminMode(e.target.checked)}
            />
            Prenota come amministratore
          </label>
          
          {isAdminMode && (
            <>
              {/* User picker */}
              <UserPicker
                value={selectedUser}
                onChange={setSelectedUser}
                placeholder="Seleziona cliente..."
              />
              
              {/* Admin notes */}
              <textarea
                placeholder="Note interne (visibili solo agli admin)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </>
          )}
        </div>
      )}
      
      {/* ... rest of booking form ... */}
    </div>
  );
};
```

---

### 🟡 CRITICITÀ 3: ID GENERATION INCONSISTENTE

**Severità**: ⭐⭐⭐ MEDIA  
**Impatto**: Confusione ID, complessità debug

#### Descrizione

```javascript
// PROBLEMA: Sistema usa DUE ID diversi

// 1. Client genera ID
const booking = {
  id: generateBookingId(),  // Client-generated (timestamp-based)
  ...
};

// 2. Firestore genera ID differente
const docRef = await addDoc(collection(db, 'bookings'), data);
//    docRef.id !== booking.id  ⚠️

// 3. Client salva ENTRAMBI
return {
  id: docRef.id,           // Firestore ID (canonical)
  legacyId: clientGeneratedId,  // Client ID (legacy)
  ...
};
```

#### Problemi

1. **Due ID nello stesso documento**
   ```javascript
   {
     id: 'kJh3n2kL9sP1mN4o',     // Firestore auto-generated
     legacyId: '1699876543210',  // Client timestamp-based
     ...
   }
   ```

2. **Confusione nei log e debug**
   ```javascript
   console.log('Created booking:', booking.id);
   // Ma Firestore ha ID diverso!
   ```

3. **Complessità migrazione**
   - Vecchi bookings con `id` inside document
   - Nuovi bookings con `legacyId`
   - Query devono gestire entrambi

#### Soluzione

```javascript
// OPZIONE A: Usa solo Firestore auto-generated ID

async function createCloudBooking(booking) {
  // ❌ Remove client ID generation
  // const { id: clientGeneratedId, ...rest } = booking;
  
  const cleanedData = cleanBookingData({
    ...booking,
    // ❌ NO legacyId field
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const docRef = await addDoc(
    collection(db, 'bookings'),
    cleanedData
  );

  // ✅ Return with Firestore ID only
  return {
    id: docRef.id,  // Single source of truth
    ...cleanedData,
  };
}

// Update createBooking to NOT generate ID
export async function createBooking(bookingData, user, options = {}) {
  const booking = {
    // ❌ Remove: id: options.id || generateBookingId(),
    type: bookingData.type || BOOKING_TYPES.COURT,
    // ... rest without id field
  };
  
  // Firestore generates ID on write
  const result = await createCloudBooking(booking);
  return result;  // id will be Firestore-generated
}
```

```javascript
// OPZIONE B: Usa client-generated ID con setDoc

async function createCloudBooking(booking) {
  // Use client ID as Firestore doc ID
  const docId = booking.id || generateBookingId();
  
  const { id, ...dataWithoutId } = booking;
  
  const cleanedData = cleanBookingData({
    ...dataWithoutId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // ✅ setDoc with specific ID
  const docRef = doc(db, 'bookings', docId);
  await setDoc(docRef, cleanedData);

  return {
    id: docId,  // Client-generated used as Firestore ID
    ...cleanedData,
  };
}
```

**Raccomandazione**: OPZIONE A (Firestore auto-generated) per semplicità.

---

### 🟡 CRITICITÀ 4: VALIDAZIONE CERTIFICATO MEDICO TROPPO PERMISSIVA

**Severità**: ⭐⭐⭐ MEDIA  
**Impatto**: Possibili prenotazioni con certificato scaduto

#### Descrizione

```javascript
// File: src/services/unified-booking-service.js linea 181-233

// 🏥 CHECK CERTIFICATO MEDICO
if (user?.uid && clubId && clubId !== 'default-club') {
  try {
    const playersRef = collection(db, 'clubs', clubId, 'players');
    const playerQuery = query(
      playersRef, 
      where('linkedAccountId', '==', user.uid)
    );
    const playerSnapshot = await getDocs(playerQuery);

    if (!playerSnapshot.empty) {
      const player = playerSnapshot.docs[0].data();
      const certStatus = calculateCertificateStatus(
        player.medicalCertificates?.current?.expiryDate
      );

      // ✅ Blocca se scaduto
      if (certStatus.isExpired) {
        throw new Error('Certificato medico scaduto');
      }

      // ⚠️ WARNING: Solo log se in scadenza
      if (certStatus.isExpiring && certStatus.daysUntilExpiry <= 7) {
        console.warn('⚠️ Certificato in scadenza');
        // ❌ MA PERMETTE COMUNQUE LA PRENOTAZIONE!
      }
    }
  } catch (error) {
    // ⚠️ Se è errore certificato, rilancia
    if (error.message.includes('Certificato medico scaduto')) {
      throw error;
    }
    
    // ❌ PROBLEMA: Altri errori (es. permission denied) NON bloccano
    console.warn('Errore verifica certificato:', error);
    // Continua e crea prenotazione!
  }
}
```

#### Problemi

1. **Errori permission ignored**
   - Se `players` collection inaccessibile → log warning e continua
   - Prenotazione creata senza verifica certificato

2. **Certificato in scadenza non blocked**
   - Solo warning se scade entro 7 giorni
   - User può prenotare anche con cert in scadenza domani

3. **NO check per utenti senza player profile**
   - Se utente NON ha player collegato → skip check
   - Può prenotare senza mai aver fornito certificato

#### Soluzione

```javascript
// ✅ STRICT MODE: Block anche in scadenza critica

export async function createBooking(bookingData, user, options = {}) {
  const clubId = bookingData.clubId || options.clubId || null;
  
  // ✅ ADD: Config per strictness certificato
  const strictCertificateCheck = options.strictCertificate ?? true;
  const criticalExpiryDays = options.criticalExpiryDays ?? 3;
  
  // 🏥 CHECK CERTIFICATO MEDICO - ENHANCED
  if (user?.uid && clubId && clubId !== 'default-club') {
    try {
      const playersRef = collection(db, 'clubs', clubId, 'players');
      const playerQuery = query(
        playersRef,
        where('linkedAccountId', '==', user.uid)
      );
      const playerSnapshot = await getDocs(playerQuery);

      // ✅ NEW: Check se player profile esiste
      if (playerSnapshot.empty) {
        if (strictCertificateCheck) {
          throw new Error(
            '❌ Profilo giocatore non trovato. ' +
            'Contatta il circolo per completare la registrazione.'
          );
        }
        console.warn('⚠️ Player profile not found, skipping cert check');
      } else {
        const player = playerSnapshot.docs[0].data();
        const cert = player.medicalCertificates?.current;
        
        // ✅ NEW: Check se certificato esiste
        if (!cert || !cert.expiryDate) {
          throw new Error(
            '❌ Certificato medico non presente. ' +
            'Fornisci un certificato medico valido al circolo.'
          );
        }
        
        const certStatus = calculateCertificateStatus(cert.expiryDate);

        // ✅ EXISTING: Block se scaduto
        if (certStatus.isExpired) {
          const daysExpired = Math.abs(certStatus.daysUntilExpiry);
          throw new Error(
            `❌ Certificato medico scaduto da ${daysExpired} giorni. ` +
            `Non puoi effettuare prenotazioni. ` +
            `Contatta il circolo per rinnovare.`
          );
        }

        // ✅ NEW: Block se in scadenza CRITICA (< 3 giorni)
        if (
          strictCertificateCheck &&
          certStatus.isExpiring &&
          certStatus.daysUntilExpiry <= criticalExpiryDays
        ) {
          throw new Error(
            `⚠️ Certificato medico in scadenza tra ${certStatus.daysUntilExpiry} giorni. ` +
            `Per motivi di sicurezza, rinnova il certificato prima di prenotare.`
          );
        }

        // ⚠️ WARNING: In scadenza ma non critica (4-7 giorni)
        if (certStatus.isExpiring && certStatus.daysUntilExpiry <= 7) {
          console.warn(
            `⚠️ Certificato in scadenza tra ${certStatus.daysUntilExpiry} giorni ` +
            `per utente ${user.uid}`
          );
          // ✅ Permetti ma logga per follow-up admin
        }
      }
    } catch (error) {
      // ✅ NEW: Distingui tipi di errori
      if (
        error.message.includes('Certificato') ||
        error.message.includes('Profilo giocatore')
      ) {
        // Errori business logic → blocca prenotazione
        throw error;
      }
      
      // ✅ NEW: Permission errors → blocca in strict mode
      if (error.code === 'permission-denied') {
        if (strictCertificateCheck) {
          throw new Error(
            '❌ Impossibile verificare certificato medico. ' +
            'Contatta il supporto tecnico.'
          );
        }
        console.error('❌ Permission denied checking certificate:', error);
      } else {
        // Altri errori tecnici
        if (strictCertificateCheck) {
          throw new Error(
            '❌ Errore verifica certificato medico. Riprova più tardi.'
          );
        }
        console.error('❌ Error checking certificate:', error);
      }
    }
  }
  
  // ... rest of function ...
}
```

#### Club Settings per Flessibilità

```javascript
// File: clubs/{clubId}/settings/bookings

{
  certificateChecks: {
    enabled: true,
    strictMode: true,  // Block anche in scadenza critica
    criticalExpiryDays: 3,  // Giorni prima scadenza da bloccare
    requireForAllBookings: true,  // Require anche per non-player?
    adminBypass: false  // Admin possono bypassare check?
  }
}

// Usage in createBooking:
const clubSettings = await getClubSettings(clubId);
const strictCheck = clubSettings?.certificateChecks?.strictMode ?? true;
const criticalDays = clubSettings?.certificateChecks?.criticalExpiryDays ?? 3;

await createBooking(bookingData, user, {
  strictCertificate: strictCheck,
  criticalExpiryDays: criticalDays,
});
```

---

### 🟡 CRITICITÀ 5: CROSS-CLUB VISIBILITY INCOMPLETO

**Severità**: ⭐⭐⭐ MEDIA  
**Impatto**: Utenti multi-club non vedono tutte prenotazioni

#### Descrizione

```javascript
// File: src/services/unified-booking-service.js linea 235-260

// 🔗 CROSS-CLUB BOOKING VISIBILITY
let bookedForUserId = null;
if (user?.uid && clubId && clubId !== 'default-club') {
  try {
    // Cerca se c'è un giocatore collegato all'utente corrente
    const playersRef = collection(db, 'clubs', clubId, 'players');
    const playerQuery = query(
      playersRef,
      where('linkedAccountId', '==', user.uid)
    );
    const playerSnapshot = await getDocs(playerQuery);

    if (!playerSnapshot.empty) {
      // L'utente sta prenotando per un giocatore collegato
      bookedForUserId = user.uid;  // ⚠️ SEMPRE user.uid
    }
  } catch (error) {
    console.warn('Errore verifica collegamento giocatore:', error);
  }
}

// Booking object:
{
  bookedForUserId: bookedForUserId,  // Può essere null!
  userId: user.uid,
  createdBy: user.uid,
}
```

#### Problemi

1. **bookedForUserId sempre uguale a userId**
   - Se player linked → `bookedForUserId = user.uid`
   - Ma `userId` è GIÀ `user.uid`
   - Campo ridondante, no valore aggiunto

2. **NO supporto prenotazione per altri**
   - Admin non può prenotare per cliente
   - Parent non può prenotare per figlio
   - Coach non può prenotare per team

3. **Query utente multi-club inefficiente**
   ```javascript
   // getUserBookings cerca solo createdBy
   where('createdBy', '==', user.uid)
   // O bookedForUserId
   where('bookedForUserId', '==', user.uid)
   
   // ⚠️ MA se prenotazione fatta da admin per user
   // createdBy = admin.uid
   // bookedForUserId = user.uid
   // Query1 NON trova (createdBy diverso)
   // Query2 trova SOLO se bookedForUserId settato
   ```

#### Soluzione

```javascript
// ✅ SEMANTIC FIX: bookedForUserId per PROXY bookings

export async function createBooking(bookingData, user, options = {}) {
  // ... existing code ...
  
  // ✅ NEW: Distinguish creator from beneficiary
  const isProxyBooking = options.bookedForUserId && 
                         options.bookedForUserId !== user.uid;
  
  const targetUserId = options.bookedForUserId || user.uid;
  
  const booking = {
    // ... existing fields ...
    
    // ✅ FIX: Semantic fields
    userId: targetUserId,        // Chi beneficia della prenotazione
    createdBy: user.uid,         // Chi ha creato la prenotazione
    
    // ✅ NEW: Cross-club visibility field
    // Solo se è una prenotazione PROXY (admin per user, parent per child, etc.)
    ...(isProxyBooking && {
      bookedForUserId: targetUserId,
      isProxyBooking: true,
      proxyBookedBy: user.uid,
      proxyRelation: options.proxyRelation || 'admin', // admin|parent|coach
    }),
    
    // ... rest of booking ...
  };
  
  // ... rest of function ...
}

// ✅ ENHANCED: getUserBookings per multi-club
export async function getUserBookings(user, options = {}) {
  const bookingsRef = collection(db, 'bookings');
  
  // Query 1: Prenotazioni CREATE dall'utente
  const q1 = query(
    bookingsRef,
    where('createdBy', '==', user.uid)
  );
  
  // Query 2: Prenotazioni BENEFITTING l'utente (anche se create da altri)
  const q2 = query(
    bookingsRef,
    where('userId', '==', user.uid),
    where('isProxyBooking', '==', true)
  );
  
  // Execute in parallel
  const [snap1, snap2] = await Promise.all([
    getDocs(q1),
    getDocs(q2)
  ]);
  
  // Merge and deduplicate
  const bookings = new Map();
  [...snap1.docs, ...snap2.docs].forEach(doc => {
    bookings.set(doc.id, { id: doc.id, ...doc.data() });
  });
  
  return Array.from(bookings.values())
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
}
```

---

### 🟢 CRITICITÀ 6: NO TRANSACTION ATOMICA

**Severità**: ⭐⭐ BASSA  
**Impatto**: Race conditions rare ma possibili

#### Descrizione

```javascript
// PROBLEMA: Validation + Write NON atomico

// 1. Get existing bookings
const existingBookings = await getPublicBookings({ forceRefresh: true });

// 2. Validate (può passare tempo)
const validationErrors = validateBooking(bookingData, existingBookings);

// ⚠️ RACE CONDITION WINDOW: Altri utenti potrebbero prenotare qui

// 3. Write booking
const docRef = await addDoc(collection(db, 'bookings'), cleanedData);

// ❌ Possibile doppia prenotazione stesso slot!
```

#### Scenario

```
Time  | User A                    | User B
------|---------------------------|---------------------------
T0    | Get bookings (10:00 free) | Get bookings (10:00 free)
T1    | Validate OK               |
T2    |                           | Validate OK
T3    | Write booking 10:00       |
T4    |                           | Write booking 10:00
      | ✅ Success                | ✅ Success (⚠️ CONFLICT!)
```

#### Soluzione

```javascript
// OPZIONE A: Firestore Transaction

import { runTransaction } from 'firebase/firestore';

async function createCloudBooking(booking) {
  const bookingsRef = collection(db, 'bookings');
  
  return await runTransaction(db, async (transaction) => {
    // 1. Query existing bookings in transaction
    const q = query(
      bookingsRef,
      where('clubId', '==', booking.clubId),
      where('courtId', '==', booking.courtId),
      where('date', '==', booking.date),
      where('status', '!=', 'cancelled')
    );
    
    const snapshot = await transaction.get(q);
    
    // 2. Validate INSIDE transaction
    const existingBookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const hasConflict = existingBookings.some(existing => {
      const existingStart = parseTime(existing.time);
      const existingEnd = existingStart + existing.duration;
      const newStart = parseTime(booking.time);
      const newEnd = newStart + booking.duration;
      
      return (newStart < existingEnd && newEnd > existingStart);
    });
    
    if (hasConflict) {
      throw new Error('Slot non più disponibile (prenotato da altro utente)');
    }
    
    // 3. Write if no conflict
    const newDocRef = doc(bookingsRef);
    transaction.set(newDocRef, {
      ...booking,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return {
      id: newDocRef.id,
      ...booking,
    };
  });
}
```

```javascript
// OPZIONE B: Optimistic Locking con retry

async function createCloudBookingWithRetry(booking, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Get latest bookings
      const existingBookings = await getPublicBookings({
        forceRefresh: true,
        clubId: booking.clubId,
        date: booking.date,
        courtId: booking.courtId,
      });
      
      // Validate
      const errors = validateBooking(booking, existingBookings);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      
      // Write
      const result = await createCloudBooking(booking);
      
      // Double-check after write (verification query)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const verification = await getDoc(doc(db, 'bookings', result.id));
      if (!verification.exists()) {
        throw new Error('Write verification failed');
      }
      
      return result;
      
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;  // Last attempt failed
      }
      
      // Retry with exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 100)
      );
      
      console.warn(`Retry ${attempt + 1}/${maxRetries} after conflict`);
    }
  }
}
```

**Raccomandazione**: OPZIONE A (Transaction) per garantire atomicità.

---

### 🟢 CRITICITÀ 7: CLEANUP DATA NON IMPLEMENTATO

**Severità**: ⭐⭐ BASSA  
**Impatto**: Storage usage aumenta nel tempo

#### Descrizione

```javascript
// PROBLEMA: NO soft deletes, NO hard cleanup

// 1. Bookings cancellati rimangono per sempre
{
  status: 'cancelled',
  cancelledAt: '2024-01-15',
  // ❌ NO deletedAt
  // ❌ NO autoDelete timestamp
}

// 2. Vecchi bookings (>6 mesi) non archiviati
// Tutte le query includono bookings di anni fa

// 3. NO cleanup per slot passati
// Booking del 2023 ancora in production DB
```

#### Soluzione

```javascript
// Cloud Function: Scheduled cleanup

import { onSchedule } from 'firebase-functions/v2/scheduler';
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';

export const cleanupOldBookings = onSchedule('every 24 hours', async () => {
  const db = getFirestore();
  const bookingsRef = collection(db, 'bookings');
  
  // 1. Delete cancelled bookings > 90 days old
  const cancelCutoff = new Date();
  cancelCutoff.setDate(cancelCutoff.getDate() - 90);
  
  const cancelledQuery = query(
    bookingsRef,
    where('status', '==', 'cancelled'),
    where('cancelledAt', '<', Timestamp.fromDate(cancelCutoff))
  );
  
  const cancelledSnap = await getDocs(cancelledQuery);
  
  let batch = writeBatch(db);
  let count = 0;
  
  for (const doc of cancelledSnap.docs) {
    batch.delete(doc.ref);
    count++;
    
    if (count % 500 === 0) {
      await batch.commit();
      batch = writeBatch(db);
    }
  }
  
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`Deleted ${count} old cancelled bookings`);
  
  // 2. Archive old completed bookings > 1 year
  const archiveCutoff = new Date();
  archiveCutoff.setFullYear(archiveCutoff.getFullYear() - 1);
  
  const oldQuery = query(
    bookingsRef,
    where('date', '<', archiveCutoff.toISOString().split('T')[0])
  );
  
  const oldSnap = await getDocs(oldQuery);
  
  // Move to archive collection
  const archiveRef = collection(db, 'bookings_archive');
  batch = writeBatch(db);
  count = 0;
  
  for (const doc of oldSnap.docs) {
    const archiveDoc = doc(archiveRef, doc.id);
    batch.set(archiveDoc, {
      ...doc.data(),
      archivedAt: Timestamp.now(),
    });
    
    batch.delete(doc.ref);
    count++;
    
    if (count % 500 === 0) {
      await batch.commit();
      batch = writeBatch(db);
    }
  }
  
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`Archived ${count} old bookings`);
});
```

---

## 📊 SUMMARY CRITICITÀ

| # | Criticità | Severità | Impatto | Effort | Priorità |
|---|-----------|----------|---------|--------|----------|
| 1 | Dual-write non implementato | 🔴 CRITICA | Statistiche errate, desync | 4h | P0 |
| 2 | No distinzione admin bookings | 🔴 ALTA | Audit trail incompleto | 6h | P0 |
| 3 | ID generation inconsistente | 🟡 MEDIA | Confusione debug | 2h | P1 |
| 4 | Validazione certificato permissiva | 🟡 MEDIA | Possibili errori | 3h | P1 |
| 5 | Cross-club visibility incompleto | 🟡 MEDIA | UX degradata multi-club | 4h | P2 |
| 6 | No transaction atomica | 🟢 BASSA | Race condition rara | 3h | P2 |
| 7 | No cleanup data | 🟢 BASSA | Storage growth | 2h | P3 |

---

## ✅ ACTION PLAN

### 🔥 IMMEDIATE (Questa settimana)

```markdown
## Sprint 1: Dual-Write & Admin Bookings

### Day 1-2: Dual-Write Implementation
- [ ] Implement dual-write in createCloudBooking() (2h)
- [ ] Implement dual-write in updateCloudBooking() (1h)
- [ ] Implement dual-write in deleteCloudBooking() (1h)
- [ ] Create sync script for existing bookings (2h)
- [ ] Run sync script in staging (1h)
- [ ] Verify admin dashboard stats (30min)
- [ ] Deploy to production (30min)

### Day 3-4: Admin Bookings Enhancement
- [ ] Add isAdminCreated, createdByRole fields (1h)
- [ ] Implement createAdminBooking() function (2h)
- [ ] Add admin mode toggle in UI (2h)
- [ ] Add user picker component (1h)
- [ ] Add admin notes field (30min)
- [ ] Add auto-confirm for admin bookings (1h)
- [ ] Test admin flow end-to-end (1h)

### Day 5: Testing & Documentation
- [ ] E2E tests for dual-write (2h)
- [ ] E2E tests for admin bookings (2h)
- [ ] Update API documentation (1h)
- [ ] Update user manual (1h)
```

### 📅 SHORT TERM (Prossime 2 settimane)

```markdown
## Sprint 2: ID Consistency & Certificate Validation

### Week 2: ID Management
- [ ] Decide: Firestore auto-gen vs client-gen (discussion)
- [ ] Implement chosen strategy (3h)
- [ ] Migration script for existing IDs (2h)
- [ ] Update all queries using ID (2h)
- [ ] Test backward compatibility (2h)

### Week 2-3: Certificate Validation
- [ ] Add strict mode flag (1h)
- [ ] Implement critical expiry check (2h)
- [ ] Add club settings for cert checks (2h)
- [ ] UI warnings for expiring certs (2h)
- [ ] Test various cert scenarios (2h)
```

### 🔮 LONG TERM (Prossimo mese)

```markdown
## Sprint 3: Advanced Features

### Cross-Club Visibility
- [ ] Semantic fix bookedForUserId (2h)
- [ ] Enhanced getUserBookings query (2h)
- [ ] UI for proxy bookings (3h)
- [ ] Test multi-club scenarios (2h)

### Transaction Safety
- [ ] Implement Firestore transactions (3h)
- [ ] Add retry logic with backoff (2h)
- [ ] Test concurrent bookings (2h)
- [ ] Performance benchmarks (1h)

### Data Cleanup
- [ ] Cloud Function for cleanup (2h)
- [ ] Archive collection setup (1h)
- [ ] Schedule and deploy (1h)
- [ ] Monitor first run (1h)
```

---

## 🎯 CONCLUSIONI

### Stato Attuale
- ✅ Sistema funzionante per utenti normali
- ⚠️ Admin bookings usano stesso flusso utenti (limitato)
- 🔴 Dual-write mancante causa desync statistiche
- 🟡 Validazioni certificate permissive
- 🟢 Performance OK, no bottleneck critici

### Raccomandazioni Immediate
1. **Implementare dual-write** (P0, 4h)
2. **Aggiungere metadata admin** (P0, 6h)
3. **Normalizzare ID generation** (P1, 2h)

### Long-term Vision
- Sistema transazionale per zero race conditions
- Admin panel completo con booking per clienti
- Certificati medico strict mode configurabile
- Archiving automatico bookings vecchi

---

**Report compilato da**: Senior Developer Review  
**Data**: 13 Novembre 2025  
**Versione**: 1.0  
**Status**: ✅ ANALISI COMPLETA
