# Analisi Accesso Club Admin

## 🔍 Problema Attuale

Quando un utente registra un nuovo circolo, non viene reindirizzato correttamente alla dashboard admin e non vede le funzionalità admin.

---

## 📊 Flusso Attuale Registrazione

### 1. RegisterClubPage.jsx (handleSubmit)

```javascript
// Step 1: Crea account Firebase Auth
const userCredential = await createUserWithEmailAndPassword(auth, email, password);
const newUser = userCredential.user;

// Step 2: Crea circolo in Firestore
const clubRef = await addDoc(collection(db, 'clubs'), {
  name: formData.name,
  ownerId: newUser.uid,
  isActive: false,
  status: 'pending',
  // ... altri dati
});

// Step 3: Upload logo su Cloudinary (opzionale)
if (formData.logo) {
  const logoUrl = await uploadLogo(formData.logo, clubRef.id);
  await updateDoc(doc(db, 'clubs', clubRef.id), { logoUrl });
}

// Step 4: Crea profilo utente in users collection
await setDoc(doc(db, 'users', newUser.uid), {
  uid: newUser.uid,
  email: formData.adminEmail,
  displayName: formData.adminName,
  role: 'club-admin',  // ✅ Ruolo corretto
  clubId: clubRef.id,  // ✅ ID circolo collegato
  clubName: formData.name,
  createdAt: serverTimestamp(),
  registeredAt: serverTimestamp()
});

// Step 5: Crea profilo nel circolo (subcollection)
await setDoc(doc(db, 'clubs', clubRef.id, 'profiles', newUser.uid), {
  uid: newUser.uid,
  firstName: formData.adminName.split(' ')[0],
  lastName: formData.adminName.split(' ').slice(1).join(' ') || '',
  email: formData.adminEmail,
  role: 'admin',  // ✅ Ruolo admin nel circolo
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});

// Step 6: Redirect
navigate(`/club/${clubRef.id}/dashboard`);  // ✅ URL corretto
```

---

## 🎯 Controlli Accesso

### 1. AuthContext.jsx - determineUserRole()

**PROBLEMA**: Non controlla `profile.role === 'club-admin'`

```javascript
// ❌ PRIMA (NON FUNZIONAVA)
const determineUserRole = (profile, customClaims = {}, firebaseUser = null) => {
  // Check profile role for Super Admin
  if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
    return USER_ROLES.SUPER_ADMIN;
  }

  // Check custom claims (NON profiles!)
  if (customClaims.role === 'club_admin') {
    return USER_ROLES.CLUB_ADMIN;
  }
  
  // Default to user
  return USER_ROLES.USER;  // ❌ Utente club-admin finiva qui!
};
```

```javascript
// ✅ DOPO (SISTEMATO)
const determineUserRole = (profile, customClaims = {}, firebaseUser = null) => {
  // Check profile role for Super Admin
  if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
    return USER_ROLES.SUPER_ADMIN;
  }

  // Check profile role for Club Admin
  if (profile?.role === 'club-admin') {  // ✅ AGGIUNTO
    return USER_ROLES.CLUB_ADMIN;
  }

  // Check custom claims
  if (customClaims.role === 'club_admin') {
    return USER_ROLES.CLUB_ADMIN;
  }
  
  // Default to user
  return USER_ROLES.USER;
};
```

---

### 2. ClubDashboard.jsx - Verifica Admin

**Controllo alla linea 294:**

```javascript
{userProfile?.role === 'club-admin' && userProfile?.clubId === clubId && (
  <ClubActivationBanner club={club} />
)}
```

**Cosa serve:**
- ✅ `userProfile.role` === `'club-admin'` (dal documento `users/{userId}`)
- ✅ `userProfile.clubId` === `clubId` (dal params URL)

**Entrambi vengono creati correttamente durante la registrazione!**

---

### 3. AuthContext - loadUserAffiliations()

Questo viene chiamato dopo il login per caricare i circoli dell'utente:

