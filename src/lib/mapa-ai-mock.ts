// Clasificador IA mock determinístico.
// Mantiene la forma del contrato para enchufar Lovable AI Gateway en el futuro.

export type DreamCategorySlug =
  | "creatividad"
  | "nostalgia"
  | "aventura"
  | "amor"
  | "naturaleza"
  | "ansiedad"
  | "fantasia"
  | "misterio";

export type DreamClassification = {
  categorySlug: DreamCategorySlug;
  emotion: string;
  keywords: string[];
};

const CATEGORY_KEYWORDS: Record<DreamCategorySlug, string[]> = {
  creatividad: ["arte", "pintar", "música", "mural", "poesía", "danza", "color", "instrumento"],
  nostalgia: ["infancia", "abuela", "recuerdo", "memoria", "viejo", "tango", "cartas", "olvido"],
  aventura: ["correr", "perseguir", "viaje", "escapar", "moto", "auto", "bombera", "estadio"],
  amor: ["abrazo", "beso", "te amo", "ternura", "novia", "novio", "pareja", "corazón"],
  naturaleza: ["árbol", "bosque", "río", "playa", "flor", "pájaro", "mar", "verde"],
  ansiedad: ["perdido", "examen", "tarde", "caer", "perseguido", "ahogar", "encerrado", "laberinto"],
  fantasia: ["volar", "estrella", "nube", "magia", "dragón", "hada", "cielo", "luna"],
  misterio: ["espejo", "puerta", "noche", "sombra", "secreto", "portal", "niebla", "tiempo"],
};

const EMOTIONS: Record<DreamCategorySlug, string> = {
  creatividad: "éxtasis",
  nostalgia: "melancolía",
  aventura: "euforia",
  amor: "ternura",
  naturaleza: "calma",
  ansiedad: "inquietud",
  fantasia: "asombro",
  misterio: "extrañeza",
};

export function classifyDream(body: string): DreamClassification {
  const text = body.toLowerCase();
  const scores: Record<DreamCategorySlug, number> = {
    creatividad: 0, nostalgia: 0, aventura: 0, amor: 0,
    naturaleza: 0, ansiedad: 0, fantasia: 0, misterio: 0,
  };
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS) as [DreamCategorySlug, string[]][]) {
    for (const w of words) {
      if (text.includes(w)) scores[cat] += 1;
    }
  }
  // Pick best; tie-break by deterministic hash.
  let best: DreamCategorySlug = "fantasia";
  let bestScore = -1;
  for (const [cat, score] of Object.entries(scores) as [DreamCategorySlug, number][]) {
    if (score > bestScore) { best = cat; bestScore = score; }
  }
  if (bestScore === 0) {
    // hash fallback
    const h = Array.from(text).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const all: DreamCategorySlug[] = ["creatividad","nostalgia","aventura","amor","naturaleza","ansiedad","fantasia","misterio"];
    best = all[h % all.length];
  }
  // Extract simple keywords: words >4 chars, top 4 unique.
  const tokens = text
    .replace(/[^\p{L}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 5);
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);
  const keywords = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k]) => k);

  return { categorySlug: best, emotion: EMOTIONS[best], keywords };
}
