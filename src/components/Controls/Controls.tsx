import { useGameStore } from "../../state/gameStore";
import "./controls.css";

export function Controls() {
  const notesMode = useGameStore((s) => s.notesMode);
  const toggleNotesMode = useGameStore((s) => s.toggleNotesMode);
  const undo = useGameStore((s) => s.undo);
  const eraseCell = useGameStore((s) => s.eraseCell);
  const history = useGameStore((s) => s.history);
  const useHint = useGameStore((s) => s.useHint);
  const hintsLeft = useGameStore((s) => s.hintsLeft);

  return (
    <div className="controls-row">
      <button className="control-btn" onClick={undo} disabled={history.length === 0}>
        ↩ Undo
      </button>
      <button className="control-btn" onClick={eraseCell}>
        ✕ Erase
      </button>
      <button className="control-btn" onClick={useHint} disabled={hintsLeft <= 0}>
        💡 Hint <span className="control-count">{hintsLeft}</span>
      </button>
      <button className={`control-btn ${notesMode ? "active" : ""}`} onClick={toggleNotesMode}>
        ✎ Notes {notesMode ? "on" : "off"}
      </button>
    </div>
  );
}
