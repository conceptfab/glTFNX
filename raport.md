# Raport funkcjonalności ModelManager.js

## 1. Konstruktor (constructor)

- Inicjalizuje główne komponenty sceny 3D / za to ma odpowiadac scene-buider, - do usuniecia
- Ustawia szare tło sceny (0x808080) - do usuniecia
- Tworzy loader GLTF do ładowania modeli 3D
- Inicjalizuje mapę modeli i event listenerów
- Konfiguruje podstawowe ustawienia (dozwolone rozszerzenia plików, maksymalny rozmiar)
- Dodaje siatkę pomocniczą do sceny - do usuniecia
- Konfiguruje kamerę perspektywiczną - do usuniecia
- Ustawia renderer WebGL z obsługą antyaliasingu - do usuniecia
- Konfiguruje kontrolę kamery (OrbitControls) - do usuniecia
- Inicjalizuje event listenery - do usuniecia
- Uruchamia pętlę animacji - do usuniecia

## 2. animate()

- Zarządza pętlą renderowania sceny - do usuniecia
- Aktualizuje kontrolę kamery - do usuniecia
- Renderuje scenę z aktualną kamerą - do usuniecia

## 3. cleanupEventListeners()

- Usuwa wszystkie zarejestrowane event listenery
- Czyści mapę event listenerów

## 4. setupEventListeners()

- Czyści stare event listenery
- Dodaje nowy listener dla zdarzenia 'modelLoadRequested'
- Obsługuje żądania ładowania modeli

## 5. handleFileSelect(file)

- Obsługuje wybór pliku przez użytkownika
- Sprawdza format pliku (.gltf lub .glb)
- Wyświetla błąd w przypadku nieprawidłowego formatu
- Pokazuje ekran ładowania
- Ładuje model i dodaje go do sceny
- Obsługuje błędy podczas ładowania

## 6. loadModel(file)

- Ładuje model 3D z pliku lub ścieżki - sciezka w pliku index.json!!!
- Obsługuje dwa tryby ładowania:

  - Ze ścieżki (używając loadModelFromPath) - sciezka w pliku index.json!!!

- Wyświetla postęp ładowania
- Obsługuje błędy podczas ładowania

## 7. addModelToScene(model)

- Dodaje model do sceny
- Resetuje skalę sceny
- Usuwa poprzedni model jeśli istnieje
- Optymalizuje materiały i tekstury modelu
- Dodaje domyślne materiały jeśli brak
- Ogranicza liczbę tekstur do 8 na materiał
- Optymalizuje ustawienia tekstur

## 8. removeModel(modelPath)

- Usuwa model ze sceny
- Aktualizuje stan menedżera modeli

## 9. getCurrentModel()

- Zwraca aktualnie wyświetlany model

## 10. getAllModels()

- Zwraca wszystkie załadowane modele

## 11. clearAllModels()

- Usuwa wszystkie modele ze sceny
- Czyści mapę modeli
- Resetuje aktualny model

## 12. exportModel(format)

- Eksportuje aktualny model do formatu GLB lub GLTF - po co to jest? do usunięcia!!!
- Obsługuje błędy podczas eksportu - po co to jest? do usunięcia!!!

## 13. showLoading() / hideLoading()

- Pokazuje/ukrywa ekran ładowania

## 14. showError(error) / hideError()

- Wyświetla/ukrywa komunikaty błędów

## 15. loadModelFromPath(path)

- Ładuje model ze ścieżki
- Obsługuje konfigurację modelu
- Centruje kamerę na modelu - kamera jest jest pobierana z profilu sceny!!!!

## 16. loadModelConfig(modelDir)

- Wczytuje konfigurację modelu z pliku

## 17. applyModelConfig(model, config)

- Stosuje konfigurację do modelu
- Ustawia pozycję, skalę i rotację

## 18. centerCameraOnModel(model) -  funkcje się duplikuja, do sprawdzenia

- Centruje kamerę na modelu
- Ustawia odpowiednią odległość kamery

## 19. resetSceneScale()

- Resetuje skalę sceny do wartości domyślnych
