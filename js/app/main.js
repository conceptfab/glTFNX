// Pusty plik main.js

import * as THREE from 'three';
import { Scene } from 'three';
import { PerspectiveCamera } from 'three';
import { Light } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { ViewportGizmo } from 'three-viewport-gizmo';
import { debugManager } from './debug.js';
import { SceneBuilder } from './scene-builder.js';
import { ModelManager } from './model-manager.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import {
  getInitialProfiles,
  loadProfilesJson,
  loadProfiles,
} from './profile-validator.js';
import { UI } from './ui.js';
import { LightManager } from './light-manager.js';

// Podstawowe zmienne
let container, stats, controls;
let camera, scene, renderer;
let currentModel = null;
export let lightManager = null;
let currentProfileConfig = null;
let frameCount = 0;
let sceneElements = null;
let sceneBuilder = null;
let modelManager = null;
let gizmo;
let availableProfiles = null;
let performanceProfile = null;
let sceneProfile = null;
let grid = null;

// Stan aplikacji
let isLightingVisible = false;
let isAxisVisible = false;
let isBoundingBoxVisible = false;
let isStatsVisible = false;
let isFloorVisible = false;
let isGridVisible = false;
let boundingBoxHelper = null;
let currentCameraConfig = null;
let floor = null;
let axis = null;

// Zmienne dla UI
let isSidePanelVisible = true;
let isBottomBarContentVisible = false;
let ui = null;

// Funkcja do przełączania widoków kamery
function setCameraView(view) {
  if (!camera || !controls) return;

  const defaultPosition = new THREE.Vector3(50, 5, 0);
  const defaultTarget = new THREE.Vector3(0, 5, 0);

  switch (view) {
    case 'default':
      camera.position.copy(defaultPosition);
      controls.target.copy(defaultTarget);
      break;
    case 'back':
      camera.position.set(-50, 5, 0);
      controls.target.copy(defaultTarget);
      break;
    case 'top':
      camera.position.set(0, 50, 0);
      controls.target.copy(defaultTarget);
      break;
  }

  controls.update();
}

// Funkcja do aktualizacji stanu przycisków kamery
function updateCameraButtons(activeView) {
  const views = ['default', 'back', 'top'];
  views.forEach((view) => {
    const button = document.getElementById(`${view}View`);
    if (button) {
      if (view === activeView) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    }
  });
}

// Inicjalizacja obsługi zdarzeń dla przycisków kamery
function initCameraButtons() {
  const views = ['default', 'back', 'top'];
  views.forEach((view) => {
    const button = document.getElementById(`${view}View`);
    if (button) {
      button.addEventListener('click', () => {
        setCameraView(view);
        updateCameraButtons(view);
      });
    }
  });
}

// Funkcja do aktualizacji progress baru
function updateProgress(progress, message) {
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }

  if (progressText) {
    progressText.textContent = message || `Ładowanie: ${progress}%`;
  }

  if (progress >= 100) {
    setTimeout(() => {
      progressBar.style.display = 'none';
      progressText.style.display = 'none';
    }, 500);
  }
}

// Obsługa zdarzeń dla panelu profili
function initProfilePanelEvents() {
  const applyButton = document.querySelector('.apply-button');
  const cancelButton = document.querySelector('.cancel-button');

  if (applyButton) {
    applyButton.addEventListener('click', async () => {
      try {
        const selectedPerformanceProfile = document.getElementById(
          'performance-profile-select'
        ).value;
        const selectedSceneProfile = document.getElementById(
          'scene-profile-select'
        ).value;

        console.log('Zastosowywanie nowych profili:', {
          performance: selectedPerformanceProfile,
          scene: selectedSceneProfile,
        });

        // Załaduj nowe profile
        const newProfiles = await loadProfiles({
          performanceProfile: selectedPerformanceProfile,
          sceneProfile: selectedSceneProfile,
        });

        // Zastosuj nowe profile
        await setupScene(
          newProfiles.performanceProfile,
          newProfiles.sceneProfile
        );

        // Aktualizuj zmienne globalne
        performanceProfile = newProfiles.performanceProfile;
        sceneProfile = newProfiles.sceneProfile;

        // Aktualizuj panel debug
        if (debugManager) {
          debugManager.updateRenderInfo(
            performanceProfile.renderer,
            scene,
            camera,
            performanceProfile,
            sceneProfile
          );
        }

        showNotification('Profile zostały zaktualizowane', 3000, 'success');
      } catch (error) {
        console.error('Błąd podczas aktualizacji profili:', error);
        showNotification(
          'Błąd podczas aktualizacji profili: ' + error.message,
          5000,
          'error'
        );
      }
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      // Przywróć poprzednie wartości w selectach
      updateProfilesList();
      showNotification('Zmiany zostały anulowane', 3000, 'info');
    });
  }
}

