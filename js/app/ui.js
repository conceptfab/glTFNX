// Inicjalizacja interfejsu użytkownika
export async function initUI() {
  const ui = new UI();
  await ui.init();
  return ui;
}

// Klasa zarządzająca interfejsem użytkownika
export class UI {
  constructor() {
    this.state = {
      models: [],
      currentModel: null,
      panels: {
        left: { visible: false },
        right: { visible: false },
        bottom: { visible: true },
        profiles: { visible: false },
      },
      currentProfiles: {
        performance: null,
        scene: null,
      },
      selectedProfiles: {
        performance: null,
        scene: null,
      },
    };

    // Ukryj panel modeli na starcie
    const modelsPanel = document.querySelector('.models-panel');
    if (modelsPanel) {
      modelsPanel.classList.remove('show');
    }

    // Dodaj nasłuchiwanie na modelLoaded
    document.addEventListener('modelLoaded', () => {
      this.updateModelsList();
    });

    this.elements = {
      modelsList: document.getElementById('modelsList'),
      toggleButtons: {
        left: document.getElementById('toggle-left-sidebar'),
        right: document.getElementById('toggle-sidebar'),
        bottom: document.getElementById('toggleControls'),
        profiles: document.getElementById('toggle-profiles'),
      },
      applySettings: document.querySelector('.apply-settings-container button'),
      resetToDefault: document.getElementById('resetToDefault'),
      cancelButton: document.getElementById('cancelButton'),
      hideLeftPanel: document.getElementById('hide-left-panel'),
      hideRightPanel: document.getElementById('hide-right-panel'),
      profileSelectors: {
        performance: document.getElementById('performance-profile-select'),
        scene: document.getElementById('scene-profile-select'),
      },
      applyProfilesButton: document.getElementById('apply-profiles'),
    };

    if (!this.elements.modelsList) {
      throw new Error('Nie znaleziono elementu: modelsList');
    }

    // Inicjalizacja stanu przycisków na podstawie stanu paneli
    Object.keys(this.elements.toggleButtons).forEach((position) => {
      if (this.elements.toggleButtons[position]) {
        const panel = document.querySelector(
          position === 'right' ? '.models-panel' : '.left-panel'
        );
        const isPanelVisible = !panel.classList.contains('translate-x-full');
        if (isPanelVisible) {
          this.elements.toggleButtons[position].classList.add('rotated');
        }
      }
    });

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Nasłuchiwanie dla lewego panelu
    if (this.elements.toggleButtons.left) {
      this.elements.toggleButtons.left.addEventListener('click', () => {
        const leftPanel = document.querySelector('.left-panel');
        if (leftPanel) {
          leftPanel.classList.toggle('show');
          this.state.panels.left.visible = !this.state.panels.left.visible;
        }
      });
    }

    // Nasłuchiwanie dla przycisku Ukryj w lewym panelu
    if (this.elements.hideLeftPanel) {
      this.elements.hideLeftPanel.addEventListener('click', () => {
        const leftPanel = document.querySelector('.left-panel');
        if (leftPanel) {
          leftPanel.classList.remove('show');
          this.state.panels.left.visible = false;
          this.hideProfilesPanel(); // Ukryj panel profili przy zamykaniu lewego panelu
        }
      });
    }

    // Nasłuchiwanie dla prawego panelu
    if (this.elements.toggleButtons.right) {
      this.elements.toggleButtons.right.addEventListener('click', () => {
        const rightPanel = document.querySelector('.models-panel');
        if (rightPanel) {
          rightPanel.classList.toggle('show');
          this.state.panels.right.visible = !this.state.panels.right.visible;
        }
      });
    }

    // Nasłuchiwanie dla dolnego panelu
    if (this.elements.toggleButtons.bottom) {
      this.elements.toggleButtons.bottom.addEventListener('click', () => {
        const bottomControls = document.querySelector('.bottom-controls');
        const toggleButtonIcon = document.querySelector(
          '#toggleControls svg:first-child'
        );

        if (!bottomControls || !toggleButtonIcon) {
          console.warn('Nie znaleziono wymaganych elementów UI.');
          return;
        }

        this.state.panels.bottom.visible = !this.state.panels.bottom.visible;

        // Usuwamy konfliktujące klasy
        bottomControls.classList.remove('translate-y-full');
        bottomControls.classList.toggle('visible');
        toggleButtonIcon.classList.toggle('rotate-180');
      });
    }

    // Dodajemy nasłuchiwanie dla przycisków w panelu ustawień
    if (this.elements.applySettings) {
      this.elements.applySettings.addEventListener('click', () => {
        this.togglePanel('right', '.models-panel', 'translate-x-full');
      });
    }

    if (this.elements.resetToDefault) {
      this.elements.resetToDefault.addEventListener('click', () => {
        this.togglePanel('right', '.models-panel', 'translate-x-full');
      });
    }

    // Dodajemy nasłuchiwanie dla przycisku Anuluj
    if (this.elements.cancelButton) {
      this.elements.cancelButton.addEventListener('click', () => {
        const rightPanel = document.querySelector('.models-panel');
        if (rightPanel) {
          rightPanel.classList.remove('show');
          this.state.panels.right.visible = false;
        }
      });
    }

    // Nasłuchiwanie dla panelu profili
    if (this.elements.toggleButtons.profiles) {
      this.elements.toggleButtons.profiles.addEventListener('click', () => {
        this.toggleProfilesPanel();
      });
    }

    // Nasłuchiwanie zmian w selektorach profili - tylko aktualizacja tymczasowego stanu
    if (this.elements.profileSelectors.performance) {
      this.elements.profileSelectors.performance.addEventListener(
        'change',
        (e) => {
          this.state.selectedProfiles.performance = e.target.value;
        }
      );
    }

    if (this.elements.profileSelectors.scene) {
      this.elements.profileSelectors.scene.addEventListener('change', (e) => {
        this.state.selectedProfiles.scene = e.target.value;
      });
    }

    // Nasłuchiwanie dla przycisku Zastosuj profile
    if (this.elements.applyProfilesButton) {
      this.elements.applyProfilesButton.addEventListener('click', async () => {
        const performanceProfile = this.state.selectedProfiles.performance;
        const sceneProfile = this.state.selectedProfiles.scene;

        if (!performanceProfile || !sceneProfile) {
          console.warn('Nie wybrano wszystkich wymaganych profili');
          return;
        }

        // Emituj zdarzenie z wybranymi profilami
        const event = new CustomEvent('profilesSelected', {
          detail: {
            performanceProfile,
            sceneProfile,
          },
        });
        document.dispatchEvent(event);

        // Aktualizuj stan
        this.state.currentProfiles = {
          performance: performanceProfile,
          scene: sceneProfile,
        };

        // Aktualizuj UI
        this.updateProfileSelectors();

        // Zamknij panel po zastosowaniu
        this.togglePanel('right', '.models-panel', 'translate-x-full');
      });
    }

    // Obsługa przycisku ukrywania prawego panelu
    if (this.elements.hideRightPanel) {
      this.elements.hideRightPanel.addEventListener('click', () => {
        this.togglePanel('right', '.models-panel', 'show');
      });
    }
  }

