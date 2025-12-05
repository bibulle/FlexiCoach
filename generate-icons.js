const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceImage = './apps/frontend/public/eric.png';
const outputDir = './apps/frontend/public/assets/icons';

// Créer le dossier de sortie s'il n'existe pas
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Tailles d'icônes PWA requises
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  console.log('Génération des icônes PWA...\n');

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    await sharp(sourceImage)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(outputPath);

    console.log(`✓ Généré: icon-${size}x${size}.png`);
  }

  // Générer le favicon.ico (32x32)
  const faviconPath = './apps/frontend/public/favicon.ico';
  await sharp(sourceImage)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(faviconPath);

  console.log(`✓ Généré: favicon.ico`);
  console.log('\n✨ Toutes les icônes ont été générées avec succès !');
}

generateIcons().catch(err => {
  console.error('Erreur lors de la génération des icônes:', err);
  process.exit(1);
});
