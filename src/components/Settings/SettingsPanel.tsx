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
  const autoCleanNotes = useGameStore((s) => s.autoCleanNotes);
  const numberFirst = useGameStore((s) => s.numberFirst);
  const zenMode = useGameStore((s) => s.zenMode);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const toggleAmbient = useGameStore((s) => s.toggleAmbient);
  const toggleHaptics = useGameStore((s) => s.toggleHaptics);
  const toggleHighlight = useGameStore((s) => s.toggleHighlight);
  const toggleAutoCleanNotes = useGameStore((s) => s.toggleAutoCleanNotes);
  const toggleNumberFirst = useGameStore((s) => s.toggleNumberFirst);
  const toggleZen = useGameStore((s) => s.toggleZen);

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
          <div className="settings-section">Playing</div>
          <Toggle
            label="Auto-tidy notes"
            hint="Placing a number clears it from nearby pencil marks"
            on={autoCleanNotes}
            onToggle={toggleAutoCleanNotes}
          />
          <Toggle
            label="Number-first tapping"
            hint="Tap a number, then tap cells to place it"
            on={numberFirst}
            onToggle={toggleNumberFirst}
          />
          <Toggle
            label="Zen mode"
            hint="Relax — no three-berry limit, just cozy solving"
            on={zenMode}
            onToggle={toggleZen}
          />
          <Toggle
            label="Highlights"
            hint="Glow the row, column & matching numbers"
            on={highlightPeers}
            onToggle={toggleHighlight}
          />

          <div className="settings-section">Sound &amp; feel</div>
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
        </div>

        <button className="settings-close" onClick={onClose}>
          Back to the meadow
        </button>
      </motion.div>
    </motion.div>
  );
}
