import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "../../state/gameStore";
import { Buddy } from "./Buddy";
import { BUDDY_META } from "./buddyArt";
import "./buddy.css";

export function BuddyPanel() {
  const mood = useGameStore((s) => s.buddyMood);
  const line = useGameStore((s) => s.buddyLine);
  const pokePip = useGameStore((s) => s.pokePip);
  const name = useGameStore((s) => BUDDY_META[s.buddy].name);

  return (
    <div className="buddy-panel">
      <motion.button
        type="button"
        className="buddy-pip-btn"
        onClick={pokePip}
        whileTap={{ scale: 0.9, rotate: -6 }}
        aria-label={`Pet ${name}`}
      >
        <Buddy mood={mood} size={88} />
      </motion.button>
      <AnimatePresence mode="wait">
        <motion.div
          key={line}
          className="buddy-bubble"
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.95 }}
          transition={{ duration: 0.25 }}
        >
          <span className="bubble-dot bubble-dot-1" />
          <span className="bubble-dot bubble-dot-2" />
          {line}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
