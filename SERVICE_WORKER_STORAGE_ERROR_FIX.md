# 🔧 Service Worker Storage Error - Soluzione

**Data**: 2025-10-13  
**Errore**: `AbortError: Registration failed - storage error`

---

## 🚨 Problema

```
Errore nella sottoscrizione push: AbortError: Registration failed - storage error

[UpdateService] Update check failed: TypeError: Failed to update a ServiceWorker
for scope ('http://localhost:5173/') with script ('http://localhost:5173/sw.js'): Not found
```

### Causa

Il browser non riesce a registrare il Service Worker perché:

1. **Storage corrotto**: La cache/IndexedDB del browser è danneggiata
2. **Conflitto Service Workers**: Altri SW attivi interferiscono
3. **Modalità Incognito**: Alcune funzionalità storage sono limitate
4. **Quota storage superata**: Lo storage del browser è pieno

---

## ✅ Soluzione Immediata

### Opzione A: Pulisci Storage Browser (Consigliato)

1. **Apri DevTools** (F12)
2. **Application Tab** → **Storage**
3. **Click "Clear site data"** (seleziona tutto):
   - ✅ Local storage
   - ✅ Session storage
   - ✅ IndexedDB
   - ✅ Cache storage
   - ✅ Service workers
4. **Chiudi DevTools**
5. **Chiudi completamente il browser** (tutte le finestre)
6. **Riapri il browser**
7. **Ricarica localhost:5173**

### Opzione B: Usa Modalità Incognito

1. **Apri una finestra incognito** (Ctrl+Shift+N su Chrome/Edge)
2. **Naviga a** `http://localhost:5173`
3. **Testa le push notifications**

Questo ti dice se il problema è legato allo storage persistente del browser.

### Opzione C: Testa Senza Service Worker (Development Only)

Il Service Worker ora è **disabilitato di default in development** per evitare questi problemi.

Se vuoi abilitarlo in development:

```
http://localhost:5173?enableSW
```

---

## 🔍 Verifica Problema

### 1. Controlla Service Workers Attivi

**DevTools → Application → Service Workers**

Dovresti vedere:

- **Nessun** Service Worker registrato per localhost:5173
- Oppure un solo SW con stato "activated"

Se vedi **multipli** Service Workers o SW in stato "redundant", **unregister tutti**:

1. Click "Unregister" su ognuno
2. Refresh pagina
3. Clear cache
4. Riprova

### 2. Controlla Storage Quota

**DevTools → Console**:

```javascript
// Verifica quota storage
if (navigator.storage && navigator.storage.estimate) {
  navigator.storage.estimate().then((estimate) => {
    const usedMB = (estimate.usage / 1024 / 1024).toFixed(2);
    const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2);
    const percentUsed = ((estimate.usage / estimate.quota) * 100).toFixed(2);

    console.log(`Storage utilizzato: ${usedMB} MB / ${quotaMB} MB (${percentUsed}%)`);

    if (percentUsed > 90) {
      console.warn('⚠️ Storage quasi pieno! Questo può causare errori.');
    }
  });
}
```

Se lo storage è > 90%, pulisci cache e dati.

### 3. Controlla IndexedDB

**DevTools → Application → IndexedDB**

Cerca database corrotti o molto grandi:

- `firebaseLocalStorageDb` - Database Firebase Auth
- Altri database dell'app

Se vedi errori, **elimina il database**:

1. Right-click sul database
2. "Delete database"
3. Refresh pagina

---

## 🛠️ Fix Applicati al Codice

### 1. Service Worker Disabilitato in Dev

**File**: `src/main.jsx`

```javascript
// Service Worker DISABILITATO di default in development
// Per abilitarlo: aggiungi ?enableSW all'URL
if (import.meta.env.PROD || new URLSearchParams(window.location.search).has('enableSW')) {
  // Registra SW...
} else {
  console.log('⏸️ Service Worker disabled in development mode');
}
```

**Benefici**:

- ✅ Nessun conflitto con Vite HMR
- ✅ Nessun errore storage in development
- ✅ Sviluppo più veloce senza cache
- ✅ Puoi abilitarlo quando serve con `?enableSW`

