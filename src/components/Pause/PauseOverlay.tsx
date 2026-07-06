import { motion } from "framer-motion";
import { useGameStore } from "../../state/gameStore";
import { Buddy } from "../Buddy/Buddy";
import { BUDDY_META } from "../Buddy/buddyArt";
import "./pause.css";

export function PauseOverlay() {
  const paused = useGameStore((s) => s.paused);
  const status = useGameStore((s) => s.status);
  const isDaily = useGameStore((s) => s.isDaily);
  const resumeFromPause = useGameStore((s) => s.resumeFromPause);
  const restartPuzzle = useGameStore((s) => s.restartPuzzle);
  const newPuzzle = useGameStore((s) => s.newPuzzle);
  const backToMenu = useGameStore((s) => s.backToMenu);
  const buddyName = useGameStore((s) => BUDDY_META[s.buddy].name);

  if (!paused || status !== "playing") return null;

  return (
    <motion.div
      className="pause-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="pause-card"
        initial={{ scale: 0.8, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Buddy mood="idle" size={96} />
        <h2 className="pause-title">Meadow paused</h2>
        <p className="pause-sub">{buddyName} will wait right here. 🌿</p>
        <div className="pause-actions">
          <button className="pause-btn primary" onClick={resumeFromPause}>
            Resume
          </button>
          <button className="pause-btn" onClick={backToMenu}>
            Menu
          </button>
        </div>
        <div className="pause-actions pause-actions-sub">
          <button className="pause-btn small" onClick={restartPuzzle}>
            ↺ Restart
          </button>
          <button className="pause-btn small" onClick={newPuzzle}>
            {isDaily ? "↺ Reset daily" : "🌱 New puzzle"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
