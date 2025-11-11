# 🔐 Admin Login Development Bypass

**Commit**: `90047c6f` (feat: add development bypass for admin login with authorized emails)

---

## 📋 Problema Risolto

Quando si sviluppa localmente con `npm run dev`, il login admin falliva con:

```
FirebaseError: Firebase: Error (auth/invalid-credential).
```

### Root Cause

- Account Firebase per `paris.andrea@live.it` non sincronizzato in locale
- Ogni tentativo di login passava per Firebase Auth (API call a identitytoolkit.googleapis.com)
- Password scaduta o account non configurato correttamente in Firestore

---

## ✅ Soluzione Implementata

### 1. Development Bypass per Admin Login

Modificato `src/pages/admin/AdminLogin.jsx`:

**File**: `src/pages/admin/AdminLogin.jsx`
**Commit**: `90047c6f`

#### Cosa cambia:

**Prima (❌ Falliva)**:

```javascript
// Sempre tentava login Firebase
const userCredential = await signInWithEmailAndPassword(auth, email, password);
```

**Dopo (✅ Funziona)**:

```javascript
// In DEVELOPMENT: Simula login senza Firebase
if (import.meta.env.DEV && AUTHORIZED_ADMINS.includes(email)) {
  console.log('🔐 [DEV MODE] Admin login bypass activated for:', email);

  const mockAdminUser = {
    uid: `admin-dev-${email.replace(/[^a-z0-9]/g, '')}`,
    email: email,
    displayName: 'Admin Developer',
    isAdmin: true,
  };

  localStorage.setItem('adminSession', JSON.stringify(mockAdminUser));
  console.log('✅ [DEV MODE] Admin session created:', mockAdminUser);

  navigate('/admin/dashboard');
  return;
}

// In PRODUCTION: Usa Firebase Authentication
const userCredential = await signInWithEmailAndPassword(auth, email, password);
```

---

## 🔑 Credenziali Admin

### Development (localhost:5174)

- **Email**: `paris.andrea@live.it` (o `admin@playsport.it`)
- **Password**: Qualsiasi cosa (il bypass accetta qualsiasi password)
- **Modalità**: Simula login, nessuna chiamata Firebase

### Production (netlify.app)

- **Email**: `paris.andrea@live.it` (o `admin@playsport.it`)
- **Password**: Password reale Firebase
- **Modalità**: Login reale via Firebase Auth

---

## 🎯 Console Output Expected

### In Development (`npm run dev`):

```javascript
🔐 [DEV MODE] Admin login bypass activated for: paris.andrea@live.it
✅ [DEV MODE] Admin session created: {
  uid: 'admin-dev-parisandrealiveit',
  email: 'paris.andrea@live.it',
  displayName: 'Admin Developer',
  isAdmin: true
}
```

### In Production:

```javascript
// Nessun log [DEV MODE], login reale via Firebase
```

---

## 🧪 Testing

### Test 1: Development Bypass

```bash
npm run dev
# Naviga a http://localhost:5174/admin/login
# Login: paris.andrea@live.it / qualsiasi_password
# Verifica: Console mostra "[DEV MODE] Admin login bypass"
# Risultato: ✅ Accesso alla dashboard admin
```

### Test 2: Production Auth

```bash
npm run build
# Deploy a production
# Login: paris.andrea@live.it / password_reale_firebase
# Verifica: Nessun log [DEV MODE]
# Risultato: ✅ Accesso via Firebase Auth
```

---

## 📁 File Modificati

| File                             | Cambiamenti | Linee      |
| -------------------------------- | ----------- | ---------- |
| `src/pages/admin/AdminLogin.jsx` | +30, -7     | 239 totali |

**Cambio Principale**:

- Spostato `AUTHORIZED_ADMINS` fuori dal componente (evita dipendenze React)
- Aggiunto controllo `import.meta.env.DEV` nel `handleLogin()`
- Simula login con mock user in development
- Mantiene login Firebase in production

---

## 🔄 Flow Comparison

### Development (`npm run dev`)

```
User → AdminLogin.jsx → import.meta.env.DEV check
  ├─ YES (development mode)
  │  └─ Create mock admin user → localStorage → Navigate to dashboard ✅
  └─ NO (production mode)
     └─ [Non eseguito in dev]
```

### Production (`npm run build` + deploy)

```
User → AdminLogin.jsx → import.meta.env.DEV check
  ├─ NO (production mode)
  │  └─ Firebase signInWithEmailAndPassword → Verify email → Navigate ✅
  └─ YES (development mode)
     └─ [Non eseguito in production]
```

---

## ⚠️ Security Notes

✅ **Sicuro per Development**:

- Bypass **attivato solo in `npm run dev`** (Vite dev server)
- **Non funziona in build di production** (`npm run build`)
- Richiede comunque email autorizzata in `AUTHORIZED_ADMINS`
- Session salvata solo in localStorage (non Firebase)

❌ **Non Usare in Production**:

- Il bypass NON funziona quando `import.meta.env.DEV === false`
- Production usa sempre Firebase Auth (password reale richiesta)
- I deploy to production non includono il codice DEV MODE

---

## 🚀 Prossimi Passi

### Immediato

- ✅ Test login admin in development: `http://localhost:5174/admin/login`
- ✅ Verifica accesso a `/admin/dashboard`
- ✅ Test push notifications nel admin panel

### Successivo

- [ ] Testing completo admin features
- [ ] Deploy to production (verificare password Firebase reale)
- [ ] Documentare admin panel features

---

## 📚 Riferimenti

- **Vite Environment Variables**: `import.meta.env.DEV`
- **Firebase Auth**: `signInWithEmailAndPassword()`
- **Previous Fix**: `DEV_PROD_FALLBACK_FIX.md` (push notifications dev/prod)

---

**Creato**: 11 Nov 2025  
**Commit**: `90047c6f`  
**Branch**: `dark-theme-migration`
