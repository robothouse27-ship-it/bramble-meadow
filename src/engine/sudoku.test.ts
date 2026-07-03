import { describe, it, expect } from "vitest";
import {
  generateSolvedGrid,
  generatePuzzle,
  countSolutions,
  solve,
  isComplete,
  getConflicts,
  makeRng,
  type Grid,
} from "./sudoku";

function isValidSolvedGrid(grid: Grid): boolean {
  if (grid.some((v) => v === 0)) return false;
  return getConflicts(grid).size === 0;
}

describe("generateSolvedGrid", () => {
  it("produces a fully valid, complete grid", () => {
    const grid = generateSolvedGrid(makeRng(1));
    expect(isValidSolvedGrid(grid)).toBe(true);
    expect(isComplete(grid)).toBe(true);
  });

  it("produces different grids across seeds", () => {
    const a = generateSolvedGrid(makeRng(1));
    const b = generateSolvedGrid(makeRng(2));
    expect(a).not.toEqual(b);
  });
});

describe("solve", () => {
  it("solves a valid puzzle back to a complete grid", () => {
    const { puzzle, solution } = generatePuzzle("easy", makeRng(42));
    const solved = solve(puzzle);
    expect(solved).not.toBeNull();
    expect(solved).toEqual(solution);
  });
});

describe("generatePuzzle", () => {
  (["easy", "medium", "hard"] as const).forEach((difficulty) => {
    it(`generates a uniquely-solvable ${difficulty} puzzle`, () => {
      const { puzzle } = generatePuzzle(difficulty, makeRng(7));
      expect(countSolutions(puzzle, 2)).toBe(1);
    });

    it(`keeps ${difficulty} clue count within expected bounds`, () => {
      const { puzzle } = generatePuzzle(difficulty, makeRng(7));
      const clues = puzzle.filter((v) => v !== 0).length;
      expect(clues).toBeGreaterThan(17);
      expect(clues).toBeLessThanOrEqual(40);
    });
  });

  it("the puzzle is a strict subset of its own solution", () => {
    const { puzzle, solution } = generatePuzzle("medium", makeRng(99));
    puzzle.forEach((v, i) => {
      if (v !== 0) expect(v).toBe(solution[i]);
    });
  });
});