// Inicjalizacja aplikacji
async function init() {
  try {
    updateProgress(10, 'Rozpoczynanie inicjalizacji...');

    // 1. Wczytaj dostępne profile
    availableProfiles = await loadProfilesJson();
    console.log('Wczytane profile:', availableProfiles);

    // 2. Inicjalizacja profili
    const profiles = await getInitialProfiles();
    performanceProfile = profiles.performanceProfile;
    sceneProfile = profiles.sceneProfile;
    console.log('Zainicjalizowane profile:', {
      performanceProfile,
      sceneProfile,
    });

    // 3. Inicjalizacja podstawowych komponentów (kontener, DOM)
    const basicComponentsInitialized = await initBasicComponents();
    if (!basicComponentsInitialized) {
      throw new Error('Nie udało się zainicjalizować podstawowych komponentów');
    }
    updateProgress(20, 'Podstawowe komponenty zainicjalizowane');

    // 4. Inicjalizacja SceneBuilder i konfiguracja sceny
    await initSceneBuilder();
    console.log('✓ SceneBuilder zainicjalizowany');
    updateProgress(30, 'SceneBuilder zainicjalizowany');

    // Inicjalizacja sceny startowej
    await sceneBuilder.initStartScene();
    console.log('✓ Scena startowa zainicjalizowana');
    updateProgress(35, 'Scena startowa zainicjalizowana');

    // Inicjalizacja ModelManager
    console.log('Inicjalizacja ModelManager...');
    modelManager = new ModelManager(scene);
    if (!modelManager) {
      throw new Error('Nie udało się zainicjalizować ModelManager');
    }
    updateProgress(40, 'ModelManager zainicjalizowany');

    // Inicjalizacja UI
    ui = new UI();
    await ui.init();
    updateProgress(45, 'UI zainicjalizowane');

    // Inicjalizacja przycisków kamery
    initCameraButtons();
    updateProgress(50, 'Przyciski kamery zainicjalizowane');

    // Obsługa zdarzenia wczytywania modelu
    document.addEventListener('modelLoadRequested', async (event) => {
      try {
        console.log('Main: Otrzymano zdarzenie modelLoadRequested');
        const model = event.detail;
        console.log('Main: Dane modelu:', model);

        if (!modelManager) {
          console.error('Main: ModelManager nie jest zainicjalizowany');
          showNotification('Błąd: ModelManager nie jest gotowy', 5000, 'error');
          return;
        }

        if (modelManager.getCurrentModel()) {
          console.log('Main: Usuwanie poprzedniego modelu');
          modelManager.clearAllModels();
        }

        // Załaduj nowy model
        console.log('Main: Rozpoczynam ładowanie nowego modelu');
        await modelManager.loadModelFromPath(model.path);
        // Aktualizuj listę modeli
        console.log('Main: Aktualizacja listy modeli w UI');
        ui.updateModelsList();
        console.log('Main: Model załadowany pomyślnie');
      } catch (error) {
        console.error('Main: Błąd podczas wczytywania modelu:', error);
        showNotification(
          'Błąd podczas wczytywania modelu: ' + error.message,
          5000,
          'error'
        );
      }
    });

    // Obsługa zdarzenia błędu ładowania modelu
    document.addEventListener('modelLoadError', (event) => {
      const error = event.detail.error;
      const model = event.detail.model;
      console.error('Main: Błąd ładowania modelu:', error);
      showNotification(
        `Błąd ładowania modelu ${model?.name || ''}: ${error}`,
        5000,
        'error'
      );
    });

    // Aktualizuj listę profili w UI
    updateProfilesList();

    // Inicjalizacja obsługi zdarzeń dla panelu profili
    initProfilePanelEvents();

    // Konfiguracja kontroli kamery
    console.log('Konfiguracja kontroli kamery...');
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI;
    console.log('✓ Kontrola kamery skonfigurowana');
    updateProgress(55, 'Kontrola kamery skonfigurowana');

    // 3. Inicjalizacja debuggera
    if (debugManager) {
      debugManager.setScene(scene);
      debugManager.setCamera(camera);
      debugManager.setRenderer(renderer);
      debugManager.setControls(controls);
      debugManager.setStats(stats);
      debugManager.setModelManager(modelManager);
      debugManager.setSceneBuilder(sceneBuilder);
      await debugManager.init();

      // Aktualizuj panel debug po inicjalizacji
      debugManager.updateRenderInfo(
        performanceProfile.renderer,
        scene,
        camera,
        performanceProfile,
        sceneProfile
      );
    }
    updateProgress(60, 'DebugManager zainicjalizowany');

    // Inicjalizacja ViewportGizmo
    gizmo = new ViewportGizmo(camera, renderer);
    gizmo.attachControls(controls);

    // Konfiguracja shadowMap
    if (performanceProfile?.renderer?.shadowMap?.enabled === true) {
      renderer.shadowMap.enabled = true;

      // Lepsza obsługa typu mapy cieni
      const shadowMapType = performanceProfile.renderer.shadowMap.type;
      console.log('Próba ustawienia shadowMap.type:', shadowMapType);

      // Sprawdź czy wartość istnieje w THREE.js
      const validShadowMapTypes = [
        'BasicShadowMap',
        'PCFShadowMap',
        'PCFSoftShadowMap',
        'VSMShadowMap',
      ];
      if (
        typeof shadowMapType === 'string' &&
        validShadowMapTypes.includes(shadowMapType)
      ) {
        if (THREE[shadowMapType]) {
          renderer.shadowMap.type = THREE[shadowMapType];
          console.log('Ustawiono typ mapy cieni:', shadowMapType);
        } else {
          console.warn(
            'Typ mapy cieni nie istnieje w THREE.js:',
            shadowMapType,
            'używam PCFShadowMap'
          );
          renderer.shadowMap.type = THREE.PCFShadowMap;
        }
      } else {
        console.warn(
          'Nieznany typ mapy cieni:',
          shadowMapType,
          'używam PCFShadowMap'
        );
        renderer.shadowMap.type = THREE.PCFShadowMap;
      }

      // Inicjalizacja mapSize jeśli nie istnieje
      if (!renderer.shadowMap.mapSize) {
        renderer.shadowMap.mapSize = new THREE.Vector2();
      }

      renderer.shadowMap.mapSize.width =
        performanceProfile.renderer.shadowMap.mapSize?.width || 1024;
      renderer.shadowMap.mapSize.height =
        performanceProfile.renderer.shadowMap.mapSize?.height || 1024;
      renderer.shadowMap.blurSamples =
        performanceProfile.renderer.shadowMap.blurSamples || 4;
      renderer.shadowMap.bias =
        performanceProfile.renderer.shadowMap.bias || 0.0001;
      renderer.shadowMap.radius =
        performanceProfile.renderer.shadowMap.radius || 1.0;
    } else {
      renderer.shadowMap.enabled = false;
    }

    // Konfiguracja tone mapping
    const toneMapping = performanceProfile?.renderer?.toneMapping;
    console.log('Próba ustawienia toneMapping:', toneMapping);

    // Sprawdź czy wartość istnieje w THREE.js
    const validToneMappingTypes = [
      'NoToneMapping',
      'LinearToneMapping',
      'ReinhardToneMapping',
      'CineonToneMapping',
      'ACESFilmicToneMapping',
      'AgXToneMapping',
      'NeutralToneMapping',
      'CustomToneMapping',
    ];

    // Implementacja CustomToneMapping z algorytmem Uncharted2
    THREE.ShaderChunk.tonemapping_pars_fragment =
      THREE.ShaderChunk.tonemapping_pars_fragment.replace(
        'vec3 CustomToneMapping( vec3 color ) { return color; }',
        `#define Uncharted2Helper( x ) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )
      float toneMappingWhitePoint = 1.0;
      vec3 CustomToneMapping( vec3 color ) {
        color *= toneMappingExposure;
        return saturate( Uncharted2Helper( color ) / Uncharted2Helper( vec3( toneMappingWhitePoint ) ) );
      }`
      );

    if (
      typeof toneMapping === 'string' &&
      validToneMappingTypes.includes(toneMapping)
    ) {
      if (THREE[toneMapping]) {
        renderer.toneMapping = THREE[toneMapping];
        console.log('Ustawiono tone mapping:', toneMapping);
      } else {
        console.warn(
          'Typ tone mappingu nie istnieje w THREE.js:',
          toneMapping,
          'używam LinearToneMapping'
        );
        renderer.toneMapping = THREE.LinearToneMapping;
      }
    } else {
      console.warn(
        'Nieznany typ tone mappingu:',
        toneMapping,
        'używam LinearToneMapping'
      );
      renderer.toneMapping = THREE.LinearToneMapping;
    }

    renderer.toneMappingExposure =
      performanceProfile?.renderer?.toneMappingExposure || 1.0;

    // Obsługa output encoding
    const outputColorSpace = performanceProfile.renderer.outputColorSpace;
    if (outputColorSpace) {
      renderer.outputColorSpace = outputColorSpace;
      console.log('Ustawiono output color space:', outputColorSpace);
    } else {
      console.warn(
        'Nieznany lub niezdefiniowany typ output color space:',
        outputColorSpace,
        'używam srgb'
      );
      renderer.outputColorSpace = 'srgb';
    }

    // Ustawiamy inne parametry renderera
    renderer.physicallyCorrectLights =
      performanceProfile?.renderer?.physicallyCorrectLights || false;
    renderer.logarithmicDepthBuffer =
      performanceProfile?.renderer?.logarithmicDepthBuffer || false;
    renderer.precision = performanceProfile?.renderer?.precision || 'highp';
    renderer.powerPreference =
      performanceProfile?.renderer?.powerPreference || 'default';
    renderer.stencil = performanceProfile?.renderer?.stencil || false;
    renderer.failIfMajorPerformanceCaveat =
      performanceProfile?.renderer?.failIfMajorPerformanceCaveat || false;
    renderer.depth = performanceProfile?.renderer?.depth || true;
    renderer.premultipliedAlpha =
      performanceProfile?.renderer?.premultipliedAlpha || true;
    renderer.preserveDrawingBuffer =
      performanceProfile?.renderer?.preserveDrawingBuffer || false;
    renderer.xrCompatible = performanceProfile?.renderer?.xrCompatible || false;
    renderer.autoClear = performanceProfile?.renderer?.autoClear || true;
    renderer.alpha = performanceProfile?.renderer?.alpha || false;

    // Inicjalizacja LightManager
    lightManager = new LightManager(scene);
    console.log('✓ LightManager zainicjalizowany');
    updateProgress(65, 'LightManager zainicjalizowany');

    // Statystyki
    stats = new Stats();
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '0';
    stats.dom.style.left = '0';
    stats.dom.style.display = 'none';
    container.appendChild(stats.dom);
    updateProgress(70, 'Statystyki skonfigurowane');

    // Obsługa zmiany rozmiaru
    window.addEventListener('resize', onWindowResize);
    updateProgress(75, 'Obsługa zmiany rozmiaru dodana');

    // Wczytanie profili
    try {
      const profiles = await getInitialProfiles();
      performanceProfile = profiles.performanceProfile;
      sceneProfile = profiles.sceneProfile;

      // Zastosuj parametry renderera z profilu wydajności
      if (performanceProfile?.renderer) {
        const rendererParams = performanceProfile.renderer;

        // Aktualizacja parametrów renderera
        renderer.setPixelRatio(rendererParams.pixelRatio);

        if (rendererParams.physicallyCorrectLights !== undefined) {
          renderer.physicallyCorrectLights =
            rendererParams.physicallyCorrectLights;
        }

        if (rendererParams.outputColorSpace) {
          renderer.outputColorSpace = rendererParams.outputColorSpace;
        }

        if (rendererParams.toneMapping) {
          renderer.toneMapping = THREE[rendererParams.toneMapping];
        }

        if (rendererParams.toneMappingExposure !== undefined) {
          renderer.toneMappingExposure = rendererParams.toneMappingExposure;
        }

        // Aktualizacja parametrów cieni
        if (rendererParams.shadowMap) {
          renderer.shadowMap.enabled = rendererParams.shadowMap.enabled;
          if (rendererParams.shadowMap.type) {
            renderer.shadowMap.type = THREE[rendererParams.shadowMap.type];
          }
          if (rendererParams.shadowMap.mapSize && renderer.shadowMap.mapSize) {
            renderer.shadowMap.mapSize.width =
              rendererParams.shadowMap.mapSize.width;
            renderer.shadowMap.mapSize.height =
              rendererParams.shadowMap.mapSize.height;
          }
          if (rendererParams.shadowMap.blurSamples !== undefined) {
            renderer.shadowMap.blurSamples =
              rendererParams.shadowMap.blurSamples;
          }
          if (rendererParams.shadowMap.bias !== undefined) {
            renderer.shadowMap.bias = rendererParams.shadowMap.bias;
          }
          if (rendererParams.shadowMap.radius !== undefined) {
            renderer.shadowMap.radius = rendererParams.shadowMap.radius;
          }
        }
      }

      setupScene(performanceProfile, sceneProfile);
      updateProgress(80, 'Profile wczytane i zastosowane');

      // Aktualizuj listę profili po wczytaniu
      updateProfilesList();

      // Rozpocznij pętlę renderowania
      animate();
      console.log('✓ Pętla renderowania rozpoczęta');
      updateProgress(100, 'Inicjalizacja zakończona');

      return true;
    } catch (error) {
      console.error('Błąd podczas wczytywania profili:', error);
      createDefaultElements();
      return false;
    }
  } catch (error) {
    console.error('Błąd podczas inicjalizacji:', error);
    updateProgress(100, 'Błąd podczas inicjalizacji');
    return false;
  }
}

