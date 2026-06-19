// Simulación 100% frontend de la sección Comunidad.
// Persiste en localStorage; no necesita backend.

export type Visibility = "public" | "tagged_only";

export type MockProfile = {
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
};

export type MockPost = {
  id: string;
  author: string; // username
  body: string;
  visibility: Visibility;
  created_at: string; // ISO
  mentions: string[]; // usernames
  likes: string[]; // usernames
};

export type FeedPost = {
  id: string;
  body: string;
  visibility: Visibility;
  created_at: string;
  like_count: number;
  liked_by_me: boolean;
  is_mine: boolean;
  author: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
};

type State = {
  me: string | null; // username del usuario actual
  profiles: Record<string, MockProfile>;
  posts: MockPost[]; // ordenados desc por created_at
};

const STORAGE_KEY = "hypn:comunidad:v1";

const SEED_USERS: MockProfile[] = [
  { username: "lunaazul", display_name: "Luna Romero", bio: "Sueña en colores fríos.", avatar_url: null },
  { username: "martinsuena", display_name: "Martín Sueña", bio: "Coleccionista de pesadillas amables.", avatar_url: null },
  { username: "valeolas", display_name: "Vale Olas", bio: "Surfeo entre nubes.", avatar_url: null },
  { username: "nicostars", display_name: "Nico Estrellas", bio: "Astronauta nocturno.", avatar_url: null },
  { username: "pauladream", display_name: "Paula Onírica", bio: "Cartógrafa de laberintos.", avatar_url: null },
  { username: "joaquinrem", display_name: "Joaquín REM", bio: "Diario de sueños en papel.", avatar_url: null },
];

function isoMinusMin(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}

function seedPosts(): MockPost[] {
  return [
    {
      id: crypto.randomUUID(),
      author: "lunaazul",
      body: "Soñé que volaba sobre Buenos Aires al atardecer y todo brillaba violeta.",
      visibility: "public",
      created_at: isoMinusMin(15),
      mentions: [],
      likes: ["valeolas", "joaquinrem"],
    },
    {
      id: crypto.randomUUID(),
      author: "martinsuena",
      body: "Un laberinto de espejos. Cada espejo mostraba una versión distinta de mí.",
      visibility: "public",
      created_at: isoMinusMin(48),
      mentions: [],
      likes: ["pauladream"],
    },
    {
      id: crypto.randomUUID(),
      author: "valeolas",
      body: "Mi gato me hablaba en latín y entendía todo 🐈",
      visibility: "public",
      created_at: isoMinusMin(95),
      mentions: [],
      likes: [],
    },
    {
      id: crypto.randomUUID(),
      author: "nicostars",
      body: "Anoche estaba surfeando entre nubes con @lunaazul, no nos caíamos nunca.",
      visibility: "public",
      created_at: isoMinusMin(140),
      mentions: ["lunaazul"],
      likes: ["lunaazul", "pauladream"],
    },
    {
      id: crypto.randomUUID(),
      author: "pauladream",
      body: "Cumpleaños sorpresa en una casa que no conozco. Todos me esperaban con velas.",
      visibility: "public",
      created_at: isoMinusMin(220),
      mentions: [],
      likes: ["martinsuena"],
    },
    {
      id: crypto.randomUUID(),
      author: "joaquinrem",
      body: "Manejaba un auto que no tenía volante, pero igual llegaba a destino.",
      visibility: "public",
      created_at: isoMinusMin(300),
      mentions: [],
      likes: [],
    },
    {
      id: crypto.randomUUID(),
      author: "lunaazul",
      body: "Caminaba descalza por una playa hecha de papel. Cada paso dejaba un poema.",
      visibility: "public",
      created_at: isoMinusMin(420),
      mentions: [],
      likes: ["nicostars"],
    },
    {
      id: crypto.randomUUID(),
      author: "martinsuena",
      body: "Me reía sin parar con @pauladream en un teleférico que no terminaba nunca.",
      visibility: "public",
      created_at: isoMinusMin(540),
      mentions: ["pauladream"],
      likes: ["pauladream"],
    },
    {
      id: crypto.randomUUID(),
      author: "joaquinrem",
      body: "Veía mi reflejo en el agua y me sonreía antes que yo.",
      visibility: "public",
      created_at: isoMinusMin(720),
      mentions: [],
      likes: [],
    },
    {
      id: crypto.randomUUID(),
      author: "valeolas",
      body: "Mi abuela me daba una receta secreta escrita en una hoja que se desarmaba.",
      visibility: "public",
      created_at: isoMinusMin(900),
      mentions: [],
      likes: ["lunaazul"],
    },
    {
      id: crypto.randomUUID(),
      author: "nicostars",
      body: "Soñé que ganaba la lotería y la regalaba toda en monedas.",
      visibility: "public",
      created_at: isoMinusMin(1100),
      mentions: [],
      likes: [],
    },
    {
      id: crypto.randomUUID(),
      author: "pauladream",
      body: "Una orquesta tocando bajo el agua. Las burbujas eran las notas.",
      visibility: "public",
      created_at: isoMinusMin(1400),
      mentions: [],
      likes: ["martinsuena", "valeolas"],
    },
  ];
}

