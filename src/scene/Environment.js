import * as THREE from 'three';

/**
 * Environment - Creates the 3D world (river, banks, sky, trees)
 */
export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.waterMesh = null;
    this.particles = [];
    this.treeMeshes = [];
    this.createSky();
    this.createBanks();
    this.createRiver();
    this.createTrees();
    this.createRocks();
    this.createFireflies();
  }

  createSky() {
    // Gradient sky sphere
    const skyGeo = new THREE.SphereGeometry(200, 32, 32);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x1a2a6c) },
        bottomColor: { value: new THREE.Color(0xfdbb2d) },
        offset: { value: 20 },
        exponent: { value: 0.4 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);

    // Sun glow
    const sunGeo = new THREE.SphereGeometry(5, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xFFF176,
      transparent: true,
      opacity: 0.9
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(40, 50, -60);
    this.scene.add(sunMesh);
  }

  createBanks() {
    // Left bank
    const leftBankGeo = new THREE.BoxGeometry(16, 1.5, 18);
    const bankMat = new THREE.MeshStandardMaterial({
      color: 0x4a7c3f,
      roughness: 0.9,
      metalness: 0.0
    });
    const leftBank = new THREE.Mesh(leftBankGeo, bankMat);
    leftBank.position.set(-13, -0.5, 0);
    leftBank.receiveShadow = true;
    leftBank.castShadow = true;
    this.scene.add(leftBank);

    // Left bank top (grass)
    const grassGeo = new THREE.BoxGeometry(16, 0.3, 18);
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x6db35a,
      roughness: 0.95,
      metalness: 0.0
    });
    const leftGrass = new THREE.Mesh(grassGeo, grassMat);
    leftGrass.position.set(-13, 0.35, 0);
    leftGrass.receiveShadow = true;
    this.scene.add(leftGrass);

    // Right bank
    const rightBank = new THREE.Mesh(leftBankGeo, bankMat);
    rightBank.position.set(13, -0.5, 0);
    rightBank.receiveShadow = true;
    rightBank.castShadow = true;
    this.scene.add(rightBank);

    const rightGrass = new THREE.Mesh(grassGeo, grassMat);
    rightGrass.position.set(13, 0.35, 0);
    rightGrass.receiveShadow = true;
    this.scene.add(rightGrass);

    // Sandy edges
    const edgeGeo = new THREE.BoxGeometry(1, 1.5, 18);
    const sandMat = new THREE.MeshStandardMaterial({
      color: 0xC2B280,
      roughness: 0.8
    });

    const leftEdge = new THREE.Mesh(edgeGeo, sandMat);
    leftEdge.position.set(-5.5, -0.5, 0);
    leftEdge.receiveShadow = true;
    this.scene.add(leftEdge);

    const rightEdge = new THREE.Mesh(edgeGeo, sandMat);
    rightEdge.position.set(5.5, -0.5, 0);
    rightEdge.receiveShadow = true;
    this.scene.add(rightEdge);
  }

  createRiver() {
    const riverGeo = new THREE.PlaneGeometry(10, 18, 64, 64);
    const riverMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(0x1a6fa0) },
        uColor2: { value: new THREE.Color(0x2196F3) },
        uColor3: { value: new THREE.Color(0x4FC3F7) },
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying float vWave;
        void main() {
          vUv = uv;
          vec3 pos = position;
          float wave1 = sin(pos.x * 2.0 + uTime * 1.5) * 0.08;
          float wave2 = sin(pos.y * 3.0 + uTime * 2.0) * 0.05;
          float wave3 = cos(pos.x * 1.5 + pos.y * 2.0 + uTime) * 0.06;
          pos.z = wave1 + wave2 + wave3;
          vWave = pos.z;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform float uTime;
        varying vec2 vUv;
        varying float vWave;
        void main() {
          float mixFactor = (sin(vUv.x * 6.28 + uTime) + 1.0) * 0.5;
          vec3 color = mix(uColor1, uColor2, mixFactor);
          color = mix(color, uColor3, vWave * 3.0 + 0.5);
          // Add sparkle effect
          float sparkle = max(0.0, sin(vUv.x * 40.0 + uTime * 3.0) * sin(vUv.y * 40.0 + uTime * 2.0));
          color += vec3(sparkle * 0.15);
          gl_FragColor = vec4(color, 0.9);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    this.waterMesh = new THREE.Mesh(riverGeo, riverMat);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.set(0, -0.1, 0);
    this.scene.add(this.waterMesh);
  }

  createTrees() {
    const createTree = (x, z, scale = 1) => {
      const group = new THREE.Group();

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.15 * scale, 0.25 * scale, 2 * scale, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5D4037, roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = scale;
      trunk.castShadow = true;
      group.add(trunk);

      // Foliage layers
      const colors = [0x2E7D32, 0x388E3C, 0x43A047];
      for (let i = 0; i < 3; i++) {
        const foliageGeo = new THREE.ConeGeometry(
          (1.4 - i * 0.3) * scale,
          (1.5 - i * 0.2) * scale,
          8
        );
        const foliageMat = new THREE.MeshStandardMaterial({
          color: colors[i],
          roughness: 0.8
        });
        const foliage = new THREE.Mesh(foliageGeo, foliageMat);
        foliage.position.y = (2 + i * 0.8) * scale;
        foliage.castShadow = true;
        group.add(foliage);
      }

      group.position.set(x, 0, z);
      this.scene.add(group);
      this.treeMeshes.push(group);
    };

    // Trees on left bank
    createTree(-18, -6, 1.2);
    createTree(-16, 5, 0.9);
    createTree(-20, 2, 1.0);
    createTree(-17, -3, 0.7);

    // Trees on right bank
    createTree(18, -5, 1.1);
    createTree(16, 6, 0.8);
    createTree(20, 0, 1.3);
    createTree(17, 3, 0.9);
  }

  createRocks() {
    const rockGeo = new THREE.DodecahedronGeometry(0.4, 0);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.9,
      metalness: 0.1
    });

    const rockPositions = [
      [-6, 0.2, -7], [-5.8, 0.15, 6], [5.7, 0.2, -5], [6, 0.18, 7],
      [-6.2, 0.2, 0], [5.9, 0.2, 2], [-5.5, 0.2, 3], [6.2, 0.2, -2]
    ];

    rockPositions.forEach(([x, y, z]) => {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(x, y, z);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      rock.scale.set(
        0.5 + Math.random() * 1,
        0.5 + Math.random() * 0.5,
        0.5 + Math.random() * 1
      );
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.scene.add(rock);
    });
  }

  createFireflies() {
    const particleCount = 30;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = 2 + Math.random() * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xFFFF88,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  update(time) {
    // Animate water
    if (this.waterMesh) {
      this.waterMesh.material.uniforms.uTime.value = time;
    }

    // Animate fireflies
    if (this.particleSystem) {
      const positions = this.particleSystem.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.sin(time + i) * 0.003;
        positions[i + 1] += Math.cos(time * 0.7 + i) * 0.002;
        positions[i + 2] += Math.sin(time * 0.5 + i * 0.5) * 0.003;
      }
      this.particleSystem.geometry.attributes.position.needsUpdate = true;
      this.particleSystem.material.opacity = 0.5 + Math.sin(time * 2) * 0.3;
    }

    // Subtle tree sway
    this.treeMeshes.forEach((tree, i) => {
      tree.rotation.z = Math.sin(time * 0.5 + i) * 0.02;
    });
  }
}
