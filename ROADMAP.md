# Bramble Meadow — a cozy woodland Sudoku 🌿 (simple first build)

## Context

Benji wants a "simple but beautiful" Sudoku app: warm, playful, woodland-creature
themed, with juicy dopamine feedback (glows when cells/lines complete), a
**3-mistakes** limit, and a **clever, cute helper buddy** — a hedgehog named *Pip*.
Long-term goal is Google Play, but the first build stays **small and shippable**.

Locked decisions:
- **World:** sunlit *Meadow & Burrows* — **original IP** (no *Magic: The
  Gathering* / *Bloomburrow* art or names; that's Hasbro's and would get the app
  pulled). Working title *Bramble Meadow*.
- **Buddy:** clever, cute **hedgehog "Pip"** — scripted (no AI for now), reacts to
  what you do with pre-written lines.
- **Stack:** React + Vite + TypeScript. Runs 100% on-device, offline, $0 to run.
- **Art:** hand-crafted SVG + framer-motion springs + a small canvas particle
  layer. Pip is a state-driven component so he can be upgraded to Rive later.

**Kept simple:** the first build is one polished, fully-playable game. Streak,
collection unlocks, and the Capacitor/Play-Store packaging are **deferred to a
later phase** (noted at the bottom).

## What we build (first version)

### 1. Sudoku engine — `src/engine/sudoku.ts` (+ Vitest test)
- `generateSolvedGrid()` — randomized backtracking fill of a valid grid.
- `countSolutions(grid, cap=2)` — ensures a **unique** solution when removing cells.
- `generatePuzzle(difficulty)` — dig cells from a solved grid, keeping uniqueness.
- Helpers: `getConflicts`, `isComplete`, peer/row/col/box lookups.
- 3 difficulties by clue count: **Easy / Medium / Hard**.
- Test file checks: valid grids, unique solutions, clue counts, solver correctness.

### 2. Playable board — `src/components/`
- `Board` (grid + cells), `NumberPad` (tap to enter; keyboard too).
- **Notes/pencil** mode, **undo**, **erase**.
- Peer highlight (row/col/box), same-number highlight, conflict highlight.
- **3 mistakes** shown as berries; wrong entry loses a berry + Pip reacts;
  0 berries → gentle "the meadow rests" game-over + retry.
- Timer at top.
- State via **zustand** (`gameStore`), saved to localStorage so a puzzle resumes.

### 3. The juice (the fun part)
- **Warm glow sweep** when a row/column/box completes: golden light + soft chime
  (Web Audio, no assets) + spring "settle" on placed numbers.
- Ambient drifting pollen/firefly particles (canvas) + a **petal burst** on solve.
- A cheerful **win celebration** (Pip cheers, confetti/petals).
- Paper-grain + soft shadows + warm meadow palette (CSS design tokens).

### 4. Pip the hedgehog — `src/components/Buddy/`
- SVG hedgehog driven by one state enum:
  `idle | thinking | happy | worried | celebrate`.
- framer-motion for idle breathing + pose changes. Curls up when you're stuck,
  unfurls to cheer. Cute, clever scripted one-liners tied to game events.
- The enum is the seam for a future Rive upgrade.

### 5. Menu & flow — `src/components/Menu/`
- Start screen (title + Pip), difficulty pick, new game, resume.

## File structure
```
Sudoku/
  index.html, package.json, vite.config.ts, tsconfig.json
  src/
    main.tsx, App.tsx
    styles/       tokens.css, global.css
    engine/       sudoku.ts, sudoku.test.ts
    state/        gameStore.ts (zustand + persist)
    components/    Board/ NumberPad/ Controls/ Buddy/ Hud/ Celebration/ Menu/
    audio/        sound.ts (Web Audio chimes)
    particles/    particles.ts (canvas)
    assets/buddy/ hedgehog SVGs
```

Dependencies: `react`, `vite`, `typescript`, `framer-motion`, `zustand`, `vitest`.

## Build order
1. Scaffold Vite + React + TS, install deps, tokens/global CSS, app shell.
2. Engine + Vitest tests (green before UI).
3. Playable board: grid, number pad, notes, undo/erase, conflicts, 3 berries, timer.
4. The juice: glow sweeps, particles, chimes, springs, win celebration.
5. Pip: SVG + state machine wired to game events; scripted lines.
6. Menu/flow + localStorage resume. Polish pass.

## Verification
- **Engine:** `npm run test` — solved grids valid, puzzles have exactly one
  solution, clue counts match difficulty, solver solves known puzzles.
- **App:** `preview_start` the dev server and play through: enter numbers → peer
  highlight + glow sweep on completing a box/line; wrong number → lose a berry +
  Pip worried; exhaust berries → game over; notes + undo work; finish a puzzle →
  celebration; reload → puzzle resumes. Capture screenshots of menu, mid-game,
  a glow moment, and the win.

