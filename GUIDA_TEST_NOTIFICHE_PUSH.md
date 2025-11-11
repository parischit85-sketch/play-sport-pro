# 🔔 Guida Rapida: Come Testare le Notifiche Push

## 🚀 Test Immediato (Web Push - Desktop)

### Opzione 1: Pagina Dedicata di Test (NUOVA)

1. **Apri il browser** su http://localhost:5173

2. **Fai login** con il tuo account

3. **Vai alla pagina di test**:
   ```
   http://localhost:5173/test-push
   ```

4. **Segui le istruzioni nella pagina**:
   - Clicca "Iscriviti alle Notifiche"
   - Accetta il permesso del browser
   - Clicca "Invia Notifica di Test"
   - Vedrai la notifica in alto a destra!

### Opzione 2: Console Browser (Manuale)

1. **Apri DevTools** (F12)

2. **Console**, copia e incolla:
   ```javascript
   // Test rapido Web Push
   if ('serviceWorker' in navigator && 'PushManager' in window) {
     navigator.serviceWorker.ready.then(registration => {
       registration.showNotification('Test Notifica', {
         body: 'Questo è un test locale!',
         icon: '/icon.png',
         badge: '/badge.png',
         tag: 'test-notification',
         requireInteraction: false
       });
     });
   }
   ```

3. **Dovresti vedere** la notifica immediatamente!

---

## 📱 Test Completo (Con Pannello Admin)

### 1. Integra il Pannello nella Dashboard

**Opzione A: Admin Dashboard**

File: `src/features/admin/AdminDashboard.jsx`

```jsx
// Aggiungi import
import AdminPushNotificationsPanel from './AdminPushNotificationsPanel.jsx';

// Nel JSX, dopo le StatCards:
<div className="mb-6">
  <AdminPushNotificationsPanel />
</div>
```

**Opzione B: Standalone (già fatto)**

Vai su: http://localhost:5173/test-push

---

## 🎯 Scenari di Test

### Test 1: Web Push (Desktop) ✅ DISPONIBILE ORA

**Requisiti**: Browser desktop (Chrome/Firefox/Edge) + localhost o HTTPS

**Steps**:
1. Apri http://localhost:5173/test-push
2. Clicca "Iscriviti alle Notifiche"
3. Accetta permesso browser
4. Clicca "Invia Notifica di Test"
5. ✅ Verifica che la notifica appare

**Cosa testa**: 
- Service Worker registration
- Push subscription
- VAPID authentication
- Notification display

---

### Test 2: Android FCM ⏳ RICHIEDE APK

**Requisiti**: 
- google-services.json configurato
- APK buildato
- Device fisico Android

**Steps**:
1. **Completa configurazione**:
   ```powershell
   # Verifica config
   node check-android-config.cjs
   
   # Dovrebbe mostrare 7/7 checks passed
   ```

2. **Build APK**:
   ```powershell
   # Deployment automatico
   .\deploy-native-push.ps1
   
   # Oppure manuale:
   npm run build
   npx cap sync android
   npx cap open android
   # Build APK in Android Studio
   ```

3. **Installa APK** su device fisico

4. **Apri app** e vai su `/test-push`

5. **Testa 3 scenari**:
   - ✅ App in foreground (aperta)
   - ✅ App in background (ridotta)
   - ✅ App chiusa completamente

**Cosa testa**:
- FCM token registration
- Token storage in Firestore
- Native notification display
- Click handling
- Deep linking

---

### Test 3: iOS APNs ❌ BLOCCATO

**Blocco**: Richiede Apple Developer Account ($99/anno)

**Quando disponibile**:
1. Acquista Apple Developer Account
2. Genera certificato APNs
3. Configura Firebase per iOS
4. Build iOS app
5. Test su device fisico

---

## 📊 Verifica Risultati

### 1. Check Console Browser

Dovresti vedere:
```
✅ [SW] Service Worker registered
✅ Push subscription successful
✅ Notification displayed
```

### 2. Check Firestore

**Collection**: `pushSubscriptions`

Verifica documento con:
- `userId`: Il tuo ID utente
- `type`: "web" o "native"
- `platform`: "web", "android", o "ios"
- `token` o `endpoint`: Token FCM o endpoint VAPID
- `active`: true
- `createdAt`: Timestamp recente

### 3. Check Statistics

