# Fix Geolocalizzazione PWA Mobile

## Problema Risolto
La PWA mobile non riusciva a ottenere la posizione dell'utente quando si premeva "Usa la mia posizione" nella ricerca club.

## Causa del Problema

### 1. **Permessi Browser Non Concessi**
Le PWA richiedono permessi espliciti per accedere alla geolocalizzazione. Il browser blocca la richiesta se:
- L'utente ha precedentemente negato il permesso
- Il sito non è su HTTPS (eccetto localhost)
- Il browser non supporta la Permissions API

### 2. **Timeout Troppo Breve**
Il timeout di 10 secondi era insufficiente per dispositivi mobile che necessitano più tempo per:
- Attivare il GPS
- Triangolare la posizione tramite WiFi/celle telefoniche
- Ottenere una posizione accurata

### 3. **Cache di Posizione**
`maximumAge: 300000` (5 minuti) causava l'uso di posizioni cached obsolete invece di richiedere una posizione fresca.

## Soluzione Implementata

### File Modificato: `src/features/clubs/ClubSearch.jsx`

#### 1. **Controllo Secure Context**
```javascript
const isSecureContext = window.isSecureContext;
if (!isSecureContext && window.location.hostname !== 'localhost') {
  setError('La geolocalizzazione richiede una connessione sicura (HTTPS)');
  return;
}
```
Verifica che l'app sia su HTTPS (richiesto per PWA)

#### 2. **Verifica Permessi con Permissions API**
```javascript
if (navigator.permissions) {
  navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
    if (permissionStatus.state === 'denied') {
      setError('Permesso di geolocalizzazione negato...');
      return;
    }
    requestGeolocation();
  });
}
```
Controlla lo stato dei permessi prima di richiedere la posizione

#### 3. **Gestione Errori Dettagliata**
```javascript
switch (error.code) {
  case error.PERMISSION_DENIED:
    errorMessage = 'Permesso di geolocalizzazione negato. Abilita i permessi nelle impostazioni del browser.';
    break;
  case error.POSITION_UNAVAILABLE:
    errorMessage = 'Posizione non disponibile. Verifica la connessione GPS/WiFi.';
    break;
  case error.TIMEOUT:
    errorMessage = 'Timeout nella ricerca della posizione. Riprova.';
    break;
}
```
Messaggi specifici per ogni tipo di errore

#### 4. **Opzioni Geolocalizzazione Ottimizzate per Mobile**
```javascript
{
  enableHighAccuracy: true,  // Usa GPS per precisione massima
  timeout: 15000,            // 15 secondi (aumentato da 10)
  maximumAge: 0,             // Nessuna cache, posizione fresca
}
```

#### 5. **Logging per Debug**
```javascript
console.log('Geolocation permission status:', permissionStatus.state);
console.log('Geolocation success:', location);
console.error('Geolocation error:', error);
```

## Come Abilitare i Permessi su Mobile

### Android (Chrome/Edge)

1. **Durante la Richiesta**
   - Quando premi "Usa la mia posizione", apparirà un popup
   - Seleziona **"Consenti"** quando richiesto

2. **Se Negato in Precedenza**
   - Apri le impostazioni del browser (⋮ menu)
   - Vai su **Impostazioni sito** o **Autorizzazioni sito**
   - Seleziona **Posizione**
   - Trova `play-sport.pro` nell'elenco
   - Cambia da "Bloccato" a **"Consenti"**

3. **Impostazioni Sistema Android**
   - Vai su **Impostazioni** > **App**
   - Seleziona **Chrome** (o browser usato)
   - Vai su **Autorizzazioni**
   - Abilita **Posizione**
   - Seleziona "Consenti solo durante l'uso dell'app"

### iOS (Safari)

1. **Durante la Richiesta**
   - Quando premi "Usa la mia posizione", apparirà un alert
   - Tocca **"Consenti"**

2. **Se Negato in Precedenza**
   - Apri **Impostazioni** iOS
   - Scorri fino a **Safari**
   - Vai su **Posizione**
   - Seleziona **"Chiedi"** o **"Consenti"**

3. **Impostazioni Privacy iOS**
   - Vai su **Impostazioni** > **Privacy e Sicurezza**
   - Tocca **Localizzazione**
   - Abilita **Servizi di localizzazione**
   - Trova **Safari** nell'elenco
   - Seleziona "Durante l'uso dell'app"

### PWA Installata

1. **Android**
   - Apri l'app PWA installata
   - Tocca ⋮ (menu) in alto a destra
   - Seleziona **Informazioni sito**
   - Vai su **Autorizzazioni**
   - Abilita **Posizione**

2. **iOS**
   - Le PWA su iOS usano i permessi di Safari
   - Segui le istruzioni Safari sopra

## Requisiti Tecnici

### 1. **HTTPS Obbligatorio**
```
✅ https://play-sport.pro
✅ https://www.play-sport.pro
❌ http://play-sport.pro (non sicuro)
```

La geolocalizzazione funziona SOLO su:
- HTTPS (produzione)
- `localhost` (sviluppo)

### 2. **Browser Supportati**
| Browser | Geolocation | Permissions API | PWA |
|---------|-------------|-----------------|-----|
| Chrome Android | ✅ | ✅ | ✅ |
| Safari iOS | ✅ | ⚠️ Limitato | ✅ |
| Firefox Android | ✅ | ✅ | ✅ |
| Edge Android | ✅ | ✅ | ✅ |
| Samsung Internet | ✅ | ✅ | ✅ |

