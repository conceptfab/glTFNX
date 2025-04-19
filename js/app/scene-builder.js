import { getInitialProfiles } from './profile-validator.js';
import * as THREE from 'three';
import { Scene } from 'three';
import { PerspectiveCamera } from 'three';
import { Light } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';

export class SceneBuilder {
  constructor(config) {
    if (!config) {
      throw new Error('Konfiguracja jest wymagana dla SceneBuilder');
    }

    if (!THREE) {
      throw new Error('THREE nie jest zainicjalizowany');
    }

    console.log('SceneBuilder: Inicjalizacja...');
    this.config = config;
    this.currentScene = null;
    this.currentProfile = null;
    this.composer = null;
    this.profileValidator = null;
    this.isInitialized = false;

    // Sprawdź wymagane zależności
    if (!EffectComposer || !RenderPass) {
      console.warn(
        'Brak wymaganych modułów postprocessingu. Niektóre efekty mogą nie działać.'
      );
    }

    this.setupEventListeners();
    console.log('SceneBuilder: Inicjalizacja zakończona');
  }

  // Inicjalizacja walidatora profili
  setProfileValidator(validator) {
    if (!validator) {
      throw new Error('Walidator profili jest wymagany');
    }
    this.profileValidator = validator;
  }

  // Konfiguracja obsługi zdarzeń z UI
  setupEventListeners() {
    // Obsługa gotowości walidatora
    document.addEventListener('profileValidatorReady', (event) => {
      this.currentProfile = event.detail.performanceProfile;
      this.currentScene = event.detail.sceneProfile;
      this.updateScene();
    });

    // Obsługa wyboru profilu wydajności
    document.addEventListener('profileSelected', async (event) => {
      try {
        this.config.showLoading('Ładowanie profilu wydajności...');
        const profile = await this.profileValidator.loadPerformanceProfile(
          event.detail.profileId
        );
        this.currentProfile = profile;
        this.config.hideLoading();
        this.updateScene();
      } catch (error) {
        this.config.showError(
          `Błąd podczas ładowania profilu: ${error.message}`
        );
      }
    });

    // Obsługa wyboru sceny
    document.addEventListener('sceneSelected', async (event) => {
      try {
        this.config.showLoading('Ładowanie sceny...');
        const scene = await this.profileValidator.loadScene(
          event.detail.sceneId
        );
        this.currentScene = scene;
        this.config.hideLoading();
        this.updateScene();
      } catch (error) {
        this.config.showError(`Błąd podczas ładowania sceny: ${error.message}`);
      }
    });

    // Obsługa resetowania widoku
    document.addEventListener('resetView', () => {
      this.resetScene();
    });

    // Obsługa wyboru profili
    document.addEventListener('profilesSelected', async (event) => {
      try {
        const { performanceProfile, sceneProfile } = event.detail;

        // Pobierz profile z walidatora
        const profiles = await this.profileValidator.loadProfiles({
          performanceProfile,
          sceneProfile,
        });

        // Skonfiguruj scenę z nowymi profilami
        await this.configureScene(
          profiles.performanceProfile,
          profiles.sceneProfile
        );

        // Emituj zdarzenie o aktualizacji sceny
        window.dispatchEvent(
          new CustomEvent('sceneUpdate', {
            detail: {
              performanceProfile: profiles.performanceProfile,
              sceneProfile: profiles.sceneProfile,
            },
          })
        );
      } catch (error) {
        console.error('Błąd podczas aplikowania profili:', error);
        this.config.showError(
          `Błąd podczas aplikowania profili: ${error.message}`
        );
      }
    });
  }

