import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "./state/gameStore";
import { setSoundEnabled } from "./audio/sound";
import { setHapticsEnabled } from "./audio/haptics";
import { Menu } from "./components/Menu/Menu";
import { GameScreen } from "./components/GameScreen";
import { Scene } from "./components/Scene/Scene";
import "./styles/global.css";

export default function App() {
  const status = useGameStore((s) => s.status);
  const soundOn = useGameStore((s) => s.soundOn);
  const hapticsOn = useGameStore((s) => s.hapticsOn);
  const isMenu = status === "menu";

  // apply persisted audio/haptic prefs to the (module-level) engines
  useEffect(() => setSoundEnabled(soundOn), [soundOn]);
  useEffect(() => setHapticsEnabled(hapticsOn), [hapticsOn]);

  return (
    <>
      <Scene />
      <div className="grain" />
      <div className="app-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={isMenu ? "menu" : "game"}
            className="screen-swap"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.98 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
          >
            {isMenu ? <Menu /> : <GameScreen />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
