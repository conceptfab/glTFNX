import * as THREE from 'three';
import { Scene } from 'three';
import { PerspectiveCamera } from 'three';
import { Light } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { SceneBuilder } from './scene-builder.js';
import { ModelManager } from './model-manager.js';
import { DebugPanel } from './debug/DebugPanel.js';
import { lightManager } from './main.js';

// Klasa do debugowania aplikacji
export class DebugManager {
  constructor() {
    this.isEnabled = false;
    this.logs = [];
    this.cameraLoadData = {
      profileLoaded: false,
      sceneLoaded: false,
      profileCameraParams: null,
      actualCameraParams: null,
      timestamp: null,
    };
    this.state = {
      isDebugMode: false,
      isLightingVisible: false,
      isAxisVisible: false,
      isBoundingBoxVisible: false,
      isStatsVisible: false,
      isFloorVisible: false,
      isRenderInfoVisible: false,
      currentModel: null,
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      stats: null,
      modelManager: null,
      sceneBuilder: null,
    };
  }

  setRenderer(renderer) {
    this.state.renderer = renderer;
    console.log('DebugManager: Ustawiono renderer', {
      antialias: renderer.capabilities?.antialias,
      capabilities: renderer.capabilities,
    });
  }

  setScene(scene) {
    this.state.scene = scene;
    console.log('DebugManager: Ustawiono scene');
  }

  setCamera(camera) {
    this.state.camera = camera;
    console.log('DebugManager: Ustawiono camera');
  }

  setControls(controls) {
    this.state.controls = controls;
    console.log('DebugManager: Ustawiono controls');
  }

  setStats(stats) {
    this.state.stats = stats;
    console.log('DebugManager: Ustawiono stats');
  }

  setModelManager(modelManager) {
    this.state.modelManager = modelManager;
    console.log('DebugManager: Ustawiono modelManager');
  }

  setSceneBuilder(sceneBuilder) {
    this.state.sceneBuilder = sceneBuilder;
    console.log('DebugManager: Ustawiono sceneBuilder');
  }

  // Inicjalizacja debugowania
  async init() {
    try {
      console.log('DebugManager: Rozpoczęcie inicjalizacji');
      this.isEnabled = true;

      // Inicjalizacja UI
      await this.setupDebugUI();

      // Podpięcie listenerów
      this.attachDebugListeners();

      // Ustawienie domyślnych wartości
      this.setDefaultValues();

      console.log('DebugManager: Inicjalizacja zakończona pomyślnie');
    } catch (error) {
      console.error('DebugManager: Błąd podczas inicjalizacji:', error);
      this.showNotification(
        'Błąd podczas inicjalizacji debuggera',
        5000,
        'error'
      );
    }
  }

  // Ustawienie domyślnych wartości
  setDefaultValues() {
    // 1. Ustawienie widoczności
    this.state.isLightingVisible = false;
    this.state.isAxisVisible = false;
    this.state.isBoundingBoxVisible = false;
    this.state.isStatsVisible = false;
    this.state.isFloorVisible = false;

    // 2. Ustawienie sceny
    if (this.state.scene) {
      this.state.scene.background = new THREE.Color(0x000000);
    }

    // 3. Ustawienie kamery
    if (this.state.camera) {
      this.state.camera.position.set(50, 5, 0);
      this.state.camera.lookAt(0, 5, 0);
    }

    // 4. Ustawienie kontrolek
    if (this.state.controls) {
      this.state.controls.reset();
    }
  }