  // Inicjalizacja sceny startowej
  async initStartScene() {
    console.log('SceneBuilder: Inicjalizacja sceny startowej...');
    try {
      if (!THREE || !THREE.Light) {
        console.error(
          'SceneBuilder: THREE lub jego komponenty nie są zainicjalizowane'
        );
        throw new Error('THREE lub jego komponenty nie są zainicjalizowane');
      }

      this.config.showLoading('Przygotowywanie sceny...');

      // Pobierz domyślne profile (bez wykrywania sprzętu)
      const { performanceProfile, sceneProfile } = await getInitialProfiles();
      console.log('SceneBuilder: Pobrane profile:', {
        performanceProfile,
        sceneProfile,
      });

      if (!performanceProfile || !sceneProfile) {
        throw new Error('Brak wymaganych profili');
      }

      // Sprawdź konfigurację oświetlenia
      console.log('SceneBuilder: Konfiguracja oświetlenia w profilu:', {
        lighting: sceneProfile.lighting,
        lights: sceneProfile.lights,
      });

      // Przekaż profile do konfiguracji sceny
      await this.configureScene(performanceProfile, sceneProfile);

      // Sprawdź światła w scenie po konfiguracji
      const lightsInScene = [];
      this.config.scene.traverse((object) => {
        if (object instanceof THREE.Light) {
          lightsInScene.push({
            type: object.constructor.name,
            intensity: object.intensity,
            position: object.position.clone(),
          });
        }
      });
      console.log(
        'SceneBuilder: Światła w scenie po konfiguracji:',
        lightsInScene
      );

      this.config.hideLoading();
      console.log('SceneBuilder: Scena startowa zainicjalizowana');
    } catch (error) {
      console.error('SceneBuilder: Błąd podczas inicjalizacji sceny:', error);
      this.config.showError(
        'Błąd podczas inicjalizacji sceny: ' + error.message
      );
      this.config.hideLoading();
    }
  }