## Later (not in this build)
- Daily puzzle + "meadow bloom" **streak** and stats.
- **Collection** — unlock woodland friends at milestones.
- **Capacitor** wrap for **Google Play** (haptics + streak notifications, icons,
  signing). Needs Benji's Google Play developer account (~$25) and submission.
- Optional Rive buddy upgrade. (No AI in this project — Pip stays scripted.)

---

## Status log

**Build complete (v1):** engine (10/10 tests passing), full playable board with
notes/undo/3-berry mistakes/timer, glow-sweep + particle + chime juice, Pip with
5 mood states, menu with difficulty picker + resume. Verified via network-exposed
dev server on a phone.

**Aesthetic pass #1:** illustrated background scene (hills/sun/clouds), wooden
sign-style title, icon-badged difficulty cards, wood-frame board with leaf
corners, tactile "pressable" buttons, pill-style HUD, cloud-shaped speech bubble
for Pip.

**Aesthetic pass #2 — illustrated art integrated (2026-07-03):** Benji generated
concept art via ChatGPT and handed off 9 PNGs. Integrated:
- **Pip** now uses real illustrated art — the 5-mood sheet was sliced into
  `src/assets/buddy/pip-{idle,thinking,happy,worried,celebrate}.png` (cream
  background flood-keyed to transparent), swapped into `Pip.tsx` behind the same
  `mood`/`size` API, keeping all framer-motion animation. Shows in menu + buddy panel.
- **Background** is now the illustrated meadow (`src/assets/scene/meadow.png`),
  full-bleed cover anchored bottom with a cream sky-fade; replaced the old CSS
  sun/clouds/hills `Scene`.
- Legibility fixes the busy background forced: cream pill behind the menu subtitle;
  solid cream tray + higher disabled opacity on the number pad.
- **Mistake counter** now uses a real berry: a single berry was extracted from the
  3-berry cluster via a circular color mask → `src/assets/props/berry.png`, wired
  into `Hud.tsx` (lost berries go grayscale). Replaced the 🍒 emoji.
- **Menu** now leads with the illustrated title **poster** (`assets/scene/poster.png`)
  in a cream frame with **leaf** corner accents; retired the drawn Pip + CSS wooden
  sign (the poster carries both Pip and the title).
- **Win/lose celebration** now uses the **wooden sign** as a title banner (cropped to
  the plank board → `assets/props/sign-board.png`, text overlaid) and **sparkles**
  twinkling around the card on wins.
- Cleanup: deleted the leftover `src/App 2.tsx` Vite starter template. Source PNGs
  archived in `art-source/` (turnaround + model sheet kept there for reference).
- All art assets are now wired in. tsc + oxlint clean.

**Juice pass #2 — moment-to-moment feel (2026-07-03):**
- **Glow sweep:** completing a row/col/box now ripples a golden glow cell-by-cell
  (staggered by position) with the numbers popping as the wave passes, instead of
  all cells flashing at once (`Cell.tsx` `glowOrder`, warmer `.cell-glow`).
- **Sparkle burst:** the canvas burst particles are now twinkling 4-point sparkles
  (rotation + shimmer, additive blend) in gold tones; wins throw a much bigger
  burst (`particles.ts` `drawSparkle`, `ParticleField` `burstCount`).
- **Sound:** warmer chimes (sine + triangle octave shimmer), longer/higher win
  arpeggio, and a soft "plip" (`playPlace`) on every correct placement — which was
  previously silent unless a line completed.
- **Haptics:** new `audio/haptics.ts` — light tap on placement, success/error/win
  patterns wired through the store (Android; no-op on iOS Safari).

**Polish pass — feedback & personality (2026-07-03, all scripted, no deps):**
- **Combo flair:** `gameStore` tracks a `combo` counter (consecutive clean
  line/box completions, reset on a mistake). It escalates the sparkle burst
  (`GameScreen` `burstCount`) and shifts the completion chime up by semitones
  (`playChime(level, combo)`), so a clean streak climbs a little scale.
- **Chattier Pip:** bigger scripted line pools (encourage/worried/happy) plus a
  new combo-aware pool ("Two in a row — you're blooming!") used at combo ≥ 2.
- **Number pad remaining counters:** each key shows how many of that digit are
  left; a fully-placed digit dims to a calm green "✓" done state (`NumberPad.tsx`
  + `.number-key.done`).
- Verified in-headless: remaining counters render cleanly; app + lint green.

**Open thread — richer character art:** no image-generation tool is connected in
this workspace, so painted/illustrated art isn't something Claude can produce
directly. Plan: Benji generates concept art via his ChatGPT account, hands off
image files, Claude integrates them. Rive (the Duolingo-style interactive
character tool) remains a separate, later upgrade — it needs hand-authoring in
Rive's own editor (rive.app), not a text prompt. Pip's mood-state architecture
(`idle | thinking | happy | worried | celebrate`) is already built as the seam
for that swap whenever it happens.
