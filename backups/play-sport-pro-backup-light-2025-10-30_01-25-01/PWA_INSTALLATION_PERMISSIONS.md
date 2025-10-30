# 📱 PWA Installation & Permissions System

## 🎯 Panoramica

Sistema completo per l'installazione della PWA con gestione intelligente dei permessi (notifiche, posizione, contatti) sia su iOS che Android.

## ✅ Caratteristiche Implementate

### 1. **PWA Install Prompt Automatico**
- ✅ Appare dopo 3 secondi dal primo accesso
- ✅ Non mostra più se già installata
- ✅ Ricorda se saltato (richiede dopo 7 giorni)
- ✅ Design moderno con glassmorphism
- ✅ Supporto dark mode

### 2. **Gestione Permessi Centralizzata**
Permessi richiesti attraverso il hook `usePermissions`:

#### 📢 Notifiche
- **Quando**: Immediatamente dopo installazione
- **Perché**: Ricevere aggiornamenti su prenotazioni, partite, tornei
- **Compatibilità**: iOS (Safari 16.4+), Android, Desktop
- **Features**:
  - Service Worker push notifications
  - Notifica di test al primo consenso
  - Badge e vibrazione

#### 📍 Geolocalizzazione
- **Quando**: Immediatamente dopo installazione
- **Perché**: Trovare campi vicini, check-in automatico
- **Compatibilità**: Tutti i browser moderni
- **Features**:
  - getCurrentPosition con alta precisione
  - Monitoraggio cambio permesso
  - Cache posizione (5 minuti)

#### 👥 Contatti (Opzionale)
- **Quando**: Su richiesta esplicita utente
- **Perché**: Invitare amici facilmente
- **Compatibilità**: Solo Android Chrome 80+
- **Features**:
  - Contact Picker API
  - Selezione singola/multipla
  - Non richiesto automaticamente

### 3. **Flow di Installazione**

```
┌─────────────────────────────────────────┐
│  STEP 1: INSTALL                        │
│  ┌────────────────────────────────────┐ │
│  │ 📱 Installa Play Sport Pro         │ │
│  │                                    │ │
│  │ ✓ Accesso istantaneo               │ │
│  │ ✓ Funziona offline                 │ │
│  │ ✓ Notifiche in tempo reale         │ │
│  │                                    │ │
│  │ [Più tardi]  [Installa ora]        │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  STEP 2: PERMISSIONS                    │
│  ┌────────────────────────────────────┐ │
│  │ 🔔 Notifiche                       │ │
│  │ Ricevi aggiornamenti su           │ │
│  │ prenotazioni e partite      ✓     │ │
│  │                                    │ │
│  │ 📍 Posizione                       │ │
│  │ Trova i campi più vicini    ✓     │ │
│  │                                    │ │
│  │ 👥 Contatti (Opzionale)            │ │
│  │ Invita amici facilmente            │ │
│  │                                    │ │
│  │ [Salta]  [Consenti permessi]       │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  STEP 3: COMPLETE                       │
│  ┌────────────────────────────────────┐ │
│  │        ✅                          │ │
│  │   Sei pronto! 🎾                   │ │
│  │                                    │ │
│  │ Ora puoi goderti al meglio        │ │
│  │ Play Sport Pro!                    │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 4. **Compatibilità Browser**

| Browser | Install Prompt | Notifiche | Posizione | Contatti |
|---------|---------------|-----------|-----------|----------|
| Chrome Android | ✅ Auto | ✅ | ✅ | ✅ |
| Safari iOS 16.4+ | 📝 Manuale | ✅ | ✅ | ❌ |
| Firefox Android | 📝 Manuale | ✅ | ✅ | ❌ |
| Edge Desktop | ✅ Auto | ✅ | ✅ | ❌ |
| Chrome Desktop | ✅ Auto | ✅ | ✅ | ❌ |
| Samsung Internet | ✅ Auto | ✅ | ✅ | ✅ |

**Legenda**:
- ✅ Auto = Prompt automatico gestito dal sistema
- 📝 Manuale = Istruzioni manuali mostrate
- ✅ = Supportato
- ❌ = Non supportato

### 5. **Istruzioni Browser-Specific**

#### iOS Safari
```
1. Tocca il pulsante Condividi in basso
2. Scorri verso il basso e tocca "Aggiungi alla schermata Home"
3. Tocca "Aggiungi" nell'angolo in alto a destra
4. L'app apparirà nella tua home screen
```

#### Android Chrome/Edge
```
1. Tocca il menu (3 punti) in alto a destra
2. Seleziona "Installa app"
3. Conferma toccando "Installa"
4. L'app verrà aggiunta alla home screen
```

#### Firefox (Desktop/Mobile)
```
1. Clicca/Tocca il menu (3 punti)
2. Seleziona "Installa"
3. Conferma l'installazione
```

## 🔧 Implementazione Tecnica

### Files Creati/Modificati

#### 1. **`src/hooks/usePermissions.js`**
Hook centralizzato per gestione permessi:
```javascript
const {
  permissions,                    // Stato corrente permessi
  capabilities,                   // Capacità dispositivo
  requestNotificationPermission,  // Richiedi notifiche
  requestGeolocationPermission,   // Richiedi posizione
  requestContactsPermission,      // Richiedi contatti
  requestAllPermissions,          // Richiedi tutti insieme
  getCurrentPosition,             // Ottieni posizione
  sendTestNotification,           // Invia notifica test
  pickContacts,                   // Apri picker contatti
} = usePermissions();
```

#### 2. **`src/components/ui/PWAInstallPrompt.jsx`**
Componente modale per installazione e permessi:
- Auto-show dopo 3 secondi (se non installata)
- 3 step flow: Install → Permissions → Complete
- Supporto istruzioni manuali per iOS/Firefox
- Integrazione con `usePWA` e `usePermissions`

#### 3. **`public/manifest.json`**
Aggiornato con nuovi permessi:
```json
{
  "permissions": [
    "notifications",
    "vibrate",
    "geolocation",
    "contacts"
  ],
  "share_target": {...},
  "file_handlers": [...]
}
```

#### 4. **`src/layouts/AppLayout.jsx`**
Aggiunto componente:
```jsx
<PWAInstallPrompt />
```

### API Utilizzate

#### Notification API
```javascript
// Richiedi permesso
const permission = await Notification.requestPermission();