  togglePanel(position, selector, toggleClass) {
    const panel = document.querySelector(selector);
    if (panel) {
      panel.classList.toggle(toggleClass);
      this.state.panels[position].visible =
        !this.state.panels[position].visible;

      // Obracamy przycisk dla prawego panelu
      if (position === 'right' && this.elements.toggleButtons.right) {
        const isPanelVisible = !panel.classList.contains('translate-x-full');
        if (isPanelVisible) {
          this.elements.toggleButtons.right.classList.add('rotated');
        } else {
          this.elements.toggleButtons.right.classList.remove('rotated');
        }
      }

      // Emituj zdarzenie o zmianie stanu panelu
      const event = new CustomEvent('panelStateChanged', {
        detail: {
          position,
          visible: this.state.panels[position].visible,
        },
      });
      document.dispatchEvent(event);
    }
  }

  // Metoda do dodawania nowego panelu
  addPanel(position, options = {}) {
    const {
      selector,
      toggleButtonId,
      toggleClass = 'translate-x-full',
      initialState = false,
    } = options;

    // Dodaj stan panelu
    this.state.panels[position] = { visible: initialState };

    // Dodaj przycisk przełączania
    const toggleButton = document.getElementById(toggleButtonId);
    if (toggleButton) {
      this.elements.toggleButtons[position] = toggleButton;
      toggleButton.addEventListener('click', () => {
        this.togglePanel(position, selector, toggleClass);
      });
    }
  }

