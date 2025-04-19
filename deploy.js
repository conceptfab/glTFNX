import FtpDeploy from 'ftp-deploy';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { config as ftpConfig } from './config.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Konfiguracja FTP
const config = {
  user: ftpConfig.user,
  password: ftpConfig.password,
  host: ftpConfig.host,
  port: ftpConfig.port,
  localRoot: join(__dirname, 'dist'),
  remoteRoot: ftpConfig.remoteRoot,
  include: ['*', '**/*'],
  exclude: [],
  deleteRemote: true,
  forcePasv: true,
};

// Funkcja do kopiowania folderów
async function copyFolders() {
  try {
    console.log('📁 Kopiuję foldery z zasobami...');

    // Lista folderów do skopiowania
    const foldersToCopy = [
      { src: 'models', dest: 'dist/models' },
      { src: 'profiles', dest: 'dist/profiles' },
      { src: 'textures', dest: 'dist/glTF_NX/textures' },
    ];

    // Kopiuj foldery
    for (const folder of foldersToCopy) {
      if (fs.existsSync(folder.src)) {
        console.log(`  📂 Kopiuję ${folder.src}...`);
        await fs.copy(folder.src, folder.dest, { overwrite: true });
        console.log(`  ✅ Skopiowano ${folder.src}`);
      } else {
        console.warn(`  ⚠️ Folder ${folder.src} nie istnieje, pomijam`);
      }
    }

    // Kopiuj version.json
    if (fs.existsSync('version.json')) {
      console.log('  📄 Kopiuję version.json...');
      await fs.copy('version.json', 'dist/version.json', { overwrite: true });
      console.log('  ✅ Skopiowano version.json');
    } else {
      console.warn('  ⚠️ Plik version.json nie istnieje!');
    }

    return true;
  } catch (error) {
    console.error('❌ Błąd podczas kopiowania:', error);
    return false;
  }
}

// Funkcja do budowania aplikacji
async function buildApp() {
  try {
    console.log('🔨 Rozpoczynam budowanie aplikacji...');
    await execAsync('npm run build');
    console.log('✅ Budowanie zakończone pomyślnie');
    return true;
  } catch (error) {
    console.error('❌ Błąd podczas budowania:', error);
    return false;
  }
}

