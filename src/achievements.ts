import type { Stats } from "./state/gameStore";

export interface AchievementCtx {
  stats: Stats;
  bestStreak: number;
}

export interface Achievement {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  achieved: (c: AchievementCtx) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-bloom",
    emoji: "🌱",
    name: "First Bloom",
    desc: "Solve your first puzzle",
    achieved: ({ stats }) => stats.won >= 1,
  },
  {
    id: "flawless",
    emoji: "✨",
    name: "Flawless",
    desc: "Win without losing a berry",
    achieved: ({ stats }) => stats.flawless >= 1,
  },
  {
    id: "speedy",
    emoji: "⚡",
    name: "Speedy Sprout",
    desc: "Solve Sprout under 4 min",
    achieved: ({ stats }) => stats.best.easy != null && stats.best.easy < 240_000,
  },
  {
    id: "thicket",
    emoji: "🌲",
    name: "Thicket Tamer",
    desc: "Conquer a Thicket puzzle",
    achieved: ({ stats }) => stats.best.hard != null,
  },
  {
    id: "week-bloom",
    emoji: "🌷",
    name: "Week of Blooms",
    desc: "Reach a 7-day streak",
    achieved: ({ bestStreak }) => bestStreak >= 7,
  },
  {
    id: "meadow-dweller",
    emoji: "🏡",
    name: "Meadow Dweller",
    desc: "Solve 25 puzzles",
    achieved: ({ stats }) => stats.won >= 25,
  },
];
