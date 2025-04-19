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
│   │   ├── model-manager.js    # Zarządzanie modelami
│   │   ├── model-manager-micz_nx.js # Alternatywny manager modeli
│   │   ├── profile-validator.js # Walidacja profili
│   │   ├── scene-builder.js    # Budowanie sceny
│   │   ├── light-manager.js    # Zarządzanie oświetleniem
│   │   └── ui.js          # Interfejs użytkownika
│   └── css/               # Style CSS
├── node_modules/          # Zależności Node.js
├── public/                # Statyczne pliki publiczne
│   ├── profiles/          # Profile użytkowników i konfiguracje
│   ├── icons/             # Ikony aplikacji
│   ├── models/            # Modele 3D
│   └── textures/          # Tekstury dla modeli
├── .vscode/              # Konfiguracja VS Code
├── debug.html            # Strona debugowania
├── deploy.js             # Skrypt do wdrożenia
├── config.js             # Konfiguracja FTP (ignorowana przez git)
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
├── postcss.config.js     # Konfiguracja PostCSS
├── tailwind.config.js    # Konfiguracja Tailwind CSS
├── TODO.md               # Lista zadań do wykonania
├── vite.config.js        # Konfiguracja Vite
├── version.json          # Informacje o wersji
├── version-micz_.json    # Alternatywna wersja
├── three_js.md           # Dokumentacja Three.js
└── lista-parametrow.md   # Lista parametrów konfiguracyjnych
```

## Główne komponenty

### Aplikacja główna (js/app/)

- `app.js` - Główny plik aplikacji, inicjalizacja i zarządzanie stanem
- `main.js` - Główna logika aplikacji
- `model-manager.js` - Zarządzanie modelami 3D
- `model-manager-micz_nx.js` - Alternatywna implementacja zarządzania modelami
- `scene-builder.js` - Budowanie i zarządzanie sceną 3D
- `light-manager.js` - Zarządzanie oświetleniem (obsługa wszystkich typów świateł Three.js)
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
- `config.js` - Konfiguracja FTP (ignorowana przez git)

### Wdrożenie

- `deploy.js` - Skrypt do wdrożenia aplikacji
- `.htaccess` - Konfiguracja serwera Apache

## Zależności

Projekt wykorzystuje:

- Vite jako bundler
- Tailwind CSS do stylowania
- Node.js do zarządzania zależnościami i skryptami
- Three.js do renderowania 3D
- Gizmo jako komponent do manipulacji 3D
- FTP-Deploy do wdrożenia

## Struktura wersjonowania

- `version.json` - Informacje o aktualnej wersji
- `version-micz_.json` - Alternatywna wersja

## Zasoby publiczne (public/)

Folder `public` zawiera wszystkie statyczne zasoby aplikacji:

- `profiles/` - Profile użytkowników i konfiguracje scen
- `icons/` - Ikony aplikacji
- `models/` - Modele 3D w formacie glTF/glb
- `textures/` - Tekstury dla modeli

## Oświetlenie

System oświetlenia obsługuje wszystkie typy świateł dostępne w Three.js:

- AmbientLight (światło otoczenia)
- HemisphereLight (światło półkuliste)
- DirectionalLight (światło kierunkowe)
- PointLight (światło punktowe)
- SpotLight (światło reflektorowe)
- RectAreaLight (światło prostokątne)

Każde światło może być skonfigurowane poprzez profil sceny i posiada własne ustawienia specyficzne dla danego typu.

## Wdrożenie

Aplikacja jest wdrażana na serwer FTP poprzez skrypt `deploy.js`. Dane dostępowe do FTP są przechowywane w pliku `config.js`, który jest ignorowany przez system kontroli wersji.

## Bezpieczeństwo

- Dane dostępowe do FTP są przechowywane w osobnym pliku konfiguracyjnym ignorowanym przez git
- Wszystkie wrażliwe dane są chronione przed przypadkowym ujawnieniem
- System weryfikuje poprawność builda przed wdrożeniem

## Rozwój

Projekt jest w ciągłym rozwoju. Aktualne zadania i plany można znaleźć w pliku `TODO.md`.