  // Dodanie event listenerów
  addEventListeners() {
    console.log('DebugManager: Konfiguracja event listenerów...');

    // 1. Przełączanie oświetlenia
    document
      .querySelector('[data-action="toggle-lighting"]')
      ?.addEventListener('click', () => {
        console.log('DebugManager: Przełączanie oświetlenia');
        this.state.isLightingVisible = !this.state.isLightingVisible;
        this.updateLightingVisibility();
      });

    // 2. Przełączanie osi
    document
      .querySelector('[data-action="toggle-axis"]')
      ?.addEventListener('click', () => {
        console.log('DebugManager: Przełączanie osi');
        this.state.isAxisVisible = !this.state.isAxisVisible;
        this.updateAxisVisibility();
      });

    // 3. Przełączanie bounding box
    document
      .querySelector('[data-action="toggle-bounding-box"]')
      ?.addEventListener('click', () => {
        console.log('DebugManager: Przełączanie bounding box');
        this.state.isBoundingBoxVisible = !this.state.isBoundingBoxVisible;
        this.updateBoundingBoxVisibility();
      });

    // 4. Przełączanie statystyk
    document
      .querySelector('[data-action="toggle-stats"]')
      ?.addEventListener('click', () => {
        console.log('DebugManager: Przełączanie statystyk');
        this.state.isStatsVisible = !this.state.isStatsVisible;
        this.updateStatsVisibility();
      });

    // 5. Przełączanie podłogi
    document
      .querySelector('[data-action="toggle-floor"]')
      ?.addEventListener('click', () => {
        console.log('DebugManager: Przełączanie podłogi');
        this.state.isFloorVisible = !this.state.isFloorVisible;
        this.updateFloorVisibility();
      });

    // 6. Resetowanie widoku
    document
      .querySelector('[data-action="reset-view"]')
      ?.addEventListener('click', () => {
        console.log('DebugManager: Resetowanie widoku');
        this.resetView();
      });

    // 7. Przełączanie informacji o renderze
    document
      .querySelector(
        '[data-action="toggle-render-info"], #btn-toggle-render-info'
      )
      ?.addEventListener('click', () => {
        console.log('DebugManager: Przełączanie informacji o renderze');
        this.state.isRenderInfoVisible = !this.state.isRenderInfoVisible;
        this.updateRenderInfoVisibility();
      });

    console.log('DebugManager: Konfiguracja event listenerów zakończona');
  }

  // Aktualizacja widoczności oświetlenia
  updateLightingVisibility() {
    if (!this.state.scene) {
      return;
    }

    this.state.scene.traverse((child) => {
      if (child.isLight) {
        child.visible = this.state.isLightingVisible;
      }
    });
  }

  // Aktualizacja widoczności osi
  updateAxisVisibility() {
    if (!this.state.scene) {
      return;
    }

    this.state.scene.traverse((child) => {
      if (child.isAxesHelper) {
        child.visible = this.state.isAxisVisible;
      }
    });
  }

  // Aktualizacja widoczności bounding box
  updateBoundingBoxVisibility() {
    if (!this.state.scene) {
      return;
    }

    this.state.scene.traverse((child) => {
      if (child.isBoxHelper) {
        child.visible = this.state.isBoundingBoxVisible;
      }
    });
  }

  // Aktualizacja widoczności statystyk
  updateStatsVisibility() {
    if (!this.state.stats) {
      return;
    }

    this.state.stats.dom.style.display = this.state.isStatsVisible
      ? 'block'
      : 'none';
  }

  // Aktualizacja widoczności podłogi
  updateFloorVisibility() {
    if (!this.state.scene) {
      return;
    }

    this.state.scene.traverse((child) => {
      if (child.isMesh && child.name === 'floor') {
        child.visible = this.state.isFloorVisible;
      }
    });
  }

  // Resetowanie widoku
  resetView() {
    console.log('DebugManager: Resetowanie widoku kamery');
    if (!this.state.camera || !this.state.controls) {
      return;
    }

    this.state.camera.position.set(50, 5, 0);
    this.state.camera.lookAt(0, 5, 0);
    this.state.controls.reset();
  }

