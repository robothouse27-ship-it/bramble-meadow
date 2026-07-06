import type { BuddyId, BuddyMood } from "../../state/gameStore";

// Eagerly resolve every buddy sprite. Files follow the `<id>-<mood>.png`
// convention in src/assets/buddy, so adding a new character's art set is
// enough — no code change here.
const files = import.meta.glob("../../assets/buddy/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const art = {} as Record<BuddyId, Record<BuddyMood, string>>;
for (const [path, src] of Object.entries(files)) {
  const base = path.split("/").pop()!.replace(".png", ""); // e.g. "fox-happy"
  const dash = base.indexOf("-");
  const id = base.slice(0, dash) as BuddyId;
  const mood = base.slice(dash + 1) as BuddyMood;
  (art[id] ??= {} as Record<BuddyMood, string>)[mood] = src;
}

export const buddyArt = art;

export interface BuddyMeta {
  id: BuddyId;
  name: string;
  species: string;
}

// Display order + names for the picker.
export const BUDDIES: BuddyMeta[] = [
  { id: "pip", name: "Pip", species: "hedgehog" },
  { id: "clover", name: "Clover", species: "rabbit" },
  { id: "nutmeg", name: "Nutmeg", species: "squirrel" },
  { id: "fox", name: "Rusty", species: "fox" },
  { id: "owl", name: "Hoot", species: "owl" },
];

export const BUDDY_META: Record<BuddyId, BuddyMeta> = Object.fromEntries(
  BUDDIES.map((b) => [b.id, b]),
) as Record<BuddyId, BuddyMeta>;
