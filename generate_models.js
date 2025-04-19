import { Document } from '@gltf-transform/core';
import {
  readFileSync,
  statSync,
  mkdirSync,
  writeFileSync,
  readdirSync,
  existsSync,
} from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function getModelInfo(gltfPath) {
  try {
    // Wczytanie pliku GLTF
    const gltfData = JSON.parse(readFileSync(gltfPath, 'utf-8'));

    // Wczytanie pliku binarnego
    const binPath = join(dirname(gltfPath), gltfData.buffers[0].uri);
    const binData = readFileSync(binPath);

    // Inicjalizacja liczników
    let totalTriangles = 0;
    let totalVertices = 0;

    // Analiza wszystkich meshów
    if (gltfData.meshes) {
      for (const mesh of gltfData.meshes) {
        for (const primitive of mesh.primitives) {
          // Liczenie wierzchołków
          if (primitive.attributes.POSITION !== undefined) {
            const accessor = gltfData.accessors[primitive.attributes.POSITION];
            totalVertices += accessor.count;
          }

          // Liczenie trójkątów
          if (primitive.indices !== undefined) {
            const accessor = gltfData.accessors[primitive.indices];
            const bufferView = gltfData.bufferViews[accessor.bufferView];
            const byteOffset = bufferView.byteOffset || 0;
            const byteLength = bufferView.byteLength;
            const componentType = accessor.componentType;
            const count = accessor.count;

            // Odczytanie danych indeksów z pliku binarnego
            const indicesData = binData.slice(
              byteOffset,
              byteOffset + byteLength
            );
            totalTriangles += count / 3;
          } else {
            // Jeśli nie ma indeksów, zakładamy że każdy wierzchołek jest częścią trójkąta
            const accessor = gltfData.accessors[primitive.attributes.POSITION];
            totalTriangles += accessor.count / 3;
          }
        }
      }
    }

    // Obliczenie całkowitego rozmiaru plików
    let totalSizeBytes = 0;

    // Dodanie rozmiaru głównego pliku
    totalSizeBytes += statSync(gltfPath).size;

    // Dodanie rozmiaru plików binarnych
    if (gltfData.buffers) {
      for (const buffer of gltfData.buffers) {
        if (buffer.uri) {
          const binPath = join(dirname(gltfPath), buffer.uri);
          // Sprawdź, czy plik istnieje przed pobraniem jego rozmiaru
          if (existsSync(binPath)) {
            totalSizeBytes += statSync(binPath).size;
          } else {
            console.warn(
              `  ⚠️ Plik binarny ${binPath} nie istnieje, pomijanie w obliczeniach rozmiaru.`
            );
          }
        }
      }
    }

    // Dodanie rozmiaru tekstur
    if (gltfData.images) {
      for (const image of gltfData.images) {
        if (image.uri) {
          const texturePath = join(dirname(gltfPath), image.uri);
          // Sprawdź, czy plik istnieje przed pobraniem jego rozmiaru
          if (existsSync(texturePath)) {
            totalSizeBytes += statSync(texturePath).size;
          } else {
            console.warn(
              `  ⚠️ Plik tekstury ${texturePath} nie istnieje, pomijanie w obliczeniach rozmiaru.`
            );
          }
        }
      }
    }

    // Konwersja na MB
    const fileSizeMB = totalSizeBytes / (1024 * 1024);

    // Pobranie bounding box (uproszczona wersja)
    const bounds = {
      min: [0, 0, 0],
      max: [0, 0, 0],
      size: [0, 0, 0],
    };

    return {
      triangles: Math.floor(totalTriangles),
      vertices: totalVertices,
      file_size_mb: Math.round(fileSizeMB * 100) / 100,
      bounds: bounds,
    };
  } catch (error) {
    console.error(
      `❌ Błąd podczas odczytywania informacji o modelu ${gltfPath}: ${error.message}`
    );
    return null;
  }
}

function normalizePath(path) {
  // Konwertuje ścieżkę do formatu URL (zawsze używając slashów)
  return path.replace(/\\/g, '/');
}