// Mostra notifica
await registration.showNotification('Titolo', {
  body: 'Messaggio',
  icon: '/icons/icon-192x192.png',
  badge: '/favicon.png',
  vibrate: [200, 100, 200],
  tag: 'notification-id',
});
```

#### Geolocation API
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log(position.coords.latitude, position.coords.longitude);
  },
  (error) => console.error(error),
  { enableHighAccuracy: true }
);
```

#### Contact Picker API (Solo Android Chrome)
```javascript
const contacts = await navigator.contacts.select(
  ['name', 'tel', 'email'],
  { multiple: true }
);
```

## 📊 Utilizzo Permessi nell'App

### Notifiche
- ✅ Conferma prenotazione
- ✅ Reminder partita (30 min prima)
- ✅ Invito a torneo
- ✅ Aggiornamento classifica
- ✅ Nuovo messaggio da club admin

### Geolocalizzazione
- ✅ Trova campi vicini (mappa)
- ✅ Ordina club per distanza
- ✅ Check-in automatico al campo
- ✅ Suggerimenti meteo localizzati
- ✅ Calcolo distanza da casa

### Contatti (Futuro)
- 🔜 Invita amico a partita
- 🔜 Crea team rapidamente
- 🔜 Condividi risultato partita
- 🔜 Trova giocatori nella rubrica

## 🎨 UX/UI Design

### Prompt Modal
- **Dimensioni**: Max-width 28rem (448px)
- **Animazioni**: Fade-in overlay + Slide-up modal
- **Colori**: Gradiente blu-indigo per header
- **Icone**: SVG inline per performance
- **Dark Mode**: Supporto completo

### Permessi Cards
- **Layout**: Flex con icona emoji + testo
- **Stati**: Default, Granted (✓), Denied
- **Spiegazione**: Chiara e concisa per ogni permesso
- **Visual Feedback**: Checkmark verde quando concesso

### Benefici Section
- **Cards colorate**: Blu, Verde, Viola
- **Icons**: Checkmark in cerchio
- **Testo**: Titolo bold + descrizione small

## 🔒 Privacy & Sicurezza

### Gestione Dati
- ✅ Nessun tracking senza consenso
- ✅ Posizione NON salvata su server (solo client-side)
- ✅ Contatti NON inviati al backend
- ✅ Notifiche solo se esplicitamente richieste
- ✅ Possibilità di revocare permessi dalle impostazioni browser