function initialState(): State {
  const profiles: Record<string, MockProfile> = {};
  for (const u of SEED_USERS) profiles[u.username] = u;
  return { me: null, profiles, posts: seedPosts() };
}

const EMPTY: State = { me: null, profiles: {}, posts: [] };

let state: State = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function save() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

function emit() {
  save();
  listeners.forEach((l) => l());
}

function setState(next: State) {
  state = next;
  emit();
}

export function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      if (parsed && parsed.profiles && parsed.posts) {
        state = parsed;
        listeners.forEach((l) => l());
        return;
      }
    }
  } catch {
    /* fall through to seed */
  }
  state = initialState();
  emit();
}

export function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function getSnapshot(): State {
  return state;
}

export function getServerSnapshot(): State {
  return EMPTY;
}

export function resetSimulation() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  hydrated = false;
  state = EMPTY;
  emit();
  hydrate();
}

// ---------- selectores ----------

function project(p: MockPost, me: string | null): FeedPost {
  const author = state.profiles[p.author];
  return {
    id: p.id,
    body: p.body,
    visibility: p.visibility,
    created_at: p.created_at,
    like_count: p.likes.length,
    liked_by_me: me ? p.likes.includes(me) : false,
    is_mine: !!me && p.author === me,
    author: {
      username: p.author,
      display_name: author?.display_name ?? null,
      avatar_url: author?.avatar_url ?? null,
    },
  };
}

export function getMe(): MockProfile | null {
  return state.me ? state.profiles[state.me] ?? null : null;
}

export function getFeed(limit = 50): FeedPost[] {
  const me = state.me;
  return state.posts
    .filter(
      (p) =>
        p.visibility === "public" ||
        (!!me && (p.author === me || p.mentions.includes(me))),
    )
    .slice(0, limit)
    .map((p) => project(p, me));
}

export function getMentions(limit = 50): FeedPost[] {
  const me = state.me;
  if (!me) return [];
  return state.posts
    .filter((p) => p.mentions.includes(me))
    .slice(0, limit)
    .map((p) => project(p, me));
}

export function getUserPosts(username: string): FeedPost[] {
  const me = state.me;
  return state.posts
    .filter(
      (p) =>
        p.author === username &&
        (p.visibility === "public" ||
          (!!me && (p.author === me || p.mentions.includes(me)))),
    )
    .map((p) => project(p, me));
}

export function getProfile(username: string): MockProfile | null {
  return state.profiles[username] ?? null;
}

export function searchUsers(query: string, limit = 6): MockProfile[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return Object.values(state.profiles)
    .filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.display_name.toLowerCase().includes(q),
    )
    .filter((u) => u.username !== state.me)
    .slice(0, limit);
}

// ---------- mutaciones ----------

function parseMentions(body: string): string[] {
  const set = new Set<string>();
  const re = /@([a-z0-9_]{3,20})/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const u = m[1].toLowerCase();
    if (state.profiles[u]) set.add(u);
  }
  return Array.from(set);
}

