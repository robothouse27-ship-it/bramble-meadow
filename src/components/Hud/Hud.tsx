import { useEffect } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../../state/gameStore";
import berry from "../../assets/props/berry.png";
import "./hud.css";

const MAX_MISTAKES = 3;

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Hud({ onOpenSettings }: { onOpenSettings: () => void }) {
  const elapsedMs = useGameStore((s) => s.elapsedMs);
  const mistakes = useGameStore((s) => s.mistakes);
  const tick = useGameStore((s) => s.tick);
  const difficulty = useGameStore((s) => s.difficulty);
  const backToMenu = useGameStore((s) => s.backToMenu);
  const paused = useGameStore((s) => s.paused);
  const pauseGame = useGameStore((s) => s.pauseGame);
  const zenMode = useGameStore((s) => s.zenMode);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <div className="hud-row">
      <button className="hud-back" onClick={backToMenu} aria-label="Back to menu">
        🌿
      </button>
      <div className="hud-difficulty">{difficulty}</div>
      <div className="hud-timer">⏱ {formatTime(elapsedMs)}</div>
      <button
        className="hud-icon-btn"
        onClick={pauseGame}
        disabled={paused}
        aria-label="Pause"
      >
        ⏸
      </button>
      <button className="hud-icon-btn" onClick={onOpenSettings} aria-label="Settings">
        ⚙️
      </button>
      {zenMode ? (
        <div className="hud-zen" aria-label="Zen mode — no mistake limit" title="Zen mode">
          🍃
        </div>
      ) : (
        <div className="hud-berries" aria-label={`${MAX_MISTAKES - mistakes} berries left`}>
          {Array.from({ length: MAX_MISTAKES }, (_, i) => {
            const alive = i < MAX_MISTAKES - mistakes;
            return (
              <motion.img
                key={i}
                src={berry}
                alt=""
                draggable={false}
                className={`berry ${alive ? "" : "berry-lost"}`}
                animate={alive ? { scale: [1, 1.3, 1] } : { scale: 0.85, opacity: 0.35 }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
