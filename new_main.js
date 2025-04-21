import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { HorizontalBlurShader } from 'three/addons/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/addons/shaders/VerticalBlurShader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let camera, scene, renderer, stats, gui;
let ladaModel;

const PLANE_WIDTH = 2.5;
const PLANE_HEIGHT = 2.5;
const CAMERA_HEIGHT = 0.3;

const state = {
  shadow: {
    blur: 3.5,
    darkness: 1,
    opacity: 1,
  },
  plane: {
    color: '#ffffff',
    opacity: 1,
  },
  showWireframe: false,
};

let shadowGroup,
  renderTarget,
  renderTargetBlur,
  shadowCamera,
  cameraHelper,
  depthMaterial,
  horizontalBlurMaterial,
  verticalBlurMaterial;
let plane, blurPlane, fillPlane;

init();

function init() {
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0.5, 1, 2);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  // Dodajemy oświetlenie
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Ustawienia cieni dla światła
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -10;
  directionalLight.shadow.camera.right = 10;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -10;

  stats = new Stats();
  document.body.appendChild(stats.dom);

  window.addEventListener('resize', onWindowResize);

  // the container, if you need to move the plane just move this
  shadowGroup = new THREE.Group();
  shadowGroup.position.y = -0.3;
  scene.add(shadowGroup);

  // the render target that will show the shadows in the plane texture
  renderTarget = new THREE.WebGLRenderTarget(512, 512);
  renderTarget.texture.generateMipmaps = false;

  // the render target that we will use to blur the first render target
  renderTargetBlur = new THREE.WebGLRenderTarget(512, 512);
  renderTargetBlur.texture.generateMipmaps = false;

  // make a plane and make it face up
  const planeGeometry = new THREE.PlaneGeometry(
    PLANE_WIDTH,
    PLANE_HEIGHT
  ).rotateX(Math.PI / 2);
  const planeMaterial = new THREE.MeshBasicMaterial({
    map: renderTarget.texture,
    opacity: state.shadow.opacity,
    transparent: true,
    depthWrite: false,
  });
  plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.renderOrder = 1;
  shadowGroup.add(plane);
  plane.scale.y = -1;

  // the plane onto which to blur the texture
  blurPlane = new THREE.Mesh(planeGeometry);
  blurPlane.visible = false;
  shadowGroup.add(blurPlane);

  // the plane with the color of the ground
  const fillPlaneMaterial = new THREE.MeshBasicMaterial({
    color: state.plane.color,
    opacity: state.plane.opacity,
    transparent: true,
    depthWrite: false,
  });
  fillPlane = new THREE.Mesh(planeGeometry, fillPlaneMaterial);
  fillPlane.rotateX(Math.PI);
  shadowGroup.add(fillPlane);

  // the camera to render the depth material from
  shadowCamera = new THREE.OrthographicCamera(
    -PLANE_WIDTH / 2,
    PLANE_WIDTH / 2,
    PLANE_HEIGHT / 2,
    -PLANE_HEIGHT / 2,
    0,
    CAMERA_HEIGHT
  );
  shadowCamera.rotation.x = Math.PI / 2;
  shadowGroup.add(shadowCamera);

  cameraHelper = new THREE.CameraHelper(shadowCamera);

  // like MeshDepthMaterial, but goes from black to transparent
  depthMaterial = new THREE.MeshDepthMaterial();
  depthMaterial.userData.darkness = { value: state.shadow.darkness };
  depthMaterial.onBeforeCompile = function (shader) {
    shader.uniforms.darkness = depthMaterial.userData.darkness;
    shader.fragmentShader = /* glsl */ `
            uniform float darkness;
            ${shader.fragmentShader.replace(
              'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
              'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );'
            )}
        `;
  };

  depthMaterial.depthTest = false;
  depthMaterial.depthWrite = false;

  horizontalBlurMaterial = new THREE.ShaderMaterial(HorizontalBlurShader);
  horizontalBlurMaterial.depthTest = false;

  verticalBlurMaterial = new THREE.ShaderMaterial(VerticalBlurShader);
  verticalBlurMaterial.depthTest = false;

  // GUI setup
  gui = new GUI();
  const shadowFolder = gui.addFolder('shadow');
  shadowFolder.open();
  const planeFolder = gui.addFolder('plane');
  planeFolder.open();

  shadowFolder.add(state.shadow, 'blur', 0, 15, 0.1);
  shadowFolder.add(state.shadow, 'darkness', 1, 5, 0.1).onChange(function () {
    depthMaterial.userData.darkness.value = state.shadow.darkness;
  });
  shadowFolder.add(state.shadow, 'opacity', 0, 1, 0.01).onChange(function () {
    plane.material.opacity = state.shadow.opacity;
  });
  planeFolder.addColor(state.plane, 'color').onChange(function () {
    fillPlane.material.color = new THREE.Color(state.plane.color);
  });
  planeFolder.add(state.plane, 'opacity', 0, 1, 0.01).onChange(function () {
    fillPlane.material.opacity = state.plane.opacity;
  });

  gui.add(state, 'showWireframe').onChange(function () {
    if (state.showWireframe) {
      scene.add(cameraHelper);
    } else {
      scene.remove(cameraHelper);
    }
  });

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  // Controls
  new OrbitControls(camera, renderer.domElement);

  // Load Lada model
  const loader = new GLTFLoader();

  // Ustawiamy ścieżkę do tekstur
  loader.setPath('public/models/lada/');

  // Najpierw ładujemy konfigurację
  fetch('public/models/lada/config.json')
    .then((response) => response.json())
    .then((config) => {
      // Teraz ładujemy model z odpowiednią skalą i pozycją
      loader.load(
        'lada.gltf',
        function (gltf) {
          ladaModel = gltf.scene;

          // Ustawiamy skalę
          const scale = config.scale.fixedScale;
          ladaModel.scale.set(scale, scale, scale);

          // Ustawiamy pozycję
          if (config.position.method === 'floor') {
            ladaModel.position.y = config.position.yOffset;
          }

          // Centrujemy model jeśli wymagane
          if (config.center.x) ladaModel.position.x = 0;
          if (config.center.y) ladaModel.position.y = config.position.yOffset;
          if (config.center.z) ladaModel.position.z = 0;

          // Włączamy cienie dla modelu
          ladaModel.traverse(function (node) {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
            }
          });

          scene.add(ladaModel);
        },
        undefined,
        function (error) {
          console.error(
            'An error happened while loading the Lada model:',
            error
          );
        }
      );
    })
    .catch((error) => {
      console.error('Error loading config:', error);
    });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function blurShadow(amount) {
  blurPlane.visible = true;

  // blur horizontally and draw in the renderTargetBlur
  blurPlane.material = horizontalBlurMaterial;
  blurPlane.material.uniforms.tDiffuse.value = renderTarget.texture;
  horizontalBlurMaterial.uniforms.h.value = (amount * 1) / 256;

  renderer.setRenderTarget(renderTargetBlur);
  renderer.render(blurPlane, shadowCamera);

  // blur vertically and draw in the main renderTarget
  blurPlane.material = verticalBlurMaterial;
  blurPlane.material.uniforms.tDiffuse.value = renderTargetBlur.texture;
  verticalBlurMaterial.uniforms.v.value = (amount * 1) / 256;

  renderer.setRenderTarget(renderTarget);
  renderer.render(blurPlane, shadowCamera);

  blurPlane.visible = false;
}

function animate() {
  // remove the background
  const initialBackground = scene.background;
  scene.background = null;

  // force the depthMaterial to everything
  cameraHelper.visible = false;
  scene.overrideMaterial = depthMaterial;

  // set renderer clear alpha
  const initialClearAlpha = renderer.getClearAlpha();
  renderer.setClearAlpha(0);

  // render to the render target to get the depths
  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, shadowCamera);

  // and reset the override material
  scene.overrideMaterial = null;
  cameraHelper.visible = true;

  blurShadow(state.shadow.blur);

  // a second pass to reduce the artifacts
  blurShadow(state.shadow.blur * 0.4);

  // reset and render the normal scene
  renderer.setRenderTarget(null);
  renderer.setClearAlpha(initialClearAlpha);
  scene.background = initialBackground;

  renderer.render(scene, camera);
  stats.update();
}
