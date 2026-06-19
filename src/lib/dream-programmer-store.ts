export type Platform = "spotify" | "youtube" | null;
export type Frequency = "theta" | "delta" | "gamma" | null;

export type ScheduledDream = {
  id: string;
  prompt: string;
  scheduledAt: string; // ISO
  mediaUrl?: string;
  platform: Platform;
  createdAt: string;
  skinId?: string;
  sceneId?: string;
  frequency?: Frequency;
};

const KEY = "sleep-stock-scheduled-dreams";

export function detectPlatform(url: string): Platform {
  if (!url) return null;
  const u = url.toLowerCase();
  if (u.includes("spotify.com")) return "spotify";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  return null;
}

export function getScheduled(): ScheduledDream[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScheduledDream[];
  } catch {
    return [];
  }
}

function writeAll(list: ScheduledDream[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function saveScheduled(d: ScheduledDream) {
  const list = [...getScheduled(), d];
  writeAll(list);
}

export function updateScheduled(id: string, patch: Partial<ScheduledDream>) {
  const list = getScheduled().map((d) => (d.id === id ? { ...d, ...patch } : d));
  writeAll(list);
}

export function deleteScheduled(id: string) {
  writeAll(getScheduled().filter((d) => d.id !== id));
}