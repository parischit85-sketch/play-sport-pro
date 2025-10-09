# Fix Accesso Dashboard Admin Club Post-Registrazione

## 🎯 Obiettivo

Permettere all'utente che registra un nuovo circolo di accedere immediatamente alla dashboard admin del circolo.

---

## 🐛 Problema Identificato

Quando un utente registra un nuovo circolo tramite `/register-club`:
1. ✅ Il circolo viene creato correttamente
2. ✅ Il profilo utente viene creato con `role: 'club-admin'`
3. ✅ Il profilo nel circolo viene creato con `role: 'admin'`
4. ✅ Il redirect va a `/club/{clubId}/dashboard`
5. ❌ **MA l'utente non vede le funzionalità admin**

**Root Cause**: La funzione `AuthContext.determineUserRole()` non controllava il valore `profile.role === 'club-admin'`, quindi l'utente veniva classificato come `USER` normale invece che `CLUB_ADMIN`.

---

## ✅ Soluzione Implementata

### 1. Fix AuthContext.jsx

**File**: `src/contexts/AuthContext.jsx`  
**Linee**: ~47-72

**Prima:**
```javascript
const determineUserRole = (profile, customClaims = {}, firebaseUser = null) => {
  if (firebaseUser?.isSpecialAdmin || profile?.isSpecialAdmin) {
    return USER_ROLES.SUPER_ADMIN;
  }

  if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
    return USER_ROLES.SUPER_ADMIN;
  }

  // ❌ Mancava il check per 'club-admin'

  if (customClaims.role === 'club_admin') {
    return USER_ROLES.CLUB_ADMIN;
  }

  if (customClaims.role === 'instructor') {
    return USER_ROLES.INSTRUCTOR;
  }

  return USER_ROLES.USER;  // ❌ Club admin finiva qui!
};
```

**Dopo:**
```javascript
const determineUserRole = (profile, customClaims = {}, firebaseUser = null) => {
  if (firebaseUser?.isSpecialAdmin || profile?.isSpecialAdmin) {
    return USER_ROLES.SUPER_ADMIN;
  }

  if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
    return USER_ROLES.SUPER_ADMIN;
  }

  // ✅ AGGIUNTO: Check per club-admin
  if (profile?.role === 'club-admin') {
    return USER_ROLES.CLUB_ADMIN;
  }

  if (customClaims.role === 'club_admin') {
    return USER_ROLES.CLUB_ADMIN;
  }

  if (customClaims.role === 'instructor') {
    return USER_ROLES.INSTRUCTOR;
  }

  return USER_ROLES.USER;
};
```

---

### 2. Fix Redirect URL (già fatto in sessione precedente)

**File**: `src/pages/RegisterClubPage.jsx`  
**Linea**: ~234

**Prima:**
```javascript
navigate(`/clubs/${clubRef.id}`);  // ❌ Pagina pubblica del circolo
```

**Dopo:**
```javascript
navigate(`/club/${clubRef.id}/dashboard`);  // ✅ Dashboard admin del circolo
```

---

## 🔍 Verifica Funzionamento

### Flusso Completo Post-Fix

1. **Utente compila form registrazione** (`/register-club`)
2. **Sistema crea**:
   - Account Firebase Auth
   - Documento circolo in `clubs/{clubId}`
   - Profilo utente in `users/{userId}` con `role: 'club-admin', clubId: '{clubId}'`
   - Profilo circolo in `clubs/{clubId}/profiles/{userId}` con `role: 'admin'`
3. **Upload logo su Cloudinary** (se presente)
4. **AuthContext carica il profilo**:
   - `getUserProfile()` legge `users/{userId}`
   - `determineUserRole()` vede `profile.role === 'club-admin'`
   - ✅ **Imposta `userRole = 'club_admin'`**
5. **Redirect a `/club/{clubId}/dashboard`**
6. **ClubDashboard verifica**:
   - `userProfile.role === 'club-admin'` ✅
   - `userProfile.clubId === clubId` ✅
   - ✅ **Mostra ClubActivationBanner e funzionalità admin**

---

## 📊 Cosa Viene Mostrato

### Per Club Admin

#### Banner Stato Circolo
```jsx
{userProfile?.role === 'club-admin' && userProfile?.clubId === clubId && (
  <ClubActivationBanner club={club} />
)}
```

Il banner mostra:
- 🟡 **Pending**: "Il tuo circolo è in attesa di approvazione"
- 🟢 **Active**: "Il tuo circolo è attivo e visibile al pubblico"
- 🔴 **Inactive**: "Il tuo circolo è stato disattivato"

#### Sezioni Amministrative Visibili
- ⚙️ **Impostazioni Circolo** (`/club/{clubId}/settings`)
- 🏟️ **Gestione Campi** (tab "Campi")
- 👨‍🏫 **Gestione Istruttori** (tab "Istruttori")
- 📅 **Gestione Prenotazioni Admin** (`/club/{clubId}/admin/bookings`)
- 📊 **Dashboard Admin** (`/club/{clubId}/admin/dashboard`)

---

