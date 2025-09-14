# Native Testing Interface - Play Sport Pro

## Overview
Interfaccia di test per le funzionalità native integrate nell'app Play Sport Pro, accessibile dal tab **Profile > Notifiche Push**.

## Features Implementate

### 🔔 Test Notifiche Push
- **Nativo**: Utilizza LocalNotifications di Capacitor per programmare una notifica locale
- **Web/PWA**: Utilizza le Web Notifications API per mostrare notifiche browser
- **Feedback**: Vibrazione aptiva su piattaforme native
- **Output**: Mostra stato della notifica e timestamp

### 📍 Test GPS/Geolocation
- **Funzionalità**: Acquisisce posizione corrente con alta precisione
- **Timeout**: 10 secondi per evitare blocchi
- **Output**: Visualizza latitudine, longitudine e precisione in metri
- **Permessi**: Richiede autorizzazione alla localizzazione

### 📤 Test Condivisione Nativa
- **Funzionalità**: Apre il pannello nativo di condivisione del sistema
- **Content**: Condivide informazioni sull'app con URL del sito
- **Gestione**: Gestisce sia condivisione completata che annullata
- **Cross-platform**: Funziona su tutte le piattaforme Capacitor

### 📱 Download APK
- **Funzionalità**: Avvia download dell'ultima versione APK
- **URL**: Collegato al sistema di release GitHub (da configurare)
- **Feedback**: Vibrazione e messaggio di conferma
- **Browser**: Apre link in nuova finestra per compatibilità

## Struttura Componente

### NativeTestButtons.jsx
```jsx
Location: src/components/NativeTestButtons.jsx
Dependencies:
- @capacitor/core (Capacitor)
- @capacitor/push-notifications (LocalNotifications, PushNotifications)
- @capacitor/geolocation (Geolocation)
- @capacitor/haptics (Haptics, ImpactStyle)
- @capacitor/share (Share)
```

### Integrazione Profile
```jsx
Location: src/features/profile/Profile.jsx
Integration: Tab "notifications" - inserito tra NotificationSettings e info section
Import: import NativeTestButtons from '@components/NativeTestButtons';
```

## UI/UX Features

### Design Responsive
- **Grid Layout**: 2x2 su desktop, single column su mobile
- **Buttons**: Gradient colorati con effetti hover e scale
- **Loading States**: Spinner animato durante test in corso
- **Disabled States**: Bottoni disabilitati durante esecuzione

### Feedback Visivo
- **Success**: Background verde con ✅ checkmark
- **Error**: Background rosso con ❌ cross
- **Testing**: Background giallo con spinner animato
- **Vibrazione**: Feedback aptico su piattaforme native

### Risultati Test
- **Timestamp**: Orario di esecuzione del test
- **Dettagli GPS**: Coordinate e precisione quando disponibili
- **Messaggi**: Descrizioni chiare di successo/errore
- **Clear Button**: Pulisci tutti i risultati

## Capacitor Plugins Utilizzati

### Core Plugins
1. **@capacitor/push-notifications** - Notifiche locali e push
2. **@capacitor/geolocation** - Posizionamento GPS
3. **@capacitor/haptics** - Feedback tattile (vibrazioni)
4. **@capacitor/share** - Condivisione nativa

### Platform Detection
```javascript
Capacitor.isNativePlatform() // true per Android/iOS
Capacitor.getPlatform() // 'android', 'ios', 'web'
```

## Configuration Notes

### APK Download URL
Attualmente configurato per GitHub Releases:
```javascript
const apkUrl = 'https://github.com/parischit85-sketch/play-sport-pro/releases/latest/download/play-sport-pro.apk';
```

### Permissions Required
- **Geolocation**: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`
- **Notifications**: `POST_NOTIFICATIONS` (Android 13+)
- **Internet**: Per download APK

### PWA Fallbacks
- **Notifiche**: Web Notifications API
- **GPS**: Navigator.geolocation
- **Share**: Web Share API o fallback
- **Download**: Direct link opening

## Testing Instructions

### Come Testare
1. Vai su **Profile** > **Notifiche Push** tab
2. Trova la sezione **🧪 Test Features Native**
3. Clicca sui bottoni per testare ogni funzionalità
4. Osserva i risultati nella sezione sottostante
5. Usa **🗑️ Pulisci** per reset risultati

### Expected Behavior
- **Su Android**: Tutte le funzionalità native dovrebbero funzionare
- **Su Web/PWA**: Fallback a Web APIs
- **Vibrazione**: Solo su dispositivi che la supportano
- **GPS**: Richiede permessi utente

### Troubleshooting
- **GPS failed**: Controlla permessi localizzazione
- **Notifiche failed**: Verifica permessi notifiche
- **Download failed**: Controlla connessione internet
- **Share failed**: Potrebbe essere cancellazione utente (normale)

## Development Notes

### Performance Considerations
- **Async Operations**: Tutti i test sono asincroni con proper error handling
- **Timeout GPS**: 10 secondi per evitare hang dell'interfaccia
- **Lazy Loading**: Componente caricato solo quando necessario

### Error Handling
- **Try/Catch**: Comprehensive error handling per tutti i test
- **User-Friendly Messages**: Messaggi di errore comprensibili
- **Graceful Degradation**: Fallback per funzionalità non supportate

### Future Enhancements
- **Network Test**: Test connettività di rete
- **Camera Test**: Test accesso camera/foto
- **Storage Test**: Test accesso storage locale
- **Push Test**: Test effettive notifiche push server-side
