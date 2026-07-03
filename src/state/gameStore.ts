import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  generatePuzzle,
  getConflicts,
  isComplete,
  type Cell,
  type Difficulty,
  type Grid,
} from "../engine/sudoku";
import { playChime, playMistake, playPlace } from "../audio/sound";
import { hapticError, hapticSuccess, hapticTap, hapticWin } from "../audio/haptics";

export type BuddyMood = "idle" | "thinking" | "happy" | "worried" | "celebrate";

export type CompletionEvent = {
  id: number;
  kind: "row" | "col" | "box";
  cells: number[];
};

const MAX_MISTAKES = 3;

type HistoryEntry = {
  values: Grid;
  notes: number[][];
};

interface GameState {
  difficulty: Difficulty | null;
  puzzle: Grid | null;
  solution: Grid | null;
  values: Grid | null;
  notes: number[][] | null; // for each cell, array of pencilled digits
  givenMask: boolean[] | null; // true = pre-filled clue, not editable

  selected: number | null;
  notesMode: boolean;
  mistakes: number;
  status: "menu" | "playing" | "won" | "lost";
  startedAt: number | null;
  elapsedMs: number;

  buddyMood: BuddyMood;
  buddyLine: string;
  combo: number; // consecutive clean line/box completions
  lastCompletion: CompletionEvent | null;

  history: HistoryEntry[];

  startGame: (difficulty: Difficulty) => void;
  resumeGame: () => void;
  selectCell: (i: number) => void;
  enterDigit: (digit: number) => void;
  eraseCell: () => void;
  toggleNotesMode: () => void;
  undo: () => void;
  tick: () => void;
  setBuddy: (mood: BuddyMood, line?: string) => void;
  backToMenu: () => void;
}

function emptyNotes(): number[][] {
  return Array.from({ length: 81 }, () => []);
}

function linesForCell(i: number): { row: number[]; col: number[]; box: number[] } {
  const r = Math.floor(i / 9);
  const c = i % 9;
  const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
  const row: number[] = [];
  const col: number[] = [];
  const box: number[] = [];
  for (let k = 0; k < 9; k++) {
    row.push(r * 9 + k);
    col.push(k * 9 + c);
  }
  const br = Math.floor(b / 3) * 3;
  const bc = (b % 3) * 3;
  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      box.push((br + dr) * 9 + (bc + dc));
    }
  }
  return { row, col, box };
}

const ENCOURAGE_LINES = [
  "You've got this!",
  "Ooh, nicely spotted.",
  "The meadow believes in you.",
  "Steady does it.",
  "That's the spirit!",
  "Take your time, friend.",
  "One little clue at a time.",
  "The brambles are untangling.",
];

const WORRIED_LINES = [
  "Hmm, that doesn't quite fit.",
  "Not this burrow, try another.",
  "Oops! Let's look again.",
  "A little tumble — no harm done.",
  "Careful, that berry's not ripe yet.",
  "Close! Give it another peek.",
];

const HAPPY_LINES = [
  "Yes! Right where it belongs.",
  "Lovely.",
  "That's a good fit.",
  "Snug as a bug in its burrow.",
  "Ooh, tidy!",
  "The meadow hums happily.",
  "Just so.",
];

