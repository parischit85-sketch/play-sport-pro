# 📊 Data Model Restructuring - Eliminazione Duplicazioni

## 🎯 Problema Identificato

Attualmente i dati utente sono duplicati in **3 diverse location** di Firestore:

1. **`/users/{userId}`** - Profilo principale utente
2. **`/clubs/{clubId}/profiles/{userId}`** - Profilo dell'utente all'interno del circolo (SUBCOLLECTION)
3. **`/affiliations/{userId}_{clubId}`** - Relazione utente-circolo con ruolo

Questo causa:
- ❌ Inconsistenze quando i dati vengono aggiornati in un posto ma non negli altri
- ❌ Query multiple per recuperare dati completi
- ❌ Storage sprecato (stessi dati ripetuti)
- ❌ Complessità nel mantenere tutto sincronizzato

## ✅ Nuova Struttura (Single Source of Truth)

### 1. `/users/{userId}` - Dati Personali (INALTERABILI)

```javascript
{
  uid: string,
  email: string,
  firstName: string,
  lastName: string,
  phone: string,
  birthDate: string | null,
  fiscalCode: string | null,
  address: string | null,
  photoURL: string | null,
  provider: 'google' | 'facebook' | 'password',
  createdAt: Timestamp,
  updatedAt: Timestamp,
  registrationCompleted: boolean,
}
```

**Responsabilità**: Dati anagrafici e di contatto dell'utente. Non contiene informazioni su circoli o ruoli.

### 2. `/affiliations/{userId}_{clubId}` - Relazioni Utente-Circolo

```javascript
{
  userId: string,
  clubId: string,
  role: 'club_admin' | 'club_manager' | 'player' | 'instructor',
  status: 'pending' | 'approved' | 'rejected' | 'suspended',
  isClubAdmin: boolean,
  
  // Permission flags
  canManageBookings: boolean,
  canManageCourts: boolean,
  canManageInstructors: boolean,
  canViewReports: boolean,
  
  // Timestamps
  requestedAt: Timestamp,
  approvedAt: Timestamp | null,
  rejectedAt: Timestamp | null,
  suspendedAt: Timestamp | null,
  joinedAt: Timestamp,
  _createdAt: Timestamp,
  _updatedAt: Timestamp,
}
```

**Responsabilità**: Relazione tra utente e circolo, include ruolo e permessi specifici per quel circolo.

### 3. `/clubs/{clubId}` - Dati del Circolo

```javascript
{
  name: string,
  description: string,
  logoUrl: string | null,
  address: {
    street: string,
    city: string,
    province: string,
    postalCode: string,
    country: string,
  },
  contact: {
    phone: string,
    email: string,
    website: string,
  },
  
  // Arrays di riferimento (solo IDs)
  managers: string[],      // userId degli amministratori
  instructors: string[],   // userId degli istruttori
  members: string[],       // userId dei membri
  
  // Owner
  ownerId: string,
  ownerEmail: string,
  
  // Status
  status: 'pending' | 'active' | 'suspended',
  isActive: boolean,
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  // Settings
  settings: {...},
  sports: [...],
  courts: [...],
}
```

**Responsabilità**: Informazioni del circolo. Gli array `managers`, `instructors`, `members` contengono solo **ID** degli utenti, non i dati completi.

### ❌ ELIMINARE: `/clubs/{clubId}/profiles/{userId}` (SUBCOLLECTION)

Questa subcollection è **completamente rimossa**. I dati personali sono in `/users`, i ruoli in `/affiliations`.

## 🔄 Migration Plan

### Step 1: Aggiornare RegisterClubPage.jsx

**PRIMA:**
```javascript
// 4. Crea profilo in /users
await setDoc(doc(db, 'users', newUser.uid), {...});

// 5. Crea profilo in /clubs/{clubId}/profiles (DUPLICAZIONE!)
await setDoc(doc(db, 'clubs', clubId, 'profiles', newUser.uid), {...});

// 6. Crea affiliation
await setDoc(doc(db, 'affiliations', affiliationId), {...});
```

**DOPO:**
```javascript
// 4. Crea profilo in /users (dati personali)
await setDoc(doc(db, 'users', newUser.uid), {
  uid: newUser.uid,
  email: formData.clubEmail,
  firstName: formData.adminFirstName,
  lastName: formData.adminLastName,
  phone: formData.adminPhone,
  provider: 'password',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  registrationCompleted: true,
});

// 5. Crea affiliation (ruolo e permessi)
await setDoc(doc(db, 'affiliations', `${newUser.uid}_${clubId}`), {
  userId: newUser.uid,
  clubId: clubId,
  role: 'club_admin',
  status: 'approved',
  isClubAdmin: true,
  canManageBookings: true,
  canManageCourts: true,
  canManageInstructors: true,
  canViewReports: true,
  requestedAt: serverTimestamp(),
  approvedAt: serverTimestamp(),
  joinedAt: serverTimestamp(),
  _createdAt: serverTimestamp(),
  _updatedAt: serverTimestamp(),
});

// 6. Aggiungi manager al club
await updateDoc(doc(db, 'clubs', clubId), {
  managers: [newUser.uid],
  updatedAt: serverTimestamp(),
});

// ✅ NO subcollection in /clubs/{clubId}/profiles !
```

