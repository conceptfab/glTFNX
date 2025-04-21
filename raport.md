# Analiza profili w systemie glTFNX

## Profile Scen (scene-default.json)

### 1. Podstawowe informacje

- id
- name
- description
- category

### 2. Konfiguracja renderera

- toneMapping
- toneMappingExposure
- outputEncoding
- alpha

### 3. Postprocessing

- EffectComposer
- RenderPass
- ShaderPass
- UnrealBloomPass (parametry: strength, radius, threshold)
- SSAOPass (parametry: radius, intensity, bias)
- FXAAPass
- BokehPass (parametry: focus, aperture, maxblur)

### 4. Kamery

- default, back, top
- Parametry każdej kamery: fov, near, far, position, target

### 5. Tło i środowisko

- background color
- environment (path, files, colorSpace)

### 6. Oświetlenie

- ambient light (intensity, color)
- hemisphere light (intensity, skyColor, groundColor)
- directional lights (color, intensity, position, helper, castShadow)

### 7. Elementy pomocnicze

- axis (length, visible)
- grid (size, divisions, visible)
- floor (size, segments, visible, material, texture)

### 8. Sterowanie

- enableDamping
- dampingFactor
- rotateSpeed
- panSpeed
- zoomSpeed
- minDistance, maxDistance
- minPolarAngle, maxPolarAngle
- enablePan, enableRotate, enableZoom

## Profile Wydajności (profile-high.json)

### 1. Podstawowe informacje

- id
- name
- description
- category

### 2. Konfiguracja renderera

- antialias
- precision
- powerPreference
- failIfMajorPerformanceCaveat
- depth, stencil
- premultipliedAlpha
- preserveDrawingBuffer
- xrCompatible
- autoClear
- logarithmicDepthBuffer
- toneMapping
- toneMappingExposure
- outputEncoding
- alpha
- shadowMap (enabled, type, mapSize, blurSamples, bias, radius)
- physicallyCorrectLights
- pixelRatio

### 3. Jakość podłogi

- segments

### 4. Postprocessing

- enabled
- bloom
- ssao
- fxaa
- smaa

### 5. Jakość

- shadows
- textures
- resolution (width, height)
- anisotropy

## Kluczowe różnice między profilami

1. Profile scen zawierają szczegółowe konfiguracje wizualne (oświetlenie, kamery, tło, elementy pomocnicze)
2. Profile wydajności skupiają się na parametrach technicznych (jakość renderowania, antyaliasing, cienie)
3. Profile scen zawierają konfigurację sterowania, której nie ma w profilach wydajności
4. Profile wydajności zawierają bardziej szczegółowe parametry renderera i jakości
5. Profile scen zawierają konfigurację środowiska i tekstur, której nie ma w profilach wydajności
