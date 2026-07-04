import { useMemo } from "react";
import { useGameStore } from "../../state/gameStore";
import { getConflicts } from "../../engine/sudoku";
import { Cell } from "./Cell";
import "./board.css";

export function Board() {
  const values = useGameStore((s) => s.values);
  const givenMask = useGameStore((s) => s.givenMask);
  const notes = useGameStore((s) => s.notes);
  const selected = useGameStore((s) => s.selected);
  const selectCell = useGameStore((s) => s.selectCell);
  const enterDigit = useGameStore((s) => s.enterDigit);
  const lastCompletion = useGameStore((s) => s.lastCompletion);
  const highlightPeers = useGameStore((s) => s.highlightPeers);
  const numberFirst = useGameStore((s) => s.numberFirst);
  const activeDigit = useGameStore((s) => s.activeDigit);

  const handleCell = (i: number) => {
    selectCell(i);
    // number-first: tapping a cell drops the armed digit straight in
    if (numberFirst && activeDigit !== null) enterDigit(activeDigit);
  };

  const conflicts = useMemo(() => (values ? getConflicts(values) : new Set<number>()), [values]);

  if (!values || !givenMask || !notes) return null;

  const selRow = selected !== null ? Math.floor(selected / 9) : -1;
  const selCol = selected !== null ? selected % 9 : -1;
  const selBox =
    selected !== null ? Math.floor(selRow / 3) * 3 + Math.floor(selCol / 3) : -1;
  const selValue = selected !== null ? values[selected] : 0;

  const glowOrder = new Map<number, number>();
  lastCompletion?.cells.forEach((c, idx) => glowOrder.set(c, idx));

  return (
    <div className="sudoku-frame">
      <span className="frame-leaf frame-leaf-tl">🍃</span>
      <span className="frame-leaf frame-leaf-tr">🍃</span>
      <span className="frame-leaf frame-leaf-bl">🍃</span>
      <span className="frame-leaf frame-leaf-br">🍃</span>
      <div className="sudoku-board" role="grid">
        {values.map((value, i) => {
          const row = Math.floor(i / 9);
          const col = i % 9;
          const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
          const isPeer =
            highlightPeers &&
            selected !== null &&
            (row === selRow || col === selCol || box === selBox);
          return (
            <Cell
              key={i}
              index={i}
              value={value}
              isGiven={givenMask[i]}
              isSelected={selected === i}
              isPeer={isPeer && selected !== i}
              isSameValue={highlightPeers && selValue !== 0 && value === selValue && selected !== i}
              isConflict={conflicts.has(i)}
              isGlowing={glowOrder.has(i)}
              glowOrder={glowOrder.get(i) ?? 0}
              glowKey={lastCompletion?.id ?? 0}
              notes={notes[i]}
              onClick={handleCell}
            />
          );
        })}
      </div>
    </div>
  );
}