  // Konfiguracja sceny na podstawie profili
  async configureScene(performanceProfile, sceneProfile) {
    if (!this.profileValidator) {
      throw new Error('ProfileValidator nie został zainicjalizowany');
    }

    // Sprawdź czy profile się zmieniły
    if (
      this.currentProfile?.id === performanceProfile?.id &&
      this.currentScene?.id === sceneProfile?.id
    ) {
      console.log(
        'SceneBuilder: Profile nie uległy zmianie, pomijam konfigurację'
      );
      return;
    }

    try {
      // Konfiguracja środowiska
      if (sceneProfile?.environment?.enabled) {
        console.log(
          'SceneBuilder: Konfiguracja środowiska:',
          sceneProfile.environment
        );

        // Wyłącz environment jeśli jest wyłączone w profilu
        if (!sceneProfile.environment.enabled) {
          this.config.scene.environment = null;
          this.config.scene.background = new THREE.Color(
            sceneProfile.background.color
          );
          console.log('SceneBuilder: Środowisko wyłączone');
          return;
        }

        const envPath = sceneProfile.environment.path || 'textures/';
        const envFiles = sceneProfile.environment.files || [
          'posx.jpg',
          'negx.jpg',
          'posy.jpg',
          'negy.jpg',
          'posz.jpg',
          'negz.jpg',
        ];

        console.log('SceneBuilder: Ścieżka do tekstur:', envPath);
        console.log('SceneBuilder: Pliki tekstur:', envFiles);

        // Ładowanie tekstur środowiska
        const textureLoader = new THREE.CubeTextureLoader();
        textureLoader.setPath(envPath);

        console.log(
          'SceneBuilder: Rozpoczynam ładowanie tekstur środowiska...'
        );

        try {
          const envMap = await textureLoader.loadAsync(envFiles);
          console.log(
            'SceneBuilder: Tekstury środowiska załadowane pomyślnie:',
            envMap
          );

          const colorSpace =
            THREE[sceneProfile.environment.colorSpace] || THREE.sRGBEncoding;
          console.log('SceneBuilder: Ustawiam przestrzeń kolorów:', colorSpace);

          envMap.encoding = colorSpace;
          this.config.scene.environment = envMap;

          // Ustawiamy kolor tła tylko jeśli nie jest ustawiony w profilu
          if (!sceneProfile.background?.color) {
            this.config.scene.background = envMap;
          } else {
            this.config.scene.background = new THREE.Color(
              sceneProfile.background.color
            );
          }

          console.log('SceneBuilder: Środowisko skonfigurowane pomyślnie');
        } catch (error) {
          console.error(
            'SceneBuilder: Błąd podczas ładowania tekstur środowiska:',
            error
          );
          this.config.showError(
            `Błąd podczas ładowania tekstur środowiska: ${error.message}`
          );
        }
      }

      // Walidacja profili
      if (!performanceProfile || !sceneProfile) {
        throw new Error('Brak wymaganych profili');
      }

      // Resetowanie wszystkich świateł
      if (this.config.scene) {
        // Logowanie ilości świateł przed usunięciem
        const lightsBefore = [];
        this.config.scene.traverse((object) => {
          if (object instanceof THREE.Light) {
            lightsBefore.push({
              type: object.constructor.name,
              intensity: object.intensity,
              position: object.position.clone(),
            });
          }
        });
        console.log(
          'SceneBuilder: Ilość świateł przed resetem:',
          lightsBefore.length
        );
        console.log(
          'SceneBuilder: Szczegóły świateł przed resetem:',
          lightsBefore
        );

        // Usuń wszystkie światła i ich pomocniki
        const lightsToRemove = [];
        this.config.scene.traverse((object) => {
          if (!THREE || !THREE.Light) {
            console.error(
              'SceneBuilder: THREE lub jego komponenty nie są zainicjalizowane'
            );
            return;
          }
          if (object instanceof THREE.Light) {
            lightsToRemove.push(object);
          }
        });

        lightsToRemove.forEach((light) => {
          // Usuń światło ze sceny
          this.config.scene.remove(light);

          // Jeśli światło ma target, usuń go również
          if (light.target) {
            this.config.scene.remove(light.target);
            if (light.target.dispose) {
              light.target.dispose();
            }
          }

          // Zwolnij zasoby światła
          if (light.dispose) {
            light.dispose();
          }
        });

        // Wyczyść referencje do świateł
        if (this.config.scene.userData.lights) {
          this.config.scene.userData.lights = {};
        }

        // Logowanie ilości świateł po usunięciu
        const lightsAfter = [];
        this.config.scene.traverse((object) => {
          if (object instanceof THREE.Light) {
            lightsAfter.push({
              type: object.constructor.name,
              intensity: object.intensity,
              position: object.position.clone(),
            });
          }
        });
        console.log(
          'SceneBuilder: Ilość świateł po resecie:',
          lightsAfter.length
        );
        console.log('SceneBuilder: Szczegóły świateł po resecie:', lightsAfter);
      }

      // Konfiguracja oświetlenia
      if (sceneProfile?.lighting?.enabled) {
        console.log(
          'SceneBuilder: Konfiguracja oświetlenia:',
          sceneProfile.lighting
        );

        // Oświetlenie ambient
        if (sceneProfile.lighting.ambient?.enabled) {
          console.log(
            'SceneBuilder: Tworzenie światła ambient:',
            sceneProfile.lighting.ambient
          );
          const ambientLight = new THREE.AmbientLight(
            sceneProfile.lighting.ambient.color,
            sceneProfile.lighting.ambient.intensity
          );
          this.config.scene.add(ambientLight);
          console.log(
            'SceneBuilder: Światło ambient dodane do sceny:',
            ambientLight
          );
        } else {
          console.log('SceneBuilder: Światło ambient wyłączone w konfiguracji');
        }

        // Oświetlenie hemisphere
        if (sceneProfile.lighting.hemisphere?.enabled) {
          console.log(
            'SceneBuilder: Tworzenie światła hemisphere:',
            sceneProfile.lighting.hemisphere
          );

          // Konwertuj kolory na odpowiedni format
          const skyColor =
            typeof sceneProfile.lighting.hemisphere.skyColor === 'string'
              ? parseInt(
                  sceneProfile.lighting.hemisphere.skyColor.replace('#', '0x'),
                  16
                )
              : sceneProfile.lighting.hemisphere.skyColor;

          const groundColor =
            typeof sceneProfile.lighting.hemisphere.groundColor === 'string'
              ? parseInt(
                  sceneProfile.lighting.hemisphere.groundColor.replace(
                    '#',
                    '0x'
                  ),
                  16
                )
              : sceneProfile.lighting.hemisphere.groundColor;

          console.log('SceneBuilder: Konwertowane kolory:', {
            skyColor: `0x${skyColor.toString(16)}`,
            groundColor: `0x${groundColor.toString(16)}`,
          });

          const hemisphereLight = new THREE.HemisphereLight(
            skyColor,
            groundColor,
            sceneProfile.lighting.hemisphere.intensity
          );

          console.log('SceneBuilder: Utworzone światło hemisphere:', {
            type: hemisphereLight.type,
            color: hemisphereLight.color.getHexString(),
            groundColor: hemisphereLight.groundColor.getHexString(),
            intensity: hemisphereLight.intensity,
            position: hemisphereLight.position,
          });

          this.config.scene.add(hemisphereLight);

          // Sprawdź, czy światło jest w scenie
          const lightsInScene = [];
          this.config.scene.traverse((object) => {
            if (object instanceof THREE.Light) {
              lightsInScene.push({
                type: object.constructor.name,
                color: object.color.getHexString(),
                intensity: object.intensity,
                position: object.position,
              });
            }
          });
          console.log(
            'SceneBuilder: Światła w scenie po dodaniu hemisphere:',
            lightsInScene
          );

          console.log(
            'SceneBuilder: Światło hemisphere dodane do sceny:',
            hemisphereLight
          );
        } else {
          console.log(
            'SceneBuilder: Światło hemisphere wyłączone w konfiguracji'
          );
        }

        // Oświetlenie directional
        if (sceneProfile.lights?.length > 0) {
          sceneProfile.lights.forEach((lightConfig) => {
            if (
              lightConfig.type === 'DirectionalLight' &&
              lightConfig.enabled !== false
            ) {
              console.log(
                'SceneBuilder: Tworzenie światła directional:',
                lightConfig
              );
              const directionalLight = new THREE.DirectionalLight(
                new THREE.Color(lightConfig.color),
                lightConfig.intensity
              );
              directionalLight.position.set(
                lightConfig.position.x,
                lightConfig.position.y,
                lightConfig.position.z
              );
              if (lightConfig.castShadow) {
                directionalLight.castShadow = true;
              }
              this.config.scene.add(directionalLight);
              console.log(
                'SceneBuilder: Światło directional dodane do sceny:',
                directionalLight
              );
            }
          });
        }

        // Sprawdź wszystkie światła w scenie
        const lightsInScene = [];
        this.config.scene.traverse((object) => {
          if (object instanceof THREE.Light) {
            lightsInScene.push({
              type: object.constructor.name,
              position: object.position,
              intensity: object.intensity,
              color: object.color,
            });
          }
        });
        console.log(
          'SceneBuilder: Ilość świateł po dodaniu:',
          lightsInScene.length
        );
        console.log(
          'SceneBuilder: Szczegóły świateł po dodaniu:',
          lightsInScene
        );
      } else {
        console.log('SceneBuilder: Oświetlenie wyłączone w konfiguracji');
      }

      // Konfiguracja postprocessingu
      if (sceneProfile?.postprocessing?.enabled) {
        if (!this.composer) {
          this.composer = new EffectComposer(this.config.renderer);
        }

        // RenderPass
        if (sceneProfile.postprocessing.effects.RenderPass?.enabled) {
          const renderPass = new RenderPass(
            this.config.scene,
            this.config.camera
          );
          this.composer.addPass(renderPass);
        }

        // UnrealBloomPass
        if (sceneProfile.postprocessing.effects.UnrealBloomPass?.enabled) {
          const bloomPass = new UnrealBloomPass(
            sceneProfile.postprocessing.effects.UnrealBloomPass.strength,
            sceneProfile.postprocessing.effects.UnrealBloomPass.radius,
            sceneProfile.postprocessing.effects.UnrealBloomPass.threshold
          );
          this.composer.addPass(bloomPass);
        }

        // SSAOPass
        if (sceneProfile.postprocessing.effects.SSAOPass?.enabled) {
          const ssaoPass = new SSAOPass(
            this.config.scene,
            this.config.camera,
            window.innerWidth,
            window.innerHeight
          );
          ssaoPass.radius = sceneProfile.postprocessing.effects.SSAOPass.radius;
          ssaoPass.intensity =
            sceneProfile.postprocessing.effects.SSAOPass.intensity;
          ssaoPass.bias = sceneProfile.postprocessing.effects.SSAOPass.bias;
          this.composer.addPass(ssaoPass);
        }

        // FXAAPass
        if (sceneProfile.postprocessing.effects.FXAAPass?.enabled) {
          const fxaaPass = new ShaderPass(FXAAShader);
          this.composer.addPass(fxaaPass);
        }

        // SMAAPass
        if (sceneProfile.postprocessing.effects.SMAAPass?.enabled) {
          const smaaPass = new SMAAPass(
            window.innerWidth * this.config.renderer.getPixelRatio(),
            window.innerHeight * this.config.renderer.getPixelRatio()
          );
          this.composer.addPass(smaaPass);
        }

        // BokehPass
        if (sceneProfile.postprocessing.effects.BokehPass?.enabled) {
          const bokehPass = new BokehPass(
            this.config.scene,
            this.config.camera,
            {
              focus: sceneProfile.postprocessing.effects.BokehPass.focus,
              aperture: sceneProfile.postprocessing.effects.BokehPass.aperture,
              maxblur: sceneProfile.postprocessing.effects.BokehPass.maxblur,
            }
          );
          this.composer.addPass(bokehPass);
        }
      }

      // Konfiguracja kontroli kamery
      if (sceneProfile?.controls) {
        const controls = this.config.controls;
        if (controls) {
          controls.enableDamping = sceneProfile.controls.enableDamping;
          controls.dampingFactor = sceneProfile.controls.dampingFactor;
          controls.screenSpacePanning =
            sceneProfile.controls.screenSpacePanning;
          controls.minDistance = sceneProfile.controls.minDistance;
          controls.maxDistance = sceneProfile.controls.maxDistance;
          controls.maxPolarAngle = sceneProfile.controls.maxPolarAngle;
        }
      }

      console.log('✓ Scena skonfigurowana z profili');

      // Aktualizuj profile
      this.currentProfile = performanceProfile;
      this.currentScene = sceneProfile;
    } catch (error) {
      console.error('Błąd podczas konfiguracji sceny:', error);
      throw error;
    }
  }

