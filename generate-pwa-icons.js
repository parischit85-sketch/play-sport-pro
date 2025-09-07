import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Definizione delle dimensioni per le icone PWA
const PWA_ICON_SIZES = {
  'icon-192x192.png': 192,
  'icon-512x512.png': 512
};

// Percorsi
const SOURCE_ICON = 'play-sport-pro_icon_only.svg';
const PWA_ICONS_PATH = 'public/icons';

async function generatePWAIcons() {
  console.log('🌐 Generazione icone PWA in corso...');
  
  // Verifica che il file sorgente esista
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`❌ Icona sorgente non trovata: ${SOURCE_ICON}`);
    return;
  }

  try {
    // Crea la cartella icons se non esiste
    if (!fs.existsSync(PWA_ICONS_PATH)) {
      fs.mkdirSync(PWA_ICONS_PATH, { recursive: true });
      console.log(`📁 Creata cartella: ${PWA_ICONS_PATH}`);
    }

    // Genera le icone PWA
    for (const [filename, size] of Object.entries(PWA_ICON_SIZES)) {
      const outputPath = path.join(PWA_ICONS_PATH, filename);
      
      await sharp(SOURCE_ICON)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Sfondo trasparente
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generata: ${filename} (${size}x${size})`);
    }

    // Genera favicon.ico
    console.log('🖼️ Generazione favicon.ico...');
    await sharp(SOURCE_ICON)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile('public/favicon.png');
    
    console.log('✅ Generato: favicon.png (32x32)');

    console.log('🎉 Tutte le icone PWA sono state generate con successo!');
    
  } catch (error) {
    console.error('❌ Errore durante la generazione delle icone PWA:', error);
  }
}

// Esegui la generazione
generatePWAIcons();
