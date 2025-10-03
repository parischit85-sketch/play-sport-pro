# 🛡️ SENTRY INTEGRATION GUIDE

## 📋 Overview

Sentry è ora integrato in PlaySport per fornire **error tracking e performance monitoring avanzato** in produzione.

### ✨ **Features Implementate:**

- ✅ **Error Tracking**: Cattura errori automaticamente
- ✅ **Performance Monitoring**: Web Vitals e timing
- ✅ **Firebase Error Tracking**: Errori specifici Firebase
- ✅ **User Context**: Tracking utenti autenticati
- ✅ **Router Integration**: Tracking navigazione React Router
- ✅ **Development/Production**: Configurazione dinamica

---

## 🚀 Setup Sentry Project

### 1. **Crea Account Sentry**
1. Vai su [sentry.io](https://sentry.io)
2. Crea account gratuito
3. Crea nuovo progetto per **React**

### 2. **Ottieni DSN**
1. Nel tuo progetto Sentry → **Settings** → **Projects** → **[project-name]** → **Client Keys (DSN)**
2. Copia il **DSN** (formato: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)

### 3. **Configura Environment Variables**

Aggiungi al tuo `.env.local`:
```env
# Sentry Configuration
VITE_SENTRY_DSN=https://your-dsn@your-org.ingest.sentry.io/your-project-id
VITE_APP_VERSION=1.0.0
```

---

## 🔧 Configurazione Avanzata

### **Performance Sample Rate**
```javascript
// src/lib/sentry.js
tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in prod, 100% in dev
```

### **Error Filtering**
Gli errori seguenti sono **automaticamente filtrati**:
- Estensioni browser (`top.GLOBALS`, `ComboSearch`)
- Network errors (`ChunkLoadError`, `NetworkError`)
- Firebase auth expected (`auth/popup-closed-by-user`)

### **Custom Context**
```javascript
import { trackError, trackUserAction } from '@lib/sentry';

// Track custom errors
trackError(new Error('Custom error'), {
  component: 'MyComponent',
  action: 'button_click'
});

// Track user actions
trackUserAction('booking_created', { 
  courtId: 'court-1',
  duration: 60 
});
```

---

## 🔍 Monitoring Features

### **Automatic Tracking**

#### 🔐 **Authentication Events**
- `auth_state_changed`: Cambio stato autenticazione
- `google_login_attempt/success`: Login Google
- `email_login_attempt/success`: Login email
- `admin_login_attempt/success`: Login admin

#### 🚨 **Firebase Errors**
- **Auth errors**: `auth/user-not-found`, `auth/popup-blocked`
- **Firestore errors**: Permission denied, network errors
- **Custom context**: Operation type, user info

#### 📱 **User Context**
Automaticamente traccia:
```javascript
{
  id: user.uid,
  email: user.email,
  username: user.displayName
}
```

### **Performance Monitoring**

#### 📊 **Web Vitals**
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)  
- **CLS** (Cumulative Layout Shift)

#### 🔄 **Route Changes**
- Automatic route tracking con React Router v7
- Performance timing per route
- Navigation patterns

---

## 🎯 Production Configuration

### **Release Tracking**
```javascript
// Automatically configured
release: `playsport@${import.meta.env.VITE_APP_VERSION}`
```

### **Environment Detection**
```javascript
environment: import.meta.env.MODE // 'development' | 'production'
```

### **Performance Sampling**
- **Development**: 100% delle transazioni
- **Production**: 10% delle transazioni (configurabile)

---

## 📊 Dashboard Sentry

### **Error Monitoring**
1. **Issues** → Vedi errori raggruppati
2. **Performance** → Analizza performance
3. **Releases** → Track deployment
4. **Alerts** → Configura notifiche

### **Metriche Chiave**
- **Error Rate**: Percentuale errori
- **User Impact**: Utenti affetti da errori
- **Performance Score**: Web Vitals
- **Crash Free Rate**: % sessioni senza crash

---

## 🚨 Alert Configuration

### **Raccomandazioni Alert**
1. **Error Rate** > 5%
2. **New Issues**: Errori mai visti prima
3. **Performance Degradation**: P75 > 2 secondi
4. **High Volume Errors**: > 100 errori/ora

### **Slack/Email Integration**
1. Sentry → **Settings** → **Integrations**
2. Configura Slack webhook
3. Set alert rules per notifiche immediate

---

## 🔧 Custom Error Boundaries

### **Enhanced Error Boundary**
Il nostro `ErrorBoundary.jsx` è ora integrato con Sentry:

```jsx
// Automatic Sentry tracking in componentDidCatch
trackError(error, {
  errorInfo,
  component: 'ErrorBoundary',
  componentStack: errorInfo.componentStack,
  errorBoundary: true
});
```

### **Firebase Error Tracking**
```javascript
// Automatically tracks Firebase errors
export const loginWithGoogle = async () => {
  try {
    // ... login logic
  } catch (error) {
    trackFirebaseError(error, 'google_login_popup', { 
      errorCode: error.code, 
      errorMessage: error.message 
    });
    throw error;
  }
};
```

---

## 🐛 Testing Sentry Integration

### **Test Error Tracking**
```javascript
// In browser console
throw new Error('Test Sentry integration');
```

### **Test Performance**
```javascript
// Create performance transaction
import { trackPerformance } from '@lib/sentry';

trackPerformance('custom_operation', 1500, {
  operation_type: 'data_load',
  items_count: 100
});
```

### **Test User Context**
1. Login con un utente
2. Verifica in Sentry → **Issues** → **User Context**

---

## 📈 ROI & Benefits

### **Before Sentry**
- ❌ Errori scoperti solo da utenti
- ❌ Nessun insight su performance
- ❌ Debug difficile in produzione
- ❌ Nessun tracking degli utenti affetti

### **After Sentry**  
- ✅ **Error Detection**: Errori rilevati automaticamente
- ✅ **Performance Insights**: Web Vitals monitoring
- ✅ **User Context**: Chi è affetto da errori
- ✅ **Release Tracking**: Errori per deployment
- ✅ **Proactive Fixes**: Alert immediate su problemi

---

## 🎯 Next Steps

### **Immediate (Completato)**
- ✅ Basic Sentry integration
- ✅ Error tracking setup
- ✅ Firebase error tracking
- ✅ User context tracking

### **Short Term**
- 🔄 Configure production alerts
- 🔄 Set up Slack notifications
- 🔄 Create custom dashboards
- 🔄 Performance budgets

### **Long Term**
- 📊 User feedback integration
- 🎯 A/B testing integration
- 📱 Mobile error tracking (Capacitor)
- 🔄 Auto-deployment error monitoring

---

## 📚 Resources

- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Error Tracking Best Practices](https://docs.sentry.io/product/issues/)
- [Alert Configuration](https://docs.sentry.io/product/alerts/)

---

**🎉 Sentry Integration Complete!** 

L'error tracking è ora attivo e monitorerà automaticamente la salute dell'applicazione in produzione.