  // Aktualizacja sceny
  updateScene() {
    if (!this.profileValidator) {
      throw new Error('Walidator profili nie jest zainicjalizowany');
    }

    if (!this.currentProfile || !this.currentScene) {
      console.warn(
        'SceneBuilder: Brak aktualnych profili, pomijam aktualizację'
      );
      return;
    }

    // Wywołaj configureScene tylko jeśli profile się zmieniły
    this.configureScene(this.currentProfile, this.currentScene);
  }

  // Resetowanie sceny do stanu początkowego
  async resetScene() {
    try {
      this.config.showLoading('Resetowanie sceny...');

      // Pobranie domyślnej konfiguracji z walidatora
      const defaultConfig = await this.profileValidator.getDefaultConfig({
        isMobile: window.innerWidth <= 768,
      });

      this.currentScene = defaultConfig.sceneProfile;
      this.currentProfile = defaultConfig.performanceProfile;

      // Wysłanie zdarzenia z domyślną konfiguracją
      window.dispatchEvent(
        new CustomEvent('sceneUpdate', {
          detail: {
            scene: this.currentScene,
            profile: this.currentProfile,
          },
        })
      );

      this.config.hideLoading();
    } catch (error) {
      this.config.showError(`Błąd podczas resetowania sceny: ${error.message}`);
    }
  }

  // Inicjalizacja sceny
  async init() {
    if (this.isInitialized) {
      console.log('SceneBuilder: Już zainicjalizowany, pomijam...');
      return;
    }

    try {
      this.config.showLoading('Inicjalizacja sceny...');
      await this.profileValidator.init();
      this.isInitialized = true;
      this.config.hideLoading();
    } catch (error) {
      this.config.showError(
        `Błąd podczas inicjalizacji sceny: ${error.message}`
      );
    }
  }

  getCurrentScene() {
    console.log('SceneBuilder: Pobieranie aktualnej sceny');
    return this.currentScene;
  }

  getCurrentProfile() {
    return this.currentProfile;
  }
}
