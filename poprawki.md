Analiza kodu glTFNX
Przeprowadziłem szczegółową analizę kodu projektu glTFNX i znalazłem kilka obszarów wymagających optymalizacji. Poniżej przedstawiam zmiany, które warto wprowadzić, pogrupowane według plików.
Zmiany w pliku js/app/light-manager.js
markdownPlik: js/app/light-manager.js
Funkcja: parseColor

Problem: Funkcja parseColor nie obsługuje prawidłowo wszystkich formatów kolorów.
Proponowana zmiana:
javascript// Konwersja koloru z różnych formatów
parseColor(color) {
  if (typeof color === 'string') {
    // Obsługa formatów "#RRGGBB" i "RRGGBB"
    if (color.startsWith('#')) {
      return new THREE.Color(color);
    }
    return new THREE.Color(parseInt(color.replace('#', '0x'), 16));
  } else if (typeof color === 'number') {
    return new THREE.Color(color);
  }
  console.warn('Nierozpoznany format koloru:', color);
  return new THREE.Color(0xFFFFFF); // Domyślny kolor
}
Zmiany w pliku js/app/model-manager.js
markdownPlik: js/app/model-manager.js

Problem: Klasa zawiera funkcje, które powinny być obsługiwane przez SceneBuilder.
Proponowana zmiana: Usunąć nadmiarowe funkcje związane z zarządzaniem sceną i kamerą.
javascript// Usunąć te funkcje:
// 1. centerCameraOnModel(model)
// 2. animate()
// 3. initBasicComponents()

// Zmodyfikować konstruktor, usuwając inicjalizację sceny, kamery i renderera
constructor(scene) {
  console.log('📦 ModelManager: Inicjalizacja...');
  this.scene = scene;
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

  // Inicjalizacja event listenerów
  this.setupEventListeners();
  console.log('📦 ModelManager: Inicjalizacja zakończona');
}
Zmiany w pliku js/app/debug.js
markdownPlik: js/app/debug.js

Problem: Nadmiarowe funkcje i zbyt duży plik.
Proponowana zmiana: Podzielić na mniejsze komponenty.
javascript// Wydzielić funkcje do osobnych plików:
// 1. js/app/debug/DebugPanel.js - klasa obsługująca panel debugowania
// 2. js/app/debug/DebugLogger.js - klasa obsługująca logowanie
// 3. js/app/debug/DebugUtils.js - funkcje pomocnicze

// W głównym pliku zostawić tylko:
export class DebugManager {
  constructor() {
    this.isEnabled = false;
    this.logs = [];
    this.panel = new DebugPanel();
    this.logger = new DebugLogger();
    this.utils = new DebugUtils();
  }

  async init() {
    // Inicjalizacja debugowania
  }
  
  // Podstawowe metody
}

export const debugManager = new DebugManager();
Zmiany w pliku js/app/main.js
markdownPlik: js/app/main.js

Problem: Zbyt duży plik z mieszanką inicjalizacji, obsługi zdarzeń i logiki aplikacji.
Proponowana zmiana: Przenieść część funkcji do dedykowanych klas.
javascript// Przenieść funkcje związane z:
// 1. Inicjalizacją UI do UI.js
// 2. Obsługą profili do ProfileManager.js
// 3. Obsługą kamer do CameraManager.js

// Zostawić główną funkcję inicjalizacji:
async function init() {
  try {
    updateProgress(10, 'Rozpoczynanie inicjalizacji...');
    
    // 1. Inicjalizacja SceneBuilder
    sceneBuilder = new SceneBuilder();
    await sceneBuilder.init();
    
    // 2. Inicjalizacja ModelManager
    modelManager = new ModelManager(sceneBuilder.scene);
    
    // 3. Inicjalizacja UI
    ui = new UI();
    await ui.init();
    
    // 4. Wczytanie profili
    const profileManager = new ProfileManager();
    const profiles = await profileManager.getInitialProfiles();
    
    // 5. Konfiguracja i rozpoczęcie renderowania
    animate();
    
    updateProgress(100, 'Inicjalizacja zakończona');
    return true;
  } catch (error) {
    console.error('Błąd podczas inicjalizacji:', error);
    updateProgress(100, 'Błąd podczas inicjalizacji');
    return false;
  }
}
Zmiany w pliku js/app/scene-builder.js
markdownPlik: js/app/scene-builder.js

