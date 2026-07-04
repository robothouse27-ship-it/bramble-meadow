import { motion } from "framer-motion";
import { useGameStore } from "../../state/gameStore";
import "./numberpad.css";

export function NumberPad() {
  const enterDigit = useGameStore((s) => s.enterDigit);
  const values = useGameStore((s) => s.values);
  const selected = useGameStore((s) => s.selected);
  const notesMode = useGameStore((s) => s.notesMode);
  const numberFirst = useGameStore((s) => s.numberFirst);
  const activeDigit = useGameStore((s) => s.activeDigit);
  const setActiveDigit = useGameStore((s) => s.setActiveDigit);

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
        const armed = numberFirst && activeDigit === n;
        // in number-first mode you arm a digit with no cell selected;
        // in classic mode you need a selected cell to place into
        const disabled = done || (!numberFirst && selected === null);
        return (
          <motion.button
            key={n}
            className={`number-key ${notesMode ? "notes" : ""} ${done ? "done" : ""} ${armed ? "armed" : ""}`}
            disabled={disabled}
            whileTap={{ scale: 0.88 }}
            onClick={() =>
              numberFirst ? setActiveDigit(activeDigit === n ? null : n) : enterDigit(n)
            }
            aria-pressed={armed}
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
