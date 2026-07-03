import { motion } from "framer-motion";
import type { CSSProperties } from "react";

interface CellProps {
  index: number;
  value: number;
  isGiven: boolean;
  isSelected: boolean;
  isPeer: boolean;
  isSameValue: boolean;
  isConflict: boolean;
  isGlowing: boolean;
  glowOrder: number;
  glowKey: number;
  notes: number[];
  onClick: (i: number) => void;
}

export function Cell({
  index,
  value,
  isGiven,
  isSelected,
  isPeer,
  isSameValue,
  isConflict,
  isGlowing,
  glowOrder,
  glowKey,
  notes,
  onClick,
}: CellProps) {
  const row = Math.floor(index / 9);
  const col = index % 9;

  const style: CSSProperties = {
    borderRight: col % 3 === 2 && col !== 8 ? "2px solid var(--color-clue)" : undefined,
    borderBottom: row % 3 === 2 && row !== 8 ? "2px solid var(--color-clue)" : undefined,
  };

  let background = "transparent";
  if (isSelected) background = "var(--color-selected-bg)";
  else if (isSameValue) background = "var(--color-same-bg)";
  else if (isPeer) background = "var(--color-peer-bg)";
  if (isConflict) background = "var(--color-conflict-bg)";

  return (
    <button
      className="sudoku-cell"
      style={{ ...style, background }}
      onClick={() => onClick(index)}
      aria-label={`Row ${row + 1} column ${col + 1}`}
    >
      {isGlowing && (
        <motion.div
          key={glowKey}
          className="cell-glow"
          initial={{ opacity: 0.95, scale: 0.5 }}
          animate={{ opacity: 0, scale: 1.7 }}
          transition={{ duration: 0.75, ease: "easeOut", delay: glowOrder * 0.055 }}
        />
      )}
      {value !== 0 ? (
        <motion.span
          key={value}
          className={isGiven ? "cell-given" : "cell-entry"}
          style={{ color: isConflict ? "var(--color-conflict)" : undefined }}
          initial={isGiven ? false : { scale: 0.4, opacity: 0 }}
          animate={
            isGlowing
              ? { scale: [1, 1.28, 1], opacity: 1 }
              : { scale: 1, opacity: 1 }
          }
          transition={
            isGlowing
              ? { duration: 0.5, delay: glowOrder * 0.055, ease: "easeOut" }
              : { type: "spring", stiffness: 500, damping: 20 }
          }
        >
          {value}
        </motion.span>
      ) : notes.length > 0 ? (
        <div className="cell-notes">
          {Array.from({ length: 9 }, (_, n) => n + 1).map((n) => (
            <span key={n} className="cell-note">
              {notes.includes(n) ? n : ""}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
}