function pickSeedAuthor(exclude: string): string {
  const pool = SEED_USERS.map((u) => u.username).filter((u) => u !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function setMe(username: string, displayName: string): MockProfile {
  const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
  if (clean.length < 3) throw new Error("Usuario inválido");
  const profile: MockProfile =
    state.profiles[clean] ?? {
      username: clean,
      display_name: displayName.trim() || clean,
      bio: "",
      avatar_url: null,
    };
  const alreadyMentioned = state.posts.some(
    (p) => p.mentions.includes(clean),
  );
  const welcomePosts: MockPost[] = alreadyMentioned
    ? []
    : [
        {
          id: crypto.randomUUID(),
          author: "lunaazul",
          body: `Anoche soñé que estábamos en un café de Palermo con @${clean}, hablando del fin del mundo en susurros.`,
          visibility: "public",
          created_at: isoMinusMin(8),
          mentions: [clean],
          likes: ["pauladream"],
        },
        {
          id: crypto.randomUUID(),
          author: "valeolas",
          body: `Te vi en un sueño @${clean}, estabas escribiendo algo en una pared de luz.`,
          visibility: "public",
          created_at: isoMinusMin(35),
          mentions: [clean],
          likes: [],
        },
      ];
  const profiles = { ...state.profiles, [clean]: profile };
  const posts = [...welcomePosts, ...state.posts].sort(
    (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
  );
  setState({ ...state, me: clean, profiles, posts });
  return profile;
}

export function updateMe(input: Partial<Omit<MockProfile, "avatar_url">> & { avatar_url?: string | null }) {
  if (!state.me) throw new Error("Sin usuario activo");
  const current = state.profiles[state.me];
  let nextUsername = current.username;
  if (input.username && input.username !== current.username) {
    const clean = input.username.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
    if (clean.length < 3) throw new Error("Usuario inválido");
    if (state.profiles[clean] && clean !== current.username) {
      throw new Error("Ese usuario ya existe");
    }
    nextUsername = clean;
  }
  const next: MockProfile = {
    username: nextUsername,
    display_name: input.display_name ?? current.display_name,
    bio: input.bio ?? current.bio,
    avatar_url:
      input.avatar_url === undefined ? current.avatar_url : input.avatar_url,
  };
  const profiles = { ...state.profiles };
  if (nextUsername !== current.username) {
    delete profiles[current.username];
  }
  profiles[nextUsername] = next;
  // Renombrar autoría / menciones si cambió username
  let posts = state.posts;
  if (nextUsername !== current.username) {
    posts = state.posts.map((p) => ({
      ...p,
      author: p.author === current.username ? nextUsername : p.author,
      mentions: p.mentions.map((m) =>
        m === current.username ? nextUsername : m,
      ),
      likes: p.likes.map((l) => (l === current.username ? nextUsername : l)),
    }));
  }
  setState({ ...state, me: nextUsername, profiles, posts });
}

export function createPost(body: string, visibility: Visibility): FeedPost {
  if (!state.me) throw new Error("Sin usuario activo");
  const trimmed = body.trim();
  if (!trimmed) throw new Error("El sueño está vacío");
  const post: MockPost = {
    id: crypto.randomUUID(),
    author: state.me,
    body: trimmed,
    visibility,
    created_at: new Date().toISOString(),
    mentions: parseMentions(trimmed),
    likes: [],
  };
  setState({ ...state, posts: [post, ...state.posts] });
  return project(post, state.me);
}

export function toggleLike(postId: string) {
  if (!state.me) return;
  const me = state.me;
  const posts = state.posts.map((p) => {
    if (p.id !== postId) return p;
    const liked = p.likes.includes(me);
    return { ...p, likes: liked ? p.likes.filter((u) => u !== me) : [...p.likes, me] };
  });
  setState({ ...state, posts });
}

export function deletePost(postId: string) {
  if (!state.me) return;
  const me = state.me;
  setState({
    ...state,
    posts: state.posts.filter((p) => !(p.id === postId && p.author === me)),
  });
}

// Genera un par de sueños mock de seed users (para variedad ocasional)
export function seedAnotherDream() {
  const author = pickSeedAuthor(state.me ?? "");
  const post: MockPost = {
    id: crypto.randomUUID(),
    author,
    body: "Soñé con un río que corría hacia arriba y nadie se sorprendía.",
    visibility: "public",
    created_at: new Date().toISOString(),
    mentions: [],
    likes: [],
  };
  setState({ ...state, posts: [post, ...state.posts] });
}
