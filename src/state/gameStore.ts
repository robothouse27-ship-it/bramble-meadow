import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  generatePuzzle,
  getConflicts,
  isComplete,
  makeRng,
  type Cell,
  type Difficulty,
  type Grid,
} from "../engine/sudoku";
import { playChime, playMistake, playPlace, setSoundEnabled } from "../audio/sound";
import {
  hapticError,
  hapticSuccess,
  hapticTap,
  hapticWin,
  setHapticsEnabled,
} from "../audio/haptics";

export type BuddyMood = "idle" | "thinking" | "happy" | "worried" | "celebrate";

// Selectable companion characters. "pip" is the original hedgehog; the others
// are alternate woodland buddies sharing the same 5-mood art set.
export type BuddyId = "pip" | "clover" | "nutmeg" | "fox" | "owl";

export type CompletionEvent = {
  id: number;
  kind: "row" | "col" | "box";
  cells: number[];
};

const MAX_MISTAKES = 3;
const MAX_HINTS = 3;

type HistoryEntry = {
  values: Grid;
  notes: number[][];
};

export interface Stats {
  played: number; // games finished (won or lost)
  won: number;
  flawless: number; // wins with zero mistakes
  best: { easy: number | null; medium: number | null; hard: number | null }; // best time ms
}

function emptyStats(): Stats {
  return { played: 0, won: 0, flawless: 0, best: { easy: null, medium: null, hard: null } };
}

function recordOutcome(
  stats: Stats,
  outcome: {
    win: boolean;
    difficulty: Difficulty | null;
    mistakes: number;
    hints: number;
    ms: number;
  },
): Stats {
  const best = { ...stats.best };
  // best time only counts an honest solve (no hints)
  if (outcome.win && outcome.difficulty && outcome.hints === 0) {
    const cur = best[outcome.difficulty];
    if (cur === null || outcome.ms < cur) best[outcome.difficulty] = outcome.ms;
  }
  const flawless = outcome.win && outcome.mistakes === 0 && outcome.hints === 0;
  return {
    played: stats.played + 1,
    won: stats.won + (outcome.win ? 1 : 0),
    flawless: stats.flawless + (flawless ? 1 : 0),
    best,
  };
}

interface GameState {
  difficulty: Difficulty | null;
  puzzle: Grid | null;
  solution: Grid | null;
  values: Grid | null;
  notes: number[][] | null; // for each cell, array of pencilled digits
  givenMask: boolean[] | null; // true = pre-filled clue, not editable

  selected: number | null;
  activeDigit: number | null; // number-first input: the digit armed for placing
  notesMode: boolean;
  mistakes: number;
  status: "menu" | "playing" | "won" | "lost";
  paused: boolean;
  startedAt: number | null;
  elapsedMs: number;

  hintsLeft: number;
  hintsUsed: number;

  buddyMood: BuddyMood;
  buddyLine: string;
  buddy: BuddyId; // which companion character is shown
  combo: number; // consecutive clean line/box completions
  lastCompletion: CompletionEvent | null;

  ambientOn: boolean; // ambient meadow soundscape preference
  soundOn: boolean; // chimes / place / mistake sound effects
  hapticsOn: boolean; // vibration feedback
  highlightPeers: boolean; // row/col/box + same-number highlighting
  autoCleanNotes: boolean; // placing a digit clears it from peer pencil notes
  numberFirst: boolean; // tap a number, then tap cells to place it
  zenMode: boolean; // no 3-berry fail; cozy solving

  stats: Stats;

  isDaily: boolean; // current game is today's Daily Meadow
  lastDailyDate: string | null; // YYYY-MM-DD of last completed daily
  dailyStreak: number;
  bestStreak: number;

  history: HistoryEntry[];

