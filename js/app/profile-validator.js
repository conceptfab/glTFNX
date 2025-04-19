// Funkcja asynchroniczna do wczytywania profiles.json
export async function loadProfilesJson() {
  try {
    const response = await fetch('/profiles/profiles.json');
    if (!response.ok) {
      throw new Error(
        `Błąd HTTP podczas wczytywania profiles.json: ${response.status}`
      );
    }
    const data = await response.json();

    // Wczytaj zawartość każdego profilu
    for (const profile of data.profiles) {
      try {
        const profileResponse = await fetch(profile.path);
        if (!profileResponse.ok) {
          throw new Error(
            `Błąd HTTP podczas wczytywania ${profile.path}: ${profileResponse.status}`
          );
        }
        const profileData = await profileResponse.json();
        Object.assign(profile, profileData);
      } catch (error) {
        console.error(`Błąd podczas wczytywania profilu ${profile.id}:`, error);
      }
    }

    const performanceProfiles = data.profiles.filter(
      (p) => p.category === 'profile'
    );
    const sceneProfiles = data.profiles.filter((p) => p.category === 'scene');

    // Walidacja profili wydajności
    let performanceErrors = [];
    performanceProfiles.forEach((profile) => {
      const errors = validatePerformanceProfile(profile);
      if (errors.length > 0) {
        performanceErrors.push({ id: profile.id, errors });
      }
    });

    // Walidacja profili sceny
    let sceneErrors = [];
    sceneProfiles.forEach((profile) => {
      const errors = validateSceneProfile(profile);
      if (errors.length > 0) {
        sceneErrors.push({ id: profile.id, errors });
      }
    });

    // Logowanie wyników walidacji
    if (performanceErrors.length > 0) {
      console.log(
        `🔍 waliduje profile wydajność: ${
          performanceProfiles.length - performanceErrors.length
        }/${performanceProfiles.length} - profil "${
          performanceErrors[0].id
        }" jest nieprawidłowy`
      );
    } else {
      console.log(
        `🔍 waliduje profile wydajność: ${performanceProfiles.length}/${performanceProfiles.length} prawidłowe`
      );
    }

    if (sceneErrors.length > 0) {
      console.log(
        `🔍 waliduje profile scen: ${
          sceneProfiles.length - sceneErrors.length
        }/${sceneProfiles.length} - profil "${
          sceneErrors[0].id
        }" jest nieprawidłowy`
      );
    } else {
      console.log(
        `🔍 waliduje profile scen: ${sceneProfiles.length}/${sceneProfiles.length} prawidłowe`
      );
    }

    return data;
  } catch (error) {
    console.error('Błąd podczas wczytywania profiles.json:', error);
    return { profiles: [] };
  }
}

// Funkcja pomocnicza do walidacji obiektów
function validateObject(obj, schema, context, profileId = null) {
  const errors = [];
  // Jeśli nie mamy ID profilu, spróbuj je znaleźć w obiekcie
  const currentProfileId = profileId || obj.id || 'Nieznany profil';

  for (const [key, value] of Object.entries(schema)) {
    if (obj[key] === undefined) {
      errors.push(
        `[${currentProfileId}] ${context}: Brak wymaganego pola "${key}"`
      );
      continue;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      errors.push(
        ...validateObject(
          obj[key],
          value,
          `${context}.${key}`,
          currentProfileId
        )
      );
    } else if (Array.isArray(value)) {
      if (!value.includes(obj[key])) {
        errors.push(
          `[${currentProfileId}] ${context}.${key}: Nieprawidłowa wartość "${
            obj[key]
          }". Oczekiwano jednej z: ${value.join(', ')}`
        );
      }
    } else if (value === 'boolean' && typeof obj[key] !== 'boolean') {
      errors.push(
        `[${currentProfileId}] ${context}.${key}: Oczekiwano wartości boolean, otrzymano ${typeof obj[
          key
        ]}`
      );
    } else if (value === 'number' && typeof obj[key] !== 'number') {
      errors.push(
        `[${currentProfileId}] ${context}.${key}: Oczekiwano wartości number, otrzymano ${typeof obj[
          key
        ]}`
      );
    } else if (value === 'string' && typeof obj[key] !== 'string') {
      // Specjalna obsługa dla kolorów - akceptuj zarówno string jak i number
      if (
        key === 'color' &&
        (typeof obj[key] === 'string' || typeof obj[key] === 'number')
      ) {
        continue;
      }
      errors.push(
        `[${currentProfileId}] ${context}.${key}: Oczekiwano wartości string, otrzymano ${typeof obj[
          key
        ]}`
      );
    }
  }
  return errors;
}

