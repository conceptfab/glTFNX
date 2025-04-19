# Lista parametrów renderera i ustawień sceny

## Hierarchia priorytetów

1. Parametry renderera są definiowane TYLKO w profilu wydajności
2. Parametry sceny (oświetlenie, postprocessing, kamera) są definiowane TYLKO w profilu sceny
3. W przypadku konfliktu, wartości z profilu wydajności mają pierwszeństwo

## 1. Profil wydajności

### Parametry Renderera (WebGLRenderer)

#### Podstawowe parametry

- `antialias` (boolean) - Włącza/wyłącza antyaliasing
- `precision` (string) - Precyzja obliczeń: 'highp', 'mediump', 'lowp'
- `powerPreference` (string) - Preferencje wydajności: 'default', 'high-performance', 'low-power'
- `failIfMajorPerformanceCaveat` (boolean) - Czy przerwać jeśli wykryto poważne ograniczenia wydajności
- `depth` (boolean) - Włącza/wyłącza bufor głębi
- `stencil` (boolean) - Włącza/wyłącza bufor szablonu
- `premultipliedAlpha` (boolean) - Czy używać premultipled alpha
- `preserveDrawingBuffer` (boolean) - Czy zachować bufor rysowania
- `xrCompatible` (boolean) - Czy renderer jest kompatybilny z XR
- `autoClear` (boolean) - Czy automatycznie czyścić bufor
- `pixelRatio` (number) - Współczynnik skalowania pikseli

#### Shadow Map

- `shadowMap.enabled` (boolean) - Włącza/wyłącza mapy cieni
- `shadowMap.type` (string) - Typ mapy cieni: 'BasicShadowMap', 'PCFShadowMap', 'PCFSoftShadowMap', 'VSMShadowMap'
- `shadowMap.mapSize.width` (number) - Szerokość mapy cieni
- `shadowMap.mapSize.height` (number) - Wysokość mapy cieni
- `shadowMap.blurSamples` (number) - Liczba próbek do rozmycia cieni
- `shadowMap.bias` (number) - Przesunięcie mapy cieni
- `shadowMap.radius` (number) - Promień rozmycia cieni

#### Tone Mapping

- `toneMapping` (string) - Typ tone mappingu: 'NoToneMapping', 'LinearToneMapping', 'ReinhardToneMapping', 'CineonToneMapping', 'ACESFilmicToneMapping'
- `toneMappingExposure` (number) - Ekspozycja tone mappingu
- `outputEncoding` (string) - Kodowanie wyjściowe
- `alpha` (boolean) - Czy używać kanału alfa

#### Oświetlenie

- `physicallyCorrectLights` (boolean) - Czy używać fizycznie poprawnych świateł
- `logarithmicDepthBuffer` (boolean) - Czy używać logarytmicznego bufora głębi

## 2. Profil sceny

### Oświetlenie

#### Światło otoczenia

- `lighting.ambient.enabled` (boolean) - Włącza/wyłącza światło otoczenia
- `lighting.ambient.color` (string) - Kolor światła otoczenia
- `lighting.ambient.intensity` (number) - Intensywność światła otoczenia

#### Światła

- `lighting.lights[].type` (string) - Typ światła: 'DirectionalLight', 'PointLight', 'SpotLight', 'HemisphereLight'
- `lighting.lights[].color` (string) - Kolor światła
- `lighting.lights[].intensity` (number) - Intensywność światła
- `lighting.lights[].position` (object) - Pozycja światła {x, y, z}
- `lighting.lights[].target` (object) - Cel światła {x, y, z}
- `lighting.lights[].distance` (number) - Maksymalna odległość światła
- `lighting.lights[].angle` (number) - Kąt światła (tylko dla SpotLight)
- `lighting.lights[].penumbra` (number) - Penumbra światła (tylko dla SpotLight)
- `lighting.lights[].decay` (number) - Współczynnik zaniku światła
- `lighting.lights[].castShadow` (boolean) - Czy światło rzuca cień

### Postprocessing

#### Podstawowe efekty

- `postprocessing.enabled` (boolean) - Włącza/wyłącza postprocessing
- `postprocessing.effects.EffectComposer.enabled` (boolean) - Włącza/wyłącza kompozytor efektów
- `postprocessing.effects.RenderPass.enabled` (boolean) - Włącza/wyłącza pass renderowania
- `postprocessing.effects.ShaderPass.enabled` (boolean) - Włącza/wyłącza pass shaderów

#### UnrealBloom

- `postprocessing.effects.UnrealBloomPass.enabled` (boolean) - Włącza/wyłącza efekt bloom
- `postprocessing.effects.UnrealBloomPass.strength` (number) - Siła efektu bloom
- `postprocessing.effects.UnrealBloomPass.radius` (number) - Promień efektu bloom
- `postprocessing.effects.UnrealBloomPass.threshold` (number) - Próg efektu bloom

#### SSAO

- `postprocessing.effects.SSAOPass.enabled` (boolean) - Włącza/wyłącza SSAO
- `postprocessing.effects.SSAOPass.radius` (number) - Promień SSAO
- `postprocessing.effects.SSAOPass.intensity` (number) - Intensywność SSAO
- `postprocessing.effects.SSAOPass.bias` (number) - Przesunięcie SSAO

#### FXAA

- `postprocessing.effects.FXAAPass.enabled` (boolean) - Włącza/wyłącza FXAA

#### Bokeh

- `postprocessing.effects.BokehPass.enabled` (boolean) - Włącza/wyłącza efekt bokeh
- `postprocessing.effects.BokehPass.focus` (number) - Punkt skupienia
- `postprocessing.effects.BokehPass.aperture` (number) - Przysłona
- `postprocessing.effects.BokehPass.maxblur` (number) - Maksymalne rozmycie

### Kamera

- `camera.fov` (number) - Pole widzenia kamery
- `camera.near` (number) - Bliska płaszczyzna przycinania
- `camera.far` (number) - Daleka płaszczyzna przycinania
- `camera.position` (object) - Pozycja kamery {x, y, z}
- `camera.target` (object) - Cel kamery {x, y, z}

### Kontrola kamery (OrbitControls)

- `controls.enableDamping` (boolean) - Włącza/wyłącza tłumienie
- `controls.dampingFactor` (number) - Współczynnik tłumienia
- `controls.screenSpacePanning` (boolean) - Czy używać panowania w przestrzeni ekranu
- `controls.minDistance` (number) - Minimalna odległość od celu
- `controls.maxDistance` (number) - Maksymalna odległość od celu
- `controls.maxPolarAngle` (number) - Maksymalny kąt polarny

## 4. Ustawienia debugowania

### Statystyki

- `stats.dom.style.position` (string) - Pozycja elementu statystyk
- `stats.dom.style.top` (string) - Odległość od góry
- `stats.dom.style.left` (string) - Odległość od lewej
- `stats.dom.style.display` (string) - Wyświetlanie elementu

### Widoczność elementów

- `isLightingVisible` (boolean) - Widoczność oświetlenia
- `isAxisVisible` (boolean) - Widoczność osi
- `isBoundingBoxVisible` (boolean) - Widoczność bounding box
- `isStatsVisible` (boolean) - Widoczność statystyk
- `isFloorVisible` (boolean) - Widoczność podłogi
