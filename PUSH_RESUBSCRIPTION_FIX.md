# 🔧 Fix Re-Subscription Push Notifications (Paris Andrea)

**Data:** 19 Novembre 2025  
**Problema:** Push notifications non funzionano più dopo cancellazione cookie/dati browser

---

## 🔍 Causa del Problema

Quando un utente **cancella i dati di navigazione + cookie**:

1. **Service Worker subscription** → Eliminata dal browser
2. **Vecchia subscription Firestore** → Rimane attiva ma con endpoint invalido
3. **Nuovo tentativo subscription** → Potrebbe fallire o creare duplicato

Il backend legge la **vecchia subscription** (morta) invece della nuova.

---

## ✅ Soluzione Immediata (da fare per Paris Andrea)

### Opzione 1: Pulizia Manuale Firestore (CONSIGLIATA)

1. **Apri Firebase Console** → https://console.firebase.google.com
2. **Firestore Database** → Collection `pushSubscriptions`
3. **Filtra per userId** → Cerca `mwLUarfeMkQqKMmDZ1qPPMyN7mZ2` (Paris Andrea)
4. **Elimina TUTTI i documenti** trovati per questo userId
5. **Paris Andrea fa logout** → Poi login di nuovo
6. **Il sistema re-sottoscriverà automaticamente** con endpoint fresco

### Opzione 2: Script Console (più veloce)

Apri la **console del browser** (F12) sulla pagina dell'app e incolla:

```javascript
// 1. Forza disattivazione della vecchia subscription
if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.ready.then(async (registration) => {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      console.log('🗑️ Removing old subscription:', subscription.endpoint.substring(0, 50));
      await subscription.unsubscribe();
      console.log('✅ Old subscription removed');
    }

    // 2. Forza ricaricamento pagina per ri-triggerare AutoPushSubscription
    setTimeout(() => {
      console.log('🔄 Reloading page to re-subscribe...');
      window.location.reload();
    }, 2000);
  });
}
```

### Opzione 3: Hard Reset Completo

1. **Logout** dall'app
2. **Apri Impostazioni Browser** → Privacy e Sicurezza
3. **Cancella dati sito specifico** → `https://play-sport.netlify.app` (o dominio custom)
4. **Chiudi completamente il browser** (non solo tab)
5. **Riapri** e fai **login**
6. **Accetta di nuovo le notifiche** quando richiesto

---

## 🧹 Pulizia Automatica Vecchie Subscriptions (Fix Permanente)

Aggiungi questa logica al backend per **eliminare subscriptions morte** prima di inviare:

### File: `functions/sendBulkNotifications.clean.js`

Cerca questa sezione (~linea 450):

```javascript
const subscriptionsSnapshot = await db
  .collection('pushSubscriptions')
  .where('firebaseUid', '==', firebaseUid)
  .get();
```

**Sostituisci** con:

```javascript
const subscriptionsSnapshot = await db
  .collection('pushSubscriptions')
  .where('firebaseUid', '==', firebaseUid)
  .get();

// 🧹 Elimina subscriptions duplicate/vecchie (keep solo la più recente)
if (subscriptionsSnapshot.size > 1) {
  console.log(
    `⚠️ Found ${subscriptionsSnapshot.size} subscriptions for ${firebaseUid}, cleaning...`
  );

  const subs = subscriptionsSnapshot.docs
    .map((doc) => ({ id: doc.id, data: doc.data(), ref: doc.ref }))
    .sort((a, b) => {
      const dateA = new Date(a.data.createdAt || a.data.updatedAt || 0);
      const dateB = new Date(b.data.createdAt || b.data.updatedAt || 0);
      return dateB - dateA; // Più recente prima
    });

  // Keep solo la prima (più recente), elimina le altre
  const toDelete = subs.slice(1);
  for (const sub of toDelete) {
    console.log(`🗑️ Deleting old subscription: ${sub.id}`);
    await sub.ref.delete();
  }

  console.log(`✅ Kept newest subscription: ${subs[0].id}`);
}
```

---

## 🔬 Verifica che Funzioni

Dopo aver applicato la soluzione:

1. **Controlla Firestore** → `pushSubscriptions` deve avere 1 solo documento per Paris Andrea
2. **Console Browser** (F12) → Cerca log: `✅ [DEV] Push subscription saved/updated`
3. **Invia notifica di test** → Usa Admin Panel "Invia Notifica Push"
4. **Verifica arrivo** → Notifica deve apparire in browser

---

## 📊 Log Debugging Console Browser

Se ancora non funziona, controlla questi log:

```javascript
// In console browser, controlla stato subscription
navigator.serviceWorker.ready.then(async (registration) => {
  const sub = await registration.pushManager.getSubscription();
  console.log('Current subscription:', {
    exists: !!sub,
    endpoint: sub?.endpoint.substring(0, 100),
    expirationTime: sub?.expirationTime,
  });
});

// Controlla permessi
console.log('Notification permission:', Notification.permission);

// Forza re-subscription manuale (per test)
// (vedi Opzione 2 sopra)
```

---

## 🚨 Prevenzione Futura

### Backend: Timeout sulle Subscriptions

Aggiungi campo `lastUsedAt` e cancella automaticamente subscriptions inattive > 30 giorni:

```javascript
// Scheduled function (cron giornaliero)
exports.cleanOldPushSubscriptions = functions.pubsub.schedule('every 24 hours').onRun(async () => {
  const db = admin.firestore();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const oldSubs = await db
    .collection('pushSubscriptions')
    .where('lastUsedAt', '<', thirtyDaysAgo.toISOString())
    .get();

  const batch = db.batch();
  oldSubs.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  console.log(`🧹 Deleted ${oldSubs.size} old push subscriptions`);
});
```

### Frontend: Controllo Healthcheck

Aggiungi verifica periodica subscription valida:

```javascript
// In AutoPushSubscription.jsx
useEffect(() => {
  if (!user || !subscription) return;

  // Ogni 24h, verifica che la subscription sia ancora attiva
  const interval = setInterval(
    async () => {
      const isValid = await subscription.getKey('p256dh'); // Test validità
      if (!isValid) {
        console.warn('⚠️ Subscription expired, re-subscribing...');
        await subscribeToPush(); // Re-subscribe automatico
      }
    },
    24 * 60 * 60 * 1000
  );

  return () => clearInterval(interval);
}, [user, subscription]);
```

---

## ✅ Checklist Finale

Per Paris Andrea:

- [ ] Firestore: Elimina vecchie subscriptions per userId `mwLUarfeMkQqKMmDZ1qPPMyN7mZ2`
- [ ] Browser: Logout → Login
- [ ] Browser: Accetta notifiche di nuovo se richiesto
- [ ] Console: Verifica log `✅ [DEV] Push subscription saved/updated`
- [ ] Firestore: Verifica 1 solo documento in `pushSubscriptions` con `firebaseUid` valorizzato
- [ ] Test: Invia notifica push di prova
- [ ] Verifica: Notifica ricevuta in browser

**Stima tempo:** 5-10 minuti per fix immediato.

---

**Note:** Questo fix è documentato per evitare problemi simili in futuro. Considera implementare la pulizia automatica backend (Opzione 3 - Prevenzione Futura).
