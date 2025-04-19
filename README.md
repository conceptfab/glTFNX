# Dokumentacja projektu glTFNX

## Struktura projektu

```
glTFNX/
├── dist/                   # Skompilowane pliki produkcyjne
├── js/                     # Główny katalog z kodem JavaScript
│   ├── app/               # Aplikacja główna
│   │   ├── app.js         # Główny plik aplikacji
│   │   ├── main.js        # Główny plik logiki aplikacji
│   │   ├── debug/         # Narzędzia debugowania
│   │   ├── debug.js       # Główne narzędzia debugowania
│   │   ├── device-detection.js # Wykrywanie urządzeń
│   │   ├── light-manager.js    # Zarządzanie oświetleniem
│   │   ├── model-manager.js    # Zarządzanie modelami
│   │   ├── profile-validator.js # Walidacja profili
│   │   ├── scene-builder.js    # Budowanie sceny
│   │   └── ui.js          # Interfejs użytkownika
│   └── css/               # Style CSS
├── node_modules/          # Zależności Node.js
├── public/                # Statyczne pliki publiczne
│   ├── profiles/          # Profile użytkowników i konfiguracje
│   ├── icons/             # Ikony aplikacji
│   ├── models/            # Modele 3D
│   └── textures/          # Tekstury dla modeli
├── gizmo/                 # Komponenty do manipulacji 3D
├── .vscode/              # Konfiguracja VS Code
├── debug.html            # Strona debugowania
├── deploy.js             # Skrypt do wdrożenia
├── generate_icons.js     # Generowanie ikon
├── generate_models.js    # Generowanie modeli
├── generate_profiles.js  # Generowanie profili
├── generate_version.js   # Generowanie wersji
├── index.html            # Główny plik HTML
├── package.json          # Konfiguracja projektu
├── package-lock.json     # Zablokowane wersje zależności
├── parametry_sceny.md    # Dokumentacja parametrów sceny
├── profile.md            # Dokumentacja profili
├── poprawki.md           # Lista poprawek
├── logs.md               # Logi i historia zmian
├── postcss.config.js     # Konfiguracja PostCSS
├── tailwind.config.js    # Konfiguracja Tailwind CSS
├── TODO.md               # Lista zadań do wykonania
├── vite.config.js        # Konfiguracja Vite
├── version.json          # Informacje o wersji
├── three_js.md           # Dokumentacja Three.js
└── lista-parametrow.md   # Lista parametrów konfiguracyjnych
```

## Główne komponenty

### Aplikacja główna (js/app/)

- `app.js` - Główny plik aplikacji, inicjalizacja i zarządzanie stanem
- `main.js` - Główna logika aplikacji
- `model-manager.js` - Zarządzanie modelami 3D
- `light-manager.js` - Zarządzanie oświetleniem sceny
- `scene-builder.js` - Budowanie i zarządzanie sceną 3D
- `profile-validator.js` - Walidacja profili użytkowników
- `device-detection.js` - Wykrywanie i obsługa różnych urządzeń
- `ui.js` - Interfejs użytkownika
- `debug.js` - Narzędzia do debugowania

### Narzędzia generujące

- `generate_models.js` - Generowanie modeli 3D
- `generate_profiles.js` - Generowanie profili użytkowników
- `generate_icons.js` - Generowanie ikon
- `generate_version.js` - Zarządzanie wersjami

### Konfiguracja

- `package.json` - Zależności i skrypty npm
- `vite.config.js` - Konfiguracja bundlera Vite
- `tailwind.config.js` - Konfiguracja Tailwind CSS
- `postcss.config.js` - Konfiguracja PostCSS

### Wdrożenie

- `deploy.js` - Skrypt do wdrożenia aplikacji
- `.htaccess` - Konfiguracja serwera Apache

## Zależności

Projekt wykorzystuje:

- Vite jako bundler
- Tailwind CSS do stylowania
- Node.js do zarządzania zależnościami i skryptami
- Gizmo jako komponent do manipulacji 3D

## Struktura wersjonowania

- `version.json` - Informacje o aktualnej wersji

## Zasoby publiczne (public/)

Folder `public` zawiera wszystkie statyczne zasoby aplikacji:

### Profile (public/profiles/)

- `profiles.json` - Główny plik z definicjami profili
- `scenes/` - Konfiguracje scen dla różnych profili
- `performance/` - Profile wydajności dla różnych konfiguracji

### Modele 3D (public/models/)

Zawiera różne modele 3D w formacie glTF:

- Modele w standardowej jakości (np. `GCS_2/`, `GCS_6/`)
- Modele w wysokiej jakości (z sufiksem `_HQ`)
- `index.json` - Indeks wszystkich dostępnych modeli

### Inne zasoby

- `icons/` - Ikony aplikacji
- `textures/` - Tekstury używane w modelach
- `site.webmanifest` - Manifest aplikacji webowej
- `autostart.json` - Konfiguracja automatycznego startu aplikacji

## Dokumentacja techniczna

Projekt zawiera dodatkowe pliki dokumentacji technicznej:

- `three_js.md` - Szczegółowa dokumentacja implementacji Three.js
- `lista-parametrow.md` - Kompletna lista parametrów konfiguracyjnych
- `parametry_sceny.md` - Dokumentacja parametrów sceny
- `profile.md` - Dokumentacja systemu profili
- `poprawki.md` - Historia poprawek i zmian
