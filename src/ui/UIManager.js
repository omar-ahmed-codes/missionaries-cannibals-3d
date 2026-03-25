/**
 * UIManager - Handles all HTML-based UI (HUD, modals, menus)
 */
export class UIManager {
  constructor() {
    this.createUI();
    this.callbacks = {};
  }

  on(event, callback) {
    this.callbacks[event] = callback;
  }

  emit(event, data) {
    if (this.callbacks[event]) this.callbacks[event](data);
  }

  createUI() {
    // ---- START SCREEN ----
    this.startScreen = document.createElement('div');
    this.startScreen.id = 'start-screen';
    this.startScreen.innerHTML = `
      <div class="start-content">
        <div class="title-glow"></div>
        <h1 class="game-title">⛵ Missionaries<br>&amp; Cannibals</h1>
        <p class="game-subtitle">A Classic AI Puzzle — 3D Edition</p>
        <div class="start-buttons">
          <button id="btn-play" class="btn btn-primary">▶ Play Game</button>
          <button id="btn-how-to" class="btn btn-secondary">📖 How to Play</button>
          <button id="btn-ai-solve" class="btn btn-accent">🤖 Watch AI Solve</button>
        </div>
        <div class="credits">Built with Three.js · AI Semester IV Project</div>
      </div>
    `;
    document.body.appendChild(this.startScreen);

    // ---- HOW TO PLAY MODAL ----
    this.howToModal = document.createElement('div');
    this.howToModal.id = 'how-to-modal';
    this.howToModal.className = 'modal hidden';
    this.howToModal.innerHTML = `
      <div class="modal-content glass-panel">
        <h2>📖 How to Play</h2>
        <div class="rules-list">
          <div class="rule-item"><span class="rule-icon">🎯</span><p>Get all 3 missionaries and 3 cannibals across the river</p></div>
          <div class="rule-item"><span class="rule-icon">🚣</span><p>The boat carries <strong>1 or 2</strong> people at a time</p></div>
          <div class="rule-item"><span class="rule-icon">⚠️</span><p>Cannibals must <strong>never outnumber</strong> missionaries on either bank</p></div>
          <div class="rule-item"><span class="rule-icon">🖱️</span><p><strong>Click characters</strong> on the boat's side to board them</p></div>
          <div class="rule-item"><span class="rule-icon">⛵</span><p>Press <strong>"Cross River"</strong> to send the boat across</p></div>
        </div>
        <button id="btn-close-how" class="btn btn-primary">Got it!</button>
      </div>
    `;
    document.body.appendChild(this.howToModal);

    // ---- GAME HUD ----
    this.hud = document.createElement('div');
    this.hud.id = 'game-hud';
    this.hud.className = 'hidden';
    this.hud.innerHTML = `
      <div class="hud-top">
        <div class="hud-panel glass-panel">
          <div class="bank-status" id="left-bank-status">
            <span class="bank-label">← Left Bank</span>
            <div class="bank-counts">
              <span class="missionary-count"><span class="char-dot m-dot"></span> <span id="left-m">3</span></span>
              <span class="cannibal-count"><span class="char-dot c-dot"></span> <span id="left-c">3</span></span>
            </div>
          </div>
          <div class="move-counter">
            <span class="move-label">Moves</span>
            <span class="move-number" id="move-count">0</span>
          </div>
          <div class="bank-status" id="right-bank-status">
            <span class="bank-label">Right Bank →</span>
            <div class="bank-counts">
              <span class="missionary-count"><span class="char-dot m-dot"></span> <span id="right-m">0</span></span>
              <span class="cannibal-count"><span class="char-dot c-dot"></span> <span id="right-c">0</span></span>
            </div>
          </div>
        </div>
      </div>
      <div class="hud-bottom">
        <div class="boat-info glass-panel" id="boat-info">
          <span class="boat-label">🚣 Boat</span>
          <span class="boat-side" id="boat-side-label">Left Side</span>
          <div class="boat-passengers" id="boat-passengers">Empty</div>
        </div>
        <div class="action-buttons">
          <button id="btn-cross" class="btn btn-cross" disabled>⛵ Cross River</button>
          <button id="btn-undo" class="btn btn-small">↩ Undo</button>
          <button id="btn-hint" class="btn btn-small btn-hint">💡 Hint</button>
          <button id="btn-restart" class="btn btn-small btn-danger">🔄 Restart</button>
        </div>
      </div>
      <div class="hud-message hidden" id="hud-message">
        <span id="hud-message-text"></span>
      </div>
    `;
    document.body.appendChild(this.hud);

    // ---- GAME OVER MODAL ----
    this.gameOverModal = document.createElement('div');
    this.gameOverModal.id = 'game-over-modal';
    this.gameOverModal.className = 'modal hidden';
    this.gameOverModal.innerHTML = `
      <div class="modal-content glass-panel">
        <h2 id="game-over-title">Game Over</h2>
        <p id="game-over-message"></p>
        <p id="game-over-moves"></p>
        <div class="modal-buttons">
          <button id="btn-play-again" class="btn btn-primary">🔄 Play Again</button>
          <button id="btn-back-menu" class="btn btn-secondary">🏠 Main Menu</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.gameOverModal);

    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('btn-play').addEventListener('click', () => this.emit('play'));
    document.getElementById('btn-how-to').addEventListener('click', () => this.showHowTo());
    document.getElementById('btn-ai-solve').addEventListener('click', () => this.emit('aiSolve'));
    document.getElementById('btn-close-how').addEventListener('click', () => this.hideHowTo());
    document.getElementById('btn-cross').addEventListener('click', () => this.emit('cross'));
    document.getElementById('btn-undo').addEventListener('click', () => this.emit('undo'));
    document.getElementById('btn-hint').addEventListener('click', () => this.emit('hint'));
    document.getElementById('btn-restart').addEventListener('click', () => this.emit('restart'));
    document.getElementById('btn-play-again').addEventListener('click', () => this.emit('restart'));
    document.getElementById('btn-back-menu').addEventListener('click', () => this.emit('menu'));
  }

  showHowTo() {
    this.howToModal.classList.remove('hidden');
  }

  hideHowTo() {
    this.howToModal.classList.add('hidden');
  }

  showStartScreen() {
    this.startScreen.classList.remove('hidden');
    this.hud.classList.add('hidden');
    this.gameOverModal.classList.add('hidden');
  }

  hideStartScreen() {
    this.startScreen.classList.add('hidden');
    this.hud.classList.remove('hidden');
  }

  updateHUD(gameState) {
    document.getElementById('left-m').textContent = gameState.leftBank.missionaries;
    document.getElementById('left-c').textContent = gameState.leftBank.cannibals;
    document.getElementById('right-m').textContent = gameState.rightBank.missionaries;
    document.getElementById('right-c').textContent = gameState.rightBank.cannibals;
    document.getElementById('move-count').textContent = gameState.moveCount;

    const boatSideLabel = document.getElementById('boat-side-label');
    boatSideLabel.textContent = gameState.boatSide === 'left' ? 'Left Side' : 'Right Side';

    // Update boat passengers
    const passengerDiv = document.getElementById('boat-passengers');
    if (gameState.boatPassengers.length === 0) {
      passengerDiv.innerHTML = '<span class="empty-boat">Click characters to board</span>';
    } else {
      passengerDiv.innerHTML = gameState.boatPassengers.map((p, i) =>
        `<span class="passenger-tag ${p.type}" onclick="window.gameApp.unboardPassenger(${i})">${p.type === 'missionary' ? '✝️' : '🦴'} ${p.type} ✕</span>`
      ).join('');
    }

    // Enable/disable cross button
    const crossBtn = document.getElementById('btn-cross');
    crossBtn.disabled = gameState.boatPassengers.length === 0;
  }

  showMessage(text, type = 'info') {
    const msgDiv = document.getElementById('hud-message');
    const msgText = document.getElementById('hud-message-text');
    msgDiv.className = `hud-message ${type}`;
    msgText.textContent = text;
    msgDiv.classList.remove('hidden');

    clearTimeout(this._messageTimeout);
    this._messageTimeout = setTimeout(() => {
      msgDiv.classList.add('hidden');
    }, 3000);
  }

  showGameOver(won, moveCount) {
    const title = document.getElementById('game-over-title');
    const message = document.getElementById('game-over-message');
    const moves = document.getElementById('game-over-moves');

    if (won) {
      title.textContent = '🎉 Victory!';
      title.style.color = '#4CAF50';
      message.textContent = 'Everyone crossed the river safely!';
      moves.textContent = `Completed in ${moveCount} moves`;
    } else {
      title.textContent = '💀 Game Over';
      title.style.color = '#FF5252';
      message.textContent = 'The cannibals outnumbered the missionaries...';
      moves.textContent = `Failed after ${moveCount} moves`;
    }

    this.gameOverModal.classList.remove('hidden');
  }

  hideGameOver() {
    this.gameOverModal.classList.add('hidden');
  }

  showHint(hint) {
    if (!hint) {
      this.showMessage('No solution from current state!', 'error');
      return;
    }
    const mText = hint.missionaries > 0 ? `${hint.missionaries} missionary${hint.missionaries > 1 ? 's' : ''}` : '';
    const cText = hint.cannibals > 0 ? `${hint.cannibals} cannibal${hint.cannibals > 1 ? 's' : ''}` : '';
    const connector = mText && cText ? ' and ' : '';
    this.showMessage(`💡 Hint: Send ${mText}${connector}${cText} to the ${hint.direction}`, 'hint');
  }
}
