import { motion } from "framer-motion";
import type { BuddyMood } from "../../state/gameStore";
import pipIdle from "../../assets/buddy/pip-idle.png";
import pipThinking from "../../assets/buddy/pip-thinking.png";
import pipHappy from "../../assets/buddy/pip-happy.png";
import pipWorried from "../../assets/buddy/pip-worried.png";
import pipCelebrate from "../../assets/buddy/pip-celebrate.png";

interface PipProps {
  mood: BuddyMood;
  size?: number;
}

const art: Record<BuddyMood, string> = {
  idle: pipIdle,
  thinking: pipThinking,
  happy: pipHappy,
  worried: pipWorried,
  celebrate: pipCelebrate,
};

const bodyVariants = {
  idle: { scale: 1, rotate: 0, y: [0, -4, 0] },
  thinking: { scale: 1, rotate: -4, y: 0 },
  happy: { scale: [1, 1.08, 1], rotate: 0, y: 0 },
  worried: { scale: 0.9, rotate: 0, y: 0 },
  celebrate: { scale: [1, 1.15, 1], rotate: [0, -6, 6, 0], y: [0, -14, 0] },
};

const bodyTransition: Record<BuddyMood, object> = {
  idle: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
  thinking: { duration: 0.4 },
  happy: { duration: 0.5 },
  worried: { duration: 0.3 },
  celebrate: { duration: 0.8, repeat: 1 },
};

export function Pip({ mood, size = 140 }: PipProps) {
  return (
    <motion.img
      src={art[mood]}
      alt={`Pip the hedgehog looking ${mood}`}
      draggable={false}
      style={{
        height: size,
        width: "auto",
        display: "block",
        userSelect: "none",
        filter: "drop-shadow(0 6px 8px rgba(74, 55, 40, 0.22))",
      }}
      animate={bodyVariants[mood]}
      transition={bodyTransition[mood]}
    />
  );
}
