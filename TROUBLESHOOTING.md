# 🔧 Troubleshooting Guide - Paris League

## ❗ Problemi Risolti durante il Refactoring

### 1. **Maximum Update Depth Exceeded (Routing Loop)**

**Problema**: Loop infinito con errore "Maximum update depth exceeded" nel router.

**Causa**: Il componente `Navigate` in `ProtectedRoute` e `PublicRoute` causava redirect continui quando l'utente faceva login.

**Soluzione**: 
- ✅ Aggiornato `ProtectedRoute.jsx` con logica anti-loop
- ✅ Creato `src/utils/navigation.js` per prevenire redirect rapidi
- ✅ Modificato router per usare path relativi (`"dashboard"` invece di `"/dashboard"`)

```javascript
// Prima (problematico)
return <Navigate to="/dashboard" replace />;

// Dopo (risolto)
if (shouldRedirect(location.pathname, redirectPath, true)) {
  return <Navigate to={redirectPath} replace />;
}
```

### 2. **Cross-Origin-Opener-Policy Warning con Firebase Auth**

**Problema**: Warning CORS con Google OAuth popup che causava confusione.

**Causa**: Configurazione restrictive del CORS policy in Vite.

**Soluzione**:
- ✅ Aggiornato `vite.config.js` con `'Cross-Origin-Opener-Policy': 'unsafe-none'`
- ✅ Aggiunta gestione intelligente degli errori CORS in `auth.jsx`
- ✅ I warning non bloccano più il login

```javascript
// vite.config.js
server: {
  headers: {
    'Cross-Origin-Opener-Policy': 'unsafe-none',
    'Cross-Origin-Embedder-Policy': 'unsafe-none'
  }
}
```

### 3. **React Router v7 Navigation Throttling**

**Problema**: Browser throttling con messaggio "Throttling navigation to prevent hanging".

**Causa**: React Router v7 ha protezione anti-flooding per navigation rapida.

**Soluzione**:
- ✅ Implementato sistema anti-loop in `navigation.js`
- ✅ Aggiunta debounce logic per prevent rapid navigation
- ✅ Utilizzato path relativi invece di assoluti dove possibile

---

## 🚨 Problemi Comuni & Soluzioni

### **Build Errors**

#### **Module Not Found**
```bash
Error: Cannot resolve module '@contexts/AuthContext.jsx'
```

**Soluzione**: Verificare gli alias in `vite.config.js`:
```javascript
resolve: {
  alias: {
    '@contexts': path.resolve(__dirname, 'src/contexts'),
    // ... altri alias
  }
}
```

#### **Firebase Configuration Missing**
```bash
Error: Firebase: No Firebase App '[DEFAULT]' has been created
```

**Soluzione**: Verificare `.env.local`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### **Runtime Errors**

#### **Context Provider Missing**
```bash
Error: useAuth must be used within an AuthProvider
```

**Soluzione**: Verificare che i provider siano nel router:
```javascript
<AuthProvider>
  <LeagueProvider>
    <UIProvider>
      {/* componenti */}
    </UIProvider>
  </LeagueProvider>
</AuthProvider>
```

#### **Infinite Re-renders**
```bash
Warning: Maximum update depth exceeded
```

**Soluzione**: 
1. Controllare dipendenze in `useEffect`
2. Usare `useCallback` per functions
3. Evitare oggetti inline in props

### **Authentication Issues**

#### **Google Login Popup Blocked**
**Problema**: Popup bloccato dal browser.

**Soluzione**:
```javascript
// Fallback a redirect se popup fallisce
try {
  result = await signInWithPopup(auth, provider);
} catch (error) {
  if (error.code === 'auth/popup-blocked') {
    await signInWithRedirect(auth, provider);
  }
}
```

#### **User Session Not Persisting**
**Problema**: Utente disconnesso al refresh.

**Soluzione**: Firebase Auth persiste automaticamente, verificare:
```javascript
// AuthContext.jsx - listener deve essere attivo
useEffect(() => {
  const unsubscribe = onAuth(async (firebaseUser) => {
    // gestione stato
  });
  return unsubscribe;
}, []);
```

### **Performance Issues**

#### **Slow Initial Load**
**Problema**: Primo caricamento lento.

**Soluzione**:
- ✅ Lazy loading già implementato
- ✅ Code splitting configurato
- ✅ Verificare bundle analyzer: `npx vite-bundle-analyzer dist`

#### **Memory Leaks**
**Problema**: Memoria che aumenta nel tempo.

**Soluzione**:
```javascript
// Cleanup in useEffect
useEffect(() => {
  const listener = subscribe();
  return () => listener(); // cleanup
}, []);
```

---

## 🔍 Debug Tools

### **Development Health Check**
L'app include health check automatico che mostra:
- ✅ Environment variables
- ✅ Browser compatibility  
- ✅ Firebase configuration
- ✅ Router functionality

```javascript
// Console output
🏥 Application Health Check
Overall Status: ✅ HEALTHY
```

### **React DevTools**
Installare per debugging avanzato:
- [React Developer Tools](https://reactjs.org/link/react-devtools)
- Permette di ispezionare contexts, state, props

### **Network Debugging**
Per problemi Firebase:
1. Aprire Developer Tools → Network
2. Filtro: `firebaseio` o `googleapis`
3. Verificare status codes e headers

### **Console Debugging**
L'app logga informazioni utili:
```javascript
// Auth flow
🔐 Tentativo login Google con popup...
✅ Login Google riuscito con popup

// Health check
🏥 Application Health Check
Overall Status: ✅ HEALTHY

// Navigation
🔄 Preventing potential routing loop to: /dashboard
```

---

## 📋 Checklist di Verifica

### **Prima del Deploy**
- [ ] Health check passa senza errori
- [ ] Tutte le routes accessibili
- [ ] Login/logout funzionante
- [ ] No warning/errori in console
- [ ] Build completa senza errori
- [ ] Environment variables configurate

### **Testing Routes**
```bash
# Verificare tutte le routes principali
http://localhost:5173/dashboard
http://localhost:5173/classifica  
http://localhost:5173/stats
http://localhost:5173/booking
http://localhost:5173/profile
http://localhost:5173/login
```

### **Testing Authentication**
- [ ] Login Google funziona
- [ ] Redirect post-login corretto
- [ ] Protected routes bloccano utenti non autenticati
- [ ] Public routes accessibili senza login
- [ ] Logout funziona correttamente

---

## 🆘 Getting Help

### **Error Logging**
L'app include logging automatico degli errori:
```javascript
// ErrorBoundary cattura errori React
// AuthContext logga errori di autenticazione
// Navigation utils logga problemi di routing
```

### **Support Files**
- `REFACTORING_COMPLETED.md` - Panoramica completa modifiche
- `DEVELOPMENT_GUIDE.md` - Guida sviluppo
- `DEPLOYMENT_GUIDE.md` - Configurazione deployment

### **Common Commands**
```bash
# Reset completo
rm -rf node_modules package-lock.json
npm install

# Restart sviluppo
npm run dev

# Debug build
npm run build
npm run preview
```

---

## ✅ Status Attuale

**Tutti i problemi identificati sono stati risolti**:

✅ **Routing Loop**: Risolto con navigation utilities  
✅ **CORS Warnings**: Gestiti gracefully  
✅ **Performance**: Ottimizzata con lazy loading  
✅ **Error Handling**: Error boundaries attivi  
✅ **Authentication**: Login Google funzionante  

**L'applicazione è ora stabile e production-ready** 🚀
