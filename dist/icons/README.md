# 🎨 PWA Icons Generator

## 📋 Istruzioni per Generare Icone PWA

### 🛠️ Metodo 1: Utilizzando un servizio online
1. Vai su **https://realfavicongenerator.net/** o **https://www.pwabuilder.com/imageGenerator**
2. Carica il file `/public/icons/icon.svg`
3. Configura le impostazioni per PWA
4. Scarica il pacchetto di icone
5. Sostituisci le icone in `/public/icons/`

### 🛠️ Metodo 2: Utilizzando ImageMagick (se disponibile)
```bash
# Installa ImageMagick (se non già installato)
# Windows: https://imagemagick.org/script/download.php#windows

# Naviga nella cartella public/icons
cd public/icons

# Genera tutte le dimensioni necessarie
magick icon.svg -resize 72x72 icon-72.png
magick icon.svg -resize 96x96 icon-96.png
magick icon.svg -resize 128x128 icon-128.png
magick icon.svg -resize 144x144 icon-144.png
magick icon.svg -resize 152x152 icon-152.png
magick icon.svg -resize 192x192 icon-192.png
magick icon.svg -resize 384x384 icon-384.png
magick icon.svg -resize 512x512 icon-512.png
```

### 🛠️ Metodo 3: Utilizzando Node.js script
```javascript
// generate-icons.js (da creare nella root del progetto)
const sharp = require('sharp');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSVG = path.join(__dirname, 'public', 'icons', 'icon.svg');

sizes.forEach(size => {
  sharp(inputSVG)
    .resize(size, size)
    .png()
    .toFile(path.join(__dirname, 'public', 'icons', `icon-${size}.png`))
    .then(() => console.log(`✅ Generated icon-${size}.png`))
    .catch(err => console.error(`❌ Error generating icon-${size}.png:`, err));
});
```

### 📱 Dimensioni Icone PWA Standard
- **72x72**: Android - ldpi
- **96x96**: Android - mdpi  
- **128x128**: Chrome Web Store
- **144x144**: Android - hdpi, Windows 10 tile
- **152x152**: iOS touch icon
- **192x192**: Android - xxhdpi (standard PWA)
- **384x384**: Android splash screen
- **512x512**: Android - xxxhdpi (maskable icon)

### 🎯 Icone Speciali
- **Maskable Icons**: Versioni con padding per supportare forme diverse
- **Splash Screen**: Icona per la schermata di caricamento
- **Favicon**: Versione .ico per browser

### ✅ Checklist Post-Generazione
- [ ] Aggiorna il manifest.json con i percorsi corretti
- [ ] Testa su diversi dispositivi
- [ ] Verifica con Lighthouse PWA audit
- [ ] Controlla la visualizzazione su iOS Safari
- [ ] Testa l'installazione su Android Chrome

### 🔧 Configurazione Manifest Aggiornata
Dopo aver generato le icone, aggiorna il `manifest.json`:

```json
{
  "icons": [
    {
      "src": "/icons/icon-72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96.png",
      "sizes": "96x96", 
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png", 
      "purpose": "any maskable"
    }
  ]
}
```

## 🚀 Test PWA
1. **Build**: `npm run build`
2. **Serve**: `npm run preview`  
3. **Test**: Apri Chrome DevTools > Application > Manifest
4. **Lighthouse**: Auditing PWA score

## 📱 Installazione
- **Android**: Chrome mostrerà banner "Aggiungi alla schermata Home"
- **iOS**: Safari > Condividi > Aggiungi alla schermata Home
- **Desktop**: Chrome > Install App