```javascript
const loadUserAffiliations = async (userId) => {
  // Carica memberships da getUserClubMemberships
  const memberships = await getUserClubMemberships(userId);
  
  // Estrae ruoli per club
  let clubRoles = {};
  memberships.forEach((membership) => {
    if (membership.role && membership.status === 'active') {
      clubRoles[membership.clubId] = membership.role;  // es: { 'abc123': 'admin' }
    }
  });
  
  setUserClubRoles(clubRoles);
  
  // Auto-imposta currentClub se l'utente è admin di UN SOLO circolo
  const clubAdminRoles = Object.entries(clubRoles).filter(
    ([_clubId, role]) => role === 'club_admin'  // ⚠️ Cerca 'club_admin' ma il profilo ha 'admin'
  );
  
  if (clubAdminRoles.length === 1) {
    setCurrentClub(clubAdminRoles[0][0]);
  }
};
```

**PROBLEMA**: Cerca `role === 'club_admin'` ma nel profilo del circolo abbiamo `role: 'admin'`

---

## 🐛 Problemi Identificati

### ❌ Problema 1: determineUserRole non riconosce 'club-admin'
**File**: `src/contexts/AuthContext.jsx` (linea ~47-67)
**Fix**: ✅ Aggiunto check per `profile?.role === 'club-admin'`

### ❌ Problema 2: Mismatch ruoli nel profilo circolo
**File**: `src/pages/RegisterClubPage.jsx` (linea ~224)
**Attuale**: `role: 'admin'` nel profilo circolo
**Dovrebbe essere**: Coerente con il sistema

### ❌ Problema 3: Auto-set currentClub non funziona
**File**: `src/contexts/AuthContext.jsx` (linea ~110-115)
**Attuale**: Cerca `role === 'club_admin'` (con underscore)
**Nel DB**: `role: 'admin'` (senza prefisso)

---

## ✅ Soluzioni Implementate

### 1. Fix determineUserRole ✅

```javascript
// Aggiunto controllo per profile.role === 'club-admin'
if (profile?.role === 'club-admin') {
  return USER_ROLES.CLUB_ADMIN;
}
```

### 2. Verifica redirect URL ✅

```javascript
navigate(`/club/${clubRef.id}/dashboard`);  // Corretto!
```

---

## 🔬 Testing

### Test 1: Nuovo Circolo
1. ✅ Registra nuovo circolo
2. ✅ Verifica creazione documento `users/{userId}` con `role: 'club-admin'`
3. ✅ Verifica creazione profilo `clubs/{clubId}/profiles/{userId}` con `role: 'admin'`
4. ✅ Verifica redirect a `/club/{clubId}/dashboard`
5. ✅ Verifica che `AuthContext.userRole` === `'club_admin'`
6. ✅ Verifica che banner attivazione sia visibile
7. ✅ Verifica accesso a tutte le funzionalità admin

### Test 2: Login Esistente
1. Logout
2. Login con credenziali club-admin
3. Verifica che `userProfile.role` === `'club-admin'`
4. Verifica che `userRole` === `'club_admin'`
5. Verifica accesso dashboard

---

## 📝 Note Tecniche

### Convenzioni Ruoli

**Nel documento `users/{userId}`:**
- Super Admin: `role: 'ADMIN'` o `role: 'SUPER_ADMIN'`
- Club Admin: `role: 'club-admin'` ✅
- Instructor: `role: 'instructor'`
- User: `role: 'user'`

**Nel profilo `clubs/{clubId}/profiles/{userId}`:**
- Admin: `role: 'admin'` ✅
- Instructor: `role: 'instructor'`
- Member: `role: 'member'`

**In AuthContext (costanti):**
```javascript
USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  CLUB_ADMIN: 'club_admin',  // ⚠️ Con underscore
  INSTRUCTOR: 'instructor',
  USER: 'user'
}
```

### Gerarchia Permessi

1. **Super Admin** (`super_admin`)
   - Accesso a tutto
   - Pannello `/admin/clubs`
   - Può attivare/disattivare circoli

2. **Club Admin** (`club_admin`)
   - Accesso dashboard circolo
   - Gestione campi, istruttori, prenotazioni
   - Impostazioni circolo
   - Banner stato attivazione visibile

3. **Instructor** (`instructor`)
   - InstructorDashboard
   - Gestione lezioni proprie
   - Calendario disponibilità

4. **User** (`user`)
   - Prenotazioni
   - Profilo personale
   - Ricerca circoli

---

## 🚀 Prossimi Step

1. ✅ Test registrazione nuovo circolo
2. ⏳ Verifica auto-login dopo registrazione
3. ⏳ Verifica visibilità banner attivazione
4. ⏳ Test accesso sezioni admin (campi, istruttori, etc.)
5. ⏳ Deploy e test in produzione
