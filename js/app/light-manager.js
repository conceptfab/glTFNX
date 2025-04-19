import * as THREE from 'three';

export class LightManager {
  constructor() {
    this.lights = new Map(); // Mapa przechowująca wszystkie światła
    this.helpers = new Map(); // Mapa przechowująca pomocniki świateł
    this.isLightingVisible = false;
  }

  // Inicjalizacja świateł na podstawie profilu sceny
  initFromProfile(sceneProfile) {
    console.log(
      '💡 LightManager: Inicjalizacja świateł z profilu:',
      sceneProfile
    );

    // Usuń wszystkie istniejące światła
    this.clearAllLights();

    if (!sceneProfile?.lighting?.enabled) {
      console.log('💡 LightManager: Oświetlenie wyłączone w profilu');
      return [];
    }

    // Ustaw widoczność oświetlenia
    this.isLightingVisible = sceneProfile.lighting.visible || false;

    const lights = [];

    // Dodaj światło ambient
    if (sceneProfile.lighting.ambient?.enabled) {
      lights.push(this.addAmbientLight(sceneProfile.lighting.ambient));
    }

    // Dodaj światło hemisphere
    if (sceneProfile.lighting.hemisphere?.enabled) {
      lights.push(this.addHemisphereLight(sceneProfile.lighting.hemisphere));
    }

    // Dodaj pozostałe światła
    if (sceneProfile.lights?.length > 0) {
      sceneProfile.lights.forEach((lightConfig) => {
        if (lightConfig.enabled === true) {
          lights.push(this.addLight(lightConfig));
        }
      });
    }

    return lights;
  }

  // Dodawanie światła ambient
  addAmbientLight(config) {
    const light = new THREE.AmbientLight(
      this.parseColor(config.color),
      config.intensity
    );
    light.name = 'ambient_light';
    this.lights.set(light.name, light);
    console.log('💡 LightManager: Utworzono światło ambient:', light);
    return light;
  }

  // Dodawanie światła hemisphere
  addHemisphereLight(config) {
    const light = new THREE.HemisphereLight(
      this.parseColor(config.skyColor),
      this.parseColor(config.groundColor),
      config.intensity
    );
    light.name = 'hemisphere_light';
    this.lights.set(light.name, light);
    console.log('💡 LightManager: Utworzono światło hemisphere:', light);
    return light;
  }

  // Dodawanie dowolnego typu światła
  addLight(config) {
    let light;
    const name = config.name || `${config.type.toLowerCase()}_${Date.now()}`;

    switch (config.type) {
      case 'DirectionalLight':
        light = new THREE.DirectionalLight(
          this.parseColor(config.color),
          config.intensity
        );
        if (config.position) {
          light.position.set(
            config.position.x,
            config.position.y,
            config.position.z
          );
        }
        if (config.target) {
          light.target.position.set(
            config.target.x,
            config.target.y,
            config.target.z
          );
        }
        if (config.castShadow) {
          light.castShadow = true;
        }
        break;

      case 'PointLight':
        light = new THREE.PointLight(
          this.parseColor(config.color),
          config.intensity,
          config.distance || 0,
          config.decay || 1
        );
        if (config.position) {
          light.position.set(
            config.position.x,
            config.position.y,
            config.position.z
          );
        }
        if (config.castShadow) {
          light.castShadow = true;
        }
        break;

      case 'SpotLight':
        light = new THREE.SpotLight(
          this.parseColor(config.color),
          config.intensity,
          config.distance || 0,
          config.angle || Math.PI / 3,
          config.penumbra || 0,
          config.decay || 1
        );
        if (config.position) {
          light.position.set(
            config.position.x,
            config.position.y,
            config.position.z
          );
        }
        if (config.target) {
          light.target.position.set(
            config.target.x,
            config.target.y,
            config.target.z
          );
        }
        if (config.castShadow) {
          light.castShadow = true;
        }
        break;

      case 'RectAreaLight':
        light = new THREE.RectAreaLight(
          this.parseColor(config.color),
          config.intensity,
          config.width || 10,
          config.height || 10
        );
        if (config.position) {
          light.position.set(
            config.position.x,
            config.position.y,
            config.position.z
          );
        }
        if (config.rotation) {
          light.rotation.set(
            config.rotation.x,
            config.rotation.y,
            config.rotation.z
          );
        }
        break;

      default:
        console.warn(`💡 LightManager: Nieznany typ światła: ${config.type}`);
        return null;
    }

    light.name = name;
    this.lights.set(name, light);

    // Utwórz pomocnik światła jeśli jest skonfigurowany
    if (config.helper?.visible) {
      this.createLightHelper(light, config.helper);
    }

    console.log('💡 LightManager: Utworzono światło:', light);
    return light;
  }

  // Tworzenie pomocnika światła
  createLightHelper(light, config) {
    let helper;

    switch (light.type) {
      case 'DirectionalLight':
        helper = new THREE.DirectionalLightHelper(light, config.size || 1);
        break;

      case 'PointLight':
        helper = new THREE.PointLightHelper(light, config.size || 1);
        break;

      case 'SpotLight':
        helper = new THREE.SpotLightHelper(light);
        break;

      case 'RectAreaLight':
        helper = new THREE.RectAreaLightHelper(light);
        break;

      default:
        return null;
    }

    this.helpers.set(light.name, helper);
    console.log('💡 LightManager: Utworzono pomocnik światła:', helper);
    return helper;
  }

  // Usuwanie światła
  removeLight(name) {
    const light = this.lights.get(name);
    if (light) {
      // Usuń pomocnik jeśli istnieje
      this.helpers.delete(name);

      this.lights.delete(name);
      console.log('💡 LightManager: Usunięto światło:', name);
    }
  }

  // Usuwanie wszystkich świateł
  clearAllLights() {
    this.lights.clear();
    this.helpers.clear();
    console.log('💡 LightManager: Usunięto wszystkie światła');
  }

  // Aktualizacja widoczności świateł
  updateLightVisibility() {
    this.lights.forEach((light) => {
      light.visible = this.isLightingVisible;
    });
    console.log(
      '💡 LightManager: Zaktualizowano widoczność świateł:',
      this.isLightingVisible
    );
  }

  // Przełączanie widoczności świateł
  toggleLightVisibility() {
    this.isLightingVisible = !this.isLightingVisible;
    this.updateLightVisibility();
  }

  // Przełączanie widoczności pomocników
  toggleHelpersVisibility() {
    this.helpers.forEach((helper) => {
      helper.visible = !helper.visible;
    });
    console.log('💡 LightManager: Przełączono widoczność pomocników świateł');
  }

  // Konwersja koloru
  parseColor(color) {
    if (typeof color === 'string') {
      return new THREE.Color(color);
    }
    return new THREE.Color(color);
  }

  // Pobieranie informacji o światłach
  getLightInfo() {
    const info = [];
    this.lights.forEach((light) => {
      info.push({
        name: light.name,
        type: light.type,
        color: light.color.getHexString(),
        intensity: light.intensity,
        position: light.position.clone(),
        visible: light.visible,
      });
    });
    return info;
  }
}
