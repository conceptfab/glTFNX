import { UI } from './ui.js';
import { ProfileValidator } from './profile-validator.js';
import { Viewer } from './viewer.js';
import { SceneManager } from './scene-manager.js';
import { ModelManager } from './model-manager.js';
import { PerformanceManager } from './performance-manager.js';
import { SceneBuilder } from './scene-builder.js';
import { ErrorLogger } from './error-logger.js';
import { StateManager } from './state-manager.js';
import { FileManager } from './file-manager.js';
import { ViewManager } from './view-manager.js';
import { SettingsManager } from './settings-manager.js';
import { NotificationManager } from './notification-manager.js';

// Główna klasa aplikacji
export class App {
  constructor() {
    // Komponenty aplikacji
    this.ui = null;
    this.profileValidator = null;
    this.viewer = null;
    this.sceneManager = null;
    this.modelManager = null;
    this.performanceManager = null;
    this.sceneBuilder = null;
    this.errorLogger = new ErrorLogger();
    this.stateManager = new StateManager();
    this.fileManager = new FileManager();
    this.viewManager = new ViewManager();
    this.settingsManager = new SettingsManager();
    this.notificationManager = new NotificationManager();

    // Stan aplikacji
    this.state = {
      isInitialized: false,
      error: null,
    };

    this.setupErrorHandling();
    this.setupStateListeners();
    this.initialize();
  }

  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      this.errorLogger.logError(event.error);
      this.stateManager.updateState({ error: event.error });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.errorLogger.logError(event.reason);
      this.stateManager.updateState({ error: event.reason });
    });
  }

  setupStateListeners() {
    this.stateManager.addListener((state) => {
      if (state.error) {
        this.notificationManager.showError(state.error.message);
      }
      if (state.isLoading) {
        this.viewManager.showLoading();
      } else {
        this.viewManager.hideLoading();
      }
    });
  }

  async initialize() {
    try {
      this.stateManager.updateState({ isLoading: true });
      await this.settingsManager.loadSettings();
      await this.viewManager.initialize();
      this.stateManager.updateState({ isLoading: false });
    } catch (error) {
      this.errorLogger.logError(error);
      this.stateManager.updateState({ error, isLoading: false });
    }
  }

  async handleFileUpload(file) {
    try {
      this.stateManager.updateState({ isLoading: true });
      const result = await this.fileManager.processFile(file);
      this.viewManager.updateView(result);
      this.stateManager.updateState({ isLoading: false });
    } catch (error) {
      this.errorLogger.logError(error);
      this.stateManager.updateState({ error, isLoading: false });
    }
  }

  // Inicjalizacja aplikacji
  async init() {
    try {
      // Inicjalizacja walidatora profili
      this.profileValidator = new ProfileValidator();
      await this.profileValidator.init();

      // Inicjalizacja menedżera sceny
      this.sceneManager = new SceneManager();
      await this.sceneManager.init();

      // Inicjalizacja budowniczego sceny
      this.sceneBuilder = new SceneBuilder({
        scene: this.sceneManager.scene,
        camera: this.sceneManager.camera,
        renderer: this.sceneManager.renderer,
      });
      this.sceneBuilder.setProfileValidator(this.profileValidator);

      // Inicjalizacja menedżera modeli
      this.modelManager = new ModelManager(this.sceneManager);

      // Inicjalizacja menedżera wydajności
      this.performanceManager = new PerformanceManager(
        this.sceneManager,
        this.profileValidator
      );

      // Inicjalizacja interfejsu użytkownika
      this.ui = new UI();
      await this.ui.init();

      // Inicjalizacja przeglądarki modeli
      this.viewer = await new Viewer().init();

      // Konfiguracja obsługi zdarzeń
      this.setupEventListeners();

      // Oznaczenie aplikacji jako zainicjalizowanej
      this.state.isInitialized = true;

      return this;
    } catch (error) {
      console.error('Błąd podczas inicjalizacji aplikacji:', error);
      this.state.error = error;
      throw error;
    }
  }

  // Konfiguracja obsługi zdarzeń
  setupEventListeners() {
    // Obsługa zmiany profilu
    window.addEventListener('profileChanged', (event) => {
      this.handleProfileChange(event.detail.profile);
    });

    // Obsługa zmiany sceny
    window.addEventListener('sceneChanged', (event) => {
      this.handleSceneChange(event);
    });

    // Obsługa zmiany ustawień
    window.addEventListener('settingsApplied', (event) => {
      this.handleSettingsChange(event.detail.settings);
    });
  }

  // Obsługa zmiany profilu
  handleProfileChange(profile) {
    try {
      console.log('Zmieniono profil:', profile);
      // TODO: Implementacja obsługi zmiany profilu
    } catch (error) {
      console.error('Błąd podczas obsługi zmiany profilu:', error);
    }
  }

  // Obsługa zmiany sceny
  async handleSceneChange(event) {
    try {
      const { sceneName, sceneConfig } = event.detail;

      // Walidacja konfiguracji sceny
      const validationResult = await this.profileValidator.validateSceneConfig(
        sceneConfig
      );
      if (!validationResult.isValid) {
        throw new Error(
          `Nieprawidłowa konfiguracja sceny: ${validationResult.errors.join(
            ', '
          )}`
        );
      }

      // Konfiguracja sceny
      await this.sceneBuilder.configureScene(sceneConfig);

      // Aktualizacja interfejsu
      this.ui.updateSceneControls(sceneConfig);

      // Aktualizacja wydajności
      this.performanceManager.updatePerformanceSettings(sceneConfig);

      console.log(`Scena "${sceneName}" została pomyślnie załadowana`);
    } catch (error) {
      console.error('Błąd podczas zmiany sceny:', error);
      this.ui.showError('Nie udało się załadować sceny. Spróbuj ponownie.');
    }
  }

  // Obsługa zmiany ustawień
  async handleSettingsChange(settings) {
    try {
      // Walidacja ustawień
      const validationResult = await this.profileValidator.validateSettings(
        settings
      );
      if (!validationResult.isValid) {
        throw new Error(
          `Nieprawidłowe ustawienia: ${validationResult.errors.join(', ')}`
        );
      }

      // Aktualizacja ustawień sceny
      await this.sceneBuilder.updateSettings(settings);

      // Aktualizacja wydajności
      this.performanceManager.updatePerformanceSettings(settings);

      // Aktualizacja interfejsu
      this.ui.updateSettingsControls(settings);

      console.log('Ustawienia zostały pomyślnie zaktualizowane');
    } catch (error) {
      console.error('Błąd podczas aktualizacji ustawień:', error);
      this.ui.showError(
        'Nie udało się zaktualizować ustawień. Spróbuj ponownie.'
      );
    }
  }
}
