import * as THREE from 'three';
import { GameState } from './game/GameState.js';
import { AISolver } from './game/AISolver.js';
import { SceneManager } from './scene/SceneManager.js';
import { Environment } from './scene/Environment.js';
import { Characters } from './scene/Characters.js';
import { Boat } from './scene/Boat.js';
import { AnimationManager } from './animations/AnimationManager.js';
import { UIManager } from './ui/UIManager.js';
import './styles/index.css';

/**
 * Main Game Application
 */
class MissionariesAndCannibalsGame {
  constructor() {
    this.container = document.getElementById('game-container');
    this.sceneManager = new SceneManager(this.container);
    this.environment = new Environment(this.sceneManager.scene);
    this.characters = new Characters(this.sceneManager.scene);
    this.boat = new Boat(this.sceneManager.scene);
    this.animationManager = new AnimationManager();
    this.gameState = new GameState();
    this.aiSolver = new AISolver();
    this.ui = new UIManager();

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.isPlaying = false;
    this.isAnimating = false;

    // Red flash overlay
    this.redFlash = document.createElement('div');
    this.redFlash.id = 'red-flash';
    document.body.appendChild(this.redFlash);

    this.setupEventListeners();
    this.animate();

    // Expose for passenger tag click handlers
    window.gameApp = this;
  }

  setupEventListeners() {
    // UI events
    this.ui.on('play', () => this.startGame());
    this.ui.on('aiSolve', () => this.startAISolve());
    this.ui.on('cross', () => this.crossRiver());
    this.ui.on('undo', () => this.undoMove());
    this.ui.on('hint', () => this.showHint());
    this.ui.on('restart', () => this.restartGame());
    this.ui.on('menu', () => this.goToMenu());

    // Click detection
    this.sceneManager.renderer.domElement.addEventListener('click', (e) => this.onCanvasClick(e));

    // Track mouse for hover
    this.sceneManager.renderer.domElement.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  }

  startGame() {
    this.isPlaying = true;
    this.gameState.reset();
    this.resetScene();
    this.ui.hideStartScreen();
    this.ui.hideGameOver();
    this.ui.updateHUD(this.gameState);
    this.ui.showMessage('Click characters to board the boat!', 'info');
  }

  restartGame() {
    this.gameState.reset();
    this.animationManager.clearConfetti(this.sceneManager.scene);
    this.resetScene();
    this.ui.hideGameOver();
    this.ui.updateHUD(this.gameState);
    this.isAnimating = false;
    this.ui.showMessage('Game restarted!', 'info');
  }

  goToMenu() {
    this.isPlaying = false;
    this.animationManager.clearConfetti(this.sceneManager.scene);
    this.gameState.reset();
    this.resetScene();
    this.ui.showStartScreen();
    this.ui.hideGameOver();
    this.isAnimating = false;
  }

  resetScene() {
    // Reset all characters to left bank
    this.characters.allCharacters.forEach(char => {
      char.userData.side = 'left';
      char.userData.selected = false;
      this.characters.setSelected(char, false);
    });
    this.characters.positionCharacters();

    // Reset boat
    this.boat.side = 'left';
    this.boat.mesh.position.x = -5.5;
  }

  onCanvasClick(event) {
    if (!this.isPlaying || this.gameState.gameOver || this.isAnimating) return;

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

    // Check intersection with characters
    const clickableObjects = this.characters.getClickableObjects();
    const allMeshes = [];

    clickableObjects.forEach(group => {
      group.traverse(child => {
        if (child.isMesh) {
          child.userData.parentGroup = group;
          allMeshes.push(child);
        }
      });
    });

    const intersects = this.raycaster.intersectObjects(allMeshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const character = hitMesh.userData.parentGroup;
      if (character) {
        this.handleCharacterClick(character);
      }
    }
  }

