// Dodaj funkcję do wczytania konfiguracji autostartu
async function loadAutostartConfig() {
  try {
    console.log('Próba wczytania konfiguracji autostart.json');
    const response = await fetch('autostart.json');

    if (!response.ok) {
      console.warn(
        `Nie udało się wczytać autostart.json: Status ${response.status}`
      );
      return createDefaultAutostartConfig();
    }

    const config = await response.json();
    console.log('Wczytano konfigurację autostart.json:', config);

    // Walidacja wymaganych pól
    if (
      !config.profiles ||
      !config.profiles.desktop ||
      !config.profiles.mobile ||
      !config.profiles.fallback
    ) {
      console.warn('Niepełna konfiguracja autostart.json, używam domyślnej');
      return createDefaultAutostartConfig();
    }

    return config;
  } catch (error) {
    console.error('Błąd podczas wczytywania autostart.json:', error);
    return createDefaultAutostartConfig();
  }
}

// Tworzenie domyślnej konfiguracji autostartu
function createDefaultAutostartConfig() {
  return {
    profiles: {
      desktop: {
        performance: 'profile-medium',
        scene: 'scene-default',
      },
      mobile: {
        performance: 'profile-mobile',
        scene: 'scene-default',
      },
      fallback: {
        performance: 'profile-medium',
        scene: 'scene-default',
      },
    },
    debug: false,
    autoDetect: true,
  };
}

// Funkcja do jednorazowego wykrycia parametrów sprzętu
export async function detectDeviceCapabilities() {
  try {
    // Wczytaj konfigurację autostartu
    const autostartConfig = await loadAutostartConfig();

    // Określ typ urządzenia
    const isMobile = isMobileDevice();
    const deviceType = isMobile ? 'mobile' : 'desktop';
    console.log(`Wykryto urządzenie typu: ${deviceType}`);

    // Jeśli autoDetect jest wyłączony, zwróć podstawowe informacje
    if (autostartConfig && autostartConfig.autoDetect === false) {
      console.log(
        'Automatyczne wykrywanie urządzenia wyłączone w autostart.json'
      );
      return {
        userAgent: navigator.userAgent,
        isMobile: isMobile,
        performanceCategory: isMobile ? 'low' : 'medium',
        autostartConfig: autostartConfig,
        deviceType: deviceType,
      };
    }

    // Przeprowadź testy wydajności i zwróć wyniki
    const performanceTests = {
      webGL: await checkWebGLCapability(),
      webGPU: await checkWebGPUCapability(),
      fps: await measureFPS(),
      memory: await checkMemoryCapability(),
    };

    // Określ kategorię wydajności na podstawie wyników testów
    const performanceCategory = determinePerformanceCategory(performanceTests);

    // Na końcu dodaj konfigurację autostartu i typ urządzenia
    const result = {
      userAgent: navigator.userAgent,
      isMobile: isMobile,
      performanceCategory: performanceCategory,
      performanceTests: performanceTests,
      deviceType: deviceType,
      autostartConfig: autostartConfig,
    };

    console.log('Wyniki detekcji urządzenia:', result);
    return result;
  } catch (error) {
    console.error('Błąd podczas wykrywania parametrów urządzenia:', error);

    // Zwróć przynajmniej podstawowe, bezpieczne informacje w przypadku błędu
    const fallbackConfig = createDefaultAutostartConfig();
    const isMobile = isMobileDevice();

    return {
      isMobile: isMobile,
      deviceType: isMobile ? 'mobile' : 'desktop',
      performanceCategory: isMobile ? 'low' : 'medium',
      error: error.message,
      autostartConfig: fallbackConfig,
    };
  }
}

// Funkcja do określenia kategorii wydajnościowej
function determinePerformanceCategory(performanceTests) {
  if (!performanceTests.webGL.supported) {
    return 'low';
  }

  const fps = performanceTests.fps;
  if (fps < 30) {
    return 'low';
  } else if (fps < 60) {
    return 'medium';
  } else {
    return 'high';
  }
}

// Funkcja do sprawdzania czy urządzenie jest mobilne
export function isMobileDevice(deviceInfo) {
  // Sprawdzenie na podstawie User Agent
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileUserAgent = mobileRegex.test(navigator.userAgent);

  // Sprawdzenie na podstawie szerokości ekranu
  const isMobileScreen = window.innerWidth <= 768;

  // Sprawdzenie obsługi dotyku
  const hasTouchSupport =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return isMobileUserAgent || (isMobileScreen && hasTouchSupport);
}

// Funkcja pomocnicza do wyświetlania paska postępu testów
function showPerformanceTestProgress() {
  const container = document.createElement('div');
  container.id = 'performance-test-progress';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 9999;
    color: white;
    font-family: 'Dosis', sans-serif;
  `;

  const messageEl = document.createElement('div');
  messageEl.style.cssText = `
    margin-bottom: 20px;
    font-size: 16px;
  `;
  messageEl.textContent =
    'Trwa optymalizacja aplikacji dla Twojego urządzenia...';

  const progressWrap = document.createElement('div');
  progressWrap.style.cssText = `
    width: 300px;
    height: 10px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 5px;
    overflow: hidden;
  `;

  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    height: 100%;
    width: 0%;
    background: #3823a2;
    transition: width 0.3s ease;
  `;

  const statusEl = document.createElement('div');
  statusEl.style.cssText = `
    margin-top: 10px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  `;
  statusEl.textContent = 'Inicjalizacja...';

  progressWrap.appendChild(progressBar);
  container.appendChild(messageEl);
  container.appendChild(progressWrap);
  container.appendChild(statusEl);
  document.body.appendChild(container);

  return {
    update: (progress, status) => {
      progressBar.style.width = `${progress * 100}%`;
      statusEl.textContent = status;
    },
    error: (message) => {
      messageEl.textContent = 'Wystąpił problem podczas optymalizacji.';
      messageEl.style.color = '#ff5555';
      statusEl.textContent = message;
      progressBar.style.backgroundColor = '#ff5555';
    },
  };
}