  async init() {
    try {
      await this.loadAvailableModels();
      return this;
    } catch (error) {
      console.error('Błąd podczas inicjalizacji UI:', error);
      throw error;
    }
  }

  async loadAvailableModels() {
    try {
      console.log('UI: Rozpoczynam wczytywanie listy modeli...');
      const response = await fetch('/public/models/index.json');
      if (!response.ok) {
        throw new Error('Nie udało się wczytać listy modeli');
      }

      const data = await response.json();
      console.log('UI: Pobrano dane modeli:', data);

      const defaultModel = data.default_model;
      console.log('UI: Domyślny model:', defaultModel);

      // Konwertuj obiekt na tablicę modeli
      this.state.models = Object.entries(data)
        .filter(([key]) => key !== 'default_model')
        .map(([key, model]) => ({
          id: key,
          name: model.name,
          path: `/public/models/${key}/${model.gltf_files[0]}`,
          info: model.model_info,
          gltf_files: model.gltf_files,
        }));

      console.log('UI: Przetworzone modele:', this.state.models);

      // Sortuj modele alfabetycznie
      this.state.models.sort((a, b) => a.name.localeCompare(b.name));

      this.updateModelsList();

      // Wczytaj domyślny model
      if (defaultModel) {
        const defaultModelData = this.state.models.find(
          (m) => m.id === defaultModel
        );
        if (defaultModelData) {
          await this.loadModel(defaultModelData);
        }
      }
    } catch (error) {
      console.error('UI: Błąd podczas wczytywania modeli:', error);
    }
  }

  updateModelsList() {
    const modelsList = document.getElementById('modelsList');
    if (!modelsList) {
      console.error('Nie znaleziono elementu modelsList');
      return;
    }

    // Dodaj nagłówek panelu jeśli nie istnieje
    const modelsPanel = document.querySelector('.models-panel');
    let header = modelsPanel.querySelector('.models-panel-header');
    if (!header) {
      header = document.createElement('div');
      header.className = 'models-panel-header';
      header.innerHTML =
        '<h1 class="models-panel-title">CONCEPTFAB glTF VIEWER</h1>';
      modelsPanel.insertBefore(header, modelsList);
    }

    modelsList.innerHTML = this.state.models
      .map(
        (model) => `
        <div class="model-item" data-model-uuid="${model.id}">
          <div class="model-info">
            <div class="model-name">${model.name}</div>
            <div class="model-details">
              GLTF • ${
                model.info?.triangles?.toLocaleString() || '0'
              } trójkątów • ${model.info?.file_size_mb?.toFixed(2) || '0'} MB
            </div>
          </div>
          <button class="load-model-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      `
      )
      .join('');

    // Dodaj nasłuchiwanie na kliknięcie elementów .model-item
    const modelItems = modelsList.querySelectorAll('.model-item');
    modelItems.forEach((item) => {
      item.addEventListener('click', () => {
        const modelId = item.dataset.modelUuid;
        const model = this.state.models.find((m) => m.id === modelId);
        if (model) {
          this.loadModel(model);
        }
      });
    });
  }

