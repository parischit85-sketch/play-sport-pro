import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Definizione delle dimensioni per le icone Android
const ANDROID_ICON_SIZES = {
  'mipmap-ldpi': 36,
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

// Percorsi
const SOURCE_ICON = 'play-sport-pro_icon_only.svg';
const ANDROID_PATH = 'android/app/src/main/res';

async function generateAndroidIcons() {
  console.log('📱 Generazione icone Android in corso...');
  
  // Verifica che il file sorgente esista
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`❌ Icona sorgente non trovata: ${SOURCE_ICON}`);
    return;
  }

  try {
    // Crea le cartelle se non esistono
    for (const density of Object.keys(ANDROID_ICON_SIZES)) {
      const densityPath = path.join(ANDROID_PATH, density);
      if (!fs.existsSync(densityPath)) {
        fs.mkdirSync(densityPath, { recursive: true });
        console.log(`📁 Creata cartella: ${densityPath}`);
      }
    }

    // Genera le icone per ogni densità
    for (const [density, size] of Object.entries(ANDROID_ICON_SIZES)) {
      const outputPath = path.join(ANDROID_PATH, density, 'ic_launcher.png');
      
      await sharp(SOURCE_ICON)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Sfondo trasparente
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generata: ${density}/ic_launcher.png (${size}x${size})`);
    }

    console.log('🎉 Tutte le icone Android sono state generate con successo!');
    
  } catch (error) {
    console.error('❌ Errore durante la generazione delle icone:', error);
  }
}

// Esegui la generazione
generateAndroidIcons();