// 1. Inicjalizacja podstawowych komponentów
async function initBasicComponents() {
  try {
    console.log('Inicjalizacja podstawowych komponentów...');

    // Sprawdź czy THREE jest zainicjalizowany
    if (!THREE) {
      console.error('THREE nie jest zainicjalizowany');
      throw new Error('THREE nie jest zainicjalizowany');
    }

    console.log('THREE jest zainicjalizowany:', {
      Scene: !!THREE.Scene,
      PerspectiveCamera: !!THREE.PerspectiveCamera,
      Light: !!THREE.Light,
    });

    if (!THREE.Scene || !THREE.PerspectiveCamera || !THREE.Light) {
      console.error('Brakujące komponenty THREE:', {
        Scene: !THREE.Scene,
        PerspectiveCamera: !THREE.PerspectiveCamera,
        Light: !THREE.Light,
      });
      throw new Error('Brakujące komponenty THREE');
    }

    // Inicjalizacja kontenera
    container = document.getElementById('container');
    if (!container) {
      throw new Error('Nie znaleziono kontenera');
    }

    // Inicjalizacja sceny
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    // Inicjalizacja kamery
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(50, 5, 0);

    // Inicjalizacja renderera
    renderer = new THREE.WebGLRenderer({
      antialias: performanceProfile?.renderer?.antialias || false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Konfiguracja renderera na podstawie profilu wydajności
    if (performanceProfile?.renderer) {
      const rendererParams = performanceProfile.renderer;

      // Aktualizacja parametrów renderera
      renderer.setPixelRatio(rendererParams.pixelRatio);

      if (rendererParams.physicallyCorrectLights !== undefined) {
        renderer.physicallyCorrectLights =
          rendererParams.physicallyCorrectLights;
      }

      if (rendererParams.outputColorSpace) {
        renderer.outputColorSpace = rendererParams.outputColorSpace;
      }

      // Konfiguracja tone mapping
      const toneMapping = rendererParams.toneMapping;
      console.log('Próba ustawienia toneMapping:', toneMapping);

      // Sprawdź czy wartość istnieje w THREE.js
      const validToneMappingTypes = [
        'NoToneMapping',
        'LinearToneMapping',
        'ReinhardToneMapping',
        'CineonToneMapping',
        'ACESFilmicToneMapping',
        'AgXToneMapping',
        'NeutralToneMapping',
        'CustomToneMapping',
      ];

      // Implementacja CustomToneMapping z algorytmem Uncharted2
      THREE.ShaderChunk.tonemapping_pars_fragment =
        THREE.ShaderChunk.tonemapping_pars_fragment.replace(
          'vec3 CustomToneMapping( vec3 color ) { return color; }',
          `#define Uncharted2Helper( x ) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )
        float toneMappingWhitePoint = 1.0;
        vec3 CustomToneMapping( vec3 color ) {
          color *= toneMappingExposure;
          return saturate( Uncharted2Helper( color ) / Uncharted2Helper( vec3( toneMappingWhitePoint ) ) );
        }`
        );

      if (
        typeof toneMapping === 'string' &&
        validToneMappingTypes.includes(toneMapping)
      ) {
        if (THREE[toneMapping]) {
          renderer.toneMapping = THREE[toneMapping];
          console.log('Ustawiono tone mapping:', toneMapping);
        } else {
          console.warn(
            'Typ tone mappingu nie istnieje w THREE.js:',
            toneMapping,
            'używam LinearToneMapping'
          );
          renderer.toneMapping = THREE.LinearToneMapping;
        }
      } else {
        console.warn(
          'Nieznany typ tone mappingu:',
          toneMapping,
          'używam LinearToneMapping'
        );
        renderer.toneMapping = THREE.LinearToneMapping;
      }

      renderer.toneMappingExposure = rendererParams.toneMappingExposure || 1.0;

      // Konfiguracja output encoding
      const outputEncoding = rendererParams.outputEncoding;
      console.log('Próba ustawienia outputEncoding:', outputEncoding);

      // Używamy tylko nowego systemu outputColorSpace
      const encodingMap = {
        LinearEncoding: 'linear-srgb',
        sRGBEncoding: 'srgb',
        GammaEncoding: 'srgb',
        RGBEEncoding: 'srgb',
        LogLuvEncoding: 'srgb',
        RGBM7Encoding: 'srgb',
        RGBM16Encoding: 'srgb',
        RGBDEncoding: 'srgb',
        BasicDepthPacking: 'srgb',
        RGBADepthPacking: 'srgb',
      };

      const colorSpace = encodingMap[outputEncoding] || 'srgb';
      renderer.outputColorSpace = colorSpace;
      console.log('Ustawiono output color space:', colorSpace);

      // Konfiguracja output color space
      const outputColorSpace = rendererParams.outputColorSpace;
      console.log('Próba ustawienia outputColorSpace:', outputColorSpace);

      // Sprawdź czy wartość jest poprawna
      const validColorSpaces = ['srgb', 'srgb-linear', 'display-p3', 'rec709'];
      if (
        typeof outputColorSpace === 'string' &&
        validColorSpaces.includes(outputColorSpace.toLowerCase())
      ) {
        renderer.outputColorSpace = outputColorSpace;
        console.log('Ustawiono output color space:', outputColorSpace);
      } else {
        console.warn(
          'Nieznany output color space:',
          outputColorSpace,
          'używam srgb'
        );
        renderer.outputColorSpace = 'srgb';
      }
    }

    return true;
  } catch (error) {
    console.error(
      'Błąd podczas inicjalizacji podstawowych komponentów:',
      error
    );
    throw error;
  }
}

// 2. Inicjalizacja SceneBuilder
function initSceneBuilder() {
  try {
    console.log('Tworzenie instancji SceneBuilder...');
    sceneBuilder = new SceneBuilder({
      scene: scene,
      renderer: renderer,
      camera: camera,
      showLoading: (message) => {
        console.log('SceneBuilder - Loading:', message);
        showNotification(message, 5000, 'info');
      },
      hideLoading: () => {
        console.log('SceneBuilder - Loading hidden');
        hideNotification();
      },
      showError: (message) => {
        console.error('SceneBuilder - Error:', message);
        showNotification(message, 10000, 'error');
      },
    });

    // Ustawienie walidatora profili
    sceneBuilder.setProfileValidator({
      loadProfiles: async ({ performanceProfile, sceneProfile }) => {
        try {
          const profiles = await loadProfilesJson();
          return {
            performanceProfile: profiles.profiles.find(
              (p) => p.id === performanceProfile
            ),
            sceneProfile: profiles.profiles.find((p) => p.id === sceneProfile),
          };
        } catch (error) {
          console.error('Błąd podczas ładowania profili:', error);
          throw error;
        }
      },
    });

    return true;
  } catch (error) {
    console.error('Błąd podczas inicjalizacji SceneBuilder:', error);
    return false;
  }
}

// Obsługa zmiany rozmiaru okna
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (gizmo) {
    gizmo.update();
  }

  // Aktualizuj panel debug po zmianie rozmiaru okna
  if (debugManager) {
    debugManager.updateRenderInfo(
      performanceProfile.renderer,
      scene,
      camera,
      performanceProfile,
      sceneProfile
    );
  }
}

// Animacja
function animate() {
  requestAnimationFrame(animate);

  // Aktualizacja oświetlenia środowiskowego
  if (sceneElements && sceneElements.environment) {
    sceneElements.environment.update();
  }

  controls.update();
  renderer.render(scene, camera);
  if (gizmo) {
    gizmo.render();
  }

  // Aktualizacja statystyk
  if (stats && isStatsVisible) {
    stats.update();
  }
}

// Konfiguracja sceny na podstawie profili
function setupScene(performanceProfile, sceneProfile) {
  // Aktualizacja ustawień renderera
  if (performanceProfile?.renderer) {
    renderer.setPixelRatio(performanceProfile.renderer.pixelRatio || 1.0);
    renderer.shadowMap.enabled =
      performanceProfile.renderer.shadowMap?.enabled || false;
    renderer.shadowMap.type =
      performanceProfile.renderer.shadowMap?.type || THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights =
      performanceProfile.renderer.physicallyCorrectLights || false;
    renderer.logarithmicDepthBuffer =
      performanceProfile.renderer.logarithmicDepthBuffer || false;

    // Obsługa tone mappingu
    const toneMappingType = performanceProfile.renderer.toneMapping;
    if (toneMappingType && THREE[toneMappingType]) {
      renderer.toneMapping = THREE[toneMappingType];
      console.log('Ustawiono tone mapping:', toneMappingType);
    } else {
      console.warn(
        'Nieznany lub niezdefiniowany typ tone mappingu:',
        toneMappingType,
        'używam LinearToneMapping'
      );
      renderer.toneMapping = THREE.LinearToneMapping;
    }

    renderer.toneMappingExposure =
      performanceProfile.renderer.toneMappingExposure || 1.0;

    // Obsługa output encoding
    const outputColorSpace = performanceProfile.renderer.outputColorSpace;
    if (outputColorSpace) {
      renderer.outputColorSpace = outputColorSpace;
      console.log('Ustawiono output color space:', outputColorSpace);
    } else {
      console.warn(
        'Nieznany lub niezdefiniowany typ output color space:',
        outputColorSpace,
        'używam srgb'
      );
      renderer.outputColorSpace = 'srgb';
    }
  }

  // Ustawienie koloru tła
  if (sceneProfile?.background?.color) {
    scene.background = new THREE.Color(sceneProfile.background.color);
    console.log('Ustawiono kolor tła:', scene.background);
  }

  // Utworzenie osi
  createAxis(sceneProfile);

  // Utworzenie siatki
  createGrid(sceneProfile);

  // Utworzenie podłogi
  createFloor(sceneProfile);

  // Inicjalizacja świateł z profilu
  if (lightManager) {
    lightManager.initFromProfile(sceneProfile);
    console.log('✓ Światła zainicjalizowane z profilu');
  }

  // Aktualizuj panel debug po zmianie sceny
  if (debugManager) {
    debugManager.updateRenderInfo(
      performanceProfile.renderer,
      scene,
      camera,
      performanceProfile,
      sceneProfile
    );
  }
}

// Utworzenie elementów domyślnych
function createDefaultElements() {
  // Domyślna os
  createAxis();

  // Domyślna siatka
  createGrid();
}

// Utworzenie osi
function createAxis(config = null) {
  const axisLength = config?.axis?.length || 5;
  axis = new THREE.AxesHelper(axisLength);
  axis.visible = config?.axis?.visible || false;
  scene.add(axis);
  isAxisVisible = axis.visible;
}

// Utworzenie siatki
function createGrid(config = null) {
  const size = config?.grid?.size || 125;
  const divisions = config?.grid?.divisions || 25;
  grid = new THREE.GridHelper(size, divisions);
  grid.visible = config?.grid?.visible || false;
  scene.add(grid);
  isGridVisible = grid.visible;
}

// Utworzenie podłogi
function createFloor(config = null) {
  if (!config?.floor) return;

  const size = config.floor.size || 125;
  const segments = config.floor.segments || 128;

  // Utworzenie geometrii i materiału
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);

  let material;
  if (config.floor.material) {
    const matConfig = config.floor.material;
    material = new THREE.MeshPhysicalMaterial({
      color: matConfig.color ? new THREE.Color(matConfig.color) : 0x808080,
      metalness: matConfig.metalness || 0,
      roughness: matConfig.roughness || 1,
      transparent: matConfig.transparent || false,
      opacity: matConfig.opacity || 1,
    });
  } else {
    material = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 1,
    });
  }

  floor = new THREE.Mesh(geometry, material);
  floor.rotation.x = -Math.PI / 2; // Poziomo
  floor.receiveShadow = true;
  floor.visible = config.floor.visible || false;
  scene.add(floor);
  isFloorVisible = floor.visible;
}