## 🧪 Test Eseguiti

### Scenario 1: Nuova Registrazione
1. ✅ Vai a `/register-club`
2. ✅ Compila tutti i 4 step
3. ✅ Upload logo (opzionale)
4. ✅ Click "Completa Registrazione"
5. ✅ **Risultato**: Redirect automatico a `/club/{clubId}/dashboard`
6. ✅ **Risultato**: Banner attivazione visibile
7. ✅ **Risultato**: Accesso a tutte le funzionalità admin

### Scenario 2: Login Esistente
1. ✅ Logout
2. ✅ Login con account club-admin esistente
3. ✅ `userRole` === `'club_admin'`
4. ✅ Accesso dashboard circolo funzionante

### Scenario 3: Script Fix per Utente Esistente
1. ✅ Eseguito `node fix-club-admin-access.js`
2. ✅ Sistemati dati utente esistente (Padel 1)
3. ✅ Dashboard accessibile

---

## 📁 File Modificati

### src/contexts/AuthContext.jsx
- **Modifica**: Aggiunto check `profile?.role === 'club-admin'` in `determineUserRole()`
- **Linee**: ~47-72
- **Impatto**: Risolve il riconoscimento del ruolo club-admin

### src/pages/RegisterClubPage.jsx
- **Modifica**: Redirect da `/clubs/{id}` a `/club/{id}/dashboard`
- **Linea**: ~234
- **Impatto**: Reindirizza correttamente alla dashboard admin

---

## 🚀 Deploy

### Checklist Pre-Deploy
- [x] Fix `AuthContext.determineUserRole()` implementato
- [x] Fix redirect URL implementato
- [x] Test in locale eseguiti
- [x] Documentazione creata
- [ ] Build Vite eseguito senza errori
- [ ] Commit e push su GitHub
- [ ] Deploy Netlify completato
- [ ] Test in produzione

### Comandi Deploy
```bash
# 1. Build locale per verificare
npm run build

# 2. Commit modifiche
git add .
git commit -m "fix: Risolto accesso dashboard admin club post-registrazione"

# 3. Push (trigger Netlify auto-deploy)
git push origin main
```

---

## 🎉 Risultato Finale

Dopo questo fix:

✅ **Registrazione Nuovo Circolo**:
- L'utente registra un nuovo circolo
- Viene automaticamente reindirizzato alla dashboard admin
- Vede il banner di stato attivazione (pending)
- Ha accesso a tutte le funzionalità di gestione
- Può configurare campi, istruttori, orari
- Può gestire le prenotazioni

✅ **Login Club Admin Esistente**:
- Login funziona correttamente
- Accesso alla dashboard del proprio circolo
- Tutte le funzionalità admin disponibili

✅ **Super Admin**:
- Può vedere e gestire tutti i circoli
- Può attivare/disattivare circoli dal pannello `/admin/clubs`

---

## 📝 Note Tecniche

### Convenzione Ruoli

**users/{userId}.role**:
- `'ADMIN'` o `'SUPER_ADMIN'` → Super Admin
- `'club-admin'` → Club Admin ✅
- `'instructor'` → Instructor
- `'user'` → User normale

**clubs/{clubId}/profiles/{userId}.role**:
- `'admin'` → Admin del circolo ✅
- `'instructor'` → Istruttore
- `'member'` → Membro semplice

**AuthContext.userRole** (costanti):
- `'super_admin'`
- `'club_admin'` ✅
- `'instructor'`
- `'user'`

### Flusso Autenticazione

```
1. onAuthStateChanged (Firebase)
   ↓
2. getUserProfile(userId) → legge users/{userId}
   ↓
3. determineUserRole(profile) → valuta profile.role
   ↓
4. setUserRole('club_admin') ✅
   ↓
5. loadUserAffiliations(userId) → carica circoli
   ↓
6. ClubDashboard verifica userProfile.role + userProfile.clubId
   ↓
7. Mostra banner + funzionalità admin ✅
```

---

## 🔧 Troubleshooting

### Problema: "Non vedo il banner attivazione"

**Check**:
1. Console browser: cerca `userProfile` in console
2. Verifica che `userProfile.role === 'club-admin'`
3. Verifica che `userProfile.clubId === clubId`
4. Hard refresh: Ctrl+Shift+R

**Fix**: Script `fix-club-admin-access.js` per sistemare dati

### Problema: "Dopo registrazione vedo solo pagina utente"

**Check**:
1. Verifica URL: deve essere `/club/{id}/dashboard` non `/clubs/{id}`
2. Verifica che il redirect sia avvenuto
3. Console: cerca errori AuthContext

**Fix**: Il redirect è corretto nel codice, potrebbe essere cache browser

---

## 📚 Documentazione Correlata

- `CLUB_ACTIVATION_SYSTEM.md` - Sistema attivazione circoli
- `CLUB_REGISTRATION_LOGO_FIX.md` - Upload logo Cloudinary
- `CLUB_ADMIN_ACCESS_ANALYSIS.md` - Analisi completa accesso admin
- `fix-club-admin-access.js` - Script fix utenti esistenti
