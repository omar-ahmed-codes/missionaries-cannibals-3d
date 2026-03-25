/**
 * GameState - Core game logic for Missionaries and Cannibals
 */
export class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.leftBank = { missionaries: 3, cannibals: 3 };
    this.rightBank = { missionaries: 0, cannibals: 0 };
    this.boatSide = 'left'; // 'left' or 'right'
    this.boatPassengers = []; // Array of { type: 'missionary'|'cannibal' }
    this.moveCount = 0;
    this.history = [];
    this.gameOver = false;
    this.won = false;
  }

  /**
   * Get the bank where the boat currently is
   */
  getCurrentBank() {
    return this.boatSide === 'left' ? this.leftBank : this.rightBank;
  }

  /**
   * Check if a state is valid (no cannibals outnumbering missionaries)
   */
  isStateValid(leftM, leftC, rightM, rightC) {
    // Missionaries can't be outnumbered on either side (if there are any)
    if (leftM > 0 && leftC > leftM) return false;
    if (rightM > 0 && rightC > rightM) return false;
    return true;
  }

  /**
   * Board a character onto the boat
   */
  boardCharacter(type) {
    if (this.gameOver) return false;
    if (this.boatPassengers.length >= 2) return false;

    const bank = this.getCurrentBank();
    const alreadyOnBoat = this.boatPassengers.filter(p => p.type === type).length;

    if (type === 'missionary' && bank.missionaries - alreadyOnBoat <= 0) return false;
    if (type === 'cannibal' && bank.cannibals - alreadyOnBoat <= 0) return false;

    this.boatPassengers.push({ type });
    return true;
  }

  /**
   * Remove a character from the boat back to the current bank
   */
  unboardCharacter(index) {
    if (this.gameOver) return false;
    if (index < 0 || index >= this.boatPassengers.length) return false;

    this.boatPassengers.splice(index, 1);
    return true;
  }

  /**
   * Cross the river with current passengers
   */
  crossRiver() {
    if (this.gameOver) return { success: false, reason: 'Game is over' };
    if (this.boatPassengers.length === 0) return { success: false, reason: 'Boat is empty!' };

    // Save state for undo
    this.history.push({
      leftBank: { ...this.leftBank },
      rightBank: { ...this.rightBank },
      boatSide: this.boatSide,
      moveCount: this.moveCount
    });

    // Count passengers
    const mCount = this.boatPassengers.filter(p => p.type === 'missionary').length;
    const cCount = this.boatPassengers.filter(p => p.type === 'cannibal').length;

    // Remove from source bank
    const sourceBank = this.getCurrentBank();
    sourceBank.missionaries -= mCount;
    sourceBank.cannibals -= cCount;

    // Move boat
    this.boatSide = this.boatSide === 'left' ? 'right' : 'left';

    // Add to destination bank
    const destBank = this.getCurrentBank();
    destBank.missionaries += mCount;
    destBank.cannibals += cCount;

    // Clear passengers
    const passengers = [...this.boatPassengers];
    this.boatPassengers = [];
    this.moveCount++;

    // Check validity
    if (!this.isStateValid(
      this.leftBank.missionaries, this.leftBank.cannibals,
      this.rightBank.missionaries, this.rightBank.cannibals
    )) {
      this.gameOver = true;
      this.won = false;
      return { success: true, gameOver: true, won: false, passengers, reason: 'Cannibals outnumber missionaries!' };
    }

    // Check win
    if (this.rightBank.missionaries === 3 && this.rightBank.cannibals === 3) {
      this.gameOver = true;
      this.won = true;
      return { success: true, gameOver: true, won: true, passengers, reason: 'All crossed safely!' };
    }

    return { success: true, gameOver: false, passengers };
  }

  /**
   * Undo last move
   */
  undo() {
    if (this.history.length === 0) return false;
    const prev = this.history.pop();
    this.leftBank = prev.leftBank;
    this.rightBank = prev.rightBank;
    this.boatSide = prev.boatSide;
    this.moveCount = prev.moveCount;
    this.boatPassengers = [];
    this.gameOver = false;
    this.won = false;
    return true;
  }

  /**
   * Get a hashable state key
   */
  getStateKey() {
    return `${this.leftBank.missionaries},${this.leftBank.cannibals},${this.boatSide === 'left' ? 1 : 0}`;
  }

  /**
   * Get available characters on current bank (minus those already on boat)
   */
  getAvailableOnCurrentBank() {
    const bank = this.getCurrentBank();
    const boatM = this.boatPassengers.filter(p => p.type === 'missionary').length;
    const boatC = this.boatPassengers.filter(p => p.type === 'cannibal').length;
    return {
      missionaries: bank.missionaries - boatM,
      cannibals: bank.cannibals - boatC
    };
  }
}
