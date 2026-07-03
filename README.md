# Bramble Meadow 🌿🦔

A cozy, hand-crafted woodland **Sudoku** game — warm, playful, and full of juice.
You solve puzzles alongside **Pip**, a clever little hedgehog who cheers you on
from a sunlit meadow.

Runs 100% on-device, offline, and free — no accounts, no servers, no tracking.

## Features

- 🧩 **Three difficulties** — Sprout (easy), Meadow (medium), Thicket (hard), each
  a unique puzzle with a guaranteed single solution.
- 🦔 **Pip the hedgehog** — reacts to how you're doing across five moods
  (idle, thinking, happy, worried, celebrate) with warm scripted one-liners.
- 🫐 **Three-berry mistakes** — slip up and a berry withers; lose all three and the
  meadow rests (with a gentle retry).
- ✨ **Juicy feedback** — completing a row/column/box ripples a golden glow sweep,
  bursts twinkling sparkles, and rings a chime that climbs a little higher on a
  clean combo streak.
- ✏️ **Pencil notes, undo, erase**, peer/same-number/conflict highlighting, a
  timer, and a wooden-sign win celebration.
- 💾 **Auto-save** — your puzzle resumes right where you left it.

## Run it locally

You'll need [Node.js](https://nodejs.org/) (v20+).

```bash
npm install
npm run dev
```

Then open the printed `localhost` URL. To try it on your phone, run
`npm run dev -- --host` and open the **Network** URL on a device on the same Wi-Fi.

### Build for production

```bash
npm run build     # outputs static files to dist/
npm run preview   # serve the production build locally
```

## Tech

React + TypeScript + Vite, [framer-motion](https://www.framer.com/motion/) for
springs, [zustand](https://github.com/pmndrs/zustand) for state, a small canvas
particle layer, and Web Audio chimes (no audio assets). Art is hand-illustrated
SVG plus painted PNGs.

## Credits

Made with love in the meadow. Character and scene art illustrated for the project;
puzzle engine, UI, and juice built from scratch. 🌼
