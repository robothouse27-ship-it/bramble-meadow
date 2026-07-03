export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Cell = Digit | 0; // 0 = empty
export type Grid = Cell[]; // length 81, row-major

export type Difficulty = "easy" | "medium" | "hard";

const SIZE = 9;
const BOX = 3;

export function idx(row: number, col: number): number {
  return row * SIZE + col;
}

export function rowOf(i: number): number {
  return Math.floor(i / SIZE);
}

export function colOf(i: number): number {
  return i % SIZE;
}

export function boxOf(i: number): number {
  const r = rowOf(i);
  const c = colOf(i);
  return Math.floor(r / BOX) * BOX + Math.floor(c / BOX);
}

/** Indices of all cells sharing a row, column, or box with `i` (excluding itself). */
export function peersOf(i: number): number[] {
  const r = rowOf(i);
  const c = colOf(i);
  const b = boxOf(i);
  const peers = new Set<number>();
  for (let k = 0; k < SIZE; k++) {
    peers.add(idx(r, k));
    peers.add(idx(k, c));
  }
  const br = Math.floor(b / BOX) * BOX;
  const bc = (b % BOX) * BOX;
  for (let dr = 0; dr < BOX; dr++) {
    for (let dc = 0; dc < BOX; dc++) {
      peers.add(idx(br + dr, bc + dc));
    }
  }
  peers.delete(i);
  return [...peers];
}

const PEERS: number[][] = Array.from({ length: 81 }, (_, i) => peersOf(i));

export function isValidPlacement(grid: Grid, i: number, value: Cell): boolean {
  if (value === 0) return true;
  for (const p of PEERS[i]) {
    if (grid[p] === value) return false;
  }
  return true;
}

/** All (row,col,box) conflicts currently present in the grid, as a set of cell indices. */
export function getConflicts(grid: Grid): Set<number> {
  const conflicts = new Set<number>();
  for (let i = 0; i < 81; i++) {
    const v = grid[i];
    if (v === 0) continue;
    for (const p of PEERS[i]) {
      if (grid[p] === v) {
        conflicts.add(i);
        conflicts.add(p);
      }
    }
  }
  return conflicts;
}

export function isComplete(grid: Grid): boolean {
  return grid.every((v) => v !== 0) && getConflicts(grid).size === 0;
}

function shuffledDigits(rng: () => number): Digit[] {
  const digits: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits;
}

/** Simple mulberry32 PRNG for optional deterministic seeding. */
export function makeRng(seed?: number): () => number {
  if (seed === undefined) return Math.random;
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Backtracking fill to produce a randomized, fully-solved valid grid. */
export function generateSolvedGrid(rng: () => number = Math.random): Grid {
  const grid: Grid = new Array(81).fill(0);

  function fill(pos: number): boolean {
    if (pos === 81) return true;
    if (grid[pos] !== 0) return fill(pos + 1);
    const digits = shuffledDigits(rng);
    for (const d of digits) {
      if (isValidPlacement(grid, pos, d)) {
        grid[pos] = d;
        if (fill(pos + 1)) return true;
        grid[pos] = 0;
      }
    }
    return false;
  }

  fill(0);
  return grid;
}

/**
 * Counts solutions up to `cap` (stops early once cap is reached).
 * Used to verify uniqueness without solving exhaustively.
 */
export function countSolutions(grid: Grid, cap = 2): number {
  const g = grid.slice();
  let count = 0;

  function nextEmpty(): number {
    for (let i = 0; i < 81; i++) if (g[i] === 0) return i;
    return -1;
  }

  function backtrack(): void {
    if (count >= cap) return;
    const pos = nextEmpty();
    if (pos === -1) {
      count++;
      return;
    }
    for (let d = 1; d <= 9; d++) {
      if (count >= cap) return;
      if (isValidPlacement(g, pos, d as Digit)) {
        g[pos] = d as Digit;
        backtrack();
        g[pos] = 0;
      }
    }
  }

  backtrack();
  return count;
}

/** Attempts to fully solve a grid; returns the solved grid or null if unsolvable. */
export function solve(grid: Grid): Grid | null {
  const g = grid.slice();

  function nextEmpty(): number {
    for (let i = 0; i < 81; i++) if (g[i] === 0) return i;
    return -1;
  }

  function backtrack(): boolean {
    const pos = nextEmpty();
    if (pos === -1) return true;
    for (let d = 1; d <= 9; d++) {
      if (isValidPlacement(g, pos, d as Digit)) {
        g[pos] = d as Digit;
        if (backtrack()) return true;
        g[pos] = 0;
      }
    }
    return false;
  }

  return backtrack() ? g : null;
}

const CLUES_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 40,
  medium: 32,
  hard: 26,
};

/**
 * Digs cells out of a solved grid, keeping the puzzle uniquely solvable,
 * until roughly the target clue count for the difficulty is reached.
 */
export function generatePuzzle(
  difficulty: Difficulty,
  rng: () => number = Math.random
): { puzzle: Grid; solution: Grid } {
  const solution = generateSolvedGrid(rng);
  const puzzle = solution.slice();
  const targetClues = CLUES_BY_DIFFICULTY[difficulty];

  const order = Array.from({ length: 81 }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  let clues = 81;
  for (const i of order) {
    if (clues <= targetClues) break;
    const removed = puzzle[i];
    puzzle[i] = 0;
    if (countSolutions(puzzle, 2) !== 1) {
      puzzle[i] = removed; // put it back, not safe to remove
    } else {
      clues--;
    }
  }

  return { puzzle, solution };
}