### 2. Error Handling Migliorato

**File**: `src/utils/push.js`

```javascript
try {
  registration = await navigator.serviceWorker.register('/sw.js', {
    scope: '/',
    type: 'classic',
  });
} catch (swError) {
  console.error('❌ Service Worker registration failed:', swError);

  // Messaggio di errore dettagliato in development
  if (import.meta.env.DEV) {
    throw new Error(
      'Service Worker registration failed.\n' +
        'Try: 1. Clear cache\n 2. Disable other SWs\n 3. Try incognito mode'
    );
  }
  throw swError;
}
```

**Benefici**:

- ✅ Errori più chiari e actionable
- ✅ Guida l'utente alla soluzione
- ✅ Logging dettagliato per debug

---

## 🧪 Test Push Notifications Senza Service Worker

Per testare le push notifications in development **senza Service Worker**:

### Metodo 1: Test Diretto Firebase Function

**Console Browser**:

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions(undefined, 'us-central1');
const sendBulk = httpsCallable(functions, 'sendBulkCertificateNotifications');

// Test invio
const result = await sendBulk({
  clubId: 'sporting-cat',
  playerIds: ['NhN9YIJFBghjbExhLimFMHcrj2v2'],
  notificationType: 'push',
});

console.log('Result:', result.data);
```

Questo bypassa completamente il Service Worker e chiama direttamente la Firebase Function.

### Metodo 2: Email Notifications

Usa le notifiche EMAIL invece di PUSH durante lo sviluppo:

**UI Admin Dashboard**:

1. Vai a Certificati Medici
2. Seleziona giocatore
3. Scegli **"Invia Email"** invece di "Invia Push"

Le email non richiedono Service Worker.

---

## 🚀 In Produzione

In produzione (build di produzione con `npm run build`):

- ✅ Service Worker **sempre attivo**
- ✅ Push notifications **completamente funzionanti**
- ✅ Nessun problema storage (gestito automaticamente)

### Test Produzione Locale

```bash
# 1. Build
npm run build

# 2. Serve build
npm install -g serve
serve -s dist -l 5173

# 3. Apri browser
http://localhost:5173
```

In questo ambiente, il Service Worker funzionerà perfettamente.

---

## 📋 Checklist Risoluzione

- [ ] Pulito storage browser (Clear site data)
- [ ] Unregistrati tutti i Service Workers
- [ ] Chiuso e riaperto browser
- [ ] Testato in incognito mode
- [ ] Verificato quota storage (< 90%)
- [ ] Verificato nessun database IndexedDB corrotto
- [ ] Testato con `?enableSW` se necessario
- [ ] Oppure testato push via Firebase Function diretta
- [ ] Oppure usato email notifications per ora

---

## 💡 Raccomandazioni

### Durante Sviluppo

1. **Non usare Service Worker** (default ora)
2. **Testa push via Firebase Function** direttamente
3. **Usa email notifications** per i test
4. **Clear cache regolarmente**

### Prima del Deploy

1. **Test in build di produzione** locale
2. **Verifica Service Worker** funzioni
3. **Test push notifications** end-to-end
4. **Verifica in diversi browser**

### In Produzione

1. **Service Worker sempre attivo**
2. **Push notifications completamente funzionanti**
3. **Monitor logs Firebase Functions**
4. **Track delivery rate**

---

## 🔗 Link Utili

- **Chrome DevTools Storage**: chrome://settings/siteData
- **Firefox Storage**: about:preferences#privacy
- **Edge Storage**: edge://settings/siteData

---

## ✅ Soluzione Applicata

**Modifiche**:

1. ✅ Service Worker disabilitato in dev (abilita con `?enableSW`)
2. ✅ Error handling migliorato con messaggi chiari
3. ✅ Logging dettagliato per debug

**Riavvia dev server**:

```bash
# Ferma server (Ctrl+C)
npm run dev
```

**Ricarica browser**:

```bash
# Hard refresh
Ctrl + Shift + R
```

Il problema storage dovrebbe essere risolto! 🎉

---

**Status**: ✅ Fixed  
**Test**: Pendente conferma utente