### LocalStorage
```javascript
'pwa-install-prompt-shown'  // Ha visto il prompt
'pwa-prompt-date'           // Data ultimo prompt (daily check)
'pwa-prompt-skipped'        // Ha saltato (retry dopo 7 giorni)
'permissions-requested'     // Ha richiesto permessi
'pwa_installed'             // App installata
```

## 🧪 Testing

### Test Manuale

#### iOS Safari (16.4+)
1. Apri app in Safari iOS
2. Attendi 3 secondi → appare prompt
3. Clicca "Installa ora"
4. Segui istruzioni manuali
5. Aggiungi a Home Screen
6. Apri app standalone
7. Consenti notifiche (iOS chiederà)
8. Consenti posizione (iOS chiederà)

#### Android Chrome
1. Apri app in Chrome Android
2. Attendi 3 secondi → appare prompt
3. Clicca "Installa ora"
4. Chrome mostra prompt nativo
5. Conferma installazione
6. Step permessi appare
7. Clicca "Consenti permessi"
8. Android chiede notifiche → Consenti
9. Android chiede posizione → Consenti
10. Notifica di test appare ✅

#### Desktop Chrome/Edge
1. Apri app in Chrome/Edge
2. Attendi 3 secondi → appare prompt
3. Clicca "Installa ora"
4. Browser mostra prompt nativo
5. App installata in menu Start
6. Step permessi (solo notifiche su desktop)

### Test Permessi Singoli

```javascript
// In DevTools Console
const { requestNotificationPermission } = usePermissions();
await requestNotificationPermission(); // Test notifiche

const { getCurrentPosition } = usePermissions();
const pos = await getCurrentPosition(); // Test posizione

const { pickContacts } = usePermissions();
const contacts = await pickContacts(); // Test contatti (solo Android)
```

## 📈 Metriche & Analytics

### Eventi da Tracciare
- `pwa_prompt_shown` - Prompt mostrato
- `pwa_install_started` - Utente clicca installa
- `pwa_install_completed` - Installazione riuscita
- `pwa_install_skipped` - Utente salta
- `pwa_permissions_granted` - Permessi concessi
- `pwa_permissions_denied` - Permessi negati
- `notification_sent` - Notifica inviata
- `notification_clicked` - Notifica cliccata

### Conversions
- **Install Rate**: Installs / Prompt Shows
- **Permission Grant Rate**: Granted / Requested
- **Retention**: DAU/MAU di app installata

## 🚀 Roadmap Futuro

### Fase 2: Notifiche Avanzate
- [ ] Push notifications da server (Firebase Cloud Messaging)
- [ ] Notifiche rich con immagini
- [ ] Azioni inline (Accetta/Rifiuta partita)
- [ ] Notifiche gruppi (team, tornei)

### Fase 3: Geolocalizzazione Avanzata
- [ ] Mappa interattiva campi vicini
- [ ] Navigazione turn-by-turn
- [ ] Geofencing (alert quando vicino al campo)
- [ ] Meteo in tempo reale per posizione

### Fase 4: Integrazione Contatti
- [ ] Invita amici via SMS/WhatsApp
- [ ] Sincronizzazione automatica team
- [ ] Trova giocatori nella rubrica già registrati
- [ ] Condivisione risultati social

### Fase 5: Features PWA Native-Like
- [ ] Badging API (contatore notifiche sull'icona)
- [ ] Web Share API (condividi risultati)
- [ ] File System Access (export dati)
- [ ] Periodic Background Sync
- [ ] App Shortcuts dinamiche

## 📚 Riferimenti

### Documentation
- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev - PWA](https://web.dev/progressive-web-apps/)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Contact Picker API](https://developer.mozilla.org/en-US/docs/Web/API/Contact_Picker_API)

### Tools
- [PWA Builder](https://www.pwabuilder.com/)
- [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse)
- [Workbox (Service Worker)](https://developers.google.com/web/tools/workbox)

## ✅ Checklist Pre-Deploy

- [x] Manifest.json aggiornato con permessi
- [x] Service Worker gestisce notifiche
- [x] Hook usePermissions testato
- [x] PWAInstallPrompt integrato in AppLayout
- [x] Supporto iOS + Android verificato
- [x] Dark mode funzionante
- [x] LocalStorage cleanup implementato
- [x] Documentazione completa
- [ ] Test su dispositivi reali
- [ ] Analytics events configurati
- [ ] HTTPS obbligatorio (per PWA)

---

**🎾 Play Sport Pro - PWA Ready!**