### Step 2: Aggiornare RegisterPage.jsx

**PRIMA:**
```javascript
await saveUserProfile(userId, {
  email: formData.email,
  firstName: formData.firstName,
  // ... altri campi
  registrationCompleted: true,
});
```

**DOPO:**
```javascript
await saveUserProfile(userId, {
  uid: userId,
  email: formData.email,
  firstName: formData.firstName,
  lastName: formData.lastName,
  phone: formData.phone,
  fiscalCode: formData.fiscalCode,
  birthDate: formData.birthDate,
  address: formData.address,
  provider: 'password', // or 'google', 'facebook'
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  registrationCompleted: true,
});

// ✅ NO club-specific data here!
```

### Step 3: Cloud Function per migrazione dati esistenti

```javascript
// functions/migrateProfiles.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.migrateProfilesFromSubcollection = functions.https.onRequest(async (req, res) => {
  const db = admin.firestore();
  
  try {
    // Get all clubs
    const clubsSnapshot = await db.collection('clubs').get();
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const clubDoc of clubsSnapshot.docs) {
      const clubId = clubDoc.id;
      
      // Get profiles subcollection
      const profilesSnapshot = await db
        .collection('clubs')
        .doc(clubId)
        .collection('profiles')
        .get();
      
      for (const profileDoc of profilesSnapshot.docs) {
        try {
          const profileData = profileDoc.data();
          const userId = profileDoc.id;
          
          // Check if affiliation already exists
          const affiliationId = `${userId}_${clubId}`;
          const affiliationDoc = await db.collection('affiliations').doc(affiliationId).get();
          
          if (!affiliationDoc.exists) {
            // Create affiliation from profile data
            await db.collection('affiliations').doc(affiliationId).set({
              userId: userId,
              clubId: clubId,
              role: profileData.role || 'player',
              status: profileData.status || 'approved',
              isClubAdmin: profileData.isClubAdmin || false,
              canManageBookings: profileData.isClubAdmin || false,
              canManageCourts: profileData.isClubAdmin || false,
              canManageInstructors: profileData.isClubAdmin || false,
              canViewReports: profileData.isClubAdmin || false,
              requestedAt: profileData.createdAt,
              approvedAt: profileData.createdAt,
              joinedAt: profileData.createdAt,
              _createdAt: profileData.createdAt,
              _updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            
            migratedCount++;
          }
          
          // Delete profile from subcollection
          await profileDoc.ref.delete();
          
        } catch (error) {
          console.error(`Error migrating profile ${profileDoc.id} for club ${clubId}:`, error);
          errorCount++;
        }
      }
    }
    
    res.json({
      success: true,
      migratedCount,
      errorCount,
      message: `Migration completed. Migrated: ${migratedCount}, Errors: ${errorCount}`,
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
```

## 📋 Checklist Implementazione

- [ ] Aggiornare RegisterClubPage.jsx (rimuovere creazione subcollection)
- [ ] Aggiornare RegisterPage.jsx (assicurarsi che non crei dati in clubs)
- [ ] Verificare che auth.jsx non crei subcollections
- [ ] Creare Cloud Function per migrazione
- [ ] Testare creazione nuovo club con nuova struttura
- [ ] Eseguire migrazione su database di produzione
- [ ] Verificare che tutte le query funzionino
- [ ] Aggiornare documentazione API

## 🎉 Benefici

✅ **Single Source of Truth**: Ogni dato ha una sola location  
✅ **Performance**: Meno query per recuperare dati completi  
✅ **Manutenibilità**: Aggiornamenti in un solo posto  
✅ **Scalabilità**: Struttura più pulita per crescita futura  
✅ **Consistency**: Impossibile avere dati inconsistenti tra locations

## ⚠️ Breaking Changes

**Attenzione**: Questo cambiamento richiede aggiornamento di:
- Tutte le query che leggono `/clubs/{clubId}/profiles`
- Tutti i componenti che mostrano dati utente in contesto club
- Dashboard admin del club
- Gestione membri del club

**Raccomandazione**: Fare deployment in fasi:
1. Deploy nuova logica per nuove registrazioni
2. Migrare dati esistenti
3. Aggiornare query e componenti
4. Rimuovere vecchio codice
