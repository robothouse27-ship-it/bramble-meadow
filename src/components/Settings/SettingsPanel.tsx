import { motion } from "framer-motion";
import { useGameStore } from "../../state/gameStore";
import "./settings.css";

function Toggle({
  label,
  hint,
  on,
  onToggle,
}: {
  label: string;
  hint: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className="setting-row"
      onClick={onToggle}
      role="switch"
      aria-checked={on}
    >
      <span className="setting-text">
        <span className="setting-label">{label}</span>
        <span className="setting-hint">{hint}</span>
      </span>
      <span className={`setting-switch ${on ? "on" : ""}`} aria-hidden>
        <motion.span
          className="setting-knob"
          animate={{ x: on ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </span>
    </button>
  );
}

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const soundOn = useGameStore((s) => s.soundOn);
  const ambientOn = useGameStore((s) => s.ambientOn);
  const hapticsOn = useGameStore((s) => s.hapticsOn);
  const highlightPeers = useGameStore((s) => s.highlightPeers);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const toggleAmbient = useGameStore((s) => s.toggleAmbient);
  const toggleHaptics = useGameStore((s) => s.toggleHaptics);
  const toggleHighlight = useGameStore((s) => s.toggleHighlight);

  return (
    <motion.div
      className="settings-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="settings-card"
        initial={{ scale: 0.82, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="settings-title">⚙️ Settings</h2>

        <div className="settings-list">
          <Toggle
            label="Sound effects"
            hint="Chimes as you place & complete"
            on={soundOn}
            onToggle={toggleSound}
          />
          <Toggle
            label="Meadow sounds"
            hint="Gentle ambient soundscape"
            on={ambientOn}
            onToggle={toggleAmbient}
          />
          <Toggle
            label="Vibration"
            hint="Little buzzes on your device"
            on={hapticsOn}
            onToggle={toggleHaptics}
          />
          <Toggle
            label="Highlights"
            hint="Glow the row, column & matching berries"
            on={highlightPeers}
            onToggle={toggleHighlight}
          />
        </div>

        <button className="settings-close" onClick={onClose}>
          Back to the meadow
        </button>
      </motion.div>
    </motion.div>
  );
}
