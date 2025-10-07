# 🔔 Sistema di Notifiche Push - Implementazione Completa

## 📋 Panoramica

Sistema completo di notifiche push Web Push API che permette di inviare notifiche che:
- ✅ Appaiono nel pannello notifiche del sistema operativo
- ✅ Aprono l'app quando vengono cliccate
- ✅ Funzionano anche quando l'app è chiusa
- ✅ Sono completamente native (senza Firebase Cloud Messaging)

## 🏗️ Architettura

### Client-Side
1. **`src/utils/push.js`** - Servizio principale per gestire le sottoscrizioni push
2. **`src/components/debug/PushNotificationPanel.jsx`** - UI per attivare/testare le notifiche
3. **`public/sw.js`** - Service Worker (già esistente) gestisce push e click

### Server-Side (Netlify Functions)
1. **`netlify/functions/send-push.js`** - Invia notifiche push agli utenti
2. **`netlify/functions/save-push-subscription.js`** - Salva sottoscrizioni su Firestore
3. **`netlify/functions/remove-push-subscription.js`** - Rimuove sottoscrizioni

### Database (Firestore)
- Collection: `pushSubscriptions`
  - `userId`: ID dell'utente
  - `subscription`: Oggetto sottoscrizione Web Push
  - `endpoint`: URL endpoint univoco
  - `timestamp`: Data creazione
  - `createdAt/updatedAt`: Timestamp aggiornamento

## 🚀 Setup e Configurazione

### 1. Installa le dipendenze necessarie

```powershell
npm install web-push
```

### 2. Genera le chiavi VAPID

Le chiavi VAPID sono necessarie per identificare il tuo server presso i provider push.

```powershell
npx web-push generate-vapid-keys
```

Questo comando genererà:
```
=======================================

Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nqm-sI

Private Key:
p6YRSPCTqr0h6Yp6SOME_PRIVATE_KEY_HERE

=======================================
```

### 3. Configura le variabili d'ambiente su Netlify

Vai su Netlify Dashboard → Site settings → Environment variables e aggiungi:

```
VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nqm-sI
VAPID_PRIVATE_KEY=p6YRSPCTqr0h6Yp6SOME_PRIVATE_KEY_HERE
```

**IMPORTANTE**: Le chiavi nel codice sono placeholder! Devi sostituirle con quelle vere.

### 4. Aggiorna la chiave pubblica nel client

Modifica `src/utils/push.js`:

```javascript
// Sostituisci con la tua VAPID public key generata
const VAPID_PUBLIC_KEY = 'LA_TUA_PUBLIC_KEY_QUI';
```

### 5. Configura Firebase Admin nelle Functions

Le functions usano già le variabili d'ambiente Firebase esistenti:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Assicurati che siano configurate su Netlify.

### 6. Aggiorna l'email di contatto

In `netlify/functions/send-push.js`, sostituisci:

```javascript
webpush.setVapidDetails(
  'mailto:your-email@example.com', // ← Metti la tua email qui
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);
```

## 🎯 Come Funziona

### Flusso Utente

1. **Attivazione**
   - L'utente visita il proprio profilo
   - Clicca su "Attiva Notifiche" nel pannello push
   - Il browser chiede il permesso per le notifiche
   - Una volta concesso, viene creata una sottoscrizione push

2. **Sottoscrizione**
   - Il client registra il service worker (`/sw.js`)
   - Crea una sottoscrizione con il PushManager
   - Invia la sottoscrizione a `save-push-subscription`
   - La function salva i dati su Firestore

3. **Invio Notifica**
   - Un evento trigger (es. aggiunta a prenotazione) chiama `send-push`
   - La function recupera tutte le sottoscrizioni dell'utente da Firestore
   - Usa `web-push` per inviare la notifica ai browser dell'utente
   - Rimuove automaticamente le sottoscrizioni non valide

4. **Ricezione**
   - Il service worker riceve l'evento `push`
   - Mostra la notifica nel pannello del sistema
   - L'utente clicca sulla notifica
   - Il service worker apre/porta in focus l'app all'URL specificato

### Flusso Tecnico

```
┌─────────────┐         ┌──────────────────┐         ┌────────────────┐
│   Client    │         │ Netlify Functions│         │   Firestore    │
│  (Browser)  │         │                  │         │                │
└─────┬───────┘         └────────┬─────────┘         └────────┬───────┘
      │                          │                            │
      │ 1. subscribeToPush()     │                            │
      ├─────────────────────────>│                            │
      │                          │ 2. Save subscription       │
      │                          ├───────────────────────────>│
      │                          │                            │
      │                          │ 3. When booking event      │
      │                          │<───────────────────────────│
      │ 4. Send push             │                            │
      │<─────────────────────────┤                            │
      │                          │                            │
      │ 5. SW shows notification │                            │
      │                          │                            │
      │ 6. User clicks           │                            │
      │ 7. SW opens app          │                            │
```

## 📱 Utilizzo nel Codice

### Attivare le notifiche per un utente

```javascript
import { subscribeToPush } from '@/utils/push';

const handleEnableNotifications = async () => {
  const subscription = await subscribeToPush(userId);
  if (subscription) {
    console.log('Notifiche attivate!');
  }
};
```

### Inviare una notifica quando un utente viene aggiunto a una prenotazione

