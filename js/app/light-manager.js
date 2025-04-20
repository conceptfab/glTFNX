import * as THREE from 'three';

export class LightManager {
  constructor() {
    this.lightConfigs = []; // Tablica przechowująca konfiguracje świateł
    this.isLightingVisible = false;
  }

  // Inicjalizacja konfiguracji świateł na podstawie profilu sceny
  initFromProfile(sceneProfile) {
    console.log(
      '💡 LightManager: Inicjalizacja konfiguracji świateł z profilu:',
      sceneProfile
    );

    // Wyczyść istniejące konfiguracje
    this.lightConfigs = [];

    if (!sceneProfile?.lighting?.enabled) {
      console.log('💡 LightManager: Oświetlenie wyłączone w profilu');
      return;
    }

    // Ustaw widoczność oświetlenia
    this.isLightingVisible = sceneProfile.lighting.visible || false;

    // Dodaj konfigurację światła ambient
    if (sceneProfile.lighting.ambient?.enabled) {
      this.lightConfigs.push(
        this.createAmbientLightConfig(sceneProfile.lighting.ambient)
      );
    }

    // Dodaj konfigurację światła hemisphere
    if (sceneProfile.lighting.hemisphere?.enabled) {
      this.lightConfigs.push(
        this.createHemisphereLightConfig(sceneProfile.lighting.hemisphere)
      );
    }

    // Dodaj konfiguracje pozostałych świateł
    if (sceneProfile.lights?.length > 0) {
      sceneProfile.lights.forEach((lightConfig) => {
        if (lightConfig.enabled === true) {
          this.lightConfigs.push(this.createLightConfig(lightConfig));
        }
      });
    }
  }

  // Tworzenie konfiguracji światła ambient
  createAmbientLightConfig(config) {
    return {
      type: 'AmbientLight',
      name: 'ambient_light',
      color: this.parseColor(config.color),
      intensity: config.intensity,
      visible: this.isLightingVisible,
    };
  }

  // Tworzenie konfiguracji światła hemisphere
  createHemisphereLightConfig(config) {
    return {
      type: 'HemisphereLight',
      name: 'hemisphere_light',
      skyColor: this.parseColor(config.skyColor),
      groundColor: this.parseColor(config.groundColor),
      intensity: config.intensity,
      visible: this.isLightingVisible,
    };
  }

  // Tworzenie konfiguracji dowolnego typu światła
  createLightConfig(config) {
    const name = config.name || `${config.type.toLowerCase()}_${Date.now()}`;
    const lightConfig = {
      type: config.type,
      name: name,
      color: this.parseColor(config.color),
      intensity: config.intensity,
      visible: this.isLightingVisible,
    };

    // Dodaj specyficzne parametry dla różnych typów świateł
    switch (config.type) {
      case 'DirectionalLight':
        if (config.position) lightConfig.position = config.position;
        if (config.target) lightConfig.target = config.target;
        if (config.castShadow) lightConfig.castShadow = config.castShadow;
        break;

      case 'PointLight':
        if (config.position) lightConfig.position = config.position;
        if (config.distance) lightConfig.distance = config.distance;
        if (config.decay) lightConfig.decay = config.decay;
        if (config.castShadow) lightConfig.castShadow = config.castShadow;
        break;

      case 'SpotLight':
        if (config.position) lightConfig.position = config.position;
        if (config.target) lightConfig.target = config.target;
        if (config.distance) lightConfig.distance = config.distance;
        if (config.angle) lightConfig.angle = config.angle;
        if (config.penumbra) lightConfig.penumbra = config.penumbra;
        if (config.decay) lightConfig.decay = config.decay;
        if (config.castShadow) lightConfig.castShadow = config.castShadow;
        break;

      case 'RectAreaLight':
        if (config.position) lightConfig.position = config.position;
        if (config.rotation) lightConfig.rotation = config.rotation;
        if (config.width) lightConfig.width = config.width;
        if (config.height) lightConfig.height = config.height;
        break;
    }

    // Dodaj konfigurację pomocnika jeśli jest wymagana
    if (config.helper?.visible) {
      lightConfig.helper = {
        visible: config.helper.visible,
        size: config.helper.size || 1,
      };
    }

    return lightConfig;
  }

  // Pobieranie wszystkich konfiguracji świateł
  getLightConfigs() {
    return this.lightConfigs;
  }

  // Przełączanie widoczności oświetlenia
  toggleLightVisibility() {
    this.isLightingVisible = !this.isLightingVisible;
    this.lightConfigs.forEach((config) => {
      config.visible = this.isLightingVisible;
    });
    return this.isLightingVisible;
  }

  // Konwersja koloru z różnych formatów
  parseColor(color) {
    if (typeof color === 'string') {
      if (color.startsWith('#')) {
        return new THREE.Color(color);
      }
      return new THREE.Color(parseInt(color.replace('#', '0x'), 16));
    } else if (typeof color === 'number') {
      return new THREE.Color(color);
    }
    console.warn('💡 LightManager: Nierozpoznany format koloru:', color);
    return new THREE.Color(0xffffff);
  }
}
