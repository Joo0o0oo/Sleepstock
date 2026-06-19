import dream024 from "@/assets/dreams/dream-024.mp4.asset.json";
import dream023 from "@/assets/dreams/dream-023.mp4.asset.json";
import dream022 from "@/assets/dreams/dream-022.mp4.asset.json";
import dream021 from "@/assets/dreams/dream-021.mp4.asset.json";
import dream020 from "@/assets/dreams/dream-020.mp4.asset.json";
import dream019 from "@/assets/dreams/dream-019.mp4.asset.json";
import dream018 from "@/assets/dreams/dream-018.mp4.asset.json";
import dream017 from "@/assets/dreams/dream-017.mp4.asset.json";

export type DreamPhase = "REM" | "NREM" | "Lúcido" | "Pesadilla";

export type CapturedDream = {
  id: string;
  title: string;
  date: string;
  time: string;
  phase: DreamPhase;
  durationSec: number;
  fidelity: number;
  playable: boolean;
  gradient: string;
  glyph: string;
  videoUrl: string;
  symbols: string[];
  narrative: string;
  favorito: boolean;
};

const KEY = "hypn:archivo:v1";

const seed: CapturedDream[] = [
  {
    id: "024",
    title: "Bosque infinito #024",
    date: "12 Jun",
    time: "04:17",
    phase: "REM",
    durationSec: 412,
    fidelity: 92,
    playable: true,
    gradient: "linear-gradient(135deg,#6B21D9,#a78bfa)",
    glyph: "🌲",
    videoUrl: dream024.url,
    symbols: ["bosque", "agua", "luz", "vuelo"],
    narrative:
      "Caminás entre árboles altísimos que respiran. La luz violeta atraviesa las hojas y sentís que cada paso te lleva a un recuerdo de la infancia.",
    favorito: true,
  },
  {
    id: "023",
    title: "Ciudad sumergida #023",
    date: "11 Jun",
    time: "03:42",
    phase: "Lúcido",
    durationSec: 287,
    fidelity: 88,
    playable: true,
    gradient: "linear-gradient(135deg,#2563EB,#8A38F5)",
    glyph: "🌊",
    videoUrl: dream023.url,
    symbols: ["agua", "ciudad", "silencio"],
    narrative:
      "Sabés que estás soñando. Nadás entre edificios sumergidos y elegís hacia dónde girar. Una ballena pasa cerca y te mira.",
    favorito: false,
  },
  {
    id: "022",
    title: "El examen que nunca termina #022",
    date: "10 Jun",
    time: "05:51",
    phase: "Pesadilla",
    durationSec: 198,
    fidelity: 71,
    playable: true,
    gradient: "linear-gradient(135deg,#DC2626,#6B21D9)",
    glyph: "📝",
    videoUrl: dream022.url,
    symbols: ["ansiedad", "tiempo", "papel"],
    narrative:
      "Tenés que rendir un examen pero las hojas se multiplican. El reloj corre hacia atrás y nadie en el aula tiene cara.",
    favorito: false,
  },
  {
    id: "021",
    title: "Vuelo sobre montañas #021",
    date: "09 Jun",
    time: "06:08",
    phase: "REM",
    durationSec: 356,
    fidelity: 85,
    playable: true,
    gradient: "linear-gradient(135deg,#0D9488,#a78bfa)",
    glyph: "🕊️",
    videoUrl: dream021.url,
    symbols: ["vuelo", "altura", "viento"],
    narrative:
      "Te elevás sin esfuerzo sobre una cordillera nevada. El aire es delgado pero podés respirar perfecto. Hay alguien volando a la par tuya.",
    favorito: true,
  },
  {
    id: "020",
    title: "La casa de la abuela #020",
    date: "08 Jun",
    time: "02:34",
    phase: "REM",
    durationSec: 521,
    fidelity: 94,
    playable: true,
    gradient: "linear-gradient(135deg,#D97706,#DB2777)",
    glyph: "🏠",
    videoUrl: dream020.url,
    symbols: ["familia", "memoria", "hogar"],
    narrative:
      "Volvés a la cocina de tu abuela. Todo está exactamente igual: el olor, la luz amarilla, la radio sonando bajito.",
    favorito: false,
  },
  {
    id: "019",
    title: "Captura parcial #019",
    date: "07 Jun",
    time: "04:55",
    phase: "NREM",
    durationSec: 92,
    fidelity: 38,
    playable: false,
    gradient: "linear-gradient(135deg,#5A4E78,#a78bfa)",
    glyph: "◌",
    videoUrl: dream019.url,
    symbols: ["fragmento"],
    narrative:
      "El dispositivo solo logró capturar fragmentos. Hay sensación de movimiento y una voz lejana, pero la señal simbólica no fue suficiente para reconstruir la escena.",
    favorito: false,
  },
  {
    id: "018",
    title: "Espejo que habla #018",
    date: "06 Jun",
    time: "03:11",
    phase: "Lúcido",
    durationSec: 244,
    fidelity: 81,
    playable: true,
    gradient: "linear-gradient(135deg,#8A38F5,#FB923C)",
    glyph: "🪞",
    videoUrl: dream018.url,
    symbols: ["espejo", "identidad", "voz"],
    narrative:
      "Un espejo te dice cosas que nadie sabe sobre vos. No tenés miedo. Le respondés y la conversación se vuelve un acuerdo.",
    favorito: true,
  },
  {
    id: "017",
    title: "Tren al amanecer #017",
    date: "05 Jun",
    time: "05:29",
    phase: "REM",
    durationSec: 308,
    fidelity: 79,
    playable: true,
    gradient: "linear-gradient(135deg,#16A34A,#6B21D9)",
    glyph: "🚆",
    videoUrl: dream017.url,
    symbols: ["viaje", "amanecer", "extraños"],
    narrative:
      "Vas en un tren que cruza un campo dorado. Hay gente que conocés pero no podés ubicar. Nadie habla, todos miran por la ventana.",
    favorito: false,
  },
];

export function getArchivo(): CapturedDream[] {
  if (typeof window === "undefined") return seed;
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    const stored = JSON.parse(raw) as CapturedDream[];
    // Hidratar videoUrl desde el seed si falta (migración suave)
    const seedById = new Map(seed.map((s) => [s.id, s]));
    const hydrated = stored.map((d) =>
      d.videoUrl ? d : { ...d, videoUrl: seedById.get(d.id)?.videoUrl ?? "" },
    );
    return hydrated;
  } catch {
    return seed;
  }
}

export function getArchivoById(id: string): CapturedDream | undefined {
  return getArchivo().find((d) => d.id === id);
}

export function toggleFavorito(id: string) {
  if (typeof window === "undefined") return;
  const all = getArchivo().map((d) =>
    d.id === id ? { ...d, favorito: !d.favorito } : d,
  );
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
