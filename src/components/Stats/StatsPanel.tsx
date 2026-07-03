import { motion } from "framer-motion";
import { useGameStore, dayKey } from "../../state/gameStore";
import { ACHIEVEMENTS } from "../../achievements";
import "./stats.css";

function fmtTime(ms: number | null): string {
  if (ms == null) return "—";
  const t = Math.floor(ms / 1000);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}

export function StatsPanel({ onClose }: { onClose: () => void }) {
  const stats = useGameStore((s) => s.stats);
  const dailyStreak = useGameStore((s) => s.dailyStreak);
  const bestStreak = useGameStore((s) => s.bestStreak);
  const lastDailyDate = useGameStore((s) => s.lastDailyDate);

  const today = dayKey();
  const yesterday = dayKey(new Date(Date.now() - 86_400_000));
  const streakAlive = lastDailyDate === today || lastDailyDate === yesterday;
  const curStreak = streakAlive ? dailyStreak : 0;
  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;

  const ctx = { stats, bestStreak };
  const earnedCount = ACHIEVEMENTS.filter((a) => a.achieved(ctx)).length;

  return (
    <motion.div
      className="stats-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="stats-card"
        initial={{ scale: 0.82, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="stats-title">🌿 Your Meadow</h2>

        <div className="stats-grid">
          <div className="stat-tile">
            <span className="stat-num">{stats.won}</span>
            <span className="stat-label">Solved</span>
          </div>
          <div className="stat-tile">
            <span className="stat-num">{winRate}%</span>
            <span className="stat-label">Win rate</span>
          </div>
          <div className="stat-tile">
            <span className="stat-num">{stats.flawless}</span>
            <span className="stat-label">Flawless</span>
          </div>
          <div className="stat-tile">
            <span className="stat-num">{curStreak}</span>
            <span className="stat-label">Day streak</span>
          </div>
        </div>

        <div className="stats-times">
          <div className="stats-times-title">Best times</div>
          <div className="stats-time-row">
            <span>🌱 Sprout</span>
            <span>{fmtTime(stats.best.easy)}</span>
          </div>
          <div className="stats-time-row">
            <span>🌼 Meadow</span>
            <span>{fmtTime(stats.best.medium)}</span>
          </div>
          <div className="stats-time-row">
            <span>🌲 Thicket</span>
            <span>{fmtTime(stats.best.hard)}</span>
          </div>
        </div>

        <div className="stats-badges">
          <div className="stats-times-title">
            Badges · {earnedCount}/{ACHIEVEMENTS.length}
          </div>
          <div className="stats-badge-grid">
            {ACHIEVEMENTS.map((a, i) => {
              const earned = a.achieved(ctx);
              return (
                <motion.div
                  key={a.id}
                  className={`stats-badge ${earned ? "earned" : "locked"}`}
                  title={earned ? `${a.name} — ${a.desc}` : `Locked — ${a.desc}`}
                  initial={earned ? { scale: 0.4, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.06, type: "spring", stiffness: 300, damping: 18 }}
                >
                  <span className="stats-badge-emoji">{earned ? a.emoji : "🔒"}</span>
                  <span className="stats-badge-name">{a.name}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="stats-sub">
          Best bloom: {bestStreak} {bestStreak === 1 ? "day" : "days"} · {stats.played}{" "}
          {stats.played === 1 ? "game" : "games"} played
        </div>

        <button className="stats-close" onClick={onClose}>
          Back to the meadow
        </button>
      </motion.div>
    </motion.div>
  );
}