// Walidacja profilu wydajności
function validatePerformanceProfile(profile) {
  const requiredFields = {
    renderer: {
      antialias: 'boolean',
      precision: ['highp', 'mediump', 'lowp'],
      powerPreference: ['default', 'high-performance', 'low-power'],
      failIfMajorPerformanceCaveat: 'boolean',
      depth: 'boolean',
      stencil: 'boolean',
      premultipliedAlpha: 'boolean',
      preserveDrawingBuffer: 'boolean',
      xrCompatible: 'boolean',
      autoClear: 'boolean',
      shadowMap: {
        enabled: 'boolean',
        type: [
          'BasicShadowMap',
          'PCFShadowMap',
          'PCFSoftShadowMap',
          'VSMShadowMap',
        ],
        mapSize: {
          width: 'number',
          height: 'number',
        },
        blurSamples: 'number',
        bias: 'number',
        radius: 'number',
      },
      physicallyCorrectLights: 'boolean',
      logarithmicDepthBuffer: 'boolean',
      pixelRatio: 'number',
      toneMapping: [
        'NoToneMapping',
        'LinearToneMapping',
        'ReinhardToneMapping',
        'CineonToneMapping',
        'ACESFilmicToneMapping',
      ],
      toneMappingExposure: 'number',
      outputEncoding: 'string',
      alpha: 'boolean',
    },
  };

  return validateObject(
    profile,
    requiredFields,
    'Profil wydajności',
    profile.id
  );
}

// Walidacja profilu sceny
function validateSceneProfile(profile) {
  const requiredFields = {
    lighting: {
      enabled: 'boolean',
      visible: 'boolean',
      ambient: {
        enabled: 'boolean',
        color: 'string',
        intensity: 'number',
      },
      hemisphere: {
        enabled: 'boolean',
        skyColor: 'string',
        groundColor: 'string',
        intensity: 'number',
      },
    },
    lights: 'array',
    postprocessing: {
      enabled: 'boolean',
      effects: {
        EffectComposer: { enabled: 'boolean' },
        RenderPass: { enabled: 'boolean' },
        UnrealBloomPass: {
          enabled: 'boolean',
          strength: 'number',
          radius: 'number',
          threshold: 'number',
        },
        SSAOPass: {
          enabled: 'boolean',
          radius: 'number',
          intensity: 'number',
          bias: 'number',
        },
        FXAAPass: { enabled: 'boolean' },
        BokehPass: {
          enabled: 'boolean',
          focus: 'number',
          aperture: 'number',
          maxblur: 'number',
        },
      },
    },
    cameras: {
      default: {
        fov: 'number',
        near: 'number',
        far: 'number',
        position: {
          x: 'number',
          y: 'number',
          z: 'number',
        },
        target: {
          x: 'number',
          y: 'number',
          z: 'number',
        },
      },
    },
    controls: {
      enableDamping: 'boolean',
      dampingFactor: 'number',
      rotateSpeed: 'number',
      panSpeed: 'number',
      zoomSpeed: 'number',
      minDistance: 'number',
      maxDistance: 'number',
      minPolarAngle: 'number',
      maxPolarAngle: 'number',
      enablePan: 'boolean',
      enableRotate: 'boolean',
      enableZoom: 'boolean',
    },
    background: {
      color: 'number',
    },
  };

  return validateObject(profile, requiredFields, 'Profil sceny', profile.id);
}

// Funkcja do wczytywania domyślnych profili wydajności i sceny na starcie
export async function getInitialProfiles() {
  try {
    // Próba wczytania domyślnych profili
    const perfResponse = await fetch('/profiles/performance/default.json');
    if (!perfResponse.ok) {
      throw new Error(
        `Błąd HTTP podczas wczytywania default.json: ${perfResponse.status}`
      );
    }
    const performanceProfile = await perfResponse.json();
    validatePerformanceProfile(performanceProfile);

    const sceneResponse = await fetch('/profiles/scenes/scene-default.json');
    if (!sceneResponse.ok) {
      throw new Error(
        `Błąd HTTP podczas wczytywania scene-default.json: ${sceneResponse.status}`
      );
    }
    const sceneProfile = await sceneResponse.json();
    validateSceneProfile(sceneProfile);

    console.log(
      'Domyślny profil wydajności został poprawnie wczytany:',
      performanceProfile
    );
    console.log('Domyślna scena została poprawnie wczytana:', sceneProfile);

    return {
      performanceProfile,
      sceneProfile,
    };
  } catch (error) {
    console.error('Błąd podczas wczytywania domyślnych profili:', error);
    throw error;
  }
}

// Funkcja do wczytywania konkretnych profili
export async function loadProfiles({ performanceProfile, sceneProfile }) {
  try {
    // Wczytaj profil wydajności
    const perfResponse = await fetch(
      `/profiles/performance/${performanceProfile}.json`
    );
    if (!perfResponse.ok) {
      throw new Error(
        `Błąd HTTP podczas wczytywania profilu wydajności: ${perfResponse.status}`
      );
    }
    const performanceProfileData = await perfResponse.json();
    validatePerformanceProfile(performanceProfileData);

    // Wczytaj profil sceny
    const sceneResponse = await fetch(`/profiles/scenes/${sceneProfile}.json`);
    if (!sceneResponse.ok) {
      throw new Error(
        `Błąd HTTP podczas wczytywania profilu sceny: ${sceneResponse.status}`
      );
    }
    const sceneProfileData = await sceneResponse.json();
    validateSceneProfile(sceneProfileData);

    console.log('Profile zostały poprawnie wczytane:', {
      performanceProfile: performanceProfileData,
      sceneProfile: sceneProfileData,
    });

    return {
      performanceProfile: performanceProfileData,
      sceneProfile: sceneProfileData,
    };
  } catch (error) {
    console.error('Błąd podczas wczytywania profili:', error);
    throw error;
  }
}