// Funkcja do ukrywania paska postępu
function hidePerformanceTestProgress(progressBar) {
  const container = document.getElementById('performance-test-progress');
  if (container) {
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }, 500);
  }
}

// Pomocnicza funkcja sleep
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class DeviceDetection {
  constructor() {
    console.log('DeviceDetection: Inicjalizacja...');
    this.deviceType = null;
    this.capabilities = null;
    console.log('DeviceDetection: Inicjalizacja zakończona');
  }

  async init() {
    console.log('DeviceDetection: Rozpoczynanie inicjalizacji...');
    try {
      console.log('DeviceDetection: Wykrywanie typu urządzenia...');
      this.deviceType = this.detectDeviceType();
      console.log('DeviceDetection: Typ urządzenia wykryty:', this.deviceType);

      console.log('DeviceDetection: Wykrywanie możliwości urządzenia...');
      this.capabilities = await this.detectCapabilities();
      console.log(
        'DeviceDetection: Możliwości urządzenia wykryte:',
        this.capabilities
      );

      console.log('DeviceDetection: Inicjalizacja zakończona pomyślnie');
      return true;
    } catch (error) {
      console.error('DeviceDetection: Błąd podczas inicjalizacji:', error);
      throw error;
    }
  }

  detectDeviceType() {
    console.log('DeviceDetection: Sprawdzanie typu urządzenia...');
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
    const deviceType = isMobile ? 'mobile' : 'desktop';
    console.log('DeviceDetection: Wykryty typ urządzenia:', deviceType);
    return deviceType;
  }

  async detectCapabilities() {
    console.log('DeviceDetection: Wykrywanie możliwości urządzenia...');
    const capabilities = {
      webgl: await this.checkWebGLCapability(),
      webgpu: await this.checkWebGPUCapability(),
      performance: await this.checkPerformanceCapability(),
    };
    console.log('DeviceDetection: Wykryte możliwości:', capabilities);
    return capabilities;
  }

  async checkWebGLCapability() {
    console.log('DeviceDetection: Sprawdzanie możliwości WebGL...');
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const isSupported = !!gl;
      console.log('DeviceDetection: WebGL wspierany:', isSupported);
      return { supported: isSupported, version: gl.getParameter(gl.VERSION) };
    } catch (error) {
      console.error('DeviceDetection: Błąd podczas sprawdzania WebGL:', error);
      return { supported: false, message: error.message };
    }
  }

  async checkWebGPUCapability() {
    console.log('DeviceDetection: Sprawdzanie możliwości WebGPU...');
    try {
      if (!navigator.gpu) {
        return { supported: false, message: 'WebGPU nie jest wspierany' };
      }
      const adapter = await navigator.gpu.requestAdapter();
      console.log('DeviceDetection: WebGPU wspierany:', !!adapter);
      return { supported: !!adapter, adapter: adapter };
    } catch (error) {
      console.error('DeviceDetection: Błąd podczas sprawdzania WebGPU:', error);
      return { supported: false, message: error.message };
    }
  }

  async checkPerformanceCapability() {
    console.log('DeviceDetection: Sprawdzanie wydajności urządzenia...');
    try {
      const score = this.calculatePerformanceScore();
      console.log('DeviceDetection: Wynik wydajności:', score);
      return score;
    } catch (error) {
      console.error(
        'DeviceDetection: Błąd podczas sprawdzania wydajności:',
        error
      );
      return 0;
    }
  }

  calculatePerformanceScore() {
    console.log('DeviceDetection: Obliczanie wyniku wydajności...');
    let score = 0;

    // Sprawdzenie pamięci
    if (navigator.deviceMemory) {
      score += navigator.deviceMemory * 10;
      console.log(
        'DeviceDetection: Pamięć urządzenia:',
        navigator.deviceMemory,
        'GB'
      );
    }

    // Sprawdzenie liczby rdzeni
    if (navigator.hardwareConcurrency) {
      score += navigator.hardwareConcurrency * 5;
      console.log(
        'DeviceDetection: Liczba rdzeni:',
        navigator.hardwareConcurrency
      );
    }

    console.log('DeviceDetection: Całkowity wynik wydajności:', score);
    return score;
  }

  getDeviceType() {
    console.log('DeviceDetection: Pobieranie typu urządzenia');
    return this.deviceType;
  }

  getCapabilities() {
    console.log('DeviceDetection: Pobieranie możliwości urządzenia');
    return this.capabilities;
  }
}

// Funkcje pomocnicze do testów wydajności
async function measureFPS() {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    let frames = 0;
    let startTime = performance.now();

    function render() {
      frames++;
      const currentTime = performance.now();
      if (currentTime - startTime >= 1000) {
        resolve(frames);
        return;
      }
      requestAnimationFrame(render);
    }

    render();
  });
}

async function checkMemoryCapability() {
  try {
    if (performance.memory) {
      return {
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      };
    }
    return {
      supported: false,
      message: 'Performance.memory nie jest wspierane',
    };
  } catch (error) {
    return { supported: false, message: error.message };
  }
}
