# ✅ Sistema Unificato di Approvazione Circoli

**Data Implementazione**: 20 Ottobre 2025
**Status**: ✅ COMPLETATO

---

## 📋 Panoramica del Sistema

Precedentemente il sistema aveva **due flussi paralleli**:
- ❌ `affiliations` collection (non usata dal sistema admin)
- ✅ `clubRegistrationRequests` collection (usata dal sistema admin)

Ora entrambi i flussi sono **unificati in un unico sistema centralizzato**:

```
Registrazione Club (RegisterClubPage)
        ↓
    clubRegistrationRequests (status: pending)
        ↓
    Admin Approva (ClubRegistrationRequests.jsx)
        ↓
    Crea Club + Affiliation (status: approved)
        ↓
    Club Admin Accede alla Dashboard
```

---

## 🔄 Flusso di Registrazione e Approvazione

### 1️⃣ **STEP 1-3: Registrazione Circolo** (`RegisterClubPage.jsx`)

#### Prima della Modifica ❌
```javascript
// Salvava direttamente il club e l'affiliation
const clubRef = await addDoc(collection(db, 'clubs'), clubData);
// status: 'approved' (immediato!)
```

#### Dopo la Modifica ✅
```javascript
// Salva la richiesta in clubRegistrationRequests
const registrationRequest = {
  name: formData.clubName,
  description: formData.description || '',
  address: { ... },
  contact: { ... },
  adminData: {
    userId: newUser.uid,
    firstName: formData.adminFirstName,
    lastName: formData.adminLastName,
    email: formData.adminEmail,
    phone: formData.adminPhone,
  },
  logoBase64: logoBase64, // Stored as data URL
  status: 'pending',
  requestedAt: serverTimestamp(),
  approvedAt: null,
  clubId: null,
};

const requestRef = await addDoc(
  collection(db, 'clubRegistrationRequests'),
  registrationRequest
);
```

**Cosa succede al club admin:**
1. ✅ Account Firebase creato (può accedere con email/password)
2. ✅ Profilo utente creato in `/users`
3. ⏳ **In attesa di approvazione** - non ha access al club finché admin non approva
4. 📧 Riceverà email quando approvato

---

### 2️⃣ **Admin Approva il Circolo** (`ClubRegistrationRequests.jsx`)

#### Prima della Modifica ❌
```javascript
// Creava solo il club
const clubRef = await addDoc(collection(db, 'clubs'), clubData);
```

#### Dopo la Modifica ✅
```javascript
// 1. Crea il Club
const clubData = {
  name: request.name,
  ...
  status: 'approved',
  ownerId: request.adminData?.userId,
  managers: [request.adminData?.userId],
};
const clubRef = await addDoc(collection(db, 'clubs'), clubData);

// 2. Crea l'Affiliation per l'admin
if (request.adminData?.userId) {
  await addDoc(collection(db, 'affiliations'), {
    userId: request.adminData.userId,
    clubId: clubId,
    role: 'club_admin',
    status: 'approved',
    isClubAdmin: true,
    canManageBookings: true,
    canManageCourts: true,
    canManageInstructors: true,
    canViewReports: true,
    canManageMembers: true,
    canManageSettings: true,
    approvedAt: serverTimestamp(),
  });
}

// 3. Aggiorna la richiesta
await updateDoc(doc(db, 'clubRegistrationRequests', request.id), {
  status: 'approved',
  approvedAt: serverTimestamp(),
  clubId: clubId,
});
```

---

## 🗄️ Struttura Database

### `clubRegistrationRequests` Collection
```javascript
{
  id: "auto-generated",
  name: "Circolo XYZ",
  description: "Descrizione...",
  address: {
    street: "Via...",
    city: "Milano",
    province: "MI",
    postalCode: "20100",
    country: "Italia"
  },
  contact: {
    phone: "+39...",
    email: "circolo@example.com",
    website: "https://..."
  },
  adminData: {
    userId: "firebase-uid",
    firstName: "Mario",
    lastName: "Rossi",
    email: "mario@example.com",
    phone: "+39..."
  },
  logoBase64: "data:image/png;base64,...",
  status: "pending" | "approved" | "rejected",
  requestedAt: Timestamp,
  approvedAt: Timestamp | null,
  clubId: "firebase-doc-id | null"
}
```