  handleCharacterClick(character) {
    const charSide = character.userData.side;

    // Can only board characters on the boat's current side
    if (charSide !== this.gameState.boatSide) {
      this.ui.showMessage(`That character is on the other side!`, 'error');
      return;
    }

    // Check if already selected (on boat)
    if (character.userData.selected) {
      // Unboard
      const type = character.userData.type;
      const idx = this.gameState.boatPassengers.findIndex(p => p.type === type);
      if (idx !== -1) {
        this.gameState.unboardCharacter(idx);
        this.characters.setSelected(character, false);
        this.repositionCharacterOnBank(character);
        this.ui.updateHUD(this.gameState);
      }
      return;
    }

    // Try to board
    const success = this.gameState.boardCharacter(character.userData.type);
    if (success) {
      this.characters.setSelected(character, true);

      // Move character to boat position
      const slotIndex = this.gameState.boatPassengers.length - 1;
      const boatPos = this.boat.getPassengerWorldPosition(slotIndex);
      this.animationManager.moveCharacterTo(character, boatPos, 0.5);

      this.ui.updateHUD(this.gameState);
    } else {
      if (this.gameState.boatPassengers.length >= 2) {
        this.ui.showMessage('Boat is full! (max 2)', 'error');
      } else {
        this.ui.showMessage('No more of that type available!', 'error');
      }
    }
  }

  repositionCharacterOnBank(character) {
    const type = character.userData.type;
    const side = character.userData.side;
    const positions = this.characters.getPositionsForSide(side, type);

    // Find next available position
    const sameTypeOnSide = this.characters.allCharacters.filter(
      c => c.userData.type === type && c.userData.side === side && !c.userData.selected && c !== character
    );
    const posIndex = sameTypeOnSide.length;
    if (positions[posIndex]) {
      this.animationManager.moveCharacterTo(character, positions[posIndex], 0.4);
    }
  }

  async crossRiver() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const result = this.gameState.crossRiver();

    if (!result.success) {
      this.ui.showMessage(result.reason, 'error');
      this.isAnimating = false;
      return;
    }

    // Get the passengers (characters that were selected)
    const passengerCharacters = this.characters.allCharacters.filter(c => c.userData.selected);

    // Animate boat crossing
    const targetSide = this.gameState.boatSide;
    await this.animationManager.animateBoatCrossing(this.boat, passengerCharacters, targetSide);

    this.boat.side = targetSide;

    // Move passengers off boat to bank
    for (const char of passengerCharacters) {
      char.userData.side = targetSide;
      char.userData.selected = false;
      this.characters.setSelected(char, false);
    }

    // Reposition all characters on both banks
    this.repositionAllCharacters();

    this.ui.updateHUD(this.gameState);

    // Check game over
    if (result.gameOver) {
      // Small delay for dramatic effect
      await new Promise(r => setTimeout(r, 500));

      if (result.won) {
        // Victory!
        this.ui.showMessage('🎉 Everyone crossed safely!', 'success');
        this.animationManager.createConfetti(this.sceneManager.scene);

        // Jump all characters on right side
        const rightChars = this.characters.allCharacters.filter(c => c.userData.side === 'right');
        for (const char of rightChars) {
          this.animationManager.jumpCharacter(char);
          await new Promise(r => setTimeout(r, 100));
        }

        await new Promise(r => setTimeout(r, 1500));
        this.ui.showGameOver(true, this.gameState.moveCount);
      } else {
        // Game over
        this.redFlash.classList.add('active');
        await this.animationManager.shakeCamera(this.sceneManager.camera);
        setTimeout(() => this.redFlash.classList.remove('active'), 1000);
        await new Promise(r => setTimeout(r, 500));
        this.ui.showGameOver(false, this.gameState.moveCount);
      }
    }

