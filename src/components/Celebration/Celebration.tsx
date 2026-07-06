import { motion } from "framer-motion";
import { useGameStore } from "../../state/gameStore";
import { Buddy } from "../Buddy/Buddy";
import signBoard from "../../assets/props/sign-board.png";
import sparkles from "../../assets/props/sparkles.png";
import "./celebration.css";

// scattered sparkle accents (position %, size px, delay s) for the win screen
const SPARKLES = [
  { top: "6%", left: "10%", size: 90, delay: 0 },
  { top: "14%", left: "80%", size: 120, delay: 0.4 },
  { top: "70%", left: "6%", size: 100, delay: 0.8 },
  { top: "78%", left: "82%", size: 110, delay: 0.2 },
  { top: "40%", left: "88%", size: 70, delay: 1.1 },
];

export function Celebration() {
  const status = useGameStore((s) => s.status);
  const elapsedMs = useGameStore((s) => s.elapsedMs);
  const mistakes = useGameStore((s) => s.mistakes);
  const difficulty = useGameStore((s) => s.difficulty);
  const startGame = useGameStore((s) => s.startGame);
  const backToMenu = useGameStore((s) => s.backToMenu);

  if (status !== "won" && status !== "lost") return null;

  const won = status === "won";
  const seconds = Math.floor(elapsedMs / 1000);
  const timeStr = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

  return (
    <motion.div
      className="celebration-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {won &&
        SPARKLES.map((s, i) => (
          <motion.img
            key={i}
            src={sparkles}
            alt=""
            className="celebration-sparkle"
            style={{ top: s.top, left: s.left, width: s.size }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 0.6, 1], scale: [0.6, 1, 0.9, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
          />
        ))}

      <motion.div
        className="celebration-card"
        initial={{ scale: 0.7, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="celebration-banner">
          <img src={signBoard} alt="" draggable={false} />
          <span className="celebration-banner-text">
            {won ? "Meadow Complete!" : "The meadow rests…"}
          </span>
        </div>

        <Buddy mood={won ? "celebrate" : "worried"} size={110} />

        {won ? (
          <p className="celebration-stats">
            Solved in <strong>{timeStr}</strong> with <strong>{mistakes}</strong> slip
            {mistakes === 1 ? "" : "s"}.
          </p>
        ) : (
          <p className="celebration-stats">Three berries gone. Pip believes in a fresh try!</p>
        )}
        <div className="celebration-actions">
          {difficulty && (
            <button className="celebration-btn primary" onClick={() => startGame(difficulty)}>
              {won ? "Play again" : "Try again"}
            </button>
          )}
          <button className="celebration-btn" onClick={backToMenu}>
            Menu
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
