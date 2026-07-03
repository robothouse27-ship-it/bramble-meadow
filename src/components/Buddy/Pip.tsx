import { useEffect } from "react";
import { motion, useAnimationControls, type TargetAndTransition, type Transition } from "framer-motion";
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

const bodyVariants: Record<BuddyMood, TargetAndTransition> = {
  idle: { scale: 1, rotate: 0, y: [0, -4, 0] },
  thinking: { scale: 1, rotate: -4, y: 0 },
  happy: { scale: [1, 1.08, 1], rotate: 0, y: 0 },
  worried: { scale: 0.9, rotate: 0, y: 0 },
  celebrate: { scale: [1, 1.15, 1], rotate: [0, -6, 6, 0], y: [0, -14, 0] },
};

const bodyTransition: Record<BuddyMood, Transition> = {
  idle: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
  thinking: { duration: 0.4 },
  happy: { duration: 0.5 },
  worried: { duration: 0.3 },
  celebrate: { duration: 0.8, repeat: 1 },
};

// occasional stretch/yawn layered over the idle breathing
const STRETCH: TargetAndTransition = {
  scaleX: [1, 0.96, 1.05, 1],
  scaleY: [1, 1.08, 0.95, 1],
  rotate: [0, -3, 3, 0],
  y: [0, -10, 0],
};

export function Pip({ mood, size = 140 }: PipProps) {
  const controls = useAnimationControls();

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    if (mood === "idle") {
      controls.start(bodyVariants.idle, bodyTransition.idle);
      const scheduleStretch = () => {
        timer = setTimeout(
          async () => {
            if (cancelled) return;
            await controls.start(STRETCH, { duration: 1.5, ease: "easeInOut" });
            if (cancelled) return;
            controls.start(bodyVariants.idle, bodyTransition.idle);
            scheduleStretch();
          },
          12000 + Math.random() * 12000,
        );
      };
      scheduleStretch();
    } else {
      controls.start(bodyVariants[mood], bodyTransition[mood]);
    }

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [mood, controls]);

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
      animate={controls}
    />
  );
}
