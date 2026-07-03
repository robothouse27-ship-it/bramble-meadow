import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactElement } from "react";
import { useGameStore, dayKey } from "../../state/gameStore";
import type { Difficulty } from "../../engine/sudoku";
import { StatsPanel } from "../Stats/StatsPanel";
import poster from "../../assets/scene/poster.png";
import leaf from "../../assets/props/leaf.png";
import "./menu.css";

const DIFFICULTIES: {
  key: Difficulty;
  label: string;
  blurb: string;
  accent: string;
  icon: ReactElement;
}[] = [
  {
    key: "easy",
    label: "Sprout",
    blurb: "A gentle stroll through the meadow.",
    accent: "var(--color-leaf)",
    icon: (
      <svg viewBox="0 0 40 40" width="30" height="30">
        <path
          d="M20 32 V18 M20 18 C10 18 8 8 8 8 C8 8 18 8 20 18 M20 18 C30 18 32 8 32 8 C32 8 22 8 20 18"
          fill="none"
          stroke="var(--color-leaf-dark)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "medium",
    label: "Meadow",
    blurb: "A fair bit of bramble to untangle.",
    accent: "var(--color-honey)",
    icon: (
      <svg viewBox="0 0 40 40" width="30" height="30">
        <g fill="var(--color-honey)">
          <circle cx="20" cy="12" r="6" />
          <circle cx="28" cy="20" r="6" />
          <circle cx="20" cy="28" r="6" />
          <circle cx="12" cy="20" r="6" />
        </g>
        <circle cx="20" cy="20" r="4.5" fill="#fff6dd" />
      </svg>
    ),
  },
  {
    key: "hard",
    label: "Thicket",
    blurb: "Deep in the woods. Bring your wits.",
    accent: "#8a6bb0",
    icon: (
      <svg viewBox="0 0 40 40" width="30" height="30">
        <path
          d="M28 20a10 10 0 1 1-9-10 8 8 0 0 0 9 10z"
          fill="#8a6bb0"
        />
        <circle cx="14" cy="10" r="1.4" fill="#e9d8ff" />
        <circle cx="30" cy="16" r="1" fill="#e9d8ff" />
        <circle cx="10" cy="20" r="1" fill="#e9d8ff" />
      </svg>
    ),
  },
];

function LeafDivider() {
  return (
    <svg className="leaf-divider" viewBox="0 0 160 20" width="140" height="18">
      <path
        d="M4 10 H60"
        stroke="var(--color-leaf-dark)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M100 10 H156"
        stroke="var(--color-leaf-dark)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M80 10 C74 2 66 4 62 10 C66 16 74 18 80 10 C86 18 94 16 98 10 C94 4 86 2 80 10 Z"
        fill="var(--color-leaf)"
        stroke="var(--color-leaf-dark)"
        strokeWidth="1"
      />
    </svg>
  );
}

// the streak "blooms" as it grows: sprout → tulip → blossom → sunflower
function streakFlower(n: number): string {
  if (n >= 30) return "🌻";
  if (n >= 14) return "🌸";
  if (n >= 7) return "🌷";
  if (n >= 3) return "🌼";
  return "🌱";
}

export function Menu() {
  const startGame = useGameStore((s) => s.startGame);
  const startDaily = useGameStore((s) => s.startDaily);
  const status = useGameStore((s) => s.status);
  const resumeGame = useGameStore((s) => s.resumeGame);
  const difficulty = useGameStore((s) => s.difficulty);
  const puzzle = useGameStore((s) => s.puzzle);
  const lastDailyDate = useGameStore((s) => s.lastDailyDate);
  const dailyStreak = useGameStore((s) => s.dailyStreak);
  const [showStats, setShowStats] = useState(false);

  const canResume = puzzle !== null && status === "menu" && difficulty !== null;
  const today = dayKey();
  const yesterday = dayKey(new Date(Date.now() - 86_400_000));
  const dailyDone = lastDailyDate === today;
  // a streak is "alive" only if the last completion was today or yesterday
  const streakAlive = lastDailyDate === today || lastDailyDate === yesterday;
  const streak = streakAlive ? dailyStreak : 0;

  return (
    <div className="menu-screen">
      <motion.div
        className="menu-poster-frame"
        initial={{ y: -10, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
      >
        <img className="menu-poster" src={poster} alt="Pip — Bramble Meadow" draggable={false} />
        <img className="menu-leaf menu-leaf-left" src={leaf} alt="" draggable={false} />
        <img className="menu-leaf menu-leaf-right" src={leaf} alt="" draggable={false} />
      </motion.div>

      <LeafDivider />
      <p className="menu-subtitle">A cozy sudoku, with Pip the hedgehog by your side.</p>

      <motion.button
        className={`menu-daily ${dailyDone ? "done" : ""}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        whileTap={dailyDone ? undefined : { scale: 0.97, y: 2 }}
        whileHover={dailyDone ? undefined : { y: -3 }}
        onClick={() => !dailyDone && startDaily()}
        disabled={dailyDone}
      >
        <span className="menu-daily-icon">{dailyDone ? "🌸" : "☀️"}</span>
        <span className="menu-daily-text">
          <span className="menu-daily-label">Daily Meadow{dailyDone ? " ✓" : ""}</span>
          <span className="menu-daily-blurb">
            {dailyDone
              ? "Bloomed today — back tomorrow!"
              : streak > 0
                ? "Keep your bloom going!"
                : "Today's puzzle for everyone"}
          </span>
        </span>
        {streak > 0 && (
          <span className="menu-daily-streak" title={`${streak}-day bloom`}>
            {streakFlower(streak)} {streak}
          </span>
        )}
      </motion.button>

      {canResume && (
        <motion.button
          className="menu-resume"
          whileTap={{ scale: 0.96, y: 2 }}
          whileHover={{ y: -2 }}
          onClick={resumeGame}
        >
          🌾 Continue your {difficulty} puzzle
        </motion.button>
      )}

      <div className="menu-difficulties">
        {DIFFICULTIES.map((d, i) => (
          <motion.button
            key={d.key}
            className="menu-difficulty-card"
            style={{ ["--accent" as string]: d.accent }}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 220, damping: 20 }}
            whileTap={{ scale: 0.97, y: 2 }}
            whileHover={{ y: -4 }}
            onClick={() => startGame(d.key)}
          >
            <span className="menu-difficulty-icon">{d.icon}</span>
            <span className="menu-difficulty-text">
              <span className="menu-difficulty-label">{d.label}</span>
              <span className="menu-difficulty-blurb">{d.blurb}</span>
            </span>
          </motion.button>
        ))}
      </div>

      <button className="menu-progress" onClick={() => setShowStats(true)}>
        🌿 Your progress
      </button>

      <AnimatePresence>
        {showStats && <StatsPanel onClose={() => setShowStats(false)} />}
      </AnimatePresence>
    </div>
  );
}
