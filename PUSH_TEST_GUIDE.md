# 🧪 Test Push Notifications - Guida Rapida

## ✅ Setup Completato

- ✅ Hook `usePushNotifications.js` modificato
- ✅ Funzione `sendSubscriptionToServer()` implementata
- ✅ Funzione `removeSubscriptionFromServer()` implementata
- ✅ Componente `PushTestPanel.jsx` creato
- ✅ Build completato senza errori

---

## 🔬 Come Testare

### Metodo 1: Usando PushTestPanel (Più Semplice)

1. **Aggiungi il componente in una pagina esistente**
   
   Apri un file qualsiasi (es: `src/App.jsx` o `src/features/admin/AdminDashboard.jsx`)
   
   Aggiungi:
   ```jsx
   import PushTestPanel from './components/PushTestPanel'; // o path corretto
   
   // Dentro il render, aggiungi:
   <PushTestPanel />
   ```

2. **Avvia il dev server**
   ```bash
   npm run dev
   ```

3. **Fai login nell'app**

4. **Apri DevTools Console** (F12)

5. **Naviga alla pagina dove hai messo PushTestPanel**
   
   Dovresti vedere un pannello blu con:
   - Status attuale
   - Button "Attiva Push Notifications"
   - Checklist test

6. **Click su "Attiva Push Notifications"**

7. **Concedi permesso nel browser** quando richiesto

8. **Verifica nella console**:
   ```
   🚀 [TEST] Starting push notification test...
   📊 [TEST] Current permission: default
   ✅ Push notification permission granted
   ✅ Push subscription created
   📤 Sending subscription to server...
   ✅ Subscription saved successfully
   📊 [TEST] Request result: true
   ```

9. **Verifica in Firestore**:
   - Apri [Firebase Console](https://console.firebase.google.com)
   - Seleziona il tuo progetto
   - Vai su Firestore Database
   - Cerca collection `pushSubscriptions`
   - Dovresti vedere un nuovo documento con:
     - `userId`: il tuo user ID
     - `endpoint`: URL della subscription
     - `keys`: { p256dh, auth }
     - `deviceId`: device_...
     - `createdAt`: timestamp

10. **Test notifica locale**:
    - Click "Invia Test Notification"
    - Dovresti ricevere una notifica sul browser!

---

### Metodo 2: Usando NotificationSettings (Già Esistente)

Se il componente `NotificationSettings` è già visibile da qualche parte nell'app:

1. **Trovalo nell'UI** (probabilmente in Settings o Profilo)

2. **Click "Attiva Notifiche"**

3. **Verifica console** - dovrebbe loggare tutto come sopra

4. **Verifica Firestore** - stessa procedura

---

## 🔍 Debug: Cosa Controllare

### ✅ Checklist Successo

- [ ] Console mostra `✅ Push notification permission granted`
- [ ] Console mostra `✅ Push subscription created`
- [ ] Console mostra `📤 Sending subscription to server...`
- [ ] Console mostra `✅ Subscription saved successfully`
- [ ] Firestore ha nuovo documento in `pushSubscriptions`
- [ ] Documento ha tutti i campi: userId, endpoint, keys, deviceId, createdAt

### ❌ Se Qualcosa Non Funziona

**Errore: "User not authenticated"**
- Devi essere loggato nell'app
- Il componente usa `getAuth().currentUser`
- Soluzione: Fai login prima di testare

**Errore: "HTTP 404" o "Function not found"**
- La Netlify Function `save-push-subscription` non è deployata
- Verifica che esista: `netlify/functions/save-push-subscription.js`
- Potrebbe servire deploy su Netlify

**Errore: "VAPID key invalid"**
- Le chiavi VAPID non sono configurate correttamente
- Verifica `.env` o environment variables
- Genera nuove chiavi: `npx web-push generate-vapid-keys`

**Nessun documento in Firestore**
- Verifica logs console per errori
- Controlla che la fetch non restituisca errore
- Verifica Firestore rules permettano write su pushSubscriptions

---

## 📊 Output Atteso

### Console Logs (Successo)

```
🚀 [TEST] Starting push notification test...
📊 [TEST] Current permission: default
✅ Push notification permission granted
✅ Push subscription created
📤 Sending subscription to server...
  userId: "abc123..."
  endpoint: "https://fcm.googleapis.com/fcm/send/..."
  deviceId: "device_1699..."
✅ Subscription saved successfully: { success: true, id: "..." }
📊 [TEST] Request result: true
📊 [TEST] Check Firestore Console → pushSubscriptions
📊 [TEST] Should see new subscription with your userId
```

### Firestore Document

```json
{
  "userId": "abc123...",
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "BH...",
    "auth": "xY..."
  },
  "deviceId": "device_1699...",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2025-11-11T14:30:00.000Z",
  "expirationTime": null,
  "isActive": true
}
```

---

## 🚀 Prossimi Step Dopo Test

Se il test ha successo:

1. ✅ **FASE 1 CONFERMATA** - Subscription salvata correttamente
2. ➡️ **FASE 2** - Integrare AdminPushPanel nel menu admin
3. ➡️ **FASE 3** - Test invio push dal backend
4. ➡️ **FASE 4** - Analytics e monitoring

---

## 💡 Tips

- **Browser supportati**: Chrome, Edge, Firefox (NO Safari iOS)
- **HTTPS richiesto**: Le push notifications funzionano solo su HTTPS (localhost ok)
- **Service Worker**: Deve essere registrato (vite lo fa automaticamente)
- **Permissions**: L'utente può bloccare le notifiche - in quel caso devi istruirlo a sbloccarle dalle impostazioni browser

---

## 🆘 Troubleshooting Rapido

| Problema | Soluzione |
|----------|-----------|
| "Not supported" | Browser non supporta push (usa Chrome/Firefox) |
| "Permission denied" | Utente ha bloccato - vai in settings browser |
| "401 Unauthorized" | Non sei loggato - fai login prima |
| "404 Function not found" | Netlify function non deployata |
| "VAPID error" | Chiavi VAPID non configurate in .env |
| Nulla in Firestore | Check console per errori, verifica Firestore rules |

---

**Pronto per testare! 🧪**

Fammi sapere cosa vedi nella console e in Firestore.
