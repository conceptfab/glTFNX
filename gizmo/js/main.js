import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ViewportGizmo } from 'three-viewport-gizmo';

// Inicjalizacja sceny
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Niebieskie tło

// Inicjalizacja kamery
const camera = new THREE.PerspectiveCamera(
  75, // pole widzenia
  window.innerWidth / window.innerHeight, // proporcje
  0.1, // near plane
  1000 // far plane
);
camera.position.set(0, 0, 5);

// Inicjalizacja renderera
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('scene-container').appendChild(renderer.domElement);

// Dodanie kontroli kamery
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enablePan = true;
controls.enableRotate = true;
controls.minDistance = 2;
controls.maxDistance = 10;

// Inicjalizacja ViewportGizmo
const gizmo = new ViewportGizmo(camera, renderer);
gizmo.attachControls(controls);

// Tworzenie sześcianu
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({
  color: 0x00ff00,
  shininess: 100,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Funkcja animacji
function animate() {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
  gizmo.render();
}

// Obsługa zmiany rozmiaru okna
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  gizmo.update();
});

// Start animacji
animate();
