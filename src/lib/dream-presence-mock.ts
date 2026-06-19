export type Dreamer = {
  id: string;
  name: string;
  initials: string;
  frequency: number;
  intensity: number;
  lastSeen: string;
  color: string;
};

export type DreamAppearance = {
  id: string;
  dreamer: string;
  when: string;
  snippet: string;
  emotion: string;
};

export type RecentPerson = {
  name: string;
  initials: string;
  time: string;
  percent: number;
  colorFrom: string;
  colorTo: string;
};

export const dreamPresence = {
  totalLast24h: 3,
  emotionalMatch: 91,
  weeklyDelta: 35,
  topDreamer: "Luna",
  aiSummary:
    "Tu presencia genera una sensación de calma y refugio en sueños ajenos. Detectamos 2 vínculos emergentes y una afinidad subconsciente creciente con Luna. Tu firma onírica se proyecta como una figura luminosa y serena.",
  dreamers: [
    { id: "1", name: "Luna Martínez", initials: "LM", frequency: 4, intensity: 92, lastSeen: "hace 2h", color: "#A855F7" },
    { id: "2", name: "Iván Soler", initials: "IS", frequency: 2, intensity: 74, lastSeen: "hace 9h", color: "#6366F1" },
    { id: "3", name: "Mara Quinteros", initials: "MQ", frequency: 2, intensity: 68, lastSeen: "ayer", color: "#EC4899" },
    { id: "4", name: "Tomás Vidal", initials: "TV", frequency: 1, intensity: 55, lastSeen: "hace 2d", color: "#3B82F6" },
  ] as Dreamer[],
  timeline: [
    { id: "t1", dreamer: "Luna", when: "03:42", snippet: "Caminabas por un bosque de luces", emotion: "ternura" },
    { id: "t2", dreamer: "Iván", when: "01:18", snippet: "Aparecías como una presencia guía", emotion: "calma" },
    { id: "t3", dreamer: "Mara", when: "ayer 04:55", snippet: "Compartían un viaje en tren violeta", emotion: "nostalgia" },
    { id: "t4", dreamer: "Luna", when: "ayer 02:10", snippet: "Te despedías sin palabras", emotion: "melancolía" },
  ] as DreamAppearance[],
  matches: [
    "Afinidad subconsciente creciente con Luna",
    "Sueño compartido entre Iván y Mara con tu presencia",
    "Patrón recurrente: aparecés como figura protectora",
    "2 conexiones emergentes detectadas esta semana",
  ],
};

export const otherRecent: RecentPerson[] = [
  { name: "Martín", initials: "M", time: "Hace 2 h", percent: 78, colorFrom: "#A855F7", colorTo: "#EC4899" },
  { name: "Vale", initials: "V", time: "Hace 5 h", percent: 65, colorFrom: "#6366F1", colorTo: "#A855F7" },
  { name: "Tomás", initials: "T", time: "Hace 7 h", percent: 54, colorFrom: "#3B82F6", colorTo: "#6366F1" },
];
