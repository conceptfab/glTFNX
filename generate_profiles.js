import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Konfiguracja
const PROFILES_DIR = path.join(__dirname, 'scenes', 'profiles');
const SCENES_DIR = path.join(__dirname, 'scenes', 'scenes');
const PROFILES_LIST = path.join(__dirname, 'scenes', 'profiles.json');
const SCENES_LIST = path.join(__dirname, 'scenes', 'scenes.json');

// Funkcja do generowania listy profili
async function generateProfilesList() {
  try {
    console.log('🔍 Skanowanie katalogów profili i scen...');

    // Upewnij się, że katalogi istnieją
    await fs.ensureDir(PROFILES_DIR);
    await fs.ensureDir(SCENES_DIR);

    // Wczytaj pliki profili
    const profileFiles = await fs.readdir(PROFILES_DIR);
    const profiles = [];

    for (const file of profileFiles) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(PROFILES_DIR, file);
          const content = await fs.readJson(filePath);

          profiles.push({
            id: content.id || path.basename(file, '.json'),
            name: content.name || path.basename(file, '.json'),
            description: content.description || 'Brak opisu',
            path: file,
            category: 'profile',
            default: content.default || {},
          });

          console.log(`✅ Dodano profil: ${content.name || file}`);
        } catch (error) {
          console.warn(
            `⚠️ Błąd podczas analizy profilu ${file}:`,
            error.message
          );
        }
      }
    }

    // Wczytaj pliki scen
    const sceneFiles = await fs.readdir(SCENES_DIR);
    const scenes = [];

    for (const file of sceneFiles) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(SCENES_DIR, file);
          const content = await fs.readJson(filePath);

          scenes.push({
            id: content.id || path.basename(file, '.json'),
            name: content.name || path.basename(file, '.json'),
            description: content.description || 'Brak opisu',
            path: file,
            category: 'scene',
          });

          console.log(`✅ Dodano scenę: ${content.name || file}`);
        } catch (error) {
          console.warn(`⚠️ Błąd podczas analizy sceny ${file}:`, error.message);
        }
      }
    }

    // Zapisz listę profili
    await fs.writeJson(PROFILES_LIST, { profiles }, { spaces: 2 });
    console.log(
      `✅ Zapisano listę ${profiles.length} profili do ${PROFILES_LIST}`
    );

    // Zapisz listę scen
    await fs.writeJson(SCENES_LIST, { scenes }, { spaces: 2 });
    console.log(`✅ Zapisano listę ${scenes.length} scen do ${SCENES_LIST}`);
  } catch (error) {
    console.error('❌ Błąd podczas generowania list profili i scen:', error);
  }
}

// Funkcja do weryfikacji profili i scen
async function validateProfiles() {
  try {
    console.log('🔍 Weryfikowanie poprawności profili i scen...');

    // Wczytaj pliki profili
    const profileFiles = await fs.readdir(PROFILES_DIR);
    let validProfiles = 0;
    let invalidProfiles = 0;

    for (const file of profileFiles) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(PROFILES_DIR, file);
          const content = await fs.readJson(filePath);

          // Sprawdź wymagane pola dla profilu
          const requiredFields = ['renderer', 'name', 'description'];
          const missingFields = requiredFields.filter(
            (field) => !content[field]
          );

          if (missingFields.length === 0) {
            validProfiles++;
            console.log(`✅ Profil ${file} jest poprawny`);
          } else {
            invalidProfiles++;
            console.warn(
              `⚠️ Profil ${file} nie zawiera wymaganych pól: ${missingFields.join(
                ', '
              )}`
            );
          }
        } catch (error) {
          invalidProfiles++;
          console.warn(
            `⚠️ Błąd podczas analizy profilu ${file}:`,
            error.message
          );
        }
      }
    }

    // Wczytaj pliki scen
    const sceneFiles = await fs.readdir(SCENES_DIR);
    let validScenes = 0;
    let invalidScenes = 0;

    for (const file of sceneFiles) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(SCENES_DIR, file);
          const content = await fs.readJson(filePath);

          // Sprawdź wymagane pola dla sceny
          const requiredFields = [
            'background',
            'lighting',
            'lights',
            'name',
            'description',
          ];
          const missingFields = requiredFields.filter(
            (field) => !content[field]
          );

          if (missingFields.length === 0) {
            validScenes++;
            console.log(`✅ Scena ${file} jest poprawna`);
          } else {
            invalidScenes++;
            console.warn(
              `⚠️ Scena ${file} nie zawiera wymaganych pól: ${missingFields.join(
                ', '
              )}`
            );
          }
        } catch (error) {
          invalidScenes++;
          console.warn(`⚠️ Błąd podczas analizy sceny ${file}:`, error.message);
        }
      }
    }

    console.log(`\n📊 Podsumowanie walidacji:`);
    console.log(
      `   Profile: ${validProfiles} poprawnych, ${invalidProfiles} niepoprawnych`
    );
    console.log(
      `   Sceny: ${validScenes} poprawnych, ${invalidScenes} niepoprawnych`
    );
  } catch (error) {
    console.error('❌ Błąd podczas weryfikacji profili i scen:', error);
  }
}

