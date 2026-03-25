import * as THREE from 'three';

/**
 * Characters - Creates missionary and cannibal 3D models
 */
export class Characters {
  constructor(scene) {
    this.scene = scene;
    this.missionaries = [];
    this.cannibals = [];
    this.allCharacters = [];
    this.selectedCharacters = [];
    this.createCharacters();
  }

  /**
   * Create a missionary figure
   */
  createMissionary(index) {
    const group = new THREE.Group();
    group.userData = { type: 'missionary', index, side: 'left', selected: false };

    // Body (robe)
    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.45, 1.4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xE8E0D0,
      roughness: 0.7,
      metalness: 0.0
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.2;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xFFDBBF,
      roughness: 0.6
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.15;
    head.castShadow = true;
    group.add(head);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.08, 2.18, 0.22);
    group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.08, 2.18, 0.22);
    group.add(rightEye);

    // Smile
    const smileGeo = new THREE.TorusGeometry(0.06, 0.015, 8, 12, Math.PI);
    const smileMat = new THREE.MeshStandardMaterial({ color: 0xCC7777 });
    const smile = new THREE.Mesh(smileGeo, smileMat);
    smile.position.set(0, 2.08, 0.22);
    smile.rotation.x = Math.PI;
    group.add(smile);

    // Cross necklace
    const crossV = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.2, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.8, roughness: 0.2 })
    );
    crossV.position.set(0, 1.7, 0.35);
    group.add(crossV);

    const crossH = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.04, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.8, roughness: 0.2 })
    );
    crossH.position.set(0, 1.78, 0.35);
    group.add(crossH);

    // Halo (ring above head)
    const haloGeo = new THREE.TorusGeometry(0.2, 0.025, 8, 24);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      emissive: 0xFFD700,
      emissiveIntensity: 0.5,
      metalness: 1.0,
      roughness: 0.1
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = 2.5;
    halo.rotation.x = Math.PI / 2;
    group.add(halo);

    // Selection glow ring (initially invisible)
    const glowGeo = new THREE.RingGeometry(0.5, 0.7, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x4FC3F7,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = 0.55;
    glow.rotation.x = -Math.PI / 2;
    group.add(glow);
    group.userData.glowMesh = glow;

    return group;
  }

  /**
   * Create a cannibal figure
   */
  createCannibal(index) {
    const group = new THREE.Group();
    group.userData = { type: 'cannibal', index, side: 'left', selected: false };

    // Body (tribal outfit)
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.4, 1.3, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.8,
      metalness: 0.1
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.15;
    body.castShadow = true;
    group.add(body);

    // Tribal belt/stripe
    const beltGeo = new THREE.CylinderGeometry(0.37, 0.38, 0.15, 8);
    const beltMat = new THREE.MeshStandardMaterial({
      color: 0xCD853F,
      roughness: 0.5
    });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.y = 1.0;
    group.add(belt);

    // Head
    const headGeo = new THREE.SphereGeometry(0.27, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x8B6914,
      roughness: 0.6
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.1;
    head.castShadow = true;
    group.add(head);

    // Eyes (slightly menacing)
    const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.1, 2.13, 0.23);
    group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.1, 2.13, 0.23);
    group.add(rightEye);

    // Pupils
    const pupilGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0xCC0000 });
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.1, 2.13, 0.27);
    group.add(leftPupil);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.1, 2.13, 0.27);
    group.add(rightPupil);

    // Mouth (toothy grin)
    const mouthGeo = new THREE.BoxGeometry(0.18, 0.05, 0.05);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, 2.0, 0.24);
    group.add(mouth);

    // Teeth
    for (let i = -1; i <= 1; i += 2) {
      const toothGeo = new THREE.ConeGeometry(0.02, 0.06, 4);
      const toothMat = new THREE.MeshStandardMaterial({ color: 0xFFFFF0 });
      const tooth = new THREE.Mesh(toothGeo, toothMat);
      tooth.position.set(i * 0.05, 1.97, 0.24);
      tooth.rotation.x = Math.PI;
      group.add(tooth);
    }

    // Feather headdress
    const featherColors = [0xFF4444, 0xFFAA00, 0x44FF44];
    featherColors.forEach((color, i) => {
      const featherGeo = new THREE.ConeGeometry(0.05, 0.5, 4);
      const featherMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
      const feather = new THREE.Mesh(featherGeo, featherMat);
      const angle = ((i - 1) * 0.3);
      feather.position.set(
        Math.sin(angle) * 0.15,
        2.45 + Math.abs(i - 1) * 0.05,
        -Math.cos(angle) * 0.1
      );
      feather.rotation.z = angle * 0.5;
      group.add(feather);
    });

    // Bone necklace
    const boneGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.15, 6);
    const boneMat = new THREE.MeshStandardMaterial({ color: 0xFFFFF0, roughness: 0.3 });
    for (let i = 0; i < 3; i++) {
      const bone = new THREE.Mesh(boneGeo, boneMat);
      bone.position.set(
        Math.sin(i * 0.8 - 0.8) * 0.3,
        1.65,
        Math.cos(i * 0.8 - 0.8) * 0.3
      );
      bone.rotation.z = Math.PI / 2;
      bone.rotation.y = i * 0.8 - 0.8;
      group.add(bone);
    }

    // Selection glow ring
    const glowGeo = new THREE.RingGeometry(0.5, 0.7, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xFF7043,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = 0.55;
    glow.rotation.x = -Math.PI / 2;
    group.add(glow);
    group.userData.glowMesh = glow;

    return group;
  }

  createCharacters() {
    // Create 3 missionaries
    for (let i = 0; i < 3; i++) {
      const missionary = this.createMissionary(i);
      this.missionaries.push(missionary);
      this.allCharacters.push(missionary);
      this.scene.add(missionary);
    }

    // Create 3 cannibals
    for (let i = 0; i < 3; i++) {
      const cannibal = this.createCannibal(i);
      this.cannibals.push(cannibal);
      this.allCharacters.push(cannibal);
      this.scene.add(cannibal);
    }

    this.positionCharacters();
  }

  /**
   * Position all characters on their respective banks
   */
  positionCharacters() {
    const leftMissionaries = this.missionaries.filter(c => c.userData.side === 'left');
    const leftCannibals = this.cannibals.filter(c => c.userData.side === 'left');
    const rightMissionaries = this.missionaries.filter(c => c.userData.side === 'right');
    const rightCannibals = this.cannibals.filter(c => c.userData.side === 'right');

    // Left bank positions
    leftMissionaries.forEach((m, i) => {
      m.position.set(-14 + i * 1.5, 0.5, -3);
    });
    leftCannibals.forEach((c, i) => {
      c.position.set(-14 + i * 1.5, 0.5, 3);
    });

    // Right bank positions
    rightMissionaries.forEach((m, i) => {
      m.position.set(10 + i * 1.5, 0.5, -3);
    });
    rightCannibals.forEach((c, i) => {
      c.position.set(10 + i * 1.5, 0.5, 3);
    });
  }

  /**
   * Get character positions for a given side
   */
  getPositionsForSide(side, type) {
    const baseX = side === 'left' ? -14 : 10;
    const z = type === 'missionary' ? -3 : 3;
    return [
      new THREE.Vector3(baseX, 0.5, z),
      new THREE.Vector3(baseX + 1.5, 0.5, z),
      new THREE.Vector3(baseX + 3, 0.5, z)
    ];
  }

  /**
   * Set selection glow on a character
   */
  setSelected(character, selected) {
    character.userData.selected = selected;
    const glow = character.userData.glowMesh;
    if (glow) {
      glow.material.opacity = selected ? 0.6 : 0;
    }
  }

  /**
   * Idle bobbing animation
   */
  updateIdle(time) {
    this.allCharacters.forEach((char, i) => {
      const baseY = 0.5;
      char.position.y = baseY + Math.sin(time * 2 + i * 0.7) * 0.05;

      // Pulse glow for selected characters
      if (char.userData.selected && char.userData.glowMesh) {
        char.userData.glowMesh.material.opacity = 0.4 + Math.sin(time * 4) * 0.2;
      }
    });
  }

  /**
   * Get all clickable character meshes for raycasting
   */
  getClickableObjects() {
    return this.allCharacters;
  }

  /**
   * Update character side tracking
   */
  setCharacterSide(character, side) {
    character.userData.side = side;
  }
}
