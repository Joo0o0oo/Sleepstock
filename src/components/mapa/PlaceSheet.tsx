import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { BadgeCheck, MapPin, Sparkles, ExternalLink, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { PlaceWithStats, DreamCategory, Dream } from "@/hooks/use-mapa";
import { fetchDreamById, fetchDreamsForPlace } from "@/hooks/use-mapa";
import { CategoryChip } from "./CategoryChip";

type Props = {
  place: PlaceWithStats | null;
  categories: DreamCategory[];
  onOpenChange: (open: boolean) => void;
};

type Tab = "destacado" | "reciente" | "comentado";

function redditSearchUrl(query: string) {
  return `https://www.reddit.com/r/buenosaires/search/?q=${encodeURIComponent(query)}&restrict_sr=1&sort=relevance`;
}

export function PlaceSheet({ place, categories, onOpenChange }: Props) {
  const [tab, setTab] = useState<Tab>("destacado");
  const [featured, setFeatured] = useState<Dream | null>(null);
  const [recent, setRecent] = useState<Dream | null>(null);
  const [liked, setLiked] = useState<Dream | null>(null);
  const [allDreams, setAllDreams] = useState<Dream[]>([]);

  useEffect(() => {
    if (!place) return;
    setTab("destacado");
    fetchDreamsForPlace(place.id, 30).then(setAllDreams);
    Promise.all([
      place.stats?.featured_dream_id ? fetchDreamById(place.stats.featured_dream_id) : Promise.resolve(null),
      place.stats?.most_recent_dream_id ? fetchDreamById(place.stats.most_recent_dream_id) : Promise.resolve(null),
      place.stats?.most_liked_dream_id ? fetchDreamById(place.stats.most_liked_dream_id) : Promise.resolve(null),
    ]).then(([f, r, l]) => {
      setFeatured(f); setRecent(r); setLiked(l);
    });
  }, [place]);

  if (!place) return null;
  const topCat = categories.find((c) => c.id === place.stats?.top_category_id) ?? null;
  const total = place.stats?.total_dreams ?? 0;
  const last7 = place.stats?.dreams_last_7d ?? 0;
  const active: Dream | null = tab === "destacado" ? featured : tab === "reciente" ? recent : liked;
  const activeFallback = active ?? allDreams[0] ?? null;
  const redditQuery = `${place.name}${place.neighborhood?.name ? ` ${place.neighborhood.name}` : ""}`;

  return (
    <Sheet open={!!place} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[88vh] overflow-y-auto rounded-t-3xl border-t border-[rgba(107,33,217,0.18)] p-0 text-foreground"
        style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F7F5FB 100%)" }}
      >
        <SheetHeader className="px-5 pt-5 text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-700/70">
                <MapPin className="h-3 w-3" />
                {place.neighborhood?.name ?? "Buenos Aires"}
              </div>
              <SheetTitle className="mt-1 flex items-center gap-2 text-xl font-bold text-foreground">
                {place.name}
                {place.is_verified && <BadgeCheck className="h-5 w-5 text-fuchsia-500" />}
              </SheetTitle>
            </div>
            <Link
              to="/comunidad/lugar/$slug"
              params={{ slug: place.slug }}
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold text-violet-800 hover:bg-violet-200"
            >
              Perfil <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </SheetHeader>

        <div className="px-5 py-4">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Total" value={total.toLocaleString("es-AR")} />
            <Stat label="Últ. 7d" value={last7.toLocaleString("es-AR")} />
            <Stat label="Emoción" value={topCat ? `${topCat.emoji}` : "—"} />
          </div>

          {(place.stats?.top_keywords?.length ?? 0) > 0 && (
            <div className="mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-700/70">Palabras frecuentes</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {place.stats!.top_keywords.map((k) => (
                  <span key={k} className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-medium text-violet-800 ring-1 ring-violet-300/50">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          <a
            href={redditSearchUrl(redditQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 ring-1 ring-orange-200/60 hover:from-orange-100 hover:to-amber-100"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-[12px] font-bold text-foreground">Ver en r/buenosaires</p>
                <p className="text-[10px] text-orange-700/80">¿Qué dicen en Reddit sobre este lugar?</p>
              </div>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-orange-600" />
          </a>

          <div className="mt-5 flex gap-1.5">
            {(["destacado","reciente","comentado"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize transition ${
                  tab === t
                    ? "bg-violet-700 text-white"
                    : "bg-violet-100 text-violet-800 hover:bg-violet-200"
                }`}
              >
                {t === "comentado" ? "Más likeado" : t === "reciente" ? "Reciente" : "Destacado"}
              </button>
            ))}
          </div>

          <DreamPreview dream={activeFallback} topCat={topCat} categories={categories} />

          {allDreams.length > 1 && (
            <div className="mt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-700/70">Más sueños acá</p>
              <div className="mt-2 space-y-2">
                {allDreams.slice(0, 5).map((d) => (
                  <MiniDream key={d.id} dream={d} categories={categories} />
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-2.5 ring-1 ring-[rgba(107,33,217,0.14)] shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-violet-700/70">{label}</p>
      <p className="mt-0.5 text-base font-bold text-foreground">{value}</p>
    </div>
  );
}

function DreamPreview({ dream, topCat, categories }: { dream: Dream | null; topCat: DreamCategory | null; categories: DreamCategory[] }) {
  if (!dream) {
    return (
      <div className="mt-4 rounded-2xl bg-white p-4 text-center text-sm text-violet-700/70 ring-1 ring-[rgba(107,33,217,0.14)]">
        Todavía no hay sueños en este lugar.
        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-violet-700">
          <Sparkles className="h-3 w-3" /> Sé el primero
        </div>
      </div>
    );
  }
  const cat = categories.find((c) => c.id === dream.category_id) ?? topCat;
  return (
    <div className="mt-4 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-50 p-4 ring-1 ring-violet-300/40">
      <p className="text-[13px] leading-relaxed text-foreground">"{dream.body}"</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-violet-700">
        {cat && <CategoryChip category={cat} />}
        {dream.author_name && <span className="text-violet-700/80">@{dream.author_name}</span>}
      </div>
    </div>
  );
}

function MiniDream({ dream, categories }: { dream: Dream; categories: DreamCategory[] }) {
  const cat = categories.find((c) => c.id === dream.category_id);
  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-[rgba(107,33,217,0.10)]">
      <p className="line-clamp-2 text-[12px] text-foreground">{dream.body}</p>
      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-violet-700/70">
        {cat && <span>{cat.emoji} {cat.name}</span>}
        {dream.author_name && <span>· @{dream.author_name}</span>}
      </div>
    </div>
  );
}
