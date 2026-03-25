import * as THREE from 'three';

/**
 * AnimationManager - Handles all tweening and game animations
 */
export class AnimationManager {
  constructor() {
    this.animations = [];
    this.confettiParticles = [];
    this.confettiGroup = null;
  }

  /**
   * Simple easing functions
   */
  static easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  static easeOutBounce(t) {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    else return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }

  static easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  }

  /**
   * Animate an object's property over time
   */
  animate(object, property, from, to, duration, easingFn = AnimationManager.easeInOutCubic) {
    return new Promise(resolve => {
      const anim = {
        object,
        property,
        from,
        to,
        duration,
        elapsed: 0,
        easingFn,
        resolve
      };
      this.animations.push(anim);
    });
  }

  /**
   * Move a character to a target position
   */
  async moveCharacterTo(character, targetPos, duration = 0.8) {
    const startPos = character.position.clone();
    await Promise.all([
      this.animate(character.position, 'x', startPos.x, targetPos.x, duration),
      this.animate(character.position, 'z', startPos.z, targetPos.z, duration)
    ]);
  }

  /**
   * Animate boat crossing
   */
  async animateBoatCrossing(boat, passengers, targetSide) {
    const targetX = targetSide === 'right' ? 5.5 : -5.5;
    const startX = boat.mesh.position.x;
    const duration = 2.0;

    // Move boat and passengers together
    return new Promise(resolve => {
      const anim = {
        object: { boat, passengers, startX, targetX },
        property: 'custom_boat_cross',
        from: 0,
        to: 1,
        duration,
        elapsed: 0,
        easingFn: AnimationManager.easeInOutCubic,
        resolve,
        customUpdate: (progress) => {
          const x = startX + (targetX - startX) * progress;
          boat.mesh.position.x = x;
          // Move passengers with boat
          passengers.forEach((p, i) => {
            const slot = boat.passengerSlots[i];
            if (slot) {
              const worldPos = slot.clone();
              boat.mesh.localToWorld(worldPos);
              p.position.x = worldPos.x;
              p.position.z = worldPos.z;
            }
          });
        }
      };
      this.animations.push(anim);
    });
  }

  /**
   * Victory celebration - spawn confetti
   */
  createConfetti(scene) {
    this.confettiGroup = new THREE.Group();
    const colors = [0xFF4444, 0x44FF44, 0x4444FF, 0xFFFF44, 0xFF44FF, 0x44FFFF, 0xFFAA00, 0xAA00FF];

    for (let i = 0; i < 150; i++) {
      const geo = new THREE.BoxGeometry(0.15, 0.15, 0.02);
      const mat = new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        transparent: true,
        opacity: 1
      });
      const particle = new THREE.Mesh(geo, mat);
      particle.position.set(
        (Math.random() - 0.5) * 20,
        8 + Math.random() * 10,
        (Math.random() - 0.5) * 15
      );
      particle.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        -0.02 - Math.random() * 0.05,
        (Math.random() - 0.5) * 0.1
      );
      particle.userData.rotSpeed = new THREE.Vector3(
        Math.random() * 0.1,
        Math.random() * 0.1,
        Math.random() * 0.1
      );
      this.confettiParticles.push(particle);
      this.confettiGroup.add(particle);
    }
    scene.add(this.confettiGroup);
  }

  /**
   * Game over shake effect
   */
  async shakeCamera(camera) {
    const originalPos = camera.position.clone();
    const shakeIntensity = 0.5;
    const shakeDuration = 0.6;

    return new Promise(resolve => {
      const startTime = performance.now();
      const shakeInterval = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        if (elapsed >= shakeDuration) {
          camera.position.copy(originalPos);
          clearInterval(shakeInterval);
          resolve();
          return;
        }
        const decay = 1 - elapsed / shakeDuration;
        camera.position.x = originalPos.x + (Math.random() - 0.5) * shakeIntensity * decay;
        camera.position.y = originalPos.y + (Math.random() - 0.5) * shakeIntensity * decay;
      }, 16);
    });
  }

  /**
   * Character jump animation
   */
  async jumpCharacter(character) {
    const startY = character.position.y;
    const jumpHeight = 1.5;

    await this.animate(character.position, 'y', startY, startY + jumpHeight, 0.3, AnimationManager.easeOutQuad);
    await this.animate(character.position, 'y', startY + jumpHeight, startY, 0.3, AnimationManager.easeOutBounce);
  }

  /**
   * Update all running animations
   */
  update(delta) {
    // Update tween animations
    for (let i = this.animations.length - 1; i >= 0; i--) {
      const anim = this.animations[i];
      anim.elapsed += delta;
      const progress = Math.min(anim.elapsed / anim.duration, 1);
      const easedProgress = anim.easingFn(progress);

      if (anim.customUpdate) {
        anim.customUpdate(easedProgress);
      } else {
        const value = anim.from + (anim.to - anim.from) * easedProgress;
        anim.object[anim.property] = value;
      }

      if (progress >= 1) {
        this.animations.splice(i, 1);
        if (anim.resolve) anim.resolve();
      }
    }

    // Update confetti
    this.confettiParticles.forEach(p => {
      p.position.add(p.userData.velocity);
      p.rotation.x += p.userData.rotSpeed.x;
      p.rotation.y += p.userData.rotSpeed.y;
      p.rotation.z += p.userData.rotSpeed.z;
      p.userData.velocity.y -= 0.001; // gravity
      if (p.position.y < 0) {
        p.material.opacity *= 0.98;
      }
    });
  }

  /**
   * Check if any animations are currently playing
   */
  isAnimating() {
    return this.animations.length > 0;
  }

  /**
   * Clear all confetti
   */
  clearConfetti(scene) {
    if (this.confettiGroup) {
      scene.remove(this.confettiGroup);
      this.confettiParticles = [];
      this.confettiGroup = null;
    }
  }
}
