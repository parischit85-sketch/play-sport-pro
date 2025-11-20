# 🐛 DEBUG PUSH NOTIFICATION - Andrea Paris

## 📋 Dati Subscription Andrea Paris

**Document ID:** `mwLUarfeMkQqKMmDZ1qPPMyN7mZ2_2003227708`

**Campi:**
- `active`: `true` ✅
- `firebaseUid`: `"mwLUarfeMkQqKMmDZ1qPPMyN7mZ2"` ✅
- `deviceId`: `"2003227708"` ✅
- `endpoint`: `"https://fcm.googleapis.com/fcm/send/cla2MvA5tbU:APA91b..."` ✅
- `createdAt`: `"2025-11-18T20:46:25.308Z"` ✅
- `updatedAt`: `"2025-11-18T20:46:25.308Z"` ✅

**Subscription object:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/cla2MvA5tbU:APA91b...",
  "expirationTime": null,
  "keys": {
    "auth": "6qEEJ5PebGUdqKSCCkVVVw",
    "p256dh": "BESxE5GrYqq5nzrRWGWPta0MiPfJ6fLi8IHoMi8HgnDK8Zf6am-Xq9iPSA1bLDRnFlwLs1vIwy3pt9EybVbgq6E"
  }
}
```

## 🔍 Cosa Verifica la Cloud Function

La funzione `sendPushNotificationToUser` in `sendBulkNotifications.clean.js` esegue questa query:

```javascript
const subsSnap = await db
  .collection('pushSubscriptions')
  .where('firebaseUid', '==', 'mwLUarfeMkQqKMmDZ1qPPMyN7mZ2')
  .get();
```

### ✅ Logging Aggiunto

Ho aggiunto logging dettagliato per debuggare esattamente cosa succede:

1. **Inizio funzione** - mostra firebaseUid usato per la query
2. **Query execution** - mostra risultati della query
3. **Document filtering** - verifica campo `active` o `isActive`
4. **Validation** - controlla endpoint, keys, expiresAt

## 🧪 Come Testare

### Metodo 1: Da Firebase Console Admin Panel

1. Vai su **https://play-sport.pro**
2. Login come admin
3. Vai a **Admin > Push Notifications**
4. Cerca "Andrea Paris" o il suo firebaseUid
5. Clicca "Test Push"
6. **Controlla i logs nella Firebase Console**:
   - Vai a: https://console.firebase.google.com/project/m-padelweb/functions/logs
   - Cerca per `[sendPushNotificationToUser]`
   - Verifica i log dettagliati

### Metodo 2: Da Cloud Functions Logs

Vai direttamente ai logs: https://console.firebase.google.com/project/m-padelweb/functions/logs

Filtra per:
- **Function**: `sendBulkCertificateNotifications`
- **Text search**: `mwLUarfeMkQqKMmDZ1qPPMyN7mZ2`

## 🔍 Cosa Cercare nei Logs

### Log 1: Inizio query
```
📱 [sendPushNotificationToUser] Starting...
  clubUserId: "..."
  firebaseUid: "mwLUarfeMkQqKMmDZ1qPPMyN7mZ2"
  queryField: "firebaseUid"
  queryValue: "mwLUarfeMkQqKMmDZ1qPPMyN7mZ2"
```

### Log 2: Risultati query
```
📊 [Push] Query completed:
  totalDocs: 1  <-- DEVE essere >= 1
  isEmpty: false
  firebaseUidQueried: "mwLUarfeMkQqKMmDZ1qPPMyN7mZ2"
```

### Log 3: Documenti trovati
```
📄 [Push] All subscriptions (before filtering):
  - id: "mwLUarfeMkQqKMmDZ1qPPMyN7mZ2_2003227708"
  - firebaseUid: "mwLUarfeMkQqKMmDZ1qPPMyN7mZ2"
  - active: true  <-- DEVE essere true
  - deviceId: "2003227708"
```

### Log 4: Validation check
```
🔍 [Push] Checking doc:
  id: "mwLUarfeMkQqKMmDZ1qPPMyN7mZ2_2003227708"
  activeFieldUsed: true
  isValid: true  <-- DEVE essere true
  validationReason: "OK"
  hasTopLevelEndpoint: true
  hasNestedKeys: true
```

## ❌ Possibili Problemi

### Problema 1: Query non trova documenti
**Log**: `totalDocs: 0`

**Causa**: Campo `firebaseUid` non corrisponde
- Verifica che il documento abbia esattamente `firebaseUid: "mwLUarfeMkQqKMmDZ1qPPMyN7mZ2"`
- Controlla per spazi o caratteri nascosti

**Fix**: Usa la HTTP function che elimina duplicati

### Problema 2: Documento trovato ma non valido
**Log**: `isValid: false`, `validationReason: "not active"`

**Causa**: Campo `active` o `isActive` non è `true`

**Fix**: Il documento ha `active: true` ✅ quindi dovrebbe essere OK

### Problema 3: Documento valido ma mancano keys
**Log**: `hasNestedKeys: false`

**Causa**: Manca l'oggetto `subscription.keys`

**Fix**: Il documento ha le keys ✅ quindi dovrebbe essere OK

## ✅ Subscription Andrea Paris - Status

Basandomi sui dati forniti, la subscription di Andrea Paris dovrebbe funzionare:

- ✅ `firebaseUid` corretto
- ✅ `active: true`
- ✅ `endpoint` presente
- ✅ `subscription.keys` presenti (auth + p256dh)
- ✅ `deviceId` persistente
- ⚠️ Campo `isActive` non presente (usa `active` invece)

### 🔧 Codice Aggiornato

La funzione ora supporta ENTRAMBI i campi:
```javascript
const activeField = data.active !== undefined ? data.active : data.isActive;
const isValid = activeField === true && (!data.expiresAt || data.expiresAt > now);
```

Quindi anche se manca `isActive`, usa `active` ✅

## 🎯 Prossimi Passi

1. **Testa push notification** ad Andrea Paris
2. **Controlla logs** nella Firebase Console
3. **Verifica** che totalDocs >= 1
4. **Verifica** che isValid = true
5. Se ancora non funziona, **copia/incolla i logs** qui per analisi