### 3. **Connessione GPS/WiFi**
La posizione viene determinata tramite:
1. **GPS** (più preciso, richiede cielo aperto)
2. **WiFi** (preciso in aree urbane)
3. **Celle telefoniche** (meno preciso)

Assicurati che almeno uno sia attivo!

## Test della Funzionalità

### Console Developer Tools
Apri la console del browser (`F12` o menu > Strumenti sviluppatore) e cerca:

**Successo:**
```
Geolocation permission status: granted
Geolocation success: {lat: 45.4642, lng: 9.1900}
```

**Errore Permesso:**
```
Geolocation permission status: denied
Permesso di geolocalizzazione negato...
```

**Errore Posizione:**
```
Geolocation error: PositionError {code: 2, message: "..."}
Posizione non disponibile. Verifica la connessione GPS/WiFi.
```

### Test Manuale

1. **Verifica HTTPS**
   ```
   Apri l'app → URL deve iniziare con https://
   ```

2. **Verifica Permessi**
   ```
   Browser menu → Informazioni sito → Permessi → Posizione = Consenti
   ```

3. **Test Ricerca**
   ```
   Home → Cerca Circoli → "Cerca nelle vicinanze" → "Usa la mia posizione"
   ```

4. **Verifica GPS Attivo**
   ```
   Impostazioni sistema → GPS/Localizzazione = Attivo
   ```

5. **Test Posizione**
   ```
   Apri Google Maps → Verifica che rilevi la tua posizione
   Se Maps funziona, anche l'app dovrebbe funzionare
   ```

## Errori Comuni e Soluzioni

### ❌ "La geolocalizzazione richiede una connessione sicura (HTTPS)"
**Causa:** App non su HTTPS  
**Soluzione:** Usa solo la versione HTTPS del sito

### ❌ "Permesso di geolocalizzazione negato"
**Causa:** Permessi browser bloccati  
**Soluzione:** Segui le istruzioni "Come Abilitare i Permessi" sopra

### ❌ "Posizione non disponibile. Verifica la connessione GPS/WiFi"
**Causa:** GPS disattivato o nessun segnale  
**Soluzione:**  
- Attiva GPS nelle impostazioni sistema
- Esci all'aperto per miglior segnale GPS
- Connettiti a WiFi per localizzazione alternativa

### ❌ "Timeout nella ricerca della posizione"
**Causa:** GPS impiega troppo tempo  
**Soluzione:**  
- Riprova dopo pochi secondi
- Assicurati di essere all'aperto
- Verifica che GPS sia attivo

### ❌ "Impossibile ottenere la posizione" (generico)
**Causa:** Browser non supporta geolocalizzazione  
**Soluzione:** Aggiorna il browser all'ultima versione

## Changelog

### v2.0.0 - Geolocation PWA Fix (06/10/2025)

**Migliorie:**
- ✅ Verifica secure context (HTTPS)
- ✅ Controllo permessi tramite Permissions API
- ✅ Gestione errori dettagliata con messaggi specifici
- ✅ Timeout aumentato a 15 secondi per mobile
- ✅ Rimossa cache posizione (`maximumAge: 0`)
- ✅ Logging completo per debug
- ✅ Fallback per browser senza Permissions API

**Breaking Changes:** Nessuno

**Backwards Compatibility:** 100%

## Note per Sviluppatori

### Debug su Mobile

1. **Chrome DevTools Remote Debugging**
   ```
   chrome://inspect/#devices
   Collega device Android via USB
   Ispeziona la PWA
   ```

2. **Safari Web Inspector (iOS)**
   ```
   iPhone: Impostazioni > Safari > Avanzate > Web Inspector
   Mac: Safari > Sviluppo > [Nome iPhone]
   ```

3. **Logging Console**
   Tutti i log di geolocalizzazione sono ora in console:
   - Stato permessi
   - Successo con coordinate
   - Errori dettagliati

### Testing Locale

```bash
# Usa HTTPS locale con mkcert
npm install -g mkcert
mkcert -install
mkcert localhost

# Vite con HTTPS
npm run dev -- --host --https
```

### Simulazione Errori

```javascript
// Test permission denied
navigator.geolocation.getCurrentPosition = (success, error) => {
  error({code: 1, message: 'User denied geolocation'});
};

// Test position unavailable
navigator.geolocation.getCurrentPosition = (success, error) => {
  error({code: 2, message: 'Position unavailable'});
};

// Test timeout
navigator.geolocation.getCurrentPosition = (success, error) => {
  error({code: 3, message: 'Timeout'});
};
```

## Risorse

- [MDN: Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [MDN: Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)
- [Web.dev: PWA Geolocation](https://web.dev/articles/permissions-api)
- [Can I Use: Geolocation](https://caniuse.com/geolocation)

## Supporto

Se continui ad avere problemi:
1. Verifica che GPS sia attivo
2. Prova a uscire all'aperto
3. Riavvia il browser
4. Controlla i log in console (`F12`)
5. Prova con un browser diverso

---

**Stato:** ✅ RISOLTO  
**Versione:** 2.0.0  
**Data:** 06/10/2025  
**Autore:** GitHub Copilot