// Funkcja do tworzenia szablonu nowego profilu
async function createProfileTemplate(id, name, description) {
  try {
    const templateId = id || `profile-${Date.now()}`;
    const templateName = name || 'Nowy Profil';
    const templateDesc = description || 'Opis nowego profilu';

    const templateProfile = {
      id: templateId,
      name: templateName,
      description: templateDesc,
      renderer: {
        antialias: true,
        outputColorSpace: 'srgb',
        pixelRatio: 'device',
        shadowMap: {
          enabled: true,
          type: 'PCFSoftShadowMap',
        },
        toneMapping: {
          enabled: true,
          type: 'ACESFilmicToneMapping',
          exposure: 1.0,
        },
        physicallyCorrectLights: true,
        logarithmicDepthBuffer: true,
        precision: 'highp',
        powerPreference: 'high-performance',
        stencil: true,
      },
      cameras: {
        default: {
          fov: null,
          near: null,
          far: null,
          position: {
            x: null,
            y: null,
            z: null,
          },
          target: {
            x: null,
            y: null,
            z: null,
          },
        },
        back: {
          fov: null,
          near: null,
          far: null,
          position: {
            x: null,
            y: null,
            z: null,
          },
          target: {
            x: null,
            y: null,
            z: null,
          },
        },
        top: {
          fov: null,
          near: null,
          far: null,
          position: {
            x: null,
            y: null,
            z: null,
          },
          target: {
            x: null,
            y: null,
            z: null,
          },
        },
      },
    };

    const outputPath = path.join(PROFILES_DIR, `${templateId}.json`);
    await fs.writeJson(outputPath, templateProfile, { spaces: 2 });

    console.log(`✅ Utworzono szablon profilu: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ Błąd podczas tworzenia szablonu profilu:', error);
    throw error;
  }
}

// Funkcja do tworzenia szablonu nowej sceny
async function createSceneTemplate(id, name, description) {
  try {
    const templateId = id || `scene-${Date.now()}`;
    const templateName = name || 'Nowa Scena';
    const templateDesc = description || 'Opis nowej sceny';

    const templateScene = {
      id: templateId,
      name: templateName,
      description: templateDesc,
      background: {
        color: 8683652,
      },
      environment: {
        enabled: true,
        path: 'textures/',
        files: [
          'posx.jpg',
          'negx.jpg',
          'posy.jpg',
          'negy.jpg',
          'posz.jpg',
          'negz.jpg',
        ],
        colorSpace: 'srgb',
      },
      lighting: {
        visible: false,
        ambient: {
          enabled: true,
          intensity: 0.5,
          color: 16777215,
        },
        hemisphere: {
          enabled: true,
          intensity: 1.0,
          skyColor: 16777215,
          groundColor: 8421504,
        },
      },
      lights: [
        {
          type: 'DirectionalLight',
          name: 'main_light',
          color: 16777215,
          intensity: 0.7,
          position: {
            x: 50,
            y: 50,
            z: 50,
          },
          helper: {
            visible: false,
            size: 7.5,
          },
          castShadow: true,
          shadow: {
            mapSize: {
              width: 2048,
              height: 2048,
            },
            camera: {
              left: -100,
              right: 100,
              top: 100,
              bottom: -100,
              near: 0.5,
              far: 500,
            },
            radius: 4,
            bias: -0.001,
            blurSamples: 8,
          },
        },
      ],
      floor: {
        size: 125,
        segments: 128,
        visible: true,
        material: {
          color: 15066597,
          metalness: 0.1,
          roughness: 0.7,
          envMapIntensity: 0.3,
          clearcoat: 0.2,
          clearcoatRoughness: 0.1,
          opacity: 0.95,
          reflectivity: 0.3,
          transmission: 0.0,
          thickness: 0.5,
        },
        texture: {
          file: 'studio_floor.jpg',
          repeat: 1,
          filter: 'linear',
        },
      },
    };

    const outputPath = path.join(SCENES_DIR, `${templateId}.json`);
    await fs.writeJson(outputPath, templateScene, { spaces: 2 });

    console.log(`✅ Utworzono szablon sceny: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ Błąd podczas tworzenia szablonu sceny:', error);
    throw error;
  }
}

// Funkcja główna
async function main() {
  try {
    console.log(
      '🚀 Rozpoczynam narzędzie zarządzania profilami i scenami...\n'
    );

    // Sprawdź, czy katalogi istnieją, jeśli nie - utwórz je
    await fs.ensureDir(PROFILES_DIR);
    await fs.ensureDir(SCENES_DIR);

    // Sprawdź argumenty
    const args = process.argv.slice(2);

    if (args.includes('--generate') || args.includes('-g')) {
      await generateProfilesList();
    } else if (args.includes('--validate') || args.includes('-v')) {
      await validateProfiles();
    } else if (args.includes('--create-profile') || args.includes('-cp')) {
      const idIndex = args.indexOf('--id');
      const id = idIndex >= 0 ? args[idIndex + 1] : null;

      const nameIndex = args.indexOf('--name');
      const name = nameIndex >= 0 ? args[nameIndex + 1] : null;

      const descIndex = args.indexOf('--desc');
      const desc = descIndex >= 0 ? args[descIndex + 1] : null;

      await createProfileTemplate(id, name, desc);
      await generateProfilesList();
    } else if (args.includes('--create-scene') || args.includes('-cs')) {
      const idIndex = args.indexOf('--id');
      const id = idIndex >= 0 ? args[idIndex + 1] : null;

      const nameIndex = args.indexOf('--name');
      const name = nameIndex >= 0 ? args[nameIndex + 1] : null;

      const descIndex = args.indexOf('--desc');
      const desc = descIndex >= 0 ? args[descIndex + 1] : null;

      await createSceneTemplate(id, name, desc);
      await generateProfilesList();
    } else {
      console.log('📋 Dostępne opcje:');
      console.log('   --generate, -g         Generuje listę profili i scen');
      console.log(
        '   --validate, -v         Weryfikuje poprawność profili i scen'
      );
      console.log('   --create-profile, -cp  Tworzy szablon nowego profilu');
      console.log('   --create-scene, -cs    Tworzy szablon nowej sceny');
      console.log(
        '   --id NAME              Określa ID dla nowego profilu/sceny'
      );
      console.log(
        '   --name NAME            Określa nazwę dla nowego profilu/sceny'
      );
      console.log(
        '   --desc DESCRIPTION     Określa opis dla nowego profilu/sceny'
      );
      console.log(
        '\n   Przykład: node generate_profiles.js --create-profile --id custom-profile --name "Mój Profil" --desc "Mój własny profil"'
      );
    }
  } catch (error) {
    console.error('❌ Błąd krytyczny:', error);
    process.exit(1);
  }
}

// Uruchomienie skryptu
main();
