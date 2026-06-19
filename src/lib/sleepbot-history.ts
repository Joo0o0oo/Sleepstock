export type ChatTurn = { role: "user" | "assistant"; content: string; ts: number };

const KEY = "sleep-bot-history";

export function getHistory(): ChatTurn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ChatTurn[]) : [];
  } catch {
    return [];
  }
}

export function appendTurn(turn: Omit<ChatTurn, "ts">) {
  if (typeof window === "undefined") return;
  const next = [...getHistory(), { ...turn, ts: Date.now() }];
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
