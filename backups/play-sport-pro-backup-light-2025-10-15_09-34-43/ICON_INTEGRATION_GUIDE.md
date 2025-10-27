# 📱 Integrazione Icona App - Play Sport Pro

## Script di Generazione Icone

Questo progetto include script automatici per generare le icone dell'app in tutte le dimensioni richieste.

### Utilizzo

1. **Installa Sharp (se non già installato):**
   ```bash
   npm install sharp --save-dev
   ```

2. **Genera icone Android:**
   ```bash
   node generate-android-icons.js
   ```

### Struttura Icone Generate

Le icone verranno generate automaticamente nelle seguenti dimensioni per Android:

- **LDPI** (36x36px) - `android/app/src/main/res/mipmap-ldpi/ic_launcher.png`
- **MDPI** (48x48px) - `android/app/src/main/res/mipmap-mdpi/ic_launcher.png`
- **HDPI** (72x72px) - `android/app/src/main/res/mipmap-hdpi/ic_launcher.png`
- **XHDPI** (96x96px) - `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png`
- **XXHDPI** (144x144px) - `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png`
- **XXXHDPI** (192x192px) - `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`

### File Sorgente

- **Icona principale:** `play-sport-pro_icon_only.svg`
- **Logo orizzontale:** `play-sport-pro_horizontal.svg`

### Configurazione Automatica

Gli script aggiorneranno automaticamente i file di configurazione necessari:

- `android/app/src/main/AndroidManifest.xml`
- `public/manifest.json` (per PWA)
- `capacitor.config.ts`

### Icone Web/PWA

Per le icone PWA, lo script genererà anche:

- `public/icons/icon-192x192.png`
- `public/icons/icon-512x512.png`
- `public/favicon.ico`

### Note Tecniche

- Le icone mantengono la trasparenza
- Vengono ridimensionate mantenendo le proporzioni
- Supportano sia Android che iOS (future implementazioni)
- Ottimizzate per la distribuzione negli store