// Aktualizacja listy profili w UI
function updateProfilesList() {
  try {
    const performanceProfileSelect = document.getElementById(
      'performance-profile-select'
    );
    const sceneProfileSelect = document.getElementById('scene-profile-select');

    if (!performanceProfileSelect || !sceneProfileSelect) {
      console.warn('Nie znaleziono elementów select dla profili');
      return;
    }

    // Czyszczenie istniejących opcji
    performanceProfileSelect.innerHTML = '';
    sceneProfileSelect.innerHTML = '';

    // Dodawanie opcji dla profili wydajności
    if (availableProfiles?.profiles) {
      const performanceProfiles = availableProfiles.profiles.filter(
        (p) => p.category === 'profile'
      );

      performanceProfiles.forEach((profile) => {
        const option = document.createElement('option');
        option.value = profile.id;
        option.textContent = profile.name;
        if (profile.id === performanceProfile?.id) {
          option.selected = true;
        }
        performanceProfileSelect.appendChild(option);
      });
    }

    // Dodawanie opcji dla profili sceny
    if (availableProfiles?.profiles) {
      const sceneProfiles = availableProfiles.profiles.filter(
        (p) => p.category === 'scene'
      );

      sceneProfiles.forEach((profile) => {
        const option = document.createElement('option');
        option.value = profile.id;
        option.textContent = profile.name;
        if (profile.id === sceneProfile?.id) {
          option.selected = true;
        }
        sceneProfileSelect.appendChild(option);
      });
    }

    console.log('Lista profili zaktualizowana pomyślnie');
  } catch (error) {
    console.error('Błąd podczas aktualizacji listy profili:', error);
  }
}