### `clubs` Collection (creato dall'admin)
```javascript
{
  id: "firebase-doc-id",
  name: "Circolo XYZ",
  status: "approved",
  ownerId: "firebase-uid",
  managers: ["firebase-uid"],
  contact: { ... },
  logo: "data:image/png;base64,...",
  createdAt: Timestamp,
  ...
}
```

### `affiliations` Collection (creato dall'admin)
```javascript
{
  id: "firebase-doc-id",
  userId: "firebase-uid",
  clubId: "firebase-doc-id",
  role: "club_admin",
  status: "approved",
  isClubAdmin: true,
  canManageBookings: true,
  canManageCourts: true,
  canManageInstructors: true,
  canViewReports: true,
  canManageMembers: true,
  canManageSettings: true,
  approvedAt: Timestamp,
  ...
}
```

### `users` Collection (creato da RegisterClubPage)
```javascript
{
  id: "firebase-uid",
  uid: "firebase-uid",
  email: "circolo@example.com",
  displayName: "Mario Rossi",
  firstName: "Mario",
  lastName: "Rossi",
  phone: "+39...",
  provider: "password",
  createdAt: Timestamp,
  ...
}
```

---

## 🎯 Flusso Completo - Step by Step

### Scenario: Registrazione nuovo circolo

**T0: Club Admin si Registra**
```
1. Compila form con:
   - Nome circolo: "Centro Padel Roma"
   - Email circolo: "info@centropadel.it"
   - Password: "MyP@ssw0rd"
   - Admin Email: "mario@email.it"
   - Admin Phone: "+39329123456"
   - Logo: [immagine]

2. Cosa succede nel DB:
   - ✅ Crea Auth account (email: info@centropadel.it)
   - ✅ Crea /users/{uid} (profilo club admin)
   - ✅ Crea /clubRegistrationRequests/{id} (richiesta pending)
   - ❌ NON crea /clubs (aspetta approvazione)
   - ❌ NON crea /affiliations (aspetta approvazione)

3. Club admin:
   - Riceve conferma: "Richiesta inviata in attesa di approvazione"
   - Reindirizzato a home page
   - Riceverà email quando approvato
```

**T1: Super Admin Accede al Portale**
```
1. Vai a http://localhost:5173/admin/login
2. Accedi con: paris.andrea@live.it
3. Vai a Dashboard → "Richieste Circoli"
4. Vedi: "Centro Padel Roma" (richiesta pending)
5. Clicca "Approva"
```

**T2: Super Admin Approva**
```
1. Sistema crea:
   - ✅ /clubs/ABC123 (con status: 'approved')
   - ✅ /affiliations/uid_ABC123 (con status: 'approved')
   
2. Sistema aggiorna:
   - ✅ /clubRegistrationRequests/{id} (status: 'approved', clubId: 'ABC123')

3. Notifica:
   - Admin vede: "Circolo approvato! ID: ABC123"
```

**T3: Club Admin Accede a Dashboard**
```
1. Accede con: info@centropadel.it / MyP@ssw0rd
2. Sistema carica:
   - Profile da /users/{uid}
   - Memberships dal /affiliations (find by userId)
   - Club da /clubs/{clubId}
3. Accesso COMPLETO alla dashboard
4. NO yellow "pending" banner (è approvato!)
```

---

## 📂 File Modificati

### 1. `src/pages/RegisterClubPage.jsx`
- ❌ Rimosso: Creazione diretta di `/clubs` e `/affiliations`
- ✅ Aggiunto: Salvataggio in `/clubRegistrationRequests` con status 'pending'
- ✅ Aggiunto: Conversione logo a Base64
- ✅ Aggiunto: Storage in localStorage della registration request ID
- ✅ Modificato: Messaggio di successo (ora dice "in attesa di approvazione")

### 2. `src/pages/admin/ClubRegistrationRequests.jsx`
- ✅ Aggiunto: Creazione affiliation quando approva
- ✅ Aggiunto: Permission flags completi all'affiliation
- ✅ Modificato: Crea club con `status: 'approved'`
- ✅ Modificato: Aggiunge `ownerId`, `managers` al club