// Funkcja do weryfikacji builda
async function verifyBuild() {
  try {
    console.log('🔍 Weryfikuję poprawność builda...');

    // Sprawdzenie czy główne pliki i katalogi istnieją
    const requiredFiles = ['index.html'];

    // Sprawdź wymagane pliki
    for (const file of requiredFiles) {
      const filePath = join(config.localRoot, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Brak wymaganego pliku: ${file}`);
      }
    }

    // Sprawdź czy katalog assets istnieje i zawiera wymagane typy plików
    const assetsPath = join(config.localRoot, 'assets');
    if (!fs.existsSync(assetsPath)) {
      throw new Error('Brak katalogu assets');
    }

    const assetFiles = fs.readdirSync(assetsPath);
    const requiredAssetTypes = {
      css: false,
      js: false,
    };

    for (const file of assetFiles) {
      if (file.endsWith('.css')) requiredAssetTypes.css = true;
      if (file.endsWith('.js')) requiredAssetTypes.js = true;
    }

    for (const [type, found] of Object.entries(requiredAssetTypes)) {
      if (!found) {
        throw new Error(`Brak pliku typu .${type} w katalogu assets`);
      }
    }

    // Sprawdzenie czy foldery z zasobami istnieją
    const requiredFolders = ['models', 'profiles', 'glTF_NX/textures'];
    for (const folder of requiredFolders) {
      const folderPath = join(config.localRoot, folder);
      if (!fs.existsSync(folderPath)) {
        throw new Error(`Brak wymaganego folderu: ${folder}`);
      }
    }

    // Sprawdzenie czy katalog profiles zawiera wymagane podkatalogi
    const profilesPath = join(config.localRoot, 'profiles');
    const requiredProfileFolders = ['performance', 'scenes'];
    for (const folder of requiredProfileFolders) {
      const folderPath = join(profilesPath, folder);
      if (!fs.existsSync(folderPath)) {
        throw new Error(`Brak wymaganego folderu: profiles/${folder}`);
      }
    }

    // Sprawdzenie czy plik profiles.json istnieje
    const profilesJsonPath = join(profilesPath, 'profiles.json');
    if (!fs.existsSync(profilesJsonPath)) {
      throw new Error('Brak pliku profiles.json w katalogu profiles');
    }

    console.log('✅ Weryfikacja builda zakończona pomyślnie');
    return true;
  } catch (error) {
    console.error('❌ Błąd podczas weryfikacji:', error);
    return false;
  }
}

// Funkcja do deploymentu
async function deploy() {
  const ftpDeploy = new FtpDeploy();
  let totalFiles = 0;
  let uploadedFiles = 0;

  // Nasłuchiwanie zdarzeń FTP
  ftpDeploy.on('uploading', function (data) {
    if (totalFiles === 0) {
      totalFiles = data.totalFilesCount;
      console.log(`\n📦 Łącznie plików do wysłania: ${totalFiles}`);
    }

    uploadedFiles = data.transferredFileCount;
    const progress = ((uploadedFiles / totalFiles) * 100).toFixed(2);

    // Czytelniejszy format postępu
    process.stdout.write(
      `\r📤 Wysyłanie [${progress}%] ${uploadedFiles}/${totalFiles}: ${data.filename}`
    );
  });

  ftpDeploy.on('uploaded', function (data) {
    // Nie logujemy każdego pliku, aby nie zaśmiecać konsoli
  });

  ftpDeploy.on('log', function (data) {
    console.log('📝 Log:', data);
  });

  ftpDeploy.on('upload-error', function (data) {
    // Ignoruj błąd "File exists" jeśli deleteRemote jest true
    if (data.err.code === 550 && data.err.message.includes('File exists')) {
      console.log(`ℹ️ Plik już istnieje, pomijam: ${data.filename}`);
      return;
    }
    console.error('❌ Błąd wysyłania:', data.err);
  });

  try {
    console.log('🔄 Łączenie z serwerem FTP...');
    console.log(`📡 Host: ${config.host}`);
    console.log(`👤 Użytkownik: ${config.user}`);
    console.log(`📂 Katalog zdalny: ${config.remoteRoot}`);

    await ftpDeploy.deploy(config);

    console.log('✨ Deployment zakończony pomyślnie!');
    return true;
  } catch (err) {
    // Ignoruj błąd "File exists" jeśli deleteRemote jest true
    if (err.code === 550 && err.message.includes('File exists')) {
      console.log('ℹ️ Niektóre pliki już istnieją, kontynuuję deployment');
      return true;
    }
    console.error('❌ Błąd podczas deploymentu:', err);
    return false;
  }
}

// Główna funkcja wykonująca cały proces
async function main() {
  try {
    console.log('\n🚀 Rozpoczynam proces deploymentu...\n');

    // Budowanie aplikacji
    const buildSuccess = await buildApp();
    if (!buildSuccess) {
      throw new Error('Budowanie nie powiodło się');
    }

    // Kopiowanie folderów z zasobami
    const copySuccess = await copyFolders();
    if (!copySuccess) {
      throw new Error('Kopiowanie folderów nie powiodło się');
    }

    // Weryfikacja builda
    const verifySuccess = await verifyBuild();
    if (!verifySuccess) {
      throw new Error('Weryfikacja builda nie powiodła się');
    }

    // Deployment
    const deploySuccess = await deploy();
    if (!deploySuccess) {
      throw new Error('Deployment nie powiódł się');
    }

    console.log('\n✨ Deployment zakończony pomyślnie!\n');
    console.log('📱 Strona dostępna pod adresem:');
    console.log('🔗 https://conceptfab.com/glTF_NX/\n');
  } catch (error) {
    console.error('\n❌ Błąd krytyczny:', error);
    process.exit(1);
  }
}

// Uruchomienie głównej funkcji
main();