// Funkcje pomocnicze
function showNotification(message, duration = 10000, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, duration);
}

function hideNotification() {
  const notification = document.querySelector('.notification');
  if (notification) {
    notification.remove();
  }
}

// Funkcja do przełączania widoczności świateł
function toggleLighting() {
  if (lightManager) {
    lightManager.toggleLightVisibility();
    isLightingVisible = !isLightingVisible;
    console.log(
      `Widoczność świateł: ${isLightingVisible ? 'włączona' : 'wyłączona'}`
    );
  }
}

// Funkcja do dodawania światła
function addLight(type, options = {}) {
  if (!lightManager) return null;

  const light = lightManager.addLight(type, options);
  if (light) {
    console.log(`Dodano światło typu ${type}`);
  }
  return light;
}

// Funkcja do usuwania światła
function removeLight(light) {
  if (!lightManager) return;

  lightManager.removeLight(light);
  console.log('Usunięto światło');
}

// Funkcja do aktualizacji parametrów światła
function updateLight(light, params) {
  if (!lightManager) return;

  lightManager.updateLight(light, params);
  console.log('Zaktualizowano parametry światła');
}

// Rozpoczęcie inicjalizacji
let isInitialized = false;
if (!isInitialized) {
  init().then(() => {
    isInitialized = true;
  });
}
