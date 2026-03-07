import type { PickerMode, Recommendation } from "./types";

// ── Status label helpers ──────────────────────────────────────────
const animeStatusLabel: Record<string, string> = {
  CURRENT: "Watching",
  COMPLETED: "Completed",
  PLANNING: "Planned",
  DROPPED: "Dropped",
  PAUSED: "Paused",
  REPEATING: "Rewatching",
};

const gameStatusLabel: Record<string, string> = {
  beaten: "Beaten",
  playing: "Playing",
  yet: "Backlog",
  toplay: "To Play",
  dropped: "Dropped",
  owned: "Owned",
};

export function statusLabel(mode: PickerMode, status: string): string {
  if (mode === "anime") return animeStatusLabel[status] || status;
  return gameStatusLabel[status] || status;
}

// ── Encode / decode recommendations ──────────────────────────────
export function encodeRecommendation(rec: Recommendation): string {
  return `%%REC%%${JSON.stringify(rec)}%%REC%%`;
}

export function parseRecommendation(msg: string): Recommendation | null {
  const match = msg.match(/^%%REC%%([\s\S]+)%%REC%%$/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as Recommendation;
  } catch {
    return null;
  }
}

// ── Normalize title for matching ─────────────────────────────────
export function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}
