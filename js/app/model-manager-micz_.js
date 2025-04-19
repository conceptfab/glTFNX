import * as THREE from 'three';
import { Scene } from 'three';
import { PerspectiveCamera } from 'three';
import { Light } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Klasa zarządzająca modelami 3D
export class ModelManager {
  constructor(scene) {
    console.log('ModelManager: Inicjalizacja...');
    this.scene = scene;
    this.scene.background = new THREE.Color(0x808080);
    console.log('ModelManager: Ustawiono kolor tła');

    this.loader = new GLTFLoader();
    this.models = new Map();
    this.currentModel = null;
    this.eventListeners = new Map();

    // Stan menedżera
    this.state = {
      currentModel: null,
      isLoading: false,
      error: null,
    };

    // Elementy interfejsu
    this.elements = {
      container: document.querySelector('#container'),
      loadingOverlay: document.querySelector('#loading-overlay'),
      errorOverlay: document.querySelector('#error-overlay'),
    };

    // Konfiguracja
    this.config = {
      allowedExtensions: ['.gltf', '.glb'],
      maxFileSize: 50 * 1024 * 1024, // 50MB
    };

    // Dodanie siatki pomocniczej
    const gridHelper = new THREE.GridHelper(10, 10);
    this.scene.add(gridHelper);
    console.log('ModelManager: Dodano siatkę pomocniczą');

    // Dodanie domyślnej kamery
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(5, 5, 10);
    this.camera.lookAt(0, 0, 0);
    console.log('ModelManager: Dodano domyślną kamerę');

    // Dodanie domyślnego renderera
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.elements.container.appendChild(this.renderer.domElement);
    console.log('ModelManager: Dodano domyślny renderer');

    // Dodanie kontroli kamery
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 500;
    this.controls.maxPolarAngle = Math.PI;
    console.log('ModelManager: Dodano kontrolę kamery');

    // Inicjalizacja event listenerów
    this.setupEventListeners();
    console.log('ModelManager: Inicjalizacja zakończona');

    // Rozpoczęcie pętli renderowania
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (this.controls) {
      this.controls.update();
    }
    this.renderer.render(this.scene, this.camera);
  }

  // Dodanie metody czyszczącej event listenery
  cleanupEventListeners() {
    for (const [event, listener] of this.eventListeners) {
      document.removeEventListener(event, listener);
    }
    this.eventListeners.clear();
  }

  // Modyfikacja metody setupEventListeners
  setupEventListeners() {
    this.cleanupEventListeners(); // Najpierw wyczyść stare listenery

    const modelLoadHandler = (event) => {
      const { path, name, id } = event.detail;
      this.loadModel(path, name, id);
    };

    document.addEventListener('modelLoadRequested', modelLoadHandler);
    this.eventListeners.set('modelLoadRequested', modelLoadHandler);
  }

  // Obsługa wyboru pliku
  async handleFileSelect(file) {
    console.log('ModelManager: Obsługa pliku:', file.name);

    if (!file.name.endsWith('.gltf') && !file.name.endsWith('.glb')) {
      console.error('ModelManager: Nieprawidłowy format pliku:', file.name);
      this.state.error = new Error(
        'Nieprawidłowy format pliku. Akceptowane są tylko pliki .gltf i .glb'
      );
      this.showError(this.state.error);
      return;
    }

    try {
      this.showLoading();
      console.log('ModelManager: Rozpoczynam ładowanie modelu');
      const model = await this.loadModel(file);
      console.log('ModelManager: Model załadowany, dodawanie do sceny');
      this.addModelToScene(model);
      this.hideLoading();
      console.log('ModelManager: Model dodany do sceny');
    } catch (error) {
      console.error('ModelManager: Błąd podczas ładowania modelu:', error);
      this.state.error = error;
      this.showError(error);
      this.hideLoading();
    }
  }

