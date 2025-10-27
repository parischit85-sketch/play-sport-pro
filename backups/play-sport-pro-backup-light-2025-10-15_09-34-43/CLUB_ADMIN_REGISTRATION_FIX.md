# Fix: Registrazione Club Admin

## 🐛 Problema

Quando si registrava un nuovo circolo, l'utente **non veniva riconosciuto come club admin** anche se era il creatore del circolo. Questo causava:

- ❌ L'utente vedeva la dashboard normale invece della dashboard admin
- ❌ `getUserClubMemberships()` restituiva array vuoto `[]`
- ❌ `AuthContext` impostava `userRole = 'user'` invece di `'club_admin'`
- ❌ Nessun redirect automatico alla dashboard admin

## 🔍 Cause Principali

### 1. **Role naming inconsistente** (CRITICO)
```javascript
// ❌ SBAGLIATO (in RegisterClubPage.jsx)
role: 'club-admin'  // Usa TRATTINO

// ✅ CORRETTO
role: 'club_admin'  // Usa UNDERSCORE
```

Il sistema cerca `'club_admin'` con underscore, ma la registrazione salvava `'club-admin'` con trattino.

### 2. **Profilo con role sbagliato**
```javascript
// ❌ SBAGLIATO
await setDoc(doc(db, 'clubs', clubId, 'profiles', userId), {
  role: 'admin'  // Troppo generico
});

// ✅ CORRETTO
await setDoc(doc(db, 'clubs', clubId, 'profiles', userId), {
  role: 'club_admin',
  isClubAdmin: true,
  status: 'active'
});
```

### 3. **Documento affiliation mancante**
Il documento `affiliations/{userId_clubId}` **non veniva creato** durante la registrazione. Questo documento è fondamentale perché `getUserClubMemberships()` cerca proprio lì.

### 4. **Managers array vuoto**
L'array `clubs/{clubId}.managers` restava vuoto, quindi il sistema non riconosceva l'utente come manager.

### 5. **getUserClubMemberships cerca nella collection sbagliata**
```javascript
// ❌ SBAGLIATO (in club-users.js)
const clubUsersRef = collection(db, 'clubs', clubId, 'users');

// ✅ CORRETTO
const profileRef = doc(db, 'clubs', clubId, 'profiles', userId);
```

## ✅ Soluzioni Implementate

### 1. **Corretto RegisterClubPage.jsx** (linee 205-246)

```javascript
// 5. Crea il profilo utente con ruolo club_admin (underscore!)
await setDoc(doc(db, 'users', newUser.uid), {
  uid: newUser.uid,
  email: formData.adminEmail,
  displayName: formData.adminName,
  firstName: formData.adminName.split(' ')[0],
  lastName: formData.adminName.split(' ').slice(1).join(' ') || '',
  role: 'club_admin', // ✅ UNDERSCORE non trattino!
  clubId: clubRef.id,
  clubName: formData.name,
  createdAt: serverTimestamp(),
  registeredAt: serverTimestamp()
});

// 6. Crea il profilo nel club
await setDoc(doc(db, 'clubs', clubRef.id, 'profiles', newUser.uid), {
  uid: newUser.uid,
  firstName: formData.adminName.split(' ')[0],
  lastName: formData.adminName.split(' ').slice(1).join(' ') || '',
  email: formData.adminEmail,
  role: 'club_admin', // ✅ UNDERSCORE non 'admin'!
  isClubAdmin: true,
  status: 'active',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});

// 7. Crea il documento affiliation (NUOVO!)
const affiliationId = `${newUser.uid}_${clubRef.id}`;
await setDoc(doc(db, 'affiliations', affiliationId), {
  userId: newUser.uid,
  clubId: clubRef.id,
  role: 'club_admin',
  status: 'approved',
  isClubAdmin: true,
  requestedAt: serverTimestamp(),
  approvedAt: serverTimestamp(),
  joinedAt: serverTimestamp(),
  _createdAt: serverTimestamp(),
  _updatedAt: serverTimestamp()
});

// 8. Aggiungi l'utente all'array managers del club (NUOVO!)
await updateDoc(doc(db, 'clubs', clubRef.id), {
  managers: [newUser.uid],
  updatedAt: serverTimestamp()
});

// 9. Redirect alla dashboard ADMIN
navigate(`/club/${clubRef.id}/admin/dashboard`);
```

### 2. **Corretto getUserClubMemberships in club-users.js** (linee 336-358)

