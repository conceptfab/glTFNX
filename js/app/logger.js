// Kolory dla różnych modułów
const MODULE_COLORS = {
  SceneBuilder: '#4CAF50', // zielony
  LightManager: '#2196F3', // niebieski
  DeviceDetection: '#FF9800', // pomarańczowy
  ModelManager: '#9C27B0', // fioletowy
  DebugManager: '#607D8B', // szary
  App: '#E91E63', // różowy
  UI: '#00BCD4', // cyjan
  ProfileValidator: '#FF5722', // ciemny pomarańczowy
  ErrorLogger: '#F44336', // czerwony
  StateManager: '#8BC34A', // jasny zielony
  FileManager: '#673AB7', // głęboki fiolet
  ViewManager: '#009688', // teal
  SettingsManager: '#795548', // brązowy
  NotificationManager: '#FFC107', // żółty
  default: '#000000', // czarny
};

// Style dla poziomów logowania
const LOG_LEVELS = {
  INFO: {
    icon: 'ℹ️',
    color: '#2196F3',
    consoleMethod: 'info',
  },
  DEBUG: {
    icon: '🔍',
    color: '#4CAF50',
    consoleMethod: 'debug',
  },
  WARN: {
    icon: '⚠️',
    color: '#FF9800',
    consoleMethod: 'warn',
  },
  ERROR: {
    icon: '❌',
    color: '#F44336',
    consoleMethod: 'error',
  },
};

class Logger {
  constructor() {
    this.isEnabled = true;
    this.logHistory = [];
    this.maxHistorySize = 1000;
  }

  // Główna metoda logująca
  log(module, level, message, data = null) {
    if (!this.isEnabled) return;

    const timestamp = new Date().toLocaleTimeString();
    const moduleColor = MODULE_COLORS[module] || MODULE_COLORS.default;
    const levelConfig = LOG_LEVELS[level] || LOG_LEVELS.INFO;

    // Formatowanie wiadomości
    const formattedMessage = `%c${levelConfig.icon} [${module}] ${message}`;
    const style = `color: ${moduleColor}; font-weight: bold;`;

    // Logowanie do konsoli
    console[levelConfig.consoleMethod](formattedMessage, style);
    if (data) {
      // Formatowanie danych
      const formattedData = `%c${JSON.stringify(data, null, 2)}`;
      const dataStyle = `color: ${moduleColor};`;
      console[levelConfig.consoleMethod](formattedData, dataStyle);
    }

    // Zapisywanie w historii
    this.logHistory.push({
      timestamp,
      module,
      level,
      message,
      data,
    });

    // Ograniczenie rozmiaru historii
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  // Metody pomocnicze dla różnych poziomów logowania
  info(module, message, data = null) {
    this.log(module, 'INFO', message, data);
  }

  debug(module, message, data = null) {
    this.log(module, 'DEBUG', message, data);
  }

  warn(module, message, data = null) {
    this.log(module, 'WARN', message, data);
  }

  error(module, message, data = null) {
    this.log(module, 'ERROR', message, data);
  }

  // Pobieranie historii logów
  getHistory() {
    return this.logHistory;
  }

  // Czyszczenie historii
  clearHistory() {
    this.logHistory = [];
  }

  // Włączanie/wyłączanie logowania
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }
}

// Eksport singletonu
export const logger = new Logger();
