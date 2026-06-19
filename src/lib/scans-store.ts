export type ScanResult = {
  score: number;
  sleep_coin: number;
  variacion: number;
  claridad: number;
  carga_emocional: number;
  simetria: number;
  arquetipo: string;
  estado: string;
  rasgos: string[];
  narrativa: string;
};

export type ScanEntry = {
  id: string;
  name: string;
  createdAt: number;
  result: ScanResult;
  thumbnail?: string;
};

const KEY = "sleepstock.scans";
const MAX = 50;

export function getScans(): ScanEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ScanEntry[]) : [];
  } catch {
    return [];
  }
}

function persist(items: ScanEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
  } catch {
    // try without thumbnails if quota exceeded
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify(items.slice(0, MAX).map((s) => ({ ...s, thumbnail: undefined }))),
      );
    } catch {
      // ignore
    }
  }
}

export function addScan(entry: ScanEntry): ScanEntry[] {
  const next = [entry, ...getScans()].slice(0, MAX);
  persist(next);
  return next;
}

export function removeScan(id: string): ScanEntry[] {
  const next = getScans().filter((s) => s.id !== id);
  persist(next);
  return next;
}

export function clearScans(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