  // Wyświetlanie powiadomienia
  showNotification(message, duration = 3000, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, duration);
  }

  // Ustawienie interfejsu debugowania
  async setupDebugUI() {
    console.log('DebugManager: Inicjalizacja UI');

    try {
      // Inicjalizacja panelu debug
      const renderInfoPanel = document.getElementById('render-info-panel');
      if (renderInfoPanel) {
        renderInfoPanel.style.display = 'block';
        this.state.isRenderInfoVisible = true;
      }

      // Dodanie event listenera do przycisku kopiowania
      const copyButton = document.getElementById('copyDebugContent');
      if (copyButton) {
        copyButton.addEventListener('click', () => {
          const content = document.getElementById('render-info-content');
          if (!content) return;

          // Formatujemy tekst do skopiowania
          let debugText = '';
          const sections = content.querySelectorAll('.render-info-group');

          sections.forEach((section) => {
            const title = section.querySelector('.render-info-group-title');
            if (title) {
              debugText += `=== ${title.textContent} ===\n`;
            }

            const items = section.querySelectorAll('.render-info-item');
            items.forEach((item) => {
              const key =
                item.querySelector('.render-info-key')?.textContent || '';
              const value =
                item.querySelector('.render-info-value')?.textContent || '';
              debugText += `${key} ${value}\n`;
            });
            debugText += '\n';
          });

          // Kopiuj do schowka
          navigator.clipboard
            .writeText(debugText)
            .then(() => {
              copyButton.textContent = 'Skopiowano!';
              setTimeout(() => {
                copyButton.textContent = 'Kopiuj';
              }, 2000);
            })
            .catch((err) => {
              console.error('Błąd podczas kopiowania:', err);
              copyButton.textContent = 'Błąd!';
              setTimeout(() => {
                copyButton.textContent = 'Kopiuj';
              }, 2000);
            });
        });
      }
    } catch (error) {
      console.error('Błąd podczas inicjalizacji panelu debug:', error);
    }
  }

  // Podpięcie nasłuchiwania zdarzeń debugowania
  attachDebugListeners() {
    document
      .getElementById('toggleRenderInfo')
      ?.addEventListener('click', () => {
        const panel = document.getElementById('render-info-panel');
        if (panel) {
          panel.classList.toggle('render-info-collapsed');
          const button = document.getElementById('toggleRenderInfo');
          if (button) {
            button.textContent = panel.classList.contains(
              'render-info-collapsed'
            )
              ? 'Rozwiń'
              : 'Zwiń';
          }
        }
      });
  }

  // Główna funkcja logująca - teraz dodaje informacje do panelu parametrów renderowania
  log(type, data) {
    if (!this.isEnabled) return;

    const container = document.getElementById('render-info-content');
    if (!container) return;

    // Dodaj sekcję dla danego typu logów, jeśli nie istnieje
    let section = container.querySelector(`.debug-${type}-section`);
    if (!section) {
      section = document.createElement('div');
      section.className = `render-info-group debug-${type}-section`;
      section.innerHTML = `<div class="render-info-group-title">${type.toUpperCase()}</div>`;
      container.appendChild(section);
    }

    // Aktualizuj zawartość sekcji
    const content = document.createElement('div');
    content.className = 'render-info-item';
    content.innerHTML = `
      <span class="render-info-key">${new Date().toLocaleTimeString()}</span>
      <span class="render-info-value">${JSON.stringify(data)}</span>
    `;

    // Dodaj nowy wpis na początku sekcji
    if (section.children.length > 1) {
      section.insertBefore(content, section.children[1]);
    } else {
      section.appendChild(content);
    }

    // Ogranicz liczbę wpisów do 10 dla każdej sekcji
    const entries = section.querySelectorAll('.render-info-item');
    if (entries.length > 10) {
      entries[entries.length - 1].remove();
    }

    this.logs.push({ type, data, timestamp: new Date() });
  }

  // Śledzenie parametrów kamery podczas ładowania profilu
  trackProfileCameraParams(camera, controls, source) {
    if (!this.isEnabled) return;

    const cameraParams = {
      position: {
        x: camera.position.x.toFixed(2),
        y: camera.position.y.toFixed(2),
        z: camera.position.z.toFixed(2),
      },
      target: controls
        ? {
            x: controls.target.x.toFixed(2),
            y: controls.target.y.toFixed(2),
            z: controls.target.z.toFixed(2),
          }
        : null,
      rotation: {
        rotationX: camera.rotation.x.toFixed(2),
        rotationY: camera.rotation.y.toFixed(2),
        rotationZ: camera.rotation.z.toFixed(2),
      },
    };

    if (source === 'profile') {
      this.cameraLoadData.profileCameraParams = cameraParams;
      this.cameraLoadData.profileLoaded = true;
      this.log('profile_camera', cameraParams);
    } else if (source === 'actual') {
      this.cameraLoadData.actualCameraParams = cameraParams;
      this.cameraLoadData.timestamp = new Date();
      this.log('actual_camera', cameraParams);
    }

    // Jeśli mamy oba zestawy parametrów, generujemy raport
    if (
      this.cameraLoadData.profileLoaded &&
      this.cameraLoadData.actualCameraParams
    ) {
      this.generateCameraReport();
    }
  }

  // Generowanie raportu porównawczego
  generateCameraReport() {
    const report = {
      timestamp: this.cameraLoadData.timestamp,
      profile: this.cameraLoadData.profileCameraParams,
      actual: this.cameraLoadData.actualCameraParams,
      differences: this.compareCameraParams(
        this.cameraLoadData.profileCameraParams,
        this.cameraLoadData.actualCameraParams
      ),
    };

    // Formatowanie raportu do pliku
    const reportText = `=== Raport parametrów kamery ===
Timestamp: ${report.timestamp}

=== Parametry z profilu ===
Pozycja kamery: ${JSON.stringify(report.profile.position)}
Cel kamery: ${JSON.stringify(report.profile.target)}
Orientacja kamery: ${JSON.stringify(report.profile.rotation)}

=== Aktualne parametry ===
Pozycja kamery: ${JSON.stringify(report.actual.position)}
Cel kamery: ${JSON.stringify(report.actual.target)}
Orientacja kamery: ${JSON.stringify(report.actual.rotation)}

=== Różnice ===
${this.formatDifferences(report.differences)}
`;

    // Zapisanie do pliku
    this.saveToFile(reportText);

    // Reset danych śledzenia
    this.cameraLoadData = {
      profileLoaded: false,
      sceneLoaded: false,
      profileCameraParams: null,
      actualCameraParams: null,
      timestamp: null,
    };
  }

  // Porównanie parametrów kamery
  compareCameraParams(profile, actual) {
    const differences = {
      position: {},
      target: {},
      rotation: {},
    };

    // Porównanie pozycji
    ['x', 'y', 'z'].forEach((axis) => {
      const diff = Math.abs(
        parseFloat(actual.position[axis]) - parseFloat(profile.position[axis])
      );
      if (diff > 0.01) {
        // Próg różnicy 0.01
        differences.position[axis] = diff.toFixed(2);
      }
    });

    // Porównanie celu
    ['x', 'y', 'z'].forEach((axis) => {
      const diff = Math.abs(
        parseFloat(actual.target[axis]) - parseFloat(profile.target[axis])
      );
      if (diff > 0.01) {
        differences.target[axis] = diff.toFixed(2);
      }
    });

    // Porównanie rotacji
    ['rotationX', 'rotationY', 'rotationZ'].forEach((rot) => {
      const diff = Math.abs(
        parseFloat(actual.rotation[rot]) - parseFloat(profile.rotation[rot])
      );
      if (diff > 0.01) {
        differences.rotation[rot] = diff.toFixed(2);
      }
    });

    return differences;
  }

  // Formatowanie różnic do tekstu
  formatDifferences(differences) {
    let text = '';

    if (Object.keys(differences.position).length > 0) {
      text += 'Różnice w pozycji:\n';
      for (const [axis, diff] of Object.entries(differences.position)) {
        text += `  ${axis}: ${diff}\n`;
      }
    }

    if (Object.keys(differences.target).length > 0) {
      text += 'Różnice w celu:\n';
      for (const [axis, diff] of Object.entries(differences.target)) {
        text += `  ${axis}: ${diff}\n`;
      }
    }

    if (Object.keys(differences.rotation).length > 0) {
      text += 'Różnice w rotacji:\n';
      for (const [rot, diff] of Object.entries(differences.rotation)) {
        text += `  ${rot}: ${diff}\n`;
      }
    }

    return text || 'Brak znaczących różnic';
  }

  // Zapisanie do pliku
  async saveToFile(content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const filename = `camera_debug_${new Date()
      .toISOString()
      .replace(/[:.]/g, '-')}.log`;

    try {
      // Używamy File System Access API jeśli jest dostępne
      if ('showSaveFilePicker' in window) {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: 'Log file',
              accept: { 'text/plain': ['.log'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
      } else {
        // Fallback dla przeglądarek bez File System Access API
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      }

      this.log('debug', `Zapisano raport do pliku: ${filename}`);
    } catch (error) {
      console.error('Błąd podczas zapisywania pliku:', error);
      this.log('error', `Nie udało się zapisać pliku: ${error.message}`);
    }
  }

  // Aktualizacja informacji o renderze
  updateRenderInfo(
    rendererParams,
    scene,
    camera,
    performanceProfile,
    sceneProfile
  ) {
    try {
      const container = document.getElementById('render-info-content');
      if (!container) {
        console.warn('Nie znaleziono elementu render-info-content');
        return;
      }

      // Cache dla elementów DOM
      const cachedElements = {
        profilesSection: null,
        rendererSection: null,
        shadowSection: null,
        lightsSection: null,
        debugSection: null,
        sceneSection: null,
      };

      // Funkcja pomocnicza do tworzenia sekcji
      const createSection = (title, className) => {
        const section = document.createElement('div');
        section.className = `render-info-group ${className}`;
        section.innerHTML = `<div class="render-info-group-title">${title}</div>`;
        return section;
      };

      // Funkcja pomocnicza do dodawania informacji
      const addInfo = (section, key, value) => {
        const item = document.createElement('div');
        item.className = 'render-info-item';
        item.innerHTML = `
          <span class="render-info-key">${key}:</span>
          <span class="render-info-value">${value}</span>
        `;
        section.appendChild(item);
        return item;
      };

      // Czyszczenie kontenera
      container.innerHTML = '';

      // Przycisk kopiowania - teraz na początku
      const copyButton = document.createElement('button');
      copyButton.className = 'apply-button';
      copyButton.innerHTML = '<i class="fas fa-copy"></i> Kopiuj do schowka';
      copyButton.onclick = () => this.copyDebugContent();
      container.appendChild(copyButton);

      // Sekcja profili
      cachedElements.profilesSection = createSection(
        'Zastosowane profile',
        'profiles-section'
      );
      container.appendChild(cachedElements.profilesSection);

      // Informacje o profilu wydajności
      if (performanceProfile) {
        const performanceInfo = {
          'Profil wydajności': performanceProfile.name || 'Brak',
          Opis: performanceProfile.description || 'Brak',
          Precyzja: performanceProfile.renderer?.precision || 'Brak',
          'Preferencje mocy':
            performanceProfile.renderer?.powerPreference || 'Brak',
          'Typ mapy cieni':
            this.getShadowMapTypeName(
              performanceProfile.renderer?.shadowMap?.type
            ) || 'Brak',
          'Cienie włączone': performanceProfile.renderer?.shadowMap?.enabled
            ? 'Tak'
            : 'Nie',
        };

        Object.entries(performanceInfo).forEach(([key, value]) => {
          addInfo(cachedElements.profilesSection, key, value);
        });
      }

      // Informacje o profilu sceny
      if (sceneProfile) {
        const sceneInfo = {
          'Profil sceny': sceneProfile.name || 'Brak',
          Opis: sceneProfile.description || 'Brak',
          'Kolor tła': sceneProfile.background?.color
            ? `#${sceneProfile.background.color.toString(16)}`
            : 'Brak',
          Postprocessing: sceneProfile.postprocessing?.enabled ? 'Tak' : 'Nie',
          Oświetlenie: {
            Włączone: sceneProfile.lighting?.enabled || false,
            Widoczne: sceneProfile.lighting?.visible || false,
            Ambient: {
              Włączone: sceneProfile.lighting?.ambient?.enabled || false,
              Intensywność: sceneProfile.lighting?.ambient?.intensity || 0.5,
              Kolor: sceneProfile.lighting?.ambient?.color || '#ffffff',
            },
            Hemisphere: {
              Włączone: sceneProfile.lighting?.hemisphere?.enabled || false,
              Intensywność: sceneProfile.lighting?.hemisphere?.intensity || 1.0,
              'Kolor nieba':
                sceneProfile.lighting?.hemisphere?.skyColor || '#87CEEB',
              'Kolor ziemi':
                sceneProfile.lighting?.hemisphere?.groundColor || '#8B4513',
            },
          },
        };

        Object.entries(sceneInfo).forEach(([key, value]) => {
          addInfo(cachedElements.profilesSection, key, value);
        });
      }

      // Sekcja parametrów renderera
      cachedElements.rendererSection = createSection(
        'Parametry renderera',
        'renderer-section'
      );
      container.appendChild(cachedElements.rendererSection);

      // Podstawowe informacje o rendererze
      const rendererInfo = {
        Type: rendererParams.type || 'Brak',
        Antialiasing: this.state.renderer?.capabilities?.antialias
          ? 'Tak'
          : 'Nie',
        'Output Color Space': rendererParams.outputColorSpace || 'Brak',
        'Pixel Ratio': rendererParams.pixelRatio?.toFixed(2) || 'Brak',
        'Tone Mapping':
          this.getToneMappingName(rendererParams.toneMapping) || 'Brak',
        'Tone Mapping Exposure':
          rendererParams.toneMappingExposure?.toFixed(2) || 'Brak',
        'Physically Correct Lights': rendererParams.physicallyCorrectLights
          ? 'Tak'
          : 'Nie',
        'Logarithmic Depth Buffer': rendererParams.logarithmicDepthBuffer
          ? 'Tak'
          : 'Nie',
        Precision: rendererParams.precision || 'Brak',
        'Power Preference': rendererParams.powerPreference || 'Brak',
        Stencil: rendererParams.stencil ? 'Tak' : 'Nie',
        'Fail If Major Performance Caveat':
          rendererParams.failIfMajorPerformanceCaveat ? 'Tak' : 'Nie',
        Depth: rendererParams.depth ? 'Tak' : 'Nie',
        'Premultiplied Alpha': rendererParams.premultipliedAlpha
          ? 'Tak'
          : 'Nie',
        'Preserve Drawing Buffer': rendererParams.preserveDrawingBuffer
          ? 'Tak'
          : 'Nie',
        'XR Compatible': rendererParams.xrCompatible ? 'Tak' : 'Nie',
        'Auto Clear': rendererParams.autoClear ? 'Tak' : 'Nie',
        'Output Encoding': rendererParams.outputEncoding || 'Brak',
        Alpha: rendererParams.alpha ? 'Tak' : 'Nie',
      };

      Object.entries(rendererInfo).forEach(([key, value]) => {
        addInfo(cachedElements.rendererSection, key, value);
      });

      // Sekcja aktualnych parametrów sceny
      if (scene) {
        cachedElements.sceneSection = createSection(
          'Aktualne parametry sceny',
          'scene-section'
        );
        container.appendChild(cachedElements.sceneSection);

        const sceneInfo = {
          'Liczba obiektów': scene.children.length,
          'Widoczność osi': scene.getObjectByName('axis')?.visible
            ? 'Tak'
            : 'Nie',
          'Widoczność siatki': scene.getObjectByName('grid')?.visible
            ? 'Tak'
            : 'Nie',
          'Widoczność podłogi': scene.getObjectByName('floor')?.visible
            ? 'Tak'
            : 'Nie',
          'Widoczność oświetlenia': scene.getObjectByName('lighting')?.visible
            ? 'Tak'
            : 'Nie',
          'Kolor tła': scene.background
            ? `#${scene.background.getHexString()}`
            : 'Brak',
          Fog: scene.fog ? 'Tak' : 'Nie',
          'Fog Color': scene.fog
            ? `#${scene.fog.color.getHexString()}`
            : 'Brak',
          'Fog Near': scene.fog ? scene.fog.near.toFixed(2) : 'Brak',
          'Fog Far': scene.fog ? scene.fog.far.toFixed(2) : 'Brak',
          'Fog Density': scene.fog ? scene.fog.density.toFixed(4) : 'Brak',
          Environment: scene.environment ? 'Tak' : 'Nie',
          'Background Intensity':
            typeof scene.backgroundIntensity === 'number'
              ? scene.backgroundIntensity.toFixed(2)
              : 'Brak',
          'Background Blurriness':
            typeof scene.backgroundBlurriness === 'number'
              ? scene.backgroundBlurriness.toFixed(2)
              : 'Brak',
          'Background Rotation':
            typeof scene.backgroundRotation === 'number'
              ? scene.backgroundRotation.toFixed(2)
              : 'Brak',
        };

        Object.entries(sceneInfo).forEach(([key, value]) => {
          addInfo(cachedElements.sceneSection, key, value);
        });
      }

      // Sekcja Shadow Map
      if (rendererParams.shadowMap) {
        cachedElements.shadowSection = createSection(
          'Shadow Map',
          'shadow-section'
        );
        container.appendChild(cachedElements.shadowSection);

        const shadowMapInfo = {
          Enabled: rendererParams.shadowMap.enabled ? 'Tak' : 'Nie',
          Type:
            this.getShadowMapTypeName(rendererParams.shadowMap.type) || 'Brak',
          'Map Size': rendererParams.shadowMap.mapSize
            ? `${rendererParams.shadowMap.mapSize.width || 0} x ${
                rendererParams.shadowMap.mapSize.height || 0
              }`
            : 'Brak',
          'Blur Samples': rendererParams.shadowMap.blurSamples || 'Brak',
          Bias: rendererParams.shadowMap.bias?.toFixed(4) || 'Brak',
          Radius: rendererParams.shadowMap.radius?.toFixed(2) || 'Brak',
        };

        Object.entries(shadowMapInfo).forEach(([key, value]) => {
          addInfo(cachedElements.shadowSection, key, value);
        });
      }

      // Sekcja świateł
      if (scene) {
        cachedElements.lightsSection = createSection(
          'Światła w scenie',
          'lights-section'
        );
        container.appendChild(cachedElements.lightsSection);

        // Dodaj przyciski do przełączania widoczności
        const visibilityInfo = addInfo(
          cachedElements.lightsSection,
          'Widoczność świateł',
          this.state.isLightingVisible ? 'Tak' : 'Nie'
        );
        visibilityInfo.addEventListener('click', () => {
          if (lightManager) {
            lightManager.toggleLightVisibility();
            this.state.isLightingVisible = !this.state.isLightingVisible;
            this.updateLightingVisibility();
            visibilityInfo.textContent = this.state.isLightingVisible
              ? 'Tak'
              : 'Nie';
          }
        });

        const helpersInfo = addInfo(
          cachedElements.lightsSection,
          'Widoczność pomocników',
          this.state.helpersVisible ? 'Tak' : 'Nie'
        );
        helpersInfo.addEventListener('click', () => {
          if (lightManager) {
            lightManager.toggleHelpersVisibility();
            this.state.helpersVisible = !this.state.helpersVisible;
            helpersInfo.textContent = this.state.helpersVisible ? 'Tak' : 'Nie';
          }
        });

        // Przejdź przez wszystkie światła w scenie
        scene.traverse((object) => {
          if (object.isLight) {
            const lightInfo = document.createElement('div');
            lightInfo.className = 'light-info';
            lightInfo.innerHTML = `
              <h4>${object.name || 'Bez nazwy'}</h4>
              <div class="light-properties">
                <div class="property">
                  <span class="property-name">Typ:</span>
                  <span class="property-value">${object.type}</span>
                </div>
                <div class="property">
                  <span class="property-name">Kolor:</span>
                  <span class="property-value">${object.color.getHexString()}</span>
                </div>
                <div class="property">
                  <span class="property-name">Intensywność:</span>
                  <span class="property-value">${object.intensity}</span>
                </div>
                <div class="property">
                  <span class="property-name">Pozycja:</span>
                  <span class="property-value">${object.position.x.toFixed(
                    2
                  )}, ${object.position.y.toFixed(
              2
            )}, ${object.position.z.toFixed(2)}</span>
                </div>
              </div>
            `;
            lightInfo.addEventListener('click', () => {
              const lightData = {
                name: object.name || 'Bez nazwy',
                type: object.type,
                color: object.color.getHexString(),
                intensity: object.intensity,
                position: {
                  x: object.position.x,
                  y: object.position.y,
                  z: object.position.z,
                },
              };
              navigator.clipboard.writeText(JSON.stringify(lightData, null, 2));
              this.showNotification('Skopiowano dane światła do schowka');
            });
            cachedElements.lightsSection.appendChild(lightInfo);
          }
        });
      }

      // Sekcja debugowania
      cachedElements.debugSection = createSection(
        'Debug Logs',
        'debug-section'
      );
      container.appendChild(cachedElements.debugSection);
    } catch (error) {
      console.error(
        'Błąd podczas aktualizacji informacji o rendererze:',
        error
      );
      if (container) {
        container.innerHTML =
          '<div class="error">Błąd podczas aktualizacji informacji o rendererze</div>';
      }
    }
  }

  // Pobieranie nazwy tone mapping
  getToneMappingName(toneMapping) {
    const mappingNames = {
      [THREE.NoToneMapping]: 'No Tone Mapping',
      [THREE.LinearToneMapping]: 'Linear Tone Mapping',
      [THREE.ReinhardToneMapping]: 'Reinhard Tone Mapping',
      [THREE.CineonToneMapping]: 'Cineon Tone Mapping',
      [THREE.ACESFilmicToneMapping]: 'ACES Filmic Tone Mapping',
    };
    return mappingNames[toneMapping] || 'Unknown';
  }

  // Pobieranie nazwy typu shadow map
  getShadowMapTypeName(type) {
    const typeNames = {
      [THREE.BasicShadowMap]: 'Basic Shadow Map',
      [THREE.PCFShadowMap]: 'PCF Shadow Map',
      [THREE.PCFSoftShadowMap]: 'PCF Soft Shadow Map',
    };
    return typeNames[type] || 'Unknown';
  }

  // Aktualizacja widoczności informacji o renderze
  updateRenderInfoVisibility() {
    const renderInfoContent = document.getElementById('render-info-content');
    if (renderInfoContent) {
      renderInfoContent.style.display = this.state.isRenderInfoVisible
        ? 'block'
        : 'none';
    }
  }

  // Konfiguracja event listenerów
  setupEventListeners() {
    window.addEventListener('resize', () => {
      if (this.state.renderer && this.state.camera) {
        this.state.camera.aspect = window.innerWidth / window.innerHeight;
        this.state.camera.updateProjectionMatrix();
        this.state.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    });
  }

  // Kopiowanie zawartości debugowania do schowka
  copyDebugContent() {
    try {
      const content = document.getElementById('render-info-content');
      if (!content) {
        console.error('Nie znaleziono elementu render-info-content');
        return;
      }

      // Formatujemy tekst do skopiowania
      let debugText = '';
      const sections = content.querySelectorAll('.render-info-group');

      sections.forEach((section) => {
        const title = section.querySelector('.render-info-group-title');
        if (title) {
          debugText += `=== ${title.textContent} ===\n`;
        }

        const items = section.querySelectorAll('.render-info-item');
        items.forEach((item) => {
          const key =
            item.querySelector('.render-info-key')?.textContent?.trim() || '';
          const value =
            item.querySelector('.render-info-value')?.textContent?.trim() || '';
          if (key && value) {
            debugText += `${key} ${value}\n`;
          }
        });
        debugText += '\n';
      });

      // Kopiuj do schowka
      navigator.clipboard
        .writeText(debugText)
        .then(() => {
          const button = document.getElementById('copyDebugContent');
          if (button) {
            button.textContent = 'Skopiowano!';
            setTimeout(() => {
              button.textContent = 'Kopiuj';
            }, 2000);
          }
        })
        .catch((err) => {
          console.error('Błąd podczas kopiowania:', err);
          const button = document.getElementById('copyDebugContent');
          if (button) {
            button.textContent = 'Błąd kopiowania!';
            setTimeout(() => {
              button.textContent = 'Kopiuj';
            }, 2000);
          }
        });
    } catch (error) {
      console.error('Błąd podczas kopiowania zawartości:', error);
    }
  }
}

// Usuwam błędny eksport na końcu pliku i zastępuję go poprawnym
export const debugManager = new DebugManager();

// Funkcja do wyświetlania powiadomień
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Funkcja aktualizująca informacje o światłach
function updateLightInfo() {
  const lightInfoContainer = document.getElementById('light-info');
  if (!lightInfoContainer) return;

  lightInfoContainer.innerHTML = '';

  Object.values(lightManager.lights).forEach((light) => {
    const lightDiv = document.createElement('div');
    lightDiv.className = 'light-info';

    const lightData = {
      name: light.name,
      type: light.type,
      color: light.color,
      intensity: light.intensity,
      position: light.position,
    };

    lightDiv.innerHTML = `
      <h4>${light.name}</h4>
      <div class="light-properties">
        <div class="property">
          <span class="property-name">Typ:</span>
          <span class="property-value">${light.type}</span>
        </div>
        <div class="property">
          <span class="property-name">Kolor:</span>
          <span class="property-value">${light.color}</span>
        </div>
        <div class="property">
          <span class="property-name">Intensywność:</span>
          <span class="property-value">${light.intensity}</span>
        </div>
        <div class="property">
          <span class="property-name">Pozycja:</span>
          <span class="property-value">${JSON.stringify(light.position)}</span>
        </div>
      </div>
    `;

    lightDiv.addEventListener('click', () => {
      navigator.clipboard
        .writeText(JSON.stringify(lightData, null, 2))
        .then(() => {
          showNotification('Skopiowano dane światła do schowka');
        })
        .catch((err) => {
          console.error('Błąd podczas kopiowania do schowka:', err);
          showNotification('Błąd podczas kopiowania do schowka', 'error');
        });
    });

    lightInfoContainer.appendChild(lightDiv);
  });
}

// Inicjalizacja debugowania
export function initDebug() {
  // Tworzenie kontenera na informacje o światłach
  const container = document.createElement('div');
  container.id = 'light-info';
  document.body.appendChild(container);

  // Aktualizacja informacji o światłach
  updateLightInfo();

  // Nasłuchiwanie zmian w światłach
  lightManager.on('lightsChanged', updateLightInfo);
}