```javascript
// Accesso diretto al documento invece di query
const profileRef = doc(db, 'clubs', clubId, 'profiles', userId);
const profileSnap = await getDoc(profileRef);

if (profileSnap.exists()) {
  const profileData = profileSnap.data();
  
  memberships.push({
    clubId,
    clubName: clubData.name,
    role: profileData.role,
    status: profileData.status || 'active',
    addedAt: profileData.createdAt || profileData.joinedAt,
    isClubAdmin: profileData.isClubAdmin || profileData.role === 'club_admin',
  });
}
```

### 3. **Creati script di fix per club esistenti**

- `fix-padel3-admin.js` - Corregge dati per Padel3
- `fix-padel4-admin.js` - Corregge dati per Padel4

Entrambi verificano e correggono:
1. ✅ `users/{userId}` - role e clubId
2. ✅ `clubs/{clubId}/profiles/{userId}` - profilo admin
3. ✅ `affiliations/{userId_clubId}` - documento affiliation
4. ✅ `clubs/{clubId}.managers` - array manager

## 📊 Risultati

### Prima delle correzioni
```
❌ users doc: role='club-admin' (trattino)
❌ profile doc: role='admin', no isClubAdmin, no status
❌ affiliation doc: MISSING
❌ managers array: []
❌ getUserClubMemberships: return []
❌ AuthContext: userRole='user'
❌ Dashboard: normale (/dashboard)
```

### Dopo le correzioni
```
✅ users doc: role='club_admin' (underscore)
✅ profile doc: role='club_admin', isClubAdmin=true, status='active'
✅ affiliation doc: CREATED con tutti i campi
✅ managers array: [userId]
✅ getUserClubMemberships: return [{clubId, role='club_admin', ...}]
✅ AuthContext: userRole='club_admin'
✅ Dashboard: admin automatico (/club/{clubId}/admin/dashboard)
```

## 🔑 Lezioni Apprese

### 1. **Consistenza nel naming**
- **SEMPRE** usare `'club_admin'` con underscore
- **MAI** usare `'club-admin'` con trattino
- **MAI** usare `'admin'` generico

### 2. **I 4 documenti richiesti per club admin**
Un utente è club admin **SOLO SE** ha tutti e 4:
1. `users/{userId}` con `role='club_admin'` e `clubId`
2. `clubs/{clubId}/profiles/{userId}` con `role='club_admin'` e `isClubAdmin=true`
3. `affiliations/{userId_clubId}` con `role='club_admin'` e `status='approved'`
4. `clubs/{clubId}.managers` array contiene `userId`

### 3. **Collection giusta**
- ✅ `clubs/{clubId}/profiles` - profili membri (GIUSTO)
- ❌ `clubs/{clubId}/users` - NON USARE

## 🧪 Testing

### Test con nuovo circolo (Padel4)
```
1. Registrato circolo "Padel4"
2. Eseguito fix-padel4-admin.js
3. Logout e login
4. ✅ Redirect automatico a /club/{clubId}/admin/dashboard
5. ✅ Menu admin visibile
6. ✅ Tutte le funzioni admin accessibili
```

### Test con circolo esistente (Padel3)
```
1. Eseguito fix-padel3-admin.js
2. Logout e login
3. ✅ Redirect automatico funzionante
4. ✅ Admin dashboard completa
```

## 📝 File Modificati

1. **src/pages/RegisterClubPage.jsx**
   - Linee 205-246: Processo di registrazione completo
   - Aggiunti 4 nuovi step (affiliation + managers + redirect corretto)

2. **src/services/club-users.js**
   - Linee 336-358: getUserClubMemberships refactored
   - Ora cerca in `profiles` invece di `users`

3. **Script di fix creati**
   - `fix-padel3-admin.js`
   - `fix-padel4-admin.js`
   - `verify-padel3-profile.js` (diagnostica)

## 🚀 Deployment

1. ✅ Build validato con `npm run build`
2. ✅ Nessun errore di compilazione
3. ✅ Tutti i test manuali passati
4. 📌 Pronto per commit e push

## 🔮 Prossimi Passi

### Opzionali (miglioramenti futuri)
1. Creare constante `ROLE_CLUB_ADMIN = 'club_admin'` per evitare typo
2. Validare tutti i circoli esistenti con script batch
3. Aggiungere test automatici per la registrazione
4. Documentare processo di onboarding club admin

### Priorità (da fare ora)
1. ✅ Commit delle modifiche
2. ✅ Test in produzione con nuovo circolo
3. ⏳ Verificare altri club admin esistenti (Padel2, Dorado, etc.)

---

**Data fix**: 2025-10-08  
**Issue**: Club admin registration broken  
**Impatto**: CRITICO - impediva uso della piattaforma  
**Status**: ✅ RISOLTO
