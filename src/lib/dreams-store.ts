import dream1 from "@/assets/dream-1.jpg";
import dream2 from "@/assets/dream-2.jpg";
import dream3 from "@/assets/dream-3.jpg";

export type Dream = {
  id: string;
  title: string;
  date: string;
  image: string;
  analysis: string;
};

const STORAGE_KEY = "sleep-stock-dreams";

const seed: Dream[] = [
  {
    id: "1",
    title: "UN MUNDO DE FANTASIAS",
    date: "25 de Marzo, 2026",
    image: dream1,
    analysis:
      "## Símbolos\nMundos flotantes, auroras, infancia.\n\n## Interpretación\nTu subconsciente está procesando un anhelo de libertad creativa.",
  },
  {
    id: "2",
    title: "VUELO EN NUBES ROSAS",
    date: "23 de Marzo, 2026",
    image: dream2,
    analysis: "## Símbolos\nGlobo, luna, cielo.\n\n## Interpretación\nDeseo de elevarte sobre lo cotidiano.",
  },
  {
    id: "3",
    title: "CABALLO CÓSMICO",
    date: "20 de Marzo, 2026",
    image: dream3,
    analysis: "## Símbolos\nCaballo, galaxia.\n\n## Interpretación\nEnergía instintiva en expansión.",
  },
];

export function getDreams(): Dream[] {
  if (typeof window === "undefined") return seed;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed;
  try {
    return JSON.parse(raw) as Dream[];
  } catch {
    return seed;
  }
}

export function saveDream(dream: Dream) {
  if (typeof window === "undefined") return;
  const current = getDreams();
  const next = [dream, ...current].slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function getDream(id: string): Dream | undefined {
  return getDreams().find((d) => d.id === id);
}