const COMBO_LINES = [
  "Two in a row — you're blooming!",
  "On a roll now!",
  "The meadow's positively glowing!",
  "Unstoppable little sprout!",
  "Petals everywhere — keep going!",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      difficulty: null,
      puzzle: null,
      solution: null,
      values: null,
      notes: null,
      givenMask: null,

      selected: null,
      notesMode: false,
      mistakes: 0,
      status: "menu",
      startedAt: null,
      elapsedMs: 0,

      buddyMood: "idle",
      buddyLine: "Ready when you are.",
      combo: 0,
      lastCompletion: null,

      history: [],

      startGame: (difficulty) => {
        const { puzzle, solution } = generatePuzzle(difficulty);
        set({
          difficulty,
          puzzle,
          solution,
          values: puzzle.slice(),
          notes: emptyNotes(),
          givenMask: puzzle.map((v) => v !== 0),
          selected: null,
          notesMode: false,
          mistakes: 0,
          status: "playing",
          startedAt: Date.now(),
          elapsedMs: 0,
          buddyMood: "idle",
          buddyLine: "A fresh puzzle! Let's begin.",
          combo: 0,
          lastCompletion: null,
          history: [],
        });
      },

      resumeGame: () => {
        const s = get();
        if (s.puzzle && s.values) {
          set({ status: "playing", startedAt: Date.now() - s.elapsedMs });
        }
      },

      backToMenu: () => set({ status: "menu" }),

      selectCell: (i) => set({ selected: i }),

      toggleNotesMode: () => set((s) => ({ notesMode: !s.notesMode })),

      undo: () => {
        const s = get();
        if (s.history.length === 0) return;
        const prev = s.history[s.history.length - 1];
        set({
          values: prev.values,
          notes: prev.notes,
          history: s.history.slice(0, -1),
        });
      },

      eraseCell: () => {
        const s = get();
        if (s.selected === null || !s.values || !s.givenMask) return;
        if (s.givenMask[s.selected]) return;
        const values = s.values.slice() as Grid;
        const notes = s.notes!.map((n) => n.slice());
        s.history.push({ values: s.values.slice(), notes: s.notes!.map((n) => n.slice()) });
        values[s.selected] = 0;
        notes[s.selected] = [];
        set({ values, notes, history: s.history.slice(-20) });
      },

      enterDigit: (digit) => {
        const s = get();
        if (
          s.selected === null ||
          !s.values ||
          !s.solution ||
          !s.givenMask ||
          s.status !== "playing"
        )
          return;
        const i = s.selected;
        if (s.givenMask[i]) return;

        const historyEntry = {
          values: s.values.slice(),
          notes: s.notes!.map((n) => n.slice()),
        };

        if (s.notesMode) {
          const notes = s.notes!.map((n) => n.slice());
          const cellNotes = notes[i];
          const at = cellNotes.indexOf(digit);
          if (at >= 0) cellNotes.splice(at, 1);
          else cellNotes.push(digit);
          set({ notes, history: [...s.history, historyEntry].slice(-20) });
          return;
        }

        const values = s.values.slice() as Grid;
        const notes = s.notes!.map((n) => n.slice());
        values[i] = digit as Cell;
        notes[i] = [];

        const correct = s.solution[i] === digit;

        if (!correct) {
          playMistake();
          hapticError();
          const mistakes = s.mistakes + 1;
          const lost = mistakes >= MAX_MISTAKES;
          set({
            values,
            notes,
            mistakes,
            status: lost ? "lost" : "playing",
            buddyMood: lost ? "worried" : "worried",
            buddyLine: lost ? "The meadow rests a while. Try again?" : pick(WORRIED_LINES),
            combo: 0,
            history: [...s.history, historyEntry].slice(-20),
          });
          return;
        }

        // clear conflicts check just for safety/highlighting elsewhere
        const conflicts = getConflicts(values);
        void conflicts;

        // check row/col/box completion for the glow effect
        const { row, col, box } = linesForCell(i);
        const completedKind = ([
          ["row", row],
          ["col", col],
          ["box", box],
        ] as const).find(([, cells]) => cells.every((c) => values[c] !== 0 && values[c] === s.solution![c]));

        const won = isComplete(values);
        const newCombo = completedKind ? s.combo + 1 : s.combo;

        if (won) {
          playChime("win");
          hapticWin();
        } else if (completedKind) {
          playChime("line", newCombo);
          hapticSuccess();
        } else {
          playPlace();
          hapticTap();
        }

        const buddyLine = won
          ? "You did it! What a beautiful meadow."
          : completedKind && newCombo >= 2
            ? pick(COMBO_LINES)
            : pick(HAPPY_LINES);

        set({
          values,
          notes,
          buddyMood: won ? "celebrate" : "happy",
          buddyLine,
          status: won ? "won" : "playing",
          combo: newCombo,
          lastCompletion: completedKind
            ? { id: Date.now(), kind: completedKind[0], cells: completedKind[1] }
            : s.lastCompletion,
          history: [...s.history, historyEntry].slice(-20),
        });
      },

      tick: () => {
        const s = get();
        if (s.status !== "playing" || s.startedAt === null) return;
        set({ elapsedMs: Date.now() - s.startedAt });
      },

      setBuddy: (mood, line) => set({ buddyMood: mood, ...(line ? { buddyLine: line } : {}) }),
    }),
    {
      name: "bramble-meadow-save",
      partialize: (s) => ({
        difficulty: s.difficulty,
        puzzle: s.puzzle,
        solution: s.solution,
        values: s.values,
        notes: s.notes,
        givenMask: s.givenMask,
        mistakes: s.mistakes,
        status: s.status,
        elapsedMs: s.elapsedMs,
      }),
    }
  )
);

export const MAX_MISTAKES_EXPORT = MAX_MISTAKES;
export { ENCOURAGE_LINES };