  // Ładowanie modelu
  async loadModel(file) {
    console.log(
      'ModelManager: Rozpoczynam ładowanie modelu z pliku:',
      file.name || file
    );
    return new Promise((resolve, reject) => {
      try {
        // Jeśli to obiekt File, użyj createObjectURL
        if (file instanceof File) {
          const url = URL.createObjectURL(file);
          this.loader.load(
            url,
            (gltf) => {
              URL.revokeObjectURL(url);
              console.log('ModelManager: Model załadowany pomyślnie');
              resolve(gltf.scene);
            },
            (xhr) => {
              const progress = (xhr.loaded / xhr.total) * 100;
              console.log(
                `ModelManager: Postęp ładowania: ${progress.toFixed(2)}%`
              );
            },
            (error) => {
              console.error('ModelManager: Błąd podczas ładowania:', error);
              reject(error);
            }
          );
        } else {
          // Jeśli to ścieżka, użyj loadModelFromPath
          this.loadModelFromPath(file)
            .then((gltf) => resolve(gltf.scene))
            .catch((error) => reject(error));
        }
      } catch (error) {
        console.error('ModelManager: Błąd podczas ładowania:', error);
        reject(error);
      }
    });
  }

  addModelToScene(model) {
    console.log('ModelManager: Dodawanie modelu do sceny');
    console.log('ModelManager: Model przed dodaniem:', model);
    console.log('ModelManager: Scena przed dodaniem modelu:', this.scene);

    // Upewnij się, że skala sceny jest zresetowana
    this.resetSceneScale();

    if (this.currentModel) {
      console.log('ModelManager: Usuwanie poprzedniego modelu');
      this.scene.remove(this.currentModel);
      // Usuń klasę active z poprzedniego modelu
      const prevModelElement = document.querySelector(
        `.model-item[data-model-uuid="${this.currentModel.userData.id}"]`
      );
      if (prevModelElement) {
        prevModelElement.classList.remove('active');
      }
    }

    // Dodanie domyślnych materiałów i optymalizacja tekstur
    model.traverse((child) => {
      if (child.isMesh) {
        if (!child.material) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.5,
            metalness: 0.5,
          });
        } else if (child.material.isMeshStandardMaterial) {
          // Optymalizacja materiału
          const material = child.material;

          // Sprawdź, czy materiał ma zbyt wiele tekstur
          const textureCount = [
            material.map,
            material.normalMap,
            material.roughnessMap,
            material.metalnessMap,
            material.aoMap,
            material.emissiveMap,
            material.alphaMap,
            material.envMap,
          ].filter(Boolean).length;

          if (textureCount > 8) {
            // Ogranicz do 8 tekstur na materiał
            console.warn(
              `ModelManager: Materiał ${child.name} ma zbyt wiele tekstur (${textureCount}). Optymalizacja...`
            );

            // Zachowaj tylko najważniejsze tekstury
            if (material.map) material.map = material.map;
            if (material.normalMap) material.normalMap = material.normalMap;
            if (material.roughnessMap)
              material.roughnessMap = material.roughnessMap;
            if (material.metalnessMap)
              material.metalnessMap = material.metalnessMap;

            // Usuń pozostałe tekstury
            material.aoMap = null;
            material.emissiveMap = null;
            material.alphaMap = null;
            material.envMap = null;
          }

          // Optymalizacja ustawień tekstur
          if (material.map) {
            material.map.minFilter = THREE.LinearFilter;
            material.map.magFilter = THREE.LinearFilter;
            material.map.generateMipmaps = true;
          }
        }
        console.log('ModelManager: Mesh znaleziony:', child.name);
        console.log('ModelManager: Materiał:', child.material);
      }
    });

    this.scene.add(model);
    this.currentModel = model;
    this.models.set(model.userData.id, model);

    // Emituj zdarzenie o wczytaniu modelu
    const event = new CustomEvent('modelLoaded', {
      detail: {
        model: model,
        uuid: model.userData.id,
      },
    });
    document.dispatchEvent(event);
    console.log('ModelManager: Zdarzenie modelLoaded wyemitowane');

    // Poczekaj na aktualizację UI, a następnie dodaj klasę active
    setTimeout(() => {
      const modelElement = document.querySelector(
        `.model-item[data-model-uuid="${model.userData.id}"]`
      );
      if (modelElement) {
        modelElement.classList.add('active');
        console.log(
          'ModelManager: Dodano klasę active do elementu:',
          modelElement
        );
      } else {
        console.warn(
          'ModelManager: Nie znaleziono elementu modelu w UI dla id:',
          model.userData.id
        );
      }
    }, 100);

    console.log('ModelManager: Model dodany do sceny, ID:', model.userData.id);
    console.log('ModelManager: Scena po dodaniu modelu:', this.scene);
  }

  // Usuwanie modelu
  removeModel(modelPath) {
    try {
      // 1. Sprawdzenie czy model istnieje
      if (!this.models.has(modelPath)) {
        throw new Error('Model nie istnieje');
      }

      // 2. Usunięcie modelu ze sceny
      const model = this.models.get(modelPath);
      this.scene.remove(model);

      // 3. Usunięcie modelu z mapy
      this.models.delete(modelPath);

      // 4. Aktualizacja aktualnego modelu
      if (this.currentModel === model) {
        this.currentModel = null;
      }
    } catch (error) {
      console.error('Błąd podczas usuwania modelu:', error);
      throw error;
    }
  }

  // Pobranie aktualnego modelu
  getCurrentModel() {
    return this.currentModel;
  }

  // Pobranie wszystkich modeli
  getAllModels() {
    console.log('ModelManager: Pobieranie wszystkich modeli');
    return Array.from(this.models.values());
  }

  // Czyszczenie wszystkich modeli
  clearAllModels() {
    console.log('ModelManager: Czyszczenie wszystkich modeli');

    // Usuń wszystkie obiekty ze sceny, zachowując światła i siatkę
    const objectsToKeep = [];

    // Znajdź obiekty do zachowania
    this.scene.children.forEach((object) => {
      if (object instanceof THREE.Light || object instanceof THREE.GridHelper) {
        objectsToKeep.push(object);
      }
    });

    // Usuń wszystkie obiekty ze sceny
    while (this.scene.children.length > 0) {
      const object = this.scene.children[0];
      this.scene.remove(object);
    }

    // Dodaj z powrotem obiekty do zachowania
    objectsToKeep.forEach((object) => {
      this.scene.add(object);
    });

    // Wyczyść mapę modeli i aktualny model
    this.models.clear();
    this.currentModel = null;

    console.log(
      'ModelManager: Wszystkie modele usunięte ze sceny, zachowano światła i siatkę'
    );
  }

  // Eksport modelu
  async exportModel(format = 'glb') {
    try {
      if (!this.currentModel) {
        throw new Error('Brak modelu do wyeksportowania');
      }

      this.showLoading();

      // Eksport do GLB
      const exporter = new THREE.GLTFExporter();
      const options = {
        binary: format === 'glb',
        trs: false,
        onlyVisible: true,
        truncateDrawRange: true,
        maxTextureSize: 4096,
        forceIndices: false,
        includeCustomExtensions: false,
      };

      const result = await new Promise((resolve, reject) => {
        exporter.parse(
          this.currentModel,
          (buffer) => resolve(buffer),
          (error) => reject(error),
          options
        );
      });

      // Utworzenie pliku do pobrania
      const blob = new Blob([result], {
        type: format === 'glb' ? 'model/gltf-binary' : 'model/gltf+json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `model.${format}`;
      link.click();

      URL.revokeObjectURL(url);

      this.hideLoading();
    } catch (error) {
      console.error('Błąd podczas eksportu modelu:', error);
      this.state.error = error;
      this.showError(error);
    }
  }

  // Wyświetlenie ekranu ładowania
  showLoading() {
    console.log('ModelManager: Pokazywanie ekranu ładowania');
    this.state.isLoading = true;
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.classList.remove('hidden');
    }
  }

  // Ukrycie ekranu ładowania
  hideLoading() {
    console.log('ModelManager: Ukrywanie ekranu ładowania');
    this.state.isLoading = false;
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.classList.add('hidden');
    }
  }

  // Wyświetlenie błędu
  showError(error) {
    console.error('ModelManager: Wyświetlanie błędu:', error);
    this.state.error = error;
    if (this.elements.errorOverlay) {
      this.elements.errorOverlay.textContent = error.message;
      this.elements.errorOverlay.classList.remove('hidden');
      setTimeout(() => {
        this.elements.errorOverlay.classList.add('hidden');
      }, 5000);
    }
  }

  // Ukrycie błędu
  hideError() {
    if (this.elements.errorOverlay) {
      this.elements.errorOverlay.classList.add('hidden');
    }
  }

  // Ładowanie modelu ze ścieżki
  async loadModelFromPath(path) {
    try {
      console.log(
        'ModelManager: Rozpoczynam ładowanie modelu ze ścieżki:',
        path
      );

      if (!path) {
        throw new Error('Ścieżka do modelu nie może być pusta');
      }

      // Resetuj skalę sceny przed załadowaniem nowego modelu
      this.resetSceneScale();
      console.log('ModelManager: Skala sceny została zresetowana');

      // Usuń wszystkie modele
      this.clearAllModels();
      console.log('ModelManager: Usunięto wszystkie modele');

      // Wyodrębnij katalog z pełnej ścieżki
      const modelDir = path.substring(0, path.lastIndexOf('/') + 1);
      const modelFile = path.substring(path.lastIndexOf('/') + 1);
      const modelId = path.split('/').slice(-2)[0]; // Pobierz nazwę folderu jako id

      if (!modelFile) {
        throw new Error('Nieprawidłowa nazwa pliku modelu');
      }

      console.log('ModelManager: Katalog modelu:', modelDir);
      console.log('ModelManager: Plik modelu:', modelFile);
      console.log('ModelManager: ID modelu:', modelId);

      // Wczytaj konfigurację modelu
      console.log('ModelManager: Wczytywanie konfiguracji modelu...');
      const config = await this.loadModelConfig(modelDir);
      console.log('ModelManager: Konfiguracja modelu:', config);

      // Ustaw ścieżkę dla loadera
      this.loader.setPath(modelDir);
      console.log('ModelManager: Ustawiono ścieżkę dla loadera:', modelDir);

      // Wczytaj model
      console.log('ModelManager: Rozpoczynam ładowanie pliku:', modelFile);
      const gltf = await this.loader.loadAsync(modelFile);

      if (!gltf || !gltf.scene) {
        throw new Error('Nieprawidłowy format modelu GLTF');
      }

      console.log('ModelManager: Model załadowany pomyślnie:', gltf);

      // Ustaw id modelu
      gltf.scene.userData.id = modelId;

      // Zastosuj konfigurację do modelu
      if (config) {
        console.log('ModelManager: Stosowanie konfiguracji do modelu...');
        this.applyModelConfig(gltf.scene, config);
      }

      // Dodaj model do sceny i zaktualizuj stan
      this.addModelToScene(gltf.scene);
      console.log('ModelManager: Model dodany do sceny');

      // Wycentruj kamerę na modelu
      this.centerCameraOnModel(gltf.scene);
      console.log('ModelManager: Kamera wycentrowana na modelu');

      // Emituj zdarzenie o wczytaniu modelu
      const event = new CustomEvent('modelLoaded', {
        detail: {
          model: gltf.scene,
          animations: gltf.animations,
          uuid: modelId,
          path: path,
        },
      });
      document.dispatchEvent(event);
      console.log('ModelManager: Zdarzenie modelLoaded wyemitowane');

      return gltf;
    } catch (error) {
      console.error('ModelManager: Błąd podczas wczytywania modelu:', error);
      console.error('ModelManager: Szczegóły błędu:', error.message);
      console.error('ModelManager: Stack trace:', error.stack);

      // Emituj zdarzenie błędu
      const errorEvent = new CustomEvent('modelLoadError', {
        detail: {
          error: error.message,
          path: path,
        },
      });
      document.dispatchEvent(errorEvent);

      throw error;
    }
  }

  // Ładowanie domyślnego modelu
  async loadDefaultModel() {
    try {
      console.log('ModelManager: Rozpoczynam ładowanie domyślnego modelu...');
      console.log('ModelManager: Pobieram index.json...');
      const response = await fetch('/public/models/index.json');
      console.log('ModelManager: Status odpowiedzi:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const modelsIndex = await response.json();
      console.log('ModelManager: Index.json załadowany:', modelsIndex);

      const defaultModelName = modelsIndex.default_model;
      console.log('ModelManager: Domyślny model:', defaultModelName);

      if (!defaultModelName) {
        console.warn('ModelManager: Brak domyślnego modelu w index.json');
        return;
      }

      const modelInfo = modelsIndex[defaultModelName];
      console.log('ModelManager: Informacje o modelu:', modelInfo);

      if (
        !modelInfo ||
        !modelInfo.gltf_files ||
        modelInfo.gltf_files.length === 0
      ) {
        console.warn('ModelManager: Brak informacji o domyślnym modelu');
        return;
      }

      const modelPath = `/public/models/${defaultModelName}/${modelInfo.gltf_files[0]}`;
      console.log('ModelManager: Pełna ścieżka do modelu:', modelPath);

      this.showLoading();
      console.log('ModelManager: Rozpoczynam ładowanie modelu...');
      await this.loadModelFromPath(modelPath);
      this.hideLoading();
      console.log('ModelManager: Domyślny model załadowany pomyślnie');
    } catch (error) {
      console.error(
        'ModelManager: Błąd podczas ładowania domyślnego modelu:',
        error
      );
      console.error('ModelManager: Szczegóły błędu:', error.message);
      console.error('ModelManager: Stack trace:', error.stack);
      this.showError(error);
      this.hideLoading();
    }
  }

  // Wczytywanie konfiguracji modelu
  async loadModelConfig(modelDir) {
    try {
      const response = await fetch(`${modelDir}config.json`);
      const config = await response.json();
      return config;
    } catch (error) {
      console.warn(
        'ModelManager: Nie można wczytać konfiguracji modelu:',
        error
      );
      return null;
    }
  }

  // Zastosowanie konfiguracji do modelu
  applyModelConfig(model, config) {
    if (!config) {
      return;
    }

    // Centrowanie modelu
    if (config.center) {
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());

      if (config.center.x) model.position.x = -center.x;
      if (config.center.y) model.position.y = -center.y;
      if (config.center.z) model.position.z = -center.z;
    }

    // Pozycjonowanie modelu
    if (config.position) {
      if (config.position.method === 'floor') {
        const box = new THREE.Box3().setFromObject(model);
        const minY = box.min.y;
        model.position.y +=
          -minY + (config.position.value || 0) + (config.position.yOffset || 0);
      }
    }

    // Skalowanie modelu
    if (config.scale) {
      if (config.scale.method === 'fixed' && config.scale.fixedScale) {
        model.scale.setScalar(config.scale.fixedScale);
      }
    }

    // Rotacja modelu
    if (config.rotation) {
      model.rotation.x = THREE.MathUtils.degToRad(config.rotation.x || 0);
      model.rotation.y = THREE.MathUtils.degToRad(config.rotation.y || 0);
      model.rotation.z = THREE.MathUtils.degToRad(config.rotation.z || 0);
    }
  }

  // Wycentruj kamerę na modelu
  centerCameraOnModel(model) {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDimension = Math.max(size.x, size.y, size.z);
    const padding = maxDimension * 0.1; // Dodajemy 10% padding

    const newPosition = new THREE.Vector3(
      center.x,
      center.y + size.y / 2 + padding,
      center.z
    );

    this.camera.position.copy(newPosition);
    this.camera.lookAt(center);
  }

  // Resetowanie skali sceny
  resetSceneScale() {
    console.log('ModelManager: Resetowanie skali sceny');
    if (this.scene) {
      this.scene.scale.set(1, 1, 1);
      console.log('ModelManager: Skala sceny zresetowana do (1, 1, 1)');
    }
  }
}
