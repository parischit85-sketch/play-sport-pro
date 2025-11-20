# 📱 Play Sport Pro - Guida Build Android

## ✅ Setup Completato

Il progetto è configurato per generare build release firmate per Google Play Store.

### 📁 File Creati

- ✅ `android/app/play-sport-pro.keystore` - Chiave di firma (⚠️ FAI BACKUP!)
- ✅ `android/key.properties` - Credenziali firma (⚠️ NON committare!)
- ✅ `android/local.properties` - Path Android SDK
- ✅ `build-release.ps1` - Script build automatico
- ✅ `PlaySportPro-v1.0.5-release.aab` - AAB firmato pronto per Play Store

---

## 🚀 Come Generare Build Release

### Metodo 1: Script Automatico (CONSIGLIATO)

```powershell
# Genera AAB per Play Store
.\build-release.ps1

# Genera APK per test
.\build-release.ps1 -BuildType apk
```

Lo script fa automaticamente:
1. ✅ Build web app (`npm run build`)
2. ✅ Sync Capacitor (`npx cap sync android`)
3. ✅ Build e firma AAB/APK
4. ✅ Copia file nella root del progetto

### Metodo 2: Manuale

```powershell
# 1. Build web
npm run build

# 2. Sync Android
npx cap sync android

# 3. Genera AAB
cd android
.\gradlew.bat bundleRelease

# 4. Oppure APK
.\gradlew.bat assembleRelease
```

**Output:**
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- APK: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📦 Pubblicazione su Google Play Store

### Prerequisiti
1. ✅ Account Google Play Console ($25 una tantum)
2. ✅ AAB firmato generato
3. ⚠️ Materiali Play Store (vedi sotto)

### Step-by-Step

1. **Vai su Play Console**
   - https://play.google.com/console
   - Crea nuova app o apri app esistente

2. **Carica AAB**
   - Produzione → Crea nuova release
   - Upload: `PlaySportPro-v1.0.5-release.aab`

3. **Compila scheda Store** (richiesto solo prima release)
   - Screenshot (vedi sezione materiali)
   - Icona 512x512
   - Descrizioni
   - Privacy Policy URL

4. **Invia per revisione**
   - Review Google: 1-7 giorni
   - Se approvato: pubblicazione automatica

---

## 🎨 Materiali Play Store Richiesti

### Screenshot Android (OBBLIGATORI)

**Telefono:**
- Minimo: 2 screenshot
- Massimo: 8 screenshot
- Risoluzione: 1080x1920 o 1920x1080
- Formato: PNG o JPEG (max 8MB ciascuno)

**Tablet 7"** (opzionale):
- Risoluzione: 1200x1920

**Tablet 10"** (opzionale):
- Risoluzione: 1600x2560

### Icone

**Icona app:**
- 512x512 pixel
- Formato: PNG (24-bit)
- Sfondo pieno o trasparente

**Grafica promozionale:**
- 1024x500 pixel
- Formato: PNG o JPEG

### Testi

**Titolo:** (max 50 caratteri)
```
Play Sport Pro
```

**Descrizione breve:** (max 80 caratteri)
```
Gestisci tornei di padel, prenotazioni campi e classifica giocatori
```

**Descrizione completa:** (max 4000 caratteri)
```
🎾 Play Sport Pro - L'app completa per la gestione del tuo circolo sportivo

Funzionalità principali:
✓ Gestione tornei di padel con gironi e tabelloni
✓ Prenotazione campi online
✓ Classifiche giocatori in tempo reale
✓ Sistema ranking RPA
✓ Notifiche push per aggiornamenti match
✓ Statistiche dettagliate per giocatore
✓ Gestione certificati medici
✓ Dashboard amministratore completa

[Continua con dettagli specifici...]
```

---

## 🔄 Aggiornare Versione App

Prima di ogni nuova release:

1. **Incrementa versionCode** in `android/app/build.gradle`:
   ```gradle
   versionCode 2  // Incrementa +1 ad ogni release
   versionName "1.0.6"
   ```

2. **Rigenera AAB:**
   ```powershell
   .\build-release.ps1
   ```

3. **Rinomina file:**
   ```
   PlaySportPro-v1.0.6-release.aab
   ```

---

## ⚠️ BACKUP E SICUREZZA

### File da Salvare (CRITICI!)

1. **Keystore:** `android/app/play-sport-pro.keystore`
   - ⚠️ Se perdi questo file, NON potrai mai più aggiornare l'app!
   - Fai 3+ backup in posti diversi:
     - Cloud (Dropbox, Google Drive)
     - Hard disk esterno
     - Chiavetta USB

2. **Password keystore**
   - Salva in password manager (1Password, LastPass, Bitwarden)
   - Scrivi su carta e metti in cassaforte

### File da NON Committare

- ❌ `android/app/play-sport-pro.keystore`
- ❌ `android/key.properties`
- ❌ `android/local.properties`
- ❌ `*.aab` / `*.apk`

(Già in `.gitignore`)

---

## 🧪 Test APK su Dispositivo

Per testare prima di pubblicare:

```powershell
# Genera APK debug
.\build-apk-simple.ps1

# Oppure APK release
.\build-release.ps1 -BuildType apk
```

**Installa su telefono:**
1. Trasferisci APK via USB o email
2. Abilita "Origini sconosciute" su Android
3. Installa l'APK
4. Testa tutte le funzionalità

---

## 📊 Info Build Corrente

- **Version Name:** 1.0.5
- **Version Code:** 1
- **App ID:** com.playsportpro.app
- **Min SDK:** 24 (Android 7.0)
- **Target SDK:** Latest
- **AAB Size:** ~5.88 MB

---

## 🐛 Troubleshooting

### Errore: "SDK location not found"
```powershell
# Verifica Android SDK installato
$env:LOCALAPPDATA\Android\Sdk

# Reinstalla Android Studio se mancante
```

### Errore: "Keystore password incorrect"
```powershell
# Verifica password in android/key.properties
# Deve corrispondere a quella scelta durante keytool -genkey
```

### Build fallisce
```powershell
# Pulisci cache Gradle
cd android
.\gradlew.bat clean
cd ..

# Riprova build
.\build-release.ps1
```

---

## 📞 Supporto

- **Documentazione Capacitor:** https://capacitorjs.com/docs
- **Google Play Console:** https://play.google.com/console
- **Android Developer Guide:** https://developer.android.com

---

**✅ Configurazione completata il:** 17 Novembre 2025  
**🔧 Prossimo aggiornamento:** Incrementa versionCode prima della prossima release