Problem: Duplikacja logiki i nadmiarowe funkcje.
Proponowana zmiana: Ujednolicić funkcje i uprościć inicjalizację.
javascriptasync configureScene(performanceProfile, sceneProfile) {
  if (!this.profileValidator) {
    throw new Error('ProfileValidator nie został zainicjalizowany');
  }

  // Sprawdź czy profile się zmieniły
  if (
    this.currentProfile?.id === performanceProfile?.id &&
    this.currentScene?.id === sceneProfile?.id
  ) {
    console.log('SceneBuilder: Profile nie uległy zmianie, pomijam konfigurację');
    return;
  }

  try {
    // Resetowanie sceny
    this.resetScene();
    
    // Konfiguracja renderera
    this.configureRenderer(performanceProfile);
    
    // Konfiguracja środowiska
    await this.configureEnvironment(sceneProfile);
    
    // Konfiguracja oświetlenia
    this.configureLighting(sceneProfile);
    
    // Konfiguracja postprocessingu
    this.configurePostprocessing(sceneProfile, performanceProfile);
    
    // Konfiguracja kamery i kontrolek
    this.configureCamera(sceneProfile);
    
    // Aktualizuj profile
    this.currentProfile = performanceProfile;
    this.currentScene = sceneProfile;
    
    console.log('✓ Scena skonfigurowana z profili');
  } catch (error) {
    console.error('Błąd podczas konfiguracji sceny:', error);
    throw error;
  }
}
Optymalizacja wydajności renderowania
markdownProblem: Brak optymalizacji renderowania dla różnych urządzeń.
Proponowana zmiana: Dodać adaptacyjną wydajność w zależności od sprzętu.
javascript// Nowy plik: js/app/performance-manager.js
export class PerformanceManager {
  constructor(sceneManager, profileValidator) {
    this.sceneManager = sceneManager;
    this.profileValidator = profileValidator;
    this.deviceInfo = null;
    this.fps = {
      current: 0,
      target: 60,
      samples: []
    };
  }

  async init() {
    this.deviceInfo = await this.detectDeviceCapabilities();
    this.adaptPerformance();
    this.startMonitoring();
  }

  adaptPerformance() {
    const { renderer } = this.sceneManager;
    const { pixelRatio } = window.devicePixelRatio;
    
    // Dostosowanie pikseli w zależności od wydajności
    if (this.deviceInfo.performanceCategory === 'low') {
      renderer.setPixelRatio(Math.min(pixelRatio, 1.0));
    } else if (this.deviceInfo.performanceCategory === 'medium') {
      renderer.setPixelRatio(Math.min(pixelRatio, 1.5));
    } else {
      renderer.setPixelRatio(pixelRatio);
    }
  }

  // Dynamiczna regulacja jakości podczas działania
  updatePerformanceSettings() {
    const avgFps = this.calculateAverageFps();
    
    if (avgFps < 30 && this.deviceInfo.performanceCategory !== 'low') {
      this.deviceInfo.performanceCategory = 'low';
      this.adaptPerformance();
    } else if (avgFps > 50 && this.deviceInfo.performanceCategory === 'low') {
      this.deviceInfo.performanceCategory = 'medium';
      this.adaptPerformance();
    }
  }
}
Optymalizacja ładowania zasobów
markdownProblem: Brak progresywnego ładowania tekstur i modeli.
Proponowana zmiana: Dodać system progresywnego ładowania.
javascript// Nowy plik: js/app/resource-loader.js
export class ResourceLoader {
  constructor() {
    this.loadingQueue = [];
    this.loadingInProgress = false;
    this.maxConcurrentLoads = 3;
    this.activeLoads = 0;
  }

  async loadTexture(url, priority = 1) {
    return new Promise((resolve, reject) => {
      this.loadingQueue.push({
        type: 'texture',
        url,
        priority,
        resolve,
        reject
      });
      this.processQueue();
    });
  }
  
  async loadModel(url, priority = 0) {
    return new Promise((resolve, reject) => {
      this.loadingQueue.push({
        type: 'model',
        url,
        priority: priority,
        resolve,
        reject
      });
      this.processQueue();
    });
  }
  
  processQueue() {
    if (this.loadingInProgress || this.loadingQueue.length === 0) return;
    
    this.loadingInProgress = true;
    
    // Sortuj kolejkę według priorytetu
    this.loadingQueue.sort((a, b) => b.priority - a.priority);
    
    // Wybierz zadania do wykonania
    while (this.activeLoads < this.maxConcurrentLoads && this.loadingQueue.length > 0) {
      const task = this.loadingQueue.shift();
      this.loadResource(task);
    }
  }
  
  async loadResource(task) {
    this.activeLoads++;
    
    try {
      let result;
      
      if (task.type === 'texture') {
        result = await this.loadTextureInternal(task.url);
      } else if (task.type === 'model') {
        result = await this.loadModelInternal(task.url);
      }
      
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    } finally {
      this.activeLoads--;
      
      if (this.activeLoads === 0 && this.loadingQueue.length === 0) {
        this.loadingInProgress = false;
      } else {
        this.processQueue();
      }
    }
  }
}
Podsumowanie proponowanych zmian:

Modularyzacja kodu: Podział dużych plików na mniejsze, bardziej specjalistyczne komponenty
Usunięcie duplikacji: Wyeliminowanie powielonych funkcji i logiki
Poprawa zarządzania zasobami: Wprowadzenie progresywnego ładowania
Optymalizacja wydajności: Dodanie adaptacyjnej jakości renderowania
Refaktoryzacja architektury: Wyraźne rozdzielenie odpowiedzialności między komponentami

Te zmiany znacząco poprawią czytelność kodu, wydajność aplikacji i ułatwią jej dalszy rozwój. Rekomendowane jest rozpoczęcie od modularyzacji kodu i usunięcia duplikacji, a następnie wprowadzenie optymalizacji związanych z wydajnością.