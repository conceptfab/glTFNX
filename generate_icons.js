import sharp from 'sharp';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const iconsDir = join(__dirname, 'icons');

async function generateIcons() {
  try {
    console.log('🎨 Generowanie ikon...');

    // Sprawdź czy istnieje plik źródłowy
    const sourceFile = join(iconsDir, 'conceptfab.svg');
    if (!fs.existsSync(sourceFile)) {
      throw new Error('Brak pliku źródłowego icons/conceptfab.svg');
    }

    // Konfiguracja ikon do wygenerowania
    const icons = [
      { name: 'apple-touch-icon.png', size: 180 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'favicon-16x16.png', size: 16 },
      { name: 'android-chrome-192x192.png', size: 192 },
      { name: 'android-chrome-512x512.png', size: 512 },
    ];

    // Generuj każdą ikonę
    for (const icon of icons) {
      console.log(`  🖼️ Generuję ${icon.name} (${icon.size}x${icon.size})...`);
      await sharp(sourceFile)
        .resize(icon.size, icon.size)
        .toFile(join(iconsDir, icon.name));
      console.log(`  ✅ Wygenerowano ${icon.name}`);
    }

    // Kopiuj oryginalny SVG jako safari-pinned-tab.svg
    console.log('  🖼️ Kopiuję conceptfab.svg jako safari-pinned-tab.svg...');
    await fs.copyFile(sourceFile, join(iconsDir, 'safari-pinned-tab.svg'));
    console.log('  ✅ Wygenerowano safari-pinned-tab.svg');

    // Generuj favicon.ico
    console.log('  🖼️ Generuję favicon.ico...');
    await sharp(sourceFile)
      .resize(32, 32)
      .toFile(join(iconsDir, 'favicon.ico'));
    console.log('  ✅ Wygenerowano favicon.ico');

    console.log('✨ Generowanie ikon zakończone pomyślnie!');
    return true;
  } catch (error) {
    console.error('❌ Błąd podczas generowania ikon:', error);
    return false;
  }
}

// Uruchomienie funkcji
generateIcons();