  async loadModel(model) {
    try {
      console.log(
        `UI: Rozpoczynam ładowanie modelu: ${model.name} (${model.id})`
      );

      if (!model.path) {
        throw new Error('Brak ścieżki do modelu');
      }

      // Zamknij panel modeli przed aktualizacją
      const modelsPanel = document.querySelector('.models-panel');
      if (modelsPanel) {
        modelsPanel.classList.remove('show');
        this.state.panels.right.visible = false;
      }

      // Emituj zdarzenie wczytywania modelu
      const event = new CustomEvent('modelLoadRequested', {
        detail: {
          path: model.path,
          name: model.name,
          id: model.id,
          gltf_files: model.gltf_files,
        },
      });
      document.dispatchEvent(event);
      console.log('UI: Zdarzenie modelLoadRequested wyemitowane');

      // Aktualizuj stan
      this.state.currentModel = model;
      console.log('UI: Stan zaktualizowany');

      // Aktualizuj listę modeli
      this.updateModelsList();
      console.log('UI: Lista modeli zaktualizowana');
    } catch (error) {
      console.error('UI: Błąd podczas wczytywania modelu:', error);
      // Emituj zdarzenie błędu
      const errorEvent = new CustomEvent('modelLoadError', {
        detail: {
          error: error.message,
          model: model,
        },
      });
      document.dispatchEvent(errorEvent);
      throw error;
    }
  }

  // Dodajemy metodę do chowania wszystkich paneli
  hideAllPanels() {
    Object.keys(this.state.panels).forEach((position) => {
      if (this.state.panels[position].visible) {
        const selector =
          position === 'right'
            ? '.models-panel'
            : position === 'bottom'
            ? '.bottom-controls'
            : `.${position}-panel`;
        const toggleClass =
          position === 'bottom' ? 'visible' : 'translate-x-full';
        this.togglePanel(position, selector, toggleClass);
      }
    });
  }

  // Metoda do aktualizacji selektorów profili
  updateProfileSelectors() {
    try {
      // Aktualizuj wartości w selektorach na podstawie aktualnych profili
      if (
        this.elements.profileSelectors.performance &&
        this.state.currentProfiles.performance
      ) {
        this.elements.profileSelectors.performance.value =
          this.state.currentProfiles.performance;
        this.state.selectedProfiles.performance =
          this.state.currentProfiles.performance;
      } else {
        console.warn(
          'Nie można zaktualizować selektora profilu wydajności - brak elementu lub bieżącego profilu'
        );
      }

      if (
        this.elements.profileSelectors.scene &&
        this.state.currentProfiles.scene
      ) {
        this.elements.profileSelectors.scene.value =
          this.state.currentProfiles.scene;
        this.state.selectedProfiles.scene = this.state.currentProfiles.scene;
      } else {
        console.warn(
          'Nie można zaktualizować selektora profilu sceny - brak elementu lub bieżącego profilu'
        );
      }

      // Zaktualizuj wizualny stan UI
      this.updateProfilesStatusIndicator('loaded');
    } catch (error) {
      console.error('Błąd podczas aktualizacji selektorów profili:', error);
      this.updateProfilesStatusIndicator('error');
    }
  }

  // Dodanie nowej metody do aktualizacji wskaźnika statusu profili
  updateProfilesStatusIndicator(status) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');

    if (!statusDot || !statusText) return;

    // Usuń wszystkie klasy statusu
    statusDot.classList.remove('loaded', 'loading', 'error');

    // Ustaw odpowiedni status
    switch (status) {
      case 'loaded':
        statusDot.classList.add('loaded');
        statusText.textContent = 'Profil wczytany';
        break;
      case 'loading':
        statusDot.classList.add('loading');
        statusText.textContent = 'Wczytywanie profilu...';
        break;
      case 'error':
        statusDot.classList.add('error');
        statusText.textContent = 'Błąd wczytywania profilu';
        break;
      default:
        statusDot.classList.add('loaded');
        statusText.textContent = 'Status nieznany';
    }
  }

  // Metoda do przełączania widoczności panelu profili
  toggleProfilesPanel() {
    const profilesPanel = document.querySelector('.profiles-panel');
    if (profilesPanel) {
      profilesPanel.classList.toggle('hidden');
      this.state.panels.profiles.visible =
        !profilesPanel.classList.contains('hidden');
    }
  }

  // Metoda do ukrywania panelu profili
  hideProfilesPanel() {
    const profilesPanel = document.querySelector('.profiles-panel');
    if (profilesPanel) {
      profilesPanel.classList.add('hidden');
      this.state.panels.profiles.visible = false;
    }
  }
}