---

## 🧪 Come Testare

### Test 1: Registrazione Circolo
```bash
1. Vai a http://localhost:5173/club-registration
2. Compila il form:
   - Club Name: "Test Padel Club"
   - Club Email: "test@example.it"
   - Password: "Test@1234"
   - Admin Email: "admin@example.it"
   - Admin Phone: "+393331234567"
   - Descrizione: "Club di test"
   - Città: "Roma"
3. Clicca "Registra Circolo"
4. Dovrai vedere: "Richiesta di Registrazione Inviata!"
5. Controlla Firestore: /clubRegistrationRequests deve avere un documento con status='pending'
```

### Test 2: Approvazione Admin
```bash
1. Vai a http://localhost:5173/admin/login
2. Accedi con: paris.andrea@live.it / [password]
3. Clicca "Richieste Circoli"
4. Dovresti vedere il club registrato al Test 1
5. Clicca "Approva"
6. Controlla Firestore:
   - /clubRegistrationRequests: status cambiato a 'approved'
   - /clubs: nuovo documento creato
   - /affiliations: nuovo documento creato
```

### Test 3: Accesso Club Admin
```bash
1. Esci dal profilo admin
2. Vai a http://localhost:5173/login (user login)
3. Accedi con: test@example.it / Test@1234
4. Dovrebbe redirectare a /dashboard
5. Dovrebbe mostrare il club approvato
6. NO yellow banner (è già approvato)
```

---

## ⚠️ Note Importanti

### Dati dell'Admin
```javascript
adminData: {
  userId: "firebase-uid",         // Stored nel clubRegistrationRequests
  firstName: "Mario",
  lastName: "Rossi",
  email: "mario@example.com",     // Email PERSONALE dell'admin
  phone: "+39329...",
}
```

⚠️ **Attenzione**: L'email dell'admin è diversa dall'email del circolo!
- Email Circolo: `info@centropadel.it` (usata per login auth)
- Email Admin: `mario@example.it` (email personale per contatti)

### Logo Storage
- Salvato come **Base64 data URL** in Firestore
- Formato: `data:image/png;base64,...`
- Può essere visualizzato direttamente negli `<img src="...">`
- Per future ottimizzazioni, trasferire a Firebase Storage

### Affiliations
- Create con **TUTTI i permessi** abilitati (canManageBookings, etc.)
- Status: 'approved' (non pending)
- L'admin non vede banners di attesa - è già autorizzato

---

## 🔐 Security Considerations

1. ✅ Super admin ha whitelist di email autorizzate
2. ✅ Club registration richiede email non temporanea
3. ✅ Password con requisiti forti (8 char + special char)
4. ✅ Approvazione manuale dal super admin prima di visibility pubblica
5. ✅ Affiliations create con ruolo 'club_admin' (not arbitrary roles)

---

## 📞 Next Steps

### Implementazione Email Notifications
```javascript
// Quando approva, inviare email a:
// - Email circolo: "Circolo approvato! Puoi accedere a..."
// - Email admin: "Il tuo circolo è stato approvato!"
```

### Implementazione Rifiuto
```javascript
// Permettere super admin di rifiutare con motivo
// - Inviare email motivazione al club admin
// - Eliminare account se creato?
```

### Dashboard Visibility
```javascript
// Mostrare solo club con status: 'approved' in:
// - Club search pages
// - Public listings
// - Home page featured clubs
```

---

## 📊 Database Sync

### Collections da Usare
- ✅ `/clubRegistrationRequests` - Single source of truth per registrazioni
- ✅ `/clubs` - Circoli approvati e attivi
- ✅ `/affiliations` - Ruoli degli utenti nei club
- ✅ `/users` - Profili degli utenti

### Collections da Eliminare/Deprecare
- ⚠️ `/clubs/{clubId}/profiles` - Sostituita da `/affiliations`
- ⚠️ Direct club creation in `/clubs` (durante registrazione) - Ora via admin approval

---

**Implementazione Completata ✅**
**Test Ready 🧪**
**Deployment Ready 🚀**
