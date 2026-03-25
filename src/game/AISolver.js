/**
 * AISolver - BFS solver for the Missionaries and Cannibals problem
 */
export class AISolver {
  constructor() {
    this.solution = null;
  }

  /**
   * Solve the puzzle using BFS from a given state
   */
  solve(leftM, leftC, boatOnLeft) {
    const startState = { leftM, leftC, boatOnLeft };
    const goalState = { leftM: 0, leftC: 0, boatOnLeft: false };

    const stateKey = (s) => `${s.leftM},${s.leftC},${s.boatOnLeft ? 1 : 0}`;

    const queue = [{ state: startState, path: [] }];
    const visited = new Set();
    visited.add(stateKey(startState));

    // All possible moves: [missionaries, cannibals] in boat
    const moves = [
      [1, 0], [2, 0], [0, 1], [0, 2], [1, 1]
    ];

    while (queue.length > 0) {
      const { state, path } = queue.shift();

      // Check goal
      if (state.leftM === goalState.leftM &&
          state.leftC === goalState.leftC &&
          state.boatOnLeft === goalState.boatOnLeft) {
        this.solution = path;
        return path;
      }

      for (const [m, c] of moves) {
        let newState;

        if (state.boatOnLeft) {
          // Moving from left to right
          if (m > state.leftM || c > state.leftC) continue;
          newState = {
            leftM: state.leftM - m,
            leftC: state.leftC - c,
            boatOnLeft: false
          };
        } else {
          // Moving from right to left
          const rightM = 3 - state.leftM;
          const rightC = 3 - state.leftC;
          if (m > rightM || c > rightC) continue;
          newState = {
            leftM: state.leftM + m,
            leftC: state.leftC + c,
            boatOnLeft: true
          };
        }

        const newRightM = 3 - newState.leftM;
        const newRightC = 3 - newState.leftC;

        // Validate state
        if (newState.leftM < 0 || newState.leftC < 0 || newRightM < 0 || newRightC < 0) continue;
        if (newState.leftM > 0 && newState.leftC > newState.leftM) continue;
        if (newRightM > 0 && newRightC > newRightM) continue;

        const key = stateKey(newState);
        if (!visited.has(key)) {
          visited.add(key);
          const move = {
            missionaries: m,
            cannibals: c,
            direction: state.boatOnLeft ? 'right' : 'left'
          };
          queue.push({ state: newState, path: [...path, move] });
        }
      }
    }

    return null; // No solution found
  }

  /**
   * Get a hint (next move from current state)
   */
  getHint(leftM, leftC, boatOnLeft) {
    const solution = this.solve(leftM, leftC, boatOnLeft);
    if (solution && solution.length > 0) {
      return solution[0];
    }
    return null;
  }

  /**
   * Get full solution from current state
   */
  getFullSolution(leftM, leftC, boatOnLeft) {
    return this.solve(leftM, leftC, boatOnLeft);
  }
}
