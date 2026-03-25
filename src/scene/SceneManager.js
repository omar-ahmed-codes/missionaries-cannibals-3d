import * as THREE from 'three';

/**
 * SceneManager - Sets up and manages the Three.js scene
 */
export class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.setupRenderer();
    this.setupCamera();
    this.setupLights();
    this.setupPostProcessing();
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 18, 22);
    this.camera.lookAt(0, 0, 0);
  }

  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x87CEEB, 0.4);
    this.scene.add(ambientLight);

    // Main directional light (sun)
    this.sunLight = new THREE.DirectionalLight(0xFFF5E1, 1.5);
    this.sunLight.position.set(15, 25, 10);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 80;
    this.sunLight.shadow.camera.left = -25;
    this.sunLight.shadow.camera.right = 25;
    this.sunLight.shadow.camera.top = 25;
    this.sunLight.shadow.camera.bottom = -25;
    this.sunLight.shadow.bias = -0.001;
    this.scene.add(this.sunLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x8EC8F0, 0.3);
    fillLight.position.set(-10, 10, -5);
    this.scene.add(fillLight);

    // Hemisphere light for natural outdoor feel
    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x3A7D44, 0.4);
    this.scene.add(hemiLight);
  }

  setupPostProcessing() {
    // Fog for depth effect
    this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.008);
  }

  handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  getDelta() {
    return this.clock.getDelta();
  }

  getElapsed() {
    return this.clock.getElapsedTime();
  }
}
