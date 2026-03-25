import * as THREE from 'three';

/**
 * Boat - 3D boat model with bobbing and crossing animations
 */
export class Boat {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.side = 'left';
    this.passengerSlots = [];
    this.createBoat();
  }

  createBoat() {
    this.mesh = new THREE.Group();

    // Hull - main body
    const hullShape = new THREE.Shape();
    hullShape.moveTo(-1.2, 0);
    hullShape.lineTo(-1.0, -0.5);
    hullShape.lineTo(1.0, -0.5);
    hullShape.lineTo(1.2, 0);
    hullShape.lineTo(-1.2, 0);

    const extrudeSettings = { depth: 1.6, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 };
    const hullGeo = new THREE.ExtrudeGeometry(hullShape, extrudeSettings);
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x6D4C2A,
      roughness: 0.7,
      metalness: 0.1
    });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.rotation.y = Math.PI / 2;
    hull.position.set(-0.8, 0, 0);
    hull.castShadow = true;
    this.mesh.add(hull);

    // Planks (deck lines)
    const plankMat = new THREE.MeshStandardMaterial({
      color: 0x8B6B3D,
      roughness: 0.8
    });
    for (let i = -0.6; i <= 0.6; i += 0.3) {
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.03, 0.25),
        plankMat
      );
      plank.position.set(0, 0.02, i);
      this.mesh.add(plank);
    }

    // Side rails
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x5D3A1A,
      roughness: 0.6
    });
    const railGeo = new THREE.BoxGeometry(2.3, 0.08, 0.08);
    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(0, 0.25, -0.75);
    this.mesh.add(leftRail);
    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(0, 0.25, 0.75);
    this.mesh.add(rightRail);

    // Oars
    const oarMat = new THREE.MeshStandardMaterial({ color: 0x8B6B3D, roughness: 0.5 });
    for (const zDir of [-1, 1]) {
      const oarGroup = new THREE.Group();

      // Handle
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 2, 8),
        oarMat
      );
      handle.rotation.z = Math.PI / 2;
      oarGroup.add(handle);

      // Blade
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.02, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x6D4C2A })
      );
      blade.position.x = 1.1;
      oarGroup.add(blade);

      oarGroup.position.set(0, 0.15, zDir * 0.9);
      oarGroup.rotation.x = zDir * 0.3;
      this.mesh.add(oarGroup);
    }

    // Set initial position
    this.mesh.position.set(-5.5, 0.15, 0);
    this.scene.add(this.mesh);

    // Passenger slots
    this.passengerSlots = [
      new THREE.Vector3(-0.4, 0.2, 0),
      new THREE.Vector3(0.4, 0.2, 0)
    ];
  }

  /**
   * Get world position of a passenger slot
   */
  getPassengerWorldPosition(slotIndex) {
    const localPos = this.passengerSlots[slotIndex];
    const worldPos = localPos.clone();
    this.mesh.localToWorld(worldPos);
    return worldPos;
  }

  /**
   * Get current boat position X based on side
   */
  getTargetX() {
    return this.side === 'left' ? -5.5 : 5.5;
  }

  /**
   * Update bobbing animation
   */
  updateBobbing(time) {
    if (this.mesh) {
      this.mesh.position.y = 0.15 + Math.sin(time * 1.5) * 0.08;
      this.mesh.rotation.z = Math.sin(time * 1.2) * 0.02;
      this.mesh.rotation.x = Math.sin(time * 0.8) * 0.015;
    }
  }
}