  startGame: (difficulty: Difficulty) => void;
  startDaily: () => void;
  resumeGame: () => void;
  selectCell: (i: number) => void;
  setActiveDigit: (digit: number | null) => void;
  enterDigit: (digit: number) => void;
  eraseCell: () => void;
  toggleNotesMode: () => void;
  undo: () => void;
  useHint: () => void;
  tick: () => void;
  setBuddy: (mood: BuddyMood, line?: string) => void;
  setBuddyId: (id: BuddyId) => void;
  idleNudge: () => void;
  pokePip: () => void;
  pauseGame: () => void;
  resumeFromPause: () => void;
  restartPuzzle: () => void;
  newPuzzle: () => void;
  toggleAmbient: () => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleHighlight: () => void;
  toggleAutoCleanNotes: () => void;
  toggleNumberFirst: () => void;
  toggleZen: () => void;
  backToMenu: () => void;
}

function emptyNotes(): number[][] {
  return Array.from({ length: 81 }, () => []);
}

/** Local calendar day as YYYY-MM-DD (used to seed and track the daily puzzle). */
export function dayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function seedFromKey(key: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const DAILY_DIFFICULTY: Difficulty = "medium";

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

const IDLE_LINES = [
  "Take your time — the meadow's patient.",
  "Stuck? Try the emptiest burrow first.",
  "Hmm… where could that little one fit?",
  "A deep breath of meadow air always helps.",
  "No rush. The brambles aren't going anywhere.",
];

const ALMOST_LINES = [
  "So close — the meadow's nearly in bloom!",
  "Just a petal or two to go!",
  "Almost there, little gardener!",
  "The last few burrows are waiting!",
];

const HINT_LINES = [
  "Here — this little one belongs here. 🌱",
  "Psst… try this burrow.",
  "A gentle nudge from Pip.",
  "That berry goes right there.",
  "Let me help with that one, friend.",
];

const PIP_TAP_LINES = [
  "Hee! That tickles.",
  "Oh! Hello there.",
  "Boop! 🌼",
  "Careful of my quills!",
  "*happy little squeak*",
  "You found me!",
  "Aww, hi friend.",
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
      activeDigit: null,
      notesMode: false,
      mistakes: 0,
      status: "menu",
      paused: false,
      startedAt: null,
      elapsedMs: 0,

      hintsLeft: MAX_HINTS,
      hintsUsed: 0,

      buddyMood: "idle",
      buddyLine: "Ready when you are.",
      buddy: "pip",
      combo: 0,
      lastCompletion: null,

      ambientOn: true,
      soundOn: true,
      hapticsOn: true,
      highlightPeers: true,
      autoCleanNotes: true,
      numberFirst: false,
      zenMode: false,

      stats: emptyStats(),

      isDaily: false,
      lastDailyDate: null,
      dailyStreak: 0,
      bestStreak: 0,

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
          activeDigit: null,
          notesMode: false,
          mistakes: 0,
          status: "playing",
          paused: false,
          startedAt: Date.now(),
          elapsedMs: 0,
          hintsLeft: MAX_HINTS,
          hintsUsed: 0,
          buddyMood: "idle",
          buddyLine: "A fresh puzzle! Let's begin.",
          combo: 0,
          lastCompletion: null,
          history: [],
          isDaily: false,
        });
      },

      startDaily: () => {
        const seed = seedFromKey("daily-" + dayKey());
        const { puzzle, solution } = generatePuzzle(DAILY_DIFFICULTY, makeRng(seed));
        set({
          difficulty: DAILY_DIFFICULTY,
          puzzle,
          solution,
          values: puzzle.slice(),
          notes: emptyNotes(),
          givenMask: puzzle.map((v) => v !== 0),
          selected: null,
          activeDigit: null,
          notesMode: false,
          mistakes: 0,
          status: "playing",
          paused: false,
          startedAt: Date.now(),
          elapsedMs: 0,
          hintsLeft: MAX_HINTS,
          hintsUsed: 0,
          buddyMood: "idle",
          buddyLine: "Today's meadow awaits! 🌼",
          combo: 0,
          lastCompletion: null,
          history: [],
          isDaily: true,
        });
      },

      resumeGame: () => {
        const s = get();
        if (s.puzzle && s.values) {
          set({ status: "playing", paused: false, startedAt: Date.now() - s.elapsedMs });
        }
      },

      backToMenu: () => set({ status: "menu" }),

      selectCell: (i) => set({ selected: i }),

      setActiveDigit: (digit) => set({ activeDigit: digit }),

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
        if (s.paused || s.selected === null || !s.values || !s.givenMask) return;
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
          s.status !== "playing" ||
          s.paused
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
        const finalMs = Date.now() - (s.startedAt ?? Date.now());

        if (!correct) {
          playMistake();
          hapticError();
          const mistakes = s.mistakes + 1;
          const lost = !s.zenMode && mistakes >= MAX_MISTAKES;
          set({
            values,
            notes,
            mistakes,
            status: lost ? "lost" : "playing",
            buddyMood: lost ? "worried" : "worried",
            buddyLine: lost ? "The meadow rests a while. Try again?" : pick(WORRIED_LINES),
            combo: 0,
            history: [...s.history, historyEntry].slice(-20),
            ...(lost
              ? { stats: recordOutcome(s.stats, { win: false, difficulty: s.difficulty, mistakes, hints: s.hintsUsed, ms: finalMs }) }
              : {}),
          });
          return;
        }

        // auto-clean pencil notes: remove the placed digit from peers' notes
        if (s.autoCleanNotes) {
          const peers = linesForCell(i);
          for (const p of [...peers.row, ...peers.col, ...peers.box]) {
            const at = notes[p].indexOf(digit);
            if (at >= 0) notes[p].splice(at, 1);
          }
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

        const emptyLeft = values.filter((v) => v === 0).length;
        const buddyLine = won
          ? s.isDaily
            ? "Today's meadow bloomed! 🌸 See you tomorrow."
            : "You did it! What a beautiful meadow."
          : emptyLeft > 0 && emptyLeft <= 5
            ? pick(ALMOST_LINES)
            : completedKind && newCombo >= 2
              ? pick(COMBO_LINES)
              : pick(HAPPY_LINES);

        // Daily Meadow completion → advance the meadow-bloom streak (once per day)
        const today = dayKey();
        const dailyPatch =
          won && s.isDaily && s.lastDailyDate !== today
            ? (() => {
                const yesterday = dayKey(new Date(Date.now() - 86400000));
                const newStreak = s.lastDailyDate === yesterday ? s.dailyStreak + 1 : 1;
                return {
                  lastDailyDate: today,
                  dailyStreak: newStreak,
                  bestStreak: Math.max(s.bestStreak, newStreak),
                };
              })()
            : {};

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
          ...(won
            ? { stats: recordOutcome(s.stats, { win: true, difficulty: s.difficulty, mistakes: s.mistakes, hints: s.hintsUsed, ms: finalMs }) }
            : {}),
          ...dailyPatch,
        });
      },

      tick: () => {
        const s = get();
        if (s.status !== "playing" || s.paused || s.startedAt === null) return;
        set({ elapsedMs: Date.now() - s.startedAt });
      },

      useHint: () => {
        const s = get();
        if (s.status !== "playing" || s.paused) return;
        if (!s.values || !s.solution || !s.givenMask || s.hintsLeft <= 0) return;

        // reveal the selected empty cell, else the first empty non-clue cell
        let i = s.selected;
        if (i === null || s.givenMask[i] || s.values[i] !== 0) {
          i = s.values.findIndex((v, idx) => v === 0 && !s.givenMask![idx]);
        }
        if (i === null || i < 0) return;

        const digit = s.solution[i];
        set({ selected: i, hintsLeft: s.hintsLeft - 1, hintsUsed: s.hintsUsed + 1 });
        // reuse the normal placement path (glow, chime, win/streak handling)
        get().enterDigit(digit);
        if (get().status === "playing") {
          set({ buddyMood: "happy", buddyLine: pick(HINT_LINES) });
        }
      },

      setBuddy: (mood, line) => set({ buddyMood: mood, ...(line ? { buddyLine: line } : {}) }),
      setBuddyId: (id) => set({ buddy: id }),

      idleNudge: () => {
        const s = get();
        if (s.status !== "playing") return;
        set({ buddyMood: "thinking", buddyLine: pick(IDLE_LINES) });
      },

      pokePip: () => {
        const s = get();
        if (s.status !== "playing") return;
        set({ buddyMood: "happy", buddyLine: pick(PIP_TAP_LINES) });
      },

      pauseGame: () => {
        const s = get();
        if (s.status !== "playing" || s.paused) return;
        // freeze the clock at the exact moment of pausing
        set({
          paused: true,
          elapsedMs: s.startedAt !== null ? Date.now() - s.startedAt : s.elapsedMs,
        });
      },

      resumeFromPause: () => {
        const s = get();
        if (!s.paused) return;
        set({ paused: false, startedAt: Date.now() - s.elapsedMs });
      },

      // replay the same puzzle from scratch
      restartPuzzle: () => {
        const s = get();
        if (!s.puzzle) return;
        set({
          values: s.puzzle.slice() as Grid,
          notes: emptyNotes(),
          givenMask: s.puzzle.map((v) => v !== 0),
          selected: null,
          activeDigit: null,
          notesMode: false,
          mistakes: 0,
          status: "playing",
          paused: false,
          startedAt: Date.now(),
          elapsedMs: 0,
          hintsLeft: MAX_HINTS,
          hintsUsed: 0,
          combo: 0,
          lastCompletion: null,
          history: [],
          buddyMood: "idle",
          buddyLine: "A fresh start — you've got this.",
        });
      },

      // fresh puzzle at the current difficulty (dailies just restart)
      newPuzzle: () => {
        const s = get();
        if (s.isDaily) {
          get().restartPuzzle();
        } else if (s.difficulty) {
          get().startGame(s.difficulty);
        }
      },

      toggleAmbient: () => set((s) => ({ ambientOn: !s.ambientOn })),
      toggleSound: () =>
        set((s) => {
          setSoundEnabled(!s.soundOn);
          return { soundOn: !s.soundOn };
        }),
      toggleHaptics: () =>
        set((s) => {
          setHapticsEnabled(!s.hapticsOn);
          return { hapticsOn: !s.hapticsOn };
        }),
      toggleHighlight: () => set((s) => ({ highlightPeers: !s.highlightPeers })),
      toggleAutoCleanNotes: () => set((s) => ({ autoCleanNotes: !s.autoCleanNotes })),
      toggleNumberFirst: () =>
        set((s) => ({ numberFirst: !s.numberFirst, activeDigit: null })),
      toggleZen: () => set((s) => ({ zenMode: !s.zenMode })),
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
        paused: s.paused,
        elapsedMs: s.elapsedMs,
        hintsLeft: s.hintsLeft,
        hintsUsed: s.hintsUsed,
        ambientOn: s.ambientOn,
        soundOn: s.soundOn,
        hapticsOn: s.hapticsOn,
        highlightPeers: s.highlightPeers,
        autoCleanNotes: s.autoCleanNotes,
        numberFirst: s.numberFirst,
        zenMode: s.zenMode,
        stats: s.stats,
        isDaily: s.isDaily,
        lastDailyDate: s.lastDailyDate,
        dailyStreak: s.dailyStreak,
        bestStreak: s.bestStreak,
        buddy: s.buddy,
      }),
    }
  )
);

export const MAX_MISTAKES_EXPORT = MAX_MISTAKES;
export { ENCOURAGE_LINES };