    this.isAnimating = false;
  }

  repositionAllCharacters() {
    ['missionary', 'cannibal'].forEach(type => {
      ['left', 'right'].forEach(side => {
        const chars = this.characters.allCharacters.filter(
          c => c.userData.type === type && c.userData.side === side && !c.userData.selected
        );
        const positions = this.characters.getPositionsForSide(side, type);
        chars.forEach((char, i) => {
          if (positions[i]) {
            this.animationManager.moveCharacterTo(char, positions[i], 0.6);
          }
        });
      });
    });
  }

  undoMove() {
    if (this.isAnimating) return;
    const success = this.gameState.undo();
    if (success) {
      // Reset character sides based on game state
      this.syncCharactersToState();
      this.boat.side = this.gameState.boatSide;
      this.boat.mesh.position.x = this.boat.getTargetX();
      this.ui.updateHUD(this.gameState);
      this.ui.showMessage('Move undone!', 'info');
    } else {
      this.ui.showMessage('Nothing to undo!', 'error');
    }
  }

  syncCharactersToState() {
    // Missionaries on left
    const leftM = this.gameState.leftBank.missionaries;
    const rightM = this.gameState.rightBank.missionaries;
    this.characters.missionaries.forEach((m, i) => {
      m.userData.side = i < leftM ? 'left' : 'right';
      m.userData.selected = false;
      this.characters.setSelected(m, false);
    });

    // Cannibals on left
    const leftC = this.gameState.leftBank.cannibals;
    this.characters.cannibals.forEach((c, i) => {
      c.userData.side = i < leftC ? 'left' : 'right';
      c.userData.selected = false;
      this.characters.setSelected(c, false);
    });

    this.repositionAllCharacters();
  }

  showHint() {
    if (this.isAnimating) return;
    const hint = this.aiSolver.getHint(
      this.gameState.leftBank.missionaries,
      this.gameState.leftBank.cannibals,
      this.gameState.boatSide === 'left'
    );
    this.ui.showHint(hint);
  }

  async startAISolve() {
    this.startGame();
    await new Promise(r => setTimeout(r, 500));

    const solution = this.aiSolver.getFullSolution(3, 3, true);
    if (!solution) {
      this.ui.showMessage('No solution found!', 'error');
      return;
    }

    this.ui.showMessage(`🤖 AI solving in ${solution.length} moves...`, 'info');

    for (const move of solution) {
      await new Promise(r => setTimeout(r, 1000));

      if (!this.isPlaying) return;

      // Board characters for this move
      const currentSide = this.gameState.boatSide;
      const availableChars = this.characters.allCharacters.filter(
        c => c.userData.side === currentSide && !c.userData.selected
      );

      // Board missionaries
      for (let i = 0; i < move.missionaries; i++) {
        const char = availableChars.find(c => c.userData.type === 'missionary' && !c.userData.selected);
        if (char) {
          this.handleCharacterClick(char);
          await new Promise(r => setTimeout(r, 300));
        }
      }

      // Board cannibals
      for (let i = 0; i < move.cannibals; i++) {
        const char = availableChars.find(c => c.userData.type === 'cannibal' && !c.userData.selected);
        if (char) {
          this.handleCharacterClick(char);
          await new Promise(r => setTimeout(r, 300));
        }
      }

      await new Promise(r => setTimeout(r, 500));
      await this.crossRiver();
    }
  }

  unboardPassenger(index) {
    if (this.isAnimating) return;

    const passenger = this.gameState.boatPassengers[index];
    if (!passenger) return;

    // Find the selected character
    const char = this.characters.allCharacters.find(
      c => c.userData.type === passenger.type && c.userData.selected
    );

    if (char) {
      this.gameState.unboardCharacter(index);
      char.userData.selected = false;
      this.characters.setSelected(char, false);
      this.repositionCharacterOnBank(char);
      this.ui.updateHUD(this.gameState);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.sceneManager.getDelta();
    const elapsed = this.sceneManager.getElapsed();

    // Update environment (water, particles, trees)
    this.environment.update(elapsed);

    // Update character idle animations
    this.characters.updateIdle(elapsed);

    // Update boat bobbing
    this.boat.updateBobbing(elapsed);

    // Update animation manager
    this.animationManager.update(delta);

    // Hover cursor
    this.updateCursor();

    // Render
    this.sceneManager.render();
  }

  updateCursor() {
    if (!this.isPlaying || this.gameState.gameOver || this.isAnimating) {
      this.sceneManager.renderer.domElement.style.cursor = 'default';
      return;
    }

    this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);
    const allMeshes = [];
    this.characters.getClickableObjects().forEach(group => {
      group.traverse(child => {
        if (child.isMesh) allMeshes.push(child);
      });
    });

    const intersects = this.raycaster.intersectObjects(allMeshes, false);
    this.sceneManager.renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
  }
}

// Initialize game on DOM load
document.addEventListener('DOMContentLoaded', () => {
  new MissionariesAndCannibalsGame();
});
