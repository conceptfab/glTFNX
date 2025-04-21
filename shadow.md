import \* as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer;
let groundMesh, sphereMesh, torusMesh;
let controls;
let ambientLight, directionalLight;

function init() {
// --- Scena ---
scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee); // Jasnoszare tło jak w przykładzie

    // --- Kamera ---
    camera = new THREE.PerspectiveCamera(
        75, // Kąt widzenia (FOV)
        window.innerWidth / window.innerHeight, // Proporcje obrazu
        0.1, // Bliska płaszczyzna przycinania
        100 // Daleka płaszczyzna przycinania
    );
    // Pozycja kamery podobna do przykładu (patrząca lekko z góry)
    camera.position.set(3, 4, 5);
    camera.lookAt(scene.position); // Kamera patrzy na środek sceny

    // --- Renderer ---
    renderer = new THREE.WebGLRenderer({ antialias: true }); // Włączenie wygładzania krawędzi
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // Lepsza jakość na ekranach HiDPI

    // --- Włączenie Map Cieni (Standardowe) ---
    renderer.shadowMap.enabled = true;
    // Typ mapy cieni - PCFSoftShadowMap daje bardziej miękkie cienie
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement); // Dodanie płótna renderera do HTML

    // --- Kontrolki Orbity ---
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Płynniejsze obracanie
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false; // Ograniczenie przesuwania
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2; // Ograniczenie patrzenia od dołu

    // --- Oświetlenie ---
    // Światło otoczenia (daje bazowe oświetlenie całej sceny)
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Białe światło, połowa intensywności
    scene.add(ambientLight);

    // Światło kierunkowe (symuluje słońce, rzuca cienie)
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Białe światło, większa intensywność
    directionalLight.position.set(5, 10, 7.5); // Pozycja źródła światła
    directionalLight.castShadow = true; // To światło będzie rzucać cień

    // Konfiguracja mapy cieni dla światła kierunkowego
    directionalLight.shadow.mapSize.width = 1024; // Rozdzielczość mapy cieni (większa = lepsza jakość, ale wolniej)
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5; // Bliska płaszczyzna kamery cienia
    directionalLight.shadow.camera.far = 50;  // Daleka płaszczyzna kamery cienia
    // Definiowanie obszaru, w którym renderowane są cienie (ważne dla jakości)
    const shadowCamSize = 10;
    directionalLight.shadow.camera.left = -shadowCamSize;
    directionalLight.shadow.camera.right = shadowCamSize;
    directionalLight.shadow.camera.top = shadowCamSize;
    directionalLight.shadow.camera.bottom = -shadowCamSize;

    scene.add(directionalLight);
    // Opcjonalnie: dodaj pomocnika wizualizującego kamerę cienia
    // const shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    // scene.add(shadowHelper);

    // --- Obiekty ---
    // Podłoże (Plane)
    const groundGeometry = new THREE.PlaneGeometry(20, 20); // Rozmiar podłoża
    // Materiał podłoża (standardowy, odbierający cień)
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff, // Biały kolor
        roughness: 0.9,  // Dość szorstki
        metalness: 0.1   // Mało metaliczny
    });
    groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2; // Obrócenie płaszczyzny, aby była pozioma
    groundMesh.receiveShadow = true; // Podłoże odbiera cienie rzucane przez inne obiekty
    scene.add(groundMesh);

    // Kula (Sphere)
    const sphereGeometry = new THREE.SphereGeometry(0.7, 32, 32); // Promień, segmenty
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000, // Czerwony
        roughness: 0.1,
        metalness: 0.2
    });
    sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.position.set(-1.5, 0.7, 0); // Ustawienie pozycji nad podłożem
    sphereMesh.castShadow = true; // Kula rzuca cień
    scene.add(sphereMesh);

    // Węzeł Torusa (TorusKnot)
    const torusGeometry = new THREE.TorusKnotGeometry(0.5, 0.2, 100, 16); // Parametry kształtu
    const torusMaterial = new THREE.MeshStandardMaterial({
        color: 0x0000ff, // Niebieski
        roughness: 0.2,
        metalness: 0.5
    });
    torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
    torusMesh.position.set(1.5, 1.0, 0); // Ustawienie pozycji nad podłożem
    torusMesh.castShadow = true; // Węzeł rzuca cień
    scene.add(torusMesh);

    // --- Obsługa zmiany rozmiaru okna ---
    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
requestAnimationFrame(animate); // Pętla animacji

    // Aktualizacja kontrolek orbity (dla płynnego ruchu)
    controls.update();

    // Renderowanie sceny
    renderer.render(scene, camera);

}

// --- Uruchomienie ---
init();
animate();

// --- Wyjaśnienie Cieni Kontaktowych (z oryginalnego przykładu) ---
/\*
W oryginalnym przykładzie "webgl_shadow_contact":

1.  **Nie używa się `groundMesh.receiveShadow = true;` w standardowy sposób.**
2.  **Materiał podłoża (`groundMaterial`) jest niestandardowy (`ShaderMaterial`).** Ten materiał używa specjalnych shaderów (vertex i fragment shader - pliki .glsl).
3.  **Renderowanie odbywa się w kilku krokach:**
    - Najpierw renderowana jest informacja o głębi sceny (bez podłoża) do tekstury (render target).
    - Ta tekstura głębi jest następnie przekazywana jako uniform (`tDepth`) do niestandardowego shadera materiału podłoża.
    - Shader podłoża analizuje tę teksturę głębi. Dla każdego piksela podłoża sprawdza, jak blisko znajduje się obiekt "nad" nim (na podstawie danych z tekstury głębi).
    - Jeśli obiekt jest wystarczająco blisko, shader przyciemnia ten piksel podłoża, tworząc efekt cienia kontaktowego.
    - Często stosuje się dodatkowe rozmycie (blur) tej mapy cieni (za pomocą kolejnych kroków renderowania i shaderów rozmycia), aby uzyskać miękki efekt.

Odtworzenie tego mechanizmu wymagałoby:

- Stworzenia `WebGLRenderTarget` do przechowywania tekstury głębi.
- Zmiany pętli `animate`, aby renderować głębię do celu.
- Napisania lub skopiowania shaderów GLSL (vertex i fragment) dla materiału podłoża.
- Stworzenia `ShaderMaterial` używającego tych shaderów i przekazania mu tekstury głębi jako uniform.
- Potencjalnie dodania kroków z rozmyciem (blur passes).

Powyższy kod stanowi solidną podstawę i strukturę sceny, na której można by zaimplementować bardziej zaawansowane techniki cieniowania, takie jak cienie kontaktowe z oryginalnego przykładu.
\*/
