import * as THREE from 'three';
import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader.js';

export class ShadowFloor {
  constructor(scene, renderer, options = {}) {
    this.scene = scene;
    this.renderer = renderer;
    this.options = {
      planeWidth: options.planeWidth || 20,
      planeHeight: options.planeHeight || 20,
      cameraHeight: options.cameraHeight || 2,
      shadowBlur: options.shadowBlur || 3.5,
      shadowDarkness: options.shadowDarkness || 1.5,
      shadowOpacity: options.shadowOpacity || 0.8,
      planeColor: options.planeColor || '#f0f0f0',
      planeOpacity: options.planeOpacity || 1,
    };

    this.meshes = [];
    this.shadowGroup = null;
    this.renderTarget = null;
    this.renderTargetBlur = null;
    this.shadowCamera = null;
    this.depthMaterial = null;
    this.horizontalBlurMaterial = null;
    this.verticalBlurMaterial = null;
    this.plane = null;
    this.blurPlane = null;
    this.fillPlane = null;

    this.init();
  }

  init() {
    // Grupa zawierająca wszystkie elementy podłogi
    this.shadowGroup = new THREE.Group();
    this.shadowGroup.position.y = -0.3;
    this.scene.add(this.shadowGroup);

    // Render target dla cieni
    this.renderTarget = new THREE.WebGLRenderTarget(512, 512, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      stencilBuffer: false,
      depthBuffer: true,
    });

    // Render target dla rozmycia
    this.renderTargetBlur = new THREE.WebGLRenderTarget(512, 512, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      stencilBuffer: false,
      depthBuffer: false,
    });

    // Geometria płaszczyzny
    const planeGeometry = new THREE.PlaneGeometry(
      this.options.planeWidth,
      this.options.planeHeight
    ).rotateX(Math.PI / 2);

    // Płaszczyzna z cieniami
    const planeMaterial = new THREE.MeshBasicMaterial({
      map: this.renderTarget.texture,
      opacity: this.options.shadowOpacity,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane.renderOrder = 1;
    this.plane.scale.y = -1; // Odwrócenie tekstury w pionie
    this.shadowGroup.add(this.plane);

    // Płaszczyzna do rozmycia
    this.blurPlane = new THREE.Mesh(planeGeometry);
    this.blurPlane.visible = false;
    this.shadowGroup.add(this.blurPlane);

    // Płaszczyzna wypełniająca (kolor podłogi)
    const fillPlaneMaterial = new THREE.MeshBasicMaterial({
      color: this.options.planeColor,
      opacity: this.options.planeOpacity,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    this.fillPlane = new THREE.Mesh(planeGeometry, fillPlaneMaterial);
    this.fillPlane.rotateX(Math.PI);
    this.shadowGroup.add(this.fillPlane);

    // Kamera cieni
    this.shadowCamera = new THREE.OrthographicCamera(
      -this.options.planeWidth / 2,
      this.options.planeWidth / 2,
      this.options.planeHeight / 2,
      -this.options.planeHeight / 2,
      0,
      this.options.cameraHeight
    );
    this.shadowCamera.rotation.x = Math.PI / 2;
    this.shadowGroup.add(this.shadowCamera);

    // Materiał głębi
    this.depthMaterial = new THREE.MeshDepthMaterial();
    this.depthMaterial.userData.darkness = {
      value: this.options.shadowDarkness,
    };
    this.depthMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.darkness = this.depthMaterial.userData.darkness;
      shader.fragmentShader = /* glsl */ `
        uniform float darkness;
        ${shader.fragmentShader.replace(
          'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
          'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );'
        )}
      `;
    };
    this.depthMaterial.depthTest = false;
    this.depthMaterial.depthWrite = false;

    // Materiały do rozmycia
    this.horizontalBlurMaterial = new THREE.ShaderMaterial(
      HorizontalBlurShader
    );
    this.horizontalBlurMaterial.depthTest = false;
    this.horizontalBlurMaterial.depthWrite = false;

    this.verticalBlurMaterial = new THREE.ShaderMaterial(VerticalBlurShader);
    this.verticalBlurMaterial.depthTest = false;
    this.verticalBlurMaterial.depthWrite = false;
  }

  addMesh(mesh) {
    this.meshes.push(mesh);
  }

  removeMesh(mesh) {
    const index = this.meshes.indexOf(mesh);
    if (index !== -1) {
      this.meshes.splice(index, 1);
    }
  }

  blurShadow(amount) {
    this.blurPlane.visible = true;

    // Rozmycie poziome
    this.blurPlane.material = this.horizontalBlurMaterial;
    this.horizontalBlurMaterial.uniforms.tDiffuse.value =
      this.renderTarget.texture;
    this.horizontalBlurMaterial.uniforms.h.value = (amount * 1) / 256;

    this.renderer.setRenderTarget(this.renderTargetBlur);
    this.renderer.render(this.blurPlane, this.shadowCamera);

    // Rozmycie pionowe
    this.blurPlane.material = this.verticalBlurMaterial;
    this.verticalBlurMaterial.uniforms.tDiffuse.value =
      this.renderTargetBlur.texture;
    this.verticalBlurMaterial.uniforms.v.value = (amount * 1) / 256;

    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.blurPlane, this.shadowCamera);

    this.blurPlane.visible = false;
  }

  update() {
    // Zapisz oryginalne ustawienia
    const initialBackground = this.scene.background;
    const initialClearAlpha = this.renderer.getClearAlpha();
    const initialOverrideMaterial = this.scene.overrideMaterial;

    // Przygotuj scenę do renderowania cieni
    this.scene.background = null;
    this.scene.overrideMaterial = this.depthMaterial;
    this.renderer.setClearAlpha(0);

    // Renderuj głębię do renderTarget
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.clear();
    this.renderer.render(this.scene, this.shadowCamera);

    // Przywróć oryginalne ustawienia
    this.scene.overrideMaterial = initialOverrideMaterial;
    this.scene.background = initialBackground;
    this.renderer.setClearAlpha(initialClearAlpha);

    // Rozmyj cienie
    this.blurShadow(this.options.shadowBlur);
    this.blurShadow(this.options.shadowBlur * 0.4); // Drugie rozmycie dla lepszego efektu

    // Reset render target
    this.renderer.setRenderTarget(null);
  }

  setOptions(options) {
    this.options = { ...this.options, ...options };

    // Aktualizuj materiały
    if (options.shadowOpacity !== undefined) {
      this.plane.material.opacity = options.shadowOpacity;
    }

    if (options.planeColor !== undefined) {
      this.fillPlane.material.color.set(options.planeColor);
    }

    if (options.planeOpacity !== undefined) {
      this.fillPlane.material.opacity = options.planeOpacity;
    }

    if (options.shadowDarkness !== undefined) {
      this.depthMaterial.userData.darkness.value = options.shadowDarkness;
    }
  }
}