async function generateConfig(gltfPath) {
  try {
    // Tworzenie katalogu dla modelu jeśli nie istnieje
    const modelDir = dirname(gltfPath);
    try {
      mkdirSync(modelDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }

    // Sprawdzenie czy plik config.json już istnieje
    const configPath = join(modelDir, 'config.json');
    try {
      writeFileSync(configPath, '', { flag: 'wx' });
    } catch (error) {
      if (error.code === 'EEXIST') {
        console.log(`Plik konfiguracyjny już istnieje dla ${gltfPath}`);
        return;
      }
      throw error;
    }

    // Pobranie informacji o modelu
    const modelInfo = await getModelInfo(gltfPath);

    // Tworzenie domyślnej konfiguracji
    const config = {
      center: { x: true, y: true, z: true },
      position: {
        method: 'floor', // Możliwe wartości: "floor", "center", "topEdge"
        value: 0,
        yOffset: 0,
      },
      scale: {
        method: 'fixed',
        fixedScale: 1,
      },
      rotation: {
        x: 0, // Obrót wokół osi X w stopniach
        y: 0, // Obrót wokół osi Y w stopniach
        z: 0, // Obrót wokół osi Z w stopniach
      },
      model_info: modelInfo || {},
    };

    // Zapisanie konfiguracji do pliku
    writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf-8');
    console.log(`✅ Wygenerowano nową konfigurację dla ${gltfPath}`);
  } catch (error) {
    console.error(
      `❌ Błąd podczas generowania konfiguracji dla ${gltfPath}: ${error.message}`
    );
  }
}

async function processModelsDirectory(baseDir = 'models') {
  try {
    // Sprawdź czy katalog models istnieje
    if (!statSync(baseDir)) {
      console.error(`❌ Katalog ${baseDir} nie istnieje!`);
      return {};
    }

    console.log(`🔍 Skanowanie katalogu ${baseDir}...`);

    const models = {};
    const findModelFiles = (dir) => {
      const files = readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const fullPath = join(dir, file.name);
        if (file.isDirectory()) {
          findModelFiles(fullPath);
        } else if (file.name.endsWith('.gltf') || file.name.endsWith('.glb')) {
          // Pobierz tylko nazwę folderu bez pełnej ścieżki
          const folderName = dirname(fullPath).split(/[\\/]/).pop();

          if (!models[folderName]) {
            models[folderName] = {
              gltf: file.name,
              path: dirname(fullPath), // Musimy zachować pełną ścieżkę dla operacji na plikach
              name: folderName, // Dodajemy samą nazwę folderu
            };
          }
        }
      }
    };

    findModelFiles(baseDir);

    if (Object.keys(models).length === 0) {
      console.log('⚠️ Nie znaleziono żadnych plików .gltf lub .glb!');
      return {};
    }

    console.log(`✅ Znaleziono ${Object.keys(models).length} modeli`);
    return models;
  } catch (error) {
    console.error(
      `❌ Błąd podczas przetwarzania katalogu ${baseDir}: ${error.message}`
    );
    return {};
  }
}

// Funkcja do generowania hasha na podstawie ścieżki folderu i plików
function generateModelHash(folderName, files) {
  // Bezpieczne kodowanie nazwy folderu
  const encodedFolder = encodeURIComponent(folderName);
  // Konwertujemy obiekt files na string i sortujemy klucze
  const filesString = JSON.stringify(
    Object.keys(files)
      .sort()
      .reduce((acc, key) => {
        acc[key] = files[key];
        return acc;
      }, {})
  );
  const hashInput = encodedFolder + filesString;
  return crypto.createHash('md5').update(hashInput).digest('hex');
}

