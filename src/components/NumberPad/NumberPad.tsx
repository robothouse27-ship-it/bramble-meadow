import { motion } from "framer-motion";
import { useGameStore } from "../../state/gameStore";
import "./numberpad.css";

export function NumberPad() {
  const enterDigit = useGameStore((s) => s.enterDigit);
  const values = useGameStore((s) => s.values);
  const selected = useGameStore((s) => s.selected);
  const notesMode = useGameStore((s) => s.notesMode);

  if (!values) return null;

  const counts = new Array(10).fill(0);
  values.forEach((v) => {
    if (v !== 0) counts[v]++;
  });

  return (
    <div className="number-pad">
      {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => {
        const remaining = 9 - counts[n];
        const done = remaining <= 0;
        return (
          <motion.button
            key={n}
            className={`number-key ${notesMode ? "notes" : ""} ${done ? "done" : ""}`}
            disabled={done || selected === null}
            whileTap={{ scale: 0.88 }}
            onClick={() => enterDigit(n)}
            aria-label={done ? `${n}, all placed` : `${n}, ${remaining} left`}
          >
            <span className="key-digit">{n}</span>
            <span className="key-remaining">{done ? "✓" : remaining}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