```javascript
import { sendBookingAdditionPush } from '@/utils/notify';

// Quando aggiungi un utente a una prenotazione
await sendBookingAdditionPush({
  userId: 'user-id-123',
  court: 'Campo 1',
  time: '18:00',
  club: 'Tennis Club Roma',
  date: '2025-10-07',
  bookingId: 'booking-xyz'
});
```

### Inviare una notifica personalizzata

```javascript
const response = await fetch('/.netlify/functions/send-push', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-id-123',
    notification: {
      title: 'Nuovo Messaggio',
      body: 'Hai ricevuto un nuovo messaggio!',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'message-123',
      requireInteraction: false,
      data: {
        url: '/messages/123',
        type: 'message',
        timestamp: Date.now()
      }
    }
  })
});
```

## 🎨 UI Components

### PushNotificationPanel

Componente React per gestire le notifiche push nel profilo utente:

```jsx
<PushNotificationPanel />
```

Funzionalità:
- ✅ Mostra stato permessi notifiche
- ✅ Badge indicatore sottoscrizione
- ✅ Pulsante attiva/disattiva notifiche
- ✅ Pulsante test notifica
- ✅ Gestione errori e stati di caricamento
- ✅ Supporto dark mode

## 🔧 Service Worker

Il service worker (`public/sw.js`) gestisce due eventi principali:

### Event: `push`

```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data
  });
});
```

### Event: `notificationclick`

```javascript
self.addEventListener('notificationclick', (event) => {
  const url = event.notification.data.url || '/';
  // Apre o porta in focus la finestra dell'app
  clients.openWindow(url);
});
```

## 🔒 Sicurezza

1. **VAPID Keys**: Le chiavi private NON devono mai essere esposte al client
2. **HTTPS**: Le notifiche push funzionano SOLO su HTTPS (o localhost)
3. **Permessi**: L'utente deve esplicitamente concedere il permesso
4. **Validazione**: Le sottoscrizioni scadute vengono automaticamente rimosse

## 📊 Monitoraggio

### Controllare le sottoscrizioni attive

```javascript
import { isPushSubscribed, getPushNotificationStatus } from '@/utils/push';

const isSubscribed = await isPushSubscribed();
const status = getPushNotificationStatus(); // 'granted', 'denied', 'default', 'unsupported'
```

### Query Firestore

```javascript
// Tutte le sottoscrizioni di un utente
const subscriptions = await db
  .collection('pushSubscriptions')
  .where('userId', '==', userId)
  .get();

// Statistiche
const totalSubscriptions = await db
  .collection('pushSubscriptions')
  .count()
  .get();
```

## 🐛 Troubleshooting

### Le notifiche non arrivano

1. Verifica che HTTPS sia attivo
2. Controlla che le VAPID keys siano configurate correttamente
3. Verifica il permesso notifiche nel browser (chrome://settings/content/notifications)
4. Controlla la console per errori del service worker
5. Verifica che la sottoscrizione sia salvata su Firestore

### Il service worker non si registra

1. Controlla che `/sw.js` sia accessibile
2. Verifica che non ci siano errori di sintassi in `sw.js`
3. Controlla la console → Application → Service Workers
4. Prova a unregister e re-register manualmente

### La notifica non apre l'app

1. Verifica che `data.url` sia impostato correttamente
2. Controlla l'evento `notificationclick` in `sw.js`
3. Verifica i permessi finestre popup del browser

## 🚀 Deploy

1. **Commit dei file**
   ```powershell
   git add .
   git commit -m "feat: add Web Push notification system"
   git push origin main
   ```

2. **Configura Netlify**
   - Vai su Netlify Dashboard
   - Aggiungi le variabili d'ambiente VAPID
   - Il deploy partirà automaticamente

3. **Test in produzione**
   - Visita il tuo profilo
   - Attiva le notifiche
   - Invia una notifica di test
   - Verifica che arrivi nel pannello notifiche

## 📝 TODO e Miglioramenti Futuri

- [ ] Generare automaticamente le VAPID keys al primo deploy
- [ ] Aggiungere notifiche per altri eventi (messaggi, conferme, etc.)
- [ ] Dashboard admin per inviare notifiche broadcast
- [ ] Personalizzazione suoni notifiche
- [ ] Raggruppamento notifiche simili
- [ ] Statistiche di delivery e click-through
- [ ] Support per iOS (attualmente limitato)

## 🌐 Browser Support

- ✅ Chrome/Edge (Desktop & Android)
- ✅ Firefox (Desktop & Android)
- ✅ Safari (Desktop, limitato su iOS)
- ✅ Opera
- ❌ IE11 (non supportato)

## 📚 Risorse

- [Web Push API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web-push library - npm](https://www.npmjs.com/package/web-push)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)

## ✅ Checklist Implementazione

- [x] Creato `src/utils/push.js` con logica client
- [x] Creato `PushNotificationPanel.jsx` UI component
- [x] Creato Netlify Functions (send, save, remove)
- [x] Aggiunto pannello al Profile
- [x] Esteso `notify.js` con `sendBookingAdditionPush`
- [x] Service Worker già esistente e funzionante
- [ ] Generare VAPID keys reali
- [ ] Configurare variabili d'ambiente su Netlify
- [ ] Aggiornare chiave pubblica in `push.js`
- [ ] Aggiornare email in `send-push.js`
- [ ] Test in ambiente di produzione
- [ ] Integrare con eventi booking reali

---

**Implementato il**: 7 Ottobre 2025  
**Versione**: 1.0.0  
**Stato**: ✅ Codice completo, richiede configurazione VAPID keys
