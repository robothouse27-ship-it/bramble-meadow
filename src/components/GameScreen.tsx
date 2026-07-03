import { useEffect, useRef } from "react";
import { useGameStore } from "../state/gameStore";
import { Hud } from "./Hud/Hud";
import { BuddyPanel } from "./Buddy/BuddyPanel";
import { Board } from "./Board/Board";
import { NumberPad } from "./NumberPad/NumberPad";
import { Controls } from "./Controls/Controls";
import { Celebration } from "./Celebration/Celebration";
import { ParticleField } from "../particles/ParticleField";

export function GameScreen() {
  const enterDigit = useGameStore((s) => s.enterDigit);
  const eraseCell = useGameStore((s) => s.eraseCell);
  const selectCell = useGameStore((s) => s.selectCell);
  const selected = useGameStore((s) => s.selected);
  const lastCompletion = useGameStore((s) => s.lastCompletion);
  const status = useGameStore((s) => s.status);
  const combo = useGameStore((s) => s.combo);

  const boardCenterRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key >= "1" && e.key <= "9") {
        enterDigit(Number(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        eraseCell();
      } else if (selected !== null) {
        const r = Math.floor(selected / 9);
        const c = selected % 9;
        if (e.key === "ArrowUp" && r > 0) selectCell(selected - 9);
        if (e.key === "ArrowDown" && r < 8) selectCell(selected + 9);
        if (e.key === "ArrowLeft" && c > 0) selectCell(selected - 1);
        if (e.key === "ArrowRight" && c < 8) selectCell(selected + 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enterDigit, eraseCell, selectCell, selected]);

  const burstTrigger = (lastCompletion?.id ?? 0) + (status === "won" ? 1 : 0);

  return (
    <div className="game-screen">
      <ParticleField
        burstTrigger={burstTrigger}
        burstOrigin={boardCenterRef.current}
        burstCount={status === "won" ? 120 : Math.min(40 + combo * 14, 104)}
      />
      <Hud />
      <BuddyPanel />
      <Board />
      <NumberPad />
      <Controls />
      <Celebration />
    </div>
  );
}