Nella pagina `/test-push`, sezione statistiche:
- **Sent**: Numero notifiche inviate
- **Failed**: Errori (dovrebbe essere 0)
- **Delivery Rate**: Percentuale successo (target >95%)
- **CTR**: Click-through rate

---

## 🐛 Troubleshooting

### Problema: "Permesso negato"
**Soluzione**: 
- Chrome: Settings > Privacy > Site Settings > Notifications
- Rimuovi block per localhost
- Ricarica pagina

### Problema: "Service Worker not registered"
**Soluzione**:
```javascript
// Console browser
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Registered SWs:', registrations);
});

// Se vuoto, ricarica con Ctrl+Shift+R
```

### Problema: "Push not supported"
**Cause possibili**:
- Browser non supportato (es. Safari desktop - richiede APNs)
- HTTP invece di HTTPS (localhost va bene)
- Incognito mode (alcune funzioni limitate)

**Soluzione**: Usa Chrome/Firefox/Edge normale, localhost o HTTPS

### Problema: Notifica non arriva
**Debug**:
1. Check Service Worker console:
   ```javascript
   // DevTools > Application > Service Workers
   // Click "Update" per forzare refresh
   ```

2. Check push subscription:
   ```javascript
   // Console
   navigator.serviceWorker.ready.then(reg => {
     reg.pushManager.getSubscription().then(sub => {
       console.log('Subscription:', sub);
     });
   });
   ```

3. Check Firestore rules:
   - `pushSubscriptions`: Allow read/write per userId
   - `notificationEvents`: Allow write

---

## 📈 Metriche di Successo

### Web Push (Desktop)
- **Subscription Rate**: >80% degli utenti che accettano
- **Delivery Rate**: >85% (già ottenuto)
- **Click Rate**: >15% target

### Native Push (Mobile)
- **Subscription Rate**: >90% (native ha meno friction)
- **Delivery Rate**: >95% target (FCM molto affidabile)
- **Click Rate**: >20% (mobile ha più engagement)

---

## 🎯 Quick Commands

```powershell
# 1. Verifica configurazione Android
node check-android-config.cjs

# 2. Pulisci cache Vite (se errori React)
.\clean-vite-cache.ps1

# 3. Build e deploy
.\deploy-native-push.ps1

# 4. Solo dev server
npm run dev

# 5. Build frontend
npm run build

# 6. Sync Capacitor
npx cap sync android

# 7. Open Android Studio
npx cap open android
```

---

## 📝 Checklist Test Completo

### Pre-Test
- [ ] Dev server running (npm run dev)
- [ ] Browser aperto su localhost:5173
- [ ] Login effettuato
- [ ] Console DevTools aperta

### Web Push Test
- [ ] Navigato su /test-push
- [ ] Cliccato "Iscriviti"
- [ ] Permesso accettato
- [ ] Subscription visibile in Firestore
- [ ] Test notifica inviata
- [ ] Notifica ricevuta
- [ ] Notifica cliccata (verifica deep link)

### Android Test (dopo APK build)
- [ ] APK installato su device
- [ ] App aperta
- [ ] Navigato su /test-push
- [ ] Subscription completata
- [ ] Token FCM salvato in Firestore
- [ ] Test foreground - OK
- [ ] Test background - OK
- [ ] Test app chiusa - OK
- [ ] Click handling - OK

### Firestore Verification
- [ ] pushSubscriptions collection esiste
- [ ] Documento con userId presente
- [ ] type corretto (web/native)
- [ ] platform corretto
- [ ] token/endpoint presente
- [ ] active = true

### Statistics Check
- [ ] Sent count aumenta
- [ ] Failed count = 0
- [ ] Delivery rate >85% (web) o >95% (native)
- [ ] Platform distribution corretta

---

## ✅ Success Criteria

### Minimo (Web Push)
- ✅ Subscription funziona
- ✅ Notifica appare
- ✅ Salvato in Firestore

### Completo (Native Push)
- ✅ Android APK buildato
- ✅ FCM token registrato
- ✅ Notifiche funzionano in tutti gli stati
- ✅ Click handling OK
- ✅ Statistics accurate

### Eccellenza (Full Stack)
- ✅ iOS APNs configurato
- ✅ Cross-platform testing OK
- ✅ Delivery rate >95%
- ✅ CTR >15%
- ✅ Zero errori in produzione

---

**Creato**: 2025-11-08  
**Ultima Modifica**: 2025-11-08  
**Status**: ✅ Pagina test pronta, Web Push funzionante  
**Next**: Configura Android per native push testing
