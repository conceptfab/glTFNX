https://gaming-chair-configurator.vercel.app

Włączenie Map Cieni w Rendererze:

Instancja WebGLRenderer musi mieć włączoną obsługę map cieni. W kodzie three.js wyglądałoby to mniej więcej tak:

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
// Opcjonalnie: Ustawienie typu mapy cieni dla lepszej jakości (kosztem wydajności)
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // lub inne typy jak PCFShadowMap, VSMShadowMap
Use code with caution.
JavaScript
Jeśli strona używa React Three Fiber, ta konfiguracja jest często przekazywana do komponentu <Canvas>:

<Canvas shadows={{ enabled: true, type: THREE.PCFSoftShadowMap }}>
  {/* ...reszta sceny */}
</Canvas>
// Lub przez prop 'gl'
<Canvas gl={{ shadowMap: { enabled: true, type: THREE.PCFSoftShadowMap } }}>
   {/* ...reszta sceny */}
</Canvas>
Use code with caution.
Jsx
Konfiguracja Światła Rzucającego Cień:

W scenie musi być co najmniej jedno światło zdolne do rzucania cieni (np. DirectionalLight, SpotLight, PointLight). Światło otoczenia (AmbientLight) i półsferyczne (HemisphereLight) nie rzucają cieni.

To światło musi mieć ustawioną właściwość castShadow na true.

Kluczowe: Trzeba skonfigurować "kamerę cienia" tego światła, aby obejmowała odpowiedni obszar sceny. To decyduje, skąd i jak duży obszar jest renderowany do mapy cienia.

Dla DirectionalLight: Ustawia się granice prostopadłościanu (frustum): near, far, left, right, top, bottom.

const light = new THREE.DirectionalLight(0xffffff, 1.0);
light.castShadow = true;
light.position.set(5, 10, 7.5); // Pozycja światła
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 50;
light.shadow.camera.left = -10;
light.shadow.camera.right = 10;
light.shadow.camera.top = 10;
light.shadow.camera.bottom = -10;
// Opcjonalnie: Rozmiar mapy cienia (większy = lepsza jakość, ale wolniej)
light.shadow.mapSize.width = 1024; // lub 2048, 4096...
light.shadow.mapSize.height = 1024; // lub 2048, 4096...
scene.add(light);
// Czasem potrzebny jest helper do wizualizacji kamery cienia podczas dewelopmentu
// const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
// scene.add(cameraHelper);
Use code with caution.
JavaScript
Dla SpotLight: Ustawia się pole widzenia (fov), proporcje (aspect), near i far.

W React Three Fiber wyglądałoby to podobnie, ale jako propsy komponentu:

<directionalLight
  castShadow
  position={[5, 10, 7.5]}
  intensity={1.0}
  shadow-mapSize-width={1024}
  shadow-mapSize-height={1024}
  shadow-camera-far={50}
  shadow-camera-left={-10}
  shadow-camera-right={10}
  shadow-camera-top={10}
  shadow-camera-bottom={-10}
/>
Use code with caution.
Jsx
Obiekty Rzucające Cień:

Model krzesła (lub jego poszczególne części) musi mieć ustawioną właściwość castShadow na true.

model.traverse((child) => { // Przechodzimy przez wszystkie siatki w modelu
  if (child.isMesh) {
    child.castShadow = true;
  }
});
// Lub jeśli dodajesz pojedynczą siatkę
// mesh.castShadow = true;
scene.add(model);
Use code with caution.
JavaScript
W React Three Fiber:

<primitive object={model} castShadow />
// Lub dla pojedynczej siatki
<mesh castShadow>
  {/* ... geometria i materiał */}
</mesh>
Use code with caution.
Jsx
Obiekty Odbierające Cień:

Obiekt, na który ma padać cień (w tym przypadku podłoga/płaszczyzna pod krzesłem), musi mieć ustawioną właściwość receiveShadow na true.

const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 }); // Materiał musi być zdolny do odbierania cieni
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Obracamy płaszczyznę, by była pozioma
floor.receiveShadow = true;
scene.add(floor);
Use code with caution.
JavaScript
W React Three Fiber:

<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
  <planeGeometry args={[20, 20]} />
  <meshStandardMaterial color={0x808080} />
</mesh>
Use code with caution.
Jsx
Podsumowując, aby cienie działały na tej stronie, deweloper musiał:

Włączyć mapy cieni w rendererze (renderer.shadowMap.enabled = true).

Dodać światło (prawdopodobnie DirectionalLight lub SpotLight), ustawić light.castShadow = true i starannie skonfigurować jego light.shadow.camera oraz light.shadow.mapSize.

Ustawić mesh.castShadow = true dla modelu krzesła.

Ustawić mesh.receiveShadow = true dla podłogi.

Najlepszym sposobem na zobaczenie dokładnych wartości jest użycie Narzędzi Deweloperskich przeglądarki (F12), przejście do zakładki "Sources", znalezienie odpowiednich fragmentów kodu JavaScript (co może być trudne w zminifikowanym kodzie) i ustawienie punktów przerwania (breakpoints) lub użycie rozszerzenia do debugowania Three.js.