async function generateIndex(onlyNew = false) {
  try {
    const modelsDir = join(__dirname, 'models');
    const indexPath = join(modelsDir, 'index.json');
    let existingIndex = {};

    if (existsSync(indexPath)) {
      existingIndex = JSON.parse(readFileSync(indexPath, 'utf-8'));
    }

    const models = await processModelsDirectory(modelsDir);
    const newModels = {};

    for (const [modelName, modelData] of Object.entries(models)) {
      const gltfPath = join(modelData.path, modelData.gltf);
      const files = { gltf: modelData.gltf };
      const hash = generateModelHash(modelName, files);

      if (
        !onlyNew ||
        !existingIndex[modelName] ||
        existingIndex[modelName].model_hash !== hash
      ) {
        // Pobierz informacje o modelu
        const modelInfo = await getModelInfo(gltfPath);

        newModels[modelName] = {
          name: modelName, // Używamy samej nazwy folderu
          gltf_files: [modelData.gltf],
          model_hash: hash,
          model_info: {
            triangles: modelInfo.triangles,
            vertices: modelInfo.vertices,
            file_size_mb: modelInfo.file_size_mb || 0,
          },
          config: await generateConfig(gltfPath),
        };
      } else {
        newModels[modelName] = existingIndex[modelName];
      }
    }

    // Znajdź i wybierz model domyślny
    const defaultModels = await findDefaultModels(modelsDir);
    const selectedDefaultModel = await selectDefaultModel(defaultModels);

    if (selectedDefaultModel) {
      // Używamy tylko nazwy folderu dla modelu domyślnego
      newModels.default_model = selectedDefaultModel.name;
      console.log(`\n✅ Wybrano model domyślny: ${selectedDefaultModel.name}`);
    } else {
      console.log('\n⚠️ Nie wybrano modelu domyślnego');
    }

    writeFileSync(indexPath, JSON.stringify(newModels, null, 2));
    console.log('✅ Indeks modeli został zaktualizowany');
  } catch (error) {
    console.error(`❌ Błąd podczas generowania indeksu: ${error.message}`);
  }
}

async function findDefaultModels(baseDir = 'models') {
  const defaultModels = [];
  const findDefaultModelFiles = (dir) => {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        findDefaultModelFiles(fullPath);
      } else if (entry.name === 'default_model') {
        const modelDir = dirname(fullPath);
        const modelName = modelDir.split('/').pop();
        defaultModels.push({
          path: modelDir,
          name: modelName,
        });
      }
    }
  };

  findDefaultModelFiles(baseDir);
  return defaultModels;
}

async function selectDefaultModel(defaultModels) {
  if (defaultModels.length === 0) {
    console.log('Nie znaleziono żadnych modeli z plikiem default_model');
    return null;
  }

  if (defaultModels.length === 1) {
    console.log(
      `Znaleziono jeden model z plikiem default_model: ${defaultModels[0].name}`
    );
    return defaultModels[0];
  }

  console.log('\nZnaleziono następujące modele z plikiem default_model:');
  defaultModels.forEach((model, index) => {
    console.log(`${index + 1}. ${model.name}`);
  });

  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      '\nWybierz numer modelu domyślnego (1-' + defaultModels.length + '): ',
      (answer) => {
        const choice = parseInt(answer) - 1;
        rl.close();

        if (choice >= 0 && choice < defaultModels.length) {
          resolve(defaultModels[choice]);
        } else {
          console.log('Nieprawidłowy wybór. Wybierz ponownie.');
          resolve(selectDefaultModel(defaultModels));
        }
      }
    );
  });
}

async function main() {
  console.log('🔄 Generator konfiguracji i indeksu modeli 3D');
  console.log('--------------------------------------------');

  // Parsowanie argumentów wiersza poleceń
  const args = process.argv.slice(2);
  const onlyNew = args.includes('--only-new');

  try {
    // Generowanie konfiguracji
    await processModelsDirectory();
    console.log('\n✅ Zakończono generowanie konfiguracji.');

    // Generowanie indeksu
    console.log('\n🔄 Generowanie indeksu...');
    console.log(
      onlyNew ? '📝 Tryb: tylko nowe modele' : '📝 Tryb: wszystkie modele'
    );
    await generateIndex(onlyNew);
    console.log('\n✅ Zakończono generowanie indeksu.');
  } catch (error) {
    console.error(`\n❌ Wystąpił błąd: ${error.message}`);
  }
}

// Uruchomienie głównej funkcji
